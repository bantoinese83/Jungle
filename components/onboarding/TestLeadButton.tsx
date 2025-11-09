'use client'

import { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface TestLeadResult {
  success: boolean
  message: string
  leadId?: string
}

export default function TestLeadButton({ organizationId }: { organizationId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TestLeadResult | null>(null)

  const sendTestLead = async () => {
    setIsLoading(true)
    setResult(null)

    trackEvent('test_lead_sent', {
      organizationId,
    })

    try {
      const response = await fetch('/api/leads/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          name: 'Test Lead',
          phone: '+15551234567',
          email: 'test@example.com',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        trackEvent('test_lead_success', {
          organizationId,
          leadId: data.leadId,
        })
        
        setResult({
          success: true,
          message: 'Test lead sent successfully! Check your dashboard to see it in action.',
          leadId: data.leadId,
        })
      } else {
        trackEvent('test_lead_failed', {
          organizationId,
          error: data.error,
        })
        
        setResult({
          success: false,
          message: data.error || 'Failed to send test lead. Please try again.',
        })
      }
    } catch (error) {
      trackEvent('test_lead_error', {
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      setResult({
        success: false,
        message: 'An error occurred. Please check your connections and try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Test Your Setup</h3>
        <p className="text-sm text-blue-800 mb-4">
          Send a test lead to verify your CRM integration and see how Jungle processes it in real-time.
        </p>
        <button
          type="button"
          onClick={sendTestLead}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          aria-label="Send test lead"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Test Lead
            </>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            result.success
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                result.success ? 'text-emerald-900' : 'text-red-900'
              }`}
            >
              {result.message}
            </p>
            {result.success && result.leadId && (
              <a
                href={`/dashboard?lead=${result.leadId}`}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 inline-block"
              >
                View in Dashboard →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

