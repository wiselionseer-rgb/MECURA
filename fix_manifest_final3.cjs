const fs = require('fs');

const manifest = {
  "short_name": "Mecura",
  "name": "Mecura - Portal Médico e Saúde",
  "icons": [
    {
      "src": "/logo-192.png?v=6",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "/logo-512.png?v=6",
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
html = html.replace(/href="\/manifest\.json(\?v=\d+)?"/g, 'href="/manifest.json?v=6"');
html = html.replace(/href="\/logo\.svg"/g, 'href="/logo-192.png?v=6"');
html = html.replace(/href="\/favicon\.ico"/g, 'href="/favicon.ico?v=6"');
fs.writeFileSync('index.html', html, 'utf8');

let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/\/logo\.svg/g, '/logo-192.png?v=6');
fs.writeFileSync('public/sw.js', sw, 'utf8');

let notif = fs.readFileSync('src/utils/notifications.ts', 'utf8');
notif = notif.replace(/\/logo\.svg/g, '/logo-192.png?v=6');
fs.writeFileSync('src/utils/notifications.ts', notif, 'utf8');

