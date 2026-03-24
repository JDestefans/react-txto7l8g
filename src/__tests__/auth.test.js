import { SB_URL, SB_KEY, isLoggedIn } from '../services/auth';

describe('auth service', () => {
  test('SB_URL is defined', () => {
    expect(SB_URL).toContain('supabase.co');
  });

  test('SB_KEY is a JWT', () => {
    expect(SB_KEY).toMatch(/^eyJ/);
    const parts = SB_KEY.split('.');
    expect(parts.length).toBe(3);
  });

  test('isLoggedIn returns false with no session', () => {
    localStorage.removeItem('sb_session');
    expect(isLoggedIn()).toBe(false);
  });

  test('isLoggedIn returns false with invalid session', () => {
    localStorage.setItem('sb_session', 'not-json');
    expect(isLoggedIn()).toBe(false);
    localStorage.removeItem('sb_session');
  });
});
