import { createServer } from 'http';
import { readFileSync, existsSync, statSync, watch } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

function rebuild() {
  try {
    execSync('node build.js', { stdio: 'inherit', cwd: __dirname });
  } catch {
    // error already printed by build.js
  }
}

const server = createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  let filePath = path.join(DIST, urlPath);
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(readFileSync(filePath));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`Dev server → http://localhost:${PORT}`);
  console.log('Watching blogs/ and src/ for changes…');
});

rebuild();

let debounce;
function onChange(filename) {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    console.log(`Changed: ${filename}`);
    rebuild();
  }, 150);
}

// fs.watch with recursive works on Windows natively (Node 22+ also on macOS/Linux)
watch(path.join(__dirname, 'blogs'), { recursive: true }, (_, f) => onChange(f));
watch(path.join(__dirname, 'src'), { recursive: true }, (_, f) => onChange(f));
