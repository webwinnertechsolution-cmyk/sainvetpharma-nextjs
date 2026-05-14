"use client";
import { useState, useEffect, Suspense } from "react";
import { signInWithGoogle, getStoredUser } from "@/lib/googleAuth";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageInner() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      const redirect = searchParams.get("redirect") || "/account";
      router.replace(redirect);
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.success) {
      const redirect = searchParams.get("redirect") || "/account";
      router.replace(redirect);
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh", fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        .login-wrap {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .login-box {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.10);
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          text-align: center;
        }
        .login-icon {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px;
          margin: 0 auto 20px;
        }
        .login-title {
          font-family: 'Sora', sans-serif;
          font-size: 24px; font-weight: 800;
          color: #111827; margin: 0 0 8px;
        }
        .login-sub {
          font-size: 14px; color: #6b7280;
          margin: 0 0 32px; line-height: 1.6;
        }
        .google-btn {
          width: 100%;
          display: flex; align-items: center;
          justify-content: center; gap: 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px; padding: 14px 20px;
          background: white; cursor: pointer;
          font-size: 15px; font-weight: 700;
          color: #374151; font-family: inherit;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .google-btn:hover {
          border-color: #1872B5;
          box-shadow: 0 4px 16px rgba(24,114,181,0.15);
          transform: translateY(-1px);
        }
        .google-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .divider {
          display: flex; align-items: center;
          gap: 12px; margin: 24px 0;
          color: #9ca3af; font-size: 12px;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1;
          height: 1px; background: #e5e7eb;
        }
        .features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px; margin-top: 24px;
        }
        .feature-item {
          background: #f9fafb; border-radius: 10px;
          padding: 12px; text-align: left;
        }
        .feature-icon { font-size: 20px; margin-bottom: 4px; }
        .feature-text { font-size: 12px; color: #374151; font-weight: 600; }
      `}</style>

      <div className="login-wrap">
        <div className="login-box">
          <div className="login-icon">👤</div>
          <h1 className="login-title">Sign In</h1>
          <p className="login-sub">
            Sign in to manage your wishlist,<br />orders and profile
          </p>

          <button onClick={handleGoogleLogin} disabled={loading} className="google-btn">
            <img src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="divider">Benefits of signing in</div>

          <div className="features">
            <div className="feature-item">
              <div className="feature-icon">❤️</div>
              <div className="feature-text">Save Wishlist</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📦</div>
              <div className="feature-text">Track Orders</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">Fast Checkout</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-text">Secure Account</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}