'use client';

import { useCart } from '@/app/components/CartContext';
import Link from 'next/link';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function CheckoutPage() {
  const { items, totalPrice, totalItems } = useCart();

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    payment_method: 'cod',
  });

  // Shipping state
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethod, setShippingMethod] = useState('standard');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Calculate totals
  const subtotal = totalPrice;
  const shipping = shippingCost;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

  // Validate form
  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.first_name) e.first_name = 'First name required';
    if (!form.last_name) e.last_name = 'Last name required';
    if (!form.phone) e.phone = 'Phone required';
    if (!form.address) e.address = 'Address required';
    if (!form.city) e.city = 'City required';
    if (!form.state) e.state = 'State required';
    if (!form.zip) e.zip = 'ZIP required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Place order
  const placeOrder = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/checkout/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          address: form.address,
          apartment: form.apartment,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
          items: items.map(i => ({
            product_id: i.id,
            quantity: i.quantity,
            variant: i.variant,
          })),
          subtotal,
          shipping,
          tax,
          total,
          payment_method: form.payment_method,
          shipping_method: shippingMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderPlaced(true);
      } else {
        setErrors({ submit: data.message || 'Order failed' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 10 }}>Cart is empty</h2>
          <Link href="/collections" style={{ color: '#2B7FE0', textDecoration: 'none' }}>← Back to shopping</Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', maxWidth: '500px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Order Confirmed!</h2>
          <p style={{ color: '#666', marginBottom: 30 }}>Thank you {form.first_name}! Check your email for details.</p>
          <Link href="/collections" style={{ display: 'inline-block', background: '#2B7FE0', color: '#fff', padding: '12px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f9f9f9', minHeight: '100vh', padding: '20px', fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 5 }}>Checkout</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Complete your purchase</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

          {/* ──── LEFT: FORM ──── */}
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>

            {/* CONTACT INFO */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: '#1a1a1a' }}>Contact Information</h2>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.email ? '2px solid #e74c3c' : '1.5px solid #ddd',
                    borderRadius: '8px',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    marginBottom: errors.email ? '4px' : '16px',
                  }}
                />
                {errors.email && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0 16px 0' }}>{errors.email}</p>}
              </div>
            </div>

            {/* SHIPPING ADDRESS */}
            <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #eee' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: '#1a1a1a' }}>Shipping Address</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>First Name *</label>
                  <input
                    value={form.first_name}
                    onChange={e => set('first_name', e.target.value)}
                    placeholder="John"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.first_name ? '2px solid #e74c3c' : '1.5px solid #ddd',
                      borderRadius: '8px',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.first_name && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0' }}>{errors.first_name}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>Last Name *</label>
                  <input
                    value={form.last_name}
                    onChange={e => set('last_name', e.target.value)}
                    placeholder="Doe"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.last_name ? '2px solid #e74c3c' : '1.5px solid #ddd',
                      borderRadius: '8px',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.last_name && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0' }}>{errors.last_name}</p>}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.phone ? '2px solid #e74c3c' : '1.5px solid #ddd',
                    borderRadius: '8px',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.phone && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0' }}>{errors.phone}</p>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>Street Address *</label>
                <input
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="123 Main Street"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.address ? '2px solid #e74c3c' : '1.5px solid #ddd',
                    borderRadius: '8px',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.address && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0' }}>{errors.address}</p>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>Apartment, Suite, etc. (Optional)</label>
                <input
                  value={form.apartment}
                  onChange={e => set('apartment', e.target.value)}
                  placeholder="Apt 4B"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #ddd',
                    borderRadius: '8px',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>City *</label>
                  <input
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder="New York"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.city ? '2px solid #e74c3c' : '1.5px solid #ddd',
                      borderRadius: '8px',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.city && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0' }}>{errors.city}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>State *</label>
                  <input
                    value={form.state}
                    onChange={e => set('state', e.target.value)}
                    placeholder="NY"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.state ? '2px solid #e74c3c' : '1.5px solid #ddd',
                      borderRadius: '8px',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.state && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0' }}>{errors.state}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>ZIP Code *</label>
                  <input
                    value={form.zip}
                    onChange={e => set('zip', e.target.value)}
                    placeholder="10001"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.zip ? '2px solid #e74c3c' : '1.5px solid #ddd',
                      borderRadius: '8px',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.zip && <p style={{ color: '#e74c3c', fontSize: 12, margin: '4px 0' }}>{errors.zip}</p>}
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: '#1a1a1a' }}>Payment Method</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', border: form.payment_method === 'cod' ? '2px solid #2B7FE0' : '1.5px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: form.payment_method === 'cod' ? '#f0f7ff' : '#fff' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={form.payment_method === 'cod'}
                    onChange={e => set('payment_method', e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>💵 Cash on Delivery</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', border: form.payment_method === 'bank' ? '2px solid #2B7FE0' : '1.5px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: form.payment_method === 'bank' ? '#f0f7ff' : '#fff' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={form.payment_method === 'bank'}
                    onChange={e => set('payment_method', e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>🏦 Bank Transfer</span>
                </label>
              </div>
            </div>

            {errors.submit && (
              <div style={{ background: '#ffe6e6', color: '#c41e3a', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: 13, fontWeight: 600 }}>
                ⚠️ {errors.submit}
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : '#2B7FE0',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            <Link href="/cart" style={{ display: 'block', marginTop: '12px', textAlign: 'center', color: '#2B7FE0', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              ← Return to Cart
            </Link>
          </div>

          {/* ──── RIGHT: ORDER SUMMARY ──── */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', height: 'fit-content', position: 'sticky', top: '20px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>Order Summary</h2>

            {/* Items */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              {items.map(item => (
                <div key={`${item.id}-${item.variant}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: 13 }}>
                  <div>
                    <p style={{ fontWeight: 600, margin: 0, color: '#1a1a1a' }}>{item.title}</p>
                    {item.variant && <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0 0' }}>{item.variant}</p>}
                    <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0 0' }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: '#1a1a1a' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: 13 }}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: 13 }}>
              <span style={{ color: '#666' }}>Shipping</span>
              <span style={{ fontWeight: 600 }}>₹{shipping.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: 13, paddingBottom: '16px', borderBottom: '1.5px solid #ddd' }}>
              <span style={{ color: '#666' }}>Tax (18% GST)</span>
              <span style={{ fontWeight: 600 }}>₹{tax.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#2B7FE0' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ fontSize: 11, color: '#888', textAlign: 'center' }}>
              🔒 Secure & Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
