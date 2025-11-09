# Analytics Dashboard

## Overview

Complete analytics dashboard for tracking user behavior, conversion metrics, and product insights.

## Features

### Key Metrics Cards
- **Demo Conversion Rate**: Percentage of demos that complete
- **Onboarding Completion Rate**: Percentage of onboardings that finish
- **Chatbot Engagement**: Average messages per session
- **Signup Conversion Rate**: Percentage of signup attempts that succeed

### Conversion Funnel
Visual representation of the user journey:
1. Visitors → Demos Started
2. Demos → Signups
3. Signups → Onboardings Completed
4. Onboardings → Active Users

### Detailed Metrics Sections

#### Demo Metrics
- Demos started/completed
- Conversion rate
- Average speed-to-lead threshold

#### Chatbot Metrics
- Sessions opened
- Total messages
- Average messages per session
- High-fit leads identified
- CTA clicks

#### Onboarding Metrics
- Onboardings started/completed
- Completion rate
- Average steps completed
- Most common drop-off step

#### Test Lead Metrics
- Test leads sent
- Success rate
- Successful test leads

#### Signup Metrics
- Signup attempts
- Success rate
- Conversion rate

### Event Timeline
- Real-time event feed
- Filter by event type
- View event properties
- Pagination support

## Database Schema

### analytics_events Table
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  event TEXT NOT NULL,
  properties JSONB,
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

### Indexes
- Event + timestamp (for filtering)
- Timestamp DESC (for recent events)
- Session ID (for session analysis)
- User ID (for user tracking)
- Properties GIN (for property queries)

### RPC Functions
- `get_event_counts(start_date, end_date)`: Get event counts by type
- `get_funnel_metrics(start_date, end_date)`: Get funnel conversion metrics

## API Endpoints

### GET /api/analytics/metrics
Returns aggregated metrics for the dashboard.

**Query Parameters**:
- `startDate` (optional): Start date for metrics
- `endDate` (optional): End date for metrics

**Response**:
```json
{
  "metrics": {
    "demo": { ... },
    "chatbot": { ... },
    "onboarding": { ... },
    "testLead": { ... },
    "signup": { ... },
    "funnel": { ... }
  }
}
```

### GET /api/analytics/events
Returns analytics events with filtering.

**Query Parameters**:
- `event` (optional): Filter by event type
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `limit` (optional): Number of events (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "events": [...],
  "total": 1000,
  "limit": 100,
  "offset": 0
}
```

### POST /api/analytics
Stores analytics events in the database.

**Body**:
```json
{
  "event": "demo_started",
  "properties": { ... },
  "userId": "...",
  "sessionId": "...",
  "url": "...",
  "userAgent": "..."
}
```

## Usage

### Access Dashboard
Navigate to `/analytics` (requires authentication)

### Date Range Filtering
Select from:
- Last 7 days
- Last 30 days
- Last 90 days
- All time

### Event Filtering
Filter event timeline by:
- All events
- Demo events
- Chatbot events
- Signup events
- Onboarding events

## Key Metrics Explained

### Conversion Rates
- **Demo Conversion**: `demo_completed / demo_started * 100`
- **Onboarding Completion**: `onboarding_completed / onboarding_started * 100`
- **Signup Conversion**: `signup_completed / signup_attempt * 100`
- **Test Lead Success**: `test_lead_success / test_lead_sent * 100`

### Engagement Metrics
- **Chatbot Engagement**: `total_messages / sessions_opened`
- **High-Fit Leads**: Count of `chatbot_high_fit_lead` events
- **CTA Clicks**: Count of CTA click events

### Funnel Metrics
- **Visitor → Demo**: `demo_started / unique_visitors * 100`
- **Demo → Signup**: `signup_completed / demo_started * 100`
- **Signup → Onboarding**: `onboarding_completed / signup_completed * 100`

## Next Steps

1. ✅ Analytics dashboard created
2. ✅ Database schema implemented
3. ✅ API endpoints created
4. ✅ Event timeline component
5. 📝 Add charts/graphs (line charts, bar charts)
6. 📝 Export functionality (CSV, PDF)
7. 📝 Real-time updates (WebSocket/SSE)
8. 📝 Custom date range picker
9. 📝 Email reports
10. 📝 Alerts for key metrics

## Integration

The dashboard automatically:
- Tracks all events via `/api/analytics`
- Stores events in `analytics_events` table
- Calculates metrics in real-time
- Displays data with date range filtering

All events tracked throughout the app are automatically available in the dashboard.

