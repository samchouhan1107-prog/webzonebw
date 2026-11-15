const fs = require('fs');
const c = fs.readFileSync('cookie-policy.html', 'utf8');
const lines = c.split('\n');
console.log('Total lines:', lines.length);

const sectionHeaders = lines.filter(l => l.includes('<section') || l.includes('</section>') || l.includes('<header') || l.includes('</header>') || l.includes('<footer') || l.includes('</footer>'));
console.log(sectionHeaders.join('\n'));
