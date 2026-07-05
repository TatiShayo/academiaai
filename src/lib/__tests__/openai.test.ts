import { describe, expect, it } from 'vitest';
import { mockHumanize, mockEnhance, mockPlagiarism } from '../openai';

describe('mockHumanize', () => {
  it('should return empty values when input is empty or whitespace', () => {
    const resultEmpty = mockHumanize('', 'Balanced');
    expect(resultEmpty).toEqual({ humanizedText: '', beforeScore: 0, afterScore: 0 });

    const resultWhitespace = mockHumanize('   ', 'Subtle');
    expect(resultWhitespace).toEqual({ humanizedText: '', beforeScore: 0, afterScore: 0 });
  });

  it('should apply Subtle humanization correctly (replace up to 3 matches, scores in range)', () => {
    // Input containing multiple replacable words: furthermore, consequently, moreover, additionally
    const text = 'Furthermore, consequently, moreover, additionally we proceed.';
    const result = mockHumanize(text, 'Subtle');

    // Subtle should replace at most 3 matches. Let's check replacement logic:
    // 1. furthermore -> also
    // 2. consequently -> as a result
    // 3. moreover -> in addition
    // 4. additionally -> plus (should NOT be replaced because limit of 3 is reached)
    expect(result.humanizedText).toContain('also');
    expect(result.humanizedText).toContain('as a result');
    expect(result.humanizedText).toContain('in addition');
    expect(result.humanizedText).toContain('additionally'); // remained unchanged

    expect(result.beforeScore).toBeGreaterThanOrEqual(80);
    expect(result.beforeScore).toBeLessThanOrEqual(95);

    expect(result.afterScore).toBeGreaterThanOrEqual(35);
    expect(result.afterScore).toBeLessThanOrEqual(50);
  });

  it('should apply Balanced humanization correctly (replace all matches, contract verbs, scores in range)', () => {
    const text = 'Furthermore, it is not possible. Moreover, we will do it. Consequently, it does not work and we cannot utilize it.';
    const result = mockHumanize(text, 'Balanced');

    // Replacements
    expect(result.humanizedText).toContain('also');
    expect(result.humanizedText).toContain('in addition');
    expect(result.humanizedText).toContain('as a result');
    expect(result.humanizedText).toContain('use'); // utilize -> use

    // Contractions
    expect(result.humanizedText).toContain("isn't");
    expect(result.humanizedText).toContain("we'll");
    expect(result.humanizedText).toContain("doesn't");
    expect(result.humanizedText).toContain("can't");

    expect(result.beforeScore).toBeGreaterThanOrEqual(88);
    expect(result.beforeScore).toBeLessThanOrEqual(98);

    expect(result.afterScore).toBeGreaterThanOrEqual(12);
    expect(result.afterScore).toBeLessThanOrEqual(22);
  });

  it('should apply Aggressive humanization correctly (replace matches, verbs, special phrases, semicolons, scores in range)', () => {
    const text = 'throughout history in today\'s modern world we have issues; first and foremost, it should be noted that we cannot utilize this.';
    const result = mockHumanize(text, 'Aggressive');

    // Replacements & Phrases
    expect(result.humanizedText).toContain('traditionally'); // throughout history -> traditionally
    expect(result.humanizedText).toContain('today'); // in today's modern world -> today
    expect(result.humanizedText).toContain('primarily'); // first and foremost -> primarily
    expect(result.humanizedText).toContain('we should remember'); // should be noted that -> we should remember
    expect(result.humanizedText).toContain("can't"); // cannot -> can't
    expect(result.humanizedText).toContain('use'); // utilize -> use
    expect(result.humanizedText).toContain('. '); // semicolon replaced by period

    expect(result.beforeScore).toBeGreaterThanOrEqual(95);
    expect(result.beforeScore).toBeLessThanOrEqual(100);

    expect(result.afterScore).toBeGreaterThanOrEqual(2);
    expect(result.afterScore).toBeLessThanOrEqual(7);
  });
});

describe('mockEnhance', () => {
  it('should return empty values when input is empty or whitespace', () => {
    const result = mockEnhance('  ', 'PhD');
    expect(result).toEqual({ enhancedText: '', improvements: [] });
  });

  it('should apply High School transformations', () => {
    const text = 'This is a good project. It is bad to get bad grades or show weakness.';
    const result = mockEnhance(text, 'High School');

    expect(result.enhancedText).toContain('beneficial'); // good -> beneficial
    expect(result.enhancedText).toContain('detrimental'); // bad -> detrimental
    expect(result.enhancedText).toContain('obtain'); // get -> obtain
    expect(result.enhancedText).toContain('demonstrate'); // show -> demonstrate

    expect(result.improvements).toContain('Upgraded basic descriptors to more academic synonyms (e.g. "good" to "beneficial").');
    expect(result.improvements).toContain('clearer sentence structure');
  });

  it('should apply Undergraduate transformations', () => {
    const text = 'We think a lot of options are good, but some are bad and show issues.';
    const result = mockEnhance(text, 'Undergraduate');

    expect(result.enhancedText).toContain('postulate'); // think -> postulate
    expect(result.enhancedText).toContain('numerous'); // a lot of -> numerous
    expect(result.enhancedText).toContain('satisfactory'); // good -> satisfactory
    expect(result.enhancedText).toContain('adverse'); // bad -> adverse
    expect(result.enhancedText).toContain('illustrate'); // show -> illustrate

    expect(result.improvements).toContain('Substituted informal qualifiers with formal quantitative descriptors (e.g. "a lot of" to "numerous").');
    expect(result.improvements).toContain('elevated simple verbs to active verbs');
  });

  it('should apply Master\'s transformations and prepend introductory phrase', () => {
    const text = 'We think a lot of factors are good, but we have really hard tasks and show bad results.';
    const result = mockEnhance(text, "Master's");

    expect(result.enhancedText.startsWith('Evidently, ')).toBe(true);
    expect(result.enhancedText).toContain('theorize'); // think -> theorize
    expect(result.enhancedText).toContain('a substantial multitude of'); // a lot of -> a substantial multitude of
    expect(result.enhancedText).toContain('advantageous'); // good -> advantageous
    expect(result.enhancedText).toContain('exceedingly complex'); // really hard -> exceedingly complex
    expect(result.enhancedText).toContain('exemplify'); // show -> exemplify
    expect(result.enhancedText).toContain('unfavorable'); // bad -> unfavorable

    expect(result.improvements).toContain('Elevated vocabulary density to match graduate literature (e.g. "think" to "theorize").');
    expect(result.improvements).toContain('synthesized conceptual terminology');
  });

  it('should apply PhD transformations and prepend introductory phrase', () => {
    const text = 'We think a lot of factors are good, but we have really hard tasks, use bad tools, and change things.';
    const result = mockEnhance(text, 'PhD');

    expect(result.enhancedText.startsWith('Consequently, it is critical to observe that ')).toBe(true);
    expect(result.enhancedText).toContain('hypothesize'); // think -> hypothesize
    expect(result.enhancedText).toContain('a plethora of'); // a lot of -> a plethora of
    expect(result.enhancedText).toContain('salient'); // good -> salient
    expect(result.enhancedText).toContain('highly challenging'); // really hard -> highly challenging
    expect(result.enhancedText).toContain('utilize'); // use -> utilize
    expect(result.enhancedText).toContain('counterproductive'); // bad -> counterproductive
    expect(result.enhancedText).toContain('fluctuation'); // change -> fluctuation

    expect(result.improvements).toContain('Optimized discourse structure for PhD level thesis rigor (e.g. "use" to "utilize").');
    expect(result.improvements).toContain('implemented rigorous academic terminology');
  });
});

describe('mockPlagiarism', () => {
  it('should return empty values when input is empty or whitespace', () => {
    const result = mockPlagiarism('   ');
    expect(result).toEqual({ riskScore: 0, flaggedSentences: [] });
  });

  it('should return low risk score and no flagged sentences for short/non-triggering text', () => {
    const text = 'Short text. Very short.';
    const result = mockPlagiarism(text);

    expect(result.flaggedSentences.length).toBe(0);
    expect(result.riskScore).toBeGreaterThanOrEqual(2);
    expect(result.riskScore).toBeLessThanOrEqual(12);
  });

  it('should flag matching sentences and calculate correct risk score', () => {
    // To flag, a sentence needs to be > 25 chars.
    // Index will be 0 (idx % 3 === 0), so it should be flagged.
    // Let's verify with 2 sentences:
    // Sentence 1: "This is a very long sentence that has more than twenty-five characters." (idx = 0 -> flagged, idx % 2 === 0 -> High)
    // Sentence 2: "This is defined as a very long sentence that is also flagged." (idx = 1 -> contains 'is defined as' -> flagged, idx % 2 !== 0 -> Medium)
    const text = 'This is a very long sentence that has more than twenty-five characters. This is defined as a very long sentence that is also flagged.';
    const result = mockPlagiarism(text);

    expect(result.flaggedSentences.length).toBe(2);
    expect(result.flaggedSentences[0].sentence).toBe('This is a very long sentence that has more than twenty-five characters.');
    expect(result.flaggedSentences[0].risk).toBe('High');
    
    expect(result.flaggedSentences[1].sentence).toBe('This is defined as a very long sentence that is also flagged.');
    expect(result.flaggedSentences[1].risk).toBe('Medium');

    const expectedScore = 15 + 2 * 22; // 15 + flaggedCount * 22 = 59
    expect(result.riskScore).toBe(expectedScore);
  });
});
