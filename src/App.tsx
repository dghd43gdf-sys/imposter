import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { ModernBackground } from './components/ModernBackground';
import { Navigation } from './components/Layout/Navigation';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { PlayPage } from './pages/PlayPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LobbyData, Player, GameState, User, LobbySettings } from './types/game';

interface GameData {
  word: string | null;
  isImposter: boolean;
  phase: string;
  imposterHint?: string;
}

interface VoteResults {
  eliminatedPlayer: string;
  wasImposter: boolean;
  voteCount: { [key: string]: number };
  word?: string;
  imposterName?: string;
  survivalWinners?: string[];
}

interface WordGuessResult {
  imposterName: string;
  guessedWord: string;
  correctWord: string;
  wasCorrect: boolean;
}

// Component to handle lobby URL joining
const LobbyJoinHandler: React.FC<{ onJoinLobby: (code: string) => void }> = ({ onJoinLobby }) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code && code.length === 6) {
      onJoinLobby(code.toUpperCase());
    } else {
      navigate('/dashboard');
    }
  }, [code, onJoinLobby, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner message="Trete Lobby bei..." />
    </div>
  );
};

function App() {
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState<User | null>(null);
  const [lobbyCode, setLobbyCode] = useState('');
  const [lobbyId, setLobbyId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [hostUsername, setHostUsername] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>({ phase: 'lobby', speakingOrder: null });
  const [gameData, setGameData] = useState<GameData>({ word: null, isImposter: false, phase: 'lobby' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteResults, setVoteResults] = useState<VoteResults | null>(null);
  const [wordGuessResult, setWordGuessResult] = useState<WordGuessResult | null>(null);
  const [userVerificationLoading, setUserVerificationLoading] = useState(false);
  const [lobbySettings, setLobbySettings] = useState<LobbySettings>({
    randomOrder: true,
    twoImposters: false,
    threeImposters: false,
    imposterHint: false,
    wordTimeMode: false,
    survivalMode: false,
    wordTimeSeconds: 10 // Default to 10 seconds
  });

  // Check for saved user on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('imposter-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Verify user exists in database
        setUserVerificationLoading(true);
        verifyUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('imposter-user');
        if (location.pathname !== '/') {
          navigate('/');
        }
      }
    }
  }, [navigate, location.pathname]);

  const verifyUser = async (userData: User) => {
    try {
      const response = await fetch('/api/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userData.id }),
      });

      const data = await response.json();

      if (data.success) {
        // User exists, update with latest data from server
        setUser(data.user);
        localStorage.setItem('imposter-user', JSON.stringify(data.user));
        
        // Navigate to dashboard if on login page
        if (location.pathname === '/') {
          navigate('/dashboard');
        }
      } else {
        // User doesn't exist anymore, log out
        console.log('User no longer exists in database, logging out');
        handleLogout();
        setError('Dein Account wurde nicht gefunden. Möglicherweise wurde die Datenbank zurückgesetzt. Bitte melde dich erneut an.');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      // On network error, keep user logged in but show warning
      setUser(userData);
      if (location.pathname === '/') {
        navigate('/dashboard');
      }
    } finally {
      setUserVerificationLoading(false);
    }
  };

  // Check for direct lobby URL joining
  useEffect(() => {
    if (user && location.pathname.startsWith('/lobby/')) {
      const lobbyMatch = location.pathname.match(/\/lobby\/([A-Z0-9]{6})$/);
      if (lobbyMatch && !lobbyCode) {
        const code = lobbyMatch[1];
        handleJoinLobby(code);
      }
    }
  }, [user, location.pathname, lobbyCode]);

  // Prevent scrolling during active game phases
  useEffect(() => {
    const isGameActive = gameData.phase && gameData.phase !== 'lobby' && gameData.phase !== 'results';
    
    if (isGameActive) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup function to ensure scrolling is re-enabled
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [gameData.phase]);

  useEffect(() => {
    if (!socket) return;

    // Store socket globally for GamePhase component and pass lobbyId
    (window as any).socket = socket;
    (window as any).currentLobbyId = lobbyId;

    console.log('Setting global lobbyId:', lobbyId);

    // Handle socket connection
    socket.on('connect', () => {
      console.log('Socket connected');
      // Authenticate if user is logged in
      if (user) {
        socket.emit('authenticate', user);
      }
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      if (user) {
        setError('Verbindung verloren. Bitte lade die Seite neu.');
      }
    });

    // Handle socket connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Verbindung zum Server fehlgeschlagen. Bitte versuche es erneut.');
    });

    socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('Socket authenticated successfully');
      } else {
        console.error('Socket authentication failed');
      }
    });

    socket.on('user-updated', (updatedUser) => {
      console.log('User stats updated:', updatedUser);
      setUser(updatedUser);
      localStorage.setItem('imposter-user', JSON.stringify(updatedUser));
    });

    socket.on('lobby-created', (data) => {
      setLobbyCode(data.lobbyCode);
      setLobbyId(data.lobbyId);
      setPlayerId(data.playerId);
      setIsHost(data.isHost);
      setHostUsername(data.hostUsername || user?.username || '');
      setLoading(false);
      navigate(`/lobby/${data.lobbyCode}`);
      console.log('Lobby created with ID:', data.lobbyId);
    });

    socket.on('lobby-joined', (data) => {
      setLobbyCode(data.lobbyCode);
      setLobbyId(data.lobbyId);
      setPlayerId(data.playerId);
      setIsHost(data.isHost);
      setHostUsername(data.hostUsername || '');
      setLoading(false);
      navigate(`/lobby/${data.lobbyCode}`);
      console.log('Lobby joined with ID:', data.lobbyId);
    });

    socket.on('host-transferred', (data) => {
      setIsHost(data.isHost);
      console.log('Host transferred, new host status:', data.isHost);
    });

    socket.on('lobby-updated', (data: LobbyData) => {
      console.log('Received lobby update with settings:', data.settings);
      setPlayers(data.players);
      setGameState(data.gameState);
      if (data.settings) {
        console.log('Updating lobby settings from server:', data.settings);
        setLobbySettings(data.settings);
      }
      // Update host username
      const hostPlayer = data.players.find(p => p.isHost);
      if (hostPlayer) {
        setHostUsername(hostPlayer.username);
      }
      // Update isHost status for current player
      const currentPlayer = data.players.find(p => p.id === playerId);
      if (currentPlayer) {
        setIsHost(currentPlayer.isHost);
      }
    });

    socket.on('game-started', (data) => {
      setGameData({
        word: data.word,
        isImposter: data.isImposter,
        phase: data.phase,
        imposterHint: data.imposterHint
      });
      navigate(`/game/${lobbyCode}`);
    });

    socket.on('discussion-phase', (data) => {
      setGameData(prev => ({ ...prev, phase: data.phase }));
      setGameState(prev => ({ ...prev, phase: data.phase, speakingOrder: data.speakingOrder }));
    });

    socket.on('word-time-countdown', (data) => {
      setGameData(prev => ({ ...prev, phase: 'word-time-countdown' }));
      setGameState(prev => ({ 
        ...prev, 
        phase: 'word-time-countdown', 
        speakingOrder: data.speakingOrder,
        timeRemaining: data.timeRemaining,
        roundNumber: data.roundNumber
      }));
    });

    socket.on('word-time-speaking', (data) => {
      setGameData(prev => ({ ...prev, phase: 'word-time-speaking' }));
      setGameState(prev => ({ 
        ...prev, 
        phase: 'word-time-speaking',
        currentSpeaker: data.currentSpeaker,
        timeRemaining: data.timeRemaining,
        roundNumber: data.roundNumber
      }));
    });

    socket.on('word-time-waiting', (data) => {
      setGameData(prev => ({ ...prev, phase: 'word-time-waiting' }));
      setGameState(prev => ({ 
        ...prev, 
        phase: 'word-time-waiting',
        roundNumber: data.roundNumber
      }));
    });

    socket.on('voting-phase', (data) => {
      setGameData(prev => ({ ...prev, phase: 'voting' }));
      setGameState(prev => ({ ...prev, phase: 'voting' }));
    });

    socket.on('voting-results', (data) => {
      setVoteResults(data);
      setWordGuessResult(null);
      setGameData(prev => ({ ...prev, phase: data.phase }));
      setGameState(prev => ({ ...prev, phase: data.phase }));
    });

    socket.on('word-guess-result', (data) => {
      setWordGuessResult(data);
      setVoteResults(null);
      setGameData(prev => ({ ...prev, phase: data.phase }));
      setGameState(prev => ({ ...prev, phase: data.phase }));
    });

    socket.on('game-restarted', (data) => {
      setGameData({ word: null, isImposter: false, phase: data.phase });
      setGameState({ phase: data.phase, speakingOrder: null });
      setVoteResults(null);
      setWordGuessResult(null);
      navigate(`/lobby/${lobbyCode}`);
    });

    socket.on('survival-next-round', (data) => {
      setGameData({
        word: data.word,
        isImposter: data.isImposter,
        phase: data.phase,
        imposterHint: data.imposterHint
      });
      setGameState({ phase: data.phase, speakingOrder: null });
      setVoteResults(null);
      setWordGuessResult(null);
    });

    socket.on('survival-game-ended', (data) => {
      setVoteResults({
        eliminatedPlayer: '',
        wasImposter: false,
        voteCount: {},
        word: data.lastWord,
        imposterName: data.winners.join(', '),
        survivalWinners: data.winners
      });
      setGameData(prev => ({ ...prev, phase: 'results' }));
      setGameState(prev => ({ ...prev, phase: 'results' }));
    });

    socket.on('lobby-closed', () => {
      setError('Die Lobby wurde vom Host geschlossen.');
      setTimeout(() => {
        setError(null);
        navigate('/dashboard');
        resetLobbyState();
      }, 3000);
    });

    socket.on('error', (data) => {
      setError(data.message);
      setLoading(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('authenticated');
      socket.off('user-updated');
      socket.off('lobby-created');
      socket.off('lobby-joined');
      socket.off('host-transferred');
      socket.off('lobby-updated');
      socket.off('game-started');
      socket.off('discussion-phase');
      socket.off('word-time-countdown');
      socket.off('word-time-speaking');
      socket.off('word-time-waiting');
      socket.off('voting-phase');
      socket.off('voting-results');
      socket.off('word-guess-result');
      socket.off('game-restarted');
      socket.off('survival-next-round');
      socket.off('survival-game-ended');
      socket.off('lobby-closed');
      socket.off('error');
    };
  }, [socket, user, lobbyId, lobbyCode, navigate, playerId]);

  const resetLobbyState = () => {
    setLobbyCode('');
    setLobbyId('');
    setPlayerId('');
    setIsHost(false);
    setHostUsername('');
    setPlayers([]);
    setGameState({ phase: 'lobby', speakingOrder: null });
    setGameData({ word: null, isImposter: false, phase: 'lobby' });
    setVoteResults(null);
    setWordGuessResult(null);
    setLobbySettings({
      randomOrder: true,
      twoImposters: false,
      threeImposters: false,
      imposterHint: false,
      wordTimeMode: false,
      survivalMode: false,
      wordTimeSeconds: 10
    });
  };

  const handleLogin = (userData: User) => {
    console.log('User logged in:', userData);
    setUser(userData);
    navigate('/dashboard');
    
    // Save user to localStorage
    localStorage.setItem('imposter-user', JSON.stringify(userData));
    
    // Authenticate socket if connected
    if (socket && socket.connected) {
      socket.emit('authenticate', userData);
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    resetLobbyState();
    
    // Remove user from localStorage
    localStorage.removeItem('imposter-user');
  };

  const handleCreateLobby = () => {
    if (!socket || !user) {
      setError('Bitte lade die Seite neu und versuche es erneut.');
      return;
    }
    setLoading(true);
    socket.emit('create-lobby', { username: user.username });
  };

  const handleJoinLobby = (code: string) => {
    if (!socket || !user) {
      setError('Bitte lade die Seite neu und versuche es erneut.');
      return;
    }
    setLoading(true);
    socket.emit('join-lobby', { username: user.username, lobbyCode: code });
  };

  const handleLeaveLobby = () => {
    if (!socket) return;
    socket.emit('leave-lobby', { lobbyId });
    navigate('/dashboard');
    resetLobbyState();
  };

  const handleCloseLobby = () => {
    if (!socket || !isHost) return;
    socket.emit('close-lobby', { lobbyId });
    navigate('/dashboard');
    resetLobbyState();
  };

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('start-game', { lobbyId, settings: lobbySettings });
  };

  const handlePlayerReady = () => {
    if (!socket) return;
    socket.emit('player-ready', { lobbyId });
  };

  const handleReadyForVoting = () => {
    if (!socket) return;
    socket.emit('ready-for-voting', { lobbyId });
  };

  const handleReadyForNextRound = () => {
    if (!socket) return;
    socket.emit('ready-for-next-round', { lobbyId });
  };

  const handleVote = (targetId: string) => {
    if (!socket) return;
    socket.emit('cast-vote', { lobbyId, targetPlayerId: targetId });
  };

  const handleRestartGame = () => {
    if (!socket) return;
    socket.emit('restart-game', { lobbyId });
  };

  const handleUpdateSettings = (settings: LobbySettings) => {
    console.log('Updating settings:', settings);
    setLobbySettings(settings);
    if (socket) {
      socket.emit('update-settings', { lobbyId, settings });
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    console.log('Profile updated:', updatedUser);
    setUser(updatedUser);
    // Update localStorage with new user data
    localStorage.setItem('imposter-user', JSON.stringify(updatedUser));
  };

  const handleWordGuess = (guessedWord: string) => {
    if (!socket || !lobbyId) {
      console.error('Socket or lobbyId not available');
      return;
    }
    
    console.log('Sending word guess from App:', { lobbyId, guessedWord });
    socket.emit('guess-word', { lobbyId, guessedWord });
  };

  // Show error overlay
  if (error) {
    return (
      <>
        <ModernBackground />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="modern-card bg-red-900/20 border-red-500/30 rounded-3xl p-8 w-full max-w-md text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Fehler</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                navigate(user ? '/dashboard' : '/');
              }}
              className="modern-btn modern-btn-danger w-full py-3"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show loading only for specific actions
  if (loading) {
    return (
      <>
        <ModernBackground />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner message="Verbinde..." />
        </div>
      </>
    );
  }

  // Show loading during user verification
  if (userVerificationLoading) {
    return (
      <>
        <ModernBackground />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner message="Überprüfe Benutzerdaten..." />
        </div>
      </>
    );
  }

  return (
    <>
      <ModernBackground />
      <div className="min-h-screen">
        {user && (
          <Navigation 
            user={user} 
            onLogout={handleLogout} 
            lobbyCode={lobbyCode}
            hostUsername={hostUsername}
            gamePhase={gameState.phase}
          />
        )}
        
        <Routes>
          <Route 
            path="/" 
            element={<LoginPage onLogin={handleLogin} />} 
          />
          
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <HomePage 
                  user={user}
                  onCreateLobby={handleCreateLobby}
                  onJoinLobby={handleJoinLobby}
                  loading={loading}
                />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            } 
          />
          
          {/* Direct lobby join route */}
          <Route 
            path="/lobby/:code" 
            element={
              user ? (
                <LobbyPage
                  lobbyCode={lobbyCode}
                  players={players}
                  gameState={gameState}
                  currentPlayerId={playerId}
                  isHost={isHost}
                  hostUsername={hostUsername}
                  onStartGame={handleStartGame}
                  onRestartGame={handleRestartGame}
                  onLeaveLobby={handleLeaveLobby}
                  onCloseLobby={handleCloseLobby}
                  onUpdateSettings={handleUpdateSettings}
                  settings={lobbySettings}
                />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            } 
          />
          
          <Route 
            path="/game/:code" 
            element={
              <PlayPage
                phase={gameData.phase}
                word={gameData.word}
                isImposter={gameData.isImposter}
                imposterHint={gameData.imposterHint}
                players={players}
                speakingOrder={gameState.speakingOrder}
                currentPlayerId={playerId}
                isHost={isHost}
                lobbyId={lobbyId}
                gameState={gameState}
                settings={lobbySettings}
                onReady={handlePlayerReady}
                onReadyForVoting={handleReadyForVoting}
                onReadyForNextRound={handleReadyForNextRound}
                onVote={handleVote}
                onRestartGame={handleRestartGame}
                onWordGuess={handleWordGuess}
                voteResults={voteResults}
                wordGuessResult={wordGuessResult}
              />
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              user ? (
                <ProfilePage 
                  user={user}
                  onUpdate={handleProfileUpdate}
                />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            } 
          />
          
          <Route 
            path="/profile/:userId" 
            element={<ProfilePage />} 
          />
        </Routes>
      </div>
    </>
  );
}

export default App;