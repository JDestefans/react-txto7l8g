const SB_URL =
  process.env.REACT_APP_SUPABASE_URL ||
  'https://ltnbvwnhtsaebyslbhil.supabase.co';

/* --- AI MODEL ROUTING --------------------------------
   Routes tasks to appropriate model tiers to control cost:
   - 'fast'   → cheaper model for simple tasks (summaries, short drafts, label lookups)
   - 'strong' → capable model for complex reasoning (gap analysis, doc interpretation, multi-step)
   getModelTier(operation) maps operation strings to tiers.
   The tier is sent as `model_tier` in the request body so the
   backend Edge Function can select the right vendor model.
-------------------------------------------------------- */
export const MODEL_TIER_MAP = {
  general: 'fast',
  draft_rationale: 'fast',
  draft_aar: 'fast',
  exec_summary: 'fast',
  training_needs: 'fast',
  grant_guidance: 'fast',
  interpret: 'strong',
  evidence: 'strong',
  action_plan: 'strong',
  interpret_doc: 'strong',
  bulk_intake: 'strong',
  gap_analysis: 'strong',
  finalize_aar: 'strong',
  thira_analysis: 'strong',
  spr_generation: 'strong',
  template_gen: 'strong',
};

export function getModelTier(operation) {
  return MODEL_TIER_MAP[operation] || 'fast';
}

export async function callAI(system, prompt, onChunk, operation) {
  const op = operation || 'general';
  const tier = getModelTier(op);
  const res = await fetch(
    SB_URL + '/functions/v1/ai-proxy',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

export async function callAIWithDoc(system, textBefore, fileData, onChunk) {
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
      headers: { 'Content-Type': 'application/json' },
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
export const DOC_MAPPING_CACHE_KEY = 'planrr_doc_mapping_cache';

export function getDocMappingCache() {
  try {
    return JSON.parse(localStorage.getItem(DOC_MAPPING_CACHE_KEY) || '{}');
  } catch { return {}; }
}

export function setDocMappingCache(hash, result) {
  const cache = getDocMappingCache();
  cache[hash] = { result, ts: Date.now() };
  const keys = Object.keys(cache);
  if (keys.length > 50) {
    const oldest = keys.sort((a, b) => cache[a].ts - cache[b].ts);
    oldest.slice(0, keys.length - 50).forEach(k => delete cache[k]);
  }
  localStorage.setItem(DOC_MAPPING_CACHE_KEY, JSON.stringify(cache));
}

export function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return 'dh_' + Math.abs(h).toString(36);
}

export function textSimilarity(a, b) {
  const wa = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wb = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  let overlap = 0;
  wa.forEach(w => { if (wb.has(w)) overlap++; });
  return overlap / Math.max(wa.size, wb.size, 1);
}

export async function mapDocToEMAP(docText, allStandards, onStatus) {
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

export const SYS =
  'You are an EMAP accreditation and emergency management expert in PLANRR - Plan Smartr. Deep expertise in EMAP EMS 5-2022, HSEEP, and EM program management. Be specific, practical, and concise. No markdown headers.';
