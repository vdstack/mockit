[![npm version](https://badge.fury.io/js/@vdstack%2Fmockit.svg)](https://badge.fury.io/js/@vdstack%2Fmockit)

Mockit solves the problem of [mocking the behaviour](https://martinfowler.com/articles/mocksArentStubs.html) of injected dependencies in Typescript. With its help, patterns like Strategy, or Ports & Adapters, become super easy to unit test. Its API was inspired by Java's Mockito package, but has now diverged. Mockito's knowledge is easily transferable though.

Mockit API can mock any dependency:

- functions: `Mock(originalFunction)`
- classes: `Mock(originalClass)`
- Abstract classes: `Mock(abstractClass)`
- Object modules: `Mock(originalObject)`
- Types and interfaces: `Mock<Type>()` or `Mock<Interface>()`

It provides a semantic API that is easy to use, as well as complete type-safety, which helps a LOT when writing tests, as it provides auto-completion and type-checking alerting you of any invalid test setup.

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

These verifications are assertive, meaning they will throw a detailed error if the mock was not called the way you expected it to be. No assertion library necessary !
They are agnostic of the test runner and assertion library you use.

You can access more under-the-hood features like reading the history of calls.

```ts
const mockedFunc = Mock(original);
mockedFunc("hello", "world");

getMockHistory(mockedFunc).getCalls(); // [{ args: ["hello", "world"], date: a Date }]
```

Finally, you can leverage the power of the [Zod](https://github.com/colinhacks/zod) library's schemas to make make assertions on the nature of the parameters passed to your mocks.

```ts
const mockedFunc = Mock(original);
mockedFunc({ name: "Victor", age: 42 }, "yoo");

verifyThat(mockedFunc).zod.wasCalledOnceWith(
  z.object({
    name: z.string(),
    age: z.number().positive().int(),
  }),
  "yoo"
);
```

Feel free to contribute :)

- [Mock](#Mock)
- [when](#when)
  - [Behaviours control](#Behaviours-control)
  - [Behaviours](#Behaviours)
    - [thenReturn](#thenReturn)
    - [thenThrow](#thenThrow)
    - [thenResolve](#thenResolve)
    - [thenReject](#thenReject)
    - [thenCall](#thenCall)
    - [thenPreserve](#thenPreserve)
    - [thenBehaveLike](#thenBehaveLike)
  - [unsafe alternatives](#unsafe-alternatives)
  - [zod integration](#zod-integration)
- [verifyThat](#verifyThat)
  - [Verifications](#Verifications)
    - [wasCalled](#wasCalled)
    - [wasCalledWith](#wasCalledWith)
    - [wasCalledOnce](#wasCalledOnce)
    - [wasCalledOnceWith](#wasCalledOnceWith)
    - [wasCalledNTimes](#wasCalledNTimes)
    - [wasCalledNTimesWith](#wasCalledNTimesWith)
    - [wasNeverCalled](#wasNeverCalled)
    - [wasNeverCalledWith](#wasNeverCalledWith)
  - [unsafe alternatives](#unsafe-alternatives-1)
  - [zod integration](#zod-integration-1)

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
Every other type of mock (class, abstract class, interface, type) is built on top of function mocks.

For example, mocking a class is equivalent to mocking all of its public functions.
![Capture d'écran 2024-06-09 153630](https://github.com/vdstack/mockit/assets/6061078/3110cf6e-678c-4896-bd4d-8bcd4e288138)

Understanding how to handle function mocks in Mockit will unlock any other type of mock.

# when

You can control the mocked functions behaviour using the `when` API. It provides a semantic way to define the mock's behaviour. You get a wide range of behaviour available to you, from returning a value, to throwing an error, to calling the original function, etc...

## Behaviours control

There are three main ways to control the mock's behaviour:

- `when(mockedFunc).isCalled` will setup the default behaviour of the mock. If no behaviour is configured, the mock will return `undefined` by default.
- `when(mockedFunc).isCalledWith(...args: arg[])` will setup the mock to return a value when called with specific arguments.
- `when(mockedFunc).unsafe.isCalledWith(...args: any[])` will setup the mock to return a value when called with specific arguments, but without type-checking the arguments. This is useful for quick mocking but will not assist you in writing correct tests.
- `when(mockedFunc).zod.isCalledWith(...(ZodSchema | arg)[])` will setup the mock to return a value when called with arguments that matches the privded zod schemas.

You can also use a zod schema when you don't know the exact value of parameters (this can happen when your code is generating them midway) but want to control the mock when the arguments match a certain shape (like a date, a uuid or an object shape).

```ts
const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenReturn(2);
when(mockedFunc).isCalledWith("Victor").thenReturn(42);
when(mockedFunc).isCalledWith("Nick").thenReturn(15);

when(mockedFunc)
  .isCalledWith(z.object({ name: z.string() }))
  .thenReturn(66);

mockedFunc(); // 2
mockedFunc("Victor"); // 42
mockedFunc("Nick"); // 15
mockedFunc({ name: "Helen" }); // 66
mockedFunc({ name: "Charles" }); // 66
```

## Behaviours

This section lists all the behaviours you can setup with the `when` API's `isCalled`, `isCalledWith`, `unsafe.isCalledWith` and `zod.isCalledWith` methods.

### thenReturn

`when(mockedFunc).isCalled.thenReturn(value: any)` will make the mock return the value passed as an argument when it is called.

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

`when(mockedFunc).isCalled.thenResolve(value: any)` will make the mock return a resolved promise with the value passed as an argument when it is called.

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

### thenCall

`when(mockedFunc).isCalled.thenCall((...args: any[]) => void)` will make the mock call the function passed as an argument when it is called.

```ts
const mockedFunc = Mock(original);
when(mockedFunc).isCalled.thenCall((...args) => {
  console.log(args);
});
mockedFunc("hiii"); // logs ["hiii"]
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

## unsafe alternatives

If you don't care about the type of the returned value (which is not recommended but can have perfectly valid reasons like avoiding setup complexity or testing theorically invalid cases), you can use the `unsafe` alternatives: `unsafe.thenResolve` and `unsafe.thenReturn`.

```ts
function takeNumber(x: Number) {
  return x;
}
const mockedFunc = Mock(takeNumber);

when(mockedFunc)
  .isCalledWith("Victor") // compiler will complain
  .thenReturn(42);

when(mockedFunc)
  .unsafe.isCalledWith("Victor") // compiler will not complain: you can pass anything
  .thenReturn(42);
```

## zod integration

Mockit provides a powerful way to check if your mocked functions have been called with arguments matching a validation schema. This is especially useful when you want to check the nature of the arguments passed to your mocks, but don't know the exact value of them (this can happen when your code is generating them midway).

```ts
when(mockedFunc)
  .isCalledWith(
    z.object({
      name: z.string(),
      age: z.number().positive().int(),
      id: z.string().uuid(),
      date: z.date(),
    })
  )
  .thenReturn(42);

mockedFunc({
  name: "Victor",
  age: 42,
  id: randomUUID(),
  date: new Date(),
}); // 42
```

You can still pass exact values instead of zod schemas, which are also type checked.

Limitations: you cannot pass partial schemas, only complete schemas.
But, you can still pass exact values to the zod schema with the following trick:

```ts
z.object({
    name: z.string().refine((name) => name === "Victor"),
    age: z.number().positive().int().refine((age) => age === 42)
    id: z.string().uuid(),
    date: z.date(),
})

// this execute the mock's behaviour if the arguments match the exact value of the name and age, and the shape of the id and date.
```

# verifyThat

You can verify how the mock was called using the `verifyThat` API. It provides a semantic way to verify a function mock behaviour.
It couples your test code with the module under test implementation though, so use it carefully, when it makes sense to verify a behaviour that cannot be tested by reading the module's returned value (for example, when testing side-effects).
It can also be useful to test that a dependency was NOT called in a specific branch of your code.

## Verifications

You get a wide range of verifications available to you, from checking the number of times the mock was called, to checking the arguments passed to it.

![image (3)](https://github.com/vdstack/mockit/assets/6061078/29486252-be82-4124-8c0c-efc910a45f26)

### wasCalled

`verifyThat(mockedFunc).wasCalled()` will assert that the mock was called at least once.

### wasCalledWith

`verifyThat(mockedFunc).wasCalledWith(...args: any[])` will assert that the mock was called at least once with the specified arguments. These arguments are type-checked.

### wasCalledOnce

`verifyThat(mockedFunc).wasCalled()` will assert that the mock was called exactly once.

### wasCalledOnceWith

`verifyThat(mockedFunc).wasCalledOnceWith(...args: any[])` will assert that the mock was called exactly once with the specified arguments. These arguments are type-checked.

### wasCalledNTimes

`verifyThat(mockedFunc).wasCalledNTimes(n: number)` will assert that the mock was called exactly `n` times.

### wasCalledNTimesWith

`verifyThat(mockedFunc).wasCalledNTimesWith(n: number, ...args: any[])` will assert that the mock was called exactly `n` times with the specified arguments. These arguments are type-checked.

### wasNeverCalled

`verifyThat(mockedFunc).wasNeverCalled()` will assert that the mock was never called.

### wasNeverCalledWith

`verifyThat(mockedFunc).wasNeverCalledWith(...args: any[])` will assert that the mock was never called with the specified arguments. These arguments are type-checked.

## unsafe alternatives

If you don't care about the type of the arguments passed to the mock (which is not recommended but can have perfectly valid reasons like avoiding setup complexity or testing theorically invalid cases), you can use the `unsafe` alternatives: `unsafe.wasCalledWith`, `unsafe.wasCalledOnceWith`, `unsafe.wasCalledNTimesWith`, `unsafe.wasNeverCalledWith`.

```ts
const mockedFunc = Mock(original);
mockedFunc("hello", "world");

verifyThat(mockedFunc).wasNeverCalledWith("something else"); // compiler will complain
verifyThat(mockedFunc).unsafe.wasNeverCalledWith("something else"); // compiler will not complain
```

## zod integration

Mockit provides a powerful way to check if your mocked functions have been called with arguments matching a validation schema. This is especially useful when you want to check the nature of the arguments passed to your mocks, but don't know the exact value of them (this can happen when your code is generating them midway).

```ts
verifyThat(mockedFunc).zod.wasCalledOnceWith(
  z.object({
    name: z.string(),
    age: z.number().positive().int(),
    id: z.string().uuid(),
    date: z.date(),
  }),
  "yoo"
);
```

You can still pass exact values instead of zod schemas, which are also type checked.

Limitations: you cannot pass partial schemas, only complete schemas.
But, you can still pass exact values to the zod schema with the following trick:

```ts
z.object({
    name: z.string().refine((name) => name === "Victor"),
    age: z.number().positive().int().refine((age) => age === 42)
    id: z.string().uuid(),
    date: z.date(),
})

// this will check for the exact value of the name and age, and the shape of the id and date.
```

# Examples

All he other structures (classes, abstract classes, interfaces, types) are built on top of function mocks. This means that the same API is available for all their functions.

# Class

```ts
class Hello {
  sayHello() {
    return "hello";
  }
}

const mockedClass = Mock(Hello);

// You're still manipulating functions
when(mockedClass.sayHello).isCalled.thenReturn("hello");
when(mockedClass.sayHello).isCalledWith("Victor").thenReturn("hello victor");

mockedClass.sayHello(); // "hello"
mockedClass.sayHello("Victor"); // "hello victor"
```

# mockAbstractClass

```ts
abstract class Hello {
  abstract sayHello(): string;
  abstract sayHi(): string;
}

const mockedClass = mockAbstractClass(Hello);

when(mockedClass.sayHello).isCalled.thenReturn("hello");
when(mockedClass.sayHi).isCalled.thenReturn("hi");
```

# mockType & mockInterface

You can mock types and interfaces using the `mockType` API.
The main difference with `mockAbstractClass` is that you need to pass the type as a generic parameter (since types disappear at runtime).

```ts
interface Hello {
  sayHello(): string;
  sayHi(): string;
}

const mockedType = mockType<Hello>();

when(mockedType.sayHello).isCalled.thenReturn("hello");
when(mockedType.sayHi).isCalled.thenReturn("hi");
```

### TODO

- [x] Accept any mock in the Reset API (easy to implement now that mocks are proxies)
- [ ] Document the Reset API
