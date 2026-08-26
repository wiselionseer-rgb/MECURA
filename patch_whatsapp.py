with open("src/components/DoctorAnalyticsDashboard.tsx", "r") as f:
    code = f.read()

old_block = """                      {item.status === 'pending' && (
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); confirmAppointment(item.id); }}
                            className="p-1.5 rounded-lg bg-mecura-neon text-black hover:bg-[#b5ff33] transition-colors"
                            title="Confirmar"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); cancelAppointment(item.id); }}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors border border-red-500/30"
                            title="Recusar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}"""

new_block = """                      {item.status === 'pending' && (
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); confirmAppointment(item.id); }}
                            className="p-1.5 rounded-lg bg-mecura-neon text-black hover:bg-[#b5ff33] transition-colors"
                            title="Confirmar"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); cancelAppointment(item.id); }}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors border border-red-500/30"
                            title="Recusar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {item.status === 'confirmed' && (
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const msg = encodeURIComponent(`Olá ${item.patientName}, passando para lembrar da sua consulta na Mecura amanhã às ${item.time}.`);
                              window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                            }}
                            className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/30"
                            title="Avisar no WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}"""

code = code.replace(old_block, new_block)

with open("src/components/DoctorAnalyticsDashboard.tsx", "w") as f:
    f.write(code)
