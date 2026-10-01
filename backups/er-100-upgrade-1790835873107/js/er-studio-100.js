/* =====================================================
   WEBZONEBW ER STUDIO - 5 STAR PREMIUM EXPERIENCE v3.0.0
   ===================================================== */

(function () {
    "use strict";

    // Elite Performance Optimization System
    class ElitePerformanceSystem {
        constructor() {
            this.metrics = {
                filterApplyTime: [],
                tabSwitchTime: [],
                renderTime: [],
                memoryUsage: [],
                interactionTime: []
            };
            this.isMonitoring = false;
            this.optimizations = {
                cache: new Map(),
                memory: new Set(),
                animations: new Set(),
                events: new Set()
            };
            this.init();
        }

        init() {
            this.startEliteMonitoring();
            this.setupEliteOptimizations();
            this.setupMemoryManagement();
        }

        startEliteMonitoring() {
            if (this.isMonitoring) return;
            this.isMonitoring = true;

            // Elite monitoring with precision timing
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name.includes('filter') || entry.name.includes('tab')) {
                        this.metrics[entry.name + 'Time'].push(entry.duration);
                        this.pruneMetrics();
                    }
                });
            });

            try {
                observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
            } catch (e) {
                console.warn('PerformanceObserver not supported, using fallback');
            }

            // Elite monitoring loop
            this.monitoringLoop();
        }

        monitoringLoop() {
            if (!this.isMonitoring) return;

            // Elite performance check
            const now = performance.now();
            const memUsage = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            this.metrics.memoryUsage.push(memUsage);
            this.metrics.interactionTime.push(now);

            // Elite optimization triggers
            if (memUsage > 50 * 1024 * 1024) { // 50MB
                this.triggerMemoryOptimization();
            }

            // Continue monitoring
            requestAnimationFrame(() => this.monitoringLoop());
        }

        setupEliteOptimizations() {
            // Elite caching system
            this.setupEliteCaching();
            
            // Elite animation optimization
            this.setupEliteAnimations();
            
            // Elite event optimization
            this.setupEliteEvents();
        }

        setupEliteCaching() {
            // Elite filter caching
            const cacheKey = 'er_filter_cache';
            if (sessionStorage.getItem(cacheKey)) {
                const cached = JSON.parse(sessionStorage.getItem(cacheKey));
                this.optimizations.cache = new Map(cached);
            }

            // Cache cleanup
            setInterval(() => {
                const now = Date.now();
                for (const [key, value] of this.optimizations.cache) {
                    if (now - value.timestamp > 300000) { // 5 minutes
                        this.optimizations.cache.delete(key);
                    }
                }
                this.saveCache();
            }, 60000); // Every minute
        }

        setupEliteAnimations() {
            // Elite animation frame management
            let animationFrameId;
            const animate = () => {
                this.updateEliteAnimations();
                animationFrameId = requestAnimationFrame(animate);
            };
            animate();

            // Cleanup on visibility change
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cancelAnimationFrame(animationFrameId);
                } else {
                    animate();
                }
            });
        }

        setupEliteEvents() {
            // Elite event delegation
            document.addEventListener('click', this.eliteClickHandler.bind(this), { passive: true });
            document.addEventListener('touchstart', this.eliteTouchHandler.bind(this), { passive: true });
        }

        eliteClickHandler(e) {
            const target = e.target.closest('.polished-tab, .polished-lens, .effect-card');
            if (target) {
                this.trackEliteInteraction('click', target);
            }
        }

        eliteTouchHandler(e) {
            const target = e.target.closest('.polished-tab, .polished-lens, .effect-card');
            if (target) {
                this.trackEliteInteraction('touch', target);
            }
        }

        trackEliteInteraction(type, element) {
            const now = performance.now();
            this.metrics.interactionTime.push({
                time: now,
                type: type,
                element: element.className
            });
        }

        updateEliteAnimations() {
            // Elite animation updates
            const animatedElements = document.querySelectorAll('.polished-tab, .polished-lens');
            animatedElements.forEach(el => {
                if (this.optimizations.animations.has(el)) {
                    this.updateElementAnimation(el);
                }
            });
        }

        updateElementAnimation(element) {
            // Elite animation logic
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                element.style.animationPlayState = 'running';
            } else {
                element.style.animationPlayState = 'paused';
            }
        }

        setupMemoryManagement() {
            // Elite memory cleanup
            setInterval(() => {
                this.cleanupMemory();
            }, 30000); // Every 30 seconds

            // Page visibility optimization
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseEliteOperations();
                } else {
                    this.resumeEliteOperations();
                }
            });
        }

        cleanupMemory() {
            // Clean up old animations
            const oldAnimations = Array.from(this.optimizations.animations)
                .filter(el => !document.contains(el));
            
            oldAnimations.forEach(el => {
                this.optimizations.animations.delete(el);
            });

            // Clean up old events
            this.optimizations.events.forEach(event => {
                if (!document.contains(event.element)) {
                    this.optimizations.events.delete(event);
                }
            });
        }

        pauseEliteOperations() {
            // Pause expensive operations when tab is not visible
            console.log('⏸️ Pausing elite operations');
            this.isMonitoring = false;
        }

        resumeEliteOperations() {
            // Resume operations when tab becomes visible
            console.log('▶️ Resuming elite operations');
            this.isMonitoring = true;
            this.monitoringLoop();
        }

        triggerMemoryOptimization() {
            console.log('🧹 Triggering memory optimization');
            
            // Clear cache
            this.optimizations.cache.clear();
            this.saveCache();
            
            // Cleanup animations
            this.optimizations.animations.clear();
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
        }

        saveCache() {
            const cacheData = Array.from(this.optimizations.cache.entries());
            sessionStorage.setItem('er_filter_cache', JSON.stringify(cacheData));
        }

        pruneMetrics() {
            Object.keys(this.metrics).forEach(key => {
                if (this.metrics[key].length > 50) {
                    this.metrics[key] = this.metrics[key].slice(-50);
                }
            });
        }

        getElitePerformanceReport() {
            const report = {};
            
            Object.keys(this.metrics).forEach(key => {
                if (this.metrics[key].length > 0) {
                    const avg = this.metrics[key].reduce((a, b) => a + b, 0) / this.metrics[key].length;
                    report[key] = {
                        average: avg.toFixed(2),
                        count: this.metrics[key].length,
                        min: Math.min(...this.metrics[key]),
                        max: Math.max(...this.metrics[key])
                    };
                }
            });

            return report;
        }
    }

    // 5-Star Premium Tab System
    class FiveStarTabSystem {
        constructor() {
            this.activeCategory = 'smart';
            this.isInitialized = false;
            this.tabElements = new Map();
            this.filterPerformance = new Map();
            this.animationSystem = new ElitePerformanceSystem();
            this.init();
        }

        init() {
            if (this.isInitialized) return;
            
            this.initializeEliteTabs();
            this.initializePremiumLensBubbles();
            this.initializeStarEffectCards();
            this.setupPremiumEventListeners();
            this.setupStarAnimations();
            this.isInitialized = true;
            
            // Elite: Load critical tabs first
            this.loadEliteTabs();
        }

        initializeEliteTabs() {
            // Smart Category Pills - Elite Version
            const smartCategoryPills = document.getElementById('smartCategoryPills');
            if (smartCategoryPills) {
                const tabButtons = smartCategoryPills.querySelectorAll('.polished-tab');
                tabButtons.forEach(tab => {
                    this.tabElements.set(tab.dataset.smartCat, tab);
                    this.setupEliteTabInteraction(tab, 'smart-cat');
                });
            }

            // Effects Category Pills - Elite Version
            const effectsCategoryPills = document.querySelector('.effects-category-pills');
            if (effectsCategoryPills) {
                const catButtons = effectsCategoryPills.querySelectorAll('.polished-tab');
                catButtons.forEach(tab => {
                    this.tabElements.set(tab.dataset.cat, tab);
                    this.setupEliteTabInteraction(tab, 'cat');
                });
            }
        }

        setupEliteTabInteraction(tab, prefix) {
            const dataAttr = prefix === 'smart-cat' ? 'data-smart-cat' : 'data-cat';
            const category = tab.dataset[dataAttr];
            
            // Elite interaction with performance optimization
            const clickHandler = (e) => {
                e.preventDefault();
                this.switchEliteTab(category, prefix, tab);
            };

            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchEliteTab(category, prefix, tab);
                }
            };

            // Add with passive listeners for performance
            tab.addEventListener('click', clickHandler, { passive: true });
            tab.addEventListener('keydown', keyHandler, { passive: true });

            // Store handlers for cleanup
            tab._eliteHandlers = { click: clickHandler, key: keyHandler };
        }

        switchEliteTab(category, prefix, tabElement) {
            // Elite: Debounced tab switching with performance tracking
            if (this.switchTabTimeout) {
                clearTimeout(this.switchTabTimeout);
            }

            const startTime = performance.now();
            
            this.switchTabTimeout = setTimeout(() => {
                this.activeCategory = category;
                
                // Elite: Update active states with animations
                this.updateEliteTabs(category, prefix);
                
                // Elite: Filter effects with performance optimization
                this.filterEliteEffects(category);
                
                // Elite: Update UI feedback with animations
                this.updateEliteUIFeedback(category, tabElement);
                
                // Elite: Track performance
                const endTime = performance.now();
                this.trackElitePerformance('tab_switch', endTime - startTime);
                
                // Elite: Trigger premium animations
                this.triggerPremiumAnimation(tabElement);
            }, 100); // Elite: Reduced delay for faster response
        }

        updateEliteTabs(category, prefix) {
            // Elite: Update smart category pills with animations
            const smartTabs = document.querySelectorAll('[data-smart-cat]');
            smartTabs.forEach(tab => {
                const isActive = tab.dataset.smartCat === category;
                tab.classList.toggle('active', isActive);
                
                if (isActive) {
                    this.animateEliteTab(tab);
                }
            });

            // Elite: Update effects category pills with animations
            const catTabs = document.querySelectorAll('[data-cat]');
            catTabs.forEach(tab => {
                const isActive = tab.dataset.cat === category;
                tab.classList.toggle('active', isActive);
                
                if (isActive) {
                    this.animateEliteTab(tab);
                }
            });
        }

        animateEliteTab(tab) {
            // Elite tab animation with GPU acceleration
            tab.style.transform = 'scale(1.05)';
            tab.style.boxShadow = '0 8px 25px rgba(255, 107, 26, 0.4)';
            
            setTimeout(() => {
                tab.style.transform = 'scale(1)';
                tab.style.boxShadow = '';
            }, 300);
        }

        filterEliteEffects(category) {
            const effectsGrid = document.getElementById('effectsCardGrid');
            if (!effectsGrid) return;

            const effectCards = effectsGrid.querySelectorAll('.effect-card');
            let visibleCount = 0;

            effectCards.forEach(card => {
                const cardCategory = card.dataset.cat;
                const shouldShow = category === 'all' || cardCategory === category;
                
                if (shouldShow) {
                    card.style.display = 'flex';
                    card.style.animation = 'eliteFadeInUp 0.4s ease-out';
                    visibleCount++;
                    
                    // Elite: Add entrance animation
                    setTimeout(() => {
                        card.style.animation = '';
                    }, 400);
                } else {
                    card.style.display = 'none';
                    card.style.animation = 'eliteFadeOut 0.2s ease-in';
                }
            });

            // Elite: Update lens carousel visibility
            this.updateEliteLensCarouselVisibility(category);
            
            // Elite: Update count badges with animations
            this.updateEliteCountBadges(visibleCount, category);
        }

        updateEliteLensCarouselVisibility(category) {
            const lensTrack = document.getElementById('snapLensTrack');
            if (!lensTrack) return;

            const lensBubbles = lensTrack.querySelectorAll('.polished-lens');
            lensBubbles.forEach(lens => {
                const filter = lens.dataset.filter;
                // Elite: Smart lens visibility logic
                this.updateLensVisibility(lens, category, filter);
            });
        }

        updateLensVisibility(lens, category, filter) {
            // Elite: Enhanced lens visibility logic
            const shouldShow = category === 'all' || this.isLensInCategory(filter, category);
            
            if (shouldShow) {
                lens.style.display = 'flex';
                lens.style.animation = 'eliteSlideIn 0.3s ease-out';
            } else {
                lens.style.display = 'none';
                lens.style.animation = 'eliteSlideOut 0.2s ease-in';
            }
        }

        isLensInCategory(filter, category) {
            // Elite: Enhanced lens categorization logic
            const categoryMap = {
                'smart': ['cartoon', 'sunglasses', 'halo', 'goldenhour'],
                'face': ['cartoon', 'sunglasses', 'halo', 'goldenhour'],
                'scene': ['cinematic', 'noir', 'vintage90s', 'glitch', 'space', 'cyberpunk'],
                'pose': ['ghost-pose', 'pose-frame', 'pumpkin-pose'],
                'vr': ['vr-nebula', 'haunted-forest', 'vr-cyberdeck', 'vr-mansion']
            };
            
            return categoryMap[category]?.includes(filter) || false;
        }

        updateEliteCountBadges(count, category) {
            // Elite: Update tab count badges with animations
            const countBadges = document.querySelectorAll('.tab-count');
            countBadges.forEach(badge => {
                if (badge.closest('[data-cat="' + category + '"]') || 
                    badge.closest('[data-smart-cat="' + category + '"]')) {
                    
                    // Elite: Animate count change
                    badge.style.transform = 'scale(1.2)';
                    badge.textContent = count > 0 ? count : '';
                    
                    setTimeout(() => {
                        badge.style.transform = 'scale(1)';
                    }, 200);
                }
            });
        }

        updateEliteUIFeedback(category, tabElement) {
            // Elite: Update status text with animations
            const statusText = document.getElementById('smartStatusText');
            if (statusText) {
                statusText.style.opacity = '0';
                setTimeout(() => {
                    statusText.textContent = `Smart Adaptive: ${category.charAt(0).toUpperCase() + category.slice(1)} Active`;
                    statusText.style.opacity = '1';
                }, 200);
            }

            // Elite: Update active lens indicator with animations
            const activeBadge = document.getElementById('smartInventoryBadge');
            if (activeBadge) {
                activeBadge.style.transform = 'scale(1.1)';
                activeBadge.textContent = `👤 ${this.getEliteFilterCount(category)} Face AR Lenses Ready`;
                
                setTimeout(() => {
                    activeBadge.style.transform = 'scale(1)';
                }, 300);
            }
        }

        getEliteFilterCount(category) {
            // Elite: Enhanced filter counting logic
            const counts = {
                'smart': 9,
                'face': 12,
                'scene': 8,
                'pose': 4,
                'vr': 4,
                'all': 35
            };
            return counts[category] || 0;
        }

        initializePremiumLensBubbles() {
            const lensTrack = document.getElementById('snapLensTrack');
            if (lensTrack) {
                const lensBubbles = lensTrack.querySelectorAll('.polished-lens');
                lensBubbles.forEach(lens => {
                    this.setupPremiumLensInteraction(lens);
                });
            }
        }

        setupPremiumLensInteraction(lens) {
            const filter = lens.dataset.filter;
            
            const clickHandler = (e) => {
                e.preventDefault();
                this.applyPremiumLensFilter(filter, lens);
            };

            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.applyPremiumLensFilter(filter, lens);
                }
            };

            lens.addEventListener('click', clickHandler, { passive: true });
            lens.addEventListener('keydown', keyHandler, { passive: true });

            lens._eliteHandlers = { click: clickHandler, key: keyHandler };
        }

        applyPremiumLensFilter(filter, lens) {
            // Elite: Throttled filter applications
            if (this.filterTimeout) {
                clearTimeout(this.filterTimeout);
            }

            const startTime = performance.now();
            
            this.filterTimeout = setTimeout(() => {
                // Elite: Remove active state from all lenses
                document.querySelectorAll('.polished-lens').forEach(l => {
                    l.classList.remove('active');
                });

                // Elite: Add active state to selected lens
                lens.classList.add('active');

                // Elite: Apply filter logic with performance tracking
                this.applyPremiumFilterLogic(filter, 'lens');
                
                // Elite: Track performance
                const endTime = performance.now();
                this.trackElitePerformance('lens_apply', endTime - startTime);
                
                // Elite: Trigger premium animations
                this.triggerPremiumAnimation(lens);
            }, 50); // Elite: Reduced delay for faster response
        }

        applyPremiumFilterLogic(filter, type) {
            // Elite: Enhanced filter logic with caching
            const cacheKey = `${type}_${filter}`;
            
            if (this.animationSystem.optimizations.cache.has(cacheKey)) {
                const cached = this.animationSystem.optimizations.cache.get(cacheKey);
                console.log(`🚀 Using cached filter: ${filter}`);
                return cached;
            }

            // Elite: Apply filter logic
            console.log(`🌟 Applying premium ${type} filter: ${filter}`);
            
            // Elite: Cache the result
            this.animationSystem.optimizations.cache.set(cacheKey, {
                filter: filter,
                type: type,
                timestamp: Date.now()
            });

            // Elite: Apply filter to camera
            if (window.WEBZONEBW_ER && window.WEBZONEBW_ER.applyFilter) {
                window.WEBZONEBW_ER.applyFilter(filter, type);
            }
        }

        initializeStarEffectCards() {
            const effectsGrid = document.getElementById('effectsCardGrid');
            if (effectsGrid) {
                const effectCards = effectsGrid.querySelectorAll('.effect-card');
                effectCards.forEach(card => {
                    this.setupStarEffectCardInteraction(card);
                });
            }
        }

        setupStarEffectCardInteraction(card) {
            const filter = card.dataset.filter;
            const category = card.dataset.cat;
            
            const clickHandler = (e) => {
                e.preventDefault();
                this.applyStarEffectFilter(filter, category, card);
            };

            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.applyStarEffectFilter(filter, category, card);
                }
            };

            card.addEventListener('click', clickHandler, { passive: true });
            card.addEventListener('keydown', keyHandler, { passive: true });

            card._eliteHandlers = { click: clickHandler, key: keyHandler };
        }

        applyStarEffectFilter(filter, category, card) {
            // Elite: Throttled effect filter applications
            if (this.effectFilterTimeout) {
                clearTimeout(this.effectFilterTimeout);
            }

            const startTime = performance.now();
            
            this.effectFilterTimeout = setTimeout(() => {
                // Elite: Remove active state from all effect cards
                document.querySelectorAll('.effect-card').forEach(c => {
                    c.classList.remove('active');
                });

                // Elite: Add active state to selected card
                card.classList.add('active');

                // Elite: Apply filter logic with performance tracking
                this.applyStarFilterLogic(filter, category, 'effect');
                
                // Elite: Track performance
                const endTime = performance.now();
                this.trackElitePerformance('effect_apply', endTime - startTime);
                
                // Elite: Trigger premium animations
                this.triggerPremiumAnimation(card);
            }, 50); // Elite: Reduced delay for faster response
        }

        applyStarFilterLogic(filter, category, type) {
            // Elite: Enhanced filter logic with star quality
            console.log(`⭐ Applying star ${type} filter: ${filter} (category: ${category})`);
            
            // Elite: Apply filter to camera
            if (window.WEBZONEBW_ER && window.WEBZONEBW_ER.applyFilter) {
                window.WEBZONEBW_ER.applyFilter(filter, type);
            }
        }

        setupPremiumEventListeners() {
            // Elite: Use passive event listeners for performance
            window.addEventListener('resize', this.debounce(() => {
                this.handleEliteResize();
            }, 100), { passive: true });

            // Elite: Use visibility API for performance
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseEliteOperations();
                } else {
                    this.resumeEliteOperations();
                }
            }, { passive: true });

            // Elite: Use intersection observer for animations
            this.setupIntersectionObserver();
        }

        setupIntersectionObserver() {
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateOnIntersect(entry.target);
                        }
                    });
                }, { threshold: 0.1 });

                // Observe all premium elements
                document.querySelectorAll('.polished-tab, .polished-lens, .effect-card').forEach(el => {
                    observer.observe(el);
                });
            }
        }

        animateOnIntersect(element) {
            // Elite: Intersection-based animations
            element.style.animation = 'eliteFadeInUp 0.6s ease-out';
            setTimeout(() => {
                element.style.animation = '';
            }, 600);
        }

        setupStarAnimations() {
            // Elite: Setup premium animations
            const style = document.createElement('style');
            style.textContent = `
                @keyframes eliteFadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes eliteFadeOut {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                }
                
                @keyframes eliteSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes eliteSlideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                }
                
                @keyframes elitePulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(255, 107, 26, 0.4);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 0 0 10px rgba(255, 107, 26, 0);
                    }
                }
            `;
            document.head.appendChild(style);

            // Elite: Add premium animation classes
            document.querySelectorAll('.polished-tab, .polished-lens, .effect-card').forEach(el => {
                el.classList.add('elite-element');
            });
        }

        triggerPremiumAnimation(element) {
            // Elite: Trigger premium animations
            element.style.animation = 'elitePulse 0.6s ease-out';
            setTimeout(() => {
                element.style.animation = '';
            }, 600);
        }

        handleEliteResize() {
            // Elite: Handle window resize with performance optimization
            this.updateEliteLayoutForMobile();
        }

        updateEliteLayoutForMobile() {
            const isMobile = window.innerWidth <= 768;
            
            // Elite: Adjust tab layout for mobile
            const tabContainers = document.querySelectorAll('.polished-tabs-container');
            tabContainers.forEach(container => {
                if (isMobile) {
                    container.style.flexWrap = 'wrap';
                    container.style.gap = '6px';
                } else {
                    container.style.flexWrap = 'nowrap';
                    container.style.gap = '8px';
                }
            });
        }

        pauseEliteOperations() {
            // Elite: Pause expensive operations when tab is not visible
            console.log('⏸️ Pausing elite operations');
            this.animationSystem.isMonitoring = false;
        }

        resumeEliteOperations() {
            // Elite: Resume operations when tab becomes visible
            console.log('▶️ Resuming elite operations');
            this.animationSystem.isMonitoring = true;
            this.animationSystem.monitoringLoop();
        }

        loadEliteTabs() {
            // Elite: Load critical tabs first for better perceived performance
            const criticalTabs = ['smart', 'face', 'scene'];
            
            criticalTabs.forEach((tab, index) => {
                setTimeout(() => {
                    const tabElement = this.tabElements.get(tab);
                    if (tabElement) {
                        // Elite: Preload tab content
                        this.preloadEliteTabContent(tab);
                        
                        // Elite: Add entrance animation
                        tabElement.style.animation = 'eliteFadeInUp 0.4s ease-out';
                        setTimeout(() => {
                            tabElement.style.animation = '';
                        }, 400);
                    }
                }, index * 100);
            });
        }

        preloadEliteTabContent(category) {
            // Elite: Preload tab content for faster switching
            console.log(`⚡ Preloading elite content for category: ${category}`);
            
            // Elite: Simulate content loading
            const cacheKey = `preload_${category}`;
            this.animationSystem.optimizations.cache.set(cacheKey, {
                category: category,
                timestamp: Date.now(),
                loaded: true
            });
        }

        trackElitePerformance(operation, duration) {
            // Elite: Track performance metrics
            if (!this.filterPerformance.has(operation)) {
                this.filterPerformance.set(operation, []);
            }
            
            const times = this.filterPerformance.get(operation);
            times.push(duration);
            
            // Elite: Keep only recent performance data
            if (times.length > 20) {
                times.shift();
            }
            
            // Elite: Log performance metrics
            if (times.length >= 3) {
                const avgTime = this.calculateEliteAverageTime(times);
                console.log(`⭐ ${operation} performance: ${avgTime.toFixed(2)}ms average`);
            }
        }

        calculateEliteAverageTime(times) {
            if (times.length < 2) return 0;
            
            let total = 0;
            for (let i = 1; i < times.length; i++) {
                total += times[i] - times[i-1];
            }
            
            return total / (times.length - 1);
        }

        getElitePerformanceReport() {
            return this.animationSystem.getElitePerformanceReport();
        }
    }

    // 5-Star Premium Theme System
    class FiveStarThemeSystem {
        constructor() {
            this.currentTheme = 'dark';
            this.isInitialized = false;
            this.themeHistory = [];
            this.init();
        }

        init() {
            if (this.isInitialized) return;
            
            this.loadEliteTheme();
            this.setupEliteThemeToggle();
            this.setupEliteSystemThemeDetection();
            this.setupPremiumThemeEffects();
            this.isInitialized = true;
        }

        loadEliteTheme() {
            try {
                // Elite: Try multiple storage methods
                const savedTheme = localStorage.getItem('webzonebw-er-theme') || 
                                 localStorage.getItem('theme') || 
                                 sessionStorage.getItem('webzonebw-er-theme') ||
                                 'dark';
                
                this.applyEliteTheme(savedTheme);
                this.themeHistory.push({ theme: savedTheme, timestamp: Date.now() });
            } catch (error) {
                console.warn('Could not load saved theme:', error);
                this.applyEliteTheme('dark');
            }
        }

        applyEliteTheme(theme) {
            this.currentTheme = theme;
            
            const html = document.documentElement;
            const body = document.body;
            
            // Elite: Remove existing theme classes
            html.classList.remove('er-theme-light', 'er-theme-dark');
            body.classList.remove('er-theme-light', 'er-theme-dark');
            
            // Elite: Apply new theme with premium effects
            if (theme === 'light') {
                html.classList.add('er-theme-light');
                body.classList.add('er-theme-light');
                this.applyPremiumLightTheme();
            } else {
                html.classList.add('er-theme-dark');
                body.classList.add('er-theme-dark');
                this.applyPremiumDarkTheme();
            }
            
            // Elite: Update theme toggle UI with animations
            this.updateEliteThemeToggleUI(theme);
            
            // Elite: Save theme preference
            this.saveEliteTheme(theme);
            
            // Elite: Trigger theme transition animations
            this.triggerThemeTransition(theme);
        }

        applyPremiumLightTheme() {
            // Elite: Premium light theme effects
            document.body.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
            document.body.style.color = '#1f2937';
            
            // Elite: Add premium light theme animations
            document.querySelectorAll('.polished-tab, .polished-lens, .effect-card').forEach(el => {
                el.style.background = 'rgba(255, 255, 255, 0.9)';
                el.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            });
        }

        applyPremiumDarkTheme() {
            // Elite: Premium dark theme effects
            document.body.style.background = 'linear-gradient(135deg, #030712 0%, #070913 100%)';
            document.body.style.color = '#f9fafb';
            
            // Elite: Add premium dark theme animations
            document.querySelectorAll('.polished-tab, .polished-lens, .effect-card').forEach(el => {
                el.style.background = 'rgba(255, 255, 255, 0.08)';
                el.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            });
        }

        updateEliteThemeToggleUI(theme) {
            const toggle = document.getElementById('themeToggleSwitch');
            const icon = document.getElementById('themeModeIcon');
            const text = document.getElementById('themeModeText');
            
            if (toggle) {
                toggle.checked = theme === 'dark';
                toggle.style.transition = 'all 0.3s ease';
            }
            if (icon) {
                icon.textContent = theme === 'light' ? '☀️' : '🌙';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    icon.style.transform = 'rotate(0deg)';
                }, 300);
            }
            if (text) {
                text.textContent = theme === 'light' ? 'Light Mode' : 'Dark Mode';
                text.style.opacity = '0';
                setTimeout(() => {
                    text.style.opacity = '1';
                }, 200);
            }
        }

        saveEliteTheme(theme) {
            try {
                // Elite: Save to multiple storage methods
                localStorage.setItem('webzonebw-er-theme', theme);
                localStorage.setItem('theme', theme);
                sessionStorage.setItem('webzonebw-er-theme', theme);
            } catch (error) {
                console.warn('Could not save theme:', error);
            }
        }

        setupEliteThemeToggle() {
            const toggle = document.getElementById('themeToggleSwitch');
            if (!toggle) return;
            
            const toggleHandler = (e) => {
                const theme = e.target.checked ? 'dark' : 'light';
                this.applyEliteTheme(theme);
                this.themeHistory.push({ theme, timestamp: Date.now() });
            };
            
            toggle.addEventListener('change', toggleHandler, { passive: true });
            toggle._eliteHandler = toggleHandler;
        }

        setupEliteSystemThemeDetection() {
            // Elite: Use MediaQueryList for efficient theme detection
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const themeChangeHandler = (e) => {
                if (!localStorage.getItem('webzonebw-er-theme') && 
                    !localStorage.getItem('theme') &&
                    !sessionStorage.getItem('webzonebw-er-theme')) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.applyEliteTheme(systemTheme);
                    this.themeHistory.push({ theme: systemTheme, timestamp: Date.now(), source: 'system' });
                }
            };
            
            darkModeQuery.addEventListener('change', themeChangeHandler, { passive: true });
            darkModeQuery._eliteHandler = themeChangeHandler;
        }

        setupPremiumThemeEffects() {
            // Elite: Setup premium theme effects
            this.setupThemeParticles();
            this.setupThemeTransitions();
            this.setupThemeAnimations();
        }

        setupThemeParticles() {
            // Elite: Create theme-specific particle effects
            const particleContainer = document.createElement('div');
            particleContainer.className = 'elite-theme-particles';
            particleContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            `;
            
            document.body.appendChild(particleContainer);
            
            // Elite: Create particles based on theme
            this.createThemeParticles(particleContainer);
        }

        createThemeParticles(container) {
            const particleCount = 20;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'elite-theme-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: ${this.currentTheme === 'light' ? 'rgba(255, 107, 26, 0.3)' : 'rgba(255, 107, 26, 0.6)'};
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: eliteParticleFloat ${5 + Math.random() * 10}s linear infinite;
                `;
                
                container.appendChild(particle);
            }
        }

        setupThemeTransitions() {
            // Elite: Setup smooth theme transitions
            document.documentElement.style.transition = 'all 0.5s ease';
            document.body.style.transition = 'all 0.5s ease';
            
            // Elite: Add transition classes to all elements
            document.querySelectorAll('.polished-tab, .polished-lens, .effect-card').forEach(el => {
                el.style.transition = 'all 0.3s ease';
            });
        }

        setupThemeAnimations() {
            // Elite: Setup theme-specific animations
            const style = document.createElement('style');
            style.textContent = `
                @keyframes eliteParticleFloat {
                    0% {
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) translateX(50px);
                        opacity: 0;
                    }
                }
                
                .elite-theme-transition {
                    animation: eliteThemeTransition 0.5s ease-out;
                }
                
                @keyframes eliteThemeTransition {
                    0% {
                        transform: scale(0.95);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scale(1.02);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        triggerThemeTransition(theme) {
            // Elite: Trigger theme transition animations
            document.querySelectorAll('.polished-tab, .polished-lens, .effect-card').forEach(el => {
                el.classList.add('elite-theme-transition');
                setTimeout(() => {
                    el.classList.remove('elite-theme-transition');
                }, 500);
            });
        }

        getThemeHistory() {
            return this.themeHistory.slice(-10); // Return last 10 theme changes
        }
    }

    // Initialize 5-Star systems when DOM is ready
    function initializeFiveStarSystems() {
        // Initialize elite tab system
        const tabSystem = new FiveStarTabSystem();
        
        // Initialize elite theme system
        const themeSystem = new FiveStarThemeSystem();
        
        // Export for global access
        window.WEBZONEBW_ER_100 = {
            tabSystem,
            themeSystem,
            performanceSystem: tabSystem.animationSystem,
            debounce,
            throttle,
            getPerformanceReport: () => tabSystem.getElitePerformanceReport(),
            getThemeHistory: () => themeSystem.getThemeHistory()
        };
        
        console.log('🌟 WEBZONEBW ER Studio 5-Star Premium Systems Initialized');
        console.log('⭐ Version 3.0.0 - 100% Excellence');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFiveStarSystems);
    } else {
        initializeFiveStarSystems();
    }

    // Elite utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

})();