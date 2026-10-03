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

    // Auto-subscribe to background notifications and real-time user doc updates
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (user) {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            try {
              await subscribeToBackgroundNotifications(user.uid);
            } catch (e) {
              console.error("Auto push subscription failed:", e);
            }
          }
        }

        // Real-time synchronization of user doc to immediately detect payment bypass & consultation release
        try {
          unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
              const uData = snap.data();
              if (uData.pagamento_consulta === true || uData.bypassedPayment === true || uData.hasPaid === true || uData.consultationStatus === 'finished' || uData.consultationStatus === 'in-consultation') {
                useStore.getState().setPagamentoConsulta(true);
                if (typeof window !== 'undefined') localStorage.setItem('mecura_pagamento', 'true');
              }
              if (uData.pagamento_premium === true || uData.isPremium === true || uData.plan === 'premium') {
                useStore.getState().setPagamentoPremium(true);
                if (typeof window !== 'undefined') localStorage.setItem('mecura_premium', 'true');
              }
              if (uData.consultationStatus === 'in-consultation' || uData.doctorActive === true) {
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
              } else if (uData.consultationStatus === 'waiting' || uData.inQueue) {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_pagamento', 'true');
                  localStorage.removeItem('mecura_consultation_active');
                }
                useStore.setState({ 
                  inQueue: true, 
                  consultationActive: false, 
                  isConsultationFinished: false,
                  activeConsultationId: user.uid,
                  pagamento_consulta: true 
                });
              } else if (uData.consultationStatus === 'finished') {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mecura_pagamento', 'true');
                  localStorage.removeItem('mecura_consultation_active');
                }
                useStore.setState({ 
                  isConsultationFinished: true, 
                  consultationActive: false, 
                  inQueue: false, 
                  activeConsultationId: user.uid,
                  pagamento_consulta: true 
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

          {/* Doctor/Admin Route (No mobile layout) */}
          <Route path="/doctor" element={<DoctorDashboardScreen />} />
          <Route path="/admin" element={<AdminDashboardScreen />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
