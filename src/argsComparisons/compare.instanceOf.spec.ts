import { z } from "zod";
import { matchers } from "../behaviours/matchers";
import { compare } from "./compare";

class User {}
class SubUser extends User {}
class Car {}

describe("compare.instanceOf", () => {
  it("should be compare instances", () => {
    expect(compare(new User(), matchers.instanceOf(User))).toBe(true);

    expect(compare(new SubUser(), matchers.instanceOf(User))).toBe(true);
    expect(compare(new User(), matchers.instanceOf(SubUser))).toBe(false);

    expect(compare(new User(), matchers.instanceOf(Car))).toBe(false);
  });
});
