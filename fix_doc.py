with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

payment_success_card = """                  ) : msg.type === 'payment_success' ? (
                    <div className="w-[85%] max-w-xl bg-[#A6FF00]/10 border border-[#A6FF00]/30 rounded-3xl p-4 sm:p-6 mb-2 flex items-center gap-4 shadow-lg">
                      <div className="w-12 h-12 rounded-full bg-[#A6FF00]/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-[#A6FF00]" />
                      </div>
                      <div>
                        <h3 className="text-[#A6FF00] font-bold text-lg">Pagamento Confirmado!</h3>
                        <p className="text-white text-sm">O paciente realizou o pagamento da Consulta Premium (R$ 250,00). Você pode prosseguir com o atendimento e envio dos laudos.</p>
                      </div>
                    </div>
"""

code = code.replace("                  ) : msg.type === 'acompanhamento_options' && msg.sender === 'doctor' ? null : (", "                  ) : msg.type === 'acompanhamento_options' && msg.sender === 'doctor' ? null :\n" + payment_success_card + "                  ) : (")

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)
