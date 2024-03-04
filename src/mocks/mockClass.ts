import { z } from "zod";

import type { Class, GetClassMethods } from "../types";
import { mockFunction } from "./mockFunction";

const functionSchema = z.function();

export class ConcreteClassMock<T> {
  constructor(original: Class<T>) {
    const properties = Object.getOwnPropertyNames(
      original.prototype
    ) as GetClassMethods<T>[];

    const instance = new original();
    const methods = properties.filter(
      (method) =>
        method !== "constructor" &&
        functionSchema.safeParse(instance[method]).success
    );

    for (const method of methods) {
      const fMock = mockFunction(() => {});
      this[method as string] = fMock;
    }
  }
}

export function mockClass<T>(_original: Class<T>): T {
  return new ConcreteClassMock<T>(_original) as T;
}
