import { detectCustomerLanguage } from './language-detector';

describe('detectCustomerLanguage', () => {
  it.each([
    ['ചെക്ക് ഇൻ സമയം എപ്പോഴാണ്?', 'malayalam'],
    ['செக்-இன் நேரம் என்ன?', 'tamil'],
    ['चेक इन समय क्या है?', 'hindi'],
  ])('detects native script: %s', (text, language) => {
    expect(detectCustomerLanguage(text).language).toBe(language);
    expect(detectCustomerLanguage(text).source).toBe('script');
  });

  it.each([
    ['room undo?', 'malayalam'],
    ['booking venam', 'malayalam'],
    ['room irukka?', 'tamil'],
    ['booking venum', 'tamil'],
    ['room hai kya?', 'hindi'],
    ['booking karna hai', 'hindi'],
  ])('detects romanized language: %s', (text, language) => {
    const result = detectCustomerLanguage(text);
    expect(result.language).toBe(language);
    expect(result.source).toBe('romanized');
  });

  it('uses previous language for short ambiguous replies', () => {
    const result = detectCustomerLanguage('ok', 'malayalam');

    expect(result.language).toBe('malayalam');
    expect(result.source).toBe('previous');
  });

  it('allows a clear English message to switch away from previous language', () => {
    const result = detectCustomerLanguage('I want to book a room', 'malayalam');

    expect(result.language).toBe('english');
    expect(result.source).toBe('romanized');
  });

  it('defaults to English when no previous language exists', () => {
    const result = detectCustomerLanguage('ok');

    expect(result.language).toBe('english');
    expect(result.source).toBe('default');
  });
});
