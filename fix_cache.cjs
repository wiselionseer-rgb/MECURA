const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/href="\/manifest\.json(\?v=\d+)?"/g, 'href="/manifest.json?v=2"');
html = html.replace(/href="\/logo\.png(\?v=\d+)?"/g, 'href="/logo.png?v=2"');
fs.writeFileSync('index.html', html, 'utf8');

let manifest = fs.readFileSync('public/manifest.json', 'utf8');
manifest = manifest.replace(/"src": "\/logo\.png(\?v=\d+)?"/g, '"src": "/logo.png?v=2"');
fs.writeFileSync('public/manifest.json', manifest, 'utf8');

console.log('Cache busting applied.');
