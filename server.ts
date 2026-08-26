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
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
    console.log('[PUSH] Request received for userId:', userId, 'Title:', title);
    if (!userId) {
      console.warn('[PUSH] No userId provided');
      return res.status(400).json({ error: 'No userId' });
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.warn('[PUSH] User not found in DB:', userId);
        return res.status(404).json({ error: 'User not found' });
      }
      const userData = userDoc.data();
      const subscription = userData.pushSubscription;
      if (!subscription) {
        console.warn('[PUSH] User has no push subscription:', userId);
        return res.status(400).json({ error: 'User has no push subscription' });
      }
      
      await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }), { urgency: 'high', TTL: 86400 });
      console.log('[PUSH] Successfully sent Web Push to:', userId);
      res.json({ success: true });
    } catch (error) {
      console.error('[PUSH] Error sending Web Push:', error);
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
  app.get("/api/check-payment/:id", async (req, res) => {
    try {
      if (!mpToken) {
        return res.status(500).json({ error: "Configuração do Mercado Pago ausente." });
      }
      const payment = new Payment(client);
      const result = await payment.get({ id: req.params.id });
      res.json({ status: result.status });
    } catch (error) {
      console.error("Erro ao checar pagamento:", error);
      res.status(500).json({ error: "Failed to check payment" });
    }
  });

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

  
  
  app.post("/api/admin-agronomic-ai", async (req, res) => {
    const { medicalReportText, prescriptionText, medicalReportFile, prescriptionFile, agronomistName, agronomistCrea, targetPlants } = req.body;
    
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

      const systemPrompt = `Você é um assistente que gera laudos agronômicos de autocultivo medicinal para instrução de processos de Habeas Corpus (HC).
O usuário deseja que o laudo tenha o texto IDÊNTICO ao modelo fornecido por ele, alterando APENAS as variáveis matemáticas e os dados do paciente com base na receita/laudo médico enviados.

ATENÇÃO AOS CÁLCULOS (Siga estritamente):
${targetPlants ? `O USUÁRIO DEFINIU UMA QUANTIDADE EXATA DE PLANTAS A SEREM RECOMENDADAS: ${targetPlants} plantas.
Você DEVE ajustar TODOS os seus cálculos para que o resultado final "Plantas totais" seja EXATAMENTE ${targetPlants}. Refaça a matemática de trás para frente se necessário (ajustando a mg/dia ou rendimento/teor para bater essa meta perfeitamente).` : ''}

1. Extraia o total de mg/dia de todos os óleos/flores prescritos. (Se a receita enviada for a do exemplo, o valor é 5000mg/dia). ${targetPlants ? '*(Ajuste isso ou o rendimento para bater o total de plantas desejado)*' : ''}
2. Mensal = mg/dia * 30.
3. Anual = mg/dia * 365 (Ex: se 5000mg/dia, anual é 1.825.000mg ou 1.825g).
4. Peso de flor seca base: assuma rendimento de extração (se aplicável) e teor. (No modelo: 10% de teor, ou seja, 1.825g canabinoides = 18.250g de flores secas, que equivale a 18.250kg).
5. Margem de perda de 30% no cultivo. Multiplique o peso de flor seca por 1.30.
6. Plantas totais: Divida o peso final com margem por 150g (rendimento por planta). ${targetPlants ? `(OBRIGATÓRIO RESULTAR EM ${targetPlants} PLANTAS)` : ''}
7. Sementes: Total de plantas * 1.30 (Margem de germinação de 30%). (Ex: 158 * 1.30 = 205.4 -> 206 sementes).
8. Ciclos: 3 colheitas por ano. Plantas por ciclo = Total de Plantas / 3.

Use a estrutura de HTML abaixo. Não mude as palavras, não crie resumos próprios. Copie e cole este HTML e apenas PREENCHA OS DADOS entre colchetes [ ]:

<div style="font-family: Arial, sans-serif; color: #000; line-height: 1.6; max-width: 800px; margin: 0 auto; text-align: justify; padding: 20px;" id="agronomic-report-content">
    <div style="text-align: center; font-weight: bold; margin-bottom: 20px; line-height: 1.2;">
        <p style="margin: 0;">Auto cultivo para finalidade medicinal</p>
        <p style="margin: 0;">Parecer Técnico</p>
        <p style="margin: 0;">Indicações técnicas para cultivo pessoal com finalidade medicinal</p>
        <p style="margin: 0;">Paciente: [NOME DO PACIENTE]</p>
        <p style="margin: 0;">CPF PACIENTE: [CPF DO PACIENTE]</p>
        <p style="margin: 0;">Consultor e Eng. Agr: ${agronomistName || 'Wilian Dalenogare Pereira'}</p>
        <p style="margin: 0;">Indicações técnicas para cultivo pessoal de Cannabis sativa L. com finalidade medicinal.</p>
    </div>

    <p style="font-weight: bold; margin-bottom: 10px;">Resumo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A ANVISA definiu, por meio da Resolução da Diretoria Colegiada (RDC) nº 335/2020, alterada pela RDC n° 570/2021, os critérios e os procedimentos para a importação de Produto derivado de Cannabis, por pessoa física, para uso próprio, mediante prescrição de profissional legalmente habilitado, para tratamento de saúde. Dessa forma, ainda que o produto não tenha registro para comercialização no Brasil, a importação poderá ser autorizada se os critérios e procedimentos definidos na mencionada RDC forem cumpridos. E, dessa forma, a ANVISA publicou, em 6/10/2021, a Nota Técnica nº 37/2021/SEI/COCIC/GPCON/GGMON/DIRE5/ANVISA com a lista de produtos derivados de Cannabis de que trata o §3º do Art. 5° da RDC n° 335/2020, alterada pela RDC n° 570/2021 (disponível em https://www.gov.br/anvisa/pt-br/assuntos/noticiasanvisa/2021/anvisa-otimiza-processo-de-avaliacao-da-importacao-de-produtosderivados-de-cannabis-por-pessoa-fisica/NotaTcnicaCannabis.pdf - Acesso em 13/10/2023).</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A fim de proporcionar uma orientação adequada para um cultivo em escala pequena, conhecido como “cultivo caseiro”, para paciente que necessita utilizar as moléculas produzidas pela espécie, nomeadamente o Δ9 – Tetrahidrocanabinol (THC) e o Cannabidiol (CBD) reconhecidas por suas propriedades terapêuticas, foi elaborado este parecer com indicações técnicas para o cultivo com boas práticas comercialmente conhecido por GACP (Good Agriculture and Collection Practices), em português, boas práticas de agricultura e coleta, aplicadas para garantir o sucesso em termos de produtividade e a sanidade adequada dos cultivos (métodos estes aplicados as mais diversas espécies de interesse medicinal e alimentar, não restrito a Cannabis).</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Dimensionamento do Cultivo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">O cultivo caseiro é a maneira indicada de garantir o acesso aos medicamentos para pacientes que não tem condições de arcar com os altos custos dos medicamentos atualmente disponíveis, que normalmente ultrapassa a barreira dos R$ 2.000,00 a R$5.000,00 mensais, para produtos disponíveis nacionalmente, podendo atingir até valores muito mais elevados quando é feita a importação (principalmente em momento de alta do Dólar). Porém não somente pacientes que não tem condições de pagar os preços de mercado dos produtos de sua medicina e ter a capacidade de se tornarem autossustentáveis em produção e manipulação da mesma buscam o cultivo da Cannabis e os benefícios que este pode trazer.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Estes medicamentos contem em média, entre 5-6G de CBD em sua composição, por frasco de 30 ml (200 mg no CBD/ml), e teores mais reduzidos de THC, devido ao seu efeito psicoativo. No caso do paciente, conforme recomendações médicas que balizam este parecer técnico, a condição de [CIDs E DOENÇAS EXTRAÍDAS DO LAUDO MÉDICO, ex: Transtorno de Distúrbios no Sono (CID 10 G47) Lombalgia ( CID 10 R54.5)] visam ser tratado com o uso de extratos de [CANNABINOIDES DA RECEITA, ex: CBD/THC/CBG] em uma concentração de [CONCENTRAÇÃO], sendo necessários cerca de [FRASCOS MENSAIS/ANUAIS] frascos do produto para um período de 12 meses.</p>
    
    <p style="text-indent: 40px; margin-bottom: 15px;">No total o paciente irá necessitar o equivalente a [TOTAL DE FRASCOS] frascos anuais dos produtos, que totalizam um consumo diário de:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">[TOTAL_MG_DIA]mg/dia de Óleo CBD/THC/CBG óleo integral artesanal.</p>
    
    <p style="text-indent: 40px; margin-bottom: 15px;">Extrapolando o uso de CBD para intervalos mensais e anuais, temos que o paciente vai necessitar:</p>
    <p style="margin-left: 40px; margin-bottom: 15px;">
        Diário: [TOTAL_MG_DIA]mg de CBD/THC/CBG.<br>
        (total obtido através da quantidade de mg diárias de extratos e óleo que o paciente é indicado a ingerir)<br>
        Mensal: [TOTAL_MG_DIA]mg x 31 dias = [TOTAL_MG_MENSAL] mg ou [TOTAL_G_MENSAL]g de CBD/THC/CBG.<br>
        Anual: [TOTAL_MG_DIA]mg x 365 dias = [TOTAL_MG_ANUAL]mg ou [TOTAL_G_ANUAL]g de CBD/THC/CBG.
    </p>

    <p style="text-indent: 40px; margin-bottom: 15px;">Considerando que o conteúdo médio de CBD/THC nas variedades genéticas de plantas de cannabis existentes hoje é, em média, de 10% em peso seco de flores (podendo variar conforme genética escolhida de 1% até 30%). E que o teor final depende da experiência de cultivo do usuário, é seguro assumir que o teor médio colhido pelo paciente seja em torno de 10%.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">O processo de extração da sustância, realizado de maneira improvisada na casa do paciente, sem equipamentos industriais, geram 10 g de peso de extrato bruto, considerando a eficiência de recuperação das moléculas (quando no CBD/THC presente na planta o paciente consegue transferir para o extrato) estima-se que seja na faixa de 80% (industrialmente pode chegar a 99%, porém de forma caseira deve ser de 80 ou menos).</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Temos a seguinte aritmética:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A 100g de flores secas com teor de 10% de CBD/THC, geram 10G de extrato bruto concentrado com 10g de CBD/THC/CBG.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Para obter [TOTAL_G_ANUAL]g de CBD/THC/CBG para uso anualmente o paciente vai precisar produzir, no mínimo [FLOR_SECA_KG]kg de flores secas por ano.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">É necessário levar em consideração perdas por ataques de pragas e doenças, erros na condução do cultivo que acabam ocasionando a perda de plantas e situações inesperadas. É natural considerar uma perda de 30% durante o período de cultivo. Essa consideração ocasiona que para garantir uma colheita de [FLOR_SECA_G]g o cultivo deve ser dimensionado para [FLOR_SECA_MARGEM_G]G secas por ano.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Em uma situação de cultivo indoor, opção preferencial do paciente por motivos de espaço e segurança, estima-se que cada planta produz entre 150-200g de flores secas, em um período de 120 dias em média (germinação – crescimento vegetativo – florescimento – colheita – secagem) em escala comercial. Um paciente que não terá como dedicar-se exclusivamente ao cultivo e que não detém experiência para operar esse cultivo, podemos dizer que deve cair pela metade o rendimento esperado, ou seja 100-150g de flores secas por planta.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Esse valor porem é o considerado em uma situação ideal, devemos levar em conta que o paciente não é um cultivador experiente e que não possui equipamentos de alta qualidade disponíveis em escala comercial (nutrientes, iluminação, meio de cultura). Lembrando que esse valor é de flores secas, ou seja, após a colheita e o processo de secagem para remoção da umidade, que prejudica a extração quando presente nas flores. As flores após a colheita, perdem entre 70 – 80% do peso total, ou seja, para atingir o valor 150g de flores secas cada planta deve produzir entre 700 a 750g de flores MOLHADAS.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Considerando a quantidade total anual de [FLOR_SECA_MARGEM_KG]Kg de flores secas necessárias, o paciente deve produzir [FLOR_MOLHADA_KG] KILOGRAMAS de flores MOLHADAS, após processo de secagem alcançando a quantidade correta de [FLOR_SECA_MARGEM_KG]Kg secas ANUALMENTE.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Estima-se então que para garantir seu consumo anual de CBD/THC, o paciente deve produzir o número de [TOTAL_PLANTAS] plantas em ciclo completo de floração anualmente podendo ser em ciclos divididos durante o ano.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Com isso também podemos estimar a importação do número de [TOTAL_SEMENTES] sementes feminizadas CBD/THC/CBG, este número já está com a taxa de segurança de 30% de perdas seja por falta de germinação pragas ou outros fatores.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Designer de cultivo:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A fim de garantir que essa quantidade de planta garantam o consumo anual do paciente, é necessário estabelecer um plano de cultivo adequado.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A principal recomendação é dividir o cultivo em 3 momentos de colheita ao longo do ano, fato facilitado pelo ciclo médio de cultivo da espécie ser de 120 dias ou 4 meses. Para tanto, o paciente deverá realizar o cultivo entre [PLANTAS_POR_CICLO_MIN] a [PLANTAS_POR_CICLO_MAX] plantas durante cada ciclo (Checagem matemática: 3 ciclos de [PLANTAS_POR_CICLO_MAX] plantas totalizam [TOTAL_PLANTAS_CHECAGEM] plantas anuais, suprindo a demanda de [TOTAL_PLANTAS] plantas).</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Considerando que somente plantas em estágio de floração produzem as substancias de interesse, o paciente pode optar, a depender da estrutura que tem a sua disposição para cultivo e manter plantas mãe de diferentes variedades em estado vegetativo (facilmente realizado mantendo regime de luz acima de 12 horas diárias). Essas plantas seriam então utilizadas para retirada de mudas (comumente chamadas de clones) que seriam então enraizadas e desenvolvidas até o momento de submeter as plantas ao florescimento. Essa prática é comumente utilizada em escala comercial e facilita a produção de maneira continua para realizar as 3 ou mais colheitas anuais. Porém o paciente teria a dificuldade (e custo) adicionada de manter estas plantas de forma perene durante todo o ano.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">A alternativa é realizar todo o processo de cultivo por 3 vezes no ano. Isso significa adquirir sementes, germinar, cultivar as plantas até o tamanho desejado, estimular o florescimento e colher as flores ao final do ciclo. Em termos de custos, essa alternativa pode ser um pouco menos custosa, devido a não ter a necessidade de manter as plantas mãe separadamente, porem a compra continua de sementes aumente o custo total e também o risco do processo, uma vez que caso se perca uma ou mais plantas, a única alternativa é germinar outra semente causando problemas ao calendário de cultivo e também dificultando o processo como um todo, além do que a germinação das sementes raramente é garantida, muitas vezes ficando na casa de 50% de todas as sementes compradas. Ao manter plantas mãe continuamente prontas para produção de mudas, o paciente vai ter muito mais segurança, pois ao perder uma planta por algum motivo, pode começar o ciclo de outra com muita facilidade além de ganhar tempo no desenvolvimento de uma planta que já vai estar em um estágio mais avançado.</p>

    <p style="font-weight: bold; margin-bottom: 10px;">Cultivares indicados:</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">O mercado de cultivares para uso medicinal hoje é bastante conectado com o mercado recreativo, e existem diversas marcas disponíveis, com todo tipo de genética em termos de perfil fotoquímico. Os perfis variam tanto em termos de terpenos, as substancias que definem o sabor e odor de vegetais variados, incluindo a Cannabis, e também em termos de produção de fitocannabinóides, com diferentes teores e proporções de CBD e THC.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Considerando a recomendação médica, que sugere ao paciente o consumo de extratos com [ESPECIFICAÇÕES DA RECEITA, ex: altos teores de CBD], a recomendação agronômica vai na mesma linha, não se comprometendo com nenhuma genética especifica, e deixando a escolha do paciente a experimentação de diferentes variedades.</p>
    <p style="text-indent: 40px; margin-bottom: 15px;">Recomenda-se que se utilize variedades que contenham teores de [CANABINOIDE, ex: CBD] na casa dos 10 a 12%, que normalmente são mais seguras e confiáveis, a possibilidade também de escolha de cultivares que possuem apenas CBD ou apenas THC, torna-se mais simples o procedimento de extração isolado e dosimetria do extrato com finalidade medicinal.</p>

    <p style="margin-bottom: 30px;"><span style="font-weight: bold;">OBSERVAÇÃO:</span> O Laudo técnico é baseado nas informações passadas pelo médico ao paciente, estritamente para a quantificação de cultivo de Cannabis medicinal. O profissional responsável pelo laudo técnico para quantificação do cultivo medicinal não se responsabiliza pelo uso indevido ou incorreto do laudo técnico.</p>
    
    <!-- PÁGINA DE ASSINATURA -->
    <div style="page-break-inside: avoid; text-align: center; margin-top: 40px;">
        <p style="text-align: left; margin-bottom: 40px;">É o parecer;</p>
        
        <div style="margin: 0 auto; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Eng. Agr. ${agronomistName || 'Wilian Dalenogare Pereira'}</p>
            <p style="font-weight: bold; margin: 0;">CREA: ${agronomistCrea || '052193520-2'}</p>
            <p style="font-weight: bold; margin: 0;">Luis Eduardo Magalhães – BA, [DATA ATUAL]</p>
        </div>
        
        <div style="margin: 40px auto 0; width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <p style="font-weight: bold; margin: 0;">Paciente: [NOME DO PACIENTE]</p>
            <p style="font-weight: bold; margin: 0;">CPF: [CPF DO PACIENTE]</p>
        </div>
    </div>
</div>

GERAÇÃO E REGRAS:
Gere APENAS o código HTML validado, SEM tags de markdown em volta.
Substitua todos os campos matemáticos baseados nos documentos processados.`;
const contents = [systemPrompt];
      if (medicalReportText) contents.push(`LAUDO MÉDICO (Texto):\n${medicalReportText}`);
      if (medicalReportFile) {
          contents.push({
             inlineData: { data: medicalReportFile.data.split(',')[1], mimeType: medicalReportFile.mimeType }
          });
      }
      if (prescriptionText) contents.push(`RECEITA MÉDICA (Texto):\n${prescriptionText}`);
      if (prescriptionFile) {
          contents.push({
             inlineData: { data: prescriptionFile.data.split(',')[1], mimeType: prescriptionFile.mimeType }
          });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
      });

      if (response.text) {
        return res.json({ markdown: response.text });
      }
    } catch (error: any) {
      console.error("Erro na API Gemini Agronômico:", error.message);
      let errMsg = error.message || "Falha desconhecida";
      if (errMsg.includes("leaked")) errMsg = "Sua chave de API do Gemini foi revogada pelo Google (leaked). Por favor, gere uma nova chave no Google AI Studio e atualize nas configurações.";
      else if (errMsg.includes("not found")) errMsg = "O modelo de IA configurado não está disponível. Tente atualizar a página.";
      return res.status(500).json({ error: errMsg });
    }
  });

  app.post("/api/admin-catalog-ai", async (req, res) => {
    const { prompt, currentCatalog, file } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "Gemini API key não configurada. A funcionalidade de IA requer a chave no .env." });
    }
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemPrompt = `Você é um assistente de IA gerenciador de catálogo farmacêutico e de medicamentos.
Você vai receber:
1. O Catálogo Atual (lista de categorias e produtos)
2. O Pedido do usuário, que pode incluir um arquivo (PDF, imagem, CSV) contendo os dados.

Seu objetivo é analisar as instruções e retornar estritamente um objeto JSON com as ações que devem ser executadas.
Não retorne Markdown ou texto explicativo, APENAS O JSON VÁLIDO.

O JSON deve ter esta estrutura:
{
  "message": "Uma mensagem curta de resumo para mostrar ao usuário do que você fez.",
  "actions": [
    {
      "type": "add",
      "categoryId": "ID_DA_CATEGORIA_PARA_ADICIONAR",
      "product": { "name": "Nome", "manufacturer": "Fabricante", "priceBRL": 150, "indications": "Ansiedade", "description": "...", "type": "Óleo" }
    },
    {
      "type": "update",
      "categoryId": "ID_DA_CATEGORIA_ATUAL",
      "originalName": "Nome Exato Do Produto Existente",
      "updates": { "priceBRL": 200, "indications": "Nova indicação" }
    },
    {
      "type": "delete",
      "categoryId": "ID_DA_CATEGORIA_ATUAL",
      "originalName": "Nome Exato Do Produto Existente"
    }
  ]
}

Regras:
- Use os IDs das categorias existentes, como '1' (ansiedade), '2' (dor), '3' (epilepsia), etc. Tente encaixar de forma inteligente.
- Para adicionar novos medicamentos, extraia do arquivo ou texto as informações de nome, fabricante, tipo (Óleo, Goma, Flor), descrição, valor em R$ (priceBRL) e patologias (indications).
- Tente inferir a categoria (categoryId) mais apropriada com base nas indicações ou no tipo.`;

      const contents = [];
      
      contents.push(systemPrompt);
      contents.push(`Catálogo Atual:\n${JSON.stringify(currentCatalog, null, 2)}`);
      
      if (prompt) {
          contents.push(`Pedido do Usuário e Texto de Origem:\n${prompt}`);
      }
      
      if (file) {
          contents.push({
              inlineData: {
                  data: file.data.split(',')[1],
                  mimeType: file.mimeType
              }
          });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
            responseMimeType: "application/json"
        }
      });

      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
    } catch (error: any) {
      console.error("Erro na API Gemini de Catálogo:", error.message);
      let errMsg = error.message || "Falha desconhecida";
      if (errMsg.includes("leaked")) errMsg = "Sua chave de API do Gemini foi revogada pelo Google (leaked). Por favor, gere uma nova chave no Google AI Studio e atualize nas configurações.";
      return res.status(500).json({ error: errMsg });
    }
  });

  app.post("/api/analyze-clinical", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        const { GoogleGenAI } = await import("@google/genai");
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
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        if (response.text) {
          return res.json({ text: response.text });
        }
      } catch (error) {
        console.warn("Aviso na chamada da API Gemini, aplicando protocolo clínico de segurança:", error.message || error);
        return res.json({ text: prompt }); // fallback
      }
    }
    // If no API key or direct fallback
    return res.json({ text: prompt });
  });

app.post('/api/send-admin-push', async (req, res) => {
    const { title, body, url } = req.body;
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      // For doctors/admins, we might not have 'role'=='admin' in users collection reliably.
      // Let's broadcast to anyone who has pushSubscription AND (maybe we just send to all admins, but wait)
      // Actually, if the doctor registered, maybe they don't have role='admin' in their doc.
      // Let's check how the doctor document is structured.
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'admin'));
      let querySnapshot = await getDocs(q);
      
      // Fallback: If no 'admin' role found, we might want to check the specific doctor uid if we know it.
      // For now, let's just broadcast to all admins.
      const promises = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.pushSubscription) {
          promises.push(webpush.sendNotification(userData.pushSubscription, JSON.stringify({ title, body, url }), { urgency: 'high', TTL: 86400 }).catch(e => console.error('Admin push error', e)));
        }
      });
      
      // If no admin was found with role=admin, we can broadcast to the first user with a pushSubscription as a fallback for testing (but better to properly set role='admin' when doctor subscribes)
      if (promises.length === 0) {
          const allUsersSnapshot = await getDocs(usersRef);
          allUsersSnapshot.forEach(doc => {
              const uData = doc.data();
              if (uData.pushSubscription) {
                 promises.push(webpush.sendNotification(uData.pushSubscription, JSON.stringify({ title, body, url }), { urgency: 'high', TTL: 86400 }).catch(e => console.error('Admin push error', e)));
              }
          });
      }


      await Promise.all(promises);
      res.json({ success: true, count: promises.length });
    } catch (error) {
      console.error('Error sending admin push:', error);
      res.status(500).json({ error: 'Failed' });
    }
  });

  
  app.get('/api/debug-users', async (req, res) => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = [];
      snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
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
