'use client'

import { useState } from 'react'
import { ArrowUp, Check, Loader2 } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  current?: boolean
}

interface OneClickUpgradeProps {
  currentPlan: string
  onUpgrade: (planId: string) => Promise<void>
}

const plans: Plan[] = [
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    features: [
      'Up to 2,000 leads/month',
      'Multiple CRM integrations',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    features: [
      'Unlimited leads',
      'All CRM integrations',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom integrations',
      'SLA guarantees',
    ],
  },
]

export default function OneClickUpgrade({ currentPlan, onUpgrade }: OneClickUpgradeProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true)
    setSelectedPlan(planId)

    try {
      await onUpgrade(planId)
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to upgrade. Please try again or contact support.')
    } finally {
      setIsUpgrading(false)
      setSelectedPlan(null)
    }
  }

  const availablePlans = plans.filter((plan) => plan.id !== currentPlan)

  if (availablePlans.length === 0) {
    return null
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowUp className="w-5 h-5 text-emerald-600" />
        <h3 className="text-xl font-semibold">Upgrade Your Plan</h3>
      </div>
      <p className="text-gray-600 mb-6">
        Unlock more features and scale your lead automation. Upgrade in one click.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {availablePlans.map((plan) => (
          <div
            key={plan.id}
            className="border rounded-lg p-4 hover:border-emerald-500 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-lg">{plan.name}</h4>
              <span className="text-2xl font-bold text-emerald-600">${plan.price}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">per month</p>

            <ul className="space-y-2 mb-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleUpgrade(plan.id)}
              disabled={isUpgrading}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label={`Upgrade to ${plan.name} plan`}
            >
              {isUpgrading && selectedPlan === plan.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4" />
                  Upgrade Now
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

