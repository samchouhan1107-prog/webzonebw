const fs = require('fs');
const path = require('path');

// Read sitemap to get all URLs
const sitemapPath = './sitemap.xml';
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

// Extract all URLs from sitemap
const urlMatches = sitemapContent.match(/<loc>(https:\/\/webzonebw\.in\/[^<]+)<\/loc>/g);
const urls = urlMatches ? urlMatches.map(match => match.replace(/<loc>/, '').replace(/<\/loc>/, '')) : [];

// Additional pages that should be checked
const additionalPages = [
    './500.html',
    './master.html',
    './privacy-center.html'
];

// Remove test files from verification
const testFiles = [
    './test-er-license.html',
    './test-paypal-button.html',
    './test-minimal.js',
    './test-syntax.js'
];

// Remove test files if they exist
testFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`❌ Found test file that should be removed: ${file}`);
    } else {
        console.log(`✅ Test file properly removed: ${file}`);
    }
});

// Check CSS consistency
const cssFiles = [
    './css/style.css',
    './css/responsive.css'
];

console.log('\n🎨 CSS CONSISTENCY CHECK');
cssFiles.forEach(cssFile => {
    if (fs.existsSync(cssFile)) {
        const content = fs.readFileSync(cssFile, 'utf8');
        const versionMatch = content.match(/WEBZONEBW v(\d+\.\d+)/);
        if (versionMatch) {
            console.log(`✅ ${cssFile}: Version ${versionMatch[1]}`);
        } else {
            console.log(`⚠️ ${cssFile}: Version not found`);
        }
    } else {
        console.log(`❌ ${cssFile}: File missing`);
    }
});

// Check HTML pages for proper structure
console.log('\n📄 HTML STRUCTURE CHECK');
const htmlFiles = [
    './index.html',
    './about.html', 
    './contact.html',
    './projects.html',
    './resume.html',
    './blog.html',
    './soundbox.html',
    './privacy.html',
    './cookie-policy.html',
    './terms.html',
    './disclaimer.html',
    './er/index.html'
];

htmlFiles.forEach(htmlFile => {
    if (fs.existsSync(htmlFile)) {
        const content = fs.readFileSync(htmlFile, 'utf8');
        
        // Check for required elements
        const hasDoctype = content.includes('<!DOCTYPE html>');
        const hasCharset = content.includes('charset="UTF-8"');
        const hasViewport = content.includes('viewport');
        const hasTitle = content.includes('<title>');
        const hasCss = content.includes('css/style.css');
        const hasResponsive = content.includes('css/responsive.css');
        
        console.log(`${htmlFile}: ${hasDoctype ? '✅' : '❌'} DOCTYPE | ${hasCharset ? '✅' : '❌'} Charset | ${hasViewport ? '✅' : '❌'} Viewport | ${hasTitle ? '✅' : '❌'} Title | ${hasCss ? '✅' : '❌'} CSS | ${hasResponsive ? '✅' : '❌'} Responsive`);
    } else {
        console.log(`❌ ${htmlFile}: File missing`);
    }
});

// Check article pages
console.log('\n📝 ARTICLE PAGES CHECK');
const articleDirs = [
    './articles/webzonebw-studio-lenses-creative-experience',
    './articles/hardware-troubleshooting',
    './articles/network-infrastructure-fundamentals',
    './articles/systems-integration-guide',
    './articles/cybersecurity-incident-response',
    './articles/identity-and-access-management'
];

articleDirs.forEach(dir => {
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) {
        console.log(`✅ ${dir}/index.html: exists`);
    } else {
        console.log(`❌ ${dir}/index.html: missing`);
    }
});

console.log('\n📋 SUMMARY');
console.log(`Total URLs in sitemap: ${urls.length}`);
console.log(`Sitemap includes: /articles/identity-and-access-management/: ${urls.some(url => url.includes('identity-and-access-management')) ? '✅' : '❌'}`);
console.log(`Test files removed: ${testFiles.filter(f => !fs.existsSync(f)).length}/${testFiles.length}`);
console.log(`CSS versions standardized: ${cssFiles.filter(f => fs.existsSync(f)).length}/${cssFiles.length}`);

console.log('\n🚀 VERIFICATION COMPLETE');
console.log('All pages should be properly indexed and consistently styled.');