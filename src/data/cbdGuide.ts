export interface CBDProduct {
  name: string;
  manufacturer: string;
  origin: string;
  type: string;
  concentration?: string;
  image?: string;
  details?: string[];
  italicText?: string;
  description?: string;
  priceUSD?: number;
}

export interface CBDCategory {
  id: string;
  title: string;
  description: string;
  dosageGuidance: string;
  products: CBDProduct[];
}

export const cbdGuideData: CBDCategory[] = [
  {
    id: "ansiedade",
    title: "1. ANSIEDADE, ESTRESSE E TRANSTORNOS MENTAIS",
    description: "Produtos com perfil ansiolítico, calmante e regulador do humor. Indicados para ansiedade generalizada, estresse crônico e melhora do humor.",
    dosageGuidance: "Iniciar com doses baixas (ex: 10-15 mg/dia de CBD ou 1/2 goma). Aumentar gradualmente conforme a resposta do paciente.",
    products: [
      {
        name: "GreenBudzCBD CalmVibe CBD 6000mg + Mint",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 80.00,
        image: "https://placehold.co/400x400/3b82f6/ffffff?text=Calm+Vibe",
        details: ["30ml 200mg/ml", "Sabor Menta"],
        description: "Extrato de hemp orgânico feito com CO2 e diluído em óleo MCT + sabor menta. Indicações mais comuns: Ansiedade, Epilepsia, Dor Crônica, Parkinson, Insônia, Autismo, Alzheimer entre outros. Aproximadamente 40 gotas por ML. 5mg por gota."
      },
      {
        name: "GreenBudzCBD Chill Gummies Vibe THC 10mg 1:1 CBD 10mg Watermelon - 30ct",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 39.90,
        details: ["10mg THC + 10mg CBD por goma", "Proporção 1:1", "Sabor Melancia", "30 unidades"],
        description: "Gomas com proporção equilibrada de THC e CBD, excelentes para relaxamento mental e alívio do estresse sem sedação excessiva."
      },
      {
        name: "IgniteCBD by Isospec Health 1200mg:1200mg CBD:CBG - 30ml - Mint",
        manufacturer: "IgniteCBD",
        origin: "Importado",
        type: "Óleo Broad/Full Spectrum",
        priceUSD: 70.00,
        details: ["1200mg CBD + 1200mg CBG", "Sabor Menta", "Frasco 30ml"],
        description: "A combinação de CBD e CBG é excelente para melhorar o humor, reduzir a ansiedade e promover foco e clareza mental."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 1mg THC 2.5mg CBN 10mg CBD per ct Lullaby - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["1mg THC + 2.5mg CBN + 10mg CBD por goma", "Sabor Blueberry", "20 unidades"],
        description: "Fórmula suave focada no relaxamento noturno e redução da ansiedade antes de dormir."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 5mg THC 2.5mg CBD per ct Hibrida BICYCLE DAY - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["5mg THC + 2.5mg CBD por goma", "Cepa Híbrida", "Sabor Raspberry", "20 unidades"],
        description: "Gomas híbridas que promovem um relaxamento equilibrado para o dia a dia."
      },
      {
        name: "GreenBudzCBD Green Crack 700mg 1ml Sativa",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Vape Sativa",
        priceUSD: 45.00,
        details: ["700mg", "1ml", "Cepa Sativa"],
        description: "Vape de cepa Sativa, conhecido por efeitos energizantes e melhora do humor."
      }
    ]
  },
  {
    id: "dor_cronica",
    title: "2. DOR CRÔNICA E INFLAMAÇÃO",
    description: "Produtos com alta concentração de canabinoides para manejo de dores musculares, articulares, neuropáticas e processos inflamatórios.",
    dosageGuidance: "Doses moderadas a altas dependendo da intensidade da dor. Óleos de alta concentração (3000mg+) são recomendados para dores severas.",
    products: [
      {
        name: "GreenBudzCBD Deep Vibe CBD 3000mg + Indica Terps",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        image: "https://placehold.co/400x400/6b21a8/ffffff?text=Deep+Vibe",
        details: ["30ml 100mg/ml", "2.5% blend terpênico", "Mirceno, Linalool, Caryophyllene, Terpinolene"],
        description: "Extrato de hemp orgânico feito com CO2 e diluído em óleo MCT + terpenos. Indicações mais comuns: Insônia, Ansiedade, Estresse, Inflamações, Tensão Muscular, Imunidade entre outros. Aproximadamente 40 gotas por ML. 2,5mg por gota."
      },
      {
        name: "GreenBudzCBD Super Vibe CBD 3000mg + Sativa Terps",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        image: "https://placehold.co/400x400/eab308/ffffff?text=Super+Vibe",
        details: ["30ml 100mg/ml", "2.5% blend terpênico", "Limoneno, Pineno, Caryophyllene, Terpinolene"],
        description: "Extrato de hemp orgânico feito com CO2 e diluído em óleo MCT + terpenos. Indicações mais comuns: Ansiedade, Depressão, Estresse, Inflamações, Tensão Muscular, Broncodilatação entre outros. Aproximadamente 40 gotas por ML. 2,5mg por gota."
      },
      {
        name: "GreenBudzCBD Essentials CBD Full 6000mg 200mg/ml - 30ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 70.00,
        details: ["6000mg Total", "200mg/ml", "Frasco 30ml"],
        description: "Nossa maior concentração de CBD para casos severos de dor e inflamação sistêmica."
      },
      {
        name: "IgniteCBD by Isospec Health 600mg:600mg CBD:THC - 30ml - Hawaiian Punch",
        manufacturer: "IgniteCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        details: ["600mg CBD + 600mg THC", "Proporção 1:1", "Sabor Hawaiian Punch", "Frasco 30ml"],
        description: "A proporção 1:1 de CBD e THC é considerada o padrão ouro para o tratamento de dores crônicas severas e neuropáticas."
      },
      {
        name: "IgniteCBD by Isospec Health 600mg:600mg CBD:THC - 30ml - Mint",
        manufacturer: "IgniteCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        details: ["600mg CBD + 600mg THC", "Proporção 1:1", "Sabor Mint", "Frasco 30ml"],
        description: "A proporção 1:1 de CBD e THC é considerada o padrão ouro para o tratamento de dores crônicas severas e neuropáticas."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 5mg THC 5mg CBN 5mg CBD per ct Nightshade - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["5mg THC + 5mg CBN + 5mg CBD por goma", "Sabor Black Currant", "20 unidades"],
        description: "Combinação tripla de canabinoides excelente para dores noturnas que atrapalham o sono."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 5mg THC per ct Indica 100 SHEEP - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["5mg THC por goma", "Cepa Indica", "Sabor Cherry", "20 unidades"],
        description: "Gomas de cepa Indica, conhecidas por seu efeito relaxante corporal ('body high'), ideal para dores musculares."
      },
      {
        name: "GreenBudz HDCP Kush Mintz 930mg 1ml Hybrid",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Vape Híbrido",
        priceUSD: 45.00,
        details: ["930mg HDCP", "1ml", "Cepa Híbrida"],
        description: "Vape híbrido de alta potência para alívio rápido de dores agudas."
      }
    ]
  },
  {
    id: "insonia",
    title: "3. INSÔNIA E DISTÚRBIOS DO SONO",
    description: "Produtos formulados especificamente com CBN e cepas Indica para induzir o sono, melhorar a qualidade do descanso e tratar a insônia.",
    dosageGuidance: "Administrar 30-60 minutos antes de deitar. Iniciar com doses baixas de CBN/THC.",
    products: [
      {
        name: "IgniteCBD by Isospec Health 1200mg:1200mg CBD:CBN - 30ml - Mint",
        manufacturer: "IgniteCBD",
        origin: "Importado",
        type: "Óleo Broad/Full Spectrum",
        priceUSD: 60.00,
        details: ["1200mg CBD + 1200mg CBN", "Sabor Menta", "Frasco 30ml"],
        description: "O CBN (Canabinol) é conhecido como o canabinoide do sono. Esta fórmula 1:1 com CBD é perfeita para insônia severa."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 1mg THC 2.5mg CBN 10mg CBD per ct Lullaby - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["1mg THC + 2.5mg CBN + 10mg CBD por goma", "Sabor Blueberry", "20 unidades"],
        description: "Gomas 'Lullaby' formuladas com CBN e baixo THC para um sono tranquilo sem efeitos psicoativos fortes."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 5mg THC per ct Indica RIVER FLOAT - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["5mg THC por goma", "Cepa Indica", "Sabor Watermelon", "20 unidades"],
        description: "Gomas de cepa Indica que promovem relaxamento corporal profundo, facilitando o adormecer."
      },
      {
        name: "GreenBudzCBD King Louis XIII 700mg 1ml Indica",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Vape Indica",
        priceUSD: 45.00,
        details: ["700mg", "1ml", "Cepa Indica"],
        description: "Vape de cepa Indica clássica, ideal para uso noturno e indução rápida do sono."
      },
      {
        name: "GreenBudz HDCP - Donny Burger 930mg 1ml Indica",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Vape Indica",
        priceUSD: 45.00,
        details: ["930mg HDCP", "1ml", "Cepa Indica"],
        description: "Vape Indica de alta potência para relaxamento noturno profundo."
      }
    ]
  },
  {
    id: "energia_foco",
    title: "4. ENERGIA, FOCO E METABOLISMO",
    description: "Produtos com THCV, CBG e cepas Sativa, ideais para uso diurno, aumento de energia, foco mental e regulação metabólica.",
    dosageGuidance: "Uso diurno. Iniciar com doses baixas pela manhã ou início da tarde.",
    products: [
      {
        name: "GreenBudzCBD Slim Vibe CBD 1500mg THCv 1500mg",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 120.00,
        image: "https://placehold.co/400x400/22c55e/ffffff?text=Slim+Vibe",
        details: ["30ml 100mg/ml", "Sabor Menta"],
        description: "Extrato de hemp orgânico feito com CO2 e diluído em óleo MCT + sabor menta. Indicações mais comuns: Ansiedade, Compulsão Alimentar, Diabetes Tipo 2, Parkinson, Obesidade entre outros. Aproximadamente 40 gotas por ML. 2,5mg por gota."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 5mg THCV 2.5mg CBG 2.5mg THCA9 per ct Rodeo Queen - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["5mg THCV + 2.5mg CBG + 2.5mg THCA9 por goma", "Sabor Strawberry", "20 unidades"],
        description: "Gomas energizantes com THCV e CBG, perfeitas para um impulso de energia e foco durante o dia."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 2.5mg THC 2.5mg CBG 2.5mg CBD 2.5mg CBC per ct LOOKING GLASS - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["2.5mg de THC, CBG, CBD e CBC por goma", "Sabor Cranberry", "20 unidades"],
        description: "Espectro amplo de canabinoides menores (CBG, CBC) para foco, clareza mental e bem-estar diurno."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 5mg THC per ct Sativa FORMULA ONE - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["5mg THC por goma", "Cepa Sativa", "Sabor Lemon", "20 unidades"],
        description: "Gomas Sativa estimulantes para criatividade e energia."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 5mg THC per ct Sativa BEETHOVEN - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["5mg THC por goma", "Cepa Sativa", "Sabor Orange", "20 unidades"],
        description: "Gomas Sativa para foco e produtividade diurna."
      }
    ]
  },
  {
    id: "concentrados",
    title: "5. CONCENTRADOS E EXTRATOS DE ALTA POTÊNCIA",
    description: "Produtos de altíssima pureza e potência (Crumble, Live Resin, Diamonds, Isolados) para pacientes experientes ou condições severas refratárias.",
    dosageGuidance: "Uso exclusivo para pacientes com alta tolerância ou necessidades clínicas severas. Dosagem em miligramas (mg) precisas.",
    products: [
      {
        name: "GreenBudzCBD Crystalized Hemp Formula THCa 542mg SDICC (Sauce Diamond Ice Cream Cake)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Diamonds)",
        priceUSD: 109.00,
        details: ["Disponível em 5g (10 servings) e 20g (40 servings)", "542mg THCa", "Cepa Ice Cream Cake"],
        description: "Cristais de THCa puros em molho de terpenos (Sauce Diamonds). Altíssima potência."
      },
      {
        name: "GreenBudzCBD Dried Hemp Formula THCa 150mg CBG 8mg DIBM (Dry Ice Nug Blueberry Muffin)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Dry Ice)",
        priceUSD: 70.00,
        details: ["5g (10 servings)", "150mg THCa + 8mg CBG", "Cepa Blueberry Muffin"],
        description: "Extração a seco (Dry Ice) rica em THCa e CBG."
      },
      {
        name: "GreenBudzCBD Dried Hemp Formula THCa 65mg DIDS (Dry Ice dirty sprite)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Dry Ice)",
        priceUSD: 70.00,
        details: ["5g (10 servings)", "65mg THCa", "Cepa Dirty Sprite"],
        description: "Extração a seco (Dry Ice) rica em THCa."
      },
      {
        name: "GreenBudzCBD Dried Hemp Formula THCa 65mg DIPR (Dry Ice Platinum Runtz)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Dry Ice)",
        priceUSD: 70.00,
        details: ["Disponível em 5g e 20g", "65mg THCa", "Cepa Platinum Runtz"],
        description: "Extração a seco (Dry Ice) rica em THCa."
      },
      {
        name: "GreenBudzCBD Granulated Hemp Formula THCa 385mg CBC 61mg CBD 24.5mg (Crumble Blueberry Muffin)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Crumble)",
        priceUSD: 109.00,
        details: ["Disponível em 5g e 20g", "385mg THCa + 61mg CBC + 24.5mg CBD", "Cepa Blueberry Muffin"],
        description: "Crumble granulado com perfil rico em múltiplos canabinoides."
      },
      {
        name: "GreenBudzCBD Granulated Hemp Formula THCa 385mg CBC 61mg CBD 24.5mg (Crumble Chocolate Diesel)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Crumble)",
        priceUSD: 109.00,
        details: ["5g (10 servings)", "385mg THCa + 61mg CBC + 24.5mg CBD", "Cepa Chocolate Diesel"],
        description: "Crumble granulado com perfil rico em múltiplos canabinoides."
      },
      {
        name: "GreenBudzCBD Granulated Hemp Formula THCa 385mg CBC 61mg CBD 24.5mg (Crumble Train Wreck)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Crumble)",
        priceUSD: 109.00,
        details: ["Disponível em 5g e 20g", "385mg THCa + 61mg CBC + 24.5mg CBD", "Cepa Train Wreck"],
        description: "Crumble granulado com perfil rico em múltiplos canabinoides."
      },
      {
        name: "GreenBudzCBD Isolate Hemp Formula CBD 490mg (Crystal de CBD)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Isolado (Cristal)",
        priceUSD: 89.00,
        details: ["Disponível em 5g e 20g", "490mg CBD Isolado"],
        description: "Cristais puros de CBD isolado, sem THC."
      },
      {
        name: "GreenBudzCBD Isolate Hemp Formula THCa 542mg (Crystal de THCa)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Isolado (Cristal)",
        priceUSD: 129.00,
        details: ["Disponível em 5g e 20g", "542mg THCa Isolado"],
        description: "Cristais puros de THCa isolado."
      },
      {
        name: "GreenBudzCBD Stirred Hemp Formula THCa 369mg CBD 104mg CBG 8.5mg (Live Resin Amnesia Haze)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Live Resin)",
        priceUSD: 109.00,
        details: ["5g (10 servings)", "369mg THCa + 104mg CBD + 8.5mg CBG", "Cepa Amnesia Haze"],
        description: "Live Resin preservando o perfil completo de terpenos da planta fresca."
      },
      {
        name: "GreenBudzCBD Stirred Hemp Formula THCa 369mg CBD 104mg CBG 8.5mg (Live Resin Ice Cream Cake)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Live Resin)",
        priceUSD: 109.00,
        details: ["Disponível em 5g e 20g", "369mg THCa + 104mg CBD + 8.5mg CBG", "Cepa Ice Cream Cake"],
        description: "Live Resin preservando o perfil completo de terpenos da planta fresca."
      },
      {
        name: "GreenBudzCBD Stirred Hemp Formula THCa 369mg CBD 104mg CBG 8.5mg (Live Resin Lemon Cake)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Live Resin)",
        priceUSD: 109.00,
        details: ["5g (10 servings)", "369mg THCa + 104mg CBD + 8.5mg CBG", "Cepa Lemon Cake"],
        description: "Live Resin preservando o perfil completo de terpenos da planta fresca."
      },
      {
        name: "GreenBudzCBD Stirred Hemp Formula THCa 369mg CBD 104mg CBG 8.5mg (Live Resin Train Wreck)",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Concentrado (Live Resin)",
        priceUSD: 109.00,
        details: ["Disponível em 5g e 20g", "369mg THCa + 104mg CBD + 8.5mg CBG", "Cepa Train Wreck"],
        description: "Live Resin preservando o perfil completo de terpenos da planta fresca."
      },
      {
        name: "IgniteCBD by Isospec Health - Northern Lights - 2g",
        manufacturer: "IgniteCBD",
        origin: "Importado",
        type: "Concentrado",
        priceUSD: 40.00,
        details: ["2g", "Cepa Northern Lights"],
        description: "Concentrado premium da cepa Northern Lights."
      }
    ]
  },
  {
    id: "bem_estar",
    title: "6. BEM-ESTAR GERAL E MANUTENÇÃO",
    description: "Óleos e gomas de uso diário para manutenção da saúde, imunidade, homeostase e bem-estar geral.",
    dosageGuidance: "Doses de manutenção (10-25 mg/dia). Uso contínuo para melhores resultados.",
    products: [
      {
        name: "GreenBudzCBD Essentials CBD Full 1500mg 50mg/ml - 30ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 40.00,
        details: ["1500mg Total", "50mg/ml", "Frasco 30ml"],
        description: "Óleo de concentração moderada, perfeito para uso diário e manutenção do bem-estar."
      },
      {
        name: "GreenBudzCBD Essentials CBD Full 3000mg 100mg/ml - 30ml",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 50.00,
        details: ["3000mg Total", "100mg/ml", "Frasco 30ml"],
        description: "Óleo de concentração média-alta para suporte diário robusto."
      },
      {
        name: "IgniteCBD by Isospec Health CBD Full Spectrum 3000mg - 30ml - Peppermint",
        manufacturer: "IgniteCBD",
        origin: "Importado",
        type: "Óleo Full Spectrum",
        priceUSD: 60.00,
        details: ["3000mg CBD Total", "Sabor Peppermint", "Frasco 30ml"],
        description: "Óleo de CBD de espectro completo com sabor refrescante de hortelã-pimenta para uso diário."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 5mg THC 10mg CBD per ct Cricket - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["5mg THC + 10mg CBD por goma", "Sabor Blackberry", "20 unidades"],
        description: "Gomas equilibradas para relaxamento leve e bem-estar diário."
      },
      {
        name: "Drops By GreenBudzCBD Gummies 5mg THC per ct Hibrida EVERGREEN - 20ct",
        manufacturer: "DropsCandies",
        origin: "Importado",
        type: "Gomas (Comestível)",
        priceUSD: 25.00,
        details: ["5mg THC por goma", "Cepa Híbrida", "Sabor Lime", "20 unidades"],
        description: "Gomas híbridas versáteis para qualquer momento do dia."
      },
      {
        name: "GreenBudzCBD BubbleGum Gelato",
        manufacturer: "GreenBudzCBD",
        origin: "Importado",
        type: "Flor / Vape",
        priceUSD: 45.00,
        details: ["Disponível em 5g e 20g", "Cepa BubbleGum Gelato"],
        description: "Cepa híbrida popular para relaxamento e bem-estar."
      }
    ]
  }
];
