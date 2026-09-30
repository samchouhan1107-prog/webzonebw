/* =====================================================
   WEBZONEBW-ER STUDIO - ENHANCED PERFORMANCE & UX
   ===================================================== */

(function () {
    "use strict";

    // Performance optimization: Use requestIdleCallback for non-critical tasks
    const idleCallback = window.requestIdleCallback || window.requestAnimationFrame || setTimeout;
    const raf = window.requestAnimationFrame || window.setTimeout;

    // Debounce utility for performance
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

    // Throttle utility for performance
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

    // Enhanced Tab System with Performance Optimizations
    class EnhancedTabSystem {
        constructor() {
            this.activeCategory = 'smart';
            this.isInitialized = false;
            this.tabElements = new Map();
            this.filterPerformance = new Map();
            this.init();
        }

        init() {
            if (this.isInitialized) return;
            
            this.initializeTabs();
            this.initializeLensBubbles();
            this.initializeEffectCards();
            this.setupEventListeners();
            this.isInitialized = true;
            
            // Performance: Load critical tabs first
            this.loadCriticalTabs();
        }

        initializeTabs() {
            // Smart Category Pills
            const smartCategoryPills = document.getElementById('smartCategoryPills');
            if (smartCategoryPills) {
                const tabButtons = smartCategoryPills.querySelectorAll('.polished-tab');
                tabButtons.forEach(tab => {
                    this.tabElements.set(tab.dataset.smartCat, tab);
                    this.setupTabInteraction(tab, 'smart-cat');
                });
            }

            // Effects Category Pills
            const effectsCategoryPills = document.querySelector('.effects-category-pills');
            if (effectsCategoryPills) {
                const catButtons = effectsCategoryPills.querySelectorAll('.polished-tab');
                catButtons.forEach(tab => {
                    this.tabElements.set(tab.dataset.cat, tab);
                    this.setupTabInteraction(tab, 'cat');
                });
            }
        }

        initializeLensBubbles() {
            const lensTrack = document.getElementById('snapLensTrack');
            if (lensTrack) {
                const lensBubbles = lensTrack.querySelectorAll('.polished-lens');
                lensBubbles.forEach(lens => {
                    this.setupLensInteraction(lens);
                });
            }
        }

        initializeEffectCards() {
            const effectsGrid = document.getElementById('effectsCardGrid');
            if (effectsGrid) {
                const effectCards = effectsGrid.querySelectorAll('.effect-card');
                effectCards.forEach(card => {
                    this.setupEffectCardInteraction(card);
                });
            }
        }

        setupTabInteraction(tab, prefix) {
            const dataAttr = prefix === 'smart-cat' ? 'data-smart-cat' : 'data-cat';
            const category = tab.dataset[dataAttr];
            
            // Performance: Use passive event listeners
            tab.addEventListener('click', () => {
                this.switchTab(category, prefix);
            }, { passive: true });

            // Keyboard accessibility
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchTab(category, prefix);
                }
            }, { passive: true });
        }

        setupLensInteraction(lens) {
            const filter = lens.dataset.filter;
            
            lens.addEventListener('click', () => {
                this.applyLensFilter(filter, lens);
            }, { passive: true });

            lens.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.applyLensFilter(filter, lens);
                }
            }, { passive: true });
        }

        setupEffectCardInteraction(card) {
            const filter = card.dataset.filter;
            const category = card.dataset.cat;
            
            card.addEventListener('click', () => {
                this.applyEffectFilter(filter, category, card);
            }, { passive: true });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.applyEffectFilter(filter, category, card);
                }
            }, { passive: true });
        }

        switchTab(category, prefix) {
            // Performance: Debounce rapid tab switching
            if (this.switchTabTimeout) {
                clearTimeout(this.switchTabTimeout);
            }

            this.switchTabTimeout = setTimeout(() => {
                this.activeCategory = category;
                
                // Update active states
                this.updateActiveTabs(category, prefix);
                
                // Filter effects with performance optimization
                this.filterEffects(category);
                
                // Update UI feedback
                this.updateUIFeedback(category);
                
                // Track performance
                this.trackFilterPerformance(category);
            }, 150);
        }

        updateActiveTabs(category, prefix) {
            // Update smart category pills
            const smartTabs = document.querySelectorAll('[data-smart-cat]');
            smartTabs.forEach(tab => {
                const isActive = tab.dataset.smartCat === category;
                tab.classList.toggle('active', isActive);
            });

            // Update effects category pills
            const catTabs = document.querySelectorAll('[data-cat]');
            catTabs.forEach(tab => {
                const isActive = tab.dataset.cat === category;
                tab.classList.toggle('active', isActive);
            });
        }

        filterEffects(category) {
            const effectsGrid = document.getElementById('effectsCardGrid');
            if (!effectsGrid) return;

            const effectCards = effectsGrid.querySelectorAll('.effect-card');
            let visibleCount = 0;

            effectCards.forEach(card => {
                const cardCategory = card.dataset.cat;
                const shouldShow = category === 'all' || cardCategory === category;
                
                // Performance: Use CSS transforms for smooth animations
                if (shouldShow) {
                    card.style.display = 'flex';
                    card.style.animation = 'fadeInUp 0.3s ease-out';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                    card.style.animation = 'none';
                }
            });

            // Update lens carousel visibility
            this.updateLensCarouselVisibility(category);
            
            // Update count badges
            this.updateCountBadges(visibleCount, category);
        }

        updateLensCarouselVisibility(category) {
            const lensTrack = document.getElementById('snapLensTrack');
            if (!lensTrack) return;

            const lensBubbles = lensTrack.querySelectorAll('.polished-lens');
            lensBubbles.forEach(lens => {
                const filter = lens.dataset.filter;
                // Logic to show/hide lenses based on category
                // This would be implemented based on your specific filter logic
            });
        }

        updateCountBadges(count, category) {
            // Update tab count badges
            const countBadges = document.querySelectorAll('.tab-count');
            countBadges.forEach(badge => {
                if (badge.closest('[data-cat="' + category + '"]') || 
                    badge.closest('[data-smart-cat="' + category + '"]')) {
                    badge.textContent = count > 0 ? count : '';
                }
            });
        }

        updateUIFeedback(category) {
            // Update status text
            const statusText = document.getElementById('smartStatusText');
            if (statusText) {
                statusText.textContent = `Smart Adaptive: ${category.charAt(0).toUpperCase() + category.slice(1)} Active`;
            }

            // Update active lens indicator
            const activeBadge = document.getElementById('smartInventoryBadge');
            if (activeBadge) {
                activeBadge.textContent = `👤 ${this.getActiveFilterCount(category)} Face AR Lenses Ready`;
            }
        }

        getActiveFilterCount(category) {
            // Logic to determine number of active filters
            // This would be implemented based on your specific filter logic
            return 9; // Default count
        }

        applyLensFilter(filter, lens) {
            // Performance: Throttle filter applications
            if (this.filterTimeout) {
                clearTimeout(this.filterTimeout);
            }

            this.filterTimeout = setTimeout(() => {
                // Remove active state from all lenses
                document.querySelectorAll('.polished-lens').forEach(l => {
                    l.classList.remove('active');
                });

                // Add active state to selected lens
                lens.classList.add('active');

                // Apply filter logic
                this.applyFilterLogic(filter, 'lens');
                
                // Track performance
                this.trackFilterPerformance('lens_' + filter);
            }, 100);
        }

        applyEffectFilter(filter, category, card) {
            // Performance: Throttle filter applications
            if (this.effectFilterTimeout) {
                clearTimeout(this.effectFilterTimeout);
            }

            this.effectFilterTimeout = setTimeout(() => {
                // Remove active state from all effect cards
                document.querySelectorAll('.effect-card').forEach(c => {
                    c.classList.remove('active');
                });

                // Add active state to selected card
                card.classList.add('active');

                // Apply filter logic
                this.applyFilterLogic(filter, 'effect');
                
                // Track performance
                this.trackFilterPerformance('effect_' + filter);
            }, 100);
        }

        applyFilterLogic(filter, type) {
            // This would be implemented based on your specific filter logic
            // For now, we'll just log the filter application
            console.log(`Applying ${type} filter: ${filter}`);
            
            // Example: Update camera canvas with filter
            if (window.WEBZONEBW_ER && window.WEBZONEBW_ER.applyFilter) {
                window.WEBZONEBW_ER.applyFilter(filter, type);
            }
        }

        trackFilterPerformance(category) {
            const now = performance.now();
            if (!this.filterPerformance.has(category)) {
                this.filterPerformance.set(category, []);
            }
            
            const times = this.filterPerformance.get(category);
            times.push(now);
            
            // Keep only recent performance data
            if (times.length > 10) {
                times.shift();
            }
            
            // Log performance metrics
            if (times.length >= 3) {
                const avgTime = this.calculateAverageTime(times);
                console.log(`${category} filter performance: ${avgTime.toFixed(2)}ms average`);
            }
        }

        calculateAverageTime(times) {
            if (times.length < 2) return 0;
            
            let total = 0;
            for (let i = 1; i < times.length; i++) {
                total += times[i] - times[i-1];
            }
            
            return total / (times.length - 1);
        }

        loadCriticalTabs() {
            // Performance: Load critical tabs first for better perceived performance
            const criticalTabs = ['smart', 'face', 'scene'];
            
            criticalTabs.forEach((tab, index) => {
                setTimeout(() => {
                    const tabElement = this.tabElements.get(tab);
                    if (tabElement) {
                        // Preload tab content
                        this.preloadTabContent(tab);
                    }
                }, index * 50);
            });
        }

        preloadTabContent(category) {
            // Performance: Preload tab content for faster switching
            // This would be implemented based on your specific content loading needs
            console.log(`Preloading content for category: ${category}`);
        }

        setupEventListeners() {
            // Performance: Use passive event listeners where possible
            window.addEventListener('resize', debounce(() => {
                this.handleResize();
            }, 250), { passive: true });

            // Performance: Use visibility API to pause expensive operations
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseExpensiveOperations();
                } else {
                    this.resumeOperations();
                }
            }, { passive: true });
        }

        handleResize() {
            // Performance: Handle window resize with debouncing
            this.updateLayoutForMobile();
        }

        updateLayoutForMobile() {
            const isMobile = window.innerWidth <= 768;
            
            // Adjust tab layout for mobile
            const tabContainers = document.querySelectorAll('.polished-tabs-container');
            tabContainers.forEach(container => {
                if (isMobile) {
                    container.style.flexWrap = 'wrap';
                } else {
                    container.style.flexWrap = 'nowrap';
                }
            });
        }

        pauseExpensiveOperations() {
            // Pause expensive operations when tab is not visible
            console.log('Pausing expensive operations');
        }

        resumeOperations() {
            // Resume operations when tab becomes visible
            console.log('Resuming operations');
        }
    }

    // Enhanced Theme System with Performance Optimizations
    class EnhancedThemeSystem {
        constructor() {
            this.currentTheme = 'dark';
            this.isInitialized = false;
            this.init();
        }

        init() {
            if (this.isInitialized) return;
            
            this.loadSavedTheme();
            this.setupThemeToggle();
            this.setupSystemThemeDetection();
            this.isInitialized = true;
        }

        loadSavedTheme() {
            try {
                const savedTheme = localStorage.getItem('webzonebw-er-theme') || 
                                 localStorage.getItem('theme') || 'dark';
                this.applyTheme(savedTheme);
            } catch (error) {
                console.warn('Could not load saved theme:', error);
                this.applyTheme('dark');
            }
        }

        applyTheme(theme) {
            this.currentTheme = theme;
            
            const html = document.documentElement;
            const body = document.body;
            
            // Remove existing theme classes
            html.classList.remove('er-theme-light', 'er-theme-dark');
            body.classList.remove('er-theme-light', 'er-theme-dark');
            
            // Apply new theme
            if (theme === 'light') {
                html.classList.add('er-theme-light');
                body.classList.add('er-theme-light');
            } else {
                html.classList.add('er-theme-dark');
                body.classList.add('er-theme-dark');
            }
            
            // Update theme toggle UI
            this.updateThemeToggleUI(theme);
            
            // Save theme preference
            this.saveTheme(theme);
        }

        updateThemeToggleUI(theme) {
            const toggle = document.getElementById('themeToggleSwitch');
            const icon = document.getElementById('themeModeIcon');
            const text = document.getElementById('themeModeText');
            
            if (toggle) toggle.checked = theme === 'dark';
            if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
            if (text) text.textContent = theme === 'light' ? 'Light Mode' : 'Dark Mode';
        }

        saveTheme(theme) {
            try {
                localStorage.setItem('webzonebw-er-theme', theme);
                localStorage.setItem('theme', theme);
            } catch (error) {
                console.warn('Could not save theme:', error);
            }
        }

        setupThemeToggle() {
            const toggle = document.getElementById('themeToggleSwitch');
            if (!toggle) return;
            
            toggle.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'dark' : 'light';
                this.applyTheme(theme);
            }, { passive: true });
        }

        setupSystemThemeDetection() {
            // Performance: Use MediaQueryList for efficient theme detection
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            darkModeQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('webzonebw-er-theme') && 
                    !localStorage.getItem('theme')) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(systemTheme);
                }
            }, { passive: true });
        }
    }

    // Enhanced Performance Monitor
    class PerformanceMonitor {
        constructor() {
            this.metrics = {
                filterApplyTime: [],
                tabSwitchTime: [],
                renderTime: []
            };
            this.isMonitoring = false;
            this.init();
        }

        init() {
            this.startMonitoring();
        }

        startMonitoring() {
            if (this.isMonitoring) return;
            this.isMonitoring = true;
            
            // Performance: Use idle callback for non-critical monitoring
            idleCallback(() => {
                this.collectMetrics();
            });
        }

        collectMetrics() {
            // Collect performance metrics
            if (performance.mark) {
                performance.mark('filter-start');
                
                // Simulate filter application time
                setTimeout(() => {
                    performance.mark('filter-end');
                    performance.measure('filter-duration', 'filter-start', 'filter-end');
                    
                    const measure = performance.getEntriesByName('filter-duration')[0];
                    if (measure) {
                        this.metrics.filterApplyTime.push(measure.duration);
                        this.pruneMetrics();
                    }
                }, 16); // Simulate 60fps
            }
            
            // Continue monitoring
            if (this.isMonitoring) {
                idleCallback(() => {
                    this.collectMetrics();
                });
            }
        }

        pruneMetrics() {
            // Keep only recent metrics
            Object.keys(this.metrics).forEach(key => {
                if (this.metrics[key].length > 20) {
                    this.metrics[key] = this.metrics[key].slice(-20);
                }
            });
        }

        getAveragePerformance() {
            const avgTimes = {};
            Object.keys(this.metrics).forEach(key => {
                if (this.metrics[key].length > 0) {
                    const sum = this.metrics[key].reduce((a, b) => a + b, 0);
                    avgTimes[key] = sum / this.metrics[key].length;
                }
            });
            return avgTimes;
        }

        stopMonitoring() {
            this.isMonitoring = false;
        }
    }

    // Initialize enhanced systems when DOM is ready
    function initializeEnhancedSystems() {
        // Initialize tab system
        const tabSystem = new EnhancedTabSystem();
        
        // Initialize theme system
        const themeSystem = new EnhancedThemeSystem();
        
        // Initialize performance monitor
        const performanceMonitor = new PerformanceMonitor();
        
        // Export for global access
        window.WEBZONEBW_ER_ENHANCED = {
            tabSystem,
            themeSystem,
            performanceMonitor,
            debounce,
            throttle
        };
        
        console.log('WEBZONEBW-ER Enhanced Systems Initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEnhancedSystems);
    } else {
        initializeEnhancedSystems();
    }

})();