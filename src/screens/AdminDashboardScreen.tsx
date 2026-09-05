import html2pdf from "html2pdf.js";
import Markdown from 'react-markdown';

import React, { useState, useEffect, useRef } from 'react';
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
, Edit3, Check, LogOut } from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs, deleteDoc, addDoc, setDoc } from 'firebase/firestore';

export const AdminDashboardScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications' | 'agenda' | 'password_requests'>('overview');
  
  

  const forceSendToQueue = async (patient: any) => {
    try {
      await setDoc(doc(db, 'queue', patient.id), {
        patientId_temp_fix: patient.id,
        patientName: patient.name || 'Sem nome',
        email: patient.email || 'sem-email@mecura.com',
        tier: patient.tier || 'basic',
        status: 'waiting',
        joinedAt: new Date().toISOString(),
      });
      setSupportToastMessage(`${patient.name || 'Sem nome'} enviado para a fila!`);
      setShowSupportToast(true);
      setTimeout(() => setShowSupportToast(false), 3000);
    } catch (e) {
      console.error(e);
      setSupportToastMessage('Erro ao enviar para a fila.');
      setShowSupportToast(true);
      setTimeout(() => setShowSupportToast(false), 3000);
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
    productCategories,
    setProductCategories,
    addProduct,
    updateProduct,
    deleteProduct
  } = useAdminStore();
  const { queue, allAppointments, confirmAppointment, cancelAppointment, rescheduleAppointment } = useStore();

  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const passwordRequests = supportRequests.filter(req => req.userId === 'recovery');
  const generalNotifications = supportRequests.filter(req => req.userId !== 'recovery');

  const [patients, setPatients] = useState<any[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users (patients)
    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch queue (basic consultations 50 reais)
    const qQueue = query(collection(db, 'queue'));
    const unsubscribeQueue = onSnapshot(qQueue, (snapshot) => {
      setQueueCount(snapshot.size);
    });

    const qPayments = query(collection(db, 'payments'));
    const unsubscribePayments = onSnapshot(qPayments, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const revenueFila = payments.filter(p => p.type === 'Consulta Básica').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenuePremium = payments.filter(p => p.type === 'Consulta Premium').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenueTotal = revenueFila + revenuePremium;

  return () => {
      unsubscribeUsers();
      unsubscribeQueue();
      unsubscribePayments();
    };
  }, []);

  const [showSupportToast, setShowSupportToast] = useState(false);
  const [supportToastMessage, setSupportToastMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, 'support_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeRequests = requests.filter((r: any) => r.status === 'pending');
      
      if (activeRequests.length > supportRequests.length && supportRequests.length > 0) {
        setSupportToastMessage("Nova solicitação de suporte recebida!");
        setShowSupportToast(true);
        setTimeout(() => setShowSupportToast(false), 3000);
      }
      
      setSupportRequests(activeRequests);
    });
    const revenueFila = payments.filter(p => p.type === 'Consulta Básica').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenuePremium = payments.filter(p => p.type === 'Consulta Premium').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenueTotal = revenueFila + revenuePremium;

  return () => unsubscribe();
  }, [supportRequests.length]);

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
  const [medicineToEdit, setMedicineToEdit] = useState<any>(null);
  const [showImportMedicineModal, setShowImportMedicineModal] = useState(false);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [newMedicine, setNewMedicine] = useState({ name: '', manufacturer: '', origin: '', type: '', description: '', categoryId: '1', priceBRL: '', indications: '' });
  const [diseaseFilter, setDiseaseFilter] = useState('');
  
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
              pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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

  const handleAddCoupon = () => {
    addCoupon({ id: Date.now().toString(), active: true, usedCount: 0, usedBy: [], ...couponForm });
    setShowAddCoupon(false);
    setCouponForm({ code: '', discount: 10, quantity: 0 });
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

  const revenueFila = payments.filter(p => p.type === 'Consulta Básica').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenuePremium = payments.filter(p => p.type === 'Consulta Premium').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenueTotal = revenueFila + revenuePremium;

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-[#0A0A0F] text-white">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#12121A] border-r border-white/5 p-6 flex flex-col gap-2">
        <div className="font-bold text-xl mb-8 flex items-center gap-2">
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
          { id: 'password_requests', label: 'Trocas de Senha', icon: Key }
        ].map((tab) => {
          const Icon = tab.icon;
          const revenueFila = payments.filter(p => p.type === 'Consulta Básica').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenuePremium = payments.filter(p => p.type === 'Consulta Premium').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenueTotal = revenueFila + revenuePremium;

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
        
        <div className="mt-auto pt-4 border-t border-white/5">
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Visão Geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">Total Consultas</div>
                <div className="text-3xl font-bold text-white">{allAppointments.length + queueCount}</div>
              </div>
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">Consultas Básicas (Pagas)</div>
                <div className="text-3xl font-bold text-mecura-neon">{payments.filter(p => p.type === 'Consulta Básica').length}</div>
              </div>
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">Consultas Premium (Pagas)</div>
                <div className="text-3xl font-bold text-purple-400">{payments.filter(p => p.type === 'Consulta Premium').length}</div>
              </div>
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">Pacientes</div>
                <div className="text-3xl font-bold text-white">{patients.length}</div>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Faturamento (Lucro - Via Mercado Pago)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#161622] to-[#1a2e20] p-6 rounded-2xl border border-mecura-neon/30">
                <div className="text-[#8A8A9E] mb-2">Receita Fila (Mercado Pago)</div>
                <div className="text-3xl font-bold text-mecura-neon">
                  {revenueFila.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#2e1a2b] p-6 rounded-2xl border border-purple-500/30">
                <div className="text-[#8A8A9E] mb-2">Receita Premium (Mercado Pago)</div>
                <div className="text-3xl font-bold text-purple-400">
                  {revenuePremium.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#262636] p-6 rounded-2xl border border-white/20">
                <div className="text-[#8A8A9E] mb-2">Faturamento Total</div>
                <div className="text-3xl font-bold text-white">
                  {revenueTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
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
  {queue.find(q => q.id === p.id && q.status === 'waiting') && (
    <span className="bg-mecura-neon/20 text-mecura-neon text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap">Na Fila</span>
  )}
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
                         <Button variant="outline" className="text-[10px] h-7 px-1 bg-[#161622] hover:bg-mecura-neon/20 hover:text-mecura-neon" onClick={() => forceSendToQueue(p)} title="Mover para Fila">Fila</Button>
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Catálogo de Produtos</h2>
              <Button onClick={() => setShowImportMedicineModal(true)}>
                <BrainCircuit className="w-4 h-4 mr-2" /> Assistente IA
              </Button>
            </div>
            
            <div className="space-y-8">
              {productCategories.map(cat => (
                <div key={cat.id} className="bg-[#161622] border border-[#262636] p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-mecura-neon mb-4">{cat.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.products.map(prod => (
                      <div key={prod.name} className="bg-[#0A0A0F] border border-[#262636] p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-white mb-1">{prod.name}</div>
                          <div className="text-xs text-[#8A8A9E] mb-2">{prod.manufacturer} • {prod.type}</div>
                          {prod.priceBRL && <div className="text-mecura-neon text-sm font-bold mt-2">R$ {prod.priceBRL}</div>}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button onClick={() => deleteProduct(cat.id, prod.name)} className="text-[#8A8A9E] hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Cupons de Desconto</h2>
              <Button onClick={() => setShowAddCoupon(true)}>
                <Plus className="w-4 h-4 mr-2" /> Novo Cupom
              </Button>
            </div>
            <div className="grid gap-4">
              {coupons.map(coupon => (
                <div key={coupon.id} className="bg-[#161622] border border-[#262636] p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl uppercase tracking-wider text-mecura-neon">{coupon.code}</h3>
                    <p className="text-[#8A8A9E] text-sm mt-1">{coupon.discount}% de Desconto {coupon.ownerId ? `(Indicador: ${coupon.ownerId})` : ''}</p>
                    <p className="text-[#8A8A9E] text-xs mt-1">Usados: {coupon.usedCount || 0} / {coupon.quantity ? coupon.quantity : 'Ilimitado'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${coupon.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </span>
                    <button onClick={() => updateCoupon(coupon.id, { active: !coupon.active })} className="text-[#8A8A9E] hover:text-white">
                      {coupon.active ? <XCircle className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
                    </button>
                    <button onClick={() => deleteCoupon(coupon.id)} className="text-[#8A8A9E] hover:text-red-400"><Trash2 className="w-5 h-5"/></button>
                  </div>
                </div>
              ))}
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
            <h3 className="text-xl font-bold mb-4">Novo Cupom</h3>
            <input type="text" placeholder="Código" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" />
            <input type="number" placeholder="Desconto %" value={couponForm.discount} onChange={e => setCouponForm({...couponForm, discount: Number(e.target.value)})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" />
            <input type="number" placeholder="Quantidade Máx. (0 = Ilimitado)" value={couponForm.quantity} onChange={e => setCouponForm({...couponForm, quantity: Number(e.target.value)})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" title="Deixe 0 para ilimitado" />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddCoupon(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleAddCoupon}>Salvar</Button>
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
              {allAppointments.filter(app => app.doctorId_temp_fix === showAgenda || app.patientId_temp_fix === showAgenda).length > 0 ? (
                allAppointments.filter(app => app.doctorId_temp_fix === showAgenda || app.patientId_temp_fix === showAgenda).map(app => (
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

