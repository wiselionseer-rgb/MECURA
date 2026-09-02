const fs = require('fs');

let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

code = code.replace(
  "export const generatePrescriptionPDF = async (\n  userName: string, \n  messages: Message[],\n  patientData?: PatientPrescriptionData\n) => {",
  "export const generatePrescriptionPDF = async (\n  userName: string, \n  messages: Message[],\n  patientData?: PatientPrescriptionData & { returnBlobUrl?: boolean }\n): Promise<string | void> => {"
);

code = code.replace(
  "await html2pdf().set(opt).from(container).save();\n\n  root.unmount();\n  document.body.removeChild(container);\n};",
  "if (patientData?.returnBlobUrl) {\n    const pdfBlob = await html2pdf().set(opt).from(container).output('blob');\n    root.unmount();\n    document.body.removeChild(container);\n    return URL.createObjectURL(pdfBlob);\n  }\n\n  await html2pdf().set(opt).from(container).save();\n\n  root.unmount();\n  document.body.removeChild(container);\n};"
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);
