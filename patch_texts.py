with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

old_block = """    let defaultClinicalSummary = '';
    let defaultTherapeuticRationale = '';

    if (type === 'inicial') {
      defaultClinicalSummary = `Paciente com quadro de ${objectives.toLowerCase()}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration.toLowerCase()}. Fez diversos tratamentos medicamentosos com diferentes classes de drogas, porem sem resposta terapêutica efetiva e com diversos efeitos colaterais adversos. O quadro clinico do paciente interfere diretamente em sua qualidade de vida e atividades funcionais diárias.\\n\\nHistória da Moléstia: ${description}\\n\\nAs medicações a base de Cannabis tem como objetivo dá uma melhor qualidade de vida e controlar/diminuir os sintomas relacionados as suas patologias.`;
      defaultTherapeuticRationale = `Devido a insuficiência das respostas terapêuticas das medicações convencionais disponíveis, indico o uso da Cannabis medicinal.\\nCid: `;
    } else {
      defaultClinicalSummary = `Paciente está sendo acompanhado(a) desde [MÊS/ANO]. Fez diversos tratamentos medicamentosos prévios com diferentes classes de drogas (Analgésicos, Anti-inflamatórios, Opiodes, Benzodiazepínicos) porem sem resposta terapêutica efetiva e com diversos efeitos colaterais adversos (náuseas, vômitos, dor de cabeça, sede, diarreia, sonolência, tontura, constipação, irritação no estômago, retenção de líquidos, problemas de memória e dificuldade de concentração).\\n\\nHistórico Laboral/Pessoal (Anotação da Triagem):\\n${evolutionNotes || '[Nenhuma anotação extra na triagem]'}\\n\\nEstá fazendo uso de Cannabis medicinal, na forma de óleos e flor in natura, referindo alivio diário dos sintomas e relatando melhora substancial, fazendo com que o mesmo tenha mais disposição e qualidade de vida.\\n\\nDevido ao alto custo das medicações, o(a) paciente iniciou cultivo artesanal para produção da sua própria medicação tendo excelentes resultados. Além de acompanhar todo o processo de produção, o cultivo da planta torna-se algo terapêutico e mais um recurso para o tratamento.`;
      defaultTherapeuticRationale = `As medicações a base de Cannabis tem como objetivo dar uma melhor qualidade de vida e controlar/diminuir os sintomas relacionados as suas patologias.\\n\\nDevido a insuficiência das respostas terapêuticas das medicações convencionais disponíveis, indico a continuidade do uso da Cannabis medicinal. Oriento não parar o tratamento, podendo o paciente ter perdas substanciais na qualidade de vida.\\nCid: `;
    }"""

new_block = """    let defaultClinicalSummary = '';
    let defaultTherapeuticRationale = '';

    if (type === 'inicial') {
      defaultClinicalSummary = `O(A) paciente encontra-se sob meus cuidados médicos, apresentando quadro clínico compatível com ${objectives.toLowerCase()}, demonstrando considerável refratariedade aos tratamentos convencionais de primeira linha. A sintomatologia atual é classificada com intensidade referida de ${intensity} e tempo de evolução caracterizado por ${duration.toLowerCase()}.

Histórico da Moléstia Atual (HMA):
${description}

Histórico Terapêutico e Refratariedade:
O(a) paciente já foi submetido(a) a múltiplos esquemas farmacológicos, abrangendo diversas classes medicamentosas ao longo do tratamento. No entanto, não obteve resposta terapêutica satisfatória ou sustentada, além de relatar expressiva intolerância e eventos adversos indesejáveis inerentes ao uso crônico destas substâncias. O quadro clínico atual impõe prejuízo substancial à qualidade de vida do(a) paciente, interferindo negativamente em suas atividades funcionais, rotina diária e bem-estar global.`;

      defaultTherapeuticRationale = `Considerando a fisiopatologia do Sistema Endocanabinoide (SEC) e sua capacidade intrínseca de modular processos álgicos, inflamatórios e neurológicos, a terapêutica fitocanabinoide surge como alternativa embasada e segura.

Indicação Clínica:
Devido à insuficiência das respostas terapêuticas com as medicações alopáticas convencionais disponíveis, indico formalmente o início do tratamento com Cannabis Medicinal (Fitocanabinoides). O objetivo central desta conduta é promover a neuromodulação, redução do quadro sintomático, e consequentemente, a restituição da qualidade de vida e dignidade do(a) paciente.

CID-10 Principal: [INSERIR CID]
CIDs Secundários: [INSERIR SE HOUVER]`;
    } else {
      defaultClinicalSummary = `O(A) paciente encontra-se em acompanhamento médico regular sob meus cuidados desde [INSERIR MÊS/ANO], apresentando quadro primário de ${objectives.toLowerCase()}.

Histórico Prévio e Evolução Clínica:
Anteriormente à introdução da terapêutica canabinoide, o(a) paciente foi submetido(a) a extensos e repetidos tratamentos alopáticos (incluindo Analgésicos, Anti-inflamatórios, Opioides, Benzodiazepínicos e/ou Antidepressivos). Tais intervenções mostraram-se ineficazes no controle sustentado dos sintomas e resultaram em severos efeitos colaterais (como náuseas, letargia, distúrbios gastrointestinais e prejuízo cognitivo), limitando substancialmente sua adesão e funcionalidade.

Informações Clínicas, Sociais e Laborais (Triagem):
${evolutionNotes || '[Nenhuma anotação extra na triagem fornecida]'}

Resposta Terapêutica Atual (Uso da Cannabis):
Atualmente, o(a) paciente faz uso terapêutico da Cannabis sativa L. (através de óleos de espectro completo e/ou uso in natura), apresentando excelente tolerabilidade e adesão ao tratamento. Relata alívio diário e substancial dos sintomas outrora incapacitantes, melhora significativa na arquitetura do sono (sono reparador), redução de crises e ganho expressivo de disposição para as atividades da vida diária (AVDs).

Necessidade de Cultivo Artesanal:
Devido ao alto custo financeiro dos produtos canabinoides (importados ou fornecidos por associações), aliado à necessidade contínua e ininterrupta do tratamento, o(a) paciente iniciou o cultivo artesanal e doméstico da planta Cannabis para extração e produção de seu próprio fitoterápico. Esta prática demonstrou resultados clínicos irrefutáveis e tem se revelado não apenas uma necessidade econômica fundamental, mas também uma ferramenta ocupacional terapêutica que agrega valor imensurável ao prognóstico.`;

      defaultTherapeuticRationale = `As medicações à base de Cannabis provaram ser o único recurso terapêutico eficaz na promoção de qualidade de vida e estabilização do quadro clínico crônico deste(a) paciente. A modulação do Sistema Endocanabinoide tem garantido o controle dos sintomas refratários de forma segura e com mínimos efeitos adversos comparativos.

Parecer Médico (Manutenção do Tratamento):
Em virtude da grave falha terapêutica pretérita com a medicina convencional e diante da nítida, documentada e expressiva melhora clínica com a via artesanal, atesto a necessidade IMPRESCINDÍVEL da manutenção do uso da Cannabis medicinal. Oriento veementemente a não interrupção do tratamento e a continuidade do cultivo próprio, visto que a suspensão abrupta ou a impossibilidade de acesso acarretará retrocesso imediato do quadro clínico, agravamento dos sintomas e risco iminente de perdas substanciais na saúde e integridade do(a) paciente.

CID-10 Principal: [INSERIR CID]
CIDs Secundários: [INSERIR SE HOUVER]`;
    }"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
        f.write(code)
    print("Texts patched successfully.")
else:
    print("Old text block not found!")
