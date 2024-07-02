/**
 * @param mock This is heavily inspired by the library @total-typescript/shoehorn
 * I just wanted a different API and a few more features so I decided to diverge and create my own
 *
 * Kudos to Matt Pococks for the inspiration
 */

export const isOneOf = <T, U>(options: U | NoInfer<T>[]): T => {
  return ProxyFactory<T>("isOneOf", { options: options });
};

export interface Parser {
  safeParse(value: any): { success: boolean };
}

export const schema = <T, U extends Parser>(mock: U | NoInfer<T>): T => {
  return ProxyFactory<T>("isSchema", { schema: mock });
};

export const unsafe = <T, U>(mock: U | NoInfer<T>): T => {
  return mock as T;
};

export const containing = <T, U extends any>(original: U | NoInfer<T>): T => {
  return ProxyFactory<T>("isContaining", { original });
};

export const objectContaining = <T, U>(mock: U | Partial<NoInfer<T>>): T => {
  return containing(mock);
};

export const arrayContaining = <T, U extends Array<any>>(
  mock: U | Partial<NoInfer<T>>
): T => {
  return containing(mock);
};

// Strings not functional yet
export const stringContaining = <T>(mock: string): T => {
  return containing(mock);
};

export const mapContaining = <T, U extends Map<string, any>>(
  mock: U | Partial<NoInfer<T>>
): T => {
  return containing(mock);
};

export const setContaining = <T, U extends Set<any>>(
  mock: U | Partial<NoInfer<T>>
): T => {
  return containing(mock);
};

export const objectContainingDeep = <T, U>(
  mock: U | PartialDeep<NoInfer<T>>
): T => {
  return containingDeep(mock);
};

export const arrayContainingDeep = <T, U extends Array<any>>(
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

export const stringStartingWith = <T, U extends string>(
  s: U | NoInfer<T>
): T => {
  return ProxyFactory<T>("startsWith", { original: s });
};

export const stringEndingWith = <T, U extends string>(s: U | NoInfer<T>): T => {
  return ProxyFactory<T>("endsWith", { original: s });
};

export const anyObject = <T, U>() => {
  return ProxyFactory<T>("any", { what: "object" });
};

const anyArray = <T, U>() => {
  return ProxyFactory<T>("any", { what: "array" });
};

const anyFunction = <T, U>() => {
  return ProxyFactory<T>("any", { what: "function" });
};

const anyString = <T, U>() => {
  return ProxyFactory<T>("any", { what: "string" });
};

const anyNumber = <T, U>() => {
  return ProxyFactory<T>("any", { what: "number" });
};

const anyBoolean = <T, U>() => {
  return ProxyFactory<T>("any", { what: "boolean" });
};

const anyNullish = <T, U>() => {
  return ProxyFactory<T>("any", { what: "nullish" });
};

const anyFalsy = <T, U>() => {
  return ProxyFactory<T>("any", { what: "falsy" });
};

const anyTruthy = <T, U>() => {
  return ProxyFactory<T>("any", { what: "truthy" });
};

const anyMap = <T, U>() => {
  return ProxyFactory<T>("any", { what: "map" });
};

const anySet = <T, U>() => {
  return ProxyFactory<T>("any", { what: "set" });
};

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
