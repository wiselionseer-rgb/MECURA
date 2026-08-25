import re

with open("src/screens/DashboardScreen.tsx", "r") as f:
    code = f.read()

old_block = """  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'success') {
      if (!pagamento_consulta) {
        setPagamentoConsulta(true);
        // Se era a consulta básica, entra na fila
        const isBasic = localStorage.getItem('last_offer') === 'basic';
        if (isBasic) {
           joinQueue();
        } else {
           setPagamentoPremium(true);
        }
      }
      // Limpa os parâmetros da URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [pagamento_consulta, setPagamentoConsulta, setPagamentoPremium, joinQueue]);"""

new_block = """  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'success') {
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
    }
  }, [pagamento_consulta, setPagamentoConsulta, setPagamentoPremium, joinQueue, navigate]);"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open("src/screens/DashboardScreen.tsx", "w") as f:
        f.write(code)
    print("Replaced successfully.")
else:
    print("Could not find block.")
