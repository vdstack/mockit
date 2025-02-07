import { m } from "..";

describe("m.assert", () => {
  describe("primitive values", () => {
    test("exact matches", () => {
      expect(() => m.assert(42).equals(42)).not.toThrow();
      expect(() => m.assert("hello").equals("hello")).not.toThrow();
      expect(() => m.assert(true).equals(true)).not.toThrow();
      expect(() => m.assert(null).equals(null)).not.toThrow();
      expect(() => m.assert(undefined).equals(undefined)).not.toThrow();
    });

    test("mismatches", () => {
      expect(() => m.assert(42).equals(43)).toThrow();
      expect(() => m.assert("hello").equals("world")).toThrow();
      expect(() => m.assert(true).equals(false)).toThrow();
      expect(() => m.assert(null).equals(m.unsafe(undefined))).toThrow();
    });
  });

  describe("any matchers", () => {
    test("anyString", () => {
      expect(() => m.assert("hello").equals(m.anyString())).not.toThrow();
      expect(() => m.assert(42).equals(m.anyString())).toThrow();
    });

    test("anyNumber", () => {
      expect(() => m.assert(42).equals(m.anyNumber())).not.toThrow();
      expect(() => m.assert("42").equals(m.anyNumber())).toThrow();
    });

    test("anyBoolean", () => {
      expect(() => m.assert(true).equals(m.anyBoolean())).not.toThrow();
      expect(() => m.assert(false).equals(m.anyBoolean())).not.toThrow();
      expect(() => m.assert("true").equals(m.anyBoolean())).toThrow();
    });

    test("anyObject", () => {
      expect(() => m.assert({}).equals(m.anyObject())).not.toThrow();
      expect(() => m.assert({ x: 1 }).equals(m.anyObject())).not.toThrow();
      expect(() => m.assert([]).equals(m.anyObject())).toThrow();
      expect(() => m.assert(null).equals(m.anyObject())).toThrow();
    });

    test("anyArray", () => {
      expect(() => m.assert([]).equals(m.anyArray())).not.toThrow();
      expect(() => m.assert([1, 2, 3]).equals(m.anyArray())).not.toThrow();
      expect(() => m.assert({}).equals(m.anyArray())).toThrow();
    });
  });

  describe("object matchers", () => {
    const complexObject = {
      id: "123",
      user: {
        name: "John",
        age: 30,
        contacts: {
          email: "john@example.com",
          phone: "1234567890",
        },
      },
      preferences: {
        theme: "dark",
        notifications: ["email", "push"],
      },
    };

    test("objectContaining - shallow", () => {
      expect(() =>
        m.assert(complexObject).equals(
          m.objectContaining({
            id: "123",
          })
        )
      ).not.toThrow();

      expect(() =>
        m.assert(complexObject).equals(
          m.objectContaining({
            id: "456",
          })
        )
      ).toThrow();
    });

    test("objectContaining - nested", () => {
      expect(() =>
        m.assert(complexObject).equals(
          m.objectContaining({
            user: m.objectContaining({
              name: "John",
            }),
          })
        )
      ).not.toThrow();

      expect(() =>
        m.assert(complexObject).equals(
          m.objectContaining({
            user: m.objectContaining({
              name: "Jane",
            }),
          })
        )
      ).toThrow();
    });

    test("objectContainingDeep", () => {
      expect(() =>
        m.assert(complexObject).equals(
          m.objectContainingDeep({
            user: { contacts: { email: "john@example.com" } },
          })
        )
      ).not.toThrow();

      expect(() =>
        m.assert(complexObject).equals(
          m.objectContainingDeep({
            user: { contacts: { email: "jane@example.com" } },
          })
        )
      ).toThrow();
    });
  });

  describe("array matchers", () => {
    const users = [
      { id: "1", name: "John" },
      { id: "2", name: "Jane" },
      { id: "3", name: "Bob" },
    ];

    test("arrayContaining", () => {
      expect(() =>
        m
          .assert(users)
          .equals(m.arrayContaining([m.objectContaining({ id: "1" })]))
      ).not.toThrow();

      expect(() =>
        m
          .assert(users)
          .equals(m.arrayContaining([m.objectContaining({ id: "4" })]))
      ).toThrow();
    });

    test("arrayContainingDeep", () => {
      expect(() =>
        m
          .assert(users)
          .equals(m.arrayContainingDeep([{ id: "1", name: "John" }]))
      ).not.toThrow();

      expect(() =>
        m
          .assert(users)
          .equals(m.arrayContainingDeep([{ id: "1", name: "Jane" }]))
      ).toThrow();
    });
  });

  describe("string matchers", () => {
    test("stringContaining", () => {
      expect(() =>
        m.assert("hello world").equals(m.stringContaining("world"))
      ).not.toThrow();
      expect(() =>
        m.assert("hello world").equals(m.stringContaining("moon"))
      ).toThrow();
    });

    test("stringStartingWith", () => {
      expect(() =>
        m.assert("hello world").equals(m.stringStartingWith("hello"))
      ).not.toThrow();
      expect(() =>
        m.assert("hello world").equals(m.stringStartingWith("world"))
      ).toThrow();
    });

    test("stringEndingWith", () => {
      expect(() =>
        m.assert("hello world").equals(m.stringEndingWith("world"))
      ).not.toThrow();
      expect(() =>
        m.assert("hello world").equals(m.stringEndingWith("hello"))
      ).toThrow();
    });

    test("stringMatching", () => {
      expect(() =>
        m.assert("hello world").equals(m.stringMatching(/^hello/))
      ).not.toThrow();
      expect(() =>
        m.assert("hello world").equals(m.stringMatching(/^world/))
      ).toThrow();
    });
  });

  describe("validation matchers", () => {
    test("validates with function", () => {
      expect(() =>
        m.assert(42).equals(m.validates((x) => x > 40))
      ).not.toThrow();
      expect(() => m.assert(42).equals(m.validates((x) => x < 40))).toThrow();
    });

    test("validates with complex objects", () => {
      const user = {
        id: "123",
        age: 25,
        email: "test@example.com",
      };

      expect(() =>
        m.assert(user).equals(
          m.objectContaining({
            age: m.validates((age) => age !== undefined && age >= 18),
            email: m.validates(
              (email) => email !== undefined && email.includes("@")
            ),
          })
        )
      ).not.toThrow();

      expect(() =>
        m.assert(user).equals(
          m.objectContaining({
            age: m.validates((age) => age !== undefined && age >= 30),
            email: m.validates(
              (email) => email !== undefined && email.includes("@")
            ),
          })
        )
      ).toThrow();
    });
  });

  describe("combining matchers", () => {
    const complexData = {
      id: "123",
      users: [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ],
      metadata: {
        created: "2024-01-01",
        tags: ["important", "active"],
      },
    };

    test("complex nested assertions", () => {
      expect(() =>
        m.assert(complexData).equals(
          m.objectContaining({
            id: m.anyString(),
            users: m.arrayContaining([
              m.objectContaining({
                name: m.stringContaining("John"),
                age: m.validates((age) => age >= 18),
              }),
            ]),
            metadata: m.objectContaining({
              tags: m.arrayContaining(["important"]),
            }),
          })
        )
      ).not.toThrow();

      expect(() =>
        m.assert(complexData).equals(
          m.objectContaining({
            users: m.arrayContaining([
              m.objectContaining({
                name: m.stringContaining("Alice"),
                age: m.validates((age) => age >= 18),
              }),
            ]),
          })
        )
      ).toThrow();
    });
  });

  describe("error messages", () => {
    test("provides helpful error messages", () => {
      const error = () => m.assert({ x: 1, y: 2 }).equals({ x: 1, y: 3 });
      expect(error).toThrow();
      expect(error).toThrow(/Expected.*to equal/);
    });
  });
});
