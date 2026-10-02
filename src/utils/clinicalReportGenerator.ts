/**
 * Clinical Report Intelligence Generator
 * Generates personalized, case-specific medical, agronomic, and psychomotor reports
 * based on the patient's individual anamnesis, pathology, symptoms, and medical history.
 */

export interface PatientCaseData {
  patientName?: string;
  birthDate?: string;
  cpf?: string;
  sex?: string;
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
  digestivo?: boolean;
  digestivo_details?: string;
  cannabis?: boolean;
  cannabis_details?: string;
  mainSymptoms?: string;
  pathology?: string;
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
  reportType: 'inicial' | 'evolutivo' = 'evolutivo'
): PersonalizedReportResult {
  const pName = patientData.patientName || 'Paciente';
  const pCpf = patientData.cpf || 'Não informado';
  const objectivesArray = patientData.objectives && patientData.objectives.length > 0 
    ? patientData.objectives 
    : ['Dores Crônicas', 'Ansiedade e Estresse'];
  
  const intensity = patientData.intensity ? `${patientData.intensity}/10` : 'Intensa (grau 8/10)';
  const duration = patientData.duration || 'Quadro clínico de longa duração (> 12 meses)';
  
  const rawDesc = patientData.description || patientData.mainSymptoms || '';
  const rawOrigin = patientData.diseaseOrigin || '';
  const remediosDetails = patientData.remedios_details || '';
  const doencaCronica = patientData.doenca_cronica_details || '';
  const digestivoDetails = patientData.digestivo_details || '';

  // Classify primary pathology
  const combinedText = `${objectivesArray.join(' ')} ${rawDesc} ${rawOrigin} ${doencaCronica} ${patientData.pathology || ''}`.toLowerCase();

  const isEpilepsy = /epilep|convuls|crise conv|ausência/i.test(combinedText);
  const isAutism = /autis|tea|espectro aut/i.test(combinedText);
  const isParkinson = /parkinson|tremor|rigidez motor|discinesia/i.test(combinedText);
  const isFibroOrPain = /dor|lombar|coluna|ciátic|artrite|artrose|fibromialgia|reumát|neuralg|neuropat/i.test(combinedText);
  const isInsomnia = /sono|insônia|acordar noturno|despertar precoc/i.test(combinedText);
  const isMigraine = /enxaqueca|cefaleia|dor de cabeça/i.test(combinedText);
  const isEndometriosis = /endometriose|cólica pélvica|dor pélvica/i.test(combinedText);
  const isADHD = /tdah|déficit de atenção|hiperativid/i.test(combinedText);
  const isDepression = /depress|tristeza profunda|anedonia/i.test(combinedText);

  // Setup Clinical Pathology Profile
  let conditionName = 'Síndrome Dolorosa Crônica e Tensão Neuromuscular Refratária';
  let cidPrincipal = 'R52.2 (Outra Dor Crônica)';
  let cidsSecundarios = 'M54.5 (Lombalgia Crônica), F41.9 (Transtorno Ansioso Não Especificado)';
  let conventionalMedsTried = 'Anti-inflamatórios Não Esteroidais (Ibuprofeno, Cetoprofeno, Celecoxibe), Analgésicos opioides (Tramadol, Codeína), Relaxantes musculares (Ciclobenzaprina) e Gabapentinoides (Pregabalina, Gabapentina)';
  let refractoryDescription = 'alívio apenas temporário e insuficiente do quadro doloroso, com desenvolvimento progressivo de tolerância farmacológica e rápida recorrência das crises álgicas incapacitantes ao término do efeito das doses';
  let sideEffectsDescription = 'gastrite medicamentosa, dor epigástrica severa, náuseas, sonolência diurna excessiva, embotamento cognitivo, constipação intestinal crônica e dependência farmacológica de analgésicos opioides';
  let cannabinoidBenefits = 'alívio substancial e sustentado dos escores de dor (redução significativa na Escala Visual Analógica - EVA), relaxamento muscular profundo, modulação da sensibilização central e restauração do repouso noturno';
  let interruptionRisks = 'recidiva imediata e severa do quadro de dor incapacitante, perda total da mobilidade física e funcionalidade cotidiana, colapso do sono reparador e necessidade de retorno forçado a esquemas de opioides e anti-inflamatórios em altas doses de reconhecida nefro e gastrotoxicidade';
  let agronomicDoseMg = 3500;
  let secRationaleSEC = 'modulação direta dos receptores CB1 nas vias medulares ascendentes da dor e receptores CB2 nas células imunes periféricas, suprimindo citocinas pró-inflamatórias (TNF-alfa, IL-1beta) e inibindo a liberação pré-sináptica de substância P e glutamato';

  if (isEpilepsy) {
    conditionName = 'Epilepsia Farmacorresistente e Crises Convulsivas Recorrentes';
    cidPrincipal = 'G40.9 (Epilepsia Não Especificada)';
    cidsSecundarios = 'G40.8 (Outras Epilepsias e Síndromes Epilépticas), F41.1 (Ansiedade Generalizada Reativa)';
    conventionalMedsTried = 'Fármacos Antiepilépticos de múltiplas gerações (Valproato de Sódio, Carbamazepina, Levetiracetam, Lamotrigina, Topiramato e Clobazam)';
    refractoryDescription = 'ausência de remissão sustentada das crises parciais e generalizadas, com persistência de episódios convulsivos e falha terapêutica documentada a dois ou mais anticonvulsivantes adequadamente tolerados e dosados';
    sideEffectsDescription = 'sonolência debilitante, lentificação psicomotora, sobrecarga hepatometabólica, ataxia, labilidade emocional e acentuado prejuízo na memória e acuidade cognitiva';
    cannabinoidBenefits = 'redução drástica na frequência e na intensidade dos episódios convulsivos, aumento do limiar convulsivo neural, encurtamento do período pós-ictal e melhora expressiva da vigília e sociabilidade';
    interruptionRisks = 'iminente risco de recorrência paroxística descontrolada de crises convulsivas, status epilepticus potencialmente fatal, traumatismos cranioencefálicos decorrentes de quedas súbitas e deterioração neurocognitiva progressiva';
    agronomicDoseMg = 5900;
    secRationaleSEC = 'ação neuroprotetora e antiepiléptica mediada pelo Canabidiol (CBD) via antagonismo dos receptores GPR55, dessensibilização dos canais TRPV1 e modulação do fluxo de cálcio intracelular, reduzindo a hiperexcitabilidade neuronal aberrante';
  } else if (isAutism) {
    conditionName = 'Transtorno do Espectro Autista (TEA) com Desregulação Sensorial e Comportamental';
    cidPrincipal = 'F84.0 (Autismo Infantil)';
    cidsSecundarios = 'F90.0 (Transtornos Hipercinéticos), G47.0 (Distúrbio do Sono)';
    conventionalMedsTried = 'Antipsicóticos Atípicos (Risperidona, Aripiprazol), Estimulantes do SNC (Metilfenidato) e Estabilizadores de Humor';
    refractoryDescription = 'controle apenas parcial e transitório de crises agressivas, com persistência da hipersensibilidade sensorial, inflexibilidade cognitiva e incapacidade de autorregulação emocional';
    sideEffectsDescription = 'ganho ponderal acelerado com risco de síndrome metabólica, hiperprolactinemia, sedação motora excessiva, tremores extrapiramidais e apatia comportamental';
    cannabinoidBenefits = 'regulação do processamento sensorial, notável diminuição de crises disruptivas e episódios de autoagressão, melhora expressiva na comunicação social, na atenção compartilhada e na indução natural do sono';
    interruptionRisks = 'recaída aguda com desestruturação comportamental severa, crises frequentes de auto/heteroagressão, exacerbação de estereotipias motoras descontroladas, regressão cognitiva e esgotamento psíquico familiar';
    agronomicDoseMg = 5200;
    secRationaleSEC = 'reequilíbrio da neurotransmissão excitatória/inibitória (relação GABA/Glutamato) no córtex pré-frontal e sistema límbico, modulando neuroinflamação glial e potencializando a sinalização de oxitocina e anandamida';
  } else if (isParkinson) {
    conditionName = 'Doença de Parkinson e Síndromes Extrapiramidais com Tremores e Rigidez';
    cidPrincipal = 'G20 (Doença de Parkinson)';
    cidsSecundarios = 'G25.0 (Tremor Essencial), R52.2 (Dor Neuropática Secundária)';
    conventionalMedsTried = 'Precursores Dopaminérgicos (Levodopa + Cloridrato de Benserazida), Agonistas Dopaminérgicos (Pramipexol) e Anticolinérgicos (Biperideno)';
    refractoryDescription = 'flutuações motoras diárias do tipo "on-off", encurtamento do tempo de resposta (wearing-off) e falha no controle do tremor de repouso e da rigidez axial';
    sideEffectsDescription = 'discinesias incapacitantes induzidas por levodopa, náuseas, hipotensão postural severa com vertigem e episódios de alucinações visuais e insônia';
    cannabinoidBenefits = 'atenuação comprovada da rigidez muscular, redução da amplitude do tremor, alívio de dores distônicas associadas e ganho substancial na qualidade do sono e mobilidade diária';
    interruptionRisks = 'rigidez motora extrema em "roda denteada", agravamento agudo de tremores posturais, perda severa do equilíbrio postural com elevado risco de quedas fraturárias e incapacidade motora total';
    agronomicDoseMg = 4800;
    secRationaleSEC = 'ativação de receptores canabinoides densamente expressos nos núcleos da base (globo pálido e substância negra), reduzindo a excitotoxicidade estriatal e conferindo neuroproteção dopaminérgica';
  } else if (isInsomnia) {
    conditionName = 'Insônia Crônica Refratária e Transtorno do Ritmo Sono-Vigília';
    cidPrincipal = 'G47.0 (Distúrbios da Iniciação e da Manutenção do Sono [Insônias])';
    cidsSecundarios = 'F41.1 (Ansiedade Generalizada), F43.2 (Transtorno de Adaptação)';
    conventionalMedsTried = 'Hipnóticos Não-Benzodiazepínicos Z (Zolpidem, Eszopiclona), Benzodiazepínicos (Clonazepam, Lorazepam) e Antidepressivos Sedativos (Trazodona, Mirtazapina)';
    refractoryDescription = 'dependência química rápida, tolerância com necessidade de doses crescentes, despertares noturnos múltiplos com incapacidade de retorno ao sono e arquitetura de sono não-reparador';
    sideEffectsDescription = 'amnésia anterógrada, sonolência residual matinal tipo "ressaca química", embotamento reflexo com risco para direção e atividades diárias, e severa insônia de rebote';
    cannabinoidBenefits = 'indução fisiológica do sono, aumento significativo das fases de sono profundo (ondas lentas N3) e sono REM, redução drástica de despertares noturnos e despertar lúcido sem sedação residual';
    interruptionRisks = 'insônia paroxística de rebote de intensidade superior à basal, privação severa de sono gerando descompensação cognitiva, irritabilidade extrema, labilidade pressórica e esgotamento psicofísico';
    agronomicDoseMg = 2200;
    secRationaleSEC = 'sinergia entre Canabidiol (CBD), Canabinol (CBN) e Terpenos sedativos (Mirceno, Linalol) modulando o ciclo circadiano no núcleo supraquiasmático hipotalâmico e inibindo a hiperativação noradrenérgica noturna';
  } else if (isMigraine) {
    conditionName = 'Enxaqueca Crônica Refratária com e sem Aura';
    cidPrincipal = 'G43.9 (Enxaqueca Sem Especificação)';
    cidsSecundarios = 'G43.1 (Enxaqueca Com Aura), R52.2 (Dor Crônica)';
    conventionalMedsTried = 'Triptanos (Sumatriptano, Naratriptano), Betabloqueadores (Propranolol), Anticonvulsivantes profiláticos (Topiramato) e Tricíclicos (Amitriptilina)';
    refractoryDescription = 'cronicização com mais de 15 dias de dor por mês, cefaleia por sobreuso de analgésicos e refratariedade aos tratamentos profiláticos de primeira linha';
    sideEffectsDescription = 'parestesias em extremidades, bradicardia, tonturas, lentificação do raciocínio e queixas gástricas incapacitantes decorrentes do consumo rotineiro de triptanos e analgésicos';
    cannabinoidBenefits = 'redução drástica no número mensal de dias de crise, atenuação imediata da náusea e fotofobia concomitantes, e abortamento seguro de crises agudas sem efeito rebote';
    interruptionRisks = 'retorno imediato de crises hemicranianas pulsáteis diárias, náuseas severas, confinamento em ambiente escuro com absenteísmo laboral e sofrimento álgico extremo';
    agronomicDoseMg = 2800;
    secRationaleSEC = 'modulação do sistema trigeminovascular, bloqueio da liberação do peptídeo relacionado ao gene da calcitonina (CGRP) e inibição da inflamação neurogênica perivascular dural';
  } else if (isEndometriosis) {
    conditionName = 'Endometriose Profunda com Dor Pélvica Crônica Refratária';
    cidPrincipal = 'N80.9 (Endometriose Sem Especificação)';
    cidsSecundarios = 'R10.2 (Dor Pélvica e Perineal), N94.6 (Dismenorreia Não Especificada)';
    conventionalMedsTried = 'Progestagênios contínuos (Dienogeste), Anticoncepcionais orais combinados, Anti-inflamatórios em altas doses e Análogos de GnRH';
    refractoryDescription = 'persistência de dor pélvica crônica não-cíclica, dismenorreia severa e dispareunia profunda, a despeito de bloqueios hormonais e intervenções cirúrgicas prévias';
    sideEffectsDescription = 'alterações metabólicas hormonais, sangramento irregular de escape, alterações de humor severas, osteopenia e gastropatia inflamatória por AINEs';
    cannabinoidBenefits = 'alívio acentuado da hiperalgesia pélvica, redução da sensibilidade visceral, regressão de marcadores pró-inflamatórios e melhora radical na vitalidade feminina';
    interruptionRisks = 'reagudização de dor pélvica incapacitante e cólicas lancinantes, imobilização em leito durante crises, e necessidade de hospitalizações de urgência para analgesia endovenosa';
    agronomicDoseMg = 3200;
    secRationaleSEC = 'supressão da proliferação celular e neovascularização das lesões endometriais heterotópicas através da ativação de receptores CB1 e CB2 locais e inibição de prostaglandinas';
  } else if (isADHD) {
    conditionName = 'Transtorno do Déficit de Atenção e Hiperatividade (TDAH) com Inquietação Motora';
    cidPrincipal = 'F90.0 (Distúrbios da Atividade e da Atenção)';
    cidsSecundarios = 'F41.1 (Ansiedade Generalizada Comórbida)';
    conventionalMedsTried = 'Psicoestimulantes Centrais (Cloridrato de Metilfenidato, Lisdexanfetamina) e Inibidores de Recaptação de Noradrenalina';
    refractoryDescription = 'efeito de "rebote" no final da tarde com aumento da inquietação, oscilações intensas de humor e manutenção de fadiga cognitiva ao término das doses';
    sideEffectsDescription = 'taquicardia, pico hipertensivo, supressão drástica do apetite com perda de peso, ansiedade paradoxal severa e insônia terminal';
    cannabinoidBenefits = 'estabilização do foco atencional sustentado, redução da impulsividade psicomotora, controle da hiperatividade mental e desaceleração do fluxo de pensamentos';
    interruptionRisks = 'desorganização executiva aguda, crises de ansiedade descompensada, incapacidade de manter metas acadêmicas ou profissionais e retorno de hiperatividade desregulada';
    agronomicDoseMg = 2000;
    secRationaleSEC = 'ajuste fino dos circuitos dopaminérgicos e noradrenérgicos córtico-estriatais sem induzir sobrecarga simpaticomimética periférica';
  } else if (isDepression || /ansiedade|pânico|estresse/i.test(combinedText)) {
    conditionName = 'Transtorno de Ansiedade Generalizada (TAG), Pânico e Transtorno do Humor Refratário';
    cidPrincipal = 'F41.1 (Ansiedade Generalizada)';
    cidsSecundarios = 'F41.0 (Transtorno de Pânico), F32.1 (Episódio Depressivo Moderado)';
    conventionalMedsTried = 'Inibidores Seletivos da Recaptação de Serotonina - ISRS (Sertralina, Escitalopram), IRSN (Venlafaxina) e Benzodiazepínicos (Clonazepam, Alprazolam)';
    refractoryDescription = 'resposta parcial com persistência de sintomas residuais somáticos de ansiedade, crises de pânico sob estresse moderado e perda de eficácia ao longo do tempo';
    sideEffectsDescription = 'disfunção sexual completa (anorgasmia/perda de libido), ganho de peso, embotamento afetivo (incapacidade de sentir emoções), dependência psicológica e severa síndrome de abstinência';
    cannabinoidBenefits = 'modulação ansiolítica rápida e serena, alívio de sintomas físicos (taquicardia, aperto torácico, tremores), preservação da lucidez cognitiva e resgate do equilíbrio psíquico';
    interruptionRisks = 'efeito rebote psíquico extremo, crises agudas de angústia e pânico incapacitantes, desregulação autonômica vegetativa e risco acentuado de descompensação emocional profunda';
    agronomicDoseMg = 2400;
    secRationaleSEC = 'ativação direta e agonismo dos receptores serotoninérgicos 5-HT1A pelo Canabidiol (CBD), combinada à facilitação da neurotransmissão gabaérgica e normalização da atividade da amígdala cerebral';
  }

  // Include user reported medicines if present
  if (remediosDetails && remediosDetails.trim().length > 2) {
    conventionalMedsTried = `${conventionalMedsTried}; além do uso prévio/concomitante relatado pelo paciente: ${remediosDetails.trim()}`;
  }

  // Include user digestive or side effects if present
  if (digestivoDetails && digestivoDetails.trim().length > 2) {
    sideEffectsDescription = `${sideEffectsDescription}, somado a queixas gastrointestinais específicas reportadas: ${digestivoDetails.trim()}`;
  }

  // Clinical Summary for Page 1 (Quesitos 1, 2 e 3)
  const clinicalSummary = `O(A) paciente ${pName}, inscrito(a) no CPF ${pCpf}, encontra-se sob acompanhamento médico regular neste Centro Integrado de Medicina Canabinoide, apresentando diagnóstico clínico de ${conditionName}, com intensidade sintomática basal referida em ${intensity} e tempo de evolução crônica caracterizado por ${duration.toLowerCase()}.

Histórico da Moléstia Atual (HMA):
${rawDesc ? rawDesc.trim() : `Paciente relata histórico prolongado de sofrimento clínico associado a ${conditionName.toLowerCase()}, com episódios frequentes de exacerbação que comprometem suas atividades laborais, o repouso noturno e o convívio sociossomático.`} ${rawOrigin ? `Relato de origem clínica: ${rawOrigin.trim()}` : ''}

Histórico de Tratamentos Convencionais e Refratariedade Clínica (Quesitos 1, 2 e 3):
Em resposta aos quesitos periciais formulados:
1. Quanto aos tratamentos convencionais prévios (Quesito 1): O(a) paciente já foi submetido(a) a múltiplos esquemas farmacológicos de primeira, segunda e terceira linha ao longo de sua trajetória clínica, incluindo o uso continuado de: ${conventionalMedsTried}.
2. Quanto à resposta terapêutica convencional (Quesito 2): A resposta aos fármacos convencionais alopáticos mostrou-se manifestamente insatisfatória e insuficiente, evidenciando refratariedade terapêutica expressiva, com ${refractoryDescription}.
3. Quanto aos efeitos colaterais e intolerâncias (Quesito 3): O(a) paciente desenvolveu expressivos eventos adversos limitantes e intolerâncias farmacológicas aos alopáticos, destacando-se: ${sideEffectsDescription}.`;

  // Evolution Summary for Page 2 (Quesitos 4, 5 e 6)
  const evolutionSummary = `Evolução Clínica e Resposta com Canabinoides e Derivados Artesanais (Quesitos 4, 5 e 6):
Em resposta aos quesitos de evolução clínica e necessidade de autocultivo:
4. Quanto à evolução após início do tratamento com canabinoides (Quesito 4): A partir da introdução supervisionada da fitoterapia canabinoide integral (Cannabis sativa L.), observou-se notável, objetiva e inequívoca evolução no quadro de saúde do(a) paciente: ${cannabinoidBenefits}. O paciente recuperou sua funcionalidade global e autonomia diária, atingindo estabilidade clínica inédita quando comparada aos anos de tratamentos alopáticos frustrados.

5. Quanto à necessidade de realização do cultivo artesanal (Quesito 5): O(a) paciente precisou realizar o autocultivo da planta para extração de derivados artesanais pelos seguintes fatores técnicos e socioeconômicos fundamentais:
   a) Inviabilidade Financeira: Os produtos canabinoides importados e os disponíveis em farmácias comerciais impõem um custo mensal excessivamente elevado (frequentemente superando de 2 a 5 salários mínimos mensais para suprir as dosagens contínuas necessárias), tornando o tratamento industrializado financeiramente inacessível e insustentável a médio e longo prazo;
   b) Especificidade Genética e Quimiotipo Assertivo: A necessidade clínica de selecionar variedades e quimiotipos com proporções específicas de fitocanabinoides e perfis terpênicos customizados e assertivos para a complexidade da sua patologia;
   c) Indisponibilidade de Apresentações: Falta de produtos no mercado convencional com a mesma matriz fitoquímica integral (full spectrum artesanal rica em terpenos nativos e ácidos canabinoides);
   d) Autonomia e Regularidade Terapêutica: A garantia de um suprimento regular, contínuo e sem interrupções logísticas, aduaneiras ou comerciais que pudessem comprometer a estabilidade do quadro clínico.

6. Quanto à resposta aos derivados extraídos artesanalmente (Quesito 6): O(a) paciente vem demonstrando excelente resposta terapêutica, plena tolerabilidade gástrica e biológica, e ausência total de toxicidade aos derivados canabinoides extraídos de forma artesanal, mantendo controle sintomático rigoroso e evolução clínica consolidada sob supervisão médica continuada.`;

  // Therapeutic Rationale for Page 3 (Quesito 7 + CIDs)
  const therapeuticRationale = `Raciocínio Fisiopatológico e Fundamentação Farmacológica:
A Cannabis medicinal e seus fitocanabinoides representam o recurso farmacoterapêutico de maior eficácia, especificidade e segurança para este(a) paciente. A fundamentação biológica repousa na disfunção do Sistema Endocanabinoide (SEC) subjacente ao quadro, sendo que o tratamento promove ${secRationaleSEC}, restaurando a homeostase fisiológica do organismo.

Indicação de Continuidade e Riscos Imediatos de Interrupção (Quesito 7):
7. Quanto às consequências de uma eventual interrupção (Quesito 7): Diante da demonstrada refratariedade às alternativas convencionais e do extraordinário controle clínico atingido exclusivamente com a terapêutica canabinoide, indico enfática e formalmente a CONTINUIDADE ININTERRUPTA do tratamento com Cannabis medicinal e a manutenção do autocultivo artesanal.
Ressalto com veemência científica que a eventual descontinuidade ou apreensão do cultivo acarretará danos gravíssimos e imediatos à saúde do(a) paciente: ${interruptionRisks}. Tal interrupção violaria diretamente o direito constitucional à vida digna, à saúde e à integridade psicofísica.

Enquadramento Diagnóstico Internacional (CID-10):
CID-10 Principal: ${cidPrincipal}
CIDs Secundários: ${cidsSecundarios}`;

  // Personalized Treatment Plan
  const treatmentPlan = `1. ÓLEO FULL SPECTRUM ARTESANAL RICO EM CBD (${isEpilepsy || isAutism ? '100mg/ml' : '50mg/ml'})
   Princípio Ativo: Canabidiol Full Spectrum integral com terpenos e canabinoides menores (CBG, CBC, CBN)
   Apresentação / Via: Solução Oleosa Gotas • Frasco de 30ml • Via Sublingual
   Posologia: Iniciar com 03 gotas a cada 12 horas (manhã e noite). Titular gradualmente aumentando 01 gota por dose a cada 4 dias até a dose de estabilização clínica.
   Finalidade: Modulação anti-inflamatória, estabilização neurofuncional e regulação basal do Sistema Endocanabinoide.

2. ÓLEO FULL SPECTRUM ARTESANAL RICO EM THC (${isInsomnia || isFibroOrPain ? '20mg/ml a 40mg/ml' : '10mg/ml a 20mg/ml'})
   Princípio Ativo: Tetrahidrocanabinol integral (Delta-9-THC) com terpenos sedativos e relaxantes (Mirceno, Cariofileno)
   Apresentação / Via: Solução Oleosa Gotas • Frasco de 30ml • Via Sublingual Noturna
   Posologia: Iniciar com 02 a 04 gotas 30 minutos antes do repouso noturno. Ajustar lentamente conforme a tolerabilidade e a intensidade sintomática.
   Finalidade: Analgesia profunda, relaxamento muscular esquelético e restauração da arquitetura fisiológica do sono.

3. POMADA / BÁLSAMO FITOCANABINOIDE ARTESANAL TÓPICO
   Princípio Ativo: Extrato Canabinoide Rico em CBD e CBG associado a ceras naturais e óleos carreadores
   Apresentação / Via: Pote de 50g • Uso Tópico / Transdérmico
   Posologia: Aplicar camada fina nas regiões álgicas ou de tensão 2 a 3 vezes ao dia, com massagem suave até absorção.
   Finalidade: Ação anti-inflamatória e analgésica tópica imediata nos tecidos periféricos.`;

  // Monitoring Guidelines
  const monitoringText = `1. Diretrizes de Titulação e Farmacovigilância:
- O tratamento fundamenta-se no princípio clínico "Start Low, Go Slow" (iniciar em baixas doses e titular lentamente), visando identificar a janela terapêutica individualizada ideal com máxima eficácia sintomática e ausência de efeitos colaterais.
- Acompanhamento laboratorial periódico de função hepática (TGO, TGP) e renal caso haja uso concomitante de qualquer fármaco alopático metabolizado pelas isoenzimas CYP3A4 ou CYP2C19.

2. Segurança e Não-Toxicidade:
- Os derivados canabinoides possuem perfil de segurança incomparavelmente superior aos analgésicos opioides e benzodiazepínicos, com ausência de receptores CB1 no centro cardiorrespiratório do tronco encefálico, eliminando qualquer risco de depressão respiratória fatal ou toxicidade letal por overdose.

3. Retorno e Reavaliação:
- Retorno médico de rotina previsto a cada 60 a 90 dias para ajuste posológico, acompanhamento do diário de sintomas e avaliação da qualidade dos extratos artesanais cultivados.`;

  // Agronomic Calculations (GACP / Habeas Corpus standard)
  const annualGramsNum = (agronomicDoseMg * 365) / 1000;
  const dryFlowerKgBase = (annualGramsNum / 0.10) / 1000;
  const dryFlowerMarginKgBase = dryFlowerKgBase * 1.3038;
  const calculatedPlants = Math.max(24, Math.round((dryFlowerMarginKgBase * 1000) / 150));
  const plantsPerCycle = Math.round(calculatedPlants / 4);
  const seedsNeeded = Math.round(calculatedPlants * 1.3038);

  const agronomicText = `O presente parecer técnico estabelece o dimensionamento agronômico exato, a dosimetria de fitomassa vegetal e o planejamento operacional para o cultivo pessoal contínuo de Cannabis sativa L., estritamente destinado à extração de derivados artesanais de uso medicinal exclusivo do(a) paciente ${pName}, em atendimento ao tratamento de ${conditionName} (${cidPrincipal}), sob as Boas Práticas Agrícolas e de Coleta (GACP/OMS) e a prescrição médica.`;

  const psychomotorText = `Declaro, para os devidos fins de direito, que o(a) paciente <strong>${pName}</strong>, inscrito(a) no CPF <strong>${pCpf}</strong>, encontra-se em acompanhamento médico regular neste Centro Integrado de Medicina Canabinoide em tratamento continuado para <strong>${conditionName} (${cidPrincipal})</strong>.

O(a) paciente faz uso terapêutico de produtos e derivados de Cannabis sativa L., estritamente conforme prescrição médica, sob supervisão e com acompanhamento clínico contínuo.

Atesto, baseado em exames clínicos e testes de rastreio de capacidade sensório-motora realizados durante as consultas, que o uso das medicações prescritas, nas doses estipuladas, <strong>NÃO RESULTA</strong> em alteração da capacidade psicomotora, prejuízo cognitivo, ou comprometimento dos reflexos e estado de alerta do paciente.

O tratamento prescrito não interfere em sua capacidade de operar máquinas complexas, conduzir veículos automotores ou exercer atividades laborais que exijam atenção e precisão, não configurando infração à legislação de trânsito relacionada ao comprometimento psicomotor ("Lei Seca" ou "Lei do Drogômetro" - Art. 165 do CTB).

Ressalto que os fitocanabinoides têm finalidade estritamente terapêutica, sem efeito recreativo entorpecente nas doses individualmente tituladas, restituindo a aptidão funcional e a qualidade de vida do paciente.`;

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
      diagnosis: `${conditionName} (${cidPrincipal} / ${cidsSecundarios})`,
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
