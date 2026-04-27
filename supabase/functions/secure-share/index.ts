import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ShareAction = 'create' | 'list' | 'resolve' | 'revoke'

type SharePayload = {
  action?: ShareAction
  report?: Record<string, unknown>
  token?: string
  passcode?: string
  expiresInHours?: number
  limit?: number
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function sanitizeExpiresHours(raw?: number): number {
  const n = Number(raw || 168)
  if (!Number.isFinite(n)) return 168
  return Math.min(24 * 90, Math.max(1, Math.round(n)))
}

function sanitizeToken(raw: string | undefined): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 96)
}

function randomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function inferClientIp(req: Request): string | null {
  return (
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip')
  )
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' })
  }

  try {
    const payload = (await req.json()) as SharePayload
    const action = payload?.action
    if (!action) return json(400, { error: 'missing_action' })

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json(500, { error: 'missing_supabase_env' })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    if (action === 'resolve') {
      const token = sanitizeToken(payload.token)
      if (!token) return json(400, { error: 'missing_token' })
      const tokenHash = await sha256Hex(`share-token-v2:${token}`)
      const { data: row, error } = await admin
        .from('shared_reports')
        .select(
          'id,token_hash,report_data,expires_at,revoked_at,access_count,last_accessed_at,requires_passcode,passcode_hash,passcode_salt'
        )
        .eq('token_hash', tokenHash)
        .single()
      if (error || !row) return json(404, { error: 'not_found' })

      const nowMs = Date.now()
      if (row.revoked_at) {
        await admin.from('shared_report_access_logs').insert({
          shared_report_id: row.id,
          access_status: 'revoked',
          ip_address: inferClientIp(req),
          user_agent: req.headers.get('user-agent'),
        })
        return json(410, { error: 'revoked' })
      }
      if (row.expires_at && new Date(row.expires_at).getTime() < nowMs) {
        await admin.from('shared_report_access_logs').insert({
          shared_report_id: row.id,
          access_status: 'expired',
          ip_address: inferClientIp(req),
          user_agent: req.headers.get('user-agent'),
        })
        return json(410, { error: 'expired' })
      }
      if (row.requires_passcode) {
        const passcode = String(payload.passcode || '').trim()
        if (!passcode) {
          await admin.from('shared_report_access_logs').insert({
            shared_report_id: row.id,
            access_status: 'passcode_required',
            ip_address: inferClientIp(req),
            user_agent: req.headers.get('user-agent'),
          })
          return json(401, { error: 'passcode_required' })
        }
        const expected = String(row.passcode_hash || '')
        const salt = String(row.passcode_salt || '')
        const provided = await sha256Hex(`share-pass-v2:${salt}:${passcode}`)
        if (!expected || provided !== expected) {
          await admin.from('shared_report_access_logs').insert({
            shared_report_id: row.id,
            access_status: 'invalid_passcode',
            ip_address: inferClientIp(req),
            user_agent: req.headers.get('user-agent'),
          })
          return json(401, { error: 'invalid_passcode' })
        }
      }

      const accessCount = Number(row.access_count || 0) + 1
      const lastAccessedAt = new Date().toISOString()
      await admin
        .from('shared_reports')
        .update({
          access_count: accessCount,
          last_accessed_at: lastAccessedAt,
        })
        .eq('id', row.id)

      await admin.from('shared_report_access_logs').insert({
        shared_report_id: row.id,
        access_status: 'success',
        ip_address: inferClientIp(req),
        user_agent: req.headers.get('user-agent'),
      })

      return json(200, {
        data: row.report_data,
        meta: {
          expiresAt: row.expires_at,
          accessCount,
          lastAccessedAt,
          requiresPasscode: !!row.requires_passcode,
        },
      })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json(401, { error: 'missing_auth_header' })
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()
    if (authError || !user) return json(401, { error: 'unauthorized' })

    if (action === 'create') {
      const report = payload.report
      if (!report || typeof report !== 'object') {
        return json(400, { error: 'missing_report' })
      }
      const expiresInHours = sanitizeExpiresHours(payload.expiresInHours)
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
      const token = randomHex(20)
      const tokenHash = await sha256Hex(`share-token-v2:${token}`)
      const passcode = String(payload.passcode || '').trim()
      const salt = passcode ? randomHex(8) : null
      const passcodeHash = passcode
        ? await sha256Hex(`share-pass-v2:${salt}:${passcode}`)
        : null
      const reportOrg = String((report as Record<string, unknown>).org || '').trim()
      const compliancePct = Number(
        (report as Record<string, Record<string, number>>).compliance?.percentage || 0
      )

      const { error: insertError } = await admin.from('shared_reports').insert({
        owner_user_id: user.id,
        token_hash: tokenHash,
        report_data: report,
        requires_passcode: !!passcodeHash,
        passcode_hash: passcodeHash,
        passcode_salt: salt,
        expires_at: expiresAt,
        report_org: reportOrg,
        compliance_pct: Number.isFinite(compliancePct) ? compliancePct : 0,
      })
      if (insertError) return json(500, { error: insertError.message })

      return json(200, {
        token,
        expiresAt,
        requiresPasscode: !!passcodeHash,
      })
    }

    if (action === 'list') {
      const limit = Math.min(50, Math.max(1, Number(payload.limit || 20)))
      const { data, error } = await admin
        .from('shared_reports')
        .select(
          'token_hash,created_at,expires_at,revoked_at,access_count,last_accessed_at,requires_passcode,report_org,compliance_pct'
        )
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) return json(500, { error: error.message })
      const links = (data || []).map((row) => ({
        token: row.token_hash, // opaque identifier for revoke calls
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        revoked: !!row.revoked_at,
        accessCount: Number(row.access_count || 0),
        lastAccessedAt: row.last_accessed_at,
        requiresPasscode: !!row.requires_passcode,
        org: row.report_org || '',
        compliancePct: Number(row.compliance_pct || 0),
      }))
      return json(200, { links })
    }

    if (action === 'revoke') {
      const tokenHash = String(payload.token || '').trim().toLowerCase()
      if (!tokenHash) return json(400, { error: 'missing_token' })
      const { data, error } = await admin
        .from('shared_reports')
        .update({ revoked_at: new Date().toISOString() })
        .eq('owner_user_id', user.id)
        .eq('token_hash', tokenHash)
        .is('revoked_at', null)
        .select('id')
      if (error) return json(500, { error: error.message })
      if (!data || data.length === 0) return json(404, { error: 'not_found' })
      return json(200, { revoked: true })
    }

    return json(400, { error: 'unsupported_action' })
  } catch (err) {
    return json(500, {
      error: err instanceof Error ? err.message : 'unexpected_error',
    })
  }
})
