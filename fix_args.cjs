const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');
code = code.replace(
  'export const generateMedicalReportPDF = async (userName: string) => {};',
  'export const generateMedicalReportPDF = async (userName: string, messages?: any, patientData?: any) => {};'
);
code = code.replace(
  'export const generatePsychomotorReportPDF = async (userName: string) => {};',
  'export const generatePsychomotorReportPDF = async (userName: string, messages?: any, patientData?: any) => {};'
);
fs.writeFileSync('src/utils/pdfGenerator.tsx', code);
