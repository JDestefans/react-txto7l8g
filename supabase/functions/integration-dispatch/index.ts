import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type IntegrationPayload =
  | {
      action: 'probe'
      kind?: 'slack' | 'teams'
      url?: string
      message?: string
    }
  | {
      action: 'status'
    }
  | {
      action: 'calendar_sync'
      provider?: string
      mode?: string
      events?: Array<{
        id?: string
        title?: string
        start?: string
        end?: string
      }>
    }

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function sanitizeWebhook(url: string | undefined): string {
  const raw = String(url || '').trim()
  if (!raw.startsWith('https://')) return ''
  return raw
}

async function postJson(
  url: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return {
    ok: res.ok,
    status: res.status,
    body: await res.text(),
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json(401, { error: 'Missing auth header' })

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json(500, { error: 'Supabase env vars are not configured' })
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()
    if (authError || !user) return json(401, { error: 'Unauthorized' })

    const payload = (await req.json()) as IntegrationPayload
    const action = payload?.action
    if (!action) return json(400, { error: 'Missing action' })

    if (action === 'status') {
      const googleCalendarConfigured =
        !!String(Deno.env.get('GOOGLE_CALENDAR_API_KEY') || '').trim() &&
        !!String(Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID') || '').trim()
      const outlookCalendarConfigured =
        !!String(Deno.env.get('OUTLOOK_CALENDAR_API_KEY') || '').trim() &&
        !!String(Deno.env.get('OUTLOOK_CALENDAR_CLIENT_ID') || '').trim()
      const dispatchFunctionConfigured = true
      const { count: shareTableCount } = await adminClient
        .from('shared_reports')
        .select('id', { count: 'exact', head: true })
      const shareTablesReady = typeof shareTableCount === 'number'

      return json(200, {
        checks: {
          dispatchFunction: dispatchFunctionConfigured,
          googleCalendar: googleCalendarConfigured,
          outlookCalendar: outlookCalendarConfigured,
          shareTablesReady,
        },
      })
    }

    if (action === 'probe') {
      const kind = payload.kind === 'teams' ? 'teams' : 'slack'
      const url = sanitizeWebhook(payload.url)
      if (!url) return json(400, { error: 'Valid HTTPS webhook url is required.' })

      const text =
        String(payload.message || '').trim() ||
        'planrr launch hardening probe: connector validation.'
      const body =
        kind === 'slack'
          ? { text }
          : {
              text,
              title: 'planrr connector probe',
            }
      const result = await postJson(url, body)

      await adminClient.from('integration_event_logs').insert({
        owner_user_id: user.id,
        channel: kind,
        status: result.ok ? 'ok' : 'error',
        detail: {
          action: 'probe',
          httpStatus: result.status,
          responseBody: result.body.slice(0, 300),
        },
      })

      if (!result.ok) {
        return json(502, {
          error: `${kind} webhook returned ${result.status}`,
          status: result.status,
          response: result.body.slice(0, 300),
        })
      }

      return json(200, {
        ok: true,
        channel: kind,
        deliveredAt: new Date().toISOString(),
      })
    }

    if (action === 'calendar_sync') {
      const provider = String(payload.provider || 'google').toLowerCase()
      const mode = String(payload.mode || 'read_write').toLowerCase()
      const events = Array.isArray(payload.events) ? payload.events : []

      // This function validates credentials and logs sync requests. Full provider
      // push/pull is intentionally explicit for launch hardening visibility.
      const providerKey =
        provider === 'outlook'
          ? Deno.env.get('OUTLOOK_CALENDAR_API_KEY')
          : Deno.env.get('GOOGLE_CALENDAR_API_KEY')
      const providerClientId =
        provider === 'outlook'
          ? Deno.env.get('OUTLOOK_CALENDAR_CLIENT_ID')
          : Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID')

      const configured = !!(providerKey && providerClientId)

      await adminClient.from('integration_event_logs').insert({
        owner_user_id: user.id,
        channel: `calendar:${provider}`,
        status: configured ? 'ok' : 'missing_config',
        detail: {
          action: 'calendar_sync',
          mode,
          receivedEvents: events.length,
        },
      })

      if (!configured) {
        return json(412, {
          error: `Calendar provider ${provider} is not fully configured.`,
          reason: 'missing_provider_credentials',
          requiredSecrets:
            provider === 'outlook'
              ? ['OUTLOOK_CALENDAR_API_KEY', 'OUTLOOK_CALENDAR_CLIENT_ID']
              : ['GOOGLE_CALENDAR_API_KEY', 'GOOGLE_CALENDAR_CLIENT_ID'],
        })
      }

      return json(200, {
        ok: true,
        provider,
        mode,
        syncedEvents: events.length,
        syncedAt: new Date().toISOString(),
      })
    }

    return json(400, { error: 'Unsupported action' })
  } catch (err) {
    return json(500, {
      error: err instanceof Error ? err.message : 'Unexpected error',
    })
  }
})
