import { m } from "..";

describe("m.assert", () => {
  describe("primitive values", () => {
    test("exact matches", () => {
      expect(() => m.expect(42).toEqual(42)).not.toThrow();
      expect(() => m.expect("hello").toEqual("hello")).not.toThrow();
      expect(() => m.expect(true).toEqual(true)).not.toThrow();
      expect(() => m.expect(null).toEqual(null)).not.toThrow();
      expect(() => m.expect(undefined).toEqual(undefined)).not.toThrow();
    });

    test("mismatches", () => {
      expect(() => m.expect(42).toEqual(43)).toThrow();
      expect(() => m.expect("hello").toEqual("world")).toThrow();
      expect(() => m.expect(true).toEqual(false)).toThrow();
      expect(() => m.expect(null).toEqual(m.unsafe(undefined))).toThrow();
    });
  });

  describe("any matchers", () => {
    test("anyString", () => {
      expect(() => m.expect("hello").toEqual(m.anyString())).not.toThrow();
      expect(() => m.expect(42).toEqual(m.anyString())).toThrow();
    });

    test("anyNumber", () => {
      expect(() => m.expect(42).toEqual(m.anyNumber())).not.toThrow();
      expect(() => m.expect("42").toEqual(m.anyNumber())).toThrow();
    });

    test("anyBoolean", () => {
      expect(() => m.expect(true).toEqual(m.anyBoolean())).not.toThrow();
      expect(() => m.expect(false).toEqual(m.anyBoolean())).not.toThrow();
      expect(() => m.expect("true").toEqual(m.anyBoolean())).toThrow();
    });

    test("anyObject", () => {
      expect(() => m.expect({}).toEqual(m.anyObject())).not.toThrow();
      expect(() => m.expect({ x: 1 }).toEqual(m.anyObject())).not.toThrow();
      expect(() => m.expect([]).toEqual(m.anyObject())).toThrow();
      expect(() => m.expect(null).toEqual(m.anyObject())).toThrow();
    });

    test("anyArray", () => {
      expect(() => m.expect([]).toEqual(m.anyArray())).not.toThrow();
      expect(() => m.expect([1, 2, 3]).toEqual(m.anyArray())).not.toThrow();
      expect(() => m.expect({}).toEqual(m.anyArray())).toThrow();
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
        m.expect(complexObject).toEqual(
          m.objectContaining({
            id: "123",
          })
        )
      ).not.toThrow();

      expect(() =>
        m.expect(complexObject).toEqual(
          m.objectContaining({
            id: "456",
          })
        )
      ).toThrow();
    });

    test("objectContaining - nested", () => {
      expect(() =>
        m.expect(complexObject).toEqual(
          m.objectContaining({
            user: m.objectContaining({
              name: "John",
            }),
          })
        )
      ).not.toThrow();

      expect(() =>
        m.expect(complexObject).toEqual(
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
        m.expect(complexObject).toEqual(
          m.objectContainingDeep({
            user: { contacts: { email: "john@example.com" } },
          })
        )
      ).not.toThrow();

      expect(() =>
        m.expect(complexObject).toEqual(
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
          .expect(users)
          .toEqual(m.arrayContaining([m.objectContaining({ id: "1" })]))
      ).not.toThrow();

      expect(() =>
        m
          .expect(users)
          .toEqual(m.arrayContaining([m.objectContaining({ id: "4" })]))
      ).toThrow();
    });

    test("arrayContainingDeep", () => {
      expect(() =>
        m
          .expect(users)
          .toEqual(m.arrayContainingDeep([{ id: "1", name: "John" }]))
      ).not.toThrow();

      expect(() =>
        m
          .expect(users)
          .toEqual(m.arrayContainingDeep([{ id: "1", name: "Jane" }]))
      ).toThrow();
    });
  });

  describe("string matchers", () => {
    test("stringContaining", () => {
      expect(() =>
        m.expect("hello world").toEqual(m.stringContaining("world"))
      ).not.toThrow();
      expect(() =>
        m.expect("hello world").toEqual(m.stringContaining("moon"))
      ).toThrow();
    });

    test("stringStartingWith", () => {
      expect(() =>
        m.expect("hello world").toEqual(m.stringStartingWith("hello"))
      ).not.toThrow();
      expect(() =>
        m.expect("hello world").toEqual(m.stringStartingWith("world"))
      ).toThrow();
    });

    test("stringEndingWith", () => {
      expect(() =>
        m.expect("hello world").toEqual(m.stringEndingWith("world"))
      ).not.toThrow();
      expect(() =>
        m.expect("hello world").toEqual(m.stringEndingWith("hello"))
      ).toThrow();
    });

    test("stringMatching", () => {
      expect(() =>
        m.expect("hello world").toEqual(m.stringMatching(/^hello/))
      ).not.toThrow();
      expect(() =>
        m.expect("hello world").toEqual(m.stringMatching(/^world/))
      ).toThrow();
    });
  });

  describe("validation matchers", () => {
    test("validates with function", () => {
      expect(() =>
        m.expect(42).toEqual(m.validates((x) => x > 40))
      ).not.toThrow();
      expect(() => m.expect(42).toEqual(m.validates((x) => x < 40))).toThrow();
    });

    test("validates with complex objects", () => {
      const user = {
        id: "123",
        age: 25,
        email: "test@example.com",
      };

      expect(() =>
        m.expect(user).toEqual(
          m.objectContaining({
            age: m.validates((age) => age !== undefined && age >= 18),
            email: m.validates(
              (email) => email !== undefined && email.includes("@")
            ),
          })
        )
      ).not.toThrow();

      expect(() =>
        m.expect(user).toEqual(
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
        m.expect(complexData).toEqual(
          m.objectContaining({
            id: m.anyString(),
            users: m.arrayContaining([
              m.objectContaining({
                name: m.stringContaining("John"),
                age: m.validates((age) => typeof age === "number" && age >= 18),
              }),
            ]),
            metadata: m.objectContaining({
              tags: m.arrayContaining(["important"]),
            }),
          })
        )
      ).not.toThrow();

      expect(() =>
        m.expect(complexData).toEqual(
          m.objectContaining({
            users: m.arrayContaining([
              m.objectContaining({
                name: m.stringContaining("Alice"),
                age: m.validates((age) => typeof age === "number" && age >= 18),
              }),
            ]),
          })
        )
      ).toThrow();
    });
  });

  describe("error messages", () => {
    test("provides helpful error messages", () => {
      const error = () => m.expect({ x: 1, y: 2 }).toEqual({ x: 1, y: 3 });
      expect(error).toThrow();
      expect(error).toThrow(/Expected.*to equal/);
    });
  });
});

describe("comparison of matching styles", () => {
  const complexNested = {
    user: {
      profile: {
        name: "John",
        settings: {
          theme: "dark",
          notifications: true,
        },
      },
      stats: {
        lastLogin: "2024-01-01",
        loginCount: 42,
      },
    },
  };

  test("demonstrates different matching styles", () => {
    // 1. Direct equality - most strict, requires exact match
    expect(() =>
      m.expect(complexNested).toEqual({
        user: {
          profile: {
            name: "John",
            settings: {
              theme: "dark",
              notifications: true,
            },
          },
          stats: {
            lastLogin: "2024-01-01",
            loginCount: 42,
          },
        },
      })
    ).not.toThrow();

    // 2. Nested objectContaining - flexible but verbose
    expect(() =>
      m.expect(complexNested).toEqual(
        m.objectContaining({
          user: m.objectContaining({
            profile: m.objectContaining({
              name: "John",
              settings: m.objectContaining({
                theme: "dark",
              }),
            }),
          }),
        })
      )
    ).not.toThrow();

    // 3. objectContainingDeep - most concise
    expect(() =>
      m.expect(complexNested).toEqual(
        m.objectContainingDeep({
          user: {
            profile: {
              name: "John",
              settings: {
                theme: "dark",
              },
            },
          },
        })
      )
    ).not.toThrow();
  });
});

it("should work", () => {
  m.expect("Victor").toEqual(m.stringMatching(/victor/i));
  m.expect({ x: 1, y: "azeaze" }).toEqual(m.objectContaining({}));
  m.expect([
    [1, 2],
    [3, 4],
  ]).toEqual(m.arrayContainingDeep([[2]]));
});
