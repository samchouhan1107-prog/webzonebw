/* ==========================================================
   WebZoneBW v1.0
   Main JavaScript
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initSkillBars();

    initTheme();

});

/* ==========================================================
   Skill Bar Animation
========================================================== */

function initSkillBars() {

    const skills = document.querySelectorAll(".skill-fill");

    // Exit if no skill bars exist on this page
    if (skills.length === 0) return;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.width =
                    entry.target.dataset.width + "%";

            }

        });

    }, {
        threshold: 0.4
    });

    skills.forEach(skill => observer.observe(skill));

}

/* ==========================================================
   Dark / Light Theme
========================================================== */

function initTheme() {

    const themeToggle = document.getElementById("themeToggle");

    // Exit if theme button doesn't exist
    if (!themeToggle) return;

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {

        document.body.classList.add("light-mode");
        themeToggle.textContent = "🌙 Dark Mode";

    } else {

        document.body.classList.remove("light-mode");
        themeToggle.textContent = "☀️ Light Mode";

    }

    // Toggle theme
    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");

        if (document.body.classList.contains("light-mode")) {

            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙 Dark Mode";

        } else {

            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "☀️ Light Mode";

        }

    });

}