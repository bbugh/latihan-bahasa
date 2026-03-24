import type { VocabularySet } from './vocabulary';

export const MONTHS_TO_INDONESIAN: VocabularySet = {
  items: [
    { prompt: 'January', answer: 'Januari' },
    { prompt: 'February', answer: 'Februari' },
    { prompt: 'March', answer: 'Maret' },
    { prompt: 'April', answer: 'April' },
    { prompt: 'May', answer: 'Mei' },
    { prompt: 'June', answer: 'Juni' },
    { prompt: 'July', answer: 'Juli' },
    { prompt: 'August', answer: 'Agustus' },
    { prompt: 'September', answer: 'September' },
    { prompt: 'October', answer: 'Oktober' },
    { prompt: 'November', answer: 'November' },
    { prompt: 'December', answer: 'Desember' },
  ],
};

export const MONTHS_TO_ENGLISH: VocabularySet = {
  items: MONTHS_TO_INDONESIAN.items.map(({ prompt, answer }) => ({
    prompt: answer,
    answer: prompt,
  })),
};
