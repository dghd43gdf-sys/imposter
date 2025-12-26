import React, { useState } from 'react';
import { User, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setUsername(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    if (username.trim().length < 3) {
      setError('Benutzername muss mindestens 3 Zeichen lang sein.');
      return;
    }

    if (username.trim().length > 20) {
      setError('Benutzername darf maximal 20 Zeichen lang sein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'login' ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow">
            <span className="text-4xl">🕵️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Imposter
          </h1>
          <p className="text-slate-300 text-lg">
            {mode === 'login' ? 'Willkommen zurück!' : 'Erstelle deinen Account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-center backdrop-blur-sm">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-3">
              Benutzername
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Dein Benutzername"
                className="w-full pl-12 pr-4 py-4 input-modern text-base"
                maxLength={20}
                required
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">3-20 Zeichen ({username.length}/20)</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-3">
              Passwort
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dein Passwort"
                className="w-full pl-12 pr-14 py-4 input-modern text-base"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {mode === 'register' && (
              <p className="text-xs text-slate-400 mt-2">Mindestens 6 Zeichen</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim() || username.trim().length < 3}
            className="w-full btn-primary py-4 px-6 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold"
          >
            {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            <span>
              {loading 
                ? (mode === 'login' ? 'Anmelden...' : 'Registrieren...') 
                : (mode === 'login' ? 'Anmelden' : 'Registrieren')
              }
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
              setUsername('');
              setPassword('');
            }}
            className="text-slate-400 hover:text-violet-400 transition-colors text-base"
          >
            {mode === 'login' 
              ? 'Noch kein Account? Hier registrieren' 
              : 'Bereits einen Account? Hier anmelden'
            }
          </button>
        </div>
      </div>
    </div>
  );
};