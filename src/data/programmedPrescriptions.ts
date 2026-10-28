import { PrescriptionItemData } from '../utils/pdfGenerator';
import { enrichMedicationDetails } from './cbdGuide';

export interface ProgrammedPrescriptionProfile {
  id: string;
  name: string;
  conditionTag: 'ansiedade' | 'insonia' | 'depressao' | 'combinado' | 'dor' | 'custom';
  category?: 'nacional' | 'importado';
  badge: string;
  color: string;
  icon: string;
  description: string;
  items: PrescriptionItemData[];
  defaultNotes: string;
}

export const DEFAULT_PROGRAMMED_PROFILES: ProgrammedPrescriptionProfile[] = [
  // ==================== PROTOCOLOS NACIONAIS (ASSOCIAÇÕES BRASILEIRAS) — MODELOS PADRÃO ====================
  {
    id: 'perfil-ansiedade',
    name: 'Ansiedade & Síndrome do Pânico (TAG) — Modelo Salvo Programado',
    conditionTag: 'ansiedade',
    category: 'nacional',
    badge: '⭐ Modelo Salvo • Ansiedade',
    color: 'from-blue-600 via-indigo-600 to-emerald-600',
    icon: 'Brain',
    description: 'Protocolo de referência clínica com Canabidiol Full Spectrum e Broad Spectrum CBD+CBN para controle homeostático e estabilização de ansiedade e pânico.',
    items: [
      {
        name: 'Óleo Integral Predominante CBD 100mg/ml (30ml)',
        brand: 'Associação Brasileira (Nacional)',
        origin: 'Nacional',
        activeIngredients: 'Canabidiol (CBD) Full Spectrum rico em terpenos e fitocanabinoides menores',
        concentration: '100 mg/mL (Total 3.000 mg de CBD Full Spectrum) • Frasco de 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual / Oral',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          '1º ao 5º dia: Iniciar com 03 gotas pela manhã e 03 gotas às 16h (sublingual).',
          '6º ao 10º dia: Aumentar para 05 gotas pela manhã e 05 gotas às 16h.',
          'Manutenção: Aumentar 01 gota por tomada a cada 5 dias até estabilização dos sintomas (dose média de controle: 08 a 12 gotas/dose).',
          'Reter as gotas sob a língua por 60 segundos antes de engolir para absorção máxima.'
        ],
        description: 'Extrato integral rico em CBD com laudo cromatográfico, indicado para modulação da ansiedade e humor.'
      },
      {
        name: 'Broad Spectrum CBD + CBN 1065mg (15ml)',
        brand: 'Associação Nacional (Brasil)',
        origin: 'Nacional',
        activeIngredients: 'Canabidiol (CBD) Broad Spectrum + Canabinol (CBN) - Total 1065mg (0% THC)',
        concentration: 'CBD + CBN 1065mg (71 mg/mL) • Frasco de 15 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 15 mL',
        administrationRoute: 'Via Sublingual / Oral',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Pingar 2 gotas pela manhã e 4 a noite.',
          '- Aumentar 1 gota a cada 7 dias, sendo máximo de 10 gotas por dose.',
          '- Se obtiver melhora dos sintomas em doses mínimas não a necessidade de chegar em dose máxima.'
        ],
        description: 'Extrato Broad Spectrum rico em CBD e CBN (1065mg em 15ml), 0% THC, para sono reparador, alívio tensional e controle de estresse.'
      }
    ],
    defaultNotes: '- Administrar com alimentos gordurosos (preferência, não obrigatório) - podendo aumentar em até 5x a absorção.\n- Se observado sonolência durante o dia após a administração do medicamento, reduzir em 1/3 a dose da manhã e à noite permanecer normal conforme a prescrição.\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos contínuos.\n- Manter o frasco ao abrigo de luz solar direta e fontes de calor excessivo.'
  },
  {
    id: 'perfil-insonia',
    name: 'Insônia & Distúrbios do Sono — Associação Nacional',
    conditionTag: 'insonia',
    category: 'nacional',
    badge: '🇧🇷 Nacional • Insônia / Sono',
    color: 'from-purple-600 to-indigo-800',
    icon: 'Moon',
    description: 'Combinação sinérgica com CBN (Canabinol) e fitocanabinoides noturnos de associações brasileiras para sono REM e ausência de ressaca matinal.',
    items: [
      {
        name: 'CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml (60 mg/mL — 1800mg)',
        brand: 'Associação Nacional (Brasil)',
        origin: 'Nacional',
        activeIngredients: 'Canabidiol (CBD) 40 mg/mL + Canabinol (CBN) 20 mg/mL Full Spectrum',
        concentration: 'CBD 1.200 mg + CBN 600 mg (Total 1.800 mg) • Frasco de 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual Noturna',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Iniciar com 04 a 05 gotas sublinguais 45 a 60 minutos antes de deitar.',
          'Caso haja despertares noturnos frequentes, titular +1 gota a cada 3 dias até atingir sono reparador (dose máxima recomendada: 12 gotas).',
          'Reter sob a língua por 60 segundos antes de deglutir.'
        ],
        description: 'Fórmula especializada para relaxamento psicofísico noturno e consolidação da arquitetura do sono.'
      },
      {
        name: 'Óleo Integral Predominante THC 100mg/ml (30ml)',
        brand: 'Associação Brasileira (Nacional)',
        origin: 'Nacional',
        activeIngredients: 'Tetrahidrocanabinol (THC) Full Spectrum com canabinoides e terpenos mirceno/linalol',
        concentration: '100 mg/mL (Total 3.000 mg) • Frasco de 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual Noturna',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Pingar 02 a 03 gotas 30 minutos antes de deitar.',
          'Titulação lenta: aumentar 01 gota somente se necessário após 5 dias de avaliação clínica.'
        ],
        description: 'Potencializador sedativo noturno para casos de insônia refratária e agitação psicomotora.'
      }
    ],
    defaultNotes: '- Administrar à noite antes de deitar. Evitar dirigir veículos ou operar maquinário perigoso após a tomada do medicamento.\n- Praticar higiene do sono: desligar telas luminosas (celular, TV) pelo menos 45 minutos antes de dormir.\n- Administrar preferencialmente após refeição leve noturna ou lanche com lipídios para melhor biodisponibilidade.\n- Armazenar o produto em temperatura ambiente ao abrigo da luz solar.'
  },
  {
    id: 'perfil-depressao',
    name: 'Depressão, Humor & Vitalidade — Associação Nacional & ABECMED',
    conditionTag: 'depressao',
    category: 'nacional',
    badge: '🇧🇷 Nacional • Depressão / Humor',
    color: 'from-amber-600 to-rose-600',
    icon: 'Sun',
    description: 'Protocolo nacional neuroprotetor com CBG e CBD Full Spectrum para clareza mental e regulação de neurotransmissores sem sedação.',
    items: [
      {
        name: 'Óleo Integral Predominante CBD 100mg/ml (30ml)',
        brand: 'Associação Brasileira (Nacional)',
        origin: 'Nacional',
        activeIngredients: 'Canabidiol (CBD) Full Spectrum com perfil rico em limoneno e pineno',
        concentration: '100 mg/mL (3.000 mg de CBD) • Frasco de 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual / Oral',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          '1º ao 5º dia: Tomar 04 gotas ao acordar e 04 gotas após o almoço.',
          'A partir do 6º dia: Aumentar gradualmente para 06 a 08 gotas 2 vezes ao dia conforme tolerabilidade.',
          'Reter 60 segundos sob a língua antes de engolir.'
        ],
        description: 'Homeostase do humor e redução do estresse oxidativo neuronal.'
      },
      {
        name: 'Óleo ABEC Rico em CBG Lilás 5% (50 mg/mL — 1.500 mg)',
        brand: 'ABECMED (Associação Brasileira)',
        origin: 'Nacional',
        activeIngredients: 'Canabigerol (CBG) 50 mg/mL • Ativador de Foco e Dopamina',
        concentration: 'CBG 50 mg/mL (1.500 mg) • Frasco de 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual Diurna',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Tomar 04 gotas pela manhã junto ao café da manhã para foco mental, clareza e redução de desânimo.',
          'Evitar administração no período noturno para não interferir na indução do sono.'
        ],
        description: 'Modulador de motivação, neurogênese e combate à anedonia.'
      }
    ],
    defaultNotes: '- Administrar preferencialmente pela manhã e início da tarde junto a refeições.\n- Uso contínuo. A melhora clínica do humor e da energia se consolida entre a 2ª e a 4ª semana de tratamento.\n- Tomar com intervalo de 2 horas em relação a outros medicamentos alopáticos.\n- Conservar em local fresco, seco e ao abrigo da luz solar.'
  },
  {
    id: 'perfil-ansiedade-insonia',
    name: 'Ansiedade + Insônia (Protocolo 360°) — Associação Nacional',
    conditionTag: 'combinado',
    category: 'nacional',
    badge: '🇧🇷 Nacional • Ansiedade + Insônia',
    color: 'from-emerald-600 via-teal-600 to-indigo-700',
    icon: 'Sparkles',
    description: 'Protocolo duplo diurno + noturno de associações: modulação da ansiedade durante o dia + relaxamento muscular profundo para o sono à noite.',
    items: [
      {
        name: 'Óleo Integral Predominante CBD 100mg/ml (30ml)',
        brand: 'Associação Brasileira (Nacional)',
        origin: 'Nacional',
        activeIngredients: 'Canabidiol (CBD) Full Spectrum 100 mg/mL',
        concentration: '100 mg/mL (Total 3.000 mg de CBD) • Frasco de 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual Diurna',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Uso Diurno: Tomar 04 gotas ao acordar e 04 gotas às 14h (após o almoço).',
          'Reter sob a língua por 60 segundos antes de engolir para modular ansiedade durante as atividades diárias.'
        ],
        description: 'Regulação do tônus neurovegetativo diurno sem sedação.'
      },
      {
        name: 'CBD + CBN Full Spectrum (CBD 2:1 CBN) - 30ml (60 mg/mL — 1800mg)',
        brand: 'Associação Nacional (Brasil)',
        origin: 'Nacional',
        activeIngredients: 'CBD 40 mg/mL + CBN 20 mg/mL Full Spectrum',
        concentration: 'Total 1.800 mg (CBD 1.200 mg + CBN 600 mg) • Frasco de 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual Noturna',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Uso Noturno: Pingar 05 a 08 gotas 45 minutos antes de dormir.',
          'Manter 60 segundos na mucosa sublingual para induzir relaxamento muscular e sono profundo.'
        ],
        description: 'Consolidação de sono REM e sono reparador sem despertar precoce.'
      }
    ],
    defaultNotes: '- Administrar o óleo diurno (CBD) pela manhã/tarde e o óleo noturno (CBD+CBN) 45 minutos antes de deitar.\n- Administrar preferencialmente com alimentos que contenham gorduras saudáveis para aumentar a biodisponibilidade em até 5x.\n- Evitar dirigir ou operar máquinas após a dose noturna.\n- Manter em temperatura ambiente (15°C a 30°C) e protegido da luz solar.'
  },
  {
    id: 'perfil-dor-cronica',
    name: 'Dor Crônica, Fibromialgia & Rigidez — Associação Nacional',
    conditionTag: 'dor',
    category: 'nacional',
    badge: '🇧🇷 Nacional • Dor & Inflamação',
    color: 'from-rose-600 to-red-700',
    icon: 'Activity',
    description: 'Protocolo balanceado 1:1 THC:CBD com pomada tópica analgésica de associação brasileira para analgesia neuropática e diminuição da dor articular.',
    items: [
      {
        name: 'EQUILIBRADO Full Spectrum (CBD 1:1 THC) - 30ml (60 mg/mL — 1800mg)',
        brand: 'Associação Nacional (Brasil)',
        origin: 'Nacional',
        activeIngredients: 'CBD 30 mg/mL + THC 30 mg/mL (1:1 Ratio Balanceado)',
        concentration: '60 mg/mL (Total 1.800 mg de Canabinoides Ativos) • Frasco de 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual de 12/12h',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          '1º ao 4º dia: Iniciar com 02 gotas de 12 em 12 horas (após café da manhã e após jantar).',
          '5º ao 8º dia: Aumentar para 03 gotas de 12 em 12 horas.',
          'Titulação: Aumentar 01 gota a cada 4 dias até analgesia satisfatória (dose usual de 05 a 08 gotas/dose).'
        ],
        description: 'Sinergia 1:1 comprovada para modulação de dor neuropática, nociceptiva e fibromialgia.'
      },
      {
        name: 'Pomada Canábica Terapêutica 500mg (50g) - Associação Nacional',
        brand: 'Associação Brasileira (Nacional)',
        origin: 'Nacional',
        activeIngredients: 'Canabinoides Totais 500 mg em base lipídica bioativa com arnica e copaíba',
        concentration: '500 mg de Fitocanabinoides em 50 gramas',
        pharmaceuticalForm: 'Pomada Dérmica Tópica',
        quantity: '01 Pote de 50 g',
        administrationRoute: 'Uso Tópico Dérmico',
        posologyHeader: 'Posologia e Modo de Uso:',
        dosage: [
          'Aplicar fina camada sobre a região dolorida ou inflamada 2 a 3 vezes ao dia.',
          'Massagear suavemente em movimentos circulares por 2 minutos até completa penetração dérmica.'
        ],
        description: 'Alívio periférico rápido de dor musculoesquelética, articular e inflamações locais.'
      }
    ],
    defaultNotes: '- Administrar as gotas sublinguais sempre após as refeições.\n- Titulação lenta e individualizada conforme a escala de dor do paciente.\n- A pomada tópica atua localmente nos receptores CB2 periféricos sem efeitos sistêmicos.\n- Evitar contato da pomada com mucosas, olhos ou feridas abertas.'
  },

  // ==================== PROTOCOLOS IMPORTADOS (EUA • ANVISA RDC 660) ====================
  {
    id: 'perfil-pangaia-ansiedade',
    name: 'Pangaia Biopharma EUA — Ansiedade, Foco & Pânico (Importado RDC 660)',
    conditionTag: 'ansiedade',
    category: 'importado',
    badge: '🌐 Importado EUA • Ansiedade',
    color: 'from-sky-600 via-indigo-600 to-purple-700',
    icon: 'Brain',
    description: 'Protocolo internacional padrão ouro com Pangaia Biopharmaceuticals cGMP para controle de TAG, sobrecarga e resgate rápido.',
    items: [
      {
        name: 'Óleo CBD Full Spectrum Pangaia 10% — 3000 mg (30 mL)',
        brand: 'Pangaia Biopharma (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabidiol (CBD) Full Spectrum 100 mg/mL com terpenos bioativos e traços de fitocanabinoides menores (CBG, CBN, CBC)',
        concentration: '100 mg/mL de CBD (3.000 mg por frasco de 30 mL) • 5,0 mg CBD por gota',
        pharmaceuticalForm: 'Óleo sublingual em gotas',
        quantity: '01 Frasco de 30 mL com conta-gotas graduado',
        administrationRoute: 'Via Sublingual',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          '1º ao 4º dia: Iniciar com 03 gotas pela manhã e 03 gotas às 16h (sublingual).',
          '5º ao 8º dia: Aumentar para 05 gotas pela manhã e 05 gotas às 16h.',
          'Manutenção: Titular 01 gota a cada 4 dias até controle ideal da ansiedade (dose média: 06 a 08 gotas/dose).',
          'Reter sob a língua por 60 segundos antes de engolir para absorção transmucosa otimizada.'
        ],
        description: 'Medicamento internacional importado via Anvisa RDC 660/2022, padrão cGMP para homeostase do humor e controle da ansiedade.'
      },
      {
        name: 'Gummies Grape Pangaia Full Spectrum — 28 unidades (700 mg — 25 mg/goma)',
        brand: 'Pangaia Biopharma (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabidiol (CBD) Full Spectrum 25 mg por unidade em base vegana de uva',
        concentration: '25 mg de CBD Full Spectrum por goma • Pote com 28 gomas (700 mg totais)',
        pharmaceuticalForm: 'Gomas Mastigáveis Veganas',
        quantity: '01 Frasco com 28 gomas',
        administrationRoute: 'Via Oral Mastigável',
        posologyHeader: 'Posologia e Modo de Uso:',
        dosage: [
          'Uso em Picos de Ansiedade, Tensão ou Sobrecarga: Mastigar 01 goma lentamente.',
          'Mastigar bem antes de engolir. Pode ser utilizada no final da tarde ou início da noite conforme necessidade.'
        ],
        description: 'Formulação prática e saborosa de liberação oral para momentos de estresse agudo e manutenção do bem-estar.'
      }
    ],
    defaultNotes: '- Medicamento importado para uso pessoal conforme RDC Anvisa nº 660/2022.\n- Administrar preferencialmente acompanhado de refeição que contenha lipídios saudáveis (aumenta absorção em até 5x).\n- Reter as gotas sublinguais por 60 segundos antes de deglutir.\n- Conservar em local fresco, ao abrigo do calor excessivo e luminosidade solar direta.'
  },
  {
    id: 'perfil-flowermed-ansiedade',
    name: 'Flowermed EUA — Linha Hemp Oil 3.000 mg & Sphera Broad (Importado)',
    conditionTag: 'ansiedade',
    category: 'importado',
    badge: '🌐 Importado EUA • Broad Spectrum',
    color: 'from-teal-600 via-sky-600 to-indigo-700',
    icon: 'Sparkles',
    description: 'Protocolo importado Flowermed formulado com tecnologia de nano-emulsão e Broad Spectrum 0% THC para pacientes com restrição profissional ou testes toxicológicos.',
    items: [
      {
        name: 'Full Spectrum Hemp Oil 3.000 mg',
        brand: 'Flowermed (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabidiol (CBD) Full Spectrum 3000mg + Fitocanabinoides Menores',
        concentration: '100 mg/mL (3.000 mg no frasco de 30 mL) • 3 gotas ≈ 10 mg CBD',
        pharmaceuticalForm: 'Solução Oleosa Sublingual',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Tomar 03 a 05 gotas sublinguais de 12 em 12 horas (pela manhã e no fim da tarde).',
          'Reter por 60 segundos sob a língua antes de deglutir.',
          'Titular 01 gota a cada 4 a 5 dias conforme evolução clínica.'
        ],
        description: 'Extrato completo de cânhamo Flowermed importado com certificação COA lote a lote.'
      },
      {
        name: 'Sphera 10% CBD Broad Spectrum 3.000 mg',
        brand: 'Flowermed (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabidiol (CBD) Broad Spectrum 100 mg/mL (0% THC) enriquecido com terpenos',
        concentration: '100 mg/mL (3.000 mg) • Frasco de 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Tomar 03 gotas pela manhã para estabilidade emocional, foco e clareza mental sem sedação.',
          'Zero THC garantido para segurança em exames toxicológicos profissionais.'
        ],
        description: 'Linha Sphera Premium Broad Spectrum com pureza máxima e ausência total de THC.'
      }
    ],
    defaultNotes: '- Medicamento importado Flowermed (EUA) amparado pela RDC Anvisa nº 660/2022.\n- Não causa sonolência excessiva durante o dia.\n- Tomar com intervalo de 2 horas em relação a outros medicamentos de uso contínuo.\n- Manter em temperatura ambiente (15°C a 30°C).'
  },
  {
    id: 'perfil-pangaia-insonia',
    name: 'Pangaia Biopharma EUA — Insônia & Sono Reparador (Importado RDC 660)',
    conditionTag: 'insonia',
    category: 'importado',
    badge: '🌐 Importado EUA • Sono',
    color: 'from-indigo-700 via-purple-700 to-violet-900',
    icon: 'Moon',
    description: 'Protocolo de alta potência com Pangaia 20% (6.000 mg) e Cápsulas Softgel de liberação estendida para consolidação da arquitetura do sono e combate a despertares noturnos.',
    items: [
      {
        name: 'Óleo CBD Full Spectrum Pangaia 20% — 6000 mg (30 mL)',
        brand: 'Pangaia Biopharma (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabidiol (CBD) Full Spectrum 200 mg/mL com perfil sinérgico de terpenos relaxantes (Mirceno e Linalol)',
        concentration: '200 mg/mL de CBD (6.000 mg por frasco de 30 mL) • 10,0 mg CBD por gota',
        pharmaceuticalForm: 'Óleo sublingual de alta potência',
        quantity: '01 Frasco de 30 mL com conta-gotas de precisão',
        administrationRoute: 'Via Sublingual Noturna',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Iniciar com 03 a 04 gotas sublinguais 45 minutos antes de deitar.',
          'Reter 60 segundos sob a língua antes de engolir.',
          'Se necessário após 5 dias, aumentar para 05 a 06 gotas até atingir sono profundo e reparador.'
        ],
        description: 'Concentração padrão ouro para distúrbios graves de sono, dores noturnas e agitação.'
      },
      {
        name: 'Cápsulas Soft Gel Full Spectrum Pangaia 1500 mg (30 cápsulas de 50 mg)',
        brand: 'Pangaia Biopharma (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabidiol (CBD) Full Spectrum 50 mg por cápsula em veículo lipídico de liberação prolongada',
        concentration: '50 mg de CBD por cápsula • Pote com 30 cápsulas (1.500 mg)',
        pharmaceuticalForm: 'Cápsulas Softgel Orais',
        quantity: '01 Frasco com 30 cápsulas',
        administrationRoute: 'Via Oral',
        posologyHeader: 'Posologia e Modo de Uso:',
        dosage: [
          'Ingerir 01 cápsula com água 1 hora antes de dormir após uma refeição leve.',
          'Garante liberação uniforme ao longo da madrugada, evitando despertares nas fases 3 e 4 do sono.'
        ],
        description: 'Cápsulas softgel farmacêuticas para ação contínua durante toda a noite sem sabor residual.'
      }
    ],
    defaultNotes: '- Medicamento importado via Anvisa RDC 660/2022.\n- Tomar preferencialmente à noite. Evitar dirigir veículos ou operar máquinas após a tomada.\n- Praticar higiene do sono: quarto escuro, sem telas eletrônicas 45 minutos antes de dormir.\n- Armazenar em local seco e protegido da luz solar.'
  },
  {
    id: 'perfil-flowermed-sono',
    name: 'Flowermed EUA — Sono Profundo & CBN Sleep Gummies (Importado)',
    conditionTag: 'insonia',
    category: 'importado',
    badge: '🌐 Importado EUA • CBN Sono',
    color: 'from-violet-800 to-indigo-900',
    icon: 'Moon',
    description: 'Protocolo importado focado no Canabinol (CBN) - o fitocanabinoide com maior afinidade aos receptores de indução do sono, combinado com gomas mastigáveis noturnas.',
    items: [
      {
        name: 'CBN Sleep Gummies 30 un',
        brand: 'Flowermed (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabinol (CBN) + Canabidiol (CBD) formulado especificamente para indução do sono',
        concentration: 'Formulação Noturna de Alta Eficácia • Pote com 30 gomas',
        pharmaceuticalForm: 'Gomas Mastigáveis Noturnas',
        quantity: '01 Pote com 30 gomas',
        administrationRoute: 'Via Oral Mastigável',
        posologyHeader: 'Posologia e Modo de Uso:',
        dosage: [
          'Mastigar 01 goma 30 a 45 minutos antes de deitar.',
          'Mastigar bem antes de engolir para rápida absorção gástrica e transmucosa.',
          'Promove relaxamento muscular e adormecimento natural.'
        ],
        description: 'Gomas importadas Flowermed para tratamento de insônia inicial e sono interrompido.'
      },
      {
        name: 'CBN 300 mg + CBD 900 mg',
        brand: 'Flowermed (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabinol (CBN) 300 mg + Canabidiol (CBD) 900 mg (Proporção 1:3)',
        concentration: 'Total 1.200 mg de Fitocanabinoides em 30 mL',
        pharmaceuticalForm: 'Solução Oleosa Sublingual',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual Noturna',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          'Pingar 04 a 06 gotas sob a língua 45 minutos antes de dormir.',
          'Aguardar absorção por 60 segundos antes de engolir.'
        ],
        description: 'Gotas sublinguais com sinergia CBD + CBN para consolidar o sono profundo REM.'
      }
    ],
    defaultNotes: '- Medicamento importado Flowermed sob respaldo da RDC 660/2022.\n- Uso exclusivo noturno. Não ingerir antes de atividades que exijam atenção motora.\n- Guardar na embalagem original em local fresco e arejado.'
  },
  {
    id: 'perfil-flores-importadas',
    name: 'Flores In Natura & Extrações Terapêuticas (14g • Importado RDC 660)',
    conditionTag: 'combinado',
    category: 'importado',
    badge: '🌐 Importado EUA • Inflorescências',
    color: 'from-emerald-700 via-teal-700 to-cyan-800',
    icon: 'Sparkles',
    description: 'Protocolo de vaporização medicinal inalatória para alívio imediato (resgate em 2 a 5 minutos) de crises de ansiedade, dor intensa e insônia aguda com controle de terpenos.',
    items: [
      {
        name: 'Flor In Natura Sour Lifter (CBD) 14g',
        brand: 'Importado (Folheto Especial EUA)',
        origin: 'Importado',
        activeIngredients: 'Inflorescências ricas em CBD (dominância Sativa 75%), Terpenos ativos Limoneno, Cariofileno e Humuleno',
        concentration: 'Teor elevado de CBD medicinal • Embalagem lacrada com 14 gramas',
        pharmaceuticalForm: 'Flores in natura secas para inalação vaporizada',
        quantity: '01 Pacote Selado de 14 gramas',
        administrationRoute: 'Via Inalatória (Vaporização Medicinal de Precisão)',
        posologyHeader: 'Posologia e Modo de Uso:',
        dosage: [
          'Uso Diurno / Resgate de Ansiedade e Tensão: Vaporizar pequena porção (0,05g a 0,1g) em aparelho vaporizador elétrico com controle de temperatura entre 165°C e 180°C.',
          'Efeito percebido em 2 a 3 minutos com pico em 15 minutos.',
          'NÃO UTILIZAR COMBUSTÃO (FUMO). Utilizar exclusivamente vaporizador com controle térmico.'
        ],
        description: 'Inflorescência importada certificada com perfil revigorante e ansiolítico para o dia.'
      },
      {
        name: 'Flor In Natura Lemon Octane (CBD) 14g',
        brand: 'Importado (Folheto Especial EUA)',
        origin: 'Importado',
        activeIngredients: 'Inflorescências ricas em CBD (dominância Índica 70%), Mirceno, Linalol e Bisabolol',
        concentration: 'Rica em CBD e terpenos sedativos • Embalagem com 14 gramas',
        pharmaceuticalForm: 'Flores in natura secas para inalação vaporizada',
        quantity: '01 Pacote Selado de 14 gramas',
        administrationRoute: 'Via Inalatória Noturna (Vaporização)',
        posologyHeader: 'Posologia e Modo de Uso:',
        dosage: [
          'Uso Noturno / Resgate de Insônia: Vaporizar 0,05g a 0,1g a 180°C a 195°C 20 minutos antes de deitar.',
          'Indução rápida do sono e relaxamento muscular profundo sem sonolência residual matinal.'
        ],
        description: 'Inflorescência noturna rica em Mirceno para relaxamento integral do sistema nervoso.'
      }
    ],
    defaultNotes: '- Medicamento botânico importado estritamente para uso medicinal pessoal sob prescrição conforme RDC Anvisa 660/2022.\n- PROIBIDO o consumo por combustão (fumar). A administração deve ser realizada exclusivamente por inalação vaporizada com controle de temperatura.\n- Manter na embalagem original vedada em local escuro e sem umidade para preservar os tricomas e terpenos.'
  },
  {
    id: 'perfil-pangaia-dor',
    name: 'Pangaia Biopharma EUA — Dor Crônica, Espasmos & Enxaqueca (Importado)',
    conditionTag: 'dor',
    category: 'importado',
    badge: '🌐 Importado EUA • Dor & Tópico',
    color: 'from-rose-700 via-pink-700 to-red-800',
    icon: 'Activity',
    description: 'Protocolo internacional duplo para analgesia máxima: gotas de alta potência sistêmica + CBD Relief Cream para alívio articular e muscular localizado.',
    items: [
      {
        name: 'Óleo CBD Full Spectrum Pangaia 20% — 6000 mg (30 mL)',
        brand: 'Pangaia Biopharma (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabidiol (CBD) Full Spectrum 200 mg/mL (Total 6.000 mg) com fitocanabinoides anti-inflamatórios',
        concentration: '200 mg/mL • 10,0 mg CBD por gota • Frasco de 30 mL',
        pharmaceuticalForm: 'Óleo sublingual concentrado',
        quantity: '01 Frasco de 30 mL',
        administrationRoute: 'Via Sublingual de 12 em 12 horas',
        posologyHeader: 'Posologia e Modo de Uso (Aproximadamente 25 gotas por mL):',
        dosage: [
          '1º ao 4º dia: Tomar 02 gotas pela manhã e 02 gotas à noite após as refeições.',
          '5º ao 8º dia: Aumentar para 03 a 04 gotas por dose.',
          'Titular 01 gota a cada 4 dias até analgesia satisfatória (dose usual: 05 a 08 gotas de 12/12h).'
        ],
        description: 'Potência máxima para modulação de dor neuropática, fibromialgia e inflamação crônica.'
      },
      {
        name: 'CBD Relief Cream Pangaia 3000 mg — Creme Analgésico de Alta Potência (100 mL)',
        brand: 'Pangaia Biopharma (EUA)',
        origin: 'Importado',
        activeIngredients: 'Canabidiol (CBD) 3000 mg em base dermatológica transdérmica com arnica e mentol',
        concentration: '30 mg de CBD puro por mL • Frasco dosador com 100 mL',
        pharmaceuticalForm: 'Creme Dérmico Tópico Analgésico',
        quantity: '01 Frasco de 100 mL com bomba dosadora',
        administrationRoute: 'Uso Tópico Dérmico',
        posologyHeader: 'Posologia e Modo de Uso:',
        dosage: [
          'Aplicar 1 a 2 pumps sobre as articulações ou músculos doloridos 2 a 3 vezes ao dia.',
          'Massagear em movimentos circulares por 2 minutos até absorção dérmica completa.'
        ],
        description: 'Ação analgésica rápida periférica nos receptores CB2 cutâneos com alívio imediato da rigidez.'
      }
    ],
    defaultNotes: '- Medicamento importado Pangaia Biopharmaceuticals registrado nos EUA sob RDC 660/2022.\n- Aplicar o creme analgésico topicamente sem esfregar em áreas de mucosa ou pele lesada.\n- Administrar o óleo sublingual sempre com alimentos ricos em gorduras benéficas para absorção plena.'
  }
];

const STORAGE_KEY = 'mecura_programmed_prescriptions';
const DELETED_KEY = 'mecura_deleted_profile_ids';
export const DOCTOR_CUSTOM_MODEL_KEY = 'mecura_doctor_custom_prescription_model';

export function getDoctorCustomModel(): ProgrammedPrescriptionProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DOCTOR_CUSTOM_MODEL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDoctorCustomModel(model: ProgrammedPrescriptionProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DOCTOR_CUSTOM_MODEL_KEY, JSON.stringify(model));
    // Also ensure it is present in the main programmed profiles list at position 0
    const current = getProgrammedProfiles();
    const withoutModel = current.filter(p => p.id !== model.id && p.id !== 'modelo-salvo-doutor');
    saveProgrammedProfiles([model, ...withoutModel]);
    window.dispatchEvent(new CustomEvent('mecura_doctor_model_updated'));
  } catch (e) {
    console.error('Erro ao salvar modelo personalizado do médico:', e);
  }
}

function ensureCompleteProfileItems(profiles: ProgrammedPrescriptionProfile[]): ProgrammedPrescriptionProfile[] {
  return profiles.map(profile => ({
    ...profile,
    items: (profile.items || []).map(item => {
      const enriched = enrichMedicationDetails(item.name || '', item.brand, item.origin, item.type);
      const isGenericText = (val?: string) =>
        !val || !val.trim() || /conforme rótulo|conforme especificação|variável \(verificar/i.test(val);

      let cleanDosage: string[] = [];
      if (Array.isArray(item.dosage)) {
        cleanDosage = item.dosage.map(d => String(d).trim()).filter(Boolean);
      } else if (typeof item.dosage === 'string' && (item.dosage as string).trim()) {
        cleanDosage = (item.dosage as string).split('\n').map(s => s.trim()).filter(Boolean);
      }

      return {
        ...item,
        name: (item.name || '').replace(/—+|-{3,}/g, '-').trim(),
        brand: item.brand?.trim() || enriched.brand || 'Associação Brasileira (Nacional)',
        origin: item.origin?.trim() || enriched.origin || 'Nacional',
        activeIngredients: !isGenericText(item.activeIngredients)
          ? item.activeIngredients!.trim()
          : (enriched.activeIngredients || 'Canabidiol (CBD) Full Spectrum + Fitocanabinoides'),
        concentration: !isGenericText(item.concentration)
          ? item.concentration!.trim()
          : (enriched.concentration || '100 mg/mL (3.000 mg) • Frasco de 30 mL'),
        pharmaceuticalForm: !isGenericText(item.pharmaceuticalForm)
          ? item.pharmaceuticalForm!.trim()
          : (enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)'),
        quantity: !isGenericText(item.quantity)
          ? item.quantity!.trim()
          : (enriched.quantity || '01 Frasco de 30 mL'),
        administrationRoute: !isGenericText(item.administrationRoute)
          ? item.administrationRoute!.trim()
          : (enriched.administrationRoute || 'Via Sublingual / Oral'),
        posologyHeader: item.posologyHeader,
        dosage: cleanDosage.length > 0
          ? cleanDosage
          : ['Iniciar com 03 a 05 gotas 2 vezes ao dia por via sublingual.', 'Reter sob a língua por 60 segundos antes de engolir.']
      };
    })
  }));
}

export function getProgrammedProfiles(): ProgrammedPrescriptionProfile[] {
  if (typeof window === 'undefined') return ensureCompleteProfileItems(DEFAULT_PROGRAMMED_PROFILES);
  try {
    const rawDeleted = localStorage.getItem(DELETED_KEY);
    const deletedIds = new Set<string>(rawDeleted ? JSON.parse(rawDeleted) : []);

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return ensureCompleteProfileItems(DEFAULT_PROGRAMMED_PROFILES.filter(p => !deletedIds.has(p.id)));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Heal perfil-ansiedade if it has old dashes or broken dosage in user's localStorage
      const defaultAnsiedade = DEFAULT_PROGRAMMED_PROFILES.find(p => p.id === 'perfil-ansiedade');
      const targetAnsiedade = parsed.find((p: any) => p.id === 'perfil-ansiedade');
      if (defaultAnsiedade && targetAnsiedade) {
        const itemWithDashes = (targetAnsiedade.items || []).find((it: any) => /——+|--+|————-/.test(it.name || ''));
        const itemBroad = (targetAnsiedade.items || []).find((it: any) => /broad.*cbn/i.test(it.name || ''));
        const isOutdatedDosage = itemBroad && (!Array.isArray(itemBroad.dosage) || itemBroad.dosage.length < 2 || !itemBroad.dosage[0]?.includes('2 gotas'));
        if (itemWithDashes || isOutdatedDosage) {
          targetAnsiedade.items = defaultAnsiedade.items;
          targetAnsiedade.name = defaultAnsiedade.name;
          targetAnsiedade.badge = defaultAnsiedade.badge;
          targetAnsiedade.defaultNotes = defaultAnsiedade.defaultNotes;
        }
      }

      // Check if custom doctor model exists in storage and prepend if missing
      const customModelRaw = localStorage.getItem(DOCTOR_CUSTOM_MODEL_KEY);
      if (customModelRaw) {
        try {
          const customModel = JSON.parse(customModelRaw);
          if (customModel && customModel.id && !parsed.some((p: any) => p.id === customModel.id)) {
            parsed.unshift(customModel);
          }
        } catch {}
      }

      const existingIds = new Set(parsed.map((p: any) => p.id));
      const missingDefaults = DEFAULT_PROGRAMMED_PROFILES.filter(p => !existingIds.has(p.id) && !deletedIds.has(p.id));
      const combined = missingDefaults.length > 0
        ? [...parsed, ...missingDefaults]
        : parsed.filter((p: any) => !deletedIds.has(p.id));
      const completed = ensureCompleteProfileItems(combined);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
      return completed;
    }
  } catch (e) {
    console.warn('Erro ao carregar receitas programadas do localStorage:', e);
  }
  return ensureCompleteProfileItems(DEFAULT_PROGRAMMED_PROFILES);
}

export function saveProgrammedProfiles(profiles: ProgrammedPrescriptionProfile[], deletedId?: string) {
  if (typeof window === 'undefined') return;
  try {
    if (deletedId) {
      const rawDeleted = localStorage.getItem(DELETED_KEY);
      const deletedIds: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
      if (!deletedIds.includes(deletedId)) {
        deletedIds.push(deletedId);
        localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    window.dispatchEvent(new CustomEvent('mecura_programmed_prescriptions_updated'));
  } catch (e) {
    console.error('Erro ao salvar perfis programados:', e);
  }
}

export function resetProgrammedProfilesToDefault() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DELETED_KEY);
    window.dispatchEvent(new CustomEvent('mecura_programmed_prescriptions_updated'));
  } catch (e) {
    console.error('Erro ao resetar perfis programados:', e);
  }
}
