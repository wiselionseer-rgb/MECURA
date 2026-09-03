const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf-8');

const oldCode = `  const handleStartConsultation = (patient: any) => {
    console.log("Starting consultation for:", patient);
    setCurrentPatient(patient);
    setAnalysisResult(null); // Reset previous analysis to allow fresh generation
    startConsultation(patient.id);`;

const newCode = `  const handleStartConsultation = async (patient: any) => {
    console.log("Starting consultation for:", patient);
    
    let enrichedPatient = { ...patient };
    // Fetch answers from users collection if they are missing
    if (!enrichedPatient.answers || Object.keys(enrichedPatient.answers).length === 0) {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const userDoc = await getDoc(doc(db, 'users', patient.id));
        if (userDoc.exists()) {
           const userData = userDoc.data();
           if (userData.answers) {
             enrichedPatient.answers = userData.answers;
           }
           enrichedPatient.patientName = userData.name || enrichedPatient.patientName;
           enrichedPatient.cpf = userData.cpf || enrichedPatient.cpf;
           enrichedPatient.birthDate = userData.birthDate || enrichedPatient.birthDate;
           enrichedPatient.phone = userData.phone || enrichedPatient.phone;
        }
      } catch (e) {
        console.warn("Failed to enrich patient data", e);
      }
    }

    setCurrentPatient(enrichedPatient);
    setAnalysisResult(null); // Reset previous analysis to allow fresh generation
    startConsultation(patient.id);`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code);
  console.log("Successfully patched DoctorDashboardScreen");
} else {
  console.log("Could not find the exact oldCode block");
}
