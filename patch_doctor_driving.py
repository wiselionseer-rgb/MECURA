import re
with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

old_health_section = """          {/* Section: Health & Social */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4">
              Saúde & Social
            </h3>"""

new_health_section = """          {/* Section: Driving & Risks */}
          <section className="mb-8">
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4 text-purple-400">
              Condução de Veículos e Riscos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                <span className="text-xs text-purple-300 block mb-2">Dirige Veículos</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.dirige || answers?.dirige) ? 'text-purple-400' : 'text-white'}`}>{(currentPatient?.answers?.dirige || answers?.dirige) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                <span className="text-xs text-purple-300 block mb-2">Opera Maquinário</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.maquinario || answers?.maquinario) ? 'text-purple-400' : 'text-white'}`}>{(currentPatient?.answers?.maquinario || answers?.maquinario) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
                <span className="text-xs text-purple-300 block mb-2">Blitz Frequente</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.blitz || answers?.blitz) ? 'text-purple-400' : 'text-white'}`}>{(currentPatient?.answers?.blitz || answers?.blitz) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/40 rounded-2xl p-5">
                <span className="text-xs text-purple-200 block mb-2 font-bold">Laudo Psicomotor</span>
                <span className={`text-base font-bold ${(currentPatient?.answers?.laudo_psicomotor || answers?.laudo_psicomotor) ? 'text-purple-400' : 'text-white'}`}>{(currentPatient?.answers?.laudo_psicomotor || answers?.laudo_psicomotor) ? 'Deseja Solicitar' : 'Não Solicitado'}</span>
              </div>
            </div>
          </section>

          {/* Section: Health & Social */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4">
              Saúde & Social
            </h3>"""

code = code.replace(old_health_section, new_health_section)

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)
print("Patched driving dashboard view")
