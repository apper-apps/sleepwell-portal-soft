import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from '@/components/organisms/Layout';
import Dashboard from '@/components/pages/Dashboard';
import SleepDiary from '@/components/pages/SleepDiary';
import Schedule from '@/components/pages/Schedule';
import Clients from '@/components/pages/Clients';
import Resources from '@/components/pages/Resources';
import Messages from '@/components/pages/Messages';
import Settings from '@/components/pages/Settings';
import ClientDetail from '@/components/pages/ClientDetail';
import { UserProvider } from '@/hooks/useUser';

function App() {
  return (
    <UserProvider>
      <Router>
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
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="sleep-diary" element={<SleepDiary />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:clientId" element={<ClientDetail />} />
              <Route path="resources" element={<Resources />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;