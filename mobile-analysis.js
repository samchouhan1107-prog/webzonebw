const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
const css = fs.readFileSync('./css/style.css', 'utf8');

// Check for mobile performance issues
const issues = [];

// 1. Check viewport meta tag
if (!html.includes('viewport')) {
    issues.push('❌ Missing viewport meta tag');
} else {
    issues.push('✅ Viewport meta tag present');
}

// 2. Check for touch targets
const touchTargets = (html.match(/<button/g) || []).length + (html.match(/<a/g) || []).length;
if (touchTargets < 10) {
    issues.push('⚠️ Limited touch targets for mobile');
} else {
    issues.push('✅ Adequate touch targets');
}

// 3. Check for proper responsive meta tags
const responsiveMeta = html.match(/name=\"viewport\"/g) || [];
if (responsiveMeta.length === 0) {
    issues.push('❌ Missing responsive viewport meta');
} else {
    issues.push('✅ Responsive viewport meta present');
}

// 4. Check for mobile-friendly CSS
const mobileMediaQueries = css.match(/@media.*max-width.*480px/g) || [];
if (mobileMediaQueries.length < 5) {
    issues.push('⚠️ Limited mobile media queries');
} else {
    issues.push('✅ Good mobile media query coverage');
}

// 5. Check for proper meta description
const metaDesc = html.match(/meta name=\"description\"/g) || [];
if (metaDesc.length === 0) {
    issues.push('❌ Missing meta description');
} else {
    issues.push('✅ Meta description present');
}

console.log('=== MOBILE PERFORMANCE ANALYSIS ===');
issues.forEach(issue => console.log(issue));
console.log('\n=== RECOMMENDATIONS ===');
if (issues.some(i => i.includes('❌'))) {
    console.log('• Add proper viewport meta tags');
    console.log('• Increase touch target sizes');
    console.log('• Optimize font sizes for mobile');
    console.log('• Add more mobile-specific media queries');
    console.log('• Implement proper responsive images');
    console.log('• Add mobile-first CSS approach');
} else {
    console.log('Mobile performance looks good!');
}