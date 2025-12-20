import { Mock, fn } from "../..";

describe("mockRestore", () => {
  it("should restore original implementation", () => {
    const original = (x: number) => x * 2;
    const mock = Mock(original).mockReturnValue(99);

    expect(mock(5)).toBe(99);
    mock.mockRestore();
    expect(mock(5)).toBe(10);
  });

  it("should clear calls", () => {
    const mock = Mock((x: number) => x);
    mock(1);
    mock(2);

    mock.mockRestore();

    expect(mock.calls).toHaveLength(0);
  });

  it("should clear once behaviours", () => {
    const mock = Mock((x: number) => x)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2);

    mock.mockRestore();

    expect(mock(5)).toBe(5); // original, not 1
  });

  it("should be chainable", () => {
    const mock = Mock((x: number) => x);
    expect(mock.mockRestore()).toBe(mock);
  });

  it("should return undefined for fn() since no original", () => {
    const mock = fn().mockReturnValue(42);
    mock.mockRestore();

    // fn() has no original, so Preserve behaviour returns undefined
    expect(mock()).toBeUndefined();
  });
});
