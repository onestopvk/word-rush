import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameHighScores, FallSpeedDifficulty, FallDifficultyConfig, FallingMathChallenge, GameMode } from '../types';
import { mathService } from '../services/math.service';
import { soundService } from '../services/sound.service';
import { storageService } from '../services/storage.service';
import { RefreshCw, Play, Trophy, Flame, Shield, ShieldAlert, Zap, Delete, Sparkles, Check, RotateCcw } from 'lucide-react';
import { GameOverModal } from './GameOverModal';
import { StartModal } from './StartModal';

const FALL_DIFFICULTY_CONFIGS: Record<FallSpeedDifficulty, FallDifficultyConfig> = {
  gentle: {
    name: 'gentle',
    label: 'Gentle',
    baseFallDuration: 7.5, // 7.5s
    pointsPerSolve: 100,
  },
  normal: {
    name: 'normal',
    label: 'Normal',
    baseFallDuration: 5.2, // 5.2s
    pointsPerSolve: 150,
  },
  turbo: {
    name: 'turbo',
    label: 'Turbo',
    baseFallDuration: 3.6, // 3.6s
    pointsPerSolve: 250,
  },
};

interface MathFallGameProps {
  onSelectGame: (game: GameMode) => void;
  onUpdateHighScores: () => void;
  highScores: GameHighScores;
}

export const MathFallGame: React.FC<MathFallGameProps> = ({
  onSelectGame,
  onUpdateHighScores,
  highScores,
}) => {
  // Game Configuration State
  const [difficulty, setDifficulty] = useState<FallSpeedDifficulty>(() => storageService.getMathFallDifficulty());
  const [hasStartedBefore, setHasStartedBefore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Score & Round Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [equationsCleared, setEquationsCleared] = useState(0);

  // Current Challenge & User Input
  const [challenge, setChallenge] = useState<FallingMathChallenge | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [lastMissedDetail, setLastMissedDetail] = useState<{ equation: string; answer: string } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [scoreFloatingNotice, setScoreFloatingNotice] = useState<string | null>(null);

  // Fall Position Physics (0% at top, 100% at danger baseline)
  const [fallProgress, setFallProgress] = useState(0);
  const fallProgressRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const config = FALL_DIFFICULTY_CONFIGS[difficulty];

  // Helper to spawn a new challenge
  const spawnNextChallenge = useCallback(() => {
    const newChallenge = mathService.generateMathFallChallenge(difficulty);
    setChallenge(newChallenge);
    setUserInput('');

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
    setEquationsCleared(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setHasStartedBefore(true);
    setLastMissedDetail(null);
    setScoreFloatingNotice(null);

    spawnNextChallenge();
    soundService.playTileSelect(0);
  }, [spawnNextChallenge]);

  // Handle Input Submission / Verification
  const verifyInput = useCallback(
    (inputToTest: string) => {
      if (!challenge || !isPlaying || isGameOver) return;

      const trimmed = inputToTest.trim();
      if (trimmed === challenge.correctAnswer) {
        // Correct Answer!
        const heightBonusMultiplier = Math.max(1, (100 - fallProgressRef.current) / 28);
        const pointsAwarded = Math.round(config.pointsPerSolve * (1 + streak * 0.2) * heightBonusMultiplier);

        const nextScore = score + pointsAwarded;
        const nextStreak = streak + 1;
        const nextMaxStreak = Math.max(maxStreak, nextStreak);

        setScore(nextScore);
        setStreak(nextStreak);
        setMaxStreak(nextMaxStreak);
        setEquationsCleared(prev => prev + 1);

        // Play feedback sounds & notice
        if (nextStreak > 0 && nextStreak % 5 === 0) {
          soundService.playCombo();
          setScoreFloatingNotice(`🔥 COMBO ${nextStreak}x! +${pointsAwarded}`);
        } else {
          soundService.playCorrect();
          setScoreFloatingNotice(`+${pointsAwarded} pts`);
        }

        setTimeout(() => {
          setScoreFloatingNotice(null);
        }, 1200);

        spawnNextChallenge();
      } else {
        // If the user typed an invalid character or operator, give subtle audio feedback
        soundService.playUntap();
      }
    },
    [challenge, isPlaying, isGameOver, config.pointsPerSolve, streak, score, maxStreak, spawnNextChallenge]
  );

  // Handle Keypad & Keyboard Input
  const handleInputChar = useCallback(
    (char: string) => {
      if (!isPlaying || isGameOver || !challenge) return;

      soundService.playTileSelect(userInput.length);

      // Normalize operators
      let formattedChar = char;
      if (char === '*' || char === 'x' || char === 'X') formattedChar = '×';
      if (char === '/') formattedChar = '÷';

      // If missing part is operator, direct set & verify
      if (challenge.missingPart === 'operator') {
        if (['+', '-', '×', '÷'].includes(formattedChar)) {
          setUserInput(formattedChar);
          verifyInput(formattedChar);
        }
        return;
      }

      // If missing part is a number, limit input length to 3 digits
      if (/^[0-9]$/.test(formattedChar)) {
        const next = (userInput + formattedChar).slice(0, 3);
        setUserInput(next);
        verifyInput(next);
      }
    },
    [isPlaying, isGameOver, challenge, userInput, verifyInput]
  );

  const handleBackspace = useCallback(() => {
    if (!isPlaying || isGameOver) return;
    soundService.playUntap();
    setUserInput(prev => prev.slice(0, -1));
  }, [isPlaying, isGameOver]);

  const handleClear = useCallback(() => {
    if (!isPlaying || isGameOver) return;
    soundService.playUntap();
    setUserInput('');
  }, [isPlaying, isGameOver]);

  const handleManualSubmit = useCallback(() => {
    if (!isPlaying || isGameOver || !challenge) return;
    if (userInput.trim() === challenge.correctAnswer) {
      verifyInput(userInput);
    } else {
      soundService.playWrong();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  }, [isPlaying, isGameOver, challenge, userInput, verifyInput]);

  // Physics animation loop for descending equation
  useEffect(() => {
    if (!isPlaying || isGameOver || !challenge) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    // Accelerates slightly as more equations are cleared
    const speedScale = 1 + Math.min(equationsCleared * 0.02, 0.8);
    const durationMs = (config.baseFallDuration / speedScale) * 1000;

    const tick = (currentTime: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }
      const delta = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      const stepPercent = (delta / durationMs) * 100;
      fallProgressRef.current = Math.min(100, fallProgressRef.current + stepPercent);
      setFallProgress(fallProgressRef.current);

      if (fallProgressRef.current >= 100) {
        // Equation hit the laser floor!
        soundService.playWrong();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);

        setStreak(0);
        setLastMissedDetail({
          equation: challenge.displayText,
          answer: challenge.correctAnswer,
        });

        const nextLives = lives - 1;
        setLives(nextLives);

        if (nextLives <= 0) {
          // Game Over
          setIsGameOver(true);
          setIsPlaying(false);
          soundService.playGameOver();

          const { isNewHighScore } = storageService.saveMathFallScore(score, maxStreak);
          if (isNewHighScore) {
            soundService.playCombo();
          }
          onUpdateHighScores();
        } else {
          spawnNextChallenge();
        }
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isGameOver, challenge, config.baseFallDuration, equationsCleared, lives, score, maxStreak, onUpdateHighScores, spawnNextChallenge]);

  // Physical Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleInputChar(e.key);
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === 'x' || e.key === 'X' || e.key === '/') {
        e.preventDefault();
        handleInputChar(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleManualSubmit();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, handleInputChar, handleBackspace, handleManualSubmit, handleClear]);

  // Save difficulty changes
  const handleDifficultySelect = (diff: FallSpeedDifficulty) => {
    setDifficulty(diff);
    storageService.setMathFallDifficulty(diff);
  };

  const isDangerZone = fallProgress > 72;

  return (
    <div
      id="mathFallGameContainer"
      className="w-full flex-1 flex flex-col items-center justify-between min-h-0 select-none py-1"
    >
      {/* 1. TOP HUD (Score, Lives/Shields, Streak Multiplier) */}
      <div className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl mb-1.5 shadow-sm">
        {/* Score & Points Gain */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Score</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-white font-mono leading-none mt-0.5">
                {score}
              </span>
              {scoreFloatingNotice && (
                <span className="text-[11px] font-black text-purple-300 font-mono bg-purple-950/90 border border-purple-500/50 px-2 py-0.5 rounded-full shadow-sm animate-pulse whitespace-nowrap">
                  {scoreFloatingNotice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Streak Multiplier */}
        <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
          <Flame className={`w-3.5 h-3.5 ${streak > 2 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-xs font-black text-slate-200 font-mono">
            {streak > 0 ? `${(1 + streak * 0.2).toFixed(1)}x` : '1.0x'}
          </span>
        </div>

        {/* Energy Shields / Lives */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(shieldIdx => (
            <div
              key={`shield-${shieldIdx}`}
              className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                shieldIdx <= lives
                  ? 'bg-purple-950/70 border-purple-500/50 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-700 opacity-40'
              }`}
            >
              {shieldIdx <= lives ? (
                <Shield className="w-3.5 h-3.5 fill-purple-400/30 text-purple-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. FALLING ARENA (Physics Drop Stage) */}
      <div
        id="mathFallArena"
        className={`w-full flex-1 relative bg-slate-950/90 border-2 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between transition-colors duration-200 ${
          isShaking ? 'animate-shake border-red-500 bg-red-950/20' : isDangerZone ? 'border-amber-500/60 bg-slate-950/90' : 'border-slate-800'
        }`}
      >
        {/* Speed Mode & Cleared Indicator (Subtle Top-Right) */}
        <div className="absolute top-2 right-3 z-10 text-[10px] font-mono font-bold flex items-center gap-2 pointer-events-none opacity-60">
          <span className="text-purple-400 uppercase tracking-widest">{config.label} Speed</span>
          <span>•</span>
          <span className="text-slate-400">{equationsCleared} Solved</span>
        </div>

        {/* Dynamic Descending Equation Block Container */}
        {challenge && isPlaying && !isGameOver && (
          <div
            id="fallingEquationContainer"
            className="absolute left-0 right-0 px-3 z-20 transition-transform will-change-transform"
            style={{
              top: `${Math.min(78, fallProgress * 0.78)}%`,
              transform: 'translateY(-10%)',
            }}
          >
            <div
              className={`max-w-xs mx-auto p-2.5 sm:p-3.5 rounded-2xl backdrop-blur-md border-2 transition-all shadow-xl flex items-center justify-center gap-2 sm:gap-2.5 ${
                isDangerZone
                  ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                  : 'bg-slate-900/95 border-purple-500/60 shadow-[0_0_18px_rgba(168,85,247,0.25)]'
              }`}
            >
              {/* Left Operand */}
              <div
                className={`min-w-[40px] px-2 py-1.5 rounded-xl border text-center font-mono text-lg sm:text-2xl font-black transition-all ${
                  challenge.missingPart === 'left'
                    ? 'bg-purple-950/90 border-purple-400 text-purple-200 ring-2 ring-purple-500/40 animate-pulse'
                    : 'bg-slate-950/80 border-slate-700 text-slate-100'
                }`}
              >
                {challenge.missingPart === 'left' ? userInput || '?' : challenge.displayLeft}
              </div>

              {/* Operator */}
              <div
                className={`min-w-[34px] px-1.5 py-1.5 rounded-xl border text-center font-mono text-lg sm:text-2xl font-black transition-all ${
                  challenge.missingPart === 'operator'
                    ? 'bg-purple-950/90 border-purple-400 text-purple-200 ring-2 ring-purple-500/40 animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-purple-400'
                }`}
              >
                {challenge.missingPart === 'operator' ? userInput || '?' : challenge.displayOp}
              </div>

              {/* Right Operand */}
              <div
                className={`min-w-[40px] px-2 py-1.5 rounded-xl border text-center font-mono text-lg sm:text-2xl font-black transition-all ${
                  challenge.missingPart === 'right'
                    ? 'bg-purple-950/90 border-purple-400 text-purple-200 ring-2 ring-purple-500/40 animate-pulse'
                    : 'bg-slate-950/80 border-slate-700 text-slate-100'
                }`}
              >
                {challenge.missingPart === 'right' ? userInput || '?' : challenge.displayRight}
              </div>

              {/* Equals Sign */}
              <span className="font-mono text-lg sm:text-2xl font-black text-slate-400">=</span>

              {/* Result Slot */}
              <div
                className={`min-w-[46px] px-2.5 py-1.5 rounded-xl border text-center font-mono text-lg sm:text-2xl font-black transition-all ${
                  challenge.missingPart === 'result'
                    ? 'bg-purple-950/90 border-purple-400 text-purple-200 ring-2 ring-purple-500/40 animate-pulse'
                    : 'bg-slate-950/80 border-slate-700 text-slate-100'
                }`}
              >
                {challenge.missingPart === 'result' ? userInput || '?' : challenge.displayResult}
              </div>
            </div>
          </div>
        )}

        {/* Impact Danger Baseline / Laser Warning */}
        <div className="w-full mt-auto relative z-10">
          <div className="relative w-full h-8 flex items-center justify-center">
            {/* Pulsing Laser Beam */}
            <div
              className={`absolute inset-x-0 h-1 transition-all ${
                isDangerZone
                  ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse'
                  : 'bg-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
              }`}
            />
            <span
              className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border z-10 transition-all ${
                isDangerZone
                  ? 'bg-rose-950 text-rose-300 border-rose-500/80 animate-bounce'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              {isDangerZone ? '⚠️ Impact Warning' : 'Danger Baseline'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. VIRTUAL NUMPAD & OPERATOR KEYPAD */}
      <div className="w-full mt-1.5 flex flex-col gap-1 shrink-0">
        {/* Row 1: 1 2 3 4 5 + - */}
        <div className="grid grid-cols-7 gap-1">
          {['1', '2', '3', '4', '5', '+', '-'].map(key => {
            const isOp = key === '+' || key === '-';
            return (
              <button
                key={`key-${key}`}
                type="button"
                onClick={() => handleInputChar(key)}
                className={`py-2 sm:py-2.5 rounded-xl font-mono text-base sm:text-lg font-black transition-all active:scale-95 shadow-sm cursor-pointer ${
                  isOp
                    ? 'bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-500/50 text-indigo-300 hover:text-white'
                    : 'bg-slate-850 hover:bg-slate-800 border border-slate-750 text-white hover:border-purple-500/50'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Row 2: 6 7 8 9 0 × ÷ */}
        <div className="grid grid-cols-7 gap-1">
          {['6', '7', '8', '9', '0', '×', '÷'].map(key => {
            const isOp = key === '×' || key === '÷';
            return (
              <button
                key={`key-${key}`}
                type="button"
                onClick={() => handleInputChar(key)}
                className={`py-2 sm:py-2.5 rounded-xl font-mono text-base sm:text-lg font-black transition-all active:scale-95 shadow-sm cursor-pointer ${
                  isOp
                    ? 'bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-500/50 text-indigo-300 hover:text-white'
                    : 'bg-slate-850 hover:bg-slate-800 border border-slate-750 text-white hover:border-purple-500/50'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Row 3: Action Controls (Clear, Backspace, Submit) */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* Clear */}
          <button
            type="button"
            onClick={handleClear}
            className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Delete className="w-4 h-4" />
            <span>Delete</span>
          </button>

          {/* Submit */}
          <button
            type="button"
            onClick={handleManualSubmit}
            className="py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Enter</span>
          </button>
        </div>
      </div>

      {/* 4. START MODAL */}
      <StartModal
        isOpen={!hasStartedBefore}
        gameMode="mathfall"
        highScore={highScores.mathFall}
        bestStreak={highScores.mathFallStreak}
        onStart={startGame}
        onSelectGame={onSelectGame}
      >
        <div className="mb-4">
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider">
            Select Descent Speed
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['gentle', 'normal', 'turbo'] as FallSpeedDifficulty[]).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => handleDifficultySelect(d)}
                className={`py-2 px-1 rounded-xl text-xs font-black capitalize transition-all border cursor-pointer ${
                  difficulty === d
                    ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-purple-500/40 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </StartModal>

      {/* 5. GAME OVER MODAL */}
      <GameOverModal
        isOpen={isGameOver}
        gameMode="mathfall"
        score={score}
        streak={maxStreak}
        highScore={highScores.mathFall}
        bestStreak={highScores.mathFallStreak}
        onPlayAgain={startGame}
        onSelectGame={onSelectGame}
        reviewDetail={
          lastMissedDetail
            ? {
                label: 'Missed Equation',
                value: `${lastMissedDetail.equation} ➔ Answer: ${lastMissedDetail.answer}`,
              }
            : undefined
        }
      />
    </div>
  );
};
