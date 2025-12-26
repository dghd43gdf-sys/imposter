import React from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/Layout/PageLayout';
import { GamePhase } from '../components/GamePhase';
import { Player, GameState, LobbySettings } from '../types/game';

interface PlayPageProps {
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
    voteCount: { [key: string]: number };
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

export const PlayPage: React.FC<PlayPageProps> = (props) => {
  const { code } = useParams();

  return (
    <PageLayout maxWidth="full">
      <div className="max-w-4xl mx-auto">
        <GamePhase {...props} />
      </div>
    </PageLayout>
  );
};