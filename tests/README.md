# SoloSuccess AI - Testing Documentation

This directory contains all tests for the SoloSuccess AI platform, including unit tests, integration tests, end-to-end tests, accessibility tests, and performance tests.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual functions and components
│   ├── auth/               # Authentication service tests
│   ├── services/           # Business logic service tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests for API endpoints and services
│   ├── api/                # API integration tests
│   └── services/           # Service integration tests
├── e2e/                    # End-to-end tests using Playwright
├── accessibility/          # Accessibility tests (WCAG compliance)
├── performance/            # Performance and load tests
└── setup.ts               # Test setup and configuration
```

## Running Tests

### Unit Tests

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Integration Tests

Run integration tests:
```bash
npm test -- tests/integration
```

### End-to-End Tests

Run E2E tests (requires dev server running):
```bash
npm run test:e2e
```

Run E2E tests with UI:
```bash
npm run test:e2e:ui
```

Run E2E tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

### Accessibility Tests

Run accessibility tests:
```bash
npm run test:a11y
```

### Performance Tests

Run performance benchmarks:
```bash
npm test -- tests/performance
```

Run K6 load tests (requires K6 installed):
```bash
k6 run tests/performance/load-test.js
```

## Test Coverage

Current test coverage includes:

### Unit Tests (34 tests)
- ✅ Password hashing and verification
- ✅ JWT token generation and verification
- ✅ Input validation schemas
- ✅ Data processing utilities
- ✅ Utility functions (cn, etc.)

### Integration Tests (11 tests)
- ✅ Authentication flow (registration, login)
- ✅ Token management
- ✅ Email validation and templates

### End-to-End Tests
- ✅ User authentication flows
- ✅ Dashboard navigation
- ✅ Mission Control interface

### Accessibility Tests
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Color contrast ratios
- ✅ Form labels and ARIA attributes

### Performance Tests
- ✅ API response time benchmarks
- ✅ Memory usage tests
- ✅ Algorithm efficiency tests
- ✅ Concurrent operations tests
- ✅ Load testing scenarios

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/utils/myFunction';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myService } from '@/lib/services/myService';

describe('MyService Integration', () => {
  it('should integrate with other services', async () => {
    const result = await myService.doSomething();
    expect(result).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button[name="submit"]');
  await expect(page).toHaveURL(/success/);
});
```

## Test Configuration

### Vitest Configuration
See `vitest.config.ts` for unit and integration test configuration.

### Playwright Configuration
See `playwright.config.ts` for E2E and accessibility test configuration.

## Continuous Integration

Tests are automatically run in CI/CD pipeline:
- Unit tests run on every commit
- Integration tests run on pull requests
- E2E tests run before deployment
- Accessibility tests run weekly
- Performance tests run on staging environment

## Best Practices

1. **Write tests first** - Follow TDD when possible
2. **Keep tests focused** - One test should test one thing
3. **Use descriptive names** - Test names should explain what they test
4. **Mock external dependencies** - Don't rely on external services in unit tests
5. **Clean up after tests** - Always clean up test data
6. **Test edge cases** - Don't just test the happy path
7. **Maintain test coverage** - Aim for 80%+ code coverage
8. **Run tests locally** - Always run tests before committing

## Troubleshooting

### Tests failing locally
1. Ensure all dependencies are installed: `npm install`
2. Ensure database is running (for integration tests)
3. Clear test cache: `npm test -- --clearCache`

### E2E tests timing out
1. Increase timeout in playwright.config.ts
2. Ensure dev server is running
3. Check network connectivity

### Accessibility tests failing
1. Review axe-core violations in test output
2. Fix HTML structure and ARIA attributes
3. Ensure proper color contrast

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Axe-core Documentation](https://github.com/dequelabs/axe-core)
- [K6 Documentation](https://k6.io/docs/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
