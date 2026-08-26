with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

new_tab = """        {activeTab === 'agenda' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Agenda de Consultas</h2>
            
            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-4 p-4 border-b border-[#262636] text-[#8A8A9E] font-bold">
                <div>Paciente</div>
                <div>Data/Hora</div>
                <div>Tipo</div>
                <div>Ações</div>
              </div>
              <div className="divide-y divide-[#262636]">
                {allAppointments.length === 0 ? (
                  <div className="p-8 text-center text-[#8A8A9E]">Nenhuma consulta encontrada</div>
                ) : (
                  [...allAppointments]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item, i) => (
                    <div key={item.id || i} className="grid grid-cols-4 p-4 items-center hover:bg-white/5 transition-colors">
                      <div className="font-bold text-white">{item.patientName}</div>
                      <div>
                        <div className="text-sm text-white">{item.date}</div>
                        <div className="text-xs text-[#8A8A9E]">{item.time}</div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          item.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'pending' ? 'bg-mecura-neon/20 text-mecura-neon' :
                          item.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {item.status === 'confirmed' ? 'Confirmado' : 
                           item.status === 'pending' ? 'Pendente' : 
                           item.status === 'cancelled' ? 'Cancelado' : item.status}
                        </span>
                        <div className="text-[10px] text-[#8A8A9E] mt-1">{item.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => confirmAppointment(item.id)}
                              className="p-2 rounded-lg bg-mecura-neon/20 text-mecura-neon hover:bg-mecura-neon hover:text-black transition-colors"
                              title="Confirmar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => cancelAppointment(item.id)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                              title="Recusar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {item.status === 'confirmed' && (
                          <button 
                            onClick={() => {
                              const msg = encodeURIComponent(`Olá ${item.patientName}, passando para lembrar da sua consulta na Mecura amanhã às ${item.time}.`);
                              window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                            }}
                            className="p-2 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors border border-[#25D366]/30"
                            title="Avisar no WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'patients' && ("""

code = code.replace("        {activeTab === 'patients' && (", new_tab)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
