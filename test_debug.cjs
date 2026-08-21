fetch('http://localhost:3000/api/debug-users')
  .then(res => res.json())
  .then(data => {
    const withSub = data.filter(u => u.pushSubscription);
    console.log("Users with sub:", JSON.stringify(withSub, null, 2));
    const admins = data.filter(u => u.role === 'admin');
    console.log("Admins:", JSON.stringify(admins, null, 2));
  }).catch(console.error);
