import React from 'react';
import { GameMode } from '../types';
import { X, HelpCircle, CheckCircle2 } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGame: GameMode;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  activeGame,
}) => {
  if (!isOpen) return null;

  const isWord = activeGame === 'word';
  const isMath = activeGame === 'math';
  const isLetterFall = activeGame === 'letterfall';
  const isMathFall = activeGame === 'mathfall';
  const isShifter = activeGame === 'shifter' || activeGame === 'diagonal';

  const getTitle = () => {
    if (isWord) return 'How to Play Word Rush';
    if (isMath) return 'How to Play Math Rush';
    if (isLetterFall) return 'How to Play Letter Fall';
    if (isMathFall) return 'How to Play Math Fall';
    return 'How to Play Word Shifter';
  };

  const getHeaderIconColor = () => {
    if (isWord) return 'text-cyan-400';
    if (isMath) return 'text-indigo-400';
    if (isLetterFall) return 'text-emerald-400';
    if (isMathFall) return 'text-purple-400';
    return 'text-amber-400';
  };

  const getButtonBg = () => {
    if (isWord) return 'bg-cyan-600 hover:bg-cyan-500';
    if (isMath) return 'bg-indigo-600 hover:bg-indigo-500';
    if (isLetterFall) return 'bg-emerald-600 hover:bg-emerald-500';
    if (isMathFall) return 'bg-purple-600 hover:bg-purple-500';
    return 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-black';
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-pop">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className={`w-5 h-5 ${getHeaderIconColor()}`} />
            <h2 className="font-black text-base text-white uppercase tracking-wider">
              {getTitle()}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs text-slate-300">
          {isWord && (
            <>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Unscramble the 4 letters:</strong> Form any valid English 4-letter word before the circular timer empties.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Gain Bonus Time:</strong> Every correct word instantly awards bonus seconds and advances your score multiplier.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Keyboard Friendly:</strong> Type directly using keys <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300">A-Z</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300">Backspace</kbd> to undo, and <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300">Space</kbd> to clear.
                </p>
              </div>
            </>
          )}

          {isMath && (
            <>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Solve Fast Arithmetic:</strong> Enter the correct result using the on-screen keypad or your keyboard numbers.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Earn Time Extensions:</strong> Each correct equation gives +2s. Reach a 10-streak combo for a massive +12s burst!
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Adaptive Difficulty:</strong> As your score increases, equations scale from addition/subtraction to rapid multiplication and division.
                </p>
              </div>
            </>
          )}

          {isLetterFall && (
            <>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Fill Falling Words:</strong> A 4-letter block with 1 or 2 fixed clues falls down the track. Enter the missing letters before it hits the floor.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">High Catch Bonus:</strong> Completing words near the top awards high score multipliers and builds your combo fire streak!
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">3 Energy Shields:</strong> Each time a word crashes into the laser floor baseline, you lose 1 Shield. Clear words fast to survive!
                </p>
              </div>
            </>
          )}

          {isMathFall && (
            <>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Solve Falling Equations:</strong> Single or double digit arithmetic equations fall toward the danger baseline. Complete the missing number or operator before it impacts.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Full Arithmetic Keypad:</strong> Use numbers <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-purple-300">0-9</kbd> and operators <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-purple-300">+ - × ÷</kbd> from the on-screen keypad or physical keyboard.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">High Catch Multiplier:</strong> Catching equations high up awards extra score multipliers and builds your fire combo streak.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">3 Energy Shields:</strong> Surviving depends on speed. Each crash loses 1 shield. Reach 0 shields and it's game over!
                </p>
              </div>
            </>
          )}

          {isShifter && (
            <>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">The Goal:</strong> You are given a <strong className="text-cyan-300">Starting Word</strong> (e.g. <span className="font-mono font-bold text-cyan-300">COLD</span>) and a <strong className="text-purple-300">Target Word</strong> (e.g. <span className="font-mono font-bold text-purple-300">WARM</span>).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Type Whole Words & Stack:</strong> Type full 4-letter words that shift <strong className="text-amber-300">EXACTLY ONE letter</strong> from the top of the stack (e.g. <span className="font-mono text-cyan-300">COLD</span> ➔ type <span className="font-mono text-amber-300">CORD</span> ➔ type <span className="font-mono text-amber-300">CARD</span> ➔ type <span className="font-mono text-amber-300">WARD</span> ➔ type <span className="font-mono text-purple-300">WARM</span>).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Word Stacking Tower:</strong> Each valid word stacks onto your tower in real-time. Reach the target goal in minimal stack steps to earn the <strong className="text-amber-300">⭐ Par Master</strong> bonus and extra seconds!
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Helpful Tools:</strong> Use <strong className="text-amber-300">💡 Hint</strong> for next optimal word clues, <strong className="text-cyan-300">📋 Moves</strong> to view all valid 1-letter candidate words, or <strong className="text-slate-300">↺ Undo</strong> to pop the top word off the stack.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Controls:</strong> Type whole words continuously on your physical keyboard (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">A-Z</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Enter</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Backspace</kbd>) or with on-screen QWERTY / 12-key buttons.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow transition-all cursor-pointer ${getButtonBg()}`}
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
