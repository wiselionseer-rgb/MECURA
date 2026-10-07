import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Download, FileText, CheckCircle2, QrCode, User, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';
import { deliverPdfBlob } from '../utils/downloadHelper';

export function PrescriptionViewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, userCpf, userBirthDate, answers, messages } = useStore();

  const hasPrescriptionAttached = messages.some(m => 
    m.type === 'prescription' || 
    m.docType === 'receita' || 
    m.type === 'receita_previa' || 
    (m.type === 'product' && m.productData) ||
    (m.attachment && (m.attachment.docType === 'receita' || m.attachment.name?.toLowerCase().includes('receita')))
  );

  const prescriptionItems = messages
    .filter(msg => msg.type === 'product' && msg.productData)
    .map(msg => msg.productData!);

  const displayBirthDate = userBirthDate || answers?.birthDate || 'Não informada';
  const displayCpf = userCpf || answers?.cpf || 'Não informado';

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative overflow-y-auto pb-24 font-sans">
      <header className="flex items-center justify-between p-5 pt-7 border-b border-[#1A1A26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => {
            if (location.state?.fromHighlights || sessionStorage.getItem('mecura_return_to_highlights') === 'true') {
              sessionStorage.removeItem('mecura_return_to_highlights');
              navigate('/dashboard', { state: { fromHighlights: true }, replace: true });
            } else {
              navigate(-1);
            }
          }}
          className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-white hover:bg-[#1A1A26] transition-colors"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <h1 className="text-center text-base sm:text-lg font-bold text-white">Sua Receita</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full bg-[#161622] border border-mecura-neon/30 flex items-center justify-center text-mecura-neon hover:bg-mecura-neon/10 transition-colors"
          title="Acessar Área do Paciente"
        >
          <User className="w-4 h-4" />
        </button>
      </header>

      <div className="p-6">
        {!hasPrescriptionAttached ? (
          <div className="bg-[#12121A] border border-white/5 rounded-[24px] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-white font-bold text-lg">Receita Médica Pendente</h3>
            <p className="text-sm text-[#8A8A9E] max-w-md mx-auto leading-relaxed">
              A sua receita médica digital com posologia e assinatura eletrônica ainda não foi anexada pelo médico nesta consulta.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button onClick={() => navigate('/chat')} className="font-bold">
                Ir para Sala de Atendimento
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Voltar ao Painel
              </Button>
            </div>
          </div>
        ) : (
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
              <p className="text-xs text-[#71717A] uppercase tracking-wider font-bold mb-1">Paciente</p>
              <p className="text-lg font-bold text-[#18181B]">{userName || 'Paciente'}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#71717A] mt-1.5">
                <p><span className="font-semibold text-[#52525B]">Data de Nasc.:</span> {displayBirthDate}</p>
                <p><span className="font-semibold text-[#52525B]">CPF:</span> {displayCpf}</p>
              </div>
            </div>

            {/* Prescription Items */}
            <div className="space-y-6 mb-12">
              {prescriptionItems.length > 0 ? (
                prescriptionItems.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-[#18181B] pr-4">{item.name}</h3>
                      <span className="bg-[#18181B] text-white text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap">1 unidade</span>
                    </div>
                    <p className="text-[#52525B] text-sm leading-relaxed">
                      {item.details[0] || 'Uso conforme recomendação médica.'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-white p-4 rounded-xl border border-[#E4E4E7] shadow-sm text-sm text-[#71717A]">
                  Prescrição anexada pelo médico. Baixe o documento oficial assinado em PDF abaixo.
                </div>
              )}
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
        )}
      </div>

      {hasPrescriptionAttached && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent z-30">
          <Button 
            className="w-full h-14 text-lg font-bold shadow-[0_0_30px_rgba(166,255,0,0.2)] flex items-center justify-center gap-2 cursor-pointer"
            onClick={async () => {
              const blob = await generatePrescriptionPDF(userName || 'Paciente', messages, {
                birthDate: userBirthDate || answers?.birthDate,
                cpf: userCpf || answers?.cpf,
                returnBlob: true
              });
              if (blob instanceof Blob) {
                await deliverPdfBlob(blob, `Receita_${(userName || 'Paciente').replace(/\s+/g, '_')}.pdf`);
              }
            }}
          >
            <Download className="w-5 h-5" />
            Baixar Receita em PDF
          </Button>
        </div>
      )}
    </div>
  );
}
