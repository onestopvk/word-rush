import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShifterChallenge, ShifterDifficulty, KeyboardLayoutMode, GameHighScores, GameMode } from '../types';
import { dictionaryService } from '../services/dictionary.service';
import { soundService } from '../services/sound.service';
import { storageService } from '../services/storage.service';
import { StartModal } from './StartModal';
import { GameOverModal } from './GameOverModal';
import {
  Trophy,
  Flame,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Undo2,
  ChevronRight,
  Target,
  Flag,
  HelpCircle,
  Play,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  CornerDownLeft,
  Delete
} from 'lucide-react';

interface WordShifterGameProps {
  onGameOver: (score: number, streak: number) => void;
  onSelectGame?: (game: GameMode) => void;
  onOpenHub: () => void;
  onOpenInfo: () => void;
  highScores: GameHighScores;
}

const DIFFICULTY_CONFIGS: Record<
  ShifterDifficulty,
  { label: string; initialTime: number; stepBonus: number; ladderBonus: number; desc: string; badge: string }
> = {
  casual: {
    label: 'Casual',
    initialTime: 90,
    stepBonus: 4,
    ladderBonus: 12,
    desc: '2 to 3 step stacks • Relaxed timer • Great for warming up',
    badge: '2-3 Steps',
  },
  normal: {
    label: 'Standard',
    initialTime: 65,
    stepBonus: 3,
    ladderBonus: 10,
    desc: '3 to 4 step stacks • Dynamic pace • Classic word puzzle',
    badge: '3-4 Steps',
  },
  master: {
    label: 'Master',
    initialTime: 50,
    stepBonus: 2,
    ladderBonus: 15,
    desc: '4 to 6 step stacks • Rapid blitz • Deep vocabulary test',
    badge: '4-6 Steps',
  },
};

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const COMPACT_12_KEYS = [
  { label: 'ABC', letters: ['A', 'B', 'C'] },
  { label: 'DEF', letters: ['D', 'E', 'F'] },
  { label: 'GHI', letters: ['G', 'H', 'I'] },
  { label: 'JKL', letters: ['J', 'K', 'L'] },
  { label: 'MNO', letters: ['M', 'N', 'O'] },
  { label: 'PQRS', letters: ['P', 'Q', 'R', 'S'] },
  { label: 'TUV', letters: ['T', 'U', 'V'] },
  { label: 'WXYZ', letters: ['W', 'X', 'Y', 'Z'] },
];

export const WordShifterGame: React.FC<WordShifterGameProps> = ({
  onGameOver,
  onSelectGame,
  onOpenHub,
  onOpenInfo,
  highScores,
}) => {
  // Game Lifecycle States
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [difficulty, setDifficulty] = useState<ShifterDifficulty>(() => storageService.getShifterDifficulty());
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayoutMode>(() => storageService.getKeyboardLayout());

  // Challenge & Stack History State
  const [challenge, setChallenge] = useState<ShifterChallenge>(() =>
    dictionaryService.generateShifterChallenge(storageService.getShifterDifficulty())
  );
  const [puzzleNumber, setPuzzleNumber] = useState<number>(1);
  const [wordStack, setWordStack] = useState<string[]>(() => {
    const initCh = dictionaryService.generateShifterChallenge(storageService.getShifterDifficulty());
    return [initCh.startWord];
  }); // Stacking words sequence starting with startWord

  // Current Whole Word Input State
  const [inputWord, setInputWord] = useState<string>(''); // Whole 4-letter word entered by user
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Performance & Scoring
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreakThisSession, setBestStreakThisSession] = useState<number>(0);
  const [stacksCompleted, setStacksCompleted] = useState<number>(0);

  // Timer & Feedbacks
  const [timeLeft, setTimeLeft] = useState<number>(DIFFICULTY_CONFIGS.normal.initialTime);
  const [maxTime, setMaxTime] = useState<number>(DIFFICULTY_CONFIGS.normal.initialTime);
  const [timeBonusNotification, setTimeBonusNotification] = useState<string | null>(null);
  const [scoreNotification, setScoreNotification] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Helper Modals / Panels
  const [showValidMovesModal, setShowValidMovesModal] = useState<boolean>(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [celebrationData, setCelebrationData] = useState<{
    solvedWord: string;
    stepsTaken: number;
    minSteps: number;
    isOptimal: boolean;
    pointsEarned: number;
    bonusTime: number;
  } | null>(null);

  const stackBottomRef = useRef<HTMLDivElement>(null);

  // Update persisted preferences
  const handleDifficultyChange = (diff: ShifterDifficulty) => {
    setDifficulty(diff);
    storageService.setShifterDifficulty(diff);
  };

  const handleKeyboardToggle = () => {
    const next: KeyboardLayoutMode = keyboardLayout === 'qwerty' ? 'compact12' : 'qwerty';
    setKeyboardLayout(next);
    storageService.setKeyboardLayout(next);
  };

  // Top/Latest word in the stack
  const getTopStackedWord = (): string => {
    if (wordStack.length === 0 && challenge) return challenge.startWord;
    return wordStack[wordStack.length - 1];
  };

  const topWord = getTopStackedWord();

  // Start new game run
  const startNewGame = useCallback(() => {
    const cfg = DIFFICULTY_CONFIGS[difficulty];
    const newChallenge = dictionaryService.generateShifterChallenge(difficulty);
    setChallenge(newChallenge);
    setPuzzleNumber(1);
    setWordStack([newChallenge.startWord]);
    setInputWord('');
    setScore(0);
    setStreak(0);
    setBestStreakThisSession(0);
    setStacksCompleted(0);
    setTimeLeft(cfg.initialTime);
    setMaxTime(cfg.initialTime);
    setCelebrationData(null);
    setHintMessage(null);
    setValidationMessage(null);
    setGameState('playing');
    soundService.playGameStart();
  }, [difficulty]);

  // Load next challenge within current run
  const loadNextPuzzle = useCallback(() => {
    const newChallenge = dictionaryService.generateShifterChallenge(difficulty);
    setChallenge(newChallenge);
    setPuzzleNumber((prev) => prev + 1);
    setWordStack([newChallenge.startWord]);
    setInputWord('');
    setCelebrationData(null);
    setHintMessage(null);
    setValidationMessage(null);
  }, [difficulty]);

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    soundService.playGameOver();
    const finalScore = score;
    const finalStreak = Math.max(streak, bestStreakThisSession);
    storageService.saveShifterScore(finalScore, finalStreak);
    onGameOver(finalScore, finalStreak);
  }, [score, streak, bestStreakThisSession, onGameOver]);

  // Countdown timer loop
  useEffect(() => {
    if (gameState !== 'playing' || celebrationData !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, celebrationData]);

  // Handle Game Over transition when time runs out
  useEffect(() => {
    if (gameState === 'playing' && celebrationData === null && timeLeft <= 0) {
      handleGameOver();
    }
  }, [timeLeft, gameState, celebrationData, handleGameOver]);

  // Auto-scroll stack downward as new words are stacked
  useEffect(() => {
    if (stackBottomRef.current) {
      stackBottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [wordStack, inputWord]);

  // Evaluate candidate whole word against top of stack
  const evaluateCandidateWord = (candidate: string) => {
    if (!challenge) return { isValid: false, reason: 'No active challenge' };
    const upper = candidate.toUpperCase().trim();

    if (upper.length < 4) {
      return { isValid: false, reason: `Enter ${4 - upper.length} more letters` };
    }
    if (upper.length > 4) {
      return { isValid: false, reason: 'Must be 4 letters' };
    }
    if (upper === topWord) {
      return { isValid: false, reason: 'Same as top word — change 1 letter' };
    }
    if (!dictionaryService.isOneLetterDiff(topWord, upper)) {
      return { isValid: false, reason: `Must change EXACTLY 1 letter from "${topWord}"` };
    }
    if (!dictionaryService.isValidWord(upper)) {
      return { isValid: false, reason: `"${upper}" is not in dictionary` };
    }
    if (wordStack.includes(upper)) {
      return { isValid: false, reason: `"${upper}" is already in this stack` };
    }
    return { isValid: true, reason: 'Valid Shift — Ready to Stack!' };
  };

  // Submit and stack the whole entered word
  const submitAndStackWord = (overrideWord?: string) => {
    if (!challenge) return;
    const wordToStack = (overrideWord || inputWord).toUpperCase().trim();
    const evaluation = evaluateCandidateWord(wordToStack);

    if (!evaluation.isValid) {
      // Trigger error shake & sound
      setValidationMessage({ text: evaluation.reason, type: 'error' });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      soundService.playWordWrong();
      return;
    }

    // Word is valid! Stack it on top of the tower
    const isTargetReached = wordToStack === challenge.targetWord.toUpperCase();
    const newStack = [...wordStack, wordToStack];
    setWordStack(newStack);
    setInputWord(''); // Clear input for next stacked word!
    setHintMessage(null);
    setValidationMessage(null);

    if (isTargetReached) {
      // Completed the stack puzzle!
      handleStackSuccess(newStack);
    } else {
      // Intermediate valid stacked word
      const stepPts = 60 * (1 + streak * 0.2);
      const stepBonusTime = DIFFICULTY_CONFIGS[difficulty].stepBonus;

      setScore((prev) => Math.round(prev + stepPts));
      setTimeLeft((prev) => Math.min(prev + stepBonusTime, maxTime + 15));
      soundService.playWordSuccess();

      // Show floating feedbacks
      setTimeBonusNotification(`+${stepBonusTime}s`);
      setScoreNotification(`+${Math.round(stepPts)} pts`);
      setTimeout(() => {
        setTimeBonusNotification(null);
        setScoreNotification(null);
      }, 1200);
    }
  };

  // Handle puzzle completion
  const handleStackSuccess = (finalStack: string[]) => {
    if (!challenge) return;

    const stepsTaken = finalStack.length - 1;
    const minSteps = challenge.minSteps;
    const isOptimal = stepsTaken <= minSteps;

    const newStreak = streak + 1;
    setStreak(newStreak);
    if (newStreak > bestStreakThisSession) {
      setBestStreakThisSession(newStreak);
    }
    setStacksCompleted((prev) => prev + 1);

    const basePts = 250;
    const parBonus = isOptimal ? 350 : 120;
    const streakBonus = newStreak * 60;
    const totalPoints = Math.round(basePts + parBonus + streakBonus);

    const bonusSeconds = DIFFICULTY_CONFIGS[difficulty].ladderBonus;

    setScore((prev) => prev + totalPoints);
    setTimeLeft((prev) => Math.min(prev + bonusSeconds, maxTime + 30));

    soundService.playStreakMilestone();

    setCelebrationData({
      solvedWord: challenge.targetWord,
      stepsTaken,
      minSteps,
      isOptimal,
      pointsEarned: totalPoints,
      bonusTime: bonusSeconds,
    });
  };

  // Type a letter into the whole word input with AUTO-STACKING on 4th valid letter
  const handleTypeLetter = (char: string) => {
    if (inputWord.length >= 4) return;
    const nextWord = (inputWord + char).toUpperCase();
    soundService.playTileSelect(nextWord.length - 1);

    if (nextWord.length === 4) {
      const evalRes = evaluateCandidateWord(nextWord);
      if (evalRes.isValid) {
        // Auto-stack instantly on valid 4-letter word!
        submitAndStackWord(nextWord);
        return;
      } else {
        // Keep input, show error feedback & shake
        setInputWord(nextWord);
        setValidationMessage({ text: evalRes.reason, type: 'error' });
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        soundService.playWordWrong();
        return;
      }
    }

    setInputWord(nextWord);
    setValidationMessage(null);
  };

  // Backspace letter or undo stack if empty
  const handleBackspace = () => {
    soundService.playKeyDelete();
    if (inputWord.length > 0) {
      setInputWord((prev) => prev.slice(0, -1));
      setValidationMessage(null);
    }
  };

  // Undo the last stacked word from the tower
  const handleUndoLastStackedWord = () => {
    if (wordStack.length <= 1) return;
    soundService.playUntap();
    const previous = wordStack.slice(0, wordStack.length - 1);
    setWordStack(previous);
    setInputWord('');
    setValidationMessage(null);
    setHintMessage(null);
  };

  // Clone top word into input box for quick 1-letter tweak
  const handleCloneTopWord = () => {
    soundService.playTileSelect(0);
    setInputWord(topWord);
    setValidationMessage({ text: 'Delete & change 1 letter to auto-stack!', type: 'warning' });
  };

  // Reset current puzzle back to initial base word
  const handleResetPuzzle = () => {
    if (!challenge) return;
    soundService.playUntap();
    setWordStack([challenge.startWord]);
    setInputWord('');
    setValidationMessage(null);
    setHintMessage(null);
  };

  // Provide smart clue / hint
  const handleGetHint = () => {
    if (!challenge) return;
    soundService.playTileSelect(0);

    const nextOptimal = dictionaryService.getNextOptimalWord(topWord, challenge.targetWord);

    if (nextOptimal) {
      const diffIdx = dictionaryService.getDiffIndex(topWord, nextOptimal);
      const targetChar = nextOptimal[diffIdx];
      setHintMessage(`Hint: Change slot ${diffIdx + 1} ('${topWord[diffIdx]}') ➔ '${targetChar}' (e.g. "${nextOptimal}")`);
    } else {
      const neighbors = dictionaryService.getOneLetterNeighbors(topWord).filter((w) => !wordStack.includes(w));
      if (neighbors.length > 0) {
        setHintMessage(`Try shifting to: "${neighbors[0]}"`);
      } else {
        setHintMessage('No forward shifts from here. Tap "Undo Last Word"!');
      }
    }
  };

  // Physical Keyboard listener for seamless whole-word typing
  useEffect(() => {
    if (gameState !== 'playing' || celebrationData !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submitAndStackWord();
      } else if (e.key === 'Escape') {
        handleResetPuzzle();
      } else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleTypeLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, celebrationData, inputWord, wordStack, challenge, topWord]);

  // Compute matched letters between top word and target
  const getMatchingTargetLettersCount = (word: string, target: string): number => {
    if (!word || !target || word.length !== 4 || target.length !== 4) return 0;
    let matches = 0;
    for (let i = 0; i < 4; i++) {
      if (word[i].toUpperCase() === target[i].toUpperCase()) matches++;
    }
    return matches;
  };

  const validAvailableMoves = challenge
    ? dictionaryService.getOneLetterNeighbors(topWord).filter((w) => !wordStack.includes(w))
    : [];

  const targetWord = challenge?.targetWord || '';
  const startWord = challenge?.startWord || '';
  const currentEval = evaluateCandidateWord(inputWord);

  // ==========================================
  // VIEW: PLAYING ARENA
  // ==========================================
  return (
    <div className="flex-1 flex flex-col items-center justify-between w-full max-w-xl mx-auto px-2 sm:px-4 py-1.5 gap-2 h-full">
      {/* 1. Header Bar: Level, Par, Timer, Score */}
      <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-2 sm:p-2.5 shadow-md flex items-center justify-between gap-2 shrink-0">
        {/* Puzzle / Challenge Info */}
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase font-mono">
            Puzzle #{puzzleNumber}
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <span>Par: <strong className="text-amber-300">{challenge?.minSteps}</strong></span>
            <span>•</span>
            <span>Depth: <strong className="text-amber-300">{wordStack.length - 1}</strong></span>
          </div>
        </div>

        {/* Timer, Points & Streak */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="relative flex items-center justify-center">
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono font-black text-xs border ${
                timeLeft <= 10
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>

            {/* Time Bonus Popover */}
            {timeBonusNotification && (
              <div className="absolute -top-6 text-[11px] font-black text-emerald-400 animate-fade-up whitespace-nowrap bg-emerald-950/90 px-1.5 py-0.2 rounded border border-emerald-500/40">
                {timeBonusNotification}
              </div>
            )}
          </div>

          {/* Score & Streak */}
          <div className="text-right">
            <div className="text-xs font-black text-white font-mono flex items-center justify-end gap-1">
              <span>{score}</span>
              {scoreNotification && (
                <span className="text-[10px] text-amber-400 animate-fade-up">{scoreNotification}</span>
              )}
            </div>
            {streak > 0 && (
              <div className="text-[9px] font-extrabold text-orange-400 flex items-center justify-end gap-0.5">
                <Flame className="w-3 h-3 fill-orange-400" />
                <span>{streak}x</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. ULTRA-COMPACT SOURCE & DESTINATION WORDLE BANNER */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm flex items-center justify-between gap-2 shrink-0">
        {/* SOURCE / START WORD */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1">
            <Flag className="w-3 h-3 text-cyan-400" /> Start
          </span>
          <div className="flex gap-1">
            {startWord.split('').map((char, i) => (
              <div
                key={`src-${i}`}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-slate-950 border border-cyan-500/40 flex items-center justify-center font-mono font-black text-xs sm:text-sm text-cyan-200 shadow-sm"
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="flex items-center gap-1 text-slate-500">
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* DESTINATION / TARGET WORD */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {targetWord.split('').map((char, i) => {
              const matchesTop = topWord[i] === char;
              return (
                <div
                  key={`tgt-${i}`}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center font-mono font-black text-xs sm:text-sm border transition-all ${
                    matchesTop
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm ring-1 ring-emerald-400/60'
                      : 'bg-slate-950 border-purple-500/40 text-purple-200'
                  }`}
                >
                  {char}
                </div>
              );
            })}
          </div>
          <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider flex items-center gap-1">
            <Target className="w-3 h-3 text-purple-400" /> Goal
            <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500/30">
              {getMatchingTargetLettersCount(topWord, targetWord)}/4
            </span>
          </span>
        </div>
      </div>

      {/* 3. Main Wordle-Style Minimalist Stack Grid */}
      <div className="w-full flex-1 flex flex-col items-center justify-start min-h-[160px] max-h-[44vh] sm:max-h-[50vh] overflow-y-auto py-1 pr-1 space-y-1.5 custom-scrollbar">
        {/* STACK BASE ORIGIN ROW */}
        <div className="flex items-center gap-2 group">
          <span className="w-8 text-[9px] font-mono text-cyan-400 font-bold text-right opacity-80">
            #0
          </span>
          <div className="flex gap-1.5">
            {startWord.split('').map((char, i) => {
              const matchesTarget = targetWord[i] === char;
              return (
                <div
                  key={`base-${i}`}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-mono font-black text-lg sm:text-xl border-2 shadow-sm transition-all ${
                    matchesTarget
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-cyan-200'
                  }`}
                >
                  {char}
                </div>
              );
            })}
          </div>
          <span className="w-8" />
        </div>

        {/* STACKED WORDLE ROWS */}
        {wordStack.slice(1).map((word, stepIdx) => {
          const prevWord = wordStack[stepIdx];
          const diffIndex = dictionaryService.getDiffIndex(prevWord, word);
          const isLatest = stepIdx === wordStack.length - 2;

          return (
            <div key={`stacked-${stepIdx}`} className="flex items-center gap-2 animate-fade-in group">
              {/* Step indicator */}
              <span className="w-8 text-[9px] font-mono text-amber-400/90 font-bold text-right">
                #{stepIdx + 1}
              </span>

              {/* 4-Tile Wordle Row */}
              <div className="flex gap-1.5">
                {word.split('').map((char, charIdx) => {
                  const isChanged = charIdx === diffIndex;
                  const matchesTarget = targetWord[charIdx] === char;

                  let tileStyle = 'bg-slate-800/90 border-slate-700 text-slate-200';
                  if (matchesTarget) {
                    tileStyle = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-sm';
                  } else if (isChanged) {
                    tileStyle = 'bg-amber-500 border-amber-300 text-slate-950 font-black shadow-sm scale-105';
                  }

                  return (
                    <div
                      key={`char-${stepIdx}-${charIdx}`}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-mono text-lg sm:text-xl border-2 transition-all ${tileStyle}`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>

              {/* Undo action for latest row */}
              <div className="w-8 flex items-center">
                {isLatest && (
                  <button
                    type="button"
                    onClick={handleUndoLastStackedWord}
                    className="p-1 rounded bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Undo last word"
                  >
                    <Undo2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* ACTIVE INPUT WORDLE ROW */}
        <div className="flex flex-col items-center pt-1 w-full">
          <div className="flex items-center gap-2">
            <span className="w-8 text-[9px] font-mono text-emerald-400 font-black text-right animate-pulse">
              ▶
            </span>

            {/* 4 Wordle Input Slots */}
            <div
              className={`flex gap-1.5 transition-all ${
                isShaking ? 'animate-shake' : ''
              }`}
            >
              {[0, 1, 2, 3].map((slotIdx) => {
                const char = inputWord[slotIdx] || '';
                const isCursor = inputWord.length === slotIdx;
                const prevChar = topWord[slotIdx];
                const isDiff = char && char !== prevChar;
                const matchesTarget = targetWord[slotIdx] === char;

                return (
                  <div
                    key={`input-slot-${slotIdx}`}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-mono font-black text-lg sm:text-xl transition-all border-2 ${
                      isCursor
                        ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/50 text-white animate-pulse'
                        : char
                        ? matchesTarget
                          ? 'bg-emerald-700/80 border-emerald-400 text-white'
                          : isDiff
                          ? 'bg-purple-950/90 border-purple-400 text-purple-200'
                          : 'bg-slate-900 border-slate-600 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-600'
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {/* Helper quick-copy button */}
            <div className="w-8 flex items-center">
              <button
                type="button"
                onClick={handleCloneTopWord}
                className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                title={`Copy "${topWord}" to tweak 1 letter`}
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Minimalist Live Feedback / Guidance */}
          <div className="h-5 mt-1 flex items-center justify-center text-center">
            {validationMessage ? (
              <div
                className={`text-[11px] font-bold flex items-center gap-1 animate-pop ${
                  validationMessage.type === 'success'
                    ? 'text-emerald-400'
                    : validationMessage.type === 'warning'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {validationMessage.type === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                {validationMessage.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                <span>{validationMessage.text}</span>
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                <span>Shift 1 letter from </span>
                <strong className="text-cyan-300 font-bold">&quot;{topWord}&quot;</strong>
                <span className="text-slate-500">(Auto-stacks)</span>
              </div>
            )}
          </div>
        </div>

        <div ref={stackBottomRef} />
      </div>

      {/* 4. Helper Toolbar: Undo, Hints, Moves, Clear */}
      <div className="w-full flex items-center justify-between gap-1.5 py-0.5 px-0.5 shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Undo Step */}
          <button
            type="button"
            onClick={handleUndoLastStackedWord}
            disabled={wordStack.length <= 1}
            className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Undo last stacked word"
          >
            <Undo2 className="w-3 h-3" />
            <span>Undo</span>
          </button>

          {/* Hint Button */}
          <button
            type="button"
            onClick={handleGetHint}
            className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-amber-950/50 border border-slate-800 hover:border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="Get optimal next word suggestion"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Hint</span>
          </button>

          {/* Moves Modal Button */}
          <button
            type="button"
            onClick={() => setShowValidMovesModal(true)}
            className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="View all valid word shifts from top of stack"
          >
            <ListFilter className="w-3 h-3 text-cyan-400" />
            <span>Moves ({validAvailableMoves.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Clear typed input */}
          {inputWord.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setInputWord('');
                setValidationMessage(null);
              }}
              className="py-1 px-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-[10px] font-bold transition-all cursor-pointer"
            >
              Clear
            </button>
          )}

          {/* Keyboard layout toggle */}
          <button
            type="button"
            onClick={handleKeyboardToggle}
            className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-[10px] font-bold transition-all cursor-pointer"
          >
            {keyboardLayout === 'qwerty' ? 'QWERTY' : '12-Key'}
          </button>

          {/* Reset Stack */}
          <button
            type="button"
            onClick={handleResetPuzzle}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 transition-all cursor-pointer"
            title="Reset stack back to start word"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Hint Alert Display */}
      {hintMessage && (
        <div className="w-full bg-amber-950/80 border border-amber-500/40 rounded-xl p-2 text-xs text-amber-200 flex items-center justify-between gap-2 animate-pop shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{hintMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setHintMessage(null)}
            className="text-slate-400 hover:text-white text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 cursor-pointer"
          >
            OK
          </button>
        </div>
      )}

      {/* 5. Virtual Keyboard for Typing Whole Words */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-md shrink-0">
        {keyboardLayout === 'qwerty' ? (
          <div className="flex flex-col gap-1 w-full max-w-md mx-auto">
            {QWERTY_ROWS.map((row, rowIdx) => (
              <div key={`row-${rowIdx}`} className="flex justify-center gap-1 w-full">
                {rowIdx === 2 && <div className="flex-1 max-w-[20px] sm:max-w-[24px]" />}

                {row.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleTypeLetter(letter)}
                    className="flex-1 max-w-[36px] h-9 sm:h-10 rounded-lg bg-slate-950 hover:bg-slate-800 active:bg-amber-500/30 text-white font-extrabold text-xs sm:text-sm font-mono border border-slate-800/80 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    {letter}
                  </button>
                ))}

                {rowIdx === 2 && (
                  <button
                    type="button"
                    id="shifter-btn-backspace"
                    onClick={handleBackspace}
                    className="flex-1 max-w-[48px] h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-amber-950/60 active:bg-amber-700 border border-slate-700/80 text-amber-300 flex items-center justify-center font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                    aria-label="Backspace"
                    title="Backspace (Delete letter)"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* 12-Key Compact Layout */
          <div className="grid grid-cols-4 gap-1.5 w-full max-w-sm mx-auto">
            {COMPACT_12_KEYS.map((keyObj, i) => (
              <div key={`compact-${i}`} className="flex flex-col gap-1">
                <div className="text-[9px] text-center font-bold text-slate-500">{keyObj.label}</div>
                <div className="grid grid-cols-3 gap-0.5">
                  {keyObj.letters.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => handleTypeLetter(l)}
                      className="h-8 rounded bg-slate-950 hover:bg-slate-800 text-white font-black text-xs font-mono border border-slate-800 transition-all cursor-pointer"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* CELEBRATION MODAL (Puzzle Victory) */}
      {/* ========================================== */}
      {celebrationData && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-pop">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-3xl mb-2 animate-bounce">
              🏆
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Word Stack Completed!
            </h3>
            <p className="text-xs text-amber-300 font-mono font-bold mt-0.5">
              Goal Reached: {celebrationData.solvedWord}
            </p>

            <div className="my-4 bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Stack Depth:</span>
                <span className="font-mono font-bold text-white">
                  {celebrationData.stepsTaken} steps (Par: {celebrationData.minSteps})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Stack Efficiency:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                    celebrationData.isOptimal
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {celebrationData.isOptimal ? '⭐ Optimal Par Master' : 'Solved!'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Points & Time Extension:</span>
                <span className="font-mono font-black text-amber-300">
                  +{celebrationData.pointsEarned} pts • +{celebrationData.bonusTime}s
                </span>
              </div>
            </div>

            <button
              id="nextPuzzleBtn"
              type="button"
              onClick={loadNextPuzzle}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Next Stack Challenge</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VALID MOVES EXPLORER MODAL */}
      {/* ========================================== */}
      {showValidMovesModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-pop">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-4 shadow-2xl relative max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <ListFilter className="w-4 h-4 text-cyan-400" />
                <h4 className="font-black text-xs text-white uppercase">
                  Valid 1-Letter Shifts from &quot;{topWord}&quot;
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowValidMovesModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-2.5 overflow-y-auto flex-1">
              {validAvailableMoves.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No valid unused shifts from top word. Try undoing!</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {validAvailableMoves.map((cand) => (
                    <button
                      key={cand}
                      type="button"
                      onClick={() => {
                        submitAndStackWord(cand);
                        setShowValidMovesModal(false);
                      }}
                      className="py-2 px-2 rounded-lg bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-amber-200 font-mono font-bold text-xs transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>{cand}</span>
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
              Tap any candidate to instantly auto-stack it onto your tower!
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* UNIFIED START MODAL */}
      {/* ========================================== */}
      <StartModal
        isOpen={gameState === 'start'}
        gameMode="shifter"
        highScore={highScores.shifter}
        bestStreak={highScores.shifterStreak}
        onStart={startNewGame}
        onSelectGame={onSelectGame || (() => onOpenHub())}
      >
        {/* Difficulty Selection */}
        <div className="mb-3 text-left">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Stack Difficulty</span>
            </label>
            <span className="text-[9px] font-semibold text-slate-400">
              {DIFFICULTY_CONFIGS[difficulty].initialTime}s timer (+{DIFFICULTY_CONFIGS[difficulty].ladderBonus}s solve)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['casual', 'normal', 'master'] as ShifterDifficulty[]).map((d) => {
              const cfg = DIFFICULTY_CONFIGS[d];
              const isSelected = difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDifficultyChange(d)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-amber-500 bg-amber-950/70 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-500/40'
                      : 'border border-slate-800 bg-slate-950/60 hover:border-amber-500/40 text-slate-400'
                  }`}
                >
                  <span className="block font-black text-xs text-white">{cfg.label}</span>
                  <span className="text-[9px] text-amber-400/90 block mt-0.5 font-mono font-bold">{cfg.badge}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center italic">
            {DIFFICULTY_CONFIGS[difficulty].desc}
          </p>
        </div>
      </StartModal>

      {/* ========================================== */}
      {/* UNIFIED GAME OVER MODAL */}
      {/* ========================================== */}
      <GameOverModal
        isOpen={gameState === 'gameover'}
        gameMode="shifter"
        score={score}
        streak={Math.max(streak, bestStreakThisSession)}
        highScore={highScores.shifter}
        bestStreak={highScores.shifterStreak}
        onPlayAgain={startNewGame}
        onSelectGame={onSelectGame || (() => onOpenHub())}
        reviewDetail={
          challenge
            ? {
                label: 'Stack Transformation Target',
                value: `${challenge.startWord} ➔ ${challenge.targetWord} (${challenge.minSteps} Par)`,
              }
            : undefined
        }
      >
        {/* Difficulty Selection */}
        <div className="mb-3 text-left">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <label className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Stack Difficulty</span>
            </label>
            <span className="text-[9px] font-semibold text-slate-400">
              {DIFFICULTY_CONFIGS[difficulty].initialTime}s timer (+{DIFFICULTY_CONFIGS[difficulty].ladderBonus}s solve)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['casual', 'normal', 'master'] as ShifterDifficulty[]).map((d) => {
              const cfg = DIFFICULTY_CONFIGS[d];
              const isSelected = difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDifficultyChange(d)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-amber-500 bg-amber-950/70 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-500/40'
                      : 'border border-slate-800 bg-slate-950/60 hover:border-amber-500/40 text-slate-400'
                  }`}
                >
                  <span className="block font-black text-xs text-white">{cfg.label}</span>
                  <span className="text-[9px] text-amber-400/90 block mt-0.5 font-mono font-bold">{cfg.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </GameOverModal>
    </div>
  );
};
