/* =====================================================
   WEBZONEBW ER STUDIO — CAMERA CONTROLLER
   ===================================================== */

(function() {
    "use strict";

    // Camera Controller Module
    const CameraController = {
        // Core state
        isInitialized: false,
        isActive: false,
        stream: null,
        video: null,
        canvas: null,
        facingMode: 'user', // 'user' for front camera, 'environment' for back camera
        flashMode: 'off', // 'off', 'on', 'torch'
        recording: false,
        recordingStartTime: null,
        
        // Configuration
        config: {
            resolution: { width: 1280, height: 720 },
            frameRate: 30,
            enableAudio: false,
            enableFaceTracking: true,
            enableAutoHD: true,
            enableDenoise: true,
            enableStudioLight: true
        },
        
        // Initialize camera controller
        async initialize() {
            if (this.isInitialized) return;
            
            try {
                // Get video and canvas elements
                this.video = document.getElementById('cameraVideo');
                this.canvas = document.getElementById('cameraCanvas');
                
                if (!this.video || !this.canvas) {
                    console.error('[Camera] Video or canvas element not found');
                    return;
                }
                
                // Set canvas size to match video
                this.canvas.width = this.config.resolution.width;
                this.canvas.height = this.config.resolution.height;
                
                // Initialize event listeners
                this.initializeEventListeners();
                
                this.isInitialized = true;
                console.log('[Camera] Camera controller initialized');
                
            } catch (error) {
                console.error('[Camera] Initialization failed:', error);
            }
        },
        
        // Initialize event listeners
        initializeEventListeners() {
            // Camera control buttons
            const flipBtn = document.getElementById('flipCameraBtnFloating');
            const flashBtn = document.getElementById('flashLightBtn');
            const autoHdBtn = document.getElementById('autoHdBtnFloating');
            const faceMeshBtn = document.getElementById('toggleFaceMeshBtn');
            
            if (flipBtn) {
                flipBtn.addEventListener('click', () => this.flipCamera());
            }
            
            if (flashBtn) {
                flashBtn.addEventListener('click', () => this.toggleFlash());
            }
            
            if (autoHdBtn) {
                autoHdBtn.addEventListener('click', () => this.toggleAutoHD());
            }
            
            if (faceMeshBtn) {
                faceMeshBtn.addEventListener('click', () => this.toggleFaceTracking());
            }
            
            // Permission modal
            const permAllowBtn = document.getElementById('permAllowBtn');
            if (permAllowBtn) {
                permAllowBtn.addEventListener('click', () => this.requestCameraAccess());
            }
            
            // Video events
            this.video.addEventListener('loadedmetadata', () => {
                this.onVideoLoaded();
            });
            
            this.video.addEventListener('play', () => {
                this.onVideoPlay();
            });
            
            this.video.addEventListener('pause', () => {
                this.onVideoPause();
            });
            
            this.video.addEventListener('error', () => {
                this.onVideoError();
            });
        },
        
        // Request camera access
        async requestCameraAccess() {
            try {
                const permissionModal = document.getElementById('permissionAlertModal');
                if (permissionModal) {
                    permissionModal.style.display = 'none';
                }
                
                await this.startCamera();
                
            } catch (error) {
                console.error('[Camera] Failed to request camera access:', error);
                this.showCameraError('Camera access denied');
            }
        },
        
        // Start camera
        async startCamera() {
            if (this.isActive) return;
            
            try {
                // Stop any existing stream
                if (this.stream) {
                    this.stopCamera();
                }
                
                // Get camera constraints
                const constraints = this.getCameraConstraints();
                
                // Request camera access
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                // Set video source
                this.video.srcObject = this.stream;
                
                // Wait for video to load
                await new Promise((resolve) => {
                    this.video.onloadedmetadata = resolve;
                });
                
                this.isActive = true;
                console.log('[Camera] Camera started successfully');
                
                // Dispatch event
                const event = new CustomEvent('cameraStarted', {
                    detail: { stream: this.stream }
                });
                document.dispatchEvent(event);
                
                // Update UI
                this.updateCameraUI();
                
            } catch (error) {
                console.error('[Camera] Failed to start camera:', error);
                this.showCameraError('Failed to start camera');
                throw error;
            }
        },
        
        // Stop camera
        stopCamera() {
            if (!this.isActive) return;
            
            // Stop stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                });
                this.stream = null;
            }
            
            // Clear video source
            this.video.srcObject = null;
            
            this.isActive = false;
            console.log('[Camera] Camera stopped');
            
            // Dispatch event
            const event = new CustomEvent('cameraStopped');
            document.dispatchEvent(event);
            
            // Update UI
            this.updateCameraUI();
        },
        
        // Get camera constraints
        getCameraConstraints() {
            const constraints = {
                video: {
                    width: { ideal: this.config.resolution.width },
                    height: { ideal: this.config.resolution.height },
                    frameRate: { ideal: this.config.frameRate },
                    facingMode: this.facingMode
                },
                audio: this.config.enableAudio
            };
            
            return constraints;
        },
        
        // Flip camera
        async flipCamera() {
            const newFacingMode = this.facingMode === 'user' ? 'environment' : 'user';
            
            if (newFacingMode !== this.facingMode) {
                this.facingMode = newFacingMode;
                
                // Restart camera with new facing mode
                if (this.isActive) {
                    await this.restartCamera();
                }
            }
        },
        
        // Restart camera
        async restartCamera() {
            const wasActive = this.isActive;
            
            if (wasActive) {
                this.stopCamera();
            }
            
            if (wasActive) {
                await this.startCamera();
            }
        },
        
        // Toggle flash
        toggleFlash() {
            const flashBtn = document.getElementById('flashLightBtn');
            
            if (this.flashMode === 'off') {
                this.flashMode = 'torch';
                flashBtn.classList.add('active');
            } else {
                this.flashMode = 'off';
                flashBtn.classList.remove('active');
            }
            
            // Apply flash to camera track
            if (this.stream) {
                const videoTrack = this.stream.getVideoTracks()[0];
                if (videoTrack && videoTrack.applyConstraints) {
                    videoTrack.applyConstraints({
                        advanced: [{ torch: this.flashMode === 'torch' }]
                    });
                }
            }
        },
        
        // Toggle Auto HD
        toggleAutoHD() {
            const autoHdBtn = document.getElementById('autoHdBtnFloating');
            this.config.enableAutoHD = !this.config.enableAutoHD;
            
            if (this.config.enableAutoHD) {
                autoHdBtn.classList.add('active');
            } else {
                autoHdBtn.classList.remove('active');
            }
        },
        
        // Toggle face tracking
        toggleFaceTracking() {
            const faceMeshBtn = document.getElementById('toggleFaceMeshBtn');
            this.config.enableFaceTracking = !this.config.enableFaceTracking;
            
            if (this.config.enableFaceTracking) {
                faceMeshBtn.classList.add('active');
                // Start face detection if available
                if (window.WebZoneBW_FaceDetection) {
                    window.WebZoneBW_FaceDetection.startDetection();
                }
            } else {
                faceMeshBtn.classList.remove('active');
                // Stop face detection
                if (window.WebZoneBW_FaceDetection) {
                    window.WebZoneBW_FaceDetection.stopDetection();
                }
            }
        },
        
        // Capture photo
        capturePhoto() {
            if (!this.isActive) {
                console.warn('[Camera] Cannot capture photo - camera not active');
                return null;
            }
            
            try {
                // Draw video frame to canvas
                const ctx = this.canvas.getContext('2d');
                ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                
                // Get image data
                const imageData = this.canvas.toDataURL('image/png');
                
                // Create download link
                const link = document.createElement('a');
                link.download = `webzonebw-er-${Date.now()}.png`;
                link.href = imageData;
                
                // Dispatch event
                const event = new CustomEvent('photoCaptured', {
                    detail: { imageData, timestamp: Date.now() }
                });
                document.dispatchEvent(event);
                
                return imageData;
                
            } catch (error) {
                console.error('[Camera] Failed to capture photo:', error);
                return null;
            }
        },
        
        // Start recording
        startRecording() {
            if (!this.isActive || this.recording) {
                console.warn('[Camera] Cannot start recording - camera not active or already recording');
                return;
            }
            
            try {
                // Create MediaRecorder
                const options = { mimeType: 'video/webm;codecs=vp9' };
                this.mediaRecorder = new MediaRecorder(this.stream, options);
                
                // Create chunks array
                this.chunks = [];
                
                // Handle data available
                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.chunks.push(event.data);
                    }
                };
                
                // Handle stop
                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    
                    // Dispatch event
                    const event = new CustomEvent('recordingStopped', {
                        detail: { blob, url, duration: Date.now() - this.recordingStartTime }
                    });
                    document.dispatchEvent(event);
                    
                    // Reset chunks
                    this.chunks = [];
                };
                
                // Start recording
                this.mediaRecorder.start();
                this.recording = true;
                this.recordingStartTime = Date.now();
                
                console.log('[Camera] Recording started');
                
                // Update UI
                this.updateRecordingUI();
                
            } catch (error) {
                console.error('[Camera] Failed to start recording:', error);
            }
        },
        
        // Stop recording
        stopRecording() {
            if (!this.recording || !this.mediaRecorder) {
                console.warn('[Camera] Cannot stop recording - not recording');
                return;
            }
            
            try {
                this.mediaRecorder.stop();
                this.recording = false;
                
                console.log('[Camera] Recording stopped');
                
                // Update UI
                this.updateRecordingUI();
                
            } catch (error) {
                console.error('[Camera] Failed to stop recording:', error);
            }
        },
        
        // Update camera UI
        updateCameraUI() {
            const capturePhotoText = document.getElementById('capturePhotoText');
            const recordVideoText = document.getElementById('recordVideoText');
            const recordVideoIcon = document.getElementById('recordVideoIcon');
            
            if (this.isActive) {
                capturePhotoText.textContent = 'Capture Photo';
                if (this.recording) {
                    recordVideoText.textContent = 'Stop Recording';
                    recordVideoIcon.textContent = '⏹';
                } else {
                    recordVideoText.textContent = 'Record Video';
                    recordVideoIcon.textContent = '⏺';
                }
            } else {
                capturePhotoText.textContent = 'Start Camera';
                recordVideoText.textContent = 'Record Video';
                recordVideoIcon.textContent = '⏺';
            }
        },
        
        // Update recording UI
        updateRecordingUI() {
            const recordVideoBtn = document.getElementById('recordVideoBtn');
            
            if (this.recording) {
                recordVideoBtn.classList.add('recording');
                recordVideoBtn.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
            } else {
                recordVideoBtn.classList.remove('recording');
                recordVideoBtn.style.background = '';
            }
        },
        
        // Show camera error
        showCameraError(message) {
            const cameraStatusOverlay = document.getElementById('cameraStatusOverlay');
            const cameraStatusText = document.querySelector('.camera-status-text');
            
            if (cameraStatusOverlay && cameraStatusText) {
                cameraStatusOverlay.style.display = 'block';
                cameraStatusText.textContent = message;
            }
            
            // Dispatch error event
            const event = new CustomEvent('cameraError', {
                detail: { message }
            });
            document.dispatchEvent(event);
        },
        
        // Event handlers
        onVideoLoaded() {
            console.log('[Camera] Video metadata loaded');
        },
        
        onVideoPlay() {
            console.log('[Camera] Video playing');
            this.updateCameraUI();
        },
        
        onVideoPause() {
            console.log('[Camera] Video paused');
            this.updateCameraUI();
        },
        
        onVideoError() {
            console.error('[Camera] Video error');
            this.showCameraError('Camera error occurred');
        },
        
        // Get camera state
        isCameraActive() {
            return this.isActive;
        },
        
        isRecording() {
            return this.recording;
        },
        
        getFacingMode() {
            return this.facingMode;
        },
        
        getFlashMode() {
            return this.flashMode;
        },
        
        // Get video stream
        getStream() {
            return this.stream;
        },
        
        // Get video element
        getVideo() {
            return this.video;
        },
        
        // Get canvas element
        getCanvas() {
            return this.canvas;
        }
    };
    
    // Global access
    window.WebZoneBW_Camera = CameraController;
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            CameraController.initialize();
        });
    } else {
        CameraController.initialize();
    }
    
})();