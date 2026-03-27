import { makeVocabQuizPair } from '../quiz/vocabulary';

const MONTHS = [
  { english: 'January', indonesian: 'Januari' },
  { english: 'February', indonesian: 'Februari' },
  { english: 'March', indonesian: 'Maret' },
  { english: 'April', indonesian: 'April' },
  { english: 'May', indonesian: 'Mei' },
  { english: 'June', indonesian: 'Juni' },
  { english: 'July', indonesian: 'Juli' },
  { english: 'August', indonesian: 'Agustus' },
  { english: 'September', indonesian: 'September' },
  { english: 'October', indonesian: 'Oktober' },
  { english: 'November', indonesian: 'November' },
  { english: 'December', indonesian: 'Desember' },
];

export const [monthsToIndonesian, monthsToEnglish] = makeVocabQuizPair({
  category: 'Months',
  items: MONTHS,
  fromLabel: 'English',
  toLabel: 'Indonesian',
});
