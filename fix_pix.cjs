const fs = require('fs');
let code = fs.readFileSync('src/screens/CheckoutScreen.tsx', 'utf-8');
const target = `  const handlePayment = async () => {
    if (!paymentMethod || !selectedOffer) return;
    setIsLoading(true);

    localStorage.setItem('last_offer', selectedOffer);

    try {
      if (appliedCoupon?.ownerId) {
        await incrementBonus(50, appliedCoupon.ownerId);
      }
    } catch (error) {
      console.warn("Coupon bonus warning:", error);
    }

    // Libera o acesso imediatamente à fila de atendimento sem travar na tela de pagamento
    handleSuccess();
  };`;
const replacement = `  const handlePayment = async () => {
    if (!paymentMethod || !selectedOffer) return;
    setIsLoading(true);
    localStorage.setItem('last_offer', selectedOffer);
    
    try {
      if (appliedCoupon?.ownerId) {
        await incrementBonus(50, appliedCoupon.ownerId);
      }
    } catch (error) {
      console.warn("Coupon bonus warning:", error);
    }
    
    if (paymentMethod === 'pix') {
      try {
        const response = await fetch('/api/create-pix-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: selectedOffer === 'basic' ? 'Consulta Mecura' : 'Premium Mecura',
            price: finalPrice,
            email: 'paciente@mecura.com',
            firstName: userName || 'Paciente',
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.id && data.qr_code && data.qr_code_base64) {
            setPixData({
              id: data.id.toString(),
              qr_code: data.qr_code,
              qr_code_base64: data.qr_code_base64
            });
            setIsLoading(false);
            
            // Simulando aprovação do PIX após alguns segundos para fluxo automático
            pollingInterval.current = setInterval(() => {
              clearInterval(pollingInterval.current);
              handleSuccess();
            }, 8000);
            return;
          }
        }
      } catch (err) {
        console.error("Erro ao gerar PIX: ", err);
      }
    }
    
    // Se der qualquer erro na geração ou for Cartão (que não está implementado real), libera na hora
    handleSuccess();
  };`;
code = code.replace(target, replacement);
fs.writeFileSync('src/screens/CheckoutScreen.tsx', code);
