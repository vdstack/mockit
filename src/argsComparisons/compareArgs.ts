import { z } from "zod";
import { hasher } from "../hasher";

export function compareArgs(actual: Array<any>, expected: Array<any>) {
  if (actual.length !== expected.length) {
    return false;
  }

  return actual.every((arg, index) => {
    return hasher.hash(arg) === hasher.hash(expected[index]);
  });
}
