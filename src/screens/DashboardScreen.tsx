import { useNavigate, useLocation } from 'react-router-dom';
import {  useState, useEffect } from 'react';
import {  useStore } from '../store/useStore';
import {  auth } from '../firebase';
import {  motion } from 'motion/react';
import {  AdvisorChatWidget } from '../components/AdvisorChatWidget';
import {  ReferralModal } from '../components/ReferralModal';
import {  
  User, 
  ShoppingCart, 
  MessageCircle, 
  Stethoscope, 
  Droplets, 
  History, 
  Gift, 
  FileText,
  ShieldCheck,
  Package,
  Bell,
  ChevronRight,
  ChevronLeft,
  Flame,
  LogOut,
  Rocket,
  CheckCircle2,
  ChevronDown,
  Clock,
  Calendar,
  Leaf,
  Store,
  Sprout,
  GraduationCap,
  Sparkles,
  Globe,
  Star,
  Users,
  ArrowUpRight,
  X
 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
};

export function DashboardScreen() {

  const navigate = useNavigate();
  const location = useLocation();
  const [videoFailed, setVideoFailed] = useState(false);
  const { userName, setSelectedOffer, scheduledConsultation, consultationStatus, pagamento_consulta, pagamento_premium, isConsultationFinished, resetConsultation, inQueue, consultationActive, setPagamentoConsulta, setPagamentoPremium, joinQueue } = useStore();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const status = params.get('status');
    const collectionStatus = params.get('collection_status');
    
    if (paymentStatus === 'success' || status === 'approved' || collectionStatus === 'approved') {
      const isBasic = localStorage.getItem('last_offer') !== 'premium';
      
      const processSuccess = async () => {
        if (isBasic) {
          if (!pagamento_consulta) {
            setPagamentoConsulta(true);
          }
          await joinQueue();
        } else {
          setPagamentoPremium(true);
          setPagamentoConsulta(true);
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
    }
  }, [pagamento_consulta, setPagamentoConsulta, setPagamentoPremium, joinQueue, navigate]);

  const [showPremiumDetails, setShowPremiumDetails] = useState(false);
  const [activeSchedulers, setActiveSchedulers] = useState(Math.floor(Math.random() * (22 - 8 + 1)) + 8);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [promoModal, setPromoModal] = useState<'hc' | 'consultoria' | 'sementes' | null>(null);
  const [showAllHighlightsModal, setShowAllHighlightsModal] = useState(false);
  const [openedFromHighlights, setOpenedFromHighlights] = useState(false);

  useEffect(() => {
    const shouldReturn = 
      sessionStorage.getItem('mecura_return_to_highlights') === 'true' ||
      (location.state as any)?.fromHighlights === true;

    if (shouldReturn) {
      sessionStorage.removeItem('mecura_return_to_highlights');
      setShowAllHighlightsModal(true);
    }
  }, [location]);

  const openHighlightRoute = (path: string) => {
    sessionStorage.setItem('mecura_return_to_highlights', 'true');
    setShowAllHighlightsModal(false);
    navigate(path, { state: { fromHighlights: true } });
  };

  const openPromoFromHighlights = (type: 'hc' | 'consultoria' | 'sementes') => {
    setOpenedFromHighlights(true);
    setShowAllHighlightsModal(false);
    setPromoModal(type);
  };

  const handleClosePromoModal = () => {
    setPromoModal(null);
    if (openedFromHighlights) {
      setOpenedFromHighlights(false);
      setShowAllHighlightsModal(true);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    const countInterval = setInterval(() => {
      setActiveSchedulers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return newValue >= 6 && newValue <= 28 ? newValue : prev;
      });
    }, 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(countInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] text-mecura-pearl relative pb-20 font-sans overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-6 pt-10 pb-6 z-30 sticky top-0 bg-[#0A0A0F]/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="relative group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-[16px] bg-[#12121A] border border-white/10 flex items-center justify-center shadow-sm relative z-10 group-hover:bg-[#1A1A24] transition-colors overflow-hidden">
              <User className="w-5 h-5 text-mecura-neon" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-mecura-neon rounded-full border-[2px] border-[#0A0A0F] flex items-center justify-center z-20">
              <Flame className="w-2.5 h-2.5 text-[#0A0A0F]" />
            </div>
          </motion.button>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#8A8A9E] font-medium">Bem-vindo(a) de volta,</span>
            <span className="text-[15px] font-bold text-white tracking-tight">{userName || 'Paciente'}</span>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            await auth.signOut();
            resetConsultation();
            navigate('/');
          }}
          className="w-10 h-10 rounded-full bg-[#12121A] border border-white/5 flex items-center justify-center text-[#8A8A9E] hover:text-white hover:bg-[#1A1A24] transition-colors"
        >
          <LogOut className="w-4 h-4 ml-0.5" />
        </motion.button>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 mt-6 space-y-8 z-10"
      >
        {/* Hero Section (Status Card) */}
        <section>
          {isConsultationFinished ? (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative border border-white/5 rounded-[36px] p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] group cursor-pointer bg-[#0A0A0F]"
              onClick={() => navigate('/chat')}
            >
              {/* Background Video */}
              <div className="absolute inset-0 z-0 bg-black">
                
                <img src="/dashboard-bg-poster.jpg" className="absolute inset-0 w-full h-full object-cover z-0" alt="" />
                {!videoFailed && (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    ref={(el) => {
                      if (el && !el.dataset.initialized) {
                        el.dataset.initialized = 'true';
                        const p = el.play();
                        if (p !== undefined) {
                          p.catch((e) => {
                            console.log('Autoplay blocked:', e);
                            setVideoFailed(true);
                          });
                        }
                      }
                    }}
                    src="/2131-ezgif.com-video-compressor.mp4"
                    className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/50 to-transparent z-20 pointer-events-none" />
              </div>
              
              <div className="relative z-10 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 bg-mecura-neon/10 border border-mecura-neon/20 px-3 py-1.5 rounded-full mb-6">
                  <div className="w-2 h-2 rounded-full bg-mecura-neon animate-pulse" />
                  <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-widest">PRESCRITA</span>
                </div>
                
                <h2 className="text-[28px] font-serif font-bold text-white mb-2 leading-[1.15] tracking-tight">
                  Sua receita<br/>está pronta!
                </h2>
                <p className="text-[13px] text-[#8A8A9E] mb-8 leading-relaxed max-w-[200px]">
                  Acesse seu laudo, orientações e prescrição médica digital.
                </p>
                
                <button className="flex items-center justify-center gap-2 text-[#0A0A0F] bg-mecura-neon px-6 py-3.5 rounded-full font-bold text-[13px] hover:shadow-[0_0_20px_rgba(166,255,0,0.2)] transition-all">
                  Ver Documentos <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              
            </motion.div>
          ) : inQueue ? (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative border border-white/5 rounded-[36px] p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] group cursor-pointer bg-[#0A0A0F]"
              onClick={() => navigate('/queue')}
            >
              {/* Background Video */}
              <div className="absolute inset-0 z-0 bg-black">
                
                <img src="/dashboard-bg-poster.jpg" className="absolute inset-0 w-full h-full object-cover z-0" alt="" />
                {!videoFailed && (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    ref={(el) => {
                      if (el && !el.dataset.initialized) {
                        el.dataset.initialized = 'true';
                        const p = el.play();
                        if (p !== undefined) {
                          p.catch((e) => {
                            console.log('Autoplay blocked:', e);
                            setVideoFailed(true);
                          });
                        }
                      }
                    }}
                    src="/2131-ezgif.com-video-compressor.mp4"
                    className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/50 to-transparent z-20 pointer-events-none" />
              </div>

              
              
              <div className="relative z-10 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 bg-[#FF8A00]/20 border border-[#FF8A00]/30 backdrop-blur-md px-3 py-1.5 rounded-full mb-6">
                  <div className="w-2 h-2 rounded-full bg-[#FF8A00] animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">FILA DE ESPERA</span>
                </div>
                
                <h2 className="text-[28px] font-serif font-bold text-white mb-2 leading-[1.15] tracking-tight">
                  Aguardando<br/>Atendimento
                </h2>
                <p className="text-[13px] text-white/80 mb-8 leading-relaxed max-w-[200px]">
                  O médico te chamará em instantes para iniciar a avaliação.
                </p>
                
                <button className="flex items-center justify-center gap-2 text-[#0A0A0F] bg-gradient-to-r from-[#FF8A00] to-[#FF9A26] px-6 py-3.5 rounded-full font-bold text-[13px] hover:shadow-[0_0_20px_rgba(255,138,0,0.2)] transition-all">
                  Acompanhar Fila <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              
            </motion.div>
          ) : pagamento_consulta || consultationActive ? (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative bg-gradient-to-br from-[#12121A] to-[#0D0D14] border border-white/5 rounded-[36px] p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] group cursor-pointer"
              onClick={() => navigate('/chat')}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-mecura-neon/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 bg-mecura-neon/10 border border-mecura-neon/20 px-3 py-1.5 rounded-full mb-6">
                  <div className="w-2 h-2 rounded-full bg-mecura-neon animate-pulse" />
                  <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-widest">EM ANDAMENTO</span>
                </div>
                
                <h2 className="text-[28px] font-serif font-bold text-white mb-2 leading-[1.15] tracking-tight">
                  O médico está<br/>aguardando
                </h2>
                <p className="text-[13px] text-[#8A8A9E] mb-8 leading-relaxed max-w-[200px]">
                  Sua consulta está ativa e o médico está na sala de chat.
                </p>
                
                <button className="flex items-center justify-center gap-2 text-[#0A0A0F] bg-mecura-neon px-6 py-3.5 rounded-full font-bold text-[13px] hover:shadow-[0_0_20px_rgba(166,255,0,0.2)] transition-all">
                  Retomar Consulta <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              
            </motion.div>
          ) : (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative border border-white/5 rounded-[36px] p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] group cursor-pointer bg-[#0A0A0F]"
              onClick={() => {
                setSelectedOffer('basic');
                navigate('/checkout');
              }}
            >
              {/* Background Video */}
              <div className="absolute inset-0 z-0 bg-black">
                
                <img src="/dashboard-bg-poster.jpg" className="absolute inset-0 w-full h-full object-cover z-0" alt="" />
                {!videoFailed && (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    ref={(el) => {
                      if (el && !el.dataset.initialized) {
                        el.dataset.initialized = 'true';
                        const p = el.play();
                        if (p !== undefined) {
                          p.catch((e) => {
                            console.log('Autoplay blocked:', e);
                            setVideoFailed(true);
                          });
                        }
                      }
                    }}
                    src="/2131-ezgif.com-video-compressor.mp4"
                    className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/50 to-transparent z-20 pointer-events-none" />
              </div>

              
              <div className="relative z-10 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-6">
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">PENDENTE</span>
                </div>
                
                <h2 className="text-[28px] font-serif font-bold text-white mb-2 leading-[1.15] tracking-tight">
                  Inicie sua<br/>avaliação
                </h2>
                <p className="text-[13px] text-[#8A8A9E] mb-8 leading-relaxed max-w-[200px]">
                  Finalize o pagamento para iniciar sua consulta médica.
                </p>
                
                <button className="flex items-center justify-center gap-2 text-[#0A0A0F] bg-white px-6 py-3.5 rounded-full font-bold text-[13px] hover:bg-gray-200 transition-all">
                  Finalizar Pagamento <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              
            </motion.div>
          )}
        </section>

        {/* Categories Grid (Quick Services) */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[18px] font-serif font-bold text-white tracking-tight">Serviços Rápidos</h3>
          </div>
          
          <div className={`grid gap-3 ${!pagamento_premium ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {/* Chat / Consultation */}
            <button 
              onClick={() => navigate(consultationActive || isConsultationFinished ? '/chat' : inQueue ? '/queue' : '/checkout')} 
              className="flex flex-col items-center gap-2.5 group outline-none"
            >
              <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                <MessageCircle className="w-6 h-6 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors relative z-10" />
                <div className="absolute inset-0 bg-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Consulta</span>
            </button>

            {/* Pharmacy */}
            <button 
              onClick={() => navigate('/pharmacy')} 
              className="flex flex-col items-center gap-2.5 group outline-none"
            >
              <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                <ShoppingCart className="w-6 h-6 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors relative z-10" />
                <div className="absolute inset-0 bg-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Farmácia</span>
            </button>

            {/* Protocol */}
            <button 
              onClick={() => isConsultationFinished ? navigate('/protocol') : alert('Seu protocolo estará disponível após a prescrição.')}
              className={`flex flex-col items-center gap-2.5 group outline-none ${!isConsultationFinished && 'opacity-60'}`}
            >
              <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                <Droplets className="w-6 h-6 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors relative z-10" />
                <div className="absolute inset-0 bg-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Protocolo</span>
            </button>

            {/* History (only if premium) */}
            {pagamento_premium && (
              <button 
                onClick={() => navigate('/history')} 
                className="flex flex-col items-center gap-2.5 group outline-none"
              >
                <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                  <History className="w-6 h-6 text-[#8A8A9E] group-hover:text-white transition-colors relative z-10" />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Histórico</span>
              </button>
            )}
          </div>
          
          {/* Botão de Nova Triagem (Para quem já é paciente e quer nova consulta) */}
          <motion.div
            variants={itemVariants}
            className="mt-4 flex items-center justify-between bg-[#161622] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => {
              useStore.getState().clearTriage();
              navigate('/onboarding');
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-mecura-neon" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Nova Triagem Clínica</h4>
                <p className="text-xs text-[#8A8A9E]">Iniciar avaliação para uma nova queixa</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8A8A9E]" />
          </motion.div>
          
          {/* HIGH IMPACT PREMIUM BANNER */}
          {!pagamento_premium && (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/premium-checkout')}
              className="mt-5 flex flex-col bg-gradient-to-br from-[#1A1A24] to-[#12121A] border border-[#A6FF00]/40 rounded-[28px] p-5 text-left group hover:border-[#A6FF00]/80 transition-all shadow-[0_8px_30px_rgba(166,255,0,0.2)] relative overflow-hidden outline-none cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6FF00]/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                <Star className="w-32 h-32 text-[#A6FF00]" strokeWidth={0.5} />
              </div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-14 h-14 rounded-[20px] bg-[#A6FF00]/10 border border-[#A6FF00]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(166,255,0,0.2)]">
                   <Star className="w-7 h-7 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1.5">
                     <div className="flex items-center gap-1.5 bg-[#A6FF00]/10 px-2 py-0.5 rounded-full border border-[#A6FF00]/30 shadow-[0_0_10px_rgba(166,255,0,0.1)]">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#A6FF00] animate-pulse" />
                       <span className="text-[9px] font-bold text-[#A6FF00] uppercase tracking-wider">Acesso VIP</span>
                     </div>
                   </div>
                   <h4 className="text-[16px] font-bold text-white mb-2 tracking-tight">Mecura Premium VIP</h4>
                   <p className="text-[12px] text-white/80 leading-relaxed font-medium">
                     Consulta em <strong className="text-[#A6FF00]">vídeo chamada</strong>, acompanhamento de <strong className="text-white">90 dias com retorno</strong>, laudo <strong className="text-white">inicial</strong>, <strong className="text-white">evolutivo</strong> e <strong className="text-white">psicomotor</strong> para HC.
                   </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Cultivo de Cannabis (3 Cards) */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[18px] font-serif font-bold text-white tracking-tight">Jornada de Cultivo</h3>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 px-1 -mx-1 snap-x snap-mandatory hide-scrollbar">
              {/* Card 1: HC */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                onClick={() => setPromoModal('hc')}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 hover:border-[#A6FF00]/50 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(166,255,0,0.15)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-[#A6FF00]/20 transition-all duration-700" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#A6FF00]/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <motion.div 
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#A6FF00]/50 group-hover:shadow-[0_0_15px_rgba(166,255,0,0.3)] transition-all duration-300"
                  >
                    <ShieldCheck className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                  </motion.div>
                  <ArrowUpRight className="w-4 h-4 text-[#A6FF00] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>
                
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight group-hover:text-[#A6FF00] transition-colors">Habeas Corpus</h4>
                <p className="text-[12px] text-[#8A8A9E] leading-relaxed">
                  Obtenha seu HC para cultivo legal de forma 100% segura e orientada.
                </p>
              </motion.div>

              {/* Card 2: Consultoria */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                onClick={() => setPromoModal('consultoria')}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 hover:border-[#A6FF00]/50 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(166,255,0,0.15)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-[#A6FF00]/20 transition-all duration-700" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#A6FF00]/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <motion.div 
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.3 }}
                    className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#A6FF00]/50 group-hover:shadow-[0_0_15px_rgba(166,255,0,0.3)] transition-all duration-300"
                  >
                    <MessageCircle className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                  </motion.div>
                  <ArrowUpRight className="w-4 h-4 text-[#A6FF00] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>

                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight group-hover:text-[#A6FF00] transition-colors">Consultoria</h4>
                <p className="text-[12px] text-[#8A8A9E] leading-relaxed">
                  Acompanhamento especializado do cultivador iniciante ao avançado.
                </p>
              </motion.div>

              {/* Card 3: Sementes */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                onClick={() => setPromoModal('sementes')}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 hover:border-[#A6FF00]/50 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(166,255,0,0.15)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-[#A6FF00]/20 transition-all duration-700" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#A6FF00]/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <motion.div 
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut', delay: 0.6 }}
                    className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#A6FF00]/50 group-hover:shadow-[0_0_15px_rgba(166,255,0,0.3)] transition-all duration-300"
                  >
                    <Leaf className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                  </motion.div>
                  <ArrowUpRight className="w-4 h-4 text-[#A6FF00] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>

                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight group-hover:text-[#A6FF00] transition-colors">Sementes da Europa</h4>
                <p className="text-[12px] text-[#8A8A9E] leading-relaxed">
                  Acesso exclusivo ao melhor banco de sementes europeu certificado.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Destaques (Promo Cards) */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[18px] font-serif font-bold text-white tracking-tight">Destaques</h3>
            <button 
              type="button"
              onClick={() => setShowAllHighlightsModal(true)}
              className="text-[12px] font-medium text-[#8A8A9E] flex items-center gap-1 cursor-pointer hover:text-mecura-neon transition-colors group outline-none"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5 text-mecura-neon group-hover:translate-x-0.5 transition-transform"/>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Farmácia */}
            <motion.button 
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              onClick={() => navigate('/pharmacy')}
              className="flex flex-col bg-[#12121A] border border-white/5 hover:border-mecura-neon/40 rounded-[28px] p-4 text-left group hover:bg-[#1A1A24] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(166,255,0,0.2)] relative overflow-hidden outline-none cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-mecura-neon/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-mecura-neon/20 transition-all duration-700" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
              
              <div className="w-full h-32 bg-[#1A1A24] rounded-[20px] mb-4 flex items-center justify-center border border-white/5 group-hover:border-mecura-neon/30 transition-colors overflow-hidden relative shadow-inner">
                <div className="absolute inset-0 bg-radial from-mecura-neon/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <Package className="w-12 h-12 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors group-hover:scale-110 duration-500" strokeWidth={1.2} />
                </motion.div>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold text-mecura-neon/90 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-mecura-neon animate-pulse" />
                  Catálogo Oficial
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A9E] opacity-0 group-hover:opacity-100 group-hover:text-mecura-neon transition-all -translate-x-1 group-hover:translate-x-0" />
              </div>

              <h4 className="text-[14px] font-bold text-white mb-1 tracking-tight group-hover:text-mecura-neon transition-colors">Farmácia GreenBudz</h4>
              <p className="text-[11px] text-[#8A8A9E] leading-tight">Medicamentos e suplementos prescritos.</p>
            </motion.button>

            {/* Card 2: Premium */}
            {!pagamento_premium ? (
              <motion.button 
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                onClick={() => navigate('/premium-checkout')}
                className="flex flex-col bg-[#12121A] border border-[#A6FF00]/30 hover:border-[#A6FF00]/70 rounded-[28px] p-4 text-left group hover:bg-[#1A1A24] transition-all shadow-[0_0_20px_rgba(166,255,0,0.18)] hover:shadow-[0_0_35px_rgba(166,255,0,0.4)] relative overflow-hidden outline-none cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#A6FF00]/15 blur-[35px] rounded-full pointer-events-none group-hover:bg-[#A6FF00]/30 transition-all duration-700" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#A6FF00]/10 to-transparent pointer-events-none" />
                
                <div className="w-full h-32 bg-gradient-to-br from-[#1A1A24] to-[#12121A] rounded-[20px] mb-4 flex flex-col items-center justify-center border border-[#A6FF00]/20 group-hover:border-[#A6FF00]/50 transition-colors overflow-hidden relative shadow-inner">
                  <div className="absolute inset-0 bg-radial from-[#A6FF00]/15 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  <motion.div
                    animate={{ y: [0, -4, 0], scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <ShieldCheck className="w-12 h-12 text-[#A6FF00] group-hover:scale-110 duration-500 drop-shadow-[0_0_12px_rgba(166,255,0,0.4)]" strokeWidth={1.3} />
                  </motion.div>
                  <div className="absolute bottom-3 flex -space-x-1.5 items-center z-10">
                    <div className="w-5 h-5 rounded-full bg-[#1A1A24] border border-[#A6FF00]/30 flex items-center justify-center text-[9px] shadow-sm">👨‍⚕️</div>
                    <div className="w-5 h-5 rounded-full bg-[#A6FF00]/20 border border-[#A6FF00]/50 flex items-center justify-center text-[8px] font-bold text-[#A6FF00] shadow-[0_0_8px_rgba(166,255,0,0.4)] animate-pulse">+</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 bg-[#A6FF00]/10 px-2 py-0.5 rounded-full border border-[#A6FF00]/30 shadow-[0_0_10px_rgba(166,255,0,0.15)]">
                    <Star className="w-3 h-3 text-[#A6FF00] fill-[#A6FF00] animate-pulse" />
                    <span className="text-[9px] font-bold text-[#A6FF00] uppercase tracking-wider">Acesso VIP</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#A6FF00] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>

                <h4 className="text-[14px] font-bold text-white mb-1 tracking-tight group-hover:text-[#A6FF00] transition-colors">Mecura Premium VIP</h4>
                <p className="text-[11px] text-[#8A8A9E] leading-tight">Vídeo + 90d + Laudos HC e Psicomotor</p>
              </motion.button>
            ) : scheduledConsultation ? (
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex flex-col bg-[#12121A] border border-[#A6FF00]/30 rounded-[28px] p-4 text-left shadow-[0_0_20px_rgba(166,255,0,0.15)] relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-1.5 mb-2 mt-1 bg-[#A6FF00]/10 px-2 py-0.5 rounded-full border border-[#A6FF00]/30 w-fit">
                  <Star className="w-3 h-3 text-[#A6FF00] fill-[#A6FF00]" />
                  <span className="text-[9px] font-bold text-[#A6FF00] uppercase tracking-wider">Acesso VIP</span>
                </div>
                <h4 className="text-[15px] font-bold text-white mb-4 tracking-tight">Consulta Agendada</h4>
                
                <div className="space-y-2.5 flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-3 bg-[#1A1A24] p-3 rounded-xl border border-white/5">
                    <Calendar className="w-4 h-4 text-[#A6FF00]" />
                    <span className="text-[12px] font-bold text-white">{scheduledConsultation.date.split('-').reverse().join('/')}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#1A1A24] p-3 rounded-xl border border-white/5">
                    <Clock className="w-4 h-4 text-[#A6FF00]" />
                    <span className="text-[12px] font-bold text-white">{scheduledConsultation.time}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button 
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                onClick={() => navigate('/scheduling')}
                className="flex flex-col bg-[#12121A] border border-[#A6FF00]/30 hover:border-[#A6FF00]/70 rounded-[28px] p-4 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_0_20px_rgba(166,255,0,0.18)] hover:shadow-[0_0_35px_rgba(166,255,0,0.4)] relative overflow-hidden outline-none cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-full h-32 bg-gradient-to-br from-[#1A1A24] to-[#12121A] rounded-[20px] mb-4 flex flex-col items-center justify-center border border-[#A6FF00]/10 group-hover:border-[#A6FF00]/30 transition-colors overflow-hidden relative">
                  <Calendar className="w-12 h-12 text-[#A6FF00] group-hover:scale-110 duration-500 relative z-10" strokeWidth={1} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#A6FF00] fill-[#A6FF00]" />
                    <span className="text-[9px] font-bold text-[#A6FF00] uppercase tracking-wider">Acesso VIP</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#A6FF00] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>
                <h4 className="text-[14px] font-bold text-white mb-1 tracking-tight">Agendar Retorno</h4>
                <p className="text-[11px] text-[#8A8A9E] leading-tight">Marque sua consulta por vídeo.</p>
              </motion.button>
            )}
          </div>
        </section>

        {/* Extras (Indication) */}
        <section>
          <motion.div 
            onClick={() => setShowReferralModal(true)}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center justify-between p-5 rounded-[24px] bg-[#12121A] border border-white/5 hover:border-mecura-neon/30 hover:bg-[#1A1A24] cursor-pointer group transition-all shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(166,255,0,0.15)] relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-mecura-neon/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <motion.div 
                whileHover={{ rotate: [0, -12, 12, -6, 6, 0] }}
                transition={{ duration: 0.5 }}
                className="w-11 h-11 rounded-2xl bg-mecura-neon/10 border border-mecura-neon/20 flex items-center justify-center shadow-[0_0_15px_rgba(166,255,0,0.15)] group-hover:bg-mecura-neon/20 group-hover:scale-105 transition-all"
              >
                <Gift className="w-5 h-5 text-mecura-neon" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white tracking-tight group-hover:text-mecura-neon transition-colors">Indique um amigo</span>
                <span className="text-[11px] text-[#8A8A9E] flex items-center gap-1.5 mt-0.5">
                  E ganhe até <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-mecura-neon/15 text-mecura-neon font-bold text-[10px] border border-mecura-neon/30 shadow-[0_0_10px_rgba(166,255,0,0.2)] animate-pulse">R$ 50 OFF</span> em desconto
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8A8A9E] group-hover:text-mecura-neon group-hover:translate-x-1.5 transition-all relative z-10" />
          </motion.div>
        </section>

      </motion.div>

      {/* Background Ambient Blur */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[0%] left-[-20%] w-[60%] h-[60%] bg-mecura-neon/5 blur-[60px] rounded-full " />
        <div className="absolute bottom-[0%] right-[-20%] w-[60%] h-[60%] bg-[#A6FF00]/5 blur-[60px] rounded-full " />
      </div>
      
      {/* Advisor Chat Widget */}

      {/* Promotional Modal */}
      {promoModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={handleClosePromoModal} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-[#12121A] border border-[#A6FF00]/30 rounded-[28px] p-6 max-w-sm w-full shadow-[0_0_40px_rgba(166,255,0,0.15)] z-10 overflow-hidden text-center"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6FF00]/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/20 flex items-center justify-center mx-auto mb-4 relative z-10">
              {promoModal === 'hc' && <ShieldCheck className="w-8 h-8 text-[#A6FF00]" strokeWidth={1.5} />}
              {promoModal === 'consultoria' && <MessageCircle className="w-8 h-8 text-[#A6FF00]" strokeWidth={1.5} />}
              {promoModal === 'sementes' && <Leaf className="w-8 h-8 text-[#A6FF00]" strokeWidth={1.5} />}
            </div>
            
            <h3 className="text-[20px] font-bold text-white mb-3">
              {promoModal === 'hc' && 'Habeas Corpus de Cultivo'}
              {promoModal === 'consultoria' && 'Consultoria Especializada'}
              {promoModal === 'sementes' && 'Sementes da Europa'}
            </h3>
            
            <p className="text-[14px] text-[#8A8A9E] mb-6 leading-relaxed">
              {promoModal === 'hc' && 'Tenha acesso a toda estruturação para seu HC, acompanhamento individual, acesso a médicos e advogados. Nossos advogados têm HCs concedidos em 24h, 30 dias, 90 dias e 6 meses (cada caso é um caso).'}
              {promoModal === 'consultoria' && 'Aprenda a cultivar do ZERO! Da semente ao medicamento. Acompanhamento especializado e individualizado para você garantir sua própria medicina com qualidade.'}
              {promoModal === 'sementes' && 'Tenha acesso às melhores genéticas do mundo para o seu cultivo terapêutico. Trabalhamos com os melhores bancos de sementes europeus certificados.'}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const msgs: Record<string, string> = {
                    hc: 'Olá! Gostaria de saber mais sobre a estruturação para o Habeas Corpus de cultivo.',
                    consultoria: 'Olá! Gostaria de saber mais sobre a consultoria de cultivo do zero.',
                    sementes: 'Olá! Gostaria de saber mais sobre as Sementes da Europa para cultivo terapêutico.'
                  };
                  window.open(`https://wa.me/5566996280883?text=${encodeURIComponent(msgs[promoModal || 'hc'])}`, '_blank');
                  handleClosePromoModal();
                }}
                className="w-full h-12 bg-[#25D366] hover:bg-[#20b858] text-white rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                Falar no WhatsApp
              </button>

              <button
                onClick={() => {
                  if (promoModal === 'sementes') {
                    window.open('https://super.sementesagrada.com/', '_blank');
                  } else {
                    window.open('https://instmecura.sementesagrada.com/', '_blank');
                  }
                  handleClosePromoModal();
                }}
                className="w-full h-12 bg-[#1A1A24] border border-[#A6FF00]/30 hover:border-[#A6FF00] text-white rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Acessar Site
              </button>

              <button 
                onClick={handleClosePromoModal}
                className="w-full h-10 text-[#8A8A9E] hover:text-white font-medium text-[13px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {openedFromHighlights && <ChevronLeft className="w-4 h-4 text-mecura-neon" />}
                <span>{openedFromHighlights ? 'Voltar para Todos os Destaques' : 'Voltar'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Todos os Destaques & Serviços */}
      {showAllHighlightsModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
            onClick={() => setShowAllHighlightsModal(false)} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative bg-[#12121A] border border-white/10 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 max-w-[420px] w-full shadow-[0_0_50px_rgba(0,0,0,0.9)] z-10 overflow-hidden flex flex-col max-h-[74vh] sm:max-h-[76vh] my-auto"
          >
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-mecura-neon/10 blur-[45px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#A6FF00]/10 blur-[45px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-mecura-neon/10 border border-mecura-neon/20 flex items-center justify-center shadow-[0_0_12px_rgba(166,255,0,0.15)]">
                  <Sparkles className="w-4.5 h-4.5 text-mecura-neon" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white tracking-tight leading-tight">Todos os Destaques</h3>
                  <p className="text-[11px] text-[#8A8A9E]">Serviços, farmácia e soluções exclusivas</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllHighlightsModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#8A8A9E] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List - Scrollable */}
            <div className="overflow-y-auto py-2.5 space-y-2.5 flex-1 pr-1 custom-scrollbar relative z-10">
              {/* Item 1: Farmácia GreenBudz */}
              <div 
                onClick={() => openHighlightRoute('/pharmacy')}
                className="p-3.5 rounded-[18px] bg-[#161622] hover:bg-[#1A1A28] border border-white/5 hover:border-mecura-neon/40 transition-all cursor-pointer group flex items-start gap-3 shadow-sm hover:shadow-[0_0_20px_rgba(166,255,0,0.12)]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1A1A24] border border-white/10 group-hover:border-mecura-neon/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Package className="w-4.5 h-4.5 text-mecura-neon" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded-full border border-mecura-neon/20">
                      Medicamentos & Flores
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A9E] group-hover:text-mecura-neon group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-mecura-neon transition-colors truncate">Farmácia GreenBudz</h4>
                  <p className="text-[11px] text-[#8A8A9E] mt-0.5 leading-snug line-clamp-2">
                    Acesso exclusivo ao catálogo completo com desconto especial em medicamentos e flores.
                  </p>
                </div>
              </div>

              {/* Item 2: Mecura Premium VIP */}
              <div 
                onClick={() => openHighlightRoute('/premium-checkout')}
                className="p-3.5 rounded-[18px] bg-[#161622] hover:bg-[#1A1A28] border border-[#A6FF00]/25 hover:border-[#A6FF00]/60 transition-all cursor-pointer group flex items-start gap-3 shadow-sm hover:shadow-[0_0_20px_rgba(166,255,0,0.18)]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1A1A24] border border-[#A6FF00]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Star className="w-4.5 h-4.5 text-[#A6FF00] fill-[#A6FF00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A6FF00] bg-[#A6FF00]/10 px-2 py-0.5 rounded-full border border-[#A6FF00]/30">
                      Acesso VIP • 90 Dias
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#A6FF00] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-[#A6FF00] transition-colors truncate">Mecura Premium VIP</h4>
                  <p className="text-[11px] text-[#8A8A9E] mt-0.5 leading-snug line-clamp-2">
                    Consulta individual por vídeo chamada, retorno em 90 dias e laudos para Habeas Corpus.
                  </p>
                </div>
              </div>

              {/* Item 3: Habeas Corpus */}
              <div 
                onClick={() => openPromoFromHighlights('hc')}
                className="p-3.5 rounded-[18px] bg-[#161622] hover:bg-[#1A1A28] border border-white/5 hover:border-[#A6FF00]/40 transition-all cursor-pointer group flex items-start gap-3 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1A1A24] border border-white/10 group-hover:border-[#A6FF00]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#A6FF00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A9E] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      Segurança Jurídica
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A9E] group-hover:text-[#A6FF00] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-[#A6FF00] transition-colors truncate">Habeas Corpus para Cultivo</h4>
                  <p className="text-[11px] text-[#8A8A9E] mt-0.5 leading-snug line-clamp-2">
                    Orientação e estruturação com laudos periciais para obtenção de salvo-conduto legal.
                  </p>
                </div>
              </div>

              {/* Item 4: Consultoria */}
              <div 
                onClick={() => openPromoFromHighlights('consultoria')}
                className="p-3.5 rounded-[18px] bg-[#161622] hover:bg-[#1A1A28] border border-white/5 hover:border-[#A6FF00]/40 transition-all cursor-pointer group flex items-start gap-3 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1A1A24] border border-white/10 group-hover:border-[#A6FF00]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-4.5 h-4.5 text-[#A6FF00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A9E] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      Mentoria Individual
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A9E] group-hover:text-[#A6FF00] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-[#A6FF00] transition-colors truncate">Consultoria de Cultivo</h4>
                  <p className="text-[11px] text-[#8A8A9E] mt-0.5 leading-snug line-clamp-2">
                    Aprenda a cultivar do zero com acompanhamento prático e individualizado.
                  </p>
                </div>
              </div>

              {/* Item 5: Sementes */}
              <div 
                onClick={() => openPromoFromHighlights('sementes')}
                className="p-3.5 rounded-[18px] bg-[#161622] hover:bg-[#1A1A28] border border-white/5 hover:border-[#A6FF00]/40 transition-all cursor-pointer group flex items-start gap-3 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1A1A24] border border-white/10 group-hover:border-[#A6FF00]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Leaf className="w-4.5 h-4.5 text-[#A6FF00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A9E] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      Genéticas Certificadas
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A9E] group-hover:text-[#A6FF00] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-[#A6FF00] transition-colors truncate">Sementes da Europa</h4>
                  <p className="text-[11px] text-[#8A8A9E] mt-0.5 leading-snug line-clamp-2">
                    Acesso exclusivo aos melhores bancos de sementes europeus para o cultivo medicinal.
                  </p>
                </div>
              </div>

              {/* Item 6: Receituário & Protocolo */}
              <div 
                onClick={() => openHighlightRoute('/prescription-view')}
                className="p-3.5 rounded-[18px] bg-[#161622] hover:bg-[#1A1A28] border border-white/5 hover:border-mecura-neon/40 transition-all cursor-pointer group flex items-start gap-3 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1A1A24] border border-white/10 group-hover:border-mecura-neon/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4.5 h-4.5 text-mecura-neon" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A9E] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      ICP-Brasil
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A9E] group-hover:text-mecura-neon group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-mecura-neon transition-colors truncate">Receituário Digital & Protocolo</h4>
                  <p className="text-[11px] text-[#8A8A9E] mt-0.5 leading-snug line-clamp-2">
                    Consulte sua receita médica oficial, dosagens dos canabinoides e orientações.
                  </p>
                </div>
              </div>

              {/* Item 7: Autorização Anvisa */}
              <div 
                onClick={() => openHighlightRoute('/anvisa')}
                className="p-3.5 rounded-[18px] bg-[#161622] hover:bg-[#1A1A28] border border-white/5 hover:border-mecura-neon/40 transition-all cursor-pointer group flex items-start gap-3 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1A1A24] border border-white/10 group-hover:border-mecura-neon/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-4.5 h-4.5 text-mecura-neon" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A9E] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      Importação Legal
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8A9E] group-hover:text-mecura-neon group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-[13px] font-bold text-white group-hover:text-mecura-neon transition-colors truncate">Autorização Anvisa</h4>
                  <p className="text-[11px] text-[#8A8A9E] mt-0.5 leading-snug line-clamp-2">
                    Acompanhe o processo ou solicite a autorização governamental de importação.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2.5 border-t border-white/5 relative z-10 flex justify-end">
              <button
                onClick={() => setShowAllHighlightsModal(false)}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8A8A9E] hover:text-white font-medium text-[13px] transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mariana Chat - Only visible when modals are closed */}
      {!showAllHighlightsModal && !promoModal && !showReferralModal && <AdvisorChatWidget />}
      
      <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />
    </div>
  );
}
