const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

// Update Medical Report PDF
code = code.replace(
  "html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },\n    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }",
  "html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },\n    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },\n    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }"
);

// We need to also apply pageBreakInside: 'avoid' to the blocks inside Medical Report
code = code.replace(
  /<p className="text-sm text-\[#334155\] leading-relaxed whitespace-pre-wrap">\{patientData\.customDiagnosis\}<\/p>/g,
  '<div className="text-sm text-[#334155] leading-relaxed flex flex-col gap-2">{patientData.customDiagnosis.split(\'\\n\').map((p: string, i: number) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }}>{p}</p> : <div key={i} className="h-2" />)}</div>'
);
code = code.replace(
  /<p className="text-sm text-\[#334155\] leading-relaxed whitespace-pre-wrap">\{patientData\.customRationale\}<\/p>/g,
  '<div className="text-sm text-[#334155] leading-relaxed flex flex-col gap-2">{patientData.customRationale.split(\'\\n\').map((p: string, i: number) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }}>{p}</p> : <div key={i} className="h-2" />)}</div>'
);
code = code.replace(
  /<p className="text-sm text-\[#334155\] leading-relaxed whitespace-pre-wrap">\{patientData\.customTreatmentPlan\}<\/p>/g,
  '<div className="text-sm text-[#334155] leading-relaxed flex flex-col gap-2">{patientData.customTreatmentPlan.split(\'\\n\').map((p: string, i: number) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }}>{p}</p> : <div key={i} className="h-2" />)}</div>'
);
code = code.replace(
  /<p className="text-sm text-\[#334155\] leading-relaxed whitespace-pre-wrap">\{patientData\.customMonitoring\}<\/p>/g,
  '<div className="text-sm text-[#334155] leading-relaxed flex flex-col gap-2">{patientData.customMonitoring.split(\'\\n\').map((p: string, i: number) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }}>{p}</p> : <div key={i} className="h-2" />)}</div>'
);

// We need to also apply pageBreakInside: 'avoid' to the blocks inside Psychomotor Report
code = code.replace(
  /<p>\n\s*Declaro, para os devidos fins de direito/g,
  '<p style={{ pageBreakInside: "avoid" }}>\n                Declaro, para os devidos fins de direito'
);
code = code.replace(
  /<p>\n\s*O\(a\) paciente faz uso terapêutico de produtos/g,
  '<p style={{ pageBreakInside: "avoid" }}>\n                O(a) paciente faz uso terapêutico de produtos'
);
code = code.replace(
  /<p>\n\s*Atesto, baseado em exames clínicos/g,
  '<p style={{ pageBreakInside: "avoid" }}>\n                Atesto, baseado em exames clínicos'
);
code = code.replace(
  /<p>\n\s*O tratamento prescrito não interfere/g,
  '<p style={{ pageBreakInside: "avoid" }}>\n                O tratamento prescrito não interfere'
);
code = code.replace(
  /<p>\n\s*Ressalto que os canabinoides prescritos têm finalidade/g,
  '<p style={{ pageBreakInside: "avoid" }}>\n                Ressalto que os canabinoides prescritos têm finalidade'
);


fs.writeFileSync('src/utils/pdfGenerator.tsx', code);
