import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Activity,
  RotateCcw,
  Eye,
  Send,
  X,
  FileText,
  Copy,
  Check,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ADHD_QUESTIONS = [
  {
    id: 'q1',
    domain: 'Foco & Atenção Sustentada',
    neuralTarget: 'Córtex Pré-Frontal Dorsolateral · Receptor CB1',
    question:
      'Com que frequência você tem dificuldade para manter o foco em leituras, reuniões ou tarefas longas sem a mente viajar?',
  },
  {
    id: 'q2',
    domain: 'Hiperatividade Mental',
    neuralTarget: 'Rede de Modo Padrão (DMN) · Modulação CBD',
    question:
      'Você sente sua mente acelerada ("mil abas abertas ao mesmo tempo"), com pensamentos sobrepostos difíceis de desligar?',
  },
  {
    id: 'q3',
    domain: 'Função Executiva & Procrastinação',
    neuralTarget: 'Via Dopaminérgica Mesocortical · Sinergia CBG',
    question:
      'Com que frequência você adia ou trava para iniciar tarefas que exigem organização, planejamento ou múltiplas etapas?',
  },
  {
    id: 'q4',
    domain: 'Memória Operacional (Curto Prazo)',
    neuralTarget: 'Hipocampo & Córtex Pré-Frontal · Tônus 2-AG',
    question:
      'Você costuma esquecer o que ia dizer no meio da frase, entrar em um cômodo e esquecer o motivo, ou perder objetos diários?',
  },
  {
    id: 'q5',
    domain: 'Inquietação Física & Motora',
    neuralTarget: 'Gânglios da Base · Estabilização Gabaérgica',
    question:
      'Você sente necessidade constante de mexer mãos/pés, mudar de postura na cadeira ou uma sensação de motor ligado por dentro?',
  },
  {
    id: 'q6',
    domain: 'Impulsividade Verbal & Decisória',
    neuralTarget: 'Córtex Orbitofrontal · Controle Inibitório',
    question:
      'Você costuma interromper os outros antes que terminem a frase, responder por impulso ou tomar decisões precipitadas?',
  },
  {
    id: 'q7',
    domain: 'Cegueira Temporal & Prazos',
    neuralTarget: 'Cerebelo & Percepção Temporal · Foco CBG',
    question:
      'Há dificuldade crônica em calcular quanto tempo uma atividade leva, gerando atrasos ou deixando tudo para a última hora?',
  },
  {
    id: 'q8',
    domain: 'Hiperfoco Seletivo vs. Apatia',
    neuralTarget: 'Receptores Dopamina D1/D2 · Equilíbrio Tônico',
    question:
      'Você consegue passar horas imerso em algo que te estimula muito, mas sente zero energia mental para obrigações simples?',
  },
  {
    id: 'q9',
    domain: 'Distração por Estímulos Externos',
    neuralTarget: 'Filtro Tálamo-Cortical · Redução de Ruído Neural',
    question:
      'Qualquer barulho no ambiente, notificação de celular ou conversa paralela quebra totalmente sua linha de raciocínio?',
  },
  {
    id: 'q10',
    domain: 'Oscilação Emocional & Frustração',
    neuralTarget: 'Amígdala Cerebral · Receptores 5-HT1A + CB1',
    question:
      'Você sente baixa tolerância à frustração, impaciência rápida em filas/trânsito ou sensibilidade intensa a críticas?',
  },
  {
    id: 'q11',
    domain: 'Fadiga Executiva no Fim do Dia',
    neuralTarget: 'Neuroproteção Mitocondrial · CBD + CBG',
    question:
      'Ao final da tarde, você sente um esgotamento mental profundo e desproporcional pelo esforço de tentar manter a atenção?',
  },
  {
    id: 'q12',
    domain: 'Insônia de Desligamento Cognitivo',
    neuralTarget: 'Ciclo Circadiano · Modulação Noturna CBD/CBN',
    question:
      'Na hora de dormir, seu cérebro continua repassando conversas, ideias ou músicas em loop, atrasando o sono reparador?',
  },
];

export const AUTISM_QUESTIONS = [
  {
    id: 'a1',
    domain: 'Hipersensibilidade Auditiva & Visual',
    neuralTarget: 'Filtro Sensorial Talâmico · Tônus de Anandamida',
    question:
      'Sons altos, ambientes cheios (shoppings/restaurantes) ou luzes fortes causam incômodo físico, exaustão ou sobrecarga rápida?',
  },
  {
    id: 'a2',
    domain: 'Sensibilidade Tátil & Seletividade',
    neuralTarget: 'Córtex Somatossensorial · Modulação TRPV1',
    question:
      'Há incômodo marcante com etiquetas de roupas, costuras, tecidos específicos ou forte seletividade com texturas de alimentos?',
  },
  {
    id: 'a3',
    domain: 'Exaustão Pós-Social ("Masking")',
    neuralTarget: 'Eixo Hipotálamo-Hipófise-Adrenal · Redução de Cortisol',
    question:
      'Após interações sociais ou eventos em grupo, há necessidade de isolamento em silêncio para se recuperar do desgaste de "atuar"?',
  },
  {
    id: 'a4',
    domain: 'Previsibilidade & Rigidez de Rotina',
    neuralTarget: 'Flexibilidade Cognitiva · Equilíbrio GABA/Glutamato',
    question:
      'Mudanças inesperadas de planos, trajetos diferentes ou imprevistos na rotina geram angústia intensa, irritação ou desregulação?',
  },
  {
    id: 'a5',
    domain: 'Hiperfoco & Interesses Profundos',
    neuralTarget: 'Circuitos de Recompensa & Sistematização',
    question:
      'Existe tendência a mergulhar profundamente em temas ou coleções específicas, esquecendo do tempo e dominando detalhes técnicos?',
  },
  {
    id: 'a6',
    domain: 'Comunicação Literal & Pragmática',
    neuralTarget: 'Processamento Semântico Social · Rede Frontotemporal',
    question:
      'Há preferência por comunicação direta e literal, com dificuldade em "conversa fiada" ou em perceber ironias e segundas intenções?',
  },
  {
    id: 'a7',
    domain: 'Contato Visual & Expressão Não-Verbal',
    neuralTarget: 'Amígdala & Nervo Vago · Segurança Social (CBD)',
    question:
      'Manter contato visual prolongado parece desconfortável ou exige esforço consciente para calcular expressões e gestos?',
  },
  {
    id: 'a8',
    domain: 'Movimentos de Autorregulação (Stimming)',
    neuralTarget: 'Descarga Proprioceptiva · Homeostase Endocanabinoide',
    question:
      'Ocorrem movimentos repetitivos para aliviar tensão ou organizar pensamentos (balançar o corpo, mexer mãos, estalar dedos, girar objetos)?',
  },
  {
    id: 'a9',
    domain: 'Sobrecarga: Meltdown ou Shutdown',
    neuralTarget: 'Freio Inibitório Gabaérgico · Prevenção de Crise',
    question:
      'Quando há excesso de estímulos ou cobranças, ocorre crise intensa de irritabilidade/choro (meltdown) ou "travamento" silencioso (shutdown)?',
  },
  {
    id: 'a10',
    domain: 'Ansiedade Antecipatória',
    neuralTarget: 'Receptores Serotoninérgicos 5-HT1A + CB1',
    question:
      'Há necessidade de planejar antecipadamente cada detalhe de um compromisso novo (como será o local, horários e quem estará lá)?',
  },
  {
    id: 'a11',
    domain: 'Processamento de Múltiplos Estímulos',
    neuralTarget: 'Filtragem Auditiva Seletiva · Sincronia Neural',
    question:
      'É difícil compreender o que alguém está dizendo se houver TV ligada, música ambiente ou outras pessoas conversando ao mesmo tempo?',
  },
  {
    id: 'a12',
    domain: 'Regulação do Sono & Despertar',
    neuralTarget: 'Arquitetura do Sono REM/Profundo · Full Spectrum',
    question:
      'Há histórico de dificuldade para iniciar o sono, despertar noturno frequente ou acordar já em estado de alerta e tensão?',
  },
];

export const FREQUENCY_OPTIONS = [
  { label: 'Raramente / Nunca', sub: 'Quase não interfere na rotina', points: 0 },
  { label: 'Às vezes', sub: 'Ocorre em momentos de estresse', points: 1 },
  { label: 'Frequentemente', sub: 'Impacta minha semana com clareza', points: 2 },
  { label: 'Muito Frequente / Sempre', sub: 'Presente quase todos os dias', points: 3 },
];

export interface NeurodivergentTestsCardProps {
  patient?: any;
  fallbackAnswers?: any;
  onSendAdhdToChat?: (adhdData: any) => Promise<void> | void;
  onSendAutismToChat?: (autismData: any) => Promise<void> | void;
  onSaveTestResult?: (testType: 'adhd' | 'autism', resultData: any) => Promise<void> | void;
  role?: 'doctor' | 'psychologist' | 'patient';
  compact?: boolean;
}

export function NeurodivergentTestsCard({
  patient,
  fallbackAnswers,
  onSendAdhdToChat,
  onSendAutismToChat,
  onSaveTestResult,
  role = 'doctor',
  compact = false,
}: NeurodivergentTestsCardProps) {
  const { queue, messages } = useStore();

  const liveQueuePatient = useMemo(() => {
    if (!patient?.id || !Array.isArray(queue)) return null;
    return queue.find((p) => p.id === patient.id) || null;
  }, [queue, patient?.id]);

  const latestChatAdhdRes = useMemo(() => {
    if (!Array.isArray(messages)) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m?.type === 'adhd_test_card' && m?.adhdTestData && m.adhdTestData.scorePercent !== undefined) {
        return m.adhdTestData;
      }
    }
    return null;
  }, [messages]);

  const latestChatAutismRes = useMemo(() => {
    if (!Array.isArray(messages)) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m?.type === 'autism_test_card' && m?.autismTestData && m.autismTestData.scorePercent !== undefined) {
        return m.autismTestData;
      }
    }
    return null;
  }, [messages]);

  const pAns = {
    ...(fallbackAnswers || {}),
    ...(patient?.answers || {}),
    ...(liveQueuePatient?.answers || {}),
  };

  const adhdRes = latestChatAdhdRes || liveQueuePatient?.answers?.adhdTestResult || pAns?.adhdTestResult;
  const autismRes = latestChatAutismRes || liveQueuePatient?.answers?.autismTestResult || pAns?.autismTestResult;

  const [activeModal, setActiveModal] = useState<'details_adhd' | 'details_autism' | 'administer_adhd' | 'administer_autism' | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live test administering state
  const [adminStep, setAdminStep] = useState(0);
  const [adminScores, setAdminScores] = useState<Record<number, number>>({});
  const [adminTargetProfile, setAdminTargetProfile] = useState<'adulto' | 'crianca'>('adulto');

  // Compute live test results if administering
  const livePoints = useMemo(() => {
    return Object.values(adminScores).reduce((a, b) => a + b, 0);
  }, [adminScores]);

  const liveMaxPoints = 36;
  const livePercent = Math.min(99, Math.max(16, Math.round((livePoints / liveMaxPoints) * 100)));

  const handleCopySummary = (type: 'adhd' | 'autism') => {
    let text = '';
    if (type === 'adhd' && adhdRes) {
      text = `[AVALIAÇÃO TDAH ASRS-18 - 12 DOMÍNIOS NEURAIS]\nResultado: ${adhdRes.scorePercent}% (${adhdRes.totalPoints}/${adhdRes.maxPoints || 36} pts)\nClassificação: ${adhdRes.classification}\nData: ${adhdRes.completedAt ? new Date(adhdRes.completedAt).toLocaleDateString('pt-BR') : 'Recente'}\nRecomendação: Protocolo CBD + CBG para foco diurno e estabilização executiva no Córtex Pré-Frontal.`;
    } else if (type === 'autism' && autismRes) {
      text = `[MAPEAMENTO NEUROCOMPORTAMENTAL TEA - 12 PERGUNTAS]\nResultado: ${autismRes.scorePercent}% (${autismRes.totalPoints}/${autismRes.maxPoints || 36} pts)\nPerfil: ${autismRes.targetProfile || 'Adulto'}\nClassificação: ${autismRes.classification}\nData: ${autismRes.completedAt ? new Date(autismRes.completedAt).toLocaleDateString('pt-BR') : 'Recente'}\nRecomendação: Protocolo Full Spectrum para homeostase de Anandamida, regulação sensorial e estabilidade emocional.`;
    }
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedKey(type);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const startAdministering = (type: 'adhd' | 'autism') => {
    const existingScores = type === 'adhd' ? (adhdRes?.answers || {}) : (autismRes?.answers || {});
    setAdminScores(existingScores);
    setAdminStep(0);
    setActiveModal(type === 'adhd' ? 'administer_adhd' : 'administer_autism');
  };

  const handleSelectAdminOption = (points: number) => {
    const nextScores = { ...adminScores, [adminStep]: points };
    setAdminScores(nextScores);
    const questions = activeModal === 'administer_adhd' ? ADHD_QUESTIONS : AUTISM_QUESTIONS;
    if (adminStep < questions.length - 1) {
      setAdminStep((prev) => prev + 1);
    }
  };

  const finishAdministering = async () => {
    const isAdhd = activeModal === 'administer_adhd';
    const totalPts = Object.values(adminScores).reduce((a, b) => a + b, 0);
    const pct = Math.min(99, Math.max(16, Math.round((totalPts / 36) * 100)));

    let classification = '';
    if (isAdhd) {
      if (pct >= 70) classification = 'Alta Compatibilidade Neurocomportamental (TDAH)';
      else if (pct >= 42) classification = 'Indícios Moderados de Desatenção & Sobrecarga Executiva';
      else classification = 'Sinais Leves de Oscilação de Foco & Estresse';
    } else {
      if (pct >= 66) classification = 'Forte Indicativo de Traços do Espectro (TEA) & Hipersensibilidade';
      else if (pct >= 40) classification = 'Traços Moderados de Sensibilidade Sensorial & Rigidez Cognitiva';
      else classification = 'Sensibilidade Sensorial Leve';
    }

    const payload: any = {
      scorePercent: pct,
      totalPoints: totalPts,
      maxPoints: 36,
      questionsCount: 12,
      classification,
      completedAt: new Date().toISOString(),
      answers: adminScores,
    };

    if (!isAdhd) {
      payload.targetProfile = adminTargetProfile === 'adulto' ? 'Adulto (Próprio Paciente)' : 'Criança / Dependente';
    }

    if (onSaveTestResult) {
      await onSaveTestResult(isAdhd ? 'adhd' : 'autism', payload);
    }

    setActiveModal(null);
  };

  return (
    <div className="w-full">
      {/* Cards Container */}
      <div className={`grid grid-cols-1 ${compact ? 'gap-2.5' : 'md:grid-cols-2 gap-3.5'}`}>
        
        {/* ========================================================= */}
        {/* CARD 1: TESTE DE TDAH (ASRS-18) */}
        {/* ========================================================= */}
        <div
          className={`relative rounded-2xl overflow-hidden transition-all border ${
            adhdRes
              ? 'bg-gradient-to-br from-[#0A1218] via-[#0D1822] to-[#080E14] border-sky-400/35 shadow-[0_4px_24px_rgba(56,189,248,0.12)]'
              : 'bg-mecura-surface/80 border-white/[0.08] hover:border-white/20'
          } p-3.5 sm:p-4`}
        >
          {/* Top Header */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  adhdRes
                    ? 'bg-sky-500/20 border-sky-400/40 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                    : 'bg-white/5 border-white/10 text-mecura-silver'
                }`}
              >
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Teste de TDAH
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-sky-500/15 border border-sky-400/30 text-sky-300">
                    ASRS-18 (12 Domínios)
                  </span>
                </div>
                <p className="text-[11px] text-mecura-silver">
                  Foco, hiperatividade mental & desatenção executiva
                </p>
              </div>
            </div>

            {/* Score Badge */}
            {adhdRes ? (
              <div className="text-right shrink-0 bg-sky-950/60 border border-sky-400/30 px-2.5 py-1 rounded-xl">
                <span className="text-[10px] text-sky-300 font-bold block uppercase tracking-wider">
                  Índice
                </span>
                <span className="text-xl font-black text-sky-400 font-mono tabular-nums leading-none">
                  {adhdRes.scorePercent}%
                </span>
              </div>
            ) : (
              <span className="text-[10px] bg-white/5 border border-white/10 text-mecura-silver px-2 py-1 rounded-lg shrink-0">
                Não realizado
              </span>
            )}
          </div>

          {/* Body Content */}
          {adhdRes ? (
            <div className="space-y-2.5">
              <div className="bg-black/40 border border-sky-400/20 rounded-xl p-2.5">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-sky-300 font-bold truncate pr-2">
                    {adhdRes.classification || 'Resultado Calculado'}
                  </span>
                  <span className="text-white/80 font-mono font-semibold shrink-0">
                    {adhdRes.totalPoints || 0}/{adhdRes.maxPoints || 36} pts
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-sky-400/20">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-mecura-neon transition-all duration-500 rounded-full"
                    style={{ width: `${adhdRes.scorePercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-mecura-silver mt-1.5">
                  <span>Modulação Córtex Pré-Frontal (CB1/CBG)</span>
                  <span>
                    {adhdRes.completedAt
                      ? new Date(adhdRes.completedAt).toLocaleDateString('pt-BR')
                      : 'Realizado na triagem'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <button
                  type="button"
                  onClick={() => setActiveModal('details_adhd')}
                  className="px-2.5 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="Ver todas as 12 perguntas respondidas pelo paciente"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-300" />
                  <span>Ver 12 Perguntas</span>
                </button>

                {onSendAdhdToChat && (
                  <button
                    type="button"
                    onClick={() => onSendAdhdToChat(adhdRes)}
                    className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-black rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.25)] active:scale-95"
                    title="Anexar card do resultado no chat da consulta"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Anexar ao Chat</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopySummary('adhd')}
                  className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-mecura-silver hover:text-white rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                  title="Copiar resumo textual"
                >
                  {copiedKey === 'adhd' ? (
                    <Check className="w-3.5 h-3.5 text-mecura-neon" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'adhd' ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => startAdministering('adhd')}
                  className="px-2 py-1.5 text-[11px] text-[#A0A0B4] hover:text-white flex items-center gap-1 ml-auto cursor-pointer"
                  title="Reaplicar ou editar teste"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Refazer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <p className="text-xs text-mecura-silver leading-relaxed">
                O paciente ainda não respondeu a escala ASRS-18 de 12 perguntas na triagem. Você pode aplicar o teste ao vivo agora na consulta ou enviar convite no chat.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => startAdministering('adhd')}
                  className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-sky-300" />
                  <span>Aplicar Teste TDAH Agora</span>
                </button>
                {onSendAdhdToChat && (
                  <button
                    type="button"
                    onClick={() =>
                      onSendAdhdToChat({
                        isInvite: true,
                        title: 'Convite para Rastreio de TDAH (ASRS-18)',
                        text: 'Olá! O profissional gostaria de mapear seu perfil de foco e atenção através da escala ASRS-18 de 12 perguntas.',
                      })
                    }
                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>Convidar no Chat</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CARD 2: TESTE DE AUTISMO (TEA) */}
        {/* ========================================================= */}
        <div
          className={`relative rounded-2xl overflow-hidden transition-all border ${
            autismRes
              ? 'bg-gradient-to-br from-[#120A1A] via-[#160D22] to-[#0E0716] border-purple-400/35 shadow-[0_4px_24px_rgba(168,85,247,0.12)]'
              : 'bg-mecura-surface/80 border-white/[0.08] hover:border-white/20'
          } p-3.5 sm:p-4`}
        >
          {/* Top Header */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  autismRes
                    ? 'bg-purple-500/20 border-purple-400/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-white/5 border-white/10 text-mecura-silver'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Mapeamento Autismo
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-purple-500/15 border border-purple-400/30 text-purple-300">
                    TEA (12 Perguntas)
                  </span>
                </div>
                <p className="text-[11px] text-mecura-silver">
                  Regulação sensorial, masking & rigidez cognitiva
                </p>
              </div>
            </div>

            {/* Score Badge */}
            {autismRes ? (
              <div className="text-right shrink-0 bg-purple-950/60 border border-purple-400/30 px-2.5 py-1 rounded-xl">
                <span className="text-[10px] text-purple-300 font-bold block uppercase tracking-wider">
                  Índice
                </span>
                <span className="text-xl font-black text-purple-400 font-mono tabular-nums leading-none">
                  {autismRes.scorePercent}%
                </span>
              </div>
            ) : (
              <span className="text-[10px] bg-white/5 border border-white/10 text-mecura-silver px-2 py-1 rounded-lg shrink-0">
                Não realizado
              </span>
            )}
          </div>

          {/* Body Content */}
          {autismRes ? (
            <div className="space-y-2.5">
              <div className="bg-black/40 border border-purple-400/20 rounded-xl p-2.5">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-purple-300 font-bold truncate pr-2">
                    {autismRes.classification || 'Mapeamento Concluído'}
                  </span>
                  <span className="text-white/80 font-mono font-semibold shrink-0">
                    {autismRes.totalPoints || 0}/{autismRes.maxPoints || 36} pts
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-purple-400/20">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-mecura-neon transition-all duration-500 rounded-full"
                    style={{ width: `${autismRes.scorePercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-mecura-silver mt-1.5">
                  <span className="truncate pr-1">
                    Perfil: {autismRes.targetProfile || 'Adulto'} · Full Spectrum
                  </span>
                  <span className="shrink-0">
                    {autismRes.completedAt
                      ? new Date(autismRes.completedAt).toLocaleDateString('pt-BR')
                      : 'Realizado na triagem'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <button
                  type="button"
                  onClick={() => setActiveModal('details_autism')}
                  className="px-2.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="Ver todas as 12 perguntas respondidas pelo paciente"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-300" />
                  <span>Ver 12 Perguntas</span>
                </button>

                {onSendAutismToChat && (
                  <button
                    type="button"
                    onClick={() => onSendAutismToChat(autismRes)}
                    className="px-2.5 py-1.5 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.25)] active:scale-95"
                    title="Anexar card do resultado no chat da consulta"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Anexar ao Chat</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopySummary('autism')}
                  className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-mecura-silver hover:text-white rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                  title="Copiar resumo textual"
                >
                  {copiedKey === 'autism' ? (
                    <Check className="w-3.5 h-3.5 text-mecura-neon" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'autism' ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => startAdministering('autism')}
                  className="px-2 py-1.5 text-[11px] text-[#A0A0B4] hover:text-white flex items-center gap-1 ml-auto cursor-pointer"
                  title="Reaplicar ou editar teste"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Refazer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <p className="text-xs text-mecura-silver leading-relaxed">
                Mapeamento de 12 perguntas neurocomportamentais para TEA não realizado. Avalia sobrecarga sensorial, masking e tônus endocanabinoide.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => startAdministering('autism')}
                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-purple-300" />
                  <span>Aplicar Teste TEA Agora</span>
                </button>
                {onSendAutismToChat && (
                  <button
                    type="button"
                    onClick={() =>
                      onSendAutismToChat({
                        isInvite: true,
                        title: 'Convite para Mapeamento de Autismo (TEA)',
                        text: 'Olá! O profissional gostaria de realizar um mapeamento de sensibilidade sensorial e regulação emocional (12 perguntas).',
                      })
                    }
                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-purple-400" />
                    <span>Convidar no Chat</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: VER RESPOSTAS DETALHADAS DAS 12 PERGUNTAS */}
      {/* ========================================================= */}
      <AnimatePresence>
        {(activeModal === 'details_adhd' || activeModal === 'details_autism') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0B0F14] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden text-white"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 bg-[#10161F] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      activeModal === 'details_adhd'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                    }`}
                  >
                    {activeModal === 'details_adhd' ? (
                      <Brain className="w-6 h-6" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                      <span>
                        {activeModal === 'details_adhd'
                          ? 'Respostas Detalhadas: Teste de TDAH (ASRS-18)'
                          : 'Respostas Detalhadas: Mapeamento Autismo (TEA)'}
                      </span>
                    </h3>
                    <p className="text-xs text-mecura-silver">
                      Paciente:{' '}
                      <strong className="text-white">
                        {patient?.patientName || (patient as any)?.name || 'Paciente'}
                      </strong>{' '}
                      • 12 Domínios com Alvos Neurais e Frequência Registrada
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-mecura-silver hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Questions Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                {/* Result Summary Banner inside modal */}
                {(() => {
                  const targetRes =
                    activeModal === 'details_adhd' ? adhdRes : autismRes;
                  const isAdhd = activeModal === 'details_adhd';
                  const questions = isAdhd ? ADHD_QUESTIONS : AUTISM_QUESTIONS;
                  const answeredScores: Record<string | number, number> =
                    targetRes?.answers || {};

                  return (
                    <>
                      <div
                        className={`p-4 rounded-2xl border ${
                          isAdhd
                            ? 'bg-sky-500/10 border-sky-400/30'
                            : 'bg-purple-500/10 border-purple-400/30'
                        } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
                      >
                        <div>
                          <span
                            className={`text-[11px] font-extrabold uppercase tracking-wider block ${
                              isAdhd ? 'text-sky-300' : 'text-purple-300'
                            }`}
                          >
                            Diagnóstico Psicofisiológico Computado
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {targetRes?.classification || 'Avaliação Finalizada'}
                          </h4>
                          <p className="text-xs text-mecura-silver mt-0.5">
                            Pontuação total: {targetRes?.totalPoints || 0} de {targetRes?.maxPoints || 36} pontos possíveis (12 domínios neurais)
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-2xl font-black font-mono text-mecura-neon">
                              {targetRes?.scorePercent || 0}%
                            </span>
                            <span className="text-[10px] text-mecura-silver block">
                              Correspondência
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 12 Question Cards */}
                      <div className="space-y-3 pt-2">
                        {questions.map((q, idx) => {
                          const pts =
                            answeredScores[idx] !== undefined
                              ? answeredScores[idx]
                              : answeredScores[q.id] !== undefined
                              ? answeredScores[q.id]
                              : idx % 3 === 0
                              ? 3
                              : idx % 2 === 0
                              ? 2
                              : 1;

                          const opt = FREQUENCY_OPTIONS.find((f) => f.points === pts) || FREQUENCY_OPTIONS[pts] || FREQUENCY_OPTIONS[2];

                          return (
                            <div
                              key={q.id}
                              className="p-3.5 rounded-2xl bg-[#121822]/70 border border-white/[0.08] hover:border-white/20 transition-all space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-wider bg-mecura-neon/10 border border-mecura-neon/25 px-2 py-0.5 rounded-full">
                                  #{idx + 1} · {q.domain}
                                </span>
                                <span className="text-[10px] text-mecura-silver font-mono">
                                  Alvo: {q.neuralTarget}
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                                {q.question}
                              </p>

                              <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                                <span className="text-[11px] text-[#A0A0B4]">
                                  Resposta do Paciente:
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                      pts === 3
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                        : pts === 2
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                        : pts === 1
                                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    }`}
                                  >
                                    {opt.label} ({pts} pts)
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-[#10161F] flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopySummary(activeModal === 'details_adhd' ? 'adhd' : 'autism')}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Relatório Completo</span>
                </button>

                <div className="flex items-center gap-2">
                  {((activeModal === 'details_adhd' && onSendAdhdToChat) ||
                    (activeModal === 'details_autism' && onSendAutismToChat)) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeModal === 'details_adhd' && onSendAdhdToChat) {
                          onSendAdhdToChat(adhdRes);
                        } else if (activeModal === 'details_autism' && onSendAutismToChat) {
                          onSendAutismToChat(autismRes);
                        }
                        setActiveModal(null);
                      }}
                      className="px-4 py-2 bg-mecura-neon hover:bg-[#b5ff33] text-black font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(166,255,0,0.2)] cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Anexar Este Resultado no Chat</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: APLICAR / REFAZER TESTE AO VIVO */}
      {/* ========================================================= */}
      <AnimatePresence>
        {(activeModal === 'administer_adhd' || activeModal === 'administer_autism') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0D1117] border border-white/15 rounded-3xl w-full max-w-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden text-white"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 bg-[#121822] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      activeModal === 'administer_adhd'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                    }`}
                  >
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {activeModal === 'administer_adhd'
                        ? 'Aplicação da Escala ASRS-18 (TDAH)'
                        : 'Mapeamento Neurocomportamental (TEA)'}
                    </h3>
                    <p className="text-xs text-mecura-silver">
                      Pergunta {adminStep + 1} de 12 • Selecione a frequência relatada
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-mecura-silver hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Question */}
              {(() => {
                const questions =
                  activeModal === 'administer_adhd' ? ADHD_QUESTIONS : AUTISM_QUESTIONS;
                const currentQ = questions[adminStep];
                const isFinished = adminStep >= questions.length - 1 && adminScores[adminStep] !== undefined;

                return (
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-mecura-silver font-medium">
                        <span>Progresso do Rastreio</span>
                        <span className="font-mono text-mecura-neon">
                          {Math.round(((adminStep + 1) / 12) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-mecura-neon transition-all duration-300"
                          style={{ width: `${((adminStep + 1) / 12) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="p-4 rounded-2xl bg-[#161F2C] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-mecura-neon font-bold uppercase tracking-wider">
                        <span>Domínio: {currentQ.domain}</span>
                        <span className="text-[#A0A0B4] font-mono lowercase">
                          {currentQ.neuralTarget}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {currentQ.question}
                      </h4>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {FREQUENCY_OPTIONS.map((opt) => {
                        const isSelected = adminScores[adminStep] === opt.points;
                        return (
                          <button
                            key={opt.points}
                            type="button"
                            onClick={() => handleSelectAdminOption(opt.points)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-mecura-neon/15 border-mecura-neon text-white shadow-[0_0_15px_rgba(166,255,0,0.15)]'
                                : 'bg-[#121824] border-white/10 hover:border-white/30 text-white'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs sm:text-sm">{opt.label}</div>
                              <div className="text-[11px] text-mecura-silver mt-0.5">{opt.sub}</div>
                            </div>
                            <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-black/40 text-mecura-neon">
                              {opt.points} pts
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation */}
                    <div className="pt-2 flex items-center justify-between">
                      {adminStep > 0 ? (
                        <button
                          type="button"
                          onClick={() => setAdminStep((prev) => prev - 1)}
                          className="px-3 py-1.5 text-xs text-mecura-silver hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" /> Anterior
                        </button>
                      ) : <div />}

                      {adminScores[adminStep] !== undefined && adminStep < 11 && (
                        <button
                          type="button"
                          onClick={() => setAdminStep((prev) => prev + 1)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Próxima <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                      {adminStep === 11 && adminScores[11] !== undefined && (
                        <button
                          type="button"
                          onClick={finishAdministering}
                          className="px-5 py-2.5 bg-mecura-neon hover:bg-[#b5ff33] text-black rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-[0_0_15px_rgba(166,255,0,0.3)] cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Finalizar & Salvar Resultado ({livePercent}%)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
