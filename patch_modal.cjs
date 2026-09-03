const fs = require('fs');
let code = fs.readFileSync('src/components/PsychomotorReportEditorModal.tsx', 'utf-8');

code = code.replace(/MedicalReportEditorModalProps/g, 'PsychomotorReportEditorModalProps');
code = code.replace(/MedicalReportEditorModal/g, 'PsychomotorReportEditorModal');

// Remove diagnosis, rationale, treatmentPlan, monitoring from props
code = code.replace(/  diagnosis: string;\n  setDiagnosis: \(val: string\) => void;\n  rationale: string;\n  setRationale: \(val: string\) => void;\n  treatmentPlan: string;\n  setTreatmentPlan: \(val: string\) => void;\n  monitoring: string;\n  setMonitoring: \(val: string\) => void;\n/g, '');
code = code.replace(/  diagnosis,\n  setDiagnosis,\n  rationale,\n  setRationale,\n  treatmentPlan,\n  setTreatmentPlan,\n  monitoring,\n  setMonitoring,\n/g, '');

// Add psychomotorText to props
code = code.replace(/  doctorSpecialty: string;\n  setDoctorSpecialty: \(val: string\) => void;\n/g, '  doctorSpecialty: string;\n  setDoctorSpecialty: (val: string) => void;\n  psychomotorText: string;\n  setPsychomotorText: (val: string) => void;\n');
code = code.replace(/  doctorSpecialty,\n  setDoctorSpecialty,\n/g, '  doctorSpecialty,\n  setDoctorSpecialty,\n  psychomotorText,\n  setPsychomotorText,\n');

// Change modal title and description
code = code.replace(/Laudo Médico Pericial & Clínico/g, 'Laudo Psicomotor (Lei do Drogômetro)');
code = code.replace(/Documento detalhado com diagnóstico, fisiopatologia do SEC e fundamentação terapêutica/g, 'Documento de aptidão e avaliação de capacidade psicomotora');
code = code.replace(/<FileCheck className="w-5 h-5" \/>/g, '<ShieldCheck className="w-5 h-5" />');
code = code.replace(/text-amber-300/g, 'text-purple-300');
code = code.replace(/text-amber-400/g, 'text-purple-400');
code = code.replace(/bg-amber-500\/15/g, 'bg-purple-500/15');
code = code.replace(/border-amber-500\/30/g, 'border-purple-500/30');
code = code.replace(/bg-amber-500\/20/g, 'bg-purple-500/20');
code = code.replace(/bg-amber-500/g, 'bg-purple-500');
code = code.replace(/text-amber-500/g, 'text-purple-500');
code = code.replace(/hover:bg-amber-400/g, 'hover:bg-purple-400');
code = code.replace(/border-amber-500\/20/g, 'border-purple-500/20');

// Replace the sections (2, 3, 4, 5) with a single text area for psychomotorText
code = code.replace(/\{\/\* SECTION 2.*Gerar e Baixar Laudo Clínico/s, 
`{/* SECTION 2 - TEXTO DO LAUDO */}
                  <div className="bg-[#0A0A0F]/50 rounded-xl border border-mecura-elevated p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-mecura-elevated/50 pb-3">
                      <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" /> 2. CORPO DO LAUDO PSICOMOTOR
                      </h4>
                    </div>
                    <textarea
                      value={psychomotorText}
                      onChange={(e) => setPsychomotorText(e.target.value)}
                      className="w-full bg-[#0D0D12] text-sm text-gray-300 border border-mecura-elevated rounded-xl px-4 py-3 min-h-[400px] resize-y focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white text-black p-8 overflow-y-auto">
                <div className="max-w-[794px] mx-auto min-h-[1123px] bg-white relative">
                  <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-4 mb-6 pt-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                      <p className="text-[11px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                        CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                      </p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-bold text-[#1E1B4B] m-0">{doctorName}</h3>
                      <p className="text-xs text-[#475569] font-semibold m-0">{doctorCrm}</p>
                      <p className="text-[10px] text-[#64748B] m-0">{doctorSpecialty}</p>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h1 className="text-xl font-black text-[#1E1B4B] tracking-widest uppercase mb-2">LAUDO PSICOMOTOR</h1>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#059669] mb-4">AVALIAÇÃO DA LEI DO DROGÔMETRO / APTIDÃO</p>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 text-sm text-[#475569]">
                        <span className="font-bold text-[#1E1B4B]">PACIENTE:</span>
                        <span className="font-semibold">{patientName}</span>
                      </div>
                      <div className="flex items-center justify-center gap-6 text-xs text-[#64748B]">
                        {birthDate !== 'Não informada' && (
                          <span className="flex items-center gap-1">
                            <span className="font-bold text-[#475569]">NASCIMENTO:</span> {birthDate}
                          </span>
                        )}
                        {cpf !== 'Não informado' && (
                          <span className="flex items-center gap-1">
                            <span className="font-bold text-[#475569]">CPF:</span> {cpf}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 text-sm text-[#334155] leading-relaxed text-justify">
                    <div className="flex flex-col gap-2">
                      {psychomotorText.split('\\n').map((p, i) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }} dangerouslySetInnerHTML={{ __html: p }}></p> : <div key={i} className="h-2" />)}
                    </div>
                  </div>
                  
                  <div className="mt-20 pt-8 border-t border-[#E2E8F0]">
                    <div className="flex flex-col items-center">
                      <div className="w-52 h-0 border-b border-[#CBD5E1] mb-2"></div>
                      <p className="text-sm font-bold text-[#1E1B4B]">{doctorName}</p>
                      <p className="text-xs text-[#64748B] mb-4">{doctorCrm}</p>
                      <div className="flex justify-between w-full text-[10px] text-[#94A3B8] font-semibold">
                        <span>{emissionDate}</span>
                        <span>Válido em todo o território nacional</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-mecura-elevated bg-[#0A0A0F]/90 flex flex-wrap-reverse justify-between gap-4 items-center rounded-b-2xl md:rounded-b-3xl">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-transparent border border-mecura-elevated text-gray-300 rounded-xl text-sm font-semibold hover:bg-mecura-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Gerar e Baixar Laudo Psicomotor (PDF)`);

fs.writeFileSync('src/components/PsychomotorReportEditorModal.tsx', code);
