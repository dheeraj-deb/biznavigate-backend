export type CustomerLanguage = 'english' | 'hindi' | 'malayalam' | 'tamil';

export interface LanguageDetectionResult {
  language: CustomerLanguage;
  confidence: number;
  source: 'script' | 'romanized' | 'previous' | 'default';
  scores: Record<CustomerLanguage, number>;
}

const LANGUAGE_LABELS: Record<CustomerLanguage, string> = {
  english: 'English',
  hindi: 'Hindi',
  malayalam: 'Malayalam',
  tamil: 'Tamil',
};

const SCRIPT_RANGES: Array<{ language: CustomerLanguage; regex: RegExp }> = [
  { language: 'malayalam', regex: /[\u0D00-\u0D7F]/g },
  { language: 'tamil', regex: /[\u0B80-\u0BFF]/g },
  { language: 'hindi', regex: /[\u0900-\u097F]/g },
];

const ROMANIZED_PATTERNS: Record<Exclude<CustomerLanguage, 'english'>, Array<[RegExp, number]>> = {
  hindi: [
    [/\b(namaste|namaskar|dhanyavaad|shukriya|kripya)\b/g, 3],
    [/\b(kya|kyun|kaise|kab|kahan|kitna|kitne)\b/g, 2],
    [/\b(hai|hain|haan|nahi|nahin|chahiye|karna|karo|batao)\b/g, 1],
    [/\b(room|booking|reservation|available|price|rate)\s+(hai|chahiye|karna)\b/g, 2],
  ],
  malayalam: [
    [/\b(namaskaram|nanni|sughamano)\b/g, 3],
    [/\b(undo|illa|alle|aano|ano|evide|engane|ethra|eppo|ippol)\b/g, 2],
    [/\b(venam|venam?o|kittumo|parayamo|ariyumo|booking venam)\b/g, 2],
    [/\b(room|booking|reservation|available|price|rate)\s+(undo|venam|kittumo)\b/g, 2],
  ],
  tamil: [
    [/\b(vanakkam|nandri|sollunga)\b/g, 3],
    [/\b(irukka|illai|enna|epdi|eppo|enge|evlo|evvalavu)\b/g, 2],
    [/\b(venum|venuma|kidaikkuma|sollunga|theriyuma|booking venum)\b/g, 2],
    [/\b(room|booking|reservation|available|price|rate)\s+(irukka|venum|kidaikkuma)\b/g, 2],
  ],
};

const ENGLISH_HINTS = [
  /\b(hello|hi|hey|thanks|thank you|please|booking|room|available|price|check[- ]?in|check[- ]?out|cancel|payment)\b/g,
];

export function languageLabel(language?: string): string {
  if (!language) return LANGUAGE_LABELS.english;
  return LANGUAGE_LABELS[(language as CustomerLanguage)] ?? LANGUAGE_LABELS.english;
}

export function detectLanguageFromText(text: string, previousLanguage?: CustomerLanguage): CustomerLanguage {
  return detectCustomerLanguage(text, previousLanguage).language;
}

export function detectCustomerLanguage(text: string, previousLanguage?: CustomerLanguage): LanguageDetectionResult {
  const normalized = normalizeText(text);
  const baseScores = emptyScores();

  if (!normalized) {
    return previousOrDefault(previousLanguage, baseScores);
  }

  const scriptResult = detectByScript(text, baseScores);
  if (scriptResult) return scriptResult;

  const romanizedScores = scoreRomanized(normalized, baseScores);
  const top = bestScore(romanizedScores);
  const second = secondBestScore(romanizedScores, top.language);
  const hasEnoughSignal = top.score >= 3 && top.score - second.score >= 2;
  const hasEnoughEnglishSignal = top.language === 'english' && top.score >= 2 && top.score - second.score >= 1;

  if (hasEnoughSignal) {
    return {
      language: top.language,
      confidence: Math.min(0.95, 0.55 + top.score / 10),
      source: 'romanized',
      scores: romanizedScores,
    };
  }

  if (hasEnoughEnglishSignal) {
    return {
      language: 'english',
      confidence: Math.min(0.9, 0.6 + top.score / 10),
      source: 'romanized',
      scores: romanizedScores,
    };
  }

  if (previousLanguage && top.score < 5) {
    return {
      language: previousLanguage,
      confidence: 0.65,
      source: 'previous',
      scores: romanizedScores,
    };
  }

  const englishScore = scoreEnglish(normalized);
  if (englishScore > 0 && top.score < 3) {
    return {
      language: 'english',
      confidence: 0.75,
      source: 'romanized',
      scores: { ...romanizedScores, english: englishScore },
    };
  }

  return previousOrDefault(previousLanguage, romanizedScores);
}

function detectByScript(text: string, scores: Record<CustomerLanguage, number>): LanguageDetectionResult | null {
  let total = 0;
  const scriptScores = { ...scores };

  for (const range of SCRIPT_RANGES) {
    const count = text.match(range.regex)?.length ?? 0;
    scriptScores[range.language] += count;
    total += count;
  }

  if (total === 0) return null;

  const top = bestScore(scriptScores);
  return {
    language: top.language,
    confidence: Math.min(0.99, 0.8 + top.score / Math.max(total, 1) / 5),
    source: 'script',
    scores: scriptScores,
  };
}

function scoreRomanized(text: string, scores: Record<CustomerLanguage, number>): Record<CustomerLanguage, number> {
  const result = { ...scores };

  for (const [language, patterns] of Object.entries(ROMANIZED_PATTERNS) as Array<[Exclude<CustomerLanguage, 'english'>, Array<[RegExp, number]>]>) {
    for (const [regex, weight] of patterns) {
      const matches = text.match(regex)?.length ?? 0;
      result[language] += matches * weight;
    }
  }

  result.english += scoreEnglish(text);
  return result;
}

function scoreEnglish(text: string): number {
  return ENGLISH_HINTS.reduce((score, regex) => score + (text.match(regex)?.length ?? 0), 0);
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function emptyScores(): Record<CustomerLanguage, number> {
  return {
    english: 0,
    hindi: 0,
    malayalam: 0,
    tamil: 0,
  };
}

function bestScore(scores: Record<CustomerLanguage, number>): { language: CustomerLanguage; score: number } {
  return (Object.entries(scores) as Array<[CustomerLanguage, number]>)
    .sort((a, b) => b[1] - a[1])
    .map(([language, score]) => ({ language, score }))[0];
}

function secondBestScore(
  scores: Record<CustomerLanguage, number>,
  winner: CustomerLanguage,
): { language: CustomerLanguage; score: number } {
  return (Object.entries(scores) as Array<[CustomerLanguage, number]>)
    .filter(([language]) => language !== winner)
    .sort((a, b) => b[1] - a[1])
    .map(([language, score]) => ({ language, score }))[0];
}

function previousOrDefault(
  previousLanguage: CustomerLanguage | undefined,
  scores: Record<CustomerLanguage, number>,
): LanguageDetectionResult {
  if (previousLanguage) {
    return {
      language: previousLanguage,
      confidence: 0.6,
      source: 'previous',
      scores,
    };
  }

  return {
    language: 'english',
    confidence: 0.5,
    source: 'default',
    scores,
  };
}
