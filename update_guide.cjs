const fs = require('fs');

const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

// Fix imports
code = code.replace(`import { cbdGuideData } from '../data/cbdGuide';\n`, '');
code = code.replace(
  `import { cbdGuideData, CBDCategory, CBDProduct } from '../data/cbdGuide';`,
  `import { cbdGuideData, CBDCategory, CBDProduct, enrichMedicationDetails } from '../data/cbdGuide';`
);

// Map products and add enrichedData rendering for mobile
const enrichBlockMobile = `
                          {/* Rich Details */}
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
                              </div>
                            );
                          })()}
`;

// Insert after product.indications block for mobile (around line 324)
code = code.replace(
  `                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">`,
  `                                </p>
                              )}
                              ${enrichBlockMobile}
                            </div>
                            <div className="text-right flex-shrink-0">`
);

// Do the same for desktop
const enrichBlockDesktop = `
                                {/* Rich Details Desktop */}
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
                                    </div>
                                  );
                                })()}
`;

code = code.replace(
  `                                  <p className="text-[10px] text-mecura-neon/80 bg-mecura-neon/5 px-2 py-1 rounded border border-mecura-neon/10 mt-2 inline-block">
                                    <span className="font-bold opacity-75 mr-1">Indicações:</span> {product.indications}
                                  </p>
                                )}
                              </td>`,
  `                                  <p className="text-[10px] text-mecura-neon/80 bg-mecura-neon/5 px-2 py-1 rounded border border-mecura-neon/10 mt-2 inline-block">
                                    <span className="font-bold opacity-75 mr-1">Indicações:</span> {product.indications}
                                  </p>
                                )}
                                ${enrichBlockDesktop}
                              </td>`
);


fs.writeFileSync(path, code);
console.log("Updated CBDGuideView");
