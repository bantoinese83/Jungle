# 🌴 Jungle - Speed to Lead AI Calling Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-3.0-green?style=for-the-badge&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-19.3-635BFF?style=for-the-badge&logo=stripe)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**Automatically call leads within minutes using AI. Never miss a lead again.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [Security](#-security)
- [API Documentation](#-api-documentation)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

Jungle is a modern, multi-tenant SaaS platform that automatically calls leads within minutes using AI-powered automation. Built for sales teams and agencies, Jungle integrates seamlessly with popular CRMs (GoHighLevel, Close, HubSpot) and uses Retell AI for intelligent, automated lead qualification.

### Key Value Propositions

- ⚡ **Speed to Lead**: Automatically call leads within 5 minutes (configurable)
- 🤖 **AI-Powered**: Uses Retell AI for natural, intelligent conversations
- 🔗 **CRM Integration**: Seamless integration with major CRMs via webhooks
- 📊 **Real-Time Dashboard**: Track leads, calls, and performance metrics
- 💳 **Flexible Pricing**: Starter, Professional, and Enterprise plans
- 🔒 **Secure**: Enterprise-grade security with Row Level Security (RLS)

---

## ✨ Features

### Core Features

- **Multi-Tenant Architecture**: Complete data isolation per organization
- **Automated Lead Calling**: AI triggers calls when speed-to-lead threshold is exceeded
- **CRM Webhooks**: Receive leads from GoHighLevel, Close, HubSpot, and more
- **Real-Time Dashboard**: Live updates using Supabase Realtime
- **Analytics Dashboard**: Track conversions, funnels, and user behavior
- **Self-Service Onboarding**: Streamlined setup wizard for new customers
- **Stripe Integration**: Subscription management and billing automation
- **Test Lead Generation**: Test the system with sample leads during onboarding

### Developer Features

- **TypeScript**: Full type safety across the application
- **Prisma ORM**: Type-safe database access with migrations
- **Vitest**: Fast unit and integration testing
- **ESLint + Prettier**: Code quality and formatting
- **Security Headers**: Comprehensive security configuration
- **Health Check Endpoint**: `/api/health` for monitoring
- **Environment Validation**: Startup validation for required variables

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icon library

### Backend
- **Supabase** - PostgreSQL database, authentication, Edge Functions, Realtime
- **Prisma** - ORM and database migrations
- **Stripe** - Payment processing and subscriptions
- **Retell AI** - AI-powered voice calling
- **OpenAI** - Chatbot intelligence

### DevOps & Tools
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **ESLint** - Linting
- **Vercel** - Deployment platform (recommended)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up](https://supabase.com))
- **Stripe Account** ([Sign up](https://stripe.com)) (for payments)
- **Retell AI Account** ([Sign up](https://retellai.com)) (for AI calling)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/bantoinese83/Jungle.git
cd Jungle
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#-environment-variables) for detailed configuration.

### 4. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Connection (with connection pooling)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require

# Encryption (must be at least 32 characters)
ENCRYPTION_KEY=your_32_character_encryption_key_minimum

# Webhook Security
WEBHOOK_SECRET_KEY=your_webhook_secret_key_minimum_16_chars

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRICE_PROFESSIONAL=price_your_professional_price_id
STRIPE_PRICE_ENTERPRISE=price_your_enterprise_price_id

# Cron Jobs
CRON_SECRET=your_cron_secret_key
```

### Optional Variables

```env
# OpenAI (for chatbot)
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generating Secure Keys

```bash
# Generate encryption key (32+ characters)
openssl rand -base64 32

# Generate webhook secret (16+ characters)
openssl rand -base64 16

# Generate cron secret
openssl rand -base64 24
```

---

## 🗄 Database Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init
```

### 3. Apply Supabase Migrations

Apply the SQL migrations in order:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually via Supabase Dashboard SQL Editor:
# 1. 000_initial_schema.sql
# 2. 001_rls_policies.sql
# 3. 002_dashboard_summary_rpc.sql
# 4. 003_lead_trigger.sql
# 5. 004_system_alerts.sql
# 6. 005_analytics_events.sql
# 7. 006_fix_function_security.sql
# 8. 007_add_missing_indexes.sql
# 9. 008_add_database_constraints.sql
```

### 4. Verify Database Connection

```bash
# Test Prisma connection
npx prisma db pull

# Open Prisma Studio (optional)
npx prisma studio
```

---

## 💻 Development

### Project Structure

```
jungle/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── analytics/         # Analytics dashboard
│   ├── dashboard/         # Main dashboard
│   ├── onboarding/        # Onboarding wizard
│   └── ...
├── components/            # React components
│   ├── analytics/         # Analytics components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── layout/             # Layout components
│   └── ...
├── lib/                    # Utility libraries
│   ├── analytics.ts       # Analytics tracking
│   ├── encryption.ts      # Encryption utilities
│   ├── prisma.ts          # Prisma client
│   └── ...
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Migration history
├── supabase/               # Supabase configuration
│   ├── functions/         # Edge Functions
│   └── migrations/        # SQL migrations
├── tests/                  # Test files
└── marketing/              # Marketing documentation
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:ui      # Run tests with UI

# Database
npx prisma generate  # Generate Prisma Client
npx prisma migrate   # Run migrations
npx prisma studio    # Open Prisma Studio
npx prisma db pull   # Pull schema from database
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following TypeScript strict mode
   - Add tests for new features
   - Update documentation as needed

3. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **TypeScript**: Use strict mode, avoid `any` types
- **Components**: Use functional components with TypeScript
- **Naming**: Use descriptive names, follow camelCase for variables
- **Comments**: Add comments for complex logic, not obvious code
- **Error Handling**: Always handle errors gracefully
- **Accessibility**: Include ARIA labels and semantic HTML

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Coverage

Current test coverage: **90.9%**

- ✅ API Routes: Webhooks, integrations, organization settings
- ✅ Components: Login form, dashboard, analytics
- ✅ Utilities: Encryption, analytics tracking
- ✅ Integration: End-to-end lead flow

### Writing Tests

Tests are located in the `tests/` directory:

```typescript
// Example test structure
import { describe, it, expect } from 'vitest'

describe('Feature Name', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Use Vercel's environment variable management

3. **Deploy**
   - Vercel will automatically deploy on push to `main`
   - Preview deployments for pull requests

### Environment-Specific Configuration

```env
# Production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Staging
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
NODE_ENV=production
```

### Database Migrations in Production

```bash
# Apply migrations to production database
npx prisma migrate deploy

# Or use Supabase CLI
supabase db push --db-url $PRODUCTION_DATABASE_URL
```

### Health Checks

The application includes a health check endpoint:

```
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T...",
  "checks": {
    "database": "ok"
  }
}
```

---

## 🏗 Architecture

### Multi-Tenant Architecture

Jungle uses a **shared database, isolated schema** approach:

- Each organization has a unique `organizationId`
- Row Level Security (RLS) policies enforce data isolation
- All queries filter by `organizationId`
- Users belong to a single organization

### Data Flow

```
CRM Webhook → API Route → Database → Trigger → Edge Function → Retell AI
                                                              ↓
                                                         Lead Called
```

### Key Components

1. **Frontend (Next.js)**
   - Server-side rendering for SEO
   - Client-side interactivity with React
   - API routes for backend logic

2. **Backend (Supabase)**
   - PostgreSQL database with RLS
   - Edge Functions for serverless logic
   - Realtime subscriptions for live updates

3. **External Services**
   - Stripe for payments
   - Retell AI for voice calls
   - OpenAI for chatbot

---

## 🔒 Security

### Security Features

- ✅ **Row Level Security (RLS)**: Database-level access control
- ✅ **Encryption**: API keys encrypted at rest
- ✅ **Timing-Safe Comparisons**: Prevents timing attacks
- ✅ **Security Headers**: HSTS, XSS protection, frame options
- ✅ **Input Validation**: Zod schemas for all inputs
- ✅ **Environment Validation**: Startup checks for required variables

### Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use HTTPS** - Always in production
3. **Validate inputs** - Use Zod schemas
4. **Rate limiting** - Implement for production (TODO)
5. **Regular updates** - Keep dependencies updated

See [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) for detailed security information.

---

## 📚 API Documentation

### Authentication

All API routes (except public endpoints) require authentication via Supabase session.

### Key Endpoints

#### Leads

```http
POST /api/leads/webhook
Content-Type: application/json
Authorization: Bearer {WEBHOOK_SECRET_KEY}

{
  "organizationId": "uuid",
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "crmId": "optional-crm-id"
}
```

#### Integrations

```http
POST /api/integrations/retell
Content-Type: application/json

{
  "apiKey": "retell-api-key"
}
```

#### Analytics

```http
GET /api/analytics/metrics?startDate=2025-01-01&endDate=2025-01-31
GET /api/analytics/events?event=demo_started&limit=100
```

See individual route files in `app/api/` for detailed documentation.

---

## 🗺 Roadmap

See [ROADMAP_STATUS.md](./ROADMAP_STATUS.md) for detailed roadmap progress.

### Completed ✅

- [x] Core application architecture
- [x] Multi-tenant setup with RLS
- [x] Stripe integration
- [x] Retell AI integration
- [x] Analytics dashboard
- [x] Security fixes and hardening
- [x] Test suite (90%+ coverage)

### In Progress 🚧

- [ ] Rate limiting implementation
- [ ] CSRF protection
- [ ] Retell AI decryption in Edge Functions

### Planned 📋

- [ ] Additional CRM integrations
- [ ] Advanced analytics features
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Webhook retry mechanism

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** for new features
5. **Run tests and linting** (`npm run test && npm run lint`)
6. **Commit your changes** (follow [Conventional Commits](https://www.conventionalcommits.org/))
7. **Push to your branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Documentation**: Check the `/docs` folder and markdown files
- **Issues**: [GitHub Issues](https://github.com/bantoinese83/Jungle/issues)
- **Email**: support@jungle.app

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Stripe](https://stripe.com/) - Payment processing
- [Retell AI](https://retellai.com/) - AI voice calling
- [Prisma](https://www.prisma.io/) - Database toolkit

---

<div align="center">

**Built with ❤️ for sales teams who never want to miss a lead**

[⭐ Star us on GitHub](https://github.com/bantoinese83/Jungle) • [📖 Read the Docs](./docs) • [🐛 Report a Bug](https://github.com/bantoinese83/Jungle/issues)

</div>
