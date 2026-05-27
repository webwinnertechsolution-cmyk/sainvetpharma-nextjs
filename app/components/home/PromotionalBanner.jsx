'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PromotionalBanner() {
  const [banner, setBanner] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Fetch banner data
    fetch(`${API_URL}/api/promotional-banner`)
      .then((res) => res.json())
      .then((data) => setBanner(data))
      .catch((err) => console.error('Banner fetch error:', err));

    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!banner?.sale_end_date) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endDate = new Date(banner.sale_end_date).getTime();
      const distance = endDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [banner]);

  if (!banner) return null;

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${API_URL}/uploads/promotional-banners/${imageName}`;
  };

  // ✅ Select appropriate image based on device
  const backgroundImage = isMobile && banner.background_image_mobile 
    ? getImageUrl(banner.background_image_mobile)
    : getImageUrl(banner.background_image);

  return (
    <section className="promotional-banner-wrapper">
      <style>{`
        .promotional-banner-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
          margin: 40px 0;
        }

        .promotional-banner {
          position: relative;
          width: 100%;
          min-height: 400px;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          overflow: hidden;
        }

        .promotional-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
        }

        .banner-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: #fff;
          padding: 40px 20px;
          max-width: 600px;
        }

        .banner-sub-heading {
          font-size: 16px;
          font-weight: 600;
          color: #e74c3c;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .banner-heading {
          font-size: 48px;
          font-weight: 800;
          color: #0a214f;
          line-height: 1.2;
          margin-bottom: 30px;
          font-family: 'Sora', sans-serif;
        }

        .banner-sale-heading {
          font-size: 16px;
          font-weight: 600;
          color: #0a214f;
          margin-bottom: 15px;
        }

        .countdown {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .countdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .countdown-number {
          font-size: 32px;
          font-weight: 800;
          color: #e74c3c;
          line-height: 1;
          min-width: 50px;
        }

        .countdown-label {
          font-size: 11px;
          font-weight: 700;
          color: #0a214f;
          text-transform: uppercase;
          margin-top: 5px;
          letter-spacing: 0.5px;
        }

        .banner-button {
          display: inline-block;
          background: #fff;
          color: #0a214f;
          padding: 12px 40px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 2px solid #fff;
          font-size: 16px;
          cursor: pointer;
        }

        .banner-button:hover {
          background: transparent;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
		
		.promotional-banner {
    position: relative;
    width: 100%;
    min-height: 75vh;
    background-position: center;
    background-size: auto;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    overflow: hidden;
}
.banner-button:hover {
    background: #1872B5;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
.countdown-item {
    background-color: white;
    padding: 6px;
    border-radius: 10px;
    font-size: 10px!important;
}
.countdown-number {
    font-size: 24px;
    font-weight: 800;
    color: #e74c3c;
    line-height: 1;
    min-width: 50px;
}

        /* Mobile Styles */
        @media (max-width: 767px) {
          .promotional-banner {
            min-height: 350px;
          }

          .banner-heading {
            font-size: 24px;
            margin-bottom: 15px;
          }

          .banner-sub-heading {
            font-size: 14px;
            margin-bottom: 8px;
          }

          .countdown {
            gap: 10px;
            margin-bottom: 15px;
          }

          .countdown-number {
            font-size: 20px;
            min-width: 35px;
          }

          .countdown-label {
            font-size: 9px;
            margin-top: 3px;
          }

          .banner-content {
            padding: 25px 15px;
            max-width: 100%;
          }

          .banner-button {
            padding: 10px 25px;
            font-size: 14px;
          }

          .banner-sale-heading {
            font-size: 14px;
            margin-bottom: 10px;
          }
        }

        @media (max-width: 767px) {
          .promotional-banner {
            min-height: 280px;
          }

          .banner-heading {
            font-size: 20px;
            margin-bottom: 12px;
          }

          .banner-sub-heading {
            font-size: 12px;
          }

          .countdown {
            gap: 8px;
            margin-bottom: 12px;
          }

          .countdown-number {
            font-size: 18px;
          }

          .banner-button {
            padding: 8px 20px;
            font-size: 13px;
          }
		  .promotional-banner-wrapper {
    position: relative; 
    width: 100%;
    overflow: hidden;
    margin: 14px 0px;
    margin-bottom: 3px;
}  
        }
      `}</style>

      <div
        className="promotional-banner"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      >
        <div className="banner-content">
          {banner.sub_heading && (
            <div className="banner-sub-heading">{banner.sub_heading}</div>
          )}

          <h2 className="banner-heading">{banner.heading}</h2>

          {banner.sale_heading && banner.sale_end_date && (
            <>
              <div className="banner-sale-heading">{banner.sale_heading}</div>

              <div className="countdown">
                <div className="countdown-item">
                  <div className="countdown-number">{timeLeft.days}</div>
                  <div className="countdown-label">Days</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-number">{timeLeft.hours}</div>
                  <div className="countdown-label">Hours</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-number">{timeLeft.minutes}</div>
                  <div className="countdown-label">Mins</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-number">{timeLeft.seconds}</div>
                  <div className="countdown-label">Secs</div>
                </div>
              </div>
            </>
          )}

          {banner.button_url && (
            <Link href={banner.button_url} className="banner-button">
              {banner.button_text || 'Shop Now'}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
