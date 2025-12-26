import React, { useState } from 'react';
import { User, UserPlus, LogIn, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { User as UserType } from '../types/game';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
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
      <div className="modern-card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Imposter
          </h1>
          <p className="text-slate-400 text-lg">
            {mode === 'login' ? 'Willkommen zurück!' : 'Erstelle deinen Account'}
          </p>
        </div>

        {error && (
          <div className="modern-card bg-red-500/10 border-red-500/30 p-4 mb-6 text-center">
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
                className="modern-input pl-12"
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
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dein Passwort"
                className="modern-input pr-14"
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
            className="modern-btn modern-btn-primary w-full py-4 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="text-slate-400 hover:text-blue-400 transition-colors"
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