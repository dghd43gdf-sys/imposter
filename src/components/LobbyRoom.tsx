import React, { useState, useEffect } from 'react';
import { Crown, Users, Play, RotateCcw, User, Check, Clock, LogOut, Copy, CheckCircle, Eye, Settings, X, Sparkles } from 'lucide-react';
import { Player, GameState, LobbySettings } from '../types/game';

interface LobbyRoomProps {
  lobbyCode: string;
  players: Player[];
  gameState: GameState;
  currentPlayerId: string;
  isHost: boolean;
  onStartGame: () => void;
  onRestartGame: () => void;
  onLeaveLobby: () => void;
  onViewProfile: (userId: string) => void;
  onViewOwnProfile: () => void;
  onUpdateSettings?: (settings: LobbySettings) => void;
  settings?: LobbySettings;
}

export const LobbyRoom: React.FC<LobbyRoomProps> = ({
  lobbyCode,
  players,
  gameState,
  currentPlayerId,
  isHost,
  onStartGame,
  onRestartGame,
  onLeaveLobby,
  onViewProfile,
  onViewOwnProfile,
  onUpdateSettings,
  settings = {
    randomOrder: true,
    twoImposters: false,
    threeImposters: false,
    imposterHint: false,
    wordTimeMode: false,
    survivalMode: false
  }
}) => {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState<LobbySettings>(settings);
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
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

  const handleSettingChange = (key: keyof LobbySettings, value: boolean) => {
    const newSettings = { ...localSettings };
    
    if (key === 'twoImposters' && value) {
      newSettings.threeImposters = false;
    } else if (key === 'threeImposters' && value) {
      newSettings.twoImposters = false;
    }
    
    if (key === 'wordTimeMode' && value) {
      newSettings.survivalMode = false;
      newSettings.twoImposters = false;
      newSettings.threeImposters = false;
    } else if (key === 'survivalMode' && value) {
      newSettings.wordTimeMode = false;
      newSettings.twoImposters = false;
      newSettings.threeImposters = false;
    }
    
    newSettings[key] = value;
    setLocalSettings(newSettings);
    
    if (onUpdateSettings) {
      onUpdateSettings(newSettings);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 w-full max-w-4xl animate-slide-up">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
          <div className="flex-1 w-full">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Lobby
              </h1>
              
              {/* Lobby Info Cards */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="glass-card-light rounded-2xl px-6 py-4 w-full sm:w-auto">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-slate-300 font-medium">Code:</span>
                    <span className="text-white font-mono text-2xl font-bold tracking-wider">{lobbyCode}</span>
                    <button
                      onClick={copyLobbyCode}
                      className="p-2 hover:bg-slate-600/50 rounded-xl transition-all duration-200 group"
                      title="Code kopieren"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-400 group-hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="glass-card-light rounded-2xl px-6 py-4 w-full sm:w-auto">
                  <div className="text-center">
                    <span className="text-slate-300 font-medium">Spieler: </span>
                    <span className="text-white font-bold text-xl">{activePlayers.length}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {isHost && gameState.phase === 'lobby' && (
              <button
                onClick={() => setShowSettings(true)}
                className="glass-card-light rounded-2xl p-4 text-violet-400 hover:text-violet-300 transition-all duration-200 flex items-center space-x-2 group"
                title="Einstellungen"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="font-medium hidden sm:inline">Einstellungen</span>
              </button>
            )}
            
            <button
              onClick={onLeaveLobby}
              className="btn-danger p-4 flex items-center space-x-2 w-full sm:w-auto justify-center"
              title="Lobby verlassen"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Verlassen</span>
            </button>
          </div>
        </div>

        {/* Game Status */}
        {gameState.phase !== 'lobby' && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center space-x-3 glass-card-light rounded-2xl px-6 py-3">
              <Clock className="w-5 h-5 text-violet-400" />
              <span className="text-violet-300 font-semibold text-lg">
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
          <div className="glass-card-light rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>Spielmodus wählen</span>
            </h3>
            
            {isHost ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => {
                    if (onUpdateSettings) {
                      onUpdateSettings({
                        ...settings,
                        wordTimeMode: false,
                        survivalMode: false,
                        twoImposters: false,
                        threeImposters: false
                      });
                    }
                  }}
                  className={`glass-card-light rounded-2xl p-4 text-center transition-all duration-200 ${
                    !localSettings.wordTimeMode && !localSettings.survivalMode
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'hover:border-slate-500/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="text-white font-semibold mb-1">Standard</h4>
                  <p className="text-slate-400 text-xs">Klassisches Imposter Spiel</p>
                </button>

                <button
                  onClick={() => {
                    if (onUpdateSettings) {
                      onUpdateSettings({
                        ...settings,
                        wordTimeMode: true,
                        survivalMode: false,
                        twoImposters: false,
                        threeImposters: false
                      });
                    }
                  }}
                  className={`glass-card-light rounded-2xl p-4 text-center transition-all duration-200 ${
                    localSettings.wordTimeMode
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'hover:border-slate-500/50'
                  }`}
                >
                  <div className="text-2xl mb-2">⏱️</div>
                  <h4 className="text-white font-semibold mb-1">Wortzeit</h4>
                  <p className="text-slate-400 text-xs">5 Sekunden pro Wort</p>
                </button>

                <button
                  onClick={() => {
                    if (onUpdateSettings) {
                      onUpdateSettings({
                        ...settings,
                        survivalMode: true,
                        wordTimeMode: false,
                        twoImposters: false,
                        threeImposters: false
                      });
                    }
                  }}
                  className={`glass-card-light rounded-2xl p-4 text-center transition-all duration-200 ${
                    localSettings.survivalMode
                      ? 'border-orange-500/50 bg-orange-500/10'
                      : 'hover:border-slate-500/50'
                  }`}
                >
                  <div className="text-2xl mb-2">👑</div>
                  <h4 className="text-white font-semibold mb-1">Überlebens</h4>
                  <p className="text-slate-400 text-xs">Bis nur 2 Spieler übrig</p>
                </button>
              </div>
            ) : (
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-3 glass-card-light rounded-2xl px-4 py-2">
                  <span className="text-2xl">
                    {localSettings.wordTimeMode ? '⏱️' : 
                     localSettings.survivalMode ? '👑' : '🎯'}
                  </span>
                  <span className="text-white font-semibold">
                    {localSettings.wordTimeMode ? 'Wortzeit Modus' : 
                     localSettings.survivalMode ? 'Überlebens Modus' : 'Standard Modus'}
                  </span>
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>Aktuelle Einstellungen</span>
            </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Spielmodus:</span>
                  <span className="text-cyan-400 font-semibold">
                    {localSettings.wordTimeMode ? 'Wortzeit' : 
                     localSettings.survivalMode ? 'Überlebens' : 'Standard'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Zufällige Reihenfolge:</span>
                  <span className={`font-semibold ${localSettings.randomOrder ? 'text-emerald-400' : 'text-red-400'}`}>
                    {localSettings.randomOrder ? 'An' : 'Aus'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Imposter-Tipp:</span>
                  <span className={`font-semibold ${localSettings.imposterHint ? 'text-emerald-400' : 'text-red-400'}`}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {players.map((player) => (
            <div
              key={player.id}
              className={`glass-card-light rounded-2xl p-6 transition-all duration-300 ${
                player.isEliminated 
                  ? 'opacity-50 border-red-500/30' 
                  : player.id === currentPlayerId
                  ? 'border-violet-500/50 bg-violet-500/10'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    player.isEliminated ? 'bg-red-500/20' : 'bg-gradient-to-br from-violet-500 to-indigo-500'
                  }`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-bold text-lg truncate ${player.isEliminated ? 'text-slate-500' : 'text-white'}`}>
                        {player.username}
                      </span>
                      {player.isHost && (
                        <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {player.id === currentPlayerId && (
                        <span className="text-xs bg-violet-500 text-white px-3 py-1 rounded-full font-medium">Du</span>
                      )}
                      {player.isEliminated && (
                        <span className="text-red-400 text-sm font-medium">Eliminiert</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {player.userId && player.id !== currentPlayerId && (
                    <button
                      onClick={() => onViewProfile(player.userId!)}
                      className="p-2 hover:bg-slate-600/50 rounded-xl transition-all duration-200"
                      title="Profil anzeigen"
                    >
                      <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
                    </button>
                  )}

                  {player.id === currentPlayerId && (
                    <button
                      onClick={onViewOwnProfile}
                      className="p-2 hover:bg-slate-600/50 rounded-xl transition-all duration-200"
                      title="Mein Profil anzeigen"
                    >
                      <Eye className="w-4 h-4 text-slate-400 hover:text-white" />
                    </button>
                  )}
                  
                  {gameState.phase === 'word-reveal' && !player.isEliminated && (
                    <div className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  )}
                  {gameState.phase === 'voting' && !player.isEliminated && (
                    <div className={`w-3 h-3 rounded-full ${player.hasVoted ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  )}
                  {gameState.phase === 'word-time-waiting' && !player.isEliminated && (
                    <div className={`w-3 h-3 rounded-full ${player.readyForNextRound ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  )}
                  {(gameState.phase === 'word-reveal' || gameState.phase === 'voting') && player.isReady && !player.isEliminated && (
                    <Check className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Speaking Order */}
        {gameState.speakingOrder && (gameState.phase === 'discussion' || gameState.phase === 'word-time-countdown' || gameState.phase === 'word-time-speaking') && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              {localSettings.wordTimeMode ? 'Wortzeit-Reihenfolge' : 'Sprechreihenfolge'}
              {gameState.roundNumber && gameState.roundNumber > 1 && (
                <span className="text-cyan-400 ml-2">(Runde {gameState.roundNumber})</span>
              )}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gameState.speakingOrder.map((username, index) => {
                const currentPlayer = players.find(p => p.id === currentPlayerId);
                const isCurrentUser = currentPlayer?.username === username;
                const isCurrentSpeaker = gameState.currentSpeaker === username;
                
                return (
                  <div 
                    key={index} 
                    className={`glass-card-light rounded-2xl p-4 text-center transition-all duration-200 ${
                      isCurrentSpeaker
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : isCurrentUser 
                        ? 'border-violet-500/50 bg-violet-500/10' 
                        : ''
                    }`}
                  >
                    <div className="text-sm text-slate-400 mb-2 font-medium">#{index + 1}</div>
                    <div className={`font-bold text-base ${
                      isCurrentSpeaker ? 'text-emerald-300' :
                      isCurrentUser ? 'text-violet-300' : 'text-white'
                    }`}>
                      {isCurrentUser ? `${username} (Du)` : username}
                    </div>
                    {isCurrentSpeaker && (
                      <div className="text-xs text-emerald-400 mt-1">Spricht jetzt</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {isHost && canStartGame && (
            <button
              onClick={onStartGame}
              className="btn-success py-4 px-8 flex items-center justify-center space-x-3 text-lg font-semibold"
            >
              <Play className="w-6 h-6" />
              <span>Spiel starten</span>
            </button>
          )}

          {canRestart && (
            <button
              onClick={onRestartGame}
              className="btn-primary py-4 px-8 flex items-center justify-center space-x-3 text-lg font-semibold"
            >
              <RotateCcw className="w-6 h-6" />
              <span>Neue Runde starten</span>
            </button>
          )}

          {!isHost && gameState.phase === 'lobby' && (
            <div className="text-center text-slate-300">
              <p className="text-lg font-medium">Warte darauf, dass der Host das Spiel startet...</p>
              <p className="text-sm mt-2">{getMinPlayers()}-10 Spieler erforderlich</p>
            </div>
          )}

          {!isHost && gameState.phase === 'results' && (
            <div className="text-center text-slate-300">
              <p className="text-lg font-medium">Warte darauf, dass der Host eine neue Runde startet...</p>
            </div>
          )}
        </div>

        {/* Settings Modal */}
        {showSettings && isHost && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
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
                {/* Game Modes */}
                <div className="border-b border-slate-700/50 pb-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    <span>Spielmodi</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="glass-card-light rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Wortzeit Modus</h4>
                          <p className="text-slate-400 text-sm">Jeder hat 5 Sekunden für ein Wort</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('wordTimeMode', !localSettings.wordTimeMode)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            localSettings.wordTimeMode ? 'bg-violet-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            localSettings.wordTimeMode ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="glass-card-light rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Überlebens Modus</h4>
                          <p className="text-slate-400 text-sm">Spiele bis nur 2 Spieler übrig sind</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('survivalMode', !localSettings.survivalMode)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            localSettings.survivalMode ? 'bg-violet-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            localSettings.survivalMode ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Standard Settings */}
                <div>
                  <h3 className="text-white font-semibold mb-4">Allgemeine Einstellungen</h3>
                  
                  <div className="space-y-4">
                    <div className="glass-card-light rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Zufällige Reihenfolge</h4>
                          <p className="text-slate-400 text-sm">Sprechreihenfolge wird zufällig bestimmt</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('randomOrder', !localSettings.randomOrder)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            localSettings.randomOrder ? 'bg-violet-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            localSettings.randomOrder ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="glass-card-light rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Tipp für Imposter</h4>
                          <p className="text-slate-400 text-sm">Imposter sehen Wort mit versteckten Buchstaben</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('imposterHint', !localSettings.imposterHint)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            localSettings.imposterHint ? 'bg-violet-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            localSettings.imposterHint ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className={`space-y-4 ${(localSettings.wordTimeMode || localSettings.survivalMode) ? 'opacity-50' : ''}`}>
                      <div className="glass-card-light rounded-2xl p-4">
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
                              localSettings.twoImposters ? 'bg-violet-600' : 'bg-slate-600'
                            } ${(activePlayers.length < 4 || localSettings.wordTimeMode || localSettings.survivalMode) ? 'opacity-50' : ''}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              localSettings.