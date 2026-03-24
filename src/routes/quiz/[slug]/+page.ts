import { error } from '@sveltejs/kit';
import { QUIZ_BY_SLUG, QUIZ_REGISTRY } from '$lib/quizzes';

export function load({ params }: { params: { slug: string } }) {
  const config = QUIZ_BY_SLUG.get(params.slug);
  if (!config) throw error(404, 'Quiz not found');
  return { config };
}

export function entries() {
  return QUIZ_REGISTRY.map(q => ({ slug: q.slug }));
}
