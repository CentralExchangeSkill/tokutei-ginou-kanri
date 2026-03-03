import { Route, Routes } from 'react-router-dom';
import { AdminOnly } from './components/AdminOnly';
import NewWorkerPage from './pages/workers/NewWorkerPage';

function WorkersIndex() {
  return <div>Workers list</div>;
}

export function AppRoutes({ user }) {
  return (
    <Routes>
      <Route path="/workers" element={<WorkersIndex />} />
      <Route
        path="/workers/new"
        element={
          <AdminOnly user={user}>
            <NewWorkerPage />
          </AdminOnly>
        }
      />
    </Routes>
  );
}
