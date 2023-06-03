import { mockFunction } from "../../mockit";
import { verifyThat } from "../../suppose/verifyThat";

function hello(..._args: any[]) {}

describe("Verify that", () => {
  it("should be able to verify that a function has been called", () => {
    const mock = mockFunction(hello);

    expect(() => verifyThat(mock).wasCalled()).toThrow();
    mock();
    verifyThat(mock).wasCalled();
  });
});
