import { z } from "zod";
import {
  mock,
  mockAbstract,
  mockFunction,
  mockInterface,
  suppose,
  verify,
} from "../../mockit";

function hello(..._args: any[]) {}

describe("suppose then verify", () => {
  it("should pass if the function has been called at least once", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalled.atLeastOnce();

    mock();
    verify(mock);
  });

  it("should throw if the function has not been called", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalled.atLeastOnce();

    expect(() => verify(mock)).toThrow();
  });

  it("should pass allow multiple suppositions", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalled.atLeastOnce();
    suppose(mock).willBeCalled.twice();

    mock();
    mock();
    verify(mock);
  });

  it("should not pass if the function has not been called enough times", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalled.twice();

    mock();
    expect(() => verify(mock)).toThrow();

    mock();
    verify(mock);
  });

  it("should work with specific arguments", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalledWith("hello").once();

    mock("hello");
    verify(mock);

    suppose(mock).willBeCalledWith(2).atLeastOnce();
    expect(() => verify(mock)).toThrow();

    mock(2);
    verify(mock);
  });

  it("should accept zod schemas", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalledWith(z.number()).once();

    mock(2);
    verify(mock);

    suppose(mock).willBeCalledWith(z.string()).once();

    mock("hello");
    verify(mock);
  });

  it.only("should accept multiple complex arguments on multiple suppositions", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalledWith(z.number(), z.string()).once();
    suppose(mock).willBeCalledWith(z.string(), z.number()).once();
    suppose(mock)
      .willBeCalledWith(
        z.object({
          hello: z.string(),
          world: z.number(),
          todayIs: z.date(),
        })
      )
      .twice();

    mock(2, "hello");
    expect(() => verify(mock)).toThrow(); // only one supposition is valid

    mock("hello", 2);
    expect(() => verify(mock)).toThrow(); // only two supposition are valid

    mock({
      hello: "hello",
      world: 2,
      todayIs: new Date(),
    });
    expect(() => verify(mock)).toThrow(); // the last supposition is not complete: it needs another call

    verify(mock);
    mock({
      hello: "hello",
      world: 2,
      todayIs: new Date(),
    });

    verify(mock);
  });

  it("should allow to check if something has not been called", () => {
    const mock = mockFunction(hello);
    suppose(mock).willNotBeCalled();

    verify(mock);

    mock();
    expect(() => verify(mock)).toThrow();
  });

  it("should allow to check if something has not been called with specific arguments", () => {
    const mock = mockFunction(hello);
    suppose(mock).willNotBeCalledWith("hello");

    verify(mock);

    mock(2);
    verify(mock);

    mock("hello");
    expect(() => verify(mock)).toThrow();
  });

  it("should allow to verify multiple mocks in one call", () => {
    const mock = mockFunction(hello);
    const mock2 = mockFunction(hello);

    suppose(mock).willBeCalled.once();
    suppose(mock2).willBeCalled.twice();

    expect(() => verify(mock, mock2)).toThrow();

    mock();

    expect(() => verify(mock, mock2)).toThrow();

    mock2();
    mock2();

    verify(mock, mock2);
  });

  it("should allow to verify structured mocks (classes & interfaces) instead of their individual functions", () => {
    interface HelloInterface {
      hello(..._args: any[]): void;
    }

    class HelloClass {
      hello(..._args: any[]): void {}
    }

    abstract class HelloAbstractClass {
      abstract hello(..._args: any[]): void;
    }

    const interfaceMock = mockInterface<HelloInterface>("hello");

    suppose(interfaceMock.hello).willBeCalled.once();
    expect(() => verify(interfaceMock)).toThrow();
    interfaceMock.hello();
    verify(interfaceMock);

    const classMock = mock(HelloClass);
    suppose(classMock.hello).willBeCalled.once();
    expect(() => verify(classMock)).toThrow();
    classMock.hello();
    verify(classMock);

    const abstractClassMock = mockAbstract(HelloAbstractClass, ["hello"]);
    suppose(abstractClassMock.hello).willBeCalled.once();
    expect(() => verify(abstractClassMock)).toThrow();
    abstractClassMock.hello();
    verify(abstractClassMock);

    verify(interfaceMock, classMock, abstractClassMock);
  });
});
