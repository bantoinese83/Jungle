'use client'

import type { Lead, LeadStatus } from '@/types'

const statusColors: Record<LeadStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  called_by_human: 'bg-green-100 text-green-800',
  ai_triggered: 'bg-emerald-100 text-emerald-800',
}

const statusLabels: Record<LeadStatus, string> = {
  pending: 'Pending',
  called_by_human: 'Called by Human',
  ai_triggered: 'AI Triggered',
}

function formatSpeedToLead(minutes: number | null | undefined): string {
  if (!minutes) return 'N/A'
  if (minutes < 1) return '< 1 min'
  return `${minutes} min`
}

interface LeadsDashboardMobileProps {
  leads: Lead[]
}

export default function LeadsDashboardMobile({ leads }: LeadsDashboardMobileProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        No leads yet. They&apos;ll appear here when your CRM sends webhooks.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="bg-white rounded-lg shadow p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{lead.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(lead.receivedAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                statusColors[lead.status as LeadStatus]
              }`}
            >
              {statusLabels[lead.status as LeadStatus]}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="text-gray-500 w-24">Phone:</span>
              <a
                href={`tel:${lead.phone}`}
                className="text-emerald-600 hover:underline"
                aria-label={`Call ${lead.name} at ${lead.phone}`}
              >
                {lead.phone}
              </a>
            </div>
            {lead.email && (
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Email:</span>
                <a
                  href={`mailto:${lead.email}`}
                  className="text-emerald-600 hover:underline"
                  aria-label={`Email ${lead.name} at ${lead.email}`}
                >
                  {lead.email}
                </a>
              </div>
            )}
            <div className="flex items-center">
              <span className="text-gray-500 w-24">Speed to Lead:</span>
              <span className="text-gray-900">{formatSpeedToLead(lead.speedToLeadMinutes)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

