import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import {
  LandingSkeleton,
  WorkboardSkeleton,
  ReviewSkeleton,
  AnalyticsSkeleton,
} from '@/components/ui/skeletons';
import { trackPageView } from '@/services/firebase';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const WorkboardPage = lazy(() => import('@/features/workboard/WorkboardPage'));
const ReviewsPage = lazy(() => import('@/features/community/ReviewsPage'));
const AnalyticsPage = lazy(() => import('@/features/community/AnalyticsPage'));
const CommunityLayout = lazy(() => import('@/features/community/CommunityLayout'));

function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <PageViewTracker />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LandingSkeleton />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route
          path="/board"
          element={
            <Suspense fallback={<WorkboardSkeleton />}>
              <WorkboardPage />
            </Suspense>
          }
        />
        <Route
          path="/review"
          element={
            <Suspense fallback={<ReviewSkeleton />}>
              <CommunityLayout activeTab="review">
                <ReviewsPage />
              </CommunityLayout>
            </Suspense>
          }
        />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<AnalyticsSkeleton />}>
              <CommunityLayout activeTab="analytics">
                <AnalyticsPage />
              </CommunityLayout>
            </Suspense>
          }
        />
        {/* Legacy & Fallback redirects */}
        <Route path="/workboard" element={<Navigate to="/board" replace />} />
        <Route path="/community" element={<Navigate to="/review" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
