import re

with open("src/screens/DoctorDashboardScreen.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Remove the red block
red_block = """
                    <div className="text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                      <p className="font-bold mb-1">⚠️ BLOCO IMPORTANTE</p>
                      <p>Uso sob orientação de profissional de saúde<br/>Pode causar sonolência<br/>Evitar dirigir ou operar máquinas<br/>Manter fora do alcance de crianças</p>
                    </div>"""
code = code.replace(red_block, "")

with open("src/screens/DoctorDashboardScreen.tsx", "w", encoding="utf-8") as f:
    f.write(code)
