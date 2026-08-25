import { GameHighScores, FallSpeedDifficulty, KeyboardLayoutMode, ShifterDifficulty } from '../types';

class StorageService {
  private readonly WORD_HIGH_SCORE = 'word_rush_high_score';
  private readonly WORD_BEST_STREAK = 'word_rush_best_streak';
  private readonly MATH_HIGH_SCORE = 'math_rush_high_score';
  private readonly MATH_BEST_STREAK = 'math_rush_best_streak';
  private readonly LETTER_FALL_HIGH_SCORE = 'letter_fall_high_score';
  private readonly LETTER_FALL_BEST_STREAK = 'letter_fall_best_streak';
  private readonly LETTER_FALL_DIFF = 'letter_fall_diff';
  private readonly MATH_FALL_HIGH_SCORE = 'math_fall_high_score';
  private readonly MATH_FALL_BEST_STREAK = 'math_fall_best_streak';
  private readonly MATH_FALL_DIFF = 'math_fall_diff';
  private readonly KEYBOARD_LAYOUT = 'letter_fall_keyboard_layout';
  private readonly SHIFTER_HIGH_SCORE = 'word_shifter_high_score';
  private readonly SHIFTER_BEST_STREAK = 'word_shifter_best_streak';
  private readonly SHIFTER_DIFF = 'word_shifter_diff';
  private readonly DIAGONAL_HIGH_SCORE = 'diagonal_word_high_score';
  private readonly DIAGONAL_BEST_STREAK = 'diagonal_word_best_streak';
  private readonly DIAGONAL_DIFF = 'diagonal_word_diff';

  public getHighScores(): GameHighScores {
    try {
      const shifterScore = parseInt(localStorage.getItem(this.SHIFTER_HIGH_SCORE) || localStorage.getItem(this.DIAGONAL_HIGH_SCORE) || '0', 10) || 0;
      const shifterStreak = parseInt(localStorage.getItem(this.SHIFTER_BEST_STREAK) || localStorage.getItem(this.DIAGONAL_BEST_STREAK) || '0', 10) || 0;

      return {
        wordRush: parseInt(localStorage.getItem(this.WORD_HIGH_SCORE) || '0', 10) || 0,
        wordRushStreak: parseInt(localStorage.getItem(this.WORD_BEST_STREAK) || '0', 10) || 0,
        mathRush: parseInt(localStorage.getItem(this.MATH_HIGH_SCORE) || '0', 10) || 0,
        mathRushStreak: parseInt(localStorage.getItem(this.MATH_BEST_STREAK) || '0', 10) || 0,
        letterFall: parseInt(localStorage.getItem(this.LETTER_FALL_HIGH_SCORE) || '0', 10) || 0,
        letterFallStreak: parseInt(localStorage.getItem(this.LETTER_FALL_BEST_STREAK) || '0', 10) || 0,
        mathFall: parseInt(localStorage.getItem(this.MATH_FALL_HIGH_SCORE) || '0', 10) || 0,
        mathFallStreak: parseInt(localStorage.getItem(this.MATH_FALL_BEST_STREAK) || '0', 10) || 0,
        shifter: shifterScore,
        shifterStreak: shifterStreak,
        diagonal: shifterScore,
        diagonalStreak: shifterStreak,
      };
    } catch {
      return { wordRush: 0, wordRushStreak: 0, mathRush: 0, mathRushStreak: 0, letterFall: 0, letterFallStreak: 0, mathFall: 0, mathFallStreak: 0, shifter: 0, shifterStreak: 0, diagonal: 0, diagonalStreak: 0 };
    }
  }

  public saveWordScore(score: number, streak: number): { isNewHighScore: boolean; isNewBestStreak: boolean } {
    const current = this.getHighScores();
    let isNewHighScore = false;
    let isNewBestStreak = false;

    if (score > current.wordRush) {
      try {
        localStorage.setItem(this.WORD_HIGH_SCORE, score.toString());
        isNewHighScore = true;
      } catch {}
    }

    if (streak > current.wordRushStreak) {
      try {
        localStorage.setItem(this.WORD_BEST_STREAK, streak.toString());
        isNewBestStreak = true;
      } catch {}
    }

    return { isNewHighScore, isNewBestStreak };
  }

  public saveMathScore(score: number, streak: number): { isNewHighScore: boolean; isNewBestStreak: boolean } {
    const current = this.getHighScores();
    let isNewHighScore = false;
    let isNewBestStreak = false;

    if (score > current.mathRush) {
      try {
        localStorage.setItem(this.MATH_HIGH_SCORE, score.toString());
        isNewHighScore = true;
      } catch {}
    }

    if (streak > current.mathRushStreak) {
      try {
        localStorage.setItem(this.MATH_BEST_STREAK, streak.toString());
        isNewBestStreak = true;
      } catch {}
    }

    return { isNewHighScore, isNewBestStreak };
  }

  public saveLetterFallScore(score: number, streak: number): { isNewHighScore: boolean; isNewBestStreak: boolean } {
    const current = this.getHighScores();
    let isNewHighScore = false;
    let isNewBestStreak = false;

    if (score > current.letterFall) {
      try {
        localStorage.setItem(this.LETTER_FALL_HIGH_SCORE, score.toString());
        isNewHighScore = true;
      } catch {}
    }

    if (streak > current.letterFallStreak) {
      try {
        localStorage.setItem(this.LETTER_FALL_BEST_STREAK, streak.toString());
        isNewBestStreak = true;
      } catch {}
    }

    return { isNewHighScore, isNewBestStreak };
  }

  public saveMathFallScore(score: number, streak: number): { isNewHighScore: boolean; isNewBestStreak: boolean } {
    const current = this.getHighScores();
    let isNewHighScore = false;
    let isNewBestStreak = false;

    if (score > current.mathFall) {
      try {
        localStorage.setItem(this.MATH_FALL_HIGH_SCORE, score.toString());
        isNewHighScore = true;
      } catch {}
    }

    if (streak > current.mathFallStreak) {
      try {
        localStorage.setItem(this.MATH_FALL_BEST_STREAK, streak.toString());
        isNewBestStreak = true;
      } catch {}
    }

    return { isNewHighScore, isNewBestStreak };
  }

  public saveShifterScore(score: number, streak: number): { isNewHighScore: boolean; isNewBestStreak: boolean } {
    const current = this.getHighScores();
    let isNewHighScore = false;
    let isNewBestStreak = false;

    if (score > current.shifter) {
      try {
        localStorage.setItem(this.SHIFTER_HIGH_SCORE, score.toString());
        localStorage.setItem(this.DIAGONAL_HIGH_SCORE, score.toString());
        isNewHighScore = true;
      } catch {}
    }

    if (streak > current.shifterStreak) {
      try {
        localStorage.setItem(this.SHIFTER_BEST_STREAK, streak.toString());
        localStorage.setItem(this.DIAGONAL_BEST_STREAK, streak.toString());
        isNewBestStreak = true;
      } catch {}
    }

    return { isNewHighScore, isNewBestStreak };
  }

  public saveDiagonalScore(score: number, streak: number): { isNewHighScore: boolean; isNewBestStreak: boolean } {
    return this.saveShifterScore(score, streak);
  }

  public getShifterDifficulty(): ShifterDifficulty {
    try {
      const val = localStorage.getItem(this.SHIFTER_DIFF);
      if (val === 'casual' || val === 'normal' || val === 'master') {
        return val;
      }
    } catch {}
    return 'normal';
  }

  public setShifterDifficulty(diff: ShifterDifficulty): void {
    try {
      localStorage.setItem(this.SHIFTER_DIFF, diff);
    } catch {}
  }

  public getDiagonalDifficulty(): 'gentle' | 'normal' | 'blitz' {
    try {
      const val = localStorage.getItem(this.DIAGONAL_DIFF);
      if (val === 'gentle' || val === 'normal' || val === 'blitz') {
        return val;
      }
    } catch {}
    return 'normal';
  }

  public setDiagonalDifficulty(diff: 'gentle' | 'normal' | 'blitz'): void {
    try {
      localStorage.setItem(this.DIAGONAL_DIFF, diff);
    } catch {}
  }

  public getLetterFallDifficulty(): FallSpeedDifficulty {
    try {
      const val = localStorage.getItem(this.LETTER_FALL_DIFF);
      if (val === 'gentle' || val === 'normal' || val === 'turbo') {
        return val;
      }
    } catch {}
    return 'normal';
  }

  public setLetterFallDifficulty(diff: FallSpeedDifficulty): void {
    try {
      localStorage.setItem(this.LETTER_FALL_DIFF, diff);
    } catch {}
  }

  public getMathFallDifficulty(): FallSpeedDifficulty {
    try {
      const val = localStorage.getItem(this.MATH_FALL_DIFF);
      if (val === 'gentle' || val === 'normal' || val === 'turbo') {
        return val;
      }
    } catch {}
    return 'normal';
  }

  public setMathFallDifficulty(diff: FallSpeedDifficulty): void {
    try {
      localStorage.setItem(this.MATH_FALL_DIFF, diff);
    } catch {}
  }

  public getKeyboardLayout(): KeyboardLayoutMode {
    try {
      const val = localStorage.getItem(this.KEYBOARD_LAYOUT);
      if (val === 'qwerty' || val === 'compact12') {
        return val;
      }
    } catch {}
    return 'qwerty';
  }

  public setKeyboardLayout(layout: KeyboardLayoutMode): void {
    try {
      localStorage.setItem(this.KEYBOARD_LAYOUT, layout);
    } catch {}
  }
}

export const storageService = new StorageService();

