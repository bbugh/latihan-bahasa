import type { QuizDefinition, QuizPrompt, QuizCheckResult } from './definition';

/**
 * Per-question display metadata. In a single-definition session these are
 * constant; in random mode they change with each generated question.
 */
export interface QuestionContext {
  inputMode: 'text' | 'numeric';
  placeholder: string;
  instruction: string;
}

/**
 * A generated question bundled with everything needed to display and
 * evaluate it. The store holds one of these at a time.
 */
export interface ActiveQuestion {
  prompt: QuizPrompt;
  context: QuestionContext;
  check: (expected: string, input: string) => QuizCheckResult;
  buildHints?: (answer: string) => string[];
}

/**
 * Strategy for producing quiz questions. Abstracts over single-definition
 * and multi-definition (random) modes so the store and component don't
 * need to know which mode is active.
 */
export interface QuizSession {
  slug: string;
  title: string;
  generate(previous?: ActiveQuestion): ActiveQuestion;
}

/**
 * Wrap a single {@link QuizDefinition} as a {@link QuizSession}.
 * Context is constant for the session lifetime.
 */
export function singleDefinitionSession(def: QuizDefinition): QuizSession {
  const context: QuestionContext = {
    inputMode: def.inputMode,
    placeholder: def.placeholder,
    instruction: def.instruction,
  };

  return {
    slug: def.slug,
    title: def.title,
    generate(previous?: ActiveQuestion): ActiveQuestion {
      const prompt = def.generate(previous?.prompt);
      return {
        prompt,
        context,
        check: def.check,
        buildHints: def.buildHints,
      };
    },
  };
}

export interface RandomSessionOptions {
  /** Filter which definitions are eligible. Defaults to all. */
  filter?: (def: QuizDefinition) => boolean;
  title?: string;
  slug?: string;
}

/**
 * Create a session that picks a random definition for each question.
 * Avoids repeating the same definition consecutively. When the same
 * definition is picked (small pool or by chance), passes the previous
 * prompt through for within-definition repeat avoidance.
 */
export function randomSession(
  registry: QuizDefinition[],
  options: RandomSessionOptions = {},
): QuizSession {
  const {
    filter,
    title = 'Random',
    slug = 'random',
  } = options;

  const pool = filter ? registry.filter(filter) : registry;
  if (pool.length === 0) {
    throw new Error('Random session has no eligible definitions');
  }

  return {
    slug,
    title,
    generate(previous?: ActiveQuestion): ActiveQuestion {
      let def: QuizDefinition;

      if (previous && pool.length > 1) {
        const candidates = pool.filter(d => d.check !== previous.check);
        const available = candidates.length > 0 ? candidates : pool;
        def = available[Math.floor(Math.random() * available.length)];
      } else {
        def = pool[Math.floor(Math.random() * pool.length)];
      }

      const prevPrompt = previous?.check === def.check ? previous.prompt : undefined;
      const prompt = def.generate(prevPrompt);

      return {
        prompt,
        context: {
          inputMode: def.inputMode,
          placeholder: def.placeholder,
          instruction: def.instruction,
        },
        check: def.check,
        buildHints: def.buildHints,
      };
    },
  };
}
