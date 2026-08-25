import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, GameHighScores } from './types';
import { storageService } from './services/storage.service';
import { Navbar } from './components/Navbar';
import { WordRushGame } from './components/WordRushGame';
import { MathRushGame } from './components/MathRushGame';
import { LetterFallGame } from './components/LetterFallGame';
import { MathFallGame } from './components/MathFallGame';
import { WordShifterGame } from './components/WordShifterGame';
import { ArcadeHubModal } from './components/ArcadeHubModal';
import { InfoModal } from './components/InfoModal';

function getGameFromLocation(): GameMode {
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const combined = `${pathname} ${hash}`;

  if (combined.includes('/mathfall') || combined.includes('mathfall') || combined.includes('math-fall')) return 'mathfall';
  if (combined.includes('/math') || combined.includes('math')) return 'math';
  if (combined.includes('/letterfall') || combined.includes('letterfall') || combined.includes('letter-fall') || combined.includes('fall')) return 'letterfall';
  if (combined.includes('/shifter') || combined.includes('shifter') || combined.includes('word-shifter') || combined.includes('shift') || combined.includes('diagonal') || combined.includes('matrix')) return 'shifter';
  return 'word';
}

function getPathForGame(game: GameMode): string {
  switch (game) {
    case 'math':
      return '/math';
    case 'letterfall':
      return '/letterfall';
    case 'mathfall':
      return '/mathfall';
    case 'shifter':
    case 'diagonal':
      return '/shifter';
    case 'word':
    default:
      return '/';
  }
}

export default function App() {
  const [activeGame, setActiveGame] = useState<GameMode>(() => getGameFromLocation());
  const [highScores, setHighScores] = useState<GameHighScores>(() => storageService.getHighScores());
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [gameResetKey, setGameResetKey] = useState(0);

  // Sync pathname cleanly with HTML5 History API
  const handleSelectGame = useCallback((game: GameMode) => {
    const canonicalGame = game === 'diagonal' ? 'shifter' : game;
    setActiveGame(canonicalGame);
    const targetPath = getPathForGame(canonicalGame);
    
    if (window.location.pathname !== targetPath || window.location.hash) {
      window.history.pushState({ game: canonicalGame }, '', targetPath);
    }
    setGameResetKey(prev => prev + 1);
  }, []);

  const refreshHighScores = useCallback(() => {
    setHighScores(storageService.getHighScores());
  }, []);

  const handleRestart = useCallback(() => {
    setGameResetKey(prev => prev + 1);
  }, []);

  // Clean initial hash into clean path if user visited with a # link
  useEffect(() => {
    if (window.location.hash) {
      const targetPath = getPathForGame(activeGame);
      window.history.replaceState({ game: activeGame }, '', targetPath);
    }
  }, [activeGame]);

  // Listen for browser navigation (back / forward buttons)
  useEffect(() => {
    const onLocationChange = () => {
      const nextGame = getGameFromLocation();
      if (nextGame !== activeGame) {
        setActiveGame(nextGame);
        setGameResetKey(prev => prev + 1);
      }
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, [activeGame]);

  // Global ESC listener to dismiss modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsHubOpen(false);
        setIsInfoOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isShifterActive = activeGame === 'shifter' || activeGame === 'diagonal';

  return (
    <div className="h-full w-full max-w-lg mx-auto flex flex-col justify-between p-2 sm:p-3 relative overflow-hidden bg-slate-950 font-sans">
      {/* 1. Header with Dropdown Navigation */}
      <Navbar
        activeGame={isShifterActive ? 'shifter' : activeGame}
        onSelectGame={handleSelectGame}
        onOpenHub={() => setIsHubOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onRestart={handleRestart}
        highScores={highScores}
      />

      {/* 2. Active Game Engine View */}
      <main className="w-full flex-1 flex flex-col items-center justify-between min-h-0 relative">
        {activeGame === 'word' && (
          <WordRushGame
            key={`word-${gameResetKey}`}
            onSelectGame={handleSelectGame}
            onUpdateHighScores={refreshHighScores}
            highScores={highScores}
          />
        )}
        {activeGame === 'math' && (
          <MathRushGame
            key={`math-${gameResetKey}`}
            onSelectGame={handleSelectGame}
            onUpdateHighScores={refreshHighScores}
            highScores={highScores}
          />
        )}
        {activeGame === 'letterfall' && (
          <LetterFallGame
            key={`letterfall-${gameResetKey}`}
            onSelectGame={handleSelectGame}
            onUpdateHighScores={refreshHighScores}
            highScores={highScores}
          />
        )}
        {activeGame === 'mathfall' && (
          <MathFallGame
            key={`mathfall-${gameResetKey}`}
            onSelectGame={handleSelectGame}
            onUpdateHighScores={refreshHighScores}
            highScores={highScores}
          />
        )}
        {isShifterActive && (
          <WordShifterGame
            key={`shifter-${gameResetKey}`}
            onSelectGame={handleSelectGame}
            onGameOver={(_score, _streak) => refreshHighScores()}
            onOpenHub={() => setIsHubOpen(true)}
            onOpenInfo={() => setIsInfoOpen(true)}
            highScores={highScores}
          />
        )}
      </main>

      {/* 3. Global Arcade Suite Hub Modal */}
      <ArcadeHubModal
        isOpen={isHubOpen}
        onClose={() => setIsHubOpen(false)}
        onSelectGame={handleSelectGame}
        activeGame={isShifterActive ? 'shifter' : activeGame}
        highScores={highScores}
      />

      {/* 4. Contextual Info / Rules Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        activeGame={isShifterActive ? 'shifter' : activeGame}
      />
    </div>
  );
}

