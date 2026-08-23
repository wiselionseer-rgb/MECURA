with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

old_code = """    const intensity = patientAnswers?.intensity ? `${patientAnswers.intensity}/10` : 'Moderada a intensa';
    const duration = patientAnswers?.duration || 'Quadro de evolução crônica';
    const description = patientAnswers?.description || 'Paciente relata persistência e refratariedade de sintomas clínicos aos tratamentos convencionais de primeira linha, com impacto relevante na qualidade de vida, repouso noturno e funcionalidade global.';"""

new_code = """    const intensity = patientAnswers?.intensity ? `${patientAnswers.intensity}/10` : 'Moderada a intensa';
    const duration = patientAnswers?.duration || 'Quadro de evolução crônica';
    
    let descriptionText = '';
    if (patientAnswers?.diseaseOrigin) {
      descriptionText += `Origem / Relato do Paciente: ${patientAnswers.diseaseOrigin}\\n\\n`;
    }
    if (patientAnswers?.description) {
      descriptionText += `Outros detalhes: ${patientAnswers.description}`;
    }
    if (!descriptionText.trim()) {
      descriptionText = 'Paciente relata persistência e refratariedade de sintomas clínicos aos tratamentos convencionais de primeira linha, com impacto relevante na qualidade de vida, repouso noturno e funcionalidade global.';
    }
    const description = descriptionText.trim();"""

if old_code in code:
    code = code.replace(old_code, new_code)
    with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
        f.write(code)
    print("Description logic patched.")
else:
    print("Error: Old description logic not found.")
