import React from 'react';
import { RefreshCw, Share2, Trophy, Flame, Zap } from 'lucide-react';
import { GameMode } from '../types';

interface GameOverModalProps {
  isOpen: boolean;
  gameMode: GameMode;
  score: number;
  streak: number;
  highScore: number;
  bestStreak: number;
  onPlayAgain: () => void;
  onSelectGame: (game: GameMode) => void;
  // Contextual detail: anagram solutions for word, or last problem info for math
  reviewDetail?: {
    label: string;
    value: string;
  };
  // Optional custom controls such as difficulty selector
  children?: React.ReactNode;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  gameMode,
  score,
  streak,
  highScore,
  bestStreak,
  onPlayAgain,
  onSelectGame,
  reviewDetail,
  children,
}) => {
  if (!isOpen) return null;

  const isWord = gameMode === 'word';
  const isMath = gameMode === 'math';
  const isLetterFall = gameMode === 'letterfall';
  const isShifter = gameMode === 'shifter' || gameMode === 'diagonal';
  const isNewHighScore = score > 0 && score >= highScore;

  const handleShare = () => {
    let text = '';
    if (isWord) {
      text = `🔥 I scored ${score} pts with a ${streak}x streak in Word Rush! Can you beat my high score? #ArcadeRush`;
    } else if (isMath) {
      text = `🧮 I solved ${score} math speed problems with a ${streak}x streak in Math Rush! Can you beat me? #ArcadeRush`;
    } else if (isLetterFall) {
      text = `🔠 I dropped and caught ${score} words with a ${streak}x streak in Letter Fall! Can you beat my high score? #ArcadeRush`;
    } else {
      text = `🔀 I transformed words to score ${score} pts with a ${streak}x streak in Word Shifter! Can you beat my high score? #ArcadeRush`;
    }

    if (navigator.share) {
      navigator.share({ title: 'Arcade Rush Score', text }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const getThemeBadge = () => {
    if (isWord) return 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-cyan-900/30';
    if (isMath) return 'bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 shadow-indigo-900/30';
    if (isLetterFall) return 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-emerald-900/30';
    return 'bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-amber-900/30';
  };

  const getGameIcon = () => {
    if (isWord) return '🔤';
    if (isMath) return '🔢';
    if (isLetterFall) return '🔠';
    return '🔀';
  };

  const getGameSubtitle = () => {
    if (isWord) return 'Word Rush Anagram';
    if (isMath) return 'Math Rush Speed Calc';
    if (isLetterFall) return 'Letter Fall Drop Blitz';
    return 'Word Shifter Ladder';
  };

  const getButtonGradient = () => {
    if (isWord) return 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-900/30';
    if (isMath) return 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-900/30';
    if (isLetterFall) return 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-900/30';
    return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-900/30 text-slate-950 font-black';
  };

  const ALL_OTHER_GAMES = [
    { id: 'word' as GameMode, icon: '🔤', name: 'Word Rush', hoverBg: 'hover:bg-cyan-950/60', hoverBorder: 'hover:border-cyan-500/50', textColor: 'text-cyan-300' },
    { id: 'math' as GameMode, icon: '🔢', name: 'Math Rush', hoverBg: 'hover:bg-indigo-950/60', hoverBorder: 'hover:border-indigo-500/50', textColor: 'text-indigo-300' },
    { id: 'letterfall' as GameMode, icon: '🔠', name: 'Letter Fall', hoverBg: 'hover:bg-emerald-950/60', hoverBorder: 'hover:border-emerald-500/50', textColor: 'text-emerald-300' },
    { id: 'shifter' as GameMode, icon: '🔀', name: 'Word Shifter', hoverBg: 'hover:bg-amber-950/60', hoverBorder: 'hover:border-amber-500/50', textColor: 'text-amber-300' },
  ].filter(g => (isShifter ? g.id !== 'shifter' : g.id !== gameMode));

  return (
    <div
      id="gameOverModalOverlay"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-pop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameOverTitle"
    >
      <div
        id="gameOverModalCard"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
      >
        {/* Top Header Badge & Title */}
        <div className="mb-3">
          <div
            className={`w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center text-2xl shadow-lg ${getThemeBadge()}`}
          >
            {getGameIcon()}
          </div>

          <span
            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
              isNewHighScore
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            {isNewHighScore ? '✨ New High Score! ✨' : "Round Over!"}
          </span>

          <h2 id="gameOverTitle" className="font-black text-xl tracking-wider text-white mt-1.5 uppercase">
            Round Complete
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
            {getGameSubtitle()}
          </p>
        </div>

        {/* Unified 3-Stat Metric Grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {/* 1. Final Score */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-cyan-400" /> Score
            </span>
            <span className="text-lg sm:text-xl font-black text-white font-mono leading-tight">
              {score}
            </span>
          </div>

          {/* 2. Streak */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-emerald-400" /> Max
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono leading-tight">
              x{bestStreak > 0 ? Math.max(streak, bestStreak) : streak}
            </span>
          </div>

          {/* 3. High Score */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 flex items-center gap-1">
              <Trophy className="w-2.5 h-2.5 text-amber-400" /> Best
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-300 font-mono leading-tight">
              {highScore}
            </span>
          </div>
        </div>

        {/* Contextual Solution / Detail Card */}
        {reviewDetail && (
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5 mb-3 text-left">
            <div className="text-[9px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">
              {reviewDetail.label}
            </div>
            <div className="font-mono text-sm sm:text-base font-black text-white tracking-wider uppercase truncate">
              {reviewDetail.value}
            </div>
          </div>
        )}

        {/* Custom Mode Controls (e.g. Difficulty Selector) */}
        {children}

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Primary Play Again */}
          <button
            id="gameOverPlayAgainBtn"
            type="button"
            onClick={onPlayAgain}
            className={`w-full py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase text-white shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 ${getButtonGradient()}`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          {/* Share Score */}
          <button
            id="gameOverShareBtn"
            type="button"
            onClick={handleShare}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Share Score</span>
          </button>

          {/* Direct Switcher to Other Modes */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold mb-1.5 text-center">
              Or Switch Arcade Mode
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_OTHER_GAMES.map((g) => (
                <button
                  key={g.id}
                  id={`gameOverSwitchTo_${g.id}`}
                  type="button"
                  onClick={() => onSelectGame(g.id)}
                  className={`py-1.5 px-1 rounded-xl bg-slate-950/80 ${g.hoverBg} border border-slate-800 ${g.hoverBorder} ${g.textColor} font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 truncate`}
                  title={`Switch to ${g.name}`}
                >
                  <span className="shrink-0">{g.icon}</span>
                  <span className="truncate">{g.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
