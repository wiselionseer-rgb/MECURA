const fs = require('fs');

let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

// Replace the end of generatePrescriptionPDF
code = code.replace(
  "  await html2pdf().set(opt).from(container).save();\n\n  root.unmount();\n  document.body.removeChild(container);\n};",
  "  await html2pdf().set(opt).from(container).save();\n\n  root.unmount();\n  document.body.removeChild(container);\n};\n\nexport const generatePrescriptionBlobUrl = async (\n  userName: string, \n  messages: Message[],\n  patientData?: PatientPrescriptionData\n): Promise<string> => {\n  const container = document.createElement('div');\n  container.style.position = 'absolute';\n  container.style.left = '-9999px';\n  container.style.top = '0';\n  document.body.appendChild(container);\n\n  const root = createRoot(container);\n  root.render(<PdfComponent />);\n\n  await new Promise(resolve => setTimeout(resolve, 800));\n\n  const opt = {\n    margin: 0,\n    filename: `Receita.pdf`,\n    image: { type: 'jpeg', quality: 1 },\n    html2canvas: { scale: 2, useCORS: true, logging: false },\n    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }\n  };\n\n  const pdfBlob = await html2pdf().set(opt).from(container).output('blob');\n\n  root.unmount();\n  document.body.removeChild(container);\n  return URL.createObjectURL(pdfBlob);\n};"
);

// We need to pass the same props to PdfComponent! But wait, I can just modify generatePrescriptionPDF to return a blob url and accept a boolean to save it or not.

