// webhook is server --> server So it realible
// 100% reliable — even if user closes tab, Stripe still notifies your backend.
// Update DB, send email, unlock content

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// The webhook signing secret from Stripe Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig!, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err);
    return new NextResponse(`Webhook Error: ${err}`, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('✅ Payment successful:', session.id);
      // You can update your database here (e.g., mark order as paid)
      break;

    case 'checkout.session.async_payment_failed':
      console.log('❌ Payment failed:', event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse('Received', { status: 200 });
}
