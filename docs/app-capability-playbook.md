# planrr.app Capability Playbook

This document is your operator-level guide to what planrr.app can do and how to explain it confidently to agency leaders, partners, and buyers.

---

## 1) Platform Positioning (How to describe planrr in one sentence)

planrr.app is an emergency management operating system that unifies daily operations, mission continuity, workforce readiness, risk/compliance evidence, and executive reporting in one workflow-driven platform.

### Short positioning options

- **Executive:** "We run our emergency management program from one system instead of spreadsheets, folders, and disconnected tools."
- **Operational:** "planrr connects plans, people, training, exercises, partner agreements, and corrective actions so nothing critical falls through."
- **Procurement:** "It reduces operational risk while producing assessor-ready evidence for EMAP, HSEEP, and grant reporting."

---

## 2) Core Outcome Areas

Use these as your anchor points in demos and conversations.

### A. Program Visibility and Control

- Unified dashboard with cross-module metrics.
- Readiness indicators across standards, training, exercises, plans, and corrective actions.
- Notifications for expiring agreements, overdue reviews, incomplete governance metadata, and inactive controls.

### B. Operational Discipline (not just documentation)

- Corrective-action loop from finding to owner to due date to closure.
- Plan lifecycle management with review cycles and governance controls.
- Partner workflows and scoped document collaboration with approval gatekeeping.

### C. Mission Continuity Readiness

- COOP-specific continuity controls in structured data (not buried in PDFs).
- Essential functions and RTO register.
- Succession validation depth and vacancy/inactive designee signal.
- Devolution triggers/procedures and alternate facility records.
- COOP exercise evidence linkage to continuity records.

### D. Workforce and Qualification Readiness

- Personnel profiles with credentials, expirations, task books, and training history.
- Position-based training requirement matrix tied to personnel and records.
- Clear role-level completion state (green/red style logic via requirement matching).

### E. Accreditation, Grants, and Evidence Readiness

- EMAP standards tracking and evidence mapping.
- Assessor package/readiness builder.
- One-click evidence export by standard and by section.
- Full application package export with cover metadata and linked operational evidence.

---

## 3) Module-by-Module Capability Breakdown

### 3.1 Landing + Brand Surface

- Positioning for platform-level value (operations + continuity + readiness + reporting).
- Product proof blocks and trust strip.
- Structured path from awareness to trial CTA.

### 3.2 Authentication and Access Controls

- Email/password authentication via Supabase.
- MFA-enforcement path support.
- SSO-domain enforcement path support.
- User/session management with refresh handling and expiration detection.

### 3.3 Program Control / Settings

- Team governance and member role controls.
- Security control settings (MFA, SSO toggles).
- Integration configuration (webhooks/calendar sync settings).
- Secure report-sharing controls (tokenized links, expiry/revocation/passcode support in share service + shared report view).

### 3.4 Standards and Compliance Engine

- Track status per EMAP standard.
- Attach evidence documents and rationale notes.
- Assign ownership and due states.
- Section-level aggregation and compliance rollups.

### 3.5 Plan Library (major operational module)

- Plan records by type (EOP, COOP, COG, etc.).
- Versioning and lifecycle state.
- Plan-level document attachments.
- Review and due-date tracking.
- Partner safeguard controls for plan signoff workflows.
- Scoped external collaboration:
  - Invite collaborator to single plan.
  - Permission controls (comment-only vs propose-updates).
  - Request capture (comment/update proposals).
  - Author approval/reject action.
  - History trail of collaboration decisions.

### 3.6 Mission Continuity Controls (COOP depth)

- Governance metadata required for robust plan management:
  - Approving authority
  - Approval date
  - Approval signature/attestation
  - Review cycle months
  - Last review evidence note
  - Review history log entry
- Essential Functions Register:
  - Function name
  - Owner
  - RTO (hours)
  - Notes
- Succession Chain Validation:
  - Role mapping
  - Primary + successor 1 + successor 2
  - Delegation reference
  - Automatic vacancy/inactive signal logic based on assignment depth + employee status
- Devolution Triggers and Procedures:
  - Trigger condition
  - Decision authority
  - Relocation site
  - Procedure summary
- Alternate Facility Record:
  - Address
  - Capacity
  - Activation contact
  - Technology profile
  - Tested status + last test date
- COOP exercise evidence tracking:
  - Exercise record can link to COOP plan.
  - When qualifying exercise reaches completed/aar states, COOP continuity fields auto-update with evidence date/reference.

### 3.7 Employees and Credentials

- Personnel records with role/title/department/contact.
- Credential management including expiration monitoring.
- FEMA task books and qualification workflow support.
- COOP continuity role assignment per person (critical for succession/training logic).

### 3.8 Training Manager

- Training records per person/course/date/hours/cert/docs.
- Search/filter and notes/attachments.
- AI-generated training needs assessment.
- Position-to-requirement matrix:
  - Role-based required course set.
  - Training/credential matching against assigned personnel.
  - Per-role completion summary and gaps.

### 3.9 Exercise and Incident Manager

- Distinct workflows for exercises and real incidents.
- HSEEP type support, objectives, participant and evaluator inputs.
- AAR draft/final generation support.
- Corrective actions linked from evaluation outputs.
- COOP exercise type support.
- COOP plan linkage field on exercise overview.

### 3.10 Partner and Mutual Aid Management

- Partner/agency registry.
- Agreement metadata and expiration signals.
- Mutual aid mapping by resource category.
- Coverage matrix to identify resource support gaps.

### 3.11 Risk / THIRA / Recovery / Resources / Grants

- Hazard profiling and risk context.
- Recovery priority tracking.
- Resource inventory and capability data.
- Grants tracking with active status and deliverables context.

### 3.12 Reporting + Package Builder + Evidence Export

- Leadership-ready compliance report output.
- Accreditation package builder readiness checks.
- Final review status across key operational controls.
- Standard-level evidence package export (text bundle).
- EMAP application package export (JSON bundle) including:
  - Cover sheet metadata
  - Standards evidence map
  - Training role matrix
  - COOP continuity evidence summary

---

## 4) AI and SAGE Capabilities (How to explain responsibly)

SAGE is a context-aware emergency management assistant embedded in workflows.

### What it does well

- Uses program context to prioritize operational and compliance work.
- Assists with structured drafting (AARs, template documents, summaries).
- Highlights probable gaps using available data.

### How to phrase claims safely

- Say: "SAGE helps us identify likely gaps and prioritize next actions using our program data."
- Avoid: "SAGE guarantees compliance/accreditation outcomes."

### Practical buyer-safe language

"SAGE accelerates analysis and drafting; agency staff remain the decision-makers and approvers."

---

## 5) Conversation Script (Talk track you can use live)

### 30-second version

"planrr is how we run emergency management as an operating system, not a filing cabinet. It connects plans, personnel, training, exercises, partner agreements, continuity controls, and corrective actions in one place. We get daily operational visibility, and when we need assessor or executive evidence, exports are already mapped and ready."

### 2-minute demo story

1. Show dashboard/readiness and active notifications.
2. Open a COOP plan:
   - Show governance controls and review evidence.
   - Show essential functions/RTO, succession depth, devolution triggers, alternate facility.
3. Open exercises:
   - Show COOP Exercise type + linked COOP plan.
4. Open training:
   - Show role-based matrix and who is missing which requirement.
5. Open evidence export:
   - Show standard evidence and application package export.

Close with: "This is operational resilience and evidence readiness in the same workflow."

---

## 6) Common Questions and Strong Answers

### "Is this just an accreditation tool?"
No. Accreditation outputs are a result. The core value is daily operational readiness, continuity execution, and managed improvement loops.

### "How does this help in an actual disruption?"
The continuity records are structured and searchable: essential functions, who is in charge, who succeeds them, where operations move, and how activation is triggered.

### "How do you prove training by role?"
Role assignments in personnel + required course matrix + completed training/credential records generate explicit role-level completion evidence.

### "How do we avoid stale plans?"
Governance fields and review-cycle logic create visible reminders and compliance gaps when review metadata is missing or overdue.

### "How do we show a complete evidence chain?"
Evidence exports include mapped standards, linked operational records, rationale context, and package-level aggregation.

---

## 7) Value Framing by Audience

### Emergency Manager

- "Know what to fix today."
- "Close findings before they repeat."
- "Stop maintaining disconnected trackers."

### Executive Leadership

- "Operational risk is visible and measurable."
- "Readiness and accountability improve without adding admin burden."

### Procurement / Finance

- "One platform replaces fragmented manual processes."
- "Improves auditability and reduces avoidable compliance rework."

### Assessors / External Reviewers

- "Structured, traceable evidence chain."
- "Consistency from planning through corrective action closure."

---

## 8) Suggested Demo Data Checklist (for polished presentations)

Before important demos, ensure the environment has:

- At least one COOP plan with:
  - Governance fields complete
  - 2+ essential functions
  - 1+ succession role fully populated
  - 1+ devolution trigger
  - Alternate facility record complete
- One COOP exercise linked and marked complete.
- 4–6 employees with role assignments and mixed active/inactive status.
- Training records that show both complete and incomplete role requirements.
- At least 1 exported evidence package and 1 application package sample.

---

## 9) Optional Messaging Upgrade Ideas

If you want to go even further later, you can add:

- A formal "Operations OS for Emergency Management" brand line everywhere.
- A dedicated "Mission Continuity" page with scenario walkthroughs.
- A downloadable one-pager and buyer deck generated from this playbook.

---

Use this playbook as your single source when talking to buyers, leadership, or implementation partners.
