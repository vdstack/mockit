import { compare } from "./compare";
import { m } from "../../";

class User {}
class SubUser extends User {}
class Car {}

describe("compare.instanceOf", () => {
  it("should be compare instances", () => {
    expect(compare(new User(), m.instanceOf(User))).toBe(true);

    expect(compare(new SubUser(), m.instanceOf(User))).toBe(true);
    expect(compare(new User(), m.instanceOf(SubUser))).toBe(false);

    expect(compare(new User(), m.instanceOf(Car))).toBe(false);
  });
});
