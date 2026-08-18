import { describe, it, expect } from 'vitest';
import { getTipsList, getDailyTip, DAILY_TIPS_DATA } from '../data/dailyTips';

describe('dailyTips', () => {
  it('returns valid tips list for each category in fr, en, es', () => {
    const categories = ['creator', 'cv', 'letter'];
    const languages = ['fr', 'en', 'es'];

    for (const cat of categories) {
      for (const lang of languages) {
        const list = getTipsList(cat, lang);
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);
        for (const tip of list) {
          expect(tip.id).toBeDefined();
          expect(tip.title).toBeDefined();
          expect(tip.description).toBeDefined();
          expect(tip.source).toBeDefined();
          expect(tip.actionable).toBeDefined();
          expect(tip.appAction).toBeDefined();
        }
      }
    }
  });

  it('getDailyTip returns specific tip by index or falls back to today day-of-week modulo', () => {
    const tip0 = getDailyTip('creator', 0, 'fr');
    expect(tip0.id).toBe('cr_1');

    const defaultTip = getDailyTip('creator', null, 'fr');
    expect(defaultTip).toBeDefined();
    expect(defaultTip.title).toBeDefined();
  });

  it('falls back to French if unknown language is provided', () => {
    const fallbackList = getTipsList('creator', 'de');
    expect(fallbackList).toEqual(DAILY_TIPS_DATA.creator.fr);
  });
});
