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

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { subscribeToExchangeRate } = useStore();

  useEffect(() => {
    const unsubscribe = subscribeToExchangeRate();
    return () => unsubscribe();
  }, [subscribeToExchangeRate]);

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
