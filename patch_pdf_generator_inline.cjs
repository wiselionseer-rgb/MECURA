const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

code = code.replace(
  '<div className="flex flex-col items-center w-[794px]" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>',
  '<div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>'
);

code = code.replace(
  '<div key={gIdx} className="w-[794px] h-[1123px] bg-[#FFFFFF] text-[#111827] relative p-12 border border-[#E2E8F0] box-border flex flex-col justify-between" style={{ pageBreakAfter: gIdx < guidesToRender.length - 1 ? "always" : "auto" }}>',
  '<div key={gIdx} className="relative p-12 border border-[#E2E8F0] box-border flex flex-col justify-between" style={{ width: "794px", height: "1123px", backgroundColor: "#FFFFFF", color: "#111827", pageBreakAfter: gIdx < guidesToRender.length - 1 ? "always" : "auto" }}>'
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);
