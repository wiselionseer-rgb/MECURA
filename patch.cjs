const fs = require('fs');
const path = 'src/screens/DashboardScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `          </div>
        </section>`;

const replacement = `          </div>

          {/* Card: Cultivo de Cannabis & HC */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden outline-none cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6FF00]/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-[#1A1A24] to-[#12121A] border border-[#A6FF00]/10 flex items-center justify-center shrink-0">
                 <Leaf className="w-7 h-7 text-[#A6FF00]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                 <div className="flex items-center justify-between mb-1">
                   <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#A6FF00] animate-pulse" />
                     <span className="text-[9px] font-bold text-[#A6FF00] uppercase tracking-wider">Habeas Corpus & Consultoria</span>
                   </div>
                 </div>
                 <h4 className="text-[15px] font-bold text-white mb-1.5 tracking-tight">Cultivo de Cannabis</h4>
                 <p className="text-[12px] text-[#8A8A9E] leading-relaxed">
                   Obtenha seu HC para cultivo. Consultoria completa do iniciante ao avançado e acesso ao melhor banco de sementes da Europa.
                 </p>
              </div>
            </div>
          </motion.div>
        </section>`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('patched successfully');
