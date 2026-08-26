with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

old_tabs = """        {[
          { id: 'overview', label: 'Visão Geral', icon: BarChart },
          { id: 'patients', label: 'Pacientes', icon: UserCircle },
          { id: 'doctors', label: 'Médicos', icon: Users },
          { id: 'chat_patient', label: 'Chat Paciente', icon: MessageCircle },
          { id: 'chat_doctor', label: 'Chat Médico', icon: MessageSquare },
          { id: 'catalog', label: 'Assistente IA', icon: Pill },
          { id: 'agronomic', label: 'Laudo Agronômico', icon: FileText },
          { id: 'coupons', label: 'Cupons', icon: Ticket },
          { id: 'notifications', label: 'Notificações', icon: Bell }
        ].map((tab) => {"""

new_tabs = """        {[
          { id: 'overview', label: 'Visão Geral', icon: BarChart },
          { id: 'agenda', label: 'Agenda', icon: Calendar },
          { id: 'patients', label: 'Pacientes', icon: UserCircle },
          { id: 'doctors', label: 'Médicos', icon: Users },
          { id: 'chat_patient', label: 'Chat Paciente', icon: MessageCircle },
          { id: 'chat_doctor', label: 'Chat Médico', icon: MessageSquare },
          { id: 'catalog', label: 'Assistente IA', icon: Pill },
          { id: 'agronomic', label: 'Laudo Agronômico', icon: FileText },
          { id: 'coupons', label: 'Cupons', icon: Ticket },
          { id: 'notifications', label: 'Notificações', icon: Bell }
        ].map((tab) => {"""

code = code.replace(old_tabs, new_tabs)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
