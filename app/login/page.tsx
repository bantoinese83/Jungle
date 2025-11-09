import LoginForm from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Jungle',
  description: 'Sign in to your Jungle account to manage your leads and AI calling settings.',
}

export default function Login() {
  return <LoginForm />
}

