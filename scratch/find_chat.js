const fs = require('fs');
const path = require('path');

function searchInFiles(dir, term) {
  let matches = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      matches = matches.concat(searchInFiles(full, term));
    } else if (/\.(html|js|css|json)$/i.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.toLowerCase().includes(term.toLowerCase())) {
        matches.push(full);
      }
    }
  }
  return matches;
}

console.log('Search for "chat":', searchInFiles('.', 'chat'));
console.log('Search for "ai":', searchInFiles('.', 'ai-').slice(0, 10));
console.log('Search for "bot":', searchInFiles('.', 'bot').slice(0, 10));
