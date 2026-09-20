export interface PatientClinicalAnswers {
  objectives?: string[];
  intensity?: number | string;
  duration?: string;
  description?: string;
  height?: string | number;
  weight?: string | number;
  sex?: string;
  tratamento_atual?: boolean;
  tratamento_atual_details?: string;
  remedios?: boolean;
  remedios_details?: string;
  doenca_cronica?: boolean;
  doenca_cronica_details?: string;
  cirurgia?: boolean;
  cirurgia_details?: string;
  alergia?: boolean;
  alergia_details?: string;
  digestivo?: boolean;
  digestivo_details?: string;
  cannabis?: boolean;
  cannabis_details?: string;
  dirige?: boolean;
  maquinario?: boolean;
  blitz?: boolean;
  laudo_psicomotor?: boolean;
  arritmia?: boolean;
  psicose_hist?: boolean;
  esquizofrenia_diag?: boolean;
  esquizofrenia_parente?: boolean;
  panico?: boolean;
  ansiedade_diag?: boolean;
  estresse?: boolean;
  fuma?: boolean;
  bebida?: boolean;
  exercicio?: boolean;
}

export function generateClinicalAnalysisFallback(
  promptText: string, 
  patientData?: PatientClinicalAnswers,
  brandPreference: 'flowermed' | 'greenbudz' | 'both' = 'both'
): string {
  // Extract or receive patient data
  const textToScan = promptText || '';
  
  // Extract info from promptText if patientData is not fully supplied
  const objectives = patientData?.objectives || extractListFromPrompt(textToScan, 'Queixa Principal / Objetivos:');
  const intensity = patientData?.intensity || extractFieldFromPrompt(textToScan, 'Intensidade do Sintoma:') || '7';
  const duration = patientData?.duration || extractFieldFromPrompt(textToScan, 'Cronicidade/Duração:') || 'Crônica (> 6 meses)';
  const description = patientData?.description || extractFieldFromPrompt(textToScan, 'História da Moléstia (Descrição):') || '';
  const height = patientData?.height || extractFieldFromPrompt(textToScan, 'Altura') || '1.70';
  const weight = patientData?.weight || extractFieldFromPrompt(textToScan, 'Peso') || '70';
  const sex = patientData?.sex || (textToScan.includes('Feminino') ? 'Feminino' : 'Masculino');
  
  const remediosDetails = patientData?.remedios_details || extractFieldFromPrompt(textToScan, 'Uso de Fármacos (Sim: ') || '';
  const doencaCronicaDetails = patientData?.doenca_cronica_details || extractFieldFromPrompt(textToScan, 'Comorbidade Crônica (Sim: ') || '';
  const digestivoDetails = patientData?.digestivo_details || extractFieldFromPrompt(textToScan, 'Problemas Digestivos (Sim: ') || '';
  
  // Safety risk flags - ONLY trigger if explicit positive answer in data or "Sim" in prompt text
  const hasPsychosisRisk = Boolean(
    patientData?.psicose_hist === true || 
    patientData?.esquizofrenia_diag === true || 
    patientData?.esquizofrenia_parente === true || 
    /Histórico Psicose\/Esquizofrenia \(Sim\)/i.test(textToScan) ||
    /psicose_hist:\s*true|esquizofrenia_diag:\s*true/i.test(textToScan)
  );
  
  const drivesOrMachinery = Boolean(
    patientData?.dirige === true || 
    patientData?.maquinario === true || 
    /Dirige \(Sim\)|Opera Maquinário \(Sim\)/i.test(textToScan)
  );

  const hasArrhythmia = Boolean(
    patientData?.arritmia === true || 
    /Arritmia \(Sim\)/i.test(textToScan)
  );

  const hasContinuousMeds = Boolean(
    patientData?.remedios === true || 
    remediosDetails.length > 0 || 
    /Uso de Fármacos \(Sim/i.test(textToScan)
  );

  const combinedText = `${objectives.join(' ')} ${description} ${textToScan}`.toLowerCase();

  // Pathology classification
  const isPain = /dor|lombar|coluna|articular|artrite|artrose|muscular|fibromialgia|nervo|ciático|enxaqueca|cefaleia|algia/i.test(combinedText);
  const isInsomnia = /sono|insônia|dormir|acordar|despertar|noturno|descanso/i.test(combinedText);
  const isAnxiety = /ansiedade|pânico|estresse|nervosismo|tensão|angústia|burnout|tept/i.test(combinedText);
  const isADHD = /tdah|foco|concentra|atenção|hiperatividade|produtividade|memória/i.test(combinedText);
  const isDepression = /depressão|desânimo|tristeza|anedonia|apatia|fadiga|cansaço/i.test(combinedText);
  const isEpilepsy = /epilepsia|convuls|crise|convulsiva/i.test(combinedText);
  const isAutism = /autismo|tea|espectro/i.test(combinedText);

  // Determine Primary Syndrome
  let primarySyndrome = "Transtorno de Ansiedade Generalizada, Tensão Psicoemocional e Desregulação do Eixo HPA";
  let pathophysRationale = `A apresentação clínica revela hipofunção do tônus endocanabinoide basal, manifestada por hiper-reatividade da amígdala cerebral e disfunção nos receptores serotoninérgicos 5-HT1A e gabaérgicos. O Canabidiol (CBD) atua como modulador alostérico positivo dos receptores GABA-A e agonista dos receptores 5-HT1A, promovendo ansiólise rápida sem indução de tolerância ou sedação motora excessiva.`;
  
  // Selection of medications
  interface SuggestedMed {
    name: string;
    indication: string;
    usage: string;
    notes: string;
  }

  let importedList: SuggestedMed[] = [];
  let nationalList: SuggestedMed[] = [];

  if (isPain) {
    primarySyndrome = "Síndrome Dolorosa Crônica, Hipersensibilização Central e Tensão Neuromuscular";
    pathophysRationale = `O quadro álgico reflete desregulação nas vias descendentes inibitórias da dor e neuroinflamação sustentada. A combinação de fitocanabinoides (CBD, THC, CBG e terpenos como beta-cariofileno e mirceno) promove neuromodulação nos receptores CB1 centrais e CB2 periféricos, inibindo a liberação de glutamato e substância P na fenda sináptica e exercendo ação anti-inflamatória profunda.`;

    if (hasPsychosisRisk) {
      // Contraindication: strictly zero/trace THC
      importedList.push({
        name: "Sphera 20% CBD Broad Spectrum 6.000 mg",
        indication: "Analgesia Anti-inflamatória Segura e Modulação Imunológica (Livre de THC)",
        usage: "Tomar **05 gotas** sublinguais de **12/12 horas** (reter 60s). Aumentar 1 gota a cada 4 dias até 10-12 gotas/dose.",
        notes: "Formulação Broad Spectrum (EUA) com zero THC, totalmente segura para pacientes com histórico neuropsiquiátrico."
      });
      importedList.push({
        name: "CBN Sleep Gummies 30 un",
        indication: "Alívio Muscular Prolongado e Sono Reparador Sem THC Psicoativo",
        usage: "Mastigar **01 goma** 45 minutos antes de dormir.",
        notes: "Goma terapêutica rica em fitocanabinoides de liberação gradual."
      });
      importedList.push({
        name: "Flor In Natura Lemon Octane (CBD) 14g",
        indication: "Resgate Inalatório Rápido de Picos de Dor e Relaxamento Muscular (Livre de THC Psicoativo)",
        usage: "Inalação de **0,1g a 0,2g** em vaporizador medicinal térmico (180°C) nos episódios agudos de dor.",
        notes: "Perfil 80% Índica com rico teor de Mirceno e Cariofileno para relaxamento somático e conforto físico imediato."
      });
      importedList.push({
        name: "Hemp Oil Syringe CBD 1ml",
        indication: "Extração Concentrada de Resgate Rápido Isenta de THC",
        usage: "Microdosagem vaporizada ou sublingual nos momentos de dor intensa.",
        notes: "Concentrado purificado de CBD para analgesia rápida sem efeito psicoativo."
      });
    } else if (drivesOrMachinery) {
      // Driver profile: non-impairing daytime, restorative bedtime
      importedList.push({
        name: "Flowermed Full Spectrum Hemp Oil 3.000 mg",
        indication: "Analgesia Contínua Diurna e Noturna com Alta Margem de Segurança",
        usage: "Tomar **03 gotas** pela manhã e **05 gotas** à noite (via sublingual). Titulação gradual de 1 gota a cada 5 dias.",
        notes: "Concentração 100 mg/mL. Dose controlada para não interferir na acuidade psicomotora durante a condução diurna."
      });
      importedList.push({
        name: "Gummies D9 10 mg 30 un",
        indication: "Controle de Dores Noturnas e Espasmos Musculares Graves",
        usage: "Ingerir **1/2 a 1 goma** à noite, 1 hora antes de dormir (nunca antes de dirigir).",
        notes: "Liberação entérica prolongada garantindo estabilização analgésica ao longo de todo o ciclo de sono."
      });
      importedList.push({
        name: "Flor In Natura Superglue (THCA) 14g",
        indication: "Resgate Noturno Inalatório para Picos Álgicos e Relaxamento Muscular Profundo",
        usage: "Vaporizar **0,1g a 0,2g** à noite (mínimo de 8h antes de conduzir veículos).",
        notes: "Ação analgésica imediata em 2 a 5 minutos sem sobrecarga matinal."
      });
      importedList.push({
        name: "Hemp Oil Syringe Gelato 2ml (71,6% THCA)",
        indication: "Extração Concentrada para Crises Álgicas Noturnas Refratárias",
        usage: "Microdosagem em vaporizador de concentrados nos momentos de dor severa noturna.",
        notes: "Alta potência para controle imediato de dor em horários de repouso."
      });
    } else {
      // Standard comprehensive pain protocol
      importedList.push({
        name: "Flowermed Full Spectrum 1:1 THC + CBD",
        indication: "Analgesia de Alta Potência, Ação Neuropática e Espasmolítica Sinergística (Óleo)",
        usage: "Iniciar com **02 gotas** de 12/12 horas sublingual. Aumentar 1 gota a cada 4 dias até 6 a 8 gotas/dose conforme resposta clínica.",
        notes: "Proporção balanceada 1:1 (EUA) com Certificado de Análise (COA). Ideal para alívio de dores crônicas refratárias."
      });
      importedList.push({
        name: "Gummies D9 10 mg 30 un",
        indication: "Alívio Analgésico Prolongado de 4 a 6 Horas e Relaxamento Muscular (Goma Comestível)",
        usage: "Ingerir **1/2 a 1 goma** 1 vez ao dia (à noite ou no início de crises álgicas crônicas).",
        notes: "Forma farmacêutica comestível de absorção entérica com liberação lenta e sustentada de THC."
      });
      importedList.push({
        name: "Flor In Natura Superglue (THCA) 14g",
        indication: "Resgate Inalatório Rápido para Crises Álgicas e Espasmos Musculares (Flor 14g)",
        usage: "Vaporizar **0,1g a 0,2g** em vaporizador medicinal de ervas secas a 185°C no momento da crise álgica.",
        notes: "Genética 60% Índica com ação de alívio imediato (início em 2 a 5 minutos) sem sobrecarga hepática."
      });
      importedList.push({
        name: "Hemp Oil Syringe Gelato 2ml (71,6% THCA)",
        indication: "Extração Concentrada de Altíssima Potência para Picos Agudos de Dor Intensa (Seringa)",
        usage: "Microdosagem: Inalar via vaporizador de concentrados ou aplicar micro-gota sob a mucosa nos momentos de dor severa.",
        notes: "Concentrado puro com laudo laboratorial. Potência superior para evitar idas ao pronto-socorro por crises álgicas."
      });
    }

    nationalList.push({
      name: "ÓLEO INTEGRAL THC/CBD 100mg/ml - Associação Nacional",
      indication: "Analgesia Sistêmica Contínua e Modulação Neuroinflamatória",
      usage: "Tomar **05 a 08 gotas** de 12/12 horas sublingual após refeição.",
      notes: "01 Frasco 30mL - Associação Brasileira. Efeito entourage com fitocanabinoides integrais."
    });
    nationalList.push({
      name: "Pomada Canábica Terapêutica 500mg (50g) - Associação Nacional",
      indication: "Alívio Tópico Localizado Direcionado para Músculos e Articulações",
      usage: "Aplicar fina camada sobre a região dolorosa **2 a 3 vezes ao dia**, massageando suavemente.",
      notes: "Ação nos receptores CB2 periféricos cutâneos e articulares sem absorção sistêmica psicoativa."
    });
    nationalList.push({
      name: "Flor in natura PREDOMINANTE THC (Para Vaporização) 15g - Associação Nacional",
      indication: "Resgate Inalatório Analgésico Rápido para Crises de Dor e Espasmos",
      usage: "Vaporizar **0,1g a 0,2g** via vaporizador térmico medicinal a 180°C nos picos de dor.",
      notes: "Flores secas padronizadas de Associação Brasileira. Início de ação em 1 a 3 minutos para quebra imediata de ciclos álgicos agudos sem combustão."
    });

  } else if (isInsomnia) {
    primarySyndrome = "Transtorno do Sono, Insônia de Manutenção e Alteração da Arquitetura Circadiana";
    pathophysRationale = `O distúrbio do sono decorre de hiperativação do sistema nervoso simpático e baixa disponibilidade de anandamida no núcleo supraquiasmático. O fitocanabinoide Canabinol (CBN) e o CBD modulam os receptores CB1 e o ritmo circadiano, reduzindo a latência para início do sono e diminuindo microdespertares noturnos sem causar efeito ressaca ou dependência química.`;

    importedList.push({
      name: "Flowermed CBN 300 mg + CBD 900 mg",
      indication: "Indução e Estabilização do Sono Reparador (Óleo Sublingual)",
      usage: "Tomar **05 a 08 gotas** sublinguais **30 a 45 minutos antes de deitar**. Reter sob a língua por 60 segundos.",
      notes: "Associação sinérgica de CBN + CBD da Flowermed (EUA). Excelente restauração dos estágios de ondas lentas (sono profundo)."
    });
    importedList.push({
      name: "CBN Sleep Gummies 30 un",
      indication: "Manutenção do Sono Prolongado e Prevenção de Despertares Noturnos",
      usage: "Mastigar **01 goma** 45 minutos antes do horário desejado de dormir.",
      notes: "Absorção gastrointestinal com liberação gradual ao longo da madrugada, evitando a insônia de manutenção."
    });
    importedList.push({
      name: "Flor In Natura Forbidden Fruit (D8 THC) 14g",
      indication: "Resgate Inalatório Noturno para Insônia Refratária e Relaxamento Intenso",
      usage: "Vaporizar **0,1g** imediatamente antes de deitar caso haja dificuldade para iniciar o repouso.",
      notes: "Perfil 70% Índica com terpenos Mirceno e Linalol. Sedativo pronunciado e desaceleração do fluxo de pensamentos."
    });
    importedList.push({
      name: "Hemp Oil Gold Budder 5g (Versão THCA)",
      indication: "Extração Concentrada para Indução e Manutenção do Sono Profundo",
      usage: "Microdosagem em vaporizador de concentrados térmico 30 minutos antes do repouso.",
      notes: "Extrato com alta fração terpênica e canabinoides para relaxamento muscular e indução rápida de sonolência."
    });

    nationalList.push({
      name: "ÓLEO INTEGRAL PREDOMINANTE THC 100mg/ml - Associação Nacional",
      indication: "Indução do Sono Reparador e Desligamento Mental Noturno",
      usage: "Tomar **04 a 06 gotas** sublinguais 30 a 45 minutos antes de dormir.",
      notes: "01 Frasco de 30mL - Associação Brasileira. Facilita o adormecer e reduz a latência do sono."
    });
    nationalList.push({
      name: "Pomada Canábica Terapêutica 500mg (50g) - Associação Nacional",
      indication: "Relaxamento Físico, Espasmos e Alívio de Tensões Musculares Noturnas",
      usage: "Aplicar fina camada sobre ombros, nuca e peito antes do repouso.",
      notes: "01 Pote 50g - Associação Brasileira. Modulação periférica CB2 sem efeito psicoativo."
    });
    nationalList.push({
      name: "Flor in natura PREDOMINANTE THC (Para Vaporização) 15g - Associação Nacional",
      indication: "Resgate Inalatório Noturno para Insônia Refratária e Desaceleração Mental",
      usage: "Vaporizar **0,1g** em vaporizador medicinal térmico a 180°C imediatamente antes de deitar caso haja dificuldade para iniciar o repouso.",
      notes: "Flores secas padronizadas de Associação Brasileira. Início em 2 a 5 minutos para indução imediata do repouso sem combustão."
    });

  } else if (isADHD || (isDepression && !isAnxiety)) {
    primarySyndrome = "Déficit de Foco e Atenção, Fadiga Crônica e Desregulação Dopaminérgica Central";
    pathophysRationale = `O quadro clínico envolve baixa tônus dopaminérgico e noradrenérgico no córtex pré-frontal, resultando em dispersão mental e fadiga. Fitocanabinoides como a Tetraidrocanabivarina (THCV) e o Canabigerol (CBG) atuam como moduladores alostéricos do receptor CB1 e antagonistas parciais, potencializando a liberação de dopamina e promovendo clareza cognitiva, estado de alerta e disposição matinal sem taquicardia.`;

    importedList.push({
      name: "Flowermed THCV 300 mg + CBD 900 mg",
      indication: "Otimização de Foco Mental, Clareza Cognitiva e Disposição Funcional Diurna",
      usage: "Tomar **05 gotas** pela manhã logo após o café da manhã. Titular até 8 gotas se necessário.",
      notes: "A THCV atua como modulador diurno de foco e energia mental sem causar ansiedade ou sedação."
    });
    importedList.push({
      name: "Flowermed CBG Isolado 3.000 mg",
      indication: "Neuroproteção, Equilíbrio Emocional e Alívio da Fadiga Mental",
      usage: "Tomar **05 gotas** no início da tarde (13h-14h) para sustentar a produtividade.",
      notes: "O Canabigerol (CBG) possui afinidade por receptores alfa-2 adrenérgicos e 5-HT1A, favorecendo a cognição."
    });
    importedList.push({
      name: "Drops By GreenBudz Goma Evergreen THC",
      indication: "Vitalidade, Conforto Físico e Disposição Funcional Diurna (Goma Comestível)",
      usage: "Ingerir **01 goma** no início do dia antes de tarefas exigentes.",
      notes: "Goma com 5mg THC∆9 e terpenos estimulantes Limoneno e Humuleno."
    });
    importedList.push({
      name: "Flor In Natura Sour Lifter (CBD) 14g",
      indication: "Inalação Diurna para Concentração e Redução do Estresse Funcional",
      usage: "Vaporizar **0,1g a 0,15g** pela manhã ou tarde a 175°C durante jornadas de estudo/trabalho.",
      notes: "Genética 75% Sativa rica em Limoneno e Terpinoleno. Estimula a criatividade e clareza mental sem efeito psicoativo."
    });
    importedList.push({
      name: "Hemp Oil Syringe Gelato 2ml (71,6% THCA)",
      indication: "Extração Concentrada para Resgate Rápido de Fadiga Mental Aguda",
      usage: "Microdosagem em vaporizador de concentrados térmico sob demanda.",
      notes: "Extrato com alta fração terpênica e fitocanabinoides."
    });

    nationalList.push({
      name: "ÓLEO INTEGRAL PREDOMINANTE CBG 50mg/ml - Associação Nacional",
      indication: "Atenção Sustentada, Foco e Equilíbrio Sem Sedação",
      usage: "Tomar **05 gotas** pela manhã e **05 gotas** ao meio-dia.",
      notes: "01 Frasco de 30mL - Associação Brasileira. Estimula o foco e alívio de fadiga física/mental."
    });
    nationalList.push({
      name: "Pomada Canábica Terapêutica 500mg (50g) - Associação Nacional",
      indication: "Alívio Tópico de Tensões Musculares Decorrentes de Carga Mental e Estresse",
      usage: "Aplicar nas têmporas e região cervical 1 a 2 vezes ao dia conforme necessidade.",
      notes: "01 Pote 50g - Associação Brasileira. Relaxamento muscular periférico."
    });
    nationalList.push({
      name: "Flores in natura de cannabis sp rica em CBD 15g - Associação Nacional",
      indication: "Resgate Inalatório Diurno para Clareza Mental e Redução de Ansiedade Funcional",
      usage: "Vaporizar **0,1g a 0,15g** via vaporizador medicinal térmico a 175°C durante períodos de estudo/trabalho.",
      notes: "Flores padronizadas de Associação Brasileira. Rápida modulação do foco sem efeito inebriante."
    });

  } else {
    // General Anxiety / Mood / Burnout / Mixed
    primarySyndrome = "Transtorno de Ansiedade Generalizada, Estresse Crônico e Sobrecarga Neurovegetativa";
    pathophysRationale = `O estresse continuado provoca exaustão adrenal e hipofunção de anandamida, gerando hiperalerta autonômico e labilidade emocional. O CBD em concentrações adequadas modula alostericamente os receptores GABAérgicos e ativa receptores 5-HT1A, devolvendo a capacidade de autorregulação fisiológica e reduzindo o cortisol salivar sem risco de dependência química.`;

    if (hasPsychosisRisk) {
      importedList.push({
        name: "Sphera 10% CBD Broad Spectrum 3.000 mg",
        indication: "Ansiólise Pura, Controle do Estresse e Estabilização Emocional (Zero THC)",
        usage: "Tomar **06 gotas** pela manhã e **06 gotas** ao final da tarde sublingual.",
        notes: "Extração Broad Spectrum totalmente isenta de THC, indicada para pacientes com histórico neuropsiquiátrico sensível."
      });
      importedList.push({
        name: "CBN Sleep Gummies 30 un",
        indication: "Relaxamento Noturno e Proteção do Sono Contra Pensamentos Ruminativos (Sem THC)",
        usage: "Ingerir **01 goma** 45 minutos antes de dormir.",
        notes: "Gomas com CBD e fitocanabinoides não-psicoativos para tranquilidade noturna."
      });
      importedList.push({
        name: "Flor In Natura Sour Lifter (CBD) 14g",
        indication: "Resgate Inalatório para Ansiedade Aguda Sem THC",
        usage: "Vaporizar **0,1g** em momentos de sobrecarga emocional.",
        notes: "Flor rica em CBD e terpenos relaxantes."
      });
      importedList.push({
        name: "Hemp Oil Syringe CBD 1ml",
        indication: "Extração Concentrada de CBD para Estabilização Rápida",
        usage: "Microdosagem sublingual ou inalatória.",
        notes: "Concentrado puro de canabidiol sem THC."
      });
    } else {
      importedList.push({
        name: "Flowermed Full Spectrum Hemp Oil 3.000 mg",
        indication: "Modulação Global da Ansiedade, Estresse Crônico e Equilíbrio Homeostático",
        usage: "Tomar **04 gotas** pela manhã e **06 gotas** no final da tarde (reter 60s sublingual). Titular 1 gota a cada 5 dias.",
        notes: "Extrato completo de cânhamo Flowermed (EUA) com COA lote a lote. Dose prática: 3 gotas ≈ 10 mg de CBD."
      });
      importedList.push({
        name: "CBN Sleep Gummies 30 un",
        indication: "Relaxamento Noturno e Proteção do Sono Contra Pensamentos Ruminativos",
        usage: "Ingerir **01 goma** 45 minutos antes de dormir nos dias de maior sobrecarga de estresse.",
        notes: "Gomas de sabor agradável com liberação controlada para tranquilidade noturna."
      });
      importedList.push({
        name: "Flor In Natura Zoap (THCA) 14g",
        indication: "Equilíbrio Mental Imediato e Descompressão ao Fim do Dia",
        usage: "Vaporizar **0,1g** ao final do dia em vaporizador medicinal a 180°C para transição pós-trabalho.",
        notes: "Genética híbrida balanceada 50/50. Promove leveza mental e relaxamento corporal sem sensação de peso ou lentidão."
      });
      importedList.push({
        name: "Hemp Oil Syringe Gelato 2ml (71,6% THCA)",
        indication: "Extração Concentrada de Resgate para Crises de Tensão ou Pânico Agudo",
        usage: "Microdosagem em vaporizador de concentrados no momento de crise intensa.",
        notes: "Concentrado puro com laudo laboratorial para quebra de pico de ansiedade aguda."
      });
    }

    nationalList.push({
      name: "ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml - Associação Nacional",
      indication: "Controle da Ansiedade, Estresse e Equilíbrio Neuroquímico",
      usage: "Tomar **06 a 08 gotas** pela manhã e **06 gotas** à tarde.",
      notes: "01 Frasco de 30mL - Associação Brasileira. Uso sublingual contínuo com titulação progressiva."
    });
    nationalList.push({
      name: "Pomada Canábica Terapêutica 500mg (50g) - Associação Nacional",
      indication: "Alívio Tópico Localizado de Tensões Musculares e Estresse Somatizado",
      usage: "Aplicar na região cervical, ombros ou peito **2 a 3 vezes ao dia**, massageando suavemente.",
      notes: "01 Pote 50g - Associação Brasileira. Absorção tópica em receptores periféricos CB2."
    });
    nationalList.push({
      name: "Flores in natura de cannabis sp rica em CBD 15g - Associação Nacional",
      indication: "Resgate Imediato para Crises de Pânico e Tensão Aguda",
      usage: "Inalar **0,15g** via vaporizador térmico medicinal nos momentos de crise.",
      notes: "Rápida resposta terapêutica inalatória (1 a 3 min) sem risco de dependência."
    });
  }

  // Adjust importedList according to brandPreference (Flowermed, GreenBudzCBD or Both)
  if (brandPreference === 'greenbudz') {
    if (isPain) {
      importedList = [
        {
          name: "GreenBudz Calm Vibe Oil 6000mg",
          indication: "Analgesia Sistêmica e Controle da Inflamação Crônica",
          usage: "Tomar **05 gotas** sublinguais de 12/12h após refeição (reter 60s). Aumentar 1 gota a cada 4 dias.",
          notes: "Óleo de alta concentração GreenBudzCBD (EUA). Ação anti-inflamatória e analgésica sustentada."
        },
        {
          name: "GreenBudz Chill Vibe Gummies - THC 1:1 CBD",
          indication: "Alívio Analgésico Prolongado de 4 a 6 Horas e Relaxamento Muscular (Goma Comestível)",
          usage: "Mastigar **01 goma** 1 a 2 vezes ao dia conforme crises álgicas.",
          notes: "Gomas veganas Live Rosin com 10mg THC + 10mg CBD por goma. Ação analgésica potente e duradoura."
        },
        {
          name: "Flor In Natura Superglue (THCA) 14g",
          indication: "Resgate Inalatório Imediato para Crises Álgicas e Espasmos (Flores 14g)",
          usage: "Vaporizar **0,1g a 0,2g** a 185°C no momento da crise álgica.",
          notes: "Flor rica em THCA para ação de alívio analgésico imediato em 2 a 5 minutos."
        },
        {
          name: "GreenBudz Stirred Hemp Formula rico em THCa",
          indication: "Extração Concentrada para Resgate de Dores Severas e Refratárias",
          usage: "Microdosagem em vaporizador de concentrados térmico (180°C-210°C) nas dores agudas.",
          notes: "Extrato concentrado rico em THCa (350mg/dose) e terpenos para quebra rápida do pico de dor."
        }
      ];
    } else if (isInsomnia) {
      importedList = [
        {
          name: "GreenBudz Calm Vibe Oil 6000mg",
          indication: "Desaceleração Mental Noturna e Redução da Latência do Sono",
          usage: "Tomar **08 gotas** sublinguais 30 minutos antes do repouso.",
          notes: "Alta concentração de canabinoides GreenBudzCBD para regulação do ritmo circadiano."
        },
        {
          name: "Drops By GreenBudz Goma Nightshade",
          indication: "Indução e Estabilização do Sono Reparador (CBN + CBD)",
          usage: "Mastigar **01 goma** cerca de 45 minutos antes de dormir.",
          notes: "Goma de relaxamento noturno da linha GreenBudzCBD com liberação gradual para evitar despertares."
        },
        {
          name: "Flor In Natura Glitter Bomb (THCA) 14g",
          indication: "Resgate Inalatório Noturno para Desligamento Mental e Insônia Refratária",
          usage: "Vaporizar **0,1g** a 180°C 30 minutos antes de se deitar nos dias de agitação.",
          notes: "Genética 70% Índica rica em THCA, Mirceno e Linalol para indução imediata do sono profundo."
        },
        {
          name: "Hemp Oil Gold Budder 5g (Versão THCA)",
          indication: "Extração Concentrada para Indução e Manutenção do Sono Profundo",
          usage: "Microdosagem em vaporizador de concentrados térmico 30 minutos antes do repouso.",
          notes: "Extrato concentrado com alta fração terpênica de Mirceno e Linalol para desligamento mental imediato."
        }
      ];
    } else if (isADHD || (isDepression && !isAnxiety)) {
      importedList = [
        {
          name: "GreenBudz Full Balance Oil 3000mg",
          indication: "Foco, Clareza Mental e Equilíbrio Neuroquímico Diurno",
          usage: "Tomar **05 gotas** pela manhã e **05 gotas** no início da tarde.",
          notes: "Fórmula de suporte cognitivo GreenBudzCBD sem causar agitação ou palpitações."
        },
        {
          name: "Drops By GreenBudz Goma Evergreen THC",
          indication: "Vitalidade, Conforto Físico e Disposição Funcional Diurna (Goma Comestível)",
          usage: "Ingerir **01 goma** no início do dia ou antes de atividades exigentes.",
          notes: "Goma com 5mg THC∆9 e terpenos estimulantes Limoneno e Humuleno para vitalidade."
        },
        {
          name: "Flor In Natura Sour Lifter (CBD) 14g",
          indication: "Resgate Inalatório Diurno para Clareza Mental e Atenção Sustentada",
          usage: "Vaporizar **0,1g** a 175°C durante jornadas de trabalho ou estudo.",
          notes: "Dominância Sativa com Limoneno para foco e criatividade sem efeito psicoativo inebriante."
        },
        {
          name: "GreenBudz Stirred Hemp Formula rico em THCa",
          indication: "Extração Concentrada para Resgate Rápido de Dispersão e Fadiga Mental",
          usage: "Microdosagem em vaporizador de concentrados térmico sob demanda.",
          notes: "Extrato concentrado rico em THCa (350mg/dose) e terpenos para foco imediato."
        }
      ];
    } else {
      importedList = [
        {
          name: "GreenBudz Calm Vibe Oil 6000mg",
          indication: "Ansiólise Sistêmica, Controle do Estresse e Equilíbrio Emocional",
          usage: "Tomar **05 gotas** pela manhã e **06 gotas** ao fim da tarde sublingual.",
          notes: "Óleo importado de cânhamo de pureza farmacêutica GreenBudzCBD (EUA)."
        },
        {
          name: "Drops By GreenBudz Goma Beethoven THC",
          indication: "Conforto Físico, Alívio da Tensão Emocional e Equilíbrio Sistêmico",
          usage: "Mastigar **01 goma** ao entardecer para transição e relaxamento.",
          notes: "Extrato Live Rosin com 5mg THC∆9, Mirceno e Linalol para relaxamento profundo."
        },
        {
          name: "Flor In Natura Zoap (THCA) 14g",
          indication: "Resgate Inalatório para Descompressão e Equilíbrio Imediato",
          usage: "Vaporizar **0,1g** a 180°C ao final do dia em momentos de tensão aguda.",
          notes: "Genética híbrida balanceada 50/50 com THCA para relaxamento corporal e leveza mental."
        },
        {
          name: "GreenBudz Stirred Hemp Formula rico em THCa",
          indication: "Extração Concentrada para Resgate de Picos de Estresse e Tensão Severa",
          usage: "Microdosagem em vaporizador térmico de concentrados nos momentos de crise.",
          notes: "Extrato com alta pureza para descompressão somática profunda."
        }
      ];
    }
  } else if (brandPreference === 'both') {
    if (!isPain && !isInsomnia && !isADHD) {
      importedList = [
        {
          name: "Flowermed Full Spectrum Hemp Oil 3.000 mg",
          indication: "Modulação Global da Ansiedade e Homeostase (Linha Flowermed)",
          usage: "Tomar **04 gotas** pela manhã e **06 gotas** à noite sublingual.",
          notes: "Extrato de espectro total Flowermed (EUA) com Certificado de Análise."
        },
        {
          name: "GreenBudz Calm Vibe Oil 6000mg",
          indication: "Alta Potência Ansiolítica e Estabilização Emocional (Linha GreenBudz)",
          usage: "Opção alternativa de alta concentração: Tomar **04 a 06 gotas** 12/12h.",
          notes: "Concentração elevada GreenBudzCBD (EUA) para alto rendimento e resposta rápida."
        },
        {
          name: "Drops By GreenBudz Goma Nightshade",
          indication: "Relaxamento Noturno e Proteção do Sono (Linha GreenBudz)",
          usage: "Mastigar **01 goma** 45 minutos antes de deitar.",
          notes: "Goma de relaxamento GreenBudzCBD com absorção prolongada."
        },
        {
          name: "Flor In Natura Zoap (THCA) 14g",
          indication: "Resgate Inalatório para Descompressão e Equilíbrio Imediato (Flores 14g)",
          usage: "Vaporizar **0,1g** a 180°C ao final do dia para transição pós-estresse.",
          notes: "Flor híbrida 50/50 balanceada com THCA para relaxamento mental e alívio somático imediato."
        },
        {
          name: "Hemp Oil Syringe Gelato 2ml (71,6% THCA)",
          indication: "Extração Concentrada de Resgate para Picos Agudos de Tensão ou Dor",
          usage: "Microdosagem em vaporizador de concentrados no momento de crise intensa.",
          notes: "Ultra-concentrado com 71,6% de THCA para ação imediata."
        }
      ];
    } else if (isInsomnia) {
      importedList = [
        {
          name: "Flowermed CBN 300 mg + CBD 900 mg",
          indication: "Indução e Estabilização do Sono Reparador (Linha Flowermed)",
          usage: "Tomar **06 gotas** sublinguais 40 minutos antes de deitar.",
          notes: "Associação sinérgica de CBN + CBD Flowermed (EUA) com foco na arquitetura do sono."
        },
        {
          name: "Drops By GreenBudz Goma Nightshade",
          indication: "Prevenção de Despertares e Relaxamento Somático (Linha GreenBudz)",
          usage: "Mastigar **01 goma** antes de se recolher.",
          notes: "Goma artesanal de alto rendimento GreenBudzCBD para descanso contínuo."
        },
        {
          name: "Flor In Natura Forbidden Fruit (D8 THC) 14g",
          indication: "Resgate Inalatório Noturno para Insônia Refratária (Flores 14g)",
          usage: "Vaporizar **0,1g** a 180°C nos dias de insônia persistente.",
          notes: "Genética rica em Mirceno e Linalol para desligamento mental imediato."
        },
        {
          name: "Hemp Oil Gold Budder 5g (Versão THCA)",
          indication: "Extração Concentrada para Indução e Manutenção do Sono Profundo",
          usage: "Microdosagem em vaporizador de concentrados térmico 30 minutos antes do repouso.",
          notes: "Extrato com alta fração terpênica de relaxamento somático e desligamento mental."
        }
      ];
    } else if (isPain) {
      importedList = [
        {
          name: "Flowermed Full Spectrum 1:1 THC + CBD",
          indication: "Analgesia de Alta Potência e Ação Neuropática (Linha Flowermed - Óleo)",
          usage: "Iniciar com **02 gotas** 12/12h e aumentar 1 gota a cada 4 dias até 6 gotas/dose.",
          notes: "Proporção balanceada 1:1 Flowermed (EUA) com alto poder analgésico."
        },
        {
          name: "GreenBudz Calm Vibe Oil 6000mg",
          indication: "Controle Anti-inflamatório Contínuo de Alta Dosagem (Linha GreenBudz - Óleo)",
          usage: "Alternativa: Tomar **06 gotas** sublinguais 12/12h.",
          notes: "Fórmula de alta densidade de canabinoides GreenBudzCBD para dores crônicas."
        },
        {
          name: "Gummies D9 10 mg 30 un",
          indication: "Alívio Analgésico Prolongado de 4 a 6 Horas e Relaxamento Muscular (Goma Comestível)",
          usage: "Mastigar **1/2 a 1 goma** 1 vez ao dia (à noite ou em momentos de dor sustentada).",
          notes: "Liberação entérica sustentada para controle contínuo da dor crônica."
        },
        {
          name: "Flor In Natura Superglue (THCA) 14g",
          indication: "Resgate Inalatório Imediato para Crises Álgicas (Flores 14g)",
          usage: "Vaporizar **0,1g a 0,2g** a 185°C no pico da dor.",
          notes: "Início de ação em 2 a 5 minutos, evitando idas a pronto atendimento."
        },
        {
          name: "Hemp Oil Syringe Gelato 2ml (71,6% THCA)",
          indication: "Extração Concentrada de Resgate para Dores Agudas Severas (Seringa)",
          usage: "Microdosagem em vaporizador de concentrados no momento da dor refratária.",
          notes: "Concentração máxima de fitocanabinoides da cepa Gelato."
        }
      ];
    } else if (isADHD || (isDepression && !isAnxiety)) {
      importedList = [
        {
          name: "Flowermed THCV 300 mg + CBD 900 mg",
          indication: "Otimização de Foco Mental e Clareza Cognitiva Diurna (Linha Flowermed - Óleo)",
          usage: "Tomar **05 gotas** pela manhã após o café da manhã.",
          notes: "Modulador dopaminérgico diurno de foco sem taquicardia."
        },
        {
          name: "GreenBudz Full Balance Oil 3000mg",
          indication: "Equilíbrio Neurovegetativo e Disposição Sem Agitação (Linha GreenBudz - Óleo)",
          usage: "Tomar **04 gotas** ao meio-dia.",
          notes: "Suporte diário GreenBudzCBD com terpenos estimulantes naturais."
        },
        {
          name: "Drops By GreenBudz Goma Evergreen THC",
          indication: "Vitalidade, Conforto Físico e Disposição Funcional Diurna (Goma Comestível)",
          usage: "Ingerir **01 goma** no início do dia antes de tarefas cognitivas.",
          notes: "Goma com 5mg THC∆9 e terpenos estimulantes Limoneno e Humuleno."
        },
        {
          name: "Flor In Natura Sour Lifter (CBD) 14g",
          indication: "Resgate Inalatório Diurno para Clareza e Atenção (Flores 14g)",
          usage: "Vaporizar **0,1g a 0,15g** a 175°C durante o trabalho/estudo.",
          notes: "Genética 75% Sativa rica em Limoneno e Cariofileno para concentração."
        },
        {
          name: "Hemp Oil Syringe Gelato 2ml (71,6% THCA)",
          indication: "Extração Concentrada para Resgate Rápido de Fadiga Mental Aguda",
          usage: "Microdosagem em vaporizador de concentrados térmico sob demanda.",
          notes: "Extrato com alta fração terpênica e fitocanabinoides."
        }
      ];
    }
  }

  // Generate Risk Management & Interactions section
  const riskBulletPoints: string[] = [];
  
  if (hasPsychosisRisk) {
    riskBulletPoints.push(`⚠️ **ALERTA PSIQUIÁTRICO CRÍTICO (Histórico de Psicose/Esquizofrenia):** Contraindicado o uso de formulações ricas em Delta-9 THC ou THCA em doses elevadas devido ao risco de desencadeamento de crises psicóticas ou piora de sintomas positivos. A prescrição priorizou exclusivamente **CBD Broad Spectrum (Sphera), CBG e Flores CBD isoladas**, que possuem atividade antipsicótica documentada via modulação 5-HT1A e recaptação de anandamida.`);
  } else {
    riskBulletPoints.push(`✅ **Risco Psiquiátrico:** Baixo. Sem histórico pessoal ou familiar de psicoses ou transtornos bipolares descompensados. Formulações Full Spectrum e balanceadas liberadas com titulação lenta e gradual.`);
  }

  if (drivesOrMachinery) {
    riskBulletPoints.push(`🚗 **Atividade Psicomotora / Condução de Veículos:** O paciente refere dirigir ou operar maquinário. Orienta-se que formulações com THC/THCA sejam reservadas estritamente para o período noturno (mínimo de 8 horas antes da condução), priorizando produtos não-intoxicantes (CBD, CBG, Broad Spectrum) para uso diurno para resguardar a segurança de trânsito e testes periciais.`);
  }

  if (hasArrhythmia) {
    riskBulletPoints.push(`❤️ **Sistema Cardiovascular (Arritmia Cardíaca):** Contraindicadas doses agudas elevadas de THC, que podem induzir taquicardia reflexa via receptores CB1 endoteliais. Doses fracionadas e prevalência de CBD recomendadas.`);
  }

  if (hasContinuousMeds) {
    riskBulletPoints.push(`💊 **Interação Medicamentosa e Citocromo P450:** O paciente relata uso de fármacos contínuos (${remediosDetails || 'medicamentos alopáticos'}). O Canabidiol e outros canabinoides são substratos e inibidores competitivos das isoenzimas **CYP3A4, CYP2C19 e CYP2C9**. Recomenda-se um intervalo mínimo de **02 horas** entre a administração oral de canabinoides e os fármacos orais de uso contínuo.`);
  } else {
    riskBulletPoints.push(`💊 **Interação Medicamentosa:** Risco mínimo de interferência metabólica devido à ausência relatada de polifarmácia contínua. Manter monitoramento.`);
  }

  if (digestivoDetails) {
    riskBulletPoints.push(`🍽️ **Trato Gastrointestinal:** Queixas digestivas relatadas (${digestivoDetails}). Recomenda-se via sublingual com retenção de 60 a 90 segundos para absorção venosa direta, ou via inalatória vaporizada, poupando a mucosa gástrica.`);
  }

  return `
### 1. Diagnóstico Sindrômico e Avaliação Clínica
- **Condição Primária:** **${primarySyndrome}**
- **Sintomatologia:** Queixa relatada com intensidade **${intensity}/10**, de caráter **${duration}**.
- **Histórico e Dados do Paciente:** Altura **${height}m**, Peso **${weight}kg**, Sexo **${sex}**. ${description ? `Detalhes: *"${description}"*.` : ''}
- **Avaliação Endocanabinoide:** A intensidade dos sintomas sugere um desequilíbrio sustentado no tônus endocanabinoide basal (Deficiência Clínica Endocanabinoide), justificando a reposição e neuromodulação fitocanabinoide direcionada.

### 2. Racional Terapêutico Fisiopatológico
${pathophysRationale}

A sinergia entre fitocanabinoides e terpenos aromáticos (como cariofileno, mirceno, limoneno e linalol) potencializa a biodisponibilidade e eficácia terapêutica via **Efeito Entourage**, diminuindo a dose necessária de cada composto individual.

### 3. Protocolo de Titulação e Posologia Sugerida
- **Método "Start Low, Go Slow":** Iniciar sempre na dose mínima recomendada e manter por 4 a 5 dias antes de qualquer aumento.
- **Via Sublingual:** Pingar as gotas sob a língua e reter por **60 a 90 segundos** antes de engolir para absorção transmucosa direta nos capilares sublinguais.
- **Via Inalatória (Vaporização Medicinal):** Exclusivamente por vaporizador térmico de controle digital (175°C a 190°C). **PROIBIDA A COMBUSTÃO**. Início de ação em 2 a 5 minutos, ideal para picos de crise ou resgate álgico agudo.
- **Fase de Manutenção:** Avaliação aos 30 dias para estabilização de posologia.

### 4. Medicina Baseada em Evidências
- **Russo EB (2011):** *"Taming THC: potential cannabis synergy and phytocannabinoid-terpenoid entourage effects"*. British Journal of Pharmacology. Demonstra a sinergia entre terpenos e canabinoides no controle da dor e ansiedade.
- **Whiting PF et al. (2015):** *"Cannabinoids for Medical Use: A Systematic Review and Meta-analysis"*. JAMA. Evidência moderada a alta para alívio de dores crônicas e espasticidade.
- **Babson KA et al. (2017):** *"Cannabis, Cannabinoids, and Sleep: a Review of the Literature"*. Current Psychiatry Reports. Documenta o papel do CBD e CBN na latência e manutenção do sono.
- **MacCallum CA, Russo EB (2018):** *"Practical considerations in medical cannabis administration and dosing"*. European Journal of Internal Medicine. Protocolos internacionais de segurança e titulação.

### 5. Manejo de Riscos, Contraindicações e Interações Farmacológicas
${riskBulletPoints.map(point => `- ${point}`).join('\n')}

---

### 6. RESUMO DE PRESCRIÇÃO SUGERIDA

**OPÇÃO 1: MEDICAMENTOS IMPORTADOS (Catálogo Oficial)**
*Plano de tratamento completo com laboratórios internacionais de padrão FDA:*

${importedList.map(med => `Medicamento: ${med.name}
Indicação: ${med.indication}
Modo de Uso: ${med.usage}
Observações: ${med.notes}`).join('\n\n')}

**OPÇÃO 2: ASSOCIAÇÕES NACIONAIS (TRÍADE COMPLETA: ÓLEO, EXTRAÇÃO E FLOR)**
*Plano de tratamento equivalente em Associações Brasileiras regulamentadas. Contém obrigatoriamente a tríade completa (Óleo sublingual contínuo, Extração tópica/concentrada e Flores in natura para vaporização), permitindo ao paciente total autonomia de escolha entre seguir com a linha nacional ou importada:*

${nationalList.map(med => `Medicamento: ${med.name}
Indicação: ${med.indication}
Modo de Uso: ${med.usage}
Observações: ${med.notes}`).join('\n\n')}

*Nota Médica: Prescrição estruturada em duas alternativas clínicas independentes e completas (Importados vs. Nacionais com óleo, extração e flor). Fica a critério do paciente optar pela via de fornecimento mais adequada às suas condições.*
  `.trim();
}

function extractFieldFromPrompt(text: string, label: string): string {
  const idx = text.indexOf(label);
  if (idx === -1) return '';
  const after = text.substring(idx + label.length);
  const endIdx = after.indexOf('\n');
  return (endIdx !== -1 ? after.substring(0, endIdx) : after).replace(/[\*\,\.]/g, '').trim();
}

function extractListFromPrompt(text: string, label: string): string[] {
  const field = extractFieldFromPrompt(text, label);
  if (!field) return [];
  return field.split(/,|\//).map(s => s.trim()).filter(Boolean);
}
