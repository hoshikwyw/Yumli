import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BackLink, Card, Button, Input } from '@/components/ui';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, isLoggedIn, checking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle('Admin login');

  // Where the visitor was heading before being asked to log in.
  const destination = (location.state as { from?: string } | null)?.from ?? '/admin';

  if (!checking && isLoggedIn) return <Navigate to={destination} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const failure = await login(username, password);
      if (failure) setError(failure);
      else navigate(destination, { replace: true });
    } catch {
      setError('Could not reach the server. Try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-dvh bg-bg pixel-hearts flex flex-col items-center justify-center p-4">
      <Card variant="default" className="w-full max-w-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <span className="text-4xl" aria-hidden="true">🔒</span>
          <h1 className="text-heading text-ink mt-2">Secret Kitchen</h1>
          <p className="text-base text-ink-muted">Admin access only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p role="alert" className="text-base font-semibold text-primary-ink text-center">{error}</p>
          )}

          <Button variant="primary" type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Checking…' : 'Log in'}
          </Button>
        </form>
      </Card>

      <BackLink to="/" className="mt-6">Back to Yumli</BackLink>
    </div>
  );
}
