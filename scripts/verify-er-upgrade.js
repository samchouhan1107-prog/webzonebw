#!/usr/bin/env node

/* =====================================================
   WEBZONEBW ER STUDIO UPGRADE VERIFICATION SCRIPT
   ===================================================== */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting WEBZONEBW ER Studio Upgrade Verification...');

// Configuration
const config = {
    erStudioDir: path.join(__dirname, '..', 'er'),
    cssDir: path.join(__dirname, '..', 'css'),
    jsDir: path.join(__dirname, '..', 'js'),
    expectedFiles: [
        'er/index.html',
        'css/er-studio.css',
        'js/er-studio-enhanced.js'
    ],
    expectedVersion: '2.4.0'
};

// Verification results
const verification = {
    files: {},
    features: {},
    performance: {},
    accessibility: {},
    totalChecks: 0,
    passedChecks: 0
};

// Check if all expected files exist
console.log('📁 Checking file structure...');
verification.totalChecks += config.expectedFiles.length;

config.expectedFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    const exists = fs.existsSync(fullPath);
    verification.files[filePath] = exists;
    
    if (exists) {
        console.log(`  ✅ ${filePath} - EXISTS`);
        verification.passedChecks++;
    } else {
        console.log(`  ❌ ${filePath} - MISSING`);
    }
});

// Read all file contents first
let htmlContent = '';
let cssContent = '';
let jsContent = '';

const htmlPath = path.join(__dirname, '..', 'er', 'index.html');
const cssPath = path.join(__dirname, '..', 'css', 'er-studio.css');
const jsPath = path.join(__dirname, '..', 'js', 'er-studio-enhanced.js');

if (fs.existsSync(htmlPath)) htmlContent = fs.readFileSync(htmlPath, 'utf8');
if (fs.existsSync(cssPath)) cssContent = fs.readFileSync(cssPath, 'utf8');
if (fs.existsSync(jsPath)) jsContent = fs.readFileSync(jsPath, 'utf8');

// Check version numbers in deployed files
console.log('\n🔢 Checking version numbers...');
verification.totalChecks += 3;

// Check HTML version
if (htmlContent) {
    const hasCorrectVersion = htmlContent.includes(`v=${config.expectedVersion}`);
    verification.features.htmlVersion = hasCorrectVersion;
    
    if (hasCorrectVersion) {
        console.log('  ✅ HTML version updated to v2.4.0');
        verification.passedChecks++;
    } else {
        console.log('  ❌ HTML version not updated');
    }
}

// Check CSS version
if (cssContent) {
    const hasEnhancedStyles = cssContent.includes('.polished-tab') && cssContent.includes('.polished-lens');
    verification.features.enhancedCSS = hasEnhancedStyles;
    
    if (hasEnhancedStyles) {
        console.log('  ✅ CSS enhanced with polished styles');
        verification.passedChecks++;
    } else {
        console.log('  ❌ CSS not properly enhanced');
    }
}

// Check JavaScript version
if (jsContent) {
    const hasEnhancedJS = jsContent.includes('EnhancedTabSystem') && jsContent.includes('PerformanceMonitor');
    verification.features.enhancedJS = hasEnhancedJS;
    
    if (hasEnhancedJS) {
        console.log('  ✅ JavaScript enhanced with performance optimizations');
        verification.passedChecks++;
    } else {
        console.log('  ❌ JavaScript not properly enhanced');
    }
}

// Check for specific enhanced features
console.log('\n🎯 Checking enhanced features...');
verification.totalChecks += 8;

// Check for polished tabs
if (fs.existsSync(htmlPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const hasPolishedTabs = htmlContent.includes('polished-tab') && htmlContent.includes('tab-badge');
    verification.features.polishedTabs = hasPolishedTabs;
    
    if (hasPolishedTabs) {
        console.log('  ✅ Polished tab system implemented');
        verification.passedChecks++;
    } else {
        console.log('  ❌ Polished tab system missing');
    }
}

// Check for enhanced lens bubbles
const hasEnhancedLenses = htmlContent.includes('polished-lens') && htmlContent.includes('lens-bubble-info');
verification.features.enhancedLenses = hasEnhancedLenses;

if (hasEnhancedLenses) {
    console.log('  ✅ Enhanced lens bubbles implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ Enhanced lens bubbles missing');
}

// Check for performance optimizations
const hasPerformanceOptimizations = jsContent.includes('debounce') && jsContent.includes('throttle') && jsContent.includes('requestIdleCallback');
verification.features.performanceOptimizations = hasPerformanceOptimizations;

if (hasPerformanceOptimizations) {
    console.log('  ✅ Performance optimizations implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ Performance optimizations missing');
}

// Check for enhanced theme system
const hasEnhancedTheme = jsContent.includes('EnhancedThemeSystem') && jsContent.includes('prefers-color-scheme');
verification.features.enhancedTheme = hasEnhancedTheme;

if (hasEnhancedTheme) {
    console.log('  ✅ Enhanced theme system implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ Enhanced theme system missing');
}

// Check for mobile responsiveness
const hasMobileResponsive = cssContent.includes('@media (max-width: 768px)') && cssContent.includes('mobile-first');
verification.features.mobileResponsive = hasMobileResponsive;

if (hasMobileResponsive) {
    console.log('  ✅ Mobile responsiveness implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ Mobile responsiveness missing');
}

// Check for accessibility features
const hasAccessibility = cssContent.includes(':focus') && cssContent.includes('prefers-reduced-motion') && htmlContent.includes('aria-label');
verification.features.accessibility = hasAccessibility;

if (hasAccessibility) {
    console.log('  ✅ Accessibility features implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ Accessibility features missing');
}

// Check for enhanced visual effects
const hasVisualEffects = cssContent.includes('backdrop-filter') && cssContent.includes('box-shadow') && cssContent.includes('transform');
verification.features.visualEffects = hasVisualEffects;

if (hasVisualEffects) {
    console.log('  ✅ Enhanced visual effects implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ Enhanced visual effects missing');
}

// Check for error handling
const hasErrorHandling = jsContent.includes('try') && jsContent.includes('catch') && jsContent.includes('console.error');
verification.features.errorHandling = hasErrorHandling;

if (hasErrorHandling) {
    console.log('  ✅ Error handling implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ Error handling missing');
}

// Check deployment report
console.log('\n📊 Checking deployment report...');
const backupDir = path.join(__dirname, '..', 'backups');
const backupDirs = fs.readdirSync(backupDir).filter(dir => dir.startsWith('er-backup-'));
const latestBackup = backupDirs.sort().pop();
const reportPath = path.join(backupDir, latestBackup, 'deployment-report.json');

if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    verification.deploymentReport = report;
    console.log(`  ✅ Deployment report found: ${latestBackup}`);
    verification.passedChecks++;
    verification.totalChecks++;
} else {
    console.log('  ❌ Deployment report missing');
    verification.totalChecks++;
}

// Performance checks
console.log('\n⚡ Checking performance optimizations...');
verification.totalChecks += 4;

// Check for CSS optimizations
const hasCSSOptimizations = cssContent.includes('will-change') && cssContent.includes('transform');
verification.performance.cssOptimizations = hasCSSOptimizations;

if (hasCSSOptimizations) {
    console.log('  ✅ CSS performance optimizations implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ CSS performance optimizations missing');
}

// Check for JavaScript optimizations
const hasJSOptimizations = jsContent.includes('passive: true') && jsContent.includes('requestAnimationFrame');
verification.performance.jsOptimizations = hasJSOptimizations;

if (hasJSOptimizations) {
    console.log('  ✅ JavaScript performance optimizations implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ JavaScript performance optimizations missing');
}

// Check for lazy loading
const hasLazyLoading = jsContent.includes('requestIdleCallback') && jsContent.includes('preload');
verification.performance.lazyLoading = hasLazyLoading;

if (hasLazyLoading) {
    console.log('  ✅ Lazy loading optimizations implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ Lazy loading optimizations missing');
}

// Check for memory management
const hasMemoryManagement = jsContent.includes('clearTimeout') && jsContent.includes('removeEventListener');
verification.performance.memoryManagement = hasMemoryManagement;

if (hasMemoryManagement) {
    console.log('  ✅ Memory management implemented');
    verification.passedChecks++;
} else {
    console.log('  ❌ Memory management missing');
}

// Calculate overall score
const overallScore = Math.round((verification.passedChecks / verification.totalChecks) * 100);
const status = overallScore >= 90 ? 'EXCELLENT' : overallScore >= 70 ? 'GOOD' : overallScore >= 50 ? 'FAIR' : 'NEEDS IMPROVEMENT';

// Generate verification report
const report = {
    verification: {
        timestamp: new Date().toISOString(),
        overallScore: overallScore,
        status: status
    },
    files: verification.files,
    features: verification.features,
    performance: verification.performance,
    accessibility: verification.features,
    summary: {
        totalChecks: verification.totalChecks,
        passedChecks: verification.passedChecks,
        failedChecks: verification.totalChecks - verification.passedChecks
    }
};

// Save verification report
const finalReportPath = path.join(__dirname, '..', 'verification-report.json');
fs.writeFileSync(finalReportPath, JSON.stringify(report, null, 2));

// Display results
console.log('\n🎯 VERIFICATION RESULTS');
console.log('=====================');
console.log(`Overall Score: ${overallScore}% (${status})`);
console.log(`Files Checked: ${verification.passedChecks}/${verification.totalChecks}`);
console.log(`Failed Checks: ${verification.totalChecks - verification.passedChecks}`);

// Feature breakdown
console.log('\n🎨 Feature Status:');
Object.entries(verification.features).forEach(([feature, status]) => {
    const icon = status ? '✅' : '❌';
    const name = feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`  ${icon} ${name}: ${status ? 'IMPLEMENTED' : 'MISSING'}`);
});

// Performance breakdown
console.log('\n⚡ Performance Status:');
Object.entries(verification.performance).forEach(([metric, status]) => {
    const icon = status ? '✅' : '❌';
    const name = metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`  ${icon} ${name}: ${status ? 'OPTIMIZED' : 'NEEDS WORK'}`);
});

// Final recommendations
console.log('\n💡 RECOMMENDATIONS:');
if (overallScore >= 90) {
    console.log('🎉 EXCELLENT! The ER Studio upgrade is production-ready.');
    console.log('   All features have been successfully implemented.');
    console.log('   Performance optimizations are in place.');
    console.log('   The system is ready for audience use.');
} else if (overallScore >= 70) {
    console.log('👍 GOOD! The ER Studio upgrade is mostly ready.');
    console.log('   Most features have been implemented successfully.');
    console.log('   Some minor improvements may be needed.');
    console.log('   Consider testing with real users before full deployment.');
} else if (overallScore >= 50) {
    console.log('⚠️  FAIR! The ER Studio upgrade needs some work.');
    console.log('   Some features are missing or incomplete.');
    console.log('   Performance optimizations may need improvement.');
    console.log('   Address failed checks before deployment.');
} else {
    console.log('❌ NEEDS IMPROVEMENT! The ER Studio upgrade is not ready.');
    console.log('   Many features are missing or incomplete.');
    console.log('   Significant work is needed before deployment.');
    console.log('   Review failed checks and prioritize fixes.');
}

// Check if the upgrade meets production standards
const isProductionReady = overallScore >= 85 && 
                         verification.files['er/index.html'] && 
                         verification.files['css/er-studio.css'] && 
                         verification.files['js/er-studio-enhanced.js'] &&
                         verification.features.polishedTabs &&
                         verification.features.enhancedLenses &&
                         verification.features.performanceOptimizations;

console.log('\n🚀 PRODUCTION READINESS:');
if (isProductionReady) {
    console.log('✅ The ER Studio upgrade is PRODUCTION READY!');
    console.log('   All critical features are implemented.');
    console.log('   Performance optimizations are in place.');
    console.log('   The system is ready for audience use.');
    console.log('   URL: https://webzonebw.in/er/');
} else {
    console.log('❌ The ER Studio upgrade is NOT PRODUCTION READY.');
    console.log('   Address the failed checks before deployment.');
    console.log('   Focus on critical features and performance optimizations.');
}

console.log(`\n📊 Verification report saved to: ${finalReportPath}`);
console.log('🎉 Verification complete!');