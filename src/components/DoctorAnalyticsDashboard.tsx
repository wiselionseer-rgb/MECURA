import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check, X, Bell } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO, isPast, isFuture, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useStore } from '../store/useStore';

export function DoctorAnalyticsDashboard() {
  const { allAppointments, confirmAppointment, cancelAppointment, consultationHistory, queue, subscribeToQueue } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  useEffect(() => {
    const unsubscribe = subscribeToQueue();
    return () => unsubscribe();
  }, [subscribeToQueue]);
  
  // Calculate dynamic weekly data
  const weeklyData = [
    { name: 'Seg', consultas: 0, canceladas: 0 },
    { name: 'Ter', consultas: 0, canceladas: 0 },
    { name: 'Qua', consultas: 0, canceladas: 0 },
    { name: 'Qui', consultas: 0, canceladas: 0 },
    { name: 'Sex', consultas: 0, canceladas: 0 },
    { name: 'Sáb', consultas: 0, canceladas: 0 },
    { name: 'Dom', consultas: 0, canceladas: 0 },
  ];

  allAppointments.forEach(app => {
    const date = parseISO(app.date);
    const dayIndex = (date.getDay() + 6) % 7; // 0 for Seg, 6 for Dom
    if (dayIndex >= 0 && dayIndex < 7) {
      if (app.status === 'confirmed') weeklyData[dayIndex].consultas++;
      if (app.status === 'cancelled') weeklyData[dayIndex].canceladas++;
    }
  });

  queue.forEach(p => {
    if (p.status === 'finished' && p.joinedAt) {
      const date = new Date(p.joinedAt);
      const dayIndex = (date.getDay() + 6) % 7;
      if (dayIndex >= 0 && dayIndex < 7) {
        weeklyData[dayIndex].consultas++;
      }
    }
  });
  
  // Generate week days
  const startDate = currentDate;
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const filteredAppointments = allAppointments.filter(app => 
    app.date === format(currentDate, 'yyyy-MM-dd')
  ).sort((a, b) => a.time.localeCompare(b.time));

  const pendingCount = allAppointments.filter(app => app.status === 'pending').length;

  // Accurate Counters - Combining Appointments and Queue
  const confirmedAppointments = allAppointments.filter(a => a.status === 'confirmed');
  const realizadasCount = confirmedAppointments.filter(a => isPast(parseISO(a.date)) || isSameDay(parseISO(a.date), today)).length + queue.filter(p => p.status === 'finished').length;
  const agendadasCount = confirmedAppointments.filter(a => isFuture(parseISO(a.date)) && !isSameDay(parseISO(a.date), today)).length + queue.filter(p => p.status === 'waiting').length;
  const canceladasMesCount = allAppointments.filter(a => a.status === 'cancelled' && isSameMonth(parseISO(a.date), today)).length;
  
  // Total Patients: Unique patients from appointments + patients in queue
  const totalPatients = new Set([
    ...allAppointments.map(a => a.patientName),
    ...queue.map(p => p.patientName)
  ]).size;


  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0F] h-full overflow-y-auto custom-scrollbar relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#A6FF00 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <div className="p-8 max-w-7xl mx-auto w-full z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard Analítico</h2>
            <p className="text-sm text-mecura-silver mt-2 max-w-md leading-relaxed">Visão geral de desempenho, fluxo de pacientes e acompanhamento de agenda em tempo real.</p>
          </div>
          {pendingCount > 0 && (
            <button 
              onClick={() => {
                const firstPending = allAppointments.find(app => app.status === 'pending');
                if (firstPending && firstPending.date) {
                  setCurrentDate(parseISO(firstPending.date));
                }
                document.getElementById('agenda-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative flex items-center gap-4 bg-[#161622] hover:bg-[#1A1A26] border border-mecura-neon/30 hover:border-mecura-neon px-6 py-3 rounded-xl transition-all duration-500 overflow-hidden shadow-[0_0_20px_rgba(166,255,0,0.1)] hover:shadow-[0_0_30px_rgba(166,255,0,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/0 via-mecura-neon/5 to-mecura-neon/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-mecura-neon/10 border border-mecura-neon/20 group-hover:bg-mecura-neon/20 group-hover:scale-110 transition-all duration-300">
                <Bell className="w-5 h-5 text-mecura-neon relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute inset-0 bg-mecura-neon opacity-40 blur-md rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col items-start relative z-10">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-mecura-neon/70">Atenção Necessária</span>
                <span className="text-sm font-bold text-white group-hover:text-mecura-neon transition-colors">
                  {pendingCount} {pendingCount === 1 ? 'Agendamento Pendente' : 'Agendamentos Pendentes'}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0A0A0F] border border-[#1A1A24] rounded-xl p-6 transition-colors hover:border-mecura-elevated">
            <div className="flex justify-between items-start mb-4">
              <p className="text-mecura-silver text-xs font-semibold uppercase tracking-[0.15em]">Total de Pacientes</p>
              <Users className="w-5 h-5 text-mecura-silver/50" />
            </div>
            <h3 className="text-4xl font-light text-white tracking-tight">{totalPatients}</h3>
          </div>

          <div className="bg-[#0A0A0F] border border-[#1A1A24] rounded-xl p-6 transition-colors hover:border-mecura-elevated">
            <div className="flex justify-between items-start mb-4">
              <p className="text-mecura-silver text-xs font-semibold uppercase tracking-[0.15em]">Consultas Realizadas</p>
              <CheckCircle className="w-5 h-5 text-mecura-silver/50" />
            </div>
            <h3 className="text-4xl font-light text-white tracking-tight">{realizadasCount}</h3>
          </div>

          <div className="bg-[#0A0A0F] border border-[#1A1A24] rounded-xl p-6 transition-colors hover:border-mecura-elevated relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-blue-500/20" />
            <div className="flex justify-between items-start mb-4">
              <p className="text-mecura-silver text-xs font-semibold uppercase tracking-[0.15em]">Agendadas</p>
              <Clock className="w-5 h-5 text-blue-500/50" />
            </div>
            <h3 className="text-4xl font-light text-white tracking-tight">{agendadasCount}</h3>
          </div>

          <div className="bg-[#0A0A0F] border border-[#1A1A24] rounded-xl p-6 transition-colors hover:border-mecura-elevated relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-red-500/20" />
            <div className="flex justify-between items-start mb-4">
              <p className="text-mecura-silver text-xs font-semibold uppercase tracking-[0.15em]">Canceladas (Mês)</p>
              <XCircle className="w-5 h-5 text-red-500/50" />
            </div>
            <h3 className="text-4xl font-light text-white tracking-tight">{canceladasMesCount}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-[#0A0A0F] border border-[#1A1A24] rounded-xl p-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Consultas por Dia</h3>
                <p className="text-sm text-mecura-silver mt-1">Visão semanal de atendimentos confirmados e cancelados</p>
              </div>
              <select className="bg-transparent border-b border-mecura-elevated text-mecura-silver text-sm pb-1 focus:outline-none focus:border-mecura-neon hover:text-white transition-colors cursor-pointer">
                <option className="bg-[#0A0A0F]">Esta Semana</option>
                <option className="bg-[#0A0A0F]">Semana Passada</option>
                <option className="bg-[#0A0A0F]">Este Mês</option>
              </select>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A24" vertical={false} />
                  <XAxis dataKey="name" stroke="#8A8A9E" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#8A8A9E" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161622', border: '1px solid #262636', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#A6FF00' }}
                    cursor={{ fill: '#1A1A24', opacity: 0.4 }}
                  />
                  <Bar dataKey="consultas" name="Realizadas" fill="#A6FF00" radius={[2, 2, 0, 0]} barSize={24} />
                  <Bar dataKey="canceladas" name="Canceladas" fill="#EF4444" radius={[2, 2, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar & Schedule */}
          <div id="agenda-section" className="bg-[#0A0A0F] border border-[#1A1A24] rounded-xl p-8 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-8">
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
            </div>

            {/* Mini Calendar Week View */}
            <div className="flex justify-between mb-6">
              {weekDays.map((date, i) => {
                const isToday = isSameDay(date, new Date());
                const isSelected = isSameDay(date, currentDate);
                const hasPending = allAppointments.some(app => app.date === format(date, 'yyyy-MM-dd') && app.status === 'pending');
                
                return (
                  <button 
                    key={i}
                    onClick={() => setCurrentDate(date)}
                    className={`flex flex-col items-center p-2 rounded-xl min-w-[40px] transition-all relative ${
                      isSelected 
                        ? 'bg-mecura-neon text-black font-bold shadow-[0_0_15px_rgba(166,255,0,0.2)]' 
                        : isToday
                          ? 'bg-mecura-surface-light text-white border border-mecura-elevated'
                          : 'text-mecura-silver hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[10px] uppercase mb-1">{format(date, 'EE', { locale: ptBR }).substring(0, 3)}</span>
                    <span className="text-sm">{format(date, 'dd')}</span>
                    {hasPending && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-mecura-surface" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-sm font-medium text-white mb-4 pb-2 border-b border-mecura-elevated">
              {format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </div>

            {/* Schedule List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarIcon className="w-10 h-10 text-mecura-elevated mb-3" />
                  <p className="text-sm text-mecura-silver">Nenhuma consulta para este dia</p>
                </div>
              ) : filteredAppointments.map((item, i) => (
                <div key={item.id} className={`flex gap-3 items-start p-3 rounded-xl bg-[#0A0A0F] border transition-colors group relative ${
                  item.status === 'pending' ? 'border-mecura-neon/50 bg-mecura-neon/5' : 'border-mecura-elevated hover:border-mecura-neon/30'
                }`}>
                  <div className="w-12 text-center flex-shrink-0 pt-0.5">
                    <span className="text-xs font-bold text-mecura-silver group-hover:text-mecura-neon transition-colors">{item.time}</span>
                  </div>
                  <div className="w-[2px] h-10 bg-mecura-elevated rounded-full relative">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                      item.status === 'confirmed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                      item.status === 'pending' ? 'bg-mecura-neon animate-pulse shadow-[0_0_8px_rgba(166,255,0,0.5)]' :
                      item.status === 'cancelled' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                      'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{item.patientName}</h4>
                        <p className="text-[11px] text-mecura-silver mt-1">{item.type}</p>
                      </div>
                      {item.status === 'pending' && (
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
                    </div>
                    {item.status === 'pending' && (
                      <div className="mt-2 text-[10px] font-bold text-mecura-neon uppercase tracking-wider">
                        Aguardando Confirmação
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

