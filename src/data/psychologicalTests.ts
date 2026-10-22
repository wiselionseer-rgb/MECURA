// Centralized psychological screening tests & clinical scales
// Consonante com diretrizes do CFP (Resolução CFP nº 06/2019)

export interface PsychologicalQuestion {
  id: string;
  domain: string;
  question: string;
  clinicalRelevance?: string;
}

export interface PsychologicalTestDefinition {
  id: 'phq9' | 'gad7' | 'asrs18' | 'aq10';
  code: string;
  name: string;
  shortName: string;
  targetDomain: string;
  scientificReference: string;
  minScore: number;
  maxScore: number;
  cutoffScore: number;
  cutoffText: string;
  frequencyOptions: { label: string; points: number; sub?: string }[];
  questions: PsychologicalQuestion[];
  interpret: (score: number) => { classification: string; severity: 'min' | 'mild' | 'mod' | 'high' | 'severe'; interpretation: string };
}

// 1. QUESTIONÁRIO PHQ-9 (Patient Health Questionnaire-9)
export const PHQ9_TEST: PsychologicalTestDefinition = {
  id: 'phq9',
  code: 'PHQ-9',
  name: 'Questionário sobre a Saúde do Paciente (PHQ-9)',
  shortName: 'PHQ-9 Depressão',
  targetDomain: 'Rastreio e Gravidade de Sintomas Depressivos',
  scientificReference: 'Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001.',
  minScore: 0,
  maxScore: 27,
  cutoffScore: 10,
  cutoffText: 'Escore ≥ 10 indica ponto de corte clínico para rastreio depressivo moderado/grave.',
  frequencyOptions: [
    { label: 'Nenhuma vez', points: 0, sub: '0 dias nas últimas 2 semanas' },
    { label: 'Vários dias', points: 1, sub: 'Menos de uma semana' },
    { label: 'Mais da metade dos dias', points: 2, sub: 'Mais de 7 dias' },
    { label: 'Quase todos os dias', points: 3, sub: 'Presente quase diariamente' },
  ],
  questions: [
    {
      id: 'phq1',
      domain: 'Anedonia / Prazer',
      question: 'Pouco interesse ou pouco prazer em fazer as coisas que costumava gostar?',
    },
    {
      id: 'phq2',
      domain: 'Humor Depressivo',
      question: 'Sentir-se para baixo, deprimido(a), triste ou sem perspectiva de futuro?',
    },
    {
      id: 'phq3',
      domain: 'Padrão de Sono',
      question: 'Dificuldade para adormecer, despertar no meio da noite, ou dormir em excesso?',
    },
    {
      id: 'phq4',
      domain: 'Energia & Disposição',
      question: 'Sentir-se cansado(a), com pouca energia ou esgotamento psicofísico?',
    },
    {
      id: 'phq5',
      domain: 'Apetite & Alimentação',
      question: 'Falta de apetite acentuada ou compulsão alimentar / comer em excesso?',
    },
    {
      id: 'phq6',
      domain: 'Autoestima & Culpa',
      question: 'Sentir-se mal consigo mesmo(a) — sensação de fracasso ou de ter decepcionado a si ou à família?',
    },
    {
      id: 'phq7',
      domain: 'Concentração & Cognição',
      question: 'Dificuldade para se concentrar nas atividades cotidianas (ler, trabalhar, assistir TV)?',
    },
    {
      id: 'phq8',
      domain: 'Psicomotricidade',
      question: 'Lentidão para se mover/falar percebida pelos outros, ou agitação motora / inquietação?',
    },
    {
      id: 'phq9',
      domain: 'Ideação & Desesperança',
      question: 'Pensamentos de que seria melhor estar morto(a) ou vontade de se ferir de alguma forma?',
    },
  ],
  interpret: (score: number) => {
    if (score >= 20) {
      return {
        classification: 'Sintomas Depressivos Graves',
        severity: 'severe',
        interpretation: 'Sintomatologia depressiva de intensidade severa, com impacto funcional crítico na rotina. Demanda acompanhamento intensivo e suporte multidisciplinar.',
      };
    }
    if (score >= 15) {
      return {
        classification: 'Sintomas Depressivos Moderadamente Graves',
        severity: 'high',
        interpretation: 'Repercussão clínica relevante no humor e na energia vital. Indicação formal de intervenção psicoterápica estruturada contínua.',
      };
    }
    if (score >= 10) {
      return {
        classification: 'Sintomas Depressivos Moderados',
        severity: 'mod',
        interpretation: 'Escore atinge ponto de corte clínico (≥10). Presença de anedonia, oscilação de sono/apetite e fadiga que justificam seguimento clínico.',
      };
    }
    if (score >= 5) {
      return {
        classification: 'Sintomas Depressivos Leves',
        severity: 'mild',
        interpretation: 'Sintomas depressivos subclínicos ou reativos a estressores pontuais. Monitoramento longitudinal preventivo recomendado.',
      };
    }
    return {
      classification: 'Sintomas Mínimos ou Ausentes',
      severity: 'min',
      interpretation: 'Ausência de indicadores significativos de depressão clínica no período avaliado.',
    };
  },
};

// 2. TESTE GAD-7 (Generalized Anxiety Disorder 7)
export const GAD7_TEST: PsychologicalTestDefinition = {
  id: 'gad7',
  code: 'GAD-7',
  name: 'Escala de Ansiedade Generalizada (GAD-7)',
  shortName: 'GAD-7 Ansiedade',
  targetDomain: 'Rastreio e Mensuração de Sintomas Ansiosos',
  scientificReference: 'Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006.',
  minScore: 0,
  maxScore: 21,
  cutoffScore: 10,
  cutoffText: 'Escore ≥ 10 indica probabilidade elevada de Transtorno de Ansiedade Generalizada (TAG).',
  frequencyOptions: [
    { label: 'Nenhuma vez', points: 0, sub: '0 dias nas últimas 2 semanas' },
    { label: 'Vários dias', points: 1, sub: 'Menos de uma semana' },
    { label: 'Mais da metade dos dias', points: 2, sub: 'Mais de 7 dias' },
    { label: 'Quase todos os dias', points: 3, sub: 'Presente quase diariamente' },
  ],
  questions: [
    {
      id: 'gad1',
      domain: 'Tensão & Nervosismo',
      question: 'Sentir-se nervoso(a), ansioso(a) ou muito tenso(a) / "no limite"?',
    },
    {
      id: 'gad2',
      domain: 'Controle de Preocupações',
      question: 'Não ser capaz de impedir ou de controlar as preocupações excessivas?',
    },
    {
      id: 'gad3',
      domain: 'Preocupação Multitemática',
      question: 'Preocupar-se excessivamente com diversas coisas diferentes ao mesmo tempo?',
    },
    {
      id: 'gad4',
      domain: 'Relaxamento & Tônus',
      question: 'Dificuldade para conseguir relaxar o corpo e a mente?',
    },
    {
      id: 'gad5',
      domain: 'Inquietação Psicomotora',
      question: 'Ficar tão agitado(a) que se torna difícil ficar parado(a) ou sentado(a)?',
    },
    {
      id: 'gad6',
      domain: 'Irritabilidade Reativa',
      question: 'Ficar facilmente irritado(a), impaciente ou aborrecido(a) com pequenos acontecimentos?',
    },
    {
      id: 'gad7',
      domain: 'Medo Antecipatório',
      question: 'Sentir medo ou pressentimento constante como se algo horrível fosse acontecer?',
    },
  ],
  interpret: (score: number) => {
    if (score >= 15) {
      return {
        classification: 'Ansiedade Severa / Grave',
        severity: 'severe',
        interpretation: 'Hiperativação psicofisiológica crônica, com hipervigilância, tensão muscular e sofrimento psíquico acentuado. Requer plano psicoterapêutico prioritário.',
      };
    }
    if (score >= 10) {
      return {
        classification: 'Ansiedade Moderada (Ponto de Corte Clínico)',
        severity: 'mod',
        interpretation: 'Escore igual ou superior ao ponto de corte de rastreio (≥10). Sintomas ansiosos interferem no sono, foco e qualidade de vida cotidiana.',
      };
    }
    if (score >= 5) {
      return {
        classification: 'Ansiedade Leve',
        severity: 'mild',
        interpretation: 'Nível leve de tensão ansiosa, predominantemente reativa a demandas e estressores ambientais. Aconselha-se intervenção psicoeducativa.',
      };
    }
    return {
      classification: 'Ansiedade Mínima / Típica',
      severity: 'min',
      interpretation: 'Sintomas ansiosos dentro da faixa basal esperada, sem indicativo de desregulação patológica no momento.',
    };
  },
};

// 3. ESCALA ASRS-18 (Adult ADHD Self-Report Scale v1.1 - OMS)
export const ASRS18_TEST: PsychologicalTestDefinition = {
  id: 'asrs18',
  code: 'ASRS-18',
  name: 'Escala de Auto-relato de TDAH em Adultos (ASRS-18 / OMS)',
  shortName: 'ASRS-18 TDAH',
  targetDomain: 'Rastreio de Déficit de Atenção e Hiperatividade/Impulsividade',
  scientificReference: 'Kessler RC, Adler L, Ames M, et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychol Med. 2005.',
  minScore: 0,
  maxScore: 72,
  cutoffScore: 36,
  cutoffText: 'Parte A com 4+ sintomas frequentes ou escore total ≥ 36 indica alta probabilidade de TDAH.',
  frequencyOptions: [
    { label: 'Nunca', points: 0 },
    { label: 'Raramente', points: 1 },
    { label: 'Às vezes', points: 2 },
    { label: 'Frequentemente', points: 3 },
    { label: 'Muito frequentemente', points: 4 },
  ],
  questions: [
    // Parte A (Rastreio Fundamental - 6 itens)
    { id: 'asrs1', domain: 'Desatenção', question: 'Com que frequência você comete erros por descuido quando tem que trabalhar num projeto chato ou difícil?' },
    { id: 'asrs2', domain: 'Desatenção', question: 'Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho chato ou repetitivo?' },
    { id: 'asrs3', domain: 'Desatenção', question: 'Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando estão falando diretamente com você?' },
    { id: 'asrs4', domain: 'Função Executiva', question: 'Com que frequência você tem dificuldade para finalizar os detalhes de um projeto após as partes mais desafiadoras terem sido feitas?' },
    { id: 'asrs5', domain: 'Organização', question: 'Com que frequência você tem dificuldade para organizar tarefas que exigem planejamento em múltiplas etapas?' },
    { id: 'asrs6', domain: 'Compromissos', question: 'Quando você tem uma tarefa que exige muito pensamento, com que frequência você a evita ou adia o início?' },
    // Parte B (Sintomas Complementares de Desatenção e Hiperatividade - 12 itens)
    { id: 'asrs7', domain: 'Hiperatividade Motora', question: 'Com que frequência você fica remexendo as mãos ou os pés quando tem que ficar sentado(a) por muito tempo?' },
    { id: 'asrs8', domain: 'Inquietação', question: 'Com que frequência você se levanta da cadeira em reuniões ou outras situações onde se espera que você fique sentado(a)?' },
    { id: 'asrs9', domain: 'Inquietação Interna', question: 'Com que frequência você se sente inquieto(a) ou agitado(a) internamente?' },
    { id: 'asrs10', domain: 'Atividades Tranquilas', question: 'Com que frequência você tem dificuldade para relaxar e praticar atividades de lazer calmamente?' },
    { id: 'asrs11', domain: 'Motor Ligado', question: 'Com que frequência você se sente "a mil por hora" ou sente que está funcionando "a todo vapor" como se movido por um motor?' },
    { id: 'asrs12', domain: 'Verborragia', question: 'Com que frequência você se pega falando demais em situações sociais?' },
    { id: 'asrs13', domain: 'Impulsividade Verbal', question: 'Quando está numa conversa, com que frequência você termina a frase das outras pessoas antes que elas concluam?' },
    { id: 'asrs14', domain: 'Impaciência / Espera', question: 'Com que frequência você tem dificuldade para esperar sua vez em filas ou situações que exigem espera?' },
    { id: 'asrs15', domain: 'Interrupção', question: 'Com que frequência você interrompe os outros quando eles estão ocupados?' },
    { id: 'asrs16', domain: 'Memória Operacional', question: 'Com que frequência você perde ou tem dificuldade para encontrar objetos necessários para tarefas do dia a dia?' },
    { id: 'asrs17', domain: 'Distratibilidade', question: 'Com que frequência você se distrai com barulhos ou acontecimentos ao seu redor?' },
    { id: 'asrs18', domain: 'Olvidos na Rotina', question: 'Com que frequência você se esquece de compromissos ou obrigações que precisava cumprir?' },
  ],
  interpret: (score: number) => {
    if (score >= 46) {
      return {
        classification: 'Altamente Sugestivo de TDAH no Adulto (Rastreio Positivo Acentuado)',
        severity: 'severe',
        interpretation: 'Apresenta alta frequência de sintomas de desatenção, desorganização executiva e/ou inquietação motora. Indicativo forte para protocolo terapêutico focado em funções executivas.',
      };
    }
    if (score >= 32) {
      return {
        classification: 'Compatibilidade Moderada com TDAH (Rastreio Positivo)',
        severity: 'mod',
        interpretation: 'Sintomatologia de desatenção e impulsividade com prejuízo em ambientes profissionais e acadêmicos. Recomenda-se investigação detalhada e manejo psicoterapêutico.',
      };
    }
    if (score >= 18) {
      return {
        classification: 'Sintomas Leves de Oscilação de Foco / Desatenção Reativa',
        severity: 'mild',
        interpretation: 'Sintomas dispersos, possivelmente secundários a sobrecarga de estresse, fadiga ou privação de sono.',
      };
    }
    return {
      classification: 'Baixa Probabilidade de TDAH / Rastreio Negativo',
      severity: 'min',
      interpretation: 'Sintomas de desatenção e hiperatividade abaixo do limiar de relevância clínica para TDAH.',
    };
  },
};

// 4. TESTE AQ-10 (Autism Spectrum Quotient - 10 itens Cambridge validado)
export const AQ10_TEST: PsychologicalTestDefinition = {
  id: 'aq10',
  code: 'AQ-10',
  name: 'Teste de Autismo Adulto Online — AQ-10 (Cambridge Validado)',
  shortName: 'AQ-10 Autismo (TEA)',
  targetDomain: 'Rastreio Breve de Traços do Espectro do Autismo (TEA) em Adultos',
  scientificReference: 'Allison C, Auyeung B, Baron-Cohen S. Toward brief "red flags" for autism screening: the short Autism Spectrum Quotient and the Clinical Practice Research Datalink. J Am Acad Child Adolesc Psychiatry. 2012.',
  minScore: 0,
  maxScore: 10,
  cutoffScore: 6,
  cutoffText: 'Ponto de corte validado: Escore ≥ 6 indica rastreio positivo e recomendação de avaliação especializada.',
  frequencyOptions: [
    { label: 'Discordo Totalmente', points: 0 },
    { label: 'Discordo Parcialmente', points: 0 },
    { label: 'Concordo Parcialmente', points: 1 },
    { label: 'Concordo Totalmente', points: 1 },
  ],
  questions: [
    { id: 'aq1', domain: 'Atenção a Detalhes', question: 'Eu frequentemente percebo pequenos sons quando outras pessoas não percebem nada?' },
    { id: 'aq2', domain: 'Visão Global vs. Detalhe', question: 'Eu costumo focar mais no quadro geral do que nos pequenos detalhes?' },
    { id: 'aq3', domain: 'Troca de Atenção (Switching)', question: 'Eu acho fácil fazer mais de uma coisa ao mesmo tempo sem me desorganizar?' },
    { id: 'aq4', domain: 'Interrupção de Tarefa', question: 'Se houver uma interrupção enquanto estou focado(a), consigo voltar ao que estava fazendo muito rapidamente?' },
    { id: 'aq5', domain: 'Comunicação Social / Entrelinhas', question: 'Eu acho fácil "ler nas entrelinhas" quando alguém está conversando comigo?' },
    { id: 'aq6', domain: 'Percepção de Tédio do Outro', question: 'Eu costumo perceber facilmente se a pessoa que está me ouvindo está ficando entediada?' },
    { id: 'aq7', domain: 'Imaginação e Teoria da Mente', question: 'Quando estou lendo uma história, acho difícil imaginar como os personagens se parecem ou o que sentem?' },
    { id: 'aq8', domain: 'Interesses Específicos & Padrões', question: 'Eu gosto de coletar informações sobre categorias de coisas (tipos de carros, plantas, músicas, dados históricos)?' },
    { id: 'aq9', domain: 'Leitura de Expressões Faciais', question: 'Eu acho fácil entender o que alguém está sentindo apenas olhando para o rosto da pessoa?' },
    { id: 'aq10', domain: 'Adaptação e Intenções', question: 'Eu acho difícil decifrar as intenções das outras pessoas quando interajo em novos ambientes?' },
  ],
  interpret: (score: number) => {
    if (score >= 6) {
      return {
        classification: 'Rastreio Positivo para Traços do Espectro Autista (≥ 6/10 pts)',
        severity: 'mod',
        interpretation: 'Pontuação igual ou superior ao ponto de corte validado de Cambridge (AQ-10 ≥ 6). Indica presença significativa de características neurocomportamentais compatíveis com TEA em adultos (sensibilidade sensorial, pragmática social e estilo cognitivo detalhista). Recomendada avaliação diagnóstica compreensiva.',
      };
    }
    return {
      classification: 'Rastreio Negativo para Traços no Espectro (< 6/10 pts)',
      severity: 'min',
      interpretation: 'Pontuação abaixo do ponto de corte validado pelo Cambridge Autism Research Centre. Não apresenta indícios clínicos proeminentes de TEA pelo instrumento breve.',
    };
  },
};

export const ALL_PSYCHOLOGICAL_TESTS: PsychologicalTestDefinition[] = [
  PHQ9_TEST,
  GAD7_TEST,
  ASRS18_TEST,
  AQ10_TEST,
];

export interface SelectedPsychologicalTest {
  id: 'phq9' | 'gad7' | 'asrs18' | 'aq10';
  name: string;
  shortName: string;
  applied: boolean;
  score: number | string;
  maxScore: number;
  classification: string;
  clinicalInterpretation: string;
  cutoffText: string;
}

/**
 * Builds standard pre-filled selected tests array based on patient's answers and triage
 */
export function buildDefaultSelectedTests(answers?: any): SelectedPsychologicalTest[] {
  const ans = answers || {};
  const objList: string[] = Array.isArray(ans.objectives)
    ? ans.objectives.map((o: any) => String(o).toLowerCase())
    : ans.objective
      ? [String(ans.objective).toLowerCase()]
      : [];

  const textLower = `${objList.join(' ')} ${String(ans.symptoms || '')} ${String(ans.description || '')}`.toLowerCase();
  const hasDepression = textLower.includes('depress') || !!ans.tristeza;
  const hasAnxiety = textLower.includes('ansiedade') || !!ans.ansiedade_diag || !!ans.panico || !!ans.estresse;
  const hasAdhd = textLower.includes('tdah') || textLower.includes('foco') || !!ans.foco || !!ans.adhdTestResult;
  const hasAutism = textLower.includes('autis') || textLower.includes('tea') || !!ans.autismTestResult;

  const complementPhq9 = ans.adhdTestResult?.phq9ComplementScore ?? ans.autismTestResult?.phq9ComplementScore;
  const complementGad7 = ans.adhdTestResult?.gad7ComplementScore ?? ans.autismTestResult?.gad7ComplementScore;

  // PHQ-9 default
  const phqApplied = hasDepression || ans.phq9Result?.score !== undefined || complementPhq9 !== undefined;
  const phqScore = ans.phq9Result?.score ?? complementPhq9 ?? (hasDepression ? (ans.intensity ? Math.min(27, Math.round(Number(ans.intensity) * 1.8)) : 12) : 6);
  const phqInterp = PHQ9_TEST.interpret(phqScore);

  // GAD-7 default
  const gadApplied = hasAnxiety || ans.gad7Result?.score !== undefined || complementGad7 !== undefined || (!hasDepression && !hasAdhd && !hasAutism);
  const gadScore = ans.gad7Result?.score ?? complementGad7 ?? (hasAnxiety ? (ans.intensity ? Math.min(21, Math.round(Number(ans.intensity) * 1.5)) : 13) : 7);
  const gadInterp = GAD7_TEST.interpret(gadScore);

  // ASRS-18 default
  const asrsApplied = hasAdhd || !!ans.adhdTestResult;
  const asrsScore = ans.adhdTestResult?.asrs18EquivalentScore !== undefined
    ? ans.adhdTestResult.asrs18EquivalentScore
    : ans.adhdTestResult?.totalPoints !== undefined
      ? (ans.adhdTestResult.maxPoints === 36 ? Math.min(72, Math.round(ans.adhdTestResult.totalPoints * 2)) : ans.adhdTestResult.totalPoints)
      : (hasAdhd ? 38 : 14);
  const asrsInterp = ASRS18_TEST.interpret(asrsScore);

  // AQ-10 default
  const aqApplied = hasAutism || !!ans.autismTestResult;
  const aqScore = ans.autismTestResult?.aq10EquivalentScore !== undefined
    ? ans.autismTestResult.aq10EquivalentScore
    : ans.autismTestResult?.totalPoints !== undefined
      ? (ans.autismTestResult.totalPoints > 10 ? Math.min(10, Math.round((ans.autismTestResult.totalPoints / 36) * 10)) : ans.autismTestResult.totalPoints)
      : (hasAutism ? 7 : 3);
  const aqInterp = AQ10_TEST.interpret(aqScore);

  return [
    {
      id: 'phq9',
      name: PHQ9_TEST.name,
      shortName: PHQ9_TEST.shortName,
      applied: phqApplied,
      score: phqScore,
      maxScore: PHQ9_TEST.maxScore,
      classification: phqInterp.classification,
      clinicalInterpretation: phqInterp.interpretation,
      cutoffText: PHQ9_TEST.cutoffText,
    },
    {
      id: 'gad7',
      name: GAD7_TEST.name,
      shortName: GAD7_TEST.shortName,
      applied: gadApplied,
      score: gadScore,
      maxScore: GAD7_TEST.maxScore,
      classification: gadInterp.classification,
      clinicalInterpretation: gadInterp.interpretation,
      cutoffText: GAD7_TEST.cutoffText,
    },
    {
      id: 'asrs18',
      name: ASRS18_TEST.name,
      shortName: ASRS18_TEST.shortName,
      applied: asrsApplied,
      score: asrsScore,
      maxScore: ASRS18_TEST.maxScore,
      classification: asrsInterp.classification,
      clinicalInterpretation: asrsInterp.interpretation,
      cutoffText: ASRS18_TEST.cutoffText,
    },
    {
      id: 'aq10',
      name: AQ10_TEST.name,
      shortName: AQ10_TEST.shortName,
      applied: aqApplied,
      score: aqScore,
      maxScore: AQ10_TEST.maxScore,
      classification: aqInterp.classification,
      clinicalInterpretation: aqInterp.interpretation,
      cutoffText: AQ10_TEST.cutoffText,
    },
  ];
}
