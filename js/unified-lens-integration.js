/* ==========================================================
   UNIFIED LENS INTEGRATION MODULE
   Bridges the existing Halloween.js system with the new unified lens scaling engine
   
   This module:
   1. Replaces existing lens switching with unified scaling
   2. Maintains UI compatibility
   3. Ensures backward compatibility
   4. Provides smooth transition to unified pipeline
   ========================================================== */

"use strict";

class UnifiedLensIntegration {
  constructor() {
    this.unifiedLens = window.WebZoneBW.UnifiedLensScaling;
    this.originalFunctions = {};
    this.isInitialized = false;
    this.currentFilter = "cartoon";
    
    // Lens scale UI elements
    this.scaleButtons = {
      0.1: null,
      1.0: null,
      2.0: null
    };
    
    // Performance monitoring
    this.performance = {
      frameCount: 0,
      lastFrameTime: 0,
      avgFrameTime: 0
    };
  }
  
  // ==========================================================
  // INITIALIZATION
  // ==========================================================
  
  async initialize() {
    if (this.isInitialized) return;
    
    console.log("[Unified Lens Integration] Initializing...");
    
    // Store original functions
    this.storeOriginalFunctions();
    
    // Initialize unified lens engine
    await this.initializeUnifiedLens();
    
    // Setup UI
    this.setupScaleControls();
    this.setupLensIntegration();
    
    // Replace existing functions
    this.replaceExistingFunctions();
    
    this.isInitialized = true;
    console.log("[Unified Lens Integration] Initialized successfully");
  }
  
  storeOriginalFunctions() {
    // Store original Halloween.js functions before replacement
    if (window.selectFilter) {
      this.originalFunctions.selectFilter = window.selectFilter;
    }
    
    if (window.updateFaceTracking) {
      this.originalFunctions.updateFaceTracking = window.updateFaceTracking;
    }
    
    if (window.render) {
      this.originalFunctions.render = window.render;
    }
  }
  
  async initializeUnifiedLens() {
    // Initialize the unified lens scaling engine
    this.unifiedLens.initializeNativeFaceDetector();
    
    // Wait for engine to be ready
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.unifiedLens.isReady()) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }
  
  // ==========================================================
  // UI SETUP - SCALE CONTROLS
  // ==========================================================
  
  setupScaleControls() {
    // Find or create scale control buttons
    this.findScaleControls();
    
    // Create scale controls if they don't exist
    if (!this.scaleButtons[1.0]) {
      this.createScaleControls();
    }
    
    // Bind scale control events
    this.bindScaleControlEvents();
  }
  
  findScaleControls() {
    // Look for existing scale controls in the DOM
    const scaleContainers = document.querySelectorAll('.scale-controls, .lens-scale, .zoom-controls');
    
    scaleContainers.forEach(container => {
      const buttons = container.querySelectorAll('button, .scale-btn');
      buttons.forEach(btn => {
        const text = btn.textContent || btn.title || "";
        if (text.includes("0.1") || text.includes("0.1x")) {
          this.scaleButtons[0.1] = btn;
        } else if (text.includes("1.0") || text.includes("1.0x") || text.includes("Normal")) {
          this.scaleButtons[1.0] = btn;
        } else if (text.includes("2.0") || text.includes("2.0x") || text.includes("Close")) {
          this.scaleButtons[2.0] = btn;
        }
      });
    });
  }
  
  createScaleControls() {
    // Create scale control UI if not present
    const existingControls = document.getElementById('unifiedScaleControls');
    if (existingControls) return;
    
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'unifiedScaleControls';
    controlsContainer.className = 'unified-scale-controls';
    controlsContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px;
      border-radius: 25px;
      z-index: 1000;
    `;
    
    // Create scale buttons
    [0.1, 1.0, 2.0].forEach(scale => {
      const button = document.createElement('button');
      button.className = `scale-btn scale-${scale}`;
      button.textContent = `${scale}x`;
      button.title = `${this.unifiedLens.getScaleConfig(scale).name} View`;
      button.style.cssText = `
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        background: ${scale === 1.0 ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.2)'};
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      
      button.addEventListener('click', () => {
        this.setScale(scale);
      });
      
      controlsContainer.appendChild(button);
      this.scaleButtons[scale] = button;
    });
    
    // Add to DOM
    document.body.appendChild(controlsContainer);
    
    // Add CSS styles
    this.addScaleControlStyles();
  }
  
  addScaleControlStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .unified-scale-controls .scale-btn:hover {
        background: rgba(56, 189, 248, 0.6) !important;
        transform: scale(1.05);
      }
      
      .unified-scale-controls .scale-btn.active {
        background: rgba(56, 189, 248, 1) !important;
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
      }
      
      .scale-transition {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    `;
    document.head.appendChild(style);
  }
  
  bindScaleControlEvents() {
    // Bind click events to scale buttons
    Object.keys(this.scaleButtons).forEach(scale => {
      const button = this.scaleButtons[scale];
      if (button) {
        button.addEventListener('click', () => {
          this.setScale(parseFloat(scale));
        });
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case '1':
          this.setScale(0.1);
          break;
        case '2':
          this.setScale(1.0);
          break;
        case '3':
          this.setScale(2.0);
          break;
      }
    });
  }
  
  // ==========================================================
  // LENS INTEGRATION
  // ==========================================================
  
  setupLensIntegration() {
    // Integrate with existing lens system
    this.setupLensButtons();
    this.setupFilterIntegration();
  }
  
  setupLensButtons() {
    // Find existing lens buttons and integrate them
    const lensButtons = document.querySelectorAll('.er-lens-bubble, .snap-lens-bubble');
    
    lensButtons.forEach(button => {
      // Override the click handler to use unified system
      const originalClick = button.onclick;
      button.onclick = (e) => {
        e.preventDefault();
        const filterId = button.dataset.filter || button.getAttribute('data-filter');
        if (filterId) {
          this.selectFilter(filterId);
        }
      };
      
      // Keep the original event listeners
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filterId = button.dataset.filter || button.getAttribute('data-filter');
        if (filterId) {
          this.selectFilter(filterId);
        }
      });
    });
  }
  
  setupFilterIntegration() {
    // Integrate with existing filter system
    if (window.allFilterConfigs) {
      this.filterConfigs = window.allFilterConfigs;
    }
  }
  
  // ==========================================================
  // FUNCTION REPLACEMENTS
  // ==========================================================
  
  replaceExistingFunctions() {
    // Replace existing functions with unified versions
    this.replaceSelectFilter();
    this.replaceFaceTracking();
    this.replaceRender();
  }
  
  replaceSelectFilter() {
    if (this.originalFunctions.selectFilter) {
      window.selectFilter = async (filterName, direction = "none") => {
        console.log(`[Unified Lens] Selecting filter: ${filterName}`);
        
        // Use original filter selection logic
        await this.originalFunctions.selectFilter(filterName, direction);
        
        // Update current filter in unified system
        this.currentFilter = filterName;
        
        // Update UI to reflect scale
        this.updateScaleUI();
        
        // Trigger scale transition if needed
        this.onFilterChanged(filterName);
      };
    }
  }
  
  replaceFaceTracking() {
    if (this.originalFunctions.updateFaceTracking) {
      window.updateFaceTracking = async () => {
        // Use unified face tracking
        await this.unifiedLens.updateFaceDetection(
          document.getElementById('cameraVideo'),
          document.getElementById('cameraCanvas'),
          document.getElementById('cameraCanvas').getContext('2d')
        );
        
        this.unifiedLens.updateFaceTracking();
      };
    }
  }
  
  replaceRender() {
    if (this.originalFunctions.render) {
      window.render = () => {
        const canvas = document.getElementById('cameraCanvas');
        const ctx = canvas.getContext('2d');
        const video = document.getElementById('cameraVideo');
        const time = performance.now() * 0.001;
        
        // Update scale transition
        this.unifiedLens.updateScaleTransition();
        
        // Use unified rendering pipeline
        this.unifiedLens.renderFrame(
          ctx,
          canvas,
          video,
          this.currentFilter,
          time
        );
        
        // Update performance monitoring
        this.updatePerformance();
        
        // Continue render loop
        requestAnimationFrame(window.render);
      };
    }
  }
  
  // ==========================================================
  // PUBLIC API
  // ==========================================================
  
  setScale(scale) {
    console.log(`[Unified Lens Integration] Setting scale to ${scale}x`);
    
    // Update unified lens scale
    this.unifiedLens.setScale(scale);
    
    // Update UI
    this.updateScaleUI();
    
    // Show transition feedback
    this.showScaleTransition(scale);
  }
  
  selectFilter(filterName) {
    console.log(`[Unified Lens Integration] Selecting filter: ${filterName}`);
    
    // Use original filter selection
    if (this.originalFunctions.selectFilter) {
      this.originalFunctions.selectFilter(filterName);
    }
    
    // Update current filter
    this.currentFilter = filterName;
    
    // Update UI
    this.updateFilterUI(filterName);
  }
  
  // ==========================================================
  // UI UPDATES
  // ==========================================================
  
  updateScaleUI() {
    const currentScale = this.unifiedLens.getCurrentScale();
    
    // Update scale button states
    Object.keys(this.scaleButtons).forEach(scale => {
      const button = this.scaleButtons[scale];
      if (button) {
        if (parseFloat(scale) === currentScale) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      }
    });
    
    // Update any existing scale displays
    const scaleDisplays = document.querySelectorAll('.scale-display, .zoom-level');
    scaleDisplays.forEach(display => {
      display.textContent = `${currentScale}x`;
    });
  }
  
  updateFilterUI(filterName) {
    // Update lens button states
    const lensButtons = document.querySelectorAll('.er-lens-bubble, .snap-lens-bubble');
    lensButtons.forEach(button => {
      if (button.dataset.filter === filterName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
  
  showScaleTransition(scale) {
    // Show visual feedback for scale transition
    const toast = document.getElementById('scaleTransitionToast');
    if (!toast) {
      const newToast = document.createElement('div');
      newToast.id = 'scaleTransitionToast';
      newToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(56, 189, 248, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-weight: bold;
        z-index: 2000;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(newToast);
    }
    
    const toastElement = document.getElementById('scaleTransitionToast');
    toastElement.textContent = `View: ${this.unifiedLens.getScaleConfig(scale).name}`;
    
    // Hide after 2 seconds
    setTimeout(() => {
      toastElement.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        toastElement.remove();
      }, 300);
    }, 2000);
  }
  
  // ==========================================================
  // EVENT HANDLING
  // ==========================================================
  
  onFilterChanged(filterName) {
    // Handle filter change events
    console.log(`[Unified Lens] Filter changed to: ${filterName}`);
    
    // Update any filter-specific state
    this.updateFilterSpecificState(filterName);
  }
  
  updateFilterSpecificState(filterName) {
    // Adjust unified lens behavior based on filter
    const filter = this.filterConfigs?.find(f => f.id === filterName);
    
    if (filter) {
      // Adjust face detection sensitivity based on filter type
      if (filter.category === 'face') {
        // Face filters might need more precise detection
        this.unifiedLens.performance.updateInterval = 100;
      } else {
        // Scene filters can be less frequent
        this.unifiedLens.performance.updateInterval = 150;
      }
    }
  }
  
  // ==========================================================
  // PERFORMANCE MONITORING
  // ==========================================================
  
  updatePerformance() {
    const now = performance.now();
    this.performance.frameCount++;
    
    if (this.performance.lastFrameTime > 0) {
      const frameTime = now - this.performance.lastFrameTime;
      this.performance.avgFrameTime = 
        (this.performance.avgFrameTime * 0.9) + (frameTime * 0.1);
    }
    
    this.performance.lastFrameTime = now;
  }
  
  getPerformanceMetrics() {
    return {
      frameCount: this.performance.frameCount,
      avgFrameTime: this.performance.avgFrameTime,
      currentFPS: Math.round(1000 / this.performance.avgFrameTime),
      unifiedLensDebug: this.unifiedLens.getDebugInfo()
    };
  }
  
  // ==========================================================
  // CLEANUP
  // ==========================================================
  
  destroy() {
    console.log("[Unified Lens Integration] Cleaning up...");
    
    // Restore original functions
    if (this.originalFunctions.selectFilter) {
      window.selectFilter = this.originalFunctions.selectFilter;
    }
    
    if (this.originalFunctions.updateFaceTracking) {
      window.updateFaceTracking = this.originalFunctions.updateFaceTracking;
    }
    
    if (this.originalFunctions.render) {
      window.render = this.originalFunctions.render;
    }
    
    // Remove UI elements
    const controls = document.getElementById('unifiedScaleControls');
    if (controls) {
      controls.remove();
    }
    
    this.isInitialized = false;
  }
}

// Global instance
window.WebZoneBW = window.WebZoneBW || {};
window.WebZoneBW.UnifiedLensIntegration = new UnifiedLensIntegration();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.WebZoneBW.UnifiedLensIntegration.initialize().catch(console.error);
});

export default UnifiedLensIntegration;