import { SB_URL, SB_KEY, isLoggedIn } from '../services/auth';

function makeBase64Url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function makeSession(expSecondsFromNow) {
  const payload = { exp: Math.floor(Date.now() / 1000) + expSecondsFromNow };
  return {
    access_token: `${makeBase64Url({ alg: 'HS256', typ: 'JWT' })}.${makeBase64Url(payload)}.sig`,
  };
}

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

  test('isLoggedIn handles base64url token payloads', () => {
    localStorage.setItem('sb_session', JSON.stringify(makeSession(3600)));
    expect(isLoggedIn()).toBe(true);
    localStorage.removeItem('sb_session');
  });

  test('isLoggedIn clears expired sessions', () => {
    localStorage.setItem('sb_session', JSON.stringify(makeSession(-60)));
    expect(isLoggedIn()).toBe(false);
    expect(localStorage.getItem('sb_session')).toBe(null);
  });
});
