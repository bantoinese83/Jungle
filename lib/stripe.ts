import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export const getStripe = (): Stripe => {
  if (stripeInstance) {
    return stripeInstance
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  })

  return stripeInstance
}

