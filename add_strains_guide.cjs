const fs = require('fs');

const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

const injection = `
                    {category.id === 'concentrados' && (
                      <div className="p-4 md:p-5 bg-black/40 border border-mecura-neon/30 rounded-xl mb-4">
                        <h4 className="font-bold text-mecura-neon mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" /> Guia de Apoio à Prescrição Médica: Qual Extração Escolher?
                        </h4>
                        <p className="text-[11px] md:text-xs text-mecura-silver leading-relaxed mb-4">
                          As extrações concentradas possuem <strong>Cepas (Strains)</strong> específicas com perfis de terpenos desenhados para diferentes patologias. Escolha o formato da extração com base na preferência de manuseio e a <strong>Cepa</strong> com base no objetivo clínico:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-mecura-neon/5 rounded-lg border border-mecura-neon/10">
                            <div className="font-bold text-mecura-pearl text-xs md:text-sm mb-1">Dor Aguda e Insônia Profunda</div>
                            <div className="text-[11px] text-mecura-silver mb-1"><strong>Cepas Indicadas:</strong> LC (Stirred) e BM (Granulated, Dried)</div>
                            <div className="text-[10px] text-mecura-silver/80"><strong>Terpenos:</strong> Mirceno + Cariofileno (Sedativo e Analgésico)</div>
                          </div>
                          
                          <div className="p-3 bg-mecura-neon/5 rounded-lg border border-mecura-neon/10">
                            <div className="font-bold text-mecura-pearl text-xs md:text-sm mb-1">Ansiedade Severa e Inflamação</div>
                            <div className="text-[11px] text-mecura-silver mb-1"><strong>Cepas Indicadas:</strong> ICC (Stirred, Crystalized) e AH (Stirred)</div>
                            <div className="text-[10px] text-mecura-silver/80"><strong>Terpenos:</strong> Mirceno + Limoneno + Linalol (Relaxante e Anti-inflamatório)</div>
                          </div>

                          <div className="p-3 bg-mecura-neon/5 rounded-lg border border-mecura-neon/10">
                            <div className="font-bold text-mecura-pearl text-xs md:text-sm mb-1">Foco, TDAH, Depressão e Fadiga</div>
                            <div className="text-[11px] text-mecura-silver mb-1"><strong>Cepas Indicadas:</strong> TW (Stirred, Granulated) e PR (Dried)</div>
                            <div className="text-[10px] text-mecura-silver/80"><strong>Terpenos:</strong> Terpinoleno + Limoneno + Pineno (Estimulante e Focado)</div>
                          </div>

                          <div className="p-3 bg-mecura-neon/5 rounded-lg border border-mecura-neon/10">
                            <div className="font-bold text-mecura-pearl text-xs md:text-sm mb-1">Flexibilidade Analgésica (Sem sedar)</div>
                            <div className="text-[11px] text-mecura-silver mb-1"><strong>Cepas Indicadas:</strong> CD (Granulated) e DS (Dried)</div>
                            <div className="text-[10px] text-mecura-silver/80"><strong>Terpenos:</strong> Cariofileno + Limoneno (Relaxante, Analgésico sem sedação pesada)</div>
                          </div>
                        </div>
                      </div>
                    )}
`;

code = code.replace(
  `{/* Dosage Guidance Card */}`,
  `{/* Dosage Guidance Card */}` + injection
);

fs.writeFileSync(path, code);
