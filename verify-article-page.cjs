const fs = require('fs');
const path = require('path');

// Check the article page structure
const articlePath = './articles/webzonebw-studio-lenses-creative-experience/index.html';
const content = fs.readFileSync(articlePath, 'utf8');

console.log('🎨 WEBZONEBW STUDIO LENSES PAGE STRUCTURE VERIFICATION');
console.log('=' .repeat(60));

// Check for required elements
const checks = {
    'HTML5 Doctype': content.includes('<!DOCTYPE html>'),
    'HTML Lang': content.includes('<html lang="en">'),
    'Head Section': content.includes('<head>'),
    'Body Section': content.includes('<body>'),
    'Mobile Navigation': content.includes('mobile-nav-bar'),
    'Sidebar': content.includes('sidebar'),
    'Main Content': content.includes('main-content'),
    'Article Header': content.includes('top-header'),
    'Article Element': content.includes('<article'),
    'Featured Card': content.includes('featured-card'),
    'Quick Info Sections': content.includes('quick-info'),
    'Breadcrumb': content.includes('Breadcrumb'),
    'Theme Toggle': content.includes('themeToggleSwitch'),
    'User Card': content.includes('sidebar-user-card'),
    'JavaScript Files': content.includes('script.js'),
    'Responsive CSS': content.includes('responsive.css'),
    'Structured Data': content.includes('TechArticle'),
    'Canonical URL': content.includes('canonical'),
    'Meta Description': content.includes('name="description"'),
    'Viewport Meta': content.includes('viewport'),
    'Theme Color': content.includes('theme-color'),
    'Favicon': content.includes('favicon.png'),
    'Skip Link': content.includes('skip-link'),
    'Sidebar Backdrop': content.includes('sidebar-backdrop'),
    'Proper Closing Tags': content.includes('</html>') && content.includes('</body>')
};

// Run checks
let passed = 0;
let failed = 0;

Object.entries(checks).forEach(([name, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}`);
    if (passed) passed++;
    else failed++;
});

console.log('\n📊 SUMMARY');
console.log(`Passed: ${passed}/${Object.keys(checks).length}`);
console.log(`Failed: ${failed}/${Object.keys(checks).length}`);

if (failed === 0) {
    console.log('\n🎉 ALL CHECKS PASSED - Page is properly structured!');
} else {
    console.log(`\n⚠️ ${failed} issues found - Please review the page structure`);
}

// Check navigation links
const navLinks = [
    'Home',
    'Blog', 
    'About',
    'Projects',
    'Resume',
    'Contact',
    'Sound Box',
    'ER Studio'
];

console.log('\n🧭 NAVIGATION LINKS CHECK');
navLinks.forEach(link => {
    const hasLink = content.includes(link);
    const status = hasLink ? '✅' : '❌';
    console.log(`${status} ${link}`);
});

// Check article sections
const sections = [
    'Overview: The Creative Experience',
    'Start in the Live Studio',
    'Free and Premium Lenses',
    'What Feature Packs Unlock',
    'Creative Updates and New Effects',
    'Mobile and Desktop Experience',
    'Hardware Care and Support',
    'Lens Ownership Benefits'
];

console.log('\n📝 ARTICLE SECTIONS CHECK');
sections.forEach(section => {
    const hasSection = content.includes(section);
    const status = hasSection ? '✅' : '❌';
    console.log(`${status} ${section}`);
});

console.log('\n🚀 VERIFICATION COMPLETE');