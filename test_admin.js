const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
admin.auth().listUsers(1).then((res) => {
  console.log("Success:", res.users.length);
}).catch(err => {
  console.error("Error:", err);
});
