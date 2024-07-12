import { z } from "zod";
import { NewBehaviourParam } from "./behaviours/behaviours";

export type AbstractClass<T> = abstract new (...args: any[]) => T;
export type Class<T> = new (...args: any[]) => T;
export type BuildMethodsMap<Class, V> = {
  [K in keyof Class as Class[K] extends V ? K : never]: Class[K];
};

export type GetClassMethods<Class> = keyof BuildMethodsMap<Class, Function>;

export type Call<T extends (...args: any) => any> = {
  args: Parameters<T>;
  date: Date;
  behaviour: NewBehaviourParam<T>;
  isDefault: boolean;
  matched?: any[];
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
