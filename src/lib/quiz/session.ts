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
  /** Slug of the definition that generated this question, used for hydration. */
  defSlug: string;
  context: QuestionContext;
  check: (expected: string, input: string) => QuizCheckResult;
  buildHints?: (answer: string) => string[];
}

/**
 * Serializable subset of ActiveQuestion that hydratable() can persist
 * across SSR and hydration.
 */
export interface HydratableQuestion {
  prompt: QuizPrompt;
  defSlug: string;
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
  /** Reconstruct an ActiveQuestion from hydrated data. */
  fromHydrated(data: HydratableQuestion): ActiveQuestion;
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

  function buildActive(prompt: QuizPrompt): ActiveQuestion {
    return { prompt, defSlug: def.slug, context, check: def.check, buildHints: def.buildHints };
  }

  return {
    slug: def.slug,
    title: def.title,
    generate(previous?: ActiveQuestion): ActiveQuestion {
      return buildActive(def.generate(previous?.prompt));
    },
    fromHydrated(data: HydratableQuestion): ActiveQuestion {
      return buildActive(data.prompt);
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

  const poolBySlug = new Map(pool.map(d => [d.slug, d]));

  function buildActive(def: QuizDefinition, prompt: QuizPrompt): ActiveQuestion {
    return {
      prompt,
      defSlug: def.slug,
      context: {
        inputMode: def.inputMode,
        placeholder: def.placeholder,
        instruction: def.instruction,
      },
      check: def.check,
      buildHints: def.buildHints,
    };
  }

  return {
    slug,
    title,
    generate(previous?: ActiveQuestion): ActiveQuestion {
      let def: QuizDefinition;

      if (previous && pool.length > 1) {
        const candidates = pool.filter(d => d.slug !== previous.defSlug);
        const available = candidates.length > 0 ? candidates : pool;
        def = available[Math.floor(Math.random() * available.length)];
      } else {
        def = pool[Math.floor(Math.random() * pool.length)];
      }

      const prevPrompt = previous?.defSlug === def.slug ? previous.prompt : undefined;
      return buildActive(def, def.generate(prevPrompt));
    },
    fromHydrated(data: HydratableQuestion): ActiveQuestion {
      const def = poolBySlug.get(data.defSlug) ?? pool[0];
      return buildActive(def, data.prompt);
    },
  };
}
