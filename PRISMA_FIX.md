# Fix Prisma Migration Drift

## Problem
Prisma detected drift because tables were created via Supabase migrations, but Prisma has no migration history.

## Quick Fix

### Step 1: Update .env file

Add `?sslmode=require` to both connection strings:

```env
DATABASE_URL="postgresql://postgres.ldxdzhonsjjjjsqownea:Sophiedog2283!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

DIRECT_URL="postgresql://postgres.ldxdzhonsjjjjsqownea:Sophiedog2283!@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

### Step 2: Mark baseline migration as applied

```bash
npx prisma migrate resolve --applied 0_init
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Verify

```bash
npx prisma migrate status
```

## Alternative: If connection still fails

If you still can't connect, you can use `prisma db pull` to introspect the database and update your schema, then create a new migration:

```bash
npx prisma db pull
npx prisma migrate dev --name sync_with_supabase --create-only
npx prisma migrate resolve --applied sync_with_supabase
```

## Current Status

- ✅ Baseline migration created: `prisma/migrations/0_init/`
- ✅ Migration lock file created
- ⚠️  Need to add SSL to connection strings
- ⚠️  Need to mark migration as applied

