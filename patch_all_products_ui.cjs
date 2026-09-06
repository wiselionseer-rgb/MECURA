const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStrStart = `) : viewMode === 'all_products' ? (`;
const targetStrEnd = `        ) : (
          <div className="space-y-6">
          {filteredData.map((category) => {`;

const startIndex = code.indexOf(targetStrStart);
const endIndex = code.indexOf(targetStrEnd) + targetStrEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `) : viewMode === 'all_products' ? (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Todos os Medicamentos</h2>
              <p className="text-mecura-silver text-sm mb-4">Navegue por todos os medicamentos (Nacionais e Importados) disponíveis na plataforma.</p>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setOriginFilter('all')}
                  className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors \${originFilter === 'all' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}\`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setOriginFilter('nacional')}
                  className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors \${originFilter === 'nacional' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}\`}
                >
                  Nacionais
                </button>
                <button
                  onClick={() => setOriginFilter('importado')}
                  className={\`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors \${originFilter === 'importado' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}\`}
                >
                  Importados
                </button>
              </div>
            </div>
            
            {/* GRID CARD VIEW - Responsive for all screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProducts
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .filter(p => originFilter === 'all' ? true : (originFilter === 'importado' ? p.origin?.toLowerCase().includes('importado') : !p.origin?.toLowerCase().includes('importado')))
                .map((product, idx) => {
                  const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type);
                  return (
                  <div 
                    key={idx} 
                    className="p-5 rounded-2xl bg-mecura-surface border border-mecura-elevated hover:border-mecura-neon/40 transition-all flex flex-col h-full shadow-lg"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-white leading-snug break-words">
                          {product.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-2 py-0.5 bg-mecura-surface-light text-mecura-silver rounded text-[10px] font-semibold border border-white/5 uppercase tracking-wide">
                            {product.manufacturer}
                          </span>
                          <span className={\`px-2 py-0.5 rounded text-[10px] font-bold border \${product.origin?.toLowerCase().includes('importado') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'} uppercase\`}>
                            {product.origin?.toLowerCase().includes('importado') ? 'Importado' : 'Nacional'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-black text-mecura-neon block bg-mecura-neon/10 px-2.5 py-1 rounded-lg border border-mecura-neon/20">
                          {product.priceBRL ? \`R$ \${product.priceBRL.toFixed(2)}\` : (product.priceUSD ? \`R$ \${(product.priceUSD * exchangeRate).toFixed(2)}\` : 'Consulte')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="inline-block px-2.5 py-1 bg-mecura-neon/5 text-mecura-neon rounded-lg text-[11px] font-semibold border border-mecura-neon/20 mb-2">
                        {product.type}
                      </span>
                      {product.description && (
                        <p className="text-xs text-mecura-silver leading-relaxed break-words line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      {/* Indications / Diseases */}
                      <div className="mt-3 bg-black/20 p-2.5 rounded-lg border border-white/5">
                        <p className="text-[11px] text-mecura-pearl font-bold mb-1 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-mecura-neon" /> 
                          Uso Clínico (Doenças)
                        </p>
                        <p className="text-[11px] text-mecura-silver leading-relaxed">
                          {product.indications ? product.indications : (product.categoryIndications && product.categoryIndications.length > 0 ? product.categoryIndications.join(', ') : product.categoryName)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-auto space-y-1.5 p-3 bg-mecura-surface-light/40 border border-white/5 rounded-xl">
                      <p className="text-[11px] leading-relaxed text-mecura-silver">
                        <strong className="text-white">Princípio Ativo:</strong> {enriched.activeIngredients}
                      </p>
                      <p className="text-[11px] leading-relaxed text-mecura-silver">
                        <strong className="text-white">Apresentação:</strong> {enriched.pharmaceuticalForm} • {enriched.administrationRoute}
                      </p>
                      {enriched.usageInstructions && (
                        <div className="pt-2 mt-2 border-t border-white/5">
                          <p className="text-[11px] leading-relaxed text-mecura-silver">
                            <strong className="text-white block mb-0.5">Posologia e Uso:</strong> 
                            {enriched.usageInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )})}
            </div>

            {allProducts
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .filter(p => originFilter === 'all' ? true : (originFilter === 'importado' ? p.origin?.toLowerCase().includes('importado') : !p.origin?.toLowerCase().includes('importado')))
              .length === 0 && (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-mecura-silver mx-auto mb-3 opacity-40" />
                <p className="text-white font-bold">Nenhum produto encontrado com estes filtros</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
          {filteredData.map((category) => {`;
  
  code = code.slice(0, startIndex) + replacement + code.slice(endIndex);
  fs.writeFileSync(path, code);
  console.log('Replaced all_products view with grid cards');
} else {
  console.log('Could not find target strings for replacement');
}
