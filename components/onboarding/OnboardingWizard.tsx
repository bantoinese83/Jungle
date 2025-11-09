'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import TestLeadButton from './TestLeadButton'
import { trackEvent } from '@/lib/analytics'

const crmSchema = z.object({
  crmType: z.enum(['gohighlevel', 'close', 'hubspot']),
  apiKey: z.string().min(1, 'API key is required'),
})

const retellSchema = z.object({
  apiKey: z.string().min(1, 'Retell AI API key is required'),
})

const speedToLeadSchema = z.object({
  speedToLeadMinutes: z.number().min(1).max(60),
})

type CRMFormData = z.infer<typeof crmSchema>
type RetellFormData = z.infer<typeof retellSchema>
type SpeedToLeadFormData = z.infer<typeof speedToLeadSchema>

const steps = [
  { id: 1, name: 'CRM Connection', description: 'Connect your CRM' },
  { id: 2, name: 'Retell AI Setup', description: 'Configure AI calling' },
  { id: 3, name: 'Speed to Lead', description: 'Set thresholds' },
]

export default function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string>('')

  useEffect(() => {
    // Track onboarding start
    trackEvent('onboarding_started')

    // Get organization ID from user
    const fetchOrganizationId = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const response = await fetch('/api/user/organization')
        if (response.ok) {
          const data = await response.json()
          setOrganizationId(data.organizationId)
        }
      }
    }
    fetchOrganizationId()
  }, [])

  const crmForm = useForm<CRMFormData>({
    resolver: zodResolver(crmSchema),
    defaultValues: { crmType: 'gohighlevel', apiKey: '' },
  })

  const retellForm = useForm<RetellFormData>({
    resolver: zodResolver(retellSchema),
    defaultValues: { apiKey: '' },
  })

  const speedToLeadForm = useForm<SpeedToLeadFormData>({
    resolver: zodResolver(speedToLeadSchema),
    defaultValues: { speedToLeadMinutes: 5 },
  })

  const handleCRMSubmit = async (data: CRMFormData) => {
    setIsSubmitting(true)
    setError(null)

    trackEvent('onboarding_step_started', {
      step: 1,
      stepName: 'CRM Connection',
      crmType: data.crmType,
    })

    try {
      const response = await fetch('/api/integrations/gohighlevel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: data.crmType,
          apiKey: data.apiKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save CRM integration')
      }

      trackEvent('onboarding_step_completed', {
        step: 1,
        stepName: 'CRM Connection',
        crmType: data.crmType,
      })

      setCurrentStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      trackEvent('onboarding_step_failed', {
        step: 1,
        stepName: 'CRM Connection',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetellSubmit = async (data: RetellFormData) => {
    setIsSubmitting(true)
    setError(null)

    trackEvent('onboarding_step_started', {
      step: 2,
      stepName: 'Retell AI Setup',
    })

    try {
      const response = await fetch('/api/integrations/retell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: data.apiKey }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save Retell AI integration')
      }

      trackEvent('onboarding_step_completed', {
        step: 2,
        stepName: 'Retell AI Setup',
      })

      setCurrentStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      trackEvent('onboarding_step_failed', {
        step: 2,
        stepName: 'Retell AI Setup',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSpeedToLeadSubmit = async (data: SpeedToLeadFormData) => {
    setIsSubmitting(true)
    setError(null)

    trackEvent('onboarding_step_started', {
      step: 3,
      stepName: 'Speed to Lead',
      threshold: data.speedToLeadMinutes,
    })

    try {
      const response = await fetch('/api/organization/speed-to-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speedToLeadMinutes: data.speedToLeadMinutes }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update speed to lead threshold')
      }

      trackEvent('onboarding_step_completed', {
        step: 3,
        stepName: 'Speed to Lead',
        threshold: data.speedToLeadMinutes,
      })

      trackEvent('onboarding_completed', {
        totalSteps: 3,
        speedToLeadThreshold: data.speedToLeadMinutes,
      })

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      trackEvent('onboarding_step_failed', {
        step: 3,
        stepName: 'Speed to Lead',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={crmForm.handleSubmit(handleCRMSubmit)} className="space-y-6">
            <div>
              <label htmlFor="crmType" className="block text-sm font-medium text-gray-700 mb-2">
                CRM Platform
              </label>
              <select
                {...crmForm.register('crmType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="gohighlevel">GoHighLevel</option>
                <option value="close">Close</option>
                <option value="hubspot">HubSpot</option>
              </select>
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                {...crmForm.register('apiKey')}
                type="password"
                placeholder="Enter your CRM API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
              {crmForm.formState.errors.apiKey && (
                <p className="mt-1 text-sm text-red-600">
                  {crmForm.formState.errors.apiKey.message}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Your API key is encrypted and stored securely. We&apos;ll use it to receive webhooks
                from your CRM when new leads are created.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Connecting...' : 'Connect CRM'}
              </button>
            </div>
          </form>
        )

      case 2:
        return (
          <form onSubmit={retellForm.handleSubmit(handleRetellSubmit)} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                Retell AI API Key
              </label>
              <input
                {...retellForm.register('apiKey')}
                type="password"
                placeholder="Enter your Retell AI API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
              {retellForm.formState.errors.apiKey && (
                <p className="mt-1 text-sm text-red-600">
                  {retellForm.formState.errors.apiKey.message}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Get your API key from{' '}
                <a
                  href="https://retellai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  retellai.com
                </a>
                . This enables automated AI calling when leads exceed your speed to lead threshold.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                aria-label="Go back to previous step"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </form>
        )

      case 3:
        return (
          <>
            <form
              onSubmit={speedToLeadForm.handleSubmit(handleSpeedToLeadSubmit)}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="speedToLeadMinutes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Speed to Lead Threshold (minutes)
                </label>
                <input
                  {...speedToLeadForm.register('speedToLeadMinutes', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                />
                {speedToLeadForm.formState.errors.speedToLeadMinutes && (
                  <p className="mt-1 text-sm text-red-600">
                    {speedToLeadForm.formState.errors.speedToLeadMinutes.message}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  If a lead isn&apos;t called within this time window, our AI will automatically trigger a
                  call. Recommended: 5 minutes for maximum conversion.
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  aria-label="Go back to previous step"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Completing...' : 'Complete Setup'}
                </button>
              </div>
            </form>
            {organizationId && (
              <div className="mt-8">
                <TestLeadButton organizationId={organizationId} />
              </div>
            )}
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Welcome! Let&apos;s get you set up</h2>
            <p className="mt-1 text-sm text-gray-600">
              Connect your tools and configure your lead tracking in just a few steps
            </p>
          </div>

          <div className="px-6 py-8">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {steps.map((step, stepIdx) => (
                  <li
                    key={step.id}
                    className={`${
                      stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
                    } relative`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          currentStep >= step.id
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <svg
                            className="h-5 w-5 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              currentStep >= step.id ? 'bg-white' : 'bg-gray-300'
                            }`}
                          />
                        )}
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            currentStep >= step.id ? 'text-emerald-600' : 'text-gray-500'
                          }`}
                        >
                          {step.name}
                        </p>
                        <p className="text-sm text-gray-500">{step.description}</p>
                      </div>
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div
                        className={`absolute top-4 left-4 -ml-px h-0.5 w-full ${
                          currentStep > step.id ? 'bg-emerald-600' : 'bg-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-12">
              {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
