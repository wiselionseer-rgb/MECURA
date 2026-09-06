const fs = require('fs');
const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/href=\{'\/Guia de Produtos Via Inalada.pdf'\}/, "href={'/catalogo-inalada.pdf'}");
code = code.replace(/href=\{'\/GreenBudz_Guia de Produtos Via Oral.pdf'\}/, "href={'/catalogo-oral.pdf'}");

fs.writeFileSync(path, code);
