const fs = require('fs');

let viewPath = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(viewPath, 'utf8');

// 1. Add new state and useMemo
const stateTarget = `const { exchangeRate } = useStore();`;
const stateReplacement = `const { exchangeRate } = useStore();
  const [viewMode, setViewMode] = useState<'categories' | 'diseases'>('categories');
  const [selectedDisease, setSelectedDisease] = useState<{name: string, category: CBDCategory} | null>(null);

  const allDiseases = React.useMemo(() => {
    const diseases = [];
    productCategories.forEach(cat => {
      if (cat.indicationsList) {
        cat.indicationsList.forEach(ind => {
          diseases.push({ name: ind, category: cat });
        });
      }
    });
    return diseases.sort((a, b) => a.name.localeCompare(b.name));
  }, [productCategories]);`;

// Need to import React for useMemo if it's not there, let's just use `import React, { useState, useEffect }`
code = code.replace(/import \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect } from 'react';");
code = code.replace(stateTarget, stateReplacement);

// 2. Add Toggle for view mode in header
const headerTarget = `{/* Search & Actions Bar */}`;
const headerReplacement = `{/* View Mode Toggle */}
          <div className="flex bg-mecura-surface border border-mecura-elevated p-1 rounded-xl w-full md:w-auto mb-2 md:mb-0">
            <button
              onClick={() => setViewMode('categories')}
              className={\`flex-1 md:flex-none px-4 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-colors \${
                viewMode === 'categories' ? 'bg-mecura-surface-light text-white shadow-sm' : 'text-mecura-silver hover:text-white'
              }\`}
            >
              Visualizar por Categorias
            </button>
            <button
              onClick={() => setViewMode('diseases')}
              className={\`flex-1 md:flex-none px-4 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-colors \${
                viewMode === 'diseases' ? 'bg-mecura-surface-light text-white shadow-sm' : 'text-mecura-silver hover:text-white'
              }\`}
            >
              Visualizar por Doenças
            </button>
          </div>

          {/* Search & Actions Bar */}`;
code = code.replace(headerTarget, headerReplacement);

// 3. Conditional rendering of the main list
// The main list starts with <div id="cbd-guide-content"
const contentStartTarget = `<div id="cbd-guide-content" className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 no-scrollbar scroll-smooth">
        <div className="max-w-5xl mx-auto space-y-6">`;
const contentStartReplacement = `<div id="cbd-guide-content" className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 no-scrollbar scroll-smooth">
        <div className="max-w-5xl mx-auto space-y-6">
        
        {viewMode === 'diseases' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Protocolos por Patologia</h2>
              <p className="text-mecura-silver text-sm">Selecione uma doença para ver orientações profundas e os medicamentos indicados correspondentes da categoria de tratamento.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDiseases
                .filter(d => d.name.toLowerCase().includes(diseaseFilter.toLowerCase()) || d.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((disease, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDisease(disease)}
                  className="bg-mecura-surface hover:bg-mecura-surface-light border border-mecura-elevated hover:border-mecura-neon/50 rounded-xl p-4 text-left transition-all group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white group-hover:text-mecura-neon transition-colors">{disease.name}</h3>
                    <ChevronDown className="w-4 h-4 text-mecura-silver opacity-0 group-hover:opacity-100 transition-opacity rotate-[-90deg]" />
                  </div>
                  <div className="mt-auto pt-3 border-t border-white/5">
                    <span className="text-[10px] text-mecura-silver uppercase tracking-wider block mb-1">Categoria de Tratamento</span>
                    <span className="text-xs text-mecura-pearl line-clamp-1">{disease.category.title}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {allDiseases.filter(d => d.name.toLowerCase().includes(diseaseFilter.toLowerCase()) || d.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-mecura-silver mx-auto mb-3 opacity-40" />
                <p className="text-white font-bold">Nenhuma patologia encontrada</p>
                <p className="text-sm text-mecura-silver">Tente ajustar seus filtros de busca.</p>
              </div>
            )}
          </div>
        ) : (
          <>`;

code = code.replace(contentStartTarget, contentStartReplacement);

// 4. Close the Fragment at the end of the content
const contentEndTarget = `{filteredData.length === 0 && (
            <div className="text-center py-16 px-4 bg-mecura-surface border border-mecura-elevated rounded-2xl">
              <Search className="w-8 h-8 text-mecura-silver mx-auto mb-3 opacity-40" />
              <p className="text-white font-bold text-base">Nenhum produto encontrado</p>
              <p className="text-xs text-mecura-silver mt-1">
                Não encontramos produtos correspondentes a "{searchTerm}".
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategoryFilter('all'); }}
                className="mt-4 px-4 py-2 bg-mecura-surface-light hover:bg-mecura-surface text-mecura-neon rounded-xl text-xs font-bold border border-mecura-elevated transition-colors"
              >
                Limpar Busca e Filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;

const contentEndReplacement = `{filteredData.length === 0 && (
            <div className="text-center py-16 px-4 bg-mecura-surface border border-mecura-elevated rounded-2xl">
              <Search className="w-8 h-8 text-mecura-silver mx-auto mb-3 opacity-40" />
              <p className="text-white font-bold text-base">Nenhum produto encontrado</p>
              <p className="text-xs text-mecura-silver mt-1">
                Não encontramos produtos correspondentes a "{searchTerm}".
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategoryFilter('all'); }}
                className="mt-4 px-4 py-2 bg-mecura-surface-light hover:bg-mecura-surface text-mecura-neon rounded-xl text-xs font-bold border border-mecura-elevated transition-colors"
              >
                Limpar Busca e Filtros
              </button>
            </div>
          )}
          </>
        )}
        </div>
      </div>

      {/* Disease Detail Modal */}
      <AnimatePresence>
        {selectedDisease && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-mecura-surface border border-mecura-elevated rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-mecura-elevated flex items-start justify-between bg-gradient-to-r from-mecura-surface to-mecura-surface-light">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-mecura-neon font-bold mb-1 block">Protocolo Clínico Sugerido</span>
                  <h2 className="text-xl md:text-2xl font-bold text-white">{selectedDisease.name}</h2>
                  <p className="text-sm text-mecura-silver mt-1">
                    Tratamento classificado em: <strong className="text-mecura-pearl">{selectedDisease.category.title}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="p-2 hover:bg-white/5 rounded-xl text-mecura-silver hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-6 overflow-y-auto space-y-6">
                
                {/* Orientations Card */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-5">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-mecura-neon" />
                    Orientações e Perfil de Tratamento
                  </h3>
                  <p className="text-sm text-mecura-silver leading-relaxed mb-4">
                    {selectedDisease.category.description}
                  </p>
                  
                  <div className="bg-mecura-neon/5 border border-mecura-neon/20 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-mecura-neon uppercase tracking-wider mb-2">Posologia e Titulação Recomendada</h4>
                    <p className="text-sm text-mecura-pearl font-medium leading-relaxed">
                      {selectedDisease.category.dosageGuidance}
                    </p>
                  </div>
                </div>

                {/* Specific Category Tips (like we have for category extracts) */}
                {selectedDisease.category.products.some(p => p.type.includes('Concentrado')) && (
                  <div className="p-4 md:p-5 bg-[#0A0A0F] border border-white/10 rounded-xl">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" /> Guia de Cepas (Strains) e Terpenos
                    </h4>
                    <p className="text-xs text-mecura-silver leading-relaxed mb-3">
                      Ao prescrever extrações (Stirred, Dried, Granulated) para {selectedDisease.name}, leve em consideração o perfil de terpenos:
                    </p>
                    <ul className="text-xs text-mecura-silver space-y-2 list-disc list-inside">
                      <li><strong>Para relaxamento e analgesia:</strong> Cepas ricas em Mirceno e Linalol (ex: LC, ICC, BM)</li>
                      <li><strong>Para foco e disposição:</strong> Cepas ricas em Limoneno, Pineno e Terpinoleno (ex: TW, PR)</li>
                      <li><strong>Para analgesia sem sedação severa:</strong> Cepas ricas em Cariofileno (ex: CD, DS)</li>
                    </ul>
                  </div>
                )}

                {/* Recommended Products */}
                <div>
                  <h3 className="font-bold text-white mb-3">Medicamentos e Produtos Recomendados ({selectedDisease.category.products.length})</h3>
                  <div className="space-y-3">
                    {selectedDisease.category.products.map((product, idx) => {
                      const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type);
                      return (
                        <div key={idx} className="bg-mecura-surface-light/30 border border-mecura-elevated rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-white text-sm">{product.name}</h4>
                              <span className="text-[10px] text-mecura-silver uppercase tracking-wide">{product.manufacturer} • {product.type}</span>
                            </div>
                            {product.priceUSD && (
                              <span className="text-sm font-bold text-mecura-neon whitespace-nowrap bg-mecura-neon/10 px-2 py-1 rounded-lg">
                                R$ {(product.priceUSD * exchangeRate).toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-mecura-silver">
                            <div className="bg-black/20 p-2 rounded">
                              <span className="block font-bold text-mecura-pearl mb-0.5">Princípio Ativo:</span>
                              {enriched.activeIngredients}
                            </div>
                            <div className="bg-black/20 p-2 rounded">
                              <span className="block font-bold text-mecura-pearl mb-0.5">Apresentação:</span>
                              {enriched.pharmaceuticalForm} • {enriched.quantity}
                            </div>
                          </div>
                          
                          {enriched.usageInstructions && (
                            <div className="mt-2 bg-black/20 p-2 rounded text-[11px] text-mecura-silver border border-white/5">
                              <span className="block font-bold text-mecura-pearl mb-0.5">Sugestão de Posologia Bula:</span>
                              {enriched.usageInstructions}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-mecura-elevated bg-[#0A0A0F] flex justify-end">
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="px-6 py-2 bg-mecura-neon text-black font-bold rounded-xl hover:bg-mecura-neon/90 transition-colors"
                >
                  Fechar Protocolo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`;

code = code.replace(contentEndTarget, contentEndReplacement);

fs.writeFileSync(viewPath, code);
console.log('Successfully patched CBDGuideView with View Mode Toggle and Disease Modal');

