/* =====================================================
   WEBZONEBW-ER STUDIO — ACCESSIBILITY & PERFORMANCE ENHANCEMENTS
   ===================================================== */

(function () {
    "use strict";

    // DOM Ready utility
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        } else {
            callback();
        }
    }

    // ============================================
    // 1. ACCESSIBILITY MANAGER
    // ============================================
    
    class AccessibilityManager {
        constructor() {
            this.trapFocus = true;
            this.skipLink = true;
            this.keyboardNav = true;
            this.highContrast = false;
            this.reduceMotion = false;
            this.init();
        }

        init() {
            this.checkReducedMotion();
            this.checkHighContrast();
            this.setupKeyboardNavigation();
            this.setupSkipLink();
            this.setupFocusTrap();
            this.setupScreenReaderAnnouncements();
        }

        checkReducedMotion() {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.reduceMotion = mediaQuery.matches;
            
            // Listen for changes
            mediaQuery.addEventListener('change', (e) => {
                this.reduceMotion = e.matches;
                this.applyReducedMotionSettings();
            });
        }

        checkHighContrast() {
            const mediaQuery = window.matchMedia('(prefers-contrast: high)');
            this.highContrast = mediaQuery.matches;
            
            // Listen for changes
            mediaQuery.addEventListener('change', (e) => {
                this.highContrast = e.matches;
                this.applyHighContrastSettings();
            });
        }

        applyReducedMotionSettings() {
            if (this.reduceMotion) {
                document.documentElement.style.setProperty('--er-animation-duration', '0ms');
                document.documentElement.style.setProperty('--er-transition-duration', '0ms');
            } else {
                document.documentElement.style.removeProperty('--er-animation-duration');
                document.documentElement.style.removeProperty('--er-transition-duration');
            }
        }

        applyHighContrastSettings() {
            if (this.highContrast) {
                document.documentElement.classList.add('high-contrast');
            } else {
                document.documentElement.classList.remove('high-contrast');
            }
        }

        setupKeyboardNavigation() {
            // Trap focus within modals and panels
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.handleTabNavigation(e);
                }
                
                if (e.key === 'Escape') {
                    this.handleEscapeKey(e);
                }
            });
        }

        handleTabNavigation(e) {
            if (this.trapFocus) {
                const focusableElements = document.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements.length === 0) return;
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
                
                if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        handleEscapeKey(e) {
            // Close modals and panels
            const modal = document.querySelector('.snapshot-modal.active');
            const effectsPanel = document.getElementById('effectsPanel');
            
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
            
            if (effectsPanel && effectsPanel.classList.contains('open')) {
                effectsPanel.classList.remove('open');
            }
            
            // Close mobile sidebar
            const sidebar = document.getElementById('mainSidebar');
            if (sidebar && sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                document.body.classList.remove('sidebar-open');
            }
        }

        setupSkipLink() {
            const skipLink = document.querySelector('.skip-link');
            if (!skipLink) return;
            
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.focus();
                    // Remove skip link after use
                    setTimeout(() => {
                        skipLink.style.top = '-40px';
                    }, 1000);
                }
            });
        }

        setupFocusTrap() {
            // Focus trap for modals and panels
            const modalElements = document.querySelectorAll('[role="dialog"], [role="dialog"]');
            modalElements.forEach(modal => {
                modal.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        this.trapFocusInElement(modal, e);
                    }
                });
            });
        }

        trapFocusInElement(element, e) {
            const focusableElements = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
            
            if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }

        setupScreenReaderAnnouncements() {
            // Create announcement container
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only-announcement';
            announcement.style.position = 'absolute';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.padding = '0';
            announcement.style.margin = '-1px';
            announcement.style.overflow = 'hidden';
            announcement.style.clip = 'rect(0, 0, 0, 0)';
            announcement.style.whiteSpace = 'nowrap';
            announcement.style.border = '0';
            
            document.body.appendChild(announcement);
            
            this.announcement = announcement;
        }

        announce(message) {
            if (this.announcement) {
                this.announcement.textContent = message;
            }
        }
    }

    // ============================================
    // 2. LOADING MANAGER
    // ============================================
    
    class LoadingManager {
        constructor() {
            this.loadingOverlay = document.getElementById('erLoadingOverlay');
            this.loadingText = document.querySelector('.loading-text');
            this.init();
        }

        init() {
            if (!this.loadingOverlay) return;
            
            // Hide loading overlay when page is fully loaded
            window.addEventListener('load', () => {
                this.hide();
            });
            
            // Hide loading overlay after 3 seconds (fallback)
            setTimeout(() => {
                if (this.loadingOverlay.style.display !== 'none') {
                    this.hide();
                }
            }, 3000);
        }

        show(message = 'Initializing ER Studio...') {
            if (this.loadingOverlay) {
                this.loadingText.textContent = message;
                this.loadingOverlay.classList.remove('hidden');
                this.loadingOverlay.style.display = 'flex';
            }
        }

        hide() {
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.add('hidden');
                setTimeout(() => {
                    this.loadingOverlay.style.display = 'none';
                }, 500);
            }
        }

        setText(message) {
            if (this.loadingText) {
                this.loadingText.textContent = message;
            }
        }
    }

    // ============================================
    // 3. ERROR HANDLER
    // ============================================
    
    class ErrorHandler {
        constructor() {
            this.errors = [];
            this.init();
        }

        init() {
            // Catch and log errors
            window.addEventListener('error', (e) => {
                this.handleError(e.error || e.message, 'window');
            });
            
            // Catch unhandled promise rejections
            window.addEventListener('unhandledrejection', (e) => {
                this.handleError(e.reason || 'Unknown error', 'promise');
            });
            
            // Listen for console errors
            this.interceptConsole();
        }

        handleError(error, source) {
            const errorInfo = {
                message: error.toString(),
                source: source,
                timestamp: new Date().toISOString(),
                stack: error.stack || null
            };
            
            this.errors.push(errorInfo);
            
            // Log to console
            console.error(`[ER Studio Error] ${source}:`, error);
            
            // Show user-friendly error message
            this.showUserError(error);
        }

        interceptConsole() {
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.error = (...args) => {
                originalError.apply(console, args);
                if (args[0]) {
                    this.handleError(args[0], 'console');
                }
            };
            
            console.warn = (...args) => {
                originalWarn.apply(console, args);
            };
        }

        showUserError(error) {
            const message = error.message || 'An unexpected error occurred';
            
            // Show toast notification
            this.showToast(message, 'error');
            
            // Log to analytics if available
            if (window.gtag) {
                gtag('event', 'error', {
                    error_message: message,
                    error_source: 'er-studio'
                });
            }
        }

        showToast(message, type = 'info') {
            // Create toast element
            const toast = document.createElement('div');
            toast.className = `er-toast er-toast-${type}`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');
            toast.textContent = message;
            
            // Add styles
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '16px 24px',
                backgroundColor: type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(78, 205, 196, 0.95)',
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: '10000',
                opacity: '0',
                transform: 'translateY(20px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '500',
                fontSize: '14px',
                maxWidth: '400px'
            });
            
            document.body.appendChild(toast);
            
            // Animate in
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0)';
            });
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 5000);
        }

        getErrorCount() {
            return this.errors.length;
        }

        getRecentErrors(limit = 5) {
            return this.errors.slice(-limit);
        }
    }

    // ============================================
    // 4. PERFORMANCE MONITOR
    // ============================================
    
    class PerformanceMonitor {
        constructor() {
            this.metrics = {};
            this.isMonitoring = false;
            this.init();
        }

        init() {
            // Start monitoring when page is idle
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => this.startMonitoring());
            } else {
                setTimeout(() => this.startMonitoring(), 100);
            }
        }

        startMonitoring() {
            if (this.isMonitoring) return;
            this.isMonitoring = true;
            
            // Monitor performance metrics
            this.monitorNavigationTiming();
            this.monitorResourceLoading();
            this.monitorLayoutShifts();
            this.monitorLongTasks();
            
            // Continue monitoring
            setInterval(() => this.monitorNavigationTiming(), 30000);
            setInterval(() => this.monitorResourceLoading(), 30000);
        }

        monitorNavigationTiming() {
            if (!window.performance || !window.performance.timing) return;
            
            const timing = window.performance.timing;
            const metrics = {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                firstPaint: 0,
                firstContentfulPaint: 0
            };
            
            // Get paint metrics
            if (window.performance.getEntriesByType) {
                const paintEntries = window.performance.getEntriesByType('paint');
                paintEntries.forEach(entry => {
                    if (entry.name === 'first-paint') {
                        metrics.firstPaint = entry.startTime;
                    }
                    if (entry.name === 'first-contentful-paint') {
                        metrics.firstContentfulPaint = entry.startTime;
                    }
                });
            }
            
            this.metrics.navigationTiming = metrics;
        }

        monitorResourceLoading() {
            if (!window.performance || !window.performance.getEntriesByType) return;
            
            const resources = window.performance.getEntriesByType('resource');
            const metrics = {
                totalResources: resources.length,
                totalSize: resources.reduce((sum, r) => sum + r.transferSize, 0),
                slowResources: 0,
                failedResources: 0
            };
            
            resources.forEach(resource => {
                if (resource.duration > 3000) {
                    metrics.slowResources++;
                }
            });
            
            this.metrics.resources = metrics;
        }

        monitorLayoutShifts() {
            if (!window.performance || !window.PerformanceObserver) return;
            
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry instanceof window.PerformanceLayoutShift && !entry.hadRecentInput) {
                            if (entry.value > 0.1) {
                                console.warn('[Performance] Large layout shift detected:', entry.value);
                            }
                        }
                    }
                });
                
                observer.observe({ type: 'layout-shift', buffered: true });
            } catch (e) {
                console.warn('[Performance] Could not monitor layout shifts:', e);
            }
        }

        monitorLongTasks() {
            if (!window.PerformanceObserver) return;
            
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.warn('[Performance] Long task detected:', entry.duration, 'ms');
                    }
                });
                
                observer.observe({ type: 'longtask', buffered: true });
            } catch (e) {
                console.warn('[Performance] Could not monitor long tasks:', e);
            }
        }

        getMetrics() {
            return {
                ...this.metrics,
                timestamp: new Date().toISOString()
            };
        }

        getPerformanceScore() {
            const metrics = this.metrics;
            let score = 100;
            
            // Deduct points for slow resources
            if (metrics.resources && metrics.resources.slowResources > 0) {
                score -= metrics.resources.slowResources * 5;
            }
            
            // Deduct points for slow navigation
            if (metrics.navigationTiming && metrics.navigationTiming.loadComplete > 3000) {
                score -= (metrics.navigationTiming.loadComplete - 3000) / 30;
            }
            
            return Math.max(0, Math.min(100, score));
        }
    }

    // ============================================
    // 5. INITIALIZATION
    // ============================================
    
    function initializeAccessibilityEnhancements() {
        // Create singleton instances
        const accessibility = new AccessibilityManager();
        const loading = new LoadingManager();
        const error = new ErrorHandler();
        const performance = new PerformanceMonitor();
        
        // Export to global scope for debugging
        window.WEBZONEBW_ER_ACCESSIBILITY = {
            accessibility,
            loading,
            error,
            performance,
            getMetrics: performance.getMetrics.bind(performance),
            getPerformanceScore: performance.getPerformanceScore.bind(performance)
        };
        
        console.log('[ER Studio] Accessibility enhancements initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAccessibilityEnhancements);
    } else {
        initializeAccessibilityEnhancements();
    }

})();
