import re

with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

old_block = """            <button
              onClick={() => handleGenerateMedicalReport('inicial')}
              className="w-full p-4 bg-mecura-surface border border-mecura-elevated rounded-2xl flex items-center gap-4 text-left hover:border-amber-500/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Gerar Laudo Médico (PDF)</h4>
                <p className="text-xs text-mecura-silver">Laudo completo com diagnóstico, fisiopatologia e tratamentos</p>
              </div>
            </button>"""

new_block = """            <button
              onClick={() => handleGenerateMedicalReport('inicial')}
              className="w-full p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-4 text-left hover:border-amber-500/50 hover:bg-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-amber-400 font-bold text-base">Gerar Laudo Inicial (PDF)</h4>
                <p className="text-xs text-amber-400/80">Laudo completo com diagnóstico, fisiopatologia e tratamentos para abertura do HC.</p>
              </div>
            </button>

            <button
              onClick={() => handleGenerateMedicalReport('evolutivo')}
              className="w-full p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center gap-4 text-left hover:border-blue-500/50 hover:bg-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-blue-400 font-bold text-base">Gerar Laudo Evolutivo (PDF)</h4>
                <p className="text-xs text-blue-400/80">Atualização clínica, acompanhamento e registro de evolução do paciente.</p>
              </div>
            </button>"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
        f.write(code)
    print("Replaced successfully.")
else:
    print("Could not find block.")
