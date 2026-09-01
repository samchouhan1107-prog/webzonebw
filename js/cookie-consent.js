/* ==========================================================
   WEBZONEBW — Cookie Consent Banner
   GDPR / ePrivacy compliance for AdSense approval
   ========================================================== */

(function () {
    "use strict";

    var COOKIE_KEY = "webzonebw_cookie_consent";
    var COOKIE_EXPIRY_DAYS = 365;

    function getCookie(name) {
        var match = document.cookie.match(
            new RegExp("(^| )" + name + "=([^;]+)")
        );
        return match ? decodeURIComponent(match[2]) : null;
    }

    function setCookie(name, value, days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie =
            name + "=" + encodeURIComponent(value) +
            ";expires=" + date.toUTCString() +
            ";path=/;SameSite=Lax";
    }

    function hasConsent() {
        return getCookie(COOKIE_KEY) !== null;
    }

    function acceptCookies() {
        setCookie(COOKIE_KEY, "accepted", COOKIE_EXPIRY_DAYS);
        hideBanner();
    }

    function declineCookies() {
        setCookie(COOKIE_KEY, "declined", COOKIE_EXPIRY_DAYS);
        hideBanner();
    }

    function hideBanner() {
        var banner = document.getElementById("webzonebw-cookie-banner");
        if (banner) {
            banner.style.display = "none";
        }
    }

    function showBanner() {
        if (hasConsent()) return;

        var existing = document.getElementById("webzonebw-cookie-banner");
        if (existing) return;

        var backdrop = document.createElement("div");
        backdrop.id = "webzonebw-cookie-backdrop";
        backdrop.setAttribute("aria-hidden", "true");
        backdrop.style.cssText =
            "position:fixed;inset:0;z-index:9998;" +
            "background:rgba(0,0,0,0.0);pointer-events:none;";

        var banner = document.createElement("div");
        banner.id = "webzonebw-cookie-banner";
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-label", "Cookie Consent");
        banner.setAttribute("aria-live", "polite");
        banner.style.cssText =
            "position:fixed;bottom:calc(78px + env(safe-area-inset-bottom));left:0;right:0;z-index:9999;" +
            "background:#0f172a;border-top:1px solid #1e293b;" +
            "box-shadow:0 -8px 32px rgba(0,0,0,0.5);" +
            "padding:16px 20px;" +
            "font-family:system-ui,-apple-system,sans-serif;" +
            "animation:cookieSlideUp 0.4s ease-out;";

        var container = document.createElement("div");
        container.style.cssText =
            "max-width:900px;margin:0 auto;" +
            "display:flex;align-items:center;gap:16px;flex-wrap:wrap;";

        var text = document.createElement("p");
        text.style.cssText =
            "flex:1;min-width:240px;margin:0;" +
            "font-size:13.5px;line-height:1.55;color:#cbd5e1;";
        text.innerHTML =
            "This website uses cookies and similar technologies to " +
            "deliver content, analyze traffic, and improve your experience. " +
            "By continuing to use this site, you agree to our " +
            '<a href="privacy.html" style="color:#38bdf8;text-decoration:underline;">Privacy Policy</a>. ' +
            "Third-party advertising services (Google AdSense) may also use cookies " +
            "in accordance with their own policies.";

        var actions = document.createElement("div");
        actions.style.cssText =
            "display:flex;gap:10px;flex-shrink:0;";

        var btnDecline = document.createElement("button");
        btnDecline.textContent = "Decline";
        btnDecline.setAttribute("aria-label", "Decline non-essential cookies");
        btnDecline.style.cssText =
            "padding:10px 20px;border-radius:8px;" +
            "background:#1e293b;color:#94a3b8;" +
            "border:1px solid #334155;cursor:pointer;" +
            "font-size:13px;font-weight:600;" +
            "transition:all 0.2s ease;";
        btnDecline.onmouseover = function () {
            btnDecline.style.background = "#334155";
        };
        btnDecline.onmouseout = function () {
            btnDecline.style.background = "#1e293b";
        };
        btnDecline.onclick = declineCookies;

        var btnAccept = document.createElement("button");
        btnAccept.textContent = "Accept All";
        btnAccept.setAttribute("aria-label", "Accept all cookies");
        btnAccept.style.cssText =
            "padding:10px 20px;border-radius:8px;" +
            "background:#38bdf8;color:#030712;" +
            "border:1px solid #38bdf8;cursor:pointer;" +
            "font-size:13px;font-weight:700;" +
            "transition:all 0.2s ease;";
        btnAccept.onmouseover = function () {
            btnAccept.style.background = "#7dd3fc";
        };
        btnAccept.onmouseout = function () {
            btnAccept.style.background = "#38bdf8";
        };
        btnAccept.onclick = acceptCookies;

        actions.appendChild(btnDecline);
        actions.appendChild(btnAccept);
        container.appendChild(text);
        container.appendChild(actions);
        banner.appendChild(container);

        var style = document.createElement("style");
        style.textContent =
            "@keyframes cookieSlideUp {" +
            "from{transform:translateY(100%);opacity:0;}" +
            "to{transform:translateY(0);opacity:1;}" +
            "}" +
            "body.light-mode #webzonebw-cookie-banner{" +
            "background:#ffffff !important;" +
            "border-top-color:#e2e8f0 !important;" +
            "box-shadow:0 -8px 32px rgba(0,0,0,0.1) !important;" +
            "}" +
            "body.light-mode #webzonebw-cookie-banner p{" +
            "color:#475569 !important;" +
            "}" +
            "body.light-mode #webzonebw-cookie-banner button:first-of-type{" +
            "background:#f1f5f9 !important;" +
            "color:#475569 !important;" +
            "border-color:#e2e8f0 !important;" +
            "}" +
            "@media(max-width:480px){" +
            "#webzonebw-cookie-banner{padding:12px 14px !important;}" +
            "#webzonebw-cookie-banner p{font-size:12px !important;}" +
            "}";

        document.head.appendChild(style);
        document.body.appendChild(backdrop);
        document.body.appendChild(banner);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", showBanner, { once: true });
    } else {
        showBanner();
    }
})();
