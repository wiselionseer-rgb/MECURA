const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

// Ensure necessary icons are imported
if (!code.includes('Users')) {
  code = code.replace(/import \{([^}]*)\} from 'lucide-react';/, "import { $1, Users, Activity, Stethoscope, TrendingUp, BookOpen } from 'lucide-react';");
}

const targetRegex = /<h3 className="font-bold text-white text-base mb-2">Fundamentação Clínica e Endocanabinoide<\/h3>[\s\S]*?(?=\{\/\* Orientations Card \*\/)/;

const uiReplacement = `
                    <div className="mb-4">
                      <h3 className="font-bold text-white text-xl mb-1">{selectedDisease.name}</h3>
                      <p className="text-mecura-silver text-sm">Tratamento classificado em: <strong className="text-white">{selectedCategory.name}</strong></p>
                    </div>

                    {/* Rich Clinical Document */}
                    <div className="bg-[#1A1D24] border border-white/5 rounded-xl overflow-hidden mb-8 shadow-xl">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-mecura-neon/10 to-transparent p-5 border-b border-white/5">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                          <Layers className="w-5 h-5 text-mecura-neon" /> 
                          Fundamentação clínica e endocanabinoide
                        </h3>
                      </div>
                      
                      {(() => {
                        const clinical = getDiseaseClinicalDetails(selectedDisease.name);
                        return (
                          <div className="p-0">
                            
                            {/* Mecanismo & Estratégia */}
                            <div className="p-6 space-y-5 border-b border-white/5 bg-black/20">
                              <div>
                                <p className="text-sm text-mecura-silver leading-relaxed">
                                  <strong className="text-white">Mecanismo de ação —</strong> {clinical.mechanism}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-mecura-silver leading-relaxed">
                                  <strong className="text-white">Estratégia terapêutica —</strong> {clinical.strategy}
                                </p>
                              </div>
                            </div>

                            {/* Perfil de Paciente */}
                            <div className="p-6 border-b border-white/5">
                              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-mecura-neon" /> Perfil de paciente elegível
                              </h4>
                              <ul className="space-y-3">
                                {clinical.eligiblePatientProfile.map((item, i) => (
                                  <li key={i} className="text-sm text-mecura-silver flex items-start gap-3">
                                    <span className="text-mecura-neon mt-1 text-lg leading-none">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Protocolo de Titulação */}
                            <div className="p-6 border-b border-mecura-neon/10 bg-mecura-neon/5">
                              <h4 className="text-sm font-bold text-mecura-neon mb-5 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Protocolo de titulação sugerido (referência de literatura)
                              </h4>
                              
                              <div className="space-y-4 mb-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                  <div className="text-sm text-mecura-silver font-medium flex items-center gap-2">Início (CBD)</div>
                                  <div className="text-sm text-white md:col-span-2">{clinical.titrationProtocol.start}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                  <div className="text-sm text-mecura-silver font-medium flex items-center gap-2">Titulação</div>
                                  <div className="text-sm text-white md:col-span-2">{clinical.titrationProtocol.titration}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                  <div className="text-sm text-mecura-silver font-medium flex items-center gap-2">Faixa usada em ensaios</div>
                                  <div className="text-sm text-white md:col-span-2">{clinical.titrationProtocol.range}</div>
                                </div>
                                {clinical.titrationProtocol.thc && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-white/5 pb-3">
                                    <div className="text-sm text-mecura-silver font-medium flex items-center gap-2">THC (se indicado)</div>
                                    <div className="text-sm text-white md:col-span-2">{clinical.titrationProtocol.thc}</div>
                                  </div>
                                )}
                              </div>
                              
                              {clinical.titrationProtocol.note && (
                                <div className="text-[13px] text-mecura-silver bg-black/40 p-4 rounded-lg border border-white/5 italic">
                                  {clinical.titrationProtocol.note}
                                </div>
                              )}
                            </div>

                            {/* Precauções */}
                            <div className="p-6 border-b border-amber-500/10 bg-amber-500/5">
                              <h4 className="text-sm font-bold text-amber-500 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Precauções, contraindicações e interações
                              </h4>
                              <ul className="space-y-3">
                                {clinical.precautions.map((item, i) => {
                                  const parts = item.split(': ');
                                  return (
                                    <li key={i} className="text-sm text-mecura-silver flex items-start gap-3">
                                      <span className="text-amber-500 mt-1 text-lg leading-none">•</span>
                                      <span>
                                        {parts.length > 1 ? (
                                          <>
                                            <strong className="text-white">{parts[0]}: </strong>
                                            {parts.slice(1).join(': ')}
                                          </>
                                        ) : (
                                          item
                                        )}
                                      </span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>

                            {/* Monitoramento & Resultados */}
                            <div className="p-6 border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                  <Stethoscope className="w-4 h-4 text-mecura-neon" /> Monitoramento clínico
                                </h4>
                                <ul className="space-y-3">
                                  {clinical.monitoring.map((item, i) => (
                                    <li key={i} className="text-[13px] text-mecura-silver flex items-start gap-2">
                                      <span className="text-mecura-silver mt-1 leading-none">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-mecura-neon" /> Resultados esperados
                                </h4>
                                <div className="space-y-3">
                                  {clinical.expectedOutcomes.map((item, i) => (
                                    <p key={i} className="text-[13px] text-mecura-silver leading-relaxed">
                                      {item}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Evidências */}
                            <div className="p-6">
                              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-mecura-neon" /> Evidências e base literária
                              </h4>
                              <ul className="space-y-2">
                                {clinical.evidences.map((item, i) => {
                                  const parts = item.split(' — ');
                                  return (
                                    <li key={i} className="text-[12px] text-mecura-silver flex items-start gap-2">
                                      <span className="text-mecura-silver mt-1 leading-none">•</span>
                                      <span>
                                        {parts.length > 1 ? (
                                          <>
                                            <span className="text-white">{parts[0]}</span> — {parts.slice(1).join(' — ')}
                                          </>
                                        ) : (
                                          item
                                        )}
                                      </span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                            
                            {/* Aviso */}
                            <div className="bg-red-500/10 border-t border-red-500/20 p-5 mt-2">
                              <p className="text-xs text-red-200/80 leading-relaxed text-justify">
                                <strong className="text-red-400">Aviso:</strong> este protocolo é uma ferramenta de apoio informativo à decisão clínica, gerada a partir de literatura científica e documentação referenciada. A responsabilidade final pelo diagnóstico, pela prescrição e pela titulação de doses é exclusiva do médico assistente, que deve considerar o histórico individual do paciente, contraindicações específicas e interações medicamentosas.
                              </p>
                            </div>

                          </div>
                        );
                      })()}
                    </div>

                `;

// We also need to remove the target from `<div className="bg-mecura-surface-light border border-mecura-elevated rounded-xl p-5 mb-6">` up to the orientation card.

const fullTargetRegex = /<div className="bg-mecura-surface-light border border-mecura-elevated rounded-xl p-5 mb-6">[\s\S]*?(?=\{\/\* Orientations Card \*\/)/;

code = code.replace(fullTargetRegex, uiReplacement);

fs.writeFileSync(path, code);
console.log('Updated CBDGuideView UI to render rich document-style clinical data');
