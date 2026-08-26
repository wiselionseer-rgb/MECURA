with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

old_state = "  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications'>('overview');"

new_state = """  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications' | 'agenda'>('overview');
  const [agendaTimeFilter, setAgendaTimeFilter] = useState('all');
  const [agendaStatusFilter, setAgendaStatusFilter] = useState('all');"""

code = code.replace(old_state, new_state)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
