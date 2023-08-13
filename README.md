[![npm version](https://badge.fury.io/js/@vdstack%2Fmockit.svg)](https://badge.fury.io/js/@vdstack%2Fmockit)

Mockit solves the problem of [mocking the behaviour](https://martinfowler.com/articles/mocksArentStubs.html) of injected dependencies in Typescript. With its help, patterns like Strategy become super easy to unit test. Its API was inspired by Java's Mockito package, but has now divered diverged at some point.

Mockit API can mock any dependencies like functions, classes and even abstract classes and interfaces, with minimum effort, maximum flexibility and readability.

```ts
const mockedFunc = mockFunction(original);

when(mockedFunc).isCalled.thenReturn(2);

mockedFunc(); // 2

when(mockedFunc).isCalledWith("Victor").thenReturn(42);

mockedFunc(); // 2
mockedFunc("Victor"); // 42
```

You can then verify how the mock was called.

```ts
const mockedFunc = mockFunction(original);
mockedFunc("hello", "world");
mockedFunc();

verifyThat(mockedFunc).wasCalledTwice();
verifyThat(mockedFunc).wasCalledOnceWith("hello", "world");
```

These verifications are assertive, meaning they will throw a detailed error if the mock was not called the way you expected it to be. No assertion library necessary !

Finally, you can leverage the power of the [Zod](https://github.com/colinhacks/zod) library's schemas to make make assertions on the nature of the parameters passed to your mocks.

```ts
const mockedFunc = mockFunction(original);
mockedFunc({ name: "Victor", age: 42 });

verifyThat(mockedFunc).wasCalledOnceWith(
  z.object({
    name: z.string(),
    age: z.number().positive().int(),
  })
);
```

Feel free to contribute :)

- [Mocks](#mocks)
  - [Different types of mocks](#different-types-of-mocks)
    - [Function](#function)
    - [Class](#class)
    - [Interfaces and types](#interfaces-and-types)
    - [Abstract classes](#abstract-classes)
  - [Default behaviour](#default-behaviour)
  - [Custom behaviour](#custom-behaviour)
- [Verification](#verification)
  - [Was the function called ?](#was-the-function-called-)
  - [How was the function called ?](#how-was-the-function-called-)
  - [Integration with Zod](#integration-with-zod)
- [TODO: Document old spies API](#todo-document-old-spies-api)
- [TODO: Document the new Reset API.](#todo-document-the-new-reset-api)

# Mocks

## Different types of mocks

You can mock functions, classes, abstract classes, interfaces and types.

### Function

```ts
function hello() {
  /**/
}
const mockedHello = mockFunction(hello);
mockedHello();
```

### Class

```ts
class Hello {
  public sayHello() {
    /**/
  }
}

const mockedHello = mock(Hello);
mockedHello.sayHi();
```

### Interfaces and types

In TypeScript, you cannot use types at runtime. This is a big limitation for us if we want to generate a mock from a type.

To do that, we created a `mockInterface` function that accepts any type as a generic. It will then require you to input which functions you want to mock, but will use the generic to provide a typesafe list of available functions.

```ts
// Interfaces
interface Hello {
  sayHello(): string;
  sayHi(): string;
}

const helloMock = mockInterface<Hello>("sayHello");
helloMock.sayHello();

// Types (it is the same)
type Hola = {
  sayHola(): string;
  sayBonjour(): string;
};

const holaMock = mockInterface<Hola>("sayHola");
holaMock.sayHola();
```

### Abstract classes

Abstract classes are a special beast, they're both classes and types, as they can contain real implementations and abstract methods.
If you need to mock the behaviour the abstract methods of an abstract class, you can use the `mockAbstract` function.

```ts
abstract class Hello {
  public abstract sayHello(): string;
}

const mock = mockAbstract(Hello, ["sayHello"]);
mock.sayHello();
```

Note that you can also use `mockInterface` !

If you need to mock the behaviour of the concrete methods of an abstract class, you can use the `mock` function.

```ts
abstract class Hello {
  public abstract sayHello(): string;
  public sayHi() {
    return "hi";
  }
}

const mock = mock(Hello);
mock.sayHi();
```

## Default behaviour

By default, any mocked function will return undefined.
You can change this default behaviour using the `when` helper.

```ts
const mockedFunc = mockFunction(original);

when(mockedFunc).isCalled.thenReturn(2);
mockedFunc(); // 2

when(mockedFunc).isCalled.thenThrow(new Error("something went wrong"));
mockedFunc(); // throws Error("something went wrong")

when(mockedFunc).isCalled.thenResolve(2);
mockedFunc(); // Promise.resolves(2)

when(mockedFunc).isCalled.thenReject(new Error("something went wrong"));
mockedFunc(); // Promise.rejects(Error("something went wrong"))

when(mockedFunc).isCalled.thenCall((...args) => {
  console.log(args);
});
mockedFunc("hiii"); // logs ["hiii"]
```

Note that `thenReturn` and `thenResolve` are type-safe by default.

If you don't care about the type of the returned value, you can use `thenReturnUnsafe` and `thenResolveUnsafe`. We don't recommend you doing it very often though, as invalid responses should be part of your function signature in the first place.

## Custom behaviour

There might be cases where you want to set a specific behaviour for a specific set of arguments. To do that, you can use the `isCalledWith` helper, which accepts any set of arguments.

```ts
const mockedFunc = mockFunction(original);

when(mockedFunc).isCalledWith("hiii").thenReturn(2);
when(mockedFunc)
  .isCalledWith("hello")
  .thenThrow(new Error("something went wrong"));
when(mockedFunc).isCalledWith("please throw").thenResolve(2);
when(mockedFunc)
  .isCalledWith("please reject")
  .thenReject(new Error("something went wrong"));
when(mockedFunc)
  .isCalledWith("please call")
  .thenCall((...args) => {
    console.log(args);
  });
```

`isCalledWith` is type-safe by default. This is both a help for DX (hinting you with the type of the arguments you can pass) and a safety net (you cannot pass arguments that don't match the mocked function's signature) which makes your test code more maintainable.

If you don't care about the type of the returned value, you can use `isCalledWithUnsafe`. It can help when testing for specific arguments, but we don't recommend you using it since invalid arguments should be part of your function signature in the first place.

# Verification

Mockit provides a `verifyThat` helper that allows you to assert that a mocked function has been called the way you expected it to be. It can also integrate with the amazing [Zod](https://github.com/colinhacks/zod) library to provide you with a powerful way to check if your mocked functions have been called with arguments matching a validation schema.

## Was the function called ?

```ts
const mockedFunc = mockFunction(original);
verifyThat(mockedFunc).wasNeverCalled();

mockedFunc();

verifyThat(mockedFunc).wasCalledOnce();
verifyThat(mockedFunc).wasCalledAtLeastOnce();

mockedFunc();
verifyThat(mockedFunc).wasCalledTwice();

mockedFunc();
verifyThat(mockedFunc).wasCalledThrice();

mockedFunc();
verifyThat(mockedFunc).wasCalledNTimes(4);
```

These assertions are exclusive, meaning that a function that was called twice cannot be called once, and vice versa.

## How was the function called ?

```ts
const mockedFunc = mockFunction(original);

mockedFunc("hiii");

verifyThat(mockedFunc).wasCalledOnceWith("hiii");
verifyThat(mockedFunc).wasNeverCalledWith("hello");

mockedFunc("hello");
mockedFunc("hello");

verifyThat(mockedFunc).wasCalledTwiceWith("hello");
verifyThat(mockedFunc).wasCalledNTimesWith(2, "hello");
```

All wasCalledXXXWith functions are type-safe. This is both a help for DX (hinting you with the type of the arguments you can pass) and a safety net (you cannot check against obsolete or invalid arguments, which makes your test code more maintainable).

If you don't care about the type of the returned value, you can use `wasCalledXXXWithUnsafe`. It can help when testing for invalid parameters in some cases.

## Integration with Zod

Zod is a powerful library that allows you to validate data. Mockit integrates with Zod to provide you with a powerful way to check if your mocked functions have been called with arguments matching a validation schema. It can help a lot when you don't control the values passed to your mocked functions, and want to make sure they are valid. For example, if your test generated a random email using faker, you can avoid the need to store this email somewhere, and instead check that your mock was called with an email.

You don't need to provide complete schemas if you know some values, you can use partial schemas as well.

When using zod schemas, you're stuck in type-unsafe mode. z.string() is not a string, which makes it impossible (or at least very hard, we didn't try fixing it yet) to accept corresponding zod schemas in the type-safe mode. With some ts-wizardly magic it could maybe happen.

```ts
function randomUser() {
  return {
    email: faker.internet.email(),
  };
}
type EmailService = {
  sendEmail(params: { email: string; template: string }): Promise<void>;
};

it("should send a welcome email to the user", () => {
  const EmailService = mockService<EmailService>("sendEmail");
  await sendWelcomeEmail(randomUser(), EmailService);
  verifyThat(EmailService.sendEmail).wasCalledOnceWithUnsafe({
    email: z.string().email(), // no need to check the exact email value
    template: "welcome.mjml",
  });
});
```

## TODO: Document old spies API

## TODO: Document the new Reset API.
