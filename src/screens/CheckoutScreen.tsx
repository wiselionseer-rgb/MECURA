import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useAdminStore, Coupon } from '../store/useAdminStore';
import { auth } from '../firebase';
import { ChevronLeft, CreditCard, Ticket, Lock, Percent, CheckCircle2, ShieldCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom Pix Icon to match the print
const PixIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.864 3.738L2.53 8.072c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L9.424 3.738c-.707-.707-1.853-.707-2.56 0zm10.272 0l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56l-4.334-4.334c-.707-.707-1.853-.707-2.56 0zM12 14.56l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L12 14.56z" />
  </svg>
);

export function CheckoutScreen() {
  const navigate = useNavigate();
  const { userName, joinQueue, setPagamentoConsulta, setPagamentoPremium, selectedOffer, incrementBonus } = useStore();
  const { coupons } = useAdminStore();
  const [step, setStep] = useState<'discount' | 'checkout'>('discount');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>('pix');
  const [isLoading, setIsLoading] = useState(false);
  
  const [pixData, setPixData] = useState<{ id: string, qr_code: string, qr_code_base64: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const pollingInterval = React.useRef<NodeJS.Timeout | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const basePrice = selectedOffer === 'basic' ? 49.90 : 250.00;
  const finalPrice = appliedCoupon ? basePrice * (1 - appliedCoupon.discount / 100) : basePrice;

  const handleApplyCoupon = () => {
    setCouponError('');
    const currentUserId = auth.currentUser?.uid;
    const coupon = coupons.find(c => c.code === couponCode.toUpperCase() && c.active);
    
    if (coupon) {
      if (coupon.ownerId && coupon.ownerId === currentUserId) {
        setCouponError('Você não pode usar seu próprio cupom de indicação.');
        return;
      }
      setAppliedCoupon(coupon);
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };

  const handlePayment = async () => {
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
  };

  const handleSuccess = () => {
    setPagamentoConsulta(true);
    if (selectedOffer === 'basic') {
      joinQueue();
      navigate('/queue');
    } else {
      setPagamentoPremium(true);
      navigate('/scheduling');
    }
  };

  React.useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  React.useEffect(() => {
    if (!selectedOffer) {
      navigate('/dashboard');
    }
  }, [selectedOffer, navigate]);

  if (!selectedOffer) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-full bg-[#050508] text-white overflow-hidden relative">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-[#050508]/80 backdrop-blur-xl border-b border-white/5"
      >
        <button 
          onClick={() => step === 'checkout' ? setStep('discount') : navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mecura-neon/10 border border-mecura-neon/20 shadow-[0_0_15px_rgba(166,255,0,0.1)]">
          <Lock className="w-3.5 h-3.5 text-mecura-neon" />
          <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-widest">Pagamento Seguro</span>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto pt-24 pb-40 px-6 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {pixData ? (
            <motion.div 
              key="pix"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center pt-6"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${selectedOffer === 'basic' ? 'bg-[#A6FF00]/10 border border-[#A6FF00]/20' : 'bg-[#A6FF00]/10 border border-[#A6FF00]/20'}`}>
                 <PixIcon className={`w-10 h-10 ${selectedOffer === 'basic' ? 'text-mecura-neon' : 'text-[#A6FF00]'}`} />
              </div>

              <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">Escaneie o QR Code</h2>
              <p className="text-[#8A8A9E] text-center text-[15px] mb-8 max-w-[280px] font-light">Pague via Pix agora para liberar seu acesso imediatamente dentro do app.</p>

              <div className="bg-white p-5 rounded-[32px] mb-8 shadow-2xl relative group">
                <img 
                  src={`data:image/png;base64,${pixData.qr_code_base64}`} 
                  alt="Pix QR Code" 
                  className="w-56 h-56 mx-auto relative z-10"
                />
                <div className="absolute inset-0 border-[6px] border-mecura-neon/20 rounded-[32px] animate-pulse -z-10" />
              </div>

              <div className="w-full bg-[#12121A] rounded-[32px] p-6 border border-white/5 mb-8 shadow-xl">
                <p className="text-[#8A8A9E] text-[10px] uppercase font-bold tracking-widest text-center mb-4">Código Pix Copia e Cola</p>
                <div className="bg-[#050508] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <span className="text-[12px] text-[#8A8A9E] truncate font-mono text-left flex-1">{pixData.qr_code}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.qr_code);
                      alert("Copiado!");
                    }}
                    className="bg-mecura-neon/10 hover:bg-mecura-neon/20 text-mecura-neon p-3 rounded-xl transition-colors border border-mecura-neon/20"
                  >
                    <Ticket className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 py-4 bg-mecura-neon/5 px-6 rounded-full border border-mecura-neon/10">
                <div className="w-2.5 h-2.5 bg-mecura-neon rounded-full animate-pulse shadow-[0_0_10px_#A6FF00]" />
                <span className="text-mecura-neon text-sm font-bold tracking-widest uppercase">Aguardando confirmação...</span>
              </div>

              <button 
                onClick={() => setPixData(null)}
                className="mt-8 text-[#8A8A9E] text-sm font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
              >
                Escolher outro pagamento
              </button>
            </motion.div>
          ) : step === 'discount' ? (
            <motion.div 
              key="discount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center pt-8"
            >
              <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 relative ${selectedOffer === 'basic' ? 'bg-mecura-neon/10 shadow-[0_0_40px_rgba(166,255,0,0.15)] border border-mecura-neon/30' : 'bg-[#A6FF00]/10 shadow-[0_0_40px_rgba(212,175,55,0.15)] border border-[#A6FF00]/30'}`}>
                <Percent className={`w-12 h-12 ${selectedOffer === 'basic' ? 'text-mecura-neon' : 'text-[#A6FF00]'}`} strokeWidth={2.5} />
              </div>
              
              <h2 className="text-[32px] font-serif font-bold mb-10 leading-[1.1] text-white tracking-tight">
                {userName || 'Olá'}, hoje<br />
                você tem um <span className="italic font-light">desconto</span><br />
                especial:
              </h2>

              {selectedOffer === 'basic' ? (
                <div className="w-full bg-gradient-to-br from-[#12121A] to-[#0A0A0F] rounded-[36px] p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-mecura-neon/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="mb-2 relative z-10">
                    <span className="text-[#8A8A9E] text-lg line-through decoration-[#8A8A9E]/50 font-medium">De: R$ 380</span>
                  </div>
                  <div className="text-[72px] font-black text-mecura-neon mb-10 tracking-tighter drop-shadow-[0_0_20px_rgba(166,255,0,0.2)] relative z-10 leading-none">
                    R$ 49<span className="text-[40px]">,90</span>
                  </div>
                  <div className="space-y-5 text-left relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-mecura-neon/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-mecura-neon" />
                      </div>
                      <p className="text-white text-[15px] font-medium leading-relaxed pt-1">Não precisa agendar! O médico já está on-line para te atender.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-mecura-neon/10 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-mecura-neon" />
                      </div>
                      <p className="text-[#8A8A9E] text-[15px] leading-relaxed pt-1">Ele vai avaliar seu perfil único e orientar os próximos passos.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-gradient-to-br from-[#12121A] to-[#0A0A0F] rounded-[36px] p-8 border border-[#A6FF00]/20 relative overflow-hidden shadow-[0_10px_40px_rgba(212,175,55,0.1)]">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#A6FF00]/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="mb-2 relative z-10">
                    <span className="text-[#8A8A9E] text-lg line-through decoration-[#8A8A9E]/50 font-medium">De: R$ 598</span>
                  </div>
                  <div className="text-[72px] font-black text-transparent bg-clip-text bg-gradient-to-r from-mecura-neon to-mecura-neon mb-10 tracking-tighter drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] relative z-10 leading-none">
                    R$ 250
                  </div>
                  <div className="space-y-5 text-left relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#A6FF00]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Star className="w-4 h-4 text-[#A6FF00]" />
                      </div>
                      <p className="text-white text-[15px] font-medium leading-relaxed pt-1">Acompanhamento Premium em vídeo chamada.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#A6FF00]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-[#A6FF00]" />
                      </div>
                      <p className="text-[#8A8A9E] text-[15px] leading-relaxed pt-1">Atendimento humanizado para avaliar seu perfil com profundidade.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col pt-6"
            >
              <h2 className={`text-[32px] font-serif font-bold text-center leading-tight mb-8 tracking-tight ${selectedOffer === 'basic' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-mecura-neon to-mecura-neon'}`}>
                {selectedOffer === 'basic' ? 'Consulta Essencial' : 'Acesso VIP'}
              </h2>
              
              <div className="text-center mb-10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 blur-[60px] rounded-full pointer-events-none" />
                <p className="text-[#8A8A9E] mb-2 font-medium tracking-wide uppercase text-xs">Valor Final:</p>
                <div className={`text-[64px] font-black tracking-tighter relative z-10 leading-none ${selectedOffer === 'basic' ? 'text-mecura-neon drop-shadow-[0_0_20px_rgba(166,255,0,0.15)]' : 'text-transparent bg-clip-text bg-gradient-to-r from-mecura-neon to-mecura-neon drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]'}`}>
                  R$ {finalPrice.toFixed(2).replace('.', ',')}
                </div>
                {appliedCoupon && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 mt-6 bg-mecura-neon/10 border border-mecura-neon/20 rounded-full shadow-lg">
                    <Ticket className="w-4 h-4 text-mecura-neon" />
                    <span className="text-[13px] font-bold text-mecura-neon uppercase tracking-wide">
                      Cupom {appliedCoupon.code} aplicado (-{appliedCoupon.discount}%)
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Coupon Input */}
              {!appliedCoupon && (
                <div className="bg-[#12121A] rounded-[28px] p-5 mb-8 border border-white/5 shadow-xl">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Possui cupom?"
                      className="flex-1 bg-[#050508] border border-white/5 rounded-2xl px-5 py-4 text-white text-[15px] focus:outline-none focus:border-white/20 uppercase placeholder:normal-case placeholder:text-[#8A8A9E]"
                    />
                    <Button onClick={handleApplyCoupon} disabled={!couponCode} className="px-8 rounded-2xl font-bold">
                      Aplicar
                    </Button>
                  </div>
                  {couponError && <p className="text-red-400 text-sm mt-3 px-2 font-medium">{couponError}</p>}
                </div>
              )}

              <div className="bg-[#12121A] rounded-[32px] p-7 mb-8 border border-white/5 shadow-2xl">
                <h3 className="text-lg font-bold text-left mb-6 text-white tracking-tight">
                  Como deseja pagar?
                </h3>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`w-full flex items-center justify-between p-6 rounded-[24px] bg-[#050508] border-2 transition-all group ${
                      paymentMethod === 'pix' ? (selectedOffer === 'basic' ? 'border-mecura-neon shadow-[0_0_20px_rgba(166,255,0,0.1)]' : 'border-[#A6FF00] shadow-[0_0_20px_rgba(212,175,55,0.15)]') : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${paymentMethod === 'pix' ? (selectedOffer === 'basic' ? 'bg-mecura-neon/10' : 'bg-[#A6FF00]/10') : 'bg-[#12121A] group-hover:bg-white/5'}`}>
                        <PixIcon className={`w-7 h-7 ${paymentMethod === 'pix' ? (selectedOffer === 'basic' ? 'text-mecura-neon' : 'text-[#A6FF00]') : 'text-[#8A8A9E]'}`} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-[18px] text-white">Pix Copia e Cola</span>
                        <span className="text-[12px] text-[#8A8A9E] font-medium mt-1">Aprovação imediata</span>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'pix' ? (selectedOffer === 'basic' ? 'border-mecura-neon bg-mecura-neon/10' : 'border-[#A6FF00] bg-[#A6FF00]/10') : 'border-white/10 bg-[#12121A]'}`}>
                      {paymentMethod === 'pix' && <div className={`w-3.5 h-3.5 rounded-full ${selectedOffer === 'basic' ? 'bg-mecura-neon' : 'bg-[#A6FF00]'}`} />}
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050508] via-[#050508]/95 to-transparent z-30 flex flex-col gap-4 pt-24 pb-8"
      >
        <Button 
          className={`w-full h-[64px] text-[17px] font-bold tracking-wide rounded-full shadow-2xl transition-all duration-300 ${
            selectedOffer === 'basic' 
              ? 'bg-mecura-neon text-black hover:bg-[#B3FF1A] shadow-[0_0_30px_rgba(166,255,0,0.2)] hover:shadow-[0_0_40px_rgba(166,255,0,0.3)]' 
              : 'bg-gradient-to-r from-[#A6FF00] to-[#8BD400] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]'
          }`}
          onClick={() => {
            if (pixData) {
              navigator.clipboard.writeText(pixData.qr_code);
              alert("Código Pix Copiado!");
            } else {
              step === 'discount' ? setStep('checkout') : handlePayment()
            }
          }}
          isLoading={isLoading}
          disabled={step === 'checkout' && !paymentMethod}
        >
          {pixData ? 'Copiar Código' : (step === 'discount' ? 'Continuar para Pagamento' : 'Gerar Pix e Iniciar')}
        </Button>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-[#8A8A9E] text-[14px] font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4 py-2"
        >
          Pular por enquanto e ir para o painel
        </button>
      </motion.div>
    </div>
  );
}
