'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/components/CartContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ═══════════════════════════════════════════
// STARS COMPONENT
// ═══════════════════════════════════════════
function Stars({ rating, size = 16, interactive = false, onSelect, hoverRating = 0 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = interactive ? (hoverRating || rating) >= i : rating >= i;
        return (
          <span
            key={i}
            onClick={() => interactive && onSelect && onSelect(i)}
            style={{
              fontSize: size,
              color: filled ? '#10b981' : '#d1d5db',
              cursor: interactive ? 'pointer' : 'default',
              transition: 'color .15s, transform .15s',
              userSelect: 'none',
              display: 'inline-block',
            }}
          >★</span>
        );
      })}
    </span>
  );
}

// ═══════════════════════════════════════════
// REVIEWS SECTION COMPONENT
// ═══════════════════════════════════════════
function ReviewsSection({ productId, productTitle }) {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [sort, setSort]             = useState('newest');
  const [modalOpen, setModalOpen]   = useState(false);
  const [step, setStep]             = useState(1);
  const [hover, setHover]           = useState(0);
  const [form, setForm]             = useState({ rating: 0, review_content: '', reviewer_name: '', reviewer_email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');

  const fetchReviews = () => {
    setLoading(true);
    fetch(`${API_URL}/api/products/${productId}/reviews`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { if (productId) fetchReviews(); }, [productId]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const openModal = () => {
    setForm({ rating: 0, review_content: '', reviewer_name: '', reviewer_email: '' });
    setStep(1); setHover(0); setSubmitStatus('idle'); setModalOpen(true);
  };

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
    } catch { setSubmitStatus('error'); }
    setSubmitting(false);
  };

  const sortedReviews = () => {
    if (!data?.reviews) return [];
    const arr = [...data.reviews];
    if (sort === 'newest')  return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sort === 'oldest')  return arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sort === 'highest') return arr.sort((a, b) => b.rating - a.rating);
    if (sort === 'lowest')  return arr.sort((a, b) => a.rating - b.rating);
    return arr;
  };

  const ratingLabel = ['', 'Poor', 'Fair', 'Average', 'Good', 'Great'];

  return (
    <>
      <style>{`
        @keyframes rvFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rvCheckPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes rvModalIn{from{opacity:0;transform:scale(.95) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}

        .rv-wrap{padding:8px 0 0;}
        .rv-topbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:24px;}
        .rv-write-btn{background:linear-gradient(135deg,#1872B5,#2596e1);color:#fff;border:none;padding:11px 22px;border-radius:10px;font-size:13px;font-weight:800;font-family:'Sora',sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(24,114,181,.28);}
        .rv-write-btn:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(24,114,181,.38);}

        .rv-summary-grid{display:grid;grid-template-columns:180px 1fr 160px;gap:28px;align-items:center;background:#f8faff;border:1.5px solid #e0eaff;border-radius:16px;padding:22px 26px;margin-bottom:24px;}
        .rv-avg-big{font-family:'Sora',sans-serif;font-size:48px;font-weight:800;color:#0a214f;line-height:1;text-align:center;}
        .rv-avg-label{font-size:12px;color:#6b7280;margin-top:5px;text-align:center;}
        .rv-bars{display:flex;flex-direction:column;gap:7px;}
        .rv-bar-row{display:flex;align-items:center;gap:10px;font-size:12px;}
        .rv-bar-lbl{width:24px;text-align:right;color:#6b7280;font-weight:700;flex-shrink:0;}
        .rv-bar-track{flex:1;height:7px;background:#e5e7eb;border-radius:10px;overflow:hidden;}
        .rv-bar-fill{height:100%;background:linear-gradient(90deg,#10b981,#34d399);border-radius:10px;transition:width .7s cubic-bezier(.4,0,.2,1);}
        .rv-bar-cnt{width:18px;font-size:11px;color:#9ca3af;font-weight:700;}
        .rv-cta-box{display:flex;flex-direction:column;align-items:center;gap:10px;}
        .rv-cta-big{background:linear-gradient(135deg,#1872B5,#2596e1);color:#fff;border:none;padding:13px 18px;border-radius:12px;font-size:13px;font-weight:800;font-family:'Sora',sans-serif;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(24,114,181,.28);}
        .rv-cta-big:hover{transform:translateY(-2px);}
        .rv-cta-note{font-size:11px;color:#9ca3af;text-align:center;line-height:1.5;}

        .rv-sort-row{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
        .rv-sort-lbl{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;}
        .rv-sort-sel{padding:7px 13px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:13px;font-weight:700;color:#374151;font-family:'Nunito',sans-serif;outline:none;cursor:pointer;background:#fff;}
        .rv-sort-sel:focus{border-color:#1872B5;}

        .rv-list{display:flex;flex-direction:column;gap:12px;}
        .rv-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:18px 20px;animation:rvFadeUp .3s ease both;transition:box-shadow .2s,border-color .2s;}
        .rv-card:hover{box-shadow:0 6px 22px rgba(0,0,0,.08);border-color:#d0e4ff;}
        .rv-card-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px;}
        .rv-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#1872B5,#2596e1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:800;font-family:'Sora',sans-serif;flex-shrink:0;}
        .rv-rname{font-size:14px;font-weight:800;color:#0a214f;}
        .rv-vbadge{background:#d1fae5;color:#065f46;font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;margin-left:5px;vertical-align:middle;}
        .rv-date{font-size:11px;color:#9ca3af;font-weight:600;}
        .rv-text{font-size:14px;color:#4b5563;line-height:1.75;}
        .rv-empty{text-align:center;padding:40px 20px;}
        .rv-empty-ico{font-size:44px;margin-bottom:10px;}

        /* Modal */
        .rv-ov{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;visibility:hidden;transition:all .3s;}
        .rv-ov.open{opacity:1;visibility:visible;}
        .rv-mod{background:#fff;border-radius:20px;width:100%;max-width:490px;max-height:90vh;overflow-y:auto;position:relative;transform:scale(.95) translateY(18px);transition:transform .35s cubic-bezier(.34,1.56,.64,1);box-shadow:0 30px 70px rgba(0,0,0,.22);}
        .rv-ov.open .rv-mod{transform:scale(1) translateY(0);}
        .rv-mod-hd{background:linear-gradient(135deg,#1872B5,#2596e1);padding:22px 24px 18px;border-radius:20px 20px 0 0;position:relative;}
        .rv-mod-hd h3{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:#fff;margin:0 0 3px;}
        .rv-mod-hd p{font-size:12px;color:rgba(255,255,255,.75);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:360px;}
        .rv-mod-x{position:absolute;top:13px;right:13px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.18);border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
        .rv-mod-x:hover{background:rgba(255,255,255,.3);}
        .rv-mod-bd{padding:20px 24px 26px;}

        .rv-steps{display:flex;align-items:center;gap:8px;margin-bottom:20px;}
        .rv-sdot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;font-family:'Sora',sans-serif;transition:all .25s;flex-shrink:0;}
        .rv-sdot.done{background:#10b981;color:#fff;}
        .rv-sdot.active{background:#1872B5;color:#fff;box-shadow:0 0 0 4px rgba(24,114,181,.2);}
        .rv-sdot.idle{background:#f3f4f6;color:#9ca3af;}
        .rv-sline{flex:1;height:2px;background:#e5e7eb;border-radius:2px;}
        .rv-sline.done{background:#10b981;}

        .rv-stars-big{display:flex;justify-content:center;gap:8px;margin:14px 0 6px;}
        .rv-star-ico{font-size:42px;cursor:pointer;transition:transform .15s,color .15s;color:#d1d5db;line-height:1;display:inline-block;}
        .rv-star-ico.on{color:#10b981;}
        .rv-star-ico:hover{transform:scale(1.15);}
        .rv-rlbl{text-align:center;font-size:14px;font-weight:800;color:#1872B5;font-family:'Sora',sans-serif;height:20px;margin-bottom:14px;}

        .rv-field{margin-bottom:13px;}
        .rv-field label{display:block;font-size:10px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px;}
        .rv-field input,.rv-field textarea{width:100%;padding:10px 13px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:14px;color:#1c1c1c;font-family:'Nunito',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;background:#f9fafb;box-sizing:border-box;}
        .rv-field input:focus,.rv-field textarea:focus{border-color:#1872B5;background:#fff;box-shadow:0 0 0 3px rgba(24,114,181,.1);}
        .rv-field textarea{height:95px;resize:vertical;}
        .rv-2col{display:grid;grid-template-columns:1fr 1fr;gap:11px;}

        .rv-actions{display:flex;justify-content:space-between;align-items:center;margin-top:4px;}
        .rv-btn-back{background:none;border:2px solid #e5e7eb;padding:10px 20px;border-radius:9px;font-size:13px;font-weight:800;color:#6b7280;cursor:pointer;font-family:'Sora',sans-serif;display:flex;align-items:center;gap:6px;transition:all .18s;}
        .rv-btn-back:hover{border-color:#1872B5;color:#1872B5;}
        .rv-btn-next{background:linear-gradient(135deg,#1872B5,#2596e1);color:#fff;border:none;padding:11px 26px;border-radius:9px;font-size:13px;font-weight:800;font-family:'Sora',sans-serif;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .22s;box-shadow:0 4px 14px rgba(24,114,181,.28);}
        .rv-btn-next:hover:not(:disabled){transform:translateY(-1px);}
        .rv-btn-next:disabled{opacity:.55;cursor:not-allowed;}

        .rv-success{padding:36px 20px;text-align:center;}
        .rv-success-ico{width:60px;height:60px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 14px;animation:rvCheckPop .5s ease both;}
        .rv-success h4{font-family:'Sora',sans-serif;font-size:19px;color:#065f46;margin:0 0 6px;}
        .rv-success p{font-size:13px;color:#6b7280;}
        .rv-err-msg{background:#fee2e2;color:#991b1b;padding:9px 13px;border-radius:8px;font-size:12px;font-weight:600;margin-bottom:12px;}

        @media(max-width:700px){
          .rv-summary-grid{grid-template-columns:1fr;gap:14px;}
          .rv-cta-box{flex-direction:row;flex-wrap:wrap;}
          .rv-2col{grid-template-columns:1fr;}
        }
      `}</style>

      <div className="rv-wrap">
        {/* Top bar */}
        <div className="rv-topbar">
          <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
            {loading ? 'Loading...' : `${data?.total ?? 0} review${(data?.total ?? 0) !== 1 ? 's' : ''}`}
          </div>
          <button className="rv-write-btn" onClick={openModal}>✏️ Write a Review</button>
        </div>

        {/* Summary */}
        {!loading && data && (
          <div className="rv-summary-grid">
            <div>
              <div className="rv-avg-big">{data.average > 0 ? data.average : '—'}</div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '5px 0 3px' }}>
                <Stars rating={parseFloat(data.average)} size={18} />
              </div>
              <div className="rv-avg-label">
                {data.total > 0 ? `Based on ${data.total} review${data.total > 1 ? 's' : ''}` : 'No reviews yet'}
              </div>
            </div>

            <div className="rv-bars">
              {[5, 4, 3, 2, 1].map(star => {
                const cnt = data.breakdown?.[star] ?? 0;
                const pct = data.total > 0 ? (cnt / data.total) * 100 : 0;
                return (
                  <div className="rv-bar-row" key={star}>
                    <span className="rv-bar-lbl">{star}★</span>
                    <div className="rv-bar-track">
                      <div className="rv-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="rv-bar-cnt">{cnt}</span>
                  </div>
                );
              })}
            </div>

            <div className="rv-cta-box">
              <button className="rv-cta-big" onClick={openModal}>✏️ Write a Review</button>
              <div className="rv-cta-note">Share your experience with this product</div>
            </div>
          </div>
        )}

        {/* Sort */}
        {(data?.total ?? 0) > 0 && (
          <div className="rv-sort-row">
            <span className="rv-sort-lbl">Sort</span>
            <select className="rv-sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        )}

        {/* Reviews list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontSize: 14 }}>Loading reviews...</div>
        ) : sortedReviews().length === 0 ? (
          <div className="rv-empty">
            <div className="rv-empty-ico">💬</div>
            <div style={{ fontWeight: 700, color: '#374151', marginBottom: 6, fontSize: 15 }}>No reviews yet</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>Be the first to share your experience!</div>
          </div>
        ) : (
          <div className="rv-list">
            {sortedReviews().map((rv, i) => (
              <div className="rv-card" key={rv.id} style={{ animationDelay: `${i * 0.055}s` }}>
                <div className="rv-card-hd">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div className="rv-avatar">{(rv.reviewer_name?.[0] || 'A').toUpperCase()}</div>
                    <div>
                      <div className="rv-rname">
                        {rv.reviewer_name || 'Anonymous'}
                        {rv.is_verified && <span className="rv-vbadge">✓ Verified</span>}
                      </div>
                      <Stars rating={rv.rating} size={13} />
                    </div>
                  </div>
                  <div className="rv-date">
                    {new Date(rv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>
                <div className="rv-text">{rv.review_content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      <div className={`rv-ov ${modalOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <div className="rv-mod">
          <div className="rv-mod-hd">
            <h3>Write a Review</h3>
            <p>{productTitle}</p>
            <button className="rv-mod-x" onClick={() => setModalOpen(false)}>×</button>
          </div>
          <div className="rv-mod-bd">
            {submitStatus === 'success' ? (
              <div className="rv-success">
                <div className="rv-success-ico">✅</div>
                <h4>Review Submitted!</h4>
                <p>Thank you for your feedback.</p>
              </div>
            ) : (
              <>
                {/* Steps */}
                <div className="rv-steps">
                  <div className={`rv-sdot ${step > 1 ? 'done' : 'active'}`}>{step > 1 ? '✓' : '1'}</div>
                  <div className={`rv-sline ${step > 1 ? 'done' : ''}`} />
                  <div className={`rv-sdot ${step >= 2 ? 'active' : 'idle'}`}>2</div>
                </div>

                {/* Step 1 */}
                {step === 1 && (
                  <>
                    <div style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>
                      How would you rate this product?
                    </div>
                    <div className="rv-stars-big">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span
                          key={i}
                          className={`rv-star-ico ${(hover || form.rating) >= i ? 'on' : ''}`}
                          onClick={() => setForm(f => ({ ...f, rating: i }))}
                          onMouseEnter={() => setHover(i)}
                          onMouseLeave={() => setHover(0)}
                        >★</span>
                      ))}
                    </div>
                    <div className="rv-rlbl">{form.rating > 0 ? ratingLabel[form.rating] : ''}</div>
                    <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginBottom: 20, lineHeight: 1.6 }}>
                      We'll only contact you about your review if necessary.<br />
                      By submitting, you agree to our terms and conditions.
                    </div>
                    <div className="rv-actions">
                      <button className="rv-btn-back" onClick={() => setModalOpen(false)}>← Back</button>
                      <button className="rv-btn-next" disabled={form.rating === 0} onClick={() => setStep(2)}>Next →</button>
                    </div>
                  </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <>
                    {submitStatus === 'error'     && <div className="rv-err-msg">⚠️ Something went wrong. Please try again.</div>}
                    {submitStatus === 'duplicate' && <div className="rv-err-msg">⚠️ You have already reviewed this product.</div>}
                    <div className="rv-field">
                      <label>Review Content (Required)</label>
                      <textarea placeholder="Start writing here..." value={form.review_content} onChange={e => setForm(f => ({ ...f, review_content: e.target.value }))} />
                    </div>
                    <div className="rv-2col">
                      <div className="rv-field">
                        <label>Your Name *</label>
                        <input type="text" placeholder="John Smith" value={form.reviewer_name} onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))} />
                      </div>
                      <div className="rv-field">
                        <label>Email (optional)</label>
                        <input type="email" placeholder="you@example.com" value={form.reviewer_email} onChange={e => setForm(f => ({ ...f, reviewer_email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="rv-actions">
                      <button className="rv-btn-back" onClick={() => setStep(1)}>← Back</button>
                      <button className="rv-btn-next" disabled={submitting || !form.reviewer_name.trim() || !form.review_content.trim()} onClick={handleSubmit}>
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

// ═══════════════════════════════════════════
// MAIN PRODUCT DETAIL PAGE
// ═══════════════════════════════════════════
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct]                 = useState<any>(null);
  const [loading, setLoading]                 = useState(true);
  const [curSlide, setCurSlide]               = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [enquiryOpen, setEnquiryOpen]         = useState(false);
  const [addedAnim, setAddedAnim]             = useState(false);
  const [formData, setFormData]               = useState({ name: '', phone: '', email: '', address: '', message: '' });
  const [formStatus, setFormStatus]           = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [related, setRelated]                 = useState<any[]>([]);
  const [discount, setDiscount]               = useState<any>(null);
  const [zoomOpen, setZoomOpen]               = useState(false);
  const [quantity, setQuantity]               = useState(1);
  const [activeTab, setActiveTab]             = useState(0);
  const [reviewsData, setReviewsData]         = useState<any>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  /* ── Fetch product ── */
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API_URL}/api/products/${slug}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        if (data.variants?.length) setSelectedVariant(data.variants[0]);
        setLoading(false);

        if (data.id) {
          fetch(`${API_URL}/api/product-discount/${data.id}`)
            .then(r => r.json())
            .then(d => { if (d.has_discount) setDiscount(d); })
            .catch(() => {});
        }

        fetch(`${API_URL}/api/products`)
          .then(r => r.json())
          .then((all: any[]) => {
            const catIds = data.categories?.map((c: any) => c.id) || [];
            const rel = all
              .filter((p: any) => p.id !== data.id && p.categories?.some((c: any) => catIds.includes(c.id)))
              .slice(0, 5);
            setRelated(rel.length ? rel : all.filter((p: any) => p.id !== data.id).slice(0, 5));
          });
      })
      .catch(() => setLoading(false));
  }, [slug]);

  /* ── Fetch reviews for summary ── */
  useEffect(() => {
    if (!product?.id) return;
    fetch(`${API_URL}/api/products/${product.id}/reviews`)
      .then(r => r.json())
      .then(d => setReviewsData(d))
      .catch(() => {});
  }, [product?.id]);

  /* ── Parse extra_tabs ── */
  const getExtraTabs = (): Array<{ title: string; content: string }> => {
    if (!product?.extra_tabs) return [];
    try {
      const raw = product.extra_tabs;
      if (Array.isArray(raw)) return raw;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };

  /* All tabs: Description + extra tabs + Reviews */
  const allTabs = [
    { title: 'Description', content: product?.description || '', type: 'html' },
    ...getExtraTabs().map(t => ({ ...t, type: 'html' })),
    { title: '⭐ Reviews', content: '__REVIEWS__', type: 'reviews' },
  ];

  /* ── Images ── */
  const getImages = () => {
    if (!product) return [];
    const imgs: any[] = [];
    if (product.featured_image)
      imgs.push({ src: `${API_URL}/uploads/products/${product.featured_image}`, alt: product.featured_image_alt || product.title, type: 'image' });
    (product.images || []).forEach((gi: any) =>
      imgs.push({ src: `${API_URL}/uploads/products/gallery/${gi.image}`, alt: gi.alt_tag || product.title, type: gi.type || 'image' })
    );
    return imgs;
  };

  const imgs = getImages();
  const goSlide = (n: number) => {
    const total = imgs.length;
    const next = ((n % total) + total) % total;
    setCurSlide(next);
    if (thumbsRef.current) {
      const thumbW = 70; const gap = 8;
      const containerW = thumbsRef.current.offsetWidth;
      const scrollTo = next * (thumbW + gap) - containerW / 2 + thumbW / 2;
      thumbsRef.current.scrollTo({ left: Math.max(0, scrollTo), behavior: 'smooth' });
    }
  };

  let touchStartX = 0;
  const onTouchStart = (e: React.TouchEvent) => { touchStartX = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goSlide(curSlide + 1) : goSlide(curSlide - 1);
  };

  /* ── Price helpers ── */
  const getPrice   = () => { if (selectedVariant?.price) return parseFloat(selectedVariant.price); if (product?.sale_price) return parseFloat(product.sale_price); if (product?.price) return parseFloat(product.price); return null; };
  const getCompare = () => { if (selectedVariant?.compare_price) return parseFloat(selectedVariant.compare_price); if (product?.sale_price && product?.price) return parseFloat(product.price); return null; };
  const getVariantDisc = () => { const p = getPrice(), c = getCompare(); if (!p || !c || c <= p) return null; return Math.round(((c - p) / c) * 100); };

  /* ── Discount helpers ── */
  const isBxgy = discount?.type === 'buy_x_get_y';
  const getBxgyFreeQty = (): number => { if (!isBxgy || !discount) return 0; const buyQty = discount.buy_quantity ?? 1; const getQty = discount.get_quantity ?? 1; const maxUses = discount.max_uses_per_order ?? 999; const sets = Math.min(Math.floor(quantity / buyQty), maxUses); return sets * getQty; };
  const getBxgyDiscountedPrice = (op: number): number => { if (!isBxgy || !discount) return op; const fq = getBxgyFreeQty(); if (fq === 0) return op; if (discount.get_value_type === 'free') { return Math.round((op * (quantity - fq)) / quantity); } if (discount.get_value_type === 'percentage') { const td = (op * discount.get_value / 100) * fq; return Math.round(((op * quantity) - td) / quantity); } return op; };
  const getBxgyLabel = (): string => { if (!isBxgy || !discount) return ''; if (discount.get_value_type === 'free') return `Buy ${discount.buy_quantity} Get ${discount.get_quantity} Free`; if (discount.get_value_type === 'percentage') return `Buy ${discount.buy_quantity} Get ${discount.get_quantity} @ ${discount.get_value}% OFF`; return `Buy ${discount.buy_quantity} Get ${discount.get_quantity}`; };
  const isBxgyApplicable = (): boolean => { if (!isBxgy || !discount) return false; return quantity >= (discount.buy_quantity ?? 1); };
  const isDiscountApplicable = (): boolean => { if (!discount) return false; if (isBxgy) return isBxgyApplicable(); const minQty = discount.min_quantity ?? 0; const minAmt = discount.min_amount ?? 0; if (minQty > 0 && quantity < minQty) return false; if (minAmt > 0) { const p = getPrice(); if (!p || p * quantity < minAmt) return false; } return true; };
  const getDiscountedPrice = (op: number): number => { if (!discount || !isDiscountApplicable()) return op; if (isBxgy) return getBxgyDiscountedPrice(op); if (discount.value_type === 'percentage') return Math.round(op - (op * discount.value / 100)); return Math.max(0, op - discount.value); };
  const getDiscountLabel = (): string => { if (!discount) return ''; if (isBxgy) return getBxgyLabel(); return discount.value_type === 'percentage' ? `${discount.value}% OFF` : `₹${discount.value} OFF`; };
  const getSavingsAmount = (op: number): number => { if (!isDiscountApplicable()) return 0; if (isBxgy) { const fq = getBxgyFreeQty(); if (discount.get_value_type === 'free') return op * fq; if (discount.get_value_type === 'percentage') return Math.round((op * discount.get_value / 100) * fq); return 0; } return op - getDiscountedPrice(op); };

  /* ── Quantity ── */
  const maxStock    = product?.stock_quantity ?? 99;
  const decreaseQty = () => setQuantity(q => Math.max(1, q - 1));
  const increaseQty = () => setQuantity(q => Math.min(maxStock, q + 1));

  /* ── Add to Cart ── */
  const handleAddToCart = () => {
    const price = getPrice();
    if (!price || !product) return;
    const applicable = isDiscountApplicable();
    const discountLabel = applicable ? getDiscountLabel() : undefined;
    if (isBxgy && applicable) {
      const freeQty = getBxgyFreeQty();
      for (let i = 0; i < quantity; i++) addToCart({ id: product.id, slug: product.slug, title: product.title, image: product.featured_image ? `${API_URL}/uploads/products/${product.featured_image}` : null, price, discountedPrice: undefined, discountLabel: undefined, variant: selectedVariant?.name || undefined });
      for (let i = 0; i < freeQty; i++) addToCart({ id: product.id, slug: product.slug, title: product.title, image: product.featured_image ? `${API_URL}/uploads/products/${product.featured_image}` : null, price, discountedPrice: 0, discountLabel: '🎁 FREE', variant: `${selectedVariant?.name || ''}__FREE__` });
    } else {
      const discountedPrice = applicable ? getDiscountedPrice(price) : undefined;
      for (let i = 0; i < quantity; i++) addToCart({ id: product.id, slug: product.slug, title: product.title, image: product.featured_image ? `${API_URL}/uploads/products/${product.featured_image}` : null, price, discountedPrice, discountLabel, variant: selectedVariant?.name || undefined });
    }
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1800);
  };

  /* ── Enquiry ── */
  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    try {
      const res = await fetch(`${API_URL}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, product_name: product?.title }) });
      if (res.ok) { setFormStatus('success'); setTimeout(() => { setEnquiryOpen(false); setFormStatus('idle'); setFormData({ name: '', phone: '', email: '', address: '', message: '' }); }, 2500); }
      else setFormStatus('error');
    } catch { setFormStatus('error'); }
  };

  /* ── Related price helpers ── */
  const relPrice   = (p: any) => p.sale_price ? parseFloat(p.sale_price) : p.price ? parseFloat(p.price) : p.variants?.[0]?.price ? parseFloat(p.variants[0].price) : null;
  const relCompare = (p: any) => p.sale_price && p.price ? parseFloat(p.price) : p.variants?.[0]?.compare_price ? parseFloat(p.variants[0].compare_price) : null;

  /* ── Keyboard ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goSlide(curSlide + 1);
      if (e.key === 'ArrowLeft')  goSlide(curSlide - 1);
      if (e.key === 'Escape')     { setEnquiryOpen(false); setZoomOpen(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [curSlide]);

  useEffect(() => {
    document.body.style.overflow = (enquiryOpen || zoomOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [enquiryOpen, zoomOpen]);

  /* ══ LOADING ══ */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', gap: 16, fontFamily: 'Nunito,sans-serif' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #dbeafe', borderTopColor: '#1872B5', animation: 'spin .8s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: 14 }}>Loading product...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'Nunito,sans-serif' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
      <h2 style={{ color: '#374151', marginBottom: 8, fontFamily: 'Sora,sans-serif' }}>Product not found</h2>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>This product may have been removed.</p>
      <Link href="/collections" style={{ background: '#1872B5', color: '#fff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Back to Shop</Link>
    </div>
  );

  const price         = getPrice();
  const compare       = getCompare();
  const variantDisc   = getVariantDisc();
  const inStock       = product.stock_quantity > 0;
  const applicable    = isDiscountApplicable();
  const finalPrice    = price && applicable ? getDiscountedPrice(price) : price;
  const savings       = price && applicable ? getSavingsAmount(price) : 0;
  const discountLabel = getDiscountLabel();
  const minQty        = discount?.min_quantity ?? 0;
  const needMoreForDisc  = discount && !applicable && minQty > 0 && quantity < minQty;
  const bxgyFreeQty      = getBxgyFreeQty();
  const needMoreForBxgy  = isBxgy && !isBxgyApplicable() && discount;

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
        @keyframes cartBounce{0%{transform:scale(1)}30%{transform:scale(1.12)}60%{transform:scale(.95)}100%{transform:scale(1)}}
        @keyframes checkPop{0%{opacity:0;transform:scale(0)}70%{transform:scale(1.2)}100%{opacity:1;transform:scale(1)}}
        @keyframes slideInRight{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes zoomIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        @keyframes bxgyPop{0%{transform:scale(.95);opacity:0}60%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}}
        @keyframes tabFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;max-height:0}to{opacity:1;max-height:200px}}

        .pd-bc-bar{background:#1872B5;padding:14px 0;}
        .pd-bc-inner{max-width:1260px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;}
        .pd-bc{font-size:13px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:4px;flex-wrap:wrap;}
        .pd-bc a{color:rgba(255,255,255,.75);text-decoration:none;transition:color .2s;}
        .pd-bc a:hover{color:#fff;}
        .pd-bc-sep{opacity:.5;margin:0 2px;}
        .pd-bc-cur{color:#fff;font-weight:700;}

        .pd-grid{max-width:1260px;margin:30px auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:start;}
        .pd-gallery{position:sticky;top:24px;}
        .slider-wrap{position:relative;background:#fff;border:1.5px solid #e5e7eb;border-radius:18px;overflow:hidden;aspect-ratio:1;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,.1);cursor:zoom-in;}
        .slider-track{display:flex;width:100%;height:100%;transition:transform .42s cubic-bezier(.4,0,.2,1);}
        .slide{min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:20px;flex-shrink:0;}
        .slide img{max-width:100%;max-height:100%;object-fit:contain;transition:transform .4s ease;}
        .slider-wrap:hover .slide img{transform:scale(1.04);}
        .arrow-btn{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.95);border:1.5px solid #e5e7eb;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;color:#374151;box-shadow:0 2px 12px rgba(0,0,0,.12);transition:all .22s;font-size:18px;padding:0;}
        .arrow-btn:hover{background:#1872B5;color:#fff;border-color:#1872B5;transform:translateY(-50%) scale(1.1);}
        .arrow-prev{left:12px;}
        .arrow-next{right:12px;}
        .slide-badges{position:absolute;top:14px;left:14px;display:flex;flex-direction:column;gap:6px;z-index:5;pointer-events:none;}
        .badge-feat{background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;font-size:11px;font-weight:800;padding:5px 12px;border-radius:20px;letter-spacing:.04em;}
        .badge-sale{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:11px;font-weight:800;padding:5px 12px;border-radius:20px;}
        .badge-discount{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-size:11px;font-weight:800;padding:5px 12px;border-radius:20px;}
        .badge-bxgy{background:linear-gradient(135deg,#059669,#10b981);color:#fff;font-size:11px;font-weight:800;padding:5px 12px;border-radius:20px;}
        .zoom-hint{position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,.45);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;backdrop-filter:blur(6px);pointer-events:none;opacity:0;transition:opacity .2s;}
        .slider-wrap:hover .zoom-hint{opacity:1;}
        .slider-dots{display:flex;justify-content:center;gap:6px;margin-top:12px;}
        .sdot-item{width:7px;height:7px;border-radius:50%;background:#d1d5eb;cursor:pointer;transition:all .2s;border:none;padding:0;}
        .sdot-item.on{background:#1872B5;width:22px;border-radius:4px;}
        .thumbs-wrap{display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;}
        .thumbs-wrap::-webkit-scrollbar{display:none;}
        .thumb{width:70px;height:70px;border:2px solid #e5e7eb;border-radius:12px;overflow:hidden;cursor:pointer;background:#fff;flex-shrink:0;transition:all .22s;}
        .thumb img{width:100%;height:100%;object-fit:contain;padding:4px;}
        .thumb.on,.thumb:hover{border-color:#1872B5;transform:translateY(-3px);box-shadow:0 6px 16px rgba(24,114,181,.22);}

        .pd-info{animation:fadeIn .45s ease both;}
        .pd-title {
    font-family: 'Sora',sans-serif;
    font-size: 21px;
    font-weight: 700;
    color: #0a214f;
    line-height: 25px;
    margin-bottom: 10px;
}
        .pd-sku{font-size:12px;color:#9ca3af;margin-bottom:18px;display:flex;align-items:center;gap:6px;}
        .pd-sku b{color:#374151;background:#f3f4f6;padding:2px 8px;border-radius:5px;}

        /* ── REVIEWS SUMMARY ── */
        .reviews-summary{display:flex;align-items:center;gap:14px;margin-bottom:18px;padding-bottom:14px;border-bottom:1.5px solid #e5e7eb;animation:slideDown .4s ease both;}
        .reviews-stars{display:flex;gap:2px;}
        .reviews-star{font-size:20px;line-height:1;}
        .reviews-text{font-size:13px;font-weight:700;color:#374151;font-family:'Sora',sans-serif;}

        .price-box{background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;padding:18px 20px;margin-bottom:16px;}
        .price-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px;}
        .price-main{font-size:34px;font-weight:800;color:#1872B5;font-family:'Sora',sans-serif;line-height:1;}
        .price-main.with-discount{color:#059669;}
        .price-orig{font-size:18px;color:#9ca3af;text-decoration:line-through;}
        .disc-tag{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;}
        .discount-applied-tag{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;}
        .bxgy-tag{background:linear-gradient(135deg,#059669,#10b981);color:#fff;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;}
        .price-na{font-size:18px;color:#9ca3af;font-style:italic;}
        .savings-strip{margin-top:12px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:1px solid #6ee7b7;border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;animation:bxgyPop .4s ease both;}
        .savings-left{display:flex;align-items:center;gap:8px;font-size:13px;color:#065f46;font-weight:700;}
        .savings-right{font-size:16px;font-weight:800;color:#059669;font-family:'Sora',sans-serif;}
        .savings-sub{font-size:11px;color:#047857;font-weight:600;margin-top:2px;}
        .bxgy-progress{margin-top:12px;background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:12px 14px;animation:bxgyPop .4s ease both;}
        .bxgy-progress-text{font-size:13px;color:#92400e;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
        .bxgy-bar-wrap{height:8px;background:#fef3c7;border-radius:10px;overflow:hidden;}
        .bxgy-bar-fill{height:100%;background:linear-gradient(90deg,#f59e0b,#f97316);border-radius:10px;transition:width .4s ease;}
        .bxgy-counter{background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:700;animation:bxgyPop .4s ease both;}
        .bxgy-counter-icon{font-size:24px;}
        .disc-hint-strip{margin-top:10px;background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:10px 14px;font-size:12px;color:#92400e;font-weight:700;display:flex;align-items:center;gap:8px;}

        .stock-pill{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;padding:7px 16px;border-radius:20px;margin-bottom:18px;}
        .stock-in{background:#d1fae5;color:#065f46;}
        .stock-out{background:#fee2e2;color:#991b1b;}
        .sp-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0;}
        .sp-dot-in{background:#10b981;animation:pulse 1.6s infinite;}
        .sp-dot-out{background:#ef4444;}

        .overview-label{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;}
        .overview-box{font-size:14px;color:#374151;line-height:1.8;margin-bottom:20px;padding:14px 16px;background:#fff;border-radius:12px;border:1.5px solid #e5e7eb;}
        .divider{border:none;border-top:1px solid #e5e7eb;margin:20px 0;}

        .vg-label{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;}
        .variant-cards{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px;}
        .vc{position:relative;min-width:90px;background:#fff;border:2px solid #e5e7eb;border-radius:12px;padding:10px 16px;text-align:center;cursor:pointer;transition:all .18s;box-shadow:0 1px 4px rgba(0,0,0,.05);}
        .vc:hover{border-color:#1872B5;box-shadow:0 4px 16px rgba(24,114,181,.15);transform:translateY(-2px);}
        .vc.on{border-color:#1872B5;background:#eff6ff;box-shadow:0 4px 20px rgba(24,114,181,.22);}
        .vc-off{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#fff;font-size:9px;font-weight:800;padding:2px 8px;border-radius:20px;white-space:nowrap;}
        .vc-name{font-size:14px;font-weight:700;color:#0a214f;font-family:'Sora',sans-serif;}
        .vc-out{font-size:10px;color:#dc2626;font-weight:700;margin-top:3px;}

        .qty-section{display:flex;align-items:center;gap:16px;margin-bottom:20px;}
        .qty-label{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;}
        .qty-ctrl{display:flex;align-items:center;border:2px solid #e5e7eb;border-radius:12px;overflow:hidden;}
        .qty-btn{width:42px;height:42px;border:none;background:#f9fafb;cursor:pointer;font-size:20px;font-weight:700;color:#374151;display:flex;align-items:center;justify-content:center;transition:all .15s;}
        .qty-btn:hover:not(:disabled){background:#1872B5;color:#fff;}
        .qty-btn:disabled{opacity:.4;cursor:not-allowed;}
        .qty-num{width:52px;text-align:center;font-size:16px;font-weight:800;color:#0a214f;background:#fff;border-left:2px solid #e5e7eb;border-right:2px solid #e5e7eb;height:42px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;}
        .qty-stock{font-size:12px;color:#9ca3af;font-weight:600;}

        .cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px;}
        .cta-btn{flex:1;min-width:140px;padding:15px 20px;border-radius:12px;font-size:15px;font-weight:800;font-family:'Sora',sans-serif;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;gap:9px;text-decoration:none;transition:all .22s;position:relative;overflow:hidden;}
        .cta-add{background:linear-gradient(135deg,#1872B5 0%,#2596e1 100%);color:#fff;box-shadow:0 4px 18px rgba(24,114,181,.35);}
        .cta-add:hover:not(:disabled){background:linear-gradient(135deg,#1560a0 0%,#1872B5 100%);transform:translateY(-2px);box-shadow:0 8px 28px rgba(24,114,181,.42);}
        .cta-add:disabled{opacity:.6;cursor:not-allowed;}
        .cta-add.added{background:linear-gradient(135deg,#059669,#10b981)!important;animation:cartBounce .5s ease;}
        .cta-enq{background:#fff;color:#1872B5;border:2px solid #1872B5;}
        .cta-enq:hover{background:#eff6ff;transform:translateY(-2px);}

        .meta-tbl{width:100%;border-collapse:collapse;background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #e5e7eb;font-size:13px;}
        .meta-tbl tr{border-bottom:1px solid #e5e7eb;}
        .meta-tbl tr:last-child{border-bottom:none;}
        .meta-tbl td{padding:11px 16px;vertical-align:middle;}
        .meta-tbl td:first-child{font-weight:700;color:#6b7280;width:36%;background:#f9fafb;border-right:1px solid #e5e7eb;}
        .chip-cat{background:#eff6ff;color:#1872B5;border:1px solid #bfdbfe;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;text-decoration:none;display:inline-block;margin:2px;transition:background .2s;}
        .chip-cat:hover{background:#dbeafe;}

        /* ════ PRODUCT TABS ════ */
        .prod-tabs-section{max-width:1260px;margin:0 auto;padding:0 24px 40px;}
        .prod-tabs-wrap{background:#fff;border:1.5px solid #e5e7eb;border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.06);}
        .prod-tabs-nav{display:flex;border-bottom:1.5px solid #e5e7eb;overflow-x:auto;scrollbar-width:none;background:#fafbfc;}
        .prod-tabs-nav::-webkit-scrollbar{display:none;}
        .prod-tab-btn{padding:16px 24px;font-size:14px;font-weight:700;color:#6b7280;background:none;border:none;cursor:pointer;white-space:nowrap;position:relative;transition:color .2s;font-family:'Nunito',sans-serif;flex-shrink:0;border-bottom:3px solid transparent;margin-bottom:-1.5px;}
        .prod-tab-btn:hover{color:#1872B5;background:#f0f7ff;}
        .prod-tab-btn.active{color:#1872B5;border-bottom-color:#1872B5;background:#fff;}
        .prod-tab-content{padding:28px 32px;animation:tabFadeIn .3s ease both;min-height:120px;}
        .prod-tab-content h1,.prod-tab-content h2,.prod-tab-content h3{color:#0a214f;font-family:'Sora',sans-serif;margin:0 0 12px;}
        .prod-tab-content h1{font-size:20px;}
        .prod-tab-content h2{font-size:18px;}
        .prod-tab-content h3{font-size:16px;}
        .prod-tab-content p{color:#374151;font-size:14px;line-height:1.85;margin:0 0 12px;}
        .prod-tab-content ul,.prod-tab-content ol{padding-left:22px;margin:0 0 14px;}
        .prod-tab-content li{color:#374151;font-size:14px;line-height:1.85;margin-bottom:6px;}
        .prod-tab-content img{max-width:100%;border-radius:10px;margin:12px 0;}
        .prod-tab-content table{width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;}
        .prod-tab-content th{background:#f0f7ff;color:#1872B5;font-weight:700;padding:10px 14px;text-align:left;border-bottom:2px solid #bfdbfe;}
        .prod-tab-content td{padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#374151;vertical-align:middle;}
        .prod-tab-content tr:last-child td{border-bottom:none;}
        .prod-tab-content strong,.prod-tab-content b{color:#0a214f;font-weight:700;}
        .prod-tab-content a{color:#1872B5;text-decoration:underline;}
        .prod-tab-content blockquote{border-left:4px solid #1872B5;padding:12px 18px;background:#eff6ff;border-radius:0 10px 10px 0;margin:12px 0;font-style:italic;color:#374151;}

        .reviews-tab-wrap{padding:24px 32px;animation:tabFadeIn .3s ease both;}

        .cart-toast{position:fixed;bottom:28px;right:28px;background:#065f46;color:#fff;padding:14px 22px;border-radius:14px;font-size:14px;font-weight:700;font-family:'Sora',sans-serif;display:flex;align-items:center;gap:10px;z-index:99998;box-shadow:0 8px 28px rgba(0,0,0,.22);animation:slideInRight .35s ease;pointer-events:none;}

        .zoom-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;cursor:zoom-out;animation:zoomIn .25s ease;}
        .zoom-img{max-width:90vw;max-height:90vh;object-fit:contain;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);}
        .zoom-close{position:absolute;top:20px;right:20px;width:44px;height:44px;background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:50%;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
        .zoom-close:hover{background:rgba(255,255,255,.3);}

        .enq-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;visibility:hidden;transition:all .3s;}
        .enq-overlay.open{opacity:1;visibility:visible;}
        .enq-modal{background:#fff;border-radius:22px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;position:relative;transform:translateY(28px) scale(.97);transition:transform .35s cubic-bezier(.34,1.56,.64,1);box-shadow:0 30px 70px rgba(0,0,0,.22);}
        .enq-overlay.open .enq-modal{transform:translateY(0) scale(1);}
        .enq-header{background:linear-gradient(135deg,#1872B5,#2596e1);padding:26px 28px 20px;border-radius:22px 22px 0 0;position:relative;}
        .enq-header h3{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:#fff;margin:0 0 4px;}
        .enq-header p{font-size:13px;color:rgba(255,255,255,.75);margin:0;}
        .enq-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.18);border:none;color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;line-height:1;}
        .enq-close:hover{background:rgba(255,255,255,.3);}
        .enq-ptag{margin:16px 20px 0;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px;font-size:13px;color:#1872B5;font-weight:700;display:flex;align-items:center;gap:8px;}
        .enq-body{padding:18px 24px 26px;}
        .enq-field{margin-bottom:14px;}
        .enq-field label{display:block;font-size:11px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
        .enq-field input,.enq-field textarea{width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;color:#1c1c1c;font-family:'Nunito',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;background:#f9fafb;}
        .enq-field input:focus,.enq-field textarea:focus{border-color:#1872B5;background:#fff;box-shadow:0 0 0 3px rgba(24,114,181,.1);}
        .enq-field textarea{height:84px;resize:vertical;}
        .enq-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .enq-submit{width:100%;padding:14px;background:linear-gradient(135deg,#1872B5,#2596e1);color:#fff;border:none;border-radius:11px;font-size:15px;font-weight:800;font-family:'Sora',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;box-shadow:0 4px 14px rgba(24,114,181,.3);margin-top:6px;}
        .enq-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(24,114,181,.4);}
        .enq-submit:disabled{opacity:.7;cursor:not-allowed;}
        .enq-success{padding:48px 28px;text-align:center;}
        .enq-success-icon{width:68px;height:68px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;margin:0 auto 16px;animation:checkPop .5s ease both;}
        .enq-success h4{font-family:'Sora',sans-serif;font-size:22px;margin:0 0 8px;color:#065f46;}
        .enq-success p{font-size:14px;color:#6b7280;}

        .rel-section{max-width:1260px;margin:0 auto;padding:0 24px 64px;}
        .rel-head{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:#0a214f;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #e5e7eb;display:flex;align-items:center;gap:10px;}
        .rel-head::before{content:'';display:inline-block;width:4px;height:26px;background:linear-gradient(180deg,#1872B5,#2596e1);border-radius:2px;}
        .rel-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
        .rel-card{background:#fff;border-radius:14px;border:1.5px solid #e5e7eb;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:all .22s;box-shadow:0 2px 10px rgba(0,0,0,.07);}
        .rel-card:hover{border-color:#1872B5;box-shadow:0 8px 28px rgba(24,114,181,.18);transform:translateY(-4px);}
        .rel-img{aspect-ratio:1;background:#f9fafb;display:flex;align-items:center;justify-content:center;overflow:hidden;}
        .rel-img img{max-width:100%;max-height:100%;object-fit:contain;transition:transform .3s;}
        .rel-card:hover .rel-img img{transform:scale(1.07);}
        .rel-body{padding:10px 12px 14px;}
        .rel-title{font-size:13px;font-weight:700;color:#0a214f;line-height:1.4;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .rel-card:hover .rel-title{color:#1872B5;}
        .rel-prices{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
        .rel-price{font-size:14px;font-weight:800;color:#1872B5;font-family:'Sora',sans-serif;}
        .rel-orig{font-size:11px;color:#9ca3af;text-decoration:line-through;}



.reviews-summary {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1.5px solid #e5e7eb;
    animation: slideDown .4s ease both;
}
.price-box {
    background: #ffffff00;
    border: 0;
    border-radius: 16px;
    padding: 0;
    margin-bottom: 16px;
}
.price-main {
    font-size: 18px;
    font-weight: 800;
    color: #1872B5;
    font-family: 'Sora',sans-serif;
    line-height: 1;
}
.disc-tag {
    background: linear-gradient(135deg,#ef4444,#dc2626);
    color: #fff;
    font-size: 8px;
    font-weight: 800;
    padding: 2px 9px;
    border-radius: 20px;
}
.price-box {
    background: #ffffff00;
    border: 0;
    border-radius: 16px;
    padding: 0;
    margin-bottom: 13px;
    margin-top: -6px;
}
.stock-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 9px;
    font-weight: 700;
    padding: 7px 16px;
    border-radius: 20px;
    margin-bottom: 18px;
}
.overview-label {
    font-size: 11px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 8px;
    display: none;
}
.stock-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 9px;
    font-weight: 700;
    padding: 7px 16px;
    border-radius: 20px;
    margin-bottom: 12px;
}
.overview-box {
    font-size: 14px;
    color: #374151;
    line-height: 20px;
    margin-bottom: -6px;
    padding: 10px 12px;
    background: #fff;
    border-radius: 12px;
    border: 1.5px solid #e5e7eb;
}
span.vc-off {
    display: none;
}
.vc {
    position: relative;
    min-width: 58px;
    background: #fff;
    border: 2px solid #e5e7eb;
    border-radius: 7px;
    padding: 7px 9px;
    text-align: center;
    cursor: pointer;
    transition: all .18s;
    box-shadow: none!important;
}

.divider {
    border: none;
    border-top: 0px solid #e5e7eb;
    margin: 10px 0;
}
.slide img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover!important;
    transition: transform .4s ease;
    width: 100%!important;
}
.slide {
    min-width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0px;
    flex-shrink: 0;
}
.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    padding: 0px;
}
.slider-dots {
    display: none;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;
}
.thumb {
    width: 70px;
    height: 70px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    background: #fff;
    flex-shrink: 0;
    transition: all .22s;
    margin-top: 3px;
}
.vc-name {
    font-size: 12px;
    font-weight: 600;
    color: #0a214f;
    font-family: 'Sora',sans-serif;
}
.overview-box {
    font-size: 14px;
    color: #374151;
    line-height: 20px;
    margin-bottom: -6px;
    padding: 0;
    background: #ffffff00;
    border-radius: 12px;
    border: none;
    padding-block: 1px;
}
.qty-num {
    width: 52px;
    text-align: center;
    font-size: 13px;
}
.prod-tabs-section {
    margin-top: 48px!important;
}

.vg-label {
    font-size: 11px;
    font-weight: 800;
    color: #0a214f;
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 12px;
}
.rv-topbar {
    display: none;
}
.thumb.on, .thumb:hover {
    border-color: #1872B5;
    transform: translateY(-3px);
    box-shadow: none;
}


.rv-topbar {
    display: none!important;
}






        @media(max-width:980px){
          .pd-grid{grid-template-columns:1fr;gap:28px;padding:0 16px 32px;margin:20px auto;}
          .pd-gallery{position:static;}
          .pd-title{font-size:22px;}
          .rel-grid{grid-template-columns:repeat(3,1fr);}
          .enq-row{grid-template-columns:1fr;}
          .prod-tabs-section,.rel-section{padding-left:16px;padding-right:16px;}
          .prod-tab-content,.reviews-tab-wrap{padding:20px 18px;}
        }
        @media(max-width:768px){
          .pd-title{font-size:20px;}
          .price-main{font-size:28px;}
          .rel-grid{grid-template-columns:repeat(2,1fr);}
          .reviews-summary{flex-direction:column;align-items:flex-start;gap:8px;}
          .reviews-stars{margin-bottom:4px;}
        }
        @media(max-width:767px){
          .pd-title{font-size:18px;}
          .price-main{font-size:24px;}
          .rel-grid{grid-template-columns:1fr;gap:10px;}
          .rel-section{padding:0 14px 48px;}
          .cta-btn{font-size:14px;padding:13px 16px;}
          .cart-toast{bottom:16px;right:16px;left:16px;font-size:13px;}
          .prod-tab-btn{padding:14px 16px;font-size:13px;}
          .prod-tab-content,.reviews-tab-wrap{padding:18px 16px;}
          .reviews-summary{gap:10px;}
          .reviews-star{font-size:18px;}
          .reviews-text{font-size:12px;}
		  .reviews-summary {
    flex-direction: unset;
    align-items: flex-start;
    gap: 8px;
}
.prod-tab-btn {
    padding: 11px 14px;
    font-size: 13px;
}
.rel-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.rel-head {
    font-family: 'Sora',sans-serif;
    font-size: 19px;
    font-weight: 800;
    color: #0a214f;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 10px;
}
.pd-grid {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 0 16px 32px;
    margin: 20px auto;
    padding-bottom: 0;
    margin-bottom: -14px;
}

        }
      `}</style>

      {/* ── Breadcrumb ── */}
      <div className="pd-bc-bar">
        <div className="pd-bc-inner">
          <nav className="pd-bc">
            <Link href="/">Home</Link>
            <span className="pd-bc-sep">›</span>
            <Link href="/collections">Shop</Link>
            {product.categories?.[0] && (
              <>
                <span className="pd-bc-sep">›</span>
                <Link href={`/collections?category=${product.categories[0].slug}`}>{product.categories[0].name}</Link>
              </>
            )}
            <span className="pd-bc-sep">›</span>
            <span className="pd-bc-cur">{product.title?.slice(0, 45)}{product.title?.length > 45 ? '…' : ''}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="pd-grid">

        {/* ════ LEFT: GALLERY ════ */}
        <div className="pd-gallery">
          {imgs.length > 0 ? (
            <>
              <div className="slider-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClick={() => imgs[curSlide]?.type !== 'video' && setZoomOpen(true)}>
                <div className="slide-badges">
                  {product.is_featured && <span className="badge-feat">⭐ Featured</span>}
                  {variantDisc && !discount    && <span className="badge-sale">{variantDisc}% OFF</span>}
                  {discount && applicable && isBxgy  && <span className="badge-bxgy">🎁 {getBxgyLabel()}</span>}
                  {discount && applicable && !isBxgy && <span className="badge-discount">🏷️ {discountLabel}</span>}
                </div>
                {imgs.length > 1 && <button className="arrow-btn arrow-prev" onClick={e => { e.stopPropagation(); goSlide(curSlide - 1); }}>‹</button>}
                <div className="slider-track" style={{ transform: `translateX(-${curSlide * 100}%)` }}>
                  {imgs.map((im, i) => (
                    <div className="slide" key={i}>
                      {im.type === 'video'
                        ? <video src={im.src} controls preload="metadata" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 10 }} playsInline />
                        : <img src={im.src} alt={im.alt} />}
                    </div>
                  ))}
                </div>
                {imgs.length > 1 && <button className="arrow-btn arrow-next" onClick={e => { e.stopPropagation(); goSlide(curSlide + 1); }}>›</button>}
                {imgs[curSlide]?.type !== 'video' && <span className="zoom-hint">🔍 Click to zoom</span>}
              </div>
              {imgs.length > 1 && imgs.length <= 8 && (
                <div className="slider-dots">
                  {imgs.map((_, i) => <button key={i} className={`sdot-item ${i === curSlide ? 'on' : ''}`} onClick={() => goSlide(i)} />)}
                </div>
              )}
              {imgs.length > 1 && (
                <div className="thumbs-wrap" ref={thumbsRef}>
                  {imgs.map((im, i) => (
                    <div key={i} className={`thumb ${i === curSlide ? 'on' : ''}`} onClick={() => goSlide(i)}>
                      {im.type === 'video'
                        ? <div style={{ width: '100%', height: '100%', background: '#0a214f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, borderRadius: 8 }}>▶</div>
                        : <img src={im.src} alt={im.alt} />}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 18, fontSize: 72, color: '#d1d5db' }}>📦</div>
          )}
        </div>

        {/* ════ RIGHT: PRODUCT INFO ════ */}
        <div className="pd-info">
          <h1 className="pd-title">{product.title}</h1>

          {/* ── REVIEWS SUMMARY BELOW TITLE ── */}
          {reviewsData && reviewsData.total > 0 && (
            <div className="reviews-summary">
              <div className="reviews-stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className="reviews-star" style={{ color: i <= Math.round(reviewsData.average || 0) ? '#10b981' : '#d1d5db' }}>★</span>
                ))}
              </div>
              <span className="reviews-text">{reviewsData.total} {reviewsData.total === 1 ? 'Review' : 'Reviews'}</span>
            </div>
          )}

          {product.sku && <div className="pd-sku">SKU: <b>{product.sku}</b></div>}

          {/* Price Box */}
          <div className="price-box">
            {price ? (
              <>
                <div className="price-row">
                  {applicable ? (
                    <>
                      <span className="price-main with-discount">₹{finalPrice!.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      <span className="price-orig">₹{price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      {isBxgy ? <span className="bxgy-tag">🎁 {getBxgyLabel()}</span> : <span className="discount-applied-tag">🏷️ {discountLabel}</span>}
                    </>
                  ) : (
                    <>
                      <span className="price-main">₹{price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      {compare && <span className="price-orig">₹{compare.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>}
                      {variantDisc && <span className="disc-tag">{variantDisc}% OFF</span>}
                    </>
                  )}
                </div>
                {applicable && savings > 0 && (
                  <div className="savings-strip">
                    <div className="savings-left">
                      <span>{isBxgy ? '🎁' : '🎉'}</span>
                      <div>
                        <div>You save ₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                        {isBxgy && bxgyFreeQty > 0 && <div className="savings-sub">{bxgyFreeQty} item{bxgyFreeQty > 1 ? 's' : ''} free</div>}
                        {discount.title && <div className="savings-sub">"{discount.title}" applied</div>}
                      </div>
                    </div>
                    <div className="savings-right">{discount.value_type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`} off</div>
                  </div>
                )}
                {needMoreForBxgy && discount && (
                  <div className="bxgy-progress">
                    <div className="bxgy-progress-text">🎁 Add {(discount.buy_quantity ?? 1) - quantity} more to get {discount.get_quantity} free!</div>
                    <div className="bxgy-bar-wrap"><div className="bxgy-bar-fill" style={{ width: `${Math.min(100, (quantity / (discount.buy_quantity ?? 1)) * 100)}%` }} /></div>
                  </div>
                )}
                {needMoreForDisc && <div className="disc-hint-strip">🏷️ Add {minQty - quantity} more to unlock {discountLabel}!</div>}
              </>
            ) : <span className="price-na">Price on request</span>}
          </div>

          {/* Stock */}
          <div className={`stock-pill ${inStock ? 'stock-in' : 'stock-out'}`}>
            <span className={`sp-dot ${inStock ? 'sp-dot-in' : 'sp-dot-out'}`} />
            {inStock ? `In Stock (${product.stock_quantity} units)` : 'Out of Stock'}
          </div>

          {/* Overview */}
          {product.overview && (
            <>
              <div className="overview-label">ℹ️ Overview</div>
              <div className="overview-box">{product.overview}</div>
            </>
          )}
          <hr className="divider" />

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
            <div className="vg-label">
  {product.variants?.[0]?.attributes ? Object.keys(product.variants[0].attributes)[0] : 'Variant'}
  {selectedVariant && (
    <span style={{ color: '#1872B5', marginLeft: 8, textTransform: 'none', letterSpacing: 0, fontWeight: 800 }}>
      — {selectedVariant.name}
    </span>
  )}
</div>
              <div className="variant-cards">
                {product.variants.map((v: any, idx: number) => {
                  const attrs = v.attributes || {};
                  const label = Object.keys(attrs).length === 1 ? Object.values(attrs)[0] as string : v.name;
                  const cp = parseFloat(v.compare_price || product.price || 0);
                  const vp = parseFloat(v.price || 0);
                  const vDisc = (cp > 0 && vp > 0 && vp < cp) ? Math.round(((cp - vp) / cp) * 100) : null;
                  return (
                    <div key={idx} className={`vc ${selectedVariant?.id === v.id ? 'on' : ''}`} onClick={() => setSelectedVariant(v)}>
                      {vDisc && <span className="vc-off">{vDisc}% OFF</span>}
                      <div className="vc-name">{label}</div>
                      {(v.stock_quantity === 0 || v.stock_quantity === '0') && <div className="vc-out">Out of Stock</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="qty-section">
            
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={decreaseQty} disabled={quantity <= 1}>−</button>
              <span className="qty-num">{quantity}</span>
              <button className="qty-btn" onClick={increaseQty} disabled={quantity >= maxStock}>+</button>
            </div>
           
          </div>

          {/* BXGY Counter */}
          {isBxgy && isBxgyApplicable() && bxgyFreeQty > 0 && (
            <div className="bxgy-counter">
              <div className="bxgy-counter-icon">🎁</div>
              <div><div>{bxgyFreeQty} item{bxgyFreeQty > 1 ? 's' : ''} will be FREE!</div><div style={{ fontSize: 11, opacity: .85, marginTop: 2 }}>{discount.title}</div></div>
            </div>
          )}

          {/* CTA Buttons */}
         {/* CTA Buttons */}
<div className="cta-row">
  {product.cta_button === 'enquire_now' ? (
    // ✅ Sirf Enquire Now button
    <button className="cta-btn cta-enq" style={{ flex: 1 }} onClick={() => setEnquiryOpen(true)}>
      <span style={{ fontSize: 16 }}>✉️</span> Enquire Now
    </button>
  ) : (
    // ✅ Sirf Add to Cart button (default)
    <button className={`cta-btn cta-add ${addedAnim ? 'added' : ''}`} onClick={handleAddToCart} disabled={!price || !inStock}>
      {addedAnim
        ? <><span style={{ fontSize: 18, animation: 'checkPop .4s ease' }}>✓</span> Added {quantity > 1 ? `(${quantity})` : ''}!</>
        : <><span style={{ fontSize: 18 }}>🛒</span> Add to Cart {quantity > 1 ? `(${quantity})` : ''}</>
      }
    </button>
  )}
</div>

          {/* Meta Table */}
          <table className="meta-tbl">
            <tbody>
              {product.sku && <tr><td>SKU</td><td>{product.sku}</td></tr>}
              <tr><td>Availability</td><td style={{ color: inStock ? '#065f46' : '#991b1b', fontWeight: 700 }}>{inStock ? '✓ In Stock' : '✗ Out of Stock'}</td></tr>
              {discount && applicable && (
                <tr><td>Discount</td><td><span style={{ background: isBxgy ? '#d1fae5' : '#f3e8ff', color: isBxgy ? '#065f46' : '#7c3aed', fontWeight: 800, padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>{isBxgy ? '🎁' : '🏷️'} {discountLabel} — {discount.title}</span></td></tr>
              )}
              {product.categories?.length > 0 && (
                <tr><td>Category</td><td>{product.categories.map((c: any) => <Link key={c.id} href={`/collections?category=${c.slug}`} className="chip-cat">{c.name}</Link>)}</td></tr>
              )}
              {product.tags?.length > 0 && (
                <tr><td>Tags</td><td style={{ color: '#374151' }}>{product.tags.map((t: any) => t.name).join(', ')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════
          PRODUCT TABS — Description + Extra + Reviews
      ════════════════════════════════════════ */}
      <div className="prod-tabs-section">
        <div className="prod-tabs-wrap">
          {/* Tab Nav */}
          <nav className="prod-tabs-nav" role="tablist">
            {allTabs.map((tab, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={activeTab === idx}
                className={`prod-tab-btn${activeTab === idx ? ' active' : ''}`}
                onClick={() => setActiveTab(idx)}
              >
                {tab.title}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          {allTabs.map((tab, idx) => (
            <div key={idx} role="tabpanel" style={{ display: activeTab === idx ? 'block' : 'none' }}>
              {activeTab === idx && (
                tab.type === 'reviews' ? (
                  <div className="reviews-tab-wrap">
                    <ReviewsSection productId={product.id} productTitle={product.title} />
                  </div>
                ) : (
                  <div className="prod-tab-content" dangerouslySetInnerHTML={{ __html: tab.content }} />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div className="rel-section">
          <div className="rel-head">Similar Products</div>
          <div className="rel-grid">
            {related.map((rp: any) => {
              const rPrice = relPrice(rp);
              const rComp  = relCompare(rp);
              const rImg   = rp.featured_image ? `${API_URL}/uploads/products/${rp.featured_image}` : null;
              return (
                <Link key={rp.id} href={`/product/${rp.slug}`} className="rel-card">
                  <div className="rel-img">{rImg ? <img src={rImg} alt={rp.featured_image_alt || rp.title} loading="lazy" /> : <span style={{ fontSize: 36, color: '#d1d5db' }}>📦</span>}</div>
                  <div className="rel-body">
                    <div className="rel-title">{rp.title}</div>
                    <div className="rel-prices">
                      {rComp  && <span className="rel-orig">₹{rComp.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>}
                      {rPrice && <span className="rel-price">₹{rPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Cart Toast */}
      {addedAnim && (
        <div className="cart-toast">
          <span style={{ fontSize: 20 }}>✅</span>
          <span>{quantity} item{quantity > 1 ? 's' : ''} added{applicable ? ` with ${discountLabel}` : ''}!</span>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomOpen && imgs[curSlide]?.type !== 'video' && (
        <div className="zoom-overlay" onClick={() => setZoomOpen(false)}>
          <button className="zoom-close" onClick={() => setZoomOpen(false)}>×</button>
          <img className="zoom-img" src={imgs[curSlide].src} alt={imgs[curSlide].alt} onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Enquiry Modal */}
      <div className={`enq-overlay ${enquiryOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setEnquiryOpen(false); }}>
        <div className="enq-modal">
          <div className="enq-header">
            <h3>Send Enquiry</h3>
            <p>Fill in the form and we'll get back to you shortly.</p>
            <button className="enq-close" onClick={() => setEnquiryOpen(false)}>×</button>
          </div>
          <div className="enq-ptag"><span>📦</span><span>{product.title}</span></div>
          {formStatus === 'success' ? (
            <div className="enq-success">
              <div className="enq-success-icon">✅</div>
              <h4>Enquiry Sent!</h4>
              <p>Thank you! We'll be in touch shortly.</p>
            </div>
          ) : (
            <div className="enq-body">
              {formStatus === 'error' && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>⚠️ Something went wrong. Please try again.</div>}
              <form onSubmit={handleEnquiry}>
                <div className="enq-row">
                  <div className="enq-field"><label>Your Name *</label><input type="text" placeholder="John Smith" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="enq-field"><label>Phone *</label><input type="tel" placeholder="+91 98000 00000" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                </div>
                <div className="enq-row">
                  <div className="enq-field"><label>Email *</label><input type="email" placeholder="you@example.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div className="enq-field"><label>Address</label><input type="text" placeholder="Your city / suburb" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                </div>
                <div className="enq-field"><label>Message</label><textarea placeholder="Tell us more..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} /></div>
                <button type="submit" className="enq-submit" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? '⏳ Sending...' : '✉️ Send Enquiry'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}