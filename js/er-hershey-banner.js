/* ==========================================================
   WEBZONEBW — ER STUDIO
   HERSHEY MOVIE LAUNCH — PROMOTIONAL BANNER CONTROLLER
   ----------------------------------------------------------
   - Banner display name: HERSHEY (movie-launch campaign)
   - Directs users into the native HERSHEY face filter
   - Three looks: HERSHEY MILK / DARK / CARAMEL
   - Countdown shown only when its target date is valid
   - Banner hides after the campaign ends; the HERSHEY lens
     stays available in Face Filters (persisted choice)
   - CLOSE dismisses without interrupting the editing session
   No movie title, date, actor, studio or endorsement is
   invented — dates render only when supplied via config.
   ========================================================== */

(function () {
    "use strict";

    /* ----------------------------------------------------------
       CAMPAIGN CONFIGURATION
       Fill in when the campaign dates are supplied. A null
       start/end means "no campaign window" — the banner then
       behaves as a permanent discoverable promo that can be
       dismissed for the session, and the countdown never shows.
       ---------------------------------------------------------- */
    var CAMPAIGN = {
        /* Official campaign artwork (one-day 5¢ bar event, Nov 25).
         * Path relative to /er/index.html */
        posterImage: "../assets/images/Hershey.png",
        posterAlt: "HERSHEY'S milk chocolate — Grab a bar for just 5¢ each, Nov 25, 1 day only. Limit of 10 per person",
        /* ISO date string or null */
        launchDate: "2026-11-25T00:00:00",
        start: null,
        /* One-day-only event: banner retires after Nov 25 ends */
        end: "2026-11-26T00:00:00",
        /* Keep the HERSHEY lens selectable after the event ends */
        lensRemainsAvailable: true,
        /* localStorage key so CLOSE is remembered per visitor */
        storageKey: "webzonebw-hershey-promo-dismissed",
        /* Venue direction line (as supplied — not an endorsement,
         * simply the promotional venue address) */
        venueLine: "101 Chocolate World Wy, Hershey, PA 17033, USA",
    };

    /* HERSHEY preset → actual registered lens id.
     * Each preset is exposed ONLY if its Studio effect card
     * (configuration + assets) is actually present in the DOM. */
    var LOOKS = [
        { id: "hershey", label: "HERSHEY MILK", hint: "Soft warm chocolate finish" },
        { id: "hershey-dark", label: "HERSHEY DARK", hint: "Deep cocoa cinematic finish" },
        { id: "hershey-caramel", label: "HERSHEY CARAMEL", hint: "Golden caramel glow" },
    ];

    /* Requirement: presets render only when their configurations
     * and rendering assets are available. A look is available when
     * its registered Studio lens card exists. */
    function lensIsAvailable(lensId) {
        return Boolean(
            document.querySelector('.effect-card[data-filter="' + lensId + '"]')
        );
    }

    function availableLooks() {
        return LOOKS.filter(function (look) {
            return lensIsAvailable(look.id);
        });
    }

    function isValidDate(value) {
        return value instanceof Date && !isNaN(value.getTime());
    }

    function parseDate(value) {
        if (!value) return null;
        var d = new Date(value);
        return isValidDate(d) ? d : null;
    }

    function isDismissed() {
        try {
            return localStorage.getItem(CAMPAIGN.storageKey) === "1";
        } catch (e) {
            return false;
        }
    }

    function markDismissed() {
        try {
            localStorage.setItem(CAMPAIGN.storageKey, "1");
        } catch (e) { /* storage unavailable — session-only dismiss */ }
    }

    /* Activate the registered lens through the existing Studio
     * selection workflow (camera/preview pipeline untouched). */
    function activateLens(lensId) {
        var card = document.querySelector(
            '.effect-card[data-filter="' + lensId + '"]'
        );
        if (card) {
            card.click();
            return true;
        }
        return false;
    }

    function buildBanner() {
        var banner = document.createElement("div");
        banner.id = "hersheyPromoBanner";
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-modal", "true");
        banner.setAttribute("aria-label", "HERSHEY Movie Launch Special");

        var poster = document.createElement("div");
        poster.className = "hershey-poster";

        /* Official poster artwork — rendered only when supplied */
        if (CAMPAIGN.posterImage) {
            var art = document.createElement("img");
            art.className = "hershey-poster-art";
            art.src = CAMPAIGN.posterImage;
            art.alt = CAMPAIGN.posterAlt || "HERSHEY campaign artwork";
            art.decoding = "async";
            art.loading = "lazy";
            poster.appendChild(art);
        }

        var kicker = document.createElement("p");
        kicker.className = "hershey-kicker";
        kicker.textContent = "Movie Launch Special";
        poster.appendChild(kicker);

        var title = document.createElement("h2");
        title.className = "hershey-title";
        title.textContent = "HERSHEY";
        poster.appendChild(title);

        var subtitle = document.createElement("p");
        subtitle.className = "hershey-subtitle";
        subtitle.textContent = "THE CHOCOLATE GLOW EXPERIENCE";
        poster.appendChild(subtitle);

        /* Launch date renders ONLY when supplied */
        var launch = parseDate(CAMPAIGN.launchDate);
        if (launch) {
            var dateLine = document.createElement("p");
            dateLine.className = "hershey-launch-date";
            try {
                dateLine.textContent = launch.toLocaleDateString(undefined, {
                    year: "numeric", month: "long", day: "numeric",
                });
            } catch (e) {
                dateLine.textContent = launch.toDateString();
            }
            poster.appendChild(dateLine);
        }

        var desc = document.createElement("p");
        desc.className = "hershey-desc";
        desc.textContent =
            "Step into the spotlight with three cinematic chocolate " +
            "looks — MILK, DARK and CARAMEL — live now in Face Filters.";
        poster.appendChild(desc);

        /* Venue direction line — rendered only when supplied */
        if (CAMPAIGN.venueLine && !CAMPAIGN.posterImage) {
            var venue = document.createElement("p");
            venue.className = "hershey-venue";
            venue.textContent = "📍 " + CAMPAIGN.venueLine;
            poster.appendChild(venue);
        }

        /* Countdown — shown only when a valid target exists */
        var countdown = document.createElement("div");
        countdown.className = "hershey-countdown";
        countdown.id = "hersheyCountdown";
        countdown.setAttribute("aria-live", "polite");
        ["DAYS", "HRS", "MIN", "SEC"].forEach(function (unit) {
            var box = document.createElement("div");
            box.className = "hershey-count-unit";
            var strong = document.createElement("strong");
            strong.dataset.unit = unit.toLowerCase();
            strong.textContent = "0";
            var span = document.createElement("span");
            span.textContent = unit;
            box.appendChild(strong);
            box.appendChild(span);
            countdown.appendChild(box);
        });
        poster.appendChild(countdown);

        /* Expandable looks grid */
        var looks = document.createElement("div");
        looks.className = "hershey-looks";
        looks.id = "hersheyLooks";
        availableLooks().forEach(function (look) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "hershey-look-btn";
            btn.dataset.filter = look.id;
            btn.textContent = look.label;
            btn.title = look.hint;
            btn.setAttribute("aria-label", "Try " + look.label + " look");
            btn.addEventListener("click", function () {
                looks
                    .querySelectorAll(".hershey-look-btn")
                    .forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
                if (activateLens(look.id)) {
                    dismiss(true);
                }
            });
            looks.appendChild(btn);
        });
        poster.appendChild(looks);

        /* Actions */
        var actions = document.createElement("div");
        actions.className = "hershey-actions";

        var tryBtn = document.createElement("button");
        tryBtn.type = "button";
        tryBtn.className = "hershey-btn-primary";
        tryBtn.textContent = "TRY HERSHEY FILTER";
        tryBtn.addEventListener("click", function () {
            if (activateLens("hershey")) {
                dismiss(true);
            }
        });
        /* Main lens unavailable → hide the primary CTA entirely */
        tryBtn.style.display = lensIsAvailable("hershey") ? "" : "none";
        actions.appendChild(tryBtn);

        var looksBtn = document.createElement("button");
        looksBtn.type = "button";
        looksBtn.className = "hershey-btn-ghost";
        looksBtn.id = "hersheyExploreLooks";
        looksBtn.setAttribute("aria-expanded", "false");
        looksBtn.textContent = "EXPLORE LOOKS";
        looksBtn.addEventListener("click", function () {
            var open = looks.classList.toggle("hershey-looks-open");
            looksBtn.setAttribute("aria-expanded", open ? "true" : "false");
        });
        actions.appendChild(looksBtn);

        var closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "hershey-btn-close";
        closeBtn.textContent = "CLOSE";
        closeBtn.setAttribute("aria-label", "Close HERSHEY promotion");
        closeBtn.addEventListener("click", function () { dismiss(false); });
        actions.appendChild(closeBtn);

        poster.appendChild(actions);
        banner.appendChild(poster);
        return banner;
    }

    /* Countdown ticker — runs only while a valid target exists */
    var countdownTimer = null;

    function startCountdown(target) {
        var countdown = document.getElementById("hersheyCountdown");
        if (!countdown || !isValidDate(target)) return;

        countdown.classList.add("hershey-countdown-active");

        function tick() {
            var diff = target.getTime() - Date.now();
            if (diff <= 0) {
                stopCountdown();
                countdown.classList.remove("hershey-countdown-active");
                /* Campaign over — retire the banner entirely */
                dismiss(false);
                return;
            }
            var s = Math.floor(diff / 1000);
            var vals = {
                days: Math.floor(s / 86400),
                hrs: Math.floor((s % 86400) / 3600),
                min: Math.floor((s % 3600) / 60),
                sec: s % 60,
            };
            countdown.querySelectorAll("[data-unit]").forEach(function (el) {
                var v = vals[el.dataset.unit];
                el.textContent = (v < 10 && el.dataset.unit !== "days" ? "0" : "") + v;
            });
        }

        tick();
        countdownTimer = setInterval(tick, 1000);
    }

    function stopCountdown() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
    }

    /* Dismiss WITHOUT interrupting the editing session — no camera
     * stop, no filter reset, no reload. Session interruption is
     * avoided even when persisting the dismissal. */
    function dismiss(persistChoice) {
        var banner = document.getElementById("hersheyPromoBanner");
        if (!banner) return;
        stopCountdown();
        if (persistChoice) {
            markDismissed();
        }
        banner.classList.add("hershey-dismissing");
        setTimeout(function () {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 340);
    }

    /* Campaign window logic */
    function shouldShowNow() {
        var start = parseDate(CAMPAIGN.start);
        var end = parseDate(CAMPAIGN.end);

        /* Explicit window configured */
        if (start || end) {
            var now = Date.now();
            if (start && now < start.getTime()) return false;
            if (end && now > end.getTime()) return false; // event ended
            return true;
        }

        /* No dates supplied: show unless previously dismissed.
         * The countdown simply never renders (no fabricated date). */
        return !isDismissed();
    }

    function init() {
        if (!shouldShowNow()) return;
        /* No configured HERSHEY presets → nothing to promote */
        if (!availableLooks().length) return;

        var banner = buildBanner();

        /* Requirement 4: mount INSIDE the existing Face workspace —
         * the ER Studio effects panel discovery area — so the
         * campaign feels native to the Studio, never a separate
         * fullscreen application. Falls back to the fixed overlay
         * only when the Studio panel is not present. */
        var discovery = document.querySelector(".er-feature-discovery");
        if (discovery && discovery.parentNode) {
            banner.classList.add("hershey-banner-inline");
            banner.removeAttribute("role");
            banner.removeAttribute("aria-modal");
            banner.setAttribute("aria-label", "HERSHEY Movie Launch Special");
            discovery.parentNode.insertBefore(banner, discovery);
        } else {
            document.body.appendChild(banner);
        }

        var target = parseDate(CAMPAIGN.launchDate) || parseDate(CAMPAIGN.end);
        if (target && target.getTime() > Date.now()) {
            startCountdown(target);
        }

        /* Escape closes the banner without touching the session */
        banner.addEventListener("keydown", function (e) {
            if (e.key === "Escape" || e.keyCode === 27) {
                dismiss(false);
            }
        });

        /* Basic focus hand-off for keyboard users */
        var firstBtn = banner.querySelector(".hershey-btn-primary");
        if (firstBtn) firstBtn.focus();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
