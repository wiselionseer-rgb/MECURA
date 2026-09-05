const fs = require('fs');

let guidePath = 'src/data/cbdGuide.ts';
let code = fs.readFileSync(guidePath, 'utf8');

if (!code.includes('indicationsList?: string[];')) {
  code = code.replace(/description: string;\n/, "description: string;\n  indicationsList?: string[];\n");
}

const replacements = [
  {
    target: /description: "Produtos com perfil ansiolítico\. Indicados para: Ansiedade, Depressão, Estresse, Burnout, TDAH e distúrbios do humor\.",/g,
    replacement: 'description: "Produtos com perfil ansiolítico calmante e regulador do humor.",\n    indicationsList: ["Ansiedade", "Depressão", "Estresse Crônico", "Burnout", "TDAH", "Transtornos do Humor"],'
  },
  {
    target: /description: "Analgesia e relaxamento\. Indicado para: Dor Crônica, Enxaqueca, Fibromialgia, Artrite\/Artrose, Hérnia de Disco, Dores Neuropáticas, Esclerose Múltipla, Asma e Glaucoma\.",/g,
    replacement: 'description: "Formulações focadas em analgesia sistêmica e relaxamento muscular profundo.",\n    indicationsList: ["Dor Crônica", "Enxaqueca", "Fibromialgia", "Artrite / Artrose", "Hérnia de Disco", "Dores Neuropáticas", "Esclerose Múltipla", "Asma", "Glaucoma"],'
  },
  {
    target: /description: "Produtos sedativos indicados para: Insônia, Bruxismo, Síndrome das Pernas Inquietas e agitação noturna\.",/g,
    replacement: 'description: "Produtos com CBN, THC e terpenos sedativos, focados em relaxamento noturno.",\n    indicationsList: ["Insônia", "Distúrbios do Sono", "Bruxismo", "Síndrome das Pernas Inquietas", "Agitação Noturna"],'
  },
  {
    target: /description: "Canabinoides como THCV, CBG e terpenos estimulantes \(ex: limoneno\) para foco, disposição e controle metabólico\. Indicado também para Burnout, Obesidade e Melhora no Esporte\.",/g,
    replacement: 'description: "Canabinoides como THCV, CBG e terpenos estimulantes (ex: limoneno) para disposição física e mental.",\n    indicationsList: ["TDAH", "Burnout", "Foco e Concentração", "Obesidade e Controle Metabólico", "Melhora no Esporte", "Fadiga Crônica"],'
  },
  {
    target: /description: "Equilíbrio hormonal, alívio de cólicas \(dismenorreia\), controle de irritabilidade da TPM e modulação dos fogachos da menopausa\.",/g,
    replacement: 'description: "Formulações focadas em equilíbrio hormonal e alívio de sintomas agudos.",\n    indicationsList: ["TPM (Tensão Pré-Menstrual)", "Menopausa", "Endometriose", "Cólicas Menstruais (Dismenorreia)"],'
  },
  {
    target: /description: "Modulação da inflamação intestinal, estímulo do apetite \(Anorexia\) e controle de náuseas severas\.",/g,
    replacement: 'description: "Modulação da inflamação do trato digestivo e regulação das vias gástricas.",\n    indicationsList: ["Doença de Crohn", "Colite Ulcerativa", "Anorexia", "Síndrome do Intestino Irritável", "Controle de Náuseas"],'
  },
  {
    target: /title: "5\. DOENÇAS NEURODEGENERATIVAS E IDOSOS",\s+description: "Para Alzheimer, Parkinson e demências\. Formulações para neuroproteção, controle de agitação noturna e tremores\.",/g,
    replacement: 'title: "7. DOENÇAS NEURODEGENERATIVAS E IDOSOS (DUP)",\n    description: "Remove this later.",\n'
  },
  {
    target: /title: "7\. DOENÇAS NEURODEGENERATIVAS E IDOSOS",\s+description: "Canabinoides como THCV, CBG e terpenos estimulantes \(ex: limoneno\) para foco, disposição e controle metabólico\.",/g,
    replacement: 'title: "7. DOENÇAS NEURODEGENERATIVAS E IDOSOS",\n    description: "Formulações para neuroproteção, controle de agitação noturna, tremores e rigidez.",\n    indicationsList: ["Parkinson", "Alzheimer", "Demência", "Tremores e Rigidez Muscular", "Qualidade de vida na Terceira Idade"],'
  },
  {
    target: /description: "Foco em altíssimas concentrações de Canabidiol \(CBD\) para supressão e controle de crises convulsivas\.",/g,
    replacement: 'description: "Foco em altas concentrações de CBD sistêmico e resgate rápido para controle sintomático.",\n    indicationsList: ["Epilepsia Refratária", "Crises Convulsivas", "Síndrome de Dravet", "Síndrome de Lennox-Gastaut"],'
  },
  {
    target: /description: "Formulações focadas em modulação sensorial, controle de crises de agitação e agressividade, melhorando a sociabilidade\.",/g,
    replacement: 'description: "Modulação sensorial contínua e controle de estereotipias, promovendo equilíbrio.",\n    indicationsList: ["Autismo (TEA)", "Regulação Sensorial e Comportamental", "Controle de Agressividade", "Melhora na Sociabilidade"],'
  },
  {
    target: /description: "Controle da inflamação cutânea, redução de descamação \(Psoríase\) e alívio do prurido\.",/g,
    replacement: 'description: "Opções de uso tópico e sistêmico para controle inflamatório autoimune da pele.",\n    indicationsList: ["Psoríase", "Dermatite Atópica", "Inflamações Cutâneas", "Alívio do Prurido e Descamação"],'
  },
  {
    target: /description: "Controle de fissuras \(craving\) na retirada de opioides, benzodiazepínicos e estabilização emocional\.",/g,
    replacement: 'description: "Auxílio estruturado na redução do uso problemático de substâncias e estabilização.",\n    indicationsList: ["Redução de Vícios", "Controle de Fissuras (Craving)", "Desmame de Benzodiazepínicos e Opioides", "Estabilização Emocional"],'
  },
  {
    target: /description: "Apoio a pacientes oncológicos, esclerose múltipla avançada: controle de náuseas induzidas por quimioterapia, caquexia e dor severa\.",/g,
    replacement: 'description: "Apoio analgésico e alívio dos efeitos colaterais de tratamentos oncológicos.",\n    indicationsList: ["Suporte no Câncer", "Cuidados Paliativos", "Dor Oncológica", "Náuseas e Vômitos Induzidos por Quimioterapia", "Caquexia (Perda de Apetite)"],'
  }
];

replacements.forEach(r => {
  code = code.replace(r.target, r.replacement);
});

// Remove the duplicated category 5 which we renamed to 7. ... (DUP)
// It looks like:
//   {
//     id: "neurodegenerativas",
//     title: "7. DOENÇAS NEURODEGENERATIVAS E IDOSOS (DUP)",
//     description: "Remove this later.",
//     dosageGuidance: "Titulação lenta (start low, go slow). Monitorar interações com outros fármacos de uso contínuo.",
//     products: [
//       ${products.broad5Nacional},
//       ${products.broad10Nacional},
//       ${products.extratoCBD50Nacional},
//       ${products.extratoCBD100Nacional}
//     ]
//   },

code = code.replace(/  \{\n\s*id: "neurodegenerativas",\n\s*title: "7\. DOENÇAS NEURODEGENERATIVAS E IDOSOS \(DUP\)",\n\s*description: "Remove this later\.",\n[\s\S]*?  \},\n/g, "");

fs.writeFileSync(guidePath, code);
console.log('Patched Guide Data successfully');
