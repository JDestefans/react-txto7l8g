import React, { Component } from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate, Link } from 'react-router-dom';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SharedReport from './pages/SharedReport';
import Founder from './pages/Founder';
import { STARTER_PACKS, applyStarterPack } from './data/starterPacks';
import { downloadICal } from './services/calendar';
import { buildShareURL } from './services/shareReport';
import { buildGrantNarrativePrompt } from './services/grantHelper';
// pdfExtract loaded dynamically to avoid Jest import.meta issues

/* --- ERROR BOUNDARY ----------------------------------- */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#1C1F22', flexDirection: 'column', gap: 16,
          fontFamily: "'DM Sans',sans-serif",
        }}>
          <div style={{ fontSize: 48 }}>⚠</div>
          <div style={{ color: '#f0f4fa', fontSize: 20, fontWeight: 700 }}>Something went wrong</div>
          <div style={{ color: '#94a3b8', fontSize: 14, maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
            An unexpected error occurred. Please reload the page to continue.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8, background: '#c2964a', color: '#141719', border: 'none',
              padding: '10px 24px', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* --- VIEW TITLES (for document.title) ----------------- */
const VIEW_TITLES = {
  dashboard: 'Dashboard',
  accreditation: 'EMAP Standards',
  intake: 'Bulk Document Intake',
  package: 'Accreditation Package Builder',
  training: 'Training Manager',
  exercises: 'Exercises & AARs',
  partners: 'Partner Registry',
  plans: 'Plans & SOPs',
  resources: 'Resources',
  employees: 'Personnel',
  calendar: 'Program Calendar',
  reports: 'Compliance Report',
  assistant: 'AI Assistant',
  grants: 'Grants & Funding',
  thira: 'Hazard Analysis',
  cap: 'Corrective Action Program',
  activity: 'Activity Log',
  settings: 'My Program',
  templates: 'Document Templates',
  evidence: 'Evidence Export',
  recovery: 'Recovery Planning',
  mutualaid: 'Mutual Aid Map',
  journey: 'Accreditation Journey',
};

/* --- BRAND (fixed contrast) --------------------------- */
const B = {
  teal: '#1BC9C4',
  tealDark: '#13A8A4',
  tealLight: '#E6FAFA',
  tealBorder: '#9EECEA',
  bg: '#F2F5F7',
  card: '#FFFFFF',
  border: '#E2E8EA',
  text: '#111827',
  muted: '#374151',
  faint: '#6B7280', // - fixed contrast
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

/* --- WORDMARK + PLACEHOLDER MARK ---------------------- */
const GOLD = '#c2964a';

/* --- LOADING SKELETON --------------------------------- */
function Skeleton({ width, height = 14, style }) {
  return (
    <div style={{
      width: width || '100%', height, borderRadius: 6,
      background: `linear-gradient(90deg, ${B.border} 25%, #e8ecee 50%, ${B.border} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease infinite',
      ...style,
    }} />
  );
}

function ViewSkeleton() {
  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', animation: 'fadeIn 0.3s ease' }}>
      <Skeleton width={220} height={20} style={{ marginBottom: 24 }} />
      <Skeleton width="60%" height={14} style={{ marginBottom: 12 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 12 }} />
      <Skeleton width="45%" height={14} style={{ marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: B.card, border: `1px solid ${B.border}`, borderRadius: 12, padding: 20 }}>
            <Skeleton width={100} height={12} style={{ marginBottom: 12 }} />
            <Skeleton height={28} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Minimal square mark - placeholder until final logo is locked */
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

/* --- ALL 73 STANDARDS --------------------------------- */
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

/* --- CASCADING DEPENDENCY MAP (EMAP Applicant Guide) -- */
const STD_DEPS = {
  // 4.1 is the foundation - all peer reviews require it first
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
  // 4.11 requires 4.4-4.9 all complete
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

/* --- FEMA/NIMS ALIGNMENT MAPPING --- */
const NIMS_STANDARDS = [
  '4.6.1',
  '4.6.2',
  '4.6.3',
  '4.6.4',
  '4.6.5',
  '4.6.6',
  '4.10.1',
  '4.10.2',
  '4.10.3',
  '4.10.4',
  '4.10.5',
  '4.10.6',
  '4.8.1',
  '4.8.4',
];

/* --- GRANT-to-EMAP ALIGNMENT --- */
const GRANT_EMAP_MAP = {
  EMPG: ['3.1.1', '3.4.1', '3.4.2', '4.1.1', '4.5.1', '4.10.1', '4.11.1'],
  BSIR: ['4.3.1', '4.3.2', '4.6.1'],
  UASI: ['4.3.1', '4.6.1', '4.7.1', '4.8.1', '4.9.1'],
  HMGP: ['4.2.1', '4.2.2', '4.2.3', '4.2.4'],
  'BRIC/PDM': ['4.2.1', '4.2.2', '4.2.3'],
  SHSP: ['4.3.1', '4.6.1', '4.7.1'],
  FMA: ['4.2.1', '4.2.4'],
};
const DEP_LABELS = {
  '4.1.1':
    'EMAP requires 4.1 (Hazard ID) to be completed before this section can be peer-reviewed',
  '4.6.1':
    'EMAP requires 4.6 (Incident Management) before 4.10 can be peer-reviewed',
  '4.9.1': 'EMAP requires sections 4.4-4.9 before 4.11 can be peer-reviewed',
};

/* --- AI MODEL ROUTING --------------------------------
   Routes tasks to appropriate model tiers to control cost:
   - 'fast'   → cheaper model for simple tasks (summaries, short drafts, label lookups)
   - 'strong' → capable model for complex reasoning (gap analysis, doc interpretation, multi-step)
   getModelTier(operation) maps operation strings to tiers.
   The tier is sent as `model_tier` in the request body so the
   backend Edge Function can select the right vendor model.
-------------------------------------------------------- */
/* Haiku handles nearly everything. Only PDF/image interpretation and
   multi-document gap analysis benefit from a stronger model.
   fast = Haiku (cheap, fast, good for 95% of tasks)
   strong = Sonnet (only when reasoning across complex documents) */
const MODEL_TIER_MAP = {
  general: 'fast',
  draft_rationale: 'fast',
  draft_aar: 'fast',
  finalize_aar: 'fast',
  exec_summary: 'fast',
  training_needs: 'fast',
  grant_guidance: 'fast',
  thira_analysis: 'fast',
  spr_generation: 'fast',
  template_gen: 'fast',
  action_plan: 'fast',
  interpret: 'fast',
  evidence: 'fast',
  interpret_doc: 'strong',
  bulk_intake: 'strong',
  gap_analysis: 'strong',
};

function getModelTier(operation) {
  return MODEL_TIER_MAP[operation] || 'fast';
}

function trackAICall() {
  try {
    const key = 'planrr_ai_usage';
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const stored = JSON.parse(localStorage.getItem(key) || '{}');
    if (stored.month !== monthKey) {
      localStorage.setItem(key, JSON.stringify({ month: monthKey, count: 1 }));
    } else {
      stored.count = (stored.count || 0) + 1;
      localStorage.setItem(key, JSON.stringify(stored));
    }
  } catch {}
}

function getAIUsageCount() {
  try {
    const key = 'planrr_ai_usage';
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const stored = JSON.parse(localStorage.getItem(key) || '{}');
    return stored.month === monthKey ? (stored.count || 0) : 0;
  } catch { return 0; }
}

async function callAI(system, prompt, onChunk, operation) {
  const op = operation || 'general';
  const tier = getModelTier(op);
  trackAICall();
  const res = await fetch(
    SB_URL + '/functions/v1/ai-proxy',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SB_KEY },
      body: JSON.stringify({
        operation: op,
        model_tier: tier,
        stream: true,
        system,
        prompt,
        max_tokens: tier === 'strong' ? 1600 : 1200,
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
  const tier = getModelTier('interpret_doc');
  const res = await fetch(
    SB_URL + '/functions/v1/ai-proxy',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SB_KEY },
      body: JSON.stringify({
        operation: 'interpret_doc',
        model_tier: tier,
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

/* --- DOCUMENT → EMAP STANDARD MAPPING PIPELINE --------
   Multi-stage pipeline for mapping uploaded documents to EMAP standards:
   1. Chunk & summarize with fast model (cheaper)
   2. Compute similarity against EMAP standard text to find candidates
   3. Ask strong model on narrowed set for precise mapping + rationale
   4. Cache results in localStorage keyed by content hash
-------------------------------------------------------- */
const DOC_MAPPING_CACHE_KEY = 'planrr_doc_mapping_cache';

function getDocMappingCache() {
  try {
    return JSON.parse(localStorage.getItem(DOC_MAPPING_CACHE_KEY) || '{}');
  } catch { return {}; }
}

function setDocMappingCache(hash, result) {
  const cache = getDocMappingCache();
  cache[hash] = { result, ts: Date.now() };
  const keys = Object.keys(cache);
  if (keys.length > 50) {
    const oldest = keys.sort((a, b) => cache[a].ts - cache[b].ts);
    oldest.slice(0, keys.length - 50).forEach(k => delete cache[k]);
  }
  localStorage.setItem(DOC_MAPPING_CACHE_KEY, JSON.stringify(cache));
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return 'dh_' + Math.abs(h).toString(36);
}

function textSimilarity(a, b) {
  const wa = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wb = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  let overlap = 0;
  wa.forEach(w => { if (wb.has(w)) overlap++; });
  return overlap / Math.max(wa.size, wb.size, 1);
}

async function mapDocToEMAP(docText, allStandards, onStatus) {
  const hash = simpleHash(docText.slice(0, 2000));
  const cached = getDocMappingCache()[hash];
  if (cached) {
    if (onStatus) onStatus('Using cached mapping results');
    return cached.result;
  }
  if (onStatus) onStatus('Step 1/3: Summarizing document...');
  let summary = '';
  await callAI(
    'You are a document summarizer for emergency management. Extract key topics, capabilities, and compliance areas in 200 words max. No markdown.',
    `Summarize this document for EMAP standard matching:\n\n${docText.slice(0, 8000)}`,
    (chunk) => { summary += chunk; },
    'general'
  );
  if (onStatus) onStatus('Step 2/3: Finding candidate standards...');
  const scored = allStandards.map(s => ({
    ...s,
    score: textSimilarity(summary, `${s.id} ${s.title} ${s.description || ''}`)
  }));
  scored.sort((a, b) => b.score - a.score);
  const candidates = scored.slice(0, 10);
  if (onStatus) onStatus('Step 3/3: AI matching to standards...');
  const candidateText = candidates.map(c =>
    `${c.id}: ${c.title}${c.description ? ' - ' + c.description : ''}`
  ).join('\n');
  let mappingResult = '';
  await callAI(
    'You are an EMAP EMS 5-2022 expert. Given a document summary and candidate standards, determine which standards this document maps to. Return a JSON array of objects with fields: standardId, confidence (high/medium/low), rationale (one sentence). Only include standards that genuinely apply.',
    `Document summary:\n${summary}\n\nCandidate EMAP standards:\n${candidateText}\n\nReturn JSON array of matching standards with rationale.`,
    (chunk) => { mappingResult += chunk; },
    'gap_analysis'
  );
  let parsed;
  try {
    const jsonMatch = mappingResult.match(/\[[\s\S]*\]/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    parsed = [{ standardId: 'parse_error', confidence: 'low', rationale: mappingResult }];
  }
  const result = { summary, mappings: parsed, candidates: candidates.map(c => c.id) };
  setDocMappingCache(hash, result);
  return result;
}

const SYS =
  'You are an EMAP accreditation and emergency management expert in PLANRR - Plan Smartr. Deep expertise in EMAP EMS 5-2022, HSEEP, and EM program management. Be specific, practical, and concise. No markdown headers.';

/* --- PLAN & QUOTA DEFINITIONS -------------------------
   Per-org plan limits: seat caps and monthly AI call quotas.
   Enforcement helpers check these limits before adding users
   or making AI calls, prompting upgrade when exceeded.
-------------------------------------------------------- */
const PLAN_LIMITS = {
  solo: { label: 'Solo Operator', seats: 1, aiCallsPerMonth: 200, price: 79 },
  small_team: { label: 'Small Team', seats: 5, aiCallsPerMonth: 1000, price: 149 },
  full_program: { label: 'Full Program', seats: Infinity, aiCallsPerMonth: 5000, price: 199 },
  enterprise: { label: 'Enterprise', seats: Infinity, aiCallsPerMonth: Infinity, price: null },
};

const STRIPE_BUY_LINKS = {
  solo: process.env.REACT_APP_STRIPE_BUY_LINK_SOLO || 'https://buy.stripe.com/bJe14odeGdG0cOv43LgrS00',
  small_team: process.env.REACT_APP_STRIPE_BUY_LINK_SMALL_TEAM || 'https://buy.stripe.com/7sY14o3E659u4hZ9o5grS01',
  full_program: process.env.REACT_APP_STRIPE_BUY_LINK_FULL_PROGRAM || 'https://buy.stripe.com/8x228s4Ia31m3dV7fXgrS02',
};

function getPlanLimits(planId) {
  return PLAN_LIMITS[planId] || PLAN_LIMITS.solo;
}

function checkSeatLimit(data) {
  const plan = getPlanLimits(data.plan || 'solo');
  const currentSeats = (data.employees || []).length + 1;
  if (currentSeats >= plan.seats) {
    return { allowed: false, message: `Your ${plan.label} plan supports up to ${plan.seats} seat${plan.seats > 1 ? 's' : ''}. Upgrade to add more team members.`, plan: plan.label };
  }
  return { allowed: true };
}

function checkAIQuota(data) {
  const plan = getPlanLimits(data.plan || 'solo');
  const used = data.aiCallsThisMonth || 0;
  if (used >= plan.aiCallsPerMonth) {
    return { allowed: false, message: `You've used all ${plan.aiCallsPerMonth} AI calls for this month on your ${plan.label} plan. Upgrade for higher limits.`, plan: plan.label };
  }
  return { allowed: true, remaining: plan.aiCallsPerMonth - used };
}

function incrementAIUsage(data, updateData) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  if (data.aiUsageMonth !== monthKey) {
    updateData({ aiUsageMonth: monthKey, aiCallsThisMonth: 1 });
  } else {
    updateData({ aiCallsThisMonth: (data.aiCallsThisMonth || 0) + 1 });
  }
}

async function guardedCallAI(data, updateData, system, prompt, onChunk, operation) {
  const quota = checkAIQuota(data);
  if (!quota.allowed) {
    throw new Error(quota.message);
  }
  incrementAIUsage(data, updateData);
  return callAI(system, prompt, onChunk, operation);
}

/* --- FILE UTILS --------------------------------------- */
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
    : '-';
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

/* --- DATA --------------------------------------------- */
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
    recovery: { priorities: [], functions: {}, notes: '' },
    mutualAid: [],
    incidents: [],
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

/* --- CROSS-PLATFORM DATA SYNC: Program Ops → EMAP Standards --- */
function syncStandardsFromOps(data) {
  const stds = { ...(data.standards || {}) };
  let changed = false;
  // Helper: promote a standard to in_progress if it's not_started, append auto-note
  const promote = (stdId, note) => {
    const cur = stds[stdId] || initRecord();
    if (cur.status === 'not_started') {
      const autoTag = '[Auto-linked] ';
      const existingNote = cur.notes || '';
      const newNote = existingNote.includes(autoTag)
        ? existingNote
        : (existingNote ? existingNote + '\n' : '') + autoTag + note;
      stds[stdId] = {
        ...cur,
        status: 'in_progress',
        notes: newNote,
        updatedAt: Date.now(),
      };
      changed = true;
    }
  };
  // Plans → EMAP sections (4.4 Continuity, 4.5 Operational, 4.2 Mitigation, 4.8 Comms)
  const PLAN_EMAP = {
    EOP: ['4.5.1', '4.5.2', '4.5.3', '4.5.5'],
    COOP: ['4.4.1', '4.4.2', '4.4.3', '4.4.4', '4.4.6'],
    'COG Plan': ['4.4.2', '4.4.5'],
    'Hazard Mitigation Plan': ['4.2.1', '4.2.2', '4.2.3'],
    'Recovery Plan': ['4.5.1', '4.5.4'],
    'Communications Plan': ['4.8.1', '4.8.3'],
    'Evacuation Plan': ['4.5.5'],
  };
  (data.plans || []).forEach((p) => {
    const refs = PLAN_EMAP[p.type];
    if (refs)
      refs.forEach((sid) =>
        promote(sid, `${p.type} "${p.name}" added to Plan Library`)
      );
  });
  // Training → 4.10 Training standards
  if ((data.training || []).length >= 1) {
    ['4.10.1', '4.10.3', '4.10.5'].forEach((sid) =>
      promote(sid, `${data.training.length} training record(s) in system`)
    );
  }
  if ((data.training || []).length >= 5) {
    ['4.10.2', '4.10.4'].forEach((sid) =>
      promote(
        sid,
        `${data.training.length} training records demonstrate needs coverage`
      )
    );
  }
  // Exercises → 4.11 Exercises, Evaluations & Corrective Actions
  if ((data.exercises || []).length >= 1) {
    promote('4.11.1', `${data.exercises.length} exercise(s) logged`);
    promote(
      '4.11.2',
      `${data.exercises.length} exercise(s) available for evaluation`
    );
  }
  if ((data.exercises || []).filter((e) => e.aarFinal).length >= 1) {
    promote('4.11.2', 'Exercise with final AAR on file');
  }
  if (
    (data.exercises || []).some((e) => (e.corrective || []).length > 0) ||
    (data.capItems || []).length > 0
  ) {
    promote('4.11.3', 'Corrective actions tracked in system');
  }
  // Partners/MOUs → 4.7 Resource Management & Mutual Aid
  if ((data.partners || []).length >= 1) {
    ['4.7.3', '4.7.4'].forEach((sid) =>
      promote(sid, `${data.partners.length} partner agreement(s) on file`)
    );
  }
  if ((data.partners || []).length >= 3) {
    promote(
      '4.7.1',
      `${data.partners.length} partner agreements support resource management`
    );
  }
  // THIRA/Hazards → 4.1 Hazard ID & Risk Assessment
  const hazards = data.thira?.hazards || [];
  if (hazards.length >= 1) {
    ['4.1.1', '4.1.2'].forEach((sid) =>
      promote(sid, `${hazards.length} hazard(s) profiled in THIRA`)
    );
  }
  if (hazards.length >= 3) {
    promote('4.1.3', 'THIRA hazard profile established with multiple hazards');
  }
  // Employees/Personnel → 4.6 Incident Management (personnel assigned to roles)
  if ((data.employees || []).length >= 1) {
    promote(
      '4.6.4',
      `${data.employees.length} personnel in roster for incident role assignment`
    );
  }
  // Resources → 4.7.5, 4.7.6
  if ((data.resources || []).length >= 1) {
    ['4.7.5', '4.7.6'].forEach((sid) =>
      promote(sid, `${data.resources.length} resource(s) inventoried`)
    );
  }
  // Grants → 3.4 Administration & Finance
  if ((data.grants || []).filter((g) => g.status === 'active').length >= 1) {
    ['3.4.1', '3.4.2'].forEach((sid) =>
      promote(sid, 'Active grant funding tracked')
    );
  }
  return changed ? stds : null;
}
function getUserId() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!s || !s.user) return null;
    return s.user.id;
  } catch { return null; }
}

function getLocalKey() {
  const uid = getUserId();
  return uid ? `planrr_v3_${uid}` : 'planrr_v3';
}

function getAccessToken() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    return s?.access_token || null;
  } catch { return null; }
}

async function loadData() {
  const localKey = getLocalKey();
  const token = getAccessToken();
  if (token) {
    try {
      const r = await fetch(SB_URL + '/rest/v1/program_data?select=data&limit=1', {
        headers: {
          apikey: SB_KEY,
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });
      if (r.ok) {
        const rows = await r.json();
        if (rows.length > 0 && rows[0].data) {
          localStorage.setItem(localKey, JSON.stringify(rows[0].data));
          return rows[0].data;
        }
      }
    } catch (e) {
      console.warn('planrr: cloud load failed, using local', e.message);
    }
  }
  try {
    const r = localStorage.getItem(localKey);
    if (r) return JSON.parse(r);
    const legacy = localStorage.getItem('planrr_v3');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      localStorage.setItem(localKey, legacy);
      return parsed;
    }
    return null;
  } catch { return null; }
}

let _saveQueued = false;
async function saveData(d) {
  const localKey = getLocalKey();
  try {
    localStorage.setItem(localKey, JSON.stringify(d));
  } catch {}
  const token = getAccessToken();
  const userId = getUserId();
  if (!token || !userId || _saveQueued) return;
  _saveQueued = true;
  setTimeout(async () => {
    _saveQueued = false;
    try {
      const r = await fetch(SB_URL + '/rest/v1/program_data', {
        method: 'POST',
        headers: {
          apikey: SB_KEY,
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ user_id: userId, data: d }),
      });
      if (!r.ok) console.warn('planrr: save to cloud failed', r.status);
    } catch (e) {
      console.warn('planrr: save to cloud error', e.message);
    }
  }, 2000);
}

/* --- STATUS HELPERS ----------------------------------- */
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
        detail: d < 0 ? 'Expired - renew immediately' : `${d} days remaining`,
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
          detail: `${cr.name} - ${d < 0 ? 'Expired' : d + ' days'}`,
          module: 'employees',
        });
    });
  });
  return n;
}

/* --- SHARED UI ---------------------------------------- */
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
      gap: 6,
      padding: small ? '6px 12px' : '10px 20px',
      borderRadius: 10,
      border: primary || danger ? 'none' : `1px solid ${B.border}`,
      background: primary ? B.teal : danger ? B.red : B.card,
      color: primary || danger ? '#fff' : B.muted,
      fontSize: small ? 11 : 13,
      fontWeight: 700,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: "'DM Sans',sans-serif",
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      boxShadow: primary ? '0 2px 8px rgba(27,201,196,0.25)' : 'none',
    }}
    onMouseEnter={(e) => {
      if (!disabled && !loading) {
        if (primary) {
          e.currentTarget.style.background = B.tealDark;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(27,201,196,0.3)';
        } else if (!danger) {
          e.currentTarget.style.borderColor = B.teal;
          e.currentTarget.style.color = B.teal;
        }
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled && !loading) {
        if (primary) {
          e.currentTarget.style.background = B.teal;
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(27,201,196,0.25)';
        } else if (!danger) {
          e.currentTarget.style.borderColor = B.border;
          e.currentTarget.style.color = B.muted;
        }
      }
    }}
  >
    <span style={{ fontSize: 12 }}>{icon || ''}</span>
    {loading ? 'Working...' : label}
  </button>
);
const Card = ({ children, style, ...props }) => (
  <div
    style={{
      background: B.card,
      border: `1px solid ${B.border}`,
      borderRadius: 14,
      padding: '22px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.02)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
const Label = ({ children }) => (
  <div
    style={{
      fontSize: 11,
      color: B.muted,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontWeight: 600,
      marginBottom: 6,
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
      borderRadius: 10,
      padding: '10px 14px',
      color: B.text,
      fontSize: 13,
      fontFamily: "'DM Sans',sans-serif",
      outline: 'none',
      background: '#f8fafb',
      transition: 'all 0.15s ease',
      ...s,
    }}
    onFocus={(e) => {
      e.target.style.borderColor = B.teal;
      e.target.style.boxShadow = '0 0 0 3px rgba(27,201,196,0.1)';
      e.target.style.background = '#fff';
    }}
    onBlur={(e) => {
      e.target.style.borderColor = B.border;
      e.target.style.boxShadow = 'none';
      e.target.style.background = '#f8fafb';
    }}
  />
);

/* --- COACH BANNER SYSTEM ----------------------------- */
const COACH = {
  thira: {
    emoji: '🎯',
    title: 'Start Here: Know Your Threats',
    what: "A Threat & Hazard Identification Risk Assessment (THIRA) profiles every hazard your jurisdiction faces — natural disasters, technological incidents, human-caused threats. It's the foundation everything else is built on.",
    why: 'EMAP 4.1 requires a documented hazard identification and risk assessment. FEMA grants (EMPG, BSIR, HMGP) all reference your THIRA. Without it, your plans have no basis.',
    first:
      'List 3-5 hazards you know your area faces (floods, earthquakes, wildfire, etc.). For each one, estimate likelihood and impact. If you have an existing THIRA document, upload it and AI will extract everything automatically.',
    next: 'plans',
  },
  plans: {
    emoji: '📋',
    title: 'Build Your Plans',
    what: "Your Emergency Operations Plan (EOP), Continuity of Operations Plan (COOP), and supporting procedures are the playbooks your team follows during incidents. These aren't shelf documents — they're how people know what to do.",
    why: "EMAP 4.4 and 4.5 require an EOP, COOP, and supporting procedures. Plans must address all hazards identified in your THIRA (that's why hazards come first).",
    first:
      'Start with your EOP. If you have one, upload it. If not, go to AI Tools → Doc Templates to generate a starter EOP based on your hazard profile. Then add your COOP.',
    next: 'partners',
  },
  partners: {
    emoji: '🤝',
    title: 'Map Your Partners',
    what: 'Emergency management is never a solo operation. Partners include mutual aid agencies, NGOs (Red Cross, Salvation Army), private sector, neighboring jurisdictions, state/federal contacts, and utilities.',
    why: 'EMAP 4.3 requires documented stakeholder relationships. 4.7 requires mutual aid agreements. Assessors want to see signed MOUs and defined roles.',
    first:
      "Add your top 5 partners — the agencies you'd call first in a disaster. Include their contact info and what they bring (personnel, equipment, shelter, etc.). Upload any existing MOUs.",
    next: 'resources',
  },
  resources: {
    emoji: '📦',
    title: 'Inventory Your Resources',
    what: 'Resources are the people, equipment, facilities, and supplies your program can deploy. Think apparatus, shelters, generators, caches, vehicles, and specialized teams.',
    why: "EMAP 4.7 requires a resource management plan with documented capabilities and gaps. You can't request what you don't know you need, and you can't justify funding without a gap analysis.",
    first:
      "Start with your major resource categories: facilities, vehicles, equipment, supplies. For each, note quantity, condition, and who owns it. Flag gaps where you know you're short.",
    next: 'employees',
  },
  employees: {
    emoji: '👥',
    title: 'Track Your People',
    what: 'Personnel records include all staff and volunteers working in your EM program — their certifications (ICS, NIMS, CPR), training records, and credential expiration dates.',
    why: 'EMAP 4.6 requires personnel credentialing, NIMS compliance, and role-based training. FEMA requires IS-100, IS-200, IS-700, IS-800 for all EM personnel. Expired certs = compliance gaps.',
    first:
      'Add yourself and any staff. For each person, note their ICS/NIMS courses completed and expiration dates. The app will flag anything overdue.',
    next: 'training',
  },
  training: {
    emoji: '🎓',
    title: 'Plan Your Training',
    what: 'A training program ensures your team and partners maintain the skills needed to execute your plans. It covers courses, schedules, attendance tracking, and gap analysis.',
    why: 'EMAP 4.10 requires a training needs assessment, multi-year training plan, and documentation of all training conducted. Most programs fail here at accreditation.',
    first:
      "Add any training sessions from the past year — even simple ones like a tabletop briefing. Include date, attendees, and topic. Then identify what training you need but haven't done yet.",
    next: 'exercises',
  },
  exercises: {
    emoji: '🏋️',
    title: 'Exercise Your Plans',
    what: 'Exercises test your plans in controlled settings. Incidents are real-world activations your team responded to. Both need After-Action Reports (AARs) with findings and corrective actions. Use the Exercises tab for drills and exercises, and the Incidents tab for real-world events.',
    why: 'EMAP 4.11 requires exercises with HSEEP methodology. EMAP 4.12 covers incident management. AARs from both exercises and real incidents demonstrate a closed-loop improvement cycle — the gold standard for accreditation.',
    first:
      "Log any exercise or real-world activation from the past 2 years. For exercises: include type, objectives, and AAR. For incidents: log the event and write an AAR with findings. If you haven't done either, schedule a tabletop — it's the easiest way to start.",
    next: 'grants',
  },
  grants: {
    emoji: '💰',
    title: 'Fund Your Program',
    what: 'Grants fund everything from personnel to equipment to exercises. EMPG is the big one for EM programs, but HMGP, BRIC, UASI, and SHSP are all relevant depending on your jurisdiction.',
    why: 'Without funding, programs stagnate. Grant tracking shows your leadership the ROI of EM investment. The app maps each grant to the EMAP standards it supports, so you can show exactly how funding drives compliance.',
    first:
      "Add any active grants with their deadlines and deliverables. If you don't have grants yet, look at EMPG (Emergency Management Performance Grant) — it's the baseline federal funding for EM programs.",
    next: 'accreditation',
  },
  accreditation: {
    emoji: '✅',
    title: 'Track Your Standards',
    what: 'EMAP has 73 standards across 12 sections. Each standard needs evidence documentation to prove compliance. This is your master compliance tracker.',
    why: "This is the whole point — demonstrating your program meets national standards. Even if you're not pursuing formal accreditation, these standards represent best practice. Hitting them means your program is solid.",
    first:
      "Don't try to tackle all 73 at once. Start with the sections you've already been building (4.1 Hazards, 4.5 Plans, 4.6 Personnel). Mark what you have evidence for. The dashboard will show your progress.",
    next: 'journey',
  },
  journey: {
    emoji: '🗺️',
    title: 'Your Accreditation Roadmap',
    what: 'The Accreditation Journey breaks the path to EMAP accreditation into phases: self-assessment, gap closure, application, on-site review, and maintenance.',
    why: "Accreditation typically takes 12-24 months. This view helps you track where you are, what's next, and project your timeline based on current pace.",
    first:
      "Review your current phase. If you're just starting, you're in self-assessment. Focus on completing the Plan → Build sections first, then circle back here to track your formal progress.",
    next: null,
  },
  recovery: {
    emoji: '🔄',
    title: 'Plan for Recovery',
    what: 'Recovery planning covers what happens after the immediate response — restoring services, rebuilding infrastructure, supporting affected populations, and getting back to normal operations.',
    why: "EMAP 4.5.4 requires a Recovery Plan with short/long-term priorities across critical functions. Many programs neglect this, but FEMA's emphasis on resilience makes it increasingly important.",
    first:
      "Identify your top 3 recovery priorities (infrastructure, housing, economic). For each, note who's responsible and what resources are needed. Even a basic framework satisfies the standard.",
    next: null,
  },
  mutualaid: {
    emoji: '🌐',
    title: 'Map Mutual Aid',
    what: 'Mutual aid maps your agreements with neighboring jurisdictions and what resources each partner can provide during incidents.',
    why: "EMAP 4.7 requires documented mutual aid agreements. FEMA Core Capability 'Operational Coordination' depends on knowing who can help and what they bring.",
    first:
      'Add your mutual aid partners and tag what resource types they can provide (personnel, apparatus, shelter, etc.). Upload any signed agreements.',
    next: null,
  },
  templates: {
    emoji: '🤖',
    title: 'AI Document Generation',
    what: 'These templates use AI to generate professional EM documents pre-filled with your program data — org name, hazards, personnel, and compliance status.',
    why: 'Writing plans from scratch is the #1 time killer for EM managers. These templates give you a 70% starting point that you customize for your jurisdiction.',
    first:
      'Pick the document you need most urgently. For most new programs, start with the Multi-Year Strategic Plan (EMAP 3.1.1) — it frames everything else.',
    next: null,
  },
  evidence: {
    emoji: '📎',
    title: 'Evidence Packaging',
    what: 'Evidence Export bundles your compliance documentation per EMAP standard into packages ready for assessor review.',
    why: 'During accreditation review, assessors need organized evidence for each standard. This tool automates that packaging instead of you manually compiling folders.',
    first:
      "Select a section you're confident about and preview the evidence package. It pulls in linked plans, training records, exercise AARs, and personnel data automatically.",
    next: null,
  },
  intake: {
    emoji: '📤',
    title: 'Bulk Document Upload',
    what: 'Drop in your existing documents — EOPs, COOPs, AARs, SOPs, MOUs — and AI reads each one and maps it to the relevant EMAP standards automatically.',
    why: 'If you have existing documents from a previous manager or another system, this is the fastest way to populate your program. Instead of manually entering everything, let AI do the heavy lifting.',
    first:
      'Gather your key documents (EOP, COOP, any AARs, training records, MOUs) and upload them. AI will identify which EMAP standards each document supports.',
    next: null,
  },
  package: {
    emoji: '📦',
    title: 'Accreditation Package',
    what: 'The Package Builder compiles your complete accreditation application — all evidence, narratives, and documentation organized by EMAP section.',
    why: "When you're ready to submit for EMAP accreditation, this creates the formal package. It identifies gaps and shows what's ready vs. what still needs work.",
    first:
      'This is an advanced tool — come back here once you have at least 50% of standards documented. Use the EMAP Standards tracker to get there first.',
    next: null,
  },
  cap: {
    emoji: '⚠️',
    title: 'Corrective Actions',
    what: 'Corrective actions are improvement items identified from exercises, real-world incidents, or self-assessments. Each one needs an owner, deadline, and resolution.',
    why: 'EMAP 4.11 requires that exercise findings feed into a corrective action program. Showing a closed-loop improvement process is critical for accreditation.',
    first:
      "If you've logged any exercises with AAR findings, corrective actions auto-populate here. Otherwise, add any known improvement items from recent incidents or reviews.",
    next: null,
  },
};

function CoachBanner({ moduleId, onNavigate }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('planrr_coach_dismissed') || '{}')[
          moduleId
        ] || false
      );
    } catch {
      return false;
    }
  });
  const [expanded, setExpanded] = useState(false);
  const c = COACH[moduleId];
  if (!c || dismissed) return null;
  const dismiss = () => {
    setDismissed(true);
    try {
      const d = JSON.parse(
        localStorage.getItem('planrr_coach_dismissed') || '{}'
      );
      d[moduleId] = true;
      localStorage.setItem('planrr_coach_dismissed', JSON.stringify(d));
    } catch {}
  };
  return (
    <div
      style={{
        marginBottom: 20,
        background: 'linear-gradient(135deg, #f0fafa 0%, #f8fafb 100%)',
        border: `1px solid ${B.tealBorder}`,
        borderRadius: 14,
        padding: '18px 22px',
        position: 'relative',
        animation: 'fadeUp 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>{c.emoji}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: B.text }}>
              {c.title}
            </span>
            <span
              style={{
                fontSize: 9,
                color: B.teal,
                background: 'rgba(27,201,196,0.12)',
                padding: '2px 8px',
                borderRadius: 5,
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              GUIDE
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: B.muted,
              lineHeight: 1.7,
              marginBottom: expanded ? 12 : 0,
            }}
          >
            {c.what}
          </div>
          {expanded && (
            <>
              <div
                style={{
                  marginTop: 12,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 10,
                  border: `1px solid ${B.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: B.teal,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  Why This Matters
                </div>
                <div style={{ fontSize: 13, color: B.muted, lineHeight: 1.7 }}>
                  {c.why}
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  padding: '12px 16px',
                  background: 'rgba(27,201,196,0.06)',
                  borderRadius: 10,
                  border: `1px solid ${B.tealBorder}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#0d9488',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  What To Do First
                </div>
                <div style={{ fontSize: 13, color: B.muted, lineHeight: 1.7 }}>
                  {c.first}
                </div>
              </div>
              {c.next && (
                <button
                  onClick={() => onNavigate && onNavigate(c.next)}
                  style={{
                    marginTop: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: B.teal,
                    fontWeight: 600,
                    background: 'none',
                    border: `1px solid ${B.tealBorder}`,
                    borderRadius: 8,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Next step: {COACH[c.next]?.title || c.next} →
                </button>
              )}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              fontSize: 11,
              color: B.teal,
              background: 'rgba(27,201,196,0.1)',
              border: `1px solid ${B.tealBorder}`,
              borderRadius: 7,
              padding: '5px 12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {expanded ? 'Less' : 'Learn more'}
          </button>
          <button
            onClick={dismiss}
            style={{
              fontSize: 11,
              color: B.faint,
              background: 'none',
              border: `1px solid ${B.border}`,
              borderRadius: 7,
              padding: '5px 10px',
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
            title="Dismiss this guide"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
const FSel = ({ value, onChange, children, style: s }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: '100%',
      border: `1px solid ${B.border}`,
      borderRadius: 10,
      padding: '10px 14px',
      color: value ? B.text : B.faint,
      fontSize: 13,
      fontFamily: "'DM Sans',sans-serif",
      outline: 'none',
      background: '#f8fafb',
      transition: 'all 0.15s ease',
      ...s,
    }}
    onFocus={(e) => {
      e.target.style.borderColor = B.teal;
      e.target.style.boxShadow = '0 0 0 3px rgba(27,201,196,0.1)';
    }}
    onBlur={(e) => {
      e.target.style.borderColor = B.border;
      e.target.style.boxShadow = 'none';
    }}
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
          {score}% -{' '}
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

/* --- FILE ATTACHMENT WIDGET --------------------------- */
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
                -
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
              ? '-'
              : d.name.match(/\.(jpg|jpeg|png)$/)
              ? '--'
              : '-'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: B.text }}>
              {d.name}
            </div>
            <div style={{ fontSize: 10, color: B.faint }}>
              {fmtSize(d.size)} - {timeAgo(d.uploadedAt)}
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
            -
          </button>
        </div>
      ))}
    </div>
  );
}

/* --- EVIDENCE UPLOAD (EMAP standards) ---------------- */
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
        },
        'draft_rationale'
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
        EMAP requires a written rationale for every proof of compliance -
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
            <div style={{ fontSize: 22, marginBottom: 4, opacity: 0.4 }}>-</div>
            <div style={{ fontSize: 12, color: B.faint }}>
              Drop files here or click to upload
            </div>
            <div style={{ fontSize: 10, color: '#d1d8db', marginTop: 2 }}>
              PDF, Word, images - AI analyzes + drafts rationale
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
                        ? '-'
                        : doc.name.match(/\.(jpg|jpeg|png)$/)
                        ? '--'
                        : '-'}
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
                        {fmtSz(doc.size)} - {timeAgo(doc.uploadedAt)}
                        {doc.isDraft ? (
                          <span
                            style={{
                              color: B.red,
                              fontWeight: 700,
                              marginLeft: 6,
                            }}
                          >
                            - Draft - not accepted by EMAP
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
                      -
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
                        -
                      </span>
                      AI analyzing document...
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
                          {hasDraft ? 'ok Rationale' : '- Rationale required'}
                        </span>
                        {hasDraft && (
                          <span style={{ fontSize: 10, color: B.faint }}>
                            - EMAP proof of compliance
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
                          {isDraftLoading
                            ? 'Drafting...'
                            : 'AI Draft Rationale'}
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
                          -
                        </span>
                        AI drafting rationale...
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

/* --- STANDARD DETAIL PANEL ---------------------------- */
function DetailPanel({ stdId, standards, onUpdateStd, onClose, onAddCapItem }) {
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
      }, mode === 'action' ? 'action_plan' : mode);
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
        (st.notes ? st.notes + '\n\n-\n\n' : '') + aiData[aiMode]
      );
      if (aiMode === 'action' && onAddCapItem) {
        const lines = aiData[aiMode].split('\n').filter(l =>
          l.match(/^\s*(\d+[\.\):]|\-|\•|\*)\s/)
        );
        const items = lines.map(line =>
          line.replace(/^\s*(\d+[\.\):]|\-|\•|\*)\s*/, '')
            .replace(/\*\*/g, '').trim()
        ).filter(t => t.length > 10);
        if (items.length === 0) {
          const sentences = aiData[aiMode].split(/[.!]\s/).filter(s => s.length > 20).slice(0, 8);
          items.push(...sentences.map(s => s.trim()));
        }
        items.forEach(text => {
          onAddCapItem({
            id: uid(),
            item: text.slice(0, 200),
            source: `EMAP ${std.id}`,
            stdRef: std.id,
            priority: 'medium',
            status: 'open',
            closed: false,
            addedAt: Date.now(),
          });
        });
      }
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
              - Prev
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
              Next -
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
            x
          </button>
        </div>
        <div style={{ padding: '20px 22px 48px' }}>
          <div style={{ fontSize: 11, color: B.faint, marginBottom: 8 }}>
            {std.chapter.title} - {std.section.title}
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
                - {(st.docs || []).length} doc
                {(st.docs || []).length !== 1 ? 's' : ''} - {bestDocConf}%
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
                ok {docsWithRationale} rationale
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
                - {docsWithoutRationale} rationale
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
                You can continue documenting this standard - this flag is
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
                ['interpret', '- Interpret'],
                ['evidence', '- Suggest Evidence'],
                ['action', '- Build Action Plan'],
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
                  {aiLoading[mode] ? '- Working...' : lbl}
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
                      {adopted ? 'ok Added to notes' : '- Add to notes'}
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
                placeholder="Name or role..."
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
              placeholder="Gap analysis, corrective actions, progress notes..."
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

/* -------------------------------------------------------
   EMAP STANDARDS VIEW
------------------------------------------------------- */
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 960 }}>
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
          EMS 5-2022 - {compliantSections}/{ALL_SECTIONS.length} sections
          compliant - {overall.compliant}/{overall.total} standards compliant
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
            ok {overall.compliant} compliant
          </span>
          <span style={{ color: B.amber, fontWeight: 600 }}>
            - {overall.in_progress} in progress
          </span>
          <span style={{ color: B.red, fontWeight: 600 }}>
            ! {overall.needs_review} needs review
          </span>
          <span style={{ color: B.faint }}>
            o {overall.not_started} not started
          </span>
        </div>
      </div>
      <CoachBanner moduleId="accreditation" />
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
                  -
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
                              -{docCount}
                              {bestConf !== null ? `  -  ${bestConf}%` : ''}
                            </span>
                          )}
                          {st.assignee && (
                            <span
                              style={{ fontSize: 10, color: B.faint }}
                              title={st.assignee}
                            >
                              -
                            </span>
                          )}
                          <StatusPill status={st.status} compact />
                          <span style={{ color: '#d1d8db', fontSize: 14 }}>
                            -
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
                    placeholder="Click to view notes..."
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
          onAddCapItem={(item) => {
            updateData(prev => ({
              ...prev,
              capItems: [...(prev.capItems || []), item],
            }));
            addActivity(updateData, 'created', 'cap', `CAP item from EMAP ${item.stdRef}: ${item.item.slice(0, 60)}`);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------
   EXERCISE & AAR - Full workflow
------------------------------------------------------- */
const HSEEP_TYPES = [
  'Seminar',
  'Workshop',
  'Tabletop Exercise (TTX)',
  'Game',
  'Drill',
  'Functional Exercise (FE)',
  'Full-Scale Exercise (FSE)',
];
const INCIDENT_TYPES = [
  'Natural Disaster',
  'Severe Weather',
  'Wildfire',
  'Flood',
  'Earthquake',
  'HAZMAT Incident',
  'Mass Casualty',
  'Active Threat',
  'Public Health Emergency',
  'Infrastructure Failure',
  'Civil Unrest',
  'Search & Rescue',
  'Evacuation',
  'EOC Activation',
  'Planned Event / Special Event',
  'Mutual Aid Deployment',
  'Other',
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

function ExerciseDetail({ ex, onUpdate, onClose, isIncident }) {
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
      }, 'draft_aar');
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
      }, 'finalize_aar');
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
                {isIncident ? 'Incident: ' : ''}
                {ex.type} - {fmtDate(ex.date)}
                {ex.location ? `  -  ${ex.location}` : ''}
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
                x
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
                  border: `1px solid ${
                    tab === t.id ? B.border : 'transparent'
                  }`,
                  borderBottom: `1px solid ${tab === t.id ? B.card : B.border}`,
                  background: tab === t.id ? B.card : 'transparent',
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
          {/* - OVERVIEW - */}
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
                  <Label>
                    {isIncident ? 'Incident Type' : 'HSEEP Exercise Type'}
                  </Label>
                  <FSel value={ex.type || ''} onChange={(v) => u('type', v)}>
                    <option value="">Select type...</option>
                    {(isIncident ? INCIDENT_TYPES : HSEEP_TYPES).map((t) => (
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
                    <option value="">Select state...</option>
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
                <Label>
                  {isIncident
                    ? 'Incident Summary'
                    : 'Exercise Scenario / Overview'}
                </Label>
                <FTextarea
                  value={ex.scenario || ''}
                  onChange={(v) => u('scenario', v)}
                  placeholder={
                    isIncident
                      ? 'Describe what happened, scope, response actions taken...'
                      : 'Describe the scenario, scope, and context of the exercise...'
                  }
                  rows={4}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Label>
                  {isIncident ? 'Lead/Responding Agency' : 'Sponsoring Agency'}
                </Label>
                <FInput
                  value={ex.sponsor || ''}
                  onChange={(v) => u('sponsor', v)}
                  placeholder={
                    isIncident
                      ? 'Agency that led the response'
                      : 'Lead agency name'
                  }
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

          {/* - OBJECTIVES & PARTICIPANTS - */}
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
                    placeholder="Add objective... (press Enter)"
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
                    No objectives added - type above and press Enter
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
                      -
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
                    placeholder="List agencies, roles, or other participation details..."
                    rows={3}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <Label>Exercise Controllers & Evaluators</Label>
                <FTextarea
                  value={ex.controllers || ''}
                  onChange={(v) => u('controllers', v)}
                  placeholder="List controllers and evaluators assigned to this exercise..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Observer Notes</Label>
                <FTextarea
                  value={ex.observerNotes || ''}
                  onChange={(v) => u('observerNotes', v)}
                  placeholder="Hot wash notes, observer observations during exercise..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* - EVALUATION (Strengths, AFIs, CAs) - */}
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
                    placeholder="Add a strength..."
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
                      ok
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
                      -
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
                    placeholder="Add an area for improvement..."
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
                      -
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
                      -
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
                <Label>Improvement Plan - Corrective Actions</Label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <FInput
                    value={caText}
                    onChange={setCaText}
                    placeholder="Add corrective action..."
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

          {/* - AAR DRAFT - */}
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
                      HSEEP-compliant draft - EMAP 4.11 requirements -{' '}
                      {ex.state
                        ? `${ex.state} state considerations`
                        : 'Add state for state-specific guidance'}
                    </div>
                  </div>
                  <Btn
                    label={
                      aarDraftLoading ? '- Drafting...' : 'Generate AAR Draft'
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
                      -
                    </span>
                    Drafting HSEEP-compliant AAR...
                  </div>
                )}
              </div>
              <div>
                <Label>AAR Draft</Label>
                <FTextarea
                  value={ex.aarDraft || ''}
                  onChange={(v) => u('aarDraft', v)}
                  placeholder="AAR draft will appear here after AI generation, or type/paste your draft..."
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

          {/* - AAR FINAL - */}
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
                    label={aarFinalLoading ? '- Finalizing...' : 'Finalize AAR'}
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
                    placeholder="Stakeholders, agencies..."
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
                  ok Final AAR on file - counts as evidence for EMAP 4.11.2
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
  const [activeTab, setActiveTab] = useState('exercises');
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIncId, setSelectedIncId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'Tabletop Exercise (TTX)',
    date: today(),
    status: 'planned',
  });
  const [incForm, setIncForm] = useState({
    name: '',
    type: 'Natural Disaster',
    date: today(),
    status: 'completed',
  });
  const incidents = data.incidents || [];
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
  const createInc = () => {
    if (!incForm.name) return;
    const inc = {
      ...incForm,
      id: uid(),
      isIncident: true,
      objectives: [],
      strengths: [],
      afis: [],
      corrective: [],
      docs: [],
      addedAt: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      incidents: [...(prev.incidents || []), inc],
    }));
    setIncForm({
      name: '',
      type: 'Natural Disaster',
      date: today(),
      status: 'completed',
    });
    setShowForm(false);
    setSelectedIncId(inc.id);
  };
  const updateEx = (id, updates) =>
    setData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => (e.id === id ? updates : e)),
    }));
  const updateInc = (id, updates) =>
    setData((prev) => ({
      ...prev,
      incidents: (prev.incidents || []).map((i) => (i.id === id ? updates : i)),
    }));
  const removeEx = (id) => {
    setData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((e) => e.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
  };
  const removeInc = (id) => {
    setData((prev) => ({
      ...prev,
      incidents: (prev.incidents || []).filter((i) => i.id !== id),
    }));
    if (selectedIncId === id) setSelectedIncId(null);
  };
  const sel = selectedId
    ? data.exercises.find((e) => e.id === selectedId)
    : null;
  const selInc = selectedIncId
    ? incidents.find((i) => i.id === selectedIncId)
    : null;
  const totalAARs = [...data.exercises, ...incidents].filter(
    (e) => e.aarDraft || e.aarFinal
  ).length;
  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1000 }}>
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
            EMAP 4.11 + 4.12 - {data.exercises.length} exercises -{' '}
            {incidents.length} incidents - {totalAARs} AARs on file
          </p>
        </div>
        <Btn
          label={
            activeTab === 'exercises' ? '+ New Exercise' : '+ New Incident'
          }
          onClick={() => setShowForm(true)}
          primary
        />
      </div>
      <CoachBanner moduleId="exercises" />

      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 16,
          padding: '4px',
          background: '#f0f3f4',
          borderRadius: 12,
        }}
      >
        {[
          { id: 'exercises', label: 'Exercises', count: data.exercises.length },
          {
            id: 'incidents',
            label: 'Incidents & Activations',
            count: incidents.length,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setShowForm(false);
            }}
            style={{
              padding: '9px 18px',
              borderRadius: 9,
              border: 'none',
              background: activeTab === t.id ? '#fff' : 'transparent',
              color: activeTab === t.id ? B.text : B.faint,
              fontSize: 13,
              fontWeight: activeTab === t.id ? 700 : 500,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              transition: 'all 0.15s ease',
              boxShadow:
                activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {t.label}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: activeTab === t.id ? B.teal : B.faint,
                background: activeTab === t.id ? B.tealLight : '#e8ecee',
                padding: '1px 6px',
                borderRadius: 6,
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'exercises' && (
        <>
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
            Completed exercises with AARs directly satisfy{' '}
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
            <Card
              style={{ textAlign: 'center', padding: '36px', color: B.faint }}
            >
              No exercises yet. Create your first exercise to start building
              EMAP 4.11 evidence.
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...data.exercises]
                .sort((a, b) => b.date?.localeCompare(a.date))
                .map((ex) => {
                  const sc =
                    EXERCISE_STATUS[ex.status] || EXERCISE_STATUS.planned;
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
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
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
                                label={ex.aarFinal ? 'AAR Final' : 'AAR Draft'}
                                color={ex.aarFinal ? B.green : B.amber}
                                bg={ex.aarFinal ? B.greenLight : B.amberLight}
                                border={
                                  ex.aarFinal ? B.greenBorder : B.amberBorder
                                }
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
                            {ex.location && <span>{ex.location}</span>}
                            {ex.participantCount && (
                              <span>{ex.participantCount} participants</span>
                            )}
                            {(ex.objectives || []).length > 0 && (
                              <span>{ex.objectives.length} objectives</span>
                            )}
                            {openCAs > 0 && (
                              <span style={{ color: B.red, fontWeight: 600 }}>
                                {openCAs} open CAs
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
                          title="Delete"
                        >
                          x
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {activeTab === 'incidents' && (
        <>
          <div
            style={{
              background: `${B.red}08`,
              border: `1px solid ${B.redBorder}`,
              borderLeft: `3px solid ${B.red}`,
              borderRadius: '0 8px 8px 0',
              padding: '9px 14px',
              marginBottom: 14,
              fontSize: 12,
              color: '#991b1b',
            }}
          >
            Real-world incidents with AARs demonstrate your improvement cycle
            for <strong>EMAP 4.12</strong>. Corrective actions from incidents
            feed directly into your CAP dashboard.
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
                New Incident / Activation
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
                  <Label>Incident Name</Label>
                  <FInput
                    value={incForm.name}
                    onChange={(v) => setIncForm((p) => ({ ...p, name: v }))}
                    placeholder="2024 Creek Fire Response"
                  />
                </div>
                <div>
                  <Label>Incident Type</Label>
                  <FSel
                    value={incForm.type}
                    onChange={(v) => setIncForm((p) => ({ ...p, type: v }))}
                  >
                    {INCIDENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </FSel>
                </div>
                <div>
                  <Label>Date</Label>
                  <FInput
                    type="date"
                    value={incForm.date}
                    onChange={(v) => setIncForm((p) => ({ ...p, date: v }))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn label="Create Incident" onClick={createInc} primary />
                <Btn label="Cancel" onClick={() => setShowForm(false)} />
              </div>
            </div>
          )}
          {incidents.length === 0 ? (
            <Card
              style={{ textAlign: 'center', padding: '36px', color: B.faint }}
            >
              No incidents logged yet. Log real-world activations and write AARs
              to strengthen your improvement cycle and satisfy EMAP 4.12.
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...incidents]
                .sort((a, b) => b.date?.localeCompare(a.date))
                .map((inc) => {
                  const sc =
                    EXERCISE_STATUS[inc.status] || EXERCISE_STATUS.completed;
                  const openCAs = (inc.corrective || []).filter(
                    (c) => !c.closed
                  ).length;
                  const hasAAR = !!(inc.aarDraft || inc.aarFinal);
                  return (
                    <div
                      key={inc.id}
                      style={{
                        background: B.card,
                        border: `1px solid ${B.border}`,
                        borderRadius: 9,
                        padding: '13px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onClick={() => setSelectedIncId(inc.id)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = B.red)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = B.border)
                      }
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
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
                              {inc.name}
                            </span>
                            <Tag
                              label={inc.type || 'Incident'}
                              color={B.red}
                              bg={B.redLight}
                              border={B.redBorder}
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
                                label={inc.aarFinal ? 'AAR Final' : 'AAR Draft'}
                                color={inc.aarFinal ? B.green : B.amber}
                                bg={inc.aarFinal ? B.greenLight : B.amberLight}
                                border={
                                  inc.aarFinal ? B.greenBorder : B.amberBorder
                                }
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
                            <span>{fmtDate(inc.date)}</span>
                            {inc.location && <span>{inc.location}</span>}
                            {inc.participantCount && (
                              <span>{inc.participantCount} responders</span>
                            )}
                            {openCAs > 0 && (
                              <span style={{ color: B.red, fontWeight: 600 }}>
                                {openCAs} open CAs
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeInc(inc.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#d1d5db',
                            cursor: 'pointer',
                            fontSize: 14,
                            padding: '4px',
                          }}
                          title="Delete"
                        >
                          x
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {sel && (
        <ExerciseDetail
          ex={sel}
          onUpdate={(updated) => updateEx(sel.id, updated)}
          onClose={() => setSelectedId(null)}
        />
      )}
      {selInc && (
        <ExerciseDetail
          ex={selInc}
          onUpdate={(updated) => updateInc(selInc.id, updated)}
          onClose={() => setSelectedIncId(null)}
          isIncident
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------
   EMPLOYEES & CREDENTIALS
------------------------------------------------------- */
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

function EmployeeDetail({ emp, onUpdate, onClose, data }) {
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
    { id: 'deployment', label: 'Deployment' },
    { id: 'evaluation', label: 'Evaluation' },
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
                  {emp.title && emp.department ? '  -  ' : ''}
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
                  - {expiringSoon.length} expiring
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
                x
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
                  border: `1px solid ${
                    tab === t.id ? B.border : 'transparent'
                  }`,
                  borderBottom: `1px solid ${tab === t.id ? B.card : B.border}`,
                  background: tab === t.id ? B.card : 'transparent',
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
          {/* - PROFILE - */}
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
                  <Label>Availability</Label>
                  <FSel
                    value={emp.availability || 'full'}
                    onChange={(v) => u('availability', v)}
                  >
                    <option value="full">Full Time (40h)</option>
                    <option value="parttime">Part Time</option>
                    <option value="oncall">On Call Only</option>
                    <option value="limited">Limited</option>
                  </FSel>
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
                    <option value="intern">Intern</option>
                    <option value="dsw">Disaster Service Worker (DSW)</option>
                  </FSel>
                </div>
              </div>
              <div
                style={{
                  marginBottom: 12,
                  paddingTop: 12,
                  borderTop: `1px solid ${B.border}`,
                }}
              >
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
                  Billing & Cost
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 10,
                  }}
                >
                  <div>
                    <Label>Hourly Rate ($)</Label>
                    <FInput
                      value={emp.hourlyRate || ''}
                      onChange={(v) => u('hourlyRate', v)}
                      placeholder="75.00"
                    />
                  </div>
                  <div>
                    <Label>Billable to Grant</Label>
                    <FSel
                      value={emp.billableGrant || ''}
                      onChange={(v) => u('billableGrant', v)}
                    >
                      <option value="">Not billable</option>
                      <option value="empg">EMPG</option>
                      <option value="bsir">BSIR</option>
                      <option value="uasi">UASI</option>
                      <option value="hmgp">HMGP</option>
                      <option value="shsp">SHSP</option>
                      <option value="other">Other Grant</option>
                    </FSel>
                  </div>
                  <div>
                    <Label>FTE Allocation (%)</Label>
                    <FInput
                      value={emp.fteAllocation || ''}
                      onChange={(v) => u('fteAllocation', v)}
                      placeholder="100"
                    />
                  </div>
                </div>
                {emp.hourlyRate && (
                  <div style={{ fontSize: 11, color: B.faint, marginTop: 6 }}>
                    Annual cost estimate: $
                    {(
                      parseFloat(emp.hourlyRate || 0) *
                      2080 *
                      (parseFloat(emp.fteAllocation || 100) / 100)
                    ).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{' '}
                    ({emp.fteAllocation || 100}% FTE x ${emp.hourlyRate}/hr x
                    2,080 hrs)
                  </div>
                )}
              </div>
              <div
                style={{
                  marginBottom: 12,
                  paddingTop: 12,
                  borderTop: `1px solid ${B.border}`,
                }}
              >
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
                  Emergency Contact
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <Label>Contact Name</Label>
                    <FInput
                      value={emp.emergencyContact || ''}
                      onChange={(v) => u('emergencyContact', v)}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <Label>Contact Phone</Label>
                    <FInput
                      value={emp.emergencyPhone || ''}
                      onChange={(v) => u('emergencyPhone', v)}
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    <FInput
                      value={emp.emergencyRelation || ''}
                      onChange={(v) => u('emergencyRelation', v)}
                      placeholder="Spouse, Parent..."
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>Notes</Label>
                <FTextarea
                  value={emp.notes || ''}
                  onChange={(v) => u('notes', v)}
                  placeholder="Additional notes about this employee..."
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

          {/* - CERTIFICATIONS - */}
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
                    - Credentials Expiring Soon
                  </div>
                  {expiringSoon.map((c) => (
                    <div key={c.id} style={{ fontSize: 12, color: B.red }}>
                      {c.name} -{' '}
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
                      placeholder="FEMA, State OES, IAEM..."
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
                          {c.issuer && <span>- {c.issuer}</span>}
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
                        -
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* - TASK BOOKS - */}
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
                      <option value="">Select position...</option>
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
                  No task books yet - FEMA task books track position
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
                        -
                      </button>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        <FInput
                          value={newTask}
                          onChange={setNewTask}
                          placeholder="Add task item..."
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

          {/* - TRAINING HISTORY - */}
          {tab === 'deployment' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: B.card,
                    border: `1px solid ${B.border}`,
                    borderRadius: 9,
                    padding: '14px 16px',
                  }}
                >
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
                    Deployment Status
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <Label>Deployable</Label>
                    <FSel
                      value={emp.deployable || 'yes'}
                      onChange={(v) => u('deployable', v)}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="limited">Limited</option>
                    </FSel>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <Label>Currently Deployed</Label>
                    <FSel
                      value={emp.currentlyDeployed || 'no'}
                      onChange={(v) => u('currentlyDeployed', v)}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </FSel>
                  </div>
                  {emp.currentlyDeployed === 'yes' && (
                    <>
                      <div style={{ marginBottom: 10 }}>
                        <Label>Deployment Location</Label>
                        <FInput
                          value={emp.deployLocation || ''}
                          onChange={(v) => u('deployLocation', v)}
                          placeholder="City, State or Incident Name"
                        />
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <Label>Point of Contact</Label>
                        <FInput
                          value={emp.deployPOC || ''}
                          onChange={(v) => u('deployPOC', v)}
                          placeholder="Name and phone"
                        />
                      </div>
                      <div>
                        <Label>Expected Return Date</Label>
                        <FInput
                          type="date"
                          value={emp.deployReturn || ''}
                          onChange={(v) => u('deployReturn', v)}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div
                  style={{
                    background: B.card,
                    border: `1px solid ${B.border}`,
                    borderRadius: 9,
                    padding: '14px 16px',
                  }}
                >
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
                    Deployment History
                  </div>
                  {(emp.deployHistory || []).length === 0 ? (
                    <div
                      style={{
                        color: B.faint,
                        fontSize: 12,
                        textAlign: 'center',
                        padding: '16px 0',
                      }}
                    >
                      No deployments recorded
                    </div>
                  ) : (
                    (emp.deployHistory || []).map((d, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 12,
                          color: B.text,
                          padding: '6px 0',
                          borderBottom: `1px solid ${B.border}`,
                        }}
                      >
                        {d.incident} - {fmtDate(d.start)} -{' '}
                        {fmtDate(d.end) || 'Ongoing'}
                      </div>
                    ))
                  )}
                  <div style={{ marginTop: 12 }}>
                    <Btn
                      label="+ Log Deployment"
                      small
                      onClick={() => {
                        const incident = prompt('Incident name:');
                        if (incident)
                          u('deployHistory', [
                            ...(emp.deployHistory || []),
                            { incident, start: today(), end: '', id: uid() },
                          ]);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'evaluation' && (
            <div>
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
                Evaluations should follow your agency HR policies. Records here
                are for EM program tracking only.
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <Label>Last Evaluation Date</Label>
                  <FInput
                    type="date"
                    value={emp.lastEvalDate || ''}
                    onChange={(v) => u('lastEvalDate', v)}
                  />
                </div>
                <div>
                  <Label>Next Evaluation Due</Label>
                  <FInput
                    type="date"
                    value={emp.nextEvalDate || ''}
                    onChange={(v) => u('nextEvalDate', v)}
                  />
                </div>
                <div>
                  <Label>Overall Rating</Label>
                  <FSel
                    value={emp.evalRating || ''}
                    onChange={(v) => u('evalRating', v)}
                  >
                    <option value="">Select...</option>
                    <option>Exceptional</option>
                    <option>Exceeds Expectations</option>
                    <option>Meets Expectations</option>
                    <option>Needs Improvement</option>
                    <option>Unsatisfactory</option>
                  </FSel>
                </div>
                <div>
                  <Label>Evaluator</Label>
                  <FInput
                    value={emp.evaluator || ''}
                    onChange={(v) => u('evaluator', v)}
                    placeholder="Supervisor name"
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>Performance Summary</Label>
                <FTextarea
                  rows={3}
                  value={emp.evalSummary || ''}
                  onChange={(v) => u('evalSummary', v)}
                  placeholder="Key achievements, strengths, and contributions during evaluation period..."
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>Development Goals</Label>
                <FTextarea
                  rows={3}
                  value={emp.evalGoals || ''}
                  onChange={(v) => u('evalGoals', v)}
                  placeholder="Training goals, career development objectives, areas for growth..."
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>EM-Specific Competencies</Label>
                <FTextarea
                  rows={3}
                  value={emp.evalCompetencies || ''}
                  onChange={(v) => u('evalCompetencies', v)}
                  placeholder="ICS proficiency, planning skills, interagency coordination, exercise participation..."
                />
              </div>
              <Attachments
                docs={emp.evalDocs || []}
                onAdd={(doc) => u('evalDocs', [...(emp.evalDocs || []), doc])}
                onRemove={(id) =>
                  u(
                    'evalDocs',
                    (emp.evalDocs || []).filter((d) => d.id !== id)
                  )
                }
                label="Evaluation Documents"
              />
            </div>
          )}

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
                            {t.hours ? `  -  ${t.hours}h` : ''}
                            {t.cert ? `  -  Cert #${t.cert}` : ''}
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
    phone: '',
    status: 'active',
    employeeType: 'active',
    emergencyContact: '',
    emergencyPhone: '',
    deployable: false,
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
      phone: '',
      status: 'active',
      employeeType: 'active',
      emergencyContact: '',
      emergencyPhone: '',
      deployable: false,
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1000 }}>
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
            {employees.length} personnel - {totalCerts} credentials -{' '}
            {expiring > 0 ? (
              <span style={{ color: B.red, fontWeight: 600 }}>
                {expiring} expiring
              </span>
            ) : (
              'all current'
            )}
          </p>
        </div>
        <CoachBanner moduleId="employees" />
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
            icon: '-',
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
            icon: expiring > 0 ? '-' : 'ok',
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
            placeholder="Search by name, title, department..."
            style={{ paddingLeft: 30 }}
          />
        </div>
        {[
          ['all', 'All'],
          ['active', 'Active'],
          ['volunteer', 'Volunteer'],
          ['intern', 'Intern'],
          ['dsw', 'DSW'],
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
                      {emp.title && emp.department ? '  -  ' : ''}
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
                        label={`ok ${completedTBs} certified`}
                        color={B.green}
                        bg={B.greenLight}
                        border={B.greenBorder}
                      />
                    )}
                    {certExpiring > 0 && (
                      <Tag
                        label={`- ${certExpiring} expiring`}
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
                    -
                  </button>
                  <span style={{ color: B.border, fontSize: 14 }}>-</span>
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

/* -------------------------------------------------------
   TRAINING MANAGER (with attachments)
------------------------------------------------------- */
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
            .map((t) => `${t.person}  -  ${t.type}  -  ${t.date}`)
            .join('\n')
        : 'None yet.';
    try {
      await callAI(
        SYS,
        `Training records:\n${s}\n\nAnalyze gaps vs EMAP 4.10. Recommend priorities for next 6 months.`,
        (chunk) => setAiContent((p) => p + chunk),
        'training_needs'
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 980 }}>
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
            EMAP 4.10 - {data.training.length} records -{' '}
            {[...new Set(data.training.map((t) => t.person))].length} personnel
          </p>
        </div>
        <CoachBanner moduleId="training" />
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn
            label="AI Needs Assessment"
            icon="-"
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
                <option value="">Select...</option>
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
              placeholder="Additional notes..."
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
          placeholder="Search personnel or training type..."
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
                    <span style={{ color: B.faint, fontWeight: 400 }}> - </span>{' '}
                    <span style={{ color: B.muted }}>{t.type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: B.faint, marginTop: 2 }}>
                    {fmtDate(t.date)}
                    {t.hours ? `  -  ${t.hours}h` : ''}
                    {t.cert ? `  -  #${t.cert}` : ''}
                    {(t.docs || []).length > 0
                      ? `  -  📎 ${t.docs.length} file${
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
                  -
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
                  -
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
                      placeholder="Notes..."
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

/* -------------------------------------------------------
   PARTNERS (with attachments)
------------------------------------------------------- */
function PartnerRegistry({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'County Agency',
    contact: '',
    contactTitle: '',
    phone: '',
    email: '',
    address: '',
    agreementType: 'MOU',
    signed: today(),
    expires: '',
    reviewDate: '',
    notes: '',
    scope: '',
    resourcesShared: '',
    activationTrigger: '',
    emapStandards: '4.7',
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
      name: '', type: 'County Agency', contact: '', contactTitle: '', phone: '', email: '', address: '',
      agreementType: 'MOU', signed: today(), expires: '', reviewDate: '', notes: '', scope: '',
      resourcesShared: '', activationTrigger: '', emapStandards: '4.7',
    });
    setShowForm(false);
  };
  const remove = (id) => {
    setData((prev) => ({ ...prev, partners: prev.partners.filter((p) => p.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };
  const updatePartner = (id, field, val) =>
    setData((prev) => ({ ...prev, partners: prev.partners.map((p) => p.id === id ? { ...p, [field]: val } : p) }));
  const sel = selectedId ? data.partners.find(p => p.id === selectedId) : null;
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 960 }}>
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
            EMAP 4.7 - {data.partners.length} agreements
          </p>
        </div>
        <CoachBanner moduleId="partners" />
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
        <div style={{ background: B.blueLight, border: `1px solid ${B.blueBorder}`, borderRadius: 10, padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: B.text, marginBottom: 12 }}>Add Partner / Agreement</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><Label>Organization Name</Label><FInput value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Partner organization" /></div>
            <div><Label>Type</Label><FSel value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))}>{TYPES.map(t => <option key={t}>{t}</option>)}</FSel></div>
            <div><Label>Agreement Type</Label><FSel value={form.agreementType} onChange={v => setForm(p => ({ ...p, agreementType: v }))}>{AGR.map(t => <option key={t}>{t}</option>)}</FSel></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><Label>Contact Name</Label><FInput value={form.contact} onChange={v => setForm(p => ({ ...p, contact: v }))} placeholder="Name" /></div>
            <div><Label>Title</Label><FInput value={form.contactTitle} onChange={v => setForm(p => ({ ...p, contactTitle: v }))} placeholder="Title" /></div>
            <div><Label>Phone</Label><FInput value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="Phone" /></div>
            <div><Label>Email</Label><FInput value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="Email" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><Label>Date Signed</Label><FInput type="date" value={form.signed} onChange={v => setForm(p => ({ ...p, signed: v }))} /></div>
            <div><Label>Expiration Date</Label><FInput type="date" value={form.expires} onChange={v => setForm(p => ({ ...p, expires: v }))} /></div>
            <div><Label>Next Review Date</Label><FInput type="date" value={form.reviewDate} onChange={v => setForm(p => ({ ...p, reviewDate: v }))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Save Partner" onClick={save} primary />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {filtered.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '32px', color: B.faint }}>No partner agreements yet</Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {filtered.map(p => {
                const days = daysUntil(p.expires);
                const urgColor = days === null ? B.green : days < 0 ? B.red : days < 30 ? B.red : days < 90 ? B.amber : B.green;
                const isActive = selectedId === p.id;
                return (
                  <div key={p.id} onClick={() => setSelectedId(isActive ? null : p.id)} style={{
                    background: B.card, border: `1px solid ${isActive ? B.teal : days !== null && days < 90 ? B.amberBorder : B.border}`,
                    borderRadius: 9, padding: '13px 16px', cursor: 'pointer', transition: 'all 0.15s',
                    borderLeft: isActive ? `3px solid ${B.teal}` : `3px solid transparent`,
                  }}>
                    <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: B.text }}>{p.name}</span>
                      <Tag label={p.agreementType} color={B.blue} bg={B.blueLight} border={B.blueBorder} />
                      <Tag label={p.type} color={B.muted} bg="#f8fafc" border={B.border} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: B.faint, flexWrap: 'wrap' }}>
                      {p.contact && <span>{p.contact}{p.contactTitle ? `, ${p.contactTitle}` : ''}</span>}
                      <span>Signed: {fmtDate(p.signed)}</span>
                      {p.expires && <span style={{ color: urgColor, fontWeight: days !== null && days < 90 ? 700 : 400 }}>
                        Expires: {fmtDate(p.expires)}{days !== null && days < 90 ? ` (${days < 0 ? 'EXPIRED' : `${days}d`})` : ''}
                      </span>}
                      {(p.docs || []).length > 0 && <span>📎 {p.docs.length}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {sel && (
          <div style={{ width: 380, flexShrink: 0, position: 'sticky', top: 68, alignSelf: 'flex-start' }}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: B.blueLight, padding: '16px 20px', borderBottom: `1px solid ${B.blueBorder}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: B.text, marginBottom: 4 }}>{sel.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Tag label={sel.agreementType} color={B.blue} bg="#fff" border={B.blueBorder} />
                      <Tag label={sel.type} color={B.muted} bg="#fff" border={B.border} />
                    </div>
                  </div>
                  <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: B.faint, cursor: 'pointer', fontSize: 16 }}>✕</button>
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div><Label>Contact</Label><FInput value={sel.contact || ''} onChange={v => updatePartner(sel.id, 'contact', v)} placeholder="Name" /></div>
                  <div><Label>Title</Label><FInput value={sel.contactTitle || ''} onChange={v => updatePartner(sel.id, 'contactTitle', v)} placeholder="Title" /></div>
                  <div><Label>Phone</Label><FInput value={sel.phone || ''} onChange={v => updatePartner(sel.id, 'phone', v)} placeholder="Phone" /></div>
                  <div><Label>Email</Label><FInput value={sel.email || ''} onChange={v => updatePartner(sel.id, 'email', v)} placeholder="Email" /></div>
                </div>
                <div style={{ marginBottom: 14 }}><Label>Address</Label><FInput value={sel.address || ''} onChange={v => updatePartner(sel.id, 'address', v)} placeholder="Mailing address" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div><Label>Signed</Label><FInput type="date" value={sel.signed || ''} onChange={v => updatePartner(sel.id, 'signed', v)} /></div>
                  <div><Label>Expires</Label><FInput type="date" value={sel.expires || ''} onChange={v => updatePartner(sel.id, 'expires', v)} /></div>
                  <div><Label>Review Date</Label><FInput type="date" value={sel.reviewDate || ''} onChange={v => updatePartner(sel.id, 'reviewDate', v)} /></div>
                </div>
                <div style={{ marginBottom: 14 }}><Label>Scope of Agreement</Label><FTextarea value={sel.scope || ''} onChange={v => updatePartner(sel.id, 'scope', v)} rows={2} placeholder="What does this agreement cover? Mutual aid capabilities, shared resources..." /></div>
                <div style={{ marginBottom: 14 }}><Label>Resources Shared</Label><FInput value={sel.resourcesShared || ''} onChange={v => updatePartner(sel.id, 'resourcesShared', v)} placeholder="e.g. Heavy equipment, shelter facilities, personnel" /></div>
                <div style={{ marginBottom: 14 }}><Label>Activation Trigger</Label><FInput value={sel.activationTrigger || ''} onChange={v => updatePartner(sel.id, 'activationTrigger', v)} placeholder="e.g. Declaration of emergency, mutual aid request" /></div>
                <div style={{ marginBottom: 14 }}><Label>EMAP Standards</Label><FInput value={sel.emapStandards || ''} onChange={v => updatePartner(sel.id, 'emapStandards', v)} placeholder="e.g. 4.7.1, 4.7.3" /></div>
                <div style={{ marginBottom: 14 }}><Label>Notes</Label><FTextarea value={sel.notes || ''} onChange={v => updatePartner(sel.id, 'notes', v)} rows={2} placeholder="Additional notes..." /></div>
                <Attachments
                  docs={sel.docs || []}
                  onAdd={doc => updatePartner(sel.id, 'docs', [...(sel.docs || []), doc])}
                  onRemove={id => updatePartner(sel.id, 'docs', (sel.docs || []).filter(d => d.id !== id))}
                />
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${B.border}` }}>
                  <button onClick={() => { remove(sel.id); }} style={{ fontSize: 11, color: B.red, background: 'none', border: `1px solid ${B.redBorder}`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>Remove Partner</button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   PLAN LIBRARY (with attachments)
------------------------------------------------------- */
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 940 }}>
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
            EMAP 4.4, 4.5, 4.8 - {data.plans.length} plans -{' '}
            {data.plans.filter((p) => p.status === 'current').length} current
          </p>
        </div>
        <CoachBanner moduleId="plans" />
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
                    -
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
                      {plan.owner && <span>- {plan.owner}</span>}
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
                    -
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
                    -
                  </span>
                </div>
                {expandedId === plan.id && (
                  <div
                    style={{
                      padding: '16px 16px',
                      borderTop: `1px solid #f4f7f8`,
                      background: '#fafcfc',
                    }}
                  >
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
                          value={plan.name}
                          onChange={(v) => update(plan.id, 'name', v)}
                          placeholder="Plan name"
                        />
                      </div>
                      <div>
                        <Label>Version</Label>
                        <FInput
                          value={plan.version || ''}
                          onChange={(v) => update(plan.id, 'version', v)}
                          placeholder="1.0"
                        />
                      </div>
                      <div>
                        <Label>Owner</Label>
                        <FInput
                          value={plan.owner || ''}
                          onChange={(v) => update(plan.id, 'owner', v)}
                          placeholder="EM Director"
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
                        <Label>Last Reviewed</Label>
                        <FInput
                          type="date"
                          value={plan.lastReview || ''}
                          onChange={(v) => update(plan.id, 'lastReview', v)}
                        />
                      </div>
                      <div>
                        <Label>Next Review Due</Label>
                        <FInput
                          type="date"
                          value={plan.nextReview || ''}
                          onChange={(v) => update(plan.id, 'nextReview', v)}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <Label>Notes</Label>
                      <FTextarea
                        rows={2}
                        value={plan.notes || ''}
                        onChange={(v) => update(plan.id, 'notes', v)}
                        placeholder="Plan scope, key contacts, last major update summary..."
                      />
                    </div>
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

/* -------------------------------------------------------
   RESOURCES (with attachments)
------------------------------------------------------- */
function ResourcesView({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    name: '',
    category: 'Equipment',
    qty: '1',
    location: '',
    condition: 'Good',
    status: 'available',
    serialNumber: '',
    acquisitionDate: '',
    acquisitionCost: '',
    fundingSource: '',
    deployable: true,
    assignedTo: '',
    femaEquipType: '',
    aelNumber: '',
    usefulLife: '',
    federalSharePct: '75',
    grantProgram: '',
    make: '',
    model: '',
  });
  const CATS = [
    'Equipment',
    'Vehicles',
    'Communications',
    'Generators',
    'Shelter / Facilities',
    'Medical / EMS',
    'PPE / Safety',
    'Water / Food Cache',
    'IT / Technology',
    'Supplies',
    'Other',
  ];
  const CONDS = ['Excellent', 'Good', 'Fair', 'Needs Repair', 'Out of Service'];
  const STATUS_MAP = {
    available: { label: 'Available', color: B.green, bg: B.greenLight },
    deployed: { label: 'Deployed', color: B.blue, bg: B.blueLight },
    maintenance: { label: 'Maintenance', color: B.amber, bg: B.amberLight },
    reserved: { label: 'Reserved', color: B.purple, bg: B.purpleLight },
    out_of_service: { label: 'Out of Service', color: B.red, bg: B.redLight },
  };

  const save = () => {
    if (!form.name) return;
    setData((prev) => ({
      ...prev,
      resources: [
        ...prev.resources,
        {
          ...form,
          id: uid(),
          docs: [],
          deploymentLog: [],
          inventoryLog: [],
          addedAt: Date.now(),
        },
      ],
    }));
    setForm({
      name: '',
      category: 'Equipment',
      qty: '1',
      location: '',
      condition: 'Good',
      status: 'available',
      serialNumber: '',
      acquisitionDate: '',
      acquisitionCost: '',
      fundingSource: '',
      deployable: true,
      assignedTo: '',
      femaEquipType: '',
      aelNumber: '',
      usefulLife: '',
      federalSharePct: '75',
      grantProgram: '',
      make: '',
      model: '',
    });
    setShowForm(false);
  };
  const remove = (id) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
  };
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

  const resources = data.resources || [];
  const filtered =
    filter === 'all'
      ? resources
      : resources.filter((r) =>
          filter === 'deployed'
            ? r.status === 'deployed'
            : filter === 'available'
            ? r.status === 'available'
            : filter === 'needs_attention'
            ? r.condition === 'Needs Repair' ||
              r.condition === 'Out of Service' ||
              r.status === 'out_of_service'
            : filter === 'deployable'
            ? r.deployable !== false
            : true
        );
  const deployed = resources.filter((r) => r.status === 'deployed').length;
  const available = resources.filter((r) => r.status === 'available').length;
  const needsAttention = resources.filter(
    (r) => r.condition === 'Needs Repair' || r.condition === 'Out of Service'
  ).length;
  const totalValue = resources.reduce(
    (a, r) => a + parseFloat(r.acquisitionCost || 0) * parseInt(r.qty || 1),
    0
  );
  const needsInventory = resources.filter((r) => {
    const last = r.lastInventoryDate;
    if (!last) return true;
    const d = new Date(last);
    const now = new Date();
    return (now - d) / (1000 * 60 * 60 * 24) > 365;
  });

  // Deploy / Return functions
  const deployResource = (id, location, incident, assignee) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'deployed',
              deployedTo: location,
              deployedIncident: incident,
              deployedAssignee: assignee,
              deployedDate: today(),
              deploymentLog: [
                ...(r.deploymentLog || []),
                {
                  id: uid(),
                  action: 'deployed',
                  location,
                  incident,
                  assignee,
                  date: today(),
                  ts: Date.now(),
                },
              ],
            }
          : r
      ),
    }));
  };
  const returnResource = (id, condition) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'available',
              condition: condition || r.condition,
              deployedTo: '',
              deployedIncident: '',
              deployedAssignee: '',
              deployedDate: '',
              deploymentLog: [
                ...(r.deploymentLog || []),
                {
                  id: uid(),
                  action: 'returned',
                  condition,
                  date: today(),
                  ts: Date.now(),
                },
              ],
            }
          : r
      ),
    }));
  };
  // Inventory verification
  const verifyInventory = (id, verifiedBy, notes) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.map((r) =>
        r.id === id
          ? {
              ...r,
              lastInventoryDate: today(),
              lastInventoryBy: verifiedBy,
              inventoryLog: [
                ...(r.inventoryLog || []),
                { id: uid(), date: today(), verifiedBy, notes, ts: Date.now() },
              ],
            }
          : r
      ),
    }));
  };

  const sel = selectedId ? resources.find((r) => r.id === selectedId) : null;

  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1100 }}>
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
            EMAP 4.7 - {resources.length} items - {deployed} deployed -{' '}
            {available} available
            {totalValue > 0
              ? `  -  $${totalValue.toLocaleString()} total value`
              : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn label="+ Add Resource" onClick={() => setShowForm(true)} primary />
          {resources.length > 0 && <Btn label="Export All (CSV)" onClick={() => {
            const headers = ['Name','Make','Model','Serial/Tag','Category','Qty','Location','Condition','Status','AEL Number','FEMA Equipment Type','Acquisition Date','Acquisition Cost','Federal Share %','Grant Program','Useful Life (yrs)','Funding Source','Deployable','Deployed To','Incident'];
            const rows = resources.map(r => [
              r.name, r.make || '', r.model || '', r.serialNumber || '', r.category, r.qty,
              r.location || '', r.condition, r.status, r.aelNumber || '', r.femaEquipType || '',
              r.acquisitionDate || '', r.acquisitionCost || '', r.federalSharePct || '',
              r.grantProgram || '', r.usefulLife || '', r.fundingSource || '',
              r.deployable !== false ? 'Yes' : 'No', r.deployedTo || '', r.deployedIncident || ''
            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `resource_inventory_${today()}.csv`;
            a.click();
          }} />}
        </div>
      </div>
      <CoachBanner moduleId="resources" />

      {/* Stats bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5,1fr)',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { label: 'Total Assets', val: resources.length, color: B.blue },
          { label: 'Available', val: available, color: B.green },
          { label: 'Deployed', val: deployed, color: B.blue },
          {
            label: 'Needs Attention',
            val: needsAttention,
            color: needsAttention > 0 ? B.red : B.green,
          },
          {
            label: 'Needs Inventory',
            val: needsInventory.length,
            color: needsInventory.length > 0 ? B.amber : B.green,
          },
        ].map((s) => (
          <Card
            key={s.label}
            style={{ padding: '10px 12px', textAlign: 'center' }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>
              {s.val}
            </div>
            <div style={{ fontSize: 10, color: B.faint, marginTop: 2 }}>
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 16,
          padding: '4px',
          background: '#f0f3f4',
          borderRadius: 12,
        }}
      >
        {[
          { id: 'inventory', label: 'Inventory' },
          { id: 'deployed', label: `Deployed (${deployed})` },
          {
            id: 'annual',
            label: `Annual Inventory ${
              needsInventory.length > 0
                ? '(' + needsInventory.length + ' due)'
                : ''
            }`,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '9px 18px',
              borderRadius: 9,
              border: 'none',
              background: activeTab === t.id ? '#fff' : 'transparent',
              color: activeTab === t.id ? B.text : B.faint,
              fontSize: 13,
              fontWeight: activeTab === t.id ? 700 : 500,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              transition: 'all 0.15s ease',
              boxShadow:
                activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Add form */}
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
              fontSize: 13,
              fontWeight: 700,
              color: B.text,
              marginBottom: 12,
            }}
          >
            Add Resource / Asset
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
              <Label>Name / Description</Label>
              <FInput
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="e.g. Honda EU7000 Generator"
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
                placeholder="1"
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
              <Label>Serial / Tag #</Label>
              <FInput
                value={form.serialNumber}
                onChange={(v) => setForm((p) => ({ ...p, serialNumber: v }))}
                placeholder="SN or asset tag"
              />
            </div>
            <div>
              <Label>Location</Label>
              <FInput
                value={form.location}
                onChange={(v) => setForm((p) => ({ ...p, location: v }))}
                placeholder="Warehouse, Station 1..."
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
            <div>
              <Label>Deployable Asset</Label>
              <FSel
                value={form.deployable ? 'yes' : 'no'}
                onChange={(v) =>
                  setForm((p) => ({ ...p, deployable: v === 'yes' }))
                }
              >
                <option value="yes">Yes - Deployable</option>
                <option value="no">No - Fixed</option>
              </FSel>
            </div>
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
              <Label>Acquisition Date</Label>
              <FInput
                type="date"
                value={form.acquisitionDate}
                onChange={(v) => setForm((p) => ({ ...p, acquisitionDate: v }))}
              />
            </div>
            <div>
              <Label>Acquisition Cost ($)</Label>
              <FInput
                value={form.acquisitionCost}
                onChange={(v) => setForm((p) => ({ ...p, acquisitionCost: v }))}
                placeholder="5000"
              />
            </div>
            <div>
              <Label>Funding Source</Label>
              <FSel
                value={form.fundingSource}
                onChange={(v) => setForm((p) => ({ ...p, fundingSource: v }))}
              >
                <option value="">General Fund</option>
                <option value="empg">EMPG</option>
                <option value="hmgp">HMGP</option>
                <option value="uasi">UASI</option>
                <option value="bric">BRIC</option>
                <option value="shsp">SHSP</option>
                <option value="donated">Donated</option>
                <option value="other">Other Grant</option>
              </FSel>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 12, marginTop: 4, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: B.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>FEMA Reimbursement Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <Label>Make</Label>
                <FInput value={form.make} onChange={(v) => setForm((p) => ({ ...p, make: v }))} placeholder="e.g. Motorola" />
              </div>
              <div>
                <Label>Model</Label>
                <FInput value={form.model} onChange={(v) => setForm((p) => ({ ...p, model: v }))} placeholder="e.g. APX 8000" />
              </div>
              <div>
                <Label>AEL Number</Label>
                <FInput value={form.aelNumber} onChange={(v) => setForm((p) => ({ ...p, aelNumber: v }))} placeholder="e.g. 06CP-01-PORT" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
              <div>
                <Label>FEMA Equipment Type</Label>
                <FSel value={form.femaEquipType} onChange={(v) => setForm((p) => ({ ...p, femaEquipType: v }))}>
                  <option value="">Select...</option>
                  <option value="communications">Communications</option>
                  <option value="cyber">Cyber Security</option>
                  <option value="decontam">Decontamination</option>
                  <option value="detection">Detection</option>
                  <option value="explosive">Explosive Device</option>
                  <option value="fire">Fire</option>
                  <option value="info_tech">Information Technology</option>
                  <option value="interop">Interoperable Comms</option>
                  <option value="medical">Medical</option>
                  <option value="ppe">PPE</option>
                  <option value="power">Power / Generators</option>
                  <option value="search_rescue">Search & Rescue</option>
                  <option value="vehicle">Vehicles</option>
                  <option value="watercraft">Watercraft</option>
                  <option value="other">Other</option>
                </FSel>
              </div>
              <div>
                <Label>Grant Program</Label>
                <FInput value={form.grantProgram} onChange={(v) => setForm((p) => ({ ...p, grantProgram: v }))} placeholder="e.g. FY24 EMPG" />
              </div>
              <div>
                <Label>Federal Share %</Label>
                <FInput value={form.federalSharePct} onChange={(v) => setForm((p) => ({ ...p, federalSharePct: v }))} placeholder="75" />
              </div>
              <div>
                <Label>Useful Life (years)</Label>
                <FInput value={form.usefulLife} onChange={(v) => setForm((p) => ({ ...p, usefulLife: v }))} placeholder="e.g. 5" />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Add Resource" onClick={save} primary small />
            <Btn label="Cancel" onClick={() => setShowForm(false)} small />
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <>
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            {[
              ['all', 'All'],
              ['available', 'Available'],
              ['deployed', 'Deployed'],
              ['deployable', 'Deployable'],
              ['needs_attention', 'Needs Attention'],
            ].map(([f, lbl]) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: `1px solid ${filter === f ? B.teal : B.border}`,
                  background: filter === f ? B.tealLight : B.card,
                  color: filter === f ? B.tealDark : B.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {lbl} (
                {f === 'all'
                  ? resources.length
                  : f === 'available'
                  ? available
                  : f === 'deployed'
                  ? deployed
                  : f === 'deployable'
                  ? resources.filter((r) => r.deployable !== false).length
                  : needsAttention}
                )
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <Card
              style={{ textAlign: 'center', padding: '32px', color: B.faint }}
            >
              No resources match this filter
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map((r) => {
                const st = STATUS_MAP[r.status] || STATUS_MAP.available;
                return (
                  <div
                    key={r.id}
                    style={{
                      background: B.card,
                      border: `1px solid ${B.border}`,
                      borderRadius: 9,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => setSelectedId(r.id)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = B.teal)
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
                            {r.name}
                          </span>
                          <Tag
                            label={r.category}
                            color={B.muted}
                            bg="#f0f3f4"
                            border={B.border}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: st.color,
                              background: st.bg,
                              padding: '2px 8px',
                              borderRadius: 10,
                              border: `1px solid ${st.color}30`,
                            }}
                          >
                            {st.label}
                          </span>
                          {r.deployable !== false && (
                            <span
                              style={{
                                fontSize: 9,
                                color: B.blue,
                                fontWeight: 600,
                              }}
                            >
                              DEPLOYABLE
                            </span>
                          )}
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
                          {r.serialNumber && <span>#{r.serialNumber}</span>}
                          {r.location && <span>{r.location}</span>}
                          {r.qty && parseInt(r.qty) > 1 && (
                            <span>Qty: {r.qty}</span>
                          )}
                          {r.status === 'deployed' && r.deployedTo && (
                            <span style={{ color: B.blue, fontWeight: 600 }}>
                              @ {r.deployedTo}
                            </span>
                          )}
                          {r.acquisitionCost && (
                            <span>
                              ${parseFloat(r.acquisitionCost).toLocaleString()}
                            </span>
                          )}
                          {r.fundingSource && (
                            <span style={{ textTransform: 'uppercase' }}>
                              {r.fundingSource}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(r.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d1d5db',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: '4px',
                        }}
                        title="Delete"
                      >
                        x
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* DEPLOYED TAB */}
      {activeTab === 'deployed' && (
        <>
          <div
            style={{
              background: `${B.blue}08`,
              border: `1px solid ${B.blueBorder}`,
              borderLeft: `3px solid ${B.blue}`,
              borderRadius: '0 8px 8px 0',
              padding: '9px 14px',
              marginBottom: 14,
              fontSize: 12,
              color: '#1e40af',
            }}
          >
            Track where your deployable assets are right now. Click any resource
            in the Inventory tab to deploy or return it.
          </div>
          {deployed > 0 && (
            <div style={{ marginBottom: 14 }}>
              <Btn label="Export Deployed Equipment (CSV)" onClick={() => {
                const deployedRes = resources.filter(r => r.status === 'deployed');
                const headers = ['Name','Make','Model','Serial/Tag','Category','Qty','AEL Number','FEMA Equipment Type','Acquisition Cost','Federal Share %','Grant Program','Useful Life (yrs)','Funding Source','Deployed To','Incident','Assigned To','Deploy Date','Condition'];
                const rows = deployedRes.map(r => [
                  r.name, r.make || '', r.model || '', r.serialNumber || '', r.category, r.qty,
                  r.aelNumber || '', r.femaEquipType || '', r.acquisitionCost || '', r.federalSharePct || '',
                  r.grantProgram || '', r.usefulLife || '', r.fundingSource || '',
                  r.deployedTo || '', r.deployedIncident || '', r.deployedAssignee || '',
                  r.deployedDate || '', r.condition
                ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
                const csv = [headers.join(','), ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `deployed_equipment_${today()}.csv`;
                a.click();
              }} small />
            </div>
          )}
          {deployed === 0 ? (
            <Card
              style={{ textAlign: 'center', padding: '32px', color: B.faint }}
            >
              No resources currently deployed. Click a resource in the Inventory
              tab to deploy it.
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resources
                .filter((r) => r.status === 'deployed')
                .map((r) => (
                  <Card
                    key={r.id}
                    style={{ borderLeft: `3px solid ${B.blue}` }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: B.text,
                            marginBottom: 3,
                          }}
                        >
                          {r.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: B.faint,
                            display: 'flex',
                            gap: 10,
                            flexWrap: 'wrap',
                          }}
                        >
                          {r.deployedTo && (
                            <span style={{ fontWeight: 600, color: B.blue }}>
                              Location: {r.deployedTo}
                            </span>
                          )}
                          {r.deployedIncident && (
                            <span>Incident: {r.deployedIncident}</span>
                          )}
                          {r.deployedAssignee && (
                            <span>Assigned to: {r.deployedAssignee}</span>
                          )}
                          {r.deployedDate && (
                            <span>Since: {fmtDate(r.deployedDate)}</span>
                          )}
                        </div>
                      </div>
                      <Btn
                        label="Return"
                        onClick={() => returnResource(r.id)}
                        small
                      />
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </>
      )}

      {/* ANNUAL INVENTORY TAB */}
      {activeTab === 'annual' && (
        <>
          <div
            style={{
              background: `${B.amber}08`,
              border: `1px solid ${B.amberBorder}`,
              borderLeft: `3px solid ${B.amber}`,
              borderRadius: '0 8px 8px 0',
              padding: '9px 14px',
              marginBottom: 14,
              fontSize: 12,
              color: '#92400e',
            }}
          >
            Many grants (EMPG, HMGP) and county purchasing require annual
            physical inventory of assets. Items not verified in 12+ months are
            flagged. Click each to verify.
          </div>
          {totalValue > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <Card style={{ padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: B.blue }}>
                  ${totalValue.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: B.faint, marginTop: 2 }}>
                  Total Asset Value
                </div>
              </Card>
              <Card style={{ padding: '12px 14px', textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: needsInventory.length > 0 ? B.amber : B.green,
                  }}
                >
                  {needsInventory.length}
                </div>
                <div style={{ fontSize: 10, color: B.faint, marginTop: 2 }}>
                  Need Verification
                </div>
              </Card>
              <Card style={{ padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: B.green }}>
                  {resources.length - needsInventory.length}
                </div>
                <div style={{ fontSize: 10, color: B.faint, marginTop: 2 }}>
                  Verified (12 mo)
                </div>
              </Card>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {resources.map((r) => {
              const overdue = needsInventory.includes(r);
              const lastDate = r.lastInventoryDate;
              return (
                <div
                  key={r.id}
                  style={{
                    background: B.card,
                    border: `1px solid ${overdue ? B.amberBorder : B.border}`,
                    borderLeft: `3px solid ${overdue ? B.amber : B.green}`,
                    borderRadius: '0 9px 9px 0',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: B.text }}
                      >
                        {r.name}
                      </span>
                      {r.serialNumber && (
                        <span style={{ fontSize: 11, color: B.faint }}>
                          #{r.serialNumber}
                        </span>
                      )}
                      {r.fundingSource && (
                        <Tag
                          label={r.fundingSource.toUpperCase()}
                          color={B.blue}
                          bg={B.blueLight}
                          border={B.blueBorder}
                        />
                      )}
                      {r.acquisitionCost && (
                        <span style={{ fontSize: 11, color: B.muted }}>
                          ${parseFloat(r.acquisitionCost).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: B.faint }}>
                      {lastDate ? (
                        <>
                          Last verified: {fmtDate(lastDate)}
                          {r.lastInventoryBy ? ` by ${r.lastInventoryBy}` : ''}
                        </>
                      ) : (
                        <span style={{ color: B.amber, fontWeight: 600 }}>
                          Never inventoried
                        </span>
                      )}
                    </div>
                  </div>
                  {overdue ? (
                    <Btn
                      label="Verify Now"
                      onClick={() => {
                        const by = prompt('Verified by (your name):');
                        if (by)
                          verifyInventory(
                            r.id,
                            by,
                            'Annual inventory verification'
                          );
                      }}
                      primary
                      small
                    />
                  ) : (
                    <Tag
                      label="Current"
                      color={B.green}
                      bg={B.greenLight}
                      border={B.greenBorder}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {resources.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <Btn
                label="Verify All Resources"
                onClick={() => {
                  const by = prompt('Verified by (your name):');
                  if (by)
                    resources.forEach((r) =>
                      verifyInventory(r.id, by, 'Bulk annual inventory')
                    );
                }}
                primary
              />
              <Btn
                label="Export Inventory Report"
                onClick={() => {
                  const lines = [
                    'ANNUAL INVENTORY REPORT',
                    'Date: ' + new Date().toLocaleDateString(),
                    'Organization: ' + (data.orgName || ''),
                    '',
                    'Name | Serial/Tag | Category | Qty | Location | Condition | Acquisition Cost | Funding Source | Last Verified',
                    '---',
                    '',
                  ];
                  resources.forEach((r) => {
                    lines.push(
                      `${r.name} | ${r.serialNumber || 'N/A'} | ${
                        r.category
                      } | ${r.qty || 1} | ${r.location || 'N/A'} | ${
                        r.condition
                      } | $${r.acquisitionCost || 'N/A'} | ${(
                        r.fundingSource || 'general fund'
                      ).toUpperCase()} | ${
                        r.lastInventoryDate
                          ? fmtDate(r.lastInventoryDate)
                          : 'Never'
                      }`
                    );
                  });
                  lines.push(
                    '',
                    'Total Assets: ' + resources.length,
                    'Total Value: $' + totalValue.toLocaleString(),
                    'Items Needing Verification: ' + needsInventory.length
                  );
                  const blob = new Blob([lines.join('\n')], {
                    type: 'text/plain',
                  });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `inventory-report-${today()}.txt`;
                  a.click();
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Resource Detail Panel */}
      {sel && (
        <>
          <div
            onClick={() => setSelectedId(null)}
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
              width: 560,
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
                padding: '16px 20px',
                borderBottom: `1px solid ${B.border}`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: B.text }}>
                    {sel.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      marginTop: 4,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Tag
                      label={sel.category}
                      color={B.muted}
                      bg="#f0f3f4"
                      border={B.border}
                    />
                    <Tag
                      label={
                        (STATUS_MAP[sel.status] || STATUS_MAP.available).label
                      }
                      color={
                        (STATUS_MAP[sel.status] || STATUS_MAP.available).color
                      }
                      bg={(STATUS_MAP[sel.status] || STATUS_MAP.available).bg}
                      border={B.border}
                    />
                    {sel.deployable !== false && (
                      <Tag
                        label="Deployable"
                        color={B.blue}
                        bg={B.blueLight}
                        border={B.blueBorder}
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
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
                  x
                </button>
              </div>
            </div>
            <div
              style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 40px' }}
            >
              {/* Quick Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 16,
                  flexWrap: 'wrap',
                }}
              >
                {sel.status !== 'deployed' && sel.deployable !== false && (
                  <Btn
                    label="Deploy"
                    onClick={() => {
                      const loc = prompt('Deploy to location:');
                      if (loc) {
                        const inc = prompt('Incident/Event (optional):') || '';
                        const who = prompt('Assigned to (optional):') || '';
                        deployResource(sel.id, loc, inc, who);
                      }
                    }}
                    primary
                    small
                  />
                )}
                {sel.status === 'deployed' && (
                  <Btn
                    label="Return to Inventory"
                    onClick={() => {
                      const cond =
                        prompt(
                          'Condition on return (Excellent/Good/Fair/Needs Repair):'
                        ) || sel.condition;
                      returnResource(sel.id, cond);
                    }}
                    small
                  />
                )}
                <Btn
                  label="Verify Inventory"
                  onClick={() => {
                    const by = prompt('Verified by:');
                    if (by) verifyInventory(sel.id, by, 'Manual verification');
                  }}
                  small
                />
              </div>

              {/* Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div>
                  <Label>Name</Label>
                  <FInput
                    value={sel.name || ''}
                    onChange={(v) => updateRes(sel.id, 'name', v)}
                  />
                </div>
                <div>
                  <Label>Serial / Asset Tag</Label>
                  <FInput
                    value={sel.serialNumber || ''}
                    onChange={(v) => updateRes(sel.id, 'serialNumber', v)}
                    placeholder="SN-001"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <FSel
                    value={sel.category}
                    onChange={(v) => updateRes(sel.id, 'category', v)}
                  >
                    {CATS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </FSel>
                </div>
                <div>
                  <Label>Qty</Label>
                  <FInput
                    value={sel.qty || ''}
                    onChange={(v) => updateRes(sel.id, 'qty', v)}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <FInput
                    value={sel.location || ''}
                    onChange={(v) => updateRes(sel.id, 'location', v)}
                  />
                </div>
                <div>
                  <Label>Condition</Label>
                  <FSel
                    value={sel.condition}
                    onChange={(v) => updateRes(sel.id, 'condition', v)}
                  >
                    {CONDS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </FSel>
                </div>
                <div>
                  <Label>Acquisition Date</Label>
                  <FInput
                    type="date"
                    value={sel.acquisitionDate || ''}
                    onChange={(v) => updateRes(sel.id, 'acquisitionDate', v)}
                  />
                </div>
                <div>
                  <Label>Acquisition Cost ($)</Label>
                  <FInput
                    value={sel.acquisitionCost || ''}
                    onChange={(v) => updateRes(sel.id, 'acquisitionCost', v)}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label>Funding Source</Label>
                  <FSel
                    value={sel.fundingSource || ''}
                    onChange={(v) => updateRes(sel.id, 'fundingSource', v)}
                  >
                    <option value="">General Fund</option>
                    <option value="empg">EMPG</option>
                    <option value="hmgp">HMGP</option>
                    <option value="uasi">UASI</option>
                    <option value="bric">BRIC</option>
                    <option value="shsp">SHSP</option>
                    <option value="donated">Donated</option>
                    <option value="other">Other</option>
                  </FSel>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <FInput
                    value={sel.assignedTo || ''}
                    onChange={(v) => updateRes(sel.id, 'assignedTo', v)}
                    placeholder="Person or unit"
                  />
                </div>
              </div>

              {/* Deployment status */}
              {sel.status === 'deployed' && (
                <Card
                  style={{
                    marginBottom: 14,
                    borderLeft: `3px solid ${B.blue}`,
                    borderRadius: '0 14px 14px 0',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: B.blue,
                      marginBottom: 6,
                    }}
                  >
                    Currently Deployed
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: B.muted,
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    {sel.deployedTo && (
                      <span>
                        Location: <strong>{sel.deployedTo}</strong>
                      </span>
                    )}
                    {sel.deployedIncident && (
                      <span>Incident: {sel.deployedIncident}</span>
                    )}
                    {sel.deployedAssignee && (
                      <span>Assigned: {sel.deployedAssignee}</span>
                    )}
                    {sel.deployedDate && (
                      <span>Since: {fmtDate(sel.deployedDate)}</span>
                    )}
                  </div>
                </Card>
              )}

              {/* Deployment History */}
              {(sel.deploymentLog || []).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: B.muted,
                      marginBottom: 8,
                    }}
                  >
                    Deployment History
                  </div>
                  {[...(sel.deploymentLog || [])]
                    .reverse()
                    .slice(0, 10)
                    .map((log) => (
                      <div
                        key={log.id}
                        style={{
                          fontSize: 11,
                          color: B.faint,
                          padding: '5px 0',
                          borderBottom: `1px solid #f4f8f9`,
                          display: 'flex',
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: log.action === 'deployed' ? B.blue : B.green,
                          }}
                        >
                          {log.action === 'deployed' ? 'Deployed' : 'Returned'}
                        </span>
                        <span>{fmtDate(log.date)}</span>
                        {log.location && <span>@ {log.location}</span>}
                        {log.assignee && <span>to {log.assignee}</span>}
                        {log.condition && (
                          <span>Condition: {log.condition}</span>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* Inventory History */}
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: B.muted,
                    marginBottom: 4,
                  }}
                >
                  Inventory Verification
                </div>
                <div style={{ fontSize: 11, color: B.faint, marginBottom: 8 }}>
                  Last:{' '}
                  {sel.lastInventoryDate ? (
                    `${fmtDate(sel.lastInventoryDate)}${
                      sel.lastInventoryBy ? ' by ' + sel.lastInventoryBy : ''
                    }`
                  ) : (
                    <span style={{ color: B.amber }}>Never verified</span>
                  )}
                </div>
                {(sel.inventoryLog || []).length > 0 &&
                  [...(sel.inventoryLog || [])]
                    .reverse()
                    .slice(0, 5)
                    .map((log) => (
                      <div
                        key={log.id}
                        style={{
                          fontSize: 11,
                          color: B.faint,
                          padding: '3px 0',
                        }}
                      >
                        {fmtDate(log.date)} - {log.verifiedBy}
                        {log.notes ? ' - ' + log.notes : ''}
                      </div>
                    ))}
              </div>

              {/* Docs */}
              <Attachments
                docs={sel.docs || []}
                onAdd={(doc) =>
                  updateRes(sel.id, 'docs', [...(sel.docs || []), doc])
                }
                onRemove={(id) =>
                  updateRes(
                    sel.id,
                    'docs',
                    (sel.docs || []).filter((d) => d.id !== id)
                  )
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   SIDEBAR
------------------------------------------------------- */
function Sidebar({ view, setView, data, notifCount, orgName, onEditOrg, collapsed, onToggleCollapse }) {
  const nav = [
    {
      group: '',
      items: [
        { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
        { id: 'settings', icon: '◧', label: 'My Program' },
      ],
    },
    {
      group: 'Program Ops',
      items: [
        { id: 'thira', icon: '◉', label: 'Hazard Analysis' },
        { id: 'plans', icon: '◉', label: 'Plans & SOPs' },
        { id: 'partners', icon: '◉', label: 'Partners & MOUs' },
        { id: 'resources', icon: '◉', label: 'Resources' },
        { id: 'employees', icon: '◉', label: 'Personnel' },
        { id: 'training', icon: '◉', label: 'Training' },
        { id: 'exercises', icon: '◉', label: 'Exercises & AARs' },
        { id: 'grants', icon: '◉', label: 'Grants & Funding' },
      ],
    },
    {
      group: 'Compliance',
      items: [
        { id: 'accreditation', icon: '✓', label: 'EMAP Standards' },
        { id: 'journey', icon: '→', label: 'Accreditation Journey' },
        { id: 'package', icon: '▤', label: 'Package Builder' },
        { id: 'cap', icon: '⚑', label: 'Corrective Actions' },
      ],
    },
    {
      group: 'AI Tools',
      items: [
        { id: 'assistant', icon: null, label: 'AI Assistant', ai: true },
        { id: 'intake', icon: '↑', label: 'Bulk Doc Intake' },
        { id: 'templates', icon: '✦', label: 'Doc Templates' },
        { id: 'evidence', icon: '↓', label: 'Evidence Export' },
      ],
    },
    {
      group: 'Advanced',
      items: [
        { id: 'recovery', icon: '↻', label: 'Recovery Planning' },
        { id: 'mutualaid', icon: '◎', label: 'Mutual Aid' },
        { id: 'reports', icon: '▤', label: 'Reports' },
        { id: 'calendar', icon: '▦', label: 'Calendar' },
        { id: 'activity', icon: '◷', label: 'Activity Log' },
      ],
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
      role="navigation"
      aria-label="Main navigation"
      style={{
        width: collapsed ? 64 : 244,
        background: B.sidebar,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 40,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: collapsed ? '16px 12px' : '20px 18px 16px',
          borderBottom: `1px solid ${B.sidebarBorder}`,
          transition: 'padding 0.2s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            marginBottom: collapsed ? 0 : 14,
            justifyContent: collapsed ? 'center' : 'flex-start',
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
          {!collapsed && <Wordmark dark size="sm" />}
        </div>
        {!collapsed && <div
          onClick={onEditOrg}
          style={{
            background: B.sidebarMid,
            borderRadius: 10,
            padding: '12px 14px',
            cursor: 'pointer',
            border: `1px solid ${B.sidebarBorder}`,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = 'rgba(27,201,196,0.3)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = B.sidebarBorder)
          }
        >
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: 8,
            }}
          >
            {orgName || 'My Organization'}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 5,
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
                fontSize: 10,
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
          <div
            style={{
              height: 4,
              background: '#2E3439',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${overall.pct}%`,
                background: `linear-gradient(90deg,${B.teal},${B.tealDark})`,
                borderRadius: 3,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 7 }}>
            <span style={{ fontSize: 9, color: '#34d399' }}>
              {overall.compliant} done
            </span>
            <span style={{ fontSize: 9, color: '#fbbf24' }}>
              {overall.in_progress} active
            </span>
            <span style={{ fontSize: 9, color: '#f87171' }}>
              {overall.needs_review} review
            </span>
            <span style={{ fontSize: 9, color: '#4A5568' }}>
              {overall.not_started} todo
            </span>
          </div>
        </div>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '8px 4px' : '8px 0' }}>
        {nav.map((g, gi) => (
          <div key={g.group || 'top'}>
            {g.group && !collapsed && (
              <div
                style={{
                  padding: '14px 18px 5px',
                  fontSize: 9,
                  color: '#4A5568',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {g.group}
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: B.sidebarBorder,
                    opacity: 0.5,
                  }}
                />
              </div>
            )}
            {g.group && collapsed && gi > 0 && (
              <div style={{ height: 1, background: B.sidebarBorder, margin: '6px 8px', opacity: 0.4 }} />
            )}
            {g.items.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? 0 : 9,
                  width: collapsed ? 'calc(100% - 8px)' : 'calc(100% - 16px)',
                  margin: collapsed ? '1px 4px' : '1px 8px',
                  padding: collapsed ? '10px 0' : '8px 12px',
                  borderRadius: 6,
                  background:
                    view === item.id ? 'rgba(27,201,196,0.08)' : 'none',
                  border: 'none',
                  borderLeft: collapsed ? 'none' : (view === item.id ? `3px solid ${B.teal}` : '3px solid transparent'),
                  color:
                    view === item.id
                      ? B.teal
                      : item.ai
                      ? '#6EDCD8'
                      : B.sidebarMuted,
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontFamily: "'DM Sans',sans-serif",
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  fontWeight: view === item.id ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (view !== item.id)
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (view !== item.id)
                    e.currentTarget.style.background = 'none';
                }}
              >
                {item.ai ? (
                  <BrainIcon
                    size={14}
                    color={view === item.id ? B.teal : '#6EDCD8'}
                    strokeWidth={1.3}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      opacity: 0.5,
                      width: 16,
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                )}
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && item.ai && view !== item.id && (
                  <span
                    style={{
                      fontSize: 8,
                      color: B.teal,
                      background: 'rgba(27,201,196,0.1)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
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
      {(() => {
        const plan = getPlanLimits(data.plan || 'solo');
        const used = getAIUsageCount();
        const pctUsed = plan.aiCallsPerMonth === Infinity ? 0 : Math.min(100, Math.round((used / plan.aiCallsPerMonth) * 100));
        return (
          <div style={{ padding: collapsed ? '8px 10px' : '10px 18px', borderTop: `1px solid ${B.sidebarBorder}` }} title={`AI: ${used}/${plan.aiCallsPerMonth === Infinity ? '∞' : plan.aiCallsPerMonth}`}>
            {!collapsed && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Usage</span>
              <span style={{ fontSize: 9, color: pctUsed > 80 ? '#f59e0b' : '#4A5568', fontWeight: 600 }}>
                {plan.aiCallsPerMonth === Infinity ? `${used} calls` : `${used} / ${plan.aiCallsPerMonth}`}
              </span>
            </div>}
            {plan.aiCallsPerMonth !== Infinity && (
              <div style={{ height: 3, background: '#2E3439', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pctUsed}%`,
                  background: pctUsed > 90 ? B.red : pctUsed > 70 ? B.amber : B.teal,
                  borderRadius: 2, transition: 'width 0.5s ease',
                }} />
              </div>
            )}
          </div>
        );
      })()}
      <div
        style={{
          padding: collapsed ? '10px 8px' : '10px 18px',
          borderTop: `1px solid ${B.sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 7,
        }}
      >
        {!collapsed && <>
          <BrainIcon size={12} color={'#4A5568'} strokeWidth={1} />
          <span style={{ fontSize: 9, color: '#4A5568', letterSpacing: '0.06em', flex: 1 }}>PLANRR</span>
        </>}
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} style={{
            background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 14,
            padding: '4px', borderRadius: 4, transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = B.teal}
            onMouseLeave={e => e.currentTarget.style.color = '#4A5568'}
          >{collapsed ? '»' : '«'}</button>
        )}
      </div>
    </aside>
  );
}

/* -------------------------------------------------------
   DASHBOARD
------------------------------------------------------- */

/* -------------------------------------------------------
   CALENDAR, REPORTS, AI ASSISTANT
------------------------------------------------------- */
function ProgramCalendar({ data }) {
  const items = useMemo(() => {
    const all = [];
    data.exercises.forEach((e) => {
      if (e.date)
        all.push({
          date: e.date,
          label: e.name,
          color: B.purple,
          icon: '-',
          id: e.id,
        });
    });
    data.partners.forEach((p) => {
      if (p.expires)
        all.push({
          date: p.expires,
          label: `MOU Expires: ${p.name}`,
          color: daysUntil(p.expires) < 30 ? B.red : B.amber,
          icon: '-',
          id: 'm' + p.id,
        });
    });
    data.plans.forEach((p) => {
      if (p.nextReview)
        all.push({
          date: p.nextReview,
          label: `Review Due: ${p.name}`,
          color: daysUntil(p.nextReview) < 0 ? B.red : B.green,
          icon: '-',
          id: 'p' + p.id,
        });
    });
    data.training.forEach((t) => {
      if (t.date)
        all.push({
          date: t.date,
          label: `Training: ${t.person} - ${t.type}`,
          color: B.teal,
          icon: '-',
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1040 }}>
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
          Exercises - Plan reviews - MOU expirations - Training - Credential
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
            Upcoming - 180 days
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
    brand.footerDisclaimer || `${orgName || 'EM Program'}  -  EMAP EMS 5-2022`;
  const poweredBy =
    brand.showPoweredBy !== false
      ? brand.poweredByText || 'Powered by PLANRR.ai'
      : '';
  const preparedBy = brand.preparedBy || data.emName || data.emTitle || '';
  const subtitle =
    brand.reportSubtitle ||
    'Emergency Management Program - EMAP Compliance Report';

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
        (chunk) => setExec((p) => p + chunk),
        'exec_summary'
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1040 }}>
      {/* -- Screen: topbar -- */}
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
            EMAP EMS 5-2022 - {today2}
            {brand.logoBase64
              ? ''
              : '  -  Add your logo in My Program → Branding'}
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
            - Print / Export PDF
          </button>
        </div>
      </div>

      {/* -- PRINT COVER PAGE (visible on screen too as preview) -- */}
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

      {/* -- AI Executive Summary -- */}
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
            label={loading ? '- Writing...' : 'Generate with AI'}
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
            data - ready for leadership or accreditation submission.
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

      {/* -- Section grid -- */}
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
            EMAP Standards Status - All 17 Sections
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

      {/* -- Print footer (hidden on screen, shown when printing via CSS) -- */}
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
          <strong style={{ color: B.text }}>My Program → Branding</strong> to
          add it to exports, along with your accent color and footer disclaimer.
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
      content: `Hi - I'm your EMAP and EM program expert in PLANRR.\n\nFull context: ${
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
    'AAR requirements - HSEEP vs EMAP?',
    'How do I prepare my accreditation package?',
    'What credentials does an EM director need?',
  ];
  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 760 }}>
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
            EMAP expert - knows your full program - Plan Smartr
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
            placeholder="Ask anything about EMAP or your EM program..."
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
            -
          </button>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------
   GRANT TRACKER
------------------------------------------------------- */
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

/* --- GRANT WORK LOG ---------------------------------- */
function GrantWorkLog({ grant, onUpdate, employees }) {
  const deliverables = grant.deliverables || [];
  const [form, setForm] = useState({
    date: today(),
    description: '',
    hours: '',
    person: '',
    type: 'Meeting',
    deliverableId: '',
    costOverride: '',
  });
  const entries = grant.workLog || [];

  // Find employee billable rate
  const getRate = (personName) => {
    if (!employees || !personName) return 0;
    const emp = employees.find(
      (e) => e.name?.toLowerCase() === personName.toLowerCase()
    );
    return parseFloat(emp?.hourlyRate || 0);
  };

  const addEntry = () => {
    if (!form.description) return;
    const rate = form.costOverride
      ? parseFloat(form.costOverride)
      : getRate(form.person);
    const cost = rate * parseFloat(form.hours || 0);
    onUpdate('workLog', [
      ...entries,
      { ...form, id: uid(), addedAt: Date.now(), rate, cost },
    ]);
    setForm({
      date: today(),
      description: '',
      hours: '',
      person: '',
      type: 'Meeting',
      deliverableId: '',
      costOverride: '',
    });
  };
  const removeEntry = (id) =>
    onUpdate(
      'workLog',
      entries.filter((e) => e.id !== id)
    );
  const totalHours = entries.reduce((a, e) => a + parseFloat(e.hours || 0), 0);
  const totalCost = entries.reduce((a, e) => a + parseFloat(e.cost || 0), 0);
  return (
    <div>
      <div
        style={{
          background: B.card,
          border: `1px solid ${B.border}`,
          borderRadius: 9,
          padding: '14px 16px',
          marginBottom: 14,
        }}
      >
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
          Log Entry
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div>
            <Label>Date</Label>
            <FInput
              type="date"
              value={form.date}
              onChange={(v) => setForm((p) => ({ ...p, date: v }))}
            />
          </div>
          <div>
            <Label>Type</Label>
            <FSel
              value={form.type}
              onChange={(v) => setForm((p) => ({ ...p, type: v }))}
            >
              <option>Meeting</option>
              <option>Site Visit</option>
              <option>Planning</option>
              <option>Admin</option>
              <option>Training</option>
              <option>Exercise</option>
              <option>Reporting</option>
              <option>Procurement</option>
              <option>Other</option>
            </FSel>
          </div>
          <div>
            <Label>Person</Label>
            <FInput
              value={form.person}
              onChange={(v) => setForm((p) => ({ ...p, person: v }))}
              placeholder="Staff name"
            />
          </div>
          <div>
            <Label>Hours</Label>
            <FInput
              value={form.hours}
              onChange={(v) => setForm((p) => ({ ...p, hours: v }))}
              placeholder="1.5"
            />
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div>
            <Label>Description</Label>
            <FInput
              value={form.description}
              onChange={(v) => setForm((p) => ({ ...p, description: v }))}
              placeholder="Meeting with state agency re: quarterly report..."
            />
          </div>
          <div>
            <Label>Deliverable</Label>
            <FSel
              value={form.deliverableId}
              onChange={(v) => setForm((p) => ({ ...p, deliverableId: v }))}
            >
              <option value="">None</option>
              {deliverables.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.item.slice(0, 40)}
                  {d.item.length > 40 ? '...' : ''}
                </option>
              ))}
            </FSel>
          </div>
          <div>
            <Label>Cost Override ($)</Label>
            <FInput
              value={form.costOverride}
              onChange={(v) => setForm((p) => ({ ...p, costOverride: v }))}
              placeholder={
                form.person ? `Auto: $${getRate(form.person)}/hr` : 'Rate'
              }
            />
          </div>
        </div>
        {form.hours && (form.costOverride || getRate(form.person) > 0) && (
          <div
            style={{
              fontSize: 11,
              color: B.teal,
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            Cost: {parseFloat(form.hours || 0)} hrs x $
            {form.costOverride || getRate(form.person)}/hr = $
            {(
              parseFloat(form.hours || 0) *
              (parseFloat(form.costOverride) || getRate(form.person))
            ).toFixed(2)}
          </div>
        )}
        <Btn label="Log Entry" onClick={addEntry} primary small />
      </div>
      {(totalHours > 0 || totalCost > 0) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              background: `${B.green}10`,
              border: `1px solid ${B.greenBorder}`,
              borderRadius: 7,
              padding: '8px 14px',
              fontSize: 12,
              color: '#166534',
              fontWeight: 600,
            }}
          >
            {totalHours.toFixed(1)} hours logged across {entries.length} entries
          </div>
          <div
            style={{
              background: `${B.teal}10`,
              border: `1px solid ${B.tealBorder}`,
              borderRadius: 7,
              padding: '8px 14px',
              fontSize: 12,
              color: B.tealDark,
              fontWeight: 600,
            }}
          >
            $
            {totalCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            labor cost
          </div>
        </div>
      )}
      {entries.length === 0 ? (
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
          No work log entries yet. Log hours to track labor costs against this
          grant.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...entries].reverse().map((e) => {
            const dlName = e.deliverableId
              ? deliverables.find((d) => d.id === e.deliverableId)?.item
              : '';
            return (
              <div
                key={e.id}
                style={{
                  background: B.card,
                  border: `1px solid ${B.border}`,
                  borderRadius: 8,
                  padding: '10px 13px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: B.text,
                      marginBottom: 2,
                    }}
                  >
                    {e.description}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: B.faint,
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>{fmtDate(e.date)}</span>
                    <span>{e.type}</span>
                    {e.person && <span>{e.person}</span>}
                    {e.hours && <span>{e.hours}h</span>}
                    {e.cost > 0 && (
                      <span style={{ color: B.teal, fontWeight: 600 }}>
                        ${parseFloat(e.cost).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {dlName && (
                    <div
                      style={{
                        fontSize: 10,
                        color: B.green,
                        marginTop: 3,
                        fontWeight: 600,
                      }}
                    >
                      Deliverable: {dlName.slice(0, 50)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeEntry(e.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d1d5db',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: '2px 6px',
                  }}
                >
                  x
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
        (chunk) => setAiText((p) => p + chunk),
        'grant_guidance'
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
    { id: 'worklog', label: 'Work Log' },
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
              x
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
                  border: `1px solid ${
                    tab === t.id ? B.border : 'transparent'
                  }`,
                  borderBottom: `1px solid ${tab === t.id ? B.card : B.border}`,
                  background: tab === t.id ? B.card : 'transparent',
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
                    <option value="">Select type...</option>
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
                  placeholder="What this grant funds..."
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
                  placeholder="Add deliverable or reporting requirement..."
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
                    ok {completedDel} done
                  </span>
                  <span style={{ color: B.amber, fontWeight: 600 }}>
                    o {totalDel - completedDel} remaining
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
                  No deliverables yet - add reporting requirements and
                  milestones
                </div>
              )}
              {(grant.deliverables || []).map((d) => {
                const dueDays = daysUntil(d.due);
                const urgent = dueDays !== null && dueDays < 14 && !d.done;
                const dlExpense = parseFloat(d.expense || 0);
                const dlLoggedCost = (grant.workLog || [])
                  .filter((w) => w.deliverableId === d.id)
                  .reduce((a, w) => a + parseFloat(w.cost || 0), 0);
                const dlLoggedHrs = (grant.workLog || [])
                  .filter((w) => w.deliverableId === d.id)
                  .reduce((a, w) => a + parseFloat(w.hours || 0), 0);
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
                      {(dlExpense > 0 || dlLoggedCost > 0) && (
                        <span
                          style={{
                            fontSize: 10,
                            color: B.teal,
                            fontWeight: 600,
                          }}
                        >
                          ${(dlExpense + dlLoggedCost).toLocaleString()}
                        </span>
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
                        x
                      </button>
                    </div>
                    {!d.done && (
                      <div style={{ marginLeft: 24, marginBottom: 4 }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: 8,
                            marginBottom: 8,
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
                            <Label>Direct Expense ($)</Label>
                            <FInput
                              value={d.expense || ''}
                              onChange={(v) => updateDel(d.id, 'expense', v)}
                              placeholder="0.00"
                              style={{ fontSize: 11, padding: '5px 8px' }}
                            />
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <FInput
                              value={d.notes || ''}
                              onChange={(v) => updateDel(d.id, 'notes', v)}
                              placeholder="Notes..."
                              style={{ fontSize: 11, padding: '5px 8px' }}
                            />
                          </div>
                        </div>
                        {dlLoggedHrs > 0 && (
                          <div
                            style={{
                              fontSize: 10,
                              color: B.faint,
                              marginBottom: 6,
                            }}
                          >
                            {dlLoggedHrs.toFixed(1)}h logged in work log = $
                            {dlLoggedCost.toFixed(2)} labor
                          </div>
                        )}
                        <Attachments
                          docs={d.docs || []}
                          onAdd={(doc) =>
                            updateDel(d.id, 'docs', [...(d.docs || []), doc])
                          }
                          onRemove={(id) =>
                            updateDel(
                              d.id,
                              'docs',
                              (d.docs || []).filter((x) => x.id !== id)
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
          {tab === 'worklog' && (
            <div>
              <div
                style={{
                  background: B.greenLight,
                  border: `1px solid ${B.greenBorder}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 12,
                  fontSize: 12,
                  color: '#166534',
                }}
              >
                Log meetings, site visits, and hours billed to this grant. EMPG
                requires personnel time documentation.
              </div>
              <GrantWorkLog
                grant={grant}
                onUpdate={u}
                employees={grant._employees}
              />
            </div>
          )}
          {tab === 'budget' &&
            (() => {
              const laborCost = (grant.workLog || []).reduce(
                (a, e) => a + parseFloat(e.cost || 0),
                0
              );
              const directExpenses = (grant.deliverables || []).reduce(
                (a, d) => a + parseFloat(d.expense || 0),
                0
              );
              const manualExpended = parseFloat(grant.expended || 0);
              const calculatedExpended = laborCost + directExpenses;
              const totalExpended = Math.max(
                manualExpended,
                calculatedExpended
              );
              const expendPct =
                totalBudget > 0
                  ? Math.round((totalExpended / totalBudget) * 100)
                  : 0;
              return (
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
                            style={{
                              fontSize: 11,
                              color: B.faint,
                              marginTop: 3,
                            }}
                          >
                            {s.label}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Expenditure breakdown */}
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: B.text,
                        marginBottom: 10,
                      }}
                    >
                      Funds Expended
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <Card
                        style={{
                          padding: '12px 14px',
                          textAlign: 'center',
                          background: `${B.teal}08`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: B.teal,
                          }}
                        >
                          $
                          {laborCost.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div
                          style={{ fontSize: 10, color: B.faint, marginTop: 3 }}
                        >
                          Labor (from Work Log)
                        </div>
                      </Card>
                      <Card
                        style={{
                          padding: '12px 14px',
                          textAlign: 'center',
                          background: `${B.amber}08`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: B.amber,
                          }}
                        >
                          $
                          {directExpenses.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div
                          style={{ fontSize: 10, color: B.faint, marginTop: 3 }}
                        >
                          Direct (from Deliverables)
                        </div>
                      </Card>
                      <Card
                        style={{
                          padding: '12px 14px',
                          textAlign: 'center',
                          background: `${B.green}08`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: B.green,
                          }}
                        >
                          $
                          {totalExpended.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                        <div
                          style={{ fontSize: 10, color: B.faint, marginTop: 3 }}
                        >
                          Total Expended
                        </div>
                      </Card>
                      <Card
                        style={{ padding: '12px 14px', textAlign: 'center' }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color:
                              totalBudget > 0
                                ? expendPct > 90
                                  ? B.red
                                  : expendPct > 70
                                  ? B.amber
                                  : B.teal
                                : B.faint,
                          }}
                        >
                          {expendPct}%
                        </div>
                        <div
                          style={{ fontSize: 10, color: B.faint, marginTop: 3 }}
                        >
                          Burn Rate
                        </div>
                      </Card>
                    </div>
                    {totalBudget > 0 && (
                      <div
                        style={{
                          height: 8,
                          background: '#edf2f4',
                          borderRadius: 4,
                          overflow: 'hidden',
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ height: '100%', display: 'flex' }}>
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((laborCost / totalBudget) * 100)
                              )}%`,
                              background: B.teal,
                              transition: 'width 0.5s',
                            }}
                          />
                          <div
                            style={{
                              width: `${Math.min(
                                100 -
                                  Math.round((laborCost / totalBudget) * 100),
                                Math.round((directExpenses / totalBudget) * 100)
                              )}%`,
                              background: B.amber,
                              transition: 'width 0.5s',
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        fontSize: 11,
                        color: B.faint,
                      }}
                    >
                      <span>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: B.teal,
                            marginRight: 4,
                          }}
                        />
                        Labor
                      </span>
                      <span>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: B.amber,
                            marginRight: 4,
                          }}
                        />
                        Direct expenses
                      </span>
                      <span>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: '#edf2f4',
                            marginRight: 4,
                          }}
                        />
                        Remaining
                      </span>
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
                      <Label>Manual Override - Expended ($)</Label>
                      <FInput
                        value={grant.expended || ''}
                        onChange={(v) => u('expended', v)}
                        placeholder="Auto-calculated above"
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        paddingBottom: 2,
                      }}
                    >
                      <div style={{ fontSize: 11, color: B.faint }}>
                        Use this to override the auto-calculation if needed. The
                        higher of manual or calculated is used.
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Label>Match Source / Notes</Label>
                    <FTextarea
                      value={grant.matchNotes || ''}
                      onChange={(v) => u('matchNotes', v)}
                      rows={3}
                      placeholder="Describe how the non-federal match will be met (in-kind, cash, etc.)..."
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Label>Budget Narrative / Notes</Label>
                    <FTextarea
                      value={grant.budgetNotes || ''}
                      onChange={(v) => u('budgetNotes', v)}
                      rows={4}
                      placeholder="Budget breakdown, expenditure tracking notes..."
                    />
                  </div>
                </div>
              );
            })()}
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
                  label={aiLoad ? '- Analyzing...' : 'Analyze This Grant'}
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1000 }}>
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
            {grants.length} grants - ${totalActive.toLocaleString()} active
            federal funding - EMAP 3.4, 4.7
          </p>
        </div>
        <CoachBanner moduleId="grants" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn label="+ Add Grant" onClick={() => setShowForm(true)} primary />
          <Btn label="AI: Generate EMPG Narrative" onClick={async () => {
            const prompt = buildGrantNarrativePrompt(data, 'empg');
            let result = '';
            try {
              await callAI(SYS, prompt, (chunk) => { result += chunk; }, 'grant_guidance');
              const blob = new Blob([result], { type: 'text/plain' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `EMPG_Narrative_${(data.orgName || 'draft').replace(/\s/g, '_')}.txt`;
              a.click();
            } catch (e) {
              alert(e.message || 'Error generating narrative');
            }
          }} />
        </div>
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
        - Grant records support <strong>EMAP 3.4 (Admin & Finance)</strong> -
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
          No grants tracked yet - add EMPG, UASI, HMGP, and other funding
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
                          {expiredDels > 0 ? '- ' : ''}
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
                    -
                  </button>
                  <span style={{ color: B.border, fontSize: 14 }}>-</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {sel && (
        <GrantDetail
          grant={{ ...sel, _employees: data.employees || [] }}
          onUpdate={(updated) => {
            const { _employees, ...clean } = updated;
            updateGrant(sel.id, clean);
          }}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------
   THIRA/SPR
------------------------------------------------------- */
const HAZARD_TYPES = [
  'Natural - Earthquake',
  'Natural - Flood',
  'Natural - Wildfire',
  'Natural - Extreme Heat',
  'Natural - Severe Storm / Tornado',
  'Natural - Hurricane / Tropical Storm',
  'Natural - Landslide / Debris Flow',
  'Natural - Drought',
  'Natural - Tsunami',
  'Natural - Winter Storm / Ice',
  'Technological - Dam / Levee Failure',
  'Technological - HAZMAT Fixed Facility',
  'Technological - HAZMAT Transportation',
  'Technological - Power Outage / Utility Failure',
  'Technological - Cyber Attack',
  'Technological - Nuclear / Radiological',
  'Human-Caused - Terrorism / IED',
  'Human-Caused - Active Shooter / Mass Casualty',
  'Human-Caused - Civil Unrest',
  'Human-Caused - Public Health Emergency',
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
  'Physical Protective Measures',
  'Risk Management for Protection Programs & Activities',
  'Supply Chain Integrity & Security',
  'Critical Transportation',
  'Environmental Response / Health & Safety',
  'Fatality Management Services',
  'Fire Management & Suppression',
  'Logistics & Supply Chain Mgmt',
  'Mass Care Services',
  'Mass Search & Rescue',
  'On-scene Security, Protection & Law Enforcement',
  'Operational Communications',
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
    type: 'Natural - Flood',
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
      type: 'Natural - Flood',
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
        (chunk) => setAiText((p) => p + chunk),
        'thira_analysis'
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
      }".\n\nExtract ALL hazards/threats identified in this document.\nReturn ONLY valid JSON, no other text:\n{\n  "jurisdiction":"name from doc",\n  "docDate":"date if found",\n  "hazards":[\n    {\n      "name":"specific hazard name as written",\n      "type":"Natural - Flood|Natural - Wildfire|Natural - Earthquake|Natural - Severe Storm / Tornado|Natural - Extreme Heat|Natural - Hurricane / Tropical Storm|Natural - Landslide / Debris Flow|Natural - Drought|Natural - Winter Storm / Ice|Technological - Dam / Levee Failure|Technological - HAZMAT Fixed Facility|Technological - HAZMAT Transportation|Technological - Power Outage / Utility Failure|Technological - Cyber Attack|Human-Caused - Terrorism / IED|Human-Caused - Active Shooter / Mass Casualty|Human-Caused - Civil Unrest|Human-Caused - Public Health Emergency|Other",\n      "probability":3,\n      "magnitude":3,\n      "notes":"any context, data, or description from the document"\n    }\n  ]\n}\n\nFor probability and magnitude use 1-5 scale. Extract from the document if provided, otherwise make a reasonable estimate based on the hazard type and any context. Extract as many hazards as possible - be thorough.`;

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
        SB_URL + '/functions/v1/ai-proxy',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SB_KEY },
          body: JSON.stringify({
            operation: 'bulk_intake',
            model_tier: 'strong',
            stream: false,
            system: 'You are a THIRA/SPR hazard extraction expert. Analyze documents and extract hazard data. Return only valid JSON.',
            content,
            max_tokens: 1400,
          }),
        }
      );
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(errBody || `API error (${res.status})`);
      }
      const rawText = await res.text();
      let json;
      try { json = JSON.parse(rawText); } catch { throw new Error('Invalid AI response'); }
      const aiText = (json.content?.[0]?.text || '{}').replace(/```json\s?|```/g, '').trim();
      let parsed;
      try { parsed = JSON.parse(aiText); } catch {
        const m = aiText.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : {};
      }
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
        `ok Extracted ${newHazards.length} hazard${
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
  const generateSpar = async () => {
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
        }\nPrimary EM: ${data.emName || 'Unknown'}  -  ${
          data.emTitle || ''
        }\nDate: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}\nLast THIRA Update: ${
          fmtDate(thira.lastUpdated) || 'N/A'
        }\n\nHAZARDS PROFILED:\n${
          hazList ||
          'No hazards entered yet - add hazards first for a complete document.'
        }\n\nGenerate a formal government document with these sections:\n\n1. EXECUTIVE SUMMARY\n   - Jurisdiction overview, purpose, summary of highest-risk hazards\n\n2. METHODOLOGY\n   - FEMA CPG 201 Third Edition compliance statement\n   - Process used to identify and assess threats and hazards\n   - Stakeholder engagement summary\n\n3. THREAT AND HAZARD IDENTIFICATION\n   - Table format: Hazard | Category | Probability | Magnitude | Risk Score\n   - Brief description of each identified hazard for this jurisdiction\n\n4. RISK ASSESSMENT\n   - Analysis of each high-risk hazard (Risk Score - 12)\n   - Consequence analysis: impacts on public, responders, infrastructure, economy\n   - Vulnerability assessment\n\n5. CAPABILITY TARGETS\n   - Core capabilities stressed by identified hazards\n   - Current capability gaps\n   - Recommended capability targets aligned with CPG 201\n\n6. SPR - STAKEHOLDER PREPAREDNESS REVIEW\n   - Program strengths\n   - Areas for improvement\n   - Corrective actions and milestones\n   - Resources and investment priorities\n\n7. MAINTENANCE AND UPDATE SCHEDULE\n   - Annual review process\n   - Triggers for off-cycle updates\n\nUse formal government document tone. Be specific to the jurisdiction and hazards provided. Include EMAP 4.1 compliance notes where relevant.`,
        (chunk) => setGenDoc((p) => p + chunk),
        'spr_generation'
      );
    } catch {
      setGenDoc('Error generating document.');
    }
    setGenLoad(false);
  };

  const downloadSpar = () => {
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 960 }}>
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
            Threat & Hazard Identification - Stakeholder Preparedness Review -
            EMAP 4.1 - {(thira.hazards || []).length} hazards
            {thira.lastUpdated
              ? `  -  Updated ${fmtDate(thira.lastUpdated)}`
              : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn
            label="- AI Analysis"
            onClick={() => {
              setTab('hazards');
              runAi();
            }}
            loading={aiLoad}
          />
          <Btn label="+ Add Hazard" onClick={() => setShowForm(true)} primary />
        </div>
      </div>
      <CoachBanner moduleId="thira" />

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
              border: `1px solid ${tab === t.id ? B.border : 'transparent'}`,
              borderBottom: `1px solid ${tab === t.id ? B.card : B.border}`,
              background: tab === t.id ? B.card : 'transparent',
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

      {/* -- HAZARD PROFILE TAB -- */}
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
            - THIRA/SPR directly satisfies <strong>EMAP 4.1</strong>. FEMA
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
                    placeholder="100-year Flood - Sacramento River"
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
                  <Label>Probability (1-5)</Label>
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
                  <Label>Magnitude (1-5)</Label>
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
                  placeholder="Historical context, data sources, frequency..."
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
                        {h.name.split('-').pop().trim()}
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
                                {h.type.split('-')[0].trim()}
                              </span>
                              {(h.caps || []).length > 0 && (
                                <span>
                                  {(h.caps || []).length} capabilities tagged
                                </span>
                              )}
                              {h.notes && (
                                <span style={{ color: B.teal }}>
                                  - has notes
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
                            -
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
                            -
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
                                placeholder="Historical events, frequency data, source documentation, vulnerability notes..."
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

      {/* -- IMPORT DOCUMENT TAB -- */}
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
            here - AI will read through it, extract every hazard, and
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
                  -
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: B.tealDark }}
                >
                  Reading document and extracting hazards...
                </div>
                <div style={{ fontSize: 12, color: B.faint }}>
                  This may take 15-30 seconds
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.35 }}>
                  -
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
                  PDF - Word - Images - Text files
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
                background: importResult.startsWith('ok')
                  ? B.greenLight
                  : B.redLight,
                border: `1px solid ${
                  importResult.startsWith('ok') ? B.greenBorder : B.redBorder
                }`,
                borderRadius: 9,
                fontSize: 13,
                color: importResult.startsWith('ok') ? '#065f46' : B.red,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>
                {importResult.startsWith('ok') ? 'ok' : '-'}
              </span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  {importResult}
                </div>
                {importResult.startsWith('ok') && (
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
                    - adjust probability and magnitude scores and tag the
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

      {/* -- GENERATE SPR DOCUMENT TAB -- */}
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
            profile data - including executive summary, risk assessment,
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
              - Add hazards to your profile first for a complete document. The
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
              onClick={generateSpar}
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
                ? '- Generating SPR Document...'
                : 'Generate THIRA/SPR Document'}
            </button>
            {genDoc && !genLoad && (
              <Btn label="- Download .txt" onClick={downloadSpar} />
            )}
            {genDoc && !genLoad && (
              <Btn label="Regenerate" onClick={generateSpar} />
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
                -
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: B.purple }}>
                  Writing your THIRA/SPR document...
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
                  {data.orgName || 'Your Organization'} - THIRA/SPR Document
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <Btn label="- Download .txt" onClick={downloadSpar} small />
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
                    } profiled  -  AI will build the complete document around your data`
                  : 'Add hazards to your profile first for the most complete and specific document'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   CAP DASHBOARD (Corrective Action Program)
------------------------------------------------------- */
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
    (data.incidents || []).forEach((inc) => {
      (inc.corrective || []).forEach((ca) => {
        all.push({
          id: 'inc-' + ca.id,
          item: ca.item,
          source: 'real_incident',
          sourceRef: inc.name,
          priority: 'high',
          responsible: '',
          due: ca.due || '',
          closed: ca.closed,
          emapRef: '4.12',
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 960 }}>
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
            EMAP 4.11.3 - {open} open -{' '}
            {overdue > 0 ? (
              <span style={{ color: B.red, fontWeight: 700 }}>
                {overdue} overdue -{' '}
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
            - Pulls from exercises + standalone items
          </p>
        </div>
        <Btn label="+ Add CAP Item" onClick={() => setShowForm(true)} primary />
      </div>
      <CoachBanner moduleId="cap" />
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
              placeholder="Describe the deficiency and corrective action required..."
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
                placeholder="Incident name, report #..."
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
              placeholder="Additional context..."
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
                    {ca.responsible && <span>- {ca.responsible}</span>}
                    {ca.due && (
                      <span
                        style={{
                          color: isOverdue ? B.red : B.faint,
                          fontWeight: isOverdue ? 700 : 400,
                        }}
                      >
                        {isOverdue ? '- Overdue: ' : 'Due: '}
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
                    -
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
        ok Corrective actions from all exercises are automatically pulled here.
        Standalone items can be added from real incidents, program assessments,
        or standards gaps. EMAP 4.11.3 requires a process that prioritizes and
        tracks resolution of all deficiencies.
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   ACTIVITY LOG
------------------------------------------------------- */
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
    created: '-',
    updated: '-',
    note: '-',
    deleted: '-',
    completed: 'ok',
  };
  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 760 }}>
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
          Audit trail of program activity - supports EMAP accreditation evidence
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <FInput
          value={note}
          onChange={setNote}
          placeholder="Add a manual program note, observation, or decision record..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') addNote();
          }}
        />
        <Btn label="Log Note" onClick={addNote} primary />
      </div>
      {log.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '36px', color: B.faint }}>
          No activity recorded yet - activity is logged automatically as you use
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
                  {typeIcon[entry.type] || ' - '}
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
                      {dateStr} - {timeStr}
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

/* -------------------------------------------------------
   SETTINGS
------------------------------------------------------- */
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
      'Emergency Management Program - EMAP Compliance Report',
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.5px',
          }}
        >
          My Program
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 4 }}>
          Organization profile, agency branding, and export configuration
        </p>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          padding: '4px',
          background: '#f0f3f4',
          borderRadius: 12,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '9px 18px',
              borderRadius: 9,
              border: 'none',
              background: activeTab === t.id ? '#fff' : 'transparent',
              color: activeTab === t.id ? B.text : B.faint,
              fontSize: 13,
              fontWeight: activeTab === t.id ? 700 : 500,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              transition: 'all 0.15s ease',
              boxShadow:
                activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* -- Organization -- */}
      {activeTab === 'org' && (
        <div>
          <Card style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: B.text,
                marginBottom: 16,
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
                  placeholder="e.g. County Emergency Management"
                />
              </div>
              <div>
                <Label>Jurisdiction Type</Label>
                <FSel
                  value={form.jurisdiction}
                  onChange={(v) => setForm((p) => ({ ...p, jurisdiction: v }))}
                >
                  <option value="">Select...</option>
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
                  <option value="">Select...</option>
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
                fontSize: 15,
                fontWeight: 700,
                color: B.text,
                marginBottom: 16,
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
                  placeholder="Full name"
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

      {/* -- Branding -- */}
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
              Recommended: PNG or SVG, transparent background, at least 200px
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
                      <div style={{ fontSize: 22, opacity: 0.3 }}>-</div>
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
                      <div style={{ fontSize: 22, opacity: 0.3 }}>-</div>
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
                      brand.accentColor === c ? '#111' : 'transparent'
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
                  placeholder="Emergency Management Program - EMAP Compliance Report"
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
                exported page - like a "Prepared using..." credit. Professional
                and unobtrusive.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* -- Export Preview -- */}
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
                padding: '28px clamp(24px,3vw,48px)',
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
                    -
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
                    'Emergency Management Program - EMAP Compliance Report'}
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
                    v: brand.preparedBy || form.emName || form.emTitle || '-',
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
                  EMAP Section 4.1 - Hazard Identification & Risk Assessment
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
                Standard rows and evidence documentation appear here...
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
                {brand.footerDisclaimer || `${previewOrg}  -  EMAP EMS 5-2022`}
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
            ok This preview reflects your current branding settings. Go to the{' '}
            <strong>Branding</strong> tab to change logos, colors, or text. Use
            the <strong>Print Report</strong> button in Reports to export with
            this branding applied.
          </div>
        </div>
      )}

      {/* -- System -- */}
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
              collaboration, and cloud backup connect to a Supabase backend -
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
                label="Export to Calendar (.ics)"
                onClick={() => downloadICal(data)}
              />
              <Btn
                label="Share Compliance Report"
                onClick={() => {
                  const url = buildShareURL(data);
                  navigator.clipboard.writeText(url).then(() => {
                    alert('Report link copied to clipboard!');
                  }).catch(() => {
                    prompt('Copy this link:', url);
                  });
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
            {/* Starter Packs */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${B.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: B.text, marginBottom: 10 }}>
                Starter Packs
              </div>
              <div style={{ fontSize: 12, color: B.faint, marginBottom: 12, lineHeight: 1.6 }}>
                Pre-built plans, exercises, and training for common EM program types. Data is added to your existing program.
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.values(STARTER_PACKS).map(pack => (
                  <button key={pack.id} onClick={() => {
                    if (window.confirm(`Add the "${pack.name}" starter pack? This adds ${pack.plans.length} plans, ${pack.exercises.length} exercises, and ${pack.training.length} training records to your program.`)) {
                      updateData(prev => applyStarterPack(prev, pack.id));
                    }
                  }} style={{
                    background: B.card, border: `1px solid ${B.border}`, borderRadius: 10,
                    padding: '14px 18px', cursor: 'pointer', textAlign: 'left', maxWidth: 280,
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = B.teal}
                    onMouseLeave={e => e.currentTarget.style.borderColor = B.border}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.text, marginBottom: 4 }}>{pack.name}</div>
                    <div style={{ fontSize: 11, color: B.faint, lineHeight: 1.5 }}>{pack.description}</div>
                    <div style={{ fontSize: 10, color: B.teal, marginTop: 8, fontWeight: 600 }}>
                      {pack.plans.length} plans · {pack.exercises.length} exercises · {pack.training.length} training
                    </div>
                  </button>
                ))}
              </div>
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
          label={saved ? 'ok Saved!' : 'Save All Settings'}
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

const DASHBOARD_WIDGETS = {
  compliance: { label: 'EMAP Compliance', default: true },
  alerts: { label: 'Alerts & Notifications', default: true },
  smartQueue: { label: 'Priority Queue', default: true },
  modules: { label: 'Module Summary Cards', default: true },
  readiness: { label: 'Program Readiness Checklist', default: false },
  accredTimeline: { label: 'Time to Accreditation', default: false },
  nims: { label: 'FEMA/NIMS Alignment', default: false },
  grantAlignment: { label: 'Grant-EMAP Alignment', default: false },
};

function Dashboard({ data, setView, orgName, updateData }) {
  const widgets = data.dashboardWidgets || Object.fromEntries(Object.entries(DASHBOARD_WIDGETS).map(([k, v]) => [k, v.default]));
  const showWidget = (id) => widgets[id] !== false;
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
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

  // ===== NEXT UP SMART QUEUE =====
  const smartQueue = useMemo(() => {
    const items = [];
    // Expiring MOUs
    (data.partners || []).forEach((p) => {
      const d = daysUntil(p.expires);
      if (d !== null && d >= 0 && d < 90)
        items.push({
          label: `Renew MOU: ${p.name}`,
          detail: `Expires ${fmtDate(p.expires)} (${d} days)`,
          urgency: d < 30 ? 3 : 2,
          emap: '4.7.4',
          module: 'partners',
          color: d < 30 ? B.red : B.amber,
        });
    });
    // Expired MOUs
    (data.partners || []).forEach((p) => {
      const d = daysUntil(p.expires);
      if (d !== null && d < 0)
        items.push({
          label: `EXPIRED: ${p.name} MOU`,
          detail: `Expired ${fmtDate(p.expires)}`,
          urgency: 4,
          emap: '4.7.4',
          module: 'partners',
          color: B.red,
        });
    });
    // Overdue plan reviews
    (data.plans || []).forEach((p) => {
      const d = daysUntil(p.nextReview);
      if (d !== null && d < 0)
        items.push({
          label: `Overdue Review: ${p.name}`,
          detail: `Was due ${fmtDate(p.nextReview)}`,
          urgency: 3,
          emap: p.emapRef || '4.5',
          module: 'plans',
          color: B.red,
        });
      else if (d !== null && d < 60)
        items.push({
          label: `Review Due: ${p.name}`,
          detail: `Due ${fmtDate(p.nextReview)} (${d} days)`,
          urgency: 2,
          emap: p.emapRef || '4.5',
          module: 'plans',
          color: B.amber,
        });
    });
    // Open corrective actions
    (data.capItems || [])
      .filter((c) => !c.closed)
      .forEach((c) =>
        items.push({
          label: `Open CA: ${c.finding || 'Corrective Action'}`,
          detail: c.source || 'Needs resolution',
          urgency: 2,
          emap: '4.11.3',
          module: 'cap',
          color: B.amber,
        })
      );
    // Credential expirations
    (data.employees || []).forEach((emp) =>
      (emp.credentials || []).forEach((c) => {
        const d = daysUntil(c.expires);
        if (d !== null && d >= 0 && d < 60)
          items.push({
            label: `${emp.name}: ${c.name || c.type} expiring`,
            detail: `Expires ${fmtDate(c.expires)} (${d} days)`,
            urgency: d < 14 ? 3 : 2,
            emap: '4.10.4',
            module: 'employees',
            color: d < 14 ? B.red : B.amber,
          });
      })
    );
    // Exercise needed (no exercise in past year)
    const hasRecentEx = exercises.some(
      (e) => e.date && daysUntil(e.date) > -365 && e.status !== 'planned'
    );
    if (!hasRecentEx)
      items.push({
        label: 'Schedule Annual Exercise',
        detail: 'No completed exercise in the past 12 months',
        urgency: 2,
        emap: '4.11.1',
        module: 'exercises',
        color: B.amber,
      });
    // AAR needed
    const needsAAR = exercises.filter(
      (e) => e.status === 'completed' && !e.aarFinal
    );
    needsAAR.forEach((e) =>
      items.push({
        label: `Complete AAR: ${e.name}`,
        detail: 'Exercise completed but no final AAR',
        urgency: 2,
        emap: '4.11.2',
        module: 'exercises',
        color: B.amber,
      })
    );
    // Grant deadlines
    activeGrants.forEach((g) => {
      const d = daysUntil(g.endDate);
      if (d !== null && d >= 0 && d < 90)
        items.push({
          label: `Grant Closeout: ${g.name}`,
          detail: `Period ends ${fmtDate(g.endDate)} (${d} days)`,
          urgency: d < 30 ? 3 : 2,
          emap: '3.4',
          module: 'grants',
          color: d < 30 ? B.red : B.amber,
        });
    });
    // Missing critical plans
    if (!plans.some((p) => p.type === 'EOP'))
      items.push({
        label: 'Create Emergency Operations Plan',
        detail: 'EOP required for EMAP 4.5 compliance',
        urgency: 1,
        emap: '4.5.1',
        module: 'plans',
        color: B.blue,
      });
    if (!plans.some((p) => p.type === 'COOP'))
      items.push({
        label: 'Create COOP Plan',
        detail: 'Continuity plan required for EMAP 4.4',
        urgency: 1,
        emap: '4.4.2',
        module: 'plans',
        color: B.blue,
      });
    // THIRA needed
    if (hazardCount < 3)
      items.push({
        label: 'Build THIRA Hazard Profile',
        detail: `Only ${hazardCount} hazard(s) profiled - need 3+ for robust assessment`,
        urgency: 1,
        emap: '4.1.1',
        module: 'thira',
        color: B.blue,
      });
    return items.sort((a, b) => b.urgency - a.urgency);
  }, [data]);

  // ===== TIME TO ACCREDITATION ESTIMATOR =====
  const accredEstimate = useMemo(() => {
    const stds = data.standards || {};
    const entries = Object.values(stds).filter((s) => s.updatedAt);
    if (entries.length < 3)
      return { months: null, msg: 'Need more progress data to estimate' };
    const sorted = entries.sort((a, b) => a.updatedAt - b.updatedAt);
    const first = sorted[0].updatedAt;
    const last = sorted[sorted.length - 1].updatedAt;
    const daySpan = Math.max(1, (last - first) / 86400000);
    const compliant = Object.values(stds).filter(
      (s) => s.status === 'compliant'
    ).length;
    const remaining = 73 - compliant;
    if (remaining <= 0)
      return {
        months: 0,
        msg: 'All standards compliant - ready for assessment',
      };
    const rate = compliant / daySpan; // standards per day
    if (rate <= 0)
      return {
        months: null,
        msg: 'Mark standards compliant to build projection',
      };
    const daysNeeded = remaining / rate;
    const months = Math.ceil(daysNeeded / 30);
    return {
      months,
      msg: `~${months} month${months !== 1 ? 's' : ''} at current pace`,
      rate: Math.round(rate * 30 * 10) / 10,
    };
  }, [data.standards]);

  // ===== FEMA/NIMS ALIGNMENT =====
  const nimsStats = useMemo(() => {
    const stds = data.standards || {};
    const total = NIMS_STANDARDS.length;
    const compliant = NIMS_STANDARDS.filter(
      (id) => (stds[id] || {}).status === 'compliant'
    ).length;
    const inProgress = NIMS_STANDARDS.filter(
      (id) => (stds[id] || {}).status === 'in_progress'
    ).length;
    return {
      total,
      compliant,
      inProgress,
      pct: Math.round((compliant / total) * 100),
    };
  }, [data.standards]);

  // ===== GRANT-EMAP ALIGNMENT =====
  const grantAlignments = useMemo(() => {
    return activeGrants.map((g) => {
      const refs = GRANT_EMAP_MAP[g.type] || [];
      const stds = data.standards || {};
      const gaps = refs.filter((id) => (stds[id] || {}).status !== 'compliant');
      return {
        ...g,
        emapRefs: refs,
        gaps,
        gapCount: gaps.length,
        atRisk: gaps.length > refs.length * 0.5,
      };
    });
  }, [data.grants, data.standards]);

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
      icon: '-',
    },
    {
      id: 'exercises',
      label: 'Exercises',
      count: exercises.length,
      sub: `${exercises.filter((e) => e.aarFinal).length} with final AAR`,
      color: B.purple,
      bg: B.purpleLight,
      icon: '-',
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
      icon: '-',
    },
    {
      id: 'employees',
      label: 'Personnel',
      count: empCount,
      sub:
        credExpiring > 0
          ? `- ${credExpiring} creds expiring`
          : 'credentials current',
      color: B.indigo,
      bg: B.indigoLight,
      icon: '-',
    },
    {
      id: 'cap',
      label: 'Open CAs',
      count: openCAs,
      sub: openCAs === 0 ? 'all corrective actions closed' : 'need resolution',
      color: openCAs > 0 ? B.red : B.green,
      bg: openCAs > 0 ? B.redLight : B.greenLight,
      icon: '-',
    },
  ];

  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1120 }}>
      <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: B.text, letterSpacing: '-0.4px' }}>
            {orgName || 'Your Program'}
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP EMS 5-2022 {data.jurisdiction ? `· ${data.jurisdiction}` : ''} {data.state ? `· ${data.state}` : ''}
          </p>
        </div>
        <button onClick={() => setShowWidgetSettings(p => !p)} style={{
          background: 'none', border: `1px solid ${B.border}`, borderRadius: 8,
          padding: '6px 12px', cursor: 'pointer', fontSize: 11, color: B.faint,
          fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 5,
        }}>
          ◧ Customize
        </button>
      </div>
      {showWidgetSettings && (
        <Card style={{ marginBottom: 16, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: B.text, marginBottom: 12 }}>Dashboard Widgets</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {Object.entries(DASHBOARD_WIDGETS).map(([id, w]) => (
              <label key={id} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: B.muted,
                cursor: 'pointer', padding: '6px 8px', borderRadius: 6,
                background: showWidget(id) ? B.tealLight : '#f8f9fa',
                border: `1px solid ${showWidget(id) ? B.tealBorder : B.border}`,
              }}>
                <input type="checkbox" checked={showWidget(id)} onChange={() => {
                  updateData({ dashboardWidgets: { ...widgets, [id]: !showWidget(id) } });
                }} style={{ accentColor: B.teal }} />
                {w.label}
              </label>
            ))}
          </div>
        </Card>
      )}

      {(plans || []).length === 0 && (exercises || []).length === 0 && updateData && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(27,201,196,0.06), rgba(194,150,74,0.06))',
          border: `1px solid ${B.border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: B.text, marginBottom: 4 }}>
            Quick Start — Load a Starter Pack
          </div>
          <div style={{ fontSize: 13, color: B.faint, marginBottom: 16, lineHeight: 1.6 }}>
            Get up and running fast with pre-built plans, exercises, and training tailored to your agency type. Everything is customizable.
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.values(STARTER_PACKS).map(pack => (
              <button key={pack.id} onClick={() => {
                if (window.confirm(`Load "${pack.name}"?\n\nThis adds ${pack.plans.length} plans with templates, ${pack.exercises.length} exercises, and ${pack.training.length} training records.`)) {
                  updateData(prev => applyStarterPack(prev, pack.id));
                }
              }} style={{
                background: B.card, border: `1px solid ${B.border}`, borderRadius: 10,
                padding: '16px 20px', cursor: 'pointer', textAlign: 'left', flex: '1 1 240px',
                transition: 'all 0.15s', minWidth: 240,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = B.teal; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 22, marginBottom: 8 }}>{pack.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: B.text, marginBottom: 4 }}>{pack.name}</div>
                <div style={{ fontSize: 12, color: B.faint, lineHeight: 1.5, marginBottom: 10 }}>{pack.description}</div>
                <div style={{ fontSize: 11, color: B.teal, fontWeight: 600 }}>
                  {pack.plans.length} plans · {pack.exercises.length} exercises · {pack.training.length} training
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {(showWidget('compliance') || showWidget('alerts') || showWidget('readiness')) && <div
        style={{
          display: 'grid',
          gridTemplateColumns: showWidget('compliance') && showWidget('readiness') ? '200px 1fr 280px' : showWidget('compliance') ? '200px 1fr' : '1fr',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {showWidget('compliance') && <Card
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

        }
        {showWidget('alerts') && <div>
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
                ok
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
                - {notifications.length} item
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

        }
        {showWidget('readiness') && <Card
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
                  (e.currentTarget.style.background = 'transparent')
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
                  {c.done ? 'ok' : ''}
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
            {checkDone}/{checklist.length} items complete - click any to jump
            there
          </div>
        </Card>}
      </div>}

      {/* Next Up Smart Queue + Time-to-Accreditation + FEMA/NIMS Badge */}
      {(showWidget('smartQueue') || showWidget('accredTimeline') || showWidget('nims')) && <div
        style={{
          display: 'grid',
          gridTemplateColumns: showWidget('accredTimeline') && showWidget('nims') ? '1fr 280px 220px' : showWidget('accredTimeline') || showWidget('nims') ? '1fr 280px' : '1fr',
          gap: 14,
          marginBottom: 16,
        }}
      >
        {showWidget('smartQueue') && <Card style={{ padding: '16px 18px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: B.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Next Up - Your Priority Queue
            </div>
            <Tag
              label={`${smartQueue.length} items`}
              color={
                smartQueue.length > 5
                  ? B.red
                  : smartQueue.length > 0
                  ? B.amber
                  : B.green
              }
              bg={
                smartQueue.length > 5
                  ? B.redLight
                  : smartQueue.length > 0
                  ? B.amberLight
                  : B.greenLight
              }
              border={
                smartQueue.length > 5
                  ? B.redBorder
                  : smartQueue.length > 0
                  ? B.amberBorder
                  : B.greenBorder
              }
            />
          </div>
          {smartQueue.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 0',
                color: B.faint,
                fontSize: 13,
              }}
            >
              All clear - no urgent items. Keep up the great work.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {smartQueue.slice(0, 8).map((item, i) => (
                <div
                  key={i}
                  onClick={() => setView(item.module)}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    padding: '8px 10px',
                    background:
                      i === 0 ? 'rgba(239,68,68,0.04)' : 'transparent',
                    border: `1px solid ${
                      i === 0 ? B.redBorder : 'transparent'
                    }`,
                    borderRadius: 7,
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = B.tealLight)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      i === 0 ? 'rgba(239,68,68,0.04)' : 'transparent')
                  }
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: B.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 10, color: B.faint }}>
                      {item.detail}
                    </div>
                  </div>
                  {item.emap && (
                    <Tag
                      label={`EMAP ${item.emap}`}
                      color={B.tealDark}
                      bg={B.tealLight}
                      border={B.tealBorder}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>}

        {showWidget('accredTimeline') && <Card
          style={{
            background: `linear-gradient(135deg,${B.sidebar}f8,${B.sidebar})`,
            borderColor: B.sidebarBorder,
            padding: '16px 18px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            Time to Accreditation
          </div>
          {accredEstimate.months !== null ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color:
                    accredEstimate.months === 0
                      ? B.green
                      : accredEstimate.months < 12
                      ? B.teal
                      : B.amber,
                  lineHeight: 1,
                  marginBottom: 4,
                  fontFamily: "'Syne','DM Sans',sans-serif",
                }}
              >
                {accredEstimate.months === 0 ? 'Ready' : accredEstimate.months}
              </div>
              {accredEstimate.months > 0 && (
                <div
                  style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}
                >
                  month{accredEstimate.months !== 1 ? 's' : ''} estimated
                </div>
              )}
              {accredEstimate.months === 0 && (
                <div style={{ fontSize: 11, color: B.green, marginBottom: 8 }}>
                  for assessment
                </div>
              )}
              <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>
                {accredEstimate.rate && (
                  <div>{accredEstimate.rate} standards/mo pace</div>
                )}
                <div>{overall.compliant} of 73 compliant</div>
                <div>{73 - overall.compliant} remaining</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                {accredEstimate.msg}
              </div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 8 }}>
                Start marking standards compliant to build your projection
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: 12,
              padding: '8px 10px',
              background: 'rgba(27,201,196,0.08)',
              borderRadius: 6,
              border: '1px solid rgba(27,201,196,0.15)',
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: B.teal,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 3,
              }}
            >
              For Your Budget Presentation
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
              EMAP assessment fees: ~$5,000-$15,000. Subscription + assessment
              investment pays for itself through grant eligibility and program
              credibility.
            </div>
          </div>
        </Card>}

        {showWidget('nims') &&
        <Card
          style={{
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
            FEMA / NIMS Alignment
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <svg width={80} height={80} viewBox="0 0 80 80">
                <circle
                  cx={40}
                  cy={40}
                  r={32}
                  fill="none"
                  stroke="#edf2f4"
                  strokeWidth={6}
                />
                <circle
                  cx={40}
                  cy={40}
                  r={32}
                  fill="none"
                  stroke={
                    nimsStats.pct > 79
                      ? B.green
                      : nimsStats.pct > 49
                      ? B.blue
                      : B.amber
                  }
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={`${
                    (nimsStats.pct / 100) * 2 * Math.PI * 32
                  } ${(1 - nimsStats.pct / 100) * 2 * Math.PI * 32}`}
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <text
                  x={40}
                  y={43}
                  textAnchor="middle"
                  fill={B.text}
                  fontSize={16}
                  fontWeight="800"
                  fontFamily="'DM Sans',sans-serif"
                >
                  {nimsStats.pct}%
                </text>
              </svg>
            </div>
            <div
              style={{
                fontSize: 11,
                color: B.faint,
                textAlign: 'center',
                marginBottom: 6,
              }}
            >
              {nimsStats.compliant}/{nimsStats.total} NIMS standards
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 10 }}>
              <span style={{ color: B.green }}>{nimsStats.compliant} ok</span>
              <span style={{ color: B.amber }}>{nimsStats.inProgress} wip</span>
              <span style={{ color: B.faint }}>
                {nimsStats.total - nimsStats.compliant - nimsStats.inProgress}{' '}
                todo
              </span>
            </div>
          </div>
          <div
            style={{
              fontSize: 9,
              color: B.faint,
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            ICS/NIMS (4.6) + Training (4.10) + Comms (4.8)
          </div>
        </Card>}
      </div>}

      {/* Grant-EMAP Alignment */}
      {showWidget('grantAlignment') && grantAlignments.length > 0 && (
        <Card style={{ marginBottom: 16, padding: '16px 18px' }}>
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
            Grant - EMAP Alignment Tracker
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(
                grantAlignments.length,
                4
              )},1fr)`,
              gap: 10,
            }}
          >
            {grantAlignments.map((g) => (
              <div
                key={g.id}
                onClick={() => setView('grants')}
                style={{
                  padding: '12px',
                  background: g.atRisk ? B.redLight : B.greenLight,
                  border: `1px solid ${g.atRisk ? B.redBorder : B.greenBorder}`,
                  borderRadius: 8,
                  cursor: 'pointer',
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
                  <span
                    style={{ fontSize: 12, fontWeight: 700, color: B.text }}
                  >
                    {g.name || g.type}
                  </span>
                  {g.atRisk && (
                    <Tag
                      label="At Risk"
                      color={B.red}
                      bg={B.redLight}
                      border={B.redBorder}
                    />
                  )}
                </div>
                <div style={{ fontSize: 11, color: B.faint, marginBottom: 4 }}>
                  {g.type} - ${parseFloat(g.amount || 0).toLocaleString()}
                </div>
                {g.emapRefs.length > 0 ? (
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: g.gapCount > 0 ? B.amber : B.green,
                        fontWeight: 600,
                      }}
                    >
                      {g.emapRefs.length - g.gapCount}/{g.emapRefs.length}{' '}
                      aligned EMAP standards compliant
                    </div>
                    {g.gapCount > 0 && (
                      <div style={{ fontSize: 10, color: B.red, marginTop: 2 }}>
                        Gaps: {g.gaps.slice(0, 4).join(', ')}
                        {g.gaps.length > 4 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: B.faint }}>
                    No direct EMAP mapping for this grant type
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Module cards */}
      {showWidget('modules') && <div
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
      </div>}

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
              No activity yet - start using PLANRR to see your activity here
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
/* -------------------------------------------------------
   BULK DOCUMENT INTAKE
------------------------------------------------------- */
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
        const stdRef = ALL_SECTIONS.map(sec =>
          `${sec.id} ${sec.title}: ${sec.standards.map(s => `${s.id} - ${s.text.slice(0, 80)}`).join('; ')}`
        ).join('\n');
        const prompt = `Analyze this document and map it to the CORRECT EMAP EMS 5-2022 standards.\nDocument: "${file.name}"\n\nEMAP STANDARD REFERENCE (use these EXACT IDs):\n${stdRef}\n\nIMPORTANT: Match based on document content to the standard descriptions above. For example:\n- MOUs/agreements → 4.7.x (Mutual Aid)\n- Training records → 4.10.x (Training & Education)\n- Exercise AARs → 4.11.x (Exercises, Evaluations & Corrective Actions)\n- EOPs → 4.5.x (Operational Planning)\n- COOPs → 4.4.x (Continuity Planning)\n- Budget/funding docs → 3.4.x (Administration & Finance)\n- Hazard analysis → 4.1.x (Hazard ID & Risk Assessment)\n\nReturn ONLY valid JSON:\n{"docType":"brief description","mappings":[{"stdId":"4.7.1","confidence":85,"status":"in_progress","reason":"One sentence explanation"}]}`;
        const isLargePdf = fd.type === 'pdf' && fd.data.length > 500000;
        if (fd.type === 'pdf' && !isLargePdf) {
          content.push({
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: fd.data,
            },
          });
          content.push({ type: 'text', text: prompt });
        } else if (fd.type === 'pdf' && isLargePdf) {
          try {
            const { extractTextFromPdf } = await import('./services/pdfExtract');
            const extracted = await extractTextFromPdf(file);
            content.push({
              type: 'text',
              text: `Document "${file.name}" (${extracted.totalPages} pages${extracted.truncated ? ', truncated' : ''}):\n${extracted.text}\n\n${prompt}`,
            });
          } catch {
            content.push({
              type: 'text',
              text: `[PDF "${file.name}" - could not extract text, analyzing by filename]\n\n${prompt}`,
            });
          }
        } else if (fd.type === 'image') {
          content.push({
            type: 'image',
            source: { type: 'base64', media_type: fd.mimeType, data: fd.data },
          });
          content.push({ type: 'text', text: prompt });
        } else {
          content.push({
            type: 'text',
            text: `Document "${file.name}":\n${fd.data.slice(0, 15000)}\n\n${prompt}`,
          });
        }
        const res = await fetch(
          SB_URL + '/functions/v1/ai-proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SB_KEY },
            body: JSON.stringify({
              operation: 'bulk_intake',
              model_tier: 'strong',
              stream: false,
              system: 'You are an EMAP EMS 5-2022 document analyst for PLANRR. Analyze documents and map them to relevant EMAP standards. Return ONLY a valid JSON object with no markdown, no code fences, no explanation. Format: {"docType":"description","mappings":[{"stdId":"4.5.1","confidence":85,"status":"in_progress","reason":"explanation"}]}',
              content,
              max_tokens: 4000,
            }),
          }
        );
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(errBody || `API error (${res.status})`);
        }
        const rawText = await res.text();
        let json;
        try { json = JSON.parse(rawText); } catch {
          throw new Error('Invalid response from AI: ' + rawText.slice(0, 100));
        }
        const aiText = json.content?.[0]?.text || '{}';
        const cleaned = aiText.replace(/```json\s?|```/g, '').trim();
        let parsed;
        try { parsed = JSON.parse(cleaned); } catch {
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { docType: 'Document', mappings: [] };
        }
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1040 }}>
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
          Drop your existing EM documents - AI reads each one and automatically
          maps it to EMAP standards, updating compliance status across your
          program.
        </p>
      </div>
      <CoachBanner moduleId="intake" />
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
              -
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
              PDF - Word - Text - Images - Max 20MB per file
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
                        ? '-'
                        : f.name.match(/\.(jpg|jpeg|png)$/)
                        ? '--'
                        : '-'}
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
                      -
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
                -
              </span>
              <span
                style={{ fontSize: 13, fontWeight: 700, color: B.tealDark }}
              >
                {currentFile
                  ? `Analyzing "${currentFile.name}" (${
                      currentFile.index + 1
                    }/${currentFile.total})...`
                  : 'Processing...'}
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
                  ? '-'
                  : r.status === 'done'
                  ? 'ok'
                  : 'x'}
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
                  ? 'Analyzing...'
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
              ok
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
                Intake complete - {stdsMapped.length} standards updated
              </div>
              <div style={{ fontSize: 12, color: '#065f46' }}>
                {results.filter((r) => r.status === 'done').length}/
                {results.length} documents analyzed - {totalMappings} total
                mappings - Evidence attached and compliance status updated
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
                    ? '-'
                    : r.name.match(/\.(jpg|jpeg|png)$/)
                    ? '--'
                    : '-'}
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
          MOUs, communications plan, resource inventory, org charts, policies -
          any document that demonstrates EMAP compliance. The AI reads each one
          and maps it to the right standards automatically.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   GLOBAL SEARCH
------------------------------------------------------- */
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
          label: `${s.id} - ${s.section.title}`,
          sub: s.text.slice(0, 80) + '...',
          status: rec.status,
          module: 'accreditation',
          icon: '-',
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
          sub: `${t.type}  -  ${fmtDate(t.date)}`,
          module: 'training',
          icon: '-',
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
          sub: `${e.type}  -  ${fmtDate(e.date)}`,
          module: 'exercises',
          icon: '-',
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
          sub: `${p.agreementType}  -  ${p.type}`,
          module: 'partners',
          icon: '-',
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
          icon: '-',
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
          sub: `${e.title || ''}  -  ${e.department || ''}`,
          module: 'employees',
          icon: '-',
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
            g.amount ? `  -  $${parseFloat(g.amount).toLocaleString()}` : ''
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
          sub: `${r.category}  -  ${r.location || ''}`,
          module: 'resources',
          icon: '-',
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
          sub: `Risk ${h.probability * h.magnitude}/25  -  ${h.type
            .split('-')[0]
            .trim()}`,
          module: 'thira',
          icon: '-',
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
              placeholder="Search standards, exercises, personnel, grants, plans..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: B.text,
                background: 'transparent',
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
                -
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
                      <span style={{ fontSize: 11, color: B.border }}>-</span>
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

/* -------------------------------------------------------
   ACCREDITATION PACKAGE BUILDER
------------------------------------------------------- */
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
        ? `${eop.name} v${eop.version} - current`
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
      detail: coop ? `${coop.name} - current` : 'No COOP on file',
      fix: 'plans',
    });
    const hmp = data.plans?.find((p) => p.type === 'Hazard Mitigation Plan');
    c.push({
      id: 'hmp',
      label: 'Hazard Mitigation Plan',
      status: hmp ? 'pass' : 'warn',
      detail: hmp ? `${hmp.name} - on file` : 'No Hazard Mitigation Plan',
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
            } - 3+ recommended`
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
          ? 'Exercises on file - finalize AARs'
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
          ? `${tc} record${tc > 1 ? 's' : ''} - add more`
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
        am >= 3 ? `${am} active agreements` : `${am} active - 3+ recommended`,
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
          : `${oc} open - address before submission`,
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
      icon: 'ok',
      color: B.green,
      bg: B.greenLight,
      border: B.greenBorder,
    },
    warn: {
      icon: '-',
      color: B.amber,
      bg: B.amberLight,
      border: B.amberBorder,
    },
    fail: { icon: 'x', color: B.red, bg: B.redLight, border: B.redBorder },
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
        }  -  State: ${data.state || 'Unknown'}  -  Jurisdiction: ${
          data.jurisdiction || 'Unknown'
        }\nPrimary EM: ${data.emName || 'Unknown'}  -  ${
          data.emTitle || ''
        }\nEMAP: ${overall.compliant}/${
          overall.total
        } standards  -  ${compliantSections}/17 sections\nTraining: ${
          data.training?.length || 0
        }  -  Exercises: ${data.exercises?.length || 0} (${
          data.exercises?.filter((e) => e.aarFinal)?.length || 0
        } with final AAR)\nPartners: ${data.partners?.length || 0}  -  Plans: ${
          data.plans?.length || 0
        }  -  Personnel: ${(data.employees || []).length}\nGrants: ${
          (data.grants || []).filter((g) => g.status === 'active').length
        } active  -  Hazards: ${
          (data.thira?.hazards || []).length
        } profiled\nItems being addressed: ${
          issues || 'none'
        }\nUse formal government document tone. Be specific about strengths and honest about items being addressed.`,
        (chunk) => setAiExec((p) => p + chunk),
        'exec_summary'
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1020 }}>
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
          Step-by-step assembly of your EMAP submission - readiness check,
          compliance summary, executive summary, and final review.
        </p>
      </div>
      <CoachBanner moduleId="package" />
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
                step === i ? accent : step > i ? `${accent}18` : 'transparent',
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
              {step > i ? 'ok' : i + 1}
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
                      Fix -
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
            <Btn label="Continue -" onClick={() => setStep(1)} primary />
            {readyToSubmit ? (
              <span style={{ fontSize: 12, color: B.green, fontWeight: 600 }}>
                ok Program meets minimum EMAP submission threshold
              </span>
            ) : (
              <span style={{ fontSize: 12, color: B.amber }}>
                - {failCount} critical item{failCount !== 1 ? 's' : ''} should
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
                  EMAP EMS 5-2022 -{' '}
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
            <Btn label="- Back" onClick={() => setStep(0)} />
            <Btn label="Continue -" onClick={() => setStep(2)} primary />
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
                label={aiLoad ? '- Writing...' : 'Generate Executive Summary'}
                onClick={genExec}
                loading={aiLoad}
                primary
                small
              />
            </div>
            <div style={{ fontSize: 12, color: B.tealDark }}>
              Writes a professional 3-paragraph narrative using your live
              program data - ready for submission or board presentation.
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
                Executive Summary - {data.orgName || 'Your Organization'}
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
                  - Download .txt
                </button>
                <Btn label="Regenerate" onClick={genExec} small />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="- Back" onClick={() => setStep(1)} />
            <Btn label="Continue -" onClick={() => setStep(3)} primary />
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
              {readyToSubmit ? 'ok' : '-'}
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
                  ? `${overall.pct}% compliant  -  ${passCount}/${checks.length} checks passing  -  All critical items resolved`
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
                icon: '-',
                label: 'EMAP Standards',
                val: `${overall.compliant}/${overall.total} (${overall.pct}%)`,
                ok: overall.pct >= 50,
                mod: 'accreditation',
              },
              {
                icon: '-',
                label: 'Exercise AARs',
                val: `${
                  data.exercises?.filter((e) => e.aarFinal)?.length || 0
                } final AARs`,
                ok:
                  (data.exercises?.filter((e) => e.aarFinal)?.length || 0) >= 1,
                mod: 'exercises',
              },
              {
                icon: '-',
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
                icon: '-',
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
                icon: '-',
                label: 'Training Records',
                val: `${data.training?.length || 0} records`,
                ok: (data.training?.length || 0) >= 5,
                mod: 'training',
              },
              {
                icon: '-',
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
                    {item.ok ? 'ok' : '-'}
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
            <Btn label="- Back" onClick={() => setStep(2)} />
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
              - Print Full Package
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

/* -------------------------------------------------------
   ACCREDITATION JOURNEY - 6-step EMAP process tracker
------------------------------------------------------- */
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
        'Training cost varies - contact EMAP',
        'Access to Assessment Platform (PowerDMS)',
      ],
      checks: [
        { label: 'EMAP subscription active', key: 'subscribed' },
        { label: 'Accreditation Manager designated', key: 'amDesignated' },
        { label: 'Standard Training completed', key: 'trainingComplete' },
      ],
      color: B.blue,
      tip: 'Start here. Training should happen as early as possible - ideally within 30 days of subscribing.',
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
        label: `${overall.compliant}/73 standards documented  -  ${docsWithRationale}/${totalDocs} rationales written`,
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
      tip: "Don't wait until you're at 100% to apply. Apply when you're at ~80% compliant - you'll complete the rest during the application period with EMAP support.",
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
      tip: 'The assessors get access to your documents 3 weeks before arrival - their preliminary review happens before they even land.',
    },
    {
      n: 5,
      label: 'Committee Review & Commission Decision',
      desc: 'Program Review Committee reviews the Preliminary Assessment Report. EMAP Commission votes: Accredited, Conditionally Accredited, or Denied.',
      details: [
        'Program representative strongly encouraged to attend',
        'Commission outcomes: Accredited / Conditional / Denied',
        'Conditional: up to 9 months to resolve gaps',
        '-5 non-compliant: virtual conditional assessment',
        '-6 non-compliant: on-site conditional assessment',
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
      tip: "Attend the PRC meeting - you can respond to questions and clarify findings. After the meeting you're excused while they vote.",
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
      tip: 'Set a calendar reminder 18 months before expiry - consecutive accreditation applications are due 12 months before, and late applications lose technical assistance.',
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
        accred: '$4,500-$7,500',
        app: '$9,000',
        total: '$13,500-$16,500+travel',
      };
    if (j.includes('Municipal') || j.includes('County') || j.includes('Parish'))
      return {
        accred: '$2,000-$4,500',
        app: '$9,000',
        total: '$11,000-$13,500+travel',
      };
    return {
      accred: '$2,000-$7,500',
      app: '$9,000',
      total: '$11,000-$16,500+travel',
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
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1040 }}>
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
          EMAP 6-step accreditation process - track your progress - key
          deadlines and fees
        </p>
      </div>
      <CoachBanner moduleId="journey" />

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
            ok {stepStatus.filter((s) => s === 'complete').length} complete
          </span>
          <span style={{ color: B.teal, fontWeight: 600 }}>
            - {stepStatus.filter((s) => s === 'active').length} in progress
          </span>
          <span style={{ color: B.faint }}>
            o {stepStatus.filter((s) => s === 'pending').length} upcoming
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
                  {sc === 'complete' ? 'ok' : step.n}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: B.text }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 11, color: B.faint, marginTop: 1 }}>
                    {step.desc.slice(0, 80)}...
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
                  -
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
                              {' '}
                              -{' '}
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
                          - Tip
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
                            Open EMAP Standards -
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
                        - Consider Tiered Accreditation first
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
                        often start with the Tiered Accreditation pathway -
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
                        View Tiered Pathway in Package Builder -
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
            { l: 'Travel (estimate)', v: '$3,000-$8,000' },
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

/* -------------------------------------------------------
   ONBOARDING
------------------------------------------------------- */

/* -------------------------------------------------------
   LANDING PAGE - home screen at planrr.app
   Matches marketing one-pager theme exactly
------------------------------------------------------- */

/* -------------------------------------------------------
   DOCUMENT TEMPLATES LIBRARY (AI Pre-fill)
------------------------------------------------------- */
const DOC_TEMPLATES = [
  {
    id: 'strategic_plan',
    name: 'Multi-Year Strategic Plan',
    emap: '3.1.1',
    desc: 'Vision, mission, goals, objectives, milestones, and evaluation process. Required for EMAP 3.1.1.',
    sections: [
      'Executive Summary',
      'Vision Statement',
      'Mission Statement',
      'Goals & Objectives',
      'Implementation Timeline',
      'Stakeholder Input Process',
      'Evaluation & Revision Schedule',
    ],
  },
  {
    id: 'coop',
    name: 'Continuity of Operations Plan (COOP)',
    emap: '4.4.2',
    desc: 'Ensures continued operations during disruptions. Addresses essential functions, succession, alternate facilities.',
    sections: [
      'Purpose & Scope',
      'Authority',
      'Essential Functions',
      'Orders of Succession',
      'Delegation of Authority',
      'Alternate Facilities',
      'Vital Records',
      'Communications',
      'Reconstitution',
    ],
  },
  {
    id: 'resource_mgmt',
    name: 'Resource Management Plan',
    emap: '4.7.1',
    desc: 'Goals/objectives, gap analysis, resource systems, donations and volunteer management.',
    sections: [
      'Purpose & Scope',
      'Goals & Objectives',
      'Resource Gap Analysis',
      'Resource Management Systems',
      'Mutual Aid Agreements',
      'Donations Management',
      'Volunteer Management',
      'Maintenance Schedule',
    ],
  },
  {
    id: 'comms_plan',
    name: 'Communications Plan',
    emap: '4.8.1',
    desc: 'Internal/external communications, alert/notification, public warning including vulnerable populations.',
    sections: [
      'Purpose & Scope',
      'Internal Communications',
      'External Communications',
      'Alert & Notification Procedures',
      'Public Warning Systems',
      'Vulnerable Population Outreach',
      'Interoperability',
      'Testing Schedule',
    ],
  },
  {
    id: 'training_plan',
    name: 'Training Plan',
    emap: '4.10.1',
    desc: 'Training needs assessment, curriculum, evaluations, records retention, and scheduling.',
    sections: [
      'Purpose & Scope',
      'Training Needs Assessment',
      'Training Goals & Objectives',
      'Curriculum & Course Catalog',
      'Scheduling',
      'Personnel Requirements',
      'Course Evaluations',
      'Records & Retention',
      'Maintenance Process',
    ],
  },
  {
    id: 'exercise_plan',
    name: 'Exercise Plan',
    emap: '4.11.1',
    desc: 'Multi-year exercise, evaluation, and corrective action plan based on identified hazards.',
    sections: [
      'Purpose & Scope',
      'Exercise Goals & Objectives',
      'Multi-Year Schedule',
      'Exercise Types (HSEEP)',
      'Evaluation Framework',
      'After-Action Process',
      'Corrective Action Tracking',
      'Maintenance Process',
    ],
  },
];

function DocTemplatesView({ data, orgName }) {
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState({});
  const ctx = `Organization: "${orgName || 'My Agency'}". Jurisdiction: ${
    data.jurisdiction || 'Unknown'
  }. State: ${data.state || 'Unknown'}. THIRA Hazards: ${
    (data.thira?.hazards || []).map((h) => h.type).join(', ') || 'None profiled'
  }. Plans on file: ${
    (data.plans || []).map((p) => p.name).join(', ') || 'None'
  }. Personnel: ${(data.employees || []).length}. Standards compliance: ${
    Object.values(data.standards || {}).filter((s) => s.status === 'compliant')
      .length
  }/73.`;
  const generate = async (tpl) => {
    setGenerating(true);
    const sys =
      'You are an expert emergency management document writer. Generate a professional, ready-to-customize document template. Use the organization context provided. Output clear section headers and practical content. Be specific to emergency management best practices and EMAP EMS 5-2022 requirements.';
    const prompt = `Generate a complete ${
      tpl.name
    } document for this EM program. Context: ${ctx}. Include these sections: ${tpl.sections.join(
      ', '
    )}. For each section, provide substantive starter content that the user can customize. Include placeholder brackets [CUSTOMIZE] where org-specific details are needed. Make it practical and ready to use.`;
    let result = '';
    try {
      await callAI(sys, prompt, (chunk) => {
        result += chunk;
        setGenerated((p) => ({ ...p, [tpl.id]: result }));
      }, 'template_gen');
    } catch {
      setGenerated((p) => ({
        ...p,
        [tpl.id]:
          'Error generating template. Check your AI credits and try again.',
      }));
    }
    setGenerating(false);
  };
  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 960 }}>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.3px',
          }}
        >
          Document Templates
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
          AI-powered templates pre-filled with your program data. Customize and
          export for EMAP compliance.
        </p>
      </div>
      <CoachBanner moduleId="templates" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {DOC_TEMPLATES.map((tpl) => (
          <Card
            key={tpl.id}
            style={{
              padding: '16px 18px',
              cursor: 'pointer',
              border: `1px solid ${
                selected?.id === tpl.id ? B.teal : B.border
              }`,
              transition: 'all 0.15s',
            }}
            onClick={() => setSelected(tpl)}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 8,
              }}
            >
              <Tag
                label={`EMAP ${tpl.emap}`}
                color={B.tealDark}
                bg={B.tealLight}
                border={B.tealBorder}
              />
              {generated[tpl.id] && (
                <span style={{ fontSize: 9, color: B.green, fontWeight: 700 }}>
                  Generated
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: B.text,
                marginBottom: 4,
              }}
            >
              {tpl.name}
            </div>
            <div style={{ fontSize: 11, color: B.faint, lineHeight: 1.5 }}>
              {tpl.desc}
            </div>
          </Card>
        ))}
      </div>
      {selected && (
        <Card style={{ padding: '20px 24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: B.text }}>
                {selected.name}
              </div>
              <div style={{ fontSize: 12, color: B.faint, marginTop: 2 }}>
                Sections: {selected.sections.join(' - ')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn
                label={generating ? 'Generating...' : 'Generate with AI'}
                onClick={() => generate(selected)}
                primary
                loading={generating}
                disabled={generating}
              />
              {generated[selected.id] && (
                <Btn
                  label="Copy to Clipboard"
                  onClick={() => {
                    navigator.clipboard?.writeText(generated[selected.id]);
                  }}
                />
              )}
            </div>
          </div>
          {generated[selected.id] ? (
            <div
              style={{
                background: '#fafcfc',
                border: `1px solid ${B.border}`,
                borderRadius: 8,
                padding: '16px 20px',
                maxHeight: 500,
                overflowY: 'auto',
                fontSize: 13,
                color: B.muted,
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {generated[selected.id]}
            </div>
          ) : (
            <div
              style={{
                background: '#fafcfc',
                border: `1px solid ${B.border}`,
                borderRadius: 8,
                padding: '28px',
                textAlign: 'center',
                color: B.faint,
              }}
            >
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                Click "Generate with AI" to create a template pre-filled with
                your program data
              </div>
              <div style={{ fontSize: 11 }}>
                The AI will use your organization name, jurisdiction, hazard
                profile, and existing plans to customize the output
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   ONE-CLICK EVIDENCE EXPORT PER STANDARD
------------------------------------------------------- */
function EvidenceExportView({ data, orgName }) {
  const standards = data.standards || {};
  const [selectedSection, setSelectedSection] = useState(null);
  const [exporting, setExporting] = useState(null);

  const buildEvidencePackage = (stdId) => {
    const std = ALL_STANDARDS.find((s) => s.id === stdId);
    const rec = standards[stdId] || initRecord();
    const evidence = {
      standard: stdId,
      title: std?.text || '',
      status: rec.status,
      notes: rec.notes,
      assignee: rec.assignee,
      docs: (rec.docs || []).map((d) => ({
        name: d.name,
        size: d.size,
        type: d.type,
        rationale: d.rationale,
        confidence: d.confidence,
      })),
      linkedData: {},
    };
    // Pull linked program ops data
    const section = stdId.split('.').slice(0, 2).join('.');
    if (section === '4.5' || section === '4.4')
      (data.plans || []).forEach((p) => {
        if (
          p.emapRef &&
          stdId.startsWith(p.emapRef.split('.').slice(0, 2).join('.'))
        )
          evidence.linkedData.plans = [
            ...(evidence.linkedData.plans || []),
            {
              name: p.name,
              type: p.type,
              status: p.status,
              lastReview: p.lastReview,
            },
          ];
      });
    if (section === '4.10')
      (data.training || []).forEach((t) => {
        evidence.linkedData.training = [
          ...(evidence.linkedData.training || []),
          { person: t.person, type: t.type, date: t.date },
        ];
      });
    if (section === '4.11') {
      (data.exercises || []).forEach((e) => {
        evidence.linkedData.exercises = [
          ...(evidence.linkedData.exercises || []),
          {
            name: e.name,
            type: e.type,
            date: e.date,
            status: e.status,
            hasAAR: !!e.aarFinal,
          },
        ];
      });
      evidence.linkedData.correctiveActions = (data.capItems || []).map(
        (c) => ({ finding: c.finding, status: c.closed ? 'Closed' : 'Open' })
      );
    }
    if (section === '4.7')
      (data.partners || []).forEach((p) => {
        evidence.linkedData.partners = [
          ...(evidence.linkedData.partners || []),
          { name: p.name, type: p.agreementType, expires: p.expires },
        ];
      });
    if (section === '4.1')
      (data.thira?.hazards || []).forEach((h) => {
        evidence.linkedData.hazards = [
          ...(evidence.linkedData.hazards || []),
          {
            type: h.type,
            likelihood: h.likelihood,
            consequence: h.consequence,
          },
        ];
      });
    if (section === '3.4')
      (data.grants || [])
        .filter((g) => g.status === 'active')
        .forEach((g) => {
          evidence.linkedData.grants = [
            ...(evidence.linkedData.grants || []),
            { name: g.name, type: g.type, amount: g.amount },
          ];
        });
    return evidence;
  };

  const exportStandard = (stdId) => {
    setExporting(stdId);
    const pkg = buildEvidencePackage(stdId);
    const lines = [
      `EVIDENCE PACKAGE: EMAP Standard ${stdId}`,
      `Organization: ${orgName || ''}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `${'='.repeat(60)}`,
      ``,
      `STANDARD: ${pkg.title}`,
      `STATUS: ${ST[pkg.status]?.label || pkg.status}`,
      `ASSIGNEE: ${pkg.assignee || 'Unassigned'}`,
      ``,
    ];
    if (pkg.notes) lines.push(`NOTES:`, pkg.notes, ``);
    if (pkg.docs.length > 0) {
      lines.push(`UPLOADED EVIDENCE (${pkg.docs.length} documents):`);
      pkg.docs.forEach((d, i) => {
        lines.push(
          `  ${i + 1}. ${d.name} (${d.type || 'file'})${
            d.confidence ? ` - AI Confidence: ${d.confidence}%` : ''
          }${d.rationale ? `\n     Rationale: ${d.rationale}` : ''}`
        );
      });
      lines.push(``);
    }
    Object.entries(pkg.linkedData).forEach(([key, items]) => {
      if (items && items.length > 0) {
        lines.push(
          `LINKED ${key.toUpperCase()} DATA (${items.length} records):`
        );
        items.forEach((item, i) =>
          lines.push(`  ${i + 1}. ${JSON.stringify(item)}`)
        );
        lines.push(``);
      }
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence_${stdId}_${
      new Date().toISOString().split('T')[0]
    }.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(null), 1000);
  };

  const exportSection = (sec) => {
    sec.standards.forEach((std, i) => {
      setTimeout(() => exportStandard(std.id), i * 200);
    });
  };

  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 960 }}>
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: B.text,
            letterSpacing: '-0.3px',
          }}
        >
          Evidence Export
        </h1>
        <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
          Generate evidence packages for your EMAP assessors. Each export
          includes standards data, uploaded documents, notes, and linked program
          records.
        </p>
      </div>
      <CoachBanner moduleId="evidence" />
      <div
        style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}
      >
        <Btn
          label="Export All Standards"
          onClick={() => ALL_SECTIONS.forEach((sec) => exportSection(sec))}
          primary
          small
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ALL_SECTIONS.map((sec) => {
          const stats = sectionStats(sec, data.standards || {});
          const docCount = sec.standards.reduce(
            (a, s) => a + ((standards[s.id] || {}).docs || []).length,
            0
          );
          return (
            <Card key={sec.id} style={{ padding: '14px 18px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                }}
                onClick={() =>
                  setSelectedSection(selectedSection === sec.id ? null : sec.id)
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
                  }}
                >
                  {sec.id}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: B.text,
                  }}
                >
                  {sec.title}
                </span>
                <span style={{ fontSize: 10, color: B.faint }}>
                  {docCount} docs
                </span>
                <div style={{ width: 50 }}>
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
                      }}
                    />
                  </div>
                </div>
                <Btn
                  label="Export Section"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportSection(sec);
                  }}
                  small
                />
              </div>
              {selectedSection === sec.id && (
                <div
                  style={{
                    marginTop: 10,
                    borderTop: `1px solid ${B.border}`,
                    paddingTop: 10,
                  }}
                >
                  {sec.standards.map((std) => {
                    const rec = standards[std.id] || initRecord();
                    return (
                      <div
                        key={std.id}
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          padding: '6px 0',
                        }}
                      >
                        <StatusDot status={rec.status} size={8} />
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: B.muted,
                          }}
                        >
                          {std.id}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 11,
                            color: B.faint,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {std.text.slice(0, 80)}...
                        </span>
                        <span style={{ fontSize: 9, color: B.faint }}>
                          {(rec.docs || []).length} docs
                        </span>
                        <button
                          onClick={() => exportStandard(std.id)}
                          style={{
                            background: exporting === std.id ? B.green : 'none',
                            border: `1px solid ${
                              exporting === std.id ? B.green : B.border
                            }`,
                            borderRadius: 5,
                            padding: '3px 8px',
                            fontSize: 10,
                            color: exporting === std.id ? '#fff' : B.muted,
                            cursor: 'pointer',
                            fontFamily: "'DM Sans',sans-serif",
                            transition: 'all 0.2s',
                          }}
                        >
                          {exporting === std.id ? 'Exported' : 'Export'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   MUTUAL AID MAP (Multi-Jurisdiction)
------------------------------------------------------- */
function MutualAidView({ data, setData }) {
  const RESOURCE_TYPES = [
    'Personnel',
    'Vehicles',
    'Heavy Equipment',
    'Communications',
    'Shelter/Mass Care',
    'Medical/EMS',
    'HAZMAT',
    'Water Rescue',
    'Search & Rescue',
    'Aviation',
    'IT/Cyber',
    'Facilities',
    'Other',
  ];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ partnerId: '', resources: [], notes: '' });
  const partners = data.partners || [];
  const mutualAid = data.mutualAid || [];
  const save = () => {
    if (!form.partnerId || form.resources.length === 0) return;
    setData((prev) => ({
      ...prev,
      mutualAid: [
        ...(prev.mutualAid || []),
        { ...form, id: uid(), addedAt: Date.now() },
      ],
    }));
    setForm({ partnerId: '', resources: [], notes: '' });
    setShowForm(false);
  };
  const remove = (id) =>
    setData((prev) => ({
      ...prev,
      mutualAid: (prev.mutualAid || []).filter((m) => m.id !== id),
    }));
  const toggleResource = (r) =>
    setForm((p) => ({
      ...p,
      resources: p.resources.includes(r)
        ? p.resources.filter((x) => x !== r)
        : [...p.resources, r],
    }));

  // EMAP 4.7 coverage analysis
  const stds = data.standards || {};
  const s47Standards = [
    '4.7.1',
    '4.7.2',
    '4.7.3',
    '4.7.4',
    '4.7.5',
    '4.7.6',
    '4.7.7',
    '4.7.8',
  ];
  const s47Compliant = s47Standards.filter(
    (id) => (stds[id] || {}).status === 'compliant'
  ).length;

  // Resource coverage matrix
  const resourceMatrix = useMemo(() => {
    const matrix = {};
    RESOURCE_TYPES.forEach((r) => {
      matrix[r] = { providers: [], count: 0 };
    });
    mutualAid.forEach((ma) => {
      const partner = partners.find((p) => p.id === ma.partnerId);
      if (partner)
        (ma.resources || []).forEach((r) => {
          if (matrix[r]) {
            matrix[r].providers.push(partner.name);
            matrix[r].count++;
          }
        });
    });
    return matrix;
  }, [mutualAid, partners]);

  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1060 }}>
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
            Mutual Aid Resource Map
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP 4.7 - Map shared resources across jurisdictions -{' '}
            {mutualAid.length} resource agreements
          </p>
        </div>
        <CoachBanner moduleId="mutualaid" />
        <Btn
          label="+ Map Resources"
          onClick={() => setShowForm(true)}
          primary
        />
      </div>

      {/* 4.7 Compliance strip */}
      <Card
        style={{
          marginBottom: 16,
          padding: '14px 18px',
          background: `linear-gradient(135deg,#f0fafa,#fff)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: B.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              EMAP 4.7 Resource Management & Mutual Aid
            </div>
            <div style={{ fontSize: 12, color: B.faint, marginTop: 3 }}>
              {s47Compliant}/{s47Standards.length} standards compliant -{' '}
              {partners.length} partner agreements - {mutualAid.length} resource
              mappings
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {s47Standards.map((id) => (
              <StatusDot
                key={id}
                status={(stds[id] || {}).status || 'not_started'}
                size={10}
              />
            ))}
          </div>
        </div>
      </Card>

      {showForm && (
        <Card
          style={{
            marginBottom: 14,
            background: B.blueLight,
            borderColor: B.blueBorder,
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
            Map Partner Resources
          </div>
          <div style={{ marginBottom: 10 }}>
            <Label>Partner Organization</Label>
            <FSel
              value={form.partnerId}
              onChange={(v) => setForm((p) => ({ ...p, partnerId: v }))}
            >
              <option value="">Select a partner...</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.agreementType})
                </option>
              ))}
            </FSel>
          </div>
          <div style={{ marginBottom: 10 }}>
            <Label>Shared Resources (select all that apply)</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {RESOURCE_TYPES.map((r) => (
                <button
                  key={r}
                  onClick={() => toggleResource(r)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: `1px solid ${
                      form.resources.includes(r) ? B.teal : B.border
                    }`,
                    background: form.resources.includes(r)
                      ? B.tealLight
                      : B.card,
                    color: form.resources.includes(r) ? B.tealDark : B.muted,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: form.resources.includes(r) ? 700 : 400,
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <Label>Notes</Label>
            <FInput
              value={form.notes}
              onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
              placeholder="Capabilities, limitations, response time..."
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Save" onClick={save} primary />
            <Btn label="Cancel" onClick={() => setShowForm(false)} />
          </div>
        </Card>
      )}

      {/* Resource Coverage Matrix */}
      <Card style={{ marginBottom: 14, padding: '16px 18px' }}>
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
          Resource Coverage Matrix
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 6,
          }}
        >
          {RESOURCE_TYPES.map((r) => {
            const d = resourceMatrix[r];
            return (
              <div
                key={r}
                style={{
                  padding: '10px 12px',
                  background: d.count > 0 ? B.greenLight : '#fafcfc',
                  border: `1px solid ${d.count > 0 ? B.greenBorder : B.border}`,
                  borderRadius: 7,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: d.count > 0 ? B.green : B.faint,
                  }}
                >
                  {r}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: d.count > 0 ? '#065f46' : B.faint,
                    marginTop: 2,
                  }}
                >
                  {d.count > 0
                    ? `${d.count} provider${d.count > 1 ? 's' : ''}${
                        d.providers.length > 0 ? ' - ' + d.providers[0] : ''
                      }${
                        d.providers.length > 1
                          ? ` +${d.providers.length - 1}`
                          : ''
                      }`
                    : 'No coverage'}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mapped agreements list */}
      {mutualAid.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {mutualAid.map((ma) => {
            const partner = partners.find((p) => p.id === ma.partnerId);
            return (
              <Card key={ma.id} style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      background: B.blueLight,
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: B.blue,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    -
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: B.text }}
                    >
                      {partner?.name || 'Unknown Partner'}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 4,
                        flexWrap: 'wrap',
                        marginTop: 4,
                      }}
                    >
                      {(ma.resources || []).map((r) => (
                        <Tag
                          key={r}
                          label={r}
                          color={B.green}
                          bg={B.greenLight}
                          border={B.greenBorder}
                        />
                      ))}
                    </div>
                    {ma.notes && (
                      <div
                        style={{ fontSize: 11, color: B.faint, marginTop: 4 }}
                      >
                        {ma.notes}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(ma.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    x
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {mutualAid.length === 0 && !showForm && (
        <Card style={{ textAlign: 'center', padding: '32px', color: B.faint }}>
          No resource mappings yet. Start by mapping which resources your
          partner agencies can share.
        </Card>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   RECOVERY PLANNING MODULE (EMAP 4.5.4)
------------------------------------------------------- */
const RECOVERY_PHASES = [
  'Short-Term (0-30 days)',
  'Intermediate (30-180 days)',
  'Long-Term (180+ days)',
];
const RECOVERY_FUNCTIONS = [
  'Critical Infrastructure',
  'Housing',
  'Economic Recovery',
  'Health & Social Services',
  'Natural & Cultural Resources',
  'Community Planning & Capacity',
  'Public Information',
];
const RECOVERY_FRAMEWORK = [
  {
    phase: 'Short-Term (0-30 days)',
    functions: [
      'Damage assessment',
      'Debris removal',
      'Emergency shelter-to-housing',
      'Temporary infrastructure',
      'Crisis counseling',
      'Immediate economic stabilization',
      'Environmental hazard assessment',
    ],
  },
  {
    phase: 'Intermediate (30-180 days)',
    functions: [
      'Infrastructure repair prioritization',
      'Interim housing solutions',
      'Business recovery assistance',
      'Long-term mental health services',
      'Remediation planning',
      'Recovery planning committees',
      'Ongoing public communication',
    ],
  },
  {
    phase: 'Long-Term (180+ days)',
    functions: [
      'Permanent infrastructure rebuild',
      'Affordable housing programs',
      'Economic development incentives',
      'Community health monitoring',
      'Ecosystem restoration',
      'Resilience-building measures',
      'After-action integration',
    ],
  },
];

function RecoveryPlanningView({ data, setData }) {
  const recovery = data.recovery || {
    priorities: [],
    functions: {},
    notes: '',
  };
  const [tab, setTab] = useState('framework');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phase: 'Short-Term (0-30 days)',
    function: 'Critical Infrastructure',
    responsible: '',
    status: 'not_started',
    notes: '',
  });
  const STATUS_OPTS = [
    { v: 'not_started', l: 'Not Started', c: B.faint },
    { v: 'in_progress', l: 'In Progress', c: B.amber },
    { v: 'complete', l: 'Complete', c: B.green },
  ];
  const stds = data.standards || {};
  const recoveryStds = ['4.5.1', '4.5.2', '4.5.4', '4.5.5', '4.5.6', '4.5.7'];
  const compliant = recoveryStds.filter(
    (id) => (stds[id] || {}).status === 'compliant'
  ).length;

  const save = () => {
    if (!form.name) return;
    setData((prev) => ({
      ...prev,
      recovery: {
        ...(prev.recovery || { priorities: [], functions: {}, notes: '' }),
        priorities: [
          ...((prev.recovery || {}).priorities || []),
          { ...form, id: uid(), addedAt: Date.now() },
        ],
      },
    }));
    setForm({
      name: '',
      phase: 'Short-Term (0-30 days)',
      function: 'Critical Infrastructure',
      responsible: '',
      status: 'not_started',
      notes: '',
    });
    setShowAdd(false);
  };
  const updatePriority = (id, field, val) =>
    setData((prev) => ({
      ...prev,
      recovery: {
        ...(prev.recovery || {}),
        priorities: ((prev.recovery || {}).priorities || []).map((p) =>
          p.id === id ? { ...p, [field]: val } : p
        ),
      },
    }));
  const removePriority = (id) =>
    setData((prev) => ({
      ...prev,
      recovery: {
        ...(prev.recovery || {}),
        priorities: ((prev.recovery || {}).priorities || []).filter(
          (p) => p.id !== id
        ),
      },
    }));

  return (
    <div style={{ padding: '28px clamp(24px,3vw,48px)', maxWidth: 1060 }}>
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
            Recovery Planning
          </h1>
          <p style={{ color: B.faint, fontSize: 13, marginTop: 2 }}>
            EMAP 4.5.4 - Short and long-term recovery priorities - {compliant}/
            {recoveryStds.length} recovery standards compliant
          </p>
        </div>
        <Btn label="+ Add Priority" onClick={() => setShowAdd(true)} primary />
      </div>
      <CoachBanner moduleId="recovery" />

      {/* EMAP Recovery compliance strip */}
      <Card
        style={{
          marginBottom: 16,
          padding: '14px 18px',
          background: `linear-gradient(135deg,#f0fafa,#fff)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: B.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Recovery Planning Standards (4.5)
            </div>
            <div style={{ fontSize: 11, color: B.faint, marginTop: 3 }}>
              Argonne Study: Agencies investing in recovery planning are better
              positioned to meet community needs and compliance requirements
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {recoveryStds.map((id) => (
              <StatusDot
                key={id}
                status={(stds[id] || {}).status || 'not_started'}
                size={10}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          ['framework', 'Recovery Framework'],
          ['priorities', 'Active Priorities'],
          ['functions', 'By Function'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '7px 16px',
              borderRadius: 7,
              border: `1px solid ${tab === id ? B.teal : B.border}`,
              background: tab === id ? B.tealLight : B.card,
              color: tab === id ? B.tealDark : B.muted,
              fontSize: 12,
              fontWeight: tab === id ? 700 : 400,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {showAdd && (
        <Card
          style={{
            marginBottom: 14,
            background: B.greenLight,
            borderColor: B.greenBorder,
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
            Add Recovery Priority
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
              <Label>Priority / Action</Label>
              <FInput
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="e.g., Establish emergency housing program"
              />
            </div>
            <div>
              <Label>Phase</Label>
              <FSel
                value={form.phase}
                onChange={(v) => setForm((p) => ({ ...p, phase: v }))}
              >
                {RECOVERY_PHASES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </FSel>
            </div>
            <div>
              <Label>Function Area</Label>
              <FSel
                value={form.function}
                onChange={(v) => setForm((p) => ({ ...p, function: v }))}
              >
                {RECOVERY_FUNCTIONS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </FSel>
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
                placeholder="Role or organization"
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
            <Btn label="Cancel" onClick={() => setShowAdd(false)} />
          </div>
        </Card>
      )}

      {tab === 'framework' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RECOVERY_FRAMEWORK.map((phase) => (
            <Card key={phase.phase}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: B.text,
                  marginBottom: 10,
                }}
              >
                {phase.phase}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                  gap: 6,
                }}
              >
                {phase.functions.map((f, i) => {
                  const hasPriority = (recovery.priorities || []).some(
                    (p) => p.phase === phase.phase
                  );
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        background: hasPriority ? B.greenLight : '#fafcfc',
                        border: `1px solid ${
                          hasPriority ? B.greenBorder : B.border
                        }`,
                        borderRadius: 6,
                        fontSize: 12,
                        color: hasPriority ? B.green : B.muted,
                      }}
                    >
                      {f}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'priorities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {(recovery.priorities || []).length === 0 ? (
            <Card
              style={{ textAlign: 'center', padding: '32px', color: B.faint }}
            >
              No recovery priorities defined yet. Add priorities to build your
              recovery plan.
            </Card>
          ) : (
            (recovery.priorities || []).map((p) => {
              const sc =
                STATUS_OPTS.find((s) => s.v === p.status) || STATUS_OPTS[0];
              return (
                <Card key={p.id} style={{ padding: '12px 16px' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: sc.c,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{ fontSize: 13, fontWeight: 700, color: B.text }}
                      >
                        {p.name}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <Tag
                          label={p.phase}
                          color={B.blue}
                          bg={B.blueLight}
                          border={B.blueBorder}
                        />
                        <Tag
                          label={p.function}
                          color={B.purple}
                          bg={B.purpleLight}
                          border={B.purpleBorder}
                        />
                        {p.responsible && (
                          <span style={{ fontSize: 11, color: B.faint }}>
                            {p.responsible}
                          </span>
                        )}
                      </div>
                    </div>
                    <FSel
                      value={p.status}
                      onChange={(v) => updatePriority(p.id, 'status', v)}
                      style={{ width: 130 }}
                    >
                      {STATUS_OPTS.map((s) => (
                        <option key={s.v} value={s.v}>
                          {s.l}
                        </option>
                      ))}
                    </FSel>
                    <button
                      onClick={() => removePriority(p.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      x
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === 'functions' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: 10,
          }}
        >
          {RECOVERY_FUNCTIONS.map((func) => {
            const items = (recovery.priorities || []).filter(
              (p) => p.function === func
            );
            const complete = items.filter(
              (p) => p.status === 'complete'
            ).length;
            return (
              <Card key={func} style={{ padding: '14px 16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: B.text }}>
                    {func}
                  </div>
                  <Tag
                    label={`${complete}/${items.length}`}
                    color={
                      complete === items.length && items.length > 0
                        ? B.green
                        : B.faint
                    }
                    bg={
                      complete === items.length && items.length > 0
                        ? B.greenLight
                        : '#f8fafc'
                    }
                    border={
                      complete === items.length && items.length > 0
                        ? B.greenBorder
                        : B.border
                    }
                  />
                </div>
                {items.length === 0 ? (
                  <div style={{ fontSize: 11, color: B.faint }}>
                    No priorities defined
                  </div>
                ) : (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                  >
                    {items.map((p) => {
                      const sc =
                        STATUS_OPTS.find((s) => s.v === p.status) ||
                        STATUS_OPTS[0];
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            gap: 6,
                            alignItems: 'center',
                            fontSize: 11,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: sc.c,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: B.muted }}>{p.name}</span>
                          <span
                            style={{
                              marginLeft: 'auto',
                              fontSize: 9,
                              color: sc.c,
                              fontWeight: 600,
                            }}
                          >
                            {sc.l}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LandingPage({ onLogin, onSignup, onBuyPlan }) {
  const [mobileNav, setMobileNav] = useState(false);
  return (
    <div
      style={{
        fontFamily: 'DM Sans,sans-serif',
        background: '#1C1F22',
        minHeight: '100vh',
        color: '#f0f4fa',
        backgroundImage:
          'linear-gradient(rgba(194,150,74,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(194,150,74,0.03) 1px,transparent 1px)',
        backgroundSize: '52px 52px',
      }}
    >
      <style>{`@media(max-width:768px){.planrr-pricing-grid{grid-template-columns:1fr!important}.planrr-features-grid{grid-template-columns:1fr!important}.planrr-stats-strip{grid-template-columns:repeat(2,1fr)!important}.planrr-security-grid{grid-template-columns:1fr!important}.planrr-landing-header{padding:14px 16px!important}.planrr-landing-hero{padding:48px 20px 40px!important}.planrr-landing-section{padding:48px 20px!important}.planrr-header-actions{display:none!important}.planrr-mobile-menu-btn{display:flex!important}}@media(max-width:480px){.planrr-stats-strip{grid-template-columns:1fr!important}}`}</style>
      {/* Header */}
      <div
        className="planrr-landing-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(194,150,74,0.22)',
          padding: '14px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(20,23,25,0.92)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              fontFamily: 'Syne,DM Sans,sans-serif',
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            <span style={{ color: '#f0f4fa' }}>planrr</span>
            <span style={{ color: GOLD }}>.app</span>
          </div>
          <div
            style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: 9,
              color: '#475569',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginLeft: 6,
            }}
          >
            Early Access
          </div>
        </div>
        <div className="planrr-header-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: 10,
              color: GOLD,
              border: '1px solid rgba(194,150,74,0.22)',
              padding: '4px 12px',
              borderRadius: 2,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            EMAP EMS 5-2022
          </div>
          <button
            onClick={onLogin}
            style={{
              background: 'none',
              color: '#94a3b8',
              border: '1px solid #3A4045',
              borderRadius: 6,
              padding: '8px 18px',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'DM Sans,sans-serif',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => onBuyPlan ? onBuyPlan('small_team') : onSignup()}
            style={{
              background: GOLD,
              color: '#141719',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'DM Sans,sans-serif',
            }}
          >
            Start Free Trial
          </button>
        </div>
        <button
          className="planrr-mobile-menu-btn"
          onClick={() => setMobileNav(p => !p)}
          aria-label="Toggle navigation menu"
          style={{ display: 'none', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid #3A4045', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#f0f4fa', fontSize: 18 }}
        >
          {mobileNav ? '✕' : '☰'}
        </button>
      </div>
      {mobileNav && (
        <div style={{ background: 'rgba(20,23,25,0.98)', borderBottom: '1px solid rgba(194,150,74,0.22)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => { setMobileNav(false); onLogin(); }} style={{ background: 'none', color: '#94a3b8', border: '1px solid #3A4045', borderRadius: 6, padding: '10px', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', width: '100%' }}>Sign In</button>
          <button onClick={() => { setMobileNav(false); onBuyPlan ? onBuyPlan('small_team') : onSignup(); }} style={{ background: GOLD, color: '#141719', border: 'none', borderRadius: 6, padding: '10px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', width: '100%' }}>Start Free Trial</button>
        </div>
      )}

      {/* Hero */}
      <div
        className="planrr-landing-hero"
        style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px 72px' }}
      >
        <div
          style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: 11,
            color: GOLD,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ width: 28, height: 1, background: GOLD }} />
          Emergency Management Platform
        </div>
        <h1
          style={{
            fontFamily: 'Syne,DM Sans,sans-serif',
            fontSize: 'clamp(38px,5vw,64px)',
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: '-2px',
            marginBottom: 22,
          }}
        >
          Your EM program.
          <br />
          Running at full strength.
          <br />
          <span style={{ color: GOLD }}>Every single day.</span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: '#94a3b8',
            maxWidth: 560,
            lineHeight: 1.75,
            marginBottom: 14,
            fontWeight: 300,
          }}
        >
          planrr.app is the all-in-one platform for emergency management
          programs that need to operate at a high standard 365 days a year.
          Built to be a force multiplier for understaffed shops — know exactly
          what to work on next, automate compliance tracking, and stretch every
          dollar of your program budget.
        </p>
        <p
          style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: 11,
            color: '#475569',
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: 40,
            borderLeft: '2px solid rgba(194,150,74,0.22)',
            paddingLeft: 14,
          }}
        >
          Over 50% of local EM agencies have one or fewer full-time permanent
          staff. planrr.app was built for them.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={() => onBuyPlan ? onBuyPlan('small_team') : onSignup()}
            style={{
              background: GOLD,
              color: '#141719',
              border: 'none',
              padding: '13px 28px',
              fontFamily: 'Syne,DM Sans,sans-serif',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            Start Free Trial
          </button>
          <button
            onClick={onLogin}
            style={{
              border: '1px solid rgba(194,150,74,0.22)',
              color: GOLD,
              background: 'none',
              padding: '12px 24px',
              fontFamily: 'DM Mono,monospace',
              fontSize: 12,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            Sign In to Your Program
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div
        className="planrr-stats-strip"
        style={{
          borderTop: '1px solid rgba(194,150,74,0.22)',
          borderBottom: '1px solid rgba(194,150,74,0.22)',
          background: 'rgba(28,31,34,0.85)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
        }}
      >
        {[
          ['73', 'EMAP Standards Tracked'],
          ['32', 'FEMA Core Capabilities'],
          ['6', 'AI Document Templates'],
          ['100%', 'End-to-End EM System'],
        ].map(([n, l]) => (
          <div
            key={l}
            style={{
              padding: '28px clamp(24px,3vw,48px)',
              borderRight: '1px solid rgba(194,150,74,0.12)',
            }}
          >
            <div
              style={{
                fontFamily: 'Syne,DM Sans,sans-serif',
                fontSize: 36,
                fontWeight: 800,
                color: GOLD,
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {n}
            </div>
            <div
              style={{
                fontFamily: 'DM Mono,monospace',
                fontSize: 10,
                color: '#475569',
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                lineHeight: 1.5,
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="planrr-landing-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
        <div
          style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: 10,
            color: GOLD,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ width: 20, height: 1, background: GOLD }} />
          The Platform
        </div>
        <h2
          style={{
            fontFamily: 'Syne,DM Sans,sans-serif',
            fontSize: 'clamp(24px,3vw,36px)',
            fontWeight: 700,
            letterSpacing: '-1px',
            marginBottom: 12,
          }}
        >
          Everything your program needs.
          <br />
          <span style={{ color: GOLD }}>One place.</span>
        </h2>
        <p
          style={{
            color: '#94a3b8',
            fontSize: 15,
            fontWeight: 300,
            maxWidth: 560,
            lineHeight: 1.75,
            marginBottom: 48,
          }}
        >
          Built around EMAP EMS 5-2022, HSEEP, and CPG 201. Every module talks
          to every other module. Your compliance picture builds automatically as
          you work.
        </p>
        <div
          className="planrr-features-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 2,
          }}
        >
          {[
            [
              'EMAP Standards',
              'Track all 73 EMS 5-2022 standards. Upload evidence, write rationale, get AI interpretation. Your compliance picture updates in real time.',
              'Accreditation Core',
            ],
            [
              'Smart Priority Queue',
              'One prioritized list of what to work on today. Expiring MOUs, overdue reviews, credential alerts, and missing plans - sorted by urgency and EMAP impact.',
              'Dashboard',
            ],
            [
              'Exercises & AARs',
              'Full HSEEP workflow with AI-generated After-Action Reports. Corrective actions auto-populate your CAP dashboard.',
              'HSEEP Aligned',
            ],
            [
              'Document Templates',
              'AI-generated templates pre-filled with your program data. Strategic plans, COOP, resource management, communications, training, and exercise plans.',
              'AI-Powered',
            ],
            [
              'Recovery Planning',
              'Dedicated recovery module with short, intermediate, and long-term phases. Built around EMAP 4.5.4 and the Argonne study findings.',
              'EMAP 4.5.4',
            ],
            [
              'Evidence Export',
              'One-click evidence packages for your assessors. All docs, training records, AARs, and notes bundled per standard. Assessment-ready.',
              'Accreditation',
            ],
            [
              'Mutual Aid Mapping',
              'Map which partners share which resources. Coverage matrix shows gaps. Built for jurisdictions that share resources to stay independent.',
              'EMAP 4.7',
            ],
            [
              'FEMA/NIMS Alignment',
              'Secondary compliance badge tracking ICS, NIMS, and interoperability standards. Show FEMA alignment alongside your EMAP progress.',
              'ICS/NIMS',
            ],
            [
              'Grant-EMAP Tracker',
              'See which active grants tie to which EMAP standards. Flag when compliance gaps might jeopardize funding eligibility.',
              'EMAP 3.4',
            ],
          ].map(([t, d, tag]) => (
            <div
              key={t}
              style={{
                background: '#1C1F22',
                border: '1px solid #2E3439',
                padding: '28px 24px',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  fontFamily: 'Syne,DM Sans,sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {t}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#94a3b8',
                  lineHeight: 1.65,
                  marginBottom: 14,
                  fontWeight: 300,
                }}
              >
                {d}
              </div>
              <div
                style={{
                  fontFamily: 'DM Mono,monospace',
                  fontSize: 9,
                  color: GOLD,
                  border: '1px solid rgba(194,150,74,0.22)',
                  padding: '2px 8px',
                  display: 'inline-block',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {tag}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Force Multiplier */}
      <div style={{ borderTop: '1px solid rgba(194,150,74,0.22)', background: '#1C1F22' }}>
        <div className="planrr-landing-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: GOLD, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 20, height: 1, background: GOLD }} />
            Why planrr
          </div>
          <h2 style={{ fontFamily: 'Syne,DM Sans,sans-serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>
            One platform. <span style={{ color: GOLD }}>The work of five.</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 15, fontWeight: 300, maxWidth: 560, lineHeight: 1.75, marginBottom: 48 }}>
            Over 50% of local EM agencies have one or fewer full-time staff.
            planrr replaces the spreadsheets, shared drives, and sticky notes
            with a system that tells you exactly what to do next — and does
            half the work for you.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }} className="planrr-features-grid">
            {[
              ['Know What\'s Next', 'AI-prioritized task queue tells you the highest-impact action for your program today. No more guessing what to work on.', 'Stop Guessing'],
              ['Cut Consultant Costs', 'AI drafts your AARs, compliance rationale, grant narratives, and THIRA documents. Work that used to cost $5,000+ in consulting fees, done in minutes.', 'Save Thousands'],
              ['Always Assessment-Ready', 'Your compliance picture builds automatically as you work. When the assessor calls, you\'re already prepared — not scrambling.', 'No Fire Drills'],
              ['One Person, Full Program', 'Training, exercises, plans, partners, grants, standards — all connected. Update one module and the rest updates automatically.', 'Force Multiplier'],
              ['Export-Ready Evidence', 'One-click evidence packages for EMAP assessors. Every document, training record, and AAR bundled per standard.', 'Assessment Day'],
              ['Protect Your Investment', 'Small agencies invest heavily in their programs. planrr makes sure nothing falls through the cracks — expiring MOUs, overdue reviews, lapsing credentials.', 'Never Miss'],
            ].map(([t, d, tag]) => (
              <div key={t} style={{ background: '#1C1F22', border: '1px solid #2E3439', padding: '28px 24px' }}>
                <div style={{ fontFamily: 'Syne,DM Sans,sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{t}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, marginBottom: 14, fontWeight: 300 }}>{d}</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: GOLD, border: '1px solid rgba(194,150,74,0.22)', padding: '2px 8px', display: 'inline-block', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{tag}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div
        style={{
          borderTop: '1px solid #2E3439',
          borderBottom: '1px solid #2E3439',
          background: 'rgba(28,31,34,0.85)',
        }}
      >
        <div className="planrr-landing-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
          <div
            style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: 10,
              color: GOLD,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ width: 20, height: 1, background: GOLD }} />
            Pricing
          </div>
          <h2
            style={{
              fontFamily: 'Syne,DM Sans,sans-serif',
              fontSize: 'clamp(24px,3vw,36px)',
              fontWeight: 700,
              letterSpacing: '-1px',
              marginBottom: 12,
            }}
          >
            Built for every shop size.
            <br />
            <span style={{ color: GOLD }}>No feature gating. Ever.</span>
          </h2>
          <p
            style={{
              color: '#94a3b8',
              fontSize: 15,
              fontWeight: 300,
              maxWidth: 560,
              lineHeight: 1.75,
              marginBottom: 48,
            }}
          >
            Every plan gets every feature - the full EM program in a box. We
            price by team size because understaffed shops deserve the same tools
            as large agencies. Each plan includes defined user seats and monthly
            AI usage. Larger teams are expected to be on higher-tier plans.
          </p>
          <div
            className="planrr-pricing-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr)',
              gap: 2,
            }}
          >
            {/* Solo Operator */}
            <div
              style={{
                background: '#141719',
                border: '1px solid #2E3439',
                padding: '28px 24px',
                borderRadius: '8px 0 0 8px',
              }}
            >
              <div
                style={{
                  fontFamily: 'DM Mono,monospace',
                  fontSize: 9,
                  color: B.teal,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Solo Operator
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Syne,DM Sans,sans-serif',
                    fontSize: 40,
                    fontWeight: 800,
                    color: '#f0f4fa',
                    lineHeight: 1,
                  }}
                >
                  $79
                </span>
                <span style={{ color: '#475569', fontSize: 12 }}>/mo</span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#475569',
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                1 FTE or fewer. For the solo EM director wearing every hat.
              </div>
              {[
                'Every feature included',
                '1 user seat',
                '200 AI calls / month',
                'Email support',
              ].map((f) => (
                <div
                  key={f}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                    marginBottom: 7,
                    fontSize: 12,
                    color: '#94a3b8',
                  }}
                >
                  <span
                    style={{
                      color: B.teal,
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 10,
                    }}
                  >
                    +
                  </span>
                  {f}
                </div>
              ))}
              <button
                onClick={() => onBuyPlan ? onBuyPlan('solo') : onSignup()}
                style={{
                  width: '100%',
                  marginTop: 16,
                  background: 'transparent',
                  color: B.teal,
                  border: '1px solid rgba(27,201,196,0.3)',
                  padding: '10px',
                  fontFamily: 'DM Sans,sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              >
                Start Free Trial
              </button>
            </div>
            {/* Small Team - FEATURED */}
            <div
              style={{
                background: '#141719',
                border: '2px solid ' + GOLD,
                padding: '28px 24px',
                position: 'relative',
                zIndex: 1,
                borderRadius: 0,
                boxShadow: '0 0 30px rgba(194,150,74,0.15)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -1,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: GOLD,
                  color: '#141719',
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '3px 12px',
                  borderRadius: '0 0 4px 4px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Most Popular
              </div>
              <div
                style={{
                  fontFamily: 'DM Mono,monospace',
                  fontSize: 9,
                  color: GOLD,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Small Team
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Syne,DM Sans,sans-serif',
                    fontSize: 40,
                    fontWeight: 800,
                    color: '#f0f4fa',
                    lineHeight: 1,
                  }}
                >
                  $149
                </span>
                <span style={{ color: '#475569', fontSize: 12 }}>/mo</span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#475569',
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                2-5 FTE staff. The backbone of local EM.
              </div>
              {[
                'Every feature included',
                'Up to 5 user seats',
                '1,000 AI calls / month',
                'Priority support',
              ].map((f) => (
                <div
                  key={f}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                    marginBottom: 7,
                    fontSize: 12,
                    color: '#94a3b8',
                  }}
                >
                  <span
                    style={{
                      color: GOLD,
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 10,
                    }}
                  >
                    +
                  </span>
                  {f}
                </div>
              ))}
              <button
                onClick={() => onBuyPlan ? onBuyPlan('small_team') : onSignup()}
                style={{
                  width: '100%',
                  marginTop: 16,
                  background: GOLD,
                  color: '#141719',
                  border: 'none',
                  padding: '10px',
                  fontFamily: 'Syne,DM Sans,sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              >
                Start Free Trial
              </button>
            </div>
            {/* Full Program */}
            <div
              style={{
                background: '#141719',
                border: '1px solid #2E3439',
                padding: '28px 24px',
              }}
            >
              <div
                style={{
                  fontFamily: 'DM Mono,monospace',
                  fontSize: 9,
                  color: '#94a3b8',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Full Program
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Syne,DM Sans,sans-serif',
                    fontSize: 40,
                    fontWeight: 800,
                    color: '#f0f4fa',
                    lineHeight: 1,
                  }}
                >
                  $199
                </span>
                <span style={{ color: '#475569', fontSize: 12 }}>/mo</span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#475569',
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                6+ FTE. For established programs scaling up.
              </div>
              {[
                'Every feature included',
                'Unlimited user seats',
                '5,000 AI calls / month',
                'Dedicated onboarding',
                'Phone support',
              ].map((f) => (
                <div
                  key={f}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                    marginBottom: 7,
                    fontSize: 12,
                    color: '#94a3b8',
                  }}
                >
                  <span
                    style={{
                      color: '#94a3b8',
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 10,
                    }}
                  >
                    +
                  </span>
                  {f}
                </div>
              ))}
              <button
                onClick={() => onBuyPlan ? onBuyPlan('full_program') : onSignup()}
                style={{
                  width: '100%',
                  marginTop: 16,
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #3A4045',
                  padding: '10px',
                  fontFamily: 'DM Sans,sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              >
                Start Free Trial
              </button>
            </div>
            {/* Enterprise / Multi-Org */}
            <div
              style={{
                background: '#141719',
                border: '1px solid #2E3439',
                padding: '28px 24px',
                borderRadius: '0 8px 8px 0',
              }}
            >
              <div
                style={{
                  fontFamily: 'DM Mono,monospace',
                  fontSize: 9,
                  color: B.purple,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Enterprise
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Syne,DM Sans,sans-serif',
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#f0f4fa',
                    lineHeight: 1,
                  }}
                >
                  Custom
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#475569',
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                Multi-org contractors, state agencies, and regional coalitions.
              </div>
              {[
                'Every feature included',
                'Unlimited seats & AI usage',
                'Multi-org dashboard',
                'Dedicated account manager',
                'SLA guarantees',
                'Custom integrations',
              ].map((f) => (
                <div
                  key={f}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                    marginBottom: 7,
                    fontSize: 12,
                    color: '#94a3b8',
                  }}
                >
                  <span
                    style={{
                      color: B.purple,
                      flexShrink: 0,
                      marginTop: 1,
                      fontSize: 10,
                    }}
                  >
                    +
                  </span>
                  {f}
                </div>
              ))}
              <button
                onClick={onSignup}
                style={{
                  width: '100%',
                  marginTop: 16,
                  background: 'transparent',
                  color: B.purple,
                  border: '1px solid rgba(139,92,246,0.3)',
                  padding: '10px',
                  fontFamily: 'DM Sans,sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              >
                Contact Sales
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <div
              style={{
                fontFamily: 'DM Mono,monospace',
                fontSize: 10,
                color: '#475569',
                letterSpacing: '0.08em',
              }}
            >
              14-day free trial on all plans. No credit card required. Discount
              codes available for shops under 2 FTE.
            </div>
            <div
              style={{
                fontFamily: 'DM Mono,monospace',
                fontSize: 10,
                color: GOLD,
                letterSpacing: '0.08em',
                marginTop: 6,
              }}
            >
              Founding agency pricing locked for life.
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          background: '#1C1F22',
          borderTop: '1px solid rgba(194,150,74,0.22)',
          borderBottom: '1px solid rgba(194,150,74,0.22)',
          padding: '64px 40px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'Syne,DM Sans,sans-serif',
            fontSize: 'clamp(26px,4vw,42px)',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            marginBottom: 14,
          }}
        >
          Your program deserves better
          <br />
          than a <span style={{ color: GOLD }}>spreadsheet.</span>
        </h2>
        <p
          style={{
            color: '#94a3b8',
            fontSize: 15,
            fontWeight: 300,
            marginBottom: 32,
            maxWidth: 480,
            margin: '0 auto 32px',
            lineHeight: 1.7,
          }}
        >
          planrr.app is in early access. Join the founding cohort and be among
          the first EM programs to bring real structure and daily readiness to
          how they operate.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => onBuyPlan ? onBuyPlan('small_team') : onSignup()}
            style={{
              background: GOLD,
              color: '#141719',
              border: 'none',
              padding: '13px 28px',
              fontFamily: 'Syne,DM Sans,sans-serif',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            Start Free Trial
          </button>
          <button
            onClick={onLogin}
            style={{
              border: '1px solid rgba(194,150,74,0.22)',
              color: GOLD,
              background: 'none',
              padding: '12px 24px',
              fontFamily: 'DM Mono,monospace',
              fontSize: 12,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            Sign In
          </button>
        </div>
        <div
          style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: 10,
            color: '#475569',
            letterSpacing: '0.1em',
            marginTop: 18,
          }}
        >
          Founding agency pricing. Locked for life. Direct input into the
          product roadmap.
        </div>
      </div>

      {/* Security & Compliance */}
      <div
        style={{
          borderTop: '1px solid #2E3439',
          background: 'rgba(28,31,34,0.85)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
          <div
            style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: 10,
              color: GOLD,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ width: 20, height: 1, background: GOLD }} />
            Security & Compliance
          </div>
          <h2
            style={{
              fontFamily: 'Syne,DM Sans,sans-serif',
              fontSize: 'clamp(24px,3vw,36px)',
              fontWeight: 700,
              letterSpacing: '-1px',
              marginBottom: 12,
            }}
          >
            Built for agencies that handle{' '}
            <span style={{ color: GOLD }}>sensitive data.</span>
          </h2>
          <p
            style={{
              color: '#94a3b8',
              fontSize: 15,
              fontWeight: 300,
              maxWidth: 560,
              lineHeight: 1.75,
              marginBottom: 48,
            }}
          >
            Emergency management data demands serious protection. We treat
            security as a first-class requirement, not an afterthought.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 2,
            }}
            className="planrr-security-grid"
          >
            {[
              ['HTTPS Everywhere', 'All data in transit is encrypted via TLS 1.2+. No exceptions.'],
              ['Encryption at Rest', 'All stored data is encrypted at rest via cloud provider-managed keys (AES-256).'],
              ['Authenticated Access', 'Every API call requires valid auth tokens. Org-scoped access ensures data isolation between agencies.'],
              ['Activity Logs', 'Complete audit trail of user actions. Know who changed what, and when.'],
              ['Automated Backups', 'Continuous database backups with point-in-time recovery. Your program data is never at risk.'],
              ['Secure Infrastructure', 'Hosted on SOC 2-certified cloud infrastructure with network isolation, DDoS protection, and 24/7 monitoring.'],
            ].map(([t, d]) => (
              <div
                key={t}
                style={{
                  background: '#1C1F22',
                  border: '1px solid #2E3439',
                  padding: '28px 24px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Syne,DM Sans,sans-serif',
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: '#f0f4fa',
                  }}
                >
                  {t}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#94a3b8',
                    lineHeight: 1.65,
                    fontWeight: 300,
                  }}
                >
                  {d}
                </div>
              </div>
            ))}
          </div>
          {/* SOC 2 Roadmap */}
          <div
            style={{
              marginTop: 56,
              border: '1px solid rgba(194,150,74,0.22)',
              borderRadius: 12,
              padding: '32px 36px',
              background: '#141719',
            }}
          >
            <div
              style={{
                fontFamily: 'DM Mono,monospace',
                fontSize: 9,
                color: GOLD,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              SOC 2 Compliance Roadmap
            </div>
            <h3
              style={{
                fontFamily: 'Syne,DM Sans,sans-serif',
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
                color: '#f0f4fa',
              }}
            >
              On the path to SOC 2 certification
            </h3>
            <p
              style={{
                fontSize: 13,
                color: '#94a3b8',
                lineHeight: 1.7,
                marginBottom: 28,
                maxWidth: 560,
              }}
            >
              We are actively pursuing SOC 2 compliance to meet the security
              and trust requirements of government agencies.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Q2 – Q3 2026', 'Policies, access control, and change management frameworks', true],
                ['Q3 2026', 'Readiness assessment with independent auditor', true],
                ['Q4 2026 – Q1 2027', 'SOC 2 Type I audit and certification', false],
                ['Q3 2027', 'SOC 2 Type II audit and certification', false],
              ].map(([q, desc, active], i) => (
                <div
                  key={q}
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                      width: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: active ? GOLD : '#2E3439',
                        border: active ? 'none' : '2px solid #475569',
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    />
                    {i < 3 && (
                      <div
                        style={{
                          width: 2,
                          height: 32,
                          background: '#2E3439',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < 3 ? 16 : 0 }}>
                    <div
                      style={{
                        fontFamily: 'DM Mono,monospace',
                        fontSize: 11,
                        color: active ? GOLD : '#475569',
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      {q}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#94a3b8',
                        lineHeight: 1.5,
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #2E3439',
          padding: '40px 40px 28px',
        }}
        className="planrr-landing-header"
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
            <div>
              <div
                style={{
                  fontFamily: 'Syne,DM Sans,sans-serif',
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  marginBottom: 10,
                }}
              >
                <span style={{ color: '#f0f4fa' }}>planrr</span>
                <span style={{ color: GOLD }}>.app</span>
              </div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: '#475569', letterSpacing: '0.08em', maxWidth: 260, lineHeight: 1.6 }}>
                Emergency Management Program Platform.
                <br />EMAP EMS 5-2022 Aligned.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Product</div>
                {['Features', 'Pricing', 'Security'].map(t => (
                  <div key={t} style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.color = GOLD}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >{t}</div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Legal</div>
                <Link to="/privacy" style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, cursor: 'pointer', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = GOLD}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >Privacy Policy</Link>
                <Link to="/terms" style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, cursor: 'pointer', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = GOLD}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >Terms of Service</Link>
              </div>
              <div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Company</div>
                <Link to="/founder" style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = GOLD}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >Founder</Link>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>hello@planrr.app</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #2E3439', paddingTop: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: '#475569', letterSpacing: '0.08em' }}>
              &copy; {new Date().getFullYear()} planrr.app. All rights reserved.
            </div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: '#475569', letterSpacing: '0.08em' }}>
              Made for emergency managers, by emergency managers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* AUTH */
var SB_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ltnbvwnhtsaebyslbhil.supabase.co';
var SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ||
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
  window.location.href = '/';
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
async function sbRefreshToken() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!s || !s.refresh_token) return false;
    const r = await fetch(SB_URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SB_KEY },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    if (!r.ok) return false;
    const d = await r.json();
    if (d.error || !d.access_token) return false;
    localStorage.setItem('sb_session', JSON.stringify({ ...s, ...d }));
    return true;
  } catch { return false; }
}

function getTokenExpiry() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!s || !s.access_token) return 0;
    const p = JSON.parse(atob(s.access_token.split('.')[1]));
    return (p.exp || 0) * 1000;
  } catch { return 0; }
}

function isLoggedIn() {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!s || !s.access_token) return false;
    const p = JSON.parse(atob(s.access_token.split('.')[1]));
    if (p.exp * 1000 < Date.now()) {
      if (s.refresh_token) return 'needs_refresh';
      localStorage.removeItem('sb_session');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

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
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#f0f4fa',
    fontSize: 14,
    fontFamily: 'DM Sans,sans-serif',
    outline: 'none',
    marginBottom: 14,
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  };
  const bS = {
    width: '100%',
    padding: '13px',
    background: `linear-gradient(135deg, ${B.teal}, ${B.tealDark})`,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontFamily: 'DM Sans,sans-serif',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 10,
    boxShadow: '0 4px 14px rgba(27,201,196,0.3)',
    transition: 'all 0.2s',
    letterSpacing: '0.01em',
  };
  const lS = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };
  const lkS = {
    background: 'none',
    border: 'none',
    color: B.teal,
    fontSize: 12,
    cursor: 'pointer',
    padding: 0,
    fontWeight: 600,
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
      await sbSignIn(fe, fp);
      onAuth();
      return;
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
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Logo + tagline above card */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ background: 'rgba(27,201,196,0.1)', borderRadius: 14, padding: '10px', border: '1px solid rgba(27,201,196,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainIcon size={24} color={B.teal} strokeWidth={1.3} />
          </div>
          <Wordmark dark size="md" />
        </div>
        <div style={{ fontSize: 12, color: '#64748b', letterSpacing: '0.02em' }}>
          AI-powered emergency management
        </div>
      </div>
      {/* Card */}
      <div
        style={{
          background: 'rgba(28,31,34,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: '28px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset',
          position: 'relative',
        }}
      >
        {onClose && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14, background: 'none', border: 'none',
            color: '#64748b', fontSize: 18, cursor: 'pointer', padding: '4px 8px',
            lineHeight: 1, borderRadius: 6,
          }} aria-label="Close">✕</button>
        )}
          {err && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 12,
                color: '#ef4444',
                marginBottom: 14,
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
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 12,
                color: B.teal,
                marginBottom: 14,
              }}
            >
              {ok}
            </div>
          )}
          {mode === 'login' && (
            <form onSubmit={doLogin}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#f0f4fa',
                  marginBottom: 4,
                  letterSpacing: '-0.5px',
                }}
              >
                Welcome back
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
                Sign in to your program
              </div>
              <label style={lS}>Work email</label>
              <input
                type="email"
                value={fe}
                onChange={(e) => setFe(e.target.value)}
                placeholder="you@agency.gov"
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
              <button
                type="submit"
                disabled={loading}
                style={{ ...bS, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow =
                      '0 6px 20px rgba(27,201,196,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow =
                    '0 4px 14px rgba(27,201,196,0.3)';
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
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
                style={{
                  height: 1,
                  background: 'rgba(255,255,255,0.06)',
                  margin: '16px 0',
                }}
              />
              <div
                style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}
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
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#f0f4fa',
                  marginBottom: 4,
                  letterSpacing: '-0.5px',
                }}
              >
                Start your free trial
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                14 days free. Cancel anytime.
              </div>
              <label style={lS}>Work email</label>
              <input
                type="email"
                value={fe}
                onChange={(e) => setFe(e.target.value)}
                placeholder="you@agency.gov"
                style={iS}
                required
              />
              <label style={lS}>Organization name</label>
              <input
                type="text"
                value={fo}
                onChange={(e) => setFo(e.target.value)}
                placeholder="e.g. County Emergency Management"
                style={iS}
                required
              />
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
              <button
                type="submit"
                disabled={loading}
                style={{ ...bS, opacity: loading ? 0.7 : 1 }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow =
                      '0 6px 20px rgba(27,201,196,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow =
                    '0 4px 14px rgba(27,201,196,0.3)';
                }}
              >
                {loading ? 'Setting up...' : 'Start Free Trial'}
              </button>
              <div
                style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}
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
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#f0f4fa',
                  marginBottom: 4,
                  letterSpacing: '-0.5px',
                }}
              >
                Reset password
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
                We'll send a reset link to your email
              </div>
              <label style={lS}>Work email</label>
              <input
                type="email"
                value={fe}
                onChange={(e) => setFe(e.target.value)}
                placeholder="you@agency.gov"
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
                  padding: '11px',
                  background: 'none',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(27,201,196,0.3)';
                  e.currentTarget.style.color = B.teal;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
        {/* Footer below card */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <div
            style={{ display: 'flex', gap: 16, fontSize: 11, color: '#475569' }}
          >
            <span>EMAP EMS 5-2022</span>
            <span>HSEEP Aligned</span>
            <span>FEMA Compatible</span>
          </div>
          <div style={{ fontSize: 10, color: '#334155' }}>Plan Smartr</div>
        </div>
      </div>
  );
}

function FirstRunWelcome({ onDone, setView }) {
  const [step, setStep] = useState(0);
  const [path, setPath] = useState(null);
  const totalSteps = 5;
  const pct = Math.round((step / totalSteps) * 100);

  // Step 0: Welcome + path selection
  // Step 1: What your role looks like
  // Step 2: The Plan → Build → Sustain framework
  // Step 3: Where to start based on path
  // Step 4: Your first action

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(20,23,25,0.92)',
          zIndex: 98,
          backdropFilter: 'blur(4px)',
        }}
        onClick={step >= 4 ? onDone : undefined}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 99,
          width: 520,
          maxWidth: 'calc(100vw - 40px)',
          background: '#1C1F22',
          border: '1px solid #2E3439',
          borderRadius: 16,
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Progress bar */}
        <div style={{ height: 3, background: '#2E3439' }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${B.teal}, #c2964a)`,
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        <div style={{ padding: '32px 36px' }}>
          {/* Step counter */}
          <div
            style={{
              fontSize: 10,
              color: '#475569',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            {step === 0
              ? 'Welcome'
              : step === totalSteps
              ? 'Ready'
              : 'Step ' + step + ' of ' + (totalSteps - 1)}
          </div>

          {step === 0 && (
            <>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#f0f4fa',
                  marginBottom: 8,
                  letterSpacing: '-0.5px',
                }}
              >
                Welcome to planrr.app
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#94a3b8',
                  lineHeight: 1.8,
                  marginBottom: 24,
                }}
              >
                We're going to help you build a professional emergency
                management program — whether you're starting from scratch or
                organizing what you already have. First, tell us where you are:
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <button
                  onClick={() => {
                    setPath('new');
                    setStep(1);
                  }}
                  style={{
                    background:
                      path === 'new' ? 'rgba(27,201,196,0.12)' : '#252A2E',
                    border: `1px solid ${
                      path === 'new' ? 'rgba(27,201,196,0.3)' : '#2E3439'
                    }`,
                    borderRadius: 12,
                    padding: '16px 20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = 'rgba(27,201,196,0.3)')
                  }
                  onMouseLeave={(e) => {
                    if (path !== 'new')
                      e.currentTarget.style.borderColor = '#2E3439';
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: B.teal,
                      marginBottom: 4,
                    }}
                  >
                    🆕 I'm starting a new program
                  </div>
                  <div
                    style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}
                  >
                    EM was just assigned to me, or I'm building from the ground
                    up. I need guidance on what to do and where to start.
                  </div>
                </button>
                <button
                  onClick={() => {
                    setPath('existing');
                    setStep(1);
                  }}
                  style={{
                    background:
                      path === 'existing' ? 'rgba(194,150,74,0.12)' : '#252A2E',
                    border: `1px solid ${
                      path === 'existing' ? 'rgba(194,150,74,0.3)' : '#2E3439'
                    }`,
                    borderRadius: 12,
                    padding: '16px 20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = 'rgba(194,150,74,0.3)')
                  }
                  onMouseLeave={(e) => {
                    if (path !== 'existing')
                      e.currentTarget.style.borderColor = '#2E3439';
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#c2964a',
                      marginBottom: 4,
                    }}
                  >
                    📂 I have an existing program
                  </div>
                  <div
                    style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}
                  >
                    I already have plans, training records, and documents. I
                    want to organize them and track EMAP compliance.
                  </div>
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#f0f4fa',
                  marginBottom: 8,
                  letterSpacing: '-0.5px',
                }}
              >
                {path === 'new'
                  ? "You're not alone in this"
                  : "Let's organize what you have"}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#94a3b8',
                  lineHeight: 1.8,
                  marginBottom: 20,
                }}
              >
                {path === 'new'
                  ? 'Over half of local EM programs are managed by someone doing it as an additional duty. Planrr is built for exactly that — it walks you through every step so nothing falls through the cracks.'
                  : 'Most EM programs have documents scattered across drives, email, and filing cabinets. Planrr brings everything into one place and maps it to EMAP standards automatically.'}
              </div>
              <div
                style={{
                  background: '#252A2E',
                  borderRadius: 10,
                  padding: '16px 18px',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  {(path === 'new'
                    ? [
                        { n: '73', l: 'EMAP standards loaded' },
                        { n: '32', l: 'FEMA capabilities mapped' },
                        { n: '6', l: 'AI templates ready' },
                        { n: '∞', l: 'Guided coaching built in' },
                      ]
                    : [
                        { n: '📤', l: 'Bulk document upload' },
                        { n: '🤖', l: 'AI auto-maps to standards' },
                        { n: '📊', l: 'Instant gap analysis' },
                        { n: '📋', l: 'Evidence packaging' },
                      ]
                  ).map((s) => (
                    <div
                      key={s.l}
                      style={{ textAlign: 'center', padding: '10px' }}
                    >
                      <div
                        style={{ fontSize: 18, fontWeight: 800, color: B.teal }}
                      >
                        {s.n}
                      </div>
                      <div
                        style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}
                      >
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#f0f4fa',
                  marginBottom: 8,
                  letterSpacing: '-0.5px',
                }}
              >
                Plan → Build → Sustain
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#94a3b8',
                  lineHeight: 1.8,
                  marginBottom: 20,
                }}
              >
                Every EM program follows the same three phases. The sidebar
                groups your tools by function:
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {[
                  {
                    phase: 'Plan',
                    color: B.teal,
                    icon: '📋',
                    items: [
                      'Identify your hazards (THIRA)',
                      'Write your plans & SOPs',
                      'Map your partners',
                      'Inventory your resources',
                    ],
                  },
                  {
                    phase: 'Build',
                    color: '#c2964a',
                    icon: '🔨',
                    items: [
                      'Staff & credential your people',
                      'Train your team',
                      'Exercise your plans',
                      'Secure funding',
                    ],
                  },
                  {
                    phase: 'Sustain',
                    color: '#8B5CF6',
                    icon: '✅',
                    items: [
                      'Track EMAP standards',
                      'Build evidence packages',
                      'Maintain accreditation',
                    ],
                  },
                ].map((p) => (
                  <div
                    key={p.phase}
                    style={{
                      background: '#252A2E',
                      borderRadius: 10,
                      padding: '14px 18px',
                      borderLeft: `3px solid ${p.color}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{p.icon}</span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: p.color,
                        }}
                      >
                        {p.phase}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {p.items.map((i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 11,
                            color: '#94a3b8',
                            background: '#1C1F22',
                            padding: '3px 10px',
                            borderRadius: 6,
                          }}
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#f0f4fa',
                  marginBottom: 8,
                  letterSpacing: '-0.5px',
                }}
              >
                {path === 'new'
                  ? 'Your first 3 steps'
                  : 'Your fast-track setup'}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#94a3b8',
                  lineHeight: 1.8,
                  marginBottom: 20,
                }}
              >
                {path === 'new'
                  ? "Don't try to do everything at once. Here's exactly where to start:"
                  : "Here's the fastest way to get your existing program loaded:"}
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {(path === 'new'
                  ? [
                      {
                        n: '1',
                        title: 'Set up My Program',
                        desc: 'Enter your org name, jurisdiction, and contact info. Takes 2 minutes. This populates every document and report.',
                        where: 'settings',
                      },
                      {
                        n: '2',
                        title: 'Profile your hazards',
                        desc: 'Go to Hazard Analysis and list 3-5 threats your area faces. This is the foundation for everything else.',
                        where: 'thira',
                      },
                      {
                        n: '3',
                        title: 'Generate your first plan',
                        desc: 'Go to AI Tools → Doc Templates and generate a Strategic Plan. AI uses your org data to create a 70% starting point.',
                        where: 'templates',
                      },
                    ]
                  : [
                      {
                        n: '1',
                        title: 'Set up My Program',
                        desc: 'Enter your org name, jurisdiction, and contact info. Takes 2 minutes.',
                        where: 'settings',
                      },
                      {
                        n: '2',
                        title: 'Bulk upload your documents',
                        desc: 'Drop your EOP, COOP, AARs, MOUs, and training records into Bulk Doc Intake. AI maps them to EMAP standards.',
                        where: 'intake',
                      },
                      {
                        n: '3',
                        title: 'Review your gap analysis',
                        desc: 'Check the Dashboard and EMAP Standards to see where you stand. Focus on the gaps.',
                        where: 'dashboard',
                      },
                    ]
                ).map((s) => (
                  <div
                    key={s.n}
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      background: '#252A2E',
                      borderRadius: 10,
                      padding: '14px 18px',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${B.teal}, ${B.tealDark})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {s.n}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#f0f4fa',
                          marginBottom: 3,
                        }}
                      >
                        {s.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#94a3b8',
                          lineHeight: 1.6,
                        }}
                      >
                        {s.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#f0f4fa',
                  marginBottom: 8,
                  letterSpacing: '-0.5px',
                }}
              >
                You're ready to go
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#94a3b8',
                  lineHeight: 1.8,
                  marginBottom: 16,
                }}
              >
                Every section has a coaching guide that explains what it is, why
                it matters, and what to do first. Look for the teal guide
                banners as you go.
              </div>
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(27,201,196,0.1), rgba(194,150,74,0.1))',
                  borderRadius: 10,
                  padding: '16px 18px',
                  border: '1px solid #2E3439',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>💡</span>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: '#f0f4fa' }}
                  >
                    Pro tip
                  </span>
                </div>
                <div
                  style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}
                >
                  {path === 'new'
                    ? 'Follow the sidebar top to bottom. Each section builds on the one before it. The numbered steps (①-⑧) are your roadmap. Take it one section at a time.'
                    : "Start with Bulk Doc Intake to upload everything you have. Then check the Dashboard — it'll show you exactly where your gaps are and what to tackle next."}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>
                The guide banners can be dismissed any time. You can always find
                help in the AI Assistant.
              </div>
            </>
          )}

          {/* Navigation buttons */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 24,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              {step > 0 && (
                <button
                  onClick={() => setStep((p) => p - 1)}
                  style={{
                    background: 'none',
                    border: '1px solid #2E3439',
                    color: '#94a3b8',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Back
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {step < totalSteps && step > 0 && (
                <button
                  onClick={() => setStep((p) => p + 1)}
                  style={{
                    background: `linear-gradient(135deg, ${B.teal}, ${B.tealDark})`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    boxShadow: '0 2px 10px rgba(27,201,196,0.3)',
                  }}
                >
                  Continue
                </button>
              )}
              {step === totalSteps - 1 && <></>}
              {step >= 4 && (
                <button
                  onClick={() => {
                    setView(path === 'new' ? 'settings' : 'intake');
                    onDone();
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${B.teal}, ${B.tealDark})`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif",
                    boxShadow: '0 2px 10px rgba(27,201,196,0.3)',
                  }}
                >
                  {path === 'new'
                    ? 'Start with My Program →'
                    : 'Go to Bulk Upload →'}
                </button>
              )}
              <button
                onClick={onDone}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  padding: '8px 4px',
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
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
          background: `radial-gradient(circle,${B.teal}12,transparent 70%)`,
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
            AI-powered EM program management - EMAP accreditation, exercises &
            AARs, personnel credentialing, and operations in one place.
          </p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Label>Organization Name</Label>
          <FInput
            value={name}
            onChange={setName}
            placeholder="e.g. County Emergency Management"
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
              <option value="">Select...</option>
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
              <option value="">Select state...</option>
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
          Plan Smartr -
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   APP ROOT
------------------------------------------------------- */

/* --- FEEDBACK MODAL ---------------------------------- */
function FeedbackModal() {
  const [show, setShow] = useState(false);
  const [type, setType] = useState('bug');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  // Check display style via DOM (triggered by topbar button)
  useEffect(() => {
    const el = document.getElementById('planrr-feedback');
    if (el) {
      const obs = new MutationObserver(() =>
        setShow(el.style.display === 'flex')
      );
      obs.observe(el, { attributes: true, attributeFilter: ['style'] });
      return () => obs.disconnect();
    }
  }, []);
  const close = () => {
    document.getElementById('planrr-feedback').style.display = 'none';
    setSent(false);
    setText('');
  };
  const submit = async () => {
    if (!text.trim()) return;
    // Store in localStorage as simple feedback log
    const fb = JSON.parse(localStorage.getItem('planrr_feedback') || '[]');
    fb.push({
      id: uid(),
      type,
      text,
      ts: Date.now(),
      url: window.location.href,
    });
    localStorage.setItem('planrr_feedback', JSON.stringify(fb));
    setSent(true);
    setTimeout(close, 2000);
  };
  return (
    <div
      id="planrr-feedback"
      style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15,23,42,0.5)',
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '28px 32px',
          width: 440,
          maxWidth: 'calc(100vw - 40px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          fontFamily: 'DM Sans,sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: B.text }}>
            Send Feedback
          </div>
          <button
            onClick={close}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              color: B.faint,
            }}
          >
            x
          </button>
        </div>
        {sent ? (
          <div
            style={{
              textAlign: 'center',
              padding: '20px 0',
              color: B.green,
              fontWeight: 600,
            }}
          >
            Thank you! Feedback received.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[
                ['bug', 'Bug Report'],
                ['idea', 'Feature Idea'],
                ['praise', 'What Works Well'],
                ['other', 'Other'],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setType(v)}
                  style={{
                    flex: 1,
                    padding: '7px 4px',
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: `1px solid ${type === v ? B.teal : B.border}`,
                    background: type === v ? B.tealLight : '#f8fafc',
                    color: type === v ? B.tealDark : B.muted,
                    cursor: 'pointer',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <FTextarea
              value={text}
              onChange={setText}
              placeholder={
                type === 'bug'
                  ? 'Describe what happened and what you expected...'
                  : type === 'idea'
                  ? 'Describe the feature you would like to see...'
                  : type === 'praise'
                  ? "Tell us what's working well..."
                  : 'Your feedback...'
              }
              rows={4}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn label="Send Feedback" onClick={submit} primary />
              <Btn label="Cancel" onClick={close} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const pathView = location.pathname.replace(/^\/app\//, '').replace(/^\//, '') || 'dashboard';
  const view = VIEW_TITLES[pathView] ? pathView : 'dashboard';
  const setView = useCallback((v) => {
    navigate('/app/' + v);
  }, [navigate]);
  const [onboarding, setOnboarding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authed, setAuthed] = useState(() => {
    const status = isLoggedIn();
    return status === true || status === 'needs_refresh';
  });
  const [sessionExpired, setSessionExpired] = useState(false);
  const [firstRun, setFirstRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('planrr_sidebar_collapsed') === '1'; } catch { return false; }
  });
  const toggleCollapse = () => {
    setSidebarCollapsed(p => {
      const next = !p;
      try { localStorage.setItem('planrr_sidebar_collapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  };
  const saveTimer = useRef(null);
  const refreshTimer = useRef(null);

  useEffect(() => {
    if (!authed) return;
    const scheduleRefresh = () => {
      clearTimeout(refreshTimer.current);
      const exp = getTokenExpiry();
      const msUntilRefresh = Math.max((exp - Date.now()) - 60000, 5000);
      refreshTimer.current = setTimeout(async () => {
        const ok = await sbRefreshToken();
        if (ok) {
          scheduleRefresh();
        } else {
          setSessionExpired(true);
        }
      }, msUntilRefresh);
    };
    const init = async () => {
      const status = isLoggedIn();
      if (status === 'needs_refresh') {
        const ok = await sbRefreshToken();
        if (!ok) { setAuthed(false); return; }
      }
      scheduleRefresh();
    };
    init();
    return () => clearTimeout(refreshTimer.current);
  }, [authed]);

  useEffect(() => {
    if (!authed) {
      setLoaded(true);
      return;
    }
    loadData().then((d) => {
      if (d) {
        const stds = {};
        ALL_STANDARDS.forEach((s) => {
          stds[s.id] = d.standards?.[s.id] || initRecord();
        });
        const loaded = {
          ...initData(),
          ...d,
          standards: stds,
          employees: d.employees || [],
          grants: d.grants || [],
          thira: d.thira || { hazards: [], lastUpdated: '', nextDue: '' },
          capItems: d.capItems || [],
          activityLog: d.activityLog || [],
          journey: d.journey || {},
          incidents: d.incidents || [],
        };
        const synced = syncStandardsFromOps(loaded);
        if (synced) loaded.standards = synced;
        setData(loaded);
        if (!d.orgName) setOnboarding(true);
        else if (!d.welcomeDismissed) setFirstRun(true);
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
  }, [authed]);
  const updateData = useCallback((updater) => {
    setData((prev) => {
      const next =
        typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const synced = syncStandardsFromOps(next);
      const final = synced ? { ...next, standards: synced } : next;
      const autoLog = [];
      const track = [
        ['training', 'training', 'Training record'],
        ['exercises', 'exercises', 'Exercise'],
        ['partners', 'partners', 'Partner agreement'],
        ['plans', 'plans', 'Plan'],
        ['employees', 'employees', 'Personnel record'],
        ['resources', 'resources', 'Resource'],
      ];
      track.forEach(([key, mod, label]) => {
        const pLen = (prev[key] || []).length;
        const nLen = (final[key] || []).length;
        if (nLen > pLen) autoLog.push({ type: 'created', module: mod, detail: `${label} added (${nLen} total)` });
        else if (nLen < pLen) autoLog.push({ type: 'deleted', module: mod, detail: `${label} removed (${nLen} total)` });
      });
      if (autoLog.length > 0 && final.activityLog) {
        const entries = autoLog.map(a => ({ id: uid(), ts: Date.now(), ...a }));
        final.activityLog = [...entries, ...final.activityLog].slice(0, 200);
      }
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveData(final), 500);
      return final;
    });
  }, []);
  // Update document title on view change
  useEffect(() => {
    const title = VIEW_TITLES[view] || 'Dashboard';
    document.title = `${title} | planrr.app`;
  }, [view]);
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
  const [authMode, setAuthMode] = useState(null); // null | "login" | "signup"
  if (!authed)
    return (
      <>
        <LandingPage
          onLogin={() => setAuthMode('login')}
          onSignup={() => setAuthMode('signup')}
          onBuy={() => setAuthMode('signup')}
          onBuyPlan={(planId) => {
            sessionStorage.setItem('planrr_pending_plan', planId);
            setAuthMode('signup');
          }}
        />
        {authMode && (
          <>
            <div
              onClick={() => setAuthMode(null)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15,17,19,0.75)', backdropFilter: 'blur(6px)',
                zIndex: 200, cursor: 'pointer',
              }}
            />
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)', zIndex: 201,
              width: 440, maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 40px)', overflowY: 'auto',
              animation: 'fadeUp 0.25s ease',
            }}>
              <AuthScreen
                onAuth={() => {
                  setLoaded(false);
                  setAuthed(true);
                  setAuthMode(null);
                  const pendingPlan = sessionStorage.getItem('planrr_pending_plan');
                  if (pendingPlan) {
                    sessionStorage.removeItem('planrr_pending_plan');
                    const link = STRIPE_BUY_LINKS[pendingPlan];
                    if (link) {
                      try {
                        const s = JSON.parse(localStorage.getItem('sb_session') || '{}');
                        const email = s?.user?.email || '';
                        const url = email ? `${link}?prefilled_email=${encodeURIComponent(email)}` : link;
                        window.location.href = url;
                      } catch {
                        window.location.href = link;
                      }
                      return;
                    }
                  }
                  navigate('/app/dashboard');
                }}
                initialMode={authMode}
                onClose={() => setAuthMode(null)}
              />
            </div>
          </>
        )}
      </>
    );
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
          Loading your program...
        </div>
      </div>
    );
  if (onboarding)
    return <Onboarding onComplete={handleOnboard} />;
  const checkoutSuccess = new URLSearchParams(window.location.search).get('checkout') === 'success';
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800;9..40,900&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}:focus-visible{outline:2px solid #1BC9C4;outline-offset:2px;border-radius:4px}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:${B.bg};}::-webkit-scrollbar-thumb{background:#cdd6da;border-radius:3px;}#planrr-sidebar ::-webkit-scrollbar{width:4px;}#planrr-sidebar ::-webkit-scrollbar-track{background:transparent;}#planrr-sidebar ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}#planrr-sidebar ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.2);}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes typingDot{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-3px);opacity:1}}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@media print{#planrr-sidebar{display:none!important}#planrr-topbar{display:none!important}#planrr-main{margin-left:0!important}}@media(max-width:1024px){#planrr-sidebar{position:fixed!important;left:-260px!important;transition:left 0.25s ease!important;z-index:100!important}#planrr-sidebar.open{left:0!important}#planrr-main{margin-left:0!important}.planrr-menu-toggle{display:flex!important}.planrr-sidebar-overlay{display:block!important}}@media(max-width:768px){.planrr-pricing-grid{grid-template-columns:1fr!important}.planrr-features-grid{grid-template-columns:1fr!important}.planrr-stats-strip{grid-template-columns:repeat(2,1fr)!important}.planrr-security-grid{grid-template-columns:1fr!important}.planrr-landing-header{padding:14px 16px!important}.planrr-landing-hero{padding:48px 20px 40px!important}.planrr-landing-section{padding:48px 20px!important}}@media(max-width:480px){.planrr-stats-strip{grid-template-columns:1fr!important}}`}</style>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
            display: 'none',
          }}
          className="planrr-sidebar-overlay"
        />
      )}
      <div id="planrr-sidebar" className={sidebarOpen ? 'open' : ''} style={sidebarCollapsed ? { width: 64 } : undefined}>
        <Sidebar
          view={view}
          setView={(v) => { setView(v); setSidebarOpen(false); }}
          data={data}
          notifCount={notifications.length}
          orgName={data.orgName}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
          onEditOrg={() => {
            const n = prompt('Organization name:', data.orgName);
            if (n) updateData((p) => ({ ...p, orgName: n }));
          }}
        />
      </div>
      <div
        id="planrr-main"
        style={{
          marginLeft: sidebarCollapsed ? 64 : 244,
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          transition: 'margin-left 0.2s ease',
        }}
      >
        <div
          id="planrr-topbar"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(240,244,245,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid rgba(226,232,234,0.8)`,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            gap: 12,
          }}
        >
          <button
            className="planrr-menu-toggle"
            onClick={() => setSidebarOpen((p) => !p)}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: B.text,
              padding: 4,
              marginRight: 4,
            }}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div
            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 13, color: B.faint, fontWeight: 500 }}>
              {data.orgName && (
                <>
                  <span style={{ color: B.text, fontWeight: 700 }}>
                    {data.orgName}
                  </span>
                  <span style={{ margin: '0 8px', color: '#d1d5db' }}>/</span>
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
              {view === 'plans' && 'Plans & SOPs'}
              {view === 'resources' && 'Resources'}
              {view === 'employees' && 'Personnel'}
              {view === 'calendar' && 'Program Calendar'}
              {view === 'reports' && 'Compliance Report'}
              {view === 'assistant' && 'AI Assistant'}
              {view === 'grants' && 'Grants & Funding'}
              {view === 'thira' && 'Hazard Analysis'}
              {view === 'cap' && 'Corrective Action Program'}
              {view === 'activity' && 'Activity Log'}
              {view === 'settings' && 'My Program'}
              {view === 'templates' && 'Document Templates'}
              {view === 'evidence' && 'Evidence Export'}
              {view === 'recovery' && 'Recovery Planning'}
              {view === 'mutualaid' && 'Mutual Aid Map'}
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
              -K
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
              fontSize: 11,
              color: B.faint,
              background: 'none',
              border: '1px solid ' + B.border,
              borderRadius: 7,
              padding: '4px 10px',
              cursor: 'pointer',
              marginLeft: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = B.red;
              e.currentTarget.style.color = B.red;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = B.border;
              e.currentTarget.style.color = B.faint;
            }}
          >
            Sign out
          </button>
        </div>
        {checkoutSuccess && (
          <div style={{
            background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8,
            padding: '12px 20px', margin: '8px 32px 0', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#065F46', marginBottom: 2 }}>Welcome to planrr.app!</div>
              <div style={{ fontSize: 12, color: '#047857' }}>Your subscription is active with a 14-day free trial. Start building your program.</div>
            </div>
            <button onClick={() => { window.history.replaceState({}, '', window.location.pathname); window.location.reload(); }} style={{
              background: B.teal, color: '#fff', border: 'none', borderRadius: 6,
              padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>Got it</button>
          </div>
        )}
        {sessionExpired && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8,
            padding: '10px 20px', margin: '8px 32px 0', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <span style={{ fontSize: 13, color: '#92400e' }}>
              Your session has expired. Please sign in again to continue syncing your data.
            </span>
            <button onClick={() => { sbSignOut(); }} style={{
              background: GOLD, color: '#141719', border: 'none', borderRadius: 6,
              padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>Sign In Again</button>
          </div>
        )}
        <div
          style={{
            animation: 'fadeUp 0.3s ease',
            maxWidth: 1400,
            width: '100%',
            alignSelf: 'center',
            flex: 1,
          }}
        >
          {view === 'journey' && (
            <AccreditationJourney
              data={data}
              updateData={updateData}
              setView={setView}
            />
          )}
          {view === 'dashboard' && (
            <Dashboard data={data} setView={setView} orgName={data.orgName} updateData={updateData} />
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
          {view === 'templates' && (
            <DocTemplatesView data={data} orgName={data.orgName} />
          )}
          {view === 'evidence' && (
            <EvidenceExportView data={data} orgName={data.orgName} />
          )}
          {view === 'recovery' && (
            <RecoveryPlanningView data={data} setData={updateData} />
          )}
          {view === 'mutualaid' && (
            <MutualAidView data={data} setData={updateData} />
          )}
        </div>
        {firstRun && !onboarding && (
          <FirstRunWelcome
            onDone={() => {
              setFirstRun(false);
              updateData({ welcomeDismissed: true });
            }}
            setView={setView}
          />
        )}
        <FeedbackModal />

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

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/report" element={<SharedReport />} />
        <Route path="/founder" element={<Founder />} />
        <Route path="/app/*" element={<AppInner />} />
        <Route path="/*" element={<AppInner />} />
      </Routes>
    </ErrorBoundary>
  );
}
