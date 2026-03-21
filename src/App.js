import React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/* ─── BRAND (fixed contrast) ─────────────────────────── */
const B = {
  teal: '#1BC9C4',
  tealDark: '#13A8A4',
  tealLight: '#E6FAFA',
  tealBorder: '#9EECEA',
  bg: '#F0F4F5',
  card: '#FFFFFF',
  border: '#E2E8EA',
  text: '#111827',
  muted: '#374151',
  faint: '#6B7280', // ← fixed contrast
  sidebar: '#1C1F22',
  sidebarMid: '#252A2E',
  sidebarBorder: '#2E3439',
  sidebarMuted: '#94A3B8',
  green: '#10B981',
  greenLight: '#ECFDF5',
  greenBorder: '#A7F3D0',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
  amberBorder: '#FDE68A',
  red: '#EF4444',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  blueBorder: '#BFDBFE',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
  purpleBorder: '#DDD6FE',
  indigo: '#6366F1',
  indigoLight: '#EEF2FF',
  indigoBorder: '#C7D2FE',
};

const ST = {
  not_started: {
    label: 'Not Started',
    color: B.faint,
    bg: '#F3F6F7',
    border: B.border,
    dot: '#C4CED4',
  },
  in_progress: {
    label: 'In Progress',
    color: B.amber,
    bg: B.amberLight,
    border: B.amberBorder,
    dot: B.amber,
  },
  compliant: {
    label: 'Compliant',
    color: B.green,
    bg: B.greenLight,
    border: B.greenBorder,
    dot: B.green,
  },
  needs_review: {
    label: 'Needs Review',
    color: B.red,
    bg: B.redLight,
    border: B.redBorder,
    dot: B.red,
  },
};

/* ─── WORDMARK + PLACEHOLDER MARK ────────────────────── */
const GOLD = '#c2964a';

/* Minimal square mark — placeholder until final logo is locked */
const BrainIcon = ({ size = 28, color = B.teal, strokeWidth = 1.2 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect
      x="1.5"
      y="1.5"
      width="29"
      height="29"
      rx="6"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
    />
    <text
      x="16"
      y="23"
      textAnchor="middle"
      fill={color}
      fontSize="17"
      fontWeight="800"
      fontFamily="'Syne','DM Sans',sans-serif"
    >
      P
    </text>
  </svg>
);

const Wordmark = ({ dark = false, size = 'md' }) => {
  const sizes = {
    sm: { main: 16, sub: 7 },
    md: { main: 20, sub: 8 },
    lg: { main: 30, sub: 10 },
  };
  const s = sizes[size] || sizes.md;
  const base = dark ? '#f0f4fa' : B.text;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
      <span
        style={{
          fontSize: s.main,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: base,
          lineHeight: 1,
          fontFamily: "'Syne','DM Sans',sans-serif",
        }}
      >
        planrr
      </span>
      <span
        style={{
          fontSize: s.main,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: GOLD,
          lineHeight: 1,
          fontFamily: "'Syne','DM Sans',sans-serif",
        }}
      >
        .app
      </span>
    </div>
  );
};

/* ─── ALL 73 STANDARDS ───────────────────────────────── */
const CHAPTERS = [
  {
    id: 'ch3',
    num: '3',
    title: 'Emergency Management Program',
    color: B.blue,
    sections: [
      {
        id: '3.1',
        title: 'Program Administration & Evaluation',
        standards: [
          {
            id: '3.1.1',
            text: 'Multi-year Strategic Plan with stakeholder input: vision statement, mission/goals/objectives/milestones, implementation method, and evaluation/revision maintenance process.',
          },
        ],
      },
      {
        id: '3.2',
        title: 'Coordination',
        standards: [
          {
            id: '3.2.1',
            text: 'Designated emergency management agency, department, or office with authority to administer the Emergency Management Program.',
          },
          {
            id: '3.2.2',
            text: 'Designated individual empowered with authority to execute the Emergency Management Program.',
          },
        ],
      },
      {
        id: '3.3',
        title: 'Advisory Committee',
        standards: [
          {
            id: '3.3.1',
            text: 'Process utilizing advisory committee(s) providing stakeholder input in preparation, implementation, evaluation, and revision of the Program.',
          },
          {
            id: '3.3.2',
            text: 'Advisory committee(s) meets with a frequency determined by the Program to provide regular input.',
          },
        ],
      },
      {
        id: '3.4',
        title: 'Administration & Finance',
        standards: [
          {
            id: '3.4.1',
            text: 'Administrative and financial procedures for use before, during, and after an emergency/disaster.',
          },
          {
            id: '3.4.2',
            text: 'Procedures providing ability to request, receive, manage, and apply funds in emergency situations.',
          },
          {
            id: '3.4.3',
            text: 'Maintenance process for procedures in 3.4.1 and 3.4.2 including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '3.5',
        title: 'Laws & Authorities',
        standards: [
          {
            id: '3.5.1',
            text: "Program's authorities and responsibilities established and executed per statutes, regulations, directives, or policies.",
          },
          {
            id: '3.5.2',
            text: 'Process for identifying and addressing proposed legislative and regulatory changes.',
          },
        ],
      },
    ],
  },
  {
    id: 'ch4',
    num: '4',
    title: 'Program Elements',
    color: B.teal,
    sections: [
      {
        id: '4.1',
        title: 'Hazard ID & Risk Assessment',
        standards: [
          {
            id: '4.1.1',
            text: 'Identifies natural and human-caused hazards using multiple sources; assesses risk/vulnerability of people, property, environment, and its own operations.',
          },
          {
            id: '4.1.2',
            text: 'Consequence analysis covering public, responders, continuity of operations, property/facilities/infrastructure, environment, economic condition, and public confidence.',
          },
          {
            id: '4.1.3',
            text: 'Maintenance process for HIRA and Consequence Analysis including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.2',
        title: 'Hazard Mitigation',
        standards: [
          {
            id: '4.2.1',
            text: 'Mitigation plan based on identified hazards with formal stakeholder planning; includes short/long-term strategies, actions, goals, and objectives.',
          },
          {
            id: '4.2.2',
            text: 'Documents project ranking based on greatest opportunity for loss reduction and how mitigation actions contribute to overall risk reduction.',
          },
          {
            id: '4.2.3',
            text: 'Process to monitor overall progress of mitigation activities and document completed initiatives.',
          },
          {
            id: '4.2.4',
            text: 'Identifies ongoing mitigation opportunities, tracks repetitive loss, provides technical assistance, participates in multi-jurisdictional mitigation.',
          },
          {
            id: '4.2.5',
            text: 'Maintenance process for mitigation plan (4.2.1) including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.3',
        title: 'Prevention',
        standards: [
          {
            id: '4.3.1',
            text: 'Process(es) to coordinate prevention activities and monitor threats/hazards based on identified hazards, intelligence, threat assessments, alert networks, surveillance, and stakeholder info.',
          },
          {
            id: '4.3.2',
            text: 'Procedures to implement prevention processes (4.3.1) and exchange information among internal and external stakeholders.',
          },
          {
            id: '4.3.3',
            text: 'Maintenance process for prevention procedures (4.3.2) including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.4',
        title: 'Continuity Planning',
        standards: [
          {
            id: '4.4.1',
            text: 'Identifies essential program functions and departments/agencies/organizations with primary responsibilities.',
          },
          {
            id: '4.4.2',
            text: 'COOP Plan for the EM agency and Emergency Management Program Continuity of Government (COG) Plan, addressing all hazards.',
          },
          {
            id: '4.4.3',
            text: 'COOP and COG Plans address purpose/scope, authority, situation/assumptions, functional roles, logistics, concept of operations, and maintenance process.',
          },
          {
            id: '4.4.4',
            text: 'COOP Plans address continued processes/functions, essential positions, lines of succession, vital records, communications, recovery priorities, and alternate operating capability.',
          },
          {
            id: '4.4.5',
            text: 'COG Plan identifies how governing body will be preserved/reconstituted: succession of leadership, delegation of emergency authority, and command/control.',
          },
          {
            id: '4.4.6',
            text: 'Procedures to implement all Plans in 4.4.2, applicable to all identified hazards.',
          },
          {
            id: '4.4.7',
            text: 'Maintenance process for procedures in 4.4.6 including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.5',
        title: 'Operational Planning',
        standards: [
          {
            id: '4.5.1',
            text: 'Emergency Operations Plan and Recovery Plan developed through formal stakeholder planning addressing all identified hazards.',
          },
          {
            id: '4.5.2',
            text: 'EOP and Recovery Plan address purpose/scope, authority, situation/assumptions, functional roles, logistics, concept of operations, and maintenance process.',
          },
          {
            id: '4.5.3',
            text: 'EOP identifies and assigns responsibility for all 29 areas including: admin/finance, agriculture, alert/notification, communications, critical infrastructure, damage assessment, debris management, detection/monitoring, direction/control, donation management, emergency public info, energy/utilities, evacuation, fatality management, firefighting, food/water/commodities, hazardous materials, information collection, law enforcement, mass care/sheltering, mutual aid, private sector, public health, public works, resource management, search & rescue, transportation, volunteer management, and warning.',
          },
          {
            id: '4.5.4',
            text: 'Recovery Plan establishes short/long-term priorities and assigns responsibility for critical functions, services/programs, vital resources, facilities, and infrastructure.',
          },
          {
            id: '4.5.5',
            text: 'Procedures to implement all Plans in 4.5.1, applicable to all identified hazards.',
          },
          {
            id: '4.5.6',
            text: 'Procedures to guide: situational analysis, damage assessment, situation reporting, and incident action planning.',
          },
          {
            id: '4.5.7',
            text: 'Maintenance process for procedures in 4.5.5 and 4.5.6 including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.6',
        title: 'Incident Management',
        standards: [
          {
            id: '4.6.1',
            text: 'Formally adopted incident management system: modular organization, unified command, multi-agency coordination, span of control, common terminology, action planning, resource management, integrated communications, pre-designated facilities.',
          },
          {
            id: '4.6.2',
            text: 'Procedures for coordination among all personnel with emergency response roles including higher, lateral, subordinate elements, and neighboring jurisdictions.',
          },
          {
            id: '4.6.3',
            text: 'Incident management system identifies specific organizational roles and responsibilities for each function.',
          },
          {
            id: '4.6.4',
            text: 'Personnel identified to fill specific incident management system roles.',
          },
          {
            id: '4.6.5',
            text: 'Emergency Management Program personnel receive training on its incident management system.',
          },
          {
            id: '4.6.6',
            text: 'Maintenance process for coordination procedures (4.6.2) including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.7',
        title: 'Resource Management & Mutual Aid',
        standards: [
          {
            id: '4.7.1',
            text: 'Resource management plan addressing goals/objectives, gap analysis, resource management systems, donations management, and volunteer management.',
          },
          {
            id: '4.7.2',
            text: 'Periodic gap analysis addressing identified hazards, resource needs/shortfalls identification, and prioritization of shortfalls.',
          },
          {
            id: '4.7.3',
            text: 'Resource needs and shortfalls addressed through budget, executive process, mutual aid agreements, MOUs, contracts, or business partnerships.',
          },
          {
            id: '4.7.4',
            text: 'Mutual aid agreements, contractual service agreements, MOUs, or regional arrangements providing additional resources.',
          },
          {
            id: '4.7.5',
            text: 'Procedures to store, maintain, and test resources for emergency/disaster operations.',
          },
          {
            id: '4.7.6',
            text: 'Resource management system procedures for identification, location, acquisition, mobilization, distribution, tracking, and demobilization.',
          },
          {
            id: '4.7.7',
            text: 'Addresses acceptance and management of donated goods, materials, services, personnel, financial resources, and facilities.',
          },
          {
            id: '4.7.8',
            text: 'Maintenance process for resource plan (4.7.1) and procedures (4.7.5, 4.7.6) including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.8',
        title: 'Communications & Warning',
        standards: [
          {
            id: '4.8.1',
            text: 'Communications plan covering internal/external communications, alert/notification to decision-makers, public warning including vulnerable populations, and potential operating environments.',
          },
          {
            id: '4.8.2',
            text: 'Communication/notification/warning system(s) supporting COOP and EOP plans, with alternative systems, tested on schedule with documented results.',
          },
          {
            id: '4.8.3',
            text: 'Operational procedures for communications/warning systems addressing identified hazards, operating environments, and decision-making processes.',
          },
          {
            id: '4.8.4',
            text: 'Communication system(s) that addresses system interoperability.',
          },
          {
            id: '4.8.5',
            text: 'Maintenance process for communications plan (4.8.1) and procedures (4.8.3) including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.9',
        title: 'Facilities',
        standards: [
          {
            id: '4.9.1',
            text: 'Primary and alternate facility capable of coordinating and supporting sustained response and recovery operations consistent with identified hazards.',
          },
          {
            id: '4.9.2',
            text: 'Procedures for activation, operation, and deactivation of primary and alternate facilities, tested on schedule with documented results and corrective actions.',
          },
          {
            id: '4.9.3',
            text: 'Maintenance process for facility procedures (4.9.2) including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.10',
        title: 'Training',
        standards: [
          {
            id: '4.10.1',
            text: 'Training plan addressing identified hazards with goals/objectives, training needs assessment, curriculum, course evaluations, training records, and retention schedule.',
          },
          {
            id: '4.10.2',
            text: 'Training needs assessment addresses all EM Program personnel, key public officials, and internal/external requirements.',
          },
          {
            id: '4.10.3',
            text: 'Training regularly scheduled based on needs assessment, internal/external requirements, and program goals/objectives.',
          },
          {
            id: '4.10.4',
            text: 'Personnel receive and maintain training consistent with their current and potential responsibilities.',
          },
          {
            id: '4.10.5',
            text: 'Training records maintained: types of training planned/conducted and names of those who received training.',
          },
          {
            id: '4.10.6',
            text: 'Maintenance process for training plan (4.10.1) including method and schedule for evaluation and revision.',
          },
        ],
      },
      {
        id: '4.11',
        title: 'Exercises, Evaluations & Corrective Actions',
        standards: [
          {
            id: '4.11.1',
            text: 'Exercise, evaluation, and corrective action plan based on identified hazards.',
          },
          {
            id: '4.11.2',
            text: 'Evaluates personnel, plans, procedures, equipment, and facilities through periodic reviews, testing, post-incident reports, lessons learned, performance evaluations, exercises, and real-world events. Products documented and disseminated.',
          },
          {
            id: '4.11.3',
            text: 'Process for corrective actions that prioritizes and tracks the resolution of deficiencies.',
          },
        ],
      },
      {
        id: '4.12',
        title: 'Emergency Public Information',
        standards: [
          {
            id: '4.12.1',
            text: 'Crisis communications, public information, and education plan addressing identified hazards, threats to public safety, risk reduction, and public inquiries/rumors.',
          },
          {
            id: '4.12.2',
            text: 'Central media contact, trained spokespersons, and pre-scripted information bulletins about hazards, preparedness, and protective actions.',
          },
          {
            id: '4.12.3',
            text: 'Outreach activities addressing identified hazards for the public, including at-risk populations.',
          },
          {
            id: '4.12.4',
            text: 'Joint information system procedures to coordinate/authorize information release, disseminate via media, communicate with at-risk populations, interface with officials/VIPs, and respond to inquiries/rumor control.',
          },
          {
            id: '4.12.5',
            text: 'Joint information center procedures addressing activation, operation, and deactivation.',
          },
          {
            id: '4.12.6',
            text: 'Procedures in 4.12.4 and 4.12.5 tested on established schedule with documented results and corrective actions.',
          },
          {
            id: '4.12.7',
            text: 'Maintenance process for plan and procedures (4.12.1, 4.12.4, 4.12.5) including method and schedule for evaluation and revision.',
          },
        ],
      },
    ],
  },
];

const ALL_SECTIONS = CHAPTERS.flatMap((ch) =>
  ch.sections.map((s) => ({ ...s, chapter: ch }))
);
const ALL_STANDARDS = ALL_SECTIONS.flatMap((sec) =>
  sec.standards.map((s) => ({ ...s, section: sec, chapter: sec.chapter }))
);

/* ─── CASCADING DEPENDENCY MAP (EMAP Applicant Guide) ── */
const STD_DEPS = {
  // 4.1 is the foundation — all peer reviews require it first
  '4.2.1': '4.1.1',
  '4.2.2': '4.1.1',
  '4.2.3': '4.1.1',
  '4.2.4': '4.1.1',
  '4.2.5': '4.1.1',
  '4.3.1': '4.1.1',
  '4.3.2': '4.1.1',
  '4.3.3': '4.1.1',
  '4.4.1': '4.1.1',
  '4.4.2': '4.1.1',
  '4.4.3': '4.1.1',
  '4.4.4': '4.1.1',
  '4.4.5': '4.1.1',
  '4.4.6': '4.1.1',
  '4.4.7': '4.1.1',
  '4.5.1': '4.1.1',
  '4.5.2': '4.1.1',
  '4.5.3': '4.1.1',
  '4.5.4': '4.1.1',
  '4.5.5': '4.1.1',
  '4.5.6': '4.1.1',
  '4.5.7': '4.1.1',
  '4.6.1': '4.1.1',
  '4.6.2': '4.1.1',
  '4.6.3': '4.1.1',
  '4.6.4': '4.1.1',
  '4.6.5': '4.1.1',
  '4.6.6': '4.1.1',
  '4.7.1': '4.1.1',
  '4.7.2': '4.1.1',
  '4.7.3': '4.1.1',
  '4.7.4': '4.1.1',
  '4.7.5': '4.1.1',
  '4.7.6': '4.1.1',
  '4.7.7': '4.1.1',
  '4.7.8': '4.1.1',
  '4.8.1': '4.1.1',
  '4.8.2': '4.1.1',
  '4.8.3': '4.1.1',
  '4.8.4': '4.1.1',
  '4.8.5': '4.1.1',
  '4.9.1': '4.1.1',
  '4.9.2': '4.1.1',
  '4.9.3': '4.1.1',
  // 4.10 requires 4.6 (incident mgmt personnel + training interdependency)
  '4.10.1': '4.6.1',
  '4.10.2': '4.6.1',
  '4.10.3': '4.6.1',
  '4.10.4': '4.6.1',
  '4.10.5': '4.6.1',
  '4.10.6': '4.6.1',
  // 4.11 requires 4.4–4.9 all complete
  '4.11.1': '4.9.1',
  '4.11.2': '4.9.1',
  '4.11.3': '4.9.1',
  // 4.12 requires 4.1
  '4.12.1': '4.1.1',
  '4.12.2': '4.1.1',
  '4.12.3': '4.1.1',
  '4.12.4': '4.1.1',
  '4.12.5': '4.1.1',
  '4.12.6': '4.1.1',
  '4.12.7': '4.1.1',
};
const DEP_LABELS = {
  '4.1.1':
    'EMAP requires 4.1 (Hazard ID) to be completed before this section can be peer-reviewed',
  '4.6.1':
    'EMAP requires 4.6 (Incident Management) before 4.10 can be peer-reviewed',
  '4.9.1': 'EMAP requires sections 4.4–4.9 before 4.11 can be peer-reviewed',
};

async function callAI(system, prompt, onChunk, operation) {
  const res = await fetch(
    'https://ltnbvwnhtsaebyslbhil.supabase.co/functions/v1/super-endpoint',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: operation || 'general',
        stream: true,
        system,
        prompt,
        max_tokens: 1200,
      }),
    }
  );
  if (!res.ok) throw new Error('API error');
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const l of lines) {
      if (!l.startsWith('data: ')) continue;
      const d = l.slice(6).trim();
      if (d === '[DONE]') return;
      try {
        const p = JSON.parse(d);
        if (p.type === 'content_block_delta' && p.delta?.type === 'text_delta')
          onChunk(p.delta.text);
      } catch {}
    }
  }
}
async function callAIWithDoc(system, textBefore, fileData, onChunk) {
  const content = [];
  if (textBefore) content.push({ type: 'text', text: textBefore });
  if (fileData) {
    if (fileData.type === 'pdf')
      content.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: fileData.data,
        },
      });
    else if (fileData.type === 'image')
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: fileData.mimeType,
          data: fileData.data,
        },
      });
    else
      content.push({
        type: 'text',
        text: `[Document: ${fileData.name}]\n${fileData.data}`,
      });
  }
  const res = await fetch(
    'https://ltnbvwnhtsaebyslbhil.supabase.co/functions/v1/super-endpoint',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'interpret_doc',
        stream: true,
        system,
        content,
        max_tokens: 1000,
      }),
    }
  );
  if (!res.ok) throw new Error('API error');
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const l of lines) {
      if (!l.startsWith('data: ')) continue;
      const d = l.slice(6).trim();
      if (d === '[DONE]') return;
      try {
        const p = JSON.parse(d);
        if (p.type === 'content_block_delta' && p.delta?.type === 'text_delta')
          onChunk(p.delta.text);
      } catch {}
    }
  }
}

const SYS =
  'You are an EMAP accreditation and emergency management expert in PLANRR — Plan Smartr. Deep expertise in EMAP EMS 5-2022, HSEEP, and EM program management. Be specific, practical, and concise. No markdown headers.';

/* ─── FILE UTILS ─────────────────────────────────────── */
function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    if (file.type === 'application/pdf') {
      r.onload = (e) =>
        resolve({
          type: 'pdf',
          data: e.target.result.split(',')[1],
          name: file.name,
          size: file.size,
        });
      r.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      r.onload = (e) =>
        resolve({
          type: 'image',
          mimeType: file.type,
          data: e.target.result.split(',')[1],
          name: file.name,
          size: file.size,
        });
      r.readAsDataURL(file);
    } else {
      r.onload = (e) =>
        resolve({
          type: 'text',
          data: e.target.result.slice(0, 8000),
          name: file.name,
          size: file.size,
        });
      r.readAsText(file);
    }
    r.onerror = reject;
  });
}
const fmtSize = (b) =>
  b < 1024
    ? b + 'B'
    : b < 1048576
    ? (b / 1024).toFixed(1) + 'KB'
    : (b / 1048576).toFixed(1) + 'MB';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const today = () => new Date().toISOString().split('T')[0];
const fmtDate = (d) =>
  d
    ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';
const daysUntil = (d) =>
  d ? Math.ceil((new Date(d + 'T00:00:00') - new Date()) / 86400000) : null;
const timeAgo = (ts) => {
  if (!ts) return null;
  const d = Date.now() - ts;
  if (d < 60000) return 'just now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 86400000)}d ago`;
};
function useCountUp(t, dur = 900) {
  const [v, sv] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const s = prev.current,
      df = t - s,
      t0 = performance.now();
    const f = (n) => {
      const p = Math.min((n - t0) / dur, 1),
        e = 1 - Math.pow(1 - p, 3);
      sv(Math.round(s + df * e));
      if (p < 1) requestAnimationFrame(f);
      else prev.current = t;
    };
    requestAnimationFrame(f);
  }, [t]);
  return v;
}

/* ─── DATA ───────────────────────────────────────────── */
function initRecord() {
  return {
    status: 'not_started',
    notes: '',
    dueDate: '',
    assignee: '',
    evidence: '',
    docs: [],
    updatedAt: null,
  };
}
function initData() {
  return {
    orgName: '',
    jurisdiction: '',
    state: '',
    address: '',
    phone: '',
    website: '',
    emName: '',
    emTitle: '',
    emEmail: '',
    standards: {},
    training: [],
    exercises: [],
    partners: [],
    plans: [],
    resources: [],
    employees: [],
    grants: [],
    thira: { hazards: [], lastUpdated: '', nextDue: '' },
    capItems: [],
    activityLog: [],
    journey: {},
  };
}
function addActivity(updateData, type, module, detail) {
  updateData((prev) => ({
    ...prev,
    activityLog: [
      { id: uid(), ts: Date.now(), type, module, detail },
      ...(prev.activityLog || []).slice(0, 199),
    ],
  }));
}
async function loadData() {
  try {
    const r = localStorage.getItem('planrr_v3');
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
async function saveData(d) {
  try {
    localStorage.setItem('planrr_v3', JSON.stringify(d));
  } catch {}
}

/* ─── STATUS HELPERS ─────────────────────────────────── */
function sectionAggStatus(section, standards) {
  const s = section.standards.map(
    (s) => standards[s.id]?.status || 'not_started'
  );
  if (s.every((x) => x === 'compliant')) return 'compliant';
  if (s.some((x) => x === 'needs_review')) return 'needs_review';
  if (s.some((x) => x === 'in_progress' || x === 'compliant'))
    return 'in_progress';
  return 'not_started';
}
function sectionStats(section, standards) {
  const c = { compliant: 0, in_progress: 0, needs_review: 0, not_started: 0 };
  section.standards.forEach(
    (s) => c[standards[s.id]?.status || 'not_started']++
  );
  return {
    ...c,
    total: section.standards.length,
    pct: Math.round((c.compliant / section.standards.length) * 100),
  };
}
function overallStats(standards) {
  const c = { compliant: 0, in_progress: 0, needs_review: 0, not_started: 0 };
  ALL_STANDARDS.forEach((s) => c[standards[s.id]?.status || 'not_started']++);
  const total = ALL_STANDARDS.length;
  return { ...c, total, pct: Math.round((c.compliant / total) * 100) };
}
function buildNotifications(data) {
  const n = [];
  data.partners.forEach((p) => {
    if (!p.expires) return;
    const d = daysUntil(p.expires);
    if (d !== null && d < 90)
      n.push({
        id: 'mou-' + p.id,
        urgency: d < 0 ? 'overdue' : d < 30 ? 'urgent' : 'soon',
        title: d < 0 ? `MOU expired: ${p.name}` : `MOU expiring: ${p.name}`,
        detail: d < 0 ? 'Expired — renew immediately' : `${d} days remaining`,
        module: 'partners',
      });
  });
  data.plans.forEach((p) => {
    if (!p.nextReview) return;
    const d = daysUntil(p.nextReview);
    if (d !== null && d < 60)
      n.push({
        id: 'plan-' + p.id,
        urgency: d < 0 ? 'overdue' : d < 30 ? 'urgent' : 'soon',
        title: d < 0 ? `Review overdue: ${p.name}` : `Review due: ${p.name}`,
        detail: d < 0 ? 'Review is overdue' : `Due in ${d} days`,
        module: 'plans',
      });
  });
  const lastEx = data.exercises
    .filter((e) => e.date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!lastEx || daysUntil(lastEx.date) < -365)
    n.push({
      id: 'ex-annual',
      urgency: 'urgent',
      title: 'Annual exercise overdue',
      detail: 'EMAP 4.11 requires regular exercises',
      module: 'exercises',
    });
  (data.grants || []).forEach((g) => {
    if (!g.endDate) return;
    const d = daysUntil(g.endDate);
    if (d !== null && d < 90 && g.status !== 'closed')
      n.push({
        id: 'grant-' + g.id,
        urgency: d < 0 ? 'overdue' : d < 30 ? 'urgent' : 'soon',
        title:
          d < 0 ? `Grant period ended: ${g.name}` : `Grant expiring: ${g.name}`,
        detail: d < 0 ? 'Performance period ended' : `${d} days remaining`,
        module: 'grants',
      });
  });
  (data.grants || []).forEach((g) => {
    (g.deliverables || [])
      .filter((dv) => !dv.done && dv.due && daysUntil(dv.due) < 14)
      .forEach((dv) =>
        n.push({
          id: 'del-' + dv.id,
          urgency: daysUntil(dv.due) < 0 ? 'overdue' : 'urgent',
          title: `Grant deliverable due: ${g.name}`,
          detail: dv.item,
          module: 'grants',
        })
      );
  });
  (data.employees || []).forEach((emp) => {
    (emp.credentials || []).forEach((cr) => {
      if (!cr.expires) return;
      const d = daysUntil(cr.expires);
      if (d !== null && d < 60)
        n.push({
          id: 'cred-' + cr.id,
          urgency: d < 0 ? 'overdue' : d < 30 ? 'urgent' : 'soon',
          title:
            d < 0
              ? `Credential expired: ${emp.name}`
              : `Credential expiring: ${emp.name}`,
          detail: `${cr.name} — ${d < 0 ? 'Expired' : d + ' days'}`,
          module: 'employees',
        });
    });
  });
  return n;
}

/* ─── SHARED UI ──────────────────────────────────────── */
function Ring({ pct, size = 36, sw = 3 }) {
  const r = (size - sw * 2) / 2,
    circ = 2 * Math.PI * r,
    dash = (pct / 100) * circ;
  const col = pct === 100 ? B.green : pct > 0 ? B.teal : '#dde4e8';
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#edf2f4"
        strokeWidth={sw}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth={sw}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.9s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2 + 3.5}
        textAnchor="middle"
        fill={pct === 0 ? '#c4ced4' : col}
        fontSize={size < 38 ? 8 : 10}
        fontWeight="700"
        fontFamily="'DM Sans',sans-serif"
      >
        {pct}
      </text>
    </svg>
  );
}

function StatusPill({ status, compact }) {
  const c = ST[status] || ST.not_started;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: compact ? '2px 7px' : '4px 10px',
        borderRadius: 20,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        fontSize: compact ? 10 : 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: compact ? 5 : 6,
          height: compact ? 5 : 6,
          borderRadius: '50%',
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {c.label}
    </span>
  );
}
const StatusDot = ({ status, size = 10 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: ST[status]?.dot || '#C4CED4',
      display: 'inline-block',
      flexShrink: 0,
      transition: 'background 0.3s ease',
    }}
  />
);
const Tag = ({
  label,
  color = B.teal,
  bg = B.tealLight,
  border = B.tealBorder,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 12,
      background: bg,
      border: `1px solid ${border}`,
      color,
      fontSize: 10,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);
const Btn = ({
  label,
  onClick,
  primary,
  small,
  icon,
  disabled,
  loading,
  danger,
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: small ? '5px 10px' : '8px 16px',
      borderRadius: 7,
      border: primary || danger ? 'none' : `1px solid ${B.border}`,
      background: primary ? B.teal : danger ? B.red : B.card,
      color: primary || danger ? '#fff' : B.muted,
      fontSize: small ? 11 : 13,
      fontWeight: 700,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: "'DM Sans',sans-serif",
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={(e) => {
      if (!disabled && !loading && primary)
        e.currentTarget.style.background = B.tealDark;
    }}
    onMouseLeave={(e) => {
      if (!disabled && !loading && primary)
        e.currentTarget.style.background = B.teal;
    }}
  >
    <span style={{ fontSize: 12 }}>{icon || ''}</span>
    {loading ? 'Working…' : label}
  </button>
);
const Card = ({ children, style }) => (
  <div
    style={{
      background: B.card,
      border: `1px solid ${B.border}`,
      borderRadius: 11,
      padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      ...style,
    }}
  >
    {children}
  </div>
);
const Label = ({ children }) => (
  <div
    style={{
      fontSize: 11,
      color: B.faint,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      fontWeight: 700,
      marginBottom: 5,
    }}
  >
    {children}
  </div>
);
const FInput = ({ value, onChange, placeholder, type = 'text', style: s }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: '100%',
      border: `1px solid ${B.border}`,
      borderRadius: 7,
      padding: '8px 11px',
      color: B.text,
      fontSize: 13,
      fontFamily: "'DM Sans',sans-serif",
      outline: 'none',
      background: '#fafcfc',
      ...s,
    }}
    onFocus={(e) => (e.target.style.borderColor = B.teal)}
    onBlur={(e) => (e.target.style.borderColor = B.border)}
  />
);
const FSel = ({ value, onChange, children, style: s }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: '100%',
      border: `1px solid ${B.border}`,
      borderRadius: 7,
      padding: '8px 11px',
      color: value ? B.text : B.faint,
      fontSize: 13,
      fontFamily: "'DM Sans',sans-serif",
      outline: 'none',
      background: '#fafcfc',
      ...s,
    }}
    onFocus={(e) => (e.target.style.borderColor = B.teal)}
    onBlur={(e) => (e.target.style.borderColor = B.border)}
  >
    {children}
  </select>
);
const FTextarea = ({ value, onChange, placeholder, rows = 4, style: s }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: '100%',
      border: `1px solid ${B.border}`,
      borderRadius: 7,
      padding: '9px 11px',
      color: B.text,
      fontSize: 13,
      fontFamily: "'DM Sans',sans-serif",
      outline: 'none',
      background: '#fafcfc',
      resize: 'vertical',
      lineHeight: 1.65,
      ...s,
    }}
    onFocus={(e) => (e.target.style.borderColor = B.teal)}
    onBlur={(e) => (e.target.style.borderColor = B.border)}
  />
);

function AiBlock({ content, loading, label, color = B.teal }) {
  const end = useRef();
  useEffect(() => {
    if (loading)
      end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [content, loading]);
  if (!content && !loading) return null;
  return (
    <div
      style={{
        background: `${color}10`,
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '0 8px 8px 0',
        padding: '12px 14px',
        marginTop: 10,
      }}
    >
      <div
        style={{
          fontSize: 9,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 700,
          marginBottom: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <BrainIcon size={11} color={color} strokeWidth={1.5} />
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: B.text,
          lineHeight: 1.75,
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
        {loading && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 13,
              background: color,
              marginLeft: 2,
              animation: 'blink 0.7s infinite',
              verticalAlign: 'middle',
            }}
          />
        )}
      </div>
      <div ref={end} />
    </div>
  );
}

function ConfBar({ score }) {
  const col = score >= 75 ? B.green : score >= 50 ? B.amber : B.red;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 3,
        }}
      >
        <span style={{ fontSize: 10, color: B.faint }}>AI Confidence</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: col }}>
          {score}% —{' '}
          {score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : 'Weak'}
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: '#edf2f4',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            background: col,
            borderRadius: 2,
            transition: 'width 0.8s ease',
          }}
        />
      </div>
    </div>
  );
}

/* ─── FILE ATTACHMENT WIDGET ─────────────────────────── */
function Attachments({ docs = [], onAdd, onRemove, compact }) {
  const inputRef = useRef();
  const handleFiles = async (files) => {
    for (const file of Array.from(files)) {
      const id = uid();
      onAdd({ id, name: file.name, size: file.size, uploadedAt: Date.now() });
    }
  };
  if (compact)
    return (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {docs.map((d) => (
            <span
              key={d.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#f0f4f5',
                border: `1px solid ${B.border}`,
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: 11,
                color: B.muted,
              }}
            >
              📎 {d.name}{' '}
              <button
                onClick={() => onRemove(d.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: B.faint,
                  cursor: 'pointer',
                  fontSize: 13,
                  lineHeight: 1,
                  padding: '0 1px',
                }}
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => inputRef.current.click()}
            style={{
              background: 'none',
              border: `1px dashed ${B.border}`,
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 11,
              color: B.teal,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            + Attach
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>
    );
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Label>Attachments</Label>
        <button
          onClick={() => inputRef.current.click()}
          style={{
            fontSize: 11,
            color: B.tealDark,
            background: B.tealLight,
            border: `1px solid ${B.tealBorder}`,
            borderRadius: 6,
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 700,
          }}
        >
          + Attach File
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {docs.length === 0 && (
        <div
          style={{
            border: `1px dashed ${B.border}`,
            borderRadius: 8,
            padding: '14px',
            textAlign: 'center',
            fontSize: 12,
            color: B.faint,
            cursor: 'pointer',
          }}
          onClick={() => inputRef.current.click()}
        >
          Click to attach files
        </div>
      )}
      {docs.map((d) => (
        <div
          key={d.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '7px 10px',
            background: '#f8fafc',
            borderRadius: 7,
            border: `1px solid ${B.border}`,
            marginBottom: 5,
          }}
        >
          <span style={{ fontSize: 14 }}>
            {d.name.endsWith('.pdf')
              ? '📕'
              : d.name.match(/\.(jpg|jpeg|png)$/)
              ? '🖼️'
              : '📄'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: B.text }}>
              {d.name}
            </div>
            <div style={{ fontSize: 10, color: B.faint }}>
              {fmtSize(d.size)} · {timeAgo(d.uploadedAt)}
            </div>
          </div>
          <button
            onClick={() => onRemove(d.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#d1d5db',
              cursor: 'pointer',
              fontSize: 15,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── EVIDENCE UPLOAD (EMAP standards) ──────────────── */
function DocZone({ std, docs, onAddDoc, onRemoveDoc, onUpdateDocRationale }) {
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [rationaleLoad, setRationaleLoad] = useState(null);
  const inputRef = useRef();

  const analyze = async (docMeta, fileData) => {
    setAnalyzing(docMeta.id);
    let result = '';
    try {
      await callAIWithDoc(
        SYS,
        `Standard ${std.id}: "${std.text}"\n\nReview this document and:\n1. First line: "SCORE: [0-100]"\n2. What the document covers for this standard\n3. Specific gaps if score < 80\n4. Last line: "STATUS_SUGGESTION: [not_started|in_progress|compliant|needs_review]"`,
        fileData,
        (chunk) => {
          result += chunk;
        }
      );
      const score = parseInt((result.match(/SCORE:\s*(\d+)/i) || [])[1] || 50);
      const sug = (
        (result.match(/STATUS_SUGGESTION:\s*(\w+)/i) || [])[1] || ''
      ).toLowerCase();
      const analysis = result
        .replace(/SCORE:\s*\d+\n?/i, '')
        .replace(/STATUS_SUGGESTION:\s*\w+\n?/i, '')
        .trim();
      onAddDoc({
        ...docMeta,
        confidence: Math.min(100, score),
        analysis,
        suggestedStatus: sug,
        analyzed: true,
        analyzing: false,
      });
    } catch {
      onAddDoc({
        ...docMeta,
        confidence: null,
        analysis: 'Analysis failed.',
        analyzed: true,
        analyzing: false,
      });
    }
    setAnalyzing(null);
  };

  const draftRationale = async (doc) => {
    setRationaleLoad(doc.id);
    let draft = '';
    try {
      await callAI(
        SYS,
        `Standard ${std.id}: "${std.text}"\n\nDocument: "${
          doc.name
        }"\nAI analysis of document: "${
          doc.analysis || 'No analysis available'
        }"\n\nWrite a concise EMAP proof-of-compliance rationale for this document. The rationale must:\n- Explain specifically how this document demonstrates compliance with Standard ${
          std.id
        }\n- Reference specific sections, chapters, or pages by name (use the document name and likely structure)\n- Address each element of the standard if multiple exist\n- Be written in the style EMAP assessors expect (formal, specific, 2-4 sentences)\n- Start with: "This document demonstrates compliance with Standard ${
          std.id
        } by..."\n\nOnly write the rationale text, nothing else.`,
        (chunk) => {
          draft += chunk;
          onUpdateDocRationale(doc.id, draft);
        }
      );
    } catch {
      onUpdateDocRationale(doc.id, 'Error drafting rationale.');
    }
    setRationaleLoad(null);
  };

  const handleFiles = async (files) => {
    for (const file of Array.from(files)) {
      const id = uid();
      const pending = {
        id,
        name: file.name,
        size: file.size,
        uploadedAt: Date.now(),
        confidence: null,
        analysis: '',
        rationale: '',
        analyzed: false,
        analyzing: true,
      };
      onAddDoc(pending);
      try {
        const fd = await readFile(file);
        await analyze(
          { id, name: file.name, size: file.size, uploadedAt: Date.now() },
          fd
        );
      } catch {
        onAddDoc({
          ...pending,
          analyzing: false,
          analyzed: true,
          analysis: 'Could not read file.',
        });
      }
    }
  };

  const fmtSz = (b) =>
    b < 1024
      ? b + 'B'
      : b < 1048576
      ? (b / 1024).toFixed(1) + 'KB'
      : (b / 1048576).toFixed(1) + 'MB';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: B.faint,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          Evidence Documents & Rationale
        </span>
        <button
          onClick={() => inputRef.current.click()}
          style={{
            fontSize: 11,
            color: B.tealDark,
            background: B.tealLight,
            border: `1px solid ${B.tealBorder}`,
            borderRadius: 6,
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 700,
          }}
        >
          + Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {/* EMAP rationale explainer */}
      <div
        style={{
          background: `${B.blue}08`,
          border: `1px solid ${B.blueBorder}`,
          borderRadius: 7,
          padding: '8px 12px',
          marginBottom: 10,
          fontSize: 11,
          color: '#1e40af',
        }}
      >
        EMAP requires a written rationale for every proof of compliance —
        explaining <em>how</em> the document demonstrates compliance,
        referencing specific sections and pages. Use the AI draft button on each
        document to generate one.
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => docs.length === 0 && inputRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? B.teal : B.border}`,
          borderRadius: 10,
          padding: docs.length ? '10px' : '18px',
          background: dragging ? B.tealLight : '#fafcfc',
          transition: 'all 0.2s',
          cursor: docs.length ? 'default' : 'pointer',
        }}
      >
        {docs.length === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4, opacity: 0.4 }}>
              📄
            </div>
            <div style={{ fontSize: 12, color: B.faint }}>
              Drop files here or click to upload
            </div>
            <div style={{ fontSize: 10, color: '#d1d8db', marginTop: 2 }}>
              PDF, Word, images — AI analyzes + drafts rationale
            </div>
          </div>
        )}
        {docs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {docs.map((doc) => {
              const hasDraft = doc.rationale && doc.rationale.length > 10;
              const isDraftLoading = rationaleLoad === doc.id;
              return (
                <div
                  key={doc.id}
                  style={{
                    background: B.card,
                    border: `1px solid ${hasDraft ? B.greenBorder : B.border}`,
                    borderRadius: 9,
                    padding: '12px 13px',
                  }}
                >
                  {/* Doc header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 9,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        background: '#f0f4f5',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {doc.name.endsWith('.pdf')
                        ? '📕'
                        : doc.name.match(/\.(jpg|jpeg|png)$/)
                        ? '🖼️'
                        : '📄'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: B.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 10, color: B.faint }}>
                        {fmtSz(doc.size)} · {timeAgo(doc.uploadedAt)}
                        {doc.isDraft ? (
                          <span
                            style={{
                              color: B.red,
                              fontWeight: 700,
                              marginLeft: 6,
                            }}
                          >
                            ⚠ Draft — not accepted by EMAP
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveDoc(doc.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        cursor: 'pointer',
                        fontSize: 15,
                        padding: '0 4px',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {/* Analyzing state */}
                  {(doc.analyzing || analyzing === doc.id) && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        color: B.teal,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          animation: 'spin 1s linear infinite',
                          display: 'inline-block',
                        }}
                      >
                        ⟳
                      </span>
                      AI analyzing document…
                    </div>
                  )}
                  {/* Confidence bar */}
                  {doc.analyzed && doc.confidence !== null && (
                    <div style={{ marginBottom: 8 }}>
                      <ConfBar score={doc.confidence} />
                    </div>
                  )}
                  {/* AI analysis */}
                  {doc.analyzed && doc.analysis && (
                    <div
                      style={{
                        marginBottom: 8,
                        fontSize: 11,
                        color: B.muted,
                        lineHeight: 1.55,
                        background: '#f8fafc',
                        borderRadius: 6,
                        padding: '7px 9px',
                      }}
                    >
                      {doc.analysis}
                    </div>
                  )}
                  {/* Suggested status */}
                  {doc.analyzed &&
                    doc.suggestedStatus &&
                    doc.suggestedStatus !== 'not_started' && (
                      <div
                        style={{
                          fontSize: 11,
                          color: B.tealDark,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          marginBottom: 8,
                        }}
                      >
                        <BrainIcon size={11} color={B.teal} strokeWidth={1.4} />
                        AI suggests:{' '}
                        <strong>{ST[doc.suggestedStatus]?.label}</strong>
                      </div>
                    )}
                  {/* RATIONALE SECTION */}
                  <div
                    style={{
                      borderTop: `1px solid ${B.border}`,
                      paddingTop: 10,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 5,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: 5,
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: hasDraft ? B.green : B.amber,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {hasDraft ? '✓ Rationale' : '⚠ Rationale required'}
                        </span>
                        {hasDraft && (
                          <span style={{ fontSize: 10, color: B.faint }}>
                            — EMAP proof of compliance
                          </span>
                        )}
                      </div>
                      {doc.analyzed && (
                        <button
                          onClick={() => draftRationale(doc)}
                          disabled={isDraftLoading}
                          style={{
                            fontSize: 10,
                            color: B.purple,
                            background: `${B.purple}10`,
                            border: `1px solid ${B.purpleBorder}`,
                            borderRadius: 5,
                            padding: '3px 9px',
                            cursor: isDraftLoading ? 'not-allowed' : 'pointer',
                            fontFamily: "'DM Sans',sans-serif",
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <BrainIcon
                            size={10}
                            color={B.purple}
                            strokeWidth={1.5}
                          />
                          {isDraftLoading ? 'Drafting…' : 'AI Draft Rationale'}
                        </button>
                      )}
                    </div>
                    <textarea
                      value={doc.rationale || ''}
                      onChange={(e) =>
                        onUpdateDocRationale(doc.id, e.target.value)
                      }
                      placeholder={`Explain how "${doc.name}" demonstrates compliance with Standard ${std.id}. Reference specific sections, pages, or provisions. EMAP requires this for every proof of compliance.`}
                      rows={3}
                      style={{
                        width: '100%',
                        border: `1px solid ${
                          hasDraft ? B.greenBorder : B.amberBorder
                        }`,
                        borderRadius: 6,
                        padding: '8px 10px',
                        fontSize: 11.5,
                        color: B.text,
                        fontFamily: "'DM Sans',sans-serif",
                        outline: 'none',
                        background: hasDraft ? `${B.green}06` : `${B.amber}05`,
                        resize: 'vertical',
                        lineHeight: 1.6,
                      }}
                      onFocus={(e) => (e.target.style.borderColor = B.teal)}
                      onBlur={(e) =>
                        (e.target.style.borderColor = hasDraft
                          ? B.greenBorder
                          : B.amberBorder)
                      }
                    />
                    {isDraftLoading && (
                      <div
                        style={{
                          fontSize: 10,
                          color: B.purple,
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            animation: 'spin 1s linear infinite',
                            display: 'inline-block',
                          }}
                        >
                          ⟳
                        </span>
                        AI drafting rationale…
                      </div>
                    )}
                  </div>
                  {/* Draft document warning */}
                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        cursor: 'pointer',
                        fontSize: 10,
                        color: B.faint,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={doc.isDraft || false}
                        onChange={(e) => {
                          const updated = { ...doc, isDraft: e.target.checked };
                          onAddDoc(updated);
                        }}
                        style={{ accentColor: B.red, cursor: 'pointer' }}
                      />
                      <span>
                        Mark as draft (EMAP will not accept draft documents)
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
            <div
              onClick={() => inputRef.current.click()}
              style={{
                border: `1px dashed ${B.border}`,
                borderRadius: 7,
                padding: '6px',
                textAlign: 'center',
                fontSize: 11,
                color: B.faint,
                cursor: 'pointer',
              }}
            >
              + Add more documents
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── STANDARD DETAIL PANEL ──────────────────────────── */
function DetailPanel({ stdId, standards, onUpdateStd, onClose }) {
  const std = ALL_STANDARDS.find((s) => s.id === stdId);
  const st = standards[stdId] || initRecord();
  const allIds = ALL_STANDARDS.map((s) => s.id);
  const idx = allIds.indexOf(stdId);
  const [aiMode, setAiMode] = useState(null);
  const [aiData, setAiData] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [adopted, setAdopted] = useState(false);
  useEffect(() => {
    setAiMode(null);
    setAdopted(false);
  }, [stdId]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && idx > 0) onClose(allIds[idx - 1]);
      if (e.key === 'ArrowRight' && idx < allIds.length - 1)
        onClose(allIds[idx + 1]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, idx, allIds]);
  if (!std) return null;
  const update = (field, val) => onUpdateStd(stdId, field, val);
  const runAi = async (mode) => {
    setAiMode(mode);
    setAiData((p) => ({ ...p, [mode]: '' }));
    setAiLoading((p) => ({ ...p, [mode]: true }));
    const prompts = {
      interpret: `Standard ${std.id} in "${std.section.title}": "${std.text}"\nExplain: (1) what this requires operationally, (2) full compliance day-to-day, (3) 2-3 common pitfalls. 3 short paragraphs.\nEnd with: AUTO_STATUS: [not_started|in_progress|compliant|needs_review]`,
      evidence: `Standard ${std.id}: "${std.text}"\nList 6-10 specific documents an EMAP assessor expects. Be very specific. Numbered list.`,
      action: `Standard ${std.id}: "${std.text}"\nStatus: ${
        st.status
      }. Notes: "${
        st.notes || 'none'
      }"\nCreate 5-8 step corrective action plan with tasks, roles, and time estimates.`,
    };
    try {
      let fullText = '';
      await callAI(SYS, prompts[mode], (chunk) => {
        fullText += chunk;
        setAiData((p) => ({
          ...p,
          [mode]: fullText.replace(/AUTO_STATUS:\s*\w+\n?/i, '').trim(),
        }));
      });
      if (mode === 'interpret') {
        const m = fullText.match(/AUTO_STATUS:\s*(\w+)/i);
        if (m && ST[m[1].toLowerCase()] && st.status === 'not_started')
          update('status', m[1].toLowerCase());
      }
    } catch {
      setAiData((p) => ({ ...p, [mode]: 'Connection error.' }));
    }
    setAiLoading((p) => ({ ...p, [mode]: false }));
  };
  const adoptNotes = () => {
    if (aiData[aiMode]) {
      update(
        'notes',
        (st.notes ? st.notes + '\n\n—\n\n' : '') + aiData[aiMode]
      );
      setAdopted(true);
      setTimeout(() => setAdopted(false), 2500);
    }
  };
  const handleAddDoc = (doc) => {
    const cur = st.docs || [];
    const updated = cur.some((d) => d.id === doc.id)
      ? cur.map((d) => (d.id === doc.id ? doc : d))
      : [...cur, doc];
    onUpdateStd(stdId, 'docs', updated);
    if (doc.analyzed && doc.suggestedStatus && ST[doc.suggestedStatus]) {
      const pri = {
        compliant: 3,
        in_progress: 2,
        needs_review: 1,
        not_started: 0,
      };
      if ((pri[doc.suggestedStatus] || 0) > (pri[st.status] || 0))
        update('status', doc.suggestedStatus);
    }
  };
  const handleUpdateRationale = (docId, rationale) => {
    const cur = st.docs || [];
    onUpdateStd(
      stdId,
      'docs',
      cur.map((d) => (d.id === docId ? { ...d, rationale } : d))
    );
  };
  const depStdId = STD_DEPS[stdId];
  const depNotMet =
    depStdId &&
    (standards[depStdId]?.status || 'not_started') === 'not_started';
  const depLabel = depStdId
    ? DEP_LABELS[depStdId] || `Requires ${depStdId} to be completed first`
    : '';
  const docsWithRationale = (st.docs || []).filter(
    (d) => d.rationale && d.rationale.length > 10
  ).length;
  const docsWithoutRationale = (st.docs || []).filter(
    (d) => !d.isDraft && (!d.rationale || d.rationale.length < 10)
  ).length;
  const bestDocConf =
    (st.docs || []).filter((d) => d.confidence != null).length > 0
      ? Math.max(
          ...(st.docs || [])
            .filter((d) => d.confidence != null)
            .map((d) => d.confidence)
        )
      : null;
  return (
    <>
      <div
        onClick={() => onClose()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.3)',
          zIndex: 49,
          animation: 'fadeIn 0.15s',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 520,
          height: '100vh',
          background: B.card,
          borderLeft: `1px solid ${B.border}`,
          zIndex: 50,
          overflowY: 'auto',
          animation: 'slideIn 0.25s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderBottom: `1px solid ${B.border}`,
            position: 'sticky',
            top: 0,
            background: B.card,
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => idx > 0 && onClose(allIds[idx - 1])}
              disabled={idx === 0}
              style={{
                background: '#f4f7f8',
                border: `1px solid ${B.border}`,
                color: B.muted,
                borderRadius: 6,
                padding: '5px 10px',
                cursor: idx > 0 ? 'pointer' : 'not-allowed',
                opacity: idx > 0 ? 1 : 0.35,
                fontSize: 12,
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 600,
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() =>
                idx < allIds.length - 1 && onClose(allIds[idx + 1])
              }
              disabled={idx === allIds.length - 1}
              style={{
                background: '#f4f7f8',
                border: `1px solid ${B.border}`,
                color: B.muted,
                borderRadius: 6,
                padding: '5px 10px',
                cursor: idx < allIds.length - 1 ? 'pointer' : 'not-allowed',
                opacity: idx < allIds.length - 1 ? 1 : 0.35,
                fontSize: 12,
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 600,
              }}
            >
              Next →
            </button>
            <span style={{ fontSize: 11, color: B.faint }}>
              {idx + 1}/{allIds.length}
            </span>
          </div>
          <button
            onClick={() => onClose()}
            style={{
              background: '#f4f7f8',
              border: `1px solid ${B.border}`,
              borderRadius: 7,
              color: B.muted,
              cursor: 'pointer',
              fontSize: 16,
              padding: '4px 9px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '20px 22px 48px' }}>
          <div style={{ fontSize: 11, color: B.faint, marginBottom: 8 }}>
            {std.chapter.title} › {std.section.title}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              marginBottom: 14,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                background: B.amberLight,
                border: `1px solid ${B.amberBorder}`,
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: 15,
                fontWeight: 800,
                color: '#92400e',
              }}
            >
              {std.id}
            </span>
            <StatusPill status={st.status} />
            {bestDocConf !== null && (
              <span
                style={{
                  fontSize: 11,
                  color:
                    bestDocConf >= 75
                      ? B.green
                      : bestDocConf >= 50
                      ? B.amber
                      : B.red,
                  background:
                    bestDocConf >= 75
                      ? B.greenLight
                      : bestDocConf >= 50
                      ? B.amberLight
                      : B.redLight,
                  padding: '3px 9px',
                  borderRadius: 10,
                  border: `1px solid ${
                    bestDocConf >= 75
                      ? B.greenBorder
                      : bestDocConf >= 50
                      ? B.amberBorder
                      : B.redBorder
                  }`,
                  fontWeight: 600,
                }}
              >
                📄 {(st.docs || []).length} doc
                {(st.docs || []).length !== 1 ? 's' : ''} · {bestDocConf}%
              </span>
            )}
            {docsWithRationale > 0 && (
              <span
                style={{
                  fontSize: 10,
                  color: B.green,
                  background: B.greenLight,
                  padding: '2px 7px',
                  borderRadius: 8,
                  border: `1px solid ${B.greenBorder}`,
                  fontWeight: 600,
                }}
              >
                ✓ {docsWithRationale} rationale
                {docsWithRationale > 1 ? 's' : ''}
              </span>
            )}
            {docsWithoutRationale > 0 && (
              <span
                style={{
                  fontSize: 10,
                  color: B.amber,
                  background: B.amberLight,
                  padding: '2px 7px',
                  borderRadius: 8,
                  border: `1px solid ${B.amberBorder}`,
                  fontWeight: 600,
                }}
              >
                ⚠ {docsWithoutRationale} rationale
                {docsWithoutRationale > 1 ? 's' : ''} needed
              </span>
            )}
          </div>
          {/* Cascading dependency flag */}
          {depNotMet && (
            <div
              style={{
                background: `${B.blue}08`,
                border: `1px solid ${B.blueBorder}`,
                borderLeft: `3px solid ${B.blue}`,
                borderRadius: '0 8px 8px 0',
                padding: '8px 12px',
                marginBottom: 14,
                fontSize: 11,
                color: '#1e40af',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1 }}>ⓘ</span>
              <div>
                <strong>EMAP peer review sequencing note:</strong> {depLabel}.
                You can continue documenting this standard — this flag is
                informational only and does not prevent you from moving forward
                in PLANRR.
              </div>
            </div>
          )}
          <div
            style={{
              background: '#f8fafc',
              border: `1px solid ${B.border}`,
              borderLeft: `3px solid ${std.chapter.color}`,
              borderRadius: '0 8px 8px 0',
              padding: '13px 15px',
              marginBottom: 18,
            }}
          >
            <p
              style={{
                fontSize: 13.5,
                color: B.text,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {std.text}
            </p>
          </div>
          <div
            style={{
              background: B.amberLight,
              border: `1px solid ${B.amberBorder}`,
              borderRadius: 10,
              padding: '13px 15px',
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: '#d97706',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                fontWeight: 700,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <BrainIcon size={11} color="#d97706" strokeWidth={1.5} />
              AI Analysis Tools
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {[
                ['interpret', '◉ Interpret'],
                ['evidence', '◈ Suggest Evidence'],
                ['action', '◎ Build Action Plan'],
              ].map(([mode, lbl]) => (
                <button
                  key={mode}
                  onClick={() => runAi(mode)}
                  disabled={aiLoading[mode]}
                  style={{
                    padding: '6px 13px',
                    borderRadius: 7,
                    border: `1px solid ${
                      aiMode === mode ? B.amber : B.amberBorder
                    }`,
                    background:
                      aiMode === mode ? 'rgba(245,158,11,0.1)' : B.card,
                    color: aiMode === mode ? '#92400e' : B.muted,
                    fontSize: 12,
                    cursor: aiLoading[mode] ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {aiLoading[mode] ? '⟳ Working…' : lbl}
                </button>
              ))}
            </div>
            {aiMode && (
              <>
                <AiBlock
                  content={aiData[aiMode]}
                  loading={aiLoading[aiMode]}
                  label={
                    aiMode === 'interpret'
                      ? 'Interpretation'
                      : aiMode === 'evidence'
                      ? 'Evidence Checklist'
                      : 'Action Plan'
                  }
                  color={B.amber}
                />
                {!aiLoading[aiMode] && aiData[aiMode] && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
                    <button
                      onClick={adoptNotes}
                      style={{
                        fontSize: 11,
                        color: adopted ? B.green : B.muted,
                        background: adopted ? B.greenLight : B.card,
                        border: `1px solid ${
                          adopted ? B.greenBorder : B.border
                        }`,
                        borderRadius: 6,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontFamily: "'DM Sans',sans-serif",
                        transition: 'all 0.2s',
                      }}
                    >
                      {adopted ? '✓ Added to notes' : '↓ Add to notes'}
                    </button>
                    <button
                      onClick={() => setAiMode(null)}
                      style={{
                        fontSize: 11,
                        color: B.faint,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div style={{ marginBottom: 18 }}>
            <Label>Compliance Status</Label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              {Object.entries(ST).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => update('status', key)}
                  style={{
                    padding: '10px 13px',
                    borderRadius: 8,
                    border: `1.5px solid ${
                      st.status === key ? cfg.dot : cfg.border
                    }`,
                    background: st.status === key ? cfg.bg : B.card,
                    color: st.status === key ? cfg.color : B.muted,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 600,
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: st.status === key ? cfg.dot : B.border,
                    }}
                  />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <Label>Assigned To</Label>
              <FInput
                value={st.assignee || ''}
                onChange={(v) => update('assignee', v)}
                placeholder="Name or role…"
              />
            </div>
            <div>
              <Label>Target Date</Label>
              <FInput
                type="date"
                value={st.dueDate || ''}
                onChange={(v) => update('dueDate', v)}
              />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <Label>Notes / Action Items</Label>
            <FTextarea
              value={st.notes || ''}
              onChange={(v) => update('notes', v)}
              placeholder="Gap analysis, corrective actions, progress notes…"
            />
          </div>
          <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 16 }}>
            <DocZone
              std={std}
              docs={st.docs || []}
              onAddDoc={handleAddDoc}
              onRemoveDoc={(id) =>
                onUpdateStd(
                  stdId,
                  'docs',
                  (st.docs || []).filter((d) => d.id !== id)
                )
              }
              onUpdateDocRationale={handleUpdateRationale}
            />
          </div>
          {st.updatedAt && (
            <div
              style={{
                fontSize: 11,
                color: '#d1d8db',
                textAlign: 'right',
                marginTop: 10,
              }}
            >
              Updated {timeAgo(st.updatedAt)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   EMAP STANDARDS VIEW
═══════════════════════════════════════════════════════ */
function AccreditationView({ data, updateData }) {
  const standards = data.standards || {};
  const [detailId, setDetailId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const overall = useMemo(() => overallStats(standards), [standards]);
  const compliantSections = ALL_SECTIONS.filter(
    (s) => sectionAggStatus(s, standards) === 'compliant'
  ).length;
  const onUpdateStd = useCallback(
    (stdId, field, val) => {
      updateData((prev) => {
        const cur = prev.standards || {};
        const rec = cur[stdId] || initRecord();
        return {
          ...prev,
          standards: {
            ...cur,
            [stdId]: { ...rec, [field]: val, updatedAt: Date.now() },
          },
        };
      });
    },
    [updateData]
  );
  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.4px',
          }}
        >
          EMAP Standards
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 3 }}>
          EMS 5-2022 · {compliantSections}/{ALL_SECTIONS.length} sections
          compliant · {overall.compliant}/{overall.total} standards compliant
        </p>
        <div
          style={{
            marginTop: 10,
            height: 4,
            background: B.border,
            borderRadius: 2,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${overall.pct}%`,
              background: `linear-gradient(90deg,${B.teal},${B.green})`,
              borderRadius: 2,
              transition: 'width 0.8s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11 }}>
          <span style={{ color: B.green, fontWeight: 600 }}>
            ✓ {overall.compliant} compliant
          </span>
          <span style={{ color: B.amber, fontWeight: 600 }}>
            ◑ {overall.in_progress} in progress
          </span>
          <span style={{ color: B.red, fontWeight: 600 }}>
            ! {overall.needs_review} needs review
          </span>
          <span style={{ color: B.faint }}>
            ○ {overall.not_started} not started
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ALL_SECTIONS.map((sec) => {
          const aggStatus = sectionAggStatus(sec, standards);
          const stats = sectionStats(sec, standards);
          const isExpanded = expandedSections[sec.id] === true;
          const aggCfg = ST[aggStatus];
          return (
            <div
              key={sec.id}
              style={{
                background: B.card,
                border: `1px solid ${B.border}`,
                borderRadius: 11,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  setExpandedSections((p) => ({ ...p, [sec.id]: !p[sec.id] }))
                }
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: sec.chapter.color,
                    background: `${sec.chapter.color}15`,
                    padding: '3px 8px',
                    borderRadius: 6,
                    flexShrink: 0,
                    minWidth: 32,
                    textAlign: 'center',
                  }}
                >
                  {sec.id}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 600,
                    color: B.text,
                  }}
                >
                  {sec.title}
                </span>
                <span style={{ fontSize: 11, color: B.faint, flexShrink: 0 }}>
                  {sec.standards.length} standards
                </span>
                <div style={{ width: 60, flexShrink: 0 }}>
                  <div
                    style={{
                      height: 3,
                      background: '#edf2f4',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${stats.pct}%`,
                        background: stats.pct === 100 ? B.green : B.teal,
                        borderRadius: 2,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: B.faint,
                      textAlign: 'right',
                      marginTop: 2,
                    }}
                  >
                    {stats.pct}%
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    value={aggStatus}
                    onChange={(e) => {
                      const ns = e.target.value;
                      updateData((prev) => {
                        const cur = prev.standards || {};
                        const u = { ...cur };
                        sec.standards.forEach((s) => {
                          u[s.id] = {
                            ...(cur[s.id] || initRecord()),
                            status: ns,
                            updatedAt: Date.now(),
                          };
                        });
                        return { ...prev, standards: u };
                      });
                    }}
                    style={{
                      border: `1px solid ${aggCfg.border}`,
                      borderRadius: 8,
                      padding: '6px 28px 6px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: aggCfg.color,
                      background: aggCfg.bg,
                      cursor: 'pointer',
                      outline: 'none',
                      fontFamily: "'DM Sans',sans-serif",
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239AAAB5'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                    }}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="compliant">Compliant</option>
                    <option value="needs_review">Needs Review</option>
                  </select>
                </div>
                <StatusDot status={aggStatus} size={11} />
                <span
                  style={{
                    color: B.faint,
                    fontSize: 10,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  ▼
                </span>
              </div>
              {isExpanded && (
                <div style={{ borderTop: `1px solid #f4f7f8` }}>
                  {sec.standards.map((std, i) => {
                    const st = standards[std.id] || initRecord();
                    const cfg = ST[st.status];
                    const docCount = (st.docs || []).length;
                    const bestConf =
                      docCount > 0
                        ? Math.max(
                            ...(st.docs || [])
                              .filter((d) => d.confidence != null)
                              .map((d) => d.confidence)
                          )
                        : null;
                    return (
                      <div
                        key={std.id}
                        onClick={() => setDetailId(std.id)}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                          padding: '11px 18px',
                          background: i % 2 === 0 ? '#fafcfc' : B.card,
                          borderTop: i > 0 ? `1px solid #f0f4f5` : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = B.tealLight)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            i % 2 === 0 ? '#fafcfc' : B.card)
                        }
                      >
                        <div
                          style={{
                            width: 3,
                            alignSelf: 'stretch',
                            background: cfg.dot,
                            borderRadius: 2,
                            flexShrink: 0,
                            minHeight: 18,
                            transition: 'background 0.3s',
                          }}
                        />
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#92400e',
                            background: B.amberLight,
                            padding: '2px 7px',
                            borderRadius: 5,
                            flexShrink: 0,
                          }}
                        >
                          {std.id}
                        </span>
                        <p
                          style={{
                            flex: 1,
                            fontSize: 12.5,
                            color: B.muted,
                            lineHeight: 1.5,
                            margin: 0,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {std.text}
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            alignItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {docCount > 0 && (
                            <span
                              style={{
                                fontSize: 10,
                                color:
                                  bestConf >= 75
                                    ? B.green
                                    : bestConf >= 50
                                    ? B.amber
                                    : B.muted,
                                background:
                                  bestConf >= 75
                                    ? B.greenLight
                                    : bestConf >= 50
                                    ? B.amberLight
                                    : '#f4f8f9',
                                border: `1px solid ${
                                  bestConf >= 75
                                    ? B.greenBorder
                                    : bestConf >= 50
                                    ? B.amberBorder
                                    : B.border
                                }`,
                                padding: '1px 6px',
                                borderRadius: 8,
                                fontWeight: 600,
                              }}
                            >
                              📄{docCount}
                              {bestConf !== null ? ` · ${bestConf}%` : ''}
                            </span>
                          )}
                          {st.assignee && (
                            <span
                              style={{ fontSize: 10, color: B.faint }}
                              title={st.assignee}
                            >
                              👤
                            </span>
                          )}
                          <StatusPill status={st.status} compact />
                          <span style={{ color: '#d1d8db', fontSize: 14 }}>
                            ›
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!isExpanded && aggStatus !== 'not_started' && (
                <div
                  style={{ padding: '0 18px 12px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    value={
                      sec.standards
                        .map((s) => standards[s.id]?.notes || '')
                        .filter(Boolean)
                        .join(' | ')
                        .slice(0, 80) || ''
                    }
                    readOnly
                    onClick={() => setDetailId(sec.standards[0]?.id)}
                    placeholder="Click to view notes…"
                    style={{
                      width: '100%',
                      border: `1px solid ${B.border}`,
                      borderRadius: 7,
                      padding: '7px 11px',
                      color: B.faint,
                      fontSize: 12,
                      fontFamily: "'DM Sans',sans-serif",
                      outline: 'none',
                      background: '#fafcfc',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {detailId && (
        <DetailPanel
          stdId={detailId}
          standards={standards}
          onUpdateStd={onUpdateStd}
          onClose={(nextId) => {
            if (nextId) setDetailId(nextId);
            else setDetailId(null);
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EXERCISE & AAR — Full workflow
═══════════════════════════════════════════════════════ */
const HSEEP_TYPES = [
  'Seminar',
  'Workshop',
  'Tabletop Exercise (TTX)',
  'Game',
  'Drill',
  'Functional Exercise (FE)',
  'Full-Scale Exercise (FSE)',
];
const EXERCISE_STATUS = {
  planned: { label: 'Planned', color: B.blue, bg: B.blueLight },
  in_progress: { label: 'In Progress', color: B.amber, bg: B.amberLight },
  completed: { label: 'Completed', color: '#6366f1', bg: '#eef2ff' },
  aar_draft: { label: 'AAR Draft', color: B.purple, bg: B.purpleLight },
  aar_final: { label: 'AAR Final', color: B.green, bg: B.greenLight },
  closed: { label: 'Closed', color: B.faint, bg: '#f8fafc' },
};
const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

function ExerciseDetail({ ex, onUpdate, onClose }) {
  const [tab, setTab] = useState('overview');
  const [aarDraftLoading, setAarDraftLoading] = useState(false);
  const [aarFinalLoading, setAarFinalLoading] = useState(false);
  const [caText, setCaText] = useState('');
  const [strengthText, setStrengthText] = useState('');
  const [afiText, setAfiText] = useState('');

  const u = (field, val) => onUpdate({ ...ex, [field]: val });

  const genAARDraft = async () => {
    setAarDraftLoading(true);
    const stateNote = ex.state
      ? `This exercise was conducted in ${ex.state}. Check if ${ex.state} has specific AAR format requirements beyond HSEEP (e.g., state OES/DHSEM templates).`
      : '';
    const prompt = `Generate a HSEEP-compliant After-Action Report (AAR) DRAFT for this exercise:\n\nExercise Name: ${
      ex.name
    }\nType: ${ex.type}\nDate: ${ex.date}\nLocation: ${
      ex.location || 'Not specified'
    }\nParticipants: ${ex.participants || 'Not specified'}\nScenario: ${
      ex.scenario || 'Not specified'
    }\nObjectives:\n${
      (ex.objectives || []).map((o, i) => `${i + 1}. ${o}`).join('\n') ||
      'Not specified'
    }\nStrengths identified: ${
      (ex.strengths || []).join('; ') || 'None recorded yet'
    }\nAreas for improvement: ${
      (ex.afis || []).join('; ') || 'None recorded yet'
    }\nCorrective actions: ${
      (ex.corrective || []).map((c) => c.item).join('; ') || 'None recorded yet'
    }\n\n${stateNote}\n\nHSEEP AAR requirements:\n- FEMA HSEEP doctrine requires AARs to document exercise design, analysis of core capabilities, strengths, areas for improvement (AFIs), and an Improvement Plan (IP)\n- EMAP 4.11 requires exercise evaluation products to be documented and disseminated\n- The AAR/IP must be completed within 60 days of the exercise\n\nWrite a complete draft AAR with these sections:\n1. EXECUTIVE SUMMARY (2-3 paragraphs)\n2. EXERCISE DESIGN SUMMARY (type, objectives, scenario overview, methodology)\n3. ANALYSIS OF CAPABILITIES (what worked, what needs improvement for each stated objective)\n4. STRENGTHS (bullet list)\n5. AREAS FOR IMPROVEMENT (bullet list with priority level)\n6. IMPROVEMENT PLAN (table format as text: Action | Responsible Party | Completion Date | Status)\n\nBe specific to the information provided. Use professional tone appropriate for government document.`;
    let draft = '';
    try {
      await callAI(SYS, prompt, (chunk) => {
        draft += chunk;
        u('aarDraft', draft);
      });
    } catch {
      u('aarDraft', 'Error generating draft.');
    }
    u('status', 'aar_draft');
    setAarDraftLoading(false);
  };

  const finalizeAAR = async () => {
    setAarFinalLoading(true);
    const prompt = `Review and finalize this AAR draft, ensuring it fully meets HSEEP doctrine requirements and EMAP 4.11 standards. Make it polished and professional.\n\nDraft:\n${
      ex.aarDraft || ex.aarFinal || 'No draft yet'
    }\n\nAdditional context:\nExercise: ${ex.name} (${ex.type})\nDate: ${
      ex.date
    }\nParticipants: ${
      ex.participants || 'N/A'
    }\n\nEnsure the final document:\n- Has a proper cover page header\n- Includes all required HSEEP sections\n- Is formatted for official publication\n- Corrective actions include measurable outcomes\n- Meets EMAP 4.11.2 documentation requirements\n\nOutput the complete finalized AAR.`;
    let final = '';
    try {
      await callAI(SYS, prompt, (chunk) => {
        final += chunk;
        u('aarFinal', final);
      });
    } catch {
      u('aarFinal', 'Error generating final.');
    }
    u('status', 'aar_final');
    setAarFinalLoading(false);
  };

  const addItem = (field, val) => {
    if (!val.trim()) return;
    u(field, [...(ex[field] || []), val.trim()]);
  };
  const removeItem = (field, idx) =>
    u(
      field,
      (ex[field] || []).filter((_, i) => i !== idx)
    );
  const toggleCA = (caId) =>
    u(
      'corrective',
      (ex.corrective || []).map((c) =>
        c.id === caId ? { ...c, closed: !c.closed } : c
      )
    );
  const addCA = () => {
    if (!caText.trim()) return;
    u('corrective', [
      ...(ex.corrective || []),
      {
        id: uid(),
        item: caText.trim(),
        responsible: '',
        dueDate: '',
        closed: false,
      },
    ]);
    setCaText('');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'objectives', label: 'Objectives & Participants' },
    { id: 'eval', label: 'Evaluation' },
    { id: 'aar_draft', label: 'AAR Draft' },
    { id: 'aar_final', label: 'AAR Final' },
  ];
  const sc = EXERCISE_STATUS[ex.status] || EXERCISE_STATUS.planned;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.3)',
          zIndex: 49,
          animation: 'fadeIn 0.15s',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 640,
          height: '100vh',
          background: B.card,
          borderLeft: `1px solid ${B.border}`,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.25s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${B.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: B.text }}>
                {ex.name}
              </div>
              <div style={{ fontSize: 12, color: B.faint, marginTop: 2 }}>
                {ex.type} · {fmtDate(ex.date)}
                {ex.location ? ` · ${ex.location}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: sc.color,
                  background: sc.bg,
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: `1px solid ${sc.color}30`,
                }}
              >
                {sc.label}
              </span>
              <button
                onClick={onClose}
                style={{
                  background: '#f4f7f8',
                  border: `1px solid ${B.border}`,
                  borderRadius: 7,
                  color: B.muted,
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: '4px 9px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px 6px 0 0',
                  border: `1px solid ${tab === t.id ? B.border : 'tranSPRent'}`,
                  borderBottom: `1px solid ${tab === t.id ? B.card : B.border}`,
                  background: tab === t.id ? B.card : 'tranSPRent',
                  color: tab === t.id ? B.teal : B.muted,
                  fontSize: 12,
                  fontWeight: tab === t.id ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  transition: 'all 0.12s',
                  marginBottom: tab === t.id ? -1 : 0,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 40px' }}>
          {/* ─ OVERVIEW ─ */}
          {tab === 'overview' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <Label>Exercise Name</Label>
                  <FInput
                    value={ex.name || ''}
                    onChange={(v) => u('name', v)}
                    placeholder="Exercise name"
                  />
                </div>
                <div>
                  <Label>HSEEP Exercise Type</Label>
                  <FSel value={ex.type || ''} onChange={(v) => u('type', v)}>
                    <option value="">Select type…</option>
                    {HSEEP_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </FSel>
                </div>
                <div>
                  <Label>Date</Label>
                  <FInput
                    type="date"
                    value={ex.date || ''}
                    onChange={(v) => u('date', v)}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <FInput
                    value={ex.location || ''}
                    onChange={(v) => u('location', v)}
                    placeholder="EOC, venue, etc."
                  />
                </div>
                <div>
                  <Label>State (for AAR requirements)</Label>
                  <FSel value={ex.state || ''} onChange={(v) => u('state', v)}>
                    <option value="">Select state…</option>
                    {US_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </FSel>
                </div>
                <div>
                  <Label>Status</Label>
                  <FSel
                    value={ex.status || 'planned'}
                    onChange={(v) => u('status', v)}
                  >
                    {Object.entries(EXERCISE_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </FSel>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <Label>Exercise Scenario / Overview</Label>
                <FTextarea
                  value={ex.scenario || ''}
                  onChange={(v) => u('scenario', v)}
                  placeholder="Describe the scenario, scope, and context of the exercise…"
                  rows={4}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Label>Sponsoring Agency</Label>
                <FInput
                  value={ex.sponsor || ''}
                  onChange={(v) => u('sponsor', v)}
                  placeholder="Lead agency name"
                />
              </div>
              <div>
                <Attachments
                  docs={ex.docs || []}
                  onAdd={(doc) => u('docs', [...(ex.docs || []), doc])}
                  onRemove={(id) =>
                    u(
                      'docs',
                      (ex.docs || []).filter((d) => d.id !== id)
                    )
                  }
                />
              </div>
            </div>
          )}

          {/* ─ OBJECTIVES & PARTICIPANTS ─ */}
          {tab === 'objectives' && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <Label>Exercise Objectives</Label>
                <p style={{ fontSize: 12, color: B.faint, marginBottom: 8 }}>
                  List SMART objectives aligned with core capabilities (EMAP
                  4.11 / HSEEP)
                </p>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <FInput
                    value={''}
                    onChange={() => {}}
                    placeholder="Add objective… (press Enter)"
                    style={{ fontSize: 12 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addItem('objectives', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Btn
                    label="Add"
                    onClick={() => {
                      const inp = document.getElementById('obj-inp');
                      if (inp) {
                        addItem('objectives', inp.value);
                        inp.value = '';
                      }
                    }}
                    small
                    primary
                  />
                </div>
                <div id="obj-inp" style={{ display: 'none' }} />
                {(ex.objectives || []).length === 0 && (
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: 7,
                      padding: '12px',
                      fontSize: 12,
                      color: B.faint,
                      textAlign: 'center',
                    }}
                  >
                    No objectives added — type above and press Enter
                  </div>
                )}
                {(ex.objectives || []).map((obj, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: `${B.blue}08`,
                      border: `1px solid ${B.blueBorder}`,
                      borderRadius: 7,
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: B.blue,
                        background: B.blueLight,
                        padding: '1px 6px',
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: 12, color: B.text }}>
                      {obj}
                    </span>
                    <button
                      onClick={() => removeItem('objectives', i)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 18 }}>
                <Label>Participants</Label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <div>
                    <Label>Total Participants</Label>
                    <FInput
                      value={ex.participantCount || ''}
                      onChange={(v) => u('participantCount', v)}
                      placeholder="e.g. 45"
                    />
                  </div>
                  <div>
                    <Label>Agencies / Organizations</Label>
                    <FInput
                      value={ex.agencies || ''}
                      onChange={(v) => u('agencies', v)}
                      placeholder="e.g. 8 agencies"
                    />
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Label>Participant Notes</Label>
                  <FTextarea
                    value={ex.participantNotes || ''}
                    onChange={(v) => u('participantNotes', v)}
                    placeholder="List agencies, roles, or other participation details…"
                    rows={3}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <Label>Exercise Controllers & Evaluators</Label>
                <FTextarea
                  value={ex.controllers || ''}
                  onChange={(v) => u('controllers', v)}
                  placeholder="List controllers and evaluators assigned to this exercise…"
                  rows={3}
                />
              </div>
              <div>
                <Label>Observer Notes</Label>
                <FTextarea
                  value={ex.observerNotes || ''}
                  onChange={(v) => u('observerNotes', v)}
                  placeholder="Hot wash notes, observer observations during exercise…"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* ─ EVALUATION (Strengths, AFIs, CAs) ─ */}
          {tab === 'eval' && (
            <div>
              <div
                style={{
                  background: `${B.green}10`,
                  border: `1px solid ${B.greenBorder}`,
                  borderRadius: 9,
                  padding: '14px 16px',
                  marginBottom: 16,
                }}
              >
                <Label>Strengths Observed</Label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <FInput
                    value={strengthText}
                    onChange={setStrengthText}
                    placeholder="Add a strength…"
                    style={{ fontSize: 12 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addItem('strengths', strengthText);
                        setStrengthText('');
                      }
                    }}
                  />
                  <Btn
                    label="Add"
                    onClick={() => {
                      addItem('strengths', strengthText);
                      setStrengthText('');
                    }}
                    small
                    primary
                  />
                </div>
                {(ex.strengths || []).map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'flex-start',
                      padding: '7px 9px',
                      background: B.card,
                      borderRadius: 6,
                      marginBottom: 4,
                      border: `1px solid ${B.greenBorder}`,
                    }}
                  >
                    <span
                      style={{
                        color: B.green,
                        fontSize: 12,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ flex: 1, fontSize: 12, color: B.text }}>
                      {s}
                    </span>
                    <button
                      onClick={() => removeItem('strengths', i)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: `${B.amber}10`,
                  border: `1px solid ${B.amberBorder}`,
                  borderRadius: 9,
                  padding: '14px 16px',
                  marginBottom: 16,
                }}
              >
                <Label>Areas for Improvement (AFIs)</Label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <FInput
                    value={afiText}
                    onChange={setAfiText}
                    placeholder="Add an area for improvement…"
                    style={{ fontSize: 12 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addItem('afis', afiText);
                        setAfiText('');
                      }
                    }}
                  />
                  <Btn
                    label="Add"
                    onClick={() => {
                      addItem('afis', afiText);
                      setAfiText('');
                    }}
                    small
                    primary
                  />
                </div>
                {(ex.afis || []).map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'flex-start',
                      padding: '7px 9px',
                      background: B.card,
                      borderRadius: 6,
                      marginBottom: 4,
                      border: `1px solid ${B.amberBorder}`,
                    }}
                  >
                    <span
                      style={{
                        color: B.amber,
                        fontSize: 12,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      △
                    </span>
                    <span style={{ flex: 1, fontSize: 12, color: B.text }}>
                      {a}
                    </span>
                    <button
                      onClick={() => removeItem('afis', i)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: `${B.red}08`,
                  border: `1px solid ${B.redBorder}`,
                  borderRadius: 9,
                  padding: '14px 16px',
                }}
              >
                <Label>Improvement Plan — Corrective Actions</Label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <FInput
                    value={caText}
                    onChange={setCaText}
                    placeholder="Add corrective action…"
                    style={{ fontSize: 12 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addCA();
                      }
                    }}
                  />
                  <Btn label="Add" onClick={addCA} small primary />
                </div>
                {(ex.corrective || []).map((ca) => (
                  <div
                    key={ca.id}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: ca.closed ? '#f8fafc' : B.card,
                      borderRadius: 6,
                      marginBottom: 5,
                      border: `1px solid ${ca.closed ? B.border : B.redBorder}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={ca.closed}
                      onChange={() => toggleCA(ca.id)}
                      style={{ cursor: 'pointer', accentColor: B.teal }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: ca.closed ? B.faint : B.text,
                        textDecoration: ca.closed ? 'line-through' : 'none',
                      }}
                    >
                      {ca.item}
                    </span>
                    {!ca.closed && (
                      <Tag
                        label="Open"
                        color={B.red}
                        bg={B.redLight}
                        border={B.redBorder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─ AAR DRAFT ─ */}
          {tab === 'aar_draft' && (
            <div>
              <div
                style={{
                  background: B.purpleLight,
                  border: `1px solid ${B.purpleBorder}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: B.purple,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        marginBottom: 3,
                      }}
                    >
                      <BrainIcon size={13} color={B.purple} strokeWidth={1.4} />
                      AI AAR Draft Generator
                    </div>
                    <div style={{ fontSize: 11, color: B.faint }}>
                      HSEEP-compliant draft · EMAP 4.11 requirements ·{' '}
                      {ex.state
                        ? `${ex.state} state considerations`
                        : 'Add state for state-specific guidance'}
                    </div>
                  </div>
                  <Btn
                    label={
                      aarDraftLoading ? '⟳ Drafting…' : 'Generate AAR Draft'
                    }
                    onClick={genAARDraft}
                    loading={aarDraftLoading}
                    primary
                  />
                </div>
                {!ex.aarDraft && !aarDraftLoading && (
                  <div style={{ fontSize: 12, color: B.faint }}>
                    Fill in Overview and Objectives/Participants tabs first,
                    then generate your HSEEP-compliant AAR draft here. AI will
                    incorporate all strengths, AFIs, and corrective actions from
                    the Evaluation tab.
                  </div>
                )}
                {aarDraftLoading && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: B.purple,
                    }}
                  >
                    <span
                      style={{
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block',
                      }}
                    >
                      ⟳
                    </span>
                    Drafting HSEEP-compliant AAR…
                  </div>
                )}
              </div>
              <div>
                <Label>AAR Draft</Label>
                <FTextarea
                  value={ex.aarDraft || ''}
                  onChange={(v) => u('aarDraft', v)}
                  placeholder="AAR draft will appear here after AI generation, or type/paste your draft…"
                  rows={20}
                />
              </div>
              <Attachments
                docs={ex.aarDraftDocs || []}
                onAdd={(doc) =>
                  u('aarDraftDocs', [...(ex.aarDraftDocs || []), doc])
                }
                onRemove={(id) =>
                  u(
                    'aarDraftDocs',
                    (ex.aarDraftDocs || []).filter((d) => d.id !== id)
                  )
                }
              />
            </div>
          )}

          {/* ─ AAR FINAL ─ */}
          {tab === 'aar_final' && (
            <div>
              <div
                style={{
                  background: B.greenLight,
                  border: `1px solid ${B.greenBorder}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: B.green,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <BrainIcon size={13} color={B.green} strokeWidth={1.4} />
                      Finalize AAR with AI
                    </div>
                    <div style={{ fontSize: 11, color: B.faint }}>
                      Polishes draft into a publication-ready document meeting
                      all HSEEP and EMAP 4.11 requirements
                    </div>
                  </div>
                  <Btn
                    label={aarFinalLoading ? '⟳ Finalizing…' : 'Finalize AAR'}
                    onClick={finalizeAAR}
                    loading={aarFinalLoading}
                    primary
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>Final AAR</Label>
                <FTextarea
                  value={ex.aarFinal || ''}
                  onChange={(v) => u('aarFinal', v)}
                  placeholder="Final AAR will appear here. This is the official record for EMAP accreditation evidence."
                  rows={20}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <Label>Date Finalized</Label>
                  <FInput
                    type="date"
                    value={ex.aarFinalDate || ''}
                    onChange={(v) => u('aarFinalDate', v)}
                  />
                </div>
                <div>
                  <Label>Distribution List</Label>
                  <FInput
                    value={ex.aarDistribution || ''}
                    onChange={(v) => u('aarDistribution', v)}
                    placeholder="Stakeholders, agencies…"
                  />
                </div>
              </div>
              <Attachments
                docs={ex.aarFinalDocs || []}
                onAdd={(doc) =>
                  u('aarFinalDocs', [...(ex.aarFinalDocs || []), doc])
                }
                onRemove={(id) =>
                  u(
                    'aarFinalDocs',
                    (ex.aarFinalDocs || []).filter((d) => d.id !== id)
                  )
                }
              />
              {ex.aarFinal && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 14px',
                    background: B.greenLight,
                    border: `1px solid ${B.greenBorder}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#065f46',
                  }}
                >
                  ✓ Final AAR on file — counts as evidence for EMAP 4.11.2
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ExerciseManager({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'Tabletop Exercise (TTX)',
    date: today(),
    status: 'planned',
  });
  const createEx = () => {
    if (!form.name) return;
    const ex = {
      ...form,
      id: uid(),
      objectives: [],
      strengths: [],
      afis: [],
      corrective: [],
      docs: [],
      addedAt: Date.now(),
    };
    setData((prev) => ({ ...prev, exercises: [...prev.exercises, ex] }));
    setForm({
      name: '',
      type: 'Tabletop Exercise (TTX)',
      date: today(),
      status: 'planned',
    });
    setShowForm(false);
    setSelectedId(ex.id);
  };
  const updateEx = (id, updates) =>
    setData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => (e.id === id ? updates : e)),
    }));
  const removeEx = (id) => {
    setData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((e) => e.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
  };
  const sel = selectedId
    ? data.exercises.find((e) => e.id === selectedId)
    : null;
  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            Exercises & AARs
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP 4.11 · HSEEP-aligned · {data.exercises.length} exercises ·
            AI-assisted AAR drafting
          </p>
        </div>
        <Btn label="+ New Exercise" onClick={() => setShowForm(true)} primary />
      </div>
      <div
        style={{
          background: `${B.purple}10`,
          border: `1px solid ${B.purpleBorder}`,
          borderLeft: `3px solid ${B.purple}`,
          borderRadius: '0 8px 8px 0',
          padding: '9px 14px',
          marginBottom: 14,
          fontSize: 12,
          color: '#5b21b6',
        }}
      >
        ↑ Completed exercises with AARs directly satisfy{' '}
        <strong>EMAP 4.11.2</strong>. AI drafts meet HSEEP doctrine
        requirements.
      </div>
      {showForm && (
        <div
          style={{
            background: B.purpleLight,
            border: `1px solid ${B.purpleBorder}`,
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: B.text,
              marginBottom: 12,
            }}
          >
            New Exercise
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Exercise Name</Label>
              <FInput
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Annual EOC Full-Scale Exercise"
              />
            </div>
            <div>
              <Label>Type</Label>
              <FSel
                value={form.type}
                onChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                {HSEEP_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </FSel>
            </div>
            <div>
              <Label>Date</Label>
              <FInput
                type="date"
                value={form.date}
                onChange={(v) => setForm((p) => ({ ...p, date: v }))}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Create Exercise" onClick={createEx} primary />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      {data.exercises.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '36px', color: B.faint }}>
          No exercises yet — create your first exercise to start building EMAP
          4.11 evidence
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...data.exercises]
            .sort((a, b) => b.date?.localeCompare(a.date))
            .map((ex) => {
              const sc = EXERCISE_STATUS[ex.status] || EXERCISE_STATUS.planned;
              const openCAs = (ex.corrective || []).filter(
                (c) => !c.closed
              ).length;
              const hasAAR = !!(ex.aarDraft || ex.aarFinal);
              return (
                <div
                  key={ex.id}
                  style={{
                    background: B.card,
                    border: `1px solid ${B.border}`,
                    borderRadius: 9,
                    padding: '13px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => setSelectedId(ex.id)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = B.purple)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = B.border)
                  }
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: 7,
                          alignItems: 'center',
                          marginBottom: 3,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: B.text,
                          }}
                        >
                          {ex.name}
                        </span>
                        <Tag
                          label={ex.type || 'Exercise'}
                          color={B.purple}
                          bg={B.purpleLight}
                          border={B.purpleBorder}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: sc.color,
                            background: sc.bg,
                            padding: '2px 8px',
                            borderRadius: 10,
                            border: `1px solid ${sc.color}30`,
                          }}
                        >
                          {sc.label}
                        </span>
                        {hasAAR && (
                          <Tag
                            label={ex.aarFinal ? 'AAR Final ✓' : 'AAR Draft'}
                            color={ex.aarFinal ? B.green : B.amber}
                            bg={ex.aarFinal ? B.greenLight : B.amberLight}
                            border={ex.aarFinal ? B.greenBorder : B.amberBorder}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: B.faint,
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>{fmtDate(ex.date)}</span>
                        {ex.location && <span>📍 {ex.location}</span>}
                        {ex.participantCount && (
                          <span>👥 {ex.participantCount} participants</span>
                        )}
                        {(ex.objectives || []).length > 0 && (
                          <span>🎯 {ex.objectives.length} objectives</span>
                        )}
                        {openCAs > 0 && (
                          <span style={{ color: B.red, fontWeight: 600 }}>
                            ⚠ {openCAs} open CAs
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEx(ex.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        cursor: 'pointer',
                        fontSize: 14,
                        padding: '4px',
                      }}
                    >
                      ×
                    </button>
                    <span style={{ color: B.border, fontSize: 14 }}>›</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
      {sel && (
        <ExerciseDetail
          ex={sel}
          onUpdate={(updated) => updateEx(sel.id, updated)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EMPLOYEES & CREDENTIALS
═══════════════════════════════════════════════════════ */
const CERT_TYPES = [
  'ICS-100',
  'ICS-200',
  'ICS-300',
  'ICS-400',
  'IS-700 NIMS',
  'IS-800 NRF',
  'G-290 Basic Public Information',
  'G-386 Flood Fight Operations',
  'AWR-160 HAZMAT',
  'FEMA CERT',
  'Emergency Management Basic',
  'Emergency Management Advanced',
  'Certified Emergency Manager (CEM)',
  'Associate Emergency Manager (AEM)',
  'State Credentialing Program',
  'Other',
];
const TASKBOOK_TYPES = [
  'Incident Commander',
  'Operations Section Chief',
  'Planning Section Chief',
  'Logistics Section Chief',
  'Finance/Admin Section Chief',
  'Safety Officer',
  'Public Information Officer',
  'Liaison Officer',
  'Emergency Operations Center Director',
  'Emergency Operations Center Coordinator',
  'Field Supervisor',
  'Mass Care Coordinator',
  'Other FEMA Task Book',
];

function EmployeeDetail({ emp, onUpdate, onClose }) {
  const [tab, setTab] = useState('profile');
  const [certForm, setCertForm] = useState({
    name: '',
    type: 'ICS-100',
    issuer: '',
    issued: '',
    expires: '',
    certNumber: '',
  });
  const [tbForm, setTbForm] = useState({
    type: '',
    tasks: [],
    status: 'in_progress',
  });
  const [newTask, setNewTask] = useState('');

  const u = (field, val) => onUpdate({ ...emp, [field]: val });
  const addCert = () => {
    if (!certForm.name && !certForm.type) return;
    u('credentials', [
      ...(emp.credentials || []),
      {
        ...certForm,
        id: uid(),
        name: certForm.name || certForm.type,
        addedAt: Date.now(),
      },
    ]);
    setCertForm({
      name: '',
      type: 'ICS-100',
      issuer: '',
      issued: '',
      expires: '',
      certNumber: '',
    });
  };
  const removeCert = (id) =>
    u(
      'credentials',
      (emp.credentials || []).filter((c) => c.id !== id)
    );
  const addTaskBook = () => {
    if (!tbForm.type) return;
    u('taskBooks', [
      ...(emp.taskBooks || []),
      { ...tbForm, id: uid(), tasks: tbForm.tasks, addedAt: Date.now() },
    ]);
    setTbForm({ type: '', tasks: [], status: 'in_progress' });
  };
  const updateTask = (tbId, taskIdx, field, val) => {
    u(
      'taskBooks',
      (emp.taskBooks || []).map((tb) =>
        tb.id === tbId
          ? {
              ...tb,
              tasks: tb.tasks.map((t, i) =>
                i === taskIdx ? { ...t, [field]: val } : t
              ),
            }
          : tb
      )
    );
  };
  const addTask = (tbId) => {
    if (!newTask.trim()) return;
    u(
      'taskBooks',
      (emp.taskBooks || []).map((tb) =>
        tb.id === tbId
          ? {
              ...tb,
              tasks: [
                ...(tb.tasks || []),
                {
                  id: uid(),
                  item: newTask.trim(),
                  completed: false,
                  date: '',
                  supervisor: '',
                },
              ],
            }
          : tb
      )
    );
    setNewTask('');
  };
  const removeTB = (id) =>
    u(
      'taskBooks',
      (emp.taskBooks || []).filter((tb) => tb.id !== id)
    );

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'certs', label: 'Certifications' },
    { id: 'taskbooks', label: 'Task Books' },
    { id: 'training', label: 'Training History' },
  ];
  const expiringSoon = (emp.credentials || []).filter((c) => {
    const d = daysUntil(c.expires);
    return d !== null && d < 60;
  });
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.3)',
          zIndex: 49,
          animation: 'fadeIn 0.15s',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 600,
          height: '100vh',
          background: B.card,
          borderLeft: `1px solid ${B.border}`,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.25s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${B.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: `${B.indigo}20`,
                  borderRadius: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 800,
                  color: B.indigo,
                  flexShrink: 0,
                }}
              >
                {(emp.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: B.text }}>
                  {emp.name || 'New Employee'}
                </div>
                <div style={{ fontSize: 12, color: B.faint }}>
                  {emp.title || ''}
                  {emp.title && emp.department ? ' · ' : ''}
                  {emp.department || ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {expiringSoon.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    background: B.redLight,
                    color: B.red,
                    padding: '3px 9px',
                    borderRadius: 10,
                    border: `1px solid ${B.redBorder}`,
                    fontWeight: 600,
                  }}
                >
                  ⚠ {expiringSoon.length} expiring
                </span>
              )}
              <button
                onClick={onClose}
                style={{
                  background: '#f4f7f8',
                  border: `1px solid ${B.border}`,
                  borderRadius: 7,
                  color: B.muted,
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: '4px 9px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px 6px 0 0',
                  border: `1px solid ${tab === t.id ? B.border : 'tranSPRent'}`,
                  borderBottom: `1px solid ${tab === t.id ? B.card : B.border}`,
                  background: tab === t.id ? B.card : 'tranSPRent',
                  color: tab === t.id ? B.indigo : B.muted,
                  fontSize: 12,
                  fontWeight: tab === t.id ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  marginBottom: tab === t.id ? -1 : 0,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 40px' }}>
          {/* ─ PROFILE ─ */}
          {tab === 'profile' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <Label>Full Name</Label>
                  <FInput
                    value={emp.name || ''}
                    onChange={(v) => u('name', v)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Job Title / Position</Label>
                  <FInput
                    value={emp.title || ''}
                    onChange={(v) => u('title', v)}
                    placeholder="Emergency Manager"
                  />
                </div>
                <div>
                  <Label>Department / Agency</Label>
                  <FInput
                    value={emp.department || ''}
                    onChange={(v) => u('department', v)}
                    placeholder="Office of Emergency Services"
                  />
                </div>
                <div>
                  <Label>Employee ID</Label>
                  <FInput
                    value={emp.empId || ''}
                    onChange={(v) => u('empId', v)}
                    placeholder="EMP-001"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <FInput
                    type="email"
                    value={emp.email || ''}
                    onChange={(v) => u('email', v)}
                    placeholder="email@agency.gov"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <FInput
                    value={emp.phone || ''}
                    onChange={(v) => u('phone', v)}
                    placeholder="(209) 000-0000"
                  />
                </div>
                <div>
                  <Label>Date Hired</Label>
                  <FInput
                    type="date"
                    value={emp.hireDate || ''}
                    onChange={(v) => u('hireDate', v)}
                  />
                </div>
                <div>
                  <Label>Employment Status</Label>
                  <FSel
                    value={emp.status || 'active'}
                    onChange={(v) => u('status', v)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="part_time">Part-Time</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="contractor">Contractor</option>
                  </FSel>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>Notes</Label>
                <FTextarea
                  value={emp.notes || ''}
                  onChange={(v) => u('notes', v)}
                  placeholder="Additional notes about this employee…"
                  rows={3}
                />
              </div>
              <Attachments
                docs={emp.docs || []}
                onAdd={(doc) => u('docs', [...(emp.docs || []), doc])}
                onRemove={(id) =>
                  u(
                    'docs',
                    (emp.docs || []).filter((d) => d.id !== id)
                  )
                }
              />
            </div>
          )}

          {/* ─ CERTIFICATIONS ─ */}
          {tab === 'certs' && (
            <div>
              {expiringSoon.length > 0 && (
                <div
                  style={{
                    background: B.redLight,
                    border: `1px solid ${B.redBorder}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: B.red,
                      marginBottom: 4,
                    }}
                  >
                    ⚠ Credentials Expiring Soon
                  </div>
                  {expiringSoon.map((c) => (
                    <div key={c.id} style={{ fontSize: 12, color: B.red }}>
                      {c.name} —{' '}
                      {daysUntil(c.expires) < 0
                        ? 'EXPIRED'
                        : `${daysUntil(c.expires)} days`}
                    </div>
                  ))}
                </div>
              )}
              <div
                style={{
                  background: B.indigoLight,
                  border: `1px solid ${B.indigoBorder}`,
                  borderRadius: 9,
                  padding: '14px 16px',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: B.indigo,
                    marginBottom: 12,
                  }}
                >
                  Add Certification / Credential
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <Label>Credential Name</Label>
                    <FInput
                      value={certForm.name}
                      onChange={(v) => setCertForm((p) => ({ ...p, name: v }))}
                      placeholder="Leave blank to use type"
                    />
                  </div>
                  <div>
                    <Label>Credential Type</Label>
                    <FSel
                      value={certForm.type}
                      onChange={(v) => setCertForm((p) => ({ ...p, type: v }))}
                    >
                      {CERT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </FSel>
                  </div>
                  <div>
                    <Label>Issuing Organization</Label>
                    <FInput
                      value={certForm.issuer}
                      onChange={(v) =>
                        setCertForm((p) => ({ ...p, issuer: v }))
                      }
                      placeholder="FEMA, State OES, IAEM…"
                    />
                  </div>
                  <div>
                    <Label>Certificate Number</Label>
                    <FInput
                      value={certForm.certNumber}
                      onChange={(v) =>
                        setCertForm((p) => ({ ...p, certNumber: v }))
                      }
                      placeholder="Cert #"
                    />
                  </div>
                  <div>
                    <Label>Date Issued</Label>
                    <FInput
                      type="date"
                      value={certForm.issued}
                      onChange={(v) =>
                        setCertForm((p) => ({ ...p, issued: v }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Expiration Date</Label>
                    <FInput
                      type="date"
                      value={certForm.expires}
                      onChange={(v) =>
                        setCertForm((p) => ({ ...p, expires: v }))
                      }
                    />
                  </div>
                </div>
                <Btn label="Add Credential" onClick={addCert} primary small />
              </div>
              {(emp.credentials || []).length === 0 && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '24px',
                    textAlign: 'center',
                    color: B.faint,
                    fontSize: 13,
                  }}
                >
                  No credentials recorded yet
                </div>
              )}
              {(emp.credentials || []).map((c) => {
                const d = daysUntil(c.expires);
                const urgColor =
                  d === null
                    ? B.green
                    : d < 0
                    ? B.red
                    : d < 30
                    ? B.red
                    : d < 60
                    ? B.amber
                    : B.green;
                const urgBg =
                  d === null
                    ? B.greenLight
                    : d < 30
                    ? B.redLight
                    : d < 60
                    ? B.amberLight
                    : B.greenLight;
                return (
                  <div
                    key={c.id}
                    style={{
                      background: B.card,
                      border: `1px solid ${
                        d !== null && d < 60 ? B.redBorder : B.border
                      }`,
                      borderRadius: 9,
                      padding: '12px 14px',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          background: urgBg,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        🎓
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: B.text,
                            marginBottom: 2,
                          }}
                        >
                          {c.name || c.type}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 12,
                            fontSize: 11,
                            color: B.faint,
                            flexWrap: 'wrap',
                          }}
                        >
                          {c.issuer && <span>🏛 {c.issuer}</span>}
                          {c.certNumber && <span>#{c.certNumber}</span>}
                          {c.issued && <span>Issued: {fmtDate(c.issued)}</span>}
                          {c.expires && (
                            <span
                              style={{
                                color: urgColor,
                                fontWeight: d !== null && d < 60 ? 700 : 400,
                              }}
                            >
                              Expires: {fmtDate(c.expires)}
                              {d !== null && d < 60
                                ? ` (${d < 0 ? 'EXPIRED' : `${d}d`})`
                                : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeCert(c.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d1d5db',
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─ TASK BOOKS ─ */}
          {tab === 'taskbooks' && (
            <div>
              <div
                style={{
                  background: B.amberLight,
                  border: `1px solid ${B.amberBorder}`,
                  borderRadius: 9,
                  padding: '14px 16px',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#92400e',
                    marginBottom: 10,
                  }}
                >
                  Add FEMA Task Book
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <Label>Task Book Type / Position</Label>
                    <FSel
                      value={tbForm.type}
                      onChange={(v) => setTbForm((p) => ({ ...p, type: v }))}
                    >
                      <option value="">Select position…</option>
                      {TASKBOOK_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </FSel>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <FSel
                      value={tbForm.status}
                      onChange={(v) => setTbForm((p) => ({ ...p, status: v }))}
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="complete">Complete</option>
                      <option value="certified">Certified</option>
                    </FSel>
                  </div>
                </div>
                <Btn
                  label="Create Task Book"
                  onClick={addTaskBook}
                  primary
                  small
                />
              </div>
              {(emp.taskBooks || []).length === 0 && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '24px',
                    textAlign: 'center',
                    color: B.faint,
                    fontSize: 13,
                  }}
                >
                  No task books yet — FEMA task books track position
                  qualification
                </div>
              )}
              {(emp.taskBooks || []).map((tb) => {
                const completed = (tb.tasks || []).filter(
                  (t) => t.completed
                ).length;
                const total = (tb.tasks || []).length;
                const statusCfg = {
                  in_progress: { label: 'In Progress', color: B.amber },
                  complete: { label: 'Complete', color: B.blue },
                  certified: { label: 'Certified', color: B.green },
                }[tb.status] || { label: 'In Progress', color: B.amber };
                return (
                  <div
                    key={tb.id}
                    style={{
                      background: B.card,
                      border: `1px solid ${B.border}`,
                      borderRadius: 10,
                      marginBottom: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 14px',
                        background: '#f8fafc',
                        borderBottom: `1px solid ${B.border}`,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: B.text,
                          }}
                        >
                          {tb.type || 'Task Book'}
                        </div>
                        <div
                          style={{ fontSize: 11, color: B.faint, marginTop: 2 }}
                        >
                          {completed}/{total} tasks complete
                        </div>
                      </div>
                      {total > 0 && (
                        <div style={{ width: 48, flexShrink: 0 }}>
                          <div
                            style={{
                              height: 4,
                              background: '#edf2f4',
                              borderRadius: 2,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.round(
                                  (completed / total) * 100
                                )}%`,
                                background: statusCfg.color,
                                borderRadius: 2,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: B.faint,
                              textAlign: 'right',
                              marginTop: 2,
                            }}
                          >
                            {Math.round((completed / total) * 100)}%
                          </div>
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: statusCfg.color,
                          background: `${statusCfg.color}15`,
                          padding: '3px 9px',
                          borderRadius: 10,
                        }}
                      >
                        {statusCfg.label}
                      </span>
                      <FSel
                        value={tb.status}
                        onChange={(v) =>
                          u(
                            'taskBooks',
                            (emp.taskBooks || []).map((t) =>
                              t.id === tb.id ? { ...t, status: v } : t
                            )
                          )
                        }
                        style={{ width: 130, fontSize: 11 }}
                      >
                        <option value="in_progress">In Progress</option>
                        <option value="complete">Complete</option>
                        <option value="certified">Certified</option>
                      </FSel>
                      <button
                        onClick={() => removeTB(tb.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d1d5db',
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        <FInput
                          value={newTask}
                          onChange={setNewTask}
                          placeholder="Add task item…"
                          style={{ fontSize: 12 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addTask(tb.id);
                            }
                          }}
                        />
                        <Btn
                          label="Add"
                          onClick={() => addTask(tb.id)}
                          small
                          primary
                        />
                      </div>
                      {(tb.tasks || []).map((task, ti) => (
                        <div
                          key={task.id}
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'flex-start',
                            padding: '7px 8px',
                            background: task.completed ? '#f8fafc' : B.card,
                            borderRadius: 6,
                            marginBottom: 4,
                            border: `1px solid ${
                              task.completed ? B.border : B.amberBorder
                            }`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() =>
                              updateTask(
                                tb.id,
                                ti,
                                'completed',
                                !task.completed
                              )
                            }
                            style={{
                              cursor: 'pointer',
                              accentColor: B.teal,
                              marginTop: 2,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 12,
                                color: task.completed ? B.faint : B.text,
                                textDecoration: task.completed
                                  ? 'line-through'
                                  : 'none',
                              }}
                            >
                              {task.item}
                            </div>
                            {task.completed && (
                              <div
                                style={{
                                  display: 'flex',
                                  gap: 10,
                                  marginTop: 4,
                                }}
                              >
                                <FInput
                                  value={task.date || ''}
                                  onChange={(v) =>
                                    updateTask(tb.id, ti, 'date', v)
                                  }
                                  type="date"
                                  style={{
                                    fontSize: 11,
                                    padding: '3px 7px',
                                    width: 'auto',
                                  }}
                                />
                                <FInput
                                  value={task.supervisor || ''}
                                  onChange={(v) =>
                                    updateTask(tb.id, ti, 'supervisor', v)
                                  }
                                  placeholder="Supervisor initials"
                                  style={{ fontSize: 11, padding: '3px 7px' }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─ TRAINING HISTORY ─ */}
          {tab === 'training' && (
            <div>
              <div
                style={{
                  marginBottom: 14,
                  padding: '12px 14px',
                  background: B.tealLight,
                  border: `1px solid ${B.tealBorder}`,
                  borderRadius: 8,
                  fontSize: 12,
                  color: B.tealDark,
                }}
              >
                Training records for this employee appear in the Training
                Manager module. This tab shows a summary pulled from those
                records.
              </div>
              {(() => {
                const empTraining = (data?.training || []).filter(
                  (t) =>
                    t.person &&
                    emp.name &&
                    t.person.toLowerCase() === emp.name.toLowerCase()
                );
                if (empTraining.length === 0)
                  return (
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: 8,
                        padding: '24px',
                        textAlign: 'center',
                        color: B.faint,
                        fontSize: 13,
                      }}
                    >
                      No training records found for{' '}
                      {emp.name || 'this employee'}. Add records in the Training
                      Manager.
                    </div>
                  );
                return (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    {empTraining.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                          padding: '9px 12px',
                          background: B.card,
                          border: `1px solid ${B.border}`,
                          borderRadius: 8,
                        }}
                      >
                        <span style={{ fontSize: 13 }}>📋</span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: B.text,
                            }}
                          >
                            {t.type}
                          </div>
                          <div style={{ fontSize: 11, color: B.faint }}>
                            {fmtDate(t.date)}
                            {t.hours ? ` · ${t.hours}h` : ''}
                            {t.cert ? ` · Cert #${t.cert}` : ''}
                          </div>
                        </div>
                        <Tag
                          label="Complete"
                          color={B.green}
                          bg={B.greenLight}
                          border={B.greenBorder}
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function EmployeesView({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    name: '',
    title: '',
    department: '',
    email: '',
    status: 'active',
  });

  const employees = data.employees || [];
  const create = () => {
    if (!form.name) return;
    const emp = {
      ...form,
      id: uid(),
      credentials: [],
      taskBooks: [],
      docs: [],
      addedAt: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      employees: [...(prev.employees || []), emp],
    }));
    setForm({
      name: '',
      title: '',
      department: '',
      email: '',
      status: 'active',
    });
    setShowForm(false);
    setSelectedId(emp.id);
  };
  const updateEmp = (id, updated) =>
    setData((prev) => ({
      ...prev,
      employees: (prev.employees || []).map((e) => (e.id === id ? updated : e)),
    }));
  const removeEmp = (id) => {
    setData((prev) => ({
      ...prev,
      employees: (prev.employees || []).filter((e) => e.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
  };

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        !search ||
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.title?.toLowerCase().includes(search.toLowerCase()) ||
        emp.department?.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'all' ||
        emp.status === filter ||
        (filter === 'expiring' &&
          (emp.credentials || []).some((c) => {
            const d = daysUntil(c.expires);
            return d !== null && d < 60;
          }));
      return matchSearch && matchFilter;
    });
  }, [employees, search, filter]);

  const sel = selectedId ? employees.find((e) => e.id === selectedId) : null;
  const totalCerts = employees.reduce(
    (a, e) => a + (e.credentials || []).length,
    0
  );
  const expiring = employees.reduce(
    (a, e) =>
      a +
      (e.credentials || []).filter((c) => {
        const d = daysUntil(c.expires);
        return d !== null && d < 60;
      }).length,
    0
  );

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            Employees & Credentials
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            {employees.length} personnel · {totalCerts} credentials ·{' '}
            {expiring > 0 ? (
              <span style={{ color: B.red, fontWeight: 600 }}>
                {expiring} expiring
              </span>
            ) : (
              'all current'
            )}
          </p>
        </div>
        <Btn label="+ Add Employee" onClick={() => setShowForm(true)} primary />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: 'Total Personnel',
            val: employees.length,
            color: B.indigo,
            icon: '👥',
          },
          {
            label: 'Certifications Tracked',
            val: totalCerts,
            color: B.teal,
            icon: '🎓',
          },
          {
            label: 'Expiring / Expired',
            val: expiring,
            color: expiring > 0 ? B.red : B.green,
            icon: expiring > 0 ? '⚠' : '✓',
          },
        ].map((s) => (
          <Card key={s.label} style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>
              {s.val}
            </div>
            <div style={{ fontSize: 12, color: B.muted, marginTop: 4 }}>
              {s.label}
            </div>
          </Card>
        ))}
      </div>
      <div
        style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: B.faint,
              fontSize: 13,
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <FInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, title, department…"
            style={{ paddingLeft: 30 }}
          />
        </div>
        {[
          ['all', 'All'],
          ['active', 'Active'],
          ['volunteer', 'Volunteer'],
          ['expiring', 'Expiring Creds'],
        ].map(([f, lbl]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 12px',
              borderRadius: 7,
              border: `1px solid ${
                filter === f ? (f === 'expiring' ? B.red : B.indigo) : B.border
              }`,
              background:
                filter === f
                  ? f === 'expiring'
                    ? B.redLight
                    : B.indigoLight
                  : B.card,
              color:
                filter === f ? (f === 'expiring' ? B.red : B.indigo) : B.muted,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
      {showForm && (
        <div
          style={{
            background: B.indigoLight,
            border: `1px solid ${B.indigoBorder}`,
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: B.text,
              marginBottom: 12,
            }}
          >
            Add Employee
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Full Name</Label>
              <FInput
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Job Title</Label>
              <FInput
                value={form.title}
                onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                placeholder="Emergency Manager"
              />
            </div>
            <div>
              <Label>Department</Label>
              <FInput
                value={form.department}
                onChange={(v) => setForm((p) => ({ ...p, department: v }))}
                placeholder="Office of Emergency Services"
              />
            </div>
            <div>
              <Label>Email</Label>
              <FInput
                type="email"
                value={form.email}
                onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                placeholder="email@agency.gov"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Add Employee" onClick={create} primary />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '36px', color: B.faint }}>
          No employees found
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {filtered.map((emp) => {
            const certCount = (emp.credentials || []).length;
            const tbCount = (emp.taskBooks || []).length;
            const certExpiring = (emp.credentials || []).filter((c) => {
              const d = daysUntil(c.expires);
              return d !== null && d < 60;
            }).length;
            const completedTBs = (emp.taskBooks || []).filter(
              (tb) => tb.status === 'certified'
            ).length;
            return (
              <div
                key={emp.id}
                style={{
                  background: B.card,
                  border: `1px solid ${
                    certExpiring > 0 ? B.redBorder : B.border
                  }`,
                  borderRadius: 9,
                  padding: '13px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onClick={() => setSelectedId(emp.id)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = B.indigo)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor =
                    certExpiring > 0 ? B.redBorder : B.border)
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: `${B.indigo}15`,
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 800,
                      color: B.indigo,
                      flexShrink: 0,
                    }}
                  >
                    {(emp.name || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: B.text,
                        marginBottom: 2,
                      }}
                    >
                      {emp.name}
                    </div>
                    <div style={{ fontSize: 11, color: B.faint }}>
                      {emp.title || ''}
                      {emp.title && emp.department ? ' · ' : ''}
                      {emp.department || ''}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                      flexShrink: 0,
                      flexWrap: 'wrap',
                    }}
                  >
                    {certCount > 0 && (
                      <Tag
                        label={`🎓 ${certCount} cert${
                          certCount > 1 ? 's' : ''
                        }`}
                        color={B.indigo}
                        bg={B.indigoLight}
                        border={B.indigoBorder}
                      />
                    )}
                    {tbCount > 0 && (
                      <Tag
                        label={`📋 ${tbCount} task book${
                          tbCount > 1 ? 's' : ''
                        }`}
                        color={B.amber}
                        bg={B.amberLight}
                        border={B.amberBorder}
                      />
                    )}
                    {completedTBs > 0 && (
                      <Tag
                        label={`✓ ${completedTBs} certified`}
                        color={B.green}
                        bg={B.greenLight}
                        border={B.greenBorder}
                      />
                    )}
                    {certExpiring > 0 && (
                      <Tag
                        label={`⚠ ${certExpiring} expiring`}
                        color={B.red}
                        bg={B.redLight}
                        border={B.redBorder}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 10,
                        color: B.faint,
                        background: '#f4f7f8',
                        padding: '2px 7px',
                        borderRadius: 8,
                        border: `1px solid ${B.border}`,
                        textTransform: 'capitalize',
                      }}
                    >
                      {emp.status || 'active'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEmp(emp.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: '4px',
                    }}
                  >
                    ×
                  </button>
                  <span style={{ color: B.border, fontSize: 14 }}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {sel && (
        <EmployeeDetail
          emp={sel}
          onUpdate={(updated) => updateEmp(sel.id, updated)}
          onClose={() => setSelectedId(null)}
          data={data}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TRAINING MANAGER (with attachments)
═══════════════════════════════════════════════════════ */
function TrainingManager({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    person: '',
    type: '',
    date: today(),
    hours: '',
    cert: '',
    notes: '',
  });
  const [aiContent, setAiContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const TYPES = [
    'ICS-100',
    'ICS-200',
    'ICS-300',
    'ICS-400',
    'IS-700',
    'IS-800',
    'NIMS Awareness',
    'HSEEP',
    'COOP Awareness',
    'Public Information',
    'Damage Assessment',
    'ESF Training',
    'Annual Refresher',
    'Tabletop Exercise',
    'Full-scale Exercise',
    'Other',
  ];
  const save = () => {
    if (!form.person || !form.type) return;
    setData((prev) => ({
      ...prev,
      training: [
        ...prev.training,
        { ...form, id: uid(), docs: [], addedAt: Date.now() },
      ],
    }));
    setForm({
      person: '',
      type: '',
      date: today(),
      hours: '',
      cert: '',
      notes: '',
    });
    setShowForm(false);
  };
  const remove = (id) =>
    setData((prev) => ({
      ...prev,
      training: prev.training.filter((t) => t.id !== id),
    }));
  const updateRec = (id, field, val) =>
    setData((prev) => ({
      ...prev,
      training: prev.training.map((t) =>
        t.id === id ? { ...t, [field]: val } : t
      ),
    }));
  const runAi = async () => {
    setAiLoading(true);
    setAiContent('');
    const s =
      data.training.length > 0
        ? data.training
            .slice(-10)
            .map((t) => `${t.person} · ${t.type} · ${t.date}`)
            .join('\n')
        : 'None yet.';
    try {
      await callAI(
        SYS,
        `Training records:\n${s}\n\nAnalyze gaps vs EMAP 4.10. Recommend priorities for next 6 months.`,
        (chunk) => setAiContent((p) => p + chunk)
      );
    } catch {
      setAiContent('Error.');
    }
    setAiLoading(false);
  };
  const filtered = data.training.filter(
    (t) =>
      !search ||
      t.person.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ padding: '28px 32px', maxWidth: 980 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            Training Manager
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP 4.10 · {data.training.length} records ·{' '}
            {[...new Set(data.training.map((t) => t.person))].length} personnel
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn
            label="AI Needs Assessment"
            icon="✦"
            onClick={runAi}
            loading={aiLoading}
          />
          <Btn label="+ Add Record" onClick={() => setShowForm(true)} primary />
        </div>
      </div>
      <div
        style={{
          background: B.tealLight,
          border: `1px solid ${B.tealBorder}`,
          borderLeft: `3px solid ${B.teal}`,
          borderRadius: '0 8px 8px 0',
          padding: '9px 14px',
          marginBottom: 14,
          fontSize: 12,
          color: B.tealDark,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <BrainIcon size={12} color={B.teal} strokeWidth={1.5} />
        Training records auto-update <strong>EMAP 4.10</strong> compliance
        evidence.
      </div>
      <AiBlock
        content={aiContent}
        loading={aiLoading}
        label="Training Needs Assessment"
      />
      {showForm && (
        <div
          style={{
            background: B.tealLight,
            border: `1px solid ${B.tealBorder}`,
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 14,
            marginTop: aiContent ? 10 : 0,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: B.text,
              marginBottom: 12,
            }}
          >
            Add Training Record
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Personnel Name</Label>
              <FInput
                value={form.person}
                onChange={(v) => setForm((p) => ({ ...p, person: v }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Training Type</Label>
              <FSel
                value={form.type}
                onChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                <option value="">Select…</option>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </FSel>
            </div>
            <div>
              <Label>Date Completed</Label>
              <FInput
                type="date"
                value={form.date}
                onChange={(v) => setForm((p) => ({ ...p, date: v }))}
              />
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Hours</Label>
              <FInput
                value={form.hours}
                onChange={(v) => setForm((p) => ({ ...p, hours: v }))}
                placeholder="8"
              />
            </div>
            <div>
              <Label>Certificate / Record #</Label>
              <FInput
                value={form.cert}
                onChange={(v) => setForm((p) => ({ ...p, cert: v }))}
                placeholder="Certificate number"
              />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <Label>Notes</Label>
            <FInput
              value={form.notes}
              onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
              placeholder="Additional notes…"
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Save Record" onClick={save} primary />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      <div style={{ marginBottom: 12, marginTop: 4 }}>
        <FInput
          value={search}
          onChange={setSearch}
          placeholder="Search personnel or training type…"
        />
      </div>
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '32px', color: B.faint }}>
          No training records yet
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((t, i) => (
            <div
              key={t.id}
              style={{
                background: B.card,
                border: `1px solid ${B.border}`,
                borderRadius: 9,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: B.text }}>
                    {t.person}{' '}
                    <span style={{ color: B.faint, fontWeight: 400 }}>·</span>{' '}
                    <span style={{ color: B.muted }}>{t.type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: B.faint, marginTop: 2 }}>
                    {fmtDate(t.date)}
                    {t.hours ? ` · ${t.hours}h` : ''}
                    {t.cert ? ` · #${t.cert}` : ''}
                    {(t.docs || []).length > 0
                      ? ` · 📎 ${t.docs.length} file${
                          t.docs.length > 1 ? 's' : ''
                        }`
                      : ''}
                  </div>
                </div>
                <Tag
                  label="Complete"
                  color={B.green}
                  bg={B.greenLight}
                  border={B.greenBorder}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(t.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d1d5db',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  ×
                </button>
                <span
                  style={{
                    color: B.faint,
                    fontSize: 10,
                    transform:
                      expandedId === t.id ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}
                >
                  ▼
                </span>
              </div>
              {expandedId === t.id && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderTop: `1px solid #f4f7f8`,
                    background: '#fafcfc',
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <Label>Notes</Label>
                    <FTextarea
                      value={t.notes || ''}
                      onChange={(v) => updateRec(t.id, 'notes', v)}
                      placeholder="Notes…"
                      rows={2}
                    />
                  </div>
                  <Attachments
                    docs={t.docs || []}
                    onAdd={(doc) =>
                      updateRec(t.id, 'docs', [...(t.docs || []), doc])
                    }
                    onRemove={(id) =>
                      updateRec(
                        t.id,
                        'docs',
                        (t.docs || []).filter((d) => d.id !== id)
                      )
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PARTNERS (with attachments)
═══════════════════════════════════════════════════════ */
function PartnerRegistry({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'County Agency',
    contact: '',
    phone: '',
    email: '',
    agreementType: 'MOU',
    signed: today(),
    expires: '',
    notes: '',
  });
  const [filter, setFilter] = useState('all');
  const TYPES = [
    'County Agency',
    'Municipal Agency',
    'State Agency',
    'Federal Agency',
    'Neighboring Jurisdiction',
    'Non-Profit / Volunteer',
    'Private Sector',
    'Healthcare',
    'Utility',
    'Other',
  ];
  const AGR = ['MOU', 'MAA', 'ISA', 'Contract', 'LOA', 'IGA', 'EMAC', 'Other'];
  const save = () => {
    if (!form.name) return;
    setData((prev) => ({
      ...prev,
      partners: [
        ...prev.partners,
        { ...form, id: uid(), docs: [], addedAt: Date.now() },
      ],
    }));
    setForm({
      name: '',
      type: 'County Agency',
      contact: '',
      phone: '',
      email: '',
      agreementType: 'MOU',
      signed: today(),
      expires: '',
      notes: '',
    });
    setShowForm(false);
  };
  const remove = (id) =>
    setData((prev) => ({
      ...prev,
      partners: prev.partners.filter((p) => p.id !== id),
    }));
  const updatePartner = (id, field, val) =>
    setData((prev) => ({
      ...prev,
      partners: prev.partners.map((p) =>
        p.id === id ? { ...p, [field]: val } : p
      ),
    }));
  const expiring = data.partners.filter((p) => {
    const d = daysUntil(p.expires);
    return d !== null && d >= 0 && d < 90;
  }).length;
  const expired = data.partners.filter((p) => {
    const d = daysUntil(p.expires);
    return d !== null && d < 0;
  }).length;
  const filtered = useMemo(() => {
    if (filter === 'expiring')
      return data.partners.filter((p) => {
        const d = daysUntil(p.expires);
        return d !== null && d >= 0 && d < 90;
      });
    if (filter === 'expired')
      return data.partners.filter((p) => {
        const d = daysUntil(p.expires);
        return d !== null && d < 0;
      });
    return data.partners;
  }, [data.partners, filter]);
  return (
    <div style={{ padding: '28px 32px', maxWidth: 960 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            Partner & Agreement Registry
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP 4.7 · {data.partners.length} agreements
          </p>
        </div>
        <Btn label="+ Add Partner" onClick={() => setShowForm(true)} primary />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          ['all', `All (${data.partners.length})`],
          ['expiring', `Expiring Soon (${expiring})`],
          ['expired', `Expired (${expired})`],
        ].map(([f, lbl]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 12px',
              borderRadius: 7,
              border: `1px solid ${
                filter === f
                  ? f === 'all'
                    ? B.teal
                    : f === 'expiring'
                    ? B.amber
                    : B.red
                  : B.border
              }`,
              background:
                filter === f
                  ? f === 'all'
                    ? B.tealLight
                    : f === 'expiring'
                    ? B.amberLight
                    : B.redLight
                  : B.card,
              color:
                filter === f
                  ? f === 'all'
                    ? B.tealDark
                    : f === 'expiring'
                    ? '#92400e'
                    : B.red
                  : B.muted,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
      {showForm && (
        <div
          style={{
            background: B.blueLight,
            border: `1px solid ${B.blueBorder}`,
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: B.text,
              marginBottom: 12,
            }}
          >
            Add Partner
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Organization Name</Label>
              <FInput
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Partner organization"
              />
            </div>
            <div>
              <Label>Type</Label>
              <FSel
                value={form.type}
                onChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </FSel>
            </div>
            <div>
              <Label>Agreement Type</Label>
              <FSel
                value={form.agreementType}
                onChange={(v) => setForm((p) => ({ ...p, agreementType: v }))}
              >
                {AGR.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </FSel>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Contact</Label>
              <FInput
                value={form.contact}
                onChange={(v) => setForm((p) => ({ ...p, contact: v }))}
                placeholder="Name"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <FInput
                value={form.phone}
                onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                placeholder="Phone"
              />
            </div>
            <div>
              <Label>Signed</Label>
              <FInput
                type="date"
                value={form.signed}
                onChange={(v) => setForm((p) => ({ ...p, signed: v }))}
              />
            </div>
            <div>
              <Label>Expires</Label>
              <FInput
                type="date"
                value={form.expires}
                onChange={(v) => setForm((p) => ({ ...p, expires: v }))}
              />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <Label>Notes</Label>
            <FInput
              value={form.notes}
              onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
              placeholder="Scope, capabilities…"
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Save" onClick={save} primary />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '32px', color: B.faint }}>
          No partner agreements yet
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {filtered.map((p) => {
            const days = daysUntil(p.expires);
            const urgColor =
              days === null
                ? B.green
                : days < 0
                ? B.red
                : days < 30
                ? B.red
                : days < 90
                ? B.amber
                : B.green;
            return (
              <div
                key={p.id}
                style={{
                  background: B.card,
                  border: `1px solid ${
                    days !== null && days < 90 ? B.amberBorder : B.border
                  }`,
                  borderRadius: 9,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '13px 16px',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setExpandedId(expandedId === p.id ? null : p.id)
                  }
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      background: B.blueLight,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      color: B.blue,
                      flexShrink: 0,
                    }}
                  >
                    ⊕
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 7,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{ fontSize: 13, fontWeight: 700, color: B.text }}
                      >
                        {p.name}
                      </span>
                      <Tag
                        label={p.agreementType}
                        color={B.blue}
                        bg={B.blueLight}
                        border={B.blueBorder}
                      />
                      <Tag
                        label={p.type}
                        color={B.muted}
                        bg="#f8fafc"
                        border={B.border}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        fontSize: 11,
                        color: B.faint,
                        flexWrap: 'wrap',
                      }}
                    >
                      {p.contact && <span>👤 {p.contact}</span>}
                      <span>Signed: {fmtDate(p.signed)}</span>
                      {p.expires && (
                        <span
                          style={{
                            color: urgColor,
                            fontWeight: days !== null && days < 90 ? 700 : 400,
                          }}
                        >
                          Expires: {fmtDate(p.expires)}
                          {days !== null && days < 90
                            ? ` (${days < 0 ? 'EXPIRED' : `${days}d`})`
                            : ''}
                        </span>
                      )}
                      {(p.docs || []).length > 0 && (
                        <span>
                          📎 {p.docs.length} file{p.docs.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(p.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    ×
                  </button>
                  <span
                    style={{
                      color: B.faint,
                      fontSize: 10,
                      transform:
                        expandedId === p.id ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    ▼
                  </span>
                </div>
                {expandedId === p.id && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderTop: `1px solid #f4f7f8`,
                      background: '#fafcfc',
                    }}
                  >
                    <div style={{ marginBottom: 10 }}>
                      <Label>Notes / Scope</Label>
                      <FTextarea
                        value={p.notes || ''}
                        onChange={(v) => updatePartner(p.id, 'notes', v)}
                        rows={2}
                        placeholder="Scope of agreement, capabilities…"
                      />
                    </div>
                    <Attachments
                      docs={p.docs || []}
                      onAdd={(doc) =>
                        updatePartner(p.id, 'docs', [...(p.docs || []), doc])
                      }
                      onRemove={(id) =>
                        updatePartner(
                          p.id,
                          'docs',
                          (p.docs || []).filter((d) => d.id !== id)
                        )
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PLAN LIBRARY (with attachments)
═══════════════════════════════════════════════════════ */
function PlanLibrary({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'EOP',
    version: '1.0',
    lastReview: today(),
    nextReview: '',
    owner: '',
    status: 'current',
  });
  const PLAN_TYPES = [
    'EOP',
    'COOP',
    'COG Plan',
    'Hazard Mitigation Plan',
    'Recovery Plan',
    'Communications Plan',
    'Evacuation Plan',
    'Annex',
    'Other',
  ];
  const EMAP_REFS = {
    EOP: '4.5',
    COOP: '4.4',
    'COG Plan': '4.4',
    'Hazard Mitigation Plan': '4.2',
    'Recovery Plan': '4.5',
    'Communications Plan': '4.8',
  };
  const STATUS_OPTS = [
    { v: 'current', l: 'Current', c: B.green },
    { v: 'review-due', l: 'Review Due', c: B.amber },
    { v: 'draft', l: 'Draft', c: B.blue },
    { v: 'superseded', l: 'Superseded', c: B.faint },
  ];
  const save = () => {
    if (!form.name) return;
    setData((prev) => ({
      ...prev,
      plans: [
        ...prev.plans,
        {
          ...form,
          id: uid(),
          docs: [],
          emapRef: EMAP_REFS[form.type] || '4.5',
          addedAt: Date.now(),
        },
      ],
    }));
    setForm({
      name: '',
      type: 'EOP',
      version: '1.0',
      lastReview: today(),
      nextReview: '',
      owner: '',
      status: 'current',
    });
    setShowForm(false);
  };
  const update = (id, f, v) =>
    setData((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === id ? { ...p, [f]: v } : p)),
    }));
  const remove = (id) =>
    setData((prev) => ({
      ...prev,
      plans: prev.plans.filter((p) => p.id !== id),
    }));
  return (
    <div style={{ padding: '28px 32px', maxWidth: 940 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            Plan Library
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP 4.4, 4.5, 4.8 · {data.plans.length} plans ·{' '}
            {data.plans.filter((p) => p.status === 'current').length} current
          </p>
        </div>
        <Btn label="+ Add Plan" onClick={() => setShowForm(true)} primary />
      </div>
      {showForm && (
        <div
          style={{
            background: B.greenLight,
            border: `1px solid ${B.greenBorder}`,
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: B.text,
              marginBottom: 12,
            }}
          >
            Add Plan
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Plan Name</Label>
              <FInput
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="County Emergency Operations Plan"
              />
            </div>
            <div>
              <Label>Type</Label>
              <FSel
                value={form.type}
                onChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                {PLAN_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </FSel>
            </div>
            <div>
              <Label>Version</Label>
              <FInput
                value={form.version}
                onChange={(v) => setForm((p) => ({ ...p, version: v }))}
                placeholder="1.0"
              />
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Last Reviewed</Label>
              <FInput
                type="date"
                value={form.lastReview}
                onChange={(v) => setForm((p) => ({ ...p, lastReview: v }))}
              />
            </div>
            <div>
              <Label>Next Review Due</Label>
              <FInput
                type="date"
                value={form.nextReview}
                onChange={(v) => setForm((p) => ({ ...p, nextReview: v }))}
              />
            </div>
            <div>
              <Label>Owner</Label>
              <FInput
                value={form.owner}
                onChange={(v) => setForm((p) => ({ ...p, owner: v }))}
                placeholder="Role or name"
              />
            </div>
            <div>
              <Label>Status</Label>
              <FSel
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                {STATUS_OPTS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.l}
                  </option>
                ))}
              </FSel>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Save" onClick={save} primary />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      {data.plans.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '32px', color: B.faint }}>
          No plans yet
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {data.plans.map((plan) => {
            const sc =
              STATUS_OPTS.find((s) => s.v === plan.status) || STATUS_OPTS[0];
            const rd = daysUntil(plan.nextReview);
            const rc =
              rd === null
                ? B.green
                : rd < 0
                ? B.red
                : rd < 30
                ? B.red
                : rd < 60
                ? B.amber
                : B.green;
            return (
              <div
                key={plan.id}
                style={{
                  background: B.card,
                  border: `1px solid ${B.border}`,
                  borderRadius: 9,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '13px 16px',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setExpandedId(expandedId === plan.id ? null : plan.id)
                  }
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      background: B.greenLight,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      color: B.green,
                      flexShrink: 0,
                    }}
                  >
                    ◈
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 7,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{ fontSize: 13, fontWeight: 700, color: B.text }}
                      >
                        {plan.name}
                      </span>
                      <Tag
                        label={`v${plan.version}`}
                        color={B.faint}
                        bg="#f8fafc"
                        border={B.border}
                      />
                      <Tag
                        label={plan.type}
                        color={B.green}
                        bg={B.greenLight}
                        border={B.greenBorder}
                      />
                      {plan.emapRef && (
                        <Tag
                          label={`EMAP ${plan.emapRef}`}
                          color={B.tealDark}
                          bg={B.tealLight}
                          border={B.tealBorder}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        fontSize: 11,
                        color: B.faint,
                        flexWrap: 'wrap',
                      }}
                    >
                      {plan.owner && <span>👤 {plan.owner}</span>}
                      <span>Reviewed: {fmtDate(plan.lastReview)}</span>
                      {plan.nextReview && (
                        <span
                          style={{
                            color: rc,
                            fontWeight: rd !== null && rd < 60 ? 700 : 400,
                          }}
                        >
                          Next: {fmtDate(plan.nextReview)}
                          {rd !== null && rd < 60
                            ? ` (${rd < 0 ? 'OVERDUE' : `${rd}d`})`
                            : ''}
                        </span>
                      )}
                      {(plan.docs || []).length > 0 && (
                        <span>
                          📎 {plan.docs.length} file
                          {plan.docs.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <FSel
                    value={plan.status}
                    onChange={(v) => update(plan.id, 'status', v)}
                    style={{ width: 130 }}
                  >
                    {STATUS_OPTS.map((s) => (
                      <option key={s.v} value={s.v}>
                        {s.l}
                      </option>
                    ))}
                  </FSel>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(plan.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    ×
                  </button>
                  <span
                    style={{
                      color: B.faint,
                      fontSize: 10,
                      transform:
                        expandedId === plan.id ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    ▼
                  </span>
                </div>
                {expandedId === plan.id && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderTop: `1px solid #f4f7f8`,
                      background: '#fafcfc',
                    }}
                  >
                    <Attachments
                      docs={plan.docs || []}
                      onAdd={(doc) =>
                        update(plan.id, 'docs', [...(plan.docs || []), doc])
                      }
                      onRemove={(id) =>
                        update(
                          plan.id,
                          'docs',
                          (plan.docs || []).filter((d) => d.id !== id)
                        )
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RESOURCES (with attachments)
═══════════════════════════════════════════════════════ */
function ResourcesView({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Equipment',
    qty: '',
    location: '',
    condition: 'Good',
  });
  const CATS = [
    'Equipment',
    'Vehicles',
    'Communications',
    'Generators',
    'Personnel',
    'Supplies',
    'Facilities',
    'Technology',
    'Other',
  ];
  const CONDS = ['Excellent', 'Good', 'Fair', 'Needs Repair', 'Out of Service'];
  const save = () => {
    if (!form.name) return;
    setData((prev) => ({
      ...prev,
      resources: [
        ...prev.resources,
        { ...form, id: uid(), docs: [], addedAt: Date.now() },
      ],
    }));
    setForm({
      name: '',
      category: 'Equipment',
      qty: '',
      location: '',
      condition: 'Good',
    });
    setShowForm(false);
  };
  const remove = (id) =>
    setData((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== id),
    }));
  const updateRes = (id, f, v) =>
    setData((prev) => ({
      ...prev,
      resources: prev.resources.map((r) =>
        r.id === id ? { ...r, [f]: v } : r
      ),
    }));
  const cc = (c) =>
    c === 'Excellent' || c === 'Good'
      ? B.green
      : c === 'Fair'
      ? B.amber
      : B.red;
  return (
    <div style={{ padding: '28px 32px', maxWidth: 960 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            Resource Inventory
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP 4.7 · {data.resources.length} items
          </p>
        </div>
        <Btn label="+ Add Resource" onClick={() => setShowForm(true)} primary />
      </div>
      {showForm && (
        <div
          style={{
            background: B.amberLight,
            border: `1px solid ${B.amberBorder}`,
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Name</Label>
              <FInput
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Resource name"
              />
            </div>
            <div>
              <Label>Category</Label>
              <FSel
                value={form.category}
                onChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </FSel>
            </div>
            <div>
              <Label>Qty</Label>
              <FInput
                value={form.qty}
                onChange={(v) => setForm((p) => ({ ...p, qty: v }))}
                placeholder="Qty"
              />
            </div>
            <div>
              <Label>Location</Label>
              <FInput
                value={form.location}
                onChange={(v) => setForm((p) => ({ ...p, location: v }))}
                placeholder="Location"
              />
            </div>
            <div>
              <Label>Condition</Label>
              <FSel
                value={form.condition}
                onChange={(v) => setForm((p) => ({ ...p, condition: v }))}
              >
                {CONDS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </FSel>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Save" onClick={save} primary small />
            <Btn label="Cancel" onClick={() => setShowForm(false)} small />
          </div>
        </div>
      )}
      {data.resources.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '32px', color: B.faint }}>
          No resources tracked yet
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  background: '#f8fcfc',
                  borderBottom: `1px solid ${B.border}`,
                }}
              >
                {[
                  'Resource',
                  'Category',
                  'Qty',
                  'Location',
                  'Condition',
                  'Attachments',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '9px 13px',
                      fontSize: 10,
                      color: B.faint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: 700,
                      textAlign: 'left',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.resources.map((r, i) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: `1px solid #f4f8f9`,
                    background: i % 2 === 0 ? '#fff' : '#fafcfc',
                  }}
                >
                  <td
                    style={{
                      padding: '9px 13px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: B.text,
                    }}
                  >
                    {r.name}
                  </td>
                  <td
                    style={{
                      padding: '9px 13px',
                      fontSize: 12,
                      color: B.muted,
                    }}
                  >
                    {r.category}
                  </td>
                  <td
                    style={{
                      padding: '9px 13px',
                      fontSize: 12,
                      color: B.muted,
                    }}
                  >
                    {r.qty || '—'}
                  </td>
                  <td
                    style={{
                      padding: '9px 13px',
                      fontSize: 12,
                      color: B.muted,
                    }}
                  >
                    {r.location || '—'}
                  </td>
                  <td style={{ padding: '9px 13px' }}>
                    <Tag
                      label={r.condition}
                      color={cc(r.condition)}
                      bg={
                        cc(r.condition) === B.green
                          ? B.greenLight
                          : cc(r.condition) === B.amber
                          ? B.amberLight
                          : B.redLight
                      }
                      border={B.border}
                    />
                  </td>
                  <td style={{ padding: '9px 13px' }}>
                    <Attachments
                      docs={r.docs || []}
                      onAdd={(doc) =>
                        updateRes(r.id, 'docs', [...(r.docs || []), doc])
                      }
                      onRemove={(id) =>
                        updateRes(
                          r.id,
                          'docs',
                          (r.docs || []).filter((d) => d.id !== id)
                        )
                      }
                      compact
                    />
                  </td>
                  <td style={{ padding: '9px 13px' }}>
                    <button
                      onClick={() => remove(r.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════ */
function Sidebar({ view, setView, data, notifCount, orgName, onEditOrg }) {
  const nav = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
        { id: 'calendar', icon: '⊟', label: 'Program Calendar' },
        { id: 'activity', icon: '◎', label: 'Activity Log' },
      ],
    },
    {
      group: 'Accreditation',
      items: [
        { id: 'accreditation', icon: '★', label: 'EMAP Standards' },
        { id: 'journey', icon: '◎', label: 'Accreditation Journey' },
        { id: 'intake', icon: '⊙', label: 'Bulk Doc Intake', highlight: true },
        { id: 'package', icon: '◧', label: 'Package Builder', highlight: true },
        { id: 'thira', icon: '◈', label: 'THIRA/SPR' },
        { id: 'cap', icon: '⚠', label: 'Corrective Actions' },
        { id: 'reports', icon: '◧', label: 'Reports' },
      ],
    },
    {
      group: 'Program Ops',
      items: [
        { id: 'training', icon: '◉', label: 'Training' },
        { id: 'exercises', icon: '◎', label: 'Exercises & AARs' },
        { id: 'plans', icon: '◈', label: 'Plan Library' },
        { id: 'partners', icon: '⊕', label: 'Partners & MOUs' },
        { id: 'resources', icon: '⊗', label: 'Resources' },
        { id: 'employees', icon: '◈', label: 'Employees' },
        { id: 'grants', icon: '$', label: 'Grant Tracker' },
      ],
    },
    {
      group: 'AI',
      items: [{ id: 'assistant', icon: null, label: 'AI Assistant', ai: true }],
    },
    {
      group: 'Config',
      items: [{ id: 'settings', icon: '◧', label: 'Settings' }],
    },
  ];
  const counts = {
    training: data.training.length,
    exercises: data.exercises.length,
    partners: data.partners.length,
    plans: data.plans.length,
    employees: (data.employees || []).length,
    grants: (data.grants || []).length,
    cap:
      (data.capItems || []).filter((c) => !c.closed).length +
      (data.exercises || []).reduce(
        (a, e) => a + (e.corrective || []).filter((c) => !c.closed).length,
        0
      ),
    thira: (data.thira?.hazards || []).length,
    activity: (data.activityLog || []).length > 0 ? null : 0,
  };
  const overall = useMemo(
    () => overallStats(data.standards || {}),
    [data.standards]
  );
  return (
    <aside
      style={{
        width: 244,
        background: B.sidebar,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 40,
      }}
    >
      <div
        style={{
          padding: '20px 18px 16px',
          borderBottom: `1px solid ${B.sidebarBorder}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              background: B.sidebarMid,
              borderRadius: 10,
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${B.sidebarBorder}`,
              flexShrink: 0,
            }}
          >
            <BrainIcon size={22} color={B.teal} strokeWidth={1.3} />
          </div>
          <Wordmark dark size="sm" />
          {notifCount > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                background: B.red,
                color: '#fff',
                borderRadius: 10,
                fontSize: 9,
                padding: '2px 5px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {notifCount}
            </span>
          )}
        </div>
        <div
          onClick={onEditOrg}
          style={{
            background: B.sidebarMid,
            borderRadius: 8,
            padding: '10px 12px',
            cursor: 'pointer',
            border: `1px solid ${B.sidebarBorder}`,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: 6,
            }}
          >
            {orgName || 'My Organization'}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: B.sidebarMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              EMAP Compliance
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color:
                  overall.pct > 79
                    ? B.green
                    : overall.pct > 49
                    ? B.teal
                    : B.amber,
              }}
            >
              {overall.pct}%
            </span>
          </div>
          <div style={{ height: 3, background: '#2E3439', borderRadius: 2 }}>
            <div
              style={{
                height: '100%',
                width: `${overall.pct}%`,
                background: `linear-gradient(90deg,${B.teal},${B.tealDark})`,
                borderRadius: 2,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 9, color: '#34d399' }}>
              ✓{overall.compliant}
            </span>
            <span style={{ fontSize: 9, color: '#fbbf24' }}>
              ◑{overall.in_progress}
            </span>
            <span style={{ fontSize: 9, color: '#f87171' }}>
              !{overall.needs_review}
            </span>
            <span style={{ fontSize: 9, color: B.sidebarBorder }}>
              ○{overall.not_started}
            </span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {nav.map((g) => (
          <div key={g.group}>
            <div
              style={{
                padding: '8px 18px 3px',
                fontSize: 9,
                color: B.sidebarBorder,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              {g.group}
            </div>
            {g.items.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: 'calc(100% - 12px)',
                  margin: '1px 6px',
                  padding: '7px 10px',
                  borderRadius: 7,
                  background:
                    view === item.id ? 'rgba(27,201,196,0.12)' : 'none',
                  border: `1px solid ${
                    view === item.id ? 'rgba(27,201,196,0.3)' : 'tranSPRent'
                  }`,
                  color:
                    view === item.id
                      ? B.teal
                      : item.ai
                      ? B.teal
                      : B.sidebarMuted,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: "'DM Sans',sans-serif",
                  textAlign: 'left',
                  transition: 'all 0.12s',
                }}
              >
                {item.ai ? (
                  <BrainIcon
                    size={13}
                    color={view === item.id ? B.teal : '#6A8090'}
                    strokeWidth={1.2}
                  />
                ) : (
                  <span style={{ fontSize: 11, opacity: 0.8 }}>
                    {item.icon}
                  </span>
                )}
                {item.label}
                {counts[item.id] > 0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      background:
                        view === item.id ? 'rgba(27,201,196,0.2)' : '#2E3439',
                      color: view === item.id ? B.teal : B.sidebarMuted,
                      borderRadius: 8,
                      fontSize: 9,
                      padding: '1px 5px',
                      fontWeight: 700,
                    }}
                  >
                    {counts[item.id]}
                  </span>
                )}
                {item.highlight && !counts[item.id] && view !== item.id && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 9,
                      color: B.amber,
                      background: 'rgba(245,158,11,0.12)',
                      padding: '1px 5px',
                      borderRadius: 5,
                      border: '1px solid rgba(245,158,11,0.2)',
                      fontWeight: 700,
                    }}
                  >
                    NEW
                  </span>
                )}
                {item.ai && view !== item.id && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 9,
                      color: B.teal,
                      background: 'rgba(27,201,196,0.1)',
                      padding: '1px 5px',
                      borderRadius: 5,
                      border: `1px solid rgba(27,201,196,0.2)`,
                    }}
                  >
                    AI
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          padding: '10px 18px',
          borderTop: `1px solid ${B.sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <BrainIcon size={11} color={B.sidebarBorder} strokeWidth={1} />
        <span
          style={{
            fontSize: 9,
            color: B.sidebarBorder,
            letterSpacing: '0.06em',
          }}
        >
          PLANRR · EMAP EMS 5-2022 · ANSI
        </span>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   CALENDAR, REPORTS, AI ASSISTANT
═══════════════════════════════════════════════════════ */
function ProgramCalendar({ data }) {
  const items = useMemo(() => {
    const all = [];
    data.exercises.forEach((e) => {
      if (e.date)
        all.push({
          date: e.date,
          label: e.name,
          color: B.purple,
          icon: '◎',
          id: e.id,
        });
    });
    data.partners.forEach((p) => {
      if (p.expires)
        all.push({
          date: p.expires,
          label: `MOU Expires: ${p.name}`,
          color: daysUntil(p.expires) < 30 ? B.red : B.amber,
          icon: '⊕',
          id: 'm' + p.id,
        });
    });
    data.plans.forEach((p) => {
      if (p.nextReview)
        all.push({
          date: p.nextReview,
          label: `Review Due: ${p.name}`,
          color: daysUntil(p.nextReview) < 0 ? B.red : B.green,
          icon: '◈',
          id: 'p' + p.id,
        });
    });
    data.training.forEach((t) => {
      if (t.date)
        all.push({
          date: t.date,
          label: `Training: ${t.person} — ${t.type}`,
          color: B.teal,
          icon: '◉',
          id: 't' + t.id,
        });
    });
    (data.employees || []).forEach((emp) =>
      (emp.credentials || []).forEach((c) => {
        if (c.expires)
          all.push({
            date: c.expires,
            label: `${emp.name}: ${c.name || c.type} expires`,
            color: daysUntil(c.expires) < 30 ? B.red : B.amber,
            icon: '🎓',
            id: 'cred' + c.id,
          });
      })
    );
    return all.sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);
  const upcoming = items.filter(
    (i) => daysUntil(i.date) >= 0 && daysUntil(i.date) <= 180
  );
  const past = items
    .filter((i) => daysUntil(i.date) < 0)
    .slice(-8)
    .reverse();
  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.3px',
          }}
        >
          Program Calendar
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
          Exercises · Plan reviews · MOU expirations · Training · Credential
          renewals
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: B.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            Upcoming — 180 days
          </div>
          {upcoming.length === 0 ? (
            <Card
              style={{
                color: B.faint,
                fontSize: 13,
                textAlign: 'center',
                padding: 24,
              }}
            >
              No upcoming items
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {upcoming.map((i, idx) => (
                <div
                  key={i.id + idx}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    background: B.card,
                    border: `1px solid ${B.border}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      textAlign: 'center',
                      flexShrink: 0,
                      background: `${i.color}15`,
                      borderRadius: 6,
                      padding: '4px 0',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: i.color,
                        lineHeight: 1,
                      }}
                    >
                      {daysUntil(i.date)}
                    </div>
                    <div
                      style={{
                        fontSize: 8,
                        color: B.faint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      days
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: B.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {i.icon} {i.label}
                    </div>
                    <div style={{ fontSize: 10, color: B.faint }}>
                      {fmtDate(i.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: B.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            Recent Past
          </div>
          {past.length === 0 ? (
            <Card
              style={{
                color: B.faint,
                fontSize: 13,
                textAlign: 'center',
                padding: 24,
              }}
            >
              No past activity
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {past.map((i, idx) => (
                <div
                  key={i.id + idx}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    background: '#fafcfc',
                    border: `1px solid ${B.border}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    opacity: 0.65,
                  }}
                >
                  <span style={{ color: i.color, fontSize: 13, flexShrink: 0 }}>
                    {i.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: B.muted,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {i.label}
                    </div>
                    <div style={{ fontSize: 10, color: B.faint }}>
                      {fmtDate(i.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportsView({ data, orgName }) {
  const overall = useMemo(
    () => overallStats(data.standards || {}),
    [data.standards]
  );
  const [exec, setExec] = useState('');
  const [loading, setLoading] = useState(false);
  const today2 = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const compliantSections = ALL_SECTIONS.filter(
    (s) => sectionAggStatus(s, data.standards || {}) === 'compliant'
  ).length;

  // Pull branding
  const brand = data.brand || {};
  const accent = brand.accentColor || B.teal;
  const headerLine1 =
    brand.headerLine1 || orgName || 'Emergency Management Program';
  const headerLine2 = brand.headerLine2 || '';
  const footerText =
    brand.footerDisclaimer || `${orgName || 'EM Program'} · EMAP EMS 5-2022`;
  const poweredBy =
    brand.showPoweredBy !== false
      ? brand.poweredByText || 'Powered by PLANRR.ai'
      : '';
  const preparedBy = brand.preparedBy || data.emName || data.emTitle || '';
  const subtitle =
    brand.reportSubtitle ||
    'Emergency Management Program — EMAP Compliance Report';

  const generate = async () => {
    setLoading(true);
    setExec('');
    const breakdown = ALL_SECTIONS.map((s) => {
      const ag = sectionAggStatus(s, data.standards || {});
      return `${s.id} ${s.title}: ${ST[ag]?.label || 'Not Started'}`;
    }).join(', ');
    try {
      await callAI(
        SYS,
        `Write a professional 3-4 paragraph executive summary for "${orgName}" EMAP accreditation report. Date: ${today2}. Standards: ${
          overall.compliant
        }/${overall.total}. Sections: ${compliantSections}/17. Training: ${
          data.training.length
        }. Exercises: ${data.exercises.length} (${
          data.exercises.filter((e) => e.aarFinal).length
        } with final AAR). Partners: ${data.partners.length}. Plans: ${
          data.plans.length
        }. Personnel: ${(data.employees || []).length}. Active grants: ${
          (data.grants || []).filter((g) => g.status === 'active').length
        }. Hazards profiled: ${
          (data.thira?.hazards || []).length
        }. Sections: ${breakdown}. Suitable for senior leadership and EMAP assessors.`,
        (chunk) => setExec((p) => p + chunk)
      );
    } catch {
      setExec('Error.');
    }
    setLoading(false);
  };

  const doPrint = () => {
    // Inject print styles with brand accent
    const existing = document.getElementById('planrr-print-style');
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = 'planrr-print-style';
    style.textContent = `
      @media print {
        #planrr-sidebar,#planrr-topbar{display:none!important}
        #planrr-main{margin-left:0!important}
        .no-print{display:none!important}
        .print-cover{page-break-after:always}
        body{font-family:'DM Sans',sans-serif!important}
        .print-header-bar{background:${accent}!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .print-section-bar{background:${accent}!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        @page{margin:18mm 14mm;size:letter}
      }
    `;
    document.head.appendChild(style);
    window.print();
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      {/* ── Screen: topbar ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 22,
        }}
        className="no-print"
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            Compliance Report
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP EMS 5-2022 · {today2}
            {brand.logoBase64 ? '' : ' · Add your logo in Settings → Branding'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn label="⚙ Branding" onClick={() => {}} small />
          <button
            onClick={doPrint}
            style={{
              background: accent,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            🖨 Print / Export PDF
          </button>
        </div>
      </div>

      {/* ── PRINT COVER PAGE (visible on screen too as preview) ── */}
      <div className="print-cover" style={{ marginBottom: 20 }}>
        {/* Branded header bar */}
        <div
          className="print-header-bar"
          style={{
            background: accent,
            borderRadius: '12px 12px 0 0',
            padding: '22px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {brand.logoBase64 ? (
              <img
                src={brand.logoBase64}
                alt="Logo"
                style={{
                  height: 48,
                  maxWidth: 160,
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            ) : (
              <div
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <BrainIcon size={18} color="#fff" strokeWidth={1.3} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '-0.2px',
                  }}
                >
                  PLANRR
                </span>
              </div>
            )}
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: 1.2,
                }}
              >
                {headerLine1}
              </div>
              {headerLine2 && (
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.75)',
                    marginTop: 3,
                  }}
                >
                  {headerLine2}
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {brand.sealBase64 && (
              <img
                src={brand.sealBase64}
                alt="Seal"
                style={{
                  height: 52,
                  width: 52,
                  objectFit: 'contain',
                  opacity: 0.9,
                }}
              />
            )}
          </div>
        </div>

        {/* Cover details */}
        <div
          style={{
            background: B.card,
            border: `1px solid ${B.border}`,
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            padding: '24px 28px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              paddingBottom: 20,
              borderBottom: `1px solid ${B.border}`,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: B.faint,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 6,
              }}
            >
              Official Program Document
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: B.text,
                marginBottom: 4,
              }}
            >
              {subtitle}
            </div>
            <div style={{ fontSize: 13, color: B.faint }}>{today2}</div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5,1fr)',
              gap: 10,
              marginBottom: 16,
            }}
          >
            {[
              {
                n: overall.compliant + '/' + overall.total,
                l: 'Standards',
                c: accent,
              },
              { n: compliantSections + '/17', l: 'Sections', c: accent },
              { n: data.training.length, l: 'Training', c: B.muted },
              { n: data.exercises.length, l: 'Exercises', c: B.muted },
              { n: data.partners.length, l: 'Partners', c: B.muted },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: 7,
                  padding: '10px 8px',
                  border: `1px solid ${B.border}`,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>
                  {s.n}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: B.faint,
                    marginTop: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
          {preparedBy && (
            <div style={{ fontSize: 12, color: B.faint }}>
              Prepared by:{' '}
              <strong style={{ color: B.text }}>{preparedBy}</strong>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Executive Summary ── */}
      <div
        style={{
          border: `1px solid ${B.border}`,
          borderTop: `3px solid ${accent}`,
          borderRadius: '0 0 10px 10px',
          padding: '16px 20px',
          marginBottom: 14,
          background: B.card,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: exec ? 12 : 0,
          }}
          className="no-print"
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: accent,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <BrainIcon size={13} color={accent} strokeWidth={1.5} />
            AI Executive Summary
          </div>
          <Btn
            label={loading ? '⟳ Writing…' : 'Generate with AI'}
            onClick={generate}
            loading={loading}
            primary
            small
          />
        </div>
        {!exec && !loading && (
          <p
            style={{ fontSize: 13, color: B.muted, margin: 0 }}
            className="no-print"
          >
            Generate a professional executive summary from your live compliance
            data — ready for leadership or accreditation submission.
          </p>
        )}
        {exec && (
          <div
            style={{
              fontSize: 13,
              color: B.text,
              lineHeight: 1.85,
              whiteSpace: 'pre-wrap',
            }}
          >
            {exec}
            {loading && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 13,
                  background: accent,
                  marginLeft: 2,
                  animation: 'blink 0.7s infinite',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Section grid ── */}
      <div style={{ marginBottom: 6 }}>
        <div
          className="print-section-bar"
          style={{
            background: accent,
            borderRadius: '8px 8px 0 0',
            padding: '8px 14px',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
            EMAP Standards Status — All 17 Sections
          </span>
        </div>
        <div
          style={{
            background: B.card,
            border: `1px solid ${B.border}`,
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: '12px 14px',
          }}
        >
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}
          >
            {ALL_SECTIONS.map((sec) => {
              const ag = sectionAggStatus(sec, data.standards || {});
              const stats = sectionStats(sec, data.standards || {});
              const agCfg = ST[ag] || ST.not_started;
              return (
                <div
                  key={sec.id}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    padding: '7px 10px',
                    borderRadius: 6,
                    background: '#f8fafc',
                    border: `1px solid ${B.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: sec.chapter.color,
                      background: `${sec.chapter.color}15`,
                      padding: '1px 6px',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  >
                    {sec.id}
                  </span>
                  <span style={{ flex: 1, fontSize: 12, color: B.muted }}>
                    {sec.title}
                  </span>
                  <span style={{ fontSize: 10, color: B.faint, flexShrink: 0 }}>
                    {stats.compliant}/{stats.total}
                  </span>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: agCfg.dot,
                      flexShrink: 0,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Print footer (hidden on screen, shown when printing via CSS) ── */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 14,
          borderTop: `1px solid ${B.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#9ca3af',
        }}
      >
        <span>{footerText}</span>
        <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span>{today2}</span>
          {poweredBy && <span style={{ opacity: 0.6 }}>{poweredBy}</span>}
        </span>
      </div>

      {!brand.logoBase64 && (
        <div
          className="no-print"
          style={{
            marginTop: 12,
            padding: '9px 14px',
            background: '#f8fafc',
            border: `1px solid ${B.border}`,
            borderRadius: 7,
            fontSize: 12,
            color: B.faint,
          }}
        >
          Tip: Upload your agency logo in{' '}
          <strong style={{ color: B.text }}>Settings → Branding</strong> to add
          it to exports, along with your accent color and footer disclaimer.
        </div>
      )}
    </div>
  );
}

function AiAssistantView({ data, orgName }) {
  const overall = useMemo(
    () => overallStats(data.standards || {}),
    [data.standards]
  );
  const [msgs, setMsgs] = useState([
    {
      role: 'assistant',
      content: `Hi — I'm your EMAP and EM program expert in PLANRR.\n\nFull context: ${
        overall.compliant
      }/${overall.total} standards compliant, ${
        data.training.length
      } training records, ${data.exercises.length} exercises (${
        data.exercises.filter((e) => e.aarFinal).length
      } with final AAR), ${data.partners.length} partner agreements, ${
        data.plans.length
      } plans, ${
        (data.employees || []).length
      } personnel.\n\nAsk me anything about EMAP, HSEEP, exercise design, credential requirements, or running your EM program.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const end = useRef();
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);
  const ctx = `Org: "${orgName}". Standards: ${overall.compliant}/${
    overall.total
  }. Training: ${data.training.length}. Exercises: ${
    data.exercises.length
  }. Partners: ${data.partners.length}. Plans: ${
    data.plans.length
  }. Personnel: ${(data.employees || []).length}.`;
  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    const hist = [...msgs, { role: 'user', content: msg }];
    setMsgs(hist);
    setLoading(true);
    try {
      let r = '';
      setMsgs((p) => [...p, { role: 'assistant', content: '' }]);
      await callAI(
        SYS + '\n\nContext: ' + ctx,
        hist
          .map(
            (m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
          )
          .join('\n') +
          '\nUser: ' +
          msg,
        (chunk) => {
          r += chunk;
          setMsgs((p) => {
            const n = [...p];
            n[n.length - 1] = { role: 'assistant', content: r };
            return n;
          });
        }
      );
    } catch {
      setMsgs((p) => [
        ...p,
        { role: 'assistant', content: 'Connection error.' },
      ]);
    }
    setLoading(false);
  };
  const quick = [
    'What are my biggest compliance gaps?',
    'Design a tabletop exercise',
    'What do EMAP assessors look for?',
    'AAR requirements — HSEEP vs EMAP?',
    'How do I prepare my accreditation package?',
    'What credentials does an EM director need?',
  ];
  return (
    <div style={{ padding: '28px 32px', maxWidth: 760 }}>
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            background: B.sidebar,
            borderRadius: 10,
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BrainIcon size={24} color={B.teal} strokeWidth={1.3} />
        </div>
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            AI Assistant
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 1 }}>
            EMAP expert · knows your full program · Plan Smartr
          </p>
        </div>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            height: 460,
            overflowY: 'auto',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              {m.role === 'assistant' && (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    background: B.sidebar,
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <BrainIcon size={14} color={B.teal} strokeWidth={1.3} />
                </div>
              )}
              <div
                style={{
                  maxWidth: '82%',
                  padding: '10px 14px',
                  borderRadius:
                    m.role === 'user'
                      ? '12px 12px 3px 12px'
                      : '3px 12px 12px 12px',
                  background: m.role === 'user' ? B.sidebar : '#f0fafa',
                  border:
                    m.role === 'user' ? 'none' : `1px solid ${B.tealBorder}`,
                  fontSize: 13,
                  color: m.role === 'user' ? '#fff' : B.text,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
                {loading &&
                  i === msgs.length - 1 &&
                  m.role === 'assistant' &&
                  !m.content && (
                    <span style={{ display: 'inline-flex', gap: 3 }}>
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: B.teal,
                            animation: `typingDot 1.2s infinite ${d * 0.2}s`,
                          }}
                        />
                      ))}
                    </span>
                  )}
              </div>
            </div>
          ))}
          <div ref={end} />
        </div>
        {msgs.length <= 2 && (
          <div
            style={{
              padding: '0 16px 10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 5,
            }}
          >
            {quick.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                style={{
                  padding: '5px 10px',
                  background: B.tealLight,
                  border: `1px solid ${B.tealBorder}`,
                  borderRadius: 14,
                  color: B.tealDark,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 500,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div
          style={{
            padding: '10px 14px',
            borderTop: `1px solid ${B.border}`,
            display: 'flex',
            gap: 7,
          }}
        >
          <FInput
            value={input}
            onChange={setInput}
            placeholder="Ask anything about EMAP or your EM program…"
            style={{ fontSize: 13 }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? B.teal : '#edf2f4',
              border: 'none',
              borderRadius: 8,
              width: 40,
              height: 40,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: input.trim() && !loading ? '#fff' : B.faint,
              transition: 'all 0.15s',
              fontWeight: 700,
            }}
          >
            ↑
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   GRANT TRACKER
═══════════════════════════════════════════════════════ */
const GRANT_TYPES = [
  'EMPG',
  'BSIR',
  'UASI',
  'HMGP',
  'BRIC/PDM',
  'SHSP',
  'OPSG',
  'FMA',
  'CDBG-DR',
  'State Homeland',
  'Other Federal',
  'State Grant',
  'Local Grant',
  'Other',
];
const GRANT_STATUS = {
  pending: { label: 'Pending Award', color: B.blue, bg: B.blueLight },
  active: { label: 'Active', color: B.green, bg: B.greenLight },
  closeout: { label: 'In Closeout', color: B.amber, bg: B.amberLight },
  closed: { label: 'Closed', color: B.faint, bg: '#f8fafc' },
  suspended: { label: 'Suspended', color: B.red, bg: B.redLight },
};

function GrantDetail({ grant, onUpdate, onClose }) {
  const [tab, setTab] = useState('overview');
  const [dlText, setDlText] = useState('');
  const [aiText, setAiText] = useState('');
  const [aiLoad, setAiLoad] = useState(false);
  const u = (f, v) => onUpdate({ ...grant, [f]: v });
  const addDel = () => {
    if (!dlText.trim()) return;
    u('deliverables', [
      ...(grant.deliverables || []),
      { id: uid(), item: dlText.trim(), due: '', done: false, notes: '' },
    ]);
    setDlText('');
  };
  const toggleDel = (id) =>
    u(
      'deliverables',
      (grant.deliverables || []).map((d) =>
        d.id === id ? { ...d, done: !d.done } : d
      )
    );
  const updateDel = (id, f, v) =>
    u(
      'deliverables',
      (grant.deliverables || []).map((d) =>
        d.id === id ? { ...d, [f]: v } : d
      )
    );
  const removeDel = (id) =>
    u(
      'deliverables',
      (grant.deliverables || []).filter((d) => d.id !== id)
    );
  const runAi = async () => {
    setAiLoad(true);
    setAiText('');
    try {
      await callAI(
        SYS,
        `Grant: ${grant.name} (${grant.type})\nAmount: $${(
          grant.amount || 0
        ).toLocaleString()}\nMatch required: ${grant.matchPct || 0}%\nPeriod: ${
          grant.startDate
        } to ${grant.endDate}\nStatus: ${grant.status}\nDeliverables: ${
          (grant.deliverables || []).map((d) => d.item).join(', ') || 'none'
        }\nNotes: ${
          grant.notes || 'none'
        }\n\nProvide: (1) what this grant type typically allows for EM programs, (2) common compliance pitfalls, (3) how this ties to EMAP standards, (4) recommended deliverables if not already listed.`,
        (chunk) => setAiText((p) => p + chunk)
      );
    } catch {
      setAiText('Connection error.');
    }
    setAiLoad(false);
  };
  const sc = GRANT_STATUS[grant.status] || GRANT_STATUS.active;
  const totalBudget = parseFloat(grant.amount || 0);
  const matchAmt = totalBudget * (parseFloat(grant.matchPct || 0) / 100);
  const completedDel = (grant.deliverables || []).filter((d) => d.done).length;
  const totalDel = (grant.deliverables || []).length;
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'deliverables', label: `Deliverables (${totalDel})` },
    { id: 'budget', label: 'Budget & Match' },
    { id: 'ai', label: 'AI Guidance' },
  ];
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.3)',
          zIndex: 49,
          animation: 'fadeIn 0.15s',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 580,
          height: '100vh',
          background: B.card,
          borderLeft: `1px solid ${B.border}`,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.25s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${B.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: B.text }}>
                {grant.name || 'Grant Record'}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  marginTop: 3,
                }}
              >
                <Tag
                  label={grant.type || 'Grant'}
                  color={B.green}
                  bg={B.greenLight}
                  border={B.greenBorder}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: sc.color,
                    background: sc.bg,
                    padding: '3px 9px',
                    borderRadius: 10,
                    border: `1px solid ${sc.color}30`,
                  }}
                >
                  {sc.label}
                </span>
                {grant.grantNumber && (
                  <span style={{ fontSize: 11, color: B.faint }}>
                    #{grant.grantNumber}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f4f7f8',
                border: `1px solid ${B.border}`,
                borderRadius: 7,
                color: B.muted,
                cursor: 'pointer',
                fontSize: 16,
                padding: '4px 9px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px 6px 0 0',
                  border: `1px solid ${tab === t.id ? B.border : 'tranSPRent'}`,
                  borderBottom: `1px solid ${tab === t.id ? B.card : B.border}`,
                  background: tab === t.id ? B.card : 'tranSPRent',
                  color: tab === t.id ? B.green : B.muted,
                  fontSize: 12,
                  fontWeight: tab === t.id ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  marginBottom: tab === t.id ? -1 : 0,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 40px' }}>
          {tab === 'overview' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <Label>Grant Name</Label>
                  <FInput
                    value={grant.name || ''}
                    onChange={(v) => u('name', v)}
                    placeholder="e.g. FY2025 EMPG"
                  />
                </div>
                <div>
                  <Label>Grant Type</Label>
                  <FSel value={grant.type || ''} onChange={(v) => u('type', v)}>
                    <option value="">Select type…</option>
                    {GRANT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </FSel>
                </div>
                <div>
                  <Label>Grant / Award Number</Label>
                  <FInput
                    value={grant.grantNumber || ''}
                    onChange={(v) => u('grantNumber', v)}
                    placeholder="EMW-2025-EP-00XXX"
                  />
                </div>
                <div>
                  <Label>Awarding Agency</Label>
                  <FInput
                    value={grant.agency || ''}
                    onChange={(v) => u('agency', v)}
                    placeholder="FEMA, Cal OES, etc."
                  />
                </div>
                <div>
                  <Label>Performance Period Start</Label>
                  <FInput
                    type="date"
                    value={grant.startDate || ''}
                    onChange={(v) => u('startDate', v)}
                  />
                </div>
                <div>
                  <Label>Performance Period End</Label>
                  <FInput
                    type="date"
                    value={grant.endDate || ''}
                    onChange={(v) => u('endDate', v)}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <FSel
                    value={grant.status || 'active'}
                    onChange={(v) => u('status', v)}
                  >
                    {Object.entries(GRANT_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </FSel>
                </div>
                <div>
                  <Label>Program Manager (Internal)</Label>
                  <FInput
                    value={grant.manager || ''}
                    onChange={(v) => u('manager', v)}
                    placeholder="Name"
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>Description / Scope of Work</Label>
                <FTextarea
                  value={grant.description || ''}
                  onChange={(v) => u('description', v)}
                  rows={3}
                  placeholder="What this grant funds…"
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>EMAP Standards Supported</Label>
                <FInput
                  value={grant.emapRefs || ''}
                  onChange={(v) => u('emapRefs', v)}
                  placeholder="e.g. 3.4, 4.10, 4.11"
                />
              </div>
              <Attachments
                docs={grant.docs || []}
                onAdd={(doc) => u('docs', [...(grant.docs || []), doc])}
                onRemove={(id) =>
                  u(
                    'docs',
                    (grant.docs || []).filter((d) => d.id !== id)
                  )
                }
              />
            </div>
          )}
          {tab === 'deliverables' && (
            <div>
              <div
                style={{
                  background: B.greenLight,
                  border: `1px solid ${B.greenBorder}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 14,
                  fontSize: 12,
                  color: '#065f46',
                }}
              >
                Track all required deliverables, reports, and milestones. Items
                expiring within 14 days surface in notifications.
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <FInput
                  value={dlText}
                  onChange={setDlText}
                  placeholder="Add deliverable or reporting requirement…"
                  style={{ fontSize: 12 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addDel();
                  }}
                />
                <Btn label="Add" onClick={addDel} small primary />
              </div>
              {totalDel > 0 && (
                <div
                  style={{
                    marginBottom: 10,
                    display: 'flex',
                    gap: 10,
                    fontSize: 12,
                    color: B.muted,
                  }}
                >
                  <span style={{ color: B.green, fontWeight: 600 }}>
                    ✓ {completedDel} done
                  </span>
                  <span style={{ color: B.amber, fontWeight: 600 }}>
                    ○ {totalDel - completedDel} remaining
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: '#edf2f4',
                      borderRadius: 2,
                      overflow: 'hidden',
                      alignSelf: 'center',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${
                          totalDel > 0
                            ? Math.round((completedDel / totalDel) * 100)
                            : 0
                        }%`,
                        background: B.green,
                        borderRadius: 2,
                        transition: 'width 0.5s',
                      }}
                    />
                  </div>
                </div>
              )}
              {(grant.deliverables || []).length === 0 && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '24px',
                    textAlign: 'center',
                    color: B.faint,
                    fontSize: 13,
                  }}
                >
                  No deliverables yet — add reporting requirements and
                  milestones
                </div>
              )}
              {(grant.deliverables || []).map((d) => {
                const dueDays = daysUntil(d.due);
                const urgent = dueDays !== null && dueDays < 14 && !d.done;
                return (
                  <div
                    key={d.id}
                    style={{
                      background: d.done
                        ? '#f8fafc'
                        : urgent
                        ? B.redLight
                        : B.card,
                      border: `1px solid ${
                        d.done ? B.border : urgent ? B.redBorder : B.border
                      }`,
                      borderRadius: 8,
                      padding: '10px 12px',
                      marginBottom: 7,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        marginBottom: d.done ? 0 : 6,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={d.done}
                        onChange={() => toggleDel(d.id)}
                        style={{
                          cursor: 'pointer',
                          accentColor: B.teal,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: d.done ? B.faint : B.text,
                          textDecoration: d.done ? 'line-through' : 'none',
                          fontWeight: d.done ? 400 : 500,
                        }}
                      >
                        {d.item}
                      </span>
                      {urgent && !d.done && (
                        <Tag
                          label={dueDays < 0 ? 'Overdue' : `${dueDays}d`}
                          color={B.red}
                          bg={B.redLight}
                          border={B.redBorder}
                        />
                      )}
                      <button
                        onClick={() => removeDel(d.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d1d5db',
                          cursor: 'pointer',
                          fontSize: 13,
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {!d.done && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 2fr',
                          gap: 8,
                          marginLeft: 24,
                        }}
                      >
                        <div>
                          <Label>Due Date</Label>
                          <FInput
                            type="date"
                            value={d.due || ''}
                            onChange={(v) => updateDel(d.id, 'due', v)}
                            style={{ fontSize: 11, padding: '5px 8px' }}
                          />
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <FInput
                            value={d.notes || ''}
                            onChange={(v) => updateDel(d.id, 'notes', v)}
                            placeholder="Notes…"
                            style={{ fontSize: 11, padding: '5px 8px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {tab === 'budget' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <Label>Award Amount ($)</Label>
                  <FInput
                    value={grant.amount || ''}
                    onChange={(v) => u('amount', v)}
                    placeholder="250000"
                  />
                </div>
                <div>
                  <Label>Non-Federal Match (%)</Label>
                  <FInput
                    value={grant.matchPct || ''}
                    onChange={(v) => u('matchPct', v)}
                    placeholder="25"
                  />
                </div>
              </div>
              {totalBudget > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  {[
                    {
                      label: 'Federal Award',
                      val: `$${totalBudget.toLocaleString()}`,
                      color: B.green,
                    },
                    {
                      label: 'Match Required',
                      val: `$${matchAmt.toLocaleString()}`,
                      color: B.amber,
                    },
                    {
                      label: 'Total Project',
                      val: `$${(totalBudget + matchAmt).toLocaleString()}`,
                      color: B.blue,
                    },
                  ].map((s) => (
                    <Card
                      key={s.label}
                      style={{ padding: '12px 14px', textAlign: 'center' }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: s.color,
                        }}
                      >
                        {s.val}
                      </div>
                      <div
                        style={{ fontSize: 11, color: B.faint, marginTop: 3 }}
                      >
                        {s.label}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <Label>Match Source / Notes</Label>
                <FTextarea
                  value={grant.matchNotes || ''}
                  onChange={(v) => u('matchNotes', v)}
                  rows={3}
                  placeholder="Describe how the non-federal match will be met (in-kind, cash, etc.)…"
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>Budget Narrative / Notes</Label>
                <FTextarea
                  value={grant.budgetNotes || ''}
                  onChange={(v) => u('budgetNotes', v)}
                  rows={4}
                  placeholder="Budget breakdown, expenditure tracking notes…"
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <div>
                  <Label>Funds Expended ($)</Label>
                  <FInput
                    value={grant.expended || ''}
                    onChange={(v) => u('expended', v)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Expenditure Rate</Label>
                  {grant.amount && grant.expended ? (
                    <div style={{ marginTop: 5 }}>
                      <div
                        style={{
                          height: 6,
                          background: '#edf2f4',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(
                              100,
                              Math.round(
                                (parseFloat(grant.expended) /
                                  parseFloat(grant.amount)) *
                                  100
                              )
                            )}%`,
                            background: B.teal,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <div
                        style={{ fontSize: 11, color: B.muted, marginTop: 3 }}
                      >
                        {Math.round(
                          (parseFloat(grant.expended) /
                            parseFloat(grant.amount)) *
                            100
                        )}
                        % expended
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: B.faint, marginTop: 8 }}>
                      Enter amounts above
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {tab === 'ai' && (
            <div>
              <div
                style={{
                  background: B.tealLight,
                  border: `1px solid ${B.tealBorder}`,
                  borderRadius: 9,
                  padding: '14px 16px',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: B.tealDark,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginBottom: 6,
                  }}
                >
                  <BrainIcon size={13} color={B.teal} strokeWidth={1.4} />
                  AI Grant Advisor
                </div>
                <div style={{ fontSize: 12, color: B.faint, marginBottom: 10 }}>
                  Get AI guidance on allowable uses, compliance requirements,
                  EMAP alignment, and recommended deliverables for this grant
                  type.
                </div>
                <Btn
                  label={aiLoad ? '⟳ Analyzing…' : 'Analyze This Grant'}
                  onClick={runAi}
                  loading={aiLoad}
                  primary
                />
              </div>
              <AiBlock
                content={aiText}
                loading={aiLoad}
                label="Grant Guidance"
              />
              {!aiText && !aiLoad && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '20px',
                    textAlign: 'center',
                    color: B.faint,
                    fontSize: 13,
                  }}
                >
                  Click "Analyze This Grant" for AI guidance on allowable uses,
                  compliance, and EMAP alignment
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function GrantTracker({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'EMPG',
    status: 'active',
    amount: '',
    matchPct: '25',
  });
  const grants = data.grants || [];
  const create = () => {
    if (!form.name) return;
    const g = {
      ...form,
      id: uid(),
      deliverables: [],
      docs: [],
      addedAt: Date.now(),
    };
    setData((prev) => ({ ...prev, grants: [...(prev.grants || []), g] }));
    addActivity(setData, 'created', 'grants', `Created grant: ${form.name}`);
    setForm({
      name: '',
      type: 'EMPG',
      status: 'active',
      amount: '',
      matchPct: '25',
    });
    setShowForm(false);
    setSelectedId(g.id);
  };
  const updateGrant = (id, updated) =>
    setData((prev) => ({
      ...prev,
      grants: (prev.grants || []).map((g) => (g.id === id ? updated : g)),
    }));
  const removeGrant = (id) => {
    setData((prev) => ({
      ...prev,
      grants: (prev.grants || []).filter((g) => g.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
  };
  const sel = selectedId ? grants.find((g) => g.id === selectedId) : null;
  const totalActive = grants
    .filter((g) => g.status === 'active')
    .reduce((a, g) => a + parseFloat(g.amount || 0), 0);
  const totalAll = grants.reduce((a, g) => a + parseFloat(g.amount || 0), 0);
  const statusGroups = {
    active: grants.filter((g) => g.status === 'active').length,
    pending: grants.filter((g) => g.status === 'pending').length,
    closeout: grants.filter((g) => g.status === 'closeout').length,
  };
  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            Grant Tracker
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            {grants.length} grants · ${totalActive.toLocaleString()} active
            federal funding · EMAP 3.4, 4.7
          </p>
        </div>
        <Btn label="+ Add Grant" onClick={() => setShowForm(true)} primary />
      </div>
      {grants.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 10,
            marginBottom: 18,
          }}
        >
          {[
            {
              label: 'Active Grants',
              val: statusGroups.active,
              color: B.green,
              bg: B.greenLight,
            },
            {
              label: 'Pending Award',
              val: statusGroups.pending,
              color: B.blue,
              bg: B.blueLight,
            },
            {
              label: 'In Closeout',
              val: statusGroups.closeout,
              color: B.amber,
              bg: B.amberLight,
            },
            {
              label: 'Total Awarded',
              val: `$${totalAll.toLocaleString()}`,
              color: B.teal,
              bg: B.tealLight,
            },
          ].map((s) => (
            <Card
              key={s.label}
              style={{
                padding: '13px 15px',
                background: s.bg,
                border: `1px solid ${s.color}30`,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>
                {s.val}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: s.color,
                  marginTop: 3,
                  opacity: 0.8,
                }}
              >
                {s.label}
              </div>
            </Card>
          ))}
        </div>
      )}
      <div
        style={{
          background: `${B.green}10`,
          border: `1px solid ${B.greenBorder}`,
          borderLeft: `3px solid ${B.green}`,
          borderRadius: '0 8px 8px 0',
          padding: '9px 14px',
          marginBottom: 14,
          fontSize: 12,
          color: '#065f46',
        }}
      >
        ↑ Grant records support <strong>EMAP 3.4 (Admin & Finance)</strong> —
        tracking funding sources demonstrates programmatic financial management
        capability.
      </div>
      {showForm && (
        <div
          style={{
            background: B.greenLight,
            border: `1px solid ${B.greenBorder}`,
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: B.text,
              marginBottom: 12,
            }}
          >
            Add Grant
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Grant Name</Label>
              <FInput
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="FY2025 EMPG"
              />
            </div>
            <div>
              <Label>Type</Label>
              <FSel
                value={form.type}
                onChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                {GRANT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </FSel>
            </div>
            <div>
              <Label>Amount ($)</Label>
              <FInput
                value={form.amount}
                onChange={(v) => setForm((p) => ({ ...p, amount: v }))}
                placeholder="250000"
              />
            </div>
            <div>
              <Label>Match %</Label>
              <FInput
                value={form.matchPct}
                onChange={(v) => setForm((p) => ({ ...p, matchPct: v }))}
                placeholder="25"
              />
            </div>
            <div>
              <Label>Status</Label>
              <FSel
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                {Object.entries(GRANT_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </FSel>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Create Grant" onClick={create} primary />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      {grants.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '36px', color: B.faint }}>
          No grants tracked yet — add EMPG, UASI, HMGP, and other funding
          sources to demonstrate EMAP 3.4 compliance
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {grants.map((g) => {
            const sc = GRANT_STATUS[g.status] || GRANT_STATUS.active;
            const days = daysUntil(g.endDate);
            const openDels = (g.deliverables || []).filter(
              (d) => !d.done
            ).length;
            const expiredDels = (g.deliverables || []).filter(
              (d) => !d.done && d.due && daysUntil(d.due) < 0
            ).length;
            return (
              <div
                key={g.id}
                style={{
                  background: B.card,
                  border: `1px solid ${
                    expiredDels > 0 ? B.redBorder : B.border
                  }`,
                  borderRadius: 9,
                  padding: '13px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onClick={() => setSelectedId(g.id)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = B.green)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor =
                    expiredDels > 0 ? B.redBorder : B.border)
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: B.greenLight,
                      borderRadius: 9,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{ fontSize: 9, fontWeight: 800, color: B.green }}
                    >
                      {g.type || 'GRT'}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 7,
                        alignItems: 'center',
                        marginBottom: 3,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{ fontSize: 13, fontWeight: 700, color: B.text }}
                      >
                        {g.name}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: sc.color,
                          background: sc.bg,
                          padding: '2px 8px',
                          borderRadius: 10,
                          border: `1px solid ${sc.color}30`,
                        }}
                      >
                        {sc.label}
                      </span>
                      {g.amount && (
                        <Tag
                          label={`$${parseFloat(g.amount).toLocaleString()}`}
                          color={B.green}
                          bg={B.greenLight}
                          border={B.greenBorder}
                        />
                      )}
                      {g.matchPct && (
                        <Tag
                          label={`${g.matchPct}% match`}
                          color={B.amber}
                          bg={B.amberLight}
                          border={B.amberBorder}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: B.faint,
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      {g.agency && <span>{g.agency}</span>}
                      {g.grantNumber && <span>#{g.grantNumber}</span>}
                      {g.endDate && (
                        <span
                          style={{
                            color:
                              days !== null &&
                              days < 90 &&
                              g.status !== 'closed'
                                ? B.red
                                : B.faint,
                            fontWeight:
                              days !== null &&
                              days < 90 &&
                              g.status !== 'closed'
                                ? 700
                                : 400,
                          }}
                        >
                          Ends: {fmtDate(g.endDate)}
                          {days !== null && days < 90 && g.status !== 'closed'
                            ? ` (${days < 0 ? 'ENDED' : `${days}d`})`
                            : ''}
                        </span>
                      )}
                      {openDels > 0 && (
                        <span
                          style={{
                            color: expiredDels > 0 ? B.red : B.amber,
                            fontWeight: 600,
                          }}
                        >
                          {expiredDels > 0 ? '⚠ ' : ''}
                          {openDels} deliverable{openDels > 1 ? 's' : ''} open
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGrant(g.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: 4,
                    }}
                  >
                    ×
                  </button>
                  <span style={{ color: B.border, fontSize: 14 }}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {sel && (
        <GrantDetail
          grant={sel}
          onUpdate={(updated) => updateGrant(sel.id, updated)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   THIRA/SPR
═══════════════════════════════════════════════════════ */
const HAZARD_TYPES = [
  'Natural — Earthquake',
  'Natural — Flood',
  'Natural — Wildfire',
  'Natural — Extreme Heat',
  'Natural — Severe Storm / Tornado',
  'Natural — Hurricane / Tropical Storm',
  'Natural — Landslide / Debris Flow',
  'Natural — Drought',
  'Natural — Tsunami',
  'Natural — Winter Storm / Ice',
  'Technological — Dam / Levee Failure',
  'Technological — HAZMAT Fixed Facility',
  'Technological — HAZMAT Transportation',
  'Technological — Power Outage / Utility Failure',
  'Technological — Cyber Attack',
  'Technological — Nuclear / Radiological',
  'Human-Caused — Terrorism / IED',
  'Human-Caused — Active Shooter / Mass Casualty',
  'Human-Caused — Civil Unrest',
  'Human-Caused — Public Health Emergency',
  'Other',
];
const CORE_CAPS = [
  'Planning',
  'Public Information & Warning',
  'Operational Coordination',
  'Cybersecurity',
  'Forensics & Attribution',
  'Intelligence & Information Sharing',
  'Interdiction & Disruption',
  'Screening, Search & Detection',
  'Access Control & ID Verification',
  'Critical Transportation',
  'Environmental Response / Health & Safety',
  'Fatality Management Services',
  'Fire Management & Suppression',
  'Logistics & Supply Chain Mgmt',
  'Mass Care Services',
  'Mass Search & Rescue',
  'On-scene Security & Protection',
  'Operational Communications',
  'Public & Private Services & Resources',
  'Public Health, Healthcare & EMS',
  'Situational Assessment',
  'Infrastructure Systems',
  'Economic Recovery',
  'Health & Social Services',
  'Housing',
  'Natural & Cultural Resources',
  'Community Resilience',
  'Long-term Vulnerability Reduction',
  'Risk & Disaster Resilience Assessment',
  'Threats & Hazard Identification',
];

function ThiraView({ data, setData }) {
  const thira = data.thira || { hazards: [], lastUpdated: '', nextDue: '' };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'Natural — Flood',
    probability: 3,
    magnitude: 3,
    caps: [],
    notes: '',
  });
  const [aiText, setAiText] = useState('');
  const [aiLoad, setAiLoad] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [tab, setTab] = useState('hazards'); // hazards | import | generate
  // Import state
  const [importDragging, setImportDragging] = useState(false);
  const [importLoad, setImportLoad] = useState(false);
  const [importResult, setImportResult] = useState('');
  const importRef = useRef();
  // Generate state
  const [genLoad, setGenLoad] = useState(false);
  const [genDoc, setGenDoc] = useState('');

  const update = (patch) =>
    setData((prev) => ({
      ...prev,
      thira: { ...(prev.thira || {}), ...patch },
    }));
  const addHazard = () => {
    if (!form.name) return;
    const h = {
      ...form,
      id: uid(),
      probability: parseInt(form.probability),
      magnitude: parseInt(form.magnitude),
    };
    update({ hazards: [...(thira.hazards || []), h], lastUpdated: today() });
    setForm({
      name: '',
      type: 'Natural — Flood',
      probability: 3,
      magnitude: 3,
      caps: [],
      notes: '',
    });
    setShowForm(false);
    addActivity(setData, 'created', 'thira', `Added hazard: ${form.name}`);
  };
  const removeHazard = (id) =>
    update({ hazards: (thira.hazards || []).filter((h) => h.id !== id) });
  const updateHazard = (id, field, val) =>
    update({
      hazards: (thira.hazards || []).map((h) =>
        h.id === id ? { ...h, [field]: val } : h
      ),
    });

  const riskColor = (s) =>
    s >= 20 ? '#dc2626' : s >= 12 ? '#d97706' : s >= 6 ? '#2563eb' : B.green;
  const riskLabel = (s) =>
    s >= 20 ? 'Extreme' : s >= 12 ? 'High' : s >= 6 ? 'Moderate' : 'Low';
  const toggleCap = (hazId, cap) => {
    const h = thira.hazards.find((x) => x.id === hazId);
    const caps = h.caps || [];
    updateHazard(
      hazId,
      'caps',
      caps.includes(cap) ? caps.filter((c) => c !== cap) : [...caps, cap]
    );
  };

  // AI Analysis of existing hazard list
  const runAi = async () => {
    setAiLoad(true);
    setAiText('');
    const hazList = (thira.hazards || [])
      .map(
        (h) =>
          `${h.name} (P:${h.probability}/5, M:${h.magnitude}/5, Risk:${
            h.probability * h.magnitude
          })`
      )
      .join(', ');
    try {
      await callAI(
        SYS,
        `THIRA/SPR Analysis for ${
          data.orgName || 'this jurisdiction'
        }:\nHazards: ${hazList || 'none entered'}\nState: ${
          data.state || 'unknown'
        }\n\nProvide: (1) analysis of the hazard profile and highest-risk threats, (2) core capabilities most likely to be stressed, (3) recommended capability targets, (4) how this feeds into EMAP 4.1 compliance and annual SPR submission, (5) any hazards common to this region that may be missing.`,
        (chunk) => setAiText((p) => p + chunk)
      );
    } catch {
      setAiText('Connection error.');
    }
    setAiLoad(false);
  };

  // Parse an existing THIRA/SPR document and extract hazards
  const importDoc = async (file) => {
    setImportLoad(true);
    setImportResult('');
    try {
      const r = new FileReader();
      const fd = await new Promise((res, rej) => {
        if (file.type === 'application/pdf') {
          r.onload = (e) =>
            res({ type: 'pdf', data: e.target.result.split(',')[1] });
          r.readAsDataURL(file);
        } else if (file.type.startsWith('image/')) {
          r.onload = (e) =>
            res({
              type: 'image',
              mimeType: file.type,
              data: e.target.result.split(',')[1],
            });
          r.readAsDataURL(file);
        } else {
          r.onload = (e) =>
            res({ type: 'text', data: e.target.result.slice(0, 15000) });
          r.readAsText(file);
        }
        r.onerror = rej;
      });

      const content = [];
      const prompt = `You are reading a THIRA or SPR document for "${
        data.orgName || 'this jurisdiction'
      }".\n\nExtract ALL hazards/threats identified in this document.\nReturn ONLY valid JSON, no other text:\n{\n  "jurisdiction":"name from doc",\n  "docDate":"date if found",\n  "hazards":[\n    {\n      "name":"specific hazard name as written",\n      "type":"Natural — Flood|Natural — Wildfire|Natural — Earthquake|Natural — Severe Storm / Tornado|Natural — Extreme Heat|Natural — Hurricane / Tropical Storm|Natural — Landslide / Debris Flow|Natural — Drought|Natural — Winter Storm / Ice|Technological — Dam / Levee Failure|Technological — HAZMAT Fixed Facility|Technological — HAZMAT Transportation|Technological — Power Outage / Utility Failure|Technological — Cyber Attack|Human-Caused — Terrorism / IED|Human-Caused — Active Shooter / Mass Casualty|Human-Caused — Civil Unrest|Human-Caused — Public Health Emergency|Other",\n      "probability":3,\n      "magnitude":3,\n      "notes":"any context, data, or description from the document"\n    }\n  ]\n}\n\nFor probability and magnitude use 1-5 scale. Extract from the document if provided, otherwise make a reasonable estimate based on the hazard type and any context. Extract as many hazards as possible — be thorough.`;

      if (fd.type === 'pdf') {
        content.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: fd.data,
          },
        });
        content.push({ type: 'text', text: prompt });
      } else if (fd.type === 'image') {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: fd.mimeType, data: fd.data },
        });
        content.push({ type: 'text', text: prompt });
      } else {
        content.push({
          type: 'text',
          text: `Document content:\n${fd.data}\n\n${prompt}`,
        });
      }

      const res = await fetch(
        'https://ltnbvwnhtsaebyslbhil.supabase.co/functions/v1/super-endpoint',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'bulk_intake',
            content,
            max_tokens: 1400,
          }),
        }
      );
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      const parsed = JSON.parse(
        (json.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim()
      );
      const extracted = parsed.hazards || [];

      if (extracted.length === 0) {
        setImportResult(
          "No hazards found in this document. Make sure it's a THIRA or SPR document."
        );
        setImportLoad(false);
        return;
      }

      // Merge into existing hazards (deduplicate by name)
      const existing = thira.hazards || [];
      const existingNames = new Set(existing.map((h) => h.name.toLowerCase()));
      const newHazards = extracted
        .filter((h) => !existingNames.has(h.name.toLowerCase()))
        .map((h) => ({
          ...h,
          id: uid(),
          caps: [],
          probability: Math.min(5, Math.max(1, parseInt(h.probability) || 3)),
          magnitude: Math.min(5, Math.max(1, parseInt(h.magnitude) || 3)),
        }));
      const updated = [...existing, ...newHazards];
      update({ hazards: updated, lastUpdated: today() });
      setImportResult(
        `✓ Extracted ${newHazards.length} hazard${
          newHazards.length !== 1 ? 's' : ''
        } from "${file.name}"${
          extracted.length - newHazards.length > 0
            ? ` (${extracted.length - newHazards.length} already in your list)`
            : ''
        }.`
      );
      addActivity(
        setData,
        'created',
        'thira',
        `Imported ${newHazards.length} hazards from "${file.name}"`
      );
      if (newHazards.length > 0) setTab('hazards');
    } catch (e) {
      setImportResult(`Error: ${e.message || 'Could not read document'}`);
    }
    setImportLoad(false);
  };

  // Generate a full THIRA/SPR document
  const generateSPR = async () => {
    setGenLoad(true);
    setGenDoc('');
    const hazList = (thira.hazards || [])
      .sort((a, b) => b.probability * b.magnitude - a.probability * a.magnitude)
      .map(
        (h) =>
          `- ${h.name} (${h.type}) | Probability: ${
            h.probability
          }/5 | Magnitude: ${h.magnitude}/5 | Risk Score: ${
            h.probability * h.magnitude
          }/25 | Capabilities: ${(h.caps || []).join(', ') || 'not specified'}${
            h.notes ? ` | Notes: ${h.notes}` : ''
          }`
      )
      .join('\n');
    try {
      await callAI(
        SYS,
        `Generate a complete, professional THIRA/SPR document for ${
          data.orgName || 'this jurisdiction'
        } in ${data.state || 'the state'}.\n\nJurisdiction type: ${
          data.jurisdiction || 'Unknown'
        }\nPrimary EM: ${data.emName || 'Unknown'} · ${
          data.emTitle || ''
        }\nDate: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}\nLast THIRA Update: ${
          fmtDate(thira.lastUpdated) || 'N/A'
        }\n\nHAZARDS PROFILED:\n${
          hazList ||
          'No hazards entered yet — add hazards first for a complete document.'
        }\n\nGenerate a formal government document with these sections:\n\n1. EXECUTIVE SUMMARY\n   - Jurisdiction overview, purpose, summary of highest-risk hazards\n\n2. METHODOLOGY\n   - FEMA CPG 201 Third Edition compliance statement\n   - Process used to identify and assess threats and hazards\n   - Stakeholder engagement summary\n\n3. THREAT AND HAZARD IDENTIFICATION\n   - Table format: Hazard | Category | Probability | Magnitude | Risk Score\n   - Brief description of each identified hazard for this jurisdiction\n\n4. RISK ASSESSMENT\n   - Analysis of each high-risk hazard (Risk Score ≥ 12)\n   - Consequence analysis: impacts on public, responders, infrastructure, economy\n   - Vulnerability assessment\n\n5. CAPABILITY TARGETS\n   - Core capabilities stressed by identified hazards\n   - Current capability gaps\n   - Recommended capability targets aligned with CPG 201\n\n6. SPR — STAKEHOLDER PREPAREDNESS REVIEW\n   - Program strengths\n   - Areas for improvement\n   - Corrective actions and milestones\n   - Resources and investment priorities\n\n7. MAINTENANCE AND UPDATE SCHEDULE\n   - Annual review process\n   - Triggers for off-cycle updates\n\nUse formal government document tone. Be specific to the jurisdiction and hazards provided. Include EMAP 4.1 compliance notes where relevant.`,
        (chunk) => setGenDoc((p) => p + chunk)
      );
    } catch {
      setGenDoc('Error generating document.');
    }
    setGenLoad(false);
  };

  const downloadSPR = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([genDoc], { type: 'text/plain' }));
    a.download = `${data.orgName || 'planrr'}-SPR-THIRA-${today()}.txt`;
    a.click();
  };

  const tabs = [
    {
      id: 'hazards',
      label: `Hazard Profile (${(thira.hazards || []).length})`,
    },
    { id: 'import', label: 'Import Document' },
    { id: 'generate', label: 'Generate SPR Document' },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            THIRA/SPR
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            Threat & Hazard Identification · Stakeholder Preparedness Review ·
            EMAP 4.1 · {(thira.hazards || []).length} hazards
            {thira.lastUpdated
              ? ` · Updated ${fmtDate(thira.lastUpdated)}`
              : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn
            label="✦ AI Analysis"
            onClick={() => {
              setTab('hazards');
              runAi();
            }}
            loading={aiLoad}
          />
          <Btn label="+ Add Hazard" onClick={() => setShowForm(true)} primary />
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          borderBottom: `1px solid ${B.border}`,
          marginBottom: 18,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '7px 16px',
              borderRadius: '7px 7px 0 0',
              border: `1px solid ${tab === t.id ? B.border : 'tranSPRent'}`,
              borderBottom: `1px solid ${tab === t.id ? B.card : B.border}`,
              background: tab === t.id ? B.card : 'tranSPRent',
              color: tab === t.id ? B.blue : B.muted,
              fontSize: 12,
              fontWeight: tab === t.id ? 700 : 500,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HAZARD PROFILE TAB ── */}
      {tab === 'hazards' && (
        <div>
          <div
            style={{
              background: `${B.blue}10`,
              border: `1px solid ${B.blueBorder}`,
              borderLeft: `3px solid ${B.blue}`,
              borderRadius: '0 8px 8px 0',
              padding: '9px 14px',
              marginBottom: 14,
              fontSize: 12,
              color: '#1e40af',
            }}
          >
            ↑ THIRA/SPR directly satisfies <strong>EMAP 4.1</strong>. FEMA
            requires annual submission via the THIRA/SPR tool. Use the{' '}
            <strong>Import Document</strong> tab to pull hazards from an
            existing document, or <strong>Generate SPR Document</strong> to
            create a new one.
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div>
              <Label>Last THIRA/SPR Update</Label>
              <FInput
                type="date"
                value={thira.lastUpdated || ''}
                onChange={(v) => update({ lastUpdated: v })}
              />
            </div>
            <div>
              <Label>Next THIRA/SPR Due</Label>
              <FInput
                type="date"
                value={thira.nextDue || ''}
                onChange={(v) => update({ nextDue: v })}
              />
            </div>
          </div>
          <AiBlock
            content={aiText}
            loading={aiLoad}
            label="THIRA/SPR Analysis"
          />
          {showForm && (
            <div
              style={{
                background: B.blueLight,
                border: `1px solid ${B.blueBorder}`,
                borderRadius: 10,
                padding: '16px 18px',
                marginBottom: 14,
                marginTop: aiText ? 10 : 0,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: B.text,
                  marginBottom: 12,
                }}
              >
                Add Hazard
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 1fr',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div>
                  <Label>Hazard Name</Label>
                  <FInput
                    value={form.name}
                    onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                    placeholder="100-year Flood — Sacramento River"
                  />
                </div>
                <div>
                  <Label>Hazard Type</Label>
                  <FSel
                    value={form.type}
                    onChange={(v) => setForm((p) => ({ ...p, type: v }))}
                  >
                    {HAZARD_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </FSel>
                </div>
                <div>
                  <Label>Probability (1–5)</Label>
                  <FSel
                    value={form.probability}
                    onChange={(v) => setForm((p) => ({ ...p, probability: v }))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </FSel>
                </div>
                <div>
                  <Label>Magnitude (1–5)</Label>
                  <FSel
                    value={form.magnitude}
                    onChange={(v) => setForm((p) => ({ ...p, magnitude: v }))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </FSel>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <Label>Notes</Label>
                <FInput
                  value={form.notes}
                  onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
                  placeholder="Historical context, data sources, frequency…"
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn label="Add Hazard" onClick={addHazard} primary />
                <Btn label="Cancel" onClick={() => setShowForm(false)} />
              </div>
            </div>
          )}
          {(thira.hazards || []).length === 0 && !aiText && (
            <Card
              style={{ textAlign: 'center', padding: '36px', color: B.faint }}
            >
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                No hazards profiled yet
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                Add hazards manually, or use the{' '}
                <button
                  onClick={() => setTab('import')}
                  style={{
                    color: B.blue,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Import Document
                </button>{' '}
                tab to extract them from an existing THIRA or SPR document.
              </div>
            </Card>
          )}
          {(thira.hazards || []).length > 0 && (
            <div>
              {/* Risk grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5,1fr)',
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                {(thira.hazards || []).map((h) => {
                  const risk = h.probability * h.magnitude;
                  return (
                    <div
                      key={h.id}
                      style={{
                        background: riskColor(risk) + '15',
                        border: `1px solid ${riskColor(risk)}40`,
                        borderRadius: 8,
                        padding: '8px 10px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: riskColor(risk),
                        }}
                      >
                        {risk}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: riskColor(risk),
                          fontWeight: 600,
                          marginBottom: 3,
                        }}
                      >
                        {riskLabel(risk)}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: B.muted,
                          lineHeight: 1.3,
                          wordBreak: 'break-word',
                        }}
                      >
                        {h.name.split('—').pop().trim()}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Hazard list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[...(thira.hazards || [])]
                  .sort(
                    (a, b) =>
                      b.probability * b.magnitude - a.probability * a.magnitude
                  )
                  .map((h) => {
                    const risk = h.probability * h.magnitude;
                    const rc = riskColor(risk);
                    const expanded = expandedId === h.id;
                    return (
                      <div
                        key={h.id}
                        style={{
                          background: B.card,
                          border: `1px solid ${B.border}`,
                          borderRadius: 9,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                          }}
                          onClick={() => setExpandedId(expanded ? null : h.id)}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              background: rc + '15',
                              borderRadius: 8,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: rc,
                              }}
                            >
                              {risk}
                            </div>
                            <div
                              style={{
                                fontSize: 8,
                                color: rc,
                                fontWeight: 700,
                              }}
                            >
                              {riskLabel(risk)}
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: B.text,
                                marginBottom: 2,
                              }}
                            >
                              {h.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: B.faint,
                                display: 'flex',
                                gap: 10,
                                flexWrap: 'wrap',
                              }}
                            >
                              <span>P: {h.probability}/5</span>
                              <span>M: {h.magnitude}/5</span>
                              <span
                                style={{
                                  background: `${
                                    h.type.startsWith('Natural')
                                      ? B.blue
                                      : h.type.startsWith('Tech')
                                      ? B.amber
                                      : B.red
                                  }15`,
                                  color: h.type.startsWith('Natural')
                                    ? B.blue
                                    : h.type.startsWith('Tech')
                                    ? B.amber
                                    : B.red,
                                  padding: '1px 6px',
                                  borderRadius: 5,
                                  fontWeight: 600,
                                }}
                              >
                                {h.type.split('—')[0].trim()}
                              </span>
                              {(h.caps || []).length > 0 && (
                                <span>
                                  {(h.caps || []).length} capabilities tagged
                                </span>
                              )}
                              {h.notes && (
                                <span style={{ color: B.teal }}>
                                  ✎ has notes
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHazard(h.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#d1d5db',
                              cursor: 'pointer',
                              fontSize: 13,
                            }}
                          >
                            ×
                          </button>
                          <span
                            style={{
                              color: B.faint,
                              fontSize: 10,
                              transform: expanded
                                ? 'rotate(180deg)'
                                : 'rotate(0)',
                              transition: 'transform 0.2s',
                            }}
                          >
                            ▼
                          </span>
                        </div>
                        {expanded && (
                          <div
                            style={{
                              padding: '12px 16px',
                              borderTop: `1px solid #f4f7f8`,
                              background: '#fafcfc',
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 10,
                                marginBottom: 12,
                              }}
                            >
                              <div>
                                <Label>
                                  Probability (1=rare, 5=highly likely)
                                </Label>
                                <div style={{ display: 'flex', gap: 5 }}>
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                      key={n}
                                      onClick={() =>
                                        updateHazard(h.id, 'probability', n)
                                      }
                                      style={{
                                        flex: 1,
                                        padding: '6px',
                                        border: `1px solid ${
                                          h.probability === n ? rc : B.border
                                        }`,
                                        background:
                                          h.probability === n
                                            ? rc + '20'
                                            : B.card,
                                        color:
                                          h.probability === n ? rc : B.faint,
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        fontWeight:
                                          h.probability === n ? 700 : 400,
                                      }}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label>
                                  Magnitude (1=minimal, 5=catastrophic)
                                </Label>
                                <div style={{ display: 'flex', gap: 5 }}>
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                      key={n}
                                      onClick={() =>
                                        updateHazard(h.id, 'magnitude', n)
                                      }
                                      style={{
                                        flex: 1,
                                        padding: '6px',
                                        border: `1px solid ${
                                          h.magnitude === n ? rc : B.border
                                        }`,
                                        background:
                                          h.magnitude === n
                                            ? rc + '20'
                                            : B.card,
                                        color: h.magnitude === n ? rc : B.faint,
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        fontWeight:
                                          h.magnitude === n ? 700 : 400,
                                      }}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                              <Label>Core Capabilities Affected</Label>
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 4,
                                  maxHeight: 120,
                                  overflowY: 'auto',
                                }}
                              >
                                {CORE_CAPS.map((cap) => (
                                  <button
                                    key={cap}
                                    onClick={() => toggleCap(h.id, cap)}
                                    style={{
                                      padding: '3px 8px',
                                      borderRadius: 10,
                                      border: `1px solid ${
                                        (h.caps || []).includes(cap)
                                          ? B.teal
                                          : B.border
                                      }`,
                                      background: (h.caps || []).includes(cap)
                                        ? B.tealLight
                                        : B.card,
                                      color: (h.caps || []).includes(cap)
                                        ? B.tealDark
                                        : B.faint,
                                      fontSize: 10,
                                      cursor: 'pointer',
                                      fontFamily: "'DM Sans',sans-serif",
                                      transition: 'all 0.1s',
                                    }}
                                  >
                                    {cap}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label>Notes / Historical Context</Label>
                              <FTextarea
                                value={h.notes || ''}
                                onChange={(v) => updateHazard(h.id, 'notes', v)}
                                placeholder="Historical events, frequency data, source documentation, vulnerability notes…"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── IMPORT DOCUMENT TAB ── */}
      {tab === 'import' && (
        <div>
          <div
            style={{
              background: B.tealLight,
              border: `1px solid ${B.tealBorder}`,
              borderLeft: `3px solid ${B.teal}`,
              borderRadius: '0 8px 8px 0',
              padding: '10px 14px',
              marginBottom: 18,
              fontSize: 12,
              color: B.tealDark,
            }}
          >
            <strong>Have an existing THIRA or SPR document?</strong> Drop it
            here — AI will read through it, extract every hazard, and
            automatically populate your hazard profile. Supports PDF, Word,
            images, or plain text. Duplicate hazards are skipped.
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setImportDragging(true);
            }}
            onDragLeave={() => setImportDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setImportDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) importDoc(f);
            }}
            onClick={() => importRef.current.click()}
            style={{
              border: `2px dashed ${importDragging ? B.teal : B.border}`,
              borderRadius: 12,
              padding: '48px 32px',
              textAlign: 'center',
              background: importDragging ? B.tealLight : '#fafcfc',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: 14,
            }}
          >
            {importLoad ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    animation: 'spin 1s linear infinite',
                    fontSize: 28,
                    display: 'inline-block',
                  }}
                >
                  ⟳
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: B.tealDark }}
                >
                  Reading document and extracting hazards…
                </div>
                <div style={{ fontSize: 12, color: B.faint }}>
                  This may take 15–30 seconds
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.35 }}>
                  📄
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: B.text,
                    marginBottom: 6,
                  }}
                >
                  Drop your THIRA or SPR document here
                </div>
                <div style={{ fontSize: 13, color: B.faint, marginBottom: 4 }}>
                  Previous THIRA, SPR report, CPG 201 worksheet, or any document
                  listing your jurisdiction's hazards
                </div>
                <div style={{ fontSize: 11, color: '#d1d8db' }}>
                  PDF · Word · Images · Text files
                </div>
              </>
            )}
            <input
              ref={importRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files[0]) importDoc(e.target.files[0]);
              }}
            />
          </div>
          {importResult && (
            <div
              style={{
                padding: '12px 16px',
                background: importResult.startsWith('✓')
                  ? B.greenLight
                  : B.redLight,
                border: `1px solid ${
                  importResult.startsWith('✓') ? B.greenBorder : B.redBorder
                }`,
                borderRadius: 9,
                fontSize: 13,
                color: importResult.startsWith('✓') ? '#065f46' : B.red,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>
                {importResult.startsWith('✓') ? '✓' : '⚠'}
              </span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  {importResult}
                </div>
                {importResult.startsWith('✓') && (
                  <div style={{ fontSize: 11, opacity: 0.8 }}>
                    Review the imported hazards in the{' '}
                    <button
                      onClick={() => setTab('hazards')}
                      style={{
                        color: '#065f46',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Hazard Profile tab
                    </button>{' '}
                    — adjust probability and magnitude scores and tag the
                    affected core capabilities.
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {[
              [
                'What documents work?',
                "Previous THIRA submissions, SPR reports, CPG 201 worksheets, risk assessments, hazard mitigation plan appendices, or any document that lists your jurisdiction's threats and hazards.",
              ],
              [
                'What gets extracted?',
                'Hazard names, types, probability/magnitude scores (if present), and any contextual notes. Everything maps directly into your hazard profile and can be edited after import.',
              ],
            ].map(([t, d]) => (
              <div
                key={t}
                style={{
                  background: '#f8fafc',
                  border: `1px solid ${B.border}`,
                  borderRadius: 8,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: B.text,
                    marginBottom: 5,
                  }}
                >
                  {t}
                </div>
                <div style={{ fontSize: 11, color: B.muted, lineHeight: 1.65 }}>
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GENERATE SPR DOCUMENT TAB ── */}
      {tab === 'generate' && (
        <div>
          <div
            style={{
              background: `${B.purple}10`,
              border: `1px solid ${B.purpleBorder}`,
              borderLeft: `3px solid ${B.purple}`,
              borderRadius: '0 8px 8px 0',
              padding: '10px 14px',
              marginBottom: 18,
              fontSize: 12,
              color: '#5b21b6',
            }}
          >
            AI generates a complete, formal THIRA/SPR document using your hazard
            profile data — including executive summary, risk assessment,
            capability targets, and SPR narrative. The document follows FEMA CPG
            201 Third Edition structure and satisfies <strong>EMAP 4.1</strong>.
          </div>
          {(thira.hazards || []).length === 0 && (
            <div
              style={{
                background: B.amberLight,
                border: `1px solid ${B.amberBorder}`,
                borderRadius: 9,
                padding: '12px 14px',
                marginBottom: 14,
                fontSize: 12,
                color: '#92400e',
              }}
            >
              ⚠ Add hazards to your profile first for a complete document. The
              generator will produce a template but it will be generic without
              hazard data.
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <button
              onClick={generateSPR}
              disabled={genLoad}
              style={{
                background: B.purple,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '11px 22px',
                fontSize: 13,
                fontWeight: 700,
                cursor: genLoad ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans',sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: genLoad ? 0.7 : 1,
              }}
            >
              <BrainIcon size={15} color="#fff" strokeWidth={1.4} />
              {genLoad
                ? '⟳ Generating SPR Document…'
                : 'Generate THIRA/SPR Document'}
            </button>
            {genDoc && !genLoad && (
              <Btn label="↓ Download .txt" onClick={downloadSPR} />
            )}
            {genDoc && !genLoad && (
              <Btn label="Regenerate" onClick={generateSPR} />
            )}
          </div>
          {genLoad && (
            <div
              style={{
                background: `${B.purple}10`,
                border: `1px solid ${B.purpleBorder}`,
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block',
                  fontSize: 16,
                  color: B.purple,
                }}
              >
                ⟳
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: B.purple }}>
                  Writing your THIRA/SPR document…
                </div>
                <div style={{ fontSize: 11, color: B.faint }}>
                  Generating all sections including risk assessment, capability
                  targets, and SPR narrative
                </div>
              </div>
            </div>
          )}
          {genDoc && (
            <div
              style={{
                background: B.card,
                border: `1px solid ${B.border}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: `${B.purple}10`,
                  borderBottom: `1px solid ${B.purpleBorder}`,
                  padding: '10px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: B.purple,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <BrainIcon size={13} color={B.purple} strokeWidth={1.4} />
                  {data.orgName || 'Your Organization'} — THIRA/SPR Document
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <Btn label="↓ Download .txt" onClick={downloadSPR} small />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(genDoc);
                    }}
                    style={{
                      fontSize: 11,
                      color: B.muted,
                      background: B.card,
                      border: `1px solid ${B.border}`,
                      borderRadius: 6,
                      padding: '4px 9px',
                      cursor: 'pointer',
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div
                style={{
                  padding: '20px 22px',
                  maxHeight: 600,
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: B.text,
                    lineHeight: 1.85,
                    whiteSpace: 'pre-wrap',
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {genDoc}
                  {genLoad && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 2,
                        height: 13,
                        background: B.purple,
                        marginLeft: 2,
                        animation: 'blink 0.7s infinite',
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {!genDoc && !genLoad && (
            <div
              style={{
                background: '#f8fafc',
                border: `1px solid ${B.border}`,
                borderRadius: 10,
                padding: '40px',
                textAlign: 'center',
                color: B.faint,
              }}
            >
              <div style={{ fontSize: 14, marginBottom: 6 }}>
                Ready to generate your THIRA/SPR document
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                {(thira.hazards || []).length > 0
                  ? `${(thira.hazards || []).length} hazard${
                      (thira.hazards || []).length > 1 ? 's' : ''
                    } profiled · AI will build the complete document around your data`
                  : 'Add hazards to your profile first for the most complete and specific document'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CAP DASHBOARD (Corrective Action Program)
═══════════════════════════════════════════════════════ */
function CapDashboard({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('open');
  const [form, setForm] = useState({
    item: '',
    source: 'standalone',
    sourceRef: '',
    priority: 'medium',
    responsible: '',
    due: '',
    emapRef: '',
    notes: '',
  });
  const capItems = data.capItems || [];
  // Pull corrective actions from exercises
  const exCAs = useMemo(() => {
    const all = [];
    (data.exercises || []).forEach((ex) => {
      (ex.corrective || []).forEach((ca) => {
        all.push({
          id: 'ex-' + ca.id,
          item: ca.item,
          source: 'exercise',
          sourceRef: ex.name,
          priority: 'medium',
          responsible: '',
          due: ca.due || '',
          closed: ca.closed,
          emapRef: '4.11',
          exerciseId: ex.id,
        });
      });
    });
    return all;
  }, [data.exercises]);
  const allCAs = [...exCAs, ...capItems];
  const open = allCAs.filter((c) => !c.closed).length;
  const overdue = allCAs.filter(
    (c) => !c.closed && c.due && daysUntil(c.due) < 0
  ).length;
  const critical = allCAs.filter(
    (c) => !c.closed && c.priority === 'critical'
  ).length;
  const save = () => {
    if (!form.item) return;
    const ca = { ...form, id: uid(), closed: false, addedAt: Date.now() };
    setData((prev) => ({ ...prev, capItems: [...(prev.capItems || []), ca] }));
    addActivity(setData, 'created', 'cap', `Added CAP item: ${form.item}`);
    setForm({
      item: '',
      source: 'standalone',
      sourceRef: '',
      priority: 'medium',
      responsible: '',
      due: '',
      emapRef: '',
      notes: '',
    });
    setShowForm(false);
  };
  const toggleCap = (id) => {
    setData((prev) => ({
      ...prev,
      capItems: (prev.capItems || []).map((c) =>
        c.id === id ? { ...c, closed: !c.closed, closedAt: Date.now() } : c
      ),
    }));
  };
  const removeCap = (id) =>
    setData((prev) => ({
      ...prev,
      capItems: (prev.capItems || []).filter((c) => c.id !== id),
    }));
  const PRIORITY = {
    critical: { label: 'Critical', color: B.red, bg: B.redLight },
    high: { label: 'High', color: '#dc2626', bg: '#fef2f2' },
    medium: { label: 'Medium', color: B.amber, bg: B.amberLight },
    low: { label: 'Low', color: B.blue, bg: B.blueLight },
  };
  const filtered = useMemo(() => {
    if (filter === 'open') return allCAs.filter((c) => !c.closed);
    if (filter === 'overdue')
      return allCAs.filter((c) => !c.closed && c.due && daysUntil(c.due) < 0);
    if (filter === 'closed') return allCAs.filter((c) => c.closed);
    if (filter === 'critical')
      return allCAs.filter(
        (c) => !c.closed && (c.priority === 'critical' || c.priority === 'high')
      );
    return allCAs;
  }, [allCAs, filter]);
  return (
    <div style={{ padding: '28px 32px', maxWidth: 960 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: B.text,
              letterSpacing: '-0.3px',
            }}
          >
            Corrective Action Program
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP 4.11.3 · {open} open ·{' '}
            {overdue > 0 ? (
              <span style={{ color: B.red, fontWeight: 700 }}>
                {overdue} overdue ·{' '}
              </span>
            ) : (
              ''
            )}
            {critical > 0 ? (
              <span style={{ color: B.red, fontWeight: 700 }}>
                {critical} critical
              </span>
            ) : (
              ''
            )}{' '}
            · Pulls from exercises + standalone items
          </p>
        </div>
        <Btn label="+ Add CAP Item" onClick={() => setShowForm(true)} primary />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 10,
          marginBottom: 18,
        }}
      >
        {[
          { label: 'Open', val: open, color: B.amber, bg: B.amberLight },
          { label: 'Overdue', val: overdue, color: B.red, bg: B.redLight },
          {
            label: 'Critical/High',
            val: critical,
            color: '#dc2626',
            bg: '#fef2f2',
          },
          {
            label: 'Total Items',
            val: allCAs.length,
            color: B.blue,
            bg: B.blueLight,
          },
        ].map((s) => (
          <Card
            key={s.label}
            style={{
              padding: '13px 15px',
              background: s.bg,
              border: `1px solid ${s.color}30`,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>
              {s.val}
            </div>
            <div
              style={{
                fontSize: 11,
                color: s.color,
                marginTop: 3,
                opacity: 0.8,
              }}
            >
              {s.label}
            </div>
          </Card>
        ))}
      </div>
      {showForm && (
        <div
          style={{
            background: B.redLight,
            border: `1px solid ${B.redBorder}`,
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: B.text,
              marginBottom: 12,
            }}
          >
            Add Corrective Action
          </div>
          <div style={{ marginBottom: 10 }}>
            <Label>Corrective Action Item</Label>
            <FInput
              value={form.item}
              onChange={(v) => setForm((p) => ({ ...p, item: v }))}
              placeholder="Describe the deficiency and corrective action required…"
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Source</Label>
              <FSel
                value={form.source}
                onChange={(v) => setForm((p) => ({ ...p, source: v }))}
              >
                <option value="standalone">Standalone</option>
                <option value="real_incident">Real Incident</option>
                <option value="assessment">Assessment</option>
                <option value="standards_gap">Standards Gap</option>
                <option value="other">Other</option>
              </FSel>
            </div>
            <div>
              <Label>Source Reference</Label>
              <FInput
                value={form.sourceRef}
                onChange={(v) => setForm((p) => ({ ...p, sourceRef: v }))}
                placeholder="Incident name, report #…"
              />
            </div>
            <div>
              <Label>Priority</Label>
              <FSel
                value={form.priority}
                onChange={(v) => setForm((p) => ({ ...p, priority: v }))}
              >
                {Object.entries(PRIORITY).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </FSel>
            </div>
            <div>
              <Label>EMAP Reference</Label>
              <FInput
                value={form.emapRef}
                onChange={(v) => setForm((p) => ({ ...p, emapRef: v }))}
                placeholder="e.g. 4.11.3"
              />
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <Label>Responsible Party</Label>
              <FInput
                value={form.responsible}
                onChange={(v) => setForm((p) => ({ ...p, responsible: v }))}
                placeholder="Name or role"
              />
            </div>
            <div>
              <Label>Target Completion Date</Label>
              <FInput
                type="date"
                value={form.due}
                onChange={(v) => setForm((p) => ({ ...p, due: v }))}
              />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <Label>Notes</Label>
            <FInput
              value={form.notes}
              onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
              placeholder="Additional context…"
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Save CAP Item" onClick={save} primary />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
        {[
          ['open', `Open (${open})`],
          ['overdue', `Overdue (${overdue})`],
          ['critical', `Critical/High (${critical})`],
          ['closed', 'Closed'],
          ['all', 'All'],
        ].map(([f, lbl]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 12px',
              borderRadius: 7,
              border: `1px solid ${
                filter === f
                  ? f === 'overdue' || f === 'critical'
                    ? B.red
                    : B.teal
                  : B.border
              }`,
              background:
                filter === f
                  ? f === 'overdue' || f === 'critical'
                    ? B.redLight
                    : B.tealLight
                  : B.card,
              color:
                filter === f
                  ? f === 'overdue' || f === 'critical'
                    ? B.red
                    : B.tealDark
                  : B.muted,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '32px', color: B.faint }}>
          No items match this filter
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((ca) => {
            const pc = PRIORITY[ca.priority] || PRIORITY.medium;
            const days = daysUntil(ca.due);
            const isOverdue = !ca.closed && ca.due && days < 0;
            const isEx = ca.id?.startsWith('ex-');
            return (
              <div
                key={ca.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  padding: '11px 15px',
                  background: ca.closed
                    ? '#f8fafc'
                    : isOverdue
                    ? B.redLight
                    : B.card,
                  border: `1px solid ${
                    ca.closed ? B.border : isOverdue ? B.redBorder : B.border
                  }`,
                  borderRadius: 8,
                }}
              >
                {!isEx && (
                  <input
                    type="checkbox"
                    checked={ca.closed}
                    onChange={() => toggleCap(ca.id)}
                    style={{
                      cursor: 'pointer',
                      accentColor: B.teal,
                      flexShrink: 0,
                    }}
                  />
                )}
                {isEx && (
                  <input
                    type="checkbox"
                    checked={ca.closed}
                    disabled
                    style={{ flexShrink: 0, opacity: 0.4 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: ca.closed ? B.faint : B.text,
                      textDecoration: ca.closed ? 'line-through' : 'none',
                      fontWeight: ca.closed ? 400 : 500,
                      marginBottom: 3,
                    }}
                  >
                    {ca.item}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      fontSize: 10,
                      color: B.faint,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        background: pc.bg,
                        color: pc.color,
                        padding: '1px 6px',
                        borderRadius: 6,
                        fontWeight: 700,
                        border: `1px solid ${pc.color}30`,
                      }}
                    >
                      {pc.label}
                    </span>
                    {ca.sourceRef && <span>From: {ca.sourceRef}</span>}
                    {ca.responsible && <span>👤 {ca.responsible}</span>}
                    {ca.due && (
                      <span
                        style={{
                          color: isOverdue ? B.red : B.faint,
                          fontWeight: isOverdue ? 700 : 400,
                        }}
                      >
                        {isOverdue ? '⚠ Overdue: ' : 'Due: '}
                        {fmtDate(ca.due)}
                      </span>
                    )}
                    {ca.emapRef && (
                      <span
                        style={{
                          background: B.amberLight,
                          color: '#92400e',
                          padding: '1px 5px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        EMAP {ca.emapRef}
                      </span>
                    )}
                    {isEx && (
                      <span
                        style={{
                          background: B.purpleLight,
                          color: B.purple,
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        From exercise
                      </span>
                    )}
                  </div>
                </div>
                {!isEx && !ca.closed && (
                  <button
                    onClick={() => removeCap(ca.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    ×
                  </button>
                )}
                {ca.closed && (
                  <Tag
                    label="Closed"
                    color={B.green}
                    bg={B.greenLight}
                    border={B.greenBorder}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      <div
        style={{
          marginTop: 14,
          padding: '10px 14px',
          background: '#f8fafc',
          border: `1px solid ${B.border}`,
          borderRadius: 8,
          fontSize: 12,
          color: B.muted,
        }}
      >
        ✓ Corrective actions from all exercises are automatically pulled here.
        Standalone items can be added from real incidents, program assessments,
        or standards gaps. EMAP 4.11.3 requires a process that prioritizes and
        tracks resolution of all deficiencies.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ACTIVITY LOG
═══════════════════════════════════════════════════════ */
function ActivityLogView({ data, setData }) {
  const [note, setNote] = useState('');
  const log = data.activityLog || [];
  const MODULE_COLORS = {
    grants: B.green,
    thira: B.blue,
    cap: B.red,
    standards: B.teal,
    training: '#14b8a6',
    exercises: B.purple,
    partners: B.blue,
    plans: B.green,
    resources: B.amber,
    employees: B.indigo,
    note: B.faint,
  };
  const MODULE_LABELS = {
    grants: 'Grants',
    thira: 'THIRA',
    cap: 'CAP',
    standards: 'EMAP',
    training: 'Training',
    exercises: 'Exercises',
    partners: 'Partners',
    plans: 'Plans',
    resources: 'Resources',
    employees: 'Employees',
    note: 'Note',
  };
  const addNote = () => {
    if (!note.trim()) return;
    setData((prev) => ({
      ...prev,
      activityLog: [
        {
          id: uid(),
          ts: Date.now(),
          type: 'note',
          module: 'note',
          detail: note.trim(),
        },
        ...(prev.activityLog || []).slice(0, 199),
      ],
    }));
    setNote('');
  };
  const typeIcon = {
    created: '✦',
    updated: '◈',
    note: '📝',
    deleted: '×',
    completed: '✓',
  };
  return (
    <div style={{ padding: '28px 32px', maxWidth: 760 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.3px',
          }}
        >
          Activity Log
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
          Audit trail of program activity — supports EMAP accreditation evidence
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <FInput
          value={note}
          onChange={setNote}
          placeholder="Add a manual program note, observation, or decision record…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') addNote();
          }}
        />
        <Btn label="Log Note" onClick={addNote} primary />
      </div>
      {log.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '36px', color: B.faint }}>
          No activity recorded yet — activity is logged automatically as you use
          PLANRR, or add manual notes above
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {log.map((entry) => {
            const col = MODULE_COLORS[entry.module] || B.faint;
            const modLabel = MODULE_LABELS[entry.module] || entry.module;
            const d = new Date(entry.ts);
            const dateStr = d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = d.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  background: B.card,
                  border: `1px solid ${B.border}`,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: `${col}15`,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: col,
                    flexShrink: 0,
                    fontWeight: 700,
                  }}
                >
                  {typeIcon[entry.type] || '·'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: B.text, lineHeight: 1.5 }}>
                    {entry.detail}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginTop: 3,
                      fontSize: 10,
                      color: B.faint,
                    }}
                  >
                    <span
                      style={{
                        background: `${col}15`,
                        color: col,
                        padding: '1px 6px',
                        borderRadius: 5,
                        fontWeight: 700,
                      }}
                    >
                      {modLabel}
                    </span>
                    <span>
                      {dateStr} · {timeStr}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════════ */
function SettingsView({ data, updateData }) {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('org');
  const [form, setForm] = useState({
    orgName: data.orgName || '',
    jurisdiction: data.jurisdiction || '',
    state: data.state || '',
    address: data.address || '',
    phone: data.phone || '',
    website: data.website || '',
    emName: data.emName || '',
    emTitle: data.emTitle || '',
    emEmail: data.emEmail || '',
  });
  const [brand, setBrand] = useState({
    logoBase64: data.brand?.logoBase64 || '',
    sealBase64: data.brand?.sealBase64 || '',
    accentColor: data.brand?.accentColor || B.teal,
    headerLine1: data.brand?.headerLine1 || '',
    headerLine2: data.brand?.headerLine2 || '',
    footerDisclaimer: data.brand?.footerDisclaimer || '',
    showPoweredBy: data.brand?.showPoweredBy !== false,
    poweredByText: data.brand?.poweredByText || 'Powered by PLANRR.ai',
    reportSubtitle:
      data.brand?.reportSubtitle ||
      'Emergency Management Program — EMAP Compliance Report',
    preparedBy: data.brand?.preparedBy || '',
  });

  const logoRef = useRef();
  const sealRef = useRef();

  const readImg = (file) =>
    new Promise((res) => {
      const r = new FileReader();
      r.onload = (e) => res(e.target.result);
      r.readAsDataURL(file);
    });

  const save = () => {
    updateData((prev) => ({ ...prev, ...form, brand: { ...brand } }));
    addActivity(
      updateData,
      'updated',
      'settings',
      'Updated organization settings and branding'
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const clearData = () => {
    if (window.confirm('Clear ALL data? This cannot be undone.')) {
      localStorage.removeItem('planrr_v3');
      window.location.reload();
    }
  };

  const PRESET_COLORS = [
    '#1BC9C4',
    '#1e40af',
    '#15803d',
    '#7c3aed',
    '#dc2626',
    '#d97706',
    '#0891b2',
    '#be185d',
    '#374151',
  ];

  const tabs = [
    { id: 'org', label: 'Organization' },
    { id: 'branding', label: 'Agency Branding' },
    { id: 'export', label: 'Export Preview' },
    { id: 'system', label: 'System' },
  ];

  // Live PDF preview data
  const previewAccent = brand.accentColor || B.teal;
  const previewOrg = form.orgName || data.orgName || 'Your Organization';
  const overall = overallStats(data.standards || {});

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.3px',
          }}
        >
          Settings
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
          Organization profile, agency branding, and export configuration
        </p>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          marginBottom: 20,
          borderBottom: `1px solid ${B.border}`,
          paddingBottom: 0,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px 8px 0 0',
              border: `1px solid ${
                activeTab === t.id ? B.border : 'tranSPRent'
              }`,
              borderBottom: `1px solid ${
                activeTab === t.id ? B.card : B.border
              }`,
              background: activeTab === t.id ? B.card : 'tranSPRent',
              color: activeTab === t.id ? B.teal : B.muted,
              fontSize: 13,
              fontWeight: activeTab === t.id ? 700 : 500,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Organization ── */}
      {activeTab === 'org' && (
        <div>
          <Card style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: B.text,
                marginBottom: 14,
              }}
            >
              Organization Details
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <Label>Organization Name</Label>
                <FInput
                  value={form.orgName}
                  onChange={(v) => setForm((p) => ({ ...p, orgName: v }))}
                  placeholder="San Joaquin County OES"
                />
              </div>
              <div>
                <Label>Jurisdiction Type</Label>
                <FSel
                  value={form.jurisdiction}
                  onChange={(v) => setForm((p) => ({ ...p, jurisdiction: v }))}
                >
                  <option value="">Select…</option>
                  {[
                    'State EM Agency',
                    'County / Parish EM',
                    'Municipal EM',
                    'Tribal EM',
                    'Territorial EM',
                    'Federal Agency EM',
                    'Campus / University EM',
                    'Private Sector EM',
                    'Other',
                  ].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </FSel>
              </div>
              <div>
                <Label>State</Label>
                <FSel
                  value={form.state}
                  onChange={(v) => setForm((p) => ({ ...p, state: v }))}
                >
                  <option value="">Select…</option>
                  {US_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </FSel>
              </div>
              <div>
                <Label>Phone</Label>
                <FInput
                  value={form.phone}
                  onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                  placeholder="(209) 000-0000"
                />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <Label>Office Address</Label>
                <FInput
                  value={form.address}
                  onChange={(v) => setForm((p) => ({ ...p, address: v }))}
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <Label>Website</Label>
                <FInput
                  value={form.website}
                  onChange={(v) => setForm((p) => ({ ...p, website: v }))}
                  placeholder="https://oes.agency.gov"
                />
              </div>
            </div>
          </Card>
          <Card style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: B.text,
                marginBottom: 14,
              }}
            >
              Primary Emergency Manager
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12,
              }}
            >
              <div>
                <Label>Full Name</Label>
                <FInput
                  value={form.emName}
                  onChange={(v) => setForm((p) => ({ ...p, emName: v }))}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <Label>Title</Label>
                <FInput
                  value={form.emTitle}
                  onChange={(v) => setForm((p) => ({ ...p, emTitle: v }))}
                  placeholder="Director of Emergency Services"
                />
              </div>
              <div>
                <Label>Email</Label>
                <FInput
                  type="email"
                  value={form.emEmail}
                  onChange={(v) => setForm((p) => ({ ...p, emEmail: v }))}
                  placeholder="em@agency.gov"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Branding ── */}
      {activeTab === 'branding' && (
        <div>
          <Card style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: B.text,
                marginBottom: 4,
              }}
            >
              Agency Logo
            </div>
            <div style={{ fontSize: 12, color: B.faint, marginBottom: 14 }}>
              Appears top-left on all PDF exports and printed reports.
              Recommended: PNG or SVG, tranSPRent background, at least 200px
              wide.
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              {/* Primary logo */}
              <div>
                <Label>Primary Logo</Label>
                <div
                  style={{
                    border: `2px dashed ${B.border}`,
                    borderRadius: 10,
                    padding: '16px',
                    textAlign: 'center',
                    background: '#fafcfc',
                    minHeight: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => logoRef.current.click()}
                >
                  {brand.logoBase64 ? (
                    <>
                      <img
                        src={brand.logoBase64}
                        alt="Logo"
                        style={{
                          maxHeight: 72,
                          maxWidth: 200,
                          objectFit: 'contain',
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBrand((p) => ({ ...p, logoBase64: '' }));
                        }}
                        style={{
                          fontSize: 11,
                          color: B.red,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 22, opacity: 0.3 }}>🏛</div>
                      <div style={{ fontSize: 12, color: B.faint }}>
                        Click to upload logo
                      </div>
                      <div style={{ fontSize: 10, color: '#d1d8db' }}>
                        PNG, SVG, JPG
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    if (e.target.files[0]) {
                      const b64 = await readImg(e.target.files[0]);
                      setBrand((p) => ({ ...p, logoBase64: b64 }));
                    }
                  }}
                />
              </div>
              {/* Seal / secondary */}
              <div>
                <Label>Department Seal (optional)</Label>
                <div
                  style={{
                    border: `2px dashed ${B.border}`,
                    borderRadius: 10,
                    padding: '16px',
                    textAlign: 'center',
                    background: '#fafcfc',
                    minHeight: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => sealRef.current.click()}
                >
                  {brand.sealBase64 ? (
                    <>
                      <img
                        src={brand.sealBase64}
                        alt="Seal"
                        style={{
                          maxHeight: 72,
                          maxWidth: 100,
                          objectFit: 'contain',
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBrand((p) => ({ ...p, sealBase64: '' }));
                        }}
                        style={{
                          fontSize: 11,
                          color: B.red,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 22, opacity: 0.3 }}>⚜</div>
                      <div style={{ fontSize: 12, color: B.faint }}>
                        County seal / agency badge
                      </div>
                      <div style={{ fontSize: 10, color: '#d1d8db' }}>
                        Appears on cover page
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={sealRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    if (e.target.files[0]) {
                      const b64 = await readImg(e.target.files[0]);
                      setBrand((p) => ({ ...p, sealBase64: b64 }));
                    }
                  }}
                />
              </div>
            </div>
          </Card>

          <Card style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: B.text,
                marginBottom: 4,
              }}
            >
              Agency Accent Color
            </div>
            <div style={{ fontSize: 12, color: B.faint, marginBottom: 14 }}>
              Used for report header bars, section dividers, and table headers.
              Replaces PLANRR teal on your exports.
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setBrand((p) => ({ ...p, accentColor: c }))}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: c,
                    border: `2px solid ${
                      brand.accentColor === c ? '#111' : 'tranSPRent'
                    }`,
                    cursor: 'pointer',
                    boxShadow:
                      brand.accentColor === c
                        ? '0 0 0 2px white, 0 0 0 4px ' + c
                        : 'none',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginLeft: 4,
                }}
              >
                <span style={{ fontSize: 12, color: B.faint }}>Custom:</span>
                <input
                  type="color"
                  value={brand.accentColor}
                  onChange={(e) =>
                    setBrand((p) => ({ ...p, accentColor: e.target.value }))
                  }
                  style={{
                    width: 40,
                    height: 32,
                    borderRadius: 6,
                    border: `1px solid ${B.border}`,
                    cursor: 'pointer',
                    padding: 2,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: B.muted,
                    fontFamily: 'monospace',
                  }}
                >
                  {brand.accentColor}
                </span>
              </div>
              <button
                onClick={() => setBrand((p) => ({ ...p, accentColor: B.teal }))}
                style={{
                  fontSize: 11,
                  color: B.faint,
                  background: 'none',
                  border: `1px solid ${B.border}`,
                  borderRadius: 6,
                  padding: '5px 9px',
                  cursor: 'pointer',
                }}
              >
                Reset to PLANRR teal
              </button>
            </div>
          </Card>

          <Card style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: B.text,
                marginBottom: 4,
              }}
            >
              Document Header & Footer
            </div>
            <div style={{ fontSize: 12, color: B.faint, marginBottom: 14 }}>
              Text printed at the top and bottom of every exported page.
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <Label>Header Line 1 (large)</Label>
                <FInput
                  value={brand.headerLine1}
                  onChange={(v) => setBrand((p) => ({ ...p, headerLine1: v }))}
                  placeholder={`${form.orgName || 'Your Organization'}`}
                />
              </div>
              <div>
                <Label>Header Line 2 (small)</Label>
                <FInput
                  value={brand.headerLine2}
                  onChange={(v) => setBrand((p) => ({ ...p, headerLine2: v }))}
                  placeholder="Office of Emergency Services"
                />
              </div>
              <div>
                <Label>Report Subtitle</Label>
                <FInput
                  value={brand.reportSubtitle}
                  onChange={(v) =>
                    setBrand((p) => ({ ...p, reportSubtitle: v }))
                  }
                  placeholder="Emergency Management Program — EMAP Compliance Report"
                />
              </div>
              <div>
                <Label>Prepared By</Label>
                <FInput
                  value={brand.preparedBy}
                  onChange={(v) => setBrand((p) => ({ ...p, preparedBy: v }))}
                  placeholder={form.emName || 'Director of Emergency Services'}
                />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <Label>Footer Disclaimer (optional)</Label>
                <FInput
                  value={brand.footerDisclaimer}
                  onChange={(v) =>
                    setBrand((p) => ({ ...p, footerDisclaimer: v }))
                  }
                  placeholder="This document is prepared for official use. Distribution subject to agency records policy."
                />
              </div>
            </div>
            <div
              style={{
                padding: '12px 14px',
                background: '#f8fafc',
                border: `1px solid ${B.border}`,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: B.muted,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                PLANRR Attribution
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    cursor: 'pointer',
                    fontSize: 13,
                    color: B.text,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={brand.showPoweredBy}
                    onChange={(e) =>
                      setBrand((p) => ({
                        ...p,
                        showPoweredBy: e.target.checked,
                      }))
                    }
                    style={{ accentColor: B.teal, cursor: 'pointer' }}
                  />
                  Show attribution on exports
                </label>
                {brand.showPoweredBy && (
                  <div style={{ flex: 1 }}>
                    <FInput
                      value={brand.poweredByText}
                      onChange={(v) =>
                        setBrand((p) => ({ ...p, poweredByText: v }))
                      }
                      placeholder="Powered by PLANRR.ai"
                      style={{ fontSize: 12 }}
                    />
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: B.faint, marginTop: 7 }}>
                Appears in small gray text in the bottom-right footer of every
                exported page — like a "Prepared using…" credit. Professional
                and unobtrusive.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Export Preview ── */}
      {activeTab === 'export' && (
        <div>
          <div style={{ fontSize: 13, color: B.muted, marginBottom: 14 }}>
            This is how your PDF export cover page and report headers will look
            with your current branding settings.
          </div>

          {/* Cover page preview */}
          <div
            style={{
              border: `1px solid ${B.border}`,
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            {/* Cover header bar */}
            <div
              style={{
                background: previewAccent,
                padding: '28px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {brand.logoBase64 ? (
                  <img
                    src={brand.logoBase64}
                    alt="Logo"
                    style={{
                      height: 52,
                      maxWidth: 160,
                      objectFit: 'contain',
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: 'rgba(255,255,255,0.25)',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    🏛
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: '#fff',
                      lineHeight: 1.2,
                    }}
                  >
                    {brand.headerLine1 || previewOrg}
                  </div>
                  {brand.headerLine2 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.8)',
                        marginTop: 3,
                      }}
                    >
                      {brand.headerLine2}
                    </div>
                  )}
                </div>
              </div>
              {brand.sealBase64 && (
                <img
                  src={brand.sealBase64}
                  alt="Seal"
                  style={{
                    height: 60,
                    width: 60,
                    objectFit: 'contain',
                    opacity: 0.9,
                  }}
                />
              )}
            </div>

            {/* Cover body */}
            <div style={{ padding: '36px 32px', background: B.card }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: B.faint,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: 8,
                  }}
                >
                  Official Program Document
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: B.text,
                    marginBottom: 6,
                  }}
                >
                  {brand.reportSubtitle ||
                    'Emergency Management Program — EMAP Compliance Report'}
                </div>
                <div style={{ fontSize: 13, color: B.faint }}>
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {[
                  { l: 'EMAP Standard', v: 'EMS 5-2022' },
                  {
                    l: 'Sections Compliant',
                    v: `${overallStats(data.standards || {}).compliant} / 73`,
                  },
                  {
                    l: 'Prepared By',
                    v: brand.preparedBy || form.emName || form.emTitle || '—',
                  },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      background: '#f8fafc',
                      borderRadius: 8,
                      padding: '12px 14px',
                      textAlign: 'center',
                      border: `1px solid ${B.border}`,
                    }}
                  >
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: B.text }}
                    >
                      {s.v}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: B.faint,
                        marginTop: 3,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
              {/* Section header preview */}
              <div
                style={{
                  fontSize: 11,
                  color: B.faint,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Section header style
              </div>
              <div
                style={{
                  background: previewAccent,
                  borderRadius: '6px 6px 0 0',
                  padding: '8px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                  EMAP Section 4.1 — Hazard Identification & Risk Assessment
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>
                  2 / 3 compliant
                </span>
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '0 0 6px 6px',
                  padding: '10px 14px',
                  border: `1px solid ${B.border}`,
                  borderTop: 'none',
                  fontSize: 12,
                  color: B.muted,
                }}
              >
                Standard rows and evidence documentation appear here…
              </div>
            </div>

            {/* Footer preview */}
            <div
              style={{
                background: '#f8fafc',
                borderTop: `1px solid ${B.border}`,
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                {brand.footerDisclaimer || `${previewOrg} · EMAP EMS 5-2022`}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span>Page 1</span>
                {brand.showPoweredBy && (
                  <span style={{ opacity: 0.6 }}>
                    {brand.poweredByText || 'Powered by PLANRR.ai'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              background: B.tealLight,
              border: `1px solid ${B.tealBorder}`,
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 12,
              color: B.tealDark,
            }}
          >
            ✓ This preview reflects your current branding settings. Go to the{' '}
            <strong>Branding</strong> tab to change logos, colors, or text. Use
            the <strong>Print Report</strong> button in Reports to export with
            this branding applied.
          </div>
        </div>
      )}

      {/* ── System ── */}
      {activeTab === 'system' && (
        <div>
          <Card style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: B.text,
                marginBottom: 10,
              }}
            >
              PLANRR
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 12,
              }}
            >
              {[
                { l: 'Version', v: 'PLANRR v2.0' },
                { l: 'EMAP Standard', v: 'EMS 5-2022' },
                { l: 'Standards Loaded', v: '73' },
                { l: 'Data Location', v: 'Browser Storage' },
              ].map((s) => (
                <div
                  key={s.l}
                  style={{
                    background: '#f8fafc',
                    borderRadius: 7,
                    padding: '10px 12px',
                    border: `1px solid ${B.border}`,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: B.text }}>
                    {s.v}
                  </div>
                  <div style={{ fontSize: 10, color: B.faint, marginTop: 2 }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 12,
                color: B.muted,
                padding: '10px 12px',
                background: '#f0fafa',
                border: `1px solid ${B.tealBorder}`,
                borderRadius: 7,
              }}
            >
              Data is saved locally in your browser. For multi-user access, team
              collaboration, and cloud backup connect to a Supabase backend —
              ask your developer to wire up the API.
            </div>
          </Card>
          <Card style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: B.text,
                marginBottom: 10,
              }}
            >
              Data Management
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Btn
                label="Export All Data (JSON)"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(
                    new Blob([JSON.stringify(data, null, 2)], {
                      type: 'application/json',
                    })
                  );
                  a.download = `planrr-export-${today()}.json`;
                  a.click();
                }}
              />
              <Btn
                label="Import JSON"
                onClick={() => {
                  const inp = document.createElement('input');
                  inp.type = 'file';
                  inp.accept = '.json';
                  inp.onchange = async (e) => {
                    try {
                      const txt = await e.target.files[0].text();
                      const d = JSON.parse(txt);
                      if (d.orgName) updateData(d);
                    } catch {
                      alert('Invalid PLANRR export file.');
                    }
                  };
                  inp.click();
                }}
              />
            </div>
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid ${B.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: B.red,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Danger Zone
              </div>
              <Btn label="Clear All Data" onClick={clearData} danger small />
              <div style={{ fontSize: 11, color: B.faint, marginTop: 5 }}>
                This permanently deletes all program data from this browser.
                Cannot be undone.
              </div>
            </div>
          </Card>
        </div>
      )}

      <div
        style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}
      >
        <Btn
          label={saved ? '✓ Saved!' : 'Save All Settings'}
          onClick={save}
          primary
        />
        {saved && (
          <span style={{ fontSize: 12, color: B.green }}>
            All settings saved successfully
          </span>
        )}
      </div>
    </div>
  );
}

function Dashboard({ data, setView, orgName }) {
  const { training, exercises, partners, plans, resources } = data;
  const overall = useMemo(
    () => overallStats(data.standards || {}),
    [data.standards]
  );
  const animated = useCountUp(overall.pct);
  const r = 52,
    circ = 2 * Math.PI * r,
    dash = (overall.pct / 100) * circ;
  const compliantSections = ALL_SECTIONS.filter(
    (s) => sectionAggStatus(s, data.standards || {}) === 'compliant'
  ).length;
  const notifications = buildNotifications(data);
  const empCount = (data.employees || []).length;
  const credExpiring = (data.employees || []).reduce(
    (a, e) =>
      a +
      (e.credentials || []).filter((c) => {
        const d = daysUntil(c.expires);
        return d !== null && d < 60;
      }).length,
    0
  );
  const activeGrants = (data.grants || []).filter((g) => g.status === 'active');
  const grantTotal = activeGrants.reduce(
    (a, g) => a + parseFloat(g.amount || 0),
    0
  );
  const openCAs =
    (data.capItems || []).filter((c) => !c.closed).length +
    (exercises || []).reduce(
      (a, e) => a + (e.corrective || []).filter((c) => !c.closed).length,
      0
    );
  const hazardCount = (data.thira?.hazards || []).length;

  // Program readiness checklist
  const checklist = [
    {
      label: 'Organization profile complete',
      done: !!(data.orgName && data.state && data.emName),
      module: 'settings',
    },
    {
      label: 'THIRA hazard profile built',
      done: hazardCount >= 3,
      module: 'thira',
      note: `${hazardCount} hazard${hazardCount !== 1 ? 's' : ''} profiled`,
    },
    {
      label: 'EOP in plan library',
      done: plans.some((p) => p.type === 'EOP'),
      module: 'plans',
    },
    {
      label: 'COOP plan on file',
      done: plans.some((p) => p.type === 'COOP'),
      module: 'plans',
    },
    {
      label: 'Annual exercise completed',
      done: exercises.some(
        (e) => e.date && daysUntil(e.date) > -365 && e.status !== 'planned'
      ),
      module: 'exercises',
    },
    {
      label: 'AAR on file for last exercise',
      done: exercises.some((e) => e.aarFinal),
      module: 'exercises',
    },
    {
      label: 'Training records entered',
      done: training.length >= 5,
      module: 'training',
      note: `${training.length} records`,
    },
    {
      label: 'Active MOUs / partner agreements',
      done:
        partners.filter((p) => !p.expires || daysUntil(p.expires) > 0).length >=
        3,
      module: 'partners',
      note: `${
        partners.filter((p) => !p.expires || daysUntil(p.expires) > 0).length
      } active`,
    },
    {
      label: 'Personnel roster entered',
      done: empCount >= 1,
      module: 'employees',
      note: `${empCount} personnel`,
    },
    {
      label: 'Grant funding tracked',
      done: activeGrants.length >= 1,
      module: 'grants',
      note: `${activeGrants.length} active grant${
        activeGrants.length !== 1 ? 's' : ''
      }`,
    },
    {
      label: 'Open corrective actions addressed',
      done: openCAs === 0,
      module: 'cap',
      note: openCAs > 0 ? `${openCAs} open` : undefined,
    },
    {
      label: 'EMAP standards >25% compliant',
      done: overall.pct >= 25,
      module: 'accreditation',
      note: `${overall.pct}%`,
    },
  ];
  const checkDone = checklist.filter((c) => c.done).length;
  const checkPct = Math.round((checkDone / checklist.length) * 100);

  const modules = [
    {
      id: 'accreditation',
      label: 'EMAP Standards',
      count: overall.pct + '%',
      sub: `${compliantSections}/17 sections`,
      color: B.teal,
      bg: B.tealLight,
      icon: '★',
    },
    {
      id: 'exercises',
      label: 'Exercises',
      count: exercises.length,
      sub: `${exercises.filter((e) => e.aarFinal).length} with final AAR`,
      color: B.purple,
      bg: B.purpleLight,
      icon: '◎',
    },
    {
      id: 'grants',
      label: 'Active Grants',
      count: activeGrants.length,
      sub: `$${grantTotal.toLocaleString()} awarded`,
      color: B.green,
      bg: B.greenLight,
      icon: '$',
    },
    {
      id: 'partners',
      label: 'Agreements',
      count: partners.length,
      sub: `${
        partners.filter((p) => !p.expires || daysUntil(p.expires) > 0).length
      } active`,
      color: B.blue,
      bg: B.blueLight,
      icon: '⊕',
    },
    {
      id: 'employees',
      label: 'Personnel',
      count: empCount,
      sub:
        credExpiring > 0
          ? `⚠ ${credExpiring} creds expiring`
          : 'credentials current',
      color: B.indigo,
      bg: B.indigoLight,
      icon: '👥',
    },
    {
      id: 'cap',
      label: 'Open CAs',
      count: openCAs,
      sub: openCAs === 0 ? 'all corrective actions closed' : 'need resolution',
      color: openCAs > 0 ? B.red : B.green,
      bg: openCAs > 0 ? B.redLight : B.greenLight,
      icon: '⚠',
    },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1120 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.4px',
          }}
        >
          Program Health
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
          {orgName || 'Your organization'} · EMAP EMS 5-2022 ·{' '}
          {data.state || ''}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr 280px',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* EMAP donut */}
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg,#f0fafa,#fff)`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: B.faint,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 10,
              fontWeight: 700,
            }}
          >
            EMAP Compliance
          </div>
          <svg width={124} height={124} viewBox="0 0 124 124">
            <circle
              cx={62}
              cy={62}
              r={r}
              fill="none"
              stroke="#edf2f4"
              strokeWidth={10}
            />
            <circle
              cx={62}
              cy={62}
              r={r}
              fill="none"
              stroke={
                overall.pct > 79 ? B.green : overall.pct > 49 ? B.teal : B.amber
              }
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`}
              transform="rotate(-90 62 62)"
              style={{ transition: 'stroke-dasharray 1.2s ease' }}
            />
            <text
              x={62}
              y={58}
              textAnchor="middle"
              fill={B.text}
              fontSize={24}
              fontWeight="800"
              fontFamily="'DM Sans',sans-serif"
            >
              {animated}%
            </text>
            <text
              x={62}
              y={74}
              textAnchor="middle"
              fill={B.faint}
              fontSize={9}
              fontFamily="'DM Sans',sans-serif"
            >
              {overall.compliant}/{overall.total} standards
            </text>
          </svg>
          <div style={{ fontSize: 10, color: B.faint, marginTop: 4 }}>
            {compliantSections}/17 sections complete
          </div>
        </Card>

        {/* Notifications */}
        <div>
          {notifications.length === 0 ? (
            <Card
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: B.greenLight,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: B.green,
                  fontSize: 18,
                }}
              >
                ✓
              </div>
              <div style={{ color: B.faint, fontSize: 13 }}>
                No items require attention
              </div>
            </Card>
          ) : (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: B.red,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                }}
              >
                ⚠ {notifications.length} item
                {notifications.length > 1 ? 's' : ''} require attention
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setView(n.module)}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      background: B.card,
                      border: `1px solid ${
                        n.urgency === 'ok'
                          ? B.border
                          : n.urgency === 'soon'
                          ? B.amberBorder
                          : B.redBorder
                      }`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = B.teal)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor =
                        n.urgency === 'ok'
                          ? B.border
                          : n.urgency === 'soon'
                          ? B.amberBorder
                          : B.redBorder)
                    }
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background:
                          n.urgency === 'ok'
                            ? B.green
                            : n.urgency === 'soon'
                            ? B.amber
                            : B.red,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{ fontSize: 12, fontWeight: 600, color: B.text }}
                      >
                        {n.title}
                      </div>
                      <div style={{ fontSize: 11, color: B.faint }}>
                        {n.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Readiness checklist */}
        <Card
          style={{
            background: `linear-gradient(135deg,${B.sidebar}f8,${B.sidebar})`,
            borderColor: B.sidebarBorder,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Program Readiness
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color:
                  checkPct > 79 ? B.green : checkPct > 49 ? B.teal : B.amber,
              }}
            >
              {checkPct}%
            </div>
          </div>
          <div
            style={{
              height: 3,
              background: '#2E3439',
              borderRadius: 2,
              marginBottom: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${checkPct}%`,
                background: checkPct > 79 ? B.green : B.teal,
                borderRadius: 2,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {checklist.map((c, i) => (
              <div
                key={i}
                onClick={() => setView(c.module)}
                style={{
                  display: 'flex',
                  gap: 7,
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '3px 4px',
                  borderRadius: 5,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'tranSPRent')
                }
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: c.done ? '#10b981' : '#2E3439',
                    border: `1px solid ${c.done ? '#10b981' : '#374151'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 9,
                    color: '#fff',
                    fontWeight: 800,
                  }}
                >
                  {c.done ? '✓' : ''}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 11,
                    color: c.done ? '#6ee7b7' : '#94a3b8',
                    textDecoration: c.done ? 'none' : 'none',
                  }}
                >
                  {c.label}
                </span>
                {c.note && (
                  <span
                    style={{
                      fontSize: 9,
                      color: c.done ? '#34d399' : '#64748b',
                    }}
                  >
                    {c.note}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 10,
              color: '#475569',
              textAlign: 'center',
            }}
          >
            {checkDone}/{checklist.length} items complete — click any to jump
            there
          </div>
        </Card>
      </div>

      {/* Module cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {modules.map((m) => (
          <div
            key={m.id}
            onClick={() => setView(m.id)}
            style={{
              background: B.card,
              border: `1px solid ${B.border}`,
              borderRadius: 10,
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = m.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${m.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = B.border;
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: m.bg,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  color: m.color,
                }}
              >
                {m.icon}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: m.color,
                  lineHeight: 1,
                }}
              >
                {m.count}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: B.text,
                marginTop: 10,
              }}
            >
              {m.label}
            </div>
            <div style={{ fontSize: 11, color: B.faint, marginTop: 2 }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* EMAP section progress + recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: B.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            EMAP by Section
          </div>
          {ALL_SECTIONS.slice(0, 10).map((sec) => {
            const stats = sectionStats(sec, data.standards || {});
            return (
              <div
                key={sec.id}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: sec.chapter.color,
                    background: `${sec.chapter.color}15`,
                    padding: '1px 5px',
                    borderRadius: 3,
                    minWidth: 26,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {sec.id}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: '#edf2f4',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${stats.pct}%`,
                      background:
                        stats.pct === 100
                          ? B.green
                          : stats.pct > 0
                          ? B.teal
                          : B.border,
                      borderRadius: 2,
                      transition: 'width 0.8s ease',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 9,
                    color: B.faint,
                    minWidth: 28,
                    textAlign: 'right',
                  }}
                >
                  {stats.pct}%
                </span>
              </div>
            );
          })}
        </Card>
        <Card>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: B.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            Recent Activity
          </div>
          {(data.activityLog || []).slice(0, 8).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(data.activityLog || []).slice(0, 8).map((e, i) => {
                const col =
                  {
                    grants: B.green,
                    thira: B.blue,
                    cap: B.red,
                    standards: B.teal,
                    training: '#14b8a6',
                    exercises: B.purple,
                    partners: B.blue,
                    plans: B.green,
                    note: B.faint,
                  }[e.module] || B.faint;
                return (
                  <div
                    key={e.id}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      paddingBottom: 6,
                      borderBottom: i < 7 ? `1px solid #f4f8f9` : 'none',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: col,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: B.muted,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {e.detail}
                    </span>
                    <span
                      style={{ fontSize: 10, color: B.faint, flexShrink: 0 }}
                    >
                      {timeAgo(e.ts)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                color: B.faint,
                fontSize: 13,
                textAlign: 'center',
                padding: '12px 0',
              }}
            >
              No activity yet — start using PLANRR to see your activity here
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
/* ═══════════════════════════════════════════════════════
   BULK DOCUMENT INTAKE
═══════════════════════════════════════════════════════ */
function BulkIntake({ data, updateData }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const inputRef = useRef();
  const readFileData = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      if (file.type === 'application/pdf') {
        r.onload = (e) =>
          res({
            type: 'pdf',
            data: e.target.result.split(',')[1],
            name: file.name,
            size: file.size,
          });
        r.readAsDataURL(file);
      } else if (file.type.startsWith('image/')) {
        r.onload = (e) =>
          res({
            type: 'image',
            mimeType: file.type,
            data: e.target.result.split(',')[1],
            name: file.name,
            size: file.size,
          });
        r.readAsDataURL(file);
      } else {
        r.onload = (e) =>
          res({
            type: 'text',
            data: e.target.result.slice(0, 12000),
            name: file.name,
            size: file.size,
          });
        r.readAsText(file);
      }
      r.onerror = rej;
    });
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setFiles((p) => [
      ...p,
      ...Array.from(e.dataTransfer.files).filter(
        (f) => f.size < 20 * 1024 * 1024
      ),
    ]);
  };
  const fmtSz = (b) =>
    b < 1024
      ? b + 'B'
      : b < 1048576
      ? (b / 1024).toFixed(1) + 'KB'
      : (b / 1048576).toFixed(1) + 'MB';
  const processAll = async () => {
    if (!files.length) return;
    setProcessing(true);
    setResults([]);
    setDone(false);
    const processed = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile({ name: file.name, index: i, total: files.length });
      const result = {
        id: uid(),
        name: file.name,
        size: file.size,
        status: 'analyzing',
        mappings: [],
        error: null,
      };
      setResults((p) => [...p, result]);
      try {
        const fd = await readFileData(file);
        const content = [];
        const prompt = `Analyze this document and map it to EMAP EMS 5-2022 standards for PLANRR.\nDocument: "${file.name}"\nReturn ONLY valid JSON, no other text:\n{"docType":"brief description","mappings":[{"stdId":"3.1.1","confidence":85,"status":"compliant","reason":"One sentence explanation"}]}\nMap to every relevant standard. Status options: compliant, in_progress, needs_review.`;
        if (fd.type === 'pdf') {
          content.push({
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: fd.data,
            },
          });
          content.push({ type: 'text', text: prompt });
        } else if (fd.type === 'image') {
          content.push({
            type: 'image',
            source: { type: 'base64', media_type: fd.mimeType, data: fd.data },
          });
          content.push({ type: 'text', text: prompt });
        } else {
          content.push({
            type: 'text',
            text: `Document:\n${fd.data}\n\n${prompt}`,
          });
        }
        const res = await fetch(
          'https://ltnbvwnhtsaebyslbhil.supabase.co/functions/v1/super-endpoint',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operation: 'bulk_intake',
              content,
              max_tokens: 1200,
            }),
          }
        );
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        const parsed = JSON.parse(
          (json.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim()
        );
        const mappings = (parsed.mappings || []).filter(
          (m) => m.stdId && ALL_STANDARDS.find((s) => s.id === m.stdId)
        );
        const done_result = {
          ...result,
          status: 'done',
          docType: parsed.docType || 'Document',
          mappings,
        };
        setResults((p) => p.map((r) => (r.id === result.id ? done_result : r)));
        processed.push(done_result);
      } catch (e) {
        const err_result = {
          ...result,
          status: 'error',
          error: e.message || 'Analysis failed',
        };
        setResults((p) => p.map((r) => (r.id === result.id ? err_result : r)));
        processed.push(err_result);
      }
    }
    // Apply all mappings to standards
    updateData((prev) => {
      const stds = { ...prev.standards };
      const priority = {
        compliant: 3,
        in_progress: 2,
        needs_review: 1,
        not_started: 0,
      };
      processed.forEach((docResult) => {
        if (docResult.status !== 'done') return;
        docResult.mappings.forEach((m) => {
          const cur = stds[m.stdId] || initRecord();
          const curPri = priority[cur.status] || 0;
          const newPri = priority[m.status] || 0;
          const newDoc = {
            id: uid(),
            name: docResult.name,
            size: docResult.size,
            uploadedAt: Date.now(),
            confidence: m.confidence,
            analysis: m.reason,
            suggestedStatus: m.status,
            analyzed: true,
          };
          stds[m.stdId] = {
            ...cur,
            docs: [...(cur.docs || []), newDoc],
            status: newPri > curPri ? m.status : cur.status,
            notes:
              cur.notes || `[Auto-mapped from "${docResult.name}"] ${m.reason}`,
            updatedAt: Date.now(),
          };
        });
      });
      return { ...prev, standards: stds };
    });
    addActivity(
      updateData,
      'created',
      'bulk_intake',
      `Bulk intake: ${processed.length} documents analyzed, ${
        [...new Set(processed.flatMap((r) => r.mappings.map((m) => m.stdId)))]
          .length
      } standards updated`
    );
    setCurrentFile(null);
    setProcessing(false);
    setDone(true);
  };
  const totalMappings = results.reduce((a, r) => a + r.mappings.length, 0);
  const stdsMapped = [
    ...new Set(results.flatMap((r) => r.mappings.map((m) => m.stdId))),
  ];
  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.3px',
          }}
        >
          Bulk Document Intake
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
          Drop your existing EM documents — AI reads each one and automatically
          maps it to EMAP standards, updating compliance status across your
          program.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          ['1', 'Drop files', 'PDF, Word, images, text files'],
          ['2', 'AI analyzes', 'Matched against all 73 EMAP standards'],
          ['3', 'Status updates', 'Compliance auto-advances by confidence'],
          ['4', 'Evidence attached', 'Docs linked to each matched standard'],
        ].map(([n, t, d]) => (
          <div
            key={n}
            style={{
              background: B.card,
              border: `1px solid ${B.border}`,
              borderRadius: 9,
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                background: B.tealLight,
                border: `1px solid ${B.tealBorder}`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                color: B.tealDark,
                marginBottom: 8,
              }}
            >
              {n}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: B.text,
                marginBottom: 3,
              }}
            >
              {t}
            </div>
            <div style={{ fontSize: 11, color: B.faint, lineHeight: 1.5 }}>
              {d}
            </div>
          </div>
        ))}
      </div>
      {!processing && !done && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            style={{
              border: `2px dashed ${dragging ? B.teal : B.border}`,
              borderRadius: 12,
              padding: '40px 32px',
              textAlign: 'center',
              background: dragging ? B.tealLight : '#fafcfc',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>
              📂
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: B.text,
                marginBottom: 6,
              }}
            >
              Drop your EM documents here
            </div>
            <div style={{ fontSize: 13, color: B.faint, marginBottom: 4 }}>
              EOPs, COOPs, training records, exercise AARs, MOUs, hazard plans,
              policies, procedures
            </div>
            <div style={{ fontSize: 11, color: '#d1d8db' }}>
              PDF · Word · Text · Images · Max 20MB per file
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={(e) =>
                setFiles((p) => [...p, ...Array.from(e.target.files)])
              }
            />
          </div>
          {files.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: B.text,
                  marginBottom: 8,
                }}
              >
                {files.length} file{files.length > 1 ? 's' : ''} ready to
                analyze
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  maxHeight: 200,
                  overflowY: 'auto',
                  marginBottom: 12,
                }}
              >
                {files.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: B.card,
                      border: `1px solid ${B.border}`,
                      borderRadius: 7,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>
                      {f.name.endsWith('.pdf')
                        ? '📕'
                        : f.name.match(/\.(jpg|jpeg|png)$/)
                        ? '🖼️'
                        : '📄'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{ fontSize: 12, fontWeight: 600, color: B.text }}
                      >
                        {f.name}
                      </div>
                      <div style={{ fontSize: 10, color: B.faint }}>
                        {fmtSz(f.size)}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setFiles((p) => p.filter((_, idx) => idx !== i))
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        cursor: 'pointer',
                        fontSize: 15,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={processAll}
                  style={{
                    background: B.teal,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '11px 22px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <BrainIcon size={15} color="#fff" strokeWidth={1.4} />
                  Analyze & Map to EMAP ({files.length} file
                  {files.length > 1 ? 's' : ''})
                </button>
                <Btn label="Clear All" onClick={() => setFiles([])} />
              </div>
            </div>
          )}
        </>
      )}
      {processing && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              background: B.tealLight,
              border: `1px solid ${B.tealBorder}`,
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 7,
              }}
            >
              <span
                style={{
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block',
                  fontSize: 15,
                }}
              >
                ⟳
              </span>
              <span
                style={{ fontSize: 13, fontWeight: 700, color: B.tealDark }}
              >
                {currentFile
                  ? `Analyzing "${currentFile.name}" (${
                      currentFile.index + 1
                    }/${currentFile.total})…`
                  : 'Processing…'}
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: '#9EECEA',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: currentFile
                    ? `${(currentFile.index / currentFile.total) * 100}%`
                    : '0%',
                  background: B.teal,
                  borderRadius: 2,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
          {results.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '8px 12px',
                background: B.card,
                border: `1px solid ${B.border}`,
                borderRadius: 7,
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 13 }}>
                {r.status === 'analyzing'
                  ? '⟳'
                  : r.status === 'done'
                  ? '✓'
                  : '✕'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: B.text }}>
                  {r.name}
                </div>
                {r.status === 'done' && (
                  <div style={{ fontSize: 11, color: B.green }}>
                    {r.mappings.length} standard
                    {r.mappings.length !== 1 ? 's' : ''} matched
                  </div>
                )}
                {r.status === 'error' && (
                  <div style={{ fontSize: 11, color: B.red }}>{r.error}</div>
                )}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color:
                    r.status === 'done'
                      ? B.green
                      : r.status === 'error'
                      ? B.red
                      : B.faint,
                }}
              >
                {r.status === 'analyzing'
                  ? 'Analyzing…'
                  : r.status === 'done'
                  ? 'Done'
                  : 'Error'}
              </span>
            </div>
          ))}
        </div>
      )}
      {done && (
        <div>
          <div
            style={{
              background: B.greenLight,
              border: `1px solid ${B.greenBorder}`,
              borderRadius: 10,
              padding: '16px 20px',
              marginBottom: 14,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: B.green,
                borderRadius: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: B.green,
                  marginBottom: 2,
                }}
              >
                Intake complete — {stdsMapped.length} standards updated
              </div>
              <div style={{ fontSize: 12, color: '#065f46' }}>
                {results.filter((r) => r.status === 'done').length}/
                {results.length} documents analyzed · {totalMappings} total
                mappings · Evidence attached and compliance status updated
              </div>
            </div>
            <Btn
              label="Run Again"
              onClick={() => {
                setFiles([]);
                setResults([]);
                setDone(false);
              }}
              small
            />
          </div>
          {results.map((r) => (
            <div
              key={r.id}
              style={{
                background: B.card,
                border: `1px solid ${
                  r.status === 'error' ? B.redBorder : B.border
                }`,
                borderRadius: 9,
                marginBottom: 7,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  background: '#fafcfc',
                  borderBottom:
                    r.mappings.length > 0 ? `1px solid ${B.border}` : 'none',
                }}
              >
                <span style={{ fontSize: 13 }}>
                  {r.name.endsWith('.pdf')
                    ? '📕'
                    : r.name.match(/\.(jpg|jpeg|png)$/)
                    ? '🖼️'
                    : '📄'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: B.text }}>
                    {r.name}
                  </div>
                  {r.docType && (
                    <div style={{ fontSize: 10, color: B.faint }}>
                      {r.docType}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: r.status === 'error' ? B.red : B.green,
                  }}
                >
                  {r.status === 'error'
                    ? 'Error'
                    : `${r.mappings.length} matched`}
                </span>
              </div>
              {r.mappings.length > 0 && (
                <div
                  style={{
                    padding: '9px 14px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 5,
                  }}
                >
                  {r.mappings.map((m) => {
                    const sc = ST[m.status] || ST.not_started;
                    return (
                      <div
                        key={m.stdId}
                        style={{
                          display: 'flex',
                          gap: 5,
                          alignItems: 'center',
                          background: sc.bg,
                          border: `1px solid ${sc.border}`,
                          borderRadius: 5,
                          padding: '3px 8px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            color: '#92400e',
                            background: B.amberLight,
                            padding: '1px 4px',
                            borderRadius: 3,
                          }}
                        >
                          {m.stdId}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: sc.color,
                            fontWeight: 600,
                          }}
                        >
                          {m.confidence}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {!files.length && !processing && !done && (
        <div
          style={{
            background: B.card,
            border: `1px solid ${B.border}`,
            borderRadius: 10,
            padding: '18px 20px',
            fontSize: 12,
            color: B.muted,
            lineHeight: 1.8,
          }}
        >
          <strong style={{ color: B.text }}>What to drop in:</strong> Your EOP,
          COOP, Hazard Mitigation Plan, training certificates, exercise AARs,
          MOUs, communications plan, resource inventory, org charts, policies —
          any document that demonstrates EMAP compliance. The AI reads each one
          and maps it to the right standards automatically.
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   GLOBAL SEARCH
═══════════════════════════════════════════════════════ */
function GlobalSearch({ data, setView, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef();
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const hits = [];
    ALL_STANDARDS.forEach((s) => {
      const rec = data.standards?.[s.id] || {};
      if (
        s.id.toLowerCase().includes(q) ||
        s.text.toLowerCase().includes(q) ||
        s.section.title.toLowerCase().includes(q)
      )
        hits.push({
          type: 'standard',
          id: s.id,
          label: `${s.id} — ${s.section.title}`,
          sub: s.text.slice(0, 80) + '…',
          status: rec.status,
          module: 'accreditation',
          icon: '★',
          color: B.teal,
        });
    });
    data.training.forEach((t) => {
      if (
        t.person?.toLowerCase().includes(q) ||
        t.type?.toLowerCase().includes(q)
      )
        hits.push({
          type: 'training',
          id: t.id,
          label: t.person,
          sub: `${t.type} · ${fmtDate(t.date)}`,
          module: 'training',
          icon: '◉',
          color: '#14b8a6',
        });
    });
    data.exercises.forEach((e) => {
      if (
        e.name?.toLowerCase().includes(q) ||
        e.type?.toLowerCase().includes(q)
      )
        hits.push({
          type: 'exercise',
          id: e.id,
          label: e.name,
          sub: `${e.type} · ${fmtDate(e.date)}`,
          module: 'exercises',
          icon: '◎',
          color: B.purple,
        });
    });
    data.partners.forEach((p) => {
      if (
        p.name?.toLowerCase().includes(q) ||
        p.agreementType?.toLowerCase().includes(q)
      )
        hits.push({
          type: 'partner',
          id: p.id,
          label: p.name,
          sub: `${p.agreementType} · ${p.type}`,
          module: 'partners',
          icon: '⊕',
          color: B.blue,
        });
    });
    data.plans.forEach((p) => {
      if (
        p.name?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q)
      )
        hits.push({
          type: 'plan',
          id: p.id,
          label: p.name,
          sub: `${p.type} v${p.version}`,
          module: 'plans',
          icon: '◈',
          color: B.green,
        });
    });
    (data.employees || []).forEach((e) => {
      if (
        e.name?.toLowerCase().includes(q) ||
        e.title?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
      )
        hits.push({
          type: 'employee',
          id: e.id,
          label: e.name,
          sub: `${e.title || ''} · ${e.department || ''}`,
          module: 'employees',
          icon: '👤',
          color: B.indigo,
        });
    });
    (data.grants || []).forEach((g) => {
      if (
        g.name?.toLowerCase().includes(q) ||
        g.type?.toLowerCase().includes(q) ||
        g.grantNumber?.toLowerCase().includes(q)
      )
        hits.push({
          type: 'grant',
          id: g.id,
          label: g.name,
          sub: `${g.type}${
            g.amount ? ` · $${parseFloat(g.amount).toLocaleString()}` : ''
          }`,
          module: 'grants',
          icon: '$',
          color: B.green,
        });
    });
    data.resources.forEach((r) => {
      if (
        r.name?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)
      )
        hits.push({
          type: 'resource',
          id: r.id,
          label: r.name,
          sub: `${r.category} · ${r.location || ''}`,
          module: 'resources',
          icon: '⊗',
          color: B.amber,
        });
    });
    (data.thira?.hazards || []).forEach((h) => {
      if (
        h.name?.toLowerCase().includes(q) ||
        h.type?.toLowerCase().includes(q)
      )
        hits.push({
          type: 'hazard',
          id: h.id,
          label: h.name,
          sub: `Risk ${h.probability * h.magnitude}/25 · ${h.type
            .split('—')[0]
            .trim()}`,
          module: 'thira',
          icon: '⚠',
          color: B.red,
        });
    });
    return hits.slice(0, 20);
  }, [query, data]);
  const grouped = useMemo(() => {
    const g = {};
    results.forEach((r) => {
      if (!g[r.type]) g[r.type] = [];
      g[r.type].push(r);
    });
    return g;
  }, [results]);
  const typeLabels = {
    standard: 'EMAP Standards',
    training: 'Training',
    exercise: 'Exercises',
    partner: 'Partners & MOUs',
    plan: 'Plans',
    employee: 'Personnel',
    grant: 'Grants',
    resource: 'Resources',
    hazard: 'THIRA Hazards',
  };
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.45)',
          zIndex: 89,
          animation: 'fadeIn 0.1s',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 56,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          maxWidth: 'calc(100vw - 40px)',
          zIndex: 90,
          animation: 'fadeUp 0.15s ease',
        }}
      >
        <div
          style={{
            background: B.card,
            borderRadius: 12,
            border: `1px solid ${B.border}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 16px',
              borderBottom:
                results.length > 0 || query.length >= 2
                  ? `1px solid ${B.border}`
                  : 'none',
            }}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke={B.faint}
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search standards, exercises, personnel, grants, plans…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: B.text,
                background: 'tranSPRent',
                fontFamily: "'DM Sans',sans-serif",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: B.faint,
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ×
              </button>
            )}
            <kbd
              style={{
                fontSize: 10,
                color: B.faint,
                background: '#f4f7f8',
                border: `1px solid ${B.border}`,
                borderRadius: 4,
                padding: '2px 6px',
                flexShrink: 0,
              }}
            >
              ESC
            </kbd>
          </div>
          {query.length >= 2 && results.length === 0 && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: B.faint,
                fontSize: 13,
              }}
            >
              No results for "{query}"
            </div>
          )}
          {results.length > 0 && (
            <div
              style={{ maxHeight: 400, overflowY: 'auto', padding: '6px 0' }}
            >
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  <div
                    style={{
                      padding: '5px 16px 2px',
                      fontSize: 9,
                      color: B.faint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      fontWeight: 700,
                    }}
                  >
                    {typeLabels[type] || type}
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setView(item.module);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        width: '100%',
                        padding: '8px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = B.tealLight)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'none')
                      }
                    >
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          background: `${item.color}18`,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          color: item.color,
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: B.text,
                            display: 'flex',
                            gap: 7,
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.label}
                          </span>
                          {item.status && (
                            <span
                              style={{
                                fontSize: 9,
                                background: ST[item.status]?.bg,
                                color: ST[item.status]?.color,
                                padding: '1px 5px',
                                borderRadius: 3,
                                fontWeight: 700,
                                border: `1px solid ${ST[item.status]?.border}`,
                                flexShrink: 0,
                              }}
                            >
                              {ST[item.status]?.label}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: B.faint,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.sub}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: B.border }}>›</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
          {!query && (
            <div style={{ padding: '12px 16px' }}>
              <div
                style={{
                  fontSize: 10,
                  color: B.faint,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Quick jump
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  ['EMAP Standards', 'accreditation', B.teal],
                  ['Exercises', 'exercises', B.purple],
                  ['Grants', 'grants', B.green],
                  ['Personnel', 'employees', B.indigo],
                  ['THIRA', 'thira', B.blue],
                  ['Bulk Intake', 'intake', B.amber],
                  ['CAP', 'cap', B.red],
                  ['Package Builder', 'package', B.teal],
                ].map(([lbl, mod, col]) => (
                  <button
                    key={mod}
                    onClick={() => {
                      setView(mod);
                      onClose();
                    }}
                    style={{
                      padding: '5px 12px',
                      background: `${col}12`,
                      border: `1px solid ${col}30`,
                      borderRadius: 20,
                      color: col,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   ACCREDITATION PACKAGE BUILDER
═══════════════════════════════════════════════════════ */
function PackageBuilder({ data, setView }) {
  const [step, setStep] = useState(0);
  const [aiExec, setAiExec] = useState('');
  const [aiLoad, setAiLoad] = useState(false);
  const overall = useMemo(
    () => overallStats(data.standards || {}),
    [data.standards]
  );
  const compliantSections = ALL_SECTIONS.filter(
    (s) => sectionAggStatus(s, data.standards || {}) === 'compliant'
  ).length;
  const checks = useMemo(() => {
    const c = [];
    const noEv = ALL_STANDARDS.filter((s) => {
      const r = data.standards?.[s.id] || {};
      return (
        r.status === 'compliant' && (!r.docs || r.docs.length === 0) && !r.notes
      );
    });
    c.push({
      id: 'std_ev',
      label: 'Evidence on compliant standards',
      status: noEv.length === 0 ? 'pass' : noEv.length < 5 ? 'warn' : 'fail',
      detail:
        noEv.length === 0
          ? 'All compliant standards have evidence'
          : `${noEv.length} compliant standards lack evidence`,
      fix: 'accreditation',
    });
    const eop = data.plans?.find(
      (p) => p.type === 'EOP' && p.status === 'current'
    );
    c.push({
      id: 'eop',
      label: 'Current Emergency Operations Plan',
      status: eop ? 'pass' : 'fail',
      detail: eop
        ? `${eop.name} v${eop.version} — current`
        : 'No current EOP found',
      fix: 'plans',
    });
    const coop = data.plans?.find(
      (p) => p.type === 'COOP' && p.status === 'current'
    );
    c.push({
      id: 'coop',
      label: 'Continuity of Operations Plan',
      status: coop ? 'pass' : 'warn',
      detail: coop ? `${coop.name} — current` : 'No COOP on file',
      fix: 'plans',
    });
    const hmp = data.plans?.find((p) => p.type === 'Hazard Mitigation Plan');
    c.push({
      id: 'hmp',
      label: 'Hazard Mitigation Plan',
      status: hmp ? 'pass' : 'warn',
      detail: hmp ? `${hmp.name} — on file` : 'No Hazard Mitigation Plan',
      fix: 'plans',
    });
    const hz = data.thira?.hazards || [];
    c.push({
      id: 'thira',
      label: 'THIRA / Hazard profile (EMAP 4.1)',
      status: hz.length >= 3 ? 'pass' : hz.length > 0 ? 'warn' : 'fail',
      detail:
        hz.length >= 3
          ? `${hz.length} hazards profiled`
          : hz.length > 0
          ? `Only ${hz.length} hazard${
              hz.length > 1 ? 's' : ''
            } — 3+ recommended`
          : 'No hazards profiled',
      fix: 'thira',
    });
    const exAAR = data.exercises?.filter((e) => e.aarFinal)?.length || 0;
    c.push({
      id: 'exercises',
      label: 'Exercises with completed AARs (EMAP 4.11)',
      status:
        exAAR >= 1 ? 'pass' : data.exercises?.length > 0 ? 'warn' : 'fail',
      detail:
        exAAR >= 1
          ? `${exAAR} exercise${exAAR > 1 ? 's' : ''} with final AAR`
          : data.exercises?.length > 0
          ? 'Exercises on file — finalize AARs'
          : 'No exercises on file',
      fix: 'exercises',
    });
    const tc = data.training?.length || 0;
    c.push({
      id: 'training',
      label: 'Training records documented (EMAP 4.10)',
      status: tc >= 5 ? 'pass' : tc > 0 ? 'warn' : 'fail',
      detail:
        tc >= 5
          ? `${tc} training records`
          : tc > 0
          ? `${tc} record${tc > 1 ? 's' : ''} — add more`
          : 'No training records',
      fix: 'training',
    });
    const am = (data.partners || []).filter(
      (p) => !p.expires || daysUntil(p.expires) > 0
    ).length;
    c.push({
      id: 'mous',
      label: 'Active mutual aid agreements (EMAP 4.7)',
      status: am >= 3 ? 'pass' : am > 0 ? 'warn' : 'fail',
      detail:
        am >= 3 ? `${am} active agreements` : `${am} active — 3+ recommended`,
      fix: 'partners',
    });
    const gf = (data.grants || []).filter((g) => g.status === 'active').length;
    c.push({
      id: 'grants',
      label: 'Program funding documented (EMAP 3.4)',
      status: gf > 0 ? 'pass' : 'warn',
      detail:
        gf > 0
          ? `${gf} active grant${gf > 1 ? 's' : ''} tracked`
          : 'No grants on record',
      fix: 'grants',
    });
    const oc =
      (data.capItems || []).filter((c) => !c.closed).length +
      (data.exercises || []).reduce(
        (a, e) => a + (e.corrective || []).filter((c) => !c.closed).length,
        0
      );
    c.push({
      id: 'cap',
      label: 'Corrective actions resolved',
      status: oc === 0 ? 'pass' : oc < 3 ? 'warn' : 'fail',
      detail:
        oc === 0
          ? 'All corrective actions closed'
          : `${oc} open — address before submission`,
      fix: 'cap',
    });
    return c;
  }, [data]);
  const passCount = checks.filter((c) => c.status === 'pass').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;
  const readiness = Math.round(
    ((passCount + warnCount * 0.5) / checks.length) * 100
  );
  const readyToSubmit = failCount === 0 && overall.pct >= 50;
  const SC = {
    pass: {
      icon: '✓',
      color: B.green,
      bg: B.greenLight,
      border: B.greenBorder,
    },
    warn: {
      icon: '△',
      color: B.amber,
      bg: B.amberLight,
      border: B.amberBorder,
    },
    fail: { icon: '✕', color: B.red, bg: B.redLight, border: B.redBorder },
  };
  const genExec = async () => {
    setAiLoad(true);
    setAiExec('');
    const issues = checks
      .filter((c) => c.status !== 'pass')
      .map((c) => c.detail)
      .join('; ');
    try {
      await callAI(
        SYS,
        `Write a professional 3-paragraph EMAP accreditation executive summary for "${
          data.orgName || 'this jurisdiction'
        }" for submission to an assessor.\nOrg: ${
          data.orgName || 'Unknown'
        } · State: ${data.state || 'Unknown'} · Jurisdiction: ${
          data.jurisdiction || 'Unknown'
        }\nPrimary EM: ${data.emName || 'Unknown'} · ${
          data.emTitle || ''
        }\nEMAP: ${overall.compliant}/${
          overall.total
        } standards · ${compliantSections}/17 sections\nTraining: ${
          data.training?.length || 0
        } · Exercises: ${data.exercises?.length || 0} (${
          data.exercises?.filter((e) => e.aarFinal)?.length || 0
        } with final AAR)\nPartners: ${data.partners?.length || 0} · Plans: ${
          data.plans?.length || 0
        } · Personnel: ${(data.employees || []).length}\nGrants: ${
          (data.grants || []).filter((g) => g.status === 'active').length
        } active · Hazards: ${
          (data.thira?.hazards || []).length
        } profiled\nItems being addressed: ${
          issues || 'none'
        }\nUse formal government document tone. Be specific about strengths and honest about items being addressed.`,
        (chunk) => setAiExec((p) => p + chunk)
      );
    } catch {
      setAiExec('Error generating summary.');
    }
    setAiLoad(false);
  };
  const steps = [
    { label: 'Readiness Check' },
    { label: 'Compliance Summary' },
    { label: 'Executive Summary' },
    { label: 'Final Review' },
  ];
  const accent = data.brand?.accentColor || B.teal;
  return (
    <div style={{ padding: '28px 32px', maxWidth: 880 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.3px',
          }}
        >
          Accreditation Package Builder
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
          Step-by-step assembly of your EMAP submission — readiness check,
          compliance summary, executive summary, and final review.
        </p>
      </div>
      {/* Step tabs */}
      <div
        style={{
          display: 'flex',
          marginBottom: 24,
          background: B.card,
          border: `1px solid ${B.border}`,
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              flex: 1,
              padding: '10px 6px',
              background:
                step === i ? accent : step > i ? `${accent}18` : 'tranSPRent',
              border: 'none',
              borderRight:
                i < steps.length - 1 ? `1px solid ${B.border}` : 'none',
              color: step === i ? '#fff' : step > i ? accent : B.faint,
              fontSize: 12,
              fontWeight: step === i ? 700 : 500,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              transition: 'all 0.15s',
            }}
          >
            <span
              style={{
                width: 17,
                height: 17,
                borderRadius: '50%',
                background:
                  step === i
                    ? 'rgba(255,255,255,0.25)'
                    : step > i
                    ? accent
                    : B.border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 800,
                color: step >= i ? '#fff' : B.faint,
                flexShrink: 0,
              }}
            >
              {step > i ? '✓' : i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>
      {/* Step 0: Readiness */}
      {step === 0 && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 10,
              marginBottom: 18,
            }}
          >
            {[
              {
                label: 'Package Readiness',
                val: `${readiness}%`,
                color:
                  readiness >= 80 ? B.green : readiness >= 60 ? B.amber : B.red,
              },
              {
                label: 'Checks Passing',
                val: `${passCount}/${checks.length}`,
                color: B.green,
              },
              {
                label: 'Issues to Address',
                val: failCount + warnCount,
                color:
                  failCount > 0 ? B.red : warnCount > 0 ? B.amber : B.green,
              },
            ].map((s) => (
              <Card
                key={s.label}
                style={{ textAlign: 'center', padding: '14px' }}
              >
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 11, color: B.faint, marginTop: 3 }}>
                  {s.label}
                </div>
              </Card>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {checks.map((c) => {
              const sc = SC[c.status];
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    gap: 11,
                    alignItems: 'center',
                    padding: '10px 13px',
                    background: sc.bg,
                    border: `1px solid ${sc.border}`,
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 5,
                      background: sc.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      color: '#fff',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {sc.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 12, fontWeight: 600, color: B.text }}
                    >
                      {c.label}
                    </div>
                    <div style={{ fontSize: 11, color: B.muted }}>
                      {c.detail}
                    </div>
                  </div>
                  {c.status !== 'pass' && (
                    <button
                      onClick={() => setView(c.fix)}
                      style={{
                        fontSize: 11,
                        color: sc.color,
                        background: B.card,
                        border: `1px solid ${sc.border}`,
                        borderRadius: 6,
                        padding: '4px 9px',
                        cursor: 'pointer',
                        fontFamily: "'DM Sans',sans-serif",
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Fix →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 14,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Btn label="Continue →" onClick={() => setStep(1)} primary />
            {readyToSubmit ? (
              <span style={{ fontSize: 12, color: B.green, fontWeight: 600 }}>
                ✓ Program meets minimum EMAP submission threshold
              </span>
            ) : (
              <span style={{ fontSize: 12, color: B.amber }}>
                △ {failCount} critical item{failCount !== 1 ? 's' : ''} should
                be resolved before submission
              </span>
            )}
          </div>
        </div>
      )}
      {/* Step 1: Compliance Summary */}
      {step === 1 && (
        <div>
          <div
            style={{
              background: B.card,
              border: `1px solid ${B.border}`,
              borderRadius: 10,
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                background: accent,
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>
                  {data.orgName || 'Your Organization'}
                </div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>
                  EMAP EMS 5-2022 ·{' '}
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div style={{ textAlign: 'right', color: '#fff' }}>
                <div style={{ fontSize: 26, fontWeight: 800 }}>
                  {overall.pct}%
                </div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>
                  {overall.compliant}/{overall.total} standards
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 5,
                }}
              >
                {ALL_SECTIONS.map((sec) => {
                  const ag = sectionAggStatus(sec, data.standards || {});
                  const stats = sectionStats(sec, data.standards || {});
                  const sc =
                    SC[
                      ag === 'compliant'
                        ? 'pass'
                        : ag === 'needs_review'
                        ? 'fail'
                        : 'warn'
                    ];
                  return (
                    <div
                      key={sec.id}
                      style={{
                        display: 'flex',
                        gap: 6,
                        alignItems: 'center',
                        padding: '6px 9px',
                        background: '#f8fafc',
                        borderRadius: 5,
                        border: `1px solid ${B.border}`,
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          background: sc.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 8,
                          color: '#fff',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {sc.icon}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: sec.chapter.color,
                          background: `${sec.chapter.color}15`,
                          padding: '1px 4px',
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      >
                        {sec.id}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 11,
                          color: B.muted,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sec.title}
                      </span>
                      <span
                        style={{ fontSize: 9, color: B.faint, flexShrink: 0 }}
                      >
                        {stats.compliant}/{stats.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="← Back" onClick={() => setStep(0)} />
            <Btn label="Continue →" onClick={() => setStep(2)} primary />
          </div>
        </div>
      )}
      {/* Step 2: Executive Summary */}
      {step === 2 && (
        <div>
          <div
            style={{
              background: B.tealLight,
              border: `1px solid ${B.tealBorder}`,
              borderRadius: 10,
              padding: '13px 16px',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: B.tealDark,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <BrainIcon size={13} color={B.tealDark} strokeWidth={1.4} />
                AI Executive Summary Generator
              </div>
              <Btn
                label={aiLoad ? '⟳ Writing…' : 'Generate Executive Summary'}
                onClick={genExec}
                loading={aiLoad}
                primary
                small
              />
            </div>
            <div style={{ fontSize: 12, color: B.tealDark }}>
              Writes a professional 3-paragraph narrative using your live
              program data — ready for submission or board presentation.
            </div>
          </div>
          {!aiExec && !aiLoad && (
            <div
              style={{
                background: '#f8fafc',
                border: `1px solid ${B.border}`,
                borderRadius: 10,
                padding: '36px',
                textAlign: 'center',
                color: B.faint,
                marginBottom: 12,
              }}
            >
              Click "Generate Executive Summary" to create your AI-drafted
              submission narrative
            </div>
          )}
          {aiExec && (
            <div
              style={{
                background: B.card,
                border: `1px solid ${B.border}`,
                borderRadius: 10,
                padding: '18px 20px',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: B.faint,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Executive Summary — {data.orgName || 'Your Organization'}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: B.text,
                  lineHeight: 1.85,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {aiExec}
                {aiLoad && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 2,
                      height: 13,
                      background: B.teal,
                      marginLeft: 2,
                      animation: 'blink 0.7s infinite',
                      verticalAlign: 'middle',
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: `1px solid ${B.border}`,
                  display: 'flex',
                  gap: 8,
                }}
              >
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(
                      new Blob([aiExec], { type: 'text/plain' })
                    );
                    a.download = `${
                      data.orgName || 'planrr'
                    }-exec-summary-${today()}.txt`;
                    a.click();
                  }}
                  style={{
                    fontSize: 11,
                    color: B.tealDark,
                    background: B.tealLight,
                    border: `1px solid ${B.tealBorder}`,
                    borderRadius: 6,
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 700,
                  }}
                >
                  ↓ Download .txt
                </button>
                <Btn label="Regenerate" onClick={genExec} small />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="← Back" onClick={() => setStep(1)} />
            <Btn label="Continue →" onClick={() => setStep(3)} primary />
          </div>
        </div>
      )}
      {/* Step 3: Final Review */}
      {step === 3 && (
        <div>
          <div
            style={{
              background: readyToSubmit ? B.greenLight : B.amberLight,
              border: `1px solid ${
                readyToSubmit ? B.greenBorder : B.amberBorder
              }`,
              borderRadius: 12,
              padding: '18px 20px',
              marginBottom: 18,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: readyToSubmit ? B.green : B.amber,
                borderRadius: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {readyToSubmit ? '✓' : '△'}
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: readyToSubmit ? B.green : '#92400e',
                  marginBottom: 3,
                }}
              >
                {readyToSubmit
                  ? 'Package is ready for submission'
                  : 'Package needs attention'}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: readyToSubmit ? '#065f46' : '#92400e',
                }}
              >
                {readyToSubmit
                  ? `${overall.pct}% compliant · ${passCount}/${checks.length} checks passing · All critical items resolved`
                  : `${failCount} critical item${
                      failCount !== 1 ? 's' : ''
                    } and ${warnCount} warning${
                      warnCount !== 1 ? 's' : ''
                    } to address. Minimum threshold: 50% compliance with no critical gaps.`}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 18,
            }}
          >
            {[
              {
                icon: '★',
                label: 'EMAP Standards',
                val: `${overall.compliant}/${overall.total} (${overall.pct}%)`,
                ok: overall.pct >= 50,
                mod: 'accreditation',
              },
              {
                icon: '◎',
                label: 'Exercise AARs',
                val: `${
                  data.exercises?.filter((e) => e.aarFinal)?.length || 0
                } final AARs`,
                ok:
                  (data.exercises?.filter((e) => e.aarFinal)?.length || 0) >= 1,
                mod: 'exercises',
              },
              {
                icon: '◈',
                label: 'Current Plans',
                val: `${
                  data.plans?.filter((p) => p.status === 'current')?.length || 0
                } current`,
                ok: data.plans?.some(
                  (p) => p.type === 'EOP' && p.status === 'current'
                ),
                mod: 'plans',
              },
              {
                icon: '⊕',
                label: 'Partner Agreements',
                val: `${
                  (data.partners || []).filter(
                    (p) => !p.expires || daysUntil(p.expires) > 0
                  ).length
                } active`,
                ok:
                  (data.partners || []).filter(
                    (p) => !p.expires || daysUntil(p.expires) > 0
                  ).length >= 3,
                mod: 'partners',
              },
              {
                icon: '◉',
                label: 'Training Records',
                val: `${data.training?.length || 0} records`,
                ok: (data.training?.length || 0) >= 5,
                mod: 'training',
              },
              {
                icon: '⚠',
                label: 'Open Corrective Actions',
                val: `${
                  (data.capItems || []).filter((c) => !c.closed).length +
                  (data.exercises || []).reduce(
                    (a, e) =>
                      a + (e.corrective || []).filter((c) => !c.closed).length,
                    0
                  )
                } open`,
                ok:
                  (data.capItems || []).filter((c) => !c.closed).length === 0 &&
                  (data.exercises || []).every((e) =>
                    (e.corrective || []).every((c) => c.closed)
                  ),
                mod: 'cap',
              },
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => setView(item.mod)}
                style={{
                  background: B.card,
                  border: `1px solid ${
                    item.ok ? B.greenBorder : B.amberBorder
                  }`,
                  borderRadius: 9,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = B.teal)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = item.ok
                    ? B.greenBorder
                    : B.amberBorder)
                }
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{ fontSize: 14, color: item.ok ? B.green : B.amber }}
                  >
                    {item.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: item.ok ? B.green : B.amber,
                    }}
                  >
                    {item.ok ? '✓' : '△'}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: B.text,
                    marginTop: 6,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: B.faint, marginTop: 2 }}>
                  {item.val}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn label="← Back" onClick={() => setStep(2)} />
            <button
              onClick={() => window.print()}
              style={{
                background: accent,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              🖨 Print Full Package
            </button>
            <Btn label="View Reports" onClick={() => setView('reports')} />
            {!readyToSubmit && (
              <Btn label="Fix Issues" onClick={() => setStep(0)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ACCREDITATION JOURNEY — 6-step EMAP process tracker
═══════════════════════════════════════════════════════ */
function AccreditationJourney({ data, updateData, setView }) {
  const journey = data.journey || {};
  const overall = useMemo(
    () => overallStats(data.standards || {}),
    [data.standards]
  );
  const update = (patch) =>
    updateData((prev) => ({
      ...prev,
      journey: { ...(prev.journey || {}), ...patch },
    }));

  const exWithAAR = (data.exercises || []).filter((e) => e.aarFinal).length;
  const activeGrantCount = (data.grants || []).filter(
    (g) => g.status === 'active'
  ).length;
  const docsWithRationale = Object.values(data.standards || {}).reduce(
    (a, s) =>
      a +
      (s.docs || []).filter((d) => d.rationale && d.rationale.length > 10)
        .length,
    0
  );
  const totalDocs = Object.values(data.standards || {}).reduce(
    (a, s) => a + (s.docs || []).length,
    0
  );

  // Auto-compute step statuses from real data
  const stepStatus = [
    // Step 1: Subscription & Training
    journey.subscribed && journey.amDesignated && journey.trainingComplete
      ? 'complete'
      : journey.subscribed
      ? 'active'
      : 'pending',
    // Step 2: Self-Assessment
    overall.pct >= 100 ? 'complete' : overall.pct > 0 ? 'active' : 'pending',
    // Step 3: Application
    journey.applicationSubmitted
      ? 'complete'
      : overall.pct >= 80
      ? 'active'
      : 'pending',
    // Step 4: Assessment
    journey.assessmentComplete
      ? 'complete'
      : journey.applicationSubmitted
      ? 'active'
      : 'pending',
    // Step 5: Committee Review
    journey.commissionDecision
      ? 'complete'
      : journey.assessmentComplete
      ? 'active'
      : 'pending',
    // Step 6: Accreditation
    journey.accreditedDate
      ? 'complete'
      : journey.commissionDecision
      ? 'active'
      : 'pending',
  ];

  const STEPS = [
    {
      n: 1,
      label: 'Subscription & Training',
      desc: 'Subscribe to EMAP, designate an Accreditation Manager, complete Emergency Management Standard Training.',
      details: [
        'Annual subscription: $900/yr',
        'Accreditation Manager must attend Standard Training',
        'Training cost varies — contact EMAP',
        'Access to Assessment Platform (PowerDMS)',
      ],
      checks: [
        { label: 'EMAP subscription active', key: 'subscribed' },
        { label: 'Accreditation Manager designated', key: 'amDesignated' },
        { label: 'Standard Training completed', key: 'trainingComplete' },
      ],
      color: B.blue,
      tip: 'Start here. Training should happen as early as possible — ideally within 30 days of subscribing.',
    },
    {
      n: 2,
      label: 'Self-Assessment',
      desc: 'Evaluate all 73 standards, gather evidence documents, write rationale for each proof of compliance, upload to EMAP Assessment Platform.',
      details: [
        'Document all 73 standards with evidence',
        'Every document needs a written rationale',
        'Draft documents are NOT accepted',
        'Upload to PowerDMS 3 weeks before assessment',
      ],
      checks: [],
      color: B.teal,
      progress: {
        label: `${overall.compliant}/73 standards documented · ${docsWithRationale}/${totalDocs} rationales written`,
        pct: overall.pct,
      },
      tip: `PLANRR builds your self-assessment in real time. You currently have ${overall.compliant} compliant standards and ${docsWithRationale} rationales written.`,
    },
    {
      n: 3,
      label: 'Application for Assessment',
      desc: 'Submit formal Application for Assessment and pay the Application Fee. Must be submitted 12 months before your desired on-site assessment date.',
      details: [
        'Application fee: $9,000 (with technical assistance)',
        'Submit 12 months before on-site assessment',
        'Program Director must sign application',
        'Assigned EMAP Staff Liaison + Assessment Team Leader',
      ],
      checks: [
        { label: 'Application submitted to EMAP', key: 'applicationSubmitted' },
        { label: 'Application fee paid', key: 'appFeePaid' },
        { label: 'Assessment date scheduled', key: 'assessmentScheduled' },
      ],
      dates: [
        { label: 'Application submitted', key: 'applicationDate' },
        { label: 'Target assessment date', key: 'targetAssessmentDate' },
      ],
      color: B.purple,
      tip: "Don't wait until you're at 100% to apply. Apply when you're at ~80% compliant — you'll complete the rest during the application period with EMAP support.",
    },
    {
      n: 4,
      label: 'On-Site Assessment',
      desc: '5-day on-site assessment by a team of EMAP assessors. Submit all documents 3 weeks prior. Assessors review evidence, conduct interviews, observe demonstrations.',
      details: [
        '5 consecutive business days',
        'Submit all docs 3 weeks before',
        'New/draft docs not accepted during assessment',
        'Thursday 1pm deadline for any gap documents',
        'Virtual Exit Briefing 2-3 weeks after',
        '30 business day supplemental period begins at Exit Briefing',
      ],
      checks: [
        { label: 'All docs uploaded (3 weeks prior)', key: 'docsUploaded' },
        { label: 'On-site assessment complete', key: 'assessmentComplete' },
        { label: 'Supplemental period complete', key: 'supplementalComplete' },
      ],
      dates: [
        { label: 'On-site assessment date', key: 'assessmentDate' },
        { label: 'Exit briefing date', key: 'exitBriefingDate' },
        { label: 'Supplemental period ends', key: 'supplementalEndDate' },
      ],
      color: B.amber,
      tip: 'The assessors get access to your documents 3 weeks before arrival — their preliminary review happens before they even land.',
    },
    {
      n: 5,
      label: 'Committee Review & Commission Decision',
      desc: 'Program Review Committee reviews the Preliminary Assessment Report. EMAP Commission votes: Accredited, Conditionally Accredited, or Denied.',
      details: [
        'Program representative strongly encouraged to attend',
        'Commission outcomes: Accredited / Conditional / Denied',
        'Conditional: up to 9 months to resolve gaps',
        '≤5 non-compliant: virtual conditional assessment',
        '≥6 non-compliant: on-site conditional assessment',
        'Appeal window: 30 business days after decision',
      ],
      checks: [
        { label: 'PRC meeting attended', key: 'prcAttended' },
        { label: 'Commission decision received', key: 'commissionDecision' },
      ],
      dates: [
        { label: 'PRC meeting date', key: 'prcDate' },
        { label: 'Commission decision date', key: 'commissionDate' },
      ],
      color: B.red,
      tip: "Attend the PRC meeting — you can respond to questions and clarify findings. After the meeting you're excused while they vote.",
    },
    {
      n: 6,
      label: 'Accreditation & Maintenance',
      desc: 'EMAP Accreditation is valid for 5 years. You may use the EMAP Insignia. Submit for consecutive accreditation 12 months before expiration.',
      details: [
        '5-year accreditation cycle',
        'May display EMAP Insignia on all materials',
        'Apply for consecutive accreditation 12 months before expiry',
        'CACP option: spread assessment over 4 years',
        'Lapsed accreditation requires full reapplication',
      ],
      checks: [
        {
          label: 'Accreditation certificate received',
          key: 'certificateReceived',
        },
        { label: 'CACP enrollment (optional)', key: 'cacpEnrolled' },
      ],
      dates: [
        { label: 'Accreditation date', key: 'accreditedDate' },
        { label: 'Accreditation expires', key: 'expiryDate' },
      ],
      color: B.green,
      tip: 'Set a calendar reminder 18 months before expiry — consecutive accreditation applications are due 12 months before, and late applications lose technical assistance.',
    },
  ];

  const currentStep = stepStatus.findIndex(
    (s) => s === 'active' || s === 'pending'
  );
  const activeStep = currentStep === -1 ? 5 : currentStep;

  // Fee estimator based on jurisdiction type + population
  const feeEstimate = useMemo(() => {
    const j = data.jurisdiction || '';
    if (j.includes('State'))
      return {
        accred: '$4,500–$7,500',
        app: '$9,000',
        total: '$13,500–$16,500+travel',
      };
    if (j.includes('Municipal') || j.includes('County') || j.includes('Parish'))
      return {
        accred: '$2,000–$4,500',
        app: '$9,000',
        total: '$11,000–$13,500+travel',
      };
    return {
      accred: '$2,000–$7,500',
      app: '$9,000',
      total: '$11,000–$16,500+travel',
    };
  }, [data.jurisdiction]);

  // Tiered pathway recommendation
  const tier1Pct = useMemo(() => {
    const t1Ids = [
      '3.1.1',
      '3.2.1',
      '3.2.2',
      '3.3.1',
      '3.3.2',
      '3.4.1',
      '3.4.2',
      '3.4.3',
      '3.5.1',
      '3.5.2',
      '4.1.1',
      '4.1.2',
      '4.1.3',
      '4.2.1',
      '4.2.2',
      '4.2.3',
      '4.2.4',
      '4.2.5',
    ];
    const done = t1Ids.filter(
      (id) => (data.standards || {})[id]?.status === 'compliant'
    ).length;
    return Math.round((done / t1Ids.length) * 100);
  }, [data.standards]);

  const [expandedStep, setExpandedStep] = useState(activeStep);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.3px',
          }}
        >
          Accreditation Journey
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
          EMAP 6-step accreditation process · track your progress · key
          deadlines and fees
        </p>
      </div>

      {/* Overall progress bar */}
      <div
        style={{
          background: B.card,
          border: `1px solid ${B.border}`,
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: B.text }}>
            Current Step:{' '}
            <span style={{ color: B.teal }}>{STEPS[activeStep]?.label}</span>
          </div>
          <div style={{ fontSize: 12, color: B.faint }}>
            {stepStatus.filter((s) => s === 'complete').length} of 6 steps
            complete
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {STEPS.map((s, i) => {
            const sc = stepStatus[i];
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background:
                    sc === 'complete'
                      ? s.color
                      : sc === 'active'
                      ? `${s.color}60`
                      : B.border,
                  transition: 'all 0.3s',
                }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11 }}>
          <span style={{ color: B.green, fontWeight: 600 }}>
            ✓ {stepStatus.filter((s) => s === 'complete').length} complete
          </span>
          <span style={{ color: B.teal, fontWeight: 600 }}>
            ◑ {stepStatus.filter((s) => s === 'active').length} in progress
          </span>
          <span style={{ color: B.faint }}>
            ○ {stepStatus.filter((s) => s === 'pending').length} upcoming
          </span>
          <span style={{ marginLeft: 'auto', color: B.faint }}>
            Estimated total cost:{' '}
            <strong style={{ color: B.text }}>{feeEstimate.total}</strong>
          </span>
        </div>
      </div>

      {/* Step cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STEPS.map((step, i) => {
          const sc = stepStatus[i];
          const isExpanded = expandedStep === i;
          const statusColor =
            sc === 'complete'
              ? B.green
              : sc === 'active'
              ? step.color
              : B.faint;
          const statusBg =
            sc === 'complete'
              ? B.greenLight
              : sc === 'active'
              ? `${step.color}10`
              : '#f8fafc';
          return (
            <div
              key={i}
              style={{
                background: B.card,
                border: `1.5px solid ${
                  sc === 'active'
                    ? step.color
                    : sc === 'complete'
                    ? B.greenBorder
                    : B.border
                }`,
                borderRadius: 10,
                overflow: 'hidden',
                transition: 'all 0.15s',
              }}
            >
              {/* Step header */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '13px 16px',
                  cursor: 'pointer',
                  background: statusBg,
                }}
                onClick={() => setExpandedStep(isExpanded ? -1 : i)}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: statusColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    color: '#fff',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {sc === 'complete' ? '✓' : step.n}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: B.text }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 11, color: B.faint, marginTop: 1 }}>
                    {step.desc.slice(0, 80)}…
                  </div>
                </div>
                {step.progress && (
                  <div style={{ width: 80, flexShrink: 0 }}>
                    <div
                      style={{
                        height: 4,
                        background: '#edf2f4',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${step.progress.pct}%`,
                          background: step.color,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: B.faint,
                        marginTop: 2,
                        textAlign: 'right',
                      }}
                    >
                      {step.progress.pct}%
                    </div>
                  </div>
                )}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: statusColor,
                    background:
                      sc === 'complete'
                        ? B.greenLight
                        : sc === 'active'
                        ? `${step.color}15`
                        : '#f0f0f0',
                    padding: '3px 9px',
                    borderRadius: 10,
                    border: `1px solid ${statusColor}30`,
                    flexShrink: 0,
                  }}
                >
                  {sc === 'complete'
                    ? 'Complete'
                    : sc === 'active'
                    ? 'In Progress'
                    : 'Upcoming'}
                </span>
                <span
                  style={{
                    color: B.faint,
                    fontSize: 10,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  ▼
                </span>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderTop: `1px solid ${B.border}`,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 14,
                    }}
                  >
                    {/* Left: details + checklist */}
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: B.muted,
                          lineHeight: 1.7,
                          marginBottom: 12,
                        }}
                      >
                        {step.desc}
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: B.faint,
                            textTransform: 'uppercase',
                            letterSpacing: '0.07em',
                            marginBottom: 6,
                          }}
                        >
                          Key requirements
                        </div>
                        {step.details.map((d, di) => (
                          <div
                            key={di}
                            style={{
                              display: 'flex',
                              gap: 6,
                              alignItems: 'flex-start',
                              marginBottom: 4,
                              fontSize: 11,
                              color: B.muted,
                            }}
                          >
                            <span
                              style={{
                                color: step.color,
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            >
                              ·
                            </span>
                            {d}
                          </div>
                        ))}
                      </div>
                      {step.checks.length > 0 && (
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: B.faint,
                              textTransform: 'uppercase',
                              letterSpacing: '0.07em',
                              marginBottom: 6,
                            }}
                          >
                            Track your progress
                          </div>
                          {step.checks.map((c) => (
                            <label
                              key={c.key}
                              style={{
                                display: 'flex',
                                gap: 7,
                                alignItems: 'center',
                                marginBottom: 5,
                                cursor: 'pointer',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={journey[c.key] || false}
                                onChange={(e) =>
                                  update({ [c.key]: e.target.checked })
                                }
                                style={{
                                  accentColor: step.color,
                                  cursor: 'pointer',
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 12,
                                  color: journey[c.key] ? B.green : B.muted,
                                  textDecoration: journey[c.key]
                                    ? 'line-through'
                                    : 'none',
                                }}
                              >
                                {c.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Right: dates + tip */}
                    <div>
                      {step.dates && (
                        <div style={{ marginBottom: 12 }}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: B.faint,
                              textTransform: 'uppercase',
                              letterSpacing: '0.07em',
                              marginBottom: 8,
                            }}
                          >
                            Key dates
                          </div>
                          {step.dates.map((d) => (
                            <div key={d.key} style={{ marginBottom: 8 }}>
                              <Label>{d.label}</Label>
                              <input
                                type="date"
                                value={journey[d.key] || ''}
                                onChange={(e) =>
                                  update({ [d.key]: e.target.value })
                                }
                                style={{
                                  width: '100%',
                                  border: `1px solid ${B.border}`,
                                  borderRadius: 7,
                                  padding: '7px 10px',
                                  fontSize: 12,
                                  color: B.text,
                                  fontFamily: "'DM Sans',sans-serif",
                                  outline: 'none',
                                  background: '#fafcfc',
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        style={{
                          background: `${step.color}08`,
                          border: `1px solid ${step.color}30`,
                          borderLeft: `3px solid ${step.color}`,
                          borderRadius: '0 8px 8px 0',
                          padding: '10px 12px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: step.color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.07em',
                            marginBottom: 5,
                          }}
                        >
                          💡 Tip
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: B.muted,
                            lineHeight: 1.65,
                          }}
                        >
                          {step.tip}
                        </div>
                      </div>
                      {step.progress && (
                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 11,
                            color: B.muted,
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            Self-assessment progress
                          </div>
                          <div style={{ color: B.faint }}>
                            {step.progress.label}
                          </div>
                          <button
                            onClick={() => setView('accreditation')}
                            style={{
                              marginTop: 6,
                              fontSize: 11,
                              color: B.teal,
                              background: B.tealLight,
                              border: `1px solid ${B.tealBorder}`,
                              borderRadius: 6,
                              padding: '4px 10px',
                              cursor: 'pointer',
                              fontFamily: "'DM Sans',sans-serif",
                              fontWeight: 700,
                            }}
                          >
                            Open EMAP Standards →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tiered pathway suggestion on step 3 */}
                  {i === 2 && tier1Pct < 60 && (
                    <div
                      style={{
                        marginTop: 12,
                        background: `${B.purple}08`,
                        border: `1px solid ${B.purpleBorder}`,
                        borderRadius: 9,
                        padding: '12px 14px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: B.purple,
                          marginBottom: 6,
                        }}
                      >
                        ◈ Consider Tiered Accreditation first
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: B.muted,
                          lineHeight: 1.65,
                          marginBottom: 8,
                        }}
                      >
                        Your Tier 1 compliance (Ch.3 + HIRA + Mitigation) is at{' '}
                        <strong>{tier1Pct}%</strong>. Programs under 60% overall
                        often start with the Tiered Accreditation pathway —
                        certifying in specific standard areas before pursuing
                        full accreditation. Each tier is valid for 4 years, and
                        achieving all four tiers upgrades to full accreditation
                        via a 2-day assessment.
                      </div>
                      <button
                        onClick={() => setView('package')}
                        style={{
                          fontSize: 11,
                          color: B.purple,
                          background: `${B.purple}10`,
                          border: `1px solid ${B.purpleBorder}`,
                          borderRadius: 6,
                          padding: '5px 11px',
                          cursor: 'pointer',
                          fontFamily: "'DM Sans',sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        View Tiered Pathway in Package Builder →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fee summary */}
      <div
        style={{
          marginTop: 16,
          background: '#f8fafc',
          border: `1px solid ${B.border}`,
          borderRadius: 10,
          padding: '14px 18px',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: B.text,
            marginBottom: 10,
          }}
        >
          Estimated costs ({data.jurisdiction || 'your jurisdiction type'})
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 10,
          }}
        >
          {[
            { l: 'Subscription', v: '$900/yr' },
            { l: 'Application fee', v: feeEstimate.app },
            { l: 'Accreditation fee', v: feeEstimate.accred },
            { l: 'Travel (estimate)', v: '$3,000–$8,000' },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                background: B.card,
                borderRadius: 7,
                padding: '10px 12px',
                border: `1px solid ${B.border}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: B.text }}>
                {s.v}
              </div>
              <div style={{ fontSize: 10, color: B.faint, marginTop: 2 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: B.faint, marginTop: 10 }}>
          Fees from EMAP Applicant Guide October 2025. Travel costs vary by team
          size and location. Contact EMAP for current rates and payment plan
          options.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ONBOARDING
═══════════════════════════════════════════════════════ */
/* AUTH */
var SB_URL = 'https://ltnbvwnhtsaebyslbhil.supabase.co';
var SB_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bmJ2d25odHNhZWJ5c2xiaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTk0NDYsImV4cCI6MjA4OTU5NTQ0Nn0.VrfVyQPiWzVo7VpQJtRyKQgNBtoq3Du-uGCAGsH815c';
async function sbSignIn(email, pw) {
  const r = await fetch(SB_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SB_KEY },
    body: JSON.stringify({ email, password: pw }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || 'Login failed');
  localStorage.setItem('sb_session', JSON.stringify(d));
  return d;
}
async function sbSignUp(email, pw, org, name, jur, state) {
  const r = await fetch(SB_URL + '/auth/v1/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SB_KEY },
    body: JSON.stringify({
      email,
      password: pw,
      data: { org_name: org, full_name: name, jurisdiction: jur, state: state },
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || 'Signup failed');
  return d;
}
async function sbSignOut() {
  const s = JSON.parse(localStorage.getItem('sb_session') || '{}');
  if (s.access_token)
    await fetch(SB_URL + '/auth/v1/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SB_KEY,
        Authorization: 'Bearer ' + s.access_token,
      },
    });
  localStorage.removeItem('sb_session');
  window.location.reload();
}
async function sbReset(email) {
  const r = await fetch(SB_URL + '/auth/v1/recover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SB_KEY },
    body: JSON.stringify({ email }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || 'Failed');
  return d;
}
function isLoggedIn() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!s || !s.access_token) return false;
    const p = JSON.parse(atob(s.access_token.split('.')[1]));
    if (p.exp * 1000 < Date.now()) {
      localStorage.removeItem('sb_session');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
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
    width: '100%',
    padding: '10px 12px',
    background: '#132039',
    border: '1px solid #1e3a5f',
    borderRadius: 6,
    color: '#f0f4fa',
    fontSize: 14,
    fontFamily: 'DM Sans,sans-serif',
    outline: 'none',
    marginBottom: 12,
    boxSizing: 'border-box',
  };
  const bS = {
    width: '100%',
    padding: '11px',
    background: GOLD,
    color: '#080f1e',
    border: 'none',
    borderRadius: 7,
    fontFamily: 'DM Sans,sans-serif',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 8,
  };
  const lS = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 4,
  };
  const lkS = {
    background: 'none',
    border: 'none',
    color: GOLD,
    fontSize: 12,
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  };
  async function doLogin(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await sbSignIn(fe, fp);
      onAuth();
    } catch (x) {
      setErr(x.message);
    }
    setLoading(false);
  }
  async function doSignup(e) {
    e.preventDefault();
    setErr('');
    if (fp !== fp2) {
      setErr('Passwords do not match');
      return;
    }
    if (fp.length < 8) {
      setErr('Password must be at least 8 characters');
      return;
    }
    if (!fo.trim()) {
      setErr('Organization name is required');
      return;
    }
    setLoading(true);
    try {
      await sbSignUp(fe, fp, fo.trim(), fn.trim(), fj, fs);
      setOk('Account created! You can now sign in.');
    } catch (x) {
      setErr(x.message);
    }
    setLoading(false);
  }
  async function doReset(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await sbReset(fe);
      setOk('Reset link sent - check your inbox.');
    } catch (x) {
      setErr(x.message);
    }
    setLoading(false);
  }
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#080f1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#0d1829',
          border: '1px solid rgba(194,150,74,0.25)',
          borderRadius: 12,
          padding: '36px 40px',
          width: 400,
          maxWidth: 'calc(100vw - 40px)',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Wordmark dark size="lg" />
        </div>
        {err && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6,
              padding: '9px 12px',
              fontSize: 12,
              color: '#ef4444',
              marginBottom: 12,
            }}
          >
            {err}
          </div>
        )}
        {ok && (
          <div
            style={{
              background: 'rgba(27,201,196,0.1)',
              border: '1px solid rgba(27,201,196,0.3)',
              borderRadius: 6,
              padding: '9px 12px',
              fontSize: 12,
              color: B.teal,
              marginBottom: 12,
            }}
          >
            {ok}
          </div>
        )}
        {mode === 'login' && (
          <form onSubmit={doLogin}>
            <div
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#f0f4fa',
                marginBottom: 4,
              }}
            >
              Welcome back
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Sign in to your program
            </div>
            <label style={lS}>Work email</label>
            <input
              type="email"
              value={fe}
              onChange={(e) => setFe(e.target.value)}
              placeholder="you@county.gov"
              style={iS}
              required
            />
            <label style={lS}>Password</label>
            <input
              type="password"
              value={fp}
              onChange={(e) => setFp(e.target.value)}
              placeholder="Password"
              style={iS}
              required
            />
            <button type="submit" disabled={loading} style={bS}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setErr('');
                  setOk('');
                }}
                style={lkS}
              >
                Forgot password?
              </button>
            </div>
            <div
              style={{ height: 1, background: '#1a2d47', margin: '12px 0' }}
            />
            <div
              style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}
            >
              No account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErr('');
                  setOk('');
                }}
                style={lkS}
              >
                Request access
              </button>
            </div>
          </form>
        )}
        {mode === 'signup' && (
          <form onSubmit={doSignup}>
            <div
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#f0f4fa',
                marginBottom: 4,
              }}
            >
              Start your program
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Create your PLANRR account
            </div>
            <label style={lS}>Full name</label>
            <input
              type="text"
              value={fn}
              onChange={(e) => setFn(e.target.value)}
              placeholder="Jane Smith"
              style={iS}
            />
            <label style={lS}>Work email</label>
            <input
              type="email"
              value={fe}
              onChange={(e) => setFe(e.target.value)}
              placeholder="you@county.gov"
              style={iS}
              required
            />
            <label style={lS}>Organization name</label>
            <input
              type="text"
              value={fo}
              onChange={(e) => setFo(e.target.value)}
              placeholder="San Joaquin County OES"
              style={iS}
              required
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0 12px',
              }}
            >
              <div>
                <label style={lS}>Jurisdiction type</label>
                <select
                  value={fj}
                  onChange={(e) => setFj(e.target.value)}
                  style={{ ...iS, marginBottom: 12 }}
                >
                  <option value="">Select type...</option>
                  <option>County</option>
                  <option>Municipal</option>
                  <option>State</option>
                  <option>Tribal</option>
                  <option>Territory</option>
                  <option>University / College</option>
                  <option>Hospital / Healthcare</option>
                  <option>Private Sector</option>
                  <option>Federal Agency</option>
                </select>
              </div>
              <div>
                <label style={lS}>State</label>
                <select
                  value={fs}
                  onChange={(e) => setFs(e.target.value)}
                  style={{ ...iS, marginBottom: 12 }}
                >
                  <option value="">Select state...</option>
                  {[
                    'AL',
                    'AK',
                    'AZ',
                    'AR',
                    'CA',
                    'CO',
                    'CT',
                    'DE',
                    'FL',
                    'GA',
                    'HI',
                    'ID',
                    'IL',
                    'IN',
                    'IA',
                    'KS',
                    'KY',
                    'LA',
                    'ME',
                    'MD',
                    'MA',
                    'MI',
                    'MN',
                    'MS',
                    'MO',
                    'MT',
                    'NE',
                    'NV',
                    'NH',
                    'NJ',
                    'NM',
                    'NY',
                    'NC',
                    'ND',
                    'OH',
                    'OK',
                    'OR',
                    'PA',
                    'RI',
                    'SC',
                    'SD',
                    'TN',
                    'TX',
                    'UT',
                    'VT',
                    'VA',
                    'WA',
                    'WV',
                    'WI',
                    'WY',
                    'DC',
                    'PR',
                    'GU',
                    'VI',
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <label style={lS}>Password</label>
            <input
              type="password"
              value={fp}
              onChange={(e) => setFp(e.target.value)}
              placeholder="8 or more characters"
              style={iS}
              required
            />
            <label style={lS}>Confirm password</label>
            <input
              type="password"
              value={fp2}
              onChange={(e) => setFp2(e.target.value)}
              placeholder="Repeat password"
              style={iS}
              required
            />
            <button type="submit" disabled={loading} style={bS}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <div
              style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}
            >
              Have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErr('');
                  setOk('');
                }}
                style={lkS}
              >
                Sign in
              </button>
            </div>
          </form>
        )}
        {mode === 'reset' && (
          <form onSubmit={doReset}>
            <div
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#f0f4fa',
                marginBottom: 4,
              }}
            >
              Reset password
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              We will send a reset link to your email
            </div>
            <label style={lS}>Work email</label>
            <input
              type="email"
              value={fe}
              onChange={(e) => setFe(e.target.value)}
              placeholder="you@county.gov"
              style={iS}
              required
            />
            {!ok && (
              <button type="submit" disabled={loading} style={bS}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErr('');
                setOk('');
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'none',
                color: '#94a3b8',
                border: '1px solid #1e3a5f',
                borderRadius: 7,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function FirstRunWelcome({ onDone, setView }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      t: 'Welcome to planrr.app',
      b: 'Your program is ready with all 73 EMAP standards. Here are 3 things to do first.',
      a: 'Get started',
    },
    {
      t: 'Set up your profile',
      b: 'Go to Settings and enter your organization name, jurisdiction, state, and EM contact. This flows into every report and AI document.',
      a: 'Next',
      lnk: 'settings',
      ll: 'Open Settings',
    },
    {
      t: 'Drop in your documents',
      b: 'Use Bulk Doc Intake to upload your EOP, COOP, AARs and plans. AI maps each one to the relevant EMAP standards automatically.',
      a: 'Next',
      lnk: 'intake',
      ll: 'Open Bulk Intake',
    },
    {
      t: 'Build your hazard profile',
      b: 'Go to SPR/THIRA to profile your jurisdiction hazards. Drop in an existing THIRA and AI extracts every hazard automatically. Satisfies EMAP 4.1.',
      a: 'Open planrr.app',
      lnk: 'thira',
      ll: 'Open SPR/THIRA',
      last: true,
    },
  ];
  const s = steps[step];
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(8,15,30,0.85)',
          zIndex: 98,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 99,
          width: 460,
          maxWidth: 'calc(100vw - 40px)',
          background: '#0d1829',
          border: '1px solid rgba(194,150,74,0.3)',
          borderRadius: 12,
          padding: '32px 36px',
        }}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                height: 3,
                flex: 1,
                borderRadius: 2,
                background: i <= step ? '#c2964a' : '#1e3a5f',
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#f0f4fa',
            marginBottom: 8,
          }}
        >
          {s.t}
        </div>
        <div
          style={{
            fontSize: 14,
            color: '#94a3b8',
            lineHeight: 1.7,
            marginBottom: 22,
          }}
        >
          {s.b}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => (s.last ? onDone() : setStep((p) => p + 1))}
            style={{
              background: '#c2964a',
              color: '#080f1e',
              border: 'none',
              borderRadius: 7,
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {s.a}
          </button>
          {s.lnk && (
            <button
              onClick={() => {
                setView(s.lnk);
                onDone();
              }}
              style={{
                background: 'none',
                color: '#c2964a',
                border: '1px solid rgba(194,150,74,0.3)',
                borderRadius: 7,
                padding: '9px 16px',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {s.ll}
            </button>
          )}
        </div>
        {step > 0 && (
          <button
            onClick={() => setStep((p) => p - 1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              fontSize: 11,
              cursor: 'pointer',
              marginTop: 12,
              padding: 0,
            }}
          >
            Back
          </button>
        )}
      </div>
    </>
  );
}

function Onboarding({ onComplete }) {
  const [name, setName] = useState('');
  const [jur, setJur] = useState('');
  const [state, setState] = useState('');
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: B.sidebar,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle,${B.teal}12,tranSPRent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          background: 'rgba(255,255,255,0.97)',
          border: `1px solid ${B.border}`,
          borderRadius: 16,
          padding: 44,
          width: 480,
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: B.sidebar,
                borderRadius: 12,
                padding: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BrainIcon size={28} color={B.teal} strokeWidth={1.3} />
            </div>
            <Wordmark size="lg" />
          </div>
          <p style={{ fontSize: 14, color: B.muted, lineHeight: 1.65 }}>
            AI-powered EM program management — EMAP accreditation, exercises &
            AARs, personnel credentialing, and operations in one place.
          </p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Label>Organization Name</Label>
          <FInput
            value={name}
            onChange={setName}
            placeholder="e.g. San Joaquin County OES"
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div>
            <Label>Jurisdiction Type</Label>
            <FSel value={jur} onChange={setJur}>
              <option value="">Select…</option>
              {[
                'State EM Agency',
                'County / Parish EM',
                'Municipal EM',
                'Tribal EM',
                'Territorial EM',
                'Federal Agency EM',
                'Campus / University EM',
                'Private Sector EM',
                'Other',
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </FSel>
          </div>
          <div>
            <Label>State</Label>
            <FSel value={state} onChange={setState}>
              <option value="">Select state…</option>
              {US_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </FSel>
          </div>
        </div>
        <button
          onClick={() => name.trim() && onComplete(name.trim(), jur, state)}
          disabled={!name.trim()}
          style={{
            width: '100%',
            background: name.trim() ? B.teal : '#edf2f4',
            color: name.trim() ? '#fff' : B.faint,
            border: 'none',
            borderRadius: 9,
            padding: '14px',
            fontSize: 14,
            fontWeight: 800,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontFamily: "'DM Sans',sans-serif",
            transition: 'all 0.2s',
            letterSpacing: '0.01em',
          }}
        >
          Plan Smartr →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════ */
export default function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('dashboard');
  const [onboarding, setOnboarding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authed, setAuthed] = useState(isLoggedIn());
  const [firstRun, setFirstRun] = useState(false);
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!authed) return;
    loadData().then((d) => {
      if (d) {
        const stds = {};
        ALL_STANDARDS.forEach((s) => {
          stds[s.id] = d.standards?.[s.id] || initRecord();
        });
        setData({
          ...initData(),
          ...d,
          standards: stds,
          employees: d.employees || [],
          grants: d.grants || [],
          thira: d.thira || { hazards: [], lastUpdated: '', nextDue: '' },
          capItems: d.capItems || [],
          activityLog: d.activityLog || [],
          journey: d.journey || {},
        });
        if (!d.orgName) setOnboarding(true);
        else setFirstRun(true);
      } else {
        const stds = {};
        ALL_STANDARDS.forEach((s) => {
          stds[s.id] = initRecord();
        });
        setData({ ...initData(), standards: stds });
        setOnboarding(true);
      }
      setLoaded(true);
    });
  }, []);
  const updateData = useCallback((updater) => {
    setData((prev) => {
      const next =
        typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveData(next), 500);
      return next;
    });
  }, []);
  // Global search keyboard shortcut
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  const handleOnboard = useCallback((name, jur, state) => {
    const stds = {};
    ALL_STANDARDS.forEach((s) => {
      stds[s.id] = initRecord();
    });
    const d = {
      ...initData(),
      orgName: name,
      jurisdiction: jur,
      state,
      standards: stds,
    };
    setData(d);
    setOnboarding(false);
    setFirstRun(true);
    saveData(d);
  }, []);
  if (!authed) return <AuthScreen onAuth={() => setAuthed(true)} />;
  if (!loaded)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: B.sidebar,
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: '14px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <BrainIcon size={34} color={B.teal} strokeWidth={1.2} />
        </div>
        <Wordmark dark size="md" />
        <div style={{ color: B.sidebarMuted, fontSize: 12 }}>
          Loading your program…
        </div>
      </div>
    );
  if (onboarding) return <Onboarding onComplete={handleOnboard} />;
  const notifications = buildNotifications(data);
  return (
    <div
      style={{
        display: 'flex',
        background: B.bg,
        minHeight: '100vh',
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800;9..40,900&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:${B.bg};}::-webkit-scrollbar-thumb{background:#cdd6da;border-radius:3px;}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes typingDot{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-3px);opacity:1}}@media print{#planrr-sidebar{display:none!important}#planrr-topbar{display:none!important}#planrr-main{margin-left:0!important}}`}</style>
      <div id="planrr-sidebar">
        <Sidebar
          view={view}
          setView={setView}
          data={data}
          notifCount={notifications.length}
          orgName={data.orgName}
          onEditOrg={() => {
            const n = prompt('Organization name:', data.orgName);
            if (n) updateData((p) => ({ ...p, orgName: n }));
          }}
        />
      </div>
      <div
        id="planrr-main"
        style={{ marginLeft: 244, flex: 1, minHeight: '100vh' }}
      >
        <div
          id="planrr-topbar"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(240,244,245,0.96)',
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${B.border}`,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            padding: '0 28px',
            gap: 10,
          }}
        >
          <div
            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 13, color: B.muted, fontWeight: 500 }}>
              {data.orgName && (
                <>
                  <span style={{ color: B.text, fontWeight: 700 }}>
                    {data.orgName}
                  </span>{' '}
                  ·{' '}
                </>
              )}
              {view === 'journey' && 'Accreditation Journey'}
              {view === 'dashboard' && 'Dashboard'}
              {view === 'accreditation' && 'EMAP Standards'}
              {view === 'intake' && 'Bulk Document Intake'}
              {view === 'package' && 'Accreditation Package Builder'}
              {view === 'training' && 'Training Manager'}
              {view === 'exercises' && 'Exercises & AARs'}
              {view === 'partners' && 'Partner Registry'}
              {view === 'plans' && 'Plan Library'}
              {view === 'resources' && 'Resource Inventory'}
              {view === 'employees' && 'Employees & Credentials'}
              {view === 'calendar' && 'Program Calendar'}
              {view === 'reports' && 'Compliance Report'}
              {view === 'assistant' && 'AI Assistant'}
              {view === 'grants' && 'Grant Tracker'}
              {view === 'thira' && 'THIRA/SPR'}
              {view === 'cap' && 'Corrective Action Program'}
              {view === 'activity' && 'Activity Log'}
              {view === 'settings' && 'Settings'}
            </span>
          </div>
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: '#f4f7f8',
              border: `1px solid ${B.border}`,
              borderRadius: 8,
              padding: '5px 12px',
              cursor: 'pointer',
              fontSize: 12,
              color: B.faint,
              fontFamily: "'DM Sans',sans-serif",
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = B.teal)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = B.border)}
          >
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke={B.faint}
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search
            <kbd
              style={{
                fontSize: 9,
                color: B.faint,
                background: '#e8ecee',
                border: `1px solid ${B.border}`,
                borderRadius: 3,
                padding: '1px 4px',
                lineHeight: 1.4,
              }}
            >
              ⌘K
            </kbd>
          </button>
          {notifications.length > 0 && (
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {notifications.slice(0, 2).map((n) => (
                <div
                  key={n.id}
                  onClick={() => setView(n.module)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background:
                      n.urgency === 'overdue' || n.urgency === 'urgent'
                        ? B.redLight
                        : B.amberLight,
                    border: `1px solid ${
                      n.urgency === 'overdue' || n.urgency === 'urgent'
                        ? B.redBorder
                        : B.amberBorder
                    }`,
                    borderRadius: 8,
                    padding: '3px 9px',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background:
                        n.urgency === 'ok'
                          ? B.green
                          : n.urgency === 'soon'
                          ? B.amber
                          : B.red,
                    }}
                  />
                  <span
                    style={{
                      color:
                        n.urgency === 'overdue' || n.urgency === 'urgent'
                          ? B.red
                          : '#92400e',
                      fontWeight: 600,
                    }}
                  >
                    {n.title}
                  </span>
                </div>
              ))}
              {notifications.length > 2 && (
                <span style={{ fontSize: 11, color: B.faint }}>
                  +{notifications.length - 2}
                </span>
              )}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              opacity: 0.4,
            }}
          >
            <BrainIcon size={11} color={B.teal} strokeWidth={1.5} />
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: B.muted,
                letterSpacing: '0.1em',
              }}
            >
              PLANRR
            </span>
          </div>
          <button
            onClick={sbSignOut}
            style={{
              fontSize: 10,
              color: B.faint,
              background: 'none',
              border: '1px solid ' + B.border,
              borderRadius: 5,
              padding: '3px 8px',
              cursor: 'pointer',
              marginLeft: 6,
            }}
          >
            Sign out
          </button>
        </div>
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          {view === 'journey' && (
            <AccreditationJourney
              data={data}
              updateData={updateData}
              setView={setView}
            />
          )}
          {view === 'dashboard' && (
            <Dashboard data={data} setView={setView} orgName={data.orgName} />
          )}
          {view === 'accreditation' && (
            <AccreditationView data={data} updateData={updateData} />
          )}
          {view === 'intake' && (
            <BulkIntake data={data} updateData={updateData} />
          )}
          {view === 'package' && (
            <PackageBuilder data={data} setView={setView} />
          )}
          {view === 'training' && (
            <TrainingManager data={data} setData={updateData} />
          )}
          {view === 'exercises' && (
            <ExerciseManager data={data} setData={updateData} />
          )}
          {view === 'partners' && (
            <PartnerRegistry data={data} setData={updateData} />
          )}
          {view === 'plans' && <PlanLibrary data={data} setData={updateData} />}
          {view === 'resources' && (
            <ResourcesView data={data} setData={updateData} />
          )}
          {view === 'employees' && (
            <EmployeesView data={data} setData={updateData} />
          )}
          {view === 'calendar' && <ProgramCalendar data={data} />}
          {view === 'reports' && (
            <ReportsView data={data} orgName={data.orgName} />
          )}
          {view === 'assistant' && (
            <AiAssistantView data={data} orgName={data.orgName} />
          )}
          {view === 'grants' && (
            <GrantTracker data={data} setData={updateData} />
          )}
          {view === 'thira' && <ThiraView data={data} setData={updateData} />}
          {view === 'cap' && <CapDashboard data={data} setData={updateData} />}
          {view === 'activity' && (
            <ActivityLogView data={data} setData={updateData} />
          )}
          {view === 'settings' && (
            <SettingsView data={data} updateData={updateData} />
          )}
        </div>
        {firstRun && !onboarding && (
          <FirstRunWelcome
            onDone={() => setFirstRun(false)}
            setView={setView}
          />
        )}
        {searchOpen && (
          <GlobalSearch
            data={data}
            setView={(v) => {
              setView(v);
            }}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
