import { z } from "zod";
import { Mock, verifyThat } from "../..";
import { matchers, schema } from "../../behaviours/matchers";

function hellaw(...args: (string | number)[]) {
  return args;
}

function typedHello(x: number, y: string, z: boolean) {
  return [x, y, z];
}

test("verifyThat should assert if a function was called once", () => {
  const mock = Mock(hellaw);
  verifyThat(mock).wasNeverCalled();
  verifyThat(mock).wasCalledNTimes(0);

  mock();

  verifyThat(mock).wasCalledOnce();
  verifyThat(mock).wasCalledNTimes(1);
  verifyThat(mock).wasCalled();
});

test("verifyThat should assert if a function was called with specific arguments", () => {
  const mock = Mock(hellaw);
  verifyThat(mock).wasNeverCalledWith(1, 2, 3);
  verifyThat(mock).wasCalledNTimesWith({ args: [1, 2, 3], howMuch: 0 });

  mock(1, 2, 3);

  verifyThat(mock).wasCalledWith(1, 2, 3);
  verifyThat(mock).wasCalledOnceWith(1, 2, 3);
  verifyThat(mock).wasCalledNTimesWith({ args: [1, 2, 3], howMuch: 1 });
  verifyThat(mock).wasCalled();
});

test("verifyThat should assert if a function was called with data matching zod schemas", () => {
  const mock = Mock(hellaw);
  verifyThat(mock).wasNeverCalledWith(
    schema(schema(z.number())),
    schema(z.string())
  );
  verifyThat(mock).wasCalledNTimesWith({
    args: [schema(z.number()), schema(z.string())],
    howMuch: 0,
  });

  mock(1, "hello");

  verifyThat(mock).wasCalledWith(schema(z.number()), schema(z.string()));
  verifyThat(mock).wasCalledOnceWith(schema(z.number()), schema(z.string()));
  verifyThat(mock).wasCalledNTimesWith({
    args: [schema(z.number()), schema(z.string())],
    howMuch: 1,
  });
});

test("verifyThat should assert if a function was called with a combination of zod schemas and regular arguments", () => {
  const mock = Mock(typedHello);
  verifyThat(mock).wasNeverCalledWith(1, schema(z.string()), false);
  verifyThat(mock).wasCalledNTimesWith({
    args: [1, schema(z.string()), false],
    howMuch: 0,
  });

  mock(1, "x", false);

  verifyThat(mock).wasCalledWith(1, schema(z.string()), schema(z.boolean()));
  verifyThat(mock).wasCalledOnceWith(
    schema(
      z
        .number()
        .positive()
        .int()
        .refine((v) => v < 10)
    ),
    schema(z.string()),
    false
  );
  verifyThat(mock).wasCalledNTimesWith({
    args: [1, "x", matchers.schema(z.boolean())],
    howMuch: 1,
  });
});
