const fs = require('fs');

const path = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(path, 'utf8');

// Find the start of the old interface and cut it off
const startIdx = code.indexOf('export interface ClinicalDetails');
if (startIdx !== -1) {
  code = code.substring(0, startIdx);
}

const newContent = `
export interface TitrationProtocol {
  start: string;
  titration: string;
  range: string;
  thc?: string;
  note?: string;
}

export interface ClinicalDetails {
  mechanism: string;
  strategy: string;
  eligiblePatientProfile: string[];
  titrationProtocol: TitrationProtocol;
  precautions: string[];
  monitoring: string[];
  expectedOutcomes: string[];
  evidences: string[];
}

export function getDiseaseClinicalDetails(diseaseName: string): ClinicalDetails {
  const name = diseaseName.toLowerCase();
  
  if (name.includes('autismo') || name.includes('tea') || name.includes('agressividade')) {
    return {
      mechanism: "Evidências pré-clínicas apontam sinalização endocanabinoide (anandamida) reduzida em modelos de TEA, com desequilíbrio na excitabilidade sináptica glutamato/GABA. O CBD modula receptores CB1/CB2, TRPV1 e 5-HT1A, favorecendo a regulação sensorial e a inibição neuronal.",
      strategy: "Primeira linha: CBD isolado ou broad-spectrum (sem THC), voltado à regulação sensorial e à irritabilidade. Microdoses de THC (proporções CBD:THC de 20:1 a 33:1) são reservadas a casos refratários de agressividade e automutilação severas, sempre sob supervisão próxima.",
      eligiblePatientProfile: [
        "Diagnóstico confirmado de TEA (DSM-5-TR / CID-11), qualquer nível de suporte;",
        "Irritabilidade, agressividade ou autoagressão refratárias a antipsicóticos (risperidona, aripiprazol) ou com efeitos colaterais limitantes;",
        "Comorbidade com epilepsia — indicação historicamente mais robusta, dado o efeito antiepiléptico já estabelecido do CBD;",
        "Distúrbios de sono e ansiedade associados ao quadro."
      ],
      titrationProtocol: {
        start: "2–5 mg/kg/dia, dividido em 2 tomadas",
        titration: "Incrementos de 2–5 mg/kg/dia, a cada 7 dias, conforme resposta e tolerância",
        range: "10–20 mg/kg/dia (Parrella et al. 2026; Trauner et al. 2025)",
        thc: "Proporção CBD:THC de 20:1 a 33:1, somente em refratariedade grave",
        note: "Faixas derivadas de protocolos de estudo publicados — não substituem a titulação individualizada pelo médico assistente conforme peso, resposta clínica e tolerabilidade do paciente."
      },
      precautions: [
        "Clobazam: CBD inibe CYP2C19/3A4, elevando o metabólito ativo N-desmetilclobazam — risco de sedação, exige ajuste de dose;",
        "Valproato: associação com elevação de transaminases hepáticas — monitorar função hepática;",
        "Indutores enzimáticos (fenitoína, carbamazepina, oxcarbazepina): podem reduzir os níveis séricos de CBD;",
        "Evitar formulações com THC predominante — risco de agitação paradoxal, ansiedade ou sintomas psicóticos em cérebro em desenvolvimento;",
        "Efeitos adversos mais comuns: sonolência, diarreia, alteração de apetite."
      ],
      monitoring: [
        "Enzimas hepáticas (TGO/TGP) na linha de base e periodicamente, sobretudo se em uso de valproato;",
        "Escalas validadas: subescala de irritabilidade da ABC (Aberrant Behavior Checklist), SRS-2, CGI-I, diário de sono;",
        "Reavaliação clínica estruturada em 4, 8 e 12 semanas de tratamento;",
        "Peso, apetite e efeitos gastrointestinais a cada consulta."
      ],
      expectedOutcomes: [
        "Estudos observacionais israelenses (Aran et al.; Bar-Lev Schleider et al.) relatam melhora percebida por cuidadores em irritabilidade, sono, contato visual e participação em terapias ocupacionais em cerca de 60–80% dos casos.",
        "Ensaios randomizados mais recentes (Trauner et al. 2025; Parrella et al. 2026) mostram segurança e boa tolerabilidade, mas diferença não significativa frente a placebo nas escalas padronizadas primárias — os déficits centrais de comunicação social respondem de forma menos consistente do que sintomas associados (irritabilidade, sono, ansiedade)."
      ],
      evidences: [
        "Aran A, Cassuto H, Lubotzky A et al. J Autism Dev Disord, 2019 — coorte observacional, CBD:THC ~20:1;",
        "Bar-Lev Schleider L et al. Sci Rep, 2019 — experiência real de 188 pacientes em Israel;",
        "Trauner D, Umlauf A, Grelotti DJ et al. J Autism Dev Disord, 2025 — ECR duplo-cego com CBD purificado (Epidiolex), até 20 mg/kg/dia;",
        "Parrella et al. Autism Research, 2026 — ECR crossover, CBD com terpenos, 10 mg/kg/dia;",
        "Mazza JAS et al. Pharmaceuticals, 2024 — coorte observacional, extrato CBD:THC 33:1;",
        "Aran A, Cayam-Rand D. Expert Opin Emerg Drugs, 2024 — revisão sobre canabinoides no TEA."
      ]
    };
  }
  
  if (name.includes('ansiedade') || name.includes('burnout')) {
    return {
      mechanism: "Modulação dos receptores 5-HT1A (serotonina) e facilitação da neurotransmissão GABAérgica. O CBD atua inibindo a enzima FAAH, aumentando os níveis endógenos de Anandamida, promovendo estabilização da amígdala e resposta ao estresse crônico.",
      strategy: "Em quadros ansiosos, doses bifásicas são comuns. Doses baixas tendem a ser estimulantes e focadas em cognição, enquanto doses médias/altas promovem ansiólise. Evitar THC puro ou em altas doses sem balanceamento com CBD.",
      eligiblePatientProfile: [
        "Transtorno de Ansiedade Generalizada (TAG) refratário a ISRS ou com efeitos adversos limitantes;",
        "Síndrome de Burnout com esgotamento neuroendócrino;",
        "Ansiedade social limitante;",
        "Pacientes em uso crônico de benzodiazepínicos buscando desmame assistido."
      ],
      titrationProtocol: {
        start: "CBD: 10 a 15 mg/dia, preferencialmente pela manhã ou dividido em 2 tomadas.",
        titration: "Incrementos de 5-10 mg a cada 5 dias, até remissão dos sintomas ansiosos.",
        range: "25–75 mg/dia para ansiedade leve a moderada. Até 300mg em fobias sociais agudas (dose de resgate).",
        thc: "Apenas formulações Full Spectrum (traços de THC <0.3%) ou concentrações mínimas se houver insônia severa associada.",
        note: "Doses excessivamente altas de CBD podem gerar sedação diurna. O objetivo é a dose mínima efetiva."
      },
      precautions: [
        "Interação com ISRS (Sertralina, Fluoxetina, Escitalopram): o CBD pode elevar níveis séricos destes fármacos (CYP2D6, CYP2C19).",
        "Monitorar sedação excessiva se coadministrado com benzodiazepínicos.",
        "THC isolado ou em altas proporções pode induzir taquicardia ou ataques de pânico (efeito bifásico invertido)."
      ],
      monitoring: [
        "Escala HAM-A (Hamilton Anxiety Rating Scale) na linha de base e a cada 4 semanas;",
        "Acompanhamento da qualidade do sono associada ao estresse;",
        "Avaliação de variabilidade da frequência cardíaca (HRV) se disponível."
      ],
      expectedOutcomes: [
        "Redução de pensamentos intrusivos e ruminações.",
        "Relaxamento muscular global sem perda de acuidade mental.",
        "Regulação do ciclo de cortisol diurno, diminuindo a sensação de 'luta ou fuga' basal."
      ],
      evidences: [
        "Bergamaschi et al. Neuropsychopharmacology, 2011 — CBD reduz ansiedade simulada em falar em público;",
        "Shannon S et al. Perm J, 2019 — Série de casos clínicos: 79% dos pacientes reportaram diminuição de ansiedade no primeiro mês;",
        "Blessing EM et al. Neurotherapeutics, 2015 — Revisão apontando CBD como potencial tratamento para múltiplos transtornos de ansiedade."
      ]
    };
  }

  // Generic fallback for others
  return {
      mechanism: "A interação ocorre primordialmente através da modulação do tônus endocanabinoide basal (AEA e 2-AG). O CBD atua como modulador alostérico negativo do CB1 e agonista de múltiplos receptores periféricos (5-HT1A, TRPV1), enquanto o THC atua como agonista parcial CB1/CB2, restaurando a homeostase do sistema nervoso e imunológico.",
      strategy: "Priorizar o Efeito Entourage utilizando extratos Full ou Broad Spectrum. A introdução deve seguir estritamente o princípio 'Start Low, Go Slow' (iniciar com doses mínimas e titular lentamente) para mitigar efeitos adversos bifásicos e evitar a saturação de receptores.",
      eligiblePatientProfile: [
        "Diagnóstico clínico estabelecido refratário ou intolerante às terapias convencionais de primeira linha;",
        "Pacientes em polifarmácia buscando redução de danos (efeito poupador de opioides, benzodiazepínicos ou AINEs);",
        "Ausência de histórico pessoal de esquizofrenia ou psicoses induzidas por substâncias (especialmente para uso de THC);",
        "Pacientes com função hepática e renal estáveis."
      ],
      titrationProtocol: {
        start: "CBD: 2,5 a 5 mg/dose | THC (se aplicável): 1 a 2,5 mg/dose",
        titration: "Aumentos graduais a cada 3-7 dias, monitorando a janela terapêutica.",
        range: "Variável. Doses médias de CBD: 20-50 mg/dia. Doses altas: >100 mg/dia.",
        thc: "Apenas se refratário ou quadro de dor/espasticidade severa. Proporção ajustada individualmente.",
        note: "O sistema endocanabinoide possui alta variabilidade interindividual. O protocolo de titulação exige acompanhamento de perto e diário de sintomas pelo paciente."
      },
      precautions: [
        "Interações medicamentosas mediadas pelo Citocromo P450 (CYP3A4, CYP2C19, CYP2C9).",
        "Risco de hipotensão ortostática e taquicardia transitória no início do tratamento com THC.",
        "Cuidado em pacientes idosos devido ao risco aumentado de quedas secundárias à sedação.",
        "Efeitos adversos gastrointestinais dependentes da base oleosa (TCM ou azeite) e sonolência diurna."
      ],
      monitoring: [
        "Acompanhamento quinzenal no primeiro mês para ajuste fino de dose;",
        "Avaliação de função hepática (TGO, TGP, GGT) semestral ou se sintomas sugerirem hepatotoxicidade;",
        "Uso de escalas analógicas visuais (VAS) e questionários de qualidade de vida (QoL);",
        "Ajuste da via de administração conforme a resposta (óleo para base, vaporização para resgate)."
      ],
      expectedOutcomes: [
        "Atenuação de picos sintomáticos (inflamatórios, álgicos ou psiquiátricos).",
        "Melhora na qualidade de vida subjetiva, restauração do padrão de sono e aumento de funcionalidade diária.",
        "Possibilidade de desmame gradual de medicações alopáticas concomitantes após estabilização clínica (2 a 3 meses de tratamento contínuo)."
      ],
      evidences: [
        "Evidências substanciais da NASEM (National Academies of Sciences, Engineering, and Medicine) para dor crônica, espasticidade e náuseas.",
        "Estudos clínicos de fase II e III demonstram eficácia superior ao placebo em quadros refratários específicos.",
        "Ampla literatura observacional atestando perfil de segurança favorável quando acompanhado por equipe médica."
      ]
  };
}
`;

code = code + newContent;
fs.writeFileSync(path, code);
console.log('Updated clinical data model with rich structures');
