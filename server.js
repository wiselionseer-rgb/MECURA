// server.ts
import express from "express";
import path from "node:path";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config({ override: true });
async function startServer() {
  const app = express();
  const PORT = 3e3;
  app.use(express.json());
  const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
  const geminiKey = process.env.GEMINI_API_KEY || "AIzaSyBpDqU6Gqk-Sb8PmY4M7gpVp8qAUMNZaIM";
  const client = new MercadoPagoConfig({
    accessToken: mpToken
  });
  console.log("-----------------------------------------");
  console.log("\u{1F6F0}\uFE0F MONITORAMENTO DE CONFIGURA\xC7\xC3O:");
  console.log("Mercado Pago:", mpToken ? `\u2705 ATIVO (${mpToken.substring(0, 15)}...)` : "\u274C AUSENTE");
  console.log("Gemini IA:", geminiKey ? `\u2705 ATIVO (${geminiKey.substring(0, 10)}...)` : "\u274C AUSENTE");
  console.log("CWD:", process.cwd());
  console.log("-----------------------------------------");
  app.post("/api/create-preference", async (req, res) => {
    try {
      const { title, price, quantity = 1 } = req.body;
      if (!mpToken) return res.status(500).json({ error: "Credencial Mercado Pago (Access Token) n\xE3o encontrada no servidor Hostinger." });
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: [{ id: "consultation-" + Date.now(), title, quantity, unit_price: Number(price), currency_id: "BRL" }],
          back_urls: {
            success: `${req.headers.origin}/dashboard?payment=success`,
            failure: `${req.headers.origin}/checkout?payment=failed`,
            pending: `${req.headers.origin}/dashboard?payment=pending`
          },
          auto_return: "approved",
          payment_methods: {
            excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }],
            installments: 1
          }
        }
      });
      res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
      console.error("Erro MP Preference:", error.message);
      res.status(500).json({ error: "Falha ao criar prefer\xEAncia.", details: error.message });
    }
  });
  app.post("/api/create-pix-payment", async (req, res) => {
    try {
      const { title, price, email, firstName, lastName } = req.body;
      if (!mpToken) {
        return res.status(500).json({ error: "Configura\xE7\xE3o do Mercado Pago ausente no servidor." });
      }
      console.log(`Tentando criar pagamento Pix: R$${price} para ${email}`);
      const payment = new Payment(client);
      const result = await payment.create({
        body: {
          transaction_amount: Number(price),
          description: title,
          payment_method_id: "pix",
          payer: {
            email: email || "paciente@mercura.com",
            first_name: firstName || "Paciente",
            last_name: lastName || "Mecura",
            // Alguns planos de produção exigem identificação
            identification: {
              type: "CPF",
              number: "00000000000"
              // Placeholder se não enviado
            }
          },
          // Opcional: Webhook para receber confirmação automática
          notification_url: process.env.APP_URL ? `${process.env.APP_URL}/api/webhook` : void 0
        }
      });
      console.log("Pagamento Pix criado com sucesso!", result.id);
      res.json({
        id: result.id,
        status: result.status,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64
      });
    } catch (error) {
      console.error("ERRO DETALHADO MERCADO PAGO:", error);
      const mpError = error.cause?.[0]?.description || error.message;
      res.status(500).json({
        error: "Erro ao gerar o Pix via Mercado Pago.",
        details: mpError
      });
    }
  });
  app.get("/api/payment-status/:id", async (req, res) => {
    try {
      const payment = new Payment(client);
      const result = await payment.get({ id: req.params.id });
      res.json({ status: result.status });
    } catch (error) {
      res.status(500).json({ error: "Erro ao consultar status." });
    }
  });
  app.get("/api/test-env", (req, res) => {
    res.json({
      mp: process.env.MERCADO_PAGO_ACCESS_TOKEN || "MISSING",
      gemini: process.env.GEMINI_API_KEY || "MISSING"
    });
  });
  app.post("/api/analyze-clinical", async (req, res) => {
    try {
      const { prompt } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBpDqU6Gqk-Sb8PmY4M7gpVp8qAUMNZaIM";
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ error: "Chave da API do Gemini n\xE3o configurada no servidor. Por favor, configure sua GEMINI_API_KEY." });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Erro na an\xE1lise cl\xEDnica IA:", error);
      let errorMsg = "Erro ao processar an\xE1lise cl\xEDnica com IA.";
      if (error.message?.includes("API key not valid") || error.status === 400) {
        errorMsg = "A chave da API do Gemini informada n\xE3o \xE9 v\xE1lida. Por favor, verifique a sua configura\xE7\xE3o (GEMINI_API_KEY).";
      }
      res.status(500).json({
        error: errorMsg,
        details: error.message
      });
    }
  });
  app.post("/api/webhook", async (req, res) => {
    const { action, data, type } = req.body;
    console.log("Notifica\xE7\xE3o Mercado Pago recebida:", { action, type, data });
    try {
      if (type === "payment" || action?.startsWith("payment.")) {
        const paymentId = data?.id || req.query.id;
        console.log(`Processando status do pagamento ID: ${paymentId}`);
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Erro no processamento do Webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
