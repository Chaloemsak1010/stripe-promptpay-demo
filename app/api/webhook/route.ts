// webhook is server --> server So it realible
// 100% reliable — even if user closes tab, Stripe still notifies your backend.
// Update DB, send email, unlock content

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig!, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // --- Handle only "paid" and "not paid/expired" ---
  switch (event.type) {
    // ✅ Payment succeeded (user paid)
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('✅ User paid successfully:', session.id);

      // Example: update DB order to "paid"
      // await updateOrderStatus(session.client_reference_id, 'paid');

      break;
    }

    // ❌ Payment failed or expired
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('❌ Payment not completed or expired:', session.id);

      // Example: update DB order to "failed" or "expired"
      // await updateOrderStatus(session.client_reference_id, 'failed');

      break;
    }

    default:
      console.log(`ℹ️ Ignored event type: ${event.type}`);
  }

  return new NextResponse('OK', { status: 200 });
}
