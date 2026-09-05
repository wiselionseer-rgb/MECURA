const fs = require('fs');
const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

// For mobile
code = code.replace(
  `{enriched.usageInstructions && (
                                  <div className="pt-1 mt-1 border-t border-white/5">
                                    <p className="text-[10px] leading-relaxed text-mecura-silver">
                                      <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                      {enriched.usageInstructions}
                                    </p>
                                  </div>
                                )}`,
  ``
);

// For desktop
code = code.replace(
  `{enriched.usageInstructions && (
                                        <div className="pt-1.5 mt-1.5 border-t border-white/5">
                                          <p className="text-[11px] leading-relaxed text-mecura-silver">
                                            <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                            {enriched.usageInstructions}
                                          </p>
                                        </div>
                                      )}`,
  ``
);

fs.writeFileSync(path, code);
