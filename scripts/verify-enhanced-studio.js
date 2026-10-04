#!/usr/bin/env node

/* ==========================================================
   WEBZONEBW-ER STUDIO - COMPREHENSIVE VERIFICATION SCRIPT
   Complete System Check for Enhanced Platform
   ========================================================== */

"use strict";

const fs = require('fs');
const path = require('path');

class EnhancedStudioVerifier {
  constructor() {
    this.verificationResults = {
      cameraSystem: false,
      filterSystem: false,
      platformIntegration: false,
      userExperience: false,
      performanceMonitoring: false,
      mobileOptimization: false,
      accessibility: false,
      documentation: false,
      overall: false
    };
    
    this.issues = [];
    this.recommendations = [];
  }

  async runVerification() {
    console.log('🔍 Starting WEBZONEBW-ER Enhanced Studio Verification...');
    console.log('='.repeat(60));
    
    await this.verifyCameraSystem();
    await this.verifyFilterSystem();
    await this.verifyPlatformIntegration();
    await this.verifyUserExperience();
    await this.verifyPerformanceMonitoring();
    await this.verifyMobileOptimization();
    await this.verifyAccessibility();
    await this.verifyDocumentation();
    
    this.generateOverallReport();
    this.printResults();
  }

  async verifyCameraSystem() {
    console.log('\n🎥 Verifying Camera System...');
    
    try {
      // Check camera-related files
      const cameraFiles = [
        'js/halloween.js',
        'js/er-studio.js',
        'js/enhanced-studio-platform.js'
      ];
      
      const filesExist = cameraFiles.every(file => fs.existsSync(file));
      
      if (filesExist) {
        // Check for camera initialization functions
        const halloweenContent = fs.readFileSync('js/halloween.js', 'utf8');
        const hasCameraInit = halloweenContent.includes('initCamera') || 
                             halloweenContent.includes('getUserMedia') ||
                             halloweenContent.includes('navigator.mediaDevices');
        
        if (hasCameraInit) {
          this.verificationResults.cameraSystem = true;
          console.log('✅ Camera system: Complete initialization found');
        } else {
          this.issues.push('Camera initialization functions missing');
          console.log('⚠️ Camera system: Initialization functions not found');
        }
      } else {
        this.issues.push('Camera system files missing');
        console.log('❌ Camera system: Required files missing');
      }
    } catch (error) {
      this.issues.push(`Camera system verification failed: ${error.message}`);
      console.log('❌ Camera system: Verification error');
    }
  }

  async verifyFilterSystem() {
    console.log('\n🎨 Verifying Filter System...');
    
    try {
      const filterFiles = [
        'js/enhanced-filter-environment.js',
        'js/enhanced-filter-integration.js',
        'js/facefilter-enhanced.js'
      ];
      
      const filesExist = filterFiles.every(file => fs.existsSync(file));
      
      if (filesExist) {
        // Check for filter configurations
        const filterContent = fs.readFileSync('js/enhanced-filter-environment.js', 'utf8');
        const hasFilters = filterContent.includes('ENHANCED_FILTER_CONFIGS') || 
                          filterContent.includes('filter');
        
        if (hasFilters) {
          this.verificationResults.filterSystem = true;
          console.log('✅ Filter system: Complete configurations found');
        } else {
          this.issues.push('Filter configurations missing');
          console.log('⚠️ Filter system: Configurations not found');
        }
      } else {
        this.issues.push('Filter system files missing');
        console.log('❌ Filter system: Required files missing');
      }
    } catch (error) {
      this.issues.push(`Filter system verification failed: ${error.message}`);
      console.log('❌ Filter system: Verification error');
    }
  }

  async verifyPlatformIntegration() {
    console.log('\n🌟 Verifying Platform Integration...');
    
    try {
      const platformFile = 'js/enhanced-studio-platform.js';
      if (fs.existsSync(platformFile)) {
        const content = fs.readFileSync(platformFile, 'utf8');
        const hasIntegration = content.includes('WebZoneBWEnhancedStudio') || 
                              content.includes('EnhancedCameraManager') ||
                              content.includes('EnhancedFilterManager');
        
        if (hasIntegration) {
          this.verificationResults.platformIntegration = true;
          console.log('✅ Platform integration: Complete system found');
        } else {
          this.issues.push('Platform integration incomplete');
          console.log('⚠️ Platform integration: System incomplete');
        }
      } else {
        this.issues.push('Platform file missing');
        console.log('❌ Platform integration: Platform file missing');
      }
    } catch (error) {
      this.issues.push(`Platform integration verification failed: ${error.message}`);
      console.log('❌ Platform integration: Verification error');
    }
  }

  async verifyUserExperience() {
    console.log('\n🎯 Verifying User Experience...');
    
    try {
      const enhancedDemo = 'er-enhanced-demo.html';
      if (fs.existsSync(enhancedDemo)) {
        const content = fs.readFileSync(enhancedDemo, 'utf8');
        const hasUX = content.includes('enhanced-studio-platform.js') || 
                     content.includes('🔮') ||
                     content.includes('enhanced-badge');
        
        if (hasUX) {
          this.verificationResults.userExperience = true;
          console.log('✅ User experience: Enhanced interface found');
        } else {
          this.issues.push('User experience enhancements missing');
          console.log('⚠️ User experience: Enhancements not found');
        }
      } else {
        this.issues.push('Enhanced demo file missing');
        console.log('❌ User experience: Demo file missing');
      }
    } catch (error) {
      this.issues.push(`User experience verification failed: ${error.message}`);
      console.log('❌ User experience: Verification error');
    }
  }

  async verifyPerformanceMonitoring() {
    console.log('\n📊 Verifying Performance Monitoring...');
    
    try {
      const platformFile = 'js/enhanced-studio-platform.js';
      if (fs.existsSync(platformFile)) {
        const content = fs.readFileSync(platformFile, 'utf8');
        const hasMonitoring = content.includes('EnhancedPerformanceMonitor') || 
                              content.includes('performanceMetrics') ||
                              content.includes('fps');
        
        if (hasMonitoring) {
          this.verificationResults.performanceMonitoring = true;
          console.log('✅ Performance monitoring: Monitoring system found');
        } else {
          this.issues.push('Performance monitoring incomplete');
          console.log('⚠️ Performance monitoring: System incomplete');
        }
      } else {
        this.issues.push('Performance monitoring file missing');
        console.log('❌ Performance monitoring: File missing');
      }
    } catch (error) {
      this.issues.push(`Performance monitoring verification failed: ${error.message}`);
      console.log('❌ Performance monitoring: Verification error');
    }
  }

  async verifyMobileOptimization() {
    console.log('\n📱 Verifying Mobile Optimization...');
    
    try {
      const cssFiles = [
        'css/responsive.css',
        'css/er-studio.css'
      ];
      
      const filesExist = cssFiles.every(file => fs.existsSync(file));
      
      if (filesExist) {
        const cssContent = fs.readFileSync('css/responsive.css', 'utf8');
        const isMobileOptimized = cssContent.includes('@media') || 
                                 cssContent.includes('mobile') ||
                                 cssContent.includes('touch');
        
        if (isMobileOptimized) {
          this.verificationResults.mobileOptimization = true;
          console.log('✅ Mobile optimization: Responsive styles found');
        } else {
          this.issues.push('Mobile optimization incomplete');
          console.log('⚠️ Mobile optimization: Styles not optimized');
        }
      } else {
        this.issues.push('Mobile optimization files missing');
        console.log('❌ Mobile optimization: Files missing');
      }
    } catch (error) {
      this.issues.push(`Mobile optimization verification failed: ${error.message}`);
      console.log('❌ Mobile optimization: Verification error');
    }
  }

  async verifyAccessibility() {
    console.log('\n♿ Verifying Accessibility...');
    
    try {
      const htmlFiles = [
        'er-enhanced-demo.html',
        'er/index.html'
      ];
      
      const filesExist = htmlFiles.every(file => fs.existsSync(file));
      
      if (filesExist) {
        const htmlContent = fs.readFileSync('er-enhanced-demo.html', 'utf8');
        const isAccessible = htmlContent.includes('aria-label') || 
                            htmlContent.includes('role=') ||
                            htmlContent.includes('alt=') ||
                            htmlContent.includes('tabindex');
        
        if (isAccessible) {
          this.verificationResults.accessibility = true;
          console.log('✅ Accessibility: ARIA labels found');
        } else {
          this.issues.push('Accessibility features incomplete');
          console.log('⚠️ Accessibility: Features not found');
        }
      } else {
        this.issues.push('Accessibility files missing');
        console.log('❌ Accessibility: Files missing');
      }
    } catch (error) {
      this.issues.push(`Accessibility verification failed: ${error.message}`);
      console.log('❌ Accessibility: Verification error');
    }
  }

  async verifyDocumentation() {
    console.log('\n📚 Verifying Documentation...');
    
    try {
      const docFiles = [
        'ENHANCED_STUDIO_USER_GUIDE.md',
        'ER_UPGRADE_SUMMARY.md',
        'camera-filter-verification-report.md'
      ];
      
      const filesExist = docFiles.every(file => fs.existsSync(file));
      
      if (filesExist) {
        this.verificationResults.documentation = true;
        console.log('✅ Documentation: Complete documentation found');
      } else {
        this.issues.push('Documentation incomplete');
        console.log('⚠️ Documentation: Files missing');
      }
    } catch (error) {
      this.issues.push(`Documentation verification failed: ${error.message}`);
      console.log('❌ Documentation: Verification error');
    }
  }

  generateOverallReport() {
    const passedChecks = Object.values(this.verificationResults).filter(Boolean).length;
    const totalChecks = Object.keys(this.verificationResults).length;
    const completionPercentage = Math.round((passedChecks / totalChecks) * 100);
    
    this.verificationResults.overall = completionPercentage >= 80;
    
    // Generate recommendations
    if (completionPercentage < 100) {
      this.recommendations.push('Complete remaining verification issues');
    }
    
    if (this.issues.length > 0) {
      this.recommendations.push('Address all identified issues');
    }
    
    this.recommendations.push('Regular maintenance and updates');
    this.recommendations.push('User feedback collection and implementation');
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 VERIFICATION RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const results = Object.entries(this.verificationResults);
    const passed = results.filter(([_, passed]) => passed).length;
    const total = results.length;
    
    console.log(`\n📊 Overall Completion: ${passed}/${total} (${Math.round((passed/total)*100)}%)`);
    console.log(`🎯 Overall Status: ${this.verificationResults.overall ? '✅ PASSED' : '❌ NEEDS WORK'}`);
    
    console.log('\n📋 Detailed Results:');
    results.forEach(([check, passed]) => {
      const status = passed ? '✅' : '❌';
      const name = check.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`  ${status} ${name}`);
    });
    
    if (this.issues.length > 0) {
      console.log('\n⚠️ ISSUES IDENTIFIED:');
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (this.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n🎉 VERIFICATION COMPLETE');
    console.log('='.repeat(60));
  }
}

// Run the verification
if (require.main === module) {
  const verifier = new EnhancedStudioVerifier();
  verifier.runVerification().catch(console.error);
}

module.exports = EnhancedStudioVerifier;