import { mockFunction } from "./mockFunction";

class TypeBasedMock {
  constructor(functionsToMock: string[]) {
    for (const func of functionsToMock) {
      this[func] = mockFunction(() => {});
    }
  }
}

export function mockInterface<T>(...functionsToMock: Array<keyof T>): T {
  const mock = new TypeBasedMock(functionsToMock as string[]);
  return mock as T;
}

export function mockType<T>(...functionsToMock: Array<keyof T>): T {
  return mockInterface<T>(...functionsToMock);
}
