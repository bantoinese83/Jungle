'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PricingTier {
  name: string
  price: { monthly: number; annual: number }
  description: string
  features: string[]
  cta: string
  popular?: boolean
}

const tiers: PricingTier[] = [
  {
    name: 'Starter',
    price: { monthly: 99, annual: 990 },
    description: 'Perfect for small teams getting started with lead tracking',
    features: [
      'Up to 500 leads/month',
      'AI calling with Retell AI',
      'Basic CRM integration',
      'Real-time lead dashboard',
      'Email support',
      'Speed to lead tracking',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: { monthly: 299, annual: 2990 },
    description: 'For growing teams that need advanced lead management',
    features: [
      'Up to 2,000 leads/month',
      'AI calling with Retell AI',
      'Multiple CRM integrations',
      'Advanced analytics & reporting',
      'Priority support',
      'Custom speed to lead thresholds',
      'Webhook integrations',
    ],
    popular: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: { monthly: 799, annual: 7990 },
    description: 'For large organizations with high-volume lead processing',
    features: [
      'Unlimited leads',
      'AI calling with Retell AI',
      'All CRM integrations',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom integrations',
      'SLA guarantees',
      'Advanced security & compliance',
    ],
    cta: 'Contact Sales',
  },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const isAnnual = billingCycle === 'annual'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your lead tracking and AI calling needs
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="relative bg-white p-1 rounded-lg border border-gray-200 inline-flex">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              aria-pressed={billingCycle === 'monthly'}
              aria-label="Monthly billing"
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              aria-pressed={billingCycle === 'annual'}
              aria-label="Annual billing"
            >
              Annual
              {isAnnual && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full" aria-label="Save 17%">
                  Save 17%
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                tier.popular
                  ? 'border-emerald-500 scale-105 z-10'
                  : 'border-gray-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-6 text-sm">{tier.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      ${isAnnual ? tier.price.annual : tier.price.monthly}
                    </span>
                    <span className="ml-2 text-gray-600">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${Math.round(tier.price.annual / 12)}/month billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.cta === 'Contact Sales' ? (
                  <a
                    href="mailto:sales@jungle.app"
                    className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                      tier.popular
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {tier.cta}
                  </a>
                ) : (
                  <Link
                    href="/signup"
                    className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                      tier.popular
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-sm text-gray-500">
            Questions? <a href="mailto:support@jungle.app" className="text-emerald-600 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  )
}

