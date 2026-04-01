export var SB_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ltnbvwnhtsaebyslbhil.supabase.co';
export var SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bmJ2d25odHNhZWJ5c2xiaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTk0NDYsImV4cCI6MjA4OTU5NTQ0Nn0.VrfVyQPiWzVo7VpQJtRyKQgNBtoq3Du-uGCAGsH815c';

async function parseAuthResponse(r, fallbackMessage) {
  let d = {};
  try { d = await r.json(); } catch {}
  if (!r.ok || d.error) {
    const errorObj = d?.error;
    const message =
      d?.error_description ||
      (typeof errorObj === 'string' ? errorObj : errorObj?.message) ||
      d?.msg ||
      d?.message ||
      fallbackMessage;
    throw new Error(message);
  }
  return d;
}

function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export async function sbSignIn(email, pw) {
  const r = await fetch(SB_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SB_KEY,
    },
    body: JSON.stringify({ email: String(email || '').trim().toLowerCase(), password: pw }),
  });
  const d = await parseAuthResponse(r, 'Login failed');
  if (!d.access_token) throw new Error('Login failed: missing session token');
  localStorage.setItem('sb_session', JSON.stringify(d));
  return d;
}

export async function sbSignUp(email, pw, org, name, jur, state) {
  const r = await fetch(SB_URL + '/auth/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SB_KEY,
    },
    body: JSON.stringify({
      email: String(email || '').trim().toLowerCase(),
      password: pw,
      data: { org_name: org, full_name: name, jurisdiction: jur, state: state },
    }),
  });
  const d = await parseAuthResponse(r, 'Signup failed');
  return d;
}

export async function sbSignOut() {
  const s = JSON.parse(localStorage.getItem('sb_session') || '{}');
  if (s.access_token)
    await fetch(SB_URL + '/auth/v1/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SB_KEY,
        Authorization: 'Bearer ' + s.access_token,
      },
    });
  localStorage.removeItem('sb_session');
  window.location.reload();
}

export async function sbReset(email) {
  const r = await fetch(SB_URL + '/auth/v1/recover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SB_KEY,
    },
    body: JSON.stringify({ email: String(email || '').trim().toLowerCase() }),
  });
  const d = await parseAuthResponse(r, 'Failed to send reset link');
  return d;
}

export function isLoggedIn() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!s || !s.access_token) return false;
    const p = decodeJwtPayload(s.access_token);
    if (!p || !p.exp) return false;
    if (p.exp * 1000 < Date.now()) {
      localStorage.removeItem('sb_session');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
