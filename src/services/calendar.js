function formatICalDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function buildEvent(summary, date, description, uid) {
  const dtStart = formatICalDate(date);
  if (!dtStart) return '';
  const dtEnd = dtStart;
  return [
    'BEGIN:VEVENT',
    `UID:${uid}@planrr.app`,
    `DTSTART;VALUE=DATE:${dtStart.slice(0, 8)}`,
    `DTEND;VALUE=DATE:${dtStart.slice(0, 8)}`,
    `SUMMARY:${summary.replace(/[,;\\]/g, ' ')}`,
    description ? `DESCRIPTION:${description.replace(/\n/g, '\\n').replace(/[,;\\]/g, ' ').slice(0, 200)}` : '',
    'END:VEVENT',
  ].filter(Boolean).join('\r\n');
}

export function generateICalFromData(data) {
  const events = [];
  (data.exercises || []).forEach((ex) => {
    if (ex.date) {
      events.push(buildEvent(
        `[Exercise] ${ex.name}`,
        ex.date,
        `Type: ${ex.type}. ${ex.objectives || ''}`,
        `ex-${ex.id}`
      ));
    }
  });
  (data.partners || []).forEach((p) => {
    if (p.expDate) {
      events.push(buildEvent(
        `[MOU Expires] ${p.name}`,
        p.expDate,
        `Partner agreement expiration. Review and renew.`,
        `mou-${p.id}`
      ));
    }
  });
  (data.training || []).forEach((t) => {
    if (t.date) {
      events.push(buildEvent(
        `[Training] ${t.type} — ${t.person}`,
        t.date,
        t.notes || '',
        `tr-${t.id}`
      ));
    }
  });
  (data.plans || []).forEach((p) => {
    if (p.nextReview) {
      events.push(buildEvent(
        `[Plan Review Due] ${p.name}`,
        p.nextReview,
        `Scheduled review for ${p.name}`,
        `plan-${p.id}`
      ));
    }
  });
  const cal = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//planrr.app//PLANRR//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${data.orgName || 'planrr'} — EM Program`,
    ...events.filter(Boolean),
    'END:VCALENDAR',
  ].join('\r\n');
  return cal;
}

export function downloadICal(data) {
  const cal = generateICalFromData(data);
  const blob = new Blob([cal], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(data.orgName || 'planrr').replace(/\s+/g, '_')}_program.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
