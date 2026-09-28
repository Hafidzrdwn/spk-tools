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
    console.warn('Gagal menginisialisasi Firebase Realtime DB. Menggunakan Fallback Store:', err);
    db = null;
  }
}

// =========================================================================
// LOCAL FALLBACK STORAGE (Saat Firebase env belum diisi oleh pengguna)
// =========================================================================
const LOCAL_REVIEWS_KEY = 'decisigraph_local_reviews';
const LOCAL_ANALYTICS_KEY = 'decisigraph_local_analytics';

const INITIAL_DEMO_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Dr. Hendra Wijaya',
    role: 'Dosen Sistem Informasi',
    rating: 5,
    comment: 'Sangat impresif! Fitur penelusuran rumus Traceability Inspector sangat membantu mahasiswa memahami proses perkalian matriks di TOPSIS dan AHP secara transparan.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'rev-2',
    name: 'Siti Nurhaliza',
    role: 'Data Analyst & Riset',
    rating: 5,
    comment: 'UI modern, visualisasi radar chart TOPSIS dan grafik perbandingan multi-metodenya keren banget. Sangat memudahkan pembuatan laporan komparasi keputusan.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: 'rev-3',
    name: 'Budi Pratama',
    role: 'IT Project Manager',
    rating: 4,
    comment: 'Fitur Story to Matrix-nya sangat menghemat waktu evaluasi vendor. Tinggal input narasi studi kasus, matriks keputusan langsung terbentuk otomatis.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
  },
];

function getLocalReviews(): ReviewItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(INITIAL_DEMO_REVIEWS));
      return INITIAL_DEMO_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_REVIEWS;
  }
}

function saveLocalReviews(reviews: ReviewItem[]): void {
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
  } catch {
    // Ignore
  }
}

function getInitialAnalytics(): AnalyticsData {
  const now = new Date();
  
  // Buat riwayat 7 hari terakhir
  const dailyHistory = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().slice(0, 10);
    return {
      date: dStr,
      views: 12 + Math.floor(Math.sin(i * 1.5) * 6 + i * 4),
    };
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const curMonthIdx = now.getMonth();
  const monthlyHistory = months.map((m, idx) => ({
    month: m,
    views: idx <= curMonthIdx ? 120 + idx * 45 + Math.floor(Math.random() * 30) : 0,
  }));

  return {
    totalViews: 1420,
    viewsToday: 48,
    viewsThisMonth: 384,
    viewsThisYear: 1420,
    deviceBreakdown: { desktop: 68, mobile: 27, tablet: 5 },
    browserBreakdown: { chrome: 64, firefox: 16, safari: 12, edge: 7, other: 1 },
    dailyHistory,
    monthlyHistory,
    recentVisits: [
      { id: 'v1', timestamp: new Date(Date.now() - 60000 * 4).toISOString(), device: 'Desktop', browser: 'Chrome', os: 'Windows', path: '/workboard' },
      { id: 'v2', timestamp: new Date(Date.now() - 60000 * 22).toISOString(), device: 'Mobile', browser: 'Safari', os: 'iOS', path: '/landing' },
      { id: 'v3', timestamp: new Date(Date.now() - 60000 * 45).toISOString(), device: 'Desktop', browser: 'Edge', os: 'Windows', path: '/workboard?tab=topsis' },
      { id: 'v4', timestamp: new Date(Date.now() - 60000 * 120).toISOString(), device: 'Desktop', browser: 'Firefox', os: 'Linux', path: '/workboard?tab=compare' },
    ],
  };
}

function getLocalAnalytics(): AnalyticsData {
  try {
    const raw = localStorage.getItem(LOCAL_ANALYTICS_KEY);
    if (!raw) {
      const init = getInitialAnalytics();
      localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialAnalytics();
  }
}

function saveLocalAnalytics(data: AnalyticsData): void {
  try {
    localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(data));
  } catch {
    // Ignore
  }
}

// =========================================================================
// PUBLIC API: REVIEWS
// =========================================================================

export function subscribeToReviews(callback: (reviews: ReviewItem[]) => void): () => void {
  if (db) {
    const reviewsRef = ref(db, 'reviews');
    const unsubscribe = onValue(
      reviewsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback(INITIAL_DEMO_REVIEWS);
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
        console.warn('Firebase error, beralih ke local storage:', error);
        callback(getLocalReviews());
      }
    );
    return () => unsubscribe();
  }

  // Fallback: Langsung emit local data & daftarkan event listener storage lokal
  callback(getLocalReviews());

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_REVIEWS_KEY) {
      callback(getLocalReviews());
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

export async function submitReview(review: Omit<ReviewItem, 'id' | 'createdAt'>): Promise<{ success: boolean; id: string }> {
  const newItem: ReviewItem = {
    ...review,
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  if (db) {
    try {
      const reviewsRef = ref(db, 'reviews');
      const newRef = push(reviewsRef);
      await set(newRef, {
        name: newItem.name,
        email: newItem.email || '',
        role: newItem.role || 'Pengguna DecisiGraph',
        rating: newItem.rating,
        comment: newItem.comment,
        createdAt: new Date().toISOString(),
      });
      return { success: true, id: newRef.key || newItem.id };
    } catch (err) {
      console.warn('Gagal push ke Firebase, menyimpan lokal:', err);
    }
  }

  // Local fallback save
  const current = getLocalReviews();
  const updated = [newItem, ...current];
  saveLocalReviews(updated);
  // Trigger update di tab yang sama
  window.dispatchEvent(new Event('decisigraph-review-updated'));
  return { success: true, id: newItem.id };
}

// =========================================================================
// PUBLIC API: WEB ANALYTICS
// =========================================================================

export function subscribeToAnalytics(callback: (data: AnalyticsData) => void): () => void {
  if (db) {
    const analyticsRef = ref(db, 'analytics');
    const unsubscribe = onValue(
      analyticsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback(getLocalAnalytics());
          return;
        }
        callback(snapshot.val() as AnalyticsData);
      },
      () => {
        callback(getLocalAnalytics());
      }
    );
    return () => unsubscribe();
  }

  callback(getLocalAnalytics());
  return () => {};
}

/**
 * Deteksi info perangkat & browser dari navigator
 */
export function getClientEnvironmentInfo() {
  if (typeof window === 'undefined') {
    return { device: 'Desktop', browser: 'Chrome', os: 'Windows' };
  }

  const ua = navigator.userAgent;
  let device = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  let browser = 'Chrome';
  if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

  let os = 'Windows';
  if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';

  return { device, browser, os };
}

/**
 * Catat 1 page view secara real-time
 */
export async function trackPageView(path: string = '/'): Promise<void> {
  const env = getClientEnvironmentInfo();
  const now = new Date();

  if (db) {
    try {
      // Baca state analytics terkini dari Firebase
      const analyticsRef = ref(db, 'analytics');
      const snap = await get(analyticsRef);
      let current: AnalyticsData = snap.exists() ? snap.val() : getInitialAnalytics();

      current.totalViews = (current.totalViews || 0) + 1;
      current.viewsToday = (current.viewsToday || 0) + 1;
      current.viewsThisMonth = (current.viewsThisMonth || 0) + 1;

      // Update recent visit log
      const visit = {
        id: `v-${Date.now()}`,
        timestamp: now.toISOString(),
        device: env.device,
        browser: env.browser,
        os: env.os,
        path,
      };
      current.recentVisits = [visit, ...(current.recentVisits || []).slice(0, 19)];

      await set(analyticsRef, current);
      return;
    } catch (e) {
      console.warn('Gagal mencatat view ke Firebase, fallback ke lokal:', e);
    }
  }

  // Local fallback
  const local = getLocalAnalytics();
  local.totalViews += 1;
  local.viewsToday += 1;
  local.viewsThisMonth += 1;

  const visit = {
    id: `v-${Date.now()}`,
    timestamp: now.toISOString(),
    device: env.device,
    browser: env.browser,
    os: env.os,
    path,
  };
  local.recentVisits = [visit, ...(local.recentVisits || []).slice(0, 19)];
  saveLocalAnalytics(local);
}

export const isRealtimeDbConnected = () => isFirebaseConfigured && db !== null;
