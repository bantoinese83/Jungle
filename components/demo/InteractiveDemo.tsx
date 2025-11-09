'use client'

import { useState } from 'react'
import { Play, CheckCircle, Clock, Phone, Sparkles } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface DemoLead {
  name: string
  phone: string
  email: string
  receivedAt: Date
  calledAt?: Date
  status: 'pending' | 'called' | 'ai_triggered'
}

export default function InteractiveDemo() {
  const [scenario, setScenario] = useState<'default' | 'custom'>('default')
  const [customLead, setCustomLead] = useState({ name: '', phone: '', email: '' })
  const [demoStarted, setDemoStarted] = useState(false)
  const [leads, setLeads] = useState<DemoLead[]>([])
  const [speedToLeadThreshold, setSpeedToLeadThreshold] = useState(5)

  const startDemo = () => {
    setDemoStarted(true)
    
    // Track demo start
    trackEvent('demo_started', {
      scenario,
      speedToLeadThreshold,
      hasCustomLead: scenario === 'custom' && (customLead.name || customLead.phone),
    })

    const lead: DemoLead = {
      name: scenario === 'custom' && customLead.name ? customLead.name : 'John Doe',
      phone: scenario === 'custom' && customLead.phone ? customLead.phone : '+1 (555) 123-4567',
      email: scenario === 'custom' && customLead.email ? customLead.email : 'john.doe@example.com',
      receivedAt: new Date(),
      status: 'pending',
    }

    setLeads([lead])

    // Simulate AI call trigger after threshold
    setTimeout(() => {
      const calledAt = new Date()
      const speedToLead = Math.round((calledAt.getTime() - lead.receivedAt.getTime()) / 1000 / 60)
      
      setLeads((prev) =>
        prev.map((l) => ({
          ...l,
          calledAt,
          status: 'ai_triggered',
        }))
      )

      // Track demo completion
      trackEvent('demo_completed', {
        scenario,
        speedToLeadThreshold,
        actualSpeedToLead: speedToLead,
        leadName: lead.name,
      })
    }, speedToLeadThreshold * 1000)
  }

  const resetDemo = () => {
    setDemoStarted(false)
    setLeads([])
    trackEvent('demo_reset')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Experience Jungle in Action</h2>
        <p className="text-gray-600">
          See how Jungle automatically calls leads within your speed-to-lead threshold. No signup required.
        </p>
      </div>

      {!demoStarted ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">Choose Scenario</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setScenario('default')
                  trackEvent('demo_scenario_selected', { scenario: 'default' })
                }}
                className={`px-4 py-2 rounded-lg border ${
                  scenario === 'default'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                aria-pressed={scenario === 'default'}
                aria-label="Default demo scenario"
              >
                Default Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setScenario('custom')
                  trackEvent('demo_scenario_selected', { scenario: 'custom' })
                }}
                className={`px-4 py-2 rounded-lg border ${
                  scenario === 'custom'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                aria-pressed={scenario === 'custom'}
                aria-label="Custom demo scenario"
              >
                Custom Scenario
              </button>
            </div>
          </div>

          {scenario === 'custom' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Lead Name</label>
                <input
                  type="text"
                  value={customLead.name}
                  onChange={(e) => setCustomLead({ ...customLead, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Phone Number</label>
                <input
                  type="tel"
                  value={customLead.phone}
                  onChange={(e) => setCustomLead({ ...customLead, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Email</label>
                <input
                  type="email"
                  value={customLead.email}
                  onChange={(e) => setCustomLead({ ...customLead, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Speed to Lead Threshold: {speedToLeadThreshold} minutes
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={speedToLeadThreshold}
              onChange={(e) => {
                setSpeedToLeadThreshold(Number(e.target.value))
                trackEvent('demo_threshold_changed', { threshold: Number(e.target.value) })
              }}
              className="w-full"
            />
            <p className="text-sm text-gray-700 mt-1">
              AI will automatically call the lead if not contacted within this time
            </p>
          </div>

          <button
            type="button"
            onClick={startDemo}
            className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            aria-label="Start interactive demo"
          >
            <Play className="w-5 h-5" aria-hidden="true" />
            Start Interactive Demo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Demo Dashboard</h3>
            <button
              type="button"
              onClick={resetDemo}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
              aria-label="Reset demo"
            >
              Reset Demo
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Simulated Lead Received</span>
            </div>
            <p className="text-sm text-gray-600">
              A new lead has been received in your CRM. Watch what happens next...
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Lead</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Received</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Speed to Lead</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => {
                  const speedToLead = lead.calledAt
                    ? Math.round((lead.calledAt.getTime() - lead.receivedAt.getTime()) / 1000 / 60)
                    : (() => {
                        const now = Date.now()
                        return Math.round((now - lead.receivedAt.getTime()) / 1000 / 60)
                      })()

                  return (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-600">{lead.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {lead.receivedAt.toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">
                        {lead.status === 'ai_triggered' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                            AI Called
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900">
                            {lead.calledAt ? `${speedToLead} min` : 'Waiting...'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {leads.some((l) => l.status === 'ai_triggered') && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Call Triggered!
              </h4>
              <p className="text-emerald-800 mb-4">
                The lead was automatically called within {speedToLeadThreshold} minutes. This is how
                Jungle ensures you never miss a lead.
              </p>
              <div className="flex gap-4">
                <a
                  href="/signup"
                  onClick={() => trackEvent('demo_cta_clicked', { cta: 'signup', source: 'demo_completion' })}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition"
                >
                  Start Free Trial
                </a>
                <a
                  href="/pricing"
                  onClick={() => trackEvent('demo_cta_clicked', { cta: 'pricing', source: 'demo_completion' })}
                  className="border border-emerald-600 text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition"
                >
                  View Pricing
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
