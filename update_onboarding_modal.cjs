const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetModal = `                <Button 
                  variant="outline"
                  className="w-full py-4 text-sm font-bold border-white/10 text-white rounded-xl hover:bg-white/5"
                  onClick={() => {
                    setShowExistingAccountPrompt(false);
                    setCurrentStep(1);
                    setOnboardingStep(1);
                  }}
                >`;

const newModal = `                <Button 
                  variant="outline"
                  className="w-full py-4 text-sm font-bold border-white/10 text-white rounded-xl hover:bg-white/5"
                  onClick={() => {
                    useStore.getState().clearTriage();
                    setShowExistingAccountPrompt(false);
                    setCurrentStep(1);
                    setOnboardingStep(1);
                  }}
                >`;

if(code.includes(targetModal)) {
  code = code.replace(targetModal, newModal);
  fs.writeFileSync(path, code);
  console.log("Success updating onboarding modal");
} else {
  console.log("Target modal not found");
}
