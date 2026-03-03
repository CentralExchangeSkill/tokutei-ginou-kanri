import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from './auth.js';
import { LoginPage } from './LoginPage.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Dashboard({ auth, onLogout, onRefresh }) {
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome <strong>{auth.user?.email}</strong>.</p>
      <p>Role: <strong>{auth.user?.role}</strong></p>
      <button onClick={onRefresh}>Refresh /me</button>
      <button onClick={onLogout}>Logout</button>
      {auth.user?.role === 'ADMIN' && <p>You can access admin-only routes.</p>}
    </main>
  );
}

function AdminPage({ auth }) {
  if (auth.user?.role !== 'ADMIN') {
    return <p>Only ADMIN users can view this page.</p>;
  }

  return <p>Admin control panel.</p>;
}

export default function App() {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const isAuthenticated = useMemo(() => Boolean(auth.token), [auth.token]);

  const handleLogin = (token, user) => {
    setStoredAuth(token, user);
    setAuth({ token, user });
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAuth({ token: null, user: null });
  };

  const handleRefresh = async () => {
    if (!auth.token) return;
    const response = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (response.ok) {
      const payload = await response.json();
      setStoredAuth(auth.token, payload.user);
      setAuth({ token: auth.token, user: payload.user });
      return;
    }
    handleLogout();
  };

  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/admin">Admin</Link>
        {' | '}
        <Link to="/login">Login</Link>
      </nav>

      <Routes>
        <Route
          path="/login"
          element={<LoginPage apiBase={API_BASE} onLogin={handleLogin} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard auth={auth} onLogout={handleLogout} onRefresh={handleRefresh} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminPage auth={auth} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
