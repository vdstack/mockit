import { mockFunction, when } from "../../../v3";

describe("thenReject", () => {
  it("should reject any value provided", () => {
    const mock = mockFunction(async () => {});
    when(mock).isCalled.thenReject(new Error("yo"));
    expect(() => mock()).rejects.toThrow("yo");
  });
});
