# Self-Service Sales Process Guide

## Overview

This guide covers the complete self-service sales infrastructure for Jungle, designed to enable customers to discover, sign up, integrate, and use the product with minimal human intervention.

## Components

### 1. Interactive Demo (`/demo`)

**Purpose**: Let prospects experience the product without signing up

**Features**:
- Default and custom scenario options
- Configurable speed-to-lead threshold
- Real-time simulation of lead processing
- Visual dashboard showing lead status
- Clear CTAs to signup after demo

**Implementation**:
- Component: `components/demo/InteractiveDemo.tsx`
- Route: `/app/demo/page.tsx`
- Uses: React state for simulation, no backend required

**Usage**:
1. User visits `/demo`
2. Chooses scenario (default or custom)
3. Sets speed-to-lead threshold
4. Starts demo
5. Sees simulated lead processing
6. Gets CTA to signup

### 2. AI-Powered Chatbot

**Purpose**: Qualify leads, answer FAQs, guide to signup

**Features**:
- FAQ responses (CRM integrations, pricing, how it works)
- Lead qualification (CRM type, challenges)
- Auto-suggests signup for high-fit leads
- Directs to relevant knowledge base articles
- Available on all pages (floating button)

**Implementation**:
- Component: `components/chatbot/AIChatbot.tsx`
- Integrated in: `app/layout.tsx` (site-wide)
- Backend: Can integrate with OpenAI API or custom endpoint

**Qualification Logic**:
- Asks about CRM usage
- Identifies challenges
- Categorizes as high/medium/low fit
- Suggests signup for high-fit leads

### 3. Enhanced Onboarding Wizard

**Purpose**: Guide users through setup with test lead functionality

**Features**:
- CRM connection (GoHighLevel, Close, etc.)
- Retell AI API key setup
- Speed-to-lead threshold configuration
- **Test lead functionality** - Send test lead to verify setup
- Direct link to dashboard after test

**Implementation**:
- Component: `components/onboarding/OnboardingWizard.tsx`
- Test Lead: `components/onboarding/TestLeadButton.tsx`
- API: `app/api/leads/test/route.ts`

**Flow**:
1. User signs up
2. Redirected to onboarding
3. Connects CRM
4. Connects Retell AI
5. Sets threshold
6. Sends test lead
7. Sees lead in dashboard
8. Setup complete

### 4. One-Click Upgrade

**Purpose**: Make it easy to upgrade from dashboard

**Features**:
- Shows available upgrade plans
- One-click upgrade button
- Stripe integration for instant upgrade
- Clear value propositions
- Prorated billing

**Implementation**:
- Component: `components/upgrade/OneClickUpgrade.tsx`
- API: `app/api/upgrade/route.ts`
- Integration: Stripe subscription update

**Usage**:
1. User views upgrade component in dashboard
2. Sees available plans with features
3. Clicks "Upgrade Now"
4. Stripe handles payment
5. Plan updated immediately

### 5. In-App Guidance

**Purpose**: Help users understand features without leaving the app

**Features**:
- Contextual tooltips
- Guided tours
- Links to knowledge base
- Help button (floating)
- Dismissible tooltips

**Implementation**:
- Component: `components/guidance/InAppGuidance.tsx`
- Tooltips: Configurable via props
- KB Links: Direct links to Notion articles

**Tooltip System**:
- Shows tooltips for key features
- Sequential display (one at a time)
- Dismissible with "Got it" or "Skip"
- Links to relevant KB articles

## User Journey

### Discovery → Signup → Setup → Usage

1. **Discovery**
   - Lands on homepage
   - Sees "Try Interactive Demo" CTA
   - Tries demo, sees value
   - OR chats with AI bot
   - Bot qualifies and suggests signup

2. **Signup**
   - Clicks "Start Free Trial"
   - Supabase Auth handles signup
   - No credit card required
   - Instant account creation

3. **Onboarding**
   - Redirected to onboarding wizard
   - Step 1: Connect CRM
   - Step 2: Connect Retell AI
   - Step 3: Set speed-to-lead threshold
   - Step 4: Send test lead
   - Sees test lead in dashboard
   - Setup complete!

4. **Usage**
   - Dashboard with real leads
   - In-app guidance for features
   - One-click upgrade available
   - Chatbot for support
   - Knowledge base links

## Support Channels

### Self-Service (Primary)
1. **AI Chatbot**: Answers FAQs, qualifies leads
2. **Knowledge Base**: Comprehensive Notion KB
3. **In-App Guidance**: Tooltips and tours
4. **Interactive Demo**: See product in action

### Human Support (Fallback)
1. **Email**: support@jungle.app
2. **In-App Chat**: Human fallback in chatbot
3. **Help Button**: Direct access to support

## Best Practices

### Onboarding
- ✅ Keep it simple (3-4 steps max)
- ✅ Show progress indicator
- ✅ Allow skipping steps
- ✅ Test lead to verify setup
- ✅ Clear success messages

### Chatbot
- ✅ Answer common questions immediately
- ✅ Qualify leads naturally
- ✅ Suggest signup for high-fit
- ✅ Link to relevant KB articles
- ✅ Human fallback available

### Upgrades
- ✅ Show value clearly
- ✅ One-click process
- ✅ Transparent pricing
- ✅ Prorated billing
- ✅ Instant activation

### Guidance
- ✅ Contextual (show when relevant)
- ✅ Dismissible
- ✅ Link to detailed docs
- ✅ Don't overwhelm
- ✅ Progressive disclosure

## Metrics to Track

### Self-Service Metrics
- Demo completion rate
- Chatbot engagement rate
- Onboarding completion rate
- Test lead success rate
- Upgrade conversion rate
- Tooltip engagement

### Support Metrics
- Chatbot resolution rate
- KB article views
- Support ticket volume
- Time to first value
- Churn rate by onboarding completion

## Common Pitfalls to Avoid

1. **Complicated Onboarding**
   - ❌ Too many steps
   - ❌ Unclear instructions
   - ❌ No verification step
   - ✅ Simple, clear, testable

2. **Hidden Pricing**
   - ❌ Surprise charges
   - ❌ Unclear feature limits
   - ✅ Transparent pricing
   - ✅ Clear feature comparison

3. **No Support Fallback**
   - ❌ Only automated support
   - ❌ Hard to find help
   - ✅ Multiple support channels
   - ✅ Easy to contact humans

4. **Ignoring Feedback**
   - ❌ Not tracking user behavior
   - ❌ Not iterating on friction
   - ✅ Analytics tracking
   - ✅ Regular user surveys
   - ✅ Continuous improvement

## Next Steps

1. ✅ Interactive demo built
2. ✅ AI chatbot implemented
3. ✅ Onboarding enhanced with test lead
4. ✅ One-click upgrade added
5. ✅ In-app guidance system created
6. 📝 Integrate with OpenAI API for chatbot
7. 📝 Add analytics tracking
8. 📝 Create user surveys
9. 📝 A/B test onboarding flow
10. 📝 Monitor and iterate

