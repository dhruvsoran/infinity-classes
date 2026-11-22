import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Test from './pages/Test.jsx';
import Result from './pages/Result.jsx';
import History from './pages/History.jsx';
import Admin from './pages/Admin.jsx';

function Private({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center-note">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage mode="login" />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <AuthPage mode="signup" />} />
        <Route path="/" element={<Private><Dashboard /></Private>} />
        <Route path="/test" element={<Private><Test /></Private>} />
        <Route path="/result/:id" element={<Private><Result /></Private>} />
        <Route path="/history" element={<Private><History /></Private>} />
        <Route path="/admin" element={<Private admin><Admin /></Private>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
