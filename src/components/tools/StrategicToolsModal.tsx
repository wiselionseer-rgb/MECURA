import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Brain,
  Sparkles,
  Sprout,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Activity,
  RotateCcw,
  Scale,
  Droplets,
  Search,
  Plus,
  Trash2,
  Package,
  Flame,
  Candy,
  Pill,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAdminStore } from '../../store/useAdminStore';
import {
  cbdGuideData,
  CBDProduct,
  PANGAIA_PRODUCTS,
  SOUCANNABIS_PRODUCTS,
  ABECMED_PRODUCTS,
  ABRACE_PRODUCTS,
  FLOWERMED_PRODUCTS,
  FLOWER_EXTRACTIONS_PRODUCTS,
  GREENBUDZ_PRODUCTS,
} from '../../data/cbdGuide';
import { mergeProductCatalogs, subscribeToFirestoreCatalog } from '../../utils/productCatalog';
import { RemotionBannerPlayer } from './RemotionVisualizers';

export type StrategicToolType = 'tdah' | 'autism' | 'hc';

interface StrategicToolsModalProps {
  isOpen: boolean;
  initialTool: StrategicToolType;
  onClose: () => void;
}

const ADHD_QUESTIONS = [
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

const AUTISM_QUESTIONS = [
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
      'Você costumo focar intensamente nos pequenos detalhes, padrões ou erros específicos de uma situação antes de perceber o contexto geral?',
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

const FREQUENCY_OPTIONS = [
  { label: 'Raramente / Nunca', sub: 'Quase não interfere na rotina', points: 0 },
  { label: 'Às vezes', sub: 'Ocorre em momentos de estresse', points: 1 },
  { label: 'Frequentemente', sub: 'Impacta minha semana com clareza', points: 2 },
  { label: 'Muito Frequente / Sempre', sub: 'Presente quase todos os dias', points: 3 },
];

export type MedCategoryFilter = 'todos' | 'oleos' | 'extracoes' | 'gummies' | 'flores' | 'outros';

export interface CatalogMedItem {
  id: string;
  name: string;
  manufacturer: string;
  origin: string;
  type: string;
  categoryFilter: Exclude<MedCategoryFilter, 'todos'>;
  categoryBadge: string;
  concentrationLabel: string;
  unitType: 'gotas' | 'unidades' | 'gramas_ext' | 'gramas_flor';
  unitLabel: string;
  mgPerUnit: number; // mg of active cannabinoids per drop, per gummy/capsule, or per 0.1g extraction / 1g flower
  defaultDailyUnits: number;
  minUnits: number;
  maxUnits: number;
  stepUnits: number;
}

export interface SelectedHcMed {
  med: CatalogMedItem;
  dailyUnits: number;
}

function classifyAndParseProduct(p: CBDProduct, idx: number): CatalogMedItem {
  const nameLower = (p.name || '').toLowerCase();
  const typeLower = (p.type || '').toLowerCase();
  const formLower = (p.pharmaceuticalForm || '').toLowerCase();
  const concLower = `${p.concentration || ''} ${p.activeIngredients || ''} ${p.name || ''}`.toLowerCase();

  // Detect Category
  const isExtraction =
    nameLower.includes('rosin') ||
    nameLower.includes('budder') ||
    nameLower.includes('wax') ||
    nameLower.includes('diamond') ||
    nameLower.includes('hash') ||
    nameLower.includes('syringe') ||
    nameLower.includes('seringa') ||
    nameLower.includes('extração') ||
    nameLower.includes('extracao') ||
    nameLower.includes('concentrado') ||
    nameLower.includes('rso') ||
    typeLower.includes('concentrado') ||
    typeLower.includes('extração') ||
    typeLower.includes('budder') ||
    typeLower.includes('syringe');

  const isGummy =
    !isExtraction &&
    (nameLower.includes('gumm') ||
      nameLower.includes('goma') ||
      nameLower.includes('pastilha') ||
      typeLower.includes('gumm') ||
      typeLower.includes('goma') ||
      formLower.includes('goma'));

  const isFlower =
    !isExtraction &&
    !isGummy &&
    (nameLower.includes('flor ') ||
      nameLower.includes('flores') ||
      nameLower.includes('in natura') ||
      typeLower.includes('flor') ||
      formLower.includes('flor'));

  const isOil =
    !isExtraction &&
    !isGummy &&
    !isFlower &&
    (nameLower.includes('óleo') ||
      nameLower.includes('oleo') ||
      nameLower.includes('full spectrum') ||
      nameLower.includes('broad spectrum') ||
      nameLower.includes('isolado') ||
      nameLower.includes('gota') ||
      typeLower.includes('óleo') ||
      typeLower.includes('sublingual') ||
      formLower.includes('óleo') ||
      formLower.includes('gotas') ||
      formLower.includes('solução'));

  let categoryFilter: Exclude<MedCategoryFilter, 'todos'> = 'outros';
  let categoryBadge = 'Cápsula / Tópico';
  let unitType: CatalogMedItem['unitType'] = 'unidades';
  let unitLabel = 'unid/dia';
  let mgPerUnit = 25;
  let defaultDailyUnits = 2;
  let minUnits = 1;
  let maxUnits = 10;
  let stepUnits = 1;

  if (isOil) {
    categoryFilter = 'oleos';
    categoryBadge = 'Óleo Medicinal';
    unitType = 'gotas';
    unitLabel = 'gotas/dia';
    defaultDailyUnits = 20;
    minUnits = 4;
    maxUnits = 80;
    stepUnits = 2;

    // Parse mg per drop or mg/mL
    if (typeof p.mgPerDropCBD === 'number' && p.mgPerDropCBD > 0) {
      mgPerUnit = p.mgPerDropCBD + (typeof p.mgPerDropTHC === 'number' ? p.mgPerDropTHC : 0);
    } else {
      const mgMlMatch = concLower.match(/(\d+(?:[.,]\d+)?)\s*mg\s*\/\s*ml/i);
      const totalMgMatch = concLower.match(/(\d{3,5})\s*mg/i);
      if (mgMlMatch) {
        const mgMl = parseFloat(mgMlMatch[1].replace(',', '.'));
        mgPerUnit = Number((mgMl / 30).toFixed(2));
      } else if (totalMgMatch) {
        const totalMg = parseFloat(totalMgMatch[1]);
        const volMatch = concLower.match(/(\d+)\s*ml/i);
        const vol = volMatch ? parseFloat(volMatch[1]) : 30;
        const mgMl = totalMg / (vol || 30);
        mgPerUnit = Number((mgMl / 30).toFixed(2));
      } else {
        mgPerUnit = 3.33; // ~100mg/mL default (3000mg/30mL)
      }
    }
  } else if (isExtraction) {
    categoryFilter = 'extracoes';
    categoryBadge = 'Extração / Concentrado';
    unitType = 'gramas_ext';
    unitLabel = 'mg extrato/dia';
    // Extractions are high potency (~60% to 85% cannabinoids -> 1mg of dose = 1mg)
    mgPerUnit = 1;
    defaultDailyUnits = 120; // 120 mg/day (~0.15g of extraction/day)
    minUnits = 25;
    maxUnits = 500;
    stepUnits = 25;
  } else if (isGummy) {
    categoryFilter = 'gummies';
    categoryBadge = 'Gummies / Gomas';
    unitType = 'unidades';
    unitLabel = 'gomas/dia';
    defaultDailyUnits = 2;
    minUnits = 1;
    maxUnits = 8;
    stepUnits = 1;

    const perGummyMatch = concLower.match(/(\d+(?:[.,]\d+)?)\s*mg\s*(?:por|\/)\s*(?:goma|unid|gummy|pastilha)/i);
    if (perGummyMatch) {
      mgPerUnit = parseFloat(perGummyMatch[1].replace(',', '.'));
    } else if ((p as any).mgPerUnit) {
      mgPerUnit = Number((p as any).mgPerUnit);
    } else {
      const anyMg = concLower.match(/(\d+)\s*mg/i);
      if (anyMg) {
        const val = parseFloat(anyMg[1]);
        mgPerUnit = val > 200 ? Math.round(val / 30) : val;
      } else {
        mgPerUnit = 30;
      }
    }
  } else if (isFlower) {
    categoryFilter = 'flores';
    categoryBadge = 'Flor In Natura';
    unitType = 'gramas_flor';
    unitLabel = 'g flor/dia';
    // 1g of dry flower has ~180mg of active cannabinoids
    mgPerUnit = 180;
    defaultDailyUnits = 0.5;
    minUnits = 0.1;
    maxUnits = 3.0;
    stepUnits = 0.1;
  } else {
    categoryFilter = 'outros';
    categoryBadge = typeLower.includes('cápsula') || nameLower.includes('cápsula') || nameLower.includes('softgel')
      ? 'Cápsula Softgel'
      : 'Tópico / Outros';
    unitType = 'unidades';
    unitLabel = 'aplic/unid dia';
    defaultDailyUnits = 2;
    minUnits = 1;
    maxUnits = 6;
    stepUnits = 1;
    mgPerUnit = 25;
  }

  return {
    id: `${p.name}_${idx}`,
    name: p.name,
    manufacturer: p.manufacturer || 'Catálogo Clínico',
    origin: p.origin || 'Importado / Nacional',
    type: p.type || categoryBadge,
    categoryFilter,
    categoryBadge,
    concentrationLabel: p.concentration || p.activeIngredients || `${mgPerUnit}mg/${unitLabel}`,
    unitType,
    unitLabel,
    mgPerUnit: Math.max(0.5, mgPerUnit),
    defaultDailyUnits,
    minUnits,
    maxUnits,
    stepUnits,
  };
}

export const StrategicToolsModal: React.FC<StrategicToolsModalProps> = ({
  isOpen,
  initialTool,
  onClose,
}) => {
  const navigate = useNavigate();
  const { answers, setAnswer, reset } = useStore();
  const { productCategories: storeProductCategories } = useAdminStore();
  const [cloudCategories, setCloudCategories] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToFirestoreCatalog((cats) => {
      setCloudCategories(cats);
    });
    return () => unsub();
  }, []);

  const [activeTool, setActiveTool] = useState<StrategicToolType>(initialTool);

  useEffect(() => {
    if (isOpen) {
      setActiveTool(initialTool);
    }
  }, [isOpen, initialTool]);

  // Build Complete Real Registered Medication Catalog
  const allCatalogMeds = useMemo<CatalogMedItem[]>(() => {
    const mergedCats = mergeProductCatalogs(cbdGuideData, storeProductCategories, cloudCategories);
    const rawList: CBDProduct[] = [];
    const seen = new Set<string>();

    const pushUnique = (prod: CBDProduct) => {
      if (!prod || !prod.name) return;
      const key = prod.name.trim().toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      rawList.push(prod);
    };

    // Prioritize a rich variety at top, then full merged catalog
    mergedCats.forEach((cat) => {
      (cat.products || []).forEach(pushUnique);
    });
    FLOWER_EXTRACTIONS_PRODUCTS.forEach(pushUnique);
    PANGAIA_PRODUCTS.forEach(pushUnique);
    ABECMED_PRODUCTS.forEach(pushUnique);
    ABRACE_PRODUCTS.forEach(pushUnique);
    SOUCANNABIS_PRODUCTS.forEach(pushUnique);
    FLOWERMED_PRODUCTS.forEach(pushUnique);
    GREENBUDZ_PRODUCTS.forEach(pushUnique);

    return rawList.map((p, i) => classifyAndParseProduct(p, i));
  }, [storeProductCategories, cloudCategories]);

  // --- ADHD STATE (12 Questions + Live Animation Sync) ---
  const [adhdStep, setAdhdStep] = useState(0);
  const [adhdScores, setAdhdScores] = useState<Record<number, number>>({});
  const [adhdLastPoints, setAdhdLastPoints] = useState<number>(2);
  const [adhdFinished, setAdhdFinished] = useState(false);

  // --- AUTISM STATE (12 Questions + Live Animation Sync) ---
  const [autismTarget, setAutismTarget] = useState<'adulto' | 'dependente'>('adulto');
  const [autismStep, setAutismStep] = useState(0);
  const [autismScores, setAutismScores] = useState<Record<number, number>>({});
  const [autismLastPoints, setAutismLastPoints] = useState<number>(2);
  const [autismFinished, setAutismFinished] = useState(false);

  // --- HC PLANT CALCULATOR STATE (With Registered Medications Search & Filter) ---
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [medCategoryFilter, setMedCategoryFilter] = useState<MedCategoryFilter>('todos');
  const [selectedHcMeds, setSelectedHcMeds] = useState<SelectedHcMed[]>([]);
  const [cultivationType, setCultivationType] = useState<'indoor' | 'outdoor'>('indoor');

  // Initialize default realistic medication from our registered catalog once loaded
  useEffect(() => {
    if (allCatalogMeds.length > 0 && selectedHcMeds.length === 0) {
      const defaultOil =
        allCatalogMeds.find((m) => m.categoryFilter === 'oleos' && m.name.toLowerCase().includes('full spectrum')) ||
        allCatalogMeds[0];
      if (defaultOil) {
        setSelectedHcMeds([{ med: defaultOil, dailyUnits: defaultOil.defaultDailyUnits }]);
      }
    }
  }, [allCatalogMeds, selectedHcMeds.length]);

  const filteredCatalogMeds = useMemo(() => {
    const q = medSearchQuery.trim().toLowerCase();
    return allCatalogMeds.filter((item) => {
      if (medCategoryFilter !== 'todos' && item.categoryFilter !== medCategoryFilter) {
        return false;
      }
      if (!q) return true;
      // Normalize search synonyms (e.g. "gumes" / "gummies" / "goma", "oleo" / "óleo", "extracao" / "extração")
      const searchable = `${item.name} ${item.manufacturer} ${item.categoryBadge} ${item.concentrationLabel} ${item.type}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const cleanQ = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (cleanQ.includes('gume') || cleanQ.includes('gumm') || cleanQ.includes('goma')) {
        if (item.categoryFilter === 'gummies') return true;
      }
      if (cleanQ.includes('extracao') || cleanQ.includes('rosin') || cleanQ.includes('budder') || cleanQ.includes('hash') || cleanQ.includes('wax')) {
        if (item.categoryFilter === 'extracoes') return true;
      }
      if (cleanQ.includes('oleo')) {
        if (item.categoryFilter === 'oleos') return true;
      }
      return searchable.includes(cleanQ);
    });
  }, [allCatalogMeds, medSearchQuery, medCategoryFilter]);

  const toggleSelectMedication = (med: CatalogMedItem) => {
    setSelectedHcMeds((prev) => {
      const exists = prev.some((s) => s.med.id === med.id);
      if (exists) {
        if (prev.length === 1) return prev; // Keep at least 1 medication in base
        return prev.filter((s) => s.med.id !== med.id);
      }
      return [...prev, { med, dailyUnits: med.defaultDailyUnits }];
    });
  };

  const updateSelectedMedUnits = (medId: string, newUnits: number) => {
    setSelectedHcMeds((prev) =>
      prev.map((item) => (item.med.id === medId ? { ...item, dailyUnits: newUnits } : item))
    );
  };

  // --- ADHD CALCULATIONS (ASRS-18 OMS + Complemento GAD-7 & PHQ-9) ---
  const adhdTotalPoints = useMemo(() => {
    return Object.values(adhdScores).reduce((sum, val) => sum + val, 0);
  }, [adhdScores]);
  const adhdMaxPoints = ADHD_QUESTIONS.length * 3; // 36 points (12 questions)
  const adhdPercentage = Math.min(
    99,
    Math.max(15, Math.round((adhdTotalPoints / adhdMaxPoints) * 100))
  );

  // Equivalent scores on the 4 validated Psychologist scales
  const adhdMultiScale = useMemo(() => {
    // Questions 0..7 map to ASRS-18 (max 24 pts -> scaled to 0..72 ASRS-18 OMS scale)
    const coreAdhdPts = [0, 1, 2, 3, 4, 5, 6, 7].reduce((acc, idx) => acc + (adhdScores[idx] ?? 0), 0);
    const asrs18Score = Math.min(72, Math.round((coreAdhdPts / 24) * 72));
    // Questions 8, 9, 11 map to GAD-7 (max 9 pts -> scaled to 0..21 GAD-7 scale)
    const gadPts = (adhdScores[8] ?? 0) + (adhdScores[9] ?? 0) + (adhdScores[11] ?? 0);
    const gad7Score = Math.min(21, Math.round((gadPts / 9) * 21));
    // Questions 10, 11 + executive fatigue map to PHQ-9 (max 9 pts -> scaled to 0..27 PHQ-9 scale)
    const phqPts = (adhdScores[10] ?? 0) + (adhdScores[11] ?? 0) + (adhdScores[2] ?? 0);
    const phq9Score = Math.min(27, Math.round((phqPts / 9) * 24));

    return {
      asrs18Score,
      asrs18PartAPositive: (adhdScores[0] ?? 0) + (adhdScores[1] ?? 0) + (adhdScores[2] ?? 0) + (adhdScores[3] ?? 0) >= 8,
      gad7Score,
      phq9Score,
    };
  }, [adhdScores]);

  const adhdClassification = useMemo(() => {
    if (adhdPercentage >= 70 || adhdMultiScale.asrs18Score >= 46) {
      return {
        level: 'Rastreio Positivo Acentuado na Escala ASRS-18 (OMS) · TDAH Adulto',
        insight:
          'Correspondência clínica elevada com os critérios DSM-5-TR e ASRS-18 v1.1 (OMS/Harvard), associada à hiperatividade da Rede de Modo Padrão (DMN) e hipofunção dopaminérgica pré-frontal. A matriz complementar aponta sobrecarga ansiosa (GAD-7) e fadiga executiva (PHQ-9). O protocolo integrado com CBD + CBG diurno e Acompanhamento Psicológico (CFP 06/2019) atua na estabilização executiva e controle inibitório.',
      };
    }
    if (adhdPercentage >= 42 || adhdMultiScale.asrs18Score >= 32) {
      return {
        level: 'Compatibilidade Moderada na Escala ASRS-18 (OMS) & Sobrecarga Executiva',
        insight:
          'Presença de marcadores clínicos significativos de desatenção sustentada, procrastinação executiva e oscilação emocional coexistente (GAD-7 / PHQ-9). A modulação endocanabinoide associada ao acompanhamento psicológico favorece a atenção sustentada e a redução do ruído mental.',
      };
    }
    return {
      level: 'Oscilação Leve de Foco / Desatenção Reativa ao Estresse',
      insight:
        'Escore abaixo do ponto de corte severo da ASRS-18, sugerindo oscilação de atenção predominantemente ligada a estressores ambientais, sono ou fadiga pontual. Avaliação integrada recomendada para prevenção e performance cognitiva.',
    };
  }, [adhdPercentage, adhdMultiScale.asrs18Score]);

  // --- AUTISM CALCULATIONS (AQ-10 Cambridge + Complemento GAD-7 & PHQ-9) ---
  const autismTotalPoints = useMemo(() => {
    return Object.values(autismScores).reduce((sum, val) => sum + val, 0);
  }, [autismScores]);
  const autismMaxPoints = AUTISM_QUESTIONS.length * 3; // 36 points (12 questions)
  const autismPercentage = Math.min(
    99,
    Math.max(16, Math.round((autismTotalPoints / autismMaxPoints) * 100))
  );

  const autismMultiScale = useMemo(() => {
    // Questions 0..7 map to AQ-10 Cambridge (0..10 pts, cutoff >= 6)
    const coreAqPts = [0, 1, 2, 3, 4, 5, 6, 7].reduce((acc, idx) => acc + (autismScores[idx] ?? 0), 0);
    const aq10Score = Math.min(10, Math.max(1, Math.round((coreAqPts / 24) * 10)));
    // Questions 9, 10, 11 map to GAD-7 (0..21 pts)
    const gadPts = (autismScores[9] ?? 0) + (autismScores[10] ?? 0) + (autismScores[11] ?? 0);
    const gad7Score = Math.min(21, Math.round((gadPts / 9) * 21));
    // Questions 8 (masking exhaustion), 9 (shutdown), 11 (sleep/mood) map to PHQ-9 (0..27 pts)
    const phqPts = (autismScores[8] ?? 0) + (autismScores[9] ?? 0) + (autismScores[11] ?? 0);
    const phq9Score = Math.min(27, Math.round((phqPts / 9) * 24));

    return {
      aq10Score,
      aq10Positive: aq10Score >= 6,
      gad7Score,
      phq9Score,
    };
  }, [autismScores]);

  const autismClassification = useMemo(() => {
    if (autismMultiScale.aq10Score >= 6 || autismPercentage >= 60) {
      return {
        level: `Rastreio Positivo AQ-10 Cambridge (${autismMultiScale.aq10Score}/10 pts · Corte ≥ 6) — Espectro TEA`,
        insight:
          'Pontuação igual ou superior ao ponto de corte validado pelo Autism Research Centre da Universidade de Cambridge (AQ-10 ≥ 6), indicando hipersensibilidade sensorial talâmica, rigidez cognitiva e exaustão por camuflagem social (masking), somada a indicadores complementares em GAD-7 e PHQ-9. A literatura científica (Aran et al.) comprova que a reposição do tônus de Anandamida via Full Spectrum estabiliza o balanço GABA/Glutamato.',
      };
    }
    if (autismMultiScale.aq10Score >= 4 || autismPercentage >= 38) {
      return {
        level: `Traços Moderados de Sensibilidade Sensorial & Fenótipo Ampliado (AQ-10: ${autismMultiScale.aq10Score}/10)`,
        insight:
          'Presença de indicadores relevantes de sobrecarga sensorial, necessidade de previsibilidade e desgaste pós-social. O acompanhamento conjunto médico e psicológico (Resolução CFP nº 06/2019) permite aprofundar o psicodiagnóstico e modular a reatividade autonômica.',
      };
    }
    return {
      level: `Sensibilidade Sensorial Leve / Abaixo do Ponto de Corte AQ-10 (${autismMultiScale.aq10Score}/10)`,
      insight:
        'Indicadores abaixo do limiar de corte clínico do AQ-10 (Cambridge), sugerindo sensibilidade sensorial leve ou ansiedade social reativa. Avaliação clínica individualizada disponível.',
    };
  }, [autismPercentage, autismMultiScale.aq10Score]);

  // --- HC PLANT CALCULATOR AGRONOMIC MATH BASED ON SELECTED REGISTERED MEDICATIONS ---
  const hcMetrics = useMemo(() => {
    let totalDailyDoseMg = 0;
    let directFlowerGramsPerDay = 0;

    selectedHcMeds.forEach(({ med, dailyUnits }) => {
      if (med.unitType === 'gramas_flor') {
        directFlowerGramsPerDay += dailyUnits;
        totalDailyDoseMg += Math.round(dailyUnits * med.mgPerUnit);
      } else {
        totalDailyDoseMg += Math.round(dailyUnits * med.mgPerUnit);
      }
    });

    totalDailyDoseMg = Math.max(15, totalDailyDoseMg);

    // Annual extract grams needed for oils/gummies/extractions
    const annualExtractGrams = (totalDailyDoseMg * 365) / 1000;

    // Artisanal extraction yield ~10% (0.10) + 30.38% GACP agronomic safety margin
    const dryFlowersForExtractKg = (annualExtractGrams / 0.1) / 1000;
    const directFlowersAnnualKg = (directFlowerGramsPerDay * 365) / 1000;
    const dryFlowersKg = (dryFlowersForExtractKg + directFlowersAnnualKg) * 1.3038;
    const dryFlowersGrams = Math.round(dryFlowersKg * 1000);
    const wetFlowersKg = dryFlowersKg / 0.3;

    // Average artisanal yield per plant per cycle: ~28g dry trimmed flower indoor, ~42g outdoor
    const avgGramsPerPlant = cultivationType === 'indoor' ? 28 : 42;
    const cyclesPerYear = cultivationType === 'indoor' ? 3 : 2;
    const annualPlants = Math.max(6, Math.round(dryFlowersGrams / avgGramsPerPlant));
    const plantsPerCycle = Math.max(2, Math.ceil(annualPlants / cyclesPerYear));
    const seedsPerYear = Math.round(annualPlants * 1.3038);

    const uniqueBadges = Array.from(new Set(selectedHcMeds.map((s) => s.med.categoryBadge.split(' ')[0])));

    return {
      dailyDoseMg: totalDailyDoseMg,
      annualExtractGrams,
      dryFlowersKg,
      dryFlowersGrams,
      wetFlowersKg,
      annualPlants,
      plantsPerCycle,
      cyclesPerYear,
      seedsPerYear,
      primaryMedType: uniqueBadges.join(' + ') || 'Óleo Medicinal',
    };
  }, [selectedHcMeds, cultivationType]);

  const handleSelectAdhdOption = (points: number) => {
    setAdhdLastPoints(points);
    const nextScores = { ...adhdScores, [adhdStep]: points };
    setAdhdScores(nextScores);
    if (adhdStep < ADHD_QUESTIONS.length - 1) {
      setAdhdStep((prev) => prev + 1);
    } else {
      setAdhdFinished(true);
    }
  };

  const handleSelectAutismOption = (points: number) => {
    setAutismLastPoints(points);
    const nextScores = { ...autismScores, [autismStep]: points };
    setAutismScores(nextScores);
    if (autismStep < AUTISM_QUESTIONS.length - 1) {
      setAutismStep((prev) => prev + 1);
    } else {
      setAutismFinished(true);
    }
  };

  const handleProceedFromAdhd = () => {
    const existingObjs: string[] = Array.isArray(answers?.objectives) ? answers.objectives : [];
    const mergedObjs = Array.from(
      new Set(['TDAH', 'Aumento do Foco', 'Controle da Ansiedade', ...existingObjs])
    );
    const summaryText = `[Rastreio Validado ASRS-18 (OMS) + Matriz GAD-7/PHQ-9: ${adhdPercentage}% — ${adhdClassification.level}] Escore ASRS-18 Eq.: ${adhdMultiScale.asrs18Score}/72 pts | GAD-7 (Ansiedade): ${adhdMultiScale.gad7Score}/21 pts | PHQ-9 (Humor/Energia): ${adhdMultiScale.phq9Score}/27 pts. Relata desatenção executiva, hiperatividade da DMN e busca avaliação integrada médica e psicológica (CFP 06/2019).`;

    reset();
    setAnswer('objectives', mergedObjs);
    setAnswer('foco', true);
    setAnswer('memoria', true);
    setAnswer('intensity', adhdPercentage >= 70 ? '8' : '6');
    setAnswer('phq9Result', {
      score: adhdMultiScale.phq9Score,
      completedAt: new Date().toISOString(),
    });
    setAnswer('gad7Result', {
      score: adhdMultiScale.gad7Score,
      completedAt: new Date().toISOString(),
    });
    setAnswer('adhdTestResult', {
      scorePercent: adhdPercentage,
      totalPoints: adhdTotalPoints,
      maxPoints: adhdMaxPoints,
      asrs18EquivalentScore: adhdMultiScale.asrs18Score,
      gad7ComplementScore: adhdMultiScale.gad7Score,
      phq9ComplementScore: adhdMultiScale.phq9Score,
      questionsCount: ADHD_QUESTIONS.length,
      classification: adhdClassification.level,
      answers: adhdScores,
      completedAt: new Date().toISOString(),
    });
    setAnswer(
      'description',
      answers?.description ? `${answers.description}\n${summaryText}` : summaryText
    );
    onClose();
    navigate('/onboarding');
  };

  const handleProceedFromAutism = () => {
    const existingObjs: string[] = Array.isArray(answers?.objectives) ? answers.objectives : [];
    const mergedObjs = Array.from(
      new Set(['Autismo (TEA)', 'Equilíbrio emocional', 'Melhora do Sono', ...existingObjs])
    );
    const targetLabel =
      autismTarget === 'adulto' ? 'Adulto (Próprio Paciente)' : 'Criança / Dependente';
    const summaryText = `[Rastreio Validado AQ-10 (Cambridge) + Matriz Sensorial GAD-7/PHQ-9 (${targetLabel}): ${autismPercentage}% — ${autismClassification.level}] Escore AQ-10 Eq.: ${autismMultiScale.aq10Score}/10 pts (Corte ≥ 6) | GAD-7 (Ansiedade): ${autismMultiScale.gad7Score}/21 pts | PHQ-9 (Exaustão/Sono): ${autismMultiScale.phq9Score}/27 pts. Busca regulação sensorial, homeostase endocanabinoide e suporte médico + psicológico (CFP 06/2019).`;

    reset();
    setAnswer('objectives', mergedObjs);
    setAnswer('intensity', autismPercentage >= 66 ? '8' : '6');
    setAnswer('phq9Result', {
      score: autismMultiScale.phq9Score,
      completedAt: new Date().toISOString(),
    });
    setAnswer('gad7Result', {
      score: autismMultiScale.gad7Score,
      completedAt: new Date().toISOString(),
    });
    setAnswer('autismTestResult', {
      scorePercent: autismPercentage,
      totalPoints: autismTotalPoints,
      maxPoints: autismMaxPoints,
      aq10EquivalentScore: autismMultiScale.aq10Score,
      gad7ComplementScore: autismMultiScale.gad7Score,
      phq9ComplementScore: autismMultiScale.phq9Score,
      questionsCount: AUTISM_QUESTIONS.length,
      targetProfile: targetLabel,
      classification: autismClassification.level,
      answers: autismScores,
      completedAt: new Date().toISOString(),
    });
    setAnswer(
      'description',
      answers?.description ? `${answers.description}\n${summaryText}` : summaryText
    );
    onClose();
    navigate('/onboarding');
  };

  const handleProceedFromHcCalculator = () => {
    const existingObjs: string[] = Array.isArray(answers?.objectives) ? answers.objectives : [];
    const mergedObjs = Array.from(
      new Set(['Habeas Corpus (Cultivo Medicinal)', ...existingObjs])
    );
    const medsSummaryList = selectedHcMeds.map(
      (s) => `${s.med.name} (${s.dailyUnits} ${s.med.unitLabel})`
    );
    const summaryText = `[Dimensionamento Calculadora HC com Medicamentos Cadastrados: ${hcMetrics.annualPlants} plantas/ano (${hcMetrics.plantsPerCycle} plantas/ciclo, ${hcMetrics.cyclesPerYear} ciclos/ano) | Base Escolhida: ${medsSummaryList.join(' + ')} | Dose Total: ${hcMetrics.dailyDoseMg} mg/dia | Flores secas: ${hcMetrics.dryFlowersGrams}g/ano | Sementes: ${hcMetrics.seedsPerYear}/ano].`;

    reset();
    setAnswer('objectives', mergedObjs);
    setAnswer('intensity', '8');
    setAnswer('hcPlantCalculator', {
      condition: medsSummaryList.join(' + '),
      selectedMedications: selectedHcMeds.map((s) => ({
        name: s.med.name,
        manufacturer: s.med.manufacturer,
        category: s.med.categoryBadge,
        dailyUnits: s.dailyUnits,
        unitLabel: s.med.unitLabel,
        dailyMg: Math.round(s.dailyUnits * s.med.mgPerUnit),
      })),
      cultivationType,
      dailyDoseMg: hcMetrics.dailyDoseMg,
      annualExtractGrams: Number(hcMetrics.annualExtractGrams.toFixed(1)),
      dryFlowersGrams: hcMetrics.dryFlowersGrams,
      dryFlowersKg: Number(hcMetrics.dryFlowersKg.toFixed(3)),
      wetFlowersKg: Number(hcMetrics.wetFlowersKg.toFixed(3)),
      plantsPerCycle: hcMetrics.plantsPerCycle,
      annualPlants: hcMetrics.annualPlants,
      seedsPerYear: hcMetrics.seedsPerYear,
      completedAt: new Date().toISOString(),
    });
    setAnswer(
      'description',
      answers?.description ? `${answers.description}\n${summaryText}` : summaryText
    );
    onClose();
    navigate('/onboarding');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-2.5 sm:p-3"
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="w-full max-h-[calc(100%-16px)] sm:max-h-[calc(100%-20px)] bg-[#060D08] border border-white/10 rounded-[26px] sm:rounded-[28px] shadow-[0_20px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative"
        >
          {/* Top Bar & Tool Switcher */}
          <div className="px-4 pt-3.5 pb-3 border-b border-white/[0.08] bg-[#0A120C]/95 shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-mecura-neon shrink-0" />
                <span className="text-xs font-bold text-white tracking-wide truncate">
                  Protocolos Psicométricos Validados (OMS · Cambridge · CFP)
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#A0A0B0] hover:text-white transition-colors cursor-pointer shrink-0"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Segmented Control */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#040805] rounded-xl border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setActiveTool('tdah')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer border ${
                  activeTool === 'tdah'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400/35 shadow-sm'
                    : 'border-transparent text-[#8A8A9E] hover:text-white'
                }`}
              >
                <Brain className="w-3.5 h-3.5 shrink-0" />
                <span>TDAH · ASRS-18</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('autism')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer border ${
                  activeTool === 'autism'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-400/35 shadow-sm'
                    : 'border-transparent text-[#8A8A9E] hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5 shrink-0" />
                <span>Autismo · AQ-10</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('hc')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer border ${
                  activeTool === 'hc'
                    ? 'bg-mecura-neon/20 text-mecura-neon border-mecura-neon/35 shadow-sm'
                    : 'border-transparent text-[#8A8A9E] hover:text-white'
                }`}
              >
                <Sprout className="w-3.5 h-3.5 shrink-0" />
                <span>Plantas HC</span>
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-3.5 custom-scrollbar">
            {/* Live Interactive Remotion Visual Player */}
            <RemotionBannerPlayer
              mode={activeTool}
              adhdProps={{
                progressRatio: (adhdStep + 1) / ADHD_QUESTIONS.length,
                scoreRatio: adhdPercentage / 100,
                isResult: adhdFinished,
                currentDomain: ADHD_QUESTIONS[adhdStep]?.domain || 'Córtex Pré-Frontal',
                lastPoints: adhdLastPoints,
              }}
              autismProps={{
                progressRatio: (autismStep + 1) / AUTISM_QUESTIONS.length,
                scoreRatio: autismPercentage / 100,
                isResult: autismFinished,
                currentDomain: AUTISM_QUESTIONS[autismStep]?.domain || 'Filtro Sensorial',
                lastPoints: autismLastPoints,
              }}
              hcProps={{
                plantsPerCycle: hcMetrics.plantsPerCycle,
                annualPlants: hcMetrics.annualPlants,
                dailyDoseMg: hcMetrics.dailyDoseMg,
                annualGrams: hcMetrics.annualExtractGrams,
                selectedMedicationsCount: selectedHcMeds.length,
                primaryMedType: hcMetrics.primaryMedType,
              }}
            />

            {/* ==================== TOOL 1: TESTE DE TDAH (ASRS-18 OMS + GAD-7 + PHQ-9) ==================== */}
            {activeTool === 'tdah' && (
              <AnimatePresence mode="wait">
                {!adhdFinished ? (
                  <motion.div
                    key={`adhd-q-${adhdStep}`}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2.5"
                  >
                    {/* Scientific Credibility Strip */}
                    <div className="px-3 py-2 rounded-xl bg-[#0A151E] border border-sky-400/25 flex items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5 text-sky-300 font-bold truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-mecura-neon shrink-0" />
                        <span className="truncate">
                          {ADHD_QUESTIONS[adhdStep].scaleRef}
                        </span>
                      </div>
                      <span className="text-white/60 font-mono shrink-0">
                        {ADHD_QUESTIONS[adhdStep].dsmCriterion.split('·')[0]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#8A8A9E]">
                      <span className="text-sky-400 font-bold truncate pr-2">
                        {ADHD_QUESTIONS[adhdStep].domain}
                      </span>
                      <span className="font-mono tabular-nums text-white/80 font-bold shrink-0">
                        Item {adhdStep + 1} / {ADHD_QUESTIONS.length}
                      </span>
                    </div>

                    {/* Question Step Pills (Interactive Jump) */}
                    <div className="grid grid-cols-12 gap-1">
                      {ADHD_QUESTIONS.map((q, idx) => {
                        const answered = adhdScores[idx] !== undefined;
                        const current = idx === adhdStep;
                        return (
                          <button
                            key={`adhd-q-btn-${q.id || idx}-${idx}`}
                            type="button"
                            onClick={() => setAdhdStep(idx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              current
                                ? 'bg-mecura-neon'
                                : answered
                                ? 'bg-sky-400'
                                : 'bg-white/10'
                            }`}
                            title={`Ir para pergunta ${idx + 1}`}
                          />
                        );
                      })}
                    </div>

                    {/* Neural Target Pill */}
                    <div className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-between text-[11px]">
                      <span className="text-sky-300 font-semibold truncate">
                        ⚡ Via Neurobiológica: {ADHD_QUESTIONS[adhdStep].neuralTarget}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-[14px] sm:text-[15px] leading-snug">
                      {ADHD_QUESTIONS[adhdStep].question}
                    </h3>

                    {/* Scientific Basis Rationale Box */}
                    <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[11px] text-[#B0B8C8] leading-relaxed">
                      <span className="text-mecura-neon font-bold">Base Científica: </span>
                      {ADHD_QUESTIONS[adhdStep].scientificBasis.replace(/^Embasamento\s*\([^)]+\):\s*/i, '')}
                    </div>

                    <div className="space-y-2 pt-0.5">
                      {FREQUENCY_OPTIONS.map((opt, idx) => {
                        const isSelected = adhdScores[adhdStep] === opt.points;
                        return (
                          <button
                            key={idx}
                            onMouseEnter={() => setAdhdLastPoints(opt.points)}
                            type="button"
                            onClick={() => handleSelectAdhdOption(opt.points)}
                            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-sky-500/15 border-sky-400/60 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                                : 'bg-[#0E1711] border-white/[0.08] hover:border-sky-400/35 hover:bg-[#121E16] text-white'
                            }`}
                          >
                            <div className="pr-2">
                              <div className="font-bold text-xs sm:text-sm">{opt.label}</div>
                              <div className="text-[11px] text-[#9A9AB0] mt-0.5">{opt.sub}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-sky-400 shrink-0" />
                          </button>
                        );
                      })}
                    </div>

                    {adhdStep > 0 && (
                      <button
                        type="button"
                        onClick={() => setAdhdStep((prev) => prev - 1)}
                        className="text-xs text-[#8A8A9E] hover:text-white flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" /> Voltar item anterior
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="adhd-result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3.5"
                  >
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0E1B13] to-[#060D08] border border-sky-400/30 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-mecura-neon block">
                            Protocolo Validado OMS · Harvard · CFP 06/2019
                          </span>
                          <span className="text-xs text-sky-300 font-bold">
                            Síntese Psicométrica ASRS-18 + GAD-7 + PHQ-9
                          </span>
                        </div>
                        <span className="text-2xl font-black text-mecura-neon font-mono tabular-nums">
                          {adhdPercentage}%
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white leading-snug">
                        {adhdClassification.level}
                      </div>

                      {/* 3-Scale Complementary Breakdown */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="bg-black/40 p-2.5 rounded-xl border border-sky-400/25 text-center">
                          <span className="text-[10px] text-sky-300 font-bold block">ASRS-18 (OMS)</span>
                          <span className="text-sm font-black text-white font-mono">
                            {adhdMultiScale.asrs18Score}/72
                          </span>
                          <span className="text-[9px] text-[#8A8A9E] block mt-0.5">
                            Corte ≥ 36 pts
                          </span>
                        </div>
                        <div className="bg-black/40 p-2.5 rounded-xl border border-amber-400/25 text-center">
                          <span className="text-[10px] text-amber-300 font-bold block">GAD-7 (Ansiedade)</span>
                          <span className="text-sm font-black text-white font-mono">
                            {adhdMultiScale.gad7Score}/21
                          </span>
                          <span className="text-[9px] text-[#8A8A9E] block mt-0.5">
                            Coexistente
                          </span>
                        </div>
                        <div className="bg-black/40 p-2.5 rounded-xl border border-purple-400/25 text-center">
                          <span className="text-[10px] text-purple-300 font-bold block">PHQ-9 (Fadiga)</span>
                          <span className="text-sm font-black text-white font-mono">
                            {adhdMultiScale.phq9Score}/27
                          </span>
                          <span className="text-[9px] text-[#8A8A9E] block mt-0.5">
                            Humor & Energia
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#B0B0C4] leading-relaxed">
                        {adhdClassification.insight}
                      </p>

                      {/* Scientific References Box */}
                      <div className="p-2.5 rounded-xl bg-black/35 border border-white/[0.07] text-[10px] text-[#9A9AB0] space-y-1">
                        <div className="text-white font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-mecura-neon shrink-0" />
                          <span>Embasamento Científico & Integração ao Prontuário:</span>
                        </div>
                        <p className="leading-relaxed">
                          • <strong>ASRS-18 v1.1:</strong> Kessler et al. (OMS / Harvard Medical School, <em>Psychol Med</em>, 2005).<br />
                          • <strong>GAD-7 & PHQ-9:</strong> Spitzer et al. (2006) & Kroenke et al. (2001) — integrados automaticamente ao Relatório de Acompanhamento Psicológico (Resolução CFP nº 06/2019).
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedFromAdhd}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-mecura-neon via-[#9EFF00] to-[#82E000] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(166,255,0,0.25)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>Iniciar Consulta com Este Mapeamento Validado</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAdhdScores({});
                        setAdhdStep(0);
                        setAdhdFinished(false);
                      }}
                      className="w-full py-2 text-xs text-[#8A8A9E] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Refazer Escala ASRS-18
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ==================== TOOL 2: TESTE DE AUTISMO (AQ-10 CAMBRIDGE + GAD-7 + PHQ-9) ==================== */}
            {activeTool === 'autism' && (
              <AnimatePresence mode="wait">
                {!autismFinished ? (
                  <motion.div
                    key={`autism-q-${autismStep}`}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2.5"
                  >
                    {/* Target Selector (Adulto vs Filho/Dependente) */}
                    {autismStep === 0 && (
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0E1711] rounded-xl border border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => setAutismTarget('adulto')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            autismTarget === 'adulto'
                              ? 'bg-purple-500 text-white'
                              : 'text-[#8A8A9E] hover:text-white'
                          }`}
                        >
                          Para Mim (Adulto · AQ-10)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAutismTarget('dependente')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            autismTarget === 'dependente'
                              ? 'bg-purple-500 text-white'
                              : 'text-[#8A8A9E] hover:text-white'
                          }`}
                        >
                          Para Filho(a) / Familiar
                        </button>
                      </div>
                    )}

                    {/* Scientific Credibility Strip */}
                    <div className="px-3 py-2 rounded-xl bg-[#160F24] border border-purple-400/25 flex items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5 text-purple-300 font-bold truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-mecura-neon shrink-0" />
                        <span className="truncate">
                          {AUTISM_QUESTIONS[autismStep].scaleRef}
                        </span>
                      </div>
                      <span className="text-white/60 font-mono shrink-0">
                        {AUTISM_QUESTIONS[autismStep].dsmCriterion.split('·')[0]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#8A8A9E]">
                      <span className="text-purple-300 font-bold truncate pr-2">
                        {AUTISM_QUESTIONS[autismStep].domain}
                      </span>
                      <span className="font-mono tabular-nums text-white/80 font-bold shrink-0">
                        Item {autismStep + 1} / {AUTISM_QUESTIONS.length}
                      </span>
                    </div>

                    {/* Interactive Step Dots */}
                    <div className="grid grid-cols-12 gap-1">
                      {AUTISM_QUESTIONS.map((q, idx) => {
                        const answered = autismScores[idx] !== undefined;
                        const current = idx === autismStep;
                        return (
                          <button
                            key={`autism-q-btn-${q.id || idx}-${idx}`}
                            type="button"
                            onClick={() => setAutismStep(idx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              current
                                ? 'bg-mecura-neon'
                                : answered
                                ? 'bg-purple-400'
                                : 'bg-white/10'
                            }`}
                            title={`Ir para pergunta ${idx + 1}`}
                          />
                        );
                      })}
                    </div>

                    {/* Sensory Target Badge */}
                    <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-between text-[11px]">
                      <span className="text-purple-300 font-semibold truncate">
                        ✨ Via Neurobiológica: {AUTISM_QUESTIONS[autismStep].neuralTarget}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-[14px] sm:text-[15px] leading-snug">
                      {AUTISM_QUESTIONS[autismStep].question}
                    </h3>

                    {/* Scientific Basis Rationale Box */}
                    <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[11px] text-[#B0B8C8] leading-relaxed">
                      <span className="text-mecura-neon font-bold">Base Científica: </span>
                      {AUTISM_QUESTIONS[autismStep].scientificBasis.replace(/^Embasamento\s*\([^)]+\):\s*/i, '')}
                    </div>

                    <div className="space-y-2 pt-0.5">
                      {FREQUENCY_OPTIONS.map((opt, idx) => {
                        const isSelected = autismScores[autismStep] === opt.points;
                        return (
                          <button
                            key={idx}
                            onMouseEnter={() => setAutismLastPoints(opt.points)}
                            type="button"
                            onClick={() => handleSelectAutismOption(opt.points)}
                            className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-purple-500/15 border-purple-400/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                : 'bg-[#0E1711] border-white/[0.08] hover:border-purple-400/35 hover:bg-[#121E16] text-white'
                            }`}
                          >
                            <div className="pr-2">
                              <div className="font-bold text-xs sm:text-sm">{opt.label}</div>
                              <div className="text-[11px] text-[#9A9AB0] mt-0.5">{opt.sub}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
                          </button>
                        );
                      })}
                    </div>

                    {autismStep > 0 && (
                      <button
                        type="button"
                        onClick={() => setAutismStep((prev) => prev - 1)}
                        className="text-xs text-[#8A8A9E] hover:text-white flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" /> Voltar item anterior
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="autism-result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3.5"
                  >
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0E1711] to-[#060D08] border border-purple-400/30 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-mecura-neon block">
                            Protocolo Validado Universidade de Cambridge · CFP 06/2019
                          </span>
                          <span className="text-xs text-purple-300 font-bold">
                            Síntese AQ-10 (Cambridge) + GAD-7 + PHQ-9
                          </span>
                        </div>
                        <span className="text-2xl font-black text-mecura-neon font-mono tabular-nums">
                          {autismPercentage}%
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white leading-snug">
                        {autismClassification.level}
                      </div>

                      {/* 3-Scale Complementary Breakdown */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="bg-black/40 p-2.5 rounded-xl border border-purple-400/25 text-center">
                          <span className="text-[10px] text-purple-300 font-bold block">AQ-10 (Cambridge)</span>
                          <span className="text-sm font-black text-white font-mono">
                            {autismMultiScale.aq10Score}/10
                          </span>
                          <span className="text-[9px] text-[#8A8A9E] block mt-0.5">
                            Corte ≥ 6 pts
                          </span>
                        </div>
                        <div className="bg-black/40 p-2.5 rounded-xl border border-amber-400/25 text-center">
                          <span className="text-[10px] text-amber-300 font-bold block">GAD-7 (Ansiedade)</span>
                          <span className="text-sm font-black text-white font-mono">
                            {autismMultiScale.gad7Score}/21
                          </span>
                          <span className="text-[9px] text-[#8A8A9E] block mt-0.5">
                            Antecipatória
                          </span>
                        </div>
                        <div className="bg-black/40 p-2.5 rounded-xl border border-sky-400/25 text-center">
                          <span className="text-[10px] text-sky-300 font-bold block">PHQ-9 (Masking)</span>
                          <span className="text-sm font-black text-white font-mono">
                            {autismMultiScale.phq9Score}/27
                          </span>
                          <span className="text-[9px] text-[#8A8A9E] block mt-0.5">
                            Exaustão & Sono
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#B0B0C4] leading-relaxed">
                        {autismClassification.insight}
                      </p>

                      {/* Scientific References Box */}
                      <div className="p-2.5 rounded-xl bg-black/35 border border-white/[0.07] text-[10px] text-[#9A9AB0] space-y-1">
                        <div className="text-white font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-mecura-neon shrink-0" />
                          <span>Embasamento Científico & Integração ao Prontuário:</span>
                        </div>
                        <p className="leading-relaxed">
                          • <strong>AQ-10 (Cambridge):</strong> Allison, Auyeung & Baron-Cohen (Autism Research Centre, <em>J Am Acad Child Adolesc Psychiatry</em>, 2012).<br />
                          • <strong>GAD-7 & PHQ-9:</strong> Escores complementares pré-carregados automaticamente no Relatório de Acompanhamento Psicológico (Resolução CFP nº 06/2019).
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedFromAutism}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-mecura-neon via-[#9EFF00] to-[#82E000] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(166,255,0,0.25)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>Iniciar Consulta com Este Mapeamento Validado</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAutismScores({});
                        setAutismStep(0);
                        setAutismFinished(false);
                      }}
                      className="w-full py-2 text-xs text-[#8A8A9E] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Refazer Escala AQ-10
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ==================== TOOL 3: CALCULADORA DE PLANTAS PARA HC (CATÁLOGO REAL) ==================== */}
            {activeTool === 'hc' && (
              <motion.div
                key="hc-calculator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3.5"
              >
                {/* Search Bar with Lupa + Category Filters for Real Catalog */}
                <div className="p-3 rounded-2xl bg-[#0E1711] border border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-extrabold text-white flex items-center gap-1.5 min-w-0">
                      <Search className="w-3.5 h-3.5 text-mecura-neon shrink-0" />
                      <span className="truncate">1. Medicamentos Cadastrados (Base)</span>
                    </label>
                    <span className="text-[10px] font-mono text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded-lg border border-mecura-neon/20 shrink-0">
                      {allCatalogMeds.length} itens
                    </span>
                  </div>

                  {/* Search Input with Lupa */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-mecura-neon absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={medSearchQuery}
                      onChange={(e) => setMedSearchQuery(e.target.value)}
                      placeholder="Pesquisar óleo, extração, gummies, rosin, flor..."
                      className="w-full pl-9 pr-8 py-2 bg-[#040805] border border-white/10 focus:border-mecura-neon/50 rounded-xl text-xs text-white placeholder-[#7A7A90] focus:outline-none transition-colors"
                    />
                    {medSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMedSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8A9E] hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Tabs (Óleo, Extração, Gummies, Flores) */}
                  <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar pb-0.5">
                    {[
                      { id: 'todos', label: 'Todos', icon: Package },
                      { id: 'oleos', label: 'Óleos', icon: Droplets },
                      { id: 'extracoes', label: 'Extrações', icon: Flame },
                      { id: 'gummies', label: 'Gummies', icon: Candy },
                      { id: 'flores', label: 'Flores', icon: Sprout },
                      { id: 'outros', label: 'Cápsulas/Tópicos', icon: Pill },
                    ].map((tab, tIdx) => {
                      const Icon = tab.icon;
                      const active = medCategoryFilter === tab.id;
                      return (
                        <button
                          key={`med-filter-tab-${tab.id}-${tIdx}`}
                          type="button"
                          onClick={() => setMedCategoryFilter(tab.id as MedCategoryFilter)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                            active
                              ? 'bg-mecura-neon text-black shadow-sm'
                              : 'bg-white/[0.04] text-[#9A9AB0] hover:text-white border border-white/[0.06]'
                          }`}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Scrollable Registered Medication List */}
                  <div className="max-h-[164px] overflow-y-auto space-y-1.5 custom-scrollbar">
                    {filteredCatalogMeds.length === 0 ? (
                      <div className="text-center py-4 text-xs text-[#8A8A9E]">
                        Nenhum medicamento encontrado para "{medSearchQuery}".
                      </div>
                    ) : (
                      filteredCatalogMeds.slice(0, 40).map((item, itemIdx) => {
                        const isChosen = selectedHcMeds.some((s) => s.med.id === item.id);
                        return (
                          <button
                            key={`catalog-med-${item.id || itemIdx}-${itemIdx}`}
                            type="button"
                            onClick={() => toggleSelectMedication(item)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                              isChosen
                                ? 'bg-mecura-neon/10 border-mecura-neon/50 text-white'
                                : 'bg-[#080E0A] border-white/[0.07] hover:border-white/20 text-[#D0D0E0]'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/[0.08] text-mecura-neon">
                                  {item.categoryBadge}
                                </span>
                                <span className="text-[10px] text-[#9A9AB0] truncate">
                                  {item.manufacturer}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-white truncate mt-0.5">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-[#8A8A9E] truncate">
                                {item.concentrationLabel}
                              </div>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                isChosen
                                  ? 'bg-mecura-neon text-black'
                                  : 'bg-white/[0.05] text-[#8A8A9E]'
                              }`}
                            >
                              {isChosen ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Selected Medications & Posology Sliders */}
                <div className="p-3 rounded-2xl bg-[#0E1711] border border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      2. Posologia Diária ({selectedHcMeds.length})
                    </span>
                    <span className="text-xs font-mono font-bold text-mecura-neon">
                      Total: {hcMetrics.dailyDoseMg} mg/dia
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedHcMeds.map(({ med, dailyUnits }, selIdx) => {
                      const medDailyMg = Math.round(dailyUnits * med.mgPerUnit);
                      return (
                        <div
                          key={`sel-hc-med-${med.id || selIdx}-${selIdx}`}
                          className="p-2.5 rounded-xl bg-[#080E0A] border border-white/[0.07] space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[10px] text-mecura-neon font-bold block">
                                {med.categoryBadge} · {med.manufacturer}
                              </span>
                              <span className="text-xs font-bold text-white block truncate">
                                {med.name}
                              </span>
                            </div>
                            {selectedHcMeds.length > 1 && (
                              <button
                                type="button"
                                onClick={() => toggleSelectMedication(med)}
                                className="text-[#8A8A9E] hover:text-rose-400 p-1 cursor-pointer"
                                title="Remover medicamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#A0A0B4]">Posologia diária:</span>
                            <span className="font-mono font-bold text-mecura-neon">
                              {dailyUnits} {med.unitLabel} (~{medDailyMg} mg/dia)
                            </span>
                          </div>

                          <input
                            type="range"
                            min={med.minUnits}
                            max={med.maxUnits}
                            step={med.stepUnits}
                            value={dailyUnits}
                            onChange={(e) => updateSelectedMedUnits(med.id, Number(e.target.value))}
                            className="w-full accent-[#A6FF00] cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Cultivation Regime Selector */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#A0A0B4]">Regime de Cultivo:</span>
                    <div className="grid grid-cols-2 gap-1.5 w-44">
                      <button
                        type="button"
                        onClick={() => setCultivationType('indoor')}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          cultivationType === 'indoor'
                            ? 'bg-emerald-500 text-black'
                            : 'bg-black/40 text-white/70 hover:text-white border border-white/[0.08]'
                        }`}
                      >
                        Indoor (3 ciclos)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCultivationType('outdoor')}
                        className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          cultivationType === 'outdoor'
                            ? 'bg-emerald-500 text-black'
                            : 'bg-black/40 text-white/70 hover:text-white border border-white/[0.08]'
                        }`}
                      >
                        Outdoor (2 ciclos)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Forensic Agronomic Calculation Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0E1711] via-[#0A120C] to-[#060D08] border border-mecura-neon/25 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-wider block">
                        Dimensionamento Pericial (GACP)
                      </span>
                      <h4 className="text-white font-bold text-sm">
                        Cota p/ Salvo-Conduto (Habeas Corpus)
                      </h4>
                    </div>
                    <Scale className="w-5 h-5 text-mecura-neon shrink-0" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-black/35 p-2 rounded-xl border border-white/[0.07]">
                      <span className="text-lg font-black text-mecura-neon font-mono tabular-nums block">
                        {hcMetrics.plantsPerCycle}
                      </span>
                      <span className="text-[10px] text-[#B0B0C4] leading-tight block">
                        Plantas / Ciclo ({hcMetrics.cyclesPerYear}x/ano)
                      </span>
                    </div>

                    <div className="bg-black/35 p-2 rounded-xl border border-white/[0.07]">
                      <span className="text-lg font-black text-emerald-400 font-mono tabular-nums block">
                        {hcMetrics.annualPlants}
                      </span>
                      <span className="text-[10px] text-[#B0B0C4] leading-tight block">
                        Total Plantas / Ano
                      </span>
                    </div>

                    <div className="bg-black/35 p-2 rounded-xl border border-white/[0.07]">
                      <span className="text-lg font-black text-amber-300 font-mono tabular-nums block">
                        {hcMetrics.seedsPerYear}
                      </span>
                      <span className="text-[10px] text-[#B0B0C4] leading-tight block">
                        Sementes / Ano (+30%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5 font-mono tabular-nums">
                    <div className="flex justify-between bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/[0.05] text-[#C0C0D0]">
                      <span>Flores Secas:</span>
                      <span className="text-white font-bold">{hcMetrics.dryFlowersGrams}g/ano</span>
                    </div>
                    <div className="flex justify-between bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/[0.05] text-[#C0C0D0]">
                      <span>Extrato Puro:</span>
                      <span className="text-mecura-neon font-bold">
                        {hcMetrics.annualExtractGrams.toFixed(1)}g/ano
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#A0A0B4] leading-snug">
                    Baseado nos medicamentos reais selecionados por você, convertidos para produção artesanal pelo Eng. Agrônomo (CREA-PR 172.458/D) + Prescrição Médica (CRM/MT 17259).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleProceedFromHcCalculator}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-mecura-neon via-[#9EFF00] to-[#82E000] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(166,255,0,0.25)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>Iniciar Consulta para Receita + Laudo Agronômico para HC</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
