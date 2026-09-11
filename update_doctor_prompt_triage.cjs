const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetTriage = `        - Histórico Médico: Tratamento Atual (\${patientAnswers?.tratamento_atual ? 'Sim' : 'Não'}), Uso de Fármacos (\${patientAnswers?.remedios ? 'Sim' : 'Não'}), Comorbidade Crônica (\${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}), Uso Prévio de Cannabis (\${patientAnswers?.cannabis ? 'Sim' : 'Não'})`;

const newTriage = `        - Histórico Médico e Social COMPLETO: 
          Tratamento Atual (\${patientAnswers?.tratamento_atual ? 'Sim' : 'Não'}), Uso de Fármacos (\${patientAnswers?.remedios ? 'Sim' : 'Não'}), 
          Comorbidade Crônica (\${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}), Cirurgia (\${patientAnswers?.cirurgia ? 'Sim' : 'Não'}), 
          Alergias (\${patientAnswers?.alergia ? 'Sim' : 'Não'}), Problemas Digestivos (\${patientAnswers?.digestivo ? 'Sim' : 'Não'}), 
          Uso Prévio de Cannabis (\${patientAnswers?.cannabis ? 'Sim' : 'Não'}).
        - Psicomotor e Riscos: Dirige (\${patientAnswers?.dirige ? 'Sim' : 'Não'}), Opera Maquinário (\${patientAnswers?.maquinario ? 'Sim' : 'Não'}), 
          Blitz/Frequente (\${patientAnswers?.blitz ? 'Sim' : 'Não'}), Laudo Psicomotor (\${patientAnswers?.laudo_psicomotor ? 'Sim' : 'Não'}).
        - Cardiovascular e Saúde Mental: Arritmia (\${patientAnswers?.arritmia ? 'Sim' : 'Não'}), 
          Histórico Psicose/Esquizofrenia (\${patientAnswers?.psicose_hist || patientAnswers?.esquizofrenia_diag || patientAnswers?.esquizofrenia_parente ? 'Sim' : 'Não'}), 
          Pânico/Ansiedade (\${patientAnswers?.panico || patientAnswers?.ansiedade_diag ? 'Sim' : 'Não'}), Estresse (\${patientAnswers?.estresse ? 'Sim' : 'Não'}).
        - Hábitos de Vida: Fuma (\${patientAnswers?.fuma ? 'Sim' : 'Não'}), Bebida Alcoólica (\${patientAnswers?.bebida ? 'Sim' : 'Não'}), 
          Atividade Física (\${patientAnswers?.exercicio ? 'Sim' : 'Não'}).`;

if(code.includes(targetTriage)) {
  code = code.replace(targetTriage, newTriage);
} else {
  console.log("targetTriage not found");
}

const targetFormat = `           (Para CADA produto importado sugerido, use EXATAMENTE este bloco)
           **Medicamento**: (Nome fiel ao catálogo, EX: "Óleo Drops By GreenBudz..." ou "GreenBudz...")
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação, ex: 2 gotas, 12/12 horas)
           **Observações**: (Dicas de administração)

           **OPÇÕES NACIONAIS (ASSOCIAÇÕES BRASILEIRAS):**
           (Gere um tratamento COMPLETO e IDEAL equivalente usando APENAS formulações genéricas de Associações Nacionais. Inclua o óleo principal e complementos, garantindo que o paciente tenha um kit completo de tratamento nacional como alternativa direta ao importado.)
           (Para CADA produto nacional sugerido, use EXATAMENTE este bloco e DEVE INCLUIR o texto "- Associação Nacional" no nome. NUNCA sugira "GreenBudz" aqui.)
           **Medicamento**: (Descrição da formulação, ex: Óleo CBD 50mg/ml + THC 2mg/ml - Associação Nacional)
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação)
           **Observações**: (Dicas cruciais de administração e via de uso)`;

const newFormat = `           (Para CADA produto sugerido, VOCÊ DEVE OBRIGATORIAMENTE começar o bloco com a palavra "Medicamento:")
           Medicamento: (Nome fiel ao catálogo)
           Indicação: (Condição primária alvo)
           Modo de Uso: (Posologia e titulação)
           Observações: (Dicas de administração)

           **OPÇÕES NACIONAIS (ASSOCIAÇÕES BRASILEIRAS):**
           (Gere um tratamento COMPLETO e IDEAL equivalente usando APENAS formulações genéricas de Associações Nacionais.)
           (Para CADA produto nacional sugerido, OBRIGATORIAMENTE comece com a palavra "Medicamento:" e INCLUA o texto "- Associação Nacional" no nome. NUNCA sugira "GreenBudz" aqui.)
           Medicamento: (Descrição da formulação - Associação Nacional)
           Indicação: (Condição primária alvo)
           Modo de Uso: (Posologia e titulação)
           Observações: (Dicas cruciais de administração e via de uso)`;

if(code.includes(targetFormat)) {
  code = code.replace(targetFormat, newFormat);
} else {
  console.log("targetFormat not found");
}

fs.writeFileSync(path, code);
console.log("Success updating doctor prompt triage and format");
