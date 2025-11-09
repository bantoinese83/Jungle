'use client'

import { useState, useEffect } from 'react'
import { Clock, Filter } from 'lucide-react'

interface AnalyticsEvent {
  id: string
  event: string
  properties: Record<string, unknown>
  timestamp: string
  session_id?: string
  url?: string
}

export default function EventTimeline() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [limit, setLimit] = useState(50)

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (eventFilter !== 'all') params.set('event', eventFilter)
      params.set('limit', limit.toString())

      const response = await fetch(`/api/analytics/events?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Events fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventFilter, limit])

  const eventTypes = [
    'all',
    'demo_started',
    'demo_completed',
    'chatbot_opened',
    'chatbot_message_sent',
    'signup_attempt',
    'signup_completed',
    'onboarding_started',
    'onboarding_completed',
  ]

  const getEventColor = (event: string) => {
    if (event.includes('demo')) return 'bg-blue-100 text-blue-800'
    if (event.includes('chatbot')) return 'bg-purple-100 text-purple-800'
    if (event.includes('signup')) return 'bg-emerald-100 text-emerald-800'
    if (event.includes('onboarding')) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Events</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Events' : type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No events found for the selected filter.</p>
            <p className="text-sm mt-2">Events will appear here as users interact with your app.</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="shrink-0 mt-1">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${getEventColor(event.event)}`}
                  >
                    {event.event.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                {Object.keys(event.properties || {}).length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    <details className="cursor-pointer">
                      <summary className="text-gray-500">Properties</summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(event.properties, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                {event.url && (
                  <div className="text-xs text-gray-500 mt-1 truncate">{event.url}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {events.length >= limit && (
        <button
          type="button"
          onClick={() => setLimit(limit + 50)}
          className="mt-4 w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          aria-label="Load more events"
        >
          Load More Events
        </button>
      )}
    </div>
  )
}

