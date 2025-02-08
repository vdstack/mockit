import { Assertion } from "./assertion";

export function expect<T>(actual: T) {
  return new Assertion(actual);
}
