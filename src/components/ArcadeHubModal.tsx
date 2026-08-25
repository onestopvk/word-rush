import React from 'react';
import { GameMode, GameHighScores } from '../types';
import { X, Play, Trophy, Sparkles, Flame } from 'lucide-react';

interface ArcadeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: GameMode) => void;
  activeGame: GameMode;
  highScores: GameHighScores;
}

export const ArcadeHubModal: React.FC<ArcadeHubModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  activeGame,
  highScores,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-pop">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/30 to-purple-500/30 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-sm shadow-md">
              🎮
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
                Arcade Suite Hub
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Select Game
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">High-speed cognitive & reflex games</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close Arcade Hub"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Game Cards List */}
        <div className="mt-3.5 space-y-2.5">
          {/* Card 1: Word Rush */}
          <div
            onClick={() => {
              onSelectGame('word');
              onClose();
            }}
            className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 cursor-pointer ${
              activeGame === 'word'
                ? 'bg-cyan-950/40 border-2 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-slate-950/60 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xl shrink-0">
                🔤
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white">Word Rush</h3>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-[9px] font-black uppercase">
                    {activeGame === 'word' ? 'Playing Now' : 'Ready'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">4-letter rapid anagram scramble with streak multipliers</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Best Score</span>
                <span className="text-xs font-black text-cyan-300 font-mono flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> {highScores.wordRush} pts
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Play</span>
              </button>
            </div>
          </div>

          {/* Card 2: Math Rush */}
          <div
            onClick={() => {
              onSelectGame('math');
              onClose();
            }}
            className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 cursor-pointer ${
              activeGame === 'math'
                ? 'bg-indigo-950/40 border-2 border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'bg-slate-950/60 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-xl shrink-0">
                🔢
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white">Math Rush</h3>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 text-[9px] font-black uppercase">
                    {activeGame === 'math' ? 'Playing Now' : 'Ready'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">High-speed arithmetic speed run with combo time rewards</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Best Solved</span>
                <span className="text-xs font-black text-indigo-300 font-mono flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" /> {highScores.mathRush} slv
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Play</span>
              </button>
            </div>
          </div>

          {/* Card 3: Letter Fall */}
          <div
            onClick={() => {
              onSelectGame('letterfall');
              onClose();
            }}
            className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 cursor-pointer ${
              activeGame === 'letterfall'
                ? 'bg-emerald-950/40 border-2 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-slate-950/60 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                🔠
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white">Letter Fall</h3>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[9px] font-black uppercase">
                    {activeGame === 'letterfall' ? 'Playing Now' : 'Ready'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">4-letter falling word drop — complete words before impact</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Best Score</span>
                <span className="text-xs font-black text-emerald-300 font-mono flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> {highScores.letterFall} pts
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Play</span>
              </button>
            </div>
          </div>

          {/* Card 4: Word Shifter */}
          <div
            onClick={() => {
              onSelectGame('shifter');
              onClose();
            }}
            className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 cursor-pointer ${
              activeGame === 'shifter' || activeGame === 'diagonal'
                ? 'bg-amber-950/40 border-2 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950/60 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                🔀
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white">Word Shifter</h3>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[9px] font-black uppercase">
                    {activeGame === 'shifter' || activeGame === 'diagonal' ? 'Playing Now' : 'Ready'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Word Ladder — transform source word to target word by changing one letter at a time</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Best Score</span>
                <span className="text-xs font-black text-amber-300 font-mono flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> {highScores.shifter} pts
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow cursor-pointer"
              >
                <Play className="w-3 h-3 fill-slate-950" />
                <span>Play</span>
              </button>
            </div>
          </div>

          {/* Coming Soon Teasers */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800/80 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-base">
                🧩
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-300">Memory Rush</h4>
                <p className="text-[10px] text-slate-500">Visual sequence pattern blitz (Coming Next)</p>
              </div>
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Soon</span>
          </div>
        </div>

        {/* Hub Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Auto-saved offline high scores
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
