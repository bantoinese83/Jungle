# Automation Infrastructure

## Overview

Complete automation system for solo founder efficiency, handling onboarding, support, billing, and monitoring.

## What's Included

### ✅ Edge Functions (Deployed)

1. **`onboarding-automation`** - Triggers welcome emails and notifications when new organizations are created
2. **`retell-failure-alert`** - Sends immediate alerts (Slack/SMS) when Retell AI calls fail
3. **`billing-reconciliation`** - Daily cron job to sync usage with Stripe metering

### ✅ Updated Functions

1. **`stripe-webhook`** - Enhanced with payment failure handling and billing automation triggers
2. **`trigger-ai-caller`** - Now triggers failure alerts on Retell API errors

### ✅ API Routes

1. **`/api/cron/billing-reconciliation`** - Cron endpoint for usage reconciliation

### ✅ Database

1. **`system_alerts`** table - Tracks all automation events and failures

## Quick Start

1. **Set Environment Variables** (see `SETUP_GUIDE.md`)
2. **Configure Make.com/Zapier** webhooks
3. **Set up Slack** notifications
4. **Create Notion KB** (see `NOTION_KB_STRUCTURE.md`)
5. **Test automation flows**

## Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[NOTION_KB_STRUCTURE.md](./NOTION_KB_STRUCTURE.md)** - Knowledge base organization

## Automation Flows

### 1. New Tenant Onboarding
```
User Signs Up → Organization Created → Onboarding Automation Triggered
  → Welcome Email Sent (Make.com)
  → Slack Notification Posted
  → User Redirected to Onboarding
```

### 2. Retell AI Failure Alert
```
Retell API Call Fails → Failure Alert Triggered
  → Slack Alert Sent (#alerts)
  → SMS Alert Sent (optional)
  → Alert Logged to Database
  → Lead Status Updated
```

### 3. Payment Failure Handling
```
Stripe Payment Fails → Webhook Triggered
  → Organization Status → 'past_due'
  → Billing Automation Triggered (Make.com)
  → Email Reminders Sent (Day 1, 3, 7)
  → Auto-downgrade After 14 Days
```

### 4. Usage Reconciliation
```
Daily Cron (2 AM) → Billing Reconciliation Runs
  → Query All Active Organizations
  → Count AI Calls Made
  → Update Stripe Metering
  → Log Results
```

## Next Steps

1. Configure webhook URLs in environment variables
2. Set up Make.com/Zapier workflows
3. Create Notion knowledge base
4. Test each automation flow
5. Monitor and iterate

## Support

For issues or questions about automation:
- Check `SETUP_GUIDE.md` for detailed instructions
- Review Edge Function logs in Supabase
- Check Make.com/Zapier execution history
- Monitor `system_alerts` table

