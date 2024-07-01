/**
 * @param mock This is heavily inspired by the library @total-typescript/shoehorn
 * I just wanted a different API and a few more features so I decided to diverge and create my own
 * 
 * Kudos to Matt Pococks for the inspiration
 */

export const partial = <T>(mock: Partial<NoInfer<T>>): T => {
  return new Proxy(
    {
      ...mock,
      mockit__isPartial: true,
      original: mock,
    },
    {
      get(target, prop) {
        return target[prop];
      },
    }
  ) as any;
};

export const partialDeep = <T>(mock: PartialDeep<NoInfer<T>>): T => {
  return new Proxy(
    {
      ...mock,
      mockit__isPartialDeep: true,
      original: mock,
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
}

export const setContaining = <T>(mock: Partial<NoInfer<T>>): T => {
  return containing(mock);
}

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
}

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
