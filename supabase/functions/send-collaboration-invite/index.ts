import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type InvitePayload = {
  planId?: string
  planName?: string
  collaboratorName?: string
  collaboratorEmail?: string
  permission?: string
  inviteCode?: string
  invitedByName?: string
  invitedByEmail?: string
  appUrl?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json()) as InvitePayload
    const collaboratorEmail = String(body.collaboratorEmail || '')
      .trim()
      .toLowerCase()
    const inviteCode = String(body.inviteCode || '').trim()
    const planId = String(body.planId || '').trim()

    if (!collaboratorEmail || !collaboratorEmail.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid collaboratorEmail is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!inviteCode || !planId) {
      return new Response(JSON.stringify({ error: 'planId and inviteCode are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const inviteFrom = Deno.env.get('INVITE_FROM_EMAIL')
    if (!resendKey) {
      return new Response(JSON.stringify({ sent: false, reason: 'email_not_configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!inviteFrom) {
      return new Response(JSON.stringify({ sent: false, reason: 'from_not_configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const planName = String(body.planName || 'Plan document').trim()
    const collaboratorName = String(body.collaboratorName || '').trim() || collaboratorEmail.split('@')[0]
    const permission =
      body.permission === 'propose_updates' ? 'comments + proposed updates' : 'comments only'
    const inviterName = String(body.invitedByName || '').trim() || String(body.invitedByEmail || '').trim() || user.email || 'Plan author'
    const rawAppUrl = String(body.appUrl || Deno.env.get('PLANRR_APP_URL') || 'https://planrr.app')
    const baseUrl = rawAppUrl.replace(/\/+$/, '')
    const inviteUrl = `${baseUrl}/?invite=${encodeURIComponent(inviteCode)}&plan=${encodeURIComponent(planId)}`
    const subject = `Plan collaboration invite: ${planName}`
    const text = [
      `Hi ${collaboratorName},`,
      '',
      `${inviterName} invited you to collaborate on "${planName}" in planrr.app.`,
      `Access level: ${permission}.`,
      '',
      `Invite code: ${inviteCode}`,
      `Open planrr.app: ${inviteUrl}`,
      '',
      'If you were not expecting this invitation, you can ignore this email.',
    ].join('\n')
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <p>Hi ${collaboratorName},</p>
        <p><strong>${inviterName}</strong> invited you to collaborate on <strong>${planName}</strong> in planrr.app.</p>
        <p>Access level: <strong>${permission}</strong>.</p>
        <p>Invite code: <strong>${inviteCode}</strong></p>
        <p><a href="${inviteUrl}" target="_blank" rel="noreferrer">Open invite</a></p>
        <p>If you were not expecting this invitation, you can ignore this email.</p>
      </div>
    `

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: inviteFrom,
        to: [collaboratorEmail],
        subject,
        html,
        text,
        reply_to: body.invitedByEmail || undefined,
      }),
    })

    if (!resendResponse.ok) {
      const resendErr = await resendResponse.text()
      return new Response(JSON.stringify({ error: `Resend error: ${resendErr}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resendData = await resendResponse.json()
    return new Response(JSON.stringify({ sent: true, providerId: resendData?.id || null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
