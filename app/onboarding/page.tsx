import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onboarding - Set Up Your Account | Jungle',
  description: 'Connect your CRM, configure AI calling, and set up speed to lead thresholds.',
}

export default function Onboarding() {
  return <OnboardingWizard />
}

