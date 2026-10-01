/* =====================================================
   WEBZONEBW ER STUDIO — LENS CATALOG
   ===================================================== */

(function() {
    "use strict";

    // Lens Catalog Module
    const LensCatalog = {
        // Core state
        isInitialized: false,
        lenses: {},
        currentLens: null,
        lensCategories: {},
        
        // Configuration
        config: {
            enablePreviews: true,
            maxPreviews: 10,
            enableSearch: true,
            enableSmartRecommendations: true
        },
        
        // Initialize lens catalog
        async initialize() {
            if (this.isInitialized) return;
            
            try {
                // Initialize lenses
                this.initializeLenses();
                
                // Initialize categories
                this.initializeCategories();
                
                this.isInitialized = true;
                console.log('[Lens Catalog] Lens catalog initialized');
                
            } catch (error) {
                console.error('[Lens Catalog] Initialization failed:', error);
            }
        },
        
        // Initialize lens collection
        initializeLenses() {
            this.lenses = {
                // Smart Category
                smartLens: {
                    id: 'smartLens',
                    name: 'Smart Adaptive',
                    category: 'smart',
                    type: 'smart',
                    description: 'Auto-adapts based on real-time face detection',
                    icon: '🌟',
                    premium: false,
                    autoActivate: true
                },
                
                // Face AR Lenses
                sunglasses: {
                    id: 'sunglasses',
                    name: 'Aviators',
                    category: 'face',
                    type: 'face',
                    description: 'Classic aviator sunglasses',
                    icon: '🕶️',
                    premium: false,
                    renderMethod: 'faceFilter'
                },
                
                halo: {
                    id: 'halo',
                    name: 'Angel Halo',
                    category: 'face',
                    type: 'face',
                    description: 'Divine angelic halo effect',
                    icon: '👑',
                    premium: false,
                    renderMethod: 'faceFilter'
                },
                
                goldenhour: {
                    id: 'goldenhour',
                    name: 'Golden Hour',
                    category: 'face',
                    type: 'face',
                    description: 'Warm golden hour lighting',
                    icon: '🌟',
                    premium: false,
                    renderMethod: 'faceFilter'
                },
                
                cartoon: {
                    id: 'cartoon',
                    name: 'Anime Cel',
                    category: 'face',
                    type: 'face',
                    description: 'Anime-style cel shading',
                    icon: '🎨',
                    premium: false,
                    renderMethod: 'faceFilter'
                },
                
                // Scene Lenses
                noir: {
                    id: 'noir',
                    name: 'Leica Noir',
                    category: 'scene',
                    type: 'scene',
                    description: 'Classic film noir style',
                    icon: '🖤',
                    premium: false,
                    renderMethod: 'sceneFilter'
                },
                
                vintage90s: {
                    id: 'vintage90s',
                    name: 'Retro 90s',
                    category: 'scene',
                    type: 'scene',
                    description: 'Vintage 90s aesthetic',
                    icon: '🎞️',
                    premium: false,
                    renderMethod: 'sceneFilter'
                },
                
                cinematic: {
                    id: 'cinematic',
                    name: '35mm Film',
                    category: 'scene',
                    type: 'scene',
                    description: 'Professional cinematic look',
                    icon: '🎬',
                    premium: false,
                    renderMethod: 'sceneFilter'
                },
                
                glitch: {
                    id: 'glitch',
                    name: 'Glitch FX',
                    category: 'scene',
                    type: 'scene',
                    description: 'Digital glitch effect',
                    icon: '⚡',
                    premium: false,
                    renderMethod: 'sceneFilter'
                },
                
                // Pose Lenses
                ghostPose: {
                    id: 'ghostPose',
                    name: 'Ghost Pose',
                    category: 'pose',
                    type: 'pose',
                    description: 'Ethereal ghost pose effect',
                    icon: '👻',
                    premium: false,
                    renderMethod: 'poseFilter'
                },
                
                poseFrame: {
                    id: 'poseFrame',
                    name: 'Pose Align',
                    category: 'pose',
                    type: 'pose',
                    description: 'Pose alignment frame',
                    icon: '🧭',
                    premium: false,
                    renderMethod: 'poseFilter'
                },
                
                pumpkinPose: {
                    id: 'pumpkinPose',
                    name: 'Pumpkin Pose',
                    category: 'pose',
                    type: 'pose',
                    description: 'Halloween pumpkin pose effect',
                    icon: '🎃',
                    premium: false,
                    renderMethod: 'poseFilter'
                },
                
                // VR Lenses
                vrNebula: {
                    id: 'vrNebula',
                    name: 'VR Nebula',
                    category: 'vr',
                    type: 'vr',
                    description: 'Immersive nebula environment',
                    icon: '🪐',
                    premium: false,
                    renderMethod: 'vrFilter'
                },
                
                hauntedForest: {
                    id: 'hauntedForest',
                    name: 'Haunted Forest',
                    category: 'vr',
                    type: 'vr',
                    description: 'Spooky haunted forest',
                    icon: '🌲',
                    premium: true,
                    renderMethod: 'vrFilter'
                },
                
                // Horror Premium Lenses
                neonHorror: {
                    id: 'neonHorror',
                    name: 'Neon Horror',
                    category: 'horror',
                    type: 'face',
                    description: 'Neon horror aesthetic',
                    icon: '💀',
                    premium: true,
                    renderMethod: 'faceFilter'
                },
                
                zombieVirus: {
                    id: 'zombieVirus',
                    name: 'Zombie Virus',
                    category: 'zombie',
                    type: 'face',
                    description: 'Zombie virus infection',
                    icon: '🧟',
                    premium: false,
                    renderMethod: 'faceFilter'
                },
                
                witchCurse: {
                    id: 'witchCurse',
                    name: 'Witch Curse',
                    category: 'witch',
                    type: 'face',
                    description: 'Mystical witch curse',
                    icon: '🔮',
                    premium: false,
                    renderMethod: 'faceFilter'
                },
                
                ghostAura: {
                    id: 'ghostAura',
                    name: 'Ghost Aura',
                    category: 'ghost',
                    type: 'face',
                    description: 'Spectral ghost aura',
                    icon: '👻',
                    premium: false,
                    renderMethod: 'faceFilter'
                },
                
                monsterFangs: {
                    id: 'monsterFangs',
                    name: 'Monster Fangs',
                    category: 'monster',
                    type: 'face',
                    description: 'Monster fangs effect',
                    icon: '👹',
                    premium: false,
                    renderMethod: 'faceFilter'
                },
                
                horrorMovie: {
                    id: 'horrorMovie',
                    name: 'Horror Movie',
                    category: 'cinema',
                    type: 'scene',
                    description: 'Classic horror movie style',
                    icon: '🎬',
                    premium: false,
                    renderMethod: 'sceneFilter'
                },
                
                quantumHorror: {
                    id: 'quantumHorror',
                    name: 'Quantum Horror',
                    category: 'experimental',
                    type: 'scene',
                    description: 'Advanced quantum horror effect',
                    icon: '⚡',
                    premium: true,
                    renderMethod: 'sceneFilter'
                }
            };
        },
        
        // Initialize categories
        initializeCategories() {
            this.lensCategories = {
                smart: {
                    name: 'Smart',
                    icon: '🌟',
                    description: 'Auto-adapts based on real-time face detection',
                    count: 1,
                    premium: false
                },
                
                face: {
                    name: 'Face AR',
                    icon: '👤',
                    description: 'Face-anchored AR lenses',
                    count: 12,
                    premium: false
                },
                
                scene: {
                    name: 'Scene',
                    icon: '🌍',
                    description: 'Full-frame scene shaders',
                    count: 8,
                    premium: false
                },
                
                pose: {
                    name: 'Pose',
                    icon: '🦴',
                    description: 'Live camera pose-reactive effects',
                    count: 4,
                    premium: false
                },
                
                vr: {
                    name: 'VR',
                    icon: '🌌',
                    description: 'VR-style immersive environments',
                    count: 4,
                    premium: true
                },
                
                horror: {
                    name: 'Horror',
                    icon: '🎃',
                    description: 'Horror and thriller effects',
                    count: 6,
                    premium: true
                },
                
                zombie: {
                    name: 'Zombie',
                    icon: '🧟',
                    description: 'Zombie virus effects',
                    count: 3,
                    premium: false
                },
                
                witch: {
                    name: 'Witch',
                    icon: '🔮',
                    description: 'Witchcraft & curses',
                    count: 3,
                    premium: false
                },
                
                ghost: {
                    name: 'Ghost',
                    icon: '👻',
                    description: 'Spectral phantoms',
                    count: 3,
                    premium: false
                },
                
                monster: {
                    name: 'Monster',
                    icon: '👹',
                    description: 'Beasts & ghouls',
                    count: 3,
                    premium: false
                },
                
                cinema: {
                    name: 'Cinema',
                    icon: '🎬',
                    description: 'Cinema horror FX',
                    count: 3,
                    premium: false
                },
                
                experimental: {
                    name: 'Experimental',
                    icon: '⚡',
                    description: 'Advanced FX',
                    count: 1,
                    premium: true
                }
            };
            
            // Update counts
            this.updateCategoryCounts();
        },
        
        // Update category counts
        updateCategoryCounts() {
            Object.keys(this.lensCategories).forEach(category => {
                const count = Object.values(this.lenses).filter(lens => lens.category === category).length;
                this.lensCategories[category].count = count;
            });
        },
        
        // Get all lenses
        getAllLenses() {
            return Object.values(this.lenses);
        },
        
        // Get lens by ID
        getLens(lensId) {
            return this.lenses[lensId];
        },
        
        // Get lenses by category
        getLensesByCategory(category) {
            return Object.values(this.lenses).filter(lens => lens.category === category);
        },
        
        // Get categories
        getCategories() {
            return this.lensCategories;
        },
        
        // Search lenses
        searchLenses(query) {
            if (!query) return this.getAllLenses();
            
            const lowercaseQuery = query.toLowerCase();
            return this.getAllLenses().filter(lens => 
                lens.name.toLowerCase().includes(lowercaseQuery) ||
                lens.description.toLowerCase().includes(lowercaseQuery) ||
                lens.category.toLowerCase().includes(lowercaseQuery)
            );
        },
        
        // Get premium lenses
        getPremiumLenses() {
            return Object.values(this.lenses).filter(lens => lens.premium);
        },
        
        // Get free lenses
        getFreeLenses() {
            return Object.values(this.lenses).filter(lens => !lens.premium);
        },
        
        // Activate lens
        activateLens(lensId) {
            const lens = this.getLens(lensId);
            if (!lens) {
                console.error('[Lens Catalog] Lens not found:', lensId);
                return false;
            }
            
            // Check if lens is premium and user has license
            if (lens.premium && !window.WebZoneBW_ER_LICENSE?.isPremium()) {
                console.warn('[Lens Catalog] Premium lens requires license:', lensId);
                return false;
            }
            
            // Deactivate current lens
            if (this.currentLens) {
                this.deactivateLens(this.currentLens);
            }
            
            // Set current lens
            this.currentLens = lensId;
            
            // Activate lens based on type
            this.activateLensByType(lens);
            
            console.log('[Lens Catalog] Activated lens:', lens.name);
            return true;
        },
        
        // Deactivate lens
        deactivateLens(lensId) {
            const lens = this.getLens(lensId);
            if (!lens) return;
            
            // Deactivate based on type
            this.deactivateLensByType(lens);
            
            // Clear current lens if it's the one being deactivated
            if (this.currentLens === lensId) {
                this.currentLens = null;
            }
            
            console.log('[Lens Catalog] Deactivated lens:', lens.name);
        },
        
        // Activate lens by type
        activateLensByType(lens) {
            switch (lens.type) {
                case 'face':
                    if (window.WebZoneBW_FaceFilter) {
                        window.WebZoneBW_FaceFilter.startFiltering(lens.id);
                    }
                    break;
                    
                case 'scene':
                case 'vr':
                case 'pose':
                    // Scene/VR/Pose filters would be handled by rendering engine
                    console.log('[Lens Catalog] Scene/VR/Pose lens activated:', lens.name);
                    break;
                    
                case 'smart':
                    // Smart lens uses automatic face detection
                    console.log('[Lens Catalog] Smart lens activated:', lens.name);
                    break;
            }
        },
        
        // Deactivate lens by type
        deactivateLensByType(lens) {
            switch (lens.type) {
                case 'face':
                    if (window.WebZoneBW_FaceFilter) {
                        window.WebZoneBW_FaceFilter.stopFiltering();
                    }
                    break;
                    
                case 'scene':
                case 'vr':
                case 'pose':
                    // Scene/VR/Pose filters would be handled by rendering engine
                    console.log('[Lens Catalog] Scene/VR/Pose lens deactivated:', lens.name);
                    break;
            }
        },
        
        // Get current lens
        getCurrentLens() {
            return this.currentLens ? this.lenses[this.currentLens] : null;
        },
        
        // Check if lens is available
        isLensAvailable(lensId) {
            const lens = this.getLens(lensId);
            if (!lens) return false;
            
            // Check premium requirement
            if (lens.premium && !window.WebZoneBW_ER_LICENSE?.isPremium()) {
                return false;
            }
            
            return true;
        },
        
        // Get lens recommendations based on current conditions
        getRecommendations() {
            if (!this.config.enableSmartRecommendations) return [];
            
            const recommendations = [];
            const faceDetected = window.WebZoneBW_FaceDetection?.isFaceDetected();
            
            // Recommend face filters if face is detected
            if (faceDetected) {
                const faceFilters = this.getLensesByCategory('face');
                recommendations.push(...faceFilters.slice(0, 3));
            }
            
            // Always include smart lens
            const smartLens = this.getLens('smartLens');
            if (smartLens) {
                recommendations.unshift(smartLens);
            }
            
            return recommendations;
        },
        
        // Get lens preview URL (placeholder for actual preview generation)
        getLensPreview(lensId) {
            // This would generate or return a preview image URL
            // For now, return null
            return null;
        }
    };
    
    // Global access
    window.WebZoneBW_LensCatalog = LensCatalog;
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            LensCatalog.initialize();
        });
    } else {
        LensCatalog.initialize();
    }
    
})();