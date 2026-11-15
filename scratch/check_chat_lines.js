const fs = require('fs');

['css/style.css', 'js/er-license-premium.js'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.toLowerCase().includes('chat')) {
      console.log(`${f}:${i+1}: ${l.trim()}`);
    }
  });
});
