import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, LogOut, Gamepad2, Users } from 'lucide-react';
import { User as UserType } from '../../types/game';

interface NavigationProps {
  user: UserType;
  onLogout: () => void;
  lobbyCode?: string;
  hostUsername?: string;
  gamePhase?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  user, 
  onLogout, 
  lobbyCode, 
  hostUsername,
  gamePhase = 'lobby'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isInLobby = location.pathname.includes('/lobby/') || location.pathname.includes('/game/');
  const isInLobbyPage = location.pathname.includes('/lobby/');
  
  // Hide navigation during active game phases AND results phase
  const isGameActive = gamePhase && gamePhase !== 'lobby';
  
  if (isGameActive) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Imposter</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigate('/dashboard')}
              className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            {/* Current Lobby Button - only show when in a lobby */}
            {lobbyCode && (
              <button
                onClick={() => navigate(`/lobby/${lobbyCode}`)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  isInLobbyPage 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 animate-glow' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {hostUsername ? `Lobby von ${hostUsername}` : `Lobby ${lobbyCode}`}
                </span>
                <span className="sm:hidden font-mono text-sm">{lobbyCode}</span>
              </button>
            )}

            {/* User Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive('/profile') 
                  ? 'bg-slate-700/50 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">{user.username}</span>
            </button>

            <div className="h-6 w-px bg-slate-600 mx-2" />

            <button
              onClick={onLogout}
              className="nav-link text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};