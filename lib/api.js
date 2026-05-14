// ================================================================
// FILE: lib/api.js
// ✅ Aapke existing code ke saath compatible
// ================================================================

import { authStorage } from './authStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL; // ✅ Fixed

export async function apiCall(endpoint, options = {}) {
  const firebaseUid = authStorage.getUid();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(firebaseUid ? { 'X-Firebase-UID': firebaseUid } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    authStorage.clear();
    window.location.href = '/signup';
    return null;
  }

  return res.json();
}