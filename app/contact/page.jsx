'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ✅ Default fallback data - तुरंत दिखेगा
const DEFAULT_DATA = {
  pre_heading: 'GET IN TOUCH',
  page_heading: 'Contact Details',
  sub_heading: 'Have a question or need assistance? Contact us now. We\'re here to support you and we look forward to hearing from you soon!',
  phone: '01724014524',
  email: 'sainivatpharama@gmail.com',
  address: '57, Block B, South Ex. Part II, New Delhi PIN - 110049',
};

export default function ContactPage() {
  const [contactUs, setContactUs] = useState(DEFAULT_DATA); // ✅ Default data से शुरू करो
  const [visibleSections, setVisibleSections] = useState({});

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', message: '' });
  const [formMsg, setFormMsg] = useState(null);
  const [sending, setSending] = useState(false);

  // ✅ FIX 1: Parallel loading - cache + API दोनों एक साथ
  useEffect(() => {
    // 1️⃣ Local storage से पहले load करो (instant)
    const cached = localStorage.getItem('contactUsData');
    if (cached) {
      try {
        setContactUs(JSON.parse(cached));
      } catch (e) {
        console.error('Cache error:', e);
      }
    }
    
    // 2️⃣ API से fresh data fetch करो (background में)
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const res = await fetch(`${API_URL}/api/contact-us`, {
        signal: controller.signal,
        next: { revalidate: 3600 }
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setContactUs(data);
        localStorage.setItem('contactUsData', JSON.stringify(data));
      }
    } catch (err) {
      console.error('API error:', err);
      // Default data रहेगा, error नहीं दिखेगा
    }
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [e.target.dataset.section]: true }));
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('[data-section]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setFormMsg(null);
    try {
      const res = await fetch(`${API_URL}/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setFormMsg({ type: 'success', text: 'Thank you! We will get back to you soon.' });
        setForm({ name: '', phone: '', email: '', address: '', message: '' });
      } else {
        setFormMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
      }
    } catch {
      setFormMsg({ type: 'error', text: 'Network error. Please try again.' });
    }
    setSending(false);
  };

  // ✅ No loading state! Direct render
  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        @keyframes bannerReveal{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

        /* ── Banner ── */
        .ct-banner{
          position:relative;height:177px;
          background:linear-gradient(135deg,#0a214f 0%,#1872B5 55%,#2596e1 100%);
          display:flex;align-items:center;justify-content:center;overflow:hidden;
        }
        .ct-banner::before{
          content:'';position:absolute;inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;
          animation:shimmer 8s linear infinite;
        }
        .ct-banner-orb{
          position:absolute;width:200px;height:200px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%);
          left:-60px;bottom:-60px;
        }
        .ct-banner-content{position:relative;z-index:2;text-align:center;animation:bannerReveal .7s ease both;}
        .ct-banner-content h1{
          font-size:34px !important;
          font-weight:700 !important;
          margin-bottom:2px !important;
          font-family:'Sora',sans-serif;
          color:#fff;
          margin:0 0 10px !important;
          letter-spacing:-0.02em;
          text-shadow:0 2px 20px rgba(0,0,0,.25);
        }

        /* ── Breadcrumb ── */
        .ct-bc-bar{background:#1872B5;padding:10px 0;}
        .ct-bc{max-width:1400px;margin:0 auto;padding:0 24px;font-size:13px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:4px;flex-wrap:wrap;}
        .ct-bc a{color:rgba(255,255,255,.75);text-decoration:none;transition:color .2s;}
        .ct-bc a:hover{color:#fff;}
        .ct-bc-sep{opacity:.5;margin:0 2px;}
        .ct-bc-cur{color:#fff;font-weight:700;}

        /* ── Section Tag ── */
        .section-tag{
          display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#eff6ff,#dbeafe);
          color:#1872B5;font-size:11px;font-weight:800;
          text-transform:uppercase;letter-spacing:.1em;
          padding:6px 16px;border-radius:20px;
          border:1px solid #bfdbfe;margin-bottom:18px;
        }
        .section-tag::before{content:'';width:6px;height:6px;border-radius:50%;background:#1872B5;flex-shrink:0;}

        /* ── Info Section ── */
        .ct-info-section{max-width:1400px;margin:0 auto;padding:61px 34px 24px;}
        .ct-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin-bottom:-38px;}

        .ct-main-heading{
          font-family:'Sora',sans-serif;font-size:27px;font-weight:800;
          color:#0a214f;line-height:1.3;margin-bottom:8px;
        }
        .ct-divider{width:40px;height:3px;background:linear-gradient(135deg,#1872B5,#2596e1);border-radius:2px;margin-bottom:16px;}
        .ct-sub{font-size:14px;color:#4b5563;line-height:1.7;margin-bottom:32px;max-width:90%;}

        /* ── Icon Boxes ── */
        .ct-icon-box{display:flex;align-items:flex-start;gap:14px;margin-bottom:24px;}
        .ct-icon{
          width:40px;height:40px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,#1872B5,#2596e1);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 12px rgba(24,114,181,.3);
        }
        .ct-icon svg{width:18px;height:18px;fill:#fff;}
        .ct-icon-label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#0a214f;margin-bottom:4px;}
        .ct-icon-value{font-size:14px;color:#374151;font-weight:600;}
        .ct-icon-value a{color:#1872B5;text-decoration:none;font-weight:700;}
        .ct-icon-value a:hover{color:#0a214f;}

        /* ── Right Image ── */
        .ct-img-wrap{
          border-radius:22px;overflow:hidden;
          box-shadow:0 20px 56px rgba(24,114,181,.18);
          position:relative;
          background:#f0f0f0;
          min-height:400px;
        }
        .ct-img-wrap img{width:100%;height:100%;display:block;border-radius:22px;transition:transform .6s ease;object-fit:cover;}
        .ct-img-wrap:hover img{transform:scale(1.04);}
        .ct-img-deco{
          position:absolute;bottom:-20px;right:-20px;
          width:120px;height:120px;border-radius:50%;
          background:linear-gradient(135deg,#1872B5,#2596e1);opacity:.15;pointer-events:none;
        }
        .ct-img-deco2{
          position:absolute;top:-16px;left:-16px;
          width:80px;height:80px;border-radius:50%;
          background:linear-gradient(135deg,#0a214f,#1872B5);opacity:.12;pointer-events:none;
        }

        /* ── Form Section ── */
        .ct-form-section{
          background:#D0EDFB;
          padding:64px 24px;
          position:relative;overflow:hidden;
        }
        .ct-form-section::before{
          content:'';position:absolute;inset:0;
          background:url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='1.5' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E") repeat;
        }
        .ct-form-orb1{position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.06),transparent 70%);top:-150px;right:-100px;pointer-events:none;}
        .ct-form-orb2{position:absolute;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.05),transparent 70%);bottom:-80px;left:-60px;pointer-events:none;}

        .ct-form-inner{
          max-width:1400px;
          margin:0 auto;
          position:relative;
          z-index:2;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:60px;
          align-items:center;
          padding-inline:24px;
        }

        .ct-form-heading{
          font-family:'Sora',sans-serif;font-size:27px;font-weight:800;
          color:#0a214f;line-height:1.3;margin-bottom:11px;
        }
        .ct-form-sub{
          font-size:14px;color:#0a214f;line-height:1.7;
          margin-bottom:17px;margin-top:-4px;
        }

        /* ── Form Image ── */
        .ct-form-img{
          border-radius:18px;overflow:hidden;
          box-shadow:0 20px 48px rgba(0,0,0,.25);
          background:#f0f0f0;
          min-height:300px;
        }
        .ct-form-img img{width:100%;height:100%;display:block;border-radius:18px;object-fit:cover;}

        /* ── Inputs ── */
        .ct-form-group{margin-bottom:16px;}
        .ct-form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;}
        .ct-input{
          width:100%;padding:13px 18px;border-radius:10px;
          border:1.5px solid rgba(255,255,255,.2);
          background:rgb(255 255 255 / 64%);
          color:#0a214f;font-size:14px;font-family:'Nunito',sans-serif;
          transition:all .25s;outline:none;
        }
        .ct-input::placeholder{color:#0a214f;}
        .ct-input:focus{border-color:rgba(255,255,255,.6);background:rgba(255,255,255,.15);}
        .ct-textarea{resize:vertical;min-height:110px;}

        .ct-submit{
          width:100%;padding:14px;border-radius:10px;border:none;cursor:pointer;
          background:#fff;color:#1872B5;
          font-family:'Sora',sans-serif;font-size:15px;font-weight:800;
          transition:all .25s;box-shadow:0 4px 16px rgba(0,0,0,.2);
          margin-top:4px;
        }
        .ct-submit:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.3);}
        .ct-submit:disabled{opacity:.7;cursor:not-allowed;}

        .ct-alert-success{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;padding:12px 16px;border-radius:10px;font-size:14px;margin-bottom:16px;}
        .ct-alert-error{background:rgba(239,68,68,.2);border:1px solid rgba(239,68,68,.4);color:#fca5a5;padding:12px 16px;border-radius:10px;font-size:14px;margin-bottom:16px;}

        /* ── Map Section ── */
        .ct-map-section{padding:48px 0 60px;}
        .ct-map-inner{
          max-width:1400px;
          margin:0 auto;
          padding:0 24px;
        }
        .ct-map-heading{
          font-family:'Sora',sans-serif;font-size:24px;font-weight:800;
          color:#0a214f;margin-bottom:20px;
        }
        .ct-map-wrap{border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(24,114,181,.15);}
        .ct-map-wrap iframe{width:100%;height:420px;border:0;display:block;}

        /* ── Animations ── */
        .ct-left.revealed{animation:fadeLeft .7s ease both;padding-bottom:28px;}
        .ct-right.revealed{animation:fadeRight .7s ease both 0.15s;margin-bottom:-32px;}
        .ct-form-left.revealed{animation:fadeLeft .7s ease both;}
        .ct-form-right.revealed{animation:fadeRight .7s ease both 0.15s;}

        /* ── Responsive ── */
        @media(max-width:767px){
          .ct-info-grid,.ct-form-inner{grid-template-columns:1fr;}
          .ct-form-row{grid-template-columns:1fr;}
          .ct-banner{height:121px;}
          .ct-main-heading{font-size:22px;}
          .ct-form-heading{font-size:22px;}
          .ct-info-section{padding:40px 16px 24px;}
          .ct-form-section{padding:40px 16px;}
          .ct-map-section{padding:32px 0 40px;}
          .ct-form-inner{
            max-width:100%;
            margin:0 auto;
            position:relative;
            z-index:2;
            display:grid;
            gap:41px;
            align-items:center;
            padding-inline:7px;
          }
          .ct-banner-content h1{
            font-size:28px !important;
          }
        }
      `}</style>

      {/* ── Banner ── */}
      <div className="ct-banner">
        <div className="ct-banner-orb" />
        <div className="ct-banner-content">
          <h1>Contact Us</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, fontWeight: 600, margin: 0 }}>
            We'd love to hear from you
          </p>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="ct-bc-bar">
        <nav className="ct-bc">
          <Link href="/">Home</Link>
          <span className="ct-bc-sep">›</span>
          <span className="ct-bc-cur">Contact Us</span>
        </nav>
      </div>

      {/* ── Contact Info Section ── */}
      <div className="ct-info-section">
        <div className="ct-info-grid" data-section="info">

          {/* Left: Details */}
          <div className={`ct-left ${visibleSections.info ? 'revealed' : ''}`}>
            <div className="section-tag">{contactUs.pre_heading}</div>
            <h2 className="ct-main-heading">{contactUs.page_heading}</h2>
            <div className="ct-divider" />
            {contactUs.sub_heading && (
              <p className="ct-sub">{contactUs.sub_heading}</p>
            )}

            {/* Phone */}
            {contactUs.phone && (
              <div className="ct-icon-box">
                <div className="ct-icon">
                  <svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
                </div>
                <div>
                  <div className="ct-icon-label">Call Us 24x7</div>
                  <div className="ct-icon-value">
                    <a href={`tel:${contactUs.phone}`}>{contactUs.phone}</a>
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            {contactUs.email && (
              <div className="ct-icon-box">
                <div className="ct-icon">
                  <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </div>
                <div>
                  <div className="ct-icon-label">Mail Us</div>
                  <div className="ct-icon-value">
                    <a href={`mailto:${contactUs.email}`}>{contactUs.email}</a>
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            {contactUs.address && (
              <div className="ct-icon-box">
                <div className="ct-icon">
                  <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                <div>
                  <div className="ct-icon-label">Our Address</div>
                  <div className="ct-icon-value">{contactUs.address}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Image */}
          <div className={`ct-right ${visibleSections.info ? 'revealed' : ''}`}>
            <div className="ct-img-wrap">
              <img
                src={contactUs.featured_image ? `${API_URL}/uploads/contact-us/${contactUs.featured_image}` : '/uploads/contac-570x400.png'}
                alt="Contact Us"
                loading="eager"
                decoding="async"
              />
              <div className="ct-img-deco" />
              <div className="ct-img-deco2" />
            </div>
          </div>

        </div>
      </div>

      {/* ── Form Section ── */}
      <div className="ct-form-section">
        <div className="ct-form-orb1" />
        <div className="ct-form-orb2" />
        <div className="ct-form-inner" data-section="form">

          {/* Left: Image */}
          <div className={`ct-form-left ${visibleSections.form ? 'revealed' : ''}`}>
            {contactUs.image ? (
              <div className="ct-form-img">
                <img
                  src={`${API_URL}/uploads/contact-us/${contactUs.image}`}
                  alt={contactUs.image_alt || 'Contact'}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : (
              <div style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,.1)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>📬</div>
            )}
          </div>

          {/* Right: Form */}
          <div className={`ct-form-right ${visibleSections.form ? 'revealed' : ''}`}>
            <h2 className="ct-form-heading">Ready to Get Started?</h2>
            <p className="ct-form-sub">Fill the form below and we will get back to you as soon as possible.</p>

            {formMsg && (
              <div className={formMsg.type === 'success' ? 'ct-alert-success' : 'ct-alert-error'}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="ct-form-row">
                <input className="ct-input" type="text" placeholder="Your Name" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="ct-input" type="tel" placeholder="Your Phone" required
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="ct-form-row">
                <input className="ct-input" type="email" placeholder="Your Email" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <input className="ct-input" type="text" placeholder="Your Address"
                  value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="ct-form-group">
                <textarea className="ct-input ct-textarea" placeholder="Your Message"
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="ct-submit" disabled={sending}>
                {sending ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ── Map Section ── */}
      {contactUs?.map_embed && (
        <div className="ct-map-section">
          <div className="ct-map-inner">
            <div
              className="ct-map-wrap"
              dangerouslySetInnerHTML={{ __html: contactUs.map_embed }}
            />
          </div>
        </div>
      )}

    </div>
  );
}