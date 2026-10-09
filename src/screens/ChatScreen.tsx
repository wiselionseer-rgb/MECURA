import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, Message } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Send, FileText, FileCheck, Sprout, Paperclip, CheckCheck, Download, ChevronLeft, ShoppingCart, User, Eye, PlusCircle, CheckCircle, Droplets, MessageCircle, Star, Check, ShieldCheck, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { generatePrescriptionPDF, generateMedicalReportPDF, generatePsychomotorReportPDF, generateAgronomicReportPDF } from '../utils/pdfGenerator';
import { downloadOrGenerateAttachment, deliverPdfBlob } from '../utils/downloadHelper';
import { requestNotificationPermission, subscribeToBackgroundNotifications } from '../utils/notifications';

import { auth } from '../firebase';

export function ChatScreen() {
  const navigate = useNavigate();
  const { 
    userName, userCpf, userBirthDate, answers, endConsultation, 
    messages, addMessage, setMessages, consultationActive, resetConsultation, 
    setSelectedOffer, exchangeRate, activeConsultationId, subscribeToMessages, 
    patientId, isConsultationFinished, pagamento_consulta, queue, inQueue,
    userPhone, userEmail, confirmReceitaPrevia
  } = useStore();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStage, setChatStage] = useState<'initial' | 'prescribing' | 'finished'>('initial');
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  const [isConfirmingPrevia, setIsConfirmingPrevia] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const patientFileInputRef = useRef<HTMLInputElement>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [currentUid, setCurrentUid] = useState<string | null>(auth.currentUser?.uid || null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUid(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // CRITICAL PRIVACY & SECURITY FIX:
  // The consultation ID for a patient in /chat MUST strictly be the patient's own ID.
  // It must NEVER use another patient's activeConsultationId!
  const authenticatedUid = auth.currentUser?.uid || currentUid;
  const effectiveConsultationId = 
    authenticatedUid || 
    (patientId && patientId !== 'doctor' ? patientId : null) || 
    (typeof window !== 'undefined' ? (localStorage.getItem('mecura_patientId') || localStorage.getItem('patient_id')) : null) || 
    undefined;

  useEffect(() => {
    // If effectiveConsultationId is set, ensure store only holds messages for this specific patient
    if (effectiveConsultationId) {
      if (useStore.getState().activeConsultationId !== effectiveConsultationId) {
        useStore.setState({ activeConsultationId: effectiveConsultationId, messages: [] });
      }
      const unsubscribe = subscribeToMessages(effectiveConsultationId);
      return () => unsubscribe();
    }
  }, [effectiveConsultationId, subscribeToMessages]);

  const hasPaidConsultation = !!(
    pagamento_consulta || 
    (typeof window !== 'undefined' && localStorage.getItem('mecura_pagamento') === 'true')
  );

  useEffect(() => {
    // If patient has not paid, redirect to checkout immediately
    if (!hasPaidConsultation) {
      navigate('/checkout');
    }
  }, [hasPaidConsultation, navigate]);

  // Find if current patient has an active entry in the queue
  const myQueueEntry = queue.find(p => 
    (effectiveConsultationId && p.id === effectiveConsultationId) ||
    (auth.currentUser?.email && p.email && p.email.toLowerCase() === auth.currentUser.email.toLowerCase()) ||
    (userEmail && p.email && p.email.toLowerCase() === userEmail.toLowerCase()) ||
    (userPhone && p.phone && p.phone.replace(/\D/g, '') === userPhone.replace(/\D/g, '') && userPhone.length >= 8)
  );

  const isConsultationConcluded = useMemo(() => {
    if (isConsultationFinished) return true;
    if (typeof window !== 'undefined' && localStorage.getItem('mecura_consultation_finished') === 'true') return true;
    
    // Check if the doctor has sent the final consultation closing message
    const hasFinalDoctorMsg = messages.some(
      m => m.sender === 'doctor' && (
        m.text?.toLowerCase().includes('consulta finalizada') || 
        m.text?.toLowerCase().includes('atendimento finalizado') ||
        m.text?.toLowerCase().includes('consulta foi finalizada')
      )
    );
    if (hasFinalDoctorMsg) return true;

    // Check if queue status for this patient is finished
    const currentId = effectiveConsultationId || patientId;
    if (currentId) {
      const qEntry = queue.find(p => p.id === currentId);
      if (qEntry && qEntry.status === 'finished') return true;
    }

    return false;
  }, [isConsultationFinished, messages, effectiveConsultationId, patientId, queue]);

  const hasDoctorMessages = messages.some(m => m.sender === 'doctor');

  // Waiting guard overlay is ONLY shown if patient is strictly in waiting queue and has never been attended by the doctor yet
  const isWaitingInQueue = hasPaidConsultation && 
    !isConsultationConcluded && 
    !consultationActive && 
    !hasDoctorMessages && 
    myQueueEntry?.status !== 'in-consultation' && 
    (myQueueEntry?.status === 'waiting' || (inQueue && !consultationActive));

  const [downloadingMsgId, setDownloadingMsgId] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const blob = await generatePrescriptionPDF(userName, messages, {
        birthDate: userBirthDate || (answers && answers.birthDate),
        cpf: userCpf || (answers && answers.cpf),
        returnBlob: true
      });
      if (blob instanceof Blob) {
        setPdfBlob(blob);
        await deliverPdfBlob(blob, `Receita_${(userName || 'Paciente').replace(/\s+/g, '_')}.pdf`);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadAttachment = async (msg: Message) => {
    setDownloadingMsgId(msg.id);
    try {
      const isEvolutivo = msg.docType === 'laudo_evolutivo';
      const cleanName = (userName || 'Paciente').replace(/\s+/g, '_');
      
      const defaultName = 
        msg.type === 'prescription' || msg.type === 'receita_previa' || msg.docType === 'receita' ? `Receita_Digital_${cleanName}.pdf` :
        msg.docType === 'laudo_evolutivo' ? `Laudo_Evolutivo_${cleanName}.pdf` :
        msg.docType === 'laudo_inicial' ? `Laudo_Inicial_${cleanName}.pdf` :
        msg.type === 'medical_report' ? `Laudo_Medico_${cleanName}.pdf` :
        msg.type === 'psychomotor_report' || msg.docType === 'laudo_psicomotor' ? `Laudo_Psicomotor_${cleanName}.pdf` :
        msg.type === 'agronomic_report' || msg.docType === 'laudo_agronomico' ? `Parecer_Agronomico_${cleanName}.pdf` :
        msg.attachment?.name || 'Documento.pdf';

      const fallbackGen = async (): Promise<Blob | null> => {
        const isPresc = msg.type === 'prescription' || msg.type === 'receita_previa' || msg.docType === 'receita' || msg.attachment?.docType === 'receita' || msg.attachment?.name?.toLowerCase().includes('receita');
        const isMed = msg.type === 'medical_report' || msg.docType === 'laudo_inicial' || msg.docType === 'laudo_evolutivo' || msg.attachment?.docType === 'laudo_inicial' || msg.attachment?.docType === 'laudo_evolutivo' || msg.attachment?.name?.toLowerCase().includes('laudo_');
        const isPsico = msg.type === 'psychomotor_report' || msg.docType === 'laudo_psicomotor' || msg.attachment?.docType === 'laudo_psicomotor' || msg.attachment?.name?.toLowerCase().includes('psicomotor');
        const isAgro = msg.type === 'agronomic_report' || msg.docType === 'laudo_agronomico' || msg.attachment?.docType === 'laudo_agronomico' || msg.attachment?.name?.toLowerCase().includes('agronomico');

        if (isPresc) {
          const b = await generatePrescriptionPDF(userName, messages, {
            birthDate: userBirthDate || (answers && answers.birthDate),
            cpf: userCpf || (answers && answers.cpf),
            customItems: msg.receitaPreviaData?.items,
            customNotes: msg.receitaPreviaData?.notes,
            returnBlob: true
          });
          return b instanceof Blob ? b : null;
        }
        if (isMed) {
          const isEv = msg.docType === 'laudo_evolutivo' || msg.attachment?.docType === 'laudo_evolutivo' || msg.attachment?.name?.toLowerCase().includes('evolutivo');
          const b = await generateMedicalReportPDF(userName, messages, {
            customPatientName: userName,
            birthDate: userBirthDate || (answers && answers.birthDate),
            cpf: userCpf || (answers && answers.cpf),
            answers: answers,
            reportType: isEv ? 'evolutivo' : 'inicial',
            docType: isEv ? 'laudo_evolutivo' : 'laudo_inicial',
            isEvolutivo: isEv,
            returnBlob: true
          });
          return b instanceof Blob ? b : null;
        }
        if (isPsico) {
          const b = await generatePsychomotorReportPDF(userName, {
            customPatientName: userName,
            birthDate: userBirthDate || (answers && answers.birthDate),
            cpf: userCpf || (answers && answers.cpf),
            returnBlob: true
          });
          return b instanceof Blob ? b : null;
        }
        if (isAgro) {
          const b = await generateAgronomicReportPDF(userName, {
            customPatientName: userName,
            cpf: userCpf || (answers && answers.cpf),
            returnBlob: true
          });
          return b instanceof Blob ? b : null;
        }
        return null;
      };

      await downloadOrGenerateAttachment(msg.attachment, fallbackGen, defaultName);
    } catch (err) {
      console.error("Erro ao baixar anexo:", err);
      alert("Erro ao preparar o arquivo para download. Tente novamente.");
    } finally {
      setDownloadingMsgId(null);
    }
  };

  const triggerDownloadOrShare = async (blob: Blob) => {
    const fileName = `Receita_${(userName || 'Paciente').replace(/\s+/g, '_')}.pdf`;
    await deliverPdfBlob(blob, fileName);
  };

  useEffect(() => {
    // Initial doctor message only if patient has actually paid AND chat is empty AND patient is actively in consultation
    if (hasPaidConsultation && !isWaitingInQueue && (consultationActive || myQueueEntry?.status === 'in-consultation') && messages.length === 0) {
      const timeoutId = setTimeout(() => {
        // Double check if messages are still empty before adding
        if (useStore.getState().messages.length > 0) return;
        
        let problemText = 'anamnese';
        
        if ((answers && answers.objectives && answers.objectives.length) > 0) {
          problemText = `queixa de ${answers.objectives.join(', ')}`;
        } else if ((answers && answers.description)) {
          problemText = 'queixa principal';
        }
        
        const obsText = answers?.description ? ` e as observações que você enviou` : '';

        addMessage({
          text: `Olá ${userName || 'paciente'}, sou o Dr. Guilherme. Analisei sua ${problemText}${obsText}. Como você está se sentindo hoje?`,
          sender: 'doctor'
        }, effectiveConsultationId);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [userName, answers, messages.length, addMessage, isWaitingInQueue, consultationActive, myQueueEntry?.status, hasPaidConsultation, effectiveConsultationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    addMessage({
      text: inputText,
      sender: 'user'
    }, effectiveConsultationId);
    
    setInputText('');
  };

  const handlePatientFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingFile(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Url = reader.result as string;
        let finalUrl = base64Url;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              data: base64Url,
              type: file.type || 'application/pdf'
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.url) finalUrl = data.url;
          }
        } catch (err) {
          console.warn("Patient upload error:", err);
        }

        await addMessage({
          sender: 'user',
          type: 'document',
          text: `📎 Documento anexado pelo paciente: ${file.name}`,
          attachment: {
            name: file.name,
            url: finalUrl,
            type: file.type || 'application/pdf',
            title: 'Documento / Receita Enviada pelo Paciente'
          }
        }, effectiveConsultationId);
        setIsUploadingFile(false);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
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
    <div className="flex flex-col h-full bg-mecura-bg relative overflow-hidden">
      {/* Header */}
      <div className="bg-mecura-surface/90 backdrop-blur-md border-b border-mecura-elevated p-4 flex items-center gap-4 z-20 shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-mecura-surface-light flex items-center justify-center text-mecura-silver hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-mecura-surface-light overflow-hidden border-2 border-mecura-elevated">
            <img src="/doctor-avatar.png" alt="Dr. Guilherme" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-mecura-neon rounded-full border-2 border-mecura-surface" />
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg leading-tight">Dr. Guilherme Taveira Dias</h2>
          <p className="text-xs text-mecura-silver">CRM: 12345/SP</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/protocol')}
            className="w-10 h-10 rounded-full bg-mecura-surface-light flex items-center justify-center text-mecura-neon hover:bg-mecura-neon/10 transition-colors border border-mecura-neon/20"
            title="Ver Protocolo & Receituário"
          >
            <Droplets className="w-5 h-5" />
          </button>
          <button 
            onClick={handleFinish}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-mecura-surface-light hover:bg-mecura-surface border border-mecura-elevated text-xs font-bold text-mecura-silver hover:text-white transition-all shadow-sm cursor-pointer"
            title="Acessar Área do Paciente"
          >
            <User className="w-3.5 h-3.5 text-mecura-neon" />
            <span className="hidden sm:inline">Meu Painel</span>
          </button>
        </div>
      </div>

      {/* Waiting Guard Overlay: Prevents entering chat prematurely when waiting in queue */}
      {isWaitingInQueue && (
        <div className="absolute inset-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#FF8A00]/15 border-2 border-[#FF8A00] flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(255,138,0,0.3)] animate-pulse">
            ⏳
          </div>
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40 mb-3">
            Atendimento Pendente
          </span>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            Aguarde o Dr. Guilherme te chamar
          </h2>
          <p className="text-sm text-mecura-silver max-w-xs mb-8 leading-relaxed">
            Você está na fila de espera. O médico te chamará pelo aplicativo e pelo WhatsApp assim que for a sua vez!
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => navigate('/queue')}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FF9A26] text-black font-extrabold text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,138,0,0.3)] cursor-pointer"
            >
              Acompanhar Minha Fila →
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 px-6 rounded-xl bg-[#161622] border border-mecura-elevated text-white font-bold text-sm hover:bg-[#1C1C2B] transition-all cursor-pointer"
            >
              Ir para Área do Paciente
            </button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <AnimatePresence>
          {[...messages].sort((a, b) => {
            const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
            const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
            return (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
          }).map((msg, msgIndex) => (
            <motion.div
              key={`${msg.id || 'chat-msg'}-${msgIndex}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }}
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
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-[#2D5A27] uppercase tracking-wider mb-1 truncate">
                          ® {msg.productData.brand || (msg.productData.origin === 'Nacional' ? 'Associação Nacional' : 'Importado')}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          msg.productData.origin === 'Nacional' || (msg.productData.brand || '').toLowerCase().includes('associação')
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {msg.productData.origin === 'Nacional' || (msg.productData.brand || '').toLowerCase().includes('associação') ? '🇧🇷 Nacional' : '🇺🇸 Importado'}
                        </span>
                      </div>
                      <h3 className="text-black font-bold text-base leading-tight mb-2 break-words">{msg.productData.name}</h3>
                      <ul className="text-gray-600 text-[11px] space-y-1 mb-2">
                        {(Array.isArray(msg.productData.details) 
                          ? msg.productData.details 
                          : typeof msg.productData.details === 'string'
                          ? [msg.productData.details]
                          : []
                        ).filter(Boolean).map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#58D68D] shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      {msg.productData.origin !== 'Nacional' && !(msg.productData.brand || '').toLowerCase().includes('associação') && (
                        <div className="mt-1">
                          <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            R$ {(((msg.productData.priceUSD || (msg.productData.priceBRL ? msg.productData.priceBRL / 5.0 : 80.00))) * (exchangeRate || 5.8)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dosage Section */}
                  <div className="bg-white/80 rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
                    <h4 className="text-[#2D5A27] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Droplets className="w-3.5 h-3.5 text-[#2D5A27]" /> Iniciar tratamento com:
                    </h4>
                    <ul className="text-gray-900 text-sm font-medium space-y-1.5">
                      {(Array.isArray(msg.productData.dosage) 
                        ? msg.productData.dosage 
                        : typeof (msg.productData.dosage as any) === 'string' 
                        ? String(msg.productData.dosage).split('\n').filter(Boolean) 
                        : [msg.productData.dosage ? String(msg.productData.dosage) : 'Tomar conforme orientação médica.']
                      ).map((dose, idx) => (
                        <li key={idx} className="flex items-start gap-2 whitespace-pre-line leading-relaxed">
                          <span className="text-[#2D5A27] font-bold mt-0.5 shrink-0">•</span>
                          <span>{dose}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Description */}
                  {msg.productData.description && (
                    <div className="border-t border-gray-200/70 pt-2.5 mt-1">
                      <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
                        {msg.productData.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : msg.type === 'receita_previa' && msg.receitaPreviaData ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-[96%] sm:w-[90%] md:w-[85%] bg-gradient-to-br from-[#12131C] to-[#0A0B10] border border-amber-500/40 rounded-3xl p-5 sm:p-7 mb-3 shadow-2xl relative overflow-hidden group"
              >
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -z-10" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-extrabold text-lg sm:text-xl flex items-center gap-2">
                          <span>Receita Médica Prévia</span>
                        </h3>
                        <p className="text-xs text-mecura-silver">
                          Prescrita pelo {msg.receitaPreviaData.doctorName || 'Dr. Guilherme Taveira Dias'} ({msg.receitaPreviaData.doctorCrm || 'CRM/MT 17259'})
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {msg.receitaPreviaData.status === 'confirmed' ? (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                          <CheckCircle className="w-4 h-4" />
                          Confirmada pelo Paciente ✓
                        </span>
                      ) : (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-4 h-4" />
                          Aguardando sua Confirmação
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Intro Message */}
                  <p className="text-xs sm:text-sm text-mecura-pearl leading-relaxed mb-4 bg-white/5 p-3.5 rounded-2xl border border-white/5">
                    {msg.text}
                  </p>

                  {/* Prescribed Items List */}
                  <div className="space-y-3 mb-5">
                    <h4 className="text-xs font-bold text-mecura-silver uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Medicamentos e Posologia Selecionados:
                    </h4>
                    {msg.receitaPreviaData.items.map((item, itIdx) => (
                      <div key={itIdx} className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-white font-bold text-sm sm:text-base">
                            {itIdx + 1}. {item.name}
                          </h5>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                            (item.origin || '').toLowerCase().includes('nacional')
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {item.brand ? `${item.brand} • ` : ''}{item.origin || 'Importado'}
                          </span>
                        </div>

                        {/* Composição / Concentração */}
                        {(item.concentration || item.activeIngredients) && (
                          <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                            <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                                Composição / Concentração
                              </span>
                              <span>{item.concentration || item.activeIngredients}</span>
                            </p>
                          </div>
                        )}

                        {/* Apresentação e Forma */}
                        <p className="text-xs text-mecura-silver">
                          <strong className="text-mecura-pearl">Apresentação:</strong> {item.pharmaceuticalForm || 'Solução Oleosa'} 
                          {item.quantity ? ` • Quantidade: ${item.quantity}` : ''}
                          {item.administrationRoute ? ` • Via: ${item.administrationRoute}` : ''}
                        </p>

                        {/* Posologia */}
                        <div className="pt-1.5 border-t border-white/5">
                          <span className="font-bold text-xs text-white block mb-1">Posologia Recomendada:</span>
                          <div className="space-y-1">
                            {(Array.isArray(item.dosage) ? item.dosage : [String(item.dosage || '')]).map((d, dI) => (
                              <p key={dI} className="text-xs text-mecura-pearl leading-relaxed pl-2 border-l-2 border-amber-500/40">
                                • {d}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes / Clinical Guidelines */}
                  {msg.receitaPreviaData.notes && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-mecura-silver mb-5 space-y-1.5">
                      <strong className="text-amber-300 font-bold block text-xs uppercase tracking-wider">
                        Orientações Farmacológicas e Clínicas:
                      </strong>
                      <p className="leading-relaxed whitespace-pre-line text-mecura-pearl">
                        {msg.receitaPreviaData.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {msg.receitaPreviaData.status !== 'confirmed' ? (
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        disabled={isConfirmingPrevia}
                        onClick={async () => {
                          try {
                            setIsConfirmingPrevia(true);
                            await confirmReceitaPrevia(msg.id, effectiveConsultationId);
                            addMessage({
                              text: "Conferi e confirmo a receita médica prévia com a composição e posologia indicadas.",
                              sender: 'user'
                            });
                            setTimeout(() => {
                              addMessage({
                                text: "Excelente! Sua receita médica prévia foi confirmada com sucesso. Os medicamentos já estão vinculados ao seu protocolo e receituário oficial. Você já pode acessar a farmácia e seus produtos.",
                                sender: 'doctor'
                              });
                            }, 600);
                          } catch (e) {
                            console.error("Erro ao confirmar receita prévia:", e);
                          } finally {
                            setIsConfirmingPrevia(false);
                          }
                        }}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-extrabold text-sm sm:text-base rounded-2xl shadow-[0_4px_25px_rgba(16,185,129,0.35)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isConfirmingPrevia ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            Confirmando Receita...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-black" />
                            Confirmar e Aceitar Receita Médica
                          </span>
                        )}
                      </button>
                      <p className="text-[11px] text-center text-mecura-silver">
                        Ao confirmar, você valida os medicamentos e posologia combinados com o médico.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>Receita médica confirmada e validada por você com sucesso!</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <Button
                          onClick={() => handleDownloadAttachment(msg)}
                          disabled={downloadingMsgId === msg.id}
                          className="flex-1 bg-mecura-neon hover:bg-[#b5ff33] text-black font-bold rounded-xl h-12 cursor-pointer flex items-center justify-center text-xs shadow-[0_0_15px_rgba(166,255,0,0.2)]"
                        >
                          {downloadingMsgId === msg.id ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              Abrindo Receita...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Download className="w-4 h-4 mr-1.5" /> Baixar Receita Oficial PDF
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate('/protocol')}
                          className="flex-1 border-white/15 text-white hover:bg-white/5 rounded-xl h-12 cursor-pointer flex items-center justify-center text-xs"
                        >
                          <Droplets className="w-4 h-4 mr-1.5 text-mecura-neon" />
                          Acessar Protocolo & Farmácia
                        </Button>
                      </div>
                    </div>
                  )}
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
            ) : (msg.type === 'prescription' || msg.docType === 'receita') ? (
              <div className="w-[90%] sm:w-[80%] bg-gradient-to-br from-[#1A1A26] to-[#0A0A0F] border border-mecura-neon/40 rounded-3xl p-6 mb-2 relative overflow-hidden group shadow-2xl">
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
                        <CheckCheck className="w-3 h-3 text-mecura-neon" /> Assinada Digitalmente
                      </p>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-2xl mb-1">Receita Digital</h3>
                  <p className="text-mecura-silver text-xs mb-6 font-mono">
                    {msg.attachment?.name || `ID: RX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => handleDownloadAttachment(msg)}
                      disabled={downloadingMsgId === msg.id}
                      className="w-full bg-mecura-neon text-black hover:bg-[#b5ff33] font-bold shadow-[0_0_20px_rgba(166,255,0,0.25)] rounded-xl h-12 cursor-pointer flex items-center justify-center transition-all active:scale-[0.98]"
                    >
                      {downloadingMsgId === msg.id ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Abrindo Receita PDF...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Download className="w-4 h-4 mr-2" /> Baixar Receita PDF
                        </span>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl h-12 cursor-pointer" onClick={() => navigate('/pharmacy')}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Ir para a Loja
                    </Button>
                  </div>
                </div>
              </div>
            ) : (msg.type === 'medical_report' || msg.docType === 'laudo_inicial' || msg.docType === 'laudo_evolutivo') ? (
              <div className={`w-[90%] sm:w-[80%] bg-gradient-to-br ${msg.docType === 'laudo_evolutivo' ? 'from-[#0F172A] to-[#0A0F1D] border-blue-500/40' : 'from-[#1E1911] to-[#0D0B07] border-amber-500/40'} border rounded-3xl p-6 mb-2 relative overflow-hidden group shadow-2xl`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${msg.docType === 'laudo_evolutivo' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                      <FileCheck className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] uppercase tracking-widest font-mono ${msg.docType === 'laudo_evolutivo' ? 'text-blue-400' : 'text-amber-400'}`}>Oficial</span>
                      <p className="text-xs text-white font-medium flex items-center gap-1 justify-end">
                        <CheckCheck className={`w-3 h-3 ${msg.docType === 'laudo_evolutivo' ? 'text-blue-400' : 'text-amber-400'}`} /> Assinado Digitalmente
                      </p>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-2xl mb-1">
                    {msg.docType === 'laudo_evolutivo' ? 'Laudo Médico Evolutivo' : 'Laudo Médico Inicial'}
                  </h3>
                  <p className="text-mecura-silver text-xs mb-6">
                    {msg.attachment?.name || 'Documento médico assinado para prontuário e instrução legal.'}
                  </p>
                  
                  <Button 
                    onClick={() => handleDownloadAttachment(msg)}
                    disabled={downloadingMsgId === msg.id}
                    className={`w-full font-bold shadow-xl rounded-xl h-12 cursor-pointer flex items-center justify-center transition-all active:scale-[0.98] ${
                      msg.docType === 'laudo_evolutivo'
                        ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    }`}
                  >
                    {downloadingMsgId === msg.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Abrindo Laudo...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 mr-2" /> Baixar Laudo PDF
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (msg.type === 'psychomotor_report' || msg.docType === 'laudo_psicomotor') ? (
              <div className="w-[90%] sm:w-[80%] bg-gradient-to-br from-[#1E1230] to-[#0D0714] border border-purple-500/40 rounded-3xl p-6 mb-2 relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono">CTB / Aptidão</span>
                      <p className="text-xs text-white font-medium flex items-center gap-1 justify-end">
                        <CheckCheck className="w-3 h-3 text-purple-400" /> Atestado Válido
                      </p>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-2xl mb-1">Laudo Psicomotor</h3>
                  <p className="text-purple-300 text-xs mb-6">
                    {msg.attachment?.name || 'Atestado de capacidade psicomotora e aptidão (Lei Seca / CTB).'}
                  </p>
                  
                  <Button 
                    onClick={() => handleDownloadAttachment(msg)}
                    disabled={downloadingMsgId === msg.id}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] rounded-xl h-12 cursor-pointer flex items-center justify-center transition-all active:scale-[0.98]"
                  >
                    {downloadingMsgId === msg.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Abrindo Laudo...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 mr-2" /> Baixar Laudo Psicomotor PDF
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (msg.type === 'agronomic_report' || msg.docType === 'laudo_agronomico') ? (
              <div className="w-[90%] sm:w-[80%] bg-gradient-to-br from-[#0F2417] to-[#07130C] border border-emerald-500/40 rounded-3xl p-6 mb-2 relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center">
                      <Sprout className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono">Salvo-Conduto / HC</span>
                      <p className="text-xs text-white font-medium flex items-center gap-1 justify-end">
                        <CheckCheck className="w-3 h-3 text-emerald-400" /> Parecer Pericial
                      </p>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-2xl mb-1">Parecer Técnico Agronômico</h3>
                  <p className="text-emerald-300 text-xs mb-6">
                    {msg.attachment?.name || 'Dimensionamento oficial de cultivo e fitomassa para Habeas Corpus.'}
                  </p>
                  
                  <Button 
                    onClick={() => handleDownloadAttachment(msg)}
                    disabled={downloadingMsgId === msg.id}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-xl h-12 cursor-pointer flex items-center justify-center transition-all active:scale-[0.98]"
                  >
                    {downloadingMsgId === msg.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Abrindo Parecer...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 mr-2" /> Baixar Parecer Agronômico PDF
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (msg.type === 'document' || msg.attachment) ? (
              <div className="w-[90%] sm:w-[80%] bg-gradient-to-br from-[#161622] to-[#0A0A0F] border border-white/20 rounded-3xl p-6 mb-2 relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-white/10 border border-white/20 text-white rounded-2xl flex items-center justify-center">
                      <Paperclip className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-mecura-silver uppercase tracking-widest font-mono">Arquivo</span>
                      <p className="text-xs text-white font-medium flex items-center gap-1 justify-end">
                        <CheckCheck className="w-3 h-3 text-mecura-neon" /> Disponível
                      </p>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-xl mb-1">{msg.attachment?.title || 'Documento Anexado'}</h3>
                  <p className="text-mecura-silver text-xs mb-6 truncate">{msg.attachment?.name || 'arquivo.pdf'}</p>
                  
                  <Button 
                    onClick={() => handleDownloadAttachment(msg)}
                    disabled={downloadingMsgId === msg.id}
                    className="w-full bg-white/15 hover:bg-white text-white hover:text-black font-bold border border-white/20 rounded-xl h-12 cursor-pointer flex items-center justify-center transition-colors active:scale-[0.98]"
                  >
                    {downloadingMsgId === msg.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Baixando Arquivo...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 mr-2" /> Baixar Documento
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ) : msg.type === 'acompanhamento_card' ? (
              <div className="w-[95%] sm:w-[85%] bg-gradient-to-b from-[#111116] to-[#0A0A0F] border border-[#2a2a35] rounded-3xl p-6 sm:p-8 mb-2 relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-mecura-neon/10 rounded-full blur-[80px] -z-10 group-hover:bg-mecura-neon/20 transition-all duration-700" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-mecura-neon/20 flex items-center justify-center shadow-[0_0_15px_rgba(166,255,0,0.2)]">
                    <Star className="w-5 h-5 text-mecura-neon" />
                  </div>
                  <h2 className="text-white font-bold text-xl sm:text-2xl">Tratamento Premium</h2>
                </div>
                
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
                  Estruture seu tratamento com total segurança, acompanhamento médico contínuo e todos os documentos legais necessários.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Consulta médica individualizada",
                    "Laudo médico inicial detalhado",
                    "Laudo psicomotor (Drogômetro)",
                    "Laudo agronômico (Cálculo de cultivo / HC)",
                    "Retorno garantido em 90 dias",
                    "Suporte via chat e acompanhamento",
                    "Assessoria para importação e HC"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-mecura-neon/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-mecura-neon" />
                      </div>
                      <span className="text-gray-200 text-sm sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#181822] border border-[#2a2a35] rounded-2xl p-5 flex items-center justify-between mb-8">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Teleconsulta Completa</p>
                    <p className="text-white font-bold text-2xl">R$ 249<span className="text-gray-500 text-sm">,00</span></p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-mecura-neon/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-mecura-neon" />
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    setSelectedOffer('premium');
                    navigate('/premium-checkout');
                  }}
                  className="w-full py-5 bg-mecura-neon text-black font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(166,255,0,0.25)] hover:shadow-[0_4px_30px_rgba(166,255,0,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Desejo dar o Próximo Passo</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            ) : msg.type === 'acompanhamento_options' && msg.sender === 'doctor' ? null
            : msg.type === 'payment_success' ? (
              <div className="w-[95%] sm:w-[85%] bg-[#A6FF00]/10 border border-[#A6FF00]/30 rounded-3xl p-4 sm:p-6 mb-2 flex items-center gap-4 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-[#A6FF00]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-[#A6FF00]" />
                </div>
                <div>
                  <h3 className="text-[#A6FF00] font-bold text-lg">Pagamento Aprovado!</h3>
                  <p className="text-white text-sm">O pagamento da Consulta Premium (R$ 249,00) foi confirmado. O médico já foi notificado.</p>
                </div>
              </div>
            ) : (
              <div 
                className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-mecura-neon/10 text-white rounded-tr-sm border border-mecura-neon/20' 
                    : 'bg-mecura-surface text-mecura-pearl rounded-tl-sm border border-mecura-elevated'
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
            )}
            <div className="flex items-center gap-1 mt-1.5 px-1">
              <span className="text-[10px] text-mecura-silver font-medium">
                {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) ? format(new Date(msg.timestamp), 'HH:mm') : ''}
              </span>
              {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-mecura-neon" />}
            </div>
          </motion.div>
        ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex items-center gap-2 bg-mecura-surface border border-mecura-elevated w-fit p-4 rounded-2xl rounded-tl-sm shadow-md">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-mecura-neon rounded-full shadow-[0_0_5px_rgba(166,255,0,0.5)] animate-bounce" />
              <div className="w-2 h-2 bg-mecura-neon rounded-full shadow-[0_0_5px_rgba(166,255,0,0.5)] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-mecura-neon rounded-full shadow-[0_0_5px_rgba(166,255,0,0.5)] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2 shrink-0" />
      </div>

      {/* Input Area or Finished Banner */}
      {isConsultationConcluded ? (
        <div className="p-4 bg-[#12121A]/95 backdrop-blur-xl border-t border-white/10 shrink-0 z-20 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-mecura-neon shadow-[0_0_8px_rgba(166,255,0,0.6)]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Atendimento Concluído pelo Médico
                </span>
              </div>
              <span className="text-[11px] text-[#8A8A9E]">
                Histórico Preservado
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate('/protocol')}
                className="h-12 rounded-2xl bg-mecura-neon text-[#0A0A0F] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#8EE000] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(166,255,0,0.2)] cursor-pointer"
              >
                <Droplets className="w-4 h-4" />
                Ver Protocolo & Receitas
              </button>

              <button
                onClick={() => navigate('/pharmacy')}
                className="h-12 rounded-2xl bg-[#1A1A28] hover:bg-[#222234] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-mecura-neon" />
                Comprar Medicamentos
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-mecura-bg border-t border-mecura-elevated shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Input de arquivo para o paciente */}
            <input 
              type="file" 
              ref={patientFileInputRef} 
              onChange={handlePatientFileAttach} 
              className="hidden" 
              accept=".pdf,image/*" 
            />
            <button
              type="button"
              onClick={() => patientFileInputRef.current?.click()}
              disabled={isUploadingFile}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-mecura-neon hover:border-mecura-neon/50 flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50"
              title="Anexar documento ou receita antiga"
            >
              {isUploadingFile ? (
                <div className="w-5 h-5 border-2 border-mecura-neon border-t-transparent rounded-full animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isUploadingFile ? "Enviando anexo..." : "Escreva sua mensagem..."}
              className="flex-1 h-14 bg-mecura-surface rounded-full px-6 text-sm text-white focus:outline-none border border-mecura-elevated focus:border-mecura-neon/50 transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-14 h-14 rounded-full bg-mecura-neon text-mecura-bg flex items-center justify-center disabled:opacity-50 disabled:bg-mecura-surface disabled:text-mecura-silver transition-all shadow-[0_0_15px_rgba(166,255,0,0.2)] shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
