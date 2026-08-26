import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# 1. Update forceSendToQueue to remove confirm and alert (which get blocked)
old_force = """  const forceSendToQueue = async (patient: any) => {
    if (!confirm(`Deseja enviar ${patient.name} para a fila?`)) return;
    try {
      await addDoc(collection(db, 'queue'), {
        patientId: patient.id,
        patientName: patient.name || 'Sem nome',
        tier: patient.tier || 'basic',
        status: 'waiting',
        joinedAt: new Date().toISOString(),
      });
      alert(`Paciente ${patient.name || 'Sem nome'} enviado para a fila!`);
    } catch (e) {
      console.error(e);
      alert('Erro ao enviar para a fila.');
    }
  };"""

new_force = """  const forceSendToQueue = async (patient: any) => {
    try {
      await addDoc(collection(db, 'queue'), {
        patientId: patient.id,
        patientName: patient.name || 'Sem nome',
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
  };"""

if old_force in code:
    code = code.replace(old_force, new_force)


# 2. Update isOnline check to be more robust
old_online = "const isOnline = p.lastActive && (Date.now() - p.lastActive.toMillis()) < 5 * 60000;"
new_online = "const lastActiveMs = p.lastActive?.toMillis ? p.lastActive.toMillis() : (p.lastActive?.seconds ? p.lastActive.seconds * 1000 : (p.lastActive ? new Date(p.lastActive).getTime() : 0));\n                  const isOnline = lastActiveMs > 0 && (Date.now() - lastActiveMs) < 5 * 60000;"
if old_online in code:
    code = code.replace(old_online, new_online)


# 3. Add an "Agendar" form to the Agenda modal
old_modal_header = """            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Agenda</h3>
              <button onClick={() => setShowAgenda(null)}><XCircle className="w-6 h-6" /></button>
            </div>"""

new_modal_header = """            <div className="flex justify-between items-center mb-6">
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
                      patientId: showAgenda,
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
            </div>"""

if old_modal_header in code:
    code = code.replace(old_modal_header, new_modal_header)


# 4. Add filter for Patients list
# Find patients rendering
old_patients_start = """        {activeTab === 'patients' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Pacientes Cadastrados</h2>
            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">"""

new_patients_start = """        {activeTab === 'patients' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold">Pacientes Cadastrados</h2>
               <input 
                  type="text" 
                  placeholder="Buscar paciente..." 
                  onChange={(e) => setAgendaTimeFilter(e.target.value)}
                  className="bg-[#161622] border border-[#262636] rounded-lg px-4 py-2 outline-none focus:border-mecura-neon w-64"
               />
            </div>
            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">"""

if old_patients_start in code:
    code = code.replace(old_patients_start, new_patients_start)


# Update the map function to apply the filter
old_patients_map = """              <div className="divide-y divide-[#262636]">
                {patients.length > 0 ? patients.map(p => {"""

new_patients_map = """              <div className="divide-y divide-[#262636]">
                {patients.length > 0 ? patients.filter(p => {
                    const search = agendaTimeFilter.toLowerCase();
                    if (!search || search === 'all' || search === 'today' || search === 'week' || search === 'month') return true; 
                    return p.name?.toLowerCase().includes(search) || p.email?.toLowerCase().includes(search);
                }).map(p => {"""

if old_patients_map in code:
    code = code.replace(old_patients_map, new_patients_map)


with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
