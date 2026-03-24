const SB_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ltnbvwnhtsaebyslbhil.supabase.co';
const SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bmJ2d25odHNhZWJ5c2xiaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTk0NDYsImV4cCI6MjA4OTU5NTQ0Nn0.VrfVyQPiWzVo7VpQJtRyKQgNBtoq3Du-uGCAGsH815c';

const STRIPE_PRICE_IDS = {
  solo: process.env.REACT_APP_STRIPE_SOLO_PRICE_ID || null,
  small_team: process.env.REACT_APP_STRIPE_SMALL_TEAM_PRICE_ID || null,
  full_program: process.env.REACT_APP_STRIPE_FULL_PROGRAM_PRICE_ID || null,
};

function getToken() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    return s?.access_token || null;
  } catch { return null; }
}

export async function createCheckoutSession(planId) {
  const priceId = STRIPE_PRICE_IDS[planId];
  if (!priceId) {
    throw new Error('Stripe is not yet configured for this plan. Contact hello@planrr.app for early access.');
  }
  const token = getToken();
  if (!token) throw new Error('Please sign in first');
  const r = await fetch(SB_URL + '/functions/v1/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SB_KEY,
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({ price_id: priceId, plan_id: planId }),
  });
  if (!r.ok) throw new Error('Failed to create checkout session');
  const d = await r.json();
  if (d.url) window.location.href = d.url;
  return d;
}

export async function openBillingPortal() {
  const token = getToken();
  if (!token) throw new Error('Please sign in first');
  const r = await fetch(SB_URL + '/functions/v1/billing-portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SB_KEY,
      Authorization: 'Bearer ' + token,
    },
  });
  if (!r.ok) throw new Error('Failed to open billing portal');
  const d = await r.json();
  if (d.url) window.location.href = d.url;
  return d;
}

export async function getSubscriptionStatus() {
  const token = getToken();
  if (!token) return { plan: 'solo', status: 'trialing', trialEnd: null };
  try {
    const r = await fetch(SB_URL + '/rest/v1/subscriptions?select=*&limit=1', {
      headers: {
        apikey: SB_KEY,
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    });
    if (!r.ok) return { plan: 'solo', status: 'trialing', trialEnd: null };
    const rows = await r.json();
    if (rows.length > 0) return rows[0];
    return { plan: 'solo', status: 'trialing', trialEnd: null };
  } catch {
    return { plan: 'solo', status: 'trialing', trialEnd: null };
  }
}

export function isTrialExpired(trialEnd) {
  if (!trialEnd) return false;
  return new Date(trialEnd) < new Date();
}

export function daysLeftInTrial(trialEnd) {
  if (!trialEnd) return 14;
  const ms = new Date(trialEnd) - new Date();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
