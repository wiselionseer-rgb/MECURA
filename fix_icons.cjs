const fs = require('fs');

// Update index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  '<link rel="apple-touch-icon" href="https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=192&auto=format&fit=crop" />',
  '<link rel="apple-touch-icon" href="/logo.png" />\n    <link rel="icon" type="image/png" href="/logo.png" />'
);
fs.writeFileSync('index.html', html, 'utf8');

// Update manifest.json
let manifest = fs.readFileSync('public/manifest.json', 'utf8');
manifest = manifest.replace(
  /"src": "https:\/\/images\.unsplash\.com\/photo-[^"]+"/g,
  '"src": "/logo.png"'
).replace(
  /"type": "image\/jpeg"/g,
  '"type": "image/png"'
);
fs.writeFileSync('public/manifest.json', manifest, 'utf8');

console.log('Icons configured to use /logo.png');
