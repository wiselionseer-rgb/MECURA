const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

// Patch 1: Ficha do Paciente (Compact view)
const oldCode1 = `                        <div className="space-y-2.5">
                          {parseMedications(analysisResult).filter(med => med.name).map((med, idx) => {
                            const isAdded = addedMedications.includes(med.name);
                            const isNational = med.origin === 'Nacional';
                            return (
                              <button
                                key={idx}
                                onClick={() => addPrescribedMedication(med)}
                                disabled={isAdded}
                                className={\`w-full p-3 border rounded-xl text-left transition-all group relative overflow-hidden \${
                                  isAdded 
                                    ? 'bg-mecura-neon/10 border-mecura-neon cursor-default' 
                                    : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50 cursor-pointer'
                                }\`}
                              >
                                {isAdded && (
                                  <div className="absolute top-0 right-0 p-2 text-mecura-neon bg-mecura-neon/20 rounded-bl-xl shadow-sm">
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className={\`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider \${
                                    isNational 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  }\`}>
                                    {isNational ? '🇧🇷 Associação Nacional' : '🌐 Importado'}
                                  </span>
                                </div>
                                <h5 className={\`font-bold text-xs mb-0.5 transition-colors \${
                                  isAdded ? 'text-mecura-neon' : 'text-white group-hover:text-mecura-neon'
                                }\`}>{med.name}</h5>
                                <p className="text-[10px] text-mecura-silver pr-8 leading-tight">{med.dosage}</p>
                              </button>
                            );
                          })}
                        </div>`;

const newCode1 = `                        <div className="space-y-5">
                          {(() => {
                            const allMeds = parseMedications(analysisResult).filter(med => med.name);
                            const importedMeds = allMeds.filter(med => med.origin !== 'Nacional');
                            const nationalMeds = allMeds.filter(med => med.origin === 'Nacional');
                            
                            const renderMed = (med, idx, isNational) => {
                              const isAdded = addedMedications.includes(med.name);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => addPrescribedMedication(med)}
                                  disabled={isAdded}
                                  className={\`w-full p-3 border rounded-xl text-left transition-all group relative overflow-hidden \${
                                    isAdded 
                                      ? 'bg-mecura-neon/10 border-mecura-neon cursor-default' 
                                      : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50 cursor-pointer'
                                  }\`}
                                >
                                  {isAdded && (
                                    <div className="absolute top-0 right-0 p-2 text-mecura-neon bg-mecura-neon/20 rounded-bl-xl shadow-sm">
                                      <CheckCircle className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className={\`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider \${
                                      isNational 
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    }\`}>
                                      {isNational ? '🇧🇷 Associação Nacional' : '🌐 Importado'}
                                    </span>
                                  </div>
                                  <h5 className={\`font-bold text-xs mb-0.5 transition-colors \${
                                    isAdded ? 'text-mecura-neon' : 'text-white group-hover:text-mecura-neon'
                                  }\`}>{med.name}</h5>
                                  <p className="text-[10px] text-mecura-silver pr-8 leading-tight">{med.dosage}</p>
                                </button>
                              );
                            };

                            return (
                              <>
                                {importedMeds.length > 0 && (
                                  <div className="space-y-2.5">
                                    <h5 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider border-b border-blue-500/20 pb-1">Tratamento Principal (Importados)</h5>
                                    {importedMeds.map((med, idx) => renderMed(med, idx, false))}
                                  </div>
                                )}
                                {nationalMeds.length > 0 && (
                                  <div className="space-y-2.5 mt-4">
                                    <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 pb-1">Alternativa (Nacionais)</h5>
                                    {nationalMeds.map((med, idx) => renderMed(med, idx, true))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>`;

code = code.replace(oldCode1, newCode1);

// Patch 2: Main view
const oldCode2 = `                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parseMedications(analysisResult).filter(med => med.name).map((med, idx) => {
                        const isAdded = addedMedications.includes(med.name);
                        const isNational = med.origin === 'Nacional';
                        return (
                          <button
                            key={idx}
                            onClick={() => addPrescribedMedication(med)}
                            disabled={isAdded}
                            className={\`p-4 border rounded-xl text-left transition-all group relative overflow-hidden \${
                              isAdded
                                ? 'bg-mecura-neon/10 border-mecura-neon cursor-default'
                                : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50 cursor-pointer'
                            }\`}
                          >
                            {isAdded && (
                              <div className="absolute top-0 right-0 p-3 text-mecura-neon bg-mecura-neon/20 rounded-bl-xl shadow-sm">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={\`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider \${
                                isNational 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }\`}>
                                {isNational ? '🇧🇷 Associação Nacional' : '🌐 Importado'}
                              </span>
                            </div>
                            <h4 className={\`font-bold mb-1 transition-colors \${
                              isAdded ? 'text-mecura-neon' : 'text-white group-hover:text-mecura-neon'
                            }\`}>{med.name}</h4>
                            <p className="text-xs text-mecura-silver mb-3 pr-10">{med.dosage}</p>
                            <span className="text-[10px] font-bold text-mecura-neon uppercase">
                              {isAdded ? 'Adicionado ao Chat' : 'Adicionar ao Chat'}
                            </span>
                          </button>
                        );
                      })}
                    </div>`;

const newCode2 = `                    <div className="space-y-8">
                      {(() => {
                        const allMeds = parseMedications(analysisResult).filter(med => med.name);
                        const importedMeds = allMeds.filter(med => med.origin !== 'Nacional');
                        const nationalMeds = allMeds.filter(med => med.origin === 'Nacional');
                        
                        const renderMed = (med, idx, isNational) => {
                          const isAdded = addedMedications.includes(med.name);
                          return (
                            <button
                              key={idx}
                              onClick={() => addPrescribedMedication(med)}
                              disabled={isAdded}
                              className={\`p-4 border rounded-xl text-left transition-all group relative overflow-hidden \${
                                isAdded
                                  ? 'bg-mecura-neon/10 border-mecura-neon cursor-default'
                                  : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50 cursor-pointer'
                              }\`}
                            >
                              {isAdded && (
                                <div className="absolute top-0 right-0 p-3 text-mecura-neon bg-mecura-neon/20 rounded-bl-xl shadow-sm">
                                  <CheckCircle className="w-5 h-5" />
                                </div>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <span className={\`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider \${
                                  isNational 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }\`}>
                                  {isNational ? '🇧🇷 Associação Nacional' : '🌐 Importado'}
                                </span>
                              </div>
                              <h4 className={\`font-bold mb-1 transition-colors \${
                                isAdded ? 'text-mecura-neon' : 'text-white group-hover:text-mecura-neon'
                              }\`}>{med.name}</h4>
                              <p className="text-xs text-mecura-silver mb-3 pr-10">{med.dosage}</p>
                              <span className="text-[10px] font-bold text-mecura-neon uppercase">
                                {isAdded ? 'Adicionado ao Chat' : 'Adicionar ao Chat'}
                              </span>
                            </button>
                          );
                        };

                        return (
                          <>
                            {importedMeds.length > 0 && (
                              <div>
                                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 border-b border-blue-500/20 pb-2">
                                  Tratamento Principal (Medicamentos Importados)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {importedMeds.map((med, idx) => renderMed(med, idx, false))}
                                </div>
                              </div>
                            )}
                            
                            {nationalMeds.length > 0 && (
                              <div>
                                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 border-b border-emerald-500/20 pb-2 mt-2">
                                  Alternativa (Medicamentos Nacionais)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {nationalMeds.map((med, idx) => renderMed(med, idx, true))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>`;

code = code.replace(oldCode2, newCode2);
fs.writeFileSync(path, code);
