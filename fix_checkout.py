import re

with open("src/screens/CheckoutScreen.tsx", "r") as f:
    code = f.read()

# Change the onClick of Já Paguei to do a check
old_btn = "onClick={() => handleSuccess()} disabled={isLoading}"
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
code = code.replace(old_btn, new_btn)

# Ensure "onClick={() => handleSuccess()}" is also replaced if disabled={isLoading} wasn't there
code = code.replace("onClick={() => handleSuccess()}\n", new_btn + "\n")

# Remove the fallback `handleSuccess();` at the end of `handlePayment` so it doesn't auto-succeed on error
old_fallback = """    }
    
    // Se der qualquer erro na geração ou for Cartão (que não está implementado real), libera na hora
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

# Ensure basePrice is correct
code = code.replace("const basePrice = selectedOffer === 'basic' ? 50.00 : 250.00;", "const basePrice = selectedOffer === 'basic' ? 49.90 : 250.00;")

with open("src/screens/CheckoutScreen.tsx", "w") as f:
    f.write(code)


# PremiumCheckoutScreen.tsx
with open("src/screens/PremiumCheckoutScreen.tsx", "r") as f:
    code = f.read()

code = code.replace(old_btn, new_btn)
code = code.replace("onClick={() => handleSuccess()}\n", new_btn + "\n")

# Wait, PremiumCheckoutScreen might not have polling or exactly the same structure. Let's check its handlePayment.
