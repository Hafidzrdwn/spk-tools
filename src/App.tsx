import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import TabSkeleton from '@/components/ui/TabSkeleton';
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
      <Suspense fallback={<TabSkeleton />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/board" element={<WorkboardPage />} />
          <Route
            path="/review"
            element={
              <CommunityLayout activeTab="review">
                <ReviewsPage />
              </CommunityLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <CommunityLayout activeTab="analytics">
                <AnalyticsPage />
              </CommunityLayout>
            }
          />
          {/* Legacy & Fallback redirects */}
          <Route path="/workboard" element={<Navigate to="/board" replace />} />
          <Route path="/community" element={<Navigate to="/review" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
