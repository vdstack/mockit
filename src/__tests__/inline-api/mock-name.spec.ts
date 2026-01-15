import { fn } from "../..";

describe("mockName / getMockName", () => {
  it("should have default name", () => {
    expect(fn().getMockName()).toBe("mockit.fn()");
  });

  it("should set custom name", () => {
    const mock = fn().mockName("fetchUser");
    expect(mock.getMockName()).toBe("fetchUser");
  });

  it("should be chainable with other methods", () => {
    const mock = fn().mockName("myMock").mockReturnValue(42);
    expect(mock()).toBe(42);
    expect(mock.getMockName()).toBe("myMock");
  });

  it("should allow renaming", () => {
    const mock = fn().mockName("first");
    expect(mock.getMockName()).toBe("first");

    mock.mockName("second");
    expect(mock.getMockName()).toBe("second");
  });
});
