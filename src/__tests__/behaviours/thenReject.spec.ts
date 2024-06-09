import { Mock, when } from "../..";

describe("thenReject", () => {
  it("should reject any value provided", () => {
    const mock = Mock(async () => {});
    when(mock).isCalled.thenReject(new Error("yo"));
    expect(() => mock()).rejects.toThrow("yo");
  });

  it("should combine default and custom behaviours", () => {
    const mock = Mock(async (...args: any[]) => {});
    when(mock).isCalled.thenReject(new Error("yo"));
    when(mock).isCalledWith(2).thenReject(new Error("Victor"));

    expect(() => mock()).rejects.toThrow("yo");
    expect(() => mock(2)).rejects.toThrow("Victor");
  });
});
