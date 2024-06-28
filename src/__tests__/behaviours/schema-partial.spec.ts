import { z } from "zod";
import { when } from "../../behaviours";
import { partial, schema } from "../../behaviours/constructs";
import { Mock } from "../../mocks";
import { randomUUID } from "crypto";

describe("behaviour setup: schema in partial", () => {
  function toTest(...args: any[]) {
    return "hello world";
  }

  it("should match schema when placed deep in a partial", () => {
    const mock = Mock(toTest);
    when(mock).isCalled.thenReturn("default return value");

    when(mock)
      .isCalledWith(
        partial({
          identity: {
            id: 1,
            uuid: schema(z.string().uuid()),
          },
          name: "Victor",
          age: 20,
        })
      )
      .thenReturn("ding ding ding");

    expect(
      mock({
        identity: {
          id: 1,
          uuid: randomUUID(),
        },
      })
    ).toBe("ding ding ding");

    expect(
      mock({
        identity: {
          id: 1,
          uuid: "not a uuid",
        },
      })
    ).toBe("default return value");

    expect(
      mock({
        identity: {
          id: 1,
          uuid: randomUUID(),
        },
        invalidKey: "invalid value", // this is not part of the partial object passed as a setup => should not match
      })
    ).toBe("default return value");
  });
});
