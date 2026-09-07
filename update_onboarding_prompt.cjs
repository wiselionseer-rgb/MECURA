const fs = require('fs');
const path = 'src/screens/OnboardingScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetState = `  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);`;
const newState = `  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [showExistingAccountPrompt, setShowExistingAccountPrompt] = useState(false);`;

if(code.includes(targetState)) {
  code = code.replace(targetState, newState);
}

const targetAuthBlock = `            if (userDoc.exists()) {
              reset();
              const data = userDoc.data();
              if (data.name) setUserName(data.name);
              if (data.phone) setUserPhone(data.phone);
              if (data.cpf) setUserCpf(data.cpf);
              if (data.birthDate) setUserBirthDate(data.birthDate);
              if (data.answers) {
                // Load answers into store
                Object.entries(data.answers).forEach(([key, value]) => {
                  setAnswer(key, value);
                });
                if (data.answers.birthDate && !data.birthDate) setUserBirthDate(data.answers.birthDate);
                if (data.answers.cpf && !data.cpf) setUserCpf(data.answers.cpf);
              }
              
              if (data.hasCompletedOnboarding) {
                setHasCompletedOnboarding(true);
                navigate('/dashboard');
                return;
              }
            }`;

const newAuthBlock = `            if (userDoc.exists()) {
              reset();
              const data = userDoc.data();
              if (data.name) setUserName(data.name);
              if (data.phone) setUserPhone(data.phone);
              if (data.cpf) setUserCpf(data.cpf);
              if (data.birthDate) setUserBirthDate(data.birthDate);
              if (data.answers) {
                // Load answers into store
                Object.entries(data.answers).forEach(([key, value]) => {
                  setAnswer(key, value);
                });
                if (data.answers.birthDate && !data.birthDate) setUserBirthDate(data.answers.birthDate);
                if (data.answers.cpf && !data.cpf) setUserCpf(data.answers.cpf);
              }
              
              if (data.hasCompletedOnboarding) {
                setHasCompletedOnboarding(true);
                setShowExistingAccountPrompt(true);
                setIsLoading(false);
                return;
              }
            }`;

if(code.includes(targetAuthBlock)) {
  code = code.replace(targetAuthBlock, newAuthBlock);
}

const targetJSX = `      <AnimatePresence mode="wait">
        <motion.div`;

const newJSX = `      <AnimatePresence>
        {showExistingAccountPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#161622] border border-white/10 rounded-[32px] p-8 w-full max-w-md relative shadow-2xl"
            >
              <h2 className="text-2xl font-serif font-bold text-white mb-4 text-center tracking-tight">
                Bem-vindo de volta!
              </h2>
              <p className="text-mecura-silver text-sm text-center mb-8">
                Identificamos que você já realizou uma triagem anterior conosco. O que deseja fazer agora?
              </p>
              
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full py-4 text-sm font-bold bg-mecura-neon text-black rounded-xl hover:bg-mecura-neon/90"
                  onClick={() => {
                    setShowExistingAccountPrompt(false);
                    navigate('/dashboard');
                  }}
                >
                  <User className="w-4 h-4 mr-2" /> Acessar Meu Painel
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full py-4 text-sm font-bold border-white/10 text-white rounded-xl hover:bg-white/5"
                  onClick={() => {
                    setShowExistingAccountPrompt(false);
                    setCurrentStep(1);
                    setOnboardingStep(1);
                  }}
                >
                  <Info className="w-4 h-4 mr-2" /> Iniciar Nova Triagem
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div`;

if(code.includes(targetJSX)) {
  code = code.replace(targetJSX, newJSX);
}

fs.writeFileSync(path, code);
console.log("Success update onboarding prompt");
