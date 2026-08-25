import { MathProblem, FallingMathChallenge, FallSpeedDifficulty } from '../types';

/**
 * MathService
 * Generates arithmetic problems with progressive difficulty and validation.
 */
class MathService {
  public generateProblem(score: number): MathProblem {
    // Choose operators based on score
    const operators: Array<'+' | '-' | '×' | '÷'> = ['+', '-'];
    if (score >= 5) operators.push('×');
    if (score >= 10) operators.push('÷');

    const op = operators[Math.floor(Math.random() * operators.length)];

    let num1 = 1;
    let num2 = 1;
    let answer = 0;

    switch (op) {
      case '+': {
        const max = score > 15 ? 40 : score > 8 ? 25 : 15;
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * max) + 1;
        answer = num1 + num2;
        break;
      }
      case '-': {
        const max = score > 15 ? 45 : score > 8 ? 25 : 15;
        num1 = Math.floor(Math.random() * max) + 5;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      }
      case '×': {
        const max = score > 15 ? 12 : 9;
        num1 = Math.floor(Math.random() * max) + 2;
        num2 = Math.floor(Math.random() * max) + 2;
        answer = num1 * num2;
        break;
      }
      case '÷': {
        const max = score > 15 ? 12 : 9;
        num2 = Math.floor(Math.random() * max) + 2;
        answer = Math.floor(Math.random() * max) + 2;
        num1 = num2 * answer;
        break;
      }
    }

    return {
      num1,
      num2,
      operator: op,
      answer,
      displayText: `${num1} ${op} ${num2}`,
    };
  }

  public generateMathFallChallenge(difficulty: FallSpeedDifficulty): FallingMathChallenge {
    const operators: Array<'+' | '-' | '×' | '÷'> = ['+', '-'];
    if (difficulty === 'normal' || difficulty === 'turbo') {
      operators.push('×', '÷');
    }

    const op = operators[Math.floor(Math.random() * operators.length)];
    let left = 1;
    let right = 1;
    let result = 2;

    if (difficulty === 'gentle') {
      switch (op) {
        case '+':
          left = Math.floor(Math.random() * 15) + 1;
          right = Math.floor(Math.random() * 15) + 1;
          result = left + right;
          break;
        case '-':
          left = Math.floor(Math.random() * 20) + 5;
          right = Math.floor(Math.random() * (left - 1)) + 1;
          result = left - right;
          break;
        case '×':
          left = Math.floor(Math.random() * 8) + 2;
          right = Math.floor(Math.random() * 8) + 2;
          result = left * right;
          break;
        case '÷':
          right = Math.floor(Math.random() * 8) + 2;
          result = Math.floor(Math.random() * 8) + 2;
          left = right * result;
          break;
      }
    } else if (difficulty === 'normal') {
      switch (op) {
        case '+':
          left = Math.floor(Math.random() * 45) + 5;
          right = Math.floor(Math.random() * 45) + 5;
          result = left + right;
          break;
        case '-':
          left = Math.floor(Math.random() * 60) + 15;
          right = Math.floor(Math.random() * (left - 5)) + 3;
          result = left - right;
          break;
        case '×':
          left = Math.floor(Math.random() * 11) + 2;
          right = Math.floor(Math.random() * 11) + 2;
          result = left * right;
          break;
        case '÷':
          right = Math.floor(Math.random() * 11) + 2;
          result = Math.floor(Math.random() * 12) + 2;
          left = right * result;
          break;
      }
    } else {
      // Turbo mode: rapid double-digit arithmetic
      switch (op) {
        case '+':
          left = Math.floor(Math.random() * 75) + 10;
          right = Math.floor(Math.random() * 75) + 10;
          result = left + right;
          break;
        case '-':
          left = Math.floor(Math.random() * 90) + 20;
          right = Math.floor(Math.random() * (left - 10)) + 5;
          result = left - right;
          break;
        case '×':
          left = Math.floor(Math.random() * 14) + 3;
          right = Math.floor(Math.random() * 12) + 3;
          result = left * right;
          break;
        case '÷':
          right = Math.floor(Math.random() * 14) + 2;
          result = Math.floor(Math.random() * 15) + 3;
          left = right * result;
          break;
      }
    }

    // Decide missing part
    // 65% chance missing result, 15% missing operator, 10% missing left, 10% missing right
    const rand = Math.random();
    let missingPart: 'result' | 'operator' | 'left' | 'right' = 'result';
    if (rand < 0.65) {
      missingPart = 'result';
    } else if (rand < 0.80) {
      missingPart = 'operator';
    } else if (rand < 0.90) {
      missingPart = 'left';
    } else {
      missingPart = 'right';
    }

    let correctAnswer = '';
    let displayLeft = left.toString();
    let displayOp: string = op;
    let displayRight = right.toString();
    let displayResult = result.toString();
    let displayText = '';

    switch (missingPart) {
      case 'result':
        correctAnswer = result.toString();
        displayResult = '?';
        displayText = `${left} ${op} ${right} = ?`;
        break;
      case 'operator':
        correctAnswer = op;
        displayOp = '?';
        displayText = `${left} ? ${right} = ${result}`;
        break;
      case 'left':
        correctAnswer = left.toString();
        displayLeft = '?';
        displayText = `? ${op} ${right} = ${result}`;
        break;
      case 'right':
        correctAnswer = right.toString();
        displayRight = '?';
        displayText = `${left} ${op} ? = ${result}`;
        break;
    }

    return {
      id: `mathfall-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      leftNum: left,
      operator: op,
      rightNum: right,
      result,
      missingPart,
      displayText,
      correctAnswer,
      displayLeft,
      displayOp,
      displayRight,
      displayResult,
    };
  }
}

export const mathService = new MathService();
