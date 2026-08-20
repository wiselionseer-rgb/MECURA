const fs = require('fs');

let content = fs.readFileSync('src/screens/OnboardingScreen.tsx', 'utf8');

content = content.replace(
  "setAuthError('Login por email/senha não está ativado no Firebase.');",
  "setAuthError('Você precisa ativar o provedor de Email/Senha no console do Firebase > Authentication > Sign-in method.');"
);

fs.writeFileSync('src/screens/OnboardingScreen.tsx', content, 'utf8');
console.log('Fixed Onboarding error message.');
