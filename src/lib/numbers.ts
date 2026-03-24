import { editDistance } from './edit-distance';

const ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
const SCALES = ['', 'ribu', 'juta', 'miliar', 'triliun', 'kuadriliun'];

export interface PracticeNumberOptions {
  maxDigits?: number;
  zeroWeight?: number;
}

export function randomPracticeNumber(options: PracticeNumberOptions = {}): number {
  const maxDigits = options.maxDigits ?? 4;
  const zeroWeight = options.zeroWeight ?? 4;

  // Pick how many digits (1 to maxDigits)
  const digitCounts = Array.from({ length: maxDigits }, (_, i) => i + 1);
  const numDigits = digitCounts[Math.floor(Math.random() * digitCounts.length)];

  if (numDigits === 1) {
    return Math.floor(Math.random() * 10);
  }

  // Build digit by digit. First digit is 1-9, rest are 0-9 with zero weighted.
  // zeroWeight is a multiplier: 1 = uniform, 3 = zero is 3x more likely than other digits
  const zeroProbability = zeroWeight / (zeroWeight + 9);
  const digits: number[] = [Math.floor(Math.random() * 9) + 1];
  for (let i = 1; i < numDigits; i++) {
    if (Math.random() < zeroProbability) {
      digits.push(0);
    } else {
      digits.push(Math.floor(Math.random() * 9) + 1);
    }
  }

  return Number(digits.join(''));
}

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
  wrongIndices: number[];
}

export function checkAnswer(expected: number, input: string): CheckResult {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return { correct: false, errors: ['No answer given'], warnings: [], wrongIndices: [] };

  const expectedText = numberToIndonesian(expected);
  const words = trimmed.split(/\s+/);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for unrecognized words and suggest corrections
  const wrongIndices: number[] = [];
  for (let i = 0; i < words.length; i++) {
    if (ALL_WORDS.has(words[i])) continue;
    wrongIndices.push(i);
    const closest = findClosest(words[i]);
    if (closest) {
      errors.push(`"${words[i]}" is not a number word — did you mean "${closest}"?`);
    } else {
      errors.push(`"${words[i]}" is not a number word`);
    }
  }

  // If all words are valid, check if the answer is correct
  if (errors.length === 0) {
    const parsed = indonesianToNumber(trimmed);

    if (parsed === expected) {
      // Correct, but check for non-canonical "satu X" forms
      for (const [nonCanonical, canonical] of Object.entries(SE_FORMS)) {
        if (trimmed.includes(nonCanonical)) {
          warnings.push(`Correct, but use "${canonical}" instead of "${nonCanonical}"`);
        }
      }
      return { correct: true, errors: [], warnings, wrongIndices: [] };
    }
  }

  // Wrong answer — also check which valid words are in wrong positions
  const expectedWords = expectedText.split(' ');
  const inputWords = trimmed.split(/\s+/);
  const maxLen = Math.max(expectedWords.length, inputWords.length);

  for (let i = 0; i < maxLen; i++) {
    if (wrongIndices.includes(i)) continue; // already marked as misspelled
    if (i >= inputWords.length) {
      errors.push('Missing words at the end');
      break;
    } else if (i >= expectedWords.length) {
      wrongIndices.push(i);
      errors.push(`Unexpected extra word "${inputWords[i]}"`);
    } else if (inputWords[i] !== expectedWords[i]) {
      wrongIndices.push(i);
      errors.push(`"${inputWords[i]}" is wrong`);
    }
  }

  if (errors.length === 0) {
    errors.push('Not quite right');
  }

  return { correct: false, errors, warnings, wrongIndices };
}

export interface WrongDigit {
  position: number;
  word: string;
}

export interface NumberCheckResult {
  correct: boolean;
  errors: string[];
  wrongDigits: WrongDigit[];
}

// Maps each digit of a number to the Indonesian word it comes from.
// For digits that are zero (no corresponding word), returns an empty string.
// e.g. 4679 → ['empat', 'enam', 'tujuh', 'sembilan']
// e.g. 7804 → ['tujuh', 'delapan', '', 'empat']
function digitWords(n: number): string[] {
  if (n === 0) return ['nol'];

  const str = String(n);
  const result: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const d = Number(str[i]);
    if (d === 0) {
      result.push('');
    } else if (d === 1) {
      // Check context for "se-" forms
      const posFromRight = str.length - 1 - i;
      if (posFromRight === 3) result.push('seribu');
      else if (posFromRight === 2) result.push('seratus');
      else if (posFromRight === 1) {
        // teens: the tens and ones digit both come from the teen word
        const ones = Number(str[i + 1]);
        const word = ones === 0 ? 'sepuluh' : ones === 1 ? 'sebelas' : ONES[ones] + ' belas';
        result.push(word);
        result.push(word);
        i++; // skip the ones digit, already handled
      } else {
        result.push(ONES[d]);
      }
    } else {
      const posFromRight = str.length - 1 - i;
      if (posFromRight === 1) {
        // tens place: this digit + "puluh", and handle the ones digit
        result.push(ONES[d] + ' puluh');
      } else {
        result.push(ONES[d]);
      }
    }
  }

  return result;
}

export function checkNumberAnswer(indonesianText: string, input: string): NumberCheckResult {
  const empty: WrongDigit[] = [];
  const trimmed = input.trim().replace(/[,\.]/g, '');
  if (!trimmed) return { correct: false, errors: ['No answer given'], wrongDigits: empty };

  const num = Number(trimmed);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { correct: false, errors: ['Enter a valid number'], wrongDigits: empty };
  }

  const expected = indonesianToNumber(indonesianText);
  if (expected === null) return { correct: false, errors: ['Invalid question'], wrongDigits: empty };

  if (num === expected) return { correct: true, errors: [], wrongDigits: empty };

  const expectedStr = String(expected);
  const inputStr = String(num);

  if (expectedStr.length !== inputStr.length) {
    return { correct: false, errors: [`Expected a ${expectedStr.length}-digit number`], wrongDigits: empty };
  }

  // Compare digit by digit, mapping each digit back to its Indonesian word
  const dw = digitWords(expected);
  const wrongDigits: WrongDigit[] = [];

  for (let i = 0; i < expectedStr.length; i++) {
    if (inputStr[i] !== expectedStr[i]) {
      wrongDigits.push({ position: i, word: dw[i] || '' });
    }
  }

  const errors = wrongDigits.map(d =>
    d.word ? `"${d.word}" is not ${inputStr[d.position]}` : `Digit ${d.position + 1} is wrong`
  );

  return { correct: false, errors, wrongDigits };
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
