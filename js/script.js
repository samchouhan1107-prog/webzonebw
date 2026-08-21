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

    try {
        initMobileSidebarDrawer();
    } catch (error) {
        console.warn(
            "WebZoneBW: Mobile sidebar drawer initialization failed.",
            error
        );
    }

    try {
        initActiveNavigation();
    } catch (error) {
        console.warn(
            "WebZoneBW: Active navigation initialization failed.",
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
   DARK / LIGHT THEME CONTROLLER & SMOOTH TRANSITION ENGINE
========================================================== */

let transitionTimeout = null;

/**
 * Global WebZoneTheme API for cross-component theme control
 */
window.WebZoneTheme = {
    get current() {
        return document.documentElement.getAttribute("data-theme") === "light" ||
               document.body.classList.contains("light-mode") ? "light" : "dark";
    },

    get isLight() {
        return this.current === "light";
    },

    /**
     * Smoothly toggle between light and dark modes
     */
    toggle() {
        const nextTheme = this.isLight ? "dark" : "light";
        this.set(nextTheme, true);
        return nextTheme;
    },

    /**
     * Set a specific theme with optional smooth transition animation
     * @param {string} themeName - "light" or "dark"
     * @param {boolean} smooth - Whether to animate transition
     */
    set(themeName, smooth = true) {
        const wantLight = themeName === "light";

        if (smooth) {
            this.enableSmoothTransition();
        }

        // Apply HTML data-theme and body classes
        if (wantLight) {
            document.documentElement.setAttribute("data-theme", "light");
            document.body.classList.add("light-mode");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            document.body.classList.remove("light-mode");
        }

        // Sync all UI toggles, buttons and labels across the interface
        this.syncUIControls(wantLight);

        // Persist user selection
        saveThemePreference(wantLight ? "light" : "dark");

        // Notify other listeners / canvas / components
        window.dispatchEvent(new CustomEvent("webzone-theme-change", {
            detail: { theme: wantLight ? "light" : "dark", isLight: wantLight }
        }));
    },

    /**
     * Triggers hardware-accelerated smooth transition effect
     */
    enableSmoothTransition(duration = 380) {
        if (transitionTimeout) {
            clearTimeout(transitionTimeout);
        }

        document.documentElement.classList.add("theme-transitioning");
        document.body.classList.add("theme-transitioning");

        transitionTimeout = setTimeout(() => {
            document.documentElement.classList.remove("theme-transitioning");
            document.body.classList.remove("theme-transitioning");
            transitionTimeout = null;
        }, duration);
    },

    /**
     * Synchronize all switch inputs, toggle buttons, and text labels
     */
    syncUIControls(isLight) {
        // 1. Toggle Switches (<input type="checkbox" id="themeToggleSwitch">)
        const switches = document.querySelectorAll("#themeToggleSwitch, input[name='theme-switch']");
        switches.forEach(sw => {
            sw.checked = !isLight; // checked = dark mode, unchecked = light mode
        });

        // 2. Icon and Text Badges
        const themeIcons = document.querySelectorAll("#themeModeIcon, .theme-mode-icon");
        themeIcons.forEach(icon => {
            icon.textContent = isLight ? "☀️" : "🌙";
        });

        const themeTexts = document.querySelectorAll("#themeModeText, .theme-mode-text");
        themeTexts.forEach(text => {
            text.textContent = isLight ? "Light Mode" : "Dark Mode";
        });

        // 3. Theme Toggle Buttons
        const themeButtons = document.querySelectorAll("#themeToggle, .theme-btn-toggle");
        themeButtons.forEach(btn => {
            updateThemeButton(btn, isLight);
        });
    }
};

// Global shorthand
window.toggleTheme = function() {
    return window.WebZoneTheme.toggle();
};

function initTheme() {
    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem("theme");
    } catch (error) {
        console.warn("WebZoneBW: Local storage unavailable.");
    }

    // Check system preference if no explicit user preference is saved
    if (!savedTheme && window.matchMedia) {
        if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            savedTheme = "light";
        }
    }

    const isLight = savedTheme === "light";
    
    // Initial theme setup (instant without animation flash on page load)
    window.WebZoneTheme.set(isLight ? "light" : "dark", false);

    // Bind event listeners to all theme toggle controls
    const themeSwitches = document.querySelectorAll("#themeToggleSwitch, input[name='theme-switch']");
    themeSwitches.forEach(sw => {
        sw.addEventListener("change", () => {
            const wantLight = !sw.checked;
            window.WebZoneTheme.set(wantLight ? "light" : "dark", true);
        });
    });

    const themeToggleBtns = document.querySelectorAll("#themeToggle, .theme-btn-toggle, [data-action='toggle-theme']");
    themeToggleBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            window.WebZoneTheme.toggle();
        });
    });

    // Listen to OS system color scheme changes if user hasn't explicitly set a preference
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
        mediaQuery.addEventListener("change", (e) => {
            let hasSaved = false;
            try {
                hasSaved = !!localStorage.getItem("theme");
            } catch (err) {}

            if (!hasSaved) {
                window.WebZoneTheme.set(e.matches ? "light" : "dark", true);
            }
        });
    }

    // Mobile Hamburger Sidebar Toggle
    // Handled by initMobileSidebarDrawer()
}

/* ==========================================================
   MOBILE SIDEBAR DRAWER & BACKDROP OVERLAY CONTROLLER
========================================================== */

function initMobileSidebarDrawer() {
    // 1. Ensure the overlay backdrop exists in DOM
    let backdrop = document.getElementById("sidebarBackdrop") || document.querySelector(".sidebar-backdrop");
    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "sidebarBackdrop";
        backdrop.className = "sidebar-backdrop";
        backdrop.setAttribute("aria-hidden", "true");
        document.body.appendChild(backdrop);
    }

    const sidebars = document.querySelectorAll("#mainSidebar, .sidebar, .er-sidebar");
    const toggleBtns = document.querySelectorAll("#sidebarToggleBtn, .hamburger-btn, .er-hamburger-btn, [data-action='toggle-sidebar']");

    if (!sidebars.length) return;

    // 2. Ensure each sidebar has an accessible close button
    sidebars.forEach(sidebar => {
        const logo = sidebar.querySelector(".logo");
        if (logo && !sidebar.querySelector(".sidebar-close-btn")) {
            const closeBtn = document.createElement("button");
            closeBtn.type = "button";
            closeBtn.className = "sidebar-close-btn";
            closeBtn.id = "sidebarCloseBtn";
            closeBtn.setAttribute("aria-label", "Close navigation drawer");
            closeBtn.innerHTML = "&times;";
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                closeDrawer();
            });
            logo.appendChild(closeBtn);
        }
    });

    function isDrawerOpen() {
        return document.body.classList.contains("sidebar-open") || 
               Array.from(sidebars).some(sb => sb.classList.contains("open"));
    }

    function openDrawer() {
        sidebars.forEach(sb => sb.classList.add("open"));
        toggleBtns.forEach(btn => {
            btn.classList.add("is-active");
            btn.setAttribute("aria-expanded", "true");
        });
        document.body.classList.add("sidebar-open");
        if (backdrop) backdrop.classList.add("active");
    }

    function closeDrawer() {
        sidebars.forEach(sb => sb.classList.remove("open"));
        toggleBtns.forEach(btn => {
            btn.classList.remove("is-active");
            btn.setAttribute("aria-expanded", "false");
        });
        document.body.classList.remove("sidebar-open");
        if (backdrop) backdrop.classList.remove("active");
    }

    function toggleDrawer() {
        if (isDrawerOpen()) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }

    // 3. Bind Hamburger Toggle Buttons
    toggleBtns.forEach(btn => {
        btn.setAttribute("aria-expanded", "false");
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleDrawer();
        });
    });

    // 4. Backdrop Tap to Close
    if (backdrop) {
        backdrop.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeDrawer();
        });

        // Touch support for mobile tap
        backdrop.addEventListener("touchstart", (e) => {
            e.preventDefault();
            closeDrawer();
        }, { passive: false });
    }

    // 5. Close on Escape Key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isDrawerOpen()) {
            closeDrawer();
        }
    });

    // 6. Close when clicking any navigation link inside sidebar
    const navLinks = document.querySelectorAll(".sidebar-nav a, .sidebar ul li a, .er-sidebar nav a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 860) {
                closeDrawer();
            }
        });
    });

    // 7. Click outside detector fallback
    document.addEventListener("click", (e) => {
        if (!isDrawerOpen()) return;

        let clickedInsideSidebar = false;
        sidebars.forEach(sb => {
            if (sb.contains(e.target)) clickedInsideSidebar = true;
        });

        let clickedToggle = false;
        toggleBtns.forEach(btn => {
            if (btn.contains(e.target)) clickedToggle = true;
        });

        if (!clickedInsideSidebar && !clickedToggle) {
            closeDrawer();
        }
    });

    // 8. Auto close and restore scroll on window resize
    window.addEventListener("resize", () => {
        if (window.innerWidth > 860 && isDrawerOpen()) {
            closeDrawer();
        }
    });

    // Expose drawer control API to window
    window.WebZoneSidebar = {
        open: openDrawer,
        close: closeDrawer,
        toggle: toggleDrawer,
        isOpen: isDrawerOpen
    };
}


/* ==========================================================
   ACTIVE NAVIGATION STATE & MULTI-PAGE PERSISTENCE
========================================================== */

function initActiveNavigation() {
    const rawPath = window.location.pathname.toLowerCase();
    
    // Determine active page identifier
    let currentPage = "index.html";
    if (rawPath.includes("halloween")) {
        currentPage = "halloween/index.html";
    } else if (rawPath.includes("soundbox.html")) {
        currentPage = "soundbox.html";
    } else if (rawPath.includes("projects.html")) {
        currentPage = "projects.html";
    } else if (rawPath.includes("resume.html")) {
        currentPage = "resume.html";
    } else if (rawPath.includes("blog.html")) {
        currentPage = "blog.html";
    } else if (rawPath.includes("about.html")) {
        currentPage = "about.html";
    } else if (rawPath.includes("contact.html")) {
        currentPage = "contact.html";
    } else if (rawPath.includes("master.html")) {
        currentPage = "master.html";
    } else if (rawPath.includes("privacy.html")) {
        currentPage = "privacy.html";
    } else if (rawPath.includes("terms.html")) {
        currentPage = "terms.html";
    } else if (rawPath.includes("disclaimer.html")) {
        currentPage = "disclaimer.html";
    } else if (rawPath.includes("404.html")) {
        currentPage = "404.html";
    } else {
        // Root or unknown fallback
        const parts = rawPath.split("/").filter(Boolean);
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.endsWith(".html")) {
            currentPage = lastPart;
        } else {
            currentPage = "index.html";
        }
    }

    // Persist current active page
    try {
        sessionStorage.setItem("webzone_active_nav", currentPage);
    } catch (e) {}

    // Synchronize all sidebar nav links
    const allNavLinks = document.querySelectorAll(".sidebar-nav a, .sidebar ul li a, .er-sidebar nav a");
    
    allNavLinks.forEach(link => {
        const href = (link.getAttribute("href") || "").trim().toLowerCase();
        
        let isMatch = false;

        if (currentPage === "halloween/index.html") {
            isMatch = href.includes("halloween");
        } else if (currentPage === "index.html") {
            isMatch = href === "index.html" || href === "./index.html" || href === "/" || href === "./" || href === "../index.html";
        } else {
            isMatch = href === currentPage || href === `./${currentPage}` || href.endsWith(currentPage);
        }

        if (isMatch) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
        }

        // Add persistent click recording
        link.addEventListener("click", () => {
            try {
                sessionStorage.setItem("webzone_active_nav", href);
            } catch (e) {}
        });
    });
}

function saveThemePreference(themeStr) {
    try {
        localStorage.setItem("theme", themeStr);
    } catch (e) {
        console.warn("Could not save theme preference");
    }
}

function applyStandardTheme(isLight) {
    window.WebZoneTheme.set(isLight ? "light" : "dark", true);
}


/* ==========================================================
   UPDATE THEME BUTTON
========================================================== */

function updateThemeButton(
    themeToggle,
    isLight
) {
    if (!themeToggle) return;

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