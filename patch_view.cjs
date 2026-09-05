const fs = require('fs');

let viewPath = 'src/components/CBDGuideView.tsx';
let code = fs.readFileSync(viewPath, 'utf8');

const target = `<p className="text-xs md:text-sm text-mecura-silver mt-1 leading-relaxed">
                      {category.description}
                    </p>`;

const replacement = `<p className="text-xs md:text-sm text-mecura-silver mt-2 leading-relaxed">
                      {category.description}
                    </p>
                    {category.indicationsList && category.indicationsList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {category.indicationsList.map((indication, iIdx) => (
                          <span 
                            key={iIdx} 
                            className="bg-mecura-neon/10 text-mecura-neon text-[10px] md:text-[11px] px-2.5 py-1 rounded-md border border-mecura-neon/20 font-semibold"
                          >
                            {indication}
                          </span>
                        ))}
                      </div>
                    )}`;

code = code.replace(target, replacement);

fs.writeFileSync(viewPath, code);
console.log('Patched View');
