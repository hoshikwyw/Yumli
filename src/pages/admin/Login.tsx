import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { fonts } from '../../themes/font';
import { Card, Button, Input } from '../../components/common';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const failure = await login(username, password);
      if (failure) setError(failure);
      else navigate('/admin');
    } catch {
      setError('Could not reach the server. Try again.');
    }
    setSubmitting(false);
  };

  return (
    <div
      style={{ backgroundColor: colors.bgPrimary }}
      className="min-h-screen flex items-center justify-center p-4 pixel-hearts"
    >
      <Card variant="default" className="w-full max-w-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <span className="text-3xl">🔒</span>
          <h1
            style={{ ...fonts.h2, color: colors.textPrimary, fontSize: undefined }}
            className="mt-3 text-sm sm:text-base"
          >
            Secret Kitchen
          </h1>
          <p style={{ color: colors.textMuted, fontFamily: "'Nunito', sans-serif" }} className="text-xs sm:text-sm mt-1">
            Admin access only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="USERNAME"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="PASSWORD"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <p style={{ color: colors.error, fontFamily: "'Nunito', sans-serif" }} className="text-xs sm:text-sm text-center">
              {error}
            </p>
          )}

          <Button variant="primary" size="md" type="submit" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'CHECKING...' : 'ENTER'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
