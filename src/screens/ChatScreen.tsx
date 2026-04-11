import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore, Message } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Send, FileText, CheckCheck, Download, ChevronLeft, ShoppingCart, User, Eye, PlusCircle, CheckCircle, Droplets, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';

export function ChatScreen() {
  const navigate = useNavigate();
  const { userName, answers, endConsultation, messages, addMessage, setMessages, consultationActive, resetConsultation, setSelectedOffer, exchangeRate, activeConsultationId, subscribeToMessages } = useStore();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStage, setChatStage] = useState<'initial' | 'prescribing' | 'finished'>('initial');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConsultationId) {
      const unsubscribe = subscribeToMessages(activeConsultationId);
      return () => unsubscribe();
    }
  }, [activeConsultationId, subscribeToMessages]);

  const handleGeneratePDF = () => {
    generatePrescriptionPDF(userName, messages);
  };

  useEffect(() => {
    // Initial doctor message only if chat is empty
    if (messages.length === 0) {
      const timeoutId = setTimeout(() => {
        // Double check if messages are still empty before adding
        if (useStore.getState().messages.length > 0) return;
        
        let problemText = 'anamnese';
        
        if (answers?.objectives?.length > 0) {
          problemText = `queixa de ${answers.objectives.join(', ')}`;
        } else if (answers?.description) {
          problemText = 'queixa principal';
        }
        
        const obsText = answers?.description ? ` e as observações que você enviou` : '';

        addMessage({
          text: `Olá ${userName || 'paciente'}, sou o Dr. Guilherme. Analisei sua ${problemText}${obsText}. Como você está se sentindo hoje?`,
          sender: 'doctor'
        });
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [userName, answers, messages.length, addMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    addMessage({
      text: inputText,
      sender: 'user'
    });
    
    setInputText('');
  };

  const handleDoctorAction = (action: 'prescribe' | 'ask_approval' | 'send_prescription') => {
    if (action === 'prescribe') {
      addMessage({
        text: "Compreendo. A cannabis medicinal pode ser muito eficaz para esses sintomas. Abaixo estão os produtos selecionados, caso tenha alguma dúvida ou restrição é só me falar.",
        sender: 'doctor'
      });
      
      setTimeout(() => {
        useStore.setState(state => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString() + '-p1',
              sender: 'doctor',
              timestamp: new Date(),
              type: 'product',
              productData: {
                name: "GreenBudzCBD CalmVibe CBD 6000mg + Mint",
                image: "https://placehold.co/400x400/3b82f6/ffffff?text=Calm+Vibe",
                details: [
                  "30ml 200mg/ml",
                  "Sabor Menta"
                ],
                brand: "GreenBudzCBD",
                origin: "Importado",
                italicText: "Sem alteração nas sensações e nível de consciência",
                dosage: [
                  "10 gota(s) sublingual, de manhã, deixar absorver",
                  "10 gota(s) sublingual, antes de dormir, deixar absorver"
                ],
                description: "Extrato de hemp orgânico feito com CO2 e diluído em óleo MCT + sabor menta. Indicações mais comuns: Ansiedade, Epilepsia, Dor Crônica, Parkinson, Insônia, Autismo, Alzheimer entre outros. Aproximadamente 40 gotas por ML. 5mg por gota.",
                priceUSD: 80.00
              }
            },
            {
              id: Date.now().toString() + '-p2',
              sender: 'doctor',
              timestamp: new Date(),
              type: 'product',
              productData: {
                name: "GreenBudzCBD Chill Gummies Vibe THC 10mg 1:1 CBD 10mg Watermelon - 30ct",
                image: "https://images.unsplash.com/photo-1626015561570-80e227092928?q=80&w=400&auto=format&fit=crop",
                details: [
                  "10mg THC + 10mg CBD por goma",
                  "Proporção 1:1",
                  "Sabor Melancia",
                  "30 unidades"
                ],
                brand: "GreenBudzCBD",
                origin: "Importado",
                italicText: "Pode causar alteração nas sensações e nível de consciência",
                dosage: [
                  "1 goma, de manhã",
                  "1 goma, antes de dormir"
                ],
                description: "Gomas com proporção equilibrada de THC e CBD, excelentes para relaxamento mental e alívio do estresse sem sedação excessiva.",
                priceUSD: 39.90
              }
            }
          ]
        }));
      }, 500);
    } else if (action === 'ask_approval') {
      addMessage({
        text: "Se estiver de acordo com os medicamentos, vou emitir a sua receita.",
        sender: 'doctor'
      });
    } else if (action === 'send_prescription') {
      addMessage({
        text: "Perfeito! Aqui está a sua receita. Depois, aqui mesmo pelo aplicativo, você pode fazer a compra dos medicamentos.",
        sender: 'doctor'
      });
      
      setTimeout(() => {
        useStore.setState(state => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString() + '-rx',
              sender: 'doctor',
              timestamp: new Date(),
              type: 'prescription'
            }
          ]
        }));
      }, 500);
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col h-full bg-mecura-bg relative">
      {/* Header */}
      <div className="bg-mecura-surface/90 backdrop-blur-md border-b border-mecura-elevated p-4 flex items-center gap-4 z-20 sticky top-0">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-mecura-surface-light flex items-center justify-center text-mecura-silver hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-mecura-surface-light overflow-hidden border-2 border-mecura-elevated">
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop" alt="Dr. Guilherme" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-mecura-neon rounded-full border-2 border-mecura-surface" />
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg leading-tight">Dr. Guilherme Taveira Dias</h2>
          <p className="text-xs text-mecura-silver">CRM: 12345/SP</p>
        </div>
        <button 
          onClick={handleFinish}
          className="w-10 h-10 rounded-full bg-mecura-surface-light flex items-center justify-center text-mecura-silver hover:text-mecura-neon transition-colors"
          title="Acessar Área do Paciente"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.type === 'product' && msg.productData ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-[95%] sm:w-[85%] bg-[#F3F4F6] rounded-2xl overflow-hidden mb-2 shadow-lg relative group border border-gray-200"
              >
                <div className="p-5 flex flex-col">
                  {/* Top Section */}
                  <div className="flex gap-4 mb-4">
                    {/* Image */}
                    <div className="w-20 h-28 bg-white rounded-xl p-2 flex-shrink-0 flex items-center justify-center relative shadow-sm border border-gray-100">
                      <img 
                        src={msg.productData.image || "https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=400&auto=format&fit=crop"} 
                        alt={msg.productData.name} 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Prevent infinite loop if fallback also fails
                          if (target.dataset.fallbackApplied) return;
                          target.dataset.fallbackApplied = 'true';
                          
                          const typeLower = msg.productData?.name?.toLowerCase() || '';
                          if (typeLower.includes('óleo') || typeLower.includes('oil')) {
                            target.src = "https://placehold.co/400x400/f8fafc/0f172a?text=Oleo";
                          } else if (typeLower.includes('goma') || typeLower.includes('gumm')) {
                            target.src = "https://placehold.co/400x400/f8fafc/0f172a?text=Gomas";
                          } else {
                            target.src = "https://placehold.co/400x400/f8fafc/0f172a?text=CBD";
                          }
                        }}
                      />
                      <div className="absolute top-1 right-1">
                        <Eye className="w-4 h-4 text-[#58D68D]" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[#58D68D] uppercase tracking-wider mb-1">® {msg.productData.brand}</span>
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold">🇺🇸 {msg.productData.origin}</span>
                      </div>
                      <h3 className="text-black font-bold text-base leading-tight mb-2">{msg.productData.name}</h3>
                      <ul className="text-gray-600 text-[11px] space-y-1 mb-2">
                        {msg.productData.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#58D68D]" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Dosage Section */}
                  <div className="bg-white/60 rounded-xl p-4 mb-4 border border-gray-100">
                    <h4 className="text-[#2D5A27] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Droplets className="w-3 h-3" /> Iniciar tratamento com:
                    </h4>
                    <ul className="text-black text-sm font-medium space-y-1.5">
                      {msg.productData.dosage.map((dose, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#58D68D] mt-1">•</span>
                          {dose}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : msg.type === 'prescription_notes' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-[95%] sm:w-[85%] bg-mecura-surface border border-mecura-neon/30 rounded-2xl p-6 mb-2 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <PlusCircle className="w-12 h-12 text-mecura-neon" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20">
                      <FileText className="w-5 h-5 text-mecura-neon" />
                    </div>
                    <h3 className="text-white font-bold text-lg">Orientações Médicas</h3>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-mecura-pearl text-base leading-relaxed whitespace-pre-wrap mb-6">
                      {msg.text}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      addMessage({ text: "Li e compreendi todas as orientações do tratamento.", sender: 'user' });
                    }}
                    className="w-full py-3 bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon rounded-xl font-bold text-sm hover:bg-mecura-neon hover:text-black transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Confirmar Leitura
                  </button>
                </div>
              </motion.div>
            ) : msg.type === 'prescription' ? (
              <div className="w-[90%] sm:w-[80%] bg-gradient-to-br from-[#1A1A26] to-[#0A0A0F] border border-mecura-neon/40 rounded-3xl p-6 mb-2 relative overflow-hidden group">
                {/* Holographic/Scanner background effect */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-mecura-neon/20 blur-[50px] rounded-full group-hover:bg-mecura-neon/30 transition-colors duration-700" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-mecura-neon/10 border border-mecura-neon/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(166,255,0,0.15)]">
                      <FileText className="w-7 h-7 text-mecura-neon" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-mecura-neon uppercase tracking-widest font-mono">Status</span>
                      <p className="text-xs text-white font-medium flex items-center gap-1 justify-end">
                        <CheckCheck className="w-3 h-3 text-mecura-neon" /> Assinada
                      </p>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-2xl mb-1">Receita Digital</h3>
                  <p className="text-mecura-silver text-xs mb-6 font-mono">ID: RX-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => {
                        if (msg.attachment) {
                          const a = document.createElement('a');
                          a.href = msg.attachment.url;
                          a.download = msg.attachment.name;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        } else {
                          handleGeneratePDF();
                        }
                      }} 
                      className="w-full bg-mecura-neon text-black hover:bg-[#b5ff33] font-bold shadow-[0_0_20px_rgba(166,255,0,0.25)] rounded-xl h-12"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </Button>
                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl h-12" onClick={() => navigate('/pharmacy')}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Ir para a Loja
                    </Button>
                  </div>
                </div>
              </div>
            ) : msg.type === 'acompanhamento_card' ? (
              <div className="w-[95%] sm:w-[85%] bg-gradient-to-br from-[#1A1A26] to-[#0A0A0F] border border-mecura-gold/40 rounded-3xl p-6 mb-2 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-mecura-gold/20 blur-[50px] rounded-full" />
                
                <div className="relative z-10">
                  <h2 className="text-mecura-gold font-bold text-2xl mb-4 flex items-center gap-2">
                    🚀 Dê o próximo passo!
                  </h2>
                  <p className="text-white text-base leading-relaxed mb-6">
                    Estruture seu tratamento com segurança e profissionalismo. Tenha acesso a consultas personalizadas, laudo médico e acompanhamento contínuo.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-base text-white">
                      <div className="w-6 h-6 rounded-full bg-mecura-gold/10 flex items-center justify-center text-mecura-gold">✅</div>
                      Consulta individualizada
                    </div>
                    <div className="flex items-center gap-3 text-base text-white">
                      <div className="w-6 h-6 rounded-full bg-mecura-gold/10 flex items-center justify-center text-mecura-gold">✅</div>
                      Laudo médico inicial
                    </div>
                    <div className="flex items-center gap-3 text-base text-white">
                      <div className="w-6 h-6 rounded-full bg-mecura-gold/10 flex items-center justify-center text-mecura-gold">✅</div>
                      Retorno em 90 dias
                    </div>
                  </div>
 
                  <details className="group mb-6">
                    <summary className="text-mecura-gold text-base font-bold cursor-pointer hover:underline list-none flex items-center gap-2">
                      Ler mais <span className="text-sm group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-4 space-y-4 text-white text-sm leading-relaxed">
                      <p>Você já deu o primeiro passo. Agora é hora de avançar no tratamento.</p>
                      <p>Queremos te oferecer um acompanhamento mais profundo e totalmente personalizado para o seu caso. Através de consultas por videochamada, vamos estruturar seu tratamento com segurança, desde o início até a evolução dos resultados. Com o seu laudo médico, você garante muito mais do que um documento — você conquista um documento essencial para entrada em cultivos legais e comprova seu acesso seguro ao tratamento com cannabis medicinal no Brasil. Não pare na receita — sem o laudo, seu acesso ao tratamento fica limitado.</p>
                      <p><strong className="text-mecura-gold">Isso inclui:</strong></p>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Possibilidade de acesso ao medicamento pelo SUS</li>
                        <li>Importação de produtos autorizados pela Anvisa</li>
                        <li>Base legal para solicitação de cultivo próprio (via judicial)</li>
                      </ul>
                      <p>Hoje, mais de 1.000 famílias já transformaram sua qualidade de vida com esse passo.</p>
                    </div>
                  </details>

                  <div className="bg-mecura-surface/50 rounded-2xl p-4 border border-mecura-elevated">
                    <p className="text-mecura-silver text-xs mb-1">Teleconsulta completa:</p>
                    <p className="text-white font-bold text-lg">R$ 250,00</p>
                  </div>
                </div>
              </div>
            ) : msg.type === 'acompanhamento_options' && msg.sender === 'doctor' ? (
              <div className="w-[90%] sm:w-[80%] flex flex-col gap-3 mb-8 items-start">
                <Button 
                  onClick={() => {
                    setSelectedOffer('premium');
                    navigate('/premium-checkout');
                  }}
                  className="w-full py-4 bg-mecura-gold text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(201,168,76,0.25)] hover:bg-mecura-gold-light transition-colors"
                >
                  Desejo dar o Próximo Passo
                </Button>
                <Button 
                  onClick={() => addMessage({ text: "Entendido. Fico à disposição caso mude de ideia.", sender: 'doctor' })}
                  className="w-full py-4 bg-red-500/10 text-red-500 font-bold rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  Adiar meu Tratamento
                </Button>
                <Button 
                  onClick={() => { resetConsultation(); navigate('/onboarding'); }}
                  className="w-full py-4 bg-mecura-neon text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(166,255,0,0.2)] hover:bg-[#b5ff33] transition-colors"
                >
                  NOVA CONSULTA
                </Button>
              </div>
            ) : (
              <div 
                className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-mecura-neon/10 text-white rounded-tr-sm border border-mecura-neon/20' 
                    : 'bg-mecura-surface text-mecura-pearl rounded-tl-sm border border-mecura-elevated'
                }`}
              >
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
              </div>
            )}
            <div className="flex items-center gap-1 mt-1.5 px-1">
              <span className="text-[10px] text-mecura-silver font-medium">
                {format(msg.timestamp, 'HH:mm')}
              </span>
              {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-mecura-neon" />}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 bg-mecura-surface border border-mecura-elevated w-fit p-4 rounded-2xl rounded-tl-sm shadow-md">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-mecura-neon rounded-full shadow-[0_0_5px_rgba(166,255,0,0.5)] animate-bounce" />
              <div className="w-2 h-2 bg-mecura-neon rounded-full shadow-[0_0_5px_rgba(166,255,0,0.5)] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-mecura-neon rounded-full shadow-[0_0_5px_rgba(166,255,0,0.5)] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-mecura-bg border-t border-mecura-elevated absolute bottom-0 left-0 right-0 z-20">
        {consultationActive && (
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escreva sua mensagem..."
              className="flex-1 h-14 bg-mecura-surface rounded-full px-6 text-sm text-white focus:outline-none border border-mecura-elevated focus:border-mecura-neon/50 transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-14 h-14 rounded-full bg-mecura-neon text-mecura-bg flex items-center justify-center disabled:opacity-50 disabled:bg-mecura-surface disabled:text-mecura-silver transition-all shadow-[0_0_15px_rgba(166,255,0,0.2)]"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
