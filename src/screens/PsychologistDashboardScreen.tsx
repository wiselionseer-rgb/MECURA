import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  Search, 
  Send, 
  Paperclip, 
  LogOut, 
  FileText, 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  Phone, 
  Video, 
  Check, 
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  Download,
  AlertCircle,
  Menu,
  X,
  FileCheck,
  Plus,
  HelpCircle,
  UserCheck,
  User,
  MessageCircle,
  Mic,
  Square,
  Play,
  Pause,
  Stethoscope,
  ClipboardList,
  Lock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { auth, db } from '../firebase';
import { doc, setDoc, updateDoc, collection, onSnapshot, query, where, getDocs, addDoc } from 'firebase/firestore';
import { PsychologicalReportEditorModal } from '../components/PsychologicalReportEditorModal';
import { AreaPasswordModal } from '../components/AreaPasswordModal';
import { generatePsychologicalReportPDF } from '../utils/pdfGenerator';
import { NeurodivergentTestsCard } from '../components/tools/NeurodivergentTestsCard';
import { format } from 'date-fns';

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.334 5.002l-1.416 5.166 5.286-1.385c1.464.798 3.117 1.218 4.782 1.219h.004c5.506 0 9.989-4.478 9.99-9.985.001-2.668-1.034-5.176-2.919-7.062a9.92 9.92 0 00-7.065-2.939zm5.955 14.281c-.252.712-1.258 1.305-1.734 1.388-.475.083-1.077.118-3.486-.877-2.909-1.203-4.783-4.184-4.928-4.38-.145-.195-1.185-1.583-1.185-3.02 0-1.437.747-2.14 1.011-2.43.264-.29.575-.363.767-.363.192 0 .384.002.551.01.178.008.418-.067.654.498.24.576.816 1.996.888 2.142.072.146.12.316.024.508-.096.192-.144.312-.288.48-.144.168-.303.376-.433.504-.144.144-.294.302-.126.59.168.288.748 1.233 1.605 1.996 1.101.982 2.03 1.287 2.318 1.431.288.144.456.12.624-.072.168-.192.72-.84.912-1.128.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.696-.18 1.408z"/>
  </svg>
);

export function PsychologistDashboardScreen() {
  const navigate = useNavigate();
  const { 
    userName, queue, startConsultation, subscribeToQueue, 
    messages, addMessage, activeConsultationId,
    consultationHistory, subscribeToAllConsultationHistory,
    transferPatientQueue, answers
  } = useStore();

  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'in-consultation' | 'finished'>('waiting');
  const [queueSearchTerm, setQueueSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'chat' | 'history'>('chat');
  const [isFinishingConsultation, setIsFinishingConsultation] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showTriageInfo, setShowTriageInfo] = useState(false);
  const [showNeuroTestsBanner, setShowNeuroTestsBanner] = useState(true);

  // Modal de Senha para Alternar para Área Médica
  const [isDoctorAuthModalOpen, setIsDoctorAuthModalOpen] = useState(false);

  // Audio recording states
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecordingTime, setAudioRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Psychological Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPatientName, setReportPatientName] = useState('');
  const [reportBirthDate, setReportBirthDate] = useState('');
  const [reportCpf, setReportCpf] = useState('');
  const [reportEmissionDate, setReportEmissionDate] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [psychologistName, setPsychologistName] = useState('Marco Antônio Boastik');
  const [psychologistCrp, setPsychologistCrp] = useState('CRP 08/49215');
  const [reportPurpose, setReportPurpose] = useState('Avaliação Psicológica Clínica e Pericial para Fins de Tratamento em Saúde Mental e Salvaguarda Terapêutica.');
  const [reportDemand, setReportDemand] = useState('');
  const [reportProcedures, setReportProcedures] = useState('Realizada entrevista psicológica clínica semiestruturada, anamnese direcionada, exame pormenorizado das funções psíquicas superiores e rastreio de sintomas conforme as diretrizes da Resolução CFP nº 06/2019 do Conselho Federal de Psicologia.');
  const [reportAnalysis, setReportAnalysis] = useState('');
  const [reportDiagnosticHypothesis, setReportDiagnosticHypothesis] = useState('F41.1 - Transtorno de Ansiedade Generalizada');
  const [reportConclusion, setReportConclusion] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // WhatsApp Call Handler
  const handleWhatsAppCall = (patient: any) => {
    if (!patient) return;
    const patientName = patient.patientName || (patient as any).name || userName || 'Paciente';
    const firstName = patientName.split(' ')[0];
    
    let rawPhone = 
      patient.phone || 
      patient.whatsapp || 
      patient.telefone || 
      patient.celular || 
      patient.patientPhone || 
      patient.answers?.phone || 
      patient.answers?.whatsapp || 
      patient.answers?.telefone || 
      (currentPatient && currentPatient.id === patient.id ? (currentPatient.phone || currentPatient.answers?.phone) : '') ||
      '';
    
    let cleanDigits = String(rawPhone || '').replace(/\D/g, '');

    if (!cleanDigits) {
      const promptPhone = window.prompt(`O paciente ${patientName} não possui número de WhatsApp cadastrado na fila.\n\nPor favor, informe o WhatsApp com DDD (ex: 11999998888):`);
      if (promptPhone) {
        cleanDigits = promptPhone.replace(/\D/g, '');
      }
    }

    if (!cleanDigits) {
      showToast("Nenhum número de WhatsApp informado para este paciente.");
      return;
    }

    let finalPhone = cleanDigits;
    if (finalPhone.length === 10 || finalPhone.length === 11) {
      finalPhone = `55${finalPhone}`;
    }

    const defaultMsg = `Olá ${firstName}! Aqui é o psicólogo Marco Antônio Boastik da equipe MeCura. Estou te aguardando para a sua consulta de acolhimento psicológico! Por favor, acesse o aplicativo ou me responda por aqui para darmos início ao seu atendimento.`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(defaultMsg)}`;

    try {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(whatsappUrl, '_blank');
    }

    if (patient.id) {
      setDoc(doc(db, 'notifications', patient.id), {
        text: `🔔 O Psicólogo Marco Antônio Boastik acabou de te chamar pelo WhatsApp! Acesse o app para a consulta.`,
        timestamp: new Date().toISOString(),
        type: 'whatsapp_call'
      }).catch(err => console.warn("Could not save notification:", err));

      const msgRef = doc(collection(db, 'active_consultations', patient.id, 'messages'));
      setDoc(msgRef, {
        id: msgRef.id,
        text: `🟢 O psicólogo iniciou contato direto via WhatsApp com ${patientName}.`,
        sender: 'doctor',
        timestamp: new Date().toISOString(),
        type: 'text'
      }).catch(err => console.warn("Could not send chat notification message:", err));
    }

    showToast(`Chamando ${patientName} no WhatsApp...`);
  };

  // Subscribe to queue and consultation history on mount
  useEffect(() => {
    const unsubQueue = subscribeToQueue();
    const unsubHistory = subscribeToAllConsultationHistory();
    return () => {
      unsubQueue();
      unsubHistory();
    };
  }, [subscribeToQueue, subscribeToAllConsultationHistory]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter patients belonging to psychologist queue
  const psychologistQueue = useMemo(() => {
    return queue.filter(p => {
      const qType = (p as any).queueType;
      const plan = (p as any).plan;
      const offer = (p as any).selectedOffer;

      // Strictly exclude if explicitly assigned or transferred to doctor
      if (qType === 'doctor') return false;

      // Belongs to psychologist if queueType is psychologist/complete, OR plan/offer is psychologist/complete
      const isPsico = qType === 'psychologist' || qType === 'complete' || (plan === 'psychologist' || offer === 'psychologist' || plan === 'complete' || offer === 'complete');
      
      // Filter by status
      const matchesStatus = queueFilter === 'all' ? true : p.status === queueFilter;

      // Filter by search term
      const nameMatch = (p.patientName || (p as any).name || '').toLowerCase().includes(queueSearchTerm.toLowerCase());
      const cpfMatch = ((p as any).cpf || '').includes(queueSearchTerm);

      return isPsico && matchesStatus && (nameMatch || cpfMatch);
    });
  }, [queue, queueFilter, queueSearchTerm]);

  // Select patient and load report state
  const handleSelectPatient = async (patient: any) => {
    setCurrentPatient(patient);
    startConsultation(patient.id);

    // Initialize report fields
    const pName = patient.patientName || (patient as any).name || 'Paciente';
    const pCpf = (patient as any).cpf || patient.answers?.cpf || '';
    const pBirth = (patient as any).birthDate || patient.answers?.birthDate || '';
    
    setReportPatientName(pName);
    setReportCpf(pCpf);
    setReportBirthDate(pBirth);
    setReportEmissionDate(format(new Date(), 'dd/MM/yyyy'));

    // Check if report was previously saved in localStorage
    const savedKey = `mecura_psico_report_${patient.id}`;
    try {
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.purpose) setReportPurpose(parsed.purpose);
        if (parsed.demandDescription) setReportDemand(parsed.demandDescription);
        if (parsed.technicalProcedures) setReportProcedures(parsed.technicalProcedures);
        if (parsed.clinicalAnalysis) setReportAnalysis(parsed.clinicalAnalysis);
        if (parsed.diagnosticHypothesis) setReportDiagnosticHypothesis(parsed.diagnosticHypothesis);
        if (parsed.conclusion) setReportConclusion(parsed.conclusion);
      } else {
        // Defaults based on patient's answers
        const symptoms = patient.answers?.symptoms || patient.answers?.objective || 'sintomas ansiosos e estresse';
        setReportDemand(`Paciente comparece relatando sofrimento emocional caracterizado por ${symptoms}, com sobrecarga psicológica, tensão psicofísica e prejuízos no padrão de sono e rotina.`);
        setReportAnalysis(`Ao exame psíquico, o(a) paciente apresenta-se orientado(a) e lúcido(a), com discurso articulado. Tonalidade afetiva ansiosa e reativa aos estressores cotidianos. Ausência de alterações na sensopercepção.`);
        setReportConclusion(`Recomenda-se acompanhamento psicoterápico continuado e intervenções de acolhimento emocional para promoção da homeostase biopsicossocial do paciente.`);
      }
    } catch {}

    // Update status to in-consultation if currently waiting
    if (patient.status === 'waiting') {
      try {
        await updateDoc(doc(db, 'queue', patient.id), {
          status: 'in-consultation',
          hasUnread: false
        });
      } catch (e) {
        console.warn("Could not update queue status in Firestore:", e);
      }
    }
  };

  // Send text message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !currentPatient) return;

    try {
      await addMessage({
        text,
        sender: 'doctor' // Sender role for clinician
      }, currentPatient.id);
      
      if (!textToSend) setInputText('');
    } catch (e) {
      console.error("Erro ao enviar mensagem:", e);
      showToast("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  // Finish consultation
  const handleFinishConsultation = async () => {
    if (!currentPatient) return;
    setIsFinishingConsultation(true);
    try {
      const nowIso = new Date().toISOString();
      await updateDoc(doc(db, 'queue', currentPatient.id), {
        status: 'finished',
        hasUnread: false,
        pagamento_consulta: false,
        finishedAt: nowIso
      }).catch(async () => {
        await setDoc(doc(db, 'queue', currentPatient.id), {
          status: 'finished',
          hasUnread: false,
          pagamento_consulta: false,
          finishedAt: nowIso
        }, { merge: true });
      });

      await setDoc(doc(db, 'users', currentPatient.id), {
        inQueue: false,
        consultationStatus: 'finished',
        isConsultationFinished: true,
        consultationActive: false,
        pagamento_consulta: false,
        hasPaid: false,
        isPaid: false,
        bypassedPayment: false,
        hadPreviousConsultation: true,
        lastUpdated: nowIso
      }, { merge: true }).catch(() => {});

      fetch('/api/queue/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: currentPatient.id, status: 'finished', hasUnread: false })
      }).catch(() => {});

      showToast(`✓ Atendimento de ${currentPatient.patientName} finalizado com sucesso.`);
      setCurrentPatient(null);
    } catch (e) {
      console.error(e);
      showToast("Erro ao finalizar atendimento.");
    } finally {
      setIsFinishingConsultation(false);
    }
  };

  // AI Generation trigger
  const handleGenerateReportAi = async () => {
    if (!currentPatient) return;
    setShowReportModal(true);
  };

  // Download PDF
  const handleDownloadReportPdf = async () => {
    try {
      await generatePsychologicalReportPDF(reportPatientName || currentPatient?.patientName || 'Paciente', {
        customPatientName: reportPatientName,
        cpf: reportCpf,
        birthDate: reportBirthDate,
        emissionDate: reportEmissionDate,
        psychologistName,
        psychologistCrp,
        purpose: reportPurpose,
        demandDescription: reportDemand,
        technicalProcedures: reportProcedures,
        clinicalAnalysis: reportAnalysis,
        diagnosticHypothesis: reportDiagnosticHypothesis,
        conclusion: reportConclusion
      });
      showToast("✓ Download do Laudo Psicológico iniciado!");
    } catch (e) {
      console.error(e);
      showToast("Erro ao gerar o PDF do laudo.");
    }
  };

  // Send report to chat
  const handleSendReportToChat = async () => {
    if (!currentPatient) return;
    try {
      const pdfBlob = await generatePsychologicalReportPDF(reportPatientName || currentPatient.patientName, {
        customPatientName: reportPatientName,
        cpf: reportCpf,
        birthDate: reportBirthDate,
        emissionDate: reportEmissionDate,
        psychologistName,
        psychologistCrp,
        purpose: reportPurpose,
        demandDescription: reportDemand,
        technicalProcedures: reportProcedures,
        clinicalAnalysis: reportAnalysis,
        diagnosticHypothesis: reportDiagnosticHypothesis,
        conclusion: reportConclusion,
        returnBlob: true
      });

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        await addMessage({
          sender: 'doctor',
          type: 'psychological_report',
          docType: 'laudo_psicologico',
          text: `📄 Laudo Psicológico Oficial emitido por Marco Antônio Boastik (CRP 08/49215) para ${reportPatientName}. Diagnóstico: ${reportDiagnosticHypothesis}`,
          attachment: {
            docType: 'laudo_psicologico',
            name: `Laudo_Psicologico_${(reportPatientName || 'Paciente').replace(/\s+/g, '_')}.pdf`,
            url: base64data,
            type: 'application/pdf',
            title: `Laudo Psicológico • ${reportPatientName}`
          }
        }, currentPatient.id);

        try {
          const reportPayload = {
            hasPsychologicalReport: true,
            laudoPsicologico: true,
            laudoPsicologicoData: {
              customPatientName: reportPatientName,
              cpf: reportCpf,
              birthDate: reportBirthDate,
              emissionDate: reportEmissionDate,
              psychologistName,
              psychologistCrp,
              purpose: reportPurpose,
              demandDescription: reportDemand,
              technicalProcedures: reportProcedures,
              clinicalAnalysis: reportAnalysis,
              diagnosticHypothesis: reportDiagnosticHypothesis,
              conclusion: reportConclusion
            }
          };
          await updateDoc(doc(db, 'queue', currentPatient.id), reportPayload).catch(() => {});
          await setDoc(doc(db, 'users', currentPatient.id), reportPayload, { merge: true }).catch(() => {});
        } catch (fsErr) {
          console.warn("Could not set laudoPsicologico flags:", fsErr);
        }

        showToast("✓ Laudo Psicológico enviado no chat e liberado no painel do paciente!");
        setShowReportModal(false);
      };
      reader.readAsDataURL(pdfBlob as Blob);
    } catch (e) {
      console.error("Erro ao enviar laudo para o chat:", e);
      showToast("Erro ao anexar laudo no chat.");
    }
  };

  // Save report to patient storage
  const handleSaveReportData = (savedData: any) => {
    if (!currentPatient) return;
    const savedKey = `mecura_psico_report_${currentPatient.id}`;
    try {
      localStorage.setItem(savedKey, JSON.stringify(savedData));
      showToast("✓ Laudo psicológico salvo localmente.");
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  };
  // Neurodivergent Test Handlers
  const handleSendAdhdToChat = async (adhdData: any) => {
    if (!currentPatient) return;
    try {
      const isInvite = adhdData?.isInvite;
      const msgPayload: any = {
        text: isInvite
          ? `📋 Convite Clínico: O psicólogo Marco Antônio solicitou o preenchimento da Escala ASRS-18 (12 Perguntas) para mapeamento de TDAH.`
          : `🧠 Laudo do Teste de TDAH (ASRS-18 — 12 Domínios Neurais):\n• Correspondência: ${adhdData.scorePercent}%\n• Classificação: ${adhdData.classification}\n• Pontuação: ${adhdData.totalPoints}/${adhdData.maxPoints || 36} pontos.`,
        sender: 'doctor',
        type: 'adhd_test_card',
        adhdTestData: isInvite ? undefined : adhdData,
      };
      await addMessage(msgPayload, currentPatient.id);
      showToast('✓ Resultado do Teste de TDAH anexado ao chat!');
    } catch (e) {
      console.error('Erro ao enviar card de TDAH:', e);
      showToast('Erro ao anexar teste no chat.');
    }
  };

  const handleSendAutismToChat = async (autismData: any) => {
    if (!currentPatient) return;
    try {
      const isInvite = autismData?.isInvite;
      const msgPayload: any = {
        text: isInvite
          ? `📋 Convite Clínico: O psicólogo Marco Antônio solicitou o preenchimento do Mapeamento Neurocomportamental para Autismo / TEA (12 Perguntas).`
          : `🧩 Mapeamento de Autismo (TEA — 12 Perguntas):\n• Correspondência: ${autismData.scorePercent}%\n• Perfil: ${autismData.targetProfile || 'Adulto'}\n• Classificação: ${autismData.classification}\n• Pontuação: ${autismData.totalPoints}/${autismData.maxPoints || 36} pontos.`,
        sender: 'doctor',
        type: 'autism_test_card',
        autismTestData: isInvite ? undefined : autismData,
      };
      await addMessage(msgPayload, currentPatient.id);
      showToast('✓ Resultado do Teste de Autismo anexado ao chat!');
    } catch (e) {
      console.error('Erro ao enviar card de Autismo:', e);
      showToast('Erro ao anexar teste no chat.');
    }
  };

  const handleSaveTestResult = async (testType: 'adhd' | 'autism', resultData: any) => {
    if (!currentPatient) return;
    const testKey = testType === 'adhd' ? 'adhdTestResult' : 'autismTestResult';
    const updatedAnswers = {
      ...(currentPatient.answers || {}),
      [testKey]: resultData,
    };
    const updatedPatient = {
      ...currentPatient,
      answers: updatedAnswers,
    };
    setCurrentPatient(updatedPatient);

    // Update locally in useStore
    useStore.setState((state) => ({
      queue: state.queue.map((p) =>
        p.id === currentPatient.id ? { ...p, answers: updatedAnswers } : p
      ),
    }));

    // Persist to Firestore and Server
    try {
      await setDoc(doc(db, 'queue', currentPatient.id), { answers: updatedAnswers }, { merge: true });
      await setDoc(doc(db, 'users', currentPatient.id), { answers: updatedAnswers }, { merge: true });
      fetch('/api/queue/force-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPatient),
      }).catch(() => {});
    } catch (e) {
      console.warn('Could not persist test to firestore:', e);
    }
    showToast(`✓ Avaliação de ${testType === 'adhd' ? 'TDAH' : 'Autismo'} salva com sucesso no prontuário!`);
  };

  // Audio recording handlers
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          if (currentPatient) {
            await addMessage({
              sender: 'doctor',
              text: '🎤 Mensagem de voz do Psicólogo Marco Antônio Boastik',
              attachment: {
                name: 'audio_psicologo.webm',
                url: base64Audio,
                type: 'audio/webm'
              }
            }, currentPatient.id);
            showToast("✓ Mensagem de voz enviada com sucesso!");
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setAudioRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setAudioRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Microfone não autorizado:", err);
      showToast("Não foi possível acessar o microfone.");
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mecura_role');
    }
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-purple-900/90 border border-purple-400 text-purple-100 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-purple-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <div className="w-16 md:w-20 bg-[#12121A] border-r border-white/5 flex flex-col items-center py-5 justify-between shrink-0 z-20">
        <div className="flex flex-col items-center gap-6">
          {/* Logo / Badge */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Brain className="w-5 h-5" />
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setActiveView('chat')}
              className={`p-3 rounded-2xl transition-all relative group cursor-pointer ${
                activeView === 'chat'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-[#8A8A9E] hover:text-white hover:bg-white/5'
              }`}
              title="Fila & Atendimento Psicológico"
            >
              <MessageSquare className="w-5 h-5" />
              {queue.filter(p => (p as any).hasUnread && ((p as any).queueType === 'psychologist' || (p as any).plan === 'psychologist')).length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#12121A] animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowReportModal(true);
              }}
              className="p-3 rounded-2xl transition-all text-[#8A8A9E] hover:text-white hover:bg-white/5 relative group cursor-pointer"
              title="Gerador de Laudo Psicológico"
            >
              <FileText className="w-5 h-5 text-purple-300" />
            </button>

            <button
              type="button"
              onClick={() => setIsDoctorAuthModalOpen(true)}
              className="p-3 rounded-2xl transition-all text-[#8A8A9E] hover:text-mecura-neon hover:bg-white/5 relative group cursor-pointer"
              title="Ir para Área Médica (Dr. Guilherme)"
            >
              <Stethoscope className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Profile & Logout */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-purple-400 bg-[#0A0A0F] shadow-sm">
              <img src="/pscologo.jpeg" alt="Marco Antônio Boastik" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#12121A] animate-pulse" />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-3 text-[#8A8A9E] hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer"
            title="Sair do Sistema"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Queue Sidebar (Fila do Psicólogo) */}
      <div className={`w-full md:w-80 bg-[#0E0E17] border-r border-white/5 flex flex-col shrink-0 z-10 ${currentPatient ? 'hidden md:flex' : 'flex'}`}>
        {/* Header of Queue */}
        <div className="p-4 border-b border-white/5 bg-[#12121A]/60">
          {/* Quick Area Switcher to Doctor */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setIsDoctorAuthModalOpen(true)}
              className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.98]"
              title="Acessar o Painel Médico (Dr. Guilherme) - Requer Senha"
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>Painel Médico (Dr. Guilherme)</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <Lock className="w-2.5 h-2.5" /> Senha
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Fila Psicológica</h2>
            </div>
            <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
              {psychologistQueue.length} paciente(s)
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-mecura-silver absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={queueSearchTerm}
              onChange={(e) => setQueueSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou CPF..."
              className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-mecura-silver/50 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 mt-3 bg-[#0A0A0F] p-1 rounded-xl border border-white/5">
            {[
              { id: 'waiting', label: 'Aguardando' },
              { id: 'in-consultation', label: 'Em Atend.' },
              { id: 'finished', label: 'Finalizados' },
              { id: 'all', label: 'Todos' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setQueueFilter(tab.id as any)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  queueFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-mecura-silver hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patients List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {psychologistQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                <Brain className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold text-xs mb-1">Nenhum paciente nesta fila</h4>
              <p className="text-[11px] text-mecura-silver leading-relaxed">
                Quando pacientes pagarem a consulta avulsa com psicólogo (R$ 150) ou o plano completo, eles aparecerão aqui instantaneamente.
              </p>
            </div>
          ) : (
            psychologistQueue.map((patient) => {
              const isSelected = currentPatient?.id === patient.id;
              const isWaiting = patient.status === 'waiting';
              const isInConsultation = patient.status === 'in-consultation';
              const isFinished = patient.status === 'finished';

              const pPlan =
                patient.plan ||
                (patient as any).selectedOffer ||
                patient.answers?.plan ||
                patient.answers?.selectedOffer ||
                (patient.isPremium ? 'complete' : 'psychologist');
              const planBadgeLabel =
                pPlan === 'complete'
                  ? '👑 COMPLETO 360°'
                  : pPlan === 'premium'
                  ? '👑 VIP PREMIUM'
                  : pPlan === 'basic'
                  ? '🌱 ESSENCIAL'
                  : '🧠 PSICÓLOGO';
              const planBadgeClass =
                pPlan === 'complete' || pPlan === 'premium'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  : pPlan === 'basic'
                  ? 'bg-[#142A1D] text-[#4ADE80] border-[#22C55E]/40'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40';

              return (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-950/60 via-[#181828] to-[#12121A] border-purple-500/50 shadow-lg'
                      : 'bg-[#12121A] border-white/5 hover:border-purple-500/30 hover:bg-[#161622]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                        <span>{patient.patientName || (patient as any).name || 'Paciente'}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border shrink-0 ${planBadgeClass}`}>
                          {planBadgeLabel}
                        </span>
                        {patient.hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        )}
                      </h4>
                      <p className="text-[10px] text-mecura-silver truncate mt-0.5">
                        {(patient as any).cpf ? `CPF: ${(patient as any).cpf}` : (patient.email || 'Consulta Psicológica')}
                      </p>
                    </div>

                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      isWaiting 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : (isInConsultation 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse'
                            : 'bg-white/10 text-mecura-silver')
                    }`}>
                      {isWaiting ? 'Aguardando' : (isInConsultation ? 'Em Atend.' : 'Finalizado')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-mecura-silver border-t border-white/5 pt-1.5 mt-1.5 gap-1">
                    <span className="text-purple-300 font-semibold truncate max-w-[100px]">
                      {patient.answers?.objective || 'Avaliação de Saúde Mental'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppCall(patient);
                        }}
                        className="px-2 py-0.5 rounded bg-[#25D366] hover:bg-[#20ba59] text-white text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Chamar paciente no WhatsApp agora"
                      >
                        <WhatsAppIcon className="w-3 h-3 fill-current" />
                        <span>Whats</span>
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const targetId = patient.id;
                          const pName = patient.patientName || (patient as any).name || 'Paciente';
                          await transferPatientQueue(targetId, 'doctor');
                          showToast(`✓ Paciente ${pName} encaminhado para a fila do Médico!`);
                          if (currentPatient?.id === targetId) {
                            setCurrentPatient(null);
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Mandar paciente para a fila do Médico"
                      >
                        <Stethoscope className="w-3 h-3 text-emerald-400" />
                        <span>P/ Médico</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel: Chat & Psychological Consultation Area */}
      <div className="flex-1 flex flex-col h-full bg-[#0A0A0F] relative min-w-0">
        {currentPatient ? (
          <>
            {/* Consultation Header */}
            <div className="p-3 sm:p-4 border-b border-white/5 bg-[#12121A]/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setCurrentPatient(null)}
                  className="md:hidden p-1.5 bg-white/5 rounded-xl text-mecura-silver hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold shrink-0">
                  <User className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-bold text-sm tracking-tight truncate">
                      {currentPatient.patientName || (currentPatient as any).name || 'Paciente'}
                    </h3>
                    {(() => {
                      const cPlan =
                        currentPatient.plan ||
                        (currentPatient as any).selectedOffer ||
                        currentPatient.answers?.plan ||
                        currentPatient.answers?.selectedOffer ||
                        (currentPatient.isPremium ? 'complete' : 'psychologist');
                      if (cPlan === 'complete') {
                        return (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/50 px-2 py-0.5 rounded-full font-extrabold">
                            👑 Plano Completo 360° (Médico + Psicólogo)
                          </span>
                        );
                      }
                      if (cPlan === 'premium') {
                        return (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/50 px-2 py-0.5 rounded-full font-extrabold">
                            👑 VIP Premium (R$ 249,90)
                          </span>
                        );
                      }
                      if (cPlan === 'basic') {
                        return (
                          <span className="text-[10px] bg-[#142A1D] text-[#4ADE80] border border-[#22C55E]/40 px-2 py-0.5 rounded-full font-bold">
                            🌱 Consulta Essencial (R$ 49,90)
                          </span>
                        );
                      }
                      return (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                          🧠 Consulta Psicológica (R$ 150,00)
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-[11px] text-mecura-silver truncate">
                    {(currentPatient as any).cpf ? `CPF: ${(currentPatient as any).cpf}` : ''} 
                    {(currentPatient as any).phone ? ` • WhatsApp: ${(currentPatient as any).phone}` : ''}
                  </p>
                </div>
              </div>

              {/* Consultation Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Chamar no WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentPatient) {
                      handleWhatsAppCall(currentPatient);
                    } else {
                      showToast("Nenhum paciente selecionado.");
                    }
                  }}
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(37,211,102,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                  title="Chamar paciente diretamente no WhatsApp na hora da vez dele"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Chamar no WhatsApp</span>
                  <span className="sm:hidden">Whats</span>
                </button>

                {/* Mandar para Fila do Médico */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!currentPatient) return;
                    const targetId = currentPatient.id;
                    const pName = currentPatient.patientName || (currentPatient as any).name || 'Paciente';
                    await transferPatientQueue(targetId, 'doctor');
                    showToast(`✓ Paciente ${pName} encaminhado para a fila do Médico!`);
                    setCurrentPatient(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Mandar o paciente para a fila do Médico"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Mandar p/ Fila do Médico</span>
                  <span className="sm:hidden">P/ Médico</span>
                </button>

                {/* Ir para Painel Médico */}
                <button
                  type="button"
                  onClick={() => setIsDoctorAuthModalOpen(true)}
                  className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/35 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="Mudar para o Painel Médico (Dr. Guilherme) - Requer Senha"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xl:inline">Painel Médico</span>
                  <span className="xl:hidden">Médico</span>
                </button>

                {/* Botão Testes TDAH & TEA */}
                <button
                  type="button"
                  onClick={() => setShowNeuroTestsBanner(!showNeuroTestsBanner)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                    showNeuroTestsBanner
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-200'
                  }`}
                  title="Exibir ou ocultar resultados dos testes de TDAH e Autismo"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden sm:inline">Testes TDAH & TEA</span>
                  <span className="sm:hidden">TDAH/TEA</span>
                  {((currentPatient?.answers?.adhdTestResult) || (currentPatient?.answers?.autismTestResult)) && (
                    <span className="w-2 h-2 rounded-full bg-mecura-neon shadow-[0_0_8px_rgba(166,255,0,0.8)]" />
                  )}
                </button>

                {/* Visualizar Triagem */}
                <button
                  type="button"
                  onClick={() => setShowTriageInfo(!showTriageInfo)}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Ver Triagem e Anamnese do Paciente"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden lg:inline">{showTriageInfo ? 'Ocultar Triagem' : 'Anamnese / Triagem'}</span>
                </button>

                {/* Botão de Laudo com IA */}
                <button
                  type="button"
                  onClick={handleGenerateReportAi}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Gerar Laudo Psicológico com IA e editar campos"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-200 fill-current" />
                  <span className="hidden sm:inline">Gerar Laudo com IA</span>
                </button>

                {/* Finalizar Atendimento */}
                <button
                  type="button"
                  onClick={handleFinishConsultation}
                  disabled={isFinishingConsultation}
                  className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Concluir sessão e liberar paciente"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Finalizar Sessão</span>
                </button>
              </div>
            </div>

            {/* Triage Info Banner (if toggled) */}
            {showTriageInfo && currentPatient?.answers && (
              <div className="p-4 bg-[#141420] border-b border-purple-500/30 text-xs text-purple-100 space-y-3 animate-fadeIn shrink-0">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-purple-400" />
                    Respostas da Triagem Clínica do Paciente
                  </h4>
                  <button onClick={() => setShowTriageInfo(false)} className="text-mecura-silver hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-mecura-silver uppercase block font-semibold">Objetivo / Demanda:</span>
                    <span className="font-semibold text-white">{currentPatient.answers.objective || 'Saúde Mental & Acolhimento'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mecura-silver uppercase block font-semibold">Sintomas Relatados:</span>
                    <span className="font-semibold text-white">{currentPatient.answers.symptoms || 'Ansiedade, estresse e insônia'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mecura-silver uppercase block font-semibold">Padrão de Sono:</span>
                    <span className="font-semibold text-white">{currentPatient.answers.sleep || 'Insônia / sono não reparador'}</span>
                  </div>
                </div>

                {/* TDAH and Autism indicators inside triage */}
                {(currentPatient.answers.adhdTestResult || currentPatient.answers.autismTestResult) && (
                  <div className="pt-2 border-t border-purple-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentPatient.answers.adhdTestResult && (
                      <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-400/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-sky-300 block">🧠 Teste TDAH (ASRS-18)</span>
                          <span className="text-xs text-white font-semibold">
                            {currentPatient.answers.adhdTestResult.classification}
                          </span>
                        </div>
                        <span className="text-lg font-black text-mecura-neon font-mono">
                          {currentPatient.answers.adhdTestResult.scorePercent}%
                        </span>
                      </div>
                    )}
                    {currentPatient.answers.autismTestResult && (
                      <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-400/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-purple-300 block">🧩 Mapeamento TEA (Autismo)</span>
                          <span className="text-xs text-white font-semibold">
                            {currentPatient.answers.autismTestResult.classification}
                          </span>
                        </div>
                        <span className="text-lg font-black text-mecura-neon font-mono">
                          {currentPatient.answers.autismTestResult.scorePercent}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-purple-500/20 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppCall(currentPatient)}
                    className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                    <span>Chamar Paciente no WhatsApp Agora</span>
                  </button>
                </div>
              </div>
            )}

            {/* Neurodivergent Tests Banner (TDAH & Autismo TEA) */}
            {showNeuroTestsBanner && (
              <div className="p-3 sm:p-4 bg-[#0D0D16] border-b border-purple-500/25 shrink-0 max-h-[45vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-extrabold text-white tracking-wide uppercase">
                      Resultados dos Testes Neurodivergentes (TDAH & Autismo TEA)
                    </span>
                    {((currentPatient?.answers?.adhdTestResult) || (currentPatient?.answers?.autismTestResult)) && (
                      <span className="text-[10px] bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30 px-2 py-0.5 rounded-full font-bold">
                        Dados Clínicos Disponíveis
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNeuroTestsBanner(false)}
                    className="text-mecura-silver hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                    title="Minimizar painel de testes"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <NeurodivergentTestsCard
                  patient={currentPatient}
                  fallbackAnswers={answers}
                  role="psychologist"
                  onSendAdhdToChat={handleSendAdhdToChat}
                  onSendAutismToChat={handleSendAutismToChat}
                  onSaveTestResult={handleSaveTestResult}
                />
              </div>
            )}

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-[#0A0A0F] via-[#0D0D14] to-[#0A0A0F]">
              {/* Quick Greeting Suggestion */}
              <div className="max-w-md mx-auto text-center p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 space-y-2">
                <p className="font-semibold">
                  Acolhimento Psicológico Ativo com <strong>Marco Antônio Boastik (CRP 08/49215)</strong>
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSendMessage("Olá! Sou Marco Antônio Boastik, psicólogo da equipe Mecura. Como posso te acolher e te ajudar hoje?")}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/15 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-all cursor-pointer"
                  >
                    + Mensagem de Boas-Vindas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage("Vamos iniciar sua avaliação psicológica para acompanhamento e emissão do seu laudo. Pode me contar como estão suas noites de sono e os níveis de ansiedade?")}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/15 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-all cursor-pointer"
                  >
                    + Rastreio de Sintomas
                  </button>
                </div>
              </div>

              {/* Messages List */}
              {messages.map((msg, idx) => {
                const isFromPsychologist = msg.sender === 'doctor';

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${isFromPsychologist ? 'items-end' : 'items-start'}`}
                  >
                    {msg.type === 'adhd_test_card' ? (
                      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#0B1520] via-[#0D1826] to-[#070D14] border border-sky-400/40 p-4 text-white shadow-xl mb-1 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/40 flex items-center justify-center">
                              <Brain className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                Laudo de Rastreio TDAH
                              </h4>
                              <span className="text-[10px] text-sky-300">Escala ASRS-18 • 12 Domínios</span>
                            </div>
                          </div>
                          {msg.adhdTestData?.scorePercent !== undefined && (
                            <span className="text-xl font-black text-mecura-neon font-mono">
                              {msg.adhdTestData.scorePercent}%
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5 text-xs text-mecura-silver">
                          <div className="text-white font-bold text-xs">
                            {msg.adhdTestData?.classification || 'Avaliação Computada'}
                          </div>
                          {msg.adhdTestData?.totalPoints !== undefined && (
                            <div className="text-[11px] text-sky-200">
                              Pontuação: <strong>{msg.adhdTestData.totalPoints}</strong> / {msg.adhdTestData.maxPoints || 36} pontos
                            </div>
                          )}
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-mecura-pearl leading-relaxed">
                            🎯 <strong>Diretriz Clínica:</strong> Modulação dopaminérgica e noradrenérgica no Córtex Pré-Frontal. Protocolo sugerido: CBD + CBG (Foco Diurno) com acompanhamento psicológico integrado.
                          </div>
                        </div>
                        <span className="block text-[9px] text-right text-sky-300/70 pt-1">
                          {msg.timestamp instanceof Date 
                            ? msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                    ) : msg.type === 'autism_test_card' ? (
                      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#160D22] via-[#1D102D] to-[#0E0716] border border-purple-400/40 p-4 text-white shadow-xl mb-1 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                Mapeamento TEA (Autismo)
                              </h4>
                              <span className="text-[10px] text-purple-300">
                                Perfil: {msg.autismTestData?.targetProfile || 'Adulto'} • 12 Perguntas
                              </span>
                            </div>
                          </div>
                          {msg.autismTestData?.scorePercent !== undefined && (
                            <span className="text-xl font-black text-mecura-neon font-mono">
                              {msg.autismTestData.scorePercent}%
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5 text-xs text-mecura-silver">
                          <div className="text-white font-bold text-xs">
                            {msg.autismTestData?.classification || 'Mapeamento Computado'}
                          </div>
                          {msg.autismTestData?.totalPoints !== undefined && (
                            <div className="text-[11px] text-purple-200">
                              Pontuação: <strong>{msg.autismTestData.totalPoints}</strong> / {msg.autismTestData.maxPoints || 36} pontos
                            </div>
                          )}
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-mecura-pearl leading-relaxed">
                            🧩 <strong>Diretriz Clínica:</strong> Regulação da homeostase do tônus de Anandamida e equilíbrio excitatório/inibitório GABA-Glutamato. Protocolo sugerido: Full Spectrum com acompanhamento biopsicossocial.
                          </div>
                        </div>
                        <span className="block text-[9px] text-right text-purple-300/70 pt-1">
                          {msg.timestamp instanceof Date 
                            ? msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[85%] sm:max-w-lg rounded-2xl p-3 sm:p-4 text-xs leading-relaxed shadow-md ${
                          isFromPsychologist
                            ? 'bg-purple-600 text-white rounded-br-none'
                            : 'bg-[#161622] text-mecura-pearl border border-white/10 rounded-bl-none'
                        }`}
                      >
                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                        {/* Attachment Document (e.g. Psychological Report) */}
                        {msg.attachment && (
                          <div className="mt-2.5 p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-purple-300 shrink-0" />
                              <span className="text-[11px] font-bold text-white truncate">
                                {msg.attachment.title || msg.attachment.name}
                              </span>
                            </div>
                            {msg.attachment.url && (
                              <a
                                href={msg.attachment.url}
                                download={msg.attachment.name}
                                className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold transition-colors shrink-0"
                              >
                                Baixar
                              </a>
                            )}
                          </div>
                        )}

                        <span className={`block text-[9px] mt-1 text-right ${isFromPsychologist ? 'text-purple-200/80' : 'text-mecura-silver/70'}`}>
                          {msg.timestamp instanceof Date 
                            ? msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 border-t border-white/5 bg-[#12121A] shrink-0">
              {isRecordingAudio ? (
                <div className="flex items-center justify-between gap-3 bg-red-500/15 border border-red-500/30 p-2.5 rounded-2xl animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>Gravando áudio... {audioRecordingTime}s</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopRecordingAudio}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Enviar Áudio</span>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Digite sua mensagem ou orientação para o paciente..."
                    className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-mecura-silver/50 focus:outline-none focus:border-purple-400"
                  />

                  {/* Mic Audio Button */}
                  <button
                    type="button"
                    onClick={startRecordingAudio}
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 rounded-2xl transition-colors cursor-pointer"
                    title="Gravar mensagem de voz"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-2xl transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          /* Empty State: No patient currently active */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-4 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
              <Brain className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Painel do Psicólogo</h3>
            <p className="text-xs text-mecura-silver leading-relaxed mb-6">
              Bem-vindo, <strong>Marco Antônio Boastik (CRP 08/49215)</strong>. Selecione um paciente na fila à esquerda para iniciar o atendimento ou utilize o gerador de laudo com IA para emitir documentos periciais.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setReportPatientName('Paciente Avulso');
                  setShowReportModal(true);
                }}
                className="p-4 rounded-2xl bg-[#12121A] border border-purple-500/30 hover:border-purple-400/60 hover:bg-purple-500/5 transition-all text-left flex flex-col gap-1.5 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <FileText className="w-5 h-5 text-purple-300" />
                  <Sparkles className="w-4 h-4 text-purple-400 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-white font-bold text-xs">Novo Laudo Psicológico</h4>
                <p className="text-[11px] text-mecura-silver">Redija e baixe laudos com apoio de IA e resolução CFP.</p>
              </button>

              <div className="p-4 rounded-2xl bg-[#12121A] border border-white/5 text-left flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">Ativo</span>
                </div>
                <h4 className="text-white font-bold text-xs">Fila Direta (R$ 150)</h4>
                <p className="text-[11px] text-mecura-silver">Pacientes que pagam consulta avulsa entram diretamente aqui.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Psychological Report Modal */}
      <PsychologicalReportEditorModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        patientName={reportPatientName}
        setPatientName={setReportPatientName}
        birthDate={reportBirthDate}
        setBirthDate={setReportBirthDate}
        cpf={reportCpf}
        setCpf={setReportCpf}
        emissionDate={reportEmissionDate}
        setEmissionDate={setReportEmissionDate}
        psychologistName={psychologistName}
        setPsychologistName={setPsychologistName}
        psychologistCrp={psychologistCrp}
        setPsychologistCrp={setPsychologistCrp}
        purpose={reportPurpose}
        setPurpose={setReportPurpose}
        demandDescription={reportDemand}
        setDemandDescription={setReportDemand}
        technicalProcedures={reportProcedures}
        setTechnicalProcedures={setReportProcedures}
        clinicalAnalysis={reportAnalysis}
        setClinicalAnalysis={setReportAnalysis}
        diagnosticHypothesis={reportDiagnosticHypothesis}
        setDiagnosticHypothesis={setReportDiagnosticHypothesis}
        conclusion={reportConclusion}
        setConclusion={setReportConclusion}
        patientAnswers={currentPatient?.answers}
        onDownloadPDF={handleDownloadReportPdf}
        onSendToChat={currentPatient ? handleSendReportToChat : undefined}
        onSave={handleSaveReportData}
      />

      {/* Modal de Senha para Área Médica */}
      <AreaPasswordModal
        isOpen={isDoctorAuthModalOpen}
        onClose={() => setIsDoctorAuthModalOpen(false)}
        targetArea="doctor"
        onSuccess={() => {
          setIsDoctorAuthModalOpen(false);
          navigate('/doctor');
        }}
      />
    </div>
  );
}
