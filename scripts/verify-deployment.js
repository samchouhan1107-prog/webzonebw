#!/usr/bin/env node

/* ==========================================================
   WEBZONEBW-ER STUDIO - DEPLOYMENT VERIFICATION SCRIPT
   Quick Check for Camera-First Deployment Readiness
   ========================================================== */

"use strict";

const fs = require('fs');
const path = require('path');

class DeploymentVerifier {
  constructor() {
    this.results = {
      cameraSystem: false,
      errorHandling: false,
      workflowManager: false,
      deploymentScript: false,
      overall: false
    };
    
    this.issues = [];
    this.recommendations = [];
  }

  async runVerification() {
    console.log('🔍 Starting Deployment Verification...');
    console.log('='.repeat(50));
    
    await this.verifyCameraSystem();
    await this.verifyErrorHandling();
    await this.verifyWorkflowManager();
    await this.verifyDeploymentScript();
    
    this.generateReport();
    this.printResults();
  }

  async verifyCameraSystem() {
    console.log('\n🎥 Verifying Camera System...');
    
    try {
      const cameraFiles = [
        'js/halloween.js',
        'js/enhanced-studio-platform.js'
      ];
      
      const filesExist = cameraFiles.every(file => fs.existsSync(file));
      
      if (filesExist) {
        const halloweenContent = fs.readFileSync('js/halloween.js', 'utf8');
        const hasCameraInit = halloweenContent.includes('initCamera') || 
                             halloweenContent.includes('getUserMedia') ||
                             halloweenContent.includes('navigator.mediaDevices');
        
        if (hasCameraInit) {
          this.results.cameraSystem = true;
          console.log('✅ Camera system: Ready for deployment');
        } else {
          this.issues.push('Camera initialization functions missing');
          console.log('⚠️ Camera system: Functions not found');
        }
      } else {
        this.issues.push('Camera system files missing');
        console.log('❌ Camera system: Files missing');
      }
    } catch (error) {
      this.issues.push(`Camera system verification failed: ${error.message}`);
      console.log('❌ Camera system: Verification error');
    }
  }

  async verifyErrorHandling() {
    console.log('\n🚨 Verifying Error Handling...');
    
    try {
      const deploymentScript = 'scripts/deploy-camera-first.js';
      if (fs.existsSync(deploymentScript)) {
        const content = fs.readFileSync(deploymentScript, 'utf8');
        const hasErrorHandling = content.includes('CameraErrorHandler') || 
                                content.includes('handleError') ||
                                content.includes('errorResponse');
        
        if (hasErrorHandling) {
          this.results.errorHandling = true;
          console.log('✅ Error handling: Comprehensive system found');
        } else {
          this.issues.push('Error handling system incomplete');
          console.log('⚠️ Error handling: System incomplete');
        }
      } else {
        this.issues.push('Error handling script missing');
        console.log('❌ Error handling: Script missing');
      }
    } catch (error) {
      this.issues.push(`Error handling verification failed: ${error.message}`);
      console.log('❌ Error handling: Verification error');
    }
  }

  async verifyWorkflowManager() {
    console.log('\n🔄 Verifying Workflow Manager...');
    
    try {
      const deploymentScript = 'scripts/deploy-camera-first.js';
      if (fs.existsSync(deploymentScript)) {
        const content = fs.readFileSync(deploymentScript, 'utf8');
        const hasWorkflow = content.includes('CameraWorkflowManager') || 
                           content.includes('workflowManager') ||
                           content.includes('startWorkflow');
        
        if (hasWorkflow) {
          this.results.workflowManager = true;
          console.log('✅ Workflow manager: Camera-first workflow found');
        } else {
          this.issues.push('Workflow manager incomplete');
          console.log('⚠️ Workflow manager: System incomplete');
        }
      } else {
        this.issues.push('Workflow manager script missing');
        console.log('❌ Workflow manager: Script missing');
      }
    } catch (error) {
      this.issues.push(`Workflow manager verification failed: ${error.message}`);
      console.log('❌ Workflow manager: Verification error');
    }
  }

  async verifyDeploymentScript() {
    console.log('\n🚀 Verifying Deployment Script...');
    
    try {
      const script = 'scripts/deploy-camera-first.js';
      if (fs.existsSync(script)) {
        const content = fs.readFileSync(script, 'utf8');
        const hasDeployment = content.includes('CameraFirstDeployment') || 
                             content.includes('deploy()') ||
                             content.includes('pre-deployment');
        
        if (hasDeployment) {
          this.results.deploymentScript = true;
          console.log('✅ Deployment script: Complete system found');
        } else {
          this.issues.push('Deployment script incomplete');
          console.log('⚠️ Deployment script: System incomplete');
        }
      } else {
        this.issues.push('Deployment script missing');
        console.log('❌ Deployment script: Script missing');
      }
    } catch (error) {
      this.issues.push(`Deployment script verification failed: ${error.message}`);
      console.log('❌ Deployment script: Verification error');
    }
  }

  generateReport() {
    const passedChecks = Object.values(this.results).filter(Boolean).length;
    const totalChecks = Object.keys(this.results).length;
    const completionPercentage = Math.round((passedChecks / totalChecks) * 100);
    
    this.results.overall = completionPercentage >= 80;
    
    if (completionPercentage === 100) {
      this.recommendations.push('Ready for immediate deployment');
    } else if (completionPercentage >= 80) {
      this.recommendations.push('Ready for deployment with minor fixes');
    } else {
      this.recommendations.push('Address issues before deployment');
    }
    
    this.recommendations.push('Monitor deployment metrics');
    this.recommendations.push('Collect user feedback');
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🎯 DEPLOYMENT VERIFICATION RESULTS');
    console.log('='.repeat(50));
    
    const results = Object.entries(this.results);
    const passed = results.filter(([_, passed]) => passed).length;
    const total = results.length;
    
    console.log(`\n📊 Overall Completion: ${passed}/${total} (${Math.round((passed/total)*100)}%)`);
    console.log(`🎯 Deployment Status: ${this.results.overall ? '✅ READY FOR DEPLOYMENT' : '❌ NEEDS WORK'}`);
    
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
    console.log('='.repeat(50));
  }
}

// Run the verification
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  verifier.runVerification().catch(console.error);
}

module.exports = DeploymentVerifier;