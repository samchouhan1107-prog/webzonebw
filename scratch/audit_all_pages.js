const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      results = results.concat(getHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const files = getHtmlFiles('.');
console.log(`Found ${files.length} HTML files to audit.`);

const tagsToTrack = ['main', 'div', 'aside', 'header', 'footer', 'section', 'article', 'nav'];

const auditReport = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const report = { file: f, issues: [] };

  // 1. Charset check
  if (!content.includes('charset="UTF-8"') && !content.includes("charset='UTF-8'") && !content.includes('charset=UTF-8')) {
    report.issues.push('Missing <meta charset="UTF-8">');
  }

  // 2. Tag balances
  tagsToTrack.forEach(tag => {
    // Basic regex count of open vs close
    const openRegex = new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi');
    const closeRegex = new RegExp(`</${tag}>`, 'gi');
    const openCount = (content.match(openRegex) || []).length;
    const closeCount = (content.match(closeRegex) || []).length;
    if (openCount !== closeCount) {
      report.issues.push(`Tag imbalance for <${tag}>: open=${openCount}, close=${closeCount}`);
    }
  });

  // 3. Check for main landmark
  const mainCount = (content.match(/<main[\s>]/gi) || []).length;
  if (mainCount === 0) {
    report.issues.push('Missing <main> landmark element');
  } else if (mainCount > 1) {
    report.issues.push(`Multiple (${mainCount}) <main> landmark elements`);
  }

  // 4. Check for theme toggle switch
  if (content.includes('id="themeToggleSwitch"') && !content.includes('id="themeModeIcon"')) {
    report.issues.push('Has themeToggleSwitch but missing themeModeIcon');
  }

  auditReport.push(report);
});

auditReport.forEach(r => {
  if (r.issues.length > 0) {
    console.log(`\n[${r.file}]`);
    r.issues.forEach(i => console.log('  - ' + i));
  }
});
console.log('\nAudit complete.');
