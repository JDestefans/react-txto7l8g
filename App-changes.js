/**
 * PLANRR.APP — APP.JSX PATCH FILE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Apply these four changes to your existing App.jsx:
 *
 *  CHANGE 1 — Add GLOBAL_CSS constant (after your existing GOLD constant)
 *  CHANGE 2 — Replace the LandingPage function entirely
 *  CHANGE 3 — Replace the AuthScreen function entirely  
 *  CHANGE 4 — Add CSS injection to AppInner (one useEffect)
 *  CHANGE 5 — Add 'sage' to VIEW_TITLES
 *  CHANGE 6 — Add SAGE nav entry to Sidebar nav array
 *
 * ════════════════════════════════════════════════════════════════════════════
 */


/* ─── CHANGE 1 ──────────────────────────────────────────────────────────────
   ADD THIS after the existing `const GOLD = '#C49A3C';` line.
   This is the unified CSS that handles font imports, topbar glass,
   sidebar gradient, auth modal animation fix, and all landing page animations.
─────────────────────────────────────────────────────────────────────────── */

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,800&family=DM+Mono:wght@400;500&family=Syne:wght@700;800;900&family=Oxanium:wght@700;800&display=swap');

:root {
  --teal: #3ECFCF; --teal-dark: #2BAEAE; --gold: #C49A3C;
  --font-body: 'DM Sans', sans-serif;
  --font-display: 'Syne', 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
  --font-mark: 'Oxanium', 'DM Sans', sans-serif;
}

/* Topbar glass */
#planrr-topbar {
  background: rgba(242,245,247,0.94) !important;
  backdrop-filter: blur(16px) saturate(1.4) !important;
  -webkit-backdrop-filter: blur(16px) saturate(1.4) !important;
  border-bottom: 1px solid rgba(226,232,234,0.7) !important;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04) !important;
}

/* Sidebar gradient */
#planrr-sidebar {
  background: linear-gradient(180deg, #1A1F2E 0%, #161B28 100%) !important;
}

/* Headings */
h1[style*="fontWeight: 800"] {
  font-family: 'Syne', 'DM Sans', sans-serif !important;
  letter-spacing: -0.5px !important;
}

/* Scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
#planrr-sidebar ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

/* Focus */
input:focus-visible, select:focus-visible,
textarea:focus-visible, button:focus-visible {
  outline: 2px solid #3ECFCF !important; outline-offset: 2px !important;
}

/* ── AUTH MODAL ANIMATION FIX ──────────────────────────────────────────────
   The original bug: container had transform:translate(-50%,-50%) for centering
   but the animation applied translateY separately — causing a frame where
   the element was positioned at bottom-right before snapping to center.
   Fix: animate the FULL transform in one keyframe so they never fight.
─────────────────────────────────────────────────────────────────────────── */
@keyframes auth-backdrop {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes auth-card {
  from { opacity: 0; transform: translate(-50%, -47%); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}

/* Landing animations */
@keyframes lp-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes brain-glow {
  0%,100% { box-shadow: 0 0 0 0 rgba(62,207,207,0); }
  50%      { box-shadow: 0 0 40px 8px rgba(62,207,207,0.15); }
}
@keyframes spinner { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

/* Responsive */
@media(max-width:900px) {
  .lp-3col { grid-template-columns: 1fr 1fr !important; }
  .lp-pricing { grid-template-columns: 1fr 1fr !important; }
  .lp-stats { grid-template-columns: repeat(2,1fr) !important; }
}
@media(max-width:600px) {
  .lp-3col,.lp-pricing { grid-template-columns: 1fr !important; }
  .lp-hero-btns { flex-direction: column !important; }
  .lp-hide-mobile { display: none !important; }
}
`;


/* ─── CHANGE 2 ──────────────────────────────────────────────────────────────
   REPLACE your existing `function LandingPage(...)` entirely with this.
   Changes from original:
   - Pillar names updated to problem-first language
   - SAGE nav tab added alongside Platform/Pillars/Pricing
   - SAGE section added as full page section
   - Syne font used throughout headlines
   - Contrast and readability improvements throughout
─────────────────────────────────────────────────────────────────────────── */

function LandingPage({ onLogin, onSignup, onBuyPlan }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const sectionPlatform = useRef(null);
  const sectionPillars  = useRef(null);
  const sectionSage     = useRef(null);
  const sectionPricing  = useRef(null);
  const sectionSecurity = useRef(null);

  const scrollTo = useCallback((ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileNav(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animated node network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes;
    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      const count = Math.max(20, Math.floor((W * H) / 10000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.4 + 0.5, gold: Math.random() < 0.1,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const MAX = 110;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx*dx+dy*dy);
          if (d < MAX) {
            ctx.strokeStyle = `rgba(62,207,207,${(1-d/MAX)*0.10})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.fillStyle = n.gold ? 'rgba(196,154,60,0.22)' : 'rgba(62,207,207,0.18)';
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>W) n.vx*=-1; if(n.y<0||n.y>H) n.vy*=-1;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  // Shared styles
  const LP = {
    page: { fontFamily:"'DM Sans',sans-serif", background:'#0E0E0E', color:'#FFFFFF', minHeight:'100vh', overflowX:'hidden', position:'relative' },
    canvas: { position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.8 },
    overlay: { position:'fixed', inset:0, background:'linear-gradient(180deg,rgba(14,14,14,0.6) 0%,rgba(14,14,14,0.4) 40%,rgba(14,14,14,0.6) 100%)', pointerEvents:'none', zIndex:1 },
    content: { position:'relative', zIndex:2 },
    nav: { position:'sticky', top:0, zIndex:50, padding:'0 clamp(20px,4vw,52px)', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', background:scrolled?'rgba(10,10,10,0.97)':'rgba(14,14,14,0.88)', backdropFilter:'blur(18px) saturate(1.3)', borderBottom:`1px solid ${scrolled?'rgba(196,154,60,0.28)':'rgba(196,154,60,0.14)'}`, boxShadow:scrolled?'0 1px 20px rgba(0,0,0,0.4)':'none', transition:'all 0.25s ease' },
    section: { maxWidth:1120, margin:'0 auto', padding:'84px clamp(20px,4vw,52px)' },
    sectionSm: { maxWidth:1120, margin:'0 auto', padding:'68px clamp(20px,4vw,52px)' },
    lbl: { display:'flex', alignItems:'center', gap:14, marginBottom:18 },
    lblLine: { width:24, height:1, display:'inline-block', flexShrink:0 },
    mono: { fontFamily:"'DM Mono',monospace", letterSpacing:'0.18em', textTransform:'uppercase', fontSize:10 },
    headline: { fontFamily:"'Syne','DM Sans',sans-serif", fontWeight:800, letterSpacing:'-1.5px', lineHeight:1.03, color:'#FFFFFF' },
    bodyText: { color:'#A0AEBF', fontWeight:300 },
    // Cards
    darkCard: { background:'#141414', border:'1px solid rgba(255,255,255,0.08)', padding:'24px 20px', position:'relative', overflow:'hidden', transition:'border-color 0.2s, transform 0.2s' },
    accentTeal: { position:'absolute', left:0, top:0, bottom:0, width:3, background:'#3ECFCF' },
    accentGold: { position:'absolute', left:0, top:0, bottom:0, width:3, background:GOLD },
    // CTAs
    ctaPrimary: { background:GOLD, color:'#111', border:'none', padding:'14px 34px', fontFamily:"'Syne','DM Sans',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', borderRadius:3, transition:'all 0.18s ease', boxShadow:'0 2px 12px rgba(196,154,60,0.25)' },
    ctaGhost: { border:'1px solid rgba(196,154,60,0.3)', color:GOLD, background:'rgba(196,154,60,0.05)', padding:'13px 28px', fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', borderRadius:3, transition:'all 0.18s ease' },
    strip: { background:'rgba(10,10,10,0.9)', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  };

  const hoverPrimary = (e) => { e.currentTarget.style.background='#D4AA5A'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(196,154,60,0.4)'; };
  const leavePrimary = (e) => { e.currentTarget.style.background=GOLD; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(196,154,60,0.25)'; };
  const hoverGhost = (e) => e.currentTarget.style.background='rgba(196,154,60,0.1)';
  const leaveGhost = (e) => e.currentTarget.style.background='rgba(196,154,60,0.05)';
  const hoverCard = (e) => { e.currentTarget.style.borderColor='rgba(62,207,207,0.32)'; e.currentTarget.style.transform='translateY(-2px)'; };
  const leaveCard = (e) => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateY(0)'; };

  // ── Data ──
  const navLinks = [
    ['Platform', sectionPlatform],
    ['Pillars',  sectionPillars],
    ['SAGE',     sectionSage],
    ['Pricing',  sectionPricing],
    ['Security', sectionSecurity],
  ];

  const features = [
    ['EMAP Standards',     'All 73 standards tracked live. Every change, every evidence upload, every gap surfaced automatically. Not a checklist — a real-time picture of where your program stands.', 'Accreditation Core'],
    ['SAGE Priority Queue','Stop asking what to work on next. SAGE already knows. Expiring MOUs, overdue AARs, lapsed credentials — ranked by urgency, surfaced every session.', 'AI Intelligence'],
    ['Exercises & AARs',  'Every AAR finding gets an owner, a due date, and a direct link to the standard it reveals. The loop closes when the gap does — not when the report is filed.', 'HSEEP Aligned'],
    ['Document Templates','SAGE writes the first draft pre-filled with your program data. COOP, strategic plan, comms plan. You edit. You approve. You move on.', 'AI-Powered'],
    ['Evidence Export',   'One click and every standard has its bundle — docs, training records, AARs, rationale. Ready the moment the assessor email lands.', 'Accreditation-Ready'],
    ['Grant-EMAP Tracker','Your grant report says training was completed. Your records say otherwise. This module keeps those two things from diverging — and flags when a gap might cost you funding.', 'EMAP 3.4'],
    ['Recovery Planning', "Most programs file their recovery plan once. This module treats recovery as a living discipline — phases, owners, dependencies that change as your community does.", 'EMAP 4.5.4'],
    ['Mutual Aid Mapping','You have MOUs. Do you know who covers what? The coverage matrix shows resource gaps before a real event asks the question for you.', 'EMAP 4.7'],
    ['FEMA/NIMS Alignment','EMAP progress and FEMA alignment in one place. Give leadership the full picture, not one credential in isolation.', 'ICS/NIMS'],
  ];

  // ── UPDATED PILLAR NAMES — problem-first language ──
  const pillars = [
    ['Nothing Expires Quietly',
     'Your EOP was last reviewed 18 months ago. Your alternate EOC hasn\'t been verified since the previous director. Your MOU partner changed their coordinator and nobody updated the file. SAGE notices before you have to.',
     GOLD],
    ['Your Succession Line Is Probably Wrong',
     'Your succession line references two positions that no longer exist. If your EM director is unavailable today, who\'s in charge? planrr turns your COOP from a filed document into a maintained record with actual people and actual depth.',
     B.teal],
    ['The Finding That Never Closes',
     'The comms gap showed up in three consecutive AARs. It\'s still open. planrr connects every finding to an owner, a standard, and a due date. The loop closes when the gap does.',
     GOLD],
    ['What To Work On Today',
     'You have 73 standards, 14 open corrective actions, 3 MOUs expiring in 60 days, and a training record 16 months out of date. SAGE surfaces what needs attention today — not next quarter.',
     B.teal],
  ];

  const pricingPlans = [
    { tier:'Solo Operator', price:'$79',   period:'/mo', desc:'1 FTE or fewer. For the solo EM director wearing every hat.', features:['Every feature included','1 user seat','200 AI calls / month','Email support'], plan:'solo', featured:false },
    { tier:'Small Team',    price:'$149',  period:'/mo', desc:'2–5 FTE staff. The backbone of local EM.', features:['Every feature included','Up to 5 user seats','1,000 AI calls / month','Priority support'], plan:'small_team', featured:true },
    { tier:'Full Program',  price:'$199',  period:'/mo', desc:'6+ FTE. For established programs scaling up.', features:['Every feature included','Unlimited user seats','5,000 AI calls / month','Dedicated onboarding','Phone support'], plan:'full_program', featured:false },
    { tier:'Enterprise',    price:'Custom',period:'',    desc:'Multi-org, state agencies, regional coalitions.', features:['Everything + multi-org dashboard','Unlimited seats & AI usage','Dedicated account manager','SLA guarantees','Custom integrations'], plan:'enterprise', featured:false },
  ];

  const sageScenarios = [
    { n:'01', title:'Accreditation prep',       ask:'"Where do I actually stand on EMAP right now?"',       answer:'SAGE pulls your live status across all 73 standards, identifies the 8 blocking your peer review, cross-references your existing documents to surface which ones have evidence that just hasn\'t been uploaded yet, and gives you a prioritized action list ordered by effort-to-compliance ratio. Not a dashboard. A plan.' },
    { n:'02', title:'Grant deliverable crunch', ask:'"My EMPG closeout is in 3 weeks. What am I missing?"', answer:'SAGE reviews your active grant deliverables, cross-checks them against your training records, exercise logs, and personnel data, identifies the two deliverables with documentation gaps, and drafts the narrative sections you\'re missing — with your program data pre-filled.' },
    { n:'03', title:'Post-exercise AAR',        ask:'"Help me write the AAR for last Tuesday\'s tabletop."', answer:'SAGE pulls your exercise record and drafts a complete HSEEP-compliant AAR with findings, strengths, and improvement plan pre-structured. It tags each finding to the EMAP standard it reveals, creates corrective action items with owners and due dates, and flags which match gaps from previous exercises. The loop closes automatically.' },
    { n:'04', title:'Monday morning',           ask:'You don\'t ask anything. You just log in.',             answer:'SAGE has already reviewed everything that changed since Friday. It surfaces the MOU expiring in 18 days, the corrective action 30 days overdue, the training record that lapsed over the weekend, and the one standard you could mark compliant today with a 10-minute upload. No prompt required. It\'s already done the work.' },
  ];

  return (
    <div style={LP.page}>
      <canvas ref={canvasRef} style={LP.canvas}/>
      <div style={LP.overlay}/>

      <div style={LP.content}>

        {/* ── NAV ── */}
        <nav style={LP.nav}>
          <div style={{display:'flex',alignItems:'center',gap:11}}>
            <BrainIcon size={30} color={B.teal} strokeWidth={1.1}/>
            <Wordmark dark size="sm"/>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:GOLD,border:'1px solid rgba(196,154,60,0.3)',background:'rgba(196,154,60,0.07)',letterSpacing:'0.14em',textTransform:'uppercase',padding:'2px 8px',marginLeft:4}}>Early Access</div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:2}} className="lp-hide-mobile">
            {navLinks.map(([label,ref])=>(
              <button key={label} style={{background:'none',border:'none',fontFamily:"'DM Mono',monospace",fontSize:10,color:'#64748B',letterSpacing:'0.14em',textTransform:'uppercase',cursor:'pointer',padding:'6px 12px',transition:'color 0.15s',borderRadius:4}}
                onClick={()=>scrollTo(ref)}
                onMouseEnter={e=>e.currentTarget.style.color=GOLD}
                onMouseLeave={e=>e.currentTarget.style.color='#64748B'}
              >{label}</button>
            ))}
            <div style={{width:1,height:20,background:'rgba(255,255,255,0.08)',margin:'0 10px'}}/>
            <button onClick={onLogin} style={{background:'none',color:'#94A3B8',border:'1px solid rgba(255,255,255,0.1)',borderRadius:4,padding:'8px 18px',fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(196,154,60,0.4)';e.currentTarget.style.color='#F0F4FA';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='#94A3B8';}}
            >Sign In</button>
            <button onClick={()=>onBuyPlan?onBuyPlan('small_team'):onSignup?.()} style={LP.ctaPrimary} onMouseEnter={hoverPrimary} onMouseLeave={leavePrimary}>Start Free Trial</button>
          </div>

          <button onClick={()=>onBuyPlan?onBuyPlan('small_team'):onSignup?.()} style={{...LP.ctaPrimary,padding:'9px 18px'}} onMouseEnter={hoverPrimary} onMouseLeave={leavePrimary}>Try Free</button>
        </nav>

        {/* ── HERO ── */}
        <div style={{...LP.section,paddingTop:'96px',paddingBottom:'80px'}}>
          <div style={{...LP.lbl,color:GOLD}}>
            <span style={{...LP.lblLine,background:GOLD}}/>
            <span style={LP.mono}>Emergency Management Platform</span>
          </div>
          <h1 style={{...LP.headline,fontSize:'clamp(40px,5.5vw,72px)',marginBottom:24}}>
            Your EM program.<br/>Running at full strength.<br/><span style={{color:GOLD}}>Every single day.</span>
          </h1>
          <p style={{fontSize:17,...LP.bodyText,maxWidth:580,lineHeight:1.82,marginBottom:16}}>
            planrr.app is the all-in-one platform for emergency management programs that need to operate at a high standard — 365 days a year. SAGE, your AI program partner, monitors everything so you know exactly what to work on next.
          </p>
          <div style={{maxWidth:660,background:'rgba(19,14,2,0.92)',border:'1px solid rgba(196,154,60,0.4)',borderLeft:`4px solid ${GOLD}`,padding:'18px 24px',marginBottom:40,borderRadius:'0 4px 4px 0'}}>
            <div style={{fontFamily:"'Syne','DM Sans',sans-serif",fontSize:15,color:'#FFFFFF',fontWeight:700,lineHeight:1.45,marginBottom:8}}>
              When the disaster hits, nobody asks about your budget.<br/>They ask if you were ready.
            </div>
            <div style={{fontSize:13,color:GOLD,fontWeight:300,lineHeight:1.6}}>
              planrr.app doesn't make the plan survive. It makes your organization tough enough that it doesn't need to.
            </div>
          </div>
          <div className="lp-hero-btns" style={{display:'flex',gap:14,flexWrap:'wrap'}}>
            <button onClick={()=>onBuyPlan?onBuyPlan('small_team'):onSignup?.()} style={LP.ctaPrimary} onMouseEnter={hoverPrimary} onMouseLeave={leavePrimary}>Start Free Trial</button>
            <button onClick={onLogin} style={LP.ctaGhost} onMouseEnter={hoverGhost} onMouseLeave={leaveGhost}>Sign In to Your Program →</button>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div style={{borderTop:'1px solid rgba(196,154,60,0.18)',borderBottom:'1px solid rgba(196,154,60,0.18)',background:'rgba(10,10,10,0.88)'}}>
          <div className="lp-stats" style={{maxWidth:1120,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
            {[['73','EMAP Standards','Tracked'],['32','FEMA Core','Capabilities'],['100%','End-to-End','EM System'],['SAGE','Your AI','Program Partner']].map(([n,l1,l2],i)=>(
              <div key={l1} style={{padding:'28px clamp(18px,3vw,44px)',borderRight:i<3?'1px solid rgba(196,154,60,0.1)':'none'}}>
                <div style={{fontFamily:"'Syne','DM Sans',sans-serif",fontSize:n==='SAGE'?28:40,fontWeight:800,color:GOLD,lineHeight:1,marginBottom:8,letterSpacing:n==='SAGE'?'-0.5px':'-1.5px'}}>{n}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#475569',letterSpacing:'0.13em',textTransform:'uppercase',lineHeight:1.7}}>{l1}<br/>{l2}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PLATFORM ── */}
        <div ref={sectionPlatform} style={LP.section}>
          <div style={{...LP.lbl,color:GOLD}}><span style={{...LP.lblLine,background:GOLD}}/><span style={LP.mono}>The Platform</span></div>
          <h2 style={{...LP.headline,fontSize:'clamp(26px,3.2vw,42px)',marginBottom:14}}>
            Everything your program needs.<br/><span style={{color:GOLD}}>One place.</span>
          </h2>
          <p style={{...LP.bodyText,fontSize:15,maxWidth:620,lineHeight:1.82,marginBottom:52}}>
            Every module talks to every other module. An exercise finding becomes a compliance gap. A lapsed MOU surfaces in your priority queue. Your program picture builds as you work — not separately from it.
          </p>
          <div className="lp-3col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>
            {features.map(([title,desc,tag])=>(
              <div key={title} style={LP.darkCard} onMouseEnter={hoverCard} onMouseLeave={leaveCard}>
                <div style={LP.accentTeal}/>
                <div style={{fontFamily:"'Syne','DM Sans',sans-serif",fontSize:15,fontWeight:700,marginBottom:8,paddingLeft:12,color:'#FFFFFF'}}>{title}</div>
                <div style={{fontSize:13,color:'#A0AEBF',lineHeight:1.72,fontWeight:300,paddingLeft:12}}>{desc}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:B.teal,border:'1px solid rgba(62,207,207,0.22)',background:'rgba(62,207,207,0.05)',padding:'2px 10px',display:'inline-block',letterSpacing:'0.14em',textTransform:'uppercase',marginLeft:12,marginTop:12}}>{tag}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HONESTY STRIP ── */}
        <div style={{...LP.strip,borderTopColor:'rgba(239,68,68,0.14)'}}>
          <div style={LP.section}>
            <div style={{...LP.lbl,color:'#EF4444'}}><span style={{...LP.lblLine,background:'#EF4444'}}/><span style={{...LP.mono,color:'#EF4444'}}>Let's be honest</span></div>
            <h2 style={{...LP.headline,fontSize:'clamp(22px,2.8vw,36px)',marginBottom:10}}>Every EM program says they learn from every incident.</h2>
            <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:'#475569',letterSpacing:'0.04em',lineHeight:1.7,marginBottom:44,maxWidth:640}}>
              Almost none close the loop. The findings sit in a folder. The same gaps appear in the next AAR. This is not a people problem. It's a system problem.
            </p>
            <div className="lp-3col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>
              {[
                ['The AAR Gap','You filed the AAR. You didn\'t action the findings. The same gap shows up in the next one. No mechanism connects finding → standard → corrective action → resolution.'],
                ['The Training Lie','"Our staff is trained." Last documented training: 22 months ago. 4 new hires since. 0 tabletops on the current EOP version. Saying it happened once isn\'t the same as it being current.'],
                ['The Succession Gap','Your COOP succession line references 2 positions that no longer exist. If your EM director is unavailable today, there is no clear line of authority. SAGE finds this weekly.'],
              ].map(([title,body])=>(
                <div key={title} style={{background:'rgba(239,68,68,0.04)',border:'1px solid rgba(239,68,68,0.18)',borderLeft:'3px solid #EF4444',padding:'24px 22px'}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:'#EF4444',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:12}}>× {title}</div>
                  <div style={{fontSize:13,color:'#A0AEBF',lineHeight:1.72,fontWeight:300}}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PILLARS ── */}
        <div ref={sectionPillars} style={LP.section}>
          <div style={{...LP.lbl,color:B.teal}}><span style={{...LP.lblLine,background:B.teal}}/><span style={{...LP.mono,color:B.teal}}>Four Quiet Failures</span></div>
          <h2 style={{...LP.headline,fontSize:'clamp(24px,3vw,40px)',marginBottom:14}}>
            The four things that quietly<br/><span style={{color:GOLD}}>fail without a system.</span>
          </h2>
          <p style={{...LP.bodyText,fontSize:15,maxWidth:660,lineHeight:1.82,marginBottom:52}}>
            Not because anyone made a bad decision. Because there was no system watching. These gaps accumulate in silence — and they all surface in the same place: the after-action report.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:3}}>
            {pillars.map(([title,body,accent])=>(
              <div key={title} style={LP.darkCard} onMouseEnter={hoverCard} onMouseLeave={leaveCard}>
                <div style={{...LP.accentTeal,background:accent}}/>
                <div style={{fontFamily:"'Syne','DM Sans',sans-serif",fontSize:16,fontWeight:700,marginBottom:6,paddingLeft:14,color:'#FFFFFF'}}>{title}</div>
                <div style={{fontSize:13,color:'#A0AEBF',lineHeight:1.72,fontWeight:300,paddingLeft:14}}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SAGE SECTION ── */}
        <div ref={sectionSage} style={{background:'#0E0E0E',borderTop:'1px solid rgba(62,207,207,0.14)',borderBottom:'1px solid rgba(62,207,207,0.14)'}}>

          {/* SAGE Hero */}
          <div style={LP.section}>
            <div style={{...LP.lbl,color:B.teal}}><span style={{...LP.lblLine,background:B.teal}}/><span style={{...LP.mono,color:B.teal}}>Your AI Program Partner</span></div>
            <h2 style={{...LP.headline,fontSize:'clamp(36px,5vw,62px)',marginBottom:22}}>
              Not a chatbot.<br/>Not a GPT wrapper.<br/><span style={{color:GOLD}}>Not even close.</span>
            </h2>
            <p style={{fontSize:16,...LP.bodyText,maxWidth:580,lineHeight:1.82,marginBottom:22}}>
              SAGE is the first AI built specifically for emergency management programs — trained on EMAP EMS 5-2022, HSEEP, CPG 201, and your live program data simultaneously. It doesn't answer generic questions. It answers yours.
            </p>
            <div style={{maxWidth:660,background:'rgba(19,14,2,0.92)',border:'1px solid rgba(196,154,60,0.4)',borderLeft:`4px solid ${GOLD}`,padding:'20px 24px',marginBottom:44,borderRadius:'0 4px 4px 0'}}>
              <div style={{fontFamily:"'Syne','DM Sans',sans-serif",fontSize:15,color:'#FFFFFF',fontWeight:700,lineHeight:1.45,marginBottom:8}}>
                You already have ChatGPT. You've asked it about EMAP.<br/>It gave you a generic answer about accreditation standards.
              </div>
              <div style={{fontSize:13,color:GOLD,fontWeight:300,lineHeight:1.65}}>
                SAGE knows your program has 14 open corrective actions, that Standard 4.7.3 is your biggest gap, that your EMPG deliverable is due in 11 days, and that your last exercise was 14 months ago. The answer it gives you is completely different.
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:52,height:52,borderRadius:13,background:B.sidebar,border:'1.5px solid rgba(62,207,207,0.35)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <BrainIcon size={28} color={B.teal} strokeWidth={1.2}/>
              </div>
              <div>
                <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap'}}>
                  <span style={{fontFamily:"'Oxanium','DM Sans',sans-serif",fontWeight:800,fontSize:18,color:'#FFFFFF'}}>SAGE</span>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:GOLD,letterSpacing:'0.1em',textTransform:'uppercase'}}>Smart Adaptive Guidance Engine</span>
                </div>
                <div style={{fontSize:12,color:'#475569',marginTop:3,fontFamily:"'DM Mono',monospace",letterSpacing:'0.06em'}}>Context-aware · Program-specific · Always watching</div>
              </div>
            </div>
          </div>

          {/* SAGE: The Difference */}
          <div style={LP.strip}>
            <div style={LP.sectionSm}>
              <div style={{...LP.lbl,color:GOLD}}><span style={{...LP.lblLine,background:GOLD}}/><span style={{...LP.mono,color:GOLD}}>The Difference That Matters</span></div>
              <h2 style={{...LP.headline,fontSize:'clamp(22px,3vw,38px)',marginBottom:14}}>
                Every AI can answer a question.<br/><span style={{color:GOLD}}>Almost none know your situation.</span>
              </h2>
              <p style={{...LP.bodyText,fontSize:15,maxWidth:600,lineHeight:1.82,marginBottom:44}}>
                The gap between "answering questions about EMAP" and "knowing your program's specific compliance state in real time" is the gap between a search engine and a partner.
              </p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3}}>
                <div style={{background:'#150A0A',border:'1px solid rgba(239,68,68,0.2)',borderLeft:'3px solid #EF4444',padding:'26px 24px',borderRadius:'0 4px 4px 0'}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#EF4444',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:18}}>Generic AI / ChatGPT</div>
                  <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',padding:'13px 15px',marginBottom:10}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#EF4444',marginBottom:7,letterSpacing:'0.06em'}}>You ask</div>
                    <div style={{fontSize:13,color:'#FFFFFF',fontWeight:300}}>"What does EMAP 4.7 require?"</div>
                  </div>
                  <div style={{background:'#0D0606',border:'1px solid rgba(239,68,68,0.1)',padding:'13px 15px'}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#EF4444',marginBottom:7,letterSpacing:'0.06em'}}>It answers</div>
                    <div style={{fontSize:13,color:'#A0AEBF',lineHeight:1.7,fontWeight:300}}>"EMAP Standard 4.7 addresses Resource Management and Mutual Aid. Programs must develop a resource management plan with goals and objectives, conduct gap analysis..."</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#5A6070',marginTop:12,letterSpacing:'0.06em'}}>→ Correct. Useless. You already knew this.</div>
                  </div>
                </div>
                <div style={{background:'#0A1515',border:'1px solid rgba(62,207,207,0.2)',borderLeft:'3px solid #3ECFCF',padding:'26px 24px',borderRadius:'0 4px 4px 0'}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:B.teal,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:18}}>SAGE — knows your program</div>
                  <div style={{background:'rgba(62,207,207,0.08)',border:'1px solid rgba(62,207,207,0.15)',padding:'13px 15px',marginBottom:10}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:B.teal,marginBottom:7,letterSpacing:'0.06em'}}>You ask</div>
                    <div style={{fontSize:13,color:'#FFFFFF',fontWeight:300}}>"What does EMAP 4.7 require?"</div>
                  </div>
                  <div style={{background:'#060D0D',border:'1px solid rgba(62,207,207,0.1)',padding:'13px 15px'}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:B.teal,marginBottom:7,letterSpacing:'0.06em'}}>SAGE answers</div>
                    <div style={{fontSize:13,color:'#A0AEBF',lineHeight:1.7,fontWeight:300}}>"You're at 38% on 4.7. Your biggest gap is 4.7.3 — you have 4 MOUs but none address resource shortfalls from your hazard profile. There's no personnel coverage for a flood event, which is your highest-risk scenario."</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:B.teal,marginTop:12,letterSpacing:'0.06em'}}>→ Specific. Actionable. Yours.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SAGE: What It Knows */}
          <div style={LP.section}>
            <div style={{...LP.lbl,color:B.teal}}><span style={{...LP.lblLine,background:B.teal}}/><span style={{...LP.mono,color:B.teal}}>What SAGE Actually Knows</span></div>
            <h2 style={{...LP.headline,fontSize:'clamp(22px,3vw,38px)',marginBottom:14}}>
              The context that changes<br/><span style={{color:GOLD}}>every answer it gives you.</span>
            </h2>
            <p style={{...LP.bodyText,fontSize:15,maxWidth:580,lineHeight:1.82,marginBottom:44}}>
              SAGE doesn't just know EM doctrine. It knows your program — updated every time you touch the platform.
            </p>
            <div className="lp-3col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>
              {[
                ['Live EMAP Status','Which of your 73 standards are compliant, in-progress, or flagged. Which evidence is missing. Which sections are blocking peer review.'],
                ['Your Hazard Profile','Every threat you\'ve profiled. Probability, magnitude, affected capabilities. Every recommendation ties back to your actual risk picture.'],
                ['Training & Exercise History','Who\'s trained, on what, when. Which credentials are current or lapsed. When you last exercised and whether the AAR loop closed.'],
                ['Open Corrective Actions','Every AAR finding, its owner, its due date, the standard it maps to. SAGE knows what\'s still open and how long it\'s been sitting there.'],
                ['Partner Agreements','Every MOU, its expiration, the resources it covers. SAGE flags gaps between what your hazard profile demands and what your agreements provide.'],
                ['Grant Obligations','Active grants, deliverables, deadlines. SAGE connects compliance gaps to funding risk — and tells you which gaps are most likely to cost you.'],
              ].map(([title,body])=>(
                <div key={title} style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',padding:'22px 18px',transition:'border-color 0.2s,transform 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(62,207,207,0.3)';e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';e.currentTarget.style.transform='translateY(0)';}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:B.teal,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:14}}>{title}</div>
                  <div style={{fontSize:13,color:'#A0AEBF',lineHeight:1.72,fontWeight:300}}>{body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SAGE: In Practice */}
          <div style={LP.strip}>
            <div style={LP.sectionSm}>
              <div style={{...LP.lbl,color:GOLD}}><span style={{...LP.lblLine,background:GOLD}}/><span style={{...LP.mono,color:GOLD}}>SAGE In Practice</span></div>
              <h2 style={{...LP.headline,fontSize:'clamp(22px,3vw,38px)',marginBottom:14}}>
                Not hypothetical.<br/><span style={{color:GOLD}}>This is what it actually does.</span>
              </h2>
              <p style={{...LP.bodyText,fontSize:15,maxWidth:560,lineHeight:1.82,marginBottom:40}}>Real scenarios. Real outputs. No demos with fake data.</p>
              <div style={{display:'flex',flexDirection:'column',gap:3}}>
                {sageScenarios.map(({n,title,ask,answer})=>(
                  <div key={n} style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',display:'grid',gridTemplateColumns:'190px 1fr'}}>
                    <div style={{padding:'22px 18px',borderRight:'1px solid rgba(255,255,255,0.08)',display:'flex',flexDirection:'column',justifyContent:'center'}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:GOLD,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:8}}>Scenario {n}</div>
                      <div style={{fontFamily:"'Syne','DM Sans',sans-serif",fontSize:14,fontWeight:700,color:'#FFFFFF',lineHeight:1.3}}>{title}</div>
                    </div>
                    <div style={{padding:'22px 24px'}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#475569',marginBottom:10,letterSpacing:'0.06em',textTransform:'uppercase'}}>{n==='04'?'You open the app':'You open the app and ask'}</div>
                      <div style={{fontSize:14,color:'#FFFFFF',marginBottom:12,fontStyle:'italic'}}>{ask}</div>
                      <div style={{fontSize:13,color:'#A0AEBF',lineHeight:1.72,fontWeight:300}}>{answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SAGE: Partner vs Assistant */}
          <div style={LP.section}>
            <div style={{...LP.lbl,color:B.teal}}><span style={{...LP.lblLine,background:B.teal}}/><span style={{...LP.mono,color:B.teal}}>Why Partner, Not Assistant</span></div>
            <h2 style={{...LP.headline,fontSize:'clamp(22px,3vw,38px)',marginBottom:40}}>
              An assistant waits to be asked.<br/><span style={{color:GOLD}}>A partner tells you what you missed.</span>
            </h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3}}>
              <div style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',padding:'28px 24px'}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#475569',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:18}}>An assistant</div>
                {['Waits for you to ask the right question','Answers based on training data, not your data','Forgets everything between sessions',"Can't tell you what you don't know to ask",'Gives the same answer to every EM director'].map(t=>(
                  <div key={t} style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:13,color:'#5A6070',lineHeight:1.65,marginBottom:10}}>
                    <span style={{color:'#EF4444',flexShrink:0,marginTop:2,fontSize:12,fontWeight:700}}>×</span>{t}
                  </div>
                ))}
              </div>
              <div style={{background:'#0A1515',border:'1px solid rgba(62,207,207,0.2)',borderLeft:'3px solid #3ECFCF',padding:'28px 24px',borderRadius:'0 4px 4px 0'}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:B.teal,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:18}}>SAGE</div>
                {['Surfaces what matters before you log in','Answers using your live program data','Maintains full context across every session','Proactively flags what you haven\'t noticed','Every answer is specific to your jurisdiction'].map(t=>(
                  <div key={t} style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:13,color:'#A0AEBF',lineHeight:1.65,marginBottom:10}}>
                    <span style={{color:B.teal,flexShrink:0,marginTop:2,fontSize:12,fontWeight:700}}>+</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SAGE: Trust Anchors */}
          <div style={LP.strip}>
            <div style={LP.sectionSm}>
              <div style={{...LP.lbl,color:GOLD}}><span style={{...LP.lblLine,background:GOLD}}/><span style={{...LP.mono,color:GOLD}}>Built on truth, not demos</span></div>
              <h2 style={{...LP.headline,fontSize:'clamp(20px,2.6vw,34px)',marginBottom:32}}>What SAGE will never do.</h2>
              <div className="lp-3col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginBottom:52}}>
                {[
                  ['Never hallucinate standards','SAGE operates against the actual EMAP EMS 5-2022 standard text, loaded at build time. It doesn\'t invent requirements. If it doesn\'t know, it says so.'],
                  ['Never give legal advice','SAGE helps you build compliance. It doesn\'t interpret law, guarantee accreditation outcomes, or replace your counsel. It tells you what it can and can\'t answer.'],
                  ['Never share your data','Your program data stays in your org. SAGE doesn\'t train on your inputs. Your succession lines, facility locations, and operational data are not model training material.'],
                ].map(([title,body])=>(
                  <div key={title} style={{background:'#141414',border:'1px solid rgba(255,255,255,0.08)',padding:'22px 18px'}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:GOLD,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:12}}>{title}</div>
                    <div style={{fontSize:13,color:'#A0AEBF',lineHeight:1.65,fontWeight:300}}>{body}</div>
                  </div>
                ))}
              </div>
              <div style={{maxWidth:660,margin:'0 auto',textAlign:'center'}}>
                <div style={{fontFamily:"'Syne','DM Sans',sans-serif",fontSize:'clamp(20px,2.4vw,30px)',fontWeight:800,letterSpacing:'-1px',lineHeight:1.2,marginBottom:16,color:'#FFFFFF'}}>
                  The goal isn't to impress you with AI.<br/><span style={{color:GOLD}}>The goal is to make your program stronger.</span>
                </div>
                <p style={{fontSize:14,...LP.bodyText,lineHeight:1.75,marginBottom:30}}>
                  SAGE exists because emergency managers are running complex programs with limited staff and no system watching the gaps. It's not a feature. It's the reason planrr.app works the way it does.
                </p>
                <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
                  <button onClick={()=>onBuyPlan?onBuyPlan('small_team'):onSignup?.()} style={LP.ctaPrimary} onMouseEnter={hoverPrimary} onMouseLeave={leavePrimary}>Start Free Trial</button>
                  <button onClick={onLogin} style={LP.ctaGhost} onMouseEnter={hoverGhost} onMouseLeave={leaveGhost}>Sign In →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END SAGE SECTION */}

        {/* ── PRICING ── */}
        <div ref={sectionPricing} style={{borderTop:'1px solid rgba(196,154,60,0.18)',background:'rgba(13,13,13,0.82)'}}>
          <div style={LP.section}>
            <div style={{...LP.lbl,color:GOLD}}><span style={{...LP.lblLine,background:GOLD}}/><span style={LP.mono}>Pricing</span></div>
            <h2 style={{...LP.headline,fontSize:'clamp(24px,3vw,40px)',marginBottom:14}}>
              Built for every shop size.<br/><span style={{color:GOLD}}>No feature gating. Ever.</span>
            </h2>
            <p style={{...LP.bodyText,fontSize:15,maxWidth:520,lineHeight:1.82,marginBottom:52}}>
              Every plan includes every feature. We price by team size because understaffed shops deserve the same tools as large agencies.
            </p>
            <div className="lp-pricing" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}}>
              {pricingPlans.map(({tier,price,period,desc,features:feats,plan,featured})=>(
                <div key={tier} style={{background:featured?'rgba(28,21,0,0.96)':'rgba(14,14,14,0.95)',border:featured?`2px solid ${GOLD}`:'1px solid rgba(255,255,255,0.06)',padding:'32px 22px',position:'relative',boxShadow:featured?'0 0 40px rgba(196,154,60,0.18)':'none'}}>
                  {featured&&<div style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',background:GOLD,color:'#111',fontFamily:"'DM Mono',monospace",fontSize:8,fontWeight:700,letterSpacing:'0.15em',padding:'4px 16px',whiteSpace:'nowrap',textTransform:'uppercase'}}>Most Popular</div>}
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:featured?GOLD:B.teal,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:18,marginTop:featured?12:0}}>{tier}</div>
                  <div style={{display:'flex',alignItems:'baseline',gap:3,marginBottom:4}}>
                    <span style={{fontFamily:"'Syne','DM Sans',sans-serif",fontSize:price==='Custom'?28:42,fontWeight:800,color:'#FFFFFF',lineHeight:1}}>{price}</span>
                    {period&&<span style={{color:'#475569',fontSize:12}}>{period}</span>}
                  </div>
                  <div style={{fontSize:11,color:'#475569',marginBottom:22,lineHeight:1.55}}>{desc}</div>
                  {feats.map(f=>(
                    <div key={f} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8,fontSize:12,color:'#94A3B8'}}>
                      <span style={{color:featured?GOLD:B.teal,flexShrink:0,marginTop:1,fontSize:11}}>+</span>{f}
                    </div>
                  ))}
                  <button onClick={()=>plan==='enterprise'?onSignup?.():onBuyPlan?onBuyPlan(plan):onSignup?.()}
                    style={{width:'100%',marginTop:20,background:featured?GOLD:'transparent',color:featured?'#111':plan==='enterprise'?'#8B5CF6':B.teal,border:featured?'none':`1px solid ${plan==='enterprise'?'rgba(139,92,246,0.3)':'rgba(62,207,207,0.3)'}`,padding:featured?'12px':'11px 20px',fontFamily:featured?"'Syne','DM Sans',sans-serif":"'DM Sans',sans-serif",fontSize:featured?13:12,fontWeight:700,cursor:'pointer',borderRadius:3,transition:'background 0.15s'}}
                  >{plan==='enterprise'?'Contact Sales':'Start Free Trial'}</button>
                </div>
              ))}
            </div>
            <div style={{marginTop:16,background:'rgba(24,18,2,0.9)',border:'1px solid rgba(196,154,60,0.3)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:GOLD,letterSpacing:'0.15em',textTransform:'uppercase'}}>⚡ Founding Agency Pricing</span>
                <span style={{fontSize:13,color:'#FFFFFF'}}>50% off any plan, locked for life.</span>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#475569',letterSpacing:'0.08em'}}>14-day free trial · No credit card required</div>
            </div>
          </div>
        </div>

        {/* ── BIG CTA ── */}
        <div style={{borderTop:'1px solid rgba(196,154,60,0.2)',borderBottom:'1px solid rgba(196,154,60,0.2)',background:'rgba(13,13,13,0.88)',padding:'84px 40px',textAlign:'center'}}>
          <div style={{...LP.lbl,color:B.teal,justifyContent:'center'}}>
            <span style={{...LP.lblLine,background:B.teal}}/>
            <span style={{...LP.mono,color:B.teal}}>Organizational resilience isn't a value. It's a practice.</span>
            <span style={{...LP.lblLine,background:B.teal}}/>
          </div>
          <h2 style={{...LP.headline,fontSize:'clamp(30px,4.5vw,56px)',marginBottom:16}}>
            Adapt or don't.<br/><span style={{color:GOLD}}>The incident won't wait.</span>
          </h2>
          <p style={{...LP.bodyText,fontSize:15,marginBottom:40,maxWidth:520,margin:'0 auto 40px',lineHeight:1.82}}>
            Organizations that learn, adapt, and build institutional resilience don't need the plan to be perfect. They need the people, the systems, and the muscle memory to respond when it isn't.
          </p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>onBuyPlan?onBuyPlan('small_team'):onSignup?.()} style={LP.ctaPrimary} onMouseEnter={hoverPrimary} onMouseLeave={leavePrimary}>Start Free Trial</button>
            <button onClick={onLogin} style={LP.ctaGhost} onMouseEnter={hoverGhost} onMouseLeave={leaveGhost}>Sign In →</button>
          </div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:'#475569',letterSpacing:'0.1em',marginTop:20}}>
            Founding agency pricing · Locked for life · Direct input into the roadmap
          </div>
        </div>

        {/* ── SECURITY ── */}
        <div ref={sectionSecurity} style={{borderTop:'1px solid rgba(62,207,207,0.1)',background:'rgba(10,14,14,0.9)'}}>
          <div style={LP.section}>
            <div style={{...LP.lbl,color:B.teal}}><span style={{...LP.lblLine,background:B.teal}}/><span style={{...LP.mono,color:B.teal}}>Security & Compliance</span></div>
            <h2 style={{...LP.headline,fontSize:'clamp(24px,3vw,40px)',marginBottom:14}}>
              Built for agencies that handle<br/><span style={{color:GOLD}}>sensitive data.</span>
            </h2>
            <p style={{...LP.bodyText,fontSize:15,maxWidth:560,lineHeight:1.82,marginBottom:52}}>
              Plans, succession lines, facility locations, resource inventories. Your program data has operational security implications. We treat it that way.
            </p>
            <div className="lp-3col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>
              {[
                ['HTTPS Everywhere','Every request, every file transfer. TLS 1.2+ with no exceptions.'],
                ['Encryption at Rest','AES-256 on everything stored. If someone got to the database, they\'d get noise.'],
                ['Authenticated Access','Every API call requires a valid token. Org-scoped — no other agency sees your data.'],
                ['Activity Logs','Who changed what, and when. Full audit trail for accountability.'],
                ['Automated Backups','Continuous backups with point-in-time recovery. Your program doesn\'t disappear.'],
                ['Secure Infrastructure','SOC 2-certified cloud. DDoS protection, 24/7 monitoring, network isolation.'],
              ].map(([title,body])=>(
                <div key={title} style={LP.darkCard} onMouseEnter={hoverCard} onMouseLeave={leaveCard}>
                  <div style={LP.accentTeal}/>
                  <div style={{fontFamily:"'Syne','DM Sans',sans-serif",fontSize:15,fontWeight:700,marginBottom:8,paddingLeft:12,color:'#FFFFFF'}}>{title}</div>
                  <div style={{fontSize:13,color:'#A0AEBF',lineHeight:1.68,fontWeight:300,paddingLeft:12}}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{borderTop:'1px solid rgba(196,154,60,0.16)',background:'rgba(10,10,10,0.97)',padding:'48px clamp(20px,4vw,52px) 32px'}}>
          <div style={{maxWidth:1120,margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:32,marginBottom:36}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}><BrainIcon size={26} color={B.teal} strokeWidth={1.1}/><Wordmark dark size="sm"/></div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:'#475569',letterSpacing:'0.08em',lineHeight:1.8,maxWidth:280}}>Emergency management platform.<br/>EMAP EMS 5-2022 · HSEEP · CPG 201<br/>helloplanrr.app@gmail.com</div>
              </div>
              <div style={{display:'flex',gap:48,flexWrap:'wrap'}}>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:GOLD,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:14}}>Product</div>
                  {[['Platform',()=>scrollTo(sectionPlatform)],['SAGE',()=>scrollTo(sectionSage)],['Pricing',()=>scrollTo(sectionPricing)],['Security',()=>scrollTo(sectionSecurity)]].map(([l,fn])=>(
                    <div key={l} style={{marginBottom:8}}>
                      <button onClick={fn} style={{background:'none',border:'none',fontSize:13,color:'#475569',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",padding:0,transition:'color 0.15s'}}
                        onMouseEnter={e=>e.currentTarget.style.color='#94A3B8'} onMouseLeave={e=>e.currentTarget.style.color='#475569'}>{l}</button>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:GOLD,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:14}}>Legal</div>
                  {[['Privacy Policy','/privacy'],['Terms of Service','/terms']].map(([l,href])=>(
                    <div key={l} style={{marginBottom:8}}>
                      <a href={href} style={{fontSize:13,color:'#475569',textDecoration:'none',fontFamily:"'DM Sans',sans-serif",transition:'color 0.15s'}}
                        onMouseEnter={e=>e.currentTarget.style.color='#94A3B8'} onMouseLeave={e=>e.currentTarget.style.color='#475569'}>{l}</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{borderTop:'1px solid rgba(196,154,60,0.1)',paddingTop:20,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#2E3439',letterSpacing:'0.08em'}}>© 2026 planrr.app · getplanrr.com</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:'#2E3439',letterSpacing:'0.08em'}}>EMAP EMS 5-2022 ALIGNED · NOT AFFILIATED WITH EMAP OR IAEM</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


/* ─── CHANGE 3 ──────────────────────────────────────────────────────────────
   REPLACE your existing `function AuthScreen(...)` entirely with this.
   
   THE FIX: Original had `position:fixed; top:50%; left:50%; transform:translate(-50%,-50%)`
   for centering combined with a `fadeUp` animation that applied its own translateY.
   On frame 0, the browser evaluated both transforms separately — placing the element
   at the wrong position before the animation could correct it (the "flying from corner" bug).
   
   Fix: The `auth-card` keyframe animates the COMPLETE transform in one declaration:
     from: translate(-50%, -47%)   ← slightly off from center
     to:   translate(-50%, -50%)   ← correct center
   The element is ALWAYS centered, just slightly raised at the start.
   The backdrop renders as a separate element with its own animation so it
   appears before the card, hiding any layout quirks during mount.
─────────────────────────────────────────────────────────────────────────── */

function AuthScreen({ onAuth, initialMode, onClose }) {
  const [mode, setMode] = useState(initialMode || 'login');
  const [fe, setFe] = useState('');
  const [fp, setFp] = useState('');
  const [fp2, setFp2] = useState('');
  const [fn, setFn] = useState('');
  const [fo, setFo] = useState('');
  const [fj, setFj] = useState('');
  const [fs, setFs] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const iS = {
    width:'100%', padding:'11px 14px',
    background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:8, color:'#F0F4FA', fontSize:14,
    fontFamily:"'DM Sans',sans-serif", outline:'none',
    marginBottom:12, transition:'border-color 0.2s, box-shadow 0.2s',
  };
  const bS = {
    width:'100%', padding:'13px',
    background:`linear-gradient(135deg,${B.teal},${B.tealDark})`,
    color:'#fff', border:'none', borderRadius:8,
    fontFamily:"'DM Sans',sans-serif", fontSize:14,
    fontWeight:700, cursor:'pointer', marginBottom:10,
    boxShadow:'0 4px 16px rgba(62,207,207,0.3)',
    transition:'all 0.18s ease', letterSpacing:'0.01em',
  };
  const lkS = {
    background:'none', border:'none', color:B.teal,
    fontSize:13, cursor:'pointer', padding:0,
    fontWeight:600, fontFamily:"'DM Sans',sans-serif",
    textDecoration:'underline', textUnderlineOffset:2,
  };
  const labelStyle = {
    display:'block', fontSize:11, fontWeight:600, color:'#64748B',
    marginBottom:5, textTransform:'uppercase', letterSpacing:'0.07em',
    fontFamily:"'DM Mono',monospace",
  };

  const focusInput = (e) => { e.target.style.borderColor=B.teal; e.target.style.boxShadow='0 0 0 3px rgba(62,207,207,0.12)'; };
  const blurInput  = (e) => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.boxShadow='none'; };

  async function doLogin(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await sbSignIn(fe, fp); onAuth(); } catch(x) { setErr(x.message); }
    setLoading(false);
  }
  async function doSignup(e) {
    e.preventDefault(); setErr('');
    if (fp !== fp2) { setErr('Passwords do not match'); return; }
    if (fp.length < 8) { setErr('Password must be at least 8 characters'); return; }
    if (!fo.trim()) { setErr('Organization name is required'); return; }
    setLoading(true);
    try {
      await sbSignUp(fe, fp, fo.trim(), fn.trim(), fj, fs);
      await sbSignIn(fe, fp);
      try {
        const session = JSON.parse(localStorage.getItem('sb_session') || '{}');
        const meta = session?.user?.user_metadata || {};
        const stds = {}; ALL_STANDARDS.forEach(s => { stds[s.id] = initRecord(); });
        const seedData = { ...initData(), orgName:meta.org_name||fo.trim()||'', emName:meta.full_name||fn.trim()||'', emEmail:fe||'', jurisdiction:meta.jurisdiction||'', state:meta.state||'', standards:stds, welcomeDismissed:false };
        await saveData(seedData);
      } catch {}
      onAuth(); return;
    } catch(x) { setErr(x.message); }
    setLoading(false);
  }
  async function doReset(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await sbReset(fe); setOk('Reset link sent - check your inbox.'); } catch(x) { setErr(x.message); }
    setLoading(false);
  }

  return (
    <>
      {/* Backdrop — separate element, animates independently */}
      <div
        onClick={onClose}
        style={{
          position:'fixed', top:0, left:0, right:0, bottom:0,
          background:'rgba(10,12,14,0.78)',
          backdropFilter:'blur(8px)',
          zIndex:200,
          animation:'auth-backdrop 0.22s ease both',
        }}
      />

      {/* Card — uses auth-card keyframe that animates the FULL transform */}
      <div style={{
        position:'fixed',
        top:'50%',
        left:'50%',
        /* No static transform here — the keyframe owns the full transform */
        zIndex:201,
        width:430,
        maxWidth:'calc(100vw - 32px)',
        maxHeight:'calc(100vh - 40px)',
        overflowY:'auto',
        animation:'auth-card 0.28s cubic-bezier(0.34,1.06,0.64,1) both',
      }}>
        {/* Logo above card */}
        <div style={{textAlign:'center',marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:8}}>
            <div style={{background:B.sidebar,borderRadius:12,padding:10,border:'1px solid rgba(62,207,207,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <BrainIcon size={22} strokeWidth={1.3}/>
            </div>
            <Wordmark dark size="md"/>
          </div>
          <div style={{fontSize:12,color:'#64748B',letterSpacing:'0.03em'}}>AI-powered emergency management</div>
        </div>

        {/* Card body */}
        <div style={{background:'rgba(22,25,28,0.97)',backdropFilter:'blur(24px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'28px 30px',boxShadow:'0 24px 64px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04)',position:'relative'}}>
          {onClose && (
            <button onClick={onClose} style={{position:'absolute',top:14,right:14,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#64748B',fontSize:16,cursor:'pointer',padding:'4px 8px',lineHeight:1,borderRadius:6,transition:'all 0.15s'}}>✕</button>
          )}

          {err && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#EF4444',marginBottom:14}}>{err}</div>}
          {ok  && <div style={{background:`rgba(62,207,207,0.1)`,border:`1px solid rgba(62,207,207,0.3)`,borderRadius:8,padding:'10px 14px',fontSize:12,color:B.teal,marginBottom:14}}>{ok}</div>}

          {mode === 'login' && (
            <form onSubmit={doLogin}>
              <div style={{fontSize:21,fontWeight:800,color:'#F0F4FA',marginBottom:4,letterSpacing:'-0.5px',fontFamily:"'Syne','DM Sans',sans-serif"}}>Welcome back</div>
              <div style={{fontSize:13,color:'#64748B',marginBottom:22}}>Sign in to your program</div>
              <label style={labelStyle}>Work email</label>
              <input type="email" value={fe} onChange={e=>setFe(e.target.value)} placeholder="you@agency.gov" style={iS} onFocus={focusInput} onBlur={blurInput} required/>
              <label style={labelStyle}>Password</label>
              <input type="password" value={fp} onChange={e=>setFp(e.target.value)} placeholder="Password" style={iS} onFocus={focusInput} onBlur={blurInput} required/>
              <button type="submit" disabled={loading} style={{...bS,opacity:loading?0.7:1}}
                onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 6px 22px rgba(62,207,207,0.4)';}}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 16px rgba(62,207,207,0.3)';}}>
                {loading&&<span style={{display:'inline-block',animation:'spinner 0.8s linear infinite',marginRight:6}}>⟳</span>}
                {loading?'Signing in…':'Sign In'}
              </button>
              <div style={{textAlign:'center',marginBottom:8}}><button type="button" onClick={()=>{setMode('reset');setErr('');setOk('');}} style={lkS}>Forgot password?</button></div>
              <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'14px 0'}}/>
              <div style={{fontSize:12,color:'#64748B',textAlign:'center'}}>No account? <button type="button" onClick={()=>{setMode('signup');setErr('');setOk('');}} style={lkS}>Request access</button></div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={doSignup}>
              <div style={{fontSize:21,fontWeight:800,color:'#F0F4FA',marginBottom:4,letterSpacing:'-0.5px',fontFamily:"'Syne','DM Sans',sans-serif"}}>Start your free trial</div>
              <div style={{fontSize:13,color:'#64748B',marginBottom:20}}>14 days free · Cancel anytime</div>
              <label style={labelStyle}>Your name</label>
              <input type="text" value={fn} onChange={e=>setFn(e.target.value)} placeholder="Full name" style={iS} onFocus={focusInput} onBlur={blurInput}/>
              <label style={labelStyle}>Work email</label>
              <input type="email" value={fe} onChange={e=>setFe(e.target.value)} placeholder="you@agency.gov" style={iS} onFocus={focusInput} onBlur={blurInput} required/>
              <label style={labelStyle}>Organization name</label>
              <input type="text" value={fo} onChange={e=>setFo(e.target.value)} placeholder="County Emergency Management" style={iS} onFocus={focusInput} onBlur={blurInput} required/>
              <label style={labelStyle}>Password</label>
              <input type="password" value={fp} onChange={e=>setFp(e.target.value)} placeholder="8+ characters" style={iS} onFocus={focusInput} onBlur={blurInput} required/>
              <label style={labelStyle}>Confirm password</label>
              <input type="password" value={fp2} onChange={e=>setFp2(e.target.value)} placeholder="Repeat password" style={iS} onFocus={focusInput} onBlur={blurInput} required/>
              <button type="submit" disabled={loading} style={{...bS,opacity:loading?0.7:1}}
                onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 6px 22px rgba(62,207,207,0.4)';}}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 16px rgba(62,207,207,0.3)';}}>
                {loading?'Setting up…':'Start Free Trial'}
              </button>
              <div style={{fontSize:12,color:'#64748B',textAlign:'center'}}>Have an account? <button type="button" onClick={()=>{setMode('login');setErr('');setOk('');}} style={lkS}>Sign in</button></div>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={doReset}>
              <div style={{fontSize:21,fontWeight:800,color:'#F0F4FA',marginBottom:4,letterSpacing:'-0.5px',fontFamily:"'Syne','DM Sans',sans-serif"}}>Reset password</div>
              <div style={{fontSize:13,color:'#64748B',marginBottom:22}}>We'll send a reset link to your email</div>
              <label style={labelStyle}>Work email</label>
              <input type="email" value={fe} onChange={e=>setFe(e.target.value)} placeholder="you@agency.gov" style={iS} onFocus={focusInput} onBlur={blurInput} required/>
              {!ok&&<button type="submit" disabled={loading} style={bS}>{loading?'Sending…':'Send Reset Link'}</button>}
              <button type="button" onClick={()=>{setMode('login');setErr('');setOk('');}} style={{width:'100%',padding:11,background:'none',color:'#94A3B8',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:13,cursor:'pointer',transition:'all 0.15s',fontFamily:"'DM Sans',sans-serif"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=`rgba(62,207,207,0.3)`;e.currentTarget.style.color=B.teal;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='#94A3B8';}}>← Back to Sign In</button>
            </form>
          )}
        </div>

        {/* Footer badges */}
        <div style={{textAlign:'center',marginTop:20}}>
          <div style={{display:'flex',gap:16,fontSize:11,color:'#334155',justifyContent:'center',fontFamily:"'DM Mono',monospace",letterSpacing:'0.06em'}}>
            <span>EMAP EMS 5-2022</span><span>HSEEP Aligned</span><span>FEMA Compatible</span>
          </div>
        </div>
      </div>
    </>
  );
}


/* ─── CHANGE 4 ──────────────────────────────────────────────────────────────
   In your AppInner function, add this useEffect near the top (after the
   existing useState declarations but before the loadData useEffect).
   
   This injects GLOBAL_CSS once into <head> when the authenticated app mounts.
─────────────────────────────────────────────────────────────────────────── */

// ADD THIS inside AppInner, near the top with the other useEffects:
/*
  useEffect(() => {
    const styleId = 'planrr-global-css';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
    return () => {}; // intentionally don't remove — keep across route changes
  }, []);
*/


/* ─── CHANGE 5 ──────────────────────────────────────────────────────────────
   In VIEW_TITLES, add the sage entry:
   
   sage: 'SAGE — AI Partner',
─────────────────────────────────────────────────────────────────────────── */


/* ─── CHANGE 6 ──────────────────────────────────────────────────────────────
   In the Sidebar component, find the nav array and add a SAGE entry
   to the 'AI Tools' group:
   
   { id: 'sage', icon: null, label: 'SAGE', ai: true },
   
   Place it as the first item in the AI Tools group, before 'assistant'.
   This gives SAGE its own dedicated page in the app sidebar too.
   
   The 'sage' view in AppInner should render:
   {view === 'sage' && <SagePageView />}
   
   And add this component (minimal wrapper — the full SAGE section
   already lives on the landing page; this in-app view just surfaces
   the assistant with context):
─────────────────────────────────────────────────────────────────────────── */

function SagePageView({ data, orgName }) {
  // In-app SAGE page — surfaces the AI assistant with the full SAGE framing
  // Uses the existing AiAssistantView but with SAGE branding and context
  const overall = useMemo(() => {
    const c = { compliant:0, in_progress:0, needs_review:0, not_started:0 };
    ALL_STANDARDS.forEach(s => c[data.standards?.[s.id]?.status || 'not_started']++);
    const total = ALL_STANDARDS.length;
    return { ...c, total, pct: Math.round((c.compliant/total)*100) };
  }, [data.standards]);

  const [msgs, setMsgs] = useState([{
    role:'assistant',
    content:`Hi — I'm SAGE, your planrr.app AI program partner.\n\nI have full context on your program: ${overall.compliant}/${overall.total} EMAP standards compliant (${overall.pct}%), ${data.training?.length||0} training records, ${data.exercises?.length||0} exercises, ${data.partners?.length||0} partner agreements, ${(data.employees||[]).length} personnel, ${(data.grants||[]).filter(g=>g.status==='active').length} active grants, and ${(data.thira?.hazards||[]).length} hazards profiled.\n\nI don't answer generic EM questions. I answer yours — specific to this program, this jurisdiction, this moment. What do you need?`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const end = useRef();
  useEffect(() => end.current?.scrollIntoView({ behavior:'smooth' }), [msgs]);

  const ctx = buildOrgContext(data);
  const quickPrompts = [
    'Where are my biggest compliance gaps right now?',
    'What should I prioritize this week?',
    'Which standards could I close quickly?',
    'How do my open corrective actions map to EMAP standards?',
    'What\'s my grant compliance risk?',
    'Help me prepare for my EMAP assessment',
  ];

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput('');
    const hist = [...msgs, { role:'user', content:msg }];
    setMsgs(hist); setLoading(true);
    try {
      let r = '';
      setMsgs(p => [...p, { role:'assistant', content:'' }]);
      await callAI(
        getSYS(),
        hist.map(m => `${m.role==='user'?'User':'SAGE'}: ${m.content}`).join('\n') + '\nUser: ' + msg,
        (chunk) => { r += chunk; setMsgs(p => { const n=[...p]; n[n.length-1]={role:'assistant',content:r}; return n; }); }
      );
    } catch { setMsgs(p => [...p, { role:'assistant', content:'Connection error — please try again.' }]); }
    setLoading(false);
  };

  return (
    <div style={{ padding:'28px clamp(24px,3vw,48px)', maxWidth:800 }}>
      {/* SAGE header */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:B.sidebar, border:`1.5px solid rgba(62,207,207,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <BrainIcon size={26} color={B.teal} strokeWidth={1.3}/>
        </div>
        <div>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontFamily:"'Oxanium','DM Sans',sans-serif", fontWeight:800, fontSize:20, color:B.text }}>SAGE</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:GOLD, letterSpacing:'0.1em', textTransform:'uppercase' }}>Smart Adaptive Guidance Engine</span>
          </div>
          <p style={{ color:B.faint, fontSize:13, marginTop:2 }}>
            Context-aware AI partner — knows your program, your standards, your gaps
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:20 }}>
        {[
          [overall.pct+'%', 'EMAP compliance'],
          [overall.compliant+'/'+overall.total, 'Standards'],
          [(data.exercises||[]).filter(e=>e.aarFinal).length, 'Final AARs'],
          [(data.capItems||[]).filter(c=>!c.closed).length, 'Open CAs'],
        ].map(([val,lbl]) => (
          <div key={lbl} style={{ background:B.card, border:`1px solid ${B.border}`, borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:800, color:B.teal }}>{val}</div>
            <div style={{ fontSize:10, color:B.faint, marginTop:2 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Chat */}
      <Card style={{ padding:0, overflow:'hidden' }}>
        <div style={{ height:440, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12 }}>
          {msgs.map((m,i) => (
            <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:8, alignItems:'flex-start' }}>
              {m.role==='assistant' && (
                <div style={{ width:26, height:26, background:B.sidebar, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                  <BrainIcon size={14} color={B.teal} strokeWidth={1.3}/>
                </div>
              )}
              <div style={{ maxWidth:'82%', padding:'10px 14px', borderRadius:m.role==='user'?'12px 12px 3px 12px':'3px 12px 12px 12px', background:m.role==='user'?B.sidebar:'#f0fafa', border:m.role==='user'?'none':`1px solid ${B.tealBorder}`, fontSize:13, color:m.role==='user'?'#fff':B.text, lineHeight:1.7, whiteSpace:'pre-wrap' }}>
                {m.content}
                {loading && i===msgs.length-1 && m.role==='assistant' && !m.content && (
                  <span style={{ display:'inline-flex', gap:3 }}>
                    {[0,1,2].map(d => <span key={d} style={{ width:4, height:4, borderRadius:'50%', background:B.teal, animation:`typingDot 1.2s infinite ${d*0.2}s` }}/>)}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={end}/>
        </div>

        {msgs.length <= 1 && (
          <div style={{ padding:'0 16px 10px', display:'flex', flexWrap:'wrap', gap:5 }}>
            {quickPrompts.map(q => (
              <button key={q} onClick={()=>setInput(q)} style={{ padding:'5px 10px', background:B.tealLight, border:`1px solid ${B.tealBorder}`, borderRadius:14, color:B.tealDark, fontSize:11, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>{q}</button>
            ))}
          </div>
        )}

        <div style={{ padding:'10px 14px', borderTop:`1px solid ${B.border}`, display:'flex', gap:7 }}>
          <FInput value={input} onChange={setInput} placeholder="Ask SAGE anything about your program..." style={{ fontSize:13 }}
            onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button onClick={send} disabled={!input.trim()||loading} style={{ background:input.trim()&&!loading?B.teal:'#edf2f4', border:'none', borderRadius:8, width:40, height:40, cursor:input.trim()&&!loading?'pointer':'not-allowed', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:input.trim()&&!loading?'#fff':B.faint, transition:'all 0.15s', fontWeight:700 }}>→</button>
        </div>
      </Card>

      <div style={{ marginTop:12, padding:'10px 14px', background:B.tealLight, border:`1px solid ${B.tealBorder}`, borderRadius:8, fontSize:12, color:B.tealDark }}>
        SAGE has full context on your program — standards, training, exercises, partners, grants, and hazards. Every answer is specific to your jurisdiction.
      </div>
    </div>
  );
}
