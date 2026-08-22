import html2pdf from "html2pdf.js";
import Markdown from 'react-markdown';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  X
, Edit3, Check, LogOut } from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';

export const AdminDashboardScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications'>('overview');
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
  const { allAppointments } = useStore();

  const [supportRequests, setSupportRequests] = useState<any[]>([]);

  const [patients, setPatients] = useState<any[]>([]);
  const [queueCount, setQueueCount] = useState(0);

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

    return () => {
      unsubscribeUsers();
      unsubscribeQueue();
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
    return () => unsubscribe();
  }, [supportRequests.length]);

  // Modals state
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({ name: '', crm: '', email: '', password: '' });
  const [showEditPassword, setShowEditPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showAgenda, setShowAgenda] = useState<string | null>(null);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount: 10 });
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
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
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
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
    addCoupon({ id: Date.now().toString(), active: true, ...couponForm });
    setShowAddCoupon(false);
    setCouponForm({ code: '', discount: 10 });
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0A0A0F] text-white">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#12121A] border-r border-white/5 p-6 flex flex-col gap-2">
        <div className="font-bold text-xl mb-8 flex items-center gap-2">
          <Settings className="w-6 h-6 text-mecura-neon" />
          Mecura Admin
        </div>
        {[
          { id: 'overview', label: 'Visão Geral', icon: BarChart },
          { id: 'patients', label: 'Pacientes', icon: UserCircle },
          { id: 'doctors', label: 'Médicos', icon: Users },
          { id: 'chat_patient', label: 'Chat Paciente', icon: MessageCircle },
          { id: 'chat_doctor', label: 'Chat Médico', icon: MessageSquare },
          { id: 'catalog', label: 'Assistente IA', icon: Pill },
          { id: 'agronomic', label: 'Laudo Agronômico', icon: FileText },
          { id: 'coupons', label: 'Cupons', icon: Ticket },
          { id: 'notifications', label: 'Notificações', icon: Bell }
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
              {tab.id === 'support' && supportRequests.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{supportRequests.length}</span>
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
                <div className="text-[#8A8A9E] mb-2">R$ 50 (Fila)</div>
                <div className="text-3xl font-bold text-mecura-neon">{queueCount}</div>
              </div>
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">R$ 250 (Premium)</div>
                <div className="text-3xl font-bold text-purple-400">{allAppointments.length}</div>
              </div>
              <div className="bg-[#161622] p-6 rounded-2xl border border-[#262636]">
                <div className="text-[#8A8A9E] mb-2">Pacientes</div>
                <div className="text-3xl font-bold text-white">{patients.length}</div>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Faturamento (Lucro)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#161622] to-[#1a2e20] p-6 rounded-2xl border border-mecura-neon/30">
                <div className="text-[#8A8A9E] mb-2">Receita Fila (R$ 50)</div>
                <div className="text-3xl font-bold text-mecura-neon">
                  {(queueCount * 50).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#2e1a2b] p-6 rounded-2xl border border-purple-500/30">
                <div className="text-[#8A8A9E] mb-2">Receita Premium (R$ 250)</div>
                <div className="text-3xl font-bold text-purple-400">
                  {(allAppointments.length * 250).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#262636] p-6 rounded-2xl border border-white/20">
                <div className="text-[#8A8A9E] mb-2">Faturamento Total</div>
                <div className="text-3xl font-bold text-white">
                  {((queueCount * 50) + (allAppointments.length * 250)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'patients' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Pacientes Cadastrados</h2>
            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-4 p-4 border-b border-[#262636] text-[#8A8A9E] font-bold">
                <div>Nome</div>
                <div>Email</div>
                <div>Plano</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-[#262636]">
                {patients.length > 0 ? patients.map(p => (
                  <div key={p.id} className="grid grid-cols-4 p-4 items-center">
                    <div className="font-bold text-white">{p.name || 'Sem nome'}</div>
                    <div className="text-[#8A8A9E] text-sm">{p.email || 'N/A'}</div>
                    <div>
                       <span className={`px-2 py-1 rounded-full text-xs ${p.tier === 'Premium' ? 'bg-purple-500/20 text-purple-400' : 'bg-mecura-neon/20 text-mecura-neon'}`}>
                         {p.tier || 'Essencial'}
                       </span>
                    </div>
                    <div>
                       {p.hasCompletedOnboarding ? (
                          <span className="text-green-400 text-sm">Ativo</span>
                       ) : (
                          <span className="text-yellow-400 text-sm">Pendente</span>
                       )}
                    </div>
                  </div>
                )) : (
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
                        <div className="bg-white p-6 rounded-xl overflow-x-auto relative text-black">
                           <div contentEditable={isEditingAgronomic} suppressContentEditableWarning={true} onBlur={(e) => setAgronomicResult(e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: agronomicResult.replace(/```html/g, "").replace(/```/g, "") }} id="agronomic-report-container" className={`text-black bg-white p-4 rounded outline-none transition-all ${isEditingAgronomic ? 'ring-4 ring-mecura-neon/50' : ''}`} />
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
                  <button onClick={() => deleteNotification(notification.id)} className="absolute top-4 right-4 text-[#8A8A9E] hover:text-red-400 opacity-0 group-hover:opacity-100">
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
        {activeTab === 'chat_patient' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Solicitações de Suporte (Humanos)</h2>
            {supportRequests.length === 0 ? (
              <div className="bg-[#161622] border border-[#262636] rounded-2xl p-8 text-center text-[#8A8A9E]">Nenhuma solicitação pendente.</div>
            ) : (
              <div className="space-y-4">
                {supportRequests.map(req => (
                  <div key={req.id} className="bg-[#161622] border border-[#262636] rounded-2xl p-6 flex justify-between">
                    <div>
                      <div className="font-bold text-lg">{req.userName}</div>
                      <div className="text-sm text-[#8A8A9E]">{req.email || "Sem e-mail"}</div>
                      <div className="text-xs text-[#8A8A9E] mt-2">Solicitado em: {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString('pt-BR') : 'Agora'}</div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => window.open(`https://wa.me/5566996280883?text=Olá ${encodeURIComponent(req.userName)}, recebemos sua solicitação na Mecura.`, '_blank')} className="bg-[#25D366] text-white">Chamar no WhatsApp</Button>
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
              <h3 className="text-xl font-bold">Agenda</h3>
              <button onClick={() => setShowAgenda(null)}><XCircle className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {allAppointments.length > 0 ? (
                allAppointments.map(app => (
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
    </div>
  );
};
