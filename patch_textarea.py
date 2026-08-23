with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

textarea_code = """
          {/* Section: Anotações da Triagem (Laudo Evolutivo) */}
          <section>
            <h3 className="text-[13px] font-bold text-mecura-silver uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Triagem / Laudo Evolutivo
            </h3>
            <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-4">
              <textarea
                value={evolutionNotes}
                onChange={(e) => setEvolutionNotes(e.target.value)}
                placeholder="Insira as informações chaves aqui. (ex: Histórico laboral, uso prévio de óleos/flor in natura, cultivo artesanal, etc.)"
                className="w-full bg-transparent border-none text-white text-sm resize-none focus:ring-0 p-0 placeholder-mecura-silver/50 min-h-[80px]"
              />
            </div>
          </section>

          {/* Section: Objectives */}"""

code = code.replace("{/* Section: Objectives */}", textarea_code)

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)
