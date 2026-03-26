import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const GOLD = '#C49A3C';
const TEAL = '#3ECFCF';

const FAQ_SECTIONS = [
  {
    id: 'what-is',
    icon: '🧭',
    title: "What is planrr.app?",
    desc: "Start here. Everything else makes more sense once you understand what planrr.app is — and what it isn't.",
    color: TEAL,
    items: [
      {
        q: "What is planrr.app?",
        a: `<p><strong>planrr.app is an all-in-one emergency management program platform</strong> — built to help EM programs operate at a high standard every day.</p>
<p>It combines everything an EM program needs to run and improve in one place: EMAP standards tracking, plans and SOPs, exercises and AARs, partner and MOU management, personnel and training records, grants and funding, and AI-powered guidance on what to work on next.</p>
<div class="pf-callout gold"><strong>The short version:</strong> planrr.app doesn't make the plan survive first contact. It makes your organization tough enough that it doesn't need to.</div>
<p>It's built around <strong>EMAP EMS 5-2022</strong> (all 73 standards), <strong>HSEEP</strong> for exercises, and <strong>CPG 201</strong> for threat and hazard analysis — so the framework is already there when you start.</p>
<p>It is <span style="color:${TEAL}">not</span> a real-time incident response tool. It doesn't replace WebEOC, E-Team, or ICS tools during an active event. It's the platform that makes sure your people are trained, your plans are current, and your organization is ready before the incident starts.</p>`,
      },
      {
        q: "Who is it built for?",
        a: `<p>planrr.app was built for <strong>any organization that runs an emergency management program</strong> — and specifically for the people doing that work with limited staff and limited budget.</p>
<ul><li><strong>County and municipal EM agencies</strong> — solo directors and small teams managing full programs without full departments</li>
<li><strong>Hospitals and universities</strong> — institutional EM programs meeting EMAP, Joint Commission, SACSCOC, and other accreditation requirements</li>
<li><strong>Private sector EM teams</strong> — Amtrak became the first private sector organization to earn EMAP accreditation; the standard now clearly applies beyond government</li>
<li><strong>State EM agencies</strong> — multi-org programs needing oversight at scale</li></ul>
<p>Over <strong>50% of local EM agencies have one or fewer full-time permanent staff</strong> (Argonne National Laboratory, 2025). planrr.app is purpose-built for that reality.</p>`,
      },
      {
        q: 'What does "end-to-end EM system" actually mean?',
        a: `<p>It means every module your program needs is already built, structured, and connected — you don't assemble it from scratch.</p>
<ul><li>All 73 EMAP standards pre-loaded and organized</li>
<li>Exercise scheduling, documentation, and AAR-to-gap linkage built in</li>
<li>MOU and partner tracking with expiration alerts</li>
<li>Training records and credential tracking tied to standards</li>
<li>COOP and plan management as live documents, not file uploads</li>
<li>Grant tracking and EMPG documentation support</li>
<li>AI assistant that tells you what to work on next</li></ul>
<p>Most importantly, <strong>every module talks to every other module</strong>. An exercise finding automatically surfaces as a gap in your EMAP tracker. A lapsed MOU shows up in your priority queue. Your compliance picture builds as you work — you don't maintain it separately.</p>`,
      },
    ],
  },
  {
    id: 'em-director',
    icon: '🏛️',
    title: 'For EM Directors',
    desc: "The questions you'll ask before recommending this to your leadership.",
    color: GOLD,
    items: [
      {
        q: "Does it actually know EMAP or is it generic compliance software relabeled?",
        a: `<p><strong>It actually knows EMAP.</strong> All 73 standards from ANSI/EMAP EMS 5-2022 are built directly into the platform — not imported from a spreadsheet, not approximated.</p>
<p>The platform is also built around <strong>HSEEP</strong> for exercises and <strong>CPG 201</strong> for threat and hazard identification.</p>
<div class="pf-callout">When EMAP updates its standards, planrr.app updates automatically. Your existing compliance data is preserved, and changed standards are flagged for review.</div>`,
      },
      {
        q: "Will this replace my spreadsheets or just add another thing to maintain?",
        a: `<p>The goal is to replace them entirely. planrr.app is designed to be the single system of record for your program.</p>
<p>Most programs get up and running within a single working day because the standards framework is pre-loaded.</p>
<div class="pf-callout gold">The real test: if planrr.app requires you to maintain a separate spreadsheet to use it properly, we've failed. That's a design principle, not just a talking point.</div>`,
      },
      {
        q: "How long does setup actually take?",
        a: `<p><strong>Most programs are operational within a single working day.</strong></p>
<ul><li>Day 1: Setup, review the pre-loaded standards, start marking current status</li>
<li>Week 1: Load existing plans, MOUs, training records, and personnel</li>
<li>Week 2–4: Priority queue starts surfacing gaps; program picture becomes clear</li></ul>`,
      },
      {
        q: "Can I import what I already have?",
        a: `<p>You don't start from zero. The AI Bulk Document Intake feature lets you upload existing plans, SOPs, and documentation — the AI reads them and maps content to the relevant standards automatically.</p>
<div class="pf-callout">You also don't have to import everything before you start getting value. Many programs begin by using the standards tracker and priority queue immediately while migrating documents in the background.</div>`,
      },
      {
        q: "Is this built by people who understand emergency management?",
        a: `<p>Yes. planrr.app was built by and with emergency management practitioners — not adapted from a generic compliance tool by developers who learned EM from Wikipedia.</p>
<div class="pf-callout gold">Founding agency customers have direct input into the product roadmap. If something doesn't reflect how EM programs actually work, we want to know — and we'll fix it.</div>`,
      },
    ],
  },
  {
    id: 'procurement',
    icon: '💰',
    title: 'Procurement & Finance',
    desc: "The questions your finance and grants office will ask before cutting a PO.",
    color: '#22C55E',
    items: [
      {
        q: "Can we pay annually by purchase order?",
        a: `<p><strong>Yes — annual invoicing and PO billing are available on all plans.</strong></p>
<p>Contact us at helloplanrr.app@gmail.com and we'll issue a formal quote, W-9, and PO-compatible invoice.</p>
<div class="pf-callout green">Annual billing saves 20%. Solo $750/yr · Small Team $1,500/yr · Full Program $2,000/yr.</div>`,
      },
      {
        q: "Is this EMPG-eligible?",
        a: `<p>planrr.app is designed to be an allowable EMPG expense. We recommend confirming with your State Emergency Management Agency.</p>
<div class="pf-callout gold">For many county programs, the Solo plan at $750/year can come entirely out of existing EMPG allocations — effectively making planrr.app free from your local budget.</div>`,
      },
      {
        q: "Who owns our data if we cancel?",
        a: `<p><strong>You own your data. Always.</strong> Export in PDF, CSV, or JSON at any time. On cancellation, data remains available for 90 days, then permanently deleted.</p>`,
      },
      {
        q: 'What does "founding pricing locked for life" mean?',
        a: `<p>Founding agency customers receive <strong>50% off their chosen plan, permanently</strong>. As we raise prices for new customers, your rate stays fixed.</p>
<div class="pf-callout gold">This is documented in your subscription agreement — not a verbal promise. The founding cohort is closing at the end of this month.</div>`,
      },
    ],
  },
  {
    id: 'it-security',
    icon: '🔒',
    title: 'IT & Security',
    desc: "The questions your IT department will ask before approving a new SaaS tool.",
    color: '#8B5CF6',
    items: [
      {
        q: "Where is data hosted and who has access?",
        a: `<p>US-based cloud infrastructure. Customer data is logically isolated per organization. All data encrypted via TLS 1.3 in transit and AES-256 at rest.</p>`,
      },
      {
        q: "Is it SOC 2 compliant?",
        a: `<p>We are working toward SOC 2 Type II. We can provide security documentation and architecture overview on request.</p>
<div class="pf-callout">If SOC 2 is a hard requirement, start with the 14-day trial while your security review is in progress. Contact helloplanrr.app@gmail.com.</div>`,
      },
      {
        q: "Is our program data sensitive enough to matter?",
        a: `<p>Yes. EM program data includes facility locations, resource inventories, personnel info, and succession plans.</p>
<div class="pf-callout red">planrr.app is not FedRAMP authorized and is not designed for classified information. Do not store classified materials in the platform.</div>`,
      },
    ],
  },
  {
    id: 'leadership',
    icon: '📊',
    title: 'Leadership & Executive',
    desc: "The questions your board, county commissioners, or C-suite will ask.",
    color: TEAL,
    items: [
      {
        q: "Why can't we just use SharePoint and a spreadsheet?",
        a: `<p>You can. The question is whether that approach produces a ready organization — or just a documented one.</p>
<ul><li>Tells you when a plan is going stale and needs review</li>
<li>Alerts you when an MOU expires or a training certification lapses</li>
<li>Connects an exercise finding to the specific EMAP standard it reveals a gap in</li>
<li>Shows leadership a real-time program health dashboard</li></ul>
<div class="pf-callout gold">The tools aren't the problem — the maintenance discipline is. planrr.app makes that discipline automatic, not aspirational.</div>`,
      },
      {
        q: "What's the ROI?",
        a: `<p>Three angles:</p>
<ul><li><strong>Accreditation and funding:</strong> EMAP-accredited programs receive greater funding opportunities and credibility</li>
<li><strong>FEMA Preparedness scores:</strong> Accredited states score measurably higher</li>
<li><strong>Risk and liability:</strong> A documented, maintained program reduces organizational exposure</li></ul>
<div class="pf-callout green">At $79–$199/month, planrr.app costs less than one hour of an EM consultant's time. Per month.</div>`,
      },
      {
        q: "If our EM director leaves, can someone else pick this up?",
        a: `<p><strong>This is one of the most important problems planrr.app solves.</strong> Most EM programs run on institutional knowledge — one person's head.</p>
<p>planrr.app is the institutional memory your program needs to survive staff turnover. The priority queue tells a new director exactly where to start.</p>`,
      },
    ],
  },
  {
    id: 'deal-killers',
    icon: '⚠️',
    title: 'The Hard Questions',
    desc: "The five questions that kill deals if they go unanswered.",
    color: '#EF4444',
    items: [
      {
        q: "We already have PowerDMS. Why do we need planrr.app?",
        kill: true,
        a: `<p><strong>PowerDMS/PowerStandards</strong> is EMAP's official self-assessment tool. It tracks whether you're compliant.</p>
<p><strong>planrr.app</strong> helps you <em>get and stay</em> compliant through exercises, training, plan maintenance, and partner management.</p>
<div class="pf-callout gold">If your program is already running perfectly, PowerDMS may be sufficient. If your program needs operational infrastructure — that's where planrr.app fills the gap. Many organizations will use both.</div>`,
      },
      {
        q: "Our IT won't approve without security documentation.",
        kill: true,
        a: `<p>We have security documentation available. Email helloplanrr.app@gmail.com with "Security Review Request" and we'll send architecture overview, data handling policy, and encryption specs.</p>`,
      },
      {
        q: "We're mid-accreditation cycle. Bad time to switch.",
        kill: true,
        a: `<p>Mid-cycle is actually a reasonable time to <em>add</em> planrr.app — you can layer it as your operational layer while PowerDMS handles formal documentation.</p>
<div class="pf-callout gold">The programs that find reaccreditation most painful are the ones that let the system go dormant between cycles. planrr.app prevents that.</div>`,
      },
      {
        q: "I'm the only staff. No time to learn a new platform.",
        kill: true,
        a: `<p>This is the exact person planrr.app was built for.</p>
<ul><li>Account setup: 10 minutes</li>
<li>Standards loaded automatically: 0 minutes</li>
<li>Priority queue populated: same day</li>
<li>Useful from day one: yes</li></ul>
<div class="pf-callout green">Try it for two weeks with your actual data. If it takes more time than it saves, cancel.</div>`,
      },
      {
        q: "What if planrr.app goes out of business?",
        kill: true,
        a: `<p><strong>You own your data.</strong> Full export in PDF, CSV, JSON at any time. 90-day notice if we cease operations. No proprietary lock-in.</p>
<div class="pf-callout gold">Government agencies think in decades. We respect that. Your program data belongs to your organization — always.</div>`,
      },
    ],
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: `1px solid ${open ? 'rgba(196,154,60,0.26)' : '#242424'}`,
      marginBottom: 6, transition: 'border-color 0.2s',
    }}>
      <div onClick={() => setOpen(p => !p)} style={{
        padding: '16px 20px', cursor: 'pointer', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', gap: 16, userSelect: 'none',
      }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, lineHeight: 1.3, flex: 1, color: open ? GOLD : '#fff' }}>
          {item.q}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {item.kill && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 6px', letterSpacing: '0.08em' }}>DEAL KILLER</span>}
          <span style={{ fontSize: 18, color: open ? GOLD : '#484848', transition: 'transform 0.25s, color 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
        </div>
      </div>
      {open && (
        <div
          style={{ padding: '0 20px 20px', fontSize: 13.5, color: '#8A9BB0', lineHeight: 1.8, fontWeight: 300, animation: 'fadeUp 0.25s ease' }}
          dangerouslySetInnerHTML={{ __html: item.a }}
        />
      )}
    </div>
  );
}

export default function FAQ() {
  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState('what-is');

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setActiveSection(e.target.id);
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    FAQ_SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#111111', color: '#fff', minHeight: '100vh' }}>
      <style>{`
        .pf-callout{background:#1e1e1e;border-left:3px solid ${TEAL};padding:12px 16px;margin:12px 0;font-size:13px}
        .pf-callout.gold{border-left-color:${GOLD}}
        .pf-callout.green{border-left-color:#22C55E}
        .pf-callout.red{border-left-color:#EF4444;background:rgba(239,68,68,0.08)}
        .pf-callout strong{color:#fff;font-weight:500}
        @keyframes fadeUp{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:860px){.pf-layout{grid-template-columns:1fr!important}.pf-sidebar{position:static!important}}
      `}</style>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(17,17,17,0.97)', borderBottom: '1px solid rgba(196,154,60,0.26)', backdropFilter: 'blur(14px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>
              <span style={{ color: '#fff' }}>planrr</span><span style={{ color: GOLD }}>.app</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link to="/" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#8A9BB0', textDecoration: 'none', letterSpacing: '0.07em' }}>Home</Link>
            <Link to="/faq" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: GOLD, textDecoration: 'none', letterSpacing: '0.07em' }}>FAQ</Link>
            <Link to="/" style={{ background: GOLD, color: '#111', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '72px 0 56px', borderBottom: '1px solid #2e2e2e', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>Frequently Asked Questions</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,5vw,56px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.06, marginBottom: 18 }}>
            Everything you need to know<br />before you <span style={{ color: GOLD }}>commit.</span>
          </h1>
          <p style={{ fontSize: 16, color: '#8A9BB0', fontWeight: 300, maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
            Real answers for EM directors, procurement offices, IT teams, and leadership — because we know the questions that kill deals, and we'd rather answer them upfront.
          </p>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px' }}>
        <div className="pf-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, padding: '60px 0 80px', alignItems: 'start' }}>
          {/* Sidebar */}
          <aside className="pf-sidebar" style={{ position: 'sticky', top: 88 }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#484848', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>Jump to section</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {FAQ_SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', textDecoration: 'none',
                    fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.06em',
                    color: activeSection === s.id ? GOLD : '#484848',
                    borderLeft: `2px solid ${activeSection === s.id ? GOLD : 'transparent'}`,
                    background: activeSection === s.id ? 'rgba(196,154,60,0.09)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  {s.title}
                </a>
              ))}
            </div>
            <a href="/" style={{ display: 'block', marginTop: 24, background: GOLD, color: '#111', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 11, textAlign: 'center', textDecoration: 'none' }}>Start Free Trial</a>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: '#484848', letterSpacing: '0.07em', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
              14-day free trial<br />No credit card required<br />helloplanrr.app@gmail.com
            </div>
          </aside>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {FAQ_SECTIONS.map(sec => (
              <div key={sec.id} id={sec.id} style={{ scrollMarginTop: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{sec.icon}</span>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>{sec.title}</div>
                </div>
                <p style={{ fontSize: 13, color: '#8A9BB0', fontWeight: 300, lineHeight: 1.65, marginBottom: 20, paddingLeft: 32 }}>{sec.desc}</p>
                <div style={{ height: 1, background: `${sec.color}40`, marginBottom: 20 }} />
                {sec.items.map((item, i) => <FAQItem key={i} item={item} />)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: `1px solid rgba(196,154,60,0.26)`, background: 'rgba(24,18,5,0.6)', padding: '56px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 18 }}>Ready to get started?</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>
          Still have questions? <span style={{ color: GOLD }}>Just ask.</span>
        </h2>
        <p style={{ color: '#8A9BB0', fontSize: 15, fontWeight: 300, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
          14-day free trial on all plans. No credit card. Or email us directly — we answer every question personally.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ background: GOLD, color: '#111', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '13px 26px', textDecoration: 'none' }}>Start Free Trial</Link>
          <a href="mailto:helloplanrr.app@gmail.com" style={{ border: `1px solid rgba(62,207,207,0.26)`, color: TEAL, fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.07em', padding: '12px 22px', textDecoration: 'none' }}>Email Us →</a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #2e2e2e', padding: '22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#fff' }}>planrr</span><span style={{ color: GOLD }}>.app</span>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#484848', letterSpacing: '0.07em' }}>
          © {new Date().getFullYear()} planrr.app · Emergency Management Program Platform
        </div>
      </div>
    </div>
  );
}
