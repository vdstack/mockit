import { m } from "../..";

/**
 * Testing toMatch function with complex mixed data structures:
 * - Objects containing arrays of objects
 * - Arrays containing objects with nested arrays
 * - Mixed structures combining multiple levels of nesting
 * - Real-world-like data structures
 */
describe("Assertion.toMatch.complex-structures", () => {
  describe("Happy Paths", () => {
    it("should match objects containing arrays of objects", () => {
      const userProfile = {
        id: "user-123",
        personal: {
          name: "John Doe",
          email: "john@example.com",
        },
        posts: [
          {
            id: "post-1",
            title: "First Post",
            content: "Hello world",
            tags: ["intro", "hello"],
            metadata: {
              likes: 42,
              shares: 12,
              comments: 5,
            },
          },
          {
            id: "post-2",
            title: "Second Post",
            content: "More content",
            tags: ["update", "news"],
            metadata: {
              likes: 28,
              shares: 8,
              comments: 3,
            },
          },
        ],
        settings: {
          privacy: "public",
          notifications: true,
        },
      };

      expect(() => {
        m.expect(userProfile).toMatch({
          id: "user-123",
          posts: [
            {
              title: "First Post",
              metadata: {
                likes: 42,
              },
            },
            {
              title: "Second Post",
              tags: ["update", "news"],
            },
          ],
        });
      }).not.toThrow();
    });

    it("should match arrays containing objects with nested arrays", () => {
      const shoppingCarts = [
        {
          cartId: "cart-1",
          userId: "user-123",
          items: [
            {
              productId: "prod-1",
              name: "Laptop",
              quantity: 1,
              variants: [
                { type: "color", value: "silver" },
                { type: "storage", value: "512GB" },
              ],
            },
            {
              productId: "prod-2",
              name: "Mouse",
              quantity: 2,
              variants: [
                { type: "color", value: "black" },
                { type: "wireless", value: true },
              ],
            },
          ],
          totals: {
            subtotal: 1029.98,
            tax: 82.4,
            total: 1112.38,
          },
        },
        {
          cartId: "cart-2",
          userId: "user-456",
          items: [
            {
              productId: "prod-3",
              name: "Keyboard",
              quantity: 1,
              variants: [
                { type: "layout", value: "US" },
                { type: "switches", value: "mechanical" },
              ],
            },
          ],
          totals: {
            subtotal: 129.99,
            tax: 10.4,
            total: 140.39,
          },
        },
      ];

      expect(() => {
        m.expect(shoppingCarts).toMatch([
          {
            cartId: "cart-1",
            items: [
              {
                name: "Laptop",
                variants: [{ type: "color", value: "silver" }],
              },
              {
                name: "Mouse",
              },
            ],
          },
          {
            totals: {
              subtotal: 129.99,
            },
          },
        ]);
      }).not.toThrow();
    });

    it("should match API response with deeply nested structure", () => {
      const apiResponse = {
        status: "success",
        data: {
          users: [
            {
              id: "1",
              profile: {
                personal: {
                  name: "Alice",
                  contacts: [
                    {
                      type: "email",
                      value: "alice@example.com",
                      primary: true,
                    },
                    { type: "phone", value: "+1234567890", primary: false },
                  ],
                },
                professional: {
                  company: "TechCorp",
                  positions: [
                    {
                      title: "Senior Developer",
                      department: "Engineering",
                      skills: ["JavaScript", "TypeScript", "React"],
                      projects: [
                        { name: "Project A", status: "completed" },
                        { name: "Project B", status: "in-progress" },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          pagination: {
            currentPage: 1,
            totalPages: 5,
            itemsPerPage: 10,
            totalItems: 50,
          },
        },
        metadata: {
          requestId: "req-123",
          timestamp: "2024-01-01T00:00:00Z",
        },
      };

      expect(() => {
        m.expect(apiResponse).toMatch({
          status: "success",
          data: {
            users: [
              {
                profile: {
                  personal: {
                    contacts: [{ type: "email", primary: true }],
                  },
                  professional: {
                    positions: [
                      {
                        title: "Senior Developer",
                        projects: [
                          { name: "Project A" },
                          { status: "in-progress" },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            pagination: {
              currentPage: 1,
              totalPages: 5,
            },
          },
        });
      }).not.toThrow();
    });

    it("should match configuration object with mixed array and object nesting", () => {
      const appConfig = {
        database: {
          connections: [
            {
              name: "primary",
              config: {
                host: "localhost",
                port: 5432,
                credentials: {
                  username: "admin",
                  password: "secret",
                },
                pools: [
                  { name: "read", size: 5 },
                  { name: "write", size: 3 },
                ],
              },
            },
            {
              name: "cache",
              config: {
                host: "redis-host",
                port: 6379,
                options: {
                  ttl: 3600,
                  maxmemory: "100mb",
                },
              },
            },
          ],
        },
        services: {
          apis: [
            {
              name: "user-service",
              endpoints: [
                { path: "/users", methods: ["GET", "POST"] },
                { path: "/users/:id", methods: ["GET", "PUT", "DELETE"] },
              ],
              middleware: [
                { type: "auth", config: { required: true } },
                { type: "ratelimit", config: { rpm: 100 } },
              ],
            },
          ],
        },
      };

      expect(() => {
        m.expect(appConfig).toMatch({
          database: {
            connections: [
              {
                name: "primary",
                config: {
                  pools: [{ name: "read" }],
                },
              },
            ],
          },
          services: {
            apis: [
              {
                endpoints: [{ path: "/users", methods: ["GET", "POST"] }],
                middleware: [{ type: "auth" }],
              },
            ],
          },
        });
      }).not.toThrow();
    });

    it("should match tree-like structures with recursive nesting", () => {
      const fileSystem = {
        name: "root",
        type: "directory",
        children: [
          {
            name: "src",
            type: "directory",
            children: [
              {
                name: "components",
                type: "directory",
                children: [
                  { name: "Button.tsx", type: "file", size: 1024 },
                  { name: "Input.tsx", type: "file", size: 2048 },
                ],
              },
              { name: "index.ts", type: "file", size: 512 },
            ],
          },
          {
            name: "docs",
            type: "directory",
            children: [
              { name: "README.md", type: "file", size: 4096 },
              { name: "API.md", type: "file", size: 8192 },
            ],
          },
          { name: "package.json", type: "file", size: 1536 },
        ],
      };

      expect(() => {
        m.expect(fileSystem).toMatch({
          name: "root",
          children: [
            {
              name: "src",
              children: [
                {
                  name: "components",
                  children: [{ name: "Button.tsx", type: "file" }],
                },
              ],
            },
            {
              children: [{ name: "README.md" }],
            },
          ],
        });
      }).not.toThrow();
    });
  });

  describe("Error Paths", () => {
    it("should throw when nested array content in object doesn't match", () => {
      const data = {
        categories: [
          { name: "Tech", items: ["laptop", "phone"] },
          { name: "Books", items: ["novel", "textbook"] },
        ],
      };

      expect(() => {
        m.expect(data).toMatch({
          categories: [
            { name: "Tech", items: ["laptop", "tablet"] },
            { name: "Books", items: ["novel", "textbook"] },
          ],
        });
      }).toThrow();
    });

    it("should throw when object properties in nested arrays don't match", () => {
      const orders = [
        {
          orderId: "order-1",
          items: [
            { productId: "1", quantity: 2, price: 10.0 },
            { productId: "2", quantity: 1, price: 20.0 },
          ],
        },
      ];

      expect(() => {
        m.expect(orders).toMatch([
          {
            orderId: "order-1",
            items: [
              { productId: "1", quantity: 3, price: 10.0 },
              { productId: "2", quantity: 1, price: 20.0 },
            ],
          },
        ]);
      }).toThrow();
    });

    it("should throw when deeply nested structure has type mismatch", () => {
      const complex = {
        level1: {
          level2: [
            {
              level3: {
                level4: [
                  {
                    level5: {
                      value: "string",
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      expect(() => {
        m.expect(complex).toMatch({
          level1: {
            level2: [
              {
                level3: {
                  level4: [
                    {
                      level5: {
                        // @ts-expect-error - we want to test the error path
                        value: 42,
                      },
                    },
                  ],
                },
              },
            ],
          },
        });
      }).toThrow();
    });

    it("should throw when expected array structure doesn't exist in nested object", () => {
      const data = {
        config: {
          items: ["a", "b", "c"],
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          config: {
            items: ["a", "b", "c", "d"],
          },
        });
      }).toThrow();
    });

    it("should throw when missing expected nested array in object", () => {
      const userWithoutPosts = {
        id: "user-123",
        name: "John",
        settings: { theme: "dark" },
      };

      expect(() => {
        m.expect(userWithoutPosts).toMatch({
          id: "user-123",
          // @ts-expect-error - we want to test the error path
          posts: [{ title: "Any Post" }],
        });
      }).toThrow();
    });

    it("should throw when null appears in complex nested structure", () => {
      const dataWithNull = {
        users: [
          {
            profile: null,
          },
        ],
      };

      expect(() => {
        m.expect(dataWithNull).toMatch({
          users: [
            {
              // @ts-expect-error - we want to test the error path
              profile: {
                name: "Expected",
              },
            },
          ],
        });
      }).toThrow();
    });

    it("should throw when array length mismatch in nested structure", () => {
      const data = {
        sections: [
          { title: "Section 1", items: ["item1"] },
          { title: "Section 2", items: ["item2", "item3"] },
        ],
      };

      expect(() => {
        m.expect(data).toMatch({
          sections: [
            { title: "Section 1", items: ["item1"] },
            { title: "Section 2", items: ["item2", "item3", "item4"] },
          ],
        });
      }).toThrow();
    });

    it("should throw when structural mismatch in deeply nested arrays", () => {
      const matrix = [
        [{ coords: [1, 2] }, { coords: [3, 4] }],
        [{ coords: [5, 6] }, { coords: [7, 8] }],
      ];

      expect(() => {
        m.expect(matrix).toMatch([
          [{ coords: [1, 2] }, { coords: [3, 4] }],
          [{ coords: [5, 6] }, { coords: [7, 9] }],
        ]);
      }).toThrow();
    });
  });
});
