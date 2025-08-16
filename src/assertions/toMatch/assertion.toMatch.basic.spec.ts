import { m } from "../..";

describe("Assertion.toMatch.basic", () => {
  describe("Happy Paths", () => {
    it("should match partial object properties", () => {
      const user = {
        id: "123",
        name: "John",
        age: 30,
        email: "john@example.com",
      };

      expect(() => {
        m.expect(user).toMatch({ name: "John" });
      }).not.toThrow();
    });

    it("should match multiple partial properties", () => {
      const product = {
        id: "prod-123",
        name: "Laptop",
        price: 999.99,
        category: "Electronics",
        inStock: true,
      };

      expect(() => {
        m.expect(product).toMatch({ name: "Laptop", category: "Electronics" });
      }).not.toThrow();
    });

    it("should match exact object when all properties provided", () => {
      const config = { theme: "dark", language: "en" };

      expect(() => {
        m.expect(config).toMatch({ theme: "dark", language: "en" });
      }).not.toThrow();
    });

    it("should match empty object against any object", () => {
      const anyObject = { foo: "bar", baz: 123 };

      expect(() => {
        m.expect(anyObject).toMatch({});
      }).not.toThrow();
    });

    it("should match single property from complex object", () => {
      const complexUser = {
        id: "user-456",
        profile: {
          name: "Jane",
          details: {
            age: 25,
            address: {
              street: "123 Main St",
              city: "New York",
              country: "USA",
            },
          },
        },
        preferences: {
          theme: "light",
          notifications: true,
        },
      };

      expect(() => {
        m.expect(complexUser).toMatch({ id: "user-456" });
      }).not.toThrow();
    });

    it("should match primitive properties of different types", () => {
      const mixed = {
        str: "hello",
        num: 42,
        bool: true,
        nullVal: null,
        undefinedVal: undefined,
      };

      expect(() => {
        m.expect(mixed).toMatch({
          str: "hello",
          num: 42,
          bool: true,
          nullVal: null,
        });
      }).not.toThrow();
    });

    it("should match array properties in partial matching", () => {
      const data = {
        id: "123",
        tags: ["javascript", "testing", "typescript"],
        metadata: { created: "2024-01-01" },
      };

      expect(() => {
        m.expect(data).toMatch({
          tags: ["javascript", "testing", "typescript"],
        });
      }).not.toThrow();
    });
  });

  describe("Error Paths", () => {
    it("should throw when actual is not an object or array", () => {
      expect(() => {
        // @ts-expect-error - we want to test the error path
        m.expect("not an object").toMatch({ foo: "bar" });
      }).toThrow();
    });

    it("should throw when actual is a number", () => {
      expect(() => {
        // @ts-expect-error - we want to test the error path
        m.expect(123).toMatch({ value: 123 });
      }).toThrow();
    });

    it("should throw when actual is boolean", () => {
      expect(() => {
        // @ts-expect-error - we want to test the error path
        m.expect(true).toMatch({ isTrue: true });
      }).toThrow();
    });

    it("should throw when actual is null", () => {
      expect(() => {
        // @ts-expect-error - we want to test the error path
        m.expect(null).toMatch({ foo: "bar" });
      }).toThrow();
    });

    it("should throw when property values don't match", () => {
      const user = { name: "John", age: 30 };

      expect(() => {
        m.expect(user).toMatch({ name: "Jane" });
      }).toThrow(/Expected .* to match/);
    });

    it("should throw when expected property doesn't exist in actual", () => {
      const user = { name: "John" };

      expect(() => {
        // @ts-expect-error - we want to test the error path
        m.expect(user).toMatch({ age: 30 });
      }).toThrow(/Expected .* to match/);
    });

    it("should throw when property types don't match", () => {
      const data = { count: 42 };

      expect(() => {
        // @ts-expect-error - we want to test the error path
        m.expect(data).toMatch({ count: "42" });
      }).toThrow(/Expected .* to match/);
    });

    it("should throw when nested object structure doesn't match", () => {
      const user = {
        profile: {
          name: "John",
        },
      };

      expect(() => {
        m.expect(user).toMatch({
          profile: {
            name: "Jane",
          },
        });
      }).toThrow(/Expected .* to match/);
    });

    it("should throw when array content doesn't match", () => {
      const data = {
        tags: ["javascript", "testing"],
      };

      expect(() => {
        m.expect(data).toMatch({
          tags: ["python", "testing"],
        });
      }).toThrow(/Expected .* to match/);
    });

    it("should throw meaningful error with JSON representation", () => {
      const actual = { name: "John", age: 30 };
      const expected = { name: "Jane" };

      try {
        m.expect(actual).toMatch(expected);
      } catch (error) {
        expect((error as Error).message).toContain('"name":"John"');
        expect((error as Error).message).toContain('"name":"Jane"');
        expect((error as Error).message).toContain("Expected");
        expect((error as Error).message).toContain("to match");
      }
    });

    it("should throw when matching against undefined", () => {
      const data = { value: undefined };

      expect(() => {
        // @ts-expect-error - we want to test the error path
        m.expect(data).toMatch({ value: "defined" });
      }).toThrow(/Expected .* to match/);
    });
  });
});
