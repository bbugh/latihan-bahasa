import { makeVocabQuizPair } from '../quiz/vocabulary';

const DAYS = [
  { english: 'Monday', indonesian: 'Senin' },
  { english: 'Tuesday', indonesian: 'Selasa' },
  { english: 'Wednesday', indonesian: 'Rabu' },
  { english: 'Thursday', indonesian: 'Kamis' },
  { english: 'Friday', indonesian: 'Jumat' },
  { english: 'Saturday', indonesian: 'Sabtu' },
  { english: 'Sunday', indonesian: 'Minggu' },
];

export const [daysToIndonesian, daysToEnglish] = makeVocabQuizPair({
  category: 'Days',
  items: DAYS,
  fromLabel: 'English',
  toLabel: 'Indonesian',
});
