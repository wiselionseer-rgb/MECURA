import { useAdminStore } from '../store/useAdminStore';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  Maximize2,
  Calendar,
  RefreshCw,
  FileCheck,
  HeartHandshake,
  TrendingUp,
  Sparkles,
  Wallet,
  Edit3,
  Trash2,
  Printer,
  FileDown,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { setDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { requestNotificationPermission, getNotificationPermission, testNotification, showNativeNotification, subscribeToBackgroundNotifications } from '../utils/notifications';
import { playNotificationSound, initAudioUnlock } from '../utils/sound';
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
import { cbdGuideData, CBDProduct, enrichMedicationDetails } from '../data/cbdGuide';
import { NotificationToast } from '../components/NotificationToast';
import { EnableNotificationsBanner } from '../components/EnableNotificationsBanner';
import { PrescriptionEditorModal } from '../components/PrescriptionEditorModal';
import { MedicalReportEditorModal } from '../components/MedicalReportEditorModal';

import { generatePrescriptionPDF, generateMedicalReportPDF, PrescriptionItemData } from '../utils/pdfGenerator';

const calculateAge = (birthDateStr?: string) => {
  if (!birthDateStr) return null;
  let birthDate: Date;
  if (birthDateStr.includes('/')) {
    const parts = birthDateStr.split('/');
    if (parts.length === 3) {
      birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      return null;
    }
  } else {
    birthDate = new Date(birthDateStr);
  }
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 && age < 130 ? age : null;
};

export function DoctorDashboardScreen() {
  const { productCategories } = useAdminStore();
  const adminId = auth.currentUser?.uid;
  const { 
    userName, userCpf, userBirthDate, userPhone, answers, messages, 
    addMessage, deleteMessage, clearPrescriptionMessages, 
    consultationActive, endConsultation, resetConsultation, setSelectedOffer, 
    allAppointments, queue, leaveQueue, startConsultation, subscribeToQueue, 
    subscribeToMessages, subscribeToAppointments 
  } = useStore();
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [expandAnalysis, setExpandAnalysis] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [addedMedications, setAddedMedications] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'chat' | 'guide' | 'analytics'>('chat');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showProductSearchModal, setShowProductSearchModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showAccessiblePlanModal, setShowAccessiblePlanModal] = useState(false);
  const [accessibleType, setAccessibleType] = useState<'cbd' | 'balanced' | 'thc'>('cbd');
  const [accessibleCustomMessage, setAccessibleCustomMessage] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CBDProduct | null>(null);
  const [dosageInput, setDosageInput] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<{name: string, url: string, type: string} | null>(null);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'in-consultation' | 'finished'>('all');
  const [queueSearchTerm, setQueueSearchTerm] = useState('');
  const [mobileTab, setMobileTab] = useState<'chat' | 'ficha' | 'actions'>('chat');

  // Medical Report (Laudo Médico) Editor & Preview States
  const [showMedicalReportEditorModal, setShowMedicalReportEditorModal] = useState(false);
  const [medicalReportTab, setMedicalReportTab] = useState<'edit' | 'preview'>('edit');
  const [reportPatientName, setReportPatientName] = useState('');
  const [reportBirthDate, setReportBirthDate] = useState('');
  const [reportCpf, setReportCpf] = useState('');
  const [reportEmissionDate, setReportEmissionDate] = useState('');
  const [reportDoctorName, setReportDoctorName] = useState('Dr. Guilherme Taveira Dias');
  const [reportDoctorCrm, setReportDoctorCrm] = useState('CRM/MT 17259');
  const [reportDoctorSpecialty, setReportDoctorSpecialty] = useState('Especialista em Medicina Canabinoide');
  const [reportDiagnosis, setReportDiagnosis] = useState('');
  const [reportRationale, setReportRationale] = useState('');
  const [reportTreatmentPlan, setReportTreatmentPlan] = useState('');
  const [reportMonitoring, setReportMonitoring] = useState('');

  // Prescription (Receita Médica) Editor & Preview States
  const [showPrescriptionEditorModal, setShowPrescriptionEditorModal] = useState(false);
  const [prescriptionTab, setPrescriptionTab] = useState<'edit' | 'preview'>('edit');
  const [prescPatientName, setPrescPatientName] = useState('');
  const [prescBirthDate, setPrescBirthDate] = useState('');
  const [prescCpf, setPrescCpf] = useState('');
  const [prescEmissionDate, setPrescEmissionDate] = useState('');
  const [prescDoctorName, setPrescDoctorName] = useState('Dr. Guilherme Taveira Dias');
  const [prescDoctorCrm, setPrescDoctorCrm] = useState('CRM/MT 17259');
  const [prescDoctorSpecialty, setPrescDoctorSpecialty] = useState('Especialista em Medicina Canabinoide');
  const [prescItems, setPrescItems] = useState<PrescriptionItemData[]>([]);
  const [prescNotes, setPrescNotes] = useState('');

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
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        requestNotificationPermission().then(granted => {
          if (granted) {
            subscribeToBackgroundNotifications(user.uid).then(() => { 
              setDoc(doc(db, "users", user.uid), { role: "admin" }, { merge: true }); 
            });
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

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
    setAnalysisResult(null); // Reset previous analysis to allow fresh generation
    startConsultation(patient.id);
    
    // Auto-greeting if the patient was just waiting
    if (patient.status === 'waiting') {
      setTimeout(() => {
        const objectivesStr = patient.answers?.objectives?.length > 0 
          ? patient.answers.objectives.join(", ") 
          : "suas queixas e histórico";
          
        const greetingMsg = `Olá ${patient.patientName.split(' ')[0]}, sou o Dr. Guilherme. Analisei sua queixa de ${objectivesStr}. Como você está se sentindo hoje?`;
        
        addMessage({
          text: greetingMsg,
          sender: 'doctor',
          type: 'text'
        });
      }, 1000);
    }
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

  const handleRemovePrescribedMedication = async (messageId: string, medicationName?: string) => {
    try {
      const pId = currentPatient?.id;
      console.log("Removing medication message:", messageId, "medicationName:", medicationName, "patientId:", pId);
      await deleteMessage(messageId, pId);
      if (medicationName) {
        setAddedMedications(prev => prev.filter(name => name.toLowerCase() !== medicationName.toLowerCase()));
      }
    } catch (err) {
      console.error("Error removing medication message:", err);
    }
  };

  const handleClearAllPrescriptions = async () => {
    try {
      const pId = currentPatient?.id;
      console.log("Clearing all prescriptions for patientId:", pId);
      await clearPrescriptionMessages(pId);
      setAddedMedications([]);
    } catch (err) {
      console.error("Error clearing all prescriptions:", err);
    }
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

  const handleOpenPrescriptionEditor = () => {
    const patientAnswers = currentPatient?.answers || answers;
    const pName = currentPatient?.patientName || userName || 'Paciente';
    const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || userBirthDate || 'Não informada';
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf || 'Não informado';

    // Extract products already in messages & enrich with full pharmacology
    const items: PrescriptionItemData[] = [];
    const seenNames = new Set<string>();

    messages.forEach(m => {
      if (m.type === 'product' && m.productData) {
        const pName = m.productData.name;
        if (!seenNames.has(pName)) {
          seenNames.add(pName);
          const enriched = enrichMedicationDetails(
            pName,
            m.productData.brand || 'Associação Brasileira',
            m.productData.origin || 'Nacional',
            m.productData.type
          );

          items.push({
            name: pName,
            brand: m.productData.brand || enriched.brand,
            origin: m.productData.origin || enriched.origin,
            type: m.productData.type || enriched.type,
            activeIngredients: m.productData.activeIngredients || enriched.activeIngredients,
            concentration: m.productData.concentration || enriched.concentration,
            pharmaceuticalForm: m.productData.pharmaceuticalForm || enriched.pharmaceuticalForm,
            quantity: m.productData.quantity || enriched.quantity,
            administrationRoute: m.productData.administrationRoute || enriched.administrationRoute,
            dosage: Array.isArray(m.productData.dosage) ? m.productData.dosage : [String(m.productData.dosage || '')],
            description: m.productData.description || enriched.description || ''
          });
        }
      }
    });

    const notes = messages.filter(m => m.type === 'prescription_notes' && m.text).map(m => m.text).join('\n\n');

    setPrescPatientName(pName);
    setPrescBirthDate(pBirthDate);
    setPrescCpf(pCpf);
    setPrescEmissionDate(format(new Date(), 'dd/MM/yyyy'));
    setPrescDoctorName('Dr. Guilherme Taveira Dias');
    setPrescDoctorCrm('CRM/MT 17259');
    setPrescDoctorSpecialty('Especialista em Medicina Canabinoide');
    
    if (items.length > 0) {
      setPrescItems(items);
    } else {
      const defaultEnriched = enrichMedicationDetails('ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml (30ml)', 'Associação Brasileira (Nacional)', 'Nacional');
      setPrescItems([
        {
          name: 'ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml (30ml)',
          brand: 'Associação Brasileira (Nacional)',
          origin: 'Nacional',
          activeIngredients: defaultEnriched.activeIngredients,
          concentration: defaultEnriched.concentration,
          pharmaceuticalForm: defaultEnriched.pharmaceuticalForm,
          quantity: defaultEnriched.quantity,
          administrationRoute: defaultEnriched.administrationRoute,
          dosage: [
            'Tomar 03 gotas pela manhã e 03 gotas no final da tarde (sublingual).',
            'Aumentar 01 gota a cada 05 dias até atingir a dose de controle (5 a 8 gotas por tomada).'
          ],
          description: 'Extrato integral rico em Canabidiol com excelente rendimento e custo-benefício.'
        }
      ]);
    }
    setPrescNotes(notes || 'Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.');
    setPrescriptionTab('edit');
    setShowPrescriptionEditorModal(true);
  };

  const handleDownloadPrescriptionFromEditor = () => {
    generatePrescriptionPDF(prescPatientName, messages, {
      customPatientName: prescPatientName,
      birthDate: prescBirthDate,
      cpf: prescCpf,
      emissionDate: prescEmissionDate,
      customDoctorName: prescDoctorName,
      customDoctorCrm: prescDoctorCrm,
      customDoctorSpecialty: prescDoctorSpecialty,
      customItems: prescItems,
      customNotes: prescNotes
    });
  };

  const handleOpenMedicalReportEditor = () => {
    const patientAnswers = currentPatient?.answers || answers;
    const pName = currentPatient?.patientName || userName || 'Paciente';
    const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || userBirthDate || 'Não informada';
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf || 'Não informado';

    const objectives = patientAnswers?.objectives?.join(', ') || 'Ansiedade, estresse crônico e dores';
    const intensity = patientAnswers?.intensity ? `${patientAnswers.intensity}/10` : 'Moderada a intensa';
    const duration = patientAnswers?.duration || 'Quadro de evolução crônica';
    const description = patientAnswers?.description || 'Paciente relata persistência e refratariedade de sintomas clínicos aos tratamentos convencionais de primeira linha, com impacto relevante na qualidade de vida, repouso noturno e funcionalidade global.';

    const defaultClinicalSummary = `O(A) paciente supramencionado(a) compareceu a atendimento médico especializado e foi submetido(a) a minuciosa avaliação clínica. Apresenta sintomatologia compatível com ${objectives}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration}.\n\nHistória da Moléstia: ${description}\n\nTratamento prévio com fármacos convencionais: ${patientAnswers?.remedios ? 'Sim' : 'Não'} | Diagnóstico de Comorbidade Crônica: ${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}.`;

    const defaultTherapeuticRationale = `A terapêutica com Fitocanabinoides (Cannabis Medicinal) fundamenta-se na modulação do Sistema Endocanabinoide (SEC), uma complexa rede de sinalização neuromoduladora e imunológica composta por receptores CB1 (sistema nervoso central) e CB2 (sistema imunológico e tecidos periféricos).\n\n- Modulação Neuroquímica e Anti-inflamatória: O Canabidiol (CBD) atua como modulador alostérico negativo de CB1 e inibidor da degradação de anandamida (via enzima FAAH), promovendo expressiva ação ansiolítica, neuroprotetora e redução de citocinas pró-inflamatórias.\n- Efeito Comitiva (Entourage Effect): A administração de extratos integrais (Full Spectrum) contendo canabinoides menores (CBG, CBN e microdosagens de THC) e terpenos sinérgicos proporciona potencialização da resposta terapêutica com menor necessidade de escalonamento de doses.\n- Adequação Clínica: Diante da refratariedade e da necessidade de estabilização sintomática sem os efeitos colaterais deletérios de medicações sedativas ou anti-inflamatórios convencionais a longo prazo, justifica-se a instituição do tratamento fitocanabinoide.`;

    const items: PrescriptionItemData[] = [];
    const seenReportNames = new Set<string>();

    messages.forEach(m => {
      if (m.type === 'product' && m.productData) {
        const pName = m.productData.name;
        if (!seenReportNames.has(pName)) {
          seenReportNames.add(pName);
          const enriched = enrichMedicationDetails(
            pName,
            m.productData.brand || 'Associação Brasileira',
            m.productData.origin || 'Nacional',
            m.productData.type
          );
          items.push({
            name: pName,
            brand: m.productData.brand || enriched.brand,
            origin: m.productData.origin || enriched.origin,
            type: m.productData.type || enriched.type,
            activeIngredients: m.productData.activeIngredients || enriched.activeIngredients,
            concentration: m.productData.concentration || enriched.concentration,
            pharmaceuticalForm: m.productData.pharmaceuticalForm || enriched.pharmaceuticalForm,
            quantity: m.productData.quantity || enriched.quantity,
            administrationRoute: m.productData.administrationRoute || enriched.administrationRoute,
            dosage: Array.isArray(m.productData.dosage) ? m.productData.dosage : [String(m.productData.dosage || '')],
            description: m.productData.description || enriched.description || ''
          });
        }
      }
    });

    const defaultTreatmentPlan = items.length > 0
      ? items.map((item, idx) => {
          const ing = item.activeIngredients ? `\n   Princípio Ativo: ${item.activeIngredients}` : '';
          const form = item.pharmaceuticalForm ? `\n   Apresentação / Via: ${item.pharmaceuticalForm} • ${item.quantity || '01 frasco'} • ${item.administrationRoute || 'Via Sublingual'}` : '';
          return `${idx + 1}. ${item.name} (${item.brand} - ${item.origin})${ing}${form}\n   Posologia: ${item.dosage.join(' ')}\n   Finalidade: ${item.description || 'Modulação fitocanabinoide contínua.'}`;
        }).join('\n\n')
      : `1. ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml (Associação Brasileira / Nacional)
   Princípio Ativo: Canabidiol (CBD) Full Spectrum 100mg/ml, Delta-9-THC < 0,2%, Terpenos
   Apresentação / Via: Solução Oleosa Gotas • 01 Frasco 30ml • Via Sublingual
   Posologia: Tomar 03 gotas pela manhã e 03 gotas à noite, aumentando 01 gota a cada 05 dias até controle dos sintomas.
   Finalidade: Modulação ansiolítica, regulação do ciclo circadiano e analgesia inflamatória.`;

    const defaultMonitoringText = `- Titulação Lenta e Progressiva ("Start Low, Go Slow"): Ajustar a dosagem gradualmente a cada 4 a 5 dias até atingir a janela terapêutica ideal com controle pleno de sintomas e ausência de efeitos adversos.\n- Monitoramento de Segurança: Acompanhar potenciais interações no citocromo hepático CYP3A4 / CYP2C19 caso haja uso concomitante de outros fármacos.\n- Retorno Médico: Reavaliação clínica agendada em 30 (trinta) dias para ajuste posológico e consolidação do desfecho clínico.`;

    setReportPatientName(pName);
    setReportBirthDate(pBirthDate);
    setReportCpf(pCpf);
    setReportEmissionDate(format(new Date(), 'dd/MM/yyyy'));
    setReportDoctorName('Dr. Guilherme Taveira Dias');
    setReportDoctorCrm('CRM/MT 17259');
    setReportDoctorSpecialty('Especialista em Medicina Canabinoide');
    setReportDiagnosis(defaultClinicalSummary);
    setReportRationale(defaultTherapeuticRationale);
    setReportTreatmentPlan(defaultTreatmentPlan);
    setReportMonitoring(defaultMonitoringText);
    setMedicalReportTab('edit');
    setShowMedicalReportEditorModal(true);
  };

  const handleDownloadMedicalReportFromEditor = () => {
    const patientAnswers = currentPatient?.answers || answers;
    generateMedicalReportPDF(reportPatientName, messages, {
      customPatientName: reportPatientName,
      birthDate: reportBirthDate,
      cpf: reportCpf,
      emissionDate: reportEmissionDate,
      answers: patientAnswers,
      customDoctorName: reportDoctorName,
      customDoctorCrm: reportDoctorCrm,
      customDoctorSpecialty: reportDoctorSpecialty,
      customDiagnosis: reportDiagnosis,
      customRationale: reportRationale,
      customTreatmentPlan: reportTreatmentPlan,
      customMonitoring: reportMonitoring
    });
  };

  const handleGeneratePDF = () => {
    handleOpenPrescriptionEditor();
  };

  const handleGenerateMedicalReport = () => {
    handleOpenMedicalReportEditor();
  };

  const handleApplyAccessiblePlan = (
    type: 'cbd' | 'balanced' | 'thc' = accessibleType,
    customMsg?: string
  ) => {
    const patientName = currentPatient?.patientName || userName || 'Paciente';

    let prodName = 'ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml';
    let prodDesc = 'Óleo integral concentrado de Associação Brasileira com excelente custo-benefício. Indicado para controle de ansiedade, estresse, regulação do humor e inflamação crônica.';
    let dosage = [
      'Tomar 03 gotas pela manhã e 03 gotas no final da tarde (sublingual).',
      'Aumentar 01 gota a cada 05 dias até atingir a dose de controle (5 a 8 gotas por tomada).',
      '01 Frasco de 30ml rende de 45 a 60 dias de tratamento contínuo.'
    ];

    if (type === 'balanced') {
      prodName = 'ÓLEO INTEGRAL THC/CBD 100mg/ml';
      prodDesc = 'Óleo integral balanceado de Associação Brasileira com proporção 1:1. Indicado para dores crônicas, fibromialgia, espasticidade e rigidez.';
      dosage = [
        'Tomar 03 gotas de 12 em 12 horas (sublingual).',
        'Aumentar gradualmente 01 gota a cada 04 dias conforme intensidade dos sintomas.',
        '01 Frasco de 30ml rende até 60 dias.'
      ];
    } else if (type === 'thc') {
      prodName = 'ÓLEO INTEGRAL PREDOMINANTE THC 100mg/ml';
      prodDesc = 'Formulação com predominância de THC de Associação Brasileira. Indicado para insônia grave refratária e alívio de crises noturnas.';
      dosage = [
        'Tomar 04 a 06 gotas 30 minutos antes do repouso noturno.',
        '01 Frasco de 30ml com duração média de 60 a 90 dias.'
      ];
    }

    // 1. Send empathetic doctor chat message
    const defaultMsg = `Olá ${patientName}! Pensando na sua acessibilidade e conforto financeiro, estruturei um **Protocolo de Entrada Acessível** através de Associação Brasileira autorizada.\n\nIniciaremos com **apenas 01 medicamento essencial de alto rendimento** (${prodName}), que dura cerca de 2 meses com a posologia inicial.\n\nVamos acompanhar sua resposta e, conforme sua evolução e condições futuras, poderemos ajustar as doses ou introduzir novos itens se houver real necessidade. Conte sempre com nosso apoio!`;
    
    addMessage({
      sender: 'doctor',
      text: customMsg || accessibleCustomMessage || defaultMsg,
      type: 'text'
    });

    // 2. Add product prescription
    const enriched = enrichMedicationDetails(prodName, 'Associação Brasileira (Nacional)', 'Nacional', 'Óleo Integral Acessível');

    const productItem = {
      name: prodName,
      brand: 'Associação Brasileira (Nacional)',
      origin: 'Nacional',
      type: 'Óleo Integral Acessível',
      activeIngredients: enriched.activeIngredients,
      concentration: enriched.concentration,
      pharmaceuticalForm: enriched.pharmaceuticalForm,
      quantity: enriched.quantity,
      administrationRoute: enriched.administrationRoute,
      details: ['Frasco 30ml', 'Alto rendimento (~60 dias)', 'Associação Nacional autorizada'],
      dosage: dosage,
      description: prodDesc,
      image: "https://placehold.co/400x400/10b981/ffffff?text=Associa%C3%A7%C3%A3o+Nacional"
    };

    addMessage({
      sender: 'doctor',
      type: 'product',
      productData: productItem
    });

    // 3. Add prescription notes
    const protocolNotes = `PROTOCOLO DE ENTRADA ACESSÍVEL (FASE 1):\n- Medicamento Inicial: ${prodName} (Associação Brasileira)\n- Posologia Econômica: ${dosage.join(' ')}\n- Rendimento estimado: 45 a 60 dias.\n- Fase 2 (Evolução): Reavaliação em 30 a 45 dias para verificar resposta terapêutica e evolução progressiva se necessário.`;

    addMessage({
      sender: 'doctor',
      type: 'prescription_notes',
      text: protocolNotes
    });

    setAddedMedications(prev => [...prev, prodName]);
    setShowAccessiblePlanModal(false);
    setAccessibleCustomMessage('');
  };

  const handleGenerateAnalysis = async (force: boolean = false) => {
    setExpandAnalysis(true);
    if (analysisResult && !force) return; // Already generated and not forced
    
    const patientAnswers = currentPatient?.answers || answers;
    
    setIsAnalyzing(true);
    if (force) setAnalysisResult(null);
    try {
      const prompt = `
        Atue como um Especialista Sênior em Medicina Canabinoide e Prescrição Médica de Alto Nível.
        Sua missão é fornecer uma análise clínica com PRECISÃO MÁXIMA, baseada em protocolos rigorosos e literatura médica atualizada, indicando os melhores tratamentos e medicamentos à base de cannabis medicinal.
        
        Dados Clínicos do Paciente:
        - Queixa Principal / Objetivos: ${patientAnswers?.objectives?.join(', ') || 'Não informados'}
        - Intensidade do Sintoma: ${patientAnswers?.intensity || 'Não informada'}/10
        - Cronicidade/Duração: ${patientAnswers?.duration || 'Não informada'}
        - História da Moléstia (Descrição): ${patientAnswers?.description || 'Não informada'}
        - Dados Biométricos: Altura ${patientAnswers?.height || 'Não informada'}m, Peso ${patientAnswers?.weight || 'Não informada'}kg, Sexo ${patientAnswers?.sex || 'Não informada'}
        - Histórico Médico: Tratamento Atual (${patientAnswers?.tratamento_atual ? 'Sim' : 'Não'}), Uso de Fármacos (${patientAnswers?.remedios ? 'Sim' : 'Não'}), Comorbidade Crônica (${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}), Uso Prévio de Cannabis (${patientAnswers?.cannabis ? 'Sim' : 'Não'})
        
        DIRETRIZ DE PRESCRIÇÃO (IMPORTADOS E NACIONAIS):
        Você DEVE sugerir DUAS frentes de tratamento para o médico escolher, cobrindo opções Importadas e Nacionais.
        1. Opção de Importados: Utilize EXCLUSIVAMENTE os medicamentos do catálogo oficial abaixo.
        2. Opção de Associações Nacionais: Sugira formulações de associações brasileiras (ex: Óleo Integral THC/CBD 100mg/ml, Pomada Canábica, Gomas Terapêuticas, ou Flores in natura), adequadas à fisiopatologia do paciente.

        REGRA CLÍNICA CRÍTICA (NÃO DUPLICAR MEDICAMENTOS SIMILARES):
        - NUNCA sugira dois óleos de CBD ou dois produtos com o mesmo princípio ativo e a mesma via sublingual para o mesmo paciente.
        - Em cada categoria (Importados ou Nacionais), sugira no máximo 1 ÓLEO PRINCIPAL de uso contínuo (ex: CBD ou THC/CBD) e, apenas se houver real justificativa clínica, 1 item de via ou forma complementar diferente (ex: Pomada tópica para dor localizada, Gomas mastigáveis noturnas para insônia, ou Flores in natura para resgate de crises).

        CATÁLOGO OFICIAL DISPONÍVEL (Para a Opção Importada):
        ${productCategories.map(cat => `Categoria: ${cat.title}\n${cat.products.map(p => `- ${p.name} (${p.type})`).join('\n')}`).join('\n\n')}
        
        Formato de Saída Exigido (Markdown estruturado e clínico):
        1. Diagnóstico Sindrômico e Avaliação Clínica
        2. Racional Terapêutico Fisiopatológico (Interação com o Sistema Endocanabinoide)
        3. Protocolo de Titulação e Posologia Sugerida
        4. Medicina Baseada em Evidências (Citações estruturadas de estudos reais)
        5. Manejo de Riscos (Interações no citocromo P450 e contraindicações)
        
        6. **RESUMO DE PRESCRIÇÃO SUGERIDA** (Lista estrita, NÃO USE TABELAS):
           
           **OPÇÕES IMPORTADAS (CATÁLOGO OFICIAL):**
           (Para cada produto importado sugerido, use EXATAMENTE este bloco)
           **Medicamento**: (Nome fiel ao catálogo)
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação, ex: 2 gotas, 12 em 12 horas)
           **Observações**: (Dicas de administração)

           **OPÇÕES NACIONAIS (ASSOCIAÇÕES BRASILEIRAS):**
           (Para cada produto nacional sugerido - Óleos, Pomadas, Gomas ou Flores in natura, use EXATAMENTE este bloco)
           **Medicamento**: (Descrição da formulação, ex: Óleo CBD 50mg/ml + THC 2mg/ml - Associação Nacional)
           **Indicação/Doença**: (Condição primária alvo)
           **Modo de Uso**: (Posologia e titulação)
           **Observações**: (Dicas cruciais de administração e via de uso)

        IMPORTANTE: Destaque em **negrito** todos os fármacos, diagnósticos, enzimas (ex: CYP3A4) e dosagens para escaneabilidade médica de alto rendimento. NÃO USE TABELAS MARKDOWN PARA OS MEDICAMENTOS.
      `;

      const apiKey = process.env.GEMINI_API_KEY;
      let responseText = null;

      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ 
            apiKey,
            httpOptions: {}
          });
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          if (response.text) {
            responseText = response.text;
          }
        } catch (error) {
          console.warn("API Gemini Error, applying fallback protocol:", error);
          const { generateClinicalAnalysisFallback } = await import('../utils/aiAnalysisFallback');
          responseText = generateClinicalAnalysisFallback(prompt);
        }
      } else {
        const { generateClinicalAnalysisFallback } = await import('../utils/aiAnalysisFallback');
        responseText = generateClinicalAnalysisFallback(prompt);
      }

      if (responseText) {
        setAnalysisResult(responseText);
      } else {
        setAnalysisResult("Não foi possível gerar a análise. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao gerar análise:", error);
      setAnalysisResult(`Ocorreu um erro ao conectar com o servidor: ${error.message || 'Erro desconhecido'}. Verifique as configurações e tente novamente.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseMedications = (text: string) => {
    const medications: Array<{
      name: string;
      dosage: string;
      instructions: string;
      origin: 'Importado' | 'Nacional';
    }> = [];
    
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
            const rawName = cols[0].replace(/\*\*/g, '').trim();
            const isNational = /ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL/i.test(rawName);
            medications.push({
              name: rawName,
              dosage: cols[2].replace(/\*\*/g, '').trim(),
              instructions: cols[3] ? cols[3].replace(/\*\*/g, '').trim() : '',
              origin: isNational ? 'Nacional' : 'Importado'
            });
          }
        } else if (inTable && !line.trim().startsWith('|')) {
          inTable = false; // End of table
        }
      }
    }

    // If table parsing found nothing, try the list format with regex to handle inline fields
    if (medications.length === 0) {
      const blocks = text.split(/\bMedicamento\b/i);
      for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];
        
        // Extract fields using Regex, handling possible inline text
        const nameMatch = block.match(/.*?:\s*(.*?)(?=\bIndicação\b|\bIndicações\b|\bDoença\b|\bModo de Uso\b|\bObservações\b|$)/is);
        const dosageMatch = block.match(/\bModo de Uso\b.*?:\s*(.*?)(?=\bIndicação\b|\bIndicações\b|\bDoença\b|\bObservações\b|$)/is);
        const instructionsMatch = block.match(/\bObservações\b.*?:\s*(.*?)(?=\bIndicação\b|\bIndicações\b|\bDoença\b|\bModo de Uso\b|$)/is);
        
        if (nameMatch && nameMatch[1].trim()) {
          const rawName = nameMatch[1].replace(/\*\*/g, '').replace(/^- /, '').replace(/\*$/, '').trim();
          const isNational = /ÓLEO INTEGRAL|FLOR|FLORES|POMADA|GOMA|ASSOCIAÇÃO|NACIONAL/i.test(rawName) ||
                             block.includes('Associação') || block.includes('Nacional');

          medications.push({
            name: rawName,
            dosage: dosageMatch ? dosageMatch[1].replace(/\*\*/g, '').trim() : '',
            instructions: instructionsMatch ? instructionsMatch[1].replace(/\*\*/g, '').trim() : '',
            origin: isNational ? 'Nacional' : 'Importado'
          });
        }
      }
    }
    
    return medications;
  };

  const addPrescribedMedication = (med: any) => {
    // Add to addedMedications state
    setAddedMedications(prev => {
      if (!prev.includes(med.name)) {
        return [...prev, med.name];
      }
      return prev;
    });

    // Find product in productCategories
    let foundProduct = null;
    for (const category of productCategories) {
      const product = category.products.find(p => p.name.toLowerCase() === med.name.toLowerCase());
      if (product) {
        foundProduct = product;
        break;
      }
    }

    const enriched = enrichMedicationDetails(
      foundProduct ? foundProduct.name : med.name,
      foundProduct ? foundProduct.manufacturer : (med.origin === 'Nacional' ? 'Associação Brasileira' : 'GreenBudzCBD'),
      foundProduct ? foundProduct.origin : med.origin,
      foundProduct ? foundProduct.type : undefined
    );

    addMessage({
      text: `Prescrição de ${med.name}`,
      sender: 'doctor',
      type: 'product',
      productData: {
        name: foundProduct ? foundProduct.name : med.name,
        brand: foundProduct ? foundProduct.manufacturer : enriched.brand,
        origin: foundProduct ? foundProduct.origin : enriched.origin,
        type: foundProduct ? foundProduct.type : enriched.type,
        activeIngredients: enriched.activeIngredients,
        concentration: enriched.concentration,
        pharmaceuticalForm: enriched.pharmaceuticalForm,
        quantity: enriched.quantity,
        administrationRoute: enriched.administrationRoute,
        details: foundProduct && foundProduct.details ? foundProduct.details : [med.dosage, med.instructions, enriched.activeIngredients],
        dosage: [med.dosage || 'Tomar conforme orientação médica.'],
        description: foundProduct && foundProduct.description ? foundProduct.description : (med.instructions || enriched.description),
        italicText: foundProduct && foundProduct.italicText ? foundProduct.italicText : 'Produto Autorizado',
        image: foundProduct && foundProduct.image ? foundProduct.image : "https://images.unsplash.com/photo-1603903597871-3312c9ba4c81?q=80&w=400&auto=format&fit=crop",
        priceUSD: foundProduct && foundProduct.priceUSD ? foundProduct.priceUSD : undefined
      }
    });
    setShowAnalysisModal(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#050508] text-mecura-pearl overflow-hidden font-sans">
      <EnableNotificationsBanner userId={adminId} role="admin" />
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
            <img src="https://images.unsplash.com/photo-1594824436998-dd40e4f69d1b?q=80&w=100&auto=format&fit=crop" alt="Doctor" referrerPolicy="no-referrer" className="w-full h-full object-cover shrink-0 aspect-square" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full h-full min-h-0">
        {activeView === 'guide' && <CBDGuideView />}
        {activeView === 'analytics' && <DoctorAnalyticsDashboard />}
        {activeView === 'chat' && 
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full h-full min-h-0">
            {/* Queue Panel */}
            <div className={`w-full md:w-80 bg-[#0A0A0F] border-r border-mecura-elevated flex flex-col z-0 shadow-lg h-full min-h-0 flex-1 md:flex-none ${currentPatient ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 md:p-6 border-b border-mecura-elevated bg-mecura-surface/20 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white tracking-tight">Fila de Atendimento</h2>

                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mecura-silver" />
                  <input 
                    type="text" 
                    placeholder="Buscar paciente..." 
                    value={queueSearchTerm}
                    onChange={(e) => setQueueSearchTerm(e.target.value)}
                    className="w-full bg-mecura-surface/50 border border-mecura-elevated rounded-xl pl-10 pr-4 py-2.5 text-base md:text-sm focus:outline-none focus:border-mecura-neon/50 focus:bg-mecura-surface text-white transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pb-2">
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
        
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 custom-scrollbar">
          {queue.filter(p => (queueFilter === 'all' ? true : p.status === queueFilter) && p.patientName.toLowerCase().includes(queueSearchTerm.toLowerCase())).length > 0 ? (
            [...queue].filter(p => (queueFilter === 'all' ? true : p.status === queueFilter) && p.patientName.toLowerCase().includes(queueSearchTerm.toLowerCase())).sort((a, b) => {
              // 1. Unread messages first
              if (a.hasUnread && !b.hasUnread) return -1;
              if (!a.hasUnread && b.hasUnread) return 1;
              
              // 2. Status priority (in-consultation > waiting > finished)
              const statusWeight = { 'in-consultation': 0, 'waiting': 1, 'finished': 2 };
              const weightA = statusWeight[a.status as keyof typeof statusWeight] ?? 3;
              const weightB = statusWeight[b.status as keyof typeof statusWeight] ?? 3;
              if (weightA !== weightB) return weightA - weightB;

              // 3. Within same status
              if (a.status === 'finished') {
                // For finished, most recent (lastMessageAt) first
                if (a.lastMessageAt && b.lastMessageAt) {
                  return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
                }
                if (a.lastMessageAt) return -1;
                if (b.lastMessageAt) return 1;
                return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
              } else {
                // For active/waiting, oldest joined first
                return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
              }
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold text-base ${patient.hasUnread ? 'text-white' : 'text-mecura-pearl'}`}>{patient.patientName}</h3>
                    {(() => {
                      const bDate = patient.birthDate || patient.answers?.birthDate;
                      const age = calculateAge(bDate);
                      if (age !== null) {
                        return (
                          <span className="text-[10px] bg-mecura-surface-light border border-mecura-elevated text-mecura-silver px-1.5 py-0.5 rounded font-normal">
                            {age} anos
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
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
      <div className={`flex-1 flex flex-col bg-[#0A0A0F] relative h-full min-h-0 min-w-0 ${!currentPatient ? 'hidden md:flex' : mobileTab === 'chat' || mobileTab === 'actions' ? 'flex' : 'hidden md:flex'}`}>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#A6FF00 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        {/* Mobile Navigation Header & Tabs */}
        {currentPatient && (
          <div className="md:hidden flex-shrink-0 bg-[#0A0A0F] z-20">
            <div className="p-3 border-b border-mecura-elevated flex items-center justify-between">
              <button 
                onClick={() => setCurrentPatient(null)}
                className="text-mecura-silver hover:text-white flex items-center gap-1.5 text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Fila
              </button>
              <span className="text-white font-bold text-sm truncate max-w-[180px]">{currentPatient.patientName}</span>
              <span className="w-2 h-2 rounded-full bg-mecura-neon animate-pulse" />
            </div>

            <div className="flex border-b border-mecura-elevated bg-mecura-surface/80 p-2 gap-2">
              <button
                onClick={() => setMobileTab('chat')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mobileTab === 'chat' ? 'bg-mecura-neon text-black shadow-[0_0_15px_rgba(166,255,0,0.25)]' : 'bg-mecura-surface text-mecura-silver border border-mecura-elevated'}`}
              >
                <MessageSquare className="w-4 h-4" /> Chat
              </button>
              <button
                onClick={() => setMobileTab('ficha')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mobileTab === 'ficha' ? 'bg-mecura-neon text-black shadow-[0_0_15px_rgba(166,255,0,0.25)]' : 'bg-mecura-surface text-mecura-silver border border-mecura-elevated'}`}
              >
                <ClipboardList className="w-4 h-4" /> Ficha & IA
              </button>
              <button
                onClick={() => setMobileTab('actions')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mobileTab === 'actions' ? 'bg-mecura-neon text-black shadow-[0_0_15px_rgba(166,255,0,0.25)]' : 'bg-mecura-surface text-mecura-silver border border-mecura-elevated'}`}
              >
                <PlusCircle className="w-4 h-4" /> Ações
              </button>
            </div>
          </div>
        )}

        {/* Mobile Actions Hub view */}
        {currentPatient && mobileTab === 'actions' ? (
          <div className="md:hidden flex-1 bg-[#0A0A0F] p-4 md:p-6 space-y-4 overflow-y-auto min-h-0 custom-scrollbar">
            <h3 className="text-white font-bold text-lg mb-2">Ações Rápidas de Atendimento</h3>
            <button
              onClick={() => { setShowPrescriptionModal(true); }}
              className="w-full p-4 bg-mecura-surface border border-mecura-neon/30 rounded-2xl flex items-center gap-4 text-left hover:border-mecura-neon transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 flex items-center justify-center text-mecura-neon flex-shrink-0">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Prescrever Medicamento</h4>
                <p className="text-xs text-mecura-silver">Buscar no guia ou criar receita personalizada</p>
              </div>
            </button>

            <button
              onClick={() => { setShowHistoryModal(true); }}
              className="w-full p-4 bg-mecura-surface border border-mecura-elevated rounded-2xl flex items-center gap-4 text-left hover:border-mecura-neon/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Histórico de Consultas</h4>
                <p className="text-xs text-mecura-silver">Ver atendimentos e gráficos anteriores</p>
              </div>
            </button>

            <button
              onClick={handleGeneratePDF}
              className="w-full p-4 bg-mecura-surface border border-mecura-elevated rounded-2xl flex items-center gap-4 text-left hover:border-mecura-neon/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Baixar PDF da Receita</h4>
                <p className="text-xs text-mecura-silver">Gerar receita médica oficial formatada</p>
              </div>
            </button>

            <button
              onClick={handleGenerateMedicalReport}
              className="w-full p-4 bg-mecura-surface border border-mecura-elevated rounded-2xl flex items-center gap-4 text-left hover:border-amber-500/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Gerar Laudo Médico (PDF)</h4>
                <p className="text-xs text-mecura-silver">Laudo completo com diagnóstico, fisiopatologia e tratamentos</p>
              </div>
            </button>

            <button
              onClick={() => setShowAccessiblePlanModal(true)}
              className="w-full p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-4 text-left hover:border-emerald-500/60 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-bold text-base">Plano de Entrada Acessível</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Custo Reduzido</span>
                </div>
                <p className="text-xs text-mecura-silver">Iniciar com 1 produto de associação e evoluir gradualmente</p>
              </div>
            </button>

            <button
              onClick={handleFinishConsultation}
              className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-left hover:bg-red-500/20 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-red-400 font-bold text-base">Finalizar Consulta</h4>
                <p className="text-xs text-mecura-silver">Encerrar atendimento e enviar orientações finais</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
            <div className="h-16 md:h-20 border-b border-mecura-elevated flex items-center justify-between px-4 md:px-8 bg-[#0A0A0F]/80 backdrop-blur-md z-10 flex-shrink-0">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-mecura-surface-light overflow-hidden border border-mecura-elevated flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-mecura-silver" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-white tracking-tight truncate max-w-[150px] md:max-w-xs">{currentPatient?.patientName || userName || 'Paciente Atual'}</h2>
                  <p className="text-[10px] md:text-xs text-mecura-silver font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-mecura-neon shadow-[0_0_8px_rgba(166,255,0,0.5)]" /> Online agora
                  </p>
                </div>
              </div>
              <div className="flex gap-2 md:gap-3 overflow-x-auto custom-scrollbar pb-1 md:pb-0 items-center">
                <button
                  onClick={async () => {
                    const targetPatient = currentPatient || queue.find(p => p.status === 'waiting');
                    if (targetPatient) {
                      try {
                        // 1. Send Background Push Notification (if they have app closed)
                        const { triggerBackgroundPush } = await import('../utils/notifications');
                        triggerBackgroundPush(
                          targetPatient.id,
                          'Sua vez chegou!',
                          'O médico está te chamando no consultório agora. Clique para abrir.',
                          '/chat'
                        ).catch(() => {});
                        
                        // 2. Send an automated chat message that will definitively trigger their UI
                        // This guarantees delivery if they are already in the app/chat
                        const { collection, doc, setDoc } = await import('firebase/firestore');
                        const { db } = await import('../firebase');
                        
                        const msgRef = doc(collection(db, 'active_consultations', targetPatient.id, 'messages'));
                        await setDoc(msgRef, {
                          id: msgRef.id,
                          text: "🔔 SUA VEZ CHEGOU! O médico está te chamando no consultório agora.",
                          sender: 'doctor',
                          type: 'text',
                          timestamp: new Date().toISOString()
                        });
                        
                        // Also update the queue so the patient side can react if they are on the QueueScreen
                        const patientRef = doc(db, 'queue', targetPatient.id);
                        await setDoc(patientRef, { isAlerted: Date.now() }, { merge: true });

                        alert(`Alerta enviado para ${targetPatient.patientName || 'o paciente'} com sucesso!`);
                        
                        // Auto-select if it was the first waiting one
                        if (!currentPatient && targetPatient.status === 'waiting') {
                           handleStartConsultation(targetPatient);
                        }
                      } catch (e) {
                        console.error(e);
                        alert('Erro ao enviar alerta.');
                      }
                    } else {
                      alert('Nenhum paciente aguardando na fila.');
                    }
                  }}
                  title="Chamar Paciente"
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon rounded-xl text-xs md:text-sm font-bold hover:bg-mecura-neon hover:text-black transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(166,255,0,0.1)]"
                >
                  <Bell className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Chamar Paciente</span><span className="md:hidden">Chamar</span>
                </button>
                <button 
                  onClick={() => setShowHistoryModal(true)}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-mecura-surface border border-mecura-elevated rounded-xl text-xs md:text-sm font-medium hover:bg-mecura-surface-light transition-colors flex items-center gap-1 md:gap-2 text-white whitespace-nowrap"
                  title="Histórico de Consultas"
                >
                  <FileText className="w-3 h-3 md:w-4 md:h-4 text-mecura-silver" /> <span className="hidden md:inline">Histórico</span>
                </button>
                <button 
                  onClick={() => setShowPrescriptionModal(true)}
                  className="px-3 md:px-5 py-2 md:py-2.5 bg-mecura-neon text-black rounded-xl text-xs md:text-sm font-bold hover:bg-[#b5ff33] transition-colors flex items-center gap-1 md:gap-2 shadow-[0_0_20px_rgba(166,255,0,0.15)] whitespace-nowrap"
                  title="Prescrever Medicamentos"
                >
                  <PlusCircle className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Prescrever</span>
                </button>
                {messages.some(m => m.type === 'product' || m.type === 'prescription' || m.type === 'prescription_notes') && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClearAllPrescriptions();
                    }}
                    className="px-3 md:px-4 py-2 md:py-2.5 bg-red-500/15 border border-red-500/35 text-red-400 rounded-xl text-xs md:text-sm font-semibold hover:bg-red-500/25 hover:border-red-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(239,68,68,0.15)] cursor-pointer"
                    title="Limpar todos os medicamentos e prescrições desta consulta para recomeçar do zero"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-400" /> <span className="hidden md:inline">Limpar Prescrições</span><span className="md:hidden">Limpar</span>
                  </button>
                )}
                <button 
                  onClick={() => setShowAccessiblePlanModal(true)}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-emerald-500/25 hover:border-emerald-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  title="Prescrever Plano Acessível de Associação Nacional com Evolução Escalonada"
                >
                  <HeartHandshake className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" /> <span className="hidden md:inline">Plano Acessível</span><span className="md:hidden">Acessível</span>
                </button>
                <button 
                  onClick={handleGeneratePDF}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-mecura-surface border border-mecura-elevated rounded-xl text-xs md:text-sm font-medium hover:bg-mecura-surface-light hover:text-mecura-neon transition-colors flex items-center gap-1 md:gap-2 text-white whitespace-nowrap"
                  title="Baixar Receita Médica (PDF)"
                >
                  <Download className="w-3 h-3 md:w-4 md:h-4 text-mecura-silver" /> <span className="hidden md:inline">Receita</span><span className="md:hidden">PDF</span>
                </button>
                <button 
                  onClick={handleGenerateMedicalReport}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-amber-500/20 hover:border-amber-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  title="Gerar Laudo Médico Detalhado (PDF)"
                >
                  <FileCheck className="w-3 h-3 md:w-4 md:h-4 text-amber-400" /> <span className="hidden md:inline">Laudo Médico</span><span className="md:hidden">Laudo</span>
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
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 z-0 min-h-0 custom-scrollbar">
            <div className="flex justify-center mb-6 md:mb-8">
              <span className="text-xs font-medium text-mecura-silver bg-mecura-surface/50 px-4 py-1.5 rounded-full border border-mecura-elevated backdrop-blur-sm">
                Consulta iniciada hoje
              </span>
            </div>
            
            <div>
              {messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).map((msg) => (
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
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className={`${msg.sender === 'doctor' ? 'text-white' : 'text-black'} font-bold text-base leading-tight flex-1`}>
                                {msg.productData.name}
                              </h3>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemovePrescribedMedication(msg.id, msg.productData?.name);
                                }}
                                className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer active:scale-95"
                                title="Remover este medicamento da prescrição"
                              >
                                <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                                <span className="pointer-events-none">Remover</span>
                              </button>
                            </div>
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
                    <div className="w-[85%] max-w-2xl bg-mecura-surface border border-mecura-neon/30 rounded-2xl p-6 mb-2 shadow-xl relative overflow-hidden group">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemovePrescribedMedication(msg.id, 'Orientações da Prescrição');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all z-20 shadow-sm cursor-pointer active:scale-95"
                        title="Remover estas orientações da prescrição"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
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
                    <div className="w-[70%] max-w-xl bg-gradient-to-r from-mecura-surface to-mecura-surface-light border border-mecura-neon/30 rounded-2xl p-5 mb-2 shadow-lg relative overflow-hidden group">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemovePrescribedMedication(msg.id, 'Receita Digital');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all z-20 shadow-sm cursor-pointer active:scale-95"
                        title="Remover receita digital"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
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
                          className="w-full py-4 bg-[#A6FF00] text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:bg-[#b5ff33] transition-colors"
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
                className="flex-1 h-12 md:h-14 bg-mecura-surface border border-mecura-elevated rounded-full px-4 md:px-6 text-white focus:outline-none focus:border-mecura-neon/50 focus:bg-mecura-surface-light transition-all text-base md:text-[15px]"
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
      )}
      </div>

      {/* Right Sidebar - Patient Record (Anamnese) */}
      <div className={`w-full md:w-80 bg-[#0A0A0F] border-t md:border-t-0 md:border-l border-mecura-elevated flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-10 h-full min-h-0 flex-1 md:flex-none ${!currentPatient ? 'hidden md:flex' : mobileTab === 'ficha' ? 'flex' : 'hidden md:flex'}`}>
        {/* Mobile Navigation Header & Tabs */}
        {currentPatient && (
          <div className="md:hidden flex-shrink-0 bg-[#0A0A0F] z-20">
            <div className="p-3 border-b border-mecura-elevated flex items-center justify-between">
              <button 
                onClick={() => setCurrentPatient(null)}
                className="text-mecura-silver hover:text-white flex items-center gap-1.5 text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Fila
              </button>
              <span className="text-white font-bold text-sm truncate max-w-[180px]">{currentPatient.patientName}</span>
              <span className="w-2 h-2 rounded-full bg-mecura-neon animate-pulse" />
            </div>

            <div className="flex border-b border-mecura-elevated bg-mecura-surface/80 p-2 gap-2">
              <button
                onClick={() => setMobileTab('chat')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mobileTab === 'chat' ? 'bg-mecura-neon text-black shadow-[0_0_15px_rgba(166,255,0,0.25)]' : 'bg-mecura-surface text-mecura-silver border border-mecura-elevated'}`}
              >
                <MessageSquare className="w-4 h-4" /> Chat
              </button>
              <button
                onClick={() => setMobileTab('ficha')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mobileTab === 'ficha' ? 'bg-mecura-neon text-black shadow-[0_0_15px_rgba(166,255,0,0.25)]' : 'bg-mecura-surface text-mecura-silver border border-mecura-elevated'}`}
              >
                <ClipboardList className="w-4 h-4" /> Ficha & IA
              </button>
              <button
                onClick={() => setMobileTab('actions')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mobileTab === 'actions' ? 'bg-mecura-neon text-black shadow-[0_0_15px_rgba(166,255,0,0.25)]' : 'bg-mecura-surface text-mecura-silver border border-mecura-elevated'}`}
              >
                <PlusCircle className="w-4 h-4" /> Ações
              </button>
            </div>
          </div>
        )}

        <div className="p-4 md:p-6 border-b border-mecura-elevated bg-mecura-surface/20 flex justify-between items-center flex-shrink-0">
          <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-mecura-neon" />
            Ficha do Paciente
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar min-h-0">
          {/* AI Analysis Button */}
          <div className="space-y-4">
            <div 
              onClick={() => handleGenerateAnalysis()}
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
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateAnalysis(true);
                      }}
                      disabled={isAnalyzing}
                      className="p-2 hover:bg-white/10 rounded-lg text-mecura-silver hover:text-mecura-neon transition-colors"
                      title="Re-gerar Análise (Importados e Nacionais)"
                    >
                      <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-mecura-neon' : ''}`} />
                    </button>
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
                  </>
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
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-white">Medicamentos Sugeridos</h4>
                          <span className="text-[10px] text-mecura-silver">Importados & Associações</span>
                        </div>
                        <div className="space-y-2.5">
                          {parseMedications(analysisResult).filter(med => med.name).map((med, idx) => {
                            const isAdded = addedMedications.includes(med.name);
                            const isNational = med.origin === 'Nacional';
                            return (
                              <button
                                key={idx}
                                onClick={() => addPrescribedMedication(med)}
                                disabled={isAdded}
                                className={`w-full p-3 border rounded-xl text-left transition-all group relative overflow-hidden ${
                                  isAdded 
                                    ? 'bg-mecura-neon/10 border-mecura-neon cursor-default' 
                                    : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50 cursor-pointer'
                                }`}
                              >
                                {isAdded && (
                                  <div className="absolute top-0 right-0 p-2 text-mecura-neon bg-mecura-neon/20 rounded-bl-xl shadow-sm">
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                    isNational 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  }`}>
                                    {isNational ? '🇧🇷 Associação Nacional' : '🌐 Importado'}
                                  </span>
                                </div>
                                <h5 className={`font-bold text-xs mb-0.5 transition-colors ${
                                  isAdded ? 'text-mecura-neon' : 'text-white group-hover:text-mecura-neon'
                                }`}>{med.name}</h5>
                                <p className="text-[10px] text-mecura-silver pr-8 leading-tight">{med.dosage}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Accessible Plan Callout Banner */}
                      <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-1.5">
                          <HeartHandshake className="w-4 h-4 text-emerald-400" />
                          <h5 className="text-xs font-bold text-emerald-300">Paciente com Restrição Orçamentária?</h5>
                        </div>
                        <p className="text-[11px] text-mecura-silver mb-2.5 leading-snug">
                          Prescreva o plano de entrada com 1 frasco de alto rendimento de Associação Nacional e evolução progressiva.
                        </p>
                        <button
                          onClick={() => setShowAccessiblePlanModal(true)}
                          className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          Aplicar Protocolo Acessível
                        </button>
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

          {/* Section: Patient Demographics */}
          {(() => {
            const patientAnswers = currentPatient?.answers || answers;
            const pName = currentPatient?.patientName || userName || 'Paciente';
            const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || userBirthDate;
            const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf;
            const pPhone = currentPatient?.phone || patientAnswers?.phone || userPhone;
            const pEmail = currentPatient?.email || (currentPatient?.answers?.email) || '';
            const pAge = calculateAge(pBirthDate);

            return (
              <section>
                <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-mecura-neon" /> Dados Cadastrais
                </h3>
                <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-mecura-elevated/40 pb-2.5">
                    <span className="text-xs text-mecura-silver">Nome Completo</span>
                    <span className="text-sm font-bold text-white text-right">{pName}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-mecura-elevated/40 pb-2.5">
                    <span className="text-xs text-mecura-silver">Data de Nascimento</span>
                    <span className="text-sm font-bold text-mecura-neon flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-mecura-neon" />
                      {pBirthDate || 'Não informada'}
                      {pAge !== null && (
                        <span className="text-xs font-normal text-mecura-silver bg-mecura-surface-light px-2 py-0.5 rounded-md">
                          {pAge} anos
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-mecura-elevated/40 pb-2.5">
                    <span className="text-xs text-mecura-silver">CPF</span>
                    <span className="text-sm font-medium text-white">{pCpf || 'Não informado'}</span>
                  </div>

                  {(pPhone || pEmail) && (
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-xs text-mecura-silver">Contato</span>
                      <span className="text-xs text-mecura-pearl text-right">
                        {pPhone && <span className="block font-medium text-white">{pPhone}</span>}
                        {pEmail && !pEmail.includes('sem-email') && <span className="block text-[#8A8A9E]">{pEmail}</span>}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

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
        }
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
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">Medicamentos Sugeridos</h3>
                        <p className="text-sm text-mecura-silver">Selecione opções importadas ou nacionais de associações brasileiras</p>
                      </div>
                      <span className="text-xs px-3 py-1 bg-mecura-surface border border-mecura-elevated rounded-full text-mecura-silver">
                        {parseMedications(analysisResult).filter(med => med.name).length} opções disponíveis
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parseMedications(analysisResult).filter(med => med.name).map((med, idx) => {
                        const isAdded = addedMedications.includes(med.name);
                        const isNational = med.origin === 'Nacional';
                        return (
                          <button
                            key={idx}
                            onClick={() => addPrescribedMedication(med)}
                            disabled={isAdded}
                            className={`p-4 border rounded-xl text-left transition-all group relative overflow-hidden ${
                              isAdded
                                ? 'bg-mecura-neon/10 border-mecura-neon cursor-default'
                                : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50 cursor-pointer'
                            }`}
                          >
                            {isAdded && (
                              <div className="absolute top-0 right-0 p-3 text-mecura-neon bg-mecura-neon/20 rounded-bl-xl shadow-sm">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                isNational 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}>
                                {isNational ? '🇧🇷 Associação Nacional' : '🌐 Importado'}
                              </span>
                            </div>
                            <h4 className={`font-bold mb-1 transition-colors ${
                              isAdded ? 'text-mecura-neon' : 'text-white group-hover:text-mecura-neon'
                            }`}>{med.name}</h4>
                            <p className="text-xs text-mecura-silver mb-3 pr-10">{med.dosage}</p>
                            <span className="text-[10px] font-bold text-mecura-neon uppercase">
                              {isAdded ? 'Adicionado ao Chat' : 'Adicionar ao Chat'}
                            </span>
                          </button>
                        );
                      })}
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
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setShowAccessiblePlanModal(true);
                    }}
                    className="px-5 py-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  >
                    <HeartHandshake className="w-4 h-4 text-emerald-400" />
                    Plano Acessível (Entrada)
                  </button>
                  <button 
                    onClick={() => {
                      handleGenerateMedicalReport();
                    }}
                    className="px-5 py-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-sm font-bold hover:bg-amber-500/30 transition-all flex items-center gap-2"
                  >
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    Gerar Laudo Médico (PDF)
                  </button>
                  <button 
                    onClick={() => setShowAnalysisModal(false)}
                    className="px-8 py-2.5 bg-mecura-surface border border-mecura-elevated rounded-xl text-sm font-bold text-white hover:bg-mecura-surface-light transition-all hover:scale-105 active:scale-95"
                  >
                    Fechar Análise
                  </button>
                </div>
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
              {/* Accessible Plan Shortcut Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">Paciente precisa de opção mais acessível?</h4>
                    <p className="text-xs text-mecura-silver">Inicie com 1 medicamento de associação e posologia escalonada</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setShowAccessiblePlanModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-sm"
                >
                  Abrir Protocolo Acessível
                </button>
              </div>

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
                    {productCategories.flatMap(cat => cat.products)
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

        {/* Modal de Plano de Entrada Acessível (Associação Nacional + Evolução Escalonada) */}
        {showAccessiblePlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setShowAccessiblePlanModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#0F1017] border border-emerald-500/30 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col max-h-[92vh] z-10"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-transparent flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        Protocolo de Entrada Acessível
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Associação Nacional
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-mecura-silver leading-relaxed">
                      Alternativa com excelente custo-benefício para iniciar com <strong>01 frasco de alto rendimento (~60 dias)</strong> e evoluir progressivamente conforme a resposta clínica e as condições do paciente.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAccessiblePlanModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-mecura-silver hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Step 1: Select Formulation */}
                <div>
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold border border-emerald-500/30">1</span>
                    Selecione a Formulação de Entrada (Frasco Único de 30ml)
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Option CBD */}
                    <div 
                      onClick={() => setAccessibleType('cbd')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        accessibleType === 'cbd'
                          ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-emerald-500/40 hover:bg-mecura-surface/70'
                      }`}
                    >
                      {accessibleType === 'cbd' && (
                        <div className="absolute top-2 right-2 text-emerald-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 inline-block mb-2">
                          Ansiedade / Estresse / Foco
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          Óleo Integral CBD 100mg/ml
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Alta concentração de Canabidiol. Ação ansiolítica, reguladora do humor e anti-inflamatória.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-emerald-400 font-semibold flex items-center justify-between">
                        <span>30ml • Rende ~60 dias</span>
                        <span className="text-white/80">3 gotas 2x/dia</span>
                      </div>
                    </div>

                    {/* Option Balanced */}
                    <div 
                      onClick={() => setAccessibleType('balanced')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        accessibleType === 'balanced'
                          ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-emerald-500/40 hover:bg-mecura-surface/70'
                      }`}
                    >
                      {accessibleType === 'balanced' && (
                        <div className="absolute top-2 right-2 text-emerald-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/30 inline-block mb-2">
                          Dor Crônica / Rigidez / 1:1
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          Óleo Integral THC/CBD 100mg/ml
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Proporção equilibrada 1:1 para analgesia, controle de espasmos musculares e fibromialgia.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-teal-400 font-semibold flex items-center justify-between">
                        <span>30ml • Rende ~60 dias</span>
                        <span className="text-white/80">3 gotas 12/12h</span>
                      </div>
                    </div>

                    {/* Option THC */}
                    <div 
                      onClick={() => setAccessibleType('thc')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        accessibleType === 'thc'
                          ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-emerald-500/40 hover:bg-mecura-surface/70'
                      }`}
                    >
                      {accessibleType === 'thc' && (
                        <div className="absolute top-2 right-2 text-emerald-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 inline-block mb-2">
                          Insônia Grave / Dor Noturna
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          Óleo Integral THC 100mg/ml
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Predominância de THC para indução fisiológica do sono e alívio rápido de crises álgicas noturnas.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-amber-400 font-semibold flex items-center justify-between">
                        <span>30ml • Rende ~60-90 dias</span>
                        <span className="text-white/80">4-6 gotas à noite</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Evolution Timeline */}
                <div className="p-4 bg-mecura-surface/30 border border-mecura-elevated rounded-2xl">
                  <label className="text-xs font-bold text-white uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Plano de Evolução do Tratamento
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <h5 className="text-xs font-bold text-emerald-300">Fase 1: Início Acessível (Meses 1 e 2)</h5>
                      </div>
                      <p className="text-[11px] text-mecura-silver leading-relaxed">
                        Uso exclusivo do frasco de Associação Nacional com titulação lenta (inicia com 3 gotas e ajusta 1 gota a cada 5 dias). Custo previsível e baixo consumo.
                      </p>
                    </div>

                    <div className="p-3.5 bg-blue-950/20 border border-blue-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <h5 className="text-xs font-bold text-blue-300">Fase 2: Reavaliação (Mês 2 em diante)</h5>
                      </div>
                      <p className="text-[11px] text-mecura-silver leading-relaxed">
                        Retorno clínico. Se houver controle adequado (superior a 70%), mantém apenas a monoterapia. Caso persistam sintomas específicos e haja viabilidade financeira, associar pomada ou gomas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Empathetic Patient Message Preview */}
                <div>
                  <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      Mensagem Acolhedora para o Paciente (Chat)
                    </span>
                    <span className="text-[10px] text-mecura-silver lowercase font-normal">(Editável antes do envio)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={accessibleCustomMessage || `Olá ${currentPatient?.patientName || userName || 'Paciente'}! Pensando na sua acessibilidade e conforto financeiro, estruturei um Protocolo de Entrada Acessível através de Associação Brasileira autorizada.\n\nIniciaremos com apenas 01 medicamento essencial de alto rendimento que dura cerca de 2 meses com a posologia inicial.\n\nVamos acompanhar sua resposta e, conforme sua evolução e condições futuras, poderemos ajustar as doses ou introduzir novos itens se houver real necessidade. Conte sempre com nosso apoio!`}
                    onChange={(e) => setAccessibleCustomMessage(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 md:p-8 border-t border-emerald-500/20 bg-mecura-surface/30 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button 
                  onClick={() => setShowAccessiblePlanModal(false)}
                  className="w-full sm:w-auto px-6 py-3 bg-transparent border border-mecura-elevated rounded-xl text-xs md:text-sm font-bold text-mecura-silver hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      handleGeneratePDF();
                    }}
                    className="flex-1 sm:flex-none px-4 py-3 bg-mecura-surface border border-mecura-elevated rounded-xl text-xs md:text-sm font-semibold text-white hover:bg-mecura-surface-light transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-mecura-silver" />
                    Baixar Receita PDF
                  </button>
                  <button 
                    onClick={() => handleApplyAccessiblePlan(accessibleType, accessibleCustomMessage)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold text-xs md:text-sm rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Prescrever e Enviar ao Paciente
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prescription View & Edit Modal */}
      <PrescriptionEditorModal
        isOpen={showPrescriptionEditorModal}
        onClose={() => setShowPrescriptionEditorModal(false)}
        patientName={prescPatientName}
        setPatientName={setPrescPatientName}
        birthDate={prescBirthDate}
        setBirthDate={setPrescBirthDate}
        cpf={prescCpf}
        setCpf={setPrescCpf}
        emissionDate={prescEmissionDate}
        setEmissionDate={setPrescEmissionDate}
        doctorName={prescDoctorName}
        setDoctorName={setPrescDoctorName}
        doctorCrm={prescDoctorCrm}
        setDoctorCrm={setPrescDoctorCrm}
        doctorSpecialty={prescDoctorSpecialty}
        setDoctorSpecialty={setPrescDoctorSpecialty}
        items={prescItems}
        setItems={setPrescItems}
        notes={prescNotes}
        setNotes={setPrescNotes}
        onDownloadPDF={handleDownloadPrescriptionFromEditor}
      />

      {/* Medical Report (Laudo Médico) View & Edit Modal */}
      <MedicalReportEditorModal
        isOpen={showMedicalReportEditorModal}
        onClose={() => setShowMedicalReportEditorModal(false)}
        patientName={reportPatientName}
        setPatientName={setReportPatientName}
        birthDate={reportBirthDate}
        setBirthDate={setReportBirthDate}
        cpf={reportCpf}
        setCpf={setReportCpf}
        emissionDate={reportEmissionDate}
        setEmissionDate={setReportEmissionDate}
        doctorName={reportDoctorName}
        setDoctorName={setReportDoctorName}
        doctorCrm={reportDoctorCrm}
        setDoctorCrm={setReportDoctorCrm}
        doctorSpecialty={reportDoctorSpecialty}
        setDoctorSpecialty={setReportDoctorSpecialty}
        diagnosis={reportDiagnosis}
        setDiagnosis={setReportDiagnosis}
        rationale={reportRationale}
        setRationale={setReportRationale}
        treatmentPlan={reportTreatmentPlan}
        setTreatmentPlan={setReportTreatmentPlan}
        monitoring={reportMonitoring}
        setMonitoring={setReportMonitoring}
        onDownloadPDF={handleDownloadMedicalReportFromEditor}
      />
    </div>
  );
}
