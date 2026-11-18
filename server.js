// Limit libuv/Rayon threads BEFORE loading any module so CloudLinux LVE (NPROC=20) is never exceeded
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '1';
process.env.RAYON_NUM_THREADS = process.env.RAYON_NUM_THREADS || '1';
process.env.TOKIO_WORKER_THREADS = process.env.TOKIO_WORKER_THREADS || '1';
process.env.GOMAXPROCS = process.env.GOMAXPROCS || '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const isCompiledHtml = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return false;
    const html = fs.readFileSync(filePath, 'utf-8');
    return !html.includes('/src/main.tsx');
  } catch {
    return false;
  }
};

// If Hostinger skipped `npm run build` and no compiled frontend exists yet, run the 2s low-memory esbuild pass once
const hasFrontend =
  isCompiledHtml(path.join(__dirname, 'dist', 'index.html')) ||
  isCompiledHtml(path.join(__dirname, 'prod_bundle', 'index.html'));

if (!hasFrontend && fs.existsSync(path.join(__dirname, 'build.cjs'))) {
  try {
    console.log('⚡ Frontend bundle not found — running fast 2s esbuild initialization...');
    execFileSync(process.execPath, ['--max-old-space-size=512', '--v8-pool-size=1', path.join(__dirname, 'build.cjs')], {
      cwd: __dirname,
      stdio: 'inherit',
      env: process.env,
    });
  } catch (buildErr) {
    console.warn('⚠️ Auto-build warning on startup:', buildErr.message || buildErr);
  }
}

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
