import re

with open("src/screens/OnboardingScreen.tsx", "r") as f:
    code = f.read()

# Add states
if "const [showForgotPassword, setShowForgotPassword] = useState(false);" not in code:
    code = code.replace("const [authError, setAuthError] = useState('');", 
"""const [authError, setAuthError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);""")

# Add functions
if "const handleForgotPassword = async () => {" not in code:
    functions = """  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) return;
    setForgotPasswordLoading(true);
    try {
      await addDoc(collection(db, 'support_requests'), {
        userId: 'recovery',
        userName: 'Recuperação de Senha',
        email: forgotPasswordEmail,
        message: `O paciente solicitou recuperação de senha. E-mail informado: ${forgotPasswordEmail}. Por favor, altere a senha na aba Pacientes e envie para ele.`,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setForgotPasswordSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordSuccess(false);
        setForgotPasswordEmail('');
      }, 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

"""
    code = code.replace("const handleNext = async () => {", functions + "  const handleNext = async () => {")

# Add button
old_password = """              <Input 
                placeholder="Sua senha" 
                value={password} 
                onChange={(e) => { setPassword(e.target.value); setAuthError(''); }} 
                type="password" 
              />"""

new_password = """              <Input 
                placeholder="Sua senha" 
                value={password} 
                onChange={(e) => { setPassword(e.target.value); setAuthError(''); }} 
                type="password" 
              />
              
              {isLogin && (
                <div className="flex justify-end mt-1">
                  <button 
                    onClick={() => {
                        setForgotPasswordEmail(userEmail);
                        setShowForgotPassword(true);
                    }} 
                    className="text-xs text-mecura-neon hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}"""

if "{isLogin && (" not in code:
    code = code.replace(old_password, new_password)

# Add modal
modal = """
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md"
            >
              {!forgotPasswordSuccess ? (
                  <>
                    <h3 className="text-xl font-bold mb-2">Recuperar Senha</h3>
                    <p className="text-[#8A8A9E] mb-6 text-sm">Digite seu e-mail abaixo. Nossa equipe será notificada e entraremos em contato com você via WhatsApp com uma nova senha.</p>
                    <Input 
                        placeholder="Seu e-mail cadastrado" 
                        value={forgotPasswordEmail} 
                        onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                        type="email" 
                    />
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => setShowForgotPassword(false)}>Cancelar</Button>
                        <Button className="flex-1" disabled={!forgotPasswordEmail || forgotPasswordLoading} onClick={handleForgotPassword}>
                            {forgotPasswordLoading ? 'Enviando...' : 'Solicitar'}
                        </Button>
                    </div>
                  </>
              ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Solicitação Enviada!</h3>
                    <p className="text-[#8A8A9E] text-sm">Nossa equipe já foi notificada. Aguarde nosso contato pelo WhatsApp em instantes.</p>
                  </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
"""

if "showForgotPassword && (" not in code:
    code = code.replace("return (", "return (\n" + modal)

with open("src/screens/OnboardingScreen.tsx", "w") as f:
    f.write(code)
