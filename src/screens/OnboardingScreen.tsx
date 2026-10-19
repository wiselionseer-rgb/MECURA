import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Switch } from '../components/ui/Switch';
import { useStore } from '../store/useStore';
import { useAdminStore } from '../store/useAdminStore';
import { ChevronLeft, CheckCircle, Check, Info, Calendar, User, Phone, CreditCard, Building2, Globe, Sparkles } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { PasswordResetCpfModal } from '../components/PasswordResetCpfModal';
import { cbdGuideData, CBDCategory } from '../data/cbdGuide';
import { getRegisteredManufacturers, mergeProductCatalogs, subscribeToFirestoreCatalog } from '../utils/productCatalog';

// --- HELPERS DE FORMATAÇÃO ---
const formatBirthDate = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpf = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

// --- CONSTANTS ---
const OBJECTIVES_MAIN = [
  { id: 'ansiedade', title: 'Ansiedade, Estresse e Transtornos Mentais', desc: 'Ansiedade, Depressão, Estresse, Burnout, TDAH e distúrbios do humor.' },
  { id: 'dor', title: 'Dor Crônica e Inflamação', desc: 'Dor Crônica, Enxaqueca, Fibromialgia, Artrite/Artrose, Hérnia de Disco, Esclerose Múltipla, Asma e Glaucoma.' },
  { id: 'sono', title: 'Insônia e Distúrbios do Sono', desc: 'Insônia, Bruxismo, Síndrome das Pernas Inquietas e agitação noturna.' },
  { id: 'energia', title: 'Energia, Foco e Metabolismo', desc: 'Burnout, Obesidade, Melhora no Esporte, Foco, Disposição e controle metabólico.' },
  { id: 'mulher', title: 'Saúde da Mulher', desc: 'TPM, Menopausa, Endometriose, Equilíbrio hormonal e alívio de cólicas.' },
  { id: 'gastro', title: 'Gastrointestinal', desc: 'Doença de Crohn, Colite, Anorexia, Modulação da inflamação intestinal.' },
  { id: 'neuro', title: 'Doenças Neurodegenerativas', desc: 'Parkinson, Alzheimer, Demência e idosos.' },
  { id: 'epilepsia', title: 'Epilepsia e Convulsões Refratárias', desc: 'Controle de crises convulsivas e epilepsia.' },
  { id: 'tea', title: 'Transtorno do Espectro Autista (TEA)', desc: 'Autismo (TEA), regulação sensorial e comportamental.' },
  { id: 'dermato', title: 'Dermatologia', desc: 'Psoríase, Dermatite, controle da inflamação cutânea e alívio do prurido.' },
  { id: 'vicios', title: 'Redução de Vícios e Danos', desc: 'Controle de fissuras (craving) na retirada de medicamentos e vícios.' },
  { id: 'onco', title: 'Oncologia e Cuidados Paliativos', desc: 'Suporte no câncer, cuidados paliativos, dor oncológica e náuseas.' }
];

const OBJECTIVES_OTHER = [
  'TDAH',
  'Autismo (TEA)',
  'Parkinson',
  'Alzheimer',
  'Epilepsia',
  'Fibromialgia',
  'Depressão',
  'Enxaqueca',
  'Endometriose',
  'Artrose / Artrite',
  'Doença de Crohn',
  'Esclerose Múltipla',
  'Glaucoma',
  'Psoríase',
  'Burnout',
  'Outros'
];

const SOCIAL_QUESTIONS = [
  { id: 'casado', label: 'Você é casado?' },
  { id: 'filhos', label: 'Você tem filhos?' },
  { id: 'aborto', label: 'Passou por aborto?' },
  { id: 'trabalha', label: 'Você trabalha?' },
  { id: 'estuda', label: 'Você estuda?' },
  { id: 'exercicio', label: 'Pratica atividades físicas?' },
];

const DRIVING_QUESTIONS = [
  { id: 'dirige', label: 'Você dirige veículos automotores regularmente? (Carro, moto, etc)', hasDetails: true },
  { id: 'maquinario', label: 'Opera maquinário pesado ou realiza atividades de risco?', hasDetails: true },
  { id: 'blitz', label: 'Passa frequentemente por fiscalizações (ex: lei do drogômetro)?' },
  { id: 'laudo_psicomotor', label: 'Deseja solicitar o Laudo Psicomotor (disponível apenas na Consulta Premium)?' }
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
  { id: 'name', title: 'Dados do Paciente', subtitle: 'Preencha seus dados para seu cadastro e emissão da receita médica.' },
  { id: 'objective', title: 'Selecione os objetivos que busca com o tratamento', subtitle: 'Você pode selecionar quantas opções quiser.' },
  { id: 'objective_details', title: 'Agora sobre os motivos selecionados:', subtitle: 'Detalhe um pouco mais para o médico.' },
  { id: 'brand_preference', title: 'Preferência de Marca ou Associação', subtitle: 'Selecione abaixo para o médico já receber na sua ficha clínica.' },
  { id: 'physical', title: 'Informações sobre suas características físicas:', subtitle: 'Dados importantes para dosagem.' },
  { id: 'driving', title: 'Condução de Veículos e Riscos', subtitle: 'Importante para a nova Lei do Drogômetro e emissão do Laudo Psicomotor.' },
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
      userCpf, setUserCpf,
      userBirthDate, setUserBirthDate,
      setOnboardingStep, setHasCompletedOnboarding, incrementStreak, answers, setAnswer, reset,
      setPagamentoConsulta, setPagamentoPremium, inQueue, consultationActive
    } = useStore();
    const storeProductCategories = useAdminStore((state) => state.productCategories);
    const [currentStep, setCurrentStep] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [cloudCategories, setCloudCategories] = useState<CBDCategory[]>([]);
    const [manufacturerFilterTab, setManufacturerFilterTab] = useState<'all' | 'nacional' | 'importado'>('all');

    useEffect(() => {
      const unsub = subscribeToFirestoreCatalog((cats) => {
        if (cats && cats.length > 0) setCloudCategories(cats);
      });
      return () => unsub();
    }, []);

    const registeredManufacturers = useMemo(() => {
      const merged = mergeProductCatalogs(cbdGuideData, storeProductCategories, cloudCategories);
      return getRegisteredManufacturers(merged);
    }, [storeProductCategories, cloudCategories]);

    const nationalManufacturers = useMemo(
      () => registeredManufacturers.filter(m => m.origin === 'Nacional'),
      [registeredManufacturers]
    );
    const importedManufacturers = useMemo(
      () => registeredManufacturers.filter(m => m.origin === 'Importado'),
      [registeredManufacturers]
    );

    const togglePreferredManufacturer = (item: ReturnType<typeof getRegisteredManufacturers>[number]) => {
      const currentList: string[] = Array.isArray(answers.preferredBrands) ? answers.preferredBrands : [];
      const exists = currentList.includes(item.name);
      const nextList = exists
        ? currentList.filter(n => n !== item.name)
        : [...currentList, item.name];

      setAnswer('preferredBrands', nextList);

      // Update national / imported preference codes for the Doctor Dashboard
      const selectedObjects = registeredManufacturers.filter(m => nextList.includes(m.name));
      const natMatch = selectedObjects.find(m => m.origin === 'Nacional' && m.nationalCode);
      const impMatch = selectedObjects.find(m => m.origin === 'Importado' && m.importedCode);

      setAnswer('preferredNationalAssociation', natMatch?.nationalCode || '');
      setAnswer('preferredImportedBrand', impMatch?.importedCode || '');

      if (nextList.length > 0 && (!answers.preferredTreatmentStatus || answers.preferredTreatmentStatus === 'sem_preferencia')) {
        setAnswer('preferredTreatmentStatus', 'pretende_fazer');
      }
    };

    // Auth state
    const [isLogin, setIsLogin] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showExistingAccountPrompt, setShowExistingAccountPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  
    const progress = ((currentStep + 1) / STEPS.length) * 100;
    const step = STEPS[currentStep];
  
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, [currentStep]);
    
    useEffect(() => {
      // Se já estiver logado (ou store tiver dados), pré-preenche dados e avança para etapa de triagem
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user && currentStep === 0) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.name && !userName) setUserName(data.name);
              if (data.email && !userEmail) setUserEmail(data.email);
              if (data.phone && !userPhone) setUserPhone(data.phone);
              if (data.cpf && !userCpf) setUserCpf(data.cpf);
              if (data.birthDate && !userBirthDate) setUserBirthDate(data.birthDate);
              if (data.answers) {
                Object.entries(data.answers).forEach(([key, value]) => {
                  setAnswer(key, value);
                });
                if (data.answers.birthDate && !data.birthDate) setUserBirthDate(data.answers.birthDate);
                if (data.answers.cpf && !data.cpf) setUserCpf(data.answers.cpf);
                if (data.answers.phone && !data.phone) setUserPhone(data.answers.phone);
              }

              // Restore payment state only if user has an active, unfinished paid consultation
              const isAwaitingOrFinished = (
                data.consultationStatus === 'awaiting_payment' ||
                data.consultationStatus === 'not_started' ||
                data.consultationStatus === 'finished' ||
                data.isConsultationFinished === true
              );
              if (!isAwaitingOrFinished && (data.pagamento_consulta === true || data.hasPaid === true || data.isPaid === true)) {
                setPagamentoConsulta(true);
                if (typeof window !== 'undefined') localStorage.setItem('mecura_pagamento', 'true');
              } else {
                setPagamentoConsulta(false);
                if (typeof window !== 'undefined') localStorage.removeItem('mecura_pagamento');
              }
              if (!isAwaitingOrFinished && (data.pagamento_premium === true || data.isPremium === true || data.plan === 'premium' || data.plan === 'complete')) {
                setPagamentoPremium(true);
                if (typeof window !== 'undefined') localStorage.setItem('mecura_premium', 'true');
              } else {
                setPagamentoPremium(false);
                if (typeof window !== 'undefined') localStorage.removeItem('mecura_premium');
              }
            }
          } catch (err) {
            console.warn('[ONBOARDING] Error loading user doc:', err);
          }
          setCurrentStep(1);
          setOnboardingStep(1);
        }
      });
      return () => unsubscribe();
    }, [currentStep, setOnboardingStep, setUserName, setUserEmail, setUserPhone, setUserCpf, setUserBirthDate, setAnswer, userName, userEmail, userPhone, userCpf, userBirthDate, setPagamentoConsulta, setPagamentoPremium]);

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
            const trimmedEmail = userEmail.trim();
            let resolvedUid: string | null = null;
            let resolvedUserData: any = null;

            try {
              const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
              resolvedUid = userCredential.user.uid;
              const uDoc = await getDoc(doc(db, 'users', resolvedUid));
              if (uDoc.exists()) {
                resolvedUserData = uDoc.data();
              }
            } catch (authErr: any) {
              // Fallback: If Firebase Auth password fails, verify if patient reset password via CPF in Firestore
              const usersRef = collection(db, 'users');
              const qSnap = await getDocs(query(usersRef, where('email', '==', trimmedEmail)));
              let matchedDoc = qSnap.docs.find(d => d.data().password === password);
              if (!matchedDoc) {
                const lowerEmail = trimmedEmail.toLowerCase();
                const allUsersSnap = await getDocs(usersRef);
                matchedDoc = allUsersSnap.docs.find(d => 
                  (d.data().email || '').toLowerCase().trim() === lowerEmail && d.data().password === password
                );
              }

              if (matchedDoc) {
                resolvedUid = matchedDoc.id;
                resolvedUserData = matchedDoc.data();
              } else {
                throw authErr;
              }
            }

            if (resolvedUid && resolvedUserData) {
              const data = resolvedUserData;
              if (data.name && typeof data.name === 'string' && data.name.trim().toLowerCase() !== 'paciente') {
                setUserName(data.name.trim());
                if (typeof window !== 'undefined') localStorage.setItem('mecura_patient_name', data.name.trim());
              }
              if (data.phone) setUserPhone(data.phone);
              if (data.cpf) setUserCpf(data.cpf);
              if (data.birthDate) setUserBirthDate(data.birthDate);
              if (data.answers) {
                Object.entries(data.answers).forEach(([key, value]) => {
                  setAnswer(key, value);
                });
                if (data.answers.birthDate && !data.birthDate) setUserBirthDate(data.answers.birthDate);
                if (data.answers.cpf && !data.cpf) setUserCpf(data.answers.cpf);
                if (data.answers.phone && !data.phone) setUserPhone(data.answers.phone);
              }

              if (typeof window !== 'undefined') {
                localStorage.setItem('mecura_patientId', resolvedUid);
              }
              useStore.setState({ patientId: resolvedUid });

              // Restore payment state only if consultation is active/waiting (not finished or awaiting new payment)
              const isAwaitingOrFinished = (
                data.consultationStatus === 'awaiting_payment' ||
                data.consultationStatus === 'not_started' ||
                data.consultationStatus === 'finished' ||
                data.isConsultationFinished === true
              );
              if (!isAwaitingOrFinished && (data.pagamento_consulta === true || data.hasPaid === true || data.isPaid === true)) {
                setPagamentoConsulta(true);
                if (typeof window !== 'undefined') localStorage.setItem('mecura_pagamento', 'true');
              } else {
                setPagamentoConsulta(false);
                if (typeof window !== 'undefined') localStorage.removeItem('mecura_pagamento');
              }
              if (!isAwaitingOrFinished && (data.pagamento_premium === true || data.isPremium === true || data.plan === 'premium' || data.plan === 'complete')) {
                setPagamentoPremium(true);
                if (typeof window !== 'undefined') localStorage.setItem('mecura_premium', 'true');
              } else {
                setPagamentoPremium(false);
                if (typeof window !== 'undefined') localStorage.removeItem('mecura_premium');
              }
              
              if (data.hasCompletedOnboarding || data.pagamento_consulta || data.hasPaid || data.isConsultationFinished || data.consultationStatus === 'finished') {
                setHasCompletedOnboarding(true);
                setShowExistingAccountPrompt(true);
                setIsLoading(false);
                return;
              }
            }
          } else {
            const trimmedEmail = userEmail.trim();
            const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
            try {
              await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: trimmedEmail,
                password: password,
                hasCompletedOnboarding: false,
                pagamento_consulta: false,
                pagamento_premium: false,
                hasPaid: false,
                isPaid: false,
                inQueue: false,
                consultationStatus: 'not_started',
                createdAt: new Date().toISOString(),
                tier: 'basic'
              }, { merge: true });

              // Reset any stale payment state from localStorage/store
              setPagamentoConsulta(false);
              setPagamentoPremium(false);
              useStore.setState({ inQueue: false, consultationActive: false, isConsultationFinished: false });
              if (typeof window !== 'undefined') {
                localStorage.setItem('mecura_patientId', userCredential.user.uid);
                localStorage.removeItem('mecura_pagamento');
                localStorage.removeItem('mecura_premium');
                localStorage.removeItem('mecura_consultation_active');
                localStorage.removeItem('mecura_queue_display_pos');
                localStorage.removeItem('mecura_queue_entered_at');
                localStorage.removeItem('mecura_queue_notified_10m');
              }
            } catch (e) {
              console.error("Error creating early user data", e);
            }
          }
          setCurrentStep(1);
          setOnboardingStep(1);
        } catch (error: any) {
          console.error(error);
          if (error.code === 'auth/email-already-in-use') {
            setAuthError('Este e-mail já está cadastrado. Clique em "Fazer Login" ou em "Esqueci minha senha" para acessar.');
          } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            setAuthError('E-mail ou senha incorretos. Caso tenha esquecido, clique em "Esqueci minha senha" abaixo.');
          } else if (error.code === 'auth/weak-password') {
            setAuthError('A senha deve ter pelo menos 6 caracteres.');
          } else if (error.code === 'auth/operation-not-allowed') {
            setAuthError('Você precisa ativar o provedor de Email/Senha no console do Firebase.');
          } else if (error.code === 'auth/invalid-email') {
            setAuthError('O formato do email é inválido. Verifique se há espaços extras.');
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
        setIsLoading(true);
        // Completing a triage (for both new and returning patients) requires a new consultation payment
        setPagamentoConsulta(false);
        setPagamentoPremium(false);
        useStore.setState({
          pagamento_consulta: false,
          pagamento_premium: false,
          inQueue: false,
          consultationActive: false,
          isConsultationFinished: false,
          consultationStatus: 'pending'
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mecura_pagamento');
          localStorage.removeItem('mecura_premium');
          localStorage.removeItem('mecura_consultation_active');
          localStorage.removeItem('mecura_consultation_finished');
          localStorage.removeItem('mecura_queue_display_pos');
          localStorage.removeItem('mecura_queue_entered_at');
          localStorage.removeItem('mecura_queue_notified_10m');
        }

        try {
          const targetUid = auth.currentUser?.uid || localStorage.getItem('mecura_patientId') || undefined;
          if (targetUid) {
            const nowIso = new Date().toISOString();
            const updatePayload: Record<string, any> = {
              hasCompletedOnboarding: true,
              pagamento_consulta: false,
              pagamento_premium: false,
              isPremium: false,
              plan: 'basic',
              selectedOffer: 'basic',
              tier: 'basic',
              hasPaid: false,
              isPaid: false,
              bypassedPayment: false,
              inQueue: false,
              consultationActive: false,
              isConsultationFinished: false,
              consultationStatus: 'awaiting_payment',
              lastTriageAt: nowIso,
              answers: {
                ...answers,
                birthDate: userBirthDate,
                cpf: userCpf,
                phone: userPhone
              },
              lastUpdated: nowIso
            };

            if (userName && userName.trim() && userName.trim().toLowerCase() !== 'paciente') {
              updatePayload.name = userName.trim();
              if (typeof window !== 'undefined') localStorage.setItem('mecura_patient_name', userName.trim());
            }
            if (userEmail && !userEmail.includes('sem-email')) {
              updatePayload.email = userEmail.trim();
            }
            if (userPhone && userPhone.trim()) updatePayload.phone = userPhone.trim();
            if (userCpf && userCpf.trim()) updatePayload.cpf = userCpf.trim();
            if (userBirthDate && userBirthDate.trim()) updatePayload.birthDate = userBirthDate.trim();

            await setDoc(doc(db, 'users', targetUid), updatePayload, { merge: true });
          }
        } catch (e) {
          console.warn('[ONBOARDING] Error saving final screening data:', e);
        } finally {
          setIsLoading(false);
          setHasCompletedOnboarding(true);
          incrementStreak();
          navigate('/analysis');
        }
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
      const cleanCpf = (userCpf || '').replace(/\D/g, '');
      const cleanBirth = (userBirthDate || '').replace(/\D/g, '');
      const cleanPhone = (userPhone || '').replace(/\D/g, '');
      return (userName || '').trim().length < 2 || cleanBirth.length < 8 || cleanPhone.length < 10 || cleanCpf.length < 11;
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
                  placeholder={
                    q.id === 'remedios' || q.id === 'tratamento_atual' 
                      ? "Descreva mais detalhes aqui (nome do medicamento, dosagem e quantas vezes ao dia)..."
                      : "Descreva mais detalhes aqui..."
                  }
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
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col pb-24"
          >
            <h2 className="text-3xl font-serif font-semibold text-mecura-pearl mb-2">
              {step.title}
            </h2>
          
          <div className={`flex items-center gap-2 ${step.id === 'brand_preference' ? 'mb-4' : 'mb-8'} ${step.warning ? 'text-mecura-neon' : 'text-mecura-silver'}`}>
            {step.warning && <Info className="w-4 h-4" />}
            <p className="text-sm leading-relaxed">{step.subtitle}</p>
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
                onChange={(e) => { setUserEmail(e.target.value); setAuthError(''); }} 
                type="email" 
                autoCapitalize="none"
              />
              <Input 
                placeholder="Sua senha" 
                value={password} 
                onChange={(e) => { setPassword(e.target.value); setAuthError(''); }} 
                type="password" 
              />
              
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-[#8A8A9E]">
                    {isLogin ? 'Esqueceu sua senha de acesso?' : 'Já possui conta mas esqueceu a senha?'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                    }} 
                    className="text-xs font-semibold text-mecura-neon hover:underline"
                  >
                    Esqueci / Trocar Senha
                  </button>
                </div>
              
              {authError && (
                <p className="text-red-400 text-sm mt-2">{authError}</p>
              )}
            </div>
          )}

          {/* Step: Name */}
          {step.id === 'name' && (
            <div className="space-y-4">
              <Input 
                autoFocus 
                label="Nome Completo"
                icon={<User className="w-5 h-5" />}
                placeholder="Ex: Carlos Eduardo da Silva" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
              />

              <Input 
                label="Data de Nascimento"
                icon={<Calendar className="w-5 h-5" />}
                placeholder="DD/MM/AAAA" 
                value={userBirthDate} 
                onChange={(e) => {
                  const formatted = formatBirthDate(e.target.value);
                  setUserBirthDate(formatted);
                  setAnswer('birthDate', formatted);
                }} 
                type="text"
                inputMode="numeric"
                maxLength={10}
              />

              <Input 
                label="CPF"
                icon={<CreditCard className="w-5 h-5" />}
                placeholder="000.000.000-00" 
                value={userCpf} 
                onChange={(e) => {
                  const formatted = formatCpf(e.target.value);
                  setUserCpf(formatted);
                  setAnswer('cpf', formatted);
                }} 
                type="text"
                inputMode="numeric"
                maxLength={14}
              />

              <Input 
                label="WhatsApp / Celular"
                icon={<Phone className="w-5 h-5" />}
                placeholder="(00) 00000-0000" 
                value={userPhone} 
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setUserPhone(formatted);
                  setAnswer('phone', formatted);
                }} 
                type="tel"
                maxLength={15}
              />

              <div className="p-3 bg-mecura-surface/60 border border-mecura-elevated rounded-xl flex items-start gap-2.5 mt-2">
                <Info className="w-4 h-4 text-mecura-neon mt-0.5 flex-shrink-0" />
                <p className="text-xs text-mecura-silver leading-relaxed">
                  Sua <strong className="text-mecura-pearl">Data de Nascimento</strong> e <strong className="text-mecura-pearl">CPF</strong> serão inseridos automaticamente nas suas receitas médicas oficiais.
                </p>
              </div>
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
                <label className="text-mecura-pearl font-bold">3. Como tudo começou? (Resumo da sua condição)</label>
                <p className="text-xs text-mecura-silver">Conte brevemente sobre a origem da sua doença ou problema. Ex: "Tive um acidente que causou a dor nas costas", "Fui diagnosticado há 5 anos", "Começou do nada e foi piorando". Isso é fundamental para o seu laudo.</p>
                <textarea 
                  value={answers.diseaseOrigin || ''}
                  onChange={(e) => setAnswer('diseaseOrigin', e.target.value)}
                  placeholder="Escreva aqui a história do seu problema..."
                  className="w-full h-24 rounded-xl border border-mecura-elevated bg-mecura-surface-light p-4 text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:border-mecura-neon resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-mecura-pearl font-bold">4. Outros detalhes (Opcional):</label>
                <p className="text-xs text-mecura-silver">Histórico familiar, frequência dos sintomas, etc.</p>
                <textarea 
                  value={answers.description || ''}
                  onChange={(e) => setAnswer('description', e.target.value)}
                  placeholder="Use esse campo para descrever mais detalhes se necessário"
                  className="w-full h-20 rounded-xl border border-mecura-elevated bg-mecura-surface-light p-4 text-mecura-pearl placeholder:text-mecura-silver focus:outline-none focus:border-mecura-neon resize-none"
                />
              </div>
            </div>
          )}

          {/* Step: Brand & Association Preference Card */}
          {step.id === 'brand_preference' && (() => {
            const isJaFaz = answers.preferredTreatmentStatus === 'ja_faz' || answers.preferredTreatmentStatus === 'ja_usa';
            const isPretende = answers.preferredTreatmentStatus === 'pretende_fazer' || answers.preferredTreatmentStatus === 'pretende_usar';
            const isSemPref = answers.preferredTreatmentStatus === 'sem_preferencia';
            const selectedBrandsList: string[] = Array.isArray(answers.preferredBrands) ? answers.preferredBrands : [];

            return (
              <div className="space-y-4">
                {/* Main Luxury Glass Container - Pure Black and Fluorescent Green */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-mecura-surface-light via-mecura-surface to-mecura-bg border border-mecura-elevated p-4 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.9)]"
                >
                  {/* Animated Shimmer Top Line (Fluorescent Green) */}
                  <motion.div
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    style={{ backgroundSize: '200% 200%' }}
                    className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-mecura-neon to-transparent"
                  />
                  {/* Floating Ambient Orbs (Fluorescent Green) */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-mecura-neon/20 blur-3xl pointer-events-none"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.14, 0.06] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                    className="absolute top-1/3 -left-20 w-44 h-44 rounded-full bg-mecura-neon/15 blur-3xl pointer-events-none"
                  />

                  {/* Infinite Motion Brand Showcase Ribbon */}
                  <div className="relative z-10 overflow-hidden rounded-2xl bg-mecura-bg/95 border border-mecura-elevated py-2.5 mb-4">
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-mecura-bg to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-mecura-bg to-transparent z-10" />
                    <motion.div
                      animate={{ x: ['0%', '-50%'] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="flex items-center gap-2.5 w-max px-3"
                    >
                      {[...registeredManufacturers, ...registeredManufacturers].map((m, i) => {
                        const isNat = m.origin === 'Nacional';
                        const isSel = selectedBrandsList.some(b => b.toLowerCase() === m.name.toLowerCase());
                        return (
                          <button
                            key={`${m.id}-marquee-${i}`}
                            type="button"
                            onClick={() => togglePreferredManufacturer(m)}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shrink-0 ${
                              isSel
                                ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_14px_rgba(166,255,0,0.5)]'
                                : 'bg-mecura-surface text-mecura-pearl border-mecura-elevated hover:border-mecura-neon/40 hover:text-mecura-neon'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isSel ? 'bg-black' : 'bg-mecura-neon shadow-[0_0_6px_rgba(166,255,0,0.8)]'
                            }`} />
                            <span>{m.name}</span>
                            <span className={`text-[9px] uppercase tracking-wider ${isSel ? 'text-black/80 font-black' : 'text-mecura-silver'}`}>
                              {isNat ? 'BR' : 'EUA'}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  </div>

                  {/* STEP 1: Situação Atual */}
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between px-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-mecura-neon text-black text-[11px] font-black flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(166,255,0,0.4)]">
                          1
                        </span>
                        <label className="text-xs font-extrabold text-white uppercase tracking-wider">
                          Qual é a sua situação atual?
                        </label>
                      </div>
                      <span className="text-[10px] text-mecura-neon font-bold">Passo 1 de 2</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {/* Opção 1: Já faço tratamento */}
                      <motion.button
                        whileHover={{ scale: 1.008 }}
                        whileTap={{ scale: 0.985 }}
                        type="button"
                        onClick={() => setAnswer('preferredTreatmentStatus', 'ja_faz')}
                        className={`w-full px-3.5 py-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 cursor-pointer relative overflow-hidden ${
                          isJaFaz
                            ? 'bg-gradient-to-r from-mecura-neon/20 via-mecura-neon/10 to-mecura-surface border-mecura-neon shadow-[0_0_22px_rgba(166,255,0,0.22)]'
                            : 'bg-mecura-surface/90 border-mecura-elevated hover:border-mecura-neon/40'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isJaFaz
                            ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_14px_rgba(166,255,0,0.5)]'
                            : 'bg-mecura-bg text-mecura-neon border-mecura-elevated'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-extrabold block leading-snug ${isJaFaz ? 'text-mecura-neon' : 'text-white'}`}>
                            Já faço tratamento
                          </span>
                          <p className="text-[11px] text-mecura-silver leading-snug mt-0.5">
                            Já utilizo produtos de uma associação ou marca abaixo
                          </p>
                        </div>
                        <motion.div
                          animate={{ scale: isJaFaz ? 1.08 : 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isJaFaz ? 'bg-mecura-neon border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.5)]' : 'border-mecura-elevated bg-mecura-bg'
                          }`}
                        >
                          {isJaFaz && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </motion.div>
                      </motion.button>

                      {/* Opção 2: Pretendo iniciar / Tenho preferência */}
                      <motion.button
                        whileHover={{ scale: 1.008 }}
                        whileTap={{ scale: 0.985 }}
                        type="button"
                        onClick={() => setAnswer('preferredTreatmentStatus', 'pretende_fazer')}
                        className={`w-full px-3.5 py-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 cursor-pointer relative overflow-hidden ${
                          isPretende
                            ? 'bg-gradient-to-r from-mecura-neon/20 via-mecura-neon/10 to-mecura-surface border-mecura-neon shadow-[0_0_22px_rgba(166,255,0,0.22)]'
                            : 'bg-mecura-surface/90 border-mecura-elevated hover:border-mecura-neon/40'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isPretende
                            ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_14px_rgba(166,255,0,0.5)]'
                            : 'bg-mecura-bg text-mecura-neon border-mecura-elevated'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-extrabold block leading-snug ${isPretende ? 'text-mecura-neon' : 'text-white'}`}>
                            Pretendo iniciar com uma marca
                          </span>
                          <p className="text-[11px] text-mecura-silver leading-snug mt-0.5">
                            Tenho preferência por uma associação ou importadora
                          </p>
                        </div>
                        <motion.div
                          animate={{ scale: isPretende ? 1.08 : 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isPretende ? 'bg-mecura-neon border-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.5)]' : 'border-mecura-elevated bg-mecura-bg'
                          }`}
                        >
                          {isPretende && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </motion.div>
                      </motion.button>

                      {/* Opção 3: Sem preferência */}
                      <motion.button
                        whileHover={{ scale: 1.008 }}
                        whileTap={{ scale: 0.985 }}
                        type="button"
                        onClick={() => {
                          setAnswer('preferredTreatmentStatus', 'sem_preferencia');
                          setAnswer('preferredBrands', []);
                          setAnswer('preferredNationalAssociation', '');
                          setAnswer('preferredImportedBrand', '');
                        }}
                        className={`w-full px-3.5 py-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 cursor-pointer relative overflow-hidden ${
                          isSemPref
                            ? 'bg-mecura-surface-light border-mecura-neon/70 shadow-[0_0_22px_rgba(166,255,0,0.15)]'
                            : 'bg-mecura-surface/90 border-mecura-elevated hover:border-mecura-neon/40'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isSemPref
                            ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_14px_rgba(166,255,0,0.5)]'
                            : 'bg-mecura-bg text-mecura-silver border-mecura-elevated'
                        }`}>
                          <Info className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-extrabold block leading-snug ${isSemPref ? 'text-mecura-neon' : 'text-white'}`}>
                            Não tenho preferência (Indicação Médica)
                          </span>
                          <p className="text-[11px] text-mecura-silver leading-snug mt-0.5">
                            Prefiro que o médico indique a melhor opção na consulta
                          </p>
                        </div>
                        <motion.div
                          animate={{ scale: isSemPref ? 1.08 : 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSemPref ? 'bg-mecura-neon border-mecura-neon' : 'border-mecura-elevated bg-mecura-bg'
                          }`}
                        >
                          {isSemPref && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        </motion.div>
                      </motion.button>
                    </div>
                  </div>

                  {/* VISUAL FLOW CONNECTOR BRIDGE BETWEEN QUESTION 1 AND QUESTION 2 */}
                  <div className="relative z-10 flex flex-col items-center py-2">
                    <div className="w-[2px] h-4 rounded-full bg-gradient-to-b from-mecura-neon/80 to-mecura-neon/30" />
                    <motion.div
                      animate={{ y: [0, 2, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 ${
                        isJaFaz || isPretende
                          ? 'bg-mecura-neon/15 text-mecura-neon border-mecura-neon/40 shadow-[0_0_14px_rgba(166,255,0,0.2)]'
                          : isSemPref
                            ? 'bg-mecura-surface-light text-mecura-pearl border-mecura-neon/30'
                            : 'bg-mecura-surface text-mecura-silver border-mecura-elevated'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
                        isJaFaz || isPretende || isSemPref ? 'bg-mecura-neon' : 'bg-mecura-silver'
                      }`} />
                      <span>
                        {isJaFaz
                          ? '↓ Conectado: Selecione abaixo qual você já utiliza'
                          : isPretende
                            ? '↓ Conectado: Selecione abaixo qual você prefere'
                            : isSemPref
                              ? '✓ Conectado: Indicação direta pelo médico'
                              : '↓ Passo 2: Escolha a marca correspondente'}
                      </span>
                    </motion.div>
                    <div className="w-[2px] h-3 rounded-full bg-gradient-to-b from-mecura-neon/30 to-mecura-neon/80" />
                  </div>

                  {/* STEP 2: Dynamically Connected to Question 1 */}
                  <AnimatePresence mode="wait">
                    {isSemPref ? (
                      <motion.div
                        key="sem-pref-box"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="relative z-10 rounded-2xl bg-mecura-surface border border-mecura-neon/40 p-4 text-center space-y-3 shadow-[0_0_25px_rgba(166,255,0,0.1)]"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-mecura-neon/15 border border-mecura-neon/30 flex items-center justify-center text-mecura-neon mx-auto shadow-[0_0_12px_rgba(166,255,0,0.25)]">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-white">
                            Perfeito! O médico indicará a melhor opção para você
                          </h4>
                          <p className="text-xs text-mecura-silver leading-relaxed">
                            Na sua ficha aparecerá que você <strong className="text-mecura-neon">deseja recomendação médica</strong> entre as Associações Nacionais (SouCannabis, ABECMED, ABRACE) ou Importadas (FlowerMed, Pangaia, GreenBudz).
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAnswer('preferredTreatmentStatus', 'pretende_fazer')}
                          className="text-[11px] font-bold text-mecura-neon hover:underline cursor-pointer"
                        >
                          Quero ver e escolher uma das 6 marcas mesmo assim →
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="choose-brand-box"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`space-y-3.5 rounded-2xl p-3.5 border transition-colors relative z-10 ${
                          isJaFaz || isPretende
                            ? 'bg-mecura-bg/90 border-mecura-neon/40 shadow-[0_0_30px_rgba(166,255,0,0.08)]'
                            : 'bg-mecura-bg/70 border-mecura-elevated'
                        }`}
                      >
                        {/* Dynamic Connected Header for Question 2 */}
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full text-black text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 bg-mecura-neon shadow-[0_0_10px_rgba(166,255,0,0.4)]">
                                2
                              </span>
                              <div>
                                <label className="text-xs font-extrabold text-white uppercase tracking-wide block leading-snug">
                                  {isJaFaz
                                    ? 'Qual Associação ou Marca você JÁ UTILIZA no tratamento?'
                                    : isPretende
                                      ? 'Qual Associação ou Marca você PRETENDE UTILIZAR?'
                                      : 'Escolha a Associação ou Marca (Já usa ou pretende usar)'}
                                </label>
                                <p className="text-[11px] text-mecura-silver mt-0.5">
                                  {isJaFaz
                                    ? 'Marque abaixo a(s) marca(s) que você já faz uso atualmente:'
                                    : 'Marque abaixo a(s) marca(s) de sua preferência para a receita:'}
                                </p>
                              </div>
                            </div>
                            {selectedBrandsList.length > 0 && (
                              <span className="text-[10px] font-extrabold text-black bg-mecura-neon px-2.5 py-0.5 rounded-full shrink-0 shadow-[0_0_12px_rgba(166,255,0,0.4)]">
                                {selectedBrandsList.length} {selectedBrandsList.length === 1 ? 'escolhida' : 'escolhidas'}
                              </span>
                            )}
                          </div>

                          {/* Animated 3-Tab Segmented Control */}
                          <div className="grid grid-cols-3 gap-1 p-1 bg-mecura-surface border border-mecura-elevated rounded-2xl relative">
                            {[
                              { id: 'all', label: 'Todas (6)' },
                              { id: 'nacional', label: 'Nacional (3)' },
                              { id: 'importado', label: 'Importado (3)' }
                            ].map(tab => {
                              const isActive = manufacturerFilterTab === tab.id;
                              return (
                                <motion.button
                                  key={tab.id}
                                  whileTap={{ scale: 0.96 }}
                                  type="button"
                                  onClick={() => setManufacturerFilterTab(tab.id as 'all' | 'nacional' | 'importado')}
                                  className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all text-center cursor-pointer ${
                                    isActive
                                      ? 'bg-mecura-neon text-black shadow-[0_0_15px_rgba(166,255,0,0.4)]'
                                      : 'text-mecura-silver hover:text-white bg-transparent'
                                  }`}
                                >
                                  {tab.label}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Grupo 1: Associações Nacionais (SouCannabis, ABECMED, ABRACE) */}
                        {(manufacturerFilterTab === 'all' || manufacturerFilterTab === 'nacional') && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-mecura-neon shadow-[0_0_8px_rgba(166,255,0,0.9)]" />
                                <span className="text-[11px] font-extrabold text-mecura-neon uppercase tracking-widest">
                                  Associações Nacionais
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-mecura-neon bg-mecura-neon/10 border border-mecura-neon/30 px-2 py-0.5 rounded-full">
                                Brasil
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5">
                              {nationalManufacturers.map((item, idx) => {
                                const isSelected = selectedBrandsList.some(
                                  b => b.toLowerCase() === item.name.toLowerCase() || b.toLowerCase().includes(item.id)
                                );
                                return (
                                  <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                                    whileHover={{ y: -2, scale: 1.005 }}
                                    whileTap={{ scale: 0.985 }}
                                    type="button"
                                    onClick={() => togglePreferredManufacturer(item)}
                                    className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3.5 cursor-pointer relative overflow-hidden ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-mecura-neon/20 via-mecura-neon/10 to-mecura-surface border-mecura-neon shadow-[0_8px_28px_rgba(166,255,0,0.2)]'
                                        : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50'
                                    }`}
                                  >
                                    {/* Left Animated Emblem */}
                                    <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center shrink-0 border font-black text-xs tracking-tight transition-all ${
                                      isSelected
                                        ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_18px_rgba(166,255,0,0.5)]'
                                        : 'bg-mecura-bg text-mecura-neon border-mecura-neon/30'
                                    }`}>
                                      <span>{item.name.slice(0, 2).toUpperCase()}</span>
                                      <span className={`text-[8px] font-extrabold uppercase ${isSelected ? 'text-black/80' : 'text-mecura-silver'}`}>BR</span>
                                    </div>

                                    {/* Center Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className={`font-extrabold text-base tracking-tight ${isSelected ? 'text-mecura-neon' : 'text-white'}`}>
                                          {item.name}
                                        </h4>
                                        {isSelected ? (
                                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-mecura-neon text-black shadow-[0_0_10px_rgba(166,255,0,0.35)]">
                                            {isJaFaz ? '✓ Já faço tratamento' : '★ Minha preferência'}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30">
                                            Nacional
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-xs text-mecura-silver leading-snug line-clamp-2">
                                        {item.description}
                                      </p>

                                      {item.highlights && item.highlights.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-0.5">
                                          {item.highlights.map((tag, tIdx) => (
                                            <span
                                              key={tIdx}
                                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                                isSelected
                                                  ? 'bg-mecura-neon/20 text-mecura-pearl border-mecura-neon/40'
                                                  : 'bg-mecura-bg text-mecura-silver border-mecura-elevated'
                                              }`}
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Right Check Orb */}
                                    <motion.div
                                      animate={{ scale: isSelected ? 1.1 : 1 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                        isSelected ? 'bg-mecura-neon border-mecura-neon shadow-[0_0_12px_rgba(166,255,0,0.5)]' : 'border-mecura-elevated bg-mecura-bg'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                                    </motion.div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}

                        {/* Grupo 2: Marcas Importadas (FlowerMed, Pangaia, GreenBudz) */}
                        {(manufacturerFilterTab === 'all' || manufacturerFilterTab === 'importado') && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.08 }}
                            className="space-y-2 pt-1"
                          >
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-mecura-neon animate-pulse" />
                                <span className="text-[11px] font-extrabold text-mecura-neon uppercase tracking-widest">
                                  Marcas Importadas (EUA)
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-mecura-neon bg-mecura-neon/10 border border-mecura-neon/30 px-2 py-0.5 rounded-full">
                                RDC 660 ANVISA
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5">
                              {importedManufacturers.map((item, idx) => {
                                const isSelected = selectedBrandsList.some(
                                  b => b.toLowerCase() === item.name.toLowerCase() || b.toLowerCase().includes(item.id)
                                );
                                return (
                                  <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                                    whileHover={{ y: -2, scale: 1.005 }}
                                    whileTap={{ scale: 0.985 }}
                                    type="button"
                                    onClick={() => togglePreferredManufacturer(item)}
                                    className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3.5 cursor-pointer relative overflow-hidden ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-mecura-neon/20 via-mecura-neon/10 to-mecura-surface border-mecura-neon shadow-[0_8px_28px_rgba(166,255,0,0.2)]'
                                        : 'bg-mecura-surface border-mecura-elevated hover:border-mecura-neon/50'
                                    }`}
                                  >
                                    {/* Left Animated Emblem */}
                                    <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center shrink-0 border font-black text-xs tracking-tight transition-all ${
                                      isSelected
                                        ? 'bg-mecura-neon text-black border-mecura-neon shadow-[0_0_18px_rgba(166,255,0,0.5)]'
                                        : 'bg-mecura-bg text-mecura-neon border-mecura-neon/30'
                                    }`}>
                                      <span>{item.name.slice(0, 2).toUpperCase()}</span>
                                      <span className={`text-[8px] font-extrabold uppercase ${isSelected ? 'text-black/80' : 'text-mecura-silver'}`}>EUA</span>
                                    </div>

                                    {/* Center Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className={`font-extrabold text-base tracking-tight ${isSelected ? 'text-mecura-neon' : 'text-white'}`}>
                                          {item.name}
                                        </h4>
                                        {isSelected ? (
                                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-mecura-neon text-black shadow-[0_0_10px_rgba(166,255,0,0.35)]">
                                            {isJaFaz ? '✓ Já faço tratamento' : '★ Minha preferência'}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-mecura-neon/15 text-mecura-neon border border-mecura-neon/30">
                                            RDC 660 ANVISA
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-xs text-mecura-silver leading-snug line-clamp-2">
                                        {item.description}
                                      </p>

                                      {item.highlights && item.highlights.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-0.5">
                                          {item.highlights.map((tag, tIdx) => (
                                            <span
                                              key={tIdx}
                                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                                isSelected
                                                  ? 'bg-mecura-neon/20 text-mecura-pearl border-mecura-neon/40'
                                                  : 'bg-mecura-bg text-mecura-silver border-mecura-elevated'
                                              }`}
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Right Check Orb */}
                                    <motion.div
                                      animate={{ scale: isSelected ? 1.1 : 1 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                        isSelected ? 'bg-mecura-neon border-mecura-neon shadow-[0_0_12px_rgba(166,255,0,0.5)]' : 'border-mecura-elevated bg-mecura-bg'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                                    </motion.div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Resumo Conectado (Pergunta 1 + Pergunta 2) */}
                  <AnimatePresence>
                    {selectedBrandsList.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.96 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.96 }}
                        className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-mecura-neon/20 via-mecura-neon/10 to-mecura-surface border border-mecura-neon flex flex-col gap-2 relative z-10 shadow-[0_0_20px_rgba(166,255,0,0.15)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-mecura-neon uppercase tracking-wider">
                            {isJaFaz
                              ? '✓ Resumo: Paciente JÁ FAZ TRATAMENTO com:'
                              : '★ Resumo: Paciente PRETENDE INICIAR com:'}
                          </span>
                          <Sparkles className="w-4 h-4 text-mecura-neon shrink-0 animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-white">
                            {selectedBrandsList.join(' • ')}
                          </span>
                          <div className="flex items-center gap-1 bg-mecura-bg p-1 rounded-lg border border-mecura-elevated">
                            <button
                              type="button"
                              onClick={() => setAnswer('preferredTreatmentStatus', 'ja_faz')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                isJaFaz ? 'bg-mecura-neon text-black' : 'text-mecura-silver hover:text-white'
                              }`}
                            >
                              Já uso
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnswer('preferredTreatmentStatus', 'pretende_fazer')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                isPretende ? 'bg-mecura-neon text-black' : 'text-mecura-silver hover:text-white'
                              }`}
                            >
                              Pretendo usar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 3. Campo para informar medicamento específico conectado à escolha */}
                  {!isSemPref && (
                    <div className="space-y-2 pt-4 mt-4 border-t border-mecura-elevated relative z-10">
                      <label className="text-[11px] font-extrabold text-mecura-neon uppercase tracking-widest block">
                        {isJaFaz
                          ? `3. Qual produto ou dosagem ${selectedBrandsList.length > 0 ? `da ${selectedBrandsList.join(' / ')} ` : ''}você já utiliza? (Opcional)`
                          : '3. Algum produto específico em mente para o médico? (Opcional)'}
                      </label>
                      <textarea
                        value={answers.preferredBrandNotes || ''}
                        onChange={(e) => setAnswer('preferredBrandNotes', e.target.value)}
                        placeholder={
                          isJaFaz
                            ? 'Ex: Já tomo o Óleo Azul 5:1 da SouCannabis (5 gotas de 12/12h) e quero renovar minha receita...'
                            : 'Ex: Gostaria de iniciar com óleo ou gummies da marca selecionada acima...'
                        }
                        className="w-full h-20 rounded-2xl border border-mecura-elevated bg-mecura-bg p-3.5 text-xs sm:text-sm text-mecura-pearl placeholder:text-mecura-silver/50 focus:outline-none focus:border-mecura-neon resize-none transition-colors"
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })()}

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

          {/* Step: Driving */}
          {step.id === 'driving' && renderBooleanList(DRIVING_QUESTIONS)}

          {/* Step: Emotional */}
          {step.id === 'emotional' && renderBooleanList(EMOTIONAL_QUESTIONS)}

          </motion.div>
        </AnimatePresence>
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

      <AnimatePresence>
        {showExistingAccountPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-mecura-surface border border-mecura-neon/40 rounded-3xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(166,255,0,0.15)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-mecura-neon/10 border border-mecura-neon/30 flex items-center justify-center mb-4 text-mecura-neon">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Conta Localizada!</h3>
              <p className="text-mecura-silver text-sm mb-6 leading-relaxed">
                Olá, <strong className="text-white">{userName || 'Paciente'}</strong>! Você já possui cadastro ativo na plataforma. Deseja realizar uma nova triagem/consulta ou acessar seu painel?
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full shadow-lg shadow-mecura-neon/20 font-bold"
                  onClick={() => {
                    useStore.getState().clearTriage();
                    setShowExistingAccountPrompt(false);
                    setCurrentStep(1);
                    setOnboardingStep(1);
                  }}
                >
                  Continuar Nova Triagem
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-mecura-elevated text-mecura-silver hover:text-white"
                  onClick={() => {
                    setShowExistingAccountPrompt(false);
                    navigate('/dashboard');
                  }}
                >
                  Ir para Meu Painel
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        <PasswordResetCpfModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          initialEmail={userEmail}
          onPasswordResetSuccess={(email, newPass) => {
            setIsLogin(true);
            setUserEmail(email);
            setPassword(newPass);
            setAuthError('');
            setShowForgotPassword(false);
          }}
        />
      </AnimatePresence>

      </div>
    </div>
  );
}
