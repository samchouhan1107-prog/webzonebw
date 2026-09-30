/* ==========================================================
   WEBZONEBW-ER STUDIO — FILTER ENVIRONMENT UPGRADE
   Simple integration script that upgrades the filter system
   with comprehensive environment support while preserving UI exactly.
   
   This script should be loaded after the main Halloween effects file
   to enhance the existing system without breaking anything.
   ========================================================== */

"use strict";

// Wait for the original system to be ready
function waitForSystemReady(callback, maxAttempts = 50) {
  let attempts = 0;
  
  function check() {
    attempts++;
    
    if (typeof window.initWebZoneERStudio === 'function' && 
        typeof window.selectFilter === 'function' &&
        typeof window.applyArtThemeShader === 'function') {
      callback();
      return;
    }
    
    if (attempts >= maxAttempts) {
      console.error('[FilterEnvironmentUpgrade] System not ready after', maxAttempts, 'attempts');
      return;
    }
    
    setTimeout(check, 100);
  }
  
  check();
}

// Enhanced environment system
const EnhancedEnvironmentSystem = {
  currentEnvironment: null,
  activeEffects: new Set(),
  
  // Initialize the system
  initialize() {
    console.log('[EnhancedEnvironmentSystem] Initializing...');
    this.currentEnvironment = null;
    this.activeEffects.clear();
  },
  
  // Load environment for a filter
  loadEnvironment(filterId) {
    // Environment definitions for each filter
    const filterEnvironments = {
      // Face filters
      'sunglasses': {
        background: 'studio',
        atmosphere: { fog: 0, particles: 'none', lighting: 'warm' },
        frame: 'soft',
        animation: 'subtle-glow'
      },
      'halo': {
        background: 'fantasy',
        atmosphere: { fog: 0.15, particles: 'sparkles', lighting: 'bloom' },
        frame: 'soft',
        animation: 'floating-halo'
      },
      'goldenhour': {
        background: 'portrait',
        atmosphere: { fog: 0.08, particles: 'dust', lighting: 'golden' },
        frame: 'soft',
        animation: 'warm-glow'
      },
      'cartoon': {
        background: 'studio',
        atmosphere: { fog: 0, particles: 'none', lighting: 'studio' },
        frame: 'cel',
        animation: 'cel-shimmer'
      },
      
      // Scene filters
      'noir': {
        background: 'cinema',
        atmosphere: { fog: 0.05, particles: 'grain', lighting: 'noir' },
        frame: 'letterbox',
        animation: 'film-grain'
      },
      'vintage90s': {
        background: 'vintage',
        atmosphere: { fog: 0.12, particles: 'vintage-dust', lighting: 'warm' },
        frame: 'soft-vignette',
        animation: 'vintage-flicker'
      },
      'cinematic': {
        background: 'cinema',
        atmosphere: { fog: 0.08, particles: 'film-dust', lighting: 'anamorphic' },
        frame: 'letterbox',
        animation: 'cinematic-breath'
      },
      'glitch': {
        background: 'digital',
        atmosphere: { fog: 0.15, particles: 'digital-noise', lighting: 'strobe' },
        frame: 'tech',
        animation: 'glitch-distortion'
      },
      'space': {
        background: 'nebula',
        atmosphere: { fog: 0.25, particles: 'stardust', lighting: 'starfield' },
        frame: 'tech',
        animation: 'cosmic-drift'
      },
      'cyberpunk': {
        background: 'cyber',
        atmosphere: { fog: 0.20, particles: 'neon-rain', lighting: 'neon-scan' },
        frame: 'tech',
        animation: 'cyber-grid'
      },
      
      // Halloween filters
      'ghost-pose': {
        background: 'spectral',
        atmosphere: { fog: 0.40, particles: 'ectoplasm', lighting: 'cold-bloom' },
        frame: 'soft',
        animation: 'spectral-flare'
      },
      'witch-ritual': {
        background: 'witch',
        atmosphere: { fog: 0.32, particles: 'magic-dust', lighting: 'magic-glow' },
        frame: 'magic-circle',
        animation: 'ritual-charging'
      },
      'haunted-forest': {
        background: 'forest',
        atmosphere: { fog: 0.35, particles: 'floating-spirits', lighting: 'moon-top' },
        frame: 'organic',
        animation: 'forest-wispers'
      },
      'vr-cyberdeck': {
        background: 'cyber',
        atmosphere: { fog: 0.06, particles: 'data-streams', lighting: 'holo-grid' },
        frame: 'vr-hud',
        animation: 'cyber-stream'
      },
      'vr-mansion': {
        background: 'manor',
        atmosphere: { fog: 0.35, particles: 'drifting-phantoms', lighting: 'storm-light' },
        frame: 'organic',
        animation: 'phantom-drift'
      },
      'zombie-virus': {
        background: 'cemetery',
        atmosphere: { fog: 0.45, particles: 'decay-dust', lighting: 'cold-dim' },
        frame: 'decaying',
        animation: 'infection-spread'
      },
      'witch-curse': {
        background: 'moonlight',
        atmosphere: { fog: 0.30, particles: 'curse-energy', lighting: 'hellfire' },
        frame: 'magic',
        animation: 'curse-chant'
      },
      'pumpkin-face': {
        background: 'patch',
        atmosphere: { fog: 0.15, particles: 'pumpkin-sparks', lighting: 'lantern' },
        frame: 'pumpkin',
        animation: 'jack-flicker'
      },
      'skull-face': {
        background: 'cemetery',
        atmosphere: { fog: 0.35, particles: 'bone-dust', lighting: 'cold-dim' },
        frame: 'skull',
        animation: 'bone-rattle'
      },
      'devil-horns': {
        background: 'hellfire',
        atmosphere: { fog: 0.25, particles: 'hellfire', lighting: 'hellfire' },
        frame: 'horns',
        animation: 'devil-flame'
      }
    };
    
    const envConfig = filterEnvironments[filterId];
    if (!envConfig) {
      console.warn('[EnhancedEnvironmentSystem] No environment config for filter:', filterId);
      return null;
    }
    
    // Clean up previous environment
    this.teardownEnvironment();
    
    // Set new environment
    this.currentEnvironment = {
      id: filterId,
      config: envConfig,
      startedAt: performance.now()
    };
    
    // Initialize active effects
    this.activeEffects.clear();
    
    // Add background effect
    if (envConfig.background) {
      this.activeEffects.add('background');
    }
    
    // Add atmospheric effects
    if (envConfig.atmosphere) {
      const { fog, particles, lighting } = envConfig.atmosphere;
      if (fog > 0) this.activeEffects.add('fog');
      if (particles && particles !== 'none') this.activeEffects.add('particles');
      if (lighting) this.activeEffects.add('lighting');
    }
    
    // Add frame effect
    if (envConfig.frame) {
      this.activeEffects.add('frame');
    }
    
    // Add animation
    if (envConfig.animation) {
      this.activeEffects.add('animation');
    }
    
    console.log('[EnhancedEnvironmentSystem] Loaded environment for filter:', filterId, envConfig);
    return this.currentEnvironment;
  },
  
  // Clean up current environment
  teardownEnvironment() {
    this.activeEffects.clear();
    this.currentEnvironment = null;
  },
  
  // Apply environment effects to canvas
  applyEnvironmentEffects(ctx, w, h, time, strength = 1.0) {
    if (!this.currentEnvironment) return;
    
    const env = this.currentEnvironment.config;
    
    // Apply background
    if (this.activeEffects.has('background')) {
      this.drawBackground(ctx, w, h, env);
    }
    
    // Apply atmospheric effects
    if (this.activeEffects.has('fog')) {
      this.drawFog(ctx, w, h, env, strength);
    }
    
    if (this.activeEffects.has('particles')) {
      this.drawParticles(ctx, w, h, env, time, strength);
    }
    
    if (this.activeEffects.has('lighting')) {
      this.drawLighting(ctx, w, h, env, strength);
    }
    
    // Apply frame
    if (this.activeEffects.has('frame')) {
      this.drawFrame(ctx, w, h, env);
    }
    
    // Apply animation
    if (this.activeEffects.has('animation')) {
      this.drawAnimation(ctx, w, h, env, time, strength);
    }
  },
  
  // Draw background
  drawBackground(ctx, w, h, env) {
    switch (env.background) {
      case 'studio':
        ctx.fillStyle = 'rgba(246, 182, 215, 0.1)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'fantasy':
        const fantasyGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
        fantasyGrad.addColorStop(0, 'rgba(244, 114, 182, 0.2)');
        fantasyGrad.addColorStop(1, 'rgba(250, 204, 21, 0.1)');
        ctx.fillStyle = fantasyGrad;
        ctx.fillRect(0, 0, w, h);
        break;
      case 'cinema':
        ctx.fillStyle = 'rgba(15, 118, 110, 0.1)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'cyber':
        ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'spectral':
        ctx.fillStyle = 'rgba(224, 242, 254, 0.1)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'forest':
        ctx.fillStyle = 'rgba(163, 230, 53, 0.1)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'cemetery':
        ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'hellfire':
        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'moonlight':
        ctx.fillStyle = 'rgba(226, 232, 240, 0.1)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'patch':
        ctx.fillStyle = 'rgba(249, 115, 22, 0.1)';
        ctx.fillRect(0, 0, w, h);
        break;
      default:
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, w, h);
    }
  },
  
  // Draw fog effect
  drawFog(ctx, w, h, env, strength) {
    const fogIntensity = (env.atmosphere?.fog || 0) * strength;
    if (fogIntensity <= 0) return;
    
    const fogGradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
    fogGradient.addColorStop(0, `rgba(200, 200, 200, ${fogIntensity * 0.3})`);
    fogGradient.addColorStop(1, `rgba(150, 150, 150, ${fogIntensity * 0.6})`);
    
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 0, w, h);
  },
  
  // Draw particles
  drawParticles(ctx, w, h, env, time, strength) {
    const particleCount = Math.floor(30 * strength);
    const particles = env.atmosphere?.particles || 'sparkles';
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(time * 0.001 + i) * 0.5 + 0.5) * w;
      const y = (Math.cos(time * 0.001 + i * 1.3) * 0.5 + 0.5) * h;
      const size = Math.sin(time * 0.002 + i) * 2 + 3;
      const alpha = Math.sin(time * 0.003 + i) * 0.5 + 0.5;
      
      let color = 'rgba(255, 255, 255, ';
      switch (particles) {
        case 'sparkles':
          color = 'rgba(255, 215, 0, ';
          break;
        case 'ectoplasm':
          color = 'rgba(199, 210, 254, ';
          break;
        case 'magic-dust':
          color = 'rgba(147, 51, 234, ';
          break;
        case 'stardust':
          color = 'rgba(147, 51, 234, ';
          break;
        case 'neon-rain':
          color = 'rgba(0, 255, 255, ';
          break;
        case 'pumpkin-sparks':
          color = 'rgba(249, 115, 22, ';
          break;
        default:
          color = 'rgba(255, 255, 255, ';
      }
      
      ctx.fillStyle = color + (alpha * 0.3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  
  // Draw lighting
  drawLighting(ctx, w, h, env, strength) {
    const lighting = env.atmosphere?.lighting;
    if (!lighting) return;
    
    ctx.save();
    
    switch (lighting) {
      case 'bloom':
        ctx.shadowColor = 'rgba(244, 114, 182, 0.5)';
        ctx.shadowBlur = 20 * strength;
        break;
      case 'golden':
        ctx.shadowColor = 'rgba(255, 223, 0, 0.5)';
        ctx.shadowBlur = 15 * strength;
        break;
      case 'cold-bloom':
        ctx.shadowColor = 'rgba(199, 210, 254, 0.5)';
        ctx.shadowBlur = 20 * strength;
        break;
      case 'magic-glow':
        ctx.shadowColor = 'rgba(147, 51, 234, 0.5)';
        ctx.shadowBlur = 25 * strength;
        break;
      case 'neon-scan':
        ctx.shadowColor = 'rgba(0, 255, 255, 0.5)';
        ctx.shadowBlur = 15 * strength;
        break;
      case 'hellfire':
        ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        ctx.shadowBlur = 20 * strength;
        break;
      case 'lantern':
        ctx.shadowColor = 'rgba(249, 115, 22, 0.5)';
        ctx.shadowBlur = 15 * strength;
        break;
    }
    
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();
  },
  
  // Draw frame
  drawFrame(ctx, w, h, env) {
    ctx.save();
    
    switch (env.frame) {
      case 'letterbox':
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h * 0.15);
        ctx.fillRect(0, h * 0.85, w, h * 0.15);
        break;
      case 'soft':
        const vignette = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
        break;
      case 'tech':
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, w - 20, h - 20);
        break;
      case 'magic-circle':
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w/2, h/2, Math.min(w, h)/3, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'vr-hud':
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, w - 40, h - 40);
        break;
    }
    
    ctx.restore();
  },
  
  // Draw animation
  drawAnimation(ctx, w, h, env, time, strength) {
    // Animation effects are subtle and handled in the main shader
    switch (env.animation) {
      case 'subtle-glow':
        const glowIntensity = Math.sin(time * 0.002) * 0.1 + 0.1;
        ctx.shadowColor = `rgba(246, 182, 215, ${glowIntensity * strength})`;
        ctx.shadowBlur = 10 * strength;
        break;
      case 'floating-halo':
        const haloOffset = Math.sin(time * 0.001) * 5;
        ctx.translate(haloOffset, 0);
        break;
      case 'spectral-flare':
        const flareIntensity = Math.sin(time * 0.003) * 0.2 + 0.3;
        ctx.shadowColor = `rgba(199, 210, 254, ${flareIntensity * strength})`;
        ctx.shadowBlur = 30 * strength;
        break;
    }
  }
};

// Global environment system
window.EnhancedEnvironmentSystem = EnhancedEnvironmentSystem;

// Initialize the enhanced system
function initializeEnhancedFilterSystem() {
  console.log('[FilterEnvironmentUpgrade] Initializing enhanced filter system...');
  
  // Initialize environment system
  EnhancedEnvironmentSystem.initialize();
  
  // Enhanced studio state
  window.studioState = window.studioState || {
    effectEnabled: true,
    animationEnabled: true,
    backgroundEnabled: true,
    strength: 1.0,
    currentEnvironment: null,
    activeEffects: new Set()
  };
  
  // Enhanced load/save functions
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
  
  // Enhanced select filter function
  const originalSelectFilter = window.selectFilter;
  window.selectFilter = async function(filterName, direction = "none") {
    // Clean up previous environment
    EnhancedEnvironmentSystem.teardownEnvironment();
    
    // Set new filter
    window.currentFilter = filterName;
    
    // Load new environment
    const environment = EnhancedEnvironmentSystem.loadEnvironment(filterName);
    if (environment) {
      window.studioState.currentEnvironment = environment;
      window.studioState.activeEffects = EnhancedEnvironmentSystem.activeEffects;
    }
    
    // Continue with original logic
    return await originalSelectFilter.call(this, filterName, direction);
  };
  
  // Enhanced shader application
  const originalApplyShader = window.applyArtThemeShader;
  window.applyArtThemeShader = function(ctx, w, h, filter, time) {
    // Apply environment effects first
    if (window.studioState.backgroundEnabled && window.studioState.currentEnvironment) {
      EnhancedEnvironmentSystem.applyEnvironmentEffects(ctx, w, h, time, window.studioState.strength);
    }
    
    // Apply original shader
    return originalApplyShader.call(this, ctx, w, h, filter, time);
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
  
  // Enhanced toggle controls
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
      EnhancedEnvironmentSystem.teardownEnvironment();
      
      window.erSaveStudioState();
    });
  }
  
  // Load saved state
  window.erLoadStudioState();
  
  console.log('[FilterEnvironmentUpgrade] Enhanced filter system initialized successfully');
}

// Start the upgrade process
waitForSystemReady(() => {
  initializeEnhancedFilterSystem();
}, 100);

console.log('[FilterEnvironmentUpgrade] Filter environment upgrade script loaded');