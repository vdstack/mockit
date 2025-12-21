import { Mock } from "../..";

describe("Chainable mock methods (Approach 1 - Jest-style)", () => {
  function getValue(): number {
    return 0;
  }

  async function fetchData(): Promise<string> {
    return "real";
  }

  describe("mockReturnValue", () => {
    it("should set the default return value", () => {
      const mock = Mock(getValue);
      mock.mockReturnValue(42);
      expect(mock()).toBe(42);
      expect(mock()).toBe(42);
    });

    it("should be chainable", () => {
      const mock = Mock(getValue);
      const result = mock.mockReturnValue(100);
      expect(result).toBe(mock);
    });

    it("should override previous values", () => {
      const mock = Mock(getValue);
      mock.mockReturnValue(1);
      expect(mock()).toBe(1);
      mock.mockReturnValue(2);
      expect(mock()).toBe(2);
    });
  });

  describe("mockThrow", () => {
    it("should set the default throw value", () => {
      const mock = Mock(getValue);
      mock.mockThrow(new Error("error"));
      expect(() => mock()).toThrow("error");
      mock.mockThrow(new Error("error2"));
      expect(() => mock()).toThrow("error2");
    });
  });

  describe("mockResolvedValue", () => {
    it("should set the resolved value", async () => {
      const mock = Mock(fetchData);
      mock.mockResolvedValue("mocked");
      expect(await mock()).toBe("mocked");
    });
  });

  describe("mockRejectedValue", () => {
    it("should set the rejected value", async () => {
      const mock = Mock(fetchData);
      mock.mockRejectedValue(new Error("failed"));
      await expect(mock()).rejects.toThrow("failed");
    });
  });

  describe("mockImplementation", () => {
    it("should set a custom implementation", () => {
      const mock = Mock(getValue);
      let callCount = 0;
      mock.mockImplementation(() => ++callCount);
      expect(mock()).toBe(1);
      expect(mock()).toBe(2);
      expect(mock()).toBe(3);
    });
  });

  describe("mockClear", () => {
    it("should clear call history", () => {
      const mock = Mock(getValue);
      mock();
      mock();
      expect(mock.calls.length).toBe(2);
      mock.mockClear();
      expect(mock.calls.length).toBe(0);
    });

    it("should be chainable", () => {
      const mock = Mock(getValue);
      mock();
      const result = mock.mockClear();
      expect(result).toBe(mock);
    });
  });

  describe("mockReset", () => {
    it("should clear history and behaviors", () => {
      const mock = Mock(getValue);
      mock.mockReturnValue(42);
      mock();
      expect(mock.calls.length).toBe(1);
      expect(mock()).toBe(42);

      mock.mockReset();
      expect(mock.calls.length).toBe(0);
      expect(mock()).toBe(undefined);
    });
  });

  describe("chaining multiple methods", () => {
    it("should support chaining different methods", () => {
      const mock = Mock(getValue);
      mock.mockReturnValue(99).mockClear();
      expect(mock.calls.length).toBe(0);
      expect(mock()).toBe(99);
    });
  });
});
