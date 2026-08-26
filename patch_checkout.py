import re

with open("src/screens/CheckoutScreen.tsx", "r") as f:
    code = f.read()

# Change base price
code = code.replace("const basePrice = selectedOffer === 'basic' ? 50.00 : 250.00;", "const basePrice = selectedOffer === 'basic' ? 49.90 : 250.00;")

# Handle the handleSuccess method
old_success = """  const handleSuccess = () => {
    if (appliedCoupon && auth.currentUser) {
      useCoupon(appliedCoupon.id, auth.currentUser.uid);
    }
    setPagamentoConsulta(true);
    joinQueue();
    navigate('/queue');
  };"""

new_success = """  const handleSuccess = async () => {
    if (pixData) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/check-payment/${pixData.id}`);
        const data = await response.json();
        setIsLoading(false);
        if (data.status === 'approved') {
          // Proceed
        } else {
          alert('Pagamento ainda não aprovado. Se você já pagou, aguarde alguns instantes e tente novamente.');
          return;
        }
      } catch (err) {
        setIsLoading(false);
        alert('Erro ao verificar pagamento. Tente novamente.');
        return;
      }
    }

    if (appliedCoupon && auth.currentUser) {
      useCoupon(appliedCoupon.id, auth.currentUser.uid);
    }
    setPagamentoConsulta(true);
    joinQueue();
    navigate('/queue');
  };"""

code = code.replace(old_success, new_success)

# Change the "Já Paguei" button to handle loading state if possible
code = code.replace("onClick={() => handleSuccess()}", "onClick={() => handleSuccess()} disabled={isLoading}")

with open("src/screens/CheckoutScreen.tsx", "w") as f:
    f.write(code)

with open("src/screens/PremiumCheckoutScreen.tsx", "r") as f:
    code = f.read()

old_success_prem = """  const handleSuccess = () => {
    if (appliedCoupon && auth.currentUser) {
      useCoupon(appliedCoupon.id, auth.currentUser.uid);
    }
    setPagamentoPremium(true);
    incrementBonus(); // +5% for premium upgrade
    navigate('/schedule/premium');
  };"""

new_success_prem = """  const handleSuccess = async () => {
    if (pixData) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/check-payment/${pixData.id}`);
        const data = await response.json();
        setIsLoading(false);
        if (data.status === 'approved') {
          // Proceed
        } else {
          alert('Pagamento ainda não aprovado. Se você já pagou, aguarde alguns instantes e tente novamente.');
          return;
        }
      } catch (err) {
        setIsLoading(false);
        alert('Erro ao verificar pagamento. Tente novamente.');
        return;
      }
    }

    if (appliedCoupon && auth.currentUser) {
      useCoupon(appliedCoupon.id, auth.currentUser.uid);
    }
    setPagamentoPremium(true);
    incrementBonus(); // +5% for premium upgrade
    navigate('/schedule/premium');
  };"""
code = code.replace(old_success_prem, new_success_prem)
code = code.replace("onClick={() => handleSuccess()}", "onClick={() => handleSuccess()} disabled={isLoading}")

with open("src/screens/PremiumCheckoutScreen.tsx", "w") as f:
    f.write(code)

