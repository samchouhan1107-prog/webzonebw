const fs = require('fs');
const glob = require('path');

const articles = [
  'articles/cybersecurity-incident-response/index.html',
  'articles/hardware-troubleshooting/index.html',
  'articles/identity-and-access-management/index.html',
  'articles/network-infrastructure-fundamentals/index.html',
  'articles/network-monitoring-observability/index.html',
  'articles/powershell-it-automation/index.html',
  'articles/systems-integration-guide/index.html',
  'articles/webzonebw-studio-lenses-creative-experience/index.html'
];

articles.forEach(a => {
  if (!fs.existsSync(a)) return;
  const c = fs.readFileSync(a, 'utf8');
  const body = c.match(/<body[^>]*>/);
  const main = c.match(/<main[^>]*>/);
  console.log(a, '|', body ? body[0] : 'no body', '|', main ? main[0] : 'no main');
});
