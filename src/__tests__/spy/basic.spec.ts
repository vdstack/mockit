import { z } from "zod";
import { mockFunction, getMockHistory } from "../..";

test("spied function should give access to its calls", () => {
  const mock = mockFunction((x: number, y: string) => {});
  const spy = getMockHistory(mock);

  expect(spy.getCalls()).toEqual([]);
  expect(spy.getUnsafeCalls()).toEqual([]);

  mock(1, "hello");
  mock(2, "world");

  expect(spy.getCalls()).toEqual([
    { args: [1, "hello"], date: expect.any(Date) },
    { args: [2, "world"], date: expect.any(Date) },
  ]);
});

test("spy should assert if a function was called", () => {
  const mock = mockFunction((x: number, y: string) => {});
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

test("spy should assert if a function was called with unsafe arguments", () => {
  const mock = mockFunction((x: number, y: string) => {});
  const mockHistory = getMockHistory(mock);

  expect(mockHistory.unsafe.wasCalledOnceWith(1, "hello")).toBe(false);
  expect(mockHistory.unsafe.wasNeverCalledWith(1, "hello")).toBe(true);
  expect(mockHistory.unsafe.wasCalledWith(1, "hello")).toBe(false);
  expect(
    mockHistory.unsafe.wasCalledNTimesWith({
      args: [1, "hello"],
      howMuch: 1,
    })
  ).toBe(false);

  mock(1, "hello");

  expect(mockHistory.unsafe.wasCalledOnceWith(1, "hello")).toBe(true);
  expect(mockHistory.unsafe.wasNeverCalledWith(1, "hello")).toBe(false);
  expect(mockHistory.unsafe.wasCalledWith(1, "hello")).toBe(true);
  expect(
    mockHistory.unsafe.wasCalledNTimesWith({
      args: [1, "hello"],
      howMuch: 1,
    })
  ).toBe(true);
});

test("spy should accept zod schemas as arguments", () => {
  const mock = mockFunction((x: number, y: string) => {});
  const mockHistory = getMockHistory(mock);

  expect(mockHistory.zod.wasCalledWith(z.number(), z.string())).toBe(false);
  expect(mockHistory.zod.wasCalledOnceWith(z.number(), z.string())).toBe(false);
  expect(mockHistory.zod.wasNeverCalledWith(z.number(), z.string())).toBe(true);
  expect(
    mockHistory.zod.wasCalledNTimesWith({
      args: [z.number(), z.string()],
      howMuch: 1,
    })
  ).toBe(false);

  mock(1, "hello");

  expect(mockHistory.zod.wasCalledWith(z.number(), z.string())).toBe(true);
  expect(mockHistory.zod.wasCalledOnceWith(z.number(), z.string())).toBe(true);
  expect(mockHistory.zod.wasNeverCalledWith(z.number(), z.string())).toBe(
    false
  );
  expect(
    mockHistory.zod.wasCalledNTimesWith({
      args: [z.number(), z.string()],
      howMuch: 1,
    })
  ).toBe(true);

  mock(1, "hello");

  expect(
    mockHistory.zod.wasCalledNTimesWith({
      args: [z.number(), z.string()],
      howMuch: 1,
    })
  ).toBe(false);
  expect(
    mockHistory.zod.wasCalledNTimesWith({
      args: [z.number(), z.string()],
      howMuch: 2,
    })
  ).toBe(true);
});

test("spy should accept zod schemas alongside any values", () => {
  const mock = mockFunction((x: number, y: string) => {});
  const spy = getMockHistory(mock);

  expect(spy.zod.wasCalledWith(z.number(), "hello")).toBe(false);
  expect(spy.zod.wasCalledOnceWith(z.number(), "hello")).toBe(false);
  expect(spy.zod.wasNeverCalledWith(z.number(), "hello")).toBe(true);
  expect(
    spy.zod.wasCalledNTimesWith({
      args: [z.number(), "hello"],
      howMuch: 1,
    })
  ).toBe(false);

  mock(1, "hello");

  expect(spy.zod.wasCalledWith(z.number(), "hello")).toBe(true);
  expect(spy.zod.wasCalledOnceWith(z.number(), "hello")).toBe(true);
  expect(spy.zod.wasNeverCalledWith(z.number(), "hello")).toBe(false);
  expect(
    spy.zod.wasCalledNTimesWith({
      args: [z.number(), "hello"],
      howMuch: 1,
    })
  ).toBe(true);

  mock(1, "hello");

  expect(
    spy.zod.wasCalledNTimesWith({ args: [z.number(), "hello"], howMuch: 1 })
  ).toBe(false);
  expect(
    spy.zod.wasCalledNTimesWith({ args: [z.number(), "hello"], howMuch: 2 })
  ).toBe(true);
});
