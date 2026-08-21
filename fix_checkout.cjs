const fs = require('fs');
let code = fs.readFileSync('src/screens/CheckoutScreen.tsx', 'utf-8');

// Remove setInterval
const targetInterval = `            // Simulando aprovação do PIX após alguns segundos para fluxo automático
            pollingInterval.current = setInterval(() => {
              clearInterval(pollingInterval.current);
              handleSuccess();
            }, 8000);`;
code = code.replace(targetInterval, `            // O paciente clicará no botão "Já Paguei" para continuar.`);

// Add the button
const targetButton = `<Button 
          className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.3)] mt-2"
          onClick={() => {
            if (pixData) {
              navigator.clipboard.writeText(pixData.qr_code);
              alert("Código Pix Copiado!");
            } else {
              step === 'discount' ? setStep('checkout') : handlePayment()
            }
          }}
          isLoading={isLoading}
          disabled={step === 'checkout' && !paymentMethod}
        >
          {pixData ? 'Copiar Código' : (step === 'discount' ? 'Continuar para Pagamento' : 'Gerar Pix e Iniciar')}
        </Button>`;

const replacementButton = `
        {pixData ? (
          <div className="flex flex-col gap-3 mt-2">
            <Button 
              className="w-full h-12 bg-transparent border border-mecura-neon text-mecura-neon hover:bg-mecura-neon/10"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(pixData.qr_code);
                  alert("Código Pix Copiado! Após pagar, clique em 'Já Paguei'.");
                } catch (e) {
                  alert("Seu navegador bloqueou a cópia automática. Por favor, copie manualmente o código acima.");
                }
              }}
            >
              Copiar Código
            </Button>
            <Button 
              className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.3)]"
              onClick={() => handleSuccess()}
            >
              Já Paguei (Entrar na Fila)
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.3)] mt-2"
            onClick={() => {
              step === 'discount' ? setStep('checkout') : handlePayment()
            }}
            isLoading={isLoading}
            disabled={step === 'checkout' && !paymentMethod}
          >
            {step === 'discount' ? 'Continuar para Pagamento' : 'Gerar Pix e Iniciar'}
          </Button>
        )}
`;

code = code.replace(targetButton, replacementButton);
fs.writeFileSync('src/screens/CheckoutScreen.tsx', code);
