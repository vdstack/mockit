import { m } from "../..";
import { z } from "zod";

/**
 * Testing toMatch function specifically with Mockit matchers integration.
 * This tests how toMatch works when the expected values contain matchers
 * like m.anyString(), m.anyNumber(), m.validates(), etc.
 */
describe("Assertion.toMatch.with-matchers", () => {
  describe("Happy Paths", () => {
    it("should match using basic any matchers", () => {
      const user = {
        id: "user-123",
        name: "John Doe",
        age: 30,
        email: "john@example.com",
        isActive: true,
        profile: {
          avatar: "avatar.jpg",
          preferences: {
            theme: "dark",
            language: "en",
          },
        },
      };

      expect(() => {
        m.expect(user).toMatch({
          id: m.anyString(),
          name: m.anyString(),
          age: m.anyNumber(),
          isActive: m.anyBoolean(),
          profile: {
            avatar: m.anyString(),
          },
        });
      }).not.toThrow();
    });

    it("should match using validates matcher with Zod schemas", () => {
      const product = {
        id: "prod-123",
        name: "Laptop",
        price: 999.99,
        sku: "LAP-001",
        email: "contact@example.com",
        website: "https://example.com",
        createdAt: "2024-01-01T00:00:00Z",
      };

      expect(() => {
        m.expect(product).toMatch({
          id: m.validates(z.string().min(5)),
          price: m.validates(z.number().positive()),
          email: m.validates(z.string().email()),
          website: m.validates(z.string().url()),
          createdAt: m.validates(z.string().datetime()),
        });
      }).not.toThrow();
    });

    it("should match using matchers in arrays", () => {
      const orders = [
        {
          orderId: "order-1",
          customerId: "customer-123",
          total: 199.99,
          status: "shipped",
        },
        {
          orderId: "order-2",
          customerId: "customer-456",
          total: 89.5,
          status: "pending",
        },
      ];

      expect(() => {
        m.expect(orders).toMatch([
          {
            orderId: m.anyString(),
            customerId: m.anyString(),
            total: m.anyNumber(),
            status: m.validates(z.enum(["shipped", "pending", "delivered"])),
          },
          {
            orderId: m.anyString(),
            total: m.validates(z.number().positive()),
          },
        ]);
      }).not.toThrow();
    });

    it("should match using matchers in deeply nested structures", () => {
      const apiResponse = {
        status: "success",
        data: {
          user: {
            id: "user-789",
            profile: {
              personal: {
                firstName: "Alice",
                lastName: "Smith",
                birthDate: "1990-05-15",
              },
              contact: {
                email: "alice@example.com",
                phone: "+1234567890",
              },
            },
            preferences: {
              notifications: {
                email: true,
                push: false,
                sms: true,
              },
            },
          },
        },
        timestamp: "2024-01-01T12:00:00Z",
      };

      expect(() => {
        m.expect(apiResponse).toMatch({
          status: m.validates(z.literal("success")),
          data: {
            user: {
              id: m.anyString(),
              profile: {
                personal: {
                  firstName: m.anyString(),
                  lastName: m.anyString(),
                  birthDate: m.validates(
                    z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
                  ),
                },
                contact: {
                  email: m.validates(z.string().email()),
                  phone: m.validates(z.string().min(10)),
                },
              },
              preferences: {
                notifications: {
                  email: m.anyBoolean(),
                  push: m.anyBoolean(),
                },
              },
            },
          },
          timestamp: m.validates(z.string().datetime()),
        });
      }).not.toThrow();
    });

    it("should match using string matchers", () => {
      const document = {
        title: "Introduction to TypeScript",
        content:
          "This document contains important information about TypeScript...",
        author: "john.doe@company.com",
        tags: ["typescript", "javascript", "programming"],
        url: "/docs/typescript-intro",
      };

      expect(() => {
        m.expect(document.title).toMatch(m.stringContaining("TypeScript"));
        m.expect(document.content).toMatch(
          m.stringStartingWith("This document")
        );
        m.expect(document.author).toMatch(m.stringEndingWith("@company.com"));
        m.expect(document.tags).toMatch([
          m.or(
            m.stringMatching(/^type/),
            m.stringStartingWith("javsc"),
            m.stringContaining("program")
          ),
        ]);
        m.expect(document.url).toMatch(m.stringStartingWith("/docs/"));
      }).not.toThrow();

      expect(() => {
        m.expect(document).toMatch({
          title: m.stringContaining("TypeScript"),
          content: m.stringStartingWith("This document"),
          author: m.stringEndingWith("@company.com"),
          tags: [
            m.or(
              m.stringMatching(/^type/),
              m.stringStartingWith("javasc"),
              m.stringContaining("program")
            ),
          ],
          url: m.stringStartingWith("/docs/"),
        });
      }).not.toThrow();
    });

    it("should match using instanceOf matcher", () => {
      const data = {
        timestamp: new Date("2024-01-01"),
        pattern: /test-\d+/,
        metadata: {
          createdAt: new Date("2024-01-01T10:00:00Z"),
          config: {
            regex: /[a-z]+/,
          },
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          timestamp: m.instanceOf(Date),
          pattern: m.instanceOf(RegExp),
          metadata: {
            createdAt: m.instanceOf(Date),
            config: {
              regex: m.instanceOf(RegExp),
            },
          },
        });
      }).not.toThrow();
    });

    it("should match using isOneOf matcher", () => {
      const config = {
        environment: "production",
        logLevel: "info",
        features: {
          auth: {
            provider: "oauth2",
            method: "bearer",
          },
          cache: {
            type: "redis",
            ttl: 3600,
          },
        },
      };

      expect(() => {
        m.expect(config).toMatch({
          environment: m.isOneOf(["development", "staging", "production"]),
          logLevel: m.isOneOf(["debug", "info", "warn", "error"]),
          features: {
            auth: {
              provider: m.isOneOf(["oauth2", "saml", "ldap"]),
              method: m.isOneOf(["bearer", "basic", "digest"]),
            },
            cache: {
              type: m.isOneOf(["memory", "redis", "memcached"]),
            },
          },
        });
      }).not.toThrow();
    });

    it("should match using mixed matchers in complex scenarios", () => {
      const userActivity = {
        userId: "user-456",
        sessions: [
          {
            sessionId: "sess-abc123",
            startTime: new Date("2024-01-01T09:00:00Z"),
            endTime: new Date("2024-01-01T17:00:00Z"),
            actions: [
              { type: "login", timestamp: "2024-01-01T09:00:00Z" },
              {
                type: "page_view",
                timestamp: "2024-01-01T09:05:00Z",
                url: "/dashboard",
              },
              {
                type: "click",
                timestamp: "2024-01-01T09:10:00Z",
                element: "button",
              },
            ],
            metadata: {
              userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              ipAddress: "192.168.1.100",
            },
          },
        ],
      };

      expect(() => {
        m.expect(userActivity).toMatch({
          userId: m.validates(z.string().startsWith("user-")),
          sessions: [
            {
              sessionId: m.anyString(),
              startTime: m.instanceOf(Date),
              endTime: m.instanceOf(Date),
              actions: [
                {
                  type: m.isOneOf(["login", "logout", "page_view", "click"]),
                  timestamp: m.validates(z.string().datetime()),
                },
                {
                  type: "page_view",
                  url: m.stringStartingWith("/"),
                },
                {
                  type: m.anyString(),
                  element: m.validates(z.string().min(1)),
                },
              ],
              metadata: {
                userAgent: m.stringContaining("Mozilla"),
                ipAddress: m.validates(z.string().ip()),
              },
            },
          ],
        });
      }).not.toThrow();
    });
  });

  describe("Error Paths", () => {
    it("should throw when anyString matcher fails", () => {
      const data = {
        name: 123,
      };

      expect(() => {
        m.expect(data).toMatch({
          name: m.anyString(),
        });
      }).toThrow();
    });

    it("should throw when anyNumber matcher fails", () => {
      const data = {
        age: "thirty",
      };

      expect(() => {
        m.expect(data).toMatch({
          age: m.anyNumber(),
        });
      }).toThrow();
    });

    it("should throw when validates matcher fails", () => {
      const user = {
        email: "invalid-email",
        age: -5,
      };

      expect(() => {
        m.expect(user).toMatch({
          email: m.validates(z.string().email()),
        });
      }).toThrow();

      expect(() => {
        m.expect(user).toMatch({
          age: m.validates(z.number().positive()),
        });
      }).toThrow();
    });

    it("should throw when string matchers fail", () => {
      const document = {
        title: "Introduction to Python",
        content: "Welcome to this tutorial",
        author: "user@domain.org",
      };

      expect(() => {
        m.expect(document).toMatch({
          title: m.stringContaining("TypeScript"),
        });
      }).toThrow();

      expect(() => {
        m.expect(document).toMatch({
          content: m.stringStartingWith("Hello"),
        });
      }).toThrow();

      expect(() => {
        m.expect(document).toMatch({
          author: m.stringEndingWith(".com"),
        });
      }).toThrow();
    });

    it("should throw when instanceOf matcher fails", () => {
      const data = {
        timestamp: "2024-01-01",
        pattern: "not-a-regex",
      };

      expect(() => {
        m.expect(data).toMatch({
          timestamp: m.instanceOf(Date),
        });
      }).toThrow();

      expect(() => {
        m.expect(data).toMatch({
          pattern: m.instanceOf(RegExp),
        });
      }).toThrow();
    });

    it("should throw when isOneOf matcher fails", () => {
      const config = {
        environment: "testing",
        logLevel: "trace",
      };

      expect(() => {
        m.expect(config).toMatch({
          environment: m.isOneOf(["development", "staging", "production"]),
        });
      }).toThrow();

      expect(() => {
        m.expect(config).toMatch({
          logLevel: m.isOneOf(["debug", "info", "warn", "error"]),
        });
      }).toThrow();
    });

    it("should throw when matchers fail in nested structures", () => {
      const apiResponse = {
        status: "error",
        data: {
          user: {
            id: 123,
            profile: {
              email: "invalid-email",
            },
          },
        },
      };

      expect(() => {
        m.expect(apiResponse).toMatch({
          status: m.validates(z.literal("success")),
        });
      }).toThrow();

      expect(() => {
        m.expect(apiResponse).toMatch({
          data: {
            user: {
              id: m.anyString(),
            },
          },
        });
      }).toThrow();

      expect(() => {
        m.expect(apiResponse).toMatch({
          data: {
            user: {
              profile: {
                email: m.validates(z.string().email()),
              },
            },
          },
        });
      }).toThrow();
    });

    it("should throw when array matchers fail", () => {
      const data = {
        tags: ["javascript", 123, "programming"],
        scores: ["high", "medium", "low"],
      };

      // Failing case
      expect(() => {
        m.expect(data).toMatch({
          tags: ["javascript", 123, m.anyBoolean()],
        });
      }).toThrow();

      // Equivalent working case (with exact values combined with a matcher)
      expect(() => {
        m.expect(data).toMatch({
          tags: ["javascript", 123, m.anyString()],
        });
      }).not.toThrow();

      expect(() => {
        m.expect(data).toMatch({
          scores: ["high", "medium", m.anyNumber()],
        });
      }).toThrow();
    });

    it("should throw when complex matcher combinations fail", () => {
      const userActivity = {
        userId: "invalid-user-id",
        sessions: [
          {
            sessionId: "",
            actions: [{ type: "invalid_action", timestamp: "not-a-date" }],
            metadata: {
              userAgent: "",
              ipAddress: "invalid-ip",
            },
          },
        ],
      };

      expect(() => {
        m.expect(userActivity).toMatch({
          userId: m.validates(z.string().startsWith("user-")),
          sessions: [
            {
              sessionId: m.validates(z.string().min(5)),
              actions: [
                {
                  type: m.isOneOf(["login", "logout", "page_view", "click"]),
                  timestamp: m.validates(z.string().datetime()),
                },
              ],
              metadata: {
                userAgent: m.validates(z.string().min(10)),
                ipAddress: m.validates(z.string().ip()),
              },
            },
          ],
        });
      }).toThrow();
      // Equivalent working case
      expect(() => {
        m.expect(userActivity).toMatch({
          userId: m.validates(z.string().includes("user-")),
          sessions: [
            {
              sessionId: "",
              actions: [
                {
                  type: m.isOneOf([
                    "login",
                    "logout",
                    "page_view",
                    "click",
                    "invalid_action",
                  ]),
                  timestamp: "not-a-date",
                },
              ],
              metadata: {
                userAgent: m.anyString(),
                ipAddress: m.anyString(),
              },
            },
          ],
        });
      }).not.toThrow();
    });
  });
});
