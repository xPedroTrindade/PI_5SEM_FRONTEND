import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';
import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});

import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RegisterPage from './pages/RegisterPage';
import DriverDashboardPage from './pages/DriverDashboardPage';
import BookingRequestsPage from './pages/BookingRequestsPage';
import CalculatorPage from './pages/CalculatorPage';
import DriverAgendaPage from './pages/DriverAgendaPage';
import CarRegistrationPage from './pages/CarRegistrationPage';
import DriverHistoryPage from './pages/DriverHistoryPage';
import DriverSettingsPage from './pages/DriverSettingsPage';
import PassengerDashboardPage from './pages/PassengerDashboardPage';
import NewBookingPage from './pages/NewBookingPage';
import PassengerAgendaPage from './pages/PassengerAgendaPage';
import PassengerHistoryPage from './pages/PassengerHistoryPage';
import RideDetailsPage from './pages/RideDetailsPage';
import DriverAddRidePage from './pages/DriverAddRidePage';
import EditProfilePage from './pages/EditProfilePage';
import EditPricePage from './pages/EditPricePage';
import AboutPage from './pages/AboutPage';
import PassengerRideDetailsPage from './pages/PassengerRideDetailsPage';
import PassengerProfilePage from './pages/PassengerProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import UnavailablePeriodsPage from './pages/UnavailablePeriodsPage';

type Screen =
  | 'Login' | 'Register' | 'Forgot' | 'About'
  | 'DriverDashboard' | 'BookingRequests' | 'Calculator'
  | 'DriverAgenda' | 'CarRegistration' | 'DriverHistory'
  | 'DriverSettings' | 'DriverAddRide' | 'EditProfile' | 'EditPrice'
  | 'PassengerDashboard' | 'NewBooking' | 'PassengerAgenda'
  | 'PassengerHistory' | 'RideDetails' | 'PassengerRideDetails'
  | 'PassengerProfile' | 'Notifications' | 'UnavailablePeriods';

export type NavigateFn = (screen: string, params?: Record<string, any>) => void;

function AppNavigator() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [navParams, setNavParams] = useState<Record<string, any>>({});

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  const navigate: NavigateFn = (screen, params) => {
    setCurrentScreen(screen as Screen);
    setNavParams(params ?? {});
  };

  const initialScreen: Screen = !user
    ? 'Login'
    : user.tipo === 'motorista'
      ? 'DriverDashboard'
      : 'PassengerDashboard';

  const screen = !user && !['Login', 'Register', 'Forgot', 'About'].includes(currentScreen)
    ? 'Login'
    : user && currentScreen === 'Login'
      ? initialScreen
      : currentScreen;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {screen === 'Login' && <LoginPage navigate={navigate} />}
      {screen === 'Register' && <RegisterPage navigate={navigate} />}
      {screen === 'Forgot' && <ForgotPasswordPage navigate={navigate} />}
      {screen === 'About' && <AboutPage navigate={navigate} />}
      {screen === 'DriverDashboard' && <DriverDashboardPage navigate={navigate} />}
      {screen === 'BookingRequests' && <BookingRequestsPage navigate={navigate} />}
      {screen === 'Calculator' && <CalculatorPage navigate={navigate} />}
      {screen === 'DriverAgenda' && <DriverAgendaPage navigate={navigate} />}
      {screen === 'CarRegistration' && <CarRegistrationPage navigate={navigate} />}
      {screen === 'DriverHistory' && <DriverHistoryPage navigate={navigate} />}
      {screen === 'DriverSettings' && <DriverSettingsPage navigate={navigate} />}
      {screen === 'PassengerDashboard' && <PassengerDashboardPage navigate={navigate} />}
      {screen === 'NewBooking' && <NewBookingPage navigate={navigate} />}
      {screen === 'PassengerAgenda' && <PassengerAgendaPage navigate={navigate} />}
      {screen === 'PassengerHistory' && <PassengerHistoryPage navigate={navigate} />}
      {screen === 'RideDetails' && <RideDetailsPage navigate={navigate} ride={navParams.ride} />}
      {screen === 'DriverAddRide' && <DriverAddRidePage navigate={navigate} />}
      {screen === 'EditProfile' && <EditProfilePage navigate={navigate} />}
      {screen === 'EditPrice' && <EditPricePage navigate={navigate} />}
      {screen === 'PassengerRideDetails' && <PassengerRideDetailsPage navigate={navigate} ride={navParams.ride} />}
      {screen === 'PassengerProfile' && <PassengerProfilePage navigate={navigate} />}
      {screen === 'Notifications' && <NotificationsPage navigate={navigate} />}
      {screen === 'UnavailablePeriods' && <UnavailablePeriodsPage navigate={navigate} />}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
