import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import store from '@/store';
import Layout from '@/components/organisms/Layout';
import Dashboard from '@/components/pages/Dashboard';
import SleepDiary from '@/components/pages/SleepDiary';
import Packages from '@/components/pages/Packages';
import Schedule from '@/components/pages/Schedule';
import SessionTypes from '@/components/pages/SessionTypes';
import AvailabilitySettings from '@/components/pages/AvailabilitySettings';
import BookingRules from '@/components/pages/BookingRules';
import BookingManagement from '@/components/pages/BookingManagement';
import PublicBooking from '@/components/pages/PublicBooking';
import Clients from '@/components/pages/Clients';
import Resources from '@/components/pages/Resources';
import Messages from '@/components/pages/Messages';
import Settings from '@/components/pages/Settings';
import ClientDetail from '@/components/pages/ClientDetail';
import Login from '@/components/pages/Login';
import Signup from '@/components/pages/Signup';
import Callback from '@/components/pages/Callback';
import ErrorPage from '@/components/pages/ErrorPage';
import ResetPassword from '@/components/pages/ResetPassword';
import PromptPassword from '@/components/pages/PromptPassword';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/store/userSlice';

// Create auth context
export const AuthContext = createContext(null);

function AppContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
// Authentication temporarily disabled for development
  // const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize ApperUI once when the app loads
  // useEffect(() => {
  //   const { ApperClient, ApperUI } = window.ApperSDK;
  //   
  //   const client = new ApperClient({
  //     apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  //     apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  //   });
  //   
  //   // Initialize but don't show login yet
  //   ApperUI.setup(client, {
  //     target: '#authentication',
  //     clientId: import.meta.env.VITE_APPER_PROJECT_ID,
  //     view: 'both',
  //     onSuccess: function (user) {
  //       setIsInitialized(true);
  //       // CRITICAL: This exact currentPath logic must be preserved in all implementations
  //       // DO NOT simplify or modify this pattern as it ensures proper redirection flow
  //       let currentPath = window.location.pathname + window.location.search;
  //       let redirectPath = new URLSearchParams(window.location.search).get('redirect');
  //       const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
  //                          currentPath.includes('/callback') || currentPath.includes('/error') || 
  //                          currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
  //       
  //       if (user) {
  //         // User is authenticated
  //         if (redirectPath) {
  //           navigate(redirectPath);
  //         } else if (!isAuthPage) {
  //           if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
  //             navigate(currentPath);
  //           } else {
  //             navigate('/');
  //           }
  //         } else {
  //           navigate('/');
  //         }
  //         // Store user information in Redux
  //         dispatch(setUser(JSON.parse(JSON.stringify(user))));
  //       } else {
  //         // User is not authenticated
  //         if (!isAuthPage) {
  //           navigate(
  //             currentPath.includes('/signup')
  //               ? `/signup?redirect=${currentPath}`
  //               : currentPath.includes('/login')
  //               ? `/login?redirect=${currentPath}`
  //               : '/login'
  //           );
  //         } else if (redirectPath) {
  //           if (
  //             !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
  //           ) {
  //             navigate(`/login?redirect=${redirectPath}`);
  //           } else {
  //             navigate(currentPath);
  //           }
  //         } else if (isAuthPage) {
  //           navigate(currentPath);
  //         } else {
  //           navigate('/login');
  //         }
  //         dispatch(clearUser());
  //       }
  //     },
  //     onError: function(error) {
  //       console.error("Authentication failed:", error);
  //     }
  //   });
  // }, []);// No props and state should be bound
  
  // Authentication methods to share via context
  // const authMethods = {
  //   isInitialized,
  //   logout: async () => {
  //     try {
  //       const { ApperUI } = window.ApperSDK;
  //       await ApperUI.logout();
  //       dispatch(clearUser());
  //       navigate('/login');
  //     } catch (error) {
  //       console.error("Logout failed:", error);
  //     }
  //   }
  // };
  
  // Authentication disabled - render routes immediately
  // if (!isInitialized) {
  //   return <div className="loading flex items-center justify-center p-6 h-full w-full"><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg></div>;
  // }
  
return (
    <AuthContext.Provider value={{}}>
      <div className="min-h-screen bg-background">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="z-50"
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
          <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="sleep-diary" element={<SleepDiary />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="schedule/session-types" element={<SessionTypes />} />
            <Route path="schedule/availability" element={<AvailabilitySettings />} />
            <Route path="schedule/booking-rules" element={<BookingRules />} />
            <Route path="schedule/bookings" element={<BookingManagement />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:clientId" element={<ClientDetail />} />
            <Route path="resources" element={<Resources />} />
            <Route path="messages" element={<Messages />} />
<Route path="packages" element={<Packages />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/book/:coachId" element={<PublicBooking />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;