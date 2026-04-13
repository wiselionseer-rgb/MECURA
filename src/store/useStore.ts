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
  patientId: string | null;
  setPatientId: (id: string) => void;
  
  inQueue: boolean;
  queuePosition: number;
  estimatedWaitTime: number; // in minutes
  queue: Array<{ 
    id: string; 
    patientName: string; 
    email: string; 
    joinedAt: Date; 
    status?: string; 
    answers?: any;
    hasUnread?: boolean;
    lastMessageAt?: string;
    lastMessageText?: string;
  }>;
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
  
  allAppointments: [],
  addAppointment: async (appointment) => {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointment,
        status: 'pending' as const
      });
      set((state) => ({
        allAppointments: [...state.allAppointments, { ...appointment, id: docRef.id, status: 'pending' as const }]
      }));
    } catch (error) {
      console.error("Error adding appointment to Firestore:", error);
    }
  },
  confirmAppointment: async (id) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'confirmed' });
      set((state) => {
        const updatedAppointments = state.allAppointments.map((app) => 
          app.id === id ? { ...app, status: 'confirmed' as const } : app
        );
        const confirmedApp = updatedAppointments.find(app => app.id === id);
        
        if (confirmedApp && confirmedApp.patientName === state.userName) {
          return { 
            allAppointments: updatedAppointments,
            consultationStatus: 'confirmed'
          };
        }
        
        return { allAppointments: updatedAppointments };
      });
    } catch (error) {
      console.error("Error confirming appointment in Firestore:", error);
    }
  },
  cancelAppointment: async (id) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
      set((state) => ({
        allAppointments: state.allAppointments.map((app) => 
          app.id === id ? { ...app, status: 'cancelled' as const } : app
        )
      }));
    } catch (error) {
      console.error("Error cancelling appointment in Firestore:", error);
    }
  },
  
  patientId: null,
  setPatientId: (id) => set({ patientId: id }),
  
  inQueue: false,
  queuePosition: 0,
  estimatedWaitTime: 0,
  queue: [],
  joinQueue: async (patient) => {
    const state = get();
    const currentUserId = auth.currentUser?.uid || state.patientId || `anon_${Date.now()}`;
    
    // Save the generated or existing ID
    set({ patientId: currentUserId });
    
    const newPatient = patient || { 
      id: currentUserId, 
      patientName: state.userName || 'Paciente Anônimo', 
      email: state.userEmail || 'sem-email@mecura.com',
      answers: state.answers // Pass answers to the queue so doctor can see them
    };
    
    set({ inQueue: true });

    try {
      // Always try to write to Firestore, even if anonymous (using the generated ID)
      await setDoc(doc(db, 'queue', currentUserId), {
        ...newPatient,
        joinedAt: new Date().toISOString(),
        status: 'waiting'
      });
    } catch (error) {
      console.error("Error joining queue in Firestore", error);
      // Fallback for local if Firestore fails
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
      
      // Update position for current user (if they are a patient)
      const currentUserId = auth.currentUser?.uid;
      const isDoctorRoute = window.location.pathname.includes('/doctor');
      
      if (currentUserId && !isDoctorRoute) {
        const myIndex = queueData.findIndex(p => p.id === currentUserId);
        if (myIndex !== -1) {
          set({ 
            queuePosition: myIndex, // 0 means next
            estimatedWaitTime: (myIndex + 1) * 15,
            inQueue: true
          });
          
          // Check if doctor started consultation
          if (queueData[myIndex].status === 'in-consultation') {
             // Doctor started it!
             set({ consultationActive: true, inQueue: false, activeConsultationId: currentUserId });
          } else if (queueData[myIndex].status === 'finished') {
             set({ isConsultationFinished: true, activeConsultationId: currentUserId });
          }
        } else {
           // Not in queue
        }
      } else if (!isDoctorRoute) {
        // Handle anonymous users based on their local state
        const state = get();
        if (state.inQueue || state.consultationActive || state.isConsultationFinished) {
          // Find their position based on their generated ID if possible, or just rely on local state
          const myIndex = queueData.findIndex(p => p.id === state.patientId);
          if (myIndex !== -1) {
            set({ 
              queuePosition: myIndex,
              estimatedWaitTime: (myIndex + 1) * 15
            });
            if (queueData[myIndex].status === 'in-consultation') {
               set({ consultationActive: true, inQueue: false, activeConsultationId: queueData[myIndex].id });
            } else if (queueData[myIndex].status === 'finished') {
               set({ isConsultationFinished: true, activeConsultationId: queueData[myIndex].id });
            }
          }
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
      set({ activeConsultationId: patientId });
      try {
        const state = get();
        const patient = state.queue.find(p => p.id === patientId);
        
        const updates: any = { hasUnread: false };
        if (patient && patient.status === 'waiting') {
          updates.status = 'in-consultation';
        }
        
        await updateDoc(doc(db, 'queue', patientId), updates);
      } catch (e) {
        console.error("Error updating queue status", e);
      }
    } else {
      const currentId = auth.currentUser?.uid || get().patientId;
      if (currentId) {
        // Patient starting
        set({ activeConsultationId: currentId });
      }
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
        
        // Clean up active consultation - change status to finished instead of deleting
        await updateDoc(doc(db, 'queue', consultationId), {
          status: 'finished'
        });
        
        // We no longer delete messages from active_consultations to preserve chat history
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
    // For doctor, activeConsultationId is set. For patient, patientId is set.
    // If patient is logged in and refreshed, patientId might be null, so fallback to auth.currentUser?.uid
    const consultationId = state.activeConsultationId || state.patientId || auth.currentUser?.uid;
    console.log("addMessage called. consultationId:", consultationId, "msg:", msg);
    
    if (consultationId) {
      try {
        const messagesRef = collection(db, 'active_consultations', consultationId, 'messages');
        await setDoc(doc(messagesRef, newMessage.id), {
          ...newMessage,
          timestamp: newMessage.timestamp.toISOString()
        });
        console.log("Message saved to active_consultations successfully.");
        
        // Update queue document for WhatsApp-like behavior
        const queueRef = doc(db, 'queue', consultationId);
        await updateDoc(queueRef, {
          lastMessageAt: newMessage.timestamp.toISOString(),
          lastMessageText: newMessage.text || (newMessage.type === 'product' ? 'Produto prescrito' : 'Mensagem'),
          hasUnread: newMessage.sender === 'user' // Only mark unread if patient sent it
        });
        console.log("Queue document updated successfully.");
      } catch (error) {
        console.error("Error sending message to Firestore:", error);
      }
    } else {
      console.warn("addMessage: No consultationId found. Message not saved to Firestore.");
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
    }, (error) => {
      console.error("Error subscribing to messages:", error);
      handleFirestoreError(error, OperationType.GET, `active_consultations/${consultationId}/messages`);
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
