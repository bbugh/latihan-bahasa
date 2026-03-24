export interface VocabularyItem {
  prompt: string;
  answer: string;
}

export interface VocabularySet {
  items: VocabularyItem[];
}

export interface VocabularyCheckResult {
  correct: boolean;
  errors: string[];
}

export function checkVocabularyAnswer(expected: string, input: string): VocabularyCheckResult {
  const trimmed = input.trim();
  if (!trimmed) return { correct: false, errors: ['No answer given'] };

  if (trimmed.toLowerCase() === expected.toLowerCase()) {
    return { correct: true, errors: [] };
  }

  const dist = editDistance(trimmed.toLowerCase(), expected.toLowerCase());
  if (dist <= Math.ceil(expected.length / 3)) {
    return { correct: false, errors: [`Almost — did you mean "${expected}"?`] };
  }

  return { correct: false, errors: ['Incorrect'] };
}

export function randomPracticeItem(set: VocabularySet, previous?: VocabularyItem): VocabularyItem {
  if (set.items.length <= 1) return set.items[0];

  let item: VocabularyItem;
  do {
    item = set.items[Math.floor(Math.random() * set.items.length)];
  } while (previous && item.prompt === previous.prompt && item.answer === previous.answer);

  return item;
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
