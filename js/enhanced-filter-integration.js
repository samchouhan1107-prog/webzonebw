/* ==========================================================
   WEBZONEBW-ER STUDIO — ENHANCED FILTER INTEGRATION
   Bridges the enhanced environment system with existing UI
   while preserving the exact UI layout and functionality.
   
   This script integrates the enhanced filter system with the
   existing Halloween effects system without changing any HTML.
   ========================================================== */

"use strict";

// Integration controller that preserves existing UI while upgrading the backend
class EnhancedFilterIntegration {
  constructor() {
    this.originalHalloweenJS = null;
    this.enhancedSystem = null;
    this.isIntegrationActive = false;
    
    // Preserve original references
    this.originalFunctions = {
      initWebZoneERStudio: null,
      selectFilter: null,
      applyArtThemeShader: null,
      render: null
    };
  }

  // Initialize the enhanced integration
  async initialize() {
    console.log('[EnhancedFilterIntegration] Initializing integration...');

    // Wait for original system to load
    await this.waitForOriginalSystem();
    
    // Store original functions
    this.backupOriginalFunctions();
    
    // Initialize enhanced system
    await this.initializeEnhancedSystem();
    
    // Replace functions with enhanced versions
    this.integrateEnhancedSystem();
    
    // Activate integration
    this.isIntegrationActive = true;
    
    console.log('[EnhancedFilterIntegration] Integration complete - UI preserved, backend enhanced');
  }

  // Wait for the original Halloween system to load
  async waitForOriginalSystem() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (typeof window.initWebZoneERStudio === 'function') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }

  // Backup original functions
  backupOriginalFunctions() {
    this.originalFunctions.initWebZoneERStudio = window.initWebZoneERStudio;
    this.originalFunctions.selectFilter = window.selectFilter;
    this.originalFunctions.applyArtThemeShader = window.applyArtThemeShader;
    this.originalFunctions.render = window.render;
    
    console.log('[EnhancedFilterIntegration] Original functions backed up');
  }

  // Initialize enhanced system components
  async initializeEnhancedSystem() {
    // Import enhanced environment system
    try {
      const { environmentManager } = await import('./enhanced-filter-environment.js');
      this.enhancedSystem = environmentManager;
      await environmentManager.initialize();
      console.log('[EnhancedFilterIntegration] Enhanced environment system loaded');
    } catch (error) {
      console.error('[EnhancedFilterIntegration] Failed to load enhanced system:', error);
    }
  }

  // Integrate enhanced system while preserving UI
  integrateEnhancedSystem() {
    // Store original implementations
    const originalInit = this.originalFunctions.initWebZoneERStudio;
    const originalSelectFilter = this.originalFunctions.selectFilter;
    const originalApplyShader = this.originalFunctions.applyArtThemeShader;
    const originalRender = this.originalFunctions.render;

    // Enhanced init function that preserves all original UI setup
    window.initWebZoneERStudio = function() {
      // Call original init first - this sets up all UI elements exactly as before
      originalInit.call(this);
      
      // Now enhance the system while preserving UI
      console.log('[EnhancedFilterIntegration] Enhancing system after UI setup');
      
      // Enhanced studio state with environment support
      window.studioState = window.studioState || {
        effectEnabled: true,
        animationEnabled: true,
        backgroundEnabled: true,
        strength: 1.0,
        currentEnvironment: null,
        activeEffects: new Set()
      };

      // Enhanced load/save state functions
      window.erLoadStudioState = function() {
        try {
          const saved = JSON.parse(localStorage.getItem("webzonebw-er-studio-state") || "null");
          if (saved && typeof saved === "object") {
            window.studioState.effectEnabled = saved.effectEnabled !== false;
            window.studioState.animationEnabled = saved.animationEnabled !== false;
            window.studioState.backgroundEnabled = saved.backgroundEnabled !== false;
            window.studioState.strength = Math.max(0, Math.min(1, Number(saved.strength) || 1));
          }
        } catch (e) { /* storage unavailable */ }
      };

      window.erSaveStudioState = function() {
        try {
          localStorage.setItem("webzonebw-er-studio-state", JSON.stringify(window.studioState));
        } catch (e) { /* storage unavailable */ }
      };

      // Enhanced strength control
      const strengthRange = document.getElementById("erStrengthRange");
      const strengthValue = document.getElementById("erStrengthValue");
      
      if (strengthRange) {
        // Remove existing listener to avoid duplicates
        const newStrengthRange = strengthRange.cloneNode(true);
        strengthRange.parentNode.replaceChild(newStrengthRange, strengthRange);
        
        newStrengthRange.addEventListener("input", (e) => {
          const value = e.target.value;
          const strength = value / 100;
          window.studioState.strength = strength;
          strengthValue.textContent = `${value}%`;
          window.erSaveStudioState();
        });
      }

      // Enhanced effect toggles
      const effectToggle = document.getElementById("erToggleEffect");
      const animationToggle = document.getElementById("erToggleAnimation");
      const backgroundToggle = document.getElementById("erToggleBackground");

      if (effectToggle) {
        effectToggle.addEventListener("change", (e) => {
          window.studioState.effectEnabled = e.target.checked;
          window.erSaveStudioState();
        });
      }

      if (animationToggle) {
        animationToggle.addEventListener("change", (e) => {
          window.studioState.animationEnabled = e.target.checked;
          window.erSaveStudioState();
        });
      }

      if (backgroundToggle) {
        backgroundToggle.addEventListener("change", (e) => {
          window.studioState.backgroundEnabled = e.target.checked;
          window.erSaveStudioState();
        });
      }

      // Enhanced reset button
      const resetBtn = document.getElementById("erResetStudioBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          // Reset to defaults
          window.studioState = {
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
          if (window.enhancedFilterIntegration) {
            window.enhancedFilterIntegration.cleanupPreviousEnvironment();
          }
          
          window.erSaveStudioState();
        });
      }

      // Load saved state
      window.erLoadStudioState();
    };

    // Enhanced select filter function with environment support
    window.selectFilter = async function(filterName, direction = "none") {
      // Clean up previous environment
      if (window.enhancedFilterIntegration) {
        window.enhancedFilterIntegration.cleanupPreviousEnvironment();
      }

      // Set new filter
      window.currentFilter = filterName;
      
      // Load new environment
      if (window.enhancedFilterIntegration && window.enhancedFilterIntegration.enhancedSystem) {
        const environment = window.enhancedFilterIntegration.enhancedSystem.loadEnvironment(filterName);
        if (environment) {
          window.studioState.currentEnvironment = environment;
          window.studioState.activeEffects = window.enhancedFilterIntegration.enhancedSystem.activeEffects;
        }
      }

      // Continue with original filter selection logic
      return await originalSelectFilter.call(this, filterName, direction);
    };

    // Enhanced shader application with environment support
    window.applyArtThemeShader = function(ctx, w, h, filter, time) {
      // Apply environment effects first
      if (window.studioState.backgroundEnabled && window.studioState.currentEnvironment && window.enhancedFilterIntegration) {
        window.enhancedFilterIntegration.enhancedSystem.applyEnvironmentEffects(ctx, w, h, time, window.studioState.strength);
      }

      // Apply original shader
      return originalApplyShader.call(this, ctx, w, h, filter, time);
    };

    // Enhanced render function with environment support
    window.render = function() {
      const w = canvas.width || 640;
      const h = canvas.height || 480;
      const time = performance.now() * 0.001;

      // Base render logic (unchanged from original)
      if (studioMode === "upload" && uploadedImage) {
        ctx.drawImage(uploadedImage, 0, 0, w, h);
      } else if (isDemoMode) {
        drawDemoBackground(ctx, w, h);
      } else if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, w, h);
      }

      // Auto-HD enhancement (unchanged)
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

      // AI background (unchanged)
      if (currentFilter === "ai-background") {
        drawAIBackgroundDepth(ctx, w, h);
      }

      // Enhanced environment stack
      const erFxTime = window.studioState.animationEnabled ? time : 0;

      // Apply environment effects
      if (window.studioState.backgroundEnabled && window.studioState.currentEnvironment && window.enhancedFilterIntegration) {
        window.enhancedFilterIntegration.enhancedSystem.applyEnvironmentEffects(ctx, w, h, time, window.studioState.strength);
      }

      // Apply effect with strength scaling
      if (window.studioState.effectEnabled) {
        if (window.studioState.strength > 0.02) {
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
    };

    // Enhanced strength-scaled effect application
    window.erApplyStrengthScaledEffect = function(w, h, erFxTime) {
      const fctx = erEnsureFxLayer(w, h);
      fctx.setTransform(1, 0, 0, 1, 0, 0);
      fctx.clearRect(0, 0, w, h);
      fctx.drawImage(canvas, 0, 0, w, h);
      applyArtThemeShader(fctx, w, h, currentFilter, erFxTime);

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = Math.max(0, Math.min(1, window.studioState.strength));
      ctx.drawImage(erFxLayer, 0, 0, w, h);
      ctx.restore();
    };

    // Environment cleanup function
    this.cleanupPreviousEnvironment = function() {
      if (this.enhancedSystem) {
        this.enhancedSystem.teardownEnvironment();
      }
      window.studioState.currentEnvironment = null;
      window.studioState.activeEffects.clear();
    };

    console.log('[EnhancedFilterIntegration] Enhanced functions integrated');
  }

  // Check if integration is active
  isActive() {
    return this.isIntegrationActive;
  }

  // Get current environment information
  getCurrentEnvironment() {
    if (window.studioState && window.studioState.currentEnvironment) {
      return window.studioState.currentEnvironment;
    }
    return null;
  }

  // Get enhanced filter configurations
  getEnhancedFilters() {
    try {
      return window.WebZoneBW?.EnhancedFilterConfigs || [];
    } catch (error) {
      console.error('[EnhancedFilterIntegration] Failed to get enhanced filters:', error);
      return [];
    }
  }
}

// Global integration instance
const enhancedFilterIntegration = new EnhancedFilterIntegration();

// Initialize integration when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    enhancedFilterIntegration.initialize().catch(error => {
      console.error('[EnhancedFilterIntegration] Failed to initialize:', error);
    });
  });

  // Make integration globally available
  window.enhancedFilterIntegration = enhancedFilterIntegration;
}

export { enhancedFilterIntegration };