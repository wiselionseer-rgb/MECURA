import { db } from '../firebase';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useAdminStore, Coupon } from '../store/useAdminStore';
import { auth } from '../firebase';
import { ChevronLeft, CreditCard, Percent, Lock, Ticket } from 'lucide-react';

// Custom Pix Icon to match the print
const PixIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.864 3.738L2.53 8.072c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L9.424 3.738c-.707-.707-1.853-.707-2.56 0zm10.272 0l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56l-4.334-4.334c-.707-.707-1.853-.707-2.56 0zM12 14.56l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L12 14.56z" />
  </svg>
);

export function PremiumCheckoutScreen() {
  const navigate = useNavigate();
  const { userName, setPagamentoPremium, incrementBonus, addMessage } = useStore();
  const { coupons, useCoupon } = useAdminStore();
  const [step, setStep] = useState<'discount' | 'checkout'>('discount');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>('pix');
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<{ id: string, qr_code: string, qr_code_base64: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const basePrice = 250.00;
    let finalPrice = basePrice;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'fixed') {
      finalPrice = Math.max(0, basePrice - appliedCoupon.discount);
    } else {
      finalPrice = basePrice * (1 - appliedCoupon.discount / 100);
    }
  }

  const handleApplyCoupon = () => {
    setCouponError('');
    const currentUserId = auth.currentUser?.uid || 'guest_' + Math.random().toString(36).substring(7); // Use a temp id if not logged in just in case, but auth.currentUser should be there
    const coupon = coupons.find(c => c.code === couponCode.toUpperCase() && c.active);
    
    if (coupon) {
      if (coupon.ownerId && coupon.ownerId === auth.currentUser?.uid) {
        setCouponError('Você não pode usar seu próprio cupom de indicação.');
        return;
      }
      
      // Check quantity
      if (coupon.quantity && coupon.quantity > 0) {
        const currentCount = coupon.usedCount || 0;
        if (currentCount >= coupon.quantity) {
          setCouponError('Este cupom atingiu o limite máximo de usos.');
          return;
        }
      }
      
      // Check if user already used it
      if (coupon.usedBy && auth.currentUser?.uid && coupon.usedBy.includes(auth.currentUser.uid)) {
        setCouponError('Você já utilizou este cupom anteriormente.');
        return;
      }
      
      setAppliedCoupon(coupon);
    } else {
      setCouponError('Cupom inválido ou inativo.');
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setIsLoading(true);

    localStorage.setItem('last_offer', 'premium');

    try {
      if (appliedCoupon?.ownerId) {
        await incrementBonus(50, appliedCoupon.ownerId);
      }
    } catch (error) {
      console.warn("Coupon bonus warning:", error);
    }

    // Libera o acesso imediatamente para o agendamento
    handleSuccess();
  };

  const handleSuccess = () => {
    setPagamentoPremium(true);
    addMessage({
      sender: 'doctor',
      type: "payment_success" as any,
      text: 'Pagamento da Consulta Premium (R$ 250,00) aprovado com sucesso!'
    });
    navigate('/chat');
  };

  useEffect(() => {
    if (pixData?.id) {
      pollingInterval.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment-status/${pixData.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'approved' || data.status === 'completed') {
              if (pollingInterval.current) clearInterval(pollingInterval.current);
              try {
                const { collection, addDoc } = await import('firebase/firestore');
                const { db } = await import('../firebase');
                await addDoc(collection(db, 'payments'), {
                  mpId: pixData.id,
                  type: selectedOffer_fixed === 'basic' ? 'Consulta Básica' : 'Consulta Premium',
                  value: finalPrice,
                  date: new Date().toISOString()
                });
              } catch(err) { console.error(err); }
              handleSuccess();
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [pixData]);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] text-mecura-pearl relative font-sans">
      {/* Background Glow - Gold */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-mecura-gold/10 blur-[120px] -z-10" />
      
      {/* Header */}
      <div className="flex items-center p-6 pb-2 z-10">
        <button 
          onClick={() => step === 'checkout' ? setStep('discount') : navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center text-mecura-silver hover:bg-[#2A2A3A] transition-colors border border-[#2A2A3A]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center pr-10">
          <h1 className="text-2xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#A6FF00] to-[#C9FF5C]">mecura</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 pt-4">
        {pixData ? (
          <div className="flex flex-col items-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl bg-[#A6FF0033]">
               <PixIcon className="w-10 h-10 text-[#A6FF00]" />
            </div>

            <h2 className="text-2xl font-bold text-center text-white mb-2">Escaneie o QR Code</h2>
            <p className="text-mecura-silver text-center text-sm mb-8 px-4">Pague via Pix agora para liberar seu acesso imediatamente dentro do app.</p>

            <div className="bg-white p-4 rounded-3xl mb-8 shadow-2xl relative group">
              <img 
                src={`data:image/png;base64,${pixData.qr_code_base64}`} 
                alt="Pix QR Code" 
                className="w-56 h-56 mx-auto"
              />
              <div className="absolute inset-0 border-4 border-[#A6FF00]/20 rounded-3xl animate-pulse -z-10" />
            </div>

            <div className="w-full bg-[#1A1A24] rounded-3xl p-6 border border-[#A6FF00]/30 mb-8">
              <p className="text-mecura-silver text-[10px] uppercase font-bold tracking-widest text-center mb-3">Código Pix Copia e Cola</p>
              <div className="bg-[#0A0A0F] border border-[#262636] p-4 rounded-xl flex items-center gap-3">
                <span className="text-[11px] text-mecura-silver truncate font-mono text-left flex-1">{pixData.qr_code}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.qr_code);
                    alert("Copiado!");
                  }}
                  className="bg-[#A6FF00]/10 hover:bg-[#A6FF00]/20 text-[#A6FF00] p-2.5 rounded-lg transition-colors"
                >
                  <Ticket className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4 bg-[#A6FF00]/5 px-6 rounded-full border border-[#A6FF00]/10">
              <div className="w-2.5 h-2.5 bg-[#A6FF00] rounded-full animate-pulse shadow-[0_0_8px_#A6FF00]" />
              <span className="text-[#A6FF00] text-sm font-bold tracking-tight uppercase">Aguardando confirmação...</span>
            </div>

            <button 
              onClick={() => setPixData(null)}
              className="mt-8 text-mecura-silver text-sm font-medium hover:text-white transition-colors underline underline-offset-4 opacity-70"
            >
              Escolher outro pagamento
            </button>
          </div>
        ) : step === 'discount' ? (
          <div className="flex flex-col items-center text-center pt-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(212,175,55,0.4)] relative bg-gradient-to-br from-[#A6FF00] to-[#8BD400]">
              <Percent className="w-12 h-12 text-[#0A0A0F]" strokeWidth={3} />
            </div>

            <h2 className="text-2xl font-bold mb-8 leading-tight text-mecura-pearl">
              {userName || 'Lucas'}, hoje<br />
              você tem desconto<br />
              na sua consulta:
            </h2>

            <div className="mb-2">
              <span className="text-mecura-silver text-lg line-through decoration-mecura-silver/50">De: R$ 598</span>
            </div>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#A6FF00] to-[#C9FF5C] mb-8 tracking-tighter drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
              R$ 250,00
            </div>
            <div className="space-y-2 text-mecura-silver">
              <p className="text-[#A6FF00] font-bold text-lg">Acompanhamento Premium</p>
              <p>O médico irá te atender em Video Chamada.</p>
              <p>Ele vai avaliar seu perfil<br />único e orientar os próximos<br />passos.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col pt-4">
            <h2 className="text-2xl font-bold text-center leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#A6FF00] to-[#C9FF5C]">
              Acompanhamento Premium
            </h2>

            <div className="text-center mb-6">
              <p className="text-mecura-silver mb-1">Hoje Por Apenas:</p>
              <div className="text-6xl font-black tracking-tighter drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] text-transparent bg-clip-text bg-gradient-to-r from-[#A6FF00] to-[#C9FF5C]">
                R$ {finalPrice.toFixed(2).replace('.', ',')}
              </div>
              {appliedCoupon && (
                <p className="text-sm text-mecura-neon mt-2">
                  Cupom {appliedCoupon.code} aplicado (-{appliedCoupon.discountType === 'fixed' ? `R$ ${appliedCoupon.discount}` : `${appliedCoupon.discount}%`})
                </p>
              )}
            </div>

            {/* Coupon Input */}
            {!appliedCoupon && (
              <div className="bg-[#1A1A24] rounded-3xl p-4 mb-6 border border-[#2A2A3A]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Tem um cupom de desconto?"
                    className="flex-1 bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white focus:outline-none focus:border-mecura-neon/50 uppercase"
                  />
                  <Button onClick={handleApplyCoupon} disabled={!couponCode} className="px-6">
                    Aplicar
                  </Button>
                </div>
                {couponError && <p className="text-red-400 text-sm mt-2 px-2">{couponError}</p>}
              </div>
            )}

            <div className="bg-[#1A1A24] rounded-3xl p-6 mb-8 border border-[#A6FF00]/30">
              <h3 className="text-xl font-bold text-center mb-6 text-mecura-pearl">
                Escolha a forma de pagamento:
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl bg-[#0A0A0F] border-2 transition-all ${
                    paymentMethod === 'pix' ? 'border-[#A6FF00] shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-transparent'
                  }`}
                >
                  <PixIcon className={`w-8 h-8 ${paymentMethod === 'pix' ? 'text-[#A6FF00]' : 'text-mecura-silver'}`} />
                  <span className="font-medium text-lg text-mecura-pearl">Pix</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-mecura-silver text-sm mb-8">
              <Lock className="w-4 h-4" />
              Pagamento 100% seguro e criptografado
            </div>
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent z-10 flex flex-col gap-3">
        
        {pixData ? (
          <div className="flex flex-col gap-3 w-full">
            <Button 
              className="w-full h-12 bg-[#1A1A26] border border-[#A6FF00]/50 text-[#A6FF00] hover:bg-[#A6FF00]/10"
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
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#A6FF00] to-[#8BD400] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)]"
              onClick={async () => {
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
            }} disabled={isLoading}
            >
              Já Paguei (Liberar Acesso)
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full h-16 text-lg font-bold tracking-wide" 
            variant="premium"
            onClick={() => {
              step === 'discount' ? setStep('checkout') : handlePayment()
            }}
            isLoading={isLoading}
            disabled={step === 'checkout' && !paymentMethod}
          >
            {step === 'discount' ? 'Próximo' : 'Gerar Pix e Iniciar'}
          </Button>
        )}

        <button 
          onClick={() => navigate('/dashboard')}
          className="text-mecura-silver text-sm font-medium underline decoration-mecura-silver/30 underline-offset-4 hover:text-mecura-pearl transition-colors py-2"
        >
          Pular por enquanto e ir para o painel
        </button>
      </div>
    </div>
  );
}
