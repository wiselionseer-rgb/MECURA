const fs = require('fs');
let s = fs.readFileSync('src/store/useStore.ts', 'utf8');

if (!s.includes('triggerBackgroundPush')) {
  s = s.replace("import { showNativeNotification } from '../utils/notifications';", "import { showNativeNotification, triggerBackgroundPush } from '../utils/notifications';");
  
  const oldCode = `        console.log("Queue document updated successfully.");
      } catch (error) {`;
      
  const newCode = `        console.log("Queue document updated successfully.");
        
        // Trigger background push for patient if doctor sent it
        if (newMessage.sender === 'doctor') {
          triggerBackgroundPush(
            consultationId,
            'Nova mensagem da Mecura',
            newMessage.text ? (newMessage.text.length > 50 ? newMessage.text.substring(0, 50) + '...' : newMessage.text) : 'Você tem uma nova atualização no consultório.',
            '/chat'
          );
        }
      } catch (error) {`;
      
  if (s.includes(oldCode)) {
    s = s.replace(oldCode, newCode);
    fs.writeFileSync('src/store/useStore.ts', s, 'utf8');
    console.log('Store push logic added.');
  } else {
    console.log('Could not find injection point in useStore.ts');
  }
} else {
  console.log('Store already has triggerBackgroundPush');
}
