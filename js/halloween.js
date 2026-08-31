/* ==========================================================
   WEBZONE ER — EXTENDED REALITY & PHOTO STUDIO ENGINE
   Cartoonist Shaders • Auto-HD Enhancer • Trending Magazines
   ========================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initWebZoneERStudio();
});

function initWebZoneERStudio() {
    // Buttons & Controls
    const startBtn = document.getElementById("startExperienceBtn");
    const demoBtn = document.getElementById("startDemoBtn");
    const stopBtn = document.getElementById("stopExperienceBtn");
    const snapBtn = document.getElementById("snapPhotoBtn");
    const audioBtn = document.getElementById("toggleAudioBtn");
    const flipBtn = document.getElementById("flipCameraBtn");
    const faceHudToggle = document.getElementById("toggleFaceHudBtn");

    // Floating Camera Overlay Actions (Snapchat / Instagram style)
    const flipBtnFloating = document.getElementById("flipCameraBtnFloating");
    const studioLightBtnFloating = document.getElementById("studioLightBtnFloating");
    const autoHdBtnFloating = document.getElementById("autoHdBtnFloating");
    const faceHudToggleFloating = document.getElementById("toggleFaceHudBtnFloating");
    const shutterFlashOverlay = document.getElementById("shutterFlashOverlay");

    /*
     * IMPORTANT:
     * The HTML uses .er-lens-bubble.
     * Keep the selector aligned with the actual ER lens carousel.
     */
    const snapLensBubbles = document.querySelectorAll(".er-lens-bubble");
    const snapLensTrack = document.getElementById("snapLensTrack");

    // Studio Mode Tabs (Camera vs Upload)
    const modeCameraBtn = document.getElementById("modeCameraBtn");
    const modeUploadBtn = document.getElementById("modeUploadBtn");
    const uploadDropzone = document.getElementById("uploadDropzone");
    const imageFileInput = document.getElementById("imageFileInput");

    // Quality Enhancer Toggles
    const autoHdBtn = document.getElementById("autoHdBtn");
    const denoiseBtn = document.getElementById("denoiseBtn");
    const studioLightBtn = document.getElementById("studioLightBtn");

    // Magazine Controls
    const magPanel = document.getElementById("magazineEditorPanel");
    const magItemBtns = document.querySelectorAll(".magazine-item-btn");
    const magHeadlineInput = document.getElementById("magHeadlineInput");
    const magSubheadInput = document.getElementById("magSubheadInput");

    // DOM Elements
    const video = document.getElementById("cameraVideo");
    const canvas = document.getElementById("cameraCanvas");
    const placeholder = document.getElementById("cameraPlaceholder");
    const filterBtns = [];
    const tabBtns = [];
    const snapshotModal = document.getElementById("snapshotModal");
    const snapshotImg = document.getElementById("snapshotImg");
    const downloadLink = document.getElementById("downloadSnapshotBtn");
    const closeSnapBtn = document.getElementById("closeSnapshotBtn");

    // Camera & Microphone Permission Alert Elements
    const permissionAlertModal =
        document.getElementById("permissionAlertModal");

    const permAlertTitle =
        document.getElementById("permAlertTitle");

    const permAlertBadge =
        document.getElementById("permAlertBadge");

    const permAlertMessage =
        document.getElementById("permAlertMessage");

    const permAlertIcon =
        document.getElementById("permAlertIcon");

    const permAlertIconWrap =
        document.getElementById("permAlertIconWrap");

    const permAlertCloseBtn =
        document.getElementById("permAlertCloseBtn");

    const permRetryBtn =
        document.getElementById("permRetryBtn");

    const permDemoBtn =
        document.getElementById("permDemoBtn");

    const permUploadBtn =
        document.getElementById("permUploadBtn");

    const micStatusIndicator =
        document.getElementById("micStatusIndicator");

    if (!canvas || !video) {
        console.warn(
            "[WEBZONE ER] Camera canvas or video element was not found."
        );
        return;
    }

    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

    let mediaStream = null;
    let animFrameId = null;

    let studioMode = "camera"; // "camera" | "upload"
    let uploadedImage = null;

    // Filters & Effects State
    let currentFilter = "cartoon";
    let activeMagazine = "none";
    let showFaceHud = false;

    let isAutoHdEnabled = true;
    let isStudioLightEnabled = true;
    let isDenoiseEnabled = true;

    let isFacingUser = true;
    let isDemoMode = false;
    let isCameraStarting = false;

    // ==========================================================
    // MOBILE / TABLET PERFORMANCE GUARD
    // Keep the live camera smooth by separating the browser
    // camera resolution from the effect-processing resolution.
    // Full-resolution getImageData() on every frame can stall
    // mobile GPUs and make the camera appear frozen.
    // ==========================================================
    const erPerf = {
        frame: 0,
        lastEnhance: 0,
        lastFaceUpdate: 0,
        processingMax: 960,
        mobileMax: 640,
        tabletMax: 800,
        enhancementInterval: 8,
        running: false
    };

    function isERMobile() {
        return window.matchMedia && window.matchMedia("(max-width: 700px)").matches;
    }

    function isERTablet() {
        return window.matchMedia && window.matchMedia("(min-width: 701px) and (max-width: 1100px)").matches;
    }

    function getERProcessingMax() {
        if (isERMobile()) return erPerf.mobileMax;
        if (isERTablet()) return erPerf.tabletMax;
        return erPerf.processingMax;
    }

    function resizeProcessingCanvas(sourceW, sourceH) {
        const sw = sourceW || 640;
        const sh = sourceH || 480;
        const maxSide = getERProcessingMax();
        const scale = Math.min(1, maxSide / Math.max(sw, sh));
        const nextW = Math.max(320, Math.round(sw * scale));
        const nextH = Math.max(240, Math.round(sh * scale));

        if (canvas.width !== nextW || canvas.height !== nextH) {
            canvas.width = nextW;
            canvas.height = nextH;
        }
    }

    function setImmersiveCameraMode(active) {
        document.documentElement.classList.toggle("webzonebw-er-camera-active", active);
        if (document.body) {
            document.body.classList.toggle("webzonebw-er-camera-active", active);
        }
    }

    function isElementInViewport(el) {
        if (!el) return true;
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= -rect.height &&
            rect.left >= -rect.width &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + rect.height &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + rect.width
        );
    }

    let audioContext = null;
    let isAudioPlaying = false;
    let soundNodes = [];

    // Advanced Biometric Face Tracking & Smart Inventory State
    // Mobile / Tablet Optimized
    let faceBox = {
        x: 0.5,
        y: 0.42,
        w: 0.32,
        h: 0.44,
        targetX: 0.5,
        targetY: 0.42,
        targetW: 0.32,
        targetH: 0.44
    };

    let nativeFaceDetector = null;
    let isDetectingFace = false;
    let isFaceDetected = false;

    let detectionMethod = "scanning";
    // "native" | "chrominance" | "touch_lock" | "scanning"

    let lastFaceDetectTimestamp = 0;
    let faceDetectionConfidence = 99.4;

    let isTouchLocked = false;
    let touchLockTimeout = null;

    let activeSmartCategory = "smart";
    // "smart" | "face" | "scene" | "magazine" | "halloween" | "all"

    let currentProximity = "optimal";
    // "optimal" | "close" | "far"

    let currentLighting = "good";
    // "good" | "low" | "bright"

    // Offscreen Canvas for Mobile/Tablet
    // Skin-Chrominance & Optical Centroid Analysis
    let analysisCanvas = null;
    let analysisCtx = null;

    if (typeof document !== "undefined") {
        analysisCanvas = document.createElement("canvas");
        analysisCanvas.width = 48;
        analysisCanvas.height = 36;

        analysisCtx = analysisCanvas.getContext("2d", {
            willReadFrequently: true
        });
    }

    // Check Native Browser FaceDetector API
    if (
        typeof window !== "undefined" &&
        "FaceDetector" in window
    ) {
        try {
            nativeFaceDetector =
                new window.FaceDetector({
                    maxDetectedFaces: 1,
                    fastMode: true
                });
        } catch (e) {
            nativeFaceDetector = null;
        }
    }

    // Particles & Matrix code
    let matrixDrops = [];
    let techNodes = [];
    let particles = [];
    let bats = [];
    let ghosts = [];

    const matrixChars =
        "01010101XYZ0123456789ABCDEF<>{}/*+~#@$%&WEBZONEBW";

    for (let i = 0; i < 35; i++) {
        matrixDrops.push({
            x: Math.random(),
            y: Math.random(),
            speed: Math.random() * 0.015 + 0.008,
            length: Math.floor(Math.random() * 12) + 6
        });
    }

    const techLabels = [
        "K8s",
        "Docker",
        "Linux",
        "Node.js",
        "Python",
        "Cloud",
        "CyberSec",
        "AI/ML",
        "React"
    ];

    for (let i = 0; i < techLabels.length; i++) {
        techNodes.push({
            label: techLabels[i],
            angle:
                (i / techLabels.length) *
                Math.PI *
                2,

            radius:
                0.28 +
                (i % 2) * 0.06,

            speed:
                (0.005 +
                    (i % 3) * 0.002) *
                (i % 2 === 0 ? 1 : -1)
        });
    }

    for (let i = 0; i < 30; i++) {
        particles.push({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 4 + 2,
            speedY: Math.random() * 1.5 + 0.5,
            speedX:
                (Math.random() - 0.5) * 1.2,
            alpha:
                Math.random() * 0.8 + 0.2
        });
    }

    for (let i = 0; i < 6; i++) {
        bats.push({
            x: Math.random(),
            y: Math.random() * 0.6,
            speedX:
                (Math.random() * 2 + 1) *
                (Math.random() > 0.5 ? 1 : -1),

            speedY:
                (Math.random() - 0.5) * 1.5,

            size:
                Math.random() * 20 + 25,

            wingPhase:
                Math.random() * Math.PI * 2
        });
    }

    for (let i = 0; i < 5; i++) {
        ghosts.push({
            x:
                Math.random() * 0.8 + 0.1,

            y:
                Math.random() * 0.8 + 0.1,

            size:
                Math.random() * 20 + 35,

            speedX:
                (Math.random() - 0.5) * 0.8,

            speedY:
                (Math.random() - 0.5) * 0.8,

            alpha:
                Math.random() * 0.5 + 0.3,

            wobble:
                Math.random() * Math.PI * 2
        });
    }

    // Step Highlighting
    function setHighlightStep(stepNum) {
        document
            .querySelectorAll(".flow-step")
            .forEach((step, idx) => {
                if (idx + 1 === stepNum) {
                    step.classList.add("active-step");
                } else {
                    step.classList.remove("active-step");
                }
            });
    }

    // Studio Mode Switcher (Camera vs Upload)
    if (modeCameraBtn && modeUploadBtn) {

        modeCameraBtn.addEventListener("click", () => {
            studioMode = "camera";

            modeCameraBtn.classList.add("active");
            modeUploadBtn.classList.remove("active");

            if (uploadDropzone) {
                uploadDropzone.style.display = "none";
            }

            if (placeholder) {
                placeholder.style.display = "flex";
            }

            canvas.style.display = "none";
        });

        modeUploadBtn.addEventListener("click", () => {
            studioMode = "upload";

            modeUploadBtn.classList.add("active");
            modeCameraBtn.classList.remove("active");

            if (uploadDropzone) {
                uploadDropzone.style.display = "block";
            }

            stopCameraFeed();

            if (uploadedImage) {
                renderUploadedImage();
            }
        });
    }

    // Drag & Drop / File Re-upload Handler
    if (uploadDropzone && imageFileInput) {

        uploadDropzone.addEventListener("click", () => {
            imageFileInput.click();
        });

        uploadDropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadDropzone.classList.add("dragover");
        });

        uploadDropzone.addEventListener("dragleave", () => {
            uploadDropzone.classList.remove("dragover");
        });

        uploadDropzone.addEventListener("drop", (e) => {
            e.preventDefault();

            uploadDropzone.classList.remove(
                "dragover"
            );

            if (
                e.dataTransfer.files &&
                e.dataTransfer.files[0]
            ) {
                handleUploadedFile(
                    e.dataTransfer.files[0]
                );
            }
        });

        imageFileInput.addEventListener("change", (e) => {
            if (
                e.target.files &&
                e.target.files[0]
            ) {
                handleUploadedFile(
                    e.target.files[0]
                );
            }
        });
    }

    function handleUploadedFile(file) {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();

            img.onload = () => {
                uploadedImage = img;
                renderUploadedImage();
            };

            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    }

    function renderUploadedImage() {
        if (!uploadedImage) return;

        placeholder.style.display = "none";
        canvas.style.display = "block";

        // Fit image nicely into canvas
        const maxW = 900;
        const maxH = 900;

        let w = uploadedImage.width;
        let h = uploadedImage.height;

        if (w > maxW || h > maxH) {
            const ratio =
                Math.min(
                    maxW / w,
                    maxH / h
                );

            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;

        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
        }

        startRenderLoop();
    }

    // Auto-HD Quality & Enhancement Toggles
    if (autoHdBtn) {
        autoHdBtn.addEventListener("click", () => {
            isAutoHdEnabled =
                !isAutoHdEnabled;

            autoHdBtn.classList.toggle(
                "active",
                isAutoHdEnabled
            );
        });
    }

    if (denoiseBtn) {
        denoiseBtn.addEventListener("click", () => {
            isDenoiseEnabled =
                !isDenoiseEnabled;

            denoiseBtn.classList.toggle(
                "active",
                isDenoiseEnabled
            );
        });
    }

    if (studioLightBtn) {
        studioLightBtn.addEventListener("click", () => {
            isStudioLightEnabled =
                !isStudioLightEnabled;

            studioLightBtn.classList.toggle(
                "active",
                isStudioLightEnabled
            );
        });
    }

    // Category Tabs (legacy .category-tab-btn removed — handled by catPills below)

    // Magazine Template Switcher
    if (magItemBtns.length > 0) {

        magItemBtns.forEach(btn => {

            btn.addEventListener("click", () => {

                magItemBtns.forEach(b =>
                    b.classList.remove("active")
                );

                btn.classList.add("active");

                activeMagazine =
                    btn.dataset.mag;
            });

        });

    }

    // Face HUD Toggle
    if (faceHudToggle) {

        faceHudToggle.addEventListener("click", () => {

            showFaceHud =
                !showFaceHud;

            faceHudToggle.classList.toggle(
                "active",
                showFaceHud
            );

            faceHudToggle.innerHTML =
                showFaceHud
                    ? '<span aria-hidden="true">🎯</span> Face Recognition HUD: ON'
                    : '<span aria-hidden="true">🎯</span> Face Recognition HUD: OFF';

        });

    }

    // Quick Actions & Drawer Elements
    const quickWebzoneBtn =
        document.getElementById(
            "quickWebzoneBtn"
        );

    const toggleDrawerBtn =
        document.getElementById(
            "toggleDrawerBtn"
        );

    const effectsHiddenDrawer =
        document.getElementById(
            "effectsHiddenDrawer"
        );

    const drawerArrowIcon =
        document.getElementById(
            "drawerArrowIcon"
        );

    const touchSlideController =
        document.getElementById(
            "touchSlideController"
        );

    const slidePrevBtn =
        document.getElementById(
            "slidePrevBtn"
        );

    const slideNextBtn =
        document.getElementById(
            "slideNextBtn"
        );

    const slideActivePill =
        document.getElementById(
            "slideActivePill"
        );

    const slideCurrentInfo =
        document.getElementById(
            "slideCurrentInfo"
        );

    const cameraViewport =
        document.getElementById(
            "cameraViewport"
        );

    const canvasSwipeToast =
        document.getElementById(
            "canvasSwipeToast"
        );

    const canvasSwipeIcon =
        document.getElementById(
            "canvasSwipeIcon"
        );

    const canvasSwipeText =
        document.getElementById(
            "canvasSwipeText"
        );

    // Random Filter Button
    const randomFilterBtn =
        document.getElementById(
            "randomFilterBtn"
        );

    // Comprehensive catalog of all WebZoneBW
    // & Realistic AR effects with category and target metadata
    const allFilterConfigs = [

        // 👤 FACE AR LENSES (verified working)
        {
            id: "sunglasses",
            name: "Aviators",
            icon: "🕶️",
            category: "face",
            target: "face",
            desc: "Ray-Ban aviator sunglasses with reflective lens shimmer"
        },

        {
            id: "halo",
            name: "Angel Halo",
            icon: "👑",
            category: "face",
            target: "face",
            desc: "Floating neon gold angelic halo with sacred geometry"
        },

        {
            id: "goldenhour",
            name: "Golden Hour",
            icon: "🌟",
            category: "face",
            target: "face",
            desc: "Warm California sunset rim light and golden skin glow"
        },

        {
            id: "cartoon",
            name: "Anime Cel",
            icon: "🎨",
            category: "face",
            target: "face",
            desc: "High-contrast comic outline with vibrant cel shading"
        },

        // 🌍 SCENE & ATMOSPHERIC SHADERS (verified working)
        {
            id: "noir",
            name: "Leica Noir",
            icon: "🖤",
            category: "scene",
            target: "scene",
            desc: "High-contrast silver gelatin black-and-white 35mm film"
        },

        {
            id: "vintage90s",
            name: "Retro 90s",
            icon: "🎞️",
            category: "scene",
            target: "scene",
            desc: "Warm Kodak Portra analog grain with soft vignette"
        },

        {
            id: "cinematic",
            name: "35mm Film",
            icon: "🎬",
            category: "scene",
            target: "scene",
            desc: "Anamorphic widescreen teal & orange color grade"
        },

        {
            id: "glitch",
            name: "Glitch FX",
            icon: "⚡",
            category: "scene",
            target: "scene",
            desc: "RGB channel chromatic aberration and scanline shifts"
        },

        {
            id: "space",
            name: "Deep Space",
            icon: "🚀",
            category: "scene",
            target: "scene",
            desc: "Starlight nebula cosmic aura with drifting stardust"
        },

        {
            id: "cyberpunk",
            name: "Neon Cyber",
            icon: "💡",
            category: "scene",
            target: "scene",
            desc: "Vibrant synthwave neon magenta & cyan wash"
        },
    ];

    /*
     * IMPORTANT:
     * snapLensTrack was already declared near the top of this
     * function. Do NOT redeclare it here.
     */

    const smartStatusIcon =
        document.getElementById(
            "smartStatusIcon"
        );

    const smartStatusText =
        document.getElementById(
            "smartStatusText"
        );

    const smartInventoryBadge =
        document.getElementById(
            "smartInventoryBadge"
        );

    const faceChipDot =
        document.getElementById(
            "faceChipDot"
        );

    const faceChipStatus =
        document.getElementById(
            "faceChipStatus"
        );

    const faceProximityMetric =
        document.getElementById(
            "faceProximityMetric"
        );

    const faceLightingMetric =
        document.getElementById(
            "faceLightingMetric"
        );

    const touchTargetCrosshair =
        document.getElementById(
            "touchTargetCrosshair"
        );

    // Dynamic Filter Inventory Manager
    // based on Face Detection & Active Category
    function getActiveInventoryFilters() {

        if (activeSmartCategory === "face") {
            return allFilterConfigs.filter(
                f => f.category === "face"
            );
        }

        if (activeSmartCategory === "scene") {
            return allFilterConfigs.filter(
                f => f.category === "scene"
            );
        }

        if (activeSmartCategory === "magazine") {
            return allFilterConfigs.filter(
                f => f.category === "magazine"
            );
        }

        if (activeSmartCategory === "halloween") {
            return allFilterConfigs.filter(
                f => f.category === "halloween"
            );
        }

        if (activeSmartCategory === "all") {
            return allFilterConfigs;
        }

        // "smart" category:
        // Auto-prioritize based on real-time face detection
        if (isFaceDetected) {

            const faceFilters =
                allFilterConfigs.filter(
                    f => f.category === "face"
                );

            const otherFilters =
                allFilterConfigs.filter(
                    f => f.category !== "face"
                );

            return [
                ...faceFilters,
                ...otherFilters
            ];

        } else {

            const sceneFilters =
                allFilterConfigs.filter(
                    f =>
                        f.category === "scene" ||
                        f.category === "magazine"
                );

            const otherFilters =
                allFilterConfigs.filter(
                    f =>
                        f.category !== "scene" &&
                        f.category !== "magazine"
                );

            return [
                ...sceneFilters,
                ...otherFilters
            ];
        }
    }

    // Render / Update Snapchat Circular Lens Carousel Dynamically
    function renderSmartLensTrack() {

        if (!snapLensTrack) return;

        const currentList =
            getActiveInventoryFilters();

        const displayLimit = 7;

        const visibleLenses =
            currentList.slice(
                0,
                displayLimit
            );

        // Make sure currentFilter is included
        if (
            !visibleLenses.some(
                f => f.id === currentFilter
            )
        ) {

            const currentCfg =
                allFilterConfigs.find(
                    f => f.id === currentFilter
                );

            if (currentCfg) {
                visibleLenses.unshift(
                    currentCfg
                );
            }
        }

        snapLensTrack.innerHTML = "";

        visibleLenses.forEach(config => {

            const btn =
                document.createElement("button");

            btn.type = "button";

            btn.className =
                `er-lens-bubble ${
                    config.id === currentFilter
                        ? "active"
                        : ""
                }`;

            btn.dataset.filter =
                config.id;

            btn.title =
                `${config.name} (${config.category.toUpperCase()})`;

            const circle =
                document.createElement("div");

            circle.className =
                `lens-bubble-circle ${
                    config.id === currentFilter
                        ? "active-glow"
                        : ""
                }`;

            circle.textContent =
                config.icon;

            const label =
                document.createElement("span");

            label.className =
                "lens-bubble-label";

            label.textContent =
                config.name.split(" ")[0];

            btn.appendChild(circle);
            btn.appendChild(label);

            btn.addEventListener(
                "click",
                () => {
                    selectFilter(config.id);
                }
            );

            snapLensTrack.appendChild(btn);
        });

        // Add "••• More" button at the end
        const moreBtn =
            document.createElement("button");

        moreBtn.type = "button";

        moreBtn.className =
            "er-lens-bubble more-lens-btn";

        moreBtn.id =
            "openAllEffectsBtn";

        moreBtn.title =
            "View All 30+ Effects in Studio Panel";

        moreBtn.innerHTML = `
            <div class="lens-bubble-circle">•••</div>
            <span class="lens-bubble-label">More</span>
        `;

        moreBtn.addEventListener(
            "click",
            () => {
                const effectsPanel =
                    document.getElementById(
                        "effectsPanel"
                    );

                if (effectsPanel) {
                    effectsPanel.classList.add(
                        "open"
                    );
                }
            }
        );

        snapLensTrack.appendChild(
            moreBtn
        );
    }

    // Update Telemetry & Status Badges
    function updateSmartInventoryUI() {

        const inventory =
            getActiveInventoryFilters();

        const faceCount =
            allFilterConfigs.filter(
                f => f.category === "face"
            ).length;

        const sceneCount =
            allFilterConfigs.filter(
                f => f.category === "scene"
            ).length;

        if (
            smartStatusText &&
            smartStatusIcon
        ) {

            if (isTouchLocked) {

                smartStatusIcon.textContent =
                    "🎯";

                smartStatusText.textContent =
                    "Touch-Locked AR Active";

            } else if (isFaceDetected) {

                smartStatusIcon.textContent =
                    "👤";

                smartStatusText.textContent =
                    `Smart Face AR: Locked (${faceDetectionConfidence.toFixed(0)}%)`;

            } else {

                smartStatusIcon.textContent =
                    "🌍";

                smartStatusText.textContent =
                    "Smart Scene Shaders: Active";
            }
        }

        if (smartInventoryBadge) {

            if (
                activeSmartCategory === "face" ||
                (
                    activeSmartCategory === "smart" &&
                    isFaceDetected
                )
            ) {

                smartInventoryBadge.textContent =
                    `👤 ${faceCount} Face AR Lenses Ready`;

                smartInventoryBadge.classList.remove(
                    "scene-mode"
                );

            } else if (
                activeSmartCategory === "scene" ||
                activeSmartCategory === "magazine"
            ) {

                smartInventoryBadge.textContent =
                    `🌍 ${sceneCount} Scene Shaders Active`;

                smartInventoryBadge.classList.add(
                    "scene-mode"
                );

            } else {

                smartInventoryBadge.textContent =
                    `✨ ${inventory.length} Effects Available`;

                smartInventoryBadge.classList.remove(
                    "scene-mode"
                );
            }
        }

        // Mobile Telemetry Top Bar
        if (
            faceChipDot &&
            faceChipStatus
        ) {

            faceChipDot.className =
                "face-chip-dot";

            if (isTouchLocked) {

                faceChipDot.classList.add(
                    "touch-locked"
                );

                faceChipStatus.textContent =
                    "🎯 Touch Lock Anchored";

            } else if (isFaceDetected) {

                faceChipDot.classList.add(
                    "locked"
                );

                faceChipStatus.textContent =
                    `👤 Face Locked (${faceDetectionConfidence.toFixed(0)}%)`;

            } else {

                faceChipDot.classList.add(
                    "scanning"
                );

                faceChipStatus.textContent =
                    "👤 Auto-Scanning Face...";
            }
        }

        if (faceProximityMetric) {

            if (
                currentProximity === "close"
            ) {

                faceProximityMetric.textContent =
                    "📐 Move Back";

            } else if (
                currentProximity === "far"
            ) {

                faceProximityMetric.textContent =
                    "🔍 Step Closer";

            } else {

                faceProximityMetric.textContent =
                    "🎯 Optimal Range";
            }
        }

        if (faceLightingMetric) {

            if (
                currentLighting === "low"
            ) {

                faceLightingMetric.textContent =
                    "🌙 Low Light";

            } else if (
                currentLighting === "bright"
            ) {

                faceLightingMetric.textContent =
                    "☀️ High Lumens";

            } else {

                faceLightingMetric.textContent =
                    "⚡ Studio Light";
            }
        }
    }

    let toastTimeout = null;

    function showSwipeToast(icon, title) {

        if (!canvasSwipeToast) return;

        if (canvasSwipeIcon) {
            canvasSwipeIcon.textContent =
                icon;
        }

        if (canvasSwipeText) {
            canvasSwipeText.textContent =
                title;
        }

        canvasSwipeToast.classList.add(
            "visible"
        );

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastTimeout = setTimeout(() => {
            canvasSwipeToast.classList.remove(
                "visible"
            );
        }, 1200);
    }

    function selectFilter(
        filterName,
        direction = "none"
    ) {

        currentFilter =
            filterName;

        const config =
            allFilterConfigs.find(
                c => c.id === filterName
            ) || {
                id: filterName,
                name:
                    filterName.toUpperCase(),
                icon: "✨",
                category: "scene"
            };

        // Update active pill text
        if (slideActivePill) {

            slideActivePill.textContent =
                `${config.icon} ${config.name}`;
        }

        // Show floating on-screen feedback
        if (direction === "left") {

            showSwipeToast(
                "👉",
                `${config.icon} ${config.name}`
            );

        } else if (
            direction === "right"
        ) {

            showSwipeToast(
                "👈",
                `${config.icon} ${config.name}`
            );

        } else {

            showSwipeToast(
                config.icon,
                config.name
            );
        }

        // Update active class on quick WebZoneBW button
        if (quickWebzoneBtn) {

            if (
                filterName === "webzonebw"
            ) {

                quickWebzoneBtn.style.boxShadow =
                    "0 0 20px rgba(56, 189, 248, 0.7)";

            } else {

                quickWebzoneBtn.style.boxShadow =
                    "";
            }
        }

        // Sync circular lens tray active state
        const bubbles =
            document.querySelectorAll(
                ".er-lens-bubble"
            );

        bubbles.forEach(bubble => {

            if (
                bubble.dataset.filter ===
                filterName
            ) {

                bubble.classList.add(
                    "active"
                );

                const circle =
                    bubble.querySelector(
                        ".lens-bubble-circle"
                    );

                if (circle) {
                    circle.classList.add(
                        "active-glow"
                    );
                }

                if (!isElementInViewport(bubble)) {
                    bubble.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center"
                    });
                }

            } else {

                bubble.classList.remove(
                    "active"
                );

                const circle =
                    bubble.querySelector(
                        ".lens-bubble-circle"
                    );

                if (circle) {
                    circle.classList.remove(
                        "active-glow"
                    );
                }
            }
        });

        // Sync Right Drawer / Panel effect cards
        const effectCards =
            document.querySelectorAll(
                ".effect-card"
            );

        effectCards.forEach(card => {

            if (
                card.dataset.filter ===
                filterName
            ) {

                card.classList.add(
                    "active"
                );

                if (!isElementInViewport(card)) {
                    card.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "nearest"
                    });
                }

            } else {

                card.classList.remove(
                    "active"
                );
            }
        });

        // Hide magazine cover if not a magazine filter
        const isMag = [
            "time",
            "wired",
            "forbes",
            "vogue",
            "cyber"
        ].includes(filterName);

        if (isMag) {

            activeMagazine =
                filterName;

            if (magPanel) {
                magPanel.classList.add(
                    "show"
                );
            }

            magItemBtns.forEach(btn => {

                btn.classList.toggle(
                    "active",
                    btn.dataset.mag ===
                        filterName
                );

            });

        } else {

            activeMagazine =
                "none";

            if (
                magPanel &&
                currentFilter !==
                    "magazine"
            ) {

                magPanel.classList.remove(
                    "show"
                );
            }
        }

        setHighlightStep(7);
    }

    function slideNext() {

        const inventory =
            getActiveInventoryFilters();

        const currIdx =
            inventory.findIndex(
                f => f.id === currentFilter
            );

        const nextIdx =
            (
                currIdx + 1 +
                inventory.length
            ) % inventory.length;

        selectFilter(
            inventory[nextIdx].id,
            "left"
        );
    }

    function slidePrev() {

        const inventory =
            getActiveInventoryFilters();

        const currIdx =
            inventory.findIndex(
                f => f.id === currentFilter
            );

        const prevIdx =
            (
                currIdx - 1 +
                inventory.length
            ) % inventory.length;

        selectFilter(
            inventory[prevIdx].id,
            "right"
        );
    }

    // Quick WebZoneBW signature button
    if (quickWebzoneBtn) {

        quickWebzoneBtn.addEventListener(
            "click",
            () => {
                selectFilter(
                    "webzonebw"
                );
            }
        );
    }
        // ==========================================================
    // HIDDEN EFFECTS DRAWER / MOBILE CONTROLS
    // ==========================================================

    if (toggleDrawerBtn && effectsHiddenDrawer) {
        toggleDrawerBtn.addEventListener("click", () => {
            const isCollapsed =
                effectsHiddenDrawer.classList.contains("collapsed");

            if (isCollapsed) {
                effectsHiddenDrawer.classList.remove("collapsed");
                toggleDrawerBtn.classList.add("open");
                toggleDrawerBtn.setAttribute("aria-expanded", "true");

                if (drawerArrowIcon) {
                    drawerArrowIcon.textContent = "▲";
                }
            } else {
                effectsHiddenDrawer.classList.add("collapsed");
                toggleDrawerBtn.classList.remove("open");
                toggleDrawerBtn.setAttribute("aria-expanded", "false");

                if (drawerArrowIcon) {
                    drawerArrowIcon.textContent = "▼";
                }
            }
        });
    }

    // ==========================================================
    // ARROW BUTTONS FOR SLIDE CONTROLLER
    // ==========================================================

    if (slidePrevBtn) {
        slidePrevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            slidePrev();
        });
    }

    if (slideNextBtn) {
        slideNextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            slideNext();
        });
    }

    if (slideCurrentInfo) {
        slideCurrentInfo.addEventListener("click", () => {
            if (toggleDrawerBtn) {
                toggleDrawerBtn.click();
            }
        });
    }

    // ==========================================================
    // FINGERTIP TOUCH SWIPE GESTURES
    // MOBILE + DESKTOP DRAG
    // ==========================================================

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    function handleSwipeGesture() {
        const deltaX =
            touchEndX - touchStartX;

        const deltaY =
            touchEndY - touchStartY;

        const minSwipeDistance = 35;

        if (
            Math.abs(deltaX) >
                Math.abs(deltaY) &&
            Math.abs(deltaX) >
                minSwipeDistance
        ) {
            if (deltaX < 0) {
                slideNext();
            } else {
                slidePrev();
            }
        }
    }

    const swipeTargets = [
        cameraViewport,
        canvas,
        touchSlideController
    ].filter(Boolean);

    swipeTargets.forEach((el) => {

        // Mobile touch start
        el.addEventListener(
            "touchstart",
            (e) => {

                if (
                    !e.touches ||
                    e.touches.length === 0
                ) {
                    return;
                }

                touchStartX =
                    e.touches[0].clientX;

                touchStartY =
                    e.touches[0].clientY;

                touchEndX =
                    touchStartX;

                touchEndY =
                    touchStartY;

                isSwiping = true;

            },
            { passive: true }
        );

        // Mobile touch move
        el.addEventListener(
            "touchmove",
            (e) => {

                if (
                    !isSwiping ||
                    !e.touches ||
                    e.touches.length === 0
                ) {
                    return;
                }

                touchEndX =
                    e.touches[0].clientX;

                touchEndY =
                    e.touches[0].clientY;

            },
            { passive: true }
        );

        // Mobile touch end
        el.addEventListener(
            "touchend",
            () => {

                if (!isSwiping) {
                    return;
                }

                isSwiping = false;

                handleSwipeGesture();

            }
        );

        // Desktop mouse drag
        el.addEventListener(
            "mousedown",
            (e) => {

                if (
                    e.target.closest("button") ||
                    e.target.closest("input")
                ) {
                    return;
                }

                touchStartX =
                    e.clientX;

                touchStartY =
                    e.clientY;

                touchEndX =
                    touchStartX;

                touchEndY =
                    touchStartY;

                isSwiping = true;

            }
        );

        el.addEventListener(
            "mousemove",
            (e) => {

                if (!isSwiping) {
                    return;
                }

                touchEndX =
                    e.clientX;

                touchEndY =
                    e.clientY;

            }
        );

        el.addEventListener(
            "mouseup",
            () => {

                if (!isSwiping) {
                    return;
                }

                isSwiping = false;

                handleSwipeGesture();

            }
        );

    });

    // ==========================================================
    // KEYBOARD ARROW CONTROLS
    // ==========================================================

    window.addEventListener(
        "keydown",
        (e) => {

            if (
                document.activeElement &&
                document.activeElement.tagName ===
                    "INPUT"
            ) {
                return;
            }

            if (e.key === "ArrowLeft") {
                slidePrev();
            }

            if (e.key === "ArrowRight") {
                slideNext();
            }

            if (
                (e.key === "r" || e.key === "R") &&
                randomFilterBtn
            ) {
                randomFilterBtn.click();
            }

        }
    );

    // ==========================================================
    // RANDOM FILTER
    // ==========================================================

    if (randomFilterBtn) {

        randomFilterBtn.addEventListener(
            "click",
            () => {

                const options =
                    allFilterConfigs.filter(
                        f =>
                            f.id !==
                            currentFilter
                    );

                const chosen =
                    options[
                        Math.floor(
                            Math.random() *
                                options.length
                        )
                    ] ||
                    allFilterConfigs[0];

                randomFilterBtn.style.transform =
                    "scale(0.92) rotate(15deg)";

                setTimeout(() => {
                    randomFilterBtn.style.transform =
                        "";
                }, 250);

                selectFilter(
                    chosen.id
                );

            }
        );

    }

    // ==========================================================
    // EXISTING LENS CAROUSEL
    // ==========================================================

    if (snapLensBubbles.length > 0) {

        snapLensBubbles.forEach(
            (bubble) => {

                bubble.addEventListener(
                    "click",
                    () => {

                        const targetFilter =
                            bubble.dataset.filter;

                        if (
                            targetFilter ===
                            "random"
                        ) {

                            if (
                                randomFilterBtn
                            ) {
                                randomFilterBtn.click();
                            }

                        } else if (
                            targetFilter
                        ) {

                            selectFilter(
                                targetFilter
                            );

                        }

                    }
                );

            }
        );

    }

    // ==========================================================
    // REDESIGNED ER LENS BUBBLES
    // ==========================================================

    const erLensBubbles =
        document.querySelectorAll(
            ".er-lens-bubble"
        );

    if (erLensBubbles.length > 0) {

        erLensBubbles.forEach(
            (bubble) => {

                bubble.addEventListener(
                    "click",
                    () => {

                        const targetFilter =
                            bubble.dataset.filter;

                        if (!targetFilter) {
                            return;
                        }

                        selectFilter(
                            targetFilter
                        );

                        erLensBubbles.forEach(
                            (b) =>
                                b.classList.remove(
                                    "active"
                                )
                        );

                        bubble.classList.add(
                            "active"
                        );

                    }
                );

            }
        );

    }

    // ==========================================================
    // MOBILE LENS TOUCH / POINTER CONTROLLER
    // ==========================================================
    if (snapLensTrack) {
        snapLensTrack.style.touchAction = "pan-x";

        let lensTouchX = 0;
        let lensTouchY = 0;
        let lensDragging = false;

        snapLensTrack.addEventListener("pointerdown", (event) => {
            lensTouchX = event.clientX;
            lensTouchY = event.clientY;
            lensDragging = false;
            try { snapLensTrack.setPointerCapture(event.pointerId); } catch (_) {}
        }, { passive: true });

        snapLensTrack.addEventListener("pointermove", (event) => {
            if (Math.abs(event.clientX - lensTouchX) > 12 || Math.abs(event.clientY - lensTouchY) > 12) {
                lensDragging = true;
            }
        }, { passive: true });

        snapLensTrack.addEventListener("pointerup", (event) => {
            const dx = event.clientX - lensTouchX;
            const dy = event.clientY - lensTouchY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                snapLensTrack.scrollBy({ left: dx < 0 ? 220 : -220, behavior: "smooth" });
            }
            lensDragging = false;
        }, { passive: true });
    }

    // ==========================================================
    // CAROUSEL ARROW NAVIGATION
    // ==========================================================

    const lensArrowLeft = document.getElementById("lensArrowLeft");
    const lensArrowRight = document.getElementById("lensArrowRight");

    function setupCarouselArrows(track, arrowLeft, arrowRight, scrollAmount) {
        if (!track || !arrowLeft || !arrowRight) return;

        function updateArrowVisibility() {
            const maxScroll = track.scrollWidth - track.clientWidth;
            const atStart = track.scrollLeft <= 4;
            const atEnd = track.scrollLeft >= maxScroll - 4;
            const hasOverflow = maxScroll > 8;

            const wrap = track.closest(".er-lens-carousel-wrap") || track.parentElement;
            if (wrap) {
                wrap.classList.toggle("has-overflow", hasOverflow);
            }

            arrowLeft.style.opacity = atStart ? "0" : "0.85";
            arrowLeft.style.pointerEvents = atStart ? "none" : "auto";
            arrowRight.style.opacity = atEnd ? "0" : "0.85";
            arrowRight.style.pointerEvents = atEnd ? "none" : "auto";
        }

        arrowLeft.addEventListener("click", () => {
            track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            setTimeout(updateArrowVisibility, 350);
        });

        arrowRight.addEventListener("click", () => {
            track.scrollBy({ left: scrollAmount, behavior: "smooth" });
            setTimeout(updateArrowVisibility, 350);
        });

        track.addEventListener("scroll", updateArrowVisibility, { passive: true });

        updateArrowVisibility();
        setTimeout(updateArrowVisibility, 500);
        window.addEventListener("resize", updateArrowVisibility);
    }

    setupCarouselArrows(snapLensTrack, lensArrowLeft, lensArrowRight, 200);

    // ==========================================================
    // EFFECT CARDS
    // ==========================================================

    const effectCards =
        document.querySelectorAll(
            ".effect-card"
        );

    effectCards.forEach(
        (card) => {

            card.addEventListener(
                "click",
                () => {

                    const filter =
                        card.dataset.filter;

                    if (!filter) {
                        return;
                    }

                    selectFilter(
                        filter
                    );

                    effectCards.forEach(
                        (c) =>
                            c.classList.remove(
                                "active"
                            )
                    );

                    card.classList.add(
                        "active"
                    );

                }
            );

        }
    );

    // ==========================================================
    // CATEGORY FILTER PILLS
    // ==========================================================

    const catPills = document.querySelectorAll(".cat-pill");

    catPills.forEach((pill) => {
        pill.addEventListener("click", () => {
            applySmartCategory(pill.dataset.cat);
        });
    });

    // ==========================================================
    // SMART CATEGORY RIBBON TABS (DESKTOP + MOBILE)
    // ==========================================================

    const smartCatBtns = document.querySelectorAll(".smart-cat-btn");

    function applySmartCategory(cat) {
        if (!cat) return;

        activeSmartCategory = cat;

        // Sync smart ribbon tabs
        smartCatBtns.forEach((btn) => {
            btn.classList.toggle(
                "active",
                btn.dataset.smartCat === cat
            );
        });

        // Sync effects-panel pills
        catPills.forEach((pill) => {
            pill.classList.toggle(
                "active",
                pill.dataset.cat === cat
            );
        });

        // Filter the effects panel cards
        effectCards.forEach((card) => {
            const cardCats = (
                card.dataset.cat || ""
            ).toLowerCase();

            // "smart" and "all" show every card
            const show =
                cat === "all" ||
                cat === "smart" ||
                cardCats.includes(cat);

            card.style.display = show ? "flex" : "none";
        });

        renderSmartLensTrack();
        updateSmartInventoryUI();
    }

    smartCatBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            applySmartCategory(btn.dataset.smartCat);
        });
    });

    // Initial render so the carousel and badges are live
    renderSmartLensTrack();
    updateSmartInventoryUI();

    // ==========================================================
    // SEARCH EFFECTS
    // ==========================================================

    const effectsSearchInput =
        document.getElementById(
            "effectsSearchInput"
        );

    if (effectsSearchInput) {

        effectsSearchInput.addEventListener(
            "input",
            (e) => {

                const query =
                    (
                        e.target.value ||
                        ""
                    )
                        .toLowerCase()
                        .trim();

                // If search is empty, restore category filter
                if (!query) {
                    applySmartCategory(activeSmartCategory);
                    return;
                }

                effectCards.forEach(
                    (card) => {

                        const cardCats =
                            (
                                card.dataset.cat ||
                                ""
                            ).toLowerCase();

                        // First check category match
                        const categoryMatch =
                            activeSmartCategory === "all" ||
                            activeSmartCategory === "smart" ||
                            cardCats.includes(activeSmartCategory);

                        if (!categoryMatch) {
                            card.style.display = "none";
                            return;
                        }

                        const name =
                            card.querySelector(
                                ".effect-name"
                            )?.textContent
                                ?.toLowerCase() ||
                            "";

                        const filter =
                            (
                                card.dataset.filter ||
                                ""
                            ).toLowerCase();

                        if (
                            name.includes(query) ||
                            filter.includes(query) ||
                            cardCats.includes(query)
                        ) {

                            card.style.display =
                                "flex";

                        } else {

                            card.style.display =
                                "none";

                        }

                    }
                );

            }
        );

    }

    // ==========================================================
    // ZOOM LEVEL
    // ==========================================================

    const zoomLevelBtn =
        document.getElementById(
            "zoomLevelBtn"
        );

    const zoomLevelText =
        document.getElementById(
            "zoomLevelText"
        );

    let currentZoom = 1.0;

    const zoomLevels = [
        1.0,
        2.0,
        0.5
    ];

    let zoomIndex = 0;

    if (
        zoomLevelBtn &&
        zoomLevelText
    ) {

        zoomLevelBtn.addEventListener(
            "click",
            () => {

                zoomIndex =
                    (
                        zoomIndex + 1
                    ) %
                    zoomLevels.length;

                currentZoom =
                    zoomLevels[
                        zoomIndex
                    ];

                zoomLevelText.textContent =
                    `${currentZoom.toFixed(1)}x`;

                if (canvas) {

                    canvas.style.transform =
                        `scale(${currentZoom})`;

                    canvas.style.transition =
                        "transform 0.25s ease";

                }

                showSwipeToast(
                    "🔍",
                    `Zoom: ${currentZoom.toFixed(1)}x`
                );

            }
        );

    }

    // ==========================================================
    // FULLSCREEN
    // ==========================================================

    const fullscreenBtn =
        document.getElementById(
            "fullscreenBtn"
        );

    if (
        fullscreenBtn &&
        cameraViewport
    ) {

        fullscreenBtn.addEventListener(
            "click",
            () => {

                if (
                    !document.fullscreenElement
                ) {

                    cameraViewport
                        .requestFullscreen?.()
                        .catch(
                            (err) =>
                                console.warn(
                                    err
                                )
                        );

                } else {

                    document
                        .exitFullscreen?.()
                        .catch(
                            (err) =>
                                console.warn(
                                    err
                                )
                        );

                }

            }
        );

    }

    // ==========================================================
    // FLASH / STUDIO LIGHT
    // ==========================================================

    const flashLightBtn =
        document.getElementById(
            "flashLightBtn"
        );

    if (flashLightBtn) {

        flashLightBtn.addEventListener(
            "click",
            () => {

                isStudioLightEnabled =
                    !isStudioLightEnabled;

                flashLightBtn.classList.toggle(
                    "active",
                    isStudioLightEnabled
                );

                showSwipeToast(
                    "⚡",
                    isStudioLightEnabled
                        ? "Studio Light ON"
                        : "Studio Light OFF"
                );

            }
        );

    }

    // ==========================================================
    // FACE MESH / TRACKING TOGGLE
    // ==========================================================

    const toggleFaceMeshBtn =
        document.getElementById(
            "toggleFaceMeshBtn"
        );

    if (toggleFaceMeshBtn) {

        toggleFaceMeshBtn.addEventListener(
            "click",
            () => {

                showFaceHud =
                    !showFaceHud;

                toggleFaceMeshBtn.classList.toggle(
                    "active",
                    showFaceHud
                );

                showSwipeToast(
                    "👤",
                    showFaceHud
                        ? "Biometric Tracking ON"
                        : "Biometric Tracking OFF"
                );

            }
        );

    }

    // ==========================================================
    // EFFECTS DRAWER
    // ==========================================================

    const openAllEffectsBtn =
        document.getElementById(
            "openAllEffectsBtn"
        );

    const effectsPanel =
        document.getElementById(
            "effectsPanel"
        );

    const closeEffectsPanelBtn =
        document.getElementById(
            "closeEffectsPanelBtn"
        );

    const mobileEffectsToggleBtn =
        document.getElementById(
            "mobileEffectsToggleBtn"
        );

    function toggleEffectsPanel() {

        if (!effectsPanel) {
            return;
        }

        if (
            window.innerWidth <= 1199
        ) {

            const isShown =
                effectsPanel.style.display ===
                "flex";

            effectsPanel.style.display =
                isShown
                    ? "none"
                    : "flex";

        } else {

            effectsPanel.scrollIntoView({
                behavior: "smooth"
            });

        }

    }

    if (openAllEffectsBtn) {
        openAllEffectsBtn.addEventListener(
            "click",
            toggleEffectsPanel
        );
    }

    if (mobileEffectsToggleBtn) {
        mobileEffectsToggleBtn.addEventListener(
            "click",
            toggleEffectsPanel
        );
    }

    if (
        closeEffectsPanelBtn &&
        effectsPanel
    ) {

        closeEffectsPanelBtn.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth <=
                    1199
                ) {
                    effectsPanel.style.display =
                        "none";
                }

            }
        );

    }

    // ==========================================================
    // MOBILE SIDEBAR
    // ==========================================================

    const sidebarToggleBtn =
        document.getElementById(
            "sidebarToggleBtn"
        );

    const mainSidebar =
        document.getElementById(
            "mainSidebar"
        );

    if (
        sidebarToggleBtn &&
        mainSidebar
    ) {

        sidebarToggleBtn.addEventListener(
            "click",
            () => {
                mainSidebar.classList.toggle(
                    "open"
                );
            }
        );

    }

    // ==========================================================
    // HELP
    // ==========================================================

    const helpModalBtn =
        document.getElementById(
            "helpModalBtn"
        );

    if (helpModalBtn) {

        helpModalBtn.addEventListener(
            "click",
            () => {

                const howToCard =
                    document.querySelector(
                        ".how-to-use-card"
                    );

                if (howToCard) {
                    howToCard.scrollIntoView({
                        behavior: "smooth"
                    });
                }

                showSwipeToast(
                    "❔",
                    "Swipe left/right to change effects!"
                );

            }
        );

    }

    // ==========================================================
    // FILE UPLOAD
    // ==========================================================

    const fileInput =
        document.getElementById(
            "fileInput"
        );

    if (
        modeUploadBtn &&
        fileInput
    ) {

        modeUploadBtn.addEventListener(
            "click",
            () => {
                fileInput.click();
            }
        );

        fileInput.addEventListener(
            "change",
            (e) => {

                if (
                    e.target.files &&
                    e.target.files[0]
                ) {

                    handleUploadedFile(
                        e.target.files[0]
                    );

                    studioMode =
                        "upload";

                    stopCameraFeed();

                }

            }
        );

    }

    // ==========================================================
    // VIEW ALL CATALOG
    // ==========================================================

    const viewAllCatalogBtn =
        document.getElementById(
            "viewAllCatalogBtn"
        );

    if (viewAllCatalogBtn) {

        viewAllCatalogBtn.addEventListener(
            "click",
            () => {

                applySmartCategory("all");

                showSwipeToast(
                    "⊞",
                    "Showing all 30+ Effects"
                );

            }
        );

    }

    // ==========================================================
    // FLOATING CAMERA BUTTONS
    // ==========================================================

    if (flipBtnFloating) {

        flipBtnFloating.addEventListener(
            "click",
            () => {

                if (flipBtn) {
                    flipBtn.click();
                }

            }
        );

    }

    if (studioLightBtnFloating) {

        studioLightBtnFloating.addEventListener(
            "click",
            () => {

                if (studioLightBtn) {

                    studioLightBtn.click();

                    studioLightBtnFloating.classList.toggle(
                        "active",
                        isStudioLightEnabled
                    );

                }

            }
        );

    }

    if (autoHdBtnFloating) {

        autoHdBtnFloating.addEventListener(
            "click",
            () => {

                if (autoHdBtn) {

                    autoHdBtn.click();

                    autoHdBtnFloating.classList.toggle(
                        "active",
                        isAutoHdEnabled
                    );

                }

            }
        );

    }

    if (faceHudToggleFloating) {

        faceHudToggleFloating.addEventListener(
            "click",
            () => {

                showFaceHud =
                    !showFaceHud;

                faceHudToggleFloating.classList.toggle(
                    "active",
                    showFaceHud
                );

                if (faceHudToggle) {

                    faceHudToggle.classList.toggle(
                        "active",
                        showFaceHud
                    );

                }

                showSwipeToast(
                    "👤",
                    showFaceHud
                        ? "Face Reticle ON"
                        : "Face Reticle OFF"
                );

            }
        );

    }

    // ==========================================================
    // FILTER BUTTONS
    // ==========================================================

    filterBtns.forEach(
        (btn) => {

            btn.addEventListener(
                "click",
                () => {

                    selectFilter(
                        btn.dataset.filter
                    );

                }
            );

        }
    );

      // ==========================================================
    // CAMERA / PERMISSION SYSTEM
    // ==========================================================

    function showPermissionAlert(err) {

        if (!permissionAlertModal) {
            return;
        }

        const errorName =
            err
                ? (
                    err.name ||
                    ""
                )
                : "";

        let title =
            "Camera Access Required";

        let badge =
            "Camera Access";

        let message =
            "WEBZONEBW ER Studio needs access to your <strong>camera</strong> to start the live Extended Reality experience.";

        let icon =
            "📷";


        // ======================================================
        // CAMERA PERMISSION DENIED
        // ======================================================

        if (
            errorName ===
                "NotAllowedError" ||
            errorName ===
                "PermissionDeniedError"
        ) {

            title =
                "Camera Permission Blocked";

            badge =
                "Access Denied";

            message =
                "Chrome has blocked the camera for this site (the camera icon with a red line in the address bar). Click that icon, choose <strong>Allow</strong>, then press <strong>Retry Camera</strong>. Also check Windows Settings → Privacy &amp; security → Camera.";

            icon =
                "🚫";


        // ======================================================
        // NO CAMERA FOUND
        // ======================================================

        } else if (
            errorName ===
                "NotFoundError" ||
            errorName ===
                "DevicesNotFoundError"
        ) {

            title =
                "No Camera Found";

            badge =
                "Camera Missing";

            message =
                "WEBZONEBW ER could not find a usable camera on this device. Check that your camera is connected and available.";

            icon =
                "📷";


        // ======================================================
        // CAMERA ALREADY IN USE
        // ======================================================

        } else if (
            errorName ===
                "NotReadableError" ||
            errorName ===
                "TrackStartError"
        ) {

            title =
                "Camera Is Busy";

            badge =
                "Device Busy";

            message =
                "Your camera appears to be in use by another application, browser tab, Zoom, Teams, Meet, or similar software. Close it and retry.";

            icon =
                "🔒";


        // ======================================================
        // CAMERA CONSTRAINT ERROR
        // ======================================================

        } else if (
            errorName ===
                "OverconstrainedError" ||
            errorName ===
                "ConstraintNotSatisfiedError"
        ) {

            title =
                "Camera Settings Unsupported";

            badge =
                "Constraint Error";

            message =
                "This device could not satisfy the requested camera settings. WEBZONEBW ER will retry using simpler mobile-compatible settings.";

            icon =
                "⚙️";


        // ======================================================
        // SECURITY / HTTPS ERROR
        // ======================================================

        } else if (
            errorName ===
                "SecurityError"
        ) {

            title =
                "Camera Security Restriction";

            badge =
                "Security";

            message =
                "The browser blocked camera access because this page is not running in an allowed secure context. Use <strong>HTTPS</strong> or <strong>localhost</strong>.";

            icon =
                "🔐";


        // ======================================================
        // CAMERA STARTUP INTERRUPTED
        // ======================================================

        } else if (
            errorName ===
                "AbortError"
        ) {

            title =
                "Camera Startup Interrupted";

            badge =
                "Retry Required";

            message =
                "The camera startup was interrupted by the browser or device. Please press <strong>Retry Camera</strong>.";

            icon =
                "🔄";


        // ======================================================
        // CAMERA API UNAVAILABLE
        // ======================================================

        } else if (
            errorName ===
                "TypeError"
        ) {

            title =
                "Camera API Unavailable";

            badge =
                "Browser Support";

            message =
                "This browser could not initialize the camera interface. Please use a current browser and open WEBZONEBW ER through <strong>HTTPS</strong> or <strong>localhost</strong>.";

            icon =
                "🌐";


        // ======================================================
        // UNKNOWN CAMERA ERROR
        // ======================================================

        } else if (err) {

            title =
                "Camera Could Not Start";

            badge =
                "Camera Error";

            message =
                "WEBZONEBW ER could not start the device camera. Please check your camera permission and try again.";

            icon =
                "⚠️";

        }


        // ======================================================
        // UPDATE PERMISSION MODAL
        // ======================================================

        if (permAlertTitle) {

            permAlertTitle.textContent =
                title;

        }


        if (permAlertBadge) {

            permAlertBadge.textContent =
                badge;

        }


        if (permAlertMessage) {

            permAlertMessage.innerHTML =
                message;

        }


        if (permAlertIcon) {

            permAlertIcon.textContent =
                icon;

        }


        if (permAlertIconWrap) {

            permAlertIconWrap.classList.toggle(
                "error",
                !!err
            );

        }


        // ======================================================
        // SHOW MODAL
        // ======================================================

        permissionAlertModal.classList.add(
            "is-open"
        );

        permissionAlertModal.style.display =
            "flex";

    }


    // ==========================================================
    // CLOSE CAMERA PERMISSION ALERT
    // ==========================================================

    function closePermissionAlert() {

        if (permissionAlertModal) {

            permissionAlertModal.classList.remove(
                "is-open"
            );

            permissionAlertModal.style.display =
                "none";

        }

    }


    window.closePermissionAlert =
        closePermissionAlert;


    // ==========================================================
    // CLOSE BUTTON
    // ==========================================================

    if (permAlertCloseBtn) {

        permAlertCloseBtn.addEventListener(
            "click",
            closePermissionAlert
        );

    }


    // ==========================================================
    // RETRY CAMERA
    // ==========================================================

    if (permRetryBtn) {

        permRetryBtn.addEventListener(
            "click",
            () => {

                closePermissionAlert();

                setTimeout(
                    () => {

                        startCamera();

                    },
                    150
                );

            }
        );

    }


    // ==========================================================
    // DEMO MODE
    // ==========================================================

    if (permDemoBtn) {

        permDemoBtn.addEventListener(
            "click",
            () => {

                closePermissionAlert();

                startDemoMode();

            }
        );

    }


    // ==========================================================
    // UPLOAD MODE
    // ==========================================================

    if (permUploadBtn) {

        permUploadBtn.addEventListener(
            "click",
            () => {

                closePermissionAlert();

                if (modeUploadBtn) {

                    modeUploadBtn.click();

                }

            }
        );

    }

    function waitForCameraRelease(ms) {
        return new Promise((resolve) => {
            window.setTimeout(resolve, ms);
        });
    }

    async function queryCameraPermissionState() {
        try {
            if (
                navigator.permissions &&
                navigator.permissions.query
            ) {
                const status =
                    await navigator.permissions.query({
                        name: "camera"
                    });

                return status.state || "unknown";
            }
        } catch (e) {
            /* Some browsers reject Permissions.query({ name: "camera" }). */
        }

        return "unknown";
    }

    function isFatalCameraError(err) {
        const name = err && err.name ? err.name : "";

        return (
            name === "NotAllowedError" ||
            name === "PermissionDeniedError" ||
            name === "SecurityError"
        );
    }

    async function pickCameraDeviceId(facingUser) {
        try {
            const devices =
                await navigator.mediaDevices.enumerateDevices();

            const cameras =
                devices.filter(
                    (device) =>
                        device.kind === "videoinput"
                );

            if (!cameras.length) {
                return null;
            }

            const frontCam = cameras.find((device) =>
                /front|user|face|integrated/i.test(
                    device.label
                )
            );

            const rearCam = cameras.find((device) =>
                /back|rear|environment|world/i.test(
                    device.label
                )
            );

            if (facingUser && frontCam) {
                return frontCam.deviceId;
            }

            if (!facingUser && rearCam) {
                return rearCam.deviceId;
            }

            if (!facingUser && cameras.length > 1) {
                return cameras[cameras.length - 1].deviceId;
            }

            return cameras[0].deviceId;
        } catch (e) {
            return null;
        }
    }

    async function requestCameraStream(facingUser) {
        const facingMode = facingUser
            ? "user"
            : "environment";

        const attempts = [
            {
                audio: false,
                video: {
                    facingMode: {
                        ideal: facingMode
                    },
                    width: {
                        ideal: 1280
                    },
                    height: {
                        ideal: 720
                    }
                }
            },
            {
                audio: false,
                video: {
                    facingMode: facingMode
                }
            }
        ];

        const deviceId =
            await pickCameraDeviceId(facingUser);

        if (deviceId) {
            attempts.push({
                audio: false,
                video: {
                    deviceId: {
                        ideal: deviceId
                    }
                }
            });
        }

        attempts.push({
            audio: false,
            video: true
        });

        let lastError = null;

        for (let i = 0; i < attempts.length; i += 1) {
            try {
                return await navigator.mediaDevices.getUserMedia(
                    attempts[i]
                );
            } catch (err) {
                lastError = err;

                if (isFatalCameraError(err)) {
                    throw err;
                }

                console.warn(
                    "[WEBZONE ER] Camera constraint attempt failed. Trying a simpler request.",
                    err
                );
            }
        }

        throw lastError || new Error(
            "Camera permission was granted, but no video track was returned."
        );
    }

    function attachLiveCameraFeed() {
        placeholder.style.display =
            "none";

        canvas.style.display =
            "block";

        resizeProcessingCanvas(
            video.videoWidth || 640,
            video.videoHeight || 480
        );

        setImmersiveCameraMode(
            isERMobile() || isERTablet()
        );

        video.dataset.facingMode =
            isFacingUser
                ? "user"
                : "environment";

        video.dataset.cameraMode =
            isFacingUser
                ? "front"
                : "back";

        canvas.classList.toggle(
            "camera-mirrored",
            isFacingUser
        );

        video.classList.toggle(
            "camera-mirrored",
            isFacingUser
        );

        setHighlightStep(6);

        startRenderLoop();

        console.log(
            "[WEBZONE ER] Camera started successfully:",
            {
                width: video.videoWidth,
                height: video.videoHeight,
                facingMode: isFacingUser
                    ? "user"
                    : "environment"
            }
        );
    }

    // ==========================================================
    // CAMERA STARTUP
    //
    // IMPORTANT:
    // Camera is requested independently from microphone.
    // This prevents a missing/blocked microphone from stopping
    // the WebZoneBW ER camera experience.
    // ==========================================================

    async function startCamera() {

        if (isCameraStarting) {
            return;
        }

        isCameraStarting = true;

        studioMode =
            "camera";

        isDemoMode =
            false;

        if (modeCameraBtn) {
            modeCameraBtn.classList.add(
                "active"
            );
        }

        if (modeUploadBtn) {
            modeUploadBtn.classList.remove(
                "active"
            );
        }

        if (uploadDropzone) {
            uploadDropzone.style.display =
                "none";
        }

        setHighlightStep(4);

        closePermissionAlert();

        try {

            // Browser support check
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                const unsupportedError =
                    new Error(
                        "Camera API is not available in this browser/context."
                    );

                unsupportedError.name =
                    "SecurityError";

                throw unsupportedError;
            }

            // Secure context check.
            // localhost is allowed by modern browsers.
            if (
                !window.isSecureContext &&
                location.hostname !==
                    "localhost" &&
                location.hostname !==
                    "127.0.0.1"
            ) {

                const securityError =
                    new Error(
                        "Camera requires HTTPS or localhost."
                    );

                securityError.name =
                    "SecurityError";

                throw securityError;
            }

            const permissionState =
                await queryCameraPermissionState();

            if (permissionState === "denied") {
                const deniedError =
                    new Error(
                        "Camera permission is blocked in the browser."
                    );

                deniedError.name =
                    "NotAllowedError";

                throw deniedError;
            }

            if (mediaStream) {

                mediaStream
                    .getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );

                mediaStream =
                    null;
            }

            if (video) {
                video.pause();
                video.srcObject = null;
            }

            /*
             * Windows often keeps the webcam locked for a
             * short time after track.stop(). Requesting a
             * new stream immediately causes NotReadableError.
             */
            await waitForCameraRelease(280);

            mediaStream =
                await requestCameraStream(
                    isFacingUser
                );

            // Verify an actual video track exists
            const videoTracks =
                mediaStream.getVideoTracks();

            if (
                !videoTracks ||
                videoTracks.length === 0
            ) {

                throw new Error(
                    "Camera permission was granted, but no video track was returned."
                );

            }

            setHighlightStep(5);

            video.setAttribute("playsinline", "true");
            video.setAttribute("webkit-playsinline", "true");
            video.muted = true;
            video.autoplay = true;
            video.playsInline = true;
            video.srcObject = mediaStream;

            isDemoMode = false;

            if (micStatusIndicator) {
                micStatusIndicator.style.display =
                    "none";
            }

            video.onloadedmetadata = () => {
                attachLiveCameraFeed();
            };

            try {
                await video.play();
            } catch (playError) {
                console.warn(
                    "[WEBZONE ER] video.play() was delayed by browser policy.",
                    playError
                );
            }

            if (video.readyState >= 2) {
                attachLiveCameraFeed();
            }

        } catch (err) {

            console.warn(
                "[WEBZONE ER] Camera access error:",
                err
            );

            if (mediaStream) {

                mediaStream
                    .getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );

                mediaStream =
                    null;
            }

            if (micStatusIndicator) {
                micStatusIndicator.style.display =
                    "none";
            }

            showPermissionAlert(
                err
            );

        } finally {
            isCameraStarting = false;
        }

    }

    window.webzoneStartERCamera = startCamera;

    // ==========================================================
    // DEMO MODE
    // ==========================================================

    function startDemoMode() {

        isDemoMode =
            true;

        setHighlightStep(5);

        stopCameraFeed();

        placeholder.style.display =
            "none";

        canvas.style.display =
            "block";

        resizeProcessingCanvas(640, 480);

        setHighlightStep(6);

        startRenderLoop();

    }

    // ==========================================================
    // STOP CAMERA
    // ==========================================================

    function stopCameraFeed() {

        erPerf.running = false;

        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }

        setImmersiveCameraMode(false);

        if (mediaStream) {

            mediaStream
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );

            mediaStream =
                null;
        }

        if (video) {

            video.pause();

            video.srcObject =
                null;

        }

        isDemoMode =
            false;

        isFaceDetected = false;
        detectionMethod = "scanning";
        faceDetectionConfidence = 0;

    }

    // ==========================================================
    // START BUTTON
    // ==========================================================

    if (startBtn) {

        startBtn.addEventListener(
            "click",
            () => {

                setHighlightStep(3);

                setTimeout(
                    () => {
                        startCamera();
                    },
                    150
                );

            }
        );

    }

    // ==========================================================
    // DEMO BUTTON
    // ==========================================================

    if (demoBtn) {

        demoBtn.addEventListener(
            "click",
            () => {

                setHighlightStep(3);

                setTimeout(
                    () => {
                        startDemoMode();
                    },
                    150
                );

            }
        );

    }

    // ==========================================================
    // STOP BUTTON
    // ==========================================================

    if (stopBtn) {

        stopBtn.addEventListener(
            "click",
            () => {

                stopCameraFeed();

                if (animFrameId) {

                    cancelAnimationFrame(
                        animFrameId
                    );

                    animFrameId =
                        null;
                }

                placeholder.style.display =
                    "flex";

                canvas.style.display =
                    "none";

                setHighlightStep(2);

            }
        );

    }

    // ==========================================================
    // CAMERA FLIP
    // ==========================================================

    if (flipBtn) {

        flipBtn.addEventListener(
            "click",
            async () => {

                isFacingUser =
                    !isFacingUser;

                if (
                    !isDemoMode &&
                    mediaStream
                ) {

                    await startCamera();

                }

            }
        );

    }

    // ==========================================================
    // SNAPSHOT
    // ==========================================================

    if (snapBtn) {

        snapBtn.addEventListener(
            "click",
            () => {

                if (
                    !mediaStream &&
                    !isDemoMode &&
                    studioMode !== "upload"
                ) {
                    startCamera();
                    return;
                }

                if (!canvas) {
                    return;
                }

                if (shutterFlashOverlay) {

                    shutterFlashOverlay.classList.add(
                        "flash"
                    );

                    setTimeout(
                        () => {

                            shutterFlashOverlay.classList.remove(
                                "flash"
                            );

                        },
                        120
                    );

                }

                try {

                    const AudioCtx =
                        window.AudioContext ||
                        window.webkitAudioContext;

                    if (AudioCtx) {

                        const actx =
                            new AudioCtx();

                        const osc =
                            actx.createOscillator();

                        const gain =
                            actx.createGain();

                        osc.type =
                            "sine";

                        osc.frequency.setValueAtTime(
                            800,
                            actx.currentTime
                        );

                        osc.frequency.exponentialRampToValueAtTime(
                            200,
                            actx.currentTime +
                                0.08
                        );

                        gain.gain.setValueAtTime(
                            0.3,
                            actx.currentTime
                        );

                        gain.gain.exponentialRampToValueAtTime(
                            0.01,
                            actx.currentTime +
                                0.08
                        );

                        osc.connect(gain);

                        gain.connect(
                            actx.destination
                        );

                        osc.start();

                        osc.stop(
                            actx.currentTime +
                                0.09
                        );

                    }

                } catch (e) {}

                const dataUrl =
                    canvas.toDataURL(
                        "image/png"
                    );

                if (snapshotImg) {
                    snapshotImg.src =
                        dataUrl;
                }

                if (downloadLink) {

                    downloadLink.href =
                        dataUrl;

                    downloadLink.download =
                        `webzone-hd-${currentFilter}-${Date.now()}.png`;

                }

                if (snapshotModal) {
                    snapshotModal.style.display =
                        "block";
                }

            }
        );

    }

    // ==========================================================
    // CLOSE SNAPSHOT
    // ==========================================================

    if (closeSnapBtn) {

        closeSnapBtn.addEventListener(
            "click",
            () => {

                if (snapshotModal) {
                    snapshotModal.style.display =
                        "none";
                }

            }
        );

    }

    // ==========================================================
    // AUDIO
    // ==========================================================

    if (audioBtn) {

        audioBtn.addEventListener(
            "click",
            () => {
                toggleAudio();
            }
        );

    }

    function toggleAudio() {

        if (!audioContext) {

            const AudioCtx =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioCtx) {
                return;
            }

            audioContext =
                new AudioCtx();

        }

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }

        if (isAudioPlaying) {

            soundNodes.forEach(
                (node) => {

                    try {

                        node.stop
                            ? node.stop()
                            : node.disconnect();

                    } catch (e) {}

                }
            );

            soundNodes = [];

            isAudioPlaying =
                false;

            audioBtn.innerHTML =
                '<span aria-hidden="true">🔊</span> Play Ambient Audio';

        } else {

            const osc =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();

            osc.type =
                "sine";

            osc.frequency.setValueAtTime(
                130,
                audioContext.currentTime
            );

            gain.gain.setValueAtTime(
                0.08,
                audioContext.currentTime
            );

            osc.connect(gain);

            gain.connect(
                audioContext.destination
            );

            osc.start();

            soundNodes.push(
                osc,
                gain
            );

            isAudioPlaying =
                true;

            audioBtn.innerHTML =
                '<span aria-hidden="true">🔇</span> Mute Audio';

        }

    }

    // ==========================================================
    // MAIN RENDER PIPELINE
    // ==========================================================

    function startRenderLoop() {

        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
        }

        erPerf.running = true;
        erPerf.frame = 0;

        function render() {
            if (!erPerf.running) return;

            const w = canvas.width || 640;
            const h = canvas.height || 480;
            const time = performance.now() * 0.001;
            erPerf.frame += 1;

            // Face detection is intentionally decoupled from the
            // paint loop. This prevents async detector work from
            // competing with every camera frame.
            if (
                erPerf.frame % (isERMobile() ? 4 : 2) === 0 &&
                time * 1000 - erPerf.lastFaceUpdate > (isERMobile() ? 180 : 120)
            ) {
                erPerf.lastFaceUpdate = time * 1000;
                updateFaceTracking();
            }

            // Base live feed
            if (studioMode === "upload" && uploadedImage) {
                ctx.drawImage(uploadedImage, 0, 0, w, h);
            } else if (isDemoMode) {
                drawDemoBackground(ctx, w, h);
            } else if (video.readyState >= 2) {
                ctx.drawImage(video, 0, 0, w, h);
            }

            // Auto-HD is deliberately throttled on phones/tablets.
            // The old version performed a full-frame getImageData()
            // on every RAF frame, which is the primary freeze risk.
            const enhancementWanted =
                isAutoHdEnabled &&
                !isERMobile() &&
                (
                    currentFilter === "cartoon" ||
                    currentFilter === "studiohd" ||
                    currentFilter === "cinematic" ||
                    activeMagazine !== "none"
                );

            if (enhancementWanted && erPerf.frame - erPerf.lastEnhance >= erPerf.enhancementInterval) {
                erPerf.lastEnhance = erPerf.frame;
                applyAutoQualityEnhancement(ctx, w, h);
            }

            // AI-style background depth can run at the normal paint rate
            // because it uses the already-rendered frame rather than a
            // second camera stream.
            if (currentFilter === "ai-background") {
                drawAIBackgroundDepth(ctx, w, h);
            }

            applyArtThemeShader(ctx, w, h, currentFilter, time);

            if (isStudioLightEnabled) {
                applyStudioVignette(ctx, w, h);
            }

            animFrameId = requestAnimationFrame(render);
        }

        render();
    }

    // ==========================================================
    // FACE TRACKING ENGINE
    // ==========================================================

    async function updateFaceTracking() {

        const now =
            performance.now();

        const time =
            now * 0.001;

        /*
         * Run native face detection asynchronously.
         *
         * Detection is throttled so mobile/tablet devices
         * do not have to process a face on every frame.
         */
        if (
            !isDemoMode &&
            video.readyState >= 2 &&
            !isDetectingFace &&
            (
                now -
                lastFaceDetectTimestamp
            ) > 120
        ) {

            lastFaceDetectTimestamp =
                now;

            if (nativeFaceDetector) {

                isDetectingFace =
                    true;

                try {

                    const faces =
                        await nativeFaceDetector.detect(
                            video
                        );

                    if (
                        faces &&
                        faces.length > 0
                    ) {

                        const b =
                            faces[0].boundingBox;

                        const vw =
                            video.videoWidth ||
                            640;

                        const vh =
                            video.videoHeight ||
                            480;

                        /*
                         * Normalize detector coordinates
                         * into 0 → 1 space.
                         */
                        const rawCx =
                            (
                                b.x +
                                b.width / 2
                            ) / vw;

                        const rawCy =
                            (
                                b.y +
                                b.height / 2
                            ) / vh;

                        const rawW =
                            b.width / vw;

                        const rawH =
                            b.height / vh;

                        /*
                         * Account for front-camera mirroring.
                         */
                        faceBox.targetX =
                            isFacingUser
                                ? 1 - rawCx
                                : rawCx;

                        faceBox.targetY =
                            rawCy;

                        /*
                         * Expand the detected box slightly
                         * so face-mounted effects have room.
                         */
                        faceBox.targetW =
                            Math.max(
                                0.24,
                                Math.min(
                                    0.55,
                                    rawW * 1.15
                                )
                            );

                        faceBox.targetH =
                            Math.max(
                                0.32,
                                Math.min(
                                    0.65,
                                    rawH * 1.25
                                )
                            );

                        /*
                         * Native FaceDetector does not expose
                         * a universal confidence percentage.
                         *
                         * Keep this as an internal "detected"
                         * state rather than presenting a fake
                         * biometric certainty to the user.
                         */
                        faceDetectionConfidence = 100;
                        isFaceDetected = true;
                        detectionMethod = "native";

                    } else {
                        isFaceDetected = false;
                    }

                } catch (e) {

                    console.warn(
                        "[WEBZONE ER] Face detection temporarily unavailable.",
                        e
                    );

                } finally {

                    isDetectingFace =
                        false;

                }

            } else {

                // Lightweight browser fallback for Safari/iOS and
                // browsers that do not expose FaceDetector.
                try {
                    if (analysisCanvas && analysisCtx) {
                        analysisCtx.drawImage(video, 0, 0, 48, 36);
                        const pixels = analysisCtx.getImageData(0, 0, 48, 36).data;
                        let skin = 0;
                        let samples = 0;

                        for (let py = 4; py < 32; py += 2) {
                            for (let px = 4; px < 44; px += 2) {
                                const idx = (py * 48 + px) * 4;
                                const r = pixels[idx];
                                const g = pixels[idx + 1];
                                const b = pixels[idx + 2];
                                const max = Math.max(r, g, b);
                                const min = Math.min(r, g, b);
                                if (r > 70 && g > 35 && b > 20 && r > g * 1.08 && g > b * 1.05 && max - min > 18) skin++;
                                samples++;
                            }
                        }

                        const ratio = skin / Math.max(1, samples);
                        isFaceDetected = ratio > 0.14;
                        detectionMethod = isFaceDetected ? "chrominance" : "scanning";
                        faceDetectionConfidence = Math.max(0, Math.min(99, ratio * 220));

                        if (isFaceDetected) {
                            faceBox.targetX = 0.5;
                            faceBox.targetY = 0.42;
                            faceBox.targetW = 0.32;
                            faceBox.targetH = 0.44;
                        }
                    }
                } catch (e) {
                    isFaceDetected = false;
                    detectionMethod = "scanning";
                }

            }

        }

        /*
         * Smooth interpolation.
         *
         * This prevents filters from jumping around when
         * the detector updates its bounding box.
         */
        faceBox.x +=
            (
                faceBox.targetX -
                faceBox.x
            ) *
            0.18;

        faceBox.y +=
            (
                faceBox.targetY -
                faceBox.y
            ) *
            0.18;

        if (faceBox.targetW) {

            faceBox.w +=
                (
                    faceBox.targetW -
                    faceBox.w
                ) *
                0.15;

        }

        if (faceBox.targetH) {

            faceBox.h +=
                (
                    faceBox.targetH -
                    faceBox.h
                ) *
                0.15;

        }

    }

    // ==========================================================
    // AUTO-HD IMAGE ENHANCEMENT
    // ==========================================================

    function applyAutoQualityEnhancement(
        ctx,
        w,
        h
    ) {

        try {

            const imgData =
                ctx.getImageData(
                    0,
                    0,
                    w,
                    h
                );

            const d =
                imgData.data;

            /*
             * Moderate contrast enhancement.
             *
             * Kept deliberately lightweight for mobile
             * devices.
             */
            const contrast =
                1.15;

            const intercept =
                128 *
                (
                    1 -
                    contrast
                );

            for (
                let i = 0;
                i < d.length;
                i += 4
            ) {

                d[i] =
                    d[i] *
                    contrast +
                    intercept;

                d[i + 1] =
                    d[i + 1] *
                    contrast +
                    intercept;

                d[i + 2] =
                    d[i + 2] *
                    contrast +
                    intercept;

                /*
                 * Vibrance enhancement.
                 */
                const avg =
                    (
                        d[i] +
                        d[i + 1] +
                        d[i + 2]
                    ) / 3;

                const max =
                    Math.max(
                        d[i],
                        d[i + 1],
                        d[i + 2]
                    );

                const amount =
                    (
                        (
                            max -
                            avg
                        ) /
                        255
                    ) *
                    1.3;

                if (
                    amount > 0
                ) {

                    d[i] +=
                        (
                            d[i] -
                            avg
                        ) *
                        amount;

                    d[i + 1] +=
                        (
                            d[i + 1] -
                            avg
                        ) *
                        amount;

                    d[i + 2] +=
                        (
                            d[i + 2] -
                            avg
                        ) *
                        amount;

                }

            }

            ctx.putImageData(
                imgData,
                0,
                0
            );

        } catch (e) {

            /*
             * Enhancement is optional.
             * Never allow it to stop the camera.
             */

        }

    }

    // ==========================================================
    // STUDIO VIGNETTE
    // ==========================================================

    function applyStudioVignette(
        ctx,
        w,
        h
    ) {

        ctx.save();

        const rad =
            ctx.createRadialGradient(
                w / 2,
                h / 2,
                Math.min(w, h) * 0.35,
                w / 2,
                h / 2,
                Math.max(w, h) * 0.75
            );

        rad.addColorStop(
            0,
            "transparent"
        );

        rad.addColorStop(
            1,
            "rgba(0, 0, 0, 0.45)"
        );

        ctx.fillStyle =
            rad;

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        ctx.restore();

    }

    // ==========================================================
    // LIGHTWEIGHT AI-STYLE BACKGROUND DEPTH
    // ==========================================================
    function drawAIBackgroundDepth(ctx, w, h) {
        if (!isFaceDetected) return;

        // Lightweight on-device depth styling. It uses the detected face
        // box and a radial mask instead of running a heavyweight ML model
        // every frame, keeping mobile/tablet camera playback smooth.
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const radius = Math.max(w, h) * 0.58;

        ctx.save();
        const grad = ctx.createRadialGradient(cx, cy, radius * 0.22, cx, cy, radius);
        grad.addColorStop(0, "rgba(5,5,7,0)");
        grad.addColorStop(0.52, "rgba(5,5,7,.05)");
        grad.addColorStop(0.78, "rgba(5,5,7,.28)");
        grad.addColorStop(1, "rgba(5,5,7,.62)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "rgba(56,189,248,.28)";
        ctx.lineWidth = Math.max(1.5, w * 0.002);
        ctx.beginPath();
        ctx.ellipse(cx, cy, faceBox.w * w * 0.62, faceBox.h * h * 0.68, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // ==========================================================
    // DOLLAR RAIN
    // ==========================================================
    function drawDollarRainEffect(ctx, w, h, time) {
        ctx.save();
        ctx.font = `700 ${Math.max(16, Math.min(34, w * 0.035))}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const count = isERMobile() ? 18 : 30;
        for (let i = 0; i < count; i++) {
            const x = ((i * 83.17) % 100) / 100 * w;
            const speed = 0.05 + ((i * 17) % 9) * 0.008;
            const y = ((time * speed + i * 0.071) % 1.25 - 0.12) * h;
            const rot = Math.sin(time * 2 + i) * 0.35;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.globalAlpha = 0.45 + ((i * 13) % 5) * 0.1;
            ctx.fillStyle = "#7dffb2";
            ctx.shadowColor = "rgba(125,255,178,.8)";
            ctx.shadowBlur = 8;
            ctx.fillText("$", 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    // ==========================================================
    // STYLIZED CELEBRITY-INSPIRED SPOTLIGHT
    // ==========================================================
    function drawCelebritySpotlight(ctx, w, h, time) {
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const rx = Math.max(55, faceBox.w * w * 0.62);
        const ry = Math.max(75, faceBox.h * h * 0.62);

        ctx.save();
        ctx.globalAlpha = 0.22;
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry) * 1.5);
        halo.addColorStop(0, "rgba(56,189,248,.65)");
        halo.addColorStop(.55, "rgba(168,85,247,.25)");
        halo.addColorStop(1, "transparent");
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = "rgba(125,255,178,.9)";
        ctx.lineWidth = Math.max(2, w * 0.004);
        ctx.shadowColor = "rgba(125,255,178,.8)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, Math.sin(time) * 0.015, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = `700 ${Math.max(11, Math.min(18, w * 0.02))}px Orbitron, Arial, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,.92)";
        ctx.textAlign = "center";
        ctx.fillText("CELEBRITY SPOTLIGHT • WEBZONEBW", cx, Math.max(18, cy - ry - 14));
        ctx.restore();
    }

    // ==========================================================
    // MASTER FILTER SHADER ROUTER
    // ==========================================================

    function applyArtThemeShader(
        ctx,
        w,
        h,
        filter,
        time
    ) {

        switch (filter) {

            // ==================================================
            // REALISTIC AR
            // ==================================================

            case "goldenhour":

                drawGoldenHourGlam(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "sunglasses":

                drawDesignerAviators(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "halo":

                drawNeonAngelHalo(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "vintage90s":

                drawVintage90sFilm(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "kawaii":

                drawKawaiiAnimeBlush(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "cyberwarrior":

                drawCyberWarriorFacePaint(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "noir":

                drawLeicaNoirCinema(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "icefrost":

                drawDiamondIceFrost(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            // (webzonebw removed — drawWebZoneBWTheme not implemented)

            // ==================================================
            // ART / PORTRAIT
            // ==================================================

            case "cartoon":

                drawCartoonCelShader(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "studiohd":

                drawStudioPortraitHD(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "popart":

                drawPopArtMatrix(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "cyberpunk":

                drawCyberpunkNeon(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "cinematic":

                drawCinematic35mm(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            // ==================================================
            // TECHNOLOGY
            // ==================================================

            // (cyberhud, matrix, devops, cybersec, hologram removed — functions not implemented)

            case "glitch":

                drawDigitalGlitch(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            case "space":

                drawSpaceExplorer(
                    ctx,
                    w,
                    h,
                    time
                );

                break;

            // (superhero, pumpkin, ghost, zombie, vampire, skeleton, spider, bats removed — functions not implemented)

            case "dollar-rain":

                drawDollarRainEffect(ctx, w, h, time);

                break;

            case "celebrity-spotlight":

                drawCelebritySpotlight(ctx, w, h, time);

                break;

            default:

                break;

        }

    }

    // ==========================================================
    // GOLDEN HOUR GLAM
    // ==========================================================

    function drawGoldenHourGlam(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const cx =
            faceBox.x * w;

        const cy =
            faceBox.y * h;

        const rx =
            (
                faceBox.w *
                w
            ) / 2;

        const ry =
            (
                faceBox.h *
                h
            ) / 2;

        // Warm cinematic lighting
        const sunGrad =
            ctx.createRadialGradient(
                0,
                0,
                50,
                w * 0.5,
                h * 0.5,
                w
            );

        sunGrad.addColorStop(
            0,
            "rgba(251, 191, 36, 0.28)"
        );

        sunGrad.addColorStop(
            0.4,
            "rgba(249, 115, 22, 0.16)"
        );

        sunGrad.addColorStop(
            0.8,
            "rgba(217, 70, 239, 0.08)"
        );

        sunGrad.addColorStop(
            1,
            "rgba(15, 23, 42, 0.15)"
        );

        ctx.fillStyle =
            sunGrad;

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        // Flare particles
        for (
            let i = 1;
            i <= 4;
            i++
        ) {

            const fx =
                i * 0.2 * w;

            const fy =
                i * 0.2 * h;

            const rad =
                14 * i;

            const flareGrad =
                ctx.createRadialGradient(
                    fx,
                    fy,
                    0,
                    fx,
                    fy,
                    rad
                );

            flareGrad.addColorStop(
                0,
                `rgba(253, 224, 71, ${0.35 / i})`
            );

            flareGrad.addColorStop(
                0.7,
                `rgba(249, 115, 22, ${0.15 / i})`
            );

            flareGrad.addColorStop(
                1,
                "transparent"
            );

            ctx.fillStyle =
                flareGrad;

            ctx.beginPath();

            ctx.arc(
                fx,
                fy,
                rad,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

        // Face-aware blush
        const leftCheekX =
            cx -
            rx * 0.45;

        const rightCheekX =
            cx +
            rx * 0.45;

        const cheekY =
            cy +
            ry * 0.12;

        const blushR =
            Math.max(
                16,
                rx * 0.28
            );

        [
            leftCheekX,
            rightCheekX
        ].forEach(
            (bx) => {

                const blush =
                    ctx.createRadialGradient(
                        bx,
                        cheekY,
                        0,
                        bx,
                        cheekY,
                        blushR
                    );

                blush.addColorStop(
                    0,
                    "rgba(244, 114, 182, 0.28)"
                );

                blush.addColorStop(
                    0.6,
                    "rgba(251, 113, 133, 0.12)"
                );

                blush.addColorStop(
                    1,
                    "transparent"
                );

                ctx.fillStyle =
                    blush;

                ctx.beginPath();

                ctx.arc(
                    bx,
                    cheekY,
                    blushR,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }
        );

        // Eye catchlights
        ctx.fillStyle =
            "rgba(255,255,255,0.9)";

        ctx.shadowColor =
            "#fde047";

        ctx.shadowBlur =
            8;

        ctx.beginPath();

        ctx.arc(
            cx - rx * 0.35,
            cy - ry * 0.16,
            3.5,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cx + rx * 0.35,
            cy - ry * 0.16,
            3.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

    // ==========================================================
    // DESIGNER AVIATORS
    // ==========================================================

    function drawDesignerAviators(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const cx =
            faceBox.x * w;

        const cy =
            faceBox.y * h -
            (
                faceBox.h *
                h *
                0.14
            );

        const rx =
            (
                faceBox.w *
                w
            ) / 2;

        const lensW =
            rx * 0.44;

        const lensH =
            rx * 0.38;

        const bridgeGap =
            rx * 0.16;

        ctx.shadowColor =
            "rgba(0,0,0,0.6)";

        ctx.shadowBlur =
            12;

        ctx.shadowOffsetY =
            6;

        const leftX =
            cx -
            bridgeGap -
            lensW / 2;

        const rightX =
            cx +
            bridgeGap +
            lensW / 2;

        function drawAviatorLens(
            x,
            y,
            isRight
        ) {

            ctx.save();

            ctx.beginPath();

            ctx.ellipse(
                x,
                y,
                lensW / 2,
                lensH / 2,
                isRight
                    ? 0.08
                    : -0.08,
                0,
                Math.PI * 2
            );

            const lensGrad =
                ctx.createLinearGradient(
                    x,
                    y - lensH / 2,
                    x,
                    y + lensH / 2
                );

            lensGrad.addColorStop(
                0,
                "rgba(244, 63, 94, 0.88)"
            );

            lensGrad.addColorStop(
                0.5,
                "rgba(251, 146, 60, 0.85)"
            );

            lensGrad.addColorStop(
                1,
                "rgba(56, 189, 248, 0.88)"
            );

            ctx.fillStyle =
                lensGrad;

            ctx.fill();

            ctx.lineWidth =
                3.5;

            ctx.strokeStyle =
                "#eab308";

            ctx.shadowColor =
                "#facc15";

            ctx.shadowBlur =
                4;

            ctx.stroke();

            // Animated glass glint
            const glint =
                ctx.createLinearGradient(
                    x - lensW / 2,
                    y - lensH / 2,
                    x + lensW / 2,
                    y + lensH / 2
                );

            const sheenPos =
                (
                    Math.sin(
                        time * 1.5
                    ) *
                    0.3
                ) +
                0.5;

            glint.addColorStop(
                Math.max(
                    0,
                    sheenPos - 0.2
                ),
                "transparent"
            );

            glint.addColorStop(
                sheenPos,
                "rgba(255,255,255,0.45)"
            );

            glint.addColorStop(
                Math.min(
                    1,
                    sheenPos + 0.2
                ),
                "transparent"
            );

            ctx.fillStyle =
                glint;

            ctx.fill();

            ctx.restore();

        }

        drawAviatorLens(
            leftX,
            cy,
            false
        );

        drawAviatorLens(
            rightX,
            cy,
            true
        );

        // Bridge
        ctx.strokeStyle =
            "#eab308";

        ctx.lineWidth =
            3;

        ctx.beginPath();

        ctx.moveTo(
            leftX +
                lensW *
                0.2,
            cy -
                lensH *
                0.4
        );

        ctx.lineTo(
            rightX -
                lensW *
                0.2,
            cy -
                lensH *
                0.4
        );

        ctx.moveTo(
            leftX +
                lensW *
                0.42,
            cy
        );

        ctx.lineTo(
            rightX -
                lensW *
                0.42,
            cy
        );

        ctx.stroke();

        ctx.restore();

    }

    // ==========================================================
    // NEON ANGEL HALO
    // ==========================================================

    function drawNeonAngelHalo(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const cx =
            faceBox.x * w;

        const cy =
            (
                faceBox.y * h
            ) -
            (
                faceBox.h *
                h *
                0.6
            ) +
            Math.sin(
                time * 3
            ) *
            8;

        const haloRx =
            (
                faceBox.w *
                w
            ) *
            0.45;

        const haloRy =
            haloRx *
            0.32;

        ctx.shadowColor =
            "#fde047";

        ctx.shadowBlur =
            28;

        ctx.strokeStyle =
            "#fef08a";

        ctx.lineWidth =
            6;

        ctx.beginPath();

        ctx.ellipse(
            cx,
            cy,
            haloRx,
            haloRy,
            -0.05,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.shadowBlur =
            10;

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth =
            3;

        ctx.stroke();

        // Floating particles
        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const angle =
                (
                    time * 1.5 +
                    (
                        i *
                        Math.PI *
                        2 /
                        7
                    )
                ) %
                (
                    Math.PI *
                    2
                );

            const sx =
                cx +
                Math.cos(angle) *
                (
                    haloRx +
                    12
                );

            const sy =
                cy +
                Math.sin(angle) *
                (
                    haloRy +
                    6
                ) -
                (
                    Math.sin(
                        time * 2 +
                        i
                    ) *
                    14
                );

            const sparkSize =
                2 +
                Math.sin(
                    time * 4 +
                    i
                ) *
                1.5;

            ctx.fillStyle =
                "#ffffff";

            ctx.shadowColor =
                "#fde047";

            ctx.shadowBlur =
                12;

            ctx.beginPath();

            ctx.arc(
                sx,
                sy,
                Math.max(
                    1,
                    sparkSize
                ),
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

        ctx.restore();

    }

    // ==========================================================
    // VINTAGE 90S FILM
    // ==========================================================

    function drawVintage90sFilm(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const filmGrad =
            ctx.createLinearGradient(
                0,
                0,
                w,
                h
            );

        filmGrad.addColorStop(
            0,
            "rgba(245,158,11,0.12)"
        );

        filmGrad.addColorStop(
            0.5,
            "rgba(234,88,12,0.08)"
        );

        filmGrad.addColorStop(
            1,
            "rgba(120,53,15,0.14)"
        );

        ctx.fillStyle =
            filmGrad;

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        // Film grain
        ctx.fillStyle =
            "rgba(0,0,0,0.08)";

        const step =
            8;

        for (
            let x = 0;
            x < w;
            x += step * 3
        ) {

            for (
                let y = 0;
                y < h;
                y += step * 3
            ) {

                if (
                    Math.random() >
                    0.6
                ) {

                    ctx.fillRect(
                        x +
                            Math.random() *
                            4,
                        y +
                            Math.random() *
                            4,
                        2,
                        2
                    );

                }

            }

        }

        ctx.font =
            "bold 20px 'Courier New', monospace";

        ctx.fillStyle =
            "#ff6b00";

        ctx.shadowColor =
            "rgba(255,107,0,0.8)";

        ctx.shadowBlur =
            10;

        ctx.textAlign =
            "right";

        ctx.fillText(
            "'98 10 31 PM 08:42",
            w - 24,
            h - 24
        );

        ctx.restore();

    }

    // ==========================================================
    // KAWAII ANIME
    // ==========================================================

    function drawKawaiiAnimeBlush(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const cx =
            faceBox.x * w;

        const cy =
            faceBox.y * h;

        const rx =
            (
                faceBox.w *
                w
            ) / 2;

        const ry =
            (
                faceBox.h *
                h
            ) / 2;

        const cheekY =
            cy +
            ry * 0.14;

        const blushR =
            Math.max(
                18,
                rx * 0.28
            );

        [
            cx - rx * 0.46,
            cx + rx * 0.46
        ].forEach(
            (bx) => {

                const bgrad =
                    ctx.createRadialGradient(
                        bx,
                        cheekY,
                        0,
                        bx,
                        cheekY,
                        blushR
                    );

                bgrad.addColorStop(
                    0,
                    "rgba(244,114,182,0.45)"
                );

                bgrad.addColorStop(
                    0.7,
                    "rgba(251,113,133,0.2)"
                );

                bgrad.addColorStop(
                    1,
                    "transparent"
                );

                ctx.fillStyle =
                    bgrad;

                ctx.beginPath();

                ctx.arc(
                    bx,
                    cheekY,
                    blushR,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.strokeStyle =
                    "rgba(244,63,94,0.7)";

                ctx.lineWidth =
                    2.5;

                for (
                    let i = -1;
                    i <= 1;
                    i++
                ) {

                    ctx.beginPath();

                    ctx.moveTo(
                        bx +
                            i * 7 -
                            4,
                        cheekY -
                            5
                    );

                    ctx.lineTo(
                        bx +
                            i * 7 +
                            4,
                        cheekY +
                            5
                    );

                    ctx.stroke();

                }

            }
        );

        // Nose blush
        const noseGrad =
            ctx.createRadialGradient(
                cx,
                cy +
                    ry *
                    0.05,
                0,
                cx,
                cy +
                    ry *
                    0.05,
                rx *
                    0.14
            );

        noseGrad.addColorStop(
            0,
            "rgba(251,113,133,0.4)"
        );

        noseGrad.addColorStop(
            1,
            "transparent"
        );

        ctx.fillStyle =
            noseGrad;

        ctx.beginPath();

        ctx.arc(
            cx,
            cy +
                ry *
                0.05,
            rx *
                0.14,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Floating sparkles
        ctx.fillStyle =
            "#ffffff";

        ctx.shadowColor =
            "#f472b6";

        ctx.shadowBlur =
            12;

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const angle =
                time *
                    2 +
                (
                    i *
                    Math.PI *
                    2 /
                    5
                );

            const sx =
                cx +
                Math.cos(angle) *
                (
                    rx *
                    0.9
                );

            const sy =
                cy +
                Math.sin(angle) *
                (
                    ry *
                    0.8
                ) -
                10;

            ctx.font =
                "20px sans-serif";

            ctx.fillText(
                i % 2 === 0
                    ? "✨"
                    : "💖",
                sx - 10,
                sy
            );

        }

        ctx.restore();

    }

    // ==========================================================
    // CYBER WARRIOR
    // ==========================================================

    function drawCyberWarriorFacePaint(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const cx =
            faceBox.x * w;

        const cy =
            faceBox.y * h;

        const rx =
            (
                faceBox.w *
                w
            ) / 2;

        const ry =
            (
                faceBox.h *
                h
            ) / 2;

        ctx.shadowColor =
            "#38bdf8";

        ctx.shadowBlur =
            14;

        ctx.strokeStyle =
            "#38bdf8";

        ctx.lineWidth =
            3;

        // Left cheek
        ctx.beginPath();

        ctx.moveTo(
            cx -
                rx *
                0.3,
            cy +
                ry *
                0.05
        );

        ctx.lineTo(
            cx -
                rx *
                0.75,
            cy +
                ry *
                0.18
        );

        ctx.lineTo(
            cx -
                rx *
                0.9,
            cy +
                ry *
                0.4
        );

        ctx.stroke();

        // Right cheek
        ctx.beginPath();

        ctx.moveTo(
            cx +
                rx *
                0.3,
            cy +
                ry *
                0.05
        );

        ctx.lineTo(
            cx +
                rx *
                0.75,
            cy +
                ry *
                0.18
        );

        ctx.lineTo(
            cx +
                rx *
                0.9,
            cy +
                ry *
                0.4
        );

        ctx.stroke();

        // Forehead sigil
        ctx.shadowColor =
            "#ec4899";

        ctx.strokeStyle =
            "#ec4899";

        ctx.beginPath();

        ctx.moveTo(
            cx,
            cy -
                ry *
                0.65
        );

        ctx.lineTo(
            cx - 16,
            cy -
                ry *
                0.45
        );

        ctx.lineTo(
            cx,
            cy -
                ry *
                0.3
        );

        ctx.lineTo(
            cx + 16,
            cy -
                ry *
                0.45
        );

        ctx.closePath();

        ctx.stroke();

        ctx.restore();

    }

    // ==========================================================
    // LEICA NOIR
    // ==========================================================

    function drawLeicaNoirCinema(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        try {

            const imgData =
                ctx.getImageData(
                    0,
                    0,
                    w,
                    h
                );

            const d =
                imgData.data;

            for (
                let i = 0;
                i < d.length;
                i += 4
            ) {

                let lum =
                    (
                        d[i] *
                        0.299
                    ) +
                    (
                        d[i + 1] *
                        0.587
                    ) +
                    (
                        d[i + 2] *
                        0.114
                    );

                lum =
                    lum < 128
                        ? (
                            lum *
                            lum
                        ) /
                            128
                        : 255 -
                            (
                                (
                                    255 -
                                    lum
                                ) *
                                (
                                    255 -
                                    lum
                                )
                            ) /
                                128;

                d[i] =
                    lum;

                d[i + 1] =
                    lum;

                d[i + 2] =
                    lum;

            }

            ctx.putImageData(
                imgData,
                0,
                0
            );

        } catch (e) {}

        const noirVignette =
            ctx.createRadialGradient(
                w / 2,
                h / 2,
                Math.min(w, h) *
                    0.3,
                w / 2,
                h / 2,
                Math.max(w, h) *
                    0.72
            );

        noirVignette.addColorStop(
            0,
            "transparent"
        );

        noirVignette.addColorStop(
            1,
            "rgba(0,0,0,0.75)"
        );

        ctx.fillStyle =
            noirVignette;

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        ctx.font =
            "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";

        ctx.fillStyle =
            "#ffffff";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "LEICA NOIR 35MM • F/1.4",
            w / 2,
            h - 16
        );

        ctx.restore();

    }

    // ==========================================================
    // DIAMOND ICE FROST
    // ==========================================================

    function drawDiamondIceFrost(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const cx =
            faceBox.x * w;

        const cy =
            faceBox.y * h;

        const rx =
            (
                faceBox.w *
                w
            ) / 2;

        const ry =
            (
                faceBox.h *
                h
            ) / 2;

        const frostGrad =
            ctx.createRadialGradient(
                cx,
                cy,
                rx * 0.5,
                w / 2,
                h / 2,
                Math.max(w, h)
            );

        frostGrad.addColorStop(
            0,
            "transparent"
        );

        frostGrad.addColorStop(
            0.7,
            "rgba(186,230,253,0.1)"
        );

        frostGrad.addColorStop(
            1,
            "rgba(56,189,248,0.25)"
        );

        ctx.fillStyle =
            frostGrad;

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        const sparklePoints = [

            {
                x:
                    cx -
                    rx *
                    0.48,

                y:
                    cy +
                    ry *
                    0.1
            },

            {
                x:
                    cx +
                    rx *
                    0.48,

                y:
                    cy +
                    ry *
                    0.1
            },

            {
                x:
                    cx -
                    rx *
                    0.35,

                y:
                    cy -
                    ry *
                    0.18
            },

            {
                x:
                    cx +
                    rx *
                    0.35,

                y:
                    cy -
                    ry *
                    0.18
            },

            {
                x:
                    cx,

                y:
                    cy -
                    ry *
                    0.4
            }

        ];

        sparklePoints.forEach(
            (pt, idx) => {

                const rot =
                    time *
                        2 +
                    idx;

                const size =
                    12 +
                    Math.sin(
                        time *
                            4 +
                            idx
                    ) *
                    5;

                ctx.save();

                ctx.translate(
                    pt.x,
                    pt.y
                );

                ctx.rotate(
                    rot
                );

                ctx.shadowColor =
                    "#38bdf8";

                ctx.shadowBlur =
                    16;

                ctx.strokeStyle =
                    "#ffffff";

                ctx.lineWidth =
                    2.5;

                ctx.beginPath();

                ctx.moveTo(
                    -size,
                    0
                );

                ctx.lineTo(
                    size,
                    0
                );

                ctx.moveTo(
                    0,
                    -size
                );

                ctx.lineTo(
                    0,
                    size
                );

                ctx.stroke();

                ctx.fillStyle =
                    "#bae6fd";

                ctx.beginPath();

                ctx.arc(
                    0,
                    0,
                    3,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.restore();

            }
        );

        ctx.restore();

    }

    // ==========================================================
    // CARTOON / ANIME CEL SHADER
    // ==========================================================

    function drawCartoonCelShader(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        try {

            const imgData =
                ctx.getImageData(
                    0,
                    0,
                    w,
                    h
                );

            const d =
                imgData.data;

            const step =
                48;

            for (
                let i = 0;
                i < d.length;
                i += 4
            ) {

                d[i] =
                    Math.min(
                        255,
                        Math.floor(
                            d[i] /
                            step
                        ) *
                            step +
                            step / 2
                    );

                d[i + 1] =
                    Math.min(
                        255,
                        Math.floor(
                            d[i + 1] /
                            step
                        ) *
                            step +
                            step / 2
                    );

                d[i + 2] =
                    Math.min(
                        255,
                        Math.floor(
                            d[i + 2] /
                            step
                        ) *
                            step +
                            step / 2
                    );

            }

            ctx.putImageData(
                imgData,
                0,
                0
            );

        } catch (e) {}

        // Comic frame
        ctx.strokeStyle =
            "#000000";

        ctx.lineWidth =
            6;

        ctx.strokeRect(
            3,
            3,
            w - 6,
            h - 6
        );

        // Action lines
        ctx.strokeStyle =
            "rgba(0,0,0,0.4)";

        ctx.lineWidth =
            2;

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            ctx.beginPath();

            ctx.moveTo(
                w -
                    i *
                    20,
                0
            );

            ctx.lineTo(
                w,
                i *
                    20
            );

            ctx.stroke();

        }

        // Face sparkle
        const cx =
            faceBox.x * w;

        const cy =
            faceBox.y * h;

        ctx.fillStyle =
            "#fde047";

        ctx.font =
            "24px sans-serif";

        ctx.fillText(
            "✨",
            cx +
                h *
                0.12,
            cy -
                h *
                0.1
        );

        ctx.restore();

    }

    // ==========================================================
    // STUDIO PORTRAIT HD
    // ==========================================================

    function drawStudioPortraitHD(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const cx =
            faceBox.x * w;

        const cy =
            faceBox.y * h;

        const grad =
            ctx.createLinearGradient(
                0,
                0,
                w,
                h
            );

        grad.addColorStop(
            0,
            "rgba(251,146,60,0.12)"
        );

        grad.addColorStop(
            0.5,
            "transparent"
        );

        grad.addColorStop(
            1,
            "rgba(147,51,234,0.1)"
        );

        ctx.fillStyle =
            grad;

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        // Subtle eye catchlights
        ctx.fillStyle =
            "rgba(255,255,255,0.85)";

        ctx.beginPath();

        ctx.arc(
            cx -
                h *
                0.055,
            cy -
                h *
                0.02,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cx +
                h *
                0.055,
            cy -
                h *
                0.02,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

    // ==========================================================
    // POP ART MATRIX
    // ==========================================================

    function drawPopArtMatrix(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        ctx.fillStyle =
            "rgba(236,72,153,0.15)";

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        // Halftone dots
        ctx.fillStyle =
            "rgba(0,0,0,0.12)";

        for (
            let x = 10;
            x < w;
            x += 18
        ) {

            for (
                let y = 10;
                y < h;
                y += 18
            ) {

                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    2.5,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }

        }

        // Speech bubble
        const cx =
            faceBox.x * w;

        const cy =
            faceBox.y * h;

        const bx =
            cx +
            h *
            0.08;

        const by =
            cy -
            h *
            0.18;

        ctx.fillStyle =
            "#ffffff";

        ctx.strokeStyle =
            "#000000";

        ctx.lineWidth =
            3;

        ctx.beginPath();

        ctx.roundRect(
            bx,
            by,
            110,
            36,
            12
        );

        ctx.fill();

        ctx.stroke();

        ctx.fillStyle =
            "#000000";

        ctx.font =
            "bold 13px sans-serif";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "POW! ✨",
            bx + 55,
            by + 22
        );

        ctx.restore();

    }

    // ==========================================================
    // CYBERPUNK NEON
    // ==========================================================

    function drawCyberpunkNeon(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const grad =
            ctx.createLinearGradient(
                0,
                0,
                w,
                0
            );

        grad.addColorStop(
            0,
            "rgba(6,182,212,0.22)"
        );

        grad.addColorStop(
            1,
            "rgba(236,72,153,0.22)"
        );

        ctx.fillStyle =
            grad;

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        // Animated scan line
        ctx.strokeStyle =
            "rgba(34,211,238,0.6)";

        ctx.lineWidth =
            1;

        const gy =
            (
                time *
                120
            ) %
            h;

        ctx.beginPath();

        ctx.moveTo(
            0,
            gy
        );

        ctx.lineTo(
            w,
            gy
        );

        ctx.stroke();

        ctx.restore();

    }

    // ==========================================================
    // CINEMATIC 35MM
    // ==========================================================

    function drawCinematic35mm(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const barH =
            h *
            0.11;

        // Letterbox
        ctx.fillStyle =
            "#000000";

        ctx.fillRect(
            0,
            0,
            w,
            barH
        );

        ctx.fillRect(
            0,
            h -
                barH,
            w,
            barH
        );

        // Teal/orange grade
        const grad =
            ctx.createLinearGradient(
                0,
                0,
                0,
                h
            );

        grad.addColorStop(
            0,
            "rgba(15,118,110,0.15)"
        );

        grad.addColorStop(
            0.5,
            "rgba(249,115,22,0.12)"
        );

        grad.addColorStop(
            1,
            "rgba(15,23,42,0.2)"
        );

        ctx.fillStyle =
            grad;

        ctx.fillRect(
            0,
            barH,
            w,
            h -
                barH *
                2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "10px monospace";

        ctx.textAlign =
            "left";

        ctx.fillText(
            "REC ● 4K 24FPS | 35MM ANAMORPHIC",
            20,
            barH - 8
        );

        ctx.restore();

    }

    // ==========================================================
    // DIGITAL GLITCH
    // ==========================================================

    function drawDigitalGlitch(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const sliceCount =
            8;

        for (
            let i = 0;
            i < sliceCount;
            i++
        ) {

            if (
                Math.sin(
                    time *
                        12 +
                        i *
                        4
                ) >
                0.4
            ) {

                const sy =
                    Math.floor(
                        (
                            Math.sin(
                                time *
                                    8 +
                                    i *
                                    2
                            ) *
                            0.5 +
                            0.5
                        ) *
                        (
                            h -
                            40
                        )
                    );

                const sHeight =
                    Math.floor(
                        Math.random() *
                            20 +
                            8
                    );

                const shiftX =
                    (
                        Math.sin(
                            time *
                                25 +
                                i *
                                7
                        ) >
                        0
                            ? 1
                            : -1
                    ) *
                    Math.floor(
                        Math.random() *
                            22 +
                            6
                    );

                try {

                    const slice =
                        ctx.getImageData(
                            0,
                            sy,
                            w,
                            sHeight
                        );

                    ctx.putImageData(
                        slice,
                        shiftX,
                        sy
                    );

                } catch (e) {}

            }

        }

        // RGB split
        ctx.globalCompositeOperation =
            "screen";

        ctx.fillStyle =
            "rgba(239,68,68,0.15)";

        ctx.fillRect(
            Math.sin(
                time *
                    15
            ) *
                4,
            0,
            w,
            h
        );

        ctx.fillStyle =
            "rgba(6,182,212,0.15)";

        ctx.fillRect(
            Math.cos(
                time *
                    15
            ) *
                -4,
            0,
            w,
            h
        );

        ctx.globalCompositeOperation =
            "source-over";

        // Scanlines
        ctx.fillStyle =
            "rgba(255,255,255,0.06)";

        for (
            let y = 0;
            y < h;
            y += 4
        ) {

            ctx.fillRect(
                0,
                y,
                w,
                1
            );

        }

        // Telemetry
        ctx.fillStyle =
            "#22d3ee";

        ctx.font =
            "bold 13px monospace";

        ctx.textAlign =
            "left";

        ctx.fillText(
            `SIGNAL_CORRUPT: 0x${Math.floor(
                Math.random() *
                0xffff
            )
                .toString(16)
                .toUpperCase()}`,
            16,
            28
        );

        ctx.fillStyle =
            "#ef4444";

        ctx.fillText(
            "WARN: BUFFER_OVERFLOW // [SYSTEM_OVERRIDE]",
            16,
            46
        );

        ctx.restore();

    }

    // ==========================================================
    // SPACE EXPLORER
    // ==========================================================

    function drawSpaceExplorer(
        ctx,
        w,
        h,
        time
    ) {

        ctx.save();

        const cx =
            faceBox.x * w;

        const cy =
            faceBox.y * h;

        const nebula =
            ctx.createRadialGradient(
                cx,
                cy,
                20,
                cx,
                cy,
                Math.max(w, h) *
                    0.7
            );

        nebula.addColorStop(
            0,
            "rgba(59,130,246,0.05)"
        );

        nebula.addColorStop(
            0.5,
            "rgba(147,51,234,0.12)"
        );

        nebula.addColorStop(
            1,
            "rgba(15,23,42,0.35)"
        );

        ctx.fillStyle =
            nebula;

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        // Stars
        for (
            let i = 0;
            i < 24;
            i++
        ) {

            const sx =
                (
                    i *
                    137.5
                ) %
                w;

            const sy =
                (
                    i *
                    219.3
                ) %
                h;

            const alpha =
                Math.sin(
                    time *
                        4 +
                        i
                ) *
                    0.4 +
                0.6;

            ctx.fillStyle =
                `rgba(255,255,255,${alpha})`;

            ctx.beginPath();

            ctx.arc(
                sx,
                sy,
                (
                    i %
                    3
                ) +
                    1,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

        // Visor
        ctx.strokeStyle =
            "rgba(56,189,248,0.6)";

        ctx.lineWidth =
            2;

        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            h * 0.28,
            Math.PI * 0.8,
            Math.PI * 0.2,
            true
        );

        ctx.stroke();

        // Telemetry
        ctx.fillStyle =
            "#38bdf8";

        ctx.font =
            "11px monospace";

        ctx.textAlign =
            "left";

        ctx.fillText(
            "🚀 ORBIT: 408 KM | O2: 98.4%",
            cx -
                h *
                0.22,
            cy -
                h *
                0.3
        );

        ctx.fillText(
            "RAD: NORMAL | GRAV: 0.00G",
            cx -
                h *
                0.22,
            cy -
                h *
                0.3 +
                14
        );

        ctx.restore();

    }

}
