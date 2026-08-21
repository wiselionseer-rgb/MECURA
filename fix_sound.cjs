const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf8');

const oldSub = `      if (msgs.length > currentMessages.length && currentMessages.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.sender === 'doctor') {
          if (typeof document !== 'undefined' && document.hidden) {
            import('../utils/notifications').then(({ showNativeNotification }) => {
              showNativeNotification('Nova mensagem do Médico', lastMsg.text, '/chat');
            });
          }
        }
      }`;

const newSub = `      if (msgs.length > currentMessages.length && currentMessages.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.sender === 'doctor') {
          // Play sound for ALL new doctor messages
          import('../utils/sound').then(({ playNotificationSound }) => {
            playNotificationSound();
          });
          
          if (typeof document !== 'undefined' && document.hidden) {
            import('../utils/notifications').then(({ showNativeNotification }) => {
              showNativeNotification('Nova mensagem do Médico', lastMsg.text, '/chat');
            });
          } else if (lastMsg.text.includes('SUA VEZ CHEGOU')) {
            // Also explicitly show the notification for the ALERT message even if not hidden
            import('../utils/notifications').then(({ showNativeNotification }) => {
              showNativeNotification('Nova mensagem do Médico', lastMsg.text, '/chat');
            });
          }
        }
      }`;

if (code.includes(oldSub)) {
  code = code.replace(oldSub, newSub);
  fs.writeFileSync('src/store/useStore.ts', code, 'utf8');
} else {
  console.error("Could not find subscribe snippet");
}
