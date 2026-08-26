with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Add imports
code = code.replace(
    "import { motion, AnimatePresence } from 'motion/react';",
    "import { motion, AnimatePresence } from 'motion/react';\nimport { isToday, isThisWeek, isThisMonth, parseISO, isFuture, startOfDay } from 'date-fns';"
)

# Add states
state_injection = """  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications' | 'agenda'>('overview');
  const [agendaTimeFilter, setAgendaTimeFilter] = useState('all');
  const [agendaStatusFilter, setAgendaStatusFilter] = useState('all');
"""
code = code.replace("  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications' | 'agenda'>('overview');", state_injection)

# Add filter logic inside agenda tab
old_agenda = """        {activeTab === 'agenda' && (
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
                    .map((item, i) => ("""

new_agenda = """        {activeTab === 'agenda' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Agenda de Consultas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#161622] p-4 rounded-xl border border-[#262636]">
                <div className="text-[#8A8A9E] text-sm mb-1">Total Filtrado</div>
                <div className="text-2xl font-bold text-white">
                  {allAppointments.filter(app => {
                    if (agendaStatusFilter !== 'all' && app.status !== agendaStatusFilter) return false;
                    if (agendaTimeFilter !== 'all' && app.date) {
                      const dateObj = parseISO(app.date);
                      if (agendaTimeFilter === 'today' && !isToday(dateObj)) return false;
                      if (agendaTimeFilter === 'week' && !isThisWeek(dateObj)) return false;
                      if (agendaTimeFilter === 'month' && !isThisMonth(dateObj)) return false;
                    }
                    return true;
                  }).length}
                </div>
              </div>
              <div className="bg-[#161622] p-4 rounded-xl border border-[#262636]">
                <div className="text-[#8A8A9E] text-sm mb-1">Próximas (Confirmadas)</div>
                <div className="text-2xl font-bold text-mecura-neon">
                  {allAppointments.filter(app => app.status === 'confirmed' && app.date && isFuture(startOfDay(parseISO(app.date)))).length}
                </div>
              </div>
              <div className="bg-[#161622] p-4 rounded-xl border border-[#262636]">
                <div className="text-[#8A8A9E] text-sm mb-1">Pendentes de Confirmação</div>
                <div className="text-2xl font-bold text-yellow-500">
                  {allAppointments.filter(app => app.status === 'pending').length}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <select 
                value={agendaTimeFilter}
                onChange={(e) => setAgendaTimeFilter(e.target.value)}
                className="bg-[#161622] border border-[#262636] text-white rounded-lg px-4 py-2 outline-none focus:border-mecura-neon"
              >
                <option value="all">Todo o período</option>
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
              </select>
              
              <select 
                value={agendaStatusFilter}
                onChange={(e) => setAgendaStatusFilter(e.target.value)}
                className="bg-[#161622] border border-[#262636] text-white rounded-lg px-4 py-2 outline-none focus:border-mecura-neon"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="confirmed">Confirmados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
            
            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-4 p-4 border-b border-[#262636] text-[#8A8A9E] font-bold">
                <div>Paciente</div>
                <div>Data/Hora</div>
                <div>Tipo</div>
                <div>Ações</div>
              </div>
              <div className="divide-y divide-[#262636]">
                {(() => {
                  const filtered = allAppointments.filter(app => {
                    if (agendaStatusFilter !== 'all' && app.status !== agendaStatusFilter) return false;
                    if (agendaTimeFilter !== 'all' && app.date) {
                      const dateObj = parseISO(app.date);
                      if (agendaTimeFilter === 'today' && !isToday(dateObj)) return false;
                      if (agendaTimeFilter === 'week' && !isThisWeek(dateObj)) return false;
                      if (agendaTimeFilter === 'month' && !isThisMonth(dateObj)) return false;
                    }
                    return true;
                  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  
                  if (filtered.length === 0) {
                    return <div className="p-8 text-center text-[#8A8A9E]">Nenhuma consulta encontrada com estes filtros</div>;
                  }
                  
                  return filtered.map((item, i) => ("""

code = code.replace(old_agenda, new_agenda)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
