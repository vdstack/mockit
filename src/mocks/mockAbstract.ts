import { mockFunction } from "./mockFunction";
import { AbstractClass } from "../types";

export class AbstractClassMock<T> {
  constructor(propertiesToMock: Array<keyof T>) {
    for (const property of propertiesToMock) {
      const fMock = mockFunction(() => {});
      this[property as string] = fMock;
    }
  }
}

export function mockAbstract<T>(
  _original: AbstractClass<T>, // it's here to activate the generic type
  propertiesToMock: Array<keyof T>
): T {
  return new AbstractClassMock<T>(propertiesToMock) as T;
}
