import { Mock } from "../..";

describe("Mock function with inline config (Approach 4)", () => {
  function add(a: number, b: number): number {
    return a + b;
  }

  async function fetchUser(id: number): Promise<{ id: number; name: string }> {
    return { id, name: "Real User" };
  }

  describe("{ returns }", () => {
    it("should return the configured value", () => {
      const mock = Mock(add, { returns: 42 });
      expect(mock(1, 2)).toBe(42);
      expect(mock(10, 20)).toBe(42);
    });

    it("should be type-safe", () => {
      const mock = Mock(add, { returns: 100 });
      // TypeScript ensures returns value matches return type
      const result: number = mock(1, 2);
      expect(result).toBe(100);
    });
  });

  describe("{ resolves }", () => {
    it("should resolve with the configured value", async () => {
      const mock = Mock(fetchUser, { resolves: { id: 1, name: "Mocked User" } });
      const result = await mock(1);
      expect(result).toEqual({ id: 1, name: "Mocked User" });
    });
  });

  describe("{ rejects }", () => {
    it("should reject with the configured error", async () => {
      const mock = Mock(fetchUser, { rejects: new Error("Network error") });
      await expect(mock(1)).rejects.toThrow("Network error");
    });
  });

  describe("{ throws }", () => {
    it("should throw the configured error", () => {
      const mock = Mock(add, { throws: new Error("Calculation error") });
      expect(() => mock(1, 2)).toThrow("Calculation error");
    });
  });

  describe("{ calls }", () => {
    it("should call the configured implementation", () => {
      const mock = Mock(add, { calls: (a, b) => a * b });
      expect(mock(3, 4)).toBe(12);
      expect(mock(5, 6)).toBe(30);
    });
  });
});
