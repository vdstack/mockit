import { m } from "../..";

/**
 * Testing toMatch function specifically for edge cases and boundary conditions.
 * This tests how toMatch handles unusual values, extreme nesting, and JavaScript edge cases.
 */
describe("Assertion.toMatch.edge-cases", () => {
  describe("Happy Paths", () => {
    it("should handle null and undefined values correctly", () => {
      const dataWithNulls = {
        explicitNull: null,
        explicitUndefined: undefined,
        nested: {
          alsoNull: null,
          alsoUndefined: undefined,
        },
      };

      expect(() => {
        m.expect(dataWithNulls).toMatch({
          explicitNull: null,
          nested: {
            alsoNull: null,
          },
        });
      }).not.toThrow();

      expect(() => {
        m.expect(dataWithNulls).toMatch({
          explicitUndefined: undefined,
          nested: {
            alsoUndefined: undefined,
          },
        });
      }).not.toThrow();
    });

    it("should handle empty objects and arrays", () => {
      const dataWithEmpties = {
        emptyObject: {},
        emptyArray: [],
        nested: {
          alsoEmptyObject: {},
          alsoEmptyArray: [],
        },
      };

      expect(() => {
        m.expect(dataWithEmpties).toMatch({
          emptyObject: {},
          emptyArray: [],
        });
      }).not.toThrow();

      expect(() => {
        m.expect(dataWithEmpties).toMatch({
          nested: {
            alsoEmptyObject: {},
            alsoEmptyArray: [],
          },
        });
      }).not.toThrow();
    });

    it("should handle special JavaScript number values", () => {
      const specialNumbers = {
        positiveInfinity: Infinity,
        negativeInfinity: -Infinity,
        notANumber: NaN,
        negativeZero: -0,
        positiveZero: +0,
        nested: {
          moreSpecialNumbers: {
            infinity: Infinity,
            nan: NaN,
          },
        },
      };

      expect(() => {
        m.expect(specialNumbers).toMatch({
          positiveInfinity: Infinity,
          negativeInfinity: -Infinity,
        });
      }).not.toThrow();

      expect(() => {
        m.expect(specialNumbers).toMatch({
          notANumber: NaN,
        });
      }).not.toThrow();

      expect(() => {
        m.expect(specialNumbers).toMatch({
          nested: {
            moreSpecialNumbers: {
              infinity: Infinity,
            },
          },
        });
      }).not.toThrow();
    });

    it("should handle Date objects", () => {
      const dataWithDates = {
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-02T12:30:00Z"),
        nested: {
          timestamps: {
            start: new Date("2024-01-01T09:00:00Z"),
            end: new Date("2024-01-01T17:00:00Z"),
          },
        },
      };

      expect(() => {
        m.expect(dataWithDates).toMatch({
          createdAt: new Date("2024-01-01T00:00:00Z"),
        });
      }).not.toThrow();

      expect(() => {
        m.expect(dataWithDates).toMatch({
          nested: {
            timestamps: {
              start: new Date("2024-01-01T09:00:00Z"),
            },
          },
        });
      }).not.toThrow();
    });

    it("should handle RegExp objects", () => {
      const dataWithRegexps = {
        emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phonePattern: /^\+?[\d\s-()]+$/,
        nested: {
          validation: {
            uuidPattern:
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          },
        },
      };

      expect(() => {
        m.expect(dataWithRegexps).toMatch({
          emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        });
      }).not.toThrow();

      expect(() => {
        m.expect(dataWithRegexps).toMatch({
          nested: {
            validation: {
              uuidPattern:
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
            },
          },
        });
      }).not.toThrow();
    });

    it("should handle symbol properties (if supported)", () => {
      const sym1 = Symbol("test1");
      const sym2 = Symbol("test2");

      const dataWithSymbols = {
        normalProp: "value",
        [sym1]: "symbol value 1",
        nested: {
          [sym2]: "symbol value 2",
          anotherProp: "another value",
        },
      };

      expect(() => {
        m.expect(dataWithSymbols).toMatch({
          normalProp: "value",
        });
      }).not.toThrow();

      expect(() => {
        m.expect(dataWithSymbols).toMatch({
          nested: {
            anotherProp: "another value",
          },
        });
      }).not.toThrow();
    });

    it("should handle very deep nesting", () => {
      const createDeepObject = (depth: number): any => {
        if (depth === 0) return { value: "deep" };
        return { level: createDeepObject(depth - 1) };
      };

      const deepData = createDeepObject(20);

      const createDeepMatch = (depth: number): any => {
        if (depth === 0) return { value: "deep" };
        return { level: createDeepMatch(depth - 1) };
      };

      expect(() => {
        m.expect(deepData).toMatch(createDeepMatch(20));
      }).not.toThrow();

      const deepDataAt5 = createDeepObject(5);

      // Test partial matching at various depths
      expect(() => {
        m.expect(deepDataAt5).toMatch({
          level: {
            level: {
              level: {
                level: {
                  level: {
                    value: "deep",
                  },
                },
              },
            },
          },
        });
      }).not.toThrow();
    });

    it("should handle large arrays with many elements", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        value: i * 2,
        metadata: {
          index: i,
          isEven: i % 2 === 0,
        },
      }));

      expect(() => {
        m.expect(largeArray).toMatch([
          {
            id: "item-0",
            metadata: {
              isEven: true,
            },
          },
          {
            id: "item-1",
            value: 2,
          },
        ]);
      }).not.toThrow();
    });

    it("should handle mixed data types in objects", () => {
      const mixedData = {
        string: "text",
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: "value" },
        nullValue: null,
        undefinedValue: undefined,
        date: new Date("2024-01-01"),
        regex: /test/,
        function: () => "function result",
        nested: {
          moreMixed: {
            infinity: Infinity,
            nan: NaN,
            emptyArray: [],
            emptyObject: {},
          },
        },
      };

      expect(() => {
        m.expect(mixedData).toMatch({
          string: "text",
          number: 42,
          object: {
            nested: "value",
          },
        });
      }).not.toThrow();

      expect(() => {
        m.expect(mixedData).toMatch({
          nested: {
            moreMixed: {
              infinity: Infinity,
              emptyArray: [],
            },
          },
        });
      }).not.toThrow();
    });

    it("should handle objects with numeric string keys", () => {
      const dataWithNumericKeys = {
        "0": "first",
        "1": "second",
        "42": "answer",
        nested: {
          "100": {
            value: "hundred",
          },
        },
      };

      expect(() => {
        m.expect(dataWithNumericKeys).toMatch({
          "0": "first",
          "42": "answer",
        });
      }).not.toThrow();

      expect(() => {
        m.expect(dataWithNumericKeys).toMatch({
          nested: {
            "100": {
              value: "hundred",
            },
          },
        });
      }).not.toThrow();
    });

    it("should handle sparse arrays", () => {
      const sparseArray = new Array(10);
      sparseArray[0] = "first";
      sparseArray[5] = "middle";
      sparseArray[9] = "last";

      const dataWithSparseArray = {
        sparse: sparseArray,
        nested: {
          anotherSparse: sparseArray,
        },
      };

      expect(() => {
        m.expect(dataWithSparseArray).toMatch({
          sparse: sparseArray,
        });
      }).not.toThrow();
    });
  });

  describe("Error Paths", () => {
    it("should throw when null doesn't match expected value", () => {
      const data = {
        value: null,
        nested: {
          alsoNull: null,
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          // @ts-expect-error - TypeScript should catch type mismatches
          value: "not null", // Should be null
        });
      }).toThrow();

      expect(() => {
        m.expect(data).toMatch({
          nested: {
            // @ts-expect-error - TypeScript should catch type mismatches
            alsoNull: "not null", // Should be null
          },
        });
      }).toThrow();
    });

    it("should throw when undefined doesn't match expected value", () => {
      const data = {
        value: undefined,
        nested: {
          alsoUndefined: undefined,
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          // @ts-expect-error - TypeScript should catch type mismatches
          value: "not undefined", // Should be undefined
        });
      }).toThrow();
    });

    it("should throw when special numbers don't match", () => {
      const data = {
        value: Infinity,
        nested: {
          nan: NaN,
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          value: -Infinity, // Should be Infinity
        });
      }).toThrow();

      expect(() => {
        m.expect(data).toMatch({
          nested: {
            nan: 42, // Should be NaN
          },
        });
      }).toThrow();
    });

    it("should throw when Date objects don't match", () => {
      const data = {
        timestamp: new Date("2024-01-01T00:00:00Z"),
        nested: {
          createdAt: new Date("2024-01-02T00:00:00Z"),
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          timestamp: new Date("2024-01-02T00:00:00Z"), // Wrong date
        });
      }).toThrow();

      expect(() => {
        m.expect(data).toMatch({
          nested: {
            createdAt: new Date("2024-01-01T00:00:00Z"), // Wrong date
          },
        });
      }).toThrow();
    });

    it("should throw when RegExp objects don't match", () => {
      const data = {
        pattern: /^test$/,
        nested: {
          validation: /^\d+$/,
        },
      };

      expect(() => {
        m.expect(data).toMatch({
          pattern: /^different$/, // Wrong pattern
        });
      }).toThrow();

      expect(() => {
        m.expect(data).toMatch({
          nested: {
            validation: /^[a-z]+$/, // Wrong pattern
          },
        });
      }).toThrow();
    });

    it("should throw when deep nested values don't match", () => {
      const createDeepObject = (depth: number, finalValue: string): any => {
        if (depth === 0) return { value: finalValue };
        return { level: createDeepObject(depth - 1, finalValue) };
      };

      const deepData = createDeepObject(10, "correct");

      expect(() => {
        m.expect(deepData).toMatch(createDeepObject(10, "incorrect"));
      }).toThrow();
    });

    it("should throw when large array element doesn't match", () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        value: i,
      }));

      expect(() => {
        m.expect(largeArray).toMatch([
          {
            id: "item-0",
            value: 0,
          },
          {
            id: "item-1",
            value: 999, // Wrong value - should be 1
          },
        ]);
      }).toThrow();
    });

    it("should throw when mixed type doesn't match", () => {
      const mixedData = {
        string: "text",
        number: 42,
        nested: {
          boolean: true,
          array: [1, 2, 3],
        },
      };

      expect(() => {
        m.expect(mixedData).toMatch({
          // @ts-expect-error - TypeScript should catch type mismatches
          string: 123, // Wrong type - should be string
        });
      }).toThrow();

      expect(() => {
        m.expect(mixedData).toMatch({
          nested: {
            // @ts-expect-error - TypeScript should catch type mismatches
            boolean: "true", // Wrong type - should be boolean
          },
        });
      }).toThrow();
    });

    it("should throw with very deep mismatch", () => {
      const createDeepMismatch = (depth: number): any => {
        if (depth === 0) return { value: "wrong" };
        return { level: createDeepMismatch(depth - 1) };
      };

      const deepData = {
        level: {
          level: {
            level: {
              level: {
                level: {
                  value: "correct",
                },
              },
            },
          },
        },
      };

      expect(() => {
        m.expect(deepData).toMatch(createDeepMismatch(5));
      }).toThrow();
    });
  });
});
