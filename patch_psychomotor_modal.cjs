const fs = require('fs');
let code = fs.readFileSync('src/components/PsychomotorReportEditorModal.tsx', 'utf-8');

// Replace the flex container and its children classes
code = code.replace(
  '<div className="flex-1 overflow-hidden relative">',
  '<div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">'
);

code = code.replace(
  '<div className="absolute inset-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar">',
  '<div className="max-w-4xl mx-auto">'
);

code = code.replace(
  '<div className="h-full bg-white text-black p-8 overflow-y-auto">',
  '<div className="bg-white rounded-lg mx-auto w-full max-w-[794px] p-6 md:p-10 shadow-lg">'
);

fs.writeFileSync('src/components/PsychomotorReportEditorModal.tsx', code);
