with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Make sure we useStore imports cancelAppointment and rescheduleAppointment
code = code.replace("const { allAppointments, confirmAppointment, cancelAppointment } = useStore();", "const { allAppointments, confirmAppointment, cancelAppointment, rescheduleAppointment } = useStore();")
if "rescheduleAppointment" not in code:
    code = code.replace("const { allAppointments } = useStore();", "const { allAppointments, confirmAppointment, cancelAppointment, rescheduleAppointment } = useStore();")

state_injection = """  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications' | 'agenda'>('overview');
  const [agendaTimeFilter, setAgendaTimeFilter] = useState('all');
  const [agendaStatusFilter, setAgendaStatusFilter] = useState('all');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<string | null>(null);
"""
old_state = """  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'doctors' | 'chat_patient' | 'chat_doctor' | 'catalog' | 'agronomic' | 'coupons' | 'notifications' | 'agenda'>('overview');
  const [agendaTimeFilter, setAgendaTimeFilter] = useState('all');
  const [agendaStatusFilter, setAgendaStatusFilter] = useState('all');
"""
code = code.replace(old_state, state_injection)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
