import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Hexagon, BellRing, Bell } from 'lucide-react';

export function QueueScreen() {
  const navigate = useNavigate();
  const { queuePosition, estimatedWaitTime, updateQueue, startConsultation, pagamento_consulta } = useStore();

  useEffect(() => {
    // Block access if payment is not completed
    if (!pagamento_consulta) {
      navigate('/checkout');
      return;
    }

    // Simulate queue progression
    if (queuePosition <= 0) return;

    const interval = setInterval(() => {
      updateQueue(
        Math.max(0, queuePosition - 1),
        Math.max(0, estimatedWaitTime - 1.5)
      );
    }, 4000); // Every 4 seconds, position drops by 1 for demo purposes

    return () => clearInterval(interval);
  }, [queuePosition, estimatedWaitTime, updateQueue, pagamento_consulta, navigate]);

  const isNext = queuePosition === 0;

  const handleEnterConsultation = () => {
    startConsultation();
    navigate('/chat');
  };

  return (
    <div className="flex flex-col min-h-full bg-mecura-bg relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-mecura-neon/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-serif font-bold text-white mb-2">
            {isNext ? 'Sua vez chegou!' : 'Fila de Atendimento'}
          </h1>
          <p className="text-mecura-silver text-sm">
            {isNext ? 'O médico está pronto para te atender.' : 'Aguarde, o médico já vai te chamar.'}
          </p>
        </div>

        {/* Futuristic Scanner Graphic */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          {/* Outer Rotating Hexagon */}
          <div className="absolute inset-0 text-mecura-neon/10 animate-[mecura-spin_15s_linear_infinite]">
            <Hexagon className="w-full h-full" strokeWidth={0.5} />
          </div>

          {/* Reverse Rotating Dashed Circle */}
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-mecura-neon/20 animate-[mecura-spin_10s_linear_infinite_reverse]" />

          {/* Pulsing Inner Circle */}
          <div className={`absolute inset-12 rounded-full border backdrop-blur-sm animate-pulse ${
            isNext 
              ? 'bg-gradient-to-tr from-mecura-neon/20 to-mecura-neon/40 border-mecura-neon/50' 
              : 'bg-gradient-to-tr from-mecura-green/10 to-mecura-neon/10 border-mecura-neon/30'
          }`} />

          {/* Center Content (Queue Position) */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
              {isNext ? (
                <BellRing className="w-16 h-16 text-mecura-neon drop-shadow-[0_0_15px_rgba(166,255,0,0.8)]" />
              ) : (
                <>
                  <span className="text-6xl font-black text-mecura-neon drop-shadow-[0_0_15px_rgba(166,255,0,0.8)] tracking-tighter">
                    {queuePosition}
                  </span>
                  <span className="text-xs font-bold text-mecura-pearl uppercase tracking-widest mt-1">
                    Sua Posição
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Scanning Line (Only when waiting) */}
          {!isNext && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-mecura-neon/80 shadow-[0_0_15px_rgba(166,255,0,1)] z-30 animate-[scan_3s_linear_infinite]" />
          )}
        </div>

        {/* Action Area */}
        <div className="w-full max-w-sm mt-auto">
          {isNext ? (
            <div>
              <Button 
                className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.3)]" 
                onClick={handleEnterConsultation}
              >
                Entrar na Consulta
              </Button>
            </div>
          ) : (
            <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-mecura-neon/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-mecura-neon" />
              </div>
              <p className="text-mecura-silver text-sm leading-relaxed">
                Você receberá uma <strong className="text-mecura-pearl">notificação no app</strong> quando for a sua vez. Fique tranquilo, não feche o aplicativo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
