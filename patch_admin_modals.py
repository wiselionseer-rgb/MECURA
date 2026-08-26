with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

modals = """
      {/* Modals for Agenda */}
      <AnimatePresence>
        {cancelModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#12121A] border border-[#262636] p-6 rounded-2xl w-full max-w-md relative"
            >
              <button 
                onClick={() => setCancelModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-[#8A8A9E] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2">Cancelar Consulta</h3>
              <p className="text-[#8A8A9E] text-sm mb-6">Por favor, informe o motivo do cancelamento. Esta informação ficará registrada no sistema.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Motivo / Observação</label>
                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ex: Paciente solicitou cancelamento..."
                    className="w-full bg-[#161622] border border-[#262636] text-white rounded-xl p-4 min-h-[100px] outline-none focus:border-red-500"
                  />
                </div>
                
                <button 
                  onClick={() => {
                    if (appointmentToCancel) {
                      cancelAppointment(appointmentToCancel, cancelReason);
                      setCancelModalOpen(false);
                      setAppointmentToCancel(null);
                    }
                  }}
                  className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {rescheduleModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#12121A] border border-[#262636] p-6 rounded-2xl w-full max-w-md relative"
            >
              <button 
                onClick={() => setRescheduleModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-[#8A8A9E] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2">Remarcar Consulta</h3>
              <p className="text-[#8A8A9E] text-sm mb-6">Selecione a nova data e o novo horário para esta consulta.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Nova Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A9E]" />
                    <input 
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full bg-[#161622] border border-[#262636] text-white rounded-xl p-4 pl-12 outline-none focus:border-blue-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Novo Horário</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A9E]" />
                    <input 
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full bg-[#161622] border border-[#262636] text-white rounded-xl p-4 pl-12 outline-none focus:border-blue-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    if (appointmentToReschedule && rescheduleDate && rescheduleTime) {
                      rescheduleAppointment(appointmentToReschedule, rescheduleDate, rescheduleTime);
                      setRescheduleModalOpen(false);
                      setAppointmentToReschedule(null);
                    }
                  }}
                  className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Confirmar Remarcação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
"""

if "{/* Modals for Agenda */}" not in code:
    code = code.replace("    </div>\n  );\n}\n", modals)
    with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
        f.write(code)
