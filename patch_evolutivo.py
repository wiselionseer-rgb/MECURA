import re

with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

# We want to replace the whole `else` block inside `if (type === 'inicial') { ... } else { ... }`
# Let's find the exact block:

old_block = """    } else {
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

new_block = """    } else {
      defaultClinicalSummary = `O(A) paciente encontra-se em acompanhamento médico regular sob meus cuidados desde [INSERIR MÊS/ANO], apresentando quadro crônico de ${objectives.toLowerCase()}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration.toLowerCase()}.

Fez diversos tratamentos medicamentosos prévios com diferentes classes de drogas (incluindo Analgésicos, Anti-inflamatórios, Opioides e Benzodiazepínicos), porém sem resposta terapêutica efetiva e com diversos efeitos colaterais adversos (como náuseas, vômitos, cefaleia, letargia, distúrbios gastrointestinais e prejuízo cognitivo).

${evolutionNotes ? evolutionNotes + '\\n\\n' : ''}Atualmente, o(a) paciente faz uso da terapêutica com Cannabis sativa L. (na forma de óleos de espectro completo e flor in natura), referindo alívio diário e substancial dos sintomas, relatando sono duradouro e reparador, fazendo com que acorde mais disposto(a) para as atividades do dia a dia.

Devido ao alto custo financeiro das medicações à base de cannabis (importadas ou via associações), o(a) paciente iniciou o cultivo artesanal e doméstico da planta para produção de sua própria medicação, obtendo excelentes resultados. Além de permitir o acesso ininterrupto ao remédio e acompanhar todo o processo de produção, o cultivo da planta tornou-se uma atividade ocupacional terapêutica essencial e mais um recurso fundamental para o sucesso do tratamento.`;

      defaultTherapeuticRationale = `As medicações à base de Cannabis provaram ser o recurso terapêutico mais eficaz na promoção de qualidade de vida e estabilização do quadro clínico deste(a) paciente, com o objetivo claro de controlar e diminuir os sintomas refratários relacionados às suas patologias.

Em virtude da grave insuficiência das respostas terapêuticas com as medicações convencionais disponíveis e da nítida melhora clínica alcançada, indico formalmente a CONTINUIDADE do uso da Cannabis medicinal pela via artesanal. Oriento expressamente a não interrupção do tratamento e a manutenção do cultivo próprio, visto que a suspensão do uso poderá acarretar retrocesso imediato do quadro e perdas substanciais na qualidade de vida e saúde do(a) paciente.

CID-10 Principal: [INSERIR CID]
CIDs Secundários: [INSERIR SE HOUVER]`;
    }"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
        f.write(code)
    print("Evolutivo text updated successfully.")
else:
    print("Error: Old evolutivo block not found.")
