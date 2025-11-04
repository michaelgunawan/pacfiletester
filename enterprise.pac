/**
 * Enterprise PAC File - Production Environment
 *
 * Rules:
 * - Corporate infrastructure (*.corp.com) → Corporate proxy with SSL inspection
 * - Public internet → ISP proxy with fallback
 * - Specific exceptions (CDNs, streaming) → Direct connection
 * - Geographic routing → Different proxies per region
 * - All traffic via main proxy with multiple fallbacks
 */

function FindProxyForURL(url, host) {
    // Time-based proxy selection (different proxies during business hours)
    var now = new Date();
    var hour = now.getHours();
    var isPeakHours = (hour >= 9 && hour <= 17);

    // Corporate infrastructure - always through corporate proxy
    if (dnsDomainIs(host, "corp.com") ||
        shExpMatch(host, "*.corp.com") ||
        shExpMatch(host, "office-*.corp.com")) {
        return "PROXY proxy-ssl.corp.com:3128";
    }

    // CDN and static content - bypass proxy for performance
    if (shExpMatch(host, "cdn.*.com") ||
        shExpMatch(host, "static.*.com") ||
        shExpMatch(host, "cloudfront.*.com") ||
        shExpMatch(host, "akamai.*.com")) {
        return "DIRECT";
    }

    // Streaming and video services
    if (shExpMatch(host, "youtube.com") ||
        shExpMatch(host, "*.youtube.com") ||
        shExpMatch(host, "netflix.com") ||
        shExpMatch(host, "*.netflix.com")) {
        return "DIRECT";
    }

    // Public API endpoints - use main proxy
    if (shExpMatch(host, "api.*.com") ||
        shExpMatch(host, "v*.api.*.com")) {
        if (isPeakHours) {
            return "PROXY proxy-main-1.corp.com:3128; PROXY proxy-main-2.corp.com:3128; " +
                   "PROXY proxy-backup.corp.com:3128; DIRECT";
        } else {
            return "PROXY proxy-main.corp.com:3128; PROXY proxy-backup.corp.com:3128; DIRECT";
        }
    }

    // Localhost and private networks - always direct
    if (host == "localhost" ||
        host == "127.0.0.1" ||
        isInNet(host, "127.0.0.0", "255.255.255.0") ||
        isInNet(host, "10.0.0.0", "255.0.0.0") ||
        isInNet(host, "172.16.0.0", "255.240.0.0") ||
        isInNet(host, "192.168.0.0", "255.255.0.0")) {
        return "DIRECT";
    }

    // Default: use main proxy with automatic fallback
    return "PROXY proxy-main.corp.com:3128; PROXY proxy-backup.corp.com:3128; DIRECT";
}
