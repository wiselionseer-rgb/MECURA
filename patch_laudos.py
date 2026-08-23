with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

state_search = "const [reportCpf, setReportCpf] = useState('');"
state_replace = "const [reportCpf, setReportCpf] = useState('');\n  const [evolutionNotes, setEvolutionNotes] = useState('');"
code = code.replace(state_search, state_replace)

old_func_start = "const handleOpenMedicalReportEditor = () => {"
new_func_start = "const handleOpenMedicalReportEditor = (type: 'inicial' | 'evolutivo' = 'inicial') => {"
code = code.replace(old_func_start, new_func_start)

old_summary = """    const defaultClinicalSummary = `O(A) paciente supramencionado(a) compareceu a atendimento médico especializado e foi submetido(a) a minuciosa avaliação clínica. Apresenta sintomatologia compatível com ${objectives}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration}.\\n\\nHistória da Moléstia: ${description}\\n\\nTratamento prévio com fármacos convencionais: ${patientAnswers?.remedios ? 'Sim' : 'Não'} | Diagnóstico de Comorbidade Crônica: ${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}.`;

    const defaultTherapeuticRationale = `A terapêutica com Fitocanabinoides (Cannabis Medicinal) fundamenta-se na modulação do Sistema Endocanabinoide (SEC), uma complexa rede de sinalização neuromoduladora e imunológica composta por receptores CB1 (sistema nervoso central) e CB2 (sistema imunológico e tecidos periféricos).\\n\\n- Modulação Neuroquímica e Anti-inflamatória: O Canabidiol (CBD) atua como modulador alostérico negativo de CB1 e inibidor da degradação de anandamida (via enzima FAAH), promovendo expressiva ação ansiolítica, neuroprotetora e redução de citocinas pró-inflamatórias.\\n- Efeito Comitiva (Entourage Effect): A administração de extratos integrais (Full Spectrum) contendo canabinoides menores (CBG, CBN e microdosagens de THC) e terpenos sinérgicos proporciona potencialização da resposta terapêutica com menor necessidade de escalonamento de doses.\\n- Adequação Clínica: Diante da refratariedade e da necessidade de estabilização sintomática sem os efeitos colaterais deletérios de medicações sedativas ou anti-inflamatórios convencionais a longo prazo, justifica-se a instituição do tratamento fitocanabinoide.`;"""

new_summary = """    let defaultClinicalSummary = '';
    let defaultTherapeuticRationale = '';

    if (type === 'inicial') {
      defaultClinicalSummary = `Paciente com quadro de ${objectives.toLowerCase()}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration.toLowerCase()}. Fez diversos tratamentos medicamentosos com diferentes classes de drogas, porem sem resposta terapêutica efetiva e com diversos efeitos colaterais adversos. O quadro clinico do paciente interfere diretamente em sua qualidade de vida e atividades funcionais diárias.\\n\\nHistória da Moléstia: ${description}\\n\\nAs medicações a base de Cannabis tem como objetivo dá uma melhor qualidade de vida e controlar/diminuir os sintomas relacionados as suas patologias.`;
      defaultTherapeuticRationale = `Devido a insuficiência das respostas terapêuticas das medicações convencionais disponíveis, indico o uso da Cannabis medicinal.\\nCid: `;
    } else {
      defaultClinicalSummary = `Paciente está sendo acompanhado(a) desde [MÊS/ANO]. Fez diversos tratamentos medicamentosos prévios com diferentes classes de drogas (Analgésicos, Anti-inflamatórios, Opiodes, Benzodiazepínicos) porem sem resposta terapêutica efetiva e com diversos efeitos colaterais adversos (náuseas, vômitos, dor de cabeça, sede, diarreia, sonolência, tontura, constipação, irritação no estômago, retenção de líquidos, problemas de memória e dificuldade de concentração).\\n\\nHistórico Laboral/Pessoal (Anotação da Triagem):\\n${evolutionNotes || '[Nenhuma anotação extra na triagem]'}\\n\\nEstá fazendo uso de Cannabis medicinal, na forma de óleos e flor in natura, referindo alivio diário dos sintomas e relatando melhora substancial, fazendo com que o mesmo tenha mais disposição e qualidade de vida.\\n\\nDevido ao alto custo das medicações, o(a) paciente iniciou cultivo artesanal para produção da sua própria medicação tendo excelentes resultados. Além de acompanhar todo o processo de produção, o cultivo da planta torna-se algo terapêutico e mais um recurso para o tratamento.`;
      defaultTherapeuticRationale = `As medicações a base de Cannabis tem como objetivo dar uma melhor qualidade de vida e controlar/diminuir os sintomas relacionados as suas patologias.\\n\\nDevido a insuficiência das respostas terapêuticas das medicações convencionais disponíveis, indico a continuidade do uso da Cannabis medicinal. Oriento não parar o tratamento, podendo o paciente ter perdas substanciais na qualidade de vida.\\nCid: `;
    }"""
code = code.replace(old_summary, new_summary)

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)
