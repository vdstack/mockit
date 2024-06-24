import { z } from "zod";
import { Mock, Reset, when } from "../..";
import { schema, unsafe } from "../../behaviours/constructs";
import { randomUUID } from "crypto";

function hello(...args: any[]) {
  return "hello world" as const;
}

function returnNumber(...args: any[]) {
  return 2;
}

describe("thenReturn", () => {
  it("should return undefined by default", () => {
    expect(Mock(hello)()).toBe(undefined);
  });

  it("should return the desired value", () => {
    const mock = Mock(returnNumber);
    expect(mock()).toBe(undefined);
    when(mock).isCalled.thenReturn(999);
    expect(mock()).toBe(999);
  });

  it("should combine default and custom behaviours", () => {
    const mock = Mock(returnNumber);
    when(mock).isCalled.thenReturn(999);
    when(mock).isCalledWith(2).thenReturn(777);

    expect(mock()).toBe(999);
    expect(mock(2)).toBe(777);
  });
});


test("test new zod comparison", () => {
  function toTest(params: any) {}

  const mock = Mock(toTest);
  expect(mock({ name: -1 })).toBe(undefined);

  when(mock).isCalledWith({ name: schema(z.number().int().negative()) }).thenReturn(unsafe(999));

  expect(mock({ name: -1 })).toBe(999);

  Reset.completely(mock);

  when(mock).isCalledWith({
    x: schema(z.array(z.number().int().positive())),
    y: schema(z.array(z.number().int().negative())),
    z: 2
  }).thenReturn(unsafe("ding"));

  expect(mock({ x: [1, 2], y: [-1, -2], z: 2 })).toBe("ding");
  expect(mock({ x: [1, 2], y: [-1, -2], z: 3 })).toBe(undefined);
  expect(mock({ x: ["Victor", "D"], y: [-1, -2], z: 2 })).toBe(undefined);
  expect(mock({ x: [1, 2], y: ["Victor", "D"], z: 2 })).toBe(undefined);

  Reset.completely(mock);

  when(mock).isCalledWith({
    x: schema(z.set(z.number().int().positive())),
    y: schema(z.set(z.number().int().negative())),
    z: 2
  }).thenReturn(unsafe("ding"));

  expect(mock({ x: new Set([1, 2]), y: new Set([-1, -2]), z: 2 })).toBe("ding");
  expect(mock({ x: new Set(["V", "D"]), y: new Set([-1, -2]), z: 2 })).toBe(undefined);
  expect(mock({ x: new Set([1, 2]), y: new Set(["V", "D"]), z: 2 })).toBe(undefined);
  expect(mock({ x: new Set([1, 2]), y: new Set([-1, -2]), z: 3 })).toBe(undefined);

  Reset.completely(mock);

  when(mock).isCalledWith({
    x: {
      y: {
        z: {
          a: {
            b: {
              c: 
              schema(z.string().uuid())
            }
          }
        }
      }
    }
  }).thenReturn(unsafe("ding"));

  expect(mock(1)).toBeUndefined();
  expect(mock("v")).toBeUndefined();
  expect(mock({})).toBeUndefined();

  // this does not work
  expect(mock({
    x: {
      y: {
        z: {
          a: {
            b: {
              c: "not an uuid"
            }
          }
        }
      }
    }
  })).toBeUndefined();

  expect(mock({
    x: {
      y: {
        z: {
          a: {
            b: {
              c: randomUUID()
            }
          }
        }
      }
    }
  })).toEqual("ding");

});
