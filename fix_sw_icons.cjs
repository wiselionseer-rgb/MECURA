const fs = require('fs');

let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/https:\/\/images\.unsplash\.com\/photo-1611078696894-681f215e9858\?q=80&w=\d+&auto=format&fit=crop/g, '/logo.png');
fs.writeFileSync('public/sw.js', sw, 'utf8');

let notif = fs.readFileSync('src/utils/notifications.ts', 'utf8');
notif = notif.replace(/https:\/\/images\.unsplash\.com\/photo-1611078696894-681f215e9858\?q=80&w=\d+&auto=format&fit=crop/g, '/logo.png');
fs.writeFileSync('src/utils/notifications.ts', notif, 'utf8');

console.log('Fixed icons in sw.js and notifications.ts');
