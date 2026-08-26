with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

old_actions = """                      <div className="flex items-center gap-2">
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
                      </div>"""

new_actions = """                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => confirmAppointment(item.id)}
                              className="p-2 rounded-lg bg-mecura-neon/20 text-mecura-neon hover:bg-mecura-neon hover:text-black transition-colors"
                              title="Confirmar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {(item.status === 'pending' || item.status === 'confirmed') && (
                          <>
                            <button 
                              onClick={() => {
                                setAppointmentToReschedule(item.id);
                                setRescheduleDate(item.date || '');
                                setRescheduleTime(item.time || '');
                                setRescheduleModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-colors"
                              title="Remarcar Consulta"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setAppointmentToCancel(item.id);
                                setCancelReason('');
                                setCancelModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                              title="Remover / Cancelar"
                            >
                              <Trash2 className="w-4 h-4" />
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
                      </div>"""

code = code.replace(old_actions, new_actions)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
