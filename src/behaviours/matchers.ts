/**
 * @param mock This is heavily inspired by the library @total-typescript/shoehorn
 * I just wanted a different API and a few more features so I decided to diverge and create my own
 *
 * Kudos to Matt Pococks for the inspiration
 */

import { ZodSchema } from "zod";
import { containing } from "./containing";
import { containingDeep } from "./containing.deep";
import { ProxyFactory } from "./matcher-proxy-factory";

/**
 *
 * @param options an array of options of which one element should be the value we want to match
 *
 * @example
 * isOneOf([1, 2, 3]) // matches 1
 * isOneOf([m.validates(z.number().int().positive())]) // matches 1
 * isOneOf([m.validates(z.number().int().positive())]) // does not match (-1)
 */
export const isOneOf = <T, U>(options: U | NoInfer<T>[]): T => {
  return ProxyFactory<T>("isOneOf", { options: options });
};

export interface Schema {
  safeParse(value: any): { success: boolean };
}

/**
 *
 * @param value a value that is not type-safe. It will trick the type-checker into thinking it's the right type.
 *
 * Use this when you want to match a value that is not type-safe, but you're sure it's the right one
 * (like testing an invalid value, for example).
 *
 * USE WITH CAUTION
 *
 * @example
 * function takesNumber(n: number) { return n + 1 }
 * expect(takesNumber(m.unsafe("1"))).toBe("11")
 */
export const unsafe = <T, U>(value: U | NoInfer<T>): T => {
  return value as T;
};

/**
 *
 * @param value any object
 * @returns what you pass in, but with the type of the object you want to match
 *
 * @example Your function expects a complex object, but for your test you're only interested in a few keys.
 * const value: Partial<User> = { id: "1" }
 * when(mockFunction).isCalled.thenResolve(m.partial(value));
 */
export const partial = <T>(value: PartialDeep<NoInfer<T>>): T => {
  return value as T;
};

/**
 *
 * @param subObject an object that is a subset of the object we want to match
 *
 * @example
 * m.objectContaining({ key: "value" }) // matches { key: "value", otherKey: "otherValue" }
 * m.objectContaining({ key: "value" }) // does not match { otherKey: "otherValue" } (missing key)
 *
 * @example
 * m.objectContaining({ x: { y: 1 } }) // does not match { x: { y: 1, z: 2 } } (missing z)
 * // To match the above, you should use objectContainingDeep
 */
export const objectContaining = <T, U>(
  subObject: U | Partial<NoInfer<T>>
): T => {
  return containing(subObject);
};

// TODO: should we change what's passed to containing so that it can accept multiple arguments instead of an array? Not easy in TS while maintaining the incognito safety tbh.
// This is because it's not that obvious, considering the name, that it should accept an array.
// I think jest had the same issue, i might need to check their old issues beforehand to see how they thought about it.
// I remember having difficulties to wrap my head around their implementation which required to pass an arrays inside arrays. For now, i'm leaning towards flattening it one level,
// but it's not as clear as I'd like it to be.

/**
 *
 * @param subArray an array that is a subset of the array we want to match
 *
 * @example
 * m.arrayContaining([1, 2, 3]) // matches [1, 2, 3, 4, 5]
 * m.arrayContaining([1, 2, 3]) // does not match [1, 2, 4, 5] (missing 3)
 *
 * @example
 * m.arrayContaining([{ x: 1 }]) // does not match [{ x: 1, y: 2 }] (missing y)
 * // To match the above, you should use arrayContainingDeep
 */
export const arrayContaining = <T, U extends Array<T>>(
  // @todo here if undefined: breaks composition. Find a way to make it avoid the
  // undefined case for inference.
  subArray: (U | NoInfer<T>)[]
): T => {
  return containing(subArray);
};

/**
 * @param subString a string that is a subset of the string we want to match
 *
 * @example
 * m.stringContaining("hello") // matches "hello world"
 * m.stringContaining("hello") // does not match "world" (missing hello)
 *
 * @example
 * m.stringContaining("vic") // does not match "dude named victor is saying hi" (missing tor)
 *
 * @example
 * m.stringContaining("VIC") // does not match "vic" (case sensitive)
 *
 * @example
 * m.stringContaining(/vic/i) // Matches both "vic" and "VIC" thanks to regex /i flag
 */
export const stringContaining = <T>(subString: string): T => {
  return containing(subString);
};

// Right now we accept Maps, should we instead accept objects so that keys and values are easier to setup ?
// ex: mapContaining({ key: "value" }) instead of mapContaining(new Map([["key", "value"]]))
// It IS easier to setup, but cuts the feature to provide a submap for checking...

/**
 *
 * @param subMap a map that is a subset of the map we want to match
 *
 * @example
 * m.mapContaining(new Map([["key", "value"]])) // matches new Map([["key", "value"], ["otherKey", "otherValue"]])
 * m.mapContaining(new Map([["key", "value"]])) // does not match new Map([["otherKey", "otherValue"]]) (missing key)
 *
 * @example
 * m.mapContaining(new Map([["x", { y: 1 }]])) // does not match new Map([["x", { y: 1, z: 2 }]]) (missing z)
 * // To match the above, you should use mapContainingDeep
 */
export const mapContaining = <T, U extends Map<string, any>>(
  subMap: U | Partial<NoInfer<T>>
): T => {
  return containing(subMap);
};

// same question as for mapContaining, slightly different: should we accept sets or arrays ?
// ex: setContaining([1, 2, 3]) instead of setContaining(new Set([1, 2, 3]))
// In theory a set should containg a sub-set (mathematical definition), so I'm leaning towards keeping it as is
// Now that I've said that I might change my mind about arrays, considering the fact that an array can be a subset of another array.

/**
 *
 * @param subset a set that is a subset of the set we want to match
 *
 * @example
 * m.setContaining(new Set([1, 2, 3])) // matches new Set([1, 2, 3, 4, 5])
 * m.setContaining(new Set([1, 2, 3])) // does not match new Set([1, 2, 4, 5]) (missing 3)
 *
 * @example
 * m.setContaining(new Set([1, 2, { x: { y: 2 }}])) // does not match new Set([1, 2, { x: { y: 2, z: 3 }}]) (missing z)
 * // To match the above, you should use setContainingDeep
 */
export const setContaining = <T, U extends Set<any>>(
  subset: U | Partial<NoInfer<T>>
): T => {
  return containing(subset);
};

/**
 *
 * @param deepSubObject an object that is a deep subset of the object we want to match
 * @deprecated Use objectMatching instead
 * @example
 * m.objectContainingDeep({ key: "value" }) // matches { key: "value", otherKey: "otherValue" }
 * m.objectContainingDeep({ x: { y: { z: 1 } } }) // matches { x: { y: { z: 1, w: 2 } }, a: 2 }
 *
 * very powerful when checking a specific key deep down the object
 */
export const objectContainingDeep = <T, U>(
  deepSubObject: U | PartialDeep<NoInfer<T>>
): T => {
  return containingDeep(deepSubObject);
};

export const objectMatching = <T, U>(pattern: U | NoInfer<T>): T => {
  return containingDeep(pattern);
};

/**
 * @deprecated Use arrayMatching instead
 */
export const arrayContainingDeep = <T, U extends Array<T>>(
  values: U | NoInfer<T>
): T => {
  return containingDeep(values);
};

export const arrayMatching = <T, U extends Array<T>>(
  values: U | NoInfer<T>
): T => {
  return containingDeep(values);
};

export const mapContainingDeep = <T, U extends Map<string, any>>(
  map: U | PartialDeep<NoInfer<T>>
): T => {
  return containingDeep(map);
};

export const setContainingDeep = <T, U extends Set<any>>(
  set: U | NoInfer<T>
): T => {
  return containingDeep<T, U>(set);
};

/**
 *
 * @param s a string that should be at the beginning of the string we want to match
 *
 * @example
 * m.stringStartingWith("hello") // matches "hello world"
 * m.stringStartingWith("hello") // does not match "world" (missing hello at the beginning)
 */
export const stringStartingWith = <T, U extends string>(
  s: U | NoInfer<T>
): T => {
  return ProxyFactory<T>("startsWith", { original: s });
};

/**
 *
 * @param s a string that should be at the end of the string we want to match
 *
 * @example
 * m.stringEndingWith("world") // matches "hello world"
 * m.stringEndingWith("world") // does not match "hello" (missing world at the end)
 */
export const stringEndingWith = <T, U extends string>(s: U | NoInfer<T>): T => {
  return ProxyFactory<T>("endsWith", { original: s });
};

/**
 *
 * NOTE THAT IT WILL NOT MATCH NULL, Maps, Sets and Arrays.
 * You anyNullish(), anyMap(), anySet() and anyArray() instead.
 *
 * @example
 * m.anyObject() // matches { key: "value" }
 * m.anyObject() // does not match null
 * m.anyObject() // does not match new Map([["key", "value"]])
 * m.anyObject() // does not match [1, 2, 3]
 * m.anyObject() // does not match new Set([1, 2, 3])
 */
export const anyObject = <T, U>() => {
  return ProxyFactory<T>("any", { what: "object" });
};

/**
 * @example
 * m.anyArray() // matches [1, 2, 3]
 * m.anyArray() // matches []
 */
export const anyArray = <T, U>() => {
  return ProxyFactory<T>("any", { what: "array" });
};

/**
 * @example
 * m.anyFunction() // matches () => {}
 * m.anyFunction() // matches function() {}
 */
export const anyFunction = <T, U>() => {
  return ProxyFactory<T>("any", { what: "function" });
};

/**
 * @example
 * m.anyString() // matches "hello"
 * m.anyString() // matches ""
 */
export const anyString = <T, U>() => {
  return ProxyFactory<T>("any", { what: "string" });
};

/**
 * @example
 * m.anyNumber() // matches 1
 * m.anyNumber() // does not match "1"
 * m.anyNumber() // does not match NaN
 */
export const anyNumber = <T, U>() => {
  return ProxyFactory<T>("any", { what: "number" });
};

/**
 * @example
 * m.anyBoolean() // matches true
 * m.anyBoolean() // matches false
 * m.anyBoolean() // does not match "true", "false", 1, 0, null, undefined, "", {}
 */
export const anyBoolean = <T, U>() => {
  return ProxyFactory<T>("any", { what: "boolean" });
};

/**
 * @example
 * m.anyNullish() // matches null
 * m.anyNullish() // matches undefined
 */
export const anyNullish = <T, U>() => {
  return ProxyFactory<T>("any", { what: "nullish" });
};

/**
 * @example
 * m.anyFalsy() // matches false
 * m.anyFalsy() // matches null
 * m.anyFalsy() // matches undefined
 * m.anyFalsy() // matches 0
 */
export const anyFalsy = <T, U>() => {
  return ProxyFactory<T>("any", { what: "falsy" });
};

export const anyTruthy = <T, U>() => {
  return ProxyFactory<T>("any", { what: "truthy" });
};

/**
 * @example
 * m.anyMap() // matches new Map()
 * m.anyMap() // does not match {}
 */
export const anyMap = <T, U>() => {
  return ProxyFactory<T>("any", { what: "map" });
};

/**
 * @example
 * m.anySet() // matches new Set()
 * m.anySet() // does not match {}
 */
export const anySet = <T, U>() => {
  return ProxyFactory<T>("any", { what: "set" });
};

export const instanceOf = <T, U>(original: U) => {
  return ProxyFactory<T>("instanceOf", { class: original });
};

/**
 *
 * @param regexp a regular expression that the string should match
 *
 * @example
 * m.stringMatching(/hello/) // matches "hello world"
 * m.stringMatching(/hello/) // does not match "world" (missing hello)
 */
export const stringMatching = <T>(regexp: RegExp) => {
  return ProxyFactory<T>("matchesRegex", { regexp });
};

export const or = <T, U>(...args: U[]): T => {
  return ProxyFactory<T>("or_operator", { options: args });
};

function add(a: string, b: string): string;

function add(a: number, b: number): number;

function add(a: any, b: any): any {
  return a + b;
}

/**
 *
 * @param validationFunction Either a function that accepts a value and returns a boolean
 * @returns a matcher that will validate the actual value against the provided validation function
 *
 * @example
 * m.validate((value) => value > 0) // matches 1
 * m.validate((value) => value < 0) // does not match 1
 */
export function validates<T>(validationFunction: (value: T) => boolean): T;
/**
 *
 * @param validationFunction a Zod schema
 * @returns a matcher that will validate the actual value against the provided Zod schema
 *
 * @example
 * // Zod schema
 * const schema = z.number().int().positive()
 * m.validate(schema) // matches 1
 */
export function validates<T>(validationFunction: ZodSchema<any, any, any>): T;
export function validates<T>(
  validationFunction: ((value: T) => boolean) | ZodSchema<any, any, any>
): T {
  if (validationFunction instanceof ZodSchema) {
    return ProxyFactory<T>("isSchema", { schema: validationFunction });
  }

  return ProxyFactory<T>("validate", { validationFunction });
}

export const matchers = {
  isOneOf,
  unsafe,
  partial,
  objectContaining,
  arrayContaining,
  stringContaining,
  mapContaining,
  setContaining,
  objectContainingDeep,
  arrayContainingDeep,
  mapContainingDeep,
  setContainingDeep,
  stringStartingWith,
  stringEndingWith,
  instanceOf,
  stringMatching,
  or,
  validates,
};

export type NoInfer<T> = [T][T extends any ? 0 : never];
/**
 * Adapted from type-fest's PartialDeep
 */

export type PartialDeep<T> = T extends (...args: any[]) => any
  ? PartialDeepObject<T> | undefined
  : T extends object
  ? T extends ReadonlyArray<infer ItemType> // Test for arrays/tuples, per https://github.com/microsoft/TypeScript/issues/35156
    ? ItemType[] extends T // Test for arrays (non-tuples) specifically
      ? readonly ItemType[] extends T // Differentiate readonly and mutable arrays
        ? ReadonlyArray<PartialDeep<ItemType | undefined>>
        : Array<PartialDeep<ItemType | undefined>>
      : PartialDeepObject<T> // Tuples behave properly
    : PartialDeepObject<T>
  : T;

export type PartialDeepObject<ObjectType extends object> = {
  [KeyType in keyof ObjectType]?: PartialDeep<ObjectType[KeyType]>;
};
