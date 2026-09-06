const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

const targetCode = `                    onClick={() => {
                      const productData = {
                        name: accessibleImportType === 'cbd' ? "CBD Isolate Alto Rendimento" : 
                              accessibleImportType === 'balanced' ? "Drops By GreenBudz CBD+CBN Sleep" : 
                              "Drops By GreenBudz Formula CBD/THC",
                        brand: 'GreenBudzCBD',
                        origin: 'Importado',
                        type: "Óleo de Cannabis",
                        dosage: accessibleImportType === 'cbd' ? ["Iniciar com 2 gotas 2x/dia. Titulação lenta."] :
                                accessibleImportType === 'balanced' ? ["Iniciar com 3 gotas 30 min antes de deitar."] :
                                ["Iniciar com 2 gotas 12/12h. Aumentar 1 gota após 5 dias."],
                        strategy: "Plano de entrada otimizado para custo-benefício (Importado)."
                      };
                      
                      const msg = accessibleImportCustomMessage.trim() || 
                        "Olá! Pensando na sua acessibilidade, estruturei um Protocolo de Entrada Acessível utilizando nosso Catálogo Oficial Importado.\\n\\nIniciaremos com apenas 01 medicamento de alto rendimento que dura cerca de 2 meses com a dosagem ajustada. Este protocolo nos permite iniciar o tratamento de forma segura, com excelente qualidade e menor impacto financeiro inicial.";
                      
                      addMessage({
                        text: \`**Protocolo de Entrada (Importado)**\\n\\n\${msg}\\n\\n**Medicamento Prescrito:**\\n\${productData.name} - \${productData.dosage[0]}\`,
                        sender: 'doctor',
                        type: 'product',
                        productData
                      });
                      
                      setShowAccessibleImportModal(false);
                      setAccessibleImportCustomMessage('');
                    }}`;

const newCode = `                    onClick={() => {
                      const patientName = currentPatient?.patientName || userName || 'Paciente';
                      
                      let prodName = "CBD Isolate Alto Rendimento";
                      let dosage = ["Tomar 02 gotas de 12/12 horas (sublingual).", "Aumentar 01 gota a cada 05 dias até atingir a dose de controle.", "01 Frasco rende cerca de 45 a 60 dias."];
                      let strategyDesc = "Plano de entrada otimizado para controle de ansiedade/estresse.";
                      
                      if (accessibleImportType === 'balanced') {
                        prodName = "Drops By GreenBudz CBD+CBN Sleep";
                        dosage = ["Tomar 03 gotas 30 minutos antes de dormir.", "Aumentar gradativamente se houver interrupção do sono.", "Foco em relaxamento e indução do sono."];
                        strategyDesc = "Plano de entrada otimizado para insônia e regulação noturna.";
                      } else if (accessibleImportType === 'thc') {
                        prodName = "Drops By GreenBudz Formula CBD/THC";
                        dosage = ["Tomar 02 gotas de 12/12 horas (sublingual).", "Aumentar 01 gota a cada 04 dias.", "Foco em analgesia e dores crônicas."];
                        strategyDesc = "Plano de entrada otimizado para dor crônica e rigidez.";
                      }
                      
                      const productData = {
                        name: prodName,
                        brand: 'GreenBudzCBD',
                        origin: 'Importado',
                        type: "Óleo de Cannabis",
                        dosage: dosage,
                        strategy: strategyDesc,
                        activeIngredients: "CBD/CBN/THC",
                        concentration: "Alto Rendimento",
                        pharmaceuticalForm: "Óleo Sublingual",
                        unitSize: "Frasco 30ml"
                      };
                      
                      const defaultMsg = \`Olá \${patientName}! Pensando na sua acessibilidade, estruturei um **Protocolo de Entrada Acessível** utilizando nosso Catálogo Oficial Importado.\\n\\nIniciaremos com **apenas 01 medicamento de alto rendimento** (\${prodName}), que dura cerca de 2 meses com a dosagem ajustada.\\n\\nEste protocolo nos permite iniciar o tratamento de forma segura, com excelente qualidade e menor impacto financeiro inicial.\`;
                      const msg = accessibleImportCustomMessage.trim() || defaultMsg;
                      
                      // 1. Send empathetic doctor chat message
                      addMessage({
                        sender: 'doctor',
                        text: msg,
                        type: 'text'
                      });

                      // 2. Add product prescription
                      addMessage({
                        sender: 'doctor',
                        type: 'product',
                        productData
                      });

                      // 3. Add protocol summary guidelines
                      addMessage({
                        sender: 'doctor',
                        type: 'protocol',
                        productData: {
                          name: \`PROTOCOLO DE ENTRADA ACESSÍVEL IMPORTADO (FASE 1):\`,
                          dosage: [
                            \`Medicamento Inicial: \${prodName} (GreenBudzCBD)\`,
                            \`Posologia Econômica: \${dosage[0]} \${dosage[1]}\`,
                            \`Rendimento estimado: 45 a 60 dias.\`,
                            \`Fase 2 (Evolução): Reavaliação em 30 a 45 dias para verificar resposta terapêutica e evolução progressiva se necessário.\`,
                            \`Administrar preferencialmente após as refeições.\`
                          ]
                        }
                      });
                      
                      setShowAccessibleImportModal(false);
                      setAccessibleImportCustomMessage('');
                    }}`;

if(dashboardCode.includes(targetCode)) {
  dashboardCode = dashboardCode.replace(targetCode, newCode);
  fs.writeFileSync(dashboardPath, dashboardCode);
  console.log("Success");
} else {
  console.log("Target code not found");
}
