import { Mock, when } from "../..";

describe("thenReject", () => {
  it("should reject any value provided", async () => {
    const mock = Mock(async () => {});
    when(mock).isCalled.thenReject(new Error("yo"));
    expect.assertions(1);

    // I'm using bun but it's not iso with jest => no expect().rejects :'(
    try {
      await mock();
    } catch (e) {
      expect(e).toEqual(new Error("yo"));
    }
  });

  it("should combine default and custom behaviours", async () => {
    const mock = Mock(async (...args: any[]) => {});
    when(mock).isCalled.thenReject(new Error("yo"));
    when(mock).isCalledWith(2).thenReject(new Error("Victor"));

    expect.assertions(2);
    try {
      await mock();
    } catch (e) {
      expect(e).toEqual(new Error("yo"));
    }

    try {
      await mock(2);
    } catch (e) {
      expect(e).toEqual(new Error("Victor"));
    }
  });
});
