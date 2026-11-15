const fs = require('fs');
['about.html', 'contact.html', 'projects.html', 'resume.html'].forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  const mainIndex = lines.findIndex(l => l.includes('</main>'));
  console.log(`=== ${f} ===`);
  console.log(lines.slice(mainIndex - 2, mainIndex + 5).join('\n'));
});
