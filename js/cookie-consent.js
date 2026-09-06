/* ==========================================================
   WEBZONEBW — Cookie Consent Banner v3.0
   ----------------------------------------------------------
   GDPR / ePrivacy / Google Consent Mode v2 compliance.
   Uses WebZoneCookie utility for namespaced storage.
   Features: Accept All / Decline All / Manage Preferences
             with granular category toggles.
   ----------------------------------------------------------
   CONSENT CATEGORIES
     necessary   — Always on (site functionality)
     analytics   — GA4, traffic analysis
     advertising — Google AdSense, personalized ads
   ----------------------------------------------------------
   DEPENDS ON
     js/cookie-utils.js  (WebZoneCookie API)
   ========================================================== */

(function () {
    "use strict";

    /* ----------------------------------------------------------
       CONFIGURATION
       ---------------------------------------------------------- */

    var CONSENT_VERSION   = 2;       // bump to re-prompt users
    var EXPIRY_DAYS       = 365;
    var BANNER_ID         = "webzonebw-cookie-banner";
    var BACKDROP_ID       = "webzonebw-cookie-backdrop";
    var STYLE_ID          = "webzonebw-cookie-style";
    var TRIGGER_ID        = "webzonebw-cookie-settings";

    /* Default consent state (all non-essential denied). */
    var DEFAULT_CATEGORIES = {
        necessary:   true,
        analytics:   false,
        advertising: false
    };

    /* ----------------------------------------------------------
       COOKIE HELPERS (via WebZoneCookie or fallback)
       ---------------------------------------------------------- */

    var CK = window.WebZoneCookie;

    function cookieGet(key) {
        if (CK) return CK.getNS("consent", key);
        var m = document.cookie.match(
            new RegExp("(^| )webzonebw_consent_" + key + "=([^;]+)")
        );
        return m ? decodeURIComponent(m[2]) : null;
    }

    function cookieSet(key, value) {
        if (CK) {
            CK.setNS("consent", key, value, { days: EXPIRY_DAYS });
        } else {
            var d = new Date();
            d.setTime(d.getTime() + EXPIRY_DAYS * 864e5);
            document.cookie =
                "webzonebw_consent_" + key + "=" +
                encodeURIComponent(value) +
                ";expires=" + d.toUTCString() +
                ";path=/;SameSite=Lax";
        }
    }

    /* ----------------------------------------------------------
       CONSENT STATE
       ---------------------------------------------------------- */

    function getCategories() {
        var raw = cookieGet("categories");
        if (!raw) return null;
        try { return JSON.parse(raw); } catch (e) { return null; }
    }

    function setCategories(cats) {
        cookieSet("categories", JSON.stringify(cats));
        cookieSet("version", String(CONSENT_VERSION));
    }

    function getConsentStatus() {
        return cookieGet("status");
    }

    function hasConsent() {
        return getConsentStatus() !== null;
    }

    function getCurrentCategories() {
        var cats = getCategories();
        if (cats) return cats;
        return {
            necessary:   true,
            analytics:   false,
            advertising: false
        };
    }

    /* ----------------------------------------------------------
       GOOGLE CONSENT MODE v2
       ----------------------------------------------------------
       Must be called before gtag.js loads to prevent tracking
       before consent. On subsequent page loads with stored
       consent, this ensures the correct state is restored.
       ---------------------------------------------------------- */

    function applyConsentMode(defaults) {
        if (typeof window.gtag !== "function") return;

        window.gtag("consent", "default", {
            analytics_storage:   defaults.analytics   ? "granted" : "denied",
            ad_storage:         defaults.advertising ? "granted" : "denied",
            ad_user_data:       defaults.advertising ? "granted" : "denied",
            ad_personalization: defaults.advertising ? "granted" : "denied",
            wait_for_update: 500
        });
    }

    function updateConsentMode(cats) {
        if (typeof window.gtag !== "function") return;

        window.gtag("consent", "update", {
            analytics_storage:   cats.analytics   ? "granted" : "denied",
            ad_storage:         cats.advertising ? "granted" : "denied",
            ad_user_data:       cats.advertising ? "granted" : "denied",
            ad_personalization: cats.advertising ? "granted" : "denied"
        });
    }

    /**
     * Initialize Consent Mode v2 defaults.
     * Call this ASAP (before gtag loads).
     * If consent already stored, apply stored preferences
     * and fire the event so scripts can react.
     */
    function initConsentMode() {
        var cats = getCurrentCategories();

        /* Apply Google Consent Mode defaults. */
        applyConsentMode(cats);

        /* If consent was already given on a previous visit,
           update Consent Mode immediately and fire the event
           so scripts (AdSense, Analytics) can initialise. */
        if (hasConsent()) {
            updateConsentMode(cats);
            fireConsentEvent(getConsentStatus(), cats);
        }
    }

    /* ----------------------------------------------------------
       CONSENT ACTIONS
       ---------------------------------------------------------- */

    function acceptAll() {
        var cats = {
            necessary:   true,
            analytics:   true,
            advertising: true
        };
        saveConsent("accepted", cats);
    }

    function declineAll() {
        var cats = {
            necessary:   true,
            analytics:   false,
            advertising: false
        };
        saveConsent("declined", cats);
    }

    function savePreferences(cats) {
        var hasAny = cats.analytics || cats.advertising;
        var status = hasAny ? "custom" : "declined";
        saveConsent(status, cats);
    }

    function saveConsent(status, cats) {
        setCategories(cats);
        cookieSet("status", status);
        dismissBanner();
        updateConsentMode(cats);
        fireConsentEvent(status, cats);
    }

    function fireConsentEvent(status, categories) {
        try {
            window.dispatchEvent(
                new CustomEvent("webzonebw:cookie-consent", {
                    detail: {
                        status:     status,
                        categories: categories,
                        timestamp:  Date.now()
                    }
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
        var currentCats = getCurrentCategories();

        /* --- Backdrop (dismiss only, NOT accept — GDPR) --- */
        var backdrop = document.createElement("div");
        backdrop.id = BACKDROP_ID;
        backdrop.setAttribute("aria-hidden", "true");
        backdrop.style.cursor = "pointer";
        backdrop.addEventListener("click", function () {
            dismissBanner();
        });

        /* --- Banner --- */
        var banner = document.createElement("div");
        banner.id = BANNER_ID;
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-label", "Cookie Consent");
        banner.setAttribute("aria-live", "polite");

        var inner = document.createElement("div");
        inner.className = "wbc-inner";

        /* Close button */
        var btnClose = document.createElement("button");
        btnClose.className = "wbc-close";
        btnClose.setAttribute("aria-label", "Close cookie banner");
        btnClose.innerHTML = "&times;";
        btnClose.onclick = function () { dismissBanner(); };

        /* Icon */
        var icon = document.createElement("span");
        icon.className = "wbc-icon";
        icon.innerHTML = "&#127850;";
        icon.setAttribute("aria-hidden", "true");

        /* Text block */
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

        /* Action buttons */
        var actions = document.createElement("div");
        actions.className = "wbc-actions";

        var btnDecline = document.createElement("button");
        btnDecline.className = "wbc-btn wbc-btn-decline";
        btnDecline.textContent = "Decline All";
        btnDecline.setAttribute("aria-label", "Decline all non-essential cookies");
        btnDecline.onclick = declineAll;

        var btnManage = document.createElement("button");
        btnManage.className = "wbc-btn wbc-btn-manage";
        btnManage.textContent = "Manage";
        btnManage.setAttribute("aria-label", "Manage cookie preferences");
        btnManage.onclick = function () {
            showPreferencesPanel(inner, currentCats);
        };

        var btnAccept = document.createElement("button");
        btnAccept.className = "wbc-btn wbc-btn-accept";
        btnAccept.textContent = "Accept All";
        btnAccept.setAttribute("aria-label", "Accept all cookies");
        btnAccept.onclick = acceptAll;

        actions.appendChild(btnDecline);
        actions.appendChild(btnManage);
        actions.appendChild(btnAccept);

        inner.appendChild(btnClose);
        inner.appendChild(icon);
        inner.appendChild(textBlock);
        inner.appendChild(actions);
        banner.appendChild(inner);

        document.head.appendChild(getStyles());
        document.body.appendChild(banner);
        document.body.appendChild(backdrop);

        setTimeout(function () { btnAccept.focus(); }, 500);
    }

    /* ----------------------------------------------------------
       MANAGE PREFERENCES PANEL
       ---------------------------------------------------------- */

    function showPreferencesPanel(inner, currentCats) {
        /* Replace inner content with preferences UI */
        inner.innerHTML = "";

        /* Header row */
        var header = document.createElement("div");
        header.className = "wbc-prefs-header";

        var title = document.createElement("p");
        title.className = "wbc-heading";
        title.textContent = "Cookie Preferences";

        var btnClose = document.createElement("button");
        btnClose.className = "wbc-close";
        btnClose.setAttribute("aria-label", "Close cookie preferences");
        btnClose.innerHTML = "&times;";
        btnClose.onclick = function () { dismissBanner(); };

        header.appendChild(title);
        header.appendChild(btnClose);

        /* Categories list */
        var list = document.createElement("div");
        list.className = "wbc-prefs-list";

        var categories = [
            {
                key:         "necessary",
                label:       "Necessary",
                description: "Required for the website to function. Cannot be disabled.",
                disabled:    true
            },
            {
                key:         "analytics",
                label:       "Analytics",
                description: "Help us understand how visitors interact with the site (Google Analytics).",
                disabled:    false
            },
            {
                key:         "advertising",
                label:       "Advertising",
                description: "Used to deliver personalized advertisements (Google AdSense).",
                disabled:    false
            }
        ];

        var toggles = {};

        categories.forEach(function (cat) {
            var row = document.createElement("div");
            row.className = "wbc-prefs-row";

            var info = document.createElement("div");
            info.className = "wbc-prefs-info";

            var label = document.createElement("span");
            label.className = "wbc-prefs-label";
            label.textContent = cat.label;

            var desc = document.createElement("span");
            desc.className = "wbc-prefs-desc";
            desc.textContent = cat.description;

            info.appendChild(label);
            info.appendChild(desc);

            var toggle = document.createElement("label");
            toggle.className = "wbc-toggle";
            toggle.setAttribute("aria-label", "Toggle " + cat.label + " cookies");

            var input = document.createElement("input");
            input.type = "checkbox";
            input.checked = currentCats[cat.key] === true;
            input.disabled = cat.disabled;
            if (cat.disabled) {
                input.setAttribute("aria-disabled", "true");
            }

            var slider = document.createElement("span");
            slider.className = "wbc-toggle-slider";

            toggle.appendChild(input);
            toggle.appendChild(slider);

            row.appendChild(info);
            row.appendChild(toggle);
            list.appendChild(row);

            toggles[cat.key] = input;
        });

        /* Save button */
        var actions = document.createElement("div");
        actions.className = "wbc-actions wbc-prefs-actions";

        var btnBack = document.createElement("button");
        btnBack.className = "wbc-btn wbc-btn-decline";
        btnBack.textContent = "Back";
        btnBack.setAttribute("aria-label", "Go back to main consent banner");
        btnBack.onclick = function () {
            showBanner();
        };

        var btnSave = document.createElement("button");
        btnSave.className = "wbc-btn wbc-btn-accept";
        btnSave.textContent = "Save Preferences";
        btnSave.setAttribute("aria-label", "Save cookie preferences");
        btnSave.onclick = function () {
            var cats = {
                necessary:   true,
                analytics:   toggles.analytics.checked,
                advertising: toggles.advertising.checked
            };
            savePreferences(cats);
        };

        actions.appendChild(btnBack);
        actions.appendChild(btnSave);

        inner.appendChild(header);
        inner.appendChild(list);
        inner.appendChild(actions);

        setTimeout(function () { btnSave.focus(); }, 100);
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
            /* Animations */
            "@keyframes wbcSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }",
            "@keyframes wbcFadeOut { from{opacity:1} to{opacity:0;transform:translateY(20px)} }",
            "@keyframes wbcBackdropIn { from{opacity:0} to{opacity:1} }",

            /* Backdrop */
            "#" + BACKDROP_ID + "{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:wbcBackdropIn .3s ease-out}",

            /* Banner */
            "#" + BANNER_ID + "{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0c1222;border-top:1px solid rgba(56,189,248,0.15);box-shadow:0 -12px 48px rgba(0,0,0,0.6),0 -2px 8px rgba(56,189,248,0.05);animation:wbcSlideUp .45s cubic-bezier(.16,1,.3,1);font-family:system-ui,-apple-system,'Segoe UI',sans-serif;padding:0}",
            "#" + BANNER_ID + ".wbc-dismissing{animation:wbcFadeOut .35s ease-in forwards}",

            /* Inner layout */
            ".wbc-inner{max-width:960px;margin:0 auto;display:flex;align-items:center;gap:16px;padding:18px 24px;position:relative}",

            /* Close button */
            ".wbc-close{position:absolute;top:10px;right:14px;background:none;border:none;color:#64748b;font-size:22px;line-height:1;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .2s,background .2s}",
            ".wbc-close:hover,.wbc-close:focus-visible{color:#e2e8f0;background:rgba(255,255,255,0.08);outline:none}",

            /* Icon */
            ".wbc-icon{font-size:28px;flex-shrink:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:rgba(56,189,248,0.08);border-radius:12px}",

            /* Text */
            ".wbc-text{flex:1;min-width:200px}",
            ".wbc-heading{margin:0 0 4px;font-size:14px;font-weight:700;color:#f1f5f9;letter-spacing:.01em}",
            ".wbc-desc{margin:0;font-size:13px;line-height:1.6;color:#94a3b8}",
            ".wbc-desc a{color:#38bdf8;text-decoration:underline;text-underline-offset:2px;transition:color .2s}",
            ".wbc-desc a:hover{color:#7dd3fc}",

            /* Action buttons */
            ".wbc-actions{display:flex;gap:10px;flex-shrink:0}",
            ".wbc-btn{padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:all .2s ease;white-space:nowrap}",
            ".wbc-btn:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}",
            ".wbc-btn-decline{background:rgba(255,255,255,0.04);color:#94a3b8;border-color:rgba(255,255,255,0.1)}",
            ".wbc-btn-decline:hover{background:rgba(255,255,255,0.08);color:#cbd5e1;border-color:rgba(255,255,255,0.15)}",
            ".wbc-btn-manage{background:rgba(56,189,248,0.08);color:#38bdf8;border-color:rgba(56,189,248,0.2)}",
            ".wbc-btn-manage:hover{background:rgba(56,189,248,0.14);color:#7dd3fc;border-color:rgba(56,189,248,0.3)}",
            ".wbc-btn-accept{background:linear-gradient(135deg,#38bdf8,#0ea5e9);color:#030712;border-color:transparent;font-weight:700;box-shadow:0 2px 12px rgba(56,189,248,0.25)}",
            ".wbc-btn-accept:hover{background:linear-gradient(135deg,#7dd3fc,#38bdf8);box-shadow:0 4px 20px rgba(56,189,248,0.35);transform:translateY(-1px)}",
            ".wbc-btn-accept:active{transform:translateY(0);box-shadow:0 1px 6px rgba(56,189,248,0.2)}",

            /* Preferences panel */
            ".wbc-prefs-header{display:flex;align-items:center;justify-content:space-between;width:100%}",
            ".wbc-prefs-header .wbc-heading{margin:0}",
            ".wbc-prefs-list{width:100%;display:flex;flex-direction:column;gap:0;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);padding:4px 0;margin:10px 0}",
            ".wbc-prefs-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0}",
            ".wbc-prefs-row+.wbc-prefs-row{border-top:1px solid rgba(255,255,255,0.04)}",
            ".wbc-prefs-info{flex:1;min-width:0}",
            ".wbc-prefs-label{display:block;font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:2px}",
            ".wbc-prefs-desc{display:block;font-size:12px;line-height:1.5;color:#64748b}",

            /* Toggle switch */
            ".wbc-toggle{position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0}",
            ".wbc-toggle input{opacity:0;width:0;height:0;position:absolute}",
            ".wbc-toggle-slider{position:absolute;cursor:pointer;inset:0;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:22px;transition:all .25s ease}",
            ".wbc-toggle-slider:before{content:'';position:absolute;width:16px;height:16px;left:2px;bottom:2px;background:#64748b;border-radius:50%;transition:all .25s ease}",
            ".wbc-toggle input:checked+.wbc-toggle-slider{background:rgba(56,189,248,0.2);border-color:rgba(56,189,248,0.4)}",
            ".wbc-toggle input:checked+.wbc-toggle-slider:before{transform:translateX(18px);background:#38bdf8}",
            ".wbc-toggle input:disabled+.wbc-toggle-slider{opacity:0.45;cursor:not-allowed}",
            ".wbc-toggle input:focus-visible+.wbc-toggle-slider{outline:2px solid #38bdf8;outline-offset:2px}",
            ".wbc-prefs-actions{margin-top:6px}",

            /* ---------- Light mode ---------- */
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
            "body.light-mode .wbc-btn-manage{background:rgba(2,132,199,0.06);color:#0284c7;border-color:rgba(2,132,199,0.15)}",
            "body.light-mode .wbc-btn-manage:hover{background:rgba(2,132,199,0.1);color:#0369a1;border-color:rgba(2,132,199,0.25)}",
            "body.light-mode .wbc-btn-accept{background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;box-shadow:0 2px 12px rgba(2,132,199,0.25)}",
            "body.light-mode .wbc-btn-accept:hover{background:linear-gradient(135deg,#0369a1,#075985);box-shadow:0 4px 20px rgba(2,132,199,0.35)}",
            "body.light-mode .wbc-prefs-list{border-color:rgba(0,0,0,0.06)}",
            "body.light-mode .wbc-prefs-row+.wbc-prefs-row{border-color:rgba(0,0,0,0.04)}",
            "body.light-mode .wbc-prefs-label{color:#1e293b}",
            "body.light-mode .wbc-prefs-desc{color:#64748b}",
            "body.light-mode .wbc-toggle-slider{background:#e2e8f0;border-color:#cbd5e1}",
            "body.light-mode .wbc-toggle-slider:before{background:#94a3b8}",
            "body.light-mode .wbc-toggle input:checked+.wbc-toggle-slider{background:rgba(2,132,199,0.15);border-color:rgba(2,132,199,0.35)}",
            "body.light-mode .wbc-toggle input:checked+.wbc-toggle-slider:before{background:#0284c7}",

            /* ---------- Mobile ---------- */
            "@media(max-width:640px){.wbc-inner{flex-direction:column;align-items:stretch;gap:14px;padding:16px 18px 18px}.wbc-close{top:8px;right:10px}.wbc-icon{display:none}.wbc-heading{font-size:13.5px}.wbc-desc{font-size:12.5px}.wbc-actions{width:100%}.wbc-btn{flex:1;padding:12px 16px;text-align:center}.wbc-prefs-row{flex-wrap:wrap;gap:8px}.wbc-prefs-desc{font-size:11.5px}}",
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
        /* 1. Apply Consent Mode v2 defaults BEFORE anything else.
              If consent is already stored, this sets the correct
              granted/denied state immediately so GA4 / AdSense
              respect it from the first pageview. */
        initConsentMode();

        /* 2. Show banner only if no consent recorded yet. */
        if (!hasConsent()) {
            showBanner();
        }

        /* 3. Bind the footer "Cookie Settings" link & keyboard. */
        bindTrigger();
        bindKeyboard();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
