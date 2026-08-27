const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

initializeApp({
  credential: applicationDefault()
});

getAuth().listUsers(1).then((res) => {
  console.log("Success:", res.users.length);
}).catch(err => {
  console.error("Error:", err);
});
