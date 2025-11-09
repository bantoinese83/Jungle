'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, MessageCircle, CheckCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import EventTimeline from './EventTimeline'

interface Metrics {
  demo: {
    started: number
    completed: number
    conversionRate: number
    avgThreshold: number
  }
  chatbot: {
    opened: number
    messages: number
    avgMessagesPerSession: number
    highFitLeads: number
    ctaClicks: number
  }
  onboarding: {
    started: number
    completed: number
    completionRate: number
    avgStepsCompleted: number
    dropOffStep: string | null
  }
  testLead: {
    sent: number
    success: number
    successRate: number
  }
  signup: {
    attempts: number
    success: number
    conversionRate: number
  }
  funnel: {
    visitors: number
    demos: number
    signups: number
    onboardings: number
    activeUsers: number
  }
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const startDate = getStartDate(dateRange)
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate.toISOString())
      params.set('endDate', new Date().toISOString())

      const response = await fetch(`/api/analytics/metrics?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setMetrics(data.metrics)
      } else {
        setError(data.message || 'Failed to fetch metrics')
      }
    } catch (err) {
      setError('An error occurred while fetching metrics')
      console.error('Metrics fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStartDate = (range: string): Date | null => {
    const now = new Date()
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      default:
        return null
    }
  }

  useEffect(() => {
    fetchMetrics()
    trackEvent('analytics_dashboard_viewed')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error && !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <p className="text-sm text-red-600 mt-2">
          Note: Analytics events are being tracked but not yet stored in database. 
          Check Google Analytics or your configured analytics provider for data.
        </p>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track user behavior and conversion metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')
            trackEvent('analytics_date_range_changed', { range: e.target.value })
          }}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Demo Conversion"
          value={`${metrics.demo.conversionRate.toFixed(1)}%`}
          subtitle={`${metrics.demo.completed} / ${metrics.demo.started} completed`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend="up"
        />
        <MetricCard
          title="Onboarding Completion"
          value={`${metrics.onboarding.completionRate.toFixed(1)}%`}
          subtitle={`${metrics.onboarding.completed} / ${metrics.onboarding.started} completed`}
          icon={<CheckCircle className="w-6 h-6" />}
          trend="up"
        />
        <MetricCard
          title="Chatbot Engagement"
          value={metrics.chatbot.avgMessagesPerSession.toFixed(1)}
          subtitle={`${metrics.chatbot.messages} messages across ${metrics.chatbot.opened} sessions`}
          icon={<MessageCircle className="w-6 h-6" />}
          trend="neutral"
        />
        <MetricCard
          title="Signup Conversion"
          value={`${metrics.signup.conversionRate.toFixed(1)}%`}
          subtitle={`${metrics.signup.success} / ${metrics.signup.attempts} successful`}
          icon={<Users className="w-6 h-6" />}
          trend="up"
        />
      </div>

      {/* Funnel Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
        <div className="space-y-4">
          <FunnelStep
            label="Visitors"
            count={metrics.funnel.visitors}
            percentage={100}
            color="bg-gray-200"
          />
          <FunnelStep
            label="Demos Started"
            count={metrics.funnel.demos}
            percentage={metrics.funnel.visitors > 0 ? (metrics.funnel.demos / metrics.funnel.visitors) * 100 : 0}
            color="bg-blue-200"
          />
          <FunnelStep
            label="Signups"
            count={metrics.funnel.signups}
            percentage={metrics.funnel.demos > 0 ? (metrics.funnel.signups / metrics.funnel.demos) * 100 : 0}
            color="bg-emerald-200"
          />
          <FunnelStep
            label="Onboardings Completed"
            count={metrics.funnel.onboardings}
            percentage={metrics.funnel.signups > 0 ? (metrics.funnel.onboardings / metrics.funnel.signups) * 100 : 0}
            color="bg-green-200"
          />
          <FunnelStep
            label="Active Users"
            count={metrics.funnel.activeUsers}
            percentage={metrics.funnel.onboardings > 0 ? (metrics.funnel.activeUsers / metrics.funnel.onboardings) * 100 : 0}
            color="bg-purple-200"
          />
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demo Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Demo Metrics</h2>
          <div className="space-y-3">
            <MetricRow label="Demos Started" value={metrics.demo.started} />
            <MetricRow label="Demos Completed" value={metrics.demo.completed} />
            <MetricRow label="Conversion Rate" value={`${metrics.demo.conversionRate.toFixed(1)}%`} />
            <MetricRow label="Avg Threshold" value={`${metrics.demo.avgThreshold.toFixed(1)} min`} />
          </div>
        </div>

        {/* Chatbot Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Chatbot Metrics</h2>
          <div className="space-y-3">
            <MetricRow label="Sessions Opened" value={metrics.chatbot.opened} />
            <MetricRow label="Total Messages" value={metrics.chatbot.messages} />
            <MetricRow label="Avg Messages/Session" value={metrics.chatbot.avgMessagesPerSession.toFixed(1)} />
            <MetricRow label="High-Fit Leads" value={metrics.chatbot.highFitLeads} />
            <MetricRow label="CTA Clicks" value={metrics.chatbot.ctaClicks} />
          </div>
        </div>

        {/* Onboarding Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Onboarding Metrics</h2>
          <div className="space-y-3">
            <MetricRow label="Onboardings Started" value={metrics.onboarding.started} />
            <MetricRow label="Onboardings Completed" value={metrics.onboarding.completed} />
            <MetricRow label="Completion Rate" value={`${metrics.onboarding.completionRate.toFixed(1)}%`} />
            <MetricRow label="Avg Steps Completed" value={metrics.onboarding.avgStepsCompleted.toFixed(1)} />
            {metrics.onboarding.dropOffStep && (
              <MetricRow label="Most Common Drop-off" value={metrics.onboarding.dropOffStep} />
            )}
          </div>
        </div>

        {/* Test Lead Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Lead Metrics</h2>
          <div className="space-y-3">
            <MetricRow label="Test Leads Sent" value={metrics.testLead.sent} />
            <MetricRow label="Successful" value={metrics.testLead.success} />
            <MetricRow label="Success Rate" value={`${metrics.testLead.successRate.toFixed(1)}%`} />
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="mt-6">
        <EventTimeline />
      </div>

      {/* Info Banner */}
      {error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Analytics events are being tracked via Google Analytics and custom endpoint. 
            To see real-time metrics here, set up database storage for analytics events.
          </p>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend: 'up' | 'down' | 'neutral'
}) {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={trendColors[trend]}>{icon}</div>
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

function FunnelStep({
  label,
  count,
  percentage,
  color,
}: {
  label: string
  count: number
  percentage: number
  color: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {count.toLocaleString()} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`${color} h-4 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

