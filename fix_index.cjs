const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('apple-touch-icon')) {
  html = html.replace(
    '<title>Mecura - Portal Médico</title>',
    '<title>Mecura - Portal Médico</title>\n    <link rel="apple-touch-icon" href="https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=192&auto=format&fit=crop" />\n    <meta name="apple-mobile-web-app-capable" content="yes">\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
  );
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Fixed index.html for iOS PWA.');
}
