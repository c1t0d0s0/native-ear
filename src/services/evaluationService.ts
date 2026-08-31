import { DiffToken, EvaluationResult } from '../types';

const WORD_TO_NUMBER_MAP: Record<string, string> = {
  // Cardinals
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  eleven: '11',
  twelve: '12',
  thirteen: '13',
  fourteen: '14',
  fifteen: '15',
  sixteen: '16',
  seventeen: '17',
  eighteen: '18',
  nineteen: '19',
  twenty: '20',
  thirty: '30',
  forty: '40',
  fifty: '50',
  sixty: '60',
  seventy: '70',
  eighty: '80',
  ninety: '90',
  hundred: '100',
  thousand: '1000',
  million: '1000000',

  // Ordinals
  first: '1st',
  second: '2nd',
  third: '3rd',
  fourth: '4th',
  fifth: '5th',
  sixth: '6th',
  seventh: '7th',
  eighth: '8th',
  ninth: '9th',
  tenth: '10th',
  eleventh: '11th',
  twelfth: '12th',
  thirteenth: '13th',
  fourteenth: '14th',
  fifteenth: '15th',
  sixteenth: '16th',
  seventeenth: '17th',
  eighteenth: '18th',
  nineteenth: '19th',
  twentieth: '20th',
  thirtieth: '30th',
  fortieth: '40th',
  fiftieth: '50th',
  sixtieth: '60th',
  seventieth: '70th',
  eightieth: '80th',
  ninetieth: '90th',
  hundredth: '100th',
};

export class EvaluationService {
  /**
   * Cleans a single token for comparison
   */
  public static cleanWord(word: string, strictPunctuation: boolean): string {
    if (strictPunctuation) {
      return word.trim();
    }
    // Remove punctuation around words, keep internal apostrophes (e.g. don't, o'clock)
    return word
      .toLowerCase()
      .replace(/^[^\w\d']+|[^\w\d']+$/g, '')
      .replace(/[.,!?;:"()[\]{}]/g, '')
      .trim();
  }

  /**
   * Normalizes number words (e.g. "four" -> "4", "twenty-one" -> "21")
   */
  public static normalizeWordForComparison(word: string, strictPunctuation: boolean): string {
    const cleaned = this.cleanWord(word, strictPunctuation);
    if (strictPunctuation) {
      return cleaned;
    }

    if (WORD_TO_NUMBER_MAP[cleaned]) {
      return WORD_TO_NUMBER_MAP[cleaned];
    }

    // Compound numbers e.g. twenty-four -> 24
    if (cleaned.includes('-')) {
      const parts = cleaned.split('-');
      if (parts.length === 2) {
        const tens = WORD_TO_NUMBER_MAP[parts[0]];
        const units = WORD_TO_NUMBER_MAP[parts[1]];
        if (tens && units && /^\d+$/.test(tens)) {
          if (/^\d+$/.test(units)) {
            return String(parseInt(tens, 10) + parseInt(units, 10));
          } else if (/^(\d+)(st|nd|rd|th)$/.test(units)) {
            const uNum = units.replace(/(st|nd|rd|th)/, '');
            const suffix = units.match(/(st|nd|rd|th)/)?.[0] || '';
            return `${parseInt(tens, 10) + parseInt(uNum, 10)}${suffix}`;
          }
        }
      }
    }

    return cleaned;
  }

  /**
   * Checks if two words are equal, taking into account number word equivalences
   * (e.g. "four" and "4", "fourth" and "4th", "21" and "twenty-one")
   */
  public static areWordsEqual(wordA: string, wordB: string, strictPunctuation = false): boolean {
    const cleanA = this.cleanWord(wordA, strictPunctuation);
    const cleanB = this.cleanWord(wordB, strictPunctuation);

    if (cleanA === cleanB) {
      return true;
    }

    if (strictPunctuation) {
      return false;
    }

    const normA = this.normalizeWordForComparison(cleanA, false);
    const normB = this.normalizeWordForComparison(cleanB, false);

    if (normA === normB) {
      return true;
    }

    // Ordinal to cardinal flexible match for voice recognition (e.g. "4th" and "4")
    const stripOrdinal = (s: string) => s.replace(/(st|nd|rd|th)$/i, '');
    if (stripOrdinal(normA) === stripOrdinal(normB) && /^\d+$/.test(stripOrdinal(normA))) {
      return true;
    }

    return false;
  }

  /**
   * Tokenizes text into word array
   */
  public static tokenize(text: string): string[] {
    return text.trim().split(/\s+/).filter(w => w.length > 0);
  }

  /**
   * Generates diff tokens comparing expected text and submitted text
   */
  public static evaluate(
    expectedText: string,
    submittedText: string,
    strictPunctuation = false
  ): EvaluationResult {
    const expectedTokens = this.tokenize(expectedText);
    const submittedTokens = this.tokenize(submittedText);

    const m = expectedTokens.length;
    const n = submittedTokens.length;

    // DP Table for LCS (Longest Common Subsequence) alignment
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (this.areWordsEqual(expectedTokens[i - 1], submittedTokens[j - 1], strictPunctuation)) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to build diff tokens
    let i = m;
    let j = n;
    const reversedTokens: DiffToken[] = [];
    let correctCount = 0;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        if (this.areWordsEqual(expectedTokens[i - 1], submittedTokens[j - 1], strictPunctuation)) {
          reversedTokens.push({
            type: 'correct',
            expected: expectedTokens[i - 1],
            actual: submittedTokens[j - 1],
            text: expectedTokens[i - 1]
          });
          correctCount++;
          i--;
          j--;
          continue;
        }
      }

      if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        // Extra word typed by user
        reversedTokens.push({
          type: 'extra',
          actual: submittedTokens[j - 1],
          text: submittedTokens[j - 1]
        });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        // Missing word from expected
        reversedTokens.push({
          type: 'missing',
          expected: expectedTokens[i - 1],
          text: expectedTokens[i - 1]
        });
        i--;
      }
    }

    const tokens = reversedTokens.reverse();

    // Post-process to group consecutive (missing, extra) as (wrong) for better UX
    const mergedTokens: DiffToken[] = [];
    for (let k = 0; k < tokens.length; k++) {
      const current = tokens[k];
      const next = tokens[k + 1];

      if (current.type === 'missing' && next && next.type === 'extra') {
        mergedTokens.push({
          type: 'wrong',
          expected: current.expected,
          actual: next.actual,
          text: `${next.actual} → ${current.expected}`
        });
        k++; // skip next
      } else if (current.type === 'extra' && next && next.type === 'missing') {
        mergedTokens.push({
          type: 'wrong',
          expected: next.expected,
          actual: current.actual,
          text: `${current.actual} → ${next.expected}`
        });
        k++; // skip next
      } else {
        mergedTokens.push(current);
      }
    }

    const totalExpectedWords = expectedTokens.length;
    const extraTokensCount = mergedTokens.filter(t => t.type === 'extra').length;
    const score = totalExpectedWords === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(((correctCount - extraTokensCount * 0.5) / totalExpectedWords) * 100)
          )
        );

    const isExactMatch = score === 100 && submittedTokens.length === expectedTokens.length && extraTokensCount === 0;

    return {
      isExactMatch,
      score,
      tokens: mergedTokens,
      totalExpectedWords,
      correctWordsCount: correctCount,
      submittedText,
      originalText: expectedText
    };
  }
}
