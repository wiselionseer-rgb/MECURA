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

const AUTISM_QUESTIONS = [
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
    neuralTarget: 'descarga Proprioceptiva · Homeostase Endocanabinoide',
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

  // --- ADHD CALCULATIONS ---
  const adhdTotalPoints = useMemo(() => {
    return Object.values(adhdScores).reduce((sum, val) => sum + val, 0);
  }, [adhdScores]);
  const adhdMaxPoints = ADHD_QUESTIONS.length * 3; // 36 points (12 questions)
  const adhdPercentage = Math.min(
    99,
    Math.max(15, Math.round((adhdTotalPoints / adhdMaxPoints) * 100))
  );

  const adhdClassification = useMemo(() => {
    if (adhdPercentage >= 70) {
      return {
        level: 'Alta Compatibilidade Neurocomportamental (TDAH)',
        insight:
          'Padrão compatível com hiperatividade mental na Rede de Modo Padrão (DMN) e oscilação dopaminérgica no córtex pré-frontal. O protocolo com CBD + CBG (Canabigerol) de manhã e Full Spectrum à noite apresenta excelente resposta no foco executivo, controle da impulsividade e desligamento mental noturno.',
      };
    }
    if (adhdPercentage >= 42) {
      return {
        level: 'Indícios Moderados de Desatenção & Sobrecarga Executiva',
        insight:
          'Identificamos marcadores claros de dispersão cognitiva, procrastinação executiva e fadiga mental ao final do dia. A modulação endocanabinoide auxilia na estabilização da atenção sustentada e redução da ansiedade associada.',
      };
    }
    return {
      level: 'Sinais Leves de Oscilação de Foco & Estresse',
      insight:
        'Seus indicadores apontam oscilação pontual de atenção ligada ao estresse ou arquitetura do sono. Fitocanabinoides podem atuar de forma neuroprotetora na clareza mental e memória operacional.',
    };
  }, [adhdPercentage]);

  // --- AUTISM CALCULATIONS ---
  const autismTotalPoints = useMemo(() => {
    return Object.values(autismScores).reduce((sum, val) => sum + val, 0);
  }, [autismScores]);
  const autismMaxPoints = AUTISM_QUESTIONS.length * 3; // 36 points (12 questions)
  const autismPercentage = Math.min(
    99,
    Math.max(16, Math.round((autismTotalPoints / autismMaxPoints) * 100))
  );

  const autismClassification = useMemo(() => {
    if (autismPercentage >= 66) {
      return {
        level: 'Forte Indicativo de Traços do Espectro (TEA) & Hipersensibilidade',
        insight:
          'Mapeamento indica alta sobrecarga sensorial (auditiva/visual/tátil), desgaste por masking social e necessidade de previsibilidade. A literatura clínica demonstra que o extrato Full Spectrum restaura o tônus de anandamida e o equilíbrio GABA/Glutamato, reduzindo meltdowns/shutdowns e melhorando o sono.',
      };
    }
    if (autismPercentage >= 40) {
      return {
        level: 'Traços Moderados de Sensibilidade Sensorial & Rigidez Cognitiva',
        insight:
          'Presença de marcadores importantes de exaustão pós-social e sensibilidade a estímulos simultâneos. O suporte médico e psicológico integrado com fitocanabinoides favorece a homeostase emocional e o conforto sensorial.',
      };
    }
    return {
      level: 'Sensibilidade Sensorial Leve',
      insight:
        'Indicadores sutis no espectro sensorial. Uma avaliação personalizada com nosso médico e psicólogo pode identificar o melhor protocolo para regulação emocional.',
    };
  }, [autismPercentage]);

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
    const summaryText = `[Rastreio TDAH ASRS-18 (12 Perguntas): ${adhdPercentage}% - ${adhdClassification.level}] Pontuação: ${adhdTotalPoints}/${adhdMaxPoints}. Relata desatenção executiva, mente acelerada e busca modulação canabinoide (CBD+CBG) para foco e estabilidade.`;

    reset();
    setAnswer('objectives', mergedObjs);
    setAnswer('foco', true);
    setAnswer('memoria', true);
    setAnswer('intensity', adhdPercentage >= 70 ? '8' : '6');
    setAnswer('adhdTestResult', {
      scorePercent: adhdPercentage,
      totalPoints: adhdTotalPoints,
      maxPoints: adhdMaxPoints,
      questionsCount: ADHD_QUESTIONS.length,
      classification: adhdClassification.level,
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
    const summaryText = `[Rastreio Autismo TEA Expandido (12 Perguntas - ${targetLabel}): ${autismPercentage}% - ${autismClassification.level}] Pontuação: ${autismTotalPoints}/${autismMaxPoints}. Busca regulação sensorial, equilíbrio emocional e suporte médico + psicológico.`;

    reset();
    setAnswer('objectives', mergedObjs);
    setAnswer('intensity', autismPercentage >= 66 ? '8' : '6');
    setAnswer('autismTestResult', {
      scorePercent: autismPercentage,
      totalPoints: autismTotalPoints,
      maxPoints: autismMaxPoints,
      questionsCount: AUTISM_QUESTIONS.length,
      targetProfile: targetLabel,
      classification: autismClassification.level,
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
                <Sparkles className="w-4 h-4 text-mecura-neon shrink-0" />
                <span className="text-xs font-bold text-white tracking-wide truncate">
                  Testes Neuro-Interativos & Calculadora HC
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
                <span>TDAH (12)</span>
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
                <span>Autismo (12)</span>
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

            {/* ==================== TOOL 1: TESTE DE TDAH (12 PERGUNTAS) ==================== */}
            {activeTool === 'tdah' && (
              <AnimatePresence mode="wait">
                {!adhdFinished ? (
                  <motion.div
                    key={`adhd-q-${adhdStep}`}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-[#8A8A9E]">
                      <span className="text-sky-400 font-bold truncate pr-2">
                        {ADHD_QUESTIONS[adhdStep].domain}
                      </span>
                      <span className="font-mono tabular-nums text-white/80 font-bold shrink-0">
                        Pergunta {adhdStep + 1} / {ADHD_QUESTIONS.length}
                      </span>
                    </div>

                    {/* Question Step Pills (Interactive Jump) */}
                    <div className="grid grid-cols-12 gap-1">
                      {ADHD_QUESTIONS.map((q, idx) => {
                        const answered = adhdScores[idx] !== undefined;
                        const current = idx === adhdStep;
                        return (
                          <button
                            key={q.id}
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
                        ⚡ Alvo: {ADHD_QUESTIONS[adhdStep].neuralTarget}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-[14px] sm:text-[15px] leading-snug">
                      {ADHD_QUESTIONS[adhdStep].question}
                    </h3>

                    <div className="space-y-2 pt-0.5">
                      {FREQUENCY_OPTIONS.map((opt, idx) => {
                        const isSelected = adhdScores[adhdStep] === opt.points;
                        return (
                          <button
                            key={idx}
                            onMouseEnter={() => setAdhdLastPoints(opt.points)}
                            type="button"
                            onClick={() => handleSelectAdhdOption(opt.points)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
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
                        <ChevronLeft className="w-4 h-4" /> Voltar pergunta anterior
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
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0E1B13] to-[#060D08] border border-sky-400/25 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-sky-300 font-semibold">
                          Resultado ASRS-18 (12 Domínios Neurais)
                        </span>
                        <span className="text-2xl font-black text-mecura-neon font-mono tabular-nums">
                          {adhdPercentage}%
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white">
                        {adhdClassification.level}
                      </div>

                      <p className="text-xs text-[#B0B0C4] leading-relaxed">
                        {adhdClassification.insight}
                      </p>

                      <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
                          <span className="text-[#8A8A9E] block">Protocolo Sugerido</span>
                          <span className="text-white font-bold">CBD + CBG Foco Diurno</span>
                        </div>
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
                          <span className="text-[#8A8A9E] block">Avaliação Integrada</span>
                          <span className="text-sky-300 font-bold">Médico + Psicólogo</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedFromAdhd}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-mecura-neon via-[#9EFF00] to-[#82E000] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(166,255,0,0.25)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>Iniciar Consulta com Este Resultado</span>
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
                      <RotateCcw className="w-3.5 h-3.5" /> Refazer Teste de TDAH
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ==================== TOOL 2: TESTE DE AUTISMO (12 PERGUNTAS) ==================== */}
            {activeTool === 'autism' && (
              <AnimatePresence mode="wait">
                {!autismFinished ? (
                  <motion.div
                    key={`autism-q-${autismStep}`}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
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
                          Para Mim (Adulto)
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

                    <div className="flex items-center justify-between text-xs text-[#8A8A9E]">
                      <span className="text-purple-300 font-bold truncate pr-2">
                        {AUTISM_QUESTIONS[autismStep].domain}
                      </span>
                      <span className="font-mono tabular-nums text-white/80 font-bold shrink-0">
                        Pergunta {autismStep + 1} / {AUTISM_QUESTIONS.length}
                      </span>
                    </div>

                    {/* Interactive Step Dots */}
                    <div className="grid grid-cols-12 gap-1">
                      {AUTISM_QUESTIONS.map((q, idx) => {
                        const answered = autismScores[idx] !== undefined;
                        const current = idx === autismStep;
                        return (
                          <button
                            key={q.id}
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
                        ✨ Via: {AUTISM_QUESTIONS[autismStep].neuralTarget}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-[14px] sm:text-[15px] leading-snug">
                      {AUTISM_QUESTIONS[autismStep].question}
                    </h3>

                    <div className="space-y-2 pt-0.5">
                      {FREQUENCY_OPTIONS.map((opt, idx) => {
                        const isSelected = autismScores[autismStep] === opt.points;
                        return (
                          <button
                            key={idx}
                            onMouseEnter={() => setAutismLastPoints(opt.points)}
                            type="button"
                            onClick={() => handleSelectAutismOption(opt.points)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
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
                        <ChevronLeft className="w-4 h-4" /> Voltar pergunta anterior
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
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0E1711] to-[#060D08] border border-purple-400/25 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-300 font-semibold">
                          Mapeamento Espectro Autista (12 Domínios)
                        </span>
                        <span className="text-2xl font-black text-mecura-neon font-mono tabular-nums">
                          {autismPercentage}%
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white">
                        {autismClassification.level}
                      </div>

                      <p className="text-xs text-[#B0B0C4] leading-relaxed">
                        {autismClassification.insight}
                      </p>

                      <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
                          <span className="text-[#8A8A9E] block">Suporte Clínico</span>
                          <span className="text-white font-bold">Laudo Médico + Psicológico</span>
                        </div>
                        <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
                          <span className="text-[#8A8A9E] block">Foco Terapêutico</span>
                          <span className="text-purple-300 font-bold">Regulação Sensorial</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedFromAutism}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-mecura-neon via-[#9EFF00] to-[#82E000] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(166,255,0,0.25)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>Iniciar Consulta com Este Mapeamento</span>
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
                      <RotateCcw className="w-3.5 h-3.5" /> Refazer Teste de Autismo
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
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = medCategoryFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
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
                      filteredCatalogMeds.slice(0, 40).map((item) => {
                        const isChosen = selectedHcMeds.some((s) => s.med.id === item.id);
                        return (
                          <button
                            key={item.id}
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
                    {selectedHcMeds.map(({ med, dailyUnits }) => {
                      const medDailyMg = Math.round(dailyUnits * med.mgPerUnit);
                      return (
                        <div
                          key={med.id}
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
                  <span>Iniciar Consulta para Receita + Laudo HC</span>
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
