import React from 'react';

const GOLD = '#c2964a';
const TEAL = '#1BC9C4';

const DATA_NODES_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='60' cy='10' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='100' cy='30' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='40' cy='60' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='80' cy='50' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='10' cy='90' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='60' cy='100' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='100' cy='80' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='110' cy='110' r='1.5' fill='rgba(194,150,74,0.07)'/%3E%3Cline x1='20' y1='20' x2='60' y2='10' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='60' y1='10' x2='100' y2='30' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='20' y1='20' x2='40' y2='60' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='40' y1='60' x2='80' y2='50' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='100' y1='30' x2='80' y2='50' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='40' y1='60' x2='10' y2='90' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='10' y1='90' x2='60' y2='100' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='80' y1='50' x2='100' y2='80' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='60' y1='100' x2='100' y2='80' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='100' y1='80' x2='110' y2='110' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='60' y1='100' x2='110' y2='110' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3C/svg%3E")`;

export default function Founder() {
  return (
    <div style={{
      fontFamily: 'DM Sans,sans-serif', background: '#1C1F22', minHeight: '100vh', backgroundImage: DATA_NODES_BG,
      color: '#f0f4fa',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 40px' }}>
        <a href="/" style={{ color: GOLD, fontSize: 13, textDecoration: 'none', marginBottom: 32, display: 'inline-block' }}>
          &larr; Back to planrr.app
        </a>

        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: GOLD, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 20, height: 1, background: GOLD }} />
          Founder
        </div>

        <h1 style={{ fontFamily: 'Syne,DM Sans,sans-serif', fontSize: 36, fontWeight: 800, marginBottom: 6, letterSpacing: '-1px' }}>
          Jordan R. DeStefans
        </h1>

        <div style={{
          height: 3, width: 60, background: `linear-gradient(90deg, ${TEAL}, ${GOLD})`,
          borderRadius: 2, marginBottom: 32,
        }} />

        <div style={{ color: '#c8d0d8', fontSize: 15, lineHeight: 1.9 }}>
          <p style={{ marginBottom: 24 }}>
            Jordan DeStefans is the founder of planrr.app, a force-multiplying
            emergency management platform designed to help agencies run effective,
            lean, and operationally ready programs — regardless of size, staffing,
            or budget.
          </p>

          <p style={{ marginBottom: 24 }}>
            With a career built inside county-level emergency management, Jordan
            has firsthand experience navigating the realities facing today's
            agencies: shrinking budgets, increasing responsibilities, and growing
            disaster risk. He has led major planning initiatives, managed complex
            grant programs, and built innovative capabilities including a regional
            drone operations group and a public safety GIS program. Across all of
            this work, one challenge remained constant — agencies are expected to
            do more with less, often without the systems to support it.
          </p>

          <div style={{
            borderLeft: `3px solid ${GOLD}`, paddingLeft: 20, margin: '32px 0',
            fontFamily: 'Syne,DM Sans,sans-serif', fontSize: 18, fontWeight: 700,
            lineHeight: 1.6, color: '#f0f4fa',
          }}>
            planrr.app was created to solve that problem.
          </div>

          <p style={{ marginBottom: 24 }}>
            Rather than adding another tool to an already fragmented environment,
            planrr delivers a complete, ready-to-run emergency management
            system — integrating planning, compliance, project tracking, and
            operational readiness into a single, streamlined platform. It is
            purpose-built for agencies that don't have large teams, dedicated
            analysts, or excess time — but are still responsible for protecting
            their communities.
          </p>

          <h2 style={{ fontFamily: 'Syne,DM Sans,sans-serif', fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#f0f4fa' }}>
            Service & Background
          </h2>

          <p style={{ marginBottom: 24 }}>
            Jordan is a disabled veteran of the U.S. Army Reserve, serving since
            2011. His military experience includes operating in the Pacific during
            periods of heightened geopolitical tension and leading a COVID-19
            response team, where he developed a deep understanding of operating
            under pressure, managing uncertainty, and leading in high-stakes
            environments.
          </p>

          <p style={{ marginBottom: 24 }}>
            He brings a "pracademic" perspective to his work, combining real-world
            operational leadership paired with doctoral-level research in public
            administration, leadership, and organizational performance. His
            approach is grounded in Lean principles, focusing on eliminating
            inefficiencies, simplifying complexity, and building systems that
            actually work.
          </p>

          <h2 style={{ fontFamily: 'Syne,DM Sans,sans-serif', fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#f0f4fa' }}>
            The Mission
          </h2>

          <div style={{
            background: 'rgba(194,150,74,0.06)', border: '1px solid rgba(194,150,74,0.22)',
            borderRadius: 12, padding: '28px 32px', marginTop: 16,
          }}>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#f0f4fa', fontWeight: 500, margin: 0 }}>
              To give every emergency management program — especially the
              understaffed and underfunded — the tools to operate at a higher
              level without requiring more people, more time, or more money.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #2E3439', marginTop: 48, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontFamily: 'Oxanium,DM Sans,sans-serif', fontSize: 15, fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#f0f4fa' }}>planrr</span>
            <span style={{ color: GOLD }}>.app</span>
          </div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: '#475569' }}>
            helloplanrr.app@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
}
