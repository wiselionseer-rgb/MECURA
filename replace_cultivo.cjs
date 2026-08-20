const fs = require('fs');
const path = 'src/screens/DashboardScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `          {/* Card: Cultivo de Cannabis & HC */}
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
          </motion.div>`;

const replacement = `          {/* Cultivo de Cannabis (3 Cards) */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[18px] font-serif font-bold text-white tracking-tight">Jornada de Cultivo</h3>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 px-1 -mx-1 snap-x snap-mandatory hide-scrollbar">
              {/* Card 1: HC */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight">Habeas Corpus</h4>
                <p className="text-[12px] text-[#8A8A9E] leading-relaxed">
                  Obtenha seu HC para cultivo legal de forma 100% segura e orientada.
                </p>
              </motion.div>

              {/* Card 2: Consultoria */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <MessageCircle className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight">Consultoria</h4>
                <p className="text-[12px] text-[#8A8A9E] leading-relaxed">
                  Acompanhamento especializado do cultivador iniciante ao avançado.
                </p>
              </motion.div>

              {/* Card 3: Sementes */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <Leaf className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight">Sementes da Europa</h4>
                <p className="text-[12px] text-[#8A8A9E] leading-relaxed">
                  Acesso exclusivo ao melhor banco de sementes europeu certificado.
                </p>
              </motion.div>
            </div>
          </div>`;

if (content.includes("Card: Cultivo de Cannabis & HC")) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('patched successfully');
} else {
  console.log('target string not found');
}
