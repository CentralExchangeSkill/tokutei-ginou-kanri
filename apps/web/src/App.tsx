import { FormEvent, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

type Role = "ADMIN" | "USER";
type Worker = {
  id: string;
  fullName: string;
  nationality: string;
  visaType: string;
  visaExpiryDate: string;
  status: "ACTIVE" | "INACTIVE";
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function getToken() {
  return localStorage.getItem("token");
}

async function api<T>(path: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as T;
}

function Protected({ children }: { children: JSX.Element }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await api<{ token: string; role: Role }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      navigate("/workers");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <main className="container">
      <h1>Tokutei Ginou Worker Management</h1>
      <form onSubmit={onSubmit} className="card">
        <h2>Login</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
        <button type="submit">Sign in</button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}

function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    api<Worker[]>("/workers").then(setWorkers).catch(() => setWorkers([]));
  }, []);

  return (
    <main className="container">
      <h2>Workers (sorted by visa expiry)</h2>
      <a href="/workers/new">+ Add worker (Admin)</a>
      <ul className="card">
        {workers.map((w) => (
          <li key={w.id}>
            <a href={`/workers/${w.id}`}>{w.fullName}</a> - {new Date(w.visaExpiryDate).toLocaleDateString()} ({w.visaType})
          </li>
        ))}
      </ul>
    </main>
  );
}

function WorkerDetailPage() {
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);

  useEffect(() => {
    api(`/workers/${id}`).then(setWorker).catch(() => setWorker(null));
  }, [id]);

  if (!worker) return <main className="container">Loading...</main>;

  return (
    <main className="container card">
      <h2>{worker.fullName}</h2>
      <p>Nationality: {worker.nationality}</p>
      <p>Immigration: {worker.immigrationInfo.statusOfResidence}</p>
      <h3>Documents</h3>
      <p>Checklist will be added in next milestone.</p>
      <h3>Cases</h3>
      <p>Case management scaffold is ready.</p>
    </main>
  );
}

function AddWorkerPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [form, setForm] = useState({
    fullName: "",
    nationality: "",
    visaType: "",
    visaExpiryDate: "",
    status: "ACTIVE"
  });

  if (role !== "ADMIN") return <main className="container">Admin only</main>;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api("/workers", { method: "POST", body: JSON.stringify(form) });
    navigate("/workers");
  };

  return (
    <main className="container card">
      <h2>Add Worker</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Full name" onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input placeholder="Nationality" onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
        <input placeholder="Visa type" onChange={(e) => setForm({ ...form, visaType: e.target.value })} />
        <input type="date" onChange={(e) => setForm({ ...form, visaExpiryDate: e.target.value })} />
        <button type="submit">Create</button>
      </form>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/workers" element={<Protected><WorkersPage /></Protected>} />
      <Route path="/workers/new" element={<Protected><AddWorkerPage /></Protected>} />
      <Route path="/workers/:id" element={<Protected><WorkerDetailPage /></Protected>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
