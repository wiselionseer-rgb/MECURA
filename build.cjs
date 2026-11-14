const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const cwd = process.cwd();
const isAiStudio = cwd === '/app/applet' || process.env.FORCE_BUILD === '1';
const distDir = path.join(cwd, 'dist');
const distIndex = path.join(distDir, 'index.html');
const distServer = path.join(distDir, 'server.cjs');
const rootServer = path.join(cwd, 'server.cjs');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// On Hostinger or external production servers, if the pre-built dist/index.html and server.cjs
// are already present from Git, skip the heavy Vite build so CloudLinux LVE never runs out of RAM/threads.
if (!isAiStudio && fs.existsSync(distIndex) && (fs.existsSync(distServer) || fs.existsSync(rootServer))) {
  if (!fs.existsSync(distServer) && fs.existsSync(rootServer)) {
    fs.copyFileSync(rootServer, distServer);
  } else if (fs.existsSync(distServer) && !fs.existsSync(rootServer)) {
    fs.copyFileSync(distServer, rootServer);
  }
  console.log('✅ Pre-built production bundle verified in dist/ — skipping heavy Vite build on production server.');
  process.exit(0);
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
  console.log('⚙️ [1/2] Building backend (esbuild)...');
  execSync(
    'npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs',
    { stdio: 'inherit', env }
  );
  if (fs.existsSync(distServer)) {
    fs.copyFileSync(distServer, rootServer);
  }

  console.log('🔨 [2/2] Building frontend (Vite)...');
  execSync('npx vite build', { stdio: 'inherit', env });

  // Re-ensure dist/server.cjs exists after vite build (since vite build cleans dist/)
  if (fs.existsSync(rootServer) && !fs.existsSync(distServer)) {
    fs.copyFileSync(rootServer, distServer);
  }

  console.log('✅ Build completed successfully.');
} catch (err) {
  console.error('❌ Build error:', err.message || err);
  if (!fs.existsSync(distServer) && fs.existsSync(rootServer)) {
    try {
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.copyFileSync(rootServer, distServer);
    } catch (_) {}
  }
  process.exit(1);
}
