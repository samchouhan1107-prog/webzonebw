const http = require('http'), fs = require('fs'), path = require('path');
const root = 'C:/Users/HP/Downloads/WebZoneBW.in';
http.createServer((q, s) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (u.endsWith('/')) u += 'index.html';
  const fp = path.join(root, u);
  if (!fp.startsWith(root.replace(/\//g, '\\')) && !fp.startsWith(root)) { s.writeHead(403); return s.end(); }
  fs.readFile(fp, (e, d) => {
    if (e) { s.writeHead(404); return s.end('404'); }
    const ext = path.extname(fp).toLowerCase();
    const m = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.json': 'application/json' };
    s.writeHead(200, { 'Content-Type': m[ext] || 'application/octet-stream' });
    s.end(d);
  });
}).listen(8799, '127.0.0.1', () => console.log('OK'));
