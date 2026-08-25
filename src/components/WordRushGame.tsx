import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordDifficulty, WordDifficultyConfig, LetterTile, GameHighScores, GameMode, KeyboardLayoutMode } from '../types';
import { dictionaryService } from '../services/dictionary.service';
import { soundService } from '../services/sound.service';
import { storageService } from '../services/storage.service';
import { RefreshCw, Delete, Trophy, Flame, Timer, Keyboard, Grid3X3 } from 'lucide-react';
import { GameOverModal } from './GameOverModal';
import { StartModal } from './StartModal';

const DIFFICULTY_CONFIGS: Record<WordDifficulty, WordDifficultyConfig> = {
  easy: {
    name: 'easy',
    label: 'EASY',
    initialTime: 14.0,
    bonusTime: 3.0,
    pointsPerWord: 10,
  },
  medium: {
    name: 'medium',
    label: 'MED',
    initialTime: 10.0,
    bonusTime: 2.5,
    pointsPerWord: 15,
  },
  hard: {
    name: 'hard',
    label: 'HARD',
    initialTime: 6.5,
    bonusTime: 1.8,
    pointsPerWord: 25,
  },
};

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

interface WordRushGameProps {
  onSelectGame: (game: GameMode) => void;
  onUpdateHighScores: () => void;
  highScores: GameHighScores;
}

export const WordRushGame: React.FC<WordRushGameProps> = ({
  onSelectGame,
  onUpdateHighScores,
  highScores,
}) => {
  const [difficulty, setDifficulty] = useState<WordDifficulty>('medium');
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayoutMode>(() => storageService.getKeyboardLayout());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStartedBefore, setHasStartedBefore] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10.0);
  const [currentWord, setCurrentWord] = useState('');
  const [tiles, setTiles] = useState<LetterTile[]>([]);
  const [selectedTileIds, setSelectedTileIds] = useState<number[]>([]);
  const [floatingText, setFloatingText] = useState<{ text: string; color: string; id: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccessPulse, setIsSuccessPulse] = useState(false);
  const [missedSolutions, setMissedSolutions] = useState<string[]>([]);

  const config = DIFFICULTY_CONFIGS[difficulty];
  const maxTime = config.initialTime;
  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Setup a new puzzle round
  const generateNewWord = useCallback(() => {
    const word = dictionaryService.getRandomWord();
    setCurrentWord(word);
    const scrambled = dictionaryService.scramble(word);
    const newTiles: LetterTile[] = scrambled.map((letter, idx) => ({
      id: idx,
      letter,
      isUsed: false,
    }));
    setTiles(newTiles);
    setSelectedTileIds([]);
  }, []);

  // Start game session
  const startGame = useCallback((selectedDiff?: WordDifficulty) => {
    const activeDiff = selectedDiff || difficulty;
    const activeCfg = DIFFICULTY_CONFIGS[activeDiff];

    setScore(0);
    setStreak(1);
    setTimeLeft(activeCfg.initialTime);
    setIsGameOver(false);
    setIsPlaying(true);
    setHasStartedBefore(true);
    generateNewWord();
    lastTickRef.current = performance.now();
  }, [difficulty, generateNewWord]);

  // Restart trigger from header
  useEffect(() => {
    // Expose reset handler if needed
  }, []);

  // Main high-precision animation frame timer loop
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    lastTickRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setTimeLeft((prev) => {
        const next = prev - delta;
        return next <= 0 ? 0 : next;
      });

      timerRef.current = requestAnimationFrame(loop);
    };

    timerRef.current = requestAnimationFrame(loop);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isPlaying, isGameOver]);

  // Handle Game Over transition when time runs out
  useEffect(() => {
    if (isPlaying && !isGameOver && timeLeft <= 0) {
      setIsPlaying(false);
      setIsGameOver(true);
      soundService.playGameOver();

      // Find solutions
      const solutions = dictionaryService.findAllValidAnagrams(tiles.map(t => t.letter));
      setMissedSolutions(solutions.length > 0 ? solutions : [currentWord]);

      // Save score
      storageService.saveWordScore(score, streak);
      onUpdateHighScores();
    }
  }, [timeLeft, isPlaying, isGameOver, tiles, currentWord, score, streak, onUpdateHighScores]);

  // Tile Selection & Toggle/Unclick logic
  const handleTileClick = (tileId: number) => {
    if (!isPlaying || isGameOver) return;
    const tile = tiles.find(t => t.id === tileId);
    if (!tile) return;

    // If the tile is ALREADY used/selected, clicking it unclicks/deselects it!
    if (tile.isUsed) {
      soundService.playUntap();
      const nextSelected = selectedTileIds.filter(id => id !== tileId);
      setSelectedTileIds(nextSelected);
      setTiles(prev => prev.map(t => (t.id === tileId ? { ...t, isUsed: false } : t)));
      return;
    }

    soundService.playTileSelect(selectedTileIds.length);

    const nextSelected = [...selectedTileIds, tileId];
    setSelectedTileIds(nextSelected);
    setTiles(prev => prev.map(t => (t.id === tileId ? { ...t, isUsed: true } : t)));

    // If 4 letters selected, check submission automatically
    if (nextSelected.length === 4) {
      const formedWord = nextSelected.map(id => tiles.find(t => t.id === id)?.letter).join('');
      checkSubmission(formedWord);
    }
  };

  // Deselect / Undo letter
  const handleSlotClick = (slotIndex: number) => {
    if (!isPlaying || isGameOver) return;
    if (slotIndex >= selectedTileIds.length) return;

    const tileIdToFree = selectedTileIds[slotIndex];
    soundService.playUntap();

    const nextSelected = selectedTileIds.filter((_, idx) => idx !== slotIndex);
    setSelectedTileIds(nextSelected);
    setTiles(prev => prev.map(t => (t.id === tileIdToFree ? { ...t, isUsed: false } : t)));
  };

  // Clear all selections
  const handleClear = () => {
    if (!isPlaying || selectedTileIds.length === 0) return;
    soundService.playUntap();
    setSelectedTileIds([]);
    setTiles(prev => prev.map(t => ({ ...t, isUsed: false })));
  };

  // Shuffle the letter tiles
  const handleShuffle = () => {
    if (!isPlaying) return;
    soundService.playUntap();
    setTiles(prev => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  // Check formed word validity
  const checkSubmission = (word: string) => {
    if (dictionaryService.isValidWord(word)) {
      // Correct!
      const pointsGained = config.pointsPerWord * streak;
      const newScore = score + pointsGained;
      const newStreak = streak + 1;

      setScore(newScore);
      setStreak(newStreak);

      if (newStreak % 5 === 0) {
        soundService.playCombo();
      } else {
        soundService.playCorrect();
      }

      // Add time bonus
      setTimeLeft(prev => Math.min(prev + config.bonusTime, maxTime + 6));

      // Trigger visual reward pulse
      setIsSuccessPulse(true);
      setTimeout(() => setIsSuccessPulse(false), 300);

      // Trigger floating badge
      setFloatingText({
        text: `+${pointsGained} pts (${config.bonusTime}s)`,
        color: 'text-emerald-400',
        id: Date.now(),
      });

      storageService.saveWordScore(newScore, newStreak);
      onUpdateHighScores();

      // Next word
      setTimeout(() => {
        generateNewWord();
      }, 120);
    } else {
      // Wrong word!
      soundService.playWrong();
      setIsShaking(true);
      setStreak(1);

      setFloatingText({
        text: 'INVALID WORD',
        color: 'text-rose-400',
        id: Date.now(),
      });

      setTimeout(() => {
        setIsShaking(false);
        handleClear();
      }, 380);
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;

      const key = e.key.toUpperCase();

      if (key === 'BACKSPACE') {
        e.preventDefault();
        if (selectedTileIds.length > 0) {
          handleSlotClick(selectedTileIds.length - 1);
        }
      } else if (key === ' ') {
        e.preventDefault();
        handleClear();
      } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        // Find unused tile with this letter
        const match = tiles.find(t => t.letter === key && !t.isUsed);
        if (match) {
          handleTileClick(match.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, tiles, selectedTileIds]);

  // Circular Dial Math calculation
  const progressPercent = Math.min(Math.max(timeLeft / maxTime, 0), 1);
  const strokeDashoffset = 289 * (1 - progressPercent);
  const isDanger = timeLeft <= 3.0;

  return (
    <div id="wordRushView" className="w-full flex flex-col items-center justify-between flex-1 min-h-0 relative">
      {/* 1. HUD SCOREBOARD */}
      <section className="w-full grid grid-cols-4 gap-1.5 sm:gap-2.5 my-1.5 shrink-0" aria-label="Word Rush HUD">
        {/* Time */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 sm:p-2 flex flex-col items-center shadow">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-cyan-400 font-bold mb-0.5 whitespace-nowrap flex items-center gap-1">
            <Timer className="w-2.5 h-2.5" /> Time
          </span>
          <span className={`text-base sm:text-xl font-black font-mono leading-tight ${isDanger ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
            {timeLeft.toFixed(1)}s
          </span>
        </div>

        {/* Score */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 sm:p-2 flex flex-col items-center shadow">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 whitespace-nowrap">Score</span>
          <span className="text-base sm:text-xl font-black text-white leading-tight font-mono">{score}</span>
        </div>

        {/* Streak */}
        <div className="bg-slate-900/80 border-2 border-emerald-500/40 rounded-xl p-1.5 sm:p-2 flex flex-col items-center shadow-[0_0_12px_rgba(16,185,129,0.1)]">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5 whitespace-nowrap flex items-center gap-1">
            <Flame className="w-2.5 h-2.5" /> Streak
          </span>
          <span className="text-base sm:text-xl font-black text-emerald-400 leading-tight font-mono">x{streak}</span>
        </div>

        {/* Best */}
        <div className="bg-slate-900/80 border-2 border-amber-500/40 rounded-xl p-1.5 sm:p-2 flex flex-col items-center shadow-[0_0_12px_rgba(245,158,11,0.1)]">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-400 font-bold mb-0.5 whitespace-nowrap flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5" /> Best
          </span>
          <span className="text-base sm:text-xl font-black text-amber-300 leading-tight font-mono">{highScores.wordRush}</span>
        </div>
      </section>

      {/* 2. MAIN CENTER ARENA (CIRCULAR DIAL + SLOTS) */}
      <main className="relative flex flex-col items-center justify-center flex-1 my-auto w-full min-h-0">
        {/* Floating feedback */}
        {floatingText && (
          <div key={floatingText.id} className={`floating-badge text-sm font-black tracking-wider ${floatingText.color}`}>
            {floatingText.text}
          </div>
        )}

        {/* 4 Selected Word Letter Slots */}
        <div className={`flex gap-2 sm:gap-3 mb-2 sm:mb-3 transition-transform shrink-0 ${isShaking ? 'animate-shake' : ''} ${isSuccessPulse ? 'animate-correct' : ''}`}>
          {[0, 1, 2, 3].map((slotIdx) => {
            const tileId = selectedTileIds[slotIdx];
            const tile = tiles.find(t => t.id === tileId);
            const letter = tile ? tile.letter : '';

            return (
              <button
                key={slotIdx}
                type="button"
                onClick={() => handleSlotClick(slotIdx)}
                className={`w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-18 rounded-xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-black shadow-inner transition-all focus:outline-none cursor-pointer ${
                  letter
                    ? 'bg-slate-900 border-b-4 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-100'
                    : 'bg-slate-900/40 border-b-4 border-slate-800 text-slate-700'
                }`}
                aria-label={`Slot ${slotIdx + 1}`}
              >
                {letter || '_'}
              </button>
            );
          })}
        </div>

        {/* Circular Dial Progress Arena */}
        <div className="relative w-[210px] h-[210px] sm:w-[250px] sm:h-[250px] md:w-[280px] md:h-[280px] flex items-center justify-center shrink-0">
          {/* SVG Progress Ring */}
          <svg className="absolute top-0 left-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="transparent" stroke="#1e293b" strokeWidth="4" />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="transparent"
              stroke={isDanger ? '#ef4444' : '#06b6d4'}
              strokeWidth="4"
              strokeDasharray="289"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-100"
            />
          </svg>

          {/* Floating Digital Tag */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300 shadow-md flex items-center gap-1.5 whitespace-nowrap">
            <span className={`w-1.5 h-1.5 rounded-full ${isDanger ? 'bg-rose-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
            <span className={`font-mono font-bold ${isDanger ? 'text-rose-400' : 'text-cyan-300'}`}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>

          {/* INSIDE DIAL: 4 SCRAMBLED TILES */}
          <div className="z-10 flex flex-col items-center justify-center">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:gap-4">
              {tiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => handleTileClick(tile.id)}
                  disabled={!isPlaying}
                  className={`w-13 h-13 sm:w-15 sm:h-15 md:w-17 md:h-17 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-black transition-all shadow-md focus:outline-none cursor-pointer ${
                    tile.isUsed
                      ? 'opacity-40 scale-90 bg-slate-800 text-slate-400 border-b-2 border-slate-700 hover:opacity-75 hover:scale-95 shadow-inner'
                      : 'bg-cyan-600 border-b-4 border-cyan-800 text-white active:scale-95 hover:bg-cyan-500 shadow-[0_6px_16px_rgba(8,145,178,0.3)]'
                  }`}
                  aria-label={`Letter ${tile.letter}${tile.isUsed ? ' (Selected - click to unselect)' : ''}`}
                >
                  {tile.letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 3. WORD RUSH SPEED & CONTROLS FOOTER */}
      <footer className="w-full flex flex-col items-center gap-1.5 shrink-0 pt-1 pb-0.5">
        {/* Layout Switcher & Action Controls */}
        <div className="flex items-center justify-between gap-2 w-full max-w-sm">
          {/* Keyboard Layout Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 shrink-0">
            <button
              id="wordRushWheelToggle"
              type="button"
              onClick={() => {
                setKeyboardLayout('compact12');
                storageService.setKeyboardLayout('compact12');
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                keyboardLayout === 'compact12'
                  ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tile Wheel View"
            >
              <Grid3X3 className="w-3 h-3" />
              <span>Tiles</span>
            </button>
            <button
              id="wordRushQwertyToggle"
              type="button"
              onClick={() => {
                setKeyboardLayout('qwerty');
                storageService.setKeyboardLayout('qwerty');
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                keyboardLayout === 'qwerty'
                  ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full QWERTY Keyboard"
            >
              <Keyboard className="w-3 h-3" />
              <span>QWERTY</span>
            </button>
          </div>

          {/* Difficulty selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 shrink-0">
            {(['easy', 'medium', 'hard'] as WordDifficulty[]).map((diffKey) => {
              const isSelected = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => {
                    setDifficulty(diffKey);
                    if (isPlaying) {
                      startGame(diffKey);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all uppercase cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diffKey === 'medium' ? 'Med' : diffKey}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={handleShuffle}
              className="py-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Shuffle</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="py-1 px-2.5 bg-transparent border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <Delete className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* ON-SCREEN QWERTY KEYBOARD (When QWERTY Mode Selected) */}
        {keyboardLayout === 'qwerty' && (
          <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800/80 rounded-2xl p-1.5 shadow-md flex flex-col gap-1 select-none animate-pop">
            {/* Row 1: Q W E R T Y U I O P */}
            <div className="flex justify-center gap-1 w-full">
              {QWERTY_ROWS[0].map((letter) => {
                const isPuzzleLetter = tiles.some(t => t.letter === letter);
                const isAvailable = tiles.some(t => t.letter === letter && !t.isUsed);
                return (
                  <button
                    key={`wr-q-${letter}`}
                    type="button"
                    onClick={() => {
                      const match = tiles.find(t => t.letter === letter && !t.isUsed);
                      if (match) handleTileClick(match.id);
                    }}
                    disabled={!isPlaying || !isAvailable}
                    className={`flex-1 max-w-[34px] h-8 rounded-lg font-bold text-xs flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                      isAvailable
                        ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-sm hover:bg-cyan-900'
                        : isPuzzleLetter
                        ? 'bg-slate-800/60 border-slate-700 text-slate-500 opacity-40 cursor-not-allowed'
                        : 'bg-slate-950/40 border-slate-800/50 text-slate-600 opacity-25 cursor-not-allowed'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {/* Row 2: A S D F G H J K L */}
            <div className="flex justify-center gap-1 w-full px-2">
              {QWERTY_ROWS[1].map((letter) => {
                const isPuzzleLetter = tiles.some(t => t.letter === letter);
                const isAvailable = tiles.some(t => t.letter === letter && !t.isUsed);
                return (
                  <button
                    key={`wr-q-${letter}`}
                    type="button"
                    onClick={() => {
                      const match = tiles.find(t => t.letter === letter && !t.isUsed);
                      if (match) handleTileClick(match.id);
                    }}
                    disabled={!isPlaying || !isAvailable}
                    className={`flex-1 max-w-[34px] h-8 rounded-lg font-bold text-xs flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                      isAvailable
                        ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-sm hover:bg-cyan-900'
                        : isPuzzleLetter
                        ? 'bg-slate-800/60 border-slate-700 text-slate-500 opacity-40 cursor-not-allowed'
                        : 'bg-slate-950/40 border-slate-800/50 text-slate-600 opacity-25 cursor-not-allowed'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {/* Row 3: Backspace + Z X C V B N M + Clear */}
            <div className="flex justify-center gap-1 w-full">
              <button
                type="button"
                onClick={() => {
                  if (selectedTileIds.length > 0) {
                    handleSlotClick(selectedTileIds.length - 1);
                  }
                }}
                disabled={!isPlaying || selectedTileIds.length === 0}
                className="px-2 h-8 rounded-lg bg-slate-800 hover:bg-amber-950 text-amber-300 font-bold text-[11px] flex items-center justify-center border border-slate-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Undo letter"
              >
                <Delete className="w-3.5 h-3.5" />
              </button>

              {QWERTY_ROWS[2].map((letter) => {
                const isPuzzleLetter = tiles.some(t => t.letter === letter);
                const isAvailable = tiles.some(t => t.letter === letter && !t.isUsed);
                return (
                  <button
                    key={`wr-q-${letter}`}
                    type="button"
                    onClick={() => {
                      const match = tiles.find(t => t.letter === letter && !t.isUsed);
                      if (match) handleTileClick(match.id);
                    }}
                    disabled={!isPlaying || !isAvailable}
                    className={`flex-1 max-w-[34px] h-8 rounded-lg font-bold text-xs flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                      isAvailable
                        ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-sm hover:bg-cyan-900'
                        : isPuzzleLetter
                        ? 'bg-slate-800/60 border-slate-700 text-slate-500 opacity-40 cursor-not-allowed'
                        : 'bg-slate-950/40 border-slate-800/50 text-slate-600 opacity-25 cursor-not-allowed'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleClear}
                disabled={!isPlaying || selectedTileIds.length === 0}
                className="px-2 h-8 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-300 font-bold text-[10px] flex items-center justify-center border border-slate-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Clear all"
              >
                CLR
              </button>
            </div>
          </div>
        )}

        {/* Physical Keyboard Hints */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[9px] sm:text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          <span>[ A-Z ] Type</span>
          <span>[ Backspace ] Undo</span>
          <span>[ Space ] Clear</span>
        </div>
      </footer>

      {/* UNIFIED START MODAL OVERLAY */}
      <StartModal
        isOpen={!isPlaying && !isGameOver && !hasStartedBefore}
        gameMode="word"
        highScore={highScores.wordRush}
        bestStreak={highScores.wordRushStreak}
        onStart={() => startGame()}
        onSelectGame={onSelectGame}
      >
        {/* Speed Level Difficulty Selector */}
        <div className="mb-3.5 text-left">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Speed Difficulty</span>
            </label>
            <span className="text-[9px] font-semibold text-slate-400">
              {config.initialTime}s base (+{config.bonusTime}s / word)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['easy', 'medium', 'hard'] as WordDifficulty[]).map((diffKey) => {
              const cfg = DIFFICULTY_CONFIGS[diffKey];
              const isSelected = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => setDifficulty(diffKey)}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-cyan-500 bg-cyan-950/80 text-cyan-200 shadow-md shadow-cyan-500/20'
                      : 'border border-slate-800 bg-slate-950/60 hover:border-cyan-500/40 text-slate-400'
                  }`}
                >
                  <span className={`block font-black text-xs ${diffKey === 'easy' ? 'text-emerald-400' : diffKey === 'medium' ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{cfg.initialTime}s</span>
                </button>
              );
            })}
          </div>
        </div>
      </StartModal>

      {/* UNIFIED GAME OVER MODAL OVERLAY */}
      <GameOverModal
        isOpen={isGameOver}
        gameMode="word"
        score={score}
        streak={streak}
        highScore={highScores.wordRush}
        bestStreak={highScores.wordRushStreak}
        onPlayAgain={() => startGame()}
        onSelectGame={onSelectGame}
        reviewDetail={{
          label: 'Valid Anagram Solution',
          value: missedSolutions.join(' · '),
        }}
      >
        {/* Speed Level Difficulty Selector */}
        <div className="mb-3 text-left">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Speed Difficulty</span>
            </label>
            <span className="text-[9px] font-semibold text-slate-400">
              {config.initialTime}s base (+{config.bonusTime}s / word)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['easy', 'medium', 'hard'] as WordDifficulty[]).map((diffKey) => {
              const cfg = DIFFICULTY_CONFIGS[diffKey];
              const isSelected = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => setDifficulty(diffKey)}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-cyan-500 bg-cyan-950/80 text-cyan-200 shadow-md shadow-cyan-500/20'
                      : 'border border-slate-800 bg-slate-950/60 hover:border-cyan-500/40 text-slate-400'
                  }`}
                >
                  <span className={`block font-black text-xs ${diffKey === 'easy' ? 'text-emerald-400' : diffKey === 'medium' ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{cfg.initialTime}s</span>
                </button>
              );
            })}
          </div>
        </div>
      </GameOverModal>
    </div>
  );
};
