import re

with open("src/components/DoctorAnalyticsDashboard.tsx", "r") as f:
    code = f.read()

# 1. Update imports if needed
if "import { Calendar as CalendarIcon" in code:
    code = code.replace("Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check, X, Bell", "Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check, X, Bell, Plus")

# 2. Add state and addAppointment to useStore
store_line = "const { allAppointments, confirmAppointment, cancelAppointment, consultationHistory, queue, subscribeToQueue } = useStore();"
new_store_line = "const { allAppointments, confirmAppointment, cancelAppointment, consultationHistory, queue, subscribeToQueue, addAppointment } = useStore();\n  const [showScheduleModal, setShowScheduleModal] = useState(false);\n  const [scheduleForm, setScheduleForm] = useState({ patientName: '', date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', type: 'Retorno' });\n  const uniquePatientsList = Array.from(new Set([...allAppointments.map(a => a.patientName), ...queue.map(p => p.patientName)])).filter(Boolean);"
code = code.replace(store_line, new_store_line)

# 3. Add button in Agenda header
agenda_header = """            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-mecura-neon" />
                Agenda
              </h3>
              <div className="flex gap-2">
                <button onClick={prevWeek} className="p-1.5 rounded-lg bg-[#0A0A0F] border border-mecura-elevated text-mecura-silver hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextWeek} className="p-1.5 rounded-lg bg-[#0A0A0F] border border-mecura-elevated text-mecura-silver hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>"""

new_agenda_header = """            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-mecura-neon" />
                Agenda
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon text-sm font-bold hover:bg-mecura-neon hover:text-black transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Agendar
                </button>
                <div className="flex bg-[#0A0A0F] border border-mecura-elevated rounded-lg overflow-hidden ml-1">
                  <button onClick={prevWeek} className="p-1.5 text-mecura-silver hover:text-white hover:bg-white/5 transition-colors border-r border-mecura-elevated">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={nextWeek} className="p-1.5 text-mecura-silver hover:text-white hover:bg-white/5 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>"""
code = code.replace(agenda_header, new_agenda_header)

# 4. Add Modal at the end of the component
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
                  addAppointment(scheduleForm);
                  setShowScheduleModal(false);
                  setScheduleForm({...scheduleForm, patientName: ''});
                  // Scroll to date if it's in the current week view or jump to it
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
};
"""

code = code.replace("    </div>\n  );\n};", modal_code)

with open("src/components/DoctorAnalyticsDashboard.tsx", "w") as f:
    f.write(code)

