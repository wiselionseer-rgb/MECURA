const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<link rel="icon" type="image\/x-icon" href="[^"]*" \/>\n\s*/g, '');
html = html.replace(/<link rel="icon" type="image\/png" href="[^"]*" \/>/g, '<link rel="icon" type="image/png" href="/favicon.ico?v=7" />');
html = html.replace(/href="\/manifest\.json\?v=6"/g, 'href="/manifest.json?v=7"');
html = html.replace(/href="\/logo-192\.png\?v=6"/g, 'href="/logo-192.png?v=7"');

fs.writeFileSync('index.html', html, 'utf8');
