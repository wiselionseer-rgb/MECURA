import { useAdminStore } from '../store/useAdminStore';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  FilePlus2,
  FileSignature,
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
  Brain,
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
  Crown,
  PhoneCall,
  Pill,
  Plus,
  Clock,
  Lock,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.182-.076.355.101.173.45 1.085 1.276 1.821.65.579 1.199.759 1.372.845.173.086.274.072.375-.044.101-.116.433-.505.549-.679.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
  </svg>
);
import { setDoc, doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { requestNotificationPermission, getNotificationPermission, testNotification, showNativeNotification, subscribeToBackgroundNotifications, triggerBackgroundPush } from '../utils/notifications';
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
import { cbdGuideData, CBDProduct, enrichMedicationDetails, CBDCategory, ABECMED_PRODUCTS, ABECMED_COMPANY_INFO, ABECMED_AGENT_SYSTEM_PROMPT, ABRACE_PRODUCTS, ABRACE_COMPANY_INFO, ABRACE_AGENT_SYSTEM_PROMPT, SOUCANNABIS_PRODUCTS, SOUCANNABIS_COMPANY_INFO, SOUCANNABIS_AGENT_SYSTEM_PROMPT, PANGAIA_PRODUCTS, PANGAIA_COMPANY_INFO, PANGAIA_AGENT_SYSTEM_PROMPT } from '../data/cbdGuide';
import { mergeProductCatalogs, subscribeToFirestoreCatalog, extractAllBrands, extractAllDiseases, getBestCategoryIdForProduct, getCustomBulaData, applyCustomBulaToProduct, getDeletedProductNames } from '../utils/productCatalog';
import { FLOWERMED_PRODUCTS } from '../data/flowermedCatalog';
import { FLOWER_EXTRACTIONS_PRODUCTS } from '../data/flowerExtractionsCatalog';
import { NotificationToast } from '../components/NotificationToast';
import { EnableNotificationsBanner } from '../components/EnableNotificationsBanner';
import { PrescriptionEditorModal } from '../components/PrescriptionEditorModal';
import { MedicalReportEditorModal } from '../components/MedicalReportEditorModal';
import { PsychomotorReportEditorModal } from '../components/PsychomotorReportEditorModal';
import { AgronomicReportEditorModal } from '../components/AgronomicReportEditorModal';
import { StandaloneDocumentModal, StandalonePatientData } from '../components/StandaloneDocumentModal';
import { AreaPasswordModal } from '../components/AreaPasswordModal';
import { ProgrammedPrescriptionsModal } from '../components/ProgrammedPrescriptionsModal';
import { ProgrammedPrescriptionProfile, getProgrammedProfiles, getDoctorCustomModel } from '../data/programmedPrescriptions';
import { NeurodivergentTestsCard } from '../components/tools/NeurodivergentTestsCard';

import { generatePrescriptionPDF, generateMedicalReportPDF, generatePsychomotorReportPDF, generateAgronomicReportPDF, PrescriptionItemData, isNationalProduct } from '../utils/pdfGenerator';
import { generatePersonalizedClinicalReport } from '../utils/clinicalReportGenerator';
import { downloadOrGenerateAttachment } from '../utils/downloadHelper';

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

// Isolated chat input component with local state to prevent re-rendering the massive dashboard on every keystroke
const DoctorChatInputBar = memo(({
  onSend,
  hasPendingAttachment,
  onSendPendingAttachment
}: {
  onSend: (text: string) => void;
  hasPendingAttachment: boolean;
  onSendPendingAttachment: () => void;
}) => {
  const [text, setText] = useState('');

  const submit = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    } else if (hasPendingAttachment) {
      onSendPendingAttachment();
    }
  };

  return (
    <>
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Digite sua mensagem para o paciente..." 
        className="flex-1 h-12 md:h-14 bg-mecura-surface border border-mecura-elevated rounded-full px-4 md:px-6 text-white focus:outline-none focus:border-mecura-neon/50 focus:bg-mecura-surface-light transition-all text-base md:text-[15px]"
      />
      <button 
        type="button"
        onClick={submit}
        disabled={!text.trim() && !hasPendingAttachment}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-mecura-neon text-black flex items-center justify-center hover:bg-[#b5ff33] transition-all shadow-[0_0_20px_rgba(166,255,0,0.2)] disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
      >
        <Send className="w-4 h-4 md:w-5 md:h-5 ml-1" />
      </button>
    </>
  );
});

// Isolated fast textarea with local state to prevent re-rendering the massive dashboard on every keystroke
const IsolatedFastTextarea = memo(({
  value,
  onChange,
  placeholder,
  className,
  rows = 3
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}) => {
  const [localVal, setLocalVal] = useState(value);
  const isFocusedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastEmittedRef = useRef(value);

  useEffect(() => {
    if (!isFocusedRef.current && value !== lastEmittedRef.current) {
      setLocalVal(value);
      lastEmittedRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localVal !== lastEmittedRef.current) {
        lastEmittedRef.current = localVal;
        onChangeRef.current(localVal);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localVal]);

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (localVal !== lastEmittedRef.current) {
      lastEmittedRef.current = localVal;
      onChangeRef.current(localVal);
    }
  };

  return (
    <textarea
      rows={rows}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onFocus={() => { isFocusedRef.current = true; }}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
});

export function DoctorDashboardScreen() {
  const { productCategories: storeProductCategories, addProduct } = useAdminStore();
  const [cloudCategories, setCloudCategories] = useState<CBDCategory[]>([]);

  // Quick Add Custom Product in Doctor Dashboard
  const [showNewProductModalInDashboard, setShowNewProductModalInDashboard] = useState(false);
  const [newDashProdName, setNewDashProdName] = useState('');
  const [newDashProdBrand, setNewDashProdBrand] = useState('Associação Brasileira (Nacional)');
  const [newDashProdOrigin, setNewDashProdOrigin] = useState<'Nacional' | 'Importado'>('Nacional');
  const [newDashProdForm, setNewDashProdForm] = useState('Solução Oleosa Sublingual (Gotas)');
  const [newDashProdConcentration, setNewDashProdConcentration] = useState('');
  const [newDashProdQuantity, setNewDashProdQuantity] = useState('01 Frasco de 30 mL');
  const [newDashProdDosage, setNewDashProdDosage] = useState('Tomar 05 gotas sublinguais de 12/12 horas. Reter sob a língua por 60 segundos antes de deglutir.');
  const [saveDashToCatalog, setSaveDashToCatalog] = useState(true);

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
    subscribeToMessages, subscribeToAppointments, activeConsultationId,
    consultationHistory, subscribeToAllConsultationHistory, fetchPatientMessages,
    exchangeRate, patientId, transferPatientQueue
  } = useStore();

  // Filter patients that belong to the doctor queue (retain dual-chat patients so patient can talk to both professionals)
  const doctorQueue = useMemo(() => {
    return (queue || []).filter(p => {
      const qType = (p as any).queueType;
      const plan = (p as any).plan;
      const offer = (p as any).selectedOffer;
      const allowDual = !!(p as any).allowDualChat || (p as any).lastMessageTarget === 'doctor';

      // Exclude ONLY if strictly psychologist-only and not dual-chat
      if (!allowDual && qType === 'psychologist') return false;
      if (!allowDual && qType !== 'doctor' && (plan === 'psychologist' || offer === 'psychologist')) return false;

      return true;
    });
  }, [queue]);

  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [expandAnalysis, setExpandAnalysis] = useState(false);
  const [brandPreference, setBrandPreference] = useState<'flowermed' | 'greenbudz' | 'soucannabis' | 'abrace' | 'abecmed' | 'pangaia' | 'both'>('both');
  const [nationalPreference, setNationalPreference] = useState<'soucannabis' | 'abrace' | 'abecmed' | 'all'>('soucannabis');
  const [importedPreference, setImportedPreference] = useState<'pangaia' | 'flowermed' | 'greenbudz' | 'all'>('pangaia');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [addedMedications, _setAddedMedications] = useState<string[]>([]);
  const addedMedicationsRef = useRef<string[]>([]);
  const setAddedMedications = (val: string[] | ((prev: string[]) => string[])) => {
    const next = typeof val === 'function' ? val(addedMedicationsRef.current) : val;
    addedMedicationsRef.current = next;
    _setAddedMedications(next);
  };
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
  const [accessibleType, setAccessibleType] = useState<'cbd' | 'balanced' | 'thc' | 'broad_cbn'>('broad_cbn');
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

  const [bulaVersion, setBulaVersion] = useState(0);
  useEffect(() => {
    const handleBulaUpdate = () => {
      setBulaVersion(v => v + 1);
    };
    window.addEventListener('mecura_bula_updated', handleBulaUpdate);
    window.addEventListener('storage', handleBulaUpdate);
    return () => {
      window.removeEventListener('mecura_bula_updated', handleBulaUpdate);
      window.removeEventListener('storage', handleBulaUpdate);
    };
  }, []);

  const allGuideProducts = useMemo(() => {
    const map = new Map<string, CBDProduct & { categoryTitle?: string; categoryIndications?: string[] }>();
    const deletedSet = getDeletedProductNames();

    productCategories.forEach(cat => {
      cat.products.forEach(rawP => {
        const p = applyCustomBulaToProduct(rawP);
        const key = (p.name || '').trim().toLowerCase();
        if (!key || deletedSet.has(key)) return;

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
  }, [productCategories, bulaVersion]);

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
    const allTextMatches: (CBDProduct & { categoryTitle?: string; categoryIndications?: string[] })[] = [];

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

      if (textOk && queryTokens.length > 0) {
        allTextMatches.push(p);
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

    // Smart fallback: if searching specifically by brand or term and disease/brand/origin filters leave 0 results, relax filters
    if ((queryTokens.length > 0 || productBrandFilter !== 'all') && diseaseClean && fullMatches.length === 0 && textAndBrandMatches.length > 0) {
      return {
        filteredGuideProducts: textAndBrandMatches,
        totalMatchingQueryWithoutDisease: textAndBrandMatches.length,
        isRelaxedForQuery: true
      };
    }

    if (queryTokens.length > 0 && fullMatches.length === 0 && allTextMatches.length > 0) {
      return {
        filteredGuideProducts: allTextMatches,
        totalMatchingQueryWithoutDisease: allTextMatches.length,
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

  const selectAndConfigureProduct = (rawProduct: CBDProduct) => {
    const product = applyCustomBulaToProduct(rawProduct);
    setSelectedProduct(product);
    const customBula = getCustomBulaData(product);
    const enriched = enrichMedicationDetails(product.name, product.manufacturer, product.origin, product.type, product);
    setDosageInput(customBula?.posologyDetails || product.posologyDetails || product.usageInstructions || enriched.usageInstructions || 'Tomar 03 a 05 gotas sublingual de 12/12 horas');
  };
  const [selectedUploadDocType, setSelectedUploadDocType] = useState<'receita' | 'laudo_inicial' | 'laudo_evolutivo' | 'laudo_psicomotor' | 'laudo_agronomico' | 'documento'>('receita');
  const [pendingAttachment, setPendingAttachment] = useState<{name: string, url: string, type: string, docType?: 'receita' | 'laudo_inicial' | 'laudo_evolutivo' | 'laudo_psicomotor' | 'laudo_agronomico' | 'documento', title?: string} | null>(null);
  const [isSendingAttachment, setIsSendingAttachment] = useState(false);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'in-consultation' | 'finished'>('waiting');
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
  const [medicalReportType, setMedicalReportType] = useState<'inicial' | 'evolutivo'>('inicial');
  const [isSendingReportToChat, setIsSendingReportToChat] = useState(false);
  const [isSendingPsychomotorToChat, setIsSendingPsychomotorToChat] = useState(false);
  const [isSendingAgronomicToChat, setIsSendingAgronomicToChat] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [showNeuroTestsBanner, setShowNeuroTestsBanner] = useState(true);
  const [actionToastMessage, setActionToastMessage] = useState<string | null>(null);

  const showActionToast = (msg: string) => {
    setActionToastMessage(msg);
    setTimeout(() => setActionToastMessage(null), 4000);
  };

  const [reportPatientName, setReportPatientName] = useState('');
  const [reportBirthDate, setReportBirthDate] = useState('');
  const [reportCpf, setReportCpf] = useState('');
  const [evolutionNotes, setEvolutionNotes] = useState('');
  const [reportEmissionDate, setReportEmissionDate] = useState('');
  const [reportDoctorName, setReportDoctorName] = useState('Dr. Guilherme Taveira Dias');
  const [reportDoctorCrm, setReportDoctorCrm] = useState('CRM/MT 17259');
  const [reportDoctorSpecialty, setReportDoctorSpecialty] = useState('Clínico Geral • Medicina Canabinoide');
  const [reportDiagnosis, setReportDiagnosis] = useState('');
  const [reportRationale, setReportRationale] = useState('');
  const [reportTreatmentPlan, setReportTreatmentPlan] = useState('');
  const [reportMonitoring, setReportMonitoring] = useState('');

  // Helpers to persist and load customized reports strictly per patient so one patient's report never leaks into another's
  const getPatientReportKey = (pId?: string | null, pName?: string | null) => {
    const cleanId = (pId || '').trim().toLowerCase();
    if (cleanId) return `id:${cleanId}`;
    const cleanName = (pName || '').trim().toLowerCase();
    if (cleanName && cleanName !== 'paciente') return `name:${cleanName}`;
    if (currentPatient?.id) return `id:${String(currentPatient.id).trim().toLowerCase()}`;
    if (currentPatient?.patientName && currentPatient.patientName.trim().toLowerCase() !== 'paciente') {
      return `name:${currentPatient.patientName.trim().toLowerCase()}`;
    }
    return 'avulso_temp';
  };

  const loadSavedReport = (patientKey: string, type: 'inicial' | 'evolutivo' | 'psicomotor' | 'agronomico', expectedPatientName?: string, expectedPatientId?: string | null) => {
    try {
      const raw = localStorage.getItem('mecura_saved_reports_v2');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      const targetId = (expectedPatientId !== undefined ? expectedPatientId : currentPatient?.id) || '';
      const targetName = (expectedPatientName || currentPatient?.patientName || '').trim().toLowerCase();

      const candidates: string[] = [];
      if (patientKey) candidates.push(patientKey.toLowerCase().trim());
      if (targetId) {
        candidates.push(`id:${String(targetId).toLowerCase().trim()}`);
        candidates.push(String(targetId).toLowerCase().trim());
      }
      if (!targetId && targetName && targetName !== 'paciente') {
        candidates.push(`name:${targetName}`);
        candidates.push(targetName);
      }

      for (const k of candidates) {
        const candidate = k && parsed[k] ? parsed[k][type] : null;
        if (candidate) {
          // Ensure saved report actually belongs to this patient if a name is stored
          const savedName = (candidate.patientName || '').trim().toLowerCase();
          if (targetName && targetName !== 'paciente' && savedName && savedName !== 'paciente' && savedName !== targetName) {
            continue;
          }
          return candidate;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const saveReportToStorage = (patientKey: string, type: 'inicial' | 'evolutivo' | 'psicomotor' | 'agronomico', data: any, explicitPatientId?: string | null) => {
    try {
      const raw = localStorage.getItem('mecura_saved_reports_v2');
      const parsed = raw ? JSON.parse(raw) : {};
      // Clean up legacy global key that caused cross-patient contamination
      if (parsed['paciente_atual']) {
        delete parsed['paciente_atual'];
      }
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      const keysToSave = new Set<string>();
      if (patientKey) keysToSave.add(patientKey.toLowerCase().trim());
      const resolvedId = explicitPatientId !== undefined ? explicitPatientId : (standaloneTargetPatientId || currentPatient?.id);
      if (resolvedId) {
        keysToSave.add(`id:${String(resolvedId).toLowerCase().trim()}`);
        keysToSave.add(String(resolvedId).toLowerCase().trim());
      } else if (data?.patientName && String(data.patientName).trim().toLowerCase() !== 'paciente') {
        const cleanName = String(data.patientName).trim().toLowerCase();
        keysToSave.add(`name:${cleanName}`);
        keysToSave.add(cleanName);
      }

      keysToSave.forEach(k => {
        if (!k) return;
        if (!parsed[k]) parsed[k] = {};
        parsed[k][type] = payload;
      });
      localStorage.setItem('mecura_saved_reports_v2', JSON.stringify(parsed));
    } catch (e) {
      console.warn("Could not save report to localStorage:", e);
    }
  };

  const handleSaveAgronomicReport = async (savedData: {
    patientName: string;
    cpf: string;
    emissionDate: string;
    agronomistName: string;
    agronomistCrea: string;
    diagnosis: string;
    dailyDoseMg: number;
    targetPlants: number;
    agronomicText: string;
  }) => {
    const targetId = standaloneTargetPatientId || currentPatient?.id || null;
    const key = getPatientReportKey(targetId, savedData.patientName || agronomicPatientName);
    saveReportToStorage(key, 'agronomico', savedData, targetId);
    setAgronomicPatientName(savedData.patientName);
    setAgronomicCpf(savedData.cpf);
    setAgronomicEmissionDate(savedData.emissionDate);
    setAgronomicName(savedData.agronomistName);
    setAgronomicCrea(savedData.agronomistCrea);
    setAgronomicDiagnosis(savedData.diagnosis);
    setAgronomicDailyDoseMg(savedData.dailyDoseMg);
    setAgronomicTargetPlants(savedData.targetPlants);
    setAgronomicText(savedData.agronomicText);

    const targetPatientId = standaloneTargetPatientId || currentPatient?.id || activeConsultationId;
    if (targetPatientId) {
      try {
        await setDoc(doc(db, 'queue', targetPatientId), {
          agronomicReportData: savedData,
          lastReportUpdated: new Date().toISOString()
        }, { merge: true });
        await setDoc(doc(db, 'active_consultations', targetPatientId), {
          agronomicReportData: savedData,
          lastReportUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn("Could not sync agronomic report to Firestore:", err);
      }
    }

    showActionToast('Alterações do Parecer Agronômico salvas com sucesso!');
  };

  const handleSaveMedicalReport = async (savedData: {
    diagnosis: string;
    rationale: string;
    treatmentPlan: string;
    monitoring: string;
    patientName: string;
    birthDate: string;
    cpf: string;
    emissionDate: string;
    doctorName: string;
    doctorCrm: string;
    doctorSpecialty: string;
  }) => {
    const targetId = standaloneTargetPatientId || currentPatient?.id || null;
    const key = getPatientReportKey(targetId, savedData.patientName || reportPatientName);
    saveReportToStorage(key, medicalReportType, savedData, targetId);
    setReportDiagnosis(savedData.diagnosis);
    setReportRationale(savedData.rationale);
    setReportTreatmentPlan(savedData.treatmentPlan);
    setReportMonitoring(savedData.monitoring);
    setReportPatientName(savedData.patientName);
    setReportBirthDate(savedData.birthDate);
    setReportCpf(savedData.cpf);
    setReportEmissionDate(savedData.emissionDate);
    setReportDoctorName(savedData.doctorName);
    setReportDoctorCrm(savedData.doctorCrm);
    setReportDoctorSpecialty(savedData.doctorSpecialty);

    const targetPatientId = standaloneTargetPatientId || currentPatient?.id || activeConsultationId;
    if (targetPatientId) {
      try {
        await setDoc(doc(db, 'queue', targetPatientId), {
          medicalReportData: savedData,
          lastReportUpdated: new Date().toISOString()
        }, { merge: true });
        await setDoc(doc(db, 'active_consultations', targetPatientId), {
          medicalReportData: savedData,
          lastReportUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn("Could not sync medical report to Firestore:", err);
      }
    }

    showActionToast(`Alterações do ${medicalReportType === 'evolutivo' ? 'Laudo Evolutivo' : 'Laudo Inicial'} salvas com sucesso!`);
  };

  const handleSavePsychomotorReport = async (text: string) => {
    const targetId = standaloneTargetPatientId || currentPatient?.id || null;
    const key = getPatientReportKey(targetId, reportPatientName);
    const dataToSave = { 
      text,
      patientName: reportPatientName,
      birthDate: reportBirthDate,
      cpf: reportCpf,
      emissionDate: reportEmissionDate,
      doctorName: reportDoctorName,
      doctorCrm: reportDoctorCrm,
      doctorSpecialty: reportDoctorSpecialty
    };
    saveReportToStorage(key, 'psicomotor', dataToSave, targetId);
    setPsychomotorReportText(text);

    const targetPatientId = standaloneTargetPatientId || currentPatient?.id || activeConsultationId;
    if (targetPatientId) {
      try {
        await setDoc(doc(db, 'queue', targetPatientId), {
          psychomotorReportData: dataToSave,
          lastReportUpdated: new Date().toISOString()
        }, { merge: true });
        await setDoc(doc(db, 'active_consultations', targetPatientId), {
          psychomotorReportData: dataToSave,
          lastReportUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn("Could not sync psychomotor report to Firestore:", err);
      }
    }

    showActionToast('Alterações do Laudo Psicomotor salvas com sucesso!');
  };

  const loadSavedPrescription = (patientKey?: string | null, expectedPatientName?: string, expectedPatientId?: string | null) => {
    try {
      const raw = localStorage.getItem('mecura_saved_prescriptions_v2');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      const targetId = (expectedPatientId !== undefined ? expectedPatientId : currentPatient?.id) || '';
      const targetName = (expectedPatientName || currentPatient?.patientName || '').trim().toLowerCase();

      const candidates: string[] = [];
      if (patientKey) candidates.push(patientKey.toLowerCase().trim());
      if (targetId) {
        candidates.push(`id:${String(targetId).toLowerCase().trim()}`);
        candidates.push(String(targetId).toLowerCase().trim());
      }
      if (!targetId && targetName && targetName !== 'paciente') {
        candidates.push(`name:${targetName}`);
        candidates.push(targetName);
      }

      for (const k of candidates) {
        const candidate = k ? parsed[k] : null;
        if (candidate && candidate.items && Array.isArray(candidate.items)) {
          const savedName = (candidate.patientName || '').trim().toLowerCase();
          if (targetName && targetName !== 'paciente' && savedName && savedName !== 'paciente' && savedName !== targetName) {
            continue;
          }
          return candidate;
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const savePrescriptionToStorage = (patientKey: string, data: any, explicitPatientId?: string | null) => {
    try {
      const raw = localStorage.getItem('mecura_saved_prescriptions_v2');
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed['paciente_atual']) {
        delete parsed['paciente_atual'];
      }
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      const keysToSave = new Set<string>();
      if (patientKey) keysToSave.add(patientKey.toLowerCase().trim());
      const resolvedId = explicitPatientId !== undefined ? explicitPatientId : (standaloneTargetPatientId || currentPatient?.id);
      if (resolvedId) {
        keysToSave.add(`id:${String(resolvedId).toLowerCase().trim()}`);
        keysToSave.add(String(resolvedId).toLowerCase().trim());
      }
      if (data?.patientName && String(data.patientName).trim().toLowerCase() !== 'paciente') {
        const cleanName = String(data.patientName).trim().toLowerCase();
        keysToSave.add(`name:${cleanName}`);
        keysToSave.add(cleanName);
      }

      keysToSave.forEach(k => {
        if (k) parsed[k] = payload;
      });
      localStorage.setItem('mecura_saved_prescriptions_v2', JSON.stringify(parsed));
    } catch (e) {
      console.warn("Could not save prescription to localStorage:", e);
    }
  };

  const handleSavePrescription = async (savedData: {
    patientName: string;
    birthDate: string;
    cpf: string;
    emissionDate: string;
    doctorName: string;
    doctorCrm: string;
    doctorSpecialty: string;
    items: PrescriptionItemData[];
    notes: string;
  }) => {
    prescItemsRef.current = savedData.items;
    const key = getPatientReportKey(standaloneTargetPatientId || currentPatient?.id, savedData.patientName || prescPatientName);
    savePrescriptionToStorage(key, savedData);

    setPrescPatientName(savedData.patientName);
    setPrescBirthDate(savedData.birthDate);
    setPrescCpf(savedData.cpf);
    setPrescEmissionDate(savedData.emissionDate);
    setPrescDoctorName(savedData.doctorName);
    setPrescDoctorCrm(savedData.doctorCrm);
    setPrescDoctorSpecialty(savedData.doctorSpecialty);
    setPrescItems(savedData.items);
    setPrescNotes(savedData.notes);

    setCurrentPatient((prev: any) =>
      prev && (!standaloneTargetPatientId || prev.id === standaloneTargetPatientId)
        ? { ...prev, prescriptionData: savedData }
        : prev
    );

    const targetPatientId = standaloneTargetPatientId || currentPatient?.id || activeConsultationId;
    if (targetPatientId) {
      try {
        await setDoc(doc(db, 'queue', targetPatientId), {
          prescriptionData: savedData,
          lastUpdated: new Date().toISOString()
        }, { merge: true });

        await setDoc(doc(db, 'active_consultations', targetPatientId), {
          prescriptionData: savedData,
          lastPrescriptionUpdated: new Date().toISOString()
        }, { merge: true });

        // Update any existing receita_previa message in Firestore active_consultations
        const currentMsgs = useStore.getState().messages;
        const previaMsgs = currentMsgs.filter(m => m.type === 'receita_previa');
        for (const pm of previaMsgs) {
          if (pm.id) {
            await updateDoc(doc(db, 'active_consultations', targetPatientId, 'messages', pm.id), {
              'receitaPreviaData.items': savedData.items,
              'receitaPreviaData.notes': savedData.notes,
              'receitaPreviaData.doctorName': savedData.doctorName,
              'receitaPreviaData.doctorCrm': savedData.doctorCrm,
              'receitaPreviaData.doctorSpecialty': savedData.doctorSpecialty,
              'receitaPreviaData.patientName': savedData.patientName,
              'receitaPreviaData.emissionDate': savedData.emissionDate,
              'receitaPreviaData.updatedAt': new Date().toISOString()
            }).catch(console.warn);
          }
        }

        // Immediately update in-memory state so dashboard and patient chat reflects the latest changes
        useStore.setState(state => ({
          messages: state.messages.map(m => m.type === 'receita_previa' ? ({
            ...m,
            receitaPreviaData: {
              ...(m.receitaPreviaData || {}),
              status: (m.receitaPreviaData?.status || 'pending_confirmation'),
              items: savedData.items,
              notes: savedData.notes,
              doctorName: savedData.doctorName,
              doctorCrm: savedData.doctorCrm,
              doctorSpecialty: savedData.doctorSpecialty,
              patientName: savedData.patientName,
              emissionDate: savedData.emissionDate
            }
          } as any) : m)
        }));
      } catch (err) {
        console.warn("Could not sync prescription to Firestore:", err);
      }
    }

    showActionToast('Receita e posologias salvas com sucesso!');
  };

  // Prescription (Receita Médica) Editor & Preview States
  const [showPrescriptionEditorModal, setShowPrescriptionEditorModal] = useState(false);
  const [showDocMenu, setShowDocMenu] = useState(false);
  const [prescriptionTab, setPrescriptionTab] = useState<'edit' | 'preview'>('edit');
  const [prescPatientName, setPrescPatientName] = useState('');
  const [prescBirthDate, setPrescBirthDate] = useState('');
  const [prescCpf, setPrescCpf] = useState('');
  const [prescEmissionDate, setPrescEmissionDate] = useState('');
  const [prescDoctorName, setPrescDoctorName] = useState('Dr. Guilherme Taveira Dias');
  const [prescDoctorCrm, setPrescDoctorCrm] = useState('CRM/MT 17259');
  const [prescDoctorSpecialty, setPrescDoctorSpecialty] = useState('Clínico Geral • Medicina Canabinoide');
  const [prescItems, _setPrescItems] = useState<PrescriptionItemData[]>([]);
  const prescItemsRef = useRef<PrescriptionItemData[]>([]);
  const setPrescItems = (val: PrescriptionItemData[] | ((prev: PrescriptionItemData[]) => PrescriptionItemData[])) => {
    const next = typeof val === 'function' ? val(prescItemsRef.current) : val;
    prescItemsRef.current = next;
    _setPrescItems(next);
  };
  useEffect(() => {
    prescItemsRef.current = prescItems;
  }, [prescItems]);
  const [prescNotes, setPrescNotes] = useState('');
  const [showProgrammedPrescriptionModal, setShowProgrammedPrescriptionModal] = useState(false);
  const [programmedTargetPatient, setProgrammedTargetPatient] = useState<any>(null);

  const handleOpenProgrammedForPatient = (patient: any) => {
    setProgrammedTargetPatient(patient);
    setShowProgrammedPrescriptionModal(true);
  };

  const handleQuickApplyCondition = (
    conditionTag: 'ansiedade' | 'insonia' | 'depressao' | 'combinado' | 'dor',
    targetPatientOverride?: any,
    originPreference?: 'nacional' | 'importado'
  ) => {
    const targetPatient = targetPatientOverride || currentPatient;
    const allProfiles = getProgrammedProfiles();
    let matched: ProgrammedPrescriptionProfile | undefined;
    if (originPreference === 'importado') {
      matched = allProfiles.find(p => p.conditionTag === conditionTag && (p.category === 'importado' || /importad|pangaia|flowermed|eua/i.test(`${p.name} ${p.badge}`)));
    } else if (originPreference === 'nacional') {
      matched = allProfiles.find(p => p.conditionTag === conditionTag && (p.category === 'nacional' || /nacional|associação|abrace|abec/i.test(`${p.name} ${p.badge}`)));
    }
    if (!matched) {
      matched = allProfiles.find(p => p.conditionTag === conditionTag) || allProfiles[0];
    }
    if (matched) {
      handleApplyProgrammedFromDashboard(matched, 'replace', targetPatient);
    }
  };

  const handleApplyProgrammedFromDashboard = (
    profile: ProgrammedPrescriptionProfile, 
    mode: 'replace' | 'append',
    targetPatientOverride?: any
  ) => {
    const targetPatient = targetPatientOverride || programmedTargetPatient || currentPatient;
    if (targetPatient?.id) {
      setStandaloneTargetPatientId(targetPatient.id);
    }
    const patientAnswers = targetPatient?.answers || answers;
    const pName = targetPatient?.patientName || targetPatient?.name || prescPatientName || userName || 'Paciente';
    const pBirth = targetPatient?.birthDate || patientAnswers?.birthDate || prescBirthDate || 'Não informada';
    const pCpf = targetPatient?.cpf || patientAnswers?.cpf || prescCpf || 'Não informado';

    setPrescPatientName(pName);
    setPrescBirthDate(pBirth);
    setPrescCpf(pCpf);

    let nextItems: PrescriptionItemData[];
    if (mode === 'replace') {
      nextItems = [...profile.items];
    } else {
      nextItems = [...prescItems, ...profile.items];
    }
    setPrescItems(nextItems);

    let nextNotes = prescNotes;
    if (profile.defaultNotes) {
      if (mode === 'replace' || !prescNotes.trim()) {
        nextNotes = profile.defaultNotes;
      } else {
        nextNotes = prescNotes + '\n\n' + profile.defaultNotes;
      }
    }
    setPrescNotes(nextNotes);

    setShowProgrammedPrescriptionModal(false);
    showActionToast(`✓ Protocolo "${profile.name}" carregado para ${pName} (${nextItems.length} medicamentos)!`);
    handleOpenPrescriptionEditor(targetPatient, nextItems, nextNotes);
  };

  const handleDirectEmitProgrammedPDF = async (
    profile: ProgrammedPrescriptionProfile,
    targetPatientOverride?: any
  ) => {
    try {
      const targetPatient = targetPatientOverride || programmedTargetPatient || currentPatient;
      const patientAnswers = targetPatient?.answers || answers;
      const pName = targetPatient?.patientName || targetPatient?.name || prescPatientName || userName || 'Paciente';
      const pBirth = targetPatient?.birthDate || patientAnswers?.birthDate || prescBirthDate || 'Não informada';
      const pCpf = targetPatient?.cpf || patientAnswers?.cpf || prescCpf || 'Não informado';
      const pId = targetPatient?.id || standaloneTargetPatientId || activeConsultationId;

      showActionToast(`Gerando e emitindo receita de ${pName}...`);

      const emissionDate = format(new Date(), 'dd/MM/yyyy');
      const docData = {
        patientName: pName,
        birthDate: pBirth,
        cpf: pCpf,
        emissionDate,
        doctorName: prescDoctorName || 'Dr. Guilherme Taveira Dias',
        doctorCrm: prescDoctorCrm || 'CRM/MT 17259',
        doctorSpecialty: prescDoctorSpecialty || 'Especialista em Medicina Canabinoide',
        items: profile.items,
        notes: profile.defaultNotes || prescNotes || '- Uso contínuo sob orientação médica.'
      };

      const key = getPatientReportKey(pId, pName);
      savePrescriptionToStorage(key, docData);

      if (pId) {
        await setDoc(doc(db, 'queue', pId), {
          prescriptionData: docData,
          lastUpdated: new Date().toISOString()
        }, { merge: true }).catch(() => {});

        await setDoc(doc(db, 'active_consultations', pId), {
          prescriptionData: docData,
          lastPrescriptionUpdated: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }

      await generatePrescriptionPDF(pName, messages, {
        customPatientName: pName,
        birthDate: pBirth,
        cpf: pCpf,
        emissionDate,
        customDoctorName: docData.doctorName,
        customDoctorCrm: docData.doctorCrm,
        customDoctorSpecialty: docData.doctorSpecialty,
        customItems: docData.items,
        customNotes: docData.notes
      });

      if (pId && (currentPatient?.id === pId || activeConsultationId === pId)) {
        await addMessage({
          text: `📋 Receita Médica Digital Oficial emitida para ${pName} (${profile.name}). O documento em PDF assinado com QR Code e certificação digital está pronto para download.`,
          sender: 'doctor',
          type: 'prescription',
          attachment: {
            title: `Receita Médica Digital - ${profile.name}`,
            name: `Receita_Digital_${pName.replace(/\s+/g, '_')}.pdf`,
            url: '#',
            type: 'application/pdf',
            docType: 'receita'
          }
        }, pId);
      }

      setShowProgrammedPrescriptionModal(false);
      showActionToast(`✓ Receita de ${pName} para "${profile.name}" emitida com sucesso!`);
    } catch (err: any) {
      console.error("Erro ao emitir receita:", err);
      showActionToast(`Erro ao emitir receita: ${err?.message || 'Tente novamente'}`);
    }
  };

  // Sync active prescription items when any Bula is updated or customized anywhere
  useEffect(() => {
    const handleBulaUpdate = (e?: any) => {
      const detail = e?.detail;
      if (detail?.updated) {
        const updated = detail.updated;
        const targetOld = (detail.oldName || '').trim().toLowerCase();
        const targetNew = (updated.name || '').trim().toLowerCase();

        setPrescItems(prevItems => {
          let hasChanges = false;
          const next = prevItems.map(item => {
            const itemClean = (item.name || '').trim().toLowerCase();
            if (itemClean === targetOld || itemClean === targetNew) {
              hasChanges = true;
              const dosageArr = updated.posologyDetails 
                ? updated.posologyDetails.split('\n').map((l: string) => l.trim()).filter(Boolean)
                : item.dosage;
              return {
                ...item,
                name: updated.name || item.name,
                brand: updated.manufacturer || item.brand,
                origin: updated.origin || item.origin,
                type: updated.type || item.type,
                concentration: updated.concentration || item.concentration,
                activeIngredients: updated.activeIngredients || item.activeIngredients,
                pharmaceuticalForm: updated.pharmaceuticalForm || item.pharmaceuticalForm,
                quantity: updated.quantity || item.quantity,
                administrationRoute: updated.administrationRoute || item.administrationRoute,
                dosage: dosageArr && dosageArr.length > 0 ? dosageArr : item.dosage,
                description: updated.description || item.description,
                priceBRL: updated.priceBRL !== undefined ? Number(String(updated.priceBRL).replace(/[^0-9.]/g, '')) : item.priceBRL,
                priceUSD: updated.priceUSD !== undefined ? Number(String(updated.priceUSD).replace(/[^0-9.]/g, '')) : item.priceUSD
              };
            }
            return item;
          });
          if (hasChanges) {
            handleSavePrescription({
              patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
              birthDate: prescBirthDate,
              cpf: prescCpf,
              emissionDate: prescEmissionDate,
              doctorName: prescDoctorName,
              doctorCrm: prescDoctorCrm,
              doctorSpecialty: prescDoctorSpecialty,
              items: next,
              notes: prescNotes
            });
          }
          return next;
        });
      }
    };
    window.addEventListener('mecura_bula_updated', handleBulaUpdate);
    window.addEventListener('storage', handleBulaUpdate);
    return () => {
      window.removeEventListener('mecura_bula_updated', handleBulaUpdate);
      window.removeEventListener('storage', handleBulaUpdate);
    };
  }, [prescPatientName, currentPatient, userName, prescBirthDate, prescCpf, prescEmissionDate, prescDoctorName, prescDoctorCrm, prescDoctorSpecialty, prescNotes]);

  // Standalone Document Generation Modal State (Receitas e Laudos Avulsos)
  const [isStandaloneDocModalOpen, setIsStandaloneDocModalOpen] = useState(false);
  const [standaloneTargetPatientId, setStandaloneTargetPatientId] = useState<string | null>(null);

  // Modal de Senha para Alternar para Área do Psicólogo
  const [isPsychologistAuthModalOpen, setIsPsychologistAuthModalOpen] = useState(false);

  const handleLaunchStandalonePrescription = (patientData: StandalonePatientData, prefillItems?: PrescriptionItemData[]) => {
    setStandaloneTargetPatientId(patientData.id || null);
    const patientKey = getPatientReportKey(patientData.id, patientData.name);
    const saved = loadSavedPrescription(patientKey);

    setPrescPatientName(saved?.patientName || patientData.name);
    setPrescCpf(saved?.cpf || patientData.cpf);
    setPrescBirthDate(saved?.birthDate || patientData.birthDate);
    setPrescEmissionDate(saved?.emissionDate || patientData.emissionDate);
    setPrescDoctorName(saved?.doctorName || patientData.doctorName || 'Dr. Guilherme Taveira Dias');
    setPrescDoctorCrm(saved?.doctorCrm || patientData.doctorCrm || 'CRM/MT 17259');
    setPrescDoctorSpecialty(saved?.doctorSpecialty || patientData.doctorSpecialty || 'Especialista em Medicina Canabinoide');

    if (saved?.items && saved.items.length > 0) {
      setPrescItems(saved.items);
      setPrescNotes(saved.notes || '');
    } else if (prefillItems && prefillItems.length > 0) {
      setPrescItems(prefillItems);
    }

    setShowPrescriptionEditorModal(true);
  };

  const handleLaunchStandaloneMedicalReport = (patientData: StandalonePatientData, reportType: 'inicial' | 'evolutivo') => {
    setStandaloneTargetPatientId(patientData.id || null);
    const patientKey = getPatientReportKey(patientData.id, patientData.name);
    const saved = loadSavedReport(patientKey, reportType);

    setReportPatientName(saved?.patientName || patientData.name);
    setReportCpf(saved?.cpf || patientData.cpf);
    setReportBirthDate(saved?.birthDate || patientData.birthDate);
    setReportEmissionDate(saved?.emissionDate || patientData.emissionDate);
    setReportDoctorName(saved?.doctorName || patientData.doctorName || 'Dr. Guilherme Taveira Dias');
    setReportDoctorCrm(saved?.doctorCrm || patientData.doctorCrm || 'CRM/MT 17259');
    setReportDoctorSpecialty(saved?.doctorSpecialty || patientData.doctorSpecialty || 'Especialista em Medicina Canabinoide');
    setMedicalReportType(reportType);

    if (saved?.diagnosis) {
      setReportDiagnosis(saved.diagnosis);
    } else if (patientData.diagnosis) {
      setReportDiagnosis(patientData.diagnosis);
    } else {
      setReportDiagnosis("Quadro clínico crônico com indicação precisa de terapia fitocanabinoide individualizada para modulação homeostática.");
    }

    // Capture candidates from patientData.prescribedItems or current prescItems
    const candidateItems = (patientData.prescribedItems && patientData.prescribedItems.length > 0)
      ? patientData.prescribedItems
      : (prescItems && prescItems.length > 0 ? prescItems : []);

    let calculatedTreatmentPlan = "";
    if (candidateItems.length > 0) {
      calculatedTreatmentPlan = candidateItems.map((item, idx) => {
        const ing = item.activeIngredients ? `\n   Princípio Ativo: ${item.activeIngredients}` : '';
        const form = item.pharmaceuticalForm ? `\n   Apresentação / Via: ${item.pharmaceuticalForm} • ${item.quantity || '01 frasco'} • ${item.administrationRoute || 'Via Sublingual'}` : '';
        const isGummy = /goma|gumm|comest[íi]vel/i.test(item.name || item.pharmaceuticalForm || '');
        const isFlower = /flor|in natura/i.test(item.name || item.pharmaceuticalForm || '');
        const isSyringeOrMl = /seringa|marcação de ml|via oral sublingual 0|em ml/i.test(`${item.pharmaceuticalForm || ''} ${item.name} ${item.administrationRoute || ''} ${(item.dosage || []).join(' ')}`);
        const posologyHeader = item.posologyHeader !== undefined
          ? (item.posologyHeader.trim() ? item.posologyHeader.replace(/[:.]+$/, '').trim() : 'Posologia')
          : ((isGummy || isFlower || isSyringeOrMl) ? 'Posologia' : 'Posologia (Aproximadamente 25 gotas por mL)');
        const cleanDosage = item.dosage.filter(d => {
          const t = d.trim();
          return t && (!posologyHeader.includes('25 gotas') || !/^Aproximadamente 25 gotas por mL\.?$/i.test(t)) && !/^Posologia e Modo de Uso:\s*Aproximadamente 25 gotas por mL\.?$/i.test(t);
        });
        const doseStr = (cleanDosage.length > 0 ? cleanDosage : item.dosage).join(' | ');
        return `${idx + 1}. ${item.name} (${item.brand} - ${item.origin})${ing}${form}\n   ${posologyHeader}: ${doseStr}\n   Finalidade: ${item.description || 'Modulação fitocanabinoide contínua.'}`;
      }).join('\n\n');
    }

    if (saved?.rationale) {
      setReportRationale(saved.rationale);
    } else if (reportType === 'evolutivo') {
      setReportRationale("Em reavaliação clínica e evolução do tratamento com derivados de Cannabis sativa L., o(a) paciente relata melhora sustentada dos sintomas primários, com redução relevante em escalas de dor, estabilização dos ciclos de sono e atenuação dos níveis de estresse e ansiedade.");
    } else {
      setReportRationale("Indicação fundamentada na fisiopatologia e modulação do Sistema Endocanabinoide (SEC). Fitocanabinoides de espectro integral atuam sobre receptores CB1 e CB2 promovendo analgesia, regulação do humor e modulação inflamatória sem tolerância abrupta.");
    }

    if (saved?.treatmentPlan) {
      setReportTreatmentPlan(saved.treatmentPlan);
    } else if (reportType === 'evolutivo') {
      setReportTreatmentPlan(calculatedTreatmentPlan || "Manutenção e ajuste fino da terapia canabinoide associativa. Continuidade do uso de formulações em espectro integral (Full Spectrum) com titulação individualizada conforme tolerância clínica.");
    } else {
      setReportTreatmentPlan(calculatedTreatmentPlan || "Início de terapia canabinoide individualizada em formulação integral (Full Spectrum), associando via sublingual contínua sob titulação progressiva e acompanhamento médico periódico.");
    }

    if (saved?.monitoring) {
      setReportMonitoring(saved.monitoring);
    } else if (reportType === 'evolutivo') {
      setReportMonitoring("Acompanhamento médico continuado a cada 60 a 90 dias para reavaliação de dosagens basais e exames de rotina.");
    } else {
      setReportMonitoring("Retorno ambulatorial agendado em 30 a 45 dias para avaliação de tolerabilidade, ajuste de posologia e monitoramento de segurança clínica.");
    }

    setShowMedicalReportEditorModal(true);
  };

  const handleLaunchStandalonePsychomotorReport = (patientData: StandalonePatientData) => {
    setStandaloneTargetPatientId(patientData.id || null);
    const patientKey = getPatientReportKey(patientData.id, patientData.name);
    const saved = loadSavedReport(patientKey, 'psicomotor');

    setReportPatientName(patientData.name);
    setReportCpf(patientData.cpf);
    setReportBirthDate(patientData.birthDate);
    setReportEmissionDate(patientData.emissionDate);
    setReportDoctorName(patientData.doctorName || 'Dr. Guilherme Taveira Dias');
    setReportDoctorCrm(patientData.doctorCrm || 'CRM/MT 17259');
    setReportDoctorSpecialty(patientData.doctorSpecialty || 'Especialista em Medicina Canabinoide');

    if (saved?.text) {
      setPsychomotorReportText(saved.text);
    } else {
      const personalized = generatePersonalizedClinicalReport({
        patientName: patientData.name,
        birthDate: patientData.birthDate,
        cpf: patientData.cpf,
        objectives: ['Ansiedade', 'Estresse crônico', 'Dores']
      }, 'evolutivo');
      setPsychomotorReportText(personalized.psychomotor.text);
    }
    setShowPsychomotorReportEditorModal(true);
  };

  const handleLaunchStandaloneAgronomicReport = (patientData: StandalonePatientData) => {
    setStandaloneTargetPatientId(patientData.id || null);
    const qPatient = patientData.id
      ? (queue.find(p => p.id === patientData.id) || consultationHistory.find(h => h.id === patientData.id))
      : null;
    const patientAnswers = {
      ...(qPatient?.answers || {}),
      ...(currentPatient && currentPatient.id === patientData.id ? (currentPatient.answers || {}) : {})
    };
    const pName = (patientData.name || qPatient?.patientName || 'Paciente').trim();
    const pCpf = patientData.cpf || qPatient?.cpf || patientAnswers?.cpf || 'Não informado';
    const pBirth = patientData.birthDate || qPatient?.birthDate || patientAnswers?.birthDate || 'Não informada';

    const objectivesArray = (Array.isArray(patientAnswers?.objectives) && patientAnswers.objectives.length > 0)
      ? patientAnswers.objectives
      : (patientData.diagnosis ? [patientData.diagnosis] : []);

    const personalized = generatePersonalizedClinicalReport({
      patientName: pName,
      birthDate: pBirth,
      cpf: pCpf,
      sex: patientAnswers?.sex,
      height: patientAnswers?.height,
      weight: patientAnswers?.weight,
      objectives: objectivesArray,
      intensity: patientAnswers?.intensity,
      duration: patientAnswers?.duration,
      description: patientAnswers?.description,
      diseaseOrigin: patientAnswers?.diseaseOrigin,
      remedios: patientAnswers?.remedios,
      remedios_details: patientAnswers?.remedios_details,
      doenca_cronica: patientAnswers?.doenca_cronica,
      doenca_cronica_details: patientAnswers?.doenca_cronica_details,
      tratamento_atual: patientAnswers?.tratamento_atual,
      tratamento_atual_details: patientAnswers?.tratamento_atual_details,
      cirurgia: patientAnswers?.cirurgia,
      cirurgia_details: patientAnswers?.cirurgia_details,
      alergia: patientAnswers?.alergia,
      alergia_details: patientAnswers?.alergia_details,
      digestivo: patientAnswers?.digestivo,
      digestivo_details: patientAnswers?.digestivo_details,
      dor_cabeca: patientAnswers?.dor_cabeca,
      dor_cabeca_details: patientAnswers?.dor_cabeca_details,
      cansado: patientAnswers?.cansado,
      cannabis: patientAnswers?.cannabis,
      cannabis_details: patientAnswers?.cannabis_details,
      arritmia: patientAnswers?.arritmia,
      arritmia_details: patientAnswers?.arritmia_details,
      tristeza: patientAnswers?.tristeza,
      foco: patientAnswers?.foco,
      memoria: patientAnswers?.memoria,
      irritado: patientAnswers?.irritado,
      estresse: patientAnswers?.estresse,
      panico: patientAnswers?.panico,
      panico_details: patientAnswers?.panico_details,
      ansiedade_diag: patientAnswers?.ansiedade_diag,
      ansiedade_diag_details: patientAnswers?.ansiedade_diag_details,
      adhdTestResult: patientAnswers?.adhdTestResult,
      autismTestResult: patientAnswers?.autismTestResult,
      hcPlantCalculator: patientAnswers?.hcPlantCalculator,
      mainSymptoms: patientAnswers?.mainSymptoms,
      pathology: patientData.diagnosis || patientAnswers?.pathology,
      answers: patientAnswers
    }, 'inicial');

    const patientKey = getPatientReportKey(patientData.id, pName);
    const rawSaved = loadSavedReport(patientKey, 'agronomico', pName, patientData.id);
    let validSaved = rawSaved;
    if (rawSaved?.agronomicText && pName && pName.toLowerCase() !== 'paciente' && !rawSaved.agronomicText.toLowerCase().includes(pName.toLowerCase())) {
      validSaved = null;
    }

    const hcCalc = patientAnswers?.hcPlantCalculator;
    setAgronomicPatientName(validSaved?.patientName || pName);
    setAgronomicCpf(validSaved?.cpf || pCpf);
    setAgronomicEmissionDate(validSaved?.emissionDate || patientData.emissionDate || new Date().toLocaleDateString('pt-BR'));
    setAgronomicName(validSaved?.agronomistName || 'Wilian Dalenogare Pereira');
    setAgronomicCrea(validSaved?.agronomistCrea || 'CREA-PR 172.458/D');
    setAgronomicDiagnosis(validSaved?.diagnosis || patientData.diagnosis || personalized.agronomic.diagnosis);
    setAgronomicDailyDoseMg(validSaved?.dailyDoseMg || (hcCalc?.dailyDoseMg ? Number(hcCalc.dailyDoseMg) : personalized.agronomic.dailyDoseMg));
    setAgronomicTargetPlants(validSaved?.targetPlants || (hcCalc?.annualPlants ? Number(hcCalc.annualPlants) : personalized.agronomic.targetPlants));
    setAgronomicText(validSaved?.agronomicText || personalized.agronomic.text);
    setShowAgronomicReportEditorModal(true);
  };

  const handleToggleProductInPrescription = (product: CBDProduct) => {
    const isNational = (product.origin || '').toLowerCase().includes('nacional') || (product.manufacturer || '').toLowerCase().includes('associação');
    const customBula = getCustomBulaData(product);
    const enriched = enrichMedicationDetails(
      customBula?.name || product.name,
      customBula?.manufacturer || product.manufacturer,
      customBula?.origin || (isNational ? 'Nacional' : (product.origin || 'Importado')),
      customBula?.type || product.type,
      product
    );

    const targetName = (customBula?.name || product.name).trim();
    const cleanName = targetName.toLowerCase();
    const exists = prescItems.some(p => p.name.toLowerCase().trim() === cleanName || p.name.toLowerCase().trim() === product.name.toLowerCase().trim());
    if (exists) {
      const updated = prescItems.filter(p => p.name.toLowerCase().trim() !== cleanName && p.name.toLowerCase().trim() !== product.name.toLowerCase().trim());
      setPrescItems(updated);
      handleSavePrescription({
        patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
        birthDate: prescBirthDate,
        cpf: prescCpf,
        emissionDate: prescEmissionDate,
        doctorName: prescDoctorName,
        doctorCrm: prescDoctorCrm,
        doctorSpecialty: prescDoctorSpecialty,
        items: updated,
        notes: prescNotes
      });
      showActionToast(`✓ "${targetName}" removido da receita e alteração salva.`);
    } else {
      const customDosage = (customBula?.posologyDetails || product.usageInstructions || enriched.usageInstructions || '').trim();
      const dosageLines = customDosage
        ? customDosage.split('\n').map((s: string) => s.trim()).filter(Boolean)
        : [
            'Aproximadamente 25 gotas por mL.',
            'Tomar 03 a 05 gotas sublinguais de 12/12 horas.',
            'Aumentar 01 gota a cada 05 dias conforme resposta clínica.'
          ];

      const newItem: PrescriptionItemData = {
        name: targetName,
        brand: customBula?.manufacturer || product.manufacturer || enriched.brand,
        origin: customBula?.origin || (isNational ? 'Nacional' : (product.origin || 'Importado')),
        type: customBula?.type || product.type || enriched.type,
        concentration: customBula?.concentration || customBula?.activeIngredients || product.concentration || enriched.concentration || '',
        activeIngredients: customBula?.activeIngredients || enriched.activeIngredients || product.concentration || '',
        pharmaceuticalForm: customBula?.pharmaceuticalForm || enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
        quantity: customBula?.quantity || enriched.quantity || '01 Frasco de 30 mL',
        administrationRoute: customBula?.administrationRoute || enriched.administrationRoute || 'Via Sublingual / Oral',
        dosage: dosageLines,
        description: customBula?.description || product.description || enriched.description || '',
        details: product.details || [enriched.activeIngredients],
        priceUSD: customBula?.priceUSD !== undefined ? customBula.priceUSD : (isNational ? undefined : product.priceUSD),
        priceBRL: customBula?.priceBRL !== undefined ? customBula.priceBRL : (isNational ? undefined : product.priceBRL)
      };

      const updated = [...prescItems, newItem];
      setPrescItems(updated);
      handleSavePrescription({
        patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
        birthDate: prescBirthDate,
        cpf: prescCpf,
        emissionDate: prescEmissionDate,
        doctorName: prescDoctorName,
        doctorCrm: prescDoctorCrm,
        doctorSpecialty: prescDoctorSpecialty,
        items: updated,
        notes: prescNotes
      });
      showActionToast(`✓ "${product.name}" adicionado à receita e salvo! (${updated.length} itens)`);
    }
  };

  const handleRemovePrescItemAndSave = (productName: string) => {
    const clean = productName.toLowerCase().trim();
    const updated = prescItems.filter(p => p.name.toLowerCase().trim() !== clean);
    setPrescItems(updated);

    handleSavePrescription({
      patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
      birthDate: prescBirthDate,
      cpf: prescCpf,
      emissionDate: prescEmissionDate,
      doctorName: prescDoctorName,
      doctorCrm: prescDoctorCrm,
      doctorSpecialty: prescDoctorSpecialty,
      items: updated,
      notes: prescNotes
    });
    showActionToast(`✓ "${productName}" excluído da receita e alteração salva.`);
  };

  const handleAddCustomProductInDashboard = () => {
    if (!newDashProdName.trim()) {
      showActionToast("Por favor, digite o nome do medicamento.");
      return;
    }
    const cleanName = newDashProdName.trim();
    const isNational = newDashProdOrigin === 'Nacional';
    const enriched = enrichMedicationDetails(
      cleanName,
      newDashProdBrand.trim() || 'Associação Brasileira (Nacional)',
      newDashProdOrigin,
      newDashProdForm
    );

    const dosageLines = newDashProdDosage.trim()
      ? newDashProdDosage.split('\n').map(s => s.trim()).filter(Boolean)
      : ['Tomar 05 gotas sublinguais de 12/12 horas. Reter sob a língua por 60 segundos antes de deglutir.'];

    const newItem: PrescriptionItemData = {
      name: cleanName,
      brand: newDashProdBrand.trim() || enriched.brand || 'Associação Brasileira (Nacional)',
      origin: newDashProdOrigin,
      type: newDashProdForm || enriched.type || 'Óleo / Extrato',
      activeIngredients: enriched.activeIngredients || cleanName,
      concentration: newDashProdConcentration.trim() || enriched.concentration || '',
      pharmaceuticalForm: newDashProdForm || enriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
      quantity: newDashProdQuantity.trim() || enriched.quantity || '01 Frasco de 30 mL',
      administrationRoute: newDashProdForm.toLowerCase().includes('pomada')
        ? 'Via Tópica'
        : (newDashProdForm.toLowerCase().includes('goma') ? 'Via Oral' : 'Via Sublingual / Oral'),
      dosage: dosageLines,
      description: `Medicamento prescrito e cadastrado pelo médico: ${cleanName}`
    };

    const updated = [...prescItems, newItem];
    setPrescItems(updated);

    handleSavePrescription({
      patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
      birthDate: prescBirthDate,
      cpf: prescCpf,
      emissionDate: prescEmissionDate,
      doctorName: prescDoctorName,
      doctorCrm: prescDoctorCrm,
      doctorSpecialty: prescDoctorSpecialty,
      items: updated,
      notes: prescNotes
    });

    if (saveDashToCatalog && addProduct) {
      try {
        const catId = getBestCategoryIdForProduct(newDashProdOrigin, newDashProdBrand);
        const prodData: CBDProduct = {
          name: cleanName,
          manufacturer: newDashProdBrand.trim() || 'Associação Brasileira',
          type: newDashProdForm || 'Óleo',
          concentration: newDashProdConcentration.trim() || '',
          origin: newDashProdOrigin,
          pharmaceuticalForm: newItem.pharmaceuticalForm,
          quantity: newItem.quantity,
          administrationRoute: newItem.administrationRoute,
          usageInstructions: dosageLines.join('\n'),
          posologyDetails: dosageLines.join('\n'),
          description: `Medicamento canabinoide cadastrado pelo médico: ${cleanName}`
        };
        addProduct(catId, prodData);

        // Also save initial custom bula override so enrichMedicationDetails immediately has the exact specs
        try {
          const key = `mecura_bula_custom_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          localStorage.setItem(key, JSON.stringify({
            name: cleanName,
            manufacturer: prodData.manufacturer,
            origin: prodData.origin,
            type: prodData.type,
            concentration: prodData.concentration,
            pharmaceuticalForm: prodData.pharmaceuticalForm,
            quantity: prodData.quantity,
            administrationRoute: prodData.administrationRoute,
            posologyDetails: prodData.posologyDetails,
            usageInstructions: prodData.usageInstructions,
            description: prodData.description
          }));
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn("Could not save to admin catalog:", err);
      }
    }

    // Set search term to new product name and reset search filters so it immediately appears at top of catalog search filter!
    setProductSearchTerm(cleanName);
    setProductBrandFilter('all');
    setProductDiseaseFilter('all');
    setProductOriginFilter('all');
    setProductDiseaseSearchInput('');

    // Reset fields
    setNewDashProdName('');
    setNewDashProdConcentration('');
    setShowNewProductModalInDashboard(false);

    showActionToast(`✓ "${cleanName}" cadastrado na biblioteca e salvo na receita!`);
  };

  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const greetedPatientsRef = useRef<Set<string>>(new Set());

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
    const unsubscribeHistory = subscribeToAllConsultationHistory();
    return () => {
      unsubscribeQueue();
      unsubscribeAppointments();
      unsubscribeHistory();
      // Clean up active consultation ID and messages so they never leak into patient screens
      useStore.setState({ activeConsultationId: null, messages: [] });
    };
  }, [subscribeToQueue, subscribeToAppointments, subscribeToAllConsultationHistory]);

  useEffect(() => {
    console.log("Current patient changed:", currentPatient);
    if (currentPatient?.id) {
      console.log("Subscribing to messages for:", currentPatient.id);
      const unsubscribeMessages = subscribeToMessages(currentPatient.id);
      
      // Mark as read when opening
      if (currentPatient.hasUnread) {
        updateDoc(doc(db, 'queue', currentPatient.id), { hasUnread: false }).catch(console.error);
      }

      // Reset previous patient's report and prescription states so nothing ever leaks between patients
      const pName = currentPatient.patientName || (currentPatient as any).name || 'Paciente';
      const pBirth = currentPatient.birthDate || currentPatient.answers?.birthDate || '';
      const pCpf = currentPatient.cpf || currentPatient.answers?.cpf || '';
      setStandaloneTargetPatientId(null);
      setEvolutionNotes('');
      setAddedMedications([]);
      setReportPatientName(pName);
      setReportBirthDate(pBirth);
      setReportCpf(pCpf);
      setReportDiagnosis('');
      setReportRationale('');
      setReportTreatmentPlan('');
      setReportMonitoring('');
      setPsychomotorReportText('');
      setAgronomicPatientName(pName);
      setAgronomicCpf(pCpf);
      setAgronomicDiagnosis('');
      setAgronomicText('');

      // Automatically load and synchronize THIS patient's saved prescription (or clear if none)
      const patientKey = getPatientReportKey(currentPatient.id, pName);
      const saved = loadSavedPrescription(patientKey, pName, currentPatient.id) || currentPatient.prescriptionData;
      if (saved && saved.items && Array.isArray(saved.items) && saved.items.length > 0) {
        setPrescPatientName(saved.patientName || pName);
        setPrescBirthDate(saved.birthDate || pBirth);
        setPrescCpf(saved.cpf || pCpf);
        setPrescEmissionDate(saved.emissionDate || format(new Date(), 'dd/MM/yyyy'));
        setPrescDoctorName(saved.doctorName || 'Dr. Guilherme Taveira Dias');
        setPrescDoctorCrm(saved.doctorCrm || 'CRM/MT 17259');
        setPrescDoctorSpecialty(saved.doctorSpecialty || 'Especialista em Medicina Canabinoide');
        setPrescItems(saved.items);
        setPrescNotes(saved.notes || '');
      } else {
        // Clear previous patient's items immediately before checking remote doc
        setPrescPatientName(pName);
        setPrescBirthDate(pBirth);
        setPrescCpf(pCpf);
        setPrescEmissionDate(format(new Date(), 'dd/MM/yyyy'));
        setPrescItems([]);
        setPrescNotes('');

        // Query active_consultations doc to see if prescription was stored remotely for this patient
        getDoc(doc(db, 'active_consultations', currentPatient.id)).then(snap => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.prescriptionData && data.prescriptionData.items?.length > 0) {
              const sp = data.prescriptionData;
              setPrescPatientName(sp.patientName || pName);
              setPrescBirthDate(sp.birthDate || pBirth);
              setPrescCpf(sp.cpf || pCpf);
              setPrescEmissionDate(sp.emissionDate || format(new Date(), 'dd/MM/yyyy'));
              setPrescDoctorName(sp.doctorName || 'Dr. Guilherme Taveira Dias');
              setPrescDoctorCrm(sp.doctorCrm || 'CRM/MT 17259');
              setPrescDoctorSpecialty(sp.doctorSpecialty || 'Especialista em Medicina Canabinoide');
              setPrescItems(sp.items);
              setPrescNotes(sp.notes || '');
              savePrescriptionToStorage(patientKey, sp, currentPatient.id);
            }
          }
        }).catch(console.warn);
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
    // Fetch answers and real profile data from users, queue, and active_consultations collections
    try {
      const [userDoc, qSnap, cSnap] = await Promise.all([
        getDoc(doc(db, 'users', patient.id)).catch(() => null),
        getDoc(doc(db, 'queue', patient.id)).catch(() => null),
        getDoc(doc(db, 'active_consultations', patient.id)).catch(() => null)
      ]);
      const userData = userDoc && userDoc.exists() ? userDoc.data() : null;
      const qd = qSnap && qSnap.exists() ? qSnap.data() : null;
      const cd = cSnap && cSnap.exists() ? cSnap.data() : null;
      const validPlans = ['basic', 'premium', 'complete', 'psychologist'];
      const resolvedPlan = (
        (qd?.plan && validPlans.includes(qd.plan) ? qd.plan : null) ||
        (qd?.selectedOffer && validPlans.includes(qd.selectedOffer) ? qd.selectedOffer : null) ||
        (userData?.plan && validPlans.includes(userData.plan) ? userData.plan : null) ||
        (userData?.selectedOffer && validPlans.includes(userData.selectedOffer) ? userData.selectedOffer : null) ||
        (patient.plan && validPlans.includes(patient.plan) ? patient.plan : null) ||
        ((patient as any).selectedOffer && validPlans.includes((patient as any).selectedOffer) ? (patient as any).selectedOffer : null) ||
        ((qd?.isPremium === true || qd?.pagamento_premium === true || userData?.pagamento_premium === true || userData?.isPremium === true) ? 'premium' : 'basic')
      ) as 'basic' | 'premium' | 'complete' | 'psychologist';
      const resolvedIsPremium = resolvedPlan === 'premium' || resolvedPlan === 'complete';
      enrichedPatient.plan = resolvedPlan;
      (enrichedPatient as any).selectedOffer = resolvedPlan;
      (enrichedPatient as any).tier = resolvedPlan;
      enrichedPatient.isPremium = resolvedIsPremium;
      (enrichedPatient as any).pagamento_premium = resolvedIsPremium;

      // Deep-merge all triage answers and individual tests from user profile, queue, active_consultations, and local queue entry
      // so partial queue answers never overwrite the complete onboarding triage or individual test results
      const allSources = [cd?.answers, qd?.answers, userData?.answers, patient.answers].filter(
        (s): s is Record<string, any> => !!s && typeof s === 'object'
      );
      const mergedObjectives = Array.from(
        new Set(
          allSources.flatMap((s) =>
            Array.isArray(s.objectives)
              ? s.objectives.filter(Boolean)
              : s.objective
              ? [String(s.objective)]
              : []
          )
        )
      );
      const mergedBrands = Array.from(
        new Set(
          allSources.flatMap((s) =>
            Array.isArray(s.preferredBrands) ? s.preferredBrands.filter(Boolean) : []
          )
        )
      );
      const mergedDescLines: string[] = [];
      allSources.forEach((s) => {
        if (s.description && typeof s.description === 'string') {
          s.description
            .split('\n')
            .map((l: string) => l.trim())
            .filter(Boolean)
            .forEach((line: string) => {
              if (!mergedDescLines.includes(line)) mergedDescLines.push(line);
            });
        }
      });

      const mergedAnswers: Record<string, any> = {
        ...(cd?.answers || {}),
        ...(qd?.answers || {}),
        ...(userData?.answers || {}),
        ...(patient.answers || {}),
        ...(mergedObjectives.length > 0 ? { objectives: mergedObjectives } : {}),
        ...(mergedBrands.length > 0 ? { preferredBrands: mergedBrands } : {}),
        ...(mergedDescLines.length > 0 ? { description: mergedDescLines.join('\n') } : {}),
        ...(userData?.answers?.diseaseOrigin && !patient.answers?.diseaseOrigin ? { diseaseOrigin: userData.answers.diseaseOrigin } : {}),
        plan: resolvedPlan,
        selectedOffer: resolvedPlan,
        isPremium: resolvedIsPremium,
        pagamento_premium: resolvedIsPremium,
      };
      for (const tk of ['adhdTestResult', 'autismTestResult', 'hcPlantCalculator', 'phq9Result', 'gad7Result']) {
        const bestTest =
          patient.answers?.[tk] ||
          userData?.answers?.[tk] ||
          qd?.answers?.[tk] ||
          cd?.answers?.[tk];
        if (bestTest) mergedAnswers[tk] = bestTest;
      }
      enrichedPatient.answers = mergedAnswers;

      if (userData) {
         if (userData.name && typeof userData.name === 'string' && userData.name.trim().toLowerCase() !== 'paciente') {
           enrichedPatient.patientName = userData.name.trim();
           (enrichedPatient as any).name = userData.name.trim();
         }
         if (userData.cpf) enrichedPatient.cpf = userData.cpf;
         if (userData.birthDate) enrichedPatient.birthDate = userData.birthDate;
         if (userData.phone) enrichedPatient.phone = userData.phone;
         if (userData.email && !enrichedPatient.email?.includes('@')) enrichedPatient.email = userData.email;
         if (userData.greetingSent || userData.initialGreetingSent || userData.treatmentStarted) {
           enrichedPatient.greetingSent = true;
           enrichedPatient.initialGreetingSent = true;
         }
      }

      if (qd) {
        if (!enrichedPatient.cpf && qd.cpf) enrichedPatient.cpf = qd.cpf;
        if (!enrichedPatient.birthDate && qd.birthDate) enrichedPatient.birthDate = qd.birthDate;
        if (qd.greetingSent || qd.initialGreetingSent || qd.status === 'in-consultation' || qd.status === 'finished') {
          enrichedPatient.greetingSent = true;
          enrichedPatient.initialGreetingSent = true;
        }
      }
      if (cd) {
        if (cd.greetingSent || cd.initialGreetingSent) {
          enrichedPatient.greetingSent = true;
          enrichedPatient.initialGreetingSent = true;
        }
      }
    } catch (e) {
      console.warn("Failed to enrich patient data", e);
    }

    setCurrentPatient(enrichedPatient);
    setAnalysisResult(null); // Reset previous analysis to allow fresh generation

    // Auto-synchronize doctor's brand/association preference filter with patient's triage choice
    const pAns = enrichedPatient.answers || {};
    const prefBrandsLower = Array.isArray(pAns.preferredBrands)
      ? pAns.preferredBrands.map((b: string) => String(b).toLowerCase()).join(' | ')
      : '';
    const natPrefLower = String(pAns.preferredNationalAssociation || '').toLowerCase();
    const impPrefLower = String(pAns.preferredImportedBrand || '').toLowerCase();
    const combinedPref = `${prefBrandsLower} | ${natPrefLower} | ${impPrefLower}`;

    if (combinedPref.includes('abrace')) {
      setNationalPreference('abrace');
      setBrandPreference('abrace');
    } else if (combinedPref.includes('abec')) {
      setNationalPreference('abecmed');
      setBrandPreference('abecmed');
    } else if (combinedPref.includes('soucannabis') || combinedPref.includes('sou cannabis')) {
      setNationalPreference('soucannabis');
      setBrandPreference('soucannabis');
    }

    if (combinedPref.includes('pangaia')) {
      setImportedPreference('pangaia');
      if (!combinedPref.includes('abrace') && !combinedPref.includes('abec') && !combinedPref.includes('soucannabis')) {
        setBrandPreference('pangaia');
      }
    } else if (combinedPref.includes('greenbudz') || combinedPref.includes('green budz')) {
      setImportedPreference('greenbudz');
      if (!combinedPref.includes('abrace') && !combinedPref.includes('abec') && !combinedPref.includes('soucannabis')) {
        setBrandPreference('greenbudz');
      }
    } else if (combinedPref.includes('flowermed')) {
      setImportedPreference('flowermed');
      if (!combinedPref.includes('abrace') && !combinedPref.includes('abec') && !combinedPref.includes('soucannabis')) {
        setBrandPreference('flowermed');
      }
    }

    // Immediately update local store queue so patient leaves 'waiting' queue
    useStore.setState((state) => ({
      queue: state.queue.map(p => p.id === patient.id ? { ...p, status: 'in-consultation', hasUnread: false } : p)
    }));
    
    // Explicitly update Firestore queue status to in-consultation
    try {
      await setDoc(doc(db, 'queue', patient.id), {
        status: 'in-consultation',
        hasUnread: false
      }, { merge: true });

      await setDoc(doc(db, 'users', patient.id), {
        inQueue: false,
        consultationStatus: 'in-consultation',
        consultationActive: true,
        lastUpdated: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn("Error updating queue status:", e);
    }
    fetch('/api/queue/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: patient.id, status: 'in-consultation', hasUnread: false })
    }).catch(() => {});

    startConsultation(patient.id);
    subscribeToMessages(patient.id);
    
    // Auto-greeting: ONLY send once when the consultation is first initiated
    const patientGreetingKey = `mecura_greeting_sent_${patient.id}`;
    const alreadyGreetedInStorage = typeof window !== 'undefined' && localStorage.getItem(patientGreetingKey) === 'true';
    const alreadyGreetedInRef = greetedPatientsRef.current.has(patient.id);
    const alreadyGreetedInPatient = !!(patient.greetingSent || enrichedPatient.greetingSent || (patient as any).initialGreetingSent || enrichedPatient.initialGreetingSent);

    // If patient is not in 'waiting' status OR already greeted anywhere, strictly skip
    if (patient.status === 'waiting' && !alreadyGreetedInStorage && !alreadyGreetedInRef && !alreadyGreetedInPatient) {
      // Immediately flag in memory, storage and Firestore to prevent race conditions when doctor switches or leaves chat
      greetedPatientsRef.current.add(patient.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(patientGreetingKey, 'true');
      }

      setDoc(doc(db, 'queue', patient.id), { greetingSent: true, initialGreetingSent: true }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'users', patient.id), { greetingSent: true, initialGreetingSent: true }, { merge: true }).catch(() => {});
      setDoc(doc(db, 'active_consultations', patient.id), { greetingSent: true, initialGreetingSent: true }, { merge: true }).catch(() => {});

      setTimeout(async () => {
        try {
          // Double-check Firestore messages to ensure NO doctor message was ever sent before
          const msgsRef = collection(db, 'active_consultations', patient.id, 'messages');
          const snap = await getDocs(msgsRef);
          const hasExistingDoctorMessage = !snap.empty && snap.docs.some(d => {
            const data = d.data();
            return data.sender === 'doctor' || (data.text && typeof data.text === 'string' && data.text.includes('sou o Dr. Guilherme'));
          });

          if (hasExistingDoctorMessage) {
            console.log("[Auto-Greeting] Patient already has doctor message in Firestore. Skipping duplicate greeting.");
            return;
          }

          // Double check local store messages as well
          const currentStoreMsgs = useStore.getState().messages;
          if (currentStoreMsgs.some(m => m.sender === 'doctor' || (m.text && typeof m.text === 'string' && m.text.includes('sou o Dr. Guilherme')))) {
            console.log("[Auto-Greeting] Doctor message already exists in local store. Skipping duplicate greeting.");
            return;
          }

          const rawObjectives = patient.answers?.objectives || enrichedPatient.answers?.objectives;
          const objectivesStr = (Array.isArray(rawObjectives) && rawObjectives.length > 0)
            ? rawObjectives.join(", ") 
            : "";
            
          const pFirstName = (enrichedPatient.patientName || patient.patientName || 'Paciente').split(' ')[0];
          const greetingMsg = objectivesStr
            ? `Olá ${pFirstName}, sou o Dr. Guilherme. Analisei seu histórico e sua queixa de ${objectivesStr}. Como você está se sentindo hoje?`
            : `Olá ${pFirstName}, sou o Dr. Guilherme. Analisei o seu histórico de sintomas e objetivos de tratamento. Como você está se sentindo hoje?`;
          
          await addMessage({
            text: greetingMsg,
            sender: 'doctor',
            type: 'text'
          }, patient.id);
        } catch (err) {
          console.warn("[Auto-Greeting] Error checking/sending initial greeting:", err);
        }
      }, 1000);
    }
  };

  const handleNotifyNext = async (patient: any) => {
    try {
      // Immediately update local store queue so patient leaves 'waiting' queue
      useStore.setState((state) => ({
        queue: state.queue.map(p => p.id === patient.id ? { ...p, status: 'in-consultation', hasUnread: false } : p)
      }));

      await updateDoc(doc(db, 'queue', patient.id), {
        status: 'in-consultation',
        isAlerted: Date.now(),
        hasUnread: false
      }).catch(async () => {
        await setDoc(doc(db, 'queue', patient.id), { status: 'in-consultation', isAlerted: Date.now() }, { merge: true });
      });

      await setDoc(doc(db, 'users', patient.id), {
        inQueue: false,
        consultationStatus: 'in-consultation',
        consultationActive: true,
        lastUpdated: new Date().toISOString()
      }, { merge: true }).catch(() => {});

      fetch('/api/queue/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, status: 'in-consultation', hasUnread: false })
      }).catch(() => {});

      startConsultation(patient.id);
      subscribeToMessages(patient.id);
      setCurrentPatient(patient);

      await setDoc(doc(db, 'notifications', patient.id), {
        text: "O Dr. Guilherme já está pronto para te atender! Entre na sala de consulta.",
        timestamp: new Date().toISOString(),
        type: 'next'
      });

      triggerBackgroundPush(
        patient.id,
        'Sua vez chegou!',
        'O Dr. Guilherme já está te aguardando no consultório. Clique para entrar.',
        '/chat'
      ).catch(() => {});

      await addMessage({
        text: "🔔 SUA VEZ CHEGOU! O Dr. Guilherme já está na sala de consulta aguardando você.",
        sender: 'doctor',
        type: 'text'
      }, patient.id);

      showActionToast(`Chamada enviada para ${patient.patientName}: Paciente puxado para consulta!`);
    } catch (error) {
      console.error("Error sending notification", error);
      alert("Erro ao enviar notificação.");
    }
  };

  const handleRemoveFromQueue = async (patient: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Deseja remover ${patient.patientName || 'este paciente'} da fila de atendimento?`)) return;

    try {
      // 1. Immediately update store
      useStore.setState((state) => ({
        queue: state.queue.map(p => p.id === patient.id ? { ...p, status: 'finished' } : p)
      }));

      if (currentPatient?.id === patient.id) {
        setCurrentPatient(null);
      }

      // 2. Mark as finished in Firestore and consume active consultation credit
      await updateDoc(doc(db, 'queue', patient.id), {
        status: 'finished',
        hasUnread: false,
        pagamento_consulta: false
      }).catch(async () => {
        await setDoc(doc(db, 'queue', patient.id), { status: 'finished', pagamento_consulta: false }, { merge: true });
      });

      await setDoc(doc(db, 'users', patient.id), {
        inQueue: false,
        consultationStatus: 'finished',
        isConsultationFinished: true,
        consultationActive: false,
        pagamento_consulta: false,
        hasPaid: false,
        isPaid: false,
        bypassedPayment: false,
        hadPreviousConsultation: true,
        lastUpdated: new Date().toISOString()
      }, { merge: true }).catch(() => {});

      // 3. Update server queue
      fetch('/api/queue/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, status: 'finished', hasUnread: false })
      }).catch(() => {});

      showActionToast(`${patient.patientName || 'Paciente'} removido da fila.`);
    } catch (err) {
      console.error("Erro ao remover da fila:", err);
      alert("Não foi possível remover da fila.");
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

  const handleWhatsAppCall = (patient: any) => {
    if (!patient) return;
    const patientName = patient.patientName || userName || 'Paciente';
    const firstName = patientName.split(' ')[0];
    
    // 1. Comprehensive lookup for the patient's phone number
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
      userPhone || 
      '';
    
    let cleanDigits = String(rawPhone || '').replace(/\D/g, '');

    // 2. If no phone found, prompt doctor
    if (!cleanDigits) {
      const promptPhone = window.prompt(`O paciente ${patientName} não possui número de WhatsApp cadastrado na fila.\n\nPor favor, informe o WhatsApp com DDD (ex: 11999998888):`);
      if (promptPhone) {
        cleanDigits = promptPhone.replace(/\D/g, '');
      }
    }

    if (!cleanDigits) {
      alert("Nenhum número de WhatsApp informado para este paciente.");
      return;
    }

    // Format phone to international Brazilian format (55 + DDD + Number)
    let finalPhone = cleanDigits;
    if (finalPhone.length === 10 || finalPhone.length === 11) {
      finalPhone = `55${finalPhone}`;
    }

    const defaultMsg = `Olá ${firstName}! Aqui é o Dr. Guilherme da equipe médica MeCura. É a sua vez para a sua consulta de avaliação médica canábica! Por favor, acesse o aplicativo ou me responda por aqui para darmos início ao seu atendimento.`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(defaultMsg)}`;

    // 3. Open WhatsApp IMMEDIATELY & SYNCHRONOUSLY using a DOM link click so browser popup blockers do not intercept it
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

    // 4. In background, send in-app notification & active chat message
    if (patient.id) {
      setDoc(doc(db, 'notifications', patient.id), {
        text: `🔔 O Dr. Guilherme acabou de te chamar pelo WhatsApp! Acesse o app para a consulta.`,
        timestamp: new Date().toISOString(),
        type: 'whatsapp_call'
      }).catch(err => console.warn("Could not save notification:", err));

      const msgRef = doc(collection(db, 'active_consultations', patient.id, 'messages'));
      setDoc(msgRef, {
        id: msgRef.id,
        text: `💬 Chamado WhatsApp enviado para o paciente (+${finalPhone}). Dr. Guilherme aguarda você na sala de consulta!`,
        sender: 'doctor',
        type: 'text',
        timestamp: new Date().toISOString()
      }).catch(err => console.warn("Could not save consultation message:", err));
    }
  };

  const getPatientPlanType = (targetPatient: any): 'basic' | 'premium' | 'complete' | 'psychologist' => {
    if (!targetPatient) return 'basic';
    const validPlans = ['basic', 'premium', 'complete', 'psychologist'];
    const explicitPlan =
      (targetPatient.plan && validPlans.includes(targetPatient.plan) ? targetPatient.plan : null) ||
      (targetPatient.selectedOffer && validPlans.includes(targetPatient.selectedOffer) ? targetPatient.selectedOffer : null) ||
      (targetPatient.tier && validPlans.includes(targetPatient.tier) ? targetPatient.tier : null) ||
      (targetPatient.answers?.plan && validPlans.includes(targetPatient.answers.plan) ? targetPatient.answers.plan : null) ||
      (targetPatient.answers?.selectedOffer && validPlans.includes(targetPatient.answers.selectedOffer) ? targetPatient.answers.selectedOffer : null);
    if (explicitPlan) {
      return explicitPlan as 'basic' | 'premium' | 'complete' | 'psychologist';
    }
    if (targetPatient.isPremium === true || targetPatient.pagamento_premium === true || targetPatient.answers?.isPremium === true) {
      return 'premium';
    }
    return 'basic';
  };

  const isPatientVip = (targetPatient: any): boolean => {
    const planType = getPatientPlanType(targetPatient);
    return planType === 'premium' || planType === 'complete';
  };

  const handleTogglePatientPlan = async (patient: any) => {
    if (!patient || !patient.id) return;
    const currentPlan = getPatientPlanType(patient);
    const nextPlan: 'basic' | 'premium' | 'complete' =
      currentPlan === 'basic'
        ? 'premium'
        : currentPlan === 'premium'
        ? 'complete'
        : 'basic';
    const newPrem = nextPlan === 'premium' || nextPlan === 'complete';
    const updatedAnswers = {
      ...(patient.answers || {}),
      isPremium: newPrem,
      pagamento_premium: newPrem,
      plan: nextPlan,
      selectedOffer: nextPlan,
      tier: nextPlan,
    };

    useStore.setState((state) => ({
      queue: state.queue.map((p) =>
        p.id === patient.id
          ? { ...p, isPremium: newPrem, pagamento_premium: newPrem, plan: nextPlan, selectedOffer: nextPlan, tier: nextPlan, answers: updatedAnswers } as any
          : p
      )
    }));

    if (currentPatient && currentPatient.id === patient.id) {
      setCurrentPatient({
        ...currentPatient,
        isPremium: newPrem,
        pagamento_premium: newPrem,
        plan: nextPlan,
        selectedOffer: nextPlan,
        tier: nextPlan,
        answers: updatedAnswers
      } as any);
    }

    const planLabel =
      nextPlan === 'complete'
        ? '👑 Plano Completo 360° (Médico + Psicólogo)'
        : nextPlan === 'premium'
        ? '👑 VIP Premium (R$ 249,90)'
        : '🌱 Consulta Essencial (R$ 49,90)';
    alert(`Plano alterado para ${planLabel}`);

    try {
      await setDoc(doc(db, 'queue', patient.id), {
        isPremium: newPrem,
        pagamento_premium: newPrem,
        plan: nextPlan,
        selectedOffer: nextPlan,
        tier: nextPlan,
        answers: updatedAnswers
      }, { merge: true });
      await setDoc(doc(db, 'users', patient.id), {
        isPremium: newPrem,
        pagamento_premium: newPrem,
        plan: nextPlan,
        selectedOffer: nextPlan,
        tier: nextPlan,
        answers: updatedAnswers
      }, { merge: true });
      fetch('/api/queue/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: patient.id,
          plan: nextPlan,
          selectedOffer: nextPlan,
          isPremium: newPrem,
          pagamento_premium: newPrem,
        }),
      }).catch(() => {});
    } catch (err) {
      console.error("Error toggling patient plan:", err);
    }
  };

  const renderPatientPlanBadge = (targetPatient: any, stopPropagation = false) => {
    const planType = getPatientPlanType(targetPatient);
    const onClick = (e: any) => {
      if (stopPropagation && e?.stopPropagation) e.stopPropagation();
      handleTogglePatientPlan(targetPatient);
    };
    if (planType === 'complete') {
      return (
        <button
          type="button"
          onClick={onClick}
          title="Plano Completo 360° (Médico + Psicólogo - R$ 387,00) - Clique para alternar plano"
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/30 via-purple-500/25 to-amber-500/20 text-amber-200 border border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.35)] tracking-wider hover:scale-105 active:scale-95 transition-transform"
        >
          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
          COMPLETO 360°
        </button>
      );
    }
    if (planType === 'premium') {
      return (
        <button
          type="button"
          onClick={onClick}
          title="Plano VIP Premium (R$ 249,90) - Clique para alternar plano"
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)] tracking-wider hover:scale-105 active:scale-95 transition-transform"
        >
          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
          VIP PREMIUM
        </button>
      );
    }
    if (planType === 'psychologist') {
      return (
        <button
          type="button"
          onClick={onClick}
          title="Consulta Psicológica + Laudo (R$ 150,00) - Clique para alternar plano"
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-400/50 tracking-wider hover:scale-105 active:scale-95 transition-transform"
        >
          🧠 PSICÓLOGO
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={onClick}
        title="Plano Essencial (R$ 49,90) - Clique para alternar plano"
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#142A1D] text-[#4ADE80] border border-[#22C55E]/40 tracking-wider hover:border-amber-400/60 hover:text-amber-300 transition-colors"
      >
        🌱 ESSENCIAL
      </button>
    );
  };

  const handleTriggerFileInput = (docType: 'receita' | 'laudo_inicial' | 'laudo_evolutivo' | 'laudo_psicomotor' | 'laudo_agronomico' | 'documento') => {
    setSelectedUploadDocType(docType);
    setShowAttachmentMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const docType = selectedUploadDocType;
      setIsUploadingAttachment(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setPendingAttachment({
          name: file.name,
          url: dataUrl,
          type: file.type || 'application/pdf',
          docType: docType
        });

        // Upload to server immediately so we get a clean permanent URL
        try {
          const upRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              data: dataUrl,
              type: file.type || 'application/pdf'
            })
          });
          if (upRes.ok) {
            const upData = await upRes.json();
            if (upData?.url) {
              setPendingAttachment(prev => (prev && prev.name === file.name) ? { ...prev, url: upData.url } : prev);
            }
          }
        } catch (uploadErr) {
          console.warn("Upload error:", uploadErr);
        } finally {
          setIsUploadingAttachment(false);
        }
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleSendAttachment = async (customAttachment = pendingAttachment) => {
    if (!customAttachment || isSendingAttachment) return;

    const targetPatientId = currentPatient?.id || activeConsultationId || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
    if (!targetPatientId) {
      showActionToast("Por favor, selecione um paciente na fila antes de enviar o documento.");
      return;
    }

    setIsSendingAttachment(true);
    try {
      let finalAttachment = { ...customAttachment };

      // If still a base64 data URL, upload to server now to guarantee it never exceeds Firestore's 1MB limit
      if (finalAttachment.url && finalAttachment.url.startsWith('data:')) {
        try {
          const upRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: finalAttachment.name,
              data: finalAttachment.url,
              type: finalAttachment.type || 'application/pdf'
            })
          });
          if (upRes.ok) {
            const upData = await upRes.json();
            if (upData.url) {
              finalAttachment.url = upData.url;
            }
          }
        } catch (uploadErr) {
          console.warn("Direct upload error during send:", uploadErr);
        }
      }

      const docType = finalAttachment.docType || 'receita';
      let messageType: 'prescription' | 'medical_report' | 'psychomotor_report' | 'agronomic_report' | 'document' = 'document';
      let defaultTitle = 'Documento';

      if (docType === 'receita') {
        messageType = 'prescription';
        defaultTitle = 'Receita Digital Assinada';
      } else if (docType === 'laudo_inicial') {
        messageType = 'medical_report';
        defaultTitle = 'Laudo Médico Inicial';
      } else if (docType === 'laudo_evolutivo') {
        messageType = 'medical_report';
        defaultTitle = 'Laudo Médico Evolutivo';
      } else if (docType === 'laudo_psicomotor') {
        messageType = 'psychomotor_report';
        defaultTitle = 'Laudo Psicomotor (Aptidão)';
      } else if (docType === 'laudo_agronomico') {
        messageType = 'agronomic_report';
        defaultTitle = 'Parecer Técnico Agronômico';
      }

      await addMessage({
        sender: 'doctor',
        type: messageType,
        docType: docType,
        text: inputText.trim() || undefined,
        attachment: {
          ...finalAttachment,
          docType: docType,
          title: finalAttachment.title || defaultTitle
        }
      }, targetPatientId);

      try {
        await updateDoc(doc(db, 'queue', targetPatientId), {
          status: 'in-consultation',
          lastMessageAt: new Date().toISOString(),
          lastMessageText: defaultTitle,
          hasUnread: true
        });
      } catch (err) {
        console.warn("Could not update queue doc:", err);
      }

      setPendingAttachment(null);
      setInputText('');
      showActionToast(`Documento "${finalAttachment.name}" enviado com sucesso ao paciente!`);
    } catch (err) {
      console.error("Error sending attachment:", err);
      showActionToast("Erro ao enviar anexo. Verifique o arquivo e tente novamente.");
    } finally {
      setIsSendingAttachment(false);
    }
  };

  const handleSend = (customText?: string) => {
    const textToSend = typeof customText === 'string' ? customText : inputText;
    if (!textToSend.trim() && !pendingAttachment) return;
    
    if (pendingAttachment) {
      handleSendAttachment(pendingAttachment);
      return;
    }

    if (textToSend.trim()) {
      const targetPatientId = currentPatient?.id || activeConsultationId || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
      addMessage({
        text: textToSend.trim(),
        sender: 'doctor'
      }, targetPatientId);
      setInputText('');
    }
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

      const prodName = (label && !['Tratamento Premium', 'Orientações da Prescrição', 'Receita Digital', 'Pagamento Confirmado'].includes(label))
        ? label
        : (targetMsg?.productData?.name || null);

        if (prodName) {
          const cleanName = prodName.toLowerCase().trim();
          setAddedMedications(prev => prev.filter(name => name.toLowerCase() !== cleanName));
          const updated = prescItems.filter(p => p.name.toLowerCase().trim() !== cleanName);
          setPrescItems(updated);
          handleSavePrescription({
            patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
            birthDate: prescBirthDate,
            cpf: prescCpf,
            emissionDate: prescEmissionDate,
            doctorName: prescDoctorName,
            doctorCrm: prescDoctorCrm,
            doctorSpecialty: prescDoctorSpecialty,
            items: updated,
            notes: prescNotes
          });
          showActionToast(`✓ "${prodName}" excluído da receita e alteração salva.`);
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
    const adminInstructionsRaw = (document.getElementById('admin-instructions') as HTMLDivElement)?.textContent || "";
    const adminInstructions = adminInstructionsRaw.includes('Selecione uma via') ? '' : adminInstructionsRaw.trim();
    
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
        italicText = "Contém traços de THC (< 0,2%). Pode causar leve sonolência.";
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

    const targetPatientId = currentPatient?.id || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
    const isNational = selectedProduct.origin === 'Nacional' || (selectedProduct.manufacturer || '').toLowerCase().includes('associação');

    addMessage({
      text: `Prescrição de ${selectedProduct.name}`,
      sender: 'doctor',
      type: 'product',
      productData: {
        name: selectedProduct.name,
        brand: selectedProduct.manufacturer,
        origin: isNational ? 'Nacional' : (selectedProduct.origin || 'Importado'),
        details: details,
        dosage: [fullDosage],
        description: description,
        italicText: italicText,
        image: image,
        priceUSD: isNational ? undefined : (selectedProduct.priceUSD || (selectedProduct.priceBRL ? selectedProduct.priceBRL / exchangeRate : undefined)),
        priceBRL: isNational ? undefined : (selectedProduct.priceBRL || (selectedProduct.priceUSD ? selectedProduct.priceUSD * exchangeRate : undefined))
      }
    }, targetPatientId);

    // Also add/update in prescItems and persist prescription so it's officially recorded
    const cleanSendName = selectedProduct.name.toLowerCase().trim();
    const resolvedProduct = applyCustomBulaToProduct(selectedProduct);
    const customBula = getCustomBulaData(resolvedProduct);
    const sendEnriched = enrichMedicationDetails(resolvedProduct.name, resolvedProduct.manufacturer, isNational ? 'Nacional' : (resolvedProduct.origin || 'Importado'), resolvedProduct.type, resolvedProduct);
    const sendItem: PrescriptionItemData = {
      name: resolvedProduct.name,
      brand: customBula?.manufacturer || resolvedProduct.manufacturer || sendEnriched.brand,
      origin: customBula?.origin || (isNational ? 'Nacional' : (resolvedProduct.origin || 'Importado')),
      type: customBula?.type || resolvedProduct.type || sendEnriched.type,
      concentration: customBula?.concentration || customBula?.activeIngredients || resolvedProduct.concentration || sendEnriched.concentration || '',
      activeIngredients: customBula?.activeIngredients || resolvedProduct.activeIngredients || sendEnriched.activeIngredients || resolvedProduct.concentration || '',
      pharmaceuticalForm: customBula?.pharmaceuticalForm || resolvedProduct.pharmaceuticalForm || sendEnriched.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
      quantity: customBula?.quantity || resolvedProduct.quantity || sendEnriched.quantity || '01 Frasco de 30 mL',
      administrationRoute: customBula?.administrationRoute || resolvedProduct.administrationRoute || sendEnriched.administrationRoute || 'Via Sublingual / Oral',
      dosage: fullDosage ? fullDosage.split('\n').map(s => s.trim()).filter(Boolean) : (customBula?.posologyDetails ? customBula.posologyDetails.split('\n').map((s: string) => s.trim()).filter(Boolean) : ['Tomar conforme orientação médica.']),
      description: customBula?.description || description || sendEnriched.description || '',
      details: details || [sendEnriched.activeIngredients],
      priceUSD: isNational ? undefined : resolvedProduct.priceUSD,
      priceBRL: isNational ? undefined : resolvedProduct.priceBRL
    };

    const updatedPresc = prescItems.some(p => p.name.toLowerCase().trim() === cleanSendName)
      ? prescItems.map(p => p.name.toLowerCase().trim() === cleanSendName ? sendItem : p)
      : [...prescItems, sendItem];

    setPrescItems(updatedPresc);
    handleSavePrescription({
      patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
      birthDate: prescBirthDate,
      cpf: prescCpf,
      emissionDate: prescEmissionDate,
      doctorName: prescDoctorName,
      doctorCrm: prescDoctorCrm,
      doctorSpecialty: prescDoctorSpecialty,
      items: updatedPresc,
      notes: prescNotes
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
    const targetPatientId = currentPatient?.id || activeConsultationId || patientId;
    const targetPatientName = currentPatient?.patientName || userName || 'Paciente';

    await addMessage({
      text: `Consulta finalizada.\n\n${targetPatientName ? targetPatientName + ', a' : 'A'}gradeço a confiança em meu trabalho. Lembre-se que o tratamento com cannabis medicinal é uma jornada de adaptação e descoberta. Estarei acompanhando sua evolução de perto.\n\nQualquer dúvida sobre a dosagem, efeitos ou se precisar de suporte, nossa equipe de acolhimento está à disposição 24h por dia aqui no aplicativo.\n\nUm excelente tratamento e conte conosco!`,
      sender: 'doctor',
      type: 'text'
    }, targetPatientId);

    if (targetPatientId) {
      try {
        const finishedNowIso = new Date().toISOString();
        await updateDoc(doc(db, 'queue', targetPatientId), {
          status: 'finished',
          hasUnread: false,
          pagamento_consulta: false,
          finishedAt: finishedNowIso
        }).catch(async () => {
          await setDoc(doc(db, 'queue', targetPatientId), { status: 'finished', hasUnread: false, pagamento_consulta: false, finishedAt: finishedNowIso }, { merge: true });
        });

        await setDoc(doc(db, 'users', targetPatientId), {
          inQueue: false,
          consultationStatus: 'finished',
          isConsultationFinished: true,
          consultationActive: false,
          pagamento_consulta: false,
          hasPaid: false,
          isPaid: false,
          bypassedPayment: false,
          hadPreviousConsultation: true,
          finishedAt: finishedNowIso,
          lastUpdated: finishedNowIso
        }, { merge: true }).catch(() => {});

        fetch('/api/queue/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId: targetPatientId, status: 'finished', hasUnread: false })
        }).catch(() => {});

        triggerBackgroundPush(
          targetPatientId,
          'Consulta Concluída',
          'O Dr. Guilherme finalizou o atendimento. Seu protocolo e documentos já estão liberados!',
          '/protocol'
        );
      } catch (e) {
        console.warn('Erro ao finalizar paciente:', e);
      }

      useStore.setState((state) => ({
        queue: state.queue.map(p => p.id === targetPatientId ? { ...p, status: 'finished' } : p),
        isConsultationFinished: true,
        consultationActive: false,
        inQueue: false
      }));
    }

    endConsultation();
    setCurrentPatient(null);
  };

  const handleOpenPrescriptionEditor = (
    targetPatientOverride?: any, 
    prefillItems?: PrescriptionItemData[], 
    prefillNotes?: string
  ) => {
    const targetPatient = targetPatientOverride || currentPatient;
    if (targetPatient?.id) {
      setStandaloneTargetPatientId(targetPatient.id);
    } else {
      setStandaloneTargetPatientId(null);
    }
    const patientAnswers = targetPatient?.answers || answers;
    const pName = targetPatient?.patientName || targetPatient?.name || userName || 'Paciente';
    const pBirthDate = targetPatient?.birthDate || patientAnswers?.birthDate || userBirthDate || 'Não informada';
    const pCpf = targetPatient?.cpf || patientAnswers?.cpf || userCpf || 'Não informado';

    setPrescPatientName(pName);
    setPrescBirthDate(pBirthDate);
    setPrescCpf(pCpf);
    setPrescEmissionDate(format(new Date(), 'dd/MM/yyyy'));
    setPrescDoctorName('Dr. Guilherme Taveira Dias');
    setPrescDoctorCrm('CRM/MT 17259');
    setPrescDoctorSpecialty('Clínico Geral • Medicina Canabinoide');

    if (prefillItems && prefillItems.length > 0) {
      setPrescItems(prefillItems);
      if (prefillNotes !== undefined) {
        setPrescNotes(prefillNotes);
      }
      setPrescriptionTab('edit');
      setShowPrescriptionEditorModal(true);
      return;
    }

    const patientKey = getPatientReportKey(targetPatient?.id, pName);
    const saved = loadSavedPrescription(patientKey, pName, targetPatient?.id) || targetPatient?.prescriptionData;

    if (saved && saved.items && saved.items.length > 0) {
      setPrescPatientName(saved.patientName || pName);
      setPrescBirthDate(saved.birthDate || pBirthDate);
      setPrescCpf(saved.cpf || pCpf);
      setPrescEmissionDate(saved.emissionDate || format(new Date(), 'dd/MM/yyyy'));
      setPrescDoctorName(saved.doctorName || 'Dr. Guilherme Taveira Dias');
      setPrescDoctorCrm(saved.doctorCrm || 'CRM/MT 17259');
      setPrescDoctorSpecialty(saved.doctorSpecialty || 'Clínico Geral • Medicina Canabinoide');

      // Build merged items list: prefer prescItems if an item with the same name was edited in current session
      const prescMap = new Map<string, PrescriptionItemData>();
      const currentList = prescItemsRef.current.length > 0 ? prescItemsRef.current : prescItems;
      currentList.forEach(pi => prescMap.set(pi.name.toLowerCase().trim(), pi));

      const mergedItems: PrescriptionItemData[] = saved.items.map((si: PrescriptionItemData) => {
        const clean = si.name.toLowerCase().trim();
        if (prescMap.has(clean)) {
          const edited = prescMap.get(clean)!;
          prescMap.delete(clean);
          return edited;
        }
        return si;
      });

      prescMap.forEach((newlyAdded) => {
        mergedItems.push(newlyAdded);
      });

      prescItemsRef.current = mergedItems;
      setPrescItems(mergedItems);
      setPrescNotes(saved.notes || prescNotes || '');
      setPrescriptionTab('edit');
      setShowPrescriptionEditorModal(true);
      return;
    }

    // Extract products already in prescItems, messages & enrich with full pharmacology
    const items: PrescriptionItemData[] = [];
    const seenNames = new Set<string>();

    // 1. Items already selected in current session
    const currentList = prescItemsRef.current.length > 0 ? prescItemsRef.current : prescItems;
    currentList.forEach(it => {
      const clean = it.name.toLowerCase().trim();
      if (!seenNames.has(clean)) {
        seenNames.add(clean);
        items.push(it);
      }
    });

    // 2. Items from previous receita_previa messages
    messages.forEach(m => {
      if (m.type === 'receita_previa' && m.receitaPreviaData?.items) {
        m.receitaPreviaData.items.forEach(it => {
          const clean = it.name.toLowerCase().trim();
          if (!seenNames.has(clean)) {
            seenNames.add(clean);
            const enriched = enrichMedicationDetails(it.name, it.brand, it.origin, it.type);
            const isGummy = /goma|gumm|comest[íi]vel|mastig[áa]vel/i.test(it.name || it.type || '') ||
                            /goma/i.test(it.pharmaceuticalForm || enriched.pharmaceuticalForm || '');
            let dosageArr = Array.isArray(it.dosage) ? it.dosage : [String(it.dosage || '')];
            if (isGummy) {
              dosageArr = dosageArr.map(line => {
                if (/sublingual|gota|pingar/i.test(line)) {
                  return 'Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral). Não engolir inteira.';
                }
                return line;
              });
              if (dosageArr.length === 0 || !dosageArr[0]) {
                dosageArr = ['Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral). Mastigar bem antes de engolir.'];
              }
            }
            items.push({
              name: it.name,
              brand: it.brand || enriched.brand,
              origin: it.origin || enriched.origin,
              type: it.type || enriched.type,
              activeIngredients: it.activeIngredients || enriched.activeIngredients,
              concentration: it.concentration || enriched.concentration,
              pharmaceuticalForm: isGummy ? 'Gomas Mastigáveis Veganas' : (it.pharmaceuticalForm || enriched.pharmaceuticalForm),
              quantity: isGummy ? (it.quantity || '01 Pote com 20 a 30 gomas') : (it.quantity || enriched.quantity),
              administrationRoute: isGummy ? 'Via Oral' : (it.administrationRoute || enriched.administrationRoute),
              dosage: dosageArr,
              description: it.description || enriched.description || '',
              details: it.details
            });
          }
        });
      }
    });

    // 3. Items from previous product messages
    messages.forEach(m => {
      if (m.type === 'product' && m.productData) {
        const pName = m.productData.name;
        const clean = pName.toLowerCase().trim();
        if (!seenNames.has(clean)) {
          seenNames.add(clean);
          const enriched = enrichMedicationDetails(
            pName,
            m.productData.brand || 'Associação Brasileira',
            m.productData.origin || 'Nacional',
            m.productData.type
          );
          const isGummy = /goma|gumm|comest[íi]vel|mastig[áa]vel/i.test(pName || m.productData.type || '') ||
                          /goma/i.test(m.productData.pharmaceuticalForm || enriched.pharmaceuticalForm || '');
          let dosageArr = Array.isArray(m.productData.dosage) ? m.productData.dosage : [String(m.productData.dosage || '')];
          if (isGummy) {
            dosageArr = dosageArr.map(line => {
              if (/sublingual|gota|pingar/i.test(line)) {
                return 'Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral). Não engolir inteira.';
              }
              return line;
            });
            if (dosageArr.length === 0 || !dosageArr[0]) {
              dosageArr = ['Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral). Mastigar bem antes de engolir.'];
            }
          }

          items.push({
            name: pName,
            brand: m.productData.brand || enriched.brand,
            origin: m.productData.origin || enriched.origin,
            type: m.productData.type || enriched.type,
            activeIngredients: m.productData.activeIngredients || enriched.activeIngredients,
            concentration: m.productData.concentration || enriched.concentration,
            pharmaceuticalForm: isGummy ? 'Gomas Mastigáveis Veganas' : (m.productData.pharmaceuticalForm || enriched.pharmaceuticalForm),
            quantity: isGummy ? (m.productData.quantity || '01 Pote com 20 a 30 gomas') : (m.productData.quantity || enriched.quantity),
            administrationRoute: isGummy ? 'Via Oral' : (m.productData.administrationRoute || enriched.administrationRoute),
            dosage: dosageArr,
            description: m.productData.description || enriched.description || '',
            image: m.productData.image,
            details: m.productData.details,
            priceUSD: m.productData.priceUSD,
            priceBRL: m.productData.priceBRL
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
    setPrescDoctorSpecialty('Clínico Geral • Medicina Canabinoide');
    
    if (items.length > 0) {
      prescItemsRef.current = items;
      setPrescItems(items);
    } else if (prescItemsRef.current.length > 0) {
      setPrescItems(prescItemsRef.current);
    } else {
      prescItemsRef.current = [];
      setPrescItems([]);
    }
    const defaultNotesToAdd = '- Administrar com alimentos gordurosos (preferência, não obrigatório) - podendo aumentar em até 5x a absorção.\n- Se observado sonolência durante o dia após a administração do medicamento, reduzir em 1/3 a dose da manhã e à noite permanecer normal conforme a prescrição.\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos contínuos.';
    
    let finalNotes = prescNotes || notes || ('Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.\n' + defaultNotesToAdd);
    if (!finalNotes.includes('alimentos gordurosos')) {
      finalNotes += '\n\n' + defaultNotesToAdd;
    }
    // Auto-update legacy confusing phrasing if present
    if (finalNotes.includes('2/3 a noite')) {
      finalNotes = finalNotes.replace(
        /reduzir em 1\/3 a dose da manh[ãa] e 2\/3 a noite/gi,
        'reduzir em 1/3 a dose da manhã e à noite permanecer normal conforme a prescrição'
      );
    }
    setPrescNotes(finalNotes);
    setPrescriptionTab('edit');
    setShowPrescriptionEditorModal(true);
  };

  const handleSendReceitaPrevia = async () => {
    const targetPatientId = currentPatient?.id || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
    if (!targetPatientId) {
      showActionToast("Nenhum paciente selecionado para envio da receita prévia.");
      return;
    }

    const itemsToSend = prescItems.length > 0 ? prescItems : [];
    if (itemsToSend.length === 0) {
      showActionToast("Adicione pelo menos um medicamento à receita antes de enviar.");
      return;
    }

    const patientAnswers = currentPatient?.answers || answers;
    const pName = prescPatientName || currentPatient?.patientName || userName || 'Paciente';
    const defaultNotesToAdd = '- Administrar com alimentos gordurosos (preferência, não obrigatório) - podendo aumentar em até 5x a absorção.\n- Se observado sonolência durante o dia após a administração do medicamento, reduzir em 1/3 a dose da manhã e à noite permanecer normal conforme a prescrição.\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos contínuos.';
    const finalNotes = prescNotes.trim() || ('Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.\n' + defaultNotesToAdd);

    try {
      await addMessage({
        sender: 'doctor',
        type: 'receita_previa',
        text: `Olá ${pName}! Preparei a sua receita médica prévia com o protocolo de tratamento individualizado. Por favor, confira os medicamentos, a composição e as posologias abaixo e clique em "Confirmar e Aceitar Receita" para validarmos seu tratamento.`,
        receitaPreviaData: {
          doctorName: prescDoctorName || 'Dr. Guilherme Taveira Dias',
          doctorCrm: prescDoctorCrm || 'CRM/MT 17259',
          doctorSpecialty: prescDoctorSpecialty || 'Especialista em Medicina Canabinoide',
          patientName: pName,
          emissionDate: prescEmissionDate || format(new Date(), 'dd/MM/yyyy'),
          items: itemsToSend.map(item => {
            const enriched = enrichMedicationDetails(item.name, item.brand, item.origin, item.type);
            return {
              name: item.name,
              brand: item.brand || enriched.brand,
              origin: item.origin || enriched.origin,
              type: item.type || enriched.type,
              activeIngredients: (item.activeIngredients !== undefined && item.activeIngredients !== null && item.activeIngredients !== '') ? item.activeIngredients : enriched.activeIngredients,
              concentration: (item.concentration !== undefined && item.concentration !== null && item.concentration !== '') ? item.concentration : enriched.concentration,
              pharmaceuticalForm: item.pharmaceuticalForm || enriched.pharmaceuticalForm,
              quantity: item.quantity || enriched.quantity,
              administrationRoute: item.administrationRoute || enriched.administrationRoute,
              dosage: Array.isArray(item.dosage) && item.dosage.length > 0 
                ? item.dosage 
                : typeof (item.dosage as any) === 'string'
                ? String(item.dosage).split('\n').filter(Boolean)
                : ['Tomar conforme orientação médica.'],
              description: item.description || enriched.description || '',
              details: item.details || [item.activeIngredients || enriched.activeIngredients]
            };
          }),
          notes: finalNotes,
          status: 'pending_confirmation'
        }
      } as any, targetPatientId);

      if (targetPatientId) {
        try {
          await updateDoc(doc(db, 'queue', targetPatientId), {
            status: 'in-consultation',
            lastMessageAt: new Date().toISOString(),
            lastMessageText: 'Receita Prévia Enviada',
            hasUnread: true
          });
        } catch (err) {
          console.warn("Could not update queue status for receita previa:", err);
        }
        useStore.setState((state) => ({
          queue: state.queue.map(p => p.id === targetPatientId ? { ...p, status: 'in-consultation', hasUnread: true } : p)
        }));
      }

      setShowPrescriptionEditorModal(false);
      setShowProductSearchModal(false);
      showActionToast(`📋 Receita Prévia enviada com sucesso para ${pName}! Aguardando confirmação.`);
    } catch (err: any) {
      console.error("Erro ao enviar receita prévia:", err);
      showActionToast(`Erro ao enviar receita prévia: ${err?.message || 'Tente novamente'}`);
    }
  };

  const handleDownloadPrescriptionFromEditor = async (overrideData?: {
    patientName: string;
    birthDate: string;
    cpf: string;
    emissionDate: string;
    doctorName: string;
    doctorCrm: string;
    doctorSpecialty: string;
    items: PrescriptionItemData[];
    notes: string;
  }) => {
    // 1. Gerar o PDF com os dados editados para download local no computador do médico
    // IMPORTANTE: NÃO envia mensagens nem produtos para o chat ou histórico do paciente
    try {
      const pName = overrideData?.patientName ?? prescPatientName;
      const pBirth = overrideData?.birthDate ?? prescBirthDate;
      const pCpf = overrideData?.cpf ?? prescCpf;
      const pEmission = overrideData?.emissionDate ?? prescEmissionDate;
      const dName = overrideData?.doctorName ?? prescDoctorName;
      const dCrm = overrideData?.doctorCrm ?? prescDoctorCrm;
      const dSpec = overrideData?.doctorSpecialty ?? prescDoctorSpecialty;
      const pItems = overrideData?.items ?? prescItems;
      const pNotes = overrideData?.notes ?? prescNotes;

      showActionToast("Gerando PDF da receita...");
      await generatePrescriptionPDF(pName, messages, {
        customPatientName: pName,
        birthDate: pBirth,
        cpf: pCpf,
        emissionDate: pEmission,
        customDoctorName: dName,
        customDoctorCrm: dCrm,
        customDoctorSpecialty: dSpec,
        customItems: pItems,
        customNotes: pNotes
      });
      showActionToast("Receita em PDF baixada com sucesso!");
    } catch (err: any) {
      console.error("Erro ao baixar receita:", err);
      showActionToast(`Erro ao gerar PDF: ${err?.message || 'Tente novamente'}`);
    }
  };

  const handleSendPrescriptionToChat = async (includeProductCards: boolean = false, overrideData?: {
    patientName: string;
    birthDate: string;
    cpf: string;
    emissionDate: string;
    doctorName: string;
    doctorCrm: string;
    doctorSpecialty: string;
    items: PrescriptionItemData[];
    notes: string;
  }) => {
    const targetPatientId = currentPatient?.id || standaloneTargetPatientId || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
    if (!targetPatientId) {
      alert("Nenhum paciente selecionado para envio da receita.");
      return;
    }

    const activeItems = overrideData?.items ?? prescItems;
    const activeNotes = overrideData?.notes ?? prescNotes;
    const activePatientName = overrideData?.patientName ?? prescPatientName;
    const activeBirthDate = overrideData?.birthDate ?? prescBirthDate;
    const activeCpf = overrideData?.cpf ?? prescCpf;
    const activeEmissionDate = overrideData?.emissionDate ?? prescEmissionDate;
    const activeDoctorName = overrideData?.doctorName ?? prescDoctorName;
    const activeDoctorCrm = overrideData?.doctorCrm ?? prescDoctorCrm;
    const activeDoctorSpecialty = overrideData?.doctorSpecialty ?? prescDoctorSpecialty;

    try {
      setIsSendingAttachment(true);

      // 1. Atualizar o chat com os cards individuais de medicamentos SOMENTE se solicitado e se houver itens
      if (includeProductCards && activeItems.length > 0) {
        await clearPrescriptionMessages(targetPatientId);
        for (const item of activeItems) {
          const isNational = isNationalProduct(item);
          
          let foundCatProd: any = null;
          const cleanName = item.name.toLowerCase().trim();
          for (const cat of productCategories) {
            const p = cat.products.find(pr => pr.name.toLowerCase() === cleanName || cleanName.includes(pr.name.toLowerCase()));
            if (p) { foundCatProd = p; break; }
          }
          if (!foundCatProd) {
            foundCatProd = FLOWERMED_PRODUCTS.find(p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase()));
          }
          if (!foundCatProd) {
            foundCatProd = FLOWER_EXTRACTIONS_PRODUCTS.find(p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase()));
          }
          if (!foundCatProd) {
            foundCatProd = ABECMED_PRODUCTS.find(p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanName));
          }
          if (!foundCatProd) {
            foundCatProd = ABRACE_PRODUCTS.find(p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanName));
          }
          if (!foundCatProd) {
            foundCatProd = SOUCANNABIS_PRODUCTS.find(p => p.name.toLowerCase() === cleanName || cleanName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanName));
          }

          const enriched = enrichMedicationDetails(
            item.name, 
            item.brand || (isNational ? 'Associação Nacional' : 'GreenBudzCBD'), 
            item.origin || (isNational ? 'Nacional' : 'Importado'), 
            item.type, 
            foundCatProd
          );

          await addMessage({
            sender: 'doctor',
            type: 'product',
            productData: { 
              name: item.name,
              brand: item.brand || (foundCatProd ? foundCatProd.manufacturer : enriched.brand),
              origin: item.origin || (foundCatProd ? foundCatProd.origin : enriched.origin),
              type: item.type || (foundCatProd ? foundCatProd.type : enriched.type),
              activeIngredients: item.activeIngredients || enriched.activeIngredients,
              concentration: item.concentration || enriched.concentration,
              pharmaceuticalForm: item.pharmaceuticalForm || enriched.pharmaceuticalForm,
              quantity: item.quantity || enriched.quantity,
              administrationRoute: item.administrationRoute || enriched.administrationRoute,
              details: item.details && item.details.length > 0 ? item.details : (foundCatProd?.details || [enriched.activeIngredients]),
              dosage: item.dosage && item.dosage.length > 0 ? item.dosage : ['Tomar conforme orientação médica.'],
              description: item.description || foundCatProd?.description || enriched.description || '',
              italicText: foundCatProd?.italicText || 'Produto Prescrito',
              image: item.image || foundCatProd?.image || (isNational ? "https://images.unsplash.com/photo-1603903597871-3312c9ba4c81?q=80&w=400&auto=format&fit=crop" : "https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=400&auto=format&fit=crop"),
              priceUSD: isNational ? undefined : (item.priceUSD || foundCatProd?.priceUSD),
              priceBRL: isNational ? undefined : (item.priceBRL || foundCatProd?.priceBRL)
            }
          }, targetPatientId);
        }
      }

      if (activeNotes && activeNotes.trim()) {
        await addMessage({
          sender: 'doctor',
          type: 'prescription_notes',
          text: activeNotes
        }, targetPatientId);
      }

      // 2. Gerar o PDF oficial assinado como Blob
      let fileUrl = '';
      try {
        const pdfBlob = await generatePrescriptionPDF(activePatientName, messages, {
          customPatientName: activePatientName,
          birthDate: activeBirthDate,
          cpf: activeCpf,
          emissionDate: activeEmissionDate,
          customDoctorName: activeDoctorName,
          customDoctorCrm: activeDoctorCrm,
          customDoctorSpecialty: activeDoctorSpecialty,
          customItems: activeItems,
          customNotes: activeNotes,
          returnBlob: true
        }) as Blob;

        if (pdfBlob) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(pdfBlob);
          });
          const base64Data = await base64Promise;
          fileUrl = base64Data;

          const fileName = `Receita_${(prescPatientName || 'Paciente').replace(/\s+/g, '_')}.pdf`;
          try {
            const upRes = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: fileName,
                data: base64Data,
                type: 'application/pdf'
              })
            });
            if (upRes.ok) {
              const upData = await upRes.json();
              if (upData?.url) fileUrl = upData.url;
            }
          } catch (uploadErr) {
            console.warn("Upload falhou, mantendo base64:", uploadErr);
          }
        }
      } catch (pdfErr) {
        console.warn("Erro ao gerar/enviar blob da receita:", pdfErr);
      }

      // 3. Adicionar o anexo oficial da receita no chat do paciente (incluindo os itens prescritos para que Protocolo, Receita e Farmácia exibam sempre)
      const fileName = `Receita_Digital_${(activePatientName || 'Paciente').replace(/\s+/g, '_')}.pdf`;
      await addMessage({
        sender: 'doctor',
        type: 'prescription',
        docType: 'receita',
        text: `📋 **Receita Médica Digital Emitida**\n\nPrescrição oficial emitida pelo ${activeDoctorName} (${activeDoctorCrm}). O documento em PDF assinado digitalmente foi disponibilizado para download.`,
        receitaPreviaData: activeItems.length > 0 ? {
          patientName: activePatientName,
          emissionDate: activeEmissionDate,
          doctorName: activeDoctorName,
          doctorCrm: activeDoctorCrm,
          doctorSpecialty: activeDoctorSpecialty,
          items: activeItems,
          notes: activeNotes,
          status: 'confirmed'
        } : undefined,
        attachment: {
          name: fileName,
          url: fileUrl || '',
          type: 'application/pdf',
          docType: 'receita',
          title: 'Receita Médica Digital Oficial'
        }
      }, targetPatientId);

      // 4. Atualizar fila do paciente
      try {
        await updateDoc(doc(db, 'queue', targetPatientId), {
          status: 'in-consultation',
          lastMessageAt: new Date().toISOString(),
          lastMessageText: 'Receita Médica Digital Emitida',
          hasUnread: true
        });
      } catch (err) {
        console.warn("Could not update queue status:", err);
      }

      setShowPrescriptionEditorModal(false);
      showActionToast(`Receita Médica enviada com sucesso para ${prescPatientName || 'o paciente'}!`);
    } catch (err: any) {
      console.error("Erro ao enviar receita:", err);
      showActionToast(`Erro ao enviar receita: ${err?.message || 'Tente novamente'}`);
    } finally {
      setIsSendingAttachment(false);
    }
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

  const resolveCompletePatientAnswers = (targetPatientIdOverride?: string | null): Record<string, any> => {
    const resolvedId = targetPatientIdOverride !== undefined
      ? targetPatientIdOverride
      : (standaloneTargetPatientId || currentPatient?.id || null);
    const qPatient = resolvedId ? queue.find(p => p.id === resolvedId) : null;
    const hPatient = resolvedId ? consultationHistory.find(h => h.id === resolvedId) : null;
    const isCurrent = currentPatient && (!resolvedId || currentPatient.id === resolvedId);

    let msgAdhd: any = null;
    let msgAutism: any = null;
    if (isCurrent && Array.isArray(messages)) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i] as any;
        if (!msgAdhd && m?.type === 'adhd_test_card' && m?.adhdTestData?.scorePercent !== undefined) {
          msgAdhd = m.adhdTestData;
        }
        if (!msgAutism && m?.type === 'autism_test_card' && m?.autismTestData?.scorePercent !== undefined) {
          msgAutism = m.autismTestData;
        }
      }
    }

    const sources = [
      !currentPatient && !resolvedId ? answers : undefined,
      (hPatient as any)?.answers,
      qPatient?.answers,
      isCurrent ? currentPatient.answers : undefined,
    ].filter((s): s is Record<string, any> => !!s && typeof s === 'object');

    const combined: Record<string, any> = {};
    const objsSet = new Set<string>();
    const brandsSet = new Set<string>();
    const descLines: string[] = [];

    sources.forEach(src => {
      Object.entries(src).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          combined[k] = v;
        } else if (combined[k] === undefined && v !== undefined) {
          combined[k] = v;
        }
      });
      if (Array.isArray(src.objectives)) {
        src.objectives.filter(Boolean).forEach((o: string) => objsSet.add(String(o)));
      } else if (src.objective) {
        objsSet.add(String(src.objective));
      }
      if (Array.isArray(src.preferredBrands)) {
        src.preferredBrands.filter(Boolean).forEach((b: string) => brandsSet.add(String(b)));
      }
      if (src.description && typeof src.description === 'string') {
        src.description
          .split('\n')
          .map((l: string) => l.trim())
          .filter(Boolean)
          .forEach((line: string) => {
            if (!descLines.includes(line)) descLines.push(line);
          });
      }
    });

    for (const tk of ['adhdTestResult', 'autismTestResult', 'hcPlantCalculator', 'phq9Result', 'gad7Result']) {
      for (const src of sources) {
        if (src[tk]) {
          combined[tk] = { ...(combined[tk] || {}), ...src[tk] };
        }
      }
    }
    if (msgAdhd) combined.adhdTestResult = { ...(combined.adhdTestResult || {}), ...msgAdhd };
    if (msgAutism) combined.autismTestResult = { ...(combined.autismTestResult || {}), ...msgAutism };

    if (objsSet.size > 0) combined.objectives = Array.from(objsSet);
    if (brandsSet.size > 0) combined.preferredBrands = Array.from(brandsSet);
    if (descLines.length > 0) combined.description = descLines.join('\n');

    return combined;
  };

  const buildTriageReportDefaults = (type: 'inicial' | 'evolutivo' = medicalReportType) => {
    const qPatient = currentPatient?.id ? queue.find(p => p.id === currentPatient.id) : null;
    const patientAnswers = resolveCompletePatientAnswers(currentPatient?.id || null);
    const pName = (currentPatient?.patientName || (currentPatient as any)?.name || qPatient?.patientName || (!currentPatient ? userName : '') || 'Paciente').trim();
    const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || qPatient?.birthDate || (!currentPatient ? userBirthDate : '') || 'Não informada';
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || qPatient?.cpf || (!currentPatient ? userCpf : '') || 'Não informado';

    const objectivesArray = (Array.isArray(patientAnswers?.objectives) && patientAnswers.objectives.length > 0)
      ? patientAnswers.objectives
      : (patientAnswers?.objective ? [String(patientAnswers.objective)] : []);

    const personalized = generatePersonalizedClinicalReport({
      patientName: pName,
      birthDate: pBirthDate,
      cpf: pCpf,
      sex: patientAnswers?.sex,
      height: patientAnswers?.height,
      weight: patientAnswers?.weight,
      objectives: objectivesArray,
      intensity: patientAnswers?.intensity,
      duration: patientAnswers?.duration,
      description: patientAnswers?.description,
      diseaseOrigin: patientAnswers?.diseaseOrigin,
      remedios: patientAnswers?.remedios,
      remedios_details: patientAnswers?.remedios_details,
      doenca_cronica: patientAnswers?.doenca_cronica,
      doenca_cronica_details: patientAnswers?.doenca_cronica_details,
      tratamento_atual: patientAnswers?.tratamento_atual,
      tratamento_atual_details: patientAnswers?.tratamento_atual_details,
      cirurgia: patientAnswers?.cirurgia,
      cirurgia_details: patientAnswers?.cirurgia_details,
      alergia: patientAnswers?.alergia,
      alergia_details: patientAnswers?.alergia_details,
      digestivo: patientAnswers?.digestivo,
      digestivo_details: patientAnswers?.digestivo_details,
      dor_cabeca: patientAnswers?.dor_cabeca,
      dor_cabeca_details: patientAnswers?.dor_cabeca_details,
      cansado: patientAnswers?.cansado,
      cannabis: patientAnswers?.cannabis,
      cannabis_details: patientAnswers?.cannabis_details,
      arritmia: patientAnswers?.arritmia,
      arritmia_details: patientAnswers?.arritmia_details,
      tristeza: patientAnswers?.tristeza,
      foco: patientAnswers?.foco,
      memoria: patientAnswers?.memoria,
      irritado: patientAnswers?.irritado,
      estresse: patientAnswers?.estresse,
      panico: patientAnswers?.panico,
      panico_details: patientAnswers?.panico_details,
      ansiedade_diag: patientAnswers?.ansiedade_diag,
      ansiedade_diag_details: patientAnswers?.ansiedade_diag_details,
      dirige: patientAnswers?.dirige,
      dirige_details: patientAnswers?.dirige_details,
      maquinario: patientAnswers?.maquinario,
      maquinario_details: patientAnswers?.maquinario_details,
      blitz: patientAnswers?.blitz,
      laudo_psicomotor: patientAnswers?.laudo_psicomotor,
      preferredTreatmentStatus: patientAnswers?.preferredTreatmentStatus,
      preferredBrands: patientAnswers?.preferredBrands,
      preferredBrandNotes: patientAnswers?.preferredBrandNotes,
      adhdTestResult: patientAnswers?.adhdTestResult,
      autismTestResult: patientAnswers?.autismTestResult,
      hcPlantCalculator: patientAnswers?.hcPlantCalculator,
      mainSymptoms: patientAnswers?.mainSymptoms,
      pathology: patientAnswers?.pathology,
      evolutionNotes,
      answers: patientAnswers
    }, type);

    const defaultClinicalSummary = type === 'inicial'
      ? personalized.clinicalSummary
      : `${personalized.clinicalSummary}\n\n${personalized.evolutionSummary}`;
    const defaultTherapeuticRationale = personalized.therapeuticRationale;

    const items: PrescriptionItemData[] = [];
    const seenReportNames = new Set<string>();

    const prescKey = getPatientReportKey(currentPatient?.id, pName);
    const savedPresc = loadSavedPrescription(prescKey, pName, currentPatient?.id);
    const activePrescItems = prescItems.length > 0 ? prescItems : (savedPresc?.items && Array.isArray(savedPresc.items) ? savedPresc.items : []);
    if (prescItems.length === 0 && activePrescItems.length > 0) {
      setPrescItems(activePrescItems);
    }

    activePrescItems.forEach(it => {
      items.push(it);
      seenReportNames.add(it.name.toLowerCase().trim());
    });

    messages.forEach(m => {
      const anyM = m as any;
      if (anyM.prescriptionData?.items && Array.isArray(anyM.prescriptionData.items)) {
        anyM.prescriptionData.items.forEach((it: PrescriptionItemData) => {
          const clean = it.name.toLowerCase().trim();
          if (!seenReportNames.has(clean)) {
            seenReportNames.add(clean);
            items.push(it);
          }
        });
      }
      if (m.type === 'receita_previa' && m.receitaPreviaData?.items) {
        m.receitaPreviaData.items.forEach((it: PrescriptionItemData) => {
          const clean = it.name.toLowerCase().trim();
          if (!seenReportNames.has(clean)) {
            seenReportNames.add(clean);
            items.push(it);
          }
        });
      }
    });

    messages.forEach(m => {
      if (m.type === 'product' && m.productData) {
        const prodName = m.productData.name;
        const clean = prodName.toLowerCase().trim();
        if (!seenReportNames.has(clean)) {
          seenReportNames.add(clean);
          const enriched = enrichMedicationDetails(
            prodName,
            m.productData.brand || 'Associação Brasileira',
            m.productData.origin || 'Nacional',
            m.productData.type
          );
          items.push({
            name: prodName,
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
          const isGummy = /goma|gumm|comest[íi]vel/i.test(item.name || item.pharmaceuticalForm || '');
          const isFlower = /flor|in natura/i.test(item.name || item.pharmaceuticalForm || '');
          const isSyringeOrMl = /seringa|marcação de ml|via oral sublingual 0|em ml/i.test(`${item.pharmaceuticalForm || ''} ${item.name} ${item.administrationRoute || ''} ${(item.dosage || []).join(' ')}`);
          const posologyHeader = item.posologyHeader !== undefined
            ? (item.posologyHeader.trim() ? item.posologyHeader.replace(/[:.]+$/, '').trim() : 'Posologia')
            : ((isGummy || isFlower || isSyringeOrMl) ? 'Posologia' : 'Posologia (Aproximadamente 25 gotas por mL)');
          const cleanDosage = item.dosage.filter(d => {
            const t = d.trim();
            return t && (!posologyHeader.includes('25 gotas') || !/^Aproximadamente 25 gotas por mL\.?$/i.test(t)) && !/^Posologia e Modo de Uso:\s*Aproximadamente 25 gotas por mL\.?$/i.test(t);
          });
          const doseStr = (cleanDosage.length > 0 ? cleanDosage : item.dosage).join(' | ');
          return `${idx + 1}. ${item.name} (${item.brand} - ${item.origin})${ing}${form}\n   ${posologyHeader}: ${doseStr}\n   Finalidade: ${item.description || 'Modulação fitocanabinoide contínua.'}`;
        }).join('\n\n')
      : personalized.treatmentPlan;

    return {
      pName,
      pBirthDate,
      pCpf,
      defaultClinicalSummary,
      defaultTherapeuticRationale,
      defaultTreatmentPlan,
      defaultMonitoringText: personalized.monitoringText
    };
  };

  const handleResetMedicalReportFromTriage = () => {
    const defaults = buildTriageReportDefaults(medicalReportType);
    setReportPatientName(defaults.pName);
    setReportBirthDate(defaults.pBirthDate);
    setReportCpf(defaults.pCpf);
    setReportDiagnosis(defaults.defaultClinicalSummary);
    setReportRationale(defaults.defaultTherapeuticRationale);
    setReportTreatmentPlan(defaults.defaultTreatmentPlan);
    setReportMonitoring(defaults.defaultMonitoringText);

    const patientKey = getPatientReportKey(currentPatient?.id, defaults.pName);
    saveReportToStorage(patientKey, medicalReportType, {
      patientName: defaults.pName,
      birthDate: defaults.pBirthDate,
      cpf: defaults.pCpf,
      emissionDate: reportEmissionDate || format(new Date(), 'dd/MM/yyyy'),
      doctorName: reportDoctorName || 'Dr. Guilherme Taveira Dias',
      doctorCrm: reportDoctorCrm || 'CRM/MT 17259',
      doctorSpecialty: reportDoctorSpecialty || 'Especialista em Medicina Canabinoide',
      diagnosis: defaults.defaultClinicalSummary,
      rationale: defaults.defaultTherapeuticRationale,
      treatmentPlan: defaults.defaultTreatmentPlan,
      monitoring: defaults.defaultMonitoringText
    }, currentPatient?.id);

    showActionToast('✓ Dados da triagem do paciente carregados no laudo!');
    return {
      patientName: defaults.pName,
      birthDate: defaults.pBirthDate,
      cpf: defaults.pCpf,
      diagnosis: defaults.defaultClinicalSummary,
      rationale: defaults.defaultTherapeuticRationale,
      treatmentPlan: defaults.defaultTreatmentPlan,
      monitoring: defaults.defaultMonitoringText
    };
  };

  const handleOpenMedicalReportEditor = (type: 'inicial' | 'evolutivo' = 'inicial') => {
    setStandaloneTargetPatientId(null);
    setMedicalReportType(type);

    const defaults = buildTriageReportDefaults(type);
    const { pName, pBirthDate, pCpf, defaultClinicalSummary, defaultTherapeuticRationale, defaultTreatmentPlan, defaultMonitoringText } = defaults;

    const patientKey = getPatientReportKey(currentPatient?.id, pName);
    const rawSaved = loadSavedReport(patientKey, type, pName, currentPatient?.id);

    // Validate that any previously saved report in localStorage actually belongs to this patient
    // and includes any new individual tests (TDAH, Autism, HC Calculator) completed by the patient
    const currentAns = resolveCompletePatientAnswers(currentPatient?.id || null);
    let validSaved = rawSaved;
    if (rawSaved?.diagnosis && pName && pName.toLowerCase() !== 'paciente') {
      const matchInText = rawSaved.diagnosis.match(/paciente\s+([^,]+),\s*inscrito/i);
      if (matchInText && matchInText[1]) {
        const nameInDiagnosis = matchInText[1].trim().toLowerCase();
        if (nameInDiagnosis !== pName.trim().toLowerCase()) {
          validSaved = null;
        }
      }
      if (validSaved && currentAns?.adhdTestResult && !/ASRS-18|TDAH/i.test(validSaved.diagnosis)) {
        validSaved = null;
      }
      if (validSaved && currentAns?.autismTestResult && !/TEA|Autismo|AQ-10/i.test(validSaved.diagnosis)) {
        validSaved = null;
      }
      if (validSaved && currentAns?.hcPlantCalculator && !/Calculadora HC|Autocultivo/i.test(validSaved.diagnosis)) {
        validSaved = null;
      }
    }

    setReportPatientName(validSaved?.patientName || pName);
    setReportBirthDate(validSaved?.birthDate || pBirthDate);
    setReportCpf(validSaved?.cpf || pCpf);
    setReportEmissionDate(validSaved?.emissionDate || format(new Date(), 'dd/MM/yyyy'));
    setReportDoctorName(validSaved?.doctorName || 'Dr. Guilherme Taveira Dias');
    setReportDoctorCrm(validSaved?.doctorCrm || 'CRM/MT 17259');
    setReportDoctorSpecialty(validSaved?.doctorSpecialty || 'Clínico Geral • Medicina Canabinoide');
    setReportDiagnosis(validSaved?.diagnosis || defaultClinicalSummary);
    setReportRationale(validSaved?.rationale || defaultTherapeuticRationale);
    setReportTreatmentPlan(validSaved?.treatmentPlan || defaultTreatmentPlan);
    setReportMonitoring(validSaved?.monitoring || defaultMonitoringText);
    setMedicalReportTab('edit');
    setShowMedicalReportEditorModal(true);
  };

  
  const handleOpenPsychomotorReportEditor = () => {
    setStandaloneTargetPatientId(null);
    const qPatient = currentPatient?.id ? queue.find(p => p.id === currentPatient.id) : null;
    const patientAnswers = resolveCompletePatientAnswers(currentPatient?.id || null);
    const pName = (currentPatient?.patientName || (currentPatient as any)?.name || qPatient?.patientName || (!currentPatient ? userName : '') || 'Paciente').trim();
    const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || qPatient?.birthDate || (!currentPatient ? userBirthDate : '') || 'Não informada';
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || qPatient?.cpf || (!currentPatient ? userCpf : '') || 'Não informado';
    
    const patientKey = getPatientReportKey(currentPatient?.id, pName);
    const rawSaved = loadSavedReport(patientKey, 'psicomotor', pName, currentPatient?.id);
    let validSaved = rawSaved;
    if (rawSaved?.text && pName && pName.toLowerCase() !== 'paciente' && !rawSaved.text.toLowerCase().includes(pName.toLowerCase())) {
      validSaved = null;
    }

    setReportPatientName(validSaved?.patientName || pName);
    setReportBirthDate(validSaved?.birthDate || pBirthDate);
    setReportCpf(validSaved?.cpf || pCpf);
    setReportEmissionDate(validSaved?.emissionDate || new Date().toLocaleDateString('pt-BR'));
    setReportDoctorName(validSaved?.doctorName || 'Dr. Guilherme Taveira Dias');
    setReportDoctorCrm(validSaved?.doctorCrm || 'CRM/MT 17259');
    setReportDoctorSpecialty(validSaved?.doctorSpecialty || 'Clínico Geral • Medicina Canabinoide');

    if (validSaved?.text) {
      setPsychomotorReportText(validSaved.text);
    } else {
      const objectivesArray = (Array.isArray(patientAnswers?.objectives) && patientAnswers.objectives.length > 0)
        ? patientAnswers.objectives
        : [];
      const personalized = generatePersonalizedClinicalReport({
        patientName: pName,
        birthDate: pBirthDate,
        cpf: pCpf,
        objectives: objectivesArray,
        intensity: patientAnswers?.intensity,
        duration: patientAnswers?.duration,
        description: patientAnswers?.description,
        diseaseOrigin: patientAnswers?.diseaseOrigin,
        remedios: patientAnswers?.remedios,
        remedios_details: patientAnswers?.remedios_details,
        doenca_cronica: patientAnswers?.doenca_cronica,
        doenca_cronica_details: patientAnswers?.doenca_cronica_details,
        digestivo: patientAnswers?.digestivo,
        digestivo_details: patientAnswers?.digestivo_details,
        mainSymptoms: patientAnswers?.mainSymptoms,
        pathology: patientAnswers?.pathology,
        answers: patientAnswers
      }, 'evolutivo');

      setPsychomotorReportText(personalized.psychomotor.text);
    }
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

  const handleSendPsychomotorReportToChat = async () => {
    const targetPatientId = currentPatient?.id || activeConsultationId || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
    if (!targetPatientId) {
      showActionToast("Nenhum paciente selecionado para envio do laudo psicomotor.");
      return;
    }

    try {
      setIsSendingPsychomotorToChat(true);

      const pdfBlob = await generatePsychomotorReportPDF(reportPatientName, {
        customPatientName: reportPatientName,
        birthDate: reportBirthDate,
        cpf: reportCpf,
        emissionDate: reportEmissionDate,
        customDoctorName: reportDoctorName,
        customDoctorCrm: reportDoctorCrm,
        customDoctorSpecialty: reportDoctorSpecialty,
        customPsychomotorText: psychomotorReportText,
        returnBlob: true
      }) as Blob;

      let fileUrl = '';
      const cleanPatientName = (reportPatientName || 'Paciente').replace(/\s+/g, '_');
      const fileName = `Laudo_Psicomotor_${cleanPatientName}.pdf`;

      if (pdfBlob) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(pdfBlob);
        });
        const base64Data = await base64Promise;
        fileUrl = base64Data;

        try {
          const upRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: fileName,
              data: base64Data,
              type: 'application/pdf'
            })
          });
          if (upRes.ok) {
            const upData = await upRes.json();
            if (upData?.url) fileUrl = upData.url;
          }
        } catch (uploadErr) {
          console.warn("Upload falhou, mantendo base64:", uploadErr);
        }
      }

      await addMessage({
        sender: 'doctor',
        type: 'psychomotor_report',
        docType: 'laudo_psicomotor',
        text: `⚖️ **Laudo Psicomotor (Aptidão / CTB) Emitido**\n\nAtestado de aptidão e capacidade psicomotora emitido pelo ${reportDoctorName} (${reportDoctorCrm}), comprovando a plena aptidão motora e segurança na condução de veículos e operação de equipamentos durante o tratamento. O PDF oficial foi disponibilizado para download.`,
        attachment: {
          name: fileName,
          url: fileUrl || '',
          type: 'application/pdf',
          docType: 'laudo_psicomotor',
          title: 'Laudo Psicomotor (Lei Seca / CTB)'
        }
      }, targetPatientId);

      try {
        await updateDoc(doc(db, 'queue', targetPatientId), {
          status: 'in-consultation',
          lastMessageAt: new Date().toISOString(),
          lastMessageText: 'Laudo Psicomotor Emitido',
          hasUnread: true
        });
      } catch (err) {
        console.warn("Could not update queue status:", err);
      }

      setShowPsychomotorReportEditorModal(false);
      showActionToast(`Laudo Psicomotor enviado com sucesso para ${reportPatientName || 'o paciente'}!`);
    } catch (err: any) {
      console.error("Erro ao enviar laudo psicomotor:", err);
      showActionToast(`Erro ao enviar laudo psicomotor: ${err?.message || 'Tente novamente'}`);
    } finally {
      setIsSendingPsychomotorToChat(false);
    }
  };

  const buildTriageAgronomicDefaults = (targetPatientIdOverride?: string | null) => {
    const resolvedId = targetPatientIdOverride !== undefined
      ? targetPatientIdOverride
      : (standaloneTargetPatientId || currentPatient?.id || null);
    const qPatient = resolvedId
      ? (queue.find(p => p.id === resolvedId) || consultationHistory.find(h => h.id === resolvedId))
      : null;
    const patientAnswers = resolveCompletePatientAnswers(resolvedId);
    const pName = (
      (currentPatient && (!resolvedId || currentPatient.id === resolvedId) ? (currentPatient.patientName || (currentPatient as any)?.name) : '') ||
      qPatient?.patientName ||
      (!currentPatient && !resolvedId ? userName : '') ||
      agronomicPatientName ||
      'Paciente'
    ).trim();
    const pCpf = (
      (currentPatient && (!resolvedId || currentPatient.id === resolvedId) ? currentPatient.cpf : '') ||
      patientAnswers?.cpf ||
      qPatient?.cpf ||
      (!currentPatient && !resolvedId ? userCpf : '') ||
      agronomicCpf ||
      'Não informado'
    );
    const pBirthDate = (
      (currentPatient && (!resolvedId || currentPatient.id === resolvedId) ? currentPatient.birthDate : '') ||
      patientAnswers?.birthDate ||
      qPatient?.birthDate ||
      (!currentPatient && !resolvedId ? userBirthDate : '') ||
      'Não informada'
    );

    const objectivesArray = (Array.isArray(patientAnswers?.objectives) && patientAnswers.objectives.length > 0)
      ? patientAnswers.objectives
      : (patientAnswers?.objective ? [String(patientAnswers.objective)] : []);

    const personalized = generatePersonalizedClinicalReport({
      patientName: pName,
      birthDate: pBirthDate,
      cpf: pCpf,
      sex: patientAnswers?.sex,
      height: patientAnswers?.height,
      weight: patientAnswers?.weight,
      objectives: objectivesArray,
      intensity: patientAnswers?.intensity,
      duration: patientAnswers?.duration,
      description: patientAnswers?.description,
      diseaseOrigin: patientAnswers?.diseaseOrigin,
      remedios: patientAnswers?.remedios,
      remedios_details: patientAnswers?.remedios_details,
      doenca_cronica: patientAnswers?.doenca_cronica,
      doenca_cronica_details: patientAnswers?.doenca_cronica_details,
      tratamento_atual: patientAnswers?.tratamento_atual,
      tratamento_atual_details: patientAnswers?.tratamento_atual_details,
      cirurgia: patientAnswers?.cirurgia,
      cirurgia_details: patientAnswers?.cirurgia_details,
      alergia: patientAnswers?.alergia,
      alergia_details: patientAnswers?.alergia_details,
      digestivo: patientAnswers?.digestivo,
      digestivo_details: patientAnswers?.digestivo_details,
      dor_cabeca: patientAnswers?.dor_cabeca,
      dor_cabeca_details: patientAnswers?.dor_cabeca_details,
      cansado: patientAnswers?.cansado,
      cannabis: patientAnswers?.cannabis,
      cannabis_details: patientAnswers?.cannabis_details,
      arritmia: patientAnswers?.arritmia,
      arritmia_details: patientAnswers?.arritmia_details,
      tristeza: patientAnswers?.tristeza,
      foco: patientAnswers?.foco,
      memoria: patientAnswers?.memoria,
      irritado: patientAnswers?.irritado,
      estresse: patientAnswers?.estresse,
      panico: patientAnswers?.panico,
      panico_details: patientAnswers?.panico_details,
      ansiedade_diag: patientAnswers?.ansiedade_diag,
      ansiedade_diag_details: patientAnswers?.ansiedade_diag_details,
      dirige: patientAnswers?.dirige,
      dirige_details: patientAnswers?.dirige_details,
      maquinario: patientAnswers?.maquinario,
      maquinario_details: patientAnswers?.maquinario_details,
      blitz: patientAnswers?.blitz,
      laudo_psicomotor: patientAnswers?.laudo_psicomotor,
      preferredTreatmentStatus: patientAnswers?.preferredTreatmentStatus,
      preferredBrands: patientAnswers?.preferredBrands,
      preferredBrandNotes: patientAnswers?.preferredBrandNotes,
      adhdTestResult: patientAnswers?.adhdTestResult,
      autismTestResult: patientAnswers?.autismTestResult,
      hcPlantCalculator: patientAnswers?.hcPlantCalculator,
      mainSymptoms: patientAnswers?.mainSymptoms,
      pathology: patientAnswers?.pathology,
      evolutionNotes,
      answers: patientAnswers
    }, 'evolutivo');

    const prescKey = getPatientReportKey(resolvedId, pName);
    const savedPresc = loadSavedPrescription(prescKey, pName, resolvedId);
    const activePrescItems = prescItems.length > 0 ? prescItems : (savedPresc?.items && Array.isArray(savedPresc.items) ? savedPresc.items : []);
    const prescribedProductsStr = activePrescItems.length > 0
      ? activePrescItems.map((it: PrescriptionItemData, idx: number) => `${idx + 1}. ${it.name} (${it.brand || 'Associação'} - ${it.origin || 'Nacional'}) • ${(it.dosage || []).join(' ')}`).join('\n')
      : '';

    const hcCalc = patientAnswers?.hcPlantCalculator;
    const defaultDailyDoseMg = hcCalc?.dailyDoseMg ? Number(hcCalc.dailyDoseMg) : personalized.agronomic.dailyDoseMg;
    const defaultTargetPlants = hcCalc?.annualPlants ? Number(hcCalc.annualPlants) : personalized.agronomic.targetPlants;

    return {
      resolvedId,
      pName,
      pCpf,
      pBirthDate,
      patientAnswers,
      prescribedProductsStr,
      defaultDiagnosis: personalized.agronomic.diagnosis,
      defaultDailyDoseMg,
      defaultTargetPlants,
      defaultAgronomicText: personalized.agronomic.text
    };
  };

  const handleResetAgronomicReportFromTriage = () => {
    const defaults = buildTriageAgronomicDefaults();
    setAgronomicPatientName(defaults.pName);
    setAgronomicCpf(defaults.pCpf);
    setAgronomicDiagnosis(defaults.defaultDiagnosis);
    setAgronomicDailyDoseMg(defaults.defaultDailyDoseMg);
    setAgronomicTargetPlants(defaults.defaultTargetPlants);
    setAgronomicText(defaults.defaultAgronomicText);

    const patientKey = getPatientReportKey(defaults.resolvedId, defaults.pName);
    saveReportToStorage(patientKey, 'agronomico', {
      patientName: defaults.pName,
      cpf: defaults.pCpf,
      emissionDate: agronomicEmissionDate || new Date().toLocaleDateString('pt-BR'),
      agronomistName: agronomicName || 'Wilian Dalenogare Pereira',
      agronomistCrea: agronomicCrea || 'CREA-PR 172.458/D',
      diagnosis: defaults.defaultDiagnosis,
      dailyDoseMg: defaults.defaultDailyDoseMg,
      targetPlants: defaults.defaultTargetPlants,
      agronomicText: defaults.defaultAgronomicText
    }, defaults.resolvedId);

    showActionToast('✓ Dados da triagem do paciente carregados no Parecer Agronômico!');
    return {
      patientName: defaults.pName,
      cpf: defaults.pCpf,
      diagnosis: defaults.defaultDiagnosis,
      dailyDoseMg: defaults.defaultDailyDoseMg,
      targetPlants: defaults.defaultTargetPlants,
      agronomicText: defaults.defaultAgronomicText
    };
  };

  const handleOpenAgronomicReportEditor = () => {
    setStandaloneTargetPatientId(null);
    const defaults = buildTriageAgronomicDefaults(currentPatient?.id || null);
    const patientKey = getPatientReportKey(defaults.resolvedId, defaults.pName);
    const rawSaved = loadSavedReport(patientKey, 'agronomico', defaults.pName, defaults.resolvedId);

    let validSaved = rawSaved;
    if (rawSaved?.agronomicText && defaults.pName && defaults.pName.toLowerCase() !== 'paciente') {
      if (!rawSaved.agronomicText.toLowerCase().includes(defaults.pName.toLowerCase())) {
        validSaved = null;
      }
      if (validSaved && defaults.patientAnswers?.hcPlantCalculator?.annualPlants && Number(validSaved.targetPlants) !== Number(defaults.patientAnswers.hcPlantCalculator.annualPlants)) {
        validSaved = null;
      }
    }

    setAgronomicPatientName(validSaved?.patientName || defaults.pName);
    setAgronomicCpf(validSaved?.cpf || defaults.pCpf);
    setAgronomicEmissionDate(validSaved?.emissionDate || new Date().toLocaleDateString('pt-BR'));
    setAgronomicName(validSaved?.agronomistName || 'Wilian Dalenogare Pereira');
    setAgronomicCrea(validSaved?.agronomistCrea || 'CREA-PR 172.458/D');
    setAgronomicDiagnosis(validSaved?.diagnosis || defaults.defaultDiagnosis);
    setAgronomicDailyDoseMg(validSaved?.dailyDoseMg || defaults.defaultDailyDoseMg);
    setAgronomicTargetPlants(validSaved?.targetPlants || defaults.defaultTargetPlants);
    setAgronomicText(validSaved?.agronomicText || defaults.defaultAgronomicText);
    setShowAgronomicReportEditorModal(true);
  };

  const handleDownloadAgronomicReportFromEditor = (overrideData?: {
    patientName: string;
    cpf: string;
    emissionDate: string;
    agronomistName: string;
    agronomistCrea: string;
    diagnosis: string;
    dailyDoseMg: number;
    targetPlants: number;
    agronomicText: string;
  }) => {
    const defaults = buildTriageAgronomicDefaults();
    const finalName = overrideData?.patientName || agronomicPatientName || defaults.pName;
    const finalCpf = overrideData?.cpf || agronomicCpf || defaults.pCpf;
    const finalEmission = overrideData?.emissionDate || agronomicEmissionDate;
    const finalAgronomist = overrideData?.agronomistName || agronomicName;
    const finalCrea = overrideData?.agronomistCrea || agronomicCrea;
    const finalDiagnosis = overrideData?.diagnosis || agronomicDiagnosis || defaults.defaultDiagnosis;
    const finalDailyDose = overrideData?.dailyDoseMg || agronomicDailyDoseMg || defaults.defaultDailyDoseMg;
    const finalTargetPlants = overrideData?.targetPlants || agronomicTargetPlants || defaults.defaultTargetPlants;
    const finalText = overrideData?.agronomicText || agronomicText || defaults.defaultAgronomicText;

    generateAgronomicReportPDF(finalName, {
      patientId: defaults.resolvedId || undefined,
      customPatientName: finalName,
      cpf: finalCpf,
      birthDate: defaults.pBirthDate,
      emissionDate: finalEmission,
      agronomistName: finalAgronomist,
      agronomistCrea: finalCrea,
      diagnosis: finalDiagnosis,
      prescribedProducts: defaults.prescribedProductsStr,
      dailyDoseMg: finalDailyDose,
      targetPlants: finalTargetPlants,
      customText: finalText,
      answers: defaults.patientAnswers,
      htmlContent: undefined
    });
  };

  const handleSendAgronomicReportToChat = async (overrideData?: {
    patientName: string;
    cpf: string;
    emissionDate: string;
    agronomistName: string;
    agronomistCrea: string;
    diagnosis: string;
    dailyDoseMg: number;
    targetPlants: number;
    agronomicText: string;
  }) => {
    const targetPatientId = currentPatient?.id || standaloneTargetPatientId || activeConsultationId || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
    if (!targetPatientId) {
      showActionToast("Nenhum paciente selecionado para envio do parecer agronômico.");
      return;
    }

    try {
      setIsSendingAgronomicToChat(true);

      const defaults = buildTriageAgronomicDefaults(targetPatientId);
      const finalName = overrideData?.patientName || agronomicPatientName || defaults.pName;
      const finalCpf = overrideData?.cpf || agronomicCpf || defaults.pCpf;
      const finalEmission = overrideData?.emissionDate || agronomicEmissionDate;
      const finalAgronomist = overrideData?.agronomistName || agronomicName;
      const finalCrea = overrideData?.agronomistCrea || agronomicCrea;
      const finalDiagnosis = overrideData?.diagnosis || agronomicDiagnosis || defaults.defaultDiagnosis;
      const finalDailyDose = overrideData?.dailyDoseMg || agronomicDailyDoseMg || defaults.defaultDailyDoseMg;
      const finalTargetPlants = overrideData?.targetPlants || agronomicTargetPlants || defaults.defaultTargetPlants;
      const finalText = overrideData?.agronomicText || agronomicText || defaults.defaultAgronomicText;

      const annualGrams = ((finalDailyDose * 365) / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
      const dryFlowerMargin = (((finalDailyDose * 365 / 1000) / 0.10 / 1000) * 1.3038).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
      const wetFlower = (((((finalDailyDose * 365 / 1000) / 0.10 / 1000) * 1.3038) / 0.30)).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
      const seeds = Math.round(finalTargetPlants * 1.3038);
      const perCycle = Math.round(finalTargetPlants / 4);

      const pdfBlob = await generateAgronomicReportPDF(finalName, {
        patientId: targetPatientId,
        customPatientName: finalName,
        cpf: finalCpf,
        birthDate: defaults.pBirthDate,
        emissionDate: finalEmission,
        agronomistName: finalAgronomist,
        agronomistCrea: finalCrea,
        diagnosis: finalDiagnosis,
        prescribedProducts: defaults.prescribedProductsStr,
        dailyDoseMg: finalDailyDose,
        targetPlants: finalTargetPlants,
        customText: finalText,
        answers: defaults.patientAnswers,
        returnBlob: true
      }) as Blob;

      let fileUrl = '';
      const cleanPatientName = (finalName || 'Paciente').replace(/\s+/g, '_');
      const fileName = `Parecer_Agronomico_${cleanPatientName}.pdf`;

      if (pdfBlob) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(pdfBlob);
        });
        const base64Data = await base64Promise;
        fileUrl = base64Data;

        try {
          const upRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: fileName,
              data: base64Data,
              type: 'application/pdf'
            })
          });
          if (upRes.ok) {
            const upData = await upRes.json();
            if (upData?.url) fileUrl = upData.url;
          }
        } catch (uploadErr) {
          console.warn("Upload falhou, mantendo base64:", uploadErr);
        }
      }

      await addMessage({
        sender: 'doctor',
        type: 'agronomic_report',
        docType: 'laudo_agronomico',
        text: `🌱 **Parecer Técnico Agronômico Emitido (Salvo-Conduto / HC)**\n\n- **Paciente:** ${finalName}\n- **CPF:** ${finalCpf}\n- **Consultor e Eng. Agrônomo:** ${finalAgronomist} (${finalCrea})\n- **Indicações Técnicas:** Cultivo pessoal de *Cannabis sativa L.* com finalidade medicinal (GACP / RDC ANVISA)\n- **Patologias / CIDs:** ${finalDiagnosis}\n- **Demanda Farmacológica:** ${finalDailyDose} mg/dia de extrato integral (~${annualGrams}g de canabinoides/ano)\n- **Biomassa Seca Requerida:** ~${dryFlowerMargin} kg flores secas/ano (com 30% de margem agronômica)\n- **Biomassa Fresca (Flores Molhadas):** ~${wetFlower} kg colhidas/ano (perda hídrica 70-80%)\n- **Dimensionamento Autorizado:** ${finalTargetPlants} plantas anuais (${perCycle} a 40 plantas por ciclo em floração, 3 safras/ano)\n- **Propágulos / Sementes Feminizadas:** ${seeds} unidades importadas\n\nO Parecer Pericial oficial de 3 páginas para instrução de ação de Habeas Corpus Preventivo em PDF está disponível para download.`,
        attachment: {
          name: fileName,
          url: fileUrl || '',
          type: 'application/pdf',
          docType: 'laudo_agronomico',
          title: 'Parecer Técnico Agronômico Oficial'
        }
      }, targetPatientId);

      try {
        await updateDoc(doc(db, 'queue', targetPatientId), {
          status: 'in-consultation',
          lastMessageAt: new Date().toISOString(),
          lastMessageText: 'Parecer Agronômico Emitido',
          hasUnread: true
        });
      } catch (err) {
        console.warn("Could not update queue status:", err);
      }

      setShowAgronomicReportEditorModal(false);
      showActionToast(`Parecer Agronômico enviado com sucesso para ${finalName || 'o paciente'}!`);
    } catch (err: any) {
      console.error("Erro ao enviar parecer agronômico:", err);
      showActionToast(`Erro ao enviar parecer agronômico: ${err?.message || 'Tente novamente'}`);
    } finally {
      setIsSendingAgronomicToChat(false);
    }
  };

  const handleDownloadMedicalReportFromEditor = async (overrideData?: {
    diagnosis: string;
    rationale: string;
    treatmentPlan: string;
    monitoring: string;
    patientName: string;
    birthDate: string;
    cpf: string;
    emissionDate: string;
    doctorName: string;
    doctorCrm: string;
    doctorSpecialty: string;
  }) => {
    const qPatient = currentPatient?.id ? queue.find(p => p.id === currentPatient.id) : null;
    const patientAnswers = currentPatient
      ? { ...(qPatient?.answers || {}), ...(currentPatient.answers || {}) }
      : (answers || {});
    const isEvolutivo = medicalReportType === 'evolutivo';
    const pName = overrideData?.patientName || reportPatientName;
    const targetId = standaloneTargetPatientId || currentPatient?.id || null;
    const patientKey = getPatientReportKey(targetId, pName);
    const saved = loadSavedReport(patientKey, medicalReportType, pName, targetId);

    const finalPatientName = overrideData?.patientName || saved?.patientName || reportPatientName;
    const finalBirthDate = overrideData?.birthDate || saved?.birthDate || reportBirthDate;
    const finalCpf = overrideData?.cpf || saved?.cpf || reportCpf;
    const finalEmissionDate = overrideData?.emissionDate || saved?.emissionDate || reportEmissionDate;
    const finalDoctorName = overrideData?.doctorName || saved?.doctorName || reportDoctorName;
    const finalDoctorCrm = overrideData?.doctorCrm || saved?.doctorCrm || reportDoctorCrm;
    const finalDoctorSpecialty = overrideData?.doctorSpecialty || saved?.doctorSpecialty || reportDoctorSpecialty;
    const finalDiagnosis = overrideData?.diagnosis || saved?.diagnosis || reportDiagnosis;
    const finalRationale = overrideData?.rationale || saved?.rationale || reportRationale;
    const finalTreatmentPlan = overrideData?.treatmentPlan || saved?.treatmentPlan || reportTreatmentPlan;
    const finalMonitoring = overrideData?.monitoring || saved?.monitoring || reportMonitoring;

    try {
      showActionToast(isEvolutivo ? "Gerando Laudo Evolutivo..." : "Gerando Laudo Inicial...");
      await generateMedicalReportPDF(finalPatientName, messages, {
        patientId: targetId || undefined,
        customPatientName: finalPatientName,
        birthDate: finalBirthDate,
        cpf: finalCpf,
        emissionDate: finalEmissionDate,
        answers: patientAnswers,
        customDoctorName: finalDoctorName,
        customDoctorCrm: finalDoctorCrm,
        customDoctorSpecialty: finalDoctorSpecialty,
        customDiagnosis: finalDiagnosis,
        customRationale: finalRationale,
        customTreatmentPlan: finalTreatmentPlan,
        customMonitoring: finalMonitoring,
        reportType: medicalReportType,
        docType: isEvolutivo ? 'laudo_evolutivo' : 'laudo_inicial',
        isEvolutivo
      });
      showActionToast(isEvolutivo ? "Laudo Evolutivo baixado com sucesso!" : "Laudo Inicial baixado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao gerar laudo médico:", err);
      showActionToast(`Erro ao gerar PDF: ${err?.message || 'Tente novamente'}`);
    }
  };

  const handleSendMedicalReportToChat = async (overrideData?: {
    diagnosis: string;
    rationale: string;
    treatmentPlan: string;
    monitoring: string;
    patientName: string;
    birthDate: string;
    cpf: string;
    emissionDate: string;
    doctorName: string;
    doctorCrm: string;
    doctorSpecialty: string;
  }) => {
    const targetPatientId = currentPatient?.id || activeConsultationId || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
    if (!targetPatientId) {
      showActionToast("Nenhum paciente selecionado para envio do laudo médico.");
      return;
    }

    try {
      setIsSendingReportToChat(true);

      const qPatient = queue.find(p => p.id === targetPatientId);
      const patientAnswers = currentPatient
        ? { ...(qPatient?.answers || {}), ...(currentPatient.answers || {}) }
        : (qPatient?.answers || {});
      const isEvolutivo = medicalReportType === 'evolutivo';
      const docType = isEvolutivo ? 'laudo_evolutivo' : 'laudo_inicial';

      const pName = overrideData?.patientName || reportPatientName;
      const patientKey = getPatientReportKey(targetPatientId, pName);
      const saved = loadSavedReport(patientKey, medicalReportType, pName, targetPatientId);

      const finalPatientName = overrideData?.patientName || saved?.patientName || reportPatientName;
      const finalBirthDate = overrideData?.birthDate || saved?.birthDate || reportBirthDate;
      const finalCpf = overrideData?.cpf || saved?.cpf || reportCpf;
      const finalEmissionDate = overrideData?.emissionDate || saved?.emissionDate || reportEmissionDate;
      const finalDoctorName = overrideData?.doctorName || saved?.doctorName || reportDoctorName;
      const finalDoctorCrm = overrideData?.doctorCrm || saved?.doctorCrm || reportDoctorCrm;
      const finalDoctorSpecialty = overrideData?.doctorSpecialty || saved?.doctorSpecialty || reportDoctorSpecialty;
      const finalDiagnosis = overrideData?.diagnosis || saved?.diagnosis || reportDiagnosis;
      const finalRationale = overrideData?.rationale || saved?.rationale || reportRationale;
      const finalTreatmentPlan = overrideData?.treatmentPlan || saved?.treatmentPlan || reportTreatmentPlan;
      const finalMonitoring = overrideData?.monitoring || saved?.monitoring || reportMonitoring;

      const pdfBlob = await generateMedicalReportPDF(finalPatientName, messages, {
        patientId: targetPatientId,
        customPatientName: finalPatientName,
        birthDate: finalBirthDate,
        cpf: finalCpf,
        emissionDate: finalEmissionDate,
        answers: patientAnswers,
        customDoctorName: finalDoctorName,
        customDoctorCrm: finalDoctorCrm,
        customDoctorSpecialty: finalDoctorSpecialty,
        customDiagnosis: finalDiagnosis,
        customRationale: finalRationale,
        customTreatmentPlan: finalTreatmentPlan,
        customMonitoring: finalMonitoring,
        reportType: medicalReportType,
        docType: docType,
        isEvolutivo,
        returnBlob: true
      }) as Blob;

      let fileUrl = '';
      const cleanPatientName = (finalPatientName || 'Paciente').replace(/\s+/g, '_');
      const fileName = `${isEvolutivo ? 'Laudo_Evolutivo' : 'Laudo_Inicial'}_${cleanPatientName}.pdf`;

      if (pdfBlob) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(pdfBlob);
        });
        const base64Data = await base64Promise;
        fileUrl = base64Data;

        try {
          const upRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: fileName,
              data: base64Data,
              type: 'application/pdf'
            })
          });
          if (upRes.ok) {
            const upData = await upRes.json();
            if (upData?.url) fileUrl = upData.url;
          }
        } catch (uploadErr) {
          console.warn("Upload falhou, mantendo base64:", uploadErr);
        }
      }

      await addMessage({
        sender: 'doctor',
        type: 'medical_report',
        docType: docType,
        text: `📑 **${isEvolutivo ? 'Laudo Médico Evolutivo' : 'Laudo Médico Inicial'} Emitido**\n\nDocumento oficial assinado pelo ${reportDoctorName} (${reportDoctorCrm}) com diagnóstico, fundamentação terapêutica e plano de tratamento. O laudo clínico em PDF foi anexado para visualização e download imediato.`,
        attachment: {
          name: fileName,
          url: fileUrl || '',
          type: 'application/pdf',
          docType: docType,
          title: isEvolutivo ? 'Laudo Médico Evolutivo Oficial' : 'Laudo Médico Inicial Oficial'
        }
      }, targetPatientId);

      try {
        await updateDoc(doc(db, 'queue', targetPatientId), {
          status: 'in-consultation',
          lastMessageAt: new Date().toISOString(),
          lastMessageText: isEvolutivo ? 'Laudo Médico Evolutivo' : 'Laudo Médico Inicial',
          hasUnread: true
        });
      } catch (err) {
        console.warn("Could not update queue status:", err);
      }

      setShowMedicalReportEditorModal(false);
      showActionToast(`Laudo Médico enviado com sucesso para ${reportPatientName || 'o paciente'}!`);
    } catch (err: any) {
      console.error("Erro ao enviar laudo médico:", err);
      showActionToast(`Erro ao enviar laudo: ${err?.message || 'Tente novamente'}`);
    } finally {
      setIsSendingReportToChat(false);
    }
  };

  const handleGeneratePDF = () => {
    handleOpenPrescriptionEditor();
  };

  const handleGenerateMedicalReport = (type: 'inicial' | 'evolutivo' = 'inicial') => {
    handleOpenMedicalReportEditor(type);
  };

  const handleApplyAccessiblePlan = (
    type: 'cbd' | 'balanced' | 'thc' | 'broad_cbn' = accessibleType,
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

    if (type === 'broad_cbn') {
      prodName = 'Broad Spectrum CBD + CBN 1065mg (15ml)';
      prodDesc = 'Extrato Broad Spectrum rico em CBD e CBN (1065mg em 15ml), 0% THC. Indicado para insônia, distúrbios do sono, ansiedade e desaceleração noturna.';
      dosage = [
        'Pingar 2 gotas pela manhã e 4 a noite.',
        '- Aumentar 1 gota a cada 7 dias, sendo máximo de 10 gotas por dose.',
        '- Se obtiver melhora dos sintomas em doses mínimas não a necessidade de chegar em dose máxima.'
      ];
    } else if (type === 'balanced') {
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
    const protocolNotes = `PROTOCOLO DE ENTRADA ACESSÍVEL (FASE 1):\n- Medicamento Inicial: ${prodName} (Associação Brasileira)\n- Posologia Econômica: ${dosage.join(' ')}\n- Rendimento estimado: 45 a 60 dias.\n- Fase 2 (Evolução): Reavaliação em 30 a 45 dias para verificar resposta terapêutica e evolução progressiva se necessário.\n- Administrar com alimentos gordurosos (preferência, não obrigatório) - podendo aumentar em até 5x a absorção.\n- Se observado sonolência durante o dia após a administração do medicamento, reduzir em 1/3 a dose da manhã e à noite permanecer normal conforme a prescrição.\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos contínuos.`;

    addMessage({
      sender: 'doctor',
      type: 'prescription_notes',
      text: protocolNotes
    });

    setAddedMedications(prev => [...prev, prodName]);
    setShowAccessiblePlanModal(false);
    setAccessibleCustomMessage('');
  };

  // Neurodivergent Test Handlers for Doctor
  const handleSendDoctorAdhdToChat = async (adhdData: any) => {
    const targetPatientId = currentPatient?.id || activeConsultationId || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
    if (!targetPatientId) {
      showActionToast('Nenhum paciente selecionado para envio do teste.');
      return;
    }
    try {
      const isInvite = adhdData?.isInvite;
      const msgPayload: any = {
        text: isInvite
          ? `📋 Convite Clínico: O Dr. Guilherme solicita o preenchimento da Escala ASRS-18 (12 Perguntas) para mapeamento de TDAH.`
          : `🧠 Laudo do Teste de TDAH (ASRS-18 — 12 Domínios Neurais):\n• Correspondência: ${adhdData.scorePercent}%\n• Classificação: ${adhdData.classification}\n• Pontuação: ${adhdData.totalPoints}/${adhdData.maxPoints || 36} pontos.`,
        sender: 'doctor',
        type: 'adhd_test_card',
        adhdTestData: isInvite ? { isInvite: true, invitedAt: new Date().toISOString() } : adhdData,
      };
      await addMessage(msgPayload, targetPatientId);
      showActionToast(
        isInvite
          ? '✓ Convite da Avaliação de TDAH enviado ao chat do paciente!'
          : '✓ Resultado do Teste de TDAH anexado ao chat da consulta!'
      );
    } catch (e) {
      console.error('Erro ao enviar card de TDAH:', e);
      showActionToast('Erro ao anexar teste no chat.');
    }
  };

  const handleSendDoctorAutismToChat = async (autismData: any) => {
    const targetPatientId = currentPatient?.id || activeConsultationId || (queue.find(p => p.status === 'in-consultation' || p.status === 'waiting')?.id);
    if (!targetPatientId) {
      showActionToast('Nenhum paciente selecionado para envio do teste.');
      return;
    }
    try {
      const isInvite = autismData?.isInvite;
      const msgPayload: any = {
        text: isInvite
          ? `📋 Convite Clínico: O Dr. Guilherme solicita o preenchimento do Mapeamento Neurocomportamental para TEA / Autismo (12 Perguntas).`
          : `🧩 Mapeamento de Autismo (TEA — 12 Perguntas):\n• Correspondência: ${autismData.scorePercent}%\n• Perfil: ${autismData.targetProfile || 'Adulto'}\n• Classificação: ${autismData.classification}\n• Pontuação: ${autismData.totalPoints}/${autismData.maxPoints || 36} pontos.`,
        sender: 'doctor',
        type: 'autism_test_card',
        autismTestData: isInvite ? { isInvite: true, invitedAt: new Date().toISOString() } : autismData,
      };
      await addMessage(msgPayload, targetPatientId);
      showActionToast(
        isInvite
          ? '✓ Convite do Mapeamento de Autismo enviado ao chat do paciente!'
          : '✓ Resultado do Teste de Autismo anexado ao chat da consulta!'
      );
    } catch (e) {
      console.error('Erro ao enviar card de Autismo:', e);
      showActionToast('Erro ao anexar teste no chat.');
    }
  };

  const handleSaveDoctorTestResult = async (testType: 'adhd' | 'autism', resultData: any) => {
    const targetPatient = currentPatient || queue.find(p => p.id === activeConsultationId);
    if (!targetPatient) return;
    const testKey = testType === 'adhd' ? 'adhdTestResult' : 'autismTestResult';
    const updatedAnswers = {
      ...(targetPatient.answers || answers || {}),
      [testKey]: resultData,
    };
    const updatedPatient = {
      ...targetPatient,
      answers: updatedAnswers,
    };
    setCurrentPatient(updatedPatient);

    useStore.setState((state) => ({
      answers: updatedAnswers,
      queue: state.queue.map((p) =>
        p.id === targetPatient.id ? { ...p, answers: updatedAnswers } : p
      ),
    }));

    try {
      await setDoc(doc(db, 'queue', targetPatient.id), { answers: updatedAnswers }, { merge: true });
      await setDoc(doc(db, 'users', targetPatient.id), { answers: updatedAnswers }, { merge: true });
      fetch('/api/queue/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: targetPatient.id, answers: updatedAnswers }),
      }).catch(() => {});
    } catch (e) {
      console.warn('Could not persist test in doctor dashboard:', e);
    }
    showActionToast(`✓ Avaliação de ${testType === 'adhd' ? 'TDAH' : 'Autismo'} salva com sucesso!`);
  };

  // Real-time sync when patient finishes TDAH or Autism test in ChatScreen
  useEffect(() => {
    if (!currentPatient?.id) return;
    const qPatient = queue.find((p) => p.id === currentPatient.id);
    let latestMsgAdhd: any = null;
    let latestMsgAutism: any = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (!latestMsgAdhd && m?.type === 'adhd_test_card' && m?.adhdTestData?.scorePercent !== undefined) {
        latestMsgAdhd = m.adhdTestData;
      }
      if (!latestMsgAutism && m?.type === 'autism_test_card' && m?.autismTestData?.scorePercent !== undefined) {
        latestMsgAutism = m.autismTestData;
      }
    }

    const nextAdhd = latestMsgAdhd || qPatient?.answers?.adhdTestResult || currentPatient?.answers?.adhdTestResult;
    const nextAutism = latestMsgAutism || qPatient?.answers?.autismTestResult || currentPatient?.answers?.autismTestResult;

    const prevAdhdAt = currentPatient?.answers?.adhdTestResult?.completedAt;
    const prevAutismAt = currentPatient?.answers?.autismTestResult?.completedAt;
    const prevAdhdPct = currentPatient?.answers?.adhdTestResult?.scorePercent;
    const prevAutismPct = currentPatient?.answers?.autismTestResult?.scorePercent;

    const adhdChanged = nextAdhd && (nextAdhd.completedAt !== prevAdhdAt || nextAdhd.scorePercent !== prevAdhdPct);
    const autismChanged = nextAutism && (nextAutism.completedAt !== prevAutismAt || nextAutism.scorePercent !== prevAutismPct);

    if (adhdChanged || autismChanged) {
      const mergedAnswers = {
        ...(currentPatient.answers || {}),
        ...(qPatient?.answers || {}),
        ...(nextAdhd ? { adhdTestResult: nextAdhd } : {}),
        ...(nextAutism ? { autismTestResult: nextAutism } : {}),
      };
      setCurrentPatient((prev: any) => (prev ? { ...prev, answers: mergedAnswers } : prev));
      setShowNeuroTestsBanner(true);
    }
  }, [queue, messages, currentPatient?.id]);

  const handleGenerateAnalysis = async (
    force: boolean = false,
    selectedBrand: 'flowermed' | 'greenbudz' | 'soucannabis' | 'abrace' | 'abecmed' | 'pangaia' | 'both' = brandPreference,
    selectedNational: 'soucannabis' | 'abrace' | 'abecmed' | 'all' = nationalPreference,
    selectedImported: 'pangaia' | 'flowermed' | 'greenbudz' | 'all' = importedPreference
  ) => {
    setExpandAnalysis(true);
    if (selectedBrand !== brandPreference) {
      setBrandPreference(selectedBrand);
    }
    if (selectedNational !== nationalPreference) {
      setNationalPreference(selectedNational);
    }
    if (selectedImported !== importedPreference) {
      setImportedPreference(selectedImported);
    }
    if (analysisResult && !force && selectedBrand === brandPreference && selectedNational === nationalPreference && selectedImported === importedPreference) return;
    
    const patientAnswers = resolveCompletePatientAnswers(currentPatient?.id || null);
    
    setIsAnalyzing(true);
    if (force) setAnalysisResult(null);
    try {
      let nationalDirective = '';
      if (selectedNational === 'soucannabis' || selectedBrand === 'soucannabis') {
        nationalDirective = `ASSOCIAÇÃO NACIONAL ESCOLHIDA: **ASSOCIAÇÃO SOUCANNABIS (BRASIL — LAUDOS HPLC CERTIFICADOS)**.
Priorize estritamente formulações oficiais da ASSOCIAÇÃO SOUCANNABIS:
- Óleos Sublinguais com base MCT medicinal testados por HPLC: Óleo Lilás (1:1 THC:CBD, 6%), Óleo Azul (THC 5:1, 6%), Óleo Rosa (CBD 5:1, 6%), Óleo Laranja (CBD 1:10, 6%) e Óleo Branco (Broad Spectrum 0% THC, 6%);
- Extrações Concentradas e Resgates: Extrato Concentrado SouCannabis 60% e 80% em seringa dosadora para microdosagem, Sprays Nasais (Azul e Laranja 60 mg/mL), Pomadas Tópicas (6% e 10% 50g), Supositórios Pélvicos 1:1 e Flores in natura Associação SouCannabis 15g.`;
      } else if (selectedNational === 'abrace' || selectedBrand === 'abrace') {
        nationalDirective = `ASSOCIAÇÃO NACIONAL ESCOLHIDA: **ABRACE ESPERANÇA (ASSOCIAÇÃO BRASILEIRA DE APOIO CANNABIS ESPERANÇA — JOÃO PESSOA/PB)**.
Priorize estritamente formulações oficiais da ABRACE:
- Linha de Óleos por Cores: Óleo Laranja CBD (20 ou 30 mg/mL), Óleo Vermelho CBD Forte (50 ou 100 mg/mL), Óleo Preto THC 30 mg/mL, Óleo Azul CBD:THC 1:1 (30 mg/mL) e Óleo Roxo CBD:THC 1:1 Forte (60 mg/mL);
- Formas Farmacêuticas Especiais e Resgates: Spray Resgate THC 5 mg/mL (25 mL com absorção imediata), Gomas de CBD, THC e 1:1 (10 mg/goma, 30 un), Pomadas Full Spectrum CBD (30 mg/g) e THC (20 mg/g) em pote de 100g e Flores In Natura ABRACE 10g.`;
      } else if (selectedNational === 'abecmed' || selectedBrand === 'abecmed') {
        nationalDirective = `ASSOCIAÇÃO NACIONAL ESCOLHIDA: **ABECMED (ASSOCIAÇÃO BRASILEIRA DE ESTUDOS DA CANNABIS)**.
Priorize estritamente formulações oficiais da ABECMED:
- Óleos Full Spectrum RSO em MCT: Linha Laranja CBD (20 a 50 mg/mL), Linha Azul CBD:THC 1:1, Linha Verde THC;
- Extrações e Flores: Extração Sem Solvente ABEC rica em THC 30%-50%, Extrato Peneirado Dry Sift Full Spectrum e Inflorescências ABEC 10g ricas em THC ou CBD.`;
      } else {
        nationalDirective = `ASSOCIAÇÃO NACIONAL ESCOLHIDA: **ASSOCIAÇÕES BRASILEIRAS (SouCannabis, ABRACE e ABECMED)**. Integre opções equilibradas das principais associações brasileiras de pacientes.`;
      }

      let importedDirective = '';
      if (selectedImported === 'pangaia' || selectedBrand === 'pangaia') {
        importedDirective = `MARCA IMPORTADA ESCOLHIDA: **PANGAIA BIOPHARMACEUTICALS (EUA • ANVISA RDC 660/2022)**.
Priorize o portfólio oficial da Pangaia: Óleo CBD Full Spectrum 5%, 10% (3000 mg) e 20%, Óleo Delta-8 THC 2000 mg, Óleo CBD Isolate 3000 mg, Óleo Maná 3000 mg com Óleo de Copaíba, Pomada Táio 3375 mg com Andiroba/Copaíba, Cápsulas Softgel, Gummies Grape e Pangaia Live Rosin THC-A Solventless 1g.`;
      } else if (selectedImported === 'flowermed' || selectedBrand === 'flowermed') {
        importedDirective = `MARCA IMPORTADA ESCOLHIDA: **LINHA FLOWERMED & FLORES/EXTRAÇÕES (EUA • RDC 660)**.
Priorize opções Flowermed (Óleos CBG 3000mg, CBN 300mg + CBD 900mg, THCV, Gummies) e Flores In Natura / Extrações (Superglue THCA 14g, Glitter Bomb 14g, Forbidden Fruit D8 14g, Syringe Gelato 71,6% THCA e Gold Budder 5g).`;
      } else if (selectedImported === 'greenbudz' || selectedBrand === 'greenbudz') {
        importedDirective = `MARCA IMPORTADA ESCOLHIDA: **LINHA GREENBUDZCBD (EUA)**.
Priorize opções GreenBudzCBD (Calm Vibe Oil 6000mg, Full Balance Oil 3000mg, Drops By GreenBudz CBD+CBN, Drops By GreenBudz CBD+THC, Goma Nightshade e Isolate CBD Hemp Formula).`;
      } else {
        importedDirective = `MARCA IMPORTADA ESCOLHIDA: **CATÁLOGOS IMPORTADOS (Pangaia, Flowermed, GreenBudzCBD)**.`;
      }

      const adhdTestSummary = patientAnswers?.adhdTestResult
        ? `Realizado — Compatibilidade: ${patientAnswers.adhdTestResult.scorePercent}% (${patientAnswers.adhdTestResult.classification || 'Avaliado'}) | ASRS-18 Eq.: ${patientAnswers.adhdTestResult.asrs18EquivalentScore ?? patientAnswers.adhdTestResult.totalPoints}/72 pts | GAD-7: ${patientAnswers.adhdTestResult.gad7ComplementScore ?? '-'}/21 | PHQ-9: ${patientAnswers.adhdTestResult.phq9ComplementScore ?? '-'}/27`
        : 'Não realizado';
      const autismTestSummary = patientAnswers?.autismTestResult
        ? `Realizado (${patientAnswers.autismTestResult.targetProfile || 'Adulto'}) — Compatibilidade: ${patientAnswers.autismTestResult.scorePercent}% (${patientAnswers.autismTestResult.classification || 'Avaliado'}) | AQ-10 Eq.: ${patientAnswers.autismTestResult.aq10EquivalentScore ?? patientAnswers.autismTestResult.totalPoints}/10 pts | GAD-7: ${patientAnswers.autismTestResult.gad7ComplementScore ?? '-'}/21 | PHQ-9: ${patientAnswers.autismTestResult.phq9ComplementScore ?? '-'}/27`
        : 'Não realizado';
      const hcCalcSummary = patientAnswers?.hcPlantCalculator
        ? `Realizado — ${patientAnswers.hcPlantCalculator.annualPlants} plantas/ano (${patientAnswers.hcPlantCalculator.plantsPerCycle} plantas/ciclo, cultivo ${patientAnswers.hcPlantCalculator.cultivationType || 'indoor'}), Dose: ${patientAnswers.hcPlantCalculator.dailyDoseMg} mg/dia, Medicamentos base escolhidos: ${Array.isArray(patientAnswers.hcPlantCalculator.selectedMedications) ? patientAnswers.hcPlantCalculator.selectedMedications.map((m: any) => `${m.name} (${m.dailyUnits} ${m.unitLabel || 'un/dia'})`).join(' + ') : (patientAnswers.hcPlantCalculator.condition || 'Padrão')}`
        : 'Não realizado';

      const prompt = `
        Atue como um Especialista Sênior em Medicina Canabinoide e Prescrição Médica de Alto Nível.
        Sua missão é fornecer uma análise clínica com PRECISÃO MÁXIMA, baseada em protocolos rigorosos e literatura médica atualizada, indicando os melhores tratamentos e medicamentos à base de cannabis medicinal.
        
        FILTRO OBRIGATÓRIO DE PRESCRIÇÃO COMBINADA (1 NACIONAL + 1 IMPORTADO):
        - ${nationalDirective}
        - ${importedDirective}
        
        Dados Clínicos do Paciente (Triagem Completa + Testes Individuais):
        - Queixa Principal / Objetivos: ${patientAnswers?.objectives?.join(', ') || 'Não informados'}
        - Intensidade do Sintoma: ${patientAnswers?.intensity || 'Não informada'}/10
        - Cronicidade/Duração: ${patientAnswers?.duration || 'Não informada'}
        - Origem e Evolução do Quadro: ${patientAnswers?.diseaseOrigin || 'Não informada'}
        - História da Moléstia (Descrição): ${patientAnswers?.description || 'Não informada'}
        - Dados Biométricos: Altura ${patientAnswers?.height || 'Não informada'}m, Peso ${patientAnswers?.weight || 'Não informada'}kg, Sexo ${patientAnswers?.sex || 'Não informada'}
        - Sintomas Cognitivos e Emocionais da Triagem: Tristeza/Desânimo (${patientAnswers?.tristeza ? 'Sim' : 'Não'}), Dificuldade de Foco (${patientAnswers?.foco ? 'Sim' : 'Não'}), Queixa de Memória (${patientAnswers?.memoria ? 'Sim' : 'Não'}), Irritabilidade (${patientAnswers?.irritado ? 'Sim' : 'Não'}), Cansaço/Fadiga (${patientAnswers?.cansado ? 'Sim' : 'Não'}), Dor de Cabeça/Enxaqueca (${patientAnswers?.dor_cabeca ? 'Sim' + (patientAnswers?.dor_cabeca_details ? ': ' + patientAnswers.dor_cabeca_details : '') : 'Não'}).
        - Testes Individuais e Rastreios Neurocomportamentais Realizados pelo Paciente:
          • Teste de TDAH (Escala ASRS-18 OMS + Matriz GAD-7/PHQ-9): ${adhdTestSummary}
          • Teste de Autismo / TEA (AQ-10 Cambridge + Matriz GAD-7/PHQ-9): ${autismTestSummary}
          • Dimensionamento Calculadora Técnica HC (Autocultivo Medicinal): ${hcCalcSummary}
        - Histórico Médico e Social COMPLETO: 
          Tratamento Atual (${patientAnswers?.tratamento_atual ? 'Sim' + (patientAnswers?.tratamento_atual_details ? ': ' + patientAnswers.tratamento_atual_details : '') : 'Não'}), 
          Uso de Fármacos (${patientAnswers?.remedios ? 'Sim' + (patientAnswers?.remedios_details ? ': ' + patientAnswers.remedios_details : '') : 'Não'}), 
          Comorbidade Crônica (${patientAnswers?.doenca_cronica ? 'Sim' + (patientAnswers?.doenca_cronica_details ? ': ' + patientAnswers.doenca_cronica_details : '') : 'Não'}), 
          Cirurgia (${patientAnswers?.cirurgia ? 'Sim' + (patientAnswers?.cirurgia_details ? ': ' + patientAnswers.cirurgia_details : '') : 'Não'}), 
          Alergias (${patientAnswers?.alergia ? 'Sim' + (patientAnswers?.alergia_details ? ': ' + patientAnswers.alergia_details : '') : 'Não'}), 
          Problemas Digestivos (${patientAnswers?.digestivo ? 'Sim' + (patientAnswers?.digestivo_details ? ': ' + patientAnswers.digestivo_details : '') : 'Não'}), 
          Uso Prévio de Cannabis (${patientAnswers?.cannabis ? 'Sim' + (patientAnswers?.cannabis_details ? ': ' + patientAnswers.cannabis_details : '') : 'Não'}).
        - Psicomotor e Riscos: Dirige (${patientAnswers?.dirige ? 'Sim' + (patientAnswers?.dirige_details ? ': ' + patientAnswers.dirige_details : '') : 'Não'}), Opera Maquinário (${patientAnswers?.maquinario ? 'Sim' + (patientAnswers?.maquinario_details ? ': ' + patientAnswers.maquinario_details : '') : 'Não'}), 
          Blitz/Frequente (${patientAnswers?.blitz ? 'Sim' : 'Não'}), Laudo Psicomotor (${patientAnswers?.laudo_psicomotor ? 'Sim' : 'Não'}).
        - Cardiovascular e Saúde Mental: Arritmia (${patientAnswers?.arritmia ? 'Sim' + (patientAnswers?.arritmia_details ? ': ' + patientAnswers.arritmia_details : '') : 'Não'}), 
          Histórico Psicose/Esquizofrenia (${patientAnswers?.psicose_hist || patientAnswers?.esquizofrenia_diag || patientAnswers?.esquizofrenia_parente ? 'Sim' : 'Não'}), 
          Pânico/Ansiedade (${patientAnswers?.panico || patientAnswers?.ansiedade_diag ? 'Sim' : 'Não'}), Estresse (${patientAnswers?.estresse ? 'Sim' : 'Não'}).
        - Hábitos de Vida: Fuma (${patientAnswers?.fuma ? 'Sim' : 'Não'}), Bebida Alcoólica (${patientAnswers?.bebida ? 'Sim' : 'Não'}), 
          Atividade Física (${patientAnswers?.exercicio ? 'Sim' : 'Não'}).
        - Preferência de Fabricante / Associação Informada pelo Paciente na Triagem:
          Status: ${(patientAnswers?.preferredTreatmentStatus === 'ja_faz' || patientAnswers?.preferredTreatmentStatus === 'ja_usa') ? 'JÁ FAZ TRATAMENTO COM ESTA MARCA/ASSOCIAÇÃO' : (patientAnswers?.preferredTreatmentStatus === 'pretende_fazer' || patientAnswers?.preferredTreatmentStatus === 'pretende_usar') ? 'PRETENDE INICIAR TRATAMENTO COM ESTA MARCA/ASSOCIAÇÃO' : 'Sem preferência prévia (aberto à recomendação médica)'}.
          Fabricantes/Associações Escolhidos: ${(Array.isArray(patientAnswers?.preferredBrands) && patientAnswers.preferredBrands.length > 0) ? patientAnswers.preferredBrands.join(', ') : (patientAnswers?.preferredNationalAssociation || patientAnswers?.preferredImportedBrand || 'Nenhuma específica')}.
          Observações do Paciente sobre Marca/Óleo: ${patientAnswers?.preferredBrandNotes || 'Nenhuma'}.
        
        DIRETRIZ DE PRESCRIÇÃO E EQUIVALÊNCIA (IMPORTADOS E NACIONAIS):
        Você DEVE sugerir DUAS frentes de tratamento INDEPENDENTES E COMPLETAS para o médico prescrever e o paciente escolher:
        1. Opção de Importados (Catálogo Oficial da marca selecionada): monte um tratamento completo e equilibrado cobrindo diferentes vias farmacoterapêuticas de acordo com as queixas do paciente:
           - ÓLEO SUBLINGUAL (para homeostase basal e uso contínuo diário);
           - GOMAS / GUMMIES ou FORMA ORAL SÓLIDA (forma farmacêutica oral prática com liberação prolongada de 4 a 6 horas);
           - FLORES RICAS EM THC/THCA e/ou EXTRAÇÕES COM THC (para resgate rápido inalatório em crises álgicas, ansiedade aguda, espasmos ou indução rápida de sono sem combustão).
        2. Opção de Associações Nacionais: monte um tratamento equivalente completo com formulações padronizadas da Associação Brasileira selecionada (${selectedNational === 'abrace' ? 'ABRACE Esperança' : selectedNational === 'abecmed' ? 'ABECMED' : 'SouCannabis'}).

        REGRA OBRIGATÓRIA E INEGOCIÁVEL PARA MEDICAMENTOS NACIONAIS:
        INDEPENDENTE DA MARCA SELECIONADA PARA OS IMPORTADOS, A PRESCRIÇÃO DAS OPÇÕES NACIONAIS (ASSOCIAÇÕES BRASILEIRAS) DEVE CONTER SEMPRE A COBERTURA COMPLETA EQUIVALENTE DE 4 VIAS FARMACOLÓGICAS (ÓLEO, EXTRAÇÃO CONCENTRADA, FORMA TÓPICA E FLOR IN NATURA):
        - 1. ÓLEO (Óleo sublingual contínuo para equilíbrio e homeostase basal diária, ex: Linha SouCannabis [Óleo Lilás 1:1, Óleo Azul 5:1, Óleo Rosa 5:1], Linha ABRACE [Laranja, Vermelho, Preto, Azul ou Roxo], ou Linha ABECMED Full Spectrum RSO em MCT);
        - 2. EXTRAÇÃO CONCENTRADA DE RESGATE (Extrato Concentrado SouCannabis 60% ou 80% em Seringa Dosadora, Spray Resgate THC 5 mg/mL ABRACE, Extração Sem Solvente ABEC rica em THC 30%-50%, ou Extrato Dry Sift);
        - 3. FORMA COMPLEMENTAR TÓPICA (Pomada Tópica SouCannabis 6% ou 10% 50g, Pomada Full Rica em CBD/THC ABRACE 100g, ou Pomada ABEC Tópica Full Spectrum);
        - 4. FLORES (Flor in natura Associação SouCannabis 15g, Flores In Natura ABRACE [CBD, THC ou Balanceadas 10g], ou Inflorescências ABEC ricas em THC 15%-30% ou CBD 8%-18%).
        Desta forma, o paciente dispõe de equivalência terapêutica idêntica entre as 4 vias dos importados e as 4 formulações padronizadas das associações nacionais.

        CRITÉRIOS CLÍNICOS CRÍTICOS DE SEGURANÇA E PERSONALIZAÇÃO CASO A CASO:
        - SE o paciente tem histórico de psicose ou esquizofrenia: É ESTRITAMENTE CONTRAINDICADO o uso de formulações com THC ou THCA em doses psicoativas. Você DEVE prescrever exclusivamente formulações de Canabidiol Broad Spectrum, CBG Isolado ou flores de CBD isoladas.
        - SE o paciente dirige ou opera maquinário: produtos com THC/THCA devem ser restritos ao uso noturno (mínimo de 8h antes da direção); no período diurno, utilize formulações não-intoxicantes.
        - SE o paciente apresenta dor intensa/aguda (intensidade >= 7): considere a indicação de uma via de resgate inalatório rápido por vaporização medicinal ou Extrato Concentrado em Seringa, além do óleo contínuo.
        - SE o paciente tem queixa primária de insônia: considere produtos ricos em CBN ou formulações noturnas com THC moderado.
        - SE o paciente toma fármacos contínuos: avalie potenciais interações no citocromo P450 (CYP3A4, CYP2C19, CYP2C9) e oriente espaçamento de 2 horas.

        CATÁLOGOS DISPONÍVEIS:
        ${selectedImported === 'flowermed' || selectedImported === 'all' ? `[LINHA FLOWERMED (EUA - Padrão FDA / RDC 660)]:
        ${FLOWERMED_PRODUCTS.map(p => `- ${p.name} (${p.line}): R$ ${p.priceBRL} • ${p.activeIngredients} (${p.concentration || ''}). ${p.indications || ''}. Posologia: ${p.usageInstructions || ''}`).join('\n')}
        [LINHA FLORES IN NATURA E EXTRAÇÕES IMPORTADAS]:
        ${FLOWER_EXTRACTIONS_PRODUCTS.map(p => `- ${p.name} (${p.subLine}): R$ ${p.priceBRL} • Perfil: ${p.strainProfile} • Momento: ${p.usageMoment}. ${p.indications || ''}.`).join('\n')}` : ''}

        ${selectedImported === 'greenbudz' || selectedImported === 'all' ? `[LINHA GREENBUDZCBD (EUA)]:
        ${productCategories.flatMap(c => c.products.filter(p => p.manufacturer === 'GreenBudzCBD')).map(p => `- ${p.name} (${p.type}): R$ ${p.priceBRL}. ${p.indications || p.description || ''}`).join('\n')}` : ''}

        ${selectedImported === 'pangaia' || selectedImported === 'all' ? `[LINHA PANGAIA BIOPHARMACEUTICALS (EUA / RDC 660)]:
        ${PANGAIA_PRODUCTS.map(p => `- ${p.name} (${p.productLine || p.type}): R$ ${p.priceBRL} • ${p.concentration || ''}. ${p.indications || ''}. Posologia: ${p.posologyDetails || p.usageInstructions || ''}`).join('\n')}` : ''}

        ${selectedNational === 'soucannabis' || selectedNational === 'all' ? `[CATÁLOGO OFICIAL SOUCANNABIS (ASSOCIAÇÃO NACIONAL - HPLC)]:
        ${SOUCANNABIS_PRODUCTS.map(p => `- ${p.name} (${p.type}): ${p.concentration || ''}. ${p.indications || ''}. Modo de uso: ${p.usageInstructions || ''}`).join('\n')}` : ''}

        ${selectedNational === 'abrace' || selectedNational === 'all' ? `[CATÁLOGO OFICIAL ABRACE ESPERANÇA (ASSOCIAÇÃO NACIONAL)]:
        ${ABRACE_PRODUCTS.map(p => `- ${p.name} (${p.type}): ${p.concentration || ''}. ${p.indications || ''}. Modo de uso: ${p.prescriptionExample || p.usageInstructions || ''}`).join('\n')}` : ''}

        ${selectedNational === 'abecmed' || selectedNational === 'all' ? `[CATÁLOGO OFICIAL ABECMED (ASSOCIAÇÃO NACIONAL)]:
        ${ABECMED_PRODUCTS.map(p => `- ${p.name} (${p.type}): ${p.concentration || ''}. ${p.indications || ''}. Modo de uso: ${p.prescriptionExample || p.usageInstructions || ''}`).join('\n')}` : ''}

        REGRA RIGOROSA DE PREÇOS:
        - JAMAIS inclua valores ou preços (R$) para medicamentos de Associação Nacional. Os medicamentos de associações devem ser apresentados sem valores.
        - Valores e preços (R$) são permitidos APENAS para os medicamentos IMPORTADOS.
        
        Formato de Saída Exigido (Markdown estruturado e clínico):
        1. Diagnóstico Sindrômico e Avaliação Clínica
        2. Racional Terapêutico Fisiopatológico (Interação com o Sistema Endocanabinoide)
        3. Protocolo de Titulação e Posologia Sugerida (com foco na combinação: ${selectedNational.toUpperCase()} + ${selectedImported.toUpperCase()})
        4. Medicina Baseada em Evidências (Citações estruturadas de estudos reais)
        5. Manejo de Riscos, Contraindicações e Interações Farmacológicas
        
        6. **RESUMO DE PRESCRIÇÃO SUGERIDA** (Lista estrita com a palavra "Medicamento:" no início de cada produto):
           
           **OPÇÕES IMPORTADAS (${selectedImported === 'flowermed' ? 'LINHA FLOWERMED' : selectedImported === 'greenbudz' ? 'LINHA GREENBUDZCBD' : selectedImported === 'pangaia' ? 'LINHA PANGAIA' : 'LINHAS IMPORTADAS'}):**
           (Gere o tratamento completo utilizando os nomes fiéis do catálogo de importados acima)
           Medicamento: (Nome fiel ao catálogo)
           Indicação: (Condição primária alvo)
           Modo de Uso: (Posologia, via e titulação)
           Observações: (Dicas de administração)

           **OPÇÕES NACIONAIS (${selectedNational === 'abrace' ? 'ASSOCIAÇÃO ABRACE ESPERANÇA' : selectedNational === 'abecmed' ? 'ASSOCIAÇÃO ABECMED' : 'ASSOCIAÇÃO SOUCANNABIS'} - COBERTURA COMPLETA: ÓLEO, EXTRAÇÃO, TÓPICO E FLOR):**
           (OBRIGATÓRIO: Gerar com equivalência total os 4 medicamentos da associação nacional: 1 ÓLEO, 1 EXTRAÇÃO/SPRAY, 1 FORMA TÓPICA e 1 FLOR)
           Medicamento: (Nome do medicamento oficial da associação)
           Indicação: (Condição primária alvo e homeostase basal contínua)
           Modo de Uso: (Posologia, via sublingual e titulação gradual)
           Observações: (Orientações de administração)

        IMPORTANTE: Destaque em **negrito** todos os fármacos, diagnósticos e dosagens. NÃO USE TABELAS MARKDOWN PARA OS MEDICAMENTOS.
      `;

      let responseText = null;

      try {
        const response = await fetch('/api/analyze-clinical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, patientAnswers, brandPreference: selectedBrand, nationalPreference: selectedNational, importedPreference: selectedImported })
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
        responseText = generateClinicalAnalysisFallback(prompt, patientAnswers, selectedBrand, selectedNational, selectedImported);
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
    if (!text) return [];
    const medications: Array<{
      name: string;
      dosage: string;
      instructions: string;
      origin: 'Importado' | 'Nacional';
    }> = [];
    
    // Split into sections if present
    const importMatch = text.match(/OPÇÕES\s+IMPORTADAS[\s\S]*?(?=OPÇÕES\s+NACIONAIS|ASSOCIAÇÕES\s+BRASILEIRAS|$)/i);
    const nationalMatch = text.match(/(?:OPÇÕES\s+NACIONAIS|ASSOCIAÇÕES\s+BRASILEIRAS)[\s\S]*$/i);

    const parseSectionBlocks = (sectionText: string, defaultOrigin: 'Importado' | 'Nacional') => {
      // Try parsing table
      if (sectionText.includes('| Medicamento |') || sectionText.includes('| **Medicamento** |') || sectionText.includes('|Medicamento|')) {
        const lines = sectionText.split('\n');
        let inTable = false;
        for (let line of lines) {
          if (line.trim().startsWith('|') && line.includes('Medicamento') && line.includes('Indicação')) {
            inTable = true;
            continue;
          }
          if (inTable && line.trim().startsWith('|') && line.includes('---')) {
            continue;
          }
          if (inTable && line.trim().startsWith('|')) {
            const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
            if (cols.length >= 3) {
              const rawName = cols[0].replace(/\*\*/g, '').trim();
              const isNat = defaultOrigin === 'Nacional' || /associação|nacional|cannabis sp/i.test(rawName);
              medications.push({
                name: rawName,
                dosage: cols[2].replace(/\*\*/g, '').trim(),
                instructions: cols[3] ? cols[3].replace(/\*\*/g, '').trim() : '',
                origin: isNat ? 'Nacional' : 'Importado'
              });
            }
          } else if (inTable && !line.trim().startsWith('|')) {
            inTable = false;
          }
        }
      }

      // If no table found, parse list blocks
      const blocks = sectionText.split(/\bMedicamento\b/i);
      for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];
        const nameMatch = block.match(/.*?:\s*(.*?)(?=\bIndicação\b|\bIndicações\b|\bDoença\b|\bModo de Uso\b|\bPosologia\b|\bPosologia\/Uso\b|\bObservações\b|\bObservação Clínica\b|$)/is);
        const dosageMatch = block.match(/(?:\bModo de Uso\b|\bPosologia\b|\bPosologia\/Uso\b).*?:\s*(.*?)(?=\bIndicação\b|\bIndicações\b|\bDoença\b|\bObservações\b|\bObservação Clínica\b|$)/is);
        const instructionsMatch = block.match(/(?:\bObservações\b|\bObservação Clínica\b).*?:\s*(.*?)(?=\bIndicação\b|\bIndicações\b|\bDoença\b|\bModo de Uso\b|\bPosologia\b|\bPosologia\/Uso\b|$)/is);
        
        if (nameMatch && nameMatch[1].trim()) {
          let rawName = nameMatch[1].replace(/\*\*/g, '').replace(/^- /, '').replace(/\*$/, '').trim();
          if (rawName.length > 150) {
            rawName = rawName.substring(0, 150) + "...";
          }
          
          const isExplicitlyNat = /associação|associacao|cannabis sp 15g|associação brasileira|associação nacional|abrace|abec|soucannabis|sou cannabis/i.test(rawName);
          const isExplicitlyImp = /flowermed|greenbudz|sphera|sour lifter|lemon octane|forbidden fruit|gellato|gelato|glitter bomb|astro candy|strawpicana|superglue|zoap|trop banana|girl cookies|syringe|budder|gummies d9|nano syrup|hemp oil|broad spectrum|cbg|cbn|drops by/i.test(rawName);

          const finalOrigin: 'Importado' | 'Nacional' = isExplicitlyImp 
            ? 'Importado' 
            : (isExplicitlyNat || defaultOrigin === 'Nacional') 
              ? 'Nacional' 
              : 'Importado';

          medications.push({
            name: rawName,
            dosage: dosageMatch ? dosageMatch[1].replace(/\*\*/g, '').trim() : '',
            instructions: instructionsMatch ? instructionsMatch[1].replace(/\*\*/g, '').trim() : '',
            origin: finalOrigin
          });
        }
      }
    };

    if (importMatch && nationalMatch) {
      parseSectionBlocks(importMatch[0], 'Importado');
      parseSectionBlocks(nationalMatch[0], 'Nacional');
    } else {
      parseSectionBlocks(text, 'Importado');
    }
    
    return medications;
  };

  const buildPrescriptionItemFromMed = (med: any): PrescriptionItemData => {
    const cleanMedName = (med.name || '').toLowerCase().trim();

    // Check if explicitly an association product
    const isExplicitlyNational = 
      med.origin === 'Nacional' ||
      cleanMedName.includes('abrace') ||
      cleanMedName.includes('abec') ||
      cleanMedName.includes('abecmed') ||
      cleanMedName.includes('associação') || 
      cleanMedName.includes('associacao') || 
      cleanMedName.includes('associação nacional') ||
      cleanMedName.includes('associação brasileira') ||
      cleanMedName.includes('cannabis sp 15g') ||
      cleanMedName.includes('spray resgate thc') ||
      cleanMedName.includes('pomada full rica') ||
      cleanMedName.includes('pomada canábica terapêutica');

    // Find product across catalogs
    let foundProduct: any = null;

    // Check SouCannabis if explicitly SouCannabis or national
    if (!foundProduct && (cleanMedName.includes('soucannabis') || cleanMedName.includes('sou cannabis') || isExplicitlyNational)) {
      const isSpray = cleanMedName.includes('nasal') || cleanMedName.includes('spray');
      const isPomada = cleanMedName.includes('pomada');
      const isExtrato = cleanMedName.includes('extrato') || cleanMedName.includes('resina') || cleanMedName.includes('pasta');
      const isIntimo = cleanMedName.includes('íntimo') || cleanMedName.includes('intimo') || cleanMedName.includes('lubrificante');
      const isSupositorio = cleanMedName.includes('supositório') || cleanMedName.includes('supositorio');

      const sou = SOUCANNABIS_PRODUCTS.find(p => {
        const pLower = p.name.toLowerCase().trim();
        if (pLower === cleanMedName || cleanMedName.includes(pLower) || pLower.includes(cleanMedName)) return true;

        const pIsSpray = pLower.includes('nasal') || pLower.includes('spray');
        const pIsPomada = pLower.includes('pomada');
        const pIsExtrato = pLower.includes('extrato') || pLower.includes('resina');
        const pIsIntimo = pLower.includes('íntimo') || pLower.includes('intimo') || pLower.includes('lubrificante');
        const pIsSupositorio = pLower.includes('supositório') || pLower.includes('supositorio');

        if (isSpray && !pIsSpray) return false;
        if (isPomada && !pIsPomada) return false;
        if (isExtrato && !pIsExtrato) return false;
        if (isIntimo && !pIsIntimo) return false;
        if (isSupositorio && !pIsSupositorio) return false;

        if (isSpray && pIsSpray) {
          if (cleanMedName.includes('azul') && pLower.includes('azul')) return true;
          if (cleanMedName.includes('laranja') && pLower.includes('laranja')) return true;
          return true;
        }

        if (isPomada && pIsPomada) return true;
        if (isExtrato && pIsExtrato) return true;
        if (isIntimo && pIsIntimo) return true;
        if (isSupositorio && pIsSupositorio) return true;

        if (cleanMedName.includes('lilás') || cleanMedName.includes('lilas')) return pLower.includes('lilás');
        if (cleanMedName.includes('azul')) return pLower.includes('azul');
        if (cleanMedName.includes('rosa')) return pLower.includes('rosa');
        if (cleanMedName.includes('laranja')) return pLower.includes('laranja');
        if (cleanMedName.includes('branco')) return pLower.includes('branco');

        return false;
      });
      if (sou) {
        foundProduct = { ...sou, manufacturer: 'SouCannabis', origin: 'Nacional' };
      }
    }

    // Check ABRACE if explicitly ABRACE or national
    if (!foundProduct && (cleanMedName.includes('abrace') || isExplicitlyNational)) {
      const abrace = ABRACE_PRODUCTS.find(p => 
        p.name.toLowerCase() === cleanMedName ||
        p.name.toLowerCase().includes(cleanMedName) ||
        cleanMedName.includes(p.name.toLowerCase())
      );
      if (abrace) {
        foundProduct = { ...abrace, manufacturer: 'ABRACE', origin: 'Nacional' };
      }
    }

    // Check ABECMED if explicitly national or ABEC
    if (!foundProduct && (cleanMedName.includes('abec') || isExplicitlyNational)) {
      const abec = ABECMED_PRODUCTS.find(p => 
        p.name.toLowerCase() === cleanMedName ||
        p.name.toLowerCase().includes(cleanMedName) ||
        cleanMedName.includes(p.name.toLowerCase())
      );
      if (abec) {
        foundProduct = { ...abec, manufacturer: 'ABECMED', origin: 'Nacional' };
      }
    }

    // Check Pangaia Biopharmaceuticals if explicitly Pangaia or imported
    if (!foundProduct && (cleanMedName.includes('pangaia') || cleanMedName.includes('maná') || cleanMedName.includes('táio') || cleanMedName.includes('cooling salve') || cleanMedName.includes('relief cream') || !isExplicitlyNational)) {
      const pangaia = PANGAIA_PRODUCTS.find(p => 
        p.name.toLowerCase() === cleanMedName ||
        p.name.toLowerCase().includes(cleanMedName) ||
        cleanMedName.includes(p.name.toLowerCase())
      );
      if (pangaia) {
        foundProduct = { ...pangaia, manufacturer: 'Pangaia Biopharmaceuticals', origin: 'Importado' };
      }
    }

    // Check Flowermed and Extractions first for imported products
    if (!foundProduct && !isExplicitlyNational) {
      const fm = FLOWERMED_PRODUCTS.find(p => 
        p.name.toLowerCase() === cleanMedName ||
        p.name.toLowerCase().includes(cleanMedName) ||
        cleanMedName.includes(p.name.toLowerCase())
      );
      if (fm) {
        foundProduct = { ...fm, manufacturer: 'Flowermed (EUA)', origin: 'Importado' };
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
    }

    if (!foundProduct) {
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
    }

    const isNational = isExplicitlyNational || (foundProduct ? foundProduct.origin === 'Nacional' : med.origin === 'Nacional');

    const defaultManufacturer = cleanMedName.includes('abrace')
      ? 'ABRACE'
      : (cleanMedName.includes('abec') || cleanMedName.includes('abecmed'))
      ? 'ABECMED'
      : (cleanMedName.includes('soucannabis') || cleanMedName.includes('sou cannabis'))
      ? 'SouCannabis'
      : (cleanMedName.includes('pangaia') || cleanMedName.includes('maná') || cleanMedName.includes('táio'))
      ? 'Pangaia Biopharmaceuticals (EUA)'
      : isNational 
      ? 'Associação Brasileira' 
      : (/flowermed|sphera|gummies d9|nano syrup|broad spectrum|cbg|cbn/i.test(med.name) ? 'Flowermed (EUA)' : (/sour lifter|lemon octane|forbidden|gellato|gelato|glitter|astro|strawpicana|superglue|zoap|trop|girl cookies|syringe|budder/i.test(med.name) ? 'Importado (Folheto Especial)' : 'Pangaia Biopharmaceuticals'));

    const enriched = enrichMedicationDetails(
      foundProduct ? foundProduct.name : med.name,
      foundProduct ? foundProduct.manufacturer : defaultManufacturer,
      foundProduct ? foundProduct.origin : (isNational ? 'Nacional' : 'Importado'),
      foundProduct ? foundProduct.type : undefined,
      foundProduct
    );

    const finalPriceBRL = isNational 
      ? undefined 
      : (foundProduct?.priceBRL || (foundProduct?.priceUSD ? foundProduct.priceUSD * exchangeRate : 440.00));
    
    const finalPriceUSD = isNational 
      ? undefined 
      : (foundProduct?.priceUSD || (foundProduct?.priceBRL ? foundProduct.priceBRL / exchangeRate : 80.00));

    const isGummyMed = /goma|gumm|comest[íi]vel/i.test(foundProduct ? foundProduct.name : med.name) || /goma|gumm/i.test(foundProduct ? foundProduct.type : enriched.type || '') || /goma/i.test(enriched.pharmaceuticalForm || '');
    const isFlowerMed = /flor|in natura/i.test(foundProduct ? foundProduct.name : med.name) || /flor/i.test(foundProduct ? foundProduct.type : enriched.type || '');
    const isTopicalMed = /pomada|t[óo]pico/i.test(foundProduct ? foundProduct.name : med.name) || /pomada/i.test(foundProduct ? foundProduct.type : enriched.type || '');

    let itemDosage: string[] = Array.isArray(med.dosage) 
      ? med.dosage.filter(Boolean) 
      : (med.dosage ? [med.dosage] : []);

    if (itemDosage.length === 0) {
      if (isGummyMed) {
        itemDosage = ['Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral). Mastigar bem antes de engolir.'];
      } else if (isFlowerMed) {
        itemDosage = ['Utilizar em vaporizador térmico medicinal a 170°C a 195°C para resgate agudo. Não fumar.'];
      } else if (isTopicalMed) {
        itemDosage = ['Aplicar quantidade suficiente na região afetada 2 a 3 vezes ao dia, massageando suavemente.'];
      } else {
        itemDosage = [enriched.usageInstructions || 'Tomar conforme orientação médica.'];
      }
    } else {
      if (isGummyMed) {
        itemDosage = itemDosage.map((line: string) => {
          if (/sublingual|gota|pingar/i.test(line)) {
            return 'Mastigar 1/2 a 1 goma ao final da tarde ou 1 hora antes de dormir (via oral). Não engolir inteira.';
          }
          return line;
        });
      }
    }

    let finalRoute = enriched.administrationRoute;
    let finalForm = enriched.pharmaceuticalForm;
    let finalQty = enriched.quantity;

    if (isGummyMed) {
      finalRoute = 'Via Oral';
      finalForm = 'Gomas Mastigáveis Veganas';
      finalQty = finalQty && !/frasco/i.test(finalQty) ? finalQty : '01 Pote com 20 a 30 gomas';
    } else if (isFlowerMed) {
      finalRoute = 'Via Inalatória (Vaporização Medicinal)';
    } else if (isTopicalMed) {
      finalRoute = 'Uso Tópico';
    }

    const newItem: PrescriptionItemData = {
      name: foundProduct ? foundProduct.name : med.name,
      sourceMedName: med.name,
      brand: isNational ? 'Associação Nacional' : (foundProduct?.manufacturer || defaultManufacturer),
      origin: isNational ? 'Nacional' : 'Importado',
      type: foundProduct ? foundProduct.type : enriched.type,
      activeIngredients: enriched.activeIngredients,
      concentration: enriched.concentration,
      pharmaceuticalForm: finalForm,
      quantity: finalQty,
      administrationRoute: finalRoute,
      details: foundProduct && foundProduct.details ? foundProduct.details : [med.dosage, med.instructions, enriched.activeIngredients].filter(Boolean),
      dosage: itemDosage,
      description: foundProduct && foundProduct.description ? foundProduct.description : (med.instructions || enriched.description),
      image: foundProduct && foundProduct.image ? foundProduct.image : (isNational ? "https://images.unsplash.com/photo-1603903597871-3312c9ba4c81?q=80&w=400&auto=format&fit=crop" : "https://images.unsplash.com/photo-1611078696894-681f215e9858?q=80&w=400&auto=format&fit=crop"),
      priceUSD: finalPriceUSD,
      priceBRL: finalPriceBRL
    };

    return newItem;
  };

  const doesNameMatchMed = (candidateName: string, medName: string, mappedName?: string): boolean => {
    const cClean = (candidateName || '').toLowerCase().trim();
    const mClean = (medName || '').toLowerCase().trim();
    const mapClean = (mappedName || '').toLowerCase().trim();
    if (!cClean || !mClean) return false;

    if (cClean === mClean || cClean.includes(mClean) || mClean.includes(cClean)) return true;
    if (mapClean && (cClean === mapClean || cClean.includes(mapClean) || mapClean.includes(cClean))) return true;

    const mIsSou = mClean.includes('soucannabis') || mClean.includes('sou cannabis');
    const cIsSou = cClean.includes('soucannabis') || cClean.includes('sou cannabis');
    if (mIsSou && cIsSou) {
      if (mClean.includes('pomada') && cClean.includes('pomada')) return true;
      if ((mClean.includes('nasal') || mClean.includes('spray')) && (cClean.includes('nasal') || cClean.includes('spray'))) {
        if (mClean.includes('azul') && cClean.includes('laranja')) return false;
        if (mClean.includes('laranja') && cClean.includes('azul')) return false;
        return true;
      }
      if ((mClean.includes('lilás') || mClean.includes('lilas')) && (cClean.includes('lilás') || cClean.includes('lilas'))) return true;
      if (mClean.includes('extrato') && cClean.includes('extrato')) return true;
      if ((mClean.includes('supositório') || mClean.includes('supositorio')) && (cClean.includes('supositório') || cClean.includes('supositorio'))) return true;
    }

    const mIsAbrace = mClean.includes('abrace');
    const cIsAbrace = cClean.includes('abrace');
    if (mIsAbrace && cIsAbrace) {
      if (mClean.includes('resgate') && cClean.includes('resgate')) return true;
      if (mClean.includes('pomada') && cClean.includes('pomada')) return true;
    }

    const mIsPangaia = mClean.includes('pangaia') || mClean.includes('táio') || mClean.includes('taio') || mClean.includes('maná') || mClean.includes('mana');
    const cIsPangaia = cClean.includes('pangaia') || cClean.includes('táio') || cClean.includes('taio') || cClean.includes('maná') || cClean.includes('mana');
    if (mIsPangaia && cIsPangaia) {
      if (mClean.includes('rosin') && cClean.includes('rosin')) return true;
      if ((mClean.includes('táio') || mClean.includes('taio')) && (cClean.includes('táio') || cClean.includes('taio'))) return true;
      if ((mClean.includes('maná') || mClean.includes('mana')) && (cClean.includes('maná') || cClean.includes('mana'))) return true;
    }

    return false;
  };

  const doesPrescriptionItemMatchMed = (p: PrescriptionItemData, med: any, mappedName?: string): boolean => {
    if (!p || !med || !med.name) return false;
    const mClean = med.name.toLowerCase().trim();
    if (p.sourceMedName && p.sourceMedName.toLowerCase().trim() === mClean) return true;
    return doesNameMatchMed(p.name, med.name, mappedName);
  };

  const isMedicationAdded = (med: any) => {
    if (!med || !med.name) return false;
    const mappedItem = buildPrescriptionItemFromMed(med);
    const mappedName = mappedItem.name;
    if (addedMedications.some(a => doesNameMatchMed(a, med.name, mappedName))) return true;
    return prescItems.some(p => doesPrescriptionItemMatchMed(p, med, mappedName));
  };

  const removePrescribedMedication = async (med: any) => {
    if (!med || !med.name) return;
    const mappedItem = buildPrescriptionItemFromMed(med);
    const mappedName = mappedItem.name;
    const currentList = [...prescItemsRef.current];

    const updatedList = currentList.filter(p => !doesPrescriptionItemMatchMed(p, med, mappedName));

    setPrescItems(updatedList);
    setAddedMedications(prev => prev.filter(name => !doesNameMatchMed(name, med.name, mappedName)));

    await handleSavePrescription({
      patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
      birthDate: prescBirthDate || currentPatient?.birthDate || userBirthDate || 'Não informada',
      cpf: prescCpf || currentPatient?.cpf || userCpf || 'Não informado',
      emissionDate: prescEmissionDate || format(new Date(), 'dd/MM/yyyy'),
      doctorName: prescDoctorName || 'Dr. Guilherme Taveira Dias',
      doctorCrm: prescDoctorCrm || 'CRM/MT 17259',
      doctorSpecialty: prescDoctorSpecialty || 'Clínico Geral • Medicina Canabinoide',
      items: updatedList,
      notes: prescNotes
    });

    showActionToast(`✕ "${med.name}" removido da receita.`);
  };

  const addPrescribedMedication = async (med: any) => {
    const newItem = buildPrescriptionItemFromMed(med);
    const currentList = [...prescItemsRef.current];

    const existsIndex = currentList.findIndex(p => doesPrescriptionItemMatchMed(p, med, newItem.name));
    const updatedList = existsIndex >= 0
      ? currentList.map((p, idx) => idx === existsIndex ? newItem : p)
      : [...currentList, newItem];

    setPrescItems(updatedList);
    setAddedMedications(prev => {
      const set = new Set([...prev, med.name, newItem.name].filter(Boolean));
      return Array.from(set);
    });

    await handleSavePrescription({
      patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
      birthDate: prescBirthDate || currentPatient?.birthDate || userBirthDate || 'Não informada',
      cpf: prescCpf || currentPatient?.cpf || userCpf || 'Não informado',
      emissionDate: prescEmissionDate || format(new Date(), 'dd/MM/yyyy'),
      doctorName: prescDoctorName || 'Dr. Guilherme Taveira Dias',
      doctorCrm: prescDoctorCrm || 'CRM/MT 17259',
      doctorSpecialty: prescDoctorSpecialty || 'Clínico Geral • Medicina Canabinoide',
      items: updatedList,
      notes: prescNotes
    });

    showActionToast(`✓ "${med.name}" adicionado à receita e salvo!`);
  };

  const togglePrescribedMedication = async (med: any) => {
    if (isMedicationAdded(med)) {
      await removePrescribedMedication(med);
    } else {
      await addPrescribedMedication(med);
    }
  };

  const removeMultiplePrescribedMedications = async (meds: any[]) => {
    if (!meds || meds.length === 0) return;

    const mappedPairs = meds.filter(m => m && m.name).map(m => ({
      med: m,
      mappedName: buildPrescriptionItemFromMed(m).name
    }));

    const currentList = [...prescItemsRef.current];
    const updatedList = currentList.filter(p =>
      !mappedPairs.some(({ med, mappedName }) => doesPrescriptionItemMatchMed(p, med, mappedName))
    );

    setPrescItems(updatedList);
    setAddedMedications(prev =>
      prev.filter(name => !mappedPairs.some(({ med, mappedName }) => doesNameMatchMed(name, med.name, mappedName)))
    );

    await handleSavePrescription({
      patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
      birthDate: prescBirthDate || currentPatient?.birthDate || userBirthDate || 'Não informada',
      cpf: prescCpf || currentPatient?.cpf || userCpf || 'Não informado',
      emissionDate: prescEmissionDate || format(new Date(), 'dd/MM/yyyy'),
      doctorName: prescDoctorName || 'Dr. Guilherme Taveira Dias',
      doctorCrm: prescDoctorCrm || 'CRM/MT 17259',
      doctorSpecialty: prescDoctorSpecialty || 'Clínico Geral • Medicina Canabinoide',
      items: updatedList,
      notes: prescNotes
    });

    showActionToast(`✕ ${meds.length} medicamento(s) removido(s) da receita.`);
  };

  const addMultiplePrescribedMedications = async (meds: any[]) => {
    if (!meds || meds.length === 0) return;

    const currentList = [...prescItemsRef.current];

    const newNames: string[] = [];
    meds.forEach(med => {
      const newItem = buildPrescriptionItemFromMed(med);
      newNames.push(med.name);
      newNames.push(newItem.name);
      const existsIndex = currentList.findIndex(p => doesPrescriptionItemMatchMed(p, med, newItem.name));
      if (existsIndex >= 0) {
        currentList[existsIndex] = newItem;
      } else {
        currentList.push(newItem);
      }
    });

    setPrescItems(currentList);
    setAddedMedications(prev => {
      const set = new Set([...prev, ...newNames].filter(Boolean));
      return Array.from(set);
    });

    await handleSavePrescription({
      patientName: prescPatientName || currentPatient?.patientName || userName || 'Paciente',
      birthDate: prescBirthDate || currentPatient?.birthDate || userBirthDate || 'Não informada',
      cpf: prescCpf || currentPatient?.cpf || userCpf || 'Não informado',
      emissionDate: prescEmissionDate || format(new Date(), 'dd/MM/yyyy'),
      doctorName: prescDoctorName || 'Dr. Guilherme Taveira Dias',
      doctorCrm: prescDoctorCrm || 'CRM/MT 17259',
      doctorSpecialty: prescDoctorSpecialty || 'Clínico Geral • Medicina Canabinoide',
      items: currentList,
      notes: prescNotes
    });

    showActionToast(`✓ ${meds.length} medicamento(s) adicionados à receita e salvos!`);
  };

  const toggleMultiplePrescribedMedications = async (meds: any[]) => {
    if (!meds || meds.length === 0) return;
    const allAdded = meds.every(m => isMedicationAdded(m));
    if (allAdded) {
      await removeMultiplePrescribedMedications(meds);
    } else {
      await addMultiplePrescribedMedications(meds);
    }
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
          <button 
            type="button"
            onClick={() => setIsStandaloneDocModalOpen(true)}
            className="p-3 rounded-xl transition-all relative group text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-95"
            title="Emitir Receitas ou Laudos Avulsos (Sem Consulta)"
          >
            <FilePlus2 className="w-6 h-6 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            <div className="absolute bottom-full mb-2 md:bottom-auto md:mb-0 md:left-full md:ml-4 px-2.5 py-1.5 bg-[#0D0D15] border border-emerald-500/40 rounded-lg text-xs font-semibold text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-1.5">
              <FilePlus2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Receitas e Laudos Avulsos</span>
            </div>
          </button>
          <button 
            type="button"
            onClick={() => setIsPsychologistAuthModalOpen(true)}
            className="p-3 rounded-xl transition-all relative group text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)] active:scale-95 cursor-pointer"
            title="Ir para Área do Psicólogo (Marco Antônio Boastik - CRP 08/49215)"
          >
            <BrainCircuit className="w-6 h-6 text-purple-400" />
            {queue.filter(p => (p as any).queueType === 'psychologist' || (p as any).plan === 'psychologist' || (p as any).selectedOffer === 'psychologist').length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse" />
            )}
            <div className="absolute bottom-full mb-2 md:bottom-auto md:mb-0 md:left-full md:ml-4 px-2.5 py-1.5 bg-[#0D0D15] border border-purple-500/40 rounded-lg text-xs font-semibold text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              <span>Área do Psicólogo (Marco Antônio)</span>
            </div>
          </button>
        </nav>

        <div className="flex md:flex-col gap-2 md:gap-4 items-center">
          <button className="p-3 rounded-xl text-mecura-silver hover:text-white hover:bg-white/5 transition-colors hidden md:block">
            <Settings className="w-6 h-6" />
          </button>
          <button 
            type="button"
            onClick={async () => {
              try {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_logged_out', 'true');
                  localStorage.removeItem('mecura_patientId');
                  localStorage.removeItem('patient_id');
                  localStorage.removeItem('mecura_pagamento');
                  localStorage.removeItem('mecura_premium');
                  localStorage.removeItem('mecura_consultation_active');
                  localStorage.removeItem('mecura_queue_display_pos');
                  localStorage.removeItem('mecura_queue_entered_at');
                  localStorage.removeItem('mecura_queue_notified_10m');
                }
                useStore.getState().reset();
                await auth.signOut();
              } catch (err) {
                console.error("Erro ao deslogar médico:", err);
              }
              window.location.href = '/';
            }}
            className="p-3 rounded-xl text-mecura-silver hover:text-white hover:bg-white/5 transition-colors relative group cursor-pointer active:scale-95"
          >
            <LogOut className="w-6 h-6" />
            <div className="absolute bottom-full mb-2 md:bottom-auto md:mb-0 md:left-full md:ml-4 px-2 py-1 bg-mecura-surface border border-mecura-elevated rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Sair
            </div>
          </button>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-mecura-surface-light overflow-hidden border border-mecura-elevated hidden md:block">
            <img src="/doctor-avatar.png" alt="Doctor" className="w-full h-full object-cover shrink-0 aspect-square" />
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
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">Fila de Atendimento</h2>
                    <span className="text-[11px] bg-mecura-neon/15 border border-mecura-neon/30 text-mecura-neon font-bold px-2 py-0.5 rounded-full">
                      {queue.filter(p => p.status === 'waiting' && (p.id?.startsWith('sample_patient_') || (p as any).queueType === 'doctor' || (p as any).inQueue === true || !!((p as any).pagamento_consulta === true || (p as any).hasPaid === true || (p as any).isPaid === true))).length} aguardando
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      subscribeToQueue();
                      showActionToast("Fila sincronizada com sucesso!");
                    }}
                    className="p-1.5 rounded-lg bg-mecura-surface border border-mecura-elevated hover:bg-mecura-surface-light text-mecura-silver hover:text-white transition-colors flex items-center gap-1 text-xs"
                    title="Atualizar e Sincronizar Fila"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-mecura-neon" />
                    <span className="hidden sm:inline text-[11px]">Sincronizar</span>
                  </button>
                </div>

                {/* Botão de Documentos Avulsos (Sem Consulta) */}
                <button
                  type="button"
                  onClick={() => setIsStandaloneDocModalOpen(true)}
                  className="w-full mb-3 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/10 hover:from-emerald-500/25 hover:to-teal-500/20 border border-emerald-500/35 hover:border-emerald-400 text-white font-medium text-xs flex items-center justify-between group transition-all shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <FilePlus2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold block text-emerald-300">Receita ou Laudo Avulso</span>
                      <span className="text-[10px] text-mecura-silver block -mt-0.5">Sem precisar abrir consulta</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    + Emitir
                  </span>
                </button>

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
                    onClick={() => setQueueFilter('waiting')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${queueFilter === 'waiting' ? 'bg-mecura-neon text-black font-bold' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}`}
                  >
                    <span>Aguardando</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${queueFilter === 'waiting' ? 'bg-black/20 text-black font-bold' : 'bg-mecura-neon/20 text-mecura-neon font-bold'}`}>
                      {doctorQueue.filter(p => p.status === 'waiting' && (p.id?.startsWith('sample_patient_') || (p as any).queueType === 'doctor' || (p as any).inQueue === true || !!((p as any).pagamento_consulta === true || (p as any).hasPaid === true || (p as any).isPaid === true))).length}
                    </span>
                  </button>
                  <button 
                    onClick={() => setQueueFilter('in-consultation')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${queueFilter === 'in-consultation' ? 'bg-mecura-neon text-black font-bold' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}`}
                  >
                    <span>Em Atendimento</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${queueFilter === 'in-consultation' ? 'bg-black/20 text-black font-bold' : 'bg-blue-500/20 text-blue-400 font-bold'}`}>
                      {doctorQueue.filter(p => p.status === 'in-consultation').length}
                    </span>
                  </button>
                  <button 
                    onClick={() => setQueueFilter('finished')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${queueFilter === 'finished' ? 'bg-mecura-neon text-black font-bold' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}`}
                  >
                    <span>Concluído</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-mecura-silver">
                      {doctorQueue.filter(p => p.status === 'finished').length}
                    </span>
                  </button>
                  <button 
                    onClick={() => setQueueFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${queueFilter === 'all' ? 'bg-mecura-neon text-black font-bold' : 'bg-mecura-surface border border-mecura-elevated text-mecura-silver hover:text-white'}`}
                  >
                    Todos ({doctorQueue.length})
                  </button>
                </div>

                {/* Filtro Específico por Plano (VIP x Essencial) */}
                {(() => {
                  const vipCount = doctorQueue.filter(p => !!(p.isPremium || p.plan === 'premium' || (p as any).selectedOffer === 'premium' || p.answers?.isPremium || (p as any).pagamento_premium)).length;
                  const basicCount = doctorQueue.length - vipCount;

                  return (
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-mecura-elevated/40">
                      <span className="text-[10px] uppercase font-bold text-mecura-silver/70 mr-0.5">Plano:</span>
                      <button 
                        onClick={() => setQueuePlanFilter('all')}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${queuePlanFilter === 'all' ? 'bg-white/15 text-white border border-white/30' : 'text-mecura-silver hover:text-white'}`}
                      >
                        Todos ({doctorQueue.length})
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
          {doctorQueue.filter(p => {
            const matchesStatus = queueFilter === 'all' ? true : p.status === queueFilter;
            const pName = (p.patientName || (p as any).name || '').toLowerCase();
            const matchesSearch = pName.includes((queueSearchTerm || '').toLowerCase());
            const isPrem = !!(p.isPremium || p.plan === 'premium' || (p as any).selectedOffer === 'premium' || p.answers?.isPremium || (p as any).pagamento_premium);
            const matchesPlan = queuePlanFilter === 'all' ? true : queuePlanFilter === 'premium' ? isPrem : !isPrem;
            const isPaid = p.id?.startsWith('sample_patient_') || (p as any).queueType === 'doctor' || (p as any).inQueue === true || !!((p as any).pagamento_consulta === true || (p as any).hasPaid === true || (p as any).isPaid === true);
            return matchesStatus && matchesSearch && matchesPlan && (p.status !== 'waiting' || isPaid);
          }).length > 0 ? (
            [...doctorQueue].filter(p => {
              const matchesStatus = queueFilter === 'all' ? true : p.status === queueFilter;
              const pName = (p.patientName || (p as any).name || '').toLowerCase();
              const matchesSearch = pName.includes((queueSearchTerm || '').toLowerCase());
              const isPrem = isPatientVip(p);
              const matchesPlan = queuePlanFilter === 'all' ? true : queuePlanFilter === 'premium' ? isPrem : !isPrem;
              const isPaid = p.id?.startsWith('sample_patient_') || (p as any).queueType === 'doctor' || (p as any).inQueue === true || !!((p as any).pagamento_consulta === true || (p as any).hasPaid === true || (p as any).isPaid === true);
              return matchesStatus && matchesSearch && matchesPlan && (p.status !== 'waiting' || isPaid);
            }).sort((a, b) => {
              // 1. Unread messages first
              if (a.hasUnread && !b.hasUnread) return -1;
              if (!a.hasUnread && b.hasUnread) return 1;
              
              // 2. Status priority (in-consultation > waiting > finished)
              const statusWeight = { 'in-consultation': 0, 'waiting': 1, 'finished': 2 };
              const weightA = statusWeight[a.status as keyof typeof statusWeight] ?? 3;
              const weightB = statusWeight[b.status as keyof typeof statusWeight] ?? 3;
              if (weightA !== weightB) return weightA - weightB;

              // 2.5 Priority for VIP / Premium patients in waiting queue
              if (a.status === 'waiting' && b.status === 'waiting') {
                const isPremA = isPatientVip(a);
                const isPremB = isPatientVip(b);
                if (isPremA !== isPremB) {
                  return isPremA ? -1 : 1; // VIP comes first!
                }
              }

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
              const isPremiumPatient = isPatientVip(patient);

              return (
              <div 
                key={`${patient.id || 'patient'}-${idx}`} 
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
                    <h3 className={`font-semibold text-base ${patient.hasUnread ? 'text-white' : 'text-mecura-pearl'}`}>{patient.patientName || (patient as any).name || 'Paciente'}</h3>
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

                    {/* Símbolo do Plano Pago pelo Paciente (Clique para alternar) */}
                    {renderPatientPlanBadge(patient, true)}
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
                {(() => {
                  const pAns = patient.answers || {};
                  const pBrands: string[] = Array.isArray(pAns.preferredBrands) ? pAns.preferredBrands : [];
                  const statusLabel = (pAns.preferredTreatmentStatus === 'ja_faz' || pAns.preferredTreatmentStatus === 'ja_usa')
                    ? 'Já trata com:'
                    : (pAns.preferredTreatmentStatus === 'pretende_fazer' || pAns.preferredTreatmentStatus === 'pretende_usar')
                      ? 'Pretende:'
                      : 'Preferência:';
                  const fallbackBrand = pAns.preferredNationalAssociation || pAns.preferredImportedBrand;
                  const displayBrands = pBrands.length > 0 ? pBrands.join(', ') : fallbackBrand;
                  if (!displayBrands && pAns.preferredTreatmentStatus !== 'sem_preferencia') return null;
                  return (
                    <div className="mb-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 truncate max-w-full">
                        {displayBrands ? `🏷️ ${statusLabel} ${displayBrands}` : '🏷️ Aberto a indicação de marca'}
                      </span>
                    </div>
                  );
                })()}
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
                    <button 
                      onClick={(e) => handleRemoveFromQueue(patient, e)}
                      className="text-[10px] bg-red-500/10 border border-red-500/25 px-2 py-1.5 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-white transition-colors"
                      title="Tirar paciente da fila de atendimento"
                    >
                      Tirar da fila
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const pId = patient.id;
                        const pName = patient.patientName || (patient as any).name || 'Paciente';
                        
                        try {
                          await transferPatientQueue(pId, 'psychologist');
                          showActionToast(`✓ Paciente ${pName} enviado para a fila do Psicólogo!`);
                          if (currentPatient && currentPatient.id === pId) {
                            setCurrentPatient(null);
                          }
                        } catch (err) {
                          console.error("Erro ao transferir para psicólogo:", err);
                        }
                      }}
                      className="text-[10px] bg-purple-500/20 border border-purple-500/40 px-2.5 py-1.5 rounded-lg text-purple-200 hover:bg-purple-500/40 hover:text-white transition-all flex items-center gap-1 font-bold shadow-sm active:scale-95 cursor-pointer"
                      title="Mandar paciente para a fila do Psicólogo"
                    >
                      <Brain className="w-3 h-3 text-purple-300" />
                      <span>P/ Psicólogo</span>
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
              onClick={() => { handleOpenPrescriptionEditor(); }}
              className="w-full p-4 bg-mecura-surface border border-mecura-neon/30 rounded-2xl flex items-center gap-4 text-left hover:border-mecura-neon transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 flex items-center justify-center text-mecura-neon flex-shrink-0">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Prescrever Medicamento</h4>
                <p className="text-xs text-mecura-silver">Abrir Editor Estruturado com Composição e Posologia</p>
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
              onClick={() => setIsStandaloneDocModalOpen(true)}
              className="w-full p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-4 text-left hover:border-emerald-500/60 hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] active:scale-[0.99]"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <FilePlus2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-emerald-400 font-bold text-base flex items-center gap-2">
                  <span>Receitas e Laudos Avulsos</span>
                  <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Sem consulta</span>
                </h4>
                <p className="text-xs text-emerald-300/80">Emitir ou alterar prescrições e laudos padrão sem precisar abrir a fila de atendimento.</p>
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
                    {renderPatientPlanBadge(currentPatient, false)}
                  </div>
                  <p className="text-[10px] md:text-xs text-mecura-silver font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-mecura-neon shadow-[0_0_8px_rgba(166,255,0,0.5)]" /> Online agora
                  </p>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto md:overflow-visible md:flex-wrap pb-1 md:pb-0 items-center md:justify-end">
                {/* Botão Mandar para Fila do Psicólogo */}
                <button
                  onClick={async () => {
                    const targetPatient = currentPatient || queue.find(p => p.status === 'waiting');
                    if (targetPatient) {
                      const pName = targetPatient.patientName || (targetPatient as any).name || 'Paciente';
                      await transferPatientQueue(targetPatient.id, 'psychologist');
                      showActionToast(`✓ Paciente ${pName} encaminhado para a fila do Psicólogo! O chat permanece liberado para ambos os profissionais.`);
                    } else {
                      showActionToast('Nenhum paciente selecionado ou aguardando.');
                    }
                  }}
                  title="Mandar paciente para a fila do Psicólogo"
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-purple-600/20 hover:bg-purple-600/35 text-purple-200 border border-purple-500/40 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Brain className="w-4 h-4 text-purple-300" />
                  <span className="hidden md:inline">Mandar p/ Fila Psicólogo</span>
                  <span className="md:hidden">P/ Psicólogo</span>
                </button>

                {/* Botão Ir para Área do Psicólogo (Marco Antônio) */}
                <button
                  type="button"
                  onClick={() => setIsPsychologistAuthModalOpen(true)}
                  title="Ir para Área do Psicólogo (Marco Antônio - CRP 08/49215) - Requer Senha"
                  className="px-2.5 md:px-3.5 py-2 md:py-2.5 bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border border-purple-500/35 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden lg:inline">Painel Psicólogo</span>
                  <span className="lg:hidden">Psicólogo</span>
                </button>

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
                    const targetPatient = currentPatient || queue.find(p => p.status === 'waiting') || queue[0];
                    if (targetPatient) {
                      try {
                        // Immediately update local store queue so patient leaves 'waiting' queue
                        useStore.setState((state) => ({
                          queue: state.queue.map(p => p.id === targetPatient.id ? { ...p, status: 'in-consultation', hasUnread: false } : p)
                        }));

                        // 1. Definitively set status to 'in-consultation' in Firestore
                        await updateDoc(doc(db, 'queue', targetPatient.id), {
                          status: 'in-consultation',
                          isAlerted: Date.now(),
                          hasUnread: false
                        }).catch(async () => {
                          await setDoc(doc(db, 'queue', targetPatient.id), {
                            ...targetPatient,
                            status: 'in-consultation',
                            isAlerted: Date.now()
                          }, { merge: true });
                        });

                        await setDoc(doc(db, 'users', targetPatient.id), {
                          inQueue: false,
                          consultationStatus: 'in-consultation',
                          consultationActive: true,
                          lastUpdated: new Date().toISOString()
                        }, { merge: true }).catch(() => {});

                        fetch('/api/queue/update-status', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ patientId: targetPatient.id, status: 'in-consultation', hasUnread: false })
                        }).catch(() => {});

                        // 2. Start consultation locally and subscribe
                        startConsultation(targetPatient.id);
                        subscribeToMessages(targetPatient.id);
                        if (!currentPatient || currentPatient.id !== targetPatient.id) {
                          handleStartConsultation(targetPatient);
                        }

                        // 3. Send Background Push Notification (if they have app closed)
                        triggerBackgroundPush(
                          targetPatient.id,
                          'Sua vez chegou!',
                          'O médico está te chamando no consultório agora. Clique para abrir.',
                          '/chat'
                        ).catch(() => {});
                        
                        // 4. Send an automated chat message that will trigger their UI
                        await addMessage({
                          text: "🔔 SUA VEZ CHEGOU! O médico está te chamando no consultório agora.",
                          sender: 'doctor',
                          type: 'text'
                        }, targetPatient.id);

                        showActionToast(`Chamada enviada para ${targetPatient.patientName || 'o paciente'}! Paciente puxado para consulta.`);
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
                  onClick={() => handleOpenPrescriptionEditor()}
                  className="px-3 md:px-5 py-2 md:py-2.5 bg-mecura-neon text-black rounded-xl text-xs md:text-sm font-bold hover:bg-[#b5ff33] transition-colors flex items-center gap-1 md:gap-2 shadow-[0_0_20px_rgba(166,255,0,0.15)] whitespace-nowrap"
                  title="Prescrever Medicamentos (Editor Estruturado)"
                >
                  <PlusCircle className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Prescrever</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleOpenProgrammedForPatient(currentPatient)}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-purple-600/25 via-indigo-600/25 to-purple-600/25 border border-purple-400/50 text-purple-200 hover:text-white hover:border-purple-300 hover:bg-purple-600/40 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1 md:gap-2 shadow-[0_0_15px_rgba(168,85,247,0.25)] whitespace-nowrap active:scale-95 cursor-pointer"
                  title="Receitas Programadas: Perfis Rápidos de Ansiedade, Insônia, Depressão e Dor Crônica"
                >
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-300" />
                  <span className="hidden md:inline">Receitas Programadas</span><span className="md:hidden">Programadas</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsStandaloneDocModalOpen(true)}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-emerald-500/30 hover:border-emerald-400 hover:text-white transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-95"
                  title="Emitir Receitas ou Laudos Avulsos (Sem necessidade de consultar ou alterar a fila)"
                >
                  <FilePlus2 className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" /> <span className="hidden lg:inline">Receita/Laudo Avulso</span><span className="lg:hidden">Avulso</span>
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
                  type="button"
                  onClick={() => {
                    const model = getDoctorCustomModel();
                    handleApplyProgrammedFromDashboard(model, 'replace', currentPatient);
                  }}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 hover:from-amber-500/35 hover:to-yellow-500/30 text-amber-200 hover:text-white border border-amber-400/40 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95 cursor-pointer"
                  title="Aplicar seu Modelo Salvo Padrão (Óleo Predominante CBD 100mg/ml + Broad Spectrum CBD+CBN 1065mg)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden md:inline">⭐ Modelo Salvo</span>
                  <span className="md:hidden">⭐ Modelo</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setProgrammedTargetPatient(currentPatient);
                    setShowProgrammedPrescriptionModal(true);
                  }}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-purple-600/25 via-indigo-600/25 to-purple-600/25 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 hover:text-white border border-purple-500/40 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(168,85,247,0.2)] active:scale-95 cursor-pointer"
                  title="Abrir Perfis de Receitas Programadas Prontas (Ansiedade, Insônia, Depressão, etc.)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden md:inline">Receitas Programadas</span>
                  <span className="md:hidden">Programadas</span>
                </button>
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
                  className="px-3 md:px-5 py-2 md:py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs md:text-sm font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap"
                  title="Concluir consulta médica com sucesso"
                >
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Finalizar</span>
                </button>
                {/* Botão Testes TDAH & TEA */}
                <button 
                  type="button"
                  onClick={() => setShowNeuroTestsBanner(!showNeuroTestsBanner)}
                  className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-sm active:scale-95 cursor-pointer ${
                    showNeuroTestsBanner
                      ? 'bg-sky-500 text-black shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                      : 'bg-sky-500/15 border border-sky-400/40 text-sky-200 hover:bg-sky-500/25'
                  }`}
                  title="Mapeamento Neurodivergente do Paciente (TDAH & Autismo TEA)"
                >
                  <Brain className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-300" />
                  <span className="hidden md:inline">Testes TDAH & TEA</span>
                  <span className="md:hidden">TDAH/TEA</span>
                  {((currentPatient?.answers?.adhdTestResult) || (currentPatient?.answers?.autismTestResult)) && (
                    <span className="w-2 h-2 rounded-full bg-mecura-neon shadow-[0_0_8px_rgba(166,255,0,0.8)]" />
                  )}
                </button>
                {currentPatient && (
                  <button 
                    onClick={(e) => handleRemoveFromQueue(currentPatient, e)}
                    className="px-3 md:px-4 py-2 md:py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs md:text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap"
                    title="Remover paciente da fila e fechar atendimento"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Tirar da Fila</span>
                  </button>
                )}
              </div>
            </div>

            {/* Neurodivergent Tests Banner (TDAH & Autismo TEA) */}
            {showNeuroTestsBanner && (
              <div className="p-3 md:p-4 bg-[#090E14] border-b border-sky-400/25 shrink-0 max-h-[45vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
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
                  role="doctor"
                  onSendAdhdToChat={handleSendDoctorAdhdToChat}
                  onSendAutismToChat={handleSendDoctorAutismToChat}
                  onSaveTestResult={handleSaveDoctorTestResult}
                />
              </div>
            )}

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
              <div className="flex flex-col space-y-6">
                {[...messages].sort((a, b) => {
                  const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
                  const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
                  return (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
                }).map((msg, msgIdx) => (
                <div
                  key={`${msg.id || 'doc-msg'}-${msgIdx}`}
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
                              <h3 className={`${msg.sender === 'doctor' ? 'text-white' : 'text-black'} font-bold text-base leading-tight flex-1 break-words`}>
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
                              {(Array.isArray(msg.productData.details) ? msg.productData.details : [msg.productData.details || '']).filter(Boolean).map((detail, idx) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                                  <span>{detail}</span>
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
                            {msg.productData.origin === 'Nacional' ? '🇧🇷 Nacional' : `🇺🇸 ${msg.productData.origin || 'Importado'}`}
                          </span>
                        </div>

                        {/* Bottom Section: Dosage */}
                        <div>
                          <h4 className="text-[#58D68D] font-bold text-sm mb-2">
                            Iniciar tratamento com:
                          </h4>
                          <ul className={`${msg.sender === 'doctor' ? 'text-white' : 'text-black'} text-sm space-y-1 mb-4`}>
                            {(Array.isArray(msg.productData.dosage) 
                              ? msg.productData.dosage 
                              : typeof (msg.productData.dosage as any) === 'string'
                              ? String(msg.productData.dosage).split('\n').filter(Boolean)
                              : [msg.productData.dosage ? String(msg.productData.dosage) : '']
                            ).map((dose, idx) => (
                              <li key={`${msg.id || 'doc-msg'}-dose-${idx}`} className="whitespace-pre-line leading-relaxed">
                                {dose}
                              </li>
                            ))}
                          </ul>
                          {msg.productData.description && (
                            <p className={`${msg.sender === 'doctor' ? 'text-mecura-silver' : 'text-gray-500'} text-xs leading-relaxed whitespace-pre-line border-t border-white/5 pt-2`}>
                              {msg.productData.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : msg.type === 'receita_previa' && msg.receitaPreviaData ? (
                    <div className="w-[85%] max-w-2xl bg-gradient-to-br from-[#12131C] to-[#0A0B10] border border-amber-500/40 rounded-3xl p-5 sm:p-6 mb-2 shadow-xl relative overflow-hidden group">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemovePrescribedMedication(msg.id, 'Receita Prévia');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all z-20 shadow-sm cursor-pointer active:scale-95"
                        title="Remover receita prévia"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                                <span>Receita Médica Prévia</span>
                              </h3>
                              <p className="text-xs text-mecura-silver">
                                Enviada para conferência e validação do paciente
                              </p>
                            </div>
                          </div>
                          <div className="pr-20">
                            {msg.receitaPreviaData.status === 'confirmed' ? (
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Confirmada pelo Paciente
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                Aguardando Confirmação
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Medications List */}
                        <div className="space-y-3 mb-4">
                          {msg.receitaPreviaData.items.map((item, itIdx) => (
                            <div key={itIdx} className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-white font-bold text-sm">
                                  {itIdx + 1}. {item.name}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-white/10 text-mecura-silver border border-white/10">
                                  {item.brand} ({item.origin})
                                </span>
                              </div>
                              {(item.concentration || item.activeIngredients) && (
                                <p className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span><strong>Composição / Concentração:</strong> {item.concentration || item.activeIngredients}</span>
                                </p>
                              )}
                              <p className="text-[11px] text-mecura-silver">
                                {item.pharmaceuticalForm} • Qtd: {item.quantity} • {item.administrationRoute}
                              </p>
                              <div className="pt-1 text-xs text-mecura-pearl">
                                <span className="font-semibold text-white block mb-0.5">Posologia:</span>
                                {(Array.isArray(item.dosage) ? item.dosage : [String(item.dosage || '')]).map((d, dI) => (
                                  <p key={dI} className="leading-relaxed">• {d}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {msg.receitaPreviaData.notes && (
                          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-mecura-silver mb-4 whitespace-pre-line">
                            <strong className="text-white block mb-1">Orientações Farmacológicas:</strong>
                            {msg.receitaPreviaData.notes}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => handleOpenPrescriptionEditor()}
                            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                            <span>Editar no Validador</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadPrescriptionFromEditor()}
                            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Baixar PDF da Receita</span>
                          </button>
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
                  ) : (msg.type === 'prescription' || msg.docType === 'receita') ? (
                    <div className="w-[75%] max-w-xl bg-gradient-to-r from-mecura-surface to-mecura-surface-light border border-mecura-neon/30 rounded-2xl p-5 mb-2 shadow-lg relative overflow-hidden group">
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
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20 shrink-0">
                          <FileText className="w-6 h-6 text-mecura-neon" />
                        </div>
                        <div className="flex-1 pr-16">
                          <span className="text-[10px] text-mecura-neon font-bold uppercase tracking-wider bg-mecura-neon/10 border border-mecura-neon/20 px-2 py-0.5 rounded-full inline-block mb-1">
                            Receita Digital Assinada
                          </span>
                          <h3 className="text-white font-bold text-sm mb-0.5">{msg.attachment?.name || 'Receita_Digital_MeCura.pdf'}</h3>
                          <p className="text-mecura-silver text-xs">Arquivo anexado e disponível para o paciente baixar em 1 clique.</p>
                          {msg.attachment && (
                            <button
                              type="button"
                              onClick={() => downloadOrGenerateAttachment(msg.attachment, undefined, msg.attachment?.name || 'Receita_Digital.pdf')}
                              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-mecura-neon/10 border border-mecura-neon/30 hover:bg-mecura-neon hover:text-black text-mecura-neon text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Baixar Anexo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (msg.type === 'medical_report' || msg.docType === 'laudo_inicial' || msg.docType === 'laudo_evolutivo') ? (
                    <div className={`w-[75%] max-w-xl bg-gradient-to-r ${msg.docType === 'laudo_evolutivo' ? 'from-[#0F172A] to-[#1E293B] border-blue-500/30' : 'from-[#1A160F] to-[#261E14] border-amber-500/30'} border rounded-2xl p-5 mb-2 shadow-lg relative overflow-hidden group`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveDoctorMessage(msg.id, 'Laudo Médico');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all z-20 shadow-sm cursor-pointer active:scale-95"
                        title="Remover laudo"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-xl ${msg.docType === 'laudo_evolutivo' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'} flex items-center justify-center border shrink-0`}>
                          <FileCheck className="w-6 h-6" />
                        </div>
                        <div className="flex-1 pr-16">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${msg.docType === 'laudo_evolutivo' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}`}>
                            {msg.docType === 'laudo_evolutivo' ? 'Laudo Médico Evolutivo' : 'Laudo Médico Inicial'}
                          </span>
                          <h3 className="text-white font-bold text-sm mb-0.5">{msg.attachment?.name || 'Laudo_Medico.pdf'}</h3>
                          <p className="text-mecura-silver text-xs">Documento médico oficial assinado e liberado para o paciente.</p>
                          {msg.attachment && (
                            <button
                              type="button"
                              onClick={() => downloadOrGenerateAttachment(msg.attachment, undefined, msg.attachment?.name || 'Laudo_Medico.pdf')}
                              className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                msg.docType === 'laudo_evolutivo'
                                  ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500 hover:text-white text-blue-400'
                                  : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-400'
                              }`}
                            >
                              <Download className="w-3.5 h-3.5" /> Baixar Anexo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (msg.type === 'psychomotor_report' || msg.docType === 'laudo_psicomotor') ? (
                    <div className="w-[75%] max-w-xl bg-gradient-to-r from-[#170F24] to-[#251A36] border border-purple-500/30 rounded-2xl p-5 mb-2 shadow-lg relative overflow-hidden group">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveDoctorMessage(msg.id, 'Laudo Psicomotor');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all z-20 shadow-sm cursor-pointer active:scale-95"
                        title="Remover laudo psicomotor"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="flex-1 pr-16">
                          <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full inline-block mb-1">
                            Laudo Psicomotor (Lei Seca / CTB)
                          </span>
                          <h3 className="text-white font-bold text-sm mb-0.5">{msg.attachment?.name || 'Laudo_Psicomotor.pdf'}</h3>
                          <p className="text-mecura-silver text-xs">Atestado de aptidão psicomotora anexado para o paciente.</p>
                          {msg.attachment && (
                            <button
                              type="button"
                              onClick={() => downloadOrGenerateAttachment(msg.attachment, undefined, msg.attachment?.name || 'Laudo_Psicomotor.pdf')}
                              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500 hover:text-white text-purple-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Baixar Anexo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (msg.type === 'agronomic_report' || msg.docType === 'laudo_agronomico') ? (
                    <div className="w-[75%] max-w-xl bg-gradient-to-r from-[#0C1E14] to-[#142A1D] border border-emerald-500/30 rounded-2xl p-5 mb-2 shadow-lg relative overflow-hidden group">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveDoctorMessage(msg.id, 'Laudo Agronômico');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all z-20 shadow-sm cursor-pointer active:scale-95"
                        title="Remover laudo agronômico"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                          <Sprout className="w-6 h-6" />
                        </div>
                        <div className="flex-1 pr-16">
                          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-block mb-1">
                            Parecer Técnico Agronômico (HC)
                          </span>
                          <h3 className="text-white font-bold text-sm mb-0.5">{msg.attachment?.name || 'Parecer_Agronomico.pdf'}</h3>
                          <p className="text-mecura-silver text-xs">Parecer pericial de cultivo e fitomassa disponível para o paciente.</p>
                          {msg.attachment && (
                            <button
                              type="button"
                              onClick={() => downloadOrGenerateAttachment(msg.attachment, undefined, msg.attachment?.name || 'Parecer_Agronomico.pdf')}
                              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white text-emerald-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Baixar Anexo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (msg.type === 'document' || msg.attachment) ? (
                    <div className="w-[75%] max-w-xl bg-gradient-to-r from-mecura-surface to-mecura-surface-light border border-white/15 rounded-2xl p-5 mb-2 shadow-lg relative overflow-hidden group">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveDoctorMessage(msg.id, 'Documento');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all z-20 shadow-sm cursor-pointer active:scale-95"
                        title="Remover documento"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shrink-0">
                          <Paperclip className="w-6 h-6" />
                        </div>
                        <div className="flex-1 pr-16">
                          <span className="text-[10px] text-mecura-silver font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-full inline-block mb-1">
                            Documento Anexado
                          </span>
                          <h3 className="text-white font-bold text-sm mb-0.5">{msg.attachment?.name || 'Documento.pdf'}</h3>
                          <p className="text-mecura-silver text-xs">Arquivo anexado na consulta.</p>
                          {msg.attachment && (
                            <button
                              type="button"
                              onClick={() => downloadOrGenerateAttachment(msg.attachment, undefined, msg.attachment?.name || 'Documento.pdf')}
                              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 hover:bg-white hover:text-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Baixar Anexo
                            </button>
                          )}
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
                          <p className="text-white font-bold text-2xl">R$ 249<span className="text-gray-500 text-sm">,90</span></p>
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
                          <p className="text-white text-sm">O paciente realizou o pagamento da Consulta Premium (R$ 249,90). Você pode prosseguir com o atendimento e envio dos laudos.</p>
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
                  ) : msg.type === 'adhd_test_card' ? (
                    <div className="w-[90%] md:w-[75%] max-w-xl rounded-2xl bg-gradient-to-br from-[#0B1520] via-[#0D1826] to-[#070D14] border border-sky-400/40 p-5 text-white shadow-xl mb-2 space-y-3 relative group">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveDoctorMessage(msg.id, 'Teste TDAH');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 z-20"
                        title="Remover card do teste"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 pr-20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/40 flex items-center justify-center">
                            <Brain className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider bg-sky-500/15 border border-sky-400/30 px-2 py-0.5 rounded-full inline-block mb-1">
                              {msg.adhdTestData?.scorePercent !== undefined
                                ? msg.sender === 'user'
                                  ? '✓ Avaliação Respondida pelo Paciente'
                                  : 'Avaliação ASRS-18 • 12 Domínios'
                                : 'Convite Enviado ao Paciente'}
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {msg.adhdTestData?.scorePercent !== undefined
                                ? 'Laudo de Rastreio Neurocomportamental: TDAH'
                                : 'Solicitação de Preenchimento: Escala TDAH (12 Perguntas)'}
                            </h4>
                          </div>
                        </div>
                        {msg.adhdTestData?.scorePercent !== undefined && (
                          <div className="text-right">
                            <span className="text-2xl font-black text-mecura-neon font-mono">
                              {msg.adhdTestData.scorePercent}%
                            </span>
                          </div>
                        )}
                      </div>
                      {msg.adhdTestData?.scorePercent !== undefined ? (
                        <div className="space-y-2.5 text-xs text-mecura-silver">
                          <div className="text-white font-bold text-sm">
                            {msg.adhdTestData.classification || 'Avaliação Computada'}
                          </div>
                          {msg.adhdTestData.totalPoints !== undefined && (
                            <div className="text-xs text-sky-200">
                              Pontuação Obtida: <strong>{msg.adhdTestData.totalPoints}</strong> / {msg.adhdTestData.maxPoints || 36} pontos
                            </div>
                          )}
                          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-mecura-pearl leading-relaxed">
                            🎯 <strong>Diretriz Farmacológica:</strong> Modulação dopaminérgica no Córtex Pré-Frontal. Protocolo recomendado: CBD + CBG (Foco Diurno) com acompanhamento médico e psicológico integrado.
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowNeuroTestsBanner(true)}
                            className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-300" />
                            <span>Ver Painel Completo e 12 Respostas</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs text-mecura-silver">
                          <p className="text-mecura-pearl leading-relaxed">
                            {msg.text || 'Convite enviado para o paciente responder às 12 perguntas da escala ASRS-18 diretamente no chat.'}
                          </p>
                          {currentPatient?.answers?.adhdTestResult?.scorePercent !== undefined ? (
                            <div className="p-2.5 rounded-xl bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon font-bold flex items-center justify-between">
                              <span>
                                ✓ Paciente já concluiu o teste ({currentPatient.answers.adhdTestResult.scorePercent}% — {currentPatient.answers.adhdTestResult.classification})
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowNeuroTestsBanner(true)}
                                className="underline text-white ml-2 cursor-pointer"
                              >
                                Ver Resultado
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-sky-300/80">
                              ⏳ Assim que o paciente finalizar a avaliação no chat dele, o resultado aparecerá automaticamente aqui e no painel superior.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : msg.type === 'autism_test_card' ? (
                    <div className="w-[90%] md:w-[75%] max-w-xl rounded-2xl bg-gradient-to-br from-[#160D22] via-[#1D102D] to-[#0E0716] border border-purple-400/40 p-5 text-white shadow-xl mb-2 space-y-3 relative group">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveDoctorMessage(msg.id, 'Teste TEA');
                        }}
                        className="absolute top-4 right-4 px-2.5 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 z-20"
                        title="Remover card do teste"
                      >
                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        <span className="pointer-events-none">Remover</span>
                      </button>
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 pr-20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider bg-purple-500/15 border border-purple-400/30 px-2 py-0.5 rounded-full inline-block mb-1">
                              {msg.autismTestData?.scorePercent !== undefined
                                ? msg.sender === 'user'
                                  ? '✓ Mapeamento Respondido pelo Paciente'
                                  : 'Mapeamento TEA (Autismo) • 12 Perguntas'
                                : 'Convite Enviado ao Paciente'}
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {msg.autismTestData?.scorePercent !== undefined
                                ? 'Sensibilidade Sensorial & Rigidez Cognitiva'
                                : 'Solicitação de Preenchimento: Mapeamento TEA (12 Perguntas)'}
                            </h4>
                          </div>
                        </div>
                        {msg.autismTestData?.scorePercent !== undefined && (
                          <div className="text-right">
                            <span className="text-2xl font-black text-mecura-neon font-mono">
                              {msg.autismTestData.scorePercent}%
                            </span>
                          </div>
                        )}
                      </div>
                      {msg.autismTestData?.scorePercent !== undefined ? (
                        <div className="space-y-2.5 text-xs text-mecura-silver">
                          <div className="text-white font-bold text-sm">
                            {msg.autismTestData.classification || 'Mapeamento Computado'}
                          </div>
                          {msg.autismTestData.totalPoints !== undefined && (
                            <div className="text-xs text-purple-200">
                              Perfil: <strong>{msg.autismTestData?.targetProfile || 'Adulto'}</strong> • Pontuação: <strong>{msg.autismTestData.totalPoints}</strong> / {msg.autismTestData.maxPoints || 36} pontos
                            </div>
                          )}
                          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-mecura-pearl leading-relaxed">
                            🧩 <strong>Diretriz Farmacológica:</strong> Restauração do tônus de Anandamida e modulação do equilíbrio excitatório GABA/Glutamato. Protocolo recomendado: Full Spectrum com regulação sensorial.
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowNeuroTestsBanner(true)}
                            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-300" />
                            <span>Ver Painel Completo e 12 Respostas</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs text-mecura-silver">
                          <p className="text-mecura-pearl leading-relaxed">
                            {msg.text || 'Convite enviado para o paciente responder às 12 perguntas do Mapeamento de Autismo (TEA) diretamente no chat.'}
                          </p>
                          {currentPatient?.answers?.autismTestResult?.scorePercent !== undefined ? (
                            <div className="p-2.5 rounded-xl bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon font-bold flex items-center justify-between">
                              <span>
                                ✓ Paciente já concluiu o mapeamento ({currentPatient.answers.autismTestResult.scorePercent}% — {currentPatient.answers.autismTestResult.classification})
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowNeuroTestsBanner(true)}
                                className="underline text-white ml-2 cursor-pointer"
                              >
                                Ver Resultado
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-purple-300/80">
                              ⏳ Assim que o paciente finalizar o mapeamento no chat dele, o resultado aparecerá automaticamente aqui e no painel superior.
                            </div>
                          )}
                        </div>
                      )}
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
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  ) : (
                    <div className="max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm relative group bg-mecura-surface text-mecura-pearl rounded-tl-sm border border-mecura-elevated mb-2">
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 px-1">
                    <span className="text-[11px] text-mecura-silver font-medium">
                      {(() => {
                        try {
                          const d = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp || 0);
                          return !isNaN(d.getTime()) ? format(d, 'HH:mm') : '';
                        } catch {
                          return '';
                        }
                      })()}
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
              <div className="max-w-5xl mx-auto mb-4 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161622] border border-mecura-neon/40 rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      pendingAttachment.docType === 'receita' ? 'bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30' :
                      pendingAttachment.docType === 'laudo_inicial' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                      pendingAttachment.docType === 'laudo_evolutivo' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                      pendingAttachment.docType === 'laudo_psicomotor' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                      pendingAttachment.docType === 'laudo_agronomico' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                      'bg-white/10 text-white border border-white/20'
                    }`}>
                      {pendingAttachment.docType === 'receita' && <FileText className="w-6 h-6" />}
                      {pendingAttachment.docType === 'laudo_inicial' && <FileCheck className="w-6 h-6" />}
                      {pendingAttachment.docType === 'laudo_evolutivo' && <FileCheck className="w-6 h-6" />}
                      {pendingAttachment.docType === 'laudo_psicomotor' && <ShieldCheck className="w-6 h-6" />}
                      {pendingAttachment.docType === 'laudo_agronomico' && <Sprout className="w-6 h-6" />}
                      {pendingAttachment.docType === 'documento' && <Paperclip className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-mecura-silver">Tipo de Arquivo:</span>
                        <select
                          value={pendingAttachment.docType || 'receita'}
                          onChange={(e) => setPendingAttachment({
                            ...pendingAttachment,
                            docType: e.target.value as any
                          })}
                          className="bg-[#0A0A0F] border border-white/20 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-mecura-neon font-bold cursor-pointer"
                        >
                          <option value="receita">📋 Receita Médica</option>
                          <option value="laudo_inicial">📑 Laudo Inicial</option>
                          <option value="laudo_evolutivo">📑 Laudo Evolutivo</option>
                          <option value="laudo_psicomotor">⚖️ Laudo Psicomotor</option>
                          <option value="laudo_agronomico">🌱 Parecer Agronômico</option>
                          <option value="documento">📎 Outro Documento</option>
                        </select>
                      </div>
                      <p className="text-sm font-bold text-white truncate max-w-[280px] sm:max-w-md">{pendingAttachment.name}</p>
                      {isUploadingAttachment ? (
                        <div className="flex items-center gap-1.5 text-xs text-mecura-neon animate-pulse mt-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Carregando arquivo no servidor seguro...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Arquivo pronto para envio</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => setPendingAttachment(null)}
                      className="px-3 py-2 hover:bg-white/10 rounded-xl text-mecura-silver hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                    <button 
                      onClick={() => handleSendAttachment(pendingAttachment)}
                      disabled={isSendingAttachment || isUploadingAttachment}
                      className="px-4 py-2.5 bg-mecura-neon text-black text-xs md:text-sm font-bold rounded-xl hover:bg-[#b5ff33] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(166,255,0,0.25)] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                    >
                      {isSendingAttachment || isUploadingAttachment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isUploadingAttachment ? 'Carregando...' : 'Enviando...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {pendingAttachment.docType === 'receita' ? 'Enviar Receita' :
                           pendingAttachment.docType === 'laudo_inicial' ? 'Enviar Laudo Inicial' :
                           pendingAttachment.docType === 'laudo_evolutivo' ? 'Enviar Laudo Evolutivo' :
                           pendingAttachment.docType === 'laudo_psicomotor' ? 'Enviar Laudo Psicomotor' :
                           pendingAttachment.docType === 'laudo_agronomico' ? 'Enviar Parecer Agronômico' :
                           'Enviar Documento'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">
              <div className="relative">
                <button 
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="w-12 h-12 rounded-full bg-mecura-surface border border-mecura-elevated flex items-center justify-center text-mecura-silver hover:text-mecura-neon hover:border-mecura-neon/50 transition-all hover:scale-105 cursor-pointer"
                  title="Anexar documentos e receitas"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
                
                {/* Attachment Menu */}
                {showAttachmentMenu && (
                  <div
                    className="absolute bottom-full left-0 mb-4 w-64 bg-[#161622] border border-[#262636] rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5"
                  >
                    <div className="px-4 py-2.5 bg-[#0A0A0F]/80 text-[10px] font-bold text-mecura-silver uppercase tracking-wider">
                      Anexar Documento para o Paciente
                    </div>
                    
                    <button 
                      onClick={() => handleTriggerFileInput('receita')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-mecura-pearl hover:bg-white/5 hover:text-mecura-neon transition-colors cursor-pointer text-left"
                    >
                      <FileText className="w-4 h-4 text-mecura-neon" />
                      <span>Anexar <strong>Receita Médica</strong> (PDF)</span>
                    </button>

                    <button 
                      onClick={() => handleTriggerFileInput('laudo_inicial')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-mecura-pearl hover:bg-white/5 hover:text-amber-400 transition-colors cursor-pointer text-left"
                    >
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <span>Anexar <strong>Laudo Inicial</strong> (PDF)</span>
                    </button>

                    <button 
                      onClick={() => handleTriggerFileInput('laudo_evolutivo')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-mecura-pearl hover:bg-white/5 hover:text-blue-400 transition-colors cursor-pointer text-left"
                    >
                      <FileCheck className="w-4 h-4 text-blue-400" />
                      <span>Anexar <strong>Laudo Evolutivo</strong> (PDF)</span>
                    </button>

                    <button 
                      onClick={() => handleTriggerFileInput('laudo_psicomotor')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-mecura-pearl hover:bg-white/5 hover:text-purple-400 transition-colors cursor-pointer text-left"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Anexar <strong>Laudo Psicomotor</strong> (PDF)</span>
                    </button>

                    <button 
                      onClick={() => handleTriggerFileInput('laudo_agronomico')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-mecura-pearl hover:bg-white/5 hover:text-emerald-400 transition-colors cursor-pointer text-left"
                    >
                      <Sprout className="w-4 h-4 text-emerald-400" />
                      <span>Anexar <strong>Laudo Agronômico</strong> (PDF)</span>
                    </button>

                    <button 
                      onClick={() => handleTriggerFileInput('documento')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-mecura-pearl hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <Paperclip className="w-4 h-4 text-mecura-silver" />
                      <span>Anexar <strong>Outro Documento / Exame</strong></span>
                    </button>

                    <button 
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        setShowProductSearchModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs text-mecura-neon hover:bg-white/5 transition-colors cursor-pointer text-left bg-mecura-neon/5"
                    >
                      <Search className="w-4 h-4 text-mecura-neon" />
                      <span className="font-bold">Buscar produto no Catálogo</span>
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
              <DoctorChatInputBar
                onSend={(text) => handleSend(text)}
                hasPendingAttachment={Boolean(pendingAttachment)}
                onSendPendingAttachment={() => pendingAttachment && handleSendAttachment(pendingAttachment)}
              />
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
          {/* Central de Prescrição Clínica IA & Associações */}
          <div className="bg-mecura-surface/60 border border-mecura-elevated rounded-2xl p-3.5 space-y-3 shadow-lg">
            {/* Header com Origens / Status Ativo Combinado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-mecura-elevated/60">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-mecura-neon flex-shrink-0" />
                <span className="text-[11px] font-bold text-mecura-silver uppercase tracking-wider">
                  Prescrição Combinada:
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-400/30 flex items-center gap-1">
                  <span>🇧🇷</span>
                  {nationalPreference === 'soucannabis'
                    ? 'SouCannabis'
                    : nationalPreference === 'abrace'
                    ? 'ABRACE'
                    : nationalPreference === 'abecmed'
                    ? 'ABECMED'
                    : 'Todas Associações'}
                </span>
                <span className="text-[10px] text-mecura-silver font-bold">+</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-cyan-500/15 text-cyan-300 border-cyan-400/30 flex items-center gap-1">
                  <span>🌐</span>
                  {importedPreference === 'pangaia'
                    ? 'Pangaia'
                    : importedPreference === 'flowermed'
                    ? 'Flowermed'
                    : importedPreference === 'greenbudz'
                    ? 'GreenBudz'
                    : 'Todos Importados'}
                </span>
              </div>
            </div>
            
            {/* Linha 1: 🇧🇷 Associações Brasileiras (Nacionais) */}
            <div className="space-y-1.5">
              {(() => {
                const pAns = currentPatient?.answers || answers || {};
                const pBrands: string[] = Array.isArray(pAns.preferredBrands) ? pAns.preferredBrands : [];
                const fallbackBrand = pAns.preferredNationalAssociation || pAns.preferredImportedBrand;
                const hasBrandInfo = pBrands.length > 0 || !!fallbackBrand || !!pAns.preferredTreatmentStatus || !!pAns.preferredBrandNotes;
                if (!hasBrandInfo) return null;
                const statusBadge = (pAns.preferredTreatmentStatus === 'ja_faz' || pAns.preferredTreatmentStatus === 'ja_usa')
                  ? 'Já faz tratamento com'
                  : (pAns.preferredTreatmentStatus === 'pretende_fazer' || pAns.preferredTreatmentStatus === 'pretende_usar')
                    ? 'Pretende iniciar tratamento com'
                    : 'Sem preferência fixa (Aberto à indicação)';
                return (
                  <div className="mb-2.5 p-2.5 rounded-xl bg-mecura-neon/10 border border-mecura-neon/35 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-mecura-neon flex items-center gap-1">
                        🏷️ Escolha do Paciente na Triagem
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-white border border-mecura-neon/30">
                        {statusBadge}
                      </span>
                    </div>
                    {(pBrands.length > 0 || fallbackBrand) && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(pBrands.length > 0 ? pBrands : [fallbackBrand]).map((b: string, i: number) => (
                          <span key={i} className="text-[11px] font-extrabold bg-[#0A0A0F] text-white border border-mecura-neon/40 px-2 py-0.5 rounded-md">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                    {pAns.preferredBrandNotes && (
                      <p className="text-[10px] text-mecura-silver italic mt-0.5">
                        Obs: "{pAns.preferredBrandNotes}"
                      </p>
                    )}
                  </div>
                );
              })()}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-mecura-neon uppercase tracking-wider flex items-center gap-1">
                  <span>🇧🇷</span> 1. Associação Nacional:
                </span>
                <span className="text-[9px] text-mecura-silver">Escolha uma associação</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNationalPreference('soucannabis');
                    setBrandPreference('soucannabis');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                    nationalPreference === 'soucannabis'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.35)] font-black'
                      : 'bg-mecura-surface text-mecura-pearl border-mecura-elevated hover:border-mecura-neon/50 hover:text-mecura-neon'
                  }`}
                  title="SouCannabis: laudos HPLC, óleos MCT, sprays nasais e extrações 60%/80%"
                >
                  <span>🌱</span> SouCannabis
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNationalPreference('abrace');
                    setBrandPreference('abrace');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                    nationalPreference === 'abrace'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.35)] font-black'
                      : 'bg-mecura-surface text-mecura-pearl border-mecura-elevated hover:border-mecura-neon/50 hover:text-mecura-neon'
                  }`}
                  title="ABRACE: pioneira nacional, óleos coloridos, gomas, pomadas 100g e spray resgate"
                >
                  <span>🌿</span> ABRACE Esperança
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNationalPreference('abecmed');
                    setBrandPreference('abecmed');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                    nationalPreference === 'abecmed'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.35)] font-black'
                      : 'bg-mecura-surface text-mecura-pearl border-mecura-elevated hover:border-mecura-neon/50 hover:text-mecura-neon'
                  }`}
                  title="ABECMED: RSO em MCT, extrações sem solvente e inflorescências autorizadas"
                >
                  <span>🍃</span> ABECMED
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNationalPreference('all');
                    setBrandPreference('both');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                    nationalPreference === 'all'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.35)] font-black'
                      : 'bg-mecura-surface text-mecura-silver border-mecura-elevated hover:text-white'
                  }`}
                  title="Todas as associações brasileiras integradas"
                >
                  <span>🌐</span> Todas Associações
                </button>
              </div>
            </div>

            {/* Linha 2: 🌐 Marcas Importadas */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-mecura-neon uppercase tracking-wider flex items-center gap-1">
                  <span>🌐</span> 2. Marca Importada:
                </span>
                <span className="text-[9px] text-mecura-silver">Escolha um importado</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImportedPreference('pangaia');
                    setBrandPreference('pangaia');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                    importedPreference === 'pangaia'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.35)] font-black'
                      : 'bg-mecura-surface text-mecura-pearl border-mecura-elevated hover:border-mecura-neon/50 hover:text-mecura-neon'
                  }`}
                  title="Pangaia Biopharmaceuticals (EUA • ANVISA RDC 660)"
                >
                  <span>🌿</span> Pangaia
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImportedPreference('flowermed');
                    setBrandPreference('flowermed');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                    importedPreference === 'flowermed'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.3)] font-black'
                      : 'bg-mecura-surface/40 text-mecura-silver border-mecura-elevated hover:text-white'
                  }`}
                  title="Flowermed (EUA) e Flores/Extrações"
                >
                  <span>🌸</span> Flowermed
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImportedPreference('greenbudz');
                    setBrandPreference('greenbudz');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                    importedPreference === 'greenbudz'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.3)] font-black'
                      : 'bg-mecura-surface/40 text-mecura-silver border-mecura-elevated hover:text-white'
                  }`}
                  title="GreenBudzCBD (EUA)"
                >
                  <span>🌲</span> GreenBudz
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImportedPreference('all');
                    setBrandPreference('both');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                    importedPreference === 'all'
                      ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.3)] font-black'
                      : 'bg-mecura-surface/40 text-mecura-silver border-mecura-elevated hover:text-white'
                  }`}
                  title="Todos os catálogos importados"
                >
                  <span>🌐</span> Todos Importados
                </button>
              </div>
            </div>

            {/* Ações Principais (Largura Total, Espaçosos e Sem Sobreposição) */}
            <div className="space-y-2 pt-1">
              {/* Botão 1: Análise Clínica IA (Gera com o Combo 1 Nacional + 1 Importado) */}
              <div
                onClick={() => handleGenerateAnalysis(false, 'both', nationalPreference, importedPreference)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAnalysis(false, 'both', nationalPreference, importedPreference)}
                className={`w-full cursor-pointer relative overflow-hidden group bg-gradient-to-r from-mecura-surface to-mecura-surface-light border rounded-xl p-3 flex items-center justify-between gap-3 transition-all shadow-[0_4px_15px_rgba(166,255,0,0.05)] hover:shadow-[0_4px_20px_rgba(166,255,0,0.18)] ${
                  expandAnalysis ? 'border-mecura-neon ring-1 ring-mecura-neon/30' : 'border-mecura-neon/30 hover:border-mecura-neon'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-mecura-neon/0 via-mecura-neon/5 to-mecura-neon/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 flex items-center justify-center border border-mecura-neon/20 flex-shrink-0">
                    <BrainCircuit className="w-5 h-5 text-mecura-neon" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-white font-bold text-sm leading-tight truncate">Análise Clínica IA</h3>
                    <p className="text-mecura-silver text-xs leading-tight truncate mt-0.5">
                      Prescrever {
                        nationalPreference === 'soucannabis' ? 'SouCannabis' : nationalPreference === 'abrace' ? 'ABRACE' : nationalPreference === 'abecmed' ? 'ABECMED' : 'Associações'
                      } + {
                        importedPreference === 'pangaia' ? 'Pangaia' : importedPreference === 'flowermed' ? 'Flowermed' : importedPreference === 'greenbudz' ? 'GreenBudz' : 'Importados'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {analysisResult ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAnalysis(true, 'both', nationalPreference, importedPreference);
                        }}
                        disabled={isAnalyzing}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-mecura-silver hover:text-mecura-neon transition-colors"
                        title="Re-gerar Análise"
                      >
                        <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-mecura-neon' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAnalysisModal(true);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-mecura-silver hover:text-mecura-neon transition-colors"
                        title="Expandir Modal"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <ChevronDown className={`w-4 h-4 text-mecura-silver transition-transform duration-300 ${expandAnalysis ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <span className="text-xs font-bold text-mecura-neon bg-mecura-neon/15 px-2.5 py-1 rounded-full border border-mecura-neon/30 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Gerar 1+1
                    </span>
                  )}
                </div>
              </div>

              {/* Botão 2: Painel de Associações Brasileiras (SouCannabis, ABRACE e ABECMED) */}
              <div className="bg-gradient-to-r from-emerald-950/70 via-[#0A1612] to-emerald-950/70 border border-emerald-500/40 rounded-xl p-3 space-y-2.5 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">🇧🇷</span>
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wider truncate">
                      Associações Brasileiras (Nacional)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
                    Entrada Acessível
                  </span>
                </div>

                {/* Seletores Rápidos das 3 Associações */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNationalPreference('soucannabis');
                      setBrandPreference('soucannabis');
                      handleGenerateAnalysis(true, 'soucannabis', 'soucannabis', importedPreference);
                    }}
                    className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                      nationalPreference === 'soucannabis'
                        ? 'bg-emerald-400 text-black border-emerald-400 font-black shadow-sm'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-400 hover:text-white'
                    }`}
                    title="SouCannabis: laudos HPLC, extrações 60%/80% em seringa e óleos padronizados"
                  >
                    <div className="text-xs font-bold leading-tight">🌱 SouCannabis</div>
                    <div className={`text-[9px] truncate ${nationalPreference === 'soucannabis' ? 'text-black/80 font-bold' : 'text-emerald-400/70'}`}>
                      HPLC • Extrações
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNationalPreference('abrace');
                      setBrandPreference('abrace');
                      handleGenerateAnalysis(true, 'abrace', 'abrace', importedPreference);
                    }}
                    className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                      nationalPreference === 'abrace'
                        ? 'bg-emerald-400 text-black border-emerald-400 font-black shadow-sm'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-400 hover:text-white'
                    }`}
                    title="ABRACE Esperança: pioneira nacional, óleos coloridos, pomadas, gomas e spray resgate"
                  >
                    <div className="text-xs font-bold leading-tight">🌿 ABRACE</div>
                    <div className={`text-[9px] truncate ${nationalPreference === 'abrace' ? 'text-black/80 font-bold' : 'text-emerald-400/70'}`}>
                      Óleos • Gomas
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNationalPreference('abecmed');
                      setBrandPreference('abecmed');
                      handleGenerateAnalysis(true, 'abecmed', 'abecmed', importedPreference);
                    }}
                    className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                      nationalPreference === 'abecmed'
                        ? 'bg-emerald-400 text-black border-emerald-400 font-black shadow-sm'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-400 hover:text-white'
                    }`}
                    title="ABECMED: RSO em MCT, extrações solventless e inflorescências"
                  >
                    <div className="text-xs font-bold leading-tight">🍃 ABECMED</div>
                    <div className={`text-[9px] truncate ${nationalPreference === 'abecmed' ? 'text-black/80 font-bold' : 'text-emerald-400/70'}`}>
                      RSO • Flores
                    </div>
                  </button>
                </div>

                {/* Botão de Disparo Direto com a Associação Ativa */}
                <button
                  type="button"
                  id="btn-choose-association-active"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateAnalysis(true, 'both', nationalPreference, importedPreference);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer shadow-sm"
                  title="Gerar prescrição priorizando a associação selecionada"
                >
                  <span className="truncate flex items-center gap-1.5">
                    <span>⚡</span>
                    Gerar com {nationalPreference === 'soucannabis' ? '🌱 SouCannabis' : nationalPreference === 'abrace' ? '🌿 ABRACE Esperança' : nationalPreference === 'abecmed' ? '🍃 ABECMED' : 'Associações'}
                  </span>
                  <span className="text-[10px] bg-emerald-400 text-black px-2 py-0.5 rounded font-black flex-shrink-0">
                    Ativar
                  </span>
                </button>
              </div>
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
                        {(() => {
                          const allMeds = parseMedications(analysisResult).filter(med => med.name);
                          const importedMeds = allMeds.filter(med => med.origin !== 'Nacional');
                          const nationalMeds = allMeds.filter(med => med.origin === 'Nacional');
                          const hybridPair = [importedMeds[0], nationalMeds[0]].filter(Boolean);
                          const allImportedAdded = importedMeds.length > 0 && importedMeds.every(m => isMedicationAdded(m));
                          const allNationalAdded = nationalMeds.length > 0 && nationalMeds.every(m => isMedicationAdded(m));
                          const allHybridAdded = hybridPair.length > 0 && hybridPair.every(m => isMedicationAdded(m));
                          const anyMedAdded = allMeds.some(m => isMedicationAdded(m));

                          const renderMed = (med: any, idx: number, isNational: boolean) => {
                            const isAdded = isMedicationAdded(med);
                            return (
                              <button
                                key={`${isNational ? 'nat' : 'imp'}-${idx}-${med.name}`}
                                type="button"
                                onClick={() => togglePrescribedMedication(med)}
                                className={`w-full p-3 border rounded-xl text-left transition-all group relative overflow-hidden cursor-pointer ${
                                  isAdded 
                                    ? 'bg-mecura-neon/10 border-mecura-neon hover:border-mecura-neon/80 shadow-sm' 
                                    : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50'
                                }`}
                                title={isAdded ? "Clique para remover da receita" : "Clique para prescrever este medicamento"}
                              >
                                {isAdded ? (
                                  <div className="absolute top-0 right-0 p-1.5 text-mecura-neon bg-mecura-neon/20 rounded-bl-xl shadow-sm flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-wider pr-0.5">Prescrito</span>
                                  </div>
                                ) : (
                                  <div className="absolute top-2 right-2 text-[10px] font-bold text-mecura-silver/60 group-hover:text-mecura-neon transition-colors">
                                    + Prescrever
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 mb-1 pr-16">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                    isNational 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  }`}>
                                    {isNational 
                                      ? (med.name.toLowerCase().includes('abrace') ? '🇧🇷 ABRACE Esperança' : med.name.toLowerCase().includes('abec') ? '🇧🇷 Associação ABECMED' : med.name.toLowerCase().includes('soucannabis') ? '🇧🇷 Associação SouCannabis' : '🇧🇷 Associação Nacional')
                                      : (med.name.toLowerCase().includes('pangaia') ? '🌐 Pangaia Biopharma' : med.name.toLowerCase().includes('flowermed') ? '🌐 Flowermed' : med.name.toLowerCase().includes('greenbudz') ? '🌐 GreenBudzCBD' : '🌐 Importado')}
                                  </span>
                                </div>
                                <h5 className={`font-bold text-xs mb-0.5 pr-14 transition-colors ${
                                  isAdded ? 'text-mecura-neon' : 'text-white group-hover:text-mecura-neon'
                                }`}>{med.name}</h5>
                                <p className="text-[10px] text-mecura-silver pr-2 leading-tight">{med.dosage}</p>
                              </button>
                            );
                          };

                          return (
                            <>
                              <div className="flex items-center justify-between mb-3 gap-2">
                                <h4 className="text-sm font-bold text-white">Medicamentos Sugeridos</h4>
                                {anyMedAdded ? (
                                  <button
                                    type="button"
                                    onClick={() => removeMultiplePrescribedMedications(allMeds)}
                                    className="text-[10px] font-bold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 px-2.5 py-1 rounded-lg border border-rose-500/40 transition-colors cursor-pointer"
                                  >
                                    ✕ Limpar Seleção
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-mecura-silver">Importados & Associações</span>
                                )}
                              </div>
                              <div className="space-y-5">
                                {/* Prescrição Híbrida 1+1 (1 Nacional + 1 Importado) */}
                                {importedMeds.length > 0 && nationalMeds.length > 0 && (
                                  <div className="p-3 bg-gradient-to-r from-emerald-950/50 via-mecura-surface to-blue-950/50 border border-mecura-neon/40 rounded-xl flex items-center justify-between gap-3 shadow-md mb-2">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                                        <Sparkles className="w-3.5 h-3.5 text-mecura-neon flex-shrink-0" />
                                        <span className="truncate">Prescrição Híbrida (1 Nacional + 1 Importado)</span>
                                      </div>
                                      <p className="text-[10px] text-mecura-silver leading-tight truncate mt-0.5">
                                        1 Importado ({importedMeds[0]?.name?.split('(')[0]?.trim()}) + 1 Nacional ({nationalMeds[0]?.name?.split('(')[0]?.trim()})
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleMultiplePrescribedMedications(hybridPair)}
                                      className={`px-3 py-1.5 rounded-lg font-extrabold text-xs whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                                        allHybridAdded
                                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40'
                                          : 'bg-mecura-neon text-black hover:shadow-[0_0_12px_rgba(166,255,0,0.4)]'
                                      }`}
                                    >
                                      {allHybridAdded ? (
                                        <><span>✕</span> Desmarcar 1+1</>
                                      ) : (
                                        <><span>⚡</span> Prescrever 1+1</>
                                      )}
                                    </button>
                                  </div>
                                )}
                                {importedMeds.length > 0 && (
                                  <div className="space-y-2.5">
                                    <div className="flex items-center justify-between border-b border-blue-500/20 pb-1">
                                      <h5 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Tratamento Principal (Importados)</h5>
                                      <button
                                        type="button"
                                        onClick={() => toggleMultiplePrescribedMedications(importedMeds)}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                          allImportedAdded
                                            ? 'text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40'
                                            : 'text-blue-300 hover:text-white bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40'
                                        }`}
                                      >
                                        {allImportedAdded ? '✕ Desmarcar Todos Importados' : '+ Prescrever Todos Importados'}
                                      </button>
                                    </div>
                                    {importedMeds.map((med, idx) => renderMed(med, idx, false))}
                                  </div>
                                )}
                                {nationalMeds.length > 0 && (
                                  <div className="space-y-2.5 mt-4">
                                    <div className="border-b border-emerald-500/20 pb-1 flex items-center justify-between">
                                      <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>🇧🇷 Tratamento Nacional (Associações Brasileiras)</span>
                                      </h5>
                                      <button
                                        type="button"
                                        onClick={() => toggleMultiplePrescribedMedications(nationalMeds)}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                          allNationalAdded
                                            ? 'text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40'
                                            : 'text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40'
                                        }`}
                                      >
                                        {allNationalAdded ? '✕ Desmarcar Todos Nacionais' : '+ Prescrever Todos Nacionais'}
                                      </button>
                                    </div>
                                    {nationalMeds.map((med, idx) => renderMed(med, idx, true))}
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
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
            const currentPlanType = getPatientPlanType(currentPatient);

            return (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] flex items-center gap-2">
                    <User className="w-4 h-4 text-mecura-neon" /> Dados Cadastrais
                  </h3>
                  {renderPatientPlanBadge(currentPatient, false)}
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
                      {currentPlanType === 'complete' ? (
                        <span className="text-amber-200 flex items-center gap-1 font-mono">
                          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" /> Completo 360° (Médico + Psico)
                        </span>
                      ) : currentPlanType === 'premium' ? (
                        <span className="text-amber-300 flex items-center gap-1 font-mono">
                          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" /> VIP Premium (R$ 249,90)
                        </span>
                      ) : currentPlanType === 'psychologist' ? (
                        <span className="text-purple-300 flex items-center gap-1 font-mono">
                          🧠 Consulta Psicológica (R$ 150,00)
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

          
          {/* Seção Integrada: Prescrição e Receitas Programadas Direto na Ficha do Paciente */}
          {(() => {
            const pName = currentPatient?.patientName || userName || 'Paciente';
            return (
              <section>
                <div className="bg-gradient-to-br from-purple-950/60 via-[#131124] to-indigo-950/60 border border-purple-500/40 rounded-2xl p-4 space-y-3.5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                        <Sparkles className="w-4 h-4 text-purple-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Prescrever para o Paciente
                        </h4>
                        <span className="text-[11px] text-purple-200/90 font-medium">Vinculado a {pName}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300">
                      Perfis Prontos
                    </span>
                  </div>

                  <p className="text-[11px] text-mecura-silver leading-snug relative z-10">
                    Emita a receita médica digital oficial com perfis padronizados de canabinoides para a condição clínica deste paciente.
                  </p>

                  {/* Botões Principais: Receita Programada vs Editor Livre */}
                  <div className="grid grid-cols-2 gap-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => handleOpenProgrammedForPatient(currentPatient)}
                      className="p-3 rounded-xl bg-gradient-to-r from-purple-600/35 to-indigo-600/35 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-400/50 text-white text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 text-center shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      <div className="flex items-center gap-1.5 text-purple-200 font-extrabold">
                        <Sparkles className="w-4 h-4 text-purple-300" />
                        <span>Receitas Programadas</span>
                      </div>
                      <span className="text-[9px] text-purple-200/70 font-normal">Perfis Ansiedade, Sono, etc.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPrescriptionEditor(currentPatient)}
                      className="p-3 rounded-xl bg-mecura-neon/15 hover:bg-mecura-neon hover:text-black border border-mecura-neon/40 text-mecura-neon text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 text-center shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      <div className="flex items-center gap-1.5 font-extrabold">
                        <PlusCircle className="w-4 h-4" />
                        <span>Editor Livre</span>
                      </div>
                      <span className="text-[9px] text-mecura-silver font-normal">Personalizar itens</span>
                    </button>
                  </div>

                  {/* Atalhos Rápidos com 1 Clique: Nacionais vs Importados */}
                  <div className="pt-2.5 border-t border-purple-500/20 relative z-10 space-y-2">
                    {/* Linha Importada EUA */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1">
                          🌐 Protocolos Importados (EUA • RDC 660):
                        </span>
                        <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-400/30 font-bold">
                          Anvisa
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickApplyCondition('ansiedade', currentPatient, 'importado')}
                          className="p-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 text-sky-200 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer text-left"
                          title="Carregar protocolo Pangaia Biopharma EUA de Ansiedade (10% CBD 3000mg + Gummies)"
                        >
                          <span className="text-xs">🌐</span>
                          <span className="truncate">Pangaia Ansiedade</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickApplyCondition('insonia', currentPatient, 'importado')}
                          className="p-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer text-left"
                          title="Carregar protocolo Pangaia Biopharma EUA de Insônia (20% CBD 6000mg + Softgel)"
                        >
                          <span className="text-xs">🌙</span>
                          <span className="truncate">Pangaia Sono 6000mg</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickApplyCondition('ansiedade', currentPatient, 'importado')}
                          className="p-1.5 rounded-lg bg-teal-950/40 hover:bg-teal-900/50 border border-teal-500/30 text-teal-200 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer text-left"
                          title="Carregar protocolo Flowermed EUA (Hemp Oil 3000mg + Sphera Broad 0% THC)"
                        >
                          <span className="text-xs">🇺🇸</span>
                          <span className="truncate">Flowermed Broad</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickApplyCondition('combinado', currentPatient, 'importado')}
                          className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-200 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer text-left"
                          title="Carregar protocolo de Flores In Natura Terapêuticas 14g (RDC 660)"
                        >
                          <span className="text-xs">🌿</span>
                          <span className="truncate">Flores 14g (RDC 660)</span>
                        </button>
                      </div>
                    </div>

                    {/* Linha Nacional (Associações Brasileiras) */}
                    <div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block mb-1">
                        🇧🇷 Protocolos Nacionais (Associações):
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickApplyCondition('ansiedade', currentPatient, 'nacional')}
                          className="p-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 border border-blue-400/30 text-blue-200 text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
                          title="Carregar protocolo nacional de Ansiedade e Pânico"
                        >
                          <span className="text-xs">🧠</span>
                          <span className="truncate w-full">Ansiedade</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickApplyCondition('insonia', currentPatient, 'nacional')}
                          className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 border border-purple-400/30 text-purple-200 text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
                          title="Carregar protocolo nacional de Insônia e Sono"
                        >
                          <span className="text-xs">🌙</span>
                          <span className="truncate w-full">Insônia</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickApplyCondition('depressao', currentPatient, 'nacional')}
                          className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
                          title="Carregar protocolo nacional de Depressão e Humor"
                        >
                          <span className="text-xs">☀️</span>
                          <span className="truncate w-full">Depressão</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickApplyCondition('combinado', currentPatient, 'nacional')}
                          className="py-1 px-2 rounded-lg bg-gradient-to-r from-blue-900/30 to-purple-900/30 hover:brightness-125 border border-purple-400/30 text-purple-200 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Carregar protocolo nacional combinado de Ansiedade + Insônia"
                        >
                          <span>✨</span> Ansiedade + Sono
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickApplyCondition('dor', currentPatient, 'nacional')}
                          className="py-1 px-2 rounded-lg bg-rose-900/25 hover:bg-rose-900/40 border border-rose-400/30 text-rose-200 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Carregar protocolo nacional de Dor Crônica & Fibromialgia"
                        >
                          <span>🩸</span> Dor Crônica
                        </button>
                      </div>
                    </div>
                  </div>
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
              <IsolatedFastTextarea
                value={evolutionNotes}
                onChange={setEvolutionNotes}
                placeholder="Insira as informações chaves aqui. (ex: Histórico laboral, uso prévio de óleos/flor in natura, cultivo artesanal, etc.)"
                className="w-full bg-transparent border-none text-white text-sm resize-none focus:ring-0 p-0 placeholder-mecura-silver/50 min-h-[80px]"
              />
            </div>
          </section>

          {/* Section: Objectives */}
          {(() => {
            const triageAns = currentPatient ? (currentPatient.answers || {}) : (answers || {});
            return (
              <>
                <section>
                  <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Objetivos Principais
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {triageAns?.objectives?.length ? (
                      (triageAns.objectives || []).map((obj: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon rounded-lg text-base font-medium shadow-[0_0_10px_rgba(166,255,0,0.05)]">
                          {obj}
                        </span>
                      ))
                    ) : (
                      <span className="px-4 py-2 bg-mecura-surface border border-mecura-elevated text-mecura-silver rounded-lg text-base">Nenhum objetivo selecionado</span>
                    )}
                  </div>
                </section>

                {/* Section: Preferência de Marca / Associação (Triagem) */}
                <section>
                  <h3 className="text-[13px] font-bold text-mecura-neon uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-mecura-neon" /> Preferência de Marca ou Associação (Triagem)
                  </h3>
                  {(() => {
                    const pAns = triageAns;
                    const pBrands: string[] = Array.isArray(pAns.preferredBrands) ? pAns.preferredBrands : [];
                    const natAssoc = pAns.preferredNationalAssociation;
                    const impBrand = pAns.preferredImportedBrand;
                    const tStatus = pAns.preferredTreatmentStatus;
                    const bNotes = pAns.preferredBrandNotes;
                    const hasAny = pBrands.length > 0 || !!natAssoc || !!impBrand || !!tStatus || !!bNotes;

                    const isJaFaz = tStatus === 'ja_faz' || tStatus === 'ja_usa';
                    const isPretende = tStatus === 'pretende_fazer' || tStatus === 'pretende_usar';
                    const statusText = isJaFaz
                      ? 'Já faz o tratamento com este fabricante / associação'
                      : isPretende
                        ? 'Pretende iniciar o tratamento com este fabricante / associação'
                        : tStatus === 'sem_preferencia'
                          ? 'Não possui preferência prévia (aguarda indicação médica)'
                          : 'Não informado na triagem';

                    return (
                      <div className="bg-mecura-surface border border-mecura-neon/30 rounded-2xl p-5 space-y-4 shadow-[0_0_20px_rgba(166,255,0,0.06)]">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mecura-elevated pb-3">
                          <span className="text-xs font-bold text-mecura-silver uppercase tracking-wider">
                            Vínculo / Intenção do Paciente:
                          </span>
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                            isJaFaz
                              ? 'bg-mecura-neon/20 text-mecura-neon border-mecura-neon/40 shadow-[0_0_12px_rgba(166,255,0,0.25)]'
                              : isPretende
                                ? 'bg-mecura-neon/15 text-mecura-neon border-mecura-neon/30'
                                : 'bg-mecura-elevated text-mecura-pearl border-mecura-elevated'
                          }`}>
                            {statusText}
                          </span>
                        </div>

                        {hasAny ? (
                          <>
                            <div className="space-y-2">
                              <span className="text-xs text-mecura-silver block">
                                Associações Nacionais / Empresas Importadas Selecionadas:
                              </span>
                              {(pBrands.length > 0 || natAssoc || impBrand) ? (
                                <div className="flex flex-wrap gap-2">
                                  {(pBrands.length > 0 ? pBrands : [natAssoc, impBrand].filter(Boolean)).map((brand: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="px-3.5 py-2 rounded-xl bg-mecura-neon/15 border border-mecura-neon text-white font-bold text-sm flex items-center gap-2 shadow-[0_0_12px_rgba(166,255,0,0.15)]"
                                    >
                                      <span className="w-2 h-2 rounded-full bg-mecura-neon" />
                                      <span>{brand}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setProductBrandFilter(brand);
                                          setProductSearchTerm('');
                                          setShowPrescriptionModal(true);
                                        }}
                                        className="ml-1 text-[10px] font-black uppercase bg-mecura-neon text-black px-2 py-0.5 rounded-md hover:bg-white transition-colors cursor-pointer"
                                        title="Abrir Receituário filtrando por este fabricante"
                                      >
                                        Prescrever
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-white/80 italic">
                                  Paciente informou que prefere recomendação direta do médico.
                                </p>
                              )}
                            </div>

                            {bNotes && (
                              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5">
                                <span className="text-[11px] font-bold text-mecura-neon uppercase tracking-wider block mb-1">
                                  Observações do Paciente sobre Produto / Associação:
                                </span>
                                <p className="text-sm text-white leading-relaxed italic">
                                  "{bNotes}"
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-mecura-silver italic">
                            O paciente ainda não selecionou uma associação ou marca importada específica na triagem.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </section>

                {/* Section: Details */}
                <section>
                  <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4">
                    Detalhes do Sintoma
                  </h3>
                  <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-mecura-elevated/50 pb-4">
                      <span className="text-base text-mecura-silver">Intensidade</span>
                      <span className="text-base font-bold text-white bg-mecura-surface-light px-3 py-1.5 rounded-md">{triageAns?.intensity || '-'} / 10</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-mecura-elevated/50 pb-4">
                      <span className="text-base text-mecura-silver">Duração</span>
                      <span className="text-base font-bold text-white capitalize">{triageAns?.duration || 'Não informada'}</span>
                    </div>
                    {triageAns?.diseaseOrigin && (
                      <div className="pt-1 border-b border-mecura-elevated/50 pb-4">
                        <span className="text-sm text-mecura-silver block mb-2">Origem / Histórico do Quadro</span>
                        <p className="text-base text-mecura-pearl leading-relaxed bg-mecura-surface-light/50 p-4 rounded-xl border border-mecura-elevated/50">
                          {triageAns.diseaseOrigin}
                        </p>
                      </div>
                    )}
                    <div className="pt-1">
                      <span className="text-sm text-mecura-silver block mb-2">Descrição Adicional</span>
                      <p className="text-base text-mecura-pearl leading-relaxed bg-mecura-surface-light/50 p-4 rounded-xl border border-mecura-elevated/50">
                        {triageAns?.description || "Nenhuma descrição adicional fornecida."}
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
                      <span className="text-lg font-bold text-white">{triageAns?.height ? `${triageAns.height}m` : '-'}</span>
                    </div>
                    <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                      <span className="text-sm text-mecura-silver mb-2">Peso</span>
                      <span className="text-lg font-bold text-white">{triageAns?.weight ? `${triageAns.weight}kg` : '-'}</span>
                    </div>
                    <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                      <span className="text-sm text-mecura-silver mb-2">Sexo</span>
                      <span className="text-lg font-bold text-white">{triageAns?.sex || '-'}</span>
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
                      <span className={`text-base font-bold ${triageAns?.dirige ? 'text-purple-400' : 'text-white'}`}>{triageAns?.dirige ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                      <span className="text-xs text-purple-300 block mb-2">Opera Maquinário</span>
                      <span className={`text-base font-bold ${triageAns?.maquinario ? 'text-purple-400' : 'text-white'}`}>{triageAns?.maquinario ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                      <span className="text-xs text-purple-300 block mb-2">Blitz Frequente</span>
                      <span className={`text-base font-bold ${triageAns?.blitz ? 'text-purple-400' : 'text-white'}`}>{triageAns?.blitz ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/40 rounded-2xl p-5">
                      <span className="text-xs text-purple-200 block mb-2 font-bold">Laudo Psicomotor</span>
                      <span className={`text-base font-bold ${triageAns?.laudo_psicomotor ? 'text-purple-400' : 'text-white'}`}>{triageAns?.laudo_psicomotor ? 'Deseja Solicitar' : 'Não Solicitado'}</span>
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

                  {/* Resultados dos Testes Interativos (TDAH, Autismo TEA, Calculadora HC) */}
                  {(() => {
                    const pAns = triageAns;
                    const adhdRes = pAns?.adhdTestResult;
                    const autismRes = pAns?.autismTestResult;
                    const hcRes = pAns?.hcPlantCalculator;
                    if (!adhdRes && !autismRes && !hcRes) return null;

                    return (
                      <div className="mt-4 space-y-2.5">
                        <h4 className="text-xs font-bold text-mecura-neon uppercase tracking-wider">
                          Testes Pré-Consulta & Dimensionamento HC Realizados pelo Paciente
                        </h4>
                        {adhdRes && (
                          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[11px] font-bold text-sky-300 block">
                                Teste de TDAH (ASRS-18)
                              </span>
                              <span className="text-xs text-white font-semibold">
                                {adhdRes.classification} ({adhdRes.totalPoints}/{adhdRes.maxPoints} pts)
                              </span>
                            </div>
                            <span className="text-lg font-black text-sky-300 font-mono">
                              {adhdRes.scorePercent}%
                            </span>
                          </div>
                        )}
                        {autismRes && (
                          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[11px] font-bold text-purple-300 block">
                                Teste de Autismo — TEA ({autismRes.targetProfile || 'Adulto'})
                              </span>
                              <span className="text-xs text-white font-semibold">
                                {autismRes.classification} ({autismRes.totalPoints}/{autismRes.maxPoints} pts)
                              </span>
                            </div>
                            <span className="text-lg font-black text-purple-300 font-mono">
                              {autismRes.scorePercent}%
                            </span>
                          </div>
                        )}
                        {hcRes && (
                          <div className="p-3.5 rounded-2xl bg-mecura-neon/10 border border-mecura-neon/30 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <span className="text-[11px] font-bold text-mecura-neon block">
                                  Calculadora de Plantas para HC ({hcRes.cultivationType === 'outdoor' ? 'Outdoor' : 'Indoor'})
                                </span>
                                <span className="text-xs text-white font-semibold">
                                  {hcRes.annualPlants} plantas/ano ({hcRes.plantsPerCycle}/ciclo) · Dose Total: {hcRes.dailyDoseMg}mg/dia · {hcRes.dryFlowersGrams}g flores/ano
                                </span>
                              </div>
                              <span className="text-sm font-black text-mecura-neon font-mono shrink-0">
                                {hcRes.annualPlants} plantas
                              </span>
                            </div>
                            {Array.isArray(hcRes.selectedMedications) && hcRes.selectedMedications.length > 0 && (
                              <div className="pt-1.5 border-t border-white/10 space-y-1">
                                <span className="text-[10px] text-[#A0A0B4] font-bold uppercase block">
                                  Medicamentos Cadastrados Escolhidos como Base pelo Paciente:
                                </span>
                                {hcRes.selectedMedications.map((m: any, i: number) => (
                                  <div key={i} className="text-[11px] text-white/90 flex items-center justify-between bg-black/30 px-2.5 py-1 rounded-lg">
                                    <span className="truncate pr-2 font-medium">{m.name}</span>
                                    <span className="text-mecura-neon font-mono shrink-0">
                                      {m.dailyUnits} {m.unitLabel} (~{m.dailyMg}mg/dia)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </section>

                {/* Section: Health & Social */}
                <section>
                  <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4">
                    Saúde & Social
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                      <span className="text-sm text-mecura-silver block mb-2">Tratamento Atual</span>
                      <span className={`text-base font-bold ${triageAns?.tratamento_atual ? 'text-mecura-neon' : 'text-white'}`}>
                        {triageAns?.tratamento_atual ? 'Sim' : 'Não'}
                      </span>
                      {triageAns?.tratamento_atual_details && (
                        <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                          {triageAns.tratamento_atual_details}
                        </p>
                      )}
                    </div>
                    <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                      <span className="text-sm text-mecura-silver block mb-2">Uso de Remédios</span>
                      <span className={`text-base font-bold ${triageAns?.remedios ? 'text-mecura-neon' : 'text-white'}`}>
                        {triageAns?.remedios ? 'Sim' : 'Não'}
                      </span>
                      {triageAns?.remedios_details && (
                        <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                          {triageAns.remedios_details}
                        </p>
                      )}
                    </div>
                    <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                      <span className="text-sm text-mecura-silver block mb-2">Doença Crônica</span>
                      <span className={`text-base font-bold ${triageAns?.doenca_cronica ? 'text-mecura-neon' : 'text-white'}`}>
                        {triageAns?.doenca_cronica ? 'Sim' : 'Não'}
                      </span>
                      {triageAns?.doenca_cronica_details && (
                        <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                          {triageAns.doenca_cronica_details}
                        </p>
                      )}
                    </div>
                    <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                      <span className="text-sm text-mecura-silver block mb-2">Já usou Cannabis</span>
                      <span className={`text-base font-bold ${triageAns?.cannabis ? 'text-mecura-neon' : 'text-white'}`}>
                        {triageAns?.cannabis ? 'Sim' : 'Não'}
                      </span>
                      {triageAns?.cannabis_details && (
                        <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                          {triageAns.cannabis_details}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </>
            );
          })()}
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

                {/* Brand & Association Buttons in Modal Header */}
                <div className="flex items-center gap-2 bg-[#0F1017] p-2 rounded-2xl border border-mecura-elevated flex-wrap">
                  {/* Associações Nacionais */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-1">
                      🇧🇷 Nacional:
                    </span>
                    <button
                      onClick={() => {
                        setNationalPreference('soucannabis');
                        setBrandPreference('soucannabis');
                        handleGenerateAnalysis(true, 'both', 'soucannabis', importedPreference);
                      }}
                      disabled={isAnalyzing}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        nationalPreference === 'soucannabis'
                          ? 'bg-emerald-500 text-black font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10'
                      }`}
                    >
                      🌱 SouCannabis
                    </button>
                    <button
                      onClick={() => {
                        setNationalPreference('abrace');
                        setBrandPreference('abrace');
                        handleGenerateAnalysis(true, 'both', 'abrace', importedPreference);
                      }}
                      disabled={isAnalyzing}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        nationalPreference === 'abrace'
                          ? 'bg-emerald-500 text-black font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10'
                      }`}
                    >
                      🌿 ABRACE
                    </button>
                    <button
                      onClick={() => {
                        setNationalPreference('abecmed');
                        setBrandPreference('abecmed');
                        handleGenerateAnalysis(true, 'both', 'abecmed', importedPreference);
                      }}
                      disabled={isAnalyzing}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        nationalPreference === 'abecmed'
                          ? 'bg-emerald-500 text-black font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10'
                      }`}
                    >
                      🍃 ABECMED
                    </button>
                  </div>

                  <div className="h-4 w-px bg-mecura-elevated hidden sm:block" />

                  {/* Marcas Importadas */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-1">
                      🌐 Importado:
                    </span>
                    <button
                      onClick={() => {
                        setImportedPreference('pangaia');
                        setBrandPreference('pangaia');
                        handleGenerateAnalysis(true, 'both', nationalPreference, 'pangaia');
                      }}
                      disabled={isAnalyzing}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        importedPreference === 'pangaia'
                          ? 'bg-cyan-400 text-black font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'text-cyan-300 hover:text-white hover:bg-cyan-500/10'
                      }`}
                    >
                      🌿 Pangaia
                    </button>
                    <button
                      onClick={() => {
                        setImportedPreference('flowermed');
                        setBrandPreference('flowermed');
                        handleGenerateAnalysis(true, 'both', nationalPreference, 'flowermed');
                      }}
                      disabled={isAnalyzing}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        importedPreference === 'flowermed'
                          ? 'bg-mecura-neon text-black font-black shadow-[0_0_10px_rgba(166,255,0,0.3)]'
                          : 'text-mecura-silver hover:text-white hover:bg-white/5'
                      }`}
                    >
                      🌸 Flowermed
                    </button>
                    <button
                      onClick={() => {
                        setImportedPreference('greenbudz');
                        setBrandPreference('greenbudz');
                        handleGenerateAnalysis(true, 'both', nationalPreference, 'greenbudz');
                      }}
                      disabled={isAnalyzing}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        importedPreference === 'greenbudz'
                          ? 'bg-mecura-neon text-black font-black shadow-[0_0_10px_rgba(166,255,0,0.3)]'
                          : 'text-mecura-silver hover:text-white hover:bg-white/5'
                      }`}
                    >
                      🌲 GreenBudz
                    </button>
                  </div>
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
                    {(() => {
                      const allMeds = parseMedications(analysisResult).filter(med => med.name);
                      const importedMeds = allMeds.filter(med => med.origin !== 'Nacional');
                      const nationalMeds = allMeds.filter(med => med.origin === 'Nacional');
                      const hybridPair = [importedMeds[0], nationalMeds[0]].filter(Boolean);
                      const allImportedAdded = importedMeds.length > 0 && importedMeds.every(m => isMedicationAdded(m));
                      const allNationalAdded = nationalMeds.length > 0 && nationalMeds.every(m => isMedicationAdded(m));
                      const allHybridAdded = hybridPair.length > 0 && hybridPair.every(m => isMedicationAdded(m));
                      const anyMedAdded = allMeds.some(m => isMedicationAdded(m));
                      
                      const renderMed = (med: any, idx: number, isNational: boolean) => {
                        const isAdded = isMedicationAdded(med);
                        return (
                          <button
                            key={`${isNational ? 'nat' : 'imp'}-${idx}-${med.name}`}
                            type="button"
                            onClick={() => togglePrescribedMedication(med)}
                            className={`p-4 border rounded-xl text-left transition-all group relative overflow-hidden cursor-pointer ${
                              isAdded
                                ? 'bg-mecura-neon/10 border-mecura-neon hover:border-mecura-neon/80 shadow-sm'
                                : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50'
                            }`}
                            title={isAdded ? "Clique para remover da receita" : "Clique para prescrever este medicamento"}
                          >
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              {isAdded ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-mecura-neon bg-mecura-neon/20 px-2.5 py-1 rounded-full border border-mecura-neon/40 shadow-sm">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Prescrito</span>
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-mecura-silver/70 group-hover:text-mecura-neon bg-white/5 group-hover:bg-mecura-neon/10 px-2.5 py-1 rounded-full border border-mecura-elevated group-hover:border-mecura-neon/30 transition-all">
                                  + Prescrever
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2 pr-28">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                isNational 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}>
                                {isNational 
                                  ? (med.name.toLowerCase().includes('abrace') ? '🇧🇷 ABRACE Esperança' : med.name.toLowerCase().includes('abec') ? '🇧🇷 Associação ABECMED' : med.name.toLowerCase().includes('soucannabis') ? '🇧🇷 Associação SouCannabis' : '🇧🇷 Associação Nacional')
                                  : (med.name.toLowerCase().includes('pangaia') ? '🌐 Pangaia Biopharma' : med.name.toLowerCase().includes('flowermed') ? '🌐 Flowermed' : med.name.toLowerCase().includes('greenbudz') ? '🌐 GreenBudzCBD' : '🌐 Importado')}
                              </span>
                            </div>
                            <h4 className={`font-bold mb-1 pr-24 transition-colors ${
                              isAdded ? 'text-mecura-neon' : 'text-white group-hover:text-mecura-neon'
                            }`}>{med.name}</h4>
                            <p className="text-xs text-mecura-silver mb-3 pr-4">{med.dosage}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isAdded ? 'text-red-400/90 group-hover:underline' : 'text-mecura-neon'}`}>
                              {isAdded ? '✕ Clique para remover da receita' : '+ Clique para adicionar à receita'}
                            </span>
                          </button>
                        );
                      };

                      return (
                        <>
                          <div className="flex items-center justify-between mb-6 gap-3">
                            <div>
                              <h3 className="text-xl font-bold text-white">Medicamentos Sugeridos</h3>
                              <p className="text-sm text-mecura-silver">Selecione opções importadas ou nacionais de associações brasileiras</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {anyMedAdded && (
                                <button
                                  type="button"
                                  onClick={() => removeMultiplePrescribedMedications(allMeds)}
                                  className="text-xs font-bold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 px-3 py-1 rounded-full border border-rose-500/40 transition-colors cursor-pointer"
                                >
                                  ✕ Limpar Seleção
                                </button>
                              )}
                              <span className="text-xs px-3 py-1 bg-mecura-surface border border-mecura-elevated rounded-full text-mecura-silver">
                                {allMeds.length} opções disponíveis
                              </span>
                            </div>
                          </div>
                          <div className="space-y-8">
                            {/* Prescrição Híbrida 1+1 (1 Nacional + 1 Importado) */}
                            {importedMeds.length > 0 && nationalMeds.length > 0 && (
                              <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-mecura-surface to-blue-950/60 border border-mecura-neon/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg mb-6">
                                <div>
                                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                                    <Sparkles className="w-4 h-4 text-mecura-neon flex-shrink-0" />
                                    <span>Prescrever Protocolo Híbrido: 1 Nacional + 1 Importado</span>
                                  </div>
                                  <p className="text-xs text-mecura-silver mt-1">
                                    Sinergia clínica ideal: combina o principal fitocanabinoide importado ({importedMeds[0]?.name?.split('(')[0]?.trim()}) com formulação acessível de associação nacional ({nationalMeds[0]?.name?.split('(')[0]?.trim()}).
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleMultiplePrescribedMedications(hybridPair)}
                                  className={`px-4 py-2 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                                    allHybridAdded
                                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40'
                                      : 'bg-mecura-neon text-black hover:shadow-[0_0_15px_rgba(166,255,0,0.5)]'
                                  }`}
                                >
                                  {allHybridAdded ? (
                                    <><span>✕</span> Desmarcar 1+1</>
                                  ) : (
                                    <><span>⚡</span> Prescrever 1+1 Agora</>
                                  )}
                                </button>
                              </div>
                            )}
                            {importedMeds.length > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-4 border-b border-blue-500/20 pb-2">
                                  <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                                    Tratamento Principal (Medicamentos Importados)
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => toggleMultiplePrescribedMedications(importedMeds)}
                                    className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors shadow-sm cursor-pointer ${
                                      allImportedAdded
                                        ? 'text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40'
                                        : 'text-blue-300 hover:text-white bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40'
                                    }`}
                                  >
                                    {allImportedAdded ? '✕ Desmarcar Todos os Importados' : '+ Prescrever Todos os Importados'}
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {importedMeds.map((med, idx) => renderMed(med, idx, false))}
                                </div>
                              </div>
                            )}
                            
                            {nationalMeds.length > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-4 border-b border-emerald-500/20 pb-2 mt-4">
                                  <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                    <span>🇧🇷 Tratamento Nacional (Tríade: Óleo, Extração e Flor)</span>
                                    <span className="text-[10px] text-emerald-300 font-semibold px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">Opção do Paciente</span>
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => toggleMultiplePrescribedMedications(nationalMeds)}
                                    className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors shadow-sm cursor-pointer ${
                                      allNationalAdded
                                        ? 'text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40'
                                        : 'text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40'
                                    }`}
                                  >
                                    {allNationalAdded ? '✕ Desmarcar Todos os Nacionais' : '+ Prescrever Tríade Nacional'}
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {nationalMeds.map((med, idx) => renderMed(med, idx, true))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
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
                <IsolatedFastTextarea 
                  rows={6}
                  value={prescriptionInput}
                  onChange={setPrescriptionInput}
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
                      Buscar & Prescrever Medicamentos
                    </h3>
                    <p className="text-xs text-mecura-silver">
                      Adicione os medicamentos desejados à receita e envie a receita prévia ao final para conferência e validação do paciente.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewProductModalInDashboard(!showNewProductModalInDashboard)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                    title="Cadastrar um novo produto ou formulação não listada no catálogo"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showNewProductModalInDashboard ? 'Ocultar Cadastro' : '+ Cadastrar Novo Medicamento'}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowProductSearchModal(false);
                      setSelectedProduct(null);
                      setShowNewProductModalInDashboard(false);
                    }}
                    className="p-2 rounded-lg text-mecura-silver hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form to Register and Save New Product in Dashboard */}
              {showNewProductModalInDashboard && (
                <div className="p-4 sm:p-5 bg-[#0A0A0F] border-b border-purple-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Cadastrar Novo Medicamento / Produto</span>
                    </div>
                    <span className="text-[11px] text-mecura-silver">
                      Preencha os campos para prescrever e salvar na receita do paciente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                        Nome Comercial / Formulação *
                      </label>
                      <input
                        type="text"
                        value={newDashProdName}
                        onChange={(e) => setNewDashProdName(e.target.value)}
                        placeholder="Ex: Óleo CBD 3000mg Full Spectrum (30ml)"
                        className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                        Fabricante / Associação
                      </label>
                      <input
                        type="text"
                        list="new-dash-prod-brand-list"
                        value={newDashProdBrand}
                        onChange={(e) => setNewDashProdBrand(e.target.value)}
                        placeholder="Ex: Associação Brasileira"
                        className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                      />
                      <datalist id="new-dash-prod-brand-list">
                        <option value="Associação Brasileira (Nacional)" />
                        <option value="Santa Cannabis" />
                        <option value="Abrace Esperança" />
                        <option value="Flor da Vida" />
                        <option value="Flowermed (EUA)" />
                        <option value="GreenBudzCBD" />
                        <option value="Pangaia" />
                        <option value="Abecmed" />
                      </datalist>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                        Origem
                      </label>
                      <select
                        value={newDashProdOrigin}
                        onChange={(e) => setNewDashProdOrigin(e.target.value as 'Nacional' | 'Importado')}
                        className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                      >
                        <option value="Nacional">Associação Nacional (Brasil)</option>
                        <option value="Importado">Importado (EUA/Europa)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                        Composição / Concentração
                      </label>
                      <input
                        type="text"
                        value={newDashProdConcentration}
                        onChange={(e) => setNewDashProdConcentration(e.target.value)}
                        placeholder="Ex: CBD 100mg/mL (10%), THC < 0,2%"
                        className="w-full bg-[#12121A] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                        Forma Farmacêutica
                      </label>
                      <input
                        type="text"
                        value={newDashProdForm}
                        onChange={(e) => setNewDashProdForm(e.target.value)}
                        placeholder="Ex: Solução Oleosa Sublingual (Gotas)"
                        className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[10px] text-mecura-silver uppercase font-bold block mb-1">
                        Quantidade / Volume
                      </label>
                      <input
                        type="text"
                        value={newDashProdQuantity}
                        onChange={(e) => setNewDashProdQuantity(e.target.value)}
                        placeholder="Ex: 01 Frasco de 30 mL"
                        className="w-full bg-[#12121A] border border-mecura-elevated rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">
                      Posologia Inicial / Modo de Uso
                    </label>
                    <textarea
                      rows={2}
                      value={newDashProdDosage}
                      onChange={(e) => setNewDashProdDosage(e.target.value)}
                      placeholder="Ex: Tomar 05 gotas sublinguais de 12/12 horas. Reter sob a língua por 60 segundos antes de deglutir."
                      className="w-full bg-[#12121A] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-mecura-silver">
                      <input
                        type="checkbox"
                        checked={saveDashToCatalog}
                        onChange={(e) => setSaveDashToCatalog(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-mecura-elevated bg-[#12121A]"
                      />
                      <span>Salvar também na Biblioteca Geral para futuras prescrições</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNewProductModalInDashboard(false)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-mecura-silver text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomProductInDashboard}
                        disabled={!newDashProdName.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-mecura-neon hover:from-emerald-400 hover:to-[#b5ff33] text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar à Receita & Salvar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                          {availableBrands.map((brand, bIdx) => (
                            <option key={`${brand}-${bIdx}`} value={brand}>{brand}</option>
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
                          {availableDiseases.map((disease, dIdx) => (
                            <option key={`${disease}-${dIdx}`} value={disease}>{disease}</option>
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
                        ].map((pill, pillIdx) => {
                          const isSelected = 
                            normalizeSearch(productDiseaseFilter).includes(normalizeSearch(pill)) || 
                            normalizeSearch(productDiseaseSearchInput).includes(normalizeSearch(pill));
                          return (
                            <button
                              key={`disease-pill-${pill}-${pillIdx}`}
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
                        <div className="flex items-center gap-2 flex-wrap justify-center">
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
                          <button
                            onClick={() => {
                              if (productSearchTerm) {
                                setNewDashProdName(productSearchTerm);
                              }
                              setShowNewProductModalInDashboard(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                            + Cadastrar Novo Medicamento
                          </button>
                        </div>
                      </div>
                    ) : (
                      filteredGuideProducts.map((product, idx) => {
                        const isImported = (product.origin || '').toLowerCase().includes('importado') || (product.origin || '').toLowerCase().includes('eua');
                        const indicationsArray = product.indications 
                          ? product.indications.split(/[,;•\n]/).map(s => s.trim()).filter(Boolean).slice(0, 3)
                          : (product.categoryIndications || []).slice(0, 3);

                        const isInPresc = prescItems.some(p => p.name.toLowerCase().trim() === product.name.toLowerCase().trim());
                        const prescIndex = prescItems.findIndex(p => p.name.toLowerCase().trim() === product.name.toLowerCase().trim());

                        return (
                          <div 
                            key={`filt-prod-${product.name}-${idx}`}
                            onClick={() => handleToggleProductInPrescription(product)}
                            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer ${
                              isInPresc
                                ? 'bg-emerald-950/25 border-emerald-500/50 hover:border-emerald-400'
                                : 'bg-[#0A0A0F] border-mecura-elevated hover:border-mecura-neon/60 hover:bg-[#12121A]'
                            }`}
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-bold text-sm sm:text-base transition-colors ${
                                  isInPresc ? 'text-emerald-300' : 'text-white group-hover:text-mecura-neon'
                                }`}>
                                  {product.name}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                  isImported
                                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                }`}>
                                  {product.origin || (isImported ? 'Importado' : 'Nacional')}
                                </span>
                                {isImported && product.priceBRL && (
                                  <span className="text-[11px] font-mono font-bold text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded-md border border-mecura-neon/20">
                                    R$ {product.priceBRL}
                                  </span>
                                )}
                                {isInPresc && (
                                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                                    Na Receita
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
                                    <span className="text-emerald-400 font-medium">{product.concentration}</span>
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
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleProductInPrescription(product);
                                }}
                                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                                  isInPresc
                                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                    : 'bg-mecura-neon/15 hover:bg-mecura-neon hover:text-black text-mecura-neon border-mecura-neon/30'
                                }`}
                              >
                                {isInPresc ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Adicionado ({prescIndex + 1}º)</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Adicionar à Receita</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Sticky Prescription Preview Footer */}
                  <div className="p-4 bg-[#12121A] border-t border-mecura-elevated flex flex-col lg:flex-row items-center justify-between gap-3 shrink-0 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">Receita Prévia em Elaboração:</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-mecura-neon/20 text-mecura-neon border border-mecura-neon/30">
                            {prescItems.length} medicamento{prescItems.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {prescItems.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 max-w-xl">
                            {prescItems.map((it, idx) => (
                              <span
                                key={`chip-${it.name}-${idx}`}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white text-[11px] font-medium group"
                              >
                                <span className="truncate max-w-[140px] sm:max-w-[200px]">{it.name}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePrescItemAndSave(it.name);
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded p-0.5 transition-colors cursor-pointer"
                                  title={`Excluir "${it.name}" da receita e salvar`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-mecura-silver truncate max-w-xs sm:max-w-md mt-0.5">
                            Clique em "+ Adicionar à Receita" nos medicamentos acima ou use "+ Novo Produto"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenPrescriptionEditor();
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Cadastrar novo produto ou ajustar composição, apresentações e posologia da receita"
                      >
                        <Plus className="w-3.5 h-3.5 text-purple-300" />
                        <span>+ Novo Produto / Ajustar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenPrescriptionEditor();
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Ajustar Composição & Posologia</span>
                      </button>
                      <button
                        type="button"
                        disabled={prescItems.length === 0}
                        onClick={() => {
                          handleSendReceitaPrevia();
                        }}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-mecura-neon hover:bg-[#b5ff33] text-black font-extrabold rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(166,255,0,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Enviar Receita Prévia ao Paciente</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                  <div className="p-4 rounded-xl border border-mecura-elevated bg-[#0A0A0F]">
                    <h4 className="text-white font-bold text-lg">{selectedProduct.name}</h4>
                    <p className="text-sm text-mecura-silver mt-1">{selectedProduct.manufacturer} • {selectedProduct.type}</p>
                    {selectedProduct.concentration && (
                      <p className="text-xs text-mecura-neon mt-1 font-mono">{selectedProduct.concentration}</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-mecura-silver mb-2">
                        Dosagem / Posologia & Modo de Usar
                      </label>
                      <IsolatedFastTextarea
                        rows={4}
                        value={dosageInput}
                        onChange={setDosageInput}
                        placeholder="Ex: Pingar 2 gotas pela manhã e 4 a noite..."
                        className="w-full bg-[#0A0A0F] border border-mecura-elevated rounded-xl p-3 text-white placeholder-mecura-silver focus:outline-none focus:border-mecura-neon/50 transition-colors text-sm leading-relaxed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-mecura-silver mb-2">
                        Períodos
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['De manhã', 'Depois do almoço', 'De tarde', 'Antes de dormir'].map((period, pIdx) => (
                          <label key={`period-lbl-${period}-${pIdx}`} className="flex items-center gap-2 text-sm text-mecura-pearl bg-[#0A0A0F] border border-mecura-elevated p-3 rounded-xl cursor-pointer hover:border-mecura-neon/50">
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

                  <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-mecura-elevated">
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors"
                    >
                      Voltar
                    </button>

                    <div className="flex items-center gap-2">
                      {selectedProduct && prescItems.some(p => p.name.toLowerCase().trim() === selectedProduct.name.toLowerCase().trim()) && (
                        <button 
                          type="button"
                          onClick={() => {
                            handleRemovePrescItemAndSave(selectedProduct.name);
                            setSelectedProduct(null);
                          }}
                          className="px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                          title="Excluir este medicamento da prescrição e salvar alteração"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          <span>Excluir Medicamento & Salvar</span>
                        </button>
                      )}
                      <button 
                        onClick={handleSendProduct}
                        disabled={!dosageInput.trim()}
                        className="px-5 py-2.5 bg-mecura-neon text-black rounded-xl text-sm font-bold hover:bg-[#b5ff33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(166,255,0,0.2)]"
                      >
                        Enviar Prescrição
                      </button>
                    </div>
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
                    {consultationHistory
                      .filter(h => {
                        const term = (historySearchTerm || '').toLowerCase().trim();
                        if (!term) return true;
                        const matchName = (h.patientName || '').toLowerCase().includes(term);
                        const matchCpf = (h.cpf || '').toLowerCase().includes(term);
                        const matchPhone = (h.phone || '').toLowerCase().includes(term);
                        const matchSummary = (h.summary || '').toLowerCase().includes(term);
                        return matchName || matchCpf || matchPhone || matchSummary;
                      })
                      .sort((a, b) => {
                        const timeA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
                        const timeB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
                        return timeB - timeA;
                      })
                      .map((history, hIdx) => {
                        const histDate = history.date instanceof Date ? history.date : new Date(history.date);
                        const isHistDateValid = !isNaN(histDate.getTime());
                        const formattedDate = isHistDateValid ? format(histDate, 'dd/MM/yyyy HH:mm') : 'Data recente';
                        
                        return (
                          <div 
                            key={`${history.id || 'hist'}-${hIdx}`} 
                            onClick={async () => {
                              setSelectedHistoryItem(history);
                              if (history.id) {
                                const msgs = await fetchPatientMessages(history.id);
                                setSelectedHistoryItem((prev: any) => prev && prev.id === history.id ? { ...prev, messages: msgs } : prev);
                              }
                            }}
                            className="p-5 rounded-2xl bg-[#12121A] border border-mecura-elevated hover:border-mecura-neon/40 hover:bg-[#161622] transition-all group cursor-pointer shadow-lg"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-white text-lg group-hover:text-mecura-neon transition-colors">{history.patientName}</h3>
                                  {history.isPremium ? (
                                    <span className="px-2 py-0.5 rounded-full bg-mecura-neon/15 border border-mecura-neon/30 text-mecura-neon text-[10px] font-bold tracking-wider">
                                      ⭐ PREMIUM
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-mecura-silver text-[10px] font-bold">
                                      ESSENCIAL
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    history.status === 'finished' 
                                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                                      : history.status === 'in-consultation'
                                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                  }`}>
                                    {history.status === 'finished' ? 'Finalizada' : history.status === 'in-consultation' ? 'Em Atendimento' : 'Aguardando'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  <span className="text-xs text-mecura-silver flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5 text-mecura-neon" /> {formattedDate}
                                  </span>
                                  {history.cpf && (
                                    <span className="text-xs text-gray-400 font-mono">
                                      CPF: {history.cpf}
                                    </span>
                                  )}
                                  {history.phone && (
                                    <span className="text-xs text-gray-400">
                                      Tel: {history.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-mecura-neon/10 group-hover:bg-mecura-neon group-hover:text-black text-mecura-neon text-xs font-bold flex items-center gap-1.5 transition-all">
                                <Eye className="w-4 h-4" />
                                <span>Ver Prontuário</span>
                              </button>
                            </div>
                            
                            <p className="text-sm text-gray-300 leading-relaxed italic bg-black/20 p-3 rounded-xl border border-white/5">
                              "{history.summary}"
                            </p>

                            {history.answers?.objectives && Array.isArray(history.answers.objectives) && history.answers.objectives.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {history.answers.objectives.map((obj: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 text-[11px]">
                                    • {obj}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    
                    {consultationHistory.filter(h => {
                      const term = (historySearchTerm || '').toLowerCase().trim();
                      if (!term) return true;
                      return (h.patientName || '').toLowerCase().includes(term) || (h.cpf || '').toLowerCase().includes(term);
                    }).length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-mecura-surface flex items-center justify-center mx-auto mb-4 border border-mecura-elevated">
                          <Search className="w-8 h-8 text-mecura-silver" />
                        </div>
                        <h4 className="text-white font-bold text-base mb-1">Nenhum atendimento encontrado</h4>
                        <p className="text-mecura-silver text-xs">Os registros de pacientes e atendimentos finalizados aparecerão automaticamente aqui sincronizados com o banco de dados.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Top Bar with Back and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <button 
                        onClick={() => setSelectedHistoryItem(null)}
                        className="inline-flex items-center gap-2 text-mecura-neon hover:text-[#b5ff33] text-sm font-bold transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 rotate-45" /> Voltar para a lista de histórico
                      </button>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenProgrammedForPatient(selectedHistoryItem);
                          }}
                          className="px-3.5 py-2 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white border border-purple-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          title="Emitir Receita Programada diretamente para este paciente"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                          <span>Receita Programada</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenPrescriptionEditor(selectedHistoryItem);
                          }}
                          className="px-3.5 py-2 bg-mecura-neon/15 hover:bg-mecura-neon hover:text-black text-mecura-neon border border-mecura-neon/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Abrir Editor de Receita Digital para este paciente"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Emitir Receita</span>
                        </button>
                        <button
                          onClick={() => {
                            handleWhatsAppCall(selectedHistoryItem);
                          }}
                          className="px-3.5 py-2 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Chamar no WhatsApp</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowHistoryModal(false);
                            handleStartConsultation(selectedHistoryItem);
                          }}
                          className="px-4 py-2 bg-mecura-neon hover:bg-[#b5ff33] text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(166,255,0,0.2)] cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Abrir Chat do Paciente</span>
                        </button>
                      </div>
                    </div>

                    {/* Patient Overview Card */}
                    <div className="p-5 rounded-2xl bg-[#12121A] border border-mecura-elevated">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-white font-bold text-xl">{selectedHistoryItem.patientName}</h3>
                            {selectedHistoryItem.isPremium && (
                              <span className="px-2 py-0.5 rounded-full bg-mecura-neon/20 border border-mecura-neon/40 text-mecura-neon text-xs font-bold">
                                ⭐ PREMIUM
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-mecura-silver mt-1 flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-mecura-neon" />
                            Atendimento registrado em: {selectedHistoryItem.date instanceof Date ? format(selectedHistoryItem.date, 'dd/MM/yyyy HH:mm') : format(new Date(selectedHistoryItem.date), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">CPF</span>
                          <span className="text-white font-mono font-medium">{selectedHistoryItem.cpf || 'Não informado'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">Nascimento</span>
                          <span className="text-white font-medium">{selectedHistoryItem.birthDate || 'Não informada'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">Telefone</span>
                          <span className="text-white font-medium">{selectedHistoryItem.phone || 'Não informado'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-0.5">Status</span>
                          <span className="text-mecura-neon font-bold">{selectedHistoryItem.status === 'finished' ? 'Finalizada' : selectedHistoryItem.status === 'in-consultation' ? 'Em Atendimento' : 'Fila'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Evolution Chart */}
                    <div className="p-6 rounded-3xl bg-[#12121A] border border-mecura-elevated">
                      <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-mecura-neon" /> Gráfico de Evolução (Intensidade dos Sintomas)
                      </h4>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={consultationHistory
                              .filter(h => h.patientName === selectedHistoryItem.patientName || h.id === selectedHistoryItem.id)
                              .sort((a, b) => (a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime()) - (b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime()))
                              .map(h => ({
                                date: h.date instanceof Date ? format(h.date, 'dd/MM') : format(new Date(h.date), 'dd/MM'),
                                intensity: h.intensity || 5
                              }))
                            }
                          >
                            <defs>
                              <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A6FF00" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#A6FF00" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2D" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid #1E1E2D', borderRadius: '12px' }}
                              itemStyle={{ color: '#A6FF00' }}
                            />
                            <Area type="monotone" dataKey="intensity" stroke="#A6FF00" strokeWidth={3} fillOpacity={1} fill="url(#colorIntensity)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-mecura-silver text-center mt-4 uppercase tracking-widest">
                        Escala de 0 a 10 (Menor valor indica melhora)
                      </p>
                    </div>

                    {/* Prescriptions, Reports & Attachments */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h4 className="text-white font-bold flex items-center gap-2">
                          <FileText className="w-5 h-5 text-mecura-neon" /> Documentos e Prescrições Registradas
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenProgrammedForPatient(selectedHistoryItem)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white border border-purple-400/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            title="Emitir receita rápida padronizada para este paciente"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                            <span>+ Receita Programada</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenPrescriptionEditor(selectedHistoryItem)}
                            className="px-3 py-1.5 rounded-xl bg-mecura-neon/15 hover:bg-mecura-neon hover:text-black text-mecura-neon border border-mecura-neon/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Emitir nova receita médica livre para este paciente"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Nova Receita</span>
                          </button>
                        </div>
                      </div>
                      
                      {selectedHistoryItem.messages && selectedHistoryItem.messages
                        .filter((m: any) => m.type === 'prescription' || m.type === 'medical_report' || m.type === 'psychomotor_report' || m.type === 'agronomic_report' || m.type === 'document' || m.attachment || m.type === 'product' || m.type === 'prescription_notes')
                        .map((msg: any, idx: number) => (
                          <div key={idx} className="p-5 rounded-2xl bg-[#12121A] border border-mecura-elevated">
                            {/* Product */}
                            {msg.type === 'product' && msg.productData && (
                              <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl bg-mecura-neon/10 border border-mecura-neon/20 flex items-center justify-center flex-shrink-0">
                                  <Pill className="w-6 h-6 text-mecura-neon" />
                                </div>
                                <div>
                                  <span className="text-[10px] text-mecura-neon uppercase font-bold tracking-wider">Medicamento Prescrito</span>
                                  <h5 className="text-white font-bold text-sm">{msg.productData.name}</h5>
                                  <p className="text-xs text-mecura-silver mt-0.5">{msg.productData.brand} • {msg.productData.origin}</p>
                                  {msg.productData.dosage && (
                                    <div className="mt-2 text-xs text-gray-300 bg-black/20 p-2 rounded-lg">
                                      {(Array.isArray(msg.productData.dosage) ? msg.productData.dosage : [msg.productData.dosage]).map((d: string, i: number) => (
                                        <p key={i}>• {d}</p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Attached Document / Prescription / Reports with Download Button */}
                            {msg.attachment?.url && (
                              <div className="flex items-center justify-between gap-4 mt-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                                    <FileText className="w-5 h-5 text-mecura-neon" />
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-mecura-neon font-bold uppercase tracking-wider block">
                                      {msg.attachment.title || (msg.type === 'medical_report' ? 'Laudo Médico' : msg.type === 'psychomotor_report' ? 'Laudo Psicomotor' : msg.type === 'agronomic_report' ? 'Parecer Agronômico' : 'Receita Digital')}
                                    </span>
                                    <p className="text-xs text-white font-semibold">{msg.attachment.name || 'documento.pdf'}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => downloadOrGenerateAttachment(msg.attachment, undefined, msg.attachment.name || 'Documento_MeCura.pdf')}
                                  className="px-3.5 py-2 bg-mecura-neon text-black font-bold text-xs rounded-xl hover:bg-[#b5ff33] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" /> Baixar PDF
                                </button>
                              </div>
                            )}

                            {/* Prescription Notes */}
                            {msg.type === 'prescription_notes' && (
                              <div className="mt-2 p-3.5 rounded-xl bg-mecura-neon/5 border border-mecura-neon/20">
                                <p className="text-xs font-bold text-mecura-neon uppercase mb-1">Orientações Médicas e Posologia</p>
                                <p className="text-xs text-mecura-silver leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      
                      {(!selectedHistoryItem.messages || selectedHistoryItem.messages.filter((m: any) => m.type === 'prescription' || m.type === 'medical_report' || m.type === 'psychomotor_report' || m.type === 'agronomic_report' || m.type === 'document' || m.attachment || m.type === 'product' || m.type === 'prescription_notes').length === 0) && (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-mecura-elevated">
                          <p className="text-mecura-silver text-sm">Nenhuma receita ou arquivo anexado registrado nesta consulta.</p>
                        </div>
                      )}
                    </div>

                    {/* Clinical Summary & Objectives */}
                    <div className="p-6 rounded-2xl bg-[#12121A] border border-mecura-elevated">
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-mecura-neon" /> Resumo Clínico & Queixas
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        {selectedHistoryItem.summary}
                      </p>
                      {selectedHistoryItem.answers?.objectives && Array.isArray(selectedHistoryItem.answers.objectives) && (
                        <div className="pt-3 border-t border-white/5">
                          <span className="text-xs text-mecura-silver font-bold uppercase tracking-wider block mb-2">Objetivos de Tratamento Informados:</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedHistoryItem.answers.objectives.map((obj: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-mecura-neon/10 border border-mecura-neon/20 text-mecura-neon text-xs font-medium">
                                ✓ {obj}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
                  <IsolatedFastTextarea
                    rows={4}
                    value={accessibleImportCustomMessage}
                    onChange={setAccessibleImportCustomMessage}
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
                    Selecione a Formulação de Entrada
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Option Broad Spectrum CBD/CBN */}
                    <div 
                      onClick={() => setAccessibleType('broad_cbn')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        accessibleType === 'broad_cbn'
                          ? 'bg-indigo-950/40 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400'
                          : 'bg-mecura-surface/40 border-mecura-elevated hover:border-indigo-500/40 hover:bg-mecura-surface/70'
                      }`}
                    >
                      {accessibleType === 'broad_cbn' && (
                        <div className="absolute top-2 right-2 text-indigo-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 inline-block mb-2">
                          Sono / Relaxamento / 0% THC
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-1">
                          Broad SPECTRUM CBD, CBN 1065mg (15ml)
                        </h4>
                        <p className="text-[11px] text-mecura-silver leading-relaxed mb-3">
                          Sinergia de CBD e CBN para indução do sono, relaxamento fisiológico e desaceleração mental.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-mecura-elevated/50 text-[10px] text-indigo-400 font-semibold flex items-center justify-between">
                        <span>15ml • R$ 210</span>
                        <span className="text-white/80">2 gotas manhã / 4 noite</span>
                      </div>
                    </div>

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
                  <IsolatedFastTextarea
                    rows={4}
                    value={accessibleCustomMessage || `Olá ${currentPatient?.patientName || userName || 'Paciente'}! Pensando na sua acessibilidade e conforto financeiro, estruturei um Protocolo de Entrada Acessível através de Associação Brasileira autorizada.\n\nIniciaremos com apenas 01 medicamento essencial de alto rendimento que dura cerca de 2 meses com a posologia inicial.\n\nVamos acompanhar sua resposta e, conforme sua evolução e condições futuras, poderemos ajustar as doses ou introduzir novos itens se houver real necessidade. Conte sempre com nosso apoio!`}
                    onChange={setAccessibleCustomMessage}
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
        onSave={handleSavePrescription}
        onDownloadPDF={handleDownloadPrescriptionFromEditor}
        onSendToChat={handleSendPrescriptionToChat}
        onSendPreviewToChat={handleSendReceitaPrevia}
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
        onSendToChat={handleSendMedicalReportToChat}
        onSave={handleSaveMedicalReport}
        onResetFromTriage={handleResetMedicalReportFromTriage}
        isSendingToChat={isSendingReportToChat}
        reportType={medicalReportType}
        prescribedItems={prescItems}
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
        onSendToChat={handleSendPsychomotorReportToChat}
        onSave={handleSavePsychomotorReport}
        isSendingToChat={isSendingPsychomotorToChat}
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
        prescribedProducts={prescItems.length > 0 ? prescItems.map((it, idx) => `${idx + 1}. ${it.name} (${it.brand || 'Associação'} - ${it.origin || 'Nacional'})`).join('\n') : ''}
        onResetFromTriage={handleResetAgronomicReportFromTriage}
        onDownloadPDF={handleDownloadAgronomicReportFromEditor}
        onSendToChat={handleSendAgronomicReportToChat}
        onSave={handleSaveAgronomicReport}
        isSendingToChat={isSendingAgronomicToChat}
      />

      {/* Standalone Document Generator Modal (Receitas e Laudos Avulsos) */}
      <StandaloneDocumentModal
        isOpen={isStandaloneDocModalOpen}
        onClose={() => setIsStandaloneDocModalOpen(false)}
        currentPatient={currentPatient}
        onOpenPrescriptionEditor={(patientData, prefillItems) => {
          if (prefillItems && prefillItems.length > 0) {
            setPrescItems(prefillItems);
          }
          handleLaunchStandalonePrescription(patientData);
        }}
        onOpenMedicalReportEditor={(patientData, reportType) => {
          handleLaunchStandaloneMedicalReport(patientData, reportType);
        }}
        onOpenPsychomotorReportEditor={(patientData) => {
          handleLaunchStandalonePsychomotorReport(patientData);
        }}
        onOpenAgronomicReportEditor={(patientData) => {
          handleLaunchStandaloneAgronomicReport(patientData);
        }}
      />

      {/* Modal de Senha para Área do Psicólogo */}
      <AreaPasswordModal
        isOpen={isPsychologistAuthModalOpen}
        onClose={() => setIsPsychologistAuthModalOpen(false)}
        targetArea="psychologist"
        onSuccess={() => {
          setIsPsychologistAuthModalOpen(false);
          navigate('/psychologist');
        }}
      />

      {/* Modal de Receitas Programadas (Perfis Rápidos) */}
      <ProgrammedPrescriptionsModal
        isOpen={showProgrammedPrescriptionModal}
        onClose={() => {
          setShowProgrammedPrescriptionModal(false);
          setProgrammedTargetPatient(null);
        }}
        patientInfo={(() => {
          const target = programmedTargetPatient || currentPatient;
          if (!target) return null;
          const targetAnswers = target.answers || answers;
          return {
            id: target.id,
            name: target.patientName || target.name || userName || 'Paciente',
            cpf: target.cpf || targetAnswers?.cpf || userCpf,
            birthDate: target.birthDate || targetAnswers?.birthDate || userBirthDate,
            phone: target.phone || targetAnswers?.phone || userPhone
          };
        })()}
        allPatients={[
          ...queue,
          ...consultationHistory
        ]}
        onApplyProfile={(profile, mode, targetPatient) => {
          handleApplyProgrammedFromDashboard(profile, mode, targetPatient || programmedTargetPatient || currentPatient);
        }}
        onDirectEmitPDF={(profile, targetPatient) => {
          return handleDirectEmitProgrammedPDF(profile, targetPatient || programmedTargetPatient || currentPatient);
        }}
      />

      {/* Action Toast Feedback Banner */}
      {actionToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#1A1A28] border border-mecura-neon/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-mecura-neon/20 border border-mecura-neon/40 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-mecura-neon" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{actionToastMessage}</p>
            </div>
            <button
              onClick={() => setActionToastMessage(null)}
              className="ml-2 text-mecura-silver hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}