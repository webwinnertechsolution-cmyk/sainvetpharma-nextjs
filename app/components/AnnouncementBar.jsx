'use client';

import { useState, useEffect, useRef } from 'react';

export default function AnnouncementBar({ data }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!data?.announcements?.length || data.announcements.length < 2) return;

    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % data.announcements.length);
        setVisible(true);
      }, 350);
    }, data.slide_interval ?? 3000);

    return () => clearInterval(timerRef.current);
  }, [data]);

  if (!data || !data.is_active) return null;

  const phoneUrl = data.phone_url ?? `tel:${data.phone_number}`;

  return (
    <div class="adasdas" style={{ backgroundColor: data.bg_color ?? '#1872B5', color: data.text_color ?? '#ffffff' }}> 
      <style>{`
        .ann-bar {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 38px;
          gap: 16px;
        }
        .ann-left {
          flex: 1;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.3px;
          transition: opacity 0.35s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ann-right {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
          text-decoration: none;
          color: inherit;
          opacity: 0.92;
          transition: opacity 0.2s;
        }
        .ann-right:hover { opacity: 1; }
        .ann-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.4;
        }
		.adasdas {
    background-color: #1872b5!important;
}
.ann-left {
    flex: 1;
    text-align: left;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.3px;
    transition: opacity 0.35s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ann-left {
    flex: 1;
    text-align: left;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.3px;
    transition: opacity 0.35s ease;
    white-space: nowrap;
    overflow: hidden;
    font-family: 'Sora', sans-serif;
    text-overflow: ellipsis;
}
.ann-bar {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 38px;
    gap: 16px;
    padding-top: 2px;
}
        @media (max-width: 600px) {
          .ann-bar { padding: 0 16px; }
          .ann-left { font-size: 12px; }
          .ann-right { font-size: 12px; }
          .ann-phone-label { display: none; }
        }
      `}</style>

      <div className="ann-bar">
        <div className="ann-left" style={{ opacity: visible ? 1 : 0 }}>
          {data.announcements[current]}
        </div>
        {data.phone_number && (
          <a href={phoneUrl} className="ann-right">
            <span className="ann-dot" />
            <span className="ann-phone-label">{data.phone_label ?? 'Call Us'}:&nbsp;</span>
            <span>{data.phone_number}</span>
          </a>
        )}
      </div>
    </div>
  );
}