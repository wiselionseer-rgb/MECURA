import {  useNavigate } from 'react-router-dom';
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
  Users
, Leaf } from 'lucide-react';

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
  const { userName, setSelectedOffer, scheduledConsultation, consultationStatus, pagamento_consulta, pagamento_premium, isConsultationFinished, resetConsultation, inQueue, consultationActive, setPagamentoConsulta, setPagamentoPremium, joinQueue } = useStore();
  
  useEffect(() => {
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
  }, [pagamento_consulta, setPagamentoConsulta, setPagamentoPremium, joinQueue]);

  const [showPremiumDetails, setShowPremiumDetails] = useState(false);
  const [activeSchedulers, setActiveSchedulers] = useState(Math.floor(Math.random() * (22 - 8 + 1)) + 8);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [showReferralModal, setShowReferralModal] = useState(false);

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
      <header className="flex justify-between items-center px-6 pt-10 pb-6 z-10 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
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
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center opacity-100" 
                  style={{ backgroundImage: 'url(/dashboard-bg-poster.jpg)' }} 
                />
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  ref={(el) => {
                    if (el && !el.dataset.attempted) {
                      el.dataset.attempted = 'true';
                      const p = el.play();
                      if (p) {
                        p.catch(() => {
                          el.style.display = 'none';
                        });
                      }
                    }
                  }}
                  src="/2131-ezgif.com-video-compressor.mp4" 
                  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10"
                />
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
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center opacity-100" 
                  style={{ backgroundImage: 'url(/dashboard-bg-poster.jpg)' }} 
                />
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  ref={(el) => {
                    if (el && !el.dataset.attempted) {
                      el.dataset.attempted = 'true';
                      const p = el.play();
                      if (p) {
                        p.catch(() => {
                          el.style.display = 'none';
                        });
                      }
                    }
                  }}
                  src="/2131-ezgif.com-video-compressor.mp4" 
                  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10"
                />
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
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center opacity-100" 
                  style={{ backgroundImage: 'url(/dashboard-bg-poster.jpg)' }} 
                />
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  ref={(el) => {
                    if (el && !el.dataset.attempted) {
                      el.dataset.attempted = 'true';
                      const p = el.play();
                      if (p) {
                        p.catch(() => {
                          el.style.display = 'none';
                        });
                      }
                    }
                  }}
                  src="/2131-ezgif.com-video-compressor.mp4" 
                  className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-10"
                />
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
                   <h4 className="text-[16px] font-bold text-white mb-2 tracking-tight">Mecura Premium</h4>
                   <p className="text-[12px] text-white/80 leading-relaxed font-medium">
                     Consulta com <strong className="text-[#A6FF00]">chamada de vídeo</strong>, acesso ao <strong className="text-white">laudo inicial</strong> e <strong className="text-white">laudo evolutivo</strong> para abertura do HC.
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
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight">Habeas Corpus</h4>
                <p className="text-[12px] text-[#8A8A9E] leading-relaxed">
                  Obtenha seu HC para cultivo legal de forma 100% segura e orientada.
                </p>
              </motion.div>

              {/* Card 2: Consultoria */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <MessageCircle className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight">Consultoria</h4>
                <p className="text-[12px] text-[#8A8A9E] leading-relaxed">
                  Acompanhamento especializado do cultivador iniciante ao avançado.
                </p>
              </motion.div>

              {/* Card 3: Sementes */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <Leaf className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight">Sementes da Europa</h4>
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
            <span className="text-[12px] font-medium text-[#8A8A9E] flex items-center gap-0.5 cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/pharmacy')}>
              Ver todos <ChevronRight className="w-3 h-3"/>
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Farmácia */}
            <motion.button 
              variants={itemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pharmacy')}
              className="flex flex-col bg-[#12121A] border border-white/5 rounded-[28px] p-4 text-left group hover:bg-[#1A1A24] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden outline-none"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-mecura-neon/5 blur-[30px] rounded-full pointer-events-none" />
              <div className="w-full h-32 bg-[#1A1A24] rounded-[20px] mb-4 flex items-center justify-center border border-white/5 group-hover:border-mecura-neon/20 transition-colors overflow-hidden relative">
                <Package className="w-12 h-12 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors group-hover:scale-110 duration-500 relative z-10" strokeWidth={1} />
                <div className="absolute inset-0 bg-gradient-to-t from-mecura-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-[14px] font-bold text-white mb-1 tracking-tight group-hover:text-mecura-neon transition-colors">Farmácia GreenBudz</h4>
              <p className="text-[11px] text-[#8A8A9E] leading-tight">Medicamentos e suplementos prescritos.</p>
            </motion.button>

            {/* Card 2: Premium */}
            {!pagamento_premium ? (
              <motion.button 
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/premium-checkout')}
                className="flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-4 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden outline-none"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-full h-32 bg-gradient-to-br from-[#1A1A24] to-[#12121A] rounded-[20px] mb-4 flex flex-col items-center justify-center border border-[#A6FF00]/10 group-hover:border-[#A6FF00]/30 transition-colors overflow-hidden relative">
                  <ShieldCheck className="w-12 h-12 text-[#A6FF00] group-hover:scale-110 duration-500 relative z-10" strokeWidth={1} />
                  <div className="absolute bottom-3 flex -space-x-1.5 opacity-60">
                    <div className="w-5 h-5 rounded-full bg-white/10 border border-[#1A1A24] flex items-center justify-center text-[8px]">👨‍⚕️</div>
                    <div className="w-5 h-5 rounded-full bg-[#A6FF00]/20 border border-[#1A1A24] flex items-center justify-center text-[8px] font-bold text-[#A6FF00]">+</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 text-[#A6FF00] fill-[#A6FF00]" />
                  <span className="text-[9px] font-bold text-[#A6FF00] uppercase tracking-wider">Acesso VIP</span>
                </div>
                <h4 className="text-[14px] font-bold text-white mb-1 tracking-tight">Mecura Premium</h4>
                <p className="text-[11px] text-[#8A8A9E] leading-tight">Acompanhamento de 90 dias.</p>
              </motion.button>
            ) : scheduledConsultation ? (
              <motion.div 
                variants={itemVariants}
                className="flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-4 text-left shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-1 mb-2 mt-1">
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
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/scheduling')}
                className="flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-4 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden outline-none"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-full h-32 bg-gradient-to-br from-[#1A1A24] to-[#12121A] rounded-[20px] mb-4 flex flex-col items-center justify-center border border-[#A6FF00]/10 group-hover:border-[#A6FF00]/30 transition-colors overflow-hidden relative">
                  <Calendar className="w-12 h-12 text-[#A6FF00] group-hover:scale-110 duration-500 relative z-10" strokeWidth={1} />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 text-[#A6FF00] fill-[#A6FF00]" />
                  <span className="text-[9px] font-bold text-[#A6FF00] uppercase tracking-wider">Acesso VIP</span>
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
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-5 rounded-[24px] bg-[#12121A] border border-white/5 hover:bg-[#1A1A24] cursor-pointer group transition-colors shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-mecura-neon group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white tracking-tight">Indique um amigo</span>
                <span className="text-[11px] text-[#8A8A9E]">E ganhe até <span className="text-mecura-neon font-bold">R$ 50</span> em desconto</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors" />
          </motion.div>
        </section>

      </motion.div>

      {/* Background Ambient Blur */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[0%] left-[-20%] w-[60%] h-[60%] bg-mecura-neon/5 blur-[60px] rounded-full " />
        <div className="absolute bottom-[0%] right-[-20%] w-[60%] h-[60%] bg-[#A6FF00]/5 blur-[60px] rounded-full " />
      </div>
      
      {/* Advisor Chat Widget */}
      <AdvisorChatWidget />
      
      <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />
    </div>
  );
}
