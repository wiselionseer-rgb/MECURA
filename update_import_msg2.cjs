const fs = require('fs');
const dashboardPath = 'src/screens/DoctorDashboardScreen.tsx';
let dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

const targetCode = `                      const productData = {
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
                      });`;

const newCode = `                      const productData = {
                        name: prodName,
                        brand: 'GreenBudzCBD',
                        origin: 'Importado',
                        type: "Óleo de Cannabis",
                        dosage: dosage,
                        strategy: strategyDesc,
                        activeIngredients: "CBD/CBN/THC",
                        concentration: "Alto Rendimento",
                        pharmaceuticalForm: "Óleo Sublingual",
                        unitSize: "Frasco 30ml",
                        details: ['Frasco 30ml', 'Alto rendimento (~60 dias)', 'Catálogo Oficial Importado'],
                        description: strategyDesc,
                        image: "https://placehold.co/400x400/3b82f6/ffffff?text=Importado"
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

                      // 3. Add prescription notes
                      const protocolNotes = \`PROTOCOLO DE ENTRADA ACESSÍVEL (FASE 1):\\n- Medicamento Inicial: \${prodName} (Importado)\\n- Posologia Econômica: \${dosage.join(' ')}\\n- Rendimento estimado: 45 a 60 dias.\\n- Fase 2 (Evolução): Reavaliação em 30 a 45 dias para verificar resposta terapêutica e evolução progressiva se necessário.\\n- Administrar preferencialmente após as refeições.\`;

                      addMessage({
                        sender: 'doctor',
                        type: 'prescription_notes',
                        text: protocolNotes
                      });`;

if(dashboardCode.includes(targetCode)) {
  dashboardCode = dashboardCode.replace(targetCode, newCode);
  fs.writeFileSync(dashboardPath, dashboardCode);
  console.log("Success update 2");
} else {
  console.log("Target code not found");
}
