export function generateClinicalAnalysisFallback(promptText: string): string {
    const isPain = /dor|inflama|coluna|lombar|muscular|artrite|fibromialgia/i.test(promptText);
    const isInsomnia = /sono|insônia|dormir|acordar/i.test(promptText);
    
    let primaryCondition = "Ansiedade Generalizada, Estresse Crônico e Modulação do Humor";
    let importedProducts = [
      {
        name: "GreenBudzCBD CalmVibe CBD 6000mg + Mint",
        indication: "Ansiedade Generalizada, Estresse e Modulação do Humor",
        usage: "**10 gotas (25mg de CBD)** por via sublingual, de **12 em 12 horas** (pela manhã e ao entardecer)",
        notes: "Reter sob a língua por 60 a 90 segundos antes de engolir para rápida absorção e maior biodisponibilidade."
      },
      {
        name: "GreenBudz Super Vibe Oil 3000mg • 100 mg/ml",
        indication: "Clareza Mental, Foco Diurno e Controle da Ansiedade",
        usage: "**5 a 8 gotas** pela manhã após alimentação",
        notes: "O CBG atua em sinergia promovendo neuroproteção e equilíbrio emocional sem sonolência."
      }
    ];

    let nationalProducts = [
      {
        name: "ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml",
        indication: "Controle de Ansiedade, Estresse Crônico e Modulação do Humor",
        usage: "Tomar **05 a 10 gotas** de manhã e **05 gotas** à tarde.",
        notes: "01 Frasco de 30ml - Associação Brasileira. Uso sublingual contínuo com titulação progressiva."
      },
      {
        name: "ÓLEO INTEGRAL PREDOMINANTE CBG 50mg/ml",
        indication: "Foco Diurno, Neuroproteção e Equilíbrio Emocional",
        usage: "Tomar **05 gotas** à tarde após refeição.",
        notes: "01 Frasco de 30ml - Associação Brasileira. Potencializa o efeito modulador sem sedação diurna."
      },
      {
        name: "Gomas Terapêuticas CBD/CBN 25mg - 30 unidades",
        indication: "Alívio Rápido de Picos de Tensão e Estresse",
        usage: "Mastigar **1 goma** ao final da tarde ou quando necessário.",
        notes: "01 Pote com 30 unidades - Associação Brasileira. Absorção gradual e prolongada."
      }
    ];

    if (isPain) {
      primaryCondition = "Dor Crônica, Processos Inflamatórios e Tensão Muscular";
      importedProducts = [
        {
          name: "GreenBudzCBD Deep Vibe CBD 3000mg + Indica Terps",
          indication: "Alívio de Dores Crônicas, Inflamação e Tensão Muscular (Óleo Sublingual)",
          usage: "**10 a 12 gotas** por via sublingual, de **12 em 12 horas**",
          notes: "Perfil terpênico com Mirceno e Beta-Cariofileno para analgesia sistêmica contínua."
        },
        {
          name: "Drops By GreenBudzCBD Gummies 5mg THC 5mg CBN 5mg CBD per ct Nightshade - 20ct",
          indication: "Crises Álgicas Noturnas e Relaxamento Muscular Profundo (Gomas Mastigáveis)",
          usage: "**1 goma mastigável** ao final da tarde ou 1h antes de deitar",
          notes: "Forma farmacêutica sólida comestível com liberação prolongada para controle da dor noturna."
        }
      ];

      nationalProducts = [
        {
          name: "ÓLEO INTEGRAL THC/CBD 100mg/ml",
          indication: "Analgesia Contínua, Modulação de Dores Neuropáticas e Inflamatórias",
          usage: "Tomar **10 gotas** de **12 em 12 horas** (sublingual).",
          notes: "01 Frasco de 30ml - Associação Brasileira. Efeito entourage balanceado (1:1) de uso contínuo."
        },
        {
          name: "Pomada Canábica Terapêutica 500mg (50g)",
          indication: "Alívio Tópico Localizado para Articulações e Músculos Doloridos",
          usage: "Aplicar fina camada sobre a região afetada **2 a 3 vezes ao dia**, massageando suavemente.",
          notes: "01 Pote 50g - Associação Brasileira. Ação anti-inflamatória tópica localizada sem sedação."
        },
        {
          name: "Flores in natura de cannabis sp rica em THC 15g",
          indication: "Controle de Crises Agudas e Picos de Dor Intratável (Resgate Inalatório)",
          usage: "Inalar **1g** via vaporizador medicinal nas crises.",
          notes: "01 Frasco de 15g - Associação Brasileira. Início de ação ultrarrápido (1 a 3 minutos) para resgate."
        }
      ];
    } else if (isInsomnia) {
      primaryCondition = "Distúrbios do Sono, Insônia Crônica e Fragmentação Noturna";
      importedProducts = [
        {
          name: "Drops By GreenBudz Goma Nightshade CBD CBN e THC",
          indication: "Indução e Manutenção do Sono Reparador (Óleo Sublingual com CBN)",
          usage: "**10 a 12 gotas** por via sublingual, **30 a 45 minutos antes de deitar**",
          notes: "O Canabinol (CBN) é o fitocanabinoide de escolha para arquitetura do sono profundo."
        },
        {
          name: "Drops By GreenBudzCBD Gummies 1mg THC 2.5mg CBN 10mg CBD per ct Lullaby - 20ct",
          indication: "Sono Prolongado e Prevenção de Despertares Noturnos (Gomas Mastigáveis)",
          usage: "**1 goma mastigável** 45 minutos antes do repouso",
          notes: "Gomas mastigáveis de ação prolongada com fitocanabinoides sinérgicos (CBN/CBD)."
        }
      ];

      nationalProducts = [
        {
          name: "ÓLEO INTEGRAL PREDOMINANTE THC 100mg/ml",
          indication: "Indução Fisiológica e Estabilização dos Ciclos do Sono",
          usage: "Tomar **05 gotas** à noite 30 minutos antes de dormir.",
          notes: "01 Frasco de 30ml - Associação Brasileira. Facilita o adormecer e modula o tônus de relaxamento."
        },
        {
          name: "ÓLEO INTEGRAL THC/CBD 100mg/ml",
          indication: "Relaxamento Muscular e Indução do Sono Profundo",
          usage: "Tomar **05 gotas** à noite 30 minutos antes de dormir.",
          notes: "01 Frasco de 30ml - Associação Brasileira. Efeito entourage para redução da ansiedade noturna."
        }
      ];
    }

    return `
### 1. Diagnóstico Sindrômico e Avaliação Clínica
O quadro clínico indica primariamente **${primaryCondition}**. A apresentação dos sintomas e a intensidade relatada sugerem um desequilíbrio no tônus endocanabinoide (Hipofunção Endocanabinoide Clínica).

### 2. Racional Terapêutico Fisiopatológico
A introdução de fitocanabinoides visa a neuromodulação direta dos receptores CB1 e CB2, além da interação alostérica com receptores serotoninérgicos (5-HT1A) e modulação do eixo HPA, restaurando a homeostase fisiológica e promovendo o alívio sustentado dos sintomas.

### 3. Protocolo de Titulação e Posologia Sugerida
Recomenda-se o método "Start Low, Go Slow" (iniciar com dosagem mínima e aumentar gradativamente). Titulação inicial a cada 5-7 dias baseada na resposta terapêutica.

### 4. Medicina Baseada em Evidências
O uso de fitocanabinoides para esta condição possui Nível de Evidência consolidado em estudos observacionais e ensaios clínicos randomizados para modulação de dor crônica, ansiedade e regulação do ritmo circadiano.

### 5. Manejo de Riscos
O risco de interações medicamentosas via sistema citocromo P450 (especialmente CYP3A4 e CYP2C19) é considerado baixo nas dosagens iniciais propostas. Contraindicado apenas em casos de histórico de psicose ativa aguda (para formulações com predominância THC).

### 6. RESUMO DE PRESCRIÇÃO SUGERIDA

**OPÇÃO 1: MEDICAMENTOS IMPORTADOS (Catálogo Oficial)**
${importedProducts.map((p, i) => `${i + 1}. **Produto:** ${p.name}\n   - **Indicação:** ${p.indication}\n   - **Posologia/Uso:** ${p.usage}\n   - **Observação Clínica:** ${p.notes}`).join('\n\n')}

**OPÇÃO 2: ASSOCIAÇÕES NACIONAIS (Formulação Brasileira)**
${nationalProducts.map((p, i) => `${i + 1}. **Produto:** ${p.name}\n   - **Indicação:** ${p.indication}\n   - **Posologia/Uso:** ${p.usage}\n   - **Observação Clínica:** ${p.notes}`).join('\n\n')}

*Nota Médica: Recomendo retorno em 30 dias para avaliação do quadro clínico e possível ajuste de dosagem (fase de manutenção).*
    `.trim();
  }
