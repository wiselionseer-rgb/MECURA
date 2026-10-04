import html2pdf from "html2pdf.js";
import Markdown from 'react-markdown';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { isToday, isThisWeek, isThisMonth, parseISO, isFuture, startOfDay } from 'date-fns';
import {
  Users,
  FileText,
  Download, UserCircle, MessageCircle,
  Pill,
  MessageSquare,
  BarChart,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Bell,
  Send,
  Ticket,
  Calendar,
  Clock,
  BrainCircuit,
  Paperclip,
  Bot,
  User,
  X, Key, AlertTriangle
, Edit3, Check, LogOut, RefreshCw, Scale, Building2, Lock, ShieldCheck, CreditCard } from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { cbdGuideData, CBDCategory, CBDProduct } from '../data/cbdGuide';
import { mergeProductCatalogs, subscribeToFirestoreCatalog, syncCatalogToFirestore } from '../utils/productCatalog';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { db, auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs, deleteDoc, addDoc, setDoc } from 'firebase/firestore';
import { INSTITUTIONAL_INFO, LEGAL_OPINION_DATA, PRIVACY_POLICY_LGPD_DATA, TERMS_OF_USE_DATA } from '../data/legalAndPrivacy';
import { triggerAdminBackgroundPush } from '../utils/notifications';

export const AdminDashboardScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications' | 'agenda' | 'password_requests' | 'legal'>('overview');
  

  const [sendingQueueIds, setSendingQueueIds] = useState<Record<string, boolean>>({});

  const forceSendToQueue = async (patient: any) => {
    const pId = patient.id || patient.uid || patient.userId || patient.patientId;
    if (!pId) {
      setSupportToastMessage('ID do paciente não encontrado');
      setShowSupportToast(true);
      setTimeout(() => setShowSupportToast(false), 3000);
      return;
    }

    const isPrem = !!(patient.isPremium || patient.tier === 'Premium' || patient.plan === 'premium' || patient.answers?.isPremium || patient.pagamento_premium);
    const pName = (patient.name || patient.patientName || 'Paciente').trim();

    const queuePayload = {
      id: pId,
      patientId: pId,
      patientName: pName,
      name: pName,
      email: patient.email || 'sem-email@mecura.com',
      phone: patient.phone || patient.whatsapp || patient.answers?.phone || patient.answers?.whatsapp || '',
      cpf: patient.cpf || patient.answers?.cpf || '',
      birthDate: patient.birthDate || patient.answers?.birthDate || '',
      tier: isPrem ? 'Premium' : (patient.tier || 'basic'),
      isPremium: isPrem,
      plan: isPrem ? 'premium' : 'basic',
      status: 'waiting',
      joinedAt: new Date().toISOString(),
      hasUnread: true,
      lastMessageAt: new Date().toISOString(),
      lastMessageText: 'Paciente adicionado à fila pelo Administrador',
      answers: patient.answers || {},
      pagamento_consulta: true,
      pagamento_premium: isPrem
    };

    // 1. Instant optimistic local UI update in Zustand
    setSendingQueueIds(prev => ({ ...prev, [pId]: true }));
    const currentQueue = useStore.getState().queue || [];
    const existsIdx = currentQueue.findIndex(q => q.id === pId);
    let updatedQueue: any[];
    if (existsIdx >= 0) {
      updatedQueue = currentQueue.map((item, idx) => idx === existsIdx ? { ...item, ...queuePayload, joinedAt: new Date() } : item);
    } else {
      updatedQueue = [{ ...queuePayload, joinedAt: new Date() }, ...currentQueue];
    }
    useStore.setState({ queue: updatedQueue });

    setSupportToastMessage(`${pName} enviado para a fila do médico com sucesso!`);
    setShowSupportToast(true);
    setTimeout(() => setShowSupportToast(false), 3000);

    // 2. Safe non-blocking background persistence
    try {
      // Background Firestore writes with timeout
      Promise.race([
        setDoc(doc(db, 'queue', pId), queuePayload, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))
      ]).catch(e => console.warn('[ADMIN QUEUE] Firestore queue setDoc:', e));

      Promise.race([
        setDoc(doc(db, 'users', pId), {
          inQueue: true,
          consultationStatus: 'waiting',
          pagamento_consulta: true,
          lastUpdated: new Date().toISOString()
        }, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))
      ]).catch(e => console.warn('[ADMIN QUEUE] Firestore users setDoc:', e));

      // Clean old consultation messages
      const msgsRef = collection(db, 'active_consultations', pId, 'messages');
      getDocs(msgsRef).then(snap => {
        snap.forEach(docSnap => deleteDoc(doc(msgsRef, docSnap.id)).catch(() => {}));
      }).catch(() => {});

      // Sincronizar com o endpoint do servidor (/api/queue/force-join)
      fetch('/api/queue/force-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queuePayload)
      }).catch(srvErr => console.warn('[SERVER QUEUE SYNC] Erro ao sincronizar com servidor:', srvErr));

      // Disparar notificação para o painel do médico
      triggerAdminBackgroundPush(
        isPrem ? '👑 Novo Paciente VIP na Fila' : '🔔 Novo Paciente na Fila',
        `${pName} foi enviado para a fila pelo Administrador.`,
        '/doctor'
      );
    } finally {
      setTimeout(() => {
        setSendingQueueIds(prev => ({ ...prev, [pId]: false }));
      }, 500);
    }
  };
const [agendaTimeFilter, setAgendaTimeFilter] = useState('all');
  const [patientSearch, setPatientSearch] = useState('');
  const [deletePatientConfirm, setDeletePatientConfirm] = useState<string | null>(null);
  const [showEditPatientPassword, setShowEditPatientPassword] = useState<string | null>(null);
  const [newPatientPassword, setNewPatientPassword] = useState('');
  const [agendaStatusFilter, setAgendaStatusFilter] = useState('all');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<string | null>(null);

  const [mpStatus, setMpStatus] = useState<{ configured: boolean; tokenPrefix: string | null } | null>(null);
  const [mpInputToken, setMpInputToken] = useState('');
  const [isSavingMpToken, setIsSavingMpToken] = useState(false);
  const [isSyncingMpPayments, setIsSyncingMpPayments] = useState(false);

  useEffect(() => {
    fetch('/api/mercadopago-status')
      .then(res => res.json())
      .then(data => setMpStatus(data))
      .catch(() => {});

    // Sincroniza pagamentos reais do Mercado Pago automaticamente ao abrir o painel
    fetch('/api/mercadopago-payments').catch(() => {});
  }, []);

  const handleSyncMpPayments = async () => {
    setIsSyncingMpPayments(true);
    try {
      const res = await fetch('/api/mercadopago-payments');
      const data = await res.json();
      if (data.configured) {
        setSupportToastMessage(`${data.count || 0} pagamentos sincronizados com o Mercado Pago!`);
        setShowSupportToast(true);
        setTimeout(() => setShowSupportToast(false), 3000);
      } else {
        setSupportToastMessage('Token do Mercado Pago não configurado.');
        setShowSupportToast(true);
        setTimeout(() => setShowSupportToast(false), 3000);
      }
    } catch (e) {
      console.error(e);
      setSupportToastMessage('Erro ao sincronizar com Mercado Pago.');
      setShowSupportToast(true);
      setTimeout(() => setShowSupportToast(false), 3000);
    } finally {
      setIsSyncingMpPayments(false);
    }
  };
  const handleDeleteNotification = async (id: string) => {
    deleteNotification(id);
    try {
      if (id.startsWith('global_')) {
        // Unfortunately we might not have the exact doc id if it wasn't saved, 
        // but let's try to find it by query if it doesn't match a doc
        // Actually, if we just delete it from local it's fine, but the old toast issue was solved by the 30 seconds limit!
      } else {
         const docRef = doc(db, 'global_notifications', id);
         await deleteDoc(docRef).catch(() => {});
         const docRef2 = doc(db, 'notifications', id);
         await deleteDoc(docRef2).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const {
    doctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    notifications,
    addNotification,
    deleteNotification,
    promotionsText,
    setPromotionsText,
    catalogUrl,
    setCatalogUrl,
    productCategories: rawProductCategories,
    setProductCategories,
    addProduct,
    updateProduct,
    deleteProduct
  } = useAdminStore();

  // Unified product categories: base catalog + admin modifications from store
  const productCategories = useMemo(() => {
    return mergeProductCatalogs(cbdGuideData, rawProductCategories);
  }, [rawProductCategories]);

  const { 
    queue, 
    subscribeToQueue, 
    allAppointments, 
    subscribeToAppointments, 
    confirmAppointment, 
    cancelAppointment, 
    rescheduleAppointment, 
    exchangeRate, 
    updateExchangeRate,
    subscribeToExchangeRate
  } = useStore();

  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const passwordRequests = supportRequests.filter(req => req.userId === 'recovery');
  const generalNotifications = supportRequests.filter(req => req.userId !== 'recovery');

  const [patients, setPatients] = useState<any[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [payments, setPayments] = useState<any[]>([]);
  const [isRefreshingCoupons, setIsRefreshingCoupons] = useState(false);

  // Robust, debounced Toast Helper
  const [showSupportToast, setShowSupportToast] = useState(false);
  const [supportToastMessage, setSupportToastMessage] = useState("");
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setSupportToastMessage(message);
    setShowSupportToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowSupportToast(false);
    }, 3500);
  }, []);

  const handleRefreshCoupons = async () => {
    setIsRefreshingCoupons(true);
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      const list: any[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          code: d.code || docSnap.id,
          discount: Number(d.discount) || 0,
          discountType: d.discountType || 'percentage',
          active: d.active !== undefined ? d.active : true,
          quantity: d.quantity !== undefined ? Number(d.quantity) : 0,
          usedCount: Number(d.usedCount) || 0,
          usedBy: Array.isArray(d.usedBy) ? d.usedBy : [],
          ownerId: d.ownerId || undefined,
        });
      });
      useAdminStore.setState({ coupons: list });
      showToast(`${list.length} cupom(ns) sincronizados com sucesso.`);
    } catch (e: any) {
      console.error("Erro ao atualizar cupons:", e);
      showToast("Erro ao sincronizar cupons: " + (e?.message || 'Tente novamente'));
    } finally {
      setIsRefreshingCoupons(false);
    }
  };

  const handleManualSyncCatalog = async () => {
    try {
      await syncCatalogToFirestore(productCategories);
      showToast("Catálogo oficial sincronizado com a nuvem com sucesso!");
    } catch (e: any) {
      showToast("Erro ao sincronizar catálogo: " + (e?.message || 'Tente novamente'));
    }
  };

  useEffect(() => {
    // Fetch users (patients)
    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      usersData.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setPatients(usersData);
    });

    // Subscribe to global queue store, appointments and exchange rate
    const unsubscribeQueueStore = subscribeToQueue();
    const unsubscribeAppointmentsStore = subscribeToAppointments();
    const unsubscribeExchangeRateStore = subscribeToExchangeRate();

    // Fetch queue count
    const qQueue = query(collection(db, 'queue'));
    const unsubscribeQueue = onSnapshot(qQueue, (snapshot) => {
      setQueueCount(snapshot.size);
    });

    const qPayments = query(collection(db, 'payments'));
    const unsubscribePayments = onSnapshot(qPayments, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeUsers();
      if (unsubscribeQueueStore) unsubscribeQueueStore();
      if (unsubscribeAppointmentsStore) unsubscribeAppointmentsStore();
      if (unsubscribeExchangeRateStore) unsubscribeExchangeRateStore();
      unsubscribeQueue();
      unsubscribePayments();
    };
  }, [subscribeToQueue, subscribeToAppointments, subscribeToExchangeRate]);

  const prevSupportRequestsCountRef = useRef(0);
  useEffect(() => {
    const q = query(collection(db, 'support_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeRequests = requests.filter((r: any) => r.status === 'pending');
      
      if (activeRequests.length > prevSupportRequestsCountRef.current && prevSupportRequestsCountRef.current > 0) {
        showToast("Nova solicitação de suporte recebida!");
      }
      prevSupportRequestsCountRef.current = activeRequests.length;
      setSupportRequests(activeRequests);
    });

    return () => unsubscribe();
  }, [showToast]);

  // Modals state
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({ name: '', crm: '', email: '', password: '' });
  const [showEditPassword, setShowEditPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showAgenda, setShowAgenda] = useState<string | null>(null);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount: 10, quantity: 0 });
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '' });

  // Catalog State
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showEditMedicineModal, setShowEditMedicineModal] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<{ catId: string; originalName: string } | null>(null);
  const [showImportMedicineModal, setShowImportMedicineModal] = useState(false);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [newMedicine, setNewMedicine] = useState({
    name: 'Broad SPECTRUM CBD, CBN 1065mg —————- 15ml',
    manufacturer: 'Associação Nacional',
    origin: 'Nacional',
    type: 'Óleo Broad Spectrum CBD + CBN (0% THC)',
    concentration: 'CBD + CBN 1065mg (71 mg/mL) • Frasco de 15 mL',
    pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
    quantity: '01 Frasco de 15 mL',
    administrationRoute: 'Via Sublingual / Oral',
    priceBRL: '210',
    usageInstructions: 'Pingar 2 gotas pela manhã e 4 a noite.\n- Aumentar 1 gota a cada 7 dias, sendo máximo de 10 gotas por dose.\n- Se obtiver melhora dos sintomas em doses mínimas não a necessidade de chegar em dose máxima.',
    indications: 'Insônia, Distúrbios do Sono, Ansiedade, Estresse Crônico, Agitação Noturna, Síndrome das Pernas Inquietas',
    description: 'Extrato Broad Spectrum combinando Canabidiol (CBD) e Canabinol (CBN) totalizando 1065mg em frasco de 15ml, com zero THC (0,0%). O Canabinol (CBN) atua sinergicamente com o CBD na indução do sono, relaxamento profundo e desaceleração mental sem efeitos psicoativos.',
    categoryId: 'associacoes_nacionais'
  });
  const [diseaseFilter, setDiseaseFilter] = useState('');

  const handleOpenAddMedicine = (defaultCatId: string = 'associacoes_nacionais') => {
    setNewMedicine({
      name: '',
      manufacturer: defaultCatId === 'associacoes_nacionais' ? 'Associação Nacional' : 'Flowermed (EUA)',
      origin: defaultCatId === 'associacoes_nacionais' ? 'Nacional' : 'Importado',
      type: 'Óleo Broad Spectrum CBD + CBN (0% THC)',
      concentration: 'CBD + CBN 1065mg (71 mg/mL) • Frasco de 15 mL',
      pharmaceuticalForm: 'Solução Oleosa Sublingual (Gotas)',
      quantity: '01 Frasco de 15 mL',
      administrationRoute: 'Via Sublingual / Oral',
      priceBRL: '210',
      usageInstructions: 'Pingar 2 gotas pela manhã e 4 a noite.\n- Aumentar 1 gota a cada 7 dias, sendo máximo de 10 gotas por dose.\n- Se obtiver melhora dos sintomas em doses mínimas não a necessidade de chegar em dose máxima.',
      indications: 'Insônia, Distúrbios do Sono, Ansiedade, Estresse Crônico, Agitação Noturna, Síndrome das Pernas Inquietas',
      description: '',
      categoryId: defaultCatId
    });
    setMedicineToEdit(null);
    setShowAddMedicineModal(true);
  };

  const handleOpenEditMedicine = (catId: string, prod: CBDProduct) => {
    setMedicineToEdit({ catId, originalName: prod.name });
    setNewMedicine({
      name: prod.name,
      manufacturer: prod.manufacturer || 'Associação Nacional',
      origin: prod.origin || 'Nacional',
      type: prod.type || 'Óleo Medicinal',
      concentration: prod.concentration || '',
      pharmaceuticalForm: prod.pharmaceuticalForm || 'Solução Oleosa Sublingual (Gotas)',
      quantity: prod.quantity || (prod.details?.find(d => d.includes('Frasco') || d.includes('mL') || d.includes('ml')) || '01 Frasco'),
      administrationRoute: prod.administrationRoute || 'Via Sublingual / Oral',
      priceBRL: String(prod.priceBRL || (prod.priceUSD ? (prod.priceUSD * exchangeRate).toFixed(0) : '')),
      usageInstructions: prod.usageInstructions || '',
      indications: prod.indications || '',
      description: prod.description || '',
      categoryId: catId
    });
    setShowEditMedicineModal(true);
  };

  const handleSaveMedicine = () => {
    if (!newMedicine.name.trim()) return;
    const prodObj: CBDProduct = {
      name: newMedicine.name.trim(),
      manufacturer: newMedicine.manufacturer.trim() || 'Associação Nacional',
      origin: newMedicine.origin || 'Nacional',
      type: newMedicine.type.trim() || 'Óleo Medicinal',
      concentration: newMedicine.concentration.trim() || 'CBD + CBN 1065mg (71 mg/mL) • Frasco de 15 mL',
      pharmaceuticalForm: newMedicine.pharmaceuticalForm.trim() || 'Solução Oleosa Sublingual (Gotas)',
      quantity: newMedicine.quantity.trim() || '01 Frasco de 15 mL',
      administrationRoute: newMedicine.administrationRoute.trim() || 'Via Sublingual / Oral',
      priceBRL: Number(newMedicine.priceBRL) || 0,
      usageInstructions: newMedicine.usageInstructions.trim(),
      indications: newMedicine.indications.trim(),
      description: newMedicine.description.trim() || newMedicine.usageInstructions.trim(),
      details: [newMedicine.quantity, newMedicine.type, newMedicine.origin].filter(Boolean),
      activeIngredients: newMedicine.name.includes('CBN') ? 'Canabidiol (CBD) Broad Spectrum + Canabinol (CBN) - Total 1065mg' : 'Canabidiol (CBD)'
    };

    if (showEditMedicineModal && medicineToEdit) {
      updateProduct(medicineToEdit.catId, medicineToEdit.originalName, prodObj);
      setShowEditMedicineModal(false);
      setMedicineToEdit(null);
    } else {
      addProduct(newMedicine.categoryId || 'associacoes_nacionais', prodObj);
      setShowAddMedicineModal(false);
    }
  };
  
  // AI Chat States
  const [aiChatHistory, setAiChatHistory] = useState<Array<{role: 'user'|'ai', text: string, file?: any}>>([
      { role: 'ai', text: 'Olá! Sou o assistente de IA da Mecura. Envie um arquivo (PDF, Tabela) e me diga o que deseja atualizar ou adicionar no catálogo!' }
  ]);
  const [aiInputText, setAiInputText] = useState('');

  // Agronomic Report States
  const [agronomicMedicalReport, setAgronomicMedicalReport] = useState('');
  const [agronomicPrescription, setAgronomicPrescription] = useState('');
  const [agronomicTargetPlants, setAgronomicTargetPlants] = useState('');
  const [agronomicMedicalFile, setAgronomicMedicalFile] = useState<any>(null);
  const [agronomicPrescriptionFile, setAgronomicPrescriptionFile] = useState<any>(null);
  const medFileRef = useRef<HTMLInputElement>(null);
  const prescFileRef = useRef<HTMLInputElement>(null);
  
  const handleMedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        setAgronomicMedicalFile({ name: file.name, data: event.target?.result as string, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };
  
  const handlePrescFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        setAgronomicPrescriptionFile({ name: file.name, data: event.target?.result as string, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };
  const [agronomicResult, setAgronomicResult] = useState('');
  const [isEditingAgronomic, setIsEditingAgronomic] = useState(false);
  const [isAgronomicLoading, setIsAgronomicLoading] = useState(false);

  const handleGenerateAgronomic = async () => {
    if ((!agronomicMedicalReport && !agronomicMedicalFile) || (!agronomicPrescription && !agronomicPrescriptionFile)) {
       alert("Forneça o laudo médico e a receita (em texto ou arquivo).");
       return;
    }
    setIsAgronomicLoading(true);
    setAgronomicResult('');
    try {
      const response = await fetch('/api/admin-agronomic-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           medicalReportText: agronomicMedicalReport,
           prescriptionText: agronomicPrescription,
           medicalReportFile: agronomicMedicalFile,
           prescriptionFile: agronomicPrescriptionFile,
           targetPlants: agronomicTargetPlants
        })
      });
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Servidor retornou HTML ou erro não-JSON:", responseText);
        if (response.status === 413) {
           throw new Error("Os arquivos anexados são muito grandes. Tente enviar PDFs menores ou apenas colar o texto.");
        } else {
           throw new Error(`Erro no servidor da hospedagem (Status ${response.status}). Verifique o console do navegador para mais detalhes.`);
        }
      }
      
      if (!response.ok) throw new Error(data.error || 'Erro desconhecido');
      setAgronomicResult(data.markdown);
    } catch (e: any) {
      alert("Erro ao gerar laudo: " + e.message);
    } finally {
      setIsAgronomicLoading(false);
    }
  };

  const handleCopyAgronomic = () => {
     if (agronomicResult) {
        navigator.clipboard.writeText(agronomicResult);
        alert("Laudo copiado para a área de transferência!");
     }
  };
  
  const handleDownloadPDF = async () => {
      if (!agronomicResult) return;
      try {
          
          const element = document.getElementById('agronomic-report-container');
          if (!element) {
              alert("Conteúdo do laudo não encontrado na tela.");
              return;
          }
          const opt = {
              margin: 15,
              filename: 'Parecer_Tecnico_Agronomico.pdf',
              image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
              pagebreak: { mode: ['css', 'legacy'] }
          };
          html2pdf().set(opt).from(element).save();
      } catch (e) {
          console.error("Erro ao gerar PDF:", e);
          alert("Erro ao gerar o arquivo PDF.");
      }
  };

  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAiFile, setSelectedAiFile] = useState<{name: string, data: string, mimeType: string} | null>(null);

    const handleDeletePatient = async () => {
    if (deletePatientConfirm) {
      try {
        await deleteDoc(doc(db, 'users', deletePatientConfirm));
        setSupportToastMessage('Paciente excluído com sucesso!');
        setShowSupportToast(true);
        setTimeout(() => setShowSupportToast(false), 3000);
      } catch (err) {
        console.error("Erro ao excluir", err);
      }
      setDeletePatientConfirm(null);
    }
  };

  const handleUpdatePatientPassword = async () => {
    if (showEditPatientPassword) {
      const patient = patients.find(p => p.id === showEditPatientPassword);
      if (patient && patient.email) {
        try {
          await sendPasswordResetEmail(auth, patient.email);
          setSupportToastMessage('Link de redefinição enviado para o e-mail do paciente!');
          setShowSupportToast(true);
          setTimeout(() => setShowSupportToast(false), 3000);
        } catch (err) {
          console.error("Erro ao enviar link de redefinição", err);
          setSupportToastMessage('Erro ao enviar link. Verifique o console.');
          setShowSupportToast(true);
          setTimeout(() => setShowSupportToast(false), 3000);
        }
      }
      setShowEditPatientPassword(null);
    }
  };

  const handleAddDoctor = () => {
    addDoctor({ id: Date.now().toString(), ...doctorForm });
    setShowAddDoctor(false);
    setDoctorForm({ name: '', crm: '', email: '', password: '' });
  };

  const handleUpdatePassword = () => {
    if (showEditPassword) {
      updateDoctor(showEditPassword, { password: newPassword });
      setShowEditPassword(null);
      setNewPassword('');
    }
  };

  const handleAddCoupon = async () => {
    if (!couponForm.code.trim()) {
      alert("Por favor, digite o código do cupom!");
      return;
    }
    const cleanCode = couponForm.code.trim().toUpperCase();
    try {
      await addCoupon({ 
        id: 'coupon_' + Date.now(), 
        code: cleanCode,
        active: true, 
        usedCount: 0, 
        usedBy: [], 
        discount: Math.min(100, Math.max(1, Number(couponForm.discount) || 10)),
        discountType: 'percentage',
        quantity: Number(couponForm.quantity) || 0
      });
      setShowAddCoupon(false);
      setCouponForm({ code: '', discount: 10, quantity: 0 });
      showToast(`Cupom ${cleanCode} criado e salvo com sucesso no banco de dados!`);
    } catch (e: any) {
      console.error("Erro ao adicionar cupom:", e);
      alert("Erro ao salvar cupom: " + (e?.message || 'Tente novamente'));
    }
  };

  const handleSendNotification = async () => {
    try {
      const response = await fetch('/api/send-admin-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notificationForm.title,
          body: notificationForm.message,
          url: '/'
        })
      });
      if (response.ok) {
        addNotification({ id: Date.now().toString(), date: new Date().toISOString(), ...notificationForm });
        setShowSendNotification(false);
        setNotificationForm({ title: '', message: '' });
        alert("Notificação enviada com sucesso!");
      } else {
        alert("Erro ao enviar notificação push");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao enviar notificação");
    }
  };

  const handleAiFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target?.result) {
            setSelectedAiFile({
                name: file.name,
                data: event.target.result as string,
                mimeType: file.type
            });
        }
    };
    reader.readAsDataURL(file);
  };

  const handleSendAiMessage = async () => {
    if (!aiInputText.trim() && !selectedAiFile) return;
    const userMsg = { role: 'user' as const, text: aiInputText, file: selectedAiFile };
    setAiChatHistory(prev => [...prev, userMsg]);
    const currentPrompt = aiInputText;
    const currentFile = selectedAiFile;
    setAiInputText('');
    setSelectedAiFile(null);
    setIsAiLoading(true);

    try {
        const response = await fetch('/api/admin-catalog-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: currentPrompt,
                currentCatalog: productCategories,
                file: currentFile
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro na API');
        if (data.actions && Array.isArray(data.actions)) {
            let addCount = 0; let updateCount = 0; let deleteCount = 0;
            data.actions.forEach((action: any) => {
                try {
                    if (action.type === 'add' && action.categoryId && action.product) {
                        addProduct(action.categoryId, action.product); addCount++;
                    } else if (action.type === 'update' && action.categoryId && action.originalName && action.updates) {
                        updateProduct(action.categoryId, action.originalName, action.updates); updateCount++;
                    } else if (action.type === 'delete' && action.categoryId && action.originalName) {
                        deleteProduct(action.categoryId, action.originalName); deleteCount++;
                    }
                } catch (e) { console.error("Action error", e); }
            });
            setAiChatHistory(prev => [...prev, { role: 'ai', text: data.message || `Ações: ${addCount} adicões, ${updateCount} atualizações, ${deleteCount} exclusões.` }]);
        } else {
            setAiChatHistory(prev => [...prev, { role: 'ai', text: data.message || "Não encontrei ações válidas para executar." }]);
        }
    } catch (error: any) {
        setAiChatHistory(prev => [...prev, { role: 'ai', text: `Erro: ${error.message}` }]);
    } finally {
        setIsAiLoading(false);
    }
  };

  // Comprehensive payment and revenue calculations strictly from Mercado Pago payments
  const isPremiumPayment = (p: any) => {
    const t = (p.type || '').toLowerCase();
    const pl = (p.plan || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    return t.includes('premium') || t.includes('vip') || t.includes('acompanhamento') || 
           pl.includes('premium') || pl.includes('vip') || 
           desc.includes('premium') || desc.includes('vip') ||
           p.isPremium === true ||
           (p.value && Number(p.value) >= 150);
  };

  const isBasicPayment = (p: any) => !isPremiumPayment(p);

  // Consider strictly approved/recorded payments from Mercado Pago:
  const recordedBasicPayments = payments.filter(p => isBasicPayment(p) && (!p.status || p.status === 'approved' || p.status === 'completed'));
  const recordedPremiumPayments = payments.filter(p => isPremiumPayment(p) && (!p.status || p.status === 'approved' || p.status === 'completed'));

  const paidBasicCount = recordedBasicPayments.length;
  const paidPremiumCount = recordedPremiumPayments.length;
  const totalConsultasPagas = paidBasicCount + paidPremiumCount;

  const revenueFila = recordedBasicPayments.reduce((acc, p) => acc + (Number(p.value) || 49.90), 0);
  const revenuePremium = recordedPremiumPayments.reduce((acc, p) => acc + (Number(p.value) || 249.90), 0);
  const revenueTotal = revenueFila + revenuePremium;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#12121A] border-r border-white/5 p-6 flex flex-col gap-2 md:h-screen md:sticky md:top-0 shrink-0 overflow-y-auto z-30">
        <div className="font-bold text-xl mb-8 flex items-center gap-2 shrink-0">
          <Settings className="w-6 h-6 text-mecura-neon" />
          Mecura Admin
        </div>
        {[
          { id: 'overview', label: 'Visão Geral', icon: BarChart },
          { id: 'agenda', label: 'Agenda', icon: Calendar },
          { id: 'patients', label: 'Pacientes', icon: UserCircle },
          { id: 'doctors', label: 'Médicos', icon: Users },
          { id: 'chat_patient', label: 'Chat Paciente', icon: MessageCircle },
          { id: 'chat_doctor', label: 'Chat Médico', icon: MessageSquare },
          { id: 'catalog', label: 'Assistente IA', icon: Pill },
          { id: 'agronomic', label: 'Laudo Agronômico', icon: FileText },
          { id: 'coupons', label: 'Cupons', icon: Ticket },
          { id: 'notifications', label: 'Notificações', icon: Bell },
          { id: 'password_requests', label: 'Trocas de Senha', icon: Key },
          { id: 'legal', label: 'Jurídico & LGPD', icon: Scale }
        ].map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-mecura-neon/10 text-mecura-neon' : 'text-[#8A8A9E] hover:bg-white/5 hover:text-white'}`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
              {tab.id === 'notifications' && generalNotifications.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{generalNotifications.length}</span>
              )}
              {tab.id === 'password_requests' && passwordRequests.length > 0 && (
                <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{passwordRequests.length}</span>
              )}
            </button>
          );
        })}
        
        <div className="mt-auto pt-4 border-t border-white/5 shrink-0">
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
                console.error("Erro ao deslogar:", err);
              }
              window.location.href = '/';
            }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 cursor-pointer active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto h-screen">
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Visão Geral</h2>
                <p className="text-sm text-[#8A8A9E]">Métricas calculadas exclusivamente a partir de pagamentos reais no Mercado Pago</p>
              </div>
              <button
                onClick={handleSyncMpPayments}
                disabled={isSyncingMpPayments}
                className="flex items-center gap-2 bg-[#161622] hover:bg-[#1f1f2e] border border-mecura-neon/40 text-mecura-neon text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                title="Buscar pagamentos aprovados recentes na API do Mercado Pago"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingMpPayments ? 'animate-spin' : ''}`} />
                {isSyncingMpPayments ? 'Sincronizando...' : 'Sincronizar Mercado Pago'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">Total Consultas Pagas</div>
                <div className="text-3xl font-bold text-white">{totalConsultasPagas}</div>
                <div className="text-xs text-[#8A8A9E] mt-1">{paidBasicCount} Básicas + {paidPremiumCount} Premium</div>
              </div>
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">Consultas Básicas (Pagas)</div>
                <div className="text-3xl font-bold text-mecura-neon">{paidBasicCount}</div>
                <div className="text-xs text-[#8A8A9E] mt-1">R$ 49,90 cada</div>
              </div>
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">Consultas Premium (Pagas)</div>
                <div className="text-3xl font-bold text-purple-400">{paidPremiumCount}</div>
                <div className="text-xs text-[#8A8A9E] mt-1">R$ 249,90 cada</div>
              </div>
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">Pacientes Cadastrados</div>
                <div className="text-3xl font-bold text-white">{patients.length}</div>
                <div className="text-xs text-[#8A8A9E] mt-1">Base total cadastrada</div>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Faturamento (Lucro - Via Mercado Pago)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#161622] to-[#1a2e20] p-6 rounded-2xl border border-mecura-neon/30">
                <div className="text-[#8A8A9E] mb-2">Receita Fila (Mercado Pago)</div>
                <div className="text-3xl font-bold text-mecura-neon">
                  {revenueFila.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-xs text-[#8A8A9E] mt-1">{paidBasicCount} consultas a R$ 49,90</div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#2e1a2b] p-6 rounded-2xl border border-purple-500/30">
                <div className="text-[#8A8A9E] mb-2">Receita Premium (Mercado Pago)</div>
                <div className="text-3xl font-bold text-purple-400">
                  {revenuePremium.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-xs text-[#8A8A9E] mt-1">{paidPremiumCount} consultas a R$ 249,90</div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#262636] p-6 rounded-2xl border border-white/20">
                <div className="text-[#8A8A9E] mb-2">Faturamento Total</div>
                <div className="text-3xl font-bold text-white">
                  {revenueTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-xs text-[#8A8A9E] mt-1">{totalConsultasPagas} pagamentos confirmados</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mt-12 mb-4">Configurações Financeiras</h3>
            <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636] max-w-md">
              <div className="text-[#8A8A9E] mb-2 font-medium">Cotação do Dólar (R$)</div>
              <div className="flex gap-4">
                <input
                  type="text"
                  key={exchangeRate}
                  defaultValue={exchangeRate.toFixed(2)}
                  id="exchange-rate-input"
                  placeholder="Ex: 5.00 ou 2,50"
                  className="bg-[#0A0A0F] text-white border border-[#262636] rounded-xl px-4 py-3 flex-1 focus:outline-none focus:border-mecura-neon"
                />
                <button
                  onClick={async () => {
                    const el = document.getElementById('exchange-rate-input') as HTMLInputElement;
                    if (el) {
                      const clean = el.value.trim().replace(',', '.');
                      const val = parseFloat(clean);
                      if (!isNaN(val) && val > 0) {
                        await updateExchangeRate(val);
                        showToast(`Cotação R$ ${val.toFixed(2)} salva com sucesso no banco de dados!`);
                      } else {
                        showToast('Por favor insira um valor válido de cotação.');
                      }
                    }
                  }}
                  className="bg-mecura-neon text-black font-bold px-6 py-3 rounded-xl hover:bg-[#b5ff33] transition-colors whitespace-nowrap cursor-pointer active:scale-95"
                >
                  Salvar Cotação
                </button>
              </div>
              
              <div className="mt-4 flex">
                <button
                  onClick={async () => {
                    try {
                      // Usando API alternativa confiável sem limite tão restrito
                      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                      const data = await res.json();
                      const rate = data.rates.BRL;
                      if (!isNaN(rate)) {
                        const el = document.getElementById('exchange-rate-input') as HTMLInputElement;
                        if (el) el.value = rate.toFixed(2);
                        await updateExchangeRate(rate);
                        showToast(`Cotação atualizada via mercado comercial: R$ ${rate.toFixed(2)}`);
                      }
                    } catch (e) {
                      showToast('Erro ao buscar cotação. Tente novamente.');
                    }
                  }}
                  className="w-full bg-[#1A2E05] text-mecura-neon border border-mecura-neon/50 font-bold px-6 py-3 rounded-xl hover:bg-mecura-neon/10 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-5 h-5" />
                  Sincronizar em Tempo Real (Comercial)
                </button>
              </div>
              <p className="text-xs text-[#8A8A9E] mt-3">
                A cotação atual é <strong>R$ {exchangeRate.toFixed(2)}</strong>. Esta cotação é usada para converter os preços dos produtos (em USD) para Reais (BRL).
              </p>
            </div>

            {/* Gateway de Pagamento Mercado Pago */}
            <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636] max-w-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-mecura-neon" />
                  <h4 className="text-white font-bold text-base">Gateway Mercado Pago</h4>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${mpStatus?.configured ? 'bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                  {mpStatus?.configured ? `Ativo (${mpStatus.tokenPrefix})` : 'Modo Teste / Demonstração'}
                </span>
              </div>
              <p className="text-xs text-[#8A8A9E] mb-4 leading-relaxed">
                Insira o seu <strong>Access Token de Produção</strong> (<code className="text-white">APP_USR-...</code>) obtido no painel de desenvolvedores do Mercado Pago para receber pagamentos reais por Pix e Cartão de Crédito.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  placeholder="Cole aqui seu Access Token (APP_USR-...)"
                  value={mpInputToken}
                  onChange={(e) => setMpInputToken(e.target.value)}
                  className="bg-[#0A0A0F] text-white border border-[#262636] rounded-xl px-4 py-3 flex-1 focus:outline-none focus:border-mecura-neon text-sm"
                />
                <button
                  disabled={isSavingMpToken || !mpInputToken.trim()}
                  onClick={async () => {
                    if (!mpInputToken.trim()) return;
                    setIsSavingMpToken(true);
                    try {
                      const res = await fetch('/api/save-mercadopago-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accessToken: mpInputToken.trim() })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setSupportToastMessage('Token Mercado Pago salvo com sucesso!');
                        setShowSupportToast(true);
                        setMpInputToken('');
                        const statusRes = await fetch('/api/mercadopago-status');
                        setMpStatus(await statusRes.json());
                      } else {
                        setSupportToastMessage(data.error || 'Erro ao salvar token');
                        setShowSupportToast(true);
                      }
                    } catch (e) {
                      setSupportToastMessage('Erro de conexão ao salvar');
                      setShowSupportToast(true);
                    } finally {
                      setIsSavingMpToken(false);
                    }
                  }}
                  className="bg-mecura-neon text-black font-bold px-6 py-3 rounded-xl hover:bg-[#b5ff33] transition-colors whitespace-nowrap disabled:opacity-50 text-sm"
                >
                  {isSavingMpToken ? 'Salvando...' : 'Salvar Token'}
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'agenda' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Agenda de Consultas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#161622] p-4 rounded-xl border border-[#262636]">
                <div className="text-[#8A8A9E] text-sm mb-1">Total Filtrado</div>
                <div className="text-2xl font-bold text-white">
                  {allAppointments.filter(app => {
                    if (agendaStatusFilter !== 'all' && app.status !== agendaStatusFilter) return false;
                    if (agendaTimeFilter !== 'all' && app.date) {
                      const dateObj = parseISO(app.date);
                      if (agendaTimeFilter === 'today' && !isToday(dateObj)) return false;
                      if (agendaTimeFilter === 'week' && !isThisWeek(dateObj)) return false;
                      if (agendaTimeFilter === 'month' && !isThisMonth(dateObj)) return false;
                    }
                    return true;
                  }).length}
                </div>
              </div>
              <div className="bg-[#161622] p-4 rounded-xl border border-[#262636]">
                <div className="text-[#8A8A9E] text-sm mb-1">Próximas (Confirmadas)</div>
                <div className="text-2xl font-bold text-mecura-neon">
                  {allAppointments.filter(app => app.status === 'confirmed' && app.date && isFuture(startOfDay(parseISO(app.date)))).length}
                </div>
              </div>
              <div className="bg-[#161622] p-4 rounded-xl border border-[#262636]">
                <div className="text-[#8A8A9E] text-sm mb-1">Pendentes de Confirmação</div>
                <div className="text-2xl font-bold text-yellow-500">
                  {allAppointments.filter(app => app.status === 'pending').length}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <select 
                value={agendaTimeFilter}
                onChange={(e) => setAgendaTimeFilter(e.target.value)}
                className="bg-[#161622] border border-[#262636] text-white rounded-lg px-4 py-2 outline-none focus:border-mecura-neon"
              >
                <option value="all">Todo o período</option>
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
              </select>
              
              <select 
                value={agendaStatusFilter}
                onChange={(e) => setAgendaStatusFilter(e.target.value)}
                className="bg-[#161622] border border-[#262636] text-white rounded-lg px-4 py-2 outline-none focus:border-mecura-neon"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="confirmed">Confirmados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
            
            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-4 p-4 border-b border-[#262636] text-[#8A8A9E] font-bold">
                <div>Paciente</div>
                <div>Data/Hora</div>
                <div>Tipo</div>
                <div>Ações</div>
              </div>
              <div className="divide-y divide-[#262636]">
                {(() => {
                  const filtered = allAppointments.filter(app => {
                    if (agendaStatusFilter !== 'all' && app.status !== agendaStatusFilter) return false;
                    if (agendaTimeFilter !== 'all' && app.date) {
                      const dateObj = parseISO(app.date);
                      if (agendaTimeFilter === 'today' && !isToday(dateObj)) return false;
                      if (agendaTimeFilter === 'week' && !isThisWeek(dateObj)) return false;
                      if (agendaTimeFilter === 'month' && !isThisMonth(dateObj)) return false;
                    }
                    return true;
                  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  
                  if (filtered.length === 0) {
                    return <div className="p-8 text-center text-[#8A8A9E]">Nenhuma consulta encontrada com estes filtros</div>;
                  }
                  
                  return filtered.map((item, i) => (
                    <div key={item.id || i} className="grid grid-cols-4 p-4 items-center hover:bg-white/5 transition-colors">
                      <div className="font-bold text-white">{item.patientName}</div>
                      <div>
                        <div className="text-sm text-white">{item.date}</div>
                        <div className="text-xs text-[#8A8A9E]">{item.time}</div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          item.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'pending' ? 'bg-mecura-neon/20 text-mecura-neon' :
                          item.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {item.status === 'confirmed' ? 'Confirmado' : 
                           item.status === 'pending' ? 'Pendente' : 
                           item.status === 'cancelled' ? 'Cancelado' : item.status}
                        </span>
                        <div className="text-[10px] text-[#8A8A9E] mt-1">{item.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => confirmAppointment(item.id)}
                              className="p-2 rounded-lg bg-mecura-neon/20 text-mecura-neon hover:bg-mecura-neon hover:text-black transition-colors"
                              title="Confirmar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {(item.status === 'pending' || item.status === 'confirmed') && (
                          <>
                            <button 
                              onClick={() => {
                                setAppointmentToReschedule(item.id);
                                setRescheduleDate(item.date || '');
                                setRescheduleTime(item.time || '');
                                setRescheduleModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-colors"
                              title="Remarcar Consulta"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setAppointmentToCancel(item.id);
                                setCancelReason('');
                                setCancelModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                              title="Remover / Cancelar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {item.status === 'confirmed' && (
                          <button 
                            onClick={() => {
                              const msg = encodeURIComponent(`Olá ${item.patientName}, passando para lembrar da sua consulta na Mecura amanhã às ${item.time}.`);
                              window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                            }}
                            className="p-2 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors border border-[#25D366]/30"
                            title="Avisar no WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'patients' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold">Pacientes Cadastrados</h2>
               <input 
                  type="text" 
                  placeholder="Buscar paciente..." 
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="bg-[#161622] border border-[#262636] rounded-lg px-4 py-2 outline-none focus:border-mecura-neon w-64"
               />
            </div>
            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 p-4 border-b border-[#262636] text-[#8A8A9E] font-bold text-sm">
                <div>Nome</div>
                <div>Email</div>
                <div>Plano</div>
                <div>Status / Online</div>
                <div>Ações</div>
              </div>
              <div className="divide-y divide-[#262636]">
                {patients.length > 0 ? patients.filter(p => {
                    const search = patientSearch.toLowerCase();
                    if (!search) return true; 
                    return p.name?.toLowerCase().includes(search) || p.email?.toLowerCase().includes(search);
                }).map(p => {
                  const lastActiveMs = p.lastActive?.toMillis ? p.lastActive.toMillis() : (p.lastActive?.seconds ? p.lastActive.seconds * 1000 : (p.lastActive ? new Date(p.lastActive).getTime() : 0));
                  const isOnline = lastActiveMs > 0 && (Date.now() - lastActiveMs) < 5 * 60000;
                  return (
                  <div key={p.id} className="grid grid-cols-5 p-4 items-center gap-2">
                    <div className="font-bold text-white text-sm break-words flex items-center gap-2">
                      {p.name || 'Sem nome'}
                      {(() => {
                        const cleanPEmail = (p.email || '').trim().toLowerCase();
                        const qItem = queue.find(q => q.id === p.id || (cleanPEmail && q.email && q.email.trim().toLowerCase() === cleanPEmail));
                        if (!qItem) return null;
                        if (qItem.status === 'waiting') {
                          return <span className="bg-mecura-neon/20 border border-mecura-neon/40 text-mecura-neon text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold shadow-[0_0_10px_rgba(166,255,0,0.2)]">Na Fila</span>;
                        }
                        if (qItem.status === 'in-consultation') {
                          return <span className="bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)]">Em Consulta</span>;
                        }
                        return null;
                      })()}
                    </div>
                    <div className="text-[#8A8A9E] text-xs break-all">{p.email || 'N/A'}</div>
                    <div>
                       <span className={`px-2 py-1 rounded-full text-xs ${p.tier === 'Premium' ? 'bg-purple-500/20 text-purple-400' : 'bg-mecura-neon/20 text-mecura-neon'}`}>
                         {p.tier || 'Essencial'}
                       </span>
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                       {p.hasCompletedOnboarding ? (
                          <span className="text-green-400 text-xs">Ativo</span>
                       ) : (
                          <span className="text-yellow-400 text-xs">Pendente</span>
                       )}
                       {isOnline ? (
                          <span className="flex items-center gap-1 text-[10px] text-mecura-neon"><span className="w-1.5 h-1.5 rounded-full bg-mecura-neon animate-pulse"></span> Online</span>
                       ) : (
                          <span className="text-[10px] text-[#8A8A9E]">Offline</span>
                       )}
                    </div>
                    <div className="flex flex-col gap-1">
                       <div className="grid grid-cols-2 gap-1">
                         {(() => {
                           const cleanPEmail = (p.email || '').trim().toLowerCase();
                           const qItem = queue.find(q => q.id === p.id || (cleanPEmail && q.email && q.email.trim().toLowerCase() === cleanPEmail));
                           const isSending = !!sendingQueueIds[p.id];

                           if (qItem?.status === 'waiting') {
                             return (
                               <Button 
                                 variant="outline" 
                                 className="text-[10px] h-7 px-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 flex items-center justify-center gap-0.5 font-bold cursor-pointer" 
                                 onClick={() => forceSendToQueue(p)} 
                                 title="Paciente já está na Fila (clique para atualizar/reenviar)"
                               >
                                 {isSending ? <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" /> : <><Check className="w-3 h-3 text-emerald-400" /> Na Fila</>}
                               </Button>
                             );
                           }

                           if (qItem?.status === 'in-consultation') {
                             return (
                               <Button 
                                 variant="outline" 
                                 className="text-[10px] h-7 px-1 bg-blue-500/15 border border-blue-500/40 text-blue-400 hover:bg-blue-500/25 flex items-center justify-center gap-0.5 font-bold cursor-pointer" 
                                 onClick={() => forceSendToQueue(p)} 
                                 title="Paciente em consulta (clique para reiniciar na fila)"
                               >
                                 {isSending ? <RefreshCw className="w-3 h-3 animate-spin text-blue-400" /> : 'Em Atend.'}
                               </Button>
                             );
                           }

                           return (
                             <Button 
                               variant="outline" 
                               className="text-[10px] h-7 px-1 bg-[#161622] hover:bg-mecura-neon/20 hover:text-mecura-neon border border-white/10 hover:border-mecura-neon/40 flex items-center justify-center gap-1 font-semibold text-white transition-all cursor-pointer" 
                               onClick={() => forceSendToQueue(p)} 
                               title="Mover paciente para a Fila do Médico"
                             >
                               {isSending ? <RefreshCw className="w-3 h-3 animate-spin text-mecura-neon" /> : 'Fila'}
                             </Button>
                           );
                         })()}
                         <Button variant="outline" className="text-[10px] h-7 px-1 bg-[#161622] hover:bg-blue-500/20 hover:text-blue-400" onClick={() => setShowAgenda(p.id)} title="Agenda"><Calendar className="w-3 h-3 mr-1"/> Agend.</Button>
                       </div>
                       <div className="grid grid-cols-3 gap-1">
                         <Button variant="outline" className="text-[10px] h-7 px-0 bg-[#161622] hover:bg-green-500/20 hover:text-green-400" onClick={() => window.open(`https://wa.me/55${(p.phone || '').replace(/\D/g, '')}`, '_blank')} title="WhatsApp"><MessageCircle className="w-3 h-3"/></Button>
                         <Button variant="outline" className="text-[10px] h-7 px-0 bg-[#161622] hover:bg-yellow-500/20 hover:text-yellow-400" onClick={() => setShowEditPatientPassword(p.id)} title="Trocar Senha"><Key className="w-3 h-3"/></Button>
                         <Button variant="outline" className="text-[10px] h-7 px-0 bg-[#161622] hover:bg-red-500/20 hover:text-red-400" onClick={() => setDeletePatientConfirm(p.id)} title="Excluir Paciente"><Trash2 className="w-3 h-3"/></Button>
                       </div>
                    </div>
                  </div>
                )}) : (
                  <div className="p-8 text-center text-[#8A8A9E]">Nenhum paciente encontrado.</div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'doctors' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Médicos Parceiros</h2>
              <Button onClick={() => setShowAddDoctor(true)}>
                <Plus className="w-4 h-4 mr-2" /> Novo Médico
              </Button>
            </div>
            <div className="grid gap-4">
              {doctors.map(doctor => (
                <div key={doctor.id} className="bg-[#161622] border border-[#262636] p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{doctor.name}</h3>
                    <p className="text-[#8A8A9E] text-sm">CRM: {doctor.crm} | {doctor.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAgenda(doctor.id)}><Calendar className="w-4 h-4 mr-2"/>Agenda</Button>
                    <Button variant="outline" onClick={() => setShowEditPassword(doctor.id)}>Senha</Button>
                    <button onClick={() => deleteDoctor(doctor.id)} className="p-2 text-[#8A8A9E] hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold">Catálogo de Produtos & Medicamentos</h2>
                <p className="text-xs text-[#8A8A9E] mt-0.5">Gerencie os medicamentos e posologias oficiais disponíveis para a área médica e pacientes</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleOpenAddMedicine()} className="bg-mecura-neon text-black font-bold hover:bg-[#b5ff33] shadow-[0_0_15px_rgba(166,255,0,0.15)]">
                  <Plus className="w-4 h-4 mr-2" /> + Adicionar Medicamento
                </Button>
                <Button variant="outline" onClick={handleManualSyncCatalog} className="border-mecura-neon/40 text-mecura-neon hover:bg-mecura-neon/10">
                  <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar na Nuvem
                </Button>
                <Button variant="outline" onClick={() => {
                  if(window.confirm('Tem certeza? Isso irá restaurar o catálogo do banco de dados oficial (PDF atualizado).')) {
                    setProductCategories(cbdGuideData);
                    showToast('Catálogo restaurado com as bases oficiais!');
                  }
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Atualizar via Sistema (PDF)
                </Button>
                <Button onClick={() => setShowImportMedicineModal(true)}>
                  <BrainCircuit className="w-4 h-4 mr-2" /> Assistente IA
                </Button>
              </div>
            </div>
            
            <div className="space-y-8">
              {productCategories.map(cat => (
                <div key={cat.id} className="bg-[#161622] border border-[#262636] p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-mecura-neon">{cat.title}</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenAddMedicine(cat.id)}
                      className="text-xs border-mecura-neon/30 text-mecura-neon hover:bg-mecura-neon/10"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Novo nesta categoria
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.products.map(prod => (
                      <div key={prod.name} className="bg-[#0A0A0F] border border-[#262636] p-4 rounded-xl flex flex-col justify-between hover:border-white/20 transition-all">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-white text-base leading-snug">{prod.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                              (prod.origin || '').toLowerCase().includes('importado')
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {prod.origin || 'Nacional'}
                            </span>
                          </div>
                          
                          <div className="text-xs text-[#8A8A9E] mb-2 flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-white/90">{prod.manufacturer}</span>
                            <span>•</span>
                            <span>{prod.type}</span>
                          </div>

                          {prod.concentration && (
                            <div className="text-xs text-mecura-neon font-mono mb-1">{prod.concentration}</div>
                          )}

                          {prod.pharmaceuticalForm && (
                            <div className="text-[11px] text-[#8A8A9E]">
                              {prod.pharmaceuticalForm} {prod.quantity ? `• ${prod.quantity}` : ''}
                            </div>
                          )}

                          {prod.priceBRL ? (
                            <div className="text-emerald-400 text-sm font-bold mt-2">R$ {prod.priceBRL.toFixed(2)}</div>
                          ) : prod.priceUSD ? (
                            <div className="text-cyan-400 text-sm font-bold mt-2">US$ {prod.priceUSD.toFixed(2)} (R$ {(prod.priceUSD * exchangeRate).toFixed(2)})</div>
                          ) : null}

                          {prod.usageInstructions && (
                            <div className="mt-3 p-3 rounded-xl bg-[#12121A] border border-white/5 text-xs">
                              <span className="text-[10px] text-mecura-neon uppercase font-bold tracking-wider block mb-1">
                                Posologia Padrão:
                              </span>
                              <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{prod.usageInstructions}</p>
                            </div>
                          )}

                          {prod.indications && (
                            <div className="mt-2 text-[11px] text-[#8A8A9E] line-clamp-2">
                              <strong className="text-white/70">Indicações:</strong> {prod.indications}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#262636]">
                          <button 
                            onClick={() => handleOpenEditMedicine(cat.id, prod)} 
                            className="p-1.5 text-xs font-semibold text-white/70 hover:text-mecura-neon flex items-center gap-1 bg-[#161622] border border-white/5 rounded-lg px-2.5 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5"/> Editar
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja remover ${prod.name}?`)) {
                                deleteProduct(cat.id, prod.name);
                              }
                            }} 
                            className="p-1.5 text-xs font-semibold text-[#8A8A9E] hover:text-red-400 flex items-center gap-1 bg-[#161622] border border-white/5 rounded-lg px-2.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5"/> Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        
        {activeTab === 'agronomic' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
               <FileText className="text-mecura-neon" /> Gerador de Laudo Agronômico (IA)
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                     <h3 className="text-lg font-bold mb-4 text-white">1. Dados do Paciente</h3>
                     <p className="text-sm text-[#8A8A9E] mb-4">Insira o texto ou faça o upload dos PDFs/Imagens do Laudo e Receita.</p>
                     
                     <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-white">Laudo Médico (Histórico Clínico)</label>
                        <button onClick={() => medFileRef.current?.click()} className="flex items-center gap-2 text-xs text-mecura-neon hover:text-white transition-colors">
                            <Paperclip className="w-3 h-3" /> Anexar Arquivo
                        </button>
                        <input type="file" className="hidden" ref={medFileRef} onChange={handleMedFileChange} accept=".pdf,image/*" />
                     </div>
                     {agronomicMedicalFile && (
                        <div className="flex items-center justify-between bg-mecura-neon/10 border border-mecura-neon/30 rounded-xl px-4 py-2 mb-2">
                           <span className="text-xs text-mecura-neon truncate">{agronomicMedicalFile.name}</span>
                           <button onClick={() => setAgronomicMedicalFile(null)} className="text-xs text-[#8A8A9E] hover:text-white">X</button>
                        </div>
                     )}
                     <textarea 
                        value={agronomicMedicalReport}
                        onChange={(e) => setAgronomicMedicalReport(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-3 text-sm text-white focus:border-mecura-neon h-24 resize-none mb-4"
                        placeholder="Ex: Paciente com dor lombar..."
                     />

                     <div className="flex justify-between items-center mb-2">
                         <label className="block text-sm font-bold text-white">Receita Médica</label>
                         <button onClick={() => prescFileRef.current?.click()} className="flex items-center gap-2 text-xs text-purple-400 hover:text-white transition-colors">
                             <Paperclip className="w-3 h-3" /> Anexar Arquivo
                         </button>
                         <input type="file" className="hidden" ref={prescFileRef} onChange={handlePrescFileChange} accept=".pdf,image/*" />
                     </div>
                     {agronomicPrescriptionFile && (
                        <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2 mb-2">
                           <span className="text-xs text-purple-400 truncate">{agronomicPrescriptionFile.name}</span>
                           <button onClick={() => setAgronomicPrescriptionFile(null)} className="text-xs text-[#8A8A9E] hover:text-white">X</button>
                        </div>
                     )}
                     <textarea 
                        value={agronomicPrescription}
                        onChange={(e) => setAgronomicPrescription(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 h-24 resize-none mb-6"
                        placeholder="Ex: 1. Óleo Integral THC/CBD 100mg/ml - Tomar 10 gotas..."
                     />
                     
                     <div className="mb-6">
                        <label className="block text-sm font-bold text-white mb-2">Número de plantas desejado (Opcional)</label>
                        <input 
                           type="number" 
                           value={agronomicTargetPlants}
                           onChange={(e) => setAgronomicTargetPlants(e.target.value)}
                           className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-3 text-sm text-white focus:border-mecura-neon"
                           placeholder="Ex: 30"
                        />
                     </div>
                     
                     <Button 
                        onClick={handleGenerateAgronomic} 
                        disabled={isAgronomicLoading}
                        className="w-full py-4 text-black font-bold text-lg"
                     >
                        {isAgronomicLoading ? 'Gerando Laudo Analítico...' : 'Gerar Parecer Técnico'}
                     </Button>
                  </div>
               </div>

               <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-white">Resultado (Parecer)</h3>
                     {agronomicResult && (
                        <div className="flex gap-4">
                            <button onClick={() => setIsEditingAgronomic(!isEditingAgronomic)} className={`flex items-center gap-2 transition-colors text-sm font-bold ${isEditingAgronomic ? 'text-mecura-neon' : 'text-[#8A8A9E] hover:text-white'}`}>
                               {isEditingAgronomic ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                               {isEditingAgronomic ? 'Concluir Edição' : 'Editar Laudo'}
                            </button>
                            <button onClick={handleCopyAgronomic} className="flex items-center gap-2 text-[#8A8A9E] hover:text-white transition-colors text-sm font-bold">
                               Copiar HTML
                            </button>
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 text-mecura-neon hover:text-white transition-colors text-sm font-bold">
                               <Download className="w-4 h-4" /> Baixar PDF
                            </button>
                        </div>
                     )}
                  </div>
                  <div className="flex-1 bg-[#0A0A0F] border border-[#262636] rounded-xl p-4 overflow-y-auto">
                     {isAgronomicLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#8A8A9E] space-y-4">
                           <BrainCircuit className="w-12 h-12 animate-pulse text-mecura-neon" />
                           <p>A IA está calculando as dosagens e projetando o cultivo...</p>
                        </div>
                     ) : agronomicResult ? (
                        <div className="bg-[#FFFFFF] p-6 rounded-xl overflow-x-auto relative text-[#000000]">
                           <div contentEditable={isEditingAgronomic} suppressContentEditableWarning={true} onBlur={(e) => setAgronomicResult(e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: agronomicResult.replace(/```html/g, "").replace(/```/g, "") }} id="agronomic-report-container" className={`text-[#000000] bg-[#FFFFFF] p-4 rounded outline-none transition-all ${isEditingAgronomic ? 'ring-4 ring-mecura-neon/50' : ''}`} />
                        </div>
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[#8A8A9E]">
                           <FileText className="w-8 h-8 mb-2 opacity-50" />
                           <p className="text-center text-sm">O laudo gerado aparecerá aqui.<br/>Preencha os dados e clique em "Gerar".</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}
        {activeTab === 'coupons' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Cupons de Desconto</h2>
                <p className="text-xs text-[#8A8A9E] mt-0.5">Sincronização em tempo real na nuvem (Firestore)</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleRefreshCoupons}
                  disabled={isRefreshingCoupons}
                  className="border-[#262636] hover:bg-white/5 text-xs text-white"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isRefreshingCoupons ? 'animate-spin text-mecura-neon' : ''}`} />
                  {isRefreshingCoupons ? 'Atualizando...' : 'Atualizar Lista'}
                </Button>
                <Button onClick={() => setShowAddCoupon(true)} className="bg-mecura-neon text-black font-bold hover:bg-mecura-neon/90">
                  <Plus className="w-4 h-4 mr-2" /> Novo Cupom
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {coupons.length === 0 ? (
                <div className="bg-[#161622] border border-[#262636] p-10 rounded-2xl text-center text-[#8A8A9E]">
                  <Ticket className="w-10 h-10 mx-auto mb-3 opacity-40 text-mecura-neon" />
                  <p className="text-base font-semibold text-white">Nenhum cupom cadastrado ainda</p>
                  <p className="text-xs mt-1">Clique em "+ Novo Cupom" para criar o primeiro cupom da plataforma.</p>
                </div>
              ) : (
                coupons.map(coupon => {
                  const usedCount = coupon.usedCount || 0;
                  const isMaxReached = coupon.quantity && coupon.quantity > 0 && usedCount >= coupon.quantity;

                  return (
                    <div key={coupon.id} className="bg-[#161622] border border-[#262636] p-6 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-black text-xl uppercase tracking-wider text-mecura-neon">{coupon.code}</h3>
                            {usedCount > 0 && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30 inline-flex items-center gap-1 shadow-sm">
                                ⚡ {usedCount} {usedCount === 1 ? 'uso registrado' : 'usos registrados'}
                              </span>
                            )}
                            {isMaxReached && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Limite Atingido
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[#8A8A9E] text-sm mt-1">
                            {coupon.discount}% de Desconto {coupon.ownerId ? `(Indicador: ${coupon.ownerId})` : ''}
                          </p>

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#8A8A9E]">
                            <span>
                              Usados: <strong className="text-white">{usedCount}</strong> / {coupon.quantity ? coupon.quantity : 'Ilimitado (1x por cliente)'}
                            </span>
                            {coupon.quantity && coupon.quantity > 0 && (
                              <span className="text-[11px] text-[#A0A0B0]">
                                • Restam: <strong className="text-mecura-neon">{Math.max(0, coupon.quantity - usedCount)}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${coupon.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {coupon.active ? 'Ativo' : 'Inativo'}
                          </span>
                          <button 
                            onClick={async () => {
                              await updateCoupon(coupon.id, { active: !coupon.active });
                              showToast(coupon.active ? `Cupom ${coupon.code} desativado.` : `Cupom ${coupon.code} ativado com sucesso!`);
                            }} 
                            className="text-[#8A8A9E] hover:text-white transition-colors cursor-pointer"
                            title={coupon.active ? "Desativar cupom" : "Ativar cupom"}
                          >
                            {coupon.active ? <XCircle className="w-5 h-5 text-amber-400 hover:text-amber-300"/> : <CheckCircle className="w-5 h-5 text-green-400 hover:text-green-300"/>}
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm(`Tem certeza que deseja excluir o cupom ${coupon.code}?`)) {
                                await deleteCoupon(coupon.id);
                                showToast(`Cupom ${coupon.code} excluído com sucesso.`);
                              }
                            }} 
                            className="text-[#8A8A9E] hover:text-red-400 transition-colors cursor-pointer"
                            title="Excluir cupom"
                          >
                            <Trash2 className="w-5 h-5"/>
                          </button>
                        </div>
                      </div>

                      {coupon.usedBy && coupon.usedBy.length > 0 && (
                        <div className="text-[11px] text-[#8A8A9E] pt-3 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                          <span className="text-white/90 font-medium">Clientes que já utilizaram ({coupon.usedBy.length}):</span>
                          {coupon.usedBy.slice(-4).map((ident, i) => (
                            <span key={i} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/80 font-mono">
                              {ident.length > 25 ? `${ident.substring(0, 22)}...` : ident}
                            </span>
                          ))}
                          {coupon.usedBy.length > 4 && (
                            <span className="text-[10px] text-mecura-neon font-bold">+{coupon.usedBy.length - 4} outros</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Notificações Push</h2>
              <Button onClick={() => setShowSendNotification(true)}>
                <Send className="w-4 h-4 mr-2" /> Nova Notificação
              </Button>
            </div>
            <div className="space-y-4">
              {notifications.map(notification => (
                <div key={notification.id} className="bg-[#161622] border border-[#262636] rounded-2xl p-6 relative group">
                  <button onClick={() => handleDeleteNotification(notification.id)} className="absolute top-4 right-4 text-[#8A8A9E] hover:text-red-400 opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-[#8A8A9E] mb-2">{new Date(notification.date).toLocaleString('pt-BR')}</div>
                  <h3 className="font-bold text-lg mb-2">{notification.title}</h3>
                  <p className="text-[#A0A0B0]">{notification.message}</p>
                </div>
              ))}
              {notifications.length === 0 && <div className="text-center p-8 text-[#8A8A9E]">Nenhuma notificação.</div>}
            </div>
          </div>
        )}

        {activeTab === 'chat_doctor' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Chat com Médico</h2>
            <div className="bg-[#161622] border border-[#262636] rounded-2xl p-8 text-center">
              <MessageSquare className="w-12 h-12 text-[#8A8A9E] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Canal de Comunicação com Médicos</h3>
              <p className="text-[#8A8A9E] mb-6">Selecione um médico parceiro para iniciar uma conversa.</p>
              
              <div className="grid grid-cols-1 gap-4 text-left">
                {doctors.map(doc => (
                  <div key={doc.id} className="bg-[#0A0A0F] border border-[#262636] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{doc.name}</div>
                      <div className="text-sm text-[#8A8A9E]">CRM: {doc.crm}</div>
                    </div>
                    <Button variant="outline" size="sm">Mensagem</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'password_requests' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Solicitações de Troca de Senha</h2>
            
            {passwordRequests.length === 0 ? (
              <div className="text-center p-12 bg-[#161622] rounded-2xl border border-[#262636]">
                <Key className="w-12 h-12 text-[#8A8A9E] mx-auto mb-4 opacity-50" />
                <p className="text-[#8A8A9E]">Nenhuma solicitação de troca de senha no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {passwordRequests.map(req => (
                  <div key={req.id} className="bg-[#161622] border border-yellow-500/30 rounded-2xl p-6 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-white">Esqueci a Senha</div>
                      <div className="text-sm text-[#8A8A9E] mb-2">{req.email || "Sem e-mail"}</div>
                      <div className="text-sm text-yellow-500/80 mt-1 mb-2 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">{req.message}</div>
                      <div className="text-xs text-[#8A8A9E]">Solicitado em: {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString('pt-BR') : 'Agora'}</div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <Button onClick={() => {
                        const targetPatient = patients.find(p => p.email?.toLowerCase() === req.email?.toLowerCase());
                        if (targetPatient) {
                          setShowEditPatientPassword(targetPatient.id);
                        } else {
                          setSupportToastMessage('Paciente não encontrado com este e-mail na base!');
                          setShowSupportToast(true);
                          setTimeout(() => setShowSupportToast(false), 3000);
                        }
                      }} className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold w-full"><Key className="w-4 h-4 mr-2" /> Enviar Redefinição</Button>
                      
                      <Button onClick={() => {
                        const targetPatient = patients.find(p => p.email?.toLowerCase() === req.email?.toLowerCase());
                        const phone = targetPatient?.phone ? `55${targetPatient.phone.replace(/\D/g, '')}` : '5566996280883';
                        window.open(`https://wa.me/${phone}?text=Olá! Vimos que você solicitou a recuperação de senha na Mecura. Acabamos de enviar um link oficial de redefinição para o seu e-mail cadastrado. Por favor, verifique sua caixa de entrada e siga as instruções.`, '_blank');
                      }} className="bg-[#25D366] text-white hover:bg-[#20b858] w-full"><MessageCircle className="w-4 h-4 mr-2" /> Enviar no WhatsApp</Button>
                      
                      <Button variant="outline" onClick={async () => await updateDoc(doc(db, 'support_requests', req.id), { status: 'resolved' })} className="w-full">Marcar Resolvido</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Scale className="w-7 h-7 text-mecura-neon" />
                  <span>Jurídico, LGPD & Resguardo Institucional</span>
                </h2>
                <p className="text-sm text-[#8A8A9E] mt-1">
                  Diretrizes regulatórias, parecer técnico do Dr. Max Warner e conformidade com a LGPD.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => window.open('/legal', '_blank')}
                  className="bg-mecura-neon text-black hover:bg-[#8fe000] font-bold text-xs"
                >
                  <Building2 className="w-4 h-4 mr-1.5" />
                  Ver Página Pública (/legal)
                </Button>
              </div>
            </div>

            {/* Corporate Box */}
            <div className="bg-[#161622] border border-mecura-neon/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-mecura-neon/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-mecura-neon/15 border border-mecura-neon/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7 text-mecura-neon" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-wider bg-mecura-neon/10 px-2 py-0.5 rounded-full border border-mecura-neon/20">
                      Entidade Oficial
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {INSTITUTIONAL_INFO.companyName}
                    </h3>
                    <p className="text-xs text-[#8A8A9E]">
                      {INSTITUTIONAL_INFO.tradingName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#12121A] px-4 py-2.5 rounded-xl border border-white/10">
                  <div>
                    <span className="text-[10px] text-[#8A8A9E] block">Cadastro Nacional (CNPJ)</span>
                    <span className="text-sm font-mono font-bold text-white">{INSTITUTIONAL_INFO.cnpj}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(INSTITUTIONAL_INFO.cnpj);
                      setSupportToastMessage('CNPJ copiado com sucesso!');
                      setShowSupportToast(true);
                      setTimeout(() => setShowSupportToast(false), 2500);
                    }}
                    className="ml-2 p-2 hover:bg-white/10 rounded-lg text-mecura-neon transition-colors"
                    title="Copiar CNPJ"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs relative z-10">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[#8A8A9E] block text-[10px] uppercase font-bold">Consultor Jurídico</span>
                  <strong className="text-white text-sm block mt-0.5">{INSTITUTIONAL_INFO.lawyerName}</strong>
                  <span className="text-mecura-neon font-semibold">{INSTITUTIONAL_INFO.lawyerOab}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[#8A8A9E] block text-[10px] uppercase font-bold">Encarregado LGPD (DPO)</span>
                  <strong className="text-white text-sm block mt-0.5">{INSTITUTIONAL_INFO.dpoName}</strong>
                  <span className="text-[#8A8A9E]">{INSTITUTIONAL_INFO.dpoEmail}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[#8A8A9E] block text-[10px] uppercase font-bold">Atendimento Oficial</span>
                  <strong className="text-white text-sm block mt-0.5">{INSTITUTIONAL_INFO.supportPhone}</strong>
                  <span className="text-emerald-400">WhatsApp Oficial</span>
                </div>
              </div>
            </div>

            {/* Legal Pillars */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-mecura-neon" />
                <span>Pilares do Parecer Técnico-Jurídico de Resguardo</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LEGAL_OPINION_DATA.pillars.map((pillar) => (
                  <div key={pillar.id} className="p-5 rounded-2xl bg-[#161622] border border-white/5 hover:border-mecura-neon/20 transition-all space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white">{pillar.title}</h4>
                      {pillar.badge && (
                        <span className="text-[9px] font-bold uppercase text-mecura-neon bg-mecura-neon/10 px-2 py-0.5 rounded border border-mecura-neon/20 shrink-0">
                          {pillar.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8A8A9E] leading-relaxed">
                      {pillar.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* LGPD Compliance Section */}
            <div className="p-6 rounded-2xl bg-[#161622] border border-blue-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {PRIVACY_POLICY_LGPD_DATA.title}
                  </h3>
                  <p className="text-xs text-blue-400">
                    {PRIVACY_POLICY_LGPD_DATA.law} • Base Legal Art. 11, II, "f" (Tutela da Saúde)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#8A8A9E]">
                <div className="p-3 bg-[#12121A] rounded-xl border border-white/5">
                  <strong className="text-white block mb-1">Criptografia & Sigilo</strong>
                  Criptografia em trânsito e repouso, acesso restrito e segredo médico inviolável.
                </div>
                <div className="p-3 bg-[#12121A] rounded-xl border border-white/5">
                  <strong className="text-white block mb-1">Direitos dos Titulares</strong>
                  Acesso facilitado, correção, exclusão e portabilidade de dados clínicos.
                </div>
                <div className="p-3 bg-[#12121A] rounded-xl border border-white/5">
                  <strong className="text-white block mb-1">Atendimento ao Paciente</strong>
                  Canal direto de DPO para qualquer solicitação pelo e-mail e WhatsApp.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat_patient' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Solicitações de Suporte (Humanos)</h2>
            {supportRequests.length === 0 ? (
              <div className="bg-[#161622] border border-[#262636] rounded-2xl p-8 text-center text-[#8A8A9E]">Nenhuma solicitação pendente.</div>
            ) : (
              <div className="space-y-4">
                {supportRequests.map(req => (
                  <div key={req.id} className="bg-[#161622] border border-[#262636] rounded-2xl p-6 flex justify-between">
                    <div className="flex-1 mr-4">
                      <div className="font-bold text-lg">{req.userName}</div>
                      <div className="text-sm text-[#8A8A9E]">{req.email || "Sem e-mail"}</div>
                      {req.message && <div className="text-sm text-white mt-2 bg-[#0A0A0F] p-3 rounded-lg border border-[#262636]">{req.message}</div>}
                      <div className="text-xs text-[#8A8A9E] mt-2">Solicitado em: {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString('pt-BR') : 'Agora'}</div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => {
                          const phone = req.phone ? `55${req.phone.replace(/\D/g, '')}` : '5566996280883';
                          window.open(`https://wa.me/${phone}?text=Olá ${encodeURIComponent(req.userName)}, recebemos sua solicitação na Mecura.`, '_blank')
                        }} className="bg-[#25D366] text-white hover:bg-[#20b858]">Chamar no WhatsApp</Button>
                      <Button variant="outline" onClick={async () => await updateDoc(doc(db, 'support_requests', req.id), { status: 'resolved' })}>Resolvido</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Medicine Modal */}
      {(showAddMedicineModal || showEditMedicineModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
            onClick={() => {
              setShowAddMedicineModal(false);
              setShowEditMedicineModal(false);
              setMedicineToEdit(null);
            }} 
          />
          <div className="relative w-full max-w-2xl bg-[#12121A] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#161622]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center text-mecura-neon">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {showEditMedicineModal ? 'Editar Medicamento' : 'Novo Medicamento no Catálogo'}
                  </h3>
                  <p className="text-xs text-[#8A8A9E]">
                    Disponibilize para o médico prescrever e configure a posologia padrão
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddMedicineModal(false);
                  setShowEditMedicineModal(false);
                  setMedicineToEdit(null);
                }} 
                className="text-[#8A8A9E] hover:text-white p-1.5 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#0A0A0F]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Nome Completo do Medicamento *
                  </label>
                  <input
                    type="text"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Broad SPECTRUM CBD, CBN 1065mg —————- 15ml"
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Categoria no Sistema
                  </label>
                  <select
                    value={newMedicine.categoryId}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon cursor-pointer"
                  >
                    {productCategories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-[#12121A] text-white">
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Fabricante / Associação *
                  </label>
                  <input
                    type="text"
                    value={newMedicine.manufacturer}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, manufacturer: e.target.value }))}
                    placeholder="Ex: Associação Nacional ou Flowermed"
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Origem
                  </label>
                  <select
                    value={newMedicine.origin}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, origin: e.target.value }))}
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon cursor-pointer"
                  >
                    <option value="Nacional" className="bg-[#12121A]">Nacional (Associação Brasileira)</option>
                    <option value="Importado" className="bg-[#12121A]">Importado (EUA / RDC 660)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Preço de Referência (R$)
                  </label>
                  <input
                    type="number"
                    value={newMedicine.priceBRL}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, priceBRL: e.target.value }))}
                    placeholder="210"
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Tipo de Formulação
                  </label>
                  <input
                    type="text"
                    value={newMedicine.type}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="Ex: Óleo Broad Spectrum CBD + CBN (0% THC)"
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Concentração & Volume
                  </label>
                  <input
                    type="text"
                    value={newMedicine.concentration}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, concentration: e.target.value }))}
                    placeholder="Ex: CBD + CBN 1065mg (71 mg/mL) • Frasco de 15 mL"
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Forma Farmacêutica
                  </label>
                  <input
                    type="text"
                    value={newMedicine.pharmaceuticalForm}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, pharmaceuticalForm: e.target.value }))}
                    placeholder="Ex: Solução Oleosa Sublingual (Gotas)"
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Quantidade / Frasco
                  </label>
                  <input
                    type="text"
                    value={newMedicine.quantity}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Ex: 01 Frasco de 15 mL"
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-mecura-neon uppercase block mb-1.5 flex items-center justify-between">
                    <span>Posologia Padrão Recomendada (Orientações de Uso) *</span>
                    <span className="text-[10px] text-mecura-silver lowercase">auto-preenchida para o médico</span>
                  </label>
                  <textarea
                    rows={4}
                    value={newMedicine.usageInstructions}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, usageInstructions: e.target.value }))}
                    placeholder="Pingar 2 gotas pela manhã e 4 a noite.&#10;- Aumentar 1 gota a cada 7 dias, sendo máximo de 10 gotas por dose.&#10;- Se obtiver melhora dos sintomas em doses mínimas não a necessidade de chegar em dose máxima."
                    className="w-full bg-[#161622] border border-mecura-neon/30 focus:border-mecura-neon rounded-xl p-3 text-white text-sm focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Indicações Clínicas
                  </label>
                  <input
                    type="text"
                    value={newMedicine.indications}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, indications: e.target.value }))}
                    placeholder="Insônia, Distúrbios do Sono, Ansiedade, Estresse Crônico, Agitação Noturna..."
                    className="w-full bg-[#161622] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-mecura-neon"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-mecura-pearl uppercase block mb-1.5">
                    Descrição Detalhada / Princípio Ativo
                  </label>
                  <textarea
                    rows={2}
                    value={newMedicine.description}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Extrato Broad Spectrum combinando Canabidiol (CBD) e Canabinol (CBN) totalizando 1065mg em frasco de 15ml, 0% THC..."
                    className="w-full bg-[#161622] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-mecura-neon leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#161622] flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddMedicineModal(false);
                  setShowEditMedicineModal(false);
                  setMedicineToEdit(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveMedicine} 
                disabled={!newMedicine.name.trim()}
                className="bg-mecura-neon text-black font-bold hover:bg-[#b5ff33] disabled:opacity-50"
              >
                <Check className="w-4 h-4 mr-1.5" /> {showEditMedicineModal ? 'Salvar Alterações' : 'Salvar no Catálogo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Modal */}
      {showImportMedicineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImportMedicineModal(false)} />
            <div className="relative w-full max-w-2xl bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[80vh] max-h-[800px] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161622]">
                  <div className="flex items-center gap-3">
                      <BrainCircuit className="w-6 h-6 text-mecura-neon" />
                      <div>
                          <h3 className="font-bold text-white leading-none">Assistente Mecura AI</h3>
                          <p className="text-xs text-[#8A8A9E] mt-1">Gerenciador de Catálogo</p>
                      </div>
                  </div>
                  <button onClick={() => setShowImportMedicineModal(false)} className="text-[#8A8A9E] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0A0A0F]">
                  {aiChatHistory.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#262636]' : 'bg-mecura-neon/10'}`}>
                              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-mecura-neon" />}
                          </div>
                          <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-[#262636] text-white rounded-tr-none' : 'bg-[#161622] text-white border border-white/5 rounded-tl-none'}`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                              {msg.file && (
                                  <div className="mt-3 p-2 bg-black/20 rounded-lg flex items-center gap-2 border border-white/5">
                                      <Paperclip className="w-4 h-4 text-mecura-neon" />
                                      <span className="text-xs text-[#8A8A9E] truncate">{msg.file.name}</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
                  {isAiLoading && (
                      <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-mecura-neon/10 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-mecura-neon" /></div>
                          <div className="bg-[#161622] border border-white/5 rounded-2xl rounded-tl-none p-4 flex gap-2">
                              <div className="w-2 h-2 rounded-full bg-mecura-neon animate-bounce" /><div className="w-2 h-2 rounded-full bg-mecura-neon animate-bounce" style={{animationDelay: '0.1s'}} /><div className="w-2 h-2 rounded-full bg-mecura-neon animate-bounce" style={{animationDelay: '0.2s'}} />
                          </div>
                      </div>
                  )}
              </div>
              <div className="p-4 bg-[#161622] border-t border-white/10">
                  {selectedAiFile && (
                      <div className="mb-3 inline-flex items-center gap-2 bg-[#262636] px-3 py-1.5 rounded-full border border-white/10">
                          <Paperclip className="w-3.5 h-3.5 text-mecura-neon" />
                          <span className="text-xs text-[#8A8A9E] max-w-[200px] truncate">{selectedAiFile.name}</span>
                          <button onClick={() => setSelectedAiFile(null)} className="text-[#8A8A9E] hover:text-white ml-1"><X className="w-3.5 h-3.5" /></button>
                      </div>
                  )}
                  <div className="flex gap-2">
                      <input type="file" ref={fileInputRef} onChange={handleAiFileSelect} className="hidden" accept=".pdf,.txt,.csv,.png,.jpg,.jpeg" />
                      <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-[#262636] hover:bg-[#363646] text-[#8A8A9E] hover:text-white rounded-xl"><Paperclip className="w-5 h-5" /></button>
                      <input type="text" value={aiInputText} onChange={(e) => setAiInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()} placeholder="Digite o que deseja fazer com o catálogo..." className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon text-sm" disabled={isAiLoading} />
                      <button onClick={handleSendAiMessage} disabled={isAiLoading || (!aiInputText.trim() && !selectedAiFile)} className="p-3 bg-mecura-neon text-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors"><Send className="w-5 h-5" /></button>
                  </div>
              </div>
            </div>
          </div>
      )}

      {/* Basic Modals */}
      
      {deletePatientConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-red-500/30 rounded-3xl p-6 w-full max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Excluir Paciente?</h3>
            <p className="text-[#8A8A9E] mb-6 text-sm">Esta ação removerá o perfil do paciente. Essa ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeletePatientConfirm(null)}>Cancelar</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDeletePatient}>Excluir</Button>
            </div>
          </div>
        </div>
      )}

      {showEditPatientPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Redefinir Senha do Paciente</h3>
            <p className="text-[#8A8A9E] mb-6 text-sm">Por questões de segurança do Firebase, não é possível definir uma senha provisória manualmente.<br/><br/>Ao confirmar, o sistema enviará um e-mail oficial para <b>{patients.find(p => p.id === showEditPatientPassword)?.email}</b> com um link seguro para ele redefinir a própria senha.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditPatientPassword(null)}>Cancelar</Button>
              <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black" onClick={handleUpdatePatientPassword}>Enviar E-mail</Button>
            </div>
          </div>
        </div>
      )}

      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Novo Médico</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2" />
              <input type="text" placeholder="CRM" value={doctorForm.crm} onChange={e => setDoctorForm({...doctorForm, crm: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2" />
              <input type="email" placeholder="Email" value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2" />
              <input type="password" placeholder="Senha" value={doctorForm.password} onChange={e => setDoctorForm({...doctorForm, password: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2" />
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddDoctor(false)}>Cancelar</Button>
                <Button className="flex-1" onClick={handleAddDoctor}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Senha</h3>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditPassword(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleUpdatePassword}>Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {showAddCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Criar Novo Cupom</h3>
            
            <label className="text-xs text-[#8A8A9E] mb-1 block">Código do Cupom (ex: MECURA20)</label>
            <input 
              type="text" 
              placeholder="Ex: MECURA20" 
              value={couponForm.code} 
              onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} 
              className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-3 text-white uppercase font-bold tracking-wider" 
            />

            <label className="text-xs text-[#8A8A9E] mb-1 block">Porcentagem de Desconto (%)</label>
            <input 
              type="number" 
              placeholder="Ex: 50" 
              min="1" 
              max="100" 
              value={couponForm.discount} 
              onChange={e => setCouponForm({...couponForm, discount: Number(e.target.value)})} 
              className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-3 text-white font-semibold" 
            />

            <label className="text-xs text-[#8A8A9E] mb-1 block">Limite Total de Usos (0 = Ilimitado para novos clientes)</label>
            <input 
              type="number" 
              placeholder="0 para ilimitado" 
              min="0" 
              value={couponForm.quantity} 
              onChange={e => setCouponForm({...couponForm, quantity: Number(e.target.value)})} 
              className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4 text-white" 
            />

            <div className="bg-[#0A0A0F]/60 border border-[#262636] rounded-xl p-3 mb-5 text-xs text-[#8A8A9E] flex items-start gap-2">
              <span className="text-mecura-neon font-bold text-sm">🔒</span>
              <p>
                <strong className="text-white">Uso Único por Cliente:</strong> Cada paciente só conseguirá utilizar este cupom <strong>1 vez</strong>. Outros pacientes poderão utilizá-lo normalmente até atingir o limite configurado (ou sem limite se for 0).
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddCoupon(false)}>Cancelar</Button>
              <Button className="flex-1 bg-mecura-neon text-black font-bold hover:bg-mecura-neon/90" onClick={handleAddCoupon}>Salvar Cupom</Button>
            </div>
          </div>
        </div>
      )}

      {showSendNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Notificação Push</h3>
            <input type="text" placeholder="Título" value={notificationForm.title} onChange={e => setNotificationForm({...notificationForm, title: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" />
            <textarea placeholder="Mensagem" value={notificationForm.message} onChange={e => setNotificationForm({...notificationForm, message: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4 h-24" />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSendNotification(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSendNotification}>Enviar</Button>
            </div>
          </div>
        </div>
      )}

      {showAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Agenda do Paciente</h3>
              <button onClick={() => setShowAgenda(null)}><XCircle className="w-6 h-6" /></button>
            </div>
            
            <div className="bg-[#0A0A0F] border border-[#262636] p-4 rounded-xl mb-4">
               <h4 className="font-bold mb-3">Agendar Nova Consulta</h4>
               <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                  const time = (form.elements.namedItem('time') as HTMLInputElement).value;
                  const type = (form.elements.namedItem('type') as HTMLSelectElement).value;
                  
                  if(!date || !time) return;
                  
                  try {
                    await addDoc(collection(db, 'appointments'), {
                      patientId_temp_fix: showAgenda,
                      patientName: patients.find(p => p.id === showAgenda)?.name || 'Paciente',
                      date,
                      time,
                      type,
                      status: 'pending',
                      createdAt: new Date().toISOString()
                    });
                    form.reset();
                    setSupportToastMessage('Agendado com sucesso!');
                    setShowSupportToast(true);
                    setTimeout(() => setShowSupportToast(false), 3000);
                  } catch(err) {
                    console.error(err);
                  }
               }} className="grid grid-cols-2 gap-3">
                 <input type="date" name="date" required className="bg-[#161622] border border-[#262636] rounded-lg px-3 py-2 text-sm" />
                 <input type="time" name="time" required className="bg-[#161622] border border-[#262636] rounded-lg px-3 py-2 text-sm" />
                 <select name="type" className="bg-[#161622] border border-[#262636] rounded-lg px-3 py-2 text-sm col-span-2">
                   <option value="Consulta Básica">Consulta Básica</option>
                   <option value="Consulta Premium">Consulta Premium</option>
                 </select>
                 <Button type="submit" className="col-span-2 text-sm py-2 h-auto">Confirmar Agendamento</Button>
               </form>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {allAppointments.filter(app => (app as any).doctorId_temp_fix === showAgenda || (app as any).patientId_temp_fix === showAgenda).length > 0 ? (
                allAppointments.filter(app => (app as any).doctorId_temp_fix === showAgenda || (app as any).patientId_temp_fix === showAgenda).map(app => (
                  <div key={app.id} className="bg-[#0A0A0F] border border-[#262636] rounded-2xl p-4 flex justify-between">
                    <div>
                      <div className="font-bold">{app.patientName}</div>
                      <div className="text-sm text-[#8A8A9E]">{new Date(app.date).toLocaleDateString('pt-BR')} {app.time}</div>
                    </div>
                    <div>{app.status}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[#8A8A9E]">Sem consultas.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {showSupportToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-mecura-neon text-black px-6 py-3 rounded-full font-bold shadow-lg z-50">
            {supportToastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals for Agenda */}
      <AnimatePresence>
        {cancelModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#12121A] border border-[#262636] p-6 rounded-2xl w-full max-w-md relative"
            >
              <button 
                onClick={() => setCancelModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-[#8A8A9E] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2">Cancelar Consulta</h3>
              <p className="text-[#8A8A9E] text-sm mb-6">Por favor, informe o motivo do cancelamento. Esta informação ficará registrada no sistema.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Motivo / Observação</label>
                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ex: Paciente solicitou cancelamento..."
                    className="w-full bg-[#161622] border border-[#262636] text-white rounded-xl p-4 min-h-[100px] outline-none focus:border-red-500"
                  />
                </div>
                
                <button 
                  onClick={() => {
                    if (appointmentToCancel) {
                      cancelAppointment(appointmentToCancel, cancelReason);
                      setCancelModalOpen(false);
                      setAppointmentToCancel(null);
                    }
                  }}
                  className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {rescheduleModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#12121A] border border-[#262636] p-6 rounded-2xl w-full max-w-md relative"
            >
              <button 
                onClick={() => setRescheduleModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-[#8A8A9E] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2">Remarcar Consulta</h3>
              <p className="text-[#8A8A9E] text-sm mb-6">Selecione a nova data e o novo horário para esta consulta.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Nova Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A9E]" />
                    <input 
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full bg-[#161622] border border-[#262636] text-white rounded-xl p-4 pl-12 outline-none focus:border-blue-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Novo Horário</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A9E]" />
                    <input 
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full bg-[#161622] border border-[#262636] text-white rounded-xl p-4 pl-12 outline-none focus:border-blue-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    if (appointmentToReschedule && rescheduleDate && rescheduleTime) {
                      rescheduleAppointment(appointmentToReschedule, rescheduleDate, rescheduleTime);
                      setRescheduleModalOpen(false);
                      setAppointmentToReschedule(null);
                    }
                  }}
                  className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Confirmar Remarcação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

