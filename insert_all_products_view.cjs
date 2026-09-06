const fs = require('fs');

const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `) : (
          <div className="space-y-6">
          {filteredData.map((category) => {`;

const allProductsViewStr = `) : viewMode === 'all_products' ? (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Todos os Medicamentos</h2>
              <p className="text-mecura-silver text-sm">Navegue por todos os medicamentos (Nacionais e Importados) disponíveis na plataforma.</p>
            </div>
            
            {/* MOBILE CARD VIEW */}
            <div className="block md:hidden space-y-3">
              {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl bg-[#0E0E14] border border-mecura-elevated hover:border-mecura-neon/40 transition-all space-y-2.5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white leading-snug break-words">
                        {product.name}
                      </h4>
                      <p className="text-xs text-mecura-neon/80 mt-1">Categoria: {product.categoryName}</p>
                      {product.description && (
                        <p className="text-xs text-mecura-silver mt-1 leading-relaxed break-words">
                          {product.description}
                        </p>
                      )}
                      
                      {(() => {
                        const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type);
                        return (
                          <div className="mt-2 space-y-1 p-2.5 bg-black/20 border border-white/5 rounded-lg">
                            <p className="text-[10px] leading-relaxed text-mecura-silver">
                              <strong className="text-mecura-pearl">Princípio Ativo:</strong> {enriched.activeIngredients}
                            </p>
                            <p className="text-[10px] leading-relaxed text-mecura-silver">
                              <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • {enriched.administrationRoute}
                            </p>
                            {enriched.usageInstructions && (
                              <div className="pt-1.5 mt-1.5 border-t border-white/5">
                                <p className="text-[10px] leading-relaxed text-mecura-silver">
                                  <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                  {enriched.usageInstructions}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-mecura-neon block">
                        {product.priceBRL ? \`R$ \${product.priceBRL.toFixed(2)}\` : (product.priceUSD ? \`R$ \${(product.priceUSD * exchangeRate).toFixed(2)}\` : 'Consulte')}
                      </span>
                      {product.origin && (
                        <span className="text-[10px] text-mecura-silver/70 block mt-0.5">
                          {product.origin}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-2.5 py-1 bg-mecura-neon/10 text-mecura-neon rounded-lg text-xs font-semibold border border-mecura-neon/25 inline-flex items-center gap-1 leading-none">
                      <Tag className="w-3 h-3 flex-shrink-0" />
                      <span className="break-words">{product.type}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-white/5 text-mecura-pearl rounded-lg text-xs border border-mecura-elevated inline-flex items-center gap-1 leading-none">
                      <Building2 className="w-3 h-3 text-mecura-silver flex-shrink-0" />
                      <span className="break-words">{product.manufacturer}</span>
                    </span>
                  </div>
                  
                  {product.details && product.details.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5 border-t border-white/5">
                      {product.details.map((detail, dIdx) => (
                        <span 
                          key={dIdx} 
                          className="text-[11px] bg-mecura-surface-light px-2 py-0.5 rounded text-mecura-silver border border-white/5 leading-normal"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-mecura-elevated">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-mecura-elevated bg-mecura-surface-light/40 text-mecura-silver text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold w-[40%]">Produto & Descrição</th>
                    <th className="py-3 px-4 font-semibold w-1/5">Fabricante</th>
                    <th className="py-3 px-4 font-semibold w-1/6">Tipo</th>
                    <th className="py-3 px-4 font-semibold">Especificações</th>
                    <th className="py-3 px-4 font-semibold text-right w-28">Preço Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mecura-elevated bg-[#0A0A0F]/60">
                  {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3.5 px-4 font-medium text-white align-top">
                        <div className="font-bold text-white text-sm group-hover:text-mecura-neon transition-colors leading-snug break-words">
                          {product.name}
                        </div>
                        <p className="text-xs text-mecura-neon/80 mt-1">Categoria: {product.categoryName}</p>
                        {product.description && (
                          <p className="text-xs text-mecura-silver mt-1 leading-relaxed break-words">
                            {product.description}
                          </p>
                        )}
                        {(() => {
                          const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type);
                          return (
                            <div className="mt-3 space-y-1 p-3 bg-black/20 border border-white/5 rounded-lg">
                              <p className="text-[11px] leading-relaxed text-mecura-silver">
                                <strong className="text-mecura-pearl">Princípio Ativo:</strong> {enriched.activeIngredients}
                              </p>
                              <p className="text-[11px] leading-relaxed text-mecura-silver">
                                <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • Via {enriched.administrationRoute}
                              </p>
                              {enriched.usageInstructions && (
                                <div className="pt-2 mt-2 border-t border-white/5">
                                  <p className="text-[11px] leading-relaxed text-mecura-silver">
                                    <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                    {enriched.usageInstructions}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-4 text-mecura-silver align-top">
                        <span className="block font-medium text-mecura-pearl mb-1">{product.manufacturer}</span>
                        <span className="text-[10px] uppercase tracking-wider">{product.origin}</span>
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <span className="inline-block px-2.5 py-1 bg-mecura-neon/10 text-mecura-neon rounded-lg text-xs font-semibold border border-mecura-neon/25 whitespace-nowrap">
                          {product.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        {product.details && product.details.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {product.details.map((detail, dIdx) => (
                              <span key={dIdx} className="text-xs text-mecura-silver bg-black/30 px-2 py-1 rounded border border-white/5 whitespace-nowrap overflow-hidden text-ellipsis">
                                {detail}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-mecura-silver/30 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right align-top">
                        <div className="font-black text-mecura-neon text-sm">
                          {product.priceBRL ? \`R$ \${product.priceBRL.toFixed(2)}\` : (product.priceUSD ? \`R$ \${(product.priceUSD * exchangeRate).toFixed(2)}\` : '-')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-mecura-silver mx-auto mb-3 opacity-40" />
                <p className="text-white font-bold">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
          {filteredData.map((category) => {`;

code = code.replace(targetStr, allProductsViewStr);

fs.writeFileSync(path, code);
console.log('Inserted allProducts view');
