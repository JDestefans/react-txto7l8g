import React from 'react';

const GOLD = '#c2964a';

const DATA_NODES_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='60' cy='10' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='100' cy='30' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='40' cy='60' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='80' cy='50' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='10' cy='90' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='60' cy='100' r='1.5' fill='rgba(194,150,74,0.08)'/%3E%3Ccircle cx='100' cy='80' r='1' fill='rgba(194,150,74,0.06)'/%3E%3Ccircle cx='110' cy='110' r='1.5' fill='rgba(194,150,74,0.07)'/%3E%3Cline x1='20' y1='20' x2='60' y2='10' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='60' y1='10' x2='100' y2='30' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='20' y1='20' x2='40' y2='60' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='40' y1='60' x2='80' y2='50' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='100' y1='30' x2='80' y2='50' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='40' y1='60' x2='10' y2='90' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='10' y1='90' x2='60' y2='100' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='80' y1='50' x2='100' y2='80' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='60' y1='100' x2='100' y2='80' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='100' y1='80' x2='110' y2='110' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3Cline x1='60' y1='100' x2='110' y2='110' stroke='rgba(194,150,74,0.04)' stroke-width='0.5'/%3E%3C/svg%3E")`;

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p style={{ color: '#475569', fontSize: 12, fontFamily: 'DM Mono,monospace', marginBottom: 32 }}>
          Last updated: March 2026
        </p>

        <div style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.8 }}>
          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. Information We Collect</h2>
          <p>When you create an account, we collect your name, email address, organization name, jurisdiction type, and state. When you use the platform, we store your program data including EMAP standards tracking, training records, exercise records, partner agreements, plans, and related operational data.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. How We Use Your Information</h2>
          <p>We use your information solely to provide and improve the planrr.app platform. Your program data is used to generate compliance reports, AI-powered recommendations, and accreditation tracking. We do not sell or share your data with third parties for marketing purposes.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. Data Storage & Security</h2>
          <p>Your data is stored on Supabase infrastructure with encryption at rest (AES-256) and in transit (TLS 1.2+). Access is authenticated and scoped to your organization. We maintain automated backups with point-in-time recovery capabilities.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>4. AI Features</h2>
          <p>When you use AI-powered features, your prompts and document content are sent to our AI processing endpoint. This data is used solely to generate responses and is not retained by the AI provider for training purposes.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>5. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You can export your data at any time using the JSON export feature. Upon account deletion, your data will be removed within 30 days.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>6. Your Rights</h2>
          <p>You have the right to access, correct, export, and delete your personal data. Contact us at helloplanrr.app@gmail.com for any privacy-related requests.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>7. Contact</h2>
          <p>For questions about this privacy policy, contact us at <span style={{ color: GOLD }}>helloplanrr.app@gmail.com</span>.</p>
        </div>
      </div>
    </div>
  );
}
