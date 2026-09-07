const fs = require('fs');
const path = 'src/screens/AdminDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetReturn = `  return () => {
      unsubscribeUsers();
      unsubscribeQueue();
      unsubscribePayments();
    };
  }, []);`;

const newReturn = `  return () => {
      unsubscribeUsers();
      if(unsubscribeQueueStore) unsubscribeQueueStore();
      unsubscribeQueue();
      unsubscribePayments();
    };
  }, [subscribeToQueue]);`;

if(code.includes(targetReturn)) {
  code = code.replace(targetReturn, newReturn);
  fs.writeFileSync(path, code);
  console.log("Success patching return");
} else {
  console.log("Target return not found");
}
