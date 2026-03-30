import { defineVocabSet } from '../quiz/vocabulary';

export const COLORS = defineVocabSet({
  category: 'Colors',
  items: [
    { en: ['Red'], id: ['Merah'] },
    { en: ['Blue'], id: ['Biru'] },
    { en: ['Yellow'], id: ['Kuning'] },
    { en: ['Green'], id: ['Hijau'] },
    { en: ['White'], id: ['Putih'] },
    { en: ['Black'], id: ['Hitam'] },
    { en: ['Orange'], id: ['Oranye'] },
    { en: ['Purple'], id: ['Ungu'] },
    { en: ['Brown'], id: ['Cokelat', 'Coklat'] },
    { en: ['Pink'], id: ['Merah Muda'] },
    { 'en-US': ['Gray'], 'en-GB': ['Grey'], id: ['Abu-abu'] },
    { en: ['Gold'], id: ['Emas'] },
    { en: ['Silver'], id: ['Perak'] },
  ],
});
