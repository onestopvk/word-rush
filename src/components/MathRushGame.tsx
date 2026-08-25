import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameHighScores, MathProblem, GameMode } from '../types';
import { mathService } from '../services/math.service';
import { soundService } from '../services/sound.service';
import { storageService } from '../services/storage.service';
import { RefreshCw, Play, Trophy, Flame, Timer, Delete } from 'lucide-react';
import { GameOverModal } from './GameOverModal';
import { StartModal } from './StartModal';

interface MathRushGameProps {
  onSelectGame: (game: GameMode) => void;
  onUpdateHighScores: () => void;
  highScores: GameHighScores;
}

export const MathRushGame: React.FC<MathRushGameProps> = ({
  onSelectGame,
  onUpdateHighScores,
  highScores,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStartedBefore, setHasStartedBefore] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30.0);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; isGood: boolean } | null>(null);
  const [isWrongShake, setIsWrongShake] = useState(false);

  const initialTime = 30.0;
  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const nextProblem = useCallback((currentScore: number) => {
    const p = mathService.generateProblem(currentScore);
    setProblem(p);
    setUserInput('');
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setStreak(1);
    setTimeLeft(initialTime);
    setIsGameOver(false);
    setIsPlaying(true);
    setHasStartedBefore(true);
    setFeedback(null);
    nextProblem(0);
    lastTickRef.current = performance.now();
  }, [nextProblem]);

  // Main countdown timer loop
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
      storageService.saveMathScore(score, streak);
      onUpdateHighScores();
    }
  }, [timeLeft, isPlaying, isGameOver, score, streak, onUpdateHighScores]);

  // Check user input against target answer
  const handleDigitInput = useCallback((digit: string) => {
    if (!isPlaying || isGameOver || !problem) return;

    soundService.playTileSelect(userInput.length);
    const nextVal = userInput + digit;
    setUserInput(nextVal);

    const parsed = parseInt(nextVal, 10);
    const expected = problem.answer;
    const expectedLength = expected.toString().length;

    // Check if the current length reached target answer length
    if (nextVal.length >= expectedLength) {
      if (parsed === expected) {
        // Correct!
        const newScore = score + 1;
        const newStreak = streak + 1;
        setScore(newScore);
        setStreak(newStreak);

        // Time bonus
        let bonus = 2.0;
        if (newStreak % 10 === 0) {
          bonus = 12.0;
          soundService.playCombo();
          setFeedback({ text: `⚡ MEGA STREAK BONUS: +12s!`, isGood: true });
        } else {
          soundService.playCorrect();
          setFeedback({ text: `+1 Solved (+${bonus}s)`, isGood: true });
        }

        setTimeLeft(prev => Math.min(prev + bonus, 45.0));
        storageService.saveMathScore(newScore, newStreak);
        onUpdateHighScores();

        setTimeout(() => {
          nextProblem(newScore);
        }, 100);
      } else {
        // Wrong answer
        soundService.playWrong();
        setIsWrongShake(true);
        setStreak(1);
        setFeedback({ text: `Wrong! Answer was ${expected}`, isGood: false });

        setTimeout(() => {
          setIsWrongShake(false);
          setUserInput('');
        }, 350);
      }
    }
  }, [isPlaying, isGameOver, problem, userInput, score, streak, nextProblem, onUpdateHighScores]);

  // Backspace / Clear
  const handleBackspace = useCallback(() => {
    if (!isPlaying || userInput.length === 0) return;
    soundService.playUntap();
    setUserInput(prev => prev.slice(0, -1));
  }, [isPlaying, userInput]);

  // Keyboard input listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigitInput(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        setUserInput('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, handleDigitInput, handleBackspace]);

  const isDanger = timeLeft <= 5.0;
  const progressRatio = Math.min(Math.max(timeLeft / 30.0, 0), 1);

  return (
    <div id="mathRushView" className="w-full flex flex-col items-center justify-between flex-1 min-h-0 relative">
      {/* 1. HUD METRICS */}
      <section className="w-full grid grid-cols-4 gap-1.5 sm:gap-2.5 my-1.5 shrink-0" aria-label="Math Rush HUD">
        {/* Time Left */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 sm:p-2 flex flex-col items-center shadow">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-indigo-400 font-bold mb-0.5 whitespace-nowrap flex items-center gap-1">
            <Timer className="w-2.5 h-2.5" /> Time
          </span>
          <span className={`text-base sm:text-xl font-black font-mono leading-tight ${isDanger ? 'text-rose-400 animate-pulse' : 'text-indigo-300'}`}>
            {timeLeft.toFixed(1)}s
          </span>
        </div>

        {/* Solved */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 sm:p-2 flex flex-col items-center shadow">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5 whitespace-nowrap">Solved</span>
          <span className="text-base sm:text-xl font-black text-emerald-400 leading-tight font-mono">{score}</span>
        </div>

        {/* Streak */}
        <div className="bg-slate-900/80 border-2 border-indigo-500/40 rounded-xl p-1.5 sm:p-2 flex flex-col items-center shadow-[0_0_12px_rgba(99,102,241,0.1)]">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-indigo-400 font-bold mb-0.5 whitespace-nowrap flex items-center gap-1">
            <Flame className="w-2.5 h-2.5" /> Streak
          </span>
          <span className="text-base sm:text-xl font-black text-indigo-300 leading-tight font-mono">x{streak}</span>
        </div>

        {/* Best */}
        <div className="bg-slate-900/80 border-2 border-amber-500/40 rounded-xl p-1.5 sm:p-2 flex flex-col items-center shadow-[0_0_12px_rgba(245,158,11,0.1)]">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-400 font-bold mb-0.5 whitespace-nowrap flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5" /> Best
          </span>
          <span className="text-base sm:text-xl font-black text-amber-300 leading-tight font-mono">{highScores.mathRush}</span>
        </div>
      </section>

      {/* 2. MAIN MATH ARENA */}
      <main className="w-full max-w-sm flex flex-col items-center justify-center flex-1 my-auto min-h-0 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-sm">
        {/* Dynamic Problem Dial Box */}
        <div
          className={`w-full h-24 sm:h-28 rounded-2xl relative flex items-center justify-center p-1 transition-all ${
            isDanger
              ? 'bg-gradient-to-br from-rose-950/80 to-slate-900 border-2 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
              : 'bg-gradient-to-br from-indigo-950/70 to-slate-900 border-2 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
          }`}
          style={{
            background: isDanger
              ? `conic-gradient(from 0deg, #ef4444 ${progressRatio * 100}%, #1e1014 0)`
              : `conic-gradient(from 0deg, #6366f1 ${progressRatio * 100}%, #111827 0)`,
          }}
        >
          <div className="absolute inset-1 rounded-xl bg-slate-950/95 flex items-center justify-center">
            {isPlaying && problem ? (
              <span className="text-3xl sm:text-4xl md:text-5xl font-black font-mono text-white tracking-wider text-shadow">
                {problem.displayText} = ?
              </span>
            ) : (
              <button
                type="button"
                onClick={startGame}
                className="w-full h-full rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 font-black text-2xl tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-6 h-6 fill-indigo-400 text-indigo-400" />
                <span>READY?</span>
              </button>
            )}
          </div>
        </div>

        {/* Answer Input Display Field */}
        <div
          className={`h-12 w-full my-2.5 px-4 rounded-xl flex items-center justify-center text-2xl font-black font-mono tracking-widest transition-all ${
            isWrongShake
              ? 'bg-rose-950/90 border-2 border-rose-500 text-rose-300 animate-shake'
              : 'bg-slate-950 border-2 border-indigo-500/40 text-indigo-300 shadow-inner'
          }`}
        >
          {userInput || '—'}
        </div>

        {/* Keypad */}
        <div className="w-full grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitInput(digit)}
              className="min-h-[46px] p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 border-b-4 border-b-slate-900 rounded-xl text-white font-black text-xl shadow-md active:translate-y-0.5 active:border-b transition-all cursor-pointer"
            >
              {digit}
            </button>
          ))}

          {/* Clear / Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            className="min-h-[46px] p-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 border-b-4 border-b-rose-950 rounded-xl text-rose-300 font-black text-xl shadow-md active:translate-y-0.5 active:border-b transition-all flex items-center justify-center cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleDigitInput('0')}
            className="min-h-[46px] p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 border-b-4 border-b-slate-900 rounded-xl text-white font-black text-xl shadow-md active:translate-y-0.5 active:border-b transition-all cursor-pointer"
          >
            0
          </button>

          {/* Restart / Start Shortcut */}
          <button
            type="button"
            onClick={startGame}
            className="min-h-[46px] p-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 border-b-4 border-b-emerald-950 rounded-xl text-emerald-300 font-black text-xl shadow-md active:translate-y-0.5 active:border-b transition-all flex items-center justify-center cursor-pointer"
            title="Start / Restart"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback text */}
        <div className="h-5 mt-1.5 text-xs font-black text-center">
          {feedback && (
            <span className={feedback.isGood ? 'text-emerald-400' : 'text-rose-400'}>
              {feedback.text}
            </span>
          )}
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full flex items-center justify-between py-1 border-t border-slate-900/80 text-[10px] text-slate-500 shrink-0">
        <span>Math Rush v1.0</span>
        <span className="text-indigo-400 font-semibold">+2s bonus per solution · +12s on 10 streak</span>
      </footer>

      {/* UNIFIED START MODAL OVERLAY */}
      <StartModal
        isOpen={!isPlaying && !isGameOver && !hasStartedBefore}
        gameMode="math"
        highScore={highScores.mathRush}
        bestStreak={highScores.mathRushStreak}
        onStart={startGame}
        onSelectGame={onSelectGame}
      />

      {/* UNIFIED GAME OVER MODAL OVERLAY */}
      <GameOverModal
        isOpen={isGameOver}
        gameMode="math"
        score={score}
        streak={streak}
        highScore={highScores.mathRush}
        bestStreak={highScores.mathRushStreak}
        onPlayAgain={startGame}
        onSelectGame={onSelectGame}
        reviewDetail={
          problem
            ? {
                label: 'Last Equation Target',
                value: `${problem.displayText} = ${problem.answer}`,
              }
            : undefined
        }
      />
    </div>
  );
};
