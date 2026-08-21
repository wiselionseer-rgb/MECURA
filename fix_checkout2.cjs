const fs = require('fs');
let code = fs.readFileSync('src/screens/CheckoutScreen.tsx', 'utf-8');

const regex = /<Button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?if \(pixData\) \{[\s\S]*?navigator\.clipboard\.writeText\(pixData\.qr_code\);[\s\S]*?alert\("Código Pix Copiado!"\);[\s\S]*?\} else \{[\s\S]*?step === 'discount' \? setStep\('checkout'\) : handlePayment\(\)[\s\S]*?\}[\s\S]*?\}\}[\s\S]*?isLoading=\{isLoading\}[\s\S]*?disabled=\{step === 'checkout' && !paymentMethod\}[\s\S]*?>[\s\S]*?\{pixData \? 'Copiar Código' : \(step === 'discount' \? 'Continuar para Pagamento' : 'Gerar Pix e Iniciar'\)\}[\s\S]*?<\/Button>/;

const replacementButton = `
        {pixData ? (
          <div className="flex flex-col gap-3 mt-4 w-full">
            <Button 
              className="w-full h-12 bg-[#1A1A26] border border-mecura-neon/50 text-mecura-neon hover:bg-mecura-neon/10"
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
              className="w-full h-14 text-lg font-bold bg-mecura-neon text-black shadow-[0_0_30px_rgba(166,255,0,0.3)]"
              onClick={() => handleSuccess()}
            >
              Já Paguei (Entrar na Fila)
            </Button>
          </div>
        ) : (
          <Button 
            className={\`w-full h-14 text-lg font-bold mt-2 \${
              selectedOffer === 'basic' 
                ? 'bg-mecura-neon text-black shadow-[0_0_30px_rgba(166,255,0,0.3)] hover:shadow-[0_0_40px_rgba(166,255,0,0.4)]'
                : 'bg-gradient-to-r from-[#A6FF00] to-[#8BD400] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]'
            }\`}
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

code = code.replace(regex, replacementButton);
fs.writeFileSync('src/screens/CheckoutScreen.tsx', code);
