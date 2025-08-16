import { m } from "../..";

/**
 * You will find quite a lot of // @ts-expect-error comments in this file.
 * It IS EXPECTED, since we're testing a function that is type-safe with invalid inputs.
 *
 */
describe("Assertion.toMatch.deep-nesting", () => {
  describe("Happy Paths", () => {
    it("should match 3-level deep partial matching", () => {
      const user = {
        id: "123",
        profile: {
          personal: {
            name: "John",
            age: 30,
            email: "john@example.com",
          },
          preferences: {
            theme: "dark",
            language: "en",
          },
        },
        metadata: {
          created: "2024-01-01",
          updated: "2024-01-15",
        },
      };

      expect(() => {
        m.expect(user).toMatch({
          profile: {
            personal: {
              name: "John",
            },
          },
        });
      }).not.toThrow();
    });

    it("should match 5+ level deep nesting", () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  level6: {
                    value: "deep",
                    count: 42,
                    isActive: true,
                  },
                  otherData: "ignored",
                },
                moreData: "ignored",
              },
              extraData: "ignored",
            },
            additionalData: "ignored",
          },
          someData: "ignored",
        },
        topLevel: "ignored",
      };

      expect(() => {
        m.expect(deepObject).toMatch({
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: {
                    level6: {
                      value: "deep",
                      count: 42,
                    },
                  },
                },
              },
            },
          },
        });
      }).not.toThrow();
    });

    it("should match mixed partial and complete properties at different levels", () => {
      const config = {
        database: {
          connection: {
            host: "localhost",
            port: 5432,
            credentials: {
              username: "admin",
              password: "secret",
              database: "myapp",
            },
          },
          pool: {
            min: 2,
            max: 10,
            timeout: 30000,
          },
        },
        server: {
          port: 3000,
          host: "0.0.0.0",
        },
      };

      expect(() => {
        m.expect(config).toMatch({
          database: {
            connection: {
              host: "localhost",
              port: 5432,
              credentials: {
                username: "admin",
                password: "secret",
                database: "myapp",
              },
            },
          },
          server: {
            port: 3000,
          },
        });
      }).not.toThrow();
    });

    it("should match sparse deep matching (only deepest properties)", () => {
      const apiResponse = {
        status: "success",
        data: {
          users: [
            {
              id: "1",
              profile: {
                personal: {
                  name: "Alice",
                  contact: {
                    email: "alice@example.com",
                    phone: "+1234567890",
                    address: {
                      street: "123 Main St",
                      city: "New York",
                      country: "USA",
                      coordinates: {
                        lat: 40.7128,
                        lng: -74.006,
                      },
                    },
                  },
                },
              },
            },
          ],
          pagination: {
            page: 1,
            total: 100,
          },
        },
      };

      expect(() => {
        m.expect(apiResponse).toMatch({
          data: {
            users: [
              {
                profile: {
                  personal: {
                    contact: {
                      address: {
                        coordinates: {
                          lat: 40.7128,
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        });
      }).not.toThrow();
    });

    it("should match when intermediate objects have additional properties", () => {
      const document = {
        header: {
          title: "My Document",
          author: "John Doe",
          metadata: {
            created: "2024-01-01",
            version: "1.0",
            tags: ["important", "draft"],
            settings: {
              format: "pdf",
              encryption: true,
              permissions: {
                read: true,
                write: false,
                copy: false,
                annotations: {
                  allowed: true,
                  types: ["highlight", "note"],
                },
              },
            },
          },
        },
        content: {
          sections: [],
        },
      };

      expect(() => {
        m.expect(document).toMatch({
          header: {
            metadata: {
              settings: {
                permissions: {
                  annotations: {
                    allowed: true,
                  },
                },
              },
            },
          },
        });
      }).not.toThrow();
    });

    it("should match empty objects at various nesting levels", () => {
      const structure = {
        a: {
          b: {
            c: {
              d: "value",
            },
            e: "other",
          },
        },
      };

      expect(() => {
        m.expect(structure).toMatch({
          a: {},
        });
      }).not.toThrow();

      expect(() => {
        m.expect(structure).toMatch({
          a: {
            b: {},
          },
        });
      }).not.toThrow();

      expect(() => {
        m.expect(structure).toMatch({
          a: {
            b: {
              c: {},
            },
          },
        });
      }).not.toThrow();
    });
  });

  describe("Error Paths", () => {
    it("should throw when type mismatches at deep levels", () => {
      const user = {
        profile: {
          settings: {
            theme: "dark",
          },
        },
      };

      expect(() => {
        m.expect(user).toMatch({
          profile: {
            settings: {
              theme: "light",
            },
          },
        });
      }).toThrow();
    });

    it("should throw when missing intermediate objects", () => {
      const data = {
        level1: {
          level2: {
            value: "exists",
          },
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          level1: {
            level2: {
              // @ts-expect-error - we want to test the error path
              level3: {
                value: "missing",
              },
            },
          },
        });
      }).toThrow();
    });

    it("should throw when attempting to match primitive at intermediate level", () => {
      const data = {
        config: {
          setting: "value",
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          config: {
            // @ts-expect-error - we want to test the error path
            setting: {
              nested: "should fail",
            },
          },
        });
      }).toThrow();
    });

    it("should throw when deep property has wrong type", () => {
      const config = {
        database: {
          connection: {
            port: 5432,
          },
        },
      };

      expect(() => {
        m.expect(config).toMatch({
          database: {
            connection: {
              // @ts-expect-error - we want to test the error path
              port: "5432",
            },
          },
        });
      }).toThrow();
    });

    it("should throw when deeply nested array content doesn't match", () => {
      const data = {
        response: {
          data: {
            items: [
              {
                id: "1",
                values: [1, 2, 3],
              },
            ],
          },
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          response: {
            data: {
              items: [
                {
                  values: [1, 2, 4],
                },
              ],
            },
          },
        });
      }).toThrow();
    });

    it("should throw when expected structure is deeper than actual", () => {
      const shallow = {
        a: {
          b: "value",
        },
      };

      expect(() => {
        m.expect(shallow).toMatch({
          a: {
            // @ts-expect-error - we want to test the error path
            b: {
              c: {
                d: "too deep",
              },
            },
          },
        });
      }).toThrow();
    });

    it("should throw when null appears where object is expected in deep structure", () => {
      const dataWithNull = {
        config: {
          settings: null,
        },
      };

      expect(() => {
        m.expect(dataWithNull).toMatch({
          config: {
            // @ts-expect-error - we want to test the error path
            settings: {
              theme: "dark",
            },
          },
        });
      }).toThrow();
    });

    it("should throw when undefined appears in deep matching chain", () => {
      const dataWithUndefined = {
        level1: {
          level2: undefined,
        },
      };

      expect(() => {
        m.expect(dataWithUndefined).toMatch({
          level1: {
            // @ts-expect-error - we want to test the error path
            level2: {
              level3: "value",
            },
          },
        });
      }).toThrow();
    });
  });
});
