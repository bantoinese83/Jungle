/**
 * Analytics tracking utility
 * Supports multiple analytics providers (Google Analytics, PostHog, custom)
 */

interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
}

// Get or create session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Initialize analytics providers
function initAnalytics() {
  // Google Analytics 4
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
    // GA4 is typically loaded via script tag, but we can also use gtag
    if (window.gtag) {
      // Already initialized
    }
  }

  // PostHog
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    // PostHog initialization would go here
  }
}

// Track event to all configured analytics providers
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  const event: AnalyticsEvent = {
    name: eventName,
    properties: properties || {},
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...properties,
      event_category: 'user_interaction',
    } as Record<string, unknown>)
  }

  // PostHog
  if (window.posthog) {
    window.posthog.capture(eventName, properties as Record<string, unknown>)
  }

  // Custom analytics endpoint (internal)
  fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
    }),
    keepalive: true, // Send even if page is unloading
  }).catch((error) => {
    console.error('Analytics tracking error:', error)
  })

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, properties)
  }
}

// Track page views
export function trackPageView(path: string) {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: path,
    })
  }

  // PostHog
  if (window.posthog) {
    window.posthog.capture('$pageview', {
      $current_url: window.location.href,
    })
  }

  // Custom tracking
  trackEvent('page_view', {
    path,
    url: window.location.href,
  })
}

// Track conversions
export function trackConversion(conversionType: string, value?: number) {
  trackEvent('conversion', {
    type: conversionType,
    value,
  })
}

// Initialize on load
if (typeof window !== 'undefined') {
  initAnalytics()
}

// Type declarations for window objects
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | object,
      config?: Record<string, unknown>
    ) => void
    posthog?: {
      capture: (eventName: string, properties?: Record<string, unknown>) => void
      identify: (userId: string, properties?: Record<string, unknown>) => void
    }
  }
}

