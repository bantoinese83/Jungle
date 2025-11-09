import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Jungle',
  description: 'View analytics and metrics for your Jungle application',
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}

