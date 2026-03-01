import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/connexion" replace />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800">
          ⚠️ <strong>Mode démo</strong> — Créez un fichier <code className="bg-amber-100 px-1 rounded">.env</code> avec vos clés Supabase pour activer toutes les fonctionnalités.{' '}
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-semibold">Créer un projet Supabase →</a>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/evenement/:id" element={<EventDetail />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route
          path="/creer"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modifier/:id"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
