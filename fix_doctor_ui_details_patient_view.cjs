const fs = require('fs');
const path = 'src/screens/DoctorDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetUI = `              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5">
                <span className="text-sm text-mecura-silver block mb-2">Tratamento Atual</span>
                <span className={\`text-base font-bold \${(currentPatient?.answers?.tratamento_atual || answers?.tratamento_atual) ? 'text-mecura-neon' : 'text-white'}\`}>{(currentPatient?.answers?.tratamento_atual || answers?.tratamento_atual) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5">
                <span className="text-sm text-mecura-silver block mb-2">Uso de Remédios</span>
                <span className={\`text-base font-bold \${(currentPatient?.answers?.remedios || answers?.remedios) ? 'text-mecura-neon' : 'text-white'}\`}>{(currentPatient?.answers?.remedios || answers?.remedios) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5">
                <span className="text-sm text-mecura-silver block mb-2">Doença Crônica</span>
                <span className={\`text-base font-bold \${(currentPatient?.answers?.doenca_cronica || answers?.doenca_cronica) ? 'text-mecura-neon' : 'text-white'}\`}>{(currentPatient?.answers?.doenca_cronica || answers?.doenca_cronica) ? 'Sim' : 'Não'}</span>
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5">
                <span className="text-sm text-mecura-silver block mb-2">Já usou Cannabis</span>
                <span className={\`text-base font-bold \${(currentPatient?.answers?.cannabis || answers?.cannabis) ? 'text-mecura-neon' : 'text-white'}\`}>{(currentPatient?.answers?.cannabis || answers?.cannabis) ? 'Sim' : 'Não'}</span>
              </div>`;

const newUI = `              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                <span className="text-sm text-mecura-silver block mb-2">Tratamento Atual</span>
                <span className={\`text-base font-bold \${(currentPatient?.answers?.tratamento_atual || answers?.tratamento_atual) ? 'text-mecura-neon' : 'text-white'}\`}>
                  {(currentPatient?.answers?.tratamento_atual || answers?.tratamento_atual) ? 'Sim' : 'Não'}
                </span>
                {(currentPatient?.answers?.tratamento_atual_details || answers?.tratamento_atual_details) && (
                  <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                    {currentPatient?.answers?.tratamento_atual_details || answers?.tratamento_atual_details}
                  </p>
                )}
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                <span className="text-sm text-mecura-silver block mb-2">Uso de Remédios</span>
                <span className={\`text-base font-bold \${(currentPatient?.answers?.remedios || answers?.remedios) ? 'text-mecura-neon' : 'text-white'}\`}>
                  {(currentPatient?.answers?.remedios || answers?.remedios) ? 'Sim' : 'Não'}
                </span>
                {(currentPatient?.answers?.remedios_details || answers?.remedios_details) && (
                  <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                    {currentPatient?.answers?.remedios_details || answers?.remedios_details}
                  </p>
                )}
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                <span className="text-sm text-mecura-silver block mb-2">Doença Crônica</span>
                <span className={\`text-base font-bold \${(currentPatient?.answers?.doenca_cronica || answers?.doenca_cronica) ? 'text-mecura-neon' : 'text-white'}\`}>
                  {(currentPatient?.answers?.doenca_cronica || answers?.doenca_cronica) ? 'Sim' : 'Não'}
                </span>
                {(currentPatient?.answers?.doenca_cronica_details || answers?.doenca_cronica_details) && (
                  <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                    {currentPatient?.answers?.doenca_cronica_details || answers?.doenca_cronica_details}
                  </p>
                )}
              </div>
              <div className="bg-mecura-surface/50 border border-mecura-elevated rounded-2xl p-5 col-span-2 md:col-span-1">
                <span className="text-sm text-mecura-silver block mb-2">Já usou Cannabis</span>
                <span className={\`text-base font-bold \${(currentPatient?.answers?.cannabis || answers?.cannabis) ? 'text-mecura-neon' : 'text-white'}\`}>
                  {(currentPatient?.answers?.cannabis || answers?.cannabis) ? 'Sim' : 'Não'}
                </span>
                {(currentPatient?.answers?.cannabis_details || answers?.cannabis_details) && (
                  <p className="text-sm text-gray-400 mt-2 italic border-t border-mecura-elevated pt-2">
                    {currentPatient?.answers?.cannabis_details || answers?.cannabis_details}
                  </p>
                )}
              </div>`;

if(code.includes(targetUI)) {
  code = code.replace(targetUI, newUI);
  fs.writeFileSync(path, code);
  console.log("Success updating patient view UI with details");
} else {
  console.log("targetUI not found");
}
