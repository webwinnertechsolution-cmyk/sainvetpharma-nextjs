'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ThankYouPage() {
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setOrderNumber(params.get('order') || '');
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '80vh',
        background: '#f5f7fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#fff',
          borderRadius: '18px',
          padding: '45px 30px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 22px',
            borderRadius: '50%',
            background: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: 800,
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '10px',
          }}
        >
          Thank You!
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#6b7280',
            lineHeight: 1.7,
            marginBottom: '22px',
          }}
        >
          Your order has been placed successfully.
          We’ll keep you updated with your order status.
        </p>

        {orderNumber && (
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '25px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#6b7280',
                marginBottom: '4px',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Order Number
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#1872B5',
              }}
            >
              #{orderNumber}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/account"
            style={{
              background: '#1872B5',
              color: '#fff',
              textDecoration: 'none',
              padding: '12px 22px',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            View My Orders
          </Link>

          <Link
            href="/collections"
            style={{
              background: '#f3f4f6',
              color: '#111827',
              textDecoration: 'none',
              padding: '12px 22px',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
