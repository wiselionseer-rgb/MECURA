import re
with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

bad = "onClick={() => generatePsychomotorReportPDF(currentPatient?.patientName || userName || 'Paciente', { customPatientName: currentPatient?.patientName || userName || 'Paciente', birthDate: currentPatient.birthDate, cpf: currentPatient.cpf, answers: currentPatient.answers })}"
good = "onClick={() => generatePsychomotorReportPDF(currentPatient?.patientName || userName || 'Paciente', { customPatientName: currentPatient?.patientName || userName || 'Paciente', birthDate: currentPatient?.birthDate, cpf: currentPatient?.cpf, answers: currentPatient?.answers })}"

code = code.replace(bad, good)

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)

print("Fixed onClick param null safety")
