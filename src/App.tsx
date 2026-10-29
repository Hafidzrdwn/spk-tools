import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import {
  LandingSkeleton,
  WorkboardSkeleton,
  ReviewSkeleton,
  AnalyticsSkeleton,
  LegalSkeleton,
} from '@/components/ui/skeletons';
import { trackPageView } from '@/services/firebase';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const WorkboardPage = lazy(() => import('@/features/workboard/WorkboardPage'));
const ReviewsPage = lazy(() => import('@/features/community/ReviewsPage'));
const AnalyticsPage = lazy(() => import('@/features/community/AnalyticsPage'));
const CommunityLayout = lazy(() => import('@/features/community/CommunityLayout'));

const LegalLayout = lazy(() => import('@/features/legal/LegalLayout'));
const PrivacyPolicyView = lazy(() => import('@/features/legal/PrivacyPolicyView'));
const TermsOfUseView = lazy(() => import('@/features/legal/TermsOfUseView'));
const ReleasesView = lazy(() => import('@/features/releases/ReleasesView'));
const AboutView = lazy(() => import('@/features/about/AboutView'));

function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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

        <Route
          path="/privacy"
          element={
            <Suspense fallback={<LegalSkeleton />}>
              <LegalLayout activeTab="privacy">
                <PrivacyPolicyView />
              </LegalLayout>
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<LegalSkeleton />}>
              <LegalLayout activeTab="terms">
                <TermsOfUseView />
              </LegalLayout>
            </Suspense>
          }
        />
        <Route
          path="/releases"
          element={
            <Suspense fallback={<LegalSkeleton />}>
              <LegalLayout activeTab="releases">
                <ReleasesView />
              </LegalLayout>
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<LegalSkeleton />}>
              <LegalLayout activeTab="about">
                <AboutView />
              </LegalLayout>
            </Suspense>
          }
        />

        <Route path="/workboard" element={<Navigate to="/board" replace />} />
        <Route path="/community" element={<Navigate to="/review" replace />} />
        <Route path="/changelog" element={<Navigate to="/releases" replace />} />
        <Route path="/version" element={<Navigate to="/releases" replace />} />
        <Route path="/policy" element={<Navigate to="/privacy" replace />} />
        <Route path="/tos" element={<Navigate to="/terms" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
