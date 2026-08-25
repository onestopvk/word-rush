import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameHighScores, FallSpeedDifficulty, FallDifficultyConfig, FallingWordChallenge, GameMode, KeyboardLayoutMode } from '../types';
import { dictionaryService } from '../services/dictionary.service';
import { soundService } from '../services/sound.service';
import { storageService } from '../services/storage.service';
import { RefreshCw, Play, Trophy, Flame, Shield, ShieldAlert, Zap, Delete, AlertTriangle, Sparkles, Keyboard, Grid3X3 } from 'lucide-react';
import { GameOverModal } from './GameOverModal';
import { StartModal } from './StartModal';

const FALL_DIFFICULTY_CONFIGS: Record<FallSpeedDifficulty, FallDifficultyConfig> = {
  gentle: {
    name: 'gentle',
    label: 'Gentle',
    baseFallDuration: 7.5, // 7.5s to reach floor
    pointsPerSolve: 100,
  },
  normal: {
    name: 'normal',
    label: 'Normal',
    baseFallDuration: 5.2, // 5.2s to reach floor
    pointsPerSolve: 150,
  },
  turbo: {
    name: 'turbo',
    label: 'Turbo',
    baseFallDuration: 3.6, // 3.6s to reach floor
    pointsPerSolve: 250,
  },
};

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const DEFAULT_12_LETTERS = ['A', 'D', 'E', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'Y'];

interface LetterFallGameProps {
  onSelectGame: (game: GameMode) => void;
  onUpdateHighScores: () => void;
  highScores: GameHighScores;
}

export const LetterFallGame: React.FC<LetterFallGameProps> = ({
  onSelectGame,
  onUpdateHighScores,
  highScores,
}) => {
  // Game Configuration State
  const [difficulty, setDifficulty] = useState<FallSpeedDifficulty>(() => storageService.getLetterFallDifficulty());
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayoutMode>(() => storageService.getKeyboardLayout());
  const [hasStartedBefore, setHasStartedBefore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Score & Round Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [wordsCleared, setWordsCleared] = useState(0);

  // Current Challenge & User Input
  const [challenge, setChallenge] = useState<FallingWordChallenge | null>(null);
  const [keypadLetters, setKeypadLetters] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<(string | null)[]>([null, null, null, null]);
  const [missedSolutions, setMissedSolutions] = useState<string[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [scoreFloatingNotice, setScoreFloatingNotice] = useState<string | null>(null);

  // Fall Position Physics (0% at top, 100% at danger baseline)
  const [fallProgress, setFallProgress] = useState(0); // 0 to 100
  const fallProgressRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const config = FALL_DIFFICULTY_CONFIGS[difficulty];

  // Helper to spawn a new challenge
  const spawnNextChallenge = useCallback(() => {
    const newChallenge = dictionaryService.generateLetterFallChallenge(difficulty);
    setChallenge(newChallenge);

    // Generate 12 focused letters for this challenge
    const neededLetters = new Set<string>();
    // 1. Always include missing letters for the target word
    for (let i = 0; i < 4; i++) {
      if (newChallenge.fixedLetters[i] === null) {
        neededLetters.add(newChallenge.targetWord[i].toUpperCase());
      }
    }
    // 2. Prioritize missing letters from all other valid alternate words matching the pattern
    const letterFreq: Record<string, number> = {};
    for (const word of newChallenge.allValidAnswers) {
      for (let i = 0; i < 4; i++) {
        if (newChallenge.fixedLetters[i] === null) {
          const char = word[i].toUpperCase();
          letterFreq[char] = (letterFreq[char] || 0) + 1;
        }
      }
    }
    // Sort letters by how many alternate answers they unlock
    const sortedAlternateLetters = Object.keys(letterFreq).sort((a, b) => letterFreq[b] - letterFreq[a]);
    for (const char of sortedAlternateLetters) {
      if (neededLetters.size >= 12) break;
      neededLetters.add(char);
    }

    // 3. Fill remaining slots up to 12 with common high-frequency letters
    const alphabet = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'.split('');
    const shuffledAlphabet = [...alphabet].sort(() => Math.random() - 0.5);
    for (const char of shuffledAlphabet) {
      if (neededLetters.size >= 12) break;
      neededLetters.add(char);
    }
    // Sort the 12 keys in QWERTY order for instant visual recognition
    const qwertyOrder = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    const sorted12 = Array.from(neededLetters).sort((a, b) => {
      return qwertyOrder.indexOf(a) - qwertyOrder.indexOf(b);
    });
    setKeypadLetters(sorted12);

    // Initialize user inputs matching the fixed clues
    const initialInputs: (string | null)[] = [null, null, null, null];
    for (let i = 0; i < 4; i++) {
      if (newChallenge.fixedLetters[i] !== null) {
        initialInputs[i] = newChallenge.fixedLetters[i];
      }
    }
    setUserInputs(initialInputs);

    // Reset physics progress
    setFallProgress(0);
    fallProgressRef.current = 0;
    lastTimeRef.current = null;
  }, [difficulty]);

  // Start / Restart Game
  const startGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(3);
    setWordsCleared(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setHasStartedBefore(true);
    setMissedSolutions([]);
    setScoreFloatingNotice(null);

    spawnNextChallenge();
    soundService.playTileSelect(0);
  }, [spawnNextChallenge]);

  // Find next empty user input slot
  const getNextEmptySlotIndex = useCallback(() => {
    if (!challenge) return -1;
    for (let i = 0; i < 4; i++) {
      if (challenge.fixedLetters[i] === null && userInputs[i] === null) {
        return i;
      }
    }
    return -1;
  }, [challenge, userInputs]);

  // Handle Letter Input (from virtual keypad or physical keyboard)
  const handleLetterInput = useCallback((letter: string) => {
    if (!isPlaying || isGameOver || !challenge) return;

    const slotIndex = getNextEmptySlotIndex();
    if (slotIndex === -1) return; // All slots filled

    soundService.playTileSelect(slotIndex);

    const nextInputs = [...userInputs];
    nextInputs[slotIndex] = letter.toUpperCase();
    setUserInputs(nextInputs);

    // Check if word is now fully filled (all 4 slots non-null)
    const isComplete = nextInputs.every(val => val !== null);
    if (isComplete) {
      const fullWord = nextInputs.join('').toUpperCase();
      // Accepts ANY valid 4-letter English word matching fixed clues
      const isValid = dictionaryService.isValidWord(fullWord);

      if (isValid) {
        // Success!
        const isAlternate = fullWord !== challenge.targetWord.toUpperCase();
        const heightBonusMultiplier = Math.max(1, (100 - fallProgressRef.current) / 30);
        const pointsAwarded = Math.round(config.pointsPerSolve * (1 + streak * 0.2) * heightBonusMultiplier);

        const nextScore = score + pointsAwarded;
        const nextStreak = streak + 1;
        const nextMaxStreak = Math.max(maxStreak, nextStreak);

        setScore(nextScore);
        setStreak(nextStreak);
        setMaxStreak(nextMaxStreak);
        setWordsCleared(prev => prev + 1);

        if (isAlternate) {
          soundService.playCorrect();
          setScoreFloatingNotice(`✨ ${fullWord}! +${pointsAwarded}`);
        } else if (nextStreak > 1 && nextStreak % 3 === 0) {
          soundService.playCombo();
          setScoreFloatingNotice(`COMBO x${nextStreak}! +${pointsAwarded}`);
        } else {
          soundService.playCorrect();
          setScoreFloatingNotice(`+${pointsAwarded} pts`);
        }

        setTimeout(() => setScoreFloatingNotice(null), 900);

        // Spawn next falling word
        spawnNextChallenge();
      } else {
        // Invalid word - shake and clear user inputs
        soundService.playWrong();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 450);

        // Reset non-fixed slots so user can retry immediately
        const resetInputs: (string | null)[] = [null, null, null, null];
        for (let i = 0; i < 4; i++) {
          if (challenge.fixedLetters[i] !== null) {
            resetInputs[i] = challenge.fixedLetters[i];
          }
        }
        setUserInputs(resetInputs);
      }
    }
  }, [isPlaying, isGameOver, challenge, getNextEmptySlotIndex, userInputs, config.pointsPerSolve, streak, score, maxStreak, spawnNextChallenge]);

  // Backspace / Undo last user-entered slot
  const handleBackspace = useCallback(() => {
    if (!isPlaying || isGameOver || !challenge) return;

    // Find the last filled non-fixed slot
    for (let i = 3; i >= 0; i--) {
      if (challenge.fixedLetters[i] === null && userInputs[i] !== null) {
        soundService.playUntap();
        const nextInputs = [...userInputs];
        nextInputs[i] = null;
        setUserInputs(nextInputs);
        return;
      }
    }
  }, [isPlaying, isGameOver, challenge, userInputs]);

  // Clear all non-fixed inputs
  const handleClear = useCallback(() => {
    if (!isPlaying || isGameOver || !challenge) return;
    soundService.playUntap();
    const resetInputs: (string | null)[] = [null, null, null, null];
    for (let i = 0; i < 4; i++) {
      if (challenge.fixedLetters[i] !== null) {
        resetInputs[i] = challenge.fixedLetters[i];
      }
    }
    setUserInputs(resetInputs);
  }, [isPlaying, isGameOver, challenge]);

  // Physical Keyboard Listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (e.key >= 'a' && e.key <= 'z') {
        e.preventDefault();
        handleLetterInput(e.key.toUpperCase());
      } else if (e.key >= 'A' && e.key <= 'Z') {
        e.preventDefault();
        handleLetterInput(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, isGameOver, startGame, handleLetterInput, handleBackspace, handleClear]);

  // Handle floor impact (life loss or game over)
  const handleFloorCrash = useCallback(() => {
    soundService.playWrong();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const nextLives = lives - 1;
    setLives(nextLives);
    setStreak(0); // Break combo

    if (nextLives <= 0) {
      // Game Over
      setIsPlaying(false);
      setIsGameOver(true);
      soundService.playGameOver();

      if (challenge) {
        setMissedSolutions(challenge.allValidAnswers.slice(0, 5));
      }

      storageService.saveLetterFallScore(score, maxStreak);
      onUpdateHighScores();
    } else {
      // Still have shields, spawn next block
      spawnNextChallenge();
    }
  }, [lives, challenge, score, maxStreak, onUpdateHighScores, spawnNextChallenge]);

  // Physics animation loop for smooth falling block
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    // Dynamic speed based on score and base duration
    const speedScale = 1 + Math.min(1.2, wordsCleared * 0.04);
    const fallDurationMs = (config.baseFallDuration / speedScale) * 1000;

    const loop = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }

      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const progressStep = (delta / fallDurationMs) * 100;
      const nextProgress = fallProgressRef.current + progressStep;

      if (nextProgress >= 100) {
        // Reached floor!
        fallProgressRef.current = 100;
        setFallProgress(100);
        handleFloorCrash();
        return;
      }

      fallProgressRef.current = nextProgress;
      setFallProgress(nextProgress);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isGameOver, wordsCleared, config.baseFallDuration, handleFloorCrash]);

  // Danger zone warning check
  const isDangerZone = fallProgress >= 72;
  const isCriticalZone = fallProgress >= 88;

  return (
    <div
      id="letterFallGameContainer"
      className="w-full flex-1 flex flex-col items-center justify-between min-h-0 select-none py-1"
    >
      {/* 1. TOP HUD (Score, Lives/Shields, Streak Multiplier) */}
      <div className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl mb-1.5 shadow-sm">
        {/* Score & Points Gain */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Score</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-white font-mono leading-none mt-0.5">
                {score}
              </span>
              {scoreFloatingNotice && (
                <span className="text-[11px] font-black text-emerald-300 font-mono bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 rounded-full shadow-sm animate-pulse whitespace-nowrap">
                  {scoreFloatingNotice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lives / Energy Shields */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((shieldNum) => {
            const hasShield = lives >= shieldNum;
            return (
              <div
                key={shieldNum}
                className={`p-1 rounded-lg border transition-all ${
                  hasShield
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-700 opacity-40'
                }`}
                title={hasShield ? 'Shield Active' : 'Shield Broken'}
              >
                {hasShield ? <Shield className="w-3.5 h-3.5 fill-emerald-500/20" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              </div>
            );
          })}
        </div>

        {/* Streak Combo */}
        <div className="flex items-center gap-1.5">
          <Flame className={`w-4 h-4 ${streak > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Combo</span>
            <span className="text-base sm:text-lg font-black text-amber-300 font-mono leading-none mt-0.5">
              x{streak}
            </span>
          </div>
        </div>
      </div>

      {/* 2. THE DROP ARENA (Track where word block descends towards floor) */}
      <div
        id="letterFallDropArena"
        className="w-full flex-1 max-h-[220px] sm:max-h-[260px] md:max-h-[290px] bg-slate-950/90 border border-slate-800/90 rounded-2xl p-2 relative overflow-hidden flex flex-col justify-between shadow-inner"
      >
        {/* Subtle grid background stripes */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(16,185,129,0.03)_100%)] pointer-events-none" />

        {/* Top Spawn Indicator */}
        <div className="w-full flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 pt-0.5 pointer-events-none">
          <span className="flex items-center gap-1 text-cyan-400 font-extrabold">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            {challenge?.allValidAnswers && challenge.allValidAnswers.length > 1
              ? `${challenge.allValidAnswers.length} Valid Words Accepted`
              : 'Drop Zone'}
          </span>
          <span className="text-slate-400">{wordsCleared} Cleared</span>
        </div>

        {/* Dynamic Descending Word Block Container */}
        {challenge && isPlaying && !isGameOver && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-full max-w-[280px] sm:max-w-[320px] transition-transform duration-75 ease-linear ${
              isShaking ? 'animate-shake' : ''
            }`}
            style={{
              top: `${Math.min(80, Math.max(4, fallProgress * 0.78))}%`,
            }}
          >
            {/* The 4 Falling Letter Tiles */}
            <div
              className={`p-2 rounded-2xl border backdrop-blur-md flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xl transition-colors ${
                isCriticalZone
                  ? 'bg-rose-950/90 border-rose-500 shadow-rose-900/50'
                  : isDangerZone
                  ? 'bg-amber-950/90 border-amber-500 shadow-amber-900/40'
                  : 'bg-slate-900/95 border-emerald-500/60 shadow-emerald-950/60'
              }`}
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFixed = challenge.fixedLetters[idx] !== null;
                const value = userInputs[idx];
                const isNextEmpty = getNextEmptySlotIndex() === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      // Tap a user-filled slot to undo/clear that letter
                      if (!isFixed && value !== null) {
                        soundService.playUntap();
                        const nextInputs = [...userInputs];
                        nextInputs[idx] = null;
                        setUserInputs(nextInputs);
                      }
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all ${
                      isFixed
                        ? 'bg-emerald-600 text-white border-b-3 border-emerald-800 shadow-md cursor-default'
                        : value !== null
                        ? 'bg-slate-800 text-cyan-300 border-2 border-cyan-400 shadow-inner cursor-pointer hover:bg-slate-750 active:scale-95'
                        : isNextEmpty
                        ? 'bg-slate-950 border-2 border-dashed border-emerald-400 text-slate-500 animate-pulse'
                        : 'bg-slate-950 border border-slate-800 text-slate-700'
                    }`}
                    title={isFixed ? 'Clue letter' : value ? 'Click to erase letter' : 'Type letter here'}
                  >
                    {value || (isNextEmpty ? '•' : '')}
                  </button>
                );
              })}
            </div>

            {/* Warning indicator label attached to falling block */}
            {isDangerZone && (
              <div className="text-center mt-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5" /> Danger Zone
                </span>
              </div>
            )}
          </div>
        )}

        {/* Floor Danger Baseline (Laser Line) */}
        <div className="w-full pt-1">
          <div
            className={`w-full h-1.5 rounded-full transition-colors ${
              isCriticalZone
                ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse'
                : isDangerZone
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : 'bg-emerald-500/60 shadow-[0_0_6px_rgba(16,185,129,0.3)]'
            }`}
          />
          <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 px-1">
            <span>Laser Baseline</span>
            <span>Floor Impact = -1 Shield</span>
          </div>
        </div>
      </div>

      {/* 3. SWITCHABLE INPUT CONTROLS (FULL QWERTY OR 12-KEY ARCADE) */}
      <div className="w-full mt-1.5 space-y-1 max-w-[390px] sm:max-w-[440px]">
        {/* Layout Switcher Header Bar */}
        <div className="w-full flex items-center justify-between px-1 pb-0.5 text-[11px]">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
            {keyboardLayout === 'qwerty' ? (
              <>
                <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-bold">QWERTY Keyboard</span>
              </>
            ) : (
              <>
                <Grid3X3 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">12-Key Arcade</span>
              </>
            )}
          </span>

          {/* Switcher toggle buttons */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
            <button
              id="layout-toggle-qwerty"
              type="button"
              onClick={() => {
                storageService.setKeyboardLayout('qwerty');
                setKeyboardLayout('qwerty');
              }}
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                keyboardLayout === 'qwerty'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to full QWERTY keyboard"
            >
              <Keyboard className="w-3 h-3" />
              <span>QWERTY</span>
            </button>
            <button
              id="layout-toggle-compact"
              type="button"
              onClick={() => {
                storageService.setKeyboardLayout('compact12');
                setKeyboardLayout('compact12');
              }}
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                keyboardLayout === 'compact12'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to 12-key arcade tiles"
            >
              <Grid3X3 className="w-3 h-3" />
              <span>12-Key</span>
            </button>
          </div>
        </div>

        {/* KEYBOARD VIEW 1: FULL 3-ROW QWERTY */}
        {keyboardLayout === 'qwerty' ? (
          <div className="w-full flex flex-col gap-1 select-none">
            {/* Row 1: Q W E R T Y U I O P */}
            <div className="flex justify-center gap-1 w-full">
              {QWERTY_ROWS[0].map((letter) => (
                <button
                  key={`qwerty-${letter}`}
                  type="button"
                  id={`letter-fall-key-${letter}`}
                  onClick={() => handleLetterInput(letter)}
                  disabled={!isPlaying || isGameOver}
                  className="flex-1 max-w-[38px] h-9 sm:h-10 bg-slate-900 hover:bg-slate-800 active:bg-cyan-600 border border-slate-700/80 active:border-cyan-400 text-slate-100 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* Row 2: A S D F G H J K L */}
            <div className="flex justify-center gap-1 w-full px-2 sm:px-3">
              {QWERTY_ROWS[1].map((letter) => (
                <button
                  key={`qwerty-${letter}`}
                  type="button"
                  id={`letter-fall-key-${letter}`}
                  onClick={() => handleLetterInput(letter)}
                  disabled={!isPlaying || isGameOver}
                  className="flex-1 max-w-[40px] h-9 sm:h-10 bg-slate-900 hover:bg-slate-800 active:bg-cyan-600 border border-slate-700/80 active:border-cyan-400 text-slate-100 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* Row 3: Backspace + Z X C V B N M + Clear */}
            <div className="flex justify-center gap-1 w-full">
              <button
                type="button"
                id="letter-fall-btn-backspace-q"
                onClick={handleBackspace}
                disabled={!isPlaying || isGameOver}
                className="px-2.5 h-9 sm:h-10 bg-slate-900 hover:bg-amber-950/60 active:bg-amber-700 border border-slate-700/80 active:border-amber-400 text-amber-300 font-bold text-[11px] rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Backspace (Undo letter)"
              >
                <Delete className="w-3.5 h-3.5" />
              </button>

              {QWERTY_ROWS[2].map((letter) => (
                <button
                  key={`qwerty-${letter}`}
                  type="button"
                  id={`letter-fall-key-${letter}`}
                  onClick={() => handleLetterInput(letter)}
                  disabled={!isPlaying || isGameOver}
                  className="flex-1 max-w-[38px] h-9 sm:h-10 bg-slate-900 hover:bg-slate-800 active:bg-cyan-600 border border-slate-700/80 active:border-cyan-400 text-slate-100 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {letter}
                </button>
              ))}

              <button
                type="button"
                id="letter-fall-btn-clear-q"
                onClick={handleClear}
                disabled={!isPlaying || isGameOver}
                className="px-2.5 h-9 sm:h-10 bg-slate-900 hover:bg-rose-950/60 active:bg-rose-700 border border-slate-700/80 active:border-rose-400 text-rose-300 font-bold text-[11px] rounded-lg shadow-xs transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Clear input"
              >
                CLR
              </button>
            </div>
          </div>
        ) : (
          /* KEYBOARD VIEW 2: COMPACT 12-LETTER KEYPAD */
          <div className="space-y-1.5">
            {(() => {
              const activeLetters = keypadLetters.length === 12 ? keypadLetters : DEFAULT_12_LETTERS;
              const row1 = activeLetters.slice(0, 6);
              const row2 = activeLetters.slice(6, 12);

              return (
                <>
                  {/* Row 1 (6 Letters) */}
                  <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                    {row1.map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        id={`letter-fall-key-compact-${letter}`}
                        onClick={() => handleLetterInput(letter)}
                        disabled={!isPlaying || isGameOver}
                        className="h-10 sm:h-12 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700/80 hover:border-emerald-500/50 text-white font-black text-sm sm:text-base flex items-center justify-center transition-all cursor-pointer shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>

                  {/* Row 2 (6 Letters) */}
                  <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                    {row2.map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        id={`letter-fall-key-compact-${letter}`}
                        onClick={() => handleLetterInput(letter)}
                        disabled={!isPlaying || isGameOver}
                        className="h-10 sm:h-12 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700/80 hover:border-emerald-500/50 text-white font-black text-sm sm:text-base flex items-center justify-center transition-all cursor-pointer shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>

                  {/* Action Controls Row */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      id="letter-fall-btn-clear-c"
                      onClick={handleClear}
                      disabled={!isPlaying || isGameOver}
                      className="py-1.5 sm:py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-amber-500/40 text-amber-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider"
                      title="Clear inputs (Space / Esc)"
                    >
                      <span>Clear All</span>
                    </button>

                    <button
                      type="button"
                      id="letter-fall-btn-backspace-c"
                      onClick={handleBackspace}
                      disabled={!isPlaying || isGameOver}
                      className="py-1.5 sm:py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 active:scale-95 border border-slate-800 hover:border-rose-500/40 text-rose-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider"
                      title="Backspace (Undo letter)"
                      aria-label="Backspace"
                    >
                      <Delete className="w-3.5 h-3.5" />
                      <span>Undo</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* 4. FOOTER CONTROLS */}
      <footer className="w-full flex items-center justify-between text-[10px] text-slate-500 font-medium px-1 pt-1.5 mt-1 border-t border-slate-800/80">
        <span className="hidden sm:inline">Type missing letter or click key before word lands</span>
        <span className="text-emerald-400 font-semibold">Speed bonus for high catches · 3 Shields</span>
      </footer>

      {/* UNIFIED START MODAL OVERLAY */}
      <StartModal
        isOpen={!isPlaying && !isGameOver && !hasStartedBefore}
        gameMode="letterfall"
        highScore={highScores.letterFall}
        bestStreak={highScores.letterFallStreak}
        onStart={startGame}
        onSelectGame={onSelectGame}
      >
        {/* Fall Speed Difficulty Selector */}
        <div className="mb-3.5 text-left">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Fall Speed Pace</span>
            </label>
            <span className="text-[9px] font-semibold text-slate-400">
              {config.baseFallDuration}s drop time ({config.pointsPerSolve} pts/word)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['gentle', 'normal', 'turbo'] as FallSpeedDifficulty[]).map((diffKey) => {
              const cfg = FALL_DIFFICULTY_CONFIGS[diffKey];
              const isSelected = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => setDifficulty(diffKey)}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-emerald-500 bg-emerald-950/80 text-emerald-200 shadow-md shadow-emerald-500/20'
                      : 'border border-slate-800 bg-slate-950/60 hover:border-emerald-500/40 text-slate-400'
                  }`}
                >
                  <span className={`block font-black text-xs ${diffKey === 'gentle' ? 'text-emerald-400' : diffKey === 'normal' ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{cfg.baseFallDuration}s</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Keyboard Layout Preference Selector */}
        <div className="mb-3.5 text-left">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Keyboard Layout</span>
            </label>
            <span className="text-[9px] font-semibold text-slate-400">
              Can toggle anytime during play
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="start-keyboard-qwerty"
              onClick={() => {
                storageService.setKeyboardLayout('qwerty');
                setKeyboardLayout('qwerty');
              }}
              className={`py-2 px-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                keyboardLayout === 'qwerty'
                  ? 'bg-cyan-950/80 border-2 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:border-cyan-500/40'
              }`}
            >
              <Keyboard className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-bold text-xs">QWERTY Keyboard</div>
                <div className="text-[9px] text-slate-400">Full 3-row layout</div>
              </div>
            </button>

            <button
              type="button"
              id="start-keyboard-compact"
              onClick={() => {
                storageService.setKeyboardLayout('compact12');
                setKeyboardLayout('compact12');
              }}
              className={`py-2 px-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                keyboardLayout === 'compact12'
                  ? 'bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:border-emerald-500/40'
              }`}
            >
              <Grid3X3 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-xs">12-Key Arcade</div>
                <div className="text-[9px] text-slate-400">Large curated tiles</div>
              </div>
            </button>
          </div>
        </div>
      </StartModal>

      {/* UNIFIED GAME OVER MODAL OVERLAY */}
      <GameOverModal
        isOpen={isGameOver}
        gameMode="letterfall"
        score={score}
        streak={streak}
        highScore={highScores.letterFall}
        bestStreak={highScores.letterFallStreak}
        onPlayAgain={startGame}
        onSelectGame={onSelectGame}
        reviewDetail={
          missedSolutions.length > 0
            ? {
                label: 'Possible Matching Words',
                value: missedSolutions.join(' · '),
              }
            : undefined
        }
      >
        {/* Difficulty Selector in Game Over Modal */}
        <div className="mb-3 text-left">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Fall Speed Pace</span>
            </label>
            <span className="text-[9px] font-semibold text-slate-400">
              {config.baseFallDuration}s drop time
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['gentle', 'normal', 'turbo'] as FallSpeedDifficulty[]).map((diffKey) => {
              const cfg = FALL_DIFFICULTY_CONFIGS[diffKey];
              const isSelected = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => setDifficulty(diffKey)}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-emerald-500 bg-emerald-950/80 text-emerald-200 shadow-md shadow-emerald-500/20'
                      : 'border border-slate-800 bg-slate-950/60 hover:border-emerald-500/40 text-slate-400'
                  }`}
                >
                  <span className={`block font-black text-xs ${diffKey === 'gentle' ? 'text-emerald-400' : diffKey === 'normal' ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{cfg.baseFallDuration}s</span>
                </button>
              );
            })}
          </div>
        </div>
      </GameOverModal>
    </div>
  );
};
