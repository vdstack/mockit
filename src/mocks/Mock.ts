import { AbstractClass, Class } from "../types";
import { mockFunction } from "./mockFunction";
import { resetBehaviourOf, resetHistoryOf } from "./mockFunction.reset";

/**
 * This function is used to create a mock of classes, abstract classes, functions, objects,
 * types and interfaces.
 * For types and interfaces, pass them in the generic slot to create a mock that respects the type.
 * @param _param anything that can be mocked: class, abstract class or function
 * @returns a mock of the provided parameter
 *
 * @example Class, Object, Abstract Class and Function
 * ```ts
 * const mockedVersion = Mock(original);
 * // You can now use the mocked version as if it was the original
 * ```
 * @example Types and Interfaces
 * ```ts
 * type MyType = {
 *   doSomething(): void;
 *   doSomethingElse(): string;
 * };
 *
 * const mockedType = Mock<MyType>();
 * // You can now use the mocked version as if it was the original
 * mockedType.doSomething(); // returns undefined
 * ```
 */
export function Mock<T>(_param: Class<T> | AbstractClass<T> | T | void): T {
  if (typeof _param === "function") {
    // Issue in JS is that both functions & classes have "function" as typeof
    if (isClass(_param)) {
      return ProxyMockBase<T>(_param);
    }

    // @ts-expect-error
    return mockFunction(_param) as T;
  }
  return ProxyMockBase<T>(_param);
}

function ProxyMockBase<T>(
  _param: Class<T> | AbstractClass<T> | T | void = undefined
): T {
  return new Proxy({} as any, {
    get(target, prop, receiver) {
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
      if (prop === "resetBehaviourOf") {
        for (const key in target) {
          if (Reflect.get(target[key], "isMockitMock")) {
            resetBehaviourOf(target[key]);
          }
        }
        return true;
      }

      if (prop === "resetHistoryOf") {
        for (const key in target) {
          if (Reflect.get(target[key], "isMockitMock")) {
            resetHistoryOf(target[key]);
          }
        }
        return true;
      }

      return false;
    },
  }) as T;
}

// Source: https://stackoverflow.com/questions/30758961/how-to-check-if-a-variable-is-an-es6-class-declaration
// is "class" or "function"?
function isClass(obj: Function) {
  // if not a function, return false.
  if (typeof obj !== "function") return false;

  // ⭐ is a function, has a `prototype`, and can't be deleted!

  // ⭐ although a function's prototype is writable (can be reassigned),
  //   it's not configurable (can't update property flags), so it
  //   will remain writable.
  //
  // ⭐ a class's prototype is non-writable.
  //
  // Table: property flags of function/class prototype
  // ---------------------------------
  //   prototype  write  enum  config
  // ---------------------------------
  //   function     v      .      .
  //   class        .      .      .
  // ---------------------------------
  const descriptor = Object.getOwnPropertyDescriptor(obj, "prototype");

  // ❗functions like `Promise.resolve` do have NO `prototype`.
  //   (I have no idea why this is happening, sorry.)
  if (!descriptor) return false;

  return !descriptor.writable;
}
