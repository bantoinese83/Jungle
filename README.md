# Jungle - Speed to Lead AI Calling SaaS

A modern, multi-tenant SaaS application for automatically calling leads within minutes using AI. Built with Next.js 14, Supabase, and Stripe.

## 🎯 Roadmap Status

See [ROADMAP_STATUS.md](./ROADMAP_STATUS.md) for detailed progress against the 6-step roadmap.

**Current Status**: Production Ready ✅
- ✅ Step 3: Production Pipeline (100%)
- ✅ Step 4: Operations OS (100%)
- ✅ Step 5: Marketing Engine (100%)
- ✅ Step 6: Sales Engine (100%)
- 📋 Step 1: AI Discovery (In Progress)
- ✅ Step 2: Vibe Prototype (Complete via Production)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **Database**: Prisma ORM with PostgreSQL
- **Payments**: Stripe
- **AI Calling**: Retell AI
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## Features

- 🔐 Multi-tenant architecture with Row Level Security (RLS)
- 📞 Automated AI calling via Retell AI when speed to lead threshold is exceeded
- 🔗 CRM integrations (GoHighLevel, Close, HubSpot) via webhooks
- 📊 Real-time dashboard with Supabase Realtime
- 💳 Stripe subscription management
- 🎯 Configurable speed to lead thresholds per organization
- 🔒 Encrypted API key storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account
- Retell AI account (for AI calling)
- PostgreSQL database (via Supabase)

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - Supabase connection pooling URL (port 6543, for application queries)
- `DIRECT_URL` - Supabase direct connection URL (port 5432, for migrations)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `ENCRYPTION_KEY` - A 32+ character key for encrypting API keys
- `WEBHOOK_SECRET_KEY` - Secret key for validating CRM webhooks
- `RETELL_API_KEY` - Your Retell AI API key (for Edge Functions)
- `RETELL_AGENT_ID` - Your Retell AI agent ID

3. **Set up the database:**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if using Prisma migrations)
npx prisma migrate dev

# Or apply Supabase migrations manually
# Run the SQL files in supabase/migrations/ via Supabase dashboard
```

4. **Set up Supabase:**

   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`:
     - `001_rls_policies.sql` - Row Level Security policies
     - `002_dashboard_summary_rpc.sql` - Dashboard summary RPC function
     - `003_lead_trigger.sql` - Database triggers for speed to lead calculation
   - Deploy Edge Functions:
     ```bash
     supabase functions deploy trigger-ai-caller
     supabase functions deploy stripe-webhook
     ```
   - Set Edge Function secrets:
     ```bash
     supabase secrets set RETELL_API_KEY=your_key
     supabase secrets set RETELL_AGENT_ID=your_agent_id
     supabase secrets set STRIPE_SECRET_KEY=your_stripe_key
     supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
     ```

5. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
jungle/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── leads/        # Lead webhook handler
│   │   ├── integrations/ # CRM/Retell integration management
│   │   └── auth/         # Auth callbacks
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── onboarding/       # Onboarding wizard
│   └── pricing/          # Pricing page
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── onboarding/      # Onboarding wizard
│   └── pricing/         # Pricing page
├── lib/                 # Utility libraries
│   ├── supabase/       # Supabase clients
│   ├── prisma.ts       # Prisma client
│   ├── stripe.ts       # Stripe client
│   └── encryption.ts   # API key encryption
├── prisma/              # Prisma schema
├── supabase/
│   ├── functions/      # Edge Functions
│   │   ├── trigger-ai-caller/  # AI caller trigger
│   │   └── stripe-webhook/      # Stripe webhook handler
│   └── migrations/     # SQL migrations
└── types/              # TypeScript types
```

## Key Components

### Frontend Components

- **PricingPage**: Displays pricing tiers with monthly/annual toggle
- **LoginForm**: Authentication with email/password and Google OAuth
- **OnboardingWizard**: Multi-step wizard for CRM and Retell AI setup
- **LeadsDashboard**: Real-time leads table with Supabase Realtime

### API Routes

- `/api/leads/webhook`: Handles CRM webhooks for new leads
- `/api/integrations/gohighlevel`: Manages CRM API key storage
- `/api/integrations/retell`: Manages Retell AI API key storage
- `/api/organization/speed-to-lead`: Updates speed to lead threshold

### Supabase Edge Functions

- **trigger-ai-caller**: Triggers Retell AI calls when speed to lead threshold is exceeded
- **stripe-webhook**: Handles Stripe subscription events

### Database

- Multi-tenant schema with Organizations, Users, Leads, and Integrations
- Row Level Security (RLS) policies for data isolation
- Database triggers for automatic speed to lead calculation
- RPC function for dashboard summaries

## Webhook Configuration

### CRM Webhooks

Configure your CRM to send POST requests to:
```
POST https://your-domain.com/api/leads/webhook
Authorization: Bearer YOUR_WEBHOOK_SECRET_KEY
```

Payload:
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "crmId": "crm_lead_123"
}
```

### Stripe Webhooks

Configure Stripe webhook endpoint:
```
https://your-supabase-project.supabase.co/functions/v1/stripe-webhook
```

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Development

```bash
# Run development server
npm run dev

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Lint code
npm run lint

# Build for production
npm run build
```

## Deployment

### Vercel (Frontend)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase (Backend)

1. Deploy Edge Functions:
   ```bash
   supabase functions deploy trigger-ai-caller
   supabase functions deploy stripe-webhook
   ```

2. Run migrations via Supabase dashboard or CLI

3. Configure webhook endpoints in Stripe dashboard

## Security Considerations

- API keys are encrypted before storage
- Row Level Security ensures multi-tenant data isolation
- Webhook endpoints are protected with secret keys
- Supabase Auth handles authentication securely
- Environment variables should never be committed

## License

MIT
