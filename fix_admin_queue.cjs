const fs = require('fs');
const path = 'src/screens/AdminDashboardScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetSubscribe = `    // Fetch queue (basic consultations 50 reais)
    const qQueue = query(collection(db, 'queue'));
    const unsubscribeQueue = onSnapshot(qQueue, (snapshot) => {
      setQueueCount(snapshot.size);
    });`;

const newSubscribe = `    // Subscribe to global queue store instead of raw query
    const unsubscribeQueueStore = subscribeToQueue();
    // Fetch queue count
    const qQueue = query(collection(db, 'queue'));
    const unsubscribeQueue = onSnapshot(qQueue, (snapshot) => {
      setQueueCount(snapshot.size);
    });`;

if(code.includes(targetSubscribe)) {
  code = code.replace(targetSubscribe, newSubscribe);
}

const targetReturn = `    return () => {
      unsubscribeUsers();
      unsubscribeQueue();
      unsubscribePayments();
      unsubscribeSupport();
      unsubscribeCoupons();
    };
  }, []);`;

const newReturn = `    return () => {
      unsubscribeUsers();
      unsubscribeQueueStore();
      unsubscribeQueue();
      unsubscribePayments();
      unsubscribeSupport();
      unsubscribeCoupons();
    };
  }, [subscribeToQueue]);`;

if(code.includes(targetReturn)) {
  code = code.replace(targetReturn, newReturn);
}

const targetDestructure = `  const { queue, allAppointments, confirmAppointment, cancelAppointment, rescheduleAppointment, exchangeRate, updateExchangeRate } = useStore();`;
const newDestructure = `  const { queue, subscribeToQueue, allAppointments, confirmAppointment, cancelAppointment, rescheduleAppointment, exchangeRate, updateExchangeRate } = useStore();`;

if(code.includes(targetDestructure)) {
  code = code.replace(targetDestructure, newDestructure);
}

fs.writeFileSync(path, code);
console.log("Success patching AdminDashboardScreen");
