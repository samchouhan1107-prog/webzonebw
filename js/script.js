/* ==========================================================
   WebZoneBW
   Main JavaScript
   ----------------------------------------------------------
   Purpose:
   - Skill bar animation
   - Dark / Light theme
   - Theme persistence
   - Accessibility support
   - Lightweight static-site compatible
   ========================================================== */

"use strict";


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    try {
        initSkillBars();
    } catch (error) {
        console.warn(
            "WebZoneBW: Skill bar initialization failed.",
            error
        );
    }

    try {
        initTheme();
    } catch (error) {
        console.warn(
            "WebZoneBW: Theme initialization failed.",
            error
        );
    }

});


/* ==========================================================
   SKILL BAR ANIMATION
========================================================== */

function initSkillBars() {

    const skills =
        document.querySelectorAll(".skill-fill");

    /*
     * Pages without skill bars do not need
     * any further processing.
     */

    if (!skills.length) {
        return;
    }


    /*
     * Fallback for browsers that do not support
     * IntersectionObserver.
     */

    if (!("IntersectionObserver" in window)) {

        skills.forEach(skill => {

            const width =
                skill.dataset.width;

            if (width) {
                skill.style.width =
                    `${width}%`;
            }

        });

        return;
    }


    /*
     * Animate skill bars when they become visible.
     */

    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    const skill =
                        entry.target;

                    const width =
                        skill.dataset.width;

                    if (width) {

                        skill.style.width =
                            `${width}%`;

                    }

                    observerInstance.unobserve(
                        skill
                    );

                });

            },
            {
                threshold: 0.4
            }
        );


    skills.forEach(skill => {
        observer.observe(skill);
    });

}


/* ==========================================================
   DARK / LIGHT THEME
========================================================== */

function initTheme() {

    const themeToggle =
        document.getElementById("themeToggle");


    /*
     * Some pages may not contain the theme button.
     */

    if (!themeToggle) {
        return;
    }


    let savedTheme = null;


    /*
     * Read saved preference safely.
     */

    try {

        savedTheme =
            localStorage.getItem("theme");

    } catch (error) {

        console.warn(
            "WebZoneBW: Local storage unavailable."
        );

    }


    /*
     * Apply initial theme.
     */

    applyTheme(
        savedTheme === "light",
        themeToggle
    );


    /*
     * Theme toggle event.
     */

    themeToggle.addEventListener(
        "click",
        () => {

            const isLight =
                document.body.classList.toggle(
                    "light-mode"
                );


            /*
             * Save preference.
             */

            try {

                localStorage.setItem(
                    "theme",
                    isLight
                        ? "light"
                        : "dark"
                );

            } catch (error) {

                console.warn(
                    "WebZoneBW: Could not save theme preference."
                );

            }


            /*
             * Update button.
             */

            updateThemeButton(
                themeToggle,
                isLight
            );

        }
    );

}


/* ==========================================================
   APPLY THEME
========================================================== */

function applyTheme(
    isLight,
    themeToggle
) {

    if (isLight) {

        document.body.classList.add(
            "light-mode"
        );

    } else {

        document.body.classList.remove(
            "light-mode"
        );

    }


    updateThemeButton(
        themeToggle,
        isLight
    );

}


/* ==========================================================
   UPDATE THEME BUTTON
========================================================== */

function updateThemeButton(
    themeToggle,
    isLight
) {

    /*
     * Keep the button accessible and avoid
     * unnecessary HTML replacement.
     */

    if (isLight) {

        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );

        themeToggle.innerHTML =
            '<span aria-hidden="true">🌙</span> Dark Mode';

    } else {

        themeToggle.setAttribute(
            "aria-label",
            "Switch to light mode"
        );

        themeToggle.innerHTML =
            '<span aria-hidden="true">☀️</span> Light Mode';

    }

}