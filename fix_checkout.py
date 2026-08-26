with open("src/screens/PremiumCheckoutScreen.tsx", "r") as f:
    code = f.read()

# 1. Update useStore import
old_import = "const { userName, setPagamentoPremium, incrementBonus } = useStore();"
new_import = "const { userName, setPagamentoPremium, incrementBonus, addMessage } = useStore();"
code = code.replace(old_import, new_import)

# 2. Update handleSuccess
old_handle = """  const handleSuccess = () => {
    alert("Pagamento aprovado! Vamos agendar sua consulta.");
    setPagamentoPremium(true);
    navigate('/scheduling');
  };"""

new_handle = """  const handleSuccess = () => {
    setPagamentoPremium(true);
    addMessage({
      sender: 'system',
      type: 'payment_success',
      text: 'Pagamento da Consulta Premium (R$ 250,00) aprovado com sucesso!'
    });
    navigate('/chat');
  };"""
code = code.replace(old_handle, new_handle)

with open("src/screens/PremiumCheckoutScreen.tsx", "w") as f:
    f.write(code)
