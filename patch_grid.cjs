const fs = require('fs');
const path = 'src/screens/DashboardScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `        {/* Categories Grid (Quick Services) */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[18px] font-serif font-bold text-white tracking-tight">Serviços Rápidos</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {/* Chat / Consultation */}
            <button 
              onClick={() => navigate(consultationActive || isConsultationFinished ? '/chat' : inQueue ? '/queue' : '/checkout')} 
              className="flex flex-col items-center gap-2.5 group outline-none"
            >
              <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                <MessageCircle className="w-6 h-6 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors relative z-10" />
                <div className="absolute inset-0 bg-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Consulta</span>
            </button>

            {/* Pharmacy */}
            <button 
              onClick={() => navigate('/pharmacy')} 
              className="flex flex-col items-center gap-2.5 group outline-none"
            >
              <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                <ShoppingCart className="w-6 h-6 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors relative z-10" />
                <div className="absolute inset-0 bg-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Farmácia</span>
            </button>

            {/* Protocol */}
            <button 
              onClick={() => isConsultationFinished ? navigate('/protocol') : alert('Seu protocolo estará disponível após a prescrição.')}
              className={\`flex flex-col items-center gap-2.5 group outline-none \${!isConsultationFinished && 'opacity-60'}\`}
            >
              <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                <Droplets className="w-6 h-6 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors relative z-10" />
                <div className="absolute inset-0 bg-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Protocolo</span>
            </button>

            {/* VIP / Premium or History */}
            {!pagamento_premium ? (
              <button 
                onClick={() => navigate('/premium-checkout')} 
                className="flex flex-col items-center gap-2.5 group outline-none"
              >
                <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-[#A6FF00]/20 flex items-center justify-center group-hover:bg-[#1A1A24] group-hover:border-[#A6FF00]/40 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A6FF00]/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                  <Star className="w-6 h-6 text-[#A6FF00] relative z-10" />
                </div>
                <span className="text-[11px] text-[#A6FF00] font-medium transition-colors">Premium</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/history')} 
                className="flex flex-col items-center gap-2.5 group outline-none"
              >
                <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                  <History className="w-6 h-6 text-[#8A8A9E] group-hover:text-white transition-colors relative z-10" />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Histórico</span>
              </button>
            )}
          </div>`;

const replacement = `        {/* Categories Grid (Quick Services) */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[18px] font-serif font-bold text-white tracking-tight">Serviços Rápidos</h3>
          </div>
          
          <div className={\`grid gap-3 \${!pagamento_premium ? 'grid-cols-3' : 'grid-cols-4'}\`}>
            {/* Chat / Consultation */}
            <button 
              onClick={() => navigate(consultationActive || isConsultationFinished ? '/chat' : inQueue ? '/queue' : '/checkout')} 
              className="flex flex-col items-center gap-2.5 group outline-none"
            >
              <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                <MessageCircle className="w-6 h-6 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors relative z-10" />
                <div className="absolute inset-0 bg-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Consulta</span>
            </button>

            {/* Pharmacy */}
            <button 
              onClick={() => navigate('/pharmacy')} 
              className="flex flex-col items-center gap-2.5 group outline-none"
            >
              <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                <ShoppingCart className="w-6 h-6 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors relative z-10" />
                <div className="absolute inset-0 bg-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Farmácia</span>
            </button>

            {/* Protocol */}
            <button 
              onClick={() => isConsultationFinished ? navigate('/protocol') : alert('Seu protocolo estará disponível após a prescrição.')}
              className={\`flex flex-col items-center gap-2.5 group outline-none \${!isConsultationFinished && 'opacity-60'}\`}
            >
              <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                <Droplets className="w-6 h-6 text-[#8A8A9E] group-hover:text-mecura-neon transition-colors relative z-10" />
                <div className="absolute inset-0 bg-mecura-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Protocolo</span>
            </button>

            {/* History (only if premium) */}
            {pagamento_premium && (
              <button 
                onClick={() => navigate('/history')} 
                className="flex flex-col items-center gap-2.5 group outline-none"
              >
                <div className="w-full aspect-square rounded-[22px] bg-[#12121A] border border-white/5 flex items-center justify-center group-hover:bg-[#1A1A24] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)] relative overflow-hidden">
                  <History className="w-6 h-6 text-[#8A8A9E] group-hover:text-white transition-colors relative z-10" />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[11px] text-[#8A8A9E] font-medium group-hover:text-white transition-colors">Histórico</span>
              </button>
            )}
          </div>
          
          {/* HIGH IMPACT PREMIUM BANNER */}
          {!pagamento_premium && (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/premium-checkout')}
              className="mt-5 flex flex-col bg-gradient-to-br from-[#1A1A24] to-[#12121A] border border-[#A6FF00]/40 rounded-[28px] p-5 text-left group hover:border-[#A6FF00]/80 transition-all shadow-[0_8px_30px_rgba(166,255,0,0.2)] relative overflow-hidden outline-none cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6FF00]/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                <Star className="w-32 h-32 text-[#A6FF00]" strokeWidth={0.5} />
              </div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-14 h-14 rounded-[20px] bg-[#A6FF00]/10 border border-[#A6FF00]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(166,255,0,0.2)]">
                   <Star className="w-7 h-7 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1.5">
                     <div className="flex items-center gap-1.5 bg-[#A6FF00]/10 px-2 py-0.5 rounded-full border border-[#A6FF00]/30 shadow-[0_0_10px_rgba(166,255,0,0.1)]">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#A6FF00] animate-pulse" />
                       <span className="text-[9px] font-bold text-[#A6FF00] uppercase tracking-wider">Acesso VIP</span>
                     </div>
                   </div>
                   <h4 className="text-[16px] font-bold text-white mb-2 tracking-tight">Mecura Premium</h4>
                   <p className="text-[12px] text-white/80 leading-relaxed font-medium">
                     Consulta com <strong className="text-[#A6FF00]">chamada de vídeo</strong>, acesso ao <strong className="text-white">laudo inicial</strong> e <strong className="text-white">laudo evolutivo</strong> para abertura do HC.
                   </p>
                </div>
              </div>
            </motion.div>
          )}`;

// normalize newlines just in case
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const newContent = normalizedContent.replace(normalizedTarget, replacement);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('patched successfully!');
} else {
  console.log('TARGET NOT FOUND!');
}
