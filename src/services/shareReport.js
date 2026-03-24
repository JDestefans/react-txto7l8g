export function generateShareableReport(data) {
  const overall = { compliant: 0, total: 0, pct: 0 };
  Object.values(data.standards || {}).forEach(s => {
    overall.total++;
    if (s.status === 'compliant') overall.compliant++;
  });
  overall.pct = overall.total ? Math.round((overall.compliant / overall.total) * 100) : 0;

  const report = {
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
      withAAR: (data.exercises || []).filter(e => e.aarFinal).length,
    },
    partners: {
      total: (data.partners || []).length,
      active: (data.partners || []).filter(p => !p.expired).length,
    },
    plans: {
      total: (data.plans || []).length,
    },
    grants: {
      active: (data.grants || []).filter(g => g.status === 'active').length,
    },
    hazards: (data.thira?.hazards || []).length,
  };

  const encoded = btoa(JSON.stringify(report));
  return encoded;
}

export function buildShareURL(data) {
  const payload = generateShareableReport(data);
  return `${window.location.origin}/report?d=${encodeURIComponent(payload)}`;
}

export function parseSharedReport(encodedData) {
  try {
    return JSON.parse(atob(decodeURIComponent(encodedData)));
  } catch {
    return null;
  }
}
