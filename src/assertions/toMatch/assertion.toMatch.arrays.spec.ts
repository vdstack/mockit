import { m } from "../..";

/**
 * Testing toMatch function specifically for array matching scenarios.
 * Arrays use arrayMatching under the hood, which should provide partial matching capabilities.
 */
describe("Assertion.toMatch.arrays", () => {
  describe("Happy Paths", () => {
    it("should match simple array partial matching", () => {
      const users = [
        { id: "1", name: "John", email: "john@example.com", active: true },
        { id: "2", name: "Jane", email: "jane@example.com", active: false },
      ];

      expect(() => {
        m.expect(users).toMatch([
          { id: "1", name: "John" },
          { id: "2", name: "Jane" },
        ]);
      }).not.toThrow();
    });

    it("should match arrays of primitives", () => {
      const numbers = [1, 2, 3, 4, 5];
      const strings = ["hello", "world", "test"];
      const booleans = [true, false, true];

      expect(() => {
        m.expect(numbers).toMatch([1, 2, 3, 4, 5]);
      }).not.toThrow();

      expect(() => {
        m.expect(strings).toMatch(["hello", "world", "test"]);
      }).not.toThrow();

      expect(() => {
        m.expect(booleans).toMatch([true, false, true]);
      }).not.toThrow();
    });

    it("should match arrays of objects with deep partial matching", () => {
      const products = [
        {
          id: "prod-1",
          details: {
            name: "Laptop",
            specs: {
              ram: "16GB",
              storage: "512GB SSD",
              processor: "Intel i7",
            },
          },
          pricing: {
            cost: 999.99,
            currency: "USD",
          },
        },
        {
          id: "prod-2",
          details: {
            name: "Mouse",
            specs: {
              type: "wireless",
              dpi: 1600,
              buttons: 3,
            },
          },
          pricing: {
            cost: 29.99,
            currency: "USD",
          },
        },
      ];

      expect(() => {
        m.expect(products).toMatch([
          {
            details: {
              specs: {
                ram: "16GB",
              },
            },
          },
          {
            details: {
              specs: {
                type: "wireless",
              },
            },
          },
        ]);
      }).not.toThrow();
    });

    it("should match nested arrays (arrays within arrays)", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];

      expect(() => {
        m.expect(matrix).toMatch([
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ]);
      }).not.toThrow();
    });

    it("should match arrays with nested objects containing arrays", () => {
      const data = [
        {
          category: "tech",
          items: ["laptop", "phone", "tablet"],
          metadata: {
            tags: ["electronics", "gadgets"],
            count: 3,
          },
        },
        {
          category: "books",
          items: ["novel", "textbook"],
          metadata: {
            tags: ["literature", "education"],
            count: 2,
          },
        },
      ];

      expect(() => {
        m.expect(data).toMatch([
          {
            category: "tech",
            items: ["laptop", "phone", "tablet"],
          },
          {
            category: "books",
            metadata: {
              count: 2,
            },
          },
        ]);
      }).not.toThrow();
    });

    it("should match mixed arrays with different types", () => {
      const mixed = [
        { type: "object", value: { data: "test" } },
        { type: "string", value: "hello" },
        { type: "number", value: 42 },
        { type: "boolean", value: true },
      ];

      expect(() => {
        m.expect(mixed).toMatch([
          { type: "object" },
          { type: "string" },
          { type: "number" },
          { type: "boolean" },
        ]);
      }).not.toThrow();
    });

    it("should match empty arrays", () => {
      const emptyArray: any[] = [];

      expect(() => {
        m.expect(emptyArray).toMatch([]);
      }).not.toThrow();
    });

    it("should match arrays with partial object matching at multiple levels", () => {
      const complexData = [
        {
          user: {
            profile: {
              personal: {
                name: "Alice",
                age: 30,
              },
              preferences: {
                theme: "dark",
                notifications: true,
              },
            },
          },
        },
      ];

      expect(() => {
        m.expect(complexData).toMatch([
          {
            user: {
              profile: {
                personal: {
                  name: "Alice",
                },
              },
            },
          },
        ]);
      }).not.toThrow();
    });

    it("should allow actual array to be longer than expected (shape matching)", () => {
      const longArray = [1, 2, 3, 4, 5];

      expect(() => {
        m.expect(longArray).toMatch([1, 2]);
      }).not.toThrow();
    });
  });

  describe("Error Paths", () => {
    it("should throw when expected array is longer than actual", () => {
      const shortArray = [1, 2];

      expect(() => {
        m.expect(shortArray).toMatch([1, 2, 3]);
      }).toThrow();
    });

    it("should throw when array element types don't match", () => {
      const numbers = [1, 2, 3];

      expect(() => {
        // @ts-expect-error - we want to test the error path
        m.expect(numbers).toMatch(["1", "2", "3"]);
      }).toThrow();
    });

    it("should throw when object properties in arrays don't match", () => {
      const users = [
        { id: "1", name: "John" },
        { id: "2", name: "Jane" },
      ];

      expect(() => {
        m.expect(users).toMatch([
          { id: "1", name: "Johnny" },
          { id: "2", name: "Jane" },
        ]);
      }).toThrow();
    });

    it("should throw when nested array content doesn't match", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      expect(() => {
        m.expect(matrix).toMatch([
          [1, 2, 3],
          [4, 5, 7],
        ]);
      }).toThrow();
    });

    it("should throw when deep object properties in arrays don't match", () => {
      const data = [
        {
          config: {
            settings: {
              theme: "dark",
            },
          },
        },
      ];

      expect(() => {
        m.expect(data).toMatch([
          {
            config: {
              settings: {
                theme: "light",
              },
            },
          },
        ]);
      }).toThrow();
    });

    it("should throw when expected array element doesn't exist", () => {
      const incompleteArray = [{ id: "1" }];

      expect(() => {
        m.expect(incompleteArray).toMatch([{ id: "1" }, { id: "2" }]);
      }).toThrow();
    });

    it("should throw when array contains null but object expected", () => {
      const arrayWithNull = [null, { id: "2" }];

      expect(() => {
        m.expect(arrayWithNull).toMatch([{ id: "1" }, { id: "2" }]);
      }).toThrow();
    });

    it("should throw when array contains undefined but object expected", () => {
      const arrayWithUndefined = [undefined, { id: "2" }];

      expect(() => {
        m.expect(arrayWithUndefined).toMatch([{ id: "1" }, { id: "2" }]);
      }).toThrow();
    });

    it("should throw when comparing array to non-array", () => {
      const notAnArray = { 0: "first", 1: "second", length: 2 };

      expect(() => {
        m.expect(notAnArray).toMatch(["first", "second"]);
      }).toThrow();
    });

    it("should throw when nested arrays have structural mismatches", () => {
      const nested = [
        {
          data: [{ values: [1, 2, 3] }, { values: [4, 5, 6] }],
        },
      ];

      expect(() => {
        m.expect(nested).toMatch([
          {
            data: [{ values: [1, 2, 3] }, { values: [4, 5, 7] }],
          },
        ]);
      }).toThrow();
    });
  });
});
