const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetPrompt = `           (Gere um tratamento COMPLETO e IDEAL usando APENAS produtos do catálogo oficial importado. Produtos IMPORTADOS DEVEM SER OBRIGATORIAMENTE da marca GreenBudzCBD. Inclua o óleo principal e produtos complementares, se necessário, garantindo que o paciente tenha um kit completo de tratamento importado GreenBudz.)`;

const newPrompt = `           (Gere um tratamento COMPLETO e IDEAL usando APENAS produtos do catálogo oficial importado. Produtos IMPORTADOS DEVEM SER OBRIGATORIAMENTE da marca GreenBudzCBD. Inclua o óleo principal e produtos complementares. USE EXATAMENTE O NOME DO CATÁLOGO: Ex: "GreenBudz Calm Vibe Oil 6000mg" ou "Drops By GreenBudz Goma Nightshade", NAO abrevie.)`;

if(code.includes(targetPrompt)) {
  code = code.replace(targetPrompt, newPrompt);
}

const targetNational = `           (Para CADA produto nacional sugerido, use EXATAMENTE este bloco e DEVE INCLUIR o texto "- Associação Nacional" no nome. IMPORTANTE: NUNCA sugira produtos da marca "GreenBudz" ou "Drops By GreenBudz" na lista de Nacionais. Eles SÃO IMPORTADOS.)`;
const newNational = `           (Para CADA produto nacional sugerido, use EXATAMENTE este bloco e DEVE INCLUIR o texto "- Associação Nacional" no nome. NUNCA sugira "GreenBudz" aqui.)`;

if(code.includes(targetNational)) {
  code = code.replace(targetNational, newNational);
}

fs.writeFileSync(path, code);
console.log("Success patching doctor prompt");
