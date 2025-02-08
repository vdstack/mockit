import { expect } from "./expect";

describe("toContain", () => {
  describe("array containment", () => {
    it("should match primitive values in array", () => {
      expect([1, 2, 3]).toContain(2);
      expect(["a", "b", "c"]).toContain("b");
      expect([true, false]).toContain(true);
    });

    it("should match objects in array", () => {
      const arr = [{ id: 1, name: "test" }];
      expect(arr).toContain({ id: 1, name: "test" });
    });

    it("should throw when value is not in array", () => {
      expect(() => expect([1, 2, 3]).toContain(4)).toThrow();
      const arr = [{ id: 1, name: "test" }];
      expect(() => expect(arr).toContain({ id: 2, name: "other" })).toThrow();
    });

    it("should handle empty arrays", () => {
      const arr: number[] = [];
      expect(() => expect(arr).toContain(1)).toThrow();
    });

    it("should match when array has multiple occurrences", () => {
      expect([1, 2, 2, 3]).toContain(2);
      const arr = [
        { id: 1, name: "test" },
        { id: 1, name: "test" },
      ];
      expect(arr).toContain({ id: 1, name: "test" });
    });
  });

  describe("object containment", () => {
    interface TestObject {
      id: number;
      name: string;
      age: number;
    }

    it("should match partial object properties", () => {
      const obj: TestObject = { id: 1, name: "test", age: 30 };
      expect(obj).toContain({ id: 1, name: "test" });
      expect(obj).toContain({ name: "test", age: 30 });
    });

    it("should match nested objects", () => {
      interface User {
        id: number;
        details: {
          age: number;
        };
      }

      const obj = {
        user: { id: 1, details: { age: 30 } } as User,
        status: "active",
      };

      expect(obj).toContain({
        user: { id: 1, details: { age: 30 } },
      });
    });

    it("should throw when object doesn't contain expected properties", () => {
      const obj = { name: "test", age: 30 };
      expect(() => expect(obj).toContain({ name: "other" })).toThrow();
    });

    it("should handle empty objects", () => {
      interface EmptyTest {
        a: number;
      }
      const obj: EmptyTest = { a: 1 };
      expect(obj).toContain({} as Partial<EmptyTest>);
      const empty = {};
      expect(() => expect(empty).toContain({ a: 1 })).toThrow();
    });

    it("should match with null/undefined values", () => {
      interface NullTest {
        a: null | undefined;
        b: number;
      }
      const objWithNull: NullTest = { a: null, b: 1 };
      const objWithUndefined: NullTest = { a: undefined, b: 1 };
      expect(objWithNull).toContain({ a: null });
      expect(objWithUndefined).toContain({ a: undefined });
    });
  });

  describe("error cases", () => {
    it("should throw for non-array/non-object actual values", () => {
      expect(() => expect("string" as any).toContain("s")).toThrow();
      expect(() => expect(42 as any).toContain(4)).toThrow();
    });

    it("should handle undefined/null expected values", () => {
      expect(() => expect([1, 2, 3] as any).toContain(undefined)).toThrow();
      expect(() => expect([1, 2, 3] as any).toContain(null)).toThrow();
    });
  });
});
