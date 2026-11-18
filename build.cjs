const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const cwd = process.cwd();
const isAiStudio = cwd === '/app/applet' || process.env.FORCE_BUILD === '1';
const distDir = path.join(cwd, 'dist');
const prodBundleDir = path.join(cwd, 'prod_bundle');
const distIndex = path.join(distDir, 'index.html');
const prodBundleIndex = path.join(prodBundleDir, 'index.html');
const distServer = path.join(distDir, 'server.cjs');
const prodBundleServer = path.join(prodBundleDir, 'server.cjs');
const rootServer = path.join(cwd, 'server.cjs');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// On Hostinger or external production servers, restore dist/ from prod_bundle/ if needed
// and skip the heavy Vite/esbuild compilation so CloudLinux LVE never hits RAM/thread limits.
if (!isAiStudio) {
  if (!fs.existsSync(distIndex) && fs.existsSync(prodBundleIndex)) {
    copyDirRecursive(prodBundleDir, distDir);
  }
  if (fs.existsSync(distIndex) && (fs.existsSync(distServer) || fs.existsSync(rootServer) || fs.existsSync(prodBundleServer))) {
    const validServerSrc = [rootServer, prodBundleServer, distServer].find(p => fs.existsSync(p));
    if (validServerSrc) {
      if (!fs.existsSync(distServer)) fs.copyFileSync(validServerSrc, distServer);
      if (!fs.existsSync(rootServer)) fs.copyFileSync(validServerSrc, rootServer);
    }
    console.log('✅ Pre-built production bundle verified in dist/ & prod_bundle/ — skipping heavy build on production server.');
    process.exit(0);
  }
}

// Strict single-thread / low-memory settings so CloudLinux LVE never hits NPROC or RAM limits
const env = {
  ...process.env,
  RAYON_NUM_THREADS: '1',
  UV_THREADPOOL_SIZE: '1',
  GOMAXPROCS: '1',
  NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=1024',
};

try {
  console.log('⚙️ [1/3] Building self-contained backend (esbuild + firestore/lite)...');
  execSync(
    'npx esbuild server.ts --bundle --minify --platform=node --target=node18 --format=cjs --external:vite --outfile=server.cjs',
    { stdio: 'inherit', env }
  );

  console.log('🔨 [2/3] Building frontend (Vite)...');
  execSync('npx vite build', { stdio: 'inherit', env });

  // Copy self-contained server.cjs into dist/server.cjs
  if (fs.existsSync(rootServer)) {
    fs.copyFileSync(rootServer, distServer);
  }

  console.log('📦 [3/3] Mirroring dist/ into persistent prod_bundle/ for Hostinger deployment...');
  if (fs.existsSync(prodBundleDir)) {
    fs.rmSync(prodBundleDir, { recursive: true, force: true });
  }
  copyDirRecursive(distDir, prodBundleDir);

  console.log('✅ Build completed successfully (dist/ + prod_bundle/ + server.cjs ready).');
} catch (err) {
  console.error('❌ Build error:', err.message || err);
  if (fs.existsSync(prodBundleIndex) && !fs.existsSync(distIndex)) {
    try {
      copyDirRecursive(prodBundleDir, distDir);
    } catch (_) {}
  }
  process.exit(1);
}
