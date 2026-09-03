const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

// Add page break avoid to items
code = code.replace(
  '<div key={idx} className="border-b border-[#F1F5F9] pb-5">',
  '<div key={idx} className="border-b border-[#F1F5F9] pb-5" style={{ pageBreakInside: "avoid" }}>'
);

// Map customNotesText into multiple paragraphs with avoid
const oldNotes = `<div className="bg-[#F8FAFC] border-l-2 border-[#1E1B4B] p-4 text-xs text-[#334155] mt-6 rounded-r">
                  <span className="font-bold block text-[11px] uppercase text-[#475569] mb-1">Orientações Farmacológicas e Clínicas</span>
                  <p className="whitespace-pre-line text-[11px] leading-relaxed m-0">{customNotesText}</p>
                </div>`;

const newNotes = `<div className="bg-[#F8FAFC] border-l-2 border-[#1E1B4B] p-4 text-xs text-[#334155] mt-6 rounded-r">
                  <span className="font-bold block text-[11px] uppercase text-[#475569] mb-1">Orientações Farmacológicas e Clínicas</span>
                  <div className="flex flex-col gap-1.5">
                    {customNotesText.split('\\n').map((p, i) => p.trim() ? <p key={i} className="text-[11px] leading-relaxed m-0" style={{ pageBreakInside: "avoid" }} dangerouslySetInnerHTML={{ __html: p }}></p> : null)}
                  </div>
                </div>`;

if (code.includes(oldNotes)) {
    code = code.replace(oldNotes, newNotes);
} else {
    console.log("Could not find old notes");
}

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);
