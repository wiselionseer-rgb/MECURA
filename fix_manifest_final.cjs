const fs = require('fs');
const manifest = {
  "short_name": "Mecura",
  "name": "Mecura - Portal Médico e Saúde",
  "icons": [
    {
      "src": "/logo-192.png?v=3",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "/logo-512.png?v=3",
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
html = html.replace(/href="\/manifest\.json(\?v=\d+)?"/g, 'href="/manifest.json?v=3"');
html = html.replace(/href="\/logo\.png(\?v=\d+)?"/g, 'href="/logo-192.png?v=3"');
fs.writeFileSync('index.html', html, 'utf8');
