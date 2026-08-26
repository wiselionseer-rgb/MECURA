import re

with open("src/screens/PremiumCheckoutScreen.tsx", "r") as f:
    code = f.read()

new_btn = """onClick={async () => {
              try {
                setIsLoading(true);
                const response = await fetch(`/api/payment-status/${pixData.id}`);
                const data = await response.json();
                setIsLoading(false);
                if (data.status === 'approved' || data.status === 'completed') {
                  handleSuccess();
                } else {
                  alert("Pagamento ainda não confirmado. Aguarde alguns instantes.");
                }
              } catch (e) {
                setIsLoading(false);
                alert("Pagamento ainda não confirmado. Aguarde alguns instantes.");
              }
            }} disabled={isLoading}"""

code = re.sub(r'onClick=\{\(\) => handleSuccess\(\)\}.*', new_btn, code)

old_fallback = """    }
    
    handleSuccess();
  };"""
new_fallback = """    }
    
    // Fallback: If it's not PIX, we can let them through for testing
    if (paymentMethod !== 'pix') {
        handleSuccess();
    } else {
        alert("Falha ao gerar o Pix. Tente novamente.");
        setIsLoading(false);
    }
  };"""
code = code.replace(old_fallback, new_fallback)


with open("src/screens/PremiumCheckoutScreen.tsx", "w") as f:
    f.write(code)
