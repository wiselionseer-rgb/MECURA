import { CBDProduct } from './cbdGuide';

export interface PangaiaProduct extends CBDProduct {
  productLine?: 'Pharma Óleos' | 'Pangaia Amazônia' | 'Cápsulas Softgel' | 'Gummies' | 'Tópicos & Cremes' | 'Concentrados Elite' | 'Flores Medicinais';
  ratio?: string;
  volumeOrWeight?: string;
  extractConcentration?: string;
  mgPerDropCBD?: number;
  mgPerDropTHC?: number;
  mgPerDropDelta8?: number;
  mgPerUnit?: number;
  dropsPerMl?: number;
  carrierVehicle?: string;
  gmpCertified?: boolean;
  hplcStandardized?: boolean;
  anvisaRdc?: string;
  contraindications?: string;
  mechanismOfAction?: string;
  adverseEffects?: string;
  posologyDetails?: string;
  prescriptionExample?: string;
}

export const PANGAIA_COMPANY_INFO = {
  name: "Pangaia",
  fullName: "Pangaia Biopharmaceuticals & Health (Pangaia Trading Co.)",
  origin: "Importado (Estados Unidos / Padrão Farmacêutico GMP)",
  nature: "Laboratório Biotecnológico Internacional pioneiro com mais de 20 anos de pesquisa e colaboração científica com o Prof. Raphael Mechoulam",
  anvisaRegulation: "RDC Anvisa nº 660/2022 (Importação Formal de Canabinoides por Pessoa Física)",
  clinicalSupport: "Parceria com CannaCare e iniciativa Anvisa Simples para desburocratização de autorização de importação",
  validityMonths: 24,
  dropsPerMl: 20, // Conta-gotas graduado medicinal de precisão (0,05 mL por gota)
  carrier: "MCT Orgânico (Triglicerídeos de Cadeia Média) e Bioativos Amazônicos Nativos (Copaíba e Andiroba)",
  analyticalControl: "COA (Certificate of Analysis) por HPLC e Espectrometria de Massas por laboratórios terceirizados independentes com selo cGMP",
  standardCannabinoidsReference: "Formulação farmacêutica de espectro integral (Full Spectrum), Broad Spectrum e Isolado de alta biodisponibilidade",
  description: "A Pangaia é uma companhia multinacional de pesquisa e desenvolvimento de derivados canabinoides com mais de 20 anos de tradição. Formulada em estrita conformidade com os padrões farmacêuticos cGMP norte-americanos, seus produtos combinam pureza analítica laboratorial com sustentabilidade e inovação, incluindo a renomada Linha Amazônia em parceria com comunidades indígenas sustentáveis (bioativos de Copaíba e Andiroba). Atende integralmente à RDC 660/2022 da Anvisa para prescrição médica e importação legal.",
  catalogSections: [
    "1. Linha Pharma — Óleos Sublinguais Full Spectrum & Isolados (5%, 10%, 20%, Delta-8 e Isolate)",
    "2. Linha Pangaia Amazônia — Bioativos Nativos (Óleo Maná Copaíba 3000mg e Pomada Táio 3375mg)",
    "3. Linha Pharma — Cápsulas Softgel de Liberação Controlada (750mg e 1500mg)",
    "4. Linha Pharma — Gomas / Gummies Terapêuticas (Grape 16 unids, 28 unids, e Delta-8 Vegan)",
    "5. Linha Tópica & Terapêutica Dérmica (Cooling Salve 500mg e CBD Relief Cream 3000mg)",
    "6. Linha Concentrados Elite (Live Rosin THC-A 1g, Diamond Sauce CBD 10g, Bubble Hash 10g)",
    "7. Linha Flor Medicinal Selecionada (Inalação com Vaporizador Regulamentado)"
  ]
};

export const PANGAIA_PRODUCTS: PangaiaProduct[] = [
  // =========================================================================
  // 1. LINHA PHARMA — ÓLEOS SUBLINGUAIS FULL SPECTRUM & ISOLADOS
  // =========================================================================
  {
    name: "Óleo CBD Full Spectrum Pangaia 5% — 1500 mg (30 mL)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Óleo Sublingual Full Spectrum",
    productLine: "Pharma Óleos",
    ratio: "Full Spectrum (CBD predominante com traços de THC < 0,2%)",
    volumeOrWeight: "30 mL",
    extractConcentration: "5% (50 mg de CBD por mL — 1500 mg no frasco)",
    mgPerDropCBD: 2.5,
    mgPerDropTHC: 0.08,
    dropsPerMl: 20,
    carrierVehicle: "Óleo MCT Orgânico (Triglicerídeos de Cadeia Média)",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 489.00,
    priceUSD: 85.00,
    activeIngredients: "Canabidiol (CBD) Full Spectrum 50 mg/mL com terpenos bioativos e traços de fitocanabinoides menores (CBG, CBN, CBC)",
    concentration: "50 mg/mL de CBD (1500 mg por frasco de 30 mL)",
    pharmaceuticalForm: "Óleo sublingual em gotas",
    quantity: "01 Frasco de 30 mL com conta-gotas graduado medicinal",
    administrationRoute: "Via Sublingual",
    description: "Óleo medicinal Full Spectrum de início de titulação com 1500 mg de CBD puro em 30 mL (50 mg/mL). Veiculado em óleo MCT orgânico premium para absorção otimizada. Cada gota fornece 2,5 mg de CBD. Indicado para casos leves a moderados e pacientes sensíveis.",
    indications: "Transtorno de ansiedade leve a moderada, insônia inicial, estresse crônico, tensão muscular tensional, início de titulação em pacientes idosos virgens de tratamento, sintomas leves de TPM e suporte adaptógeno.",
    contraindications: "Hipersensibilidade conhecida aos componentes da fórmula ou ao carreador MCT. Gestação e lactação sem autorização expressa.",
    mechanismOfAction: "Modulação alostérica positiva dos receptores 5-HT1A da serotonina e receptores vaniloides TRPV1; inibição da recaptação da anandamida com preservação do tônus endocanabinoide basal.",
    adverseEffects: "Sonolência leve em doses elevadas, boca seca e raros episódios de desconforto gástrico leve transitório.",
    posologyDetails: "Iniciar com 2 a 3 gotas (5,0 a 7,5 mg) sublinguais 2 vezes ao dia (manhã e noite), mantendo sob a língua por 60 segundos antes de engolir. Aumentar 1 a 2 gotas a cada 3 a 5 dias conforme resposta clínica até atingir a dose alvo.",
    usageInstructions: "Administrar por via sublingual, retendo o óleo sob a língua por 60 segundos antes de deglutir para garantir absorção transmucosa direta. Agitar suavemente antes de usar.",
    prescriptionExample: "Óleo CBD Full Spectrum Pangaia 5% (1500 mg / 30 mL) — 01 Frasco. Pingar 3 gotas sob a língua 2x ao dia (manhã e noite). Ajustar conforme evolução.",
    details: [
      "Concentração: 50 mg/mL (1500 mg CBD em 30 mL)",
      "Cada gota fornece aproximadamente 2,5 mg de CBD ativo",
      "Veículo: 100% Óleo MCT Orgânico de coco com sabor neutro e suave",
      "Padrão de fabricação: Certificação farmacêutica cGMP e testes por laboratórios terceirizados independentes",
      "Importação formal para uso pessoal via RDC Anvisa nº 660/2022"
    ]
  },
  {
    name: "Óleo CBD Full Spectrum Pangaia 10% — 3000 mg (30 mL)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Óleo Sublingual Full Spectrum",
    productLine: "Pharma Óleos",
    ratio: "Full Spectrum (CBD balanceado de alta potência com traços de THC < 0,2%)",
    volumeOrWeight: "30 mL",
    extractConcentration: "10% (100 mg de CBD por mL — 3000 mg no frasco)",
    mgPerDropCBD: 5.0,
    mgPerDropTHC: 0.15,
    dropsPerMl: 20,
    carrierVehicle: "Óleo MCT Orgânico (Triglicerídeos de Cadeia Média)",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 879.00,
    priceUSD: 149.00,
    activeIngredients: "Canabidiol (CBD) Full Spectrum 100 mg/mL com perfil completo de terpenos (mirceno, limoneno, beta-cariofileno) e canabinoides sinérgicos",
    concentration: "100 mg/mL de CBD (3000 mg por frasco de 30 mL)",
    pharmaceuticalForm: "Óleo sublingual em gotas",
    quantity: "01 Frasco de 30 mL com conta-gotas graduado de alta precisão",
    administrationRoute: "Via Sublingual",
    description: "O medicamento mais prescrito e versátil da Pangaia. Concentração padrão ouro de 100 mg/mL (3000 mg no frasco). Cada gota fornece 5,0 mg exatos de CBD, permitindo ajuste posológico rápido e preciso para uma ampla gama de patologias crônicas.",
    indications: "Dor crônica neuropática, fibromialgia, artrite, artrose, enxaqueca refratária, ansiedade generalizada (TAG), síndrome do pânico, insônia crônica, estresse pós-traumático (TEPT), transtorno do espectro autista (TEA), tremores essenciais e modulação neuroinflamatória.",
    contraindications: "Hipersensibilidade aos canabinoides ou óleo MCT. Cuidados especiais em insuficiência hepática severa (monitorar enzimas ALT/AST em doses > 5 mg/kg/dia).",
    mechanismOfAction: "Interação sinérgica (efeito entourage) ativando receptores CB1 e CB2 de forma equilibrada, antagonismo do receptor GPR55, potencialização da sinalização glicinérgica e redução da liberação de citocinas pró-inflamatórias (TNF-alfa, IL-1beta e IL-6).",
    adverseEffects: "Sonolência transitória na fase de titulação, alteração temporária do apetite, boca seca.",
    posologyDetails: "Dose inicial recomendada: 2 gotas (10 mg) sublinguais a cada 12 horas. Titular semanalmente adicionando 1 gota por tomada até controle sintomático (faixa terapêutica média: 20 mg a 60 mg/dia divididos em 2 tomadas).",
    usageInstructions: "Pingar a quantidade de gotas prescrita sob a língua. Manter contato com a mucosa por 60 a 90 segundos antes da deglutição.",
    prescriptionExample: "Óleo CBD Full Spectrum Pangaia 10% (3000 mg / 30 mL) — 01 Frasco. Pingar 3 gotas sob a língua pela manhã e 4 gotas à noite antes de dormir. Titular até 6 gotas 2x/dia.",
    details: [
      "Concentração clínica de referência: 100 mg/mL de CBD puro Full Spectrum",
      "Cada gota equivale a 5,0 mg de CBD",
      "Frasco econômico de 30 mL contendo aproximadamente 600 gotas ativas",
      "Carreador: MCT 100% puro derivado de óleo de coco sustentável",
      "Processo de extração por CO2 supercrítico livre de resíduos químicos e metais pesados",
      "Em conformidade com a RDC Anvisa 660/2022"
    ]
  },
  {
    name: "Óleo CBD Full Spectrum Pangaia 20% — 6000 mg (30 mL)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Óleo Sublingual Full Spectrum de Alta Concentração",
    productLine: "Pharma Óleos",
    ratio: "Full Spectrum Ultra Concentrado (CBD 200 mg/mL, THC < 0,2%)",
    volumeOrWeight: "30 mL",
    extractConcentration: "20% (200 mg de CBD por mL — 6000 mg no frasco)",
    mgPerDropCBD: 10.0,
    mgPerDropTHC: 0.30,
    dropsPerMl: 20,
    carrierVehicle: "Óleo MCT Orgânico de Alta Pureza",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 1099.00,
    priceUSD: 189.00,
    activeIngredients: "Canabidiol (CBD) Full Spectrum 200 mg/mL (6000 mg por frasco) associado a fitocanabinoides maiores e menores padronizados por HPLC",
    concentration: "200 mg/mL de CBD (6000 mg por frasco de 30 mL)",
    pharmaceuticalForm: "Óleo sublingual concentrado",
    quantity: "01 Frasco de 30 mL com pipeta dosadora graduada",
    administrationRoute: "Via Sublingual",
    description: "Formulação de máxima concentração e melhor custo-benefício por miligrama da Pangaia. Fornece impressionantes 200 mg/mL de CBD, onde cada gota simples contém 10,0 mg de CBD. Indicada para patologias neurológicas complexas, espasticidade severa, dor oncológica e pacientes tolerantes a volumes maiores de óleo.",
    indications: "Epilepsia refratária infantil e adulta (Síndrome de Dravet, Lennox-Gastaut), esclerose múltipla com espasticidade e rigidez, dor oncológica intratável, doença de Parkinson avançada com discinesias, demências com agitação psicomotora, esclerose lateral amiotrófica (ELA) e artrite reumatoide grave.",
    contraindications: "Hipersensibilidade grave conhecida a canabinoides. Monitoramento clínico obrigatório em uso concomitante com ácido valproico ou clobazam.",
    mechanismOfAction: "Bloqueio potente de canais de sódio voltagem-dependentes, dessensibilização dos receptores TRPV1, inibição da recaptação glial de adenosina e supressão maciça da neuroinflamação via regulação de microgliócitos.",
    adverseEffects: "Sonolência, fadiga inicial, redução da pressão arterial transitória e alterações no hábito intestinal em altas doses.",
    posologyDetails: "Iniciar com 1 gota (10 mg) à noite. Titular a cada 4 dias adicionando 1 gota (10 mg) por tomada até atingir controle clínico ou dose estipulada pelo neurologista/médico assistente (geralmente entre 20 mg e 100 mg/dia).",
    usageInstructions: "Pingar diretamente na região sublingual, aguardar 60 a 90 segundos antes de engolir. Administrar preferencialmente após refeições ricas em lipídios para aumentar a biodisponibilidade sistêmica em até 4 vezes.",
    prescriptionExample: "Óleo CBD Full Spectrum Pangaia 20% (6000 mg / 30 mL) — 01 Frasco. Pingar 1 gota (10 mg) sob a língua 2x/dia nos primeiros 4 dias. Aumentar para 2 gotas 2x/dia (40 mg/dia) a partir do 5º dia.",
    details: [
      "Altíssima densidade terapêutica: 200 mg de CBD por mL (6000 mg totais)",
      "Cada gota única entrega 10,0 mg de CBD ativo",
      "Permite administração de doses elevadas com volume mínimo de gotas no fundo da boca",
      "Excelente custo-benefício para tratamentos de longo prazo e patologias neurodegenerativas",
      "Padrão cGMP com laudo de cromatografia líquida de alta eficiência (HPLC) lote a lote"
    ]
  },
  {
    name: "Óleo CBD Full Spectrum + Delta-8 THC Pangaia — 2000 mg (30 mL)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Óleo Sublingual Full Spectrum com Delta-8 THC",
    productLine: "Pharma Óleos",
    ratio: "CBD : Delta-8 THC (1500 mg CBD + 500 mg Delta-8 THC)",
    volumeOrWeight: "30 mL",
    extractConcentration: "66,7 mg/mL de canabinoides totais (2000 mg no frasco)",
    mgPerDropCBD: 2.5,
    mgPerDropTHC: 0.83,
    mgPerDropDelta8: 0.83,
    dropsPerMl: 20,
    carrierVehicle: "Óleo MCT Orgânico com terpenos selecionados",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 599.99,
    priceUSD: 105.00,
    activeIngredients: "Canabidiol (CBD) 50 mg/mL + Delta-8 Tetrahidrocanabinol (Delta-8 THC) 16,7 mg/mL em veículo lipídico",
    concentration: "66,7 mg/mL de canabinoides (1500 mg CBD + 500 mg Delta-8 THC por 30 mL)",
    pharmaceuticalForm: "Óleo sublingual em gotas",
    quantity: "01 Frasco de 30 mL com conta-gotas graduado",
    administrationRoute: "Via Sublingual",
    description: "Fórmula combinada pioneira que une 1500 mg de CBD ao Delta-8 THC (500 mg). O Delta-8 é um isômero do THC com afinidade potente aos receptores CB1 e CB2 que confere relaxamento profundo, alívio analgésico e efeito antiemético marcante, com risco substancialmente menor de desencadear ansiedade ou paranoia em comparação com o Delta-9 THC convencional.",
    indications: "Náuseas e vômitos refratários pós-quimioterapia, anorexia e caquexia com perda ponderal severa, insônia resistente com componente álgico, dor neuropática profunda, espasticidade muscular e espasmos noturnos.",
    contraindications: "Histórico pessoal ou familiar de psicose esquizofreniforme; cardiopatias descompensadas graves com arritmias.",
    mechanismOfAction: "Agonismo parcial nos receptores CB1 do SNC modulando a transmissão gabaérgica e glutamatérgica, potente inibição do centro do vômito na área postrema e amplificação da analgesia opioide-independente.",
    adverseEffects: "Sonolência, leve euforia relaxante, hiperemia conjuntival, boca seca e aumento do apetite.",
    posologyDetails: "Uso noturno ou pós-prandial. Iniciar com 2 a 3 gotas (aproximadamente 5 mg de CBD e 1,7 mg de Delta-8) antes de dormir. Titular cautelosamente conforme tolerância e necessidade analgésica.",
    usageInstructions: "Pingar sublingualmente 30 a 60 minutos antes do descanso noturno ou conforme horário de piora álgica. Evitar dirigir veículos ou operar máquinas sob o efeito.",
    prescriptionExample: "Óleo CBD Full Spectrum + Delta-8 THC Pangaia (2000 mg / 30 mL) — 01 Frasco. Pingar 3 gotas sob a língua 45 minutos antes de deitar. Não exceder 8 gotas ao dia.",
    details: [
      "Composição: 1500 mg CBD + 500 mg Delta-8 THC farmacêutico",
      "Cada gota fornece ~2,5 mg de CBD + ~0,83 mg de Delta-8 THC",
      "Potente ação antiemética e estimuladora do apetite sem pico ansiogênico",
      "Importação por autorização Anvisa RDC 660/2022"
    ]
  },
  {
    name: "Óleo CBD Isolate Pangaia 3000 mg — 100 mg/mL (30 mL — 0% THC)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Óleo Sublingual CBD Isolado (Zero THC)",
    productLine: "Pharma Óleos",
    ratio: "Isolado Puro (>99,5% Canabidiol / 0,0% THC Total)",
    volumeOrWeight: "30 mL",
    extractConcentration: "10% (100 mg de CBD puro por mL — 3000 mg no frasco)",
    mgPerDropCBD: 5.0,
    mgPerDropTHC: 0.0,
    dropsPerMl: 20,
    carrierVehicle: "Óleo MCT Orgânico de Coco Extra Virgem",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 790.00,
    priceUSD: 135.00,
    activeIngredients: "Canabidiol isolado cristalino ultra-purificado (>99,5% pureza farmacêutica)",
    concentration: "100 mg/mL de CBD isolado (3000 mg por 30 mL — 0,00% THC)",
    pharmaceuticalForm: "Óleo sublingual em gotas",
    quantity: "01 Frasco de 30 mL com conta-gotas graduado",
    administrationRoute: "Via Sublingual",
    description: "Canabidiol isolado de máxima pureza farmacêutica sem qualquer presença detectável de THC (0,00%). Ideal para atletas de alto rendimento submetidos a testes antidoping da WADA/COB, policiais, pilotos de aviação, militares e indivíduos com alta intolerância ou suscetibilidade a canabinoides psicoativos.",
    indications: "Ansiedade generalizada, estresse agudo, insônia leve, dores inflamatórias sem componente neuropático complexo, pacientes que não podem testar positivo para THC em testes toxicológicos corporativos ou desportivos.",
    contraindications: "Hipersensibilidade ao canabidiol ou veículo MCT.",
    mechanismOfAction: "Ativação direta de receptores 5-HT1A e vaniloides TRPV1 sem ativação de receptores CB1 canabinoides centrais.",
    adverseEffects: "Boca seca, discreta sedação em doses altas. Excelente perfil de tolerabilidade e ausência total de efeitos psicoativos.",
    posologyDetails: "2 a 4 gotas (10 a 20 mg) sublinguais 2 a 3 vezes ao dia.",
    usageInstructions: "Pingar sublingualmente e manter por 60 segundos antes de deglutir.",
    prescriptionExample: "Óleo CBD Isolate Pangaia 3000 mg (100 mg/mL / 30 mL) — 01 Frasco. Pingar 4 gotas sob a língua pela manhã e 4 gotas à tarde.",
    details: [
      "Pureza certificada: > 99,5% Canabidiol isolado por cromatografia",
      "0,00% THC comprovado por laudo laboratorial HPLC emitido por lote",
      "Livre de testes toxicológicos positivos (aprovado para desportistas e pilotos)",
      "Importação autorizada via Anvisa RDC 660/2022"
    ]
  },

  // =========================================================================
  // 2. LINHA PANGAIA AMAZÔNIA — BIOATIVOS NATIVOS & CANABINOIDES
  // =========================================================================
  {
    name: "Óleo Maná Pangaia 3000 mg — CBD Full Spectrum com Copaíba Amazônica (30 mL)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Óleo Sublingual Full Spectrum com Copaíba da Amazônia",
    productLine: "Pangaia Amazônia",
    ratio: "CBD Full Spectrum 100 mg/mL enriquecido com Óleo-Resina de Copaíba",
    volumeOrWeight: "30 mL",
    extractConcentration: "10% (100 mg/mL de CBD + Beta-Cariofileno natural da Amazônia)",
    mgPerDropCBD: 5.0,
    mgPerDropTHC: 0.15,
    dropsPerMl: 20,
    carrierVehicle: "Blend de Óleo MCT Orgânico com Óleo-Resina Pura de Copaíba (Copaifera reticulata)",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 440.00,
    priceUSD: 79.00,
    activeIngredients: "Canabidiol Full Spectrum 100 mg/mL associado a óleo-resina virgem de Copaíba (Copaifera reticulata) rica em Beta-Cariofileno (agonista CB2 potente)",
    concentration: "100 mg/mL de CBD (3000 mg por 30 mL) + fitoterápicos amazônicos",
    pharmaceuticalForm: "Óleo sublingual fitoterápico canabinoide",
    quantity: "01 Frasco de 30 mL com conta-gotas medicinal",
    administrationRoute: "Via Sublingual",
    description: "Produto emblemático da Linha Pangaia Amazônia, desenvolvido em parceria com comunidades extrativistas indígenas sustentáveis. Associa 3000 mg de CBD Full Spectrum com o potente bálsamo de Copaíba da floresta amazônica. A Copaíba é a fonte natural mais concentrada de Beta-Cariofileno do planeta, um sesquiterpeno que atua como agonista seletivo do receptor canabinoide CB2, multiplicando a potência anti-inflamatória e analgésica do extrato.",
    indications: "Doenças inflamatórias intestinais (Doença de Crohn, Retocolite Ulcerativa), artrite reumatoide, espondilite anquilosante, osteoartrite dolorosa avançada, dor neuropática periférica, enxaqueca inflamatória e recuperação tecidual sistêmica.",
    contraindications: "Hipersensibilidade à Copaíba ou a produtos canabinoides. Gastrite erosiva ativa aguda (administrar com alimentos se houver sensibilidade gástrica).",
    mechanismOfAction: "Duplo agonismo CB2 sinérgico: o CBD atua indiretamente enquanto o beta-cariofileno da copaíba liga-se diretamente ao receptor CB2, suprimindo com altíssima eficácia a via inflamatória NF-kB, ciclooxigenase-2 (COX-2) e óxido nítrico sintase induzível (iNOS).",
    adverseEffects: "Gosto aromático característico resinoso da copaíba, leve sensação de calor na boca, sonolência leve transitória.",
    posologyDetails: "Iniciar com 2 a 3 gotas sublinguais 2 vezes ao dia (manhã e noite). Titular 1 gota a cada 3 a 5 dias até a dose diária ideal (em média 4 a 6 gotas 2x/dia).",
    usageInstructions: "Pingar sublingualmente e manter por 60 segundos antes de engolir. Tomar preferencialmente acompanhado de uma refeição.",
    prescriptionExample: "Óleo Maná Pangaia 3000 mg com Copaíba (30 mL) — 01 Frasco. Pingar 3 gotas sob a língua 2x/dia (manhã e noite). Titular até 5 gotas 2x/dia.",
    details: [
      "Concentração: 100 mg/mL de CBD Full Spectrum (3000 mg total)",
      "Carreador botânico bioativo: Óleo virgem de Copaíba colhido por comunidades indígenas amazônicas",
      "Riquíssimo em Beta-Cariofileno nativo: super agonista CB2 com potente ação anti-inflamatória visceral e articular",
      "Preço acessível de catálogo internacional: R$ 440,00",
      "Importação autorizada Anvisa RDC 660/2022"
    ]
  },
  {
    name: "Pomada Táio Pangaia 3375 mg — Andiroba, Arnica, Copaíba & CBD (100g)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Pomada Tópica Medicinal de Alta Potência",
    productLine: "Pangaia Amazônia",
    ratio: "Tópico de Amplo Espectro com Bioativos Amazônicos",
    volumeOrWeight: "100 g",
    extractConcentration: "33,75 mg de fitocanabinoides por grama (3375 mg totais no pote)",
    carrierVehicle: "Base pomada vegetal com óleo de Andiroba, extrato de Arnica Montana e óleo de Copaíba",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 440.00,
    priceUSD: 79.00,
    activeIngredients: "Canabidiol Full Spectrum 3375 mg associado a Óleo de Andiroba (Carapa guianensis), Óleo de Copaíba (Copaifera reticulata) e Arnica Montana",
    concentration: "33,75 mg de CBD por grama de pomada (3375 mg por pote de 100g)",
    pharmaceuticalForm: "Pomada tópica de absorção profunda",
    quantity: "01 Pote de 100 g",
    administrationRoute: "Via Tópica Dérmica",
    description: "Pomada medicinal de alta absorção que une a potência de 3375 mg de CBD Full Spectrum à sabedoria ancestral da floresta amazônica. A união de Andiroba (relaxante muscular e cicatrizante), Arnica (analgésico para contusões) e Copaíba (anti-inflamatório articular) penetra rapidamente através das camadas cutâneas atingindo fáscias, tendões e articulações inflamadas.",
    indications: "Osteoartrite de joelhos, mãos e quadril; lombalgia mecânico-postural crônica; fibromialgia com pontos de gatilho (tender points); tendinites de punho, cotovelo (epicondilite) e ombro; contusões esportivas e rigidez muscular articular pós-esforço.",
    contraindications: "Uso em feridas abertas, queimaduras de 2º/3º grau ou mucosas.",
    mechanismOfAction: "Ativação de receptores CB2, TRPV1 e vaniloides cutâneos nos terminais nervosos livres da derme; inibição da substância P e modulação inflamatória localizada sem efeito sistêmico no SNC.",
    adverseEffects: "Raros episódios de dermatite de contato ou hiperemia transitória em indivíduos hipersensíveis à arnica.",
    posologyDetails: "Aplicar uma quantidade equivalente ao tamanho de uma moeda de 1 real na região afetada de 2 a 3 vezes ao dia, massageando suavemente até completa absorção dérmica.",
    usageInstructions: "Limpar e secar a pele antes da aplicação. Massagear em movimentos circulares por 2 a 3 minutos até penetração do produto. Lavar as mãos após a aplicação.",
    prescriptionExample: "Pomada Táio Pangaia 3375 mg (100g) — 01 Pote. Aplicar na região lombar ou articular dolorida 2 a 3x ao dia com massagem suave.",
    details: [
      "Concentração potente: 3375 mg de CBD Full Spectrum por pote de 100g",
      "Fórmula amazônica enriquecida: Andiroba, Copaíba e Arnica Montana",
      "Alívio rápido de dor osteoarticular, rigidez matinal e contraturas musculares",
      "Absorção não oleosa com aroma botânico natural suave",
      "Importação via Anvisa RDC 660/2022"
    ]
  },

  // =========================================================================
  // 3. LINHA PHARMA — CÁPSULAS SOFTGEL DE LIBERAÇÃO CONTROLADA
  // =========================================================================
  {
    name: "Cápsulas Soft Gel Full Spectrum Pangaia 750 mg (30 cápsulas de 25 mg)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Cápsulas Softgel Orais",
    productLine: "Cápsulas Softgel",
    ratio: "Full Spectrum (25 mg de CBD por cápsula mole)",
    volumeOrWeight: "30 cápsulas gelatinosas moles",
    extractConcentration: "25 mg de CBD por unidade (750 mg por frasco)",
    mgPerUnit: 25.0,
    carrierVehicle: "Óleo MCT Orgânico encapsulado em gelatina de grau farmacêutico",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 349.99,
    priceUSD: 59.00,
    activeIngredients: "Canabidiol Full Spectrum 25 mg por cápsula gelatinosa mole",
    concentration: "25 mg de CBD por cápsula (750 mg no frasco de 30 unidades)",
    pharmaceuticalForm: "Cápsula gelatinosa mole (Softgel)",
    quantity: "01 Frasco com 30 cápsulas softgel",
    administrationRoute: "Via Oral",
    description: "Cápsulas softgel de dosagem precisa e liberação homogênea, ideais para pacientes idosos, indivíduos com disfagia a óleos sublinguais ou aversão ao sabor característico da Cannabis. Cada cápsula fornece 25 mg exatos de CBD Full Spectrum veiculado em MCT farmacêutico.",
    indications: "Tratamento de manutenção para ansiedade crônica, distúrbios do sono, dores miofasciais moderadas, doenças inflamatórias crônicas e suporte neurológico contínuo.",
    contraindications: "Alergia a componentes da gelatina ou canabinoides.",
    mechanismOfAction: "Absorção gastrointestinal com liberação gradual ao longo de 6 a 8 horas, proporcionando níveis plasmáticos estáveis e prolongados sem picos ou quedas abruptas.",
    adverseEffects: "Desconforto gástrico leve em indivíduos em jejum prolongado; sonolência branda.",
    posologyDetails: "Ingerir 1 cápsula (25 mg) pela manhã e/ou 1 cápsula à noite, preferencialmente acompanhada de refeições com teor de gordura moderado para facilitar a biodisponibilidade.",
    usageInstructions: "Ingerir com auxílio de água ou líquidos frios. Não mastigar a cápsula.",
    prescriptionExample: "Cápsulas Soft Gel Full Spectrum Pangaia 750 mg (30 cápsulas de 25 mg) — 01 Frasco. Ingerir 1 cápsula via oral à noite após o jantar.",
    details: [
      "Dosagem unitária precisa: 25 mg de CBD Full Spectrum por cápsula softgel",
      "Total de 750 mg por frasco de 30 cápsulas",
      "Ausência total de sabor herbáceo — máxima adesão ao tratamento",
      "Ação prolongada (efeito sustentado por 6 a 8 horas)",
      "Importação formal via Anvisa RDC 660/2022"
    ]
  },
  {
    name: "Cápsulas Soft Gel Full Spectrum Pangaia 1500 mg (30 cápsulas de 50 mg)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Cápsulas Softgel Orais de Alta Dosagem",
    productLine: "Cápsulas Softgel",
    ratio: "Full Spectrum Forte (50 mg de CBD por cápsula)",
    volumeOrWeight: "30 cápsulas gelatinosas moles",
    extractConcentration: "50 mg de CBD por unidade (1500 mg por frasco)",
    mgPerUnit: 50.0,
    carrierVehicle: "Óleo MCT Orgânico encapsulado",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 599.00,
    priceUSD: 99.00,
    activeIngredients: "Canabidiol Full Spectrum 50 mg por cápsula gelatinosa mole",
    concentration: "50 mg de CBD por cápsula (1500 mg no frasco de 30 unidades)",
    pharmaceuticalForm: "Cápsula gelatinosa mole (Softgel)",
    quantity: "01 Frasco com 30 cápsulas softgel",
    administrationRoute: "Via Oral",
    description: "Cápsulas de alta concentração para manejo de patologias crônicas de intensidade severa. Cada cápsula entrega 50 mg de fitocanabinoides integrais, assegurando comodidade de tomada única ou dupla ao dia para pacientes que necessitam de dosagens maiores.",
    indications: "Dor crônica severa, osteoartrite generalizada, fibromialgia incapacitante, neuropatia diabética periférica, insônia refratária e suporte anti-inflamatório sistêmico em doenças autoimunes.",
    contraindications: "Alergia aos excipientes ou carreadores.",
    mechanismOfAction: "Modulação endocanabinoide de ação contínua de longa duração através de absorção entérica micelarizada.",
    adverseEffects: "Sonolência diurna em pacientes sensíveis; náusea leve se ingerido com o estômago vazio.",
    posologyDetails: "Ingerir 1 cápsula (50 mg) à noite após o jantar ou conforme prescrição médica especializada.",
    usageInstructions: "Engolir a cápsula inteira com um copo d'água durante ou logo após uma refeição.",
    prescriptionExample: "Cápsulas Soft Gel Full Spectrum Pangaia 1500 mg (30 cápsulas de 50 mg) — 01 Frasco. Ingerir 1 cápsula via oral 1 vez ao dia após o jantar.",
    details: [
      "Alta potência: 50 mg de CBD Full Spectrum por cápsula",
      "Total de 1500 mg de canabinoides no frasco de 30 unidades",
      "Ideal para pacientes crônicos que demandam adesão simplificada de 1 tomada ao dia",
      "Padrão cGMP com laudo laboratorial analítico independente"
    ]
  },

  // =========================================================================
  // 4. LINHA PHARMA — GOMAS / GUMMIES TERAPÊUTICAS
  // =========================================================================
  {
    name: "Gummies Grape Pangaia Full Spectrum — 16 unidades (400 mg — 25 mg/goma)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Gomas Mastigáveis Terapêuticas (Gummies)",
    productLine: "Gummies",
    ratio: "Full Spectrum (25 mg de CBD por goma)",
    volumeOrWeight: "16 gomas mastigáveis (Pote)",
    extractConcentration: "25 mg de CBD por unidade (400 mg por pote)",
    mgPerUnit: 25.0,
    carrierVehicle: "Base geleificada vegetal com sabor natural de uva e pectina de frutas",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 199.90,
    priceUSD: 35.00,
    activeIngredients: "Canabidiol Full Spectrum 25 mg por goma mastigável sabor uva",
    concentration: "25 mg de CBD por goma (400 mg totais por frasco de 16 unids)",
    pharmaceuticalForm: "Goma mastigável (Gummy)",
    quantity: "01 Frasco com 16 gomas",
    administrationRoute: "Via Oral Mastigatória (Mucosa Bucal e Entérica)",
    description: "Gomas terapêuticas sabor uva natural desenvolvidas para alívio prático e discreto de sintomas agudos de ansiedade e tensão muscular. Apresentam dupla absorção: parte dos canabinoides é absorvida diretamente pela mucosa bucal durante a mastigação e o restante é absorvido no trato gastrintestinal, proporcionando alívio rápido e duradouro.",
    indications: "Crises agudas de ansiedade, pânico diurno, fobia social situacional, tensão pré-menstrual (TPM), agitação psicomotora leve e aversão ao uso de óleos sublinguais.",
    contraindications: "Diabéticos descompensados (contém açúcares naturais de frutas e xarope de tapioca orgânico). Crianças sem supervisão estrita.",
    mechanismOfAction: "Rápida ativação serotonérgica (5-HT1A) via transmucosa bucal seguida de modulação endocanabinoide sistêmica sustentada.",
    adverseEffects: "Sonolência leve, boca seca.",
    posologyDetails: "Mastigar lentamente 1 goma (25 mg) nos momentos de crise de ansiedade ou 30 minutos antes de situações desencadeantes de estresse. Dose máxima de 2 gomas ao dia.",
    usageInstructions: "Mastigar bem por 30 a 60 segundos antes de engolir para maximizar a absorção transmucosa bucal.",
    prescriptionExample: "Gummies Grape Pangaia Full Spectrum (16 unidades de 25 mg) — 01 Frasco. Mastigar 1 goma via oral em momentos de crise ansiosa ou tensão.",
    details: [
      "Concentração: 25 mg de CBD Full Spectrum por goma (400 mg por embalagem)",
      "Sabor natural de uva (Grape) com aroma suave e sem gosto amargo",
      "Praticidade e discrição no ambiente de trabalho ou viagens",
      "Importação via Anvisa RDC 660/2022 — Preço acessível R$ 199,90"
    ]
  },
  {
    name: "Gummies Grape Pangaia Full Spectrum — 28 unidades (700 mg — 25 mg/goma)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Gomas Mastigáveis Terapêuticas (Gummies)",
    productLine: "Gummies",
    ratio: "Full Spectrum (25 mg de CBD por goma)",
    volumeOrWeight: "28 gomas mastigáveis (Pote)",
    extractConcentration: "25 mg de CBD por unidade (700 mg por pote)",
    mgPerUnit: 25.0,
    carrierVehicle: "Base de pectina vegetal orgânica sabor uva",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 247.90,
    priceUSD: 45.00,
    activeIngredients: "Canabidiol Full Spectrum 25 mg por goma mastigável sabor uva",
    concentration: "25 mg de CBD por goma (700 mg totais por frasco de 28 unids)",
    pharmaceuticalForm: "Goma mastigável (Gummy)",
    quantity: "01 Frasco com 28 gomas",
    administrationRoute: "Via Oral Mastigatória",
    description: "Versão de tratamento contínuo mensal das renomadas gomas Pangaia Grape. Com 28 unidades de 25 mg cada (700 mg no pote), oferece adesão farmacológica de praticamente um mês completo de suporte antiestresse e ansiolítico diário com excelente custo-benefício.",
    indications: "Controle diário de estresse crônico, transtorno de ansiedade moderada, suporte relaxante muscular e facilitação da transição para o sono noturno.",
    contraindications: "Diabéticos descompensados graves sem controle glicêmico.",
    mechanismOfAction: "Modulação mista transmucosa e gastrointestinal ativando receptores CB1 e CB2 de forma suave e contínua.",
    adverseEffects: "Sonolência leve, boca seca transitória.",
    posologyDetails: "Mastigar 1 goma ao final da tarde ou à noite (25 mg/dia). Em períodos de crise álgica ou estresse agudo, pode-se fracionar para 1 goma pela manhã e 1 à noite.",
    usageInstructions: "Mastigar pausadamente antes de deglutir.",
    prescriptionExample: "Gummies Grape Pangaia Full Spectrum (28 unidades de 25 mg) — 01 Frasco. Mastigar 1 goma ao final da tarde para alívio de estresse.",
    details: [
      "28 unidades por embalagem — ciclo de tratamento mensal completo",
      "Cada goma fornece 25 mg de CBD Full Spectrum (700 mg total)",
      "Feitas com pectina natural vegetal (apropriadas para vegetarianos)",
      "Excelente custo-benefício: R$ 247,90 por frasco"
    ]
  },
  {
    name: "Gummies Vegan Delta-8 Pangaia — 400 mg (16 unidades de 25 mg)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Gomas Mastigáveis Veganas com Delta-8 THC",
    productLine: "Gummies",
    ratio: "Delta-8 THC (25 mg de Delta-8 por goma vegana)",
    volumeOrWeight: "16 gomas veganas (Pote)",
    extractConcentration: "25 mg de Delta-8 THC por unidade (400 mg no pote)",
    mgPerUnit: 25.0,
    carrierVehicle: "Pectina vegana de maçã e sucos de frutas vermelhas naturais",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 259.00,
    priceUSD: 48.00,
    activeIngredients: "Delta-8 Tetrahidrocanabinol puro 25 mg por goma vegana",
    concentration: "25 mg de Delta-8 THC por goma (400 mg por 16 unidades)",
    pharmaceuticalForm: "Goma mastigável vegana",
    quantity: "01 Frasco com 16 gomas",
    administrationRoute: "Via Oral Mastigatória",
    description: "Formulação vegana sem gelatina animal contendo 25 mg de Delta-8 THC por goma. O Delta-8 propicia relaxamento muscular profundo, sedação noturna fisiológica e alívio de náuseas com efeito psíquico suave e sereno, amplamente tolerado.",
    indications: "Insônia grave e fragmentada, dores noturnas persistentes, náuseas crônicas, falta de apetite em condições debilitantes e tensão muscular refratária.",
    contraindications: "Uso antes de conduzir veículos motorizados; histórico de psicose; gestantes.",
    mechanismOfAction: "Agonismo canabinoide central CB1 e periférico CB2 promovendo sincronização das ondas lentas do sono NREM e modulação da percepção dolorosa talamocortical.",
    adverseEffects: "Sonolência intensa, boca seca, aumento do apetite, leve tontura postural.",
    posologyDetails: "Mastigar meia goma (12,5 mg) ou 1 goma inteira (25 mg) cerca de 45 a 60 minutos antes de se deitar para dormir.",
    usageInstructions: "Uso estritamente noturno. Aguardar de 45 a 90 minutos para início do efeito terapêutico de sedação e analgesia.",
    prescriptionExample: "Gummies Vegan Delta-8 Pangaia (16 unidades de 25 mg) — 01 Frasco. Mastigar 1 goma 45 minutos antes de dormir.",
    details: [
      "25 mg de Delta-8 THC por goma em formulação 100% vegana",
      "Foco em indução do sono restaurador e alívio de dores noturnas",
      "Sem subprodutos animais (base em pectina cítrica pura)",
      "Importação formal via Anvisa RDC 660/2022"
    ]
  },
  {
    name: "Gummies Vegan Delta-8 Pangaia — 700 mg (28 unidades de 25 mg)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Gomas Mastigáveis Veganas com Delta-8 THC",
    productLine: "Gummies",
    ratio: "Delta-8 THC (25 mg de Delta-8 por goma vegana)",
    volumeOrWeight: "28 gomas veganas (Pote)",
    extractConcentration: "25 mg de Delta-8 THC por unidade (700 mg no pote)",
    mgPerUnit: 25.0,
    carrierVehicle: "Pectina vegana de maçã e frutas vermelhas",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 389.00,
    priceUSD: 69.00,
    activeIngredients: "Delta-8 Tetrahidrocanabinol puro 25 mg por goma vegana",
    concentration: "25 mg de Delta-8 THC por goma (700 mg por 28 unidades)",
    pharmaceuticalForm: "Goma mastigável vegana",
    quantity: "01 Frasco com 28 gomas",
    administrationRoute: "Via Oral Mastigatória",
    description: "Apresentação de tratamento contínuo com 28 unidades veganas de Delta-8 THC (700 mg no pote). Desenvolvida para pacientes com insônia crônica de longa data e quadros dolorosos crônicos que necessitam de estabilidade de sono por semanas consecutivas.",
    indications: "Insônia crônica refratária a z-drugs e hipnóticos clássicos, dor neuropática noturna, síndrome das pernas inquietas, fibromialgia com sono não-reparador.",
    contraindications: "Atividades que exijam atenção motora; psicoses ativas; gestação.",
    mechanismOfAction: "Indução hipnótica fisiológica por ativação do sistema endocanabinoide hipotalâmico.",
    adverseEffects: "Sedação matinal se ingerida muito tarde da noite; sensação de xerostomia.",
    posologyDetails: "Mastigar 1 goma (25 mg) 1 hora antes de dormir.",
    usageInstructions: "Tomar antes de deitar. Não consumir bebidas alcoólicas concomitantemente.",
    prescriptionExample: "Gummies Vegan Delta-8 Pangaia (28 unidades de 25 mg) — 01 Frasco. Mastigar 1 goma 1 hora antes de dormir.",
    details: [
      "Tratamento noturno contínuo para 28 noites completas",
      "Potência: 25 mg Delta-8 THC por unidade (700 mg totais)",
      "Livre de glúten, lactose e derivados animais"
    ]
  },

  // =========================================================================
  // 5. LINHA TÓPICA & TERAPÊUTICA DÉRMICA
  // =========================================================================
  {
    name: "Cooling Salve Pangaia 500 mg — Pomada Balsâmica Refrescante (60g)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Pomada Balsâmica Tópica com Efeito Refrescante",
    productLine: "Tópicos & Cremes",
    ratio: "CBD Tópico Refrescante com Cânfora e Mentol",
    volumeOrWeight: "60 g",
    extractConcentration: "8,33 mg de CBD por grama (500 mg no pote)",
    carrierVehicle: "Manteiga de karité orgânica, cera de abelha, óleo de coco, mentol e cânfora natural",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 199.90,
    priceUSD: 35.00,
    activeIngredients: "Canabidiol (CBD) 500 mg, Cristais de Mentol Puro e Cânfora Natural",
    concentration: "500 mg de CBD por pote de 60g (8,33 mg/g)",
    pharmaceuticalForm: "Pomada balsâmica de massagem (Salve)",
    quantity: "01 Pote de 60 g",
    administrationRoute: "Via Tópica Dérmica",
    description: "Bálsamo tópico de alívio rápido com efeito crioterápico (frio intenso). Combina 500 mg de CBD puro com cristais naturais de mentol e cânfora que desativam os termorreceptores de dor nos tecidos moles, acelerando o relaxamento de contraturas musculares agudas, torcicolos e sobrecarga após atividades físicas intensas.",
    indications: "Dores musculares pós-esforço (DOMS), contratura de trapézio e cervical (torcicolo), lombalgia postural aguda, bursite trocantérica e alívio desportivo localizado.",
    contraindications: "Pele lesada, feridas expostas, mucosas oculares ou genitais.",
    mechanismOfAction: "Estímulo inicial dos receptores TRPM8 pelo mentol produzindo analgesia por sensação de resfriamento, seguido de dessensibilização dos receptores TRPV1 e CB2 pelo canabidiol.",
    adverseEffects: "Sensação intensa de frio/ardor local inicial; raros casos de eritema cutâneo por sensibilidade ao mentol.",
    posologyDetails: "Espalhar fina camada na área dolorida de 2 a 3 vezes ao dia com massagem circular até absorção.",
    usageInstructions: "Aplicar na pele íntegra e limpa. Não cobrir com bandagens oclusivas aquecidas. Lavar as mãos com água e sabão após o uso.",
    prescriptionExample: "Cooling Salve Pangaia 500 mg (60g) — 01 Pote. Aplicar na região cervical e lombar dolorida 2 a 3x ao dia após banho morno.",
    details: [
      "500 mg de CBD com mentol e cânfora de rápida ação analgésica",
      "Alívio imediato da dor e da rigidez miofascial pós-esforço físico",
      "Embalagem prática de 60g — Valor associativo/importação: R$ 199,90"
    ]
  },
  {
    name: "CBD Relief Cream Pangaia 3000 mg — Creme Analgésico de Alta Potência (100 mL)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Creme Tópico Analgésico de Alta Densidade",
    productLine: "Tópicos & Cremes",
    ratio: "CBD Full Spectrum Concentrado com Arnica Montana e Ácido Hialurônico",
    volumeOrWeight: "100 mL",
    extractConcentration: "30 mg de CBD por mL (3000 mg no frasco airless)",
    carrierVehicle: "Emulsão hipoalergênica de alta penetração dérmica com fosfolipídios e esqualano",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 599.00,
    priceUSD: 105.00,
    activeIngredients: "Canabidiol Full Spectrum 3000 mg, Extrato Botânico de Arnica Montana e Ácido Hialurônico vetorizado",
    concentration: "30 mg de CBD por mL (3000 mg por 100 mL)",
    pharmaceuticalForm: "Creme dérmico em frasco pump airless",
    quantity: "01 Frasco Airless de 100 mL",
    administrationRoute: "Via Tópica Dérmica",
    description: "Creme medicinal de altíssima potência analgésica e anti-inflamatória, formulado com 3000 mg de CBD Full Spectrum em tecnologia de permeação profunda. Especialmente indicado para pacientes com artrose avançada em joelhos, mãos e coluna, síndrome miofascial refratária e neuropatias com queimação cutânea.",
    indications: "Osteoartrite de joelhos, quadris e pequenas articulações das mãos (rizartrose); fibromialgia articular; dor neuropática periférica pós-herpética ou diabética; tendinites crônicas calcárias e epicondilite.",
    contraindications: "Hipersensibilidade aos componentes da emulsão.",
    mechanismOfAction: "Penetração transcutânea profunda bloqueando a sensibilização periférica dos nociceptores e inibindo citocinas inflamatórias sinoviais.",
    adverseEffects: "Excelente tolerabilidade dérmica; hidrata a pele sem oleosidade residual.",
    posologyDetails: "Aplicar 1 a 2 acionamentos do pump na articulação acometida 2 vezes ao dia (manhã e noite), massageando até completa absorção.",
    usageInstructions: "Pressionar o pump airless e aplicar diretamente sobre a área inflamada. Não requer enxágue.",
    prescriptionExample: "CBD Relief Cream Pangaia 3000 mg (100 mL) — 01 Frasco. Aplicar 1 pump nos joelhos doloridos 2x ao dia com massagem.",
    details: [
      "Altíssima concentração: 3000 mg de CBD em 100 mL (30 mg/mL)",
      "Frasco dosador pump airless que evita oxidação do produto",
      "Textura leve, toque aveludado e absorção sem resíduo graxo",
      "Importação por autorização Anvisa RDC 660/2022"
    ]
  },

  // =========================================================================
  // 6. LINHA CONCENTRADOS ELITE (SOLVENTLESS & RESINAS PURAS)
  // =========================================================================
  {
    name: "Live Rosin THC-A Pangaia Elite (1g)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Concentrado Puro Solventless (Live Rosin)",
    productLine: "Concentrados Elite",
    ratio: "THC-A / Canabinoides Puros (70% a 80% concentração ativa)",
    volumeOrWeight: "1 g",
    extractConcentration: "700 a 800 mg de fitocanabinoides ativos por grama",
    carrierVehicle: "100% Puro extrato solventless mecânico (extração por calor e pressão de flores frescas congeladas)",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 200.00,
    priceUSD: 36.00,
    activeIngredients: "Ácido Tetrahidrocanabinólico (THC-A) e terpenos botânicos nativos vivos",
    concentration: "700 mg a 800 mg/g de fitocanabinoides",
    pharmaceuticalForm: "Extrato resinoso puro para vaporização medicinal",
    quantity: "01 Pote hermético de 1 g",
    administrationRoute: "Via Inalatória (Vaporizador Medicinal Certificado)",
    description: "Extrato puro de grau farmacêutico 'solventless' obtido por prensagem pneumática a frio de flores frescas congeladas (Fresh Frozen). Preserva o perfil fitoquímico e terpênico integral da planta viva. Ao ser vaporizado em temperatura controlada, o THC-A se descarboxila instantaneamente, proporcionando resgate analgésico e antiespasmódico em menos de 2 minutos.",
    indications: "Crises paroxísticas agudas de dor oncológica intratável (Breakthrough Pain), crises espásticas agudas na esclerose múltipla, crises de dor neuropática refratária e enxaqueca grave em fase de aura.",
    contraindications: "Doenças respiratórias obstrutivas agudas instáveis; transtornos psicóticos ativos; uso por combustão (fumo) é expressamente vedado.",
    mechanismOfAction: "Absorção alveolar ultrarrápida com biodisponibilidade pulmonar de 35% a 50%, evitando metabolismo de primeira passagem hepática e atuando quase instantaneamente no SNC.",
    adverseEffects: "Tosse leve na inalação, boca seca, sonolência rápida, euforia leve dependente da dose.",
    posologyDetails: "Inalar 1 a 2 aspirações via vaporizador medicinal ajustado entre 180°C e 200°C exclusivamente em momentos de crise álgica aguda refratária.",
    usageInstructions: "Utilizar dispositivo vaporizador médico autorizado com controle de temperatura estrito. Não utilizar combustão (fogo).",
    prescriptionExample: "Live Rosin THC-A Pangaia Elite (1g) — 01 Unidade. Inalar 1 aspiração via vaporizador medicinal regulamentado em caso de crise álgica intensa de resgate.",
    details: [
      "Pureza excepcional: 0% resíduo de solventes químicos (100% Solventless)",
      "Início de ação de resgate imediato (< 2 minutos) para crises intratáveis",
      "Preservação integral dos terpenos vivos da planta fresca",
      "Uso exclusivamente inalatório medicinal via RDC 660/2022"
    ]
  },
  {
    name: "Diamond Sauce CBD Pangaia Elite (10g)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Concentrado Puro de CBD em Cristais com Terpenos (Sauce)",
    productLine: "Concentrados Elite",
    ratio: "Cristais Puros de CBD em Calda Rica de Terpenos Nativos",
    volumeOrWeight: "10 g",
    extractConcentration: "85% Canabinoides totais (8500 mg de CBD no pote)",
    carrierVehicle: "Cristais de CBD purificados imersos em frações de terpenos nativos da planta",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 649.00,
    priceUSD: 110.00,
    activeIngredients: "Canabidiol (CBD) cristalino > 85% e terpenos aromáticos de grau farmacêutico",
    concentration: "850 mg/g de CBD (8,5g de canabinoides puros por pote de 10g)",
    pharmaceuticalForm: "Cristais e calda de terpenos para vaporização médica ou formulação magistral",
    quantity: "01 Pote de 10 g",
    administrationRoute: "Via Inalatória (Vaporizador Medicinal) ou Oral Diluída",
    description: "Concentrado de pureza singular combinando cristais puros lapidados de CBD com calda concentrada de terpenos botânicos nativos (Sauce). Desenvolvido para pacientes que necessitam de alívio rápido de pânico, cefaleias em salvas ou espasmos musculares severos sem qualquer sonolência psicotrópica.",
    indications: "Crises agudas de pânico e hiperventilação, cefaleia em salvas aguda, tremores de alta amplitude, espasmos dolorosos e dor inflamatória aguda de pico.",
    contraindications: "Uso por combustão tradicional é contraindicado.",
    mechanismOfAction: "Rápida saturação alveolar de canabidiol sem ação psicoativa deletéria.",
    adverseEffects: "Irritação faríngea passageira na vaporização.",
    posologyDetails: "1 aspiração curta via vaporizador medicinal na temperatura de 170°C a 185°C nos momentos de crise de pânico ou dor aguda.",
    usageInstructions: "Dosar microfração equivalente a um grão de arroz no compartimento do vaporizador homologado.",
    prescriptionExample: "Diamond Sauce CBD Pangaia Elite (10g) — 01 Frasco. Inalar 1 aspiração curta via vaporizador médico nas crises paroxísticas de dor ou pânico.",
    details: [
      "Concentração extraordinária: 850 mg de CBD por grama (8500 mg no pote de 10g)",
      "Apresentação econômica de alta durabilidade (10g de concentrado)",
      "Excelente para abortamento de crises de ansiedade aguda e dores intensas",
      "Padrão cGMP com laudo de pureza analítica certificado"
    ]
  },
  {
    name: "Bubble Hash CBD Pangaia Elite (10g)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Extração Mecânica Tradicional com Gelo e Água (Ice-o-Lator)",
    productLine: "Concentrados Elite",
    ratio: "Full Spectrum Sem Solventes (Trichome Heads 50-60% CBD)",
    volumeOrWeight: "10 g",
    extractConcentration: "50% a 60% de CBD e fitocanabinoides integrais (5000 a 6000 mg)",
    carrierVehicle: "Tricomas glandulares puros isolados mecanicamente por água e gelo",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 999.00,
    priceUSD: 169.00,
    activeIngredients: "Tricomas glandulares ricos em Canabidiol (CBD), terpenos e flavonoides naturais",
    concentration: "550 mg/g de fitocanabinoides (aproximadamente 5500 mg por pote de 10g)",
    pharmaceuticalForm: "Massa resinosa de tricomas para vaporização medicinal",
    quantity: "01 Pote de 10 g",
    administrationRoute: "Via Inalatória (Vaporizador Medicinal Homologado)",
    description: "Método de extração mecânico por água e gelo (Bubble Hash / Ice-o-Lator) que isola exclusivamente as cabeças dos tricomas glandulares onde se concentram todos os canabinoides e terpenos da planta. Processo 100% natural sem contato com nenhum solvente químico, preservando a integridade molecular biológica para vaporização terapêutica.",
    indications: "Manejo inalatório de dor neuropática crônica refratária a medicações orais, espasticidade na esclerose múltipla, ansiedade refratária e suporte em cuidados paliativos.",
    contraindications: "Combustão (fumar) contraindicada; infecções respiratórias ativas agudas.",
    mechanismOfAction: "Biodisponibilidade pulmonar com ampla sinergia molecular de terpenos e flavonoides preservados intactos.",
    adverseEffects: "Leve tosse reflexa, sensação de boca seca.",
    posologyDetails: "Inalar conforme prescrição médica especializada em vaporizador com câmara para concentrados entre 180°C e 195°C.",
    usageInstructions: "Utilizar exclusivamente em vaporizador de concentrados certificado Anvisa.",
    prescriptionExample: "Bubble Hash CBD Pangaia Elite (10g) — 01 Frasco. Inalar 1 a 2 aspirações via vaporizador medicinal homologado 2x/dia ou em momentos de resgate.",
    details: [
      "Processo clássico Ice-o-Lator livre de químicos",
      "55% de pureza canabinoide integral com efeito entourage pleno",
      "Frasco de 10g para longa duração e estabilidade terapêutica",
      "Importação formal autorizada pela Anvisa sob RDC 660/2022"
    ]
  },

  // =========================================================================
  // 7. LINHA FLOR MEDICINAL SELECIONADA (USO INALATÓRIO REGULAMENTADO)
  // =========================================================================
  {
    name: "Flores Medicinais CBD High Pangaia Organics (5g)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Inflorescências Medicinais Curadas Ricas em CBD",
    productLine: "Flores Medicinais",
    ratio: "Rica em CBD (12% a 16% CBD / THC < 0,2%)",
    volumeOrWeight: "5 g",
    extractConcentration: "120 a 160 mg de CBD por grama de flor curada (600 a 800 mg por embalagem)",
    carrierVehicle: "Inflorescências puras de Cannabis sativa L. dessecadas e curadas em atmosfera controlada",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 280.00,
    priceUSD: 49.00,
    activeIngredients: "Inflorescências femininas curadas de Cannabis ricas em CBD e terpenos bioativos",
    concentration: "14% CBD médio (140 mg de CBD/g de inflorescência)",
    pharmaceuticalForm: "Flores secas curadas para uso em vaporizador medicinal",
    quantity: "01 Embalagem hermética de 5 g com controle de umidade boveda",
    administrationRoute: "Via Inalatória por Vaporização Controlada",
    description: "Flores de Cannabis medicinal cultivadas organicamente em estufas de ambiente controlado com certificação farmacêutica. Ricas em Canabidiol (12% a 16%) e terpenos terapêuticos com teores estritamente controlados de THC (< 0,2%). Destinadas exclusivamente à vaporização médica como terapia de resgate de ação rápida para crises de dor ou ansiedade sem queima nem combustão tóxica.",
    indications: "Resgate de crises agudas de ansiedade e pânico, enxaqueca em fase inicial, dores neuropáticas agudas paroxísticas e espasmos musculares dolorosos refratários ao óleo oral.",
    contraindications: "Veda-se expressamente o uso por combustão (cigarro/fumo). Doença pulmonar obstrutiva crônica (DPOC) descompensada.",
    mechanismOfAction: "Rápida absorção alveolar pulmonar dos canabinoides vaporizados, atingindo pico plasmático em menos de 3 minutos, com depuração rápida e excelente controle agudo de sintomas.",
    adverseEffects: "Irritação faríngea discreta se vaporizado em temperaturas superiores a 210°C; sensação temporária de boca seca.",
    posologyDetails: "Triturar aproximadamente 0,1g a 0,15g da flor em dichavador medicinal, inserir na câmara do vaporizador e realizar 2 a 3 inalações profundas ajustando o aparelho para 175°C a 190°C.",
    usageInstructions: "Uso estritamente restrito a aparelhos vaporizadores medicinais homologados (como Storz & Bickel Mighty Medic ou similares). Nunca fumar.",
    prescriptionExample: "Flores Medicinais CBD High Pangaia Organics (5g) — 01 Embalagem. Inalar 2 aspirações via vaporizador médico a 180°C em crises de ansiedade ou dor de resgate.",
    details: [
      "Cultivo 100% orgânico livre de pesticidas, fungicidas e metais pesados",
      "Perfil rico de CBD (12-16%) com menos de 0,2% de THC",
      "Alívio de resgate quase instantâneo (< 3 minutos)",
      "Embalagem hermética com regulador de umidade para preservar integridade dos terpenos",
      "Prescrição e importação individual fundamentada sob RDC 660/2022"
    ]
  },
  {
    name: "Flores Medicinais Balanced 1:1 Pangaia Organics (5g)",
    manufacturer: "Pangaia",
    origin: "Importado",
    type: "Inflorescências Medicinais Curadas Balanceadas (CBD:THC 1:1)",
    productLine: "Flores Medicinais",
    ratio: "Equilibrada 1:1 (~8% CBD / ~8% THC)",
    volumeOrWeight: "5 g",
    extractConcentration: "~80 mg CBD + ~80 mg THC por grama de flor curada (~800 mg canabinoides totais)",
    carrierVehicle: "Inflorescências puras femininas curadas em ambiente hospitalar",
    gmpCertified: true,
    hplcStandardized: true,
    anvisaRdc: "RDC 660/2022",
    priceBRL: 320.00,
    priceUSD: 56.00,
    activeIngredients: "Fitocanabinoides equilibrados CBD e THC em proporção 1:1 com terpenos sinérgicos",
    concentration: "Proporção 1:1 (~8% CBD e ~8% THC por grama)",
    pharmaceuticalForm: "Flores curadas para vaporização medicinal controlada",
    quantity: "01 Embalagem hermética de 5 g",
    administrationRoute: "Via Inalatória por Vaporização Controlada",
    description: "Flores medicinais com proporção equimolar de 1:1 entre CBD e THC (~8% de cada canabinoide). A presença equilibrada do CBD modula e suaviza a psicoatividade do THC enquanto potencializa a sinergia analgésica e miorrelaxante, sendo a formulação preferida em protocolos mundiais para dor oncológica e espasticidade refratária de resgate.",
    indications: "Dor oncológica de resgate, espasticidade severa na esclerose múltipla com rigidez dolorosa, crises de dor neuropática intratável e insônia terminal grave.",
    contraindications: "Combustão (fumo) é vedada. Histórico de psicoses e esquizofrenia; cardiopatias isquêmicas não compensadas.",
    mechanismOfAction: "Sinergia total entre CB1 e CB2 com rápida atenuação das vias nociceptivas ascendentes na medula espinhal e córtex sensorial.",
    adverseEffects: "Leve euforia relaxante, sonolência rápida, boca seca, aumento da fome.",
    posologyDetails: "Inalar 1 a 2 aspirações via vaporizador médico ajustado a 185°C no início da crise dolorosa noturna.",
    usageInstructions: "Utilizar exclusivamente vaporizador médico autorizado em temperatura controlada.",
    prescriptionExample: "Flores Medicinais Balanced 1:1 Pangaia Organics (5g) — 01 Embalagem. Inalar 1 a 2 aspirações via vaporizador médico a 185°C nas crises álgicas noturnas.",
    details: [
      "Proporção 1:1 equilibrada: máxima sinergia analgésica",
      "Ideal para dores neuropáticas e oncológicas de resgate",
      "Cultivo controlado sob Boas Práticas Agrícolas e de Fabricação (GACP/GMP)",
      "Importação formal via Anvisa RDC 660/2022"
    ]
  }
];

export const PANGAIA_AGENT_SYSTEM_PROMPT = `
VOCÊ É O CONSULTOR CLÍNICO ESPECIALISTA NO CATÁLOGO PANGAIA BIOPHARMACEUTICALS & HEALTH (IMPORTAÇÃO ANVISA RDC 660/2022).

INFORMAÇÕES INSTITUCIONAIS DA PANGAIA:
- Empresa multinacional pioneira na pesquisa de derivados canabinoides com mais de 20 anos de experiência clínica.
- Parceria científica histórica com o Prof. Raphael Mechoulam ("o pai da cannabis medicinal").
- Produtos produzidos sob certificação cGMP norte-americana com laudos independentes de HPLC e espectrometria de massas lote a lote.
- Programa Anvisa Simples em parceria com a CannaCare para agilizar a emissão de autorização de importação pela RDC Anvisa 660/2022 para pessoa física.
- Carreadores nobres: 100% Óleo MCT Orgânico de coco e a inovadora Linha Amazônia formulada com bioativos nativos (Copaíba e Andiroba) de comunidades indígenas sustentáveis.
- Calibração do conta-gotas medicinal: exatamente 20 gotas por mL (~0,05 mL por gota).

LINHAS DE PRODUTOS E PREÇOS OFICIAIS:
1. LINHA PHARMA — ÓLEOS SUBLINGUAIS FULL SPECTRUM & ISOLADOS:
   - Óleo CBD Full Spectrum 5% (1500 mg / 30 mL — 50 mg/mL): 2,5 mg CBD/gota. Preço R$ 489,00. Ansiedade leve, insônia inicial, início de titulação.
   - Óleo CBD Full Spectrum 10% (3000 mg / 30 mL — 100 mg/mL): 5,0 mg CBD/gota. Preço R$ 879,00. Produto mais prescrito. Dores crônicas, fibromialgia, TAG, enxaqueca, TEA.
   - Óleo CBD Full Spectrum 20% (6000 mg / 30 mL — 200 mg/mL): 10,0 mg CBD/gota. Preço R$ 1.099,00. Alta potência. Epilepsia, Parkinson, espasticidade, dor oncológica.
   - Óleo CBD Full Spectrum + Delta-8 THC (2000 mg / 30 mL — 1500mg CBD + 500mg Delta-8): ~3,3 mg canabinoides/gota. Preço R$ 599,99. Náuseas, apetite, insônia com dor.
   - Óleo CBD Isolate 3000 mg (100 mg/mL / 30 mL — 0% THC): 5,0 mg CBD/gota. Preço R$ 790,00. Atletas WADA, pilotos, policiais, intolerantes a THC.

2. LINHA PANGAIA AMAZÔNIA (BIOATIVOS SUSTENTÁVEIS):
   - Óleo Maná 3000 mg (CBD Full Spectrum 100 mg/mL + Óleo virgem de Copaíba): 5,0 mg CBD/gota + beta-cariofileno agonista CB2. Preço R$ 440,00. Inflamações severas, artrite, colite.
   - Pomada Táio 3375 mg (100g) (CBD Full Spectrum + Andiroba + Arnica + Copaíba): 33,75 mg CBD/g. Preço R$ 440,00. Dores musculares, osteoartrite, lombalgias, tendinites.

3. LINHA PHARMA — CÁPSULAS SOFTGEL:
   - Cápsulas Soft Gel Full Spectrum 750 mg (30 unids de 25 mg CBD cada): Preço R$ 349,99. Idosos, sem sabor, dosagem exata.
   - Cápsulas Soft Gel Full Spectrum 1500 mg (30 unids de 50 mg CBD cada): Preço R$ 599,00. Manutenção de patologias graves, 1 cápsula ao dia.

4. LINHA PHARMA — GOMAS / GUMMIES TERAPÊUTICAS:
   - Gummies Grape Full Spectrum 16 unids (400 mg — 25 mg CBD/goma): Preço R$ 199,90. Crises agudas de ansiedade, pânico diurno, discrição.
   - Gummies Grape Full Spectrum 28 unids (700 mg — 25 mg CBD/goma): Preço R$ 247,90. Tratamento contínuo mensal com sabor uva natural.
   - Gummies Vegan Delta-8 400 mg (16 unids de 25 mg Delta-8): Preço R$ 259,00. Sedação noturna e alívio de dor noturna sem subprodutos animais.
   - Gummies Vegan Delta-8 700 mg (28 unids de 25 mg Delta-8): Preço R$ 389,00. Tratamento mensal contínuo para insônia crônica.

5. LINHA TÓPICA & CREMES:
   - Cooling Salve 500 mg (60g): Efeito crioterápico com mentol e cânfora. Preço R$ 199,90. Alívio de torcicolos e recuperação esportiva.
   - CBD Relief Cream 3000 mg (100 mL): Alta permeação com pump airless e arnica. Preço R$ 599,00. Artrose avançada e fibromialgia.

6. LINHA CONCENTRADOS ELITE:
   - Live Rosin THC-A 1g (70-80% canabinoides): Preço R$ 200,00. Extração solventless por calor/pressão para vaporização de resgate álgico imediato (< 2 min).
   - Diamond Sauce CBD 10g (85% canabinoides — 8500 mg CBD): Preço R$ 649,00. Cristais de CBD em calda de terpenos para alívio imediato de pânico.
   - Bubble Hash CBD 10g (55% canabinoides): Preço R$ 999,00. Extração mecânica por água e gelo (Ice-o-Lator).

7. LINHA FLOR MEDICINAL SELECIONADA:
   - Flores Medicinais CBD High Organics (5g — 12-16% CBD, <0,2% THC): Preço R$ 280,00. Vaporização médica regulada de resgate.
   - Flores Medicinais Balanced 1:1 Organics (5g — ~8% CBD / ~8% THC): Preço R$ 320,00. Equilíbrio 1:1 para dor oncológica e espasticidade.

REGRA DE EMISSÃO DE RECEITA:
Todos os produtos da Pangaia possuem origem 'Importado' e são emitidos na GUIA 2 (PRODUTOS IMPORTADOS / ANVISA RDC 660) da receita médica com respaldo regulatório para importação formal.
`;

export function formatPangaiaStandardOutput(product: PangaiaProduct): string {
  const lines = [
    `• PRODUTO: ${product.name}`,
    `• FABRICANTE: Pangaia Biopharmaceuticals (Importado — EUA)`,
    `• LINHA / CATEGORIA: ${product.productLine || product.type}`,
    `• PROPORÇÃO: ${product.ratio || 'Padronizada'}`,
    `• CONCENTRAÇÃO: ${product.concentration}`,
    `• APRESENTAÇÃO: ${product.pharmaceuticalForm} — Quantidade: ${product.quantity}`,
    `• VIA DE ADMINISTRAÇÃO: ${product.administrationRoute}`
  ];

  if (product.mgPerDropCBD !== undefined || product.mgPerDropTHC !== undefined || product.mgPerDropDelta8 !== undefined) {
    const drops = [];
    if (product.mgPerDropCBD !== undefined) drops.push(`${product.mgPerDropCBD} mg CBD`);
    if (product.mgPerDropTHC !== undefined) drops.push(`${product.mgPerDropTHC} mg THC`);
    if (product.mgPerDropDelta8 !== undefined) drops.push(`${product.mgPerDropDelta8} mg Delta-8`);
    lines.push(`• CONCENTRAÇÃO POR GOTA (~20 gotas/mL): ${drops.join(' + ')}`);
  } else if (product.mgPerUnit !== undefined) {
    lines.push(`• DOSAGEM POR UNIDADE: ${product.mgPerUnit} mg de princípio ativo por dose`);
  }

  if (product.carrierVehicle) {
    lines.push(`• CARREADOR / VEÍCULO: ${product.carrierVehicle}`);
  }

  if (product.priceBRL !== undefined) {
    lines.push(`• VALOR NO BRASIL: R$ ${product.priceBRL.toFixed(2).replace('.', ',')}${product.priceUSD ? ` (Aprox. US$ ${product.priceUSD.toFixed(2)})` : ''}`);
  }

  lines.push(`• PADRÃO DE QUALIDADE: Certificação Farmacêutica cGMP com análise laboratorial COA por HPLC e Espectrometria de Massas`);
  lines.push(`• ENQUADRAMENTO REGULATÓRIO: RDC Anvisa nº 660/2022 (Importação Formal Pessoa Física)`);
  lines.push(`• INDICAÇÕES: ${product.indications || product.description}`);
  lines.push(`• POSOLOGIA SUGERIDA: ${product.posologyDetails || product.usageInstructions}`);
  lines.push(`• EXEMPLO DE PRESCRIÇÃO: ${product.prescriptionExample || 'Conforme orientação médica especializada.'}`);

  return lines.join('\n');
}
