with open("src/components/ReferralModal.tsx", "r") as f:
    code = f.read()

# Replace the bottom grid and text
old_bottom = """              <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-[#161622] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Users className="w-6 h-6 text-[#A1A1AA] mb-2" />
                   <span className="text-[11px] text-[#8A8A9E] font-bold uppercase tracking-wider mb-0.5">Indicados</span>
                   <span className="text-2xl font-black text-white">{invited}</span>
                </div>
                <div className="bg-gradient-to-b from-mecura-neon/5 to-[#161622] border border-mecura-neon/20 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-b from-mecura-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Sparkles className="w-6 h-6 text-mecura-neon mb-2" />
                   <span className="text-[11px] text-mecura-neon/70 font-bold uppercase tracking-wider mb-0.5">Seus Bônus</span>
                   <span className="text-2xl font-black text-mecura-neon">R$ {bonusBalance}</span>
                </div>
              </div>
                 
              <div className="mt-6 w-full text-center">
                <div className="text-[10px] text-[#8A8A9E] mb-2">
                  Você pode usar seus bônus na tela de checkout para ter descontos nas suas consultas.
                </div>
              </div>"""

new_bottom = """              <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-[#161622] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Users className="w-6 h-6 text-[#A1A1AA] mb-2" />
                   <span className="text-[11px] text-[#8A8A9E] font-bold uppercase tracking-wider mb-0.5">Indicados</span>
                   <span className="text-2xl font-black text-white">{invited}</span>
                </div>
                <div className="bg-gradient-to-b from-mecura-neon/5 to-[#161622] border border-mecura-neon/20 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-b from-mecura-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Sparkles className="w-6 h-6 text-mecura-neon mb-2" />
                   <span className="text-[11px] text-mecura-neon/70 font-bold uppercase tracking-wider mb-0.5">Faltam para R$50</span>
                   <span className="text-2xl font-black text-mecura-neon">{Math.max(0, 3 - (invited % 3))}</span>
                </div>
              </div>
                 
              {hasBonus && (
                <div className="mt-4 w-full bg-[#1A2E1A] border border-mecura-neon/50 rounded-2xl p-4 flex flex-col items-center justify-center">
                  <span className="text-[12px] text-mecura-neon font-bold uppercase mb-2">Seu Cupom Exclusivo (R$ 50 OFF)</span>
                  <div className="flex items-center gap-2 w-full">
                     <div className="flex-1 bg-[#0A0A0F] border border-mecura-neon/30 rounded-xl px-4 py-2 flex items-center justify-center">
                       <span className="font-mono text-lg font-bold text-white tracking-widest">{bonusCode}</span>
                     </div>
                     <button 
                       onClick={() => {
                         navigator.clipboard.writeText(bonusCode);
                         setCopiedBonus(true);
                         setTimeout(() => setCopiedBonus(false), 2000);
                       }}
                       className="w-12 h-11 rounded-xl bg-mecura-neon/20 text-mecura-neon flex items-center justify-center hover:bg-mecura-neon hover:text-black transition-colors"
                     >
                       {copiedBonus ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                     </button>
                  </div>
                  <div className="text-[10px] text-[#8A8A9E] mt-2">
                    Você possui {Math.floor(invited / 3)} cupom(ns) de R$ 50 disponível(is) para usar no checkout!
                  </div>
                </div>
              )}"""
code = code.replace(old_bottom, new_bottom)

with open("src/components/ReferralModal.tsx", "w") as f:
    f.write(code)
