/* =====================================================
   WEBZONEBW ER STUDIO — RENDERING ENGINE
   ===================================================== */

(function() {
    "use strict";

    // Rendering Engine Module
    const RenderingEngine = {
        // Core state
        isInitialized: false,
        isActive: false,
        renderFrameId: null,
        currentRenderMode: 'normal',
        effects: {},
        overlays: [],
        
        // Configuration
        config: {
            targetFPS: 60,
            enableVFX: true,
            enableOverlays: true,
            enablePostProcessing: true,
            maxOverlays: 10
        },
        
        // Initialize rendering engine
        async initialize() {
            if (this.isInitialized) return;
            
            try {
                // Get canvas context
                this.canvas = document.getElementById('cameraCanvas');
                if (!this.canvas) {
                    console.error('[Rendering] Camera canvas not found');
                    return;
                }
                
                this.ctx = this.canvas.getContext('2d', {
                    willReadFrequently: true,
                    alpha: true
                });
                
                // Initialize effects
                this.initializeEffects();
                
                // Initialize overlays
                this.initializeOverlays();
                
                this.isInitialized = true;
                console.log('[Rendering] Rendering engine initialized');
                
            } catch (error) {
                console.error('[Rendering] Initialization failed:', error);
            }
        },
        
        // Initialize effects
        initializeEffects() {
            this.effects = {
                // Scene Effects
                noir: {
                    name: 'Leica Noir',
                    type: 'scene',
                    render: this.renderNoirEffect.bind(this),
                    enabled: false
                },
                
                vintage90s: {
                    name: 'Retro 90s',
                    type: 'scene',
                    render: this.renderVintage90sEffect.bind(this),
                    enabled: false
                },
                
                cinematic: {
                    name: '35mm Film',
                    type: 'scene',
                    render: this.renderCinematicEffect.bind(this),
                    enabled: false
                },
                
                glitch: {
                    name: 'Glitch FX',
                    type: 'scene',
                    render: this.renderGlitchEffect.bind(this),
                    enabled: false
                },
                
                // VR Effects
                vrNebula: {
                    name: 'VR Nebula',
                    type: 'vr',
                    render: this.renderVrNebulaEffect.bind(this),
                    enabled: false
                },
                
                hauntedForest: {
                    name: 'Haunted Forest',
                    type: 'vr',
                    render: this.renderHauntedForestEffect.bind(this),
                    enabled: false
                },
                
                // Pose Effects
                ghostPose: {
                    name: 'Ghost Pose',
                    type: 'pose',
                    render: this.renderGhostPoseEffect.bind(this),
                    enabled: false
                },
                
                poseFrame: {
                    name: 'Pose Align',
                    type: 'pose',
                    render: this.renderPoseFrameEffect.bind(this),
                    enabled: false
                },
                
                pumpkinPose: {
                    name: 'Pumpkin Pose',
                    type: 'pose',
                    render: this.renderPumpkinPoseEffect.bind(this),
                    enabled: false
                }
            };
        },
        
        // Initialize overlays
        initializeOverlays() {
            this.overlays = [
                {
                    id: 'faceHud',
                    type: 'hud',
                    render: this.renderFaceHud.bind(this),
                    enabled: false,
                    priority: 10
                },
                {
                    id: 'cameraInfo',
                    type: 'info',
                    render: this.renderCameraInfo.bind(this),
                    enabled: true,
                    priority: 5
                },
                {
                    id: 'filterOverlay',
                    type: 'filter',
                    render: this.renderFilterOverlay.bind(this),
                    enabled: false,
                    priority: 15
                }
            ];
        },
        
        // Start rendering
        startRendering() {
            if (this.isActive) return;
            
            this.isActive = true;
            this.renderFrame();
            
            console.log('[Rendering] Rendering started');
        },
        
        // Stop rendering
        stopRendering() {
            this.isActive = false;
            
            if (this.renderFrameId) {
                cancelAnimationFrame(this.renderFrameId);
                this.renderFrameId = null;
            }
            
            // Clear canvas
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            console.log('[Rendering] Rendering stopped');
        },
        
        // Main render loop
        renderFrame() {
            if (!this.isActive) return;
            
            try {
                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Render base video frame (if available)
                this.renderVideoFrame();
                
                // Render effects
                this.renderEffects();
                
                // Render overlays
                this.renderOverlays();
                
            } catch (error) {
                console.error('[Rendering] Render frame error:', error);
            }
            
            // Schedule next frame
            this.renderFrameId = requestAnimationFrame(() => this.renderFrame());
        },
        
        // Render video frame
        renderVideoFrame() {
            const video = document.getElementById('cameraVideo');
            if (video && !video.paused && !video.ended) {
                this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
            }
        },
        
        // Render effects
        renderEffects() {
            Object.values(this.effects).forEach(effect => {
                if (effect.enabled) {
                    effect.render();
                }
            });
        },
        
        // Render overlays
        renderOverlays() {
            // Sort overlays by priority
            const sortedOverlays = [...this.overlays].sort((a, b) => b.priority - a.priority);
            
            sortedOverlays.forEach(overlay => {
                if (overlay.enabled) {
                    overlay.render();
                }
            });
        },
        
        // Effect render methods
        renderNoirEffect() {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // Convert to grayscale and add contrast
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                const enhanced = Math.min(255, gray * 1.2);
                
                data[i] = enhanced;
                data[i + 1] = enhanced;
                data[i + 2] = enhanced;
            }
            
            this.ctx.putImageData(imageData, 0, 0);
        },
        
        renderVintage90sEffect() {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // Add vintage color grading
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 1.1); // Red channel
                data[i + 1] = Math.min(255, data[i + 1] * 0.9); // Green channel
                data[i + 2] = Math.min(255, data[i + 2] * 0.8); // Blue channel
            }
            
            this.ctx.putImageData(imageData, 0, 0);
        },
        
        renderCinematicEffect() {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // Add cinematic color grading
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 0.9); // Reduce red
                data[i + 1] = Math.min(255, data[i + 1] * 0.95); // Slightly reduce green
                data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Increase blue
            }
            
            this.ctx.putImageData(imageData, 0, 0);
            
            // Add letterbox
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, 50);
            this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        },
        
        renderGlitchEffect() {
            // Create glitch effect by shifting channels
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            
            // Random channel shift
            const shift = Math.random() * 20 - 10;
            const shiftedData = new Uint8ClampedArray(data);
            
            for (let i = 0; i < data.length; i += 4) {
                if (Math.random() < 0.1) { // 10% chance of glitch
                    shiftedData[i] = data[i + Math.abs(shift) * 4] || data[i];
                    shiftedData[i + 1] = data[i + 1 + Math.abs(shift) * 4] || data[i + 1];
                    shiftedData[i + 2] = data[i + 2 + Math.abs(shift) * 4] || data[i + 2];
                }
            }
            
            const shiftedImageData = new ImageData(shiftedData, this.canvas.width, this.canvas.height);
            this.ctx.putImageData(shiftedImageData, 0, 0);
        },
        
        renderVrNebulaEffect() {
            // Add nebula background effect
            const gradient = this.ctx.createRadialGradient(
                this.canvas.width / 2, this.canvas.height / 2, 0,
                this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height)
            );
            gradient.addColorStop(0, 'rgba(138, 43, 226, 0.3)');
            gradient.addColorStop(0.5, 'rgba(30, 144, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 139, 0.1)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },
        
        renderHauntedForestEffect() {
            // Add haunted forest overlay
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, 'rgba(0, 100, 0, 0.4)');
            gradient.addColorStop(0.5, 'rgba(0, 50, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Add fog effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                const radius = Math.random() * 100 + 50;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        },
        
        renderGhostPoseEffect() {
            const faceData = window.WebZoneBW_FaceDetection?.getFaceBoundingBox();
            if (!faceData) return;
            
            // Create ghostly overlay around face
            const { x, y, width, height } = faceData;
            const gradient = this.ctx.createRadialGradient(
                x + width / 2, y + height / 2, 0,
                x + width / 2, y + height / 2, width
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, width, height);
        },
        
        renderPoseFrameEffect() {
            const faceData = window.WebZoneBW_FaceDetection?.getFaceBoundingBox();
            if (!faceData) return;
            
            const { x, y, width, height } = faceData;
            
            // Draw pose alignment frame
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x - 20, y - 20, width + 40, height + 40);
            
            // Add corner markers
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillRect(x - 25, y - 25, 10, 10);
            this.ctx.fillRect(x + width + 15, y - 25, 10, 10);
            this.ctx.fillRect(x - 25, y + height + 15, 10, 10);
            this.ctx.fillRect(x + width + 15, y + height + 15, 10, 10);
        },
        
        renderPumpkinPoseEffect() {
            const faceData = window.WebZoneBW_FaceDetection?.getFaceBoundingBox();
            if (!faceData) return;
            
            const { x, y, width, height } = faceData;
            
            // Draw pumpkin overlay
            this.ctx.fillStyle = 'rgba(255, 165, 0, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(x + width / 2, y + height * 0.8, width * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add pumpkin features
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            // Eyes
            this.ctx.fillRect(x + width * 0.3, y + height * 0.7, width * 0.1, width * 0.1);
            this.ctx.fillRect(x + width * 0.6, y + height * 0.7, width * 0.1, width * 0.1);
            // Mouth
            this.ctx.fillRect(x + width * 0.25, y + height * 0.85, width * 0.5, width * 0.1);
        },
        
        // Overlay render methods
        renderFaceHud() {
            const faceData = window.WebZoneBW_FaceDetection?.getFaceBoundingBox();
            if (!faceData) return;
            
            const { x, y, width, height } = faceData;
            
            // Draw face bounding box
            this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, width, height);
            
            // Draw face center point
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
            this.ctx.fill();
        },
        
        renderCameraInfo() {
            // Draw camera info overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(10, 10, 200, 80);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Resolution: ${this.canvas.width}x${this.canvas.height}`, 20, 30);
            this.ctx.fillText(`FPS: ${this.config.targetFPS}`, 20, 50);
            this.ctx.fillText(`Mode: ${this.currentRenderMode}`, 20, 70);
        },
        
        renderFilterOverlay() {
            // Render active face filters
            if (window.WebZoneBW_FaceFilter && window.WebZoneBW_FaceFilter.isActiveFiltering()) {
                // Face filter rendering is handled by FaceFilterSystem
            }
        },
        
        // Effect management methods
        enableEffect(effectId) {
            const effect = this.effects[effectId];
            if (effect) {
                effect.enabled = true;
                console.log('[Rendering] Enabled effect:', effect.name);
            }
        },
        
        disableEffect(effectId) {
            const effect = this.effects[effectId];
            if (effect) {
                effect.enabled = false;
                console.log('[Rendering] Disabled effect:', effect.name);
            }
        },
        
        isEffectEnabled(effectId) {
            return this.effects[effectId]?.enabled || false;
        },
        
        // Overlay management methods
        enableOverlay(overlayId) {
            const overlay = this.overlays.find(o => o.id === overlayId);
            if (overlay) {
                overlay.enabled = true;
                console.log('[Rendering] Enabled overlay:', overlay.id);
            }
        },
        
        disableOverlay(overlayId) {
            const overlay = this.overlays.find(o => o.id === overlayId);
            if (overlay) {
                overlay.enabled = false;
                console.log('[Rendering] Disabled overlay:', overlay.id);
            }
        },
        
        isOverlayEnabled(overlayId) {
            const overlay = this.overlays.find(o => o.id === overlayId);
            return overlay?.enabled || false;
        },
        
        // Get rendering state
        isRenderingActive() {
            return this.isActive;
        },
        
        getCurrentRenderMode() {
            return this.currentRenderMode;
        },
        
        // Set render mode
        setRenderMode(mode) {
            this.currentRenderMode = mode;
            console.log('[Rendering] Render mode set to:', mode);
        }
    };
    
    // Global access
    window.WebZoneBW_Rendering = RenderingEngine;
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            RenderingEngine.initialize();
        });
    } else {
        RenderingEngine.initialize();
    }
    
})();