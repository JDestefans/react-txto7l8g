import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const PLAN_MAP: Record<string, string> = {}

serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!stripeKey || !webhookSecret) {
    return new Response('Stripe not configured', { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const subscription = event.data.object as any

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const userId = subscription.metadata?.supabase_user_id
      if (!userId) break
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        plan: subscription.metadata?.plan_id || 'solo',
        status: subscription.status,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      })
      break
    }
    case 'customer.subscription.deleted': {
      const userId = subscription.metadata?.supabase_user_id
      if (!userId) break
      await supabase.from('subscriptions').update({
        status: 'canceled',
      }).eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
