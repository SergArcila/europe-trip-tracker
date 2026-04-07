import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthGuard from './components/AuthGuard';
import Dashboard from './pages/Dashboard';
import TripDetail from './pages/TripDetail';
import CityDetail from './pages/CityDetail';
import NewTrip from './pages/NewTrip';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ShareView from './pages/ShareView';
import PublicProfile from './pages/PublicProfile';
import Feed from './pages/Feed';
import Planning from './pages/Planning';
import PlanEditor from './pages/PlanEditor';

// Fires prefetchAll in the background whenever a user session starts.
// Runs inside both providers so it can access both contexts.
function Prefetcher() {
  const { user } = useAuth();
  const { prefetchAll } = useData();

  useEffect(() => {
    if (user?.id) prefetchAll(user.id);
  }, [user?.id]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ThemeProvider>
        <Prefetcher />
        <style>{`
          :root {
            --bg: #0F1115;
            --bg-card: #1A1D23;
            --bg-input: #22252B;
            --text-primary: #F0EDE8;
            --text-secondary: #8B8A88;
            --border: #2A2D33;
            --border-light: #1F2228;
          }
          @media (prefers-color-scheme: light) {
            :root:not([data-theme="dark"]) {
              --bg: #FAFAF8;
              --bg-card: #FFFFFF;
              --bg-input: #F5F5F3;
              --text-primary: #1A1A1A;
              --text-secondary: #777;
              --border: #E8E8E5;
              --border-light: #F0F0ED;
            }
          }
          :root[data-theme="light"] {
            --bg: #FAFAF8;
            --bg-card: #FFFFFF;
            --bg-input: #F5F5F3;
            --text-primary: #1A1A1A;
            --text-secondary: #777;
            --border: #E8E8E5;
            --border-light: #F0F0ED;
          }
          :root[data-theme="dark"] {
            --bg: #0F1115;
            --bg-card: #1A1D23;
            --bg-input: #22252B;
            --text-primary: #F0EDE8;
            --text-secondary: #8B8A88;
            --border: #2A2D33;
            --border-light: #1F2228;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: var(--bg); }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
          input::placeholder { color: var(--text-secondary); opacity: .6; }
          input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        `}</style>

        <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/share/:token" element={<ShareView />} />
            <Route path="/u/:username" element={<PublicProfile />} />

            {/* Protected routes */}
            <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/trips/new" element={<AuthGuard><NewTrip /></AuthGuard>} />
            <Route path="/trips/:id" element={<AuthGuard><TripDetail /></AuthGuard>} />
            <Route path="/trips/:id/cities/:cityId" element={<AuthGuard><CityDetail /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
            <Route path="/feed" element={<AuthGuard><Feed /></AuthGuard>} />
            <Route path="/planning" element={<AuthGuard><Planning /></AuthGuard>} />
            <Route path="/planning/:id" element={<AuthGuard><PlanEditor /></AuthGuard>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        </ThemeProvider>
      </DataProvider>
    </AuthProvider>
  );
}
