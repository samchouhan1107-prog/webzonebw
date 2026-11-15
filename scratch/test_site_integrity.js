const fs = require('fs');
const path = require('path');

function getFiles(dir, ext) {
  let res = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      res = res.concat(getFiles(full, ext));
    } else if (full.endsWith(ext)) {
      res.push(full);
    }
  }
  return res;
}

const htmlFiles = getFiles('.', '.html');
const errors = [];
const warnings = [];

// 1. Link & Asset Verification
htmlFiles.forEach(file => {
  if (file.includes('seo\\')) return; // skip partial templates
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  // Check script tags
  const scriptMatches = content.matchAll(/<script[^>]+src=["']([^"']+)["']/gi);
  for (const m of scriptMatches) {
    const src = m[1].split('?')[0]; // strip query string
    if (src.startsWith('http://') || src.startsWith('https://')) continue;
    const resolved = path.resolve(dir, src);
    if (!fs.existsSync(resolved)) {
      errors.push(`[${file}] Missing script: ${src} (resolved: ${resolved})`);
    }
  }

  // Check link rel="stylesheet"
  const cssMatches = content.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi);
  for (const m of cssMatches) {
    const href = m[1].split('?')[0];
    if (href.startsWith('http://') || href.startsWith('https://')) continue;
    const resolved = path.resolve(dir, href);
    if (!fs.existsSync(resolved)) {
      errors.push(`[${file}] Missing CSS: ${href} (resolved: ${resolved})`);
    }
  }

  // Check images
  const imgMatches = content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  for (const m of imgMatches) {
    const src = m[1].split('?')[0];
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) continue;
    const resolved = path.resolve(dir, src);
    if (!fs.existsSync(resolved)) {
      warnings.push(`[${file}] Missing image: ${src}`);
    }
  }

  // Check internal anchor tags
  const hrefMatches = content.matchAll(/<a[^>]+href=["']([^"']+)["']/gi);
  for (const m of hrefMatches) {
    const href = m[1];
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
    if (href.startsWith('http://') || href.startsWith('https://')) continue;

    const [pagePath, hash] = href.split('#');
    if (pagePath) {
      const resolved = path.resolve(dir, pagePath);
      if (!fs.existsSync(resolved)) {
        errors.push(`[${file}] Broken internal link: ${href} (resolved: ${resolved})`);
      } else if (hash) {
        const targetContent = fs.readFileSync(resolved, 'utf8');
        if (!targetContent.includes(`id="${hash}"`) && !targetContent.includes(`name="${hash}"`)) {
          warnings.push(`[${file}] Anchor target #${hash} not found in ${pagePath}`);
        }
      }
    } else if (hash) {
      // In-page hash
      if (!content.includes(`id="${hash}"`) && !content.includes(`name="${hash}"`)) {
        warnings.push(`[${file}] In-page anchor target #${hash} not found`);
      }
    }
  }
});

console.log(`Audited ${htmlFiles.length} HTML files.`);
console.log(`Errors found: ${errors.length}`);
errors.forEach(e => console.log('  ERROR: ' + e));

console.log(`Warnings found: ${warnings.length}`);
warnings.forEach(w => console.log('  WARN: ' + w));
