import re

for filename in ["src/screens/CheckoutScreen.tsx", "src/screens/DashboardScreen.tsx"]:
    with open(filename, "r") as f:
        code = f.read()

    # In CheckoutScreen
    old_success = """  const handleSuccess = () => {
    alert("Pagamento aprovado! Preparando seu atendimento...");
    setPagamentoConsulta(true);
    if (selectedOffer === 'basic') {
      joinQueue();
      navigate('/queue');"""

    new_success = """  const handleSuccess = async () => {
    alert("Pagamento aprovado! Preparando seu atendimento...");
    setPagamentoConsulta(true);
    if (selectedOffer === 'basic') {
      await joinQueue();
      navigate('/queue');"""

    if old_success in code:
        code = code.replace(old_success, new_success)
        
    # In DashboardScreen
    old_dash = """    if (paymentStatus === 'success') {
      const isBasic = localStorage.getItem('last_offer') === 'basic';
      if (!pagamento_consulta) {
        setPagamentoConsulta(true);
        // Se era a consulta básica, entra na fila
        if (isBasic) {
           joinQueue();
        } else {"""
        
    new_dash = """    if (paymentStatus === 'success') {
      const isBasic = localStorage.getItem('last_offer') === 'basic';
      
      const processSuccess = async () => {
        if (!pagamento_consulta) {
          setPagamentoConsulta(true);
          // Se era a consulta básica, entra na fila
          if (isBasic) {
             await joinQueue();
          } else {
             setPagamentoPremium(true);
          }
        }
        // Limpa os parâmetros da URL
        window.history.replaceState({}, '', window.location.pathname);
        
        // Redireciona o paciente direto para a fila ou agendamento premium após pagar
        if (isBasic) {
          navigate('/queue');
        } else {
          navigate('/scheduling');
        }
      };
      processSuccess();
    }"""
    
    old_dash_full = """    if (paymentStatus === 'success') {
      const isBasic = localStorage.getItem('last_offer') === 'basic';
      if (!pagamento_consulta) {
        setPagamentoConsulta(true);
        // Se era a consulta básica, entra na fila
        if (isBasic) {
           joinQueue();
        } else {
           setPagamentoPremium(true);
        }
      }
      // Limpa os parâmetros da URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Redireciona o paciente direto para a fila ou agendamento premium após pagar
      if (isBasic) {
        navigate('/queue');
      } else {
        navigate('/scheduling');
      }
    }"""

    if old_dash_full in code:
        code = code.replace(old_dash_full, new_dash)

    with open(filename, "w") as f:
        f.write(code)

print("Patched handleSuccess and Dashboard success")
