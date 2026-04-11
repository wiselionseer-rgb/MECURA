import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { ChevronLeft, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export function SchedulingScreen() {
  const navigate = useNavigate();
  const { setScheduledConsultation, pagamento_premium, addAppointment, setConsultationStatus, allAppointments, userName } = useStore();
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

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
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
          className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center text-mecura-silver hover:bg-[#2A2A3A] transition-colors border border-[#2A2A3A]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center pr-10">
          <h1 className="text-2xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">mecura</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40">
        <h2 className="text-3xl font-bold text-center leading-tight mb-8 text-mecura-pearl">
          Escolha o melhor horário<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">para sua consulta</span>
        </h2>

        <div className="bg-[#1A1A24] rounded-3xl p-6 mb-8 border border-[#2A2A3A] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-mecura-pearl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-full bg-[#2A2A3A] hover:bg-[#3A3A4A] transition-colors"><ChevronLeft className="w-4 h-4 text-[#D4AF37]" /></button>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full bg-[#2A2A3A] hover:bg-[#3A3A4A] transition-colors"><ChevronRight className="w-4 h-4 text-[#D4AF37]" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-mecura-silver mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded-2xl border transition-all duration-300 ${
                    isSelected ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/20 to-transparent shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-[#2A2A3A] bg-[#0A0A0F] hover:border-[#3A3A4A]'
                  }`}
                >
                  <span className={`block text-lg font-bold ${isSelected ? 'text-[#F3E5AB]' : 'text-mecura-pearl'}`}>{day}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[#1A1A24] rounded-3xl p-6 mb-8 border border-[#2A2A3A] shadow-xl">
          <h3 className="text-lg font-bold mb-6 text-mecura-pearl">Horários disponíveis</h3>
          <div className="grid grid-cols-3 gap-3">
            {allPossibleTimes.map((time) => {
              const isSelected = selectedTime === time;
              const isOccupied = selectedDate ? getOccupiedTimes(selectedDate).includes(time) : false;
              
              return (
                <button
                  key={time}
                  onClick={() => !isOccupied && setSelectedTime(time)}
                  disabled={isOccupied}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    isSelected 
                      ? 'border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/20 to-transparent shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                      : isOccupied
                        ? 'border-red-500/20 bg-red-500/5 opacity-40 cursor-not-allowed'
                        : 'border-[#2A2A3A] bg-[#0A0A0F] hover:border-[#3A3A4A]'
                  }`}
                >
                  <span className={`text-lg font-bold ${isSelected ? 'text-[#F3E5AB]' : isOccupied ? 'text-red-500/50' : 'text-mecura-pearl'}`}>{time}</span>
                  {isOccupied && <span className="block text-[10px] text-red-500/50 uppercase font-bold mt-1">Ocupado</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent z-10">
        <Button 
          className="w-full h-16 text-lg font-bold tracking-wide" 
          variant="premium"
          onClick={handleSchedule}
          disabled={!selectedDate || !selectedTime}
        >
          Confirmar Agendamento
        </Button>
      </div>
    </div>
  );
}
