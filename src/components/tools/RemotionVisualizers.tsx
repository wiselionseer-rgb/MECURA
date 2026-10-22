import React, { useState } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Player } from '@remotion/player';
import { Sparkles, Zap, ShieldCheck, Sprout, Activity, Brain } from 'lucide-react';

export interface AdhdCompositionProps {
  progressRatio: number; // 0 to 1
  scoreRatio?: number; // 0 to 1
  isResult?: boolean;
  currentDomain?: string;
  lastPoints?: number; // 0, 1, 2, 3
  simulateCbdModulation?: boolean;
  focusedNodeIdx?: number | null;
}

export const AdhdNeuralComposition: React.FC<AdhdCompositionProps> = ({
  progressRatio = 0.2,
  scoreRatio = 0.65,
  isResult = false,
  currentDomain = 'Córtex Pré-Frontal',
  lastPoints = 2,
  simulateCbdModulation = false,
  focusedNodeIdx = null,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  // Turbulence increases when user selects higher symptom frequency (2 or 3 points),
  // and calms down dramatically when CBD+CBG modulation simulation is active!
  const rawTurbulence = isResult
    ? scoreRatio
    : Math.min(1, Math.max(0.15, (lastPoints / 3) * 0.75 + scoreRatio * 0.25));

  const effectiveTurbulence = simulateCbdModulation ? 0.12 : rawTurbulence;
  const speedFactor = simulateCbdModulation ? 0.045 : 0.07 + effectiveTurbulence * 0.08;
  const pulse = Math.sin(frame / (simulateCbdModulation ? 14 : 7)) * 0.5 + 0.5;

  const buildWavePath = (freq: number, amp: number, phaseOffset: number, yCenter: number) => {
    const points: string[] = [];
    for (let x = 0; x <= 360; x += 5) {
      const normalizedX = x / 360;
      const envelope = Math.sin(normalizedX * Math.PI);
      const jitter = simulateCbdModulation
        ? 0
        : Math.cos(normalizedX * 19 + frame * 0.22) * (effectiveTurbulence * 4.5);
      const y =
        yCenter +
        Math.sin(normalizedX * freq * Math.PI * 2 + frame * speedFactor + phaseOffset) *
          amp *
          envelope +
        jitter;
      points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  const wave1 = buildWavePath(
    simulateCbdModulation ? 1.8 : 2.5 + effectiveTurbulence * 3.2,
    simulateCbdModulation ? 13 : 16 + effectiveTurbulence * 16,
    0,
    70
  );
  const wave2 = buildWavePath(
    simulateCbdModulation ? 1.4 : 2.1 + effectiveTurbulence * 2.5,
    simulateCbdModulation ? 9 : 12 + effectiveTurbulence * 12,
    2.1,
    70
  );
  const wave3 = buildWavePath(
    simulateCbdModulation ? 2.2 : 3.8 + effectiveTurbulence * 3.0,
    simulateCbdModulation ? 6 : 10 + effectiveTurbulence * 10,
    4.2,
    70
  );

  const nodes = [
    { x: 45, y: 46, label: 'Foco' },
    { x: 102, y: 88, label: 'Dopamina' },
    { x: 158, y: 40, label: 'Executivo' },
    { x: 212, y: 90, label: 'Memória' },
    { x: 268, y: 44, label: 'CB1' },
    { x: 320, y: 82, label: 'Sono/Ritmo' },
  ];

  const activeNodeByProgress = Math.min(
    nodes.length - 1,
    Math.floor(progressRatio * nodes.length)
  );
  const highlightedNode = focusedNodeIdx !== null ? focusedNodeIdx : activeNodeByProgress;

  return (
    <AbsoluteFill
      style={{
        background: simulateCbdModulation
          ? 'radial-gradient(circle at 50% 35%, rgba(166, 255, 0, 0.22), rgba(8, 12, 16, 0.98) 78%)'
          : effectiveTurbulence > 0.65
          ? 'radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.20), rgba(56, 189, 248, 0.14), rgba(10, 10, 18, 0.96) 78%)'
          : 'radial-gradient(circle at 50% 35%, rgba(56, 189, 248, 0.22), rgba(10, 10, 18, 0.96) 75%)',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 360 140" preserveAspectRatio="none">
        <defs>
          <linearGradient id="adhdGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={simulateCbdModulation ? '#10B981' : '#38BDF8'} stopOpacity="0.2" />
            <stop
              offset="50%"
              stopColor={
                simulateCbdModulation
                  ? '#A6FF00'
                  : effectiveTurbulence > 0.68
                  ? '#F59E0B'
                  : '#38BDF8'
              }
              stopOpacity="0.98"
            />
            <stop offset="100%" stopColor="#A6FF00" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="adhdGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.15" />
            <stop offset="50%" stopColor={simulateCbdModulation ? '#34D399' : '#A855F7'} stopOpacity="0.75" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Reference grid lines */}
        <line x1="0" y1="36" x2="360" y2="36" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
        <line x1="0" y1="70" x2="360" y2="70" stroke="rgba(255,255,255,0.07)" />
        <line x1="0" y1="104" x2="360" y2="104" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

        {/* Synaptic links between nodes */}
        {nodes.map((n, i) => {
          if (i === nodes.length - 1) return null;
          const next = nodes[i + 1];
          return (
            <line
              key={`link-${i}`}
              x1={n.x}
              y1={n.y}
              x2={next.x}
              y2={next.y}
              stroke={simulateCbdModulation ? 'rgba(166,255,0,0.22)' : 'rgba(56,189,248,0.18)'}
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          );
        })}

        {/* Neural Synaptic Waves */}
        <path d={wave3} fill="none" stroke="rgba(56, 189, 248, 0.22)" strokeWidth="1.5" />
        <path d={wave2} fill="none" stroke="url(#adhdGrad2)" strokeWidth="2" />
        <path d={wave1} fill="none" stroke="url(#adhdGrad1)" strokeWidth="2.8" strokeLinecap="round" />

        {/* Synaptic Nodes */}
        {nodes.map((n, i) => {
          const nodePulse = Math.sin(frame * 0.11 + i * 1.2) * (simulateCbdModulation ? 1.8 : 3.5);
          const isTarget = i === highlightedNode;
          const isReached = i <= activeNodeByProgress || isResult || simulateCbdModulation;
          const accentColor = simulateCbdModulation
            ? '#A6FF00'
            : isTarget && effectiveTurbulence > 0.65
            ? '#F59E0B'
            : '#38BDF8';

          return (
            <g key={i} transform={`translate(${n.x}, ${n.y + nodePulse}) scale(${introScale})`}>
              {isTarget && (
                <circle
                  r={13 + pulse * 5}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="1.2"
                  strokeOpacity="0.55"
                />
              )}
              <circle
                r={isTarget ? 10 + pulse * 3 : isReached ? 7 : 5}
                fill={isReached ? `${accentColor}33` : 'rgba(255,255,255,0.06)'}
              />
              <circle
                r={isTarget ? 4.5 : 3}
                fill={isReached ? accentColor : '#64748B'}
              />
              <text
                x={0}
                y={i % 2 === 0 ? -12 : 16}
                textAnchor="middle"
                fill={isTarget ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
                fontSize="7.5"
                fontWeight={isTarget ? 'bold' : 'normal'}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Top HUD Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 9.5,
          color: simulateCbdModulation ? '#D9F99D' : '#BAE6FD',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        <span style={{ maxWidth: '64%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {simulateCbdModulation ? '✓ Modulação CBD+CBG Ativa (Foco Estável)' : `Área: ${currentDomain}`}
        </span>
        <span style={{ color: '#A6FF00', fontFamily: 'monospace' }}>
          {simulateCbdModulation
            ? 'HOMEOSTASE: 94%'
            : isResult
            ? `ÍNDICE TDAH: ${Math.round(scoreRatio * 100)}%`
            : `OSCILAÇÃO: ${Math.round(effectiveTurbulence * 100)}%`}
        </span>
      </div>

      {/* Bottom Telemetry Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 9,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'monospace',
        }}
      >
        <span>{simulateCbdModulation ? 'ONDAS ALFA/BETA SINCRONIZADAS' : 'HIPERATIVIDADE SINÁPTICA'}</span>
        <span style={{ color: simulateCbdModulation ? '#A6FF00' : '#38BDF8' }}>
          {simulateCbdModulation ? 'RECEPTOR CB1 + D1 ESTÁVEL' : 'RESPONDA P/ CALIBRAR'}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export interface AutismCompositionProps {
  progressRatio: number;
  scoreRatio?: number;
  isResult?: boolean;
  currentDomain?: string;
  lastPoints?: number;
  simulateCbdModulation?: boolean;
  focusedNodeIdx?: number | null;
}

export const AutismSpectrumComposition: React.FC<AutismCompositionProps> = ({
  progressRatio = 0.2,
  scoreRatio = 0.7,
  isResult = false,
  currentDomain = 'Filtro Sensorial',
  lastPoints = 2,
  simulateCbdModulation = false,
  focusedNodeIdx = null,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleIn = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const sensoryLoad = isResult
    ? scoreRatio
    : Math.min(1, Math.max(0.2, (lastPoints / 3) * 0.75 + scoreRatio * 0.25));

  const effectiveLoad = simulateCbdModulation ? 0.15 : sensoryLoad;

  const domains = ['Audição/Luz', 'Tato/Textura', 'Social/Mask', 'Rotina', 'Hiperfoco', 'Sono/GABA'];
  const activeSatellite =
    focusedNodeIdx !== null
      ? focusedNodeIdx
      : Math.min(domains.length - 1, Math.floor(progressRatio * domains.length));

  return (
    <AbsoluteFill
      style={{
        background: simulateCbdModulation
          ? 'radial-gradient(circle at 50% 50%, rgba(166, 255, 0, 0.20), rgba(10, 14, 18, 0.98) 76%)'
          : 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.24), rgba(10, 10, 18, 0.96) 76%)',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 360 140">
        <defs>
          <linearGradient id="teaRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={simulateCbdModulation ? '#A6FF00' : '#C084FC'} />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#A6FF00" />
          </linearGradient>
        </defs>

        {/* Concentric Sensory Resonance Rings */}
        {[20, 33, 46, 59].map((radius, idx) => {
          const speed = simulateCbdModulation ? 0.35 : 0.5 + effectiveLoad * 0.9;
          const rot = (frame * (idx % 2 === 0 ? speed : -speed * 0.8) + idx * 45) % 360;
          const breathing =
            Math.sin(frame * (simulateCbdModulation ? 0.05 : 0.12) + idx) *
            (simulateCbdModulation ? 1.2 : 2 + effectiveLoad * 4);
          return (
            <g
              key={idx}
              transform={`translate(180, 70) rotate(${rot}) scale(${scaleIn})`}
            >
              <circle
                r={radius + breathing}
                fill="none"
                stroke="url(#teaRingGrad)"
                strokeWidth={idx === 1 ? 2.2 : 1.3}
                strokeOpacity={0.28 + idx * 0.14}
                strokeDasharray={simulateCbdModulation ? '40 6' : idx % 2 === 0 ? '14 8' : '26 10'}
              />
            </g>
          );
        })}

        {/* Orbiting Sensory Satellites */}
        {domains.map((label, i) => {
          const orbitSpeed = simulateCbdModulation ? 0.015 : 0.025 + effectiveLoad * 0.02;
          const angle = frame * orbitSpeed + (i * Math.PI) / 3;
          const orbitR = 36 + (i % 2) * 16;
          const cx = 180 + Math.cos(angle) * orbitR * 1.55;
          const cy = 70 + Math.sin(angle) * (orbitR * 0.72);
          const isFocused = i === activeSatellite;

          return (
            <g key={i}>
              <line
                x1="180"
                y1="70"
                x2={cx}
                y2={cy}
                stroke={
                  simulateCbdModulation
                    ? 'rgba(166, 255, 0, 0.28)'
                    : isFocused
                    ? 'rgba(192, 132, 252, 0.65)'
                    : 'rgba(192, 132, 252, 0.2)'
                }
                strokeWidth={isFocused ? '1.6' : '1'}
              />
              {isFocused && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={9 + Math.sin(frame * 0.15) * 2.5}
                  fill="none"
                  stroke="#A6FF00"
                  strokeWidth="1.2"
                  strokeOpacity="0.7"
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isFocused ? 5 : 3.5}
                fill={simulateCbdModulation ? '#A6FF00' : i % 2 === 0 ? '#C084FC' : '#38BDF8'}
              />
              <text
                x={cx}
                y={cy - 7}
                textAnchor="middle"
                fill={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                fontSize="7"
                fontWeight={isFocused ? 'bold' : 'normal'}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Core Homeostasis Node */}
        <circle
          cx="180"
          cy="70"
          r={10 + Math.sin(frame * 0.1) * (simulateCbdModulation ? 1 : 2.5)}
          fill={simulateCbdModulation ? 'rgba(166, 255, 0, 0.28)' : 'rgba(168, 85, 247, 0.32)'}
        />
        <circle cx="180" cy="70" r={4.5} fill={simulateCbdModulation ? '#A6FF00' : '#E9D5FF'} />
      </svg>

      {/* Top HUD */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 9.5,
          color: simulateCbdModulation ? '#D9F99D' : '#E9D5FF',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        <span style={{ maxWidth: '64%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {simulateCbdModulation ? '✓ Filtro Sensorial Estabilizado (Anandamida)' : `Domínio: ${currentDomain}`}
        </span>
        <span style={{ color: '#A6FF00', fontFamily: 'monospace' }}>
          {simulateCbdModulation
            ? 'CONFORTO: 95%'
            : isResult
            ? `ESPECTRO: ${Math.round(scoreRatio * 100)}%`
            : `CARGA: ${Math.round(effectiveLoad * 100)}%`}
        </span>
      </div>

      {/* Bottom Telemetry */}
      <div
        style={{
          position: 'absolute',
          bottom: 9,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'monospace',
        }}
      >
        <span>{simulateCbdModulation ? 'EQUILÍBRIO GABA / GLUTAMATO ATIVO' : 'MAPEAMENTO SENSORIAL TEA'}</span>
        <span style={{ color: simulateCbdModulation ? '#A6FF00' : '#C084FC' }}>
          {simulateCbdModulation ? 'TONO ENDOCANABINOIDE OK' : 'INTERAJA COM OS NÓS'}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export interface HcCalculatorCompositionProps {
  plantsPerCycle: number;
  annualPlants: number;
  dailyDoseMg: number;
  annualGrams: number;
  selectedMedicationsCount?: number;
  primaryMedType?: string;
  inspectStage?: 'vegetativo' | 'floracao' | 'extracao';
}

export const HcPlantCalculatorComposition: React.FC<HcCalculatorCompositionProps> = ({
  plantsPerCycle = 12,
  annualPlants = 36,
  dailyDoseMg = 100,
  annualGrams = 36.5,
  selectedMedicationsCount = 1,
  primaryMedType = 'Óleo & Extrato',
  inspectStage = 'floracao',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const visualPlantCount = Math.min(14, Math.max(3, Math.round(plantsPerCycle / 2)));
  const stageScale = inspectStage === 'vegetativo' ? 0.72 : inspectStage === 'floracao' ? 1.05 : 0.92;

  return (
    <AbsoluteFill
      style={{
        background:
          inspectStage === 'extracao'
            ? 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.22), rgba(166, 255, 0, 0.12), rgba(8, 12, 10, 0.98) 78%)'
            : 'radial-gradient(circle at 50% 30%, rgba(166, 255, 0, 0.22), rgba(8, 12, 10, 0.98) 78%)',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 360 140">
        <defs>
          <linearGradient id="hcLeafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A6FF00" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Soil / Cultivation Horizon Line */}
        <line x1="16" y1="104" x2="344" y2="104" stroke="rgba(166, 255, 0, 0.35)" strokeWidth="1.5" />

        {/* Animated Botanical Matrix */}
        {Array.from({ length: visualPlantCount }).map((_, idx) => {
          const spacing = 290 / Math.max(1, visualPlantCount - 1);
          const x = 35 + (visualPlantCount === 1 ? 145 : idx * spacing);
          const sway = Math.sin(frame * 0.07 + idx * 0.9) * 3.2;
          const growth =
            interpolate((frame + idx * 10) % 120, [0, 60, 120], [0.9, 1.08, 0.9]) * stageScale;

          return (
            <g
              key={idx}
              transform={`translate(${x}, 104) scale(${appear * growth})`}
            >
              {/* Stem */}
              <path
                d={`M 0 0 Q ${sway * 0.5} -18 ${sway} -35`}
                stroke="#10B981"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              {/* Left Leaf */}
              <path
                d={`M ${sway * 0.5} -16 Q ${-12 + sway} -24 ${-15 + sway} -14 Q ${-6 + sway} -10 ${sway * 0.5} -16`}
                fill="url(#hcLeafGrad)"
                opacity="0.88"
              />
              {/* Right Leaf */}
              <path
                d={`M ${sway * 0.6} -22 Q ${12 + sway} -30 ${15 + sway} -20 Q ${6 + sway} -16 ${sway * 0.6} -22`}
                fill="url(#hcLeafGrad)"
                opacity="0.88"
              />
              {/* Apical Flower / Trichome Crown */}
              {inspectStage !== 'vegetativo' && (
                <>
                  <circle
                    cx={sway}
                    cy={-37}
                    r={inspectStage === 'extracao' ? 5.2 : 4.5}
                    fill={inspectStage === 'extracao' ? '#FBBF24' : '#A6FF00'}
                  />
                  <circle
                    cx={sway}
                    cy={-37}
                    r={9}
                    fill={
                      inspectStage === 'extracao'
                        ? 'rgba(251, 191, 36, 0.26)'
                        : 'rgba(166, 255, 0, 0.22)'
                    }
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Top HUD */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 9.5,
          color: '#D9F99D',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        <span style={{ maxWidth: '62%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Base: {selectedMedicationsCount} Medicamento(s) ({primaryMedType})
        </span>
        <span style={{ color: '#A6FF00', fontFamily: 'monospace' }}>
          {annualPlants} PLANTAS/ANO
        </span>
      </div>

      {/* Bottom Live Metrics Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 9,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          color: 'rgba(255,255,255,0.85)',
          fontFamily: 'monospace',
        }}
      >
        <span>DOSE: {dailyDoseMg}mg/dia</span>
        <span>·</span>
        <span>EXTRATO: {annualGrams.toFixed(1)}g/ano</span>
        <span>·</span>
        <span style={{ color: '#A6FF00' }}>{plantsPerCycle} PLANTAS/CICLO</span>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionBannerPlayer: React.FC<{
  mode: 'tdah' | 'autism' | 'hc';
  adhdProps?: AdhdCompositionProps;
  autismProps?: AutismCompositionProps;
  hcProps?: HcCalculatorCompositionProps;
}> = ({ mode, adhdProps, autismProps, hcProps }) => {
  const [simulateCbd, setSimulateCbd] = useState(false);
  const [focusedNode, setFocusedNode] = useState<number | null>(null);
  const [hcStage, setHcStage] = useState<'vegetativo' | 'floracao' | 'extracao'>('floracao');

  const adhdNodeLabels = ['Foco', 'Dopamina', 'Executivo', 'Memória', 'Receptor CB1', 'Sono'];
  const autismNodeLabels = ['Audição/Luz', 'Texturas', 'Social', 'Rotina', 'Hiperfoco', 'GABA/Sono'];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A12] shadow-lg">
      <div className="w-full h-[132px] relative bg-[#08080E] overflow-hidden">
        {mode === 'tdah' && (
          <Player
            component={AdhdNeuralComposition}
            inputProps={{
              ...(adhdProps || { progressRatio: 0.3 }),
              simulateCbdModulation: simulateCbd,
              focusedNodeIdx: focusedNode,
            }}
            durationInFrames={300}
            compositionWidth={360}
            compositionHeight={140}
            fps={30}
            loop
            autoPlay
            controls={false}
            style={{ width: '100%', height: '100%' }}
          />
        )}
        {mode === 'autism' && (
          <Player
            component={AutismSpectrumComposition}
            inputProps={{
              ...(autismProps || { progressRatio: 0.3 }),
              simulateCbdModulation: simulateCbd,
              focusedNodeIdx: focusedNode,
            }}
            durationInFrames={300}
            compositionWidth={360}
            compositionHeight={140}
            fps={30}
            loop
            autoPlay
            controls={false}
            style={{ width: '100%', height: '100%' }}
          />
        )}
        {mode === 'hc' && (
          <Player
            component={HcPlantCalculatorComposition}
            inputProps={{
              ...(hcProps || {
                plantsPerCycle: 12,
                annualPlants: 36,
                dailyDoseMg: 100,
                annualGrams: 36.5,
              }),
              inspectStage: hcStage,
            }}
            durationInFrames={300}
            compositionWidth={360}
            compositionHeight={140}
            fps={30}
            loop
            autoPlay
            controls={false}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* Unified Interactive Animation Controls Bar */}
      {mode === 'tdah' && (
        <div className="px-2.5 py-2 bg-[#10101A] border-t border-white/[0.07] space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#8A8A9E] font-medium">
              Toque nos alvos neurais:
            </span>
            <button
              type="button"
              onClick={() => setSimulateCbd((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                simulateCbd
                  ? 'bg-mecura-neon text-black shadow-[0_0_10px_rgba(166,255,0,0.3)]'
                  : 'bg-sky-500/15 text-sky-300 border border-sky-400/25 hover:bg-sky-500/25'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>{simulateCbd ? 'Efeito CBD+CBG Ativo' : 'Simular CBD+CBG'}</span>
            </button>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {adhdNodeLabels.map((lbl, idx) => (
              <button
                key={`adhd-node-${lbl}-${idx}`}
                type="button"
                onClick={() => setFocusedNode(focusedNode === idx ? null : idx)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  focusedNode === idx
                    ? 'bg-sky-400 text-black font-bold'
                    : 'bg-white/[0.04] text-[#9A9AB0] hover:text-white border border-white/[0.06]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'autism' && (
        <div className="px-2.5 py-2 bg-[#10101A] border-t border-white/[0.07] space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#8A8A9E] font-medium">
              Inspecionar eixo sensorial:
            </span>
            <button
              type="button"
              onClick={() => setSimulateCbd((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                simulateCbd
                  ? 'bg-mecura-neon text-black shadow-[0_0_10px_rgba(166,255,0,0.3)]'
                  : 'bg-purple-500/15 text-purple-300 border border-purple-400/25 hover:bg-purple-500/25'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{simulateCbd ? 'Filtro CBD Ativo' : 'Simular Calma CBD'}</span>
            </button>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {autismNodeLabels.map((lbl, idx) => (
              <button
                key={`autism-node-${lbl}-${idx}`}
                type="button"
                onClick={() => setFocusedNode(focusedNode === idx ? null : idx)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  focusedNode === idx
                    ? 'bg-purple-400 text-black font-bold'
                    : 'bg-white/[0.04] text-[#9A9AB0] hover:text-white border border-white/[0.06]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'hc' && (
        <div className="px-2.5 py-2 bg-[#10101A] border-t border-white/[0.07] flex items-center justify-between gap-1.5">
          <span className="text-[10px] text-[#8A8A9E] font-medium pl-0.5 shrink-0">
            Ciclo Botânico:
          </span>
          <div className="flex items-center gap-1">
            {[
              { id: 'vegetativo', label: '1. Mudas' },
              { id: 'floracao', label: '2. Floração' },
              { id: 'extracao', label: '3. Extração' },
            ].map((st, sIdx) => (
              <button
                key={`hc-stage-${st.id}-${sIdx}`}
                type="button"
                onClick={() => setHcStage(st.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  hcStage === st.id
                    ? 'bg-mecura-neon text-black shadow-sm'
                    : 'bg-white/[0.04] text-[#9A9AB0] hover:text-white border border-white/[0.06]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
