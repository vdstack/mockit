import { Mockit } from "../../../mockit";
import { z } from "zod";

function hello(...args: any[]) {}

describe("Spy: with deep objects and arrays", () => {
  it("work for an any argument in the first level of an object", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith({ a: z.string() }).atLeastOnce).toBe(false);
    mock({ a: 1 });
    expect(spy.wasCalledWith({ a: z.string() }).atLeastOnce).toBe(false);
    mock({ a: "hello" });
    expect(spy.wasCalledWith({ a: z.string() }).atLeastOnce).toBe(true);
  });

  it("should work for level 2 argument", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith({ a: { b: z.string() } }).atLeastOnce).toBe(false);
    mock({ a: { b: 1 } });
    expect(spy.wasCalledWith({ a: { b: z.string() } }).atLeastOnce).toBe(false);
    mock({ a: { b: "hello" } });
    expect(spy.wasCalledWith({ a: { b: z.string() } }).atLeastOnce).toBe(true);
  });

  it("should work for a complex object", () => {
    const object = {
      x: 1,
      y: { z: { w: { a: z.string() } } },
      b: true,
      c: [1, 2, z.string().email()],
      z: { w: { a: z.function() } },
      list: [
        1,
        2,
        3,
        4,
        {
          x: 1,
          y: { z: { w: { a: z.set(z.any()) } } },
        },
      ],
    };

    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(object).atLeastOnce).toBe(false);
    mock({
      x: 1,
      y: { z: { w: { a: "hell" } } },
      b: true,
      c: [1, 2, "not an email"],
      z: { w: { a: "not a function" } },
    });
    expect(spy.wasCalledWith(object).atLeastOnce).toBe(false);

    mock({
      x: 1,
      y: { z: { w: { a: "hello" } } },
      b: true,
      c: [1, 2, "vdcd120491@gmail.com"],
      z: { w: { a: () => {} } },
      list: [
        1,
        2,
        3,
        4,
        {
          x: 1,
          y: { z: { w: { a: new Set() } } },
        },
      ],
    });

    expect(spy.wasCalledWith(object).atLeastOnce).toBe(true);
  });

  it("should allow multiple complex objects", () => {
    const schemas = [
      {
        x: 1,
        y: { z: { w: { a: z.string() } } },
      },
      {
        y: z.number(),
      },
    ];

    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(...schemas).atLeastOnce).toBe(false);
    mock();
    expect(spy.wasCalledWith(...schemas).atLeastOnce).toBe(false);
    mock({ x: 1, y: { z: { w: { a: "hello" } } } });
    expect(spy.wasCalledWith(...schemas).atLeastOnce).toBe(false);
    mock({ y: 1 });
    expect(spy.wasCalledWith(...schemas).atLeastOnce).toBe(false);
    mock({ x: 1, y: { z: { w: { a: "hello" } } } }, { y: 1 });
    expect(spy.wasCalledWith(...schemas).atLeastOnce).toBe(true);
  });
});
