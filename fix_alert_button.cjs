const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');

const newButton = `
                  <button
                    onClick={async () => {
                      // Call the currently selected patient OR the first waiting patient
                      const targetPatient = currentPatient || queue.find(p => p.status === 'waiting');
                      if (targetPatient) {
                        try {
                          const { triggerBackgroundPush } = await import('../utils/notifications');
                          await triggerBackgroundPush(
                            targetPatient.id,
                            'Sua vez chegou!',
                            'O médico está te chamando no consultório agora. Clique para abrir.',
                            '/chat'
                          );
                          alert(\`Alerta enviado para \${targetPatient.patientName || 'o paciente'}.\`);
                          // Optional: Auto-select if it was the first waiting one
                          if (!currentPatient && targetPatient.status === 'waiting') {
                             handleStartConsultation(targetPatient);
                          }
                        } catch (e) {
                          alert('Erro ao enviar alerta.');
                        }
                      } else {
                        alert('Nenhum paciente aguardando na fila.');
                      }
                    }}
                    title="Chamar Paciente"
                    className="p-2 bg-mecura-neon/10 text-mecura-neon rounded-lg hover:bg-mecura-neon hover:text-black transition-all flex items-center gap-2 border border-mecura-neon/30"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="text-xs font-bold">Chamar Paciente</span>
                  </button>
`;

code = code.replace(/<button\s+onClick=\{async \(\) => \{\s+const success = await testNotification\(\);[\s\S]*?<\/button>/, newButton.trim());

fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code, 'utf8');
