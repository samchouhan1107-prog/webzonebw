const fs = require('fs');
['about.html', 'contact.html', 'projects.html', 'resume.html'].forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let openLine = -1;
  let closeLine = -1;
  lines.forEach((l, i) => {
    if (l.includes('<div class="container">')) openLine = i + 1;
    if (l.includes('</main>')) closeLine = i + 1;
  });
  console.log(f, 'open container at line', openLine, 'close main at line', closeLine);
});
