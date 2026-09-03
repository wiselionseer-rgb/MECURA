const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

const regex = /<div className="space-y-6 text-sm text-\[#334155\] leading-relaxed text-justify">.*?<\/div>/s;

const replacement = `<div className="space-y-6 text-sm text-[#334155] leading-relaxed text-justify">
              <div className="flex flex-col gap-4">
                {patientData?.customPsychomotorText 
                  ? patientData.customPsychomotorText.split('\\n').map((p, i) => p.trim() ? <p key={i} style={{ pageBreakInside: "avoid" }} dangerouslySetInnerHTML={{ __html: p }}></p> : null)
                  : <>
                      <p style={{ pageBreakInside: "avoid" }}>
                        Declaro, para os devidos fins de direito, que o(a) paciente <strong>{sanitizedUserName}</strong>, 
                        inscrito(a) no CPF <strong>{cpfText}</strong>, encontra-se em acompanhamento médico regular neste 
                        Centro Integrado de Medicina Canabinoide.
                      </p>
                      <p style={{ pageBreakInside: "avoid" }}>
                        O(a) paciente faz uso terapêutico de produtos derivados de Cannabis, estritamente conforme 
                        prescrição médica, sob supervisão e com acompanhamento clínico contínuo. 
                      </p>
                      <p style={{ pageBreakInside: "avoid" }}>
                        Atesto, baseado em exames clínicos e testes de rastreio de capacidade psicomotora realizados 
                        durante as consultas de monitoramento, que o uso das medicações prescritas, nas doses estipuladas, 
                        <strong> NÃO RESULTA </strong> em alteração da capacidade psicomotora, prejuízo cognitivo, ou 
                        comprometimento dos reflexos e estado de alerta do paciente.
                      </p>
                      <p style={{ pageBreakInside: "avoid" }}>
                        O tratamento prescrito não interfere em sua capacidade de operar máquinas complexas, conduzir 
                        veículos automotores ou exercer atividades laborais que exijam atenção e precisão, não configurando 
                        infração à legislação de trânsito relacionada ao comprometimento psicomotor ("Lei Seca" ou "Lei do Drogômetro" - Art. 165 do CTB).
                      </p>
                      <p style={{ pageBreakInside: "avoid" }}>
                        Ressalto que os canabinoides prescritos têm finalidade exclusivamente terapêutica, 
                        sendo legalmente importados (RDC 660/2022 ANVISA) e/ou adquiridos via Associações de Pacientes, 
                        e não se enquadram como substâncias psicoativas entorpecentes de uso recreativo capazes de 
                        causar dependência ou prejuízo sensório-motor nas doses tituladas.
                      </p>
                    </>
                }
              </div>
            </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/utils/pdfGenerator.tsx', code);
