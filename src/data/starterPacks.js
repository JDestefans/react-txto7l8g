export const STARTER_PACKS = {
  solo_county: {
    id: 'solo_county',
    name: 'County OES — Solo Director',
    description: 'Pre-built program for a 1-person county emergency management office. Includes starter plans, exercise schedule, and training priorities.',
    plans: [
      { id: 'eop_1', name: 'Emergency Operations Plan (EOP)', type: 'EOP', status: 'draft', lastReview: '', nextReview: '', notes: 'Core plan required by EMAP 4.5. Start with hazard-specific annexes for your top 3 threats.' },
      { id: 'coop_1', name: 'Continuity of Operations Plan (COOP)', type: 'COOP', status: 'draft', lastReview: '', nextReview: '', notes: 'Required by EMAP 4.4. Focus on essential functions, orders of succession, and alternate facilities.' },
      { id: 'comms_1', name: 'Crisis Communications Plan', type: 'Communications', status: 'draft', lastReview: '', nextReview: '', notes: 'Public information procedures, media contacts, social media protocols.' },
      { id: 'train_1', name: 'Multi-Year Training & Exercise Plan (MYTEP)', type: 'Training', status: 'draft', lastReview: '', nextReview: '', notes: 'HSEEP-aligned progressive exercise schedule. Start with discussion-based, work toward full-scale over 3 years.' },
      { id: 'recov_1', name: 'Disaster Recovery Plan', type: 'Recovery', status: 'draft', lastReview: '', nextReview: '', notes: 'Short, intermediate, and long-term recovery phases per EMAP 4.5.4.' },
    ],
    exercises: [
      { id: 'ex_1', name: 'Tabletop Exercise — Severe Weather', type: 'Tabletop', date: '', objectives: 'Test severe weather notification procedures and EOC activation criteria.', scenario: 'Major winter storm with extended power outages affecting rural communities.', participants: '', aarDraft: '', aarFinal: '', status: 'planned', corrective: [], strengths: [], afis: [] },
      { id: 'ex_2', name: 'Workshop — EOC Activation Procedures', type: 'Workshop', date: '', objectives: 'Review and update EOC activation levels and staffing requirements.', scenario: '', participants: '', aarDraft: '', aarFinal: '', status: 'planned', corrective: [], strengths: [], afis: [] },
    ],
    training: [
      { id: 'tr_1', person: 'EM Director', type: 'IS-100.c — Introduction to ICS', date: '', status: 'planned', notes: 'NIMS requirement — complete within first year' },
      { id: 'tr_2', person: 'EM Director', type: 'IS-200.c — ICS for Single Resources', date: '', status: 'planned', notes: 'NIMS requirement' },
      { id: 'tr_3', person: 'EM Director', type: 'IS-700.b — NIMS Introduction', date: '', status: 'planned', notes: 'NIMS requirement' },
      { id: 'tr_4', person: 'EM Director', type: 'IS-800.d — National Response Framework', date: '', status: 'planned', notes: 'NIMS requirement' },
      { id: 'tr_5', person: 'EM Director', type: 'G-191 — ICS/EOC Interface', date: '', status: 'planned', notes: 'EMAP-recommended for EOC operations' },
      { id: 'tr_6', person: 'EM Director', type: 'FEMA Master Exercise Practitioner (MEP)', date: '', status: 'planned', notes: 'HSEEP exercise design — essential for 1-person shops running their own exercises' },
    ],
  },
  municipal_small: {
    id: 'municipal_small',
    name: 'Municipal EM — Small City/Town',
    description: 'Starter program for a small municipal EM office. Focused on the most critical plans and exercises for city-level operations.',
    plans: [
      { id: 'eop_1', name: 'City Emergency Operations Plan', type: 'EOP', status: 'draft', lastReview: '', nextReview: '', notes: 'Coordinate with county and neighboring jurisdictions.' },
      { id: 'coop_1', name: 'COOP — City Government', type: 'COOP', status: 'draft', lastReview: '', nextReview: '', notes: 'Essential city services, IT recovery, alternate work sites.' },
      { id: 'evac_1', name: 'Evacuation Plan', type: 'Evacuation', status: 'draft', lastReview: '', nextReview: '', notes: 'Routes, shelters, special needs populations, transportation resources.' },
      { id: 'comms_1', name: 'Emergency Communications Plan', type: 'Communications', status: 'draft', lastReview: '', nextReview: '', notes: 'Alert systems, interoperable communications, public notification.' },
    ],
    exercises: [
      { id: 'ex_1', name: 'Tabletop — Active Threat', type: 'Tabletop', date: '', objectives: 'Test multi-department response coordination for active threat scenario.', scenario: 'Active threat at city facility during business hours.', participants: '', aarDraft: '', aarFinal: '', status: 'planned', corrective: [], strengths: [], afis: [] },
    ],
    training: [
      { id: 'tr_1', person: 'EM Coordinator', type: 'IS-100.c — Introduction to ICS', date: '', status: 'planned', notes: '' },
      { id: 'tr_2', person: 'EM Coordinator', type: 'IS-700.b — NIMS Introduction', date: '', status: 'planned', notes: '' },
      { id: 'tr_3', person: 'EM Coordinator', type: 'IS-235.c — Emergency Planning', date: '', status: 'planned', notes: 'Particularly relevant for plan development' },
    ],
  },
};

export function applyStarterPack(currentData, packId) {
  const pack = STARTER_PACKS[packId];
  if (!pack) return currentData;
  return {
    ...currentData,
    plans: [...(currentData.plans || []), ...pack.plans],
    exercises: [...(currentData.exercises || []), ...pack.exercises],
    training: [...(currentData.training || []), ...pack.training],
  };
}
