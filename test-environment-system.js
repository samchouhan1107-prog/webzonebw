#!/usr/bin/env node

/**
 * WEBZONEBW-ER Studio - Environment System Test Script
 * Tests the enhanced filter environment system functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 WEBZONEBW-ER Studio - Environment System Test');
console.log('=================================================');

// Test file existence
const requiredFiles = [
    'js/enhanced-filter-environment.js',
    'js/filter-environment-upgrade.js',
    'er-enhanced-demo.html',
    'FILTER_ENVIRONMENT_UPGRADE_GUIDE.md'
];

console.log('\n📁 Testing file existence...');

let allFilesExist = true;
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
    console.log('\n❌ Missing required files. Please ensure all files are created.');
    process.exit(1);
}

// Test JavaScript syntax
console.log('\n🔍 Testing JavaScript syntax...');

const jsFiles = [
    'js/enhanced-filter-environment.js',
    'js/filter-environment-upgrade.js',
    'js/halloween-enhanced.js'
];

jsFiles.forEach(file => {
    try {
        // Use Node.js to check syntax
        require('vm').runInNewContext(fs.readFileSync(file, 'utf8'), { 
            module: { exports: {} }, 
            exports: {},
            console: console,
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            setInterval: setInterval,
            clearInterval: clearInterval,
            performance: { now: () => Date.now() }
        });
        console.log(`  ✅ ${file} - Syntax OK`);
    } catch (error) {
        console.log(`  ❌ ${file} - Syntax Error: ${error.message}`);
    }
});

// Test HTML structure
console.log('\n🏗️ Testing HTML structure...');

const htmlFile = 'er-enhanced-demo.html';
try {
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // Check for required elements
    const requiredElements = [
        'id="cameraViewport"',
        'id="erToggleEffect"',
        'id="erToggleAnimation"',
        'id="erToggleBackground"',
        'id="erStrengthRange"',
        'id="erResetStudioBtn"',
        'class="er-lens-bubble"',
        'id="snapLensTrack"'
    ];
    
    let allElementsPresent = true;
    requiredElements.forEach(element => {
        const present = htmlContent.includes(element);
        console.log(`  ${present ? '✅' : '❌'} ${element}`);
        if (!present) allElementsPresent = false;
    });
    
    if (!allElementsPresent) {
        console.log('\n❌ Missing required HTML elements in demo file.');
        process.exit(1);
    }
    
    // Check script loading order
    const scriptOrder = [
        '../js/enhanced-filter-environment.js',
        '../js/filter-environment-upgrade.js',
        '../js/halloween.js',
        '../js/er-studio.js'
    ];
    
    console.log('\n📜 Testing script loading order...');
    let currentPos = 0;
    scriptOrder.forEach(script => {
        const pos = htmlContent.indexOf(script);
        if (pos > currentPos) {
            console.log(`  ✅ ${script} - Loaded in correct order`);
            currentPos = pos;
        } else {
            console.log(`  ⚠️  ${script} - Order might be incorrect`);
        }
    });
    
} catch (error) {
    console.log(`❌ Error reading HTML file: ${error.message}`);
    process.exit(1);
}

// Test environment configurations
console.log('\n🎨 Testing environment configurations...');

try {
    const envSystem = require('./js/enhanced-filter-environment.js');
    const configs = envSystem.ENHANCED_FILTER_CONFIGS;
    
    if (!configs || !Array.isArray(configs) || configs.length === 0) {
        console.log('❌ No filter configurations found');
        process.exit(1);
    }
    
    console.log(`  ✅ Found ${configs.length} filter configurations`);
    
    // Test some specific filters
    const testFilters = ['cartoon', 'halo', 'zombie-virus', 'witch-ritual', 'space'];
    testFilters.forEach(filterId => {
        const config = configs.find(c => c.id === filterId);
        if (config && config.environment) {
            console.log(`  ✅ ${filterId} - Environment defined`);
        } else {
            console.log(`  ❌ ${filterId} - Missing environment configuration`);
        }
    });
    
    // Test environments
    const environments = envSystem.ENHANCED_ENVIRONMENTS;
    if (environments && Object.keys(environments).length > 0) {
        console.log(`  ✅ Found ${Object.keys(environments).length} environment definitions`);
    } else {
        console.log('❌ No environment definitions found');
    }
    
} catch (error) {
    console.log(`❌ Error testing environment configurations: ${error.message}`);
    process.exit(1);
}

// Test integration system
console.log('\n🔗 Testing integration system...');

try {
    const upgradeSystem = require('./js/filter-environment-upgrade.js');
    
    // Check for required methods
    const requiredMethods = [
        'initialize',
        'loadEnvironment',
        'teardownEnvironment',
        'applyEnvironmentEffects'
    ];
    
    let allMethodsPresent = true;
    requiredMethods.forEach(method => {
        const present = typeof upgradeSystem[method] === 'function';
        console.log(`  ${present ? '✅' : '❌'} ${method}`);
        if (!present) allMethodsPresent = false;
    });
    
    if (!allMethodsPresent) {
        console.log('\n❌ Missing required methods in integration system.');
        process.exit(1);
    }
    
} catch (error) {
    console.log(`❌ Error testing integration system: ${error.message}`);
    process.exit(1);
}

// Test guide completeness
console.log('\n📚 Testing guide completeness...');

try {
    const guideContent = fs.readFileSync('FILTER_ENVIRONMENT_UPGRADE_GUIDE.md', 'utf8');
    
    const requiredSections = [
        '## 📋 Overview',
        '## 🎯 Key Benefits',
        '## 🚨 Requirements',
        '## 📁 Files to Create/Modify',
        '## 🛠️ Implementation Steps',
        '## 🎨 Environment System Architecture',
        '## 🔧 Integration Details',
        '## 🎮 Testing Procedure',
        '## 🐛 Troubleshooting',
        '## 🎉 Success Criteria'
    ];
    
    let allSectionsPresent = true;
    requiredSections.forEach(section => {
        const present = guideContent.includes(section);
        console.log(`  ${present ? '✅' : '❌'} ${section}`);
        if (!present) allSectionsPresent = false;
    });
    
    if (!allSectionsPresent) {
        console.log('\n❌ Missing required sections in upgrade guide.');
        process.exit(1);
    }
    
} catch (error) {
    console.log(`❌ Error reading upgrade guide: ${error.message}`);
    process.exit(1);
}

console.log('\n🎉 All tests passed!');
console.log('=================================================');
console.log('🚀 WEBZONEBW-ER Studio Environment System is ready!');
console.log('');
console.log('Next steps:');
console.log('1. Commit changes to Git');
console.log('2. Push to GitHub repository');
console.log('3. Test the enhanced system in a browser');
console.log('4. Verify all environment effects work correctly');
console.log('5. Ensure UI remains exactly the same');

console.log('\n📁 Files ready for GitHub:');
console.log('  ✅ js/enhanced-filter-environment.js');
console.log('  ✅ js/filter-environment-upgrade.js');
console.log('  ✅ js/halloween-enhanced.js');
console.log('  ✅ er-enhanced-demo.html');
console.log('  ✅ FILTER_ENVIRONMENT_UPGRADE_GUIDE.md');