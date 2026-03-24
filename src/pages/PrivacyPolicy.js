import React from 'react';

const GOLD = '#c2964a';

export default function PrivacyPolicy() {
  return (
    <div style={{
      fontFamily: 'DM Sans,sans-serif', background: '#1C1F22', minHeight: '100vh',
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
          <p>You have the right to access, correct, export, and delete your personal data. Contact us at hello@planrr.app for any privacy-related requests.</p>

          <h2 style={{ color: '#f0f4fa', fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>7. Contact</h2>
          <p>For questions about this privacy policy, contact us at <span style={{ color: GOLD }}>hello@planrr.app</span>.</p>
        </div>
      </div>
    </div>
  );
}
