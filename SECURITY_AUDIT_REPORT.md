# Critical Security & Architecture Audit Report

## Date: 2025-01-27

This report documents critical security vulnerabilities, database design issues, API integration problems, business logic errors, and build/deployment configuration issues.

---

## 🔴 CRITICAL SECURITY VULNERABILITIES

### 1. **CRITICAL: Retell AI API Key Not Decrypted from Database**
**Location**: `supabase/functions/trigger-ai-caller/index.ts:90`
**Issue**: Edge function uses `Deno.env.get('RETELL_API_KEY')` instead of decrypting from `integration.encrypted_key`
**Risk**: All organizations would share the same Retell API key, breaking multi-tenancy
**Fix**: Implement decryption using the encryption library

### 2. **CRITICAL: Webhook Authentication Timing Attack**
**Location**: `app/api/leads/webhook/route.ts:20`
**Issue**: Uses simple string comparison `authHeader !== expectedAuth` which is vulnerable to timing attacks
**Risk**: Attackers could brute-force the webhook secret
**Fix**: Use `crypto.timingSafeEqual()` for constant-time comparison

### 3. **CRITICAL: Empty Encryption Key Vulnerability**
**Location**: `lib/encryption.ts:15`
**Issue**: Falls back to empty string if `ENCRYPTION_KEY` not set: `process.env.ENCRYPTION_KEY || ''`
**Risk**: All encrypted data would be decryptable with empty key
**Fix**: Throw error if encryption key is missing

### 4. **CRITICAL: SECURITY DEFINER Function Bypasses RLS**
**Location**: `supabase/migrations/002_dashboard_summary_rpc.sql:36`
**Issue**: Function uses `SECURITY DEFINER` but doesn't validate `org_id` parameter against `auth.uid()`
**Risk**: Users could query other organizations' data by passing different `org_id`
**Fix**: Add RLS validation inside function

### 5. **CRITICAL: Webhook Organization ID Spoofing**
**Location**: `app/api/leads/webhook/route.ts:37-43`
**Issue**: Webhook accepts `organizationId` from request body without verifying it belongs to the authenticated webhook sender
**Risk**: Attackers could create leads for any organization
**Fix**: Verify organization belongs to webhook sender or use webhook-specific organization mapping

---

## 🟠 HIGH SEVERITY ISSUES

### 6. **XSS Vulnerability in Blog Posts**
**Location**: `app/blog/[slug]/page.tsx:170`
**Issue**: Uses `dangerouslySetInnerHTML` without sanitization
**Risk**: If blog content is user-generated or compromised, XSS attacks possible
**Fix**: Sanitize content or use markdown renderer with XSS protection

### 7. **No Rate Limiting on API Routes**
**Location**: All API routes
**Issue**: No rate limiting implemented
**Risk**: DDoS attacks, brute force attacks, API abuse
**Fix**: Implement rate limiting middleware

### 8. **Analytics Events Endpoint Missing Authentication**
**Location**: `app/api/analytics/events/route.ts:7`
**Issue**: GET endpoint doesn't check authentication
**Risk**: Anyone can query analytics events
**Fix**: Add authentication check

### 9. **Chatbot Route Reads Request Body Twice**
**Location**: `app/api/chatbot/route.ts:80`
**Issue**: On error, tries to read request body again which will fail (already consumed)
**Risk**: Error handling fails, potential crashes
**Fix**: Store body in variable before first use

### 10. **Missing search_path Fix for Database Functions**
**Location**: `supabase/migrations/003_lead_trigger.sql`
**Issue**: Functions don't set `search_path` to prevent search_path injection
**Risk**: Security vulnerability if search_path is manipulated
**Fix**: Add `SET search_path = pg_catalog, public;` to all functions

---

## 🟡 MEDIUM SEVERITY ISSUES

### 11. **No CSRF Protection**
**Location**: All POST/PUT/DELETE API routes
**Issue**: No CSRF tokens or SameSite cookie protection
**Risk**: CSRF attacks possible
**Fix**: Implement CSRF protection or use SameSite cookies

### 12. **Missing Input Validation on Phone Numbers**
**Location**: Multiple locations
**Issue**: Phone numbers only checked for minimum length, not format
**Risk**: Invalid phone numbers could cause API failures
**Fix**: Add phone number format validation

### 13. **No Request Size Limits**
**Location**: All API routes
**Issue**: No explicit body size limits
**Risk**: Memory exhaustion attacks
**Fix**: Add body size limits

### 14. **Missing Database Constraints**
**Location**: `prisma/schema.prisma`
**Issue**: 
- `status` field in Lead model uses String instead of enum
- No check constraint on status values
- No validation on phone number format
**Risk**: Invalid data could be stored
**Fix**: Add proper constraints and enums

### 15. **Missing Indexes**
**Location**: Database schema
**Issue**: 
- No index on `users.supabase_user_id` (used in RLS policies)
- No index on `integrations.organization_id + type` (used in queries)
**Risk**: Slow queries, poor performance
**Fix**: Add missing indexes

---

## 🟢 LOW SEVERITY / BEST PRACTICES

### 16. **Missing Security Headers**
**Location**: `next.config.ts`
**Issue**: No security headers configured (CSP, HSTS, X-Frame-Options, etc.)
**Risk**: Various client-side attacks
**Fix**: Add security headers

### 17. **Environment Variable Validation**
**Location**: Application startup
**Issue**: No validation that required environment variables are set
**Risk**: Runtime failures in production
**Fix**: Add startup validation

### 18. **Error Messages Leak Information**
**Location**: Multiple API routes
**Issue**: Some error messages might leak internal details
**Risk**: Information disclosure
**Fix**: Sanitize error messages

### 19. **No Health Check Endpoint**
**Location**: Missing
**Issue**: No `/health` or `/api/health` endpoint
**Risk**: Difficult to monitor application status
**Fix**: Add health check endpoint

### 20. **Missing Database Function Security Fix Migration**
**Location**: Referenced but file doesn't exist
**Issue**: Migration `004_fix_function_security.sql` referenced but not found
**Risk**: Functions may have security vulnerabilities
**Fix**: Create the migration file

---

## 📊 DATABASE DESIGN ISSUES

### 21. **Status Field Should Be Enum**
**Location**: `prisma/schema.prisma:48`
**Issue**: `status` is String instead of enum
**Risk**: Invalid status values can be stored
**Fix**: Use Prisma enum

### 22. **Missing Foreign Key Indexes**
**Location**: Database schema
**Issue**: Foreign keys don't always have indexes
**Risk**: Slow joins and updates
**Fix**: Ensure all foreign keys are indexed

### 23. **No Soft Delete Support**
**Location**: All models
**Issue**: No `deletedAt` field for soft deletes
**Risk**: Data loss if records accidentally deleted
**Fix**: Add soft delete support if needed

### 24. **Missing Unique Constraints**
**Location**: Database schema
**Issue**: Some fields that should be unique aren't
**Risk**: Data integrity issues
**Fix**: Add unique constraints where appropriate

---

## 🔧 API INTEGRATION ISSUES

### 25. **Retell AI Edge Function Doesn't Decrypt API Key**
**Location**: `supabase/functions/trigger-ai-caller/index.ts:90`
**Issue**: Uses environment variable instead of decrypting from database
**Risk**: Multi-tenancy broken, all orgs share same key
**Fix**: Implement decryption

### 26. **Webhook Organization Validation Missing**
**Location**: `app/api/leads/webhook/route.ts`
**Issue**: Doesn't verify organization belongs to webhook sender
**Risk**: Organization ID spoofing
**Fix**: Add organization validation

### 27. **Stripe Webhook Signature Verification**
**Location**: `supabase/functions/stripe-webhook/index.ts:32`
**Status**: ✅ Correctly implemented
**Note**: Uses `stripe.webhooks.constructEvent()` which is secure

---

## 🧠 BUSINESS LOGIC ERRORS

### 28. **Speed to Lead Calculation Logic**
**Location**: `supabase/migrations/003_lead_trigger.sql:6-11`
**Issue**: Logic seems correct but should verify edge cases
**Status**: ✅ Appears correct

### 29. **Upgrade Route Missing Plan Validation**
**Location**: `app/api/upgrade/route.ts:43`
**Issue**: Only checks if priceId exists, doesn't validate plan upgrade path
**Risk**: Users could skip tiers or downgrade incorrectly
**Fix**: Add upgrade path validation

### 30. **Missing Subscription Status Check in Upgrade**
**Location**: `app/api/upgrade/route.ts:56`
**Issue**: Only checks for active subscription, doesn't handle trial/past_due states
**Risk**: Users in trial might not be able to upgrade
**Fix**: Handle all subscription states

---

## 🚀 BUILD & DEPLOYMENT CONFIGURATION

### 31. **Missing Security Headers**
**Location**: `next.config.ts`
**Issue**: No security headers configured
**Fix**: Add headers configuration

### 32. **Environment Variable Validation**
**Location**: Application startup
**Issue**: No validation
**Fix**: Add startup checks

### 33. **No Health Check**
**Location**: Missing
**Fix**: Add `/api/health` endpoint

### 34. **Cron Job Security**
**Location**: `app/api/cron/billing-reconciliation/route.ts:19`
**Issue**: Only checks secret if it exists, but doesn't require it
**Risk**: If CRON_SECRET not set, endpoint is unprotected
**Fix**: Require CRON_SECRET

---

## ✅ FIXES TO IMPLEMENT

1. Fix Retell AI API key decryption
2. Fix webhook authentication timing attack
3. Fix encryption key validation
4. Fix SECURITY DEFINER function RLS bypass
5. Fix webhook organization validation
6. Add XSS protection for blog content
7. Add rate limiting
8. Add authentication to analytics endpoints
9. Fix chatbot error handling
10. Add search_path to all database functions
11. Add security headers
12. Add environment variable validation
13. Fix database constraints and indexes
14. Add health check endpoint

