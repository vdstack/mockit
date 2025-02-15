# Mockit Assertion Library

A powerful, flexible, and type-safe assertion library that makes testing complex objects and patterns both easy and maintainable.

## What is a Matcher?

A matcher is a pattern-matching rule that describes what you're looking for, rather than the exact value you expect. Instead of saying "this should equal exactly 42", you might say "this should be any number" or "this should be a string containing 'hello'". Matchers let you define flexible, meaningful assertions about your data.

For example:

```typescript
// Without matcher - exact match required
m.expect(user.email).toEqual("john@example.com");

// With matcher - any email @example.com is valid
m.expect(user.email).toEqual(m.stringMatching(/@example\.com$/));

// With matcher - any string is valid
m.expect(user.name).toEqual(m.anyString());
```

## Why Use Matcher-Based Assertions?

Testing should focus on what matters, not on exact data matching. Mockit's matcher-based assertions help you write more maintainable and meaningful tests by:

- **Decoupling tests from implementation details** - Test the properties that matter for your business logic, not the entire data structure. This makes your tests resilient to changes and reduces maintenance overhead.

- **Making intent explicit** - Matchers clearly show what aspects of the data are important for the test. When you see `m.anyString()` or `m.validates(age => age >= 18)`, you immediately understand what the test cares about.

- **Supporting evolution** - As your codebase grows and changes, matcher-based tests remain stable. They only break when something truly important changes, not when you add a new field or refactor internal structures.

- **Accelerating development** - Write tests faster by focusing only on relevant properties. No need to match entire objects or maintain extensive test data when you only care about specific parts.

By focusing on patterns and behaviors rather than exact data matching, you create tests that are both more robust and better at documenting your system's requirements.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Primitive Assertions](#primitive-assertions)
- [Object Matching](#object-matching)
  - [Direct Equality](#direct-equality)
  - [Partial Object Matching](#partial-object-matching)
  - [Deep Object Matching](#deep-object-matching)
- [Array Matchers](#array-matchers)
- [String Matchers](#string-matchers)
- [Type Matchers](#type-matchers)
- [Error Assertions](#error-assertions)
- [Collection Assertions](#collection-assertions)
- [Custom Validation](#custom-validation)
- [Best Practices](#best-practices)

## Basic Usage

```typescript
import { m } from "mockit";

// Basic assertion
m.expect(42).toEqual(42);

// Using matchers
m.expect("hello world").toEqual(m.stringContaining("world"));
```

## Primitive Assertions

The library handles primitive values directly with simple equality checks:

```typescript
m.expect(42).toEqual(42);
m.expect("hello").toEqual("hello");
m.expect(true).toEqual(true);
m.expect(null).toEqual(null);
m.expect(undefined).toEqual(undefined);
```

## Object Matching

### Direct Equality

When you need exact matches for all properties:

```typescript
const user = {
  name: "John",
  age: 30,
  settings: {
    theme: "dark",
  },
};

m.expect(user).toEqual({
  name: "John",
  age: 30,
  settings: {
    theme: "dark",
  },
});
```

### Partial Object Matching

When you only care about specific properties:

```typescript
// Using nested objectContaining
m.expect(user).toEqual(
  m.objectContaining({
    name: "John",
    settings: m.objectContaining({
      theme: "dark",
    }),
  })
);
```

### Deep Object Matching

The most concise way to match nested objects:

```typescript
// Using objectContainingDeep - cleaner and more maintainable
m.expect(user).toEqual(
  m.objectContainingDeep({
    settings: {
      theme: "dark",
    },
  })
);
```

### Comparison of Matching Styles

Here's a comprehensive example showing all three matching styles:

```typescript
const complexNested = {
  user: {
    profile: {
      name: "John",
      settings: {
        theme: "dark",
        notifications: true,
      },
    },
    stats: {
      lastLogin: "2024-01-01",
      loginCount: 42,
    },
  },
};

// 1. Direct equality - most strict
m.expect(complexNested).toEqual({
  user: {
    profile: {
      name: "John",
      settings: {
        theme: "dark",
        notifications: true,
      },
    },
    stats: {
      lastLogin: "2024-01-01",
      loginCount: 42,
    },
  },
});

// 2. Nested objectContaining - flexible but verbose
m.expect(complexNested).toEqual(
  m.objectContaining({
    user: m.objectContaining({
      profile: m.objectContaining({
        settings: m.objectContaining({
          theme: "dark",
        }),
      }),
    }),
  })
);

// 3. objectContainingDeep - most concise
m.expect(complexNested).toEqual(
  m.objectContainingDeep({
    user: {
      profile: {
        settings: {
          theme: "dark",
        },
      },
    },
  })
);
```

## Array Matchers

```typescript
// Match array containing specific elements
m.expect(["apple", "banana"]).toEqual(m.arrayContaining(["apple"]));

// Deep matching of array elements
m.expect([
  [1, 2],
  [3, 4],
]).toEqual(m.arrayContainingDeep([[2]]));
```

## String Matchers

```typescript
// Contains
m.expect("hello world").toEqual(m.stringContaining("world"));

// Starts with
m.expect("hello world").toEqual(m.stringStartingWith("hello"));

// Ends with
m.expect("hello world").toEqual(m.stringEndingWith("world"));

// Regex matching
m.expect("HELLO world").toEqual(m.stringMatching(/hello/i));
```

## Type Matchers

```typescript
// Type checking matchers
m.expect("hello").toEqual(m.anyString());
m.expect(42).toEqual(m.anyNumber());
m.expect(true).toEqual(m.anyBoolean());
m.expect({}).toEqual(m.anyObject());
m.expect([]).toEqual(m.anyArray());
```

## Error Assertions

The `toThrow` matcher works identically to Jest's `toThrow`, allowing you to verify that a function throws an error when executed. The function must be wrapped in another function or arrow function to prevent the error from being thrown immediately:

```typescript
// ❌ Wrong - this will throw immediately
m.expect(throwingFunction()).toThrow();

// ✅ Correct - wrap in a function
m.expect(() => throwingFunction()).toThrow();

// Real-world examples
function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

// ✅ Correct - verifying error is thrown
m.expect(() => divide(10, 0)).toThrow();

// ❌ Incorrect - function doesn't throw (test will fail)
m.expect(() => divide(10, 2)).toThrow();
```

## Collection Assertions

The `toContain` matcher provides a flexible way to verify that an array or object contains specific elements or properties. It supports both array elements and object property matching.

### Array Containment

```typescript
// Basic array containment
m.expect([1, 2, 3]).toContain(2);
m.expect(["apple", "banana", "orange"]).toContain("banana");

// Object in array
const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
];
m.expect(users).toContain({ id: 1, name: "John" });
```

### Object Containment

```typescript
// Partial object matching
const user = {
  id: 1,
  name: "John",
  email: "john@example.com",
  settings: {
    theme: "dark",
    notifications: true,
  },
};

// Match subset of properties
m.expect(user).toContain({ name: "John", email: "john@example.com" });

// Match nested properties
m.expect(user).toContain({
  settings: {
    theme: "dark",
  },
});
```

## Custom Validation

Use custom validation functions for complex assertions:

```typescript
// Simple validation
m.expect(42).toEqual(m.validates((x) => x > 40));

// Complex object validation
m.expect(user).toEqual(
  m.objectContaining({
    age: m.validates((age) => age >= 18),
    email: m.validates((email) => email.includes("@")),
  })
);
```

## Best Practices

1. **Choose the Right Matching Style**

   - Use direct equality when you need exact matches
   - Use `objectContaining` when you need to match specific properties at one level
   - Use `objectContainingDeep` for nested structures when you don't need all properties

2. **Combine Matchers**

   ```typescript
   m.expect(response).toEqual(
     m.objectContainingDeep({
       user: {
         id: m.anyString(),
         email: m.stringMatching(/@example\.com$/),
         age: m.validates((age) => age >= 18),
       },
     })
   );
   ```

3. **Keep Tests Focused**

   - Only assert what matters for the test
   - Use partial matching to avoid brittle tests
   - Use custom validators for complex business rules

4. **Type Safety**
   - Take advantage of TypeScript integration
   - Use type matchers to ensure correct types
   - Leverage IDE support for better development experience
