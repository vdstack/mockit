import { fn } from "../..";

describe("Call results tracking", () => {
  it("should record return results with kind discriminator", () => {
    const mock = fn().mockReturnValue(42);
    mock();

    expect(mock.calls[0].result).toEqual({ kind: "return", value: 42 });
  });

  it("should record throw results with kind discriminator", () => {
    const error = new Error("oops");
    const mock = fn().mockImplementation(() => {
      throw error;
    });

    try {
      mock();
    } catch (e) {}

    expect(mock.calls[0].result).toEqual({ kind: "throw", error });
  });

  it("should track results for each call", () => {
    const mock = fn()
      .mockReturnValueOnce(1)
      .mockImplementationOnce(() => {
        throw new Error("fail");
      })
      .mockReturnValue(99);

    mock();
    try {
      mock();
    } catch (e) {}
    mock();

    expect(mock.calls[0].result.kind).toBe("return");
    expect(mock.calls[1].result.kind).toBe("throw");
    expect(mock.calls[2].result.kind).toBe("return");
  });

  it("should record resolved promise as return", async () => {
    const mock = fn().mockResolvedValue(42);
    mock();

    const result = mock.calls[0].result;
    expect(result.kind).toBe("return");
    if (result.kind === "return") {
      expect(await result.value).toBe(42);
    }
  });

  it("should record rejected promise as return", async () => {
    const mock = fn().mockRejectedValue(new Error("rejected"));
    const promise = mock();

    expect(mock.calls[0].result.kind).toBe("return");
    await expect(promise).rejects.toThrow("rejected");
  });
});

describe("lastCall", () => {
  it("should return undefined when never called", () => {
    const mock = fn();
    expect(mock.lastCall).toBeUndefined();
  });

  it("should return args of last call", () => {
    const mock = fn();
    mock(1, "a");
    mock(2, "b");

    expect(mock.lastCall).toEqual([2, "b"]);
  });

  it("should be undefined after mockClear", () => {
    const mock = fn();
    mock(1);
    mock.mockClear();

    expect(mock.lastCall).toBeUndefined();
  });
});
