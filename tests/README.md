# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage with golden (happy path) and edge cases for the Jungle application.

## Test Structure

```
tests/
├── api/                    # API route tests
│   ├── leads/
│   │   └── webhook.test.ts
│   ├── integrations/
│   │   └── retell.test.ts
│   └── organization/
│       └── speed-to-lead.test.ts
├── components/             # Component tests
│   └── auth/
│       └── LoginForm.test.tsx
├── lib/                    # Utility function tests
│   └── encryption.test.ts
├── integration/            # Integration tests
│   └── lead-flow.test.ts
└── setup.ts               # Test configuration
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Categories

### Golden Cases (Happy Path)
- Valid inputs
- Successful operations
- Expected behavior
- Normal user flows

### Edge Cases
- Invalid inputs
- Boundary conditions
- Error handling
- Race conditions
- Missing data
- Extreme values
- Special characters
- Empty/null values

## Coverage Goals

- **API Routes**: 90%+ coverage
- **Components**: 80%+ coverage
- **Utilities**: 95%+ coverage
- **Integration**: Critical paths covered

## Adding New Tests

1. Create test file: `*.test.ts` or `*.test.tsx`
2. Follow naming convention: `[feature].test.ts`
3. Include both golden and edge cases
4. Use descriptive test names
5. Mock external dependencies
6. Clean up in `beforeEach`/`afterEach`

## Best Practices

- Test one thing per test case
- Use descriptive test names
- Mock external services (Supabase, Stripe, etc.)
- Test both success and failure paths
- Include boundary value testing
- Test error messages and status codes
- Keep tests independent and isolated

