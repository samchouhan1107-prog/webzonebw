/* ==========================================================
   WebZoneBW
   ----------------------------------------------------------
   Core JavaScript Controller
   Version: 2.1
   ----------------------------------------------------------
   Updated:
   - Standardized all ER routes to /er/index.html
   - Removed legacy WebZoneBW-ER.Studio.html references
   - Corrected ER navigation detection
   - Corrected Halloween navigation detection
   - Corrected root-page detection
   - Preserved theme controller
   - Preserved mobile sidebar
   - Preserved active navigation
   - Preserved WebZoneBW APIs
   ========================================================== */

"use strict";


/* ==========================================================
   GLOBAL CONFIGURATION
========================================================== */

const WEBZONE_CONFIG = Object.freeze({

    version: "2.1",

    selectors: {

        skillBars:
            ".skill-fill",

        themeSwitches:
            "#themeToggleSwitch, input[name='theme-switch']",

        themeButtons:
            "#themeToggle, .theme-btn-toggle, [data-action='toggle-theme']",

        themeIcons:
            "#themeModeIcon, .theme-mode-icon",

        themeTexts:
            "#themeModeText, .theme-mode-text",

        sidebars:
            "#mainSidebar, .sidebar, .er-sidebar",

        sidebarToggles:
            "#sidebarToggleBtn, .hamburger-btn, .er-hamburger-btn, [data-action='toggle-sidebar']",

        sidebarNav:
            ".sidebar-nav a, .sidebar ul li a, .er-sidebar nav a"
    },

    storage: {

        theme:
            "theme",

        activeNavigation:
            "webzone_active_nav"
    },

    mobileBreakpoint:
        860,

    themeTransitionDuration:
        380,

    skillThreshold:
        0.4
});


/* ==========================================================
   INTERNAL STATE
========================================================== */

const WebZoneState = {

    initialized:
        false,

    themeInitialized:
        false,

    sidebarInitialized:
        false,

    navigationInitialized:
        false,

    skillsInitialized:
        false,

    sidebarOpen:
        false,

    theme:
        "dark",

    reducedMotion:
        false,

    transitionTimeout:
        null,

    mediaQuery:
        null,

    sidebar: {

        backdrop:
            null,

        sidebars:
            [],

        toggleButtons:
            []
    }
};


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            WebZoneState.initialized
        ) {
            return;
        }

        WebZoneState.initialized =
            true;

        safeInit(
            "Skill bars",
            initSkillBars
        );

        updateReducedMotionState();

        safeInit(
            "Theme controller",
            initTheme
        );

        safeInit(
            "Mobile sidebar",
            initMobileSidebarDrawer
        );

        safeInit(
            "Active navigation",
            initActiveNavigation
        );

        window.dispatchEvent(
            new CustomEvent(
                "webzone-ready",
                {
                    detail: {
                        version:
                            WEBZONE_CONFIG.version
                    }
                }
            )
        );
    }
);


/* ==========================================================
   SAFE INITIALIZER
========================================================== */

function safeInit(
    name,
    initializer
) {

    try {

        initializer();

    } catch (error) {

        console.warn(
            `WebZoneBW: ${name} initialization failed.`,
            error
        );
    }
}


/* ==========================================================
   REDUCED MOTION
========================================================== */

function updateReducedMotionState() {

    if (!window.matchMedia) {

        WebZoneState.reducedMotion =
            false;

        return;
    }

    const mediaQuery =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

    WebZoneState.mediaQuery =
        mediaQuery;

    WebZoneState.reducedMotion =
        mediaQuery.matches;

    const handleMotionChange =
        event => {

            WebZoneState.reducedMotion =
                event.matches;

            document.documentElement.classList.toggle(
                "webzone-reduced-motion",
                event.matches
            );
        };

    if (
        typeof mediaQuery.addEventListener ===
        "function"
    ) {

        mediaQuery.addEventListener(
            "change",
            handleMotionChange
        );

    } else if (
        typeof mediaQuery.addListener ===
        "function"
    ) {

        mediaQuery.addListener(
            handleMotionChange
        );
    }

    document.documentElement.classList.toggle(
        "webzone-reduced-motion",
        WebZoneState.reducedMotion
    );
}


/* ==========================================================
   SKILL BAR ANIMATION
========================================================== */

function initSkillBars() {

    if (
        WebZoneState.skillsInitialized
    ) {
        return;
    }

    const skills =
        document.querySelectorAll(
            WEBZONE_CONFIG.selectors.skillBars
        );

    if (!skills.length) {
        return;
    }

    WebZoneState.skillsInitialized =
        true;

    if (
        WebZoneState.reducedMotion
    ) {

        skills.forEach(
            applySkillWidth
        );

        return;
    }

    if (
        !("IntersectionObserver" in window)
    ) {

        skills.forEach(
            applySkillWidth
        );

        return;
    }

    const observer =
        new IntersectionObserver(
            (
                entries,
                observerInstance
            ) => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        applySkillWidth(
                            entry.target
                        );

                        observerInstance.unobserve(
                            entry.target
                        );
                    }
                );
            },
            {
                threshold:
                    WEBZONE_CONFIG.skillThreshold
            }
        );

    skills.forEach(
        skill => {

            if (
                !skill.style.width &&
                skill.dataset.width
            ) {

                skill.style.width =
                    "0%";
            }

            observer.observe(
                skill
            );
        }
    );
}


function applySkillWidth(
    skill
) {

    if (!skill) {
        return;
    }

    const rawWidth =
        skill.dataset.width;

    if (!rawWidth) {
        return;
    }

    let width =
        parseFloat(
            String(rawWidth)
                .replace("%", "")
        );

    if (
        Number.isNaN(width)
    ) {
        return;
    }

    width =
        Math.max(
            0,
            Math.min(
                100,
                width
            )
        );

    skill.style.width =
        `${width}%`;

    skill.setAttribute(
        "aria-valuenow",
        String(width)
    );
}


/* ==========================================================
   THEME CONTROLLER
========================================================== */

window.WebZoneTheme = {

    get current() {

        return WebZoneState.theme;
    },


    get isLight() {

        return this.current ===
            "light";
    },


    get isDark() {

        return this.current ===
            "dark";
    },


    toggle() {

        const nextTheme =
            this.isLight
                ? "dark"
                : "light";

        this.set(
            nextTheme,
            true,
            true
        );

        return nextTheme;
    },


    set(
        themeName,
        smooth = true,
        persist = true
    ) {

        const theme =
            normalizeTheme(
                themeName
            );

        const wantLight =
            theme === "light";

        if (
            smooth &&
            !WebZoneState.reducedMotion
        ) {

            this.enableSmoothTransition();
        }

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        document.body.classList.toggle(
            "light-mode",
            wantLight
        );

        document.documentElement.classList.toggle(
            "theme-light",
            wantLight
        );

        document.documentElement.classList.toggle(
            "theme-dark",
            !wantLight
        );

        WebZoneState.theme =
            theme;

        this.syncUIControls(
            wantLight
        );

        if (persist) {

            saveThemePreference(
                theme
            );
        }

        window.dispatchEvent(
            new CustomEvent(
                "webzone-theme-change",
                {
                    detail: {

                        theme,

                        isLight:
                            wantLight,

                        isDark:
                            !wantLight
                    }
                }
            )
        );
    },


    enableSmoothTransition(
        duration =
            WEBZONE_CONFIG.themeTransitionDuration
    ) {

        if (
            WebZoneState.reducedMotion
        ) {
            return;
        }

        if (
            WebZoneState.transitionTimeout
        ) {

            clearTimeout(
                WebZoneState.transitionTimeout
            );
        }

        document.documentElement.classList.add(
            "theme-transitioning"
        );

        document.body.classList.add(
            "theme-transitioning"
        );

        WebZoneState.transitionTimeout =
            setTimeout(
                () => {

                    document.documentElement.classList.remove(
                        "theme-transitioning"
                    );

                    document.body.classList.remove(
                        "theme-transitioning"
                    );

                    WebZoneState.transitionTimeout =
                        null;

                },
                duration
            );
    },


    syncUIControls(
        isLight
    ) {

        const switches =
            document.querySelectorAll(
                WEBZONE_CONFIG.selectors.themeSwitches
            );

        switches.forEach(
            sw => {

                sw.checked =
                    !isLight;

                sw.setAttribute(
                    "aria-checked",
                    String(!isLight)
                );
            }
        );

        const themeIcons =
            document.querySelectorAll(
                WEBZONE_CONFIG.selectors.themeIcons
            );

        themeIcons.forEach(
            icon => {

                icon.textContent =
                    isLight
                        ? "☀️"
                        : "🌙";
            }
        );

        const themeTexts =
            document.querySelectorAll(
                WEBZONE_CONFIG.selectors.themeTexts
            );

        themeTexts.forEach(
            text => {

                text.textContent =
                    isLight
                        ? "Light Mode"
                        : "Dark Mode";
            }
        );

        const themeButtons =
            document.querySelectorAll(
                WEBZONE_CONFIG.selectors.themeButtons
            );

        themeButtons.forEach(
            button => {

                updateThemeButton(
                    button,
                    isLight
                );
            }
        );
    }
};


/* ==========================================================
   GLOBAL THEME SHORTHAND
========================================================== */

window.toggleTheme =
    function () {

        return window.WebZoneTheme.toggle();
    };


/* ==========================================================
   THEME INITIALIZATION
========================================================== */

function initTheme() {

    if (
        WebZoneState.themeInitialized
    ) {
        return;
    }

    WebZoneState.themeInitialized =
        true;

    let savedTheme =
        getSavedThemePreference();

    if (!savedTheme) {

        savedTheme =
            getSystemTheme();
    }

    window.WebZoneTheme.set(
        savedTheme,
        false,
        false
    );

    const themeSwitches =
        document.querySelectorAll(
            WEBZONE_CONFIG.selectors.themeSwitches
        );

    themeSwitches.forEach(
        sw => {

            if (
                sw.dataset.webzoneThemeBound ===
                "true"
            ) {
                return;
            }

            sw.dataset.webzoneThemeBound =
                "true";

            sw.addEventListener(
                "change",
                () => {

                    const wantLight =
                        !sw.checked;

                    window.WebZoneTheme.set(
                        wantLight
                            ? "light"
                            : "dark",
                        true,
                        true
                    );
                }
            );
        }
    );

    const themeButtons =
        document.querySelectorAll(
            WEBZONE_CONFIG.selectors.themeButtons
        );

    themeButtons.forEach(
        button => {

            if (
                button.dataset.webzoneThemeBound ===
                "true"
            ) {
                return;
            }

            button.dataset.webzoneThemeBound =
                "true";

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    window.WebZoneTheme.toggle();
                }
            );
        }
    );

    if (window.matchMedia) {

        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: light)"
            );

        const handleSystemThemeChange =
            event => {

                const hasSavedPreference =
                    Boolean(
                        getSavedThemePreference()
                    );

                if (
                    hasSavedPreference
                ) {
                    return;
                }

                window.WebZoneTheme.set(
                    event.matches
                        ? "light"
                        : "dark",
                    true,
                    false
                );
            };

        if (
            typeof mediaQuery.addEventListener ===
            "function"
        ) {

            mediaQuery.addEventListener(
                "change",
                handleSystemThemeChange
            );

        } else if (
            typeof mediaQuery.addListener ===
            "function"
        ) {

            mediaQuery.addListener(
                handleSystemThemeChange
            );
        }
    }
}


/* ==========================================================
   THEME HELPERS
========================================================== */

function normalizeTheme(
    themeName
) {

    return String(themeName)
        .toLowerCase() === "light"
        ? "light"
        : "dark";
}


function getSavedThemePreference() {

    try {
        /* v2.1: Try namespaced cookie first via WebZoneCookie */
        if (window.WebZoneCookie) {
            var ckTheme = window.WebZoneCookie.getNS("global", "theme");
            if (ckTheme === "light" || ckTheme === "dark") return ckTheme;
        }

        const value =
            localStorage.getItem(
                WEBZONE_CONFIG.storage.theme
            ) ||
            localStorage.getItem(
                "webzonebw-theme"
            );

        if (
            value === "light" ||
            value === "dark"
        ) {
            return value;
        }

    } catch (error) {

        console.warn(
            "WebZoneBW: Local storage unavailable."
        );
    }

    return null;
}


function saveThemePreference(
    themeStr
) {

    const theme =
        normalizeTheme(
            themeStr
        );

    try {

        localStorage.setItem(
            WEBZONE_CONFIG.storage.theme,
            theme
        );

        localStorage.setItem(
            "webzonebw-theme",
            theme
        );

        /* v2.1: Also persist via namespaced cookie */
        if (window.WebZoneCookie) {
            window.WebZoneCookie.setNS("global", "theme", theme, { days: 365 });
        }

    } catch (error) {

        console.warn(
            "WebZoneBW: Could not save theme preference.",
            error
        );
    }
}


function getSystemTheme() {

    if (window.matchMedia) {

        return window.matchMedia(
            "(prefers-color-scheme: light)"
        ).matches
            ? "light"
            : "dark";
    }

    return "dark";
}


/* ==========================================================
   STANDARD THEME COMPATIBILITY
========================================================== */

function applyStandardTheme(
    isLight
) {

    window.WebZoneTheme.set(
        isLight
            ? "light"
            : "dark",
        true,
        true
    );
}


/* ==========================================================
   THEME BUTTON UI
========================================================== */

function updateThemeButton(
    themeToggle,
    isLight
) {

    if (!themeToggle) {
        return;
    }

    if (isLight) {

        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );

        themeToggle.setAttribute(
            "title",
            "Switch to dark mode"
        );

        themeToggle.setAttribute(
            "aria-pressed",
            "true"
        );

        themeToggle.innerHTML =
            '<span aria-hidden="true">🌙</span> Dark Mode';

    } else {

        themeToggle.setAttribute(
            "aria-label",
            "Switch to light mode"
        );

        themeToggle.setAttribute(
            "title",
            "Switch to light mode"
        );

        themeToggle.setAttribute(
            "aria-pressed",
            "false"
        );

        themeToggle.innerHTML =
            '<span aria-hidden="true">☀️</span> Light Mode';
    }
}


/* ==========================================================
   MOBILE SIDEBAR DRAWER
========================================================== */

function initMobileSidebarDrawer() {

    if (
        WebZoneState.sidebarInitialized
    ) {
        return;
    }

    const sidebars =
        document.querySelectorAll(
            WEBZONE_CONFIG.selectors.sidebars
        );

    if (!sidebars.length) {
        return;
    }

    WebZoneState.sidebarInitialized =
        true;

    const toggleButtons =
        document.querySelectorAll(
            WEBZONE_CONFIG.selectors.sidebarToggles
        );

    WebZoneState.sidebar.sidebars =
        Array.from(sidebars);

    WebZoneState.sidebar.toggleButtons =
        Array.from(toggleButtons);

    let backdrop =
        document.getElementById(
            "sidebarBackdrop"
        ) ||
        document.querySelector(
            ".sidebar-backdrop"
        );

    if (!backdrop) {

        backdrop =
            document.createElement(
                "div"
            );

        backdrop.id =
            "sidebarBackdrop";

        backdrop.className =
            "sidebar-backdrop";

        backdrop.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.appendChild(
            backdrop
        );
    }

    WebZoneState.sidebar.backdrop =
        backdrop;

    sidebars.forEach(
        setupSidebar
    );

    toggleButtons.forEach(
        setupSidebarToggle
    );

    if (
        backdrop.dataset.webzoneBound !==
        "true"
    ) {

        backdrop.dataset.webzoneBound =
            "true";

        backdrop.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closeSidebarDrawer();
            }
        );

        backdrop.addEventListener(
            "touchstart",
            event => {

                event.preventDefault();

                closeSidebarDrawer();
            },
            {
                passive: false
            }
        );
    }

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                isSidebarDrawerOpen()
            ) {

                closeSidebarDrawer();
            }
        }
    );

    window.addEventListener(
        "popstate",
        () => {

            if (
                isSidebarDrawerOpen() &&
                window.innerWidth <=
                WEBZONE_CONFIG.mobileBreakpoint
            ) {

                closeSidebarDrawer();
            }
        }
    );

    const navLinks =
        document.querySelectorAll(
            WEBZONE_CONFIG.selectors.sidebarNav
        );

    navLinks.forEach(
        link => {

            if (
                link.dataset.webzoneDrawerBound ===
                "true"
            ) {
                return;
            }

            link.dataset.webzoneDrawerBound =
                "true";

            link.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <=
                        WEBZONE_CONFIG.mobileBreakpoint
                    ) {

                        closeSidebarDrawer();
                    }
                }
            );
        }
    );

    window.addEventListener(
        "resize",
        handleSidebarResize
    );

    document.addEventListener(
        "click",
        handleOutsideSidebarClick
    );

    window.WebZoneSidebar = {

        open:
            openSidebarDrawer,

        close:
            closeSidebarDrawer,

        toggle:
            toggleSidebarDrawer,

        isOpen:
            isSidebarDrawerOpen
    };

    closeSidebarDrawer();
}


/* ==========================================================
   SIDEBAR SETUP
========================================================== */

function setupSidebar(
    sidebar
) {

    if (!sidebar) {
        return;
    }

    const logo =
        sidebar.querySelector(
            ".logo"
        );

    if (
        logo &&
        !sidebar.querySelector(
            ".sidebar-close-btn"
        )
    ) {

        const closeBtn =
            document.createElement(
                "button"
            );

        closeBtn.type =
            "button";

        closeBtn.className =
            "sidebar-close-btn";

        closeBtn.setAttribute(
            "aria-label",
            "Close navigation drawer"
        );

        closeBtn.setAttribute(
            "title",
            "Close navigation"
        );

        closeBtn.innerHTML =
            '<span aria-hidden="true">&times;</span>';

        closeBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                closeSidebarDrawer();
            }
        );

        logo.appendChild(
            closeBtn
        );
    }

    if (
        !sidebar.getAttribute(
            "role"
        )
    ) {

        sidebar.setAttribute(
            "role",
            "navigation"
        );
    }
}


/* ==========================================================
   SIDEBAR TOGGLE SETUP
========================================================== */

function setupSidebarToggle(
    button
) {

    if (!button) {
        return;
    }

    if (
        button.dataset.webzoneSidebarBound ===
        "true"
    ) {
        return;
    }

    button.dataset.webzoneSidebarBound =
        "true";

    button.setAttribute(
        "aria-expanded",
        "false"
    );

    button.setAttribute(
        "aria-controls",
        "mainSidebar"
    );

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            toggleSidebarDrawer();
        }
    );
}


/* ==========================================================
   SIDEBAR STATE
========================================================== */

function isSidebarDrawerOpen() {

    return (
        WebZoneState.sidebarOpen ||
        document.body.classList.contains(
            "sidebar-open"
        )
    );
}


/* ==========================================================
   OPEN SIDEBAR
========================================================== */

function openSidebarDrawer() {

    const {
        sidebars,
        toggleButtons,
        backdrop
    } =
        WebZoneState.sidebar;

    if (!sidebars.length) {
        return;
    }

    sidebars.forEach(
        sidebar => {

            sidebar.classList.add(
                "open"
            );

            sidebar.setAttribute(
                "aria-hidden",
                "false"
            );
        }
    );

    toggleButtons.forEach(
        button => {

            button.classList.add(
                "is-active"
            );

            button.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    );

    document.body.classList.add(
        "sidebar-open"
    );

    if (
        window.innerWidth <=
        WEBZONE_CONFIG.mobileBreakpoint
    ) {

        document.body.classList.add(
            "webzone-scroll-lock"
        );
        document.body.style.position = "relative";
    }

    if (backdrop) {

        backdrop.classList.add(
            "active"
        );

        backdrop.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    WebZoneState.sidebarOpen =
        true;

    window.dispatchEvent(
        new CustomEvent(
            "webzone-sidebar-change",
            {
                detail: {
                    open: true
                }
            }
        )
    );
}


/* ==========================================================
   CLOSE SIDEBAR
========================================================== */

function closeSidebarDrawer() {

    const {
        sidebars,
        toggleButtons,
        backdrop
    } =
        WebZoneState.sidebar;

    sidebars.forEach(
        sidebar => {

            sidebar.classList.remove(
                "open"
            );

            sidebar.setAttribute(
                "aria-hidden",
                "true"
            );
        }
    );

    toggleButtons.forEach(
        button => {

            button.classList.remove(
                "is-active"
            );

            button.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    );

    document.body.classList.remove(
        "sidebar-open"
    );

    document.body.classList.remove(
        "webzone-scroll-lock"
    );
    document.body.style.position = "";

    if (backdrop) {

        backdrop.classList.remove(
            "active"
        );

        backdrop.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    WebZoneState.sidebarOpen =
        false;

    window.dispatchEvent(
        new CustomEvent(
            "webzone-sidebar-change",
            {
                detail: {
                    open: false
                }
            }
        )
    );
}


/* ==========================================================
   TOGGLE SIDEBAR
========================================================== */

function toggleSidebarDrawer() {

    if (
        isSidebarDrawerOpen()
    ) {

        closeSidebarDrawer();

    } else {

        openSidebarDrawer();
    }
}


/* ==========================================================
   SIDEBAR RESIZE
========================================================== */

function handleSidebarResize() {

    if (
        window.innerWidth >
        WEBZONE_CONFIG.mobileBreakpoint
    ) {

        if (
            isSidebarDrawerOpen()
        ) {

            closeSidebarDrawer();
        }
    }
}


/* ==========================================================
   OUTSIDE SIDEBAR CLICK
========================================================== */

function handleOutsideSidebarClick(
    event
) {

    if (
        !isSidebarDrawerOpen()
    ) {
        return;
    }

    const target =
        event.target;

    const clickedInsideSidebar =
        WebZoneState.sidebar.sidebars.some(
            sidebar =>
                sidebar.contains(
                    target
                )
        );

    const clickedToggle =
        WebZoneState.sidebar.toggleButtons.some(
            button =>
                button.contains(
                    target
                )
        );

    if (
        !clickedInsideSidebar &&
        !clickedToggle
    ) {

        closeSidebarDrawer();
    }
}


/* ==========================================================
   ACTIVE NAVIGATION
========================================================== */

function initActiveNavigation() {

    if (
        WebZoneState.navigationInitialized
    ) {
        return;
    }

    const navLinks =
        document.querySelectorAll(
            WEBZONE_CONFIG.selectors.sidebarNav
        );

    if (!navLinks.length) {
        return;
    }

    WebZoneState.navigationInitialized =
        true;

    const currentPage =
        detectCurrentPage();

    try {

        sessionStorage.setItem(
            WEBZONE_CONFIG.storage.activeNavigation,
            currentPage
        );

    } catch (error) {}

    navLinks.forEach(
        link => {

            const href =
                (
                    link.getAttribute(
                        "href"
                    ) || ""
                ).trim();

            const isMatch =
                isNavigationMatch(
                    href,
                    currentPage
                );

            if (isMatch) {

                link.classList.add(
                    "active"
                );

                link.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                link.classList.remove(
                    "active"
                );

                link.removeAttribute(
                    "aria-current"
                );
            }

            if (
                link.dataset.webzoneNavBound !==
                "true"
            ) {

                link.dataset.webzoneNavBound =
                    "true";

                link.addEventListener(
                    "click",
                    () => {

                        try {

                            sessionStorage.setItem(
                                WEBZONE_CONFIG.storage.activeNavigation,
                                href
                            );

                        } catch (error) {}
                    }
                );
            }
        }
    );
}


/* ==========================================================
   CURRENT PAGE DETECTION
   ----------------------------------------------------------
   IMPORTANT:
   ER is now standardized to:

       /er/index.html

   Legacy WebZoneBW-ER.Studio.html
   references have been removed.
========================================================== */

function detectCurrentPage() {

    const pathname =
        (
            window.location.pathname ||
            "/"
        ).toLowerCase();


    /* ------------------------------------------------------
       WEBZONE ER
       ------------------------------------------------------ */

    if (
        pathname === "/er" ||
        pathname === "/er/" ||
        pathname.includes("/er/index.html")
    ) {

        return "er/index.html";
    }


    /* ------------------------------------------------------
       HALLOWEEN (removed — route no longer exists)
       ------------------------------------------------------ */


    /* ------------------------------------------------------
       ROOT WEBSITE
       ------------------------------------------------------ */

    if (
        pathname === "/" ||
        pathname.endsWith("/index.html")
    ) {

        /*
         * Do NOT classify /er/index.html or
         * /halloween/index.html as the root page.
         */

        if (
            pathname.includes("/er/")
        ) {

            return "er/index.html";
        }

        return "index.html";
    }


    /* ------------------------------------------------------
       KNOWN PAGES
       ------------------------------------------------------ */

    const knownPages = [

        "soundbox.html",

        "projects.html",

        "resume.html",

        "blog.html",

        "about.html",

        "contact.html",

        "privacy.html",

        "terms.html",

        "disclaimer.html"
    ];


    for (
        const page of knownPages
    ) {

        if (
            pathname.endsWith(
                `/${page}`
            ) ||
            pathname === page
        ) {

            return page;
        }
    }


    /* ------------------------------------------------------
       GENERIC HTML PAGE
       ------------------------------------------------------ */

    const parts =
        pathname
            .split("/")
            .filter(
                Boolean
            );

    const lastPart =
        parts[
            parts.length - 1
        ];


    if (
        lastPart &&
        lastPart.endsWith(".html")
    ) {

        return lastPart;
    }


    /* ------------------------------------------------------
       FINAL DEFAULT
       ------------------------------------------------------ */

    return "index.html";
}


/* ==========================================================
   NAVIGATION MATCHING
========================================================== */

function isNavigationMatch(
    href,
    currentPage
) {

    if (!href) {
        return false;
    }

    const normalizedHref =
        href
            .toLowerCase()
            .split("?")[0]
            .split("#")[0]
            .replace(/^\.\//, "");


    /* ------------------------------------------------------
       WEBZONE ER
       ------------------------------------------------------ */

    if (
        currentPage ===
        "er/index.html"
    ) {

        return (

            normalizedHref ===
                "er/" ||

            normalizedHref ===
                "er/index.html" ||

            normalizedHref.endsWith(
                "/er/index.html"
            )
        );
    }


    /* ------------------------------------------------------
       HOMEPAGE
       ------------------------------------------------------ */

    if (
        currentPage ===
        "index.html"
    ) {

        return (

            normalizedHref ===
                "index.html" ||

            normalizedHref ===
                "/" ||

            normalizedHref ===
                "./" ||

            normalizedHref ===
                "../index.html" ||

            normalizedHref ===
                ""
        );
    }


    /* ------------------------------------------------------
       NORMAL PAGES
       ------------------------------------------------------ */

    return (

        normalizedHref ===
            currentPage ||

        normalizedHref ===
            `./${currentPage}` ||

        normalizedHref.endsWith(
            `/${currentPage}`
        ) ||

        normalizedHref.endsWith(
            currentPage
        )
    );
}


/* ==========================================================
   GLOBAL WEBZONEBW API
========================================================== */

window.WebZoneBW = {

    version:
        WEBZONE_CONFIG.version,

    get state() {

        return {

            initialized:
                WebZoneState.initialized,

            theme:
                WebZoneState.theme,

            reducedMotion:
                WebZoneState.reducedMotion,

            sidebarOpen:
                isSidebarDrawerOpen()
        };
    },

    theme:
        window.WebZoneTheme,

    sidebar:
        window.WebZoneSidebar || null,

    refreshNavigation() {

        WebZoneState.navigationInitialized =
            false;

        initActiveNavigation();
    },

    refreshSkills() {

        WebZoneState.skillsInitialized =
            false;

        initSkillBars();
    },

    refreshThemeControls() {

        window.WebZoneTheme.syncUIControls(
            window.WebZoneTheme.isLight
        );
    },

    openSidebar() {

        openSidebarDrawer();
    },

    closeSidebar() {

        closeSidebarDrawer();
    },

    /* v2.1: Cleanup / destroy for lifecycle management */
    destroy() {
        /* Clear transition timeout */
        if (WebZoneState.transitionTimeout) {
            clearTimeout(WebZoneState.transitionTimeout);
            WebZoneState.transitionTimeout = null;
        }
        /* Close sidebar */
        closeSidebarDrawer();
        /* Reset init flags */
        WebZoneState.initialized = false;
        WebZoneState.themeInitialized = false;
        WebZoneState.sidebarInitialized = false;
        WebZoneState.navigationInitialized = false;
        WebZoneState.skillsInitialized = false;
    },

    /* v2.1: Cookie namespace helper */
    cookie: window.WebZoneCookie || null
};


/* ==========================================================
   KEEP GLOBAL SIDEBAR API IN SYNC
========================================================== */

if (
    !window.WebZoneSidebar
) {

    window.WebZoneSidebar = {

        open:
            openSidebarDrawer,

        close:
            closeSidebarDrawer,

        toggle:
            toggleSidebarDrawer,

        isOpen:
            isSidebarDrawerOpen
    };
}


window.WebZoneBW.sidebar =
    window.WebZoneSidebar;


/* ==========================================================
   COMPATIBILITY EVENTS
========================================================== */

window.addEventListener(
    "webzone-set-theme",
    event => {

        const theme =
            event.detail &&
            event.detail.theme;

        if (
            theme === "light" ||
            theme === "dark"
        ) {

            window.WebZoneTheme.set(
                theme,
                true,
                true
            );
        }
    }
);


window.addEventListener(
    "webzone-toggle-sidebar",
    () => {

        toggleSidebarDrawer();
    }
);


/* ==========================================================
   VISIBILITY RECOVERY
========================================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            if (
                window.innerWidth >
                WEBZONE_CONFIG.mobileBreakpoint
            ) {

                closeSidebarDrawer();
            }

            if (
                WebZoneState.themeInitialized
            ) {

                window.WebZoneTheme.syncUIControls(
                    window.WebZoneTheme.isLight
                );
            }
        }
    }
);


/* ==========================================================
   PAGE LIFECYCLE RECOVERY
========================================================== */

window.addEventListener(
    "pageshow",
    () => {

        if (
            WebZoneState.themeInitialized
        ) {

            window.WebZoneTheme.syncUIControls(
                window.WebZoneTheme.isLight
            );
        }

        if (
            window.innerWidth >
            WEBZONE_CONFIG.mobileBreakpoint
        ) {

            closeSidebarDrawer();
        }
    }
);


/* ==========================================================
   END OF WEBZONEBW CORE CONTROLLER
========================================================== */