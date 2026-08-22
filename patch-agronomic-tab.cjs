const fs = require('fs');

let code = fs.readFileSync('src/screens/AdminDashboardScreen.tsx', 'utf-8');

// 1. Add FileText, Download to icons
if (!code.includes('FileText')) {
    code = code.replace("  Users,", "  Users,\n  FileText,\n  Download,");
}

// 2. Add 'agronomic' to the activeTab state types
code = code.replace(
    "useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'coupons' | 'notifications'>('overview')",
    "useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications'>('overview')"
);

// 3. Add to the tabs array
const oldTabs = `          { id: 'catalog', label: 'Assistente IA', icon: Pill },
          { id: 'coupons', label: 'Cupons', icon: Ticket },`;
const newTabs = `          { id: 'catalog', label: 'Assistente IA', icon: Pill },
          { id: 'agronomic', label: 'Laudo Agronômico', icon: FileText },
          { id: 'coupons', label: 'Cupons', icon: Ticket },`;
code = code.replace(oldTabs, newTabs);

// 4. Add states for the agronomic form
const newStates = `
  // Agronomic Report States
  const [agronomicMedicalReport, setAgronomicMedicalReport] = useState('');
  const [agronomicPrescription, setAgronomicPrescription] = useState('');
  const [agronomicResult, setAgronomicResult] = useState('');
  const [isAgronomicLoading, setIsAgronomicLoading] = useState(false);

  const handleGenerateAgronomic = async () => {
    if (!agronomicMedicalReport || !agronomicPrescription) {
       alert("Preencha o laudo médico e a receita.");
       return;
    }
    setIsAgronomicLoading(true);
    setAgronomicResult('');
    try {
      const response = await fetch('/api/admin-agronomic-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           medicalReportText: agronomicMedicalReport,
           prescriptionText: agronomicPrescription
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAgronomicResult(data.markdown);
    } catch (e: any) {
      alert("Erro ao gerar laudo: " + e.message);
    } finally {
      setIsAgronomicLoading(false);
    }
  };

  const handleCopyAgronomic = () => {
     if (agronomicResult) {
        navigator.clipboard.writeText(agronomicResult);
        alert("Laudo copiado para a área de transferência!");
     }
  };
`;

// Insert the new states right after `const [aiInputText, setAiInputText] = useState('');` or similar
code = code.replace("const [aiInputText, setAiInputText] = useState('');", "const [aiInputText, setAiInputText] = useState('');\n" + newStates);

// 5. Add the JSX for the agronomic tab
const agronomicJsx = `
        {activeTab === 'agronomic' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
               <FileText className="text-mecura-neon" /> Gerador de Laudo Agronômico (IA)
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                     <h3 className="text-lg font-bold mb-4 text-white">1. Textos Base</h3>
                     <p className="text-sm text-[#8A8A9E] mb-4">Cole o texto do laudo médico e a receita do paciente.</p>
                     
                     <label className="block text-sm font-bold text-white mb-2">Laudo Médico (Histórico Clínico)</label>
                     <textarea 
                        value={agronomicMedicalReport}
                        onChange={(e) => setAgronomicMedicalReport(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-3 text-sm text-white focus:border-mecura-neon h-32 resize-none mb-4"
                        placeholder="Ex: Paciente com dor lombar..."
                     />

                     <label className="block text-sm font-bold text-white mb-2">Receita Médica</label>
                     <textarea 
                        value={agronomicPrescription}
                        onChange={(e) => setAgronomicPrescription(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-3 text-sm text-white focus:border-mecura-neon h-32 resize-none mb-6"
                        placeholder="Ex: 1. Óleo Integral THC/CBD 100mg/ml - Tomar 10 gotas..."
                     />
                     
                     <Button 
                        onClick={handleGenerateAgronomic} 
                        disabled={isAgronomicLoading}
                        className="w-full py-4 text-black font-bold text-lg"
                     >
                        {isAgronomicLoading ? 'Gerando Laudo Analítico...' : 'Gerar Parecer Técnico'}
                     </Button>
                  </div>
               </div>

               <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-white">Resultado (Parecer)</h3>
                     {agronomicResult && (
                        <button onClick={handleCopyAgronomic} className="flex items-center gap-2 text-mecura-neon hover:text-white transition-colors text-sm font-bold">
                           <Download className="w-4 h-4" /> Copiar Texto
                        </button>
                     )}
                  </div>
                  <div className="flex-1 bg-[#0A0A0F] border border-[#262636] rounded-xl p-4 overflow-y-auto">
                     {isAgronomicLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#8A8A9E] space-y-4">
                           <BrainCircuit className="w-12 h-12 animate-pulse text-mecura-neon" />
                           <p>A IA está calculando as dosagens e projetando o cultivo...</p>
                        </div>
                     ) : agronomicResult ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:text-[#8A8A9E] prose-li:text-[#8A8A9E]" dangerouslySetInnerHTML={{ __html: agronomicResult.replace(/\n/g, '<br />') }} />
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[#8A8A9E]">
                           <FileText className="w-8 h-8 mb-2 opacity-50" />
                           <p className="text-center text-sm">O laudo gerado aparecerá aqui.<br/>Preencha os dados e clique em "Gerar".</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}`;

// Insert JSX before {activeTab === 'coupons'
code = code.replace("{activeTab === 'coupons'", agronomicJsx + "\n        {activeTab === 'coupons'");

fs.writeFileSync('src/screens/AdminDashboardScreen.tsx', code);
