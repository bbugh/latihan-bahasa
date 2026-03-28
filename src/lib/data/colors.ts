import { makeVocabQuizPair } from '../quiz/vocabulary';

const COLORS = [
  { english: 'Red', indonesian: 'Merah' },
  { english: 'Blue', indonesian: 'Biru' },
  { english: 'Yellow', indonesian: 'Kuning' },
  { english: 'Green', indonesian: 'Hijau' },
  { english: 'White', indonesian: 'Putih' },
  { english: 'Black', indonesian: 'Hitam' },
  { english: 'Orange', indonesian: 'Oranye' },
  { english: 'Purple', indonesian: 'Ungu' },
  { english: 'Brown', indonesian: 'Cokelat' },
  { english: 'Pink', indonesian: 'Merah Muda' },
  { english: 'Grey', indonesian: 'Abu-abu', altEnglish: ['Gray'] },
  { english: 'Gold', indonesian: 'Emas' },
  { english: 'Silver', indonesian: 'Perak' },
];

export const [colorsToIndonesian, colorsToEnglish] = makeVocabQuizPair({
  category: 'Colors',
  items: COLORS,
  fromLabel: 'English',
  toLabel: 'Indonesian',
});
