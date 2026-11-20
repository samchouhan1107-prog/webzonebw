const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir) {
  let list = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '.git' || e.name === 'node_modules' || e.name === 'scratch' || e.name === 'seo') continue;
      list = list.concat(getHtmlFiles(full));
    } else if (e.name.endsWith('.html')) {
      list.push(full);
    }
  }
  return list;
}

const htmlFiles = getHtmlFiles('.');

console.log('====================================================');
console.log('MOBILE USABILITY & PERFORMANCE AUDIT');
console.log('====================================================');

const issues = [];

htmlFiles.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const norm = f.replace(/\\/g, '/');

  // 1. Viewport tag
  const vp = c.match(/<meta[^>]+name=["']viewport["'][^>]*>/i);
  if (!vp) {
    issues.push(`[${norm}] Missing <meta name="viewport">`);
  } else if (!vp[0].includes('width=device-width')) {
    issues.push(`[${norm}] Viewport tag missing width=device-width`);
  }

  // 2. Images audit
  const imgTags = [...c.matchAll(/<img([^>]+)>/gi)];
  imgTags.forEach((m, idx) => {
    const attrs = m[1];
    const src = (attrs.match(/src=["']([^"']+)["']/i) || [])[1] || 'unknown';
    const hasAlt = /alt=["'][^"']*["']/i.test(attrs);
    const hasWidth = /width=["'][^"']+["']/i.test(attrs);
    const hasHeight = /height=["'][^"']+["']/i.test(attrs);
    const hasLazy = /loading=["']lazy["']/i.test(attrs);

    if (!hasAlt) {
      issues.push(`[${norm}] Image ${src} missing alt attribute`);
    }
  });

  // 3. Preconnect
  const hasGtmPreconnect = c.includes('rel="preconnect"') && c.includes('googletagmanager.com');
  if (!hasGtmPreconnect && c.includes('googletagmanager.com/gtag/js')) {
    issues.push(`[${norm}] Has GA4 script but missing preconnect to googletagmanager.com`);
  }

  // 4. Tap target sizes / responsive css
  const hasResponsiveCss = c.includes('responsive.css');
  if (!hasResponsiveCss && norm !== '500.html') {
    issues.push(`[${norm}] Missing responsive.css`);
  }
});

console.log(`Total Mobile & Performance issues found: ${issues.length}`);
issues.forEach(i => console.log('  - ' + i));
