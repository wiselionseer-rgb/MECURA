const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetUseEffect = `    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, [currentStep]);`;

const newUseEffect = `    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, [currentStep]);
    
    useEffect(() => {
      // Se já estiver logado, pula a etapa de login
      if (auth.currentUser && currentStep === 0) {
        setCurrentStep(1);
      }
    }, []);`;

if (code.includes(targetUseEffect)) {
  code = code.replace(targetUseEffect, newUseEffect);
  fs.writeFileSync(path, code);
  console.log("Success adding auth check");
} else {
  console.log("Target useEffect not found");
}
