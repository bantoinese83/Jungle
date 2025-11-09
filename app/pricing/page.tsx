import PricingPage from '@/components/pricing/PricingPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Simple, Transparent Pricing | Jungle',
  description: 'Choose the plan that fits your lead tracking and AI calling needs. All plans include a 14-day free trial.',
}

export default function Pricing() {
  return <PricingPage />
}

