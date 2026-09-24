import { db } from '../firebase';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useAdminStore, Coupon } from '../store/useAdminStore';
import { auth } from '../firebase';
import { 
  ChevronLeft, 
  CreditCard, 
  Ticket, 
  Lock, 
  Percent, 
  CheckCircle2, 
  ShieldCheck, 
  Star,
  Crown,
  Sparkles,
  Video,
  Clock,
  ArrowRight,
  Zap,
  FileText,
  BadgeCheck,
  Check,
  X,
  HelpCircle,
  RefreshCw,
  Scale,
  Gavel,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LegalInfoModal } from '../components/LegalInfoModal';
import { INSTITUTIONAL_INFO } from '../data/legalAndPrivacy';

// Custom Pix Icon to match the print
const PixIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.864 3.738L2.53 8.072c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L9.424 3.738c-.707-.707-1.853-.707-2.56 0zm10.272 0l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56l-4.334-4.334c-.707-.707-1.853-.707-2.56 0zM12 14.56l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L12 14.56z" />
  </svg>
);

export function CheckoutScreen() {
  const navigate = useNavigate();
  const { userName, joinQueue, setPagamentoConsulta, setPagamentoPremium, selectedOffer, setSelectedOffer, incrementBonus } = useStore();
  const { coupons, useCoupon } = useAdminStore();
  const [step, setStep] = useState<'discount' | 'evolution' | 'checkout'>('discount');
  const [evolutionTab, setEvolutionTab] = useState<'vip' | 'basic'>('vip');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>('pix');
  const [isLoading, setIsLoading] = useState(false);
  
  const [pixData, setPixData] = useState<{ id: string, qr_code: string, qr_code_base64: string } | null>(null);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const pollingInterval = React.useRef<NodeJS.Timeout | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);

  const basePrice = selectedOffer === 'basic' ? 49.90 : 249.90;
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
    const currentUserId = auth.currentUser?.uid || 'guest_' + Math.random().toString(36).substring(7);
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
            title: selectedOffer === 'basic' ? 'Consulta Essencial Mecura' : 'Acompanhamento VIP Mecura',
            price: finalPrice,
            email: auth.currentUser?.email || 'paciente@mecura.com',
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
            return;
          }
        }
      } catch (err) {
        console.error("Erro ao gerar PIX: ", err);
      }
      alert("Falha ao gerar o Pix. Tente novamente.");
      setIsLoading(false);
      return;
    }

    if (paymentMethod === 'card') {
      try {
        const response = await fetch('/api/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: selectedOffer === 'basic' ? 'Consulta Essencial - Mecura' : 'Acesso VIP Premium - Mecura',
            price: finalPrice,
            payerEmail: auth.currentUser?.email || 'paciente@mecura.com',
            payerName: userName || 'Paciente',
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.init_point) {
            setCardUrl(data.init_point);
            setIsLoading(false);
            
            // Abre o checkout do Mercado Pago de forma segura
            try {
              if (window.self !== window.top) {
                window.open(data.init_point, '_blank');
              } else {
                window.location.href = data.init_point;
              }
            } catch {
              window.open(data.init_point, '_blank');
            }
            return;
          }
        }
        alert("Não foi possível iniciar o pagamento com cartão. Tente novamente.");
        setIsLoading(false);
      } catch (err) {
        console.error("Erro ao iniciar pagamento com cartão: ", err);
        alert("Erro ao conectar com o Mercado Pago. Tente novamente.");
        setIsLoading(false);
      }
      return;
    }
    
    // Fallback: outros métodos
    handleSuccess();
  };

  const handleSuccess = async () => {
    alert("Pagamento aprovado! Preparando seu atendimento...");
    setPagamentoConsulta(true);
    if (selectedOffer === 'basic') {
      await joinQueue();
      navigate('/queue');
    } else {
      setPagamentoPremium(true);
      navigate('/scheduling');
    }
  };

  React.useEffect(() => {
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
                  type: selectedOffer === 'basic' ? 'Consulta Básica (R$ 49,90)' : 'Consulta VIP Premium (R$ 249,90)',
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
        className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-[#050508]/85 backdrop-blur-xl border-b border-white/5"
      >
        <button 
          onClick={() => {
            if (step === 'checkout') setStep('evolution');
            else if (step === 'evolution') setStep('discount');
            else navigate(-1);
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mecura-neon/10 border border-mecura-neon/20 shadow-[0_0_15px_rgba(166,255,0,0.1)]">
          <Lock className="w-3.5 h-3.5 text-mecura-neon" />
          <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-widest">
            {step === 'evolution' ? 'Suporte & Salvo-Conduto' : 'Pagamento Seguro'}
          </span>
        </div>
      </motion.div>

      <div className={`flex-1 overflow-y-auto pt-24 ${step === 'evolution' ? 'pb-52' : 'pb-40'} px-4 sm:px-6 flex flex-col relative z-10`}>
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
          ) : cardUrl ? (
            <motion.div 
              key="card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center pt-6"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-mecura-neon/10 border border-mecura-neon/20">
                 <CreditCard className="w-10 h-10 text-mecura-neon" />
              </div>

              <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">Checkout Mercado Pago</h2>
              <p className="text-[#8A8A9E] text-center text-[15px] mb-8 max-w-[320px] font-light">
                A página de pagamento seguro do Mercado Pago foi aberta para você inserir os dados do seu cartão (crédito ou débito).
              </p>

              <div className="w-full bg-[#12121A] rounded-[32px] p-6 border border-white/5 mb-8 shadow-xl text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-mecura-neon" />
                  <span className="text-white font-bold text-sm">Ambiente 100% Criptografado</span>
                </div>
                <p className="text-[#8A8A9E] text-xs leading-relaxed">
                  Pague com Visa, Mastercard, Elo, Hipercard ou American Express em até 12x com proteção do Mercado Pago.
                </p>
              </div>

              <div className="flex items-center gap-3 py-4 bg-mecura-neon/5 px-6 rounded-full border border-mecura-neon/10">
                <div className="w-2.5 h-2.5 bg-mecura-neon rounded-full animate-pulse shadow-[0_0_10px_#A6FF00]" />
                <span className="text-mecura-neon text-sm font-bold tracking-widest uppercase">Aguardando pagamento...</span>
              </div>

              <button 
                onClick={() => setCardUrl(null)}
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
              className="flex flex-col items-center text-center pt-4"
            >
              {/* Top Badge Icon */}
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative bg-mecura-neon/10 shadow-[0_0_45px_rgba(166,255,0,0.2)] border border-mecura-neon/30">
                <Percent className="w-11 h-11 text-mecura-neon" strokeWidth={2.5} />
              </div>
              
              <h2 className="text-[32px] sm:text-[34px] font-serif font-bold mb-8 leading-[1.15] text-white tracking-tight">
                {userName || 'Olá'}, hoje<br />
                você tem um <span className="italic font-light">desconto</span><br />
                especial:
              </h2>

              {/* Offer Card 49,90 */}
              <div className="w-full bg-gradient-to-br from-[#12121A] to-[#0A0A0F] rounded-[36px] p-7 sm:p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-44 h-44 bg-mecura-neon/10 blur-[60px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[#8A8A9E] text-lg line-through decoration-[#8A8A9E]/60 font-medium">De: R$ 380</span>
                  <span className="bg-mecura-neon/15 border border-mecura-neon/30 text-mecura-neon text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    87% OFF HOJE
                  </span>
                </div>

                <div className="text-[68px] sm:text-[76px] font-black text-mecura-neon mb-2 tracking-tighter drop-shadow-[0_0_25px_rgba(166,255,0,0.25)] relative z-10 leading-none">
                  R$ 49<span className="text-[38px] sm:text-[42px]">,90</span>
                </div>
                
                <p className="text-[#8A8A9E] text-xs font-medium mb-8 relative z-10 text-left">
                  Ou em até 3x no cartão de crédito • Acesso imediato
                </p>

                <div className="space-y-4 text-left relative z-10 border-t border-white/5 pt-6">
                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-mecura-neon/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-mecura-neon" />
                    </div>
                    <div>
                      <p className="text-white text-[15px] font-semibold leading-snug">Não precisa agendar!</p>
                      <p className="text-[#8A8A9E] text-[13px] leading-relaxed">O médico regulador já está on-line para te atender agora.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-mecura-neon/10 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-mecura-neon" />
                    </div>
                    <div>
                      <p className="text-white text-[15px] font-semibold leading-snug">Avaliação clínica individualizada</p>
                      <p className="text-[#8A8A9E] text-[13px] leading-relaxed">Ele vai avaliar seu histórico clínico, sintomas e indicar a melhor conduta.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-mecura-neon/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-mecura-neon" />
                    </div>
                    <div>
                      <p className="text-white text-[15px] font-semibold leading-snug">Receita Digital Oficial ICP-Brasil</p>
                      <p className="text-[#8A8A9E] text-[13px] leading-relaxed">Prescrição médica válida nacionalmente para farmácias e importadoras.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-mecura-neon/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 text-mecura-neon" />
                    </div>
                    <div>
                      <p className="text-white text-[15px] font-semibold leading-snug">Protocolo terapêutico inicial</p>
                      <p className="text-[#8A8A9E] text-[13px] leading-relaxed">Instruções claras de miligramagem e introdução segura de fitocanabinoides.</p>
                    </div>
                  </div>
                </div>

                {/* Assurance note */}
                <div className="mt-7 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[#8A8A9E] text-xs">
                  <BadgeCheck className="w-4 h-4 text-mecura-neon" />
                  <span>Emissão conforme normas do CFM e Anvisa</span>
                </div>
              </div>
            </motion.div>
          ) : step === 'evolution' ? (
            /* STEP 2: TELA DE EVOLUÇÃO / UPGRADE (ENQUADRAMENTO UNIFORME, CENTRALIZADO E HARMONIOSO) */
            <motion.div 
              key="evolution"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center pt-1 w-full max-w-lg mx-auto"
            >
              {/* Badge Top Header */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mecura-neon/10 border border-mecura-neon/30 mb-3 shadow-[0_0_20px_rgba(166,255,0,0.15)]"
              >
                <Scale className="w-3.5 h-3.5 text-mecura-neon" />
                <span className="text-[10px] sm:text-[11px] font-black text-mecura-neon uppercase tracking-wider">
                  Dossiê Pericial & Salvo-Conduto
                </span>
              </motion.div>

              {/* Título Principal Centralizado e Uniforme */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-center mb-2 leading-tight text-white tracking-tight px-2">
                {userName || 'Lucas'}, garanta <span className="text-transparent bg-clip-text bg-gradient-to-r from-mecura-neon via-white to-mecura-neon">80% do caminho</span><br />
                para o seu Salvo-Conduto (HC)
              </h2>

              <p className="text-[#9A9AB5] text-center text-[12px] sm:text-[13px] mb-4 max-w-[360px] leading-relaxed px-2">
                Para plantar ou transportar cannabis legalmente sem risco de apreensão policial, a Justiça exige <strong className="text-white">Laudo Pericial Circunstanciado</strong> e <strong className="text-white">Relatório Evolutivo</strong>. No VIP, todo o dossiê já está incluso!
              </p>

              {/* RÉGUA VISUAL DE 80% DO HABEAS CORPUS / SALVO-CONDUTO */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full bg-gradient-to-br from-[#12190E] via-[#0E130B] to-[#0A0E08] border border-mecura-neon/30 rounded-[22px] p-4 mb-4 relative overflow-hidden shadow-[0_0_25px_rgba(166,255,0,0.1)]"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-mecura-neon/15 blur-[40px] rounded-full pointer-events-none" />

                <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Gavel className="w-4 h-4 text-mecura-neon" />
                    <span className="text-[11px] font-black text-white uppercase tracking-wider">
                      Caminho do Salvo-Conduto
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-black bg-mecura-neon px-2.5 py-0.5 rounded-full shadow-sm">
                    80% Pronto no VIP
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden p-0.5 border border-white/10 mb-2.5 relative z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "80%" }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-mecura-neon via-[#D5FF66] to-mecura-neon rounded-full shadow-[0_0_12px_rgba(166,255,0,0.8)]"
                  />
                </div>

                {/* 3 Passos Uniformes */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] sm:text-[11px] text-center relative z-10">
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-mecura-neon font-black mb-0.5">Passo 1</span>
                    <span className="text-white font-medium leading-tight">Laudo Pericial Inicial</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-mecura-neon font-black mb-0.5">Passo 2</span>
                    <span className="text-white font-medium leading-tight">Relatório 90d</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-[#8A8A9E] font-semibold mb-0.5">Passo 3</span>
                    <span className="text-[#8A8A9E] font-medium leading-tight">HC Concedido</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-[#9A9AB5] text-center relative z-10">
                  <FileCheck className="w-3.5 h-3.5 text-mecura-neon shrink-0" />
                  <span>Economia de até R$ 1.500 em perícias médicas avulsas.</span>
                </div>
              </motion.div>

              {/* TABS SEGMENTADAS PERFEITAMENTE UNIFORMES E CENTRALIZADAS (GRID 50/50) */}
              <div className="w-full grid grid-cols-2 gap-2 bg-[#0F0F17] p-1.5 rounded-2xl border border-white/10 mb-4">
                {/* Tab 1: VIP 360° */}
                <button
                  type="button"
                  onClick={() => setEvolutionTab('vip')}
                  className={`relative py-2.5 px-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                    evolutionTab === 'vip' ? 'text-black' : 'text-[#8A8A9E] hover:text-white'
                  }`}
                >
                  {evolutionTab === 'vip' && (
                    <motion.div
                      layoutId="activeEvolutionPill"
                      className="absolute inset-0 bg-mecura-neon rounded-xl shadow-[0_0_20px_rgba(166,255,0,0.3)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center w-full">
                    <span className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full mb-1 ${
                      evolutionTab === 'vip' ? 'bg-black/20 text-black' : 'bg-mecura-neon/15 text-mecura-neon'
                    }`}>
                      ⭐ Recomendado
                    </span>
                    <span className="text-xs sm:text-[13px] font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-current" />
                      VIP + Laudos HC
                    </span>
                    <span className="text-[11px] font-extrabold mt-0.5">
                      R$ 249,90
                    </span>
                  </div>
                </button>

                {/* Tab 2: Consulta Essencial */}
                <button
                  type="button"
                  onClick={() => setEvolutionTab('basic')}
                  className={`relative py-2.5 px-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                    evolutionTab === 'basic' ? 'text-white' : 'text-[#8A8A9E] hover:text-white'
                  }`}
                >
                  {evolutionTab === 'basic' && (
                    <motion.div
                      layoutId="activeEvolutionPill"
                      className="absolute inset-0 bg-white/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center w-full">
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full mb-1 bg-white/5 text-[#8A8A9E]">
                      Entrada
                    </span>
                    <span className="text-xs sm:text-[13px] font-bold">
                      Consulta Essencial
                    </span>
                    <span className="text-[11px] font-semibold mt-0.5">
                      R$ 49,90
                    </span>
                  </div>
                </button>
              </div>

              {/* CONTEÚDO DAS ABAS (COM ANIMAÇÃO SUAVE) */}
              <AnimatePresence mode="wait">
                {evolutionTab === 'vip' ? (
                  /* ABA 1: ACOMPANHAMENTO VIP COM LAUDOS DE HABEAS CORPUS */
                  <motion.div 
                    key="tab-vip"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full bg-gradient-to-br from-[#14191C] via-[#0E1316] to-[#0A0D0F] rounded-[24px] p-4 sm:p-5 border-2 border-mecura-neon/50 relative overflow-hidden shadow-[0_0_25px_rgba(166,255,0,0.12)]"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-mecura-neon/10 blur-[50px] rounded-full pointer-events-none" />

                    {/* Header Centralizado do Card VIP */}
                    <div className="text-center mb-3 relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mecura-neon/15 border border-mecura-neon/30 text-mecura-neon text-[10px] font-black uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3 fill-mecura-neon" />
                        Dossiê Pericial Completo • 80% do HC
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center gap-2">
                        Acompanhamento VIP 360°
                        <Crown className="w-4 h-4 text-mecura-neon fill-mecura-neon" />
                      </h3>
                      <p className="text-[#9A9AB5] text-xs mt-0.5">
                        Vídeo de 45 min • Retorno em 90d incluso • Suporte Pericial
                      </p>
                    </div>

                    {/* Box de Preço Perfeitamente Enquadrado (Sem truncamento) */}
                    <div className="py-2.5 px-3.5 rounded-2xl bg-black/60 border border-mecura-neon/25 flex items-center justify-between mb-4 relative z-10">
                      <div className="text-left">
                        <span className="text-[10px] text-[#8A8A9E] line-through block">De R$ 1.300,00</span>
                        <span className="text-[11px] text-mecura-neon font-black uppercase tracking-wider">
                          Economize R$ 1.050
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl sm:text-[26px] font-black text-white leading-none tracking-tight">
                          R$ 249<span className="text-base text-mecura-neon">,90</span>
                        </div>
                        <span className="text-[10px] text-[#9A9AB5] block mt-0.5">
                          ou 12x de R$ 24,90 no cartão / Pix
                        </span>
                      </div>
                    </div>

                    {/* Lista Uniforme e Alinhada de Benefícios */}
                    <div className="space-y-2.5 relative z-10 border-t border-white/10 pt-3">
                      
                      {/* Laudo Pericial p/ HC */}
                      <div className="flex items-start gap-3 bg-mecura-neon/5 p-3 rounded-2xl border border-mecura-neon/20">
                        <div className="w-8 h-8 rounded-xl bg-mecura-neon/20 flex items-center justify-center shrink-0 mt-0.5 border border-mecura-neon/40">
                          <Scale className="w-4 h-4 text-mecura-neon" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-white text-[13px] sm:text-[14px] font-bold leading-tight">
                              Laudo Pericial p/ Habeas Corpus
                            </p>
                            <span className="text-[9px] bg-mecura-neon text-black font-black px-1.5 py-0.2 rounded uppercase shrink-0">
                              HC
                            </span>
                          </div>
                          <p className="text-[#9A9AB5] text-[11px] sm:text-[12px] leading-relaxed mt-1">
                            Fundamentação técnica com CID, histórico de refratariedade aos remédios comuns e justificativa indispensável exigida pelos juízes.
                          </p>
                        </div>
                      </div>

                      {/* Relatório Evolutivo */}
                      <div className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-xl bg-mecura-neon/15 flex items-center justify-center shrink-0 mt-0.5 border border-mecura-neon/30">
                          <Clock className="w-4 h-4 text-mecura-neon" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[13px] sm:text-[14px] font-bold leading-tight">
                            Consulta de Retorno + Relatório Evolutivo
                          </p>
                          <p className="text-[#9A9AB5] text-[11px] sm:text-[12px] leading-relaxed mt-1">
                            A Justiça exige prova de acompanhamento contínuo em 90 dias. Seu relatório evolutivo sai 100% gratuito na consulta de retorno!
                          </p>
                        </div>
                      </div>

                      {/* Vídeo Chamada */}
                      <div className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-xl bg-mecura-neon/15 flex items-center justify-center shrink-0 mt-0.5 border border-mecura-neon/30">
                          <Video className="w-4 h-4 text-mecura-neon" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[13px] sm:text-[14px] font-bold leading-tight">
                            Consulta Exclusiva por Vídeo (45 min)
                          </p>
                          <p className="text-[#9A9AB5] text-[11px] sm:text-[12px] leading-relaxed mt-1">
                            Atendimento aprofundado olho no olho com médico especialista em cannabis para avaliar seu histórico clínico com calma e empatia.
                          </p>
                        </div>
                      </div>

                      {/* Laudo Psicomotor & Anvisa */}
                      <div className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-xl bg-mecura-neon/15 flex items-center justify-center shrink-0 mt-0.5 border border-mecura-neon/30">
                          <ShieldCheck className="w-4 h-4 text-mecura-neon" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[13px] sm:text-[14px] font-bold leading-tight">
                            Laudo de Aptidão Psicomotora + Anvisa
                          </p>
                          <p className="text-[#9A9AB5] text-[11px] sm:text-[12px] leading-relaxed mt-1">
                            Resguardo técnico para direção veicular e trabalho, acompanhado de assessoria completa para importações oficiais.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ABA 2: CONSULTA ESSENCIAL (R$ 49,90) */
                  <motion.div 
                    key="tab-basic"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full bg-[#0D0D14] rounded-[24px] p-4 sm:p-5 border border-white/10 relative overflow-hidden"
                  >
                    {/* Header Centralizado do Card Essencial */}
                    <div className="text-center mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-white">Consulta Essencial</h3>
                      <p className="text-[#9A9AB5] text-xs mt-0.5">Atendimento Rápido Inicial via Chat</p>
                    </div>

                    {/* Preço Essencial */}
                    <div className="py-2.5 px-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between mb-4">
                      <div className="text-left">
                        <span className="text-[10px] text-[#8A8A9E] line-through block">De R$ 380,00</span>
                        <span className="text-[11px] text-mecura-neon font-black uppercase tracking-wider">
                          87% de Desconto
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl sm:text-[26px] font-black text-mecura-neon leading-none">
                          R$ 49,90
                        </div>
                        <span className="text-[10px] text-[#9A9AB5] block mt-0.5">
                          Pagamento único via Pix ou Cartão
                        </span>
                      </div>
                    </div>

                    {/* Benefícios Inclusos */}
                    <div className="space-y-2 text-xs border-t border-white/5 pt-3">
                      <div className="flex items-center gap-2 text-white">
                        <Check className="w-4 h-4 text-mecura-neon shrink-0" />
                        <span>Atendimento imediato via chat sem agendamento</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="w-4 h-4 text-mecura-neon shrink-0" />
                        <span>Receita Digital oficial ICP-Brasil com QR Code</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Check className="w-4 h-4 text-mecura-neon shrink-0" />
                        <span>Protocolo básico de dosagem em gotas</span>
                      </div>
                    </div>

                    {/* Alerta Importante sobre Laudo Pericial de HC */}
                    <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Não inclui suporte a Habeas Corpus</span>
                      </div>
                      <p className="text-[11px] text-amber-200/80 leading-relaxed">
                        A Consulta Essencial não dá direito a Laudo Pericial para Salvo-Conduto / HC, não inclui chamada por vídeo e não inclui consulta de retorno gratuita.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reassurance Footer Badge */}
              <div className="flex items-center justify-center gap-2 text-[#8A8A9E] text-[11px] mt-4 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-mecura-neon" />
                <span>Garantia de Satisfação Médica Mecura • Dossiê Oficial ICP-Brasil</span>
              </div>
            </motion.div>
          ) : (
            /* STEP 3: CHECKOUT (PAGAMENTO SELECIONADO: 49,90 ou 249,90) */
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col pt-4"
            >
              {/* Product Selection Summary Badge */}
              <div className={`w-full rounded-[24px] p-5 mb-6 border ${selectedOffer === 'premium' ? 'bg-gradient-to-r from-mecura-neon/15 via-[#12121A] to-[#0A0A0F] border-mecura-neon/40 shadow-[0_0_25px_rgba(166,255,0,0.15)]' : 'bg-[#12121A] border-white/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedOffer === 'premium' ? 'bg-mecura-neon/20 text-mecura-neon' : 'bg-white/10 text-white'}`}>
                      {selectedOffer === 'premium' ? <Scale className="w-5 h-5 text-mecura-neon" /> : <ShieldCheck className="w-5 h-5 text-mecura-neon" />}
                    </div>
                    <div>
                      <p className="text-white font-bold text-[15px] sm:text-[16px] leading-tight">
                        {selectedOffer === 'premium' ? 'Acompanhamento VIP + Laudo HC' : 'Consulta Essencial'}
                      </p>
                      <p className="text-[#8A8A9E] text-xs">
                        {selectedOffer === 'premium' ? 'Dossiê p/ Salvo-Conduto + Vídeo 45min + Retorno' : 'Atendimento Imediato Sem Agendamento'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedOffer === 'premium') {
                        setSelectedOffer('basic');
                      } else {
                        setSelectedOffer('premium');
                      }
                    }}
                    className="text-xs text-mecura-neon hover:underline font-semibold flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{selectedOffer === 'premium' ? 'Mudar p/ R$ 49,90' : 'Evoluir p/ VIP'}</span>
                  </button>
                </div>
              </div>

              <div className="text-center mb-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 blur-[60px] rounded-full pointer-events-none" />
                <p className="text-[#8A8A9E] mb-2 font-medium tracking-wide uppercase text-xs">Valor do Pagamento:</p>
                <div className={`text-[60px] sm:text-[68px] font-black tracking-tighter relative z-10 leading-none ${selectedOffer === 'basic' ? 'text-mecura-neon drop-shadow-[0_0_20px_rgba(166,255,0,0.15)]' : 'text-transparent bg-clip-text bg-gradient-to-r from-mecura-neon via-white to-mecura-neon drop-shadow-[0_0_20px_rgba(166,255,0,0.25)]'}`}>
                  R$ {finalPrice.toFixed(2).replace('.', ',')}
                </div>
                {appliedCoupon && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-mecura-neon/10 border border-mecura-neon/20 rounded-full shadow-lg">
                    <Ticket className="w-4 h-4 text-mecura-neon" />
                    <span className="text-[13px] font-bold text-mecura-neon uppercase tracking-wide">
                      Cupom {appliedCoupon.code} aplicado (-{appliedCoupon.discountType === 'fixed' ? `R$ ${appliedCoupon.discount}` : `${appliedCoupon.discount}%`})
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Coupon Input */}
              {!appliedCoupon && (
                <div className="bg-[#12121A] rounded-[24px] p-4 mb-6 border border-white/5 shadow-xl">
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Possui cupom de desconto?"
                      className="flex-1 bg-[#050508] border border-white/5 rounded-2xl px-4 py-3.5 text-white text-[14px] focus:outline-none focus:border-white/20 uppercase placeholder:normal-case placeholder:text-[#8A8A9E]"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      isLoading={false}
                      disabled={!couponCode}
                      className="bg-mecura-neon text-black font-bold h-12 px-5 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(166,255,0,0.3)] transition-all"
                    >
                      Aplicar
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-red-400 text-xs mt-2 px-1">{couponError}</p>
                  )}
                </div>
              )}

              {/* Payment Methods List */}
              <div className="space-y-3 mb-6">
                {/* Pix */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`w-full text-left p-1 rounded-[24px] transition-all duration-300 group ${paymentMethod === 'pix' ? 'bg-gradient-to-r from-white/10 to-transparent border border-white/10' : 'bg-transparent border border-transparent hover:border-white/5'}`}
                >
                  <div className={`bg-[#0A0A0F] rounded-[20px] p-4 sm:p-5 flex items-center justify-between transition-all duration-300 ${paymentMethod === 'pix' ? 'shadow-2xl' : 'group-hover:bg-[#12121A]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${paymentMethod === 'pix' ? 'bg-mecura-neon/15' : 'bg-[#12121A] group-hover:bg-white/5'}`}>
                        <PixIcon className={`w-7 h-7 ${paymentMethod === 'pix' ? 'text-mecura-neon' : 'text-[#8A8A9E]'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-[16px] ${paymentMethod === 'pix' ? 'text-white' : 'text-[#8A8A9E]'}`}>Pix</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20">Instantâneo</span>
                        </div>
                        <p className={`text-[13px] ${paymentMethod === 'pix' ? 'text-mecura-neon' : 'text-[#8A8A9E]/60'}`}>Aprovação imediata e liberação na hora</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'pix' ? 'border-mecura-neon bg-mecura-neon/10' : 'border-[#8A8A9E]/30'}`}>
                      {paymentMethod === 'pix' && <div className="w-2.5 h-2.5 bg-mecura-neon rounded-full" />}
                    </div>
                  </div>
                </button>

                {/* Cartão de Crédito */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full text-left p-1 rounded-[24px] transition-all duration-300 group ${paymentMethod === 'card' ? 'bg-gradient-to-r from-white/10 to-transparent border border-white/10' : 'bg-transparent border border-transparent hover:border-white/5'}`}
                >
                  <div className={`bg-[#0A0A0F] rounded-[20px] p-4 sm:p-5 flex items-center justify-between transition-all duration-300 ${paymentMethod === 'card' ? 'shadow-2xl' : 'group-hover:bg-[#12121A]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${paymentMethod === 'card' ? 'bg-mecura-neon/15' : 'bg-[#12121A] group-hover:bg-white/5'}`}>
                        <CreditCard className={`w-7 h-7 ${paymentMethod === 'card' ? 'text-mecura-neon' : 'text-[#8A8A9E]'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-[16px] ${paymentMethod === 'card' ? 'text-white' : 'text-[#8A8A9E]'}`}>Cartão de Crédito</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#8A8A9E] border border-white/10">Até 12x</span>
                        </div>
                        <p className={`text-[13px] ${paymentMethod === 'card' ? 'text-mecura-neon' : 'text-[#8A8A9E]/60'}`}>Crédito ou Débito via Mercado Pago</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'border-mecura-neon bg-mecura-neon/10' : 'border-[#8A8A9E]/30'}`}>
                      {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-mecura-neon rounded-full" />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Security Banner */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-2 text-xs text-[#8A8A9E] mb-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-mecura-neon shrink-0" />
                  <span>Ambiente Seguro Criptografado • Dados 100% Protegidos pela LGPD</span>
                </div>
                <div className="text-[11px] text-[#8A8A9E]/80 flex items-center justify-center gap-1.5 flex-wrap">
                  <span>{INSTITUTIONAL_INFO.companyName}</span>
                  <span>•</span>
                  <span>CNPJ: <strong className="text-white font-mono">{INSTITUTIONAL_INFO.cnpj}</strong></span>
                  <span>•</span>
                  <button 
                    type="button" 
                    onClick={() => setShowLegalModal(true)}
                    className="text-mecura-neon hover:underline font-semibold cursor-pointer"
                  >
                    Políticas & Parecer
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-20 bg-gradient-to-t from-[#050508] via-[#050508] to-transparent pt-10 flex flex-col items-center"
      >
        {pixData ? (
          <div className="flex flex-col gap-3 mt-2 w-full">
            <Button 
              className="w-full h-12 bg-[#1A1A26] border border-mecura-neon/50 text-mecura-neon hover:bg-mecura-neon/10"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(pixData.qr_code);
                  alert("Código Pix Copiado! Após pagar, clique em 'Já Paguei'.");
                } catch (e) {
                  alert("Seu navegador bloqueou a cópia automática. Por favor, copie manualmente o código acima.");
                }
              }}
            >
              Copiar Código Pix
            </Button>
            <Button 
              className="w-full h-14 text-lg font-bold bg-mecura-neon text-black shadow-[0_0_30px_rgba(166,255,0,0.3)]"
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
              }} 
              disabled={isLoading}
            >
              Já Paguei (Liberar Acesso)
            </Button>
          </div>
        ) : cardUrl ? (
          <div className="flex flex-col gap-3 mt-2 w-full">
            <Button 
              className="w-full h-12 bg-[#1A1A26] border border-mecura-neon/50 text-mecura-neon hover:bg-mecura-neon/10 font-bold"
              onClick={() => {
                try {
                  window.open(cardUrl, '_blank');
                } catch {
                  window.location.href = cardUrl;
                }
              }}
            >
              Abrir Checkout Mercado Pago
            </Button>
            <Button 
              className="w-full h-14 text-lg font-bold bg-mecura-neon text-black shadow-[0_0_30px_rgba(166,255,0,0.3)]"
              onClick={() => {
                handleSuccess();
              }}
            >
              Já Paguei no Cartão (Liberar Acesso)
            </Button>
            <button
              onClick={() => {
                setCardUrl(null);
                setIsLoading(false);
              }}
              className="text-[#8A8A9E] text-xs underline text-center mt-1"
            >
              Escolher outra forma de pagamento
            </button>
          </div>
        ) : step === 'discount' ? (
          /* STEP 1 (Desconto Especial R$ 49,90): Botão para Continuar para Pagamento -> leva para a tela de Evolução */
          <div className="w-full flex flex-col items-center">
            <Button 
              className="w-full h-14 text-lg font-bold bg-mecura-neon text-black shadow-[0_0_35px_rgba(166,255,0,0.35)] hover:shadow-[0_0_45px_rgba(166,255,0,0.5)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              onClick={() => setStep('evolution')}
            >
              <span>Continuar para Pagamento</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <button 
              onClick={() => navigate('/dashboard')}
              className="text-[#8A8A9E] text-[14px] font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4 py-2 mt-1"
            >
              Pular por enquanto e ir para o painel
            </button>
          </div>
        ) : step === 'evolution' ? (
          /* STEP 2 (Tela de Evolução): Ações Diretas com Enquadramento e Tipografia Uniformes */
          <div className="w-full flex flex-col items-center gap-2 max-w-md mx-auto">
            {evolutionTab === 'vip' ? (
              <>
                <Button 
                  className="w-full min-h-[56px] h-auto py-3 px-4 bg-mecura-neon text-black font-black text-[15px] sm:text-[16px] shadow-[0_0_35px_rgba(166,255,0,0.4)] hover:shadow-[0_0_45px_rgba(166,255,0,0.55)] active:scale-[0.99] transition-all flex flex-col items-center justify-center gap-0.5 rounded-2xl group"
                  onClick={() => {
                    setSelectedOffer('premium');
                    setStep('checkout');
                  }}
                >
                  <div className="flex items-center justify-center gap-2 w-full">
                    <Scale className="w-4 h-4 text-black shrink-0" />
                    <span className="truncate">Garantir VIP + Laudos HC (R$ 249,90)</span>
                    <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-[11px] font-bold text-black/80">
                    Dossiê Salvo-Conduto • Vídeo 45 min • Retorno 90d
                  </span>
                </Button>

                <button 
                  onClick={() => {
                    setSelectedOffer('basic');
                    setStep('checkout');
                  }}
                  className="text-[#8A8A9E] text-xs sm:text-[13px] font-semibold hover:text-white transition-colors underline decoration-white/20 underline-offset-4 py-1"
                >
                  Continuar apenas com Consulta Essencial (R$ 49,90)
                </button>

                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-[#8A8A9E] text-xs sm:text-[13px] font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4 py-1"
                >
                  Pular por enquanto e ir para o painel
                </button>
              </>
            ) : (
              <>
                <Button 
                  className="w-full min-h-[56px] h-auto py-3 px-4 bg-mecura-neon text-black font-black text-[15px] sm:text-[16px] shadow-[0_0_35px_rgba(166,255,0,0.4)] hover:shadow-[0_0_45px_rgba(166,255,0,0.55)] active:scale-[0.99] transition-all flex flex-col items-center justify-center gap-0.5 rounded-2xl group"
                  onClick={() => {
                    setSelectedOffer('basic');
                    setStep('checkout');
                  }}
                >
                  <div className="flex items-center justify-center gap-2 w-full">
                    <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                    <span>Confirmar Consulta Essencial (R$ 49,90)</span>
                    <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-[11px] font-bold text-black/80">
                    Atendimento imediato via chat • Receita Digital
                  </span>
                </Button>

                <button 
                  onClick={() => setEvolutionTab('vip')}
                  className="text-mecura-neon text-xs sm:text-[13px] font-bold hover:underline py-1 flex items-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>Ver Benefícios do Acompanhamento VIP (R$ 249,90)</span>
                </button>

                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-[#8A8A9E] text-xs sm:text-[13px] font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4 py-1"
                >
                  Pular por enquanto e ir para o painel
                </button>
              </>
            )}
          </div>
        ) : (
          /* STEP 3 (Checkout): Finalizar Pagamento */
          <div className="w-full flex flex-col items-center">
            <Button 
              className="w-full h-14 text-lg font-bold bg-mecura-neon text-black shadow-[0_0_30px_rgba(166,255,0,0.3)] hover:shadow-[0_0_40px_rgba(166,255,0,0.45)] transition-all flex items-center justify-center gap-2"
              onClick={handlePayment}
              isLoading={isLoading}
              disabled={!paymentMethod}
            >
              {paymentMethod === 'card' 
                ? `Pagar R$ ${finalPrice.toFixed(2).replace('.', ',')} no Cartão` 
                : `Gerar Pix de R$ ${finalPrice.toFixed(2).replace('.', ',')}`}
            </Button>

            <button 
              onClick={() => setStep('evolution')}
              className="text-[#8A8A9E] text-[13px] font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4 py-1.5 mt-1"
            >
              Voltar e alterar opções de plano
            </button>

            <button 
              onClick={() => navigate('/dashboard')}
              className="text-[#8A8A9E] text-[13px] font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4 py-1"
            >
              Pular por enquanto e ir para o painel
            </button>

            <button
              type="button"
              onClick={() => setShowLegalModal(true)}
              className="text-[10px] text-[#8A8A9E]/60 hover:text-[#8A8A9E] transition-colors mt-1 font-mono"
            >
              {INSTITUTIONAL_INFO.companyName} • CNPJ {INSTITUTIONAL_INFO.cnpj} • Termos & LGPD
            </button>
          </div>
        )}
      </motion.div>

      <LegalInfoModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />
    </div>
  );
}


