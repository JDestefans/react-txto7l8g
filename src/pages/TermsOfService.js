import React from 'react';

const GOLD = '#c2964a';

const DATA_NODES_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='60' cy='10' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='100' cy='30' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='40' cy='60' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='80' cy='50' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='10' cy='90' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='60' cy='100' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='100' cy='80' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='110' cy='110' r='1.5' fill='rgba(194,150,74,0.07)'/%3E%3Cline x1='20' y1='20' x2='60' y2='10' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='60' y1='10' x2='100' y2='30' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='20' y1='20' x2='40' y2='60' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='40' y1='60' x2='80' y2='50' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='100' y1='30' x2='80' y2='50' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='40' y1='60' x2='10' y2='90' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='10' y1='90' x2='60' y2='100' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='80' y1='50' x2='100' y2='80' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='60' y1='100' x2='100' y2='80' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='100' y1='80' x2='110' y2='110' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='60' y1='100' x2='110' y2='110' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3C/svg%3E")`;

export default function TermsOfService() {
  return (
    <div style={{
      fontFamily: 'DM Sans,sans-serif', background: '#1C1F22', minHeight: '100vh', backgroundImage: DATA_NODES_BG,
      color: '#f0f4fa', padding: '60px 40px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <a href="/" style={{ color: GOLD, fontSize: 13, textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>
          &larr; Back to planrr.app
        </a>
        <h1 style={{ fontFamily: 'Syne,DM Sans,sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Terms of Service
        </h1>
        <p style={{ color: '#475569', fontSize: 12, fontFamily: 'DM Mono,monospace', marginBottom: 32 }}>
          Last updated: March 2026
        </p>

        <div style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.8 }}>
          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. Acceptance of Terms</h2>
          <p>By accessing or using planrr.app, you agree to be bound by these Terms of Service. If you are using the platform on behalf of an organization, you represent that you have the authority to bind that organization to these terms.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. Service Description</h2>
          <p>planrr.app is an emergency management program platform designed to help organizations track EMAP EMS 5-2022 compliance, manage training, exercises, partners, and operational readiness. The platform includes AI-powered features for document analysis and accreditation guidance.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. Accounts & Plans</h2>
          <p>You must create an account to use the platform. Each plan includes defined user seats and monthly AI usage limits. You are responsible for maintaining the security of your account credentials. Larger teams are expected to be on higher-tier plans corresponding to their team size.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>4. Free Trial</h2>
          <p>New accounts receive a 14-day free trial with full platform access. After the trial period, a paid subscription is required to continue using the platform. We reserve the right to limit free trial access to one trial per organization.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>5. Acceptable Use</h2>
          <p>You agree not to misuse the platform, including but not limited to: creating multiple accounts to circumvent plan limits, reverse engineering the AI features, or using the platform for purposes other than emergency management program administration.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>6. Data Ownership</h2>
          <p>You retain ownership of all program data you enter into the platform. We do not claim any intellectual property rights over your content. You grant us a limited license to process your data solely for the purpose of providing the service.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>7. Limitation of Liability</h2>
          <p>planrr.app is a program management tool and does not replace professional emergency management expertise. Compliance determinations, accreditation decisions, and operational readiness assessments remain the responsibility of the user organization. The platform is provided "as is" without warranties of any kind.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>8. Contact</h2>
          <p>For questions about these terms, contact us at <span style={{ color: GOLD }}>helloplanrr.app@gmail.com</span>.</p>
        </div>
      </div>
    </div>
  );
}
