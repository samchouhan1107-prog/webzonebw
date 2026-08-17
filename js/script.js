/* ==========================================================
   WebZoneBW
   Main JavaScript
========================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    try {
        initSkillBars();
    } catch (error) {
        console.warn("WebZoneBW: Skill bar initialization failed.", error);
    }

    try {
        initTheme();
    } catch (error) {
        console.warn("WebZoneBW: Theme initialization failed.", error);
    }

});


/* ==========================================================
   Skill Bar Animation
========================================================== */

function initSkillBars() {

    const skills = document.querySelectorAll(".skill-fill");

    // No skill bars on this page
    if (!skills.length) return;

    // Fallback for browsers without IntersectionObserver
    if (!("IntersectionObserver" in window)) {

        skills.forEach(skill => {

            const width = skill.dataset.width;

            if (width) {
                skill.style.width = `${width}%`;
            }

        });

        return;
    }

    const observer = new IntersectionObserver((entries, observer) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const skill = entry.target;
            const width = skill.dataset.width;

            if (width) {
                skill.style.width = `${width}%`;
            }

            observer.unobserve(skill);

        });

    }, {
        threshold: 0.4
    });


    skills.forEach(skill => {
        observer.observe(skill);
    });

}


/* ==========================================================
   Dark / Light Theme
========================================================== */

function initTheme() {

    const themeToggle = document.getElementById("themeToggle");

    // No theme button on this page
    if (!themeToggle) return;

    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem("theme");
    } catch (error) {
        console.warn("WebZoneBW: Local storage unavailable.");
    }


    if (savedTheme === "light") {

        document.body.classList.add("light-mode");

        themeToggle.innerHTML =
            '<span aria-hidden="true">🌙</span> Dark Mode';

    } else {

        document.body.classList.remove("light-mode");

        themeToggle.innerHTML =
            '<span aria-hidden="true">☀️</span> Light Mode';

    }


    themeToggle.addEventListener("click", () => {

        const isLight =
            document.body.classList.toggle("light-mode");


        if (isLight) {

            try {
                localStorage.setItem("theme", "light");
            } catch (error) {
                console.warn("WebZoneBW: Could not save theme.");
            }

            themeToggle.innerHTML =
                '<span aria-hidden="true">🌙</span> Dark Mode';

        } else {

            try {
                localStorage.setItem("theme", "dark");
            } catch (error) {
                console.warn("WebZoneBW: Could not save theme.");
            }

            themeToggle.innerHTML =
                '<span aria-hidden="true">☀️</span> Light Mode';

        }

    });

}