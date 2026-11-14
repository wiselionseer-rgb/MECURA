const path = require('node:path');
const fs = require('node:fs');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const distServerPath = path.join(__dirname, 'dist', 'server.cjs');
const rootServerCjsPath = path.join(__dirname, 'server.cjs');

let loadedApp = null;

if (fs.existsSync(distServerPath)) {
  loadedApp = require(distServerPath);
} else if (fs.existsSync(rootServerCjsPath)) {
  loadedApp = require(rootServerCjsPath);
} else {
  console.error('❌ Bundle do servidor (dist/server.cjs ou server.cjs) não encontrado.');
  process.exit(1);
}

module.exports = loadedApp?.default || loadedApp;
