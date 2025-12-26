import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Crown, Users, Play, RotateCcw, User, Check, Clock, LogOut, Copy, CheckCircle, Settings, X, Sparkles, Eye, Trash2 } from 'lucide-react';
import { PageLayout } from '../components/Layout/PageLayout';
import { Player, GameState, LobbySettings } from '../types/game';

interface LobbyPageProps {
  lobbyCode: string;
  players: Player[];
  gameState: GameState;
  currentPlayerId: string;
  isHost: boolean;
  hostUsername?: string;
  onStartGame: () => void;
  onRestartGame: () => void;
  onLeaveLobby: () => void;
  onCloseLobby: () => void;
  onUpdateSettings?: (settings: LobbySettings) => void;
  settings?: LobbySettings;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({
  lobbyCode,
  players,
  gameState,
  currentPlayerId,
  isHost,
  hostUsername,
  onStartGame,
  onRestartGame,
  onLeaveLobby,
  onCloseLobby,
  onUpdateSettings,
  settings = {
    randomOrder: true,
    twoImposters: false,
    threeImposters: false,
    imposterHint: false,
    wordTimeMode: false,
    survivalMode: false,
    wordTimeSeconds: 10
  }
}) => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState<LobbySettings>(settings);
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Redirect if lobby code doesn't match
  useEffect(() => {
    if (code && lobbyCode && code !== lobbyCode) {
      navigate(`/lobby/${lobbyCode}`);
    }
  }, [code, lobbyCode, navigate]);

  // Prevent navigation away from lobby
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Stay in lobby
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Push current state to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  const activePlayers = players.filter(p => !p.isEliminated);
  
  const getMinPlayers = () => {
    if (localSettings.threeImposters) return 5;
    if (localSettings.twoImposters) return 4;
    return 3;
  };
  
  const canStartGame = activePlayers.length >= getMinPlayers() && activePlayers.length <= 10 && gameState.phase === 'lobby';
  const canRestart = isHost && (gameState.phase === 'results');

  const copyLobbyCode = async () => {
    try {
      await navigator.clipboard.writeText(lobbyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = lobbyCode;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      
      document.body.removeChild(textArea);
    }
  };

  const handleModeChange = (mode: 'standard' | 'wordTime' | 'survival') => {
    if (!isHost || !onUpdateSettings) return;

    const newSettings = { ...localSettings };
    
    // Reset all modes first
    newSettings.wordTimeMode = false;
    newSettings.survivalMode = false;
    newSettings.twoImposters = false;
    newSettings.threeImposters = false;
    
    // Set the selected mode
    if (mode === 'wordTime') {
      newSettings.wordTimeMode = true;
    } else if (mode === 'survival') {
      newSettings.survivalMode = true;
    }
    
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const handleSettingChange = (key: keyof LobbySettings, value: boolean | number) => {
    const newSettings = { ...localSettings };
    
    if (key === 'twoImposters' && value) {
      newSettings.threeImposters = false;
    } else if (key === 'threeImposters' && value) {
      newSettings.twoImposters = false;
    }
    
    newSettings[key] = value as any;
    setLocalSettings(newSettings);
    
    if (onUpdateSettings) {
      onUpdateSettings(newSettings);
    }
  };

  const handleViewPlayerProfile = async (userId: string) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleViewOwnProfile = () => {
    navigate('/profile');
  };

  const lobbyTitle = hostUsername ? `Lobby von ${hostUsername}` : `Lobby ${lobbyCode}`;

  return (
    <PageLayout maxWidth="2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex-1 w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                {lobbyTitle}
              </h1>
              
              {/* Lobby Info Cards */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="modern-card p-3 w-full sm:w-auto">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-slate-300 font-medium">Code:</span>
                    <span className="text-white font-mono text-lg font-bold tracking-wider">{lobbyCode}</span>
                    <button
                      onClick={copyLobbyCode}
                      className="p-2 hover:bg-slate-600/50 rounded-xl transition-all duration-200"
                      title="Code kopieren"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="modern-card p-3 w-full sm:w-auto">
                  <div className="text-center">
                    <span className="text-slate-300 font-medium">Spieler: </span>
                    <span className="text-white font-bold text-lg">{activePlayers.length}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {isHost && gameState.phase === 'lobby' && (
              <button
                onClick={() => setShowSettings(true)}
                className="modern-btn modern-btn-secondary p-3 flex items-center space-x-2"
                title="Einstellungen"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Einstellungen</span>
              </button>
            )}
            
            {isHost && (
              <button
                onClick={onCloseLobby}
                className="modern-btn modern-btn-danger p-3 flex items-center space-x-2"
                title="Lobby schließen"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Schließen</span>
              </button>
            )}
            
            <button
              onClick={onLeaveLobby}
              className="modern-btn modern-btn-neutral p-3 flex items-center space-x-2"
              title="Lobby verlassen"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Verlassen</span>
            </button>
          </div>
        </div>

        {/* Game Status */}
        {gameState.phase !== 'lobby' && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 modern-card px-4 py-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-semibold">
                Spielphase: {gameState.phase === 'word-reveal' ? 'Wort-Enthüllung' : 
                           gameState.phase === 'discussion' ? 'Diskussion' :
                           gameState.phase === 'voting' ? 'Abstimmung' :
                           gameState.phase === 'results' ? 'Ergebnisse' : 
                           gameState.phase === 'word-time-countdown' ? 'Countdown' :
                           gameState.phase === 'word-time-speaking' ? 'Wortzeit' :
                           gameState.phase === 'word-time-waiting' ? 'Warten auf nächste Runde' :
                           gameState.phase}
              </span>
            </div>
          </div>
        )}

        {/* Game Mode Selection */}
        {gameState.phase === 'lobby' && (
          <div className="modern-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Spielmodus</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleModeChange('standard')}
                disabled={!isHost}
                className={`p-4 text-center transition-all duration-200 rounded-xl font-semibold ${
                  !localSettings.wordTimeMode && !localSettings.survivalMode
                    ? 'modern-btn modern-btn-primary'
                    : 'modern-card hover:border-slate-500/50'
                } ${!isHost ? 'cursor-default' : ''}`}
              >
                <h4 className="text-white font-semibold mb-1">Standard</h4>
                <p className="text-slate-400 text-xs">Klassisches Imposter Spiel</p>
              </button>

              <button
                onClick={() => handleModeChange('wordTime')}
                disabled={!isHost}
                className={`p-4 text-center transition-all duration-200 rounded-xl font-semibold ${
                  localSettings.wordTimeMode
                    ? 'modern-btn modern-btn-secondary'
                    : 'modern-card hover:border-slate-500/50'
                } ${!isHost ? 'cursor-default' : ''}`}
              >
                <h4 className="text-white font-semibold mb-1">Wortzeit</h4>
                <p className="text-slate-400 text-xs">{localSettings.wordTimeSeconds} Sekunden pro Wort</p>
              </button>

              <button
                onClick={() => handleModeChange('survival')}
                disabled={!isHost}
                className={`p-4 text-center transition-all duration-200 rounded-xl font-semibold ${
                  localSettings.survivalMode
                    ? 'modern-btn bg-gradient-to-r from-orange-600 via-orange-700 to-red-700 text-white border border-orange-500/30'
                    : 'modern-card hover:border-slate-500/50'
                } ${!isHost ? 'cursor-default' : ''}`}
              >
                <h4 className="text-white font-semibold mb-1">Überleben</h4>
                <p className="text-slate-400 text-xs">Bis nur 2 Spieler übrig</p>
              </button>
            </div>
          </div>
        )}

        {/* Settings Display */}
        {gameState.phase === 'lobby' && (
          <div className="modern-card p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Aktuelle Einstellungen</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Spielmodus:</span>
                <span className="text-cyan-400 font-semibold">
                  {localSettings.wordTimeMode ? 'Wortzeit' : 
                   localSettings.survivalMode ? 'Überleben' : 'Standard'}
                </span>
              </div>
              {localSettings.wordTimeMode && (
                <div className="flex justify-between">
                  <span className="text-slate-300">Wortzeit:</span>
                  <span className="text-cyan-400 font-semibold">{localSettings.wordTimeSeconds}s</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-300">Zufällige Reihenfolge:</span>
                <span className={`font-semibold ${localSettings.randomOrder ? 'text-green-400' : 'text-red-400'}`}>
                  {localSettings.randomOrder ? 'An' : 'Aus'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Imposter-Tipp:</span>
                <span className={`font-semibold ${localSettings.imposterHint ? 'text-green-400' : 'text-red-400'}`}>
                  {localSettings.imposterHint ? 'An' : 'Aus'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Imposter Anzahl:</span>
                <span className="text-yellow-400 font-semibold">
                  {localSettings.threeImposters ? '3' : 
                   localSettings.twoImposters ? '2' : '1'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((player) => (
            <div
              key={player.id}
              className={`modern-card p-4 transition-all duration-300 ${
                player.isEliminated 
                  ? 'opacity-50 border-red-500/30' 
                  : player.id === currentPlayerId
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    player.isEliminated ? 'bg-red-500/20' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-bold truncate ${player.isEliminated ? 'text-slate-500' : 'text-white'}`}>
                        {player.username}
                      </span>
                      {player.isHost && (
                        <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {player.id === currentPlayerId && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">Du</span>
                      )}
                      {player.isEliminated && (
                        <span className="text-red-400 text-xs font-medium">Eliminiert</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Profile View Button */}
                  {player.userId && player.id !== currentPlayerId && (
                    <button
                      onClick={() => handleViewPlayerProfile(player.userId!)}
                      className="p-2 hover:bg-slate-600/50 rounded-xl transition-all duration-200"
                      title="Profil anzeigen"
                    >
                      <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
                    </button>
                  )}

                  {player.id === currentPlayerId && (
                    <button
                      onClick={handleViewOwnProfile}
                      className="p-2 hover:bg-slate-600/50 rounded-xl transition-all duration-200"
                      title="Mein Profil anzeigen"
                    >
                      <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
                    </button>
                  )}

                  {/* Status Indicators */}
                  {gameState.phase === 'word-reveal' && !player.isEliminated && (
                    <div className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-slate-500'}`} />
                  )}
                  {gameState.phase === 'voting' && !player.isEliminated && (
                    <div className={`w-3 h-3 rounded-full ${player.hasVoted ? 'bg-green-500' : 'bg-slate-500'}`} />
                  )}
                  {gameState.phase === 'word-time-waiting' && !player.isEliminated && (
                    <div className={`w-3 h-3 rounded-full ${player.readyForNextRound ? 'bg-green-500' : 'bg-slate-500'}`} />
                  )}
                  {(gameState.phase === 'word-reveal' || gameState.phase === 'voting') && player.isReady && !player.isEliminated && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Speaking Order */}
        {gameState.speakingOrder && (gameState.phase === 'discussion' || gameState.phase === 'word-time-countdown' || gameState.phase === 'word-time-speaking') && (
          <div className="modern-card p-4">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              {localSettings.wordTimeMode ? 'Wortzeit-Reihenfolge' : 'Sprechreihenfolge'}
              {gameState.roundNumber && gameState.roundNumber > 1 && (
                <span className="text-cyan-400 ml-2">(Runde {gameState.roundNumber})</span>
              )}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {gameState.speakingOrder.map((username, index) => {
                const currentPlayer = players.find(p => p.id === currentPlayerId);
                const isCurrentUser = currentPlayer?.username === username;
                const isCurrentSpeaker = gameState.currentSpeaker === username;
                
                return (
                  <div 
                    key={index} 
                    className={`modern-card p-3 text-center transition-all duration-200 ${
                      isCurrentSpeaker
                        ? 'border-green-500/50 bg-green-500/10'
                        : isCurrentUser 
                        ? 'border-blue-500/50 bg-blue-500/10' 
                        : ''
                    }`}
                  >
                    <div className="text-xs text-slate-400 mb-1 font-medium">#{index + 1}</div>
                    <div className={`font-bold text-sm ${
                      isCurrentSpeaker ? 'text-green-300' :
                      isCurrentUser ? 'text-blue-300' : 'text-white'
                    }`}>
                      {isCurrentUser ? `${username} (Du)` : username}
                    </div>
                    {isCurrentSpeaker && (
                      <div className="text-xs text-green-400 mt-1">Spricht jetzt</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {isHost && canStartGame && (
            <button
              onClick={onStartGame}
              className="modern-btn modern-btn-primary py-3 px-6 flex items-center justify-center space-x-3 font-semibold"
            >
              <Play className="w-5 h-5" />
              <span>Spiel starten</span>
            </button>
          )}

          {canRestart && (
            <button
              onClick={onRestartGame}
              className="modern-btn modern-btn-primary py-3 px-6 flex items-center justify-center space-x-3 font-semibold"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Neue Runde starten</span>
            </button>
          )}

          {!isHost && gameState.phase === 'lobby' && (
            <div className="text-center text-slate-300">
              <p className="font-medium">Warte darauf, dass der Host das Spiel startet...</p>
              <p className="text-sm mt-1">{getMinPlayers()}-10 Spieler erforderlich</p>
            </div>
          )}

          {!isHost && gameState.phase === 'results' && (
            <div className="text-center text-slate-300">
              <p className="font-medium">Warte darauf, dass der Host eine neue Runde startet...</p>
            </div>
          )}
        </div>

        {/* Settings Modal */}
        {showSettings && isHost && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="modern-card w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  Lobby-Einstellungen
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Word Time Settings */}
                {localSettings.wordTimeMode && (
                  <div className="border-b border-slate-700/50 pb-6">
                    <h3 className="text-white font-semibold mb-4">Wortzeit-Einstellungen</h3>
                    
                    <div className="modern-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">Zeit pro Wort</h4>
                          <p className="text-slate-400 text-sm">Wie lange hat jeder Spieler Zeit?</p>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold text-lg">{localSettings.wordTimeSeconds}s</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="3"
                          max="30"
                          value={localSettings.wordTimeSeconds}
                          onChange={(e) => handleSettingChange('wordTimeSeconds', parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>3s</span>
                          <span>15s</span>
                          <span>30s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Standard Settings */}
                <div>
                  <h3 className="text-white font-semibold mb-4">Allgemeine Einstellungen</h3>
                  
                  <div className="space-y-4">
                    <div className="modern-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Zufällige Reihenfolge</h4>
                          <p className="text-slate-400 text-sm">Sprechreihenfolge wird zufällig bestimmt</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('randomOrder', !localSettings.randomOrder)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            localSettings.randomOrder ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            localSettings.randomOrder ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="modern-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Tipp für Imposter</h4>
                          <p className="text-slate-400 text-sm">Imposter sehen Wort mit versteckten Buchstaben</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('imposterHint', !localSettings.imposterHint)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            localSettings.imposterHint ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            localSettings.imposterHint ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className={`space-y-4 ${(localSettings.wordTimeMode || localSettings.survivalMode) ? 'opacity-50' : ''}`}>
                      <div className="modern-card p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">2 Imposter</h4>
                            <p className="text-slate-400 text-sm">
                              {(localSettings.wordTimeMode || localSettings.survivalMode) 
                                ? 'In speziellen Modi deaktiviert' 
                                : 'Mindestens 4 Spieler erforderlich'
                              }
                            </p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('twoImposters', !localSettings.twoImposters)}
                            disabled={activePlayers.length < 4 || localSettings.wordTimeMode || localSettings.survivalMode}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              localSettings.twoImposters ? 'bg-blue-600' : 'bg-slate-600'
                            } ${(activePlayers.length < 4 || localSettings.wordTimeMode || localSettings.survivalMode) ? 'opacity-50' : ''}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              localSettings.twoImposters ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className="modern-card p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">3 Imposter</h4>
                            <p className="text-slate-400 text-sm">
                              {(localSettings.wordTimeMode || localSettings.survivalMode) 
                                ? 'In speziellen Modi deaktiviert' 
                                : 'Mindestens 5 Spieler erforderlich'
                              }
                            </p>
                          </div>
                          <button
                            onClick={() => handleSettingChange('threeImposters', !localSettings.threeImposters)}
                            disabled={activePlayers.length < 5 || localSettings.wordTimeMode || localSettings.survivalMode}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              localSettings.threeImposters ? 'bg-blue-600' : 'bg-slate-600'
                            } ${(activePlayers.length < 5 || localSettings.wordTimeMode || localSettings.survivalMode) ? 'opacity-50' : ''}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              localSettings.threeImposters ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setShowSettings(false)}
                  className="modern-btn modern-btn-primary w-full py-3"
                >
                  Fertig
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};