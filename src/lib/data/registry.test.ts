import { describe, expect, it } from 'vitest';
import { QUIZ_REGISTRY, QUIZ_BY_SLUG } from './registry';

describe('QUIZ_REGISTRY', () => {
  it('contains all quizzes', () => {
    expect(QUIZ_REGISTRY.length).toBe(6);
  });

  it('every quiz has required fields', () => {
    for (const q of QUIZ_REGISTRY) {
      expect(q.slug).toBeTruthy();
      expect(q.title).toBeTruthy();
      expect(q.description).toBeTruthy();
      expect(q.category).toBeTruthy();
      expect(q.instruction).toBeTruthy();
      expect(typeof q.generate).toBe('function');
      expect(typeof q.check).toBe('function');
      if (q.buildHints) expect(typeof q.buildHints).toBe('function');
    }
  });

  it('all slugs are unique', () => {
    const slugs = QUIZ_REGISTRY.map(q => q.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('QUIZ_BY_SLUG', () => {
  it('looks up each quiz by slug', () => {
    for (const q of QUIZ_REGISTRY) {
      expect(QUIZ_BY_SLUG.get(q.slug)).toBe(q);
    }
  });

  it('returns undefined for unknown slug', () => {
    expect(QUIZ_BY_SLUG.get('nonexistent')).toBeUndefined();
  });
});

describe('quiz check results have correct shape', () => {
  it('every quiz returns QuizCheckResult from check', () => {
    for (const q of QUIZ_REGISTRY) {
      const prompt = q.generate();
      const result = q.check(prompt.answer, 'wrong');
      expect(result).toHaveProperty('correct');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('wrongSpans');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.wrongSpans)).toBe(true);
    }
  });
});
