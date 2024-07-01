/**
 * @param mock This is heavily inspired by the library @total-typescript/shoehorn
 * I just wanted a different API and a few more features so I decided to diverge and create my own
 *
 * Kudos to Matt Pococks for the inspiration
 */

export const isOneOf = <T>(mock: NoInfer<T>[]): T => {
  return new Proxy(
    {
      mockit__isOneOf: true,
      options: mock,
    },
    {
      get(target, prop) {
        return target[prop];
      },
    }
  ) as any;
};

export interface Parser {
  safeParse(value: any): { success: boolean };
}

export const schema = <T, U extends Parser>(mock: U | NoInfer<T>): T => {
  return new Proxy(
    {
      schema: mock,
      mockit__isSchema: true,
    },
    {
      get(target, prop) {
        return target[prop];
      },
    }
  ) as T;
};

export const unsafe = <T, U>(mock: U | NoInfer<T>): T => {
  return mock as T;
};

export const containing = <T>(mock: Partial<NoInfer<T>>): T => {
  return new Proxy(
    {
      ...mock,
      mockit__isContaining: true,
      original: mock,
    },
    {
      get(target, prop) {
        return target[prop];
      },
    }
  ) as any;
};

export const objectContaining = <T>(mock: Partial<NoInfer<T>>): T => {
  return containing(mock);
};

export const arrayContaining = <T>(mock: Partial<NoInfer<T>>): T => {
  return containing(mock);
};

// Strings not functional yet
export const stringContaining = <T>(mock: Partial<NoInfer<T>>): T => {
  return containing(mock);
};

export const mapContaining = <T>(mock: Partial<NoInfer<T>>): T => {
  return containing(mock);
};

export const setContaining = <T>(mock: Partial<NoInfer<T>>): T => {
  return containing(mock);
};

export const objectContainingDeep = <T>(mock: PartialDeep<NoInfer<T>>): T => {
  return containingDeep(mock);
};

export const arrayContainingDeep = <T>(mock: PartialDeep<NoInfer<T>>): T => {
  return containingDeep(mock);
};

export const mapContainingDeep = <T>(mock: PartialDeep<NoInfer<T>>): T => {
  return containingDeep(mock);
};

export const setContainingDeep = <T>(mock: PartialDeep<NoInfer<T>>): T => {
  return containingDeep(mock);
};

export const containingDeep = <T>(mock: PartialDeep<NoInfer<T>>): T => {
  return new Proxy(
    {
      ...mock,
      mockit__isContainingDeep: true,
      original: mock,
    },
    {
      get(target, prop) {
        return target[prop];
      },
    }
  ) as any;
};

export const startsWith = <T, U extends string>(s: U | NoInfer<T>): T => {
  return new Proxy(
    {
      mockit__startsWith: true,
      original: s,
    },
    {
      get(target, prop) {
        return target[prop];
      },
    }
  ) as any;
};

export const endsWith = <T>(string: string) => {
  return ProxyFactory<T>("endsWith", { original: string });
};

export const anyObject = <T>() => {
  return ProxyFactory<T>("any", { what: "object" });
};

const anyArray = <T>() => {
  return ProxyFactory<T>("any", { what: "array" });
};

const anyFunction = <T>() => {
  return ProxyFactory<T>("any", { what: "function" });
};

const anyString = <T>() => {
  return ProxyFactory<T>("any", { what: "string" });
};

const anyNumber = <T>() => {
  return ProxyFactory<T>("any", { what: "number" });
};

const anyBoolean = <T>() => {
  return ProxyFactory<T>("any", { what: "boolean" });
};

const anyNullish = <T>() => {
  return ProxyFactory<T>("any", { what: "nullish" });
};

const anyFalsy = <T>() => {
  return ProxyFactory<T>("any", { what: "falsy" });
};

const anyTruthy = <T>() => {
  return ProxyFactory<T>("any", { what: "truthy" });
};

const anyMap = <T>() => {
  return ProxyFactory<T>("any", { what: "map" });
};

const anySet = <T>() => {
  return ProxyFactory<T>("any", { what: "set" });
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
