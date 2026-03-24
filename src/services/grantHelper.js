export function buildGrantNarrativePrompt(data, grantType) {
  const overall = { compliant: 0, total: 0 };
  Object.values(data.standards || {}).forEach(s => {
    overall.total++;
    if (s.status === 'compliant') overall.compliant++;
  });

  const ctx = {
    org: data.orgName || 'Unknown',
    jurisdiction: data.jurisdiction || '',
    state: data.state || '',
    emName: data.emName || '',
    emTitle: data.emTitle || '',
    compliance: `${overall.compliant}/${overall.total}`,
    training: (data.training || []).length,
    exercises: (data.exercises || []).length,
    partners: (data.partners || []).length,
    plans: (data.plans || []).map(p => p.name).join(', ') || 'none',
    hazards: (data.thira?.hazards || []).map(h => h.name).join(', ') || 'none',
    employees: (data.employees || []).length,
  };

  const prompts = {
    empg: `Write an EMPG (Emergency Management Performance Grant) narrative for ${ctx.org} (${ctx.jurisdiction}, ${ctx.state}).

Program data:
- EM Director: ${ctx.emName}, ${ctx.emTitle}
- EMAP Compliance: ${ctx.compliance} standards
- Personnel: ${ctx.employees}
- Training records: ${ctx.training}
- Exercises completed: ${ctx.exercises}
- Partner agreements: ${ctx.partners}
- Plans: ${ctx.plans}
- Hazards profiled: ${ctx.hazards}

Write a complete EMPG narrative including:
1. PROGRAM OVERVIEW — Describe the EM program, jurisdiction served, population, and organizational structure
2. CAPABILITY ASSESSMENT — Current capabilities aligned to FEMA core capabilities
3. PROPOSED ACTIVITIES — What the grant will fund (align to EMPG allowable costs: planning, training, exercises, equipment)
4. SUSTAINABILITY PLAN — How the program will sustain after the grant period
5. PERFORMANCE MEASURES — Measurable outcomes tied to EMAP standards

Use the actual program data provided. Flag [CUSTOMIZE] where specific details are needed.`,

    hsgp: `Write an HSGP (Homeland Security Grant Program) investment justification for ${ctx.org}.

Program context: ${ctx.compliance} EMAP standards compliant, ${ctx.exercises} exercises, ${ctx.hazards} hazards profiled.

Include:
1. INVESTMENT DESCRIPTION — What the investment will accomplish
2. NEED — Gap analysis based on THIRA/SPR data
3. IMPACT — How this investment addresses the identified gap
4. FUNDING & IMPLEMENTATION PLAN — Budget categories, timeline
5. SUSTAINABILITY — Long-term maintenance plan

Use FEMA investment justification format.`,

    general: `Write a grant application narrative for ${ctx.org} (${ctx.jurisdiction}, ${ctx.state}).

Program overview: ${ctx.emName} manages ${ctx.compliance} EMAP-compliant standards, ${ctx.exercises} exercises, ${ctx.training} training records, ${ctx.partners} partner agreements.

Write a compelling narrative that demonstrates program need, current capabilities, proposed use of funds, and expected outcomes. Reference EMAP standards and FEMA doctrine where appropriate.`,
  };

  return prompts[grantType] || prompts.general;
}
