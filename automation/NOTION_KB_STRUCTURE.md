# Notion Knowledge Base Structure

## Recommended Organization

Create this structure in your Notion workspace to serve as the foundation for automated support and customer onboarding.

## Main Structure

```
📚 Jungle Knowledge Base
│
├── 🚀 Getting Started
│   ├── Welcome to Jungle
│   ├── Account Setup Guide
│   ├── First Steps After Signup
│   └── Quick Start (5-minute setup)
│
├── 🔗 CRM Integrations
│   ├── Overview
│   ├── GoHighLevel Setup
│   │   ├── Step 1: Get API Key
│   │   ├── Step 2: Connect to Jungle
│   │   ├── Step 3: Configure Webhooks
│   │   └── Troubleshooting
│   ├── Close CRM Setup
│   │   ├── Authentication
│   │   ├── Webhook Configuration
│   │   └── Common Issues
│   ├── HubSpot Setup
│   ├── Salesforce Setup
│   └── Webhook Configuration Guide
│
├── 🤖 AI Calling
│   ├── Retell AI Overview
│   ├── Retell AI Setup
│   │   ├── Getting Your API Key
│   │   ├── Connecting to Jungle
│   │   ├── Agent Configuration
│   │   └── Testing Your Setup
│   ├── Call Quality Best Practices
│   ├── Agent Customization
│   └── Troubleshooting AI Calls
│
├── 📊 Dashboard & Analytics
│   ├── Understanding Your Dashboard
│   ├── Speed to Lead Explained
│   │   ├── What is Speed to Lead?
│   │   ├── How It's Calculated
│   │   └── Improving Your Metrics
│   ├── Lead Statuses
│   ├── Reports & Exports
│   └── Understanding Metrics
│
├── 💳 Billing & Subscriptions
│   ├── Pricing Plans
│   │   ├── Starter Plan
│   │   ├── Professional Plan
│   │   └── Enterprise Plan
│   ├── Payment Methods
│   ├── Usage-Based Billing
│   │   ├── How AI Calls are Billed
│   │   ├── Understanding Your Invoice
│   │   └── Billing Reconciliation
│   ├── Subscription Management
│   │   ├── Upgrading Your Plan
│   │   ├── Downgrading Your Plan
│   │   └── Canceling Your Subscription
│   └── Payment Issues
│       ├── Payment Failed
│       ├── Update Payment Method
│       └── Refund Requests
│
└── 🔧 Troubleshooting
    ├── Common Issues
    │   ├── Leads Not Appearing
    │   ├── AI Calls Not Triggering
    │   ├── Integration Connection Issues
    │   └── Dashboard Not Loading
    ├── Error Messages
    │   ├── "Organization not found"
    │   ├── "Retell API Error"
    │   ├── "Webhook validation failed"
    │   └── "Payment processing error"
    ├── Integration Problems
    │   ├── CRM Not Syncing
    │   ├── Webhook Not Receiving Data
    │   └── API Key Issues
    └── Contact Support
        ├── When to Contact Support
        ├── How to Report Issues
        └── Support Response Times
```

## Page Templates

### Setup Guide Template

**Title**: [Integration Name] Setup Guide

**Content Structure**:
1. **Overview** (What this integration does)
2. **Prerequisites** (What you need before starting)
3. **Step-by-Step Instructions**
   - Step 1: [Action]
   - Step 2: [Action]
   - Step 3: [Action]
4. **Verification** (How to confirm it's working)
5. **Troubleshooting** (Common issues and solutions)
6. **Next Steps** (What to do after setup)

### FAQ Template

**Title**: [Topic] FAQ

**Content Structure**:
- Q: [Question]
  A: [Answer with links to relevant guides]

- Q: [Question]
  A: [Answer]

### Troubleshooting Template

**Title**: [Issue Name] Troubleshooting

**Content Structure**:
1. **Symptoms** (What you're experiencing)
2. **Possible Causes**
3. **Solutions** (Step-by-step fixes)
4. **Still Not Working?** (Escalation path)

## Notion AI Prompts

### For Query Assistant

Train Notion AI with these example queries:

1. **Setup Queries**:
   - "How do I connect GoHighLevel to Jungle?"
   - "What are the steps to set up Retell AI?"
   - "How do I configure webhooks for my CRM?"

2. **Conceptual Queries**:
   - "What is speed to lead and how is it calculated?"
   - "How does the AI calling system work?"
   - "What's the difference between the pricing plans?"

3. **Troubleshooting Queries**:
   - "Why aren't my leads appearing in the dashboard?"
   - "My AI calls aren't triggering, what should I check?"
   - "I'm getting a webhook error, how do I fix it?"

### For Content Generation

Use Notion AI to:

1. **Summarize Support Tickets**:
   - "Summarize the common issues users face when setting up GoHighLevel"
   - "What are the top 5 integration problems?"

2. **Draft Responses**:
   - "Draft a response explaining how speed to lead is calculated"
   - "Create a troubleshooting guide for Retell AI connection issues"

3. **Update Documentation**:
   - "Update the Retell AI setup guide with the new API changes"
   - "Add a section about webhook retry logic"

## Integration with Support Systems

### Lindy AI Configuration

1. **Connect Notion KB**:
   - Add Notion integration in Lindy
   - Point to your Knowledge Base URL
   - Configure search scope

2. **Categorization Rules**:
   - Integration Issues → Search "CRM Integrations" section
   - Billing Questions → Search "Billing & Subscriptions"
   - AI Call Problems → Search "AI Calling" section
   - General Questions → Search entire KB

3. **Response Templates**:
   - Use Notion AI to generate responses
   - Include links to relevant KB pages
   - Escalate complex issues with context

### Tidio Chatbot Configuration

1. **Knowledge Base Integration**:
   - Connect Notion KB to Tidio
   - Enable AI-powered responses
   - Set confidence thresholds

2. **Auto-Responses**:
   - Common questions → Direct KB links
   - Complex queries → AI-generated answers from KB
   - Unanswered → Escalate to human

## Maintenance Guidelines

### Weekly
- Review support tickets for new common issues
- Update FAQ based on recent questions
- Check for outdated information

### Monthly
- Audit all setup guides for accuracy
- Update screenshots if UI changed
- Add new troubleshooting scenarios

### Quarterly
- Comprehensive KB review
- Remove outdated content
- Restructure if needed
- Update Notion AI training data

## Best Practices

1. **Keep It Simple**: Use clear, concise language
2. **Use Visuals**: Screenshots, diagrams, videos where helpful
3. **Link Everything**: Cross-reference related pages
4. **Update Regularly**: Keep content current with product changes
5. **Test Queries**: Regularly test Notion AI responses
6. **Gather Feedback**: Ask users what's missing or unclear

## Example Pages

### Speed to Lead Explained

**Content**:
```
# Speed to Lead Explained

Speed to Lead is the time between when a lead is received in your CRM and when they receive their first contact (either from a human or AI).

## How It's Calculated

Speed to Lead = Time of First Contact - Time Lead Received

For example:
- Lead received: 2:00 PM
- First call made: 2:05 PM
- Speed to Lead: 5 minutes

## Why It Matters

Studies show that contacting leads within 5 minutes increases conversion rates by 10x compared to waiting 30 minutes.

## How Jungle Helps

Jungle automatically calls leads when your threshold is exceeded, ensuring you never miss a lead again.

[Link to: Setting Your Speed to Lead Threshold]
[Link to: Understanding Your Dashboard]
```

### GoHighLevel Setup

**Content**:
```
# GoHighLevel Integration Setup

Connect your GoHighLevel account to automatically trigger AI calls for new leads.

## Prerequisites

- Active GoHighLevel account
- Admin access to your GoHighLevel account
- Jungle account with active subscription

## Step 1: Get Your API Key

1. Log in to GoHighLevel
2. Go to Settings → Integrations → API
3. Click "Generate API Key"
4. Copy the key (you'll need it in Step 2)

## Step 2: Connect to Jungle

1. Log in to your Jungle dashboard
2. Go to Settings → Integrations
3. Click "Connect GoHighLevel"
4. Paste your API key
5. Click "Save"

## Step 3: Configure Webhooks

1. In GoHighLevel, go to Settings → Webhooks
2. Add new webhook:
   - URL: [Your Jungle webhook URL]
   - Events: New Contact Created
3. Save webhook

## Verification

1. Create a test contact in GoHighLevel
2. Check your Jungle dashboard
3. You should see the lead appear within seconds

## Troubleshooting

**Issue**: Leads not appearing
- Check webhook URL is correct
- Verify API key is valid
- Check GoHighLevel webhook logs

**Issue**: Webhook validation failed
- Ensure webhook secret is configured
- Check webhook URL format

[Link to: Webhook Configuration Guide]
[Link to: Troubleshooting Integration Issues]
```

## Automation Integration

### Make.com/Zapier Workflows

1. **New KB Article Published**:
   - Trigger: Notion page created/updated
   - Action: Post to Slack #documentation channel
   - Action: Update support system knowledge base

2. **Support Ticket Created**:
   - Trigger: New ticket in support system
   - Action: Search Notion KB for relevant articles
   - Action: Attach KB links to ticket

3. **Common Question Detected**:
   - Trigger: Same question asked 3+ times
   - Action: Create Notion AI task to draft FAQ entry
   - Action: Notify you to review and publish

