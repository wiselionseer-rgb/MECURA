const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetLogic = `          }
          setCurrentStep(prev => prev + 1);
          setOnboardingStep(currentStep + 1);
        } catch (error: any) {`;

const newLogic = `          }
          setCurrentStep(1);
          setOnboardingStep(1);
        } catch (error: any) {`;

if (code.includes(targetLogic)) {
  code = code.replace(targetLogic, newLogic);
  fs.writeFileSync(path, code);
  console.log("Success fixing step skip");
} else {
  console.log("Target logic not found");
}
