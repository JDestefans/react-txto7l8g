#!/usr/bin/env node
/**
 * PLANRR APP.JSX PATCHER
 * Run: node patch.js
 * This patches your App.jsx with all design updates automatically.
 */

const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'App.jsx');

if (!fs.existsSync(appPath)) {
  console.error('❌ App.jsx not found. Put this script in the same folder as App.jsx');
  process.exit(1);
}

console.log('📖 Reading App.jsx...');
let src = fs.readFileSync(appPath, 'utf8');

// Backup
fs.writeFileSync(appPath + '.backup', src);
console.log('💾 Backup saved as App.jsx.backup');

let changes = 0;

// ─── PATCH 1: Add GLOBAL_CSS after GOLD constant ───────────────────────────
const GOLD_LINE = `const GOLD = '#C49A3C';`;
const GLOBAL_CSS_BLOCK = `const GOLD = '#C49A3C';

/* --- GLOBAL CSS (injected into <head> on mount) -------------------------
   Fonts, topbar glass, sidebar gradient, auth modal jank fix, animations.
------------------------------------------------------------------------- */
const GLOBAL_CSS = \`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,800&family=DM+Mono:wght@400;500&family=Syne:wght@700;800;900&family=Oxanium:wght@700;800&display=swap');
:root {
  --teal: #3ECFCF; --teal-dark: #2BAEAE; --gold: #C49A3C;
  --font-body: 'DM Sans', sans-serif;
  --font-display: 'Syne', 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
  --font-mark: 'Oxanium', 'DM Sans', sans-serif;
}
#planrr-topbar {
  background: rgba(242,245,247,0.94) !important;
  backdrop-filter: blur(16px) saturate(1.4) !important;
  -webkit-backdrop-filter: blur(16px) saturate(1.4) !important;
  border-bottom: 1px solid rgba(226,232,234,0.7) !important;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04) !important;
}
#planrr-sidebar { background: linear-gradient(180deg, #1A1F2E 0%, #161B28 100%) !important; }
h1[style*="fontWeight: 800"] { font-family: 'Syne', 'DM Sans', sans-serif !important; letter-spacing: -0.5px !important; }
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
#planrr-sidebar ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible {
  outline: 2px solid #3ECFCF !important; outline-offset: 2px !important;
}
@keyframes auth-backdrop { from{opacity:0} to{opacity:1} }
@keyframes auth-card {
  from { opacity: 0; transform: translate(-50%, -47%); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}
@keyframes lp-fade-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes brain-glow { 0%,100%{box-shadow:0 0 0 0 rgba(62,207,207,0)} 50%{box-shadow:0 0 40px 8px rgba(62,207,207,0.15)} }
@keyframes spinner { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@media(max-width:900px){ .lp-3col{grid-template-columns:1fr 1fr!important} .lp-pricing{grid-template-columns:1fr 1fr!important} }
@media(max-width:600px){ .lp-3col,.lp-pricing{grid-template-columns:1fr!important} .lp-hero-btns{flex-direction:column!important} .lp-hide-mobile{display:none!important} }
\`;`;

if (src.includes(GOLD_LINE) && !src.includes('const GLOBAL_CSS')) {
  src = src.replace(GOLD_LINE, GLOBAL_CSS_BLOCK);
  changes++;
  console.log('✅ Patch 1: Added GLOBAL_CSS constant');
} else if (src.includes('const GLOBAL_CSS')) {
  console.log('⏭  Patch 1: GLOBAL_CSS already present, skipping');
} else {
  console.log('⚠️  Patch 1: Could not find GOLD constant - check App.jsx');
}

// ─── PATCH 2: Fix VIEW_TITLES - add sage entry ─────────────────────────────
if (!src.includes("sage:") && src.includes('const VIEW_TITLES = {')) {
  src = src.replace(
    "journey: 'Accreditation Journey',",
    "journey: 'Accreditation Journey',\n  sage: 'SAGE — AI Partner',"
  );
  changes++;
  console.log('✅ Patch 2: Added sage to VIEW_TITLES');
} else {
  console.log('⏭  Patch 2: VIEW_TITLES already has sage or not found');
}

// ─── PATCH 3: Fix auth modal animation ─────────────────────────────────────
// Replace the old fadeUp animation on the auth card container
const OLD_AUTH_ANIM = `animation: 'fadeUp 0.25s ease',`;
const NEW_AUTH_ANIM = `animation: 'auth-card 0.28s cubic-bezier(0.34,1.06,0.64,1) both',`;

if (src.includes(OLD_AUTH_ANIM)) {
  src = src.replace(OLD_AUTH_ANIM, NEW_AUTH_ANIM);
  changes++;
  console.log('✅ Patch 3: Fixed auth modal animation');
} else {
  console.log('⚠️  Patch 3: Old auth animation not found - may already be fixed');
}

// Also add backdrop if not present
const OLD_AUTH_BACKDROP = `onClick={onClose}\n        style={{\n          position: 'fixed',\n          inset: 0,\n          background: 'rgba(15,23,42,0.75)',`;
const NEW_AUTH_BACKDROP = `onClick={onClose}\n        style={{\n          position: 'fixed',\n          inset: 0,\n          background: 'rgba(10,12,14,0.78)',\n          backdropFilter: 'blur(8px)',\n          animation: 'auth-backdrop 0.22s ease both',`;

if (src.includes("position: 'fixed',\n          inset: 0,\n          background: 'rgba(15,23,42,0.75)'")) {
  src = src.replace(
    "position: 'fixed',\n          inset: 0,\n          background: 'rgba(15,23,42,0.75)'",
    "position: 'fixed',\n          inset: 0,\n          background: 'rgba(10,12,14,0.78)',\n          backdropFilter: 'blur(8px)',\n          animation: 'auth-backdrop 0.22s ease both'"
  );
  changes++;
  console.log('✅ Patch 3b: Fixed auth backdrop');
}

// ─── PATCH 4: Add GLOBAL_CSS useEffect to AppInner ────────────────────────
const CSS_EFFECT = `
  // Inject global CSS (fonts, topbar glass, sidebar gradient, auth fix)
  useEffect(() => {
    const styleId = 'planrr-global-css';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
  }, []);`;

if (!src.includes('planrr-global-css') && src.includes('function AppInner()')) {
  // Insert after "function AppInner() {" and before the first useState
  src = src.replace(
    'function AppInner() {\n  const navigate',
    `function AppInner() {\n${CSS_EFFECT}\n  const navigate`
  );
  changes++;
  console.log('✅ Patch 4: Added GLOBAL_CSS injection to AppInner');
} else if (src.includes('planrr-global-css')) {
  console.log('⏭  Patch 4: CSS injection already present');
} else {
  console.log('⚠️  Patch 4: Could not find AppInner function start');
}

// ─── PATCH 5: Add sage to Sidebar nav (AI Tools group) ────────────────────
const OLD_ASSISTANT_NAV = `{ id: 'assistant', icon: null, label: 'AI Assistant', ai: true },`;
const NEW_ASSISTANT_NAV = `{ id: 'sage', icon: null, label: 'SAGE', ai: true },\n        { id: 'assistant', icon: null, label: 'AI Assistant', ai: true },`;

if (!src.includes(`{ id: 'sage',`) && src.includes(OLD_ASSISTANT_NAV)) {
  src = src.replace(OLD_ASSISTANT_NAV, NEW_ASSISTANT_NAV);
  changes++;
  console.log('✅ Patch 5: Added SAGE to Sidebar nav');
} else if (src.includes(`{ id: 'sage',`)) {
  console.log('⏭  Patch 5: SAGE nav item already present');
} else {
  console.log('⚠️  Patch 5: Could not find assistant nav item');
}

// ─── PATCH 6: Add sage view render to AppInner ────────────────────────────
const OLD_ASSISTANT_VIEW = `{view === 'assistant' && (`;
const NEW_SAGE_VIEW = `{view === 'sage' && (
            <SagePageView data={data} orgName={data.orgName} />
          )}
          {view === 'assistant' && (`;

if (!src.includes(`view === 'sage'`) && src.includes(OLD_ASSISTANT_VIEW)) {
  src = src.replace(OLD_ASSISTANT_VIEW, NEW_SAGE_VIEW);
  changes++;
  console.log('✅ Patch 6: Added sage view render');
} else if (src.includes(`view === 'sage'`)) {
  console.log('⏭  Patch 6: Sage view render already present');
} else {
  console.log('⚠️  Patch 6: Could not find assistant view render');
}

// ─── PATCH 7: Update pillar names in LandingPage ──────────────────────────
const oldPillar1 = `'Staleness Detection'`;
const newPillar1 = `'Nothing Expires Quietly'`;
if (src.includes(oldPillar1)) {
  src = src.replace(oldPillar1, newPillar1);
  changes++;
  console.log('✅ Patch 7a: Updated pillar 1 name');
}

const oldPillar2 = `'COOP Structured Data'`;
const newPillar2 = `'Your Succession Line Is Probably Wrong'`;
if (src.includes(oldPillar2)) {
  src = src.replace(oldPillar2, newPillar2);
  changes++;
  console.log('✅ Patch 7b: Updated pillar 2 name');
}

const oldPillar3 = `'The Finding That Never Closes'`;  // already correct
const oldPillar4 = `'Enhanced Priority Queue'`;
const newPillar4 = `'What To Work On Today'`;
if (src.includes(oldPillar4)) {
  src = src.replace(oldPillar4, newPillar4);
  changes++;
  console.log('✅ Patch 7d: Updated pillar 4 name');
}

// ─── Write output ──────────────────────────────────────────────────────────
fs.writeFileSync(appPath, src);
console.log(`\n🎉 Done! Applied ${changes} patches to App.jsx`);
console.log('   Your original is saved as App.jsx.backup');
console.log('\n⚠️  You still need to manually add SagePageView component.');
console.log('   Copy it from App-changes.js and paste it just above');
console.log('   "function AppInner()" in your App.jsx\n');
