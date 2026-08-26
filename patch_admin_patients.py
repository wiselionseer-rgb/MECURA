import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Make sure serverTimestamp is imported if needed, but we don't need it. We need addDoc.
# Check if addDoc is imported
if "addDoc" not in code:
    code = code.replace("deleteDoc } from 'firebase/firestore';", "deleteDoc, addDoc } from 'firebase/firestore';")

# Add forceSendToQueue function inside the component
if "const forceSendToQueue" not in code:
    func_insert_pos = code.find("const [agendaTimeFilter")
    func_code = """
  const forceSendToQueue = async (patient: any) => {
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
  };
"""
    code = code[:func_insert_pos] + func_code + code[func_insert_pos:]


# Replace the patients grid headers and content
old_grid = """            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">
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
                )) : ("""

new_grid = """            <div className="bg-[#161622] border border-[#262636] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 p-4 border-b border-[#262636] text-[#8A8A9E] font-bold text-sm">
                <div>Nome</div>
                <div>Email</div>
                <div>Plano</div>
                <div>Status / Online</div>
                <div>Ações</div>
              </div>
              <div className="divide-y divide-[#262636]">
                {patients.length > 0 ? patients.map(p => {
                  const isOnline = p.lastActive && (Date.now() - p.lastActive.toMillis()) < 5 * 60000;
                  return (
                  <div key={p.id} className="grid grid-cols-5 p-4 items-center gap-2">
                    <div className="font-bold text-white text-sm break-words">{p.name || 'Sem nome'}</div>
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
                    <div>
                       <Button variant="outline" className="text-xs h-8 px-2" onClick={() => forceSendToQueue(p)}>Mover p/ Fila</Button>
                    </div>
                  </div>
                )}) : ("""

code = code.replace(old_grid, new_grid)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
