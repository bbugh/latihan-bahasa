import { QUIZ_REGISTRY } from '$lib/data/registry';

export function load({ params }: { params: { slug: string } }) {
  return { slug: params.slug };
}

export function entries() {
  return QUIZ_REGISTRY.map(q => ({ slug: q.slug }));
}
