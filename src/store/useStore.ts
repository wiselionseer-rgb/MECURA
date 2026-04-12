import { create } from 'zustand';

export type UserTier = 'Essencial' | 'Avançado' | 'Premium' | 'Elite' | 'Black';

export interface Message {
  id: string;
  text?: string;
  sender: 'user' | 'doctor';
  timestamp: Date;
  type?: 'text' | 'prescription' | 'product' | 'prescription_notes' | 'acompanhamento_card' | 'acompanhamento_options';
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
  productData?: {
    name: string;
    image: string;
    details: string[];
    brand: string;
    origin: string;
    italicText?: string;
    dosage: string[];
    description: string;
    priceUSD?: number;
  };
}

interface AppState {
  // User Data
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userPhone: string;
  setUserPhone: (phone: string) => void;
  userCpf: string;
  setUserCpf: (cpf: string) => void;
  userTier: UserTier;
  setUserTier: (tier: UserTier) => void;
  
  // Gamification & Onboarding
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (status: boolean) => void;
  healthStreak: number;
  incrementStreak: () => void;
  
  // Dynamic Onboarding Answers
  answers: Record<string, any>;
  setAnswer: (key: string, value: any) => void;
  
  // Payment Status
  pagamento_consulta: boolean;
  setPagamentoConsulta: (status: boolean) => void;
  pagamento_premium: boolean;
  setPagamentoPremium: (status: boolean) => void;
  selectedOffer: 'basic' | 'premium' | null;
  setSelectedOffer: (offer: 'basic' | 'premium' | null) => void;
  
  // Scheduled Consultation
  scheduledConsultation: { date: string; time: string } | null;
  setScheduledConsultation: (consultation: { date: string; time: string } | null) => void;
  consultationStatus: 'pending' | 'confirmed';
  setConsultationStatus: (status: 'pending' | 'confirmed') => void;
  
  // Doctor Agenda & Appointments
  allAppointments: Array<{
    id: string;
    patientName: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    type: string;
  }>;
  addAppointment: (appointment: { patientName: string; date: string; time: string; type: string }) => void;
  confirmAppointment: (id: string) => void;
  cancelAppointment: (id: string) => void;
  
  // Queue System
  inQueue: boolean;
  queuePosition: number;
  estimatedWaitTime: number; // in minutes
  queue: Array<{ id: string; patientName: string; email: string; joinedAt: Date; status?: string; answers?: any }>;
  joinQueue: (patient?: { id: string; patientName: string; email: string; answers?: any }) => void;
  leaveQueue: (patientId: string) => void;
  updateQueue: (position: number, waitTime: number) => void;
  subscribeToQueue: () => () => void;
  subscribeToAppointments: () => () => void;
  
  // Consultation
  consultationActive: boolean;
  isConsultationFinished: boolean;  consultationHistory: Array<{
    id: string;
    patientName: string;
    date: Date;
    messages: Message[];
    summary?: string;
    intensity?: number;
  }>;
  activeConsultationId: string | null;
  setActiveConsultationId: (id: string | null) => void;
  startConsultation: (patientId?: string) => void;
  endConsultation: () => void;
  setIsConsultationFinished: (status: boolean) => void;
  resetConsultation: () => void;
  
  // Chat
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  setMessages: (messages: Message[]) => void;
  subscribeToMessages: (consultationId: string) => () => void;

  // Exchange Rate
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  subscribeToExchangeRate: () => () => void;
  updateExchangeRate: (rate: number) => Promise<void>;
  
  reset: () => void;
}

import { doc, getDoc, setDoc, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export const useStore = create<AppState>((set, get) => ({
  userName: '',
  setUserName: (name) => set({ userName: name }),
  userEmail: '',
  setUserEmail: (email) => set({ userEmail: email }),
  userPhone: '',
  setUserPhone: (phone) => set({ userPhone: phone }),
  userCpf: '',
  setUserCpf: (cpf) => set({ userCpf: cpf }),
  userTier: 'Essencial',
  setUserTier: (tier) => set({ userTier: tier }),
  
  onboardingStep: 0,
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (status) => set({ hasCompletedOnboarding: status }),
  healthStreak: 0,
  incrementStreak: () => set((state) => ({ healthStreak: state.healthStreak + 1 })),
  
  answers: {
    objectives: [],
  },
  setAnswer: (key, value) => set((state) => ({ 
    answers: { ...state.answers, [key]: value } 
  })),
  
  pagamento_consulta: false,
  setPagamentoConsulta: (status) => set({ pagamento_consulta: status }),
  pagamento_premium: false,
  setPagamentoPremium: (status) => set({ pagamento_premium: status }),
  selectedOffer: null,
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
  
  scheduledConsultation: null,
  setScheduledConsultation: (consultation) => set({ scheduledConsultation: consultation }),
  consultationStatus: 'pending',
  setConsultationStatus: (status) => set({ consultationStatus: status }),
  
  allAppointments: [
    { id: '1', patientName: 'Ana Oliveira', date: '2026-04-11', time: '09:00', status: 'confirmed' as const, type: 'Primeira Consulta' },
    { id: '2', patientName: 'Carlos Mendes', date: '2026-04-11', time: '10:00', status: 'confirmed' as const, type: 'Retorno' },
    { id: '3', patientName: 'Lucas Neres', date: '2026-04-11', time: '11:30', status: 'confirmed' as const, type: 'Acompanhamento' },
    { id: '4', patientName: 'Mariana Costa', date: '2026-04-11', time: '14:00', status: 'confirmed' as const, type: 'Primeira Consulta' },
    { id: '5', patientName: 'Roberto Silva', date: '2026-04-11', time: '15:30', status: 'confirmed' as const, type: 'Retorno' },
    { id: '6', patientName: 'Juliana Lima', date: '2026-04-11', time: '16:45', status: 'confirmed' as const, type: 'Acompanhamento' },
    { id: '7', patientName: 'Pedro Santos', date: '2026-04-11', time: '09:00', status: 'confirmed' as const, type: 'Primeira Consulta' },
    { id: '8', patientName: 'Fernanda Costa', date: '2026-04-11', time: '10:15', status: 'confirmed' as const, type: 'Retorno' },
    { id: '9', patientName: 'Rafael Souza', date: '2026-04-11', time: '14:25', status: 'confirmed' as const, type: 'Acompanhamento' },
    { id: '10', patientName: 'Camila Alves', date: '2026-04-11', time: '16:05', status: 'confirmed' as const, type: 'Primeira Consulta' },
  ],
  addAppointment: (appointment) => set((state) => ({
    allAppointments: [...state.allAppointments, { ...appointment, id: Date.now().toString(), status: 'pending' as const }]
  })),
  confirmAppointment: (id) => set((state) => {
    const updatedAppointments = state.allAppointments.map((app) => 
      app.id === id ? { ...app, status: 'confirmed' as const } : app
    );
    const confirmedApp = updatedAppointments.find(app => app.id === id);
    
    // If the confirmed appointment is for the current user, update the global status
    if (confirmedApp && confirmedApp.patientName === state.userName) {
      return { 
        allAppointments: updatedAppointments,
        consultationStatus: 'confirmed'
      };
    }
    
    return { allAppointments: updatedAppointments };
  }),
  cancelAppointment: (id) => set((state) => ({
    allAppointments: state.allAppointments.map((app) => 
      app.id === id ? { ...app, status: 'cancelled' as const } : app
    )
  })),
  
  inQueue: false,
  queuePosition: 0,
  estimatedWaitTime: 0,
  queue: [],
  joinQueue: async (patient) => {
    const state = get();
    const newPatient = patient || { 
      id: auth.currentUser?.uid || Date.now().toString(), 
      patientName: state.userName || 'Paciente Anônimo', 
      email: state.userEmail || 'sem-email@mecura.com',
      answers: state.answers // Pass answers to the queue so doctor can see them
    };
    
    set({ inQueue: true });

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'queue', auth.currentUser.uid), {
          ...newPatient,
          joinedAt: new Date().toISOString(),
          status: 'waiting'
        });
      } catch (error) {
        console.error("Error joining queue in Firestore", error);
      }
    } else {
      // Fallback for local
      set((state) => ({ 
        queue: [...state.queue, { ...newPatient, joinedAt: new Date() }],
        queuePosition: state.queue.length + 1,
        estimatedWaitTime: (state.queue.length + 1) * 15
      }));
    }
  },
  leaveQueue: async (patientId) => {
    if (auth.currentUser && patientId === auth.currentUser.uid) {
      try {
        await deleteDoc(doc(db, 'queue', patientId));
      } catch (error) {
        console.error("Error leaving queue", error);
      }
    }
    set((state) => {
      const newQueue = state.queue.filter(p => p.id !== patientId);
      return { 
        queue: newQueue,
        inQueue: newQueue.length > 0 && state.inQueue,
        queuePosition: Math.max(0, state.queuePosition - 1)
      };
    });
  },
  updateQueue: (position, waitTime) => set({ queuePosition: position, estimatedWaitTime: waitTime }),
  
  subscribeToQueue: () => {
    const q = query(collection(db, 'queue'), orderBy('joinedAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const queueData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinedAt: new Date(doc.data().joinedAt)
      })) as any[];
      
      set({ queue: queueData });
      
      // Update position for current user
      if (auth.currentUser) {
        const myIndex = queueData.findIndex(p => p.id === auth.currentUser!.uid);
        if (myIndex !== -1) {
          set({ 
            queuePosition: myIndex, // 0 means next
            estimatedWaitTime: (myIndex + 1) * 15,
            inQueue: true
          });
          
          // Check if doctor started consultation
          if (queueData[myIndex].status === 'in-consultation') {
             // Doctor started it!
             set({ consultationActive: true, inQueue: false, activeConsultationId: auth.currentUser.uid });
          }
        } else {
           // Not in queue
           set({ inQueue: false });
        }
      }
    });
  },
  
  subscribeToAppointments: () => {
    console.log("Subscribing to appointments collection...");
    const q = query(collection(db, 'appointments'));
    return onSnapshot(q, (snapshot) => {
      console.log("Appointments snapshot received, size:", snapshot.size);
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      console.log("Appointments data:", appointmentsData);
      set({ allAppointments: appointmentsData });
    }, (error) => {
      console.error("Error subscribing to appointments:", error);
    });
  },
  
  consultationActive: false,
  isConsultationFinished: false,
  consultationHistory: [
    {
      id: 'h1',
      patientName: 'Lucas Neres',
      date: new Date('2026-03-15T10:00:00'),
      messages: [
        { id: 'm1', text: 'Olá Lucas, como você está se sentindo hoje?', sender: 'doctor', timestamp: new Date('2026-03-15T10:00:00') },
        { id: 'm2', text: 'Estou melhorando das dores, mas ainda sinto ansiedade.', sender: 'user', timestamp: new Date('2026-03-15T10:01:00') }
      ],
      summary: 'Paciente relatou melhora nas dores crônicas, mas persistência de sintomas de ansiedade.',
      intensity: 8
    },
    {
      id: 'h2',
      patientName: 'Ana Oliveira',
      date: new Date('2026-03-20T14:30:00'),
      messages: [
        { id: 'm3', text: 'Boa tarde Ana. Como foi o uso do óleo nas últimas semanas?', sender: 'doctor', timestamp: new Date('2026-03-20T14:30:00') }
      ],
      summary: 'Acompanhamento de rotina.',
      intensity: 5
    }
  ],
  activeConsultationId: null,
  setActiveConsultationId: (id) => set({ activeConsultationId: id }),
  
  startConsultation: async (patientId?: string) => {
    set({ consultationActive: true, inQueue: false, messages: [] });
    if (patientId) {
      // Doctor starting consultation
      try {
        await updateDoc(doc(db, 'queue', patientId), { status: 'in-consultation' });
        set({ activeConsultationId: patientId });
      } catch (e) {
        console.error("Error updating queue status", e);
      }
    } else if (auth.currentUser) {
      // Patient starting
      set({ activeConsultationId: auth.currentUser.uid });
    }
  },
  endConsultation: async () => {
    const state = get();
    const newConsultation = {
      id: Date.now().toString(),
      patientName: state.userName || 'Paciente Atual',
      date: new Date(),
      messages: state.messages,
      summary: 'Consulta finalizada via chat.',
      intensity: state.answers?.intensity || 0
    };

    // Save to Firestore if user is logged in
    const consultationId = state.activeConsultationId || auth.currentUser?.uid;
    if (consultationId) {
      try {
        const historyRef = collection(db, 'users', consultationId, 'consultations');
        await addDoc(historyRef, {
          ...newConsultation,
          date: newConsultation.date.toISOString(),
          messages: newConsultation.messages.map(m => ({
            ...m,
            timestamp: m.timestamp.toISOString()
          }))
        });
        console.log('Consultation history saved to Firestore');
        
        // Clean up active consultation
        await deleteDoc(doc(db, 'queue', consultationId));
        
        // Delete messages from active_consultations
        const messagesRef = collection(db, 'active_consultations', consultationId, 'messages');
        const snapshot = await getDocs(messagesRef);
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        
        // Note: deleting a document doesn't delete its subcollections in Firestore, 
        // but for this prototype it's fine.
      } catch (error) {
        console.error('Error saving consultation history:', error);
      }
    }

    set((state) => ({ 
      consultationActive: false, 
      isConsultationFinished: true,
      activeConsultationId: null,
      consultationHistory: [
        ...state.consultationHistory,
        newConsultation
      ]
    }));
  },
  setIsConsultationFinished: (status) => set({ isConsultationFinished: status }),
  resetConsultation: () => set({ 
    consultationActive: false, 
    isConsultationFinished: false,
    pagamento_consulta: false, 
    answers: { objectives: [] }, 
    messages: [] 
  }),
  
  messages: [],
  addMessage: async (msg) => {
    const state = get();
    const newMessage = { ...msg, id: Date.now().toString(), timestamp: new Date() };
    
    // Optimistic update
    set((state) => ({
      messages: [...state.messages, newMessage]
    }));

    // Save to Firestore if in an active consultation
    const consultationId = state.activeConsultationId || auth.currentUser?.uid;
    if (consultationId) {
      try {
        const messagesRef = collection(db, 'active_consultations', consultationId, 'messages');
        await setDoc(doc(messagesRef, newMessage.id), {
          ...newMessage,
          timestamp: newMessage.timestamp.toISOString()
        });
      } catch (error) {
        console.error("Error sending message", error);
      }
    }
  },
  
  subscribeToMessages: (consultationId: string) => {
    const q = query(collection(db, 'active_consultations', consultationId, 'messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: new Date(doc.data().timestamp)
      })) as Message[];
      set({ messages: msgs });
    });
  },
  setMessages: (messages) => set({ messages }),

  exchangeRate: 5.0,
  setExchangeRate: (rate) => set({ exchangeRate: rate }),
  subscribeToExchangeRate: () => {
    const docRef = doc(db, 'settings', 'exchangeRate');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Exchange rate updated from Firestore:', data.rate);
        set({ exchangeRate: data.rate });
      } else {
        // If document doesn't exist, create it with default value
        console.log('Exchange rate document does not exist, using default 5.0');
        set({ exchangeRate: 5.0 });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/exchangeRate');
    });
    return unsubscribe;
  },
  updateExchangeRate: async (rate) => {
    const path = 'settings/exchangeRate';
    try {
      console.log('Updating exchange rate to:', rate);
      const docRef = doc(db, 'settings', 'exchangeRate');
      await setDoc(docRef, { rate, updatedAt: new Date().toISOString() });
      // Local state will be updated by the onSnapshot listener
      console.log('Exchange rate update request sent to Firestore');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  
  reset: () => set({
    userName: '',
    userEmail: '',
    userPhone: '',
    userCpf: '',
    userTier: 'Essencial',
    onboardingStep: 0,
    hasCompletedOnboarding: false,
    healthStreak: 0,
    answers: { objectives: [] },
    pagamento_consulta: false,
    pagamento_premium: false,
    selectedOffer: null,
    scheduledConsultation: null,
    consultationStatus: 'pending',
    inQueue: false,
    queuePosition: 0,
    estimatedWaitTime: 0,
    queue: [],
    consultationActive: false,
    isConsultationFinished: false,
    activeConsultationId: null,
    messages: []
  }),
}));
