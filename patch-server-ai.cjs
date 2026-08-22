const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');

const aiRoute = `
  app.post("/api/admin-agronomic-ai", async (req, res) => {
    const { medicalReportText, prescriptionText, agronomistName, agronomistCrea } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "Gemini API key não configurada. A funcionalidade de IA requer a chave no .env." });
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const systemPrompt = \`Você é um Agrônomo Especialista (Consultor Técnico) responsável por gerar um "Parecer Técnico" e "Indicações técnicas para cultivo pessoal com finalidade medicinal".
Seu objetivo é gerar um laudo agronômico completo com base no laudo médico e na receita do paciente.

ESTRUTURA OBRIGATÓRIA DO LAUDO (formato Markdown):
1. Título: "Auto cultivo para finalidade medicinal - Parecer Técnico"
2. Cabeçalho:
   - Paciente: (Nome do paciente extraído do laudo)
   - CPF: (CPF do paciente extraído do laudo)
   - Consultor e Eng. Agr: \${agronomistName || 'Wilian Dalenogare Pereira'}
   - (Se houver CREA fornecido, inclua: CREA: \${agronomistCrea})
3. Resumo: Explique a base legal (ANVISA RDC nº 335/2020 e 570/2021) e o objetivo do cultivo caseiro com boas práticas agrícolas (GACP).
4. Dimensionamento do Cultivo:
   - Apresente os custos aproximados se fosse comprado na farmácia.
   - Analise os produtos indicados na receita (ex: CBD, THC, CBG) e suas posologias.
   - Calcule a quantidade de frascos necessários anualmente.
   - Calcule a quantidade diária, mensal e anual (em mg) de canabinoides.
   - Faça as contas considerando uma planta com teor médio de 10% de CBD/THC.
   - Considerando eficiência de extração artesanal (80%), determine o peso total de flores secas anuais necessárias (ex: 18.250kg + 30% perdas = 23.795Kg).
5. Dimensionamento de Plantas e Sementes:
   - Explique o rendimento por planta em cultivo indoor (ex: 100-150g secas por planta).
   - Calcule o número total de plantas necessárias em ciclo completo.
   - Calcule o número de sementes (incluindo margem de perda de 30% na germinação).
6. Designer de cultivo (Plano de cultivo):
   - Sugira a divisão em ciclos (ex: 3 momentos de colheita ao longo de 120 dias cada).
   - Indique alternativas de manutenção de plantas mãe ou germinação contínua.
7. Cultivares indicados:
   - Recomende genéticas com foco na recomendação médica (ex: altas concentrações de CBD, indicando faixa percentual de 10-12%).
8. Observação Final: Laudo baseado nas informações médicas estritamente para a quantificação do cultivo, isentando o responsável de uso indevido.

Entradas Fornecidas:
LAUDO MÉDICO:
\${medicalReportText}

RECEITA MÉDICA:
\${prescriptionText}

GERAÇÃO:
Escreva O LAUDO COMPLETO E PROFISSIONAL, usando formatação Markdown. Crie uma estrutura lógica que faça os cálculos com base na dosagem real da receita médica fornecida.\`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
      });

      if (response.text) {
        return res.json({ markdown: response.text });
      }
    } catch (error) {
      console.error("Erro na API Gemini Agronômico:", error);
      return res.status(500).json({ error: "Falha ao processar com IA." });
    }
  });
`;

if (!code.includes('/api/admin-agronomic-ai')) {
  // Insert it right before app.post("/api/admin-catalog-ai"
  code = code.replace('app.post("/api/admin-catalog-ai"', aiRoute + '\n  app.post("/api/admin-catalog-ai"');
  fs.writeFileSync('server.ts', code);
  console.log('Server updated with agronomic API.');
} else {
  console.log('API already exists.');
}
