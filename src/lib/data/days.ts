import { defineVocabSet } from '../quiz/vocabulary';

export const DAYS = defineVocabSet({
  category: 'Days',
  items: [
    { en: ['Monday'], id: ['Senin'] },
    { en: ['Tuesday'], id: ['Selasa'] },
    { en: ['Wednesday'], id: ['Rabu'] },
    { en: ['Thursday'], id: ['Kamis'] },
    { en: ['Friday'], id: ['Jumat'] },
    { en: ['Saturday'], id: ['Sabtu'] },
    { en: ['Sunday'], id: ['Minggu'] },
  ],
});
