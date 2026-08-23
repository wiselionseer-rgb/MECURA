import re

with open("src/screens/OnboardingScreen.tsx", "r") as f:
    code = f.read()

old_block = """              <div className="space-y-4">
                <label className="text-mecura-pearl font-bold">3. Se houver, descreva mais informações:</label>
                <p className="text-xs text-mecura-silver">Histórico familiar, frequência que sente, tratamentos atuais, etc.</p>
                <textarea 
                  value={answers.description || ''}
                  onChange={(e) => setAnswer('description', e.target.value)}
                  placeholder="Use esse campo para descrever (Opcional)"
                  className="w-full h-32 rounded-xl border border-mecura-elevated bg-mecura-surface-light p-4 text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:border-mecura-neon resize-none"
                />
              </div>"""

new_block = """              <div className="space-y-4">
                <label className="text-mecura-pearl font-bold">3. Como tudo começou? (Resumo da sua condição)</label>
                <p className="text-xs text-mecura-silver">Conte brevemente sobre a origem da sua doença ou problema. Ex: "Tive um acidente que causou a dor nas costas", "Fui diagnosticado há 5 anos", "Começou do nada e foi piorando". Isso é fundamental para o seu laudo.</p>
                <textarea 
                  value={answers.diseaseOrigin || ''}
                  onChange={(e) => setAnswer('diseaseOrigin', e.target.value)}
                  placeholder="Escreva aqui a história do seu problema..."
                  className="w-full h-24 rounded-xl border border-mecura-elevated bg-mecura-surface-light p-4 text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:border-mecura-neon resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-mecura-pearl font-bold">4. Outros detalhes (Opcional):</label>
                <p className="text-xs text-mecura-silver">Histórico familiar, frequência dos sintomas, etc.</p>
                <textarea 
                  value={answers.description || ''}
                  onChange={(e) => setAnswer('description', e.target.value)}
                  placeholder="Use esse campo para descrever mais detalhes se necessário"
                  className="w-full h-20 rounded-xl border border-mecura-elevated bg-mecura-surface-light p-4 text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:border-mecura-neon resize-none"
                />
              </div>"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open("src/screens/OnboardingScreen.tsx", "w") as f:
        f.write(code)
    print("Onboarding updated successfully.")
else:
    print("Error: Old block not found in OnboardingScreen.tsx.")
