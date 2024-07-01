import { z } from "zod";
import { Mock, getMockHistory } from "../..";
import { schema } from "../../behaviours/matchers";

test("spied function should give access to its calls", () => {
  const mock = Mock((x: number, y: string) => {});
  const spy = getMockHistory(mock);

  expect(spy.getCalls()).toEqual([]);

  mock(1, "hello");
  mock(2, "world");

  expect(spy.getCalls()).toEqual([
    { args: [1, "hello"], date: expect.any(Date) },
    { args: [2, "world"], date: expect.any(Date) },
  ]);
});

test("spy should assert if a function was called", () => {
  const mock = Mock((x: number, y: string) => {});
  const mockHistory = getMockHistory(mock);

  expect(mockHistory.wasCalled()).toBe(false);
  expect(mockHistory.wasCalledOnce()).toBe(false);
  expect(mockHistory.wasNeverCalled()).toBe(true);
  expect(mockHistory.wasCalledWith(1, "hello")).toBe(false);
  expect(mockHistory.wasCalledWith(2, "world")).toBe(false);
  expect(mockHistory.wasCalledNTimes(1)).toBe(false);
  expect(
    mockHistory.wasCalledNTimesWith({ args: [1, "hello"], howMuch: 1 })
  ).toBe(false);

  mock(1, "hello");

  expect(mockHistory.wasCalled()).toBe(true);
  expect(mockHistory.wasCalledOnce()).toBe(true);
  expect(mockHistory.wasNeverCalled()).toBe(false);
  expect(mockHistory.wasCalledWith(1, "hello")).toBe(true);
  expect(mockHistory.wasCalledWith(2, "world")).toBe(false);
  expect(mockHistory.wasCalledNTimes(1)).toBe(true);
  expect(
    mockHistory.wasCalledNTimesWith({ args: [1, "hello"], howMuch: 1 })
  ).toBe(true);

  mock(1, "hello");
  mock(2, "world");

  expect(mockHistory.wasCalledNTimes(1)).toBe(false);
  expect(mockHistory.wasCalledNTimes(2)).toBe(false);
  expect(mockHistory.wasCalledNTimes(3)).toBe(true);

  expect(
    mockHistory.wasCalledNTimesWith({ args: [1, "hello"], howMuch: 1 })
  ).toBe(false);
  expect(
    mockHistory.wasCalledNTimesWith({ args: [1, "hello"], howMuch: 2 })
  ).toBe(true);
  expect(
    mockHistory.wasCalledNTimesWith({ args: [2, "world"], howMuch: 1 })
  ).toBe(true);
});

test("spy should assert if a function was called with arguments", () => {
  const mock = Mock((x: number, y: string) => {});
  const mockHistory = getMockHistory(mock);

  expect(mockHistory.wasCalledOnceWith(1, "hello")).toBe(false);
  expect(mockHistory.wasNeverCalledWith(1, "hello")).toBe(true);
  expect(mockHistory.wasCalledWith(1, "hello")).toBe(false);
  expect(
    mockHistory.wasCalledNTimesWith({
      args: [1, "hello"],
      howMuch: 1,
    })
  ).toBe(false);

  mock(1, "hello");

  expect(mockHistory.wasCalledOnceWith(1, "hello")).toBe(true);
  expect(mockHistory.wasNeverCalledWith(1, "hello")).toBe(false);
  expect(mockHistory.wasCalledWith(1, "hello")).toBe(true);
  expect(
    mockHistory.wasCalledNTimesWith({
      args: [1, "hello"],
      howMuch: 1,
    })
  ).toBe(true);
});

test("spy should accept zod schemas as arguments", () => {
  const mock = Mock((x: number, y: string) => {});
  const mockHistory = getMockHistory(mock);

  expect(
    mockHistory.wasCalledWith(schema(z.number()), schema(z.string()))
  ).toBe(false);
  expect(
    mockHistory.wasCalledOnceWith(schema(z.number()), schema(z.string()))
  ).toBe(false);
  expect(
    mockHistory.wasNeverCalledWith(schema(z.number()), schema(z.string()))
  ).toBe(true);
  expect(
    mockHistory.wasCalledNTimesWith({
      args: [schema(z.number()), schema(z.string())],
      howMuch: 1,
    })
  ).toBe(false);

  mock(1, "hello");

  expect(
    mockHistory.wasCalledWith(schema(z.number()), schema(z.string()))
  ).toBe(true);
  expect(
    mockHistory.wasCalledOnceWith(schema(z.number()), schema(z.string()))
  ).toBe(true);
  expect(
    mockHistory.wasNeverCalledWith(schema(z.number()), schema(z.string()))
  ).toBe(false);
  expect(
    mockHistory.wasCalledNTimesWith({
      args: [schema(z.number()), schema(z.string())],
      howMuch: 1,
    })
  ).toBe(true);

  mock(1, "hello");

  expect(
    mockHistory.wasCalledNTimesWith({
      args: [schema(z.number()), schema(z.string())],
      howMuch: 1,
    })
  ).toBe(false);
  expect(
    mockHistory.wasCalledNTimesWith({
      args: [schema(z.number()), schema(z.string())],
      howMuch: 2,
    })
  ).toBe(true);
});

test("spy should accept zod schemas alongside any values", () => {
  const mock = Mock((x: number, y: string) => {});
  const spy = getMockHistory(mock);

  expect(spy.wasCalledWith(schema(z.number()), "hello")).toBe(false);
  expect(spy.wasCalledOnceWith(schema(z.number()), "hello")).toBe(false);
  expect(spy.wasNeverCalledWith(schema(z.number()), "hello")).toBe(true);
  expect(
    spy.wasCalledNTimesWith({
      args: [schema(z.number()), "hello"],
      howMuch: 1,
    })
  ).toBe(false);

  mock(1, "hello");

  expect(spy.wasCalledWith(schema(z.number()), "hello")).toBe(true);
  expect(spy.wasCalledOnceWith(schema(z.number()), "hello")).toBe(true);
  expect(spy.wasNeverCalledWith(schema(z.number()), "hello")).toBe(false);
  expect(
    spy.wasCalledNTimesWith({
      args: [schema(z.number()), "hello"],
      howMuch: 1,
    })
  ).toBe(true);

  mock(1, "hello");

  expect(
    spy.wasCalledNTimesWith({ args: [schema(z.number()), "hello"], howMuch: 1 })
  ).toBe(false);
  expect(
    spy.wasCalledNTimesWith({ args: [schema(z.number()), "hello"], howMuch: 2 })
  ).toBe(true);
});
