import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Search, 
  Bell, 
  Settings, 
  LogOut,
  Send,
  PlusCircle,
  Activity,
  ClipboardList,
  CheckCheck,
  User,
  BrainCircuit,
  X,
  Loader2,
  Eye,
  BookOpen,
  LayoutDashboard,
  Paperclip,
  CheckCircle,
  Download,
  ChevronDown,
  ChevronLeft,
  Maximize2
} from 'lucide-react';
import { format } from 'date-fns';
import { setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { CBDGuideView } from '../components/CBDGuideView';
import { DoctorAnalyticsDashboard } from '../components/DoctorAnalyticsDashboard';
import { cbdGuideData, CBDProduct } from '../data/cbdGuide';
import { NotificationToast } from '../components/NotificationToast';

import { generatePrescriptionPDF } from '../utils/pdfGenerator';

export function DoctorDashboardScreen() {
  const { userName, answers, messages, addMessage, consultationActive, endConsultation, resetConsultation, setSelectedOffer, allAppointments, queue, leaveQueue, startConsultation, subscribeToQueue, subscribeToMessages, subscribeToAppointments } = useStore();
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [expandAnalysis, setExpandAnalysis] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'guide' | 'analytics'>('chat');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showProductSearchModal, setShowProductSearchModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CBDProduct | null>(null);
  const [dosageInput, setDosageInput] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<{name: string, url: string, type: string} | null>(null);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'in-consultation' | 'finished'>('all');
  const [queueSearchTerm, setQueueSearchTerm] = useState('');
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingCount = allAppointments.filter(app => app.status === 'pending').length;

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1); // Drop to A4
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    const currentUnreadCount = queue.filter(p => p.hasUnread).length;
    if (currentUnreadCount > prevUnreadCount) {
      playNotificationSound();
    }
    setPrevUnreadCount(currentUnreadCount);
  }, [queue, prevUnreadCount]);

  useEffect(() => {
    const unsubscribeQueue = subscribeToQueue();
    const unsubscribeAppointments = subscribeToAppointments();
    return () => {
      unsubscribeQueue();
      unsubscribeAppointments();
    };
  }, [subscribeToQueue, subscribeToAppointments]);

  useEffect(() => {
    console.log("Current patient changed:", currentPatient);
    if (currentPatient?.id) {
      console.log("Subscribing to messages for:", currentPatient.id);
      const unsubscribeMessages = subscribeToMessages(currentPatient.id);
      
      // Mark as read when opening
      if (currentPatient.hasUnread) {
        updateDoc(doc(db, 'queue', currentPatient.id), { hasUnread: false }).catch(console.error);
      }
      
      return () => {
        console.log("Unsubscribing from messages for:", currentPatient.id);
        unsubscribeMessages();
      };
    }
  }, [currentPatient?.id, subscribeToMessages]);

  // Mark as read when new messages arrive while viewing the patient
  useEffect(() => {
    if (currentPatient?.id && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'user') {
        updateDoc(doc(db, 'queue', currentPatient.id), { hasUnread: false }).catch(console.error);
      }
    }
  }, [messages, currentPatient?.id]);

  const handleStartConsultation = (patient: any) => {
    console.log("Starting consultation for:", patient);
    setCurrentPatient(patient);
    startConsultation(patient.id);
  };

  const handleNotifyNext = async (patient: any) => {
    // In a real app, this would send a push notification or update a status in the DB
    try {
      await setDoc(doc(db, 'notifications', patient.id), {
        text: "O Dr. Guilherme já está pronto para te atender! Entre na sala de consulta.",
        timestamp: new Date().toISOString(),
        type: 'next'
      });
      alert(`Notificação enviada para ${patient.patientName}: Sua vez chegou!`);
    } catch (error) {
      console.error("Error sending notification", error);
      alert("Erro ao enviar notificação.");
    }
  };

  const handleNotifyWait = async (patient: any) => {
    try {
      await setDoc(doc(db, 'notifications', patient.id), {
        text: "Olá! O Dr. Guilherme está finalizando um atendimento e te chamará em aproximadamente 5 minutos.",
        timestamp: new Date().toISOString(),
        type: 'wait'
      });
      alert(`Notificação enviada para ${patient.patientName}: Consulta em 5 min.`);
    } catch (error) {
      console.error("Error sending notification", error);
      alert("Erro ao enviar notificação.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingAttachment({
          name: file.name,
          url: reader.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  // }, [messages]);

  // Removed local mock queue to use store's queue

  const handleSend = () => {
    if (!inputText.trim() && !pendingAttachment) return;
    
    if (inputText.trim()) {
      addMessage({
        text: inputText,
        sender: 'doctor'
      });
    }

    if (pendingAttachment) {
      addMessage({
        sender: 'doctor',
        type: 'prescription',
        attachment: pendingAttachment
      });
      setPendingAttachment(null);
    }
    
    setInputText('');
  };

  const handleDoctorAction = (action: 'prescribe' | 'ask_approval' | 'send_prescription' | 'ask_doubt' | 'acompanhamento') => {
    if (action === 'prescribe') {
      const objectives = answers?.objectives || [];
      let symptomsText = "esses sintomas";
      
      if (objectives.length > 0) {
        if (objectives.length === 1) {
          symptomsText = `o seu quadro de ${objectives[0].toLowerCase()}`;
        } else if (objectives.length === 2) {
          symptomsText = `os seus quadros de ${objectives[0].toLowerCase()} e ${objectives[1].toLowerCase()}`;
        } else {
          const last = objectives[objectives.length - 1];
          const rest = objectives.slice(0, -1);
          symptomsText = `os seus quadros de ${rest.map((o: string) => o.toLowerCase()).join(', ')} e ${last.toLowerCase()}`;
        }
      }

      addMessage({
        text: `A cannabis medicinal pode ser muito eficaz para ${symptomsText}. Através da modulação do sistema endocanabinoide, podemos buscar um alívio direcionado. Caso tenha alguma dúvida ou restrição é só me falar, vou prescrever sua medicação.`,
        sender: 'doctor'
      });
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
        addMessage({
          sender: 'doctor',
          type: 'prescription'
        });
      }, 500);
    } else if (action === 'ask_doubt') {
      addMessage({
        text: "Teria alguma dúvida, podemos finalizar?",
        sender: 'doctor'
      });
    } else if (action === 'acompanhamento') {
      addMessage({
        sender: 'doctor',
        type: 'acompanhamento_card',
        text: 'Acompanhamento' // Placeholder
      });
      
      setTimeout(() => {
        addMessage({
          sender: 'doctor',
          type: 'acompanhamento_options'
        });
      }, 500);
    }
  };

  const handleSendProduct = () => {
    if (!selectedProduct || !dosageInput.trim()) return;
    
    // Collect selected periods
    const periods = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .map((el: any) => el.parentElement?.textContent?.trim());
    
    // Get administration instructions
    const adminInstructions = (document.getElementById('admin-instructions') as HTMLDivElement)?.textContent || "";
    
    const dosageString = `${dosageInput} ${periods.length > 0 ? `(${periods.join(', ')})` : ''}`;
    
    const fullDosage = `${dosageString}\n\n${adminInstructions}\n\nBLOCO IMPORTANTE:\nUso sob orientação de profissional de saúde. Pode causar sonolência. Evitar dirigir ou operar máquinas. Manter fora do alcance de crianças.`;
    
    // Enrich product data dynamically if missing
    let details = selectedProduct.details || [selectedProduct.type];
    let italicText = selectedProduct.italicText || "";
    let description = selectedProduct.description || "";
    let image = selectedProduct.image || "";

    // Always determine a fallback image based on type if none is provided
    if (!image) {
      const typeLower = selectedProduct.type.toLowerCase();
      const nameLower = selectedProduct.name.toLowerCase();
      
      if (typeLower.includes('óleo') || typeLower.includes('oil') || nameLower.includes('óleo') || nameLower.includes('oil')) {
        image = "https://placehold.co/400x400/f8fafc/0f172a?text=Oleo"; // Dropper bottle
      } else if (typeLower.includes('goma') || typeLower.includes('comestível') || nameLower.includes('gumm')) {
        image = "https://placehold.co/400x400/f8fafc/0f172a?text=Gomas"; // Gummies
      } else if (typeLower.includes('tópico') || typeLower.includes('bálsamo') || typeLower.includes('gel') || nameLower.includes('cream')) {
        image = "https://placehold.co/400x400/f8fafc/0f172a?text=Creme"; // Cream jar
      } else if (typeLower.includes('vape') || typeLower.includes('cartucho') || nameLower.includes('vape')) {
        image = "https://placehold.co/400x400/f8fafc/0f172a?text=Vape"; // Vape/Smoke
      } else if (typeLower.includes('flor') || typeLower.includes('extrato') || typeLower.includes('hash') || nameLower.includes('flower')) {
        image = "https://placehold.co/400x400/f8fafc/0f172a?text=Flor"; // Bud
      } else {
        image = "https://placehold.co/400x400/f8fafc/0f172a?text=CBD"; // Generic CBD bottle
      }
    }

    if (!selectedProduct.details) {
      if (selectedProduct.concentration) {
        details.push(`Concentração: ${selectedProduct.concentration}`);
      } else {
        if (selectedProduct.type.includes('Full Spectrum')) details.push("Alta Concentração de Canabinóides");
        else if (selectedProduct.type.includes('Isolado')) details.push("Puro CBD (0% THC)");
        else if (selectedProduct.type.includes('Tópico') || selectedProduct.type.includes('Bálsamo')) details.push("Uso Externo / Local");
      }
    }

    if (!selectedProduct.description) {
      if (selectedProduct.type.includes('Full Spectrum')) {
        if (!selectedProduct.details) details.push("Efeito Entourage Potencializado");
        italicText = "Contém traços de THC (<0.3%). Pode causar leve sonolência.";
        description = `O ${selectedProduct.name} da ${selectedProduct.manufacturer} é um extrato de espectro completo, preservando todos os canabinóides, terpenos e flavonoides naturais da planta. Ideal para um tratamento abrangente, aproveitando o efeito comitiva para maior eficácia terapêutica.`;
      } else if (selectedProduct.type.includes('Isolado')) {
        if (!selectedProduct.details) details.push("Zero THC garantido");
        italicText = "Sem efeitos psicoativos. Seguro para testes toxicológicos.";
        description = `O ${selectedProduct.name} oferece CBD em sua forma mais pura. Fabricado pela ${selectedProduct.manufacturer}, este produto passa por um rigoroso processo de purificação para remover todos os outros compostos da planta, garantindo 0% de THC. Excelente para pacientes com sensibilidade a outros canabinóides.`;
      } else if (selectedProduct.type.includes('Tópico') || selectedProduct.type.includes('Bálsamo') || selectedProduct.type.includes('Gel')) {
        if (!selectedProduct.details) {
          details.push("Absorção Rápida");
          details.push("Alívio Direcionado");
        }
        italicText = "Apenas para uso externo. Evitar contato com os olhos.";
        description = `Formulado especificamente para aplicação local, o ${selectedProduct.name} da ${selectedProduct.manufacturer} proporciona alívio direcionado exatamente onde você precisa. Sua base de rápida absorção permite que os canabinóides atuem diretamente nos receptores da pele e músculos.`;
      } else if (selectedProduct.type.includes('Goma') || selectedProduct.type.includes('Comestível')) {
        if (!selectedProduct.details) {
          details.push("Dose Precisa");
          details.push("Fácil Ingestão");
        }
        italicText = "Efeito pode demorar de 1 a 2 horas para iniciar.";
        description = `Uma forma deliciosa e discreta de consumir seu CBD. O ${selectedProduct.name} oferece uma dosagem exata em cada unidade, facilitando o controle do tratamento. Fabricado com rigorosos padrões de qualidade pela ${selectedProduct.manufacturer}.`;
      } else {
        if (!selectedProduct.details) details.push("Qualidade Premium");
        italicText = "Consulte a bula para mais informações.";
        description = `Produto terapêutico de alta qualidade desenvolvido pela ${selectedProduct.manufacturer}. O ${selectedProduct.name} é formulado para oferecer os melhores resultados terapêuticos, seguindo rigorosos padrões de fabricação e controle de qualidade.`;
      }
    }

    addMessage({
      text: `Prescrição de ${selectedProduct.name}`,
      sender: 'doctor',
      type: 'product',
      productData: {
        name: selectedProduct.name,
        brand: selectedProduct.manufacturer,
        origin: selectedProduct.origin,
        details: details,
        dosage: [fullDosage],
        description: description,
        italicText: italicText,
        image: image
      }
    });

    
    setShowProductSearchModal(false);
    setSelectedProduct(null);
    setDosageInput('');
  };

  const handlePrescribeNotes = () => {
    if (!prescriptionInput.trim()) return;
    
    addMessage({
      sender: 'doctor',
      type: 'prescription_notes',
      text: prescriptionInput
    });
    
    setPrescriptionInput('');
    setShowPrescriptionModal(false);
  };

  const handleFinishConsultation = async () => {
    await addMessage({
      text: `Consulta finalizada.\n\n${userName ? userName + ', a' : 'A'}gradeço a confiança em meu trabalho. Lembre-se que o tratamento com cannabis medicinal é uma jornada de adaptação e descoberta. Estarei acompanhando sua evolução de perto.\n\nQualquer dúvida sobre a dosagem, efeitos ou se precisar de suporte, nossa equipe de acolhimento está à disposição 24h por dia aqui no aplicativo.\n\nUm excelente tratamento e conte conosco!`,
      sender: 'doctor',
      type: 'text'
    });
    endConsultation();
    setCurrentPatient(null);
  };

  const handleGeneratePDF = () => {
    generatePrescriptionPDF(currentPatient?.patientName || userName || 'Paciente', messages);
  };

  const handleGenerateAnalysis = async () => {
    setExpandAnalysis(true);
    if (analysisResult) return; // Already generated
    
    const patientAnswers = currentPatient?.answers || answers;
    
    setIsAnalyzing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Chave da API do Gemini não encontrada. Verifique as variáveis de ambiente.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        Atue como um especialista em medicina canabinoide e prescrição médica.
        Com base nos seguintes dados do paciente, forneça uma análise clínica aprofundada indicando os melhores tratamentos e medicamentos à base de cannabis medicinal.
        Inclua base científica e estudos relevantes.
        Lembre-se: esta análise é um suporte à decisão médica. O médico definirá o tratamento final.
        
        Dados do Paciente:
        - Objetivos: ${patientAnswers?.objectives?.join(', ') || 'Não informados'}
        - Intensidade do sintoma: ${patientAnswers?.intensity || 'Não informada'}/10
        - Duração: ${patientAnswers?.duration || 'Não informada'}
        - Descrição: ${patientAnswers?.description || 'Não informada'}
        - Altura: ${patientAnswers?.height || 'Não informada'}m
        - Peso: ${patientAnswers?.weight || 'Não informada'}kg
        - Sexo: ${patientAnswers?.sex || 'Não informada'}
        - Tratamento Atual: ${patientAnswers?.tratamento_atual ? 'Sim' : 'Não'}
        - Uso de Remédios: ${patientAnswers?.remedios ? 'Sim' : 'Não'}
        - Doença Crônica: ${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}
        - Já usou Cannabis: ${patientAnswers?.cannabis ? 'Sim' : 'Não'}
        
        IMPORTANTE: Você DEVE recomendar APENAS os medicamentos listados abaixo, escolhendo os mais adequados para a condição do paciente:
        
        ${cbdGuideData.map(cat => `Categoria: ${cat.title}\n${cat.products.map(p => `- ${p.name} (${p.type})`).join('\n')}`).join('\n\n')}
        
        Formate a resposta em Markdown, com seções claras e visualmente organizadas:
        1. Avaliação do Quadro Clínico
        2. Racional Terapêutico (Sistema Endocanabinoide)
        3. Sugestões de Fitocanabinoides (Proporções CBD/THC/CBG etc.)
        4. Evidências Científicas e Estudos Base
        5. Precauções e Interações Medicamentosas
        
        6. **RESUMO DE PRESCRIÇÃO SUGERIDA** (Siga rigorosamente esta estrutura sequencial em formato de LISTA, NÃO use tabelas):
           Para cada medicamento sugerido, crie um bloco de texto com as seguintes linhas exatas:
           **Medicamento**: (Nome exato da lista acima em negrito)
           **Indicação/Doença**: (Condição alvo em negrito)
           **Modo de Uso**: (Posologia e medidas destacadas em negrito, ex: **2 gotas**, **12 em 12 horas**)
           **Observações**: (Dicas importantes de administração)

        IMPORTANTE: Destaque em **negrito** todos os nomes de medicamentos, doenças, dosagens e horários para facilitar a leitura rápida do médico. NÃO USE TABELAS MARKDOWN PARA OS MEDICAMENTOS.
      `;

      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          break;
        } catch (error: any) {
          if (error.status === 429 && retries > 1) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 2000 * (4 - retries)));
          } else {
            throw error;
          }
        }
      }
      
      if (response && response.text) {
        setAnalysisResult(response.text);
      } else {
        setAnalysisResult("Não foi possível gerar a análise. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao gerar análise:", error);
      setAnalysisResult(`Ocorreu um erro ao conectar com a IA: ${error.message || 'Erro desconhecido'}. Verifique as configurações e tente novamente.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseMedications = (text: string) => {
    const medications = [];
    
    // Try parsing as a Markdown table first
    if (text.includes('| Medicamento |') || text.includes('| **Medicamento** |') || text.includes('|Medicamento|')) {
      const lines = text.split('\n');
      let inTable = false;
      for (let line of lines) {
        if (line.trim().startsWith('|') && line.includes('Medicamento') && line.includes('Indicação')) {
          inTable = true;
          continue;
        }
        if (inTable && line.trim().startsWith('|') && line.includes('---')) {
          continue; // Skip separator
        }
        if (inTable && line.trim().startsWith('|')) {
          const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
          if (cols.length >= 3) {
            medications.push({
              name: cols[0].replace(/\*\*/g, '').trim(),
              dosage: cols[2].replace(/\*\*/g, '').trim(),
              instructions: cols[3] ? cols[3].replace(/\*\*/g, '').trim() : ''
            });
          }
        } else if (inTable && !line.trim().startsWith('|')) {
          inTable = false; // End of table
        }
      }
    }

    // If table parsing found nothing, try the list format
    if (medications.length === 0) {
      const lines = text.split('\n');
      let currentMed = null;
      
      for (let line of lines) {
        if (line.match(/\bMedicamento\b/i) && line.includes(':')) {
          if (currentMed && currentMed.name) medications.push(currentMed);
          const parts = line.split(/Medicamento.*?:/i);
          currentMed = { name: parts[1]?.trim().replace(/\*/g, '').replace(/^- /, '').trim() || '', dosage: '', instructions: '' };
        } else if (line.match(/\bModo de Uso\b/i) && line.includes(':') && currentMed) {
          const parts = line.split(/Modo de Uso.*?:/i);
          currentMed.dosage = parts[1]?.trim().replace(/\*/g, '') || '';
        } else if (line.match(/\bObservações\b/i) && line.includes(':') && currentMed) {
          const parts = line.split(/Observações.*?:/i);
          currentMed.instructions = parts[1]?.trim().replace(/\*/g, '') || '';
        }
      }
      if (currentMed && currentMed.name) medications.push(currentMed);
    }
    
    return medications;
  };

  const addPrescribedMedication = (med: any) => {
    // Find product in cbdGuideData
    let foundProduct = null;
    for (const category of cbdGuideData) {
      const product = category.products.find(p => p.name.toLowerCase() === med.name.toLowerCase());
      if (product) {
        foundProduct = product;
        break;
      }
    }

    addMessage({
      text: `Prescrição de ${med.name}`,
      sender: 'doctor',
      type: 'product',
      productData: {
        name: foundProduct ? foundProduct.name : med.name,
        brand: foundProduct ? foundProduct.manufacturer : 'GreenBudzCBD',
        origin: foundProduct ? foundProduct.origin : 'Importado',
        details: foundProduct && foundProduct.details ? foundProduct.details : [med.dosage, med.instructions],
        dosage: [med.dosage],
        description: foundProduct && foundProduct.description ? foundProduct.description : med.instructions,
        italicText: foundProduct && foundProduct.italicText ? foundProduct.italicText : '',
        image: foundProduct && foundProduct.image ? foundProduct.image : "https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=400&auto=format&fit=crop",
        priceUSD: foundProduct && foundProduct.priceUSD ? foundProduct.priceUSD : undefined
      }
    });
    setShowAnalysisModal(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050508] text-mecura-pearl overflow-hidden font-sans">
      <NotificationToast />
      {/* Left Sidebar - Navigation (Bottom bar on mobile) */}
      <div className="w-full md:w-20 bg-mecura-surface border-t md:border-t-0 md:border-r border-mecura-elevated flex md:flex-col items-center py-2 md:py-6 px-4 md:px-0 gap-4 md:gap-8 z-20 order-last md:order-first overflow-x-auto md:overflow-x-visible">
        <div className="w-10 h-10 rounded-xl bg-mecura-neon/20 flex items-center justify-center border border-mecura-neon/50 shadow-[0_0_15px_rgba(166,255,0,0.2)] flex-shrink-0 hidden md:flex">
          <span className="font-serif font-bold text-mecura-neon text-xl">m</span>
        </div>
        
        <nav className="flex md:flex-col gap-2 md:gap-6 flex-1 justify-center md:justify-start">
          <button className="p-3 rounded-xl bg-mecura-neon/10 text-mecura-neon relative group hidden md:block">
            <Users className="w-6 h-6" />
            <div className="absolute left-full ml-4 px-2 py-1 bg-mecura-surface border border-mecura-elevated rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Fila de Pacientes
            </div>
          </button>
          <button 
            onClick={() => setActiveView('chat')}
            className={`p-3 rounded-xl transition-colors relative group ${activeView === 'chat' ? 'bg-mecura-neon/10 text-mecura-neon' : 'text-mecura-silver hover:text-white hover:bg-white/5'}`}
          >
            <MessageSquare className="w-6 h-6" />
            <div className="absolute bottom-full mb-2 md:bottom-auto md:mb-0 md:left-full md:ml-4 px-2 py-1 bg-mecura-surface border border-mecura-elevated rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Chat
            </div>
          </button>
          <button 
            onClick={() => setActiveView('guide')}
            className={`p-3 rounded-xl transition-colors relative group ${activeView === 'guide' ? 'bg-mecura-neon/10 text-mecura-neon' : 'text-mecura-silver hover:text-white hover:bg-white/5'}`}
          >
            <BookOpen className="w-6 h-6" />
            <div className="absolute bottom-full mb-2 md:bottom-auto md:mb-0 md:left-full md:ml-4 px-2 py-1 bg-mecura-surface border border-mecura-elevated rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Guia de Produtos
            </div>
          </button>
          <button 
            onClick={() => setActiveView('analytics')}
            className={`p-3 rounded-xl transition-colors relative group ${activeView === 'analytics' ? 'bg-mecura-neon/10 text-mecura-neon' : 'text-mecura-silver hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            {pendingCount > 0 && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-mecura-surface" />
            )}
            <div className="absolute bottom-full mb-2 md:bottom-auto md:mb-0 md:left-full md:ml-4 px-2 py-1 bg-mecura-surface border border-mecura-elevated rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Dashboard Analítico
            </div>
          </button>
        </nav>

        <div className="flex md:flex-col gap-2 md:gap-4 items-center">
          <button className="p-3 rounded-xl text-mecura-silver hover:text-white hover:bg-white/5 transition-colors hidden md:block">
            <Settings className="w-6 h-6" />
          </button>
          <button 
            onClick={() => navigate('/')}
            className="p-3 rounded-xl text-mecura-silver hover:text-white hover:bg-white/5 transition-colors relative group"
          >
            <LogOut className="w-6 h-6" />
            <div className="absolute bottom-full mb-2 md:bottom-auto md:mb-0 md:left-full md:ml-4 px-2 py-1 bg-mecura-surface border border-mecura-elevated rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Sair
            </div>
          </button>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-mecura-surface-light overflow-hidden border border-mecura-elevated hidden md:block">
            <img src="https://images.unsplash.com/photo-1594824436998-dd40e4f69d1b?q=80&w=100&auto=format&fit=crop" alt="Doctor" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative">
        {activeView === 'chat' ? (
          <>
            {/* Queue Panel */}
            <div className={`w-full md:w-80 bg-[#0A0A0F] border-r border-mecura-elevated flex flex-col z-0 shadow-lg ${currentPatient ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-6 border-b border-mecura-elevated bg-mecura-surface/20">
                <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Fila de Atendimento</h2>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mecura-silver" />
                  <input 
                    type="text" 
                    placeholder="Buscar paciente..." 
                    value={queueSearchTerm}
                    onChange={(e) => setQueueSearchTerm(e.target.value)}
                    className="w-full bg-mecura-surface/50 border border-mecura-elevated rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mecura-neon/50 focus:bg-mecura-surface text-white transition-all"
                  />
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                    onClick={() => setQueueFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${queueFilter === 'all' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setQueueFilter('waiting')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${queueFilter === 'waiting' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}`}
                  >
                    Aguardando
                  </button>
                  <button 
                    onClick={() => setQueueFilter('in-consultation')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${queueFilter === 'in-consultation' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}`}
                  >
                    Em Atendimento
                  </button>
                  <button 
                    onClick={() => setQueueFilter('finished')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${queueFilter === 'finished' ? 'bg-mecura-neon text-black' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}`}
                  >
                    Concluído
                  </button>
                </div>
              </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {queue.filter(p => (queueFilter === 'all' ? true : p.status === queueFilter) && p.patientName.toLowerCase().includes(queueSearchTerm.toLowerCase())).length > 0 ? (
            [...queue].filter(p => (queueFilter === 'all' ? true : p.status === queueFilter) && p.patientName.toLowerCase().includes(queueSearchTerm.toLowerCase())).sort((a, b) => {
              // 1. Unread messages first
              if (a.hasUnread && !b.hasUnread) return -1;
              if (!a.hasUnread && b.hasUnread) return 1;
              
              // 2. Most recent message
              if (a.lastMessageAt && b.lastMessageAt) {
                return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
              }
              if (a.lastMessageAt) return -1;
              if (b.lastMessageAt) return 1;
              
              // 3. Status (waiting > in-consultation > finished)
              const statusWeight = { 'waiting': 0, 'in-consultation': 1, 'finished': 2 };
              const weightA = statusWeight[a.status as keyof typeof statusWeight] ?? 3;
              const weightB = statusWeight[b.status as keyof typeof statusWeight] ?? 3;
              if (weightA !== weightB) return weightA - weightB;
              
              // 4. Joined At (oldest first)
              return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
            }).map((patient, idx) => (
              <div 
                key={patient.id} 
                onClick={() => handleStartConsultation(patient)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  patient.hasUnread
                    ? 'bg-mecura-neon/10 border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.15)]'
                    : patient.status === 'finished'
                      ? 'bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-mecura-surface/40 hover:border-mecura-elevated'
                      : 'bg-transparent border-transparent hover:bg-mecura-surface/40 hover:border-mecura-elevated'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold text-base ${patient.hasUnread ? 'text-white' : 'text-mecura-pearl'}`}>{patient.patientName}</h3>
                  <div className="flex flex-col items-end gap-1">
                    {patient.lastMessageAt && (
                      <span className="text-[10px] text-mecura-silver">
                        {new Date(patient.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {patient.hasUnread && (
                      <span className="w-5 h-5 rounded-full bg-mecura-neon text-black flex items-center justify-center text-[10px] font-bold">
                        1
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${
                    patient.status === 'waiting' ? 'bg-mecura-neon animate-pulse shadow-[0_0_8px_rgba(166,255,0,0.6)]' : 
                    patient.status === 'in-consultation' ? 'bg-blue-400' : 'bg-mecura-silver'
                  }`} />
                  <span className={`text-xs font-medium ${
                    patient.status === 'waiting' ? 'text-mecura-neon' : 
                    patient.status === 'in-consultation' ? 'text-blue-400' : 'text-mecura-silver'
                  }`}>
                    {patient.status === 'waiting' ? 'Aguardando Atendimento' : 
                     patient.status === 'in-consultation' ? 'Em Consulta' : 'Finalizado'}
                  </span>
                </div>
                {patient.lastMessageText && (
                  <p className="text-xs text-mecura-silver truncate mb-3">
                    {patient.lastMessageText}
                  </p>
                )}
                {patient.status !== 'finished' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNotifyNext(patient); }}
                      className="text-[10px] bg-mecura-surface-light px-2 py-1 rounded text-mecura-silver hover:text-white transition-colors"
                    >
                      Sua vez
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNotifyWait(patient); }}
                      className="text-[10px] bg-mecura-surface-light px-2 py-1 rounded text-mecura-silver hover:text-white transition-colors"
                    >
                      5 min
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center border border-dashed border-mecura-elevated rounded-2xl">
              <p className="text-mecura-silver text-sm">Nenhum paciente na fila</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`md:flex-1 flex flex-col bg-[#0A0A0F] relative ${!currentPatient ? 'hidden md:flex' : 'flex'}`}>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#A6FF00 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        {/* Back button for mobile */}
        {currentPatient && (
          <div className="md:hidden p-4 border-b border-mecura-elevated bg-[#0A0A0F] flex items-center">
            <button 
              onClick={() => setCurrentPatient(null)}
              className="text-mecura-silver hover:text-white flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar para Fila
            </button>
          </div>
        )}
          
          {/* Chat Header */}
          <div className="h-16 md:h-20 border-b border-mecura-elevated flex items-center justify-between px-4 md:px-8 bg-[#0A0A0F]/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-mecura-surface-light overflow-hidden border border-mecura-elevated flex items-center justify-center">
                <User className="w-5 h-5 md:w-6 md:h-6 text-mecura-silver" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-white tracking-tight truncate max-w-[150px] md:max-w-xs">{userName || 'Paciente Atual'}</h2>
                <p className="text-[10px] md:text-xs text-mecura-silver font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-mecura-neon shadow-[0_0_8px_rgba(166,255,0,0.5)]" /> Online agora
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="px-3 md:px-4 py-2 md:py-2.5 bg-mecura-surface border border-mecura-elevated rounded-xl text-xs md:text-sm font-medium hover:bg-mecura-surface-light transition-colors flex items-center gap-1 md:gap-2 text-white whitespace-nowrap"
              >
                <FileText className="w-3 h-3 md:w-4 md:h-4 text-mecura-silver" /> <span className="hidden md:inline">Histórico</span>
              </button>
              <button 
                onClick={() => setShowPrescriptionModal(true)}
                className="px-3 md:px-5 py-2 md:py-2.5 bg-mecura-neon text-black rounded-xl text-xs md:text-sm font-bold hover:bg-[#b5ff33] transition-colors flex items-center gap-1 md:gap-2 shadow-[0_0_20px_rgba(166,255,0,0.15)] whitespace-nowrap"
              >
                <PlusCircle className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Prescrever</span>
              </button>
              <button 
                onClick={handleGeneratePDF}
                className="px-3 md:px-5 py-2 md:py-2.5 bg-mecura-surface border border-mecura-elevated rounded-xl text-xs md:text-sm font-medium hover:bg-mecura-surface-light transition-colors flex items-center gap-1 md:gap-2 text-white whitespace-nowrap"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4 text-mecura-silver" /> <span className="hidden md:inline">PDF</span>
              </button>
              <button 
                onClick={handleFinishConsultation}
                className="px-3 md:px-5 py-2 md:py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs md:text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap"
              >
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Finalizar</span>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 z-0">
            <div className="flex justify-center mb-6 md:mb-8">
              <span className="text-xs font-medium text-mecura-silver bg-mecura-surface/50 px-4 py-1.5 rounded-full border border-mecura-elevated backdrop-blur-sm">
                Consulta iniciada hoje
              </span>
            </div>
            
            <div>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col w-full ${msg.sender === 'doctor' ? 'items-end' : 'items-start'}`}
                >
                  {msg.type === 'product' && msg.productData ? (
                    <div className={`w-[95%] md:w-[85%] max-w-2xl rounded-xl overflow-hidden mb-2 shadow-sm relative group ${msg.sender === 'doctor' ? 'bg-mecura-neon/10 border border-mecura-neon/20' : 'bg-[#F3F4F6]'}`}>
                      <div className="p-4 md:p-5 flex flex-col">
                        {/* Top Section */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                          {/* Image */}
                          <div className="w-full md:w-20 h-32 md:h-28 bg-white rounded-lg p-2 flex-shrink-0 flex items-center justify-center relative shadow-sm">
                            <img 
                              src={msg.productData.image || "https://placehold.co/400x400/f8fafc/0f172a?text=CBD"} 
                              alt={msg.productData.name} 
                              referrerPolicy="no-referrer" 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
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
                            <h3 className={`${msg.sender === 'doctor' ? 'text-white' : 'text-black'} font-bold text-base leading-tight mb-2`}>{msg.productData.name}</h3>
                            <ul className={`${msg.sender === 'doctor' ? 'text-mecura-pearl' : 'text-gray-600'} text-xs space-y-1 mb-2`}>
                              {msg.productData.details.map((detail, idx) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                            {msg.productData.italicText && (
                              <p className={`${msg.sender === 'doctor' ? 'text-mecura-silver' : 'text-gray-500'} text-xs italic mt-1`}>
                                {msg.productData.italicText}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Middle Section: Brand & Origin */}
                        <div className={`flex justify-between items-center border-t border-b ${msg.sender === 'doctor' ? 'border-mecura-neon/20' : 'border-gray-200'} py-3 mb-4`}>
                          <span className={`text-sm font-medium ${msg.sender === 'doctor' ? 'text-mecura-pearl' : 'text-gray-700'}`}>® {msg.productData.brand}</span>
                          <span className={`text-sm ${msg.sender === 'doctor' ? 'text-mecura-pearl' : 'text-gray-700'} flex items-center gap-1`}>
                            🇺🇸 {msg.productData.origin}
                          </span>
                        </div>

                        {/* Bottom Section: Dosage */}
                        <div>
                          <h4 className="text-[#58D68D] font-bold text-sm mb-2">
                            Iniciar tratamento com:
                          </h4>
                          <ul className={`${msg.sender === 'doctor' ? 'text-white' : 'text-black'} text-sm space-y-1 mb-4`}>
                            {msg.productData.dosage.map((dose, idx) => (
                              <li key={idx}>
                                {dose}
                              </li>
                            ))}
                          </ul>
                          <p className={`${msg.sender === 'doctor' ? 'text-mecura-silver' : 'text-gray-500'} text-xs leading-relaxed`}>
                            {msg.productData.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : msg.type === 'prescription_notes' ? (
                    <div className="w-[85%] max-w-2xl bg-mecura-surface border border-mecura-neon/30 rounded-2xl p-6 mb-2 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <PlusCircle className="w-12 h-12 text-mecura-neon" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20">
                            <FileText className="w-5 h-5 text-mecura-neon" />
                          </div>
                          <h3 className="text-white font-bold text-lg">Prescrição e Orientações</h3>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                          <p className="text-mecura-pearl text-base leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-mecura-elevated flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-mecura-neon" />
                          <span className="text-xs text-mecura-silver font-medium uppercase tracking-wider">Item adicionado à receita final</span>
                        </div>
                      </div>
                    </div>
                  ) : msg.type === 'prescription' ? (
                    <div className="w-[70%] max-w-xl bg-gradient-to-r from-mecura-surface to-mecura-surface-light border border-mecura-neon/30 rounded-2xl p-5 mb-2 shadow-lg relative overflow-hidden">
                      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-mecura-neon/5 to-transparent" />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20">
                          <FileText className="w-6 h-6 text-mecura-neon" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm mb-0.5">Receita Digital Enviada</h3>
                          <p className="text-mecura-silver text-xs">O paciente já pode acessar e baixar o PDF.</p>
                        </div>
                      </div>
                    </div>
                  ) : msg.type === 'acompanhamento_card' ? (
                    <div className="w-[85%] max-w-xl bg-gradient-to-br from-[#1A1A26] to-[#0A0A0F] border border-mecura-neon/40 rounded-3xl p-6 mb-2 relative overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                      <div className="absolute -top-16 -right-16 w-32 h-32 bg-mecura-neon/20 blur-[50px] rounded-full" />
                      
                      <div className="relative z-10">
                        <h2 className="text-mecura-neon font-bold text-2xl mb-4 flex items-center gap-2">
                          🚀 Dê o próximo passo!
                        </h2>
                        <p className="text-white text-base leading-relaxed mb-6">
                          Estruture seu tratamento com segurança e profissionalismo. Tenha acesso a consultas personalizadas, laudo médico e acompanhamento contínuo.
                        </p>
                        
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 text-base text-white">
                            <div className="w-6 h-6 rounded-full bg-mecura-neon/10 flex items-center justify-center text-mecura-neon">✅</div>
                            Consulta individualizada
                          </div>
                          <div className="flex items-center gap-3 text-base text-white">
                            <div className="w-6 h-6 rounded-full bg-mecura-neon/10 flex items-center justify-center text-mecura-neon">✅</div>
                            Laudo médico inicial
                          </div>
                          <div className="flex items-center gap-3 text-base text-white">
                            <div className="w-6 h-6 rounded-full bg-mecura-neon/10 flex items-center justify-center text-mecura-neon">✅</div>
                            Retorno em 90 dias
                          </div>
                        </div>

                        <details className="group mb-6">
                          <summary className="text-mecura-neon text-base font-bold cursor-pointer hover:underline list-none flex items-center gap-2">
                            Ler mais <span className="text-sm group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <div className="mt-4 space-y-4 text-white text-sm leading-relaxed">
                            <p>Você já deu o primeiro passo. Agora é hora de avançar no tratamento.</p>
                            <p>Queremos te oferecer um acompanhamento mais profundo e totalmente personalizado para o seu caso. Através de consultas por videochamada, vamos estruturar seu tratamento com segurança, desde o início até a evolução dos resultados. Com o seu laudo médico, você garante muito mais do que um documento — você conquista um documento essencial para entrada em cultivos legais e comprova seu acesso seguro ao tratamento com cannabis medicinal no Brasil. Não pare na receita — sem o laudo, seu acesso ao tratamento fica limitado.</p>
                            <p><strong className="text-mecura-neon">Isso inclui:</strong></p>
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
                    <div className="w-full flex flex-col items-end mb-2">
                      <div className="w-[75%] max-w-xl flex flex-col gap-3">
                        <button 
                          onClick={() => {
                            setSelectedOffer('premium');
                            navigate('/premium-checkout');
                          }}
                          className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:bg-[#E5C048] transition-colors"
                        >
                          Desejo dar o Próximo Passo
                        </button>
                        <button 
                          onClick={() => addMessage({ text: "Entendido. Fico à disposição caso mude de ideia.", sender: 'doctor' })}
                          className="w-full py-4 bg-red-500/10 text-red-500 font-bold rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          Adiar meu Tratamento
                        </button>
                        <button 
                          onClick={() => { resetConsultation(); navigate('/onboarding'); }}
                          className="w-full py-4 bg-mecura-neon text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(166,255,0,0.2)] hover:bg-[#b5ff33] transition-colors"
                        >
                          NOVA CONSULTA
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                        msg.sender === 'doctor' 
                          ? 'bg-mecura-neon/10 text-white rounded-tr-sm border border-mecura-neon/20' 
                          : 'bg-mecura-surface text-mecura-pearl rounded-tl-sm border border-mecura-elevated'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed">{msg.text}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 px-1">
                    <span className="text-[11px] text-mecura-silver font-medium">
                      {format(msg.timestamp, 'HH:mm')}
                    </span>
                    {msg.sender === 'doctor' && <CheckCheck className="w-4 h-4 text-mecura-neon" />}
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-[#0A0A0F]/80 backdrop-blur-md border-t border-mecura-elevated z-10 flex flex-col gap-3">
            {/* Doctor Smart Replies */}
            <div className="max-w-5xl mx-auto w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-[10px] text-mecura-silver uppercase tracking-wider font-bold whitespace-nowrap mr-2">Respostas Rápidas:</span>
              <button 
                onClick={() => handleDoctorAction('prescribe')}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-mecura-surface border border-mecura-elevated text-xs text-white hover:border-mecura-neon/50 transition-colors"
              >
                Explicar Eficácia
              </button>
              <button 
                onClick={() => handleDoctorAction('ask_approval')}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-mecura-surface border border-mecura-elevated text-xs text-white hover:border-mecura-neon/50 transition-colors"
              >
                Pedir Aprovação
              </button>
              <button 
                onClick={() => handleDoctorAction('ask_doubt')}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-mecura-surface border border-mecura-elevated text-xs text-white hover:border-mecura-neon/50 transition-colors"
              >
                Dúvida
              </button>
              <button 
                onClick={() => handleDoctorAction('acompanhamento')}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-mecura-neon/10 border border-mecura-neon/50 text-xs text-mecura-neon hover:bg-mecura-neon/20 transition-colors"
              >
                Acompanhamento
              </button>
            </div>

            {pendingAttachment && (
              <div className="max-w-5xl mx-auto mb-4">
                <div className="inline-flex items-center gap-4 bg-mecura-surface border border-mecura-neon/30 rounded-xl p-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-mecura-neon/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-mecura-neon" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[200px]">{pendingAttachment.name}</p>
                      <p className="text-xs text-mecura-silver">Aguardando envio...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 pl-4 border-l border-mecura-elevated">
                    <button 
                      onClick={() => setPendingAttachment(null)}
                      className="p-2 hover:bg-white/10 rounded-lg text-mecura-silver hover:text-white transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        addMessage({
                          sender: 'doctor',
                          type: 'prescription',
                          attachment: pendingAttachment
                        });
                        setPendingAttachment(null);
                      }}
                      className="px-4 py-2 bg-mecura-neon text-black text-sm font-bold rounded-lg hover:bg-[#b5ff33] transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Enviar Receita
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 max-w-5xl mx-auto">
              <div className="relative">
                <button 
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="w-12 h-12 rounded-full bg-mecura-surface border border-mecura-elevated flex items-center justify-center text-mecura-silver hover:text-mecura-neon hover:border-mecura-neon/50 transition-all hover:scale-105"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
                
                {/* Attachment Menu */}
                {showAttachmentMenu && (
                  <div
                    className="absolute bottom-full left-0 mb-4 w-56 bg-mecura-surface border border-mecura-elevated rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <button 
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        // Small delay to ensure menu closes smoothly before opening file picker
                        setTimeout(() => fileInputRef.current?.click(), 50);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-mecura-pearl hover:bg-mecura-surface-light hover:text-white transition-colors border-b border-mecura-elevated"
                    >
                      <FileText className="w-4 h-4 text-mecura-silver" />
                      Adicionar Receita
                    </button>
                    <button 
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        setShowProductSearchModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-mecura-pearl hover:bg-mecura-surface-light hover:text-white transition-colors"
                    >
                      <Search className="w-4 h-4 text-mecura-silver" />
                      Buscar produto
                    </button>
                  </div>
                )}

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,image/*" 
                />
              </div>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua mensagem para o paciente..." 
                className="flex-1 h-12 md:h-14 bg-mecura-surface border border-mecura-elevated rounded-full px-4 md:px-6 text-white focus:outline-none focus:border-mecura-neon/50 focus:bg-mecura-surface-light transition-all text-sm md:text-[15px]"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() && !pendingAttachment}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-mecura-neon text-black flex items-center justify-center hover:bg-[#b5ff33] transition-all shadow-[0_0_20px_rgba(166,255,0,0.2)] disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
        </>
      ) : activeView === 'guide' ? (
        <CBDGuideView />
      ) : (
        <DoctorAnalyticsDashboard />
      )}

      {/* Right Sidebar - Patient Record (Anamnese) */}
      <div className={`w-full md:w-96 bg-[#0A0A0F] border-t md:border-t-0 md:border-l border-mecura-elevated flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-10 ${!currentPatient ? 'hidden md:flex' : 'flex md:flex'}`}>
        <div className="p-4 md:p-6 border-b border-mecura-elevated bg-mecura-surface/20 flex justify-between items-center">
          <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-mecura-neon" />
            Ficha do Paciente
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* AI Analysis Button */}
          <div className="space-y-4">
            <div 
              onClick={handleGenerateAnalysis}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateAnalysis()}
              className={`w-full cursor-pointer relative overflow-hidden group bg-gradient-to-r from-mecura-surface to-mecura-surface-light border rounded-2xl p-4 flex items-center gap-4 transition-all shadow-[0_4px_20px_rgba(166,255,0,0.05)] hover:shadow-[0_4px_25px_rgba(166,255,0,0.15)] ${expandAnalysis ? 'border-mecura-neon' : 'border-mecura-neon/30 hover:border-mecura-neon'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/0 via-mecura-neon/5 to-mecura-neon/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20 flex-shrink-0">
                <BrainCircuit className="w-6 h-6 text-mecura-neon" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-bold text-base mb-0.5">Análise Clínica IA</h3>
                <p className="text-mecura-silver text-sm">Sugestões de tratamento baseadas em evidências</p>
              </div>
              <div className="flex items-center gap-2">
                {analysisResult && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAnalysisModal(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg text-mecura-silver hover:text-mecura-neon transition-colors"
                    title="Expandir Análise"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                )}
                {analysisResult && (
                  <ChevronDown className={`w-6 h-6 text-mecura-silver transition-transform duration-300 ${expandAnalysis ? 'rotate-180' : ''}`} />
                )}
              </div>
            </div>

            {expandAnalysis && (
              <div className="bg-mecura-surface/30 border border-mecura-elevated rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-5">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-mecura-surface-light" />
                        <div className="w-12 h-12 rounded-full border-2 border-mecura-neon border-t-transparent animate-spin absolute inset-0" />
                        <BrainCircuit className="w-4 h-4 text-mecura-neon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-sm">Analisando perfil...</p>
                        <p className="text-[10px] text-mecura-silver mt-1">Cruzando evidências científicas</p>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div className="markdown-body text-white text-[13px] leading-relaxed space-y-4">
                        <Markdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-3 mt-6 pb-1 border-b border-mecura-elevated" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-base font-bold text-mecura-neon mb-3 mt-6" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-[14px] font-bold text-white mb-2 mt-4" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 leading-relaxed opacity-90" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-mecura-neon" {...props} />,
                            li: ({node, ...props}) => <li className="text-[13px] opacity-90" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-mecura-neon" {...props} />,
                            table: ({node, ...props}) => (
                              <div className="overflow-x-auto my-6">
                                <table className="w-full text-left border-collapse bg-mecura-surface/50 rounded-xl overflow-hidden" {...props} />
                              </div>
                            ),
                            thead: ({node, ...props}) => <thead className="bg-mecura-surface-light/50" {...props} />,
                            th: ({node, ...props}) => <th className="p-3 text-xs font-bold text-mecura-neon uppercase tracking-wider border-b border-mecura-elevated" {...props} />,
                            td: ({node, ...props}) => <td className="p-3 text-[12px] border-b border-mecura-elevated/50" {...props} />,
                          }}
                        >
                          {analysisResult}
                        </Markdown>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-mecura-elevated">
                        <h4 className="text-sm font-bold text-white mb-3">Medicamentos Sugeridos</h4>
                        <div className="space-y-2">
                          {parseMedications(analysisResult).filter(med => med.name).map((med, idx) => (
                            <button
                              key={idx}
                              onClick={() => addPrescribedMedication(med)}
                              className="w-full p-3 bg-mecura-surface border border-mecura-elevated rounded-xl text-left hover:border-mecura-neon/50 transition-all group"
                            >
                              <h5 className="font-bold text-white text-xs mb-0.5 group-hover:text-mecura-neon">{med.name}</h5>
                              <p className="text-[10px] text-mecura-silver">{med.dosage}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-mecura-elevated flex items-start gap-2">
                        <Activity className="w-4 h-4 text-mecura-neon mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-mecura-silver italic leading-tight">
                          Ferramenta de suporte à decisão clínica. A responsabilidade final pela prescrição e diagnóstico é exclusiva do médico assistente.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
                {analysisResult && !isAnalyzing && (
                  <button 
                    onClick={() => setExpandAnalysis(false)}
                    className="w-full py-2 bg-mecura-surface-light/50 text-[10px] text-mecura-silver hover:text-white transition-colors border-t border-mecura-elevated"
                  >
                    Recolher Análise
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section: Objectives */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Objetivos Principais
            </h3>
            <div className="flex flex-wrap gap-2">
              {(currentPatient?.answers?.objectives || answers?.objectives)?.length ? (
                (currentPatient?.answers?.objectives || answers.objectives).map((obj: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon rounded-lg text-base font-medium shadow-[0_0_10px_rgba(166,255,0,0.05)]">
                    {obj}
                  </span>
                ))
              ) : (
                <span className="px-4 py-2 bg-mecura-surface border border-mecura-elevated text-mecura-silver rounded-lg text-base">Nenhum objetivo selecionado</span>
              )}
            </div>
          </section>

          {/* Section: Details */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4">
              Detalhes do Sintoma
            </h3>
            <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-mecura-elevated/50 pb-4">
                <span className="text-base text-mecura-silver">Intensidade</span>
                <span className="text-base font-bold text-white bg-mecura-surface-light px-3 py-1.5 rounded-md">{(currentPatient?.answers?.intensity || answers?.intensity) || '-'} / 10</span>
              </div>
              <div className="flex justify-between items-center border-b border-mecura-elevated/50 pb-4">
                <span className="text-base text-mecura-silver">Duração</span>
                <span className="text-base font-bold text-white capitalize">{(currentPatient?.answers?.duration || answers?.duration) || 'Não informada'}</span>
              </div>
              <div className="pt-1">
                <span className="text-sm text-mecura-silver block mb-2">Descrição Adicional</span>
                <p className="text-base text-mecura-pearl leading-relaxed bg-mecura-surface-light/50 p-4 rounded-xl border border-mecura-elevated/50">
                  {(currentPatient?.answers?.description || answers?.description) || "Nenhuma descrição adicional fornecida."}
                </p>
              </div>
            </div>
          </section>

          {/* Section: Physical */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4">
              Físico
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-sm text-mecura-silver mb-2">Altura</span>
                <span className="text-lg font-bold text-white">{(currentPatient?.answers?.height || answers?.height) ? `${(currentPatient?.answers?.height || answers?.height)}m` : '-'}</span>
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-sm text-mecura-silver mb-2">Peso</span>
                <span className="text-lg font-bold text-white">{(currentPatient?.answers?.weight || answers?.weight) ? `${(currentPatient?.answers?.weight || answers?.weight)}kg` : '-'}</span>
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <span className="text-sm text-mecura-silver mb-2">Sexo</span>
                <span className="text-lg font-bold text-white">{(currentPatient?.answers?.sex || answers?.sex) || '-'}</span>
              </div>
            </div>
          </section>

          {/* Section: Health & Social */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4">
              Saúde & Social
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5">
                <span className="text-sm text-mecura-silver block mb-2">Tratamento Atual</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.tratamento_atual || answers?.tratamento_atual) ? 'text-mecura-neon' : 'text-white'}`}>{(currentPatient?.answers?.tratamento_atual || answers?.tratamento_atual) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5">
                <span className="text-sm text-mecura-silver block mb-2">Uso de Remédios</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.remedios || answers?.remedios) ? 'text-mecura-neon' : 'text-white'}`}>{(currentPatient?.answers?.remedios || answers?.remedios) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5">
                <span className="text-sm text-mecura-silver block mb-2">Doença Crônica</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.doenca_cronica || answers?.doenca_cronica) ? 'text-mecura-neon' : 'text-white'}`}>{(currentPatient?.answers?.doenca_cronica || answers?.doenca_cronica) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5">
                <span className="text-sm text-mecura-silver block mb-2">Já usou Cannabis</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.cannabis || answers?.cannabis) ? 'text-mecura-neon' : 'text-white'}`}>{(currentPatient?.answers?.cannabis || answers?.cannabis) ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      </div>

      {/* AI Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            onClick={() => setShowAnalysisModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <div 
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0A0A0F] border border-mecura-elevated rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
              {/* Modal Header */}
              <div className="p-8 border-b border-mecura-elevated bg-mecura-surface/50 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20">
                    <BrainCircuit className="w-6 h-6 text-mecura-neon" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Análise Clínica Assistida por IA</h2>
                    <p className="text-sm text-mecura-silver">Suporte à decisão médica baseado em evidências científicas</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAnalysisModal(false)}
                  className="w-12 h-12 rounded-full bg-mecura-surface hover:bg-mecura-surface-light flex items-center justify-center text-mecura-silver hover:text-white transition-all hover:scale-110 active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="prose prose-invert prose-mecura max-w-none">
                  <div className="markdown-body text-white text-[16px] leading-relaxed space-y-8">
                    <Markdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mb-6 mt-10 pb-3 border-b border-mecura-elevated" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-mecura-neon mb-6 mt-10" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mb-4 mt-8" {...props} />,
                        p: ({node, ...props}) => <p className="mb-6 leading-relaxed opacity-95 text-[16px]" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-8 mb-6 space-y-3 marker:text-mecura-neon" {...props} />,
                        li: ({node, ...props}) => <li className="text-[16px] opacity-95" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-mecura-neon" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-10 shadow-2xl rounded-2xl border border-mecura-elevated">
                            <table className="w-full text-left border-collapse bg-mecura-surface/30" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-mecura-surface-light/50" {...props} />,
                        th: ({node, ...props}) => <th className="p-5 text-sm font-bold text-mecura-neon uppercase tracking-widest border-b border-mecura-elevated" {...props} />,
                        td: ({node, ...props}) => <td className="p-5 text-[15px] border-b border-mecura-elevated/50" {...props} />,
                      }}
                    >
                      {analysisResult || ''}
                    </Markdown>
                  </div>
                </div>
                
                {analysisResult && (
                  <div className="mt-8 pt-8 border-t border-mecura-elevated">
                    <h3 className="text-xl font-bold text-white mb-6">Medicamentos Sugeridos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parseMedications(analysisResult).filter(med => med.name).map((med, idx) => (
                        <button
                          key={idx}
                          onClick={() => addPrescribedMedication(med)}
                          className="p-4 bg-mecura-surface border border-mecura-elevated rounded-xl text-left hover:border-mecura-neon/50 transition-all group"
                        >
                          <h4 className="font-bold text-white mb-1 group-hover:text-mecura-neon">{med.name}</h4>
                          <p className="text-xs text-mecura-silver mb-2">{med.dosage}</p>
                          <span className="text-[10px] font-bold text-mecura-neon uppercase">Adicionar ao Chat</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div className="p-8 border-t border-mecura-elevated bg-mecura-surface/30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-mecura-neon" />
                  <p className="text-sm text-mecura-silver italic">
                    Lembrete: A IA é uma ferramenta de suporte. A decisão final é sempre do médico prescritor.
                  </p>
                </div>
                <button 
                  onClick={() => setShowAnalysisModal(false)}
                  className="px-8 py-3 bg-mecura-surface border border-mecura-elevated rounded-xl text-base font-bold text-white hover:bg-mecura-surface-light transition-all hover:scale-105 active:scale-95"
                >
                  Fechar Análise
                </button>
              </div>
            </div>
        </div>
      )}

      {/* Prescription Modal (Notes + Guide) */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPrescriptionModal(false)}
          />
          <div className="relative w-full max-w-2xl bg-mecura-surface border border-mecura-elevated rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-mecura-elevated flex justify-between items-center bg-mecura-surface-light/30">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-mecura-neon" />
                Nova Prescrição
              </h3>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="p-2 hover:bg-white/5 rounded-full text-mecura-silver transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-3">
                <label className="text-sm font-bold text-mecura-silver uppercase tracking-wider">
                  Orientações e Prescrição Detalhada
                </label>
                <textarea 
                  value={prescriptionInput}
                  onChange={(e) => setPrescriptionInput(e.target.value)}
                  placeholder="Digite aqui as orientações de uso, medicamentos manipulados ou qualquer outra informação que deva constar na receita..."
                  className="w-full h-48 bg-mecura-surface-light/50 border border-mecura-elevated rounded-xl p-4 text-white focus:outline-none focus:border-mecura-neon/50 transition-all resize-none text-base leading-relaxed"
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-mecura-elevated" />
                  <span className="text-xs font-bold text-mecura-silver uppercase">Ou</span>
                  <div className="h-px flex-1 bg-mecura-elevated" />
                </div>
                
                <button 
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setShowProductSearchModal(true);
                  }}
                  className="w-full py-4 bg-mecura-surface-light border border-mecura-elevated rounded-xl text-white font-bold hover:bg-mecura-surface transition-all flex items-center justify-center gap-3 group"
                >
                  <Search className="w-5 h-5 text-mecura-neon group-hover:scale-110 transition-transform" />
                  Buscar Produto no Guia de Cannabis
                </button>
              </div>
            </div>
            
            <div className="p-6 border-t border-mecura-elevated bg-mecura-surface-light/20 flex gap-3">
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="flex-1 py-3 bg-transparent border border-mecura-elevated rounded-xl text-white font-bold hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handlePrescribeNotes}
                disabled={!prescriptionInput.trim()}
                className="flex-[2] py-3 bg-mecura-neon text-black rounded-xl font-bold hover:bg-[#b5ff33] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(166,255,0,0.1)]"
              >
                Confirmar Prescrição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Search Modal */}
      {showProductSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowProductSearchModal(false);
              setSelectedProduct(null);
            }}
          />
          <div
            className="relative w-full max-w-2xl bg-mecura-surface border border-mecura-elevated rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
              <div className="p-6 border-b border-mecura-elevated flex justify-between items-center bg-mecura-surface-light/30">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-mecura-neon" />
                  {selectedProduct ? 'Prescrever Produto' : 'Buscar Produto no Guia'}
                </h3>
                <button 
                  onClick={() => {
                    setShowProductSearchModal(false);
                    setSelectedProduct(null);
                  }}
                  className="p-2 rounded-lg text-mecura-silver hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!selectedProduct ? (
                <>
                  <div className="p-4 border-b border-mecura-elevated">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mecura-silver" />
                      <input
                        type="text"
                        placeholder="Buscar por nome, fabricante ou tipo..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl py-3 pl-10 pr-4 text-white placeholder-mecura-silver focus:outline-none focus:border-mecura-neon/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {cbdGuideData.flatMap(cat => cat.products)
                      .filter(p => 
                        p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                        p.manufacturer.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                        p.type.toLowerCase().includes(productSearchTerm.toLowerCase())
                      )
                      .map((product, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setSelectedProduct(product)}
                          className="p-4 rounded-xl border border-mecura-elevated bg-[#0A0A0F] hover:border-mecura-neon/50 cursor-pointer transition-all flex justify-between items-center group"
                        >
                          <div>
                            <h4 className="text-white font-bold group-hover:text-mecura-neon transition-colors">{product.name}</h4>
                            <p className="text-xs text-mecura-silver mt-1">{product.manufacturer} • {product.type}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 bg-mecura-surface-light rounded-md text-mecura-silver border border-white/5">
                              {product.origin}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                  <div className="p-4 rounded-xl border border-mecura-elevated bg-[#0A0A0F]">
                    <h4 className="text-white font-bold text-lg">{selectedProduct.name}</h4>
                    <p className="text-sm text-mecura-silver mt-1">{selectedProduct.manufacturer} • {selectedProduct.type}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-mecura-silver mb-2">
                        Dosagem / Modo de usar
                      </label>
                      <input
                        type="text"
                        value={dosageInput}
                        onChange={(e) => setDosageInput(e.target.value)}
                        placeholder="Ex: 10 gotas sublingual"
                        className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-4 text-white placeholder-mecura-silver focus:outline-none focus:border-mecura-neon/50 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-mecura-silver mb-2">
                        Períodos
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['De manhã', 'Depois do almoço', 'De tarde', 'Antes de dormir'].map(period => (
                          <label key={period} className="flex items-center gap-2 text-sm text-mecura-pearl bg-[#0A0A0F] border border-mecura-elevated p-3 rounded-xl cursor-pointer hover:border-mecura-neon/50">
                            <input type="checkbox" className="accent-mecura-neon" />
                            {period}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mecura-silver mb-2">
                        Via de Administração e Instruções
                      </label>
                      <select 
                        className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-4 text-white focus:outline-none focus:border-mecura-neon/50 transition-colors mb-4"
                        onChange={(e) => {
                          const instructions = document.getElementById('admin-instructions') as HTMLDivElement;
                          instructions.textContent = e.target.value;
                        }}
                      >
                        <option value="">Selecione a via...</option>
                        <option value="Sublingual (óleo de cannabis)&#10;Depositar as gotas sob a língua&#10;Manter por 60-90 segundos antes de engolir&#10;Evitar ingerir alimentos ou líquidos logo após&#10;Iniciar com dose baixa e ajustar gradualmente">Sublingual (óleo de cannabis)</option>
                        <option value="Oral (cápsulas / comestíveis)&#10;Ingerir a dose com água ou conforme orientação&#10;Pode ser consumido junto com alimentos&#10;O efeito pode levar de 30 minutos a 2 horas&#10;Evitar repetir a dose antes do tempo de ação">Oral (cápsulas / comestíveis)</option>
                        <option value="Inalação (vaporizador)&#10;Inalar lentamente o vapor&#10;Segurar por alguns segundos antes de expirar&#10;Efeito rápido (poucos minutos)&#10;Iniciar com pequenas quantidades">Inalação (vaporizador)</option>
                        <option value="Tópico (cremes / pomadas com cannabis)&#10;Aplicar na região desejada&#10;Massagear até completa absorção&#10;Uso local para alívio de dor ou inflamação&#10;Não aplicar em feridas abertas">Tópico (cremes / pomadas com cannabis)</option>
                        <option value="Transdérmico (adesivo com cannabis)&#10;Aplicar sobre pele limpa, seca e sem pelos&#10;Pressionar por alguns segundos para fixação&#10;Liberação gradual ao longo do tempo&#10;Trocar conforme orientação do fabricante">Transdérmico (adesivo com cannabis)</option>
                        <option value="Supositórios (uso retal ou vaginal)&#10;Aplicar conforme orientação profissional&#10;Preferencialmente antes de repouso&#10;Pode proporcionar absorção mais eficiente em alguns casos&#10;Manter higiene adequada antes e após uso">Supositórios (uso retal ou vaginal)</option>
                      </select>
                      <div id="admin-instructions" className="text-xs text-mecura-silver bg-[#0A0A0F] p-3 rounded-xl border border-mecura-elevated whitespace-pre-line min-h-[80px]">
                        Selecione uma via para ver as instruções.
                      </div>
                    </div>

                    <div className="text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                      <p className="font-bold mb-1">⚠️ BLOCO IMPORTANTE</p>
                      <p>Uso sob orientação de profissional de saúde<br/>Pode causar sonolência<br/>Evitar dirigir ou operar máquinas<br/>Manter fora do alcance de crianças</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-mecura-elevated">
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={handleSendProduct}
                      disabled={!dosageInput.trim()}
                      className="px-5 py-2.5 bg-mecura-neon text-black rounded-xl text-sm font-bold hover:bg-[#b5ff33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(166,255,0,0.2)]"
                    >
                      Enviar Prescrição
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowHistoryModal(false);
                setSelectedHistoryItem(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A0A0F] border border-mecura-elevated rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-mecura-elevated flex items-center justify-between bg-mecura-surface/20">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Histórico de Consultas</h2>
                  <p className="text-mecura-silver text-sm mt-1">Busque e visualize atendimentos anteriores</p>
                </div>
                <button 
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedHistoryItem(null);
                  }}
                  className="w-10 h-10 rounded-full bg-mecura-surface flex items-center justify-center text-mecura-silver hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 border-b border-mecura-elevated">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-mecura-silver" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome do paciente..." 
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="w-full bg-mecura-surface border border-mecura-elevated rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-mecura-neon/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {!selectedHistoryItem ? (
                  <>
                    {useStore.getState().consultationHistory
                      .filter(h => h.patientName.toLowerCase().includes(historySearchTerm.toLowerCase()))
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((history) => (
                        <div 
                          key={history.id} 
                          onClick={() => setSelectedHistoryItem(history)}
                          className="p-5 rounded-2xl bg-mecura-surface/30 border border-mecura-elevated hover:border-mecura-neon/30 transition-all group cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-white text-lg">{history.patientName}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-mecura-silver flex items-center gap-1">
                                  <Activity className="w-3 h-3" /> {format(history.date, 'dd/MM/yyyy')}
                                </span>
                                <span className="text-xs text-mecura-silver flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" /> {history.messages.length} mensagens
                                </span>
                              </div>
                            </div>
                            <button className="p-2 rounded-xl bg-mecura-surface text-mecura-neon opacity-0 group-hover:opacity-100 transition-all">
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-sm text-mecura-silver leading-relaxed italic">
                            "{history.summary}"
                          </p>
                          <div className="mt-4 pt-4 border-t border-mecura-elevated/50 flex flex-wrap gap-2">
                            {history.messages.filter(m => m.type === 'prescription' || m.type === 'product').map((m, i) => (
                              <span key={i} className="px-2 py-1 rounded-md bg-mecura-neon/10 text-mecura-neon text-[10px] font-bold uppercase tracking-wider">
                                Prescrição Enviada
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    
                    {useStore.getState().consultationHistory.filter(h => h.patientName.toLowerCase().includes(historySearchTerm.toLowerCase())).length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-mecura-surface flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-mecura-elevated" />
                        </div>
                        <p className="text-mecura-silver">Nenhum histórico encontrado para esta busca.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button 
                      onClick={() => setSelectedHistoryItem(null)}
                      className="flex items-center gap-2 text-mecura-neon hover:underline text-sm font-medium mb-4"
                    >
                      <PlusCircle className="w-4 h-4 rotate-45" /> Voltar para a lista
                    </button>

                    {/* Evolution Chart */}
                    <div className="p-6 rounded-3xl bg-mecura-surface/30 border border-mecura-elevated">
                      <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-mecura-neon" /> Gráfico de Evolução (Intensidade dos Sintomas)
                      </h4>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={useStore.getState().consultationHistory
                              .filter(h => h.patientName === selectedHistoryItem.patientName)
                              .sort((a, b) => a.date.getTime() - b.date.getTime())
                              .map(h => ({
                                date: format(h.date, 'dd/MM'),
                                intensity: h.intensity || 0
                              }))
                            }
                          >
                            <defs>
                              <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00F2FF" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00F2FF" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2D" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid #1E1E2D', borderRadius: '12px' }}
                              itemStyle={{ color: '#00F2FF' }}
                            />
                            <Area type="monotone" dataKey="intensity" stroke="#00F2FF" strokeWidth={3} fillOpacity={1} fill="url(#colorIntensity)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-mecura-silver text-center mt-4 uppercase tracking-widest">
                        Escala de 0 a 10 (Menor valor indica melhora)
                      </p>
                    </div>

                    {/* Prescriptions & Orientations */}
                    <div className="space-y-6">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-mecura-neon" /> Prescrições e Orientações
                      </h4>
                      
                      {selectedHistoryItem.messages
                        .filter(m => m.type === 'prescription' || m.type === 'product' || m.type === 'prescription_notes')
                        .map((msg: any, idx: number) => (
                          <div key={idx} className="p-6 rounded-2xl bg-mecura-surface/50 border border-mecura-elevated">
                            {msg.type === 'product' && msg.productData && (
                              <div className="flex gap-4">
                                <img src={msg.productData.image || "https://images.unsplash.com/photo-1608681286823-3801264b321a?q=80&w=400&auto=format&fit=crop"} alt={msg.productData.name} referrerPolicy="no-referrer" className="w-20 h-20 rounded-xl object-cover border border-mecura-elevated" />
                                <div>
                                  <h5 className="text-white font-bold">{msg.productData.name}</h5>
                                  <p className="text-xs text-mecura-neon mt-1">{msg.productData.brand}</p>
                                  <div className="mt-2 space-y-1">
                                    {msg.productData.dosage.map((d: string, i: number) => (
                                      <p key={i} className="text-xs text-mecura-silver">• {d}</p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            {msg.type === 'prescription' && (
                              <div className="prose prose-invert prose-sm max-w-none">
                                <Markdown>{msg.text}</Markdown>
                              </div>
                            )}
                            {msg.type === 'prescription_notes' && (
                              <div className="mt-4 p-4 rounded-xl bg-mecura-neon/5 border border-mecura-neon/20">
                                <p className="text-xs font-bold text-mecura-neon uppercase mb-2">Orientações Médicas</p>
                                <p className="text-sm text-mecura-silver leading-relaxed">{msg.text}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      
                      {selectedHistoryItem.messages.filter(m => m.type === 'prescription' || m.type === 'product' || m.type === 'prescription_notes').length === 0 && (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-mecura-elevated">
                          <p className="text-mecura-silver text-sm">Nenhuma receita ou orientação registrada nesta consulta.</p>
                        </div>
                      )}
                    </div>

                    {/* Full Summary */}
                    <div className="p-6 rounded-2xl bg-mecura-surface/20 border border-mecura-elevated">
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-mecura-neon" /> Resumo Clínico
                      </h4>
                      <p className="text-mecura-silver text-sm leading-relaxed">
                        {selectedHistoryItem.summary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
