const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetUI = `                        <h4 className="text-sm font-bold text-white mb-3">Triage</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-mecura-silver block mb-1">Medicamentos:</span>
                            <span className="text-white font-medium">{patientAnswers?.remedios ? 'Sim' : 'Não'}</span>
                          </div>
                          <div>
                            <span className="text-mecura-silver block mb-1">Comorbidades:</span>
                            <span className="text-white font-medium">{patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}</span>
                          </div>
                          <div>
                            <span className="text-mecura-silver block mb-1">Cirurgias:</span>
                            <span className="text-white font-medium">{patientAnswers?.cirurgia ? 'Sim' : 'Não'}</span>
                          </div>
                          <div>
                            <span className="text-mecura-silver block mb-1">Alergias:</span>
                            <span className="text-white font-medium">{patientAnswers?.alergia ? 'Sim' : 'Não'}</span>
                          </div>
                        </div>`;

const newUI = `                        <h4 className="text-sm font-bold text-white mb-3">Triage</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="col-span-2">
                            <span className="text-mecura-silver block mb-1">Medicamentos / Tratamento:</span>
                            <span className="text-white font-medium">
                              {patientAnswers?.remedios ? 'Sim' + (patientAnswers?.remedios_details ? ' (' + patientAnswers.remedios_details + ')' : '') : 'Não'}
                              {patientAnswers?.tratamento_atual_details ? ' | ' + patientAnswers.tratamento_atual_details : ''}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-mecura-silver block mb-1">Comorbidades:</span>
                            <span className="text-white font-medium">{patientAnswers?.doenca_cronica ? 'Sim' + (patientAnswers?.doenca_cronica_details ? ' (' + patientAnswers.doenca_cronica_details + ')' : '') : 'Não'}</span>
                          </div>
                          <div>
                            <span className="text-mecura-silver block mb-1">Cirurgias:</span>
                            <span className="text-white font-medium">{patientAnswers?.cirurgia ? 'Sim' + (patientAnswers?.cirurgia_details ? ' (' + patientAnswers.cirurgia_details + ')' : '') : 'Não'}</span>
                          </div>
                          <div>
                            <span className="text-mecura-silver block mb-1">Alergias:</span>
                            <span className="text-white font-medium">{patientAnswers?.alergia ? 'Sim' + (patientAnswers?.alergia_details ? ' (' + patientAnswers.alergia_details + ')' : '') : 'Não'}</span>
                          </div>
                        </div>`;

if(code.includes(targetUI)) {
  code = code.replace(targetUI, newUI);
  fs.writeFileSync(path, code);
  console.log("Success updating UI for triage");
} else {
  console.log("targetUI not found");
}
