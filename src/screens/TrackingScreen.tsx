import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, CheckCircle2, Plane, Truck, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function TrackingScreen() {
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Pedido Confirmado', date: '01 Abr, 10:30', icon: CheckCircle2, status: 'completed' },
    { id: 2, title: 'Autorização Anvisa', date: '02 Abr, 14:15', icon: FileCheck, status: 'completed' },
    { id: 3, title: 'Em trânsito internacional', date: '04 Abr, 08:00', icon: Plane, status: 'current' },
    { id: 4, title: 'Fiscalização Aduaneira', date: 'Pendente', icon: ShieldCheck, status: 'upcoming' },
    { id: 5, title: 'Em rota de entrega', date: 'Pendente', icon: Truck, status: 'upcoming' },
    { id: 6, title: 'Entregue', date: 'Pendente', icon: MapPin, status: 'upcoming' },
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
        <h1 className="flex-1 text-center text-lg font-bold text-white mr-10">Rastreio</h1>
      </header>

      <div className="p-6">
        <div 
          className="bg-gradient-to-br from-[#161622] to-[#1A1A26] border border-[#262636] rounded-[24px] p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20">
              <Package className="w-6 h-6 text-mecura-neon" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Pedido #MC-8472</h2>
              <p className="text-[#8A8A9E] text-sm">Previsão: 15 a 20 dias úteis</p>
            </div>
          </div>
          <div className="w-full bg-[#0A0A0F] rounded-lg p-3 border border-[#262636] flex justify-between items-center">
            <span className="text-[#8A8A9E] text-sm">Código:</span>
            <span className="text-white font-mono font-bold tracking-wider">LX987654321US</span>
          </div>
        </div>

        <div className="relative pl-6">
          {/* Vertical Line */}
          <div className="absolute left-[39px] top-4 bottom-8 w-0.5 bg-[#262636]" />
          
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              
              return (
                <div 
                  key={step.id}
                  className="flex gap-6 relative z-10"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                    isCompleted ? 'bg-mecura-neon border-mecura-neon text-[#0A0A0F]' :
                    isCurrent ? 'bg-[#0A0A0F] border-mecura-neon text-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.4)]' :
                    'bg-[#161622] border-[#262636] text-[#6A6A7E]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="pt-2">
                    <h3 className={`font-bold ${isCurrent ? 'text-mecura-neon' : isCompleted ? 'text-white' : 'text-[#6A6A7E]'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#8A8A9E] mt-1">{step.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent z-30">
        <Button className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.2)]">
          Acessar Transportadora
        </Button>
      </div>
    </div>
  );
}

// Helper icons for the array above
function FileCheck(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>;
}
function ShieldCheck(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
}
