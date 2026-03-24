import type { QuizCheckResult, QuizConfig, QuizQuestion } from './quiz';
import { buildHints } from './hints';
import { checkVocabularyAnswer, randomPracticeItem, type VocabularyItem, type VocabularySet } from './vocabulary';
import { MONTHS_TO_INDONESIAN, MONTHS_TO_ENGLISH } from './months';
import { checkAnswer, checkNumberAnswer, numberToIndonesian, randomPracticeNumber } from './numbers';

// -- Span conversion helpers --

/** Convert word-level wrongIndices to character-level [start, end) spans in the input string. */
function wordIndicesToSpans(input: string, wrongIndices: number[]): [number, number][] {
  if (wrongIndices.length === 0) return [];
  const wrongSet = new Set(wrongIndices);
  const spans: [number, number][] = [];
  let wordIndex = 0;
  let i = 0;
  while (i < input.length) {
    if (input[i] === ' ') {
      i++;
    } else {
      const start = i;
      while (i < input.length && input[i] !== ' ') i++;
      if (wrongSet.has(wordIndex)) spans.push([start, i]);
      wordIndex++;
    }
  }
  return spans;
}

/** Convert digit positions to character-level spans (each digit is one char). */
function digitPositionsToSpans(wrongDigits: { position: number }[]): [number, number][] {
  return wrongDigits.map(d => [d.position, d.position + 1]);
}

/** Compare two strings character-by-character and return spans where they differ. */
function charDiffSpans(input: string, expected: string): [number, number][] {
  const spans: [number, number][] = [];
  const len = Math.max(input.length, expected.length);
  let spanStart: number | null = null;

  for (let i = 0; i <= len; i++) {
    const match = i < input.length && i < expected.length &&
      input[i].toLowerCase() === expected[i].toLowerCase();

    if (!match && i < input.length) {
      if (spanStart === null) spanStart = i;
    } else {
      if (spanStart !== null) {
        spans.push([spanStart, i]);
        spanStart = null;
      }
    }
  }
  return spans;
}

// -- Quiz generators --

function generateNumbersToWords(previous?: QuizQuestion): QuizQuestion {
  let number: number;
  do {
    number = randomPracticeNumber();
  } while (previous && String(number) === previous.prompt.replace(/,/g, ''));

  const answer = numberToIndonesian(number);
  const prompt = number.toLocaleString();

  return {
    prompt,
    answer,
    hints: [],
    promptStyle: 'number',
    inputMode: 'text',
    placeholder: 'Type Indonesian here...',
    check(input: string): QuizCheckResult {
      const result = checkAnswer(number, input);
      return {
        correct: result.correct,
        errors: result.errors,
        warnings: result.warnings,
        wrongSpans: wordIndicesToSpans(input.trim().toLowerCase(), result.wrongIndices),
      };
    },
  };
}

function generateWordsToNumbers(previous?: QuizQuestion): QuizQuestion {
  let number: number;
  do {
    number = randomPracticeNumber();
  } while (previous && numberToIndonesian(number) === previous.prompt);

  const indonesian = numberToIndonesian(number);

  return {
    prompt: indonesian,
    answer: String(number),
    hints: [],
    promptStyle: 'text',
    inputMode: 'numeric',
    placeholder: 'Type the number...',
    check(input: string): QuizCheckResult {
      const result = checkNumberAnswer(indonesian, input);
      return {
        correct: result.correct,
        errors: result.errors,
        warnings: [],
        wrongSpans: digitPositionsToSpans(result.wrongDigits),
      };
    },
  };
}

function makeVocabularyGenerator(set: VocabularySet) {
  return function generate(previous?: QuizQuestion): QuizQuestion {
    // Find the VocabularyItem matching the previous question to avoid repeats
    let prevItem: VocabularyItem | undefined;
    if (previous) {
      prevItem = set.items.find(i => i.prompt === previous.prompt && i.answer === previous.answer);
    }

    const item = randomPracticeItem(set, prevItem);
    const hints = buildHints(item.answer, item.firstSound);

    return {
      prompt: item.prompt,
      answer: item.answer,
      hints,
      promptStyle: 'text',
      inputMode: 'text',
      placeholder: 'Type your answer...',
      check(input: string): QuizCheckResult {
        const result = checkVocabularyAnswer(item.answer, input);
        const trimmed = input.trim();

        let wrongSpans: [number, number][] = [];
        if (!result.correct && trimmed) {
          const isClose = result.errors.some(e => /almost|did you mean/i.test(e));
          if (isClose) {
            wrongSpans = charDiffSpans(trimmed, item.answer);
          } else {
            wrongSpans = [[0, trimmed.length]];
          }
        }

        return {
          correct: result.correct,
          errors: result.errors,
          warnings: [],
          wrongSpans,
        };
      },
    };
  };
}

// -- Registry --

export const QUIZ_REGISTRY: QuizConfig[] = [
  {
    slug: 'numbers-to-words',
    title: 'Numbers \u2192 Words',
    description: 'See a number, type the Indonesian',
    category: 'Numbers',
    instruction: 'Type the Indonesian words for this number',
    generate: generateNumbersToWords,
  },
  {
    slug: 'words-to-numbers',
    title: 'Words \u2192 Numbers',
    description: 'See Indonesian words, type the number',
    category: 'Numbers',
    instruction: 'Type the number for these Indonesian words',
    generate: generateWordsToNumbers,
  },
  {
    slug: 'months-to-indonesian',
    title: 'Months \u2192 Indonesian',
    description: 'See an English month, type the Indonesian',
    category: 'Months',
    instruction: 'Type the Indonesian month name',
    generate: makeVocabularyGenerator(MONTHS_TO_INDONESIAN),
  },
  {
    slug: 'months-to-english',
    title: 'Months \u2192 English',
    description: 'See an Indonesian month, type the English',
    category: 'Months',
    instruction: 'Type the English month name',
    generate: makeVocabularyGenerator(MONTHS_TO_ENGLISH),
  },
];

export const QUIZ_BY_SLUG = new Map(QUIZ_REGISTRY.map(q => [q.slug, q]));
