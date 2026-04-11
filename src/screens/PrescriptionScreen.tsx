import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FileText, Download, ShoppingBag, Star, ShieldCheck } from 'lucide-react';

export function PrescriptionScreen() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-mecura-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-8 h-8 text-mecura-green" />
        </div>
        <h1 className="text-2xl font-serif font-semibold text-white mb-2">
          Consulta Finalizada
        </h1>
        <p className="text-gray-400 text-sm">
          Sua prescrição médica foi gerada com sucesso.
        </p>
      </div>

      <Card className="mb-8 border-mecura-gold/20 bg-gradient-to-br from-mecura-surface to-mecura-surface-light">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-mecura-gold/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-mecura-gold" />
          </div>
          <div>
            <h3 className="text-white font-medium">Receita Médica</h3>
            <p className="text-xs text-gray-400">Válida por 6 meses</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleDownload}
          isLoading={isDownloading}
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar PDF
        </Button>
      </Card>

      <div className="mb-4">
        <h2 className="text-lg font-medium text-white mb-1">Recomendação do Médico</h2>
        <p className="text-sm text-gray-400">Produtos prescritos para o seu tratamento</p>
      </div>

      <Card className="p-0 overflow-hidden border-white/5">
        <div className="h-32 bg-gray-800 relative">
          <img 
            src="https://picsum.photos/seed/cbd/400/200" 
            alt="CBD Oil" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3 text-mecura-gold fill-mecura-gold" />
            <span className="text-xs text-white font-medium">Premium</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-white font-medium text-lg mb-1">Óleo CBD Full Spectrum 3000mg</h3>
          <p className="text-sm text-gray-400 mb-4">Frasco 30ml • Importação Legal</p>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-semibold text-mecura-gold">R$ 450,00</span>
            <span className="text-xs text-mecura-green bg-mecura-green/10 px-2 py-1 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> ANVISA
            </span>
          </div>

          <Button className="w-full">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Comprar Agora
          </Button>
        </div>
      </Card>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
