/**
 * Build progressive hint strings for a word.
 *
 * Progression: length → first letter → first sound (if different) → last letter → random interior
 * Each hint is a spaced string like "J _ _ _ _ _ i"
 */
export function buildHints(answer: string, firstSound?: string): string[] {
  const letters = [...answer];
  const len = letters.length;
  const revealed = new Array<boolean>(len).fill(false);
  const hints: string[] = [];

  const snap = () => letters.map((ch, i) => revealed[i] ? ch : '_').join(' ');

  // 1. Length only (all blanks)
  hints.push(snap());

  // 2. First letter
  revealed[0] = true;
  hints.push(snap());

  // 3. First sound (if it's a digraph/trigraph beyond the first letter)
  if (firstSound && firstSound.length > 1) {
    const soundLen = firstSound.length;
    // Reveal characters covered by the first sound
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
