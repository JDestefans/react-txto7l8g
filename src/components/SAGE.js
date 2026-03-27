import React, { useState, useRef, useEffect } from 'react';

const TEAL = '#3ECFCF';
const GOLD = '#C49A3C';

/*
  AIPartner — Conversational AI planning partner
  
  Props:
    title        - e.g. "EOP Builder", "AAR Builder"
    icon         - emoji for the header
    systemPrompt - base system prompt for this conversation type
    orgContext   - string with org data to inject
    initialMessage - AI's opening question/greeting
    onComplete   - callback(result) when conversation produces a final document
    onClose      - close the partner panel
    completeLabel - button text for "Generate Final Document"
*/
export default function SAGE({ title, icon, systemPrompt, orgContext, initialMessage, onComplete, onClose, completeLabel }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialMessage || `Let's build this together. I'll ask you questions about your program and we'll develop this step by step.\n\nReady to start?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const endRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  const SB_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ltnbvwnhtsaebyslbhil.supabase.co';
  const SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bmJ2d25odHNhZWJ5c2xiaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTk0NDYsImV4cCI6MjA4OTU5NTQ0Nn0.VrfVyQPiWzVo7VpQJtRyKQgNBtoq3Du-uGCAGsH815c';

  const callAIStream = async (system, prompt, onChunk) => {
    const res = await fetch(SB_URL + '/functions/v1/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SB_KEY },
      body: JSON.stringify({ operation: 'general', model_tier: 'fast', stream: true, system, prompt, max_tokens: 1200 }),
    });
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
  };

  const buildTranscript = () => messages.map(m =>
    `${m.role === 'user' ? 'EM Director' : 'SAGE'}: ${m.content}`
  ).join('\n');

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    const hist = [...messages, { role: 'user', content: msg }];
    setMessages(hist);
    setLoading(true);
    try {
      let r = '';
      setMessages(p => [...p, { role: 'assistant', content: '' }]);
      const sys = `${systemPrompt}\n\nORGANIZATION CONTEXT:\n${orgContext}\n\nINSTRUCTIONS: You are a collaborative AI planning partner. Ask focused questions one at a time. Build on their answers. When you have enough information for a section, summarize what you've captured and move to the next topic. Be conversational but professional. Keep responses concise. Do not generate the full document yet — that happens when the user clicks "Generate."`;
      await callAIStream(sys,
        buildTranscript() + '\nEM Director: ' + msg + '\nSAGE:',
        (chunk) => {
          r += chunk;
          setMessages(p => {
            const n = [...p];
            n[n.length - 1] = { role: 'assistant', content: r };
            return n;
          });
        }
      );
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
  };

  const generateFinal = async () => {
    setGenerating(true);
    try {
      let result = '';
      const sys = `${systemPrompt}\n\nORGANIZATION CONTEXT:\n${orgContext}`;
      const prompt = `Based on this planning conversation, generate the complete, professional document. Use all information gathered from the conversation. Fill in reasonable defaults where the EM Director didn't specify. Mark any assumptions with [VERIFY].\n\nCONVERSATION:\n${buildTranscript()}\n\nGenerate the complete document now:`;
      setMessages(p => [...p, { role: 'assistant', content: 'Generating your document based on our conversation...' }]);
      await callAIStream(sys, prompt, (chunk) => {
        result += chunk;
        setMessages(p => {
          const n = [...p];
          n[n.length - 1] = { role: 'assistant', content: '**Document Generated:**\n\n' + result };
          return n;
        });
      });
      if (onComplete) onComplete(result);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Error generating document. Please try again.' }]);
    }
    setGenerating(false);
  };

  const B = {
    card: '#FFFFFF', border: '#E2E8EA', text: '#111827', muted: '#374151', faint: '#6B7280',
    sidebar: '#1A1F2E', teal: TEAL, green: '#22C55E',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', minHeight: 500,
      background: B.card, border: `1px solid ${B.border}`, borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px', borderBottom: `1px solid ${B.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(135deg, #f0fafa, #fff)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{icon || '🤝'}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: B.text }}>{title || 'SAGE · Situational Assessment & Guidance Engine'}</div>
            <div style={{ fontSize: 10, color: B.faint, fontFamily: "'DM Mono',monospace", letterSpacing: '0.06em' }}>
              SAGE · Collaborative · Conversational · Your Data
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={generateFinal} disabled={generating || messages.length < 4} style={{
            background: messages.length < 4 ? '#edf2f4' : GOLD, color: messages.length < 4 ? B.faint : '#111',
            border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 700,
            cursor: messages.length < 4 ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}>{generating ? 'Generating...' : (completeLabel || 'Generate Document')}</button>
          {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: B.faint, cursor: 'pointer', fontSize: 16 }}>✕</button>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
              background: m.role === 'user' ? `${TEAL}15` : '#f8f9fa',
              border: `1px solid ${m.role === 'user' ? `${TEAL}30` : B.border}`,
              fontSize: 13, lineHeight: 1.7, color: B.text, whiteSpace: 'pre-wrap',
            }}>
              {m.role === 'assistant' && (
                <div style={{ fontSize: 9, color: TEAL, fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em', marginBottom: 4, textTransform: 'uppercase' }}>
                  SAGE
                </div>
              )}
              {m.content || (loading && i === messages.length - 1 ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${B.border}`, display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Answer the question or ask for clarification..."
          disabled={loading || generating}
          style={{
            flex: 1, padding: '10px 14px', border: `1px solid ${B.border}`, borderRadius: 10,
            fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = TEAL}
          onBlur={e => e.target.style.borderColor = B.border}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          background: loading || !input.trim() ? '#edf2f4' : TEAL,
          color: loading || !input.trim() ? B.faint : '#fff',
          border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700,
          cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif",
        }}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  );
}
