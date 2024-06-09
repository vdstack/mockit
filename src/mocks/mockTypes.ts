import { CommonSpawnOptions } from "child_process";
import { AbstractClass, Class } from "../types";
import { mockFunction } from "./mockFunction";

export function mockInterface<T>(...functionsToMock: Array<keyof T | void>): T {
  return mockType<T>() as T;
}

export function mockType<T>(): T {
  return new Proxy({} as any, {
    get(target, prop, receiver) {
      if (prop === "isMockitMock") {
        // Useful to reset a whole mock instead of just a function
        // Will be used in the future
        return true;
      }

      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      if (typeof prop === "string") {
        const mockedFunction = mockFunction(() => {});
        Reflect.set(target, prop, mockedFunction, receiver);
        return mockedFunction;
      }
    },
  }) as T;
}

export function Mock<T>(_param: Class<T> | AbstractClass<T> | T): T {
  if (typeof _param === "function") {
    console.log(_param);
    try {
      // Issue in JS is that both functions & classes have "function" as typeof
      // To differentiate, we leverage the classes cannot be called as functions.
      // This is a hacky way to differentiate between the two. But it works.
      // @ts-expect-error Note that you can actually instanciate functions in JS, like a class. Strange but true.
      new _param();
      return Mock(_param) as T;
    } catch (err) {
      // @ts-expect-error
      return mockFunction(_param) as T;
    }
  }
  return new Proxy({} as any, {
    get(target, prop, receiver) {
      if (prop === "isMockitMock") {
        // Useful to reset a whole mock instead of just a function
        // Will be used in the future
        return true;
      }

      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      if (typeof prop === "string") {
        const mockedFunction = mockFunction(() => {});
        Reflect.set(target, prop, mockedFunction, receiver);
        return mockedFunction;
      }
    },
  }) as T;
}
