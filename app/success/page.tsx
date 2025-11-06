'use client';

// Redirect user to /success?session_id=... to show instant feedback. not realible
// Redirect user, show success page
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Stripe } from 'stripe';

type CheckoutSession = {
  id: string;
  amount_total: number;
  currency: string;
  customer_email?: string | null;
  payment_status: string;
  error?: string;
};

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id');

  const [payment, setPayment] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session_id) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/session?session_id=${session_id}`);
        const data = await res.json();
        setPayment(data);
      } catch (err) {
        console.error(err);
        setPayment({ id: '', amount_total: 0, currency: 'thb', payment_status: 'error', error: 'Failed to load session' });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [session_id]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Checking payment status...</p>
      </main>
    );
  }

  if (payment?.error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold text-red-600">❌ Payment Error</h1>
        <p className="mt-2">{payment.error}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center">
      {payment?.payment_status === 'paid' ? (
        <>
          <h1 className="text-3xl font-bold text-green-600">✅ Payment Successful!</h1>
          <p className="mt-2 text-gray-600">
            Thank you for your purchase.
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow">
            <p><strong>Amount:</strong> {payment.amount_total / 100} {payment.currency.toUpperCase()}</p>
            <p><strong>Email:</strong> {payment.customer_email || 'N/A'}</p>
            <p><strong>Session ID:</strong> {payment.id}</p>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-yellow-600">⌛ Payment Pending</h1>
          <p className="mt-2 text-gray-600">
            We’re still waiting for your payment confirmation.
          </p>
        </>
      )}
    </main>
  );
}
