const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

const targetPoint = `      <AnimatePresence>
        {showAccessiblePlanModal && (`;

const newCode = `      <AnimatePresence>
        {/* IMPORTED Accessible Protocol Modal */}
        {showAccessibleImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setShowAccessibleImportModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#0F1017] border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col max-h-[92vh] z-10"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-transparent flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-lg">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        Protocolo de Entrada Acessível
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        Catálogo Importado
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-mecura-silver leading-relaxed">
                      Alternativa com excelente custo-benefício para iniciar com <strong>01 frasco Importado de alto rendimento (~60 dias)</strong> e evoluir progressivamente conforme a resposta clínica e as condições do paciente.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAccessibleImportModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-mecura-silver hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Step 1: Select Formulation */}
                <div>
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">1</span>
                    Selecione a Formulação de Entrada (Frasco Único)
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Option CBD */}
                    <div 
                      onClick={() => setAccessibleImportType('cbd')}
                      className={\`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between \${
                        accessibleImportType === 'cbd'
                          ? 'bg-blue-950/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-blue-500/40 hover:bg-mecura-surface/70'
                      }\`}
                    >
                      {accessibleImportType === 'cbd' && (
                        <div className="absolute top-2 right-2 text-blue-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30 inline-block mb-2">
                          Ansiedade / Estresse / Foco
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          Óleo GreenBudz CBD Isolate / Broad
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Alta concentração de Canabidiol. Ação ansiolítica, reguladora do humor e anti-inflamatória, zero THC.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-blue-400 font-semibold flex items-center justify-between">
                        <span>30ml • Rende ~60 dias</span>
                        <span className="text-white/80">3 gotas 2x/dia</span>
                      </div>
                    </div>

                    {/* Option Balanced */}
                    <div 
                      onClick={() => setAccessibleImportType('balanced')}
                      className={\`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between \${
                        accessibleImportType === 'balanced'
                          ? 'bg-blue-950/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-blue-500/40 hover:bg-mecura-surface/70'
                      }\`}
                    >
                      {accessibleImportType === 'balanced' && (
                        <div className="absolute top-2 right-2 text-blue-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 inline-block mb-2">
                          Insônia / Regulação do Sono
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          Drops By GreenBudz CBD+CBN
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Proporção ideal (CBN e CBD) focada em indução do sono, relaxamento noturno e manutenção.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-blue-400 font-semibold flex items-center justify-between">
                        <span>30ml • Rende ~60 dias</span>
                        <span className="text-white/80">3-6 gotas à noite</span>
                      </div>
                    </div>

                    {/* Option THC */}
                    <div 
                      onClick={() => setAccessibleImportType('thc')}
                      className={\`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between \${
                        accessibleImportType === 'thc'
                          ? 'bg-blue-950/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-blue-500/40 hover:bg-mecura-surface/70'
                      }\`}
                    >
                      {accessibleImportType === 'thc' && (
                        <div className="absolute top-2 right-2 text-blue-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded border border-orange-500/30 inline-block mb-2">
                          Dor Crônica / Rigidez
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          Drops By GreenBudz CBD+THC
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Proporção rica em THC e CBD para analgesia profunda, controle de espasmos musculares.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-blue-400 font-semibold flex items-center justify-between">
                        <span>30ml • Rende ~60 dias</span>
                        <span className="text-white/80">3 gotas 12/12h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Protocol Explanation (Static visual representation of the path) */}
                <div>
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">
                      <TrendingUp className="w-3 h-3" />
                    </span>
                    Plano de Evolução do Tratamento
                  </label>
                  
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 p-4 rounded-xl bg-mecura-surface border border-mecura-elevated">
                      <h5 className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        Fase 1: Início Acessível (Meses 1 e 2)
                      </h5>
                      <p className="text-[11px] text-mecura-silver leading-relaxed">
                        Uso exclusivo do frasco Importado com titulação lenta (inicia com gotas reduzidas e ajusta 1 gota a cada 5 dias). Custo previsível e baixo consumo.
                      </p>
                    </div>
                    
                    <div className="flex-1 p-4 rounded-xl bg-blue-900/10 border border-blue-900/30">
                      <h5 className="text-xs font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Fase 2: Reavaliação (Mês 2 em diante)
                      </h5>
                      <p className="text-[11px] text-mecura-silver leading-relaxed opacity-80">
                        Retorno clínico. Se houver controle adequado (superior a 70%), mantém apenas a monoterapia. Caso persistam sintomas, ajustar dose mantendo segurança financeira.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Custom Text */}
                <div>
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">2</span>
                    Mensagem Acolhedora para o Paciente (Chat)
                    <span className="ml-auto text-[9px] text-mecura-silver/50 font-normal normal-case">(editável antes do envio)</span>
                  </label>
                  <textarea
                    value={accessibleImportCustomMessage}
                    onChange={(e) => setAccessibleImportCustomMessage(e.target.value)}
                    placeholder="Ex: 'Como conversamos sobre o orçamento, estou enviando este tratamento de entrada. Ele durará cerca de 60 dias...'"
                    className="w-full h-24 p-3.5 bg-[#0F1017] border border-mecura-elevated rounded-xl text-[13px] text-white placeholder-mecura-silver/50 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none shadow-inner"
                  />
                  {accessibleImportCustomMessage.length === 0 && (
                    <div className="mt-2 text-[10px] text-orange-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Você pode personalizar esta mensagem ou deixá-la em branco para usar o padrão da clínica.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-6 border-t border-mecura-elevated/50 bg-[#0F1017] flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                <button 
                  onClick={() => setShowAccessibleImportModal(false)}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-mecura-silver hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      const productData = {
                        name: accessibleImportType === 'cbd' ? "CBD Isolate Alto Rendimento" : 
                              accessibleImportType === 'balanced' ? "Drops By GreenBudz CBD+CBN Sleep" : 
                              "Drops By GreenBudz Formula CBD/THC",
                        brand: 'GreenBudzCBD',
                        origin: 'Importado',
                        type: "Óleo de Cannabis",
                        dosage: accessibleImportType === 'cbd' ? "Iniciar com 2 gotas 2x/dia. Titulação lenta." :
                                accessibleImportType === 'balanced' ? "Iniciar com 3 gotas 30 min antes de deitar." :
                                "Iniciar com 2 gotas 12/12h. Aumentar 1 gota após 5 dias.",
                        strategy: "Plano de entrada otimizado para custo-benefício (Importado)."
                      };
                      
                      const msg = accessibleImportCustomMessage.trim() || 
                        "Olá! Pensando na sua acessibilidade, estruturei um Protocolo de Entrada Acessível utilizando nosso Catálogo Oficial Importado.\\n\\nIniciaremos com apenas 01 medicamento de alto rendimento que dura cerca de 2 meses com a dosagem ajustada. Este protocolo nos permite iniciar o tratamento de forma segura, com excelente qualidade e menor impacto financeiro inicial.";
                      
                      addMessage({
                        text: \`**Protocolo de Entrada (Importado)**\\n\\n\${msg}\\n\\n**Medicamento Prescrito:**\\n\${productData.name} - \${productData.dosage}\`,
                        sender: 'doctor',
                        type: 'product',
                        productData
                      });
                      
                      setShowAccessibleImportModal(false);
                      setAccessibleImportCustomMessage('');
                    }}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-400 hover:to-indigo-300 text-white font-bold text-xs md:text-sm rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Prescrever e Enviar ao Paciente
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showAccessiblePlanModal && (`

dashboardCode = dashboardCode.replace(targetPoint, newCode);
fs.writeFileSync(dashboardPath, dashboardCode);
