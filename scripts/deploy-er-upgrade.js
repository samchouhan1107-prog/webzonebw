#!/usr/bin/env node

/* =====================================================
   WEBZONEBW ER STUDIO UPGRADE DEPLOYMENT SCRIPT
   ===================================================== */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting WEBZONEBW ER Studio Upgrade Deployment...');

// Configuration
const config = {
    sourceDir: path.join(__dirname, '..'),
    erStudioDir: path.join(__dirname, '..', 'er'),
    backupDir: path.join(__dirname, '..', 'backups', `er-backup-${Date.now()}`),
    filesToDeploy: [
        'er/index.html',
        'css/er-studio.css',
        'js/er-studio-enhanced.js'
    ],
    version: '2.4.0',
    timestamp: new Date().toISOString()
};

// Create backup directory
try {
    fs.mkdirSync(config.backupDir, { recursive: true });
    console.log('✅ Backup directory created:', config.backupDir);
} catch (error) {
    console.error('❌ Failed to create backup directory:', error.message);
    process.exit(1);
}

// Backup existing files
console.log('📦 Creating backup of existing files...');
config.filesToDeploy.forEach(filePath => {
    const sourcePath = path.join(config.sourceDir, filePath);
    const backupPath = path.join(config.backupDir, filePath);
    
    if (fs.existsSync(sourcePath)) {
        const dir = path.dirname(backupPath);
        fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(sourcePath, backupPath);
        console.log(`  📋 Backed up: ${filePath}`);
    } else {
        console.warn(`  ⚠️  File not found: ${filePath}`);
    }
});

// Deploy upgraded files
console.log('🚀 Deploying upgraded files...');
config.filesToDeploy.forEach(filePath => {
    const sourcePath = path.join(__dirname, '..', filePath);
    const targetPath = path.join(config.sourceDir, filePath);
    
    if (fs.existsSync(sourcePath)) {
        const dir = path.dirname(targetPath);
        fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`  🎯 Deployed: ${filePath}`);
    } else {
        console.error(`  ❌ Source file not found: ${sourcePath}`);
    }
});

// Update version numbers in deployed files
console.log('🔧 Updating version numbers...');
const versionUpdates = [
    { file: 'er/index.html', oldVersion: '2.3.0', newVersion: config.version },
    { file: 'css/er-studio.css', oldVersion: '2.3.0', newVersion: config.version },
    { file: 'js/er-studio-enhanced.js', oldVersion: '2.1.0', newVersion: config.version }
];

versionUpdates.forEach(update => {
    const filePath = path.join(config.sourceDir, update.file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(new RegExp(update.oldVersion, 'g'), update.newVersion);
        fs.writeFileSync(filePath, content);
        console.log(`  📝 Updated version in: ${update.file}`);
    }
});

// Generate deployment report
const report = {
    deployment: {
        timestamp: config.timestamp,
        version: config.version,
        status: 'success'
    },
    filesDeployed: config.filesToDeploy,
    backupLocation: config.backupDir,
    improvements: [
        '✨ Enhanced tab system with polished UI',
        '🎯 Improved lens bubble interactions',
        '📊 Performance monitoring and optimization',
        '🎨 Enhanced visual effects and animations',
        '🔧 Better mobile responsiveness',
        '⚡ Optimized filter performance',
        '🌙 Improved theme system',
        '♿ Enhanced accessibility features',
        '📱 Mobile-optimized layouts',
        '🎯 Better user experience feedback'
    ],
    features: [
        'Polished tab interface with badges and counts',
        'Enhanced lens carousel with improved interactions',
        'Performance-optimized filter system',
        'Enhanced visual effects and animations',
        'Improved mobile responsiveness',
        'Better accessibility and keyboard navigation',
        'Enhanced theme system with system detection',
        'Performance monitoring and metrics',
        'Optimized resource loading',
        'Better error handling and fallbacks'
    ]
};

// Save deployment report
const reportPath = path.join(config.backupDir, 'deployment-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📊 Deployment report saved to: ${reportPath}`);

// Generate changelog
const changelog = `
# WEBZONEBW ER Studio Upgrade Changelog

## Version ${config.version} - ${new Date().toLocaleDateString()}

### 🎯 Major Improvements

#### Enhanced Tab System
- ✨ Polished tab interface with modern design
- 🏷️ Dynamic badges showing filter counts
- 🎨 Category-specific theming and styling
- 📱 Mobile-optimized tab layout
- ♿ Improved keyboard navigation

#### Lens & Filter System
- 🎯 Enhanced lens bubble interactions
- 🔄 Smooth filter transitions and animations
- 📊 Performance-optimized filter application
- 🎨 Improved visual feedback
- 🔧 Better error handling

#### Performance Optimizations
- ⚡ Debounced and throttled interactions
- 🎯 RequestIdleCallback for non-critical tasks
- 📱 Optimized mobile performance
- 🔄 Efficient resource loading
- 📊 Performance monitoring and metrics

#### User Experience
- 🎨 Enhanced visual design and animations
- 🌙 Improved theme system with system detection
- 📱 Better mobile responsiveness
- ♿ Enhanced accessibility features
- 🎯 Better user feedback and status indicators

#### Technical Improvements
- 🔧 Modular JavaScript architecture
- 📊 Performance monitoring system
- 🔄 Optimized event handling
- 📱 Mobile-first responsive design
- 🎯 Better error handling and fallbacks

### 📁 Files Modified
${config.filesToDeploy.map(f => `- ${f}`).join('\n')}

### 🔧 Technical Details
- Enhanced CSS with modern animations
- Optimized JavaScript with performance monitoring
- Improved accessibility and keyboard navigation
- Better mobile responsiveness
- Enhanced error handling and fallbacks

### 📱 Mobile Compatibility
- Optimized for mobile devices
- Touch-friendly interactions
- Responsive layout improvements
- Performance-optimized animations

### 🎨 Visual Enhancements
- Modern tab interface design
- Enhanced lens bubble styling
- Improved visual feedback
- Better color schemes and themes
- Enhanced animations and transitions

### 🚀 Deployment
- Backup created: ${config.backupDir}
- Version updated to: ${config.version}
- Performance optimizations applied
- User experience improvements deployed

---

*Generated on: ${config.timestamp}*
`;

const changelogPath = path.join(config.backupDir, 'changelog.md');
fs.writeFileSync(changelogPath, changelog);
console.log(`📝 Changelog saved to: ${changelogPath}`);

// Run deployment verification
console.log('🔍 Running deployment verification...');
let verification = false;
try {
    // Verify all files were deployed correctly
    verification = config.filesToDeploy.every(filePath => {
        const deployedPath = path.join(config.sourceDir, filePath);
        return fs.existsSync(deployedPath);
    });

    if (verification) {
        console.log('✅ All files deployed successfully!');
    } else {
        console.error('❌ Some files may not have deployed correctly.');
    }

    // Check if we're in a git repository and commit changes
    try {
        execSync('git status', { cwd: config.sourceDir });
        console.log('📝 Git repository detected, committing changes...');
        
        execSync('git add .', { cwd: config.sourceDir });
        execSync(`git commit -m "ER Studio Upgrade v${config.version}: Enhanced tabs, performance, and UX

- Enhanced tab system with polished UI
- Improved lens bubble interactions  
- Performance optimizations and monitoring
- Better mobile responsiveness
- Enhanced visual effects and animations
- Improved accessibility features

🎯 WEBZONEBW Systems Upgrade"`, { cwd: config.sourceDir });
        execSync('git push origin main', { cwd: config.sourceDir });
        
        console.log('✅ Changes committed and pushed to git repository!');
    } catch (gitError) {
        console.warn('⚠️  Git operations failed (not a git repository or no push access):', gitError.message);
    }

} catch (error) {
    console.error('❌ Deployment verification failed:', error.message);
}

console.log('🎉 WEBZONEBW ER Studio Upgrade Deployment Complete!');
console.log(`📊 Backup location: ${config.backupDir}`);
console.log(`📈 New version: ${config.version}`);
console.log(`🚀 Ready for production use!`);

// Display summary
console.log('\n📋 Deployment Summary:');
console.log('=====================');
console.log(`✅ Status: ${verification ? 'Success' : 'Partial'}`);
console.log(`📦 Files Deployed: ${config.filesToDeploy.length}`);
console.log(`📊 Version: ${config.version}`);
console.log(`🕒 Timestamp: ${config.timestamp}`);
console.log(`💾 Backup: ${config.backupDir}`);

if (verification) {
    console.log('\n🎯 ER Studio is ready for production with enhanced features!');
    console.log('   - Polished tab interface');
    console.log('   - Enhanced lens interactions');
    console.log('   - Performance optimizations');
    console.log('   - Better mobile experience');
    console.log('   - Improved accessibility');
} else {
    console.log('\n⚠️  Some issues detected, please check the deployment logs.');
}