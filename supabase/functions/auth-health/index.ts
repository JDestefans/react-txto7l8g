import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json(401, { error: 'Missing auth header' })

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    if (!supabaseUrl || !anonKey) return json(500, { error: 'Supabase env is not configured' })

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return json(401, { error: 'Unauthorized' })

    const appUrlConfigured = !!String(Deno.env.get('PLANRR_APP_URL') || '').trim()
    const fromConfigured = !!String(Deno.env.get('INVITE_FROM_EMAIL') || '').trim()
    const resendConfigured = !!String(Deno.env.get('RESEND_API_KEY') || '').trim()
    const serviceRoleConfigured = !!String(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim()
    const ssoConfigured = !!String(Deno.env.get('SSO_ENABLED') || '').trim()

    return json(200, {
      checks: {
        appUrlConfigured,
        fromConfigured,
        resendConfigured,
        serviceRoleConfigured,
        ssoConfigured,
      },
      warnings: [
        !ssoConfigured
          ? 'SSO/SAML enterprise enforcement env not configured (set SSO_ENABLED and IdP settings).'
          : null,
        !serviceRoleConfigured ? 'SUPABASE_SERVICE_ROLE_KEY missing.' : null,
      ].filter(Boolean),
    })
  } catch (err) {
    return json(500, { error: err instanceof Error ? err.message : 'Unexpected error' })
  }
})
