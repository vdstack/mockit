import { when } from "../../behaviours";
import { partialDeep, partial } from "../../behaviours/constructs";
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

    // when(mock)
    //   .isCalledWith({ identity: { id: 1 } })
    //   .thenReturn("hello world Victor");

    // // Here, we're not passing exactly { identity: { id: 1 } }, so it should not match
    // // Hence, the default return value should be returned
    // expect(
    //   mock({ name: "Victor", age: 20, identity: { id: 1, email: "1@1.1" } })
    // ).toBe("default return value");

    Reset.completely(mock);
    when(mock).isCalled.thenReturn("default return value");

    // Now, we're using partial to setup the behaviour
    when(mock)
      .isCalledWith(partial({ identity: { id: 1, email: "1@1.1" } }))
      .thenReturn("hello world 1");

    // This should not match, because we did not pass the email
    expect(mock({ name: "Victor", age: 20, identity: { id: 1 } })).toBe(
      "default return value"
    );
    // This should not match, because we did not pass the email as well
    expect(mock({ identity: { id: 1 } })).toBe("default return value");

    // This should match, becaused we passed the whole identity object
    expect(
      mock({ name: "Victor", age: 20, identity: { id: 1, email: "1@1.1" } })
    ).toBe("hello world 1");

    // This as well
    expect(mock({ identity: { id: 1, email: "1@1.1" } })).toBe("hello world 1");

    // Just in case, this should not match (we did not pass the id: 1 in the identity object)
    expect(mock({ name: "Victor" })).toBe("default return value");
  });
});
