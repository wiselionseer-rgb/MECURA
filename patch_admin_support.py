import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

old_req = """                    <div>
                      <div className="font-bold text-lg">{req.userName}</div>
                      <div className="text-sm text-[#8A8A9E]">{req.email || "Sem e-mail"}</div>
                      <div className="text-xs text-[#8A8A9E] mt-2">Solicitado em: {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString('pt-BR') : 'Agora'}</div>
                    </div>"""

new_req = """                    <div className="flex-1 mr-4">
                      <div className="font-bold text-lg">{req.userName}</div>
                      <div className="text-sm text-[#8A8A9E]">{req.email || "Sem e-mail"}</div>
                      {req.message && <div className="text-sm text-white mt-2 bg-[#0A0A0F] p-3 rounded-lg border border-[#262636]">{req.message}</div>}
                      <div className="text-xs text-[#8A8A9E] mt-2">Solicitado em: {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString('pt-BR') : 'Agora'}</div>
                    </div>"""

if old_req in code:
    code = code.replace(old_req, new_req)

old_btn = """<Button onClick={() => window.open(`https://wa.me/5566996280883?text=Olá ${encodeURIComponent(req.userName)}, recebemos sua solicitação na Mecura.`, '_blank')} className="bg-[#25D366] text-white">Chamar no WhatsApp</Button>"""
new_btn = """<Button onClick={() => {
                          const phone = req.phone ? `55${req.phone.replace(/\D/g, '')}` : '5566996280883';
                          window.open(`https://wa.me/${phone}?text=Olá ${encodeURIComponent(req.userName)}, recebemos sua solicitação na Mecura.`, '_blank')
                        }} className="bg-[#25D366] text-white hover:bg-[#20b858]">Chamar no WhatsApp</Button>"""

if old_btn in code:
    code = code.replace(old_btn, new_btn)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
