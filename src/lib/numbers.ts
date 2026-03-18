const ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
const SCALES = ['', 'ribu', 'juta', 'miliar', 'triliun', 'kuadriliun'];

export function numberToIndonesian(x: number): string {
  if (!x) return 'nol';

  const parts: string[] = [];

  for (let scale = 0; x; scale++) {
    let group = x % 1e3;
    if (group === 1 && scale === 1) {
      parts.unshift('seribu');
    } else if (group) {
      const chunk: string[] = group > 99
        ? [(group > 199 ? ONES[(group / 100) | 0] + ' ' : 'se') + 'ratus']
        : [];
      if ((group %= 100)) {
        if (group > 9 && group < 20)
          chunk.push(group < 11 ? 'sepuluh' : (group < 12 ? 'se' : ONES[group % 10] + ' ') + 'belas');
        else {
          if (group > 19) chunk.push(ONES[(group / 10) | 0] + ' puluh');
          if ((group %= 10)) chunk.push(ONES[group]);
        }
      }
      if (scale) chunk.push(SCALES[scale]);
      parts.unshift(chunk.join(' '));
    }
    x = Math.floor(x / 1e3);
  }

  return parts.join(' ');
}

export function indonesianToNumber(text: string): number | null {
  const normalized = text.trim().toLowerCase()
    .replace(/\bse(?=puluh|belas|ratus|ribu)/g, 'satu ');

  if (!normalized) return null;
  if (normalized === 'nol') return 0;

  let total = 0;
  let group = 0;
  let current = 0;

  for (const word of normalized.split(/\s+/)) {
    const digit = ONES.indexOf(word);
    if (digit > 0) {
      current = digit;
    } else if (word === 'belas') {
      group += current + 10;
      current = 0;
    } else if (word === 'puluh') {
      group += current * 10;
      current = 0;
    } else if (word === 'ratus') {
      group += current * 100;
      current = 0;
    } else if (word === 'ribu') {
      total += (group + current || 1) * 1_000;
      group = current = 0;
    } else if (word === 'juta') {
      total += (group + current || 1) * 1_000_000;
      group = current = 0;
    } else if (word === 'miliar') {
      total += (group + current || 1) * 1_000_000_000;
      group = current = 0;
    } else {
      return null;
    }
  }

  return total + group + current;
}

// -- Answer checking with feedback --

const ALL_WORDS = new Set([
  'nol', ...ONES.filter(Boolean),
  'belas', 'puluh', 'ratus',
  ...SCALES.filter(Boolean),
  'sepuluh', 'sebelas', 'seratus', 'seribu',
]);

const SE_FORMS: Record<string, string> = {
  'satu puluh': 'sepuluh',
  'satu belas': 'sebelas',
  'satu ratus': 'seratus',
  'satu ribu': 'seribu',
};

export interface CheckResult {
  correct: boolean;
  errors: string[];
  warnings: string[];
}

export function checkAnswer(expected: number, input: string): CheckResult {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return { correct: false, errors: ['No answer given'], warnings: [] };

  const expectedText = numberToIndonesian(expected);
  const words = trimmed.split(/\s+/);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for unrecognized words and suggest corrections
  for (const word of words) {
    if (ALL_WORDS.has(word)) continue;
    const closest = findClosest(word);
    if (closest) {
      errors.push(`"${word}" is not a number word — did you mean "${closest}"?`);
    } else {
      errors.push(`"${word}" is not a number word`);
    }
  }

  if (errors.length > 0) return { correct: false, errors, warnings };

  // All words are valid — check if the answer is correct
  const parsed = indonesianToNumber(trimmed);

  if (parsed === expected) {
    // Correct, but check for non-canonical "satu X" forms
    for (const [nonCanonical, canonical] of Object.entries(SE_FORMS)) {
      if (trimmed.includes(nonCanonical)) {
        warnings.push(`Correct, but use "${canonical}" instead of "${nonCanonical}"`);
      }
    }
    return { correct: true, errors: [], warnings };
  }

  // Wrong answer with valid words — say which words are wrong without revealing the answer
  const expectedWords = expectedText.split(' ');
  const inputWords = trimmed.split(/\s+/);
  const maxLen = Math.max(expectedWords.length, inputWords.length);

  for (let i = 0; i < maxLen; i++) {
    if (i >= inputWords.length) {
      errors.push('Missing words at the end');
      break;
    } else if (i >= expectedWords.length) {
      errors.push(`Unexpected extra word "${inputWords[i]}"`);
    } else if (inputWords[i] !== expectedWords[i]) {
      errors.push(`"${inputWords[i]}" is wrong`);
    }
  }

  if (errors.length === 0) {
    errors.push('Not quite right');
  }

  return { correct: false, errors, warnings };
}

function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
  return d[m][n];
}

function findClosest(word: string): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const candidate of ALL_WORDS) {
    const dist = editDistance(word, candidate);
    if (dist < bestDist) { bestDist = dist; best = candidate; }
  }
  return best && bestDist <= Math.ceil(best.length / 2) ? best : null;
}
