/**
 * Basic PAC File - Simple Proxy Configuration
 *
 * Rules:
 * - Internal domains (*.example.com, *.internal) → Use corporate proxy
 * - Everything else → Direct connection
 */

function FindProxyForURL(url, host) {
    // Check if host is an internal domain
    if (shExpMatch(host, "*.example.com") ||
        shExpMatch(host, "api.*.com") ||
        shExpMatch(host, "google.com") ||
        shExpMatch(host, "*.internal") ||
        host == "localhost" ||
        host == "127.0.0.1") {
        return "PROXY 192.168.1.127:8080";
    }

    // Blackhols
    if (shExpMatch(host, "intercom.com") ||
        shExpMatch(host, "intercom.io")) {
        return "PROXY 255.255.255.255:1000";
    }

    // Default: direct connection
    return "DIRECT";
}
