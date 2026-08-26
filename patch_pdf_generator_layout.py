import re
with open("src/utils/pdfGenerator.ts", "r") as f:
    code = f.read()

old_patient_box = """  // Patient Info Box
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

  // Body"""

new_patient_box = """  // Patient Info Box (Matching exactly the provided layout)
  // Divider 1
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Paciente:", margin, currentY);
  
  doc.setFont("helvetica", "normal");
  const cpfFormatted = cpfText !== 'Não informado' ? cpfText : '';
  const spacer = cpfFormatted ? ' - ' : '';
  doc.text(`${cpfFormatted}${spacer}${sanitizedUserName}`, margin + 20, currentY);

  const sex = patientAnswers?.sex === 'M' || patientAnswers?.sex?.toLowerCase() === 'masculino' ? 'Masculino' : 
              (patientAnswers?.sex === 'F' || patientAnswers?.sex?.toLowerCase() === 'feminino' ? 'Feminino' : 'Não informado');
  
  let age = '';
  if (patientAnswers?.birthDate || birthDateText) {
    const b = patientAnswers?.birthDate || birthDateText;
    const parts = b.split('/');
    if (parts.length === 3) {
      const birth = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      const diffMs = Date.now() - birth.getTime();
      const ageDate = new Date(diffMs);
      age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
    }
  }

  doc.setFont("helvetica", "bold");
  doc.text("Sexo:", pageWidth - margin - 50, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(sex, pageWidth - margin - 38, currentY);
  
  doc.setFont("helvetica", "bold");
  doc.text("Idade:", pageWidth - margin - 15, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(age || '-', pageWidth - margin - 3, currentY);

  currentY += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Endereço", margin, currentY);
  doc.setFont("helvetica", "normal");
  const address = patientAnswers?.address || "Não informado";
  doc.text(address, margin + 20, currentY);

  currentY += 4;
  // Divider 2
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  currentY += 20;

  // Body"""

code = code.replace(old_patient_box, new_patient_box)

# Now fix the body text to EXACTLY match what was in the image.
old_body_text = """  const textBody = `Após avaliação clínica do paciente, atesto que, embora o paciente faça uso de cannabis medicinal, ele se encontra, no momento da avaliação, apto a conduzir veículos automotores e operar maquinário, sem prejuízo à sua capacidade psicomotora.

O paciente foi avaliado apresentando condições clínicas estáveis, sem evidência de comprometimento da atenção, reflexos ou coordenação motora, compatíveis com a condução segura de veículos, de acordo com o tratamento prescrito.

Recomendo, no entanto, que o paciente evite o uso de cannabis imediatamente antes de atividades que requeiram alta concentração ou situações de risco (e evite dirigir nas primeiras horas após o uso caso sinta qualquer alteração de reflexo), além de seguir as orientações médicas e posológicas continuamente.

Este laudo é emitido para fins de comprovação médica da capacidade laborativa e psicomotora do paciente e segue em conformidade com o acompanhamento médico atual.`;"""

new_body_text = """  const textBody = `Após avaliação clínica do paciente, atesto que, embora o paciente faça uso de cannabis medicinal com concentração de THC, ele se encontra, no momento da avaliação, apto a conduzir veículos, sem prejuízo à sua capacidade psicomotora.
O paciente foi avaliado apresentando condições clínicas estáveis, sem evidência de comprometimento da atenção, reflexos ou coordenação motora, compatíveis com a condução segura de veículos.
Recomendo, no entanto, que o paciente evite o uso de cannabis antes de atividades que requeiram alta concentração ou situações de risco, além de seguir as orientações médicas continuamente.`;"""

code = code.replace(old_body_text, new_body_text)

# Also let's remove the "LAUDO MÉDICO PSICOMOTOR" title if it wasn't there?
# Looking at the image, there is NO title "LAUDO MÉDICO PSICOMOTOR" and NO header block "Mecura" in that snippet, but usually it's below a letterhead. I'll leave the title or just remove it to match exactly.
# The image shows just the dividers and the text. I will remove the "LAUDO MÉDICO PSICOMOTOR" title to be safe and just have the dividers.
old_title = """  let currentY = 55;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("LAUDO MÉDICO PSICOMOTOR", pageWidth / 2, currentY, { align: "center" });
  currentY += 15;"""

new_title = """  let currentY = 55;"""

code = code.replace(old_title, new_title)

# Also let's remove the "addHeader()" call if it wasn't there? Actually wait, the user's image is just a snippet. The letterhead is fine.

with open("src/utils/pdfGenerator.ts", "w") as f:
    f.write(code)

print("Patched PDF Layout")
