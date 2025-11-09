import LeadsDashboard from '@/components/dashboard/LeadsDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Leads Overview | Jungle',
  description: 'Real-time view of incoming leads and their call status.',
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LeadsDashboard />
    </div>
  )
}

