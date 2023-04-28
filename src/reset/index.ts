import {
  resetProxy,
  resetProxyBehaviour,
  resetProxyCallHistory,
  resetProxySuppositions,
} from "../internal/functionMock";
import { MockGetters } from "../internal/functionMock/accessors";

export function reset<T>(...mocks: T[]): void {
  for (const m of mocks) {
    const suppositionsRegistry = MockGetters(m).suppositionsRegistry;

    if (suppositionsRegistry == null) {
      // We're in the class or abstract class or interface mock case
      const properties = Object.getOwnPropertyNames(m);
      for (const property of properties) {
        resetProxy(m[property]); // <--- We reset each property (function mock) individually
      }
      return;
    }

    resetProxy(m); // <--- We reset the function mock
  }
}

export function resetBehaviour<T>(...mocks: T[]): void {
  for (const m of mocks) {
    const suppositionsRegistry = MockGetters(m).suppositionsRegistry;

    if (suppositionsRegistry == null) {
      // We're in the class or abstract class or interface mock case
      const properties = Object.getOwnPropertyNames(m);
      for (const property of properties) {
        resetProxyBehaviour(m[property]); // <--- We reset each property (function mock) individually
      }
      return;
    }

    resetProxyBehaviour(m); // <--- We reset the behaviour
  }
}

export function resetCallHistory<T>(...mocks: T[]): void {
  for (const m of mocks) {
    const suppositionsRegistry = MockGetters(m).suppositionsRegistry;

    if (suppositionsRegistry == null) {
      // We're in the class or abstract class or interface mock case
      const properties = Object.getOwnPropertyNames(m);
      for (const property of properties) {
        resetProxyCallHistory(m[property]); // <--- We reset each property (function mock) individually
      }
      return;
    }

    resetProxyCallHistory(m); // <--- We reset the call history
  }
}

export function resetSuppositions<T>(...mocks: T[]): void {
  for (const m of mocks) {
    const suppositionsRegistry = MockGetters(m).suppositionsRegistry;

    if (suppositionsRegistry == null) {
      // We're in the class or abstract class or interface mock case
      const properties = Object.getOwnPropertyNames(m);
      for (const property of properties) {
        resetProxySuppositions(m[property]); // <--- We reset each property (function mock) individually
      }
      return;
    }

    resetProxySuppositions(m); // <--- We reset the suppositions
  }
}

export class Reset {
  static mocks(...mocks: any[]) {
    reset(...mocks);
  }

  static behaviourOf(...mocks: any[]) {
    resetBehaviour(...mocks);
  }

  static historyOf(...mocks: any[]) {
    resetCallHistory(...mocks);
  }

  static suppositionsOn(...mocks: any[]) {
    resetSuppositions(...mocks);
  }
}
