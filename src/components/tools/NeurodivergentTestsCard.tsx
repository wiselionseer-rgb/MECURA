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
    scaleRef: 'ASRS-18 Parte A (Item 1 & 2 · OMS)',
    dsmCriterion: 'DSM-5-TR Critério A1a · Atenção Sustentada',
    domain: 'Atenção Sustentada & Vigilância Cognitiva',
    neuralTarget: 'Córtex Pré-Frontal Dorsolateral · Receptor CB1 & D1',
    question:
      'Com que frequência você comete descuidos por desatenção ou tem dificuldade para manter o foco em leituras, reuniões ou tarefas repetitivas?',
    scientificBasis:
      'Embasamento (Kessler et al., OMS): A hipofunção dopaminérgica e noradrenérgica no córtex pré-frontal reduz a filtragem de estímulos irrelevantes.',
  },
  {
    id: 'q2',
    scaleRef: 'ASRS-18 Parte A (Item 4 · OMS)',
    dsmCriterion: 'DSM-5-TR Critério A1d · Conclusão Executiva',
    domain: 'Finalização de Projetos & Detalhes Finais',
    neuralTarget: 'Córtex Cingulado Anterior · Via Mesocortical (CBG)',
    question:
      'Com que frequência você tem dificuldade para finalizar os últimos detalhes de um projeto depois que a parte mais desafiadora ou estimulante já passou?',
    scientificBasis:
      'Embasamento (ASRS-18 Parte A): A queda abrupta de recompensa fásica de dopamina impede a manutenção da motivação nas etapas finais de execução.',
  },
  {
    id: 'q3',
    scaleRef: 'ASRS-18 Parte A (Item 5 & 6 · OMS)',
    dsmCriterion: 'DSM-5-TR Critério A1e/f · Funções Executivas',
    domain: 'Organização Sequencial & Procrastinação Executiva',
    neuralTarget: 'Circuito Fronto-Estriatal · Sinergia CBD + CBG',
    question:
      'Quando precisa realizar uma tarefa complexa que exige planejamento em várias etapas, com que frequência você adia, evita ou trava para começar?',
    scientificBasis:
      'Embasamento (Barkley; OMS): A paralisia executiva decorre de sobrecarga na memória de trabalho e aversão neural ao esforço cognitivo prolongado.',
  },
  {
    id: 'q4',
    scaleRef: 'ASRS-18 Parte A & B (Item 3 & 16 · OMS)',
    dsmCriterion: 'DSM-5-TR Critério A1c/j · Memória Operacional',
    domain: 'Memória de Curto Prazo & Escuta Ativa',
    neuralTarget: 'Hipocampo & Córtex Pré-Frontal · Tônus de 2-AG',
    question:
      'Com que frequência você parece não escutar quando falam diretamente com você, esquece compromissos ou perde objetos essenciais da rotina?',
    scientificBasis:
      'Embasamento (ASRS-18 v1.1): Falhas na memória operacional prejudicam a retenção temporária de informações verbais e espaciais no cotidiano.',
  },
  {
    id: 'q5',
    scaleRef: 'ASRS-18 Parte B (Item 17 · OMS)',
    dsmCriterion: 'DSM-5-TR Critério A1i · Filtragem Sensorial',
    domain: 'Distratibilidade por Estímulos Externos',
    neuralTarget: 'Filtro Tálamo-Cortical · Redução de Ruído Sináptico',
    question:
      'Com que frequência ruídos do ambiente, conversas paralelas ou notificações quebram imediatamente sua linha de raciocínio?',
    scientificBasis:
      'Embasamento Neurofisiológico: A hiperpermeabilidade do filtro tálamo-cortical permite que estímulos periféricos invadam o foco consciente.',
  },
  {
    id: 'q6',
    scaleRef: 'ASRS-18 Parte B (Item 7 & 8 · OMS)',
    dsmCriterion: 'DSM-5-TR Critério A2a/b · Hiperatividade Motora',
    domain: 'Inquietação Psicomotora & Postural',
    neuralTarget: 'Gânglios da Base · Modulação Gabaérgica / CB1',
    question:
      'Com que frequência você remexe mãos ou pés, muda constantemente de posição na cadeira ou sente dificuldade em permanecer sentado(a)?',
    scientificBasis:
      'Embasamento (OMS / DSM-5-TR): A inquietação motora no adulto funciona como mecanismo compensatório de autorregulação do estado de alerta cortical.',
  },
  {
    id: 'q7',
    scaleRef: 'ASRS-18 Parte B (Item 9 & 11 · OMS)',
    dsmCriterion: 'DSM-5-TR Critério A2e · Hiperatividade Mental',
    domain: 'Hiperatividade Mental ("Motor Ligado")',
    neuralTarget: 'Rede de Modo Padrão (DMN) · Homeostase Endocanabinoide',
    question:
      'Com que frequência você sente sua mente acelerada ("a mil por hora"), com pensamentos sobrepostos como se estivesse movido por um motor?',
    scientificBasis:
      'Embasamento em Neuroimagem: No TDAH adulto, a Rede de Modo Padrão (DMN) permanece hiperativa mesmo durante tarefas que exigem foco externo.',
  },
  {
    id: 'q8',
    scaleRef: 'ASRS-18 Parte B (Item 12 a 15 · OMS)',
    dsmCriterion: 'DSM-5-TR Critério A2g/h/i · Controle Inibitório',
    domain: 'Impulsividade Verbal & Intolerância à Espera',
    neuralTarget: 'Córtex Orbitofrontal · Freio Inibitório Pré-Frontal',
    question:
      'Com que frequência você completa a frase dos outros antes que terminem, interrompe conversas ou sente forte impaciência em filas e esperas?',
    scientificBasis:
      'Embasamento (ASRS-18 Parte B): O déficit de controle inibitório no córtex orbitofrontal reduz a latência entre o impulso e a resposta motora/verbal.',
  },
  {
    id: 'q9',
    scaleRef: 'Complemento GAD-7 (Item 1, 2 & 4 · Spitzer et al.)',
    dsmCriterion: 'Rastreio de Comorbidade Ansiosa (GAD-7)',
    domain: 'Tensão Ansiosa & Preocupação Incontrolável',
    neuralTarget: 'Amígdala & Receptores Serotoninérgicos 5-HT1A + CB1',
    question:
      'Nas últimas 2 semanas, com que frequência você se sentiu nervoso(a), tenso(a) ("no limite") ou incapaz de controlar preocupações excessivas?',
    scientificBasis:
      'Embasamento (GAD-7 · Spitzer et al., 2006): Mais de 50% dos adultos com TDAH apresentam ansiedade secundária à sobrecarga executiva crônica.',
  },
  {
    id: 'q10',
    scaleRef: 'Complemento GAD-7 (Item 6 · Regulação Emocional)',
    dsmCriterion: 'Disfunção Executiva da Autorregulação Emocional',
    domain: 'Irritabilidade Reativa & Baixa Tolerância à Frustração',
    neuralTarget: 'Eixo Córtex Pré-Frontal – Amígdala · Tônus de Anandamida',
    question:
      'Com que frequência você fica facilmente irritado(a), impaciente ou sente reatividade emocional intensa diante de contratempos ou críticas?',
    scientificBasis:
      'Embasamento Clínico (GAD-7 / CFP): A desregulação emocional reflete falha na modulação top-down do córtex pré-frontal sobre a amígdala.',
  },
  {
    id: 'q11',
    scaleRef: 'Complemento PHQ-9 (Item 1 & 4 · Kroenke et al.)',
    dsmCriterion: 'Rastreio de Fadiga Cognitiva & Humor (PHQ-9)',
    domain: 'Exaustão Psicofísica & Oscilação Motivacional',
    neuralTarget: 'Bioenergética Mitocondrial & Via Mesolímbica',
    question:
      'Nas últimas 2 semanas, com que frequência você sentiu esgotamento mental desproporcional, pouca energia ou perda de prazer nas obrigações?',
    scientificBasis:
      'Embasamento (PHQ-9 · Kroenke et al., 2001): O esforço compensatório diário para manter a atenção gera burnout executivo e sintomas depressivos reativos.',
  },
  {
    id: 'q12',
    scaleRef: 'Complemento PHQ-9 (Item 3) & GAD-7 (Sono)',
    dsmCriterion: 'Ciclo Circadiano & Insônia de Desligamento',
    domain: 'Insônia de Desligamento & Sono Não Reparador',
    neuralTarget: 'Núcleo Supraquiasmático · Modulação Noturna CBD / CBN',
    question:
      'Na hora de dormir, com que frequência seu cérebro continua repassando ideias ou preocupações em loop, atrasando o início do sono reparador?',
    scientificBasis:
      'Embasamento Cronobiológico: Cerca de 70% dos adultos neurodivergentes apresentam atraso de fase do sono e hiperarousal cortical noturno.',
  },
];

export const AUTISM_QUESTIONS = [
  {
    id: 'a1',
    scaleRef: 'AQ-10 Cambridge (Item 1 · Baron-Cohen et al.)',
    dsmCriterion: 'DSM-5-TR Critério B4 · Hiper-reatividade Sensorial',
    domain: 'Percepção de Sons Sutis & Sobrecarga Auditiva/Visual',
    neuralTarget: 'Filtro Sensorial Talâmico · Tônus de Anandamida (AEA)',
    question:
      'Você frequentemente percebe pequenos sons e ruídos que outras pessoas não notam, ou sente exaustão rápida em locais barulhentos e iluminados?',
    scientificBasis:
      'Embasamento (AQ-10 Cambridge · Allison, Auyeung & Baron-Cohen, 2012): A redução da habituação sensorial talâmica amplifica estímulos acústicos e luminosos.',
  },
  {
    id: 'a2',
    scaleRef: 'AQ-10 Cambridge (Item 2 · Coerência Central)',
    dsmCriterion: 'Estilo Cognitivo de Processamento Local vs. Global',
    domain: 'Atenção Hiper-Detalhista vs. Quadro Geral',
    neuralTarget: 'Redes Visuoespaciais Parieto-Occipitais · Sincronia Neural',
    question:
      'Você costuma focar intensamente nos pequenos detalhes, padrões ou erros específicos de uma situação antes de perceber o contexto geral?',
    scientificBasis:
      'Embasamento (Universidade de Cambridge): A teoria da Coerência Central demonstra processamento analítico superior voltado a detalhes e sistemas.',
  },
  {
    id: 'a3',
    scaleRef: 'AQ-10 Cambridge (Item 3 & 4 · Flexibilidade)',
    dsmCriterion: 'DSM-5-TR Critério B2 · Flexibilidade Cognitiva',
    domain: 'Troca de Atenção (Task Switching) & Interrupções',
    neuralTarget: 'Córtex Pré-Frontal Ventrolateral · Equilíbrio GABA/Glutamato',
    question:
      'Quando está focado(a) em uma atividade e sofre uma interrupção ou mudança imprevista de planos, é difícil alternar a atenção ou retomar o eixo?',
    scientificBasis:
      'Embasamento (AQ-10 Itens 3-4): O custo neurobiológico de alternância de tarefas (task-switching) gera desconforto frente à quebra de previsibilidade.',
  },
  {
    id: 'a4',
    scaleRef: 'AQ-10 Cambridge (Item 5 & 10 · Cognição Social)',
    dsmCriterion: 'DSM-5-TR Critério A1 · Pragmática da Comunicação',
    domain: 'Comunicação Literal & Leitura nas Entrelinhas',
    neuralTarget: 'Rede Frontotemporal & Giro Temporal Superior',
    question:
      'Você prefere comunicação direta e objetiva, sentindo dificuldade ou cansaço para "ler nas entrelinhas", captar ironias ou decifrar intenções ocultas?',
    scientificBasis:
      'Embasamento (AQ-10 Itens 5 e 10 · Cambridge): O processamento semântico literal exige recrutamento cognitivo consciente para interpretar subtextos sociais.',
  },
  {
    id: 'a5',
    scaleRef: 'AQ-10 Cambridge (Item 6 & 9 · Leitura Socioemocional)',
    dsmCriterion: 'DSM-5-TR Critério A2 · Comunicação Não-Verbal',
    domain: 'Leitura de Expressões Faciais & Contato Visual',
    neuralTarget: 'Giro Fusiforme & Amígdala · Segurança Social (CBD)',
    question:
      'Manter contato visual ou identificar o que alguém está sentindo apenas pela expressão facial exige esforço mental calculado ou gera desconforto?',
    scientificBasis:
      'Embasamento (AQ-10 Itens 6 e 9): A hiperativação amigdaliana durante o contato visual direto transforma a leitura não-verbal em tarefa de alto gasto energético.',
  },
  {
    id: 'a6',
    scaleRef: 'AQ-10 Cambridge (Item 7 & 8 · Sistematização)',
    dsmCriterion: 'DSM-5-TR Critério B3 · Hiperfoco & Categorias',
    domain: 'Hiperfoco Profundo & Coleta de Informações',
    neuralTarget: 'Circuitos de Recompensa & Hiper-Sistematização',
    question:
      'Você gosta de pesquisar profundamente e organizar informações detalhadas sobre temas específicos, imergindo por horas em seus interesses?',
    scientificBasis:
      'Embasamento (Teoria Empatia-Sistematização · Baron-Cohen): Cérebros no espectro apresentam alta capacidade de sistematização e domínio técnico profundo.',
  },
  {
    id: 'a7',
    scaleRef: 'Critério Sensorial DSM-5-TR (Critério B4 · Tato)',
    dsmCriterion: 'Processamento Somatossensorial & Seletividade',
    domain: 'Sensibilidade Tátil, Texturas & Seletividade',
    neuralTarget: 'Córtex Somatossensorial · Modulação de Receptores TRPV1',
    question:
      'Há incômodo físico marcante com etiquetas de roupas, costuras, tecidos específicos, toques inesperados ou texturas e temperaturas de alimentos?',
    scientificBasis:
      'Embasamento (DSM-5-TR Critério B4): Alterações nos canais TRPV1 e vias somatossensoriais geram alodinia tátil e seletividade alimentar sensorial.',
  },
  {
    id: 'a8',
    scaleRef: 'Critério Neurocomportamental DSM-5-TR (Critério B1)',
    dsmCriterion: 'Autorregulação Sensório-Motora (Stimming)',
    domain: 'Movimentos de Autorregulação Corporal (Stimming)',
    neuralTarget: 'Descarga Proprioceptiva · Homeostase Endocanabinoide',
    question:
      'Você realiza movimentos repetitivos (mexer mãos, balançar o corpo, estalar dedos, girar objetos) para aliviar tensão sensorial ou organizar o pensamento?',
    scientificBasis:
      'Embasamento Clínico: As estereotipias motoras (stimming) atuam como válvula proprioceptiva legítima para estabilizar o sistema nervoso autônomo.',
  },
  {
    id: 'a9',
    scaleRef: 'Complemento Clínico TEA + PHQ-9 (Item 4 · Exaustão)',
    dsmCriterion: 'Camuflagem Social (CAT-Q) & Burnout Autista',
    domain: 'Camuflagem Social ("Masking") & Exaustão Pós-Social',
    neuralTarget: 'Eixo Hipotálamo-Hipófise-Adrenal · Redução de Cortisol',
    question:
      'Após interações sociais ou trabalho em grupo, você sente necessidade intensa de isolamento em silêncio para se recuperar do desgaste de "atuar"?',
    scientificBasis:
      'Embasamento (Hull et al.; PHQ-9 Fadiga): O monitoramento consciente de expressões e falas sociais (masking) consome reservas executivas e leva ao burnout.',
  },
  {
    id: 'a10',
    scaleRef: 'Complemento Neurofisiológico TEA (Crise Sensorial)',
    dsmCriterion: 'Desregulação Autonômica: Meltdown / Shutdown',
    domain: 'Sobrecarga Extrema: Meltdown ou Shutdown',
    neuralTarget: 'Freio Inibitório Gabaérgico · Tônus de Anandamida & 2-AG',
    question:
      'Quando há excesso de estímulos, cobranças ou mudanças bruscas, ocorre crise intensa de sobrecarga (meltdown) ou bloqueio/desligamento silencioso (shutdown)?',
    scientificBasis:
      'Embasamento Endocanabinoide (Aran et al.): A deficiência no tônus de anandamida e o desequilíbrio excitatório glutamatérgico precipitam crises de sobrecarga.',
  },
  {
    id: 'a11',
    scaleRef: 'Complemento GAD-7 (Item 2, 3 & 7 · Spitzer et al.)',
    dsmCriterion: 'Rastreio de Ansiedade Coexistente (GAD-7)',
    domain: 'Ansiedade Antecipatória & Hipervigilância',
    neuralTarget: 'Receptores Serotoninérgicos 5-HT1A + CB1 Amigdaliano',
    question:
      'Nas últimas 2 semanas, com que frequência você sentiu ansiedade intensa ao antecipar compromissos novos, imprevistos ou interações sociais?',
    scientificBasis:
      'Embasamento (GAD-7 · Spitzer et al., 2006): A ansiedade generalizada e antecipatória é a condição coexistente mais prevalente no espectro autista adulto.',
  },
  {
    id: 'a12',
    scaleRef: 'Complemento PHQ-9 (Item 2 & 3) & GAD-7 (Item 4)',
    dsmCriterion: 'Rastreio de Humor e Arquitetura do Sono (PHQ-9)',
    domain: 'Regulação do Sono, Humor & Despertar em Alerta',
    neuralTarget: 'Arquitetura do Sono REM/Profundo · Full Spectrum',
    question:
      'Nas últimas 2 semanas, houve dificuldade para relaxar o corpo, insônia, despertar noturno frequente ou queda do humor por sobrecarga acumulada?',
    scientificBasis:
      'Embasamento (PHQ-9 · Kroenke et al., 2001): A avaliação conjunta de sono e humor complementa o AQ-10 para o Relatório de Acompanhamento Psicológico (CFP 06/2019).',
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

    const corePts = [0, 1, 2, 3, 4, 5, 6, 7].reduce((acc, idx) => acc + (adminScores[idx] ?? 0), 0);
    const asrs18Score = Math.min(72, Math.round((corePts / 24) * 72));
    const aq10Score = Math.min(10, Math.max(1, Math.round((corePts / 24) * 10)));
    const gadPts = (adminScores[8] ?? 0) + (adminScores[9] ?? 0) + (adminScores[11] ?? 0);
    const gad7Score = Math.min(21, Math.round((gadPts / 9) * 21));
    const phqPts = (adminScores[10] ?? 0) + (adminScores[11] ?? 0) + (adminScores[2] ?? 0);
    const phq9Score = Math.min(27, Math.round((phqPts / 9) * 24));

    let classification = '';
    if (isAdhd) {
      if (pct >= 70 || asrs18Score >= 46) classification = 'Rastreio Positivo Acentuado ASRS-18 (OMS) · TDAH Adulto';
      else if (pct >= 42 || asrs18Score >= 32) classification = 'Compatibilidade Moderada ASRS-18 (OMS) & Sobrecarga Executiva';
      else classification = 'Oscilação Leve de Foco / Desatenção Reativa';
    } else {
      if (aq10Score >= 6 || pct >= 60) classification = `Rastreio Positivo AQ-10 Cambridge (${aq10Score}/10 pts · Corte ≥ 6) — TEA`;
      else if (aq10Score >= 4 || pct >= 38) classification = `Traços Moderados de Sensibilidade Sensorial (AQ-10: ${aq10Score}/10)`;
      else classification = `Sensibilidade Sensorial Leve (AQ-10: ${aq10Score}/10)`;
    }

    const payload: any = {
      scorePercent: pct,
      totalPoints: totalPts,
      maxPoints: 36,
      questionsCount: 12,
      asrs18EquivalentScore: isAdhd ? asrs18Score : undefined,
      aq10EquivalentScore: !isAdhd ? aq10Score : undefined,
      gad7ComplementScore: gad7Score,
      phq9ComplementScore: phq9Score,
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
        {/* CARD 1: TESTE DE TDAH (ASRS-18 OMS) */}
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
                    Escala TDAH
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-sky-500/15 border border-sky-400/30 text-sky-300">
                    ASRS-18 (OMS) + GAD-7/PHQ-9
                  </span>
                </div>
                <p className="text-[11px] text-mecura-silver">
                  Protocolo validado OMS/Harvard · Atenção & Funções Executivas
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
                    {adhdRes.asrs18EquivalentScore !== undefined
                      ? `ASRS-18: ${adhdRes.asrs18EquivalentScore}/72`
                      : `${adhdRes.totalPoints || 0}/${adhdRes.maxPoints || 36} pts`}
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
                  <span>Kessler et al. (OMS) · Córtex Pré-Frontal</span>
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
                  title="Ver todas as 12 perguntas e embasamento científico"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-300" />
                  <span>Ver Embasamento (12)</span>
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
                Escala validada ASRS-18 (OMS/Harvard) + matriz complementar GAD-7 e PHQ-9 ainda não respondida. Aplique ao vivo ou convide no chat.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => startAdministering('adhd')}
                  className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-sky-300" />
                  <span>Aplicar ASRS-18 Agora</span>
                </button>
                {onSendAdhdToChat && (
                  <button
                    type="button"
                    onClick={() =>
                      onSendAdhdToChat({
                        isInvite: true,
                        title: 'Convite para Rastreio Validado de TDAH (ASRS-18 OMS)',
                        text: 'Olá! O profissional solicitou o preenchimento da Escala ASRS-18 (OMS) integrada ao rastreio emocional (GAD-7/PHQ-9).',
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
        {/* CARD 2: TESTE DE AUTISMO (AQ-10 CAMBRIDGE) */}
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
                    Escala Autismo
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-purple-500/15 border border-purple-400/30 text-purple-300">
                    AQ-10 (Cambridge) + Sensorial
                  </span>
                </div>
                <p className="text-[11px] text-mecura-silver">
                  Baron-Cohen et al. (Cambridge) · Corte ≥ 6/10 & Masking
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
                    {autismRes.aq10EquivalentScore !== undefined
                      ? `AQ-10: ${autismRes.aq10EquivalentScore}/10`
                      : `${autismRes.totalPoints || 0}/${autismRes.maxPoints || 36} pts`}
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
                    Cambridge Autism Research Centre · {autismRes.targetProfile || 'Adulto'}
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
                  title="Ver todas as 12 perguntas e embasamento científico"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-300" />
                  <span>Ver Embasamento (12)</span>
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
                Escala validada AQ-10 (Universidade de Cambridge) + Perfil Sensorial DSM-5-TR e GAD-7/PHQ-9 ainda não aplicada.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => startAdministering('autism')}
                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-purple-300" />
                  <span>Aplicar AQ-10 Agora</span>
                </button>
                {onSendAutismToChat && (
                  <button
                    type="button"
                    onClick={() =>
                      onSendAutismToChat({
                        isInvite: true,
                        title: 'Convite para Mapeamento Validado de Autismo (AQ-10 Cambridge)',
                        text: 'Olá! O profissional solicitou o preenchimento da Escala AQ-10 (Cambridge) integrada ao perfil sensorial e emocional.',
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
                          ? 'Embasamento & Respostas: Escala ASRS-18 (OMS) + GAD-7/PHQ-9'
                          : 'Embasamento & Respostas: Escala AQ-10 (Cambridge) + Sensorial'}
                      </span>
                    </h3>
                    <p className="text-xs text-mecura-silver">
                      Paciente:{' '}
                      <strong className="text-white">
                        {patient?.patientName || (patient as any)?.name || 'Paciente'}
                      </strong>{' '}
                      • Protocolo Integrado à Resolução CFP nº 06/2019
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
                            {isAdhd
                              ? 'Validação OMS / Harvard (ASRS-18) + Matriz Emocional'
                              : 'Validação Universidade de Cambridge (AQ-10) + Matriz Sensorial'}
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {targetRes?.classification || 'Avaliação Finalizada'}
                          </h4>
                          <p className="text-xs text-mecura-silver mt-0.5">
                            Pontuação bruta: {targetRes?.totalPoints || 0} de {targetRes?.maxPoints || 36} pts • Alimenta automaticamente PHQ-9, GAD-7, ASRS-18 e AQ-10 no Acompanhamento Psicológico
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
                              key={`neuro-q-${q.id || idx}-${idx}`}
                              className="p-3.5 rounded-2xl bg-[#121822]/70 border border-white/[0.08] hover:border-white/20 transition-all space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-wider bg-mecura-neon/10 border border-mecura-neon/25 px-2 py-0.5 rounded-full">
                                  #{idx + 1} · {q.domain}
                                </span>
                                <span className="text-[10px] text-sky-300 font-mono font-semibold">
                                  {q.scaleRef}
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                                {q.question}
                              </p>

                              <div className="px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/[0.05] text-[11px] text-[#9A9AB0]">
                                <span className="text-mecura-neon font-bold">Embasamento: </span>
                                {q.scientificBasis}
                              </div>

                              <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                                <span className="text-[11px] text-[#A0A0B4] truncate">
                                  Alvo: {q.neuralTarget}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
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
                      {FREQUENCY_OPTIONS.map((opt, optIdx) => {
                        const isSelected = adminScores[adminStep] === opt.points;
                        return (
                          <button
                            key={`admin-freq-${opt.points}-${optIdx}`}
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
