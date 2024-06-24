import { when } from "../../behaviours";
import { deepPartial } from "../../behaviours/constructs";
import { Mock, Reset } from "../../mocks";

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

    Reset.completely(mock);
    when(mock).isCalled.thenReturn("default return value");

    // Now, we're using deepPartial to setup the behaviour
    when(mock)
      .isCalledWith(deepPartial({ identity: { id: 1 } }))
      .thenReturn("hello world 1");

    expect(
      mock({ name: "Victor", age: 20, identity: { id: 1, email: "1@1.1" } })
    ).toBe("hello world 1");
    expect(mock({ identity: { id: 1 } })).toBe("hello world 1");

    // Just in case, this should not match (we did not pass the id: 1 in the identity object)
    expect(mock({ name: "Victor" })).toBe("default return value");
  });
});

// TODO: we need to split a bit more the new helpers
// for now we have partial - deepPartial
// It should be:
// - partial: will work if you provide some of the properties.
// - deepPartial: will work if you provide some of the properties, and will work for nested objects as well.
// - matching: will work if you provide some properties that match. // Very lax, for example empty objects will match
// - deepMatching: will work if you provide some properties that match, and will work for nested objects as well.
