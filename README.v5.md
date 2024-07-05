[![npm version](https://badge.fury.io/js/@vdstack%2Fmockit.svg)](https://badge.fury.io/js/@vdstack%2Fmockit)

Mockit solves the problem of [mocking the behaviour](https://martinfowler.com/articles/mocksArentStubs.html) of injected dependencies in Typescript. With its help, patterns like Strategy, or Ports & Adapters, become super easy to unit test. Its API was inspired by Java's Mockito package, but has diverged along the way. Mockito's knowledge is easily transferable though.

Mockit API can mock any dependency:

- functions: `Mock(originalFunction)`
- classes: `Mock(originalClass)`
- Abstract classes: `Mock(abstractClass)`
- Object modules: `Mock(originalObject)`
- Types and interfaces: `Mock<Type>()` or `Mock<Interface>()`

It provides a semantic API that is easy to use, as well **as complete type-safety**, which helps a LOT when writing tests, as it provides auto-completion and type-checking alerting you of any invalid test setup.

```ts
const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenReturn(2);
when(mockedFunc).isCalledWith("Victor").thenReturn(42);

mockedFunc(); // 2
mockedFunc("Victor"); // 42
```

You can also verify how the mock was called.

```ts
const mockedFunc = Mock(original);
mockedFunc("hello", "world");

// All these assertions are valid.
verifyThat(mockedFunc).wasCalledOnce();
verifyThat(mockedFunc).wasCalledOnceWith("hello", "world");
verifyThat(mockedFunc).wasCalledNTimes(1);

// This assertion is invalid: it will throw an error.
verifyThat(mockedFunc).wasCalledNTimes(2);
```

These verifications are assertive, meaning your test will fail if the mock was not called the way you expected it to be. No assertion library necessary !
They are agnostic of the test runner and assertion library you use.

You can access more under-the-hood features like reading the history of calls.

```ts
const mockedFunc = Mock(original);
mockedFunc("hello", "world");

getMockHistory(mockedFunc).getCalls(); // [{ args: ["hello", "world"], date: a Date }]
```

Finally, you can leverage a whole suite of matchers.

Matchers are a powerful tool to make your tests more resilient to changes in the implementation, and more focused on the logic you want to test.
They can be used both in the `when` and `verifyThat` functions.

Matchers will pass compilation in place of the expected value, which makes them very easy to use.
Matchers can also be combined to create more complex matchers.

```ts
const mockedFunc = Mock(original);

/**
 * Here the matcher m.schema combined with a zod parser can help you create a more resilient test.
 *
 * If the implementation changes anything but the age, the test will still pass.
 */

when(mockedFunc)
  .isCalledWith(m.objectContaining({ age: m.schema(z.number().gte(18)) }))
  .thenReturn("adult");

const response = mockedFunc({
  name: "Victor",
  age: 42,
  email: "vic@vic.fr",
  nationality: "French",
  hobbies: ["coding", "reading", "making music", "video games"],
});

expect(response).toBe("adult");

/**
 * Here the matcher m.arrayContaining combined with m.any.string() can help you create a more resilient test: hobbies values are not important as long as they are an array of strings.
 *
 * Similarly, the m.objectContaining matcher is used to avoid checking properties that are not important for the test: you focus on the age and hobbies properties.
 */
verifyThat(mockedFunc).wasCalledOnceWith(
  m.objectContaining({
    age: m.schema(z.number().int().positive()),
    hobbies: m.arrayContaining(m.any.string()),
  })
);
```

# Mock

You can mock functions, classes, abstract classes, objects, interfaces and types with the same function `Mock`.

### Functions

```ts
function hello() {
  return "hello";
}

const mockedFunc = Mock(hello);
```

### Classes

```ts
class Hello {
  sayHello() {
    return "hello";
  }
}

const mockedClass = Mock(Hello);
```

### Abstract classes

```ts
abstract class Hello {
  abstract sayHello(): string;
}

const mockedAbstractClass = Mock(Hello);
```

### Types and interfaces

```ts
interface HelloInterface {
  sayHello(): string;
}

type HelloType = {
  sayHello(): string;
};

const mockedInterface = Mock<HelloInterface>();
const mockedType = Mock<HelloType>();
```

### Object modules

```ts
// Useful for mocking npm modules !
const userRepository = {
  getUser: (id: string) => {
    return { id, name: "Victor" };
  },
};

const mockedObject = Mock(userRepository);
```

## Interacting with the mocks

Functions mocks are the base of the library.
Every other type of mock (class, abstract class, object, interface, type) is built on top of function mocks.

For example, mocking a class is equivalent to mocking all of its public functions.
![Capture d'écran 2024-06-09 153630](https://github.com/vdstack/mockit/assets/6061078/3110cf6e-678c-4896-bd4d-8bcd4e288138)

Understanding how to handle function mocks in Mockit will unlock any other type of mock.

# when

You can control the mocked functions behaviour using the `when` API. It provides a semantic way to define the mock's behaviour. You get a wide range of behaviour available to you, from returning a value, to throwing an error, to calling the original function, etc...

## Behaviours control

There are two ways to control the mock's behaviour:

- `when(mockedFunc).isCalled` will setup the default behaviour of the mock. If no behaviour is configured, the mock will return `undefined` by default.
- `when(mockedFunc).isCalledWith(...args)` will setup the mock to return a value when called with specific arguments.

You can also use matchers to simplify your behaviour setups and make them more resilient to change in the code under test.

```ts
const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenReturn(2);
when(mockedFunc).isCalledWith("Victor").thenReturn(42);
when(mockedFunc).isCalledWith("Nick").thenReturn(15);

when(mockedFunc)
  .isCalledWith({ name: m.schema(z.string()) })
  .thenReturn(66);

mockedFunc(); // 2
mockedFunc("Victor"); // 42
mockedFunc("Nick"); // 15
mockedFunc({ name: "Helen" }); // 66
mockedFunc({ name: "Charles" }); // 66
```

## Behaviours

This section lists all the behaviours you can setup with the `when` API's `isCalled`, `isCalledWith` functions.

### thenReturn

`when(mockedFunc).isCalled.thenReturn(safeValue)` will make the mock return the value passed as an argument when it is called.

You can also pass an unsafe value by wrapping it in the `m.unsafe(...)` function: `when(mockedFunc).isCalled.thenReturn(m.unsafe(unsafeValue))`

```ts
const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenReturn(2);
mockedFunc(); // 2
```

### thenThrow

`when(mockedFunc).isCalled.thenThrow(error: Error)` will make the mock throw the error passed as an argument when it is called.

```ts
const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenThrow(new Error("yoo"));
mockedFunc(); // throws Error("yoo")
```

### thenResolve

`when(mockedFunc).isCalled.thenResolve(safeValue)` will make the mock return a resolved promise with the value passed as an argument when it is called. This method is type-safe: it will hint you if the value you pass is not a valid return type for the function that is being mocked.

You can also pass an unsafe value by wrapping it in the `m.unsafe(...)` function: `when(mockedFunc).isCalled.thenResolve(m.unsafe(unsafeValue))`

```ts
const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenResolve(2);
mockedFunc(); // Promise.resolves(2)
```

### thenReject

`when(mockedFunc).isCalled.thenReject(error: Error)` will make the mock return a rejected promise with the error passed as an argument when it is called.

```ts
const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenReject(new Error("yoo"));
mockedFunc(); // Promise.rejects(Error("yoo"))
```

### thenPreserve

`when(mockedFunc).isCalled.thenPreserve()` will keep the original function's behaviour when it is called, but will register the call history so that you can verify it later.

```ts
function double(x: number) {
  return x * 2;
}
const mockedFunc = Mock(double);
when(mockedFunc).isCalled.thenPreserve();
mockedFunc(4); // 8 : the original function behaviour is preserved
```

This is only possible when you mocked a real module (like a function, a class, an object, etc...). If you mock a type or an interface, you can't use this behaviour since there is no original function to call.

### thenBehaveLike

`when(mockedFunc).isCalled.thenBehaveLike(original: Function)` provides a way to fully control the behaviour of the mock. This is especially useful for complex scenarios, like returning once, then throwing, then returning again. Sky is the limit here.

```ts
let callsCount = 0;
const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenBehaveLike(() => {
  if (callsCount === 1) {
    callsCount++;
    throw new Error("yoo");
  } else {
    callsCount++;
    return 2;
  }
});

mockedFunc(); // 2
mockedFunc(); // throws Error("yoo")
```

## Setup with matchers

Matchers are a powerful tool. They allow you to make your tests more resilient to changes in the implementation, and more focused on the logic you want to test.
For setup, then can be used in place of any value passed to the isCalledWith function. If you know `jest.objectContaining`, you will feel right at home with Mockit's matchers. In fact we provide a lot more matchers than Jest does.

## unsafe

If you don't care about the type of the returned value (which is not recommended but can have perfectly valid reasons like avoiding setup complexity or testing theorically invalid cases), you can wrap the returned value in the `m.unsafe(...)` function.

```ts
function takeNumber(x: Number) {
  return x;
}
const mockedFunc = Mock(takeNumber);

when(mockedFunc)
  .isCalledWith("Victor") // compiler will complain: "Victor" is not a number
  .thenReturn(42);

when(mockedFunc)
  .isCalledWith(m.unsafe("Victor")) // compiler will not complain: you can pass anything
  .thenReturn(42);
```

## zod integration

Mockit provides a powerful way to check if your mocked functions have been called with arguments matching a validation schema. This is especially useful when you want to check the nature of the arguments passed to your mocks, but don't know the exact value of them (this can happen when your code is generating them midway).
You can use zod schemas directly in the m.schema() matcher.
You can also use any schema that that has a safeParse(): boolean function ! This means you can adapt any validation library to work with Mockit !

```ts
when(mockedFunc)
  .isCalledWith(
    m.schema(
      z.object({
        name: z.string(),
        age: z.number().positive().int(),
        id: z.string().uuid(),
        date: z.date(),
      })
    )
  )
  .thenReturn(42);
```
