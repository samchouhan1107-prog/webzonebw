/* =====================================================
   WEBZONEBW ER STUDIO — FACE FILTER SYSTEM
   ===================================================== */

(function() {
    "use strict";

    // Face Filter System Module
    const FaceFilterSystem = {
        // Core state
        isInitialized: false,
        isActive: false,
        currentFilter: null,
        filters: {},
        filterCanvas: null,
        filterCtx: null,
        
        // Configuration
        config: {
            renderInterval: 16, // ~60fps
            enableSmoothing: true,
            maxFilterIntensity: 1.0
        },
        
        // Initialize face filter system
        async initialize() {
            if (this.isInitialized) return;
            
            try {
                // Get canvas context
                this.filterCanvas = document.getElementById('cameraCanvas');
                if (!this.filterCanvas) {
                    console.error('[Face Filter] Camera canvas not found');
                    return;
                }
                
                this.filterCtx = this.filterCanvas.getContext('2d', {
                    willReadFrequently: true,
                    alpha: true
                });
                
                // Initialize filters
                this.initializeFilters();
                
                this.isInitialized = true;
                console.log('[Face Filter] Face filter system initialized');
                
            } catch (error) {
                console.error('[Face Filter] Initialization failed:', error);
            }
        },
        
        // Initialize available filters
        initializeFilters() {
            this.filters = {
                // Face AR Filters
                sunglasses: {
                    name: 'Aviators',
                    type: 'face',
                    render: this.renderSunglasses.bind(this),
                    icon: '🕶️',
                    category: 'face'
                },
                
                halo: {
                    name: 'Angel Halo',
                    type: 'face',
                    render: this.renderHalo.bind(this),
                    icon: '👑',
                    category: 'face'
                },
                
                goldenhour: {
                    name: 'Golden Hour',
                    type: 'face',
                    render: this.renderGoldenHour.bind(this),
                    icon: '🌟',
                    category: 'face'
                },
                
                cartoon: {
                    name: 'Anime Cel',
                    type: 'face',
                    render: this.renderCartoon.bind(this),
                    icon: '🎨',
                    category: 'face'
                },
                
                // Horror Filters
                neonHorror: {
                    name: 'Neon Horror',
                    type: 'face',
                    render: this.renderNeonHorror.bind(this),
                    icon: '💀',
                    category: 'horror',
                    premium: true
                },
                
                zombieVirus: {
                    name: 'Zombie Virus',
                    type: 'face',
                    render: this.renderZombieVirus.bind(this),
                    icon: '🧟',
                    category: 'zombie'
                },
                
                witchCurse: {
                    name: 'Witch Curse',
                    type: 'face',
                    render: this.renderWitchCurse.bind(this),
                    icon: '🔮',
                    category: 'witch'
                },
                
                ghostAura: {
                    name: 'Ghost Aura',
                    type: 'face',
                    render: this.renderGhostAura.bind(this),
                    icon: '👻',
                    category: 'ghost'
                },
                
                monsterFangs: {
                    name: 'Monster Fangs',
                    type: 'face',
                    render: this.renderMonsterFangs.bind(this),
                    icon: '👹',
                    category: 'monster'
                }
            };
        },
        
        // Start face filtering
        startFiltering(filterName) {
            if (!this.isInitialized) {
                this.initialize();
            }
            
            if (!this.filters[filterName]) {
                console.error('[Face Filter] Filter not found:', filterName);
                return;
            }
            
            this.currentFilter = filterName;
            this.isActive = true;
            
            // Start render loop
            this.renderLoop();
            
            console.log('[Face Filter] Started filter:', filterName);
        },
        
        // Stop face filtering
        stopFiltering() {
            this.isActive = false;
            this.currentFilter = null;
            
            // Clear canvas
            if (this.filterCtx) {
                this.filterCtx.clearRect(0, 0, this.filterCanvas.width, this.filterCanvas.height);
            }
            
            console.log('[Face Filter] Stopped filtering');
        },
        
        // Main render loop
        renderLoop() {
            if (!this.isActive) return;
            
            requestAnimationFrame(() => {
                this.renderFrame();
                this.renderLoop();
            });
        },
        
        // Render current frame
        renderFrame() {
            if (!this.currentFilter || !this.filterCtx) return;
            
            const filter = this.filters[this.currentFilter];
            if (!filter) return;
            
            // Clear canvas
            this.filterCtx.clearRect(0, 0, this.filterCanvas.width, this.filterCanvas.height);
            
            // Get face detection data
            const faceData = window.WebZoneBW_FaceDetection?.getFaceBoundingBox();
            if (!faceData) return;
            
            // Render filter
            filter.render(faceData);
        },
        
        // Filter render methods
        renderSunglasses(faceData) {
            const ctx = this.filterCtx;
            const { x, y, width, height } = faceData;
            
            // Calculate sunglass position
            const sunglassWidth = width * 0.6;
            const sunglassHeight = height * 0.15;
            const sunglassX = x + (width - sunglassWidth) / 2;
            const sunglassY = y + height * 0.4;
            
            // Draw sunglass frames
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(sunglassX, sunglassY, sunglassWidth, sunglassHeight);
            
            // Draw lens reflections
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(sunglassX + 5, sunglassY + 3, sunglassWidth / 2 - 10, sunglassHeight - 6);
            ctx.fillRect(sunglassX + sunglassWidth / 2 + 5, sunglassY + 3, sunglassWidth / 2 - 10, sunglassHeight - 6);
        },
        
        renderHalo(faceData) {
            const ctx = this.filterCtx;
            const { centerX, centerY, width } = faceData;
            
            // Draw halo
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(centerX, centerY - width * 0.3, width * 0.4, 0, Math.PI * 2);
            ctx.stroke();
            
            // Add glow effect
            ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
        },
        
        renderGoldenHour(faceData) {
            const ctx = this.filterCtx;
            const { x, y, width, height } = faceData;
            
            // Create golden hour overlay
            const gradient = ctx.createRadialGradient(
                x + width / 2, y + height / 2, 0,
                x + width / 2, y + height / 2, width
            );
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
            gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 140, 0, 0.1)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);
        },
        
        renderCartoon(faceData) {
            const ctx = this.filterCtx;
            const { x, y, width, height } = faceData;
            
            // Create cartoon effect outline
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
            
            // Add anime-style blush
            ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
            ctx.beginPath();
            ctx.arc(x + width * 0.3, y + height * 0.6, width * 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + width * 0.7, y + height * 0.6, width * 0.1, 0, Math.PI * 2);
            ctx.fill();
        },
        
        renderNeonHorror(faceData) {
            const ctx = this.filterCtx;
            const { x, y, width, height } = faceData;
            
            // Create neon horror effect
            const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
            gradient.addColorStop(0, 'rgba(255, 0, 255, 0.4)');
            gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 0, 255, 0.4)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);
            
            // Add electric effect
            ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(x + Math.random() * width, y + Math.random() * height);
                ctx.lineTo(x + Math.random() * width, y + Math.random() * height);
                ctx.stroke();
            }
        },
        
        renderZombieVirus(faceData) {
            const ctx = this.filterCtx;
            const { x, y, width, height } = faceData;
            
            // Create zombie virus effect
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fillRect(x, y, width, height);
            
            // Add virus spots
            ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
            for (let i = 0; i < 10; i++) {
                const spotX = x + Math.random() * width;
                const spotY = y + Math.random() * height;
                const spotSize = Math.random() * 10 + 5;
                ctx.beginPath();
                ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        },
        
        renderWitchCurse(faceData) {
            const ctx = this.filterCtx;
            const { x, y, width, height } = faceData;
            
            // Create witch curse effect
            const gradient = ctx.createRadialGradient(
                x + width / 2, y + height / 2, 0,
                x + width / 2, y + height / 2, width
            );
            gradient.addColorStop(0, 'rgba(128, 0, 128, 0.4)');
            gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);
        },
        
        renderGhostAura(faceData) {
            const ctx = this.filterCtx;
            const { x, y, width, height } = faceData;
            
            // Create ghost aura effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x, y, width, height);
            
            // Add ethereal glow
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 15;
            ctx.fillRect(x, y, width, height);
            ctx.shadowBlur = 0;
        },
        
        renderMonsterFangs(faceData) {
            const ctx = this.filterCtx;
            const { x, y, width, height } = faceData;
            
            // Create monster fangs
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            const fangWidth = width * 0.1;
            const fangHeight = height * 0.15;
            const fangX = x + width * 0.4;
            const fangY = y + height * 0.7;
            
            // Draw fangs
            ctx.fillRect(fangX, fangY, fangWidth, fangHeight);
            ctx.fillRect(fangX + fangWidth * 2, fangY, fangWidth, fangHeight);
            ctx.fillRect(fangX + fangWidth * 4, fangY, fangWidth, fangHeight);
        },
        
        // Get available filters
        getAvailableFilters() {
            return Object.keys(this.filters).map(key => ({
                id: key,
                ...this.filters[key]
            }));
        },
        
        // Get filter by name
        getFilter(filterName) {
            return this.filters[filterName];
        },
        
        // Check if filter is premium
        isFilterPremium(filterName) {
            return this.filters[filterName]?.premium || false;
        },
        
        // Get current filter
        getCurrentFilter() {
            return this.currentFilter;
        },
        
        // Check if filtering is active
        isActiveFiltering() {
            return this.isActive;
        }
    };
    
    // Global access
    window.WebZoneBW_FaceFilter = FaceFilterSystem;
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            FaceFilterSystem.initialize();
        });
    } else {
        FaceFilterSystem.initialize();
    }
    
})();