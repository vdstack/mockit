import { mockFunction } from "./mockFunction";
import { AbstractClass } from "../types";
import { ProxyMockBase } from "./mockTypes";

export class AbstractClassMock<T> {
  constructor(propertiesToMock: Array<keyof T>) {
    for (const property of propertiesToMock) {
      const fMock = mockFunction(() => {});
      this[property as string] = fMock;
    }
  }
}

export function mockAbstract<T>(
  _original: AbstractClass<T> // it's here to activate the generic type
): T {
  // return new AbstractClassMock<T>(propertiesToMock) as T;
  return ProxyMockBase<T>() as T;
}
