import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, GameHighScores } from './types';
import { storageService } from './services/storage.service';
import { Navbar } from './components/Navbar';
import { WordRushGame } from './components/WordRushGame';
import { MathRushGame } from './components/MathRushGame';
import { LetterFallGame } from './components/LetterFallGame';
import { WordShifterGame } from './components/WordShifterGame';
import { ArcadeHubModal } from './components/ArcadeHubModal';
import { InfoModal } from './components/InfoModal';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameMode>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('math')) return 'math';
    if (hash.includes('letterfall') || hash.includes('fall')) return 'letterfall';
    if (hash.includes('shifter') || hash.includes('shift') || hash.includes('diagonal') || hash.includes('matrix')) return 'shifter';
    return 'word';
  });

  const [highScores, setHighScores] = useState<GameHighScores>(() => storageService.getHighScores());
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [gameResetKey, setGameResetKey] = useState(0);

  // Sync hash
  const handleSelectGame = useCallback((game: GameMode) => {
    const canonicalGame = game === 'diagonal' ? 'shifter' : game;
    setActiveGame(canonicalGame);
    window.location.hash = canonicalGame;
    setGameResetKey(prev => prev + 1);
  }, []);

  const refreshHighScores = useCallback(() => {
    setHighScores(storageService.getHighScores());
  }, []);

  const handleRestart = useCallback(() => {
    setGameResetKey(prev => prev + 1);
  }, []);

  // Listen for browser back/forward or hash change
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('math') && activeGame !== 'math') {
        setActiveGame('math');
      } else if ((hash.includes('letterfall') || hash.includes('fall')) && activeGame !== 'letterfall') {
        setActiveGame('letterfall');
      } else if ((hash.includes('shifter') || hash.includes('shift') || hash.includes('diagonal') || hash.includes('matrix')) && activeGame !== 'shifter') {
        setActiveGame('shifter');
      } else if (hash.includes('word') && activeGame !== 'word') {
        setActiveGame('word');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
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

