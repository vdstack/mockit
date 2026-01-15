import { fn, m } from "../..";

describe("fn() - standalone mock function (like jest.fn())", () => {
  describe("Basic usage", () => {
    it("should create a mock function that returns undefined by default", () => {
      const mock = fn();
      expect(mock()).toBe(undefined);
    });

    it("should be callable via m.fn()", () => {
      const mock = m.fn();
      expect(mock()).toBe(undefined);
    });

    it("should accept a custom implementation and use it as default behavior", () => {
      const mock = fn((x: number) => x * 2);
      expect(mock(5)).toBe(10);
      expect(mock(3)).toBe(6);

      // Can still override with mockReturnValue
      mock.mockReturnValue(42);
      expect(mock(5)).toBe(42);
    });
  });

  describe("Chainable methods", () => {
    it("should support mockReturnValue", () => {
      const mock = fn();
      mock.mockReturnValue(42);
      expect(mock()).toBe(42);
      expect(mock()).toBe(42);
    });

    it("should support mockReturnValueOnce", () => {
      const mock = fn();
      mock.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValue(99);
      expect(mock()).toBe(1);
      expect(mock()).toBe(2);
      expect(mock()).toBe(99);
      expect(mock()).toBe(99);
    });

    it("should support mockResolvedValue", async () => {
      const mock = fn<() => Promise<number>>();
      mock.mockResolvedValue(42);
      expect(await mock()).toBe(42);
    });

    it("should support mockRejectedValue", async () => {
      const mock = fn<() => Promise<number>>();
      mock.mockRejectedValue(new Error("fail"));
      await expect(mock()).rejects.toThrow("fail");
    });

    it("should support mockImplementation", () => {
      const mock = fn<(x: number) => number>();
      mock.mockImplementation((x) => x * 3);
      expect(mock(5)).toBe(15);
    });
  });

  describe("Call tracking", () => {
    it("should track calls", () => {
      const mock = fn<(x: number, y: string) => void>();
      mock(1, "a");
      mock(2, "b");
      mock(3, "c");

      expect(mock.calls.length).toBe(3);
      expect(mock.calls[0].args).toEqual([1, "a"]);
      expect(mock.calls[1].args).toEqual([2, "b"]);
      expect(mock.calls[2].args).toEqual([3, "c"]);
    });

    it("should support mockClear", () => {
      const mock = fn();
      mock();
      mock();
      expect(mock.calls.length).toBe(2);

      mock.mockClear();
      expect(mock.calls.length).toBe(0);
    });

    it("should support mockReset", () => {
      const mock = fn();
      mock.mockReturnValue(42);
      mock();
      expect(mock.calls.length).toBe(1);
      expect(mock()).toBe(42);

      mock.mockReset();
      expect(mock.calls.length).toBe(0);
      expect(mock()).toBe(undefined);
    });
  });

  describe("Type safety", () => {
    it("should be typed with generic parameter", () => {
      const mock = fn<(a: number, b: string) => boolean>();
      mock.mockReturnValue(true);

      // This should be type-safe
      const result: boolean = mock(1, "test");
      expect(result).toBe(true);
    });
  });
});
