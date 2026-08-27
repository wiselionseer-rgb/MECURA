import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Make sure we have the required icons
if "Key" not in code or "MessageCircle" not in code:
    code = code.replace("import { Users, UserCircle, Settings, Plus, FileText, Trash2, Calendar, Pill, Ticket, Bell, XCircle } from 'lucide-react';", 
                        "import { Users, UserCircle, Settings, Plus, FileText, Trash2, Calendar, Pill, Ticket, Bell, XCircle, Key, MessageCircle, AlertTriangle } from 'lucide-react';")

# Replace the Actions column buttons
old_actions = """                    <div className="flex flex-col gap-1">
                       <Button variant="outline" className="text-xs h-8 px-2 w-full" onClick={() => forceSendToQueue(p)}>Mover p/ Fila</Button>
                       <Button variant="outline" className="text-xs h-8 px-2 w-full" onClick={() => setShowAgenda(p.id)}><Calendar className="w-3 h-3 mr-1"/> Agenda</Button>
                    </div>"""

new_actions = """                    <div className="flex flex-col gap-1">
                       <div className="grid grid-cols-2 gap-1">
                         <Button variant="outline" className="text-[10px] h-7 px-1 bg-[#161622] hover:bg-mecura-neon/20 hover:text-mecura-neon" onClick={() => forceSendToQueue(p)} title="Mover para Fila">Fila</Button>
                         <Button variant="outline" className="text-[10px] h-7 px-1 bg-[#161622] hover:bg-blue-500/20 hover:text-blue-400" onClick={() => setShowAgenda(p.id)} title="Agenda"><Calendar className="w-3 h-3 mr-1"/> Agend.</Button>
                       </div>
                       <div className="grid grid-cols-3 gap-1">
                         <Button variant="outline" className="text-[10px] h-7 px-0 bg-[#161622] hover:bg-green-500/20 hover:text-green-400" onClick={() => window.open(`https://wa.me/55${(p.phone || '').replace(/\D/g, '')}`, '_blank')} title="WhatsApp"><MessageCircle className="w-3 h-3"/></Button>
                         <Button variant="outline" className="text-[10px] h-7 px-0 bg-[#161622] hover:bg-yellow-500/20 hover:text-yellow-400" onClick={() => setShowEditPatientPassword(p.id)} title="Trocar Senha"><Key className="w-3 h-3"/></Button>
                         <Button variant="outline" className="text-[10px] h-7 px-0 bg-[#161622] hover:bg-red-500/20 hover:text-red-400" onClick={() => setDeletePatientConfirm(p.id)} title="Excluir Paciente"><Trash2 className="w-3 h-3"/></Button>
                       </div>
                    </div>"""

code = code.replace(old_actions, new_actions)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
