import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, FileText, CheckCircle2, QrCode } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';

export function PrescriptionViewScreen() {
  const navigate = useNavigate();
  const { userName, userCpf, messages } = useStore();

  const prescriptionItems = messages
    .filter(msg => msg.type === 'product' && msg.productData)
    .map(msg => msg.productData!);

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative overflow-y-auto pb-24 font-sans">
      <header className="flex items-center p-6 pt-8 border-b border-[#1A1A26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-white hover:bg-[#1A1A26] transition-colors"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-white mr-10">Sua Receita</h1>
      </header>

      <div className="p-6">
        <div 
          className="bg-[#F4F4F5] rounded-[24px] p-8 shadow-2xl relative overflow-hidden text-[#18181B]"
        >
          {/* Header of the prescription */}
          <div className="flex justify-between items-start mb-8 border-b border-[#E4E4E7] pb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#18181B] tracking-tight">RECEITUÁRIO<br/>MÉDICO</h2>
              <p className="text-[#71717A] text-sm mt-2">Válido em todo território nacional</p>
            </div>
            <div className="w-16 h-16 bg-[#E4E4E7] rounded-xl flex items-center justify-center">
              <QrCode className="w-8 h-8 text-[#A1A1AA]" />
            </div>
          </div>

          {/* Patient Info */}
          <div className="mb-8">
            <p className="text-sm text-[#71717A] uppercase tracking-wider font-bold mb-1">Paciente</p>
            <p className="text-lg font-bold text-[#18181B]">{userName || 'Paciente'}</p>
            <p className="text-[#71717A]">CPF: {userCpf || 'Não informado'}</p>
          </div>

          {/* Prescription Items */}
          <div className="space-y-6 mb-12">
            {prescriptionItems.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#18181B] pr-4">{item.name}</h3>
                  <span className="bg-[#18181B] text-white text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap">1 unidade</span>
                </div>
                <p className="text-[#52525B] text-sm leading-relaxed">
                  {item.details[0] || 'Uso conforme recomendação médica.'}
                </p>
              </div>
            ))}
          </div>

          {/* Doctor Signature */}
          <div className="flex justify-between items-end pt-6 border-t border-[#E4E4E7]">
            <div>
              <p className="font-bold text-[#18181B]">Dr. Guilherme Taveira Dias</p>
              <p className="text-[#71717A] text-sm">CRM: 12345/SP</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-mecura-green mb-1" />
              <span className="text-[10px] font-bold text-mecura-green uppercase tracking-wider">Assinado Digitalmente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent z-30">
        <Button className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.2)] flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Baixar Receita em PDF
        </Button>
      </div>
    </div>
  );
}
