import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, Car, Wine, Baby, Pill, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function AlertsScreen() {
  const navigate = useNavigate();

  const alerts = [
    {
      icon: Pill,
      title: 'Não substitui tratamentos',
      desc: 'Pacientes apresentam melhoras, mas a cannabis é um complemento. Não substitua tratamentos atuais sem orientação médica.',
      color: 'text-mecura-neon',
      bg: 'bg-mecura-neon/10',
      border: 'border-mecura-neon/30'
    },
    {
      icon: Car,
      title: 'Atenção ao dirigir',
      desc: 'Não dirija ou opere máquinas pesadas após consumir produtos com cannabis. Eles podem provocar sonolência.',
      color: 'text-mecura-neon',
      bg: 'bg-mecura-neon/10',
      border: 'border-mecura-neon/30'
    },
    {
      icon: Wine,
      title: 'Evite álcool',
      desc: 'Não combine com álcool ou outros medicamentos sem orientação. Use com responsabilidade.',
      color: 'text-[#FF8A8A]',
      bg: 'bg-[#FF8A8A]/10',
      border: 'border-[#FF8A8A]/30'
    },
    {
      icon: ShieldAlert,
      title: 'Testes toxicológicos',
      desc: 'O consumo pode resultar em reprovação em testes de drogas para maconha, com exceção de produtos com selo NSF.',
      color: 'text-[#8A8AFF]',
      bg: 'bg-[#8A8AFF]/10',
      border: 'border-[#8A8AFF]/30'
    },
    {
      icon: Baby,
      title: 'Gestantes e lactantes',
      desc: 'Não use cannabis medicinal se estiver grávida, amamentando ou tentando engravidar.',
      color: 'text-[#FF8A8A]',
      bg: 'bg-[#FF8A8A]/10',
      border: 'border-[#FF8A8A]/30'
    }
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative overflow-y-auto pb-24 font-sans">
      <header className="flex items-center p-6 pt-8 border-b border-[#1A1A26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-white hover:bg-[#1A1A26] transition-colors"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-white mr-10">Alertas de Uso</h1>
      </header>

      <div className="p-6 space-y-4">
        <div 
          className="flex items-center justify-center gap-3 mb-8"
        >
          <AlertTriangle className="w-8 h-8 text-mecura-neon" />
          <h2 className="text-2xl font-bold text-white">Avisos Importantes</h2>
        </div>

        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <div 
              key={index}
              className={`bg-[#161622] border ${alert.border} rounded-2xl p-5 flex items-start gap-4 shadow-lg`}
            >
              <div className={`w-12 h-12 rounded-xl ${alert.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${alert.color}`} />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1.5">{alert.title}</h3>
                <p className="text-[#8A8A9E] text-sm leading-relaxed">{alert.desc}</p>
              </div>
            </div>
          );
        })}

        <div 
          className="mt-8 p-5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-center"
        >
          <h3 className="text-[#FF3B30] font-black tracking-widest uppercase text-sm mb-2">Atenção</h3>
          <p className="text-white font-bold">MANTENHA FORA DO ALCANCE DE CRIANÇAS.</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent z-30">
        <Button 
          className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.2)]"
          onClick={() => navigate(-1)}
        >
          Ciente
        </Button>
      </div>
    </div>
  );
}
