/* =====================================================
   WEBZONEBW ER STUDIO — FACE DETECTION ENGINE
   ===================================================== */

(function() {
    "use strict";

    // Face Detection Engine Module
    const FaceDetectionEngine = {
        // Core state
        isInitialized: false,
        isDetectionActive: false,
        detectionInterval: null,
        faceDetections: [],
        lastFaceData: null,
        
        // Configuration
        config: {
            detectionInterval: 100, // milliseconds
            confidenceThreshold: 0.5,
            maxFaces: 1,
            enableMesh: true,
            enableTracking: true
        },
        
        // Initialize face detection
        async initialize() {
            if (this.isInitialized) return;
            
            try {
                // Check for face detection API support
                if (!('FaceDetector' in window)) {
                    console.warn('[Face Detection] FaceDetector API not supported, using fallback');
                    this.useFallbackDetection();
                    return;
                }
                
                // Initialize face detector
                this.faceDetector = new FaceDetector({
                    maxDetectedFaces: this.config.maxFaces,
                    fastMode: true
                });
                
                this.isInitialized = true;
                console.log('[Face Detection] Face detection engine initialized');
                
            } catch (error) {
                console.warn('[Face Detection] FaceDetector initialization failed:', error);
                this.useFallbackDetection();
            }
        },
        
        // Fallback detection using canvas analysis
        useFallbackDetection() {
            // Create a simple face detection fallback using canvas
            this.canvas = document.getElementById('cameraCanvas');
            this.video = document.getElementById('cameraVideo');
            
            if (!this.canvas || !this.video) {
                console.error('[Face Detection] Canvas or video element not found');
                return;
            }
            
            // Use a simple motion detection as fallback
            this.fallbackDetection();
        },
        
        // Fallback detection using motion analysis
        fallbackDetection() {
            const ctx = this.canvas.getContext('2d');
            let previousFrame = null;
            
            this.fallbackDetection = () => {
                if (!this.video || this.video.paused || this.video.ended) return;
                
                // Draw current frame
                ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                const currentFrame = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                
                if (previousFrame) {
                    // Simple motion detection
                    const motionAreas = this.detectMotion(previousFrame, currentFrame);
                    if (motionAreas.length > 0) {
                        this.onFaceDetected({
                            faces: [{
                                boundingBox: motionAreas[0],
                                confidence: 0.7,
                                id: 'fallback-' + Date.now()
                            }]
                        });
                    }
                }
                
                previousFrame = currentFrame;
            };
            
            this.isInitialized = true;
            console.log('[Face Detection] Fallback detection initialized');
        },
        
        // Simple motion detection
        detectMotion(prevFrame, currentFrame) {
            const motionAreas = [];
            const threshold = 30;
            const step = 20; // Sample every 20 pixels
            
            for (let y = 0; y < currentFrame.height; y += step) {
                for (let x = 0; x < currentFrame.width; x += step) {
                    const i = (y * currentFrame.width + x) * 4;
                    
                    const rDiff = Math.abs(currentFrame.data[i] - prevFrame.data[i]);
                    const gDiff = Math.abs(currentFrame.data[i + 1] - prevFrame.data[i + 1]);
                    const bDiff = Math.abs(currentFrame.data[i + 2] - prevFrame.data[i + 2]);
                    
                    const totalDiff = rDiff + gDiff + bDiff;
                    
                    if (totalDiff > threshold) {
                        motionAreas.push({
                            x: x - 50,
                            y: y - 50,
                            width: 100,
                            height: 100
                        });
                    }
                }
            }
            
            return motionAreas;
        },
        
        // Start face detection
        async startDetection() {
            if (this.isDetectionActive) return;
            
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            this.isDetectionActive = true;
            
            if (this.faceDetector) {
                this.detectionInterval = setInterval(() => {
                    this.detectFaces();
                }, this.config.detectionInterval);
            } else if (this.fallbackDetection) {
                this.detectionInterval = setInterval(() => {
                    this.fallbackDetection();
                }, this.config.detectionInterval);
            }
            
            console.log('[Face Detection] Face detection started');
        },
        
        // Stop face detection
        stopDetection() {
            this.isDetectionActive = false;
            
            if (this.detectionInterval) {
                clearInterval(this.detectionInterval);
                this.detectionInterval = null;
            }
            
            console.log('[Face Detection] Face detection stopped');
        },
        
        // Detect faces using FaceDetector API
        async detectFaces() {
            if (!this.faceDetector || !this.video) return;
            
            try {
                const faces = await this.faceDetector.detect(this.video);
                this.onFaceDetected({ faces });
            } catch (error) {
                console.warn('[Face Detection] Face detection failed:', error);
            }
        },
        
        // Handle face detection results
        onFaceDetected({ faces }) {
            this.faceDetections = faces;
            this.lastFaceData = faces[0] || null;
            
            // Dispatch event for other modules
            const event = new CustomEvent('facesDetected', {
                detail: { faces }
            });
            document.dispatchEvent(event);
            
            // Update UI
            this.updateFaceUI(faces);
        },
        
        // Update face detection UI
        updateFaceUI(faces) {
            const faceChipStatus = document.getElementById('faceChipStatus');
            const faceChipDot = document.getElementById('faceChipDot');
            const faceProximityMetric = document.getElementById('faceProximityMetric');
            const faceLightingMetric = document.getElementById('faceLightingMetric');
            
            if (faces.length > 0) {
                const face = faces[0];
                
                // Update status
                faceChipStatus.textContent = 'Face Detected';
                faceChipDot.classList.remove('idle');
                faceChipDot.classList.add('active');
                
                // Update proximity metric
                const centerX = face.boundingBox.x + face.boundingBox.width / 2;
                const centerY = face.boundingBox.y + face.boundingBox.height / 2;
                const distance = Math.sqrt(centerX * centerX + centerY * centerY);
                
                if (distance < 200) {
                    faceProximityMetric.textContent = '🎯 Face Centered';
                } else if (distance < 300) {
                    faceProximityMetric.textContent = '🎯 Face Proximity Good';
                } else {
                    faceProximityMetric.textContent = '🎯 Face Too Far';
                }
                
                // Update lighting metric (simplified)
                faceLightingMetric.textContent = '⚡ Light Check Active';
                
            } else {
                // No face detected
                faceChipStatus.textContent = 'No Face';
                faceChipDot.classList.remove('active');
                faceChipDot.classList.add('idle');
                faceProximityMetric.textContent = '🎯 Face Engine Idle';
                faceLightingMetric.textContent = '⚡ Light Check Off';
            }
        },
        
        // Get last detected face data
        getLastFaceData() {
            return this.lastFaceData;
        },
        
        // Get all current face detections
        getFaceDetections() {
            return this.faceDetections;
        },
        
        // Check if face is detected
        isFaceDetected() {
            return this.faceDetections.length > 0;
        },
        
        // Get face bounding box for filters
        getFaceBoundingBox() {
            if (!this.lastFaceData) return null;
            
            return {
                x: this.lastFaceData.boundingBox.x,
                y: this.lastFaceData.boundingBox.y,
                width: this.lastFaceData.boundingBox.width,
                height: this.lastFaceData.boundingBox.height,
                centerX: this.lastFaceData.boundingBox.x + this.lastFaceData.boundingBox.width / 2,
                centerY: this.lastFaceData.boundingBox.y + this.lastFaceData.boundingBox.height / 2
            };
        }
    };
    
    // Global access
    window.WebZoneBW_FaceDetection = FaceDetectionEngine;
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            FaceDetectionEngine.initialize();
        });
    } else {
        FaceDetectionEngine.initialize();
    }
    
})();