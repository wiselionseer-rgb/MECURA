const fs = require('fs');
const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/href=\{catalogUrl \|\| 'https:\/\/greenbudz.com\/catalog'\}/, "href={'/catalogo-inalada.pdf'}");
code = code.replace(/href=\{catalogUrlNacional \|\| '#'\}/, "href={'/catalogo-oral.pdf'}");

fs.writeFileSync(path, code);
