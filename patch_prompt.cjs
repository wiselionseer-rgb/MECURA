const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldPrompt = `        6. **RESUMO DE PRESCRIÇÃO SUGERIDA** (Lista estrita, NÃO USE TABELAS):
           
           **OPÇÕES IMPORTADAS (CATÁLOGO OFICIAL):**
           (Para cada produto importado sugerido, use EXATAMENTE este bloco)
           **Medicamento**: (Nome fiel ao catálogo)
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação, ex: 2 gotas, 12/12 horas)
           **Observações**: (Dicas de administração)

           **OPÇÕES NACIONAIS (ASSOCIAÇÕES BRASILEIRAS):**
           (Para cada produto nacional sugerido - Óleos, Pomadas, Gomas ou Flores in natura, use EXATAMENTE este bloco)
           **Medicamento**: (Descrição da formulação, ex: Óleo CBD 50mg/ml + THC 2mg/ml - Associação Nacional)
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação)
           **Observações**: (Dicas cruciais de administração e via de uso)`;

const newPrompt = `        6. **RESUMO DE PRESCRIÇÃO SUGERIDA** (Lista estrita, NÃO USE TABELAS):
           
           **OPÇÕES IMPORTADAS (CATÁLOGO OFICIAL):**
           (Gere um tratamento COMPLETO e IDEAL usando APENAS produtos do catálogo oficial importado. Inclua o óleo principal e produtos complementares, se necessário, garantindo que o paciente tenha um kit completo de tratamento importado.)
           (Para CADA produto importado sugerido, use EXATAMENTE este bloco)
           **Medicamento**: (Nome fiel ao catálogo)
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação, ex: 2 gotas, 12/12 horas)
           **Observações**: (Dicas de administração)

           **OPÇÕES NACIONAIS (ASSOCIAÇÕES BRASILEIRAS):**
           (Gere um tratamento COMPLETO e IDEAL equivalente usando APENAS formulações genéricas de Associações Nacionais. Inclua o óleo principal e complementos, garantindo que o paciente tenha um kit completo de tratamento nacional como alternativa direta ao importado.)
           (Para CADA produto nacional sugerido, use EXATAMENTE este bloco e DEVE INCLUIR o texto "- Associação Nacional" no nome)
           **Medicamento**: (Descrição da formulação, ex: Óleo CBD 50mg/ml + THC 2mg/ml - Associação Nacional)
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação)
           **Observações**: (Dicas cruciais de administração e via de uso)`;

code = code.replace(oldPrompt, newPrompt);
fs.writeFileSync(path, code);
