const fs = require('fs');

const files = ['js/enhanced-filter-integration.js', 'js/unified-lens-integration.js', 'js/unified-lens-scaling.js', 'scripts/api-test.js'];

files.forEach(target => {
  const base = target.split('/').pop();
  console.log(`\nSearching for references to ${base}:`);
  const allHtml = fs.readdirSync('.').filter(f => f.endsWith('.html'));
  allHtml.forEach(h => {
    const c = fs.readFileSync(h, 'utf8');
    if (c.includes(base)) {
      console.log(`  HTML: ${h}`);
    }
  });
  const erHtml = fs.existsSync('er/index.html') ? ['er/index.html'] : [];
  erHtml.forEach(h => {
    const c = fs.readFileSync(h, 'utf8');
    if (c.includes(base)) {
      console.log(`  HTML: ${h}`);
    }
  });
});
