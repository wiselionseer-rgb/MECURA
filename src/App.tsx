/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { AppLayout } from './components/layout/AppLayout';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { DiagnosisScreen } from './screens/DiagnosisScreen';
import { SchedulingScreen } from './screens/SchedulingScreen';
import { ConfirmationScreen } from './screens/ConfirmationScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { PremiumCheckoutScreen } from './screens/PremiumCheckoutScreen';
import { QueueScreen } from './screens/QueueScreen';
import { ChatScreen } from './screens/ChatScreen';
import { PrescriptionScreen } from './screens/PrescriptionScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { DoctorDashboardScreen } from './screens/DoctorDashboardScreen';
import { PsychologistDashboardScreen } from './screens/PsychologistDashboardScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProtocolScreen } from './screens/ProtocolScreen';
import { PrescriptionViewScreen } from './screens/PrescriptionViewScreen';
import { AnvisaScreen } from './screens/AnvisaScreen';
import { TrackingScreen } from './screens/TrackingScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PharmacyScreen } from './screens/PharmacyScreen';
import { LegalScreen } from './screens/LegalScreen';

import { ErrorBoundary } from './components/ErrorBoundary';
import { auth, db } from './firebase';
import { subscribeToBackgroundNotifications } from './utils/notifications';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const { subscribeToExchangeRate, subscribeToAppointments, subscribeToBlockedDates, subscribeToQueue } = useStore();

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;
    let unsubscribeQueueDoc: (() => void) | null = null;
    let unsubscribeMessagesDoc: (() => void) | null = null;

    // Auto-subscribe to background notifications and real-time user doc updates
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }
      if (unsubscribeQueueDoc) {
        unsubscribeQueueDoc();
        unsubscribeQueueDoc = null;
      }
      if (unsubscribeMessagesDoc) {
        unsubscribeMessagesDoc();
        unsubscribeMessagesDoc = null;
      }

      if (user) {
        if (typeof window !== 'undefined') {
          const prevPatientId = localStorage.getItem('mecura_patientId');
          if (prevPatientId && prevPatientId !== user.uid) {
            localStorage.removeItem('mecura_pagamento');
            localStorage.removeItem('mecura_premium');
            localStorage.removeItem('mecura_consultation_active');
            localStorage.removeItem('mecura_consultation_finished');
            localStorage.removeItem('mecura_queue_display_pos');
            localStorage.removeItem('mecura_queue_entered_at');
            localStorage.removeItem('mecura_queue_notified_10m');
            useStore.setState({
              pagamento_consulta: false,
              pagamento_premium: false,
              inQueue: false,
              consultationActive: false,
              isConsultationFinished: false
            });
          }
        }

        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            try {
              await subscribeToBackgroundNotifications(user.uid);
            } catch (e) {
              console.error("Auto push subscription failed:", e);
            }
          }
        }

        // Subscribe to this patient's consultation messages so documents/prescriptions are always available
        try {
          unsubscribeMessagesDoc = useStore.getState().subscribeToMessages(user.uid);
        } catch (e) {
          // ignore
        }

        // Verify payment status with backend (catches Pix/Card payments approved while app was closed)
        try {
          fetch('/api/verify-patient-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId: user.uid, email: user.email || '' })
          })
            .then(r => r.ok ? r.json() : null)
            .then(vData => {
              if (vData && vData.paid && (vData.status === 'waiting' || vData.status === 'in-consultation')) {
                const isCalling = vData.status === 'in-consultation';
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_patientId', user.uid);
                  localStorage.setItem('mecura_pagamento', 'true');
                  localStorage.removeItem('mecura_consultation_finished');
                  if (isCalling) localStorage.setItem('mecura_consultation_active', 'true');
                }
                useStore.setState({
                  patientId: user.uid,
                  activeConsultationId: user.uid,
                  pagamento_consulta: true,
                  inQueue: !isCalling,
                  consultationActive: isCalling,
                  isConsultationFinished: false
                });
              } else if (vData && vData.status === 'finished') {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_consultation_finished', 'true');
                }
                useStore.setState({
                  patientId: user.uid,
                  activeConsultationId: user.uid,
                  isConsultationFinished: true
                });
              }
            })
            .catch(() => {});
        } catch (e) {
          // ignore
        }

        let currentQueueDocStatus: string | null = null;
        try {
          unsubscribeQueueDoc = onSnapshot(doc(db, 'queue', user.uid), (qSnap) => {
            if (qSnap.exists()) {
              const qData = qSnap.data();
              currentQueueDocStatus = qData.status || null;
              if (qData.status === 'in-consultation') {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_pagamento', 'true');
                  localStorage.setItem('mecura_consultation_active', 'true');
                  localStorage.removeItem('mecura_consultation_finished');
                }
                useStore.setState({
                  consultationActive: true,
                  inQueue: false,
                  isConsultationFinished: false,
                  activeConsultationId: user.uid,
                  pagamento_consulta: true
                });
              } else if (qData.status === 'waiting') {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_pagamento', 'true');
                  localStorage.removeItem('mecura_consultation_active');
                  localStorage.removeItem('mecura_consultation_finished');
                }
                useStore.setState({
                  inQueue: true,
                  consultationActive: false,
                  isConsultationFinished: false,
                  activeConsultationId: user.uid,
                  pagamento_consulta: true
                });
              } else if (qData.status === 'finished') {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_consultation_finished', 'true');
                  localStorage.removeItem('mecura_consultation_active');
                }
                useStore.setState({
                  isConsultationFinished: true,
                  consultationActive: false,
                  inQueue: false,
                  activeConsultationId: user.uid
                });
              }
            }
          });
        } catch (err) {
          console.warn("Could not subscribe to queue document:", err);
        }

        // Real-time synchronization of user doc to detect payment status & consultation release
        try {
          unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
              const uData = snap.data();

              // Real-time synchronization of patient identity to prevent lost profile data
              if (uData.name && typeof uData.name === 'string' && uData.name.trim() !== '' && uData.name.toLowerCase() !== 'paciente') {
                useStore.getState().setUserName(uData.name.trim());
                if (typeof window !== 'undefined') localStorage.setItem('mecura_patient_name', uData.name.trim());
              }
              if (uData.email) useStore.getState().setUserEmail(uData.email);
              if (uData.phone) useStore.getState().setUserPhone(uData.phone);
              if (uData.cpf) useStore.getState().setUserCpf(uData.cpf);
              if (uData.birthDate) useStore.getState().setUserBirthDate(uData.birthDate);
              if (uData.answers) {
                Object.entries(uData.answers).forEach(([k, v]) => useStore.getState().setAnswer(k, v));
              }
              useStore.setState({ patientId: user.uid });
              if (typeof window !== 'undefined') localStorage.setItem('mecura_patientId', user.uid);

              const approvedAtRaw = typeof window !== 'undefined' ? Number(localStorage.getItem('mecura_payment_approved_at') || 0) : 0;
              const isRecentlyApproved = approvedAtRaw > 0 && (Date.now() - approvedAtRaw) < 120000;
              const isQueueActive = currentQueueDocStatus === 'waiting' || currentQueueDocStatus === 'in-consultation';

              const isAwaitingNewPayment = !isRecentlyApproved && !isQueueActive && (uData.consultationStatus === 'awaiting_payment' || uData.consultationStatus === 'not_started');
              const hasActualPayment = isRecentlyApproved || isQueueActive || (!isAwaitingNewPayment && !!(uData.pagamento_consulta === true || uData.bypassedPayment === true || uData.hasPaid === true || uData.isPaid === true));

              if (hasActualPayment) {
                useStore.getState().setPagamentoConsulta(true);
                if (typeof window !== 'undefined') localStorage.setItem('mecura_pagamento', 'true');
              } else {
                useStore.getState().setPagamentoConsulta(false);
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('mecura_pagamento');
                  localStorage.removeItem('mecura_consultation_active');
                }
              }

              if (!isAwaitingNewPayment && (uData.pagamento_premium === true || uData.isPremium === true || uData.plan === 'premium' || uData.plan === 'complete' || (isRecentlyApproved && typeof window !== 'undefined' && localStorage.getItem('mecura_premium') === 'true'))) {
                useStore.getState().setPagamentoPremium(true);
                if (typeof window !== 'undefined') localStorage.setItem('mecura_premium', 'true');
              } else {
                useStore.getState().setPagamentoPremium(false);
                if (typeof window !== 'undefined') localStorage.removeItem('mecura_premium');
              }

              if (hasActualPayment && (uData.consultationStatus === 'in-consultation' || uData.doctorActive === true || currentQueueDocStatus === 'in-consultation')) {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_pagamento', 'true');
                  localStorage.setItem('mecura_consultation_active', 'true');
                }
                useStore.setState({ 
                  consultationActive: true, 
                  inQueue: false, 
                  isConsultationFinished: false, 
                  activeConsultationId: user.uid, 
                  pagamento_consulta: true 
                });
              } else if (hasActualPayment && (uData.consultationStatus === 'waiting' || uData.inQueue || isRecentlyApproved || currentQueueDocStatus === 'waiting')) {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_pagamento', 'true');
                  localStorage.removeItem('mecura_consultation_active');
                  localStorage.removeItem('mecura_consultation_finished');
                }
                useStore.setState({ 
                  inQueue: true, 
                  consultationActive: false, 
                  isConsultationFinished: false,
                  activeConsultationId: user.uid,
                  pagamento_consulta: true 
                });
              } else if (!isAwaitingNewPayment && !isRecentlyApproved && (uData.consultationStatus === 'finished' || uData.isConsultationFinished === true || currentQueueDocStatus === 'finished')) {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_consultation_finished', 'true');
                  localStorage.removeItem('mecura_consultation_active');
                }
                useStore.setState({ 
                  isConsultationFinished: true, 
                  consultationActive: false, 
                  inQueue: false, 
                  activeConsultationId: user.uid
                });
              } else if (!hasActualPayment) {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('mecura_pagamento');
                  localStorage.removeItem('mecura_consultation_active');
                }
                useStore.setState({
                  inQueue: false,
                  consultationActive: false,
                  pagamento_consulta: false
                });
              }
            }
          });
        } catch (err) {
          console.warn("Could not subscribe to user document:", err);
        }
      }
    });

    const unsubscribeQueue = subscribeToQueue();
    const unsubscribeExchange = subscribeToExchangeRate();
    const unsubscribeAppointments = subscribeToAppointments();
    const unsubscribeBlockedDates = subscribeToBlockedDates();
    return () => {
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      if (unsubscribeQueueDoc) unsubscribeQueueDoc();
      if (unsubscribeMessagesDoc) unsubscribeMessagesDoc();
      unsubscribeQueue();
      unsubscribeExchange();
      unsubscribeAppointments();
      unsubscribeBlockedDates();
      unsubscribeAuth();
    };
  }, [subscribeToExchangeRate, subscribeToAppointments, subscribeToBlockedDates, subscribeToQueue]);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Patient Routes with Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<WelcomeScreen />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/analysis" element={<AnalysisScreen />} />
            <Route path="/diagnosis" element={<DiagnosisScreen />} />
            <Route path="/checkout" element={<CheckoutScreen />} />
            <Route path="/premium-checkout" element={<PremiumCheckoutScreen />} />
            <Route path="/scheduling" element={<SchedulingScreen />} />
            <Route path="/confirmation" element={<ConfirmationScreen />} />
            <Route path="/queue" element={<QueueScreen />} />
            <Route path="/chat" element={<ChatScreen />} />
            <Route path="/prescription" element={<PrescriptionScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/protocol" element={<ProtocolScreen />} />
            <Route path="/prescription-view" element={<PrescriptionViewScreen />} />
            <Route path="/anvisa" element={<AnvisaScreen />} />
            <Route path="/tracking" element={<TrackingScreen />} />
            <Route path="/alerts" element={<AlertsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/legal" element={<LegalScreen />} />
            <Route path="/privacy" element={<LegalScreen />} />
            <Route path="/privacidade" element={<LegalScreen />} />
            <Route path="/termos" element={<LegalScreen />} />
          </Route>

          {/* Full Screen Routes */}
          <Route path="/pharmacy" element={<PharmacyScreen />} />

          {/* Doctor/Psychologist/Admin Route (No mobile layout) */}
          <Route path="/doctor" element={<DoctorDashboardScreen />} />
          <Route path="/psychologist" element={<PsychologistDashboardScreen />} />
          <Route path="/psicologo" element={<PsychologistDashboardScreen />} />
          <Route path="/admin" element={<AdminDashboardScreen />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
