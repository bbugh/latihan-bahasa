import { QUIZ_REGISTRY } from '$lib/quizzes';

export function load({ params }: { params: { slug: string } }) {
  return { slug: params.slug };
}

export function entries() {
  return QUIZ_REGISTRY.map(q => ({ slug: q.slug }));
}
