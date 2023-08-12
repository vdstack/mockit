import { z } from "zod";

import { mockFunction, verifyThat } from "../../mockit";

function hello(a: string, b: number) {}

it("should work with zod", () => {
  const mockedFunction = mockFunction(hello);
  expect(() =>
    verifyThat(mockedFunction).wasCalledOnceWithUnsafe(z.string(), z.string())
  ).toThrow();
  expect(() =>
    verifyThat(mockedFunction).wasCalledOnceWithUnsafe(z.string())
  ).toThrow();
  expect(() =>
    verifyThat(mockedFunction).wasCalledAtLeastOnceWithUnsafe(z.string())
  ).toThrow();

  // @ts-expect-error - We are testing with unsafe arguments on purpose
  mockedFunction();
  // @ts-expect-error
  mockedFunction("hello", "world");

  expect(() =>
    verifyThat(mockedFunction).wasCalledOnceWithUnsafe(z.string())
  ).toThrow();
  verifyThat(mockedFunction).wasCalledOnceWithUnsafe(z.string(), z.string());
  verifyThat(mockedFunction).wasCalledOnceWithUnsafe(z.any(), z.any());
  verifyThat(mockedFunction).wasCalledAtLeastOnceWithUnsafe(
    z.string(),
    z.string()
  );
  verifyThat(mockedFunction).wasCalledAtLeastOnceWithUnsafe(z.any(), z.any());

  expect(() =>
    verifyThat(mockedFunction).wasCalledOnceWithUnsafe(
      z.any(),
      z.string(),
      z.number()
    )
  ).toThrow();
});
