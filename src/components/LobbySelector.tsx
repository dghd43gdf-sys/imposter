import React, { useState } from 'react';
import { Plus, Users, ArrowRight, ArrowLeft, Gamepad2 } from 'lucide-react';

interface LobbySelectorProps {
  onCreateLobby: () => void;
  onJoinLobby: (code: string) => void;
  onBack: () => void;
  loading: boolean;
}

export const LobbySelector: React.FC<LobbySelectorProps> = ({ onCreateLobby, onJoinLobby, onBack, loading }) => {
  const [lobbyCode, setLobbyCode] = useState('');
  const [mode, setMode] = useState<'select' | 'join'>('select');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lobbyCode.trim().length === 6) {
      onJoinLobby(lobbyCode.trim().toUpperCase());
    }
  };

  if (mode === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up">
          <button
            onClick={() => setMode('select')}
            className="text-slate-400 hover:text-white mb-6 flex items-center space-x-2 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Zurück</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Lobby beitreten
            </h2>
            <p className="text-slate-300">Gib den 6-stelligen Lobby-Code ein</p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-6">
            <div>
              <label htmlFor="lobbyCode" className="block text-sm font-medium text-slate-300 mb-3">
                Lobby-Code
              </label>
              <input
                id="lobbyCode"
                type="text"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                className="w-full px-6 py-4 input-modern text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={lobbyCode.length !== 6 || loading}
              className="w-full btn-secondary py-4 px-6 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              <span>{loading ? 'Trete bei...' : 'Lobby beitreten'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white mb-6 flex items-center space-x-2 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Zurück</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Spiel starten
          </h2>
          <p className="text-slate-300">Erstelle eine neue Lobby oder tritt einer bestehenden bei</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onCreateLobby}
            disabled={loading}
            className="w-full btn-primary py-4 px-6 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            <span>{loading ? 'Erstelle...' : 'Neue Lobby erstellen'}</span>
          </button>

          <button
            onClick={() => setMode('join')}
            disabled={loading}
            className="w-full btn-secondary py-4 px-6 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            <Users className="w-6 h-6" />
            <span>Bestehender Lobby beitreten</span>
          </button>
        </div>
      </div>
    </div>
  );
};