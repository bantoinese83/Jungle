#!/bin/bash

# Script to sync Prisma with existing Supabase database
# This adds SSL parameters and marks the baseline migration as applied

echo "Updating .env file with SSL parameters..."

# Add SSL to DATABASE_URL if not present
if ! grep -q "sslmode=require" .env 2>/dev/null; then
  echo "⚠️  Please manually add ?sslmode=require to your DATABASE_URL and DIRECT_URL in .env"
  echo ""
  echo "Update these lines:"
  echo 'DATABASE_URL="postgresql://...?pgbouncer=true&sslmode=require"'
  echo 'DIRECT_URL="postgresql://...?sslmode=require"'
  echo ""
  read -p "Press enter after updating .env file..."
fi

echo "Marking baseline migration as applied..."
npx prisma migrate resolve --applied 0_init

echo "Generating Prisma Client..."
npx prisma generate

echo "✅ Prisma sync complete!"
echo ""
echo "Verify with: npx prisma migrate status"

