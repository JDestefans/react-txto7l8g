// ai-proxy Edge Function — routes to Haiku or Sonnet based on model_tier
// Deploy: supabase functions deploy ai-proxy --no-verify-jwt
// Secrets needed: ANTHROPIC_API_KEY

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MODEL_MAP: Record<string, string> = {
  fast: 'claude-haiku-4-5-20251001',
  strong: 'claude-sonnet-4-20250514',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const {
      operation = 'general',
      model_tier = 'fast',
      stream = true,
      system,
      prompt,
      content,
      max_tokens = 1200,
    } = body

    const model = MODEL_MAP[model_tier] || MODEL_MAP.fast

    // Build messages array
    const messages: any[] = []
    if (content) {
      // Multi-modal content (for interpret_doc / bulk_intake)
      messages.push({ role: 'user', content: Array.isArray(content) ? content : [{ type: 'text', text: String(content) }] })
    } else if (prompt) {
      messages.push({ role: 'user', content: prompt })
    }

    const anthropicBody: any = {
      model,
      max_tokens,
      messages,
      stream,
    }
    if (system) {
      anthropicBody.system = system
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    })

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text()
      return new Response(JSON.stringify({ error: `Anthropic error: ${err}` }), {
        status: anthropicRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (stream) {
      // Stream SSE response back to client
      return new Response(anthropicRes.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      })
    } else {
      // Return JSON response
      const data = await anthropicRes.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
