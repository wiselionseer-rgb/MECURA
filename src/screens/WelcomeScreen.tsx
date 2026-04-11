import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ShieldCheck, MessageSquare, FileText, Package, Activity, ChevronRight, Sparkles, User, Settings, Stethoscope, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAdminStore } from '../store/useAdminStore';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { hasCompletedOnboarding } = useStore();
  const { doctors } = useAdminStore();
  
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'doctor' | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      navigate('/onboarding');
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleLogin = () => {
    setLoginError('');
    if (loginType === 'admin') {
      if (password === 'Jesus102030@') {
        setShowProfessionalModal(false);
        navigate('/admin');
      } else {
        setLoginError('Senha incorreta.');
      }
    } else if (loginType === 'doctor') {
      // Check if any doctor has this password
      const doctor = doctors.find(d => d.password === password);
      if (doctor) {
        setShowProfessionalModal(false);
        navigate('/doctor');
      } else {
        setLoginError('Senha incorreta.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full relative bg-[#0A0A0F] overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-center">
        <button 
          onClick={handleBack}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step === 2 ? 'bg-[#161622] border border-[#262636] text-white hover:bg-[#1A1A26]' : 'bg-black/20 backdrop-blur-md text-white hover:bg-black/40'}`}
          style={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? 'none' : 'auto' }}
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setShowProfessionalModal(true);
              setLoginType(null);
              setPassword('');
              setLoginError('');
            }}
            className="text-white/50 font-medium text-xs hover:text-white transition-colors"
          >
            Sou Profissional
          </button>
          <button className="text-white/80 font-medium text-sm underline decoration-white/30 underline-offset-4 hover:text-white transition-colors">
            Ajuda
          </button>
        </div>
      </div>

      {step === 1 ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Full Screen Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop" 
              alt="Natureza e Ciência" 
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/10 via-[#0A0A0F]/60 to-[#0A0A0F] opacity-90" />
            <div className="absolute inset-0 bg-mecura-neon/5 mix-blend-overlay" />
          </div>

          {/* Content */}
          <div className={`relative z-10 flex-1 flex flex-col justify-end px-8 ${hasCompletedOnboarding ? 'pb-56' : 'pb-40'} overflow-y-auto pt-24`}>
            <div>
              <div className="inline-flex items-center gap-2 bg-mecura-neon/10 border border-mecura-neon/30 px-4 py-2 rounded-full mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(166,255,0,0.1)]">
                <Sparkles className="w-3.5 h-3.5 text-mecura-neon" />
                <span className="text-[10px] font-bold text-mecura-neon uppercase tracking-[0.2em]">O Futuro da Medicina</span>
              </div>
              
              <h1 className="text-[44px] font-serif font-bold text-white mb-6 leading-[1.05] tracking-tight">
                O poder da <span className="text-mecura-neon italic">natureza</span>,<br />
                guiado pela <span className="text-white">ciência.</span>
              </h1>
              
              <p className="text-[#A0A0B0] text-lg leading-relaxed mb-10 max-w-[90%] font-light">
                Reescreva sua relação com o bem-estar através de tratamentos personalizados com Cannabis Medicinal.
              </p>

              {/* Trust Badges */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-5 h-5 text-mecura-neon" />
                  </div>
                  <span className="text-white text-sm font-bold">100%<br/><span className="text-[#8A8A9E] font-medium text-xs">Legalizado</span></span>
                </div>
                <div className="w-px h-8 bg-[#262636]" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#161622] border border-[#262636] flex items-center justify-center shadow-lg">
                    <Activity className="w-5 h-5 text-mecura-neon" />
                  </div>
                  <span className="text-white text-sm font-bold">Eficácia<br/><span className="text-[#8A8A9E] font-medium text-xs">Comprovada</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col px-6 pt-24 pb-32 overflow-y-auto bg-[#0A0A0F]">
          {/* Doctor Card */}
          <div className="bg-gradient-to-r from-[#161622] to-[#1A1A26] border border-[#262636] rounded-3xl p-5 flex items-center gap-5 mb-10 shadow-xl">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop" 
                alt="Médico Especialista" 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#262636]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-mecura-neon rounded-full border-2 border-[#161622]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Equipe Médica</h3>
              <p className="text-mecura-neon text-sm font-medium mt-0.5">Especialistas de prontidão</p>
            </div>
          </div>

          <h2 className="text-3xl font-serif font-semibold text-white mb-10 leading-tight">
            Sua jornada de<br/>saúde em <span className="text-mecura-neon italic">4 passos</span>
          </h2>

          {/* Timeline */}
          <div className="space-y-0 relative pl-2">
            {/* Step 1 */}
            <div className="flex gap-6 relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#161622] border-2 border-mecura-neon flex items-center justify-center z-10 shadow-[0_0_15px_rgba(166,255,0,0.15)]">
                  <Activity className="w-5 h-5 text-mecura-neon" />
                </div>
                <div className="w-0.5 h-full bg-gradient-to-b from-mecura-neon to-[#262636] absolute top-12 bottom-[-12px] left-6 -translate-x-1/2" />
              </div>
              <div className="pb-10 pt-2">
                <h4 className="text-white font-bold text-xl mb-2">Avaliação Inicial</h4>
                <p className="text-[#8A8A9E] text-sm leading-relaxed">Definição do seu objetivo e dos seus sintomas de forma rápida e segura.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#161622] border-2 border-[#262636] flex items-center justify-center z-10">
                  <MessageSquare className="w-5 h-5 text-[#8A8A9E]" />
                </div>
                <div className="w-0.5 h-full bg-[#262636] absolute top-12 bottom-[-12px] left-6 -translate-x-1/2" />
              </div>
              <div className="pb-10 pt-2">
                <h4 className="text-white font-bold text-xl mb-2">Consulta via Chat</h4>
                <p className="text-[#8A8A9E] text-sm leading-relaxed">Fale com um médico especialista sem precisar agendar horário.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#161622] border-2 border-[#262636] flex items-center justify-center z-10">
                  <FileText className="w-5 h-5 text-[#8A8A9E]" />
                </div>
                <div className="w-0.5 h-full bg-[#262636] absolute top-12 bottom-[-12px] left-6 -translate-x-1/2" />
              </div>
              <div className="pb-10 pt-2">
                <h4 className="text-white font-bold text-xl mb-2">Prescrição Médica</h4>
                <p className="text-[#8A8A9E] text-sm leading-relaxed">Se indicado, receba a receita e orientações para solicitar os produtos.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 relative">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#161622] border-2 border-[#262636] flex items-center justify-center z-10">
                  <Package className="w-5 h-5 text-[#8A8A9E]" />
                </div>
              </div>
              <div className="pb-4 pt-2">
                <h4 className="text-white font-bold text-xl mb-2">Entrega em Casa</h4>
                <p className="text-[#8A8A9E] text-sm leading-relaxed">Acompanhe a importação até que os produtos sejam entregues na sua porta.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Footer Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent pt-20 pb-10 flex flex-col gap-3">
        <Button 
          className="w-full h-16 text-lg font-bold shadow-[0_0_40px_rgba(166,255,0,0.2)] hover:shadow-[0_0_60px_rgba(166,255,0,0.4)] transition-all duration-500 rounded-full group relative overflow-hidden" 
          onClick={handleNext}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {step === 1 ? 'Iniciar Minha Jornada' : 'Começar Avaliação'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
        
        {hasCompletedOnboarding && step === 1 && (
          <Button 
            variant="outline"
            className="w-full h-14 text-base font-bold border-white/10 text-white hover:bg-white/5 transition-all duration-300 rounded-full" 
            onClick={() => navigate('/dashboard')}
          >
            <User className="w-5 h-5 mr-2" />
            Acessar Área do Paciente
          </Button>
        )}
      </div>

      {/* Professional Login Modal */}
      {showProfessionalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowProfessionalModal(false)}
              className="absolute top-4 right-4 text-[#8A8A9E] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-serif font-bold text-white mb-6 text-center">
              Acesso Profissional
            </h2>

            {!loginType ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLoginType('admin')}
                  className="flex flex-col items-center justify-center gap-3 bg-[#0A0A0F] border border-[#262636] rounded-2xl p-6 hover:border-mecura-neon/50 hover:bg-mecura-neon/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#161622] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Settings className="w-6 h-6 text-mecura-neon" />
                  </div>
                  <span className="text-white font-medium">Administrador</span>
                </button>

                <button
                  onClick={() => setLoginType('doctor')}
                  className="flex flex-col items-center justify-center gap-3 bg-[#0A0A0F] border border-[#262636] rounded-2xl p-6 hover:border-mecura-neon/50 hover:bg-mecura-neon/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#161622] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-6 h-6 text-mecura-neon" />
                  </div>
                  <span className="text-white font-medium">Área Médica</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => {
                      setLoginType(null);
                      setPassword('');
                      setLoginError('');
                    }}
                    className="text-[#8A8A9E] hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-medium text-white">
                    {loginType === 'admin' ? 'Login Administrador' : 'Login Médico'}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8A8A9E] mb-2">
                    Senha de Acesso
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mecura-neon/50 transition-colors"
                    placeholder="Digite sua senha"
                    autoFocus
                  />
                  {loginError && (
                    <p className="text-red-400 text-sm mt-2">{loginError}</p>
                  )}
                </div>

                <Button 
                  className="w-full mt-4"
                  onClick={handleLogin}
                  disabled={!password}
                >
                  Entrar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
