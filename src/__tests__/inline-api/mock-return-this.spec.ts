import { Mock, fn } from "../..";

describe("mockReturnThis", () => {
  it("should return this context when called as object method", () => {
    const obj = {
      value: 42,
      getValue: fn().mockReturnThis(),
    };
    expect(obj.getValue()).toBe(obj);
    expect(obj.getValue().value).toBe(42);
  });

  it("should enable fluent chaining", () => {
    const builder = {
      a: fn().mockReturnThis(),
      b: fn().mockReturnThis(),
      c: fn().mockReturnThis(),
    };
    expect(builder.a().b().c()).toBe(builder);
  });

  it("should return the mock itself for method chaining", () => {
    const mock = fn();
    expect(mock.mockReturnThis()).toBe(mock);
  });

  it("should work with Mock() on functions", () => {
    function original() {
      return "original";
    }
    const obj = {
      method: Mock(original).mockReturnThis(),
    };
    expect(obj.method()).toBe(obj);
  });
});
