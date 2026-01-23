import { Mock, when } from "../..";

function returnNumber(n?: number): number {
  return n ?? 42;
}

function asyncFunction(): Promise<number> {
  return Promise.resolve(42);
}

describe("once behaviours", () => {
  describe("thenReturnOnce", () => {
    it("should return the value once then fallback to default", () => {
      const mock = Mock(returnNumber);
      when(mock).isCalled.thenReturnOnce(1);

      expect(mock()).toBe(1);
      expect(mock()).toBe(undefined); // default
    });

    it("should support chaining multiple thenReturnOnce (FIFO)", () => {
      const mock = Mock(returnNumber);
      when(mock).isCalled.thenReturnOnce(1).thenReturnOnce(2).thenReturnOnce(3);

      expect(mock()).toBe(1);
      expect(mock()).toBe(2);
      expect(mock()).toBe(3);
      expect(mock()).toBe(undefined); // default
    });

    it("should work with explicit fallback via thenReturn", () => {
      const mock = Mock(returnNumber);
      when(mock)
        .isCalled.thenReturnOnce(1)
        .thenReturnOnce(2)
        .thenReturn(99); // fallback

      expect(mock()).toBe(1);
      expect(mock()).toBe(2);
      expect(mock()).toBe(99); // fallback
      expect(mock()).toBe(99); // still fallback
    });
  });

  describe("thenThrowOnce", () => {
    it("should throw once then fallback to default", () => {
      const mock = Mock(returnNumber);
      when(mock).isCalled.thenThrowOnce(new Error("oops")).thenReturn(99);

      expect(() => mock()).toThrow("oops");
      expect(mock()).toBe(99);
    });

    it("should support chaining thenThrowOnce with thenReturnOnce", () => {
      const mock = Mock(returnNumber);
      when(mock)
        .isCalled.thenReturnOnce(1)
        .thenThrowOnce(new Error("oops"))
        .thenReturnOnce(3);

      expect(mock()).toBe(1);
      expect(() => mock()).toThrow("oops");
      expect(mock()).toBe(3);
    });
  });

  describe("thenResolveOnce", () => {
    it("should resolve once then fallback to default", async () => {
      const mock = Mock(asyncFunction);
      when(mock).isCalled.thenResolveOnce(100).thenResolve(200);

      await expect(mock()).resolves.toBe(100);
      await expect(mock()).resolves.toBe(200);
      await expect(mock()).resolves.toBe(200); // still fallback
    });
  });

  describe("thenRejectOnce", () => {
    it("should reject once then fallback to default", async () => {
      const mock = Mock(asyncFunction);
      when(mock).isCalled.thenRejectOnce(new Error("rejected")).thenResolve(200);

      await expect(mock()).rejects.toThrow("rejected");
      await expect(mock()).resolves.toBe(200);
    });
  });

  describe("thenBehaveLikeOnce", () => {
    it("should call custom function once then fallback", () => {
      const mock = Mock(returnNumber);
      let callCount = 0;
      when(mock)
        .isCalled.thenBehaveLikeOnce(() => {
          callCount++;
          return 999;
        })
        .thenReturn(100);

      expect(mock()).toBe(999);
      expect(callCount).toBe(1);
      expect(mock()).toBe(100);
      expect(callCount).toBe(1); // not called again
    });
  });

  describe("thenPreserveOnce", () => {
    it("should call original function once then fallback", () => {
      const mock = Mock(returnNumber);
      when(mock).isCalled.thenPreserveOnce().thenReturn(100);

      expect(mock()).toBe(42); // original value
      expect(mock()).toBe(100); // fallback
    });
  });

  describe("mixed once behaviours", () => {
    it("should support mixing different once behaviour types", () => {
      const mock = Mock(returnNumber);
      when(mock)
        .isCalled.thenReturnOnce(1)
        .thenThrowOnce(new Error("error"))
        .thenPreserveOnce()
        .thenReturn(99);

      expect(mock()).toBe(1);
      expect(() => mock()).toThrow("error");
      expect(mock()).toBe(42); // preserved original
      expect(mock()).toBe(99); // fallback
    });
  });

  describe("backwards compatibility", () => {
    it("should not break existing code without chaining", () => {
      const mock = Mock(returnNumber);
      when(mock).isCalled.thenReturn(999);
      expect(mock()).toBe(999);
    });

    it("should work with isCalledWith alongside once behaviours", () => {
      const mock = Mock(returnNumber);
      when(mock).isCalled.thenReturnOnce(1).thenReturn(99);
      when(mock).isCalledWith(42).thenReturn(777);

      // Once behaviour takes priority over customBehaviour
      expect(mock(42)).toBe(1);
      // After once consumed, customBehaviour is checked
      expect(mock(42)).toBe(777);
      // For other args, fallback to default
      expect(mock()).toBe(99);
    });
  });

  describe("chaining default behaviours", () => {
    it("should support chaining default behaviours (last one wins)", () => {
      const mock = Mock(returnNumber);
      when(mock).isCalled.thenReturn(1).thenReturn(2);

      // Last thenReturn wins
      expect(mock()).toBe(2);
      expect(mock()).toBe(2);
    });
  });
});
