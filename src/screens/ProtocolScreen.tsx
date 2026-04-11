import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Droplets, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export function ProtocolScreen() {
  const navigate = useNavigate();
  const { messages } = useStore();

  const prescriptionItems = messages
    .filter(msg => msg.type === 'product' && msg.productData)
    .map(msg => msg.productData!);

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative overflow-y-auto pb-12 font-sans">
      <header className="flex items-center p-6 pt-8 border-b border-[#1A1A26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-white hover:bg-[#1A1A26] transition-colors"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-white mr-10">Meu Protocolo</h1>
      </header>

      <div className="p-6 space-y-6">
        {prescriptionItems.map((item, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-[#161622] to-[#1A1A26] border border-[#262636] rounded-[24px] p-6 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20">
                <Droplets className="w-6 h-6 text-mecura-neon" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{item.name}</h2>
                <p className="text-[#8A8A9E] text-sm">Uso contínuo</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0A0A0F] rounded-xl p-4 border border-[#262636] flex items-center gap-4">
                <Clock className="w-5 h-5 text-mecura-neon" />
                <div>
                  <p className="text-white font-bold">Instruções de Uso</p>
                  <p className="text-[#8A8A9E] text-sm">{item.details[0] || 'Seguir recomendação médica'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div 
          className="bg-[#1A2E1A]/20 border border-[#2A4A2A] rounded-[24px] p-6 flex items-start gap-4"
        >
          <AlertCircle className="w-6 h-6 text-mecura-neon flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-bold mb-2">Recomendações do Médico</h3>
            <p className="text-[#8A8A9E] text-sm leading-relaxed">Pingar as gotas debaixo da língua e aguardar 1 minuto antes de engolir. Evitar comer ou beber nos próximos 15 minutos para melhor absorção.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
