import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const distServerPath = path.join(__dirname, 'dist', 'server.cjs');
const rootServerCjsPath = path.join(__dirname, 'server.cjs');

if (fs.existsSync(distServerPath)) {
  require(distServerPath);
} else if (fs.existsSync(rootServerCjsPath)) {
  require(rootServerCjsPath);
} else {
  console.error('❌ Bundle do servidor (dist/server.cjs) não encontrado. Execute "npm run build" antes de iniciar.');
  process.exit(1);
}
