/**
 * Environment variable validation
 * Call this at application startup to ensure all required variables are set
 */

const requiredEnvVars = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  
  // Webhooks
  WEBHOOK_SECRET_KEY: process.env.WEBHOOK_SECRET_KEY,
  
  // Stripe (optional for some features)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  
  // Cron
  CRON_SECRET: process.env.CRON_SECRET,
} as const

const optionalEnvVars = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  STRIPE_PRICE_PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
  STRIPE_PRICE_ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,
} as const

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required variables
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      errors.push(`Required environment variable ${key} is not set`)
    }
  }

  // Validate ENCRYPTION_KEY length
  if (requiredEnvVars.ENCRYPTION_KEY && requiredEnvVars.ENCRYPTION_KEY.length < 32) {
    errors.push('ENCRYPTION_KEY must be at least 32 characters long')
  }

  // Validate WEBHOOK_SECRET_KEY length
  if (requiredEnvVars.WEBHOOK_SECRET_KEY && requiredEnvVars.WEBHOOK_SECRET_KEY.length < 16) {
    errors.push('WEBHOOK_SECRET_KEY must be at least 16 characters long')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  const validation = validateEnvironment()
  if (!validation.valid) {
    console.error('Environment validation failed:')
    validation.errors.forEach((error) => console.error(`  - ${error}`))
    // Don't throw in development to allow for gradual setup
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed. Please check your environment variables.')
    }
  }
}

