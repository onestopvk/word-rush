import { MathProblem } from '../types';

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
}

export const mathService = new MathService();
