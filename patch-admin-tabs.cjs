const fs = require('fs');

let code = fs.readFileSync('/tmp/AdminBackup.tsx', 'utf-8');

// Add new icons to import
if (!code.includes('UserCircle')) {
    code = code.replace("import { Users,", "import { Users, UserCircle, MessageCircle,");
}

// Add state for patients and stats
const stateAdditions = `
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
`;

code = code.replace("const [supportRequests, setSupportRequests] = useState<any[]>([]);", "const [supportRequests, setSupportRequests] = useState<any[]>([]);\n" + stateAdditions);

// Update Tabs
const newTabs = `[
          { id: 'overview', label: 'Visão Geral', icon: BarChart },
          { id: 'patients', label: 'Pacientes', icon: UserCircle },
          { id: 'doctors', label: 'Médicos', icon: Users },
          { id: 'chat_patient', label: 'Chat Paciente', icon: MessageCircle },
          { id: 'chat_doctor', label: 'Chat Médico', icon: MessageSquare },
          { id: 'catalog', label: 'Assistente IA', icon: Pill },
          { id: 'coupons', label: 'Cupons', icon: Ticket },
          { id: 'notifications', label: 'Notificações', icon: Bell }
        ]`;

code = code.replace(/\[\s*{\s*id:\s*'overview'[\s\S]*?(?=\.map)/, newTabs);

// Update Overview Tab JSX
const overviewJsx = `{activeTab === 'overview' && (
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
          </div>
        )}`;

code = code.replace(/\{activeTab === 'overview' && \([\s\S]*?(?=\{activeTab === 'doctors')/, overviewJsx + "\n        ");

// Add Patients Tab
const patientsJsx = `{activeTab === 'patients' && (
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
                       <span className={\`px-2 py-1 rounded-full text-xs \${p.tier === 'Premium' ? 'bg-purple-500/20 text-purple-400' : 'bg-mecura-neon/20 text-mecura-neon'}\`}>
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
        )}`;

// Update support -> chat_patient and add chat_doctor
code = code.replace(/\{activeTab === 'support' && \(/g, "{activeTab === 'chat_patient' && (");

const chatDoctorJsx = `{activeTab === 'chat_doctor' && (
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
        )}`;

// Insert Patients right before Doctors
code = code.replace("{activeTab === 'doctors' && (", patientsJsx + "\n        {activeTab === 'doctors' && (");

// Insert Chat Doctor before Chat Patient
code = code.replace("{activeTab === 'chat_patient' && (", chatDoctorJsx + "\n        {activeTab === 'chat_patient' && (");

fs.writeFileSync('/tmp/AdminDashboardScreen_new.tsx', code);
