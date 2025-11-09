import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Jungle',
  description: 'Create your Jungle account to start automatically calling leads within minutes.',
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

