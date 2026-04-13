import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { auth } from '../firebase';
import { motion } from 'motion/react';
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
  Sparkles
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
  const { userName, setSelectedOffer, scheduledConsultation, consultationStatus, pagamento_consulta, pagamento_premium, isConsultationFinished, resetConsultation } = useStore();
  const [showPremiumDetails, setShowPremiumDetails] = useState(false);

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
        ) : pagamento_consulta ? (
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
              className="w-full bg-gradient-to-r from-[#1A1A26] to-[#12121A] border border-[#D4AF37]/30 rounded-[24px] p-5 flex flex-col gap-4 shadow-lg relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/40 flex-shrink-0">
                  <Rocket className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-1 block">Acompanhamento Premium</span>
                  <h3 className="text-[19px] font-bold text-white leading-tight">🚀 Dê o próximo passo!</h3>
                  <p className="text-[13px] text-[#8A8A9E] mt-2 leading-relaxed">
                    Estruture seu tratamento com segurança e profissionalismo. Tenha acesso a consultas personalizadas, laudo médico e acompanhamento contínuo.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 mt-2">
                {[
                  'Consulta individualizada',
                  'Laudo médico inicial',
                  'Retorno em 90 dias'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-mecura-neon flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0A0A0F]" />
                    </div>
                    <span className="text-[14px] font-medium text-white">{item}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowPremiumDetails(!showPremiumDetails)}
                className="flex items-center gap-1.5 text-mecura-neon text-sm font-bold mt-1 hover:opacity-80 transition-opacity"
              >
                {showPremiumDetails ? 'Ler menos' : 'Ler mais'} <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showPremiumDetails ? 'rotate-180' : ''}`} />
              </button>

              {showPremiumDetails && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 bg-[#0A0A0F]/40 p-4 rounded-2xl border border-[#262636]"
                >
                  <p className="text-[13px] text-[#8A8A9E] leading-relaxed">
                    Você já deu o primeiro passo. Agora é hora de avançar no tratamento.
                  </p>
                  <p className="text-[13px] text-[#8A8A9E] leading-relaxed">
                    Queremos te oferecer um acompanhamento mais profundo e totalmente personalizado para o seu caso. Através de consultas por videochamada, vamos estruturar seu tratamento com segurança, desde o início até a evolução dos resultados. Com o seu laudo médico, você garante muito mais do que um documento — você conquista um documento essencial para entrada em cultivos legais e comprova seu acesso seguro ao tratamento com cannabis medicinal no Brasil. Não pare na receita — sem o laudo, seu acesso ao tratamento fica limitado.
                  </p>
                  
                  <div className="space-y-2">
                    <span className="text-[13px] font-bold text-mecura-neon">Isso inclui:</span>
                    <ul className="space-y-2">
                      {[
                        'Possibilidade de acesso ao medicamento pelo SUS',
                        'Importação de produtos autorizados pela Anvisa',
                        'Base legal para solicitação de cultivo próprio (via judicial)'
                      ].map((li, idx) => (
                        <li key={idx} className="text-[12px] text-[#8A8A9E] flex items-start gap-2">
                          <span className="text-mecura-neon mt-1">•</span>
                          {li}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <p className="text-[12px] text-[#8A8A9E] italic border-t border-[#262636] pt-3">
                    Hoje, mais de 1.000 famílias já transformaram sua qualidade de vida com esse passo.
                  </p>
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedOffer('premium');
                  navigate('/premium-checkout');
                }}
                className="w-full bg-[#161622] border border-mecura-neon/40 rounded-2xl p-4 flex flex-col items-start gap-1 hover:bg-[#1A1A26] transition-colors group mt-2 shadow-[0_0_15px_rgba(166,255,0,0.05)]"
              >
                <span className="text-[11px] text-[#8A8A9E] font-bold uppercase tracking-wider">Teleconsulta completa:</span>
                <span className="text-2xl font-bold text-white group-hover:text-mecura-neon transition-colors">R$ 250,00</span>
              </motion.button>
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

          {/* 4. Mecura Store: Coleção Elite */}
          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('Em breve!')}
            className="w-full bg-[#0A0A0F] border border-[#262636] hover:border-mecura-neon/50 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)] transition-all duration-500 rounded-[24px] p-5 flex items-center justify-between group shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/0 via-transparent to-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#161622] flex items-center justify-center border border-[#262636] group-hover:border-mecura-neon/30 group-hover:scale-110 group-hover:bg-mecura-neon/10 transition-all duration-500 rotate-3 group-hover:rotate-0">
                <Store className="w-5 h-5 text-white group-hover:text-mecura-neon transition-colors" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-white group-hover:text-mecura-neon transition-colors text-[17px] leading-tight">Mecura Store: Coleção Elite</span>
                <span className="text-[12px] text-[#8A8A9E] mt-0.5">Artigos e acessórios exclusivos (Veja Agora)</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#6A6A7E] group-hover:text-mecura-neon transition-colors relative z-10" />
          </motion.button>

          {/* 5. Falar com a Equipe Médica */}
          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/chat')}
            className="w-full bg-[#0A0A0F] border border-[#262636] hover:border-mecura-neon/50 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)] transition-all duration-500 rounded-[24px] p-5 flex items-center justify-between group shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/0 via-transparent to-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#161622] flex items-center justify-center border border-[#262636] group-hover:border-mecura-neon/30 group-hover:scale-110 group-hover:bg-mecura-neon/10 transition-all duration-500 -rotate-3 group-hover:rotate-0">
                <MessageCircle className="w-5 h-5 text-white group-hover:text-mecura-neon transition-colors" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-white group-hover:text-mecura-neon transition-colors text-[16px] leading-tight">Falar com a Equipe Médica</span>
                <span className="text-[12px] text-[#8A8A9E] mt-0.5">Tire dúvidas sobre seu tratamento</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#6A6A7E] group-hover:text-mecura-neon transition-colors relative z-10" />
          </motion.button>

          {/* 6. Iniciar Nova Consulta */}
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
    </div>
  );
}
