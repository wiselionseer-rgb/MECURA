import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { ChevronLeft, Calendar, ChevronRight, Lock, AlertCircle, ShieldAlert, CheckCircle, Sparkles, Clock, Moon, Sunrise, Sun, Sunset } from 'lucide-react';
import { format, isPast, isSameDay, startOfMonth, addMonths, isSameMonth } from 'date-fns';
import { ALL_24H_TIME_SLOTS, TIME_PERIODS, TimePeriodId } from '../utils/schedulingSlots';

export function SchedulingScreen() {
  const navigate = useNavigate();
  const { 
    setScheduledConsultation, 
    pagamento_premium, 
    addAppointment, 
    setConsultationStatus, 
    allAppointments, 
    blockedDates, 
    userName,
    subscribeToAppointments,
    subscribeToBlockedDates
  } = useStore();

  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const nextMonthStart = addMonths(currentMonthStart, 1);

  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriodId>('all');

  useEffect(() => {
    if (!pagamento_premium) {
      navigate('/premium-checkout');
    }
  }, [pagamento_premium, navigate]);

  useEffect(() => {
    const unsubApp = subscribeToAppointments();
    const unsubBlock = subscribeToBlockedDates();
    return () => {
      unsubApp();
      unsubBlock();
    };
  }, [subscribeToAppointments, subscribeToBlockedDates]);

  // Restrict calendar navigation strictly to current month and next month
  const isCurrentMonth = isSameMonth(currentDate, currentMonthStart);
  const isNextMonth = isSameMonth(currentDate, nextMonthStart);
  const canGoPrev = !isCurrentMonth;
  const canGoNext = isCurrentMonth;

  const changeMonth = (offset: number) => {
    if (offset < 0 && !canGoPrev) return;
    if (offset > 0 && !canGoNext) return;
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const getOccupiedTimes = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allAppointments
      .filter(app => app.date === dateStr && app.status !== 'cancelled')
      .map(app => app.time);
  };

  const getBlockedTimes = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const blockedItem = blockedDates.find(b => b.date === dateStr);
    if (!blockedItem) return [];
    if (blockedItem.fullDay) return ALL_24H_TIME_SLOTS;
    return blockedItem.times || [];
  };

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedDayBlockedInfo = selectedDateStr ? blockedDates.find(b => b.date === selectedDateStr) : null;
  const isSelectedDateFullyBlocked = selectedDayBlockedInfo?.fullDay ?? false;

  const handleSchedule = () => {
    if (selectedDate && selectedTime && !isSelectedDateFullyBlocked) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setScheduledConsultation({
        date: dateStr,
        time: selectedTime
      });
      setConsultationStatus('pending');
      addAppointment({
        patientName: userName || 'Paciente',
        date: dateStr,
        time: selectedTime,
        type: 'Acompanhamento Premium'
      });
      navigate('/confirmation');
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const currentMonthYearStr = format(currentDate, 'yyyy-MM');
  const fullyBlockedDaysInMonth = blockedDates.filter(b => b.date.startsWith(currentMonthYearStr) && b.fullDay).length;
  const isEntireMonthBlocked = fullyBlockedDaysInMonth >= daysInMonth;

  const displayedSlots = selectedPeriod === 'all' 
    ? ALL_24H_TIME_SLOTS 
    : (TIME_PERIODS.find(p => p.id === selectedPeriod)?.slots || ALL_24H_TIME_SLOTS);

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative font-sans">
      <div className="flex items-center p-6 pb-2 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center text-mecura-silver hover:bg-[#2A2A3A] transition-colors border border-[#2A2A3A] cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center pr-10">
          <h1 className="text-2xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#A6FF00] to-[#C9FF5C]">mecura</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A6FF00]/10 border border-[#A6FF00]/30 text-[#A6FF00] text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#A6FF00] animate-pulse" />
            Agenda 24 Horas Disponível
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-mecura-pearl">
            Escolha o melhor horário<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A6FF00] to-[#C9FF5C]">para sua consulta médica</span>
          </h2>
          <p className="text-xs text-[#8A8A9E] mt-2 max-w-sm mx-auto">
            Atendimento disponível 24h em todos os turnos. Agendamentos válidos para o mês atual e o mês seguinte.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#8A8A9E] mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#A6FF00]" />
            <span>Disponível 24h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Bloqueado pelo Médico</span>
          </div>
        </div>

        {/* Entire Month Blocked Banner */}
        {isEntireMonthBlocked && (
          <div className="mb-6 p-4 rounded-3xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-400">
                  Agenda Fechada para Todo o Mês ({currentDate.toLocaleString('pt-BR', { month: 'long' })})
                </h4>
                <p className="text-xs text-[#A0A0B5] mt-0.5">
                  O médico bloqueou todos os dias deste mês. Por favor, consulte o próximo mês.
                </p>
              </div>
            </div>
            {canGoNext && (
              <button
                onClick={() => changeMonth(1)}
                className="px-4 py-2 rounded-xl bg-[#A6FF00] hover:bg-[#C9FF5C] text-black font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-md"
              >
                Ver Próximo Mês &rarr;
              </button>
            )}
          </div>
        )}

        {/* Calendar Box */}
        <div className="bg-[#1A1A24] rounded-3xl p-6 mb-8 border border-[#2A2A3A] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#A6FF00]" />
              <h3 className="text-lg font-bold text-mecura-pearl">
                {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isCurrentMonth 
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' 
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}>
                {isCurrentMonth ? 'Mês Atual' : 'Próximo Mês'}
              </span>
            </div>
            
            {/* Month Navigation - Strictly constrained to current and next month */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => changeMonth(-1)} 
                disabled={!canGoPrev}
                className="p-2 rounded-full bg-[#2A2A3A] hover:bg-[#3A3A4A] transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                title={!canGoPrev ? "Você já está no mês atual (início da agenda)" : "Mês anterior"}
              >
                <ChevronLeft className="w-4 h-4 text-[#A6FF00]" />
              </button>
              <button 
                onClick={() => changeMonth(1)} 
                disabled={!canGoNext}
                className="p-2 rounded-full bg-[#2A2A3A] hover:bg-[#3A3A4A] transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                title={!canGoNext ? "A agenda fica aberta para o mês atual e o próximo" : "Próximo mês"}
              >
                <ChevronRight className="w-4 h-4 text-[#A6FF00]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-mecura-silver mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <span key={d}>{d}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dateStr = format(date, 'yyyy-MM-dd');
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth() && selectedDate?.getFullYear() === currentDate.getFullYear();
              const blockedInfo = blockedDates.find(b => b.date === dateStr);
              const isFullyBlocked = blockedInfo?.fullDay ?? false;
              const hasPartialBlock = !!blockedInfo && !blockedInfo.fullDay && (blockedInfo.times?.length || 0) > 0;
              const isPastDate = isPast(date) && !isSameDay(date, today);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    if (isPastDate) return;
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  disabled={isPastDate}
                  className={`p-3 rounded-2xl border transition-all duration-300 relative flex flex-col items-center justify-center min-h-[54px] ${
                    isPastDate
                      ? 'border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed'
                      : isSelected
                        ? isFullyBlocked
                          ? 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer'
                          : 'border-[#A6FF00] bg-gradient-to-b from-[#A6FF00]/20 to-transparent shadow-[0_0_15px_rgba(166,255,0,0.25)] cursor-pointer'
                        : isFullyBlocked
                          ? 'border-red-500/40 bg-red-500/10 hover:border-red-500/70 hover:bg-red-500/20 cursor-pointer'
                          : hasPartialBlock
                            ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 cursor-pointer'
                            : 'border-[#2A2A3A] bg-[#0A0A0F] hover:border-[#3A3A4A] cursor-pointer'
                  }`}
                  title={
                    isFullyBlocked 
                      ? `Dia bloqueado pelo médico: ${blockedInfo?.reason || 'Indisponível'}` 
                      : hasPartialBlock 
                        ? 'Alguns horários estão bloqueados' 
                        : undefined
                  }
                >
                  <span className={`block text-lg font-bold leading-none ${
                    isPastDate 
                      ? 'text-white/20' 
                      : isSelected 
                        ? isFullyBlocked ? 'text-red-400' : 'text-[#C9FF5C]' 
                        : isFullyBlocked 
                          ? 'text-red-400' 
                          : 'text-mecura-pearl'
                  }`}>
                    {day}
                  </span>

                  {isFullyBlocked && !isPastDate && (
                    <div className="absolute top-1 right-1 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-red-400" />
                    </div>
                  )}

                  {hasPartialBlock && !isFullyBlocked && !isPastDate && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Warning or 24h Available Times */}
        <div className="bg-[#1A1A24] rounded-3xl p-6 mb-8 border border-[#2A2A3A] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-mecura-pearl flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#A6FF00]" />
                Horários 24h Disponíveis {selectedDate && `(${format(selectedDate, "dd/MM/yyyy")})`}
              </h3>
              <p className="text-xs text-[#8A8A9E] mt-0.5">Selecione o turno ou horário de sua preferência</p>
            </div>
            {isSelectedDateFullyBlocked && (
              <span className="self-start sm:self-center inline-flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" /> Dia Inteiro Bloqueado
              </span>
            )}
          </div>

          {!selectedDate ? (
            <div className="text-center py-8 text-[#8A8A9E] text-sm">
              Selecione uma data acima para visualizar os horários de atendimento 24 horas.
            </div>
          ) : isSelectedDateFullyBlocked ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-red-400">Data Indisponível na Agenda do Médico</h4>
              <p className="text-xs text-[#A0A0B5] max-w-sm mx-auto leading-relaxed">
                O médico bloqueou este dia ({selectedDayBlockedInfo?.reason || 'Folga / Compromisso'}). Por favor, selecione outro dia no calendário para seu agendamento.
              </p>
            </div>
          ) : (
            <div>
              {/* Period Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 custom-scrollbar">
                {TIME_PERIODS.map(period => (
                  <button
                    key={period.id}
                    type="button"
                    onClick={() => setSelectedPeriod(period.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedPeriod === period.id
                        ? 'bg-[#A6FF00] text-black shadow-[0_0_12px_rgba(166,255,0,0.3)]'
                        : 'bg-[#0A0A0F] text-mecura-silver border border-[#2A2A3A] hover:border-white/20'
                    }`}
                  >
                    {period.id === 'madrugada' && <Moon className="w-3.5 h-3.5" />}
                    {period.id === 'manha' && <Sunrise className="w-3.5 h-3.5" />}
                    {period.id === 'tarde' && <Sun className="w-3.5 h-3.5" />}
                    {period.id === 'noite' && <Sunset className="w-3.5 h-3.5" />}
                    {period.id === 'all' && <Sparkles className="w-3.5 h-3.5" />}
                    <span>{period.label}</span>
                  </button>
                ))}
              </div>

              {/* Grid of 24h Slots */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {displayedSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  const isOccupied = getOccupiedTimes(selectedDate).includes(time);
                  const isTimeBlocked = getBlockedTimes(selectedDate).includes(time);
                  
                  // If selected date is today, disable past time slots
                  const isPastTime = selectedDate && isSameDay(selectedDate, today) ? (() => {
                    const [h, m] = time.split(':').map(Number);
                    const slotDate = new Date(today);
                    slotDate.setHours(h, m, 0, 0);
                    return slotDate <= new Date();
                  })() : false;

                  const isDisabled = isOccupied || isTimeBlocked || isPastTime;
                  
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => !isDisabled && setSelectedTime(time)}
                      disabled={isDisabled}
                      className={`p-3 rounded-2xl border transition-all duration-200 relative flex flex-col items-center justify-center ${
                        isSelected 
                          ? 'border-[#A6FF00] bg-gradient-to-b from-[#A6FF00]/20 to-transparent shadow-[0_0_15px_rgba(166,255,0,0.25)]' 
                          : isTimeBlocked
                            ? 'border-red-500/25 bg-red-500/5 opacity-40 cursor-not-allowed'
                            : isOccupied
                              ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                              : isPastTime
                                ? 'border-white/5 bg-white/[0.01] opacity-30 cursor-not-allowed'
                                : 'border-[#2A2A3A] bg-[#0A0A0F] hover:border-[#A6FF00]/50 hover:bg-[#12121A] cursor-pointer'
                      }`}
                    >
                      <span className={`text-sm font-bold font-mono ${
                        isSelected 
                          ? 'text-[#C9FF5C]' 
                          : isTimeBlocked 
                            ? 'text-red-400/70' 
                            : (isOccupied || isPastTime)
                              ? 'text-mecura-silver/40' 
                              : 'text-mecura-pearl'
                      }`}>
                        {time}
                      </span>

                      {isTimeBlocked && (
                        <span className="block text-[9px] text-red-400 uppercase font-bold mt-0.5">
                          Bloqueado
                        </span>
                      )}

                      {isOccupied && !isTimeBlocked && (
                        <span className="block text-[9px] text-mecura-silver/60 uppercase font-bold mt-0.5">
                          Ocupado
                        </span>
                      )}

                      {isPastTime && !isTimeBlocked && !isOccupied && (
                        <span className="block text-[8px] text-mecura-silver/40 uppercase font-medium mt-0.5">
                          Passado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent z-10">
        <Button 
          className="w-full h-16 text-lg font-bold tracking-wide cursor-pointer" 
          variant="premium"
          onClick={handleSchedule}
          disabled={!selectedDate || !selectedTime || isSelectedDateFullyBlocked}
        >
          {isSelectedDateFullyBlocked ? 'Data Bloqueada - Escolha Outro Dia' : selectedTime ? `Confirmar Agendamento (${selectedTime})` : 'Escolha um Horário'}
        </Button>
      </div>
    </div>
  );
}


