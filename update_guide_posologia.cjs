const fs = require('fs');

const path = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(path, 'utf8');

// For mobile
code = code.replace(
  `<p className="text-[10px] leading-relaxed text-mecura-silver">
                                  <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • {enriched.administrationRoute}
                                </p>`,
  `<p className="text-[10px] leading-relaxed text-mecura-silver">
                                  <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • {enriched.administrationRoute}
                                </p>
                                {enriched.usageInstructions && (
                                  <div className="pt-1 mt-1 border-t border-white/5">
                                    <p className="text-[10px] leading-relaxed text-mecura-silver">
                                      <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                      {enriched.usageInstructions}
                                    </p>
                                  </div>
                                )}`
);

// For desktop
code = code.replace(
  `<p className="text-[11px] leading-relaxed text-mecura-silver">
                                        <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • Via {enriched.administrationRoute}
                                      </p>`,
  `<p className="text-[11px] leading-relaxed text-mecura-silver">
                                        <strong className="text-mecura-pearl">Apresentação & Via:</strong> {enriched.pharmaceuticalForm} • Qtd: {enriched.quantity} • Via {enriched.administrationRoute}
                                      </p>
                                      {enriched.usageInstructions && (
                                        <div className="pt-1.5 mt-1.5 border-t border-white/5">
                                          <p className="text-[11px] leading-relaxed text-mecura-silver">
                                            <strong className="text-mecura-pearl block mb-0.5">Posologia e Modo de Uso:</strong> 
                                            {enriched.usageInstructions}
                                          </p>
                                        </div>
                                      )}`
);

fs.writeFileSync(path, code);
console.log("Updated CBDGuideView with Posologia");
