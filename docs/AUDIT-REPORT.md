# Mockit Audit Report

_Generated: January 2026_

---

## Executive Summary

Mockit is a solid, battle-tested TypeScript mocking library with thoughtful design. The dual API (Mockito + Jest style), type safety, and matcher system are genuinely excellent. The compare-v2 rewrite shows commitment to developer experience.

**Key Stats:**
- Version: 6.0.0-beta.2
- Tests: 227 passing, 57 suites
- LOC: ~3,000+ lines of implementation
- Used by: 25+ engineers for 3+ years

---

## What's Good (Strengths)

### 1. Dual API Design

The combination of Mockito-style (`when`/`verifyThat`) and Jest-style (`mockReturnValue`/`mockImplementation`) APIs is clever. It lets users pick what's familiar to them while keeping everything consistent under the hood. This is rare and well-executed.

```typescript
// Mockito style
when(mock).isCalledWith(arg).thenReturn(value)
verifyThat(mock).wasCalledOnceWith(arg)

// Jest style
mock.mockReturnValue(value)
mock.mockImplementation((x) => x * 2)
```

### 2. Type Safety

The TypeScript implementation is excellent:
- `NoInfer<T>` prevents type widening
- Generic constraints for proper inference
- Proxy tricks to make matchers appear as expected types
- Full strict mode compliance

### 3. The Revamped Compare-V2 Engine

This is the crown jewel. The architecture is solid:
- Modular comparators and matcher handlers
- Circular reference detection via WeakSets
- Rich error context with path tracking
- Plugin-based formatting for matchers
- ~3,000 lines of well-structured code

### 4. Matcher System

30+ matchers across 8 categories:

| Category | Matchers |
|----------|----------|
| Type matchers | `any.string()`, `any.number()`, `any.boolean()`, etc. |
| Partial matching | `objectContaining()`, `arrayContaining()` |
| Deep matching | `objectContainingDeep()`, `arrayContainingDeep()` |
| String matchers | `stringContaining()`, `stringStartingWith()`, `stringMatching()` |
| Validation | `validates()` (Zod + custom functions) |
| Combinators | `or()`, `isOneOf()` |
| Instance checking | `instanceOf()` |
| Escape hatches | `unsafe()`, `partial()` |

### 5. Tutorial-Driven Documentation

The progressive 10-lesson tutorial series in `src/tutorial/` is excellent for onboarding:
- Lesson 0: What can I mock?
- Lessons 1-3: Behavior setup
- Lessons 4-7: Verification and matchers
- Lessons 8-9: Advanced patterns (spying, low-level API)

### 6. Test Coverage

227 tests across 57 suites with all passing shows discipline. The tests serve as living documentation.

---

## What Needs Work (Issues)

### 1. Package Configuration Problems

```json
"files": ["dist/index.js", "dist/index.d.ts"]
```

**Problem:** Missing `dist/index.mjs` from the files array. The ESM build isn't being published to npm. Users on native ESM won't get the optimized build.

**Fix:** Update to:
```json
"files": ["dist/index.js", "dist/index.mjs", "dist/index.d.ts"]
```

### 2. TypeScript Version (4.9.5)

This is from December 2022. TypeScript 5.x brings:
- Significant performance improvements
- Better type inference
- Decorator support
- `const` type parameters

**Recommendation:** Upgrade to TypeScript 5.3+

### 3. Inconsistent Reset Semantics

| Jest API | Mockito API | Behavior |
|----------|-------------|----------|
| `mockClear()` | `resetHistoryOf()` | Clear history only |
| `mockReset()` | `resetBehaviourOf()` | Clear history + behaviors |
| `mockRestore()` | `resetCompletely()` | Reset + restore original |

The naming and behavior don't fully align, which can confuse users switching between APIs.

### 4. No `mock.results` Implementation

The Jest API has `mock.results` returning `{ type: 'return' | 'throw', value: any }[]`. The data exists internally (the `Call` type has `CallResult`), but it's not exposed in the same shape.

**Impact:** Breaks compatibility for Jest users migrating to Mockit.

### 5. No Async Matcher Support

There's no `await verifyThat(mock).wasCalledWith(...)` or async validation in matchers. Modern code is heavily async.

### 6. Missing `calledBefore`/`calledAfter` Verification

Mockito has `InOrder` verification. When testing complex flows, users often need to verify call order across multiple mocks:

```typescript
// Desired API
const inOrder = verifyInOrder(mock1, mock2)
inOrder.verify(mock1).wasCalledWith(arg1)
inOrder.verify(mock2).wasCalledWith(arg2)
```

### 7. Limited Spy Capabilities

The spy functionality exists but is basic. You can't easily spy on object methods while keeping other methods real (partial spying).

---

## What's Missing (Additions)

### 1. Assertion Library

The matchers are powerful enough to support an `expect`-style API:

```typescript
expect(value).toEqual(m.objectContaining({ id: 1 }))
expect(value).toMatch(m.stringContaining("hello"))
expect(array).toContain(m.objectContaining({ active: true }))
```

This would make Mockit a one-stop testing utility.

### 2. Auto-Mocking / Module Mocking

Currently users must manually create mocks. An auto-mock feature like Jest's would be valuable:

```typescript
const mockedModule = mockModule('./userService')
// All exports are automatically mocked
```

### 3. Snapshot Support for Calls

Allow snapshotting mock call history:

```typescript
expect(getMockHistory(mock).getCalls()).toMatchSnapshot()
```

### 4. Mock Factories / Fixtures

For classes with many methods, creating mocks is tedious:

```typescript
const userServiceFactory = createMockFactory<UserService>({
  getUser: () => defaultUser,
  saveUser: () => true
})

const mock = userServiceFactory({ getUser: () => customUser })
```

### 5. Debug Mode / Call Tracing

A way to log all mock interactions in real-time during debugging:

```typescript
Mock(fn, { trace: true }) // Logs every call to console
```

### 6. Framework Integrations

- **Vitest adapter** (increasingly popular, faster than Jest)
- **Bun test adapter**
- **Deno test adapter**

### 7. CLI / Scaffolding

A simple CLI to generate mock templates from interfaces:

```bash
npx mockit generate ./src/services/UserService.ts
```

### 8. Website & Playground

For a library used by 25+ engineers, a dedicated website with:
- Interactive playground (StackBlitz/CodeSandbox embed)
- API reference with search
- Migration guides (from Jest mocks, Sinon, etc.)
- Cookbook with common patterns
- Performance benchmarks

---

## Priority Recommendations

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| **P0** | Fix package.json `files` to include ESM build | 5 min | High |
| **P0** | Complete compare-v2 integration in `verifyThat` | Medium | High |
| **P1** | Add `mock.results` for Jest compatibility | Small | Medium |
| **P1** | Ship the assertion library PR | Already done | High |
| **P1** | Upgrade TypeScript to 5.x | Small | Medium |
| **P2** | Add `InOrder` verification | Medium | Medium |
| **P2** | Add `withImplementation` (temporary mock swap) | Small | Low |
| **P3** | Vitest/Bun adapters | Medium | Medium |
| **P3** | Documentation website | Large | High |
| **P4** | Auto-mocking / module mocking | Large | High |
| **P4** | Mock factories | Medium | Medium |

---

## Testing Suite Recommendations

### 1. Property-Based Testing

The matchers are a perfect fit for something like fast-check. Test that matchers correctly match/reject across generated inputs:

```typescript
import fc from 'fast-check'

test('anyString matches all strings', () => {
  fc.assert(fc.property(fc.string(), (s) => {
    return compare(s, m.any.string()).success
  }))
})
```

### 2. Performance Benchmarks

As a core testing utility, performance matters. Add benchmarks for:
- Mock creation time
- Call matching (exact vs matcher-based)
- Comparison engine throughput
- Memory usage with many calls

### 3. Integration Tests

Tests showing Mockit working with:
- Express/Fastify routes
- React components (with React Testing Library)
- Database repositories
- External API clients

### 4. Error Message Snapshot Tests

Ensure beautiful error messages don't regress:

```typescript
test('error message for missing property', () => {
  const result = compare({ a: 1 }, { a: 1, b: 2 })
  expect(formatError(result)).toMatchSnapshot()
})
```

---

## Architectural Suggestions

### 1. Plugin System for Matchers

The matcher system is currently closed. Users can't add custom matchers without forking:

```typescript
// Proposed API
m.register('myMatcher', {
  matches: (actual, expected) => actual.customProp > expected,
  format: (expected) => `myMatcher(${expected})`,
  description: 'Checks if customProp exceeds threshold'
})

// Usage
when(mock).isCalledWith(m.myMatcher(5)).thenReturn(true)
```

### 2. Event System for Mock Lifecycle

Allow hooks into mock behavior for debugging and logging:

```typescript
mock.on('call', (args, result) => {
  console.log(`Called with: ${args}, returned: ${result}`)
})

mock.on('reset', () => {
  cleanup()
})

mock.on('behaviorMatched', (behavior, args) => {
  console.log(`Matched behavior for args: ${args}`)
})
```

### 3. Package Separation

Consider splitting for tree-shaking and targeted installs:

```
@vdstack/mockit-core      # Core engine, matchers, compare
@vdstack/mockit           # Full library (re-exports core)
@vdstack/mockit-jest      # Jest integration helpers
@vdstack/mockit-vitest    # Vitest adapter
@vdstack/mockit-expect    # Assertion library
```

---

## Quick Wins (Do This Week)

1. **Fix ESM publishing** - Add `dist/index.mjs` to package.json files array
2. **Add `mock.results`** - Expose existing CallResult data in Jest-compatible shape
3. **Upgrade TypeScript** - Bump to 5.3+ for performance and features
4. **Ship assertion library** - Unblock the pending PR

---

## Medium-Term Roadmap (Next Quarter)

1. **Complete compare-v2 integration** - Ensure all error paths use new formatters
2. **Add InOrder verification** - For testing call sequences
3. **Vitest adapter** - The ecosystem is shifting away from Jest
4. **Property-based tests** - Increase confidence in matcher correctness
5. **Performance benchmarks** - Establish baselines, prevent regressions

---

## Long-Term Vision (Next Year)

1. **Documentation website** - With playground, API docs, migration guides
2. **Auto-mocking** - Automatic mock generation from modules/interfaces
3. **Plugin system** - Let users extend matchers
4. **Mock factories** - Reduce boilerplate for complex types
5. **Framework adapters** - First-class support for Vitest, Bun, Deno

---

## Conclusion

Mockit is a well-architected, thoroughly tested mocking library that compares favorably to established solutions. The dual API design, comprehensive matchers, and the new compare-v2 engine are standout features.

The main gaps are:
- Minor packaging issues (ESM)
- Jest API completeness (`mock.results`)
- Ecosystem integration (Vitest)
- Discoverability (no website)

With the improvements outlined above, Mockit could become a compelling alternative to Jest's built-in mocks and libraries like Sinon.

---

_This audit was generated by analyzing the complete codebase including source files, tests, documentation, and build configuration._
