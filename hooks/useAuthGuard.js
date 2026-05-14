// ================================================================
// FILE: hooks/useAuthGuard.js
// ✅ Aapke existing googleAuth ke saath compatible
// ================================================================

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authStorage } from '../lib/authStorage';

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    if (!authStorage.isLoggedIn()) {
      // Yaad rakho user kahan ja raha tha
      sessionStorage.setItem('redirect_after_login', router.asPath);
      router.replace('/signup');
    }
  }, []);

  // Current user return karo
  return authStorage.getUser();
}