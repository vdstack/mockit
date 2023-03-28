import { resetProxy } from "../internal/functionMock";
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

    resetProxy(m);
  }
}
