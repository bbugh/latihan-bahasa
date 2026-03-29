import { describe, expect, it } from 'vitest';
import { singleDefinitionSession, randomSession } from './session';
import type { QuizDefinition, QuizCheckResult, QuizPrompt } from './definition';

function makeDef(overrides: Partial<QuizDefinition> = {}): QuizDefinition {
  let callCount = 0;
  return {
    slug: 'test',
    title: 'Test Quiz',
    description: 'A test quiz',
    category: 'Test',
    instruction: 'Type the answer',
    inputMode: 'text',
    placeholder: 'Type here...',
    generate(previous?: QuizPrompt): QuizPrompt {
      callCount++;
      return { prompt: `Question ${callCount}`, answer: 'correct' };
    },
    check(expected: string, input: string): QuizCheckResult {
      const trimmed = input.trim().toLowerCase();
      if (trimmed === expected.toLowerCase()) {
        return { correct: true, errors: [], warnings: [], wrongSpans: [] };
      }
      return { correct: false, errors: ['Wrong'], warnings: [], wrongSpans: [] };
    },
    buildHints(answer: string): string[] {
      return ['_ _ _ _', 'c _ _ _'];
    },
    ...overrides,
  };
}

describe('singleDefinitionSession', () => {
  it('has slug and title from definition', () => {
    const session = singleDefinitionSession(makeDef({ slug: 'my-quiz', title: 'My Quiz' }));
    expect(session.slug).toBe('my-quiz');
    expect(session.title).toBe('My Quiz');
  });

  it('generate returns ActiveQuestion with correct context', () => {
    const session = singleDefinitionSession(makeDef({
      inputMode: 'numeric',
      placeholder: 'Type number...',
      instruction: 'Type the number',
    }));
    const q = session.generate();
    expect(q.context.inputMode).toBe('numeric');
    expect(q.context.placeholder).toBe('Type number...');
    expect(q.context.instruction).toBe('Type the number');
  });

  it('generate returns prompt data', () => {
    const session = singleDefinitionSession(makeDef());
    const q = session.generate();
    expect(q.prompt.prompt).toBe('Question 1');
    expect(q.prompt.answer).toBe('correct');
  });

  it('generate passes previous prompt for repeat avoidance', () => {
    const def = makeDef();
    const session = singleDefinitionSession(def);
    const first = session.generate();
    const second = session.generate(first);
    expect(second.prompt.prompt).toBe('Question 2');
  });

  it('check delegates to definition', () => {
    const session = singleDefinitionSession(makeDef());
    const q = session.generate();
    expect(q.check('correct', 'correct').correct).toBe(true);
    expect(q.check('correct', 'wrong').correct).toBe(false);
  });

  it('buildHints delegates to definition', () => {
    const session = singleDefinitionSession(makeDef());
    const q = session.generate();
    expect(q.buildHints).toBeDefined();
    expect(q.buildHints!('test')).toEqual(['_ _ _ _', 'c _ _ _']);
  });

  it('buildHints is undefined when definition has none', () => {
    const def = makeDef();
    delete (def as any).buildHints;
    const session = singleDefinitionSession(def);
    const q = session.generate();
    expect(q.buildHints).toBeUndefined();
  });

  it('context is constant across questions', () => {
    const session = singleDefinitionSession(makeDef());
    const q1 = session.generate();
    const q2 = session.generate(q1);
    expect(q1.context).toBe(q2.context);
  });
});

describe('randomSession', () => {
  const defA = makeDef({ slug: 'quiz-a', title: 'Quiz A', category: 'Cat1', inputMode: 'numeric' });
  const defB = makeDef({ slug: 'quiz-b', title: 'Quiz B', category: 'Cat1', inputMode: 'text' });
  const defC = makeDef({ slug: 'quiz-c', title: 'Quiz C', category: 'Cat2', inputMode: 'text' });

  it('has slug and title from options', () => {
    const session = randomSession([defA, defB], { slug: 'my-random', title: 'My Random' });
    expect(session.slug).toBe('my-random');
    expect(session.title).toBe('My Random');
  });

  it('defaults slug to "random" and title to "Random"', () => {
    const session = randomSession([defA, defB]);
    expect(session.slug).toBe('random');
    expect(session.title).toBe('Random');
  });

  it('generates questions from different definitions', () => {
    const session = randomSession([defA, defB, defC]);
    const contexts = new Set<string>();
    let prev: ReturnType<typeof session.generate> | undefined;
    for (let i = 0; i < 50; i++) {
      const q = session.generate(prev);
      contexts.add(q.context.inputMode + ':' + q.context.instruction);
      prev = q;
    }
    expect(contexts.size).toBeGreaterThan(1);
  });

  it('avoids repeating the same definition consecutively', () => {
    const session = randomSession([defA, defB]);
    let prev = session.generate();
    for (let i = 0; i < 30; i++) {
      const next = session.generate(prev);
      expect(next.check).not.toBe(prev.check);
      prev = next;
    }
  });

  it('check delegates to the correct definition', () => {
    const session = randomSession([defA, defB]);
    const q = session.generate();
    expect(q.check(q.prompt.answer, q.prompt.answer).correct).toBe(true);
  });

  it('filter restricts eligible definitions', () => {
    const session = randomSession([defA, defB, defC], {
      filter: d => d.category === 'Cat2',
    });
    const q = session.generate();
    expect(q.context.inputMode).toBe('text');
  });

  it('throws when filter produces empty pool', () => {
    expect(() => randomSession([defA, defB], {
      filter: () => false,
    })).toThrow();
  });

  it('works with single definition in pool', () => {
    const session = randomSession([defA]);
    const q1 = session.generate();
    const q2 = session.generate(q1);
    expect(q1.prompt).toBeTruthy();
    expect(q2.prompt).toBeTruthy();
  });
});
