const fs = require('fs');
const path = require('path');

// 1. Load sitemap.xml
const sitemapXml = fs.readFileSync('sitemap.xml', 'utf8');
const sitemapUrls = [];
const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
let match;
while ((match = locRegex.exec(sitemapXml)) !== null) {
  sitemapUrls.push(match[1]);
}

// 2. Load robots.txt
const robotsTxt = fs.readFileSync('robots.txt', 'utf8');

// 3. Find all HTML files
function getHtmlFiles(dir) {
  let list = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '.git' || e.name === 'node_modules' || e.name === 'scratch') continue;
      list = list.concat(getHtmlFiles(full));
    } else if (e.name.endsWith('.html')) {
      list.push(full);
    }
  }
  return list;
}

const htmlFiles = getHtmlFiles('.');

console.log('====================================================');
console.log('1. ROBOTS.TXT & XML SITEMAP AUDIT');
console.log('====================================================');
console.log(`Total URLs in sitemap.xml: ${sitemapUrls.length}`);

// Check duplicates in sitemap
const sitemapSet = new Set();
const sitemapDups = [];
sitemapUrls.forEach(url => {
  if (sitemapSet.has(url)) {
    sitemapDups.push(url);
  }
  sitemapSet.add(url);
});
console.log(`Duplicate URLs in sitemap: ${sitemapDups.length ? sitemapDups.join(', ') : 'None'}`);

// Check sitemap directive in robots.txt
const sitemapInRobots = robotsTxt.match(/Sitemap:\s*(https?:\/\/\S+)/i);
console.log(`Sitemap directive in robots.txt: ${sitemapInRobots ? sitemapInRobots[1] : 'MISSING'}`);

// Map HTML files to expected public URLs
const expectedUrls = {};
htmlFiles.forEach(f => {
  const norm = f.replace(/\\/g, '/');
  let publicUrl;
  if (norm === 'index.html') {
    publicUrl = 'https://webzonebw.in/';
  } else if (norm.endsWith('/index.html')) {
    publicUrl = 'https://webzonebw.in/' + norm.replace('index.html', '');
  } else {
    publicUrl = 'https://webzonebw.in/' + norm;
  }
  expectedUrls[norm] = publicUrl;
});

// Check which sitemap URLs don't match any HTML file or feed.xml
const unknownSitemapUrls = [];
sitemapUrls.forEach(u => {
  if (u === 'https://webzonebw.in/feed.xml') return;
  const matchFile = Object.entries(expectedUrls).find(([f, url]) => url === u);
  if (!matchFile) {
    unknownSitemapUrls.push(u);
  }
});
console.log(`Sitemap URLs with no local file: ${unknownSitemapUrls.length ? unknownSitemapUrls.join(', ') : 'None'}`);

console.log('\n====================================================');
console.log('2. CANONICAL URLS & META ROBOTS AUDIT');
console.log('====================================================');

const pageData = {};

htmlFiles.forEach(f => {
  const norm = f.replace(/\\/g, '/');
  if (norm.startsWith('seo/')) return; // skip partial templates
  const content = fs.readFileSync(f, 'utf8');

  // Canonical
  const canonMatches = [...content.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/gi)];
  const canonicals = canonMatches.map(m => m[1]);

  // Robots meta
  const robotsMatches = [...content.matchAll(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/gi)];
  const robots = robotsMatches.map(m => m[1]);

  // Viewport
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(content);

  // Preconnect
  const hasPreconnectGtm = /<link[^>]+rel=["']preconnect["'][^>]+href=["']https:\/\/www\.googletagmanager\.com["']/i.test(content);

  // In sitemap
  const publicUrl = expectedUrls[norm];
  const inSitemap = sitemapUrls.includes(publicUrl);

  pageData[norm] = {
    file: norm,
    publicUrl,
    canonicals,
    robots,
    hasViewport,
    hasPreconnectGtm,
    inSitemap
  };
});

// Check issues in Canonical & Robots
const canonicalIssues = [];
const indexingIssues = [];

Object.values(pageData).forEach(p => {
  // Canonical check
  if (p.canonicals.length === 0) {
    canonicalIssues.push(`[${p.file}] MISSING canonical URL`);
  } else if (p.canonicals.length > 1) {
    canonicalIssues.push(`[${p.file}] MULTIPLE canonical URLs: ${p.canonicals.join(', ')}`);
  } else {
    const c = p.canonicals[0];
    if (c !== p.publicUrl) {
      canonicalIssues.push(`[${p.file}] MISMATCHED canonical: "${c}" (expected "${p.publicUrl}")`);
    }
    if (!c.startsWith('https://webzonebw.in')) {
      canonicalIssues.push(`[${p.file}] NON-HTTPS / WRONG DOMAIN in canonical: "${c}"`);
    }
  }

  // Robots meta check
  if (p.robots.length === 0) {
    indexingIssues.push(`[${p.file}] MISSING meta robots tag`);
  } else if (p.robots.length > 1) {
    indexingIssues.push(`[${p.file}] MULTIPLE meta robots tags: ${p.robots.join(', ')}`);
  } else {
    const r = p.robots[0];
    const isNoIndex = r.includes('noindex');
    if (p.inSitemap && isNoIndex) {
      indexingIssues.push(`[${p.file}] CONFLICT: in sitemap.xml but has noindex!`);
    }
    if (!p.inSitemap && !isNoIndex && !p.file.includes('master.html')) {
      indexingIssues.push(`[${p.file}] Indexable (index) but NOT in sitemap.xml`);
    }
  }
});

console.log(`Canonical issues (${canonicalIssues.length}):`);
canonicalIssues.forEach(i => console.log('  - ' + i));

console.log(`\nIndexing issues (${indexingIssues.length}):`);
indexingIssues.forEach(i => console.log('  - ' + i));

console.log('\n====================================================');
console.log('3. AI CRAWLER ACCESS POLICIES IN ROBOTS.TXT');
console.log('====================================================');
const aiBots = [
  'GPTBot', 'ChatGPT-User', 'Google-Extended', 'ClaudeBot',
  'anthropic-ai', 'Bytespider', 'CCBot', 'PerplexityBot',
  'cohere-ai', 'FacebookBot', 'Diffbot'
];
const aiMatches = [];
aiBots.forEach(bot => {
  if (robotsTxt.toLowerCase().includes(bot.toLowerCase())) {
    aiMatches.push(bot);
  }
});
console.log(`Specific AI bot directives in robots.txt: ${aiMatches.length ? aiMatches.join(', ') : 'None (All fall under wildcard *)'}`);
console.log(`Wildcard User-agent: * policy: Allow: / (All AI bots currently permitted full crawl)`);

console.log('\n====================================================');
console.log('4. INTERNAL LINK GRAPH & ORPHAN PAGES AUDIT');
console.log('====================================================');

const linkGraph = {};
Object.keys(pageData).forEach(f => {
  linkGraph[f] = { outgoing: new Set(), incoming: new Set() };
});

Object.keys(pageData).forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const dir = path.dirname(f);
  const hrefMatches = [...content.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)];

  hrefMatches.forEach(m => {
    let href = m[1].split('#')[0].split('?')[0];
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

    // Resolve relative path
    let targetNorm;
    if (href.startsWith('/')) {
      targetNorm = href.slice(1);
    } else {
      targetNorm = path.join(dir, href).replace(/\\/g, '/');
    }
    if (targetNorm === '' || targetNorm === '.') targetNorm = 'index.html';
    if (targetNorm.endsWith('/')) targetNorm += 'index.html';
    if (!targetNorm.endsWith('.html') && fs.existsSync(targetNorm + '/index.html')) {
      targetNorm += '/index.html';
    }

    if (linkGraph[targetNorm]) {
      linkGraph[f].outgoing.add(targetNorm);
      linkGraph[targetNorm].incoming.add(f);
    }
  });
});

console.log('Page Connectivity Summary:');
Object.entries(linkGraph).forEach(([page, data]) => {
  console.log(`  ${page.padEnd(55)} -> Incoming: ${String(data.incoming.size).padStart(2)} | Outgoing: ${String(data.outgoing.size).padStart(2)}`);
});

const orphans = Object.entries(linkGraph).filter(([p, data]) => data.incoming.size === 0);
console.log(`\nOrphan pages (0 incoming links): ${orphans.length ? orphans.map(([p]) => p).join(', ') : 'None'}`);

console.log('\n====================================================');
console.log('5. ARTICLES CROSS-LINKING AUDIT');
console.log('====================================================');
const blogHtml = fs.readFileSync('blog.html', 'utf8');
const articleDirs = fs.readdirSync('articles', { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

console.log(`Total article directories: ${articleDirs.length}`);
articleDirs.forEach(art => {
  const artIndexPath = `articles/${art}/index.html`;
  const linkedInBlog = blogHtml.includes(art);
  console.log(`  - ${art.padEnd(50)}: Linked in blog.html? ${linkedInBlog}`);

  if (fs.existsSync(artIndexPath)) {
    const artContent = fs.readFileSync(artIndexPath, 'utf8');
    const linksBackToBlog = artContent.includes('blog.html');
    const linksToER = artContent.includes('er/index.html') || artContent.includes('er/');
    const linksToProjects = artContent.includes('projects.html');
    console.log(`     Backlinks from article: Blog: ${linksBackToBlog} | ER Studio: ${linksToER} | Projects: ${linksToProjects}`);
  }
});
