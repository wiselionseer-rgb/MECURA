const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf-8');

const target = `      const queueData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinedAt: new Date(data.joinedAt)
        };
      }) as any[];

      if (!isInitialLoadQueue && (isDoctorRoute || isAdminRoute)) {`;

const replacement = `      const queueData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          joinedAt: new Date(data.joinedAt)
        };
      }) as any[];

      // GLOBAL LISTENER FOR PATIENT (Runs on all screens)
      if (!isInitialLoadQueue && !isDoctorRoute && !isAdminRoute) {
        const currentUserId = auth.currentUser?.uid || get().patientId;
        if (currentUserId) {
          const myDoc = queueData.find(p => p.id === currentUserId);
          if (myDoc && myDoc.lastMessageAt) {
            const prevState = get().queue.find(p => p.id === currentUserId);
            // Se o lastMessageAt mudou, e o remetente não foi o paciente (ou seja, foi o médico)
            if (prevState && prevState.lastMessageAt !== myDoc.lastMessageAt && !myDoc.hasUnread) {
              if (typeof document !== 'undefined' && document.hidden) {
                import('../utils/sound').then(({ playNotificationSound }) => {
                  playNotificationSound();
                });
                import('../utils/notifications').then(({ showNativeNotification }) => {
                  showNativeNotification('Nova mensagem do Médico', myDoc.lastMessageText || 'Você tem uma nova mensagem.', '/chat');
                });
              } else if (myDoc.lastMessageText && myDoc.lastMessageText.includes('SUA VEZ CHEGOU')) {
                import('../utils/sound').then(({ playNotificationSound }) => {
                  playNotificationSound();
                });
                import('../utils/notifications').then(({ showNativeNotification }) => {
                  showNativeNotification('Nova mensagem do Médico', myDoc.lastMessageText, '/chat');
                });
              }
            }
          }
        }
      }

      if (!isInitialLoadQueue && (isDoctorRoute || isAdminRoute)) {`;

code = code.replace(target, replacement);
fs.writeFileSync('src/store/useStore.ts', code);
