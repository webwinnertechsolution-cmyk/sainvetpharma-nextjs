'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
  });
}
function getImage(blog) {
  if (!blog.featured_image) return null;
  return `${API_URL}/uploads/blogs/${blog.featured_image}`;
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        {[80, 60, 90, 40].map((w, i) => (
          <div key={i} className={`skeleton-line skeleton-line-${i}`} style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function BlogCard({ blog, index }) {
  const [hover, setHover] = useState(false);
  const img      = getImage(blog);
  const date     = formatDate(blog.published_at || blog.created_at);
  const excerpt  = stripHtml(blog.excerpt || blog.content).slice(0, 110) + '…';
  const category = blog.categories?.[0]?.name;

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="blog-card-link blog-card-anim"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`blog-card-inner ${hover ? 'blog-card-hover' : ''}`}>
        <div className="blog-card-img-wrap">
          {img ? (
            <img
              src={img}
              alt={blog.image_alt_tag || blog.title}
              className={`blog-card-img ${hover ? 'blog-card-img-hover' : ''}`}
            />
          ) : (
            <div className="blog-card-img-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
              </svg>
            </div>
          )}
          <div className={`blog-card-img-overlay ${hover ? 'blog-card-img-overlay-hover' : ''}`} />
          {category && (
            <div className="blog-card-category">{category}</div>
          )}
        </div>

        <div className="blog-card-content">
          <div className="blog-card-date-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1872B5" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="blog-card-date">{date}</span>
          </div>

          <h3 className={`blog-card-title ${hover ? 'blog-card-title-hover' : ''}`}>
            {blog.title}
          </h3>

          <p className="blog-card-excerpt">{excerpt}</p>

          {(blog.tags || []).length > 0 && (
            <div className="blog-card-tags">
              {blog.tags.slice(0, 3).map(t => (
                <span key={t.id} className="blog-card-tag">#{t.name}</span>
              ))}
            </div>
          )}

          <div className="blog-card-read-more">
            Read More
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={`blog-card-arrow ${hover ? 'blog-card-arrow-hover' : ''}`}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogPageInner() {
  const searchParams = useSearchParams();
  const [blogs, setBlogs]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags]             = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag]   = useState(null);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [filterTab, setFilterTab]   = useState('category');
  const PER_PAGE = 9;

  useEffect(() => {
    fetch(`${API_URL}/api/blogs`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setBlogs(list);

        const cats = {};
        list.forEach(b => (b.categories || []).forEach(c => { cats[c.id] = c; }));
        const categoriesArray = Object.values(cats);
        setCategories(categoriesArray);

        const tgs = {};
        list.forEach(b => (b.tags || []).forEach(t => { tgs[t.id] = t; }));
        const tagsArray = Object.values(tgs);
        setTags(tagsArray);

        const urlCategory = searchParams.get('category');
        const urlTag = searchParams.get('tag');

        if (urlCategory) {
          const foundCat = categoriesArray.find(c => c.slug === urlCategory || c.id.toString() === urlCategory);
          if (foundCat) { setActiveCategory(foundCat.id); setFilterTab('category'); setActiveTag(null); }
        }
        if (urlTag) {
          const foundTag = tagsArray.find(t => t.slug === urlTag || t.id.toString() === urlTag);
          if (foundTag) { setActiveTag(foundTag.id); setFilterTab('tag'); setActiveCategory(null); }
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams]);

  const filtered = blogs.filter(b => {
    const matchCat    = !activeCategory || (b.categories || []).some(c => c.id === activeCategory);
    const matchTag    = !activeTag       || (b.tags       || []).some(t => t.id === activeTag);
    const matchSearch = !search          || b.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchTag && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCategory  = (id)  => { setActiveCategory(id); setActiveTag(null); setPage(1); };
  const handleTag       = (id)  => { setActiveTag(id); setActiveCategory(null); setPage(1); };
  const handleSearch    = (e)   => { setSearch(e.target.value); setPage(1); };
  const handleFilterTab = (tab) => { setFilterTab(tab); setActiveCategory(null); setActiveTag(null); setPage(1); };
  const clearAll        = ()    => { setActiveCategory(null); setActiveTag(null); setSearch(''); setPage(1); };

  const activeLabel = activeCategory
    ? `in category "${categories.find(c => c.id === activeCategory)?.name}"`
    : activeTag
    ? `tagged "#${tags.find(t => t.id === activeTag)?.name}"`
    : '';

  return (
    <div className="blog-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bannerIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}

        /* ── Page ── */
        .blog-page{background:#f5f7fa;min-height:100vh;font-family:'Nunito',sans-serif;}

        /* ── Banner ── */
        .blog-banner{position:relative;height:180px;background:linear-gradient(135deg,#0a214f 0%,#1872B5 55%,#2596e1 100%);display:flex;align-items:center;justify-content:center;overflow:hidden;}
        .blog-banner::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;}
        .blog-banner-orb{position:absolute;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%);left:-70px;bottom:-70px;}
        .blog-banner-orb2{position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%);right:-50px;top:-50px;}
        .blog-banner-content{position:relative;z-index:2;text-align:center;animation:bannerIn .6s ease both;}
        .blog-banner-label{color:rgba(255,255,255,.65);font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px;}
        .blog-banner-title{font-family:'Sora',sans-serif;font-size:40px;font-weight:800;color:#fff;letter-spacing:-0.02em;margin:0;text-shadow:0 2px 20px rgba(0,0,0,.25);}

        /* ── Breadcrumb ── */
        .blog-breadcrumb-bar{background:#1872B5;padding:10px 0;}
        .blog-breadcrumb-inner{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;gap:6px;font-size:13px;color:rgba(255,255,255,.75);align-items:center;}
        .blog-breadcrumb-link{color:rgba(255,255,255,.75);text-decoration:none;}
        .blog-breadcrumb-sep{opacity:.5;margin:0 2px;}
        .blog-breadcrumb-current{color:#fff;font-weight:700;}

        /* ── Filter Bar ── */
        .blog-filter-bar{background:#fff;border-bottom:1px solid #dbeafe;padding:18px 0;position:sticky;top:0;z-index:50;box-shadow:0 2px 12px rgba(24,114,181,.07);}
        .blog-filter-inner{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;}
        .blog-filter-tabs{display:flex;gap:4px;background:#f5f7fa;border-radius:30px;padding:4px;align-self:center;flex-shrink:0;}
        .blog-filter-chips{flex:1;min-width:0;}
        .blog-filter-search{flex-shrink:0;}

        /* ── Chips Row ── */
        .chips-row{display:flex;gap:8px;flex-wrap:wrap;}

        /* ── Main Content ── */
        .blog-main{max-width:1200px;margin:0 auto;padding:44px 24px 60px;}
        .blog-results-bar{display:flex;align-items:center;gap:10px;margin-bottom:28px;flex-wrap:wrap;}
        .blog-results-text{font-size:13px;color:#9ca3af;font-weight:600;margin:0;}
        .blog-results-count{color:#1872B5;}
        .blog-results-label{color:#6b7280;}

        /* ── Grid ── */
        .blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;}

        /* ── Empty State ── */
        .blog-empty{text-align:center;padding:80px 24px;background:#fff;border-radius:18px;box-shadow:0 8px 40px rgba(24,114,181,.10);border:1.5px solid #dbeafe;}
        .blog-empty-icon{font-size:56px;margin-bottom:16px;}
        .blog-empty-title{font-size:20px;font-weight:800;color:#0a214f;margin-bottom:8px;}
        .blog-empty-desc{font-size:14px;color:#9ca3af;margin-bottom:20px;}

        /* ── Pagination ── */
        .blog-pagination{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:48px;}

        /* ── Skeleton ── */
        .skeleton-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(24,114,181,.07);}
        .skeleton-img{height:200px;background:linear-gradient(90deg,#eff6ff 25%,#dbeafe 50%,#eff6ff 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
        .skeleton-body{padding:22px;}
        .skeleton-line{background:#eff6ff;border-radius:6px;margin-bottom:10px;animation:shimmer 1.4s infinite;}
        .skeleton-line-0{height:18px;}
        .skeleton-line-1{height:13px;}
        .skeleton-line-2{height:13px;}
        .skeleton-line-3{height:13px;}

        /* ── Blog Card ── */
        .blog-card-link{text-decoration:none;display:block;}
        .blog-card-anim{animation:fadeUp .55s ease both;}
        .blog-card-inner{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(24,114,181,.08);transform:translateY(0);transition:all .35s cubic-bezier(.4,0,.2,1);height:100%;display:flex;flex-direction:column;border:1.5px solid transparent;}
        .blog-card-hover{box-shadow:0 20px 48px rgba(24,114,181,.20);transform:translateY(-6px);border-color:#bfdbfe;}
        .blog-card-img-wrap{position:relative;height:210px;overflow:hidden;flex-shrink:0;}
        .blog-card-img{width:100%;height:100%;object-fit:cover;transform:scale(1);transition:transform .5s cubic-bezier(.4,0,.2,1);}
        .blog-card-img-hover{transform:scale(1.07);}
        .blog-card-img-placeholder{width:100%;height:100%;background:linear-gradient(135deg,#0a214f 0%,#1872B5 100%);display:flex;align-items:center;justify-content:center;}
        .blog-card-img-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,33,79,.4) 0%,transparent 60%);opacity:0;transition:opacity .3s;}
        .blog-card-img-overlay-hover{opacity:1;}
        .blog-card-category{position:absolute;top:14px;left:14px;background:#1872B5;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:.04em;text-transform:uppercase;}
        .blog-card-content{padding:22px 22px 20px;flex:1;display:flex;flex-direction:column;}
        .blog-card-date-row{display:flex;align-items:center;gap:6px;margin-bottom:10px;}
        .blog-card-date{font-size:12px;color:#1872B5;font-weight:600;}
        .blog-card-title{font-size:16px;font-weight:700;line-height:1.45;margin:0 0 10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s;color:#0a214f;}
        .blog-card-title-hover{color:#1872B5;}
        .blog-card-excerpt{font-size:13.5px;color:#6b7280;line-height:1.7;margin:0 0 12px;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
        .blog-card-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;}
        .blog-card-tag{background:#eff6ff;color:#1872B5;font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;border:1px solid #bfdbfe;}
        .blog-card-read-more{display:flex;align-items:center;gap:6px;color:#1872B5;font-size:13px;font-weight:700;padding-top:14px;border-top:1px solid #dbeafe;}
        .blog-card-arrow{transform:translateX(0);transition:transform .3s;}
        .blog-card-arrow-hover{transform:translateX(4px);}

        /* ── Shared Buttons ── */
        .ftab{background:transparent;border:none;font-size:13px;font-weight:700;padding:7px 16px;border-radius:26px;cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif;color:#6b7280;}
        .ftab.on{background:#1872B5;color:#fff;}
        .ftab:hover:not(.on){color:#1872B5;}
        .chip{background:#fff;border:1.5px solid #dbeafe;color:#555;font-size:13px;font-weight:700;padding:7px 16px;border-radius:30px;cursor:pointer;transition:all .22s;white-space:nowrap;font-family:'Nunito',sans-serif;}
        .chip:hover{border-color:#1872B5;color:#1872B5;}
        .chip.on{background:#1872B5;border-color:#1872B5;color:#fff;}
        .tchip{background:#fff;border:1.5px solid #dbeafe;color:#555;font-size:12px;font-weight:700;padding:5px 13px;border-radius:30px;cursor:pointer;transition:all .22s;white-space:nowrap;font-family:'Nunito',sans-serif;}
        .tchip:hover{border-color:#1872B5;color:#1872B5;}
        .tchip.on{background:#1872B5;border-color:#1872B5;color:#fff;}
        .cnt{display:inline-block;margin-left:5px;font-size:10px;font-weight:800;padding:1px 6px;border-radius:10px;}
        .search-box{display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid #dbeafe;border-radius:30px;padding:10px 20px;transition:border-color .2s;}
        .search-box:focus-within{border-color:#1872B5;box-shadow:0 0 0 3px rgba(24,114,181,.1);}
        .search-box input{border:none;outline:none;background:transparent;font-size:14px;font-family:'Nunito',sans-serif;color:#0a214f;width:200px;}
        .search-box input::placeholder{color:#9ca3af;}
        .search-clear-btn{background:none;border:none;cursor:pointer;color:#9ca3af;font-size:16px;line-height:1;padding:0;}
        .page-btn{width:38px;height:38px;border-radius:50%;border:1.5px solid #dbeafe;background:#fff;color:#555;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;font-family:'Nunito',sans-serif;}
        .page-btn:hover{border-color:#1872B5;color:#1872B5;}
        .page-btn.on{background:#1872B5;border-color:#1872B5;color:#fff;}
        .page-btn:disabled{opacity:.35;cursor:not-allowed;}
        .clear-btn{background:#eff6ff;border:1px solid #bfdbfe;color:#1872B5;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;cursor:pointer;font-family:'Nunito',sans-serif;}
        .show-all-btn{background:#1872B5;color:#fff;border:none;padding:10px 24px;border-radius:30px;font-weight:700;font-size:14px;cursor:pointer;font-family:'Nunito',sans-serif;}
        .no-tags-text{font-size:13px;color:#9ca3af;align-self:center;}

        /* ── Responsive ── */
        @media(max-width:1024px){.blog-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:640px){
          .blog-grid{grid-template-columns:1fr;gap:14px;}
          .blog-banner{height:155px;}
          .blog-banner-title{font-size:24px !important;}
          .blog-banner-label{font-size:12px !important;margin:0 !important;}
          .chips-row{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;}
          .chips-row::-webkit-scrollbar{height:3px;}
          .chips-row::-webkit-scrollbar-thumb{background:#bfdbfe;border-radius:4px;}
        }
      `}</style>

      {/* ── Banner ── */}
      <div className="blog-banner">
        <div className="blog-banner-orb" />
        <div className="blog-banner-orb2" />
        <div className="blog-banner-content">
          <p className="blog-banner-label">Our Journal</p>
          <h1 className="blog-banner-title">Blog & Insights</h1>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="blog-breadcrumb-bar">
        <div className="blog-breadcrumb-inner">
          <Link href="/" className="blog-breadcrumb-link">Home</Link>
          <span className="blog-breadcrumb-sep">›</span>
          <span className="blog-breadcrumb-current">Blog</span>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="blog-filter-bar">
        <div className="blog-filter-inner">

          <div className="blog-filter-tabs">
            <button className={`ftab ${filterTab === 'category' ? 'on' : ''}`} onClick={() => handleFilterTab('category')}>Categories</button>
            <button className={`ftab ${filterTab === 'tag' ? 'on' : ''}`} onClick={() => handleFilterTab('tag')}>Tags</button>
          </div>

          <div className="blog-filter-chips">
            {filterTab === 'category' ? (
              <div className="chips-row">
                <button className={`chip ${!activeCategory ? 'on' : ''}`} onClick={() => handleCategory(null)}>
                  All
                  <span className="cnt" style={{ background: !activeCategory ? 'rgba(255,255,255,.25)' : '#eff6ff', color: !activeCategory ? '#fff' : '#1872B5' }}>
                    {blogs.length}
                  </span>
                </button>
                {categories.map(cat => {
                  const count = blogs.filter(b => (b.categories || []).some(c => c.id === cat.id)).length;
                  return (
                    <button key={cat.id} className={`chip ${activeCategory === cat.id ? 'on' : ''}`} onClick={() => handleCategory(cat.id)}>
                      {cat.name}
                      <span className="cnt" style={{ background: activeCategory === cat.id ? 'rgba(255,255,255,.25)' : '#eff6ff', color: activeCategory === cat.id ? '#fff' : '#1872B5' }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="chips-row">
                {tags.length === 0 ? (
                  <span className="no-tags-text">No tags found</span>
                ) : tags.map(tag => (
                  <button key={tag.id} className={`tchip ${activeTag === tag.id ? 'on' : ''}`} onClick={() => handleTag(tag.id)}>
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="search-box blog-filter-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={handleSearch}
            />
            {search && (
              <button className="search-clear-btn" onClick={() => { setSearch(''); setPage(1); }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="blog-main">

        {!loading && (
          <div className="blog-results-bar">
            <p className="blog-results-text">
              Showing <strong className="blog-results-count">{filtered.length}</strong> article{filtered.length !== 1 ? 's' : ''}
              {activeLabel && <span className="blog-results-label"> {activeLabel}</span>}
              {search && <span className="blog-results-label"> matching "<strong className="blog-results-count">{search}</strong>"</span>}
            </p>
            {(activeCategory || activeTag || search) && (
              <button className="clear-btn" onClick={clearAll}>✕ Clear</button>
            )}
          </div>
        )}

        {loading ? (
          <div className="blog-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="blog-empty">
            <div className="blog-empty-icon">📝</div>
            <h3 className="blog-empty-title">No Articles Found</h3>
            <p className="blog-empty-desc">Try a different keyword, category or tag.</p>
            <button className="show-all-btn" onClick={clearAll}>Show All Posts</button>
          </div>
        ) : (
          <div className="blog-grid">
            {paginated.map((blog, i) => <BlogCard key={blog.id} blog={blog} index={i} />)}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="blog-pagination">
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === page ? 'on' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogPageInner />
    </Suspense>
  );
}
