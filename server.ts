import express from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mercado Pago Configuration
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
  });

  // API Routes
  app.post("/api/create-preference", async (req, res) => {
    try {
      const { title, price, quantity = 1 } = req.body;

      if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        return res.status(500).json({ error: "Configuração do Mercado Pago ausente." });
      }

      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: [
            {
              id: 'consultation-' + Date.now(),
              title: title,
              quantity: quantity,
              unit_price: Number(price),
              currency_id: 'BRL'
            }
          ],
          back_urls: {
            success: `${req.headers.origin}/dashboard?payment=success`,
            failure: `${req.headers.origin}/checkout?payment=failed`,
            pending: `${req.headers.origin}/dashboard?payment=pending`,
          },
          auto_return: 'approved',
          payment_methods: {
            excluded_payment_types: [
              { id: "credit_card" },
              { id: "debit_card" },
              { id: "ticket" }
            ],
            installments: 1
          },
        }
      });

      res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
      console.error("Error creating preference:", error);
      res.status(500).json({ error: "Falha ao criar preferência de pagamento." });
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
