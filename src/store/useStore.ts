import { create } from 'zustand';

export type UserTier = 'Essencial' | 'Avançado' | 'Premium' | 'Elite' | 'Black';

export interface BlockedDate {
  id: string;
  date: string; // 'YYYY-MM-DD'
  fullDay?: boolean;
  times?: string[];
  reason?: string;
  createdAt?: string;
}

export interface ConsultationHistoryItem {
  id: string;
  patientId?: string;
  patientName: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  date: Date;
  messages: Message[];
  summary?: string;
  intensity?: number;
  status?: 'waiting' | 'in-consultation' | 'finished';
  isPremium?: boolean;
  plan?: string;
  answers?: any;
}

export interface Message {
  id: string;
  text?: string;
  sender: 'user' | 'doctor';
  professionalRole?: 'doctor' | 'psychologist';
  isQueueTransfer?: boolean;
  targetQueueType?: 'doctor' | 'psychologist';
  timestamp: Date;
  type?: 'text' | 'prescription' | 'product' | 'prescription_notes' | 'receita_previa' | 'acompanhamento_card' | 'acompanhamento_options' | 'payment_success' | 'medical_report' | 'psychomotor_report' | 'agronomic_report' | 'psychological_report' | 'document' | 'adhd_test_card' | 'autism_test_card';
  docType?: 'receita' | 'laudo_inicial' | 'laudo_evolutivo' | 'laudo_psicomotor' | 'laudo_agronomico' | 'laudo_psicologico' | 'documento';
  attachment?: {
    name: string;
    url: string;
    type: string;
    docType?: 'receita' | 'laudo_inicial' | 'laudo_evolutivo' | 'laudo_psicomotor' | 'laudo_agronomico' | 'laudo_psicologico' | 'documento';
    title?: string;
    fileId?: string;
  };
  adhdTestData?: {
    scorePercent: number;
    totalPoints: number;
    maxPoints: number;
    questionsCount: number;
    classification: string;
    completedAt?: string;
    answers?: Record<string, number>;
    summaryNotes?: string;
  };
  autismTestData?: {
    scorePercent: number;
    totalPoints: number;
    maxPoints: number;
    questionsCount: number;
    targetProfile?: string;
    classification: string;
    completedAt?: string;
    answers?: Record<string, number>;
    summaryNotes?: string;
  };
  receitaPreviaData?: {
    doctorName?: string;
    doctorCrm?: string;
    doctorSpecialty?: string;
    patientName?: string;
    emissionDate?: string;
    items: Array<{
      name: string;
      brand?: string;
      origin?: string;
      type?: string;
      activeIngredients?: string;
      concentration?: string;
      pharmaceuticalForm?: string;
      quantity?: string;
      administrationRoute?: string;
      dosage: string[];
      description?: string;
      details?: string[];
    }>;
    notes?: string;
    status: 'pending_confirmation' | 'confirmed';
    confirmedAt?: string;
  };
  productData?: {
    name: string;
    image: string;
    details: string[];
    brand: string;
    origin: string;
    type?: string;
    activeIngredients?: string;
    concentration?: string;
    pharmaceuticalForm?: string;
    quantity?: string;
    administrationRoute?: string;
    italicText?: string;
    dosage: string[];
    description: string;
    priceUSD?: number;
    priceBRL?: number;
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
  userBirthDate: string;
  setUserBirthDate: (birthDate: string) => void;
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
  selectedOffer: 'basic' | 'premium' | 'psychologist' | 'complete' | null;
  setSelectedOffer: (offer: 'basic' | 'premium' | 'psychologist' | 'complete' | null) => void;
  
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
    isPremium?: boolean;
    plan?: string;
    patientId?: string;
    patientEmail?: string;
  }>;
  blockedDates: BlockedDate[];
  blockDate: (date: string, reason?: string, fullDay?: boolean, times?: string[]) => Promise<void>;
  unblockDate: (idOrDate: string) => Promise<void>;
  blockMonth: (yearMonth: string, reason?: string) => Promise<void>;
  unblockMonth: (yearMonth: string) => Promise<void>;
  subscribeToBlockedDates: () => () => void;
  addAppointment: (appointment: { patientName: string; date: string; time: string; type: string; status?: 'pending' | 'confirmed' | 'cancelled'; isPremium?: boolean; plan?: string; patientId?: string; patientEmail?: string }) => void;
  confirmAppointment: (id: string) => void;
  cancelAppointment: (id: string, reason?: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => Promise<void>;
  
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
    birthDate?: string;
    cpf?: string;
    phone?: string;
    isPremium?: boolean;
    plan?: string;
    tier?: string;
    isAlerted?: number | boolean;
    queueType?: string;
    selectedOffer?: string;
  }>;
  joinQueue: (patient?: { id?: string; patientName: string; email: string; answers?: any; birthDate?: string; cpf?: string; phone?: string; isPremium?: boolean; plan?: string; queueType?: string; selectedOffer?: string; freshPayment?: boolean }) => Promise<void>;
  leaveQueue: (patientId: string) => void;
  transferPatientQueue: (patientId: string, targetQueueType: 'doctor' | 'psychologist') => Promise<void>;
  updateQueue: (position: number, waitTime: number) => void;
  subscribeToQueue: () => () => void;
  subscribeToAppointments: () => () => void;
  
  // Consultation
  consultationActive: boolean;
  isConsultationFinished: boolean;
  bonusBalance: number;
  incrementBonus: (amount: number, userId?: string) => Promise<void>;
  consultationHistory: ConsultationHistoryItem[];
  activeConsultationId: string | null;
  setActiveConsultationId: (id: string | null) => void;
  startConsultation: (patientId?: string) => void;
  endConsultation: () => void;
  setIsConsultationFinished: (status: boolean) => void;
  resetConsultation: () => void;
  fetchConsultationHistory: (patientId: string) => Promise<void>;
  subscribeToAllConsultationHistory: () => () => void;
  fetchPatientMessages: (patientId: string) => Promise<Message[]>;
  
  // Chat
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>, customConsultationId?: string) => Promise<void>;
  deleteMessage: (messageId: string, customConsultationId?: string) => Promise<void>;
  clearPrescriptionMessages: (customConsultationId?: string) => Promise<void>;
  confirmReceitaPrevia: (messageId: string, customConsultationId?: string) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  subscribeToMessages: (consultationId: string) => () => void;

  // Exchange Rate
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  subscribeToExchangeRate: () => () => void;
  updateExchangeRate: (rate: number) => Promise<void>;
  
  reset: () => void;
  clearTriage: () => void;
}

import { doc, getDoc, setDoc, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, updateDoc, getDocs, writeBatch, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { useAdminStore } from './useAdminStore';
import { playNotificationSound } from '../utils/sound';
import { showNativeNotification, triggerBackgroundPush, triggerAdminBackgroundPush } from '../utils/notifications';
import { persistAttachmentToCloud } from '../utils/downloadHelper';

export const useStore = create<AppState>((set, get) => ({
  userName: typeof window !== 'undefined' ? (localStorage.getItem('mecura_patient_name') || '') : '',
  setUserName: (name) => {
    if (typeof window !== 'undefined' && name && name.trim() && name.trim().toLowerCase() !== 'paciente') {
      localStorage.setItem('mecura_patient_name', name.trim());
    }
    set({ userName: name });
  },
  userEmail: typeof window !== 'undefined' ? (localStorage.getItem('mecura_patient_email') || '') : '',
  setUserEmail: (email) => {
    if (typeof window !== 'undefined' && email && !email.includes('sem-email')) {
      localStorage.setItem('mecura_patient_email', email.trim());
    }
    set({ userEmail: email });
  },
  userPhone: typeof window !== 'undefined' ? (localStorage.getItem('mecura_patient_phone') || '') : '',
  setUserPhone: (phone) => {
    if (typeof window !== 'undefined' && phone) {
      localStorage.setItem('mecura_patient_phone', phone.trim());
    }
    set({ userPhone: phone });
  },
  userCpf: typeof window !== 'undefined' ? (localStorage.getItem('mecura_patient_cpf') || '') : '',
  setUserCpf: (cpf) => {
    if (typeof window !== 'undefined' && cpf) {
      localStorage.setItem('mecura_patient_cpf', cpf.trim());
    }
    set({ userCpf: cpf });
  },
  userBirthDate: typeof window !== 'undefined' ? (localStorage.getItem('mecura_patient_birthdate') || '') : '',
  setUserBirthDate: (birthDate) => {
    if (typeof window !== 'undefined' && birthDate) {
      localStorage.setItem('mecura_patient_birthdate', birthDate.trim());
    }
    set({ userBirthDate: birthDate });
  },
  userTier: 'Essencial',
  setUserTier: (tier) => set({ userTier: tier }),
  
  onboardingStep: 0,
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  hasCompletedOnboarding: typeof window !== 'undefined' ? localStorage.getItem('mecura_onboarding_done') === 'true' : false,
  setHasCompletedOnboarding: (status) => {
    if (typeof window !== 'undefined') {
      if (status) localStorage.setItem('mecura_onboarding_done', 'true');
      else localStorage.removeItem('mecura_onboarding_done');
    }
    set({ hasCompletedOnboarding: status });
  },
  healthStreak: 0,
  incrementStreak: () => set((state) => ({ healthStreak: state.healthStreak + 1 })),
  
  answers: (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mecura_triage_answers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { objectives: [], ...parsed };
          }
        }
      } catch {}
    }
    return { objectives: [] };
  })(),
  setAnswer: (key, value) => set((state) => {
    const nextAnswers = { ...state.answers, [key]: value };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mecura_triage_answers', JSON.stringify(nextAnswers));
      } catch {}
    }
    return { answers: nextAnswers };
  }),
  
  pagamento_consulta: typeof window !== 'undefined' ? localStorage.getItem('mecura_pagamento') === 'true' : false,
  setPagamentoConsulta: (status) => { 
    if (typeof window !== 'undefined') { 
      if (status) localStorage.setItem('mecura_pagamento', 'true');
      else localStorage.removeItem('mecura_pagamento'); 
    } 
    set({ pagamento_consulta: status }); 
    if (status) set({ isConsultationFinished: false }); 
  },
  pagamento_premium: typeof window !== 'undefined' ? localStorage.getItem('mecura_premium') === 'true' : false,
  setPagamentoPremium: (status) => { 
    if (typeof window !== 'undefined') {
      if (status) localStorage.setItem('mecura_premium', 'true');
      else localStorage.removeItem('mecura_premium');
    }
    set({ pagamento_premium: status }); 
    if (status) set({ isConsultationFinished: false }); 
  },
  selectedOffer: typeof window !== 'undefined' ? ((localStorage.getItem('last_offer') as any) || null) : null,
  setSelectedOffer: (offer) => {
    if (typeof window !== 'undefined' && offer) {
      localStorage.setItem('last_offer', offer);
    }
    set({ selectedOffer: offer });
  },
  
  scheduledConsultation: null,
  setScheduledConsultation: (consultation) => set({ scheduledConsultation: consultation }),
  consultationStatus: 'pending',
  setConsultationStatus: (status) => set({ consultationStatus: status }),
  
  allAppointments: [],
  blockedDates: [],
  blockDate: async (date, reason, fullDay = true, times = []) => {
    try {
      const docId = date;
      const data = {
        date,
        reason: reason || 'Agenda bloqueada pelo médico',
        fullDay,
        times: fullDay ? [] : times,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'blocked_dates', docId), data);
      set((state) => {
        const filtered = state.blockedDates.filter(b => b.id !== docId && b.date !== date);
        return { blockedDates: [...filtered, { id: docId, ...data }] };
      });
    } catch (error) {
      console.error("Error blocking date in Firestore:", error);
    }
  },
  unblockDate: async (idOrDate) => {
    try {
      await deleteDoc(doc(db, 'blocked_dates', idOrDate));
      set((state) => ({
        blockedDates: state.blockedDates.filter(b => b.id !== idOrDate && b.date !== idOrDate)
      }));
    } catch (error) {
      console.error("Error unblocking date in Firestore:", error);
    }
  },
  blockMonth: async (yearMonth, reason) => {
    try {
      const [yearStr, monthStr] = yearMonth.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysCount = new Date(year, month, 0).getDate();
      
      const batch = writeBatch(db);
      const newBlockedItems: BlockedDate[] = [];
      const nowIso = new Date().toISOString();

      for (let day = 1; day <= daysCount; day++) {
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const dateStr = `${yearMonth}-${dayStr}`;
        const docRef = doc(db, 'blocked_dates', dateStr);
        const data = {
          date: dateStr,
          reason: reason || 'Mês inteiro bloqueado pelo médico',
          fullDay: true,
          times: [],
          createdAt: nowIso
        };
        batch.set(docRef, data);
        newBlockedItems.push({ id: dateStr, ...data });
      }

      await batch.commit();

      set((state) => {
        const remaining = state.blockedDates.filter(b => !b.date.startsWith(yearMonth));
        return { blockedDates: [...remaining, ...newBlockedItems] };
      });
      console.log(`[blockMonth] Mês ${yearMonth} bloqueado com sucesso (${daysCount} dias).`);
    } catch (error) {
      console.error("Error blocking month in Firestore:", error);
    }
  },
  unblockMonth: async (yearMonth) => {
    try {
      const state = get();
      const toDelete = state.blockedDates.filter(b => b.date.startsWith(yearMonth));
      if (toDelete.length > 0) {
        const batch = writeBatch(db);
        for (const item of toDelete) {
          batch.delete(doc(db, 'blocked_dates', item.id || item.date));
        }
        await batch.commit();
      }
      set((state) => ({
        blockedDates: state.blockedDates.filter(b => !b.date.startsWith(yearMonth))
      }));
      console.log(`[unblockMonth] Mês ${yearMonth} desbloqueado com sucesso.`);
    } catch (error) {
      console.error("Error unblocking month in Firestore:", error);
    }
  },
  addAppointment: async (appointment) => {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointment,
        status: appointment.status || 'pending'
      });
      // Let onSnapshot handle state update to avoid duplicates
      // We don't manually append it here.
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
  cancelAppointment: async (id, reason) => {
    try {
      const updateData: any = { status: 'cancelled' };
      if (reason) {
        updateData.cancelReason = reason;
      }
      await updateDoc(doc(db, 'appointments', id), updateData);
      set((state) => ({
        allAppointments: state.allAppointments.map((app) => 
          app.id === id ? { ...app, status: 'cancelled' as const, cancelReason: reason } : app
        )
      }));
    } catch (error) {
      console.error("Error cancelling appointment in Firestore:", error);
    }
  },
  rescheduleAppointment: async (id, date, time) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { date, time, status: 'confirmed' });
      set((state) => ({
        allAppointments: state.allAppointments.map((app) => 
          app.id === id ? { ...app, date, time, status: 'confirmed' as const } : app
        )
      }));
    } catch (error) {
      console.error("Error rescheduling appointment in Firestore:", error);
    }
  },
  
  patientId: typeof window !== 'undefined' ? localStorage.getItem('mecura_patientId') : null,
  setPatientId: (id) => { if (typeof window !== 'undefined') { if (id) localStorage.setItem('mecura_patientId', id); else localStorage.removeItem('mecura_patientId'); } set({ patientId: id }); },
  
  inQueue: false,
  queuePosition: 0,
  estimatedWaitTime: 0,
  queue: [],
  joinQueue: async (patient) => {
    const state = get();
    const patientObj: Record<string, any> = typeof patient === 'string' ? { id: patient } : ((patient as any) || {});
    const currentUserId = patientObj.id || auth.currentUser?.uid || state.patientId || (typeof window !== 'undefined' ? localStorage.getItem('mecura_patientId') : '') || `anon_${Date.now()}`;
    const targetUid = auth.currentUser?.uid || currentUserId;

    // Strictly verify payment: must have payment confirmed in user document, queue document, or verified payment payload
    let isDocPaid = false;
    let isAlreadyInActiveQueue = false;
    let existingQueueStatus: string | null = null;
    let uData: any = null;
    let resolvedPatientName = (patientObj.patientName || patientObj.name || state.userName || '').trim();
    if (resolvedPatientName.toLowerCase() === 'paciente') resolvedPatientName = '';
    
    let resolvedEmail = patientObj.email || state.userEmail || auth.currentUser?.email || '';
    if (resolvedEmail.includes('sem-email')) resolvedEmail = '';
    
    let resolvedPhone = patientObj.phone || state.userPhone || state.answers?.phone || '';
    let resolvedCpf = patientObj.cpf || state.userCpf || state.answers?.cpf || '';
    let resolvedBirthDate = patientObj.birthDate || state.userBirthDate || state.answers?.birthDate || '';
    let resolvedAnswers = {
      ...state.answers,
      ...(patientObj.answers || {})
    };

    try {
      if (targetUid) {
        const [userDoc, queueDoc] = await Promise.all([
          getDoc(doc(db, 'users', targetUid)).catch(() => null),
          getDoc(doc(db, 'queue', targetUid)).catch(() => null)
        ]);

        if (queueDoc && queueDoc.exists()) {
          const qData = queueDoc.data();
          if (qData.status === 'waiting' || qData.status === 'in-consultation') {
            isAlreadyInActiveQueue = true;
            existingQueueStatus = qData.status;
          }
        }

        if (userDoc && userDoc.exists()) {
          uData = userDoc.data();
          const isAwaitingOrFinished = (
            uData.consultationStatus === 'awaiting_payment' ||
            uData.consultationStatus === 'not_started' ||
            uData.consultationStatus === 'finished' ||
            uData.isConsultationFinished === true
          );
          isDocPaid = !!(
            isAlreadyInActiveQueue ||
            (!isAwaitingOrFinished && (
              uData.pagamento_consulta === true || 
              uData.hasPaid === true || 
              uData.isPaid === true || 
              uData.bypassedPayment === true
            ))
          );

          if (uData.name && typeof uData.name === 'string' && uData.name.trim().toLowerCase() !== 'paciente') {
            resolvedPatientName = uData.name.trim();
            get().setUserName(resolvedPatientName);
            if (typeof window !== 'undefined') localStorage.setItem('mecura_patient_name', resolvedPatientName);
          }
          if (uData.email && !uData.email.includes('sem-email')) {
            resolvedEmail = uData.email;
            get().setUserEmail(resolvedEmail);
          }
          if (uData.phone) {
            resolvedPhone = uData.phone;
            get().setUserPhone(resolvedPhone);
          }
          if (uData.cpf) {
            resolvedCpf = uData.cpf;
            get().setUserCpf(resolvedCpf);
          }
          if (uData.birthDate) {
            resolvedBirthDate = uData.birthDate;
            get().setUserBirthDate(resolvedBirthDate);
          }
          if (uData.answers) {
            resolvedAnswers = { ...resolvedAnswers, ...uData.answers };
            Object.entries(uData.answers).forEach(([k, v]) => get().setAnswer(k, v));
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch user data for queue hydration:", e);
    }

    const approvedAtRaw = typeof window !== 'undefined' ? Number(localStorage.getItem('mecura_payment_approved_at') || 0) : 0;
    const isRecentlyApproved = approvedAtRaw > 0 && (Date.now() - approvedAtRaw) < 600000;

    const isExplicitFreshPayment = !!(
      isRecentlyApproved ||
      patientObj.freshPayment === true ||
      patientObj.pagamento_consulta === true ||
      patientObj.hasPaid === true ||
      patientObj.isPaid === true
    );

    const isAwaitingNewPaymentInDoc = !!(
      !isExplicitFreshPayment && !isAlreadyInActiveQueue && uData && (
        uData.consultationStatus === 'finished' ||
        uData.isConsultationFinished === true
      )
    );

    const hasVerifiedPayment = !!(
      isExplicitFreshPayment ||
      isAlreadyInActiveQueue ||
      isDocPaid ||
      state.pagamento_consulta === true ||
      (typeof window !== 'undefined' && localStorage.getItem('mecura_pagamento') === 'true')
    );

    if (!hasVerifiedPayment) {
      console.warn('[JOIN QUEUE] Bloqueado: Paciente tentou entrar na fila sem pagamento confirmado para esta consulta.');
      set({ inQueue: false, pagamento_consulta: false });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mecura_pagamento');
        localStorage.removeItem('mecura_consultation_active');
      }
      return;
    }

    // Save the verified payment state and user ID
    if (typeof window !== 'undefined') { 
      localStorage.setItem('mecura_patientId', currentUserId); 
      localStorage.setItem('mecura_pagamento', 'true');
      localStorage.removeItem('mecura_consultation_finished');
      localStorage.removeItem('mecura_consultation_active');
      localStorage.removeItem('mecura_queue_display_pos');
      localStorage.removeItem('mecura_queue_entered_at');
      localStorage.removeItem('mecura_queue_notified_10m');
    }
    set({ 
      patientId: currentUserId,
      inQueue: true,
      isConsultationFinished: false,
      consultationActive: false,
      pagamento_consulta: true,
      messages: []
    });
    
    // Resolve the paid plan strictly in priority order (explicit patient plan > store selectedOffer > localStorage last_offer > active Firestore doc)
    const validPlans = ['basic', 'premium', 'complete', 'psychologist'];
    const explicitPatientPlan = patientObj.plan || patientObj.selectedOffer;
    const localOffer = typeof window !== 'undefined' ? localStorage.getItem('last_offer') : null;
    const docPlan = !isAwaitingNewPaymentInDoc ? (uData?.plan || uData?.selectedOffer) : null;

    let resolvedPlan: 'basic' | 'premium' | 'complete' | 'psychologist' = 'basic';
    if (explicitPatientPlan && validPlans.includes(explicitPatientPlan)) {
      resolvedPlan = explicitPatientPlan as any;
    } else if (patientObj.isPremium !== undefined) {
      resolvedPlan = patientObj.isPremium ? 'premium' : 'basic';
    } else if (state.selectedOffer && validPlans.includes(state.selectedOffer)) {
      resolvedPlan = state.selectedOffer;
    } else if (localOffer && validPlans.includes(localOffer)) {
      resolvedPlan = localOffer as any;
    } else if (docPlan && validPlans.includes(docPlan)) {
      resolvedPlan = docPlan as any;
    } else if (!isAwaitingNewPaymentInDoc && (state.pagamento_premium || uData?.pagamento_premium || uData?.isPremium)) {
      resolvedPlan = 'premium';
    }

    const isPremium = resolvedPlan === 'premium' || resolvedPlan === 'complete';

    if (typeof window !== 'undefined') {
      localStorage.setItem('last_offer', resolvedPlan);
      if (isPremium) {
        localStorage.setItem('mecura_premium', 'true');
      } else {
        localStorage.removeItem('mecura_premium');
      }
    }

    if (!resolvedPatientName) {
      const storedName = typeof window !== 'undefined' ? localStorage.getItem('mecura_patient_name') : '';
      if (storedName && storedName.toLowerCase() !== 'paciente') {
        resolvedPatientName = storedName;
      } else {
        resolvedPatientName = 'Paciente';
      }
    }

    const finalPatientName = resolvedPatientName;

    const isPsychologistConsultation = !!(
      patientObj.queueType === 'psychologist' ||
      resolvedPlan === 'psychologist'
    );

    const resolvedQueueType = patientObj.queueType || (isPsychologistConsultation ? 'psychologist' : 'doctor');
    const resolvedStatus = existingQueueStatus === 'in-consultation' ? 'in-consultation' : 'waiting';
    const allowDualChat = resolvedPlan === 'complete' || !!patientObj.allowDualChat;

    let newPatient = { 
      id: currentUserId, 
      patientName: finalPatientName, 
      name: finalPatientName, 
      email: resolvedEmail || 'sem-email@mecura.com',
      phone: resolvedPhone,
      cpf: resolvedCpf,
      birthDate: resolvedBirthDate,
      isPremium: isPremium,
      plan: resolvedPlan,
      selectedOffer: resolvedPlan,
      tier: isPremium ? 'Premium' : 'basic',
      queueType: resolvedQueueType,
      allowDualChat,
      answers: {
        ...resolvedAnswers,
        birthDate: resolvedBirthDate,
        cpf: resolvedCpf,
        phone: resolvedPhone
      },
      ...patientObj,
      // Ensure real name and resolved plan are never overwritten by stale values
      ...(finalPatientName !== 'Paciente' ? { patientName: finalPatientName, name: finalPatientName } : {}),
      pagamento_premium: isPremium
    };

    const queuePayload = {
      ...newPatient,
      id: currentUserId,
      patientId: currentUserId,
      isPremium,
      plan: resolvedPlan,
      selectedOffer: resolvedPlan,
      tier: isPremium ? 'Premium' : 'basic',
      queueType: resolvedQueueType,
      allowDualChat,
      joinedAt: new Date().toISOString(),
      status: resolvedStatus,
      freshPayment: isExplicitFreshPayment,
      pagamento_consulta: true,
      hasPaid: true,
      isPaid: true,
      pagamento_premium: isPremium,
      hasUnread: true,
      lastMessageText: resolvedQueueType === 'psychologist' ? 'Aguardando atendimento psicológico' : (allowDualChat ? 'Plano Completo 360° (Médico + Psicólogo) — Aguardando atendimento' : 'Aguardando atendimento médico'),
      lastMessageAt: new Date().toISOString()
    };

    // Update Zustand queue immediately so patient is instantly in queue
    const currentQueue = get().queue || [];
    const existsIdx = currentQueue.findIndex(q => q.id === currentUserId);
    let updatedQueue: any[];
    if (existsIdx >= 0) {
      updatedQueue = currentQueue.map((item, idx) => idx === existsIdx ? { ...item, ...queuePayload, joinedAt: item.joinedAt || new Date() } : item);
    } else {
      updatedQueue = [{ ...queuePayload, joinedAt: new Date() }, ...currentQueue];
    }

    set({ 
      patientId: currentUserId,
      inQueue: resolvedStatus === 'waiting',
      isConsultationFinished: false,
      consultationActive: resolvedStatus === 'in-consultation',
      pagamento_consulta: true,
      pagamento_premium: isPremium,
      queue: updatedQueue,
      queuePosition: existsIdx >= 0 ? existsIdx + 1 : 1,
      estimatedWaitTime: isPremium ? 5 : 10,
      ...(patientObj.freshPayment === true && !isAlreadyInActiveQueue ? { messages: [] } : {})
    });
    
    try {
      // Clear previous messages from active_consultations ONLY on a brand new payment (never when re-joining an open queue!)
      if (patientObj.freshPayment === true && !isAlreadyInActiveQueue) {
        try {
          const msgsRef = collection(db, 'active_consultations', currentUserId, 'messages');
          const msgsSnap = await getDocs(msgsRef);
          msgsSnap.forEach((docSnap) => {
             deleteDoc(doc(msgsRef, docSnap.id)).catch(() => {});
          });
        } catch (err) {
          console.warn("Could not delete old messages:", err);
        }
      }

      // Write to Firestore queue with merge
      try {
        await setDoc(doc(db, 'queue', currentUserId), queuePayload, { merge: true });
      } catch (e) {
        console.warn("[FIRESTORE QUEUE] setDoc caught:", e);
      }

      // Also sync to persistent server queue API so doctor receives patient even when Firestore daily free quota is exceeded
      try {
        await fetch('/api/queue/force-join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queuePayload)
        });
      } catch (e) {
        console.warn('[SERVER QUEUE SYNC] Error:', e);
      }

      // Also ensure user document reflects active payment and waiting queue status without wiping existing data
      try {
        const userUpdateData: Record<string, any> = {
          id: currentUserId,
          inQueue: true,
          consultationStatus: 'waiting',
          isConsultationFinished: false,
          consultationActive: false,
          isPremium,
          plan: resolvedPlan,
          selectedOffer: resolvedPlan,
          tier: isPremium ? 'Premium' : 'basic',
          queueType: resolvedQueueType,
          allowDualChat,
          lastUpdated: new Date().toISOString()
        };

        if (hasVerifiedPayment) {
          userUpdateData.pagamento_consulta = true;
          userUpdateData.pagamento_premium = isPremium;
          userUpdateData.hasPaid = true;
          userUpdateData.isPaid = true;
        }

        // ONLY write identity fields if they are REAL, non-empty values (never overwrite with 'Paciente' or blank!)
        if (newPatient.patientName && typeof newPatient.patientName === 'string' && newPatient.patientName.trim().toLowerCase() !== 'paciente') {
          userUpdateData.name = newPatient.patientName.trim();
        }
        if (newPatient.email && typeof newPatient.email === 'string' && !newPatient.email.includes('sem-email') && newPatient.email.trim() !== '') {
          userUpdateData.email = newPatient.email.trim();
        }
        if (newPatient.phone && typeof newPatient.phone === 'string' && newPatient.phone.trim()) {
          userUpdateData.phone = newPatient.phone.trim();
        }
        if (newPatient.cpf && typeof newPatient.cpf === 'string' && newPatient.cpf.trim()) {
          userUpdateData.cpf = newPatient.cpf.trim();
        }
        if (newPatient.birthDate && typeof newPatient.birthDate === 'string' && newPatient.birthDate.trim()) {
          userUpdateData.birthDate = newPatient.birthDate.trim();
        }
        if (newPatient.answers && Object.keys(newPatient.answers).length > 0) {
          userUpdateData.answers = newPatient.answers;
        }

        await setDoc(doc(db, 'users', currentUserId), userUpdateData, { merge: true });
      } catch (userErr) {
        console.warn("Could not update user doc during joinQueue:", userErr);
      }
      
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
         import('../utils/notifications').then(({ subscribeToBackgroundNotifications }) => {
            subscribeToBackgroundNotifications(currentUserId).catch(() => {});
         }).catch(() => {});
      }
      
      triggerAdminBackgroundPush(
        isPremium ? '👑 Novo Paciente VIP na Fila' : 'Novo Paciente na Fila',
        `${newPatient.patientName} acabou de entrar na fila de espera.`,
        '/doctor'
      );
    } catch (error) {
      console.error("Error joining queue in Firestore", error);
      // Fallback for local if Firestore fails
      set((state) => ({ 
        queue: [...state.queue, { ...newPatient, isPremium, joinedAt: new Date() }],
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
  transferPatientQueue: async (patientId: string, targetQueueType: 'doctor' | 'psychologist') => {
    if (!patientId) return;

    // Fetch existing docs from Firestore first to guarantee complete data retention
    let fsQueueData: any = {};
    let fsUserData: any = {};
    try {
      const qSnap = await getDoc(doc(db, 'queue', patientId));
      if (qSnap.exists()) fsQueueData = qSnap.data() || {};
      const uSnap = await getDoc(doc(db, 'users', patientId));
      if (uSnap.exists()) fsUserData = uSnap.data() || {};
    } catch (e) {
      console.warn("Could not pre-fetch docs for transfer:", e);
    }

    const currentQueueState = get().queue || [];
    const existingPatient = (currentQueueState.find(p => p.id === patientId) || {}) as any;

    // Merge in priority order: user doc < queue doc < store state
    const combined = { ...fsUserData, ...fsQueueData, ...existingPatient };

    const rawName = combined.patientName || combined.name || combined.full_name || combined.fullName || combined.nome || fsUserData.patientName || fsUserData.name || fsUserData.full_name || fsQueueData.patientName || fsQueueData.name || '';
    const patientName = (rawName && typeof rawName === 'string' && rawName.trim().toLowerCase() !== 'paciente')
      ? rawName.trim()
      : (combined.patientName || combined.name || 'Paciente').trim();

    const cpf = combined.cpf || combined.answers?.cpf || fsUserData.cpf || fsQueueData.cpf || '';
    const phone = combined.phone || combined.whatsapp || combined.answers?.phone || fsUserData.phone || fsUserData.whatsapp || fsQueueData.phone || '';
    const birthDate = combined.birthDate || combined.answers?.birthDate || fsUserData.birthDate || fsQueueData.birthDate || '';
    const email = combined.email || fsUserData.email || fsQueueData.email || '';
    const answers = { ...(fsUserData.answers || {}), ...(fsQueueData.answers || {}), ...(existingPatient.answers || {}) };

    // PRESERVE original plan and premium status!
    const isPrem = !!(combined.isPremium || combined.plan === 'premium' || combined.plan === 'complete' || combined.tier === 'Premium' || combined.selectedOffer === 'premium' || fsUserData.isPremium || fsUserData.plan === 'premium' || fsUserData.plan === 'complete');
    const existingPlan = combined.plan || combined.selectedOffer || fsUserData.plan || fsQueueData.plan || (isPrem ? 'premium' : (targetQueueType === 'psychologist' ? 'psychologist' : 'basic'));

    const targetLabel = targetQueueType === 'psychologist' ? 'Psicólogo (Marco Antônio Boastik)' : 'Médico (Dr. Guilherme)';
    const lastMsg = targetQueueType === 'psychologist' 
      ? 'Aguardando atendimento do Psicólogo' 
      : 'Aguardando atendimento do Médico';

    const updateData = {
      ...combined,
      id: patientId,
      patientId: patientId,
      patientName,
      name: patientName,
      cpf,
      phone,
      birthDate,
      email,
      answers,
      isPremium: isPrem,
      plan: existingPlan,
      selectedOffer: existingPlan,
      queueType: targetQueueType,
      allowDualChat: true,
      activeProfessionalChat: targetQueueType,
      transferredAt: new Date().toISOString(),
      pagamento_consulta: true,
      hasPaid: true,
      isPaid: true,
      status: 'waiting',
      inQueue: true,
      consultationStatus: 'waiting',
      consultationActive: true,
      hasUnread: true,
      lastMessageText: lastMsg,
      lastMessageAt: new Date().toISOString()
    };

    // 1. Update local store state immediately
    set((state) => {
      const updatedQueue = (state.queue || []).map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            ...updateData
          };
        }
        return p;
      });
      return { queue: updatedQueue };
    });

    // 2. Update Firestore queue document safely
    try {
      await setDoc(doc(db, 'queue', patientId), updateData, { merge: true });
    } catch (e) {
      console.warn("Error updating queue doc for queue transfer:", e);
    }

    // 3. Update Firestore user document safely
    try {
      await setDoc(doc(db, 'users', patientId), {
        patientName,
        name: patientName,
        cpf,
        phone,
        birthDate,
        email,
        answers,
        queueType: targetQueueType,
        allowDualChat: true,
        activeProfessionalChat: targetQueueType,
        transferredAt: new Date().toISOString(),
        plan: existingPlan,
        selectedOffer: existingPlan,
        isPremium: isPrem,
        pagamento_consulta: true,
        hasPaid: true,
        isPaid: true,
        consultationStatus: 'waiting',
        consultationActive: true,
        inQueue: true,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Error updating user doc for queue transfer:", e);
    }

    // 4. Sync with server queue
    try {
      await fetch('/api/queue/force-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
    } catch (e) {
      // Non-critical
    }

    // 5. Send automated message to chat notifying the patient
    try {
      const { addMessage } = get();
      await addMessage({
        text: `📋 ENCAMINHAMENTO DE FILA: Seu atendimento foi transferido para a fila do ${targetLabel}. Por favor, aguarde que o profissional de saúde irá te atender em breve.`,
        sender: 'doctor',
        type: 'text',
        professionalRole: targetQueueType,
        isQueueTransfer: true,
        targetQueueType
      }, patientId);
    } catch (e) {
      console.warn("Error sending transfer message:", e);
    }
  },
  updateQueue: (position, waitTime) => set({ queuePosition: position, estimatedWaitTime: waitTime }),
  
  subscribeToQueue: () => {
    let isInitialLoadQueue = true;
    const knownWaitingIds = new Set<string>();
    const prevUnreadStates: Record<string, boolean> = {};

    // Helper to fetch server fallback queue
    const syncWithServerQueue = async () => {
      try {
        const res = await fetch('/api/queue');
        if (!res.ok) return;
        const resData = await res.json();
        if (resData.success && Array.isArray(resData.queue) && resData.queue.length > 0) {
          set(state => {
            const currentQueue = state.queue || [];
            const map = new Map<string, any>();
            // Keep current items
            currentQueue.forEach(item => map.set(item.id, item));
            // Merge server items
            resData.queue.forEach((item: any) => {
              if (!item || !item.id) return;
              const prev = map.get(item.id) || {};
              const rawItemPlan = item.plan || item.selectedOffer || prev.plan || prev.selectedOffer;
              const resolvedItemPlan = (rawItemPlan === 'complete' || rawItemPlan === 'premium' || rawItemPlan === 'psychologist' || rawItemPlan === 'basic')
                ? rawItemPlan
                : (item.isPremium === true ? 'premium' : 'basic');
              const isPrem = resolvedItemPlan === 'premium' || resolvedItemPlan === 'complete';
              let parsedDate = item.joinedAt ? new Date(item.joinedAt) : (prev.joinedAt || new Date());
              if (isNaN(parsedDate.getTime())) parsedDate = new Date();
              
              const resolvedName = (item.patientName && typeof item.patientName === 'string' && item.patientName.trim().toLowerCase() !== 'paciente')
                ? item.patientName.trim()
                : (prev.patientName && typeof prev.patientName === 'string' && prev.patientName.trim().toLowerCase() !== 'paciente')
                  ? prev.patientName.trim()
                  : (item.patientName || prev.patientName || 'Paciente').trim();

              const resolvedStatus = (prev.status === 'in-consultation' || prev.status === 'finished') && item.status === 'waiting'
                ? prev.status
                : (item.status || prev.status || 'waiting');

              map.set(item.id, {
                ...prev,
                ...item,
                status: resolvedStatus,
                patientName: resolvedName,
                name: resolvedName,
                cpf: item.cpf || prev.cpf || '',
                phone: item.phone || prev.phone || '',
                birthDate: item.birthDate || prev.birthDate || '',
                email: item.email || prev.email || '',
                answers: { ...(prev.answers || {}), ...(item.answers || {}) },
                isPremium: isPrem,
                pagamento_premium: isPrem,
                plan: resolvedItemPlan,
                selectedOffer: resolvedItemPlan,
                joinedAt: parsedDate
              });
            });
            const merged = Array.from(map.values()).sort((a, b) => {
              const timeA = a.joinedAt instanceof Date && !isNaN(a.joinedAt.getTime()) ? a.joinedAt.getTime() : 0;
              const timeB = b.joinedAt instanceof Date && !isNaN(b.joinedAt.getTime()) ? b.joinedAt.getTime() : 0;
              return timeA - timeB;
            });
            return { queue: merged };
          });
        }
      } catch (err) {
        // Non-critical background fallback
      }
    };

    // Initial server queue fetch and polling interval
    syncWithServerQueue();
    const serverPollInterval = setInterval(syncWithServerQueue, 8000);

    const q = collection(db, 'queue');
    const unsubFirestore = onSnapshot(q, (snapshot) => {
      const isDoctorRoute = typeof window !== 'undefined' && (
        window.location.pathname.includes('/doctor') || 
        window.location.pathname.includes('/admin') ||
        window.location.href.includes('doctor')
      );
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.includes('/admin');

      let queueData = snapshot.docs.map(doc => {
        const data = doc.data();
        const rawDocPlan = data.plan || data.selectedOffer;
        const resolvedDocPlan = (rawDocPlan === 'complete' || rawDocPlan === 'premium' || rawDocPlan === 'psychologist' || rawDocPlan === 'basic')
          ? rawDocPlan
          : (data.isPremium === true || data.pagamento_premium === true ? 'premium' : 'basic');
        const isPrem = resolvedDocPlan === 'premium' || resolvedDocPlan === 'complete';
        let parsedJoinedAt = new Date();
        if (data.joinedAt?.toDate) {
          parsedJoinedAt = data.joinedAt.toDate();
        } else if (data.joinedAt) {
          const parsed = new Date(data.joinedAt);
          if (!isNaN(parsed.getTime())) parsedJoinedAt = parsed;
        }
        const pName = (data.patientName || data.name || 'Paciente').trim();
        return {
          id: doc.id,
          patientId: doc.id,
          ...data,
          patientName: pName,
          name: pName,
          isPremium: isPrem,
          pagamento_premium: isPrem,
          plan: resolvedDocPlan,
          selectedOffer: resolvedDocPlan,
          joinedAt: parsedJoinedAt
        };
      }) as any[];

      // Merge Firestore snapshot with current store queue to preserve server-cached patients (e.g. when Firestore write quota is reached)
      const currentStoreQueue = get().queue || [];
      const mergedMap = new Map<string, any>();
      currentStoreQueue.forEach(p => {
        if (p && p.id && !p.id.startsWith('sample_patient_')) {
          mergedMap.set(p.id, p);
        }
      });
      queueData.forEach(p => {
        if (p && p.id) {
          const prev = mergedMap.get(p.id) || {};
          const resolvedName = (p.patientName && typeof p.patientName === 'string' && p.patientName.toLowerCase() !== 'paciente')
            ? p.patientName
            : (prev.patientName && typeof prev.patientName === 'string' && prev.patientName.toLowerCase() !== 'paciente')
              ? prev.patientName
              : (p.patientName || prev.patientName || 'Paciente');

          mergedMap.set(p.id, { 
            ...prev, 
            ...p,
            patientName: resolvedName,
            name: resolvedName,
            cpf: p.cpf || prev.cpf || '',
            phone: p.phone || prev.phone || '',
            birthDate: p.birthDate || prev.birthDate || '',
            email: p.email || prev.email || '',
            answers: { ...(prev.answers || {}), ...(p.answers || {}) }
          });
        }
      });
      queueData = Array.from(mergedMap.values());

      // Sort by joinedAt ascending safely in JavaScript
      queueData.sort((a, b) => {
        const timeA = a.joinedAt instanceof Date && !isNaN(a.joinedAt.getTime()) ? a.joinedAt.getTime() : 0;
        const timeB = b.joinedAt instanceof Date && !isNaN(b.joinedAt.getTime()) ? b.joinedAt.getTime() : 0;
        return timeA - timeB;
      });

      // If Firestore queue is currently empty, check existing store queue before furnishing demo patients
      if (queueData.length === 0) {
        const currentQueue = get().queue;
        if (currentQueue && currentQueue.length > 0) {
          queueData = currentQueue;
        } else {
          queueData = [
            {
              id: 'sample_patient_vip_1',
              patientName: 'Fernanda Lima Rocha',
              name: 'Fernanda Lima Rocha',
              email: 'fernanda.rocha@email.com',
              phone: '11987654321',
              cpf: '123.456.789-00',
              birthDate: '15/04/1988',
              joinedAt: new Date(Date.now() - 14 * 60 * 1000), // na fila há 14 minutos!
              status: 'waiting',
              isPremium: true,
              plan: 'premium',
              answers: { objectives: ['Ansiedade e Insônia Severa', 'Dores Crônicas'] }
            },
            {
              id: 'sample_patient_basic_2',
              patientName: 'Carlos Roberto Mendes',
              name: 'Carlos Roberto Mendes',
              email: 'carlos.mendes@email.com',
              phone: '11976543210',
              cpf: '987.654.321-99',
              birthDate: '22/09/1975',
              joinedAt: new Date(Date.now() - 4 * 60 * 1000),
              status: 'waiting',
              isPremium: false,
              plan: 'basic',
              answers: { objectives: ['Dores Articulares'] }
            }
          ];
        }
      }

      // GLOBAL LISTENER FOR PATIENT (Runs on all screens)
      if (!isInitialLoadQueue && !isDoctorRoute && !isAdminRoute) {
        const currentUserId = auth.currentUser?.uid || get().patientId;
        if (currentUserId) {
          const myDoc = queueData.find(p => p.id === currentUserId);
          if (myDoc && myDoc.lastMessageAt) {
            const prevState = get().queue.find(p => p.id === currentUserId);
            // Se o lastMessageAt mudou, e o remetente não foi o paciente (ou seja, foi o médico)
            if (prevState && prevState.lastMessageAt !== myDoc.lastMessageAt && !myDoc.hasUnread) {
              if (typeof document !== 'undefined' && document.hidden) {
                import('../utils/sound').then(({ playNotificationSound }) => {
                  playNotificationSound();
                });
                import('../utils/notifications').then(({ showNativeNotification }) => {
                  showNativeNotification('Nova mensagem do Médico', myDoc.lastMessageText || 'Você tem uma nova mensagem.', '/chat');
                });
              } else if (myDoc.lastMessageText && myDoc.lastMessageText.includes('SUA VEZ CHEGOU')) {
                import('../utils/sound').then(({ playNotificationSound }) => {
                  playNotificationSound();
                });
                import('../utils/notifications').then(({ showNativeNotification }) => {
                  showNativeNotification('Nova mensagem do Médico', myDoc.lastMessageText, '/chat');
                });
              }
            }
          }
        }
      }

      if (!isInitialLoadQueue && (isDoctorRoute || isAdminRoute)) {
        // Detect newly joined or updated waiting patients
        queueData.forEach((p) => {
          if (p.status === 'waiting' && !knownWaitingIds.has(p.id)) {
            useAdminStore.getState().addNotification({
              id: 'q_' + p.id + '_' + Date.now(),
              title: 'Novo Paciente na Fila',
              message: `${p.patientName || 'Um paciente'} entrou na fila de atendimento.`,
              date: new Date().toISOString()
            });
            showNativeNotification('🔔 Novo Paciente na Fila', `${p.patientName || 'Um paciente'} aguarda atendimento.`, '/doctor');
          }
        });

        // Detect new unread messages
        queueData.forEach((p) => {
          if (p.hasUnread && !prevUnreadStates[p.id]) {
            useAdminStore.getState().addNotification({
              id: 'msg_' + p.id + '_' + Date.now(),
              title: 'Nova Mensagem',
              message: `${p.patientName || 'Um paciente'} enviou uma mensagem.`,
              date: new Date().toISOString()
            });
            showNativeNotification('💬 Nova Mensagem', `${p.patientName || 'Um paciente'} enviou uma mensagem no chat.`, '/doctor');
          }
        });
      }

      // Refresh known waiting IDs and unread states
      knownWaitingIds.clear();
      queueData.forEach((p) => {
        if (p.status === 'waiting') {
          knownWaitingIds.add(p.id);
        }
        prevUnreadStates[p.id] = !!p.hasUnread;
      });

      isInitialLoadQueue = false;
      
      set({ queue: queueData });
      
      // Update position for current user (if they are a patient)
      const state = get();
      
      if (!isDoctorRoute) {
        const authUid = auth.currentUser?.uid;
        const storedPatientId = state.patientId || (typeof window !== 'undefined' ? localStorage.getItem('mecura_patientId') : null);
        const myEmail = (state.userEmail || auth.currentUser?.email || '').trim().toLowerCase();
        const myPhone = (state.userPhone || state.answers?.phone || '').replace(/\D/g, '');
        const myCpf = (state.userCpf || state.answers?.cpf || '').replace(/\D/g, '');

        // Prioritize matching by authenticated UID FIRST to avoid cross-patient leakage
        let myIndex = -1;
        if (authUid) {
          myIndex = queueData.findIndex(p => p.id === authUid);
        }
        if (myIndex === -1 && storedPatientId && storedPatientId !== 'patient_id') {
          myIndex = queueData.findIndex(p => p.id === storedPatientId);
        }
        if (myIndex === -1 && myEmail) {
          // Check for active waiting/in-consultation with this email first
          myIndex = queueData.findIndex(p => p.email && p.email.toLowerCase() === myEmail && (p.status === 'waiting' || p.status === 'in-consultation'));
          if (myIndex === -1) {
            myIndex = queueData.findIndex(p => p.email && p.email.toLowerCase() === myEmail);
          }
        }
        if (myIndex === -1 && myPhone && myPhone.length >= 8) {
          // Check for active waiting/in-consultation with this phone first
          myIndex = queueData.findIndex(p => p.phone && p.phone.replace(/\D/g, '') === myPhone && (p.status === 'waiting' || p.status === 'in-consultation'));
          if (myIndex === -1) {
            myIndex = queueData.findIndex(p => p.phone && p.phone.replace(/\D/g, '') === myPhone);
          }
        }
        if (myIndex === -1 && myCpf && myCpf.length >= 9) {
          // Check for active waiting/in-consultation with this CPF first
          myIndex = queueData.findIndex(p => p.cpf && p.cpf.replace(/\D/g, '') === myCpf && (p.status === 'waiting' || p.status === 'in-consultation'));
          if (myIndex === -1) {
            myIndex = queueData.findIndex(p => p.cpf && p.cpf.replace(/\D/g, '') === myCpf);
          }
        }

        if (myIndex !== -1) {
          const myEntry = queueData[myIndex];
          const resolvedConsultationId = myEntry.id;
          
          if (state.patientId !== resolvedConsultationId) {
            set({ patientId: resolvedConsultationId });
            if (typeof window !== 'undefined') localStorage.setItem('mecura_patientId', resolvedConsultationId);
          }

          if (myEntry.status === 'in-consultation') {
            if (state.inQueue && typeof document !== 'undefined' && document.hidden) {
              import('../utils/notifications').then(({ showNativeNotification }) => {
                showNativeNotification('Consulta Iniciada!', 'O médico te chamou para a consulta. Clique para abrir.', '/chat');
              });
            }
            if (typeof window !== 'undefined') {
              localStorage.setItem('mecura_pagamento', 'true');
              localStorage.setItem('mecura_consultation_active', 'true');
            }
            set({
              consultationActive: true,
              inQueue: false,
              isConsultationFinished: false,
              activeConsultationId: resolvedConsultationId,
              pagamento_consulta: true
            });
          } else if (myEntry.status === 'finished') {
            if (typeof window !== 'undefined') {
              localStorage.setItem('mecura_pagamento', 'true');
              localStorage.removeItem('mecura_consultation_active');
            }
            set({
              isConsultationFinished: true,
              consultationActive: false,
              pagamento_consulta: true,
              inQueue: false,
              activeConsultationId: resolvedConsultationId
            });
          } else {
            if (typeof window !== 'undefined') {
              localStorage.setItem('mecura_pagamento', 'true');
              localStorage.removeItem('mecura_consultation_active');
            }
            const myTargetQueue = myEntry.queueType === 'psychologist' || myEntry.plan === 'psychologist' ? 'psychologist' : 'doctor';
            const waitingInSameQueue = queueData
              .filter(p => {
                if (p.status !== 'waiting') return false;
                const pQType = p.queueType === 'psychologist' || p.plan === 'psychologist' ? 'psychologist' : 'doctor';
                return pQType === myTargetQueue;
              })
              .sort((a, b) => {
                const isVipA = !!(a.isPremium || a.plan === 'premium' || a.plan === 'complete');
                const isVipB = !!(b.isPremium || b.plan === 'premium' || b.plan === 'complete');
                if (isVipA !== isVipB) return isVipA ? -1 : 1;
                const tA = a.joinedAt instanceof Date ? a.joinedAt.getTime() : new Date(a.joinedAt || 0).getTime();
                const tB = b.joinedAt instanceof Date ? b.joinedAt.getTime() : new Date(b.joinedAt || 0).getTime();
                return tA - tB;
              });
            const waitingIdx = waitingInSameQueue.findIndex(p => p.id === resolvedConsultationId);
            const finalPos = waitingIdx >= 0 ? waitingIdx : 0;
            const isVipEntry = !!(myEntry.isPremium || myEntry.plan === 'premium' || myEntry.plan === 'complete');
            set({
              queuePosition: finalPos, // 0 means next
              estimatedWaitTime: Math.max(1, finalPos + 1) * (isVipEntry ? 5 : 10),
              inQueue: true,
              isConsultationFinished: false,
              consultationActive: false,
              pagamento_consulta: true,
              pagamento_premium: isVipEntry,
              selectedOffer: myEntry.plan || myEntry.selectedOffer || state.selectedOffer || 'basic',
              activeConsultationId: resolvedConsultationId || authUid
            });
          }
        }
      }
    }, (err) => {
      console.warn('[FIRESTORE QUEUE] Erro de conexão/cota:', err);
      syncWithServerQueue();
    });

    return () => {
      unsubFirestore();
      clearInterval(serverPollInterval);
    };
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
  
  subscribeToBlockedDates: () => {
    console.log("Subscribing to blocked_dates collection...");
    const q = query(collection(db, 'blocked_dates'));
    return onSnapshot(q, (snapshot) => {
      const blocked = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as BlockedDate[];
      set({ blockedDates: blocked });
    }, (error) => {
      console.error("Error subscribing to blocked dates:", error);
    });
  },
  
  consultationActive: typeof window !== 'undefined' ? (localStorage.getItem('mecura_consultation_active') === 'true') : false,
  isConsultationFinished: false,
  fetchConsultationHistory: async (patientId) => {
    try {
      const historyRef = collection(db, 'users', patientId, 'consultations');
      const snap = await getDocs(historyRef);
      const history = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: new Date(data.date),
          patientName: data.patientName || 'Paciente',
          messages: data.messages || []
        };
      }) as any[];
      set({ consultationHistory: history });
      if (history.length > 0) {
        const state = get();
        if (!state.inQueue && !state.consultationActive) {
          set({ isConsultationFinished: true });
        }
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  },

  fetchPatientMessages: async (patientId: string) => {
    try {
      const messagesRef = collection(db, 'active_consultations', patientId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const snap = await getDocs(q);
      const msgs: Message[] = snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : new Date())
        } as Message;
      });
      return msgs;
    } catch (err) {
      console.error("Error fetching patient messages for history:", err);
      return [];
    }
  },

  subscribeToAllConsultationHistory: () => {
    const qQueue = query(collection(db, 'queue'), orderBy('joinedAt', 'desc'));
    return onSnapshot(qQueue, async (snapshot) => {
      const historyList: ConsultationHistoryItem[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const pId = docSnap.id;
        const pName = data.patientName || data.name || 'Paciente';
        const pDate = data.finishedAt?.toDate ? data.finishedAt.toDate() : 
                     (data.joinedAt?.toDate ? data.joinedAt.toDate() : 
                     (data.joinedAt ? new Date(data.joinedAt) : new Date()));
        
        let intensity = 5;
        if (data.answers?.intensity !== undefined) {
          intensity = Number(data.answers.intensity);
        } else if (data.answers?.symptomIntensity !== undefined) {
          intensity = Number(data.answers.symptomIntensity);
        }

        let summary = 'Atendimento médico realizado na plataforma MeCura.';
        if (data.answers?.objectives && Array.isArray(data.answers.objectives) && data.answers.objectives.length > 0) {
          summary = `Tratamento para: ${data.answers.objectives.join(', ')}.`;
        } else if (data.answers?.primaryComplaint) {
          summary = `Queixa principal: ${data.answers.primaryComplaint}`;
        } else if (data.lastMessageText) {
          summary = data.lastMessageText;
        }

        historyList.push({
          id: pId,
          patientId: pId,
          patientName: pName,
          email: data.email,
          phone: data.phone || data.whatsapp || data.answers?.phone || data.answers?.whatsapp,
          cpf: data.cpf || data.answers?.cpf,
          birthDate: data.birthDate || data.answers?.birthDate,
          date: pDate,
          messages: [],
          summary: summary,
          intensity: intensity,
          status: data.status || 'waiting',
          isPremium: !!(data.isPremium || data.plan === 'premium' || data.selectedOffer === 'premium' || data.answers?.isPremium),
          plan: data.plan || data.selectedOffer || 'basic',
          answers: data.answers || {}
        });
      }

      set({ consultationHistory: historyList });
    }, (error) => {
      console.error("Error subscribing to consultation history:", error);
    });
  },

  bonusBalance: 0,
  incrementBonus: async (amount: number, userId?: string) => {
    const targetId = userId || auth.currentUser?.uid || get().patientId;
    if (!targetId) return;

    try {
      // In a real app, we'd use a transaction. For this demo, we'll try to get and update.
      const userRef = doc(db, 'users', targetId);
      const userSnap = await getDoc(userRef);
      let currentBonus = 0;
      
      if (userSnap.exists()) {
        currentBonus = userSnap.data().bonusBalance || 0;
      }
      
      const newBonus = currentBonus + amount;
      await setDoc(userRef, { bonusBalance: newBonus }, { merge: true });
      
      // If updating self, update local state
      if (targetId === (auth.currentUser?.uid || get().patientId)) {
        set({ bonusBalance: newBonus });
      }
    } catch (error) {
      console.error("Error incrementing bonus:", error);
      // Fallback to local if not logged in/no firestore access
      if (targetId === (auth.currentUser?.uid || get().patientId)) {
        set((state) => ({ bonusBalance: state.bonusBalance + amount }));
      }
    }
  },
  consultationHistory: [],
  activeConsultationId: null,
  setActiveConsultationId: (id) => set({ activeConsultationId: id }),
  
  startConsultation: async (patientId?: string) => {
    const prevId = get().activeConsultationId;
    const isSwitchingPatient = !!(patientId && prevId && patientId !== prevId);
    const isCurrentPatientSelf = !patientId || patientId === (auth.currentUser?.uid || get().patientId);

    if (typeof window !== 'undefined' && isCurrentPatientSelf) {
      localStorage.setItem('mecura_consultation_active', 'true');
      localStorage.setItem('mecura_pagamento', 'true');
    }

    set((state) => ({ 
      consultationActive: true, 
      inQueue: false,
      ...(isCurrentPatientSelf ? { pagamento_consulta: true } : {}),
      ...(patientId ? { 
        activeConsultationId: patientId,
        queue: state.queue.map(p => p.id === patientId ? { ...p, status: 'in-consultation', hasUnread: false } : p)
      } : {}),
      ...(isSwitchingPatient ? { messages: [] } : {})
    }));
    if (patientId) {
      // Doctor starting consultation
      try {
        const state = get();
        const patient = state.queue.find(p => p.id === patientId);
        
        const validJoinedAt = patient && patient.joinedAt && !isNaN(new Date(patient.joinedAt).getTime()) ? (patient.joinedAt instanceof Date ? patient.joinedAt.toISOString() : new Date(patient.joinedAt).toISOString()) : new Date().toISOString();
        const updates: any = { hasUnread: false, status: 'in-consultation', joinedAt: validJoinedAt };
        if (!patient || patient.status === 'waiting' || patient.status === 'finished') {
          triggerBackgroundPush(
            patientId,
            'Sua vez chegou!',
            'O médico está te chamando no consultório agora. Clique para abrir.',
            '/chat'
          );
        }
        
        await setDoc(doc(db, 'queue', patientId), updates, { merge: true });

        // Synchronize user document so patient's client immediately unblocks and redirects
        await setDoc(doc(db, 'users', patientId), {
          inQueue: false,
          consultationStatus: 'in-consultation',
          consultationActive: true,
          lastUpdated: new Date().toISOString()
        }, { merge: true }).catch(() => {});

        // Direct notification doc
        await setDoc(doc(db, 'notifications', patientId), {
          text: "O Dr. Guilherme já está pronto para te atender! Entre na sala de consulta.",
          timestamp: new Date().toISOString(),
          type: 'next'
        }).catch(() => {});

        // Keep server queue cache updated
        fetch('/api/queue/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, status: 'in-consultation', hasUnread: false })
        }).catch(() => {});
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
    const consultationId = state.activeConsultationId || state.patientId || auth.currentUser?.uid;
    if (consultationId) {
      try {
        const historyRef = collection(db, 'users', consultationId, 'consultations');
        
        // Remove undefined fields
        const sanitizeForFirestore = (obj: any): any => {
          if (obj === undefined) return null;
          if (Array.isArray(obj)) return obj.map(sanitizeForFirestore).filter(v => v !== undefined);
          if (obj !== null && typeof obj === 'object') {
            if (obj instanceof Date) return obj;
            const newObj: any = {};
            for (const key in obj) {
              if (obj[key] !== undefined) {
                newObj[key] = sanitizeForFirestore(obj[key]);
              }
            }
            return newObj;
          }
          return obj;
        };

        const sanitizedPayload = sanitizeForFirestore({
          ...newConsultation,
          date: newConsultation.date.toISOString(),
          messages: newConsultation.messages.map(m => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : (m.timestamp || new Date().toISOString())
          }))
        });

        await addDoc(historyRef, sanitizedPayload);
        console.log('Consultation history saved to Firestore');
        
        const nowFinishedIso = new Date().toISOString();
        // Clean up active consultation - change status to finished and consume active consultation credit
        await updateDoc(doc(db, 'queue', consultationId), {
          status: 'finished',
          hasUnread: false,
          pagamento_consulta: false,
          finishedAt: nowFinishedIso
        }).catch(async () => {
          await setDoc(doc(db, 'queue', consultationId), { status: 'finished', hasUnread: false, pagamento_consulta: false, finishedAt: nowFinishedIso }, { merge: true });
        });

        await setDoc(doc(db, 'users', consultationId), {
          inQueue: false,
          consultationStatus: 'finished',
          isConsultationFinished: true,
          consultationActive: false,
          pagamento_consulta: false,
          hasPaid: false,
          isPaid: false,
          bypassedPayment: false,
          hadPreviousConsultation: true,
          finishedAt: nowFinishedIso,
          lastUpdated: nowFinishedIso
        }, { merge: true }).catch(() => {});

        fetch('/api/queue/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId: consultationId, status: 'finished', hasUnread: false })
        }).catch(() => {});

        set((state) => ({
          queue: state.queue.map(p => p.id === consultationId ? { ...p, status: 'finished', pagamento_consulta: false } as any : p),
          consultationActive: false,
          isConsultationFinished: true,
          inQueue: false
        }));
        
        triggerBackgroundPush(
          consultationId,
          'Consulta Finalizada',
          'Sua consulta foi concluída com sucesso. Acesse seu protocolo e receitas!',
          '/protocol'
        );
        
        // We no longer delete messages from active_consultations to preserve chat history
      } catch (error) {
        console.error('Error saving consultation history:', error);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('mecura_pagamento');
      localStorage.setItem('mecura_consultation_finished', 'true');
      localStorage.removeItem('mecura_consultation_active');
    }

    set((state) => ({ 
      consultationActive: false, 
      isConsultationFinished: true,
      pagamento_consulta: false,
      inQueue: false,
      activeConsultationId: null,
      consultationHistory: [
        ...state.consultationHistory,
        newConsultation
      ]
    }));
  },
  setIsConsultationFinished: (status) => set({ isConsultationFinished: status }),
  resetConsultation: () => { 
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mecura_pagamento');
      localStorage.removeItem('mecura_consultation_active');
      localStorage.removeItem('mecura_consultation_finished');
    }
    return set({ 
      consultationActive: false, 
      isConsultationFinished: false,
      pagamento_consulta: false, 
      inQueue: false,
      answers: { objectives: [] }, 
      messages: [] 
    });
  },
  
  messages: [],
  addMessage: async (msg, customConsultationId?: string) => {
    const state = get();
    // Add a random suffix to Date.now() to prevent duplicate keys if messages are added in the same millisecond
    const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
    let newMessage = { ...msg, id: uniqueId, timestamp: new Date() };
    
    // 1. Optimistic update
    set((state) => ({
      messages: [...state.messages, newMessage]
    }));

    // 2. If attachment is a base64 data URL, persist to /api/upload AND Firestore stored_files (chunked) so message doc stays tiny (< 2KB)
    if (newMessage.attachment?.url && newMessage.attachment.url.startsWith('data:')) {
      try {
        console.log("[addMessage] Persisting attachment via persistAttachmentToCloud:", newMessage.attachment.name);
        const persistedAtt = (await persistAttachmentToCloud(newMessage.attachment)) as NonNullable<Message['attachment']>;
        newMessage = {
          ...newMessage,
          attachment: persistedAtt
        };
        set((s) => ({
          messages: s.messages.map(m => m.id === uniqueId ? { ...m, attachment: persistedAtt } : m)
        }));
      } catch (uploadErr) {
        console.warn("[addMessage] Failed to persist attachment via persistAttachmentToCloud:", uploadErr);
      }
    }

    // 3. Save to Firestore if in an active consultation
    const consultationId = customConsultationId || state.activeConsultationId || state.patientId || auth.currentUser?.uid;
    console.log("addMessage called. consultationId:", consultationId, "msg:", msg);
    
    if (consultationId) {
      try {
        // Remove undefined fields
        const sanitizeForFirestore = (obj: any): any => {
          if (obj === undefined) return null;
          if (Array.isArray(obj)) return obj.map(sanitizeForFirestore).filter(v => v !== undefined);
          if (obj !== null && typeof obj === 'object') {
            if (obj instanceof Date) return obj;
            const newObj: any = {};
            for (const key in obj) {
              if (obj[key] !== undefined) {
                newObj[key] = sanitizeForFirestore(obj[key]);
              }
            }
            return newObj;
          }
          return obj;
        };

        let payload = sanitizeForFirestore({
          ...newMessage,
          timestamp: newMessage.timestamp.toISOString()
        });

        // Final safety check: never allow a >700KB data: URL inside the message doc (would fail Firestore's 1 MiB limit)
        if (payload.attachment?.url && typeof payload.attachment.url === 'string' && payload.attachment.url.startsWith('data:') && payload.attachment.url.length > 700000) {
          try {
            const persistedAtt = await persistAttachmentToCloud(payload.attachment);
            payload.attachment = sanitizeForFirestore(persistedAtt);
          } catch (e) {
            console.warn("[addMessage] Secondary persistAttachmentToCloud failed:", e);
          }
          if (payload.attachment?.url && payload.attachment.url.startsWith('data:') && payload.attachment.url.length > 700000) {
            const fallbackFileId = (payload.attachment as any).fileId || `${Date.now()}_${(payload.attachment.name || 'documento.pdf').replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
            payload.attachment.url = `/api/files/${fallbackFileId}`;
            (payload.attachment as any).fileId = fallbackFileId;
          }
        }

        // Resolve all linked IDs for this patient (e.g. queue ID vs Firebase Auth UID vs patientId)
        const targetIds = new Set<string>([consultationId]);
        const cleanDigits = (val?: string) => (val || '').replace(/\D/g, '');
        const matchedQueueEntry = state.queue.find(p => p.id === consultationId || (p as any).uid === consultationId || (p as any).patientId === consultationId);
        const patientEmail = (matchedQueueEntry?.email || '').trim().toLowerCase();
        const patientCpf = cleanDigits(matchedQueueEntry?.cpf);
        const patientPhone = cleanDigits(matchedQueueEntry?.phone);

        if (matchedQueueEntry) {
          if (matchedQueueEntry.id) targetIds.add(matchedQueueEntry.id);
          if ((matchedQueueEntry as any).uid) targetIds.add((matchedQueueEntry as any).uid);
          if ((matchedQueueEntry as any).patientId) targetIds.add((matchedQueueEntry as any).patientId);
        }

        state.queue.forEach(p => {
          const pEmail = (p.email || '').trim().toLowerCase();
          const pCpf = cleanDigits(p.cpf);
          const pPhone = cleanDigits(p.phone);
          const emailMatch = patientEmail && !patientEmail.includes('sem-email') && pEmail === patientEmail;
          const cpfMatch = patientCpf && patientCpf.length >= 11 && pCpf === patientCpf;
          const phoneMatch = patientPhone && patientPhone.length >= 10 && pPhone === patientPhone;
          if (emailMatch || cpfMatch || phoneMatch) {
            if (p.id) targetIds.add(p.id);
            if ((p as any).uid) targetIds.add((p as any).uid);
            if ((p as any).patientId) targetIds.add((p as any).patientId);
          }
        });

        // Also check Firestore users collection by email or cpf if doctor is sending a message/document
        if (newMessage.sender === 'doctor' && (patientEmail || patientCpf)) {
          try {
            if (patientEmail && !patientEmail.includes('sem-email')) {
              const uSnap = await getDocs(query(collection(db, 'users'), where('email', '==', patientEmail)));
              uSnap.forEach(d => targetIds.add(d.id));
            }
            if (patientCpf && patientCpf.length >= 11 && matchedQueueEntry?.cpf) {
              const uSnapCpf = await getDocs(query(collection(db, 'users'), where('cpf', '==', matchedQueueEntry.cpf)));
              uSnapCpf.forEach(d => targetIds.add(d.id));
            }
          } catch (lookupErr) {
            console.warn("[addMessage] User lookup warning:", lookupErr);
          }
        }

        // Save message to active_consultations/{id}/messages/{newMessage.id} across all linked IDs
        const saveMessageToTarget = async (targetId: string) => {
          const messagesRef = collection(db, 'active_consultations', targetId, 'messages');
          try {
            await setDoc(doc(messagesRef, newMessage.id), payload);
          } catch (writeErr) {
            console.warn(`[addMessage] Primary setDoc failed for ${targetId}, retrying with stripped data URL:`, writeErr);
            const safePayload = {
              ...payload,
              attachment: payload.attachment ? {
                ...payload.attachment,
                url: payload.attachment.url?.startsWith('data:')
                  ? `/api/files/${(payload.attachment as any).fileId || 'documento.pdf'}`
                  : payload.attachment.url
              } : undefined
            };
            await setDoc(doc(messagesRef, newMessage.id), sanitizeForFirestore(safePayload));
          }
        };

        await Promise.all(Array.from(targetIds).map(tid => saveMessageToTarget(tid)));
        console.log("Message saved to active_consultations successfully for IDs:", Array.from(targetIds));

        // If this message is an official document, prescription, or product from the doctor, also persist summary on active_consultations, queue, and users
        const isOfficialDocOrProduct =
          newMessage.sender === 'doctor' &&
          (newMessage.type === 'prescription' ||
           newMessage.type === 'receita_previa' ||
           newMessage.type === 'product' ||
           newMessage.type === 'medical_report' ||
           newMessage.type === 'psychomotor_report' ||
           newMessage.type === 'agronomic_report' ||
           newMessage.type === 'psychological_report' ||
           Boolean(newMessage.docType) ||
           Boolean(newMessage.attachment));

        if (isOfficialDocOrProduct) {
          const docKey = newMessage.docType || newMessage.attachment?.docType || newMessage.type || 'documento';
          const summaryUpdate: Record<string, any> = {
            updatedAt: newMessage.timestamp.toISOString(),
            [`issuedDocuments.${docKey}`]: payload
          };
          if (newMessage.receitaPreviaData?.items && newMessage.receitaPreviaData.items.length > 0) {
            summaryUpdate.prescriptionData = sanitizeForFirestore({
              patientName: newMessage.receitaPreviaData.patientName || matchedQueueEntry?.patientName || '',
              doctorName: newMessage.receitaPreviaData.doctorName || 'Dr. Guilherme Taveira Dias',
              doctorCrm: newMessage.receitaPreviaData.doctorCrm || 'CRM/MT 17259',
              doctorSpecialty: newMessage.receitaPreviaData.doctorSpecialty || 'Clínico Geral • Medicina Endocanabinoide',
              emissionDate: newMessage.receitaPreviaData.emissionDate || new Date().toLocaleDateString('pt-BR'),
              items: newMessage.receitaPreviaData.items,
              notes: newMessage.receitaPreviaData.notes || '',
              updatedAt: newMessage.timestamp.toISOString()
            });
          }

          await Promise.all(Array.from(targetIds).map(async (tid) => {
            await setDoc(doc(db, 'active_consultations', tid), summaryUpdate, { merge: true }).catch(() => {});
            await setDoc(doc(db, 'users', tid), summaryUpdate, { merge: true }).catch(() => {});
            await updateDoc(doc(db, 'queue', tid), summaryUpdate).catch(() => {});
          }));
        }
        
        // Update queue document for WhatsApp-like behavior
        const queueRef = doc(db, 'queue', consultationId);
        await updateDoc(queueRef, {
          lastMessageAt: newMessage.timestamp.toISOString(),
          lastMessageText: newMessage.text || (newMessage.type === 'prescription' ? 'Receita Médica Digital' : (newMessage.type === 'medical_report' ? 'Laudo Médico Oficial' : (newMessage.type === 'product' ? 'Produto prescrito' : 'Documento anexado'))),
          hasUnread: newMessage.sender === 'user' // Only mark unread if patient sent it
        }).catch(err => console.warn("Could not update queue doc:", err));
        console.log("Queue document updated successfully.");
        
        // Trigger background push
        if (newMessage.sender === 'doctor') {
          triggerBackgroundPush(
            consultationId,
            'Nova mensagem da Mecura',
            newMessage.text ? (newMessage.text.length > 50 ? newMessage.text.substring(0, 50) + '...' : newMessage.text) : (newMessage.type === 'prescription' ? 'Receita médica enviada' : 'Você tem uma nova atualização no consultório.'),
            '/chat'
          );
        } else if (newMessage.sender === 'user') {
          triggerAdminBackgroundPush(
            'Nova mensagem de Paciente',
            newMessage.text ? (newMessage.text.length > 50 ? newMessage.text.substring(0, 50) + '...' : newMessage.text) : 'O paciente enviou uma nova mensagem.',
            '/doctor'
          );
        }
      } catch (error) {
        console.error("Error sending message to Firestore:", error);
      }
    } else {
      console.warn("addMessage: No consultationId found. Message not saved to Firestore.");
    }
  },
  
  deleteMessage: async (messageId: string, customConsultationId?: string) => {
    const state = get();
    const targetMsg = state.messages.find(m => m.id === messageId);

    // Record deleted message ID so real-time listeners or multi-ID merges never resurrect it
    try {
      if (typeof window !== 'undefined') {
        const rawDel = localStorage.getItem('mecura_deleted_msg_ids');
        const arr: string[] = rawDel ? JSON.parse(rawDel) : [];
        if (!arr.includes(messageId)) {
          arr.push(messageId);
          if (arr.length > 300) arr.splice(0, arr.length - 300);
          localStorage.setItem('mecura_deleted_msg_ids', JSON.stringify(arr));
        }
      }
    } catch {
      // ignore storage errors
    }

    set((s) => ({
      messages: s.messages.filter(m => m.id !== messageId)
    }));

    const consultationId = customConsultationId || state.activeConsultationId || state.patientId || auth.currentUser?.uid;
    console.log("deleteMessage called. id:", messageId, "consultationId:", consultationId);
    if (consultationId) {
      try {
        // Resolve all linked IDs for this patient so copies across queue ID / auth UID / patientId are all deleted
        const targetIds = new Set<string>([consultationId]);
        if (state.activeConsultationId) targetIds.add(state.activeConsultationId);
        const cleanDigits = (val?: string) => (val || '').replace(/\D/g, '');
        const matchedQueueEntry = state.queue.find(p =>
          p.id === consultationId || (p as any).uid === consultationId || (p as any).patientId === consultationId
        );
        const patientEmail = (matchedQueueEntry?.email || '').trim().toLowerCase();
        const patientCpf = cleanDigits(matchedQueueEntry?.cpf);
        const patientPhone = cleanDigits(matchedQueueEntry?.phone);

        if (matchedQueueEntry) {
          if (matchedQueueEntry.id) targetIds.add(matchedQueueEntry.id);
          if ((matchedQueueEntry as any).uid) targetIds.add((matchedQueueEntry as any).uid);
          if ((matchedQueueEntry as any).patientId) targetIds.add((matchedQueueEntry as any).patientId);
        }

        state.queue.forEach(p => {
          const pEmail = (p.email || '').trim().toLowerCase();
          const pCpf = cleanDigits(p.cpf);
          const pPhone = cleanDigits(p.phone);
          const emailMatch = patientEmail && !patientEmail.includes('sem-email') && pEmail === patientEmail;
          const cpfMatch = patientCpf && patientCpf.length >= 11 && pCpf === patientCpf;
          const phoneMatch = patientPhone && patientPhone.length >= 10 && pPhone === patientPhone;
          if (emailMatch || cpfMatch || phoneMatch) {
            if (p.id) targetIds.add(p.id);
            if ((p as any).uid) targetIds.add((p as any).uid);
            if ((p as any).patientId) targetIds.add((p as any).patientId);
          }
        });

        if (patientEmail && !patientEmail.includes('sem-email')) {
          try {
            const uSnap = await getDocs(query(collection(db, 'users'), where('email', '==', patientEmail)));
            uSnap.forEach(d => targetIds.add(d.id));
          } catch {
            // ignore
          }
        }

        // Delete the message from active_consultations/{tid}/messages/{messageId} across all linked IDs
        await Promise.all(
          Array.from(targetIds).map(tid =>
            deleteDoc(doc(db, 'active_consultations', tid, 'messages', messageId)).catch(() => {})
          )
        );

        // Also clean up any matching issuedDocuments / report summary on parent documents so it is never re-synthesized
        const docKey = targetMsg?.docType || targetMsg?.attachment?.docType || targetMsg?.type;
        const cleanupPayload: Record<string, any> = {};
        if (docKey) {
          cleanupPayload[`issuedDocuments.${docKey}`] = null;
        }
        if (targetMsg?.type) {
          cleanupPayload[`issuedDocuments.${targetMsg.type}`] = null;
        }
        if (messageId.startsWith('syn_medreport_') || targetMsg?.type === 'medical_report' || docKey === 'laudo_inicial' || docKey === 'laudo_evolutivo') {
          cleanupPayload['issuedDocuments.laudo_inicial'] = null;
          cleanupPayload['issuedDocuments.laudo_evolutivo'] = null;
          cleanupPayload['issuedDocuments.medical_report'] = null;
          cleanupPayload.medicalReportData = null;
        }
        if (messageId.startsWith('syn_psyreport_') || targetMsg?.type === 'psychomotor_report' || docKey === 'laudo_psicomotor') {
          cleanupPayload['issuedDocuments.laudo_psicomotor'] = null;
          cleanupPayload['issuedDocuments.psychomotor_report'] = null;
          cleanupPayload.psychomotorReportData = null;
        }
        if (messageId.startsWith('syn_agroreport_') || targetMsg?.type === 'agronomic_report' || docKey === 'laudo_agronomico') {
          cleanupPayload['issuedDocuments.laudo_agronomico'] = null;
          cleanupPayload['issuedDocuments.agronomic_report'] = null;
          cleanupPayload.agronomicReportData = null;
        }
        if (messageId.startsWith('syn_presc_') || targetMsg?.type === 'prescription' || docKey === 'receita') {
          cleanupPayload['issuedDocuments.receita'] = null;
          cleanupPayload['issuedDocuments.prescription'] = null;
        }

        if (Object.keys(cleanupPayload).length > 0) {
          await Promise.all(
            Array.from(targetIds).map(async (tid) => {
              await updateDoc(doc(db, 'active_consultations', tid), cleanupPayload).catch(() => {});
              await updateDoc(doc(db, 'queue', tid), cleanupPayload).catch(() => {});
              await updateDoc(doc(db, 'users', tid), cleanupPayload).catch(() => {});
            })
          );
        }

        console.log("Message deleted from Firestore across all linked IDs:", messageId, Array.from(targetIds));
      } catch (error) {
        console.error("Error deleting message from Firestore:", error);
      }
    }
  },

  clearPrescriptionMessages: async (customConsultationId?: string) => {
    const state = get();
    const prescriptionMsgIds = state.messages
      .filter(m => m.type === 'product' || m.type === 'prescription' || m.type === 'prescription_notes' || m.type === 'receita_previa')
      .map(m => m.id);

    try {
      if (typeof window !== 'undefined' && prescriptionMsgIds.length > 0) {
        const rawDel = localStorage.getItem('mecura_deleted_msg_ids');
        const arr: string[] = rawDel ? JSON.parse(rawDel) : [];
        prescriptionMsgIds.forEach(id => {
          if (!arr.includes(id)) arr.push(id);
        });
        if (arr.length > 300) arr.splice(0, arr.length - 300);
        localStorage.setItem('mecura_deleted_msg_ids', JSON.stringify(arr));
      }
    } catch {
      // ignore
    }

    set((s) => ({
      messages: s.messages.filter(m => m.type !== 'product' && m.type !== 'prescription' && m.type !== 'prescription_notes' && m.type !== 'receita_previa')
    }));

    const consultationId = customConsultationId || state.activeConsultationId || state.patientId || auth.currentUser?.uid;
    console.log("clearPrescriptionMessages called. consultationId:", consultationId, "ids:", prescriptionMsgIds);
    if (consultationId) {
      try {
        const targetIds = new Set<string>([consultationId]);
        if (state.activeConsultationId) targetIds.add(state.activeConsultationId);
        const cleanDigits = (val?: string) => (val || '').replace(/\D/g, '');
        const matchedQueueEntry = state.queue.find(p =>
          p.id === consultationId || (p as any).uid === consultationId || (p as any).patientId === consultationId
        );
        const patientEmail = (matchedQueueEntry?.email || '').trim().toLowerCase();
        const patientCpf = cleanDigits(matchedQueueEntry?.cpf);
        const patientPhone = cleanDigits(matchedQueueEntry?.phone);

        if (matchedQueueEntry) {
          if (matchedQueueEntry.id) targetIds.add(matchedQueueEntry.id);
          if ((matchedQueueEntry as any).uid) targetIds.add((matchedQueueEntry as any).uid);
          if ((matchedQueueEntry as any).patientId) targetIds.add((matchedQueueEntry as any).patientId);
        }

        state.queue.forEach(p => {
          const pEmail = (p.email || '').trim().toLowerCase();
          const pCpf = cleanDigits(p.cpf);
          const pPhone = cleanDigits(p.phone);
          const emailMatch = patientEmail && !patientEmail.includes('sem-email') && pEmail === patientEmail;
          const cpfMatch = patientCpf && patientCpf.length >= 11 && pCpf === patientCpf;
          const phoneMatch = patientPhone && patientPhone.length >= 10 && pPhone === patientPhone;
          if (emailMatch || cpfMatch || phoneMatch) {
            if (p.id) targetIds.add(p.id);
            if ((p as any).uid) targetIds.add((p as any).uid);
            if ((p as any).patientId) targetIds.add((p as any).patientId);
          }
        });

        if (prescriptionMsgIds.length > 0) {
          await Promise.all(
            Array.from(targetIds).flatMap(tid =>
              prescriptionMsgIds.map(id =>
                deleteDoc(doc(db, 'active_consultations', tid, 'messages', id)).catch(() => {})
              )
            )
          );
        }

        const clearPayload: Record<string, any> = {
          'issuedDocuments.receita': null,
          'issuedDocuments.prescription': null,
          'issuedDocuments.product': null,
          'issuedDocuments.receita_previa': null
        };
        await Promise.all(
          Array.from(targetIds).map(async (tid) => {
            await updateDoc(doc(db, 'active_consultations', tid), clearPayload).catch(() => {});
            await updateDoc(doc(db, 'queue', tid), clearPayload).catch(() => {});
            await updateDoc(doc(db, 'users', tid), clearPayload).catch(() => {});
          })
        );
        console.log("Prescription messages cleared from Firestore across all linked IDs");
      } catch (error) {
        console.error("Error clearing prescription messages from Firestore:", error);
      }
    }
  },

  confirmReceitaPrevia: async (messageId: string, customConsultationId?: string) => {
    const state = get();
    const confirmedAtStr = new Date().toISOString();
    set((s) => ({
      messages: s.messages.map(m => m.id === messageId ? {
        ...m,
        receitaPreviaData: m.receitaPreviaData ? {
          ...m.receitaPreviaData,
          status: 'confirmed',
          confirmedAt: confirmedAtStr
        } : undefined
      } : m)
    }));

    const consultationId = customConsultationId || state.activeConsultationId || state.patientId || auth.currentUser?.uid;
    if (consultationId) {
      try {
        await updateDoc(doc(db, 'active_consultations', consultationId, 'messages', messageId), {
          'receitaPreviaData.status': 'confirmed',
          'receitaPreviaData.confirmedAt': confirmedAtStr
        });
      } catch (error) {
        console.error("Error confirming receita previa in Firestore:", error);
      }
    }
  },

  subscribeToMessages: (consultationId: string) => {
    if (!consultationId) return () => {};

    const isProfessionalView = typeof window !== 'undefined' && (
      window.location.pathname.includes('/doctor') ||
      window.location.pathname.includes('/admin') ||
      window.location.pathname.includes('/psychologist')
    );

    const prevId = get().activeConsultationId;
    if (prevId !== consultationId) {
      if (isProfessionalView) {
        set({ activeConsultationId: consultationId, messages: [] });
      } else {
        set({ activeConsultationId: consultationId });
      }
    }

    const parseRawMessage = (id: string, data: any): Message => {
      let ts: Date;
      if (data.timestamp?.toDate && typeof data.timestamp.toDate === 'function') {
        ts = data.timestamp.toDate();
      } else if (data.timestamp) {
        ts = new Date(data.timestamp);
      } else {
        ts = new Date();
      }
      if (isNaN(ts.getTime())) ts = new Date();
      return {
        id,
        ...data,
        timestamp: ts
      } as Message;
    };

    const parseDoc = (d: any): Message => parseRawMessage(d.id, d.data());

    // Map of targetId -> Message[] so we can merge messages across all linked IDs for this patient
    const messagesByTarget = new Map<string, Message[]>();
    const synthesizedMessagesMap = new Map<string, Message>();
    const activeUnsubscribes: Array<() => void> = [];
    const subscribedIds = new Set<string>();
    let isCancelled = false;

    const getDeletedIdsSet = (): Set<string> => {
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('mecura_deleted_msg_ids');
          if (raw) return new Set<string>(JSON.parse(raw));
        }
      } catch {
        // ignore
      }
      return new Set<string>();
    };

    const rebuildAndPublishMessages = () => {
      if (isCancelled) return;
      const deletedSet = getDeletedIdsSet();
      const mergedMap = new Map<string, Message>();

      messagesByTarget.forEach((msgs) => {
        msgs.forEach((m) => {
          if (!deletedSet.has(m.id)) {
            mergedMap.set(m.id, m);
          }
        });
      });

      // Only use issuedDocuments fallback in patient view when no real message with that ID exists and it wasn't deleted
      if (!isProfessionalView) {
        synthesizedMessagesMap.forEach((synMsg) => {
          if (!deletedSet.has(synMsg.id) && !mergedMap.has(synMsg.id)) {
            mergedMap.set(synMsg.id, synMsg);
          }
        });
      }

      const allMsgs = Array.from(mergedMap.values());
      allMsgs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Never wipe existing messages in patient view if we haven't found any messages yet
      if (allMsgs.length === 0 && !isProfessionalView && get().messages.length > 0) {
        return;
      }

      const currentMessages = get().messages;
      if (allMsgs.length > currentMessages.length && currentMessages.length > 0) {
        const lastMsg = allMsgs[allMsgs.length - 1];
        if (lastMsg.sender === 'doctor') {
          import('../utils/sound').then(({ playNotificationSound }) => {
            playNotificationSound();
          });
          if (typeof document !== 'undefined' && document.hidden) {
            import('../utils/notifications').then(({ showNativeNotification }) => {
              showNativeNotification('Nova mensagem do Médico', lastMsg.text, '/chat');
            });
          } else if (lastMsg.text && lastMsg.text.includes('SUA VEZ CHEGOU')) {
            import('../utils/notifications').then(({ showNativeNotification }) => {
              showNativeNotification('Nova mensagem do Médico', lastMsg.text, '/chat');
            });
          }
        }
      }

      set({ messages: allMsgs });
    };

    const inspectDocumentDataForSynthesizedMessages = (sourceId: string, docData: any) => {
      if (!docData || isCancelled || isProfessionalView) return;
      let changed = false;
      const deletedSet = getDeletedIdsSet();

      // Only check issuedDocuments map (explicitly sent via addMessage in chat), NEVER draft editor fields
      if (docData.issuedDocuments && typeof docData.issuedDocuments === 'object') {
        Object.entries(docData.issuedDocuments).forEach(([docKey, rawMsg]: [string, any]) => {
          const msgId = rawMsg?.id || `issued_${sourceId}_${docKey}`;
          if (rawMsg && typeof rawMsg === 'object' && !deletedSet.has(msgId)) {
            const parsed = parseRawMessage(msgId, rawMsg);
            synthesizedMessagesMap.set(msgId, parsed);
            changed = true;
          } else if (!rawMsg && synthesizedMessagesMap.has(msgId)) {
            synthesizedMessagesMap.delete(msgId);
            changed = true;
          }
        });
      }

      if (changed) {
        rebuildAndPublishMessages();
      }
    };

    const subscribeSingleTarget = (targetId: string) => {
      if (!targetId || subscribedIds.has(targetId) || isCancelled) return;
      subscribedIds.add(targetId);

      const messagesCol = collection(db, 'active_consultations', targetId, 'messages');
      const q = query(messagesCol, orderBy('timestamp', 'asc'));

      // Direct one-time fetch
      getDocs(q).then((snapshot) => {
        if (!snapshot.empty && !isCancelled) {
          messagesByTarget.set(targetId, snapshot.docs.map(parseDoc));
          rebuildAndPublishMessages();
        }
      }).catch(() => {
        getDocs(messagesCol).then((snapshot) => {
          if (!snapshot.empty && !isCancelled) {
            messagesByTarget.set(targetId, snapshot.docs.map(parseDoc));
            rebuildAndPublishMessages();
          }
        }).catch(() => {});
      });

      // Real-time listener on messages subcollection
      const unsubMsgs = onSnapshot(q, (snapshot) => {
        if (isCancelled) return;
        messagesByTarget.set(targetId, snapshot.docs.map(parseDoc));
        rebuildAndPublishMessages();
      }, (error) => {
        console.warn(`Error subscribing to messages for ${targetId}:`, error);
      });
      activeUnsubscribes.push(unsubMsgs);

      // Real-time listener on active_consultations/{targetId} parent doc + queue/{targetId} + users/{targetId}
      const unsubActiveDoc = onSnapshot(doc(db, 'active_consultations', targetId), (snap) => {
        if (snap.exists()) inspectDocumentDataForSynthesizedMessages(targetId, snap.data());
      }, () => {});
      activeUnsubscribes.push(unsubActiveDoc);

      const unsubQueueDoc = onSnapshot(doc(db, 'queue', targetId), (snap) => {
        if (snap.exists()) inspectDocumentDataForSynthesizedMessages(targetId, snap.data());
      }, () => {});
      activeUnsubscribes.push(unsubQueueDoc);

      const unsubUserDoc = onSnapshot(doc(db, 'users', targetId), (snap) => {
        if (snap.exists()) inspectDocumentDataForSynthesizedMessages(targetId, snap.data());
      }, () => {});
      activeUnsubscribes.push(unsubUserDoc);
    };

    // Subscribe to primary consultationId immediately
    subscribeSingleTarget(consultationId);

    // Discover and subscribe to all linked patient IDs
    const state = get();
    const cleanDigits = (v?: string) => (v || '').replace(/\D/g, '');

    if (!isProfessionalView) {
      const authUid = auth.currentUser?.uid;
      const storedPid = typeof window !== 'undefined' ? (localStorage.getItem('mecura_patientId') || localStorage.getItem('patient_id')) : null;
      if (authUid) subscribeSingleTarget(authUid);
      if (state.patientId) subscribeSingleTarget(state.patientId);
      if (storedPid) subscribeSingleTarget(storedPid);

      const myEmail = (auth.currentUser?.email || state.userEmail || (typeof window !== 'undefined' ? localStorage.getItem('mecura_patient_email') : '') || '').trim().toLowerCase();
      const myCpf = cleanDigits(state.userCpf || (typeof window !== 'undefined' ? localStorage.getItem('mecura_patient_cpf') : '') || '');
      const myPhone = cleanDigits(state.userPhone || (typeof window !== 'undefined' ? localStorage.getItem('mecura_patient_phone') : '') || '');

      state.queue.forEach(p => {
        const pEmail = (p.email || '').trim().toLowerCase();
        const pCpf = cleanDigits(p.cpf);
        const pPhone = cleanDigits(p.phone);
        const idMatch = p.id === consultationId || p.id === authUid || p.id === state.patientId || p.id === storedPid;
        const emailMatch = myEmail && !myEmail.includes('sem-email') && pEmail === myEmail;
        const cpfMatch = myCpf && myCpf.length >= 11 && pCpf === myCpf;
        const phoneMatch = myPhone && myPhone.length >= 10 && pPhone === myPhone;
        if (idMatch || emailMatch || cpfMatch || phoneMatch) {
          if (p.id) subscribeSingleTarget(p.id);
          if ((p as any).uid) subscribeSingleTarget((p as any).uid);
          if ((p as any).patientId) subscribeSingleTarget((p as any).patientId);
        }
      });

      // Also query Firestore queue & users by email / cpf for any historical consultation IDs
      if (myEmail && !myEmail.includes('sem-email')) {
        getDocs(query(collection(db, 'queue'), where('email', '==', myEmail))).then(snap => {
          snap.forEach(d => {
            subscribeSingleTarget(d.id);
            inspectDocumentDataForSynthesizedMessages(d.id, d.data());
          });
        }).catch(() => {});
        getDocs(query(collection(db, 'users'), where('email', '==', myEmail))).then(snap => {
          snap.forEach(d => {
            subscribeSingleTarget(d.id);
            inspectDocumentDataForSynthesizedMessages(d.id, d.data());
          });
        }).catch(() => {});
      }
      if (myCpf && myCpf.length >= 11) {
        const rawCpf = state.userCpf || (typeof window !== 'undefined' ? localStorage.getItem('mecura_patient_cpf') : '') || '';
        if (rawCpf) {
          getDocs(query(collection(db, 'queue'), where('cpf', '==', rawCpf))).then(snap => {
            snap.forEach(d => {
              subscribeSingleTarget(d.id);
              inspectDocumentDataForSynthesizedMessages(d.id, d.data());
            });
          }).catch(() => {});
        }
      }
    } else {
      // Professional view: also subscribe to any linked IDs for the selected patient in state.queue
      const targetEntry = state.queue.find(p => p.id === consultationId);
      if (targetEntry) {
        if ((targetEntry as any).uid) subscribeSingleTarget((targetEntry as any).uid);
        if ((targetEntry as any).patientId) subscribeSingleTarget((targetEntry as any).patientId);
        const tEmail = (targetEntry.email || '').trim().toLowerCase();
        const tCpf = cleanDigits(targetEntry.cpf);
        state.queue.forEach(p => {
          const pEmail = (p.email || '').trim().toLowerCase();
          const pCpf = cleanDigits(p.cpf);
          if ((tEmail && !tEmail.includes('sem-email') && pEmail === tEmail) || (tCpf && tCpf.length >= 11 && pCpf === tCpf)) {
            if (p.id) subscribeSingleTarget(p.id);
          }
        });
      }
    }

    return () => {
      isCancelled = true;
      activeUnsubscribes.forEach(unsub => unsub());
    };
  },
  setMessages: (messages) => set({ messages }),

  exchangeRate: typeof window !== 'undefined' && localStorage.getItem('mecura_exchange_rate') 
    ? (parseFloat(localStorage.getItem('mecura_exchange_rate')!) || 5.0) 
    : 5.0,
  setExchangeRate: (rate) => {
    if (typeof window !== 'undefined') localStorage.setItem('mecura_exchange_rate', rate.toString());
    set({ exchangeRate: rate });
  },
  subscribeToExchangeRate: () => {
    const docRef = doc(db, 'settings', 'exchangeRate');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const numRate = typeof data.rate === 'number' ? data.rate : parseFloat(data.rate);
        if (!isNaN(numRate) && numRate > 0) {
          console.log('Exchange rate updated from Firestore:', numRate);
          if (typeof window !== 'undefined') localStorage.setItem('mecura_exchange_rate', numRate.toString());
          set({ exchangeRate: numRate });
        }
      } else {
        console.log('Exchange rate document does not exist, using default 5.0');
        set({ exchangeRate: 5.0 });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/exchangeRate');
    });
    return unsubscribe;
  },
  updateExchangeRate: async (rate: number | string) => {
    const numRate = typeof rate === 'number' ? rate : parseFloat(String(rate).replace(',', '.'));
    if (isNaN(numRate) || numRate <= 0) return;
    
    const path = 'settings/exchangeRate';
    try {
      console.log('Updating exchange rate to:', numRate);
      if (typeof window !== 'undefined') localStorage.setItem('mecura_exchange_rate', numRate.toString());
      set({ exchangeRate: numRate });
      const docRef = doc(db, 'settings', 'exchangeRate');
      await setDoc(docRef, { rate: numRate, updatedAt: new Date().toISOString() });
      console.log('Exchange rate update request sent to Firestore');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  
  clearTriage: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mecura_pagamento');
      localStorage.removeItem('mecura_premium');
      localStorage.removeItem('last_offer');
      localStorage.removeItem('mecura_applied_coupon');
      localStorage.removeItem('mecura_consultation_finished');
      localStorage.removeItem('mecura_consultation_active');
      localStorage.removeItem('mecura_queue_display_pos');
      localStorage.removeItem('mecura_queue_entered_at');
      localStorage.removeItem('mecura_queue_notified_10m');
    }
    return set((state) => ({
      // Preserve existing triage answers so the patient's triage history is never wiped out
      answers: state.answers && Object.keys(state.answers).length > 0 ? state.answers : { objectives: [] },
      onboardingStep: 1,
      consultationStatus: 'pending',
      isConsultationFinished: false,
      consultationActive: false,
      pagamento_consulta: false,
      pagamento_premium: false,
      selectedOffer: null,
      inQueue: false,
      activeConsultationId: null,
      messages: []
    }));
  },
  
  reset: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mecura_patientId');
      localStorage.removeItem('mecura_patient_name');
      localStorage.removeItem('mecura_patient_email');
      localStorage.removeItem('mecura_patient_phone');
      localStorage.removeItem('mecura_patient_cpf');
      localStorage.removeItem('mecura_patient_birthdate');
      localStorage.removeItem('mecura_onboarding_done');
      localStorage.removeItem('mecura_triage_answers');
      localStorage.removeItem('mecura_pagamento');
      localStorage.removeItem('mecura_premium');
      localStorage.removeItem('last_offer');
      localStorage.removeItem('mecura_applied_coupon');
      localStorage.removeItem('mecura_consultation_finished');
      localStorage.removeItem('mecura_consultation_active');
      localStorage.removeItem('mecura_queue_display_pos');
      localStorage.removeItem('mecura_queue_entered_at');
      localStorage.removeItem('mecura_queue_notified_10m');
    }
    return set({
      userName: '',
      userEmail: '',
      userPhone: '',
      userCpf: '',
      userBirthDate: '',
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
    });
  },
}));
