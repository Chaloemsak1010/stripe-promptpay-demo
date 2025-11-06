'use client';

import React from 'react';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const handleClick = async () => {
    try {
      // 1️⃣ Create a new Checkout Session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to create Checkout Session.');

      // The backend now returns `session.url` instead of `sessionId`
      const { url }: { url: string } = await response.json();

      // 2️⃣ Redirect the user to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">PromptPay Product Demo</h1>
      <p className="text-lg text-gray-600">
        Product: T-Shirt | Price: 10.00 THB
      </p>
      <button
        onClick={handleClick}
        className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        Buy Now with PromptPay 🇹🇭
      </button>
    </main>
  );
};

export default Home;
