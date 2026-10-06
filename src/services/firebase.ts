import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  Database,
  get,
} from 'firebase/database';

export interface ReviewItem {
  id: string;
  name: string;
  email?: string;
  role?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string; // ISO string or timestamp
}

export interface BugReportItem {
  id: string;
  name: string;
  email: string;
  category: 'BUG' | 'KELUHAN' | 'FEEDBACK' | 'FEATURE_REQUEST';
  title: string;
  description: string;
  hasAttachment: boolean;
  attachmentName?: string;
  createdAt: string;
  browserInfo: string;
}

export interface AnalyticsData {
  totalViews: number;
  viewsToday: number;
  viewsThisMonth: number;
  viewsThisYear: number;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  browserBreakdown: { chrome: number; firefox: number; safari: number; edge: number; other: number };
  dailyHistory: { date: string; views: number }[];
  monthlyHistory: { month: string; views: number }[];
  recentVisits: { id: string; timestamp: string; device: string; browser: string; os: string; path: string }[];
}

export const EMPTY_ANALYTICS: AnalyticsData = {
  totalViews: 0,
  viewsToday: 0,
  viewsThisMonth: 0,
  viewsThisYear: 0,
  deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
  browserBreakdown: { chrome: 0, firefox: 0, safari: 0, edge: 0, other: 0 },
  dailyHistory: [],
  monthlyHistory: [],
  recentVisits: [],
};

// Cek apakah env Firebase tersedia
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let db: Database | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    db = getDatabase(app);
  } catch (err) {
    console.warn('Gagal menginisialisasi Firebase Realtime DB:', err);
    db = null;
  }
}

// =========================================================================
// PUBLIC API: REVIEWS
// =========================================================================

export function subscribeToReviews(callback: (reviews: ReviewItem[]) => void): () => void {
  if (db) {
    let hasReceivedInitial = false;
    const timeoutId = setTimeout(() => {
      if (!hasReceivedInitial) {
        hasReceivedInitial = true;
        console.warn('Waktu tunggu koneksi Firebase ulasan berakhir (timeout), memuat fallback data kosong.');
        callback([]);
      }
    }, 7000);

    const reviewsRef = ref(db, 'reviews');
    const unsubscribe = onValue(
      reviewsRef,
      (snapshot) => {
        hasReceivedInitial = true;
        clearTimeout(timeoutId);
        if (!snapshot.exists()) {
          callback([]);
          return;
        }
        const val = snapshot.val();
        const list: ReviewItem[] = Object.keys(val).map((k) => ({
          id: k,
          ...val[k],
        }));
        // Urutkan dari yang terbaru
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      },
      (error) => {
        hasReceivedInitial = true;
        clearTimeout(timeoutId);
        console.warn('Gagal membaca ulasan dari Firebase:', error);
        callback([]);
      }
    );
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }

  // Jika belum terkoneksi Firebase, tampilkan empty state jujur
  callback([]);
  return () => {};
}

export async function submitReview(review: Omit<ReviewItem, 'id' | 'createdAt'>): Promise<{ success: boolean; id: string }> {
  if (!db) {
    throw new Error('Firebase Realtime Database belum terkonfigurasi. Pastikan kredensial Firebase telah dimasukkan ke file .env.');
  }

  const reviewsRef = ref(db, 'reviews');
  const newRef = push(reviewsRef);
  await set(newRef, {
    name: review.name.trim(),
    email: review.email?.trim() || '',
    role: review.role?.trim() || 'Pengguna DecisiGraph',
    rating: review.rating,
    comment: review.comment.trim(),
    createdAt: new Date().toISOString(),
  });

  return { success: true, id: newRef.key || `rev-${Date.now()}` };
}

// =========================================================================
// PUBLIC API: WEB ANALYTICS
// =========================================================================

export function subscribeToAnalytics(callback: (data: AnalyticsData) => void): () => void {
  if (db) {
    let hasReceivedInitial = false;
    const timeoutId = setTimeout(() => {
      if (!hasReceivedInitial) {
        hasReceivedInitial = true;
        console.warn('Waktu tunggu koneksi Firebase analytics berakhir (timeout), memuat fallback data kosong.');
        callback(EMPTY_ANALYTICS);
      }
    }, 7000);

    const analyticsRef = ref(db, 'analytics');
    const unsubscribe = onValue(
      analyticsRef,
      (snapshot) => {
        hasReceivedInitial = true;
        clearTimeout(timeoutId);
        if (!snapshot.exists()) {
          callback(EMPTY_ANALYTICS);
          return;
        }
        callback(snapshot.val() as AnalyticsData);
      },
      (error) => {
        hasReceivedInitial = true;
        clearTimeout(timeoutId);
        console.warn('Gagal membaca analytics dari Firebase:', error);
        callback(EMPTY_ANALYTICS);
      }
    );
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }

  callback(EMPTY_ANALYTICS);
  return () => {};
}

/**
 * Deteksi info perangkat & browser dari navigator atau custom user-agent
 */
export function getClientEnvironmentInfo(customUa?: string) {
  if (typeof window === 'undefined' && !customUa) {
    return { device: 'Desktop', browser: 'Chrome', os: 'Windows' };
  }

  const ua = customUa || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const maxTouchPoints = typeof navigator !== 'undefined' ? (navigator.maxTouchPoints || 0) : 0;

  // 1. Deteksi Perangkat (Tablet vs Mobile vs Desktop)
  let device: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  const isIpadLike = /ipad/i.test(ua) || (/macintosh/i.test(ua) && maxTouchPoints > 1);
  const isTablet = isIpadLike || /tablet|playbook|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua));
  const isMobile = !isTablet && (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua));

  if (isTablet) {
    device = 'Tablet';
  } else if (isMobile) {
    device = 'Mobile';
  } else {
    device = 'Desktop';
  }

  // 2. Deteksi Sistem Operasi (Prioritaskan Mobile OS sebelum Desktop Linux/macOS)
  let os = 'Lainnya';
  if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(ua) || isIpadLike) {
    os = 'iOS';
  } else if (/windows phone/i.test(ua)) {
    os = 'Windows Phone';
  } else if (/win/i.test(ua)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // 3. Deteksi Browser (Pencocokan spesifik sebelum fallback)
  let browser = 'Browser Web';
  if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/opr|opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/edg|edge|edga|edgios/i.test(ua)) {
    browser = 'Edge';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua)) {
    browser = 'Safari';
  }

  return { device, browser, os };
}

export const PV_CACHE_PREFIX = 'decisi_pv_';

export function shouldTrackRouteToday(path: string, dateStr: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return true;
  }

  try {
    const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';
    const key = `${PV_CACHE_PREFIX}${dateStr}_${cleanPath}`;

    if (localStorage.getItem(key)) {
      return false; 
    }

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PV_CACHE_PREFIX) && !k.startsWith(`${PV_CACHE_PREFIX}${dateStr}`)) {
        localStorage.removeItem(k);
      }
    }

    localStorage.setItem(key, '1');
    return true;
  } catch {
    return true;
  }
}

export async function trackPageView(path: string = '/'): Promise<boolean> {
  if (!db) return false;

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  if (!shouldTrackRouteToday(path, dateStr)) {
    return false;
  }

  const env = getClientEnvironmentInfo();

  try {
    const analyticsRef = ref(db, 'analytics');
    const snap = await get(analyticsRef);
    let current: AnalyticsData = snap.exists() ? snap.val() : { ...EMPTY_ANALYTICS };

    current.totalViews = (current.totalViews || 0) + 1;
    current.viewsToday = (current.viewsToday || 0) + 1;
    current.viewsThisMonth = (current.viewsThisMonth || 0) + 1;
    current.viewsThisYear = (current.viewsThisYear || 0) + 1;

    // Perangkat breakdown
    const devKey = env.device.toLowerCase() as 'desktop' | 'mobile' | 'tablet';
    if (!current.deviceBreakdown) current.deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 };
    current.deviceBreakdown[devKey] = (current.deviceBreakdown[devKey] || 0) + 1;

    // Riwayat harian
    if (!current.dailyHistory) current.dailyHistory = [];
    const todayIndex = current.dailyHistory.findIndex((d) => d.date === dateStr);
    if (todayIndex >= 0) {
      current.dailyHistory[todayIndex].views += 1;
    } else {
      current.dailyHistory = [...current.dailyHistory.slice(-6), { date: dateStr, views: 1 }];
    }

    // Recent visits (maksimal 20 item)
    const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';
    const visit = {
      id: `v-${Date.now()}`,
      timestamp: now.toISOString(),
      device: env.device,
      browser: env.browser,
      os: env.os,
      path: cleanPath,
    };
    current.recentVisits = [visit, ...(current.recentVisits || []).slice(0, 19)];

    await set(analyticsRef, current);
    return true;
  } catch (e) {
    console.warn('Gagal mencatat view ke Firebase:', e);
    return false;
  }
}

export const isRealtimeDbConnected = () => isFirebaseConfigured && db !== null;
