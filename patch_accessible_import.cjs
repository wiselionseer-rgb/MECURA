const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

// 1. Add state for the new modal
const stateMatch = `  const [showAccessiblePlanModal, setShowAccessiblePlanModal] = useState(false);`;
const stateReplacement = `  const [showAccessiblePlanModal, setShowAccessiblePlanModal] = useState(false);
  const [showAccessibleImportModal, setShowAccessibleImportModal] = useState(false);
  const [accessibleImportType, setAccessibleImportType] = useState<'cbd' | 'balanced' | 'thc'>('cbd');
  const [accessibleImportCustomMessage, setAccessibleImportCustomMessage] = useState('');`;

if (!dashboardCode.includes('showAccessibleImportModal')) {
    dashboardCode = dashboardCode.replace(stateMatch, stateReplacement);
}

// 2. Add the button in the UI next to the existing button
const buttonMatch = `                      {/* Accessible Plan Callout Banner */}
                      <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-1.5">
                          <HeartHandshake className="w-4 h-4 text-emerald-400" />
                          <h5 className="text-xs font-bold text-emerald-300">Paciente com Restrição Orçamentária?</h5>
                        </div>
                        <p className="text-[11px] text-mecura-silver mb-2.5 leading-snug">
                          Prescreva o plano de entrada com 1 frasco de alto rendimento de Associação Nacional e evolução progressiva.
                        </p>
                        <button
                          onClick={() => setShowAccessiblePlanModal(true)}
                          className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          Aplicar Protocolo Acessível
                        </button>
                      </div>`;

const buttonReplacement = `                      {/* Accessible Plan Callout Banner */}
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl relative overflow-hidden">
                          <div className="flex items-center gap-2 mb-1.5">
                            <HeartHandshake className="w-4 h-4 text-emerald-400" />
                            <h5 className="text-xs font-bold text-emerald-300">Entrada Nacional</h5>
                          </div>
                          <p className="text-[11px] text-mecura-silver mb-2.5 leading-snug">
                            1 frasco de alto rendimento de Associação Nacional.
                          </p>
                          <button
                            onClick={() => setShowAccessiblePlanModal(true)}
                            className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            Aplicar Protocolo Nacional
                          </button>
                        </div>
                        
                        <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl relative overflow-hidden">
                          <div className="flex items-center gap-2 mb-1.5">
                            <HeartHandshake className="w-4 h-4 text-blue-400" />
                            <h5 className="text-xs font-bold text-blue-300">Entrada Importada</h5>
                          </div>
                          <p className="text-[11px] text-mecura-silver mb-2.5 leading-snug">
                            1 frasco de alto rendimento do Catálogo Oficial Importado.
                          </p>
                          <button
                            onClick={() => setShowAccessibleImportModal(true)}
                            className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            Aplicar Protocolo Importado
                          </button>
                        </div>
                      </div>`;

dashboardCode = dashboardCode.replace(buttonMatch, buttonReplacement);

fs.writeFileSync(dashboardPath, dashboardCode);
