const fs = require('fs');
let code = fs.readFileSync('src/components/PsychomotorReportEditorModal.tsx', 'utf-8');

code = code.replace(
  '<div className="max-w-4xl mx-auto">\n                <div className="max-w-4xl mx-auto space-y-6">',
  '<div className="max-w-4xl mx-auto space-y-6">'
);

// We need to also remove the extra closing </div> for the one we removed
code = code.replace(
  '</div>\n              </div>\n            ) : (',
  '</div>\n            ) : ('
);

fs.writeFileSync('src/components/PsychomotorReportEditorModal.tsx', code);
