import re
with open("src/utils/pdfGenerator.ts", "r") as f:
    code = f.read()

psychomotor_report = """
export const generatePsychomotorReportPDF = (
  userName: string,
  patientData?: MedicalReportData
) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for adding sanitized text
  const sanitize = (text: string) => {
    return (text || '')
      .replace(/[–—]/g, '-')
      .replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
  };

  const storeState = useStore.getState();
  const patientAnswers = patientData?.answers || storeState.answers;
  const rawPatientName = patientData?.customPatientName || userName || 'Paciente';
  const sanitizedUserName = sanitize(rawPatientName);
  const birthDateText = sanitize(patientData?.birthDate || storeState.userBirthDate || patientAnswers?.birthDate || 'Não informada');
  const cpfText = sanitize(patientData?.cpf || storeState.userCpf || patientAnswers?.cpf || 'Não informado');
  const emissionDateStr = patientData?.emissionDate || format(new Date(), 'dd/MM/yyyy');

  const doctorName = patientData?.customDoctorName || "Dr. Guilherme Taveira Dias";
  const doctorCrm = patientData?.customDoctorCrm || "CRM/MT 17259";
  const doctorSpecialty = patientData?.customDoctorSpecialty || "Especialista em Medicina Canabinoide";

  const addHeader = () => {
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138);
    doc.text("Mecura", margin, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Medicina Personalizada e Integrativa", margin, 26);
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.setFont("helvetica", "normal");
    const rightMargin = pageWidth - margin;
    doc.text(doctorName, rightMargin, 16, { align: "right" });
    doc.text(doctorCrm, rightMargin, 22, { align: "right" });
    doc.text(doctorSpecialty, rightMargin, 28, { align: "right" });
  };
  addHeader();

  let currentY = 55;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("LAUDO MÉDICO PSICOMOTOR", pageWidth / 2, currentY, { align: "center" });
  currentY += 15;

  // Patient Info Box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(margin, currentY, contentWidth, 25, 3, 3, 'FD');
  doc.setFontSize(10);
  
  doc.setFont("helvetica", "bold");
  doc.text("Paciente:", margin + 5, currentY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(sanitizedUserName, margin + 25, currentY + 8);

  doc.setFont("helvetica", "bold");
  doc.text("CPF:", pageWidth / 2 + 10, currentY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(cpfText, pageWidth / 2 + 25, currentY + 8);

  doc.setFont("helvetica", "bold");
  doc.text("Data Nasc.:", margin + 5, currentY + 18);
  doc.setFont("helvetica", "normal");
  doc.text(birthDateText, margin + 25, currentY + 18);

  doc.setFont("helvetica", "bold");
  doc.text("Data da Emissão:", pageWidth / 2 + 10, currentY + 18);
  doc.setFont("helvetica", "normal");
  doc.text(emissionDateStr, pageWidth / 2 + 35, currentY + 18);

  currentY += 40;

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  
  const textBody = `Após avaliação clínica do paciente, atesto que, embora o paciente faça uso de cannabis medicinal, ele se encontra, no momento da avaliação, apto a conduzir veículos automotores e operar maquinário, sem prejuízo à sua capacidade psicomotora.

O paciente foi avaliado apresentando condições clínicas estáveis, sem evidência de comprometimento da atenção, reflexos ou coordenação motora, compatíveis com a condução segura de veículos, de acordo com o tratamento prescrito.

Recomendo, no entanto, que o paciente evite o uso de cannabis imediatamente antes de atividades que requeiram alta concentração ou situações de risco (e evite dirigir nas primeiras horas após o uso caso sinta qualquer alteração de reflexo), além de seguir as orientações médicas e posológicas continuamente.

Este laudo é emitido para fins de comprovação médica da capacidade laborativa e psicomotora do paciente e segue em conformidade com o acompanhamento médico atual.`;

  const splitBody = doc.splitTextToSize(textBody, contentWidth);
  doc.text(splitBody, margin, currentY);
  currentY += splitBody.length * 5 + 30;

  // Signature
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("____________________________________________________", pageWidth / 2, currentY, { align: "center" });
  currentY += 6;
  doc.setFont("helvetica", "bold");
  doc.text(doctorName, pageWidth / 2, currentY, { align: "center" });
  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.text(doctorCrm, pageWidth / 2, currentY, { align: "center" });

  const safeName = sanitizedUserName.replace(/\s+/g, '_').toLowerCase();
  doc.save(`laudo_psicomotor_${safeName}.pdf`);
};
"""

code += psychomotor_report
with open("src/utils/pdfGenerator.ts", "w") as f:
    f.write(code)

print("Added generatePsychomotorReportPDF")
