# Automation Setup Guide

## Overview

This guide covers setting up all automation workflows for the Jungle SaaS application, designed for solo founder efficiency.

## 1. New Tenant Onboarding & Provisioning

### Trigger
- **Event**: New `Organization` created (via Stripe `checkout.session.completed` or user signup)
- **Location**: `app/api/auth/callback/route.ts` (on new user creation)

### Automation Flow
1. **Welcome Email Series** (Make.com/Zapier)
   - Trigger: Webhook from `onboarding-automation` Edge Function
   - Actions:
     - Send welcome email with setup instructions
     - Include links to:
       - CRM integration guide (Notion KB)
       - Retell AI setup guide (Notion KB)
       - Dashboard access
     - Schedule follow-up emails (Day 1, Day 3, Day 7)

2. **Internal Notification** (Slack)
   - Trigger: Same webhook
   - Action: Post to #new-customers channel with org details

### Setup Steps

#### Make.com/Zapier Webhook
1. Create new scenario/automation
2. Add webhook trigger
3. Copy webhook URL to `.env`: `MAKE_WEBHOOK_URL` or `ZAPIER_WEBHOOK_URL`
4. Configure email actions (SendGrid, Mailgun, etc.)
5. Add Slack notification action

#### Environment Variables
```env
MAKE_WEBHOOK_URL=https://hook.make.com/your-webhook-id
# OR
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-id
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
APP_URL=https://your-domain.com
NOTION_KB_URL=https://your-notion.so/knowledge-base
```

## 2. Automated Customer Support Ticket Triage

### Setup with Lindy/Tidio

#### Lindy Setup
1. Create Lindy account
2. Connect email inbox (support@jungle.app)
3. Configure AI agent with:
   - Knowledge base: Notion KB URL
   - Categories: Integration Issues, Billing, AI Caller Failures, General
   - Escalation rules: Complex issues → your email

#### Tidio Setup
1. Install Tidio on your site
2. Configure AI chatbot with:
   - Knowledge base integration (Notion)
   - Auto-responses for common queries
   - Escalation to human when needed

### Support Categories
- **Integration Issues**: GoHighLevel, Retell AI setup problems
- **Billing Queries**: Payment failures, subscription changes
- **AI Caller Failures**: Retell API errors, call failures
- **General**: Feature requests, account questions

## 3. Retell AI Caller Failure Alerts

### Trigger
- **Event**: Retell AI API call fails in `trigger-ai-caller` Edge Function
- **Location**: `supabase/functions/trigger-ai-caller/index.ts`

### Alert Flow
1. **Immediate Slack Alert**
   - Critical failures sent to #alerts channel
   - Includes: Lead details, error message, organization info

2. **SMS Alert** (Optional)
   - For critical failures only
   - Via Twilio or similar service

3. **Database Logging**
   - All failures logged to `system_alerts` table
   - For tracking and analysis

### Setup Steps

1. **Create Slack Webhook**
   ```bash
   # Go to https://api.slack.com/apps
   # Create new app → Incoming Webhooks
   # Copy webhook URL
   ```

2. **Set Environment Variables**
   ```env
   SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/ALERT/WEBHOOK
   SMS_WEBHOOK_URL=https://your-sms-service.com/webhook  # Optional
   FOUNDER_PHONE=+1234567890  # Your phone for SMS alerts
   ```

3. **Deploy Edge Function**
   ```bash
   supabase functions deploy retell-failure-alert
   ```

## 4. Automated Billing & Subscription Management

### Stripe Webhook Events Handled

#### `invoice.payment_failed`
- **Action**: Update org status to `past_due`
- **Automation**: Trigger Make.com/Zapier webhook for:
  - Email reminder (Day 1)
  - Email reminder (Day 3)
  - Final notice (Day 7)
  - Auto-downgrade/cancel (Day 14)

#### `invoice.payment_succeeded`
- **Action**: Restore `active` status
- **Automation**: Send payment confirmation email

#### `customer.subscription.updated`
- **Action**: Update subscription status in database

### Setup Steps

1. **Configure Stripe Webhook**
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`

2. **Create Billing Automation** (Make.com/Zapier)
   - Trigger: Webhook from Stripe webhook handler
   - Actions:
     - Send email reminders
     - Update customer records
     - Track payment attempts

3. **Environment Variables**
   ```env
   BILLING_AUTOMATION_WEBHOOK_URL=https://hook.make.com/billing-webhook
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 5. Usage-Based Billing Reconciliation

### Cron Job Setup

#### Option 1: Vercel Cron Jobs (Recommended)
Already configured in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/billing-reconciliation",
    "schedule": "0 2 * * *"  // Daily at 2 AM
  }]
}
```

#### Option 2: External Scheduler
- Use cron-job.org or similar
- Call: `GET https://your-domain.com/api/cron/billing-reconciliation`
- Include header: `Authorization: Bearer ${CRON_SECRET}`

### Reconciliation Process
1. Query all active organizations
2. Count AI calls made (from `leads` table)
3. Update Stripe metering for usage-based billing
4. Log reconciliation results

### Setup Steps

1. **Set Environment Variables**
   ```env
   CRON_SECRET=your-secret-key-here
   STRIPE_METERING_WEBHOOK_URL=https://api.stripe.com/v1/billing/meters/...
   STRIPE_AI_CALLS_METER_ID=your-meter-id
   ```

2. **Create Stripe Billing Meter**
   ```bash
   # In Stripe Dashboard → Billing → Meters
   # Create meter for "AI Calls"
   # Copy meter ID to STRIPE_AI_CALLS_METER_ID
   ```

3. **Deploy Edge Function**
   ```bash
   supabase functions deploy billing-reconciliation
   ```

## 6. Knowledge Base Structure (Notion)

### Recommended Structure

```
Jungle Knowledge Base
├── Getting Started
│   ├── Account Setup
│   ├── First Steps
│   └── Quick Start Guide
├── CRM Integrations
│   ├── GoHighLevel Setup
│   ├── Close CRM Setup
│   ├── HubSpot Setup
│   └── Webhook Configuration
├── AI Calling
│   ├── Retell AI Setup
│   ├── Agent Configuration
│   ├── Call Quality Tips
│   └── Troubleshooting
├── Dashboard & Analytics
│   ├── Understanding Metrics
│   ├── Speed to Lead Explained
│   └── Reports & Exports
├── Billing & Subscriptions
│   ├── Pricing Plans
│   ├── Payment Methods
│   ├── Usage-Based Billing
│   └── Subscription Management
└── Troubleshooting
    ├── Common Issues
    ├── Error Messages
    ├── Integration Problems
    └── Contact Support
```

### Notion AI Features

1. **Query Assistant**
   - "How do I connect GoHighLevel?"
   - "What does speed to lead mean?"
   - "Why did my AI call fail?"

2. **Content Summarization**
   - Auto-summarize long articles
   - Extract key points from support tickets

3. **Content Drafting**
   - Generate FAQ answers
   - Create setup guides from templates

### Integration with Support

- **Lindy/Tidio**: Connect to Notion KB for auto-responses
- **Make.com**: Sync support tickets to Notion for tracking
- **Slack**: Notion updates posted to #support channel

## Environment Variables Summary

Add these to your `.env` and Supabase secrets:

```env
# Automation Webhooks
MAKE_WEBHOOK_URL=https://hook.make.com/...
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/...
BILLING_AUTOMATION_WEBHOOK_URL=https://hook.make.com/billing

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/alerts
SMS_WEBHOOK_URL=https://your-sms-service.com/webhook
FOUNDER_PHONE=+1234567890

# Cron Jobs
CRON_SECRET=your-secret-key

# Stripe Billing
STRIPE_METERING_WEBHOOK_URL=https://api.stripe.com/...
STRIPE_AI_CALLS_METER_ID=meter_...

# App URLs
APP_URL=https://your-domain.com
NOTION_KB_URL=https://your-notion.so/kb
```

## Deployment Checklist

- [ ] Deploy `onboarding-automation` Edge Function
- [ ] Deploy `retell-failure-alert` Edge Function
- [ ] Deploy `billing-reconciliation` Edge Function
- [ ] Update `stripe-webhook` Edge Function
- [ ] Update `trigger-ai-caller` Edge Function
- [ ] Set up Make.com/Zapier workflows
- [ ] Configure Slack webhooks
- [ ] Set up Notion knowledge base
- [ ] Configure Vercel cron jobs
- [ ] Test all automation flows
- [ ] Document webhook endpoints

## Testing Automation

1. **Test Onboarding**: Create new user → verify emails sent
2. **Test Failure Alert**: Trigger Retell error → verify Slack/SMS
3. **Test Billing**: Simulate payment failure → verify emails
4. **Test Reconciliation**: Run cron manually → verify Stripe update

## Monitoring

- Check Make.com/Zapier execution logs
- Monitor Slack #alerts channel
- Review `system_alerts` table
- Track Stripe webhook deliveries
- Monitor cron job executions in Vercel

