const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const target = `          if (isLogin) {
            const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);`;

const replacement = `          if (isLogin) {
            const trimmedEmail = userEmail.trim();
            const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);`;

code = code.replace(target, replacement);

const target2 = `          } else {
            await createUserWithEmailAndPassword(auth, userEmail, password);
          }`;

const replacement2 = `          } else {
            const trimmedEmail = userEmail.trim();
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          }`;

code = code.replace(target2, replacement2);

const target3 = `          } else if (error.code === 'auth/operation-not-allowed') {
            setAuthError('Você precisa ativar o provedor de Email/Senha no console do Firebase > Authentication > Sign-in method.');
          } else {`;

const replacement3 = `          } else if (error.code === 'auth/operation-not-allowed') {
            setAuthError('Você precisa ativar o provedor de Email/Senha no console do Firebase > Authentication > Sign-in method.');
          } else if (error.code === 'auth/invalid-email') {
            setAuthError('O formato do email é inválido. Verifique se há espaços extras ou erros de digitação.');
          } else {`;

code = code.replace(target3, replacement3);

fs.writeFileSync(path, code);
console.log('Patched OnboardingScreen.tsx!');
