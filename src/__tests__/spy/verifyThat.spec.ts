import { z } from "zod";
import { mockFunction, verifyThat } from "../..";

function hellaw(...args: any[]) {
  return args;
}

function typedHello(x: number, y: string, z: boolean) {
  return [x, y, z];
}

test("verifyThat should assert if a function was called once", () => {
  const mock = mockFunction(hellaw);
  verifyThat(mock).wasNeverCalled();
  verifyThat(mock).wasCalledNTimes(0);

  mock();

  verifyThat(mock).wasCalledOnce();
  verifyThat(mock).wasCalledNTimes(1);
  verifyThat(mock).wasCalled();
});

test("verifyThat should assert if a function was called with specific arguments", () => {
  const mock = mockFunction(hellaw);
  verifyThat(mock).wasNeverCalledWith(1, 2, 3);
  verifyThat(mock).wasCalledNTimesWith({ args: [1, 2, 3], howMuch: 0 });

  mock(1, 2, 3);

  verifyThat(mock).wasCalledWith(1, 2, 3);
  verifyThat(mock).wasCalledOnceWith(1, 2, 3);
  verifyThat(mock).wasCalledNTimesWith({ args: [1, 2, 3], howMuch: 1 });
  verifyThat(mock).wasCalled();
});

test("verifyThat should assert if a function was called with data matching zod schemas", () => {
  const mock = mockFunction(hellaw);
  verifyThat(mock).zod.wasNeverCalledWith(z.number(), z.string());
  verifyThat(mock).zod.wasCalledNTimesWith({
    args: [z.number(), z.string()],
    howMuch: 0,
  });

  mock(1, "hello");

  verifyThat(mock).zod.wasCalledWith(z.number(), z.string());
  verifyThat(mock).zod.wasCalledOnceWith(z.number(), z.string());
  verifyThat(mock).zod.wasCalledNTimesWith({
    args: [z.number(), z.string()],
    howMuch: 1,
  });
});

test("verifyThat should assert if a function was called with a combination of zod schemas and regular arguments", () => {
  const mock = mockFunction(typedHello);
  verifyThat(mock).zod.wasNeverCalledWith(1, z.string(), false);
  verifyThat(mock).zod.wasCalledNTimesWith({
    args: [1, z.string(), false],
    howMuch: 0,
  });

  mock(1, "x", false);

  verifyThat(mock).zod.wasCalledWith(1, z.string(), z.boolean());
  verifyThat(mock).zod.wasCalledOnceWith(
    z
      .number()
      .positive()
      .int()
      .refine((v) => v < 10),
    z.string(),
    false
  );
  verifyThat(mock).zod.wasCalledNTimesWith({
    args: [1, "x", z.boolean()],
    howMuch: 1,
  });
});
