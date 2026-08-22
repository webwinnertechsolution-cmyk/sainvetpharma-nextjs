'use client';

import { useCart } from '@/app/components/CartContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/googleAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ================================
// LOAD RAZORPAY
// ================================
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();

  const {
    items,
    totalPrice,
    totalItems,
  } = useCart();

  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const [shippingCost, setShippingCost] = useState(0);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ================================
  // LOGIN CHECK
  // ================================
  useEffect(() => {
    const user = getStoredUser();

    if (!user) {
      router.replace('/login?redirect=/checkout');
      return;
    }

    setCurrentUser(user);

    setForm((prev) => ({
      ...prev,
      email: user.email || prev.email,
    }));

    setAuthChecking(false);
  }, [router]);

  // ================================
  // LOAD RAZORPAY
  // ================================
  useEffect(() => {
    if (!currentUser) return;

    const setupRazorpay = async () => {
      try {
        const loaded = await loadRazorpayScript();
        setRazorpayReady(loaded);

        const response = await fetch(
          `${API_URL}/api/checkout/razorpay/key`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            cache: 'no-store',
          }
        );

        const data = await response.json();

        if (data.success && data.key) {
          setRazorpayKey(data.key);
        }
      } catch (error) {
        console.error('Razorpay setup error:', error);
      }
    };

    setupRazorpay();
  }, [currentUser]);

  const subtotal = Number(totalPrice || 0);
  const shipping = Number(shippingCost || 0);
  const total = subtotal + shipping;

  // ================================
  // VALIDATION
  // ================================
  const validate = () => {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = 'Email required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!form.first_name) {
      newErrors.first_name = 'First name required';
    }

    if (!form.last_name) {
      newErrors.last_name = 'Last name required';
    }

    if (!form.phone) {
      newErrors.phone = 'Phone required';
    }

    if (!form.address) {
      newErrors.address = 'Address required';
    }

    if (!form.city) {
      newErrors.city = 'City required';
    }

    if (!form.state) {
      newErrors.state = 'State required';
    }

    if (!form.zip) {
      newErrors.zip = 'ZIP required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ================================
  // PLACE ORDER
  // ================================
  const placeOrder = async () => {
    if (!currentUser) {
      router.replace('/login?redirect=/checkout');
      return;
    }

    if (!validate()) return;

    if (!items || items.length === 0) {
      setErrors({
        submit: 'Your cart is empty.',
      });
      return;
    }

    if (
      form.payment_method === 'razorpay' &&
      (!razorpayKey || !razorpayReady)
    ) {
      setErrors({
        submit: 'Razorpay is still loading. Please try again.',
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const orderPayload = {
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

        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),

        subtotal,
        shipping,
        total,
        payment_method: form.payment_method,
      };

      const orderResponse = await fetch(
        `${API_URL}/api/checkout/place-order`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderPayload),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        setErrors({
          submit:
            orderData.message ||
            'Order could not be placed.',
        });

        setLoading(false);
        return;
      }

      if (form.payment_method === 'razorpay') {
        handleRazorpayPayment(orderData.order);
        return;
      }

      router.push(
        `/thank-you?order=${encodeURIComponent(
          orderData.order.order_number
        )}`
      );
    } catch (error) {
      console.error('Place order error:', error);

      setErrors({
        submit: 'Network error. Try again.',
      });

      setLoading(false);
    }
  };

  // ================================
  // RAZORPAY
  // ================================
  const handleRazorpayPayment = (order) => {
    if (
      typeof window === 'undefined' ||
      !window.Razorpay
    ) {
      setErrors({
        submit: 'Razorpay could not be loaded.',
      });

      setLoading(false);
      return;
    }

    const options = {
      key: razorpayKey,

      amount: Math.round(
        Number(order.total || 0) * 100
      ),

      currency: 'INR',

      name: 'SAINI VET PHARMA',

      description: `Order ${order.order_number}`,

      order_id: order.razorpay_order_id,

      handler: async (response) => {
        try {
          const verifyResponse = await fetch(
            `${API_URL}/api/checkout/razorpay/verify`,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },

              body: JSON.stringify({
                order_id: order.id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_signature:
                  response.razorpay_signature,
              }),
            }
          );

          const verifyData =
            await verifyResponse.json();

          if (
            verifyResponse.ok &&
            verifyData.success
          ) {
            router.push(
              `/thank-you?order=${encodeURIComponent(
                order.order_number
              )}`
            );

            return;
          }

          setErrors({
            submit:
              verifyData.message ||
              'Payment verification failed.',
          });
        } catch (error) {
          console.error(
            'Razorpay verification error:',
            error
          );

          setErrors({
            submit: 'Payment verification error.',
          });
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },

      prefill: {
        name: `${form.first_name} ${form.last_name}`,
        email: form.email,
        contact: form.phone,
      },

      notes: {
        customer_email: form.email,
        order_number: order.order_number,
      },

      theme: {
        color: '#2B7FE0',
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on(
      'payment.failed',
      function (response) {
        setErrors({
          submit:
            response.error?.description ||
            'Payment failed. Please try again.',
        });

        setLoading(false);
      }
    );

    razorpay.open();
  };

  // ================================
  // AUTH LOADER
  // ================================
  if (authChecking || !currentUser) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f7fa',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '4px solid #dbeafe',
            borderTopColor: '#1872B5',
            animation:
              'checkoutSpin 0.8s linear infinite',
          }}
        />

        <style>{`
          @keyframes checkoutSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // ================================
  // EMPTY CART
  // ================================
  if (!items || items.length === 0) {
    return (
      <div
        style={{
          minHeight: '60vh',
          padding: '40px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: '#f5f7fa',
        }}
      >
        <div>
          <div style={{ fontSize: 45, marginBottom: 15 }}>
            🛒
          </div>

          <h2
            style={{
              fontSize: 20,
              marginBottom: 10,
            }}
          >
            Cart is empty
          </h2>

          <Link
            href="/collections"
            style={{
              color: '#2B7FE0',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            ← Back to shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#f9f9f9',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 24px;
          align-items: start;
        }

        .checkout-two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .checkout-three-column {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .checkout-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
        }

        .checkout-input:focus {
          border-color: #2B7FE0 !important;
        }

        @media(max-width: 850px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }

          .checkout-summary {
            position: static !important;
          }
        }

        @media(max-width: 600px) {
          .checkout-two-column,
          .checkout-three-column {
            grid-template-columns: 1fr;
          }

          .checkout-main-card {
            padding: 20px !important;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '30px' }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 5,
            }}
          >
            Checkout
          </h1>

          <p
            style={{
              color: '#888',
              fontSize: 14,
              margin: 0,
            }}
          >
            Complete your purchase
          </p>
        </div>

        <div className="checkout-layout">

          <div
            className="checkout-main-card"
            style={{
              background: '#fff',
              padding: '30px',
              borderRadius: '12px',
              boxShadow:
                '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >

            <div style={{ marginBottom: '30px' }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 18,
                }}
              >
                Contact Information
              </h2>

              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Email Address *
              </label>

              <input
                type="email"
                value={form.email}
                readOnly
                className="checkout-input"
                style={{
                  border: errors.email
                    ? '2px solid #e74c3c'
                    : '1.5px solid #ddd',
                  background: '#f9fafb',
                }}
              />

              <div
                style={{
                  fontSize: 11,
                  color: '#6b7280',
                  marginTop: 6,
                }}
              >
                Logged in as {currentUser.email}
              </div>
            </div>

            <div
              style={{
                marginBottom: 30,
                paddingBottom: 30,
                borderBottom: '1px solid #eee',
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 18,
                }}
              >
                Shipping Address
              </h2>

              <div className="checkout-two-column">

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    First Name *
                  </label>

                  <input
                    value={form.first_name}
                    onChange={(e) =>
                      set('first_name', e.target.value)
                    }
                    placeholder="John"
                    className="checkout-input"
                    style={{
                      border: errors.first_name
                        ? '2px solid #e74c3c'
                        : '1.5px solid #ddd',
                    }}
                  />

                  {errors.first_name && (
                    <p
                      style={{
                        color: '#e74c3c',
                        fontSize: 12,
                      }}
                    >
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Last Name *
                  </label>

                  <input
                    value={form.last_name}
                    onChange={(e) =>
                      set('last_name', e.target.value)
                    }
                    placeholder="Doe"
                    className="checkout-input"
                    style={{
                      border: errors.last_name
                        ? '2px solid #e74c3c'
                        : '1.5px solid #ddd',
                    }}
                  />

                  {errors.last_name && (
                    <p
                      style={{
                        color: '#e74c3c',
                        fontSize: 12,
                      }}
                    >
                      {errors.last_name}
                    </p>
                  )}
                </div>

              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Phone Number *
                </label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    set('phone', e.target.value)
                  }
                  placeholder="+91 98765 43210"
                  className="checkout-input"
                  style={{
                    border: errors.phone
                      ? '2px solid #e74c3c'
                      : '1.5px solid #ddd',
                  }}
                />

                {errors.phone && (
                  <p
                    style={{
                      color: '#e74c3c',
                      fontSize: 12,
                    }}
                  >
                    {errors.phone}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Street Address *
                </label>

                <input
                  value={form.address}
                  onChange={(e) =>
                    set('address', e.target.value)
                  }
                  placeholder="123 Main Street"
                  className="checkout-input"
                  style={{
                    border: errors.address
                      ? '2px solid #e74c3c'
                      : '1.5px solid #ddd',
                  }}
                />

                {errors.address && (
                  <p
                    style={{
                      color: '#e74c3c',
                      fontSize: 12,
                    }}
                  >
                    {errors.address}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Apartment, Suite, etc. (Optional)
                </label>

                <input
                  value={form.apartment}
                  onChange={(e) =>
                    set('apartment', e.target.value)
                  }
                  placeholder="Apt 4B"
                  className="checkout-input"
                  style={{
                    border: '1.5px solid #ddd',
                  }}
                />
              </div>

              <div className="checkout-three-column">

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    City *
                  </label>

                  <input
                    value={form.city}
                    onChange={(e) =>
                      set('city', e.target.value)
                    }
                    placeholder="Ambala"
                    className="checkout-input"
                    style={{
                      border: errors.city
                        ? '2px solid #e74c3c'
                        : '1.5px solid #ddd',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    State *
                  </label>

                  <input
                    value={form.state}
                    onChange={(e) =>
                      set('state', e.target.value)
                    }
                    placeholder="Haryana"
                    className="checkout-input"
                    style={{
                      border: errors.state
                        ? '2px solid #e74c3c'
                        : '1.5px solid #ddd',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    ZIP Code *
                  </label>

                  <input
                    value={form.zip}
                    onChange={(e) =>
                      set('zip', e.target.value)
                    }
                    placeholder="133001"
                    className="checkout-input"
                    style={{
                      border: errors.zip
                        ? '2px solid #e74c3c'
                        : '1.5px solid #ddd',
                    }}
                  />
                </div>

              </div>
            </div>

            <div style={{ marginBottom: 30 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 18,
                }}
              >
                Payment Method
              </h2>

              {[
                {
                  value: 'cod',
                  label: '💵 Cash on Delivery',
                },
                {
                  value: 'bank',
                  label: '🏦 Bank Transfer',
                },
                {
                  value: 'razorpay',
                  label: '💳 Card / UPI / Netbanking',
                },
              ].map((method) => (
                <label
                  key={method.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 14px',
                    marginBottom: 10,
                    border:
                      form.payment_method === method.value
                        ? '2px solid #2B7FE0'
                        : '1.5px solid #ddd',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background:
                      form.payment_method === method.value
                        ? '#f0f7ff'
                        : '#fff',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={
                      form.payment_method === method.value
                    }
                    onChange={(e) =>
                      set(
                        'payment_method',
                        e.target.value
                      )
                    }
                    style={{ marginRight: 10 }}
                  />

                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {method.label}
                  </span>
                </label>
              ))}
            </div>

            {errors.submit && (
              <div
                style={{
                  background: '#ffe6e6',
                  color: '#c41e3a',
                  padding: '12px 14px',
                  borderRadius: 8,
                  marginBottom: 20,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ⚠️ {errors.submit}
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={loading}
              style={{
                width: '100%',
                padding: 14,
                background: loading
                  ? '#ccc'
                  : '#2B7FE0',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {loading
                ? 'Processing...'
                : form.payment_method === 'razorpay'
                ? `Pay ₹${total.toLocaleString('en-IN')}`
                : 'Place Order'}
            </button>

            <Link
              href="/cart"
              style={{
                display: 'block',
                marginTop: 12,
                textAlign: 'center',
                color: '#2B7FE0',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ← Return to Cart
            </Link>
          </div>

          <div
            className="checkout-summary"
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 12,
              boxShadow:
                '0 1px 4px rgba(0,0,0,0.08)',
              height: 'fit-content',
              position: 'sticky',
              top: 20,
            }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              Order Summary
            </h2>

            <div
              style={{
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: '1px solid #eee',
              }}
            >
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${item.variant || index}`}
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      flexShrink: 0,
                      borderRadius: 8,
                      border: '1px solid #ddd',
                      overflow: 'hidden',
                      background: '#f5f5f5',
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        📦
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          margin: 0,
                          fontSize: 13,
                        }}
                      >
                        {item.title}
                      </p>

                      <p
                        style={{
                          fontSize: 11,
                          color: '#888',
                          marginTop: 4,
                        }}
                      >
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 10,
                fontSize: 13,
              }}
            >
              <span>Subtotal</span>

              <strong>
                ₹{subtotal.toLocaleString('en-IN')}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: 16,
                marginBottom: 16,
                borderBottom: '1.5px solid #ddd',
                fontSize: 13,
              }}
            >
              <span>Shipping</span>

              <strong>
                {shipping > 0
                  ? `₹${shipping.toLocaleString('en-IN')}`
                  : 'Free'}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Total
              </span>

              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#2B7FE0',
                }}
              >
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <div
              style={{
                fontSize: 11,
                color: '#888',
                textAlign: 'center',
              }}
            >
              🔒 Secure & Encrypted
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
