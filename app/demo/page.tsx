import InteractiveDemo from '@/components/demo/InteractiveDemo'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interactive Demo - See Jungle in Action | Jungle',
  description:
    'Experience how Jungle automatically calls leads within minutes. Try our interactive demo - no signup required.',
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <InteractiveDemo />
      </div>
    </div>
  )
}

