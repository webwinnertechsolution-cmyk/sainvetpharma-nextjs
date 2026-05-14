// ================================================================
// FILE: lib/authStorage.js
// ✅ Aapka purana code google_user key bhi support karta hai
// ================================================================

const UID_KEY  = 'firebase_uid';
const USER_KEY = 'google_user'; // ✅ Aapka purana key same rakha

export const authStorage = {

  setUid(uid) {
    try { localStorage.setItem(UID_KEY, uid); } catch (e) {}
  },

  getUid() {
    try { return localStorage.getItem(UID_KEY) || null; } catch (e) { return null; }
  },

  setUser(user) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch (e) {}
  },

  getUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) { return null; }
  },

  clear() {
    try {
      localStorage.removeItem(UID_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
  },

  isLoggedIn() {
    return !!this.getUid();
  },
};