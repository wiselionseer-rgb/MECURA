// Limit libuv/Rayon threads BEFORE loading any module so CloudLinux LVE (NPROC=20) is never exceeded
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '1';
process.env.RAYON_NUM_THREADS = process.env.RAYON_NUM_THREADS || '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const path = require('node:path');
const fs = require('node:fs');

const rootServerCjsPath = path.join(__dirname, 'server.cjs');
const prodBundleServerPath = path.join(__dirname, 'prod_bundle', 'server.cjs');
const distServerPath = path.join(__dirname, 'dist', 'server.cjs');

let loadedApp = null;

if (fs.existsSync(rootServerCjsPath)) {
  loadedApp = require(rootServerCjsPath);
} else if (fs.existsSync(prodBundleServerPath)) {
  loadedApp = require(prodBundleServerPath);
} else if (fs.existsSync(distServerPath)) {
  loadedApp = require(distServerPath);
} else {
  console.error('❌ Bundle do servidor (server.cjs, prod_bundle/server.cjs ou dist/server.cjs) não encontrado.');
  process.exit(1);
}

module.exports = loadedApp?.default || loadedApp;
