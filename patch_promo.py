import re

with open("src/screens/DashboardScreen.tsx", "r") as f:
    code = f.read()

# 1. Add state
old_state = "const [showReferralModal, setShowReferralModal] = useState(false);"
new_state = "const [showReferralModal, setShowReferralModal] = useState(false);\n  const [promoModal, setPromoModal] = useState<'hc' | 'consultoria' | 'sementes' | null>(null);"
code = code.replace(old_state, new_state)

# 2. Update onClicks in the Cultivo cards
# We need to find the specific blocks to replace safely.
# For HC:
old_hc_click = """              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/chat')}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight">Habeas Corpus</h4>"""
new_hc_click = old_hc_click.replace("navigate('/chat')", "setPromoModal('hc')")
code = code.replace(old_hc_click, new_hc_click)

# For Consultoria
old_consult_click = """              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/chat')}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <MessageCircle className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight">Consultoria</h4>"""
new_consult_click = old_consult_click.replace("navigate('/chat')", "setPromoModal('consultoria')")
code = code.replace(old_consult_click, new_consult_click)

# For Sementes
old_sementes_click = """              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/chat')}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6FF00]/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <Leaf className="w-6 h-6 text-[#A6FF00]" strokeWidth={1.5} />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-2 tracking-tight">Sementes da Europa</h4>"""
new_sementes_click = old_sementes_click.replace("navigate('/chat')", "setPromoModal('sementes')")
code = code.replace(old_sementes_click, new_sementes_click)

# 3. Add modal code before </AnimatePresence> or at the end
# But wait, DashboardScreen doesn't wrap the whole return in AnimatePresence (it's inside but maybe at the root?)
# Let's insert the modal right above `<AdvisorChatWidget />`

modal_ui = """
      {/* Promotional Modal */}
      {promoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPromoModal(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-[#12121A] border border-[#A6FF00]/30 rounded-[32px] p-6 max-w-sm w-full shadow-[0_0_40px_rgba(166,255,0,0.15)] z-10 overflow-hidden text-center"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6FF00]/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A24] border border-[#A6FF00]/20 flex items-center justify-center mx-auto mb-4 relative z-10">
              {promoModal === 'hc' && <ShieldCheck className="w-8 h-8 text-[#A6FF00]" strokeWidth={1.5} />}
              {promoModal === 'consultoria' && <MessageCircle className="w-8 h-8 text-[#A6FF00]" strokeWidth={1.5} />}
              {promoModal === 'sementes' && <Leaf className="w-8 h-8 text-[#A6FF00]" strokeWidth={1.5} />}
            </div>
            
            <h3 className="text-[20px] font-bold text-white mb-3">
              {promoModal === 'hc' && 'Habeas Corpus de Cultivo'}
              {promoModal === 'consultoria' && 'Consultoria Especializada'}
              {promoModal === 'sementes' && 'Sementes da Europa'}
            </h3>
            
            <p className="text-[14px] text-[#8A8A9E] mb-6 leading-relaxed">
              {promoModal === 'hc' && 'Tenha acesso a toda estruturação para seu HC, acompanhamento individual, acesso a médicos e advogados. Nossos advogados têm HCs concedidos em 24h, 30 dias, 90 dias e 6 meses (cada caso é um caso).'}
              {promoModal === 'consultoria' && 'Aprenda a cultivar do ZERO! Da semente ao medicamento. Acompanhamento especializado e individualizado para você garantir sua própria medicina com qualidade.'}
              {promoModal === 'sementes' && 'Tenha acesso às melhores genéticas do mundo para o seu cultivo terapêutico. Trabalhamos com os melhores bancos de sementes europeus certificados.'}
            </p>

            <button
              onClick={() => {
                const msgs = {
                  hc: 'Olá! Gostaria de saber mais sobre a estruturação para o Habeas Corpus de cultivo.',
                  consultoria: 'Olá! Gostaria de saber mais sobre a consultoria de cultivo do zero.',
                  sementes: 'Olá! Gostaria de saber mais sobre as Sementes da Europa para cultivo terapêutico.'
                };
                window.open(`https://wa.me/5566996280883?text=${encodeURIComponent(msgs[promoModal])}`, '_blank');
                setPromoModal(null);
              }}
              className="w-full h-12 bg-[#25D366] hover:bg-[#20b858] text-white rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              Falar no WhatsApp
            </button>
            <button 
              onClick={() => setPromoModal(null)}
              className="w-full mt-3 h-10 text-[#8A8A9E] hover:text-white font-medium text-[13px] transition-colors cursor-pointer"
            >
              Voltar
            </button>
          </motion.div>
        </div>
      )}

      <AdvisorChatWidget />"""

code = code.replace("      <AdvisorChatWidget />", modal_ui)

with open("src/screens/DashboardScreen.tsx", "w") as f:
    f.write(code)
print("Promo code patched!")
