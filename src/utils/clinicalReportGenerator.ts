/**
 * Clinical Report Intelligence Generator
 * Generates personalized, case-specific medical, agronomic, and psychomotor reports
 * strictly based on the selected patient's individual triage (answers), pathology, symptoms, and medical history.
 */

export interface PatientCaseData {
  patientName?: string;
  birthDate?: string;
  cpf?: string;
  sex?: string;
  height?: string;
  weight?: string;
  age?: string | number;
  objectives?: string[];
  intensity?: string | number;
  duration?: string;
  description?: string;
  diseaseOrigin?: string;
  remedios?: boolean;
  remedios_details?: string;
  doenca_cronica?: boolean;
  doenca_cronica_details?: string;
  tratamento_atual?: boolean;
  tratamento_atual_details?: string;
  cirurgia?: boolean;
  cirurgia_details?: string;
  alergia?: boolean;
  alergia_details?: string;
  digestivo?: boolean;
  digestivo_details?: string;
  dor_cabeca?: boolean;
  dor_cabeca_details?: string;
  cansado?: boolean;
  cannabis?: boolean;
  cannabis_details?: string;
  arritmia?: boolean;
  arritmia_details?: string;
  tristeza?: boolean;
  foco?: boolean;
  memoria?: boolean;
  irritado?: boolean;
  estresse?: boolean;
  panico?: boolean;
  panico_details?: string;
  ansiedade_diag?: boolean;
  ansiedade_diag_details?: string;
  dirige?: boolean;
  dirige_details?: string;
  maquinario?: boolean;
  maquinario_details?: string;
  blitz?: boolean;
  laudo_psicomotor?: boolean;
  preferredTreatmentStatus?: string;
  preferredBrands?: string[];
  preferredBrandNotes?: string;
  adhdTestResult?: any;
  autismTestResult?: any;
  hcPlantCalculator?: any;
  mainSymptoms?: string;
  pathology?: string;
  evolutionNotes?: string;
  answers?: Record<string, any>;
}

export interface PersonalizedReportResult {
  clinicalCondition: string;
  cidPrincipal: string;
  cidsSecundarios: string;
  clinicalSummary: string; // Used for Diagnosis / Page 1 (Quesitos 1, 2, 3)
  evolutionSummary: string; // Used for Page 2 in Evolutivo (Quesitos 4, 5, 6)
  therapeuticRationale: string; // Used for Rationale / Quesito 7
  treatmentPlan: string;
  monitoringText: string;
  agronomic: {
    diagnosis: string;
    dailyDoseMg: number;
    targetPlants: number;
    plantsPerCycle: number;
    seedsNeeded: number;
    text: string;
  };
  psychomotor: {
    text: string;
  };
}

export function generatePersonalizedClinicalReport(
  patientData: PatientCaseData,
  reportType: 'inicial' | 'evolutivo' = 'inicial'
): PersonalizedReportResult {
  const ans = patientData.answers || {};

  const pName = (patientData.patientName || ans.name || 'Paciente').trim();
  const pCpf = (patientData.cpf || ans.cpf || 'Não informado').trim();
  const pSex = patientData.sex || ans.sex || '';
  const pHeight = patientData.height || ans.height || '';
  const pWeight = patientData.weight || ans.weight || '';

  const rawObjectives =
    (Array.isArray(patientData.objectives) && patientData.objectives.length > 0
      ? patientData.objectives
      : Array.isArray(ans.objectives) && ans.objectives.length > 0
      ? ans.objectives
      : ans.objective
      ? [String(ans.objective)]
      : []).filter(Boolean);

  const objectivesArray = rawObjectives.length > 0 ? rawObjectives : ['Avaliação Clínica Canabinoide'];

  const rawIntensity = patientData.intensity ?? ans.intensity;
  const intensity = rawIntensity !== undefined && rawIntensity !== null && String(rawIntensity).trim() !== ''
    ? `${rawIntensity}/10`
    : 'Moderada a Intensa';

  const rawDuration = patientData.duration || ans.duration || '';
  const durationLabel = rawDuration
    ? (rawDuration === 'dias' ? 'alguns dias' : rawDuration === 'semanas' ? 'algumas semanas' : rawDuration === 'meses' ? 'vários meses' : rawDuration === 'anos' ? 'múltiplos anos (quadro crônico)' : rawDuration)
    : 'evolução crônica';

  const rawOrigin = (patientData.diseaseOrigin ?? ans.diseaseOrigin ?? '').trim();
  const rawDesc = (patientData.description ?? ans.description ?? patientData.mainSymptoms ?? ans.mainSymptoms ?? '').trim();
  const evolutionNotes = (patientData.evolutionNotes ?? '').trim();

  const tratamentoAtual = patientData.tratamento_atual ?? ans.tratamento_atual;
  const tratamentoAtualDetails = (patientData.tratamento_atual_details ?? ans.tratamento_atual_details ?? '').trim();
  const remedios = patientData.remedios ?? ans.remedios;
  const remediosDetails = (patientData.remedios_details ?? ans.remedios_details ?? '').trim();
  const doencaCronica = patientData.doenca_cronica ?? ans.doenca_cronica;
  const doencaCronicaDetails = (patientData.doenca_cronica_details ?? ans.doenca_cronica_details ?? '').trim();
  const cirurgia = patientData.cirurgia ?? ans.cirurgia;
  const cirurgiaDetails = (patientData.cirurgia_details ?? ans.cirurgia_details ?? '').trim();
  const alergia = patientData.alergia ?? ans.alergia;
  const alergiaDetails = (patientData.alergia_details ?? ans.alergia_details ?? '').trim();
  const digestivo = patientData.digestivo ?? ans.digestivo;
  const digestivoDetails = (patientData.digestivo_details ?? ans.digestivo_details ?? '').trim();
  const dorCabeca = patientData.dor_cabeca ?? ans.dor_cabeca;
  const dorCabecaDetails = (patientData.dor_cabeca_details ?? ans.dor_cabeca_details ?? '').trim();
  const cansado = patientData.cansado ?? ans.cansado;
  const cannabis = patientData.cannabis ?? ans.cannabis;
  const cannabisDetails = (patientData.cannabis_details ?? ans.cannabis_details ?? '').trim();
  const arritmia = patientData.arritmia ?? ans.arritmia;
  const arritmiaDetails = (patientData.arritmia_details ?? ans.arritmia_details ?? '').trim();

  // Emotional & cognitive triage markers
  const tristeza = patientData.tristeza ?? ans.tristeza;
  const foco = patientData.foco ?? ans.foco;
  const memoria = patientData.memoria ?? ans.memoria;
  const irritado = patientData.irritado ?? ans.irritado;
  const estresse = patientData.estresse ?? ans.estresse;
  const panico = patientData.panico ?? ans.panico;
  const panicoDetails = (patientData.panico_details ?? ans.panico_details ?? '').trim();
  const ansiedadeDiag = patientData.ansiedade_diag ?? ans.ansiedade_diag;
  const ansiedadeDiagDetails = (patientData.ansiedade_diag_details ?? ans.ansiedade_diag_details ?? '').trim();

  // Neuro tests & HC calculator
  const adhdRes = patientData.adhdTestResult || ans.adhdTestResult;
  const autismRes = patientData.autismTestResult || ans.autismTestResult;
  const hcCalc = patientData.hcPlantCalculator || ans.hcPlantCalculator;

  // Brand / Association preferences from triage
  const prefBrands: string[] = Array.isArray(patientData.preferredBrands)
    ? patientData.preferredBrands
    : Array.isArray(ans.preferredBrands)
    ? ans.preferredBrands
    : [];
  const prefNotes = (patientData.preferredBrandNotes ?? ans.preferredBrandNotes ?? '').trim();

  // Combine all patient-provided text to detect exact pathologies and CIDs
  const combinedText = `${objectivesArray.join(' ')} ${rawOrigin} ${rawDesc} ${doencaCronicaDetails} ${tratamentoAtualDetails} ${ansiedadeDiagDetails} ${panicoDetails} ${patientData.pathology || ''}`.toLowerCase();

  const isEpilepsy = /epilep|convuls|crise conv|ausência/i.test(combinedText);
  const isAutism = /autis|tea|espectro aut/i.test(combinedText) || !!(autismRes && autismRes.scorePercent >= 50);
  const isParkinson = /parkinson|tremor|rigidez motor|discinesia/i.test(combinedText);
  const isAlzheimer = /alzheimer|demência|declínio cognitivo/i.test(combinedText);
  const isFibro = /fibromialgia/i.test(combinedText);
  const isLombar = /lombar|lombalgia|coluna|hérnia|ciátic/i.test(combinedText);
  const isArtrite = /artrite|artrose|reumát/i.test(combinedText);
  const isNeuropathy = /neuropat|neuralg/i.test(combinedText);
  const isPain = isFibro || isLombar || isArtrite || isNeuropathy || /dor|álgic|crônic/i.test(combinedText);
  const isInsomnia = /sono|insônia|acordar noturno|despertar precoc/i.test(combinedText);
  const isMigraine = /enxaqueca|cefaleia|dor de cabeça/i.test(combinedText) || !!dorCabeca;
  const isEndometriosis = /endometriose|cólica pélvica|dor pélvica/i.test(combinedText);
  const isADHD = /tdah|déficit de atenção|hiperativid|foco e concentração/i.test(combinedText) || !!(adhdRes && adhdRes.scorePercent >= 50);
  const isDepression = /depress|tristeza profunda|anedonia/i.test(combinedText) || !!tristeza;
  const isAnxiety = /ansiedade|pânico|estresse/i.test(combinedText) || !!ansiedadeDiag || !!panico || !!estresse;

  // Build dynamic CID-10 list strictly matching the patient's triage
  const matchedCids: Array<{ code: string; label: string }> = [];
  const addCid = (code: string, label: string) => {
    if (!matchedCids.some(c => c.code === code)) {
      matchedCids.push({ code, label });
    }
  };

  if (isEpilepsy) addCid('G40.9', 'Epilepsia Não Especificada');
  if (isAutism) addCid('F84.0', 'Transtorno do Espectro Autista');
  if (isParkinson) addCid('G20', 'Doença de Parkinson');
  if (isAlzheimer) addCid('G30.9', 'Doença de Alzheimer');
  if (isFibro) addCid('M79.7', 'Fibromialgia');
  if (isEndometriosis) addCid('N80.9', 'Endometriose');
  if (isLombar) addCid('M54.5', 'Dor Lombar Baixa / Lombalgia');
  if (isArtrite) addCid('M19.9', 'Artrose / Artropatia Crônica');
  if (isNeuropathy) addCid('G62.9', 'Polineuropatia / Dor Neuropática');
  if (isPain && !isFibro && !isLombar && !isEndometriosis) addCid('R52.2', 'Outra Dor Crônica');
  if (isMigraine) addCid('G43.9', 'Enxaqueca / Cefaleia Crônica');
  if (isADHD) addCid('F90.0', 'Distúrbios da Atividade e da Atenção - TDAH');
  if (isAnxiety) addCid('F41.1', 'Transtorno de Ansiedade Generalizada');
  if (panico || /pânico/i.test(combinedText)) addCid('F41.0', 'Transtorno de Pânico');
  if (isDepression) addCid('F32.1', 'Episódio Depressivo');
  if (isInsomnia) addCid('G47.0', 'Distúrbios do Início e da Manutenção do Sono - Insônia');
  if (estresse && matchedCids.length < 2) addCid('F43.2', 'Transtorno de Adaptação e Estresse');

  if (matchedCids.length === 0) {
    addCid('R52.2', 'Quadro Clínico Crônico sob Investigação e Modulação Endocanabinoide');
  }

  const cidPrincipal = `${matchedCids[0].code} (${matchedCids[0].label})`;
  const cidsSecundarios = matchedCids.length > 1
    ? matchedCids.slice(1).map(c => `${c.code} (${c.label})`).join(', ')
    : 'Sem comorbidades secundárias codificadas';

  // Condition title reflecting the exact objectives chosen by the patient in triage
  const conditionName = rawObjectives.length > 0
    ? rawObjectives.join(', ')
    : matchedCids.map(c => c.label).join(' e ');

  // Build exact patient triage clinical history lines
  const triageNarrativeParts: string[] = [];

  if (rawOrigin) {
    triageNarrativeParts.push(`Início e Evolução Relatados na Triagem: ${rawOrigin}`);
  }
  if (rawDesc && rawDesc !== rawOrigin) {
    triageNarrativeParts.push(`Detalhamento Clínico Informado pelo(a) Paciente: ${rawDesc}`);
  }
  if (!rawOrigin && !rawDesc) {
    triageNarrativeParts.push(
      `Paciente buscou avaliação médica especializada referindo queixas principais de ${conditionName}, com intensidade sintomática referida em ${intensity} e tempo de evolução de ${durationLabel}.`
    );
  }

  // Biometric & functional context from triage
  const bioParts: string[] = [];
  if (pSex) bioParts.push(`Sexo: ${pSex}`);
  if (pHeight) bioParts.push(`Altura: ${pHeight}m`);
  if (pWeight) bioParts.push(`Peso: ${pWeight}kg`);
  if (bioParts.length > 0) {
    triageNarrativeParts.push(`Dados Biométricos da Triagem: ${bioParts.join(' | ')}.`);
  }

  // Emotional / cognitive symptoms marked by the patient in triage
  const emotionalSymptoms: string[] = [];
  if (estresse) emotionalSymptoms.push('estresse persistente');
  if (irritado) emotionalSymptoms.push('irritabilidade frequente');
  if (tristeza) emotionalSymptoms.push('humor deprimido / tristeza');
  if (foco) emotionalSymptoms.push('dificuldade de concentração e foco');
  if (memoria) emotionalSymptoms.push('queixas de memória recente');
  if (cansado) emotionalSymptoms.push('fadiga e cansaço diurno');
  if (panico) emotionalSymptoms.push(`crises de pânico${panicoDetails ? ` (${panicoDetails})` : ''}`);
  if (ansiedadeDiag) emotionalSymptoms.push(`diagnóstico prévio de ansiedade/depressão${ansiedadeDiagDetails ? ` (${ansiedadeDiagDetails})` : ''}`);

  if (emotionalSymptoms.length > 0) {
    triageNarrativeParts.push(`Sintomas Associados Mapeados na Triagem: ${emotionalSymptoms.join(', ')}.`);
  }

  // Comorbidities, surgeries, allergies, GI, headaches from triage
  const healthHistoryParts: string[] = [];
  if (doencaCronica) {
    healthHistoryParts.push(`Doenças crônicas relatadas: ${doencaCronicaDetails || 'Sim (informado na triagem)'}`);
  }
  if (cirurgia) {
    healthHistoryParts.push(`Cirurgias prévias: ${cirurgiaDetails || 'Sim'}`);
  }
  if (alergia) {
    healthHistoryParts.push(`Alergias conhecidas: ${alergiaDetails || 'Sim'}`);
  } else if (alergia === false) {
    healthHistoryParts.push('Nega alergias medicamentosas conhecidas');
  }
  if (digestivo) {
    healthHistoryParts.push(`Queixas gastrointestinais: ${digestivoDetails || 'Sim'}`);
  }
  if (dorCabeca) {
    healthHistoryParts.push(`Cefaleia / Enxaqueca associada: ${dorCabecaDetails || 'Sim'}`);
  }
  if (arritmia) {
    healthHistoryParts.push(`Histórico de arritmia cardíaca: ${arritmiaDetails || 'Sim (monitoramento cardiovascular indicado)'}`);
  }

  if (healthHistoryParts.length > 0) {
    triageNarrativeParts.push(`Antecedentes Clínicos Informados na Triagem: ${healthHistoryParts.join('; ')}.`);
  }

  // Neurobehavioral screening results if performed by the patient
  if (adhdRes && adhdRes.scorePercent !== undefined) {
    triageNarrativeParts.push(
      `Rastreio Neurocomportamental TDAH (Escala ASRS-18): ${adhdRes.classification || 'Avaliado'} — Compatibilidade de ${adhdRes.scorePercent}% (${adhdRes.totalPoints || 0}/${adhdRes.maxPoints || 36} pontos).`
    );
  }
  if (autismRes && autismRes.scorePercent !== undefined) {
    triageNarrativeParts.push(
      `Mapeamento Neurocomportamental para TEA / Autismo (${autismRes.targetProfile || 'Adulto'}): ${autismRes.classification || 'Avaliado'} — Compatibilidade de ${autismRes.scorePercent}% (${autismRes.totalPoints || 0}/${autismRes.maxPoints || 36} pontos).`
    );
  }

  // Previous / current treatments and medications strictly from triage
  const reportedMedsList: string[] = [];
  if (remedios && remediosDetails) {
    reportedMedsList.push(remediosDetails);
  } else if (remedios) {
    reportedMedsList.push('uso de medicamentos contínuos informados na triagem');
  }
  if (tratamentoAtual && tratamentoAtualDetails && tratamentoAtualDetails !== remediosDetails) {
    reportedMedsList.push(`tratamento em curso: ${tratamentoAtualDetails}`);
  }

  const conventionalMedsTried = reportedMedsList.length > 0
    ? reportedMedsList.join('; ')
    : 'tratamentos clínicos e medidas farmacológicas convencionais prévias para o controle dos sintomas relatados';

  // Previous cannabis experience or preference from triage
  let cannabisHistoryText = '';
  if (cannabis) {
    cannabisHistoryText = `\nExperiência Prévia com Cannabis Medicinal Relatada pelo(a) Paciente: Sim${cannabisDetails ? ` (${cannabisDetails})` : ''}.`;
  }
  if (prefBrands.length > 0 || prefNotes) {
    cannabisHistoryText += `\nPreferência / Vínculo Informado na Triagem: ${prefBrands.join(', ')}${prefNotes ? ` — Observação do paciente: "${prefNotes}"` : ''}.`;
  }

  // Pathophysiology & SEC Rationale tailored to patient's actual complaints
  const secMechanisms: string[] = [];
  if (isPain) {
    secMechanisms.push('modulação dos receptores CB1 nas vias nociceptivas ascendentes e receptores CB2 periféricos, reduzindo a liberação de neurotransmissores excitatórios e mediadores pró-inflamatórios');
  }
  if (isAnxiety || isDepression || estresse || panico) {
    secMechanisms.push('agonismo parcial dos receptores serotoninérgicos 5-HT1A pelo Canabidiol (CBD) e modulação alostérica GABAérgica, promovendo redução da hiperatividade amigdaliana, controle da ansiedade e estabilização do humor');
  }
  if (isInsomnia) {
    secMechanisms.push('regulação do ciclo sono-vigília e aprofundamento das fases restauradoras do sono, reduzindo a latência para o adormecer e os despertares noturnos');
  }
  if (isEpilepsy || isAutism || isADHD || isParkinson || isAlzheimer) {
    secMechanisms.push('equilíbrio da neurotransmissão excitatória/inibitória (sistema Glutamato/GABA), neuroproteção antioxidante e regulação de canais iônicos TRPV1 e GPR55');
  }
  if (isMigraine) {
    secMechanisms.push('modulação do sistema trigeminovascular e inibição da inflamação neurogênica meníngea');
  }
  if (secMechanisms.length === 0) {
    secMechanisms.push('modulação multimodal dos receptores endocanabinoides CB1 e CB2, promovendo restauração da homeostase fisiológica e alívio sintomático sustentado');
  }

  const secRationaleSEC = secMechanisms.join('; associado a ');

  const refractoryDescription = 'persistência dos sintomas relatados na triagem com impacto direto na qualidade de vida, funcionalidade diária e bem-estar global';
  const sideEffectsDescription = digestivo && digestivoDetails
    ? `limitações de resposta clínica e queixas gastrointestinais associadas (${digestivoDetails})`
    : 'resposta clínica incompleta às medidas convencionais isoladas e necessidade de modulação terapêutica segura e individualizada';

  const cannabinoidBenefits = `controle progressivo das queixas de ${conditionName.toLowerCase()}, melhora da qualidade do sono, estabilidade emocional e recuperação da funcionalidade cotidiana`;
  const interruptionRisks = `reagudização imediata dos sintomas de ${conditionName.toLowerCase()} (intensidade referida na triagem: ${intensity}), perda da estabilidade clínica alcançada e prejuízo direto à rotina laboral, familiar e qualidade de vida`;

  let agronomicDoseMg = 3000;
  if (hcCalc?.dailyDoseMg) {
    agronomicDoseMg = Number(hcCalc.dailyDoseMg) || 3000;
  } else if (isEpilepsy || isAutism || isParkinson) {
    agronomicDoseMg = 5000;
  } else if (isPain || isFibro || isEndometriosis) {
    agronomicDoseMg = 3500;
  } else if (isInsomnia || isAnxiety || isADHD) {
    agronomicDoseMg = 2400;
  }

  const isInicial = reportType === 'inicial';
  const fullTriageNarrative = triageNarrativeParts.join('\n\n');

  // Clinical Summary for Page 1 — strictly grounded in the patient's triage
  const clinicalSummary = isInicial
    ? `Declaro, para os devidos fins clínicos e comprobatórios, que o(a) paciente ${pName}, inscrito(a) no CPF ${pCpf}, passou por avaliação médica neste Centro Integrado de Medicina Canabinoide, atestando-se a indicação e o INÍCIO FORMAL DO TRATAMENTO MÉDICO SUPERVISIONADO com fitocanabinoides (Cannabis sativa L.) para o quadro de ${conditionName}, com intensidade sintomática referida na triagem em ${intensity} e tempo de evolução de ${durationLabel}.

Histórico Clínico e Anamnese Informados pelo(a) Paciente na Triagem:
${fullTriageNarrative}

Tratamentos e Medicações Relatados:
Conforme registrado na triagem clínica, o(a) paciente refere histórico de ${conventionalMedsTried}, mantendo necessidade de otimização terapêutica devido à ${refractoryDescription} (${sideEffectsDescription}).${cannabisHistoryText}${evolutionNotes ? `\n\nObservações Clínicas do Médico:\n${evolutionNotes}` : ''}`
    : `O(A) paciente ${pName}, inscrito(a) no CPF ${pCpf}, encontra-se sob acompanhamento médico neste Centro Integrado de Medicina Canabinoide, apresentando quadro clínico de ${conditionName}, com intensidade sintomática basal referida na triagem em ${intensity} e tempo de evolução de ${durationLabel}.

Histórico da Moléstia Atual (HMA — Dados da Triagem do Paciente):
${fullTriageNarrative}${cannabisHistoryText}${evolutionNotes ? `\n\nNotas de Evolução Clínica:\n${evolutionNotes}` : ''}

Histórico de Tratamentos Prévios e Refratariedade Clínica (Quesitos 1, 2 e 3):
1. Quanto aos tratamentos e medicações relatados na triagem (Quesito 1): O(A) paciente registrou histórico de uso/acompanhamento com: ${conventionalMedsTried}.
2. Quanto à resposta terapêutica prévia (Quesito 2): Observou-se ${refractoryDescription}, justificando a necessidade de suporte com derivados fitocanabinoides.
3. Quanto a limitações e tolerabilidade (Quesito 3): Destaca-se ${sideEffectsDescription}.`;

  // Evolution Summary for Page 2 (Quesitos 4, 5 e 6)
  const evolutionSummary = `Evolução Clínica e Resposta com Canabinoides (Quesitos 4, 5 e 6):
4. Quanto à evolução clínica esperada/observada com canabinoides (Quesito 4): Com a introdução supervisionada da fitoterapia canabinoide (Cannabis sativa L.) direcionada para ${conditionName}, busca-se e observa-se ${cannabinoidBenefits}.

5. Quanto à necessidade de manutenção contínua e acesso (Quesito 5): A continuidade regular da terapia canabinoide fundamenta-se na especificidade dos fitocanabinoides prescritos para o quadro de ${conditionName} (${cidPrincipal}) e na manutenção da estabilidade sintomática sem os efeitos adversos dos esquemas alopáticos tradicionais.

6. Quanto à tolerabilidade clínica (Quesito 6): O(A) paciente apresenta indicação precisa e excelente perfil de tolerabilidade biológica aos derivados canabinoides sob supervisão médica continuada.`;

  // Therapeutic Rationale
  const therapeuticRationale = isInicial
    ? `Raciocínio Fisiopatológico & Indicação Canabinoide (Baseado na Triagem):
A indicação médica para o quadro de ${conditionName} fundamenta-se na modulação do Sistema Endocanabinoide (SEC). O tratamento atua promovendo ${secRationaleSEC}, restaurando a homeostase fisiológica e controlando a sintomatologia relatada pelo(a) paciente na triagem.

Comprovação de Início Terapêutico e Necessidade de Continuidade:
Atesto formalmente a indicação e o início do tratamento supervisionado com fitocanabinoides para ${pName}. O acesso regular aos medicamentos prescritos é indispensável para a estabilização clínica e qualidade de vida do(a) paciente.

Enquadramento Diagnóstico Internacional (CID-10):
CID-10 Principal: ${cidPrincipal} | CIDs Associados: ${cidsSecundarios}`
    : `Raciocínio Fisiopatológico e Fundamentação Farmacológica:
A Cannabis medicinal e seus fitocanabinoides representam recurso farmacoterapêutico eficaz e seguro para o quadro de ${conditionName} apresentado por ${pName}. A fundamentação biológica repousa na modulação do Sistema Endocanabinoide (SEC), promovendo ${secRationaleSEC}.

Indicação de Continuidade e Riscos de Interrupção (Quesito 7):
7. Quanto às consequências de eventual interrupção (Quesito 7): Indico formalmente a continuidade ininterrupta do tratamento com Cannabis medicinal. A descontinuidade abrupta pode acarretar ${interruptionRisks}.

Enquadramento Diagnóstico Internacional (CID-10):
CID-10 Principal: ${cidPrincipal}
CIDs Associados: ${cidsSecundarios}`;

  // Personalized Treatment Plan fallback (when no specific items have been added to the prescription yet)
  const treatmentPlan = `1. ÓLEO FITOCANABINOIDE SUBLINGUAL (${isEpilepsy || isAutism ? '100mg/ml' : '50mg/ml a 60mg/ml'})
   Princípio Ativo: Extrato Fitocanabinoide padronizado conforme prescrição médica anexa
   Apresentação / Via: Solução Oleosa Gotas • Frasco de 30ml • Via Sublingual
   Posologia: Iniciar com 03 gotas de 12/12 horas. Titular gradualmente conforme resposta clínica e orientação médica.
   Finalidade: Controle clínico de ${conditionName.toLowerCase()} e regulação do Sistema Endocanabinoide.`;

  // Monitoring Guidelines
  const monitoringText = `1. Diretrizes de Titulação ("Start Low, Go Slow"): Iniciar em doses baixas e titular gradualmente conforme resposta sintomática e tolerabilidade individual do(a) paciente.
2. Segurança e Farmacovigilância: ${remedios ? `Manter espaçamento mínimo de 2 horas em relação às medicações relatadas na triagem (${remediosDetails || 'uso contínuo'}).` : 'Excelente perfil de segurança e tolerabilidade clínica.'}${arritmia ? ' Monitorar parâmetros cardiovasculares regularmente.' : ''}
3. Retorno Clínico: Retorno médico recomendado em 30 a 60 dias para avaliação da curva de resposta e eventuais ajustes posológicos.`;

  // Agronomic Calculations (GACP / Habeas Corpus standard)
  const annualGramsNum = (agronomicDoseMg * 365) / 1000;
  const dryFlowerKgBase = (annualGramsNum / 0.10) / 1000;
  const dryFlowerMarginKgBase = dryFlowerKgBase * 1.3038;
  const calculatedPlants = hcCalc?.annualPlants
    ? Number(hcCalc.annualPlants)
    : Math.max(24, Math.round((dryFlowerMarginKgBase * 1000) / 150));
  const plantsPerCycle = hcCalc?.plantsPerCycle
    ? Number(hcCalc.plantsPerCycle)
    : Math.round(calculatedPlants / 4);
  const seedsNeeded = Math.round(calculatedPlants * 1.3038);

  const agronomicText = `O presente parecer técnico estabelece o dimensionamento agronômico exato, a dosimetria de fitomassa vegetal e o planejamento operacional para o cultivo pessoal contínuo de Cannabis sativa L., estritamente destinado à extração de derivados artesanais de uso medicinal exclusivo do(a) paciente ${pName} (CPF: ${pCpf}), em atendimento ao tratamento de ${conditionName} (${cidPrincipal}), sob as Boas Práticas Agrícolas e de Coleta (GACP/OMS) e a prescrição médica.`;

  const psychomotorText = `Declaro, para os devidos fins de direito, que o(a) paciente <strong>${pName}</strong>, inscrito(a) no CPF <strong>${pCpf}</strong>, encontra-se em acompanhamento médico regular neste Centro Integrado de Medicina Canabinoide em tratamento continuado para <strong>${conditionName} (${cidPrincipal})</strong>.

O(a) paciente faz uso terapêutico de produtos e derivados de Cannabis sativa L., estritamente conforme prescrição médica, sob supervisão e com acompanhamento clínico contínuo.

Atesto, baseado em avaliação clínica realizada durante a consulta, que o uso das medicações prescritas, nas doses terapêuticas estipuladas, <strong>NÃO RESULTA</strong> em alteração da capacidade psicomotora, prejuízo cognitivo, ou comprometimento dos reflexos e estado de alerta do(a) paciente.

O tratamento prescrito não interfere em sua capacidade de operar máquinas, conduzir veículos automotores${patientData.dirige || ans.dirige ? ` (${patientData.dirige_details || ans.dirige_details || 'condução habitual declarada na triagem'})` : ''} ou exercer atividades laborais que exijam atenção e precisão, não configurando infração à legislação de trânsito relacionada ao comprometimento psicomotor ("Lei Seca" ou "Lei do Drogômetro" - Art. 165 do CTB).

Ressalto que os fitocanabinoides têm finalidade estritamente terapêutica, sem efeito recreativo entorpecente nas doses individualmente tituladas, restituindo a aptidão funcional e a qualidade de vida do(a) paciente.`;

  return {
    clinicalCondition: conditionName,
    cidPrincipal,
    cidsSecundarios,
    clinicalSummary,
    evolutionSummary,
    therapeuticRationale,
    treatmentPlan,
    monitoringText,
    agronomic: {
      diagnosis: `${conditionName} (${cidPrincipal}${matchedCids.length > 1 ? ` / ${cidsSecundarios}` : ''})`,
      dailyDoseMg: agronomicDoseMg,
      targetPlants: calculatedPlants,
      plantsPerCycle,
      seedsNeeded,
      text: agronomicText
    },
    psychomotor: {
      text: psychomotorText
    }
  };
}
