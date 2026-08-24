import { DiffToken, EvaluationResult } from '../types';

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
        const expClean = this.cleanWord(expectedTokens[i - 1], strictPunctuation);
        const subClean = this.cleanWord(submittedTokens[j - 1], strictPunctuation);

        if (expClean === subClean) {
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
        const expClean = this.cleanWord(expectedTokens[i - 1], strictPunctuation);
        const subClean = this.cleanWord(submittedTokens[j - 1], strictPunctuation);

        if (expClean === subClean) {
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
        // Check if previous was missing to merge as 'wrong' substitution
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
