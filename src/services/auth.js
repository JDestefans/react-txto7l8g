export var SB_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ltnbvwnhtsaebyslbhil.supabase.co';
export var SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bmJ2d25odHNhZWJ5c2xiaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTk0NDYsImV4cCI6MjA4OTU5NTQ0Nn0.VrfVyQPiWzVo7VpQJtRyKQgNBtoq3Du-uGCAGsH815c';

export async function sbSignIn(email, pw) {
  const r = await fetch(SB_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SB_KEY },
    body: JSON.stringify({ email, password: pw }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || 'Login failed');
  localStorage.setItem('sb_session', JSON.stringify(d));
  return d;
}

export async function sbSignUp(email, pw, org, name, jur, state) {
  const r = await fetch(SB_URL + '/auth/v1/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SB_KEY },
    body: JSON.stringify({
      email,
      password: pw,
      data: { org_name: org, full_name: name, jurisdiction: jur, state: state },
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || 'Signup failed');
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
    headers: { 'Content-Type': 'application/json', apikey: SB_KEY },
    body: JSON.stringify({ email }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || 'Failed');
  return d;
}

export function isLoggedIn() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!s || !s.access_token) return false;
    const p = JSON.parse(atob(s.access_token.split('.')[1]));
    if (p.exp * 1000 < Date.now()) {
      localStorage.removeItem('sb_session');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
