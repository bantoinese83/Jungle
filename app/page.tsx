import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jungle - Speed to Lead, Powered by AI',
  description: 'Automatically call leads within minutes of them submitting a form. Connect your CRM, configure AI calling, and never miss a lead again.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Speed to Lead, Powered by AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Automatically call leads within minutes of them submitting a form. Connect your CRM,
            configure AI calling, and never miss a lead again.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="px-8 py-3 border border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              Try Interactive Demo
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>

        <section aria-label="Features" className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h2>
            <p className="text-gray-600">
              AI calls triggered automatically when leads exceed your speed to lead threshold
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">CRM Integration</h2>
            <p className="text-gray-600">
              Works with GoHighLevel, Close, HubSpot, and more via webhooks
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Real-time Dashboard</h2>
            <p className="text-gray-600">
              Track every lead, call status, and speed to lead metrics in real-time
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
