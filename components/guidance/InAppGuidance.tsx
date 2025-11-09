'use client'

import { useEffect, useState } from 'react'
import { HelpCircle, X, BookOpen, ExternalLink } from 'lucide-react'

interface Tooltip {
  id: string
  target: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
  kbLink?: string
}

interface InAppGuidanceProps {
  tooltips?: Tooltip[]
  showHelpButton?: boolean
}

const defaultTooltips: Tooltip[] = [
  {
    id: 'dashboard-leads',
    target: '[data-guidance="leads-table"]',
    title: 'Leads Dashboard',
    content: 'View all your incoming leads and their status. Leads are automatically updated in real-time.',
    position: 'bottom',
    kbLink: 'https://notion.so/understanding-your-dashboard',
  },
  {
    id: 'speed-to-lead',
    target: '[data-guidance="speed-to-lead"]',
    title: 'Speed to Lead',
    content: 'This shows how quickly leads are being contacted. AI automatically calls leads that exceed your threshold.',
    position: 'top',
    kbLink: 'https://notion.so/speed-to-lead-explained',
  },
]

export default function InAppGuidance({
  tooltips = defaultTooltips,
  showHelpButton = true,
}: InAppGuidanceProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [dismissedTooltips, setDismissedTooltips] = useState<Set<string>>(new Set())
  const [showHelpMenu, setShowHelpMenu] = useState(false)

  useEffect(() => {
    // Show first tooltip on mount if not dismissed
    const firstTooltip = tooltips.find((t) => !dismissedTooltips.has(t.id))
    if (firstTooltip) {
      const timer = setTimeout(() => setActiveTooltip(firstTooltip.id), 1000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentTooltip = tooltips.find((t) => t.id === activeTooltip)

  const dismissTooltip = (id: string) => {
    setDismissedTooltips((prev) => new Set([...prev, id]))
    setActiveTooltip(null)

    // Show next tooltip
    const nextTooltip = tooltips.find(
      (t) => !dismissedTooltips.has(t.id) && t.id !== id
    )
    if (nextTooltip) {
      setTimeout(() => setActiveTooltip(nextTooltip.id), 500)
    }
  }

  const showTooltip = (id: string) => {
    setActiveTooltip(id)
  }

  if (!showHelpButton && !activeTooltip) {
    return null
  }

  return (
    <>
      {showHelpButton && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            type="button"
            onClick={() => setShowHelpMenu(!showHelpMenu)}
            className="bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition"
            aria-label="Help"
            aria-expanded={showHelpMenu}
          >
            <HelpCircle className="w-6 h-6" aria-hidden="true" />
          </button>

          {showHelpMenu && (
            <div className="absolute bottom-16 left-0 w-64 bg-white rounded-lg shadow-xl border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Help & Resources</h3>
                <button
                  type="button"
                  onClick={() => setShowHelpMenu(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close help menu"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-2">
                <a
                  href="https://notion.so/knowledge-base"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Knowledge Base
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>

                <button
                  onClick={() => {
                    setShowHelpMenu(false)
                    const firstTooltip = tooltips[0]
                    if (firstTooltip) showTooltip(firstTooltip.id)
                  }}
                  className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-sm"
                >
                  <HelpCircle className="w-4 h-4" />
                  Show Guided Tour
                </button>

                <a
                  href="mailto:support@jungle.app"
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-sm"
                >
                  <HelpCircle className="w-4 h-4" />
                  Contact Support
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {currentTooltip && (
        <TooltipOverlay
          tooltip={currentTooltip}
          onDismiss={() => dismissTooltip(currentTooltip.id)}
          onNext={() => {
            const currentIndex = tooltips.findIndex((t) => t.id === currentTooltip.id)
            const nextTooltip = tooltips[currentIndex + 1]
            if (nextTooltip) {
              setActiveTooltip(nextTooltip.id)
            } else {
              dismissTooltip(currentTooltip.id)
            }
          }}
          hasNext={tooltips.findIndex((t) => t.id === currentTooltip.id) < tooltips.length - 1}
        />
      )}
    </>
  )
}

function TooltipOverlay({
  tooltip,
  onDismiss,
  onNext,
  hasNext,
}: {
  tooltip: Tooltip
  onDismiss: () => void
  onNext: () => void
  hasNext: boolean
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const element = document.querySelector(tooltip.target)
    if (element) {
      const rect = element.getBoundingClientRect()
      const tooltipHeight = 200 // Approximate
      const tooltipWidth = 300

      let top = 0
      let left = 0

      switch (tooltip.position) {
        case 'top':
          top = rect.top - tooltipHeight - 10
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'bottom':
          top = rect.bottom + 10
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.left - tooltipWidth - 10
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + 10
          break
      }

      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setPosition({ top, left })
      })
    }
  }, [tooltip.target, tooltip.position])

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50" 
        onClick={onDismiss}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            onDismiss()
          }
        }}
        aria-label="Close tooltip"
      />
      <div
        className="fixed bg-white rounded-lg shadow-2xl p-4 z-50 w-80"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-lg">{tooltip.title}</h4>
          <button
            type="button"
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">{tooltip.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {tooltip.kbLink && (
              <a
                href={tooltip.kbLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3" />
                Learn More
              </a>
            )}
          </div>
          <div className="flex gap-2">
            {hasNext && (
              <button
                type="button"
                onClick={onNext}
                className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-emerald-700 transition"
                aria-label="Next step"
              >
                Next
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition"
              aria-label={hasNext ? 'Skip tutorial' : 'Got it'}
            >
              {hasNext ? 'Skip' : 'Got it&apos;'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

