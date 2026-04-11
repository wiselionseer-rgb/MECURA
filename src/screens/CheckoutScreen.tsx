import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useAdminStore } from '../store/useAdminStore';
import { ChevronLeft, CreditCard, Ticket, Lock, Percent } from 'lucide-react';

// Custom Pix Icon to match the print
const PixIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.864 3.738L2.53 8.072c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L9.424 3.738c-.707-.707-1.853-.707-2.56 0zm10.272 0l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56l-4.334-4.334c-.707-.707-1.853-.707-2.56 0zM12 14.56l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L12 14.56z" />
  </svg>
);

export function CheckoutScreen() {
  const navigate = useNavigate();
  const { userName, joinQueue, setPagamentoConsulta, setPagamentoPremium, selectedOffer } = useStore();
  const { coupons } = useAdminStore();
  const [step, setStep] = useState<'discount' | 'checkout'>('discount');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponError, setCouponError] = useState('');

  const basePrice = selectedOffer === 'basic' ? 49.90 : 250.00;
  const finalPrice = appliedCoupon ? basePrice * (1 - appliedCoupon.discount / 100) : basePrice;

  const handleApplyCoupon = () => {
    setCouponError('');
    const coupon = coupons.find(c => c.code === couponCode.toUpperCase() && c.active);
    if (coupon) {
      setAppliedCoupon(coupon);
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };

  const handlePayment = () => {
    if (!paymentMethod || !selectedOffer) return;
    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setPagamentoConsulta(true);
      if (selectedOffer === 'basic') {
        joinQueue();
        navigate('/queue');
      } else {
        setPagamentoPremium(true);
        navigate('/scheduling');
      }
    }, 2000);
  };

  if (!selectedOffer) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] text-mecura-pearl relative font-sans">
      {/* Header */}
      <div className="flex items-center p-6 pb-2 z-10">
        <button 
          onClick={() => step === 'checkout' ? setStep('discount') : navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center text-mecura-silver hover:bg-[#2A2A3A] transition-colors border border-[#2A2A3A]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center pr-10">
          <h1 className={`text-2xl font-serif font-bold tracking-tight ${selectedOffer === 'basic' ? 'text-mecura-neon' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]'}`}>mecura</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 pt-4">
        {step === 'discount' ? (
          <div className="flex flex-col items-center text-center pt-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,0,0,0.4)] relative ${selectedOffer === 'basic' ? 'bg-[#A6FF00]' : 'bg-gradient-to-br from-[#D4AF37] to-[#AA7B2F]'}`}>
              <Percent className="w-12 h-12 text-[#0A0A0F]" strokeWidth={3} />
            </div>

            <h2 className="text-2xl font-bold mb-8 leading-tight text-mecura-pearl">
              {userName || 'Lucas'}, hoje<br />
              você tem desconto<br />
              na sua consulta:
            </h2>

            {selectedOffer === 'basic' ? (
              <>
                <div className="mb-2">
                  <span className="text-mecura-silver text-lg line-through decoration-mecura-silver/50">De: R$ 380</span>
                </div>
                <div className="text-6xl font-black text-[#A6FF00] mb-8 tracking-tighter drop-shadow-[0_0_10px_rgba(166,255,0,0.3)]">
                  R$ 49,90
                </div>
                <div className="space-y-2 text-mecura-silver">
                  <p className="text-[#A6FF00] font-bold text-lg">Não precisa agendar!</p>
                  <p>O médico já está on-line.</p>
                  <p>Ele vai avaliar seu perfil<br />único e orientar os próximos<br />passos agora mesmo.</p>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2">
                  <span className="text-mecura-silver text-lg line-through decoration-mecura-silver/50">De: R$ 598</span>
                </div>
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] mb-8 tracking-tighter drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                  R$ 250,00
                </div>
                <div className="space-y-2 text-mecura-silver">
                  <p className="text-[#D4AF37] font-bold text-lg">Acompanhamento Premium</p>
                  <p>O médico irá te atender em Video Chamada.</p>
                  <p>Ele vai avaliar seu perfil<br />único e orientar os próximos<br />passos.</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col pt-4">
            <h2 className={`text-2xl font-bold text-center leading-tight mb-6 ${selectedOffer === 'basic' ? 'text-mecura-neon' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]'}`}>
              {selectedOffer === 'basic' ? 'Consulta Essencial' : 'Acompanhamento Premium'}
            </h2>

            <div className="text-center mb-6">
              <p className="text-mecura-silver mb-1">Hoje Por Apenas:</p>
              <div className={`text-6xl font-black tracking-tighter drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] ${selectedOffer === 'basic' ? 'text-[#A6FF00]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]'}`}>
                R$ {finalPrice.toFixed(2).replace('.', ',')}
              </div>
              {appliedCoupon && (
                <p className="text-sm text-mecura-neon mt-2">
                  Cupom {appliedCoupon.code} aplicado (-{appliedCoupon.discount}%)
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

            <div className="bg-[#1A1A24] rounded-3xl p-6 mb-8 border border-[#2A2A3A]">
              <h3 className="text-xl font-bold text-center mb-6 text-mecura-pearl">
                Escolha a forma de pagamento:
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl bg-[#0A0A0F] border-2 transition-all ${
                    paymentMethod === 'card' ? (selectedOffer === 'basic' ? 'border-[#A6FF00] shadow-[0_0_15px_rgba(166,255,0,0.15)]' : 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]') : 'border-transparent'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? (selectedOffer === 'basic' ? 'text-[#A6FF00]' : 'text-[#D4AF37]') : 'text-mecura-silver'}`} />
                  <span className="font-medium text-lg text-mecura-pearl">Cartão de crédito</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl bg-[#0A0A0F] border-2 transition-all ${
                    paymentMethod === 'pix' ? (selectedOffer === 'basic' ? 'border-[#A6FF00] shadow-[0_0_15px_rgba(166,255,0,0.15)]' : 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]') : 'border-transparent'
                  }`}
                >
                  <PixIcon className={`w-8 h-8 ${paymentMethod === 'pix' ? (selectedOffer === 'basic' ? 'text-[#A6FF00]' : 'text-[#D4AF37]') : 'text-mecura-silver'}`} />
                  <span className="font-medium text-lg text-mecura-pearl">Pix</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent z-10 flex flex-col gap-3">
        <Button 
          className={`w-full h-16 text-lg font-bold tracking-wide ${selectedOffer === 'basic' ? 'bg-[#A6FF00] text-[#0A0A0F] hover:bg-[#8CC600]' : ''}`} 
          variant={selectedOffer === 'premium' ? 'premium' : 'primary'}
          onClick={() => step === 'discount' ? setStep('checkout') : handlePayment()}
          isLoading={isLoading}
          disabled={step === 'checkout' && !paymentMethod}
        >
          {step === 'discount' ? 'Próximo' : 'Confirmar Pagamento'}
        </Button>
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
