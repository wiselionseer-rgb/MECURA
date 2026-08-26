with open("server.ts", "r") as f:
    code = f.read()

import re

# find app.post("/api/create-pix-payment"
new_endpoint = """  app.get("/api/check-payment/:id", async (req, res) => {
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

  app.post("/api/create-pix-payment","""

code = code.replace('  app.post("/api/create-pix-payment",', new_endpoint)

with open("server.ts", "w") as f:
    f.write(code)
