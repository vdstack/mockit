import { mockFunction, spyMockedFunction } from "../../../v3";

test("spied function should give access to its calls", () => {
  const mock = mockFunction((x: number, y: string) => {});
  const spy = spyMockedFunction(mock);

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
  const spy = spyMockedFunction(mock);

  expect(spy.wasCalled()).toBe(false);
  expect(spy.wasCalledOnce()).toBe(false);
  expect(spy.wasNeverCalled()).toBe(true);
  expect(spy.wasCalledWith(1, "hello")).toBe(false);
  expect(spy.wasCalledWith(2, "world")).toBe(false);
  expect(spy.wasCalledNTimes(1)).toBe(false);
  expect(spy.wasCalledNTimesWith({ args: [1, "hello"], howMuch: 1 })).toBe(
    false
  );

  mock(1, "hello");

  expect(spy.wasCalled()).toBe(true);
  expect(spy.wasCalledOnce()).toBe(true);
  expect(spy.wasNeverCalled()).toBe(false);
  expect(spy.wasCalledWith(1, "hello")).toBe(true);
  expect(spy.wasCalledWith(2, "world")).toBe(false);
  expect(spy.wasCalledNTimes(1)).toBe(true);
  expect(spy.wasCalledNTimesWith({ args: [1, "hello"], howMuch: 1 })).toBe(
    true
  );

  mock(1, "hello");
  mock(2, "world");

  expect(spy.wasCalledNTimes(1)).toBe(false);
  expect(spy.wasCalledNTimes(2)).toBe(false);
  expect(spy.wasCalledNTimes(3)).toBe(true);

  expect(spy.wasCalledNTimesWith({ args: [1, "hello"], howMuch: 1 })).toBe(
    false
  );
  expect(spy.wasCalledNTimesWith({ args: [1, "hello"], howMuch: 2 })).toBe(
    true
  );
  expect(spy.wasCalledNTimesWith({ args: [2, "world"], howMuch: 1 })).toBe(
    true
  );
});

test("spy should assert if a function was called with unsafe arguments", () => {
  const mock = mockFunction((x: number, y: string) => {});
  const spy = spyMockedFunction(mock);

  expect(spy.unsafe.wasCalledOnceWith(1, "hello")).toBe(false);
  expect(spy.unsafe.wasNeverCalledWith(1, "hello")).toBe(true);
  expect(spy.unsafe.wasCalledWith(1, "hello")).toBe(false);
  expect(
    spy.unsafe.wasCalledNTimesWith({
      args: [1, "hello"],
      howMuch: 1,
    })
  ).toBe(false);

  mock(1, "hello");

  expect(spy.unsafe.wasCalledOnceWith(1, "hello")).toBe(true);
  expect(spy.unsafe.wasNeverCalledWith(1, "hello")).toBe(false);
  expect(spy.unsafe.wasCalledWith(1, "hello")).toBe(true);
  expect(
    spy.unsafe.wasCalledNTimesWith({
      args: [1, "hello"],
      howMuch: 1,
    })
  ).toBe(true);
});
