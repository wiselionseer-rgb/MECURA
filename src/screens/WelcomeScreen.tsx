import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ShieldCheck, MessageSquare, FileText, Package, Activity, ChevronRight, Sparkles, User, Settings, Stethoscope, Brain, Sprout, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAdminStore } from '../store/useAdminStore';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { INSTITUTIONAL_INFO } from '../data/legalAndPrivacy';
import { StrategicToolsModal, StrategicToolType } from '../components/tools/StrategicToolsModal';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [videoFailed, setVideoFailed] = useState(false);
  const { hasCompletedOnboarding, reset } = useStore();
  const { doctors } = useAdminStore();
  
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'doctor' | 'psychologist' | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Strategic Tools Modal State (TDAH, Autismo, Calculadora HC)
  const [strategicToolOpen, setStrategicToolOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<StrategicToolType>('tdah');

  const handleOpenTool = (tool: StrategicToolType) => {
    setSelectedTool(tool);
    setStrategicToolOpen(true);
  };

  useEffect(() => {
    // Auto redirect to dashboard only if user is logged in and did not explicitly log out
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (typeof window !== 'undefined' && localStorage.getItem('mecura_logged_out') === 'true') {
        if (!user) {
          localStorage.removeItem('mecura_logged_out');
        }
        return;
      }
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
    const cleanPwd = password.trim();
    if (loginType === 'admin') {
      if (cleanPwd === 'jesus102030@' || cleanPwd === 'Jesus102030@' || cleanPwd.toLowerCase() === 'jesus102030@') {
        setShowProfessionalModal(false);
        navigate('/admin');
      } else {
        setLoginError('Senha incorreta.');
      }
    } else if (loginType === 'doctor') {
      // Check if any doctor has this password or matches the medical master password jesus102030@
      const doctor = doctors.find(d => d.password === cleanPwd || d.password?.toLowerCase() === cleanPwd.toLowerCase());
      if (doctor || cleanPwd === 'jesus102030@' || cleanPwd === 'Jesus102030@' || cleanPwd.toLowerCase() === 'jesus102030@') {
        setShowProfessionalModal(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('mecura_role', 'doctor');
        }
        navigate('/doctor');
      } else {
        setLoginError('Senha incorreta.');
      }
    } else if (loginType === 'psychologist') {
      // Psychologist login for Marco Antônio Boastik CRP 08/49215
      if (cleanPwd === 'jesus102030@' || cleanPwd === 'Jesus102030@' || cleanPwd.toLowerCase() === 'jesus102030@' || cleanPwd === 'psico102030@') {
        setShowProfessionalModal(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('mecura_role', 'psychologist');
        }
        navigate('/psychologist');
      } else {
        setLoginError('Senha incorreta.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full relative bg-[#060D08] overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 right-0 px-5 sm:px-6 py-5 z-30 flex justify-between items-center"
      >
        <div className="flex items-center gap-2.5">
          {step === 2 ? (
            <button 
              onClick={handleBack}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md text-white hover:bg-black/80 border border-white/10 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 pr-0.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold tracking-[0.2em] text-white/90 uppercase font-sans">MECURA</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button 
            onClick={() => navigate('/legal')}
            className="text-[11px] font-medium text-white/60 hover:text-white transition-colors uppercase tracking-wider cursor-pointer px-1.5 py-1"
          >
            Jurídico
          </button>
          <span className="text-white/20 text-xs font-light">·</span>
          <button 
            onClick={() => {
              setShowProfessionalModal(true);
              setLoginType(null);
              setPassword('');
              setLoginError('');
            }}
            className="text-[11px] font-medium text-white/60 hover:text-white transition-colors uppercase tracking-wider cursor-pointer px-1.5 py-1"
          >
            Acesso Restrito
          </button>
          <button 
            onClick={() => window.open(`https://wa.me/${INSTITUTIONAL_INFO.supportWhatsapp}`, '_blank')}
            className="px-3 py-1 text-[11px] font-bold text-[#0A0A0F] bg-[#A6FF00] hover:bg-[#CFFF5A] rounded-full cursor-pointer transition-all ml-1 shadow-[0_0_12px_rgba(166,255,0,0.35)]"
          >
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
            exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Full Screen Background Video & Animated Large Panning Image */}
            <div className="absolute inset-0 z-0 bg-black overflow-hidden">
              <motion.img 
                src="/welcome-bg-poster.jpg" 
                className="absolute inset-0 w-[145%] h-[115%] -left-[22%] -top-[7%] max-w-none object-cover z-0 opacity-90 scale-110" 
                animate={{ x: ['0%', '-18%', '0%'] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                alt="" 
              />
              {!videoFailed && (
                <motion.video
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
                  src="/0820-ezgif.com-video-compressor.mp4"
                  className="absolute inset-0 w-[145%] h-[115%] -left-[22%] -top-[7%] max-w-none object-cover opacity-90 pointer-events-none z-10 scale-110"
                  animate={{ x: ['0%', '-18%', '0%'] }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              
              {/* Soft Gradient Overlay - clear center so video dropper bottle is fully visible */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-[#000000]/95 z-20 pointer-events-none" />
            </div>

            {/* Content Container */}
            <div className={`relative z-10 flex-1 flex flex-col px-5 sm:px-6 ${hasCompletedOnboarding ? 'pb-40' : 'pb-32'} overflow-y-auto overflow-x-hidden pt-20 justify-end`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl mx-auto w-full backdrop-blur-[2px]"
              >
                {/* Hero Title */}
                <h1 className="text-[34px] sm:text-[40px] font-serif font-normal text-white mb-2 leading-[1.1] tracking-tight">
                  A pureza da <span className="italic text-[#A6FF00] font-serif">natureza</span>,<br />
                  guiada pela <span className="font-semibold text-white">ciência.</span>
                </h1>
                
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-6 font-normal max-w-md">
                  Tratamentos personalizados com Cannabis Medicinal para saúde, foco e qualidade de vida.
                </p>

                {/* 3 Strategic Interactive Buttons (Clean, Luxurious, Minimalist) */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <span className="text-[10px] font-bold text-[#A6FF00] uppercase tracking-[0.2em]">
                      Testes & Ferramentas Interativas
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      Resultados em 1 min
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Tool 1: TDAH */}
                    <button
                      type="button"
                      onClick={() => handleOpenTool('tdah')}
                      className="group rounded-2xl p-3 text-left bg-black/40 hover:bg-emerald-950/30 border border-white/10 hover:border-sky-400/40 backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[96px]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-300">
                          <Brain className="w-3.5 h-3.5" />
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div className="mt-2">
                        <span className="text-xs font-bold text-white block tracking-tight">
                          Teste TDAH
                        </span>
                        <span className="text-[10px] text-white/50 block font-normal">
                          Foco & Atenção
                        </span>
                      </div>
                    </button>

                    {/* Tool 2: Autismo (TEA) */}
                    <button
                      type="button"
                      onClick={() => handleOpenTool('autism')}
                      className="group rounded-2xl p-3 text-left bg-black/40 hover:bg-emerald-950/30 border border-white/10 hover:border-purple-400/40 backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[96px]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div className="mt-2">
                        <span className="text-xs font-bold text-white block tracking-tight">
                          Teste Autismo
                        </span>
                        <span className="text-[10px] text-white/50 block font-normal">
                          Espectro TEA
                        </span>
                      </div>
                    </button>

                    {/* Tool 3: Calculadora HC */}
                    <button
                      type="button"
                      onClick={() => handleOpenTool('hc')}
                      className="group rounded-2xl p-3 text-left bg-black/40 hover:bg-emerald-950/30 border border-white/10 hover:border-emerald-400/40 backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[96px]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
                          <Sprout className="w-3.5 h-3.5" />
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div className="mt-2">
                        <span className="text-xs font-bold text-white block tracking-tight">
                          Plantas p/ HC
                        </span>
                        <span className="text-[10px] text-white/50 block font-normal">
                          Calculadora
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Minimalist Trust Line */}
                <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-white/50 font-medium tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>100% Legalizado pela ANVISA</span>
                  <span className="text-white/20">•</span>
                  <span>Diretrizes LGPD & CFM</span>
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
            className="absolute inset-0 flex flex-col px-5 sm:px-6 pt-20 pb-44 overflow-y-auto overflow-x-hidden bg-[#000000]"
          >
            {/* Background Radial Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-[250px] bg-mecura-neon/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Large Prominent Clinical Team Card (Corpo Clínico Integrado) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#0D140E] via-[#080D0A] to-[#000000] border-2 border-mecura-neon/40 rounded-3xl p-4 sm:p-5 mb-6 shadow-[0_15px_45px_rgba(0,0,0,0.9),0_0_30px_rgba(166,255,0,0.15)] relative overflow-hidden shrink-0"
            >
              {/* Header Title */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-mecura-neon animate-ping" />
                  <h3 className="text-white font-extrabold text-base sm:text-lg tracking-tight">
                    Corpo Clínico Integrado
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(166,255,0,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-mecura-neon" />
                  Ativo Agora
                </span>
              </div>

              <p className="text-xs text-white/70 mb-3.5 leading-relaxed font-normal relative z-10">
                Especialistas em Medicina Canábica prontos para o seu atendimento:
              </p>

              {/* Infinite Continuous Horizontal Motion Marquee (Dr. Guilherme & Marco Antônio) */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-2.5">
                <motion.div 
                  className="flex gap-3 w-max"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                >
                  {/* Item 1: Dr. Guilherme */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-[#121E15] to-[#0A120C] border border-mecura-neon/50 rounded-2xl p-2.5 w-[230px] sm:w-[250px] shrink-0 shadow-lg relative overflow-hidden group">
                    <div className="relative shrink-0">
                      <div className="w-18 h-24 sm:w-20 sm:h-26 rounded-xl overflow-hidden border-2 border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.3)] bg-[#050806]">
                        <img 
                          src="/doctor-avatar.png" 
                          alt="Dr. Guilherme - Médico" 
                          className="w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-mecura-neon rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_8px_rgba(166,255,0,0.8)]">
                        <span className="w-1 h-1 rounded-full bg-black" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-mecura-neon block mb-0.5">
                        Médico Prescritor
                      </span>
                      <h4 className="text-white font-bold text-sm leading-tight truncate">
                        Dr. Guilherme
                      </h4>
                      <p className="text-[10px] text-white/60 font-medium mt-0.5">
                        CRM Medicina
                      </p>
                      <p className="text-[9px] text-mecura-neon font-bold mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-mecura-neon inline-block animate-pulse" />
                        Atendimento
                      </p>
                    </div>
                  </div>

                  {/* Item 2: Marco Antônio */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-[#1B1428] to-[#0F0B18] border border-purple-400/50 rounded-2xl p-2.5 w-[230px] sm:w-[250px] shrink-0 shadow-lg relative overflow-hidden group">
                    <div className="relative shrink-0">
                      <div className="w-18 h-24 sm:w-20 sm:h-26 rounded-xl overflow-hidden border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-[#0A0812]">
                        <img 
                          src="/pscologo.jpeg" 
                          alt="Marco Antônio - Psicólogo" 
                          className="w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-purple-400 rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                        <span className="w-1 h-1 rounded-full bg-black" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-purple-300 block mb-0.5">
                        Psicólogo Clínico
                      </span>
                      <h4 className="text-white font-bold text-sm leading-tight truncate">
                        Marco Antônio
                      </h4>
                      <p className="text-[10px] text-white/60 font-medium mt-0.5">
                        CRP Psicologia
                      </p>
                      <p className="text-[9px] text-purple-300 font-bold mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block animate-pulse" />
                        Atendimento
                      </p>
                    </div>
                  </div>

                  {/* Item 3: Duplicate Dr. Guilherme (for seamless loop) */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-[#121E15] to-[#0A120C] border border-mecura-neon/50 rounded-2xl p-2.5 w-[230px] sm:w-[250px] shrink-0 shadow-lg relative overflow-hidden group">
                    <div className="relative shrink-0">
                      <div className="w-18 h-24 sm:w-20 sm:h-26 rounded-xl overflow-hidden border-2 border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.3)] bg-[#050806]">
                        <img 
                          src="/doctor-avatar.png" 
                          alt="Dr. Guilherme - Médico" 
                          className="w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-mecura-neon rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_8px_rgba(166,255,0,0.8)]">
                        <span className="w-1 h-1 rounded-full bg-black" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-mecura-neon block mb-0.5">
                        Médico Prescritor
                      </span>
                      <h4 className="text-white font-bold text-sm leading-tight truncate">
                        Dr. Guilherme
                      </h4>
                      <p className="text-[10px] text-white/60 font-medium mt-0.5">
                        CRM Medicina
                      </p>
                      <p className="text-[9px] text-mecura-neon font-bold mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-mecura-neon inline-block animate-pulse" />
                        Atendimento
                      </p>
                    </div>
                  </div>

                  {/* Item 4: Duplicate Marco Antônio (for seamless loop) */}
                  <div className="flex items-center gap-3 bg-gradient-to-r from-[#1B1428] to-[#0F0B18] border border-purple-400/50 rounded-2xl p-2.5 w-[230px] sm:w-[250px] shrink-0 shadow-lg relative overflow-hidden group">
                    <div className="relative shrink-0">
                      <div className="w-18 h-24 sm:w-20 sm:h-26 rounded-xl overflow-hidden border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-[#0A0812]">
                        <img 
                          src="/pscologo.jpeg" 
                          alt="Marco Antônio - Psicólogo" 
                          className="w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-purple-400 rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                        <span className="w-1 h-1 rounded-full bg-black" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-purple-300 block mb-0.5">
                        Psicólogo Clínico
                      </span>
                      <h4 className="text-white font-bold text-sm leading-tight truncate">
                        Marco Antônio
                      </h4>
                      <p className="text-[10px] text-white/60 font-medium mt-0.5">
                        CRP Psicologia
                      </p>
                      <p className="text-[9px] text-purple-300 font-bold mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block animate-pulse" />
                        Atendimento
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6 shrink-0"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-mecura-neon block mb-1">
                Jornada Descomplicada
              </span>
              <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-white leading-tight tracking-tight">
                Seu atendimento em <span className="text-mecura-neon">4 passos simples</span>
              </h2>
            </motion.div>

            {/* Step Cards Horizontal Carousel */}
            <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory hide-scrollbar -mx-5 px-5 shrink-0">
              {[
                { icon: Activity, title: '01. Avaliação Inicial', desc: 'Definição do seu objetivo e dos seus sintomas de forma rápida, guiada e segura.', active: true, step: '01' },
                { icon: MessageSquare, title: '02. Consulta via Chat', desc: 'Fale com o médico especialista sem precisar agendar horário e tire dúvidas.', active: false, step: '02' },
                { icon: FileText, title: '03. Receita Médica', desc: 'Receba a prescrição médica digital para solicitar os produtos autorizados.', active: false, step: '03' },
                { icon: Package, title: '04. Entrega em Casa', desc: 'Acompanhe o envio até que os produtos cheguem diretamente à sua porta.', active: false, step: '04' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.08), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex-shrink-0 w-[260px] sm:w-[280px] backdrop-blur-xl border rounded-2xl p-5 relative snap-start flex flex-col justify-between overflow-hidden ${
                    item.active 
                      ? 'bg-gradient-to-br from-[#1B1B2C] via-[#141422] to-[#0A0A10] border-mecura-neon/40 shadow-[0_12px_35px_rgba(0,0,0,0.5),0_0_20px_rgba(166,255,0,0.1)]' 
                      : 'bg-gradient-to-br from-[#141420] to-[#0C0C14] border-white/10 shadow-lg'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        item.active 
                          ? 'bg-mecura-neon/15 border border-mecura-neon/40 text-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.2)]' 
                          : 'bg-white/5 border border-white/10 text-mecura-silver'
                      }`}>
                        <item.icon strokeWidth={2} className="w-5 h-5" />
                      </div>
                      
                      {/* Zero-Pill Editorial Number */}
                      <span className={`text-xl font-black font-mono tracking-tighter ${
                        item.active ? 'text-mecura-neon' : 'text-white/30'
                      }`}>
                        {item.step}
                      </span>
                    </div>

                    <h4 className="font-bold text-lg text-white mb-2 tracking-tight leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-mecura-silver leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-mecura-silver">
                    <span>Etapa {idx + 1} de 4</span>
                    <span className={item.active ? 'text-mecura-neon font-bold' : 'text-white/40'}>
                      {item.active ? 'Comece Agora →' : 'Próximo'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Carousel Step Indicators */}
            <div className="flex items-center justify-center gap-1.5 pt-2 pb-3 shrink-0">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === 0 ? 'w-6 bg-mecura-neon' : 'w-1.5 bg-white/20'
                  }`} 
                />
              ))}
            </div>

            {/* Strategic Quick-Access Tools in Step 2 */}
            <div className="mt-1 shrink-0">
              <span className="text-[10px] font-bold text-mecura-silver uppercase tracking-widest block mb-2">
                Testes Clínicos & Calculadora HC
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenTool('tdah')}
                  className="p-2.5 rounded-xl bg-[#131B2E]/90 border border-sky-400/30 hover:border-sky-400 text-left transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Brain className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white truncate">Teste TDAH</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenTool('autism')}
                  className="p-2.5 rounded-xl bg-[#1F1430]/90 border border-purple-400/30 hover:border-purple-400 text-left transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white truncate">Teste Autismo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenTool('hc')}
                  className="p-2.5 rounded-xl bg-[#13261A]/90 border border-mecura-neon/35 hover:border-mecura-neon text-left transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sprout className="w-4 h-4 text-mecura-neon shrink-0" />
                  <span className="text-[11px] font-bold text-white truncate">Plantas HC</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Footer Button */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-40 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-6 pb-4 flex flex-col gap-2.5 backdrop-blur-[1px]"
      >
        <Button 
          className="w-full h-14 text-base sm:text-lg font-black shadow-[0_10px_35px_rgba(166,255,0,0.5)] hover:shadow-[0_15px_45px_rgba(166,255,0,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 rounded-2xl group relative overflow-hidden bg-gradient-to-r from-[#A6FF00] via-[#86FF00] to-[#A6FF00] text-[#0A0A0F] border border-[#CFFF5A] cursor-pointer" 
          onClick={handleNext}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {step === 1 ? 'Iniciar Minha Jornada' : 'Começar Avaliação'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
        
        {hasCompletedOnboarding && step === 1 && (
          <Button 
            variant="outline"
            className="w-full h-12 text-sm font-bold border-white/10 text-white hover:bg-white/5 transition-all duration-300 rounded-xl bg-[#161622]/60 backdrop-blur-md" 
            onClick={() => navigate('/dashboard')}
          >
            <User className="w-4 h-4 mr-2 text-mecura-neon" />
            Acessar Área do Paciente
          </Button>
        )}

        <p className="text-[10px] text-center text-[#8A8A9E]/80 font-sans tracking-wide">
          {INSTITUTIONAL_INFO.companyName} <span className="text-white/30">·</span> CNPJ {INSTITUTIONAL_INFO.cnpj} <span className="text-white/30">·</span>{' '}
          <button 
            type="button" 
            onClick={() => navigate('/legal')} 
            className="text-[#8A8A9E] hover:text-white underline cursor-pointer"
          >
            Termos & Privacidade (LGPD)
          </button>
        </p>
      </motion.div>

      {/* Strategic Interactive Tools Modal (TDAH, Autismo, Calculadora HC) */}
      <StrategicToolsModal
        isOpen={strategicToolOpen}
        initialTool={selectedTool}
        onClose={() => setStrategicToolOpen(false)}
      />

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
              className="bg-[#060D08] border border-white/10 rounded-[32px] p-8 w-full max-w-md relative shadow-2xl"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setLoginType('admin')}
                    className="flex flex-col items-center justify-center gap-3 bg-[#0A0A0F] border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-mecura-neon/30 hover:bg-mecura-neon/5 transition-all duration-300 group shadow-lg cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#161622] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Settings className="w-5 h-5 text-mecura-neon" />
                    </div>
                    <span className="text-white font-medium text-xs sm:text-sm tracking-wide text-center">Administração</span>
                  </button>

                  <button
                    onClick={() => setLoginType('doctor')}
                    className="flex flex-col items-center justify-center gap-3 bg-[#0A0A0F] border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-mecura-neon/30 hover:bg-mecura-neon/5 transition-all duration-300 group shadow-lg cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#161622] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Stethoscope className="w-5 h-5 text-mecura-neon" />
                    </div>
                    <span className="text-white font-medium text-xs sm:text-sm tracking-wide text-center">Área Médica</span>
                  </button>

                  <button
                    onClick={() => setLoginType('psychologist')}
                    className="flex flex-col items-center justify-center gap-3 bg-[#0A0A0F] border border-purple-500/20 rounded-2xl p-4 sm:p-5 hover:border-purple-400/40 hover:bg-purple-500/10 transition-all duration-300 group shadow-lg cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#161622] border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-white font-medium text-xs sm:text-sm tracking-wide text-center">Área do Psicólogo</span>
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
                      {loginType === 'admin' 
                        ? 'Administrador' 
                        : (loginType === 'psychologist' ? 'Psicólogo • Marco Antônio' : 'Médico • Dr. Guilherme')}
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

