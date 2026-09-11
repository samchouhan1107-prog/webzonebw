"use strict";

/* ==========================================================
   WEBZONEBW-ER — HALLOWEEN UI POLISH LAYER
   Enhances presentation without altering core logic.
   Loads AFTER halloween.js to add visual refinements.
   ========================================================== */

(function () {
    document.addEventListener("DOMContentLoaded", () => {
        /* Subtle entrance animation for lens bubbles */
        const bubbles = document.querySelectorAll(".er-lens-bubble");
        bubbles.forEach((b, i) => {
            b.style.opacity = "0";
            b.style.transform = "translateY(12px)";
            setTimeout(() => {
                b.style.transition = "opacity .35s ease, transform .35s ease";
                b.style.opacity = "1";
                b.style.transform = "translateY(0)";
            }, 60 * i);
        });

        /* Glow pulse on active filter pill */
        const style = document.createElement("style");
        style.textContent = `
            @keyframes wzbw-pill-glow {
                0%,100% { box-shadow: 0 0 6px rgba(56,189,248,.45); }
                50%     { box-shadow: 0 0 18px rgba(56,189,248,.75); }
            }
            .slide-active-pill { animation: wzbw-pill-glow 2.4s ease-in-out infinite; }
        `;
        document.head.appendChild(style);

        /* Smooth scroll-snap for the lens track */
        const track = document.getElementById("snapLensTrack");
        if (track) {
            track.style.scrollBehavior = "smooth";
        }
    });
})();
