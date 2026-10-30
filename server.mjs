/**
 * Production Proxy & Static File Server untuk Sistem Menu Gizi RS Edelweiss.
 * 
 * Menggunakan modul bawaan Node.js murni (Zero external dependencies).
 * Fitur:
 * 1. Menyajikan static assets hasil build frontend (folder dist/)
 * 2. Menjembatani (proxy) request /webhook/... ke server RS Edelweiss
 *    secara aman di sisi server dengan menginjeksi kredensial Basic Auth,
 *    sehingga kredensial dan URL asli RS tidak bocor ke browser pasien.
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// Konfigurasi target server Edelweiss (murni dibaca dari file .env)
const API_TARGET = (process.env.EDELWEISS_API_URL || process.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_USER = process.env.EDELWEISS_API_USERNAME || process.env.VITE_API_USERNAME || '';
const API_PASS = process.env.EDELWEISS_API_PASSWORD || process.env.VITE_API_PASSWORD || '';
const BASIC_AUTH = API_USER && API_PASS ? `Basic ${Buffer.from(`${API_USER}:${API_PASS}`).toString('base64')}` : '';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Handler untuk proxy request /webhook/... ke API RS Edelweiss
function handleProxy(req, res) {
  try {
    const targetUrlObj = new URL(`${API_TARGET}${req.url}`);
    const isHttps = targetUrlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const headers = { ...req.headers };
    delete headers.host;
    if (BASIC_AUTH) {
      headers['authorization'] = BASIC_AUTH;
    }

    const options = {
      method: req.method,
      hostname: targetUrlObj.hostname,
      port: targetUrlObj.port || (isHttps ? 443 : 80),
      path: `${targetUrlObj.pathname}${targetUrlObj.search}`,
      headers,
    };

    const proxyReq = client.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[Proxy Error]:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gagal terhubung ke server API RS Edelweiss', message: err.message }));
      }
    });

    req.pipe(proxyReq, { end: true });
  } catch (err) {
    console.error('[Proxy Parse Error]:', err.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Proxy Error', message: err.message }));
    }
  }
}

// Handler untuk static files SPA (folder dist/)
function handleStatic(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;
  let filePath = path.join(DIST_DIR, pathname);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Fallback SPA: kirim index.html untuk client-side routing
      const indexPath = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (indexErr, content) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
          res.end('Aplikasi belum di-build. Jalankan "npm run build" terlebih dahulu.');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(content);
        }
      });
    }
  });
}

const server = http.createServer((req, res) => {
  // Dukungan CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url.startsWith('/webhook')) {
    handleProxy(req, res);
  } else {
    handleStatic(req, res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=================================================`);
  console.log(`🏥 Server Menu Gizi RS Edelweiss Aktif!`);
  console.log(`   - Port          : ${PORT}`);
  console.log(`   - Local Access  : http://localhost:${PORT}`);
  console.log(`   - Target API RS : ${API_TARGET}`);
  console.log(`   - Auth Injected : ${BASIC_AUTH ? 'Ya (Aman di sisi Server)' : 'Tidak'}`);
  console.log(`=================================================\n`);
});

