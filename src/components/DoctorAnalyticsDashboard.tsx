import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check, X, 
  Bell, Plus, MessageCircle, Lock, Unlock, ShieldAlert, AlertCircle, Sparkles, Moon, Sunrise, Sun, Sunset, CalendarDays 
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO, isPast, isFuture, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ALL_24H_TIME_SLOTS, TIME_PERIODS, TimePeriodId } from '../utils/schedulingSlots';

export function DoctorAnalyticsDashboard() {
  const { 
    allAppointments, confirmAppointment, cancelAppointment, consultationHistory, queue, 
    subscribeToQueue, addAppointment, blockedDates, blockDate, unblockDate,
    blockMonth, unblockMonth, subscribeToBlockedDates, subscribeToAppointments
  } = useStore();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockScope, setBlockScope] = useState<'month' | 'day' | 'times'>('day');
  const [blockMonthYear, setBlockMonthYear] = useState(format(new Date(), 'yyyy-MM'));
  const [blockPeriodFilter, setBlockPeriodFilter] = useState<TimePeriodId>('all');
  const [scheduleTimePeriod, setScheduleTimePeriod] = useState<TimePeriodId>('manha');
  const [isProcessingMonth, setIsProcessingMonth] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({ 
    patientName: '', 
    date: format(new Date(), 'yyyy-MM-dd'), 
    time: '10:00', 
    type: 'Retorno' 
  });

  const [blockForm, setBlockForm] = useState<{
    date: string;
    fullDay: boolean;
    times: string[];
    reason: string;
  }>({
    date: format(new Date(), 'yyyy-MM-dd'),
    fullDay: true,
    times: [],
    reason: 'Folga médica'
  });

  const uniquePatientsList = Array.from(new Set([...allAppointments.map(a => a.patientName), ...queue.map(p => p.patientName)])).filter(Boolean);
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  useEffect(() => {
    const unsubscribeQueue = subscribeToQueue();
    const unsubscribeBlocked = subscribeToBlockedDates();
    const unsubscribeApp = subscribeToAppointments();
    return () => {
      unsubscribeQueue();
      unsubscribeBlocked();
      unsubscribeApp();
    };
  }, [subscribeToQueue, subscribeToBlockedDates, subscribeToAppointments]);
  
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
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const currentDateStr = format(currentDate, 'yyyy-MM-dd');
  const currentDayBlocked = blockedDates.find(b => b.date === currentDateStr);

  // Month-level block stats
  const currentMonthYear = format(currentDate, 'yyyy-MM');
  const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const blockedDaysInCurrentMonth = blockedDates.filter(b => b.date.startsWith(currentMonthYear) && b.fullDay);
  const isCurrentMonthFullyBlocked = blockedDaysInCurrentMonth.length >= daysInCurrentMonth;

  const filteredAppointments = allAppointments.filter(app => 
    app.date === currentDateStr
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

  const handleOpenBlockModal = (dateToBlock?: Date, defaultScope?: 'day' | 'times' | 'month') => {
    const targetDate = dateToBlock || currentDate;
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    const existing = blockedDates.find(b => b.date === dateStr);
    
    setBlockMonthYear(format(targetDate, 'yyyy-MM'));
    if (defaultScope) {
      setBlockScope(defaultScope);
    } else {
      setBlockScope(existing?.fullDay === false ? 'times' : 'day');
    }

    if (existing) {
      setBlockForm({
        date: dateStr,
        fullDay: existing.fullDay ?? true,
        times: existing.times || [],
        reason: existing.reason || 'Folga médica'
      });
    } else {
      setBlockForm({
        date: dateStr,
        fullDay: true,
        times: [],
        reason: 'Folga médica'
      });
    }
    setShowBlockModal(true);
  };


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
          <div id="agenda-section" className="bg-[#0A0A0F] border border-[#1A1A24] rounded-xl p-8 flex flex-col min-h-[520px]">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-mecura-neon" />
                  Agenda Médica & Bloqueios
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-mecura-neon/10 border border-mecura-neon/30 text-[10px] font-bold text-mecura-neon uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-mecura-neon animate-pulse" />
                    Atendimento 24h Ativo
                  </span>
                  <span className="text-xs text-mecura-silver">
                    {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => handleOpenBlockModal(currentDate, 'month')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isCurrentMonthFullyBlocked 
                      ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                  }`}
                  title="Bloquear ou desbloquear um mês inteiro da agenda"
                >
                  <CalendarDays className="w-4 h-4" />
                  {isCurrentMonthFullyBlocked ? 'Mês Bloqueado' : 'Bloquear Mês Inteiro'}
                </button>
                <button 
                  onClick={() => handleOpenBlockModal(currentDate)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    currentDayBlocked 
                      ? 'bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  }`}
                  title="Bloquear ou destravar dias/horários 24h da agenda"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {currentDayBlocked ? 'Editar Bloqueio' : 'Bloquear Dia/Horas'}
                </button>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon text-sm font-bold hover:bg-mecura-neon hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Agendar
                </button>
                <div className="flex bg-[#0A0A0F] border border-mecura-elevated rounded-lg overflow-hidden ml-1">
                  <button onClick={prevWeek} className="p-1.5 text-mecura-silver hover:text-white hover:bg-white/5 transition-colors border-r border-mecura-elevated cursor-pointer" title="Semana anterior">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={nextWeek} className="p-1.5 text-mecura-silver hover:text-white hover:bg-white/5 transition-colors cursor-pointer" title="Próxima semana">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Prominent Month Blocked Banner if Whole Month is Closed */}
            {isCurrentMonthFullyBlocked && (
              <div className="p-4 mb-5 rounded-2xl bg-gradient-to-r from-red-600/20 via-red-500/10 to-transparent border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(239,68,68,0.15)]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-red-300 uppercase tracking-wide">
                        Mês Inteiro Bloqueado ({format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })})
                      </h4>
                      <span className="text-[10px] text-red-200 bg-red-500/30 px-2 py-0.5 rounded-full font-bold">
                        {blockedDaysInCurrentMonth.length} dias fechados
                      </span>
                    </div>
                    <p className="text-xs text-[#C5C5D8] mt-1 leading-relaxed">
                      Nenhum paciente poderá agendar consultas durante este mês inteiro. Você pode desbloquear a qualquer momento.
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await unblockMonth(currentMonthYear);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer self-start sm:self-center shrink-0"
                >
                  <Unlock className="w-3.5 h-3.5" /> Desbloquear Mês Inteiro
                </button>
              </div>
            )}

            {/* Mini Calendar Week View */}
            <div className="flex justify-between gap-1 mb-6">
              {weekDays.map((date, i) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isToday = isSameDay(date, new Date());
                const isSelected = isSameDay(date, currentDate);
                const hasPending = allAppointments.some(app => app.date === dateStr && app.status === 'pending');
                const dayBlocked = blockedDates.find(b => b.date === dateStr);
                const isFullDayBlocked = dayBlocked?.fullDay;
                const hasPartialBlockedHours = dayBlocked && !dayBlocked.fullDay && (dayBlocked.times?.length || 0) > 0;
                
                return (
                  <button 
                    key={i}
                    onClick={() => setCurrentDate(date)}
                    className={`flex flex-col items-center p-2 rounded-xl flex-1 min-w-[38px] transition-all relative cursor-pointer ${
                      isSelected 
                        ? 'bg-mecura-neon text-black font-bold shadow-[0_0_15px_rgba(166,255,0,0.2)]' 
                        : isFullDayBlocked
                          ? 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20'
                          : hasPartialBlockedHours
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                            : isToday
                              ? 'bg-mecura-surface-light text-white border border-mecura-elevated'
                              : 'text-mecura-silver hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[10px] uppercase mb-1">{format(date, 'EE', { locale: ptBR }).substring(0, 3)}</span>
                    <span className="text-sm font-semibold">{format(date, 'dd')}</span>
                    
                    {isFullDayBlocked && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 border-2 border-[#0A0A0F] flex items-center justify-center text-white" title={`Dia Bloqueado: ${dayBlocked?.reason || 'Indisponível'}`}>
                        <Lock className="w-2.5 h-2.5" />
                      </div>
                    )}

                    {hasPartialBlockedHours && !isFullDayBlocked && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#0A0A0F]" title={`${dayBlocked?.times?.length} horários bloqueados`} />
                    )}

                    {hasPending && !dayBlocked && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-mecura-surface" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Header & Block Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-white mb-4 pb-2 border-b border-mecura-elevated">
              <div className="flex items-center gap-2">
                <span>{format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                {currentDayBlocked ? (
                  currentDayBlocked.fullDay ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> Dia Inteiro Bloqueado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> {currentDayBlocked.times?.length || 0} Horários Bloqueados
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-mecura-neon bg-mecura-neon/10 border border-mecura-neon/20 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Aberto 24 Horas
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {currentDayBlocked ? (
                  <button
                    onClick={() => unblockDate(currentDayBlocked.id || currentDayBlocked.date)}
                    className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Desbloquear este dia
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenBlockModal(currentDate, 'day')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" /> Bloquear este dia
                  </button>
                )}
                <button
                  onClick={() => handleOpenBlockModal(currentDate, 'times')}
                  className="text-xs text-mecura-neon hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" /> Gerenciar horários 24h
                </button>
              </div>
            </div>

            {/* Prominent Day Blocked Banner if Active */}
            {currentDayBlocked && (
              <div className="p-4 mb-4 rounded-xl bg-gradient-to-r from-red-500/15 via-red-500/10 to-transparent border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-red-400">
                        {currentDayBlocked.fullDay ? 'Agenda Trancada (Dia Inteiro)' : 'Horários Específicos Bloqueados'}
                      </h4>
                      <span className="text-[10px] text-red-300 bg-red-500/25 px-2 py-0.5 rounded-full font-medium">
                        {currentDayBlocked.reason || 'Folga médica'}
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A0B5] mt-1 leading-relaxed">
                      {currentDayBlocked.fullDay 
                        ? 'Pacientes que acessarem o agendamento verão este dia marcado como BLOQUEADO e não poderão escolher horários.' 
                        : `Horários bloqueados para pacientes (${currentDayBlocked.times?.length || 0}): ${currentDayBlocked.times?.join(', ')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleOpenBlockModal(currentDate, currentDayBlocked.fullDay ? 'day' : 'times')}
                    className="px-3 py-1.5 rounded-lg bg-[#161622] border border-white/10 text-white text-xs font-semibold hover:bg-[#202030] transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => unblockDate(currentDayBlocked.id || currentDayBlocked.date)}
                    className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Liberar Dia
                  </button>
                </div>
              </div>
            )}

            {/* Schedule List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarIcon className="w-10 h-10 text-mecura-elevated mb-3" />
                  <p className="text-sm text-mecura-silver">
                    {currentDayBlocked 
                      ? 'Nenhuma consulta agendada para esta data bloqueada' 
                      : 'Nenhuma consulta agendada para este dia'}
                  </p>
                  <p className="text-xs text-[#8A8A9E] mt-1">
                    Atendimento disponível 24 horas. Pacientes podem agendar consultas a qualquer momento.
                  </p>
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
                            className="p-1.5 rounded-lg bg-mecura-neon text-black hover:bg-[#b5ff33] transition-colors cursor-pointer"
                            title="Confirmar"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); cancelAppointment(item.id); }}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors border border-red-500/30 cursor-pointer"
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
                            className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/30 cursor-pointer"
                            title="Avisar no WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
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

      {/* Schedule Modal (24h Enabled) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 text-mecura-silver hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-mecura-neon" />
              Agendar Consulta / Retorno
            </h3>
            <p className="text-xs text-[#8A8A9E] mb-5">
              Defina o horário (24h disponível) e associe ao paciente.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mecura-silver mb-1.5">Nome do Paciente</label>
                <input 
                  type="text" 
                  list="patientsList"
                  value={scheduleForm.patientName}
                  onChange={(e) => setScheduleForm({...scheduleForm, patientName: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-mecura-neon focus:outline-none transition-colors"
                  placeholder="Digite ou selecione o paciente..."
                />
                <datalist id="patientsList">
                  {uniquePatientsList.map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mecura-silver mb-1.5">Data</label>
                  <input 
                    type="date" 
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                    className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-mecura-neon focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-mecura-silver mb-1.5">Horário Selecionado</label>
                  <input 
                    type="time" 
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                    className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-mecura-neon focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* 24h Slots Picker with Period Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-mecura-silver">
                    Sugestões 24h por Turno
                  </label>
                  <div className="flex gap-1">
                    {(['madrugada', 'manha', 'tarde', 'noite'] as TimePeriodId[]).map(pId => (
                      <button
                        key={pId}
                        type="button"
                        onClick={() => setScheduleTimePeriod(pId)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          scheduleTimePeriod === pId 
                            ? 'bg-mecura-neon text-black' 
                            : 'bg-[#0A0A0F] text-mecura-silver hover:text-white'
                        }`}
                      >
                        {pId}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-2 bg-[#0A0A0F] rounded-xl border border-[#262636]">
                  {(TIME_PERIODS.find(p => p.id === scheduleTimePeriod)?.slots || ALL_24H_TIME_SLOTS).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setScheduleForm({...scheduleForm, time: slot})}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        scheduleForm.time === slot
                          ? 'bg-mecura-neon text-black shadow-[0_0_10px_rgba(166,255,0,0.3)]'
                          : 'bg-[#161622] text-mecura-silver hover:text-white hover:bg-[#202030]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mecura-silver mb-1.5">Tipo de Consulta</label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-mecura-neon focus:outline-none transition-colors"
                >
                  <option value="Consulta Inicial">Consulta Inicial</option>
                  <option value="Retorno">Retorno</option>
                  <option value="Acompanhamento">Acompanhamento</option>
                  <option value="Emergência 24h">Emergência 24h</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => {
                if (scheduleForm.patientName && scheduleForm.date && scheduleForm.time) {
                  addAppointment({ ...scheduleForm, status: 'confirmed' });
                  
                  // Try to find patient ID in queue or history to send chat notification
                  const patientId = queue.find(p => p.patientName === scheduleForm.patientName)?.id 
                                 || consultationHistory.find(h => h.patientName === scheduleForm.patientName)?.id;
                  
                  if (patientId) {
                     addDoc(collection(db, 'active_consultations', patientId, 'messages'), {
                       id: Date.now().toString(),
                       text: `[SISTEMA] Sua consulta foi agendada para ${format(parseISO(scheduleForm.date), 'dd/MM/yyyy')} às ${scheduleForm.time}.`,
                       sender: 'doctor',
                       timestamp: new Date()
                     }).catch(console.error);
                  }

                  setShowScheduleModal(false);
                  setScheduleForm({...scheduleForm, patientName: ''});
                  setCurrentDate(parseISO(scheduleForm.date));
                }
              }}
              className="w-full mt-6 py-3 bg-mecura-neon text-black font-bold rounded-xl hover:bg-[#b5ff33] transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(166,255,0,0.2)] cursor-pointer"
            >
              <Check className="w-5 h-5" />
              Confirmar Agendamento ({scheduleForm.time})
            </button>
          </div>
        </div>
      )}

      {/* Block Date / Hours / Entire Month Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-xl shadow-2xl relative">
            <button 
              onClick={() => setShowBlockModal(false)}
              className="absolute top-4 right-4 text-mecura-silver hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  Controle da Agenda: Bloqueios
                </h3>
                <p className="text-xs text-mecura-silver mt-0.5">
                  Bloqueie o mês inteiro, dias específicos ou turnos/horários 24h quando quiser.
                </p>
              </div>
            </div>

            {/* Scope Selection Tabs (Mês Inteiro, Dia Inteiro, Horários 24h) */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#0A0A0F] rounded-2xl border border-[#262636] mb-5">
              <button
                type="button"
                onClick={() => setBlockScope('month')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  blockScope === 'month'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-mecura-silver hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Mês Inteiro
              </button>

              <button
                type="button"
                onClick={() => setBlockScope('day')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  blockScope === 'day'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-mecura-silver hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Dia Inteiro
              </button>

              <button
                type="button"
                onClick={() => setBlockScope('times')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  blockScope === 'times'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-mecura-silver hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Horários 24h
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Option A: BLOQUEAR MÊS INTEIRO */}
              {blockScope === 'month' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mecura-silver uppercase tracking-wider mb-1.5">
                        Mês a Bloquear
                      </label>
                      <input 
                        type="month" 
                        value={blockMonthYear}
                        onChange={(e) => setBlockMonthYear(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mecura-silver uppercase tracking-wider mb-1.5">
                        Motivo do Bloqueio
                      </label>
                      <select
                        value={blockForm.reason}
                        onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-3 py-2.5 text-white focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="Férias da clínica">Férias da clínica</option>
                        <option value="Recesso médico">Recesso médico</option>
                        <option value="Licença médica">Licença médica</option>
                        <option value="Congresso / Atualização Internacional">Congresso / Atualização Internacional</option>
                        <option value="Reforma estrutural">Reforma estrutural</option>
                        <option value="Agenda fechada pelo médico">Agenda fechada pelo médico</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary of Month Blocking */}
                  {(() => {
                    const [y, m] = blockMonthYear.split('-').map(Number);
                    const daysCount = (!isNaN(y) && !isNaN(m)) ? new Date(y, m, 0).getDate() : 30;
                    const blockedCount = blockedDates.filter(b => b.date.startsWith(blockMonthYear) && b.fullDay).length;
                    const isFullyBlocked = blockedCount >= daysCount;

                    return (
                      <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#262636] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-mecura-silver">Status atual do mês:</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isFullyBlocked 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                              : blockedCount > 0 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {isFullyBlocked ? 'Totalmente Bloqueado' : blockedCount > 0 ? `${blockedCount} dias bloqueados` : 'Agenda Aberta'}
                          </span>
                        </div>
                        <p className="text-xs text-[#8A8A9E] leading-relaxed">
                          Ao bloquear o mês inteiro, todos os <strong>{daysCount} dias</strong> de {blockMonthYear} ficarão indisponíveis para pacientes.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <button
                            type="button"
                            disabled={isProcessingMonth}
                            onClick={async () => {
                              try {
                                setIsProcessingMonth(true);
                                await blockMonth(blockMonthYear, blockForm.reason);
                                setShowBlockModal(false);
                              } finally {
                                setIsProcessingMonth(false);
                              }
                            }}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer disabled:opacity-50"
                          >
                            <Lock className="w-4 h-4" />
                            Bloquear Mês Inteiro ({daysCount} dias)
                          </button>

                          <button
                            type="button"
                            disabled={isProcessingMonth || blockedCount === 0}
                            onClick={async () => {
                              try {
                                setIsProcessingMonth(true);
                                await unblockMonth(blockMonthYear);
                                setShowBlockModal(false);
                              } finally {
                                setIsProcessingMonth(false);
                              }
                            }}
                            className="w-full py-3 bg-[#161622] hover:bg-[#202030] text-mecura-pearl border border-white/10 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Unlock className="w-4 h-4 text-[#A6FF00]" />
                            Desbloquear Mês Inteiro
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Option B: BLOQUEAR DIA INTEIRO */}
              {blockScope === 'day' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mecura-silver uppercase tracking-wider mb-1.5">Data a Bloquear</label>
                      <input 
                        type="date" 
                        value={blockForm.date}
                        onChange={(e) => setBlockForm({...blockForm, date: e.target.value})}
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-red-500 focus:outline-none transition-colors [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mecura-silver uppercase tracking-wider mb-1.5">Motivo do Bloqueio</label>
                      <select
                        value={blockForm.reason}
                        onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-3 py-2.5 text-white focus:border-red-500 focus:outline-none transition-colors"
                      >
                        <option value="Folga médica">Folga médica</option>
                        <option value="Compromisso pessoal">Compromisso pessoal</option>
                        <option value="Congresso / Atualização">Congresso / Atualização</option>
                        <option value="Feriado">Feriado</option>
                        <option value="Cirurgias / Procedimentos">Cirurgias / Procedimentos</option>
                        <option value="Agenda lotada">Agenda lotada</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#262636]">
                    <div className="flex items-center gap-2 font-bold text-sm mb-1 text-red-400">
                      <Lock className="w-4 h-4" /> Bloqueio Total deste Dia
                    </div>
                    <p className="text-xs text-[#8A8A9E] leading-relaxed">
                      Nenhum horário ficará disponível para os pacientes na data selecionada ({blockForm.date}).
                    </p>
                  </div>
                </div>
              )}

              {/* Option C: BLOQUEAR HORÁRIOS ESPECÍFICOS (24H) */}
              {blockScope === 'times' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mecura-silver uppercase tracking-wider mb-1.5">Data</label>
                      <input 
                        type="date" 
                        value={blockForm.date}
                        onChange={(e) => setBlockForm({...blockForm, date: e.target.value})}
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none transition-colors [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mecura-silver uppercase tracking-wider mb-1.5">Motivo</label>
                      <input
                        type="text"
                        value={blockForm.reason}
                        onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                        placeholder="Ex: Turno indisponível"
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-3 py-2.5 text-white focus:border-amber-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-[#0A0A0F] border border-[#262636] rounded-2xl p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-mecura-silver uppercase tracking-wider">
                        Selecione os Horários 24h:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const currentSlots = blockPeriodFilter === 'all' 
                              ? ALL_24H_TIME_SLOTS 
                              : (TIME_PERIODS.find(p => p.id === blockPeriodFilter)?.slots || ALL_24H_TIME_SLOTS);
                            const merged = Array.from(new Set([...blockForm.times, ...currentSlots]));
                            setBlockForm({...blockForm, times: merged});
                          }}
                          className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                        >
                          Marcar Turno
                        </button>
                        <span className="text-white/20">|</span>
                        <button
                          type="button"
                          onClick={() => setBlockForm({...blockForm, times: [...ALL_24H_TIME_SLOTS]})}
                          className="text-[10px] text-mecura-neon hover:underline cursor-pointer"
                        >
                          Marcar Todos (24h)
                        </button>
                        <span className="text-white/20">|</span>
                        <button
                          type="button"
                          onClick={() => setBlockForm({...blockForm, times: []})}
                          className="text-[10px] text-mecura-silver hover:underline cursor-pointer"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>

                    {/* Turno Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 custom-scrollbar">
                      {TIME_PERIODS.map(period => (
                        <button
                          key={period.id}
                          type="button"
                          onClick={() => setBlockPeriodFilter(period.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                            blockPeriodFilter === period.id
                              ? 'bg-amber-500 text-black'
                              : 'bg-[#161622] text-mecura-silver hover:text-white'
                          }`}
                        >
                          {period.id === 'madrugada' && <Moon className="w-3 h-3" />}
                          {period.id === 'manha' && <Sunrise className="w-3 h-3" />}
                          {period.id === 'tarde' && <Sun className="w-3 h-3" />}
                          {period.id === 'noite' && <Sunset className="w-3 h-3" />}
                          {period.id === 'all' && <Sparkles className="w-3 h-3" />}
                          <span>{period.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Slots Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {(blockPeriodFilter === 'all' 
                        ? ALL_24H_TIME_SLOTS 
                        : (TIME_PERIODS.find(p => p.id === blockPeriodFilter)?.slots || ALL_24H_TIME_SLOTS)
                      ).map((slot) => {
                        const isSelected = blockForm.times.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setBlockForm({...blockForm, times: blockForm.times.filter(t => t !== slot)});
                              } else {
                                setBlockForm({...blockForm, times: [...blockForm.times, slot]});
                              }
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-[#161622] border-white/5 text-mecura-silver hover:border-white/20'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-mecura-silver mt-2 text-right">
                      {blockForm.times.length} horários selecionados para bloquear
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            {blockScope !== 'month' && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="py-3 bg-[#161622] border border-[#262636] text-mecura-silver font-bold rounded-xl hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    if (blockForm.date) {
                      const isFullDay = blockScope === 'day';
                      await blockDate(
                        blockForm.date,
                        blockForm.reason,
                        isFullDay,
                        isFullDay ? [] : blockForm.times
                      );
                      setShowBlockModal(false);
                      setCurrentDate(parseISO(blockForm.date));
                    }
                  }}
                  className={`py-3 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    blockScope === 'day' 
                      ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                      : 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  {blockScope === 'day' ? 'Salvar Bloqueio do Dia' : `Salvar (${blockForm.times.length} Horários)`}
                </button>
              </div>
            )}
            {blockScope === 'month' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="text-xs text-mecura-silver hover:text-white underline cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


