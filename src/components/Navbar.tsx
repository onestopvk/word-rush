import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Volume2, VolumeX, HelpCircle, RotateCcw, Sparkles } from 'lucide-react';
import { GameMode, GameHighScores } from '../types';
import { soundService } from '../services/sound.service';

interface NavbarProps {
  activeGame: GameMode;
  onSelectGame: (game: GameMode) => void;
  onOpenHub: () => void;
  onOpenInfo: () => void;
  onRestart: () => void;
  highScores: GameHighScores;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeGame,
  onSelectGame,
  onOpenHub,
  onOpenInfo,
  onRestart,
  highScores,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundService.getSoundEnabled());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const next = soundService.toggleSound();
    setSoundEnabled(next);
  };

  const isWord = activeGame === 'word';
  const isMath = activeGame === 'math';
  const isLetterFall = activeGame === 'letterfall';
  const isShifter = activeGame === 'shifter' || activeGame === 'diagonal';

  const getHeaderTheme = () => {
    if (isWord) return 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 text-cyan-300';
    if (isMath) return 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-400 text-indigo-300';
    if (isLetterFall) return 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400 text-emerald-300';
    return 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 text-amber-300';
  };

  const getHeaderIconBg = () => {
    if (isWord) return 'bg-cyan-950 border border-cyan-500/40 text-cyan-300';
    if (isMath) return 'bg-indigo-950 border border-indigo-500/40 text-indigo-300';
    if (isLetterFall) return 'bg-emerald-950 border border-emerald-500/40 text-emerald-300';
    return 'bg-amber-950 border border-amber-500/40 text-amber-300';
  };

  const getHeaderPill = () => {
    if (isWord) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    if (isMath) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    if (isLetterFall) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  };

  const getGameTitle = () => {
    if (isWord) return 'Word Rush';
    if (isMath) return 'Math Rush';
    if (isLetterFall) return 'Letter Fall';
    return 'Word Shifter';
  };

  const getGameBadge = () => {
    if (isWord) return 'Anagrams';
    if (isMath) return 'Speed Calc';
    if (isLetterFall) return 'Word Drop';
    return 'Word Ladder';
  };

  return (
    <header className="w-full flex items-center justify-between py-1.5 px-1 border-b border-slate-800 shrink-0 gap-2 relative z-40">
      {/* Brand + Custom Dropdown Selector */}
      <div className="relative flex items-center gap-2" ref={dropdownRef}>
        <button
          id="gameDropdownTrigger"
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border shadow-md transition-all active:scale-98 group cursor-pointer focus:outline-none ${getHeaderTheme()}`}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          title="Switch Arcade Games"
        >
          {/* Active Icon */}
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-sm font-bold ${getHeaderIconBg()}`}
          >
            {isWord ? '🔤' : isMath ? '🔢' : isLetterFall ? '🔠' : '🔀'}
          </div>

          {/* Active Title & Badge */}
          <div className="flex items-center gap-1.5 text-left">
            <span className="font-black text-xs sm:text-sm tracking-wider text-white uppercase">
              {getGameTitle()}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold border hidden xs:inline ${getHeaderPill()}`}
            >
              {getGameBadge()}
            </span>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        {/* Floating Dropdown Menu */}
        {dropdownOpen && (
          <div
            id="gameDropdownMenu"
            className="absolute left-0 top-full mt-1.5 w-64 sm:w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-1.5 shadow-2xl z-50 animate-pop origin-top-left"
            role="menu"
          >
            <div className="px-2.5 py-1.5 text-[9px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-800/80 flex items-center justify-between">
              <span>Select Arcade Game</span>
              <span className="text-emerald-400 font-bold">4 Active Games</span>
            </div>

            <div className="py-1 space-y-1">
              {/* Option 1: Word Rush */}
              <button
                id="dropdownItemWord"
                type="button"
                onClick={() => {
                  onSelectGame('word');
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group cursor-pointer ${
                  isWord
                    ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-200'
                    : 'hover:bg-cyan-950/30 border border-transparent hover:border-cyan-500/30 text-slate-300'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-sm">
                    🔤
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                      <span>Word Rush</span>
                      {isWord && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-slate-400">4-letter rapid anagram scramble</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {highScores.wordRush} pts
                </span>
              </button>

              {/* Option 2: Math Rush */}
              <button
                id="dropdownItemMath"
                type="button"
                onClick={() => {
                  onSelectGame('math');
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group cursor-pointer ${
                  isMath
                    ? 'bg-indigo-950/60 border border-indigo-500/50 text-indigo-200'
                    : 'hover:bg-indigo-950/30 border border-transparent hover:border-indigo-500/30 text-slate-300'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-sm">
                    🔢
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-200 group-hover:text-indigo-300 flex items-center gap-1.5">
                      <span>Math Rush</span>
                      {isMath && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-slate-400">Speed arithmetic rush</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-indigo-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {highScores.mathRush} slv
                </span>
              </button>

              {/* Option 3: Letter Fall */}
              <button
                id="dropdownItemLetterFall"
                type="button"
                onClick={() => {
                  onSelectGame('letterfall');
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group cursor-pointer ${
                  isLetterFall
                    ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200'
                    : 'hover:bg-emerald-950/30 border border-transparent hover:border-emerald-500/30 text-slate-300'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-sm">
                    🔠
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-200 group-hover:text-emerald-300 flex items-center gap-1.5">
                      <span>Letter Fall</span>
                      {isLetterFall && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-slate-400">4-letter falling word drop</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {highScores.letterFall} pts
                </span>
              </button>

              {/* Option 4: Word Shifter */}
              <button
                id="dropdownItemShifter"
                type="button"
                onClick={() => {
                  onSelectGame('shifter');
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group cursor-pointer ${
                  isShifter
                    ? 'bg-amber-950/60 border border-amber-500/50 text-amber-200'
                    : 'hover:bg-amber-950/30 border border-transparent hover:border-amber-500/30 text-slate-300'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-sm">
                    🔀
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-200 group-hover:text-amber-300 flex items-center gap-1.5">
                      <span>Word Shifter</span>
                      {isShifter && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-slate-400">1-letter word ladder transformation</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-amber-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {highScores.shifter} pts
                </span>
              </button>
            </div>


            {/* Dropdown Footer / Full Hub Link */}
            <div className="pt-1 mt-1 border-t border-slate-800/80">
              <button
                id="dropdownOpenHubBtn"
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenHub();
                }}
                className="w-full py-1.5 px-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 text-amber-300 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Full Arcade Suite Hub</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Hub Button */}
        <button
          id="arcadeHubBtn"
          type="button"
          onClick={onOpenHub}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-amber-300 active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          title="Explore Arcade Hub"
        >
          <span>🎮</span>
          <span className="hidden sm:inline">Hub</span>
        </button>

        {/* Sound toggle */}
        <button
          id="soundToggleBtn"
          type="button"
          onClick={handleToggleSound}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 active:scale-95 transition-all cursor-pointer"
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {/* Info button */}
        <button
          id="infoBtn"
          type="button"
          onClick={onOpenInfo}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 active:scale-95 transition-all cursor-pointer"
          title="How to play"
          aria-label="How to play"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Restart button */}
        <button
          id="restartHeaderBtn"
          type="button"
          onClick={onRestart}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 active:scale-95 transition-all cursor-pointer"
          title="Restart Active Game"
          aria-label="Restart Game"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
