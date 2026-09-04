/* ==========================================================
   WEBZONEBW — Cookie Consent Banner v2.1
   ----------------------------------------------------------
   GDPR / ePrivacy compliance for AdSense approval.
   Uses WebZoneCookie utility for namespaced storage.
   Features: Accept / Decline / Manage / Re-open from footer
   ========================================================== */

(function () {
    "use strict";

    /* ----------------------------------------------------------
       CONFIGURATION
       ---------------------------------------------------------- */

    var CONSENT_KEY       = "consent";   // namespace component
    var CONSENT_VALUE_OK  = "accepted";
    var CONSENT_VALUE_NO  = "declined";
    var EXPIRY_DAYS       = 365;
    var BANNER_ID         = "webzonebw-cookie-banner";
    var BACKDROP_ID       = "webzonebw-cookie-backdrop";
    var STYLE_ID          = "webzonebw-cookie-style";
    var TRIGGER_ID        = "webzonebw-cookie-settings";

    /* ----------------------------------------------------------
       COOKIE HELPERS (via WebZoneCookie or fallback)
       ---------------------------------------------------------- */

    var CK = window.WebZoneCookie;

    function getConsent() {
        if (CK) return CK.getNS("consent", "status");
        /* fallback: raw cookie */
        var m = document.cookie.match(/(^| )webzonebw_consent_status=([^;]+)/);
        return m ? decodeURIComponent(m[2]) : null;
    }

    function setConsent(value) {
        if (CK) {
            CK.setNS("consent", "status", value, { days: EXPIRY_DAYS });
        } else {
            var d = new Date();
            d.setTime(d.getTime() + EXPIRY_DAYS * 864e5);
            document.cookie =
                "webzonebw_consent_status=" + encodeURIComponent(value) +
                ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
        }
    }

    function hasConsent() {
        return getConsent() !== null;
    }

    /* ----------------------------------------------------------
       CONSENT ACTIONS
       ---------------------------------------------------------- */

    function acceptCookies() {
        setConsent(CONSENT_VALUE_OK);
        dismissBanner();
        fireConsentEvent(CONSENT_VALUE_OK);
    }

    function declineCookies() {
        setConsent(CONSENT_VALUE_NO);
        dismissBanner();
        fireConsentEvent(CONSENT_VALUE_NO);
    }

    function fireConsentEvent(status) {
        try {
            window.dispatchEvent(
                new CustomEvent("webzonebw:cookie-consent", {
                    detail: { status: status, timestamp: Date.now() }
                })
            );
        } catch (e) { /* silent */ }
    }

    /* ----------------------------------------------------------
       BANNER LIFECYCLE
       ---------------------------------------------------------- */

    function dismissBanner() {
        var banner = document.getElementById(BANNER_ID);
        var backdrop = document.getElementById(BACKDROP_ID);
        if (banner) {
            banner.classList.add("wbc-dismissing");
            setTimeout(function () {
                if (banner.parentNode) banner.parentNode.removeChild(banner);
                if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
            }, 350);
        }
    }

    function removeExistingBanner() {
        var old = document.getElementById(BANNER_ID);
        var oldBack = document.getElementById(BACKDROP_ID);
        if (old && old.parentNode) old.parentNode.removeChild(old);
        if (oldBack && oldBack.parentNode) oldBack.parentNode.removeChild(oldBack);
    }

    function showBanner() {
        removeExistingBanner();

        var backdrop = document.createElement("div");
        backdrop.id = BACKDROP_ID;
        backdrop.setAttribute("aria-hidden", "true");

        var banner = document.createElement("div");
        banner.id = BANNER_ID;
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-label", "Cookie Consent");
        banner.setAttribute("aria-live", "polite");

        var inner = document.createElement("div");
        inner.className = "wbc-inner";

        var btnClose = document.createElement("button");
        btnClose.className = "wbc-close";
        btnClose.setAttribute("aria-label", "Close cookie banner");
        btnClose.innerHTML = "&times;";
        btnClose.onclick = function () { dismissBanner(); };

        var icon = document.createElement("span");
        icon.className = "wbc-icon";
        icon.innerHTML = "&#127850;";
        icon.setAttribute("aria-hidden", "true");

        var textBlock = document.createElement("div");
        textBlock.className = "wbc-text";

        var heading = document.createElement("p");
        heading.className = "wbc-heading";
        heading.textContent = "We value your privacy";

        var desc = document.createElement("p");
        desc.className = "wbc-desc";
        desc.innerHTML =
            "This website uses cookies to deliver content, analyze traffic, " +
            "and improve your experience. Third-party services (including " +
            "Google AdSense) may also use cookies. Read our " +
            '<a href="privacy.html">Privacy Policy</a> for details.';

        textBlock.appendChild(heading);
        textBlock.appendChild(desc);

        var actions = document.createElement("div");
        actions.className = "wbc-actions";

        var btnDecline = document.createElement("button");
        btnDecline.className = "wbc-btn wbc-btn-decline";
        btnDecline.textContent = "Decline";
        btnDecline.setAttribute("aria-label", "Decline non-essential cookies");
        btnDecline.onclick = declineCookies;

        var btnAccept = document.createElement("button");
        btnAccept.className = "wbc-btn wbc-btn-accept";
        btnAccept.textContent = "Accept All";
        btnAccept.setAttribute("aria-label", "Accept all cookies");
        btnAccept.onclick = acceptCookies;

        actions.appendChild(btnDecline);
        actions.appendChild(btnAccept);

        inner.appendChild(btnClose);
        inner.appendChild(icon);
        inner.appendChild(textBlock);
        inner.appendChild(actions);
        banner.appendChild(inner);

        document.head.appendChild(getStyles());
        document.body.appendChild(backdrop);
        document.body.appendChild(banner);

        setTimeout(function () { btnAccept.focus(); }, 500);
    }

    /* ----------------------------------------------------------
       STYLES (injected once)
       ---------------------------------------------------------- */

    function getStyles() {
        if (document.getElementById(STYLE_ID)) {
            return document.getElementById(STYLE_ID);
        }
        var style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = [
            "@keyframes wbcSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }",
            "@keyframes wbcFadeOut { from{opacity:1} to{opacity:0;transform:translateY(20px)} }",
            "@keyframes wbcBackdropIn { from{opacity:0} to{opacity:1} }",
            "#" + BACKDROP_ID + "{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:wbcBackdropIn .3s ease-out}",
            "#" + BANNER_ID + "{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0c1222;border-top:1px solid rgba(56,189,248,0.15);box-shadow:0 -12px 48px rgba(0,0,0,0.6),0 -2px 8px rgba(56,189,248,0.05);animation:wbcSlideUp .45s cubic-bezier(.16,1,.3,1);font-family:system-ui,-apple-system,'Segoe UI',sans-serif;padding:0}",
            "#" + BANNER_ID + ".wbc-dismissing{animation:wbcFadeOut .35s ease-in forwards}",
            ".wbc-inner{max-width:960px;margin:0 auto;display:flex;align-items:center;gap:16px;padding:18px 24px;position:relative}",
            ".wbc-close{position:absolute;top:10px;right:14px;background:none;border:none;color:#64748b;font-size:22px;line-height:1;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .2s,background .2s}",
            ".wbc-close:hover,.wbc-close:focus-visible{color:#e2e8f0;background:rgba(255,255,255,0.08);outline:none}",
            ".wbc-icon{font-size:28px;flex-shrink:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:rgba(56,189,248,0.08);border-radius:12px}",
            ".wbc-text{flex:1;min-width:200px}",
            ".wbc-heading{margin:0 0 4px;font-size:14px;font-weight:700;color:#f1f5f9;letter-spacing:.01em}",
            ".wbc-desc{margin:0;font-size:13px;line-height:1.6;color:#94a3b8}",
            ".wbc-desc a{color:#38bdf8;text-decoration:underline;text-underline-offset:2px;transition:color .2s}",
            ".wbc-desc a:hover{color:#7dd3fc}",
            ".wbc-actions{display:flex;gap:10px;flex-shrink:0}",
            ".wbc-btn{padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:all .2s ease;white-space:nowrap}",
            ".wbc-btn:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}",
            ".wbc-btn-decline{background:rgba(255,255,255,0.04);color:#94a3b8;border-color:rgba(255,255,255,0.1)}",
            ".wbc-btn-decline:hover{background:rgba(255,255,255,0.08);color:#cbd5e1;border-color:rgba(255,255,255,0.15)}",
            ".wbc-btn-accept{background:linear-gradient(135deg,#38bdf8,#0ea5e9);color:#030712;border-color:transparent;font-weight:700;box-shadow:0 2px 12px rgba(56,189,248,0.25)}",
            ".wbc-btn-accept:hover{background:linear-gradient(135deg,#7dd3fc,#38bdf8);box-shadow:0 4px 20px rgba(56,189,248,0.35);transform:translateY(-1px)}",
            ".wbc-btn-accept:active{transform:translateY(0);box-shadow:0 1px 6px rgba(56,189,248,0.2)}",
            "body.light-mode #" + BANNER_ID + "{background:#fff;border-top-color:#e2e8f0;box-shadow:0 -12px 48px rgba(0,0,0,0.1),0 -2px 8px rgba(0,0,0,0.05)}",
            "body.light-mode .wbc-heading{color:#0f172a}",
            "body.light-mode .wbc-desc{color:#475569}",
            "body.light-mode .wbc-desc a{color:#0284c7}",
            "body.light-mode .wbc-desc a:hover{color:#0369a1}",
            "body.light-mode .wbc-close{color:#94a3b8}",
            "body.light-mode .wbc-close:hover{color:#334155;background:rgba(0,0,0,0.05)}",
            "body.light-mode .wbc-icon{background:rgba(2,132,199,0.08)}",
            "body.light-mode .wbc-btn-decline{background:#f1f5f9;color:#475569;border-color:#e2e8f0}",
            "body.light-mode .wbc-btn-decline:hover{background:#e2e8f0;color:#334155}",
            "body.light-mode .wbc-btn-accept{background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;box-shadow:0 2px 12px rgba(2,132,199,0.25)}",
            "body.light-mode .wbc-btn-accept:hover{background:linear-gradient(135deg,#0369a1,#075985);box-shadow:0 4px 20px rgba(2,132,199,0.35)}",
            "@media(max-width:640px){.wbc-inner{flex-direction:column;align-items:stretch;gap:14px;padding:16px 18px 18px}.wbc-close{top:8px;right:10px}.wbc-icon{display:none}.wbc-heading{font-size:13.5px}.wbc-desc{font-size:12.5px}.wbc-actions{width:100%}.wbc-btn{flex:1;padding:12px 16px;text-align:center}}",
            "@media(max-width:380px){.wbc-inner{padding:14px 14px 16px}.wbc-btn{font-size:12.5px;padding:11px 12px}}"
        ].join("\n");
        return style;
    }

    /* ----------------------------------------------------------
       FOOTER TRIGGER + KEYBOARD
       ---------------------------------------------------------- */

    function bindTrigger() {
        var trigger = document.getElementById(TRIGGER_ID);
        if (trigger) {
            trigger.addEventListener("click", function (e) {
                e.preventDefault();
                showBanner();
            });
        }
        var reopenLinks = document.getElementsByClassName("wbc-reopen");
        for (var i = 0; i < reopenLinks.length; i++) {
            reopenLinks[i].addEventListener("click", function (e) {
                e.preventDefault();
                showBanner();
            });
        }
    }

    function bindKeyboard() {
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" || e.keyCode === 27) {
                var banner = document.getElementById(BANNER_ID);
                if (banner) dismissBanner();
            }
        });
    }

    /* ----------------------------------------------------------
       INIT
       ---------------------------------------------------------- */

    function init() {
        if (!hasConsent()) {
            showBanner();
        }
        bindTrigger();
        bindKeyboard();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
