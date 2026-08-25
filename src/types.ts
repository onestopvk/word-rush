export type GameMode = 'word' | 'math' | 'letterfall' | 'shifter' | 'diagonal';

export type WordDifficulty = 'easy' | 'medium' | 'hard';
export type FallSpeedDifficulty = 'gentle' | 'normal' | 'turbo';
export type ShifterDifficulty = 'casual' | 'normal' | 'master';
export type KeyboardLayoutMode = 'qwerty' | 'compact12';

export interface WordDifficultyConfig {
  name: WordDifficulty;
  label: string;
  initialTime: number; // seconds
  bonusTime: number;   // seconds
  pointsPerWord: number;
}

export interface FallDifficultyConfig {
  name: FallSpeedDifficulty;
  label: string;
  baseFallDuration: number; // in seconds to hit bottom
  pointsPerSolve: number;
}

export interface ShifterDifficultyConfig {
  name: ShifterDifficulty;
  label: string;
  initialTime: number;
  stepBonusTime: number;
  ladderBonusTime: number;
  minStepsTarget: number;
  maxStepsTarget: number;
  description: string;
}

export interface DiagonalDifficultyConfig {
  name: 'gentle' | 'normal' | 'blitz';
  label: string;
  initialTime: number;
  rowBonusTime: number;
  boardBonusTime: number;
  description: string;
}

export interface LetterTile {
  id: number;
  letter: string;
  isUsed: boolean;
}

export interface FallingWordChallenge {
  targetWord: string;
  fixedIndices: number[]; // indices where letters are pre-placed (e.g. [0, 3] for L _ _ E)
  fixedLetters: (string | null)[]; // e.g. ['L', null, null, 'E']
  allValidAnswers: string[];
}

export interface ShifterChallenge {
  startWord: string;
  targetWord: string;
  minSteps: number; // Shortest path length (optimal par)
  optimalPath: string[]; // e.g. ['COLD', 'CORD', 'CARD', 'WARD', 'WARM']
  category?: string;
}

export interface DiagonalChallenge {
  targetWord: string;
  rowPatterns: (string | null)[][]; // 4 rows, each with 1 fixed diagonal letter
  possibleWordCounts: number[];
}

export interface MathProblem {
  num1: number;
  num2: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  displayText: string;
}

export interface GameHighScores {
  wordRush: number;
  wordRushStreak: number;
  mathRush: number;
  mathRushStreak: number;
  letterFall: number;
  letterFallStreak: number;
  shifter: number;
  shifterStreak: number;
  diagonal: number;
  diagonalStreak: number;
}

export interface ArcadeGameInfo {
  id: GameMode;
  name: string;
  category: string;
  tagline: string;
  icon: string;
  themeColor: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'purple';
  isReady: boolean;
}

