import { when } from "../../behaviours";
import { containingDeep } from "../../behaviours/matchers";
import { Mock, resetCompletely } from "../../mocks";

describe("behaviour setup: partial", () => {
  it("should partially match the arguments", () => {
    function toTest(...args: any[]) {
      return "hello world";
    }

    const mock = Mock(toTest);
    when(mock).isCalled.thenReturn("default return value");

    expect(
      mock({
        name: "Victor",
        age: 20,
        identity: {
          id: 1,
          email: "1@1.1",
        },
      })
    ).toBe("default return value");

    when(mock)
      .isCalledWith({ identity: { id: 1 } })
      .thenReturn("hello world Victor");

    // Here, we're not passing an object containing { identity: { id: 1 } }, so it should not match
    // Hence, the default return value should be returned
    expect(
      mock({ name: "Victor", age: 20, identity: { id: 1, email: "1@1.1" } })
    ).toBe("default return value");

    resetCompletely(mock);
    when(mock).isCalled.thenReturn("default return value");

    // Now, we're using partialDeep to setup the behaviour
    when(mock)
      .isCalledWith(containingDeep({ identity: { id: 1 } }))
      .thenReturn("hello world 1");

    expect(
      mock({ name: "Victor", age: 20, identity: { id: 1, email: "1@1.1" } })
    ).toBe("hello world 1");
    expect(mock({ identity: { id: 1 } })).toBe("hello world 1");

    // Just in case, this should not match (we did not pass the id: 1 in the identity object)
    expect(mock({ name: "Victor" })).toBe("default return value");
  });
});
