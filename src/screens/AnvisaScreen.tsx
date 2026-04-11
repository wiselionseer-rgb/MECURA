import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, FileCheck, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function AnvisaScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative overflow-y-auto pb-24 font-sans">
      <header className="flex items-center p-6 pt-8 border-b border-[#1A1A26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-white hover:bg-[#1A1A26] transition-colors"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-white mr-10">Autorização Anvisa</h1>
      </header>

      <div className="p-6 space-y-6">
        <div 
          className="bg-gradient-to-b from-[#161622] to-[#1A1A26] border border-mecura-neon/30 rounded-[32px] p-8 flex flex-col items-center text-center shadow-[0_0_30px_rgba(166,255,0,0.05)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-mecura-neon/10 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="w-20 h-20 rounded-full bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/30 mb-6 relative z-10">
            <ShieldCheck className="w-10 h-10 text-mecura-neon" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4 relative z-10">Processo Regulatório</h2>
          <p className="text-[#8A8A9E] leading-relaxed relative z-10">
            Para importar medicamentos à base de Cannabis, é obrigatória a autorização da ANVISA. Nós cuidamos de tudo para você.
          </p>
        </div>

        <div 
          className="space-y-4"
        >
          <div className="bg-[#161622] border border-[#262636] rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1F1F2E] flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5 text-mecura-neon" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">Envio de Documentos</h3>
              <p className="text-[#8A8A9E] text-sm">Após a compra, você enviará seu RG/CNH e comprovante de residência pelo app.</p>
            </div>
          </div>

          <div className="bg-[#161622] border border-[#262636] rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1F1F2E] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-mecura-neon" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">Prazo de Aprovação</h3>
              <p className="text-[#8A8A9E] text-sm">Nossa equipe executará a solicitação e a ANVISA costuma aprovar em até 3 dias úteis.</p>
            </div>
          </div>

          <div className="bg-[#1A2E1A]/20 border border-[#2A4A2A] rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-mecura-neon flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-bold mb-1">Avisos Automáticos</h3>
              <p className="text-[#8A8A9E] text-sm">Assim que a autorização for emitida, você receberá um alerta e o envio internacional será liberado.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent z-30">
        <Button 
          className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.2)]"
          onClick={() => navigate(-1)}
        >
          Entendi
        </Button>
      </div>
    </div>
  );
}
