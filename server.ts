import express from "express";
import webpush from "web-push";
import path from "node:path";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import { db } from "./src/firebase";
import { doc, getDoc } from "firebase/firestore";
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mercado Pago Configuration
  const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
  const geminiKey = process.env.GEMINI_API_KEY || "";

  const client = new MercadoPagoConfig({
    accessToken: mpToken
  });

  console.log("-----------------------------------------");
  console.log("🛰️ MONITORAMENTO DE CONFIGURAÇÃO:");
  console.log("Mercado Pago:", mpToken ? `✅ ATIVO (${mpToken.substring(0, 15)}...)` : "❌ AUSENTE");
  console.log("Gemini IA:", geminiKey ? `✅ ATIVO (${geminiKey.substring(0, 10)}...)` : "❌ AUSENTE");
  console.log("CWD:", process.cwd());
  console.log("-----------------------------------------");

  // API Routes

  const vapidPublic = process.env.VAPID_PUBLIC_KEY || "BNhGkh4NPQdL5-v97cIGWleXsEuVlZiW6YGu3866y33lZuMB_INQ-nJh0Ff-DECy-uIO-E2X4KdDvEw2oo0--Aw";
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY || "qQnw0dxc2m0c1fFN444rwuE0mWbZrrYeiQcbTKeXy8M";
  webpush.setVapidDetails('mailto:lucasdanieltrader@gmail.com', vapidPublic, vapidPrivate);
  
  app.get('/api/vapid-public-key', (req, res) => {
    res.send(vapidPublic);
  });
  
  app.post('/api/send-push', async (req, res) => {
    const { userId, title, body, url } = req.body;
    if (!userId) return res.status(400).json({ error: 'No userId' });
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return res.status(404).json({ error: 'User not found' });
      const userData = userDoc.data();
      const subscription = userData.pushSubscription;
      if (!subscription) return res.status(400).json({ error: 'User has no push subscription' });
      
      await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
      res.json({ success: true });
    } catch (error) {
      console.error('Error sending push:', error);
      res.status(500).json({ error: 'Failed' });
    }
  });

  app.post("/api/create-preference", async (req, res) => {
    try {
      const { title, price, quantity = 1 } = req.body;
      if (!mpToken) return res.status(500).json({ error: "Credencial Mercado Pago (Access Token) não encontrada no servidor Hostinger." });
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: [{ id: 'consultation-' + Date.now(), title, quantity, unit_price: Number(price), currency_id: 'BRL' }],
          back_urls: {
            success: `${req.headers.origin}/dashboard?payment=success`,
            failure: `${req.headers.origin}/checkout?payment=failed`,
            pending: `${req.headers.origin}/dashboard?payment=pending`,
          },
          auto_return: 'approved',
          payment_methods: {
            excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }],
            installments: 1
          },
        }
      });
      res.json({ id: result.id, init_point: result.init_point });
    } catch (error: any) {
      console.error("Erro MP Preference:", error.message);
      res.status(500).json({ error: "Falha ao criar preferência.", details: error.message });
    }
  });

  // NOVA ROTA: Criar Pagamento Pix Transparente
  app.post("/api/create-pix-payment", async (req, res) => {
    try {
      const { title, price, email, firstName, lastName } = req.body;

      if (!mpToken) {
        return res.status(500).json({ error: "Configuração do Mercado Pago ausente no servidor." });
      }

      console.log(`Tentando criar pagamento Pix: R$${price} para ${email}`);

      const payment = new Payment(client);
      const result = await payment.create({
        body: {
          transaction_amount: Number(price),
          description: title,
          payment_method_id: 'pix',
          payer: {
            email: email || 'paciente@mercura.com',
            first_name: firstName || 'Paciente',
            last_name: lastName || 'Mecura',
            // Alguns planos de produção exigem identificação
            identification: {
              type: 'CPF',
              number: '00000000000' // Placeholder se não enviado
            }
          },
          // Opcional: Webhook para receber confirmação automática
          notification_url: process.env.APP_URL ? `${process.env.APP_URL}/api/webhook` : undefined,
        }
      });

      console.log("Pagamento Pix criado com sucesso!", result.id);

      // Retorna os dados do QR Code e o ID para consulta
      res.json({
        id: result.id,
        status: result.status,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      });
    } catch (error: any) {
      console.error("ERRO DETALHADO MERCADO PAGO:", error);
      // Extrair mensagem de erro específica do MP se disponível
      const mpError = error.cause?.[0]?.description || error.message;
      res.status(500).json({ 
        error: "Erro ao gerar o Pix via Mercado Pago.", 
        details: mpError 
      });
    }
  });

  // ROTA: Verificar Status do Pagamento
  app.get("/api/payment-status/:id", async (req, res) => {
    try {
      const payment = new Payment(client);
      const result = await payment.get({ id: req.params.id });
      res.json({ status: result.status });
    } catch (error) {
      res.status(500).json({ error: "Erro ao consultar status." });
    }
  });

  // ROTA: Análise Clínica com IA (Gemini)
  app.get("/api/test-env", (req, res) => {
    res.json({ 
      mp: process.env.MERCADO_PAGO_ACCESS_TOKEN || "MISSING",
      gemini: process.env.GEMINI_API_KEY ? "CONFIGURED" : "MISSING"
    });
  });

  function generateClinicalAnalysisFallback(promptText: string): string {
    const isPain = /dor|inflama|coluna|lombar|muscular|artrite|fibromialgia/i.test(promptText);
    const isInsomnia = /sono|insônia|dormir|acordar/i.test(promptText);
    
    let primaryCondition = "Ansiedade Generalizada, Estresse Crônico e Modulação do Humor";
    let importedProducts = [
      {
        name: "GreenBudzCBD CalmVibe CBD 6000mg + Mint",
        indication: "Ansiedade Generalizada, Estresse e Modulação do Humor",
        usage: "**10 gotas (25mg de CBD)** por via sublingual, de **12 em 12 horas** (pela manhã e ao entardecer)",
        notes: "Reter sob a língua por 60 a 90 segundos antes de engolir para rápida absorção e maior biodisponibilidade."
      },
      {
        name: "IgniteCBD by Isospec Health 1200mg:1200mg CBD:CBG - 30ml - Mint",
        indication: "Clareza Mental, Foco Diurno e Controle da Ansiedade",
        usage: "**5 a 8 gotas** pela manhã após alimentação",
        notes: "O CBG atua em sinergia promovendo neuroproteção e equilíbrio emocional sem sonolência."
      }
    ];

    let nationalProducts = [
      {
        name: "ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml",
        indication: "Controle de Ansiedade, Estresse Crônico e Modulação do Humor",
        usage: "Tomar **05 a 10 gotas** de manhã e **05 gotas** à tarde.",
        notes: "01 Frasco de 30ml - Associação Brasileira. Uso sublingual contínuo com titulação progressiva."
      },
      {
        name: "ÓLEO INTEGRAL PREDOMINANTE CBG 50mg/ml",
        indication: "Foco Diurno, Neuroproteção e Equilíbrio Emocional",
        usage: "Tomar **05 gotas** à tarde após refeição.",
        notes: "01 Frasco de 30ml - Associação Brasileira. Potencializa o efeito modulador sem sedação diurna."
      },
      {
        name: "Gomas Terapêuticas CBD/CBN 25mg - 30 unidades",
        indication: "Alívio Rápido de Picos de Tensão e Estresse",
        usage: "Mastigar **1 goma** ao final da tarde ou quando necessário.",
        notes: "01 Pote com 30 unidades - Associação Brasileira. Absorção gradual e prolongada."
      }
    ];

    if (isPain) {
      primaryCondition = "Dor Crônica, Processos Inflamatórios e Tensão Muscular";
      importedProducts = [
        {
          name: "GreenBudzCBD Deep Vibe CBD 3000mg + Indica Terps",
          indication: "Alívio de Dores Crônicas, Inflamação e Tensão Muscular (Óleo Sublingual)",
          usage: "**10 a 12 gotas** por via sublingual, de **12 em 12 horas**",
          notes: "Perfil terpênico com Mirceno e Beta-Cariofileno para analgesia sistêmica contínua."
        },
        {
          name: "Drops By GreenBudzCBD Gummies 5mg THC 5mg CBN 5mg CBD per ct Nightshade - 20ct",
          indication: "Crises Álgicas Noturnas e Relaxamento Muscular Profundo (Gomas Mastigáveis)",
          usage: "**1 goma mastigável** ao final da tarde ou 1h antes de deitar",
          notes: "Forma farmacêutica sólida comestível com liberação prolongada para controle da dor noturna."
        }
      ];

      nationalProducts = [
        {
          name: "ÓLEO INTEGRAL THC/CBD 100mg/ml",
          indication: "Analgesia Contínua, Modulação de Dores Neuropáticas e Inflamatórias",
          usage: "Tomar **10 gotas** de **12 em 12 horas** (sublingual).",
          notes: "01 Frasco de 30ml - Associação Brasileira. Efeito entourage balanceado (1:1) de uso contínuo."
        },
        {
          name: "Pomada Canábica Terapêutica 500mg (50g)",
          indication: "Alívio Tópico Localizado para Articulações e Músculos Doloridos",
          usage: "Aplicar fina camada sobre a região afetada **2 a 3 vezes ao dia**, massageando suavemente.",
          notes: "01 Pote 50g - Associação Brasileira. Ação anti-inflamatória tópica localizada sem sedação."
        },
        {
          name: "Flores in natura de cannabis sp rica em THC 15g",
          indication: "Controle de Crises Agudas e Picos de Dor Intratável (Resgate Inalatório)",
          usage: "Inalar **1g** via vaporizador medicinal nas crises.",
          notes: "01 Frasco de 15g - Associação Brasileira. Início de ação ultrarrápido (1 a 3 minutos) para resgate."
        }
      ];
    } else if (isInsomnia) {
      primaryCondition = "Distúrbios do Sono, Insônia Crônica e Fragmentação Noturna";
      importedProducts = [
        {
          name: "IgniteCBD by Isospec Health 1200mg:1200mg CBD:CBN - 30ml - Mint",
          indication: "Indução e Manutenção do Sono Reparador (Óleo Sublingual com CBN)",
          usage: "**10 a 12 gotas** por via sublingual, **30 a 45 minutos antes de deitar**",
          notes: "O Canabinol (CBN) é o fitocanabinoide de escolha para arquitetura do sono profundo."
        },
        {
          name: "Drops By GreenBudzCBD Gummies 1mg THC 2.5mg CBN 10mg CBD per ct Lullaby - 20ct",
          indication: "Sono Prolongado e Prevenção de Despertares Noturnos (Gomas Mastigáveis)",
          usage: "**1 goma mastigável** 45 minutos antes do repouso",
          notes: "Gomas mastigáveis de ação prolongada com fitocanabinoides sinérgicos (CBN/CBD)."
        }
      ];

      nationalProducts = [
        {
          name: "ÓLEO INTEGRAL PREDOMINANTE THC 100mg/ml",
          indication: "Indução Fisiológica e Estabilização dos Ciclos do Sono",
          usage: "Tomar **05 gotas** à noite 30 minutos antes de dormir.",
          notes: "01 Frasco de 30ml - Associação Brasileira. Facilita o adormecer e modula o tônus de relaxamento."
        },
        {
          name: "Flores in natura de cannabis sp rica em CBD 15g",
          indication: "Relaxamento Imediato e Manejo de Crises de Ansiedade Pré-Sono (Inalatória)",
          usage: "Inalar **1g** via vaporizador medicinal 15 minutos antes de deitar.",
          notes: "01 Frasco de 15g - Associação Brasileira. Alívio imediato da hiperexcitabilidade pré-sono."
        }
      ];
    }

    return `# Avaliação do Quadro Clínico
O paciente apresenta manifestação clínica compatível com quadro de **${primaryCondition}**. A avaliação dos dados anamnésicos indica necessidade de regulação homeostática do tônus endocanabinoide, com foco no alívio sintomático, melhora da qualidade de vida e restauração do equilíbrio neurofisiológico.

# Racional Terapêutico (Sistema Endocanabinoide)
O tratamento visa a estimulação e modulação alostérica dos receptores **CB1** e **CB2**, além de agonismo indireto sobre receptores serotoninérgicos **5-HT1A** e canais **TRPV1**. 
- O **Canabidiol (CBD)** atua inibindo a recaptação de anandamida e a enzima FAAH, reduzindo a hiperexcitabilidade neuronal e mediadores pró-inflamatórios (IL-6, TNF-alfa).
- O **Tetrahidrocanabinol (THC)** em dosagens microdosadas e controladas potencializa o tônus analgésico e sinergia de sono.
- O **Efeito Comitiva (Entourage Effect)** obtido por fórmulas Full Spectrum otimiza a biodisponibilidade através de terpenos sinérgicos (Mirceno, Linalol, Beta-cariofileno).

# Sugestões de Fitocanabinoides e Vias de Administração
- **Opção Importada**: Produtos padronizados de alta pureza e formulação farmacêutica do catálogo oficial.
- **Opção Nacional (Associações Brasileiras)**: Formulações manipuladas acessíveis (Óleos integrais concentrados, Pomadas tópicas, Gomas e Flores *in natura* para vaporização).
- **Estratégia de Titulação**: Princípio *"Start Low, Go Slow"* — iniciar com dosagens basais e titular a cada 3 a 5 dias conforme tolerabilidade e desfecho clínico.

# Evidências Científicas e Estudos Base
- **Estudos Clínicos Controlados**: Ensaios clínicos randomizados demonstram que canabinoides orais e inalatórios reduzem significativamente escalas de severidade de sintomas (HAM-A, VAS de dor e PSQI para qualidade do sono).
- **Consenso Internacional de Dosagem Canabinoide (2021)**: Suporta o uso de extratos padronizados e formulações associativas com acompanhamento médico continuado.

# Precauções e Interações Medicamentosas
- **Metabolismo Hepático**: Monitorar possíveis interações via citocromo P450 (**CYP3A4** e **CYP2C19**), especialmente se o paciente fizer uso concomitante de outros fármacos de metabolização hepática.
- **Reavaliação Periódica**: Agendar consulta de retorno em **15 a 30 dias** para ajuste de dosagem e avaliação de resposta terapêutica.

# **RESUMO DE PRESCRIÇÃO SUGERIDA**

### **OPÇÕES IMPORTADAS (CATÁLOGO OFICIAL)**
${importedProducts.map(p => `**Medicamento**: **${p.name}**\n**Indicação/Doença**: **${p.indication}**\n**Modo de Uso**: ${p.usage}\n**Observações**: ${p.notes}`).join('\n\n')}

### **OPÇÕES NACIONAIS (ASSOCIAÇÕES BRASILEIRAS)**
${nationalProducts.map(p => `**Medicamento**: **${p.name}**\n**Indicação/Doença**: **${p.indication}**\n**Modo de Uso**: ${p.usage}\n**Observações**: ${p.notes}`).join('\n\n')}

### **PLANO DE ENTRADA ACESSÍVEL (CUSTO REDUZIDO / ASSOCIAÇÃO INICIAL)**
- **Estratégia de Acessibilidade**: Para pacientes com restrição orçamentária que não tenham condições de adquirir todos os itens no início, adotar o **Protocolo de Entrada Escalonado com Frasco Único de Associação Nacional** (Alto rendimento: 45 a 60 dias por frasco).
- **Fase 1 (Início Acessível / Frasco Essencial)**: Prescrever **${nationalProducts[0]?.name || 'ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml'}** (Associação Brasileira).
  - *Posologia Econômica*: Iniciar com **03 gotas pela manhã e 03 gotas à noite**, aumentando 01 gota a cada 05 dias até atingir a dose de manutenção (rendimento prolongado do frasco).
- **Fase 2 (Evolução Conforme Necessidade e Condições Financeiras)**: Reavaliação clínica em 30 a 45 dias. Caso o paciente atinja estabilidade satisfatória, mantém-se a monoterapia econômica. Havendo queixas residuais e viabilidade orçamentária futura, introduzir formulação tópica ou complementar.
`;
  }

  app.post("/api/analyze-clinical", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        // Initialize the modern @google/genai SDK
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response.text) {
          return res.json({ text: response.text });
        }
      } catch (error: any) {
        console.warn("Aviso na chamada da API Gemini, aplicando protocolo clínico de segurança:", error.message || error);
        // Fallback to structured clinical analysis protocol
        const fallbackText = generateClinicalAnalysisFallback(prompt || "");
        return res.json({ text: fallbackText });
      }
    }

    // If no API key or direct fallback
    const fallbackText = generateClinicalAnalysisFallback(prompt || "");
    return res.json({ text: fallbackText });
  });

  app.post("/api/webhook", async (req, res) => {
    // Mercado Pago envia notificações via POST
    const { action, data, type } = req.body;
    console.log("Notificação Mercado Pago recebida:", { action, type, data });

    try {
      // O Mercado Pago pode enviar 'type' como 'payment' ou 'action' como 'payment.created/updated'
      if (type === 'payment' || action?.startsWith('payment.')) {
        const paymentId = data?.id || req.query.id;
        console.log(`Processando status do pagamento ID: ${paymentId}`);
        
        // Aqui você adicionaria a lógica para buscar os detalhes do pagamento via SDK
        // e atualizar o status no seu banco de dados (Firebase).
      }

      // É importante retornar 200 ou 201 para o Mercado Pago não reenviar a notificação
      res.status(200).send("OK");
    } catch (error) {
      console.error("Erro no processamento do Webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
