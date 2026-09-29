import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Hexagon, Bell, Clock, CheckCircle2, Phone, Edit2, ShieldCheck, Sparkles, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { requestNotificationPermission, showNativeNotification } from '../utils/notifications';
import { playNotificationSound } from '../utils/sound';
import { auth } from '../firebase';

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.182-.076.355.101.173.45 1.085 1.276 1.821.65.579 1.199.759 1.372.845.173.086.274.072.375-.044.101-.116.433-.505.549-.679.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
  </svg>
);

export function QueueScreen() {
  const navigate = useNavigate();
  const { 
    queuePosition, 
    estimatedWaitTime, 
    updateQueue, 
    startConsultation, 
    pagamento_consulta, 
    consultationActive, 
    subscribeToQueue,
    userPhone,
    setUserPhone,
    userName,
    pagamento_premium,
    selectedOffer,
    patientId,
    queue
  } = useStore();
  
  // Find if current user has an entry in Firestore queue
  const currentUserId = auth.currentUser?.uid || patientId || (typeof window !== 'undefined' ? localStorage.getItem('mecura_patientId') : '') || '';
  const myQueueEntry = queue.find(p => 
    (currentUserId && p.id === currentUserId) ||
    (userPhone && p.phone && p.phone.replace(/\D/g, '') === userPhone.replace(/\D/g, '') && userPhone.length >= 8)
  );

  const isVip = pagamento_premium || selectedOffer === 'premium' || myQueueEntry?.isPremium || myQueueEntry?.plan === 'premium';

  // Dynamic realistic queue position initialization
  const [displayPosition, setDisplayPosition] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mecura_queue_display_pos');
      if (saved) {
        const val = parseInt(saved, 10);
        // Valid if within realistic range (1 to 15), if stuck at 49 or invalid, regenerate
        if (!isNaN(val) && val >= 1 && val <= 15) return val;
      }
    }
    // Generate organic random initial position
    const initialPos = isVip
      ? Math.floor(Math.random() * 3) + 2  // VIP: 2, 3, 4
      : Math.floor(Math.random() * 5) + 5; // Standard: 5, 6, 7, 8, 9
      
    if (typeof window !== 'undefined') {
      localStorage.setItem('mecura_queue_display_pos', initialPos.toString());
    }
    return initialPos;
  });

  // Real entrance timestamp
  const [queueEnteredAt] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mecura_queue_entered_at');
      if (saved) return parseInt(saved, 10);
      const now = Date.now();
      localStorage.setItem('mecura_queue_entered_at', now.toString());
      return now;
    }
    return Date.now();
  });
  
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const base = myQueueEntry?.joinedAt 
      ? new Date(myQueueEntry.joinedAt).getTime() 
      : queueEnteredAt;
    return Math.max(0, Math.floor((Date.now() - base) / 1000));
  });
  
  const [hasNotifiedExceeded, setHasNotifiedExceeded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('mecura_queue_notified_10m') === 'true';
  });

  const [simulated10Min, setSimulated10Min] = useState<boolean>(false);
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [phoneInput, setPhoneInput] = useState<string>(userPhone || '');

  // Live timer interval: checks elapsed time every second
  useEffect(() => {
    const updateTimer = () => {
      const base = myQueueEntry?.joinedAt 
        ? new Date(myQueueEntry.joinedAt).getTime() 
        : queueEnteredAt;
      const secs = Math.max(0, Math.floor((Date.now() - base) / 1000));
      setElapsedSeconds(secs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [myQueueEntry?.joinedAt, queueEnteredAt]);

  const effectiveSeconds = simulated10Min ? Math.max(620, elapsedSeconds) : elapsedSeconds;
  const isExceeded = effectiveSeconds >= 600;

  // Trigger notification when 10 minutes (600s) are reached
  useEffect(() => {
    if (isExceeded && !hasNotifiedExceeded) {
      setHasNotifiedExceeded(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mecura_queue_notified_10m', 'true');
      }
      playNotificationSound();
      showNativeNotification(
        'Fique tranquilo! 💬',
        'Você está há mais de 10 minutos na fila. O médico entrará em contato pelo WhatsApp assim que for a sua vez!',
        '/queue'
      );
    }
  }, [isExceeded, hasNotifiedExceeded]);

  // Dynamic Queue Progression: steadily decreases down to 1 over time
  useEffect(() => {
    if (displayPosition <= 1) return;

    // Organic random interval between decreases:
    // VIP: 8 to 14 seconds
    // Standard: 12 to 20 seconds
    const intervalMs = isVip
      ? Math.floor(Math.random() * 6000) + 8000
      : Math.floor(Math.random() * 8000) + 12000;

    const timer = setTimeout(() => {
      setDisplayPosition((prev) => {
        const next = Math.max(1, prev - 1);
        if (typeof window !== 'undefined') {
          localStorage.setItem('mecura_queue_display_pos', next.toString());
        }
        if (next === 1) {
          playNotificationSound();
        }
        return next;
      });
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [displayPosition, isVip]);

  useEffect(() => {
    const unsubscribe = subscribeToQueue();
    requestNotificationPermission();
    return () => unsubscribe();
  }, [subscribeToQueue]);

  useEffect(() => {
    if (consultationActive || myQueueEntry?.status === 'in-consultation') {
      setDisplayPosition(1);
      if (!consultationActive) {
        useStore.setState({
          consultationActive: true,
          inQueue: false,
          isConsultationFinished: false,
          activeConsultationId: myQueueEntry?.id || currentUserId,
          pagamento_consulta: true
        });
      }
      playNotificationSound();
      navigate('/chat');
    }
  }, [consultationActive, myQueueEntry?.status, myQueueEntry?.id, currentUserId, navigate]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleSavePhone = () => {
    if (phoneInput.trim()) {
      setUserPhone(phoneInput.trim());
    }
    setIsEditingPhone(false);
  };

  const handleResetQueueRandom = () => {
    const newRandom = isVip
      ? Math.floor(Math.random() * 3) + 2
      : Math.floor(Math.random() * 5) + 5;
    setDisplayPosition(newRandom);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mecura_queue_display_pos', newRandom.toString());
    }
  };

  // 10 minute progress percentage (0 - 100%)
  const progressPercent = Math.min(100, Math.round((effectiveSeconds / 600) * 100));
  const estimatedMins = Math.max(1, displayPosition * 2);

  return (
    <div className="flex flex-col min-h-full bg-mecura-bg relative overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-mecura-neon/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 z-10 max-w-lg mx-auto w-full">
        {/* Banner de Chamada do Médico */}
        {(myQueueEntry?.status === 'in-consultation' || myQueueEntry?.isAlerted || consultationActive) && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-mecura-neon/20 via-emerald-500/20 to-mecura-neon/10 border-2 border-mecura-neon animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_35px_rgba(166,255,0,0.35)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-mecura-neon text-black flex items-center justify-center font-bold text-2xl shrink-0 shadow-[0_0_15px_rgba(166,255,0,0.5)]">
                🩺
              </div>
              <div className="text-left">
                <h4 className="text-white font-extrabold text-base leading-snug">O Dr. Guilherme está te chamando!</h4>
                <p className="text-xs text-mecura-silver">Sua consulta no chat já foi liberada e está ativa.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                useStore.setState({
                  consultationActive: true,
                  inQueue: false,
                  activeConsultationId: myQueueEntry?.id || currentUserId,
                  pagamento_consulta: true
                });
                navigate('/chat');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-mecura-neon text-black font-extrabold text-sm rounded-xl hover:bg-[#b5ff33] transition-all shadow-[0_0_20px_rgba(166,255,0,0.4)] hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
            >
              Entrar na Consulta →
            </button>
          </div>
        )}

        {/* Header & Live Queue Timer */}
        <div className="text-center mt-2 mb-4 w-full">
          {/* Live Timer Pill & Estimated Wait */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mecura-surface border border-mecura-elevated text-xs font-semibold text-mecura-silver shadow-md">
              <span className="w-2 h-2 rounded-full bg-mecura-neon animate-ping" />
              <Clock className="w-3.5 h-3.5 text-mecura-neon" />
              <span>Tempo na fila: <strong className="text-white font-mono text-sm tracking-wide">{formatTime(effectiveSeconds)}</strong></span>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mecura-surface/90 border border-mecura-elevated text-xs font-semibold text-mecura-silver shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-mecura-neon" />
              <span>Previsão: <strong className="text-mecura-neon font-mono text-xs">{displayPosition === 1 ? 'Você é o próximo!' : `~${estimatedMins} min`}</strong></span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1.5">
            Fila de Atendimento
          </h1>
          <p className="text-mecura-silver text-xs sm:text-sm max-w-sm mx-auto">
            {isExceeded 
              ? 'Fique tranquilo! O médico entrará em contato pelo seu WhatsApp quando for sua vez.' 
              : displayPosition === 1 
                ? 'Prepare-se! O Dr. Guilherme está finalizando o atendimento anterior para iniciar a sua consulta.'
                : 'Aguarde um momento, o médico já vai te chamar na sala de consulta.'}
          </p>

          {/* 10-Minute Progress Bar Indicator */}
          <div className="mt-3.5 bg-black/40 border border-mecura-elevated rounded-xl p-2.5 max-w-sm mx-auto">
            <div className="flex justify-between items-center text-[10px] text-mecura-silver mb-1.5 font-medium">
              <span>{isExceeded ? '✅ Meta de 10 min atingida' : 'Tempo de espera monitorado'}</span>
              <span className={isExceeded ? 'text-[#25D366] font-bold' : 'text-mecura-neon font-bold'}>
                {isExceeded ? 'WhatsApp Ativo' : `${progressPercent}% (10 min)`}
              </span>
            </div>
            <div className="w-full h-2 bg-mecura-surface rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isExceeded 
                    ? 'bg-gradient-to-r from-[#25D366] to-emerald-400 shadow-[0_0_10px_rgba(37,211,102,0.6)]' 
                    : 'bg-gradient-to-r from-mecura-neon/60 to-mecura-neon'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* NOTIFICAÇÃO DE > 10 MINUTOS (WhatsApp Reassurance Banner) */}
        {isExceeded && (
          <div className="w-full mb-5 bg-gradient-to-br from-[#122317] to-[#0A150D] border-2 border-[#25D366]/60 rounded-2xl p-4 sm:p-5 shadow-[0_0_35px_rgba(37,211,102,0.25)] animate-fade-in relative overflow-hidden">
            {/* Ambient WhatsApp Glow */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#25D366]/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_18px_rgba(37,211,102,0.5)] animate-bounce-subtle mt-0.5">
                <WhatsAppIcon className="w-7 h-7 fill-current" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40">
                    Aviso aos 10 Minutos
                  </span>
                  <span className="text-[11px] text-[#A0D2A6] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" /> Atendimento Garantido
                  </span>
                </div>

                <h3 className="text-white font-bold text-base leading-snug mb-1.5">
                  Fique tranquilo! Vamos te chamar pelo WhatsApp
                </h3>

                <p className="text-[#D0E7D4] text-xs sm:text-[13px] leading-relaxed mb-3">
                  Você está aguardando há mais de 10 minutos. Nossa equipe médica está concluindo atendimentos anteriores e <strong>vai entrar em contato diretamente com você pelo WhatsApp assim que chegar a sua vez!</strong>
                </p>

                {/* WhatsApp Confirmation / Edit box */}
                <div className="bg-[#050B07] border border-[#25D366]/40 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-mecura-silver flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#25D366]" /> Seu WhatsApp cadastrado para contato:
                    </span>
                    {!isEditingPhone && (
                      <button 
                        onClick={() => {
                          setPhoneInput(userPhone || '');
                          setIsEditingPhone(true);
                        }}
                        className="text-[11px] text-[#25D366] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Edit2 className="w-3 h-3" /> Alterar
                      </button>
                    )}
                  </div>

                  {isEditingPhone ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="(DDD) 99999-9999"
                        className="flex-1 bg-black/60 border border-[#25D366]/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#25D366]"
                      />
                      <button 
                        onClick={handleSavePhone}
                        className="bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white tracking-wide font-mono">
                        {userPhone ? userPhone : '(Número não informado)'}
                      </span>
                      <span className="text-[10px] text-[#25D366] bg-[#25D366]/15 px-2.5 py-1 rounded-full border border-[#25D366]/30 font-semibold">
                        Pronto para contato
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-mecura-silver mt-2 italic leading-relaxed">
                  💡 Você pode deixar o app em segundo plano ou navegar com tranquilidade. Avisaremos você pelo WhatsApp assim que o médico estiver pronto!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Futuristic Scanner Graphic */}
        <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center my-3 flex-shrink-0">
          {/* Outer Rotating Hexagon */}
          <div className="absolute inset-0 text-mecura-neon/10 animate-spin-slow">
            <Hexagon className="w-full h-full" strokeWidth={0.5} />
          </div>

          {/* Reverse Rotating Dashed Circle */}
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-mecura-neon/20 animate-spin-reverse" />

          {/* Pulsing Inner Circle */}
          <div className={`absolute inset-12 rounded-full border backdrop-blur-sm transition-all duration-700 ${
            displayPosition === 1
              ? 'bg-gradient-to-tr from-emerald-500/20 to-mecura-neon/30 border-mecura-neon shadow-[0_0_30px_rgba(166,255,0,0.4)] animate-pulse'
              : 'bg-gradient-to-tr from-mecura-green/10 to-mecura-neon/10 border-mecura-neon/30 animate-pulse'
          }`} />

          {/* Center Content (Queue Position) */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={displayPosition}
                  initial={{ scale: 0.6, opacity: 0, y: -12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.25, opacity: 0, y: 12 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className={`text-5xl sm:text-6xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(166,255,0,0.9)] ${
                    displayPosition === 1 ? 'text-[#b5ff33] scale-110' : 'text-mecura-neon'
                  }`}
                >
                  {displayPosition}
                </motion.span>
              </AnimatePresence>

              <span className="text-[11px] font-bold text-mecura-pearl uppercase tracking-widest mt-1 text-center">
                {displayPosition === 1 ? 'Você é o próximo!' : 'Sua Posição na Fila'}
              </span>

              {displayPosition === 1 ? (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-mecura-neon/20 text-mecura-neon border border-mecura-neon/50 shadow-[0_0_15px_rgba(166,255,0,0.4)] animate-pulse flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 fill-current" /> PREPARANDO SALA
                </motion.span>
              ) : isVip ? (
                <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.25)] tracking-wider flex items-center gap-1">
                  ⭐ PACIENTE VIP (PRIORITÁRIO)
                </span>
              ) : (
                <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#142A1D] text-[#4ADE80] border border-[#22C55E]/40 tracking-wider">
                  🌱 PLANO ESSENCIAL
                </span>
              )}
            </div>
          </div>

          {/* Scanning Line (Only when waiting) */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-mecura-neon/80 shadow-[0_0_15px_rgba(166,255,0,1)] z-30 animate-scan" />
        </div>

        {/* Action Area / Instructions & Controls */}
        <div className="w-full max-w-sm mt-3 space-y-3">
          <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-4 flex items-start gap-3 shadow-md">
            <div className="w-8 h-8 rounded-full bg-mecura-neon/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-mecura-neon" />
            </div>
            <p className="text-mecura-silver text-xs sm:text-sm leading-relaxed">
              Você receberá uma <strong className="text-mecura-pearl">notificação no app e no WhatsApp</strong> quando for a sua vez. Fique tranquilo, sua consulta está confirmada.
            </p>
          </div>

          {/* Fast Validation / Test Toggle */}
          <div className="pt-2 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={handleResetQueueRandom}
                title="Gera uma nova posição aleatória e inicia a contagem regressiva"
                className="px-3.5 py-2 rounded-xl bg-mecura-surface border border-mecura-elevated hover:border-mecura-neon text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-mecura-neon" />
                <span>Simular Nova Entrada</span>
              </button>

              <button
                onClick={() => {
                  setSimulated10Min(prev => !prev);
                }}
                className="px-3.5 py-2 rounded-xl bg-mecura-surface border border-mecura-neon/40 hover:border-mecura-neon text-mecura-neon text-xs font-bold transition-all shadow-[0_0_12px_rgba(166,255,0,0.15)] flex items-center gap-1.5 active:scale-95"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isExceeded ? '🔄 Tempo Real' : '⚡ Testar >10 Min'}</span>
              </button>
            </div>

            <span className="text-[10px] text-mecura-silver/60 text-center">
              A posição diminui automaticamente a cada ~12-18 segundos até chamar a consulta.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
