const fs = require('fs');

const manifest = {
  "short_name": "Mecura",
  "name": "Mecura - Portal Médico e Saúde",
  "icons": [
    {
      "src": "/logo.svg",
      "type": "image/svg+xml",
      "sizes": "any",
      "purpose": "any maskable"
    },
    {
      "src": "/logo-512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any maskable"
    }
  ],
  "start_url": "/",
  "background_color": "#050508",
  "theme_color": "#A6FF00",
  "display": "standalone",
  "orientation": "portrait"
};
fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2), 'utf8');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/href="\/manifest\.json(\?v=\d+)?"/g, 'href="/manifest.json?v=5"');
html = html.replace(/href="\/logo-192\.png(\?v=\d+)?"/g, 'href="/logo.svg"');
html = html.replace(/href="\/favicon\.ico(\?v=\d+)?"/g, 'href="/logo.svg"');
fs.writeFileSync('index.html', html, 'utf8');

let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/\/logo-192\.png(\?v=\d+)?/g, '/logo.svg');
fs.writeFileSync('public/sw.js', sw, 'utf8');

let notif = fs.readFileSync('src/utils/notifications.ts', 'utf8');
notif = notif.replace(/\/logo-192\.png(\?v=\d+)?/g, '/logo.svg');
fs.writeFileSync('src/utils/notifications.ts', notif, 'utf8');

