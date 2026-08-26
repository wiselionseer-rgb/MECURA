import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useStore } from '../store/useStore';

type Message = {
  id: number;
  text: string;
  sender: 'advisor' | 'user';
  time: string;
  options?: string[];
  link?: { url: string; text: string };
};

export function AdvisorChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { userName } = useStore();
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Olá! 👋 Sou a Mariana, sua especialista aqui na Mecura. Como posso te ajudar hoje com seu tratamento ou dúvidas sobre nossos serviços?", 
      sender: 'advisor', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: [
        "Quem somos nós?",
        "Quais doenças são tratadas?",
        "Como funciona a compra e envio?",
        "Da onde vêm os medicamentos?",
        "Como cultivar e produzir em casa?",
        "É legalizado no Brasil?",
        "Valores e Custos",
        "Problemas no pagamento",
        "Falar com suporte humano"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show tooltip after 3 seconds if not open
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const requestHumanSupport = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'support_requests'), {
          userId: user.uid,
          userName: userName || user.displayName || 'Paciente',
          email: user.email,
          createdAt: serverTimestamp(),
          status: 'pending'
        });
      }
    } catch (error) {
      console.error("Erro ao solicitar suporte:", error);
    }
  };

  const handleUserMessage = (text: string) => {
    if (!text.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => {
      const updated = [...prev];
      // Hide options from the previous message once user replies
      if (updated.length > 0 && updated[updated.length - 1].sender === 'advisor') {
        const lastAdvisor = { ...updated[updated.length - 1] };
        delete lastAdvisor.options;
        updated[updated.length - 1] = lastAdvisor;
      }
      return [...updated, newMsg];
    });

    setInputValue('');
    setIsTyping(true);

    // Simulate Bot response based on keywords or exact match
    setTimeout(() => {
      let botResponse: Message = {
        id: Date.now() + 1,
        text: "",
        sender: 'advisor',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: ["Falar com um assessor agora", "Voltar ao início"]
      };

      const lowerText = text.toLowerCase();

      const startOptions = [
        "Quem somos nós?",
        "Quais doenças são tratadas?",
        "Como funciona a compra e envio?",
        "Da onde vêm os medicamentos?",
        "Como cultivar e produzir em casa?",
        "É legalizado no Brasil?",
        "Valores e Custos",
        "Problemas no pagamento",
        "Falar com suporte humano"
      ];

      if (lowerText.includes("funciona a compra") || text === "Como funciona a compra e envio?") {
        botResponse.text = "Tudo é feito dentro do nosso ecossistema. Após a receita, você escolhe o produto na nossa Farmácia, paga em Reais (Pix ou Cartão) e nós cuidamos de toda a logística internacional até a sua porta.";
      } else if (lowerText.includes("doenças") || text === "Quais doenças são tratadas?") {
        botResponse.text = "A Cannabis auxilia em mais de 50 condições, incluindo: Ansiedade, Insônia, Dor Crônica, Parkinson, Epilepsia, Autismo (TEA), TDAH e Fibromialgia. Nossos especialistas avaliam seu caso individualmente.";
      } else if (lowerText.includes("procedência") || lowerText.includes("da onde vêm") || lowerText.includes("onde vem") || text === "Da onde vêm os medicamentos?") {
        botResponse.text = "Trabalhamos apenas com laboratórios certificados (GMP) dos EUA, Uruguai e Colômbia. Todo lote possui certificado de análise (COA) garantindo pureza, concentração e ausência de metais pesados.";
      } else if (lowerText.includes("cultivar") || lowerText.includes("produzir") || text === "Como cultivar e produzir em casa?") {
        botResponse.text = "Possuímos cursos completos desde o iniciante ao avançado, fornecemos parceria com os maiores bancos de sementes internacionais (EUA e Europa), e auxiliamos no processo de Habeas Corpus para você cultivar de forma 100% legal.";
      } else if (lowerText.includes("como funciona")) {
        botResponse.text = "A jornada na Mecura é simples:\n1) Agende sua consulta online\n2) Passe com o médico especialista\n3) Nós cuidamos da autorização da Anvisa\n4) Compre o produto direto no App e receba em casa!";
      } else if (lowerText.includes("pagamento") || text === "Problemas no pagamento") {
        botResponse.text = "Sinto muito que você esteja tendo problemas com o pagamento. Se o seu Pix não foi compensado ou se ocorreu algum erro na finalização, nossa equipe financeira pode verificar imediatamente para você. Deseja falar com nosso suporte?";
        botResponse.options = ["Falar com suporte humano", "Voltar ao início"];
      } else if (lowerText.includes("valor") || lowerText.includes("custo") || text === "Valores e Custos") {
        botResponse.text = "A consulta (com direito a retorno) custa R$ 250,00 (ou R$ 49,90 no plano essencial). Já os valores dos produtos variam dependendo da prescrição, começando a partir de R$ 300,00 por frasco importado.";
      } else if (lowerText.includes("legal") || lowerText.includes("brasil") || text === "É legalizado no Brasil?") {
        botResponse.text = "Sim! É 100% legalizado. O tratamento segue a regulação RDC 660 da Anvisa, que autoriza a importação para uso pessoal e medicinal desde que o paciente tenha prescrição médica.";
      } else if (lowerText.includes("quem somos") || text === "Quem somos nós?") {
        botResponse.text = "A Mecura é o maior ecossistema de saúde canábica do país. Unimos médicos, advogados e tecnologia para garantir que você tenha o melhor tratamento com segurança, legalidade e suporte humano.";
      } else if (lowerText.includes("assessor") || lowerText.includes("humano") || lowerText.includes("suporte") || text === "Falar com suporte humano") {
        botResponse.text = "Perfeito! A nossa equipe de assessores acabou de ser notificada no sistema. Eles vão te contatar o mais breve possível.\n\nSe preferir, você também pode chamar a gente diretamente no WhatsApp!";
        botResponse.link = { url: "https://wa.me/5566996280883", text: "Abrir WhatsApp" };
        delete botResponse.options; 
        requestHumanSupport();
      } else if (text === "Voltar ao início") {
        botResponse.text = "Certo! Sobre o que mais você quer saber?";
        botResponse.options = startOptions;
      } else {
        botResponse.text = "Entendi! O ideal é você falar direto com a nossa equipe de assessores, eles podem tirar todas as suas dúvidas mais específicas.";
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };


  const handleSend = () => {
    handleUserMessage(inputValue);
  };

  return (
    <>
      {/* Floating Button & Tooltip */}
      <div className={`fixed bottom-6 right-6 z-50 flex items-end justify-end ${isOpen ? 'hidden' : 'flex'}`}>
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-16 right-0 mb-2 w-64 bg-[#161622] p-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-mecura-neon/30"
            >
              <button 
                onClick={() => setShowTooltip(false)}
                className="absolute top-2 right-2 text-[#8A8A9E] hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#161622] border-2 border-mecura-neon/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150" alt="Mariana" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm text-white font-bold leading-tight pr-4">Ficou com dúvida?</p>
                  <p className="text-xs text-[#8A8A9E] mt-1">Fale com a Mariana agora.</p>
                </div>
              </div>
              <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-[#161622] border-b border-r border-mecura-neon/30 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
          }}
          className="w-14 h-14 bg-mecura-neon text-[#0A0A0F] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(166,255,0,0.3)] relative cursor-pointer"
        >
          {/* Neon Pulse Halo */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-1 rounded-full border-2 border-mecura-neon pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -inset-2 rounded-full border-2 border-mecura-neon/50 pointer-events-none"
          />
          
          <MessageCircle className="w-6 h-6 z-10" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[#0A0A0F] rounded-full z-20"></span>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-6 right-6 z-50 flex items-start gap-2">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-[#161622] rounded-full flex items-center justify-center shadow-md border border-[#262636] text-[#8A8A9E] hover:bg-[#262636] hover:text-white flex-shrink-0 mt-4 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="w-[300px] sm:w-[320px] bg-[#0A0A0F] rounded-[16px] shadow-[0_0_30px_rgba(166,255,0,0.15)] flex flex-col overflow-hidden border border-mecura-neon/20 h-[500px] max-h-[calc(100vh-6rem)] relative"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mecura-neon/5 via-transparent to-transparent pointer-events-none"></div>

              {/* Header */}
              <div className="bg-[#161622]/80 backdrop-blur-md border-b border-[#262636] p-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-mecura-neon overflow-hidden shadow-[0_0_15px_rgba(166,255,0,0.3)]">
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150" alt="Mariana" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
                      Mariana <span className="w-2 h-2 rounded-full bg-mecura-neon animate-pulse shadow-[0_0_8px_#A6FF00]"></span>
                    </h3>
                    <p className="text-[10px] text-mecura-neon/70 uppercase tracking-widest mt-0.5 font-semibold pt-0.5">Especialista Mecura</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-transparent scroll-smooth relative z-10 z-[1] custom-scrollbar">
                {messages.map((msg, index) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.sender === 'advisor' && (
                      <div className="flex items-center gap-1.5 ml-12 mb-1">
                         <span className="text-xs text-mecura-neon/70 font-medium tracking-wide">Mariana</span>
                      </div>
                    )}
                    <div className="flex items-end gap-2 max-w-[90%]">
                      {msg.sender === 'advisor' && (
                         <div className="w-9 h-9 rounded-full border-2 border-mecura-neon/50 overflow-hidden flex-shrink-0 mb-[14px] shadow-[0_0_10px_rgba(166,255,0,0.1)]">
                           <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150" alt="Mariana" className="w-full h-full object-cover" />
                         </div>
                      )}
                      <div className="flex flex-col w-full">
                        <div 
                          className={`px-4 py-3 text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                            msg.sender === 'user' 
                              ? 'bg-mecura-neon text-[#0A0A0F] rounded-[20px] rounded-br-[4px] shadow-[0_0_15px_rgba(166,255,0,0.2)] font-medium' 
                              : 'bg-[#161622] text-white rounded-[20px] rounded-bl-[4px] border border-[#262636]'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className={`text-[10px] text-[#8A8A9E] mt-1.5 ${msg.sender === 'user' ? 'text-right' : 'text-left ml-2'}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>

                    {msg.sender === 'advisor' && msg.options && index === messages.length - 1 && (
                      <div className="ml-10 flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar pb-2">
                        {msg.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleUserMessage(opt)}
                            disabled={isTyping}
                            className="w-full text-left px-3 py-2 bg-[#161622] border border-mecura-neon/30 text-mecura-neon text-[11px] font-bold rounded-xl shadow-sm hover:bg-mecura-neon/10 hover:border-mecura-neon hover:shadow-[0_0_10px_rgba(166,255,0,0.2)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.sender === 'advisor' && msg.link && (
                      <div className="ml-10 mt-2">
                          <a href={msg.link.url} target="_blank" rel="noopener noreferrer" 
                             className="inline-flex items-center gap-1.5 px-4 py-2 bg-mecura-neon text-[#0A0A0F] text-[13px] font-bold rounded-[20px] shadow-[0_0_15px_rgba(166,255,0,0.3)] hover:bg-[#8FFF00] transition-colors">
                            {msg.link.text} <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex flex-col items-start mt-2">
                    <div className="flex items-center gap-1.5 ml-12 mb-1">
                      <span className="text-xs text-mecura-neon/70 font-medium tracking-wide">Mariana</span>
                    </div>
                    <div className="flex items-end gap-2 max-w-[90%]">
                      <div className="w-9 h-9 rounded-full border-2 border-mecura-neon/50 overflow-hidden flex-shrink-0 mb-[14px]">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150" alt="Mariana" className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-[#161622] px-4 py-3 rounded-[20px] rounded-bl-[4px] border border-[#262636] shadow-sm">
                        <div className="flex gap-1.5 items-center h-4">
                          <motion.div animate={{ y: [0, -4, 0], backgroundColor: ['#262636', '#A6FF00', '#262636'] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-[#262636] rounded-full" />
                          <motion.div animate={{ y: [0, -4, 0], backgroundColor: ['#262636', '#A6FF00', '#262636'] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#262636] rounded-full" />
                          <motion.div animate={{ y: [0, -4, 0], backgroundColor: ['#262636', '#A6FF00', '#262636'] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#262636] rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} className="h-2" />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-[#161622] border-t border-[#262636] flex items-center gap-2 relative z-10">
                <button className="text-[#8A8A9E] p-2 hover:text-mecura-neon transition-colors cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                </button>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite aqui..." 
                  disabled={isTyping}
                  className="flex-1 bg-transparent text-[13px] focus:outline-none text-white placeholder-[#8A8A9E] disabled:opacity-50"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    inputValue.trim() ? 'bg-mecura-neon text-[#0A0A0F] shadow-[0_0_10px_rgba(166,255,0,0.4)]' : 'bg-[#262636] text-[#8A8A9E]'
                  }`}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

