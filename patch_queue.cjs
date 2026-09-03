const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf-8');

const oldCode = `    const newPatient = patient || { 
      id: currentUserId, 
      patientName: state.userName || 'Paciente Anônimo', 
      email: state.userEmail || 'sem-email@mecura.com',
      phone: state.userPhone || '',
      cpf: state.userCpf || '',
      birthDate: state.userBirthDate || state.answers?.birthDate || '',
      answers: {
        ...state.answers,
        birthDate: state.userBirthDate || state.answers?.birthDate || '',
        cpf: state.userCpf || state.answers?.cpf || '',
      }
    };`;

const newCode = `    let newPatient = patient || { 
      id: currentUserId, 
      patientName: state.userName || 'Paciente Anônimo', 
      email: state.userEmail || 'sem-email@mecura.com',
      phone: state.userPhone || '',
      cpf: state.userCpf || '',
      birthDate: state.userBirthDate || state.answers?.birthDate || '',
      answers: {
        ...state.answers,
        birthDate: state.userBirthDate || state.answers?.birthDate || '',
        cpf: state.userCpf || state.answers?.cpf || '',
      }
    };
    
    if (!patient && auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          newPatient.patientName = data.name || newPatient.patientName;
          newPatient.email = data.email || newPatient.email;
          newPatient.phone = data.phone || newPatient.phone;
          newPatient.cpf = data.cpf || newPatient.cpf;
          newPatient.birthDate = data.birthDate || newPatient.birthDate;
          newPatient.answers = { ...newPatient.answers, ...(data.answers || {}) };
          
          if (data.name) get().setUserName(data.name);
          if (data.phone) get().setUserPhone(data.phone);
          if (data.cpf) get().setUserCpf(data.cpf);
          if (data.birthDate) get().setUserBirthDate(data.birthDate);
          if (data.answers) {
            Object.entries(data.answers).forEach(([k, v]) => get().setAnswer(k, v));
          }
        }
      } catch (e) {
        console.warn("Failed to fetch user data for queue hydration:", e);
      }
    }`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/store/useStore.ts', code);
  console.log("Successfully patched joinQueue");
} else {
  console.log("Could not find the exact oldCode block");
}
