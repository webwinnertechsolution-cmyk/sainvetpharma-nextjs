'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/general-faqs`)
      .then((res) => res.json())
      .then((data) => {
        setFaqs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
  }, [loading]);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', gap: 16, fontFamily: 'Nunito,sans-serif' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #dbeafe', borderTopColor: '#1872B5', animation: 'spin .8s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bannerReveal{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

        /* ── Banner ── */
        .faq-banner{
          position:relative;height:210px;
          background:linear-gradient(135deg,#0a214f 0%,#1872B5 55%,#2596e1 100%);
          display:flex;align-items:center;justify-content:center;overflow:hidden;
        }
        .faq-banner::before{
          content:'';position:absolute;inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;
          animation:shimmer 8s linear infinite;
        }
        .faq-banner-orb{
          position:absolute;width:200px;height:200px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%);
          left:-60px;bottom:-60px;
        }
        .faq-banner-content{position:relative;z-index:2;text-align:center;animation:bannerReveal .7s ease both;}

        /* ── Breadcrumb ── */
        .faq-bc-bar{background:#1872B5;padding:10px 0;}
        .faq-bc{max-width:1400px;margin:0 auto;padding:0 24px;font-size:13px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:4px;flex-wrap:wrap;}
        .faq-bc a{color:rgba(255,255,255,.75);text-decoration:none;transition:color .2s;}
        .faq-bc a:hover{color:#fff;}
        .faq-bc-sep{opacity:.5;margin:0 2px;}
        .faq-bc-cur{color:#fff;font-weight:700;}

        /* ── Section Tag ── */
        .faq-section-tag{
          display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#eff6ff,#dbeafe);
          color:#1872B5;font-size:11px;font-weight:800;
          text-transform:uppercase;letter-spacing:.1em;
          padding:6px 16px;border-radius:20px;
          border:1px solid #bfdbfe;margin-bottom:18px;
        }
        .faq-section-tag::before{content:'';width:6px;height:6px;border-radius:50%;background:#1872B5;flex-shrink:0;}

        /* ── Main Section ── */
        .faq-section{max-width:1400px;margin:0 auto;padding:60px 24px;}
        .faq-intro{text-align:center;margin-bottom:50px;}

        .faq-main-heading{
          font-family:'Sora',sans-serif;font-size:36px;font-weight:800;
          color:#0a214f;line-height:1.3;margin-bottom:12px;
        }
        .faq-divider{width:40px;height:3px;background:linear-gradient(135deg,#1872B5,#2596e1);border-radius:2px;margin:0 auto 16px;}
        .faq-sub{font-size:16px;color:#4b5563;line-height:1.7;margin:0 auto;max-width:600px;}

        /* ── Accordion Container ── */
        .faq-accordion-wrap{margin-top:40px;max-width:900px;margin-left:auto;margin-right:auto;display:flex;flex-direction:column;gap:16px;}

        /* ── Accordion Item ── */
        .faq-item{
          background:#fff;border-radius:12px;
          border:1.5px solid #e8e8e8;
          transition:all .3s ease;
          overflow:hidden;
          box-shadow:0 2px 8px rgba(24,114,181,.08);
        }
        .faq-item.open{
          border-color:#1872B5;
          box-shadow:0 8px 24px rgba(24,114,181,.15);
        }

        /* ── Question Button ── */
        .faq-question{
          width:100%;display:flex;justify-content:space-between;align-items:center;
          padding:22px 28px;background:none;border:none;cursor:pointer;
          text-align:left;gap:16px;transition:all .2s;
        }
        .faq-question:hover{background:rgba(24,114,181,.03);}
        .faq-item.open .faq-question{background:rgba(24,114,181,.05);}

        .faq-question-text{
          flex:1;
          font-family:'Sora',sans-serif;
          font-size:16px;font-weight:700;
          color:#0a214f;line-height:1.5;
        }
        .faq-item.open .faq-question-text{color:#1872B5;}

        /* ── Icon ── */
        .faq-icon{
          flex-shrink:0;width:32px;height:32px;border-radius:50%;
          background:#f0f4f8;display:flex;align-items:center;justify-content:center;
          transition:all .25s;
        }
        .faq-item.open .faq-icon{
          background:linear-gradient(135deg,#1872B5,#2596e1);
        }
        .faq-icon svg{width:16px;height:16px;stroke:#1872B5;stroke-width:2;transition:all .25s;}
        .faq-item.open .faq-icon svg{stroke:#fff;transform:rotate(45deg);}

        /* ── Answer ── */
        .faq-answer{
          padding:0 28px 22px;
          border-top:1px solid #f0f0f0;
          color:#4b5563;
          font-size:15px;
          line-height:1.8;
          animation:fadeUp .3s ease;
        }
        .faq-answer p{margin:0 0 12px;}
        .faq-answer p:last-child{margin:0;}
        .faq-answer strong{color:#0a214f;font-weight:700;}
        .faq-answer a{color:#1872B5;text-decoration:none;font-weight:600;transition:color .2s;}
        .faq-answer a:hover{color:#0a214f;text-decoration:underline;}

        /* ── Empty State ── */
        .faq-empty{
          text-align:center;padding:80px 24px;
        }
        .faq-empty-icon{
          font-size:60px;margin-bottom:16px;
        }
        .faq-empty-text{
          font-size:16px;color:#6b7280;
        }
.faq-accordion-wrap {
    margin-top: 0px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.faq-banner-content h1 {
    font-size: 34px !important;
    font-weight: 700 !important;
}

.faq-banner-content h1 {
    font-size: 34px !important;
    font-weight: 700 !important;
    margin: 0px 0px 0px!important;
}
.faq-question-text {
    flex: 1;
    font-family: 'Sora',sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #0a214f;
    line-height: 1.5;
}
.faq-question {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    gap: 16px;
    transition: all .2s;
}
.faq-answer {
    padding: 15px 16px 17px;
    border-top: 1px solid #f0f0f0;
    color: #4b5563;
    font-size: 14px;
    line-height: 19px;
    animation: fadeUp .3s ease;
}
.faq-section {
    max-width: 1400px;
    margin: 0 auto;
    padding: 41px 24px;
}
.faq-accordion-wrap {
    margin-top: 0px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    gap: 11px;
}

        /* ── Responsive ── */
        @media(max-width:768px){
          .faq-banner{height:150px;}
          .faq-main-heading{font-size:28px;}
          .faq-section{padding:40px 16px;}
          .faq-question-text{font-size:15px;}
          .faq-question{padding:18px 20px;}
          .faq-answer{padding:0 20px 18px;}
          .faq-intro{margin-bottom:32px;}
		  
		  .faq-banner-content h1 {
    /* font-size: 34px !important; */
    /* font-weight: 700 !important; */
    font-size: 24px !important;
    font-weight: 700 !important;
    margin-bottom: 3px !important;
}
.faq-banner {
    height: 121px;
}
.faq-question-text {
    font-size: 14px;
}
.faq-accordion-wrap {
    margin-top: 0px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.faq-question {
    padding: 13px 20px;
}
.faq-banner-content p {
    font-size: 12px;
}
.faq-banner-content h1 {
    /* font-size: 34px !important; */
    /* font-weight: 700 !important; */
    font-size: 16px !important;
    font-weight: 700 !important;
    margin-bottom: 0px !important;
}
.faq-section {
    padding: 26px 16px;
}
.faq-question-text {
    font-size: 12px;
}
.faq-question {
    padding: 11px 20px;
}
.faq-answer {
    padding: 15px 16px 17px;
    border-top: 1px solid #f0f0f0;
    color: #4b5563;
    font-size: 12px;
    line-height: 17px;
    animation: fadeUp .3s ease;
    padding-top: 13px!important;
}
.faq-accordion-wrap {
    margin-top: 0px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
}



        }
      `}</style>

      {/* ── Banner ── */}
      <div className="faq-banner">
        <div className="faq-banner-orb" />
        <div className="faq-banner-content">
          <h1 style={{
            fontFamily: "'Sora',sans-serif", fontSize: '42px', fontWeight: 800,
            color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em',
            textShadow: '0 2px 20px rgba(0,0,0,.25)'
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, fontWeight: 600, margin: 0 }}>
            Find answers to common questions
          </p>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="faq-bc-bar">
        <nav className="faq-bc">
          <Link href="/">Home</Link>
          <span className="faq-bc-sep">›</span>
          <span className="faq-bc-cur">FAQ</span>
        </nav>
      </div>

      {/* ── Main Content ── */}
      <div className="faq-section">
        
       

        {/* ── Accordion ── */}
        {faqs.length === 0 ? (
          <div className="faq-empty">
            <div className="faq-empty-icon">❓</div>
            <p className="faq-empty-text">No FAQs found at the moment.</p>
          </div>
        ) : (
          <div className="faq-accordion-wrap" data-section="accordion">
            {faqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                  style={{
                    animation: `fadeUp .5s ease both ${index * 0.06}s`
                  }}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question-text">
                      {faq.heading}
                    </span>
                    <div className="faq-icon">
                      <svg viewBox="0 0 20 20" fill="none">
                        <path d="M10 5v10M5 10h10" strokeLinecap="round" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      className="faq-answer"
                      dangerouslySetInnerHTML={{ __html: faq.description }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
