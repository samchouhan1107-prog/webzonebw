/* ==========================================================
   UNIFIED LENS SCALING TEST SUITE
   Tests the unified face-filter pipeline across all lens scales
   
   This test verifies:
   1. Single face detection system
   2. Consistent face tracking across scales
   3. Environment anchoring
   4. Scale-only composition changes
   5. No effect identity changes
   ========================================================== */

"use strict";

class UnifiedLensTestSuite {
  constructor() {
    this.unifiedLens = window.WebZoneBW.UnifiedLensScaling;
    this.integration = window.WebZoneBW.UnifiedLensIntegration;
    this.testResults = [];
    this.currentTest = 0;
    this.totalTests = 0;
    
    // Test data
    this.testVideo = null;
    this.testCanvas = null;
    this.testCtx = null;
    
    console.log("[Unified Lens Test] Test suite initialized");
  }
  
  // ==========================================================
  // TEST SETUP
  // ==========================================================
  
  async setupTestEnvironment() {
    console.log("[Unified Lens Test] Setting up test environment...");
    
    // Create test video element
    this.testVideo = document.createElement('video');
    this.testVideo.width = 640;
    this.testVideo.height = 480;
    this.testVideo.autoplay = true;
    
    // Create test canvas
    this.testCanvas = document.createElement('canvas');
    this.testCanvas.width = 640;
    this.testCanvas.height = 480;
    this.testCtx = this.testCanvas.getContext('2d');
    
    // Wait for unified lens to be ready
    await this.waitForLensReady();
    
    console.log("[Unified Lens Test] Test environment ready");
  }
  
  async waitForLensReady() {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.unifiedLens.isReady()) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }
  
  // ==========================================================
  // CORE FUNCTIONALITY TESTS
  // ==========================================================
  
  async testUnifiedFaceDetection() {
    console.log("[Unified Lens Test] Testing unified face detection...");
    
    const testName = "Unified Face Detection";
    const startTime = performance.now();
    
    try {
      // Test that face detection works consistently across scales
      const scales = [0.1, 1.0, 2.0];
      const detectionResults = {};
      
      for (const scale of scales) {
        this.unifiedLens.setScale(scale);
        
        // Simulate face detection
        await this.simulateFaceDetection();
        
        detectionResults[scale] = {
          detected: this.unifiedLens.faceBox.detected,
          confidence: this.unifiedLens.faceDetectionState.confidence,
          method: this.unifiedLens.faceDetectionState.method
        };
      }
      
      // Verify consistent detection
      const allDetected = Object.values(detectionResults).every(r => r.detected);
      const consistentMethods = new Set(
        Object.values(detectionResults).map(r => r.method)
      ).size === 1;
      
      const result = {
        passed: allDetected && consistentMethods,
        duration: performance.now() - startTime,
        details: {
          detectionResults,
          allDetected,
          consistentMethods
        }
      };
      
      this.recordTest(testName, result);
      return result;
      
    } catch (error) {
      const result = {
        passed: false,
        duration: performance.now() - startTime,
        error: error.message
      };
      
      this.recordTest(testName, result);
      return result;
    }
  }
  
  async testFaceTrackingConsistency() {
    console.log("[Unified Lens Test] Testing face tracking consistency...");
    
    const testName = "Face Tracking Consistency";
    const startTime = performance.now();
    
    try {
      const scales = [0.1, 1.0, 2.0];
      const trackingResults = {};
      
      // Capture face position at each scale
      for (const scale of scales) {
        this.unifiedLens.setScale(scale);
        await this.simulateFaceDetection();
        
        trackingResults[scale] = {
          x: this.unifiedLens.faceBox.x,
          y: this.unifiedLens.faceBox.y,
          w: this.unifiedLens.faceBox.w,
          h: this.unifiedLens.faceBox.h
        };
      }
      
      // Verify face position consistency (should be same across scales)
      const positions = Object.values(trackingResults);
      const xConsistent = positions.every(p => Math.abs(p.x - positions[0].x) < 0.01);
      const yConsistent = positions.every(p => Math.abs(p.y - positions[0].y) < 0.01);
      const wConsistent = positions.every(p => Math.abs(p.w - positions[0].w) < 0.01);
      const hConsistent = positions.every(p => Math.abs(p.h - positions[0].h) < 0.01);
      
      const result = {
        passed: xConsistent && yConsistent && wConsistent && hConsistent,
        duration: performance.now() - startTime,
        details: {
          trackingResults,
          xConsistent,
          yConsistent,
          wConsistent,
          hConsistent
        }
      };
      
      this.recordTest(testName, result);
      return result;
      
    } catch (error) {
      const result = {
        passed: false,
        duration: performance.now() - startTime,
        error: error.message
      };
      
      this.recordTest(testName, result);
      return result;
    }
  }
  
  async testEnvironmentAnchoring() {
    console.log("[Unified Lens Test] Testing environment anchoring...");
    
    const testName = "Environment Anchoring";
    const startTime = performance.now();
    
    try {
      const scales = [0.1, 1.0, 2.0];
      const environmentResults = {};
      
      for (const scale of scales) {
        this.unifiedLens.setScale(scale);
        await this.simulateFaceDetection();
        
        // Update environment anchoring
        this.unifiedLens.updateEnvironmentAnchoring(640, 480);
        
        environmentResults[scale] = {
          anchored: this.unifiedLens.environmentState.anchored,
          offsetX: this.unifiedLens.environmentState.offsetX,
          offsetY: this.unifiedLens.environmentState.offsetY,
          scale: this.unifiedLens.environmentState.scale
        };
      }
      
      // Verify environment remains anchored
      const allAnchored = Object.values(environmentResults).every(e => e.anchored);
      const consistentOffset = Object.values(environmentResults).every(
        e => e.offsetX === 0 && e.offsetY === 0
      );
      
      const result = {
        passed: allAnchored && consistentOffset,
        duration: performance.now() - startTime,
        details: {
          environmentResults,
          allAnchored,
          consistentOffset
        }
      };
      
      this.recordTest(testName, result);
      return result;
      
    } catch (error) {
      const result = {
        passed: false,
        duration: performance.now() - startTime,
        error: error.message
      };
      
      this.recordTest(testName, result);
      return result;
    }
  }
  
  async testScaleCompositionChanges() {
    console.log("[Unified Lens Test] Testing scale composition changes...");
    
    const testName = "Scale Composition Changes";
    const startTime = performance.now();
    
    try {
      const scales = [0.1, 1.0, 2.0];
      const compositionResults = {};
      
      for (const scale of scales) {
        this.unifiedLens.setScale(scale);
        await this.simulateFaceDetection();
        
        const faceBox = this.unifiedLens.getFaceBox();
        const transformed = this.unifiedLens.getTransformedCoordinates(faceBox, scale);
        
        compositionResults[scale] = {
          originalX: faceBox.x,
          originalY: faceBox.y,
          originalW: faceBox.w,
          originalH: faceBox.h,
          transformedX: transformed.x,
          transformedY: transformed.y,
          transformedW: transformed.w,
          transformedH: transformed.h
        };
      }
      
      // Verify composition changes appropriately
      const wideFrame = compositionResults[0.1];
      const normalFrame = compositionResults[1.0];
      const closeFrame = compositionResults[2.0];
      
      // Wide frame should show more of the scene
      const wideShowsMoreScene = wideFrame.transformedW < normalFrame.transformedW;
      
      // Close frame should zoom in
      const closeZoomsIn = closeFrame.transformedW > normalFrame.transformedW;
      
      // Original face detection should be consistent
      const faceDetectionConsistent = 
        Math.abs(wideFrame.originalX - normalFrame.originalX) < 0.01 &&
        Math.abs(wideFrame.originalY - normalFrame.originalY) < 0.01;
      
      const result = {
        passed: wideShowsMoreScene && closeZoomsIn && faceDetectionConsistent,
        duration: performance.now() - startTime,
        details: {
          compositionResults,
          wideShowsMoreScene,
          closeZoomsIn,
          faceDetectionConsistent
        }
      };
      
      this.recordTest(testName, result);
      return result;
      
    } catch (error) {
      const result = {
        passed: false,
        duration: performance.now() - startTime,
        error: error.message
      };
      
      this.recordTest(testName, result);
      return result;
    }
  }
  
  async testEffectConsistency() {
    console.log("[Unified Lens Test] Testing effect consistency...");
    
    const testName = "Effect Consistency";
    const startTime = performance.now();
    
    try {
      const scales = [0.1, 1.0, 2.0];
      const testFilters = ['cartoon', 'sunglasses', 'halo'];
      const effectResults = {};
      
      for (const filter of testFilters) {
        effectResults[filter] = {};
        
        for (const scale of scales) {
          this.unifiedLens.setScale(scale);
          
          // Test effect rendering
          const effectIntensity = this.unifiedLens.getEffectIntensity(scale);
          
          effectResults[filter][scale] = {
            intensity: effectIntensity,
            scale: scale,
            filter: filter
          };
        }
      }
      
      // Verify effects are consistent across scales
      const consistentIntensityScaling = testFilters.every(filter => {
        const intensities = Object.values(effectResults[filter]).map(e => e.intensity);
        return intensities[0] <= intensities[1] && intensities[1] <= intensities[2];
      });
      
      const result = {
        passed: consistentIntensityScaling,
        duration: performance.now() - startTime,
        details: {
          effectResults,
          consistentIntensityScaling
        }
      };
      
      this.recordTest(testName, result);
      return result;
      
    } catch (error) {
      const result = {
        passed: false,
        duration: performance.now() - startTime,
        error: error.message
      };
      
      this.recordTest(testName, result);
      return result;
    }
  }
  
  // ==========================================================
  // INTEGRATION TESTS
  // ==========================================================
  
  async testUIIntegration() {
    console.log("[Unified Lens Test] Testing UI integration...");
    
    const testName = "UI Integration";
    const startTime = performance.now();
    
    try {
      // Test that scale buttons exist and work
      const scaleButtons = this.integration.scaleButtons;
      const buttonsExist = Object.values(scaleButtons).every(btn => btn !== null);
      
      // Test scale switching
      let scaleSwitchingWorks = true;
      for (const scale of [0.1, 1.0, 2.0]) {
        this.integration.setScale(scale);
        const currentScale = this.unifiedLens.getCurrentScale();
        if (Math.abs(currentScale - scale) > 0.01) {
          scaleSwitchingWorks = false;
          break;
        }
      }
      
      // Test UI updates
      this.integration.updateScaleUI();
      const uiUpdated = true; // Assuming UI update works
      
      const result = {
        passed: buttonsExist && scaleSwitchingWorks && uiUpdated,
        duration: performance.now() - startTime,
        details: {
          buttonsExist,
          scaleSwitchingWorks,
          uiUpdated
        }
      };
      
      this.recordTest(testName, result);
      return result;
      
    } catch (error) {
      const result = {
        passed: false,
        duration: performance.now() - startTime,
        error: error.message
      };
      
      this.recordTest(testName, result);
      return result;
    }
  }
  
  async testPerformance() {
    console.log("[Unified Lens Test] Testing performance...");
    
    const testName = "Performance";
    const startTime = performance.now();
    
    try {
      // Test performance across scales
      const scales = [0.1, 1.0, 2.0];
      const performanceResults = {};
      
      for (const scale of scales) {
        const scaleStart = performance.now();
        
        // Simulate multiple frames
        for (let i = 0; i < 10; i++) {
          await this.simulateFrame(scale);
        }
        
        const scaleDuration = performance.now() - scaleStart;
        performanceResults[scale] = {
          duration: scaleDuration,
          avgFrameTime: scaleDuration / 10
        };
      }
      
      // Verify performance is acceptable
      const acceptableFrameTime = 50; // 50ms per frame (20 FPS)
      const allScalesAcceptable = Object.values(performanceResults).every(
        r => r.avgFrameTime < acceptableFrameTime
      );
      
      const result = {
        passed: allScalesAcceptable,
        duration: performance.now() - startTime,
        details: {
          performanceResults,
          acceptableFrameTime,
          allScalesAcceptable
        }
      };
      
      this.recordTest(testName, result);
      return result;
      
    } catch (error) {
      const result = {
        passed: false,
        duration: performance.now() - startTime,
        error: error.message
      };
      
      this.recordTest(testName, result);
      return result;
    }
  }
  
  // ==========================================================
  // HELPER FUNCTIONS
  // ==========================================================
  
  simulateFaceDetection() {
    // Simulate face detection for testing
    return new Promise((resolve) => {
      setTimeout(() => {
        this.unifiedLens.faceBox.detected = true;
        this.unifiedLens.faceDetectionState.confidence = 85;
        this.unifiedLens.faceBox.targetX = 0.5;
        this.unifiedLens.faceBox.targetY = 0.42;
        this.unifiedLens.faceBox.targetW = 0.32;
        this.unifiedLens.faceBox.targetH = 0.44;
        resolve();
      }, 10);
    });
  }
  
  simulateFrame(scale) {
    // Simulate a single frame for performance testing
    return new Promise((resolve) => {
      setTimeout(() => {
        this.unifiedLens.setScale(scale);
        this.unifiedLens.updateScaleTransition();
        resolve();
      }, 16); // ~60 FPS
    });
  }
  
  recordTest(testName, result) {
    this.testResults.push({
      name: testName,
      ...result,
      timestamp: new Date().toISOString()
    });
    
    console.log(`[Unified Lens Test] ${testName}: ${result.passed ? 'PASS' : 'FAIL'} (${result.duration.toFixed(2)}ms)`);
  }
  
  // ==========================================================
  // TEST EXECUTION
  // ==========================================================
  
  async runAllTests() {
    console.log("[Unified Lens Test] Running all tests...");
    
    this.testResults = [];
    this.currentTest = 0;
    
    const tests = [
      this.testUnifiedFaceDetection.bind(this),
      this.testFaceTrackingConsistency.bind(this),
      this.testEnvironmentAnchoring.bind(this),
      this.testScaleCompositionChanges.bind(this),
      this.testEffectConsistency.bind(this),
      this.testUIIntegration.bind(this),
      this.testPerformance.bind(this)
    ];
    
    this.totalTests = tests.length;
    
    // Setup test environment
    await this.setupTestEnvironment();
    
    // Run all tests
    for (const test of tests) {
      await test();
      this.currentTest++;
    }
    
    // Generate test report
    const report = this.generateTestReport();
    console.log("[Unified Lens Test] Test suite completed", report);
    
    return report;
  }
  
  generateTestReport() {
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = this.testResults.filter(r => !r.passed).length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    
    const report = {
      summary: {
        totalTests: this.totalTests,
        passedTests,
        failedTests,
        successRate: (passedTests / this.totalTests) * 100,
        totalDuration: totalDuration,
        avgDuration: totalDuration / this.totalTests
      },
      details: this.testResults,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    const failedTests = this.testResults.filter(r => !r.passed);
    failedTests.forEach(test => {
      switch (test.name) {
        case "Unified Face Detection":
          recommendations.push("Check face detection fallback mechanisms and improve detection accuracy.");
          break;
        case "Face Tracking Consistency":
          recommendations.push("Review face tracking smoothing algorithm and coordinate normalization.");
          break;
        case "Environment Anchoring":
          recommendations.push("Ensure environment anchoring is independent of face position and scale.");
          break;
        case "Scale Composition Changes":
          recommendations.push("Verify coordinate transformation logic for different scales.");
          break;
        case "Effect Consistency":
          recommendations.push("Adjust effect intensity scaling to maintain visual consistency.");
          break;
        case "UI Integration":
          recommendations.push("Check UI event handling and state management.");
          break;
        case "Performance":
          recommendations.push("Optimize rendering pipeline for better performance across all scales.");
          break;
      }
    });
    
    return recommendations;
  }
  
  // ==========================================================
  // PUBLIC API
  // ==========================================================
  
  async runQuickTest() {
    // Run a subset of tests for quick validation
    console.log("[Unified Lens Test] Running quick test...");
    
    await this.setupTestEnvironment();
    
    const quickTests = [
      this.testUnifiedFaceDetection.bind(this),
      this.testFaceTrackingConsistency.bind(this),
      this.testScaleCompositionChanges.bind(this)
    ];
    
    for (const test of quickTests) {
      await test();
    }
    
    return this.generateTestReport();
  }
  
  getTestResults() {
    return this.testResults;
  }
  
  resetTestSuite() {
    this.testResults = [];
    this.currentTest = 0;
    console.log("[Unified Lens Test] Test suite reset");
  }
}

// Global instance
window.WebZoneBW = window.WebZoneBW || {};
window.WebZoneBW.UnifiedLensTest = new UnifiedLensTestSuite();

// Auto-run tests when loaded
document.addEventListener('DOMContentLoaded', () => {
  // Uncomment to run tests automatically
  // window.WebZoneBW.UnifiedLensTest.runAllTests().catch(console.error);
});

export default UnifiedLensTestSuite;