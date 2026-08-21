const fs = require('fs');
let s = fs.readFileSync('src/store/useStore.ts', 'utf8');

if (!s.includes('triggerAdminBackgroundPush')) {
  s = s.replace("import { showNativeNotification, triggerBackgroundPush } from '../utils/notifications';", "import { showNativeNotification, triggerBackgroundPush, triggerAdminBackgroundPush } from '../utils/notifications';");
  
  const oldCode = `        // Trigger background push for patient if doctor sent it
        if (newMessage.sender === 'doctor') {`;
        
  const newCode = `        // Trigger background push
        if (newMessage.sender === 'doctor') {`;
        
  s = s.replace(oldCode, newCode);
  
  const oldCode2 = `            '/chat'
          );
        }
      } catch (error) {`;
      
  const newCode2 = `            '/chat'
          );
        } else if (newMessage.sender === 'user') {
          triggerAdminBackgroundPush(
            'Nova mensagem de Paciente',
            newMessage.text ? (newMessage.text.length > 50 ? newMessage.text.substring(0, 50) + '...' : newMessage.text) : 'O paciente enviou uma nova mensagem.',
            '/doctor'
          );
        }
      } catch (error) {`;
      
  if (s.includes(oldCode2)) {
    s = s.replace(oldCode2, newCode2);
    fs.writeFileSync('src/store/useStore.ts', s, 'utf8');
    console.log('Store admin push logic added.');
  } else {
    console.log('Could not find injection point');
  }
}
