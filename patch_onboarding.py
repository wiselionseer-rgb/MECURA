import re
with open("src/screens/OnboardingScreen.tsx", "r") as f:
    code = f.read()

driving_questions = """const DRIVING_QUESTIONS = [
  { id: 'dirige', label: 'Você dirige veículos automotores regularmente? (Carro, moto, etc)', hasDetails: true },
  { id: 'maquinario', label: 'Opera maquinário pesado ou realiza atividades de risco?', hasDetails: true },
  { id: 'blitz', label: 'Passa frequentemente por fiscalizações (ex: lei do drogômetro)?' },
  { id: 'laudo_psicomotor', label: 'Deseja solicitar o Laudo Psicomotor (disponível apenas na Consulta Premium)?' }
];

const HEALTH_QUESTIONS = ["""

code = code.replace("const HEALTH_QUESTIONS = [", driving_questions)

old_steps = """  { id: 'physical', title: 'Informações sobre suas características físicas:', subtitle: 'Dados importantes para dosagem.' },
  { id: 'social', title: 'Sobre a sua vida social:', subtitle: 'Responda com muita atenção.', warning: true },"""

new_steps = """  { id: 'physical', title: 'Informações sobre suas características físicas:', subtitle: 'Dados importantes para dosagem.' },
  { id: 'driving', title: 'Condução de Veículos e Riscos', subtitle: 'Importante para a nova Lei do Drogômetro e emissão do Laudo Psicomotor.' },
  { id: 'social', title: 'Sobre a sua vida social:', subtitle: 'Responda com muita atenção.', warning: true },"""

code = code.replace(old_steps, new_steps)

old_render = """          {/* Step: Emotional */}
          {step.id === 'emotional' && renderBooleanList(EMOTIONAL_QUESTIONS)}"""

new_render = """          {/* Step: Driving */}
          {step.id === 'driving' && renderBooleanList(DRIVING_QUESTIONS)}

          {/* Step: Emotional */}
          {step.id === 'emotional' && renderBooleanList(EMOTIONAL_QUESTIONS)}"""

code = code.replace(old_render, new_render)

with open("src/screens/OnboardingScreen.tsx", "w") as f:
    f.write(code)

print("OnboardingScreen patched.")
