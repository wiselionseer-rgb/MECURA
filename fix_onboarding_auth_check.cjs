const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetCheck = `    useEffect(() => {
      // Se já estiver logado, pula a etapa de login
      if (auth.currentUser && currentStep === 0) {
        setCurrentStep(1);
      }
    }, []);`;

const newCheck = `    useEffect(() => {
      // Se já estiver logado (ou store tiver dados), pula a etapa de login
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user && currentStep === 0) {
          setCurrentStep(1);
          setOnboardingStep(1);
        }
      });
      return () => unsubscribe();
    }, [currentStep, setOnboardingStep]);`;

if(code.includes(targetCheck)) {
  code = code.replace(targetCheck, newCheck);
  fs.writeFileSync(path, code);
  console.log("Success updating auth check");
} else {
  console.log("Target check not found");
}
