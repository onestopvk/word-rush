import React from 'react';
import { Play, Flame, Timer, Zap, Trophy, Gamepad2 } from 'lucide-react';
import { GameMode } from '../types';

interface StartModalProps {
  isOpen: boolean;
  gameMode: GameMode;
  highScore: number;
  bestStreak: number;
  onStart: () => void;
  onSelectGame: (game: GameMode) => void;
  // Optional mode-specific selector (e.g., Word Rush speed levels)
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

export const StartModal: React.FC<StartModalProps> = ({
  isOpen,
  gameMode,
  highScore,
  bestStreak,
  onStart,
  onSelectGame,
  children,
}) => {
  if (!isOpen) return null;

  const isWord = gameMode === 'word';
  const isMath = gameMode === 'math';
  const isLetterFall = gameMode === 'letterfall';
  const isMathFall = gameMode === 'mathfall';
  const isShifter = gameMode === 'shifter' || gameMode === 'diagonal';

  const getThemeBadge = () => {
    if (isWord) return 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-cyan-900/40';
    if (isMath) return 'bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 shadow-indigo-900/40';
    if (isLetterFall) return 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-emerald-900/40';
    if (isMathFall) return 'bg-purple-950/80 border border-purple-500/50 text-purple-300 shadow-purple-900/40';
    return 'bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-amber-900/40';
  };

  const getPillBadge = () => {
    if (isWord) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (isMath) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    if (isLetterFall) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (isMathFall) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  const getGameIcon = () => {
    if (isWord) return '🔤';
    if (isMath) return '🔢';
    if (isLetterFall) return '🔠';
    if (isMathFall) return '➗';
    return '🔀';
  };

  const getGameTitle = () => {
    if (isWord) return 'Word Rush';
    if (isMath) return 'Math Rush';
    if (isLetterFall) return 'Letter Fall';
    if (isMathFall) return 'Math Fall';
    return 'Word Shifter';
  };

  const getGameSubtitle = () => {
    if (isWord) return '4-Letter Anagram Blitz';
    if (isMath) return 'Rapid Mental Math Engine';
    if (isLetterFall) return 'Falling 4-Letter Word Drop';
    if (isMathFall) return 'Falling Arithmetic Equation Drop';
    return '1-Letter Word Ladder Shift';
  };

  const getButtonGradient = () => {
    if (isWord) return 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-900/40';
    if (isMath) return 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-900/40';
    if (isLetterFall) return 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-900/40';
    if (isMathFall) return 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-purple-900/40';
    return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-900/40 text-slate-950 font-black';
  };

  const otherGames = ALL_GAMES_METADATA.filter(g => (isShifter ? g.id !== 'shifter' : g.id !== gameMode));

  return (
    <div
      id="startModalOverlay"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-pop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="startModalTitle"
    >
      <div
        id="startModalCard"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
      >
        {/* Header Badge */}
        <div className="mb-3">
          <div
            className={`w-13 h-13 rounded-2xl mx-auto mb-2 flex items-center justify-center text-3xl shadow-xl ${getThemeBadge()}`}
          >
            {getGameIcon()}
          </div>

          <span
            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${getPillBadge()}`}
          >
            Arcade Speed Challenge
          </span>

          <h2 id="startModalTitle" className="font-black text-2xl tracking-wider text-white mt-1 uppercase">
            {getGameTitle()}
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
            {getGameSubtitle()}
          </p>
        </div>

        {/* High Score & Record Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 flex items-center gap-1">
              <Trophy className="w-2.5 h-2.5 text-amber-400" /> Best Score
            </span>
            <span className="text-xl font-black text-amber-300 font-mono leading-tight">
              {highScore}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-emerald-400" /> Max Streak
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono leading-tight">
              x{bestStreak}
            </span>
          </div>
        </div>

        {/* Custom Body (e.g. Difficulty Selector) */}
        {children}

        {/* Quick Rules / Mechanics if no custom body */}
        {!children && (
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5 mb-3 text-left">
            <div className={`text-[9px] font-bold mb-1 uppercase tracking-wider flex items-center gap-1 ${
              isWord ? 'text-cyan-400' : isMath ? 'text-indigo-400' : isLetterFall ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              <Zap className="w-2.5 h-2.5" /> How To Play
            </div>
            <ul className="text-[11px] text-slate-300 space-y-0.5">
              {isWord && (
                <>
                  <li>• Unscramble 4-letter anagrams rapidly</li>
                  <li>• Type letters or tap tiles before timer expires</li>
                  <li>• Build combos to increase bonus multipliers</li>
                </>
              )}
              {isMath && (
                <>
                  <li>• Solve rapid arithmetic equations (+, −, ×, ÷)</li>
                  <li>• Earn +2.0s bonus time per correct answer</li>
                  <li>• Build combo streaks for +12s burst bonuses</li>
                </>
              )}
              {isLetterFall && (
                <>
                  <li>• Fill the missing letters of falling 4-letter blocks</li>
                  <li>• Clear words before they hit the bottom floor</li>
                  <li>• Protect your 3 energy shields to survive</li>
                </>
              )}
              {isMathFall && (
                <>
                  <li>• Solve missing numbers & operators on falling equations</li>
                  <li>• Solve high up for maximum speed score bonus</li>
                  <li>• Protect your 3 energy shields from laser impact</li>
                </>
              )}
              {isShifter && (
                <>
                  <li>• Transform start word to target word 1 letter at a time</li>
                  <li>• Type valid 4-letter words to auto-stack your ladder</li>
                  <li>• Beat optimal par steps for big bonuses & extra time</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            id="startModalPlayBtn"
            type="button"
            onClick={onStart}
            className={`w-full py-3 rounded-xl font-black text-sm tracking-wider uppercase text-white shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 ${getButtonGradient()}`}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start {getGameTitle()}</span>
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
                  id={`startSwitchTo_${g.id}`}
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

