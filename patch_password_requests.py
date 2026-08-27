import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Add to activeTab types
if "'password_requests'" not in code:
    code = code.replace("useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications' | 'agenda'>('overview');",
                        "useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications' | 'agenda' | 'password_requests'>('overview');")

# Filter supportRequests
support_filter = """
  const passwordRequests = supportRequests.filter(req => req.userId === 'recovery');
  const generalNotifications = supportRequests.filter(req => req.userId !== 'recovery');
"""
if "const passwordRequests" not in code:
    code = code.replace("const forceSendToQueue", support_filter + "\n  const forceSendToQueue")

# Modify tabs
old_tabs = """          { id: 'coupons', label: 'Cupons', icon: Ticket },
          { id: 'notifications', label: 'Notificações', icon: Bell }
        ].map((tab) => {"""
new_tabs = """          { id: 'coupons', label: 'Cupons', icon: Ticket },
          { id: 'notifications', label: 'Notificações', icon: Bell },
          { id: 'password_requests', label: 'Trocas de Senha', icon: Key }
        ].map((tab) => {"""
code = code.replace(old_tabs, new_tabs)

# Modify badges
old_badge = """              {tab.id === 'support' && supportRequests.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{supportRequests.length}</span>
              )}"""
new_badge = """              {tab.id === 'notifications' && generalNotifications.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{generalNotifications.length}</span>
              )}
              {tab.id === 'password_requests' && passwordRequests.length > 0 && (
                <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{passwordRequests.length}</span>
              )}"""
code = code.replace(old_badge, new_badge)

# Add activeTab content for password_requests
# Also modify the notifications tab to use generalNotifications
old_notif = """        {activeTab === 'notifications' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Central de Notificações</h2>
            
            {supportRequests.length === 0 ? (
              <div className="text-center p-12 bg-[#161622] rounded-2xl border border-[#262636]">
                <Bell className="w-12 h-12 text-[#8A8A9E] mx-auto mb-4 opacity-50" />
                <p className="text-[#8A8A9E]">Nenhuma notificação nova no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {supportRequests.map(req => ("""

new_notif = """        {activeTab === 'password_requests' && (
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
                      }} className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold w-full"><Key className="w-4 h-4 mr-2" /> Alterar Senha</Button>
                      
                      <Button onClick={() => {
                        const targetPatient = patients.find(p => p.email?.toLowerCase() === req.email?.toLowerCase());
                        const phone = targetPatient?.phone ? `55${targetPatient.phone.replace(/\D/g, '')}` : '5566996280883';
                        window.open(`https://wa.me/${phone}?text=Olá! Vimos que você solicitou a recuperação de senha na Mecura. Sua nova senha provisória é: `, '_blank');
                      }} className="bg-[#25D366] text-white hover:bg-[#20b858] w-full"><MessageCircle className="w-4 h-4 mr-2" /> Enviar no WhatsApp</Button>
                      
                      <Button variant="outline" onClick={async () => await updateDoc(doc(db, 'support_requests', req.id), { status: 'resolved' })} className="w-full">Marcar Resolvido</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">Central de Notificações</h2>
            
            {generalNotifications.length === 0 ? (
              <div className="text-center p-12 bg-[#161622] rounded-2xl border border-[#262636]">
                <Bell className="w-12 h-12 text-[#8A8A9E] mx-auto mb-4 opacity-50" />
                <p className="text-[#8A8A9E]">Nenhuma notificação nova no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generalNotifications.map(req => ("""

code = code.replace(old_notif, new_notif)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
