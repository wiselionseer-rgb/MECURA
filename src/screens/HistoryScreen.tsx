import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, MessageCircle, Receipt, X, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';

export function HistoryScreen() {
  const navigate = useNavigate();
  const { userName, messages } = useStore();
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Como devo armazenar meu medicamento?",
      answer: "O medicamento deve ser armazenado em local fresco e seco, longe da luz solar direta. Mantenha o frasco bem fechado e fora do alcance de crianças."
    },
    {
      question: "O que fazer se eu esquecer uma dose?",
      answer: "Se você esquecer uma dose, tome assim que lembrar. No entanto, se estiver quase na hora da próxima dose, pule a dose esquecida e retome o esquema regular. Não tome uma dose dupla para compensar a esquecida."
    },
    {
      question: "Posso misturar com outros medicamentos?",
      answer: "Sempre consulte seu médico antes de iniciar qualquer novo medicamento, suplemento ou tratamento enquanto estiver usando este produto, para evitar interações indesejadas."
    },
    {
      question: "Quais são os possíveis efeitos colaterais?",
      answer: "Os efeitos colaterais mais comuns incluem sonolência leve, boca seca e alterações no apetite. Se você experimentar qualquer efeito adverso grave, suspenda o uso e entre em contato com o médico."
    },
    {
      question: "Em quanto tempo sentirei os efeitos?",
      answer: "O tempo para sentir os efeitos pode variar de pessoa para pessoa. Algumas pessoas relatam alívio em poucos dias, enquanto outras podem precisar de algumas semanas de uso contínuo para notar os benefícios completos."
    }
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#0A0A0F] text-mecura-pearl relative overflow-y-auto pb-12 font-sans">
      {/* Header */}
      <header className="flex items-center p-6 pt-8 border-b border-[#1A1A26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center text-white hover:bg-[#1A1A26] transition-colors"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-white mr-10">Histórico de Consultas</h1>
      </header>

      <div className="p-6">
        <div 
          className="bg-gradient-to-b from-[#161622] to-[#1A1A26] border border-[#262636] rounded-[32px] p-8 flex flex-col items-center shadow-2xl relative overflow-hidden"
        >
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-mecura-neon/10 blur-[50px] rounded-full pointer-events-none" />

          {/* Doctor Image */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-[#1F1F2E] overflow-hidden border-4 border-[#262636] shadow-xl relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop" 
                alt="Dr. Guilherme" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-mecura-neon rounded-full border-4 border-[#161622] flex items-center justify-center z-20">
              <div className="w-2.5 h-2.5 bg-[#0A0A0F] rounded-full" />
            </div>
          </div>

          {/* Doctor Info */}
          <h2 className="text-2xl font-bold text-white text-center leading-tight mb-2">
            Dr. Guilherme<br/>Taveira Dias
          </h2>
          <p className="text-[#8A8A9E] text-sm font-medium mb-8">CRM 12345/SP</p>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#262636] to-transparent mb-8" />

          {/* Consultation Info */}
          <div className="text-center mb-10">
            <h3 className="text-white font-bold text-lg mb-2">1 de Abril de 2026</h3>
            <div className="inline-flex items-center gap-2 bg-[#1A2E1A] border border-[#2A4A2A] px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-mecura-neon shadow-[0_0_8px_rgba(166,255,0,0.8)]" />
              <span className="text-xs font-bold text-mecura-neon uppercase tracking-wider">Consulta finalizada com sucesso</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-4">
            <button 
              onClick={() => generatePrescriptionPDF(userName, messages)}
              className="w-full bg-mecura-neon hover:bg-[#b5ff33] text-[#0A0A0F] font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(166,255,0,0.2)]"
            >
              <FileText className="w-5 h-5" />
              Abrir Receita
            </button>
            
            <button 
              onClick={() => setShowFaqModal(true)}
              className="w-full bg-[#8A8AFF]/10 hover:bg-[#8A8AFF]/20 border border-[#8A8AFF]/30 text-[#8A8AFF] font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Dúvidas Sobre o Tratamento
            </button>
            
            <button 
              onClick={() => setShowReceiptModal(true)}
              className="w-full bg-mecura-green/10 hover:bg-mecura-green/20 border border-mecura-green/30 text-mecura-green font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
            >
              <Receipt className="w-5 h-5" />
              Abrir Nota Fiscal
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Modal */}
      {showFaqModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
        >
          <div 
            className="bg-[#161622] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#262636] overflow-hidden flex flex-col max-h-[85vh]"
          >
              <div className="p-6 border-b border-[#262636] flex items-center justify-between sticky top-0 bg-[#161622] z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8A8AFF]/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#8A8AFF]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Dúvidas Frequentes</h3>
                </div>
                <button 
                  onClick={() => setShowFaqModal(false)}
                  className="w-8 h-8 rounded-full bg-[#1A1A26] flex items-center justify-center text-[#8A8A9E] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <p className="text-[#8A8A9E] text-sm mb-6">
                  Separamos as principais dúvidas sobre o seu tratamento. Caso precise de mais ajuda, entre em contato com o suporte.
                </p>
                
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div 
                      key={index} 
                      className="border border-[#262636] rounded-xl overflow-hidden bg-[#1A1A26]/50"
                    >
                      <button 
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="font-medium text-white text-sm pr-4">{faq.question}</span>
                        <ChevronDown className={`w-5 h-5 text-[#8A8A9E] transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {expandedFaq === index && (
                        <div 
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-sm text-[#8A8A9E] leading-relaxed border-t border-[#262636]/50 mt-2">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
        >
          <div 
            className="bg-[#161622] w-full max-w-sm rounded-3xl border border-[#262636] overflow-hidden flex flex-col"
          >
              <div className="p-6 border-b border-[#262636] flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Nota Fiscal</h3>
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="w-8 h-8 rounded-full bg-[#1A1A26] flex items-center justify-center text-[#8A8A9E] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-mecura-green/10 flex items-center justify-center border border-mecura-green/30">
                    <Receipt className="w-8 h-8 text-mecura-green" />
                  </div>
                </div>
                
                <h4 className="text-center text-white font-bold text-xl mb-1">Recibo de Pagamento</h4>
                <p className="text-center text-[#8A8A9E] text-sm mb-8">Transação #TRX-982374</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-[#262636] border-dashed">
                    <span className="text-[#8A8A9E] text-sm">Data</span>
                    <span className="text-white font-medium text-sm">01/04/2026 14:32</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-[#262636] border-dashed">
                    <span className="text-[#8A8A9E] text-sm">Serviço</span>
                    <span className="text-white font-medium text-sm text-right">Consulta Médica<br/>Especializada</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-[#262636] border-dashed">
                    <span className="text-[#8A8A9E] text-sm">Médico</span>
                    <span className="text-white font-medium text-sm">Dr. Guilherme Taveira</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-[#262636] border-dashed">
                    <span className="text-[#8A8A9E] text-sm">Método</span>
                    <span className="text-white font-medium text-sm">PIX</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-mecura-neon font-bold text-xl">R$ 149,90</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full bg-[#1A1A26] hover:bg-[#262636] text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
