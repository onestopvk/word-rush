import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameHighScores, GameMode, KeyboardLayoutMode, DiagonalDifficultyConfig, DiagonalChallenge } from '../types';
import { dictionaryService } from '../services/dictionary.service';
import { soundService } from '../services/sound.service';
import { storageService } from '../services/storage.service';
import { RefreshCw, Play, Trophy, Flame, Zap, Delete, Sparkles, Keyboard, Grid3X3, Lightbulb, CheckCircle2, XCircle, ArrowRight, CornerDownLeft } from 'lucide-react';
import { GameOverModal } from './GameOverModal';
import { StartModal } from './StartModal';

const DIAGONAL_DIFFICULTY_CONFIGS: Record<'gentle' | 'normal' | 'blitz', DiagonalDifficultyConfig> = {
  gentle: {
    name: 'gentle',
    label: 'Gentle',
    initialTime: 75,
    rowBonusTime: 4,
    boardBonusTime: 14,
    description: '75s Timer • +4s per word • Relaxed Pace',
  },
  normal: {
    name: 'normal',
    label: 'Normal',
    initialTime: 50,
    rowBonusTime: 3,
    boardBonusTime: 10,
    description: '50s Timer • +3s per word • Arcade Rush',
  },
  blitz: {
    name: 'blitz',
    label: 'Blitz',
    initialTime: 35,
    rowBonusTime: 2,
    boardBonusTime: 8,
    description: '35s Timer • +2s per word • Fast Blitz',
  },
};

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const COMPACT_12_LETTERS = ['A', 'B', 'C', 'D', 'E', 'I', 'L', 'M', 'N', 'O', 'R', 'T'];

interface DiagonalWordGameProps {
  onSelectGame: (game: GameMode) => void;
  onUpdateHighScores: () => void;
  highScores: GameHighScores;
}

export const DiagonalWordGame: React.FC<DiagonalWordGameProps> = ({
  onSelectGame,
  onUpdateHighScores,
  highScores,
}) => {
  // Config & State
  const [difficulty, setDifficulty] = useState<'gentle' | 'normal' | 'blitz'>(() => storageService.getDiagonalDifficulty());
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayoutMode>(() => storageService.getKeyboardLayout());
  const [hasStartedBefore, setHasStartedBefore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Score & Round Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [boardsCleared, setBoardsCleared] = useState(0);
  const [wordsClearedCount, setWordsClearedCount] = useState(0);
  const [activeBoardNumber, setActiveBoardNumber] = useState(1);

  // Timer
  const [timeLeft, setTimeLeft] = useState(50);
  const [maxTime, setMaxTime] = useState(50);
  const [timerBonusFeedback, setTimerBonusFeedback] = useState<string | null>(null);

  // Matrix Challenge State
  const [challenge, setChallenge] = useState<DiagonalChallenge>(() => dictionaryService.generateDiagonalChallenge());
  // 4 rows of 4 letters each
  const [gridLetters, setGridLetters] = useState<string[][]>([
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
  ]);
  // Validation status & error reasons for each row
  const [rowStatus, setRowStatus] = useState<('empty' | 'typing' | 'valid' | 'invalid')[]>(['empty', 'empty', 'empty', 'empty']);
  const [rowErrors, setRowErrors] = useState<('diagonal_word' | 'duplicate' | 'invalid_word' | 'wrong_diagonal' | null)[]>([null, null, null, null]);
  const [rowWords, setRowWords] = useState<string[]>(['', '', '', '']);
  const [awardedRows, setAwardedRows] = useState<boolean[]>([false, false, false, false]);

  // Focused cell: [row, col]
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({ row: 0, col: 1 });

  // Visual Effects & Animations
  const [boardClearCelebration, setBoardClearCelebration] = useState(false);
  const [invalidRowShake, setInvalidRowShake] = useState<number | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streakRef = useRef(streak);
  streakRef.current = streak;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Initialize a new board
  const setupNewBoard = useCallback((newChallenge?: DiagonalChallenge) => {
    const ch = newChallenge || dictionaryService.generateDiagonalChallenge();
    setChallenge(ch);

    // Initialize 4x4 grid with the diagonal letter placed
    const initialGrid: string[][] = [
      [ch.targetWord[0], '', '', ''],
      ['', ch.targetWord[1], '', ''],
      ['', '', ch.targetWord[2], ''],
      ['', '', '', ch.targetWord[3]],
    ];
    setGridLetters(initialGrid);
    setRowStatus(['empty', 'empty', 'empty', 'empty']);
    setRowErrors([null, null, null, null]);
    setRowWords(['', '', '', '']);
    setAwardedRows([false, false, false, false]);
    // Focus row 0, col 1 (since col 0 is fixed)
    setFocusedCell({ row: 0, col: 1 });
    setHintMessage(null);
  }, []);

  // Start / Restart Game
  const handleStartGame = useCallback(() => {
    const config = DIAGONAL_DIFFICULTY_CONFIGS[difficulty];
    setTimeLeft(config.initialTime);
    setMaxTime(config.initialTime);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setBoardsCleared(0);
    setWordsClearedCount(0);
    setActiveBoardNumber(1);
    setIsGameOver(false);
    setBoardClearCelebration(false);
    setupNewBoard();
    setIsPlaying(true);
    setHasStartedBefore(true);
    soundService.playGameStart();
  }, [difficulty, setupNewBoard]);

  // Handle Game Over
  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    storageService.saveDiagonalScore(scoreRef.current, streakRef.current);
    onUpdateHighScores();
    soundService.playGameOver();
  }, [onUpdateHighScores]);

  // Main Countdown Timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, Math.round((prev - 0.1) * 10) / 10));
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying]);

  // Handle Game Over transition when time runs out
  useEffect(() => {
    if (isPlaying && !isGameOver && timeLeft <= 0) {
      handleGameOver();
    }
  }, [isPlaying, isGameOver, timeLeft, handleGameOver]);

  // Evaluates the full grid for validity, error reasons, and diagonal matching
  const evaluateGrid = useCallback((grid: string[][], targetWord: string) => {
    const words = grid.map(r => r.join('').toUpperCase());
    const statuses: ('empty' | 'typing' | 'valid' | 'invalid')[] = [];
    const errors: ('diagonal_word' | 'duplicate' | 'invalid_word' | 'wrong_diagonal' | null)[] = [];

    for (let r = 0; r < 4; r++) {
      const word = words[r];
      if (word.length < 4) {
        statuses.push(word.length > 1 ? 'typing' : 'empty');
        errors.push(null);
        continue;
      }

      // 1. Player cannot use the diagonal question keyword itself
      if (word === targetWord.toUpperCase()) {
        statuses.push('invalid');
        errors.push('diagonal_word');
        continue;
      }

      // 2. Check required diagonal positional letter
      const diagLetter = targetWord[r].toUpperCase();
      if (word[r] !== diagLetter) {
        statuses.push('invalid');
        errors.push('wrong_diagonal');
        continue;
      }

      // 3. Check English dictionary validity
      if (!dictionaryService.isValidWord(word)) {
        statuses.push('invalid');
        errors.push('invalid_word');
        continue;
      }

      // 4. Check for duplicate row words
      const isDuplicate = words.some((otherWord, otherIdx) => otherIdx !== r && otherWord === word && otherWord.length === 4);
      if (isDuplicate) {
        statuses.push('invalid');
        errors.push('duplicate');
        continue;
      }

      // Valid unique word!
      statuses.push('valid');
      errors.push(null);
    }

    return { statuses, errors, words };
  }, []);

  // Check row validation whenever gridLetters changes
  useEffect(() => {
    if (!challenge) return;
    const { statuses, errors, words } = evaluateGrid(gridLetters, challenge.targetWord);
    setRowStatus(statuses);
    setRowErrors(errors);
    setRowWords(words);
  }, [gridLetters, challenge, evaluateGrid]);

  // Check if board is completely solved
  const checkBoardCompletion = useCallback((currentStatus: ('empty' | 'typing' | 'valid' | 'invalid')[]) => {
    const allValid = currentStatus.every(s => s === 'valid');
    if (allValid && isPlayingRef.current) {
      // Award board bonus!
      const config = DIAGONAL_DIFFICULTY_CONFIGS[difficulty];
      const bonusPts = 400 + streakRef.current * 50;
      setScore(s => s + bonusPts);
      setStreak(st => {
        const next = st + 1;
        setMaxStreak(ms => Math.max(ms, next));
        return next;
      });
      setBoardsCleared(b => b + 1);
      setActiveBoardNumber(n => n + 1);

      // Add timer burst
      setTimeLeft(t => {
        const nextTime = Math.min(maxTime + 15, t + config.boardBonusTime);
        return Math.round(nextTime * 10) / 10;
      });
      setTimerBonusFeedback(`+${config.boardBonusTime}s BOARD BONUS!`);
      setTimeout(() => setTimerBonusFeedback(null), 1800);

      // Celebration effect
      setBoardClearCelebration(true);
      soundService.playStreakMilestone();

      setTimeout(() => {
        setBoardClearCelebration(false);
        setupNewBoard();
      }, 900);
    }
  }, [difficulty, maxTime, setupNewBoard]);

  // Handle Letter Input into active cell
  const handleInputLetter = useCallback((char: string) => {
    if (!isPlaying) return;
    const letter = char.toUpperCase();
    if (!/^[A-Z]$/.test(letter)) return;

    soundService.playKeyPress();

    setGridLetters(prev => {
      const next = prev.map(row => [...row]);
      const { row, col } = focusedCell;

      // Don't overwrite diagonal locked tile
      if (row === col) {
        return next;
      }

      next[row][col] = letter;

      // Evaluate new grid immediately
      const { statuses, errors, words } = evaluateGrid(next, challenge.targetWord);
      const fullWord = words[row];

      if (fullWord.length === 4) {
        if (statuses[row] === 'valid') {
          if (!awardedRows[row]) {
            // Play row success & score
            soundService.playWordSuccess();
            const config = DIAGONAL_DIFFICULTY_CONFIGS[difficulty];
            setScore(s => s + 100);
            setWordsClearedCount(w => w + 1);
            setTimeLeft(t => Math.round((t + config.rowBonusTime) * 10) / 10);
            setTimerBonusFeedback(`+${config.rowBonusTime}s`);
            setTimeout(() => setTimerBonusFeedback(null), 1200);
            setAwardedRows(prevAwards => {
              const updated = [...prevAwards];
              updated[row] = true;
              return updated;
            });
          }
        } else {
          soundService.playWordWrong();
          setInvalidRowShake(row);
          setTimeout(() => setInvalidRowShake(null), 500);

          if (errors[row] === 'diagonal_word') {
            setHintMessage(`⚠️ "${challenge.targetWord}" is the diagonal keyword! Form 4 different words.`);
            setTimeout(() => setHintMessage(null), 2500);
          } else if (errors[row] === 'duplicate') {
            setHintMessage(`⚠️ "${fullWord}" is already used! Each row must be a unique word.`);
            setTimeout(() => setHintMessage(null), 2500);
          } else if (errors[row] === 'invalid_word') {
            setHintMessage(`⚠️ "${fullWord}" is not recognized in the dictionary.`);
            setTimeout(() => setHintMessage(null), 2500);
          }
        }
      }

      // Check if all 4 rows are completed
      checkBoardCompletion(statuses);

      return next;
    });

    // Advance cursor to next editable cell
    setFocusedCell(prev => {
      let nextCol = prev.col + 1;
      let nextRow = prev.row;

      if (nextCol > 3) {
        // Move to next row
        nextRow = (nextRow + 1) % 4;
        nextCol = 0;
      }

      // If next cell is diagonal locked, skip it
      if (nextRow === nextCol) {
        nextCol = (nextCol + 1) % 4;
      }

      return { row: nextRow, col: nextCol };
    });
  }, [isPlaying, focusedCell, challenge, difficulty, awardedRows, evaluateGrid, checkBoardCompletion]);

  // Handle Backspace / Delete
  const handleDeleteLetter = useCallback(() => {
    if (!isPlaying) return;
    soundService.playKeyDelete();

    setGridLetters(prev => {
      const next = prev.map(row => [...row]);
      const { row, col } = focusedCell;

      // If current cell has a letter (and is not diagonal locked), clear it
      if (row !== col && next[row][col] !== '') {
        next[row][col] = '';
        return next;
      }

      // Otherwise move back 1 cell and clear it
      let prevCol = col - 1;
      let prevRow = row;

      if (prevCol < 0) {
        prevRow = (prevRow - 1 + 4) % 4;
        prevCol = 3;
      }

      if (prevRow === prevCol) {
        prevCol = prevCol - 1;
        if (prevCol < 0) {
          prevRow = (prevRow - 1 + 4) % 4;
          prevCol = 3;
        }
      }

      if (prevRow !== prevCol) {
        next[prevRow][prevCol] = '';
        setFocusedCell({ row: prevRow, col: prevCol });
      }

      return next;
    });
  }, [isPlaying, focusedCell]);

  // Move Cursor
  const handleMoveCursor = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    setFocusedCell(prev => {
      let r = prev.row;
      let c = prev.col;

      if (direction === 'left') c = (c - 1 + 4) % 4;
      if (direction === 'right') c = (c + 1) % 4;
      if (direction === 'up') r = (r - 1 + 4) % 4;
      if (direction === 'down') r = (r + 1) % 4;

      // If lands on diagonal locked cell, advance one step further in that direction
      if (r === c) {
        if (direction === 'left') c = (c - 1 + 4) % 4;
        if (direction === 'right') c = (c + 1) % 4;
        if (direction === 'up') r = (r - 1 + 4) % 4;
        if (direction === 'down') r = (r + 1) % 4;
      }

      return { row: r, col: c };
    });
  }, []);

  // Clear specific row
  const handleClearRow = (rowIndex: number) => {
    soundService.playKeyDelete();
    setGridLetters(prev => {
      const next = prev.map(row => [...row]);
      for (let c = 0; c < 4; c++) {
        if (c !== rowIndex) {
          next[rowIndex][c] = '';
        }
      }
      return next;
    });
    setAwardedRows(prev => {
      const next = [...prev];
      next[rowIndex] = false;
      return next;
    });
    // Focus first non-diagonal cell in this row
    const firstCol = rowIndex === 0 ? 1 : 0;
    setFocusedCell({ row: rowIndex, col: firstCol });
  };

  // Provide a Hint for the focused row
  const handleHint = () => {
    if (!isPlaying) return;
    const { row } = focusedCell;
    const existingWords = gridLetters.map(r => r.join('').toUpperCase());
    const validWords = dictionaryService
      .getValidWordsForDiagonalRow(challenge.targetWord, row)
      .filter(w => w.toUpperCase() !== challenge.targetWord.toUpperCase() && !existingWords.includes(w.toUpperCase()));

    if (validWords.length === 0) {
      setHintMessage(`💡 Keep trying combinations for Row ${row + 1}!`);
      setTimeout(() => setHintMessage(null), 2000);
      return;
    }

    // Pick a candidate word
    const candidate = validWords[Math.floor(Math.random() * validWords.length)];
    // Find an empty cell in this row
    const emptyIndices = [0, 1, 2, 3].filter(c => c !== row && gridLetters[row][c] === '');

    if (emptyIndices.length > 0) {
      const fillCol = emptyIndices[0];
      const hintChar = candidate[fillCol];
      setGridLetters(prev => {
        const next = prev.map(r => [...r]);
        next[row][fillCol] = hintChar;
        return next;
      });
      setHintMessage(`💡 Hint: Placed '${hintChar}' in Row ${row + 1} (e.g. from "${candidate}")`);
    } else {
      setHintMessage(`💡 Try a word like "${candidate}" for Row ${row + 1}! (${validWords.length} words possible)`);
    }

    soundService.playStreakMilestone();
    setTimeout(() => setHintMessage(null), 3000);
  };

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if modifying other inputs or modal open
      if (!isPlaying || isGameOver || !hasStartedBefore) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteLetter();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMoveCursor('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleMoveCursor('right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleMoveCursor('up');
      } else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleMoveCursor('down');
      } else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        handleInputLetter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, hasStartedBefore, handleDeleteLetter, handleMoveCursor, handleInputLetter]);

  // Layout mode switcher
  const handleToggleKeyboard = (layout: KeyboardLayoutMode) => {
    setKeyboardLayout(layout);
    storageService.setKeyboardLayout(layout);
    soundService.playToggle();
  };

  // Difficulty switcher
  const handleChangeDifficulty = (diff: 'gentle' | 'normal' | 'blitz') => {
    setDifficulty(diff);
    storageService.setDiagonalDifficulty(diff);
    soundService.playToggle();
  };

  // Timer Progress Math
  const timerPercentage = Math.min(100, Math.max(0, (timeLeft / maxTime) * 100));
  const isTimeCritical = timeLeft <= 10;

  return (
    <div
      id="diagonalGameContainer"
      className="flex flex-col items-center justify-between w-full max-w-lg mx-auto flex-1 p-1.5 sm:p-2 gap-1.5 sm:gap-2 relative select-none min-h-0"
    >
      {/* 1. TOP HEADER: Score, Multipliers & High Score */}
      <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md shrink-0">
        {/* Current Score */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block leading-none">
              Score
            </span>
            <span className="text-sm sm:text-base font-black text-white font-mono leading-tight">
              {score}
            </span>
          </div>
        </div>

        {/* Board Number & Streak Multiplier */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-extrabold text-slate-300 flex items-center gap-1">
            <span className="text-amber-400">Board #{activeBoardNumber}</span>
          </div>

          <div
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border transition-all ${
              streak > 0
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            <Flame className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${streak > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
            <span className="text-[11px] sm:text-xs font-black font-mono">{streak}x</span>
          </div>
        </div>

        {/* High Score */}
        <div className="text-right">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block leading-none">
            Best
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono leading-tight">
            {Math.max(highScores.diagonal, score)}
          </span>
        </div>
      </div>

      {/* 2. TIMER BAR & BONUS FEEDBACK */}
      <div className="w-full space-y-0.5 shrink-0">
        <div className="flex items-center justify-between text-xs px-1 font-bold">
          <div className="flex items-center gap-1 text-slate-300">
            <Zap className={`w-3.5 h-3.5 ${isTimeCritical ? 'text-rose-500 animate-bounce' : 'text-amber-400'}`} />
            <span className={isTimeCritical ? 'text-rose-400 font-black animate-pulse' : 'text-amber-300'}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>
          {timerBonusFeedback && (
            <span className="text-emerald-400 font-black text-[11px] animate-pop bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
              {timerBonusFeedback}
            </span>
          )}
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            {difficulty} mode
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-800/80 overflow-hidden relative shadow-inner">
          <div
            className={`h-full transition-all duration-100 ease-linear rounded-full ${
              isTimeCritical
                ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. TARGET KEYWORD BANNER */}
      <div className="w-full py-1.5 px-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 shadow-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-[11px] text-amber-300 font-black">
            📐
          </div>
          <div>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold text-amber-400 block leading-none">
              Diagonal Keyword
            </span>
            <span className="text-[11px] text-slate-300 font-semibold">
              Fill 4 words matching diagonal
            </span>
          </div>
        </div>

        {/* Keyword Letter Chips */}
        <div className="flex items-center gap-1">
          {challenge.targetWord.split('').map((letter, idx) => (
            <div
              key={idx}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-md border border-amber-300 font-mono animate-pop"
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* 4. MAIN 4x4 MATRIX GRID */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col gap-1.5 relative overflow-hidden flex-1 justify-center min-h-0">
        {/* Celebration Overlay on Matrix Clear */}
        {boardClearCelebration && (
          <div className="absolute inset-0 bg-amber-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center animate-pop p-4">
            <Sparkles className="w-10 h-10 text-amber-300 animate-spin mb-2" />
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              Matrix Complete!
            </h3>
            <p className="text-xs text-amber-300 font-bold mt-1">
              +500 Board Bonus • +10s Time Added
            </p>
          </div>
        )}

        {/* 4 Matrix Rows */}
        <div className="space-y-1 sm:space-y-1.5">
          {[0, 1, 2, 3].map(r => {
            const status = rowStatus[r];
            const isRowValid = status === 'valid';
            const isRowInvalid = status === 'invalid';
            const isCurrentRowFocused = focusedCell.row === r;
            const isShaking = invalidRowShake === r;

            return (
              <div
                key={r}
                className={`flex items-center justify-between gap-1.5 p-1 rounded-xl border transition-all ${
                  isShaking
                    ? 'animate-shake border-red-500 bg-red-950/30'
                    : isRowValid
                    ? 'border-emerald-500/60 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : isCurrentRowFocused
                    ? 'border-amber-500/50 bg-slate-950/80 shadow-md'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                {/* Row Number Pill */}
                <div className="w-4 text-center">
                  <span className="text-[9px] font-mono font-bold text-slate-500">
                    R{r + 1}
                  </span>
                </div>

                {/* 4 Letter Grid Cells */}
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5 flex-1 max-w-xs">
                  {[0, 1, 2, 3].map(c => {
                    const isDiagonalCell = r === c;
                    const letter = gridLetters[r][c];
                    const isSelected = focusedCell.row === r && focusedCell.col === c;

                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (!isDiagonalCell) {
                            setFocusedCell({ row: r, col: c });
                            soundService.playKeyPress();
                          }
                        }}
                        className={`h-8 sm:h-9 md:h-10 rounded-lg sm:rounded-xl flex flex-col items-center justify-center font-mono text-base sm:text-lg font-black transition-all relative cursor-pointer ${
                          isDiagonalCell
                            ? 'bg-amber-500 text-slate-950 border-2 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] cursor-default'
                            : isSelected
                            ? 'bg-slate-800 text-cyan-300 border-2 border-cyan-400 ring-2 ring-cyan-400/30 scale-105'
                            : letter
                            ? isRowValid
                              ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/60'
                              : 'bg-slate-800/90 text-white border border-slate-700'
                            : 'bg-slate-900/60 text-slate-600 border border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {/* Letter Value */}
                        <span>{letter || (isDiagonalCell ? challenge.targetWord[r] : '')}</span>

                        {/* Diagonal Indicator Tag */}
                        {isDiagonalCell && (
                          <span className="absolute -top-1 -right-1 text-[7px] bg-slate-950 text-amber-300 px-0.5 rounded-full border border-amber-400/60 font-sans font-black">
                            ★
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Row Status Badge / Clear Button */}
                <div className="w-14 flex items-center justify-end gap-1">
                  {isRowValid ? (
                    <div className="flex items-center gap-0.5 text-emerald-400 font-extrabold text-[9px] bg-emerald-950 px-1 py-0.5 rounded-lg border border-emerald-500/40 animate-pop">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>+100</span>
                    </div>
                  ) : isRowInvalid ? (
                    <div
                      className="flex items-center gap-0.5 text-rose-400 font-extrabold text-[8px] bg-rose-950 px-1 py-0.5 rounded-lg border border-rose-500/40 animate-shake"
                      title={
                        rowErrors[r] === 'diagonal_word'
                          ? `Cannot use diagonal word "${challenge.targetWord}"`
                          : rowErrors[r] === 'duplicate'
                          ? 'Duplicate word! All 4 rows must be unique'
                          : rowErrors[r] === 'invalid_word'
                          ? 'Not recognized as a valid English word'
                          : 'Invalid word'
                      }
                    >
                      <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate max-w-[36px]">
                        {rowErrors[r] === 'diagonal_word'
                          ? 'Target'
                          : rowErrors[r] === 'duplicate'
                          ? 'Repeat'
                          : 'Invalid'}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClearRow(r)}
                      title="Clear Row"
                      className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] transition-all cursor-pointer"
                    >
                      <Delete className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action Helpers */}
        <div className="flex items-center justify-between pt-0.5 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="text-amber-400 font-bold">★ Gold</span>
            <span>= fixed letter</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleHint}
              className="px-2 py-0.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 shadow transition-all cursor-pointer"
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Hint</span>
            </button>
          </div>
        </div>

        {/* Hint Feedback Banner */}
        {hintMessage && (
          <div className="p-1 rounded-xl bg-amber-950/90 border border-amber-500/50 text-amber-200 text-[11px] font-bold text-center animate-pop">
            {hintMessage}
          </div>
        )}
      </div>

      {/* 5. ON-SCREEN KEYBOARD & LAYOUT CONTROLS */}
      <div className="w-full flex flex-col gap-1 shrink-0">
        {/* Keyboard Header & Layout Mode Toggle */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1">
            <Keyboard className="w-3 h-3 text-amber-400" />
            Input Controls
          </span>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              id="diagonalQwertyToggle"
              type="button"
              onClick={() => handleToggleKeyboard('qwerty')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                keyboardLayout === 'qwerty'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              QWERTY
            </button>
            <button
              id="diagonalCompactToggle"
              type="button"
              onClick={() => handleToggleKeyboard('compact12')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                keyboardLayout === 'compact12'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              12-Key Pad
            </button>
          </div>
        </div>

        {/* QWERTY LAYOUT */}
        {keyboardLayout === 'qwerty' ? (
          <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl p-1 shadow-md flex flex-col gap-1">
            {QWERTY_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-0.5 sm:gap-1 w-full">
                {/* If 3rd row, include Navigation / Backspace */}
                {rowIdx === 2 && (
                  <button
                    type="button"
                    onClick={() => handleMoveCursor('left')}
                    className="flex-1 max-w-[34px] sm:max-w-[38px] h-8 sm:h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-700 transition-all active:scale-95 cursor-pointer"
                    title="Previous Cell"
                  >
                    ◀
                  </button>
                )}

                {row.map(char => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleInputLetter(char)}
                    className="flex-1 max-w-[32px] sm:max-w-[38px] h-8 sm:h-9 rounded-lg bg-slate-800 hover:bg-amber-950/80 hover:border-amber-500/50 text-slate-100 font-extrabold text-xs sm:text-sm flex items-center justify-center border border-slate-700/80 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    {char}
                  </button>
                ))}

                {rowIdx === 2 && (
                  <button
                    type="button"
                    onClick={handleDeleteLetter}
                    className="flex-1 max-w-[38px] sm:max-w-[44px] h-8 sm:h-9 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center justify-center border border-rose-500/40 transition-all active:scale-95 cursor-pointer"
                    title="Delete"
                  >
                    <Delete className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* COMPACT 12-KEY LAYOUT */
          <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl p-1.5 shadow-md flex flex-col gap-1">
            <div className="grid grid-cols-6 gap-1">
              {COMPACT_12_LETTERS.map(char => (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleInputLetter(char)}
                  className="h-8 sm:h-9 rounded-xl bg-slate-800 hover:bg-amber-950/80 hover:border-amber-500/50 text-slate-100 font-black text-sm sm:text-base flex items-center justify-center border border-slate-700/80 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  {char}
                </button>
              ))}
            </div>

            {/* Extra Keys & Delete */}
            <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleMoveCursor('left')}
                className="flex-1 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center justify-center border border-slate-700 cursor-pointer"
              >
                ◀ Left
              </button>
              <button
                type="button"
                onClick={() => handleMoveCursor('right')}
                className="flex-1 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center justify-center border border-slate-700 cursor-pointer"
              >
                Right ▶
              </button>
              <button
                type="button"
                onClick={handleDeleteLetter}
                className="flex-1 py-1 rounded-lg bg-rose-950 text-rose-300 font-bold text-[11px] flex items-center justify-center gap-1 border border-rose-500/40 cursor-pointer"
              >
                <Delete className="w-3 h-3" /> Backspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* START MODAL */}
      <StartModal
        isOpen={!hasStartedBefore}
        gameMode="diagonal"
        highScore={highScores.diagonal}
        bestStreak={highScores.diagonalStreak}
        onStart={handleStartGame}
        onSelectGame={onSelectGame}
      >
        <div className="space-y-3 mb-2">
          {/* Difficulty Preset Picker */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Select Timer Pace
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['gentle', 'normal', 'blitz'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleChangeDifficulty(d)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-black capitalize transition-all cursor-pointer border ${
                    difficulty === d
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {DIAGONAL_DIFFICULTY_CONFIGS[difficulty].description}
            </p>
          </div>
        </div>
      </StartModal>

      {/* GAME OVER MODAL */}
      <GameOverModal
        isOpen={isGameOver}
        gameMode="diagonal"
        score={score}
        streak={streak}
        highScore={highScores.diagonal}
        onRestart={handleStartGame}
        onSelectGame={onSelectGame}
      />
    </div>
  );
};
