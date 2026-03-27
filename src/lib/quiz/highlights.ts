/**
 * Convert word-level error indices into character-level `[start, end)` ranges
 * for highlighting in the input field. Walks the input string splitting on
 * spaces and maps each wrong word index to its character boundaries.
 *
 * @param input - The user's raw input string (may contain multiple spaces).
 * @param wrongIndices - Zero-based indices of words that are wrong.
 * @returns Character ranges suitable for {@link QuizCheckResult.wrongSpans}.
 */
export function wordErrorHighlightRanges(input: string, wrongIndices: number[]): [number, number][] {
  if (wrongIndices.length === 0) return [];
  const wrongSet = new Set(wrongIndices);
  const ranges: [number, number][] = [];
  let wordIndex = 0;
  let i = 0;
  while (i < input.length) {
    if (input[i] === ' ') {
      i++;
    } else {
      const start = i;
      while (i < input.length && input[i] !== ' ') i++;
      if (wrongSet.has(wordIndex)) ranges.push([start, i]);
      wordIndex++;
    }
  }
  return ranges;
}

/**
 * Convert wrong digit positions into character-level `[start, end)` ranges
 * for highlighting in the input field. Each digit is one character wide.
 *
 * @param wrongDigits - Objects with a `position` indicating the zero-based
 *   character index of each wrong digit.
 * @returns Character ranges suitable for {@link QuizCheckResult.wrongSpans}.
 */
export function digitErrorHighlightRanges(wrongDigits: { position: number }[]): [number, number][] {
  return wrongDigits.map(d => [d.position, d.position + 1]);
}
