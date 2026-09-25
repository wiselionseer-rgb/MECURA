import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useAdminStore, Coupon } from '../store/useAdminStore';
import { 
  ChevronLeft, 
  CreditCard, 
  Percent, 
  Lock, 
  Ticket, 
  ShieldCheck, 
  Video, 
  CalendarCheck, 
  FileText, 
  Activity, 
  Sparkles, 
  Star, 
  Crown, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Zap, 
  Clock, 
  Brain,
  Sprout,
  Pill,
  MessageCircle,
  HelpCircle,
  Flame,
  Scale,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { LegalInfoModal } from '../components/LegalInfoModal';
import { INSTITUTIONAL_INFO } from '../data/legalAndPrivacy';
import { motion, AnimatePresence } from 'motion/react';

// Custom Pix Icon to match the print
const PixIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.864 3.738L2.53 8.072c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L9.424 3.738c-.707-.707-1.853-.707-2.56 0zm10.272 0l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56l-4.334-4.334c-.707-.707-1.853-.707-2.56 0zM12 14.56l-4.334 4.334c-.707.707-.707 1.853 0 2.56l4.334 4.334c.707.707 1.853.707 2.56 0l4.334-4.334c.707-.707.707-1.853 0-2.56L12 14.56z" />
  </svg>
);

export function PremiumCheckoutScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, setPagamentoPremium, incrementBonus, addMessage } = useStore();
  const { coupons, useCoupon } = useAdminStore();
  const [step, setStep] = useState<'discount' | 'checkout'>('discount');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>('pix');
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<{ id: string, qr_code: string, qr_code_base64: string } | null>(null);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const basePrice = 249.90;
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
    if (!couponCode.trim()) return;

    const currentUserId = auth.currentUser?.uid;
    const currentUserEmail = auth.currentUser?.email;
    const localPatientId = localStorage.getItem('patient_id');
    const localUserId = localStorage.getItem('mecura_user_id');
    const identifiers = [currentUserId, currentUserEmail, localPatientId, localUserId].filter(Boolean) as string[];

    const searchCode = couponCode.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === searchCode && c.active);
    
    if (coupon) {
      if (coupon.ownerId && currentUserId && coupon.ownerId === currentUserId) {
        setCouponError('Você não pode usar seu próprio cupom de indicação.');
        return;
      }
      
      // Check quantity limit across all users
      if (coupon.quantity && coupon.quantity > 0) {
        const currentCount = coupon.usedCount || 0;
        if (currentCount >= coupon.quantity) {
          setCouponError('Este cupom atingiu o limite máximo de utilizações.');
          return;
        }
      }
      
      // Check if this specific user already used it
      if (coupon.usedBy && identifiers.some(id => coupon.usedBy!.includes(id))) {
        setCouponError('Você já utilizou este cupom anteriormente. Cada cupom é válido apenas uma vez por cliente.');
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

    if (paymentMethod === 'pix') {
      try {
        const response = await fetch('/api/create-pix-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Consulta Premium Mecura',
            price: finalPrice,
            email: auth.currentUser?.email || 'paciente@mecura.com',
            firstName: userName || 'Paciente',
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.qr_code && data.qr_code_base64) {
            setPixData({
              id: data.id,
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
            title: 'Acompanhamento Premium - Mecura',
            price: finalPrice,
            installments: 5,
            payerEmail: auth.currentUser?.email || 'paciente@mecura.com',
            payerName: userName || 'Paciente',
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.init_point) {
            setCardUrl(data.init_point);
            setIsLoading(false);

            try {
              window.open(data.init_point, '_blank');
            } catch (e) {
              console.log("Popup contido pelo navegador, botão direto disponível.");
            }
            return;
          }
        }
        setIsLoading(false);
        alert("Não foi possível gerar a página de pagamento do Mercado Pago. Por favor, tente novamente ou pague via Pix.");
      } catch (err) {
        console.error("Erro ao conectar cartão Mercado Pago: ", err);
        setIsLoading(false);
        alert("Erro de conexão ao abrir o Mercado Pago. Verifique sua internet e tente novamente.");
      }
      return;
    }

    setIsLoading(false);
  };

  const handleSuccess = () => {
    setIsLoading(false);
    setSuccessToast("Acesso VIP Premium liberado com sucesso! Redirecionando...");
    setPagamentoPremium(true);

    // Consume coupon for this user
    if (appliedCoupon) {
      try {
        const uid = auth.currentUser?.uid || localStorage.getItem('patient_id') || 'guest_' + Date.now();
        const uemail = auth.currentUser?.email || undefined;
        useCoupon(appliedCoupon.id, uid, uemail);
      } catch (e) {
        console.error("Erro ao registrar uso do cupom:", e);
      }
    }

    addMessage({
      sender: 'doctor',
      type: "payment_success" as any,
      text: 'Pagamento da Consulta Premium (R$ 249,90) aprovado com sucesso!'
    });
    setTimeout(() => {
      navigate('/chat');
    }, 1200);
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
                await addDoc(collection(db, 'payments'), {
                  mpId: pixData.id,
                  type: 'Consulta Premium',
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
          onClick={() => {
            if (step === 'checkout') {
              setStep('discount');
            } else if (location.state?.fromHighlights || sessionStorage.getItem('mecura_return_to_highlights') === 'true') {
              sessionStorage.removeItem('mecura_return_to_highlights');
              navigate('/dashboard', { state: { fromHighlights: true }, replace: true });
            } else {
              navigate(-1);
            }
          }}
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
        ) : cardUrl ? (
          <div className="flex flex-col items-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)] bg-[#A6FF00]/10 border border-[#A6FF00]/20">
               <CreditCard className="w-10 h-10 text-[#A6FF00]" />
            </div>

            <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">Checkout Mercado Pago</h2>
            <p className="text-mecura-silver text-center text-sm mb-6 max-w-[340px] font-light">
              Clique no botão abaixo para abrir a página de pagamento seguro do Mercado Pago.
            </p>

            {/* Link Direto Imune a Bloqueadores de Pop-up Mobile */}
            <a
              href={cardUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#A6FF00] via-[#C9FF5C] to-[#86DE00] text-black font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(166,255,0,0.35)] hover:shadow-[0_0_35px_rgba(166,255,0,0.5)] transition-all mb-4"
            >
              <CreditCard className="w-5 h-5 text-black" />
              <span>Ir para Pagamento Mercado Pago</span>
              <ExternalLink className="w-4 h-4 text-black shrink-0" />
            </a>

            <div className="w-full bg-[#1A1A24] rounded-3xl p-5 border border-[#A6FF00]/30 mb-4 shadow-xl text-left">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#A6FF00] shrink-0" />
                <span className="text-white font-bold text-sm">Ambiente 100% Criptografado</span>
              </div>
              <p className="text-mecura-silver text-xs leading-relaxed mb-3">
                Pague com Visa, Mastercard, Elo, Hipercard ou American Express em até 5x com proteção integral do Mercado Pago.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-200/90 leading-relaxed">
                <strong className="text-amber-400 block mb-0.5">⚠️ Regra de Segurança do Mercado Pago:</strong>
                O Mercado Pago proíbe compras onde o titular do cartão coincide com a conta recebedora (autofinanciamento). Caso esteja testando com seu próprio cartão, utilize uma aba anônima e outro CPF/cartão, ou libere o acesso diretamente pelo botão abaixo.
              </div>
            </div>

            <div className="flex items-center gap-3 py-3 bg-[#A6FF00]/5 px-5 rounded-full border border-[#A6FF00]/10">
              <div className="w-2.5 h-2.5 bg-[#A6FF00] rounded-full animate-pulse shadow-[0_0_8px_#A6FF00]" />
              <span className="text-[#A6FF00] text-xs font-bold tracking-tight uppercase">Aguardando pagamento...</span>
            </div>

            <button 
              onClick={() => setCardUrl(null)}
              className="mt-6 text-mecura-silver text-sm font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
            >
              Escolher outro pagamento
            </button>
          </div>
        ) : step === 'discount' ? (
          <div className="flex flex-col items-center text-center pt-2">
            {/* VIP Badge */}
            <div className="inline-flex items-center gap-2 bg-[#A6FF00]/15 border border-[#A6FF00]/40 px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(166,255,0,0.25)] mb-3">
              <Crown className="w-4 h-4 text-[#A6FF00]" />
              <span className="text-[11px] font-extrabold text-[#A6FF00] uppercase tracking-wider">Acesso VIP • Protocolo Completo</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 leading-tight tracking-tight">
              {userName ? `${userName}, conquiste` : 'Conquiste'} Sua Saúde e Respaldo Jurídico Definitivo
            </h2>
            <p className="text-mecura-silver text-xs sm:text-sm mb-5 leading-relaxed max-w-[340px]">
              Sem burocracia, sem receio. Telemedicina humanizada individual, laudos periciais para Habeas Corpus e 90 dias de acompanhamento contínuo.
            </p>

            {/* 1. Urgência / Plantão Ativo */}
            <div className="w-full bg-[#161622] border border-[#A6FF00]/30 rounded-2xl p-3 mb-5 flex items-center justify-between shadow-[0_0_15px_rgba(166,255,0,0.1)] text-left">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A6FF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A6FF00]"></span>
                </span>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Plantão de Telemedicina Ativo</p>
                  <p className="text-[10px] text-[#8A8A9E]">Apenas 4 vagas com especialistas esta semana</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold bg-[#A6FF00]/15 text-[#A6FF00] border border-[#A6FF00]/30 px-2 py-1 rounded-full uppercase tracking-wider">
                Vagas Limitadas
              </span>
            </div>

            {/* 2. Sequência Matadora: O Método em 3 Etapas Conectadas */}
            <div className="w-full bg-[#12121A] border border-white/10 rounded-[26px] p-4 sm:p-5 mb-5 text-left relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#A6FF00]" />
                  A Jornada Para Sua Liberdade & Alívio
                </span>
                <span className="text-[10px] text-[#A6FF00] font-extrabold bg-[#A6FF00]/10 px-2 py-0.5 rounded-full border border-[#A6FF00]/25">
                  3 PASSOS SIMPLES
                </span>
              </div>

              <div className="space-y-4 relative">
                {/* Linha vertical conectora */}
                <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#A6FF00] via-[#A6FF00]/40 to-[#A6FF00]/10" />

                {/* Passo 1 */}
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-9 h-9 rounded-full bg-[#1A1A28] border-2 border-[#A6FF00] flex items-center justify-center shrink-0 font-black text-xs text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.3)]">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-bold text-white">Consulta Individual em Vídeo HD</h4>
                      <span className="text-[9px] bg-[#A6FF00]/15 text-[#A6FF00] px-1.5 py-0.5 rounded font-mono font-bold">40-50 min</span>
                    </div>
                    <p className="text-[11px] text-[#8A8A9E] leading-relaxed mt-0.5">
                      Conversa acolhedora e 100% sigilosa com médico especialista em Cannabis. Avaliação minuciosa da sua saúde, dosagem ideal e alívio para sua queixa clínica.
                    </p>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-9 h-9 rounded-full bg-[#1A1A28] border-2 border-[#A6FF00] flex items-center justify-center shrink-0 font-black text-xs text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.3)]">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-bold text-white">Receita ICP-Brasil & Laudos Periciais</h4>
                      <span className="text-[9px] bg-[#A6FF00]/15 text-[#A6FF00] px-1.5 py-0.5 rounded font-mono font-bold">Validade Nacional</span>
                    </div>
                    <p className="text-[11px] text-[#8A8A9E] leading-relaxed mt-0.5">
                      Emissão imediata de prescrição digital com QR Code e laudos com CID e histórico de refratariedade para seu advogado dar entrada no Habeas Corpus ou importação legal.
                    </p>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-9 h-9 rounded-full bg-[#1A1A28] border-2 border-[#A6FF00] flex items-center justify-center shrink-0 font-black text-xs text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.3)]">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-bold text-white">Retorno Incluso & 90 Dias de Suporte</h4>
                      <span className="text-[9px] bg-[#A6FF00]/15 text-[#A6FF00] px-1.5 py-0.5 rounded font-mono font-bold">Incluso no Plano</span>
                    </div>
                    <p className="text-[11px] text-[#8A8A9E] leading-relaxed mt-0.5">
                      Você nunca fica desamparado: reavaliação médica garantida para titulação da dose dos canabinoides e canal prioritário para sanar dúvidas durante o tratamento.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Comparativo de Transformação */}
            <div className="w-full bg-gradient-to-b from-[#14141E] to-[#0E0E16] border border-white/5 rounded-2xl p-4 mb-5 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#A6FF00]" />
                A Diferença do Respaldo Especializado
              </h4>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-start gap-2.5 bg-red-950/20 border border-red-500/20 rounded-xl p-2.5 text-red-300">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-200 block">Sem o acompanhamento pericial:</span>
                    Insegurança constante com cultivo, dosagens erradas sem critério clínico e laudos frágeis que juízes indeferem.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-[#A6FF00]/10 border border-[#A6FF00]/30 rounded-xl p-2.5 text-[#C9FF5C]">
                  <CheckCircle2 className="w-4 h-4 text-[#A6FF00] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Com o Protocolo Mecura VIP:</span>
                    Salvo-conduto jurídico estruturado por peritos com CRM ativo, receita digital válida em todo o Brasil e tranquilidade para sua família.
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Comprehensive Inclusions List (8 Benefícios) */}
            <div className="w-full text-left space-y-3 mb-5">
              <div className="flex items-center justify-between px-1 mb-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A6FF00]" />
                  Tudo o Que Está 100% Incluso:
                </h3>
                <span className="text-[10px] text-[#A6FF00] font-bold bg-[#A6FF00]/10 px-2 py-0.5 rounded-full border border-[#A6FF00]/30">8 BENEFÍCIOS VIP</span>
              </div>

              {/* Item 1: Videochamada */}
              <div className="bg-[#12121A] border border-[#A6FF00]/25 rounded-2xl p-3.5 flex items-start gap-3.5 hover:border-[#A6FF00]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A26] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                  <Video className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-white">Consulta Médica em Videochamada</h4>
                    <span className="text-[9px] font-bold text-[#A6FF00] bg-[#A6FF00]/10 px-1.5 py-0.5 rounded">Vídeo HD</span>
                  </div>
                  <p className="text-xs text-[#8A8A9E] leading-relaxed">
                    Atendimento humanizado e individual por videochamada com médico prescritor especialista em Cannabis medicinal.
                  </p>
                </div>
              </div>

              {/* Item 2: Acompanhamento de 90 dias com retorno */}
              <div className="bg-[#12121A] border border-[#A6FF00]/25 rounded-2xl p-3.5 flex items-start gap-3.5 hover:border-[#A6FF00]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A26] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-white">Acompanhamento de 90 Dias</h4>
                    <span className="text-[9px] font-bold text-[#A6FF00] bg-[#A6FF00]/10 px-1.5 py-0.5 rounded">Retorno Incluso</span>
                  </div>
                  <p className="text-xs text-[#8A8A9E] leading-relaxed">
                    Retorno médico já incluso no plano para ajuste fino de dosagem, titulação dos canabinoides e monitoramento da sua resposta clínica.
                  </p>
                </div>
              </div>

              {/* Item 3: Laudo Inicial para HC */}
              <div className="bg-[#12121A] border border-[#A6FF00]/25 rounded-2xl p-3.5 flex items-start gap-3.5 hover:border-[#A6FF00]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A26] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-white">Laudo Inicial Detalhado (Para HC)</h4>
                    <span className="text-[9px] font-bold text-[#A6FF00] bg-[#A6FF00]/10 px-1.5 py-0.5 rounded">Essencial p/ Juiz</span>
                  </div>
                  <p className="text-xs text-[#8A8A9E] leading-relaxed">
                    Histórico clínico pormenorizado, diagnóstico CID, comprovação de refratariedade e indicação terapêutica para abertura de Habeas Corpus.
                  </p>
                </div>
              </div>

              {/* Item 4: Laudo Evolutivo para HC */}
              <div className="bg-[#12121A] border border-[#A6FF00]/25 rounded-2xl p-3.5 flex items-start gap-3.5 hover:border-[#A6FF00]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A26] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-white">Laudo Evolutivo Pericial</h4>
                    <span className="text-[9px] font-bold text-[#A6FF00] bg-[#A6FF00]/10 px-1.5 py-0.5 rounded">Comprovação HC</span>
                  </div>
                  <p className="text-xs text-[#8A8A9E] leading-relaxed">
                    Relatório médico atestando a eficácia e evolução terapêutica positiva, elemento essencial exigido pela jurisprudência no salvo-conduto.
                  </p>
                </div>
              </div>

              {/* Item 5: Laudo Psicomotor */}
              <div className="bg-[#12121A] border border-[#A6FF00]/25 rounded-2xl p-3.5 flex items-start gap-3.5 hover:border-[#A6FF00]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A26] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-white">Laudo Psicomotor e Avaliação Clínica</h4>
                    <span className="text-[9px] font-bold text-[#A6FF00] bg-[#A6FF00]/10 px-1.5 py-0.5 rounded">Aptidão & Foco</span>
                  </div>
                  <p className="text-xs text-[#8A8A9E] leading-relaxed">
                    Avaliação médica que atesta sua estabilidade física, cognitiva e integridade psicomotora sob o uso seguro do tratamento.
                  </p>
                </div>
              </div>

              {/* Item 6: Laudo Agronômico Pericial */}
              <div className="bg-[#12121A] border border-[#A6FF00]/25 rounded-2xl p-3.5 flex items-start gap-3.5 hover:border-[#A6FF00]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A26] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                  <Sprout className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-white">Laudo Agronômico Pericial (Salvo-Conduto / HC)</h4>
                    <span className="text-[9px] font-bold text-[#A6FF00] bg-[#A6FF00]/10 px-1.5 py-0.5 rounded">Cultivo & HC</span>
                  </div>
                  <p className="text-xs text-[#8A8A9E] leading-relaxed">
                    Dimensionamento agronômico exato de plantas, ciclos e dosimetria de biomassa com assinatura de Engenheiro Agrônomo habilitado no CREA.
                  </p>
                </div>
              </div>

              {/* Item 6: Receita Digital ICP-Brasil */}
              <div className="bg-[#12121A] border border-[#A6FF00]/25 rounded-2xl p-3.5 flex items-start gap-3.5 hover:border-[#A6FF00]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A26] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-white">Receituário Digital ICP-Brasil</h4>
                    <span className="text-[9px] font-bold text-[#A6FF00] bg-[#A6FF00]/10 px-1.5 py-0.5 rounded">Validade Nacional</span>
                  </div>
                  <p className="text-xs text-[#8A8A9E] leading-relaxed">
                    Prescrição oficial assinada digitalmente com QR Code e validade jurídica em todas as farmácias e associações do Brasil.
                  </p>
                </div>
              </div>

              {/* Item 7: Farmácia GreenBudz */}
              <div className="bg-[#12121A] border border-[#A6FF00]/25 rounded-2xl p-3.5 flex items-start gap-3.5 hover:border-[#A6FF00]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A26] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                  <Pill className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-white">Acesso com Desconto na GreenBudz</h4>
                    <span className="text-[9px] font-bold text-[#A6FF00] bg-[#A6FF00]/10 px-1.5 py-0.5 rounded">Preços Exclusivos</span>
                  </div>
                  <p className="text-xs text-[#8A8A9E] leading-relaxed">
                    Descontos especiais e prioridade no envio dos medicamentos e suplementos prescritos na farmácia parceira oficial.
                  </p>
                </div>
              </div>

              {/* Item 8: Suporte VIP */}
              <div className="bg-[#12121A] border border-[#A6FF00]/25 rounded-2xl p-3.5 flex items-start gap-3.5 hover:border-[#A6FF00]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A26] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 text-[#A6FF00] shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-white">Canal Concierge & Suporte VIP</h4>
                    <span className="text-[9px] font-bold text-[#A6FF00] bg-[#A6FF00]/10 px-1.5 py-0.5 rounded">Direto no App</span>
                  </div>
                  <p className="text-xs text-[#8A8A9E] leading-relaxed">
                    Apoio rápido e prioritário com nossa equipe para dúvidas sobre receitas, posologia e encaminhamentos jurídicos.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Depoimento Real de Paciente (Prova Social) */}
            <div className="w-full bg-[#12121A] border border-[#A6FF00]/20 rounded-2xl p-4 mb-5 text-left relative overflow-hidden shadow-md">
              <div className="flex items-center gap-1 mb-2 text-[#A6FF00]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#A6FF00]" />
                ))}
                <span className="text-[10px] font-bold text-white ml-2">4.9 de 5 • +1.200 Pacientes Atendidos</span>
              </div>
              <p className="text-[11px] text-[#A6A6B8] italic leading-relaxed mb-2.5">
                "Estava receoso de falar abertamente sobre Cannabis, mas o acolhimento médico foi nota 10. Recebi a receita e os laudos no mesmo dia. Meu advogado elogiou a riqueza técnica para o HC de cultivo. O retorno em 90 dias me deu total segurança."
              </p>
              <div className="flex items-center justify-between text-[10px] text-[#8A8A9E] border-t border-white/5 pt-2">
                <span className="font-bold text-white">Lucas R. • Paciente Verificado</span>
                <span className="text-[#A6FF00] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Salvo-Conduto HC Deferido
                </span>
              </div>
            </div>

            {/* 6. POR ÚLTIMO: A Oferta Especial e o Valor (Grand Finale de Conversão) */}
            <div className="w-full bg-gradient-to-br from-[#1A1A26] to-[#12121A] border-2 border-[#A6FF00]/50 rounded-[28px] p-5 mb-5 relative overflow-hidden shadow-[0_8px_35px_rgba(166,255,0,0.22)] text-left">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#A6FF00]/20 blur-[55px] pointer-events-none rounded-full" />

              {/* Ancoragem Visual de Serviços Separados */}
              <div className="mb-4 pb-3 border-b border-white/10">
                <span className="text-[10px] font-bold text-mecura-silver uppercase tracking-widest block mb-2">
                  Se você contratasse cada etapa separadamente:
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-[#8A8A9E]">
                    <span>• Consulta Individual em Vídeo HD</span>
                    <span className="text-white font-mono">R$ 350,00</span>
                  </div>
                  <div className="flex justify-between text-[#8A8A9E]">
                    <span>• Retorno Médico em 90 dias incluso</span>
                    <span className="text-white font-mono">R$ 249,00</span>
                  </div>
                  <div className="flex justify-between text-[#8A8A9E]">
                    <span>• Laudos Periciais p/ Habeas Corpus (Inicial + Evolutivo)</span>
                    <span className="text-white font-mono">R$ 450,00</span>
                  </div>
                  <div className="flex justify-between text-[#8A8A9E]">
                    <span>• Laudo Psicomotor + Laudo Agronômico + Receita Digital</span>
                    <span className="text-white font-mono">R$ 250,00</span>
                  </div>
                  <div className="flex justify-between text-[#8A8A9E]">
                    <span>• Suporte Concierge & Descontos Farmácia</span>
                    <span className="text-white font-mono">R$ 100,00</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1.5 border-t border-white/5">
                    <span>Valor Total dos Serviços Separados:</span>
                    <span className="line-through text-[#8A8A9E] font-mono">R$ 1.400,00</span>
                  </div>
                </div>
              </div>

              {/* O Preço Final Especial */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#A6FF00] text-xs uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Condição Exclusiva de Lançamento
                </span>
                <span className="bg-[#A6FF00] text-black text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wide uppercase shadow-sm">
                  58% OFF • HOJE
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-mecura-silver text-base line-through decoration-mecura-silver/60">De R$ 598,00</span>
                <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#A6FF00] via-[#C9FF5C] to-white tracking-tighter drop-shadow-[0_0_15px_rgba(166,255,0,0.35)]">
                  R$ 249,90
                </div>
              </div>

              <p className="text-[#A6FF00] text-xs font-semibold flex items-center gap-1.5 mt-2">
                <Zap className="w-3.5 h-3.5 fill-[#A6FF00] shrink-0" />
                <span>Economia de R$ 348 • Em até 5x no cartão ou Pix imediato</span>
              </p>
            </div>

            {/* 7. Trust and Medical Ethics Box */}
            <div className="w-full bg-[#12121A] border border-white/5 rounded-2xl p-4 mb-4 text-xs text-mecura-silver space-y-2 text-left">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Award className="w-4 h-4 text-[#A6FF00]" />
                <span>Segurança Médica, Ética e Jurídica Garantida</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#8A8A9E]">
                Atendimento por médicos devidamente registrados no CFM, documentos emitidos sob as resoluções da telemedicina legal e sigilo total conforme a LGPD.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col pt-2">
            {/* VIP Plan Summary Header */}
            <div className="bg-gradient-to-br from-[#1A1A26] to-[#12121A] border-2 border-[#A6FF00]/40 rounded-[26px] p-5 mb-6 text-left shadow-[0_8px_30px_rgba(166,255,0,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6FF00]/15 blur-[40px] pointer-events-none rounded-full" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#A6FF00]" />
                  <span className="text-white font-bold text-base">Mecura Premium VIP</span>
                </div>
                <span className="text-[10px] bg-[#A6FF00]/20 text-[#A6FF00] font-extrabold px-2.5 py-0.5 rounded-full border border-[#A6FF00]/40">
                  PLANO COMPLETO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-mecura-silver mb-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A6FF00] shrink-0" />
                  <span>Vídeo Chamada HD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A6FF00] shrink-0" />
                  <span>90 Dias com Retorno</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A6FF00] shrink-0" />
                  <span>Laudos Inicial & Evolutivo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A6FF00] shrink-0" />
                  <span>Laudo Psicomotor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A6FF00] shrink-0" />
                  <span>Laudo Agronômico</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-mecura-silver block">Total a pagar:</span>
                  <span className="text-[10px] text-[#A6FF00]">Em até 5x ou Pix imediato</span>
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#A6FF00] to-white">
                  R$ {finalPrice.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>

            {/* Coupon Input */}
            {!appliedCoupon && (
              <div className="bg-[#1A1A24] rounded-2xl p-3.5 mb-5 border border-[#2A2A3A]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Tem um cupom de desconto?"
                    className="flex-1 bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#A6FF00]/50 uppercase"
                  />
                  <Button onClick={handleApplyCoupon} disabled={!couponCode} className="px-5 text-xs font-bold">
                    Aplicar
                  </Button>
                </div>
                {couponError && <p className="text-red-400 text-xs mt-2 px-1">{couponError}</p>}
              </div>
            )}

            {appliedCoupon && (
              <div className="bg-[#A6FF00]/10 border border-[#A6FF00]/30 rounded-2xl p-3 mb-5 flex items-center justify-between text-xs text-[#A6FF00]">
                <span>Cupom <strong>{appliedCoupon.code}</strong> aplicado (-{appliedCoupon.discountType === 'fixed' ? `R$ ${appliedCoupon.discount}` : `${appliedCoupon.discount}%`})</span>
                <span className="font-bold">Desconto ativo</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="bg-[#1A1A24] rounded-3xl p-5 mb-6 border border-[#A6FF00]/30 shadow-lg">
              <h3 className="text-base font-bold text-center mb-4 text-mecura-pearl">
                Escolha como deseja realizar o pagamento:
              </h3>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-[#0A0A0F] border-2 transition-all ${
                    paymentMethod === 'pix' ? 'border-[#A6FF00] shadow-[0_0_20px_rgba(166,255,0,0.25)]' : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1A1A26] flex items-center justify-center shrink-0">
                    <PixIcon className={`w-7 h-7 ${paymentMethod === 'pix' ? 'text-[#A6FF00]' : 'text-mecura-silver'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">Pix</span>
                      <span className="text-[9px] font-extrabold bg-[#A6FF00]/20 text-[#A6FF00] px-2 py-0.5 rounded-full border border-[#A6FF00]/40 uppercase">Liberação Imediata</span>
                    </div>
                    <span className="text-xs text-mecura-silver">Aprovação instantânea no sistema</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-[#0A0A0F] border-2 transition-all ${
                    paymentMethod === 'card' ? 'border-[#A6FF00] shadow-[0_0_20px_rgba(166,255,0,0.25)]' : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1A1A26] flex items-center justify-center shrink-0">
                    <CreditCard className={`w-7 h-7 ${paymentMethod === 'card' ? 'text-[#A6FF00]' : 'text-mecura-silver'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">Cartão de Crédito</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">Até 5x</span>
                    </div>
                    <span className="text-xs text-[#A6FF00]">Checkout Seguro Mercado Pago</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-mecura-silver text-xs mb-6">
              <Lock className="w-3.5 h-3.5 text-[#A6FF00]" />
              <span>Ambiente seguro e criptografado • Garantia de sigilo médico</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent z-20 flex flex-col gap-2">
        
        {pixData ? (
          <div className="flex flex-col gap-3 w-full">
            <Button 
              className="w-full h-12 bg-[#1A1A26] border border-[#A6FF00]/50 text-[#A6FF00] hover:bg-[#A6FF00]/10 font-bold"
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
              className="w-full h-14 text-base font-black bg-gradient-to-r from-[#A6FF00] via-[#C9FF5C] to-[#86DE00] text-black shadow-[0_0_30px_rgba(166,255,0,0.3)] hover:shadow-[0_0_40px_rgba(166,255,0,0.5)]"
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
              Já Paguei (Liberar Acesso VIP)
            </Button>
          </div>
        ) : cardUrl ? (
          <div className="flex flex-col gap-3 w-full">
            <a 
              href={cardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-13 bg-[#1A1A26] border border-[#A6FF00]/50 text-[#A6FF00] hover:bg-[#A6FF00]/10 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all"
            >
              <CreditCard className="w-4 h-4 text-[#A6FF00]" />
              <span>Abrir Checkout Seguro Mercado Pago</span>
              <ExternalLink className="w-4 h-4 text-[#A6FF00]" />
            </a>
            <Button 
              className="w-full h-14 text-base font-black bg-gradient-to-r from-[#A6FF00] via-[#C9FF5C] to-[#86DE00] text-black shadow-[0_0_30px_rgba(166,255,0,0.3)] hover:shadow-[0_0_40px_rgba(166,255,0,0.5)] flex items-center justify-center gap-2"
              onClick={() => {
                handleSuccess();
              }}
            >
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span>Já Paguei no Cartão (Liberar Acesso VIP)</span>
            </Button>
            <button
              onClick={() => {
                setCardUrl(null);
                setIsLoading(false);
              }}
              className="text-mecura-silver text-xs underline text-center mt-1"
            >
              Escolher outra forma de pagamento
            </button>
          </div>
        ) : step === 'discount' ? (
          <button 
            onClick={() => setStep('checkout')}
            className="w-full py-4 px-6 rounded-2xl font-black tracking-wide text-black bg-gradient-to-r from-[#A6FF00] via-[#C9FF5C] to-[#86DE00] shadow-[0_0_35px_rgba(166,255,0,0.45)] hover:shadow-[0_0_50px_rgba(166,255,0,0.65)] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-2 text-[15px] sm:text-[16px] font-black uppercase tracking-wider">
              <Crown className="w-5 h-5 fill-black" />
              <span>Garantir Meu Acesso VIP Premium</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <span className="text-[11px] text-black/85 font-bold">
              Vídeo Chamada + 90 Dias com Retorno + Laudos HC • R$ 249,90
            </span>
          </button>
        ) : (
          <button 
            className="w-full py-4 px-6 rounded-2xl font-black tracking-wide text-black bg-gradient-to-r from-[#A6FF00] via-[#C9FF5C] to-[#86DE00] shadow-[0_0_35px_rgba(166,255,0,0.45)] hover:shadow-[0_0_50px_rgba(166,255,0,0.65)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            onClick={handlePayment}
            disabled={isLoading || !paymentMethod}
          >
            {isLoading ? (
              <span className="text-sm font-bold">Processando pagamento...</span>
            ) : paymentMethod === 'card' ? (
              <>
                <CreditCard className="w-5 h-5 fill-black" />
                <span className="text-[14px] sm:text-[15px] font-black uppercase tracking-wider">
                  Pagar no Cartão em até 5x (R$ {finalPrice.toFixed(2).replace('.', ',')})
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-black" />
                <span className="text-[14px] sm:text-[15px] font-black uppercase tracking-wider">
                  Gerar Pix e Iniciar Atendimento (R$ {finalPrice.toFixed(2).replace('.', ',')})
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        )}

        <button 
          onClick={() => navigate('/dashboard')}
          className="text-[#8A8A9E] text-[14px] font-medium hover:text-white transition-colors underline decoration-white/20 underline-offset-4 py-2 text-center"
        >
          Pular por enquanto e ir para o painel
        </button>

        <button
          type="button"
          onClick={() => setShowLegalModal(true)}
          className="text-[10px] text-[#8A8A9E]/60 hover:text-[#8A8A9E] transition-colors mt-0.5 font-mono text-center cursor-pointer"
        >
          {INSTITUTIONAL_INFO.companyName} • CNPJ {INSTITUTIONAL_INFO.cnpj} • Termos & LGPD
        </button>
      </div>

      <LegalInfoModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />

      {/* Success Notification Modal / Overlay (evita window.alert) */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#12121A] border-2 border-[#A6FF00]/50 rounded-[32px] p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(166,255,0,0.25)] flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#A6FF00]/20 border border-[#A6FF00] flex items-center justify-center mb-4 text-[#A6FF00]">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Acesso VIP Confirmado!</h3>
              <p className="text-mecura-silver text-sm mb-4 leading-relaxed">
                {successToast}
              </p>
              <div className="w-6 h-6 border-2 border-[#A6FF00] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
