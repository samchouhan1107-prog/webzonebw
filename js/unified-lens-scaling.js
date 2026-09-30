/* ==========================================================
   UNIFIED LENS SCALING ENGINE
   One face-tracking pipeline with consistent scaling across 0.1x, 1.0x, and 2.0x
   
   CRITICAL REQUIREMENTS:
   - Single face detection system
   - Single face tracking state
   - Single environment anchoring
   - Consistent landmark interpretation
   - Only framing/composition changes with scale
   ========================================================== */

"use strict";

class UnifiedLensScalingEngine {
  constructor() {
    // Lens scale state
    this.currentScale = 1.0; // 0.1x, 1.0x, 2.0x
    this.targetScale = 1.0;
    this.scaleTransition = 0;
    
    // Unified face tracking state (SHARED across all scales)
    this.faceBox = {
      x: 0.5,
      y: 0.42,
      w: 0.32,
      h: 0.44,
      targetX: 0.5,
      targetY: 0.42,
      targetW: 0.32,
      targetH: 0.44,
      detected: false,
      confidence: 0
    };
    
    // Environment anchoring state (SHARED across all scales)
    this.environmentState = {
      anchored: true,
      offsetX: 0,
      offsetY: 0,
      scale: 1.0,
      rotation: 0
    };
    
    // Face detection state (SHARED across all scales)
    this.faceDetectionState = {
      isDetecting: false,
      lastDetection: 0,
      method: "native", // "native" | "chrominance" | "scanning"
      confidence: 0,
      landmarks: null
    };
    
    // Rendering pipeline state
    this.renderState = {
      canvasWidth: 640,
      canvasHeight: 480,
      time: 0,
      cameraReady: false
    };
    
    // Scale configuration
    this.scaleConfig = {
      0.1: { name: "Wide", zoom: 0.1, framing: "wide" },
      1.0: { name: "Normal", zoom: 1.0, framing: "normal" },
      2.0: { name: "Close", zoom: 2.0, framing: "close" }
    };
    
    // Performance optimization
    this.performance = {
      frame: 0,
      lastFaceUpdate: 0,
      lastScaleTransition: 0,
      updateInterval: 120 // ms between face updates
    };
  }
  
  // ==========================================================
  // PUBLIC API - Scale Management
  // ==========================================================
  
  setScale(newScale) {
    // Validate scale
    const validScales = [0.1, 1.0, 2.0];
    if (!validScales.includes(newScale)) {
      console.warn(`[Unified Lens] Invalid scale: ${newScale}. Must be one of: ${validScales.join(', ')}`);
      return;
    }
    
    console.log(`[Unified Lens] Setting scale to ${newScale}x`);
    this.targetScale = newScale;
    
    // Trigger scale transition
    this.startScaleTransition(newScale);
  }
  
  getCurrentScale() {
    return this.currentScale;
  }
  
  getScaleConfig(scale) {
    return this.scaleConfig[scale] || this.scaleConfig[1.0];
  }
  
  // ==========================================================
  // UNIFIED FACE DETECTION (SHARED ACROSS ALL SCALES)
  // ==========================================================
  
  async updateFaceDetection(video, canvas, ctx) {
    const now = performance.now();
    
    // Throttle face detection to prevent performance issues
    if (now - this.performance.lastFaceUpdate < this.performance.updateInterval) {
      return;
    }
    
    this.performance.lastFaceUpdate = now;
    
    try {
      // Use native FaceDetector if available
      if (this.nativeFaceDetector && !this.faceDetectionState.isDetecting) {
        await this.detectFaceNative(video);
      } else {
        // Fallback to chrominance detection
        await this.detectFaceChrominance(video, canvas, ctx);
      }
    } catch (error) {
      console.warn("[Unified Lens] Face detection error:", error);
      this.faceDetectionState.confidence = 0;
      this.faceBox.detected = false;
    }
  }
  
  async detectFaceNative(video) {
    this.faceDetectionState.isDetecting = true;
    
    try {
      const faces = await this.nativeFaceDetector.detect(video);
      
      if (faces && faces.length > 0) {
        const face = faces[0];
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        
        // Normalize coordinates to 0-1 space (SHARED for all scales)
        const rawCx = (face.boundingBox.x + face.boundingBox.width / 2) / vw;
        const rawCy = (face.boundingBox.y + face.boundingBox.height / 2) / vh;
        const rawW = face.boundingBox.width / vw;
        const rawH = face.boundingBox.height / vh;
        
        // Update face box targets (SHARED state)
        this.faceBox.targetX = rawCx;
        this.faceBox.targetY = rawCy;
        this.faceBox.targetW = Math.max(0.24, Math.min(0.55, rawW * 1.15));
        this.faceBox.targetH = Math.max(0.32, Math.min(0.65, rawH * 1.25));
        
        this.faceDetectionState.confidence = 100;
        this.faceBox.detected = true;
        this.faceDetectionState.method = "native";
      } else {
        this.faceBox.detected = false;
        this.faceDetectionState.confidence = 0;
      }
    } catch (error) {
      console.warn("[Unified Lens] Native face detection failed:", error);
      this.faceBox.detected = false;
    } finally {
      this.faceDetectionState.isDetecting = false;
    }
  }
  
  async detectFaceChrominance(video, canvas, ctx) {
    try {
      // Use small analysis canvas for performance
      const analysisCanvas = document.createElement('canvas');
      const analysisCtx = analysisCanvas.getContext('2d');
      analysisCanvas.width = 48;
      analysisCanvas.height = 36;
      
      analysisCtx.drawImage(video, 0, 0, 48, 36);
      const pixels = analysisCtx.getImageData(0, 0, 48, 36).data;
      
      let skinPixels = 0;
      let totalSamples = 0;
      
      // Analyze center region for face detection
      for (let py = 4; py < 32; py += 2) {
        for (let px = 4; px < 44; px += 2) {
          const idx = (py * 48 + px) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          
          // Skin color detection algorithm
          if (this.isSkinColor(r, g, b)) {
            skinPixels++;
          }
          totalSamples++;
        }
      }
      
      const ratio = skinPixels / Math.max(1, totalSamples);
      this.faceBox.detected = ratio > 0.14;
      this.faceDetectionState.confidence = Math.max(0, Math.min(99, ratio * 220));
      this.faceDetectionState.method = "chrominance";
      
      // Use default face position if detected
      if (this.faceBox.detected) {
        this.faceBox.targetX = 0.5;
        this.faceBox.targetY = 0.42;
        this.faceBox.targetW = 0.32;
        this.faceBox.targetH = 0.44;
      }
    } catch (error) {
      this.faceBox.detected = false;
      this.faceDetectionState.confidence = 0;
    }
  }
  
  isSkinColor(r, g, b) {
    return (
      r > 70 &&
      g > 35 &&
      b > 20 &&
      r > g * 1.08 &&
      g > b * 1.05 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 18
    );
  }
  
  // ==========================================================
  // UNIFIED FACE TRACKING (SHARED ACROSS ALL SCALES)
  // ==========================================================
  
  updateFaceTracking() {
    // Smooth interpolation to prevent jumping
    const smoothing = 0.18;
    
    this.faceBox.x += (this.faceBox.targetX - this.faceBox.x) * smoothing;
    this.faceBox.y += (this.faceBox.targetY - this.faceBox.y) * smoothing;
    this.faceBox.w += (this.faceBox.targetW - this.faceBox.w) * smoothing;
    this.faceBox.h += (this.faceBox.targetH - this.faceBox.h) * smoothing;
    
    // Update detection state
    this.faceDetectionState.lastDetection = performance.now();
  }
  
  getFaceBox() {
    // Return the same face box for all scales
    return { ...this.faceBox };
  }
  
  // ==========================================================
  // UNIFIED ENVIRONMENT ANCHORING (SHARED ACROSS ALL SCALES)
  // ==========================================================
  
  updateEnvironmentAnchoring(videoWidth, videoHeight) {
    // Environment remains anchored regardless of scale
    // Only the viewport/composition changes with scale
    
    if (!this.environmentState.anchored) {
      // Calculate environment offset based on face position
      const faceCenterX = this.faceBox.x * videoWidth;
      const faceCenterY = this.faceBox.y * videoHeight;
      
      // Environment stays in scene space, not affected by face position
      this.environmentState.offsetX = 0;
      this.environmentState.offsetY = 0;
      this.environmentState.scale = 1.0;
      this.environmentState.rotation = 0;
    }
  }
  
  getEnvironmentState() {
    return { ...this.environmentState };
  }
  
  // ==========================================================
  // SCALE TRANSITION (FRAMING ONLY - NO EFFECT CHANGES)
  // ==========================================================
  
  startScaleTransition(newScale) {
    console.log(`[Unified Lens] Starting scale transition to ${newScale}x`);
    this.scaleTransition = 0;
    this.targetScale = newScale;
  }
  
  updateScaleTransition() {
    // Smooth scale transition
    const transitionSpeed = 0.15;
    const scaleDiff = this.targetScale - this.currentScale;
    
    if (Math.abs(scaleDiff) > 0.001) {
      this.scaleTransition += transitionSpeed;
      this.currentScale += scaleDiff * transitionSpeed;
      
      // Clamp to exact scale values
      if (Math.abs(this.currentScale - 0.1) < 0.01) {
        this.currentScale = 0.1;
      } else if (Math.abs(this.currentScale - 1.0) < 0.01) {
        this.currentScale = 1.0;
      } else if (Math.abs(this.currentScale - 2.0) < 0.01) {
        this.currentScale = 2.0;
      }
    }
  }
  
  // ==========================================================
  // RENDERING COORDINATE TRANSFORMATION
  // ==========================================================
  
  getTransformedCoordinates(faceBox, scale) {
    // Transform face coordinates based on scale
    // This only affects composition, not the underlying face detection
    
    const config = this.getScaleConfig(scale);
    
    switch (scale) {
      case 0.1: // Wide framing
        return {
          x: faceBox.x * 0.8 + 0.1, // Center and expand
          y: faceBox.y * 0.8 + 0.1,
          w: faceBox.w * 0.8, // Slightly smaller face in wide frame
          h: faceBox.h * 0.8
        };
        
      case 1.0: // Normal framing
        return {
          x: faceBox.x,
          y: faceBox.y,
          w: faceBox.w,
          h: faceBox.h
        };
        
      case 2.0: // Close framing
        return {
          x: faceBox.x * 1.2 - 0.1, // Zoom in on face
          y: faceBox.y * 1.2 - 0.1,
          w: faceBox.w * 1.2,
          h: faceBox.h * 1.2
        };
        
      default:
        return {
          x: faceBox.x,
          y: faceBox.y,
          w: faceBox.w,
          h: faceBox.h
        };
    }
  }
  
  // ==========================================================
  // UNIFIED RENDERING PIPELINE
  // ==========================================================
  
  renderFrame(ctx, canvas, video, currentFilter, time) {
    const w = canvas.width;
    const h = canvas.height;
    
    // 1. Environment/Background (ANCHORED - not affected by scale)
    this.renderEnvironment(ctx, w, h, time);
    
    // 2. Detected & Masked Face (SHARED detection, scale-transformed composition)
    const faceBox = this.getFaceBox();
    const transformedFace = this.getTransformedCoordinates(faceBox, this.currentScale);
    this.renderFace(ctx, w, h, transformedFace, time);
    
    // 3. Face Filter/Lens Effect (SHARED effect system, scale-aware positioning)
    this.renderEffect(ctx, w, h, transformedFace, currentFilter, time);
    
    // 4. Foreground/Overlay Elements
    this.renderForeground(ctx, w, h, time);
    
    // Update performance metrics
    this.performance.frame++;
    this.renderState.time = time;
  }
  
  renderEnvironment(ctx, w, h, time) {
    // Environment rendering - completely independent of face or scale
    // This ensures the environment stays anchored in scene space
    
    if (this.environmentState.anchored) {
      // Draw environment with fixed anchoring
      ctx.save();
      
      // Apply environment transformations (scale, rotation if any)
      ctx.translate(w / 2, h / 2);
      ctx.scale(this.environmentState.scale, this.environmentState.scale);
      ctx.rotate(this.environmentState.rotation);
      ctx.translate(-w / 2 + this.environmentState.offsetX, -h / 2 + this.environmentState.offsetY);
      
      // Render environment (placeholder - actual environment rendering would go here)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, w, h);
      
      ctx.restore();
    }
  }
  
  renderFace(ctx, w, h, faceBox, time) {
    // Render the detected face with consistent masking
    ctx.save();
    
    // Create face mask
    ctx.beginPath();
    ctx.arc(
      faceBox.x * w,
      faceBox.y * h,
      Math.min(w, h) * Math.max(faceBox.w, faceBox.h) * 0.5,
      0,
      Math.PI * 2
    );
    ctx.clip();
    
    // Draw face (would be actual video frame in real implementation)
    ctx.fillStyle = 'rgba(255, 200, 150, 0.8)';
    ctx.fillRect(
      (faceBox.x - faceBox.w / 2) * w,
      (faceBox.y - faceBox.h / 2) * h,
      faceBox.w * w,
      faceBox.h * h
    );
    
    ctx.restore();
  }
  
  renderEffect(ctx, w, h, faceBox, currentFilter, time) {
    // Render face effects - same effect system for all scales
    // Only positioning changes with scale, not the effect itself
    
    ctx.save();
    
    // Apply effect at transformed face position
    const effectX = faceBox.x * w;
    const effectY = faceBox.y * h;
    const effectRadius = Math.min(w, h) * Math.max(faceBox.w, faceBox.h) * 0.5;
    
    // Scale effect intensity based on current scale
    const scaleIntensity = this.getEffectIntensity(currentScale);
    
    // Render effect (placeholder - actual effect rendering would go here)
    ctx.globalAlpha = scaleIntensity;
    ctx.strokeStyle = `hsl(${(time * 50) % 360}, 70%, 60%)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(effectX, effectY, effectRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  renderForeground(ctx, w, h, time) {
    // Render foreground elements - independent of face and scale
    ctx.save();
    
    // Example: render scale indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '16px Arial';
    ctx.fillText(`Scale: ${this.currentScale}x`, 10, 30);
    
    ctx.restore();
  }
  
  getEffectIntensity(scale) {
    // Adjust effect intensity based on scale for visual consistency
    switch (scale) {
      case 0.1: return 0.8;  // Slightly reduced for wide framing
      case 1.0: return 1.0; // Normal intensity
      case 2.0: return 1.2; // Slightly enhanced for close framing
      default: return 1.0;
    }
  }
  
  // ==========================================================
  // INTEGRATION HELPERS
  // ==========================================================
  
  initializeNativeFaceDetector() {
    if (typeof window !== "undefined" && "FaceDetector" in window) {
      try {
        this.nativeFaceDetector = new window.FaceDetector({
          maxDetectedFaces: 1,
          fastMode: true
        });
        console.log("[Unified Lens] Native FaceDetector initialized");
      } catch (error) {
        console.warn("[Unified Lens] Native FaceDetector failed:", error);
        this.nativeFaceDetector = null;
      }
    }
  }
  
  isReady() {
    return this.nativeFaceDetector !== null || true; // Fallback always available
  }
  
  getDebugInfo() {
    return {
      currentScale: this.currentScale,
      targetScale: this.targetScale,
      faceDetected: this.faceBox.detected,
      faceConfidence: this.faceDetectionState.confidence,
      detectionMethod: this.faceDetectionState.method,
      environmentAnchored: this.environmentState.anchored,
      performance: {
        frame: this.performance.frame,
        lastFaceUpdate: this.performance.lastFaceUpdate
      }
    };
  }
}

// Global instance
window.WebZoneBW = window.WebZoneBW || {};
window.WebZoneBW.UnifiedLensScaling = new UnifiedLensScalingEngine();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  window.WebZoneBW.UnifiedLensScaling.initializeNativeFaceDetector();
});

export default UnifiedLensScalingEngine;