'use client';

import { useCart } from '@/app/components/CartContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';


// ============================================
// LOAD RAZORPAY SCRIPT
// ============================================
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

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};


// ============================================
// SAVE PHONE CUSTOMER
// ============================================
const savePhoneCustomer = (customer) => {
  if (
    typeof window === 'undefined' ||
    !customer
  ) {
    return;
  }

  localStorage.setItem(
    'phone_customer',
    JSON.stringify({
      id: customer.id,
      phone: customer.phone,
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      name:
        customer.name ||
        `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
      email: customer.email || '',
      login_type: 'phone',
    })
  );

  // Account/header ko update karne ke liye
  window.dispatchEvent(
    new Event('phoneCustomerUpdated')
  );
};


export default function CheckoutPage() {
  const router = useRouter();

  const {
    items,
    totalPrice,
    totalItems,
  } = useCart();


  // ============================================
  // CHECKOUT STATES
  // ============================================
  const [loading, setLoading] =
    useState(false);

  const [errors, setErrors] =
    useState({});


  // ============================================
  // FORM
  // ============================================
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
    payment_method: 'razorpay',
  });


  // ============================================
  // SHIPPING
  // ============================================
  const [shippingCost, setShippingCost] =
    useState(0);

  const [shippingMethod, setShippingMethod] =
    useState('standard');

  const [shippingLoading, setShippingLoading] =
    useState(false);

  const [shippingError, setShippingError] =
    useState('');


  // ============================================
  // RAZORPAY
  // ============================================
  const [razorpayKey, setRazorpayKey] =
    useState(null);

  const [razorpayReady, setRazorpayReady] =
    useState(false);


  // ============================================
  // UPDATE FORM
  // ============================================
  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Field change hone par uski error hata do
    setErrors((prev) => {
      if (!prev[key]) return prev;

      const next = { ...prev };
      delete next[key];

      return next;
    });
  };


  // ============================================
  // EXISTING PHONE CUSTOMER PREFILL
  // ============================================
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const saved =
        localStorage.getItem(
          'phone_customer'
        );

      if (!saved) {
        return;
      }

      const customer =
        JSON.parse(saved);

      setForm((prev) => ({
        ...prev,

        email:
          customer.email ||
          prev.email,

        phone:
          customer.phone ||
          prev.phone,

        first_name:
          customer.first_name ||
          prev.first_name,

        last_name:
          customer.last_name ||
          prev.last_name,
      }));

    } catch (error) {
      console.error(
        'Saved customer read error:',
        error
      );
    }
  }, []);


  // ============================================
  // LOAD SHIPPING RATE FROM LARAVEL
  // Same API used by Cart Drawer
  // ============================================
  useEffect(() => {
    if (!items || items.length === 0) {
      setShippingCost(0);
      setShippingMethod('standard');
      return;
    }

    const loadShipping = async () => {
      setShippingLoading(true);
      setShippingError('');

      try {
        const country = (form.country || 'India').toLowerCase();

        const response = await fetch(
          `${API_URL}/api/calculate-shipping?cart_total=${encodeURIComponent(
            Number(totalPrice || 0)
          )}&country=${encodeURIComponent(country)}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            cache: 'no-store',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || 'Could not calculate shipping.'
          );
        }

        if (data.is_free_shipping) {
          setShippingCost(0);
          setShippingMethod('Free Shipping');
          return;
        }

        if (
          data.success &&
          Array.isArray(data.methods) &&
          data.methods.length > 0
        ) {
          const selected = data.methods[0];

          setShippingCost(
            Number(selected.charge || 0)
          );

          setShippingMethod(
            selected.name || 'Standard Delivery'
          );

          return;
        }

        setShippingCost(0);
        setShippingMethod('standard');
        setShippingError(
          'No shipping rate is available for this order.'
        );
      } catch (error) {
        console.error(
          'Checkout shipping error:',
          error
        );

        setShippingCost(0);
        setShippingMethod('standard');
        setShippingError(
          'Could not calculate shipping. Please refresh and try again.'
        );
      } finally {
        setShippingLoading(false);
      }
    };

    loadShipping();
  }, [totalPrice, form.country, items.length]);


  // ============================================
  // LOAD RAZORPAY
  // ============================================
  useEffect(() => {
    const setupRazorpay = async () => {
      try {
        const loaded =
          await loadRazorpayScript();

        setRazorpayReady(loaded);


        const response = await fetch(
          `${API_URL}/api/checkout/razorpay/key`,
          {
            method: 'GET',

            headers: {
              Accept:
                'application/json',
            },

            cache: 'no-store',
          }
        );


        const data =
          await response.json();


        if (
          data.success &&
          data.key
        ) {
          setRazorpayKey(
            data.key
          );
        }

      } catch (error) {
        console.error(
          'Razorpay setup error:',
          error
        );
      }
    };


    setupRazorpay();

  }, []);


  // ============================================
  // TOTALS
  // ============================================
  const subtotal =
    Number(totalPrice || 0);

  const shipping =
    Number(shippingCost || 0);

  const total =
    subtotal + shipping;


  // ============================================
  // VALIDATE
  // ============================================
  const validate = () => {
    const newErrors = {};


    if (!form.email.trim()) {
      newErrors.email =
        'Email required';
    } else if (
      !/\S+@\S+\.\S+/.test(
        form.email
      )
    ) {
      newErrors.email =
        'Invalid email';
    }


    if (
      !form.first_name.trim()
    ) {
      newErrors.first_name =
        'First name required';
    }


    if (
      !form.last_name.trim()
    ) {
      newErrors.last_name =
        'Last name required';
    }


    if (!form.phone.trim()) {
      newErrors.phone =
        'Phone required';
    } else {

      const digits =
        form.phone.replace(
          /\D/g,
          ''
        );

      if (
        digits.length < 10
      ) {
        newErrors.phone =
          'Please enter a valid phone number';
      }
    }


    if (!form.address.trim()) {
      newErrors.address =
        'Address required';
    }


    if (!form.city.trim()) {
      newErrors.city =
        'City required';
    }


    if (!form.state.trim()) {
      newErrors.state =
        'State required';
    }


    if (!form.zip.trim()) {
      newErrors.zip =
        'ZIP required';
    }


    setErrors(
      newErrors
    );


    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  };


  // ============================================
  // PLACE ORDER
  // ============================================
  const placeOrder = async () => {

    if (!validate()) {
      return;
    }


    if (
      !items ||
      items.length === 0
    ) {
      setErrors({
        submit:
          'Your cart is empty.',
      });

      return;
    }


    if (
      form.payment_method ===
        'razorpay' &&
      (
        !razorpayKey ||
        !razorpayReady
      )
    ) {
      setErrors({
        submit:
          'Razorpay is still loading. Please try again.',
      });

      return;
    }


    setLoading(true);
    setErrors({});


    try {

      // ========================================
      // ORDER PAYLOAD
      // ========================================
      const orderPayload = {

        email:
          form.email.trim(),

        first_name:
          form.first_name.trim(),

        last_name:
          form.last_name.trim(),

        phone:
          form.phone.trim(),

        address:
          form.address.trim(),

        apartment:
          form.apartment.trim(),

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        zip:
          form.zip.trim(),

        country:
          form.country,


        items:
          items.map(
            (item) => ({
              id: item.id,
              quantity:
                item.quantity,
            })
          ),


        subtotal:
          subtotal,

        shipping:
          shipping,

        total:
          total,

        payment_method:
          form.payment_method,
      };


      // ========================================
      // CREATE ORDER
      // Backend yahin phone se Customer
      // find/create karega
      // ========================================
      const orderResponse =
        await fetch(
          `${API_URL}/api/checkout/place-order`,
          {
            method: 'POST',

            headers: {
              Accept:
                'application/json',

              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                orderPayload
              ),
          }
        );


      const orderData =
        await orderResponse.json();


      if (
        !orderResponse.ok ||
        !orderData.success
      ) {

        console.error(
          'Order API error:',
          orderData
        );


        // Laravel validation errors
        if (
          orderData.errors
        ) {
          setErrors({
            ...orderData.errors,

            submit:
              orderData.message ||
              'Please check the form.',
          });
        } else {
          setErrors({
            submit:
              orderData.message ||
              'Order could not be placed.',
          });
        }


        setLoading(false);

        return;
      }


      // ========================================
      // RAZORPAY
      // Customer ko abhi logged-in nahi
      // karenge. Payment verify hone ke
      // baad save hoga.
      // ========================================
      if (
        form.payment_method ===
        'razorpay'
      ) {

        handleRazorpayPayment(
          orderData.order,
          orderData.customer
        );

        return;
      }


      // ========================================
      // COD / BANK SUCCESS
      // Order successfully create ho chuka hai
      // ========================================
      if (
        orderData.customer
      ) {
        savePhoneCustomer(
          orderData.customer
        );
      }


      router.push(
        `/thank-you?order=${encodeURIComponent(
          orderData.order
            .order_number
        )}`
      );


    } catch (error) {

      console.error(
        'Place order error:',
        error
      );


      setErrors({
        submit:
          'Network error. Please try again.',
      });


      setLoading(false);
    }
  };


  // ============================================
  // RAZORPAY PAYMENT
  // ============================================
  const handleRazorpayPayment = (
    order,
    customerFromOrder
  ) => {

    if (
      typeof window ===
        'undefined' ||
      !window.Razorpay
    ) {

      setErrors({
        submit:
          'Razorpay could not be loaded.',
      });

      setLoading(false);

      return;
    }


    const options = {

      key:
        razorpayKey,


      amount:
        Math.round(
          Number(
            order.total || 0
          ) * 100
        ),


      currency:
        'INR',


      name:
        'SAINI VET PHARMA',


      description:
        `Order ${order.order_number}`,


      order_id:
        order.razorpay_order_id,


      // ========================================
      // PAYMENT SUCCESS
      // ========================================
      handler:
        async (response) => {

          try {

            // ==================================
            // VERIFY PAYMENT WITH LARAVEL
            // ==================================
            const verifyResponse =
              await fetch(
                `${API_URL}/api/checkout/razorpay/verify`,
                {
                  method:
                    'POST',

                  headers: {
                    Accept:
                      'application/json',

                    'Content-Type':
                      'application/json',
                  },

                  body:
                    JSON.stringify({
                      order_id:
                        order.id,

                      razorpay_payment_id:
                        response
                          .razorpay_payment_id,

                      razorpay_order_id:
                        response
                          .razorpay_order_id,

                      razorpay_signature:
                        response
                          .razorpay_signature,
                    }),
                }
              );


            const verifyData =
              await verifyResponse.json();


            if (
              verifyResponse.ok &&
              verifyData.success
            ) {

              // ==============================
              // PAYMENT SUCCESS
              // Ab customer ko login/remember
              // karo
              // ==============================
              const customer =
                verifyData.customer ||
                customerFromOrder;


              if (customer) {
                savePhoneCustomer(
                  customer
                );
              }


              // ==============================
              // THANK YOU PAGE
              // ==============================
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
              submit:
                'Payment verification error.',
            });


          } finally {

            setLoading(false);
          }
        },


      // ========================================
      // RAZORPAY POPUP CLOSED
      // ========================================
      modal: {

        ondismiss: () => {
          setLoading(false);
        },

      },


      // ========================================
      // RAZORPAY PREFILL
      // ========================================
      prefill: {

        name:
          `${form.first_name} ${form.last_name}`,

        email:
          form.email,

        contact:
          form.phone,
      },


      // ========================================
      // NOTES
      // ========================================
      notes: {

        customer_email:
          form.email,

        customer_phone:
          form.phone,

        order_number:
          order.order_number,

      },


      theme: {

        color:
          '#2B7FE0',

      },

    };


    const razorpay =
      new window.Razorpay(
        options
      );


    // ============================================
    // PAYMENT FAILED
    // ============================================
    razorpay.on(
      'payment.failed',
      function (response) {

        console.error(
          'Razorpay payment failed:',
          response.error
        );


        setErrors({
          submit:
            response.error
              ?.description ||
            'Payment failed. Please try again.',
        });


        setLoading(false);
      }
    );


    razorpay.open();
  };


  // ============================================
  // EMPTY CART
  // ============================================
  if (
    !items ||
    items.length === 0
  ) {

    return (
      <div
        style={{
          minHeight: '60vh',
          padding:
            '40px 20px',
          display:
            'flex',
          alignItems:
            'center',
          justifyContent:
            'center',
          textAlign:
            'center',
          background:
            '#f5f7fa',
        }}
      >

        <div>

          <div
            style={{
              fontSize:
                45,
              marginBottom:
                15,
            }}
          >
            🛒
          </div>


          <h2
            style={{
              fontSize:
                20,
              marginBottom:
                10,
            }}
          >
            Cart is empty
          </h2>


          <Link
            href="/collections"
            style={{
              color:
                '#2B7FE0',

              textDecoration:
                'none',

              fontWeight:
                700,
            }}
          >
            ← Back to shopping
          </Link>

        </div>

      </div>
    );
  }


  // ============================================
  // CHECKOUT PAGE
  // ============================================
  return (
    <div
      style={{
        background:
          '#f9f9f9',

        minHeight:
          '100vh',

        padding:
          '20px',

        fontFamily:
          "'Nunito', sans-serif",
      }}
    >

      <style>{`

        * {
          box-sizing: border-box;
        }


        .checkout-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 380px;
          gap: 24px;
          align-items: start;
        }


        .checkout-two-column {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }


        .checkout-three-column {
          display: grid;
          grid-template-columns:
            2fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }


        .checkout-input {
          width: 100%;
          padding: 11px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          background: #fff;
        }


        .checkout-input:focus {
          border-color:
            #2B7FE0 !important;
        }


        .checkout-field-error {
          color: #e74c3c;
          font-size: 11px;
          margin:
            4px 0 0;
        }


        @media(max-width: 850px) {

          .checkout-layout {
            grid-template-columns:
              1fr;
          }


          .checkout-summary {
            position:
              static !important;
          }

        }


        @media(max-width: 600px) {

          .checkout-two-column,
          .checkout-three-column {
            grid-template-columns:
              1fr;
          }


          .checkout-main-card {
            padding:
              20px !important;
          }


          .checkout-page-wrap {
            padding:
              12px !important;
          }

        }

      `}</style>


      <div
        className="checkout-page-wrap"
        style={{
          maxWidth:
            '1100px',

          margin:
            '0 auto',
        }}
      >


        {/* ======================================
            HEADER
        ====================================== */}
        <div
          style={{
            marginBottom:
              '30px',
          }}
        >

          <h1
            style={{
              fontSize:
                28,

              fontWeight:
                700,

              margin:
                '0 0 5px',
            }}
          >
            Checkout
          </h1>


          <p
            style={{
              color:
                '#888',

              fontSize:
                14,

              margin:
                0,
            }}
          >
            Complete your purchase
          </p>

        </div>


        <div className="checkout-layout">


          {/* ====================================
              LEFT
          ==================================== */}
          <div
            className="checkout-main-card"
            style={{
              background:
                '#fff',

              padding:
                '30px',

              borderRadius:
                '12px',

              boxShadow:
                '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >


            {/* ==================================
                CONTACT INFORMATION
            ================================== */}
            <div
              style={{
                marginBottom:
                  '30px',
              }}
            >

              <h2
                style={{
                  fontSize:
                    16,

                  fontWeight:
                    700,

                  margin:
                    '0 0 18px',

                  color:
                    '#1a1a1a',
                }}
              >
                Contact Information
              </h2>


              {/* EMAIL */}
              <div
                style={{
                  marginBottom:
                    12,
                }}
              >

                <label
                  style={{
                    display:
                      'block',

                    fontSize:
                      13,

                    fontWeight:
                      600,

                    marginBottom:
                      6,

                    color:
                      '#333',
                  }}
                >
                  Email Address *
                </label>


                <input
                  type="email"

                  value={
                    form.email
                  }

                  onChange={(e) =>
                    set(
                      'email',
                      e.target.value
                    )
                  }

                  placeholder="you@example.com"

                  className="checkout-input"

                  style={{
                    border:
                      errors.email
                        ? '2px solid #e74c3c'
                        : '1.5px solid #ddd',
                  }}
                />


                {errors.email && (
                  <p className="checkout-field-error">
                    {Array.isArray(
                      errors.email
                    )
                      ? errors.email[0]
                      : errors.email}
                  </p>
                )}

              </div>


              {/* PHONE */}
              <div>

                <label
                  style={{
                    display:
                      'block',

                    fontSize:
                      13,

                    fontWeight:
                      600,

                    marginBottom:
                      6,

                    color:
                      '#333',
                  }}
                >
                  Phone Number *
                </label>


                <input
                  type="tel"

                  value={
                    form.phone
                  }

                  onChange={(e) =>
                    set(
                      'phone',
                      e.target.value
                    )
                  }

                  placeholder="+91 98765 43210"

                  className="checkout-input"

                  style={{
                    border:
                      errors.phone
                        ? '2px solid #e74c3c'
                        : '1.5px solid #ddd',
                  }}
                />


                {errors.phone && (
                  <p className="checkout-field-error">
                    {Array.isArray(
                      errors.phone
                    )
                      ? errors.phone[0]
                      : errors.phone}
                  </p>
                )}

              </div>

            </div>


            {/* ==================================
                SHIPPING ADDRESS
            ================================== */}
            <div
              style={{
                marginBottom:
                  30,

                paddingBottom:
                  30,

                borderBottom:
                  '1px solid #eee',
              }}
            >

              <h2
                style={{
                  fontSize:
                    16,

                  fontWeight:
                    700,

                  margin:
                    '0 0 18px',

                  color:
                    '#1a1a1a',
                }}
              >
                Shipping Address
              </h2>


              {/* NAME */}
              <div className="checkout-two-column">


                {/* FIRST NAME */}
                <div>

                  <label
                    style={{
                      display:
                        'block',

                      fontSize:
                        13,

                      fontWeight:
                        600,

                      marginBottom:
                        6,
                    }}
                  >
                    First Name *
                  </label>


                  <input
                    value={
                      form.first_name
                    }

                    onChange={(e) =>
                      set(
                        'first_name',
                        e.target.value
                      )
                    }

                    placeholder="John"

                    className="checkout-input"

                    style={{
                      border:
                        errors.first_name
                          ? '2px solid #e74c3c'
                          : '1.5px solid #ddd',
                    }}
                  />


                  {errors.first_name && (
                    <p className="checkout-field-error">
                      {Array.isArray(
                        errors.first_name
                      )
                        ? errors.first_name[0]
                        : errors.first_name}
                    </p>
                  )}

                </div>


                {/* LAST NAME */}
                <div>

                  <label
                    style={{
                      display:
                        'block',

                      fontSize:
                        13,

                      fontWeight:
                        600,

                      marginBottom:
                        6,
                    }}
                  >
                    Last Name *
                  </label>


                  <input
                    value={
                      form.last_name
                    }

                    onChange={(e) =>
                      set(
                        'last_name',
                        e.target.value
                      )
                    }

                    placeholder="Doe"

                    className="checkout-input"

                    style={{
                      border:
                        errors.last_name
                          ? '2px solid #e74c3c'
                          : '1.5px solid #ddd',
                    }}
                  />


                  {errors.last_name && (
                    <p className="checkout-field-error">
                      {Array.isArray(
                        errors.last_name
                      )
                        ? errors.last_name[0]
                        : errors.last_name}
                    </p>
                  )}

                </div>

              </div>


              {/* STREET ADDRESS */}
              <div
                style={{
                  marginBottom:
                    12,
                }}
              >

                <label
                  style={{
                    display:
                      'block',

                    fontSize:
                      13,

                    fontWeight:
                      600,

                    marginBottom:
                      6,
                  }}
                >
                  Street Address *
                </label>


                <input
                  value={
                    form.address
                  }

                  onChange={(e) =>
                    set(
                      'address',
                      e.target.value
                    )
                  }

                  placeholder="123 Main Street"

                  className="checkout-input"

                  style={{
                    border:
                      errors.address
                        ? '2px solid #e74c3c'
                        : '1.5px solid #ddd',
                  }}
                />


                {errors.address && (
                  <p className="checkout-field-error">
                    {Array.isArray(
                      errors.address
                    )
                      ? errors.address[0]
                      : errors.address}
                  </p>
                )}

              </div>


              {/* APARTMENT */}
              <div
                style={{
                  marginBottom:
                    12,
                }}
              >

                <label
                  style={{
                    display:
                      'block',

                    fontSize:
                      13,

                    fontWeight:
                      600,

                    marginBottom:
                      6,
                  }}
                >
                  Apartment, Suite, etc. (Optional)
                </label>


                <input
                  value={
                    form.apartment
                  }

                  onChange={(e) =>
                    set(
                      'apartment',
                      e.target.value
                    )
                  }

                  placeholder="Apt 4B"

                  className="checkout-input"

                  style={{
                    border:
                      '1.5px solid #ddd',
                  }}
                />

              </div>


              {/* CITY STATE ZIP */}
              <div className="checkout-three-column">


                {/* CITY */}
                <div>

                  <label
                    style={{
                      display:
                        'block',

                      fontSize:
                        13,

                      fontWeight:
                        600,

                      marginBottom:
                        6,
                    }}
                  >
                    City *
                  </label>


                  <input
                    value={
                      form.city
                    }

                    onChange={(e) =>
                      set(
                        'city',
                        e.target.value
                      )
                    }

                    placeholder="Ambala"

                    className="checkout-input"

                    style={{
                      border:
                        errors.city
                          ? '2px solid #e74c3c'
                          : '1.5px solid #ddd',
                    }}
                  />


                  {errors.city && (
                    <p className="checkout-field-error">
                      {Array.isArray(
                        errors.city
                      )
                        ? errors.city[0]
                        : errors.city}
                    </p>
                  )}

                </div>


                {/* STATE */}
                <div>

                  <label
                    style={{
                      display:
                        'block',

                      fontSize:
                        13,

                      fontWeight:
                        600,

                      marginBottom:
                        6,
                    }}
                  >
                    State *
                  </label>


                  <input
                    value={
                      form.state
                    }

                    onChange={(e) =>
                      set(
                        'state',
                        e.target.value
                      )
                    }

                    placeholder="Haryana"

                    className="checkout-input"

                    style={{
                      border:
                        errors.state
                          ? '2px solid #e74c3c'
                          : '1.5px solid #ddd',
                    }}
                  />


                  {errors.state && (
                    <p className="checkout-field-error">
                      {Array.isArray(
                        errors.state
                      )
                        ? errors.state[0]
                        : errors.state}
                    </p>
                  )}

                </div>


                {/* ZIP */}
                <div>

                  <label
                    style={{
                      display:
                        'block',

                      fontSize:
                        13,

                      fontWeight:
                        600,

                      marginBottom:
                        6,
                    }}
                  >
                    ZIP Code *
                  </label>


                  <input
                    value={
                      form.zip
                    }

                    onChange={(e) =>
                      set(
                        'zip',
                        e.target.value
                      )
                    }

                    placeholder="133001"

                    className="checkout-input"

                    style={{
                      border:
                        errors.zip
                          ? '2px solid #e74c3c'
                          : '1.5px solid #ddd',
                    }}
                  />


                  {errors.zip && (
                    <p className="checkout-field-error">
                      {Array.isArray(
                        errors.zip
                      )
                        ? errors.zip[0]
                        : errors.zip}
                    </p>
                  )}

                </div>

              </div>

            </div>


            {/* ==================================
                PAYMENT METHOD
            ================================== */}
            <div
              style={{
                marginBottom:
                  30,
              }}
            >

              <h2
                style={{
                  fontSize:
                    16,

                  fontWeight:
                    700,

                  margin:
                    '0 0 18px',
                }}
              >
                Payment Method
              </h2>


              {[
                // ============================================
                // CASH ON DELIVERY - DISABLED FOR NOW
                // Future me use karna ho to uncomment kar dena
                // ============================================
                /*
                {
                  value:
                    'cod',

                  label:
                    '💵 Cash on Delivery',
                },
                */

                // ============================================
                // BANK TRANSFER - DISABLED FOR NOW
                // Future me use karna ho to uncomment kar dena
                // ============================================
                /*
                {
                  value:
                    'bank',

                  label:
                    '🏦 Bank Transfer',
                },
                */

                // ============================================
                // RAZORPAY - ACTIVE
                // ============================================
                {
                  value:
                    'razorpay',

                  label:
                    '💳 Card / UPI / Netbanking',
                },

              ].map(
                (method) => (

                  <label
                    key={
                      method.value
                    }

                    style={{
                      display:
                        'flex',

                      alignItems:
                        'center',

                      padding:
                        '12px 14px',

                      marginBottom:
                        10,

                      border:
                        form.payment_method ===
                        method.value
                          ? '2px solid #2B7FE0'
                          : '1.5px solid #ddd',

                      borderRadius:
                        8,

                      cursor:
                        'pointer',

                      background:
                        form.payment_method ===
                        method.value
                          ? '#f0f7ff'
                          : '#fff',
                    }}
                  >

                    <input
                      type="radio"

                      name="payment"

                      value={
                        method.value
                      }

                      checked={
                        form.payment_method ===
                        method.value
                      }

                      onChange={(e) =>
                        set(
                          'payment_method',
                          e.target.value
                        )
                      }

                      style={{
                        marginRight:
                          10,
                      }}
                    />


                    <span
                      style={{
                        fontSize:
                          14,

                        fontWeight:
                          600,
                      }}
                    >
                      {method.label}
                    </span>

                  </label>

                )
              )}

            </div>


            {/* ==================================
                ERROR
            ================================== */}
            {errors.submit && (

              <div
                style={{
                  background:
                    '#ffe6e6',

                  color:
                    '#c41e3a',

                  padding:
                    '12px 14px',

                  borderRadius:
                    8,

                  marginBottom:
                    20,

                  fontSize:
                    13,

                  fontWeight:
                    600,
                }}
              >
                ⚠️ {errors.submit}
              </div>

            )}


            {/* ==================================
                PLACE ORDER BUTTON
            ================================== */}
            <button
              type="button"

              onClick={
                placeOrder
              }

              disabled={
                loading
              }

              style={{
                width:
                  '100%',

                padding:
                  14,

                background:
                  loading
                    ? '#ccc'
                    : '#2B7FE0',

                color:
                  '#fff',

                border:
                  'none',

                borderRadius:
                  8,

                fontSize:
                  14,

                fontWeight:
                  700,

                cursor:
                  loading
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >

              {loading
                ? 'Processing...'

                : form.payment_method ===
                  'razorpay'

                ? `Pay ₹${total.toLocaleString(
                    'en-IN'
                  )}`

                : 'Place Order'
              }

            </button>


            <Link
              href="/cart"

              style={{
                display:
                  'block',

                marginTop:
                  12,

                textAlign:
                  'center',

                color:
                  '#2B7FE0',

                textDecoration:
                  'none',

                fontSize:
                  13,

                fontWeight:
                  600,
              }}
            >
              ← Return to Cart
            </Link>

          </div>


          {/* ====================================
              RIGHT ORDER SUMMARY
          ==================================== */}
          <div
            className="checkout-summary"

            style={{
              background:
                '#fff',

              padding:
                24,

              borderRadius:
                12,

              boxShadow:
                '0 1px 4px rgba(0,0,0,0.08)',

              height:
                'fit-content',

              position:
                'sticky',

              top:
                20,
            }}
          >

            <h2
              style={{
                fontSize:
                  15,

                fontWeight:
                  700,

                margin:
                  '0 0 20px',
              }}
            >
              Order Summary
            </h2>


            {/* PRODUCTS */}
            <div
              style={{
                marginBottom:
                  20,

                paddingBottom:
                  20,

                borderBottom:
                  '1px solid #eee',
              }}
            >

              {items.map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={`${item.id}-${item.variant || index}`}

                    style={{
                      display:
                        'flex',

                      gap:
                        12,

                      marginBottom:
                        14,
                    }}
                  >

                    {/* IMAGE */}
                    <div
                      style={{
                        width:
                          60,

                        height:
                          60,

                        flexShrink:
                          0,

                        borderRadius:
                          8,

                        border:
                          '1px solid #ddd',

                        overflow:
                          'hidden',

                        background:
                          '#f5f5f5',

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',
                      }}
                    >

                      {item.image ? (

                        <img
                          src={
                            item.image
                          }

                          alt={
                            item.title ||
                            'Product'
                          }

                          style={{
                            width:
                              '100%',

                            height:
                              '100%',

                            objectFit:
                              'cover',
                          }}
                        />

                      ) : (

                        <span
                          style={{
                            fontSize:
                              24,
                          }}
                        >
                          📦
                        </span>

                      )}

                    </div>


                    {/* PRODUCT INFO */}
                    <div
                      style={{
                        flex:
                          1,

                        display:
                          'flex',

                        justifyContent:
                          'space-between',

                        gap:
                          8,

                        minWidth:
                          0,
                      }}
                    >

                      <div>

                        <p
                          style={{
                            fontWeight:
                              600,

                            margin:
                              0,

                            fontSize:
                              13,

                            color:
                              '#1a1a1a',
                          }}
                        >
                          {item.title}
                        </p>


                        {item.variant && (

                          <p
                            style={{
                              fontSize:
                                11,

                              color:
                                '#888',

                              margin:
                                '2px 0 0',
                            }}
                          >
                            {item.variant}
                          </p>

                        )}


                        <p
                          style={{
                            fontSize:
                              11,

                            color:
                              '#888',

                            margin:
                              '4px 0 0',
                          }}
                        >
                          Qty: {item.quantity}
                        </p>

                      </div>


                      <span
                        style={{
                          fontWeight:
                            700,

                          fontSize:
                            13,

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        ₹
                        {(
                          Number(
                            item.price ||
                            0
                          ) *

                          Number(
                            item.quantity ||
                            0
                          )

                        ).toLocaleString(
                          'en-IN'
                        )}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>


            {/* SUBTOTAL */}
            <div
              style={{
                display:
                  'flex',

                justifyContent:
                  'space-between',

                marginBottom:
                  10,

                fontSize:
                  13,
              }}
            >

              <span
                style={{
                  color:
                    '#666',
                }}
              >
                Subtotal
              </span>


              <strong>
                ₹
                {subtotal.toLocaleString(
                  'en-IN'
                )}
              </strong>

            </div>


            {/* SHIPPING */}
            <div
              style={{
                display:
                  'flex',

                justifyContent:
                  'space-between',

                paddingBottom:
                  16,

                marginBottom:
                  16,

                borderBottom:
                  '1.5px solid #ddd',

                fontSize:
                  13,
              }}
            >

              <span
                style={{
                  color:
                    '#666',
                }}
              >
                Shipping
              </span>


              <strong>

                {shipping > 0
                  ? `₹${shipping.toLocaleString(
                      'en-IN'
                    )}`
                  : 'Free'
                }

              </strong>

            </div>


            {/* TOTAL */}
            <div
              style={{
                display:
                  'flex',

                justifyContent:
                  'space-between',

                alignItems:
                  'center',

                marginBottom:
                  20,
              }}
            >

              <span
                style={{
                  fontSize:
                    15,

                  fontWeight:
                    700,
                }}
              >
                Total
              </span>


              <span
                style={{
                  fontSize:
                    18,

                  fontWeight:
                    700,

                  color:
                    '#2B7FE0',
                }}
              >
                ₹
                {total.toLocaleString(
                  'en-IN'
                )}
              </span>

            </div>


            <div
              style={{
                fontSize:
                  11,

                color:
                  '#888',

                textAlign:
                  'center',
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
