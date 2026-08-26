with open("src/components/DoctorAnalyticsDashboard.tsx", "r") as f:
    code = f.read()

modal_code = """
      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 text-mecura-silver hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-mecura-neon" />
              Agendar Retorno
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-mecura-silver mb-1.5">Nome do Paciente</label>
                <input 
                  type="text" 
                  list="patientsList"
                  value={scheduleForm.patientName}
                  onChange={(e) => setScheduleForm({...scheduleForm, patientName: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-mecura-neon focus:outline-none transition-colors"
                  placeholder="Digite ou selecione..."
                />
                <datalist id="patientsList">
                  {uniquePatientsList.map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-mecura-silver mb-1.5">Data</label>
                  <input 
                    type="date" 
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                    className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-mecura-neon focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-mecura-silver mb-1.5">Horário</label>
                  <input 
                    type="time" 
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                    className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-mecura-neon focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-mecura-silver mb-1.5">Tipo de Consulta</label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-mecura-neon focus:outline-none transition-colors"
                >
                  <option value="Consulta Inicial">Consulta Inicial</option>
                  <option value="Retorno">Retorno</option>
                  <option value="Acompanhamento">Acompanhamento</option>
                  <option value="Emergência">Emergência</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => {
                if (scheduleForm.patientName && scheduleForm.date && scheduleForm.time) {
                  addAppointment({ ...scheduleForm, status: 'confirmed' });
                  setShowScheduleModal(false);
                  setScheduleForm({...scheduleForm, patientName: ''});
                  setCurrentDate(parseISO(scheduleForm.date));
                }
              }}
              className="w-full mt-6 py-3 bg-mecura-neon text-black font-bold rounded-xl hover:bg-[#b5ff33] transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(166,255,0,0.2)]"
            >
              <Check className="w-5 h-5" />
              Confirmar Agendamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
"""

code = code.replace("    </div>\n  );\n}", modal_code)

with open("src/components/DoctorAnalyticsDashboard.tsx", "w") as f:
    f.write(code)

