const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getJsFiles(dir) {
  let res = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (entryShouldSkip(e.name)) continue;
    if (e.isDirectory()) {
      res = res.concat(getJsFiles(full));
    } else if (full.endsWith('.js')) {
      res.push(full);
    }
  }
  return res;
}

function entryShouldSkip(name) {
  return name === '.git' || name === 'node_modules';
}

const jsFiles = getJsFiles('.');
console.log(`Checking ${jsFiles.length} JS files...`);
let errs = 0;
jsFiles.forEach(file => {
  try {
    execSync(`node -c "${file}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`Syntax error in ${file}:`, err.message);
    errs++;
  }
});
console.log(`Syntax check completed. Total syntax errors: ${errs}`);
