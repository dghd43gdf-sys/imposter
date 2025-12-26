import React from 'react';
import { Play, User, LogOut, Trophy, Users, Target, Sparkles } from 'lucide-react';
import { User as UserType } from '../types/game';

interface MainMenuProps {
  user: UserType;
  onPlayGame: () => void;
  onShowProfile: () => void;
  onLogout: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ user, onPlayGame, onShowProfile, onLogout }) => {
  const gamesPlayed = user.gamesPlayed || 0;
  const timesImposter = user.timesImposter || 0;
  const imposterWins = user.imposterWins || 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow">
            <span className="text-5xl">🕵️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Willkommen zurück!
          </h1>
          
          {/* User Info */}
          <div className="glass-card-light rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">{user.username}</span>
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-violet-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xl font-bold">{gamesPlayed}</span>
                </div>
                <p className="text-xs text-slate-400">Spiele</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-pink-400 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xl font-bold">{timesImposter}</span>
                </div>
                <p className="text-xs text-slate-400">Imposter</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-emerald-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xl font-bold">{imposterWins}</span>
                </div>
                <p className="text-xs text-slate-400">Siege</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onPlayGame}
            className="w-full btn-primary py-4 px-6 flex items-center justify-center space-x-3 text-lg font-semibold"
          >
            <Play className="w-6 h-6" />
            <span>Spiel starten</span>
          </button>

          <button
            onClick={onShowProfile}
            className="w-full btn-secondary py-4 px-6 flex items-center justify-center space-x-3 text-lg font-semibold"
          >
            <User className="w-6 h-6" />
            <span>Profil anzeigen</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full btn-neutral py-4 px-6 flex items-center justify-center space-x-3 text-lg font-semibold"
          >
            <LogOut className="w-6 h-6" />
            <span>Abmelden</span>
          </button>
        </div>
      </div>
    </div>
  );
};