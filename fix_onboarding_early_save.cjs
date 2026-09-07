const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetAuth = `          } else {
            const trimmedEmail = userEmail.trim();
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          }
          setCurrentStep(1);`;

const newAuth = `          } else {
            const trimmedEmail = userEmail.trim();
            const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
            try {
              await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: trimmedEmail,
                hasCompletedOnboarding: false,
                createdAt: new Date().toISOString(),
                tier: 'basic'
              }, { merge: true });
            } catch (e) {
              console.error("Error creating early user data", e);
            }
          }
          setCurrentStep(1);`;

if(code.includes(targetAuth)) {
  code = code.replace(targetAuth, newAuth);
  fs.writeFileSync(path, code);
  console.log("Success adding early save");
} else {
  console.log("Target auth not found");
}
