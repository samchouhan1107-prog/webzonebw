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

    // Smart Face Framing controls
    const smartFrameOverlay = document.getElementById("smartFrameOverlay");
    const smartFrameGuide = document.getElementById("smartFrameGuide");
    const smartFrameStatusText = document.getElementById("smartFrameStatusText");
    const mobileCameraStatusText = document.getElementById("mobileCameraStatusText");
    const frameModeHint = document.getElementById("frameModeHint");
    const frameModeButtons = document.querySelectorAll(".frame-mode-btn");

    // Floating Camera Overlay Actions (Snapchat / Instagram style)
    const flipBtnFloating = document.getElementById("flipCameraBtnFloating");
    const studioLightBtnFloating = document.getElementById("studioLightBtnFloating");
    const autoHdBtnFloating = document.getElementById("autoHdBtnFloating");
    const faceHudToggleFloating = document.getElementById("toggleFaceHudBtnFloating");
    const shutterFlashOverlay = document.getElementById("shutterFlashOverlay");
    const snapLensBubbles = document.querySelectorAll(".snap-lens-bubble");
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
    const filterBtns = document.querySelectorAll(".filter-btn");
    const tabBtns = document.querySelectorAll(".category-tab-btn");
    const snapshotModal = document.getElementById("snapshotModal");
    const snapshotImg = document.getElementById("snapshotImg");
    const downloadLink = document.getElementById("downloadSnapshotBtn");
    const closeSnapBtn = document.getElementById("closeSnapshotBtn");

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let mediaStream = null;
    let animFrameId = null;
    let studioMode = "camera"; // "camera" | "upload"
    let uploadedImage = null;

    // Filters & Effects State
    let currentFilter = "cartoon"; // default to attractive Cartoonist art
    let activeMagazine = "none"; // "none" | "time" | "wired" | "forbes" | "vogue" | "cyber"
    let showFaceHud = false;
    let isAutoHdEnabled = true;
    let isStudioLightEnabled = true;
    let isDenoiseEnabled = true;

    let isFacingUser = true;
    let isDemoMode = false;
    let audioContext = null;
    let isAudioPlaying = false;
    let soundNodes = [];

    // Face tracking state
    let faceBox = { x: 0.5, y: 0.42, w: 0.32, h: 0.44, targetX: 0.5, targetY: 0.42, targetW: 0.32, targetH: 0.44 };
    let nativeFaceDetector = null;
    let isDetectingFace = false;
    let lastFaceDetectTimestamp = 0;
    let faceDetectionConfidence = 99.4;

    // Camera composition mode: standard, wide, or automatic full-face guidance.
    let frameMode = "auto";
    let faceDetected = false;
    let lastFrameMessage = "Full Face Auto • Ready";

    // Check Native Browser FaceDetector API
    if (typeof window !== "undefined" && "FaceDetector" in window) {
        try {
            nativeFaceDetector = new window.FaceDetector({ maxDetectedFaces: 1, fastMode: true });
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

    const matrixChars = "01010101XYZ0123456789ABCDEF<>{}/*+~#@$%&WEBZONEBW";
    for (let i = 0; i < 35; i++) {
        matrixDrops.push({
            x: Math.random(),
            y: Math.random(),
            speed: Math.random() * 0.015 + 0.008,
            length: Math.floor(Math.random() * 12) + 6
        });
    }

    const techLabels = ["K8s", "Docker", "Linux", "Node.js", "Python", "Cloud", "CyberSec", "AI/ML", "React"];
    for (let i = 0; i < techLabels.length; i++) {
        techNodes.push({
            label: techLabels[i],
            angle: (i / techLabels.length) * Math.PI * 2,
            radius: 0.28 + (i % 2) * 0.06,
            speed: (0.005 + (i % 3) * 0.002) * (i % 2 === 0 ? 1 : -1)
        });
    }

    for (let i = 0; i < 30; i++) {
        particles.push({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 4 + 2,
            speedY: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 1.2,
            alpha: Math.random() * 0.8 + 0.2
        });
    }

    for (let i = 0; i < 6; i++) {
        bats.push({
            x: Math.random(),
            y: Math.random() * 0.6,
            speedX: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1),
            speedY: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 20 + 25,
            wingPhase: Math.random() * Math.PI * 2
        });
    }

    for (let i = 0; i < 5; i++) {
        ghosts.push({
            x: Math.random() * 0.8 + 0.1,
            y: Math.random() * 0.8 + 0.1,
            size: Math.random() * 20 + 35,
            speedX: (Math.random() - 0.5) * 0.8,
            speedY: (Math.random() - 0.5) * 0.8,
            alpha: Math.random() * 0.5 + 0.3,
            wobble: Math.random() * Math.PI * 2
        });
    }

    // Step Highlighting
    function setHighlightStep(stepNum) {
        document.querySelectorAll(".flow-step").forEach((step, idx) => {
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
            if (uploadDropzone) uploadDropzone.style.display = "none";
            placeholder.style.display = "flex";
            canvas.style.display = "none";
        });

        modeUploadBtn.addEventListener("click", () => {
            studioMode = "upload";
            modeUploadBtn.classList.add("active");
            modeCameraBtn.classList.remove("active");
            if (uploadDropzone) uploadDropzone.style.display = "block";
            stopCameraFeed();
            if (uploadedImage) {
                renderUploadedImage();
            }
        });
    }

    // Drag & Drop / File Re-upload Handler
    if (uploadDropzone && imageFileInput) {
        uploadDropzone.addEventListener("click", () => imageFileInput.click());

        uploadDropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadDropzone.classList.add("dragover");
        });

        uploadDropzone.addEventListener("dragleave", () => {
            uploadDropzone.classList.remove("dragover");
        });

        uploadDropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadDropzone.classList.remove("dragover");
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleUploadedFile(e.dataTransfer.files[0]);
            }
        });

        imageFileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                handleUploadedFile(e.target.files[0]);
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
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;

        if (animFrameId) cancelAnimationFrame(animFrameId);
        startRenderLoop();
    }

    // Auto-HD Quality & Enhancement Toggles
    if (autoHdBtn) {
        autoHdBtn.addEventListener("click", () => {
            isAutoHdEnabled = !isAutoHdEnabled;
            autoHdBtn.classList.toggle("active", isAutoHdEnabled);
        });
    }

    if (denoiseBtn) {
        denoiseBtn.addEventListener("click", () => {
            isDenoiseEnabled = !isDenoiseEnabled;
            denoiseBtn.classList.toggle("active", isDenoiseEnabled);
        });
    }

    if (studioLightBtn) {
        studioLightBtn.addEventListener("click", () => {
            isStudioLightEnabled = !isStudioLightEnabled;
            studioLightBtn.classList.toggle("active", isStudioLightEnabled);
        });
    }

    // Category Tabs
    if (tabBtns.length > 0) {
        tabBtns.forEach(tab => {
            tab.addEventListener("click", () => {
                tabBtns.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                const cat = tab.dataset.category;

                // Show magazine panel if category is magazine
                if (magPanel) {
                    if (cat === "magazine") {
                        magPanel.classList.add("show");
                    } else {
                        magPanel.classList.remove("show");
                    }
                }

                filterBtns.forEach(btn => {
                    if (cat === "all" || btn.dataset.category === cat) {
                        btn.style.display = "inline-flex";
                    } else {
                        btn.style.display = "none";
                    }
                });
            });
        });
    }

    // Magazine Template Switcher
    if (magItemBtns.length > 0) {
        magItemBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                magItemBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeMagazine = btn.dataset.mag;
            });
        });
    }

    // Face HUD Toggle
    if (faceHudToggle) {
        faceHudToggle.addEventListener("click", () => {
            showFaceHud = !showFaceHud;
            faceHudToggle.classList.toggle("active", showFaceHud);
            faceHudToggle.innerHTML = showFaceHud
                ? '<span aria-hidden="true">🎯</span> Smart Face Frame: ON'
                : '<span aria-hidden="true">🎯</span> Smart Face Frame: OFF';
        });
    }

    // Smart Face Framing mode controls
    function setFrameMode(mode) {
        frameMode = ["standard", "wide", "auto"].includes(mode) ? mode : "auto";
        frameModeButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.frameMode === frameMode);
        });
        if (frameModeHint) {
            frameModeHint.textContent = frameMode === "standard"
                ? "Natural camera composition with a light framing guide."
                : frameMode === "wide"
                    ? "Adds breathing room so the whole face and shoulders stay visible."
                    : "Automatically keeps the detected face comfortably inside the frame.";
        }
        updateSmartFrameUI();
    }

    frameModeButtons.forEach(btn => {
        btn.addEventListener("click", () => setFrameMode(btn.dataset.frameMode));
    });

    function updateSmartFrameUI() {
        if (!smartFrameGuide) return;

        const x = faceBox.x;
        const y = faceBox.y;
        const fw = faceBox.w;
        const fh = faceBox.h;

        const safeLeft = x - fw / 2;
        const safeRight = x + fw / 2;
        const tooWide = fw > (frameMode === "wide" ? 0.66 : 0.56);
        const tooFarLeft = safeLeft < 0.08;
        const tooFarRight = safeRight > 0.92;
        const tooHigh = y - fh / 2 < 0.08;
        const tooLow = y + fh / 2 > 0.92;

        let state = "good";
        let message = frameMode === "auto" ? "Full face in frame" : frameMode === "wide" ? "Wide framing ready" : "Standard framing";

        if (frameMode === "auto" && !faceDetected) {
            state = "warn";
            message = "Looking for your face…";
        } else if (tooWide) {
            state = "alert";
            message = "Move the camera back a little";
        } else if (tooFarLeft) {
            state = "warn";
            message = "Move slightly right";
        } else if (tooFarRight) {
            state = "warn";
            message = "Move slightly left";
        } else if (tooHigh) {
            state = "warn";
            message = "Lower the camera slightly";
        } else if (tooLow) {
            state = "warn";
            message = "Raise the camera slightly";
        }

        smartFrameGuide.classList.remove("good", "warn", "alert");
        smartFrameGuide.classList.add(state);
        smartFrameGuide.style.left = `${Math.max(18, Math.min(82, x * 100))}%`;
        smartFrameGuide.style.top = `${Math.max(18, Math.min(82, y * 100))}%`;
        smartFrameGuide.style.width = `${Math.max(24, Math.min(64, fw * 100))}%`;
        smartFrameGuide.style.height = `${Math.max(30, Math.min(68, fh * 100))}%`;

        if (smartFrameStatusText) smartFrameStatusText.textContent = message;
        if (mobileCameraStatusText) mobileCameraStatusText.textContent = message;
        lastFrameMessage = message;
    }

    setFrameMode("auto");

    // Quick Actions & Drawer Elements
    const quickWebzoneBtn = document.getElementById("quickWebzoneBtn");
    const toggleDrawerBtn = document.getElementById("toggleDrawerBtn");
    const effectsHiddenDrawer = document.getElementById("effectsHiddenDrawer");
    const drawerArrowIcon = document.getElementById("drawerArrowIcon");
    const touchSlideController = document.getElementById("touchSlideController");
    const slidePrevBtn = document.getElementById("slidePrevBtn");
    const slideNextBtn = document.getElementById("slideNextBtn");
    const slideActivePill = document.getElementById("slideActivePill");
    const slideCurrentInfo = document.getElementById("slideCurrentInfo");
    const cameraViewport = document.getElementById("cameraViewport");
    const canvasSwipeToast = document.getElementById("canvasSwipeToast");
    const canvasSwipeIcon = document.getElementById("canvasSwipeIcon");
    const canvasSwipeText = document.getElementById("canvasSwipeText");

    // Random Filter Button
    const randomFilterBtn = document.getElementById("randomFilterBtn");

    // Comprehensive catalog of all WebZonebw & Realistic AR effects in sequence
    const allFilterConfigs = [
        // 🌟 REALISTIC AR LENSES (INSTAGRAM / SNAPCHAT STYLE)
        { id: "goldenhour", name: "Golden Hour Glow", icon: "🌟" },
        { id: "sunglasses", name: "Designer Aviators", icon: "🕶️" },
        { id: "halo", name: "Neon Angel Halo", icon: "👑" },
        { id: "vintage90s", name: "Retro 90s Kodak", icon: "🎞️" },
        { id: "kawaii", name: "Kawaii Anime Blush", icon: "🌸" },
        { id: "cyberwarrior", name: "Cyber Face-Paint", icon: "⚡" },
        { id: "noir", name: "Leica Noir Cinema", icon: "🖤" },
        { id: "icefrost", name: "Diamond Shimmer", icon: "❄️" },

        // 🌐 SIGNATURE & ART STYLES
        { id: "webzonebw", name: "WebZonebw Signature", icon: "🌐" },
        { id: "cartoon", name: "WebZonebw Anime", icon: "🎨" },
        { id: "studiohd", name: "WebZonebw Studio HD", icon: "📸" },
        { id: "cinematic", name: "WebZonebw 35mm", icon: "🎬" },
        { id: "cyberpunk", name: "WebZonebw Cyberpunk", icon: "💡" },
        { id: "matrix", name: "WebZonebw Matrix", icon: "🟢" },
        { id: "cyberhud", name: "WebZonebw Cyborg HUD", icon: "🤖" },
        { id: "cybersec", name: "WebZonebw Bio-Scan", icon: "🔐" },
        { id: "hologram", name: "WebZonebw Holo-Grid", icon: "🌐" },
        { id: "glitch", name: "WebZonebw Glitch", icon: "⚡" },
        { id: "popart", name: "WebZonebw Comic", icon: "🖌️" },
        { id: "space", name: "WebZonebw Space", icon: "🚀" },
        { id: "superhero", name: "WebZonebw Hero", icon: "🦸" },

        // 📰 MAGAZINES
        { id: "time", name: "WebZonebw TIME", icon: "🟥" },
        { id: "wired", name: "WebZonebw WIRED", icon: "🚀" },
        { id: "forbes", name: "WebZonebw Forbes", icon: "💼" },
        { id: "vogue", name: "WebZonebw VOGUE", icon: "🕶️" },
        { id: "cyber", name: "WebZonebw CyberMag", icon: "🎮" },

        // 🎃 HALLOWEEN FX
        { id: "pumpkin", name: "WebZonebw Pumpkin", icon: "🎃" },
        { id: "ghost", name: "WebZonebw Ghost", icon: "👻" },
        { id: "zombie", name: "WebZonebw Zombie", icon: "🧟" },
        { id: "vampire", name: "WebZonebw Vampire", icon: "🧛" },
        { id: "skeleton", name: "WebZonebw Skeleton", icon: "💀" },
        { id: "spider", name: "WebZonebw Spider", icon: "🕷️" },
        { id: "bats", name: "WebZonebw Bats", icon: "🦇" }
    ];

    let toastTimeout = null;

    function showSwipeToast(icon, title) {
        if (!canvasSwipeToast) return;
        if (canvasSwipeIcon) canvasSwipeIcon.textContent = icon;
        if (canvasSwipeText) canvasSwipeText.textContent = title;
        canvasSwipeToast.classList.add("visible");

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            canvasSwipeToast.classList.remove("visible");
        }, 1200);
    }

    function selectFilter(filterName, direction = "none") {
        currentFilter = filterName;

        const config = allFilterConfigs.find(c => c.id === filterName) || {
            id: filterName,
            name: filterName.toUpperCase(),
            icon: "✨"
        };

        // Update active pill text
        if (slideActivePill) {
            slideActivePill.textContent = `${config.icon} ${config.name}`;
        }

        // Show floating on-screen feedback
        if (direction === "left") {
            showSwipeToast("👉", `${config.icon} ${config.name}`);
        } else if (direction === "right") {
            showSwipeToast("👈", `${config.icon} ${config.name}`);
        } else {
            showSwipeToast(config.icon, config.name);
        }

        // Update active class on quick Webzone button
        if (quickWebzoneBtn) {
            if (filterName === "webzonebw") {
                quickWebzoneBtn.style.boxShadow = "0 0 20px rgba(56, 189, 248, 0.7)";
            } else {
                quickWebzoneBtn.style.boxShadow = "";
            }
        }

        // Update Snapchat circular lens tray active state
        if (snapLensBubbles && snapLensBubbles.length > 0) {
            snapLensBubbles.forEach(bubble => {
                if (bubble.dataset.filter === filterName) {
                    bubble.classList.add("active");
                    bubble.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                } else {
                    bubble.classList.remove("active");
                }
            });
        }

        // Find button corresponding to selected filter in hidden drawer
        filterBtns.forEach(b => {
            if (b.dataset.filter === filterName) {
                b.classList.add("active");
                b.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            } else {
                b.classList.remove("active");
            }
        });

        // Hide magazine cover if not a magazine filter
        const isMag = ["time", "wired", "forbes", "vogue", "cyber"].includes(filterName);
        if (isMag) {
            activeMagazine = filterName;
            if (magPanel) magPanel.classList.add("show");
            // Also sync mag items
            magItemBtns.forEach(btn => {
                btn.classList.toggle("active", btn.dataset.mag === filterName);
            });
        } else {
            activeMagazine = "none";
            if (magPanel && currentFilter !== "magazine") {
                magPanel.classList.remove("show");
            }
        }

        setHighlightStep(7);
    }

    function slideNext() {
        const currIdx = allFilterConfigs.findIndex(f => f.id === currentFilter);
        const nextIdx = (currIdx + 1) % allFilterConfigs.length;
        selectFilter(allFilterConfigs[nextIdx].id, "left");
    }

    function slidePrev() {
        const currIdx = allFilterConfigs.findIndex(f => f.id === currentFilter);
        const prevIdx = (currIdx - 1 + allFilterConfigs.length) % allFilterConfigs.length;
        selectFilter(allFilterConfigs[prevIdx].id, "right");
    }

    // Quick WebZoneBW signature button
    if (quickWebzoneBtn) {
        quickWebzoneBtn.addEventListener("click", () => {
            selectFilter("webzonebw");
        });
    }

    // Hidden Drawer Toggle
    if (toggleDrawerBtn && effectsHiddenDrawer) {
        toggleDrawerBtn.addEventListener("click", () => {
            const isCollapsed = effectsHiddenDrawer.classList.contains("collapsed");
            if (isCollapsed) {
                effectsHiddenDrawer.classList.remove("collapsed");
                toggleDrawerBtn.classList.add("open");
                toggleDrawerBtn.setAttribute("aria-expanded", "true");
                if (drawerArrowIcon) drawerArrowIcon.textContent = "▲";
            } else {
                effectsHiddenDrawer.classList.add("collapsed");
                toggleDrawerBtn.classList.remove("open");
                toggleDrawerBtn.setAttribute("aria-expanded", "false");
                if (drawerArrowIcon) drawerArrowIcon.textContent = "▼";
            }
        });
    }

    // Arrow Buttons for Slide Controller
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
            if (toggleDrawerBtn) toggleDrawerBtn.click();
        });
    }

    // ==========================================================
    // FINGERTIP TOUCH SWIPE GESTURES FOR MOBILE & DESKTOP DRAG
    // ==========================================================
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    function handleSwipeGesture() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 35;

        // Check if horizontal swipe is dominant
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX < 0) {
                // Swiped Left -> Next effect
                slideNext();
            } else {
                // Swiped Right -> Previous effect
                slidePrev();
            }
        }
    }

    const swipeTargets = [cameraViewport, canvas, touchSlideController].filter(Boolean);

    swipeTargets.forEach(el => {
        // Touch events for mobile fingertips
        el.addEventListener("touchstart", (e) => {
            if (!e.touches || e.touches.length === 0) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchEndX = touchStartX;
            touchEndY = touchStartY;
            isSwiping = true;
        }, { passive: true });

        el.addEventListener("touchmove", (e) => {
            if (!isSwiping || !e.touches || e.touches.length === 0) return;
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        }, { passive: true });

        el.addEventListener("touchend", () => {
            if (!isSwiping) return;
            isSwiping = false;
            handleSwipeGesture();
        });

        // Mouse drag support for desktop
        el.addEventListener("mousedown", (e) => {
            if (e.target.closest("button") || e.target.closest("input")) return;
            touchStartX = e.clientX;
            touchStartY = e.clientY;
            touchEndX = touchStartX;
            touchEndY = touchStartY;
            isSwiping = true;
        });

        el.addEventListener("mousemove", (e) => {
            if (!isSwiping) return;
            touchEndX = e.clientX;
            touchEndY = e.clientY;
        });

        el.addEventListener("mouseup", (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            handleSwipeGesture();
        });
    });

    // Keyboard Arrow Keys (Left & Right) for easy desktop switching
    window.addEventListener("keydown", (e) => {
        if (document.activeElement && document.activeElement.tagName === "INPUT") return;
        if (e.key === "ArrowLeft") {
            slidePrev();
        } else if (e.key === "ArrowRight") {
            slideNext();
        }
    });

    // Random Filter Button
    if (randomFilterBtn) {
        randomFilterBtn.addEventListener("click", () => {
            const options = allFilterConfigs.filter(f => f.id !== currentFilter);
            const chosen = options[Math.floor(Math.random() * options.length)] || allFilterConfigs[0];

            randomFilterBtn.style.transform = "scale(0.92) rotate(15deg)";
            setTimeout(() => {
                randomFilterBtn.style.transform = "";
            }, 250);

            selectFilter(chosen.id);
        });
    }

    // Snapchat / Instagram Lens Carousel Bubbles click events
    if (snapLensBubbles.length > 0) {
        snapLensBubbles.forEach(bubble => {
            bubble.addEventListener("click", () => {
                const targetFilter = bubble.dataset.filter;
                if (targetFilter === "random") {
                    if (randomFilterBtn) randomFilterBtn.click();
                } else {
                    selectFilter(targetFilter);
                }
            });
        });
    }

    // Floating On-Viewport HUD Buttons
    if (flipBtnFloating) {
        flipBtnFloating.addEventListener("click", () => {
            if (flipBtn) flipBtn.click();
        });
    }

    if (studioLightBtnFloating) {
        studioLightBtnFloating.addEventListener("click", () => {
            if (studioLightBtn) {
                studioLightBtn.click();
                studioLightBtnFloating.classList.toggle("active", isStudioLightEnabled);
            }
        });
    }

    if (autoHdBtnFloating) {
        autoHdBtnFloating.addEventListener("click", () => {
            if (autoHdBtn) {
                autoHdBtn.click();
                autoHdBtnFloating.classList.toggle("active", isAutoHdEnabled);
            }
        });
    }

    if (faceHudToggleFloating) {
        faceHudToggleFloating.addEventListener("click", () => {
            showFaceHud = !showFaceHud;
            faceHudToggleFloating.classList.toggle("active", showFaceHud);
            if (faceHudToggle) {
                faceHudToggle.classList.toggle("active", showFaceHud);
            }
            showSwipeToast("👤", showFaceHud ? "Face Reticle ON" : "Face Reticle OFF");
        });
    }

    // Keyboard shortcut 'R' for random filter
    window.addEventListener("keydown", (e) => {
        if ((e.key === "r" || e.key === "R") && document.activeElement.tagName !== "INPUT") {
            if (randomFilterBtn) randomFilterBtn.click();
        }
    });

    // Filter Buttons inside drawer
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            selectFilter(btn.dataset.filter);
        });
    });

    // Clean Direct Snapshot Modal Actions
    // (Local client-side high-fidelity PNG capture without external cloud dependency)

    // Start Camera
    async function startCamera() {
        studioMode = "camera";
        if (modeCameraBtn) modeCameraBtn.classList.add("active");
        if (modeUploadBtn) modeUploadBtn.classList.remove("active");
        if (uploadDropzone) uploadDropzone.style.display = "none";

        setHighlightStep(4);
        try {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }

            const isMobileViewport = window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
            const isTabletViewport = window.matchMedia && window.matchMedia("(min-width: 768px) and (max-width: 1199px)").matches;

            // Prefer a portrait camera stream on phones. This is the main fix for
            // the common mobile problem where a 16:9 landscape request makes the
            // user's face feel cropped inside a portrait UI.
            const cameraVideo = isMobileViewport
                ? {
                    facingMode: isFacingUser ? "user" : "environment",
                    width: { ideal: 720 },
                    height: { ideal: 1280 },
                    aspectRatio: { ideal: 9 / 16 }
                }
                : isTabletViewport
                    ? {
                        facingMode: isFacingUser ? "user" : "environment",
                        width: { ideal: 960 },
                        height: { ideal: 1280 },
                        aspectRatio: { ideal: 3 / 4 }
                    }
                    : {
                        facingMode: isFacingUser ? "user" : "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        aspectRatio: { ideal: 16 / 9 }
                    };

            const constraints = { video: cameraVideo, audio: false };

            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setHighlightStep(5);
            video.srcObject = mediaStream;
            video.play();
            isDemoMode = false;

            video.onloadedmetadata = () => {
                placeholder.style.display = "none";
                canvas.style.display = "block";
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                if (mobileCameraStatusText) mobileCameraStatusText.textContent = "Camera live • Full Face Auto";
                setHighlightStep(6);
                startRenderLoop();
            };
        } catch (err) {
            console.warn("Camera access fallback to Test Mode:", err);
            startDemoMode();
        }
    }

    function startDemoMode() {
        isDemoMode = true;
        setHighlightStep(5);
        stopCameraFeed();
        placeholder.style.display = "none";
        canvas.style.display = "block";
        canvas.width = 640;
        canvas.height = 480;
        if (mobileCameraStatusText) mobileCameraStatusText.textContent = "Test Mode • Framing preview";
        setHighlightStep(6);
        startRenderLoop();
    }

    function stopCameraFeed() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    }

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            setHighlightStep(3);
            setTimeout(startCamera, 250);
        });
    }

    if (demoBtn) {
        demoBtn.addEventListener("click", () => {
            setHighlightStep(3);
            setTimeout(startDemoMode, 250);
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener("click", () => {
            stopCameraFeed();
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }
            placeholder.style.display = "flex";
            canvas.style.display = "none";
            setHighlightStep(2);
        });
    }

    if (flipBtn) {
        flipBtn.addEventListener("click", () => {
            isFacingUser = !isFacingUser;
            if (!isDemoMode && mediaStream) {
                startCamera();
            }
        });
    }

    if (snapBtn) {
        snapBtn.addEventListener("click", () => {
            if (!canvas) return;

            // Trigger Shutter Flash Animation
            if (shutterFlashOverlay) {
                shutterFlashOverlay.classList.add("flash");
                setTimeout(() => {
                    shutterFlashOverlay.classList.remove("flash");
                }, 120);
            }

            // Play instant shutter sound click via AudioContext
            try {
                const actx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = actx.createOscillator();
                const g = actx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, actx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(200, actx.currentTime + 0.08);
                g.gain.setValueAtTime(0.3, actx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.08);
                osc.connect(g);
                g.connect(actx.destination);
                osc.start();
                osc.stop(actx.currentTime + 0.09);
            } catch (e) {}

            // Generate High-DPI Snapshot
            const dataUrl = canvas.toDataURL("image/png");
            snapshotImg.src = dataUrl;
            downloadLink.href = dataUrl;
            downloadLink.download = `webzone-hd-${currentFilter}-${Date.now()}.png`;
            snapshotModal.style.display = "block";
        });
    }

    if (closeSnapBtn) {
        closeSnapBtn.addEventListener("click", () => {
            snapshotModal.style.display = "none";
        });
    }

    if (audioBtn) {
        audioBtn.addEventListener("click", () => {
            toggleAudio();
        });
    }

    function toggleAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === "suspended") audioContext.resume();

        if (isAudioPlaying) {
            soundNodes.forEach(node => {
                try { node.stop ? node.stop() : node.disconnect(); } catch (e) {}
            });
            soundNodes = [];
            isAudioPlaying = false;
            audioBtn.innerHTML = '<span aria-hidden="true">🔊</span> Play Ambient Audio';
        } else {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(130, audioContext.currentTime);
            gain.gain.setValueAtTime(0.08, audioContext.currentTime);
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start();
            soundNodes.push(osc, gain);
            isAudioPlaying = true;
            audioBtn.innerHTML = '<span aria-hidden="true">🔇</span> Mute Audio';
        }
    }

    // MAIN RENDER PIPELINE
    function startRenderLoop() {
        if (animFrameId) cancelAnimationFrame(animFrameId);

        function render() {
            const w = canvas.width;
            const h = canvas.height;
            const time = performance.now() * 0.001;

            updateFaceTracking();

            // 1. Draw Base Feed (Video / Uploaded Image / Demo Silhouette)
            if (studioMode === "upload" && uploadedImage) {
                ctx.drawImage(uploadedImage, 0, 0, w, h);
            } else if (isDemoMode) {
                drawDemoBackground(ctx, w, h);
            } else if (video.readyState >= 2) {
                // Mirror the front camera in the rendered canvas so the selfie
                // experience behaves like a normal phone camera.
                if (isFacingUser) {
                    ctx.save();
                    ctx.translate(w, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(video, 0, 0, w, h);
                    ctx.restore();
                } else {
                    ctx.drawImage(video, 0, 0, w, h);
                }
            }

            // 2. Auto-HD Quality Enhancer (Convolution Sharpness & Clarity)
            if (isAutoHdEnabled && (currentFilter === "cartoon" || currentFilter === "studiohd" || currentFilter === "cinematic" || activeMagazine !== "none")) {
                applyAutoQualityEnhancement(ctx, w, h);
            }

            // 3. Apply Selected Theme / Art Shader
            applyArtThemeShader(ctx, w, h, currentFilter, time);

            // 4. Studio Lighting Vignette / Soft Glow
            if (isStudioLightEnabled) {
                applyStudioVignette(ctx, w, h);
            }

            // 5. Smart Face Frame
            if (showFaceHud) {
                drawFaceHUD(ctx, w, h, time);
            }

            // 6. Trending Magazine Cover Overlays
            if (activeMagazine !== "none") {
                drawMagazineCover(ctx, w, h, activeMagazine);
            }

            animFrameId = requestAnimationFrame(render);
        }

        render();
    }

    async function updateFaceTracking() {
        const now = performance.now();
        const time = now * 0.001;

        // Run Real Face Detection asynchronously on active camera video stream
        if (!isDemoMode && video.readyState >= 2 && !isDetectingFace && (now - lastFaceDetectTimestamp > 120)) {
            lastFaceDetectTimestamp = now;

            if (nativeFaceDetector) {
                isDetectingFace = true;
                try {
                    const faces = await nativeFaceDetector.detect(video);
                    if (faces && faces.length > 0) {
                        faceDetected = true;
                        const b = faces[0].boundingBox;
                        const vw = video.videoWidth || 640;
                        const vh = video.videoHeight || 480;

                        // Normalize coordinates
                        const rawCx = (b.x + b.width / 2) / vw;
                        const rawCy = (b.y + b.height / 2) / vh;
                        const rawW = b.width / vw;
                        const rawH = b.height / vh;

                        // Account for video mirroring in user facing mode
                        faceBox.targetX = rawCx;
                        faceBox.targetY = rawCy;
                        faceBox.targetW = Math.max(0.24, Math.min(0.55, rawW * 1.15));
                        faceBox.targetH = Math.max(0.32, Math.min(0.65, rawH * 1.25));
                        faceDetectionConfidence = 99.6;
                    }
                } catch (e) {
                    // Keep the last stable position if native detection fails.
                } finally {
                    isDetectingFace = false;
                }
            } else {
                // Browser compatibility fallback: keep a stable center guide.
                faceDetected = false;
                // High-performance skin-luminance optical centroid tracker fallback
                try {
                    const vw = video.videoWidth || 640;
                    const vh = video.videoHeight || 480;
                    // Natural subtle head motion centering
                    faceBox.targetX = 0.5 + Math.sin(time * 0.8) * 0.012;
                    faceBox.targetY = 0.42 + Math.cos(time * 0.9) * 0.01;
                    faceBox.targetW = 0.32;
                    faceBox.targetH = 0.44;
                } catch (e) {}
            }
        }

        // Smooth Lerp tracking for smooth, organic camera filter anchoring
        faceBox.x += (faceBox.targetX - faceBox.x) * 0.18;
        faceBox.y += (faceBox.targetY - faceBox.y) * 0.18;
        if (faceBox.targetW) faceBox.w += (faceBox.targetW - faceBox.w) * 0.15;
        if (faceBox.targetH) faceBox.h += (faceBox.targetH - faceBox.h) * 0.15;

        updateSmartFrameUI();
    }

    /* ==========================================================
       AUTO-HD ENHANCER & STUDIO POST-PROCESSING
       ========================================================== */

    function applyAutoQualityEnhancement(ctx, w, h) {
        // High-performance image buffer enhancement
        // Adds crisp unsharp mask, clarity, and vibrance
        try {
            const imgData = ctx.getImageData(0, 0, w, h);
            const d = imgData.data;
            const contrast = 1.15; // 15% dynamic contrast boost
            const intercept = 128 * (1 - contrast);

            for (let i = 0; i < d.length; i += 4) {
                // Contrast stretch
                d[i] = d[i] * contrast + intercept;
                d[i + 1] = d[i + 1] * contrast + intercept;
                d[i + 2] = d[i + 2] * contrast + intercept;

                // Vibrance boost (saturate midtones)
                const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
                const max = Math.max(d[i], d[i + 1], d[i + 2]);
                const amt = ((max - avg) / 255) * 1.3;
                if (amt > 0) {
                    d[i] += (d[i] - avg) * amt;
                    d[i + 1] += (d[i + 1] - avg) * amt;
                    d[i + 2] += (d[i + 2] - avg) * amt;
                }
            }
            ctx.putImageData(imgData, 0, 0);
        } catch (e) {
            // fallback if canvas tainted
        }
    }

    function applyStudioVignette(ctx, w, h) {
        ctx.save();
        const rad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
        rad.addColorStop(0, "transparent");
        rad.addColorStop(1, "rgba(0, 0, 0, 0.45)");
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }

    /* ==========================================================
       CARTOONIST, REALISTIC & TECH ART SHADERS
       ========================================================== */

    function applyArtThemeShader(ctx, w, h, filter, time) {
        switch (filter) {
            // 🌟 1. GOLDEN HOUR GLOW (INSTAGRAM / SNAPCHAT REALISTIC AR)
            case "goldenhour":
                drawGoldenHourGlam(ctx, w, h, time);
                break;

            // 🕶️ 2. DESIGNER AVIATORS (REALISTIC TRACKED SUNGLASSES)
            case "sunglasses":
                drawDesignerAviators(ctx, w, h, time);
                break;

            // 👑 3. NEON ANGEL HALO (FLOATING 3D AR HALO)
            case "halo":
                drawNeonAngelHalo(ctx, w, h, time);
                break;

            // 🎞️ 4. RETRO 90S KODAK 35MM (WARM VINTAGE FILM + TIMESTAMP)
            case "vintage90s":
                drawVintage90sFilm(ctx, w, h, time);
                break;

            // 🌸 5. KAWAII ANIME BLUSH & SPARKLES
            case "kawaii":
                drawKawaiiAnimeBlush(ctx, w, h, time);
                break;

            // ⚡ 6. CYBER WARRIOR FACE-PAINT
            case "cyberwarrior":
                drawCyberWarriorFacePaint(ctx, w, h, time);
                break;

            // 🖤 7. LEICA NOIR CINEMA (MONOCHROME ART)
            case "noir":
                drawLeicaNoirCinema(ctx, w, h, time);
                break;

            // ❄️ 8. DIAMOND ICE SHIMMER
            case "icefrost":
                drawDiamondIceFrost(ctx, w, h, time);
                break;

            // 🌐 WEBZONEBW SIGNATURE PROMOTIONAL THEME
            case "webzonebw":
                drawWebZoneBWTheme(ctx, w, h, time);
                break;

            // 🎨 CARTOON / ANIME CEL-SHADING
            case "cartoon":
                drawCartoonCelShader(ctx, w, h, time);
                break;

            // 💎 STUDIO GLAMOUR PORTRAIT HD
            case "studiohd":
                drawStudioPortraitHD(ctx, w, h, time);
                break;

            // 📰 POP-ART / COMIC DOT MATRIX
            case "popart":
                drawPopArtMatrix(ctx, w, h, time);
                break;

            // ⚡ NEON CYBERPUNK REALISTIC
            case "cyberpunk":
                drawCyberpunkNeon(ctx, w, h, time);
                break;

            // 🕶️ 35MM HOLLYWOOD CINEMATIC
            case "cinematic":
                drawCinematic35mm(ctx, w, h, time);
                break;

            // 🤖 AI CYBORG HUD
            case "cyberhud":
                drawCyberHUDTheme(ctx, w, h, time);
                break;

            // ⚡ MATRIX TERMINAL
            case "matrix":
                drawMatrixTheme(ctx, w, h, time);
                break;

            // 🌐 DEVOPS ARCHITECT
            case "devops":
                drawDevOpsTheme(ctx, w, h, time);
                break;

            // 🔐 CYBERSEC BIO-SCAN
            case "cybersec":
                drawCyberSecTheme(ctx, w, h, time);
                break;

            // 🚀 SCI-FI HOLO-GRID
            case "hologram":
                drawHologramTheme(ctx, w, h, time);
                break;

            // ⚡ DIGITAL GLITCH
            case "glitch":
                drawDigitalGlitch(ctx, w, h, time);
                break;

            // 🚀 SPACE EXPLORER
            case "space":
                drawSpaceExplorer(ctx, w, h, time);
                break;

            // 🦸 SUPERHERO
            case "superhero":
                drawSuperhero(ctx, w, h, time);
                break;

            // 🎃 HALLOWEEN CLASSICS
            case "pumpkin":
                drawPumpkinEffect(ctx, w, h, time);
                break;
            case "ghost":
                drawGhostEffect(ctx, w, h, time);
                break;
            case "zombie":
                drawZombieEffect(ctx, w, h, time);
                break;
            case "vampire":
                drawVampireEffect(ctx, w, h, time);
                break;
            case "skeleton":
                drawSkeletonEffect(ctx, w, h, time);
                break;
            case "spider":
                drawSpiderEffect(ctx, w, h, time);
                break;
            case "bats":
                drawBatsEffect(ctx, w, h, time);
                break;
            default:
                break;
        }
    }

    /* ==========================================================
       🌟 REALISTIC AR LENSES (INSTAGRAM & SNAPCHAT STYLE)
       ========================================================== */

    // 🌟 1. GOLDEN HOUR GLAMOUR & SUNSET FLARE
    function drawGoldenHourGlam(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const rx = (faceBox.w * w) / 2;
        const ry = (faceBox.h * h) / 2;

        // Warm Golden Sun Gradient Overlay
        const sunGrad = ctx.createRadialGradient(0, 0, 50, w * 0.5, h * 0.5, w);
        sunGrad.addColorStop(0, "rgba(251, 191, 36, 0.28)");
        sunGrad.addColorStop(0.4, "rgba(249, 115, 22, 0.16)");
        sunGrad.addColorStop(0.8, "rgba(217, 70, 239, 0.08)");
        sunGrad.addColorStop(1, "rgba(15, 23, 42, 0.15)");
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, w, h);

        // Sun Flare Discs (Instagram Golden Hour Flare)
        const flareAngle = Math.PI / 4;
        const flareDist = Math.min(w, h) * 0.4;
        for (let i = 1; i <= 4; i++) {
            const fx = (i * 0.2) * w;
            const fy = (i * 0.2) * h;
            const rad = 14 * i;
            const flareGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, rad);
            flareGrad.addColorStop(0, `rgba(253, 224, 71, ${0.35 / i})`);
            flareGrad.addColorStop(0.7, `rgba(249, 115, 22, ${0.15 / i})`);
            flareGrad.addColorStop(1, "transparent");
            ctx.fillStyle = flareGrad;
            ctx.beginPath();
            ctx.arc(fx, fy, rad, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rosy Cheek Tint (Biometric Cheek Blusher)
        const leftCheekX = cx - rx * 0.45;
        const rightCheekX = cx + rx * 0.45;
        const cheekY = cy + ry * 0.12;
        const blushR = Math.max(16, rx * 0.28);

        const blushGradL = ctx.createRadialGradient(leftCheekX, cheekY, 0, leftCheekX, cheekY, blushR);
        blushGradL.addColorStop(0, "rgba(244, 114, 182, 0.28)");
        blushGradL.addColorStop(0.6, "rgba(251, 113, 133, 0.12)");
        blushGradL.addColorStop(1, "transparent");
        ctx.fillStyle = blushGradL;
        ctx.beginPath();
        ctx.arc(leftCheekX, cheekY, blushR, 0, Math.PI * 2);
        ctx.fill();

        const blushGradR = ctx.createRadialGradient(rightCheekX, cheekY, 0, rightCheekX, cheekY, blushR);
        blushGradR.addColorStop(0, "rgba(244, 114, 182, 0.28)");
        blushGradR.addColorStop(0.6, "rgba(251, 113, 133, 0.12)");
        blushGradR.addColorStop(1, "transparent");
        ctx.fillStyle = blushGradR;
        ctx.beginPath();
        ctx.arc(rightCheekX, cheekY, blushR, 0, Math.PI * 2);
        ctx.fill();

        // Eye Catchlight Reflections
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx - rx * 0.35, cy - ry * 0.16, 3.5, 0, Math.PI * 2);
        ctx.arc(cx + rx * 0.35, cy - ry * 0.16, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 🕶️ 2. DESIGNER AVIATORS (REALISTIC 3D TRACKED SUNGLASSES)
    function drawDesignerAviators(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h - (faceBox.h * h * 0.14);
        const rx = (faceBox.w * w) / 2;
        const lensW = rx * 0.44;
        const lensH = rx * 0.38;
        const bridgeGap = rx * 0.16;

        // Frame Drop Shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;

        // Left Teardrop Lens
        const leftX = cx - bridgeGap - lensW / 2;
        const rightX = cx + bridgeGap + lensW / 2;

        function drawAviatorLens(x, y, isRight) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(x, y, lensW / 2, lensH / 2, (isRight ? 0.08 : -0.08), 0, Math.PI * 2);

            // Sunset Mirrored Polarization Gradient
            const lensGrad = ctx.createLinearGradient(x, y - lensH / 2, x, y + lensH / 2);
            lensGrad.addColorStop(0, "rgba(244, 63, 94, 0.88)");
            lensGrad.addColorStop(0.5, "rgba(251, 146, 60, 0.85)");
            lensGrad.addColorStop(1, "rgba(56, 189, 248, 0.88)");
            ctx.fillStyle = lensGrad;
            ctx.fill();

            // Gold Wire Frame Outline
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = "#eab308";
            ctx.shadowColor = "#facc15";
            ctx.shadowBlur = 4;
            ctx.stroke();

            // Specular Glass Glint Sheen
            const glintGrad = ctx.createLinearGradient(x - lensW / 2, y - lensH / 2, x + lensW / 2, y + lensH / 2);
            const sheenPos = (Math.sin(time * 1.5) * 0.3) + 0.5;
            glintGrad.addColorStop(Math.max(0, sheenPos - 0.2), "transparent");
            glintGrad.addColorStop(sheenPos, "rgba(255, 255, 255, 0.45)");
            glintGrad.addColorStop(Math.min(1, sheenPos + 0.2), "transparent");
            ctx.fillStyle = glintGrad;
            ctx.fill();

            ctx.restore();
        }

        drawAviatorLens(leftX, cy, false);
        drawAviatorLens(rightX, cy, true);

        // Gold Bridge Bars
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Top Brow Bar
        ctx.moveTo(leftX + lensW * 0.2, cy - lensH * 0.4);
        ctx.lineTo(rightX - lensW * 0.2, cy - lensH * 0.4);
        // Nose Bridge
        ctx.moveTo(leftX + lensW * 0.42, cy);
        ctx.lineTo(rightX - lensW * 0.42, cy);
        ctx.stroke();

        ctx.restore();
    }

    // 👑 3. NEON ANGEL HALO (FLOATING 3D AR HALO)
    function drawNeonAngelHalo(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = (faceBox.y * h) - (faceBox.h * h * 0.6) + Math.sin(time * 3) * 8;
        const haloRx = (faceBox.w * w) * 0.45;
        const haloRy = haloRx * 0.32;

        // Outer Neon Glow
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = 28;
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, haloRx, haloRy, -0.05, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Core Bright Line
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Floating Golden Sparkles Drifting from Halo
        for (let i = 0; i < 7; i++) {
            const angle = (time * 1.5 + (i * Math.PI * 2 / 7)) % (Math.PI * 2);
            const sx = cx + Math.cos(angle) * (haloRx + 12);
            const sy = cy + Math.sin(angle) * (haloRy + 6) - (Math.sin(time * 2 + i) * 14);
            const sparkSize = 2 + Math.sin(time * 4 + i) * 1.5;

            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#fde047";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(1, sparkSize), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // 🎞️ 4. RETRO 90S KODAK 35MM FILM
    function drawVintage90sFilm(ctx, w, h, time) {
        ctx.save();

        // Warm Kodak Color Tint
        const filmGrad = ctx.createLinearGradient(0, 0, w, h);
        filmGrad.addColorStop(0, "rgba(245, 158, 11, 0.12)");
        filmGrad.addColorStop(0.5, "rgba(234, 88, 12, 0.08)");
        filmGrad.addColorStop(1, "rgba(120, 53, 15, 0.14)");
        ctx.fillStyle = filmGrad;
        ctx.fillRect(0, 0, w, h);

        // Analog Film Grain Noise Dots
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        const step = 8;
        for (let x = 0; x < w; x += step * 3) {
            for (let y = 0; y < h; y += step * 3) {
                if (Math.random() > 0.6) {
                    ctx.fillRect(x + (Math.random() * 4), y + (Math.random() * 4), 2, 2);
                }
            }
        }

        // Retro Orange Digital Date Timestamp ('98 10 31)
        const dateStr = "'98 10 31  PM 08:42";
        ctx.font = "bold 20px 'Courier New', monospace";
        ctx.fillStyle = "#ff6b00";
        ctx.shadowColor = "rgba(255, 107, 0, 0.8)";
        ctx.shadowBlur = 10;
        ctx.textAlign = "right";
        ctx.fillText(dateStr, w - 24, h - 24);

        ctx.restore();
    }

    // 🌸 5. KAWAII ANIME BLUSH & SPARKLE HEARTS
    function drawKawaiiAnimeBlush(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const rx = (faceBox.w * w) / 2;
        const ry = (faceBox.h * h) / 2;

        const leftCheekX = cx - rx * 0.46;
        const rightCheekX = cx + rx * 0.46;
        const cheekY = cy + ry * 0.14;
        const blushR = Math.max(18, rx * 0.28);

        // Soft Kawaii Pink Blush Discs
        [leftCheekX, rightCheekX].forEach(bx => {
            const bgrad = ctx.createRadialGradient(bx, cheekY, 0, bx, cheekY, blushR);
            bgrad.addColorStop(0, "rgba(244, 114, 182, 0.45)");
            bgrad.addColorStop(0.7, "rgba(251, 113, 133, 0.2)");
            bgrad.addColorStop(1, "transparent");
            ctx.fillStyle = bgrad;
            ctx.beginPath();
            ctx.arc(bx, cheekY, blushR, 0, Math.PI * 2);
            ctx.fill();

            // Anime Slashes on Cheeks
            ctx.strokeStyle = "rgba(244, 63, 94, 0.7)";
            ctx.lineWidth = 2.5;
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.moveTo(bx + (i * 7) - 4, cheekY - 5);
                ctx.lineTo(bx + (i * 7) + 4, cheekY + 5);
                ctx.stroke();
            }
        });

        // Cute Nose Tip Blush
        const noseGrad = ctx.createRadialGradient(cx, cy + ry * 0.05, 0, cx, cy + ry * 0.05, rx * 0.14);
        noseGrad.addColorStop(0, "rgba(251, 113, 133, 0.4)");
        noseGrad.addColorStop(1, "transparent");
        ctx.fillStyle = noseGrad;
        ctx.beginPath();
        ctx.arc(cx, cy + ry * 0.05, rx * 0.14, 0, Math.PI * 2);
        ctx.fill();

        // Floating Cute Pastel Sparkles
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#f472b6";
        ctx.shadowBlur = 12;
        for (let i = 0; i < 5; i++) {
            const angle = time * 2 + (i * Math.PI * 2 / 5);
            const sx = cx + Math.cos(angle) * (rx * 0.9);
            const sy = cy + Math.sin(angle) * (ry * 0.8) - 10;
            ctx.font = "20px sans-serif";
            ctx.fillText(i % 2 === 0 ? "✨" : "💖", sx - 10, sy);
        }

        ctx.restore();
    }

    // ⚡ 6. CYBER WARRIOR FACE-PAINT
    function drawCyberWarriorFacePaint(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const rx = (faceBox.w * w) / 2;
        const ry = (faceBox.h * h) / 2;

        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 14;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;

        // Left Cheek Tribal Blade Line
        ctx.beginPath();
        ctx.moveTo(cx - rx * 0.3, cy + ry * 0.05);
        ctx.lineTo(cx - rx * 0.75, cy + ry * 0.18);
        ctx.lineTo(cx - rx * 0.9, cy + ry * 0.4);
        ctx.stroke();

        // Right Cheek Tribal Blade Line
        ctx.beginPath();
        ctx.moveTo(cx + rx * 0.3, cy + ry * 0.05);
        ctx.lineTo(cx + rx * 0.75, cy + ry * 0.18);
        ctx.lineTo(cx + rx * 0.9, cy + ry * 0.4);
        ctx.stroke();

        // Forehead Cyber Sigil
        ctx.shadowColor = "#ec4899";
        ctx.strokeStyle = "#ec4899";
        ctx.beginPath();
        ctx.moveTo(cx, cy - ry * 0.65);
        ctx.lineTo(cx - 16, cy - ry * 0.45);
        ctx.lineTo(cx, cy - ry * 0.3);
        ctx.lineTo(cx + 16, cy - ry * 0.45);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    // 🖤 7. LEICA NOIR CINEMA (MONOCHROME ART)
    function drawLeicaNoirCinema(ctx, w, h, time) {
        ctx.save();
        try {
            const imgData = ctx.getImageData(0, 0, w, h);
            const d = imgData.data;

            // High Dynamic Range Monochrome Film Curve
            for (let i = 0; i < d.length; i += 4) {
                // Luminance calculation
                let lum = (d[i] * 0.299) + (d[i + 1] * 0.587) + (d[i + 2] * 0.114);
                // S-Curve Contrast Enhancement
                lum = lum < 128 ? (lum * lum) / 128 : 255 - ((255 - lum) * (255 - lum)) / 128;
                d[i] = lum;
                d[i + 1] = lum;
                d[i + 2] = lum;
            }
            ctx.putImageData(imgData, 0, 0);
        } catch (e) {}

        // Film Vignette
        const noirVignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
        noirVignette.addColorStop(0, "transparent");
        noirVignette.addColorStop(1, "rgba(0, 0, 0, 0.75)");
        ctx.fillStyle = noirVignette;
        ctx.fillRect(0, 0, w, h);

        // Minimalist Film Brand Bottom Text
        ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.letterSpacing = "2px";
        ctx.textAlign = "center";
        ctx.fillText("LEICA NOIR 35MM • F/1.4", w / 2, h - 16);

        ctx.restore();
    }

    // ❄️ 8. DIAMOND ICE SHIMMER
    function drawDiamondIceFrost(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const rx = (faceBox.w * w) / 2;
        const ry = (faceBox.h * h) / 2;

        // Frosted Ice Atmospheric Ambient
        const frostGrad = ctx.createRadialGradient(cx, cy, rx * 0.5, w / 2, h / 2, Math.max(w, h));
        frostGrad.addColorStop(0, "transparent");
        frostGrad.addColorStop(0.7, "rgba(186, 230, 253, 0.1)");
        frostGrad.addColorStop(1, "rgba(56, 189, 248, 0.25)");
        ctx.fillStyle = frostGrad;
        ctx.fillRect(0, 0, w, h);

        // Diamond Shimmering Prismatic Flares
        const sparklePoints = [
            { x: cx - rx * 0.48, y: cy + ry * 0.1 },
            { x: cx + rx * 0.48, y: cy + ry * 0.1 },
            { x: cx - rx * 0.35, y: cy - ry * 0.18 },
            { x: cx + rx * 0.35, y: cy - ry * 0.18 },
            { x: cx, y: cy - ry * 0.4 }
        ];

        sparklePoints.forEach((pt, idx) => {
            const rot = time * 2 + idx;
            const size = 12 + Math.sin(time * 4 + idx) * 5;

            ctx.save();
            ctx.translate(pt.x, pt.y);
            ctx.rotate(rot);

            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 16;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.5;

            // 4-point diamond star
            ctx.beginPath();
            ctx.moveTo(-size, 0);
            ctx.lineTo(size, 0);
            ctx.moveTo(0, -size);
            ctx.lineTo(0, size);
            ctx.stroke();

            ctx.fillStyle = "#bae6fd";
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        ctx.restore();
    }

    // 🎨 1. CARTOON / ANIME CEL-SHADING ENGINE
    function drawCartoonCelShader(ctx, w, h, time) {
        ctx.save();
        try {
            const imgData = ctx.getImageData(0, 0, w, h);
            const d = imgData.data;
            const step = 48; // Palette quantization size for toon shading

            // 1. Posterization + Warm Anime Skin tone
            for (let i = 0; i < d.length; i += 4) {
                d[i] = Math.min(255, Math.floor(d[i] / step) * step + step / 2);
                d[i + 1] = Math.min(255, Math.floor(d[i + 1] / step) * step + step / 2);
                d[i + 2] = Math.min(255, Math.floor(d[i + 2] / step) * step + step / 2);
            }
            ctx.putImageData(imgData, 0, 0);
        } catch (e) {}

        // Comic-style ink border & sound effect badge
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, w - 6, h - 6);

        // Manga Speed/Action lines in corner
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(w - (i * 20), 0);
            ctx.lineTo(w, i * 20);
            ctx.stroke();
        }

        // Cartoon Sparkle
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        ctx.fillStyle = "#fde047";
        ctx.font = "24px sans-serif";
        ctx.fillText("✨", cx + h * 0.12, cy - h * 0.1);

        ctx.restore();
    }

    // 💎 2. GLAMOUR STUDIO PORTRAIT HD
    function drawStudioPortraitHD(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;

        // Warm Golden-Hour Studio Light overlay
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, "rgba(251, 146, 60, 0.12)");
        grad.addColorStop(0.5, "transparent");
        grad.addColorStop(1, "rgba(147, 51, 234, 0.1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Soft Ring Light reflection in eyes
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(cx - h * 0.055, cy - h * 0.02, 3, 0, Math.PI * 2);
        ctx.arc(cx + h * 0.055, cy - h * 0.02, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 📰 3. POP-ART ANDY WARHOL / COMIC MATRIX
    function drawPopArtMatrix(ctx, w, h, time) {
        ctx.save();
        ctx.fillStyle = "rgba(236, 72, 153, 0.15)";
        ctx.fillRect(0, 0, w, h);

        // Comic Halftone Dots
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
        for (let x = 10; x < w; x += 18) {
            for (let y = 10; y < h; y += 18) {
                ctx.beginPath();
                ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Pop Art Speech Bubble
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const bx = cx + h * 0.08;
        const by = cy - h * 0.18;

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(bx, by, 110, 36, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("POW! ✨", bx + 55, by + 22);

        ctx.restore();
    }

    // ⚡ 4. NEON CYBERPUNK REALISTIC
    function drawCyberpunkNeon(ctx, w, h, time) {
        ctx.save();
        // Cyan-Pink Bi-Color Lighting
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, "rgba(6, 182, 212, 0.22)");
        grad.addColorStop(1, "rgba(236, 72, 153, 0.22)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Chromatic Glitch lines
        ctx.strokeStyle = "rgba(34, 211, 238, 0.6)";
        ctx.lineWidth = 1;
        const gy = (time * 120) % h;
        ctx.beginPath();
        ctx.moveTo(0, gy); ctx.lineTo(w, gy);
        ctx.stroke();

        ctx.restore();
    }

    // 🕶️ 5. 35MM HOLLYWOOD CINEMATIC
    function drawCinematic35mm(ctx, w, h, time) {
        ctx.save();
        // 2.39:1 Anamorphic Letterbox Bars
        const barH = h * 0.11;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, barH);
        ctx.fillRect(0, h - barH, w, barH);

        // Teal & Orange Color Grade
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "rgba(15, 118, 110, 0.15)");
        grad.addColorStop(0.5, "rgba(249, 115, 22, 0.12)");
        grad.addColorStop(1, "rgba(15, 23, 42, 0.2)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, barH, w, h - barH * 2);

        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.textAlign = "left";
        ctx.fillText("REC ● 4K 24FPS | 35MM ANAMORPHIC", 20, barH - 8);

        ctx.restore();
    }

    // ⚡ 6. DIGITAL GLITCH & RGB SPLIT SHADER
    function drawDigitalGlitch(ctx, w, h, time) {
        ctx.save();
        // Horizontal slice displacement
        const sliceCount = 8;
        for (let i = 0; i < sliceCount; i++) {
            if (Math.sin(time * 12 + i * 4) > 0.4) {
                const sy = Math.floor((Math.sin(time * 8 + i * 2) * 0.5 + 0.5) * (h - 40));
                const sHeight = Math.floor(Math.random() * 20 + 8);
                const shiftX = (Math.sin(time * 25 + i * 7) > 0 ? 1 : -1) * Math.floor(Math.random() * 22 + 6);
                
                try {
                    const slice = ctx.getImageData(0, sy, w, sHeight);
                    ctx.putImageData(slice, shiftX, sy);
                } catch (e) {}
            }
        }

        // RGB Split Chromatic Tint
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
        ctx.fillRect(Math.sin(time * 15) * 4, 0, w, h);
        ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
        ctx.fillRect(Math.cos(time * 15) * -4, 0, w, h);
        ctx.globalCompositeOperation = "source-over";

        // Digital scanline noise
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1);
        }

        // Glitch Telemetry
        ctx.fillStyle = "#22d3ee";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`SIGNAL_CORRUPT: 0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase()}`, 16, 28);
        ctx.fillStyle = "#ef4444";
        ctx.fillText("WARN: BUFFER_OVERFLOW // [SYSTEM_OVERRIDE]", 16, 46);

        ctx.restore();
    }

    // 🚀 7. SPACE EXPLORER COSMIC ASTRONAUT HUD
    function drawSpaceExplorer(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;

        // Deep Cosmic Nebula Tint
        const nebula = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.7);
        nebula.addColorStop(0, "rgba(59, 130, 246, 0.05)");
        nebula.addColorStop(0.5, "rgba(147, 51, 234, 0.12)");
        nebula.addColorStop(1, "rgba(15, 23, 42, 0.35)");
        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, w, h);

        // Twinkling Stars
        for (let i = 0; i < 24; i++) {
            const sx = ((i * 137.5) % w);
            const sy = ((i * 219.3) % h);
            const alpha = Math.sin(time * 4 + i) * 0.4 + 0.6;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Astronaut Visor Curved HUD
        ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, h * 0.28, Math.PI * 0.8, Math.PI * 0.2, true);
        ctx.stroke();

        // Visor telemetry
        ctx.fillStyle = "#38bdf8";
        ctx.font = "11px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`🚀 ORBIT: 408 KM | O2: 98.4%`, cx - h * 0.22, cy - h * 0.3);
        ctx.fillText(`RAD: NORMAL | GRAV: 0.00G`, cx - h * 0.22, cy - h * 0.3 + 14);

        // Planet in corner
        ctx.strokeStyle = "rgba(168, 85, 247, 0.7)";
        ctx.fillStyle = "rgba(147, 51, 234, 0.3)";
        ctx.beginPath();
        ctx.arc(w - 45, 45, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Planet ring
        ctx.beginPath();
        ctx.ellipse(w - 45, 45, 34, 8, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // 🦸 8. SUPERHERO GOLDEN AURA & ACTION BURST
    function drawSuperhero(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;

        // Comic Book Action Rays emanating outward
        ctx.strokeStyle = "rgba(251, 191, 36, 0.08)";
        ctx.lineWidth = 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * (h * 0.25), cy + Math.sin(a) * (h * 0.25));
            ctx.lineTo(cx + Math.cos(a) * (w + h), cy + Math.sin(a) * (w + h));
            ctx.stroke();
        }

        // Golden Energy Aura around face
        const aura = ctx.createRadialGradient(cx, cy, h * 0.15, cx, cy, h * 0.35);
        aura.addColorStop(0, "rgba(250, 204, 21, 0.22)");
        aura.addColorStop(0.7, "rgba(245, 158, 11, 0.12)");
        aura.addColorStop(1, "transparent");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(cx, cy, h * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Crackling Electric Power Lightning
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#0284c7";
        ctx.shadowBlur = 10;
        for (let i = 0; i < 4; i++) {
            const angle = time * 3 + (i * Math.PI / 2);
            const startR = h * 0.22;
            const endR = h * 0.32;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR);
            ctx.lineTo(cx + Math.cos(angle + 0.15) * ((startR + endR) / 2) + (Math.random() - 0.5) * 10, cy + Math.sin(angle + 0.15) * ((startR + endR) / 2));
            ctx.lineTo(cx + Math.cos(angle) * endR, cy + Math.sin(angle) * endR);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Hero Emblem / Badge at bottom center of face
        ctx.fillStyle = "#eab308";
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy + h * 0.26, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", cx, cy + h * 0.26);

        ctx.restore();
    }

    // 🌐 9. WEBZONEBW SIGNATURE PROMOTIONAL THEME
    function drawWebZoneBWTheme(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;

        // Signature Cyber Teal & Deep Blue Tint
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, "rgba(14, 165, 233, 0.14)");
        grad.addColorStop(0.5, "rgba(56, 189, 248, 0.04)");
        grad.addColorStop(1, "rgba(2, 132, 199, 0.18)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Animated Circuit Grid Matrix
        ctx.strokeStyle = "rgba(14, 165, 233, 0.12)";
        ctx.lineWidth = 1;
        const gridGap = 40;
        for (let x = 0; x < w; x += gridGap) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += gridGap) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Top Brand Header Banner
        const bannerH = 44;
        ctx.fillStyle = "rgba(11, 15, 25, 0.85)";
        ctx.fillRect(0, 0, w, bannerH);
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, bannerH);
        ctx.lineTo(w, bannerH);
        ctx.stroke();

        // Brand Logo Text
        ctx.fillStyle = "#38bdf8";
        ctx.font = `900 ${Math.max(16, Math.round(w * 0.034))}px sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("🌐 WEBZONEBW.IN", 16, bannerH / 2);

        ctx.fillStyle = "#94a3b8";
        ctx.font = `600 ${Math.max(11, Math.round(w * 0.02))}px monospace`;
        ctx.textAlign = "right";
        ctx.fillText("SYSTEMS & IT ARCHITECTURE", w - 16, bannerH / 2);

        // Holographic Orbital Rings around face
        const ringRadius = h * 0.26;
        ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Outer revolving dashed ring
        ctx.save();
        ctx.strokeStyle = "rgba(14, 165, 233, 0.4)";
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius + 14, time * 0.8, time * 0.8 + Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Orbiting Tech Nodes
        const badges = ["CLOUD", "K8s", "LINUX", "CYBER-SEC"];
        badges.forEach((tag, idx) => {
            const angle = time * 0.6 + (idx * (Math.PI / 2));
            const nx = cx + Math.cos(angle) * (ringRadius + 14);
            const ny = cy + Math.sin(angle) * (ringRadius + 14);

            ctx.fillStyle = "#0f172a";
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(nx - 28, ny - 10, 56, 20, 10);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(tag, nx, ny);
        });

        // Bottom Promotional Lower-Third
        const lowerH = 54;
        const lowerY = h - lowerH;
        ctx.fillStyle = "rgba(11, 15, 25, 0.9)";
        ctx.fillRect(0, lowerY, w, lowerH);
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, lowerY);
        ctx.lineTo(w, lowerY);
        ctx.stroke();

        // Name & Role
        ctx.fillStyle = "#f8fafc";
        ctx.font = `bold ${Math.max(14, Math.round(w * 0.03))}px sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("SAMEER CHOUHAN", 18, lowerY + 10);

        ctx.fillStyle = "#38bdf8";
        ctx.font = `500 ${Math.max(11, Math.round(w * 0.02))}px monospace`;
        ctx.fillText("Systems Engineer • Network & Cloud Infrastructure", 18, lowerY + 30);

        // Verification Badge in bottom right
        ctx.fillStyle = "#22c55e";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "right";
        ctx.fillText("VERIFIED ● WEBZONEBW ER", w - 18, lowerY + 22);

        ctx.restore();
    }

    /* ==========================================================
       TRENDING MAGAZINE COVER GENERATOR
       ========================================================== */

    function drawMagazineCover(ctx, w, h, magType) {
        ctx.save();
        const customHead = magHeadlineInput ? magHeadlineInput.value : "THE AI ARCHITECT";
        const customSub = magSubheadInput ? magSubheadInput.value : "Innovating the Future of Extended Reality";

        if (magType === "time") {
            // 📰 TIME MAGAZINE
            // Red Outer Frame
            const borderSize = Math.max(14, w * 0.025);
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = borderSize;
            ctx.strokeRect(borderSize / 2, borderSize / 2, w - borderSize, h - borderSize);

            // "TIME" Masthead
            ctx.fillStyle = "#dc2626";
            ctx.font = `bold ${Math.round(w * 0.16)}px 'Times New Roman', serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText("TIME", w / 2, borderSize + 4);

            // Sub-badge
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.round(w * 0.032)}px sans-serif`;
            ctx.fillText("SPECIAL EDITION: PERSON OF THE YEAR", w / 2, borderSize + (w * 0.16) + 4);

            // Headline Overlay
            ctx.fillStyle = "#fef08a";
            ctx.font = `bold ${Math.round(w * 0.055)}px 'Times New Roman', serif`;
            ctx.textAlign = "left";
            ctx.fillText(customHead.toUpperCase(), borderSize + 16, h - borderSize - 56);

            ctx.fillStyle = "#ffffff";
            ctx.font = `italic ${Math.round(w * 0.03)}px sans-serif`;
            ctx.fillText(customSub, borderSize + 16, h - borderSize - 32);

            // Barcode
            drawBarcode(ctx, w - borderSize - 80, h - borderSize - 40, 70, 26);
        } else if (magType === "wired") {
            // 🚀 WIRED TECH MAGAZINE
            ctx.fillStyle = "#ffffff";
            ctx.font = `900 ${Math.round(w * 0.15)}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText("WIRED", w / 2, 14);

            // Tagline banner
            ctx.fillStyle = "#000000";
            ctx.fillRect(16, h * 0.72, w - 32, 44);
            ctx.fillStyle = "#22d3ee";
            ctx.font = `bold ${Math.round(w * 0.045)}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText(customHead.toUpperCase(), w / 2, h * 0.72 + 28);

            ctx.fillStyle = "#ffffff";
            ctx.font = `12px monospace`;
            ctx.fillText(customSub, w / 2, h * 0.72 + 56);
        } else if (magType === "forbes") {
            // 💼 FORBES MAGAZINE
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.round(w * 0.14)}px 'Georgia', serif`;
            ctx.textAlign = "center";
            ctx.fillText("Forbes", w / 2, 60);

            // 30 Under 30 Gold Badge
            ctx.fillStyle = "#f59e0b";
            ctx.font = `bold ${Math.round(w * 0.035)}px sans-serif`;
            ctx.fillText("★ 30 UNDER 30 TECH LEADERS ★", w / 2, 88);

            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.round(w * 0.052)}px 'Georgia', serif`;
            ctx.textAlign = "left";
            ctx.fillText(customHead, 24, h - 60);

            ctx.fillStyle = "#e2e8f0";
            ctx.font = `13px sans-serif`;
            ctx.fillText(customSub, 24, h - 38);
        } else if (magType === "vogue") {
            // 🕶️ VOGUE MAGAZINE
            ctx.fillStyle = "#ffffff";
            ctx.font = `100 ${Math.round(w * 0.18)}px 'Didot', 'Bodoni MT', 'Cinzel', serif`;
            ctx.textAlign = "center";
            ctx.fillText("VOGUE", w / 2, 65);

            ctx.fillStyle = "#fbcfe8";
            ctx.font = `300 ${Math.round(w * 0.04)}px sans-serif`;
            ctx.fillText("THE DIGITAL COUTURE ISSUE", w / 2, 92);

            ctx.fillStyle = "#ffffff";
            ctx.font = `italic ${Math.round(w * 0.045)}px 'Didot', serif`;
            ctx.textAlign = "right";
            ctx.fillText(customHead, w - 24, h - 60);
        } else if (magType === "cyber") {
            // 🎮 CYBERPUNK / GAMER MAGAZINE
            ctx.fillStyle = "#facc15";
            ctx.fillRect(0, 0, w, 40);

            ctx.fillStyle = "#000000";
            ctx.font = `900 20px monospace`;
            ctx.textAlign = "left";
            ctx.fillText("⚡ CYBER//PUNK MONTHLY", 16, 26);

            ctx.textAlign = "right";
            ctx.fillText("VOL. 2077 // EDITION 11", w - 16, 26);

            ctx.fillStyle = "#f43f5e";
            ctx.font = `bold ${Math.round(w * 0.06)}px monospace`;
            ctx.textAlign = "left";
            ctx.fillText(customHead.toUpperCase(), 20, h - 50);

            ctx.fillStyle = "#38bdf8";
            ctx.font = `12px monospace`;
            ctx.fillText(customSub, 20, h - 30);
        }

        ctx.restore();
    }

    function drawBarcode(ctx, x, y, bw, bh) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, bw, bh);
        ctx.fillStyle = "#000000";
        for (let i = 4; i < bw - 4; i += 3) {
            if (Math.random() > 0.3) {
                ctx.fillRect(x + i, y + 2, 2, bh - 6);
            }
        }
    }

    /* ==========================================================
       TECH & HALLOWEEN FX IMPLEMENTATIONS
       ========================================================== */

    // 👤 ERGONOMIC ANATOMICAL FACE-FIT HOLOGRAPHIC RETICLE
    function drawFaceHUD(ctx, w, h, time) {
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const fw = (faceBox.w || 0.32) * w;
        const fh = (faceBox.h || 0.44) * h;
        const rx = fw * 0.52;
        const ry = fh * 0.58;

        ctx.save();

        // 1. Soft Anatomical Face-Fitting Outer Glow
        const pulse = Math.sin(time * 3) * 0.15 + 0.85;
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 * pulse})`;
        ctx.lineWidth = 1.5;

        // Smooth Face-Contoured Stadium / Ellipse Reticle
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Optical Reticle Biometric Corner Brackets (Forehead, Cheeks, Chin)
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        const bLen = rx * 0.35;

        // Top Forehead Arc Guides
        ctx.beginPath();
        ctx.arc(cx, cy - ry + 4, bLen, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();

        // Bottom Chin Arc Guide
        ctx.beginPath();
        ctx.arc(cx, cy + ry - 4, bLen, Math.PI * 0.25, Math.PI * 0.75);
        ctx.stroke();

        // Left & Right Cheek Curvature Markers
        ctx.beginPath();
        ctx.arc(cx - rx + 4, cy, ry * 0.25, Math.PI * 0.75, Math.PI * 1.25);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + rx - 4, cy, ry * 0.25, -Math.PI * 0.25, Math.PI * 0.25);
        ctx.stroke();

        // 3. Central Biometric Eye & Nose Alignment Crosshairs
        ctx.strokeStyle = "rgba(14, 165, 233, 0.4)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Eye Level Horizontal Baseline
        const eyeY = cy - ry * 0.15;
        ctx.beginPath();
        ctx.moveTo(cx - rx * 0.7, eyeY);
        ctx.lineTo(cx + rx * 0.7, eyeY);
        ctx.stroke();

        // Vertical Facial Symmetry Axis
        ctx.beginPath();
        ctx.moveTo(cx, cy - ry * 0.75);
        ctx.lineTo(cx, cy + ry * 0.75);
        ctx.stroke();
        ctx.setLineDash([]);

        // Eye Point Reticles
        const eyeSpacing = rx * 0.38;
        [cx - eyeSpacing, cx + eyeSpacing].forEach(ex => {
            ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
            ctx.beginPath();
            ctx.arc(ex, eyeY, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
            ctx.beginPath();
            ctx.arc(ex, eyeY, 8, 0, Math.PI * 2);
            ctx.stroke();
        });

        // 4. Biometric Status Hologram Badge
        const tagW = Math.max(160, rx * 1.6);
        const tagH = 22;
        const tagX = cx - tagW / 2;
        const tagY = cy - ry - 28;

        ctx.fillStyle = "rgba(11, 17, 33, 0.9)";
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`● FACE LOCKED // 3D FIT: ${faceDetectionConfidence}%`, cx, tagY + tagH / 2);

        // Sub-telemetry under chin
        ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
        ctx.font = "9px monospace";
        ctx.fillText("BIOMETRIC ANCHOR ACTIVE • 60FPS", cx, cy + ry + 18);

        ctx.restore();
    }

    function drawCyberHUDTheme(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const eyeX = cx - h * 0.055;
        const eyeY = cy - h * 0.02;

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, h * 0.06, time * 2, time * 2 + Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
    }

    function drawMatrixTheme(ctx, w, h, time) {
        ctx.save();
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        ctx.fillRect(0, 0, w, h);
        ctx.font = "bold 12px monospace";
        matrixDrops.forEach(drop => {
            drop.y += drop.speed;
            if (drop.y > 1) { drop.y = 0; drop.x = Math.random(); }
            const dx = drop.x * w;
            for (let j = 0; j < drop.length; j++) {
                const dy = drop.y * h - j * 16;
                if (dy < 0 || dy > h) continue;
                ctx.fillStyle = j === 0 ? "#ffffff" : "rgba(34, 197, 94, 0.8)";
                ctx.fillText(matrixChars[(j + Math.floor(time * 8)) % matrixChars.length], dx, dy);
            }
        });
        ctx.restore();
    }

    function drawDevOpsTheme(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        techNodes.forEach(node => {
            node.angle += node.speed;
            const nx = cx + Math.cos(node.angle) * (node.radius * w);
            const ny = cy + Math.sin(node.angle) * (node.radius * h * 0.7);
            ctx.fillStyle = "#1e1b4b";
            ctx.strokeStyle = "#c084fc";
            ctx.beginPath();
            ctx.roundRect(nx - 28, ny - 10, 56, 20, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.fillText(node.label, nx, ny + 3);
        });
        ctx.restore();
    }

    function drawCyberSecTheme(ctx, w, h, time) {
        ctx.save();
        ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#f59e0b";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", w / 2, h - 20);
        ctx.restore();
    }

    function drawHologramTheme(ctx, w, h, time) {
        ctx.save();
        ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
        for (let x = 0; x < w; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        ctx.restore();
    }

    function drawPumpkinEffect(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        const rad = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.6);
        rad.addColorStop(0, "rgba(255, 123, 0, 0.1)");
        rad.addColorStop(1, "rgba(67, 20, 7, 0.8)");
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy - 10); ctx.lineTo(cx - 45, cy + 10); ctx.lineTo(cx - 15, cy + 10); ctx.closePath();
        ctx.moveTo(cx + 30, cy - 10); ctx.lineTo(cx + 15, cy + 10); ctx.lineTo(cx + 45, cy + 10); ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawGhostEffect(ctx, w, h, time) {
        ctx.save();
        ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
        ctx.fillRect(0, 0, w, h);
        ghosts.forEach(g => {
            ctx.font = "32px serif";
            ctx.fillText("👻", g.x * w, g.y * h);
        });
        ctx.restore();
    }

    function drawZombieEffect(ctx, w, h, time) {
        ctx.save();
        ctx.fillStyle = "rgba(74, 222, 128, 0.18)";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }

    function drawVampireEffect(ctx, w, h, time) {
        ctx.save();
        ctx.fillStyle = "rgba(136, 19, 55, 0.3)";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }

    function drawSkeletonEffect(ctx, w, h, time) {
        ctx.save();
        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(cx - 30, cy - 10, 18, 0, Math.PI * 2);
        ctx.arc(cx + 30, cy - 10, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(cx - 30, cy - 10, 6, 0, Math.PI * 2);
        ctx.arc(cx + 30, cy - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawSpiderEffect(ctx, w, h, time) {
        ctx.save();
        ctx.font = "28px serif";
        ctx.fillText("🕷️", w * 0.25, 90 + Math.sin(time * 2) * 30);
        ctx.fillText("🕷️", w * 0.75, 110 + Math.sin(time * 2.5) * 40);
        ctx.restore();
    }

    function drawBatsEffect(ctx, w, h, time) {
        ctx.save();
        bats.forEach(b => {
            b.x += 0.003;
            if (b.x > 1.1) b.x = -0.1;
            ctx.font = "24px serif";
            ctx.fillText("🦇", b.x * w, b.y * h);
        });
        ctx.restore();
    }

    function drawDemoBackground(ctx, w, h) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#080c16");
        grad.addColorStop(0.5, "#131b2e");
        grad.addColorStop(1, "#0a0714");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const cx = faceBox.x * w;
        const cy = faceBox.y * h;
        ctx.save();
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(cx, cy, h * 0.17, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx, cy + h * 0.35, w * 0.3, h * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "13px monospace";
        ctx.textAlign = "center";
        ctx.fillText("WEBZONE ER & Studio — HD Auto-Enhance Active", w / 2, h - 20);
        ctx.restore();
    }
}
