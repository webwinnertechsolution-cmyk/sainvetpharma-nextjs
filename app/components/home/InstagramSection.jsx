'use client';

import { useEffect, useRef, useState } from 'react';

const InstagramSection = ({
  heading = 'Follow Us on Instagram',
  subHeading = '@yourbrand',
  instagramUrl = 'https://www.instagram.com/yourbrand',
  curatorPublishedId = '928465ce-8db6-4d9a-860c-1baceccacb89', // 👈 Tumhara Curator ID yahan
}) => {
  const [loaded, setLoaded] = useState(false);
  const scriptRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Agar pehle se script load hai to remove karke fresh load karo
    const existingScript = document.getElementById('curator-ig-script');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = 'curator-ig-script';
    script.async = true;
    script.charset = 'UTF-8';
    script.src = `https://cdn.curator.io/published/${curatorPublishedId}.js`;
    script.onload = () => setLoaded(true);

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) scriptRef.current.remove();
    };
  }, [curatorPublishedId]);

  return (
    <div className="ig-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@800&family=Nunito:wght@500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .ig-wrap {
          padding: 8px 0 18px;
        }

        .ig-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .ig-header {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 15px 0 22px;
          position: relative;
        }

        .ig-header-left {
          text-align: center;
        }

        .ig-header-left h2 {
          font-size: 27px;
          font-weight: 800;
          color: #0a214f;
          font-family: 'Sora', sans-serif;
          margin: 0;
        }

        .ig-header-left p {
          font-size: 17px;
          color: #1872B5;
          margin: 6px 0 0;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
        }

        .ig-follow-btn {
          position: absolute;
          right: 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: color 0.2s;
          font-family: 'Nunito', sans-serif;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .ig-follow-btn:hover {
          color: #1872B5;
        }

        .ig-follow-btn svg {
          transition: transform 0.2s;
        }

        .ig-follow-btn:hover svg {
          transform: translateX(3px);
        }

        /* Curator feed override styles */
        #curator-feed-default-feed-layout {
          font-family: 'Nunito', sans-serif !important;
        }

        .crt-logo.crt-tag {
          display: none !important;
        }

        /* Curator cards ko VideoSection style dena */
        .crt-post {
          border-radius: 14px !important;
          overflow: hidden !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15) !important;
          transition: transform 0.22s, box-shadow 0.22s !important;
          border: none !important;
        }

        .crt-post:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 28px rgba(24, 114, 181, 0.25) !important;
        }

        /* Loading skeleton */
        .ig-loading {
          display: flex;
          gap: 14px;
          padding: 10px 0;
          overflow: hidden;
        }

        .ig-skeleton {
          flex: 0 0 calc((100% - 4 * 14px) / 5);
          border-radius: 14px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          aspect-ratio: 9/16;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
.crt-post-c.crt-post-border .crt-post-header {
    display: none;
}
.crt-post-c.crt-post-border .crt-post-text {
    display: none;
}
.crt-post-c.crt-post-border .crt-widget.crt-widget-carousel .crt-carousel-slider .crt-post-c {
    height: 400px;
    justify-content: center;
}
.crt-post-c.crt-post-border .crt-post-footer {
    display: none;
}
        @media (max-width: 767px) {
          .ig-inner { padding: 0 14px; }
          .ig-follow-btn { display: none; }
          .ig-header-left h2 { font-size: 20px; }
          .ig-header-left p {
            font-size: 14px;
            margin: -1px 0 -15px;
          }
          .ig-wrap { padding: 8px 0 0; }
          .ig-skeleton {
            flex: 0 0 calc((100% - 14px) / 2);
          }
        }
      `}</style>

      <div className="ig-inner">
        {/* Header */}
        <div className="ig-header">
          <div className="ig-header-left">
            <h2>{heading}</h2>
            {subHeading && <p>{subHeading}</p>}
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ig-follow-btn"
          >
            Follow Us
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Loading skeleton — Curator load hone tak */}
        {!loaded && (
          <div className="ig-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="ig-skeleton" />
            ))}
          </div>
        )}

        {/* Curator Feed — yahi real Instagram data dikhayega */}
        <div
          ref={containerRef}
          id="curator-feed-default-feed-layout"
          style={{ display: loaded ? 'block' : 'none' }}
        >
          <a
            href="https://curator.io"
            target="_blank"
            rel="noopener noreferrer"
            className="crt-logo crt-tag"
          >
            Powered by Curator.io
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstagramSection;
