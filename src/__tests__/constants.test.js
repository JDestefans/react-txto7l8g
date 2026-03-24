import { VIEW_TITLES, B, ST, GOLD } from '../constants';

describe('constants', () => {
  test('VIEW_TITLES has all expected views', () => {
    expect(VIEW_TITLES.dashboard).toBe('Dashboard');
    expect(VIEW_TITLES.accreditation).toBe('EMAP Standards');
    expect(VIEW_TITLES.assistant).toBe('AI Assistant');
    expect(Object.keys(VIEW_TITLES).length).toBeGreaterThanOrEqual(20);
  });

  test('B has brand colors', () => {
    expect(B.teal).toBe('#1BC9C4');
    expect(B.sidebar).toBe('#1C1F22');
    expect(B.card).toBe('#FFFFFF');
  });

  test('ST has status definitions', () => {
    expect(ST.not_started.label).toBe('Not Started');
    expect(ST.compliant.label).toBe('Compliant');
    expect(ST.in_progress.label).toBe('In Progress');
  });

  test('GOLD is defined', () => {
    expect(GOLD).toBe('#c2964a');
  });
});
