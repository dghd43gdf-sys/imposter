import React, { useState, useEffect } from 'react';
import { Plus, Users, Play, Trophy, Target, Sparkles } from 'lucide-react';
import { PageLayout } from '../components/Layout/PageLayout';
import { User } from '../types/game';

interface HomePageProps {
  user: User;
  onCreateLobby: () => void;
  onJoinLobby: (code: string) => void;
  loading: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  user, 
  onCreateLobby, 
  onJoinLobby, 
  loading 
}) => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [lobbyCode, setLobbyCode] = useState('');

  // Check for lobby code in URL on component mount
  useEffect(() => {
    const checkForLobbyCode = () => {
      const path = window.location.pathname;
      const lobbyMatch = path.match(/\/lobby\/([A-Z0-9]{6})/);
      
      if (lobbyMatch) {
        const code = lobbyMatch[1];
        onJoinLobby(code);
        return;
      }

      // Also check for direct lobby URLs like http://domain.com/lobby/ABCDEF
      const fullUrl = window.location.href;
      const urlLobbyMatch = fullUrl.match(/\/lobby\/([A-Z0-9]{6})/);
      
      if (urlLobbyMatch) {
        const code = urlLobbyMatch[1];
        onJoinLobby(code);
      }
    };

    checkForLobbyCode();
  }, [onJoinLobby]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lobbyCode.trim().length === 6) {
      onJoinLobby(lobbyCode.trim().toUpperCase());
    }
  };

  const gamesPlayed = user.gamesPlayed || 0;
  const timesImposter = user.timesImposter || 0;
  const imposterWins = user.imposterWins || 0;

  return (
    <PageLayout maxWidth="xl">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-5xl">🕵️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Willkommen zurück, {user.username}!
          </h1>
          <p className="text-slate-400 text-lg">
            Bereit für eine neue Runde Imposter?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="modern-card p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span>Deine Statistiken</span>
          </h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-blue-400 mb-2">
                <Users className="w-6 h-6" />
                <span className="text-2xl font-bold">{gamesPlayed}</span>
              </div>
              <p className="text-slate-400 text-sm">Spiele</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-purple-400 mb-2">
                <Trophy className="w-6 h-6" />
                <span className="text-2xl font-bold">{timesImposter}</span>
              </div>
              <p className="text-slate-400 text-sm">Imposter</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
                <Target className="w-6 h-6" />
                <span className="text-2xl font-bold">{imposterWins}</span>
              </div>
              <p className="text-slate-400 text-sm">Siege</p>
            </div>
          </div>

          {/* Win Rates */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Imposter-Rate</p>
              <p className="text-lg font-bold text-cyan-400">
                {gamesPlayed > 0 ? Math.round((timesImposter / gamesPlayed) * 100) : 0}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Imposter Siegesrate</p>
              <p className="text-lg font-bold text-green-400">
                {timesImposter > 0 ? Math.round((imposterWins / timesImposter) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Game Actions */}
        <div className="space-y-4">
          {!showJoinForm ? (
            <>
              <button
                onClick={onCreateLobby}
                disabled={loading}
                className="modern-btn modern-btn-primary w-full py-4 flex items-center justify-center space-x-3 text-lg font-semibold disabled:opacity-50"
              >
                <Plus className="w-6 h-6" />
                <span>{loading ? 'Erstelle...' : 'Neue Lobby erstellen'}</span>
              </button>

              <button
                onClick={() => setShowJoinForm(true)}
                disabled={loading}
                className="modern-btn modern-btn-secondary w-full py-4 flex items-center justify-center space-x-3 text-lg font-semibold disabled:opacity-50"
              >
                <Users className="w-6 h-6" />
                <span>Bestehender Lobby beitreten</span>
              </button>
            </>
          ) : (
            <div className="modern-card p-6">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                Lobby beitreten
              </h3>
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <label htmlFor="lobbyCode" className="block text-sm font-medium text-slate-300 mb-2">
                    Lobby-Code
                  </label>
                  <input
                    id="lobbyCode"
                    type="text"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                    placeholder="ABCDEF"
                    className="modern-input text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinForm(false);
                      setLobbyCode('');
                    }}
                    className="modern-btn modern-btn-neutral flex-1 py-3"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={lobbyCode.length !== 6 || loading}
                    className="modern-btn modern-btn-primary flex-1 py-3 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>{loading ? 'Trete bei...' : 'Beitreten'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};