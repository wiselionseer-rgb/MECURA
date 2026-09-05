const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

// Need to import the new function
code = code.replace(/enrichMedicationDetails \} from '\.\.\/data\/cbdGuide';/, "enrichMedicationDetails, getDiseaseClinicalDetails } from '../data/cbdGuide';");

// Now we replace the static content in the modal with dynamic data
const targetRegex = /<h3 className="font-bold text-white text-base mb-2">Fundamentação Clínica e Endocanabinoide<\/h3>[\s\S]*?(?=\{\/\* Orientations Card \*\/)/;

const replacement = `<h3 className="font-bold text-white text-base mb-2">Fundamentação Clínica e Endocanabinoide</h3>
                      
                      {(() => {
                        const clinical = getDiseaseClinicalDetails(selectedDisease.name);
                        return (
                          <>
                            <div className="bg-black/30 p-3 rounded-lg border border-white/5 mb-3">
                              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-mecura-neon" /> Mecanismo de Ação (Macro)
                              </h4>
                              <p className="text-[11px] text-mecura-silver leading-relaxed">
                                {clinical.mechanism}
                              </p>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg border border-white/5 mb-3">
                              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1">
                                <Info className="w-3.5 h-3.5 text-mecura-neon" /> Abordagem Terapêutica & Estratégia
                              </h4>
                              <p className="text-[11px] text-mecura-silver leading-relaxed">
                                {clinical.microApproach}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                <h4 className="text-[10px] uppercase font-bold text-red-400 mb-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Precauções e Contraindicações
                                </h4>
                                <p className="text-[11px] text-mecura-silver leading-relaxed">
                                  {clinical.contraindications}
                                </p>
                              </div>
                              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                <h4 className="text-[10px] uppercase font-bold text-mecura-neon mb-1 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Resultados Esperados (Outcomes)
                                </h4>
                                <p className="text-[11px] text-mecura-silver leading-relaxed">
                                  {clinical.expectedOutcomes}
                                </p>
                              </div>
                            </div>

                            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                              <h4 className="text-[10px] uppercase font-bold text-blue-400 mb-1 flex items-center gap-1">
                                <Info className="w-3 h-3" /> Evidências e Base Literária
                              </h4>
                              <p className="text-[10px] text-mecura-silver leading-relaxed italic">
                                "{clinical.keyStudies}"
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                `;

code = code.replace(targetRegex, replacement);

fs.writeFileSync(path, code);
console.log('Updated CBDGuideView to use dynamic clinical data');
