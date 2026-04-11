import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Activity, Hexagon } from 'lucide-react';
import { useStore } from '../store/useStore';

const MESSAGES = [
  "Analisando seu perfil clínico...",
  "Mapeando sistema endocanabinoide...",
  "Cruzando dados e sintomas...",
  "Preparando protocolo personalizado..."
];

export function AnalysisScreen() {
  const navigate = useNavigate();
  const { setSelectedOffer } = useStore();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Change message every 1.2 seconds
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    // Navigate to diagnosis after 5 seconds
    const timeout = setTimeout(() => {
      navigate('/diagnosis');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate, setSelectedOffer]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-mecura-bg relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-mecura-neon/20 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Futuristic Scanner Graphic */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-12 z-10">
        {/* Outer Rotating Hexagon */}
        <div className="absolute inset-0 text-mecura-neon/10 animate-[mecura-spin_15s_linear_infinite]">
          <Hexagon className="w-full h-full" strokeWidth={0.5} />
        </div>

        {/* Reverse Rotating Dashed Circle */}
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-mecura-neon/20 animate-[mecura-spin_10s_linear_infinite_reverse]" />

        {/* Pulsing Inner Circle */}
        <div className="absolute inset-12 rounded-full bg-gradient-to-tr from-mecura-green/10 to-mecura-neon/10 border border-mecura-neon/30 backdrop-blur-sm animate-pulse" />

        {/* Center Icon (Cannabis/Medical Theme) */}
        <div className="relative z-20 flex flex-col items-center justify-center text-mecura-neon">
          <div className="animate-bounce">
            <Leaf className="w-14 h-14 drop-shadow-[0_0_15px_rgba(166,255,0,0.8)]" />
          </div>
          <Activity className="w-6 h-6 absolute -bottom-3 text-mecura-pearl opacity-80 drop-shadow-[0_0_8px_rgba(240,238,232,0.8)]" />
        </div>

        {/* Scanning Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-mecura-neon/80 shadow-[0_0_15px_rgba(166,255,0,1)] z-30 animate-[scan_3s_linear_infinite]" />
      </div>

      {/* Dynamic Text */}
      <div className="h-16 flex items-center justify-center z-10 px-8">
        <div className="text-center">
          <p className="text-mecura-silver text-lg font-medium tracking-wide">
            {MESSAGES[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
