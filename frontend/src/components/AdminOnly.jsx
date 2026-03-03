import { Navigate } from 'react-router-dom';

export function AdminOnly({ user, children }) {
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/workers" replace />;
  }

  return children;
}
