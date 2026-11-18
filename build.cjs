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

function isCompiledIndex(filePath) {
  if (!fs.existsSync(filePath)) return false;
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    return !html.includes('/src/main.tsx');
  } catch {
    return false;
  }
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// On Hostinger or external production servers, restore dist/ from prod_bundle/ if available
if (!isAiStudio) {
  if (!isCompiledIndex(distIndex) && isCompiledIndex(prodBundleIndex)) {
    copyDirRecursive(prodBundleDir, distDir);
  }
  if (isCompiledIndex(distIndex) && (fs.existsSync(rootServer) || fs.existsSync(distServer) || fs.existsSync(prodBundleServer))) {
    const validServerSrc = [rootServer, prodBundleServer, distServer].find(p => fs.existsSync(p));
    if (validServerSrc) {
      if (validServerSrc !== distServer) fs.copyFileSync(validServerSrc, distServer);
      if (validServerSrc !== rootServer) fs.copyFileSync(validServerSrc, rootServer);
    }
    console.log('✅ Pre-built production bundle verified — skipping Vite build on production server.');
    process.exit(0);
  }
}

// Strict single-thread settings so CloudLinux LVE (64-core host with 20 NPROC limit) never hits thread limits
const env = {
  ...process.env,
  RAYON_NUM_THREADS: '1',
  TOKIO_WORKER_THREADS: '1',
  UV_THREADPOOL_SIZE: '1',
  GOMAXPROCS: '1',
  ESBUILD_MAX_THREADS: '1',
  NODE_OPTIONS: '--max-old-space-size=1536 --v8-pool-size=1',
};

try {
  console.log('⚙️ [1/2] Building backend (esbuild + firestore/lite)...');
  const esbuildBin = path.join(cwd, 'node_modules', 'esbuild', 'bin', 'esbuild');
  const esbuildCmd = fs.existsSync(esbuildBin)
    ? `"${process.execPath}" --max-old-space-size=512 --v8-pool-size=1 "${esbuildBin}" server.ts --bundle --platform=node --target=node18 --format=cjs --packages=external --outfile=server.cjs`
    : 'npx esbuild server.ts --bundle --platform=node --target=node18 --format=cjs --packages=external --outfile=server.cjs';
  execSync(esbuildCmd, { stdio: 'inherit', env });
  if (fs.existsSync(rootServer)) {
    fs.copyFileSync(rootServer, distServer);
  }

  console.log('🔨 [2/2] Building frontend (Vite with low-thread CloudLinux settings)...');
  const viteBin = path.join(cwd, 'node_modules', 'vite', 'bin', 'vite.js');
  const viteCmd = fs.existsSync(viteBin)
    ? `"${process.execPath}" --max-old-space-size=1536 --v8-pool-size=1 "${viteBin}" build`
    : 'npx vite build';
  execSync(viteCmd, { stdio: 'inherit', env });

  if (fs.existsSync(rootServer)) {
    fs.copyFileSync(rootServer, distServer);
  }

  if (fs.existsSync(prodBundleDir)) {
    fs.rmSync(prodBundleDir, { recursive: true, force: true });
  }
  copyDirRecursive(distDir, prodBundleDir);

  console.log('✅ Build completed successfully.');
} catch (err) {
  console.error('⚠️ Build warning/error:', err.message || err);
  if (fs.existsSync(rootServer) && !fs.existsSync(distServer)) {
    try {
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.copyFileSync(rootServer, distServer);
    } catch (_) {}
  }
  // In AI Studio, fail on build errors so compile_applet catches any syntax error.
  // On Hostinger (!isAiStudio), do not abort deployment with exit code 1; server.js will build in background after binding PORT.
  if (isAiStudio) {
    process.exit(1);
  } else {
    console.log('ℹ️ Continuing deployment; server.js will complete frontend build in background if needed.');
    process.exit(0);
  }
}
