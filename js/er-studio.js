/* =====================================================
   WEBZONEBW-ER STUDIO � PAGE CONTROLLERS
   Extracted from er/index.html.

   Modules (each isolated in its own IIFE, single
   responsibility, no cross-dependencies):
     1. ERThemeController      � theme persistence & toggle
     2. ERHalloweenLaunchUI    � launch orb animation & parallax
     3. ERCameraStabilityGuard � resume stalled/paused camera
     4. ERReadyMarker          � marks page as initialized

   NOTE: none of these modules call getUserMedia(); the
   existing halloween.js camera controller owns the stream.
   ===================================================== */

(function () {
    "use strict";

    /* Shared helper: run a callback once the DOM is ready. */
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
        } else {
            callback();
        }
    }

    window.WEBZONEBW_ER_UTIL = { onReady: onReady };

    /* =================================================
       1. THEME CONTROLLER
       ================================================= */

    (function () {
        "use strict";

        var THEME_LIGHT = "light";
        var THEME_DARK = "dark";

        function getSavedTheme() {
            try {
                /* v2.1: Try namespaced cookie first */
                if (window.WebZoneCookie) {
                    var ck = window.WebZoneCookie.getNS("global", "theme");
                    if (ck === THEME_LIGHT || ck === THEME_DARK) return ck;
                }
                var saved =
                    localStorage.getItem("theme") ||
                    localStorage.getItem("webzonebw-theme");

                return saved === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
            } catch (error) {
                return THEME_DARK;
            }
        }

        function persistTheme(theme) {
            try {
                localStorage.setItem("theme", theme);
                localStorage.setItem("webzonebw-theme", theme);
                /* v2.1: Also persist via namespaced cookie */
                if (window.WebZoneCookie) {
                    window.WebZoneCookie.setNS("global", "theme", theme, { days: 365 });
                }
            } catch (error) {
                /* Storage unavailable */
            }
        }

        function applyERTheme(theme) {
            var isLight = theme === THEME_LIGHT;

            document.documentElement.classList.toggle("er-theme-light", isLight);
            document.documentElement.classList.toggle("er-theme-dark", !isLight);

            if (document.body) {
                document.body.classList.toggle("er-theme-light", isLight);
                document.body.classList.toggle("er-theme-dark", !isLight);
            }

            var toggle = document.getElementById("themeToggleSwitch");
            var icon = document.getElementById("themeModeIcon");
            var text = document.getElementById("themeModeText");

            if (toggle) { toggle.checked = !isLight; }
            if (icon) { icon.textContent = isLight ? "??" : "??"; }
            if (text) { text.textContent = isLight ? "Light Mode" : "Dark Mode"; }

            persistTheme(theme);
        }

        function initERTheme() {
            var toggle = document.getElementById("themeToggleSwitch");

            applyERTheme(getSavedTheme());

            if (!toggle || toggle.dataset.erThemeBound === "true") {
                return;
            }

            toggle.dataset.erThemeBound = "true";

            toggle.addEventListener("change", function () {
                applyERTheme(toggle.checked ? THEME_DARK : THEME_LIGHT);
            });
        }

        window.WEBZONEBW_ER_UTIL.onReady(initERTheme);
    })();


    /* =================================================
       2. HALLOWEEN LAUNCH UI
       ================================================= */

    (function () {
        "use strict";

        var LAUNCH_ACTIVE_MS = 1100;
        var PARALLAX_RANGE_PX = 8;

        function setStatus(statusEl, text) {
            if (!statusEl) { return; }
            var label = statusEl.querySelector(".er-status-text");
            if (label) { label.textContent = text; }
        }

        function initHalloweenLaunchUI() {
            var orb = document.getElementById("erLaunchOrb");
            var status = document.getElementById("erLaunchStatus");

            if (!orb) { return; }

            orb.classList.add("halloween-ready");

            function activateOrb() {
                orb.classList.add("launch-active");
                setStatus(status, "INITIALIZING ER");

                window.setTimeout(function () {
                    orb.classList.remove("launch-active");
                    setStatus(status, "ER STUDIO READY");
                }, LAUNCH_ACTIVE_MS);
            }

            var startButton = document.getElementById("startExperienceBtn");
            var demoButton = document.getElementById("startDemoBtn");

            if (startButton) {
                startButton.addEventListener("click", activateOrb, { passive: true });
            }
            if (demoButton) {
                demoButton.addEventListener("click", activateOrb, { passive: true });
            }

            /* Desktop pointer parallax */
            if (window.matchMedia && window.matchMedia("(pointer:fine)").matches) {
                orb.addEventListener("pointermove", function (event) {
                    var rect = orb.getBoundingClientRect();

                    var x = ((event.clientX - rect.left) / rect.width - 0.5) * PARALLAX_RANGE_PX;
                    var y = ((event.clientY - rect.top) / rect.height - 0.5) * PARALLAX_RANGE_PX;

                    orb.style.setProperty("--orb-x", x + "px");
                    orb.style.setProperty("--orb-y", y + "px");
                }, { passive: true });

                orb.addEventListener("pointerleave", function () {
                    orb.style.setProperty("--orb-x", "0px");
                    orb.style.setProperty("--orb-y", "0px");
                }, { passive: true });
            }
        }

        window.WEBZONEBW_ER_UTIL.onReady(initHalloweenLaunchUI);
    })();


    /* =================================================
       3. CAMERA STABILITY GUARD

       Watches the existing #cameraVideo element and
       resumes playback if the browser pauses the
       already-active stream. Never calls getUserMedia().
       ================================================= */

    (function () {
        "use strict";

        var CONFIG = window.WEBZONEBW_ER_CONFIG || {};

        var RECOVERY_DEBOUNCE_MS = 350;
        var VISIBILITY_RESUME_DELAY_MS = 250;

        var recoveryTimer = null;
        var recoveryAttempts = 0;

        function getVideo() {
            return document.getElementById("cameraVideo");
        }

        function isCameraStreamActive(video) {
            if (!video || !video.srcObject) { return false; }

            var tracks =
                typeof video.srcObject.getVideoTracks === "function"
                    ? video.srcObject.getVideoTracks()
                    : [];

            return tracks.some(function (track) {
                return track.readyState === "live" && track.enabled !== false;
            });
        }

        function safeResumePlayback() {
            var video = getVideo();

            if (!video || !isCameraStreamActive(video)) { return; }

            if (video.readyState >= 2 && video.paused) {
                var playPromise = video.play();

                /* Browser may require a user gesture � never force it. */
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () { /* no-op */ });
                }
            }
        }

        function scheduleRecovery() {
            if (CONFIG.recoverStalledVideo === false || recoveryTimer) { return; }

            var maxAttempts = CONFIG.cameraRecoveryAttempts || 3;

            if (recoveryAttempts >= maxAttempts) {
                recoveryAttempts = 0;
                return;
            }

            recoveryAttempts++;

            recoveryTimer = window.setTimeout(function () {
                recoveryTimer = null;
                safeResumePlayback();
            }, CONFIG.cameraRecoveryDelay || 500);
        }

        function bindVideoGuard() {
            var video = getVideo();

            if (!video || video.dataset.erStabilityGuard === "true") { return; }

            video.dataset.erStabilityGuard = "true";

            video.addEventListener("playing", function () {
                recoveryAttempts = 0;
            }, { passive: true });

            video.addEventListener("canplay", safeResumePlayback, { passive: true });
            video.addEventListener("loadeddata", safeResumePlayback, { passive: true });

            video.addEventListener("stalled", scheduleRecovery, { passive: true });
            video.addEventListener("waiting", scheduleRecovery, { passive: true });

            video.addEventListener("pause", function () {
                /*
                 * Do not restart immediately � the camera controller
                 * may intentionally pause the video while changing
                 * lenses or switching cameras.
                 */
                window.setTimeout(function () {
                    if (isCameraStreamActive(video)) {
                        safeResumePlayback();
                    }
                }, RECOVERY_DEBOUNCE_MS);
            }, { passive: true });
        }

        function handleVisibilityChange() {
            if (document.visibilityState !== "visible") { return; }

            /* Give the browser a moment to restore the camera compositor. */
            window.setTimeout(safeResumePlayback, VISIBILITY_RESUME_DELAY_MS);
        }

        function initCameraStabilityGuard() {
            bindVideoGuard();

            document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });
            window.addEventListener("pageshow", function () {
                window.setTimeout(safeResumePlayback, VISIBILITY_RESUME_DELAY_MS);
            }, { passive: true });

            /*
             * We intentionally DO NOT stop the camera on pagehide:
             * the camera controller owns the stream, and stopping it
             * here would freeze the camera on mobile browsers that
             * temporarily suspend the page.
             */
        }

        window.WEBZONEBW_ER_UTIL.onReady(initCameraStabilityGuard);
    })();


    /* =================================================
       4. READY MARKER
       ================================================= */

    (function () {
        "use strict";

        function markERReady() {
            document.documentElement.classList.add("webzonebw-er-ready");

            if (document.body) {
                document.body.classList.add("webzonebw-er-ready");
            }
        }

        window.WEBZONEBW_ER_UTIL.onReady(markERReady);
    })();

})();
