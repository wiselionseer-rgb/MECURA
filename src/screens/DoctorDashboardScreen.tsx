import { useAdminStore } from '../store/useAdminStore';
import { useState, useEffect, useRef, useMemo } from 'react';
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
  Sprout,
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
  ChevronRight,
  Info,
  Filter,
  Tag,
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
  RotateCcw,
  Sliders,
  Star,
  Check,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Crown
} from 'lucide-react';
import { format } from 'date-fns';

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.182-.076.355.101.173.45 1.085 1.276 1.821.65.579 1.199.759 1.372.845.173.086.274.072.375-.044.101-.116.433-.505.549-.679.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
  </svg>
);
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
import { cbdGuideData, CBDProduct, enrichMedicationDetails, CBDCategory } from '../data/cbdGuide';
import { mergeProductCatalogs, subscribeToFirestoreCatalog, extractAllBrands, extractAllDiseases } from '../utils/productCatalog';
import { FLOWERMED_PRODUCTS } from '../data/flowermedCatalog';
import { FLOWER_EXTRACTIONS_PRODUCTS } from '../data/flowerExtractionsCatalog';
import { NotificationToast } from '../components/NotificationToast';
import { EnableNotificationsBanner } from '../components/EnableNotificationsBanner';
import { PrescriptionEditorModal } from '../components/PrescriptionEditorModal';
import { MedicalReportEditorModal } from '../components/MedicalReportEditorModal';
import { PsychomotorReportEditorModal } from '../components/PsychomotorReportEditorModal';
import { AgronomicReportEditorModal } from '../components/AgronomicReportEditorModal';

import { generatePrescriptionPDF, generateMedicalReportPDF, generatePsychomotorReportPDF, generateAgronomicReportPDF, PrescriptionItemData } from '../utils/pdfGenerator';

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
  const { productCategories: storeProductCategories } = useAdminStore();
  const [cloudCategories, setCloudCategories] = useState<CBDCategory[]>([]);

  useEffect(() => {
    const unsub = subscribeToFirestoreCatalog((cats) => {
      if (cats && cats.length > 0) {
        setCloudCategories(cats);
      }
    });
    return () => unsub();
  }, []);

  const productCategories = useMemo(() => {
    return mergeProductCatalogs(cbdGuideData, storeProductCategories, cloudCategories);
  }, [storeProductCategories, cloudCategories]);
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
  const [brandPreference, setBrandPreference] = useState<'flowermed' | 'greenbudz' | 'both'>('both');
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
  const [showAccessibleImportModal, setShowAccessibleImportModal] = useState(false);
  const [accessibleImportType, setAccessibleImportType] = useState<'cbd' | 'balanced' | 'thc'>('cbd');
  const [accessibleImportCustomMessage, setAccessibleImportCustomMessage] = useState('');
  const [accessibleType, setAccessibleType] = useState<'cbd' | 'balanced' | 'thc'>('cbd');
  const [accessibleCustomMessage, setAccessibleCustomMessage] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productBrandFilter, setProductBrandFilter] = useState('all');
  const [productDiseaseFilter, setProductDiseaseFilter] = useState('all');
  const [productDiseaseSearchInput, setProductDiseaseSearchInput] = useState('');
  const [productOriginFilter, setProductOriginFilter] = useState<'all' | 'nacional' | 'importado'>('all');

  // Horizontal Drag & Scroll refs for shortcuts
  const shortcutsContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingShortcuts = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const dragMoved = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const handleShortcutsMouseDown = (e: React.MouseEvent) => {
    if (!shortcutsContainerRef.current) return;
    isDraggingShortcuts.current = true;
    dragMoved.current = false;
    dragStartX.current = e.pageX - shortcutsContainerRef.current.offsetLeft;
    dragScrollLeft.current = shortcutsContainerRef.current.scrollLeft;
    setIsDraggingState(true);
  };

  const handleShortcutsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingShortcuts.current || !shortcutsContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - shortcutsContainerRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    if (Math.abs(walk) > 4) {
      dragMoved.current = true;
    }
    shortcutsContainerRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const handleShortcutsMouseUpOrLeave = () => {
    isDraggingShortcuts.current = false;
    setIsDraggingState(false);
  };

  const handleShortcutsWheel = (e: React.WheelEvent) => {
    if (shortcutsContainerRef.current && e.deltaY !== 0) {
      shortcutsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollShortcuts = (direction: 'left' | 'right') => {
    if (shortcutsContainerRef.current) {
      const offset = direction === 'left' ? -240 : 240;
      shortcutsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const availableBrands = useMemo(() => extractAllBrands(productCategories), [productCategories]);
  const availableDiseases = useMemo(() => extractAllDiseases(productCategories), [productCategories]);

  const allGuideProducts = useMemo(() => {
    const map = new Map<string, CBDProduct & { categoryTitle?: string; categoryIndications?: string[] }>();
    productCategories.forEach(cat => {
      cat.products.forEach(p => {
        const key = (p.name || '').trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            ...p,
            categoryTitle: cat.title,
            categoryIndications: cat.indicationsList || []
          });
        } else {
          const existing = map.get(key)!;
          if (cat.indicationsList) {
            const setInd = new Set([...(existing.categoryIndications || []), ...cat.indicationsList]);
            existing.categoryIndications = Array.from(setInd);
          }
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [productCategories]);

  // High-precision accent-insensitive normalization
  const normalizeSearch = (str: string = '') => {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_.,;:/\\()[\]{}!?"'#@%&*+=]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizeCompactStr = (str: string = '') => {
    return normalizeSearch(str).replace(/\s+/g, '');
  };

  const { filteredGuideProducts, totalMatchingQueryWithoutDisease, isRelaxedForQuery } = useMemo(() => {
    const termClean = normalizeSearch(productSearchTerm);
    const termCompact = normalizeCompactStr(productSearchTerm);
    const queryTokens = termClean.split(' ').filter(Boolean);

    const diseaseRaw = (productDiseaseFilter !== 'all' ? productDiseaseFilter : productDiseaseSearchInput).trim();
    const diseaseClean = normalizeSearch(diseaseRaw);
    const diseaseCompact = normalizeCompactStr(diseaseRaw);

    const brandFilterClean = normalizeSearch(productBrandFilter !== 'all' ? productBrandFilter : '');
    const brandFilterCompact = normalizeCompactStr(productBrandFilter !== 'all' ? productBrandFilter : '');

    const fullMatches: (CBDProduct & { categoryTitle?: string; categoryIndications?: string[] })[] = [];
    const textAndBrandMatches: (CBDProduct & { categoryTitle?: string; categoryIndications?: string[] })[] = [];

    allGuideProducts.forEach(p => {
      const pName = normalizeSearch(p.name);
      const pManuf = normalizeSearch(p.manufacturer);
      const pType = normalizeSearch(p.type);
      const pActive = normalizeSearch(p.activeIngredients);
      const pConc = normalizeSearch(p.concentration);
      const pDesc = normalizeSearch(p.description);
      const pRoute = normalizeSearch(p.administrationRoute);
      const pForm = normalizeSearch(p.pharmaceuticalForm);
      const pDetails = (p.details || []).map(d => normalizeSearch(d)).join(' ');
      const pInd = normalizeSearch(p.indications);
      const pCatInd = (p.categoryIndications || []).map(ci => normalizeSearch(ci)).join(' ');
      const pCatTitle = normalizeSearch(p.categoryTitle);
      const pOrigin = normalizeSearch(p.origin);

      const combinedText = `${pName} ${pManuf} ${pType} ${pActive} ${pConc} ${pDesc} ${pRoute} ${pForm} ${pDetails} ${pInd} ${pCatInd} ${pCatTitle}`;
      const compactManuf = normalizeCompactStr(p.manufacturer);
      const compactName = normalizeCompactStr(p.name);
      const compactCombined = normalizeCompactStr(`${pName} ${pManuf} ${pType} ${pActive} ${pConc}`);

      // 1. Text search match (matches brand names, formula, name, tokens, compact strings)
      let textOk = true;
      if (queryTokens.length > 0) {
        if (
          compactManuf.includes(termCompact) || 
          termCompact.includes(compactManuf) ||
          compactName.includes(termCompact) ||
          termCompact.includes(compactName) ||
          compactCombined.includes(termCompact)
        ) {
          textOk = true;
        } else {
          textOk = queryTokens.every(tok => 
            combinedText.includes(tok) || 
            compactCombined.includes(tok) ||
            pManuf.includes(tok) ||
            pName.includes(tok)
          );
        }
      }

      // 2. Brand select match
      let brandOk = true;
      if (productBrandFilter !== 'all') {
        brandOk = pManuf === brandFilterClean || 
                  compactManuf === brandFilterCompact || 
                  pManuf.includes(brandFilterClean) || 
                  brandFilterClean.includes(pManuf) ||
                  compactManuf.includes(brandFilterCompact);
      }

      // 3. Origin match
      let originOk = true;
      if (productOriginFilter !== 'all') {
        if (productOriginFilter === 'nacional') {
          originOk = pOrigin.includes('nacional') || pOrigin.includes('br');
        } else if (productOriginFilter === 'importado') {
          originOk = pOrigin.includes('importado') || pOrigin.includes('eua') || pOrigin.includes('usa');
        }
      }

      if (textOk && brandOk && originOk) {
        textAndBrandMatches.push(p);

        // 4. Disease match
        let diseaseOk = true;
        if (diseaseClean) {
          const diseaseCombined = `${pInd} ${pCatInd} ${pDesc} ${pCatTitle} ${pName}`;
          const diseaseCombinedCompact = normalizeCompactStr(diseaseCombined);

          if (diseaseCombinedCompact.includes(diseaseCompact) || diseaseCombined.includes(diseaseClean)) {
            diseaseOk = true;
          } else {
            const dTokens = diseaseClean.split(' ').filter(t => t.length > 2);
            diseaseOk = dTokens.some(tok => diseaseCombined.includes(tok) || diseaseCombinedCompact.includes(tok));
          }
        }

        if (diseaseOk) {
          fullMatches.push(p);
        }
      }
    });

    // Smart fallback: if searching specifically by brand or term and disease filter leaves 0 results, relax the disease filter
    if ((queryTokens.length > 0 || productBrandFilter !== 'all') && diseaseClean && fullMatches.length === 0 && textAndBrandMatches.length > 0) {
      return {
        filteredGuideProducts: textAndBrandMatches,
        totalMatchingQueryWithoutDisease: textAndBrandMatches.length,
        isRelaxedForQuery: true
      };
    }

    return {
      filteredGuideProducts: fullMatches,
      totalMatchingQueryWithoutDisease: textAndBrandMatches.length,
      isRelaxedForQuery: false
    };
  }, [allGuideProducts, productSearchTerm, productBrandFilter, productOriginFilter, productDiseaseFilter, productDiseaseSearchInput]);
  const [selectedProduct, setSelectedProduct] = useState<CBDProduct | null>(null);
  const [dosageInput, setDosageInput] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<{name: string, url: string, type: string} | null>(null);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'in-consultation' | 'finished'>('all');
  const [queuePlanFilter, setQueuePlanFilter] = useState<'all' | 'premium' | 'basic'>('all');
  const [queueSearchTerm, setQueueSearchTerm] = useState('');
  const [mobileTab, setMobileTab] = useState<'chat' | 'ficha' | 'actions'>('chat');

  // Psychomotor Report Editor States
  const [showPsychomotorReportEditorModal, setShowPsychomotorReportEditorModal] = useState(false);
  const [psychomotorReportText, setPsychomotorReportText] = useState('');

  // Agronomic Report (Laudo Agronômico) Editor States
  const [showAgronomicReportEditorModal, setShowAgronomicReportEditorModal] = useState(false);
  const [agronomicPatientName, setAgronomicPatientName] = useState('');
  const [agronomicCpf, setAgronomicCpf] = useState('');
  const [agronomicEmissionDate, setAgronomicEmissionDate] = useState('');
  const [agronomicName, setAgronomicName] = useState('Wilian Dalenogare Pereira');
  const [agronomicCrea, setAgronomicCrea] = useState('CREA-PR 172.458/D');
  const [agronomicDiagnosis, setAgronomicDiagnosis] = useState('');
  const [agronomicDailyDoseMg, setAgronomicDailyDoseMg] = useState(5900);
  const [agronomicTargetPlants, setAgronomicTargetPlants] = useState(158);
  const [agronomicText, setAgronomicText] = useState('');

  // Medical Report (Laudo Médico) Editor & Preview States
  const [showMedicalReportEditorModal, setShowMedicalReportEditorModal] = useState(false);
  const [medicalReportTab, setMedicalReportTab] = useState<'edit' | 'preview'>('edit');
  const [reportPatientName, setReportPatientName] = useState('');
  const [reportBirthDate, setReportBirthDate] = useState('');
  const [reportCpf, setReportCpf] = useState('');
  const [evolutionNotes, setEvolutionNotes] = useState('');
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

  const handleStartConsultation = async (patient: any) => {
    console.log("Starting consultation for:", patient);
    
    let enrichedPatient = { ...patient };
    // Fetch answers from users collection if they are missing
    if (!enrichedPatient.answers || Object.keys(enrichedPatient.answers).length === 0) {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const userDoc = await getDoc(doc(db, 'users', patient.id));
        if (userDoc.exists()) {
           const userData = userDoc.data();
           if (userData.answers) {
             enrichedPatient.answers = userData.answers;
           }
           enrichedPatient.patientName = userData.name || enrichedPatient.patientName;
           enrichedPatient.cpf = userData.cpf || enrichedPatient.cpf;
           enrichedPatient.birthDate = userData.birthDate || enrichedPatient.birthDate;
           enrichedPatient.phone = userData.phone || enrichedPatient.phone;
        }
      } catch (e) {
        console.warn("Failed to enrich patient data", e);
      }
    }

    setCurrentPatient(enrichedPatient);
    setAnalysisResult(null); // Reset previous analysis to allow fresh generation
    startConsultation(patient.id);
    subscribeToMessages(patient.id);
    
    // Auto-greeting if the patient was just waiting
    if (patient.status === 'waiting') {
      setTimeout(() => {
        const objectivesStr = patient.answers?.objectives?.length > 0 
          ? patient.answers.objectives.join(", ") 
          : "suas queixas e histórico";
          
        const greetingMsg = `Olá ${(patient.patientName || 'Paciente').split(' ')[0]}, sou o Dr. Guilherme. Analisei sua queixa de ${objectivesStr}. Como você está se sentindo hoje?`;
        
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

  const handleWhatsAppCall = async (patient: any) => {
    if (!patient) return;
    const patientName = patient.patientName || userName || 'Paciente';
    const firstName = patientName.split(' ')[0];
    const rawPhone = patient.phone || patient.answers?.phone || patient.answers?.whatsapp || userPhone || '';
    const cleanDigits = rawPhone.replace(/\D/g, '');
    
    // Brazilian formatting: if 10 or 11 digits, prepend 55
    let finalPhone = cleanDigits;
    if (finalPhone.length === 10 || finalPhone.length === 11) {
      finalPhone = `55${finalPhone}`;
    }

    const defaultMsg = `Olá ${firstName}! Aqui é o Dr. Guilherme da equipe médica MeCura. É a sua vez para a sua consulta de avaliação médica canábica! Por favor, acesse o app ou me confirme por aqui para iniciarmos seu atendimento.`;
    
    // Send in-app notification to patient
    try {
      if (patient.id) {
        await setDoc(doc(db, 'notifications', patient.id), {
          text: `🔔 O Dr. Guilherme acabou de te chamar pelo WhatsApp (${rawPhone || 'seu número'})! Acesse a consulta.`,
          timestamp: new Date().toISOString(),
          type: 'whatsapp_call'
        });
        
        // Also send message to active consultation if exists
        const { collection, doc: docRef, setDoc: setDocMsg } = await import('firebase/firestore');
        const msgRef = docRef(collection(db, 'active_consultations', patient.id, 'messages'));
        await setDocMsg(msgRef, {
          id: msgRef.id,
          text: `💬 Chamado WhatsApp enviado para ${rawPhone || 'paciente'}. Dr. Guilherme aguarda você na sala de consulta!`,
          sender: 'doctor',
          type: 'text',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("Could not save WhatsApp call notification to Firestore:", err);
    }

    if (finalPhone) {
      const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(defaultMsg)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Prompt doctor if phone is missing
      const promptPhone = window.prompt(`O paciente ${patientName} não possui WhatsApp cadastrado. Digite o número com DDD (ex: 11999998888):`);
      if (promptPhone) {
        let pClean = promptPhone.replace(/\D/g, '');
        if (pClean.length === 10 || pClean.length === 11) pClean = `55${pClean}`;
        window.open(`https://wa.me/${pClean}?text=${encodeURIComponent(defaultMsg)}`, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleTogglePatientPlan = async (patient: any) => {
    if (!patient || !patient.id) return;
    const isPrem = !!(patient.isPremium || patient.plan === 'premium' || (patient as any).selectedOffer === 'premium' || patient.answers?.isPremium || (patient as any).pagamento_premium);
    const newPrem = !isPrem;
    const newPlan = newPrem ? 'premium' : 'basic';

    try {
      await updateDoc(doc(db, 'queue', patient.id), {
        isPremium: newPrem,
        plan: newPlan,
        selectedOffer: newPlan
      });
      if (currentPatient && currentPatient.id === patient.id) {
        setCurrentPatient({
          ...currentPatient,
          isPremium: newPrem,
          plan: newPlan,
          selectedOffer: newPlan
        });
      }
    } catch (err) {
      console.error("Error toggling patient plan:", err);
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

  const handleRemoveDoctorMessage = async (messageId: string, label?: string) => {
    try {
      const pId = currentPatient?.id;
      console.log("Removing doctor message:", messageId, "label:", label, "patientId:", pId);
      
      const targetMsg = messages.find(m => m.id === messageId);
      const isAcompanhamento = label === 'Tratamento Premium' || targetMsg?.type === 'acompanhamento_card';
      
      if (isAcompanhamento) {
        const optionMsg = messages.find(m => m.type === 'acompanhamento_options');
        if (optionMsg) {
          await deleteMessage(optionMsg.id, pId);
        }
      }

      if (label && !['Tratamento Premium', 'Orientações da Prescrição', 'Receita Digital', 'Pagamento Confirmado'].includes(label)) {
        setAddedMedications(prev => prev.filter(name => name.toLowerCase() !== label.toLowerCase()));
      } else if (targetMsg?.productData?.name) {
        setAddedMedications(prev => prev.filter(name => name.toLowerCase() !== targetMsg.productData.name.toLowerCase()));
      }

      await deleteMessage(messageId, pId);
    } catch (err) {
      console.error("Error removing doctor message:", err);
    }
  };

  const handleRemovePrescribedMedication = handleRemoveDoctorMessage;

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
    } else if (action === ("explicar_laudos" as any)) {
      addMessage({
        sender: 'doctor',
        text: 'Para ter acesso completo ao seu Laudo Médico Inicial, ao Laudo Psicomotor (essencial para atestar sua aptidão para dirigir e operar máquinas) e ao Laudo Agronômico (dimensionamento técnico de autocultivo para instrução de Habeas Corpus), nós estruturamos a modalidade de Consulta Premium. Nela, além da receita médica, você recebe toda a documentação legal que resguarda o seu tratamento, além do retorno em 90 dias para acompanhamento da sua evolução. Se desejar, posso enviar os detalhes para darmos o próximo passo.'
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
    
    const fullDosage = adminInstructions ? `${dosageString}\n\n${adminInstructions}` : dosageString;
    
    // Enrich product data dynamically if missing
    let details = selectedProduct.details || [selectedProduct.type];
    let italicText = selectedProduct.italicText || "";
    let description = selectedProduct.description || "";
    let image = selectedProduct.image || "";

    // Always determine a fallback image based on type if none is provided
    if (!image) {
      const typeLower = (selectedProduct.type || '').toLowerCase();
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
        if ((selectedProduct.type || '').includes('Full Spectrum')) details.push("Alta Concentração de Canabinóides");
        else if ((selectedProduct.type || '').includes('Isolado')) details.push("Puro CBD (0% THC)");
        else if ((selectedProduct.type || '').includes('Tópico') || (selectedProduct.type || '').includes('Bálsamo')) details.push("Uso Externo / Local");
      }
    }

    if (!selectedProduct.description) {
      if ((selectedProduct.type || '').includes('Full Spectrum')) {
        if (!selectedProduct.details) details.push("Efeito Entourage Potencializado");
        italicText = "Contém traços de THC (<0.3%). Pode causar leve sonolência.";
        description = `O ${selectedProduct.name} da ${selectedProduct.manufacturer} é um extrato de espectro completo, preservando todos os canabinóides, terpenos e flavonoides naturais da planta. Ideal para um tratamento abrangente, aproveitando o efeito comitiva para maior eficácia terapêutica.`;
      } else if ((selectedProduct.type || '').includes('Isolado')) {
        if (!selectedProduct.details) details.push("Zero THC garantido");
        italicText = "Sem efeitos psicoativos. Seguro para testes toxicológicos.";
        description = `O ${selectedProduct.name} oferece CBD em sua forma mais pura. Fabricado pela ${selectedProduct.manufacturer}, este produto passa por um rigoroso processo de purificação para remover todos os outros compostos da planta, garantindo 0% de THC. Excelente para pacientes com sensibilidade a outros canabinóides.`;
      } else if ((selectedProduct.type || '').includes('Tópico') || (selectedProduct.type || '').includes('Bálsamo') || (selectedProduct.type || '').includes('Gel')) {
        if (!selectedProduct.details) {
          details.push("Absorção Rápida");
          details.push("Alívio Direcionado");
        }
        italicText = "Apenas para uso externo. Evitar contato com os olhos.";
        description = `Formulado especificamente para aplicação local, o ${selectedProduct.name} da ${selectedProduct.manufacturer} proporciona alívio direcionado exatamente onde você precisa. Sua base de rápida absorção permite que os canabinóides atuem diretamente nos receptores da pele e músculos.`;
      } else if ((selectedProduct.type || '').includes('Goma') || (selectedProduct.type || '').includes('Comestível')) {
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
            'Tomar 03 gotas de 12/12 horas (sublingual).',
            'Aumentar 01 gota a cada 05 dias até atingir a dose de controle (5 a 8 gotas por tomada).'
          ],
          description: 'Extrato integral rico em Canabidiol com excelente rendimento e custo-benefício.'
        }
      ]);
    }
    const defaultNotesToAdd = '- Administrar com alimentos gordurosos (preferencia, não obrigatorio) - podendo aumentar em até 5x a absorção.\n- Se observado sonolencia durante o dia apos a administração do medicamento, reduzir em 1/3 a dose da manhã e 2/3 a noite.\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos continuos.';
    
    let finalNotes = notes || ('Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.\n' + defaultNotesToAdd);
    if (notes && !notes.includes('alimentos gordurosos')) {
      finalNotes += '\n\n' + defaultNotesToAdd;
    }
    setPrescNotes(finalNotes);
    setPrescriptionTab('edit');
    setShowPrescriptionEditorModal(true);
  };

  const handleDownloadPrescriptionFromEditor = async () => {
    // 1. Atualizar o chat (banco de dados) com a versão final editada para o paciente ver
    if (currentPatient && currentPatient.id) {
      await clearPrescriptionMessages(currentPatient.id);
      
      for (const item of prescItems) {
        await addMessage({
          sender: 'doctor',
          type: 'product',
          productData: { ...item, image: '', details: [], description: item.description || '', brand: item.brand || '', origin: item.origin || '' }
        });
      }
      
      if (prescNotes && prescNotes.trim()) {
        await addMessage({
          sender: 'doctor',
          type: 'prescription_notes',
          text: prescNotes
        });
      }

      // Adicionar o card de download da receita novamente para o paciente
      await addMessage({
        sender: 'doctor',
        type: 'prescription'
      });
    }

    // 2. Gerar o PDF com os dados editados
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

  const getCidsFromObjectives = (objs: string[]) => {
    const cids: string[] = [];
    objs.forEach(obj => {
      const lowerObj = obj.toLowerCase();
      if (lowerObj.includes('ansiedade')) cids.push('F41.9');
      if (lowerObj.includes('insônia') || lowerObj.includes('sono')) cids.push('G47.0');
      if (lowerObj.includes('lombar')) cids.push('M54.5');
      if (lowerObj.includes('dor')) cids.push('R52.2');
      if (lowerObj.includes('depressão')) cids.push('F32.9');
      if (lowerObj.includes('estresse')) cids.push('F43.9');
      if (lowerObj.includes('enxaqueca')) cids.push('G43.9');
      if (lowerObj.includes('fibromialgia')) cids.push('M79.7');
      if (lowerObj.includes('autismo') || lowerObj.includes('tea')) cids.push('F84.0');
      if (lowerObj.includes('tdah') || lowerObj.includes('atenção')) cids.push('F90.0');
      if (lowerObj.includes('epilepsia') || lowerObj.includes('convulsão')) cids.push('G40.9');
      if (lowerObj.includes('parkinson')) cids.push('G20');
      if (lowerObj.includes('alzheimer')) cids.push('G30.9');
      if (lowerObj.includes('artrose')) cids.push('M19.9');
      if (lowerObj.includes('artrite')) cids.push('M13.9');
      if (lowerObj.includes('endometriose')) cids.push('N80.9');
      if (lowerObj.includes('psoríase')) cids.push('L40.9');
      if (lowerObj.includes('neuropatia')) cids.push('G62.9');
    });
    return [...new Set(cids)]; // remove duplicates
  };

  const handleOpenMedicalReportEditor = (type: 'inicial' | 'evolutivo' = 'inicial') => {
    const patientAnswers = currentPatient?.answers || answers;
    const pName = currentPatient?.patientName || userName || 'Paciente';
    const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || userBirthDate || 'Não informada';
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf || 'Não informado';

    const objectivesArray = (patientAnswers?.objectives && patientAnswers?.objectives?.length > 0) ? patientAnswers.objectives : ['Ansiedade', 'Estresse crônico', 'Dores'];
    const objectives = objectivesArray.join(', ');
    
    const matchedCids = getCidsFromObjectives(objectivesArray);
    let cidPrincipal = '[INSERIR CID PRINCIPAL]';
    let cidsSecundarios = '[INSERIR SE HOUVER]';

    if (matchedCids.length > 0) {
      cidPrincipal = matchedCids[0];
      if (matchedCids.length > 1) {
        cidsSecundarios = matchedCids.slice(1).join(', ');
      } else {
        cidsSecundarios = 'Nenhum reportado adicionalmente';
      }
    }
    const intensity = patientAnswers?.intensity ? `${patientAnswers.intensity}/10` : 'Moderada a intensa';
    const duration = patientAnswers?.duration || 'Quadro de evolução crônica';
    
    let descriptionText = '';
    if (patientAnswers?.diseaseOrigin) {
      descriptionText += `Origem / Relato do Paciente: ${patientAnswers.diseaseOrigin}\n\n`;
    }
    if (patientAnswers?.description) {
      descriptionText += `Outros detalhes: ${patientAnswers.description}`;
    }
    if (!descriptionText.trim()) {
      descriptionText = 'Paciente relata persistência e refratariedade de sintomas clínicos aos tratamentos convencionais de primeira linha, com impacto relevante na qualidade de vida, repouso noturno e funcionalidade global.';
    }
    const description = descriptionText.trim();

    let defaultClinicalSummary = '';
    let defaultTherapeuticRationale = '';

    if (type === 'inicial') {
      defaultClinicalSummary = `O(A) paciente encontra-se sob meus cuidados médicos, apresentando quadro clínico compatível com ${objectives.toLowerCase()}, demonstrando considerável refratariedade aos tratamentos convencionais de primeira linha. A sintomatologia atual é classificada com intensidade referida de ${intensity} e tempo de evolução caracterizado por ${duration.toLowerCase()}.

Histórico da Moléstia Atual (HMA):
${description}

Histórico Terapêutico e Refratariedade:
O(a) paciente já foi submetido(a) a múltiplos esquemas farmacológicos, abrangendo diversas classes medicamentosas ao longo do tratamento. No entanto, não obteve resposta terapêutica satisfatória ou sustentada, além de relatar expressiva intolerância e eventos adversos indesejáveis inerentes ao uso crônico destas substâncias. O quadro clínico atual impõe prejuízo substancial à qualidade de vida do(a) paciente, interferindo negativamente em suas atividades funcionais, rotina diária e bem-estar global.`;

      defaultTherapeuticRationale = `Considerando a fisiopatologia do Sistema Endocanabinoide (SEC) e sua capacidade intrínseca de modular processos álgicos, inflamatórios e neurológicos, a terapêutica fitocanabinoide surge como alternativa embasada e segura.

Indicação Clínica:
Devido à insuficiência das respostas terapêuticas com as medicações alopáticas convencionais disponíveis, indico formalmente o início do tratamento com Cannabis Medicinal (Fitocanabinoides). O objetivo central desta conduta é promover a neuromodulação, redução do quadro sintomático, e consequentemente, a restituição da qualidade de vida e dignidade do(a) paciente.

CID-10 Principal: ${cidPrincipal}
CIDs Secundários: ${cidsSecundarios}`;
    } else {
      defaultClinicalSummary = `O(A) paciente encontra-se em acompanhamento médico regular sob meus cuidados desde [INSERIR MÊS/ANO], apresentando quadro crônico de ${objectives.toLowerCase()}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration.toLowerCase()}.

Fez diversos tratamentos medicamentosos prévios com diferentes classes de drogas (incluindo Analgésicos, Anti-inflamatórios, Opioides e Benzodiazepínicos), porém sem resposta terapêutica efetiva e com diversos efeitos colaterais adversos (como náuseas, vômitos, cefaleia, letargia, distúrbios gastrointestinais e prejuízo cognitivo).

${evolutionNotes ? evolutionNotes + '\n\n' : ''}Atualmente, o(a) paciente faz uso da terapêutica com Cannabis sativa L. (na forma de óleos de espectro completo e flor in natura), referindo alívio diário e substancial dos sintomas, relatando sono duradouro e reparador, fazendo com que acorde mais disposto(a) para as atividades do dia a dia.

Devido ao alto custo financeiro das medicações à base de cannabis (importadas ou via associações), o(a) paciente iniciou o cultivo artesanal e doméstico da planta para produção de sua própria medicação, obtendo excelentes resultados. Além de permitir o acesso ininterrupto ao remédio e acompanhar todo o processo de produção, o cultivo da planta tornou-se uma atividade ocupacional terapêutica essencial e mais um recurso fundamental para o sucesso do tratamento.`;

      defaultTherapeuticRationale = `As medicações à base de Cannabis provaram ser o recurso terapêutico mais eficaz na promoção de qualidade de vida e estabilização do quadro clínico deste(a) paciente, com o objetivo claro de controlar e diminuir os sintomas refratários relacionados às suas patologias.

Em virtude da grave insuficiência das respostas terapêuticas com as medicações convencionais disponíveis e da nítida melhora clínica alcançada, indico formalmente a CONTINUIDADE do uso da Cannabis medicinal pela via artesanal. Oriento expressamente a não interrupção do tratamento e a manutenção do cultivo próprio, visto que a suspensão do uso poderá acarretar retrocesso imediato do quadro e perdas substanciais na qualidade de vida e saúde do(a) paciente.

CID-10 Principal: ${cidPrincipal}
CIDs Secundários: ${cidsSecundarios}`;
    }

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
   Posologia: Tomar 03 gotas de 12/12 horas, aumentando 01 gota a cada 05 dias até controle dos sintomas.
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

  
  const handleOpenPsychomotorReportEditor = () => {
    const pName = currentPatient?.patientName || userName || 'Paciente';
    const patientAnswers = currentPatient?.answers || answers;
    const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || userBirthDate || 'Não informada';
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf || 'Não informado';
    
    setReportPatientName(pName);
    setReportBirthDate(pBirthDate);
    setReportCpf(pCpf);
    setReportEmissionDate(new Date().toLocaleDateString('pt-BR'));
    setReportDoctorName('Dr. Guilherme Taveira Dias');
    setReportDoctorCrm('CRM/MT 17259');
    setReportDoctorSpecialty('Especialista em Medicina Canabinoide');

    const defaultPsychomotorText = `Declaro, para os devidos fins de direito, que o(a) paciente <strong>${pName}</strong>, inscrito(a) no CPF <strong>${pCpf}</strong>, encontra-se em acompanhamento médico regular neste Centro Integrado de Medicina Canabinoide.\n\nO(a) paciente faz uso terapêutico de produtos derivados de Cannabis, estritamente conforme prescrição médica, sob supervisão e com acompanhamento clínico contínuo.\n\nAtesto, baseado em exames clínicos e testes de rastreio de capacidade psicomotora realizados durante as consultas de monitoramento, que o uso das medicações prescritas, nas doses estipuladas, <strong> NÃO RESULTA </strong> em alteração da capacidade psicomotora, prejuízo cognitivo, ou comprometimento dos reflexos e estado de alerta do paciente.\n\nO tratamento prescrito não interfere em sua capacidade de operar máquinas complexas, conduzir veículos automotores ou exercer atividades laborais que exijam atenção e precisão, não configurando infração à legislação de trânsito relacionada ao comprometimento psicomotor ("Lei Seca" ou "Lei do Drogômetro" - Art. 165 do CTB).\n\nRessalto que os canabinoides prescritos têm finalidade exclusivamente terapêutica, sendo legalmente importados (RDC 660/2022 ANVISA) e/ou adquiridos via Associações de Pacientes, e não se enquadram como substâncias psicoativas entorpecentes de uso recreativo capazes de causar dependência ou prejuízo sensório-motor nas doses tituladas.`;

    setPsychomotorReportText(defaultPsychomotorText);
    setShowPsychomotorReportEditorModal(true);
  };

  const handleDownloadPsychomotorReportFromEditor = () => {
    generatePsychomotorReportPDF(reportPatientName, {
      customPatientName: reportPatientName,
      birthDate: reportBirthDate,
      cpf: reportCpf,
      emissionDate: reportEmissionDate,
      customDoctorName: reportDoctorName,
      customDoctorCrm: reportDoctorCrm,
      customDoctorSpecialty: reportDoctorSpecialty,
      customPsychomotorText: psychomotorReportText
    });
  };

  const handleOpenAgronomicReportEditor = () => {
    const pName = currentPatient?.patientName || userName || 'LUCAS DANIEL NERES';
    const patientAnswers = currentPatient?.answers || answers;
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf || '057.436.591-50';
    
    setAgronomicPatientName(pName);
    setAgronomicCpf(pCpf);
    setAgronomicEmissionDate(new Date().toLocaleDateString('pt-BR'));
    setAgronomicName('Wilian Dalenogare Pereira');
    setAgronomicCrea('CREA-PR 172.458/D');
    
    const condition = patientAnswers?.mainSymptoms || patientAnswers?.queixaPrincipal || patientAnswers?.pathology || 'Transtorno de Distúrbios no Sono (CID 10 G47) e Lombalgia (CID 10 R54.5 / M54.5)';
    setAgronomicDiagnosis(condition);
    setAgronomicDailyDoseMg(5900);
    setAgronomicTargetPlants(158);

    const defaultAgronomicText = `O presente parecer técnico estabelece o dimensionamento agronômico exato, a dosimetria de fitomassa e o planejamento operacional para o cultivo pessoal de espécimes de Cannabis sativa L., estritamente voltado à produção de extratos terapêuticos integrais de uso contínuo, seguro e exclusivo do(a) paciente ${pName}, em conformidade com as Boas Práticas Agrícolas e de Coleta (GACP), a RDC ANVISA nº 335/2020 e a prescrição médica que instrui a ação de Habeas Corpus Preventivo para salvo-conduto.`;
    setAgronomicText(defaultAgronomicText);
    setShowAgronomicReportEditorModal(true);
  };

  const handleDownloadAgronomicReportFromEditor = () => {
    generateAgronomicReportPDF(agronomicPatientName, {
      customPatientName: agronomicPatientName,
      cpf: agronomicCpf,
      emissionDate: agronomicEmissionDate,
      agronomistName: agronomicName,
      agronomistCrea: agronomicCrea,
      diagnosis: agronomicDiagnosis,
      dailyDoseMg: agronomicDailyDoseMg,
      targetPlants: agronomicTargetPlants,
      htmlContent: undefined
    });
  };

  const handleSendAgronomicReportToChat = () => {
    const annualGrams = ((agronomicDailyDoseMg * 365) / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    const dryFlowerMargin = (((agronomicDailyDoseMg * 365 / 1000) / 0.10 / 1000) * 1.3038).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    const wetFlower = (((((agronomicDailyDoseMg * 365 / 1000) / 0.10 / 1000) * 1.3038) / 0.30)).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    const seeds = Math.round(agronomicTargetPlants * 1.3038);
    const perCycle = Math.round(agronomicTargetPlants / 4);

    addMessage({
      sender: 'doctor',
      text: `🌱 **Parecer Técnico Agronômico Emitido (Salvo-Conduto / HC)**\n\n- **Paciente:** ${agronomicPatientName}\n- **CPF:** ${agronomicCpf}\n- **Consultor e Eng. Agrônomo:** ${agronomicName} (${agronomicCrea})\n- **Indicações Técnicas:** Cultivo pessoal de *Cannabis sativa L.* com finalidade medicinal (GACP / RDC ANVISA)\n- **Patologias / CIDs:** ${agronomicDiagnosis}\n- **Demanda Farmacológica:** ${agronomicDailyDoseMg} mg/dia de extrato integral (~${annualGrams}g de canabinoides/ano)\n- **Biomassa Seca Requerida:** ~${dryFlowerMargin} kg flores secas/ano (com 30% de margem agronômica)\n- **Biomassa Fresca (Flores Molhadas):** ~${wetFlower} kg colhidas/ano (perda hídrica 70-80%)\n- **Dimensionamento Autorizado:** ${agronomicTargetPlants} plantas anuais (${perCycle} a 40 plantas por ciclo em floração, 3 safras/ano)\n- **Propágulos / Sementes Feminizadas:** ${seeds} unidades importadas\n\nEste parecer pericial oficial de 3 páginas foi emitido com fundamentação nas Boas Práticas GACP e RDC da ANVISA, sendo anexado ao seu prontuário legal para instrução de ação de Habeas Corpus Preventivo.`
    });
    setShowAgronomicReportEditorModal(false);
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

  const handleGenerateMedicalReport = (type: 'inicial' | 'evolutivo' = 'inicial') => {
    handleOpenMedicalReportEditor(type);
  };

  const handleApplyAccessiblePlan = (
    type: 'cbd' | 'balanced' | 'thc' = accessibleType,
    customMsg?: string
  ) => {
    const patientName = currentPatient?.patientName || userName || 'Paciente';

    let prodName = 'ÓLEO INTEGRAL PREDOMINANTE CBD 100mg/ml';
    let prodDesc = 'Óleo integral concentrado de Associação Brasileira com excelente custo-benefício. Indicado para controle de ansiedade, estresse, regulação do humor e inflamação crônica.';
    let dosage = [
      'Tomar 03 gotas de 12/12 horas (sublingual).',
      'Aumentar 01 gota a cada 05 dias até atingir a dose de controle (5 a 8 gotas por tomada).',
      '01 Frasco de 30ml rende de 45 a 60 dias de tratamento contínuo.'
    ];

    if (type === 'balanced') {
      prodName = 'ÓLEO INTEGRAL THC/CBD 100mg/ml';
      prodDesc = 'Óleo integral balanceado de Associação Brasileira com proporção 1:1. Indicado para dores crônicas, fibromialgia, espasticidade e rigidez.';
      dosage = [
        'Tomar 03 gotas de 12/12 horas (sublingual).',
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
    const protocolNotes = `PROTOCOLO DE ENTRADA ACESSÍVEL (FASE 1):\n- Medicamento Inicial: ${prodName} (Associação Brasileira)\n- Posologia Econômica: ${dosage.join(' ')}\n- Rendimento estimado: 45 a 60 dias.\n- Fase 2 (Evolução): Reavaliação em 30 a 45 dias para verificar resposta terapêutica e evolução progressiva se necessário.\n- Administrar com alimentos gordurosos (preferencia, não obrigatorio) - podendo aumentar em até 5x a absorção.\n- Se observado sonolencia durante o dia apos a administração do medicamento, reduzir em 1/3 a dose da manhã e 2/3 a noite.\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos continuos.`;

    addMessage({
      sender: 'doctor',
      type: 'prescription_notes',
      text: protocolNotes
    });

    setAddedMedications(prev => [...prev, prodName]);
    setShowAccessiblePlanModal(false);
    setAccessibleCustomMessage('');
  };

  const handleGenerateAnalysis = async (
    force: boolean = false,
    selectedBrand: 'flowermed' | 'greenbudz' | 'both' = brandPreference
  ) => {
    setExpandAnalysis(true);
    if (selectedBrand !== brandPreference) {
      setBrandPreference(selectedBrand);
    }
    if (analysisResult && !force && selectedBrand === brandPreference) return; // Already generated and not forced
    
    const patientAnswers = currentPatient?.answers || answers;
    
    setIsAnalyzing(true);
    if (force) setAnalysisResult(null);
    try {
      const brandDirective = selectedBrand === 'flowermed'
        ? `PREFERÊNCIA DE MARCA SELECIONADA PELO MÉDICO/PACIENTE: **LINHA FLOWERMED** (EUA e Flores In Natura / Extrações parceiras).
Priorize ESTRITAMENTE as opções de importados da FLOWERMED (óleos, gomas, Broad/Full Spectrum, CBG, CBN, THCV) e Flores In Natura / Extrações (14g & concentrados: Sour Lifter, Lemon Octane, Forbidden Fruit, Gellato, Glitter Bomb, Astro Candy, Strawpicana, Superglue, Zoap, Trop Banana, Girl Cookies, Syringes e Budders). NÃO prescreva produtos da GreenBudzCBD.`
        : selectedBrand === 'greenbudz'
        ? `PREFERÊNCIA DE MARCA SELECIONADA PELO MÉDICO/PACIENTE: **LINHA GREENBUDZCBD** (EUA).
Priorize ESTRITAMENTE as opções de importados da marca GREENBUDZCBD (GreenBudz Calm Vibe Oil 6000mg, GreenBudz Full Balance Oil 3000mg, Drops By GreenBudz CBD+CBN, Drops By GreenBudz CBD+THC, Drops By GreenBudz Goma Nightshade, GreenBudz Isolate CBD Hemp Formula). NÃO prescreva produtos da Flowermed.`
        : `PREFERÊNCIA DE MARCA SELECIONADA PELO MÉDICO/PACIENTE: **AMBAS AS MARCAS (Flowermed e GreenBudzCBD)**.
Apresente as opções de tratamento comparando e integrando tanto o catálogo Flowermed quanto o da GreenBudzCBD, para que o médico e o paciente possam escolher entre as alternativas importadas de acordo com a patologia e perfil de preferência.`;

      const prompt = `
        Atue como um Especialista Sênior em Medicina Canabinoide e Prescrição Médica de Alto Nível.
        Sua missão é fornecer uma análise clínica com PRECISÃO MÁXIMA, baseada em protocolos rigorosos e literatura médica atualizada, indicando os melhores tratamentos e medicamentos à base de cannabis medicinal.
        
        FILTRO OBRIGATÓRIO DE MARCA ESCOLHIDA:
        ${brandDirective}
        
        Dados Clínicos do Paciente:
        - Queixa Principal / Objetivos: ${patientAnswers?.objectives?.join(', ') || 'Não informados'}
        - Intensidade do Sintoma: ${patientAnswers?.intensity || 'Não informada'}/10
        - Cronicidade/Duração: ${patientAnswers?.duration || 'Não informada'}
        - História da Moléstia (Descrição): ${patientAnswers?.description || 'Não informada'}
        - Dados Biométricos: Altura ${patientAnswers?.height || 'Não informada'}m, Peso ${patientAnswers?.weight || 'Não informada'}kg, Sexo ${patientAnswers?.sex || 'Não informada'}
        - Histórico Médico e Social COMPLETO: 
          Tratamento Atual (${patientAnswers?.tratamento_atual ? 'Sim' + (patientAnswers?.tratamento_atual_details ? ': ' + patientAnswers.tratamento_atual_details : '') : 'Não'}), 
          Uso de Fármacos (${patientAnswers?.remedios ? 'Sim' + (patientAnswers?.remedios_details ? ': ' + patientAnswers.remedios_details : '') : 'Não'}), 
          Comorbidade Crônica (${patientAnswers?.doenca_cronica ? 'Sim' + (patientAnswers?.doenca_cronica_details ? ': ' + patientAnswers.doenca_cronica_details : '') : 'Não'}), 
          Cirurgia (${patientAnswers?.cirurgia ? 'Sim' + (patientAnswers?.cirurgia_details ? ': ' + patientAnswers.cirurgia_details : '') : 'Não'}), 
          Alergias (${patientAnswers?.alergia ? 'Sim' + (patientAnswers?.alergia_details ? ': ' + patientAnswers.alergia_details : '') : 'Não'}), 
          Problemas Digestivos (${patientAnswers?.digestivo ? 'Sim' + (patientAnswers?.digestivo_details ? ': ' + patientAnswers.digestivo_details : '') : 'Não'}), 
          Uso Prévio de Cannabis (${patientAnswers?.cannabis ? 'Sim' + (patientAnswers?.cannabis_details ? ': ' + patientAnswers.cannabis_details : '') : 'Não'}).
        - Psicomotor e Riscos: Dirige (${patientAnswers?.dirige ? 'Sim' : 'Não'}), Opera Maquinário (${patientAnswers?.maquinario ? 'Sim' : 'Não'}), 
          Blitz/Frequente (${patientAnswers?.blitz ? 'Sim' : 'Não'}), Laudo Psicomotor (${patientAnswers?.laudo_psicomotor ? 'Sim' : 'Não'}).
        - Cardiovascular e Saúde Mental: Arritmia (${patientAnswers?.arritmia ? 'Sim' : 'Não'}), 
          Histórico Psicose/Esquizofrenia (${patientAnswers?.psicose_hist || patientAnswers?.esquizofrenia_diag || patientAnswers?.esquizofrenia_parente ? 'Sim' : 'Não'}), 
          Pânico/Ansiedade (${patientAnswers?.panico || patientAnswers?.ansiedade_diag ? 'Sim' : 'Não'}), Estresse (${patientAnswers?.estresse ? 'Sim' : 'Não'}).
        - Hábitos de Vida: Fuma (${patientAnswers?.fuma ? 'Sim' : 'Não'}), Bebida Alcoólica (${patientAnswers?.bebida ? 'Sim' : 'Não'}), 
          Atividade Física (${patientAnswers?.exercicio ? 'Sim' : 'Não'}).
        
        DIRETRIZ DE PRESCRIÇÃO E EQUIVALÊNCIA (IMPORTADOS E NACIONAIS):
        Você DEVE sugerir DUAS frentes de tratamento INDEPENDENTES E COMPLETAS para o médico prescrever e o paciente escolher:
        1. Opção de Importados (Catálogo Oficial da marca selecionada: ${selectedBrand.toUpperCase()}): monte um tratamento completo e equilibrado cobrindo diferentes vias farmacoterapêuticas de acordo com as queixas do paciente:
           - ÓLEO SUBLINGUAL (para homeostase basal e uso contínuo diário, ex: Hemp Oil 3000mg, Sphera, Calm Vibe 6000mg, Full Balance 3000mg);
           - GOMAS / GUMMIES ou NANO SYRUP (forma farmacêutica oral prática com liberação prolongada de 4 a 6 horas, ex: CBN Sleep Gummies, Gummies D9, Drops By GreenBudz Goma Nightshade, Chill Vibe Gummies, Evergreen ou D9 Nano Syrup 500mg);
           - FLORES RICAS EM THC/THCA e/ou EXTRAÇÕES COM THC (para resgate rápido inalatório em crises álgicas, ansiedade aguda, espasmos ou indução rápida de sono sem combustão, ex: Flor In Natura Superglue (THCA) 14g, Flor In Natura Glitter Bomb (THCA) 14g, Flor In Natura Forbidden Fruit (D8 THC) 14g, Hemp Oil Syringe Gelato 2ml (71,6% THCA), Hemp Oil Gold Budder 5g (Versão THCA)). Salvo contraindicação expressa (psicose/esquizofrenia), é MANDATÓRIO incluir flores ricas em THC/THCA e extrações com THC para garantir a cobertura completa de resgate agudo.
        2. Opção de Associações Nacionais: monte um tratamento equivalente completo com formulações padronizadas de Associações Brasileiras.

        REGRA OBRIGATÓRIA E INEGOCIÁVEL PARA MEDICAMENTOS NACIONAIS:
        INDEPENDENTE DA MARCA SELECIONADA PARA OS IMPORTADOS (FLOWERMED, GREENBUDZCBD OU AMBOS), A PRESCRIÇÃO DAS OPÇÕES NACIONAIS (ASSOCIAÇÕES BRASILEIRAS) DEVE CONTER SEMPRE E OBRIGATORIAMENTE A TRÍADE COMPLETA:
        - 1. ÓLEO (Óleo sublingual contínuo para equilíbrio e homeostase basal, ex: Óleo Integral CBD 100mg/ml, THC/CBD 100mg/ml ou CBG 50mg/ml - Associação Nacional);
        - 2. EXTRAÇÃO (Pomada Canábica Terapêutica 500mg, Extrato Concentrado RSO ou Resina Concentrada - Associação Nacional para alívio complementar, ação tópica direta ou espasmos);
        - 3. FLORES (Flores in natura de cannabis sp 15g ricas em CBD ou THC - Associação Nacional para resgate inalatório rápido em picos de sintomas via vaporizador térmico medicinal a 175°C-185°C).
        Desta forma, fica estritamente a critério e autonomia do paciente escolher se prefere seguir com o tratamento completo de medicamentos nacionais ou com os importados.

        CRITÉRIOS CLÍNICOS CRÍTICOS DE SEGURANÇA E PERSONALIZAÇÃO CASO A CASO:
        - SE o paciente tem histórico de psicose ou esquizofrenia: É ESTRITAMENTE CONTRAINDICADO o uso de formulações com THC ou THCA em doses psicoativas. Você DEVE prescrever exclusivamente formulações de Canabidiol Broad Spectrum (ex: Sphera 10% ou 20% Broad Spectrum), CBG Isolado (Flowermed CBG Isolado 3.000 mg) ou flores de CBD isoladas (Sour Lifter CBD) ou GreenBudz Isolate CBD.
        - SE o paciente dirige ou opera maquinário: produtos com THC/THCA devem ser restritos ao uso noturno (mínimo de 8h antes da direção); no período diurno, utilize formulações não-intoxicantes (CBD, CBG ou Broad Spectrum).
        - SE o paciente apresenta dor intensa/aguda (intensidade >= 7): considere a indicação de uma via de resgate inalatório rápido por vaporização medicinal (Flor Lemon Octane CBD, Superglue THCA, Syringe Gelato 71,6% THCA ou Budder) ou D9 Nano Syrup, além do óleo contínuo.
        - SE o paciente tem queixa primária de insônia: considere o fitocanabinoide CBN (Flowermed CBN 300mg + CBD 900mg, CBN Sleep Gummies, Drops By GreenBudz CBD+CBN, Drops By GreenBudz Goma Nightshade ou Flor Forbidden Fruit D8 THC).
        - SE o paciente tem TDAH, fadiga ou déficit de foco: priorize Flowermed THCV 300mg + CBD 900mg, Flowermed CBG Isolado 3.000mg, GreenBudz Full Balance Oil, Flor Sour Lifter ou Trop Banana.
        - SE o paciente toma fármacos contínuos: avalie potenciais interações no citocromo P450 (CYP3A4, CYP2C19, CYP2C9) e oriente espaçamento de 2 horas.

        CATÁLOGO OFICIAL DE IMPORTADOS DISPONÍVEIS:
        ${selectedBrand === 'flowermed' || selectedBrand === 'both' ? `[LINHA FLOWERMED (EUA - Padrão FDA / RDC 660)]:
        ${FLOWERMED_PRODUCTS.map(p => `- ${p.name} (${p.line}): R$ ${p.priceBRL} • ${p.activeIngredients} (${p.concentration || ''}). ${p.indications || ''}. Posologia: ${p.usageInstructions || ''}`).join('\n')}` : ''}

        [LINHA FLORES IN NATURA E EXTRAÇÕES IMPORTADAS (14g & Concentrados)]:
        ${FLOWER_EXTRACTIONS_PRODUCTS.map(p => `- ${p.name} (${p.subLine}): R$ ${p.priceBRL} • Perfil: ${p.strainProfile} • Terpenos: ${p.terpenes.join(', ')} • Momento: ${p.usageMoment}. ${p.indications || ''}. Via: ${p.administrationRoute || 'Inalatória / Vaporização'}.`).join('\n')}

        ${selectedBrand === 'greenbudz' || selectedBrand === 'both' ? `[LINHA GREENBUDZCBD (EUA)]:
        ${productCategories.flatMap(c => c.products.filter(p => p.manufacturer === 'GreenBudzCBD')).map(p => `- ${p.name} (${p.type}): R$ ${p.priceBRL}. ${p.indications || p.description || ''}`).join('\n')}` : ''}

        CATÁLOGO OFICIAL DE ASSOCIAÇÕES NACIONAIS (BRASIL):
        ${productCategories.flatMap(c => c.products.filter(p => p.origin === 'Nacional')).map(p => `- ${p.name} (${p.type}): R$ ${p.priceBRL}. ${p.indications || p.description || ''}`).join('\n')}
        
        Formato de Saída Exigido (Markdown estruturado e clínico):
        1. Diagnóstico Sindrômico e Avaliação Clínica
        2. Racional Terapêutico Fisiopatológico (Interação com o Sistema Endocanabinoide)
        3. Protocolo de Titulação e Posologia Sugerida (com foco na marca ${selectedBrand === 'flowermed' ? 'Flowermed' : selectedBrand === 'greenbudz' ? 'GreenBudzCBD' : 'Flowermed / GreenBudzCBD'})
        4. Medicina Baseada em Evidências (Citações estruturadas de estudos reais)
        5. Manejo de Riscos, Contraindicações e Interações Farmacológicas
        
        6. **RESUMO DE PRESCRIÇÃO SUGERIDA** (Lista estrita com a palavra "Medicamento:" no início de cada produto para que o médico possa adicionar à receita):
           
           **OPÇÕES IMPORTADAS (${selectedBrand === 'flowermed' ? 'LINHA FLOWERMED' : selectedBrand === 'greenbudz' ? 'LINHA GREENBUDZCBD' : 'LINHAS FLOWERMED E GREENBUDZCBD'}):**
           (Gere o tratamento completo utilizando os nomes fiéis do catálogo de importados acima, integrando obrigatoriamente:
            1. Óleo contínuo sublingual (ex: Hemp Oil 3000mg ou Sphera 1:1 / Full Spectrum);
            2. Gomas/Gummies ou Syrup (ex: Gummies D9 10mg, CBN Sleep Gummies ou D9 Nano Syrup);
            3. Flor rica em THC/THCA (ex: Flor In Natura Superglue (THCA) 14g, Glitter Bomb (THCA) 14g ou Forbidden Fruit (D8 THC) 14g);
            4. Extração concentrada com THC (ex: Hemp Oil Syringe Gelato 2ml (71,6% THCA) ou Hemp Oil Gold Budder 5g (Versão THCA)) para resgate agudo/noturno)
           Medicamento: (Nome fiel ao catálogo)
           Indicação: (Condição primária alvo)
           Modo de Uso: (Posologia, via e titulação)
           Observações: (Dicas de administração)

           **OPÇÕES NACIONAIS (ASSOCIAÇÕES BRASILEIRAS - TRÍADE COMPLETA: ÓLEO, EXTRAÇÃO E FLOR):**
           (OBRIGATÓRIO: Gerar SEMPRE e INDEPENDENTE da marca de importados os 3 medicamentos nacionais abaixo: 1 ÓLEO, 1 EXTRAÇÃO e 1 FLOR IN NATURA)
           Medicamento: (Óleo Sublingual Integral CBD, THC/CBD 100mg/ml ou Predominante THC 100mg/ml - Associação Nacional)
           Indicação: (Condição primária alvo e homeostase basal contínua)
           Modo de Uso: (Posologia, via sublingual e titulação gradual)
           Observações: (Reter 60 a 90 segundos sublingual)

           Medicamento: (Pomada Canábica Terapêutica 500mg ou Extrato Concentrado RSO - Associação Nacional)
           Indicação: (Extração terapêutica para analgesia localizada, espasmos ou alívio de tensões somatizadas)
           Modo de Uso: (Posologia e aplicação tópica/mucosa)
           Observações: (Ação periférica direta em receptores CB2 cutâneos)

           Medicamento: (Flor in natura PREDOMINANTE THC (Para Vaporização) 15g ou Flores in natura de cannabis sp 15g - Associação Nacional)
           Indicação: (Resgate inalatório rápido para crises álgicas, ansiedade aguda ou indução noturna)
           Modo de Uso: (Vaporizar 0,1g a 0,15g em vaporizador térmico medicinal a 175°C-185°C. Proibida a combustão)
           Observações: (Início de ação imediato em 1 a 3 minutos)

        IMPORTANTE: Destaque em **negrito** todos os fármacos, diagnósticos, enzimas (ex: CYP3A4) e dosagens para escaneabilidade médica de alto rendimento. NÃO USE TABELAS MARKDOWN PARA OS MEDICAMENTOS.
      `;

      let responseText = null;

      try {
        const response = await fetch('/api/analyze-clinical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, patientAnswers, brandPreference: selectedBrand })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.text && !data.fallback) {
            responseText = data.text;
          }
        }
      } catch (apiErr) {
        console.warn("API de análise clínica do servidor indisponível, acionando motor clínico de segurança:", apiErr);
      }

      if (!responseText) {
        const { generateClinicalAnalysisFallback } = await import('../utils/aiAnalysisFallback');
        responseText = generateClinicalAnalysisFallback(prompt, patientAnswers, selectedBrand);
      }

      if (responseText) {
        setAnalysisResult(responseText);
      } else {
        setAnalysisResult("Não foi possível gerar a análise. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao gerar análise:", error);
      setAnalysisResult(`Ocorreu um erro ao gerar a análise clínica: ${error.message || 'Erro desconhecido'}. Tente novamente.`);
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
            let isNational = false;
            if (/greenbudz|flowermed|sphera|sour lifter|lemon octane|forbidden fruit|gellato|glitter bomb|astro candy|strawpicana|superglue|zoap|trop banana|girl cookies|syringe|budder|gummies d9|nano syrup|importado/i.test(rawName)) {
              isNational = false;
            } else if (/ÓLEO INTEGRAL|POMADA|EXTRAÇÃO|EXTRATO|RESINA|GOMA|FLOR IN NATURA|FLORES IN NATURA|CANNABIS SP|ASSOCIAÇÃO|NACIONAL|INTEGRAL/i.test(rawName)) {
              isNational = true;
            }
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
        const nameMatch = block.match(/.*?:\s*(.*?)(?=\bIndicação\b|\bIndicações\b|\bDoença\b|\bModo de Uso\b|\bPosologia\b|\bPosologia\/Uso\b|\bObservações\b|\bObservação Clínica\b|$)/is);
        const dosageMatch = block.match(/(?:\bModo de Uso\b|\bPosologia\b|\bPosologia\/Uso\b).*?:\s*(.*?)(?=\bIndicação\b|\bIndicações\b|\bDoença\b|\bObservações\b|\bObservação Clínica\b|$)/is);
        const instructionsMatch = block.match(/(?:\bObservações\b|\bObservação Clínica\b).*?:\s*(.*?)(?=\bIndicação\b|\bIndicações\b|\bDoença\b|\bModo de Uso\b|\bPosologia\b|\bPosologia\/Uso\b|$)/is);
        
        if (nameMatch && nameMatch[1].trim()) {
          let rawName = nameMatch[1].replace(/\*\*/g, '').replace(/^- /, '').replace(/\*$/, '').trim();
          // Safety check: if rawName is too long (over 100 chars), it's probably grabbing the wrong section
          if (rawName.length > 150) {
            rawName = rawName.substring(0, 150) + "..."; // Truncate to avoid UI breaks, though this means parsing failed
          }
          
          let isNational = false;
          if (/greenbudz|flowermed|sphera|sour lifter|lemon octane|forbidden fruit|gellato|glitter bomb|astro candy|strawpicana|superglue|zoap|trop banana|girl cookies|syringe|budder|gummies d9|nano syrup|importado/i.test(rawName)) {
            isNational = false;
          } else if (/ÓLEO INTEGRAL|POMADA|EXTRAÇÃO|EXTRATO|RESINA|GOMA|FLOR IN NATURA|FLORES IN NATURA|CANNABIS SP|ASSOCIAÇÃO|NACIONAL|INTEGRAL/i.test(rawName) || (block.includes('Associação') || block.includes('Nacional') || block.includes('Brasileira') || block.includes('TRÍADE'))) {
            isNational = true;
          }

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

    // Find product across productCategories, FLOWERMED_PRODUCTS, and FLOWER_EXTRACTIONS_PRODUCTS
    let foundProduct: any = null;
    const cleanMedName = med.name.toLowerCase().trim();

    for (const category of productCategories) {
      const product = category.products.find(p => 
        p.name.toLowerCase() === cleanMedName ||
        p.name.toLowerCase().includes(cleanMedName) ||
        cleanMedName.includes(p.name.toLowerCase())
      );
      if (product) {
        foundProduct = product;
        break;
      }
    }

    if (!foundProduct) {
      const fm = FLOWERMED_PRODUCTS.find(p => 
        p.name.toLowerCase() === cleanMedName ||
        p.name.toLowerCase().includes(cleanMedName) ||
        cleanMedName.includes(p.name.toLowerCase())
      );
      if (fm) {
        foundProduct = { ...fm, manufacturer: 'Flowermed (EUA)', origin: 'Importado' };
      }
    }

    if (!foundProduct) {
      const fe = FLOWER_EXTRACTIONS_PRODUCTS.find(p => 
        p.name.toLowerCase() === cleanMedName ||
        p.name.toLowerCase().includes(cleanMedName) ||
        cleanMedName.includes(p.name.toLowerCase())
      );
      if (fe) {
        foundProduct = { ...fe, manufacturer: 'Importado (Folheto Especial)', origin: 'Importado' };
      }
    }

    const defaultManufacturer = med.origin === 'Nacional' 
      ? 'Associação Brasileira' 
      : (/flowermed|sphera|gummies d9|nano syrup/i.test(med.name) ? 'Flowermed (EUA)' : (/sour lifter|lemon octane|forbidden|gellato|glitter|astro|strawpicana|superglue|zoap|trop|girl cookies|syringe|budder/i.test(med.name) ? 'Importado (Folheto Especial)' : 'GreenBudzCBD'));

    const enriched = enrichMedicationDetails(
      foundProduct ? foundProduct.name : med.name,
      foundProduct ? foundProduct.manufacturer : defaultManufacturer,
      foundProduct ? foundProduct.origin : med.origin,
      foundProduct ? foundProduct.type : undefined,
      foundProduct
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
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#050508] text-mecura-pearl overflow-hidden font-sans pt-[max(env(safe-area-inset-top),12px)] md:pt-0">
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
                <div className="flex flex-wrap gap-2 mt-4 pb-1">
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

                {/* Filtro Específico por Plano (VIP x Essencial) */}
                {(() => {
                  const vipCount = queue.filter(p => !!(p.isPremium || p.plan === 'premium' || (p as any).selectedOffer === 'premium' || p.answers?.isPremium || (p as any).pagamento_premium)).length;
                  const basicCount = queue.length - vipCount;

                  return (
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-mecura-elevated/40">
                      <span className="text-[10px] uppercase font-bold text-mecura-silver/70 mr-0.5">Plano:</span>
                      <button 
                        onClick={() => setQueuePlanFilter('all')}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${queuePlanFilter === 'all' ? 'bg-white/15 text-white border border-white/30' : 'text-mecura-silver hover:text-white'}`}
                      >
                        Todos ({queue.length})
                      </button>
                      <button 
                        onClick={() => setQueuePlanFilter('premium')}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${queuePlanFilter === 'premium' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]' : 'text-amber-400/70 hover:text-amber-300'}`}
                      >
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                        VIPs ({vipCount})
                      </button>
                      <button 
                        onClick={() => setQueuePlanFilter('basic')}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${queuePlanFilter === 'basic' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'text-emerald-400/70 hover:text-emerald-300'}`}
                      >
                        🌱 Essencial ({basicCount})
                      </button>
                    </div>
                  );
                })()}
              </div>
        
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 custom-scrollbar">
          {queue.filter(p => {
            const matchesStatus = queueFilter === 'all' ? true : p.status === queueFilter;
            const matchesSearch = (p.patientName || '').toLowerCase().includes((queueSearchTerm || '').toLowerCase());
            const isPrem = !!(p.isPremium || p.plan === 'premium' || (p as any).selectedOffer === 'premium' || p.answers?.isPremium || (p as any).pagamento_premium);
            const matchesPlan = queuePlanFilter === 'all' ? true : queuePlanFilter === 'premium' ? isPrem : !isPrem;
            return matchesStatus && matchesSearch && matchesPlan;
          }).length > 0 ? (
            [...queue].filter(p => {
              const matchesStatus = queueFilter === 'all' ? true : p.status === queueFilter;
              const matchesSearch = (p.patientName || '').toLowerCase().includes((queueSearchTerm || '').toLowerCase());
              const isPrem = !!(p.isPremium || p.plan === 'premium' || (p as any).selectedOffer === 'premium' || p.answers?.isPremium || (p as any).pagamento_premium);
              const matchesPlan = queuePlanFilter === 'all' ? true : queuePlanFilter === 'premium' ? isPrem : !isPrem;
              return matchesStatus && matchesSearch && matchesPlan;
            }).sort((a, b) => {
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
            }).map((patient, idx) => {
              const isPremiumPatient = !!(patient.isPremium || patient.plan === 'premium' || (patient as any).selectedOffer === 'premium' || patient.answers?.isPremium || (patient as any).pagamento_premium);

              return (
              <div 
                key={patient.id} 
                onClick={() => handleStartConsultation(patient)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  patient.hasUnread
                    ? 'bg-mecura-neon/10 border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.15)]'
                    : isPremiumPatient
                      ? 'bg-amber-500/[0.04] border-amber-500/40 hover:bg-amber-500/[0.08] hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
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

                    {/* Símbolo Paciente Premium vs Essencial (Clique para alternar) */}
                    {isPremiumPatient ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePatientPlan(patient);
                        }}
                        title="Plano VIP Premium (R$ 249,90) - Clique para alterar para Essencial"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)] tracking-wider hover:scale-105 active:scale-95 transition-transform"
                      >
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                        VIP PREMIUM
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePatientPlan(patient);
                        }}
                        title="Plano Essencial (R$ 49,90) - Clique para alterar para VIP Premium"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#142A1D] text-[#4ADE80] border border-[#22C55E]/40 tracking-wider hover:border-amber-400/60 hover:text-amber-300 transition-colors"
                      >
                        🌱 ESSENCIAL
                      </button>
                    )}
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
                  <div className="flex items-center gap-2 flex-wrap pt-2 mt-1 border-t border-mecura-elevated/40">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNotifyNext(patient); }}
                      className="text-[10px] bg-mecura-surface-light px-2.5 py-1.5 rounded-lg text-mecura-silver hover:text-white transition-colors"
                      title="Avisar no App que chegou a vez"
                    >
                      Sua vez
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNotifyWait(patient); }}
                      className="text-[10px] bg-mecura-surface-light px-2.5 py-1.5 rounded-lg text-mecura-silver hover:text-white transition-colors"
                      title="Avisar que atende em 5 minutos"
                    >
                      5 min
                    </button>
                    {/* Botão do WhatsApp para chamar o paciente */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleWhatsAppCall(patient); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold transition-all shadow-[0_0_12px_rgba(37,211,102,0.3)] hover:scale-[1.02] active:scale-[0.98] ml-auto"
                      title="Chamar paciente diretamente no WhatsApp na hora da vez dele"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                      <span>Chamar Whats</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
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
              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                <span className="text-white font-bold text-sm truncate">{currentPatient.patientName}</span>
                {(currentPatient.isPremium || currentPatient.plan === 'premium' || currentPatient.selectedOffer === 'premium' || currentPatient.answers?.isPremium) && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex-shrink-0">
                    <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> VIP
                  </span>
                )}
              </div>
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
              onClick={() => handleWhatsAppCall(currentPatient)}
              className="w-full p-4 bg-[#25D366]/15 border border-[#25D366]/40 rounded-2xl flex items-center gap-4 text-left hover:bg-[#25D366]/25 transition-all shadow-[0_0_15px_rgba(37,211,102,0.15)]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(37,211,102,0.4)]">
                <WhatsAppIcon className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="text-[#25D366] font-bold text-base">Chamar no WhatsApp</h4>
                <p className="text-xs text-mecura-silver">Chamar {currentPatient.patientName} diretamente no WhatsApp agora</p>
              </div>
            </button>
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
              onClick={() => handleGenerateMedicalReport('inicial')}
              className="w-full p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-4 text-left hover:border-amber-500/50 hover:bg-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-amber-400 font-bold text-base">Gerar Laudo Inicial (PDF)</h4>
                <p className="text-xs text-amber-400/80">Laudo completo com diagnóstico, fisiopatologia e tratamentos para abertura do HC.</p>
              </div>
            </button>

            <button
              onClick={() => handleGenerateMedicalReport('evolutivo')}
              className="w-full p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center gap-4 text-left hover:border-blue-500/50 hover:bg-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-blue-400 font-bold text-base">Gerar Laudo Evolutivo (PDF)</h4>
                <p className="text-xs text-blue-400/80">Atualização clínica, acompanhamento e registro de evolução do paciente.</p>
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
            <div className="min-h-[64px] md:min-h-[80px] py-3 md:py-4 border-b border-mecura-elevated flex flex-col md:flex-row md:items-start justify-between px-4 md:px-6 bg-[#0A0A0F]/80 backdrop-blur-md z-10 flex-shrink-0 gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-mecura-surface-light overflow-hidden border border-mecura-elevated flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-mecura-silver" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base md:text-lg font-bold text-white tracking-tight truncate max-w-[150px] md:max-w-xs">{currentPatient?.patientName || userName || 'Paciente Atual'}</h2>
                    {(currentPatient?.isPremium || currentPatient?.plan === 'premium' || (currentPatient as any)?.selectedOffer === 'premium' || currentPatient?.answers?.isPremium || (currentPatient as any)?.pagamento_premium) ? (
                      <button
                        type="button"
                        onClick={() => handleTogglePatientPlan(currentPatient)}
                        title="Plano VIP Premium (R$ 249,90) - Clique para alterar para Essencial"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.25)] tracking-wider hover:scale-105 transition-transform"
                      >
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                        VIP PREMIUM
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTogglePatientPlan(currentPatient)}
                        title="Plano Essencial (R$ 49,90) - Clique para alterar para VIP Premium"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#142A1D] text-[#4ADE80] border border-[#22C55E]/40 tracking-wider hover:border-amber-400/60 hover:text-amber-300 transition-colors"
                      >
                        🌱 ESSENCIAL
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] md:text-xs text-mecura-silver font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-mecura-neon shadow-[0_0_8px_rgba(166,255,0,0.5)]" /> Online agora
                  </p>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto md:overflow-visible md:flex-wrap pb-1 md:pb-0 items-center md:justify-end">
                {/* Botão Chamar no WhatsApp */}
                <button
                  onClick={() => {
                    const targetPatient = currentPatient || queue.find(p => p.status === 'waiting');
                    if (targetPatient) {
                      handleWhatsAppCall(targetPatient);
                    } else {
                      alert('Nenhum paciente selecionado ou aguardando.');
                    }
                  }}
                  title="Chamar Paciente no WhatsApp na hora da vez dele"
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span className="hidden md:inline">Chamar no WhatsApp</span>
                  <span className="md:hidden">Whats</span>
                </button>
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
                  onClick={() => handleGenerateMedicalReport('inicial')}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-amber-500/20 hover:border-amber-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  title="Gerar Laudo Inicial (PDF)"
                >
                  <FileCheck className="w-3 h-3 md:w-4 md:h-4 text-amber-400" /> <span className="hidden md:inline">Laudo Inicial</span><span className="md:hidden">Inicial</span>
                </button>
                <button 
                  onClick={() => handleGenerateMedicalReport('evolutivo')}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  title="Gerar Laudo Evolutivo (PDF)"
                >
                  <FileCheck className="w-3 h-3 md:w-4 md:h-4 text-blue-400" /> <span className="hidden md:inline">Laudo Evolutivo</span><span className="md:hidden">Evol.</span>
                </button>
                <button 
                  onClick={handleOpenPsychomotorReportEditor}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-purple-500/20 hover:border-purple-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  title="Gerar Laudo Psicomotor (Lei do Drogômetro)"
                >
                  <FileCheck className="w-3 h-3 md:w-4 md:h-4 text-purple-400" /> <span className="hidden md:inline">Laudo Psicomotor</span><span className="md:hidden">Psico.</span>
                </button>
                <button 
                  onClick={handleOpenAgronomicReportEditor}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  title="Gerar Laudo Agronômico (Cálculo de Plantas / HC)"
                >
                  <Sprout className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" /> <span className="hidden md:inline">Laudo Agronômico</span><span className="md:hidden">Agron.</span>
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
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-mecura-surface border border-mecura-elevated flex items-center justify-center mb-3 text-mecura-neon shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">Pronto para o Atendimento</h4>
                <p className="text-mecura-silver text-xs max-w-sm">
                  Envie uma mensagem ou utilize as ações rápidas abaixo para orientar {currentPatient?.patientName || 'o paciente'}.
                </p>
              </div>
            ) : (
              <div>
                {[...messages].sort((a, b) => {
                  const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
                  const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
                  return (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
                }).map((msg) => (
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
                                
                                const typeLower = (msg.productData?.name || '').toLowerCase();
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
                              {(msg.productData.details || []).map((detail, idx) => (
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
                            {(Array.isArray(msg.productData.dosage) ? msg.productData.dosage : [msg.productData.dosage || '']).map((dose, idx) => (
                              <li key={`${msg.id}-dose-${idx}`}>
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
                    <div className="w-[85%] max-w-xl bg-gradient-to-b from-[#111116] to-[#0A0A0F] border border-[#2a2a35] rounded-3xl p-6 sm:p-8 mb-2 relative overflow-hidden shadow-2xl group">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveDoctorMessage(msg.id, 'Tratamento Premium');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all z-20 shadow-sm cursor-pointer active:scale-95"
                        title="Remover Tratamento Premium"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
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

                      <button 
                        disabled
                        className="w-full py-5 bg-mecura-neon/50 text-black/50 font-bold text-lg rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <span>Desejo dar o Próximo Passo</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  ) : msg.type === 'acompanhamento_options' && msg.sender === 'doctor' ? null
                  : msg.type === 'payment_success' ? (
                    <div className="w-[85%] max-w-xl bg-[#A6FF00]/10 border border-[#A6FF00]/30 rounded-3xl p-4 sm:p-6 mb-2 flex items-center justify-between gap-4 shadow-lg relative">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#A6FF00]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-[#A6FF00]" />
                        </div>
                        <div>
                          <h3 className="text-[#A6FF00] font-bold text-lg">Pagamento Confirmado!</h3>
                          <p className="text-white text-sm">O paciente realizou o pagamento da Consulta Premium (R$ 249,00). Você pode prosseguir com o atendimento e envio dos laudos.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveDoctorMessage(msg.id, 'Pagamento Confirmado');
                        }}
                        className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 flex-shrink-0 self-start"
                        title="Remover aviso de pagamento"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
                    </div>
                  ) : msg.sender === 'doctor' ? (
                    <div className="max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm relative group bg-mecura-neon/10 text-white rounded-tr-sm border border-mecura-neon/20 flex flex-col mb-2">
                      <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-white/10">
                        <span className="text-[11px] text-mecura-neon font-bold tracking-wide uppercase flex items-center gap-1">
                          Mensagem do Médico
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveDoctorMessage(msg.id);
                          }}
                          className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 flex-shrink-0"
                          title="Remover esta mensagem"
                        >
                          <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                          <span className="pointer-events-none">Remover</span>
                        </button>
                      </div>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ) : (
                    <div className="max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm relative group bg-mecura-surface text-mecura-pearl rounded-tl-sm border border-mecura-elevated mb-2">
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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
            )}
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
                onClick={() => handleDoctorAction('explicar_laudos' as any)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-mecura-neon/10 border border-mecura-neon/50 text-xs text-mecura-neon hover:bg-mecura-neon/20 transition-colors"
              >
                Explicar Laudos
              </button>
              <button 
                onClick={() => handleDoctorAction('acompanhamento')}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-mecura-neon/10 border border-mecura-neon/50 text-xs text-mecura-neon hover:bg-mecura-neon/20 transition-colors"
              >
                Acompanhamento (Oferta)
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
          {/* AI Analysis & Brand Filter */}
          <div className="space-y-3">
            {/* 3 Brand Selection Buttons */}
            <div className="bg-mecura-surface/60 border border-mecura-elevated rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-mecura-silver uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-mecura-neon" />
                  Marca para Prescrição IA:
                </span>
                <span className="text-[10px] font-semibold text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded-full border border-mecura-neon/20">
                  {brandPreference === 'flowermed' ? 'Flowermed' : brandPreference === 'greenbudz' ? 'GreenBudzCBD' : 'Ambas as Marcas'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBrandPreference('flowermed');
                    handleGenerateAnalysis(true, 'flowermed');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                    brandPreference === 'flowermed'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.3)]'
                      : 'bg-mecura-surface/40 text-mecura-silver border-mecura-elevated hover:text-white hover:border-mecura-silver/40'
                  }`}
                >
                  <span className="leading-tight">Flowermed</span>
                  <span className={`text-[9px] font-normal leading-none ${brandPreference === 'flowermed' ? 'text-black/75' : 'text-mecura-silver/60'}`}>
                    EUA • Flores 14g
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBrandPreference('greenbudz');
                    handleGenerateAnalysis(true, 'greenbudz');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                    brandPreference === 'greenbudz'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.3)]'
                      : 'bg-mecura-surface/40 text-mecura-silver border-mecura-elevated hover:text-white hover:border-mecura-silver/40'
                  }`}
                >
                  <span className="leading-tight">GreenBudzCBD</span>
                  <span className={`text-[9px] font-normal leading-none ${brandPreference === 'greenbudz' ? 'text-black/75' : 'text-mecura-silver/60'}`}>
                    EUA Concentrado
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBrandPreference('both');
                    handleGenerateAnalysis(true, 'both');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                    brandPreference === 'both'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.3)]'
                      : 'bg-mecura-surface/40 text-mecura-silver border-mecura-elevated hover:text-white hover:border-mecura-silver/40'
                  }`}
                >
                  <span className="leading-tight">Ambos</span>
                  <span className={`text-[9px] font-normal leading-none ${brandPreference === 'both' ? 'text-black/75' : 'text-mecura-silver/60'}`}>
                    Todas as Marcas
                  </span>
                </button>
              </div>
            </div>

            <div 
              onClick={() => handleGenerateAnalysis(false, brandPreference)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateAnalysis(false, brandPreference)}
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
                        handleGenerateAnalysis(true, brandPreference);
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
                        <div className="space-y-5">
                          {(() => {
                            const allMeds = parseMedications(analysisResult).filter(med => med.name);
                            const importedMeds = allMeds.filter(med => med.origin !== 'Nacional');
                            const nationalMeds = allMeds.filter(med => med.origin === 'Nacional');
                            
                            const renderMed = (med, idx, isNational) => {
                              const isAdded = addedMedications.includes(med.name);
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
                            };

                            return (
                              <>
                                {importedMeds.length > 0 && (
                                  <div className="space-y-2.5">
                                    <h5 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider border-b border-blue-500/20 pb-1">Tratamento Principal (Importados)</h5>
                                    {importedMeds.map((med, idx) => renderMed(med, idx, false))}
                                  </div>
                                )}
                                {nationalMeds.length > 0 && (
                                  <div className="space-y-2.5 mt-4">
                                    <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 pb-1 flex items-center justify-between">
                                      <span>🇧🇷 Tratamento Nacional (Óleo, Extração e Flor)</span>
                                      <span className="text-[9px] text-emerald-300 font-semibold px-1.5 py-0.5 bg-emerald-500/20 rounded border border-emerald-500/30">Opção do Paciente</span>
                                    </h5>
                                    {nationalMeds.map((med, idx) => renderMed(med, idx, true))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Accessible Plan Callout Banner */}
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl relative overflow-hidden">
                          <div className="flex items-center gap-2 mb-1.5">
                            <HeartHandshake className="w-4 h-4 text-emerald-400" />
                            <h5 className="text-xs font-bold text-emerald-300">Entrada Nacional</h5>
                          </div>
                          <p className="text-[11px] text-mecura-silver mb-2.5 leading-snug">
                            1 frasco de alto rendimento de Associação Nacional.
                          </p>
                          <button
                            onClick={() => setShowAccessiblePlanModal(true)}
                            className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            Aplicar Protocolo Nacional
                          </button>
                        </div>
                        
                        <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl relative overflow-hidden">
                          <div className="flex items-center gap-2 mb-1.5">
                            <HeartHandshake className="w-4 h-4 text-blue-400" />
                            <h5 className="text-xs font-bold text-blue-300">Entrada Importada</h5>
                          </div>
                          <p className="text-[11px] text-mecura-silver mb-2.5 leading-snug">
                            1 frasco de alto rendimento do Catálogo Oficial Importado.
                          </p>
                          <button
                            onClick={() => setShowAccessibleImportModal(true)}
                            className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            Aplicar Protocolo Importado
                          </button>
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

          {/* Section: Patient Demographics */}
          {(() => {
            const patientAnswers = currentPatient?.answers || answers;
            const pName = currentPatient?.patientName || userName || 'Paciente';
            const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || userBirthDate;
            const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf;
            const pPhone = currentPatient?.phone || patientAnswers?.phone || userPhone;
            const pEmail = currentPatient?.email || (currentPatient?.answers?.email) || '';
            const pAge = calculateAge(pBirthDate);
            const isVip = !!(currentPatient?.isPremium || currentPatient?.plan === 'premium' || currentPatient?.selectedOffer === 'premium' || patientAnswers?.isPremium || currentPatient?.pagamento_premium);

            return (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] flex items-center gap-2">
                    <User className="w-4 h-4 text-mecura-neon" /> Dados Cadastrais
                  </h3>
                  {isVip ? (
                    <button
                      type="button"
                      onClick={() => handleTogglePatientPlan(currentPatient)}
                      title="Plano VIP Premium (R$ 249,90) - Clique para alterar para Essencial"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.25)] tracking-wider hover:scale-105 transition-transform"
                    >
                      <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                      PREMIUM VIP
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTogglePatientPlan(currentPatient)}
                      title="Plano Essencial (R$ 49,90) - Clique para alterar para VIP Premium"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#142A1D] text-[#4ADE80] border border-[#22C55E]/40 tracking-wider hover:border-amber-400/60 hover:text-amber-300 transition-colors"
                    >
                      🌱 ESSENCIAL
                    </button>
                  )}
                </div>
                <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-mecura-elevated/40 pb-2.5">
                    <span className="text-xs text-mecura-silver">Plano da Consulta</span>
                    <button
                      type="button"
                      onClick={() => handleTogglePatientPlan(currentPatient)}
                      title="Clique para alternar o plano"
                      className="text-xs font-bold transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                    >
                      {isVip ? (
                        <span className="text-amber-300 flex items-center gap-1 font-mono">
                          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" /> VIP Premium (R$ 249,90)
                        </span>
                      ) : (
                        <span className="text-[#4ADE80] flex items-center gap-1 font-mono">
                          🌱 Consulta Essencial (R$ 49,90)
                        </span>
                      )}
                      <span className="text-[10px] text-mecura-silver/80 font-normal underline">(Alterar)</span>
                    </button>
                  </div>

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
                    <div className="pt-2 border-t border-mecura-elevated/40 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-mecura-silver">WhatsApp / Telefone</span>
                        <span className="text-xs text-mecura-pearl text-right font-medium text-white">
                          {pPhone || 'Não informado'}
                        </span>
                      </div>
                      {pEmail && !pEmail.includes('sem-email') && (
                        <div className="flex justify-between items-center text-xs text-[#8A8A9E]">
                          <span>Email</span>
                          <span>{pEmail}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleWhatsAppCall(currentPatient)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(37,211,102,0.25)] hover:scale-[1.01] active:scale-[0.99] mt-1"
                        title="Chamar paciente no WhatsApp agora"
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-current" />
                        <span>Chamar no WhatsApp Agora</span>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          
          {/* Section: Anotações da Triagem (Laudo Evolutivo) */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Triagem / Laudo Evolutivo
            </h3>
            <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-4">
              <textarea
                value={evolutionNotes}
                onChange={(e) => setEvolutionNotes(e.target.value)}
                placeholder="Insira as informações chaves aqui. (ex: Histórico laboral, uso prévio de óleos/flor in natura, cultivo artesanal, etc.)"
                className="w-full bg-transparent border-none text-white text-sm resize-none focus:ring-0 p-0 placeholder-mecura-silver/50 min-h-[80px]"
              />
            </div>
          </section>

          {/* Section: Objectives */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Objetivos Principais
            </h3>
            <div className="flex flex-wrap gap-2">
              {(currentPatient?.answers?.objectives || answers?.objectives)?.length ? (
                (currentPatient?.answers?.objectives || answers?.objectives || []).map((obj: string, i: number) => (
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

          {/* Section: Driving & Risks */}
          <section className="mb-8">
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4 text-purple-400">
              Condução de Veículos e Riscos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                <span className="text-xs text-purple-300 block mb-2">Dirige Veículos</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.dirige || answers?.dirige) ? 'text-purple-400' : 'text-white'}`}>{(currentPatient?.answers?.dirige || answers?.dirige) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                <span className="text-xs text-purple-300 block mb-2">Opera Maquinário</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.maquinario || answers?.maquinario) ? 'text-purple-400' : 'text-white'}`}>{(currentPatient?.answers?.maquinario || answers?.maquinario) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                <span className="text-xs text-purple-300 block mb-2">Blitz Frequente</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.blitz || answers?.blitz) ? 'text-purple-400' : 'text-white'}`}>{(currentPatient?.answers?.blitz || answers?.blitz) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/40 rounded-2xl p-5">
                <span className="text-xs text-purple-200 block mb-2 font-bold">Laudo Psicomotor</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.laudo_psicomotor || answers?.laudo_psicomotor) ? 'text-purple-400' : 'text-white'}`}>{(currentPatient?.answers?.laudo_psicomotor || answers?.laudo_psicomotor) ? 'Deseja Solicitar' : 'Não Solicitado'}</span>
              </div>
            </div>

            {/* Agronomic / Cultivation Quick Access */}
            <div className="mt-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-emerald-300 font-bold block uppercase tracking-wider">Laudo Agronômico Pericial</span>
                  <span className="text-sm font-semibold text-white">Dimensionamento de Plantas para Salvo-Conduto / Habeas Corpus</span>
                </div>
              </div>
              <button
                onClick={handleOpenAgronomicReportEditor}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-colors shadow-[0_0_12px_rgba(16,185,129,0.25)] shrink-0"
              >
                Gerar Laudo Agronômico
              </button>
            </div>
          </section>

          {/* Section: Health & Social */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4">
              Saúde & Social
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                <span className="text-sm text-mecura-silver block mb-2">Tratamento Atual</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.tratamento_atual || answers?.tratamento_atual) ? 'text-mecura-neon' : 'text-white'}`}>
                  {(currentPatient?.answers?.tratamento_atual || answers?.tratamento_atual) ? 'Sim' : 'Não'}
                </span>
                {(currentPatient?.answers?.tratamento_atual_details || answers?.tratamento_atual_details) && (
                  <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                    {currentPatient?.answers?.tratamento_atual_details || answers?.tratamento_atual_details}
                  </p>
                )}
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                <span className="text-sm text-mecura-silver block mb-2">Uso de Remédios</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.remedios || answers?.remedios) ? 'text-mecura-neon' : 'text-white'}`}>
                  {(currentPatient?.answers?.remedios || answers?.remedios) ? 'Sim' : 'Não'}
                </span>
                {(currentPatient?.answers?.remedios_details || answers?.remedios_details) && (
                  <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                    {currentPatient?.answers?.remedios_details || answers?.remedios_details}
                  </p>
                )}
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                <span className="text-sm text-mecura-silver block mb-2">Doença Crônica</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.doenca_cronica || answers?.doenca_cronica) ? 'text-mecura-neon' : 'text-white'}`}>
                  {(currentPatient?.answers?.doenca_cronica || answers?.doenca_cronica) ? 'Sim' : 'Não'}
                </span>
                {(currentPatient?.answers?.doenca_cronica_details || answers?.doenca_cronica_details) && (
                  <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                    {currentPatient?.answers?.doenca_cronica_details || answers?.doenca_cronica_details}
                  </p>
                )}
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                <span className="text-sm text-mecura-silver block mb-2">Já usou Cannabis</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.cannabis || answers?.cannabis) ? 'text-mecura-neon' : 'text-white'}`}>
                  {(currentPatient?.answers?.cannabis || answers?.cannabis) ? 'Sim' : 'Não'}
                </span>
                {(currentPatient?.answers?.cannabis_details || answers?.cannabis_details) && (
                  <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                    {currentPatient?.answers?.cannabis_details || answers?.cannabis_details}
                  </p>
                )}
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
              <div className="p-6 md:p-8 border-b border-mecura-elevated bg-mecura-surface/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20 flex-shrink-0">
                    <BrainCircuit className="w-6 h-6 text-mecura-neon" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Análise Clínica Assistida por IA</h2>
                    <p className="text-xs md:text-sm text-mecura-silver">Suporte à decisão médica baseado em evidências científicas</p>
                  </div>
                </div>

                {/* 3 Brand Buttons in Modal Header */}
                <div className="flex items-center gap-1.5 bg-[#0F1017] p-1.5 rounded-2xl border border-mecura-elevated">
                  <span className="text-[10px] font-bold text-mecura-silver uppercase tracking-wider px-2 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-mecura-neon" />
                    Marca:
                  </span>
                  <button
                    onClick={() => {
                      setBrandPreference('flowermed');
                      handleGenerateAnalysis(true, 'flowermed');
                    }}
                    disabled={isAnalyzing}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      brandPreference === 'flowermed'
                        ? 'bg-mecura-neon text-black shadow-[0_0_12px_rgba(166,255,0,0.3)]'
                        : 'text-mecura-silver hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Flowermed
                  </button>
                  <button
                    onClick={() => {
                      setBrandPreference('greenbudz');
                      handleGenerateAnalysis(true, 'greenbudz');
                    }}
                    disabled={isAnalyzing}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      brandPreference === 'greenbudz'
                        ? 'bg-mecura-neon text-black shadow-[0_0_12px_rgba(166,255,0,0.3)]'
                        : 'text-mecura-silver hover:text-white hover:bg-white/5'
                    }`}
                  >
                    GreenBudzCBD
                  </button>
                  <button
                    onClick={() => {
                      setBrandPreference('both');
                      handleGenerateAnalysis(true, 'both');
                    }}
                    disabled={isAnalyzing}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      brandPreference === 'both'
                        ? 'bg-mecura-neon text-black shadow-[0_0_12px_rgba(166,255,0,0.3)]'
                        : 'text-mecura-silver hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Ambos
                  </button>
                </div>

                <button 
                  onClick={() => setShowAnalysisModal(false)}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-mecura-surface hover:bg-mecura-surface-light flex items-center justify-center text-mecura-silver hover:text-white transition-all hover:scale-110 active:scale-95 flex-shrink-0"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
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
                    <div className="space-y-8">
                      {(() => {
                        const allMeds = parseMedications(analysisResult).filter(med => med.name);
                        const importedMeds = allMeds.filter(med => med.origin !== 'Nacional');
                        const nationalMeds = allMeds.filter(med => med.origin === 'Nacional');
                        
                        const renderMed = (med, idx, isNational) => {
                          const isAdded = addedMedications.includes(med.name);
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
                        };

                        return (
                          <>
                            {importedMeds.length > 0 && (
                              <div>
                                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 border-b border-blue-500/20 pb-2">
                                  Tratamento Principal (Medicamentos Importados)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {importedMeds.map((med, idx) => renderMed(med, idx, false))}
                                </div>
                              </div>
                            )}
                            
                            {nationalMeds.length > 0 && (
                              <div>
                                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 border-b border-emerald-500/20 pb-2 mt-2 flex items-center justify-between">
                                  <span>🇧🇷 Tratamento Nacional (Tríade: Óleo, Extração e Flor)</span>
                                  <span className="text-[10px] text-emerald-300 font-semibold px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">Opção do Paciente</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {nationalMeds.map((med, idx) => renderMed(med, idx, true))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
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
                      handleGenerateMedicalReport('inicial');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setShowProductSearchModal(false);
              setSelectedProduct(null);
            }}
          />
          <div
            className="relative w-full max-w-4xl bg-mecura-surface border border-mecura-elevated rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
              <div className="p-4 sm:p-6 border-b border-mecura-elevated flex justify-between items-center bg-mecura-surface-light/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center text-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.15)]">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                      {selectedProduct ? 'Configurar Posologia & Prescrever' : 'Buscar Produto no Guia de Cannabis'}
                    </h3>
                    <p className="text-xs text-mecura-silver">
                      {selectedProduct 
                        ? 'Defina a dosagem, horários e orientações antes de enviar para o chat' 
                        : `${filteredGuideProducts.length} medicamentos disponíveis para prescrição médica`}
                    </p>
                  </div>
                </div>
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
                  {/* Filters Section */}
                  <div className="p-4 border-b border-mecura-elevated bg-[#0A0A0F]/80 space-y-3">
                    {/* Search Inputs Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Free Text Search */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mecura-silver" />
                        <input
                          type="text"
                          placeholder="Buscar por nome, canabinoide, fórmula..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl py-2.5 pl-10 pr-9 text-xs sm:text-sm text-white placeholder-mecura-silver focus:outline-none focus:border-mecura-neon/50 transition-colors"
                        />
                        {productSearchTerm && (
                          <button 
                            onClick={() => setProductSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-mecura-silver hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Disease / Pathology Free Search */}
                      <div className="relative">
                        <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mecura-neon" />
                        <input
                          type="text"
                          placeholder="Filtrar por patologia ou doença (ex: Ansiedade, Dor...)"
                          value={productDiseaseSearchInput}
                          onChange={(e) => {
                            setProductDiseaseSearchInput(e.target.value);
                            if (e.target.value) setProductDiseaseFilter('all');
                          }}
                          className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl py-2.5 pl-10 pr-9 text-xs sm:text-sm text-white placeholder-mecura-silver focus:outline-none focus:border-mecura-neon/50 transition-colors"
                        />
                        {productDiseaseSearchInput && (
                          <button 
                            onClick={() => setProductDiseaseSearchInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-mecura-silver hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dropdowns & Origin Filter Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {/* Brand / Fabricante Select */}
                      <div>
                        <label className="block text-[10px] font-semibold text-mecura-silver mb-1 uppercase tracking-wider">
                          Marca / Fabricante
                        </label>
                        <select
                          value={productBrandFilter}
                          onChange={(e) => setProductBrandFilter(e.target.value)}
                          className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-mecura-neon/50 transition-colors"
                        >
                          <option value="all">Todas as Marcas ({availableBrands.length})</option>
                          {availableBrands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>

                      {/* Pathology / Doença Select */}
                      <div>
                        <label className="block text-[10px] font-semibold text-mecura-silver mb-1 uppercase tracking-wider">
                          Patologia / Indicação Clínica
                        </label>
                        <select
                          value={productDiseaseFilter}
                          onChange={(e) => {
                            setProductDiseaseFilter(e.target.value);
                            if (e.target.value !== 'all') {
                              setProductDiseaseSearchInput('');
                            }
                          }}
                          className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-mecura-neon/50 transition-colors"
                        >
                          <option value="all">Todas as Patologias ({availableDiseases.length})</option>
                          {availableDiseases.map(disease => (
                            <option key={disease} value={disease}>{disease}</option>
                          ))}
                        </select>
                      </div>

                      {/* Origin Buttons */}
                      <div>
                        <label className="block text-[10px] font-semibold text-mecura-silver mb-1 uppercase tracking-wider">
                          Origem do Medicamento
                        </label>
                        <div className="grid grid-cols-3 gap-1 bg-[#12121A] p-1 rounded-xl border border-mecura-elevated">
                          <button
                            onClick={() => setProductOriginFilter('all')}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                              productOriginFilter === 'all'
                                ? 'bg-mecura-neon text-black shadow-sm'
                                : 'text-mecura-silver hover:text-white'
                            }`}
                          >
                            Todas
                          </button>
                          <button
                            onClick={() => setProductOriginFilter('importado')}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                              productOriginFilter === 'importado'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                                : 'text-mecura-silver hover:text-white'
                            }`}
                          >
                            Importado
                          </button>
                          <button
                            onClick={() => setProductOriginFilter('nacional')}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                              productOriginFilter === 'nacional'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'text-mecura-silver hover:text-white'
                            }`}
                          >
                            Nacional
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Pathology Pills Row with Drag & Smooth Scroll */}
                    <div className="flex items-center gap-1.5 pt-1 pb-1">
                      <span className="text-[10px] text-mecura-silver font-bold uppercase tracking-wider whitespace-nowrap mr-0.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-mecura-neon" />
                        Atalhos:
                      </span>

                      {/* Left Scroll Button */}
                      <button
                        type="button"
                        onClick={() => scrollShortcuts('left')}
                        className="w-6 h-6 rounded-lg bg-[#12121A] border border-mecura-elevated flex items-center justify-center text-mecura-silver hover:text-white hover:border-mecura-neon/50 shrink-0 transition-all shadow-sm"
                        title="Rolar atalhos para a esquerda"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      {/* Scrollable Container */}
                      <div 
                        ref={shortcutsContainerRef}
                        onMouseDown={handleShortcutsMouseDown}
                        onMouseMove={handleShortcutsMouseMove}
                        onMouseUp={handleShortcutsMouseUpOrLeave}
                        onMouseLeave={handleShortcutsMouseUpOrLeave}
                        onWheel={handleShortcutsWheel}
                        className={`flex-1 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-mecura-neon/40 scrollbar-track-transparent select-none ${
                          isDraggingState ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                      >
                        {[
                          "Ansiedade",
                          "Dor Crônica",
                          "Insônia",
                          "Epilepsia",
                          "Fibromialgia",
                          "Autismo (TEA)",
                          "TDAH",
                          "Parkinson",
                          "Alzheimer",
                          "Enxaqueca",
                          "Inflamação",
                          "Doença de Crohn",
                          "Esclerose Múltipla",
                          "Síndrome Metabólica",
                          "Cuidados Paliativos",
                          "Dependência Química",
                          "Artrite & Artrose",
                          "Endometriose",
                          "Depressão"
                        ].map(pill => {
                          const isSelected = 
                            normalizeSearch(productDiseaseFilter).includes(normalizeSearch(pill)) || 
                            normalizeSearch(productDiseaseSearchInput).includes(normalizeSearch(pill));
                          return (
                            <button
                              key={pill}
                              type="button"
                              onClick={() => {
                                if (dragMoved.current) return;
                                if (isSelected) {
                                  setProductDiseaseFilter('all');
                                  setProductDiseaseSearchInput('');
                                } else {
                                  setProductDiseaseFilter(pill);
                                  setProductDiseaseSearchInput('');
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
                                isSelected
                                  ? 'bg-mecura-neon text-black font-bold border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.25)] scale-[1.02]'
                                  : 'bg-[#12121A] text-mecura-silver hover:text-white hover:border-mecura-neon/40 border-mecura-elevated'
                              }`}
                            >
                              {pill}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Scroll Button */}
                      <button
                        type="button"
                        onClick={() => scrollShortcuts('right')}
                        className="w-6 h-6 rounded-lg bg-[#12121A] border border-mecura-elevated flex items-center justify-center text-mecura-silver hover:text-white hover:border-mecura-neon/50 shrink-0 transition-all shadow-sm"
                        title="Rolar atalhos para a direita"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {(productSearchTerm || productBrandFilter !== 'all' || productDiseaseFilter !== 'all' || productDiseaseSearchInput || productOriginFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setProductSearchTerm('');
                            setProductBrandFilter('all');
                            setProductDiseaseFilter('all');
                            setProductDiseaseSearchInput('');
                            setProductOriginFilter('all');
                          }}
                          className="text-xs text-red-400 hover:text-red-300 font-semibold underline whitespace-nowrap px-1.5 shrink-0"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Filters Badges & Banners */}
                  <div className="px-4 pt-3 pb-1 border-b border-mecura-elevated/40 bg-[#0A0A0F]/60">
                    {/* Relaxed Filter Notification */}
                    {isRelaxedForQuery && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Info className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-white">
                            Exibindo todos os <strong>{filteredGuideProducts.length}</strong> medicamentos encontrados para <strong>"{productSearchTerm || productBrandFilter}"</strong>. O filtro de patologia foi flexibilizado para não ocultar medicamentos da marca.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProductDiseaseFilter('all');
                            setProductDiseaseSearchInput('');
                          }}
                          className="px-2.5 py-1 bg-amber-400 text-black font-bold rounded-lg text-xs hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
                        >
                          Remover Patologia
                        </button>
                      </div>
                    )}

                    {/* Restricted Count Notification */}
                    {!isRelaxedForQuery && totalMatchingQueryWithoutDisease > filteredGuideProducts.length && (productSearchTerm || productBrandFilter !== 'all') && (
                      <div className="bg-mecura-neon/10 border border-mecura-neon/30 rounded-xl p-2.5 flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Info className="w-4 h-4 text-mecura-neon shrink-0" />
                          <span className="text-white">
                            Exibindo <strong>{filteredGuideProducts.length}</strong> de <strong>{totalMatchingQueryWithoutDisease}</strong> medicamentos de <strong>"{productSearchTerm || productBrandFilter}"</strong> devido ao filtro de patologia ativo (<em>{productDiseaseFilter !== 'all' ? productDiseaseFilter : productDiseaseSearchInput}</em>).
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProductDiseaseFilter('all');
                            setProductDiseaseSearchInput('');
                          }}
                          className="px-2.5 py-1 bg-mecura-neon text-black font-bold rounded-lg text-xs hover:bg-[#b5ff33] transition-colors whitespace-nowrap shrink-0"
                        >
                          Ver todos os {totalMatchingQueryWithoutDisease} produtos
                        </button>
                      </div>
                    )}

                    {/* Active Filter Chips */}
                    {(productSearchTerm || productBrandFilter !== 'all' || productDiseaseFilter !== 'all' || productDiseaseSearchInput || productOriginFilter !== 'all') && (
                      <div className="flex items-center gap-1.5 flex-wrap pb-2 text-xs">
                        <span className="text-[10px] text-mecura-silver uppercase font-bold tracking-wider mr-1">Filtros ativos:</span>
                        
                        {productSearchTerm && (
                          <span className="inline-flex items-center gap-1 bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon px-2 py-0.5 rounded-md font-medium text-xs">
                            Busca: "{productSearchTerm}"
                            <button type="button" onClick={() => setProductSearchTerm('')} className="hover:text-white"><X className="w-3 h-3" /></button>
                          </span>
                        )}

                        {productBrandFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-md font-medium text-xs">
                            Marca: {productBrandFilter}
                            <button type="button" onClick={() => setProductBrandFilter('all')} className="hover:text-white"><X className="w-3 h-3" /></button>
                          </span>
                        )}

                        {(productDiseaseFilter !== 'all' || productDiseaseSearchInput) && (
                          <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-md font-medium text-xs">
                            Patologia: {productDiseaseFilter !== 'all' ? productDiseaseFilter : productDiseaseSearchInput}
                            <button type="button" onClick={() => { setProductDiseaseFilter('all'); setProductDiseaseSearchInput(''); }} className="hover:text-white"><X className="w-3 h-3" /></button>
                          </span>
                        )}

                        {productOriginFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md font-medium text-xs">
                            Origem: {productOriginFilter === 'importado' ? 'Importados' : 'Nacionais'}
                            <button type="button" onClick={() => setProductOriginFilter('all')} className="hover:text-white"><X className="w-3 h-3" /></button>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setProductSearchTerm('');
                            setProductBrandFilter('all');
                            setProductDiseaseFilter('all');
                            setProductDiseaseSearchInput('');
                            setProductOriginFilter('all');
                          }}
                          className="text-[11px] text-red-400 hover:text-red-300 underline font-medium ml-1"
                        >
                          Limpar todos
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Product List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {filteredGuideProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#12121A] border border-mecura-elevated flex items-center justify-center mb-3 text-mecura-silver">
                          <Search className="w-7 h-7" />
                        </div>
                        <h4 className="text-white font-bold text-base mb-1">Nenhum medicamento encontrado</h4>
                        <p className="text-mecura-silver text-xs max-w-sm mb-4">
                          Tente buscar por outro termo, fabricante ou limpar os filtros de patologia.
                        </p>
                        <button
                          onClick={() => {
                            setProductSearchTerm('');
                            setProductBrandFilter('all');
                            setProductDiseaseFilter('all');
                            setProductDiseaseSearchInput('');
                            setProductOriginFilter('all');
                          }}
                          className="px-4 py-2 bg-mecura-neon/10 hover:bg-mecura-neon/20 text-mecura-neon border border-mecura-neon/30 rounded-xl text-xs font-bold transition-all"
                        >
                          Resetar Filtros
                        </button>
                      </div>
                    ) : (
                      filteredGuideProducts.map((product, idx) => {
                        const isImported = (product.origin || '').toLowerCase().includes('importado') || (product.origin || '').toLowerCase().includes('eua');
                        const indicationsArray = product.indications 
                          ? product.indications.split(/[,;•\n]/).map(s => s.trim()).filter(Boolean).slice(0, 3)
                          : (product.categoryIndications || []).slice(0, 3);

                        return (
                          <div 
                            key={idx}
                            onClick={() => setSelectedProduct(product)}
                            className="p-4 rounded-xl border border-mecura-elevated bg-[#0A0A0F] hover:border-mecura-neon/60 hover:bg-[#12121A] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-white font-bold text-sm sm:text-base group-hover:text-mecura-neon transition-colors">
                                  {product.name}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                  isImported
                                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                }`}>
                                  {product.origin || (isImported ? 'Importado' : 'Nacional')}
                                </span>
                                {product.priceBRL && (
                                  <span className="text-[11px] font-mono font-bold text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded-md border border-mecura-neon/20">
                                    R$ {product.priceBRL}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-mecura-silver flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-mecura-pearl">{product.manufacturer}</span>
                                <span>•</span>
                                <span>{product.type}</span>
                                {product.concentration && (
                                  <>
                                    <span>•</span>
                                    <span className="text-mecura-silver/80">{product.concentration}</span>
                                  </>
                                )}
                              </p>

                              {/* Indications Badges */}
                              {indicationsArray.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                  {indicationsArray.map((ind, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-mecura-surface text-mecura-silver border border-white/5">
                                      {ind}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(product);
                                }}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-mecura-neon/10 group-hover:bg-mecura-neon group-hover:text-black text-mecura-neon text-xs font-bold border border-mecura-neon/30 transition-all flex items-center justify-center gap-1.5"
                              >
                                <span>Prescrever</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
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
                        <option value="Sublingual (óleo de cannabis)&#10;Depositar as gotas sob a língua&#10;Manter por 60-90 segundos antes de engolir&#10;Iniciar com dose baixa e ajustar gradualmente">Sublingual (óleo de cannabis)</option>
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
                      .filter(h => (h.patientName || '').toLowerCase().includes((historySearchTerm || '').toLowerCase()))
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
                    
                    {useStore.getState().consultationHistory.filter(h => (h.patientName || '').toLowerCase().includes((historySearchTerm || '').toLowerCase())).length === 0 && (
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
                                    {(Array.isArray(msg.productData.dosage) ? msg.productData.dosage : [msg.productData.dosage || '']).map((d: string, i: number) => (
                                      <p key={`${msg.id}-protocol-${i}`} className="text-xs text-mecura-silver">• {d}</p>
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

        {/* IMPORTED Accessible Protocol Modal */}
        {showAccessibleImportModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setShowAccessibleImportModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#0F1017] border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col max-h-[92vh] z-10"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-transparent flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-lg">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        Protocolo de Entrada Acessível
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        Catálogo Importado
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-mecura-silver leading-relaxed">
                      Alternativa com excelente custo-benefício para iniciar com <strong>01 frasco Importado de alto rendimento (~60 dias)</strong> e evoluir progressivamente conforme a resposta clínica e as condições do paciente.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAccessibleImportModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-mecura-silver hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Step 1: Select Formulation */}
                <div>
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">1</span>
                    Selecione a Formulação de Entrada (Frasco Único)
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Option CBD */}
                    <div 
                      onClick={() => setAccessibleImportType('cbd')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        accessibleImportType === 'cbd'
                          ? 'bg-blue-950/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-blue-500/40 hover:bg-mecura-surface/70'
                      }`}
                    >
                      {accessibleImportType === 'cbd' && (
                        <div className="absolute top-2 right-2 text-blue-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30 inline-block mb-2">
                          Ansiedade / Estresse / Foco
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          GreenBudz Isolate CBD Hemp Formula
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Alta concentração de Canabidiol. Ação ansiolítica, reguladora do humor e anti-inflamatória, zero THC.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-blue-400 font-semibold flex items-center justify-between">
                        <span>30ml • Rende ~60 dias</span>
                        <span className="text-white/80">3 gotas 2x/dia</span>
                      </div>
                    </div>

                    {/* Option Balanced */}
                    <div 
                      onClick={() => setAccessibleImportType('balanced')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        accessibleImportType === 'balanced'
                          ? 'bg-blue-950/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-blue-500/40 hover:bg-mecura-surface/70'
                      }`}
                    >
                      {accessibleImportType === 'balanced' && (
                        <div className="absolute top-2 right-2 text-blue-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 inline-block mb-2">
                          Insônia / Regulação do Sono
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          Drops By GreenBudz CBD+CBN
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Proporção ideal (CBN e CBD) focada em indução do sono, relaxamento noturno e manutenção.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-blue-400 font-semibold flex items-center justify-between">
                        <span>30ml • Rende ~60 dias</span>
                        <span className="text-white/80">3-6 gotas à noite</span>
                      </div>
                    </div>

                    {/* Option THC */}
                    <div 
                      onClick={() => setAccessibleImportType('thc')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        accessibleImportType === 'thc'
                          ? 'bg-blue-950/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-blue-500/40 hover:bg-mecura-surface/70'
                      }`}
                    >
                      {accessibleImportType === 'thc' && (
                        <div className="absolute top-2 right-2 text-blue-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded border border-orange-500/30 inline-block mb-2">
                          Dor Crônica / Rigidez
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          Drops By GreenBudz CBD+THC
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Proporção rica em THC e CBD para analgesia profunda, controle de espasmos musculares.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-blue-400 font-semibold flex items-center justify-between">
                        <span>30ml • Rende ~60 dias</span>
                        <span className="text-white/80">3 gotas 12/12h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Protocol Explanation (Static visual representation of the path) */}
                <div>
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">
                      <TrendingUp className="w-3 h-3" />
                    </span>
                    Plano de Evolução do Tratamento
                  </label>
                  
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 p-4 rounded-xl bg-mecura-surface border border-mecura-elevated">
                      <h5 className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        Fase 1: Início Acessível (Meses 1 e 2)
                      </h5>
                      <p className="text-[11px] text-mecura-silver leading-relaxed">
                        Uso exclusivo do frasco Importado com titulação lenta (inicia com gotas reduzidas e ajusta 1 gota a cada 5 dias). Custo previsível e baixo consumo.
                      </p>
                    </div>
                    
                    <div className="flex-1 p-4 rounded-xl bg-blue-900/10 border border-blue-900/30">
                      <h5 className="text-xs font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Fase 2: Reavaliação (Mês 2 em diante)
                      </h5>
                      <p className="text-[11px] text-mecura-silver leading-relaxed opacity-80">
                        Retorno clínico. Se houver controle adequado (superior a 70%), mantém apenas a monoterapia. Caso persistam sintomas, ajustar dose mantendo segurança financeira.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Custom Text */}
                <div>
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">2</span>
                    Mensagem Acolhedora para o Paciente (Chat)
                    <span className="ml-auto text-[9px] text-mecura-silver/50 font-normal normal-case">(editável antes do envio)</span>
                  </label>
                  <textarea
                    value={accessibleImportCustomMessage}
                    onChange={(e) => setAccessibleImportCustomMessage(e.target.value)}
                    placeholder="Ex: 'Como conversamos sobre o orçamento, estou enviando este tratamento de entrada. Ele durará cerca de 60 dias...'"
                    className="w-full h-24 p-3.5 bg-[#0F1017] border border-mecura-elevated rounded-xl text-[13px] text-white placeholder-mecura-silver/50 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none shadow-inner"
                  />
                  {accessibleImportCustomMessage.length === 0 && (
                    <div className="mt-2 text-[10px] text-orange-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Você pode personalizar esta mensagem ou deixá-la em branco para usar o padrão da clínica.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-6 border-t border-mecura-elevated/50 bg-[#0F1017] flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                <button 
                  onClick={() => setShowAccessibleImportModal(false)}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-mecura-silver hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      const patientName = currentPatient?.patientName || userName || 'Paciente';
                      
                      let prodName = "CBD Isolate Alto Rendimento";
                      let dosage = ["Tomar 02 gotas de 12/12 horas (sublingual).", "Aumentar 01 gota a cada 05 dias até atingir a dose de controle.", "01 Frasco rende cerca de 45 a 60 dias."];
                      let strategyDesc = "Plano de entrada otimizado para controle de ansiedade/estresse.";
                      
                      if (accessibleImportType === 'balanced') {
                        prodName = "Drops By GreenBudz CBD+CBN Sleep";
                        dosage = ["Tomar 03 gotas 30 minutos antes de dormir.", "Aumentar gradativamente se houver interrupção do sono.", "Foco em relaxamento e indução do sono."];
                        strategyDesc = "Plano de entrada otimizado para insônia e regulação noturna.";
                      } else if (accessibleImportType === 'thc') {
                        prodName = "Drops By GreenBudz Formula CBD/THC";
                        dosage = ["Tomar 02 gotas de 12/12 horas (sublingual).", "Aumentar 01 gota a cada 04 dias.", "Foco em analgesia e dores crônicas."];
                        strategyDesc = "Plano de entrada otimizado para dor crônica e rigidez.";
                      }
                      
                      const productData = {
                        name: prodName,
                        brand: 'GreenBudzCBD',
                        origin: 'Importado',
                        type: "Óleo de Cannabis",
                        dosage: dosage,
                        strategy: strategyDesc,
                        activeIngredients: "CBD/CBN/THC",
                        concentration: "Alto Rendimento",
                        pharmaceuticalForm: "Óleo Sublingual",
                        unitSize: "Frasco 30ml",
                        details: ['Frasco 30ml', 'Alto rendimento (~60 dias)', 'Catálogo Oficial Importado'],
                        description: strategyDesc,
                        image: "https://placehold.co/400x400/3b82f6/ffffff?text=Importado"
                      };
                      
                      const defaultMsg = `Olá ${patientName}! Pensando na sua acessibilidade, estruturei um **Protocolo de Entrada Acessível** utilizando nosso Catálogo Oficial Importado.\n\nIniciaremos com **apenas 01 medicamento de alto rendimento** (${prodName}), que dura cerca de 2 meses com a dosagem ajustada.\n\nEste protocolo nos permite iniciar o tratamento de forma segura, com excelente qualidade e menor impacto financeiro inicial.`;
                      const msg = accessibleImportCustomMessage.trim() || defaultMsg;
                      
                      // 1. Send empathetic doctor chat message
                      addMessage({
                        sender: 'doctor',
                        text: msg,
                        type: 'text'
                      });

                      // 2. Add product prescription
                      addMessage({
                        sender: 'doctor',
                        type: 'product',
                        productData
                      });

                      // 3. Add prescription notes
                      const protocolNotes = `PROTOCOLO DE ENTRADA ACESSÍVEL (FASE 1):\n- Medicamento Inicial: ${prodName} (Importado)\n- Posologia Econômica: ${dosage.join(' ')}\n- Rendimento estimado: 45 a 60 dias.\n- Fase 2 (Evolução): Reavaliação em 30 a 45 dias para verificar resposta terapêutica e evolução progressiva se necessário.\n- Administrar preferencialmente após as refeições.`;

                      addMessage({
                        sender: 'doctor',
                        type: 'prescription_notes',
                        text: protocolNotes
                      });
                      
                      setShowAccessibleImportModal(false);
                      setAccessibleImportCustomMessage('');
                    }}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-400 hover:to-indigo-300 text-white font-bold text-xs md:text-sm rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Prescrever e Enviar ao Paciente
                  </button>
                </div>
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

      {/* Psychomotor Report View & Edit Modal */}
      <PsychomotorReportEditorModal
        isOpen={showPsychomotorReportEditorModal}
        onClose={() => setShowPsychomotorReportEditorModal(false)}
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
        psychomotorText={psychomotorReportText}
        setPsychomotorText={setPsychomotorReportText}
        onDownloadPDF={handleDownloadPsychomotorReportFromEditor}
      />

      {/* Agronomic Report View & Edit Modal */}
      <AgronomicReportEditorModal
        isOpen={showAgronomicReportEditorModal}
        onClose={() => setShowAgronomicReportEditorModal(false)}
        patientName={agronomicPatientName}
        setPatientName={setAgronomicPatientName}
        cpf={agronomicCpf}
        setCpf={setAgronomicCpf}
        emissionDate={agronomicEmissionDate}
        setEmissionDate={setAgronomicEmissionDate}
        agronomistName={agronomicName}
        setAgronomistName={setAgronomicName}
        agronomistCrea={agronomicCrea}
        setAgronomistCrea={setAgronomicCrea}
        diagnosis={agronomicDiagnosis}
        setDiagnosis={setAgronomicDiagnosis}
        dailyDoseMg={agronomicDailyDoseMg}
        setDailyDoseMg={setAgronomicDailyDoseMg}
        targetPlants={agronomicTargetPlants}
        setTargetPlants={setAgronomicTargetPlants}
        agronomicText={agronomicText}
        setAgronomicText={setAgronomicText}
        onDownloadPDF={handleDownloadAgronomicReportFromEditor}
        onSendToChat={handleSendAgronomicReportToChat}
      />
    </div>
  );
}