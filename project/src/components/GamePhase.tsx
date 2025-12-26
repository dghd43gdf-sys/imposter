import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, Vote, Users, RotateCcw, Target, Clock, Play, Sparkles } from 'lucide-react';
import { Player, VoteCount, GameState, LobbySettings } from '../types/game';

interface GamePhaseProps {
  phase: string;
  word: string | null;
  isImposter: boolean;
  imposterHint?: string;
  players: Player[];
  speakingOrder: string[] | null;
  currentPlayerId: string;
  isHost: boolean;
  lobbyId: string;
  gameState: GameState;
  settings: LobbySettings;
  onReady: () => void;
  onReadyForVoting: () => void;
  onReadyForNextRound: () => void;
  onVote: (targetId: string) => void;
  onRestartGame: () => void;
  onWordGuess: (guessedWord: string) => void;
  voteResults?: {
    eliminatedPlayer: string;
    wasImposter: boolean;
    voteCount: VoteCount;
    word?: string;
    imposterName?: string;
    survivalWinners?: string[];
  };
  wordGuessResult?: {
    imposterName: string;
    guessedWord: string;
    correctWord: string;
    wasCorrect: boolean;
  };
}

export const GamePhase: React.FC<GamePhaseProps> = ({
  phase,
  word,
  isImposter,
  imposterHint,
  players,
  speakingOrder,
  currentPlayerId,
  isHost,
  lobbyId,
  gameState,
  settings,
  onReady,
  onReadyForVoting,
  onReadyForNextRound,
  onVote,
  onRestartGame,
  onWordGuess,
  voteResults,
  wordGuessResult
}) => {
  const [selectedVoteTarget, setSelectedVoteTarget] = useState<string>('');
  const [showWordGuess, setShowWordGuess] = useState(false);
  const [guessedWord, setGuessedWord] = useState('');

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const activePlayers = players.filter(p => !p.isEliminated);
  const votablePlayers = activePlayers.filter(p => p.id !== currentPlayerId);

  const handleWordGuess = () => {
    if (!guessedWord.trim()) return;
    
    onWordGuess(guessedWord.trim());
    setShowWordGuess(false);
    setGuessedWord('');
  };

  // Word Time Countdown Phase
  if (phase === 'word-time-countdown') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="modern-card rounded-3xl p-8 w-full max-w-2xl text-center animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Wortzeit beginnt!
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              Gleich hat jeder {settings.wordTimeSeconds} Sekunden Zeit, ein Wort zu sagen
            </p>
            
            {gameState.roundNumber && gameState.roundNumber > 1 && (
              <div className="modern-card p-4 mb-6">
                <h3 className="text-cyan-300 font-bold text-xl">Runde {gameState.roundNumber}</h3>
                <p className="text-cyan-400">Neue zufällige Reihenfolge!</p>
              </div>
            )}

            <div className="text-8xl font-bold text-white mb-4">
              {gameState.timeRemaining || 3}
            </div>
            <p className="text-slate-300 text-xl">Sekunden bis zum Start</p>
          </div>
        </div>
      </div>
    );
  }

  // Word Time Speaking Phase
  if (phase === 'word-time-speaking') {
    const isCurrentSpeaker = currentPlayer?.username === gameState.currentSpeaker;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="modern-card rounded-3xl p-8 w-full max-w-2xl text-center animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="mb-8">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
              isCurrentSpeaker ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-violet-500 to-indigo-500'
            }`}>
              <Users className="w-12 h-12 text-white" />
            </div>

            <h2 className={`text-3xl font-bold mb-4 ${isCurrentSpeaker ? 'text-emerald-400' : 'text-white'}`}>
              {isCurrentSpeaker ? 'Du bist dran!' : `${gameState.currentSpeaker} ist dran`}
            </h2>

            <div className="text-6xl font-bold text-white mb-4">
              {gameState.timeRemaining || settings.wordTimeSeconds}
            </div>
            <p className="text-slate-300 text-lg">Sekunden verbleibend</p>

            {gameState.roundNumber && (
              <div className="mt-6 text-cyan-400">
                <p>Runde {gameState.roundNumber}</p>
              </div>
            )}

            {isCurrentSpeaker && (
              <div className="mt-6 modern-card p-4">
                <p className="text-emerald-300 font-semibold text-lg">Sage jetzt ein Wort!</p>
                <p className="text-emerald-400 mt-1">Nutze Voice-Chat</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Word Time Waiting Phase
  if (phase === 'word-time-waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="modern-card rounded-3xl p-8 w-full max-w-2xl text-center animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Runde {gameState.roundNumber || 1} beendet!
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              Alle haben ein Wort gesagt. Was möchtet ihr als nächstes tun?
            </p>

            <div className="space-y-4">
              {isImposter && (
                <button
                  onClick={() => setShowWordGuess(true)}
                  className="modern-btn modern-btn-danger py-4 px-8 flex items-center space-x-3 mx-auto text-lg font-semibold"
                >
                  <Target className="w-5 h-5" />
                  <span>Wort erraten</span>
                </button>
              )}

              {currentPlayer?.readyForVoting ? (
                <div className="flex items-center justify-center space-x-2 text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg">Bereit zum Abstimmen! Warte auf andere...</span>
                </div>
              ) : (
                <button
                  onClick={onReadyForVoting}
                  className="modern-btn modern-btn-primary py-4 px-8 flex items-center space-x-3 mx-auto text-lg font-semibold"
                >
                  <Vote className="w-5 h-5" />
                  <span>Bereit zum Abstimmen</span>
                </button>
              )}

              {currentPlayer?.readyForNextRound ? (
                <div className="flex items-center justify-center space-x-2 text-cyan-400">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg">Bereit für nächste Runde! Warte auf andere...</span>
                </div>
              ) : (
                <button
                  onClick={onReadyForNextRound}
                  className="modern-btn modern-btn-secondary py-4 px-8 flex items-center space-x-3 mx-auto text-lg font-semibold"
                >
                  <Play className="w-5 h-5" />
                  <span>Nächste Runde</span>
                </button>
              )}
            </div>
          </div>

          {/* Word Guess Modal */}
          {showWordGuess && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="modern-card rounded-3xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Wort erraten
                </h3>
                <p className="text-slate-300 text-sm mb-6 text-center">
                  Wenn du das richtige Wort errätst, gewinnst du. Bei einem falschen Wort verlierst du!
                </p>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={guessedWord}
                    onChange={(e) => setGuessedWord(e.target.value)}
                    placeholder="Dein Wort..."
                    className="modern-input text-center text-lg font-semibold"
                    maxLength={50}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && guessedWord.trim()) {
                        handleWordGuess();
                      }
                    }}
                  />
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowWordGuess(false);
                        setGuessedWord('');
                      }}
                      className="flex-1 modern-btn modern-btn-neutral py-3"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleWordGuess}
                      disabled={!guessedWord.trim()}
                      className="flex-1 modern-btn modern-btn-danger py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Erraten!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'word-reveal') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="modern-card rounded-3xl p-8 w-full max-w-md text-center animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="mb-8">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
              isImposter ? 'bg-gradient-to-br from-red-500 to-pink-500' : 'bg-gradient-to-br from-violet-500 to-indigo-500'
            }`}>
              <Eye className="w-12 h-12 text-white" />
            </div>

            <h2 className={`text-2xl font-bold mb-4 ${isImposter ? 'text-pink-400' : 'text-violet-400'}`}>
              {isImposter ? 'Du bist der Imposter!' : 'Dein Wort'}
            </h2>

            <div>
              {isImposter ? (
                <div className="mb-6">
                  <div className="text-6xl mb-4">🕵️</div>
                  <p className="text-pink-400 text-2xl font-semibold mb-4">IMPOSTER</p>
                  {imposterHint && (
                    <div className="modern-card p-6 mb-4">
                      <p className="text-slate-400 text-sm mb-2">Tipp:</p>
                      <span className="text-2xl font-bold text-yellow-400 font-mono tracking-wider">{imposterHint}</span>
                    </div>
                  )}
                  <p className="text-slate-400 text-sm">
                    Alle anderen haben das gleiche Wort. Versuche dich einzufügen!
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="modern-card p-6 mb-4">
                    <span className="text-4xl font-bold text-white">{word}</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Alle haben dieses Wort außer dem Imposter
                  </p>
                </div>
              )}

              {currentPlayer?.isReady ? (
                <div className="flex items-center justify-center space-x-2 text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg">Bereit! Warte auf andere...</span>
                </div>
              ) : (
                <button
                  onClick={onReady}
                  className="modern-btn modern-btn-primary py-4 px-8 flex items-center justify-center space-x-2 mx-auto text-lg font-semibold"
                >
                  <span>Bereit!</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'discussion') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="modern-card rounded-3xl p-8 w-full max-w-2xl animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Diskussionsphase
            </h2>
            <p className="text-slate-300 text-lg">Diskutiert und findet den Imposter</p>
          </div>

          {speakingOrder && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-6 text-center flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <span>Sprechreihenfolge</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {speakingOrder.map((username, index) => {
                  const currentPlayer = players.find(p => p.id === currentPlayerId);
                  const isCurrentUser = currentPlayer?.username === username;
                  
                  return (
                    <div 
                      key={index} 
                      className={`modern-card p-4 text-center ${
                        isCurrentUser 
                          ? 'border-violet-500/50 bg-violet-500/10' 
                          : ''
                      }`}
                    >
                      <div className="text-sm text-slate-400 mb-2">#{index + 1}</div>
                      <div className={`font-medium text-sm ${isCurrentUser ? 'text-violet-300' : 'text-white'}`}>
                        {isCurrentUser ? `${username} (Du)` : username}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            {isImposter && (
              <button
                onClick={() => setShowWordGuess(true)}
                className="modern-btn modern-btn-danger py-4 px-8 flex items-center space-x-3 mx-auto text-lg font-semibold"
              >
                <Target className="w-5 h-5" />
                <span>Wort erraten</span>
              </button>
            )}

            {currentPlayer?.readyForVoting ? (
              <div className="flex items-center justify-center space-x-2 text-emerald-400">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg">Bereit! Warte auf andere...</span>
              </div>
            ) : (
              <button
                onClick={onReadyForVoting}
                className="modern-btn modern-btn-primary py-4 px-8 flex items-center space-x-3 mx-auto text-lg font-semibold"
              >
                <Vote className="w-5 h-5" />
                <span>Bereit zum Abstimmen</span>
              </button>
            )}
          </div>

          {/* Word Guess Modal */}
          {showWordGuess && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="modern-card rounded-3xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Wort erraten
                </h3>
                <p className="text-slate-300 text-sm mb-6 text-center">
                  Wenn du das richtige Wort errätst, gewinnst du. Bei einem falschen Wort verlierst du!
                </p>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={guessedWord}
                    onChange={(e) => setGuessedWord(e.target.value)}
                    placeholder="Dein Wort..."
                    className="modern-input text-center text-lg font-semibold"
                    maxLength={50}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && guessedWord.trim()) {
                        handleWordGuess();
                      }
                    }}
                  />
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowWordGuess(false);
                        setGuessedWord('');
                      }}
                      className="flex-1 modern-btn modern-btn-neutral py-3"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleWordGuess}
                      disabled={!guessedWord.trim()}
                      className="flex-1 modern-btn modern-btn-danger py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Erraten!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'voting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="modern-card rounded-3xl p-8 w-full max-w-2xl animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Vote className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Abstimmungsphase
            </h2>
            <p className="text-slate-300 text-lg">Stimme für die Person ab, von der du denkst, dass sie der Imposter ist</p>
          </div>

          {currentPlayer?.hasVoted ? (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-emerald-400 mb-4">
                <CheckCircle className="w-8 h-8" />
                <span className="text-xl">Stimme abgegeben!</span>
              </div>
              <p className="text-slate-300 text-lg">Warte darauf, dass andere Spieler abstimmen...</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Wähle einen Spieler zum Eliminieren:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {votablePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedVoteTarget(player.id)}
                    className={`p-4 rounded-2xl border transition-all duration-200 ${
                      selectedVoteTarget === player.id
                        ? 'bg-violet-500/20 border-violet-500 text-white'
                        : 'modern-card text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-lg">{player.username}</div>
                  </button>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => onVote(selectedVoteTarget)}
                  disabled={!selectedVoteTarget}
                  className="modern-btn modern-btn-primary py-4 px-8 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  Stimme abgeben
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'results' && (voteResults || wordGuessResult)) {
    const isWordGuessResult = !!wordGuessResult;
    const isSurvivalEnd = voteResults?.survivalWinners && voteResults.survivalWinners.length > 0;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="modern-card rounded-3xl p-8 w-full max-w-2xl animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
              isSurvivalEnd ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
              isWordGuessResult 
                ? (wordGuessResult.wasCorrect ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-red-500 to-pink-500')
                : (voteResults?.wasImposter ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-red-500 to-pink-500')
            }`}>
              <span className="text-4xl">
                {isSurvivalEnd ? '👑' :
                 isWordGuessResult 
                  ? (wordGuessResult.wasCorrect ? '🎯' : '❌')
                  : (voteResults?.wasImposter ? '✅' : '❌')
                }
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">
              {isSurvivalEnd ? 'Überlebens-Spiel beendet!' :
               isWordGuessResult ? 'Wort erraten!' : 'Abstimmungsergebnisse'}
            </h2>
            
            {isSurvivalEnd ? (
              <div>
                <p className="text-xl font-semibold mb-4 text-yellow-400">
                  Gewinner: {voteResults?.survivalWinners?.join(' & ')}! 🎉
                </p>
                <p className="text-lg mb-4 text-yellow-300">
                  Nur noch 2 Spieler übrig - das Überlebens-Spiel ist beendet!
                </p>
              </div>
            ) : isWordGuessResult ? (
              <div>
                <p className={`text-xl font-semibold mb-4 ${wordGuessResult.wasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {wordGuessResult.imposterName} hat "{wordGuessResult.guessedWord}" geraten!
                </p>
                <p className={`text-lg mb-4 ${wordGuessResult.wasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {wordGuessResult.wasCorrect ? 'Richtig! Der Imposter gewinnt! 🎉' : 'Falsch! Der Imposter verliert! 😢'}
                </p>
              </div>
            ) : (
              <div>
                <p className={`text-xl font-semibold mb-4 ${voteResults?.wasImposter ? 'text-emerald-400' : 'text-red-400'}`}>
                  {voteResults?.eliminatedPlayer} wurde eliminiert!
                </p>
                <p className={`text-lg mb-4 ${voteResults?.wasImposter ? 'text-emerald-400' : 'text-red-400'}`}>
                  {voteResults?.wasImposter ? 'Es war der Imposter! 😢' : 'Es war unschuldig! Der Imposter gewinnt! 🎉'}
                </p>
              </div>
            )}

            {/* Show the word and imposter */}
            <div className="modern-card p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-slate-400 mb-2">Das Wort war:</p>
                  <p className="text-white font-bold text-xl">
                    {isWordGuessResult ? wordGuessResult.correctWord : (voteResults?.word || word)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 mb-2">
                    {isSurvivalEnd ? 'Die Gewinner:' : 'Der Imposter war:'}
                  </p>
                  <p className={`font-bold text-xl ${isSurvivalEnd ? 'text-yellow-400' : 'text-pink-400'}`}>
                    {isSurvivalEnd 
                      ? voteResults?.survivalWinners?.join(' & ')
                      : (isWordGuessResult ? wordGuessResult.imposterName : voteResults?.imposterName)
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Show voting results only for vote-based results */}
          {!isWordGuessResult && !isSurvivalEnd && voteResults && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Abstimmungsergebnisse:</h3>
              <div className="space-y-3">
                {Object.entries(voteResults.voteCount).map(([playerId, votes]) => {
                  const player = players.find(p => p.id === playerId);
                  return (
                    <div key={playerId} className="flex justify-between items-center modern-card p-4">
                      <span className="text-white font-medium text-lg">{player?.username}</span>
                      <span className="text-slate-400 text-lg">{votes} Stimme{votes !== 1 ? 'n' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center">
            {isHost ? (
              <button
                onClick={onRestartGame}
                className="modern-btn modern-btn-primary py-4 px-8 flex items-center justify-center space-x-3 mx-auto text-lg font-semibold"
              >
                <RotateCcw className="w-6 h-6" />
                <span>Neue Runde starten</span>
              </button>
            ) : (
              <div className="text-slate-300">
                <p className="text-lg">Warte darauf, dass der Host eine neue Runde startet...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};