import type { QuizCheckResult, QuizDefinition, QuizPrompt } from '../quiz/definition';
import { wordErrorHighlightRanges, digitErrorHighlightRanges } from '../quiz/highlights';

// -- Constants --

const ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
const SCALES = ['', 'ribu', 'juta', 'miliar', 'triliun', 'kuadriliun'];

// -- Number generation --

interface PracticeNumberOptions {
  maxDigits?: number;
  zeroWeight?: number;
}

export function randomPracticeNumber(options: PracticeNumberOptions = {}): number {
  const maxDigits = options.maxDigits ?? 4;
  const zeroWeight = options.zeroWeight ?? 4;

  const digitCounts = Array.from({ length: maxDigits }, (_, i) => i + 1);
  const numDigits = digitCounts[Math.floor(Math.random() * digitCounts.length)];

  if (numDigits === 1) {
    return Math.floor(Math.random() * 10);
  }

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

// -- Conversion --

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

// -- Answer checking --

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

interface CheckResult {
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

  const wrongIndices: number[] = [];
  for (let i = 0; i < words.length; i++) {
    if (ALL_WORDS.has(words[i])) continue;
    wrongIndices.push(i);
    errors.push(`"${words[i]}" is not a number word`);
  }

  if (errors.length === 0) {
    const parsed = indonesianToNumber(trimmed);

    if (parsed === expected) {
      for (const [nonCanonical, canonical] of Object.entries(SE_FORMS)) {
        if (trimmed.includes(nonCanonical)) {
          warnings.push(`Correct, but use "${canonical}" instead of "${nonCanonical}"`);
        }
      }
      return { correct: true, errors: [], warnings, wrongIndices: [] };
    }
  }

  const expectedWords = expectedText.split(' ');
  const inputWords = trimmed.split(/\s+/);
  const maxLen = Math.max(expectedWords.length, inputWords.length);

  for (let i = 0; i < maxLen; i++) {
    if (wrongIndices.includes(i)) continue;
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

interface WrongDigit {
  position: number;
  word: string;
}

interface NumberCheckResult {
  correct: boolean;
  errors: string[];
  wrongDigits: WrongDigit[];
}

function digitWords(n: number): string[] {
  if (n === 0) return ['nol'];

  const str = String(n);
  const result: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const d = Number(str[i]);
    if (d === 0) {
      result.push('');
    } else if (d === 1) {
      const posFromRight = str.length - 1 - i;
      if (posFromRight === 3) result.push('seribu');
      else if (posFromRight === 2) result.push('seratus');
      else if (posFromRight === 1) {
        const ones = Number(str[i + 1]);
        const word = ones === 0 ? 'sepuluh' : ones === 1 ? 'sebelas' : ONES[ones] + ' belas';
        result.push(word);
        result.push(word);
        i++;
      } else {
        result.push(ONES[d]);
      }
    } else {
      const posFromRight = str.length - 1 - i;
      if (posFromRight === 1) {
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

// -- Quiz definitions --

export const numbersToWords: QuizDefinition = {
  slug: 'numbers-to-words',
  title: 'Numbers \u2192 Words',
  description: 'See a number, type the Indonesian',
  category: 'Numbers',
  instruction: 'Type the Indonesian words for this number',
  promptStyle: 'number',
  inputMode: 'text',
  placeholder: 'Type Indonesian here...',
  generate(previous?: QuizPrompt): QuizPrompt {
    let number: number;
    do {
      number = randomPracticeNumber();
    } while (previous && String(number) === previous.prompt.replace(/,/g, ''));

    return {
      prompt: number.toLocaleString(),
      answer: numberToIndonesian(number),
    };
  },
  check(expected: string, input: string): QuizCheckResult {
    const number = indonesianToNumber(expected)!;
    const result = checkAnswer(number, input);
    return {
      correct: result.correct,
      errors: result.errors,
      warnings: result.warnings,
      wrongSpans: wordErrorHighlightRanges(input.trim().toLowerCase(), result.wrongIndices),
    };
  },
};

export const wordsToNumbers: QuizDefinition = {
  slug: 'words-to-numbers',
  title: 'Words \u2192 Numbers',
  description: 'See Indonesian words, type the number',
  category: 'Numbers',
  instruction: 'Type the number for these Indonesian words',
  promptStyle: 'text',
  inputMode: 'numeric',
  placeholder: 'Type the number...',
  generate(previous?: QuizPrompt): QuizPrompt {
    let number: number;
    do {
      number = randomPracticeNumber();
    } while (previous && numberToIndonesian(number) === previous.prompt);

    return {
      prompt: numberToIndonesian(number),
      answer: String(number),
    };
  },
  check(expected: string, input: string): QuizCheckResult {
    const indonesianText = numberToIndonesian(Number(expected));
    const result = checkNumberAnswer(indonesianText, input);
    return {
      correct: result.correct,
      errors: result.errors,
      warnings: [],
      wrongSpans: digitErrorHighlightRanges(result.wrongDigits),
    };
  },
};
