import re

with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

mapper_logic = """  const getCidsFromObjectives = (objs: string[]) => {
    const cids: string[] = [];
    objs.forEach(obj => {
      const lowerObj = obj.toLowerCase();
      if (lowerObj.includes('ansiedade')) cids.push('F41.9');
      if (lowerObj.includes('insônia') || lowerObj.includes('sono')) cids.push('G47.0');
      if (lowerObj.includes('lombar')) cids.push('M54.5');
      if (lowerObj.includes('dor')) cids.push('R52.2');
      if (lowerObj.includes('depressão')) cids.push('F32.9');
      if (lowerObj.includes('estresse')) cids.push('F43.9');
      if (lowerObj.includes('enxaqueca')) cids.push('G43.9');
      if (lowerObj.includes('fibromialgia')) cids.push('M79.7');
      if (lowerObj.includes('autismo') || lowerObj.includes('tea')) cids.push('F84.0');
      if (lowerObj.includes('tdah') || lowerObj.includes('atenção')) cids.push('F90.0');
      if (lowerObj.includes('epilepsia') || lowerObj.includes('convulsão')) cids.push('G40.9');
      if (lowerObj.includes('parkinson')) cids.push('G20');
      if (lowerObj.includes('alzheimer')) cids.push('G30.9');
      if (lowerObj.includes('artrose')) cids.push('M19.9');
      if (lowerObj.includes('artrite')) cids.push('M13.9');
      if (lowerObj.includes('endometriose')) cids.push('N80.9');
      if (lowerObj.includes('psoríase')) cids.push('L40.9');
      if (lowerObj.includes('neuropatia')) cids.push('G62.9');
    });
    return [...new Set(cids)]; // remove duplicates
  };

  const handleOpenMedicalReportEditor = (type: 'inicial' | 'evolutivo' = 'inicial') => {
    const patientAnswers = currentPatient?.answers || answers;
    const pName = currentPatient?.patientName || userName || 'Paciente';
    const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || userBirthDate || 'Não informada';
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf || 'Não informado';

    const objectivesArray = patientAnswers?.objectives || ['Ansiedade'];
    const objectives = patientAnswers?.objectives?.join(', ') || 'Ansiedade, estresse crônico e dores';
    
    const matchedCids = getCidsFromObjectives(objectivesArray);
    let cidPrincipal = '[INSERIR CID PRINCIPAL]';
    let cidsSecundarios = '[INSERIR SE HOUVER]';

    if (matchedCids.length > 0) {
      cidPrincipal = matchedCids[0];
      if (matchedCids.length > 1) {
        cidsSecundarios = matchedCids.slice(1).join(', ');
      } else {
        cidsSecundarios = 'Nenhum reportado adicionalmente';
      }
    }"""

old_start = """  const handleOpenMedicalReportEditor = (type: 'inicial' | 'evolutivo' = 'inicial') => {
    const patientAnswers = currentPatient?.answers || answers;
    const pName = currentPatient?.patientName || userName || 'Paciente';
    const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || userBirthDate || 'Não informada';
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf || 'Não informado';

    const objectives = patientAnswers?.objectives?.join(', ') || 'Ansiedade, estresse crônico e dores';"""

if old_start in code:
    code = code.replace(old_start, mapper_logic)
    
    # Also replace the hardcoded CIDs with the dynamic ones
    code = code.replace("CID-10 Principal: [INSERIR CID]\\nCIDs Secundários: [INSERIR SE HOUVER]", "CID-10 Principal: ${cidPrincipal}\\nCIDs Secundários: ${cidsSecundarios}")
    
    with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
        f.write(code)
    print("Patched handleOpenMedicalReportEditor")
else:
    print("Old start not found!")
