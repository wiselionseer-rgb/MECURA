import re
with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

bad1 = """<div className="text-[#8A8A9E] mb-2">R$ 50 (Fila)</div>
                <div className="text-3xl font-bold text-mecura-neon">{queueCount}</div>"""
good1 = """<div className="text-[#8A8A9E] mb-2">Consultas Básicas (Pagas)</div>
                <div className="text-3xl font-bold text-mecura-neon">{payments.filter(p => p.type === 'Consulta Básica').length}</div>"""

bad2 = """<div className="text-[#8A8A9E] mb-2">R$ 250 (Premium)</div>
                <div className="text-3xl font-bold text-purple-400">{allAppointments.length}</div>"""
good2 = """<div className="text-[#8A8A9E] mb-2">Consultas Premium (Pagas)</div>
                <div className="text-3xl font-bold text-purple-400">{payments.filter(p => p.type === 'Consulta Premium').length}</div>"""

code = code.replace(bad1, good1).replace(bad2, good2)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)

print("Patched admin counts")
