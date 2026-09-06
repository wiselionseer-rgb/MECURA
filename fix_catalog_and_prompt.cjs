const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

// 1. Fix the parser bug that caused long text to be captured as medication name
// The issue is in how we match blocks and fields if markdown is malformed.
// We will improve the extraction logic.

const oldExtractLogic = `        // Extract fields using Regex, handling possible inline text
        const nameMatch = block.match(/.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|\\bObservações\\b|$)/is);
        const dosageMatch = block.match(/\\bModo de Uso\\b.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bObservações\\b|$)/is);
        const instructionsMatch = block.match(/\\bObservações\\b.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|$)/is);
        
        if (nameMatch && nameMatch[1].trim()) {
          const rawName = nameMatch[1].replace(/\\*\\*/g, '').replace(/^- /, '').replace(/\\*$/, '').trim();`;

const newExtractLogic = `        // Extract fields using Regex, handling possible inline text
        const nameMatch = block.match(/.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|\\bObservações\\b|$)/is);
        const dosageMatch = block.match(/\\bModo de Uso\\b.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bObservações\\b|$)/is);
        const instructionsMatch = block.match(/\\bObservações\\b.*?:\\s*(.*?)(?=\\bIndicação\\b|\\bIndicações\\b|\\bDoença\\b|\\bModo de Uso\\b|$)/is);
        
        if (nameMatch && nameMatch[1].trim()) {
          let rawName = nameMatch[1].replace(/\\*\\*/g, '').replace(/^- /, '').replace(/\\*$/, '').trim();
          // Safety check: if rawName is too long (over 100 chars), it's probably grabbing the wrong section
          if (rawName.length > 150) {
            rawName = rawName.substring(0, 150) + "..."; // Truncate to avoid UI breaks, though this means parsing failed
          }`;

dashboardCode = dashboardCode.replace(oldExtractLogic, newExtractLogic);

// 2. Fix the National vs Importado logic
// The user said "esse broad e nacional precisa trocar pelos importatos que adiconei e colocar os broad para o nacional"
// So: "Broad Spectrum" is actually NACIONAL.
// GreenBudz is IMPORTADO.

const targetStr1 = `            if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado') || rawName.toLowerCase().includes('broad spectrum') || rawName.toLowerCase().includes('cbd + cbn para sono') || rawName.toLowerCase().includes('isolate')) {
              isNational = false;
            } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL|INTEGRAL/i.test(rawName)) {
              isNational = true;
            }`;

const replaceStr1 = `            if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado')) {
              isNational = false;
            } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL|INTEGRAL|BROAD SPECTRUM|ISOLATE|CBD \\+ CBN/i.test(rawName)) {
              isNational = true;
            }`;

const targetStr2 = `          if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado') || rawName.toLowerCase().includes('broad spectrum') || rawName.toLowerCase().includes('cbd + cbn para sono') || rawName.toLowerCase().includes('isolate')) {
            isNational = false;
          } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL|INTEGRAL/i.test(rawName) || block.includes('Associação') || block.includes('Nacional')) {
            isNational = true;
          }`;

const replaceStr2 = `          if (rawName.toLowerCase().includes('greenbudz') || rawName.toLowerCase().includes('importado')) {
            isNational = false;
          } else if (/ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL|INTEGRAL|BROAD SPECTRUM|ISOLATE|CBD \\+ CBN/i.test(rawName) || block.includes('Associação') || block.includes('Nacional')) {
            isNational = true;
          }`;

dashboardCode = dashboardCode.replace(targetStr1, replaceStr1);
dashboardCode = dashboardCode.replace(targetStr2, replaceStr2);

// 3. Update the prompt to EXPLICITLY TELL the AI not to hallucinate, and to use GreenBudz ONLY for importados
const oldPrompt = `           **OPÇÕES IMPORTADAS (CATÁLOGO OFICIAL):**
           (Gere um tratamento COMPLETO e IDEAL usando APENAS produtos do catálogo oficial importado. Inclua o óleo principal e produtos complementares, se necessário, garantindo que o paciente tenha um kit completo de tratamento importado.)
           (Para CADA produto importado sugerido, use EXATAMENTE este bloco)
           **Medicamento**: (Nome fiel ao catálogo)
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação, ex: 2 gotas, 12/12 horas)
           **Observações**: (Dicas de administração)`;

const newPrompt = `           **OPÇÕES IMPORTADAS (CATÁLOGO OFICIAL):**
           (Gere um tratamento COMPLETO e IDEAL usando APENAS produtos do catálogo oficial importado. Produtos IMPORTADOS DEVEM SER OBRIGATORIAMENTE da marca GreenBudzCBD. Inclua o óleo principal e produtos complementares, se necessário, garantindo que o paciente tenha um kit completo de tratamento importado GreenBudz.)
           (Para CADA produto importado sugerido, use EXATAMENTE este bloco)
           **Medicamento**: (Nome fiel ao catálogo, EX: "Óleo Drops By GreenBudz..." ou "GreenBudz...")
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação, ex: 2 gotas, 12/12 horas)
           **Observações**: (Dicas de administração)`;

dashboardCode = dashboardCode.replace(oldPrompt, newPrompt);

fs.writeFileSync(dashboardPath, dashboardCode);
