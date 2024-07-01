import { z } from "zod";
import { when } from "../../behaviours";
import { objectContaining, schema } from "../../behaviours/matchers";
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
        objectContaining({
          identity: {
            id: 1,
            uuid: schema(z.string().uuid()),
          },
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
  });
});
