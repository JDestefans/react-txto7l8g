import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseSharedReport, resolveSharedReport, resolveServerSharedReport } from '../services/shareReport';

const GOLD = '#c2964a';
const TEAL = '#1BC9C4';

export default function SharedReport() {
  const [params] = useSearchParams();
  const token = params.get('t') || '';
  const legacyPayload = params.get('d') || '';
  const [passcode, setPasscode] = React.useState('');
  const [submittedPasscode, setSubmittedPasscode] = React.useState('');
  const [serverResult, setServerResult] = React.useState(null);
  const [serverLoading, setServerLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    async function run() {
      if (!token) {
        if (active) setServerResult(null);
        return;
      }
      setServerLoading(true);
      const result = await resolveServerSharedReport(token, submittedPasscode);
      if (active) {
        setServerResult(result);
        setServerLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [token, submittedPasscode]);

  const result = React.useMemo(() => {
    if (token) {
      if (serverResult) return serverResult;
      if (serverLoading) return { loading: true };
      return resolveSharedReport(token, submittedPasscode);
    }
    const legacy = parseSharedReport(legacyPayload);
    return legacy ? { data: legacy, meta: { legacy: true } } : { error: 'not_found' };
  }, [token, submittedPasscode, legacyPayload, serverResult, serverLoading]);

  const data = result?.data || null;

  if (result?.loading) {
    return (
      <div style={{ fontFamily: 'DM Sans,sans-serif', background: '#1C1F22', minHeight: '100vh', color: '#f0f4fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>Loading shared report…</div>
        </div>
      </div>
    );
  }

  if (result?.error === 'passcode_required' || result?.error === 'invalid_passcode') {
    return (
      <div style={{ fontFamily: 'DM Sans,sans-serif', background: '#1C1F22', minHeight: '100vh', color: '#f0f4fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#252A2E', border: '1px solid #2E3439', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>Protected shared report</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>
            Enter the report passcode to continue.
          </div>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #3b444b', background: '#1C1F22', color: '#f0f4fa', marginBottom: 12, fontSize: 13 }}
          />
          {result?.error === 'invalid_passcode' && (
            <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 10 }}>Incorrect passcode. Try again.</div>
          )}
          <button
            onClick={() => setSubmittedPasscode(passcode)}
            style={{ width: '100%', border: 'none', background: TEAL, color: '#0e1515', fontWeight: 700, padding: '10px 12px', borderRadius: 8, cursor: 'pointer' }}
          >
            Unlock report
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ fontFamily: 'DM Sans,sans-serif', background: '#1C1F22', minHeight: '100vh', color: '#f0f4fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Invalid, expired, or revoked report link</div>
          <a href="/" style={{ color: GOLD, fontSize: 14, marginTop: 12, display: 'inline-block' }}>Go to planrr.app</a>
        </div>
      </div>
    );
  }

  const statCard = (label, value, color) => (
    <div style={{ background: '#252A2E', border: '1px solid #2E3439', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || '#f0f4fa', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif', background: '#1C1F22', minHeight: '100vh', color: '#f0f4fa', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: GOLD, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
            Program Compliance Report
          </div>
          <h1 style={{ fontFamily: 'Syne,DM Sans,sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            {data.org}
          </h1>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            {[data.jurisdiction, data.state].filter(Boolean).join(' · ')}
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>
            Generated {new Date(data.generated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          {!result?.meta?.legacy && result?.meta?.expiresAt && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Link expires {new Date(result.meta.expiresAt).toLocaleString()}
            </div>
          )}
        </div>

        <div style={{ background: '#252A2E', border: '1px solid #2E3439', borderRadius: 16, padding: 32, marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: data.compliance.percentage > 75 ? TEAL : data.compliance.percentage > 40 ? GOLD : '#ef4444' }}>
            {data.compliance.percentage}%
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
            EMAP EMS 5-2022 Compliance — {data.compliance.standards} standards
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {statCard('Training Records', data.training.total, TEAL)}
          {statCard('Exercises', data.exercises.total, TEAL)}
          {statCard('With Final AAR', data.exercises.withAAR, data.exercises.withAAR > 0 ? TEAL : '#94a3b8')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {statCard('Partner Agreements', data.partners.total)}
          {statCard('Plans & SOPs', data.plans.total)}
          {statCard('Hazards Profiled', data.hazards)}
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid #2E3439', paddingTop: 20 }}>
          <div style={{ fontSize: 11, color: '#475569' }}>
            Powered by <a href="/" style={{ color: GOLD, textDecoration: 'none' }}>planrr.app</a> — Emergency Management Platform
          </div>
        </div>
      </div>
    </div>
  );
}
