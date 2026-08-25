import re

for filename in ["src/screens/CheckoutScreen.tsx", "src/screens/PremiumCheckoutScreen.tsx"]:
    with open(filename, "r") as f:
        code = f.read()
    
    old_block = """  const handleSuccess = () => {
    setPagamentoConsulta(true);
    if (selectedOffer === 'basic') {
      joinQueue();
      navigate('/queue');
    } else {
      setPagamentoPremium(true);
      navigate('/scheduling');
    }
  };"""

    new_block = """  const handleSuccess = () => {
    alert("Pagamento aprovado! Preparando seu atendimento...");
    setPagamentoConsulta(true);
    if (selectedOffer === 'basic') {
      joinQueue();
      navigate('/queue');
    } else {
      setPagamentoPremium(true);
      navigate('/scheduling');
    }
  };"""

    old_block_premium = """  const handleSuccess = () => {
    setPagamentoPremium(true);
    navigate('/scheduling');
  };"""

    new_block_premium = """  const handleSuccess = () => {
    alert("Pagamento aprovado! Vamos agendar sua consulta.");
    setPagamentoPremium(true);
    navigate('/scheduling');
  };"""

    if old_block in code:
        code = code.replace(old_block, new_block)
    if old_block_premium in code:
        code = code.replace(old_block_premium, new_block_premium)
        
    with open(filename, "w") as f:
        f.write(code)

print("handleSuccess patched.")
