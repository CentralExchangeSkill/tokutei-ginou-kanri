import { Navigate } from 'react-router-dom';
import { useState } from 'react';

export function LoginPage({ apiBase, onLogin, isAuthenticated }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message ?? 'Login failed');
      return;
    }

    onLogin(payload.token, payload.user);
  };

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Sign in</button>
      </form>
      {error && <p>{error}</p>}
      <p>Test users: admin@example.com / admin123, user@example.com / user123</p>
    </main>
  );
}
