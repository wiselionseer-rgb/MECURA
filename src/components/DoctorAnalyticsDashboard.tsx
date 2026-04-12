import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check, X, Bell } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useStore } from '../store/useStore';

export function DoctorAnalyticsDashboard() {
  const { allAppointments, confirmAppointment, cancelAppointment, consultationHistory } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
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
    const date = new Date(app.date);
    const dayIndex = (date.getDay() + 6) % 7; // 0 for Seg, 6 for Dom
    if (dayIndex >= 0 && dayIndex < 7) {
      if (app.status === 'confirmed') weeklyData[dayIndex].consultas++;
      if (app.status === 'cancelled') weeklyData[dayIndex].canceladas++;
    }
  });
  
  // Generate week days
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const filteredAppointments = allAppointments.filter(app => 
    app.date === format(currentDate, 'yyyy-MM-dd')
  ).sort((a, b) => a.time.localeCompare(b.time));

  const pendingCount = allAppointments.filter(app => app.status === 'pending').length;

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0F] h-full overflow-y-auto custom-scrollbar relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#A6FF00 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <div className="p-8 max-w-7xl mx-auto w-full z-10 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard Analítico</h2>
            <p className="text-sm text-mecura-silver mt-1">Visão geral de atendimentos e agenda</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-mecura-neon/10 border border-mecura-neon/30 px-4 py-2 rounded-xl animate-pulse">
              <Bell className="w-4 h-4 text-mecura-neon" />
              <span className="text-sm font-bold text-mecura-neon">{pendingCount} novos agendamentos pendentes</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-mecura-surface border border-mecura-elevated rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-mecura-neon/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20">
                <Users className="w-6 h-6 text-mecura-neon" />
              </div>
              <div>
                <p className="text-mecura-silver text-xs font-medium uppercase tracking-wider mb-1">Total de Pacientes</p>
                <h3 className="text-2xl font-bold text-white">{new Set(allAppointments.map(a => a.patientName)).size}</h3>
              </div>
            </div>
          </div>

          <div className="bg-mecura-surface border border-mecura-elevated rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-mecura-silver text-xs font-medium uppercase tracking-wider mb-1">Realizadas (Total)</p>
                <h3 className="text-2xl font-bold text-white">{allAppointments.filter(a => a.status === 'confirmed').length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-mecura-surface border border-mecura-elevated rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-mecura-silver text-xs font-medium uppercase tracking-wider mb-1">Agendadas</p>
                <h3 className="text-2xl font-bold text-white">{allAppointments.filter(a => a.status === 'confirmed').length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-mecura-surface border border-mecura-elevated rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-mecura-silver text-xs font-medium uppercase tracking-wider mb-1">Canceladas (Mês)</p>
                <h3 className="text-2xl font-bold text-white">{allAppointments.filter(a => a.status === 'cancelled').length}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-mecura-surface border border-mecura-elevated rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Consultas por Dia</h3>
                <p className="text-xs text-mecura-silver">Visão semanal de atendimentos</p>
              </div>
              <select className="bg-[#0A0A0F] border border-mecura-elevated text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-mecura-neon/50">
                <option>Esta Semana</option>
                <option>Semana Passada</option>
                <option>Este Mês</option>
              </select>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A24" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0F', borderColor: '#1A1A24', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#A6FF00' }}
                    cursor={{ fill: '#1A1A24', opacity: 0.4 }}
                  />
                  <Bar dataKey="consultas" name="Realizadas" fill="#A6FF00" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="canceladas" name="Canceladas" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar & Schedule */}
          <div className="bg-mecura-surface border border-mecura-elevated rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
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

