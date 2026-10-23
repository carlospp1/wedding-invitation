// Vista previa con recarga: reconstruye dist/ al guardar y refresca el navegador.
//   node scripts/preview.mjs
//   node scripts/preview.mjs otra-boda
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'dist');
const PORT = +process.env.PORT || 8080;
const name = process.argv[2] || process.env.INVITATION || 'chantal-juan';
const T = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml',
};
const LIVE = `<script>(function(){try{var e=new EventSource("/__reload");e.onmessage=function(){e.close();location.reload()}}catch(x){}})();</script>`;
const clients = new Set();

function build() {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, ['build.mjs', name], { cwd: ROOT, stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(String(code)))));
  });
}

function ping() {
  for (const res of clients) res.write('data: reload\n\n');
}

function serveFile(req, res) {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  let f = path.join(DIR, url);
  if (!f.startsWith(DIR)) return res.writeHead(403).end();
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) return res.writeHead(404).end('No encontrado');
  const ext = path.extname(f);
  const headers = { 'Content-Type': T[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' };
  if (ext === '.html') {
    let html = fs.readFileSync(f, 'utf8');
    html = html.includes('</body>') ? html.replace('</body>', LIVE + '</body>') : html + LIVE;
    res.writeHead(200, headers);
    return res.end(html);
  }
  res.writeHead(200, headers);
  fs.createReadStream(f).pipe(res);
}

let timer, building = false, queued = false;
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 180);
}
async function rebuild() {
  if (building) { queued = true; return; }
  building = true;
  try {
    await build();
    ping();
  } catch {
    console.error('✗ El build falló; se sigue sirviendo la última versión que funcionó.');
  }
  building = false;
  if (queued) { queued = false; schedule(); }
}

function watch(dir) {
  if (!fs.existsSync(dir)) return;
  fs.watch(dir, { recursive: true }, (_, file) => {
    const base = path.basename(file || '');
    if (!base || base.startsWith('.') || /(~|\.tmp|\.swp)$/.test(base)) return;
    schedule();
  });
}

await build();
const server = http.createServer(serveFile);
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ El puerto ${PORT} está ocupado. Cierra el preview anterior y vuelve a ejecutar npm run preview.`);
    process.exit(1);
  }
  throw err;
});
server.listen(PORT, () => {
  console.log(`→ http://localhost:${PORT}`);
  console.log('  Guardar en src/ o invitations/ reconstruye y recarga el navegador.');
});
setInterval(() => { for (const res of clients) res.write(': \n\n'); }, 25000);
watch(path.join(ROOT, 'src'));
watch(path.join(ROOT, 'invitations', name));
watch(path.join(ROOT, 'assets'));
watch(path.join(ROOT, 'build.mjs'));
