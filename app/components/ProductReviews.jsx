'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ── Star Component ────────────────────────────────────────────
function Stars({ rating, size = 18, interactive = false, onSelect }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = interactive ? (hover || rating) >= i : rating >= i;
        const half   = !interactive && rating >= i - 0.5 && rating < i;
        return (
          <span
            key={i}
            onClick={() => interactive && onSelect && onSelect(i)}
            onMouseEnter={() => interactive && setHover(i)}
            onMouseLeave={() => interactive && setHover(0)}
            style={{
              fontSize: size,
              color: filled || half ? '#10b981' : '#d1d5db',
              cursor: interactive ? 'pointer' : 'default',
              transition: 'color .15s',
              userSelect: 'none',
            }}
          >
            {half ? '★' : '★'}
          </span>
        );
      })}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function ProductReviews({ productId, productTitle }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep]           = useState(1); // 1=rating, 2=content+name
  const [form, setForm]           = useState({
    rating: 0,
    review_content: '',
    reviewer_name: '',
    reviewer_email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle|success|error|duplicate
  const [sort, setSort]             = useState('newest');

  // ── Fetch reviews ──
  const fetchReviews = () => {
    setLoading(true);
    fetch(`${API_URL}/api/products/${productId}/reviews`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  // ── Body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  // ── Reset modal ──
  const openModal = () => {
    setForm({ rating: 0, review_content: '', reviewer_name: '', reviewer_email: '' });
    setStep(1);
    setSubmitStatus('idle');
    setModalOpen(true);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!form.reviewer_name.trim() || !form.review_content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 409) { setSubmitStatus('duplicate'); setSubmitting(false); return; }
      if (!res.ok) throw new Error();
      setSubmitStatus('success');
      fetchReviews();
      setTimeout(() => { setModalOpen(false); setSubmitStatus('idle'); }, 2200);
    } catch {
      setSubmitStatus('error');
    }
    setSubmitting(false);
  };

  // ── Sorted reviews ──
  const sortedReviews = () => {
    if (!data?.reviews) return [];
    const arr = [...data.reviews];
    if (sort === 'newest')   return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sort === 'oldest')   return arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sort === 'highest')  return arr.sort((a, b) => b.rating - a.rating);
    if (sort === 'lowest')   return arr.sort((a, b) => a.rating - b.rating);
    return arr;
  };

  const ratingLabel = ['', 'Poor', 'Fair', 'Average', 'Good', 'Great'];

  return (
    <>
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes revealModal{from{opacity:0;transform:scale(.96) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
        .rv-section{max-width:1260px;margin:0 auto;padding:0 24px 60px;font-family:'Nunito',sans-serif;}
        .rv-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;padding-bottom:20px;border-bottom:2px solid #e5e7eb;margin-bottom:28px;}
        .rv-head-title{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:#0a214f;display:flex;align-items:center;gap:10px;}
        .rv-head-title::before{content:'';display:inline-block;width:4px;height:26px;background:linear-gradient(180deg,#1872B5,#2596e1);border-radius:2px;}
        .rv-write-btn{background:linear-gradient(135deg,#1872B5,#2596e1);color:#fff;border:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:800;font-family:'Sora',sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(24,114,181,.3);}
        .rv-write-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(24,114,181,.4);}

        .rv-summary{display:grid;grid-template-columns:200px 1fr auto;gap:32px;align-items:center;background:#fff;border:1.5px solid #e5e7eb;border-radius:18px;padding:24px 28px;margin-bottom:28px;box-shadow:0 4px 16px rgba(0,0,0,.06);}
        .rv-avg-num{font-family:'Sora',sans-serif;font-size:52px;font-weight:800;color:#0a214f;line-height:1;}
        .rv-avg-sub{font-size:13px;color:#6b7280;margin-top:6px;}
        .rv-bars{display:flex;flex-direction:column;gap:7px;flex:1;}
        .rv-bar-row{display:flex;align-items:center;gap:10px;font-size:13px;}
        .rv-bar-label{width:28px;text-align:right;color:#6b7280;font-weight:600;flex-shrink:0;}
        .rv-bar-wrap{flex:1;height:8px;background:#f3f4f6;border-radius:10px;overflow:hidden;}
        .rv-bar-fill{height:100%;background:linear-gradient(90deg,#10b981,#34d399);border-radius:10px;transition:width .6s ease;}
        .rv-bar-count{width:20px;color:#6b7280;font-size:12px;font-weight:600;}

        .rv-sort{display:flex;align-items:center;gap:10px;margin-bottom:20px;}
        .rv-sort select{padding:8px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:13px;font-weight:700;color:#374151;font-family:'Nunito',sans-serif;outline:none;cursor:pointer;background:#fff;}
        .rv-sort select:focus{border-color:#1872B5;}
        .rv-sort-label{font-size:12px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;}

        .rv-list{display:flex;flex-direction:column;gap:14px;}
        .rv-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;padding:20px 22px;animation:fadeInUp .35s ease both;transition:box-shadow .2s;}
        .rv-card:hover{box-shadow:0 6px 24px rgba(0,0,0,.08);}
        .rv-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px;}
        .rv-card-left{display:flex;align-items:center;gap:12px;}
        .rv-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#1872B5,#2596e1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:800;font-family:'Sora',sans-serif;flex-shrink:0;}
        .rv-reviewer{font-size:14px;font-weight:800;color:#0a214f;}
        .rv-verified{background:#d1fae5;color:#065f46;font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px;margin-left:6px;}
        .rv-date{font-size:12px;color:#9ca3af;font-weight:600;}
        .rv-content{font-size:14px;color:#374151;line-height:1.75;}
        .rv-empty{text-align:center;padding:48px 20px;color:#9ca3af;font-size:14px;}
        .rv-empty-icon{font-size:48px;margin-bottom:12px;}

        /* ── Modal ── */
        .rv-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;visibility:hidden;transition:all .3s;}
        .rv-overlay.open{opacity:1;visibility:visible;}
        .rv-modal{background:#fff;border-radius:22px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;position:relative;transform:scale(.96) translateY(20px);transition:transform .35s cubic-bezier(.34,1.56,.64,1);box-shadow:0 30px 70px rgba(0,0,0,.22);}
        .rv-overlay.open .rv-modal{transform:scale(1) translateY(0);}
        .rv-modal-header{background:linear-gradient(135deg,#1872B5,#2596e1);padding:24px 26px 20px;border-radius:22px 22px 0 0;position:relative;}
        .rv-modal-header h3{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:#fff;margin:0 0 3px;}
        .rv-modal-header p{font-size:13px;color:rgba(255,255,255,.75);margin:0;}
        .rv-modal-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.18);border:none;color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
        .rv-modal-close:hover{background:rgba(255,255,255,.3);}
        .rv-modal-body{padding:22px 26px 28px;}

        /* Step indicator */
        .rv-steps{display:flex;align-items:center;gap:8px;margin-bottom:22px;}
        .rv-step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;font-family:'Sora',sans-serif;transition:all .25s;}
        .rv-step-dot.done{background:#10b981;color:#fff;}
        .rv-step-dot.active{background:#1872B5;color:#fff;box-shadow:0 0 0 4px rgba(24,114,181,.2);}
        .rv-step-dot.idle{background:#f3f4f6;color:#9ca3af;}
        .rv-step-line{flex:1;height:2px;background:#e5e7eb;border-radius:2px;}
        .rv-step-line.done{background:#10b981;}

        /* Star picker */
        .rv-star-picker{display:flex;justify-content:center;gap:10px;margin:16px 0 8px;}
        .rv-star-pick{font-size:44px;cursor:pointer;transition:transform .15s,color .15s;color:#d1d5db;line-height:1;}
        .rv-star-pick.filled{color:#10b981;}
        .rv-star-pick:hover{transform:scale(1.18);}
        .rv-rating-label{text-align:center;font-size:15px;font-weight:800;color:#1872B5;font-family:'Sora',sans-serif;height:22px;margin-bottom:16px;}

        .rv-field{margin-bottom:14px;}
        .rv-field label{display:block;font-size:11px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
        .rv-field input,.rv-field textarea{width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;color:#1c1c1c;font-family:'Nunito',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;background:#f9fafb;box-sizing:border-box;}
        .rv-field input:focus,.rv-field textarea:focus{border-color:#1872B5;background:#fff;box-shadow:0 0 0 3px rgba(24,114,181,.1);}
        .rv-field textarea{height:100px;resize:vertical;}
        .rv-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

        .rv-modal-actions{display:flex;justify-content:space-between;align-items:center;margin-top:6px;}
        .rv-btn-back{background:none;border:2px solid #e5e7eb;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:800;color:#6b7280;cursor:pointer;font-family:'Sora',sans-serif;display:flex;align-items:center;gap:7px;transition:all .18s;}
        .rv-btn-back:hover{border-color:#1872B5;color:#1872B5;}
        .rv-btn-next{background:linear-gradient(135deg,#1872B5,#2596e1);color:#fff;border:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:800;font-family:'Sora',sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(24,114,181,.3);}
        .rv-btn-next:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(24,114,181,.4);}
        .rv-btn-next:disabled{opacity:.6;cursor:not-allowed;}

        .rv-success{padding:40px 20px;text-align:center;}
        .rv-success-icon{width:64px;height:64px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px;animation:checkPop .5s ease both;}
        .rv-success h4{font-family:'Sora',sans-serif;font-size:20px;color:#065f46;margin:0 0 8px;}
        .rv-success p{font-size:14px;color:#6b7280;}

        .rv-error-msg{background:#fee2e2;color:#991b1b;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:14px;}
.rv-topbar {
    display: none!important;
}
        @media(max-width:640px){
          .rv-summary{grid-template-columns:1fr;gap:16px;}
          .rv-row{grid-template-columns:1fr;}
          .rv-section{padding:0 16px 48px;}
        }
      `}</style>

      <div className="rv-section">

        {/* ── Header ── */}
        <div className="rv-head">
          <div className="rv-head-title">Customer Reviews</div>
          <button className="rv-write-btn" onClick={openModal}>
            <span style={{ fontSize: 16 }}>✏️</span> Write a Review
          </button>
        </div>

        {/* ── Summary ── */}
        {!loading && data && (
          <div className="rv-summary">
            {/* Average */}
            <div style={{ textAlign: 'center' }}>
              <div className="rv-avg-num">{data.average > 0 ? data.average : '—'}</div>
              <div style={{ margin: '6px 0 4px' }}>
                <Stars rating={data.average} size={20} />
              </div>
              <div className="rv-avg-sub">
                {data.total > 0 ? `Based on ${data.total} review${data.total > 1 ? 's' : ''}` : 'No reviews yet'}
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="rv-bars">
              {[5, 4, 3, 2, 1].map(star => {
                const count = data.breakdown?.[star] ?? 0;
                const pct   = data.total > 0 ? (count / data.total) * 100 : 0;
                return (
                  <div className="rv-bar-row" key={star}>
                    <span className="rv-bar-label">{star}★</span>
                    <div className="rv-bar-wrap">
                      <div className="rv-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="rv-bar-count">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Write CTA (desktop right) */}
            <div style={{ textAlign: 'center' }}>
              <button
                className="rv-write-btn"
                onClick={openModal}
                style={{ flexDirection: 'column', gap: 4, padding: '14px 20px', minWidth: 130 }}
              >
                <span style={{ fontSize: 22 }}>✏️</span>
                <span>Write a review</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Sort ── */}
        {data?.total > 0 && (
          <div className="rv-sort">
            <span className="rv-sort-label">Sort by</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        )}

        {/* ── Review List ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>Loading reviews...</div>
        ) : sortedReviews().length === 0 ? (
          <div className="rv-empty">
            <div className="rv-empty-icon">💬</div>
            <div style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>No reviews yet</div>
            <div>Be the first to review this product!</div>
          </div>
        ) : (
          <div className="rv-list">
            {sortedReviews().map((rv, i) => (
              <div className="rv-card" key={rv.id} style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="rv-card-top">
                  <div className="rv-card-left">
                    <div className="rv-avatar">{rv.reviewer_name?.[0]?.toUpperCase() || 'A'}</div>
                    <div>
                      <div className="rv-reviewer">
                        {rv.reviewer_name || 'Anonymous'}
                        {rv.is_verified && <span className="rv-verified">✓ Verified</span>}
                      </div>
                      <Stars rating={rv.rating} size={14} />
                    </div>
                  </div>
                  <div className="rv-date">
                    {new Date(rv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>
                <div className="rv-content">{rv.review_content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          WRITE REVIEW MODAL
      ══════════════════════════════════════════ */}
      <div
        className={`rv-overlay ${modalOpen ? 'open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
      >
        <div className="rv-modal">
          {/* Header */}
          <div className="rv-modal-header">
            <h3>Write a Review</h3>
            <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}>
              {productTitle}
            </p>
            <button className="rv-modal-close" onClick={() => setModalOpen(false)}>×</button>
          </div>

          {/* Body */}
          <div className="rv-modal-body">

            {/* Success state */}
            {submitStatus === 'success' ? (
              <div className="rv-success">
                <div className="rv-success-icon">✅</div>
                <h4>Review Submitted!</h4>
                <p>Thank you for your feedback.</p>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="rv-steps">
                  <div className={`rv-step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : 'idle'}`}>
                    {step > 1 ? '✓' : '1'}
                  </div>
                  <div className={`rv-step-line ${step > 1 ? 'done' : ''}`} />
                  <div className={`rv-step-dot ${step >= 2 ? 'active' : 'idle'}`}>2</div>
                </div>

                {/* ── Step 1: Star Rating ── */}
                {step === 1 && (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: 6, fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
                      How would you rate this product?
                    </div>

                    <div className="rv-star-picker">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span
                          key={i}
                          className={`rv-star-pick ${form.rating >= i ? 'filled' : ''}`}
                          onClick={() => setForm(f => ({ ...f, rating: i }))}
                        >★</span>
                      ))}
                    </div>

                    <div className="rv-rating-label">
                      {form.rating > 0 ? ratingLabel[form.rating] : ''}
                    </div>

                    <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
                      We'll only contact you about your review if necessary. By submitting, you agree to our terms and conditions.
                    </div>

                    <div className="rv-modal-actions">
                      <button className="rv-btn-back" onClick={() => setModalOpen(false)}>
                        ← Back
                      </button>
                      <button
                        className="rv-btn-next"
                        disabled={form.rating === 0}
                        onClick={() => setStep(2)}
                      >
                        Next →
                      </button>
                    </div>
                  </>
                )}

                {/* ── Step 2: Review Content + Name ── */}
                {step === 2 && (
                  <>
                    {submitStatus === 'error' && (
                      <div className="rv-error-msg">⚠️ Something went wrong. Please try again.</div>
                    )}
                    {submitStatus === 'duplicate' && (
                      <div className="rv-error-msg">⚠️ You have already reviewed this product.</div>
                    )}

                    <div className="rv-field">
                      <label>Review Content (Required)</label>
                      <textarea
                        placeholder="Start writing here..."
                        value={form.review_content}
                        onChange={e => setForm(f => ({ ...f, review_content: e.target.value }))}
                      />
                    </div>

                    <div className="rv-row">
                      <div className="rv-field">
                        <label>Your Name *</label>
                        <input
                          type="text"
                          placeholder="John Smith"
                          value={form.reviewer_name}
                          onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))}
                        />
                      </div>
                      <div className="rv-field">
                        <label>Email (optional)</label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={form.reviewer_email}
                          onChange={e => setForm(f => ({ ...f, reviewer_email: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="rv-modal-actions">
                      <button className="rv-btn-back" onClick={() => setStep(1)}>
                        ← Back
                      </button>
                      <button
                        className="rv-btn-next"
                        disabled={submitting || !form.reviewer_name.trim() || !form.review_content.trim()}
                        onClick={handleSubmit}
                      >
                        {submitting ? '⏳ Submitting...' : '✅ Submit Review'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}