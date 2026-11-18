// Enforce strict single-thread limits BEFORE requiring any native addon (@tailwindcss/oxide, esbuild, libuv)
process.env.RAYON_NUM_THREADS = '1';
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';
process.env.GOMAXPROCS = '1';
process.env.ESBUILD_MAX_THREADS = '1';

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

async function ensureServerBundle() {
  const esbuild = require('esbuild');
  await esbuild.build({
    entryPoints: [path.join(cwd, 'server.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    packages: 'external',
    outfile: rootServer,
  });
  if (fs.existsSync(rootServer)) {
    fs.copyFileSync(rootServer, distServer);
  }
  console.log('✅ Server bundle built: server.cjs');
}

async function buildFrontendWithEsbuild() {
  console.log('⚡ Building frontend with low-memory esbuild + Tailwind v4...');
  const esbuild = require('esbuild');
  const { compile } = require('@tailwindcss/node');
  const { Scanner } = require('@tailwindcss/oxide');

  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    fs.rmSync(assetsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(assetsDir, { recursive: true });

  // 1. Compile Tailwind CSS v4 from src/index.css
  const cssInput = fs.readFileSync(path.join(cwd, 'src', 'index.css'), 'utf8');
  const compiler = await compile(cssInput, {
    base: path.resolve(cwd, 'src'),
    onDependency: () => {}
  });
  const scanner = new Scanner({
    sources: [
      { base: path.resolve(cwd, 'src'), pattern: '**/*', negated: false },
      { base: path.resolve(cwd), pattern: 'index.html', negated: false }
    ]
  });
  const candidates = scanner.scan();
  const rawCss = compiler.build(candidates);
  const minifiedCss = await esbuild.transform(rawCss, { loader: 'css', minify: true });
  const cssFileName = `index-${Date.now()}.css`;
  fs.writeFileSync(path.join(assetsDir, cssFileName), minifiedCss.code, 'utf8');

  // 2. Bundle React + TS application with esbuild (Go binary, ~200MB RSS total)
  const result = await esbuild.build({
    entryPoints: [path.join(cwd, 'src', 'main.tsx')],
    bundle: true,
    minify: true,
    format: 'esm',
    splitting: true,
    metafile: true,
    entryNames: 'index-[hash]',
    chunkNames: 'chunk-[hash]',
    assetNames: 'asset-[hash]',
    outdir: assetsDir,
    publicPath: '/assets/',
    jsx: 'automatic',
    target: 'es2022',
    alias: { '@': path.resolve(cwd) },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
      'process.env.NODE_ENV': '"production"',
      'import.meta.env': JSON.stringify({ MODE: 'production', PROD: true, DEV: false, BASE_URL: '/' })
    },
    loader: {
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.webp': 'file',
      '.svg': 'file',
      '.woff2': 'file',
      '.woff': 'file'
    },
    plugins: [{
      name: 'ignore-css-imports',
      setup(build) {
        build.onResolve({ filter: /\.css$/ }, args => ({ path: args.path, namespace: 'ignore-css' }));
        build.onLoad({ filter: /.*/, namespace: 'ignore-css' }, () => ({ contents: '', loader: 'js' }));
      }
    }]
  });

  // Find generated entry JS filename from metafile
  let jsFileName = 'main.js';
  if (result.metafile && result.metafile.outputs) {
    for (const [outPath, meta] of Object.entries(result.metafile.outputs)) {
      if (meta.entryPoint && outPath.endsWith('.js')) {
        jsFileName = path.basename(outPath);
        break;
      }
    }
  }

  // 3. Emit dist/index.html pointing to generated assets
  let html = fs.readFileSync(path.join(cwd, 'index.html'), 'utf8');
  html = html.replace(
    /<script\s+type="module"\s+src="\/src\/main\.tsx"><\/script>/,
    `<link rel="stylesheet" crossorigin href="/assets/${cssFileName}">\n    <script type="module" crossorigin src="/assets/${jsFileName}"></script>`
  );
  fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
  console.log(`✅ Low-memory esbuild frontend ready: /assets/${jsFileName} + /assets/${cssFileName}`);
}

async function run() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // On Hostinger / production servers, restore pre-built bundle if present, else use lightweight esbuild (~2s, ~200MB RAM)
  if (!isAiStudio) {
    if (!isCompiledIndex(distIndex) && isCompiledIndex(prodBundleIndex)) {
      copyDirRecursive(prodBundleDir, distDir);
    }
    if (isCompiledIndex(distIndex)) {
      const validServerSrc = [rootServer, prodBundleServer, distServer].find(p => fs.existsSync(p));
      if (validServerSrc) {
        if (validServerSrc !== distServer) fs.copyFileSync(validServerSrc, distServer);
        if (validServerSrc !== rootServer) fs.copyFileSync(validServerSrc, rootServer);
        console.log('✅ Pre-built production bundle verified — skipping rebuild on production server.');
        process.exit(0);
      }
    }

    try {
      console.log('⚙️ [1/2] Building backend (esbuild + firestore/lite)...');
      await ensureServerBundle();
      console.log('🔨 [2/2] Building frontend (low-memory esbuild + Tailwind v4 for Hostinger)...');
      await buildFrontendWithEsbuild();
      console.log('✅ Hostinger production build completed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Hostinger build error:', err);
      process.exit(1);
    }
  }

  // AI Studio environment: build backend + Vite frontend (with esbuild fallback if Vite OOMs)
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
    await ensureServerBundle();

    console.log('🔨 [2/2] Building frontend (Vite with low-thread CloudLinux settings)...');
    const viteBin = path.join(cwd, 'node_modules', 'vite', 'bin', 'vite.js');
    const viteCmd = fs.existsSync(viteBin)
      ? `"${process.execPath}" --max-old-space-size=1536 --v8-pool-size=1 "${viteBin}" build`
      : 'npx vite build';

    try {
      execSync(viteCmd, { stdio: 'inherit', env });
    } catch (viteErr) {
      console.warn('⚠️ Vite build failed, switching to low-memory esbuild frontend build:', viteErr.message || viteErr);
      await buildFrontendWithEsbuild();
    }

    if (fs.existsSync(rootServer)) {
      fs.copyFileSync(rootServer, distServer);
    }

    if (fs.existsSync(prodBundleDir)) {
      fs.rmSync(prodBundleDir, { recursive: true, force: true });
    }
    copyDirRecursive(distDir, prodBundleDir);

    console.log('✅ Build completed successfully.');
  } catch (err) {
    console.error('❌ Build error:', err.message || err);
    process.exit(1);
  }
}

run();
