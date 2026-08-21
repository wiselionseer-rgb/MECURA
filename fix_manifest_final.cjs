const fs = require('fs');
const manifest = {
  "short_name": "Mecura",
  "name": "Mecura - Portal Médico",
  "icons": [
    {
      "src": "/logo-192.png",
      "type": "image/png",
      "sizes": "192x192",
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
html = html.replace(/href="\/manifest\.json(\?v=\d+)?"/g, 'href="/manifest.json?v=4"');
html = html.replace(/href="\/logo-192\.png(\?v=\d+)?"/g, 'href="/logo-192.png"');
if (!html.includes('favicon.ico')) {
  html = html.replace('<head>', '<head>\n    <link rel="icon" type="image/x-icon" href="/favicon.ico" />');
}
fs.writeFileSync('index.html', html, 'utf8');
