import { z } from "zod";
import { compare } from "./argsComparisons/compare";

export type AbstractClass<T> = abstract new (...args: any[]) => T;
export type Class<T> = new (...args: any[]) => T;
export type BuildMethodsMap<Class, V> = {
  [K in keyof Class as Class[K] extends V ? K : never]: Class[K];
};

export type GetClassMethods<Class> = keyof BuildMethodsMap<Class, Function>;

export type Call<T extends (...args: any) => any> = {
  args: Parameters<T>;
  date: Date;
};

export type UnsafeCall = {
  args: any[];
  date: Date;
};

/**
 * This is a helper type that will allow, for each element of a tuple,
 * to provide either the expected element, or a zod schema.
 * This is useful for the zod based assertions, because it allows us to
 * maintain the type-safety of the function (thank to the original function's parameters),
 * while allowing the user to provide zod schemas for some of the parameters.
 */
export type AllowZodSchemas<Tuple extends any[]> = [
  ...{
    [Key in keyof Tuple]: Tuple[Key] | z.ZodType;
  }
];

// Assume 'm' is an object where 'rule' is defined
const m = {
  rule: <T>(fn: (value: T) => boolean) => fn,
};
type Rule<T> = (value: T) => boolean;

// --- Existing Overloads ---
function assertEqual<T extends object>(
  actual: T,
  expected: { [K in keyof T]?: T[K] | Rule<T[K]> }
): void;
function assertEqual<T>(actual: T, expected: Rule<T>): void;
function assertEqual<T>(actual: Rule<T>, expected: T): void;
function assertEqual<T>(actual: T, expected: T): void;

// --- Array Overloads ---
function assertEqual<T>(actual: T[], expected: T[]): void;
function assertEqual<T>(actual: T[], expected: Rule<T[]>): void;
function assertEqual<T>(actual: T[], expected: Rule<T>[]): void;
function assertEqual<T>(actual: Rule<T>[], expected: T[]): void;

// --- Set Overloads ---
function assertEqual<T>(actual: Set<T>, expected: Set<T>): void;
function assertEqual<T>(actual: Set<T>, expected: Rule<Set<T>>): void;
function assertEqual<T>(actual: Set<T>, expected: Iterable<T | Rule<T>>): void;

// --- Map Overloads ---
function assertEqual<K, V>(actual: Map<K, V>, expected: Map<K, V>): void;
function assertEqual<K, V>(actual: Map<K, V>, expected: Rule<Map<K, V>>): void;
function assertEqual<K, V>(
  actual: Map<K, V>,
  expected: Map<K, V | Rule<V>>
): void;

// --- Implementation Signature ---
function assertEqual(actual: any, expected: any): void {
  if (!compare(actual, expected)) {
    throw new Error(
      `Assertion failed: ${JSON.stringify(
        actual
      )} is not equal to ${JSON.stringify(expected)}.`
    );
  }
}

// Example usage:
assertEqual({ x: 1 }, { x: m.rule((n) => n > 0) });
assertEqual(
  1,
  m.rule((n) => n > 0)
);
assertEqual(
  m.rule((n) => n > 0),
  1
);
assertEqual(
  "hello",
  m.rule((s) => s.startsWith("h"))
);
assertEqual(
  m.rule((s) => s.length > 3),
  "world"
);
assertEqual(5, 5);
assertEqual("test", "test");
assertEqual([1], [m.validates((x) => x > 0)]);

// Example with different types (will now catch type errors at the call site)
// assertEqual(1, m.rule(s => s === "1")); // Error: Argument of type 'Rule<string>' is not assignable to parameter of type 'Rule<number>'.
// assertEqual("abc", m.rule(n => n > 0)); // Error: Argument of type 'Rule<number>' is not assignable to parameter of type 'Rule<string>'.

console.log("Assertions (with proper type checking) passed compilation.");
