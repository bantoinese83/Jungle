'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadStatus } from '@/types'
import LeadsDashboardMobile from './LeadsDashboardMobile'
import { TableSkeleton } from '@/components/ui/Skeleton'

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

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchLeads = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Not authenticated')
          setIsLoading(false)
          return
        }

        // Fetch initial leads
        const { data, error: fetchError } = await supabase
          .from('leads')
          .select('*')
          .order('received_at', { ascending: false })
          .limit(50)

        if (fetchError) throw fetchError
        setLeads(data || [])
        setIsLoading(false)

        // Subscribe to real-time updates
        const channel = supabase
          .channel('leads-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'leads',
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setLeads((prev) => [payload.new as Lead, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setLeads((prev) =>
                  prev.map((lead) => (lead.id === payload.new.id ? (payload.new as Lead) : lead))
                )
              } else if (payload.eventType === 'DELETE') {
                setLeads((prev) => prev.filter((lead) => lead.id !== payload.old.id))
              }
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leads')
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [])

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Leads Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Real-time view of incoming leads and their call status
            </p>
          </div>
        </div>
        <div className="mt-8">
          <TableSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Leads Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Real-time view of incoming leads and their call status
          </p>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden mt-8">
        <LeadsDashboardMobile leads={leads} />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300" role="table" aria-label="Leads table">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Phone
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Received At
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Speed to Lead
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                        No leads yet. They&apos;ll appear here when your CRM sends webhooks.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {lead.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-emerald-600 hover:underline"
                            aria-label={`Call ${lead.name}`}
                          >
                            {lead.phone}
                          </a>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-emerald-600 hover:underline"
                              aria-label={`Email ${lead.name}`}
                            >
                              {lead.email}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <time dateTime={lead.receivedAt.toString()}>
                            {new Date(lead.receivedAt).toLocaleString()}
                          </time>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatSpeedToLead(lead.speedToLeadMinutes)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                              statusColors[lead.status as LeadStatus]
                            }`}
                            aria-label={`Status: ${statusLabels[lead.status as LeadStatus]}`}
                          >
                            {statusLabels[lead.status as LeadStatus]}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

