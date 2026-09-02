import re

with open("src/screens/DoctorDashboardScreen.tsx", "r", encoding="utf-8") as f:
    code = f.read()

old_func = """  const handleDownloadPrescriptionFromEditor = async () => {
    // 1. Atualizar o chat (banco de dados) com a versão final editada para o paciente ver
    if (currentPatient && currentPatient.id) {
      await clearPrescriptionMessages(currentPatient.id);
      
      for (const item of prescItems) {
        await addMessage({
          sender: 'doctor',
          type: 'product',
          productData: item
        });
      }
      
      if (prescNotes && prescNotes.trim()) {
        await addMessage({
          sender: 'doctor',
          type: 'prescription_notes',
          text: prescNotes
        });
      }
    }

    // 2. Gerar o PDF com os dados editados
    generatePrescriptionPDF(prescPatientName, messages, {
      customPatientName: prescPatientName,
      birthDate: prescBirthDate,
      cpf: prescCpf,
      emissionDate: prescEmissionDate,
      customDoctorName: prescDoctorName,
      customDoctorCrm: prescDoctorCrm,
      customDoctorSpecialty: prescDoctorSpecialty,
      customItems: prescItems,
      customNotes: prescNotes
    });
  };"""

new_func = """  const handleDownloadPrescriptionFromEditor = async () => {
    // 1. Atualizar o chat (banco de dados) com a versão final editada para o paciente ver
    if (currentPatient && currentPatient.id) {
      await clearPrescriptionMessages(currentPatient.id);
      
      for (const item of prescItems) {
        await addMessage({
          sender: 'doctor',
          type: 'product',
          productData: item
        });
      }
      
      if (prescNotes && prescNotes.trim()) {
        await addMessage({
          sender: 'doctor',
          type: 'prescription_notes',
          text: prescNotes
        });
      }

      // Adicionar o card de download da receita novamente para o paciente
      await addMessage({
        sender: 'doctor',
        type: 'prescription'
      });
    }

    // 2. Gerar o PDF com os dados editados
    generatePrescriptionPDF(prescPatientName, messages, {
      customPatientName: prescPatientName,
      birthDate: prescBirthDate,
      cpf: prescCpf,
      emissionDate: prescEmissionDate,
      customDoctorName: prescDoctorName,
      customDoctorCrm: prescDoctorCrm,
      customDoctorSpecialty: prescDoctorSpecialty,
      customItems: prescItems,
      customNotes: prescNotes
    });
  };"""

if old_func in code:
    code = code.replace(old_func, new_func)
    print("Function patched successfully!")
else:
    print("Function not found!")

with open("src/screens/DoctorDashboardScreen.tsx", "w", encoding="utf-8") as f:
    f.write(code)
