import React from 'react';
import { useUiStore } from '@/store/useUiStore';
import CommunityLayout from './CommunityLayout';
import ReviewsPage from './ReviewsPage';
import AnalyticsPage from './AnalyticsPage';

export interface CommunityPageProps {
  initialTab?: 'review' | 'analytics';
}

export const CommunityPage: React.FC<CommunityPageProps> = () => {
  const currentView = useUiStore((s) => s.currentView);
  const activeTab: 'review' | 'analytics' = currentView === 'analytics' ? 'analytics' : 'review';

  return (
    <CommunityLayout activeTab={activeTab}>
      {activeTab === 'analytics' ? <AnalyticsPage /> : <ReviewsPage />}
    </CommunityLayout>
  );
};

export default CommunityPage;
export { ReviewsPage, AnalyticsPage, CommunityLayout };
