const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');

// The exact string to remove
const buttonToRemove = `                  <button
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
                  </button>`;

// Ensure we find it
if (!code.includes(buttonToRemove)) {
  console.log("Could not find button to remove. I will try a regex instead.");
  code = code.replace(/<button[\s\S]*?Chamar Paciente[\s\S]*?<\/button>/, '');
} else {
  code = code.replace(buttonToRemove, '');
}

// Now insert it before the "Histórico" button
const targetHeader = `<div className="flex gap-2 md:gap-3 overflow-x-auto custom-scrollbar pb-1 md:pb-0 items-center">
                <button 
                  onClick={() => setShowHistoryModal(true)}`;

const buttonToInsert = `<button
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

code = code.replace(targetHeader, `<div className="flex gap-2 md:gap-3 overflow-x-auto custom-scrollbar pb-1 md:pb-0 items-center">\n                ${buttonToInsert}\n                <button \n                  onClick={() => setShowHistoryModal(true)}`);

fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code, 'utf8');
