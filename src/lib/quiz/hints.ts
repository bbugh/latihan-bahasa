/**
 * Build an ordered array of progressive hint strings that gradually reveal
 * the answer one letter at a time. Each hint is a space-separated string
 * where unrevealed letters are shown as underscores (e.g. `"J _ _ _ _ _ i"`).
 *
 * Revelation order:
 * 1. All blanks (shows word length only)
 * 2. First letter
 * 3. First sound — only if `firstSound` is a multi-character digraph/trigraph
 *    (e.g. "Ch", "Ng"), revealing the additional characters beyond the first letter
 * 4. Last letter
 * 5. Remaining interior letters in random order, one per hint
 *
 * @param answer - The full answer string to generate hints for.
 * @param firstSound - Optional multi-character opening sound (e.g. "Ch" for
 *   "Chair"). Ignored if it's a single character since step 2 already covers it.
 * @returns Array of hint strings from least to most revealed.
 */
export function buildHints(answer: string, firstSound?: string): string[] {
  const letters = [...answer];
  const len = letters.length;
  const revealed = new Array<boolean>(len).fill(false);
  const hints: string[] = [];

  // Spaces are always visible — mark them as revealed immediately
  for (let i = 0; i < len; i++) {
    if (letters[i] === ' ') revealed[i] = true;
  }

  // Render hint: revealed chars show as-is, unrevealed as '_'.
  // Spaces render as double-space to visually separate words.
  const snap = () => letters.map((ch, i) => {
    if (ch === ' ') return ' ';
    return revealed[i] ? ch : '_';
  }).join(' ');

  // 1. Length only (all blanks, spaces visible)
  hints.push(snap());

  // 2. First letter
  revealed[0] = true;
  hints.push(snap());

  // 3. First sound (if it's a digraph/trigraph beyond the first letter)
  if (firstSound && firstSound.length > 1) {
    const soundLen = firstSound.length;
    for (let i = 1; i < soundLen && i < len; i++) {
      revealed[i] = true;
    }
    hints.push(snap());
  }

  // 4. Last letter (skip if already revealed, e.g. single-letter word)
  if (len > 1 && !revealed[len - 1]) {
    revealed[len - 1] = true;
    hints.push(snap());
  }

  // 5. Random interior letters, one at a time
  const unrevealed: number[] = [];
  for (let i = 0; i < len; i++) {
    if (!revealed[i]) unrevealed.push(i);
  }
  shuffle(unrevealed);

  for (const idx of unrevealed) {
    revealed[idx] = true;
    hints.push(snap());
  }

  return hints;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
