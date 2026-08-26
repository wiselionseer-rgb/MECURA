import re
with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

# Fix patientName
bad = "onClick={() => generatePsychomotorReportPDF(patientName, { customPatientName: patientName,"
good = "onClick={() => generatePsychomotorReportPDF(currentPatient?.patientName || userName || 'Paciente', { customPatientName: currentPatient?.patientName || userName || 'Paciente',"

code = code.replace(bad, good)

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)

print("Fixed onClick param")
