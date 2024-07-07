/**
 * @param mock This is heavily inspired by the library @total-typescript/shoehorn
 * I just wanted a different API and a few more features so I decided to diverge and create my own
 *
 * Kudos to Matt Pococks for the inspiration
 */

/**
 *
 * @param options an array of options of which one element should be the value we want to match
 *
 * @example
 * isOneOf([1, 2, 3]) // matches 1
 * isOneOf([m.schema(z.number().int().positive())]) // matches 1
 * isOneOf([m.schema(z.number().int().positive())]) // does not match (-1)
 */
export const isOneOf = <T, U>(options: U | NoInfer<T>[]): T => {
  return ProxyFactory<T>("isOneOf", { options: options });
};

export interface Schema {
  safeParse(value: any): { success: boolean };
}

/**
 *
 * @param schema a schema object that has a safeParse method.
 *
 * Use this to validate a value against a schema. zod schemas are compliant, but you can create your own,
 * or adapt existing ones to fit the schema interface.
 *
 * export interface Schema {
 *  safeParse(value: any): { success: boolean };
 * }
 *
 * @example
 * // zod schema
 * const schema = z.number().int().positive()
 * m.schema(z.number().int().positive()) // matches 1
 *
 * @example
 * // Custom matchers
 * m.schema({ safeParse: (_a) => ({ success: true }) }) // matches anything
 * m.schema({ safeParse: (a) => { return joi.string().uuid().validate(a) } }) // matches a uuid
 */
export const schema = <T, U extends Schema>(schema: U | NoInfer<T>): T => {
  return ProxyFactory<T>("isSchema", { schema });
};

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

export const containing = <T, U extends any>(original: U | NoInfer<T>): T => {
  return ProxyFactory<T>("isContaining", { original });
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
 *
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

export const arrayContainingDeep = <T, U extends Array<T>>(
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

export const containingDeep = <T, U>(mock: U | NoInfer<T>): T => {
  return ProxyFactory<T>("isContainingDeep", { ...mock, original: mock });
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
 * You any.nullish(), any.map(), any.set() and any.array() instead.
 *
 * @example
 * m.any.object() // matches { key: "value" }
 * m.any.object() // does not match null
 * m.any.object() // does not match new Map([["key", "value"]])
 * m.any.object() // does not match [1, 2, 3]
 * m.any.object() // does not match new Set([1, 2, 3])
 */
export const anyObject = <T, U>() => {
  return ProxyFactory<T>("any", { what: "object" });
};

/**
 * @example
 * m.any.array() // matches [1, 2, 3]
 * m.any.array() // matches []
 */
const anyArray = <T, U>() => {
  return ProxyFactory<T>("any", { what: "array" });
};

/**
 * @example
 * m.any.function() // matches () => {}
 * m.any.function() // matches function() {}
 */
const anyFunction = <T, U>() => {
  return ProxyFactory<T>("any", { what: "function" });
};

/**
 * @example
 * m.any.string() // matches "hello"
 * m.any.string() // matches ""
 */
const anyString = <T, U>() => {
  return ProxyFactory<T>("any", { what: "string" });
};

/**
 * @example
 * m.any.number() // matches 1
 * m.any.number() // does not match "1"
 * m.any.number() // does not match NaN
 */
const anyNumber = <T, U>() => {
  return ProxyFactory<T>("any", { what: "number" });
};

/**
 * @example
 * m.any.boolean() // matches true
 * m.any.boolean() // matches false
 * m.any.boolean() // does not match "true", "false", 1, 0, null, undefined, "", {}
 */
const anyBoolean = <T, U>() => {
  return ProxyFactory<T>("any", { what: "boolean" });
};

/**
 * @example
 * m.any.nullish() // matches null
 * m.any.nullish() // matches undefined
 */
const anyNullish = <T, U>() => {
  return ProxyFactory<T>("any", { what: "nullish" });
};

/**
 * @example
 * m.any.falsy() // matches false
 * m.any.falsy() // matches null
 * m.any.falsy() // matches undefined
 * m.any.falsy() // matches 0
 */
const anyFalsy = <T, U>() => {
  return ProxyFactory<T>("any", { what: "falsy" });
};

const anyTruthy = <T, U>() => {
  return ProxyFactory<T>("any", { what: "truthy" });
};

/**
 * @example
 * m.any.map() // matches new Map()
 * m.any.map() // does not match {}
 */
const anyMap = <T, U>() => {
  return ProxyFactory<T>("any", { what: "map" });
};

/**
 * @example
 * m.any.set() // matches new Set()
 * m.any.set() // does not match {}
 */
const anySet = <T, U>() => {
  return ProxyFactory<T>("any", { what: "set" });
};

const instanceOf = <T, U>(original: U) => {
  return ProxyFactory<T>("instanceOf", { class: original });
};

/**
 *
 * @param regexp a regular expression that the string should match
 *
 * @example
 * m.stringMatchingRegex(/hello/) // matches "hello world"
 * m.stringMatchingRegex(/hello/) // does not match "world" (missing hello)
 */
export const stringMatchingRegex = <T>(regexp: RegExp) => {
  return ProxyFactory<T>("matchesRegex", { regexp });
};

function ProxyFactory<T>(suffix: string, content: Record<string, any>) {
  return new Proxy(
    {
      [`mockit__${suffix}`]: true,
      ...content,
    },
    {
      get(target, prop) {
        // @ts-expect-error - I don't know how to fix this yet
        return target[prop];
      },
    }
  ) as any as T;
}

export const or = <T, U>(...args: U[]): T => {
  return ProxyFactory<T>("or_operator", { options: args });
};

export const any = {
  object: anyObject,
  array: anyArray,
  function: anyFunction,
  string: anyString,
  number: anyNumber,
  boolean: anyBoolean,
  nullish: anyNullish,
  falsy: anyFalsy,
  truthy: anyTruthy,
  map: anyMap,
  set: anySet,
};

export const matchers = {
  isOneOf,
  schema,
  unsafe,
  containing,
  objectContaining,
  arrayContaining,
  stringContaining,
  mapContaining,
  setContaining,
  objectContainingDeep,
  arrayContainingDeep,
  mapContainingDeep,
  setContainingDeep,
  containingDeep,
  stringStartingWith,
  stringEndingWith,
  instanceOf,
  any,
  stringMatchingRegex,
  or,
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
