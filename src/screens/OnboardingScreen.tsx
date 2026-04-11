import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Switch } from '../components/ui/Switch';
import { useStore } from '../store/useStore';
import { ChevronLeft, Check, Info } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// --- CONSTANTS ---
const OBJECTIVES_MAIN = [
  { id: 'sono', title: 'Melhora do Sono', desc: 'Ajuda para dormir e manter o descanso.' },
  { id: 'calma', title: 'Equilíbrio emocional', desc: 'Controle da agitação e do nervosismo diário.' },
  { id: 'foco', title: 'Aumento do Foco', desc: 'Mais concentração nas suas atividades.' },
  { id: 'estresse', title: 'Menos Estresse', desc: 'Melhora do estresse e exaustão diária.' },
  { id: 'ansiedade', title: 'Controle da Ansiedade', desc: 'Busca por mais equilíbrio emocional.' },
  { id: 'dor', title: 'Dor Crônica', desc: 'Alívio de dores constantes.' },
  { id: 'esporte', title: 'Melhora no Esporte', desc: 'Mais energia e menos fadiga muscular.' },
  { id: 'libido', title: 'Aumento da Libido', desc: 'Recupere a sensação de prazer.' },
  { id: 'enxaqueca', title: 'Enxaqueca', desc: 'Alívio para dores de cabeça fortes.' },
  { id: 'tpm', title: 'Controle da TPM', desc: 'Controle para mudanças de humor e irritação.' },
];

const OBJECTIVES_OTHER = [
  'TDAH', 'Depressão', 'Fibromialgia', 'Parkinson', 'Burnout', 'Epilepsia',
  'Alzheimer', 'Redução de Vícios', 'Autismo (TEA)', 'Obesidade', 'Bruxismo',
  'Menopausa', 'Câncer (suporte)', 'Esclerose Múltipla', 'Asma', 'Demência',
  'Glaucoma', 'Cuidados Paliativos', 'Anorexia', 'Outros'
];

const SOCIAL_QUESTIONS = [
  { id: 'casado', label: 'Você é casado?' },
  { id: 'filhos', label: 'Você tem filhos?' },
  { id: 'aborto', label: 'Passou por aborto?' },
  { id: 'trabalha', label: 'Você trabalha?' },
  { id: 'estuda', label: 'Você estuda?' },
  { id: 'exercicio', label: 'Pratica atividades físicas?' },
];

const HEALTH_QUESTIONS = [
  { id: 'tratamento_atual', label: 'Atualmente, faz algum tratamento?', hasDetails: true },
  { id: 'remedios', label: 'Faz uso frequente de remédios?', hasDetails: true },
  { id: 'doenca_cronica', label: 'Possui alguma doença crônica?', hasDetails: true },
  { id: 'cirurgia', label: 'Já fez alguma cirurgia?', hasDetails: true },
  { id: 'alergia', label: 'Possui alguma alergia?', hasDetails: true },
  { id: 'digestivo', label: 'Tem problemas digestivos?', hasDetails: true },
  { id: 'evacuar', label: 'Tem dificuldades para evacuar?', hasDetails: true },
  { id: 'urinar', label: 'Tem dificuldades para urinar?', hasDetails: true },
  { id: 'dor_cabeca', label: 'Tem dores de cabeças intensas?', hasDetails: true },
  { id: 'alimentacao', label: 'Possui problemas com alimentação?', hasDetails: true },
  { id: 'cansado', label: 'Acorda cansado?' },
  { id: 'fuma', label: 'Você fuma?', hasDetails: true },
  { id: 'bebida', label: 'Faz uso de bebida alcoólica?', hasDetails: true },
  { id: 'cannabis', label: 'Já usou cannabis (maconha)?', hasDetails: true },
  { id: 'arritmia', label: 'Possui arritmia cardíaca?', hasDetails: true },
  { id: 'psicose_hist', label: 'Histórico de psicose, esquizofrenia?', hasDetails: true },
];

const EMOTIONAL_QUESTIONS = [
  { id: 'tristeza', label: 'Sente muita tristeza?' },
  { id: 'foco', label: 'Perde o foco facilmente?' },
  { id: 'memoria', label: 'Tem problemas de memória?' },
  { id: 'irritado', label: 'Fica facilmente irritado ou triste?' },
  { id: 'estresse', label: 'Possui problemas com estresse?' },
  { id: 'panico', label: 'Já teve episódios de pânico?', hasDetails: true },
  { id: 'esquizofrenia_diag', label: 'Já recebeu diagnóstico de esquizofrenia ou psicose?', hasDetails: true },
  { id: 'esquizofrenia_parente', label: 'Algum parente próximo tem esquizofrenia ou psicose?', hasDetails: true },
  { id: 'ansiedade_diag', label: 'Já teve diagnóstico de ansiedade ou depressão?', hasDetails: true },
];

const STEPS = [
  { id: 'auth', title: 'Acesse ou Crie sua Conta', subtitle: 'Para salvar seu histórico e personalizar sua experiência.' },
  { id: 'name', title: 'Como podemos te chamar?', subtitle: 'Vamos personalizar sua experiência.' },
  { id: 'objective', title: 'Selecione os objetivos que busca com o tratamento', subtitle: 'Você pode selecionar quantas opções quiser.' },
  { id: 'objective_details', title: 'Agora sobre os motivos selecionados:', subtitle: 'Detalhe um pouco mais para o médico.' },
  { id: 'physical', title: 'Informações sobre suas características físicas:', subtitle: 'Dados importantes para dosagem.' },
  { id: 'social', title: 'Sobre a sua vida social:', subtitle: 'Responda com muita atenção.', warning: true },
  { id: 'health', title: 'Sobre a sua saúde:', subtitle: 'Responda com muita atenção.', warning: true },
  { id: 'emotional', title: 'Sobre o seu estado emocional atual:', subtitle: 'Responda com muita atenção.', warning: true },
];

  export function OnboardingScreen() {
    const navigate = useNavigate();
    const { 
      userName, setUserName, 
      userEmail, setUserEmail,
      userPhone, setUserPhone,
      setOnboardingStep, setHasCompletedOnboarding, incrementStreak, answers, setAnswer 
    } = useStore();
    const [currentStep, setCurrentStep] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Auth state
    const [isLogin, setIsLogin] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  
    const progress = ((currentStep + 1) / STEPS.length) * 100;
    const step = STEPS[currentStep];
  
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, [currentStep]);
  
    const handleNext = async () => {
      if (step.id === 'auth') {
        if (!userEmail || !password) {
          setAuthError('Preencha email e senha.');
          return;
        }
        setIsLoading(true);
        setAuthError('');
        try {
          if (isLogin) {
            const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
            // Check if user has completed onboarding
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.name) setUserName(data.name);
              if (data.phone) setUserPhone(data.phone);
              if (data.answers) {
                // Load answers into store
                Object.entries(data.answers).forEach(([key, value]) => {
                  setAnswer(key, value);
                });
              }
              
              if (data.hasCompletedOnboarding) {
                setHasCompletedOnboarding(true);
                navigate('/dashboard');
                return;
              }
            }
          } else {
            await createUserWithEmailAndPassword(auth, userEmail, password);
          }
          setCurrentStep(prev => prev + 1);
          setOnboardingStep(currentStep + 1);
        } catch (error: any) {
          console.error(error);
          if (error.code === 'auth/email-already-in-use') {
            setAuthError('Email já cadastrado. Tente fazer login.');
          } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            setAuthError('Email ou senha incorretos.');
          } else if (error.code === 'auth/weak-password') {
            setAuthError('A senha deve ter pelo menos 6 caracteres.');
          } else if (error.code === 'auth/operation-not-allowed') {
            setAuthError('Login por email/senha não está ativado no Firebase.');
          } else {
            setAuthError(`Ocorreu um erro: ${error.message || 'Tente novamente.'}`);
          }
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        setOnboardingStep(currentStep + 1);
      } else {
        // Save to Firestore on complete
        if (auth.currentUser) {
          try {
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
              name: userName,
              email: userEmail,
              phone: userPhone,
              hasCompletedOnboarding: true,
              answers: answers,
              createdAt: new Date().toISOString()
            }, { merge: true });
          } catch (e) {
            console.error("Error saving user data", e);
          }
        }
        setHasCompletedOnboarding(true);
        incrementStreak();
        navigate('/analysis');
      }
    };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/');
    }
  };

  const toggleObjective = (objective: string) => {
    const current = answers.objectives || [];
    if (current.includes(objective)) {
      setAnswer('objectives', current.filter((o: string) => o !== objective));
    } else {
      setAnswer('objectives', [...current, objective]);
    }
  };

  const setBooleanAnswer = (id: string, value: boolean) => {
    setAnswer(id, value);
  };

  const isNextDisabled = () => {
    if (step.id === 'auth') {
      return !userEmail || !password || isLoading;
    }
    if (step.id === 'name') {
      return userName.trim().length < 2 || userPhone.trim().length < 10;
    }
    if (step.id === 'objective') return (answers.objectives || []).length === 0;
    if (step.id === 'physical') return !answers.height || !answers.weight || !answers.sex;
    return false;
  };

  const renderBooleanList = (questions: {id: string, label: string, hasDetails?: boolean}[]) => (
    <div className="flex flex-col gap-3">
      {questions.map((q) => {
        const isChecked = !!answers[q.id];
        return (
          <div key={q.id} className="flex flex-col gap-3 p-4 rounded-xl bg-mecura-surface border border-mecura-elevated transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-mecura-pearl text-sm pr-4 font-medium">{q.label}</span>
              <Switch 
                checked={isChecked} 
                onChange={(val) => setBooleanAnswer(q.id, val)} 
              />
            </div>
            
            {isChecked && q.hasDetails && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <textarea
                  placeholder="Descreva mais detalhes aqui..."
                  value={answers[`${q.id}_details`] || ''}
                  onChange={(e) => setAnswer(`${q.id}_details`, e.target.value)}
                  className="w-full h-24 rounded-lg bg-mecura-bg border border-mecura-elevated p-3 text-sm text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:border-mecura-neon resize-none transition-colors"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center p-6 pb-2 bg-mecura-bg z-10">
        <button onClick={handleBack} className="w-10 h-10 rounded-full bg-mecura-surface flex items-center justify-center text-mecura-silver hover:text-mecura-pearl transition-colors border border-mecura-elevated">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 px-6">
          <ProgressBar progress={progress} />
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-4" ref={scrollRef}>
        <div className="flex flex-col pb-24">
          <h2 className="text-3xl font-serif font-semibold text-mecura-pearl mb-2">
            {step.title}
          </h2>
          
          <div className={`flex items-center gap-2 mb-8 ${step.warning ? 'text-mecura-neon' : 'text-mecura-silver'}`}>
            {step.warning && <Info className="w-4 h-4" />}
            <p>{step.subtitle}</p>
          </div>

          {/* Step: Auth */}
          {step.id === 'auth' && (
            <div className="space-y-4">
              <div className="flex bg-mecura-surface border border-mecura-elevated rounded-xl p-1 mb-6">
                <button
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isLogin ? 'bg-mecura-neon text-[#0A0A0F]' : 'text-mecura-silver hover:text-mecura-pearl'}`}
                  onClick={() => { setIsLogin(false); setAuthError(''); }}
                >
                  Criar Conta
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isLogin ? 'bg-mecura-neon text-[#0A0A0F]' : 'text-mecura-silver hover:text-mecura-pearl'}`}
                  onClick={() => { setIsLogin(true); setAuthError(''); }}
                >
                  Fazer Login
                </button>
              </div>

              <Input 
                placeholder="Seu melhor e-mail" 
                value={userEmail} 
                onChange={(e) => setUserEmail(e.target.value)} 
                type="email" 
                autoCapitalize="none"
              />
              <Input 
                placeholder="Sua senha" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
              />
              
              {authError && (
                <p className="text-red-400 text-sm mt-2">{authError}</p>
              )}
            </div>
          )}

          {/* Step: Name */}
          {step.id === 'name' && (
            <div className="space-y-4">
              <Input autoFocus placeholder="Seu nome completo" value={userName} onChange={(e) => setUserName(e.target.value)} />
              <Input placeholder="Seu número de contato (com DDD)" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} type="tel" />
            </div>
          )}

          {/* Step: Objective (Sleek Multi-select Rows) */}
          {step.id === 'objective' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-mecura-neon font-bold mb-4 text-lg">Objetivos Mais Procurados</h3>
                <div className="flex flex-col gap-3">
                  {OBJECTIVES_MAIN.map(obj => {
                    const isSelected = (answers.objectives || []).includes(obj.title);
                    return (
                      <button
                        key={obj.id}
                        onClick={() => toggleObjective(obj.title)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-mecura-neon/10 border-mecura-neon shadow-[0_0_15px_rgba(166,255,0,0.1)]' 
                            : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-silver'
                        }`}
                      >
                        <div className="text-left pr-4">
                          <h4 className={`font-bold text-lg ${isSelected ? 'text-mecura-neon' : 'text-mecura-pearl'}`}>{obj.title}</h4>
                          <p className="text-xs text-mecura-silver mt-1">{obj.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-mecura-neon border-mecura-neon' : 'border-mecura-elevated'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-[#0A0A0F]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-mecura-neon font-bold mb-4 text-lg">Outros Motivos</h3>
                <div className="flex flex-wrap gap-2">
                  {OBJECTIVES_OTHER.map(opt => {
                    const isSelected = (answers.objectives || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleObjective(opt)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${
                          isSelected 
                            ? 'bg-mecura-neon text-[#0A0A0F] border-mecura-neon font-bold' 
                            : 'bg-mecura-surface border-mecura-elevated text-mecura-silver hover:border-mecura-silver'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Disclaimers */}
              <div className="pt-8 pb-4 space-y-6">
                <h4 className="text-center text-sm font-bold text-mecura-pearl tracking-widest uppercase">Informações Importantes</h4>
                <div className="space-y-4 text-xs text-mecura-silver text-center leading-relaxed px-2">
                  <p>Tratamentos com fitocanabinoides não são destinados ao uso recreativo nem à "cura imediata" de doenças. Pessoas grávidas, amamentando ou tentando engravidar não devem realizar esses tratamentos sem orientação expressa do médico.</p>
                  <p>Não interrompa nem substitua tratamentos em andamento sem falar com seu médico. As opções acima servem apenas para organizar sua queixa principal e apoiar a avaliação clínica.</p>
                  <p>A avaliação e a prescrição, quando indicadas, são feitas exclusivamente por profissionais habilitados, conforme normas da ANVISA.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step: Objective Details */}
          {step.id === 'objective_details' && (
            <div className="space-y-8">
              <div className="p-4 rounded-xl bg-mecura-surface border border-mecura-elevated">
                <p className="text-sm text-mecura-silver mb-1">Objetivos selecionados:</p>
                <p className="text-mecura-neon font-bold">{(answers.objectives || []).join(', ') || 'Nenhum'}</p>
              </div>

              <div className="space-y-4">
                <label className="text-mecura-pearl font-bold">1. Qual é a intensidade dos sintomas?</label>
                <div className="flex items-center gap-4">
                  <span className="text-mecura-silver text-sm font-bold">0</span>
                  <input 
                    type="range" min="0" max="10" 
                    value={answers.intensity || 5}
                    onChange={(e) => setAnswer('intensity', e.target.value)}
                    className="flex-1 h-1 bg-mecura-surface-light rounded-lg appearance-none cursor-pointer accent-mecura-neon"
                  />
                  <span className="text-mecura-neon font-bold">{answers.intensity || 5}</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-mecura-pearl font-bold">2. Há quanto tempo sente?</label>
                <select 
                  value={answers.duration || ''}
                  onChange={(e) => setAnswer('duration', e.target.value)}
                  className="w-full h-14 rounded-xl border border-mecura-elevated bg-mecura-surface-light px-4 text-mecura-pearl focus:outline-none focus:border-mecura-neon appearance-none font-medium"
                >
                  <option value="" disabled>Selecione</option>
                  <option value="dias">Alguns dias</option>
                  <option value="semanas">Semanas</option>
                  <option value="meses">Meses</option>
                  <option value="anos">Anos</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-mecura-pearl font-bold">3. Se houver, descreva mais informações:</label>
                <p className="text-xs text-mecura-silver">Histórico familiar, frequência que sente, tratamentos atuais, etc.</p>
                <textarea 
                  value={answers.description || ''}
                  onChange={(e) => setAnswer('description', e.target.value)}
                  placeholder="Use esse campo para descrever (Opcional)"
                  className="w-full h-32 rounded-xl border border-mecura-elevated bg-mecura-surface-light p-4 text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:border-mecura-neon resize-none"
                />
              </div>
            </div>
          )}

          {/* Step: Physical */}
          {step.id === 'physical' && (
            <div className="space-y-6">
              <Input 
                type="number" 
                label="Altura (m)" 
                placeholder="Ex: 1.75" 
                value={answers.height || ''}
                onChange={(e) => setAnswer('height', e.target.value)}
              />
              <Input 
                type="number" 
                label="Peso (kg)" 
                placeholder="Ex: 70" 
                value={answers.weight || ''}
                onChange={(e) => setAnswer('weight', e.target.value)}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-mecura-silver ml-1">Sexo Biológico</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant={answers.sex === 'M' ? 'primary' : 'outline'}
                    onClick={() => setAnswer('sex', 'M')}
                  >
                    Masculino
                  </Button>
                  <Button 
                    variant={answers.sex === 'F' ? 'primary' : 'outline'}
                    onClick={() => setAnswer('sex', 'F')}
                  >
                    Feminino
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Social */}
          {step.id === 'social' && renderBooleanList(SOCIAL_QUESTIONS)}

          {/* Step: Health */}
          {step.id === 'health' && renderBooleanList(HEALTH_QUESTIONS)}

          {/* Step: Emotional */}
          {step.id === 'emotional' && renderBooleanList(EMOTIONAL_QUESTIONS)}

        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-mecura-bg via-mecura-bg to-transparent z-10">
        <Button 
          className="w-full shadow-lg shadow-mecura-neon/20" 
          size="lg"
          onClick={handleNext}
          disabled={isNextDisabled()}
        >
          {isLoading ? 'Aguarde...' : (currentStep === STEPS.length - 1 ? 'Finalizar Avaliação' : 'Próximo')}
        </Button>
      </div>
    </div>
  );
}
