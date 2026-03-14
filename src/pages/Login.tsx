import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type DemoCred = { label: string; email: string; password: string };

const demoCreds: DemoCred[] = [
  { label: 'Admin (Recommended)', email: 'admin@complipay.ai', password: 'Admin123!' },
  { label: 'Operator', email: 'ops@complipay.ai', password: 'Ops123!' },
  { label: 'Viewer', email: 'viewer@complipay.ai', password: 'View123!' },
];

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('admin@complipay.ai');
  const [password, setPassword] = useState('Admin123!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    const target = (location.state as { from?: string } | null)?.from || '/dashboard';
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen app-theme bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">CompliPay AI Login</h1>
            <p className="text-sm text-slate-400">Institutional access control enabled</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2">Demo credentials:</p>
          <div className="space-y-2">
            {demoCreds.map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => {
                  setEmail(cred.email);
                  setPassword(cred.password);
                }}
                className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <p className="text-sm text-white">{cred.label}</p>
                <p className="text-xs text-slate-400">{cred.email}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
