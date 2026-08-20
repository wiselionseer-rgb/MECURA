import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ShieldCheck, MessageSquare, FileText, Package, Activity, ChevronRight, Sparkles, User, Settings, Stethoscope, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAdminStore } from '../store/useAdminStore';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { hasCompletedOnboarding, reset } = useStore();
  const { doctors } = useAdminStore();
  
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'doctor' | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Auto redirect to dashboard if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      reset();
      navigate('/onboarding');
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleLogin = () => {
    setLoginError('');
    if (loginType === 'admin') {
      if (password === 'Jesus102030@') {
        setShowProfessionalModal(false);
        navigate('/admin');
      } else {
        setLoginError('Senha incorreta.');
      }
    } else if (loginType === 'doctor') {
      // Check if any doctor has this password
      const doctor = doctors.find(d => d.password === password);
      if (doctor) {
        setShowProfessionalModal(false);
        navigate('/doctor');
      } else {
        setLoginError('Senha incorreta.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full relative bg-[#0A0A0F] overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-center"
      >
        <button 
          onClick={handleBack}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step === 2 ? 'bg-[#161622] border border-[#262636] text-white hover:bg-[#1A1A26] shadow-lg' : 'bg-black/20 backdrop-blur-md text-white hover:bg-black/40 border border-white/10 shadow-lg'}`}
          style={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? 'none' : 'auto' }}
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <div className="flex items-center gap-5">
          <button 
            onClick={() => {
              setShowProfessionalModal(true);
              setLoginType(null);
              setPassword('');
              setLoginError('');
            }}
            className="text-white/60 font-medium text-xs hover:text-white transition-colors tracking-wide uppercase"
          >
            Acesso Restrito
          </button>
          <button className="text-white/90 font-medium text-sm hover:text-mecura-neon transition-colors decoration-white/30 underline-offset-4">
            Suporte
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Full Screen Background Video */}
            <div className="absolute inset-0 z-0 bg-black">
              {/* Fallback Poster */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-80" 
                style={{ backgroundImage: 'url(/welcome-bg-poster.jpg)' }} 
              />
              {/* Video Element */}
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
                        el.style.display = 'none'; // Fallback to poster on failure
                      });
                    }
                  }
                }}
                src="/0820-ezgif.com-video-compressor.mp4" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-10"
              />
              
              {/* Elegant Gradient for Readability - No Green/Neon tint */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0F]/60 to-[#0A0A0F] z-20 pointer-events-none" />
            </div>

            {/* Content */}
            <div className={`relative z-10 flex-1 flex flex-col justify-end px-8 ${hasCompletedOnboarding ? 'pb-56' : 'pb-40'} overflow-y-auto pt-24`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2 bg-[#0A0A0F]/40 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md shadow-2xl">
                  <Sparkles className="w-3.5 h-3.5 text-mecura-neon" />
                  <span className="text-[10px] font-bold text-white/90 uppercase tracking-[0.25em]">Medicina do Futuro</span>
                </div>
                
                <h1 className="text-[48px] font-serif font-bold text-white mb-6 leading-[1.05] tracking-tight">
                  A pureza da <span className="text-mecura-neon italic font-light">natureza</span>,<br />
                  guiada pela <span className="text-white">ciência.</span>
                </h1>
                
                <p className="text-[#A0A0B0] text-lg leading-relaxed mb-12 max-w-[95%] font-light">
                  Reescreva sua relação com o bem-estar através de tratamentos personalizados com Cannabis Medicinal.
                </p>

                {/* Trust Badges */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#161622]/80 backdrop-blur-md border border-white/5 flex items-center justify-center shadow-xl">
                      <ShieldCheck className="w-6 h-6 text-mecura-neon" />
                    </div>
                    <span className="text-white text-sm font-bold tracking-wide">100%<br/><span className="text-[#8A8A9E] font-medium text-xs tracking-wider uppercase">Legalizado</span></span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#161622]/80 backdrop-blur-md border border-white/5 flex items-center justify-center shadow-xl">
                      <Activity className="w-6 h-6 text-mecura-neon" />
                    </div>
                    <span className="text-white text-sm font-bold tracking-wide">Eficácia<br/><span className="text-[#8A8A9E] font-medium text-xs tracking-wider uppercase">Comprovada</span></span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col px-6 pt-28 pb-36 overflow-y-auto overflow-x-hidden bg-[#0A0A0F]"
          >
            {/* Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] overflow-x-hidden h-[300px] bg-mecura-neon/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Doctor Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#161622]/80 backdrop-blur-md border border-white/5 rounded-[28px] p-5 flex items-center gap-5 mb-12 shadow-2xl relative overflow-hidden shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/10 to-transparent opacity-20" />
              <div className="relative z-10 shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop" 
                  alt="Médico Especialista" 
                  className="w-16 h-16 rounded-[20px] object-cover aspect-square border border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-mecura-neon rounded-full border-2 border-[#161622] shadow-[0_0_10px_rgba(166,255,0,0.5)]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-white font-bold text-xl tracking-tight">Corpo Clínico</h3>
                <p className="text-mecura-neon text-sm font-medium mt-1 tracking-wide">Especialistas de prontidão</p>
              </div>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-serif font-semibold text-white mb-12 leading-tight tracking-tight shrink-0"
            >
              Sua jornada de<br/>saúde em <span className="text-mecura-neon italic font-light">4 passos</span>
            </motion.h2>

            {/* Timeline Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 shrink-0">
              {[
                { icon: Activity, title: 'Avaliação Inicial', desc: 'Definição do seu objetivo e dos seus sintomas de forma rápida e segura.', active: true, step: '01' },
                { icon: MessageSquare, title: 'Consulta via Chat', desc: 'Fale com um médico especialista sem precisar agendar horário.', active: false, step: '02' },
                { icon: FileText, title: 'Prescrição Médica', desc: 'Se indicado, receba a receita e orientações para solicitar os produtos.', active: false, step: '03' },
                { icon: Package, title: 'Entrega em Casa', desc: 'Acompanhe a importação até que os produtos sejam entregues na sua porta.', active: false, step: '04' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex-shrink-0 min-h-[280px] w-[275px] backdrop-blur-xl border rounded-[28px] p-7 relative snap-center flex flex-col overflow-hidden ${
                    item.active 
                      ? 'bg-gradient-to-br from-white/[0.06] to-[#0A0A0F]/80 border-white/[0.15] shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]' 
                      : 'bg-[#12121A]/80 border-white/[0.04] shadow-[0_8px_20px_rgba(0,0,0,0.1)]'
                  }`}
                >
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  
                  {item.active && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-mecura-neon/15 blur-[40px] rounded-full pointer-events-none" />
                  )}

                  <div className="flex items-start justify-between mb-10 relative z-10">
                    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-500 ${
                      item.active 
                        ? 'bg-mecura-neon/10 border border-mecura-neon/30 shadow-[0_0_20px_rgba(166,255,0,0.15)]' 
                        : 'bg-white/[0.03] border border-white/[0.05]'
                    }`}>
                      <item.icon strokeWidth={1.5} className={`w-5 h-5 ${item.active ? 'text-mecura-neon' : 'text-[#8A8A9E]'}`} />
                    </div>
                    
                    {/* The elegant step badge replacing the confusing italic text */}
                    <div className={`px-3 py-1.5 rounded-full border ${
                      item.active 
                        ? 'bg-mecura-neon/10 border-mecura-neon/30 text-mecura-neon' 
                        : 'bg-white/5 border-white/10 text-[#8A8A9E]'
                    }`}>
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Passo {item.step}</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <h4 className={`font-serif font-bold text-[22px] mb-3 tracking-tight leading-tight ${item.active ? 'text-white' : 'text-white/80'}`}>{item.title}</h4>
                    <p className={`text-[14px] leading-relaxed font-light ${item.active ? 'text-[#B0B0C0]' : 'text-[#8A8A9E]'}`}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Footer Button */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent pt-24 pb-10 flex flex-col gap-4"
      >
        <Button 
          className="w-full h-[64px] text-lg font-bold shadow-[0_0_40px_rgba(166,255,0,0.15)] hover:shadow-[0_0_60px_rgba(166,255,0,0.3)] transition-all duration-500 rounded-full group relative overflow-hidden bg-mecura-neon text-black" 
          onClick={handleNext}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {step === 1 ? 'Iniciar Minha Jornada' : 'Começar Avaliação'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
        
        {hasCompletedOnboarding && step === 1 && (
          <Button 
            variant="outline"
            className="w-full h-[56px] text-[15px] font-bold border-white/10 text-white hover:bg-white/5 transition-all duration-300 rounded-full bg-[#161622]/50 backdrop-blur-md" 
            onClick={() => navigate('/dashboard')}
          >
            <User className="w-5 h-5 mr-2 text-mecura-neon" />
            Acessar Área do Paciente
          </Button>
        )}
      </motion.div>

      {/* Professional Login Modal */}
      <AnimatePresence>
        {showProfessionalModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#161622] border border-white/10 rounded-[32px] p-8 w-full max-w-md relative shadow-2xl"
            >
              <button 
                onClick={() => setShowProfessionalModal(false)}
                className="absolute top-6 right-6 text-[#8A8A9E] hover:text-white transition-colors bg-white/5 w-10 h-10 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-3xl font-serif font-bold text-white mb-8 text-center tracking-tight">
                Acesso <span className="text-mecura-neon italic font-light">Restrito</span>
              </h2>

              {!loginType ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setLoginType('admin')}
                    className="flex flex-col items-center justify-center gap-4 bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 hover:border-mecura-neon/30 hover:bg-mecura-neon/5 transition-all duration-300 group shadow-lg"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#161622] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Settings className="w-6 h-6 text-mecura-neon" />
                    </div>
                    <span className="text-white font-medium tracking-wide">Administração</span>
                  </button>

                  <button
                    onClick={() => setLoginType('doctor')}
                    className="flex flex-col items-center justify-center gap-4 bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 hover:border-mecura-neon/30 hover:bg-mecura-neon/5 transition-all duration-300 group shadow-lg"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#161622] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Stethoscope className="w-6 h-6 text-mecura-neon" />
                    </div>
                    <span className="text-white font-medium tracking-wide">Área Médica</span>
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <button 
                      onClick={() => {
                        setLoginType(null);
                        setPassword('');
                        setLoginError('');
                      }}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8A8A9E] hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 pr-0.5" />
                    </button>
                    <h3 className="text-xl font-medium text-white tracking-wide">
                      {loginType === 'admin' ? 'Administrador' : 'Médico Especialista'}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8A8A9E] mb-3 tracking-wide uppercase">
                      Senha de Acesso
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded-2xl px-5 py-4 text-white text-lg focus:outline-none focus:border-mecura-neon/50 transition-colors shadow-inner"
                      placeholder="••••••••"
                      autoFocus
                    />
                    {loginError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mt-3 font-medium">{loginError}</motion.p>
                    )}
                  </div>

                  <Button 
                    className="w-full h-14 mt-6 text-lg rounded-xl bg-white text-black hover:bg-white/90"
                    onClick={handleLogin}
                    disabled={!password}
                  >
                    Entrar no Sistema
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

