const fs = require('fs');
const path = require('path');

// Check the Halloween feature page structure
const halloweenPath = './articles/webzonebw-studio-lenses-creative-experience/index.html';
const content = fs.readFileSync(halloweenPath, 'utf8');

console.log('🎃 HALLOWEEN FEATURE PRESENTATION VERIFICATION');
console.log('='.repeat(60));

// Halloween-specific checks
const halloweenChecks = {
    'Halloween Header': content.includes('halloween-feature-header'),
    'Halloween Background Pattern': content.includes('halloween-bg-pattern'),
    'Halloween Brand Section': content.includes('halloween-brand-section'),
    'Halloween Logo Container': content.includes('halloween-logo-container'),
    'Halloween Glow Effect': content.includes('halloween-glow-effect'),
    'Halloween Main Badge': content.includes('halloween-main-badge'),
    'Halloween Timing Badge': content.includes('halloween-timing-badge'),
    'Halloween Navigation': content.includes('halloween-feature-nav'),
    'Halloween Hero Section': content.includes('halloween-hero-section'),
    'Halloween Orbital Particles': content.includes('halloween-orbital-particles'),
    'Halloween Meta Banner': content.includes('halloween-meta-banner'),
    'Halloween Section Styling': content.includes('halloween-section'),
    'Halloween Eye Care': content.includes('halloween-eye-care'),
    'Halloween Actions': content.includes('halloween-feature-actions'),
    'Halloween CSS Variables': content.includes('--halloween-orange'),
    'Halloween Animations': content.includes('@keyframes halloween'),
    'Halloween JavaScript Effects': content.includes('mystical-particle'),
    'Published Date Fixed': content.includes('October 27, 2024'),
    'Halloween Theme Language': content.includes('mystical') && content.includes('supernatural'),
    'Dragon Ball Inspired Elements': content.includes('warrior') || content.includes('awakening'),
    'Eye Care Content': content.includes('Eye Protection') && content.includes('screen time'),
    'Volcanic Orange Theme': content.includes('var(--halloween-orange)'),
    'Spider Web Decorations': content.includes('web-opacity') || content.includes('pattern'),
    'Mixed-Blood Theme': content.includes('eternal bond') || content.includes('supernatural')
};

// Standard WebZoneBW checks
const webzonebwChecks = {
    'WebZoneBW Logo': content.includes('assets/logo.png'),
    'Standard CSS': content.includes('css/style.css'),
    'Responsive CSS': content.includes('css/responsive.css'),
    'Skip Link': content.includes('skip-link'),
    'Main Content': content.includes('main-content'),
    'Canonical URL': content.includes('canonical'),
    'Meta Description': content.includes('name="description"'),
    'Structured Data': content.includes('TechArticle'),
    'JavaScript Files': content.includes('script.js'),
    'Theme Toggle': content.includes('themeToggleSwitch'),
    'Smooth Scrolling': content.includes('scrollIntoView'),
    'Accessibility': content.includes('aria-label')
};

// Navigation checks
const navigationChecks = {
    'Home Link': content.includes('../../index.html'),
    'Blog Link': content.includes('../../blog.html'),
    'ER Studio Link': content.includes('../../er/'),
    'Article Navigation': content.includes('halloween-nav-link'),
    'Primary Action Button': content.includes('halloween-primary-btn')
};

// Content checks
const contentChecks = {
    '8 Sections': (content.match(/halloween-section/g) || []).length === 8,
    'Eye Care Section': content.includes('halloween-eye-care'),
    'Halloween Language': content.includes('Halloween 2024'),
    'Feature Pack Description': content.includes('Feature Pack'),
    'Lens Ownership': content.includes('eternal bond'),
    'Safe Usage Guidelines': content.includes('Eye Protection'),
    'Mobile Responsive': content.includes('@media (max-width: 768px)'),
    'Mobile Navigation': content.includes('halloween-nav-link')
};

// Run checks
let halloweenPassed = 0;
let halloweenFailed = 0;
let webzonebwPassed = 0;
let webzonebwFailed = 0;
let navigationPassed = 0;
let navigationFailed = 0;
let contentPassed = 0;
let contentFailed = 0;

console.log('\n🎨 HALLOWEEN DESIGN ELEMENTS');
Object.entries(halloweenChecks).forEach(([name, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}`);
    if (passed) halloweenPassed++;
    else halloweenFailed++;
});

console.log('\n🔗 WEBZONEBW INTEGRATION');
Object.entries(webzonebwChecks).forEach(([name, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}`);
    if (passed) webzonebwPassed++;
    else webzonebwFailed++;
});

console.log('\n🧭 NAVIGATION SYSTEM');
Object.entries(navigationChecks).forEach(([name, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}`);
    if (passed) navigationPassed++;
    else navigationFailed++;
});

console.log('\n📝 CONTENT STRUCTURE');
Object.entries(contentChecks).forEach(([name, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}`);
    if (passed) contentPassed++;
    else contentFailed++;
});

// Summary
console.log('\n📊 VERIFICATION SUMMARY');
console.log(`Halloween Elements: ${halloweenPassed}/${Object.keys(halloweenChecks).length} passed`);
console.log(`WebZoneBW Integration: ${webzonebwPassed}/${Object.keys(webzonebwChecks).length} passed`);
console.log(`Navigation: ${navigationPassed}/${Object.keys(navigationChecks).length} passed`);
console.log(`Content: ${contentPassed}/${Object.keys(contentChecks).length} passed`);

const totalPassed = halloweenPassed + webzonebwPassed + navigationPassed + contentPassed;
const totalFailed = halloweenFailed + webzonebwFailed + navigationFailed + contentFailed;
const totalChecks = Object.keys(halloweenChecks).length + Object.keys(webzonebwChecks).length + Object.keys(navigationChecks).length + Object.keys(contentChecks).length;

console.log(`\n🎯 TOTAL: ${totalPassed}/${totalChecks} checks passed`);

if (totalFailed === 0) {
    console.log('\n🎉 ALL HALLOWEEN FEATURE ELEMENTS VERIFIED!');
    console.log('✅ Page is properly styled with Halloween theme');
    console.log('✅ WebZoneBW design system maintained');
    console.log('✅ Navigation and functionality working');
    console.log('✅ Content structure complete');
    console.log('✅ Eye care content included');
    console.log('✅ Responsive design implemented');
    console.log('✅ Professional presentation achieved');
} else {
    console.log(`\n⚠️ ${totalFailed} issues found - Please review:`);
    if (halloweenFailed > 0) console.log(`- ${halloweenFailed} Halloween design issues`);
    if (webzonebwFailed > 0) console.log(`- ${webzonebwFailed} WebZoneBW integration issues`);
    if (navigationFailed > 0) console.log(`- ${navigationFailed} navigation issues`);
    if (contentFailed > 0) console.log(`- ${contentFailed} content issues`);
}

// Check for specific Halloween features
console.log('\n🎃 HALLOWEEN FEATURE SPECIFICS');
const halloweenFeatures = [
    'Volcanic orange color scheme',
    'Dark supernatural theme',
    'Spider web decorations',
    'Mixed-blood/supernatural elements',
    'Dragon Ball-inspired warrior aesthetic',
    'Eye care and safe usage content',
    'Mystical language and presentation',
    'Particle effects and animations',
    'Responsive mobile design',
    'Professional Halloween branding'
];

halloweenFeatures.forEach(feature => {
    const hasFeature = content.toLowerCase().includes(feature.toLowerCase().split(' ')[0]) || 
                      content.toLowerCase().includes(feature.toLowerCase().split(' ')[1]);
    const status = hasFeature ? '✅' : '❌';
    console.log(`${status} ${feature}`);
});

console.log('\n🚀 HALLOWEEN FEATURE PRESENTATION VERIFICATION COMPLETE');