const fs = require('fs');

const targets = ['enhanced-filter-integration', 'unified-lens-integration', 'unified-lens-scaling', 'api-test'];

const jsFiles = fs.readdirSync('js').map(f => 'js/' + f).concat(fs.readdirSync('scripts').map(f => 'scripts/' + f));

jsFiles.forEach(f => {
  if (!f.endsWith('.js')) return;
  const c = fs.readFileSync(f, 'utf8');
  targets.forEach(t => {
    if (c.includes(t)) {
      console.log(`${f} references ${t}`);
    }
  });
});
