const fs = require('fs');
let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

const copyLogic = `  const handleCopyAgronomic = () => {
     if (agronomicResult) {
        navigator.clipboard.writeText(agronomicResult);
        alert("Laudo copiado para a área de transferência!");
     }
  };`;

const downloadLogic = `  const handleCopyAgronomic = () => {
     if (agronomicResult) {
        navigator.clipboard.writeText(agronomicResult);
        alert("Laudo copiado para a área de transferência!");
     }
  };
  
  const handleDownloadPDF = async () => {
      if (!agronomicResult) return;
      try {
          const html2pdf = (await import('html2pdf.js')).default;
          const element = document.getElementById('agronomic-report-content');
          if (!element) {
              alert("Conteúdo do laudo não encontrado na tela.");
              return;
          }
          const opt = {
              margin: 15,
              filename: 'Parecer_Tecnico_Agronomico.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          html2pdf().set(opt).from(element).save();
      } catch (e) {
          console.error("Erro ao gerar PDF:", e);
          alert("Erro ao gerar o arquivo PDF.");
      }
  };`;

code = code.replace(copyLogic, downloadLogic);

const oldButtons = `                     {agronomicResult && (
                        <button onClick={handleCopyAgronomic} className="flex items-center gap-2 text-mecura-neon hover:text-white transition-colors text-sm font-bold">
                           <Download className="w-4 h-4" /> Copiar Texto
                        </button>
                     )}`;

const newButtons = `                     {agronomicResult && (
                        <div className="flex gap-4">
                            <button onClick={handleCopyAgronomic} className="flex items-center gap-2 text-[#8A8A9E] hover:text-white transition-colors text-sm font-bold">
                               Copiar HTML
                            </button>
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 text-mecura-neon hover:text-white transition-colors text-sm font-bold">
                               <Download className="w-4 h-4" /> Baixar PDF
                            </button>
                        </div>
                     )}`;

code = code.replace(oldButtons, newButtons);

const oldMarkdownRender = `                     ) : agronomicResult ? (
                        <div className="markdown-body text-white">
                           <Markdown>{agronomicResult}</Markdown>
                        </div>
                     ) : (`;

const newMarkdownRender = `                     ) : agronomicResult ? (
                        <div className="bg-white p-6 rounded-xl overflow-hidden relative">
                           <div dangerouslySetInnerHTML={{ __html: agronomicResult }} />
                        </div>
                     ) : (`;

code = code.replace(oldMarkdownRender, newMarkdownRender);

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
