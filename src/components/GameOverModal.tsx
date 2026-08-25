import React from 'react';
import { RefreshCw, Share2, Trophy, Flame, Zap, Gamepad2 } from 'lucide-react';
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

interface OtherGameInfo {
  id: GameMode;
  icon: string;
  name: string;
  category: string;
  borderHover: string;
  bgHover: string;
  textAccent: string;
}

const ALL_GAMES_METADATA: OtherGameInfo[] = [
  {
    id: 'word',
    icon: '🔤',
    name: 'Word Rush',
    category: 'Anagrams',
    borderHover: 'hover:border-cyan-500/50 hover:bg-cyan-950/40',
    bgHover: 'group-hover:bg-cyan-950 group-hover:border-cyan-500/40 group-hover:text-cyan-300',
    textAccent: 'text-cyan-400',
  },
  {
    id: 'math',
    icon: '🔢',
    name: 'Math Rush',
    category: 'Speed Calc',
    borderHover: 'hover:border-indigo-500/50 hover:bg-indigo-950/40',
    bgHover: 'group-hover:bg-indigo-950 group-hover:border-indigo-500/40 group-hover:text-indigo-300',
    textAccent: 'text-indigo-400',
  },
  {
    id: 'letterfall',
    icon: '🔠',
    name: 'Letter Fall',
    category: 'Word Drop',
    borderHover: 'hover:border-emerald-500/50 hover:bg-emerald-950/40',
    bgHover: 'group-hover:bg-emerald-950 group-hover:border-emerald-500/40 group-hover:text-emerald-300',
    textAccent: 'text-emerald-400',
  },
  {
    id: 'mathfall',
    icon: '➗',
    name: 'Math Fall',
    category: 'Equation Drop',
    borderHover: 'hover:border-purple-500/50 hover:bg-purple-950/40',
    bgHover: 'group-hover:bg-purple-950 group-hover:border-purple-500/40 group-hover:text-purple-300',
    textAccent: 'text-purple-400',
  },
  {
    id: 'shifter',
    icon: '🔀',
    name: 'Word Shifter',
    category: 'Word Ladder',
    borderHover: 'hover:border-amber-500/50 hover:bg-amber-950/40',
    bgHover: 'group-hover:bg-amber-950 group-hover:border-amber-500/40 group-hover:text-amber-300',
    textAccent: 'text-amber-400',
  },
];

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
  const isMathFall = gameMode === 'mathfall';
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
    } else if (isMathFall) {
      text = `➗ I solved falling equations to score ${score} pts with a ${streak}x streak in Math Fall! Can you beat my high score? #ArcadeRush`;
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
    if (isMathFall) return 'bg-purple-950/80 border border-purple-500/50 text-purple-300 shadow-purple-900/30';
    return 'bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-amber-900/30';
  };

  const getGameIcon = () => {
    if (isWord) return '🔤';
    if (isMath) return '🔢';
    if (isLetterFall) return '🔠';
    if (isMathFall) return '➗';
    return '🔀';
  };

  const getGameSubtitle = () => {
    if (isWord) return 'Word Rush Anagram';
    if (isMath) return 'Math Rush Speed Calc';
    if (isLetterFall) return 'Letter Fall Drop Blitz';
    if (isMathFall) return 'Math Fall Equation Drop';
    return 'Word Shifter Ladder';
  };

  const getButtonGradient = () => {
    if (isWord) return 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-900/30';
    if (isMath) return 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-900/30';
    if (isLetterFall) return 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-900/30';
    if (isMathFall) return 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-purple-900/30';
    return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-900/30 text-slate-950 font-black';
  };

  const otherGames = ALL_GAMES_METADATA.filter(g => (isShifter ? g.id !== 'shifter' : g.id !== gameMode));

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

          {/* Clean Symmetrical Switcher to Other Modes */}
          <div className="pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5">
                <Gamepad2 className="w-3 h-3 text-slate-400" />
                <span>Other Arcade Games</span>
              </span>
              <span className="text-[9px] text-slate-500 font-semibold font-mono">
                Tap to Switch
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {otherGames.map((g) => (
                <button
                  key={g.id}
                  id={`gameOverSwitchTo_${g.id}`}
                  type="button"
                  onClick={() => onSelectGame(g.id)}
                  className={`group p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 ${g.borderHover} flex items-center gap-2 text-left transition-all active:scale-95 cursor-pointer shadow-sm`}
                  title={`Switch to ${g.name} (${g.category})`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0 transition-colors ${g.bgHover}`}>
                    {g.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-slate-200 group-hover:text-white leading-tight truncate">
                      {g.name}
                    </div>
                    <div className={`text-[10px] ${g.textAccent} font-semibold leading-tight truncate`}>
                      {g.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
