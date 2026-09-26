import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { ChevronLeft, Calendar, ChevronRight, Lock, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';
import { format, isPast, isSameDay } from 'date-fns';

export function SchedulingScreen() {
  const navigate = useNavigate();
  const { setScheduledConsultation, pagamento_premium, addAppointment, setConsultationStatus, allAppointments, blockedDates, userName } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (!pagamento_premium) {
      navigate('/premium-checkout');
    }
  }, [pagamento_premium, navigate]);

  // Mock available times (25 min intervals)
  const allPossibleTimes = [
    '09:00', '09:25', '09:50', '10:15', '10:40', '11:05', '11:30',
    '14:00', '14:25', '14:50', '15:15', '15:40', '16:05', '16:30'
  ];

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
    if (blockedItem.fullDay) return allPossibleTimes;
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

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
        <h2 className="text-3xl font-bold text-center leading-tight mb-8 text-mecura-pearl">
          Escolha o melhor horário<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A6FF00] to-[#C9FF5C]">para sua consulta</span>
        </h2>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#8A8A9E] mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#A6FF00]" />
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Bloqueado pelo Médico</span>
          </div>
        </div>

        <div className="bg-[#1A1A24] rounded-3xl p-6 mb-8 border border-[#2A2A3A] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-mecura-pearl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#A6FF00]" />
              {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-full bg-[#2A2A3A] hover:bg-[#3A3A4A] transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4 text-[#A6FF00]" /></button>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full bg-[#2A2A3A] hover:bg-[#3A3A4A] transition-colors cursor-pointer"><ChevronRight className="w-4 h-4 text-[#A6FF00]" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-mecura-silver mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dateStr = format(date, 'yyyy-MM-dd');
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
              const blockedInfo = blockedDates.find(b => b.date === dateStr);
              const isFullyBlocked = blockedInfo?.fullDay ?? false;
              const hasPartialBlock = !!blockedInfo && !blockedInfo.fullDay && (blockedInfo.times?.length || 0) > 0;
              const isPastDate = isPast(date) && !isSameDay(date, new Date());

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

        {/* Selected Date Warning or Available Times */}
        <div className="bg-[#1A1A24] rounded-3xl p-6 mb-8 border border-[#2A2A3A] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-mecura-pearl">
              Horários disponíveis {selectedDate && `(${format(selectedDate, "dd 'de' MMMM", { locale: (window as any).__ptBR || undefined })})`}
            </h3>
            {isSelectedDateFullyBlocked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" /> Dia Bloqueado
              </span>
            )}
          </div>

          {!selectedDate ? (
            <div className="text-center py-8 text-[#8A8A9E] text-sm">
              Selecione uma data acima para visualizar os horários de atendimento.
            </div>
          ) : isSelectedDateFullyBlocked ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-red-400">Data Indisponível na Agenda do Médico</h4>
              <p className="text-xs text-[#A0A0B5] max-w-sm mx-auto leading-relaxed">
                O médico trancou esta data ({selectedDayBlockedInfo?.reason || 'Folga / Compromisso'}). Por favor, selecione outro dia no calendário para seu agendamento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {allPossibleTimes.map((time) => {
                const isSelected = selectedTime === time;
                const isOccupied = getOccupiedTimes(selectedDate).includes(time);
                const isTimeBlocked = getBlockedTimes(selectedDate).includes(time);
                const isDisabled = isOccupied || isTimeBlocked;
                
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => !isDisabled && setSelectedTime(time)}
                    disabled={isDisabled}
                    className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                      isSelected 
                        ? 'border-[#A6FF00] bg-gradient-to-b from-[#A6FF00]/20 to-transparent shadow-[0_0_15px_rgba(166,255,0,0.25)]' 
                        : isTimeBlocked
                          ? 'border-red-500/25 bg-red-500/5 opacity-40 cursor-not-allowed'
                          : isOccupied
                            ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                            : 'border-[#2A2A3A] bg-[#0A0A0F] hover:border-[#3A3A4A] cursor-pointer'
                    }`}
                  >
                    <span className={`text-base font-bold ${
                      isSelected 
                        ? 'text-[#C9FF5C]' 
                        : isTimeBlocked 
                          ? 'text-red-400/70' 
                          : isOccupied 
                            ? 'text-mecura-silver/50' 
                            : 'text-mecura-pearl'
                    }`}>
                      {time}
                    </span>

                    {isTimeBlocked && (
                      <span className="block text-[10px] text-red-400 uppercase font-bold mt-1 flex items-center justify-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Bloqueado
                      </span>
                    )}

                    {isOccupied && !isTimeBlocked && (
                      <span className="block text-[10px] text-mecura-silver/60 uppercase font-bold mt-1">
                        Ocupado
                      </span>
                    )}
                  </button>
                );
              })}
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
          {isSelectedDateFullyBlocked ? 'Data Bloqueada - Escolha Outro Dia' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </div>
  );
}

