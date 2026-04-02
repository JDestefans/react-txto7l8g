const SHARE_STORE_KEY = 'planrr_shared_reports_v1';

function encode(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return '';
  }
}

function decode(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return '';
  }
}

function hashPasscode(passcode) {
  return encode(`planrr-share-v1:${String(passcode || '').trim()}`);
}

function randomToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SHARE_STORE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStore(entries) {
  try {
    localStorage.setItem(SHARE_STORE_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {}
}

export function generateShareableReport(data) {
  const overall = { compliant: 0, total: 0, pct: 0 };
  Object.values(data.standards || {}).forEach((s) => {
    overall.total++;
    if (s.status === 'compliant') overall.compliant++;
  });
  overall.pct = overall.total
    ? Math.round((overall.compliant / overall.total) * 100)
    : 0;

  return {
    org: data.orgName || 'Unknown',
    jurisdiction: data.jurisdiction || '',
    state: data.state || '',
    generated: new Date().toISOString(),
    compliance: {
      standards: `${overall.compliant}/${overall.total}`,
      percentage: overall.pct,
    },
    training: {
      total: (data.training || []).length,
      personnel: (data.employees || []).length,
    },
    exercises: {
      total: (data.exercises || []).length,
      withAAR: (data.exercises || []).filter((e) => e.aarFinal).length,
    },
    partners: {
      total: (data.partners || []).length,
      active: (data.partners || []).filter((p) => !p.expired).length,
    },
    plans: {
      total: (data.plans || []).length,
    },
    grants: {
      active: (data.grants || []).filter((g) => g.status === 'active').length,
    },
    hazards: (data.thira?.hazards || []).length,
  };
}

export function createShareLink(data, options = {}) {
  const expiresInHours = Math.max(1, Number(options.expiresInHours || 168));
  const passcode = String(options.passcode || '').trim();
  const token = randomToken();
  const now = Date.now();
  const report = generateShareableReport(data);
  const entry = {
    token,
    report,
    createdAt: now,
    expiresAt: now + expiresInHours * 60 * 60 * 1000,
    revoked: false,
    accessCount: 0,
    lastAccessedAt: null,
    requiresPasscode: !!passcode,
    passcodeHash: passcode ? hashPasscode(passcode) : null,
    org: report.org,
    compliancePct: report.compliance.percentage,
  };
  const next = [entry, ...getStore()];
  saveStore(next);
  return {
    token,
    url: `${window.location.origin}/report?t=${encodeURIComponent(token)}`,
    expiresAt: entry.expiresAt,
    requiresPasscode: entry.requiresPasscode,
  };
}

export function buildShareURL(data, options = {}) {
  return createShareLink(data, options).url;
}

export function listShareLinks() {
  return getStore().map((e) => ({
    token: e.token,
    createdAt: e.createdAt,
    expiresAt: e.expiresAt,
    revoked: !!e.revoked,
    accessCount: e.accessCount || 0,
    lastAccessedAt: e.lastAccessedAt || null,
    requiresPasscode: !!e.requiresPasscode,
    org: e.org || '',
    compliancePct: e.compliancePct || 0,
  }));
}

export function revokeShareLink(token) {
  const t = String(token || '').trim();
  if (!t) return false;
  let changed = false;
  const next = getStore().map((entry) => {
    if (entry.token !== t) return entry;
    changed = true;
    return { ...entry, revoked: true };
  });
  if (changed) saveStore(next);
  return changed;
}

export function resolveSharedReport(token, passcode) {
  const t = String(token || '').trim();
  if (!t) return { error: 'missing_token' };
  const entries = getStore();
  const idx = entries.findIndex((e) => e.token === t);
  if (idx < 0) return { error: 'not_found' };
  const entry = entries[idx];
  if (entry.revoked) return { error: 'revoked' };
  if (entry.expiresAt && Date.now() > entry.expiresAt) return { error: 'expired' };
  if (entry.requiresPasscode) {
    if (!passcode) return { error: 'passcode_required' };
    if (hashPasscode(passcode) !== entry.passcodeHash) {
      return { error: 'invalid_passcode' };
    }
  }
  const updated = {
    ...entry,
    accessCount: (entry.accessCount || 0) + 1,
    lastAccessedAt: Date.now(),
  };
  entries[idx] = updated;
  saveStore(entries);
  return {
    data: updated.report,
    meta: {
      token: updated.token,
      expiresAt: updated.expiresAt,
      accessCount: updated.accessCount,
      lastAccessedAt: updated.lastAccessedAt,
      requiresPasscode: updated.requiresPasscode,
    },
  };
}

export function parseSharedReport(encodedData) {
  try {
    return JSON.parse(decode(decodeURIComponent(encodedData)));
  } catch {
    return null;
  }
}
