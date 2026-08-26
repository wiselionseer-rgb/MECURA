import re
with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("import { generatePrescriptionPDF, generateMedicalReportPDF, PrescriptionItemData } from '../utils/pdfGenerator';", "import { generatePrescriptionPDF, generateMedicalReportPDF, generatePsychomotorReportPDF, PrescriptionItemData } from '../utils/pdfGenerator';")

# I will add a button to generate the Laudo Psicomotor. 
# There's a button for "Gerar Laudo Evolutivo". Let's put a button right next to it.
old_buttons = """                <button 
                  onClick={() => handleGenerateMedicalReport('evolutivo')}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  title="Gerar Laudo Evolutivo (PDF)"
                >
                  <FileCheck className="w-3 h-3 md:w-4 md:h-4 text-blue-400" /> <span className="hidden md:inline">Laudo Evolutivo</span><span className="md:hidden">Evol.</span>
                </button>"""

new_buttons = """                <button 
                  onClick={() => handleGenerateMedicalReport('evolutivo')}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  title="Gerar Laudo Evolutivo (PDF)"
                >
                  <FileCheck className="w-3 h-3 md:w-4 md:h-4 text-blue-400" /> <span className="hidden md:inline">Laudo Evolutivo</span><span className="md:hidden">Evol.</span>
                </button>
                <button 
                  onClick={() => generatePsychomotorReportPDF(patientName, { customPatientName: patientName, birthDate: currentPatient.birthDate, cpf: currentPatient.cpf, answers: currentPatient.answers })}
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl text-xs md:text-sm font-semibold hover:bg-purple-500/20 hover:border-purple-500/50 transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                  title="Gerar Laudo Psicomotor (Lei do Drogômetro)"
                >
                  <FileCheck className="w-3 h-3 md:w-4 md:h-4 text-purple-400" /> <span className="hidden md:inline">Laudo Psicomotor</span><span className="md:hidden">Psico.</span>
                </button>"""

code = code.replace(old_buttons, new_buttons)

old_dash_buttons = """            <button
              onClick={() => handleGenerateMedicalReport('evolutivo')}
              className="w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4 text-left hover:border-blue-500/50 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-blue-400 font-bold text-base">Gerar Laudo Evolutivo (PDF)</h4>
                <p className="text-xs text-blue-400/80">Atualização clínica, acompanhamento e registro de evolução do paciente.</p>
              </div>
            </button>"""

new_dash_buttons = """            <button
              onClick={() => handleGenerateMedicalReport('evolutivo')}
              className="w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4 text-left hover:border-blue-500/50 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-blue-400 font-bold text-base">Gerar Laudo Evolutivo (PDF)</h4>
                <p className="text-xs text-blue-400/80">Atualização clínica, acompanhamento e registro de evolução do paciente.</p>
              </div>
            </button>
            <button
              onClick={() => generatePsychomotorReportPDF(patientName, { customPatientName: patientName, birthDate: currentPatient.birthDate, cpf: currentPatient.cpf, answers: currentPatient.answers })}
              className="w-full p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-4 text-left hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)]"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-purple-400 font-bold text-base">Gerar Laudo Psicomotor (PDF)</h4>
                <p className="text-xs text-purple-400/80">Atesta a capacidade psicomotora para dirigir (Lei do Drogômetro).</p>
              </div>
            </button>"""
            
code = code.replace(old_dash_buttons, new_dash_buttons)

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)

print("Patched DoctorDashboardScreen")
