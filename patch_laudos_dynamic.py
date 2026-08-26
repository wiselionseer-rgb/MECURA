import re
with open("src/utils/pdfGenerator.ts", "r") as f:
    code = f.read()

# Update Psychomotor Report textBody
old_psico_body = """  const textBody = `Após avaliação clínica do paciente, atesto que, embora o(a) paciente faça uso de cannabis medicinal com concentração de THC, ele(a) se encontra, no momento da avaliação, apto(a) a conduzir veículos, sem prejuízo à sua capacidade psicomotora.
O(A) paciente foi avaliado(a) apresentando condições clínicas estáveis, sem evidência de comprometimento da atenção, reflexos ou coordenação motora, compatíveis com a condução segura de veículos.
Recomendo, no entanto, que o(a) paciente evite o uso de cannabis antes de atividades que requeiram alta concentração ou situações de risco, além de seguir as orientações médicas continuamente.`;"""

new_psico_body = """  const patientFirstName = sanitizedUserName.split(' ')[0] || 'O(A) paciente';
  const textBody = `Após avaliação clínica de ${sanitizedUserName}, portador(a) do CPF ${cpfText}, atesto que, embora o(a) paciente faça uso de cannabis medicinal com concentração de THC, ele(a) se encontra, no momento da avaliação, apto(a) a conduzir veículos, sem prejuízo à sua capacidade psicomotora.
${patientFirstName} foi avaliado(a) apresentando condições clínicas estáveis, sem evidência de comprometimento da atenção, reflexos ou coordenação motora, compatíveis com a condução segura de veículos automotores e maquinários.
Recomendo, no entanto, que ${patientFirstName} evite o uso de cannabis antes de atividades que requeiram alta concentração ou situações de risco, além de seguir as orientações médicas continuamente para o seu acompanhamento.`;"""

code = code.replace(old_psico_body, new_psico_body)


# Update Medical Report Clinical Summary
old_medical_body = """  const objectives = patientAnswers?.objectives?.join(', ') || 'Ansiedade e dor crônica';
  const intensity = patientAnswers?.intensity ? `${patientAnswers.intensity}/10` : 'Moderada a intensa';
  const duration = patientAnswers?.duration || 'Quadro de evolução crônica';
  const description = patientAnswers?.description || 'Paciente relata persistência dos sintomas refratários aos tratamentos convencionais de primeira linha, com impacto expressivo na qualidade de vida, repouso noturno e funcionalidade global.';

  const defaultClinicalSummary = `O(A) paciente supramencionado(a) compareceu a atendimento médico e foi submetido(a) a minuciosa avaliação clínica. Apresenta sintomatologia compatível com ${objectives}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration}. 

História da Moléstia: ${description}

Tratamento prévio com fármacos convencionais: ${patientAnswers?.remedios ? 'Sim' : 'Não'} | Diagnóstico de Comorbidade Crônica: ${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}.`;"""

new_medical_body = """  const objectives = patientAnswers?.objectives?.join(', ') || 'dor crônica e ansiedade';
  const intensity = patientAnswers?.intensity ? `${patientAnswers.intensity}/10` : 'intensa';
  const duration = patientAnswers?.duration || 'anos';
  const patientFirstName = sanitizedUserName.split(' ')[0] || 'O(A) paciente';

  const defaultClinicalSummary = `${sanitizedUserName} encontra-se em acompanhamento médico regular sob meus cuidados, apresentando quadro clínico relacionado a ${objectives}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration}.

Fez diversos tratamentos medicamentosos prévios com diferentes classes de drogas para o seu quadro, porém sem resposta terapêutica efetiva e relatando efeitos colaterais adversos ou resposta subótima.

Atualmente, ${patientFirstName} faz uso da terapêutica com Cannabis sativa L., referindo alívio diário e substancial dos sintomas, relatando melhora na qualidade de vida, o que faz com que acorde mais disposto(a) para as atividades do dia a dia.

Declaro que ${patientFirstName} está ciente e concorda com o plano terapêutico proposto.`;"""

code = code.replace(old_medical_body, new_medical_body)

with open("src/utils/pdfGenerator.ts", "w") as f:
    f.write(code)

print("Dynamic texts added")
