import { AbstractClass, Class } from "../types";
import { mockFunction } from "./mockFunction";
import { resetBehaviour, resetHistory } from "./mockFunction.reset";

/**
 * This function is used to create a mock of a class, abstract class or function.
 * You can also pass an interface / type in generic to create a mock of it.
 * @param _param anything that can be mocked: class, abstract class or function
 * @returns a mock of the provided parameter
 */
export function Mock<T>(_param: Class<T> | AbstractClass<T> | T | void): T {
  if (typeof _param === "function") {
    try {
      // Issue in JS is that both functions & classes have "function" as typeof
      // To differentiate, we leverage the classes cannot be called as functions.
      // This is a hacky way to differentiate between the two. But it works.
      // @ts-expect-error Note that you can actually instanciate functions in JS, like a class. Strange but true.
      _param();
      // @ts-expect-error
      return mockFunction(_param) as T;
    } catch (err) {
      // You should be here if the function call failed, hence implying that it's a class
      return ProxyMockBase<T>();
    }
  }
  return ProxyMockBase<T>();
}

function ProxyMockBase<T>(): T {
  return new Proxy(
    {
      // Here we could store public properties of mock structure eventually
      // (visible stuff in console.log for example)
    } as any,
    {
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
      set(target, prop, _value, _receiver) {
        if (prop === "resetBehaviour") {
          for (const key in target) {
            if (Reflect.get(target[key], "isMockitMock")) {
              resetBehaviour(target[key]);
            }
          }
          return true;
        }

        if (prop === "resetHistory") {
          for (const key in target) {
            if (Reflect.get(target[key], "isMockitMock")) {
              resetHistory(target[key]);
            }
          }
          return true;
        }
      },
    }
  ) as T;
}
