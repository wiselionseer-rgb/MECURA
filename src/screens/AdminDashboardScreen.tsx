import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore, Doctor, Coupon, Notification } from '../store/useAdminStore';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { NotificationToast } from '../components/NotificationToast';
import { 
  Users, 
  Tag, 
  Bell, 
  LogOut, 
  Plus, 
  Trash2, 
  Key, 
  Send,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  History,
  UserMinus,
  DollarSign,
  Activity,
  Search,
  Eye,
  ArrowLeft,
  FileText,
  BrainCircuit,
  Calendar,
  Clock,
  XCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';

export function AdminDashboardScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'metrics' | 'doctors' | 'chat' | 'history' | 'abandonment' | 'coupons' | 'promotions' | 'notifications'>('metrics');
  
  const { 
    doctors, addDoctor, updateDoctor, deleteDoctor,
    coupons, addCoupon, deleteCoupon,
    notifications, addNotification, deleteNotification,
    promotionsText, setPromotionsText,
    catalogUrl, setCatalogUrl
  } = useAdminStore();

  const { consultationHistory, allAppointments, exchangeRate, updateExchangeRate } = useStore();
  
  const [newExchangeRate, setNewExchangeRate] = useState(exchangeRate);

  useEffect(() => {
    setNewExchangeRate(exchangeRate);
  }, [exchangeRate]);

  // Modals state
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState<string | null>(null);
  const [showAgenda, setShowAgenda] = useState<string | null>(null);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);

  // Form states
  const [doctorForm, setDoctorForm] = useState({ name: '', crm: '', email: '', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [couponForm, setCouponForm] = useState({ code: '', discount: 0 });
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '' });

  // History Search
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

  // Chat State
  const [selectedDoctorChat, setSelectedDoctorChat] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, {text: string, sender: 'admin'|'doctor', time: string}[]>>({
    '1': [
      { text: 'Olá, preciso de ajuda com o sistema de prescrição.', sender: 'doctor', time: '10:30' },
      { text: 'Claro, qual a sua dúvida?', sender: 'admin', time: '10:32' }
    ]
  });

  const handleSendAdminMessage = () => {
    if (adminMessage.trim() && selectedDoctorChat) {
      const newMessage = {
        text: adminMessage,
        sender: 'admin' as const,
        time: format(new Date(), 'HH:mm')
      };
      
      setChatMessages(prev => ({
        ...prev,
        [selectedDoctorChat]: [...(prev[selectedDoctorChat] || []), newMessage]
      }));
      
      setAdminMessage('');
    }
  };
  const revenueData = [
    { name: 'Seg', revenue: 1200 },
    { name: 'Ter', revenue: 1900 },
    { name: 'Qua', revenue: 1500 },
    { name: 'Qui', revenue: 2200 },
    { name: 'Sex', revenue: 2800 },
    { name: 'Sáb', revenue: 3500 },
    { name: 'Dom', revenue: 4100 },
  ];

  const consultationsData = [
    { name: 'Seg', count: 12 },
    { name: 'Ter', count: 19 },
    { name: 'Qua', count: 15 },
    { name: 'Qui', count: 22 },
    { name: 'Sex', count: 28 },
    { name: 'Sáb', count: 35 },
    { name: 'Dom', count: 41 },
  ];

  // Mock Data for Abandonment
  const abandonedLeads = [
    { id: '1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-9999', step: 'Pagamento da Consulta', date: '2026-04-06T10:30:00' },
    { id: '2', name: 'Maria Souza', email: 'maria@email.com', phone: '(11) 98888-8888', step: 'Carrinho de Produtos', date: '2026-04-05T15:45:00' },
    { id: '3', name: 'Pedro Santos', email: 'pedro@email.com', phone: '(11) 97777-7777', step: 'Triagem Inicial', date: '2026-04-04T09:15:00' },
  ];

  const handleAddDoctor = () => {
    if (doctorForm.name && doctorForm.crm && doctorForm.password) {
      addDoctor({
        id: Date.now().toString(),
        ...doctorForm
      });
      setShowAddDoctor(false);
      setDoctorForm({ name: '', crm: '', email: '', password: '' });
    }
  };

  const handleUpdatePassword = () => {
    if (showEditPassword && newPassword) {
      updateDoctor(showEditPassword, { password: newPassword });
      setShowEditPassword(null);
      setNewPassword('');
    }
  };

  const handleAddCoupon = () => {
    if (couponForm.code && couponForm.discount > 0) {
      addCoupon({
        id: Date.now().toString(),
        code: couponForm.code.toUpperCase(),
        discount: couponForm.discount,
        active: true
      });
      setShowAddCoupon(false);
      setCouponForm({ code: '', discount: 0 });
    }
  };

  const handleSendNotification = () => {
    if (notificationForm.title && notificationForm.message) {
      addNotification({
        id: Date.now().toString(),
        title: notificationForm.title,
        message: notificationForm.message,
        date: new Date().toISOString()
      });
      setShowSendNotification(false);
      setNotificationForm({ title: '', message: '' });
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-white">
      <NotificationToast />
      {/* Sidebar */}
      <div className="w-64 bg-[#161622] border-r border-[#262636] flex flex-col">
        <div className="p-6 border-b border-[#262636]">
          <div className="flex items-center gap-3 text-mecura-neon mb-2">
            <ShieldCheck className="w-8 h-8" />
            <h1 className="text-xl font-bold">Admin</h1>
          </div>
          <p className="text-sm text-[#8A8A9E]">Painel de Controle</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'metrics' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Métricas & Financeiro
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'doctors' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            Médicos
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'chat' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Chat com Médicos
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'history' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }`}
          >
            <History className="w-5 h-5" />
            Histórico de Pacientes
          </button>
          <button
            onClick={() => setActiveTab('abandonment')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'abandonment' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }`}
          >
            <UserMinus className="w-5 h-5" />
            Monitoramento de Abandono
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'coupons' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }`}
          >
            <Tag className="w-5 h-5" />
            Cupons
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'promotions' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }`}
          >
            <Tag className="w-5 h-5" />
            Promoções
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-mecura-neon/10 text-mecura-neon border border-mecura-neon/20' 
                : 'text-[#8A8A9E] hover:bg-[#262636] hover:text-white'
            }`}
          >
            <Bell className="w-5 h-5" />
            Notificações
          </button>
        </nav>

        <div className="p-4 border-t border-[#262636]">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#8A8A9E] hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'metrics' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Métricas & Financeiro</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6">
                <div className="flex items-center gap-3 text-[#8A8A9E] mb-2">
                  <DollarSign className="w-5 h-5 text-mecura-neon" />
                  <span>Taxa de Câmbio (USD/BRL)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={newExchangeRate}
                    onChange={(e) => setNewExchangeRate(parseFloat(e.target.value))}
                    className="w-24 bg-[#0A0A0F] border border-[#262636] rounded-lg px-2 py-1 text-white"
                  />
                  <Button size="sm" onClick={async () => {
                    console.log('Updating exchange rate to:', newExchangeRate);
                    await updateExchangeRate(newExchangeRate);
                    alert('Câmbio atualizado com sucesso!');
                  }}>
                    Atualizar
                  </Button>
                </div>
              </div>
              <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6">
                <div className="flex items-center gap-3 text-[#8A8A9E] mb-2">
                  <DollarSign className="w-5 h-5 text-mecura-neon" />
                  <span>Receita Total (Mês)</span>
                </div>
                <div className="text-3xl font-bold">R$ 45.200,00</div>
                <div className="text-sm text-green-400 mt-2">+12% vs mês anterior</div>
              </div>
              <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6">
                <div className="flex items-center gap-3 text-[#8A8A9E] mb-2">
                  <Activity className="w-5 h-5 text-mecura-neon" />
                  <span>Consultas Realizadas</span>
                </div>
                <div className="text-3xl font-bold">{consultationHistory.length}</div>
                <div className="text-sm text-green-400 mt-2">+5% vs mês anterior</div>
              </div>
              <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6">
                <div className="flex items-center gap-3 text-[#8A8A9E] mb-2">
                  <Users className="w-5 h-5 text-mecura-neon" />
                  <span>Novos Pacientes</span>
                </div>
                <div className="text-3xl font-bold">385</div>
                <div className="text-sm text-green-400 mt-2">+18% vs mês anterior</div>
              </div>
              <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6">
                <div className="flex items-center gap-3 text-[#8A8A9E] mb-2">
                  <UserMinus className="w-5 h-5 text-red-400" />
                  <span>Taxa de Abandono</span>
                </div>
                <div className="text-3xl font-bold">15%</div>
                <div className="text-sm text-red-400 mt-2">+2% vs mês anterior</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6">Fluxo de Caixa (Últimos 7 dias)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262636" vertical={false} />
                      <XAxis dataKey="name" stroke="#8A8A9E" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#8A8A9E" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid #262636', borderRadius: '12px' }}
                        itemStyle={{ color: '#00F2FF' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#00F2FF" strokeWidth={3} dot={{ fill: '#00F2FF', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6">Volume de Consultas (Últimos 7 dias)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={consultationsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262636" vertical={false} />
                      <XAxis dataKey="name" stroke="#8A8A9E" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#8A8A9E" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid #262636', borderRadius: '12px' }}
                        itemStyle={{ color: '#00F2FF' }}
                        cursor={{ fill: '#262636' }}
                      />
                      <Bar dataKey="count" fill="#00F2FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex gap-6">
            {/* Doctors List */}
            <div className="w-1/3 bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#262636]">
                <h3 className="font-bold">Médicos Online</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {doctors.map(doctor => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctorChat(doctor.id)}
                    className={`w-full text-left p-4 rounded-xl transition-colors ${
                      selectedDoctorChat === doctor.id 
                        ? 'bg-mecura-neon/10 border border-mecura-neon/30' 
                        : 'hover:bg-[#262636] border border-transparent'
                    }`}
                  >
                    <div className="font-bold text-white">{doctor.name}</div>
                    <div className="text-sm text-[#8A8A9E]">{doctor.crm}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#161622] border border-[#262636] rounded-2xl flex flex-col overflow-hidden">
              {selectedDoctorChat ? (
                <>
                  <div className="p-4 border-b border-[#262636] flex items-center justify-between">
                    <h3 className="font-bold">
                      Chat com {doctors.find(d => d.id === selectedDoctorChat)?.name}
                    </h3>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {(chatMessages[selectedDoctorChat] || []).map((msg, idx) => (
                      <div key={idx} className={`flex flex-col gap-1 ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                          msg.sender === 'admin' 
                            ? 'bg-mecura-neon/20 text-mecura-neon rounded-tr-none' 
                            : 'bg-[#262636] text-white rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-xs text-[#8A8A9E]">{msg.time}</span>
                      </div>
                    ))}
                    {(chatMessages[selectedDoctorChat] || []).length === 0 && (
                      <div className="text-center text-[#8A8A9E] mt-10">
                        Nenhuma mensagem ainda. Envie uma mensagem para iniciar a conversa.
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-[#262636] flex gap-2">
                    <input 
                      type="text"
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white focus:outline-none focus:border-mecura-neon/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendAdminMessage()}
                    />
                    <Button onClick={handleSendAdminMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#8A8A9E]">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                  <p>Selecione um médico para iniciar o chat</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {selectedHistoryItem && (
                  <button 
                    onClick={() => setSelectedHistoryItem(null)}
                    className="p-2 bg-[#161622] border border-[#262636] rounded-xl text-[#8A8A9E] hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-2xl font-bold">
                  {selectedHistoryItem ? `Prontuário: ${selectedHistoryItem.patientName}` : 'Histórico Global de Pacientes'}
                </h2>
              </div>
            </div>

            <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6">
              {!selectedHistoryItem ? (
                <>
                  <div className="relative mb-6">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A9E]" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome do paciente..." 
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-[#262636] rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-mecura-neon/50 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    {consultationHistory
                      .filter(h => h.patientName.toLowerCase().includes(historySearchTerm.toLowerCase()))
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((history) => (
                        <div key={history.id} className="p-5 rounded-2xl bg-[#0A0A0F] border border-[#262636] flex justify-between items-center group">
                          <div>
                            <h3 className="font-bold text-white text-lg">{history.patientName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-[#8A8A9E] flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {format(history.date, 'dd/MM/yyyy')}
                              </span>
                              <span className="text-xs text-[#8A8A9E] flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> {history.messages.length} mensagens
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setSelectedHistoryItem(history)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Prontuário
                          </Button>
                        </div>
                      ))}
                    
                    {consultationHistory.filter(h => h.patientName.toLowerCase().includes(historySearchTerm.toLowerCase())).length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-[#8A8A9E]">Nenhum histórico encontrado.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-8">
                  {/* Evolution Chart */}
                  <div className="p-6 rounded-2xl bg-[#0A0A0F] border border-[#262636]">
                    <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-mecura-neon" /> Evolução do Tratamento
                    </h4>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={consultationHistory
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
                          <CartesianGrid strokeDasharray="3 3" stroke="#262636" vertical={false} />
                          <XAxis dataKey="date" stroke="#8A8A9E" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#8A8A9E" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#161622', border: '1px solid #262636', borderRadius: '12px' }}
                            itemStyle={{ color: '#00F2FF' }}
                          />
                          <Area type="monotone" dataKey="intensity" stroke="#00F2FF" strokeWidth={3} fillOpacity={1} fill="url(#colorIntensity)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Prescriptions */}
                  <div className="space-y-6">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-mecura-neon" /> Prescrições e Orientações
                    </h4>
                    
                    {selectedHistoryItem.messages
                      .filter((m: any) => m.type === 'prescription' || m.type === 'product' || m.type === 'prescription_notes')
                      .map((msg: any, idx: number) => (
                        <div key={idx} className="p-6 rounded-2xl bg-[#0A0A0F] border border-[#262636]">
                          {msg.type === 'product' && msg.productData && (
                            <div className="flex gap-4">
                              <div className="w-16 h-16 rounded-xl bg-[#161622] flex items-center justify-center p-2 border border-[#262636]">
                                <img src={msg.productData.image || "https://images.unsplash.com/photo-1608681286823-3801264b321a?q=80&w=400&auto=format&fit=crop"} alt={msg.productData.name} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <div className="text-xs text-mecura-neon font-bold mb-1">PRODUTO RECOMENDADO</div>
                                <h4 className="font-bold text-white mb-1">{msg.productData.name}</h4>
                                <p className="text-sm text-[#8A8A9E] mb-2">{msg.productData.concentration}</p>
                                <div className="text-sm text-white bg-[#161622] px-3 py-2 rounded-lg border border-[#262636]">
                                  <span className="text-[#8A8A9E]">Posologia:</span> {msg.content}
                                </div>
                              </div>
                            </div>
                          )}
                          {msg.type === 'prescription' && (
                            <div>
                              <div className="text-xs text-mecura-neon font-bold mb-2">RECEITA MÉDICA</div>
                              <p className="text-white text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          )}
                          {msg.type === 'prescription_notes' && (
                            <div>
                              <div className="text-xs text-mecura-neon font-bold mb-2">ORIENTAÇÕES ADICIONAIS</div>
                              <p className="text-white text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    
                    {selectedHistoryItem.messages.filter((m: any) => m.type === 'prescription' || m.type === 'product' || m.type === 'prescription_notes').length === 0 && (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-[#262636]">
                        <p className="text-[#8A8A9E] text-sm">Nenhuma receita ou orientação registrada nesta consulta.</p>
                      </div>
                    )}
                  </div>

                  {/* Clinical Summary */}
                  <div className="p-6 rounded-2xl bg-[#0A0A0F] border border-[#262636]">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-mecura-neon" /> Resumo Clínico
                    </h4>
                    <p className="text-[#8A8A9E] text-sm leading-relaxed">
                      {selectedHistoryItem.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'abandonment' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Monitoramento de Abandono</h2>
            </div>

            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#1A1A26] border-b border-[#262636]">
                  <tr>
                    <th className="p-4 font-medium text-[#8A8A9E]">Paciente</th>
                    <th className="p-4 font-medium text-[#8A8A9E]">Contato</th>
                    <th className="p-4 font-medium text-[#8A8A9E]">Etapa de Abandono</th>
                    <th className="p-4 font-medium text-[#8A8A9E]">Data/Hora</th>
                    <th className="p-4 font-medium text-[#8A8A9E] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262636]">
                  {abandonedLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-[#1A1A26]/50">
                      <td className="p-4 font-medium">{lead.name}</td>
                      <td className="p-4">
                        <div className="text-sm">{lead.email}</div>
                        <div className="text-xs text-[#8A8A9E]">{lead.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-xs font-bold">
                          {lead.step}
                        </span>
                      </td>
                      <td className="p-4 text-[#8A8A9E] text-sm">
                        {format(new Date(lead.date), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => alert(`Iniciando contato via WhatsApp com ${lead.name}`)}>
                          Contatar
                        </Button>
                        <Button size="sm" onClick={() => {
                          setNotificationForm({ title: 'Temos uma oferta para você!', message: `Olá ${lead.name}, notamos que você não finalizou sua consulta. Use o cupom VOLTA20 para 20% de desconto!` });
                          setShowSendNotification(true);
                        }}>
                          Enviar Oferta
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Médicos Cadastrados</h2>
              <Button onClick={() => setShowAddDoctor(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Médico
              </Button>
            </div>

            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#1A1A26] border-b border-[#262636]">
                  <tr>
                    <th className="p-4 font-medium text-[#8A8A9E]">Nome</th>
                    <th className="p-4 font-medium text-[#8A8A9E]">CRM</th>
                    <th className="p-4 font-medium text-[#8A8A9E]">Email</th>
                    <th className="p-4 font-medium text-[#8A8A9E] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262636]">
                  {doctors.map(doctor => (
                    <tr key={doctor.id} className="hover:bg-[#1A1A26]/50">
                      <td className="p-4 font-medium">{doctor.name}</td>
                      <td className="p-4 text-[#8A8A9E]">{doctor.crm}</td>
                      <td className="p-4 text-[#8A8A9E]">{doctor.email}</td>
                      <td className="p-4 flex justify-end gap-2">
                        <button 
                          onClick={() => setShowAgenda(doctor.id)}
                          className="p-2 text-[#8A8A9E] hover:text-mecura-neon bg-[#0A0A0F] rounded-lg border border-[#262636] hover:border-mecura-neon/50 transition-colors"
                          title="Ver Agenda"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowEditPassword(doctor.id)}
                          className="p-2 text-[#8A8A9E] hover:text-mecura-neon bg-[#0A0A0F] rounded-lg border border-[#262636] hover:border-mecura-neon/50 transition-colors"
                          title="Alterar Senha"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteDoctor(doctor.id)}
                          className="p-2 text-[#8A8A9E] hover:text-red-400 bg-[#0A0A0F] rounded-lg border border-[#262636] hover:border-red-400/50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {doctors.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#8A8A9E]">
                        Nenhum médico cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Cupons de Desconto</h2>
              <Button onClick={() => setShowAddCoupon(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cupom
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(coupon => (
                <div key={coupon.id} className="bg-[#161622] border border-[#262636] rounded-2xl p-6 relative group">
                  <button 
                    onClick={() => deleteCoupon(coupon.id)}
                    className="absolute top-4 right-4 text-[#8A8A9E] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-mecura-neon font-mono text-xl font-bold mb-2">{coupon.code}</div>
                  <div className="text-3xl font-bold mb-1">{coupon.discount}%</div>
                  <div className="text-[#8A8A9E] text-sm">Desconto aplicado</div>
                </div>
              ))}
              {coupons.length === 0 && (
                <div className="col-span-full text-center p-8 text-[#8A8A9E] bg-[#161622] border border-[#262636] rounded-2xl">
                  Nenhum cupom cadastrado.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Promoções e Catálogo</h2>
            </div>
            <div className="bg-[#161622] border border-[#262636] rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Texto das Promoções</label>
                <p className="text-[#8A8A9E] mb-4 text-sm">
                  O texto abaixo será exibido para os pacientes na tela de pagamento (Farmácia).
                  As regras de desconto (Linha Vibe, Chill Vibe, Drops e Ignite) são aplicadas automaticamente no carrinho.
                </p>
                <textarea
                  value={promotionsText}
                  onChange={(e) => setPromotionsText(e.target.value)}
                  className="w-full h-64 bg-[#0A0A0F] border border-[#262636] rounded-xl p-4 text-white resize-none focus:outline-none focus:border-mecura-neon"
                  placeholder="Cole aqui o texto das promoções..."
                />
              </div>

              <div className="pt-6 border-t border-[#262636]">
                <label className="block text-sm font-bold text-white mb-2">Link do Catálogo (PDF)</label>
                <p className="text-[#8A8A9E] mb-4 text-sm">
                  Cole aqui o link do catálogo em PDF (ex: link do Google Drive). O paciente verá um botão para acessá-lo.
                </p>
                <input
                  type="url"
                  value={catalogUrl}
                  onChange={(e) => setCatalogUrl(e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl p-4 text-white focus:outline-none focus:border-mecura-neon"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Notificações Push</h2>
              <Button onClick={() => setShowSendNotification(true)}>
                <Send className="w-4 h-4 mr-2" />
                Nova Notificação
              </Button>
            </div>

            <div className="space-y-4">
              {notifications.map(notification => (
                <div key={notification.id} className="bg-[#161622] border border-[#262636] rounded-2xl p-6 relative group">
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="absolute top-4 right-4 text-[#8A8A9E] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-[#8A8A9E] mb-2">
                    {new Date(notification.date).toLocaleString('pt-BR')}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{notification.title}</h3>
                  <p className="text-[#A0A0B0]">{notification.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center p-8 text-[#8A8A9E] bg-[#161622] border border-[#262636] rounded-2xl">
                  Nenhuma notificação enviada.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Cadastrar Médico</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8A8A9E] mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={doctorForm.name}
                  onChange={e => setDoctorForm({...doctorForm, name: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8A8A9E] mb-1">CRM</label>
                <input 
                  type="text" 
                  value={doctorForm.crm}
                  onChange={e => setDoctorForm({...doctorForm, crm: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8A8A9E] mb-1">Email</label>
                <input 
                  type="email" 
                  value={doctorForm.email}
                  onChange={e => setDoctorForm({...doctorForm, email: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8A8A9E] mb-1">Senha de Acesso</label>
                <input 
                  type="password" 
                  value={doctorForm.password}
                  onChange={e => setDoctorForm({...doctorForm, password: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddDoctor(false)}>Cancelar</Button>
                <Button className="flex-1" onClick={handleAddDoctor} disabled={!doctorForm.name || !doctorForm.crm || !doctorForm.password}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Alterar Senha</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8A8A9E] mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditPassword(null)}>Cancelar</Button>
                <Button className="flex-1" onClick={handleUpdatePassword} disabled={!newPassword}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                Agenda - {doctors.find(d => d.id === showAgenda)?.name}
              </h3>
              <button onClick={() => setShowAgenda(null)} className="text-[#8A8A9E] hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {allAppointments.length > 0 ? (
                allAppointments.map((app) => (
                  <div key={app.id} className="bg-[#0A0A0F] border border-[#262636] rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">{app.patientName}</div>
                      <div className="text-[#8A8A9E] text-sm flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" /> {new Date(app.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                        <Clock className="w-4 h-4 ml-2" /> {app.time}
                      </div>
                      <div className="text-mecura-neon text-sm mt-1">{app.type}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'confirmed' ? 'bg-mecura-neon/20 text-mecura-neon' :
                        app.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {app.status === 'confirmed' ? 'Confirmada' :
                         app.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[#8A8A9E] py-8">
                  Nenhuma consulta agendada.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Novo Cupom</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8A8A9E] mb-1">Código do Cupom</label>
                <input 
                  type="text" 
                  value={couponForm.code}
                  onChange={e => setCouponForm({...couponForm, code: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white uppercase"
                  placeholder="EX: BEMVINDO20"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8A8A9E] mb-1">Desconto (%)</label>
                <input 
                  type="number" 
                  value={couponForm.discount}
                  onChange={e => setCouponForm({...couponForm, discount: Number(e.target.value)})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white"
                  min="1"
                  max="100"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddCoupon(false)}>Cancelar</Button>
                <Button className="flex-1" onClick={handleAddCoupon} disabled={!couponForm.code || couponForm.discount <= 0}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSendNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Disparar Notificação</h3>
            <p className="text-sm text-[#8A8A9E] mb-4">Esta notificação será enviada para todos os usuários do app.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8A8A9E] mb-1">Título</label>
                <input 
                  type="text" 
                  value={notificationForm.title}
                  onChange={e => setNotificationForm({...notificationForm, title: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white"
                  placeholder="Ex: Nova Promoção!"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8A8A9E] mb-1">Mensagem</label>
                <textarea 
                  value={notificationForm.message}
                  onChange={e => setNotificationForm({...notificationForm, message: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 text-white h-24 resize-none"
                  placeholder="Digite a mensagem da notificação..."
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowSendNotification(false)}>Cancelar</Button>
                <Button className="flex-1" onClick={handleSendNotification} disabled={!notificationForm.title || !notificationForm.message}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
