const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf-8');

const target = `          const lastMsg = currentMessages[currentMessages.length - 1];
          // Trigger local notification if the app is minimized (but alive)
          if (typeof document !== 'undefined' && document.hidden) {
            import('../utils/notifications').then(({ showNativeNotification }) => {
              showNativeNotification('Nova mensagem do Médico', lastMsg.text, '/chat');
            });
          } else if (lastMsg.text.includes('SUA VEZ CHEGOU')) {
            // Força a exibição para a mensagem de alerta, mesmo se a tela não estiver minimizada
            import('../utils/notifications').then(({ showNativeNotification }) => {
              showNativeNotification('Nova mensagem do Médico', lastMsg.text, '/chat');
            });
          }`;

const replacement = `          const lastMsg = currentMessages[currentMessages.length - 1];
          // Local notifications are now handled globally by subscribeToQueue via lastMessageAt`;

code = code.replace(target, replacement);
fs.writeFileSync('src/store/useStore.ts', code);
