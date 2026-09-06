const fs = require('fs');
const path = 'src/screens/PharmacyScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/const \{ promotionsText, catalogUrl \} = useAdminStore\(\);/, "const { promotionsText, catalogUrl, catalogUrlNacional } = useAdminStore();");

const oldButton = `<motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={catalogUrl || 'https://greenbudz.com/catalog'}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden flex items-center justify-center gap-3 w-full bg-mecura-neon text-[#0A0A0F] px-6 py-4 rounded-xl font-black text-[15px] uppercase tracking-wider hover:bg-[#b5ff33] transition-colors shadow-[0_0_20px_rgba(166,255,0,0.3)] group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Gift className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Ver Catálogo Completo</span>
              </motion.a>`;

const newButtons = `<div className="flex flex-col gap-3">
                <motion.a 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={catalogUrl || 'https://greenbudz.com/catalog'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden flex items-center justify-center gap-3 w-full bg-mecura-neon text-[#0A0A0F] px-6 py-4 rounded-xl font-black text-[15px] uppercase tracking-wider hover:bg-[#b5ff33] transition-colors shadow-[0_0_20px_rgba(166,255,0,0.3)] group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Gift className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">VER CATÁLOGO IMPORTADOS</span>
                </motion.a>
                
                <motion.a 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={catalogUrlNacional || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden flex items-center justify-center gap-3 w-full bg-mecura-pearl text-[#0A0A0F] px-6 py-4 rounded-xl font-black text-[15px] uppercase tracking-wider hover:bg-white transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] group"
                >
                  <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Gift className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">VER CATÁLOGO NACIONAL</span>
                </motion.a>
              </div>`;

code = code.replace(oldButton, newButtons);

fs.writeFileSync(path, code);
