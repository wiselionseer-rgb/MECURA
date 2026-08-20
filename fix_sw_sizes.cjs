const fs = require('fs');
let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/\/logo\.png/g, '/logo-192.png');
fs.writeFileSync('public/sw.js', sw, 'utf8');

let notif = fs.readFileSync('src/utils/notifications.ts', 'utf8');
notif = notif.replace(/\/logo\.png/g, '/logo-192.png');
fs.writeFileSync('src/utils/notifications.ts', notif, 'utf8');
