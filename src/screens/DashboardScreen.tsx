import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import { AdvisorChatWidget } from '../components/AdvisorChatWidget';
import { ReferralModal } from '../components/ReferralModal';
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
  const { userName, setSelectedOffer, scheduledConsultation, consultationStatus, pagamento_consulta, pagamento_premium, isConsultationFinished, resetConsultation, inQueue, consultationActive } = useStore();
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
    <div className="flex flex-col h-full bg-[#0A0A0F] text-mecura-pearl relative pb-12 font-sans overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-6 pt-8 z-10">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profile')}
          className="relative group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-transparent border-[1.5px] border-mecura-neon flex items-center justify-center shadow-[0_0_15px_rgba(166,255,0,0.15)] relative z-10 group-hover:bg-mecura-neon/10 transition-colors">
            <User className="w-6 h-6 text-mecura-neon" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-mecura-neon rounded-full border-[3px] border-[#0A0A0F] flex items-center justify-center z-20 shadow-[0_0_10px_rgba(166,255,0,0.4)]">
            <Flame className="w-3 h-3 text-[#0A0A0F]" />
          </div>
        </motion.button>
        
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-serif font-bold tracking-tight text-white"
        >
          mecura
        </motion.h1>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            await auth.signOut();
            resetConsultation();
            navigate('/');
          }}
          className="text-[#8A8A9E] flex items-center gap-1.5 font-medium text-sm hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </motion.button>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 space-y-5 z-10"
      >
        {/* Main Banner (Gamified/Premium) */}
        {isConsultationFinished ? (
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-gradient-to-br from-[#1A2E1A] to-[#121A12] border border-mecura-neon/30 rounded-[28px] p-7 overflow-hidden shadow-2xl group cursor-pointer"
            onClick={() => navigate('/chat')}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-mecura-neon/10 via-transparent to-mecura-neon/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-mecura-neon/30 blur-[60px] rounded-full pointer-events-none group-hover:bg-mecura-neon/40 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#0A0A0F]/50 border border-mecura-neon/50 px-3 py-1.5 rounded-full mb-5">
                <div className="w-2 h-2 rounded-full bg-mecura-neon animate-pulse shadow-[0_0_8px_rgba(166,255,0,0.8)]" />
                <span className="text-[11px] font-bold text-mecura-neon uppercase tracking-widest">PRESCRIÇÃO LIBERADA</span>
              </div>
              
              <h2 className="text-[26px] font-bold text-white mb-6 leading-[1.15] tracking-tight">
                Sua receita e laudo<br />estão prontos!
              </h2>
              
              <button 
                className="flex items-center gap-2 text-[#0A0A0F] bg-mecura-neon px-6 py-3.5 rounded-full font-bold text-sm hover:bg-[#b5ff33] transition-all shadow-[0_0_20px_rgba(166,255,0,0.25)] group-hover:shadow-[0_0_25px_rgba(166,255,0,0.4)]"
              >
                Ver Prescrição Médica <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        ) : inQueue ? (
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-gradient-to-br from-[#2A201A] to-[#1A1212] border border-[#FF8A00]/30 rounded-[28px] p-7 overflow-hidden shadow-2xl group cursor-pointer"
            onClick={() => navigate('/queue')}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF8A00]/10 via-transparent to-[#FF8A00]/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#FF8A00]/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-[#FF8A00]/30 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#0A0A0F]/50 border border-[#FF8A00]/50 px-3 py-1.5 rounded-full mb-5">
                <div className="w-2 h-2 rounded-full bg-[#FF8A00] animate-pulse shadow-[0_0_8px_rgba(255,138,0,0.8)]" />
                <span className="text-[11px] font-bold text-[#FF8A00] uppercase tracking-widest">FILA DE ESPERA</span>
              </div>
              
              <h2 className="text-[26px] font-bold text-white mb-6 leading-[1.15] tracking-tight">
                Você está na fila<br />para atendimento
              </h2>
              
              <button 
                className="flex items-center gap-2 text-[#0A0A0F] bg-[#FF8A00] px-6 py-3.5 rounded-full font-bold text-sm hover:bg-[#FF9A26] transition-all shadow-[0_0_20px_rgba(255,138,0,0.25)] group-hover:shadow-[0_0_25px_rgba(255,138,0,0.4)]"
              >
                Acompanhar Fila <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        ) : pagamento_consulta || consultationActive ? (
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-gradient-to-br from-[#1A2E1A] to-[#121A12] border border-mecura-neon/30 rounded-[28px] p-7 overflow-hidden shadow-2xl group cursor-pointer"
            onClick={() => navigate('/chat')}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-mecura-neon/10 via-transparent to-mecura-neon/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-mecura-neon/30 blur-[60px] rounded-full pointer-events-none group-hover:bg-mecura-neon/40 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#0A0A0F]/50 border border-mecura-neon/50 px-3 py-1.5 rounded-full mb-5">
                <div className="w-2 h-2 rounded-full bg-mecura-neon animate-pulse shadow-[0_0_8px_rgba(166,255,0,0.8)]" />
                <span className="text-[11px] font-bold text-mecura-neon uppercase tracking-widest">CONSULTA EM ANDAMENTO</span>
              </div>
              
              <h2 className="text-[26px] font-bold text-white mb-6 leading-[1.15] tracking-tight">
                O médico está<br />aguardando você
              </h2>
              
              <button 
                className="flex items-center gap-2 text-[#0A0A0F] bg-mecura-neon px-6 py-3.5 rounded-full font-bold text-sm hover:bg-[#b5ff33] transition-all shadow-[0_0_20px_rgba(166,255,0,0.25)] group-hover:shadow-[0_0_25px_rgba(166,255,0,0.4)]"
              >
                Retomar consulta <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-gradient-to-br from-[#1A1A26] to-[#12121A] border border-[#2A2A3A] rounded-[28px] p-7 overflow-hidden shadow-2xl group cursor-pointer"
            onClick={() => {
              setSelectedOffer('basic');
              navigate('/checkout');
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-mecura-neon/5 via-transparent to-mecura-neon/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-mecura-neon/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-mecura-neon/30 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#1A2E1A] border border-[#2A4A2A] px-3 py-1.5 rounded-full mb-5">
                <div className="w-2 h-2 rounded-full bg-mecura-neon animate-pulse shadow-[0_0_8px_rgba(166,255,0,0.8)]" />
                <span className="text-[11px] font-bold text-mecura-neon uppercase tracking-widest">PAGAMENTO PENDENTE</span>
              </div>
              
              <h2 className="text-[26px] font-bold text-white mb-6 leading-[1.15] tracking-tight">
                Finalize o pagamento<br />para iniciar a consulta
              </h2>
              
              <button 
                className="flex items-center gap-2 text-[#0A0A0F] bg-mecura-neon px-6 py-3.5 rounded-full font-bold text-sm hover:bg-[#b5ff33] transition-all shadow-[0_0_20px_rgba(166,255,0,0.25)] group-hover:shadow-[0_0_25px_rgba(166,255,0,0.4)]"
              >
                Finalizar Pagamento <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Action List */}
        <div className="space-y-4">
          {/* 1. Acessar Farmácia GreenBudz */}
          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/pharmacy')}
            className="w-full bg-[#0A0A0F] border border-mecura-neon/30 hover:border-mecura-neon hover:shadow-[0_0_30px_rgba(166,255,0,0.2)] transition-all duration-500 rounded-[24px] p-5 flex items-center justify-between group shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/5 via-transparent to-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-mecura-neon/20 blur-[40px] rounded-full pointer-events-none group-hover:bg-mecura-neon/30 transition-colors duration-500" />
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#1A2E1A] flex items-center justify-center border border-mecura-neon/50 group-hover:scale-110 group-hover:bg-mecura-neon/20 transition-all duration-500 rotate-3 group-hover:rotate-0 shadow-[0_0_15px_rgba(166,255,0,0.1)]">
                <ShoppingCart className="w-6 h-6 text-mecura-neon" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-white group-hover:text-mecura-neon transition-colors text-[18px] tracking-tight">Acessar Farmácia GreenBudz</span>
                <span className="text-[13px] text-[#8A8A9E] mt-0.5">Compre seus medicamentos prescritos</span>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-[#6A6A7E] group-hover:text-mecura-neon group-hover:translate-x-1 transition-all relative z-10" />
          </motion.button>

          {/* 2. Acompanhamento Premium Card */}
          {!pagamento_premium ? (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="w-full relative group mt-2"
            >
              {/* Premium Glow effect behind the card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 via-[#F3E5AB]/20 to-[#D4AF37]/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              <div className="bg-[#0A0A0F] rounded-[30px] relative z-10 w-full flex flex-col gap-6 border border-[#D4AF37]/20 overflow-hidden shadow-2xl">
                {/* Header section with background image/gradient */}
                <div className="relative pt-8 px-6 pb-4 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-transparent blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
                  
                  <div className="flex justify-between items-start mb-6 align-center relative z-10">
                    <motion.span 
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.15em] bg-gradient-to-r from-[#D4AF37]/10 to-transparent px-3 py-1.5 rounded-full border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    >
                      <Star className="w-3 h-3 fill-current" /> EXPERIÊNCIA VIP
                    </motion.span>

                    <div className="flex -space-x-3 pointer-events-none hover:scale-105 transition-transform duration-500">
                      <div className="w-9 h-9 rounded-full border-[1.5px] border-[#0A0A0F] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-30 bg-[#12121A]">
                        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150" alt="Médico 1" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-9 h-9 rounded-full border-[1.5px] border-[#0A0A0F] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-20 bg-[#12121A] translate-y-1">
                        <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150" alt="Médico 2" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-9 h-9 rounded-full border-[1.5px] border-[#0A0A0F] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-10 bg-gradient-to-br from-[#D4AF37] to-[#F3E5AB] flex items-center justify-center text-[10px] font-black text-[#0A0A0F]">
                        +
                      </div>
                    </div>
                  </div>

                  <h3 className="text-[28px] font-black text-white leading-[1.15] tracking-tight mb-3 drop-shadow-md relative z-10">
                    Sua saúde com a <br /> Mecura <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">Premium</span>
                  </h3>
                  <p className="text-[14px] text-[#A1A1AA] leading-relaxed relative z-10 pr-4">
                    Mais que uma consulta. Obtenha uma <strong className="text-white font-medium">jornada médica e acolhimento jurídico</strong> VIP.
                  </p>
                </div>

                {/* Features List */}
                <div className="px-6 flex flex-col gap-3.5 relative z-10">
                  {[
                    { text: <>Consulta <b>por vídeo</b> com especialista</>, icon: Star },
                    { text: <>Laudo para <b>Anvisa/SUS</b> completo</>, icon: FileText },
                    { text: <>Suporte jurídico para <b>cultivo próprio</b></>, icon: ShieldCheck },
                    { text: <>Acompanhamento contínuo por <b>90 dias</b></>, icon: Clock }
                  ].map((feature, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-3.5 group/feature bg-white/[0.02] border border-white/[0.02] hover:border-white/5 hover:bg-white/[0.04] p-3 rounded-2xl transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex flex-shrink-0 items-center justify-center border border-[#D4AF37]/30 shadow-[0_0_10px_rgba(212,175,55,0.1)] group-hover/feature:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-shadow">
                        <feature.icon className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] text-[#A1A1AA] leading-tight">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="mt-2 p-6 bg-gradient-to-t from-[#D4AF37]/10 to-transparent border-t border-[#D4AF37]/10 flex flex-col gap-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      {activeSchedulers} Agendando Agora
                    </span>
                    <span className="text-[9px] text-[#D4AF37]/80 font-bold uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#D4AF37]/80" /> Garantia 7 dias
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedOffer('premium');
                      navigate('/premium-checkout');
                    }}
                    className="w-full relative group/btn rounded-[18px] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] group-hover/btn:scale-105 transition-transform duration-500" />
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover/btn:animate-shimmer skew-x-[-20deg]" />
                    
                    <div className="relative flex flex-col items-center gap-1 py-4.5 px-6 bg-[#0A0A0F]/5 border border-[#D4AF37]/50 backdrop-blur-[2px]">
                      <span className="text-[#0A0A0F] font-black text-[15px] tracking-tight uppercase shadow-sm flex items-center justify-center">
                        GARANTIR MEU ACOMPANHAMENTO
                      </span>
                      <div className="flex items-center gap-2 text-[#0B0B0F]/80 font-bold text-[11px] bg-white/20 border border-white/20 px-3 py-1 rounded-full mt-1">
                        <span>De <span className="line-through opacity-60">R$ 497</span> por <span className="text-red-700 font-black">R$ 250,00</span></span>
                        <span className="w-px h-3 bg-black/10 mx-0.5" />
                        <span className="flex items-center gap-1 text-red-700">
                          <Clock className="w-3 h-3" /> {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : scheduledConsultation ? (
            <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-[#1A1A26] to-[#12121A] border border-[#D4AF37]/30 rounded-[24px] p-5 flex flex-col gap-4 shadow-lg relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/40">
                    <Stethoscope className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-[#D4AF37] text-[17px]">Acompanhamento Premium</span>
                    <span className="text-[12px] text-[#D4AF37]/70 mt-0.5">Consulta agendada com especialista</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  consultationStatus === 'confirmed' ? 'bg-[#1A2E1A] text-mecura-neon border border-[#2A4A2A]' : 'bg-[#2E2E1A] text-[#D4AF37] border border-[#4A4A2A]'
                }`}>
                  {consultationStatus === 'confirmed' ? 'Confirmado' : 'Aguardando confirmação'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#262636]">
                <div className="flex items-center gap-3 bg-[#0A0A0F]/50 p-3 rounded-xl border border-[#262636]">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#8A8A9E] uppercase font-bold">Data</span>
                    <span className="text-sm font-bold text-white">{scheduledConsultation.date.split('-').reverse().join('/')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[#0A0A0F]/50 p-3 rounded-xl border border-[#262636]">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#8A8A9E] uppercase font-bold">Horário</span>
                    <span className="text-sm font-bold text-white">{scheduledConsultation.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/scheduling')}
              className="w-full bg-gradient-to-r from-[#1A1A26] to-[#12121A] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 rounded-[24px] p-5 flex items-center justify-between group shadow-lg relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/40 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-[#D4AF37] text-[17px]">Acompanhamento Premium</span>
                  <span className="text-[12px] text-[#D4AF37]/70 mt-0.5">Escolha o melhor horário</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}

          {/* 3. Curso Cultivo */}
          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('Em breve!')}
            className="w-full bg-gradient-to-br from-[#1A2E05] via-[#121A0A] to-[#0A0A0F] border border-mecura-neon/40 hover:border-mecura-neon hover:shadow-[0_0_40px_rgba(166,255,0,0.2)] transition-all duration-500 rounded-[24px] p-6 flex items-center justify-between group shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/10 via-transparent to-mecura-neon/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -right-10 -top-10 w-32 h-32 bg-mecura-neon/20 blur-[40px] rounded-full pointer-events-none" 
            />
            
            <div className="flex items-center gap-5 relative z-10 w-full">
              <div className="w-14 h-14 rounded-2xl bg-[#1A2E1A] flex items-center justify-center border border-mecura-neon/50 group-hover:scale-110 group-hover:bg-mecura-neon/20 transition-all duration-500 shadow-[0_0_15px_rgba(166,255,0,0.2)] flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-mecura-neon/20 animate-pulse" />
                <Sprout className="w-7 h-7 text-mecura-neon relative z-10" />
              </div>
              <div className="flex flex-col items-start text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-mecura-neon animate-pulse" />
                  <span className="text-[10px] font-black text-mecura-neon uppercase tracking-widest bg-mecura-neon/10 px-2 py-0.5 rounded-full border border-mecura-neon/20">
                    Curso Exclusivo
                  </span>
                </div>
                <span className="font-black text-white group-hover:text-mecura-neon transition-colors text-[18px] leading-tight tracking-tight mb-1">
                  Liberdade para Cultivar
                </span>
                <span className="text-[13px] text-white/80 leading-relaxed font-medium">
                  Produza seu próprio remédio em casa com <strong className="text-mecura-neon font-bold">segurança legal</strong>.
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/30 group-hover:bg-mecura-neon group-hover:border-mecura-neon transition-all duration-300 flex-shrink-0">
                <ChevronRight className="w-5 h-5 text-mecura-neon group-hover:text-[#0A0A0F] transition-colors" />
              </div>
            </div>
          </motion.button>

          {/* 4. Banco de Sementes */}
          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('Em breve!')}
            className="w-full bg-gradient-to-br from-[#1A0B2E] to-[#0A0514] border border-[#B324FF]/30 hover:border-[#B324FF]/60 hover:shadow-[0_0_30px_rgba(179,36,255,0.2)] transition-all duration-500 rounded-[28px] p-1 flex items-center justify-between group shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000')] opacity-20 mix-blend-screen scale-110 group-hover:scale-100 group-hover:opacity-30 transition-all duration-700 bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#B324FF]/0 via-[#B324FF]/10 to-[#B324FF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-[#B324FF]/30 blur-[40px] rounded-full pointer-events-none group-hover:bg-[#B324FF]/50 transition-colors duration-700" />
            
            <div className="w-full h-full bg-[#120A20]/60 backdrop-blur-sm rounded-[24px] p-5 flex items-center justify-between relative z-10 border border-white/5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5 relative z-10 w-full">
                <div className="w-14 h-14 rounded-2xl bg-[#B324FF]/20 flex items-center justify-center border border-[#B324FF]/40 group-hover:border-[#B324FF] group-hover:scale-110 group-hover:bg-[#B324FF]/30 transition-all duration-500 rotate-3 group-hover:rotate-0 shadow-[0_0_20px_rgba(179,36,255,0.3)] flex-shrink-0">
                  <Globe className="w-7 h-7 text-[#D980FF] group-hover:text-white transition-colors" />
                </div>
                
                <div className="flex flex-col items-start text-left flex-1 pr-4">
                  <span className="text-[10px] bg-[#B324FF]/20 border border-[#B324FF]/40 text-[#D980FF] font-black px-2.5 py-1 rounded-full uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5 shadow-[0_0_15px_rgba(179,36,255,0.3)]">
                    <Sparkles className="w-3 h-3" /> Acesso Premium
                  </span>
                  <span className="font-extrabold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#D980FF] transition-all duration-300 text-[18px] md:text-[20px] leading-[1.1] mb-1">
                    Banco Internacional<br/>de Sementes
                  </span>
                  <span className="text-[13px] text-[#A1A1AA] mt-1 group-hover:text-white transition-colors leading-relaxed">
                    Genéticas <strong className="text-white font-bold">Raras e de Elite</strong> importadas para membros.
                  </span>
                </div>
              </div>
              
              <div className="hidden md:flex flex-shrink-0 relative z-10 w-10 h-10 rounded-full border border-[#B324FF]/40 items-center justify-center bg-[#B324FF]/10 group-hover:bg-[#B324FF] group-hover:border-[#B324FF] transition-all duration-300 shadow-[0_0_15px_rgba(179,36,255,0)] group-hover:shadow-[0_0_20px_rgba(179,36,255,0.4)]">
                <ChevronRight className="w-5 h-5 text-[#D980FF] group-hover:text-white transition-colors" />
              </div>
            </div>
            
            {/* Small right arrow for mobile */}
            <div className="md:hidden absolute right-5 top-1/2 -translate-y-1/2 z-10">
               <ChevronRight className="w-5 h-5 text-[#D980FF] group-hover:text-white transition-colors" />
            </div>
          </motion.button>

          {/* 5. Falar com a Equipe Médica */}
          <motion.button 
            variants={itemVariants}
            whileHover={isConsultationFinished ? { scale: 1.02, x: 5 } : {}}
            whileTap={isConsultationFinished ? { scale: 0.98 } : {}}
            onClick={() => {
              if (isConsultationFinished) {
                window.open("https://wa.me/5566996280883", "_blank");
              } else {
                alert('O suporte médico direto está disponível apenas para pacientes em acompanhamento após a consulta.');
              }
            }}
            className={`w-full bg-[#0A0A0F] border border-[#262636] transition-all duration-500 rounded-[24px] p-5 flex items-center justify-between group shadow-lg relative overflow-hidden ${isConsultationFinished ? 'hover:border-mecura-neon/50 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/0 via-transparent to-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-5 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-[#161622] flex items-center justify-center border border-[#262636] transition-all duration-500 -rotate-3 group-hover:rotate-0 ${isConsultationFinished ? 'group-hover:border-mecura-neon/30 group-hover:bg-mecura-neon/10' : ''}`}>
                <MessageCircle className={`w-5 h-5 text-white transition-colors ${isConsultationFinished ? 'group-hover:text-mecura-neon' : ''}`} />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className={`font-bold text-white transition-colors text-[16px] leading-tight ${isConsultationFinished ? 'group-hover:text-mecura-neon' : ''}`}>Falar com a Equipe Médica</span>
                <span className="text-[12px] text-[#8A8A9E] mt-0.5">Tire dúvidas sobre seu tratamento</span>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-[#6A6A7E] transition-colors relative z-10 ${isConsultationFinished ? 'group-hover:text-mecura-neon' : ''}`} />
          </motion.button>

          {/* 6. Iniciar Nova Consulta / Retornar à Fila */}
          {inQueue ? (
            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/queue')}
              className="w-full bg-gradient-to-r from-mecura-neon/10 to-[#162216] border border-mecura-neon/50 hover:border-mecura-neon hover:shadow-[0_0_25px_rgba(166,255,0,0.15)] transition-all duration-300 rounded-[24px] p-5 flex items-center justify-between group shadow-lg relative overflow-hidden animate-pulse"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-mecura-neon" />
              <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/0 via-mecura-neon/10 to-mecura-neon/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-mecura-neon/20 flex items-center justify-center border border-mecura-neon/40 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0">
                  <Flame className="w-5 h-5 text-mecura-neon" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-mecura-neon text-[17px]">Retornar à Fila</span>
                  <span className="text-[12px] text-mecura-neon/70 mt-0.5">O médico está te aguardando</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-mecura-neon group-hover:translate-x-1 transition-transform relative z-10" />
            </motion.button>
          ) : (
            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedOffer('basic');
                navigate('/checkout');
              }}
              className="w-full bg-gradient-to-r from-[#1A2E1A]/60 to-[#162216] border border-mecura-neon/30 hover:border-mecura-neon hover:shadow-[0_0_25px_rgba(166,255,0,0.15)] transition-all duration-300 rounded-[24px] p-5 flex items-center justify-between group shadow-lg relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-mecura-neon" />
              <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/0 via-mecura-neon/5 to-mecura-neon/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-mecura-neon/20 flex items-center justify-center border border-mecura-neon/40 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0">
                  <Stethoscope className="w-5 h-5 text-mecura-neon" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-mecura-neon text-[17px]">Iniciar Nova Consulta</span>
                  <span className="text-[12px] text-mecura-neon/70 mt-0.5">Avaliação médica especializada</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-mecura-neon group-hover:translate-x-1 transition-transform relative z-10" />
            </motion.button>
          )}
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            variants={itemVariants}
            whileHover={isConsultationFinished ? { scale: 1.05 } : {}}
            whileTap={isConsultationFinished ? { scale: 0.95 } : {}}
            onClick={() => {
              if (isConsultationFinished) {
                navigate('/protocol');
              } else {
                alert('Seu protocolo estará disponível após a prescrição médica.');
              }
            }}
            className={`bg-gradient-to-b from-[#161622] to-[#1A1A26] border border-[#262636] transition-all duration-300 rounded-[28px] p-6 flex flex-col items-center justify-center gap-4 group relative overflow-hidden ${isConsultationFinished ? 'hover:border-mecura-neon/40 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-mecura-neon/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`w-16 h-16 rounded-2xl bg-mecura-neon/5 border border-mecura-neon/10 flex items-center justify-center transition-all duration-300 shadow-inner -rotate-3 ${isConsultationFinished ? 'group-hover:scale-110 group-hover:bg-mecura-neon/10 group-hover:rotate-0' : ''}`}>
              <Droplets className="w-7 h-7 text-mecura-neon" />
            </div>
            <span className={`font-bold text-white transition-colors text-[15px] text-center leading-tight ${isConsultationFinished ? 'group-hover:text-mecura-neon' : ''}`}>Meu<br/>Protocolo</span>
          </motion.button>

          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/history')}
            className="bg-gradient-to-b from-[#161622] to-[#1A1A26] border border-[#262636] hover:border-mecura-neon/40 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)] transition-all duration-300 rounded-[28px] p-6 flex flex-col items-center justify-center gap-4 group relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-mecura-neon/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-2xl bg-mecura-neon/5 border border-mecura-neon/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-mecura-neon/10 transition-all duration-300 shadow-inner rotate-3 group-hover:rotate-0">
              <History className="w-7 h-7 text-mecura-neon" />
            </div>
            <span className="font-bold text-white group-hover:text-mecura-neon transition-colors text-[15px] text-center leading-tight">Minhas<br/>Consultas</span>
          </motion.button>
        </div>

        {/* Referral Banner */}
        <motion.div 
          onClick={() => setShowReferralModal(true)}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-center gap-3 pt-6 pb-2 cursor-pointer group"
        >
          <Gift className="w-5 h-5 text-mecura-neon group-hover:scale-110 transition-transform duration-300" />
          <span className="text-[#8A8A9E] font-medium text-[15px] group-hover:text-white transition-colors">
            Indique um amigo e ganhe <span className="text-mecura-neon font-bold">R$ 50</span>
          </span>
        </motion.div>

        {/* Bottom Icons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <motion.button 
            variants={itemVariants}
            whileHover={isConsultationFinished ? { scale: 1.02 } : {}}
            whileTap={isConsultationFinished ? { scale: 0.98 } : {}}
            onClick={() => {
              if (isConsultationFinished) {
                navigate('/prescription-view');
              } else {
                alert('Suas receitas estarão disponíveis após a prescrição médica.');
              }
            }}
            className={`flex flex-col items-start gap-3 p-5 rounded-[24px] bg-gradient-to-br from-[#161622] to-[#1A1A26] border border-[#262636] transition-all duration-300 group relative overflow-hidden ${isConsultationFinished ? 'hover:border-mecura-neon/50 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-mecura-neon/5 rounded-full blur-2xl group-hover:bg-mecura-neon/10 transition-colors" />
            <div className={`w-12 h-12 rounded-2xl bg-[#1F1F2E] flex items-center justify-center border border-[#262636] transition-all duration-300 relative z-10 ${isConsultationFinished ? 'group-hover:border-mecura-neon/30 group-hover:bg-mecura-neon/10' : ''}`}>
              <FileText className={`w-6 h-6 text-mecura-neon transition-transform ${isConsultationFinished ? 'group-hover:scale-110' : ''}`} />
            </div>
            <div className="text-left relative z-10">
              <span className={`text-[15px] font-bold text-white transition-colors block ${isConsultationFinished ? 'group-hover:text-mecura-neon' : ''}`}>Receitas</span>
              <span className="text-[11px] text-[#8A8A9E] mt-1 block">Ver documentos</span>
            </div>
          </motion.button>

          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/anvisa')}
            className="flex flex-col items-start gap-3 p-5 rounded-[24px] bg-gradient-to-br from-[#161622] to-[#1A1A26] border border-[#262636] hover:border-mecura-neon/50 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-mecura-neon/5 rounded-full blur-2xl group-hover:bg-mecura-neon/10 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-[#1F1F2E] flex items-center justify-center border border-[#262636] group-hover:border-mecura-neon/30 group-hover:bg-mecura-neon/10 transition-all duration-300 relative z-10">
              <ShieldCheck className="w-6 h-6 text-mecura-neon group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left relative z-10">
              <span className="text-[15px] font-bold text-white group-hover:text-mecura-neon transition-colors block">Doc. Anvisa</span>
              <span className="text-[11px] text-[#8A8A9E] mt-1 block">Autorização</span>
            </div>
          </motion.button>

          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tracking')}
            className="flex flex-col items-start gap-3 p-5 rounded-[24px] bg-gradient-to-br from-[#161622] to-[#1A1A26] border border-[#262636] hover:border-mecura-neon/50 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-mecura-neon/5 rounded-full blur-2xl group-hover:bg-mecura-neon/10 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-[#1F1F2E] flex items-center justify-center border border-[#262636] group-hover:border-mecura-neon/30 group-hover:bg-mecura-neon/10 transition-all duration-300 relative z-10">
              <Package className="w-6 h-6 text-mecura-neon group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left relative z-10">
              <span className="text-[15px] font-bold text-white group-hover:text-mecura-neon transition-colors block">Rastreio</span>
              <span className="text-[11px] text-[#8A8A9E] mt-1 block">Acompanhar pedido</span>
            </div>
          </motion.button>

          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('Em breve!')}
            className="flex flex-col items-start gap-3 p-5 rounded-[24px] bg-gradient-to-br from-[#161622] to-[#1A1A26] border border-[#262636] hover:border-mecura-neon/50 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-mecura-neon/5 rounded-full blur-2xl group-hover:bg-mecura-neon/10 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-[#1F1F2E] flex items-center justify-center border border-[#262636] group-hover:border-mecura-neon/30 group-hover:bg-mecura-neon/10 transition-all duration-300 relative z-10">
              <div className="relative">
                <Bell className="w-6 h-6 text-mecura-neon group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1F1F2E]" />
              </div>
            </div>
            <div className="text-left relative z-10">
              <span className="text-[15px] font-bold text-white group-hover:text-mecura-neon transition-colors block">Lembretes</span>
              <span className="text-[11px] text-[#8A8A9E] mt-1 block">Alertas de uso</span>
            </div>
          </motion.button>
        </div>
      </motion.div>
      <AdvisorChatWidget />
      
      <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />
    </div>
  );
}
