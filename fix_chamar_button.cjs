const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');

const oldButton = `<button
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
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon rounded-xl text-xs md:text-sm font-bold hover:bg-mecura-neon hover:text-black transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(166,255,0,0.1)]"
                >
                  <Bell className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Chamar Paciente</span><span className="md:hidden">Chamar</span>
                </button>`;

const newButton = `<button
                  onClick={async () => {
                    const targetPatient = currentPatient || queue.find(p => p.status === 'waiting');
                    if (targetPatient) {
                      try {
                        // 1. Send Background Push Notification (if they have app closed)
                        const { triggerBackgroundPush } = await import('../utils/notifications');
                        triggerBackgroundPush(
                          targetPatient.id,
                          'Sua vez chegou!',
                          'O médico está te chamando no consultório agora. Clique para abrir.',
                          '/chat'
                        ).catch(() => {});
                        
                        // 2. Send an automated chat message that will definitively trigger their UI
                        // This guarantees delivery if they are already in the app/chat
                        const { collection, doc, setDoc } = await import('firebase/firestore');
                        const { db } = await import('../firebase');
                        
                        const msgRef = doc(collection(db, 'active_consultations', targetPatient.id, 'messages'));
                        await setDoc(msgRef, {
                          id: msgRef.id,
                          text: "🔔 SUA VEZ CHEGOU! O médico está te chamando no consultório agora.",
                          sender: 'doctor',
                          type: 'text',
                          timestamp: new Date().toISOString()
                        });
                        
                        // Also update the queue so the patient side can react if they are on the QueueScreen
                        const patientRef = doc(db, 'queue', targetPatient.id);
                        await setDoc(patientRef, { isAlerted: Date.now() }, { merge: true });

                        alert(\`Alerta enviado para \${targetPatient.patientName || 'o paciente'} com sucesso!\`);
                        
                        // Auto-select if it was the first waiting one
                        if (!currentPatient && targetPatient.status === 'waiting') {
                           handleStartConsultation(targetPatient);
                        }
                      } catch (e) {
                        console.error(e);
                        alert('Erro ao enviar alerta.');
                      }
                    } else {
                      alert('Nenhum paciente aguardando na fila.');
                    }
                  }}
                  title="Chamar Paciente"
                  className="px-3 md:px-4 py-2 md:py-2.5 bg-mecura-neon/10 border border-mecura-neon/30 text-mecura-neon rounded-xl text-xs md:text-sm font-bold hover:bg-mecura-neon hover:text-black transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(166,255,0,0.1)]"
                >
                  <Bell className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Chamar Paciente</span><span className="md:hidden">Chamar</span>
                </button>`;

code = code.replace(oldButton, newButton);
fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code, 'utf8');
