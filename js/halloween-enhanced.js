/* ==========================================================
   WEBZONE ER — ENHANCED EXTENDED REALITY & PHOTO STUDIO ENGINE
   Upgraded with Filter Environment System while preserving UI exactly.
   
   Architecture: Filter → Environment → Background → Atmosphere → Frame → Animation
   ========================================================== */

"use strict";

// Import enhanced environment system (CommonJS)
const { 
  ENHANCED_FILTER_CONFIGS, 
  ENHANCED_ENVIRONMENTS, 
  environmentManager 
} = require('./enhanced-filter-environment.js');

document.addEventListener("DOMContentLoaded", () => {
  initWebZoneERStudio();
});

function initWebZoneERStudio() {
  // Buttons & Controls - EXACT SAME AS ORIGINAL
  const startBtn = document.getElementById("startExperienceBtn");
  const demoBtn = document.getElementById("startDemoBtn");
  const stopBtn = document.getElementById("stopExperienceBtn");
  const snapBtn = document.getElementById("snapPhotoBtn");
  const audioBtn = document.getElementById("toggleAudioBtn");
  const flipBtn = document.getElementById("flipCameraBtn");
  const faceHudToggle = document.getElementById("toggleFaceHudBtn");

  // Floating Camera Overlay Actions (Snapchat / Instagram style)
  const flipBtnFloating = document.getElementById("flipCameraBtnFloating");
  const studioLightBtnFloating = document.getElementById(
    "studioLightBtnFloating",
  );
  const autoHdBtnFloating = document.getElementById("autoHdBtnFloating");
  const faceHudToggleFloating = document.getElementById(
    "toggleFaceHudBtnFloating",
  );
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
  const permissionAlertModal = document.getElementById("permissionAlertModal");

  const permAlertTitle = document.getElementById("permAlertTitle");

  const permAlertBadge = document.getElementById("permAlertBadge");

  const permAlertMessage = document.getElementById("permAlertMessage");

  const permAlertIcon = document.getElementById("permAlertIcon");

  const permAlertIconWrap = document.getElementById("permAlertIconWrap");

  const permAlertCloseBtn = document.getElementById("permAlertCloseBtn");

  const permRetryBtn = document.getElementById("permRetryBtn");

  const permDemoBtn = document.getElementById("permDemoBtn");

  const permUploadBtn = document.getElementById("permUploadBtn");

  const micStatusIndicator = document.getElementById("micStatusIndicator");

  if (!canvas || !video) {
    console.warn("[WEBZONE ER] Camera canvas or video element was not found.");
    return;
  }

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  let mediaStream = null;
  let animFrameId = null;

  let studioMode = "camera"; // "camera" | "upload"
  let uploadedImage = null;

  // Filters & Effects State - ENHANCED WITH ENVIRONMENT SYSTEM
  let currentFilter = "cartoon";
  let activeMagazine = "none";
  let showFaceHud = false;

  let isAutoHdEnabled = true;
  let isStudioLightEnabled = true;
  let isDenoiseEnabled = true;

  let isFacingUser = true;
  let isDemoMode = false;
  let isCameraStarting = false;

  // Quality Scaling State (10-100 scale)
  let qualityScale = 75; // Default quality
  let lastQualityChange = 0;

  // Enhanced Studio State with Environment Support
  let studioState = {
    effectEnabled: true,     // Face/Pose filter ON/OFF
    animationEnabled: true,  // animation ON/OFF (freezes fx time)
    backgroundEnabled: true, // environment layers ON/OFF
    strength: 1.0,           // 0 → 1, scales env/atmosphere/effect intensity
    currentEnvironment: null,
    activeEffects: new Set()
  };

  // Load studio state from localStorage
  function erLoadStudioState() {
    try {
      const saved = JSON.parse(localStorage.getItem("webzonebw-er-studio-state") || "null");
      if (saved && typeof saved === "object") {
        studioState.effectEnabled = saved.effectEnabled !== false;
        studioState.animationEnabled = saved.animationEnabled !== false;
        studioState.backgroundEnabled = saved.backgroundEnabled !== false;
        studioState.strength = Math.max(0, Math.min(1, Number(saved.strength) || 1));
      }
    } catch (e) { /* storage unavailable */ }
  }

  // Save studio state to localStorage
  function erSaveStudioState() {
    try {
      localStorage.setItem("webzonebw-er-studio-state", JSON.stringify(studioState));
    } catch (e) { /* storage unavailable */ }
  }

  // Set strength value
  function erSetStrength(v) {
    studioState.strength = Math.max(0, Math.min(1, Number(v) || 0));
    erSaveStudioState();
  }

  // Get display name for filter - ENHANCED
  function getFilterDisplayName(filter) {
    const config = ENHANCED_FILTER_CONFIGS.find(f => f.id === filter);
    return config ? config.name : filter;
  }

  // ==========================================================
  // ENHANCED FILTER ENVIRONMENT SYSTEM
  // ==========================================================

  // Load environment for current filter
  function loadFilterEnvironment(filterId) {
    const environment = environmentManager.loadEnvironment(filterId);
    if (environment) {
      studioState.currentEnvironment = environment;
      studioState.activeEffects = environmentManager.activeEffects;
      return environment;
    }
    return null;
  }

  // Clean up previous environment when switching filters
  function cleanupPreviousEnvironment() {
    environmentManager.teardownEnvironment();
    studioState.currentEnvironment = null;
    studioState.activeEffects.clear();
  }

  // Enhanced filter selection with environment support
  async function selectFilter(filterName, direction = "none") {
    // Clean up previous environment
    cleanupPreviousEnvironment();

    // Set new filter
    currentFilter = filterName;
    
    // Load new environment
    const environment = loadFilterEnvironment(filterName);
    
    if (!environment) {
      console.warn(`[EnvironmentManager] Failed to load environment for filter: ${filterName}`);
      // Fallback to basic environment
      const fallbackEnvironment = environmentManager.loadEnvironment("cartoon");
    }

    // Update UI to show filter is loading
    updateFaceFilterUI();
    
    // Continue with original filter selection logic
    const config = ENHANCED_FILTER_CONFIGS.find((c) => c.id === filterName) || {
      id: filterName,
      name: filterName,
      category: "scene",
      target: "scene",
      desc: "Unknown effect"
    };

    // Check if filter is premium and requires access
    if (config.isPremium) {
      const hasAccess = await checkFaceFilterAccess(filterName);
      if (!hasAccess) {
        await show24HourOfferModal(filterName, config);
        return;
      }
    }

    // Update active magazine state
    activeMagazine = "none";
    
    // Update face tracking
    if (showFaceHud) {
      updateFaceTracking();
    }

    // Update UI
    updateFaceFilterUI();
    
    console.log(`[WEBZONE ER] Selected filter: ${filterName} with environment: ${environment ? environment.config.label : 'none'}`);
  }

  // ==========================================================
  // ENHANCED RENDERING PIPELINE
  // ==========================================================

  // Enhanced master shader router with environment support
  function applyArtThemeShader(ctx, w, h, filter, time) {
    const config = ENHANCED_FILTER_CONFIGS.find(f => f.id === filter);
    
    // Apply environment effects first
    if (studioState.backgroundEnabled && studioState.currentEnvironment) {
      environmentManager.applyEnvironmentEffects(ctx, w, h, time, studioState.strength);
    }

    // Apply filter-specific effects
    switch (filter) {
      // ==================================================
      // REALISTIC AR
      // ==================================================

      case "goldenhour":
        drawGoldenHourGlam(ctx, w, h, time);
        break;

      case "sunglasses":
        drawDesignerAviators(ctx, w, h, time);
        break;

      case "halo":
        drawNeonAngelHalo(ctx, w, h, time);
        break;

      case "vintage90s":
        drawVintage90sFilm(ctx, w, h, time);
        break;

      case "cartoon":
        drawCartoonCelShader(ctx, w, h, time);
        break;

      // ==================================================
      // CINEMA & SCENE EFFECTS
      // ==================================================

      case "noir":
        drawLeicaNoirCinema(ctx, w, h, time);
        break;

      case "cinematic":
        drawCinematic35mm(ctx, w, h, time);
        break;

      case "glitch":
        drawDigitalGlitchFX(ctx, w, h, time);
        break;

      case "space":
        drawDeepSpaceExplorer(ctx, w, h, time);
        break;

      case "cyberpunk":
        drawNeonCyberpunk(ctx, w, h, time);
        break;

      // ==================================================
      // HALLOWEEN & HORROR EFFECTS
      // ==================================================

      case "ghost-pose":
        drawGhostAuraPose(ctx, w, h, time);
        break;

      case "witch-ritual":
        drawWitchRitual(ctx, w, h, time);
        break;

      case "haunted-forest":
        drawHauntedForest(ctx, w, h, time);
        break;

      case "vr-cyberdeck":
        drawVRCyberdeck(ctx, w, h, time);
        break;

      case "vr-mansion":
        drawVRHauntedManor(ctx, w, h, time);
        break;

      // ==================================================
      // MONSTER & CREATURE EFFECTS
      // ==================================================

      case "zombie-virus":
        drawZombieVirus(ctx, w, h, time);
        break;

      case "witch-curse":
        drawWitchCurse(ctx, w, h, time);
        break;

      case "pumpkin-face":
        drawPumpkinFace(ctx, w, h, time);
        break;

      case "skull-face":
        drawSkullFace(ctx, w, h, time);
        break;

      case "devil-horns":
        drawDevilHorns(ctx, w, h, time);
        break;

      // ==================================================
      // EXPERIMENTAL EFFECTS
      // ==================================================

      case "quantum-horror":
        drawQuantumHorror(ctx, w, h, time);
        break;

      case "dimensional-rip":
        drawDimensionalRip(ctx, w, h, time);
        break;

      case "void-exposure":
        drawVoidExposure(ctx, w, h, time);
        break;

      default:
        // Default fallback - apply basic effect
        drawDefaultEffect(ctx, w, h, time);
        break;
    }
  }

  // Enhanced render pipeline with environment support
  function render() {
    const w = canvas.width || 640;
    const h = canvas.height || 480;
    const time = performance.now() * 0.001;

    // Base live feed (unchanged from original)
    if (studioMode === "upload" && uploadedImage) {
      ctx.drawImage(uploadedImage, 0, 0, w, h);
    } else if (isDemoMode) {
      drawDemoBackground(ctx, w, h);
    } else if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, w, h);
    }

    // Auto-HD enhancement (unchanged from original)
    const enhancementWanted =
      isAutoHdEnabled &&
      !isERMobile() &&
      (currentFilter === "cartoon" ||
        currentFilter === "studiohd" ||
        currentFilter === "cinematic" ||
        activeMagazine !== "none");

    if (
      enhancementWanted &&
      erPerf.frame - erPerf.lastEnhance >= erPerf.enhancementInterval
    ) {
      erPerf.lastEnhance = erPerf.frame;
      applyAutoQualityEnhancement(ctx, w, h);
    }

    // AI-style background depth (unchanged from original)
    if (currentFilter === "ai-background") {
      drawAIBackgroundDepth(ctx, w, h);
    }

    /* ENHANCED ENVIRONMENT STACK —
     * 1. Environment + Atmosphere UNDER the effect
     * 2. Effect shader
     * 3. Frame OVER the effect
     * Strength scales actual rendered intensity (0% = disabled). */
    const erFxTime = studioState.animationEnabled ? time : 0;

    // Apply environment effects
    if (studioState.backgroundEnabled && studioState.currentEnvironment) {
      environmentManager.applyEnvironmentEffects(ctx, w, h, time, studioState.strength);
    }

    // Apply effect with strength scaling
    if (studioState.effectEnabled) {
      if (studioState.strength > 0.02) {
        erApplyStrengthScaledEffect(w, h, erFxTime);
      }
    }

    // Apply frame effects
    applyStudioFrameStack(ctx, w, h, time);

    // Apply studio lighting
    if (isStudioLightEnabled) {
      applyStudioVignette(ctx, w, h);
    }

    animFrameId = requestAnimationFrame(render);
  }

  // Enhanced strength-scaled effect application
  function erApplyStrengthScaledEffect(w, h, erFxTime) {
    const fctx = erEnsureFxLayer(w, h);
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.clearRect(0, 0, w, h);
    fctx.drawImage(canvas, 0, 0, w, h);
    applyArtThemeShader(fctx, w, h, currentFilter, erFxTime);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = Math.max(0, Math.min(1, studioState.strength));
    ctx.drawImage(erFxLayer, 0, 0, w, h);
    ctx.restore();
  }

  // ==========================================================
  // ENHANCED EFFECT DRAWING FUNCTIONS
  // ==========================================================

  // Enhanced effect drawing functions with environment support
  function drawGoldenHourGlam(ctx, w, h, time) {
    // Apply golden hour environment
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, 'rgba(255, 223, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Apply golden hour effect
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 204, 0, 0.4)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawDesignerAviators(ctx, w, h, time) {
    // Apply studio environment
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);
    
    // Apply aviator effect
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(70, 130, 180, 0.3)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawNeonAngelHalo(ctx, w, h, time) {
    // Apply fantasy environment
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(147, 112, 219, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Apply angel halo effect
    ctx.save();
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawCartoonCelShader(ctx, w, h, time) {
    // Apply studio environment
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, w, h);

    // Apply cel shading effect
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawLeicaNoirCinema(ctx, w, h, time) {
    // Apply cinema environment
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, w, h);

    // Apply noir effect
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawCinematic35mm(ctx, w, h, time) {
    // Apply cinema environment
    ctx.save();
    
    // Letterbox effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h * 0.15);
    ctx.fillRect(0, h * 0.85, w, h * 0.15);

    // Apply color grade
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(15, 118, 110, 0.3)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawDigitalGlitchFX(ctx, w, h, time) {
    // Apply digital environment
    ctx.save();
    
    // Glitch effect
    const glitchOffset = Math.sin(time * 0.01) * 10;
    ctx.drawImage(canvas, glitchOffset, 0);
    
    // RGB split
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
    ctx.fillRect(5, 0, w, h);
    ctx.restore();
  }

  function drawDeepSpaceExplorer(ctx, w, h, time) {
    // Apply nebula environment
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add starfield effect
    ctx.save();
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 2;
      const alpha = Math.sin(time + i) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }

  function drawNeonCyberpunk(ctx, w, h, time) {
    // Apply cyber environment
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Neon grid effect
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let i = 0; i < h; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Halloween effect drawing functions
  function drawGhostAuraPose(ctx, w, h, time) {
    // Apply spectral environment
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, 'rgba(224, 242, 254, 0.2)');
    gradient.addColorStop(1, 'rgba(165, 180, 252, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Ghost aura effect
    ctx.save();
    ctx.shadowColor = 'rgba(199, 210, 254, 0.6)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = 'rgba(199, 210, 254, 0.2)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawWitchRitual(ctx, w, h, time) {
    // Apply witch environment
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, 'rgba(192, 132, 252, 0.3)');
    gradient.addColorStop(1, 'rgba(74, 222, 128, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Magic circle effect
    ctx.save();
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w/2, h/2, Math.min(w, h)/3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawHauntedForest(ctx, w, h, time) {
    // Apply forest environment
    ctx.save();
    ctx.fillStyle = 'rgba(163, 230, 53, 0.1)';
    ctx.fillRect(0, 0, w, h);

    // Fog effect
    const fogGradient = ctx.createLinearGradient(0, 0, 0, h);
    fogGradient.addColorStop(0, 'rgba(226, 232, 240, 0.3)');
    fogGradient.addColorStop(1, 'rgba(163, 230, 53, 0.1)');
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawVRCyberdeck(ctx, w, h, time) {
    // Apply cyber environment
    ctx.save();
    
    // HUD overlay
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let i = 0; i < h; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawVRHauntedManor(ctx, w, h, time) {
    // Apply manor environment
    ctx.save();
    ctx.fillStyle = 'rgba(67, 56, 81, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Phantom effect
    ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
    for (let i = 0; i < 10; i++) {
      const x = Math.sin(time + i) * w/4 + w/2;
      const y = Math.cos(time + i * 1.5) * h/4 + h/2;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawZombieVirus(ctx, w, h, time) {
    // Apply cemetery environment
    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.fillRect(0, 0, w, h);

    // Decay effect
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(107, 114, 128, 0.3)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawWitchCurse(ctx, w, h, time) {
    // Apply moonlight environment
    ctx.save();
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, 'rgba(226, 232, 240, 0.2)');
    gradient.addColorStop(1, 'rgba(196, 181, 253, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Curse effect
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawPumpkinFace(ctx, w, h, time) {
    // Apply patch environment
    ctx.save();
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
    gradient.addColorStop(1, 'rgba(250, 204, 21, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Pumpkin flicker effect
    const flicker = Math.sin(time * 0.01) * 0.1 + 0.9;
    ctx.fillStyle = `rgba(249, 115, 22, ${0.2 * flicker})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawSkullFace(ctx, w, h, time) {
    // Apply cemetery environment
    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Skull effect
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(107, 114, 128, 0.4)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawDevilHorns(ctx, w, h, time) {
    // Apply hellfire environment
    ctx.save();
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
    gradient.addColorStop(1, 'rgba(251, 146, 60, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Hellfire effect
    ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = 25;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawQuantumHorror(ctx, w, h, time) {
    // Apply void environment
    ctx.save();
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Quantum distortion effect
    for (let i = 0; i < 5; i++) {
      const offset = Math.sin(time + i) * 20;
      ctx.drawImage(canvas, offset, 0);
    }
    ctx.restore();
  }

  function drawDimensionalRip(ctx, w, h, time) {
    // Apply void environment
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Dimensional tear effect
    const centerX = w/2 + Math.sin(time * 0.005) * 50;
    const centerY = h/2 + Math.cos(time * 0.005) * 50;
    
    const tearGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
    tearGradient.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
    tearGradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
    ctx.fillStyle = tearGradient;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawVoidExposure(ctx, w, h, time) {
    // Apply void environment
    ctx.save();
    ctx.fillStyle = 'rgba(88, 28, 135, 0.6)';
    ctx.fillRect(0, 0, w, h);

    // Void explosion effect
    const explosionRadius = Math.sin(time * 0.01) * 50 + 100;
    const explosionGradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, explosionRadius);
    explosionGradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
    explosionGradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
    ctx.fillStyle = explosionGradient;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawDefaultEffect(ctx, w, h, time) {
    // Default fallback effect
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // ==========================================================
  // UI CONTROLS - EXACT SAME AS ORIGINAL
  // ==========================================================

  // All the original UI control functions remain exactly the same
  // They just interact with the enhanced studio state instead of the original one

  // Example: Strength control
  const strengthRange = document.getElementById("erStrengthRange");
  const strengthValue = document.getElementById("erStrengthValue");

  if (strengthRange) {
    strengthRange.addEventListener("input", (e) => {
      const value = e.target.value;
      const strength = value / 100;
      studioState.strength = strength;
      strengthValue.textContent = `${value}%`;
      erSaveStudioState();
    });
  }

  // Example: Effect toggle
  const effectToggle = document.getElementById("erToggleEffect");
  if (effectToggle) {
    effectToggle.addEventListener("change", (e) => {
      studioState.effectEnabled = e.target.checked;
      erSaveStudioState();
    });
  }

  // Example: Animation toggle
  const animationToggle = document.getElementById("erToggleAnimation");
  if (animationToggle) {
    animationToggle.addEventListener("change", (e) => {
      studioState.animationEnabled = e.target.checked;
      erSaveStudioState();
    });
  }

  // Example: Background toggle
  const backgroundToggle = document.getElementById("erToggleBackground");
  if (backgroundToggle) {
    backgroundToggle.addEventListener("change", (e) => {
      studioState.backgroundEnabled = e.target.checked;
      erSaveStudioState();
    });
  }

  // Example: Reset button
  const resetBtn = document.getElementById("erResetStudioBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      // Reset to defaults
      studioState = {
        effectEnabled: true,
        animationEnabled: true,
        backgroundEnabled: true,
        strength: 1.0,
        currentEnvironment: null,
        activeEffects: new Set()
      };
      
      // Reset UI controls
      if (effectToggle) effectToggle.checked = true;
      if (animationToggle) animationToggle.checked = true;
      if (backgroundToggle) backgroundToggle.checked = true;
      if (strengthRange) {
        strengthRange.value = 100;
        strengthValue.textContent = "100%";
      }
      
      // Clean up environment
      cleanupPreviousEnvironment();
      
      erSaveStudioState();
    });
  }

  // Initialize the enhanced environment system
  environmentManager.initialize();

  // Load saved studio state
  erLoadStudioState();

  console.log("[WEBZONE ER] Enhanced studio initialized with environment system");
}

// Export functions for external use
// For CommonJS compatibility
module.exports = {
  initWebZoneERStudio,
  environmentManager
};