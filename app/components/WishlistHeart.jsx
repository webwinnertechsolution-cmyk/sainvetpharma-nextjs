'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/googleAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function WishlistHeart({ productId }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  function getHeaders() {
    const user = getStoredUser();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(user?.firebase_uid ? { 'X-Firebase-UID': user.firebase_uid } : {}),
    };
  }

  async function checkWishlistStatus() {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/check/${productId}`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      setIsInWishlist(data.in_wishlist || false);
    } catch (error) {
      console.error('Wishlist check error:', error);
    } finally {
      setLoading(false);
    }
  }

  function notifyWishlistChange() {
    window.dispatchEvent(new Event('wishlistUpdated'));
  }

  async function toggleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    const user = getStoredUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const prev = isInWishlist;
    setIsInWishlist(!prev);
    setLoading(true);

    try {
      if (prev) {
        const res = await fetch(`${API_URL}/api/wishlist/remove/${productId}`, {
          method: 'POST',
          headers: getHeaders(),
        });
        const data = await res.json();
        if (!data.success) {
          setIsInWishlist(true);
          console.error('Remove failed:', data.message);
        } else {
          notifyWishlistChange();
        }
      } else {
        const res = await fetch(`${API_URL}/api/wishlist/add`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (!data.success) {
          setIsInWishlist(false);
          console.error('Add failed:', data.message);
        } else {
          notifyWishlistChange();
        }
      }
    } catch (error) {
      setIsInWishlist(prev);
      console.error('Toggle error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style jsx>{`
        .wh-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s ease;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }
        .wh-btn:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
        }
        .wh-btn.active {
          background: #fff;
        }
        .wh-btn.active:hover {
          background: #fff;
        }
        .wh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
      <button
        className={`wh-btn ${isInWishlist ? 'active' : ''}`}
        onClick={toggleWishlist}
        title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        disabled={loading}
      >
        {isInWishlist ? '❤️' : '🤍'}
      </button>
    </>
  );
}