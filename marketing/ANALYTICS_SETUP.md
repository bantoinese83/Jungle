# Analytics Setup Guide

## Overview

Complete analytics tracking system for monitoring user behavior, conversions, and product usage.

## Tracked Events

### Demo Events
- `demo_started` - User starts interactive demo
- `demo_scenario_selected` - User selects demo scenario (default/custom)
- `demo_threshold_changed` - User changes speed-to-lead threshold
- `demo_completed` - Demo completes successfully
- `demo_reset` - User resets demo
- `demo_cta_clicked` - User clicks CTA after demo (signup/pricing)

### Chatbot Events
- `chatbot_opened` - User opens chatbot
- `chatbot_closed` - User closes chatbot
- `chatbot_message_sent` - User sends message
- `chatbot_response_received` - Bot responds
- `chatbot_high_fit_lead` - High-fit lead identified
- `chatbot_cta_clicked` - User clicks signup from chatbot
- `chatbot_error` - Error in chatbot

### Onboarding Events
- `onboarding_started` - User starts onboarding
- `onboarding_step_started` - User starts a step
- `onboarding_step_completed` - User completes a step
- `onboarding_step_failed` - Step fails
- `onboarding_completed` - Full onboarding completed

### Test Lead Events
- `test_lead_sent` - User sends test lead
- `test_lead_success` - Test lead created successfully
- `test_lead_failed` - Test lead creation failed
- `test_lead_error` - Error sending test lead

### Authentication Events
- `login_attempt` - User attempts login
- `login_success` - Login successful
- `login_failed` - Login failed
- `login_oauth_initiated` - OAuth login started
- `login_error` - Login error

## Analytics Providers

### Google Analytics 4

**Setup**:
1. Create GA4 property
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to `.env`:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

**Features**:
- Automatic page view tracking
- Custom event tracking
- User properties
- Conversion tracking

### PostHog (Optional)

**Setup**:
1. Create PostHog account
2. Get API key
3. Add to `.env`:
   ```env
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
   ```

**Features**:
- Session recordings
- Feature flags
- A/B testing
- User cohorts

### Custom Analytics Endpoint

**Setup**:
- Events are automatically sent to `/api/analytics`
- Can be extended to store in database
- Logs events for debugging

## Usage

### Track Events

```typescript
import { trackEvent } from '@/lib/analytics'

// Simple event
trackEvent('button_clicked')

// Event with properties
trackEvent('demo_started', {
  scenario: 'custom',
  speedToLeadThreshold: 5,
})
```

### Track Page Views

```typescript
import { trackPageView } from '@/lib/analytics'

trackPageView('/dashboard')
```

### Track Conversions

```typescript
import { trackConversion } from '@/lib/analytics'

trackConversion('signup', 99) // $99 value
```

## Key Metrics to Monitor

### Funnel Metrics
1. **Demo Completion Rate**: `demo_completed` / `demo_started`
2. **Onboarding Completion Rate**: `onboarding_completed` / `onboarding_started`
3. **Test Lead Success Rate**: `test_lead_success` / `test_lead_sent`
4. **Signup Conversion**: Signups from demo/chatbot

### Engagement Metrics
1. **Chatbot Engagement**: Messages per session
2. **Demo Engagement**: Time spent in demo
3. **Onboarding Drop-off**: Step where users drop off

### Product Metrics
1. **Feature Usage**: Which features are used most
2. **Error Rates**: Failed operations
3. **User Retention**: Daily/weekly active users

## Dashboard Queries

### Demo Funnel
```
demo_started → demo_completed → demo_cta_clicked → signup
```

### Onboarding Funnel
```
onboarding_started → step_1_completed → step_2_completed → step_3_completed → onboarding_completed
```

### Chatbot Funnel
```
chatbot_opened → chatbot_message_sent → chatbot_high_fit_lead → chatbot_cta_clicked → signup
```

## Environment Variables

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# PostHog (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx

# OpenAI (for chatbot)
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4o-mini
```

## Next Steps

1. ✅ Analytics tracking implemented
2. ✅ OpenAI chatbot integrated
3. 📝 Set up GA4 property
4. 📝 Configure conversion goals
5. 📝 Create analytics dashboard
6. 📝 Set up alerts for key metrics

