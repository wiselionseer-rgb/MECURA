import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Add patientSearch state
if "const [patientSearch, setPatientSearch] = useState('');" not in code:
    code = code.replace("const [agendaTimeFilter, setAgendaTimeFilter] = useState('all');", "const [agendaTimeFilter, setAgendaTimeFilter] = useState('all');\n  const [patientSearch, setPatientSearch] = useState('');")

code = code.replace(
    "onChange={(e) => setAgendaTimeFilter(e.target.value)}", 
    "onChange={(e) => setPatientSearch(e.target.value)}"
).replace(
    "onChange={(e) => setPatientSearch(e.target.value)}", 
    "onChange={(e) => setAgendaTimeFilter(e.target.value)}", 
    1  # wait, I just want to change it in the Patient's search input. Let's be precise.
)

# precise replace
code = code.replace("""<input 
                  type="text" 
                  placeholder="Buscar paciente..." 
                  onChange={(e) => setAgendaTimeFilter(e.target.value)}""", """<input 
                  type="text" 
                  placeholder="Buscar paciente..." 
                  onChange={(e) => setPatientSearch(e.target.value)}""")

code = code.replace("""                {patients.length > 0 ? patients.filter(p => {
                    const search = agendaTimeFilter.toLowerCase();
                    if (!search || search === 'all' || search === 'today' || search === 'week' || search === 'month') return true; """, """                {patients.length > 0 ? patients.filter(p => {
                    const search = patientSearch.toLowerCase();
                    if (!search) return true; """)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
