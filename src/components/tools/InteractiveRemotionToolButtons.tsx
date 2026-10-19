import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { Player } from '@remotion/player';
import { Brain, Activity, Sprout, ChevronRight, Sparkles } from 'lucide-react';
import { StrategicToolType } from './StrategicToolsModal';

/* =========================================================================
   REMOTION MICRO-COMPOSITIONS (Engineered for ultra-smooth 60fps micro cards)
   ========================================================================= */

interface MicroProps {
  isHovered?: boolean;
}

/** 1. TDAH: Synaptic Neural Network & Wave Pulse */
export const RemotionMicroAdhd: React.FC<MicroProps> = ({ isHovered = false }) => {
  const frame = useCurrentFrame();
  const speed = isHovered ? 1.6 : 1.0;
  const t = frame * speed;

  // Synaptic wave path
  const wavePoints: string[] = [];
  for (let x = 0; x <= 140; x += 10) {
    const norm = x / 140;
    const env = Math.sin(norm * Math.PI);
    const y = 52 + Math.sin(norm * 4.2 + t * 0.12) * (isHovered ? 14 : 9) * env;
    wavePoints.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
  }
  const wavePath = wavePoints.join(' ');

  // Particle traversing the wave
  const particleX = (t * 2.2) % 140;
  const normX = particleX / 140;
  const particleY = 52 + Math.sin(normX * 4.2 + t * 0.12) * (isHovered ? 14 : 9) * Math.sin(normX * Math.PI);

  // Nodes with synaptic glow
  const nodes = [
    { cx: 24, cy: 38, r: 3.5, label: 'D1' },
    { cx: 68, cy: 64, r: 4.5, label: 'CB1' },
    { cx: 112, cy: 42, r: 3.5, label: 'CBG' },
  ];

  return (
    <AbsoluteFill style={{ background: 'transparent', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 140 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="adhdGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity={isHovered ? 0.9 : 0.45} />
            <stop offset="50%" stopColor="#A6FF00" stopOpacity={isHovered ? 1 : 0.7} />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity={isHovered ? 0.9 : 0.45} />
          </linearGradient>
          <radialGradient id="adhdGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A6FF00" stopOpacity={isHovered ? 0.8 : 0.4} />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient synaptic aura */}
        <circle cx={particleX} cy={particleY} r={isHovered ? 26 : 18} fill="url(#adhdGlow)" />

        {/* Connecting Axon Wave */}
        <path d={wavePath} fill="none" stroke="url(#adhdGrad)" strokeWidth={isHovered ? 2.4 : 1.6} />

        {/* Traveling Synaptic Light Particle */}
        <circle cx={particleX} cy={particleY} r={isHovered ? 4.5 : 3} fill="#A6FF00" />

        {/* Synaptic Nodes */}
        {nodes.map((n, i) => {
          const pulse = Math.sin(t * 0.15 + i * 1.5) * 1.5;
          return (
            <g key={i}>
              <circle
                cx={n.cx}
                cy={n.cy}
                r={n.r + pulse}
                fill={i === 1 ? '#A6FF00' : '#38BDF8'}
                opacity={isHovered ? 0.95 : 0.65}
              />
              <circle
                cx={n.cx}
                cy={n.cy}
                r={n.r + pulse + 4}
                fill="none"
                stroke={i === 1 ? '#A6FF00' : '#38BDF8'}
                strokeWidth="1"
                opacity={isHovered ? 0.5 : 0.25}
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** 2. Autismo: Concentric Sensory Resonance & Harmonic Aurora */
export const RemotionMicroAutism: React.FC<MicroProps> = ({ isHovered = false }) => {
  const frame = useCurrentFrame();
  const speed = isHovered ? 1.5 : 0.9;
  const t = frame * speed;

  return (
    <AbsoluteFill style={{ background: 'transparent', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 140 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="teaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity={isHovered ? 0.9 : 0.5} />
            <stop offset="60%" stopColor="#38BDF8" stopOpacity={isHovered ? 0.8 : 0.4} />
            <stop offset="100%" stopColor="#A6FF00" stopOpacity={isHovered ? 1 : 0.6} />
          </linearGradient>
          <radialGradient id="teaCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity={isHovered ? 0.5 : 0.25} />
            <stop offset="100%" stopColor="#A6FF00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx="70" cy="50" r={isHovered ? 38 : 28} fill="url(#teaCenterGlow)" />

        {/* Concentric Sensory Waves */}
        {[14, 26, 38].map((radius, idx) => {
          const breathe = Math.sin(t * 0.08 + idx * 1.2) * (isHovered ? 3.5 : 2);
          const rot = (t * (idx % 2 === 0 ? 0.8 : -0.6) + idx * 30) % 360;
          return (
            <g key={idx} transform={`translate(70, 50) rotate(${rot})`}>
              <circle
                r={radius + breathe}
                fill="none"
                stroke="url(#teaGrad)"
                strokeWidth={isHovered ? 1.8 : 1.2}
                strokeDasharray={idx === 1 ? '12 6' : idx === 2 ? '20 8' : 'none'}
                opacity={isHovered ? 0.85 : 0.45}
              />
            </g>
          );
        })}

        {/* Orbiting Sensory Satellites */}
        {[0, 1, 2].map((i) => {
          const angle = t * 0.04 + (i * Math.PI * 2) / 3;
          const rx = 34;
          const ry = 18;
          const cx = 70 + Math.cos(angle) * rx;
          const cy = 50 + Math.sin(angle) * ry;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={isHovered ? 3.2 : 2.2}
              fill={i === 0 ? '#C084FC' : i === 1 ? '#38BDF8' : '#A6FF00'}
              opacity={isHovered ? 1 : 0.7}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** 3. Plantas p/ HC: Botanical Photosynthesis & Chlorophyll Growth Matrix */
export const RemotionMicroHc: React.FC<MicroProps> = ({ isHovered = false }) => {
  const frame = useCurrentFrame();
  const speed = isHovered ? 1.6 : 1.0;
  const t = frame * speed;

  return (
    <AbsoluteFill style={{ background: 'transparent', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 140 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hcStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#10B981" stopOpacity={isHovered ? 0.9 : 0.6} />
            <stop offset="100%" stopColor="#A6FF00" stopOpacity={isHovered ? 1 : 0.75} />
          </linearGradient>
          <radialGradient id="hcGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A6FF00" stopOpacity={isHovered ? 0.6 : 0.3} />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Biological Glow */}
        <circle cx="70" cy="55" r={isHovered ? 35 : 24} fill="url(#hcGlow)" />

        {/* Ground Line */}
        <line x1="10" y1="82" x2="130" y2="82" stroke="rgba(166,255,0,0.3)" strokeWidth="1" strokeDasharray="4 4" />

        {/* 3 Stems with Organic Wind Sway */}
        {[35, 70, 105].map((baseX, idx) => {
          const sway = Math.sin(t * 0.08 + idx * 1.4) * (isHovered ? 4.5 : 2.5);
          const topX = baseX + sway;
          const topY = idx === 1 ? 32 : 44;

          return (
            <g key={idx}>
              {/* Stem Curve */}
              <path
                d={`M ${baseX} 82 Q ${baseX + sway * 0.5} 60 ${topX} ${topY}`}
                fill="none"
                stroke="url(#hcStemGrad)"
                strokeWidth={idx === 1 ? 2.4 : 1.8}
                strokeLinecap="round"
              />
              {/* Left Leaf */}
              <path
                d={`M ${baseX + sway * 0.5} 62 Q ${baseX - 12 + sway} 56 ${baseX - 14 + sway} 64 Q ${baseX - 4 + sway} 68 ${baseX + sway * 0.5} 62`}
                fill="#10B981"
                opacity={isHovered ? 0.9 : 0.6}
              />
              {/* Right Leaf */}
              <path
                d={`M ${baseX + sway * 0.5} 54 Q ${baseX + 12 + sway} 48 ${baseX + 14 + sway} 56 Q ${baseX + 4 + sway} 60 ${baseX + sway * 0.5} 54`}
                fill="#A6FF00"
                opacity={isHovered ? 0.9 : 0.6}
              />
              {/* Top Bud / Trichome Light */}
              <circle
                cx={topX}
                cy={topY}
                r={idx === 1 ? (isHovered ? 4 : 3) : 2.5}
                fill="#A6FF00"
                opacity={isHovered ? 1 : 0.8}
              />
            </g>
          );
        })}

        {/* Ascending Chlorophyll / Phytocannabinoid Droplets */}
        {[0, 1, 2].map((i) => {
          const dropY = 80 - ((t * 1.8 + i * 28) % 65);
          const dropX = 55 + i * 16 + Math.sin(t * 0.1 + i) * 3;
          return (
            <circle
              key={i}
              cx={dropX}
              cy={dropY}
              r={1.8}
              fill="#A6FF00"
              opacity={isHovered ? 0.8 : 0.4}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* =========================================================================
   INTERACTIVE BUTTONS WITH FRAMER MOTION + REMOTION PLAYER
   ========================================================================= */

interface InteractiveToolButtonsProps {
  onOpenTool: (tool: StrategicToolType) => void;
  className?: string;
  variant?: 'full' | 'compact';
}

export const InteractiveRemotionToolButtons: React.FC<InteractiveToolButtonsProps> = ({
  onOpenTool,
  className = '',
  variant = 'full',
}) => {
  const [hoveredTool, setHoveredTool] = useState<StrategicToolType | null>(null);

  const tools: Array<{
    id: StrategicToolType;
    title: string;
    sub: string;
    pill: string;
    accentColor: string;
    neonBorderColor: string;
    icon: React.ReactNode;
    remotionComp: React.FC<MicroProps>;
    glowShadow: string;
    tagGlow: string;
  }> = [
    {
      id: 'tdah',
      title: 'Teste TDAH',
      sub: 'Foco & Atenção',
      pill: '12 Alvos',
      accentColor: '#38BDF8',
      neonBorderColor: 'rgba(56, 189, 248, 0.6)',
      icon: <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300" />,
      remotionComp: RemotionMicroAdhd,
      glowShadow: '0 0 24px rgba(56, 189, 248, 0.25)',
      tagGlow: 'rgba(56, 189, 248, 0.18)',
    },
    {
      id: 'autism',
      title: 'Teste Autismo',
      sub: 'Espectro TEA',
      pill: '12 Perg.',
      accentColor: '#C084FC',
      neonBorderColor: 'rgba(192, 132, 252, 0.6)',
      icon: <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />,
      remotionComp: RemotionMicroAutism,
      glowShadow: '0 0 24px rgba(192, 132, 252, 0.25)',
      tagGlow: 'rgba(192, 132, 252, 0.18)',
    },
    {
      id: 'hc',
      title: 'Plantas p/ HC',
      sub: 'Calculadora',
      pill: 'Fitomassa',
      accentColor: '#A6FF00',
      neonBorderColor: 'rgba(166, 255, 0, 0.7)',
      icon: <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A6FF00]" />,
      remotionComp: RemotionMicroHc,
      glowShadow: '0 0 25px rgba(166, 255, 0, 0.3)',
      tagGlow: 'rgba(166, 255, 0, 0.22)',
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* Header Label - Fluorescent Green Signature Accent */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A6FF00] shadow-[0_0_8px_#A6FF00] animate-pulse" />
          <span className="text-[10px] font-bold text-[#A6FF00] uppercase tracking-[0.16em]">
            Testes & Ferramentas Interativas
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/60 font-mono">
          <Sparkles className="w-3 h-3 text-[#A6FF00]" />
          <span>Resultados em 1 min</span>
        </div>
      </div>

      {/* Grid of 3 Translucent Glass Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {tools.map((t, idx) => {
          const isHov = hoveredTool === t.id;
          const Comp = t.remotionComp;

          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => onOpenTool(t.id)}
              onMouseEnter={() => setHoveredTool(t.id)}
              onMouseLeave={() => setHoveredTool(null)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{
                y: -4,
                scale: 1.03,
                boxShadow: t.glowShadow,
                transition: { type: 'spring', stiffness: 400, damping: 22 },
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                borderColor: isHov ? t.accentColor : 'rgba(255, 255, 255, 0.12)',
              }}
              className="group relative rounded-2xl p-2.5 sm:p-3 text-left bg-black/40 hover:bg-black/60 border backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[94px] sm:min-h-[100px] overflow-hidden select-none"
            >
              {/* Background Remotion Micro-Player Canvas with Screen Blend */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
                  isHov ? 'opacity-85' : 'opacity-40'
                }`}
                style={{ mixBlendMode: 'screen' }}
              >
                <Player
                  component={Comp}
                  inputProps={{ isHovered: isHov }}
                  durationInFrames={300}
                  compositionWidth={140}
                  compositionHeight={100}
                  fps={30}
                  loop
                  autoPlay
                  controls={false}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Shimmer Light Reflection Sweep on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

              {/* Subtle Ambient Radial Highlight */}
              <div
                className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-[20px] pointer-events-none transition-opacity duration-500"
                style={{
                  background: t.accentColor,
                  opacity: isHov ? 0.3 : 0.08,
                }}
              />

              {/* Top Row: Icon Capsule + Live Tag & Arrow */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 border"
                  style={{
                    backgroundColor: isHov ? `${t.accentColor}20` : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isHov ? t.accentColor : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: isHov ? `0 0 10px ${t.accentColor}35` : 'none',
                  }}
                >
                  <motion.div
                    animate={isHov ? { scale: [1, 1.15, 1], rotate: [0, 4, -4, 0] } : {}}
                    transition={{ duration: 0.6, repeat: isHov ? Infinity : 0, repeatDelay: 1 }}
                  >
                    {t.icon}
                  </motion.div>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className="text-[9px] font-sans px-1.5 py-0.5 rounded-md border transition-all duration-300"
                    style={{
                      backgroundColor: isHov ? `${t.accentColor}18` : 'rgba(255, 255, 255, 0.04)',
                      borderColor: isHov ? `${t.accentColor}40` : 'rgba(255, 255, 255, 0.08)',
                      color: isHov ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                    }}
                  >
                    {t.pill}
                  </span>
                  <ChevronRight
                    className="w-3 h-3 transition-all duration-300 group-hover:translate-x-0.5"
                    style={{ color: isHov ? t.accentColor : 'rgba(255, 255, 255, 0.35)' }}
                  />
                </div>
              </div>

              {/* Bottom Row: Text Labels */}
              <div className="relative z-10 mt-2">
                <span
                  className="text-[11.5px] sm:text-xs font-bold block tracking-tight transition-colors duration-200"
                  style={{ color: isHov ? '#FFFFFF' : 'rgba(255, 255, 255, 0.95)' }}
                >
                  {t.title}
                </span>
                <span
                  className="text-[9.5px] sm:text-[10px] block font-normal transition-colors duration-200 mt-0.5"
                  style={{ color: isHov ? t.accentColor : 'rgba(255, 255, 255, 0.55)' }}
                >
                  {t.sub}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
