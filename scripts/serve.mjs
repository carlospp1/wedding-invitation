// Servidor local mínimo para revisar dist/ → http://localhost:8080
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.resolve(process.argv[2] || 'dist'), PORT = +process.env.PORT || 8080;
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
http.createServer((req, res) => {
  let f = path.join(DIR, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(DIR)) return res.writeHead(403).end();
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) return res.writeHead(404).end('No encontrado');
  res.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`→ http://localhost:${PORT}`));
