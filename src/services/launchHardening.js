import { SB_KEY, SB_URL } from './auth';

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('sb_session') || 'null');
  } catch {
    return null;
  }
}

function authHeaders(requireAuth = true) {
  const session = getSession();
  const token = session?.access_token || null;
  if (requireAuth && !token) throw new Error('Please sign in first.');
  return {
    'Content-Type': 'application/json',
    apikey: SB_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function callEdge(path, body, { requireAuth = true } = {}) {
  const res = await fetch(`${SB_URL}/functions/v1/${path}`, {
    method: 'POST',
    headers: authHeaders(requireAuth),
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function createSecureShareServer(payload) {
  const data = await callEdge('secure-share', {
    action: 'create',
    ...payload,
  });
  return {
    token: data?.token || '',
    url:
      data?.url ||
      `${window.location.origin}/report?t=${encodeURIComponent(data?.token || '')}`,
    expiresAt: data?.expiresAt || null,
    requiresPasscode: !!data?.requiresPasscode,
    mode: 'server',
  };
}

export async function listSecureSharesServer(limit = 20) {
  const data = await callEdge('secure-share', {
    action: 'list',
    limit,
  });
  return Array.isArray(data?.links) ? data.links : [];
}

export async function revokeSecureShareServer(token) {
  const data = await callEdge('secure-share', {
    action: 'revoke',
    token,
  });
  return !!data?.revoked;
}

export async function resolveSecureShareServer(token, passcode = '') {
  try {
    const data = await callEdge(
      'secure-share',
      {
        action: 'resolve',
        token,
        passcode,
      },
      { requireAuth: false }
    );
    return data;
  } catch (err) {
    return { error: err?.message || 'Unable to resolve secure share link.' };
  }
}

export async function sendIntegrationProbe(kind, url, message) {
  return callEdge('integration-dispatch', {
    action: 'probe',
    kind,
    url,
    message,
  });
}

export async function runCalendarSync(payload) {
  return callEdge('integration-dispatch', {
    action: 'calendar_sync',
    ...payload,
  });
}

export async function fetchAuthHealth() {
  return callEdge('auth-health', {});
}

export async function fetchOpsReadiness() {
  return callEdge('integration-dispatch', { action: 'status' });
}

