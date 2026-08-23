import re

with open("src/screens/DashboardScreen.tsx", "r") as f:
    code = f.read()

old_block = """            <button
              onClick={() => {
                if (promoModal === 'sementes') {
                  window.open('https://super.sementesagrada.com/', '_blank');
                } else {
                  window.open('https://instmecura.sementesagrada.com/', '_blank');
                }
                setPromoModal(null);
              }}
              className="w-full h-12 bg-mecura-neon hover:bg-[#8FFF00] text-[#0A0A0F] rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(166,255,0,0.3)]"
            >
              Acessar Site
            </button>
            <button 
              onClick={() => setPromoModal(null)}
              className="w-full mt-3 h-10 text-[#8A8A9E] hover:text-white font-medium text-[13px] transition-colors cursor-pointer"
            >
              Voltar
            </button>"""

new_block = """            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const msgs: Record<string, string> = {
                    hc: 'Olá! Gostaria de saber mais sobre a estruturação para o Habeas Corpus de cultivo.',
                    consultoria: 'Olá! Gostaria de saber mais sobre a consultoria de cultivo do zero.',
                    sementes: 'Olá! Gostaria de saber mais sobre as Sementes da Europa para cultivo terapêutico.'
                  };
                  window.open(`https://wa.me/5566996280883?text=${encodeURIComponent(msgs[promoModal || 'hc'])}`, '_blank');
                  setPromoModal(null);
                }}
                className="w-full h-12 bg-[#25D366] hover:bg-[#20b858] text-white rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                Falar no WhatsApp
              </button>

              <button
                onClick={() => {
                  if (promoModal === 'sementes') {
                    window.open('https://super.sementesagrada.com/', '_blank');
                  } else {
                    window.open('https://instmecura.sementesagrada.com/', '_blank');
                  }
                  setPromoModal(null);
                }}
                className="w-full h-12 bg-[#1A1A24] border border-[#A6FF00]/30 hover:border-[#A6FF00] text-white rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Acessar Site
              </button>

              <button 
                onClick={() => setPromoModal(null)}
                className="w-full h-10 text-[#8A8A9E] hover:text-white font-medium text-[13px] transition-colors cursor-pointer"
              >
                Voltar
              </button>
            </div>"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open("src/screens/DashboardScreen.tsx", "w") as f:
        f.write(code)
    print("Replaced buttons.")
else:
    print("Could not find block.")
