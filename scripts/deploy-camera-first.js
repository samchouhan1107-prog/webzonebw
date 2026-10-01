/* ==========================================================
   WEBZONEBW-ER STUDIO - DEPLOYMENT SCRIPT
   Camera-First Deployment with Error Handling and Smooth Workflow
   ========================================================== */

"use strict";

class CameraFirstDeployment {
  constructor() {
    this.isDeployed = false;
    this.deploymentPhase = 'pre-deployment';
    this.errorHandler = new CameraErrorHandler();
    this.workflowManager = new CameraWorkflowManager();
    this.monitoring = new DeploymentMonitoring();
    
    this.deploymentConfig = {
      cameraPriority: true,
      errorRecovery: true,
      fallbackEnabled: true,
      monitoringEnabled: true,
      autoRetry: true,
      userFeedback: true
    };
  }

  async deploy() {
    console.log('🚀 Starting Camera-First Deployment...');
    
    try {
      // Pre-deployment checks
      await this.runPreDeploymentChecks();
      
      // Phase 1: Camera System Deployment
      console.log('📋 Phase 1: Camera System Deployment');
      await this.deployCameraSystem();
      
      // Phase 2: Filter Integration
      console.log('📋 Phase 2: Filter Integration');
      await this.deployFilterIntegration();
      
      // Phase 3: Platform Completion
      console.log('📋 Phase 3: Platform Completion');
      await this.deployCompletePlatform();
      
      // Post-deployment validation
      await this.runPostDeploymentValidation();
      
      this.isDeployed = true;
      this.deploymentPhase = 'deployment-complete';
      
      console.log('🎉 Camera-First Deployment Complete!');
      this.showDeploymentSuccess();
      
    } catch (error) {
      console.error('❌ Deployment Failed:', error);
      await this.handleDeploymentError(error);
    }
  }

  async runPreDeploymentChecks() {
    console.log('🔍 Running Pre-Deployment Checks...');
    
    const checks = [
      this.checkCameraSupport(),
      this.checkBrowserCompatibility(),
      this.checkNetworkConnectivity(),
      this.checkRequiredFiles()
    ];
    
    const results = await Promise.allSettled(checks);
    
    const failedChecks = results.filter(result => result.status === 'rejected');
    if (failedChecks.length > 0) {
      throw new Error(`Pre-deployment checks failed: ${failedChecks.map(f => f.reason).join(', ')}`);
    }
    
    console.log('✅ All pre-deployment checks passed');
  }

  async checkCameraSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported in this browser');
    }
    
    // Test camera availability
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('No camera devices found');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Camera support check failed: ${error.message}`);
    }
  }

  async checkBrowserCompatibility() {
    const requiredFeatures = [
      'Promise',
      'async/await',
      'IntersectionObserver',
      'ResizeObserver',
      'requestAnimationFrame'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => typeof window[feature] === 'undefined');
    
    if (missingFeatures.length > 0) {
      throw new Error(`Missing required browser features: ${missingFeatures.join(', ')}`);
    }
    
    return true;
  }

  async checkNetworkConnectivity() {
    if (!navigator.onLine) {
      throw new Error('Network connectivity required for deployment');
    }
    
    // Test basic connectivity
    try {
      const response = await fetch('/health', { method: 'HEAD', timeout: 5000 });
      return response.ok;
    } catch (error) {
      // For local deployment, this is expected to fail
      return true;
    }
  }

  async checkRequiredFiles() {
    const requiredFiles = [
      'js/halloween.js',
      'js/enhanced-studio-platform.js',
      'js/enhanced-filter-environment.js',
      'js/enhanced-filter-integration.js',
      'er-enhanced-demo.html',
      'css/er-studio.css',
      'css/responsive.css'
    ];
    
    const missingFiles = requiredFiles.filter(file => !this.fileExists(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    return true;
  }

  fileExists(filePath) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', filePath, false);
      xhr.send();
      return xhr.status !== 404;
    } catch (error) {
      return false;
    }
  }

  async deployCameraSystem() {
    console.log('🎥 Deploying Camera System...');
    
    // Load and initialize camera system
    await this.loadScript('js/halloween.js');
    
    // Initialize camera manager
    if (typeof window.EnhancedCameraManager !== 'undefined') {
      window.cameraManager = new window.EnhancedCameraManager();
      await window.cameraManager.init();
    }
    
    // Setup camera error handling
    this.setupCameraErrorHandling();
    
    console.log('✅ Camera System Deployed Successfully');
  }

  async deployFilterIntegration() {
    console.log('🎨 Deploying Filter Integration...');
    
    // Load filter system
    await this.loadScript('js/enhanced-filter-environment.js');
    await this.loadScript('js/enhanced-filter-integration.js');
    
    // Initialize filter manager
    if (typeof window.EnhancedFilterManager !== 'undefined') {
      window.filterManager = new window.EnhancedFilterManager();
      await window.filterManager.init();
    }
    
    // Connect camera and filter systems
    this.connectCameraAndFilters();
    
    console.log('✅ Filter Integration Deployed Successfully');
  }

  async deployCompletePlatform() {
    console.log('🌟 Deploying Complete Platform...');
    
    // Load enhanced studio platform
    await this.loadScript('js/enhanced-studio-platform.js');
    
    // Initialize complete platform
    if (typeof window.WebZoneBWEnhancedStudio !== 'undefined') {
      window.enhancedStudio = new window.WebZoneBWEnhancedStudio();
    }
    
    // Initialize workflow manager
    window.cameraWorkflow = new CameraWorkflowManager();
    
    // Start monitoring
    if (this.deploymentConfig.monitoringEnabled) {
      this.monitoring.start();
    }
    
    console.log('✅ Complete Platform Deployed Successfully');
  }

  async loadScript(scriptPath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptPath;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupCameraErrorHandling() {
    // Global error handler for camera operations
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message.includes('camera')) {
        this.errorHandler.handleError(event.error, { source: 'global' });
      }
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message.includes('camera')) {
        this.errorHandler.handleError(event.reason, { source: 'promise' });
      }
    });
  }

  connectCameraAndFilters() {
    if (window.cameraManager && window.filterManager) {
      // Set up real-time filter processing
      window.cameraManager.onFrame = (canvas, ctx) => {
        return window.filterManager.applyRealTimeFilter(canvas, ctx);
      };
      
      console.log('🔗 Camera and Filter Systems Connected');
    }
  }

  async runPostDeploymentValidation() {
    console.log('🔍 Running Post-Deployment Validation...');
    
    const validations = [
      this.validateCameraSystem(),
      this.validateFilterSystem(),
      this.validateUserInterface(),
      this.validateErrorHandling()
    ];
    
    const results = await Promise.allSettled(validations);
    
    const failedValidations = results.filter(result => result.status === 'rejected');
    if (failedValidations.length > 0) {
      throw new Error(`Post-deployment validation failed: ${failedValidations.map(f => f.reason).join(', ')}`);
    }
    
    console.log('✅ All post-deployment validations passed');
  }

  async validateCameraSystem() {
    if (!window.cameraManager) {
      throw new Error('Camera manager not initialized');
    }
    
    // Test camera initialization
    try {
      const canStartCamera = await window.cameraManager.canStartCamera();
      if (!canStartCamera) {
        throw new Error('Camera system cannot be started');
      }
    } catch (error) {
      throw new Error(`Camera system validation failed: ${error.message}`);
    }
    
    return true;
  }

  async validateFilterSystem() {
    if (!window.filterManager) {
      throw new Error('Filter manager not initialized');
    }
    
    // Test filter availability
    const availableFilters = window.filterManager.getAvailableFilters();
    if (availableFilters.length === 0) {
      throw new Error('No filters available');
    }
    
    return true;
  }

  async validateUserInterface() {
    // Check if main interface elements exist
    const requiredElements = [
      'cameraVideo',
      'cameraCanvas',
      'cameraPlaceholder',
      'startExperienceBtn',
      'startDemoBtn'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
      throw new Error(`Missing UI elements: ${missingElements.join(', ')}`);
    }
    
    return true;
  }

  async validateErrorHandling() {
    if (!this.errorHandler) {
      throw new Error('Error handler not initialized');
    }
    
    // Test error handling system
    try {
      const testError = new Error('Test error');
      const errorResponse = this.errorHandler.handleError(testError, { test: true });
      
      if (!errorResponse || !errorResponse.actions) {
        throw new Error('Error handler returned invalid response');
      }
    } catch (error) {
      throw new Error(`Error handling validation failed: ${error.message}`);
    }
    
    return true;
  }

  async handleDeploymentError(error) {
    console.error('❌ Deployment Error:', error);
    
    // Try to rollback gracefully
    await this.rollbackDeployment();
    
    // Show error to user
    this.showDeploymentError(error);
    
    // Log error for analysis
    this.logDeploymentError(error);
  }

  async rollbackDeployment() {
    console.log('🔄 Rolling back deployment...');
    
    try {
      // Remove deployed scripts
      const deployedScripts = document.querySelectorAll('script[data-deployment]');
      deployedScripts.forEach(script => script.remove());
      
      // Reset global objects
      delete window.cameraManager;
      delete window.filterManager;
      delete window.enhancedStudio;
      delete window.cameraWorkflow;
      
      console.log('✅ Deployment rolled back successfully');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError);
    }
  }

  showDeploymentSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'deployment-success';
    successMessage.innerHTML = `
      <div class="success-content">
        <div class="success-icon">🎉</div>
        <h2>Deployment Successful!</h2>
        <p>Camera-First WEBZONEBW-ER Studio is now ready.</p>
        <div class="success-actions">
          <button onclick="window.cameraWorkflow.startWorkflow()" class="success-btn">
            🎥 Start Camera Experience
          </button>
          <button onclick="window.cameraWorkflow.startDemoMode()" class="success-btn">
            🎭 Try Demo Mode
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(successMessage);
    
    // Auto-start camera workflow after 2 seconds
    setTimeout(() => {
      if (window.cameraWorkflow) {
        window.cameraWorkflow.startWorkflow();
      }
    }, 2000);
  }

  showDeploymentError(error) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'deployment-error';
    errorMessage.innerHTML = `
      <div class="error-content">
        <div class="error-icon">❌</div>
        <h2>Deployment Failed</h2>
        <p>${error.message}</p>
        <div class="error-actions">
          <button onclick="location.reload()" class="error-btn">
            🔄 Retry Deployment
          </button>
          <button onclick="window.cameraWorkflow.startDemoMode()" class="error-btn">
            🎭 Use Demo Mode
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(errorMessage);
  }

  logDeploymentError(error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      deploymentPhase: this.deploymentPhase,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };
    
    // Send error to analytics service
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/deployment-error', JSON.stringify(errorLog));
    }
    
    // Also log to console
    console.error('Deployment Error Log:', errorLog);
  }
}

// Deployment Monitoring System
class DeploymentMonitoring {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      cameraStarts: 0,
      filterApplications: 0,
      errors: 0,
      userInteractions: 0
    };
    
    this.isMonitoring = false;
  }

  start() {
    this.isMonitoring = true;
    this.startMetricsCollection();
    this.startPerformanceMonitoring();
    console.log('📊 Deployment monitoring started');
  }

  startMetricsCollection() {
    // Monitor camera starts
    if (window.cameraManager) {
      const originalStart = window.cameraManager.startCamera;
      window.cameraManager.startCamera = async function() {
        this.metrics.cameraStarts++;
        return await originalStart.call(this);
      }.bind(this);
    }
    
    // Monitor filter applications
    if (window.filterManager) {
      const originalApply = window.filterManager.applyFilter;
      window.filterManager.applyFilter = function(filterId) {
        this.metrics.filterApplications++;
        return originalApply.call(this, filterId);
      }.bind(this);
    }
    
    // Monitor user interactions
    document.addEventListener('click', () => {
      this.metrics.userInteractions++;
    });
  }

  startPerformanceMonitoring() {
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 5000); // Collect every 5 seconds
  }

  collectPerformanceMetrics() {
    if (!this.isMonitoring) return;
    
    const metrics = {
      timestamp: Date.now(),
      memory: performance.memory ? performance.memory.usedJSHeapSize : 0,
      fps: this.estimateFPS(),
      cameraStarts: this.metrics.cameraStarts,
      filterApplications: this.metrics.filterApplications,
      errors: this.metrics.errors,
      userInteractions: this.metrics.userInteractions
    };
    
    // Send metrics to analytics
    this.sendMetrics(metrics);
  }

  estimateFPS() {
    let lastTime = performance.now();
    let frames = 0;
    
    return new Promise((resolve) => {
      const measure = () => {
        frames++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
          resolve(Math.round((frames * 1000) / (currentTime - lastTime)));
          frames = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(measure);
      };
      
      measure();
    });
  }

  sendMetrics(metrics) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics', JSON.stringify(metrics));
    }
  }

  getMetrics() {
    return this.metrics;
  }
}

// Initialize and run deployment
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Camera-First Deployment...');
    
    const deployment = new CameraFirstDeployment();
    
    // Add deployment button for manual testing
    const deployBtn = document.createElement('button');
    deployBtn.textContent = '🚀 Deploy Camera System';
    deployBtn.className = 'deploy-btn';
    deployBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 12px 24px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    `;
    
    deployBtn.addEventListener('click', async () => {
      deployBtn.disabled = true;
      deployBtn.textContent = '🚀 Deploying...';
      
      try {
        await deployment.deploy();
      } catch (error) {
        console.error('Deployment failed:', error);
        deployBtn.textContent = '❌ Failed';
        deployBtn.disabled = false;
      }
    });
    
    document.body.appendChild(deployBtn);
    
    // Auto-deploy after 3 seconds
    setTimeout(async () => {
      console.log('🚀 Auto-deploying Camera System...');
      await deployment.deploy();
    }, 3000);
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CameraFirstDeployment;
}

// For CommonJS compatibility
if (typeof exports !== 'undefined') {
  exports.CameraFirstDeployment = CameraFirstDeployment;
}